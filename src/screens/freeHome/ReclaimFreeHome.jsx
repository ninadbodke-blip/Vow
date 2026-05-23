import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import DailyCheckin, { moodByScore, moodByValue } from './DailyCheckin'
import JournalTile from './JournalTile'
import BottomNav from '../../components/BottomNav'
import { resolveAddictionTypeId } from '../vowPath/utils/addictionTypes'

// ===================================================================
// RECLAIM-FREE HOME
// ===================================================================
// Stage: Reclaim (relapse). User slipped — possibly significantly. They
// opened the app carrying shame. This is the most sensitive screen in
// the entire app.
//
// Hard rules:
// - No counter at zero. Never.
// - No old data displayed in a way that shames.
// - No pressure to commit to a new stop date.
// - No "start over" framing. The infrastructure is intact.
// - Tone: gentle, factual, deeply non-judgmental. Stoic, not saccharine.
//
// Engine: the WhatStillStandsTile counters shame in the first 10 seconds.
// Optional: reflection input (stored in reclaim_reflections JSONB).
// Re-entry: two soft CTAs — Move to Commit, or Restart Endure now.
// ===================================================================

const ProfileIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

// ===================================================================
// MAIN COMPONENT
// ===================================================================
export default function ReclaimFreeHome({ progress: initialProgress }) {
  const navigate = useNavigate()

  const [progress, setProgress] = useState(initialProgress)
  const [firstName, setFirstName] = useState('')
  const [bio, setBio] = useState('')
  const [tracker, setTracker] = useState(null)
  const [anchorCount, setAnchorCount] = useState(0)
  const [todayCheckin, setTodayCheckin] = useState(null)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, full_name, bio')
        .eq('id', user.id)
        .maybeSingle()
      if (profileData?.first_name) setFirstName(profileData.first_name)
      else if (profileData?.full_name) setFirstName(profileData.full_name.split(' ')[0])
      else if (user.email) setFirstName(user.email.split('@')[0])
      if (profileData?.bio) setBio(profileData.bio)

      // Active tracker
      const { data: trackers } = await supabase
        .from('trackers')
        .select('*, addiction_types(id, name, icon)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at')
      if (trackers && trackers.length > 0) {
        setTracker(trackers[0])
      }

      // Anchors count
      const { count } = await supabase
        .from('anchors')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if (count !== null) setAnchorCount(count)

      // ---- daily check-in (shared signal; gentle here) ----
      const { data: tc } = await supabase
        .from('free_daily_checkins').select('*')
        .eq('user_id', user.id).eq('checkin_date', localDateStr()).maybeSingle()
      if (tc) setTodayCheckin(tc)

      setLoading(false)
    }
    load()
  }, [])

  // === Fracture Diagnostic — the core data point ===
  // Mechanical framing (infrastructure failed, not the person). One categorical
  // value the Mirror charts and the future AI reflection reads as the clearest
  // signal: what kind of pressure breaks this person's perimeter.
  const handleLogFracture = async (fractureType) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { error } = await supabase.from('free_stage_signals').insert({
      user_id: user.id,
      stage: 'reclaim',
      signal_type: 'reclaim_return',
      payload: { fracture_type: fractureType },
    })
    if (error) {
      console.error('Failed to log fracture:', error)
      return false
    }
    return true
  }

  // === Kinder-voice reframe — silent, light signal ===
  // Records which cognitive distortion the user reached for, so the AI can later
  // notice the shame story they tell themselves after a slip. No friction, no
  // save button — they just tap to be answered kindly.
  const handleReframe = async (distortion) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('free_stage_signals').insert({
      user_id: user.id,
      stage: 'reclaim',
      signal_type: 'reclaim_reframe',
      payload: { distortion },
    })
  }

  const handleCheckinSaved = (row) => setTodayCheckin(row)

  // === Re-entry handlers ===
  const handleMoveToCommit = async () => {
    if (transitioning) return
    setTransitioning(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Commit owns no live counter — pause the tracker so the user re-sets a
      // fresh stop date in Commit. Its longest streak is preserved on the row.
      if (tracker?.id) {
        await supabase.from('trackers')
          .update({ is_active: false })
          .eq('id', tracker.id)
      }

      const { error } = await supabase
        .from('vow_path_progress')
        .update({
          free_state: 'commit',
          endure_starts_at: null,  // clear old stop date — they pick fresh
          endure_slip_count: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Failed to move to commit:', error)
        alert('Could not transition. Please try again.')
        setTransitioning(false)
        return
      }

      navigate('/home', { replace: true })
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setTransitioning(false)
    }
  }

  const handleRestartEndure = async () => {
    if (transitioning) return
    setTransitioning(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const addictionTypeId = await resolveAddictionTypeId(progress.primary_substance)

      // Only touch trackers when the substance maps to an addiction_types row.
      // Custom / unmapped substances transition without a tracker.
      if (addictionTypeId != null) {
        const now = new Date().toISOString()

        // Find or create active tracker
        const { data: existingTrackers } = await supabase
          .from('trackers')
          .select('id')
          .eq('user_id', user.id)
          .eq('addiction_type_id', addictionTypeId)
          .eq('is_active', true)

        if (existingTrackers && existingTrackers.length > 0) {
          // Reset start_date to now (longest_streak_seconds is preserved separately)
          const { error: trackerError } = await supabase
            .from('trackers')
            .update({ start_date: now })
            .eq('id', existingTrackers[0].id)

          if (trackerError) {
            console.error('Failed to reset tracker:', trackerError)
            alert('Could not restart. Please try again.')
            setTransitioning(false)
            return
          }
        } else {
          // No active tracker — create one
          const { error: createError } = await supabase
            .from('trackers')
            .insert({
              user_id: user.id,
              addiction_type_id: addictionTypeId,
              start_date: now,
              is_active: true,
              tracker_status: 'active',
            })

          if (createError) {
            console.error('Failed to create tracker:', createError)
            alert('Could not restart. Please try again.')
            setTransitioning(false)
            return
          }
        }
      }

      // Flip free_state to endure
      const { error: progressError } = await supabase
        .from('vow_path_progress')
        .update({
          free_state: 'endure',
          endure_slip_count: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (progressError) {
        console.error('Failed to update free_state:', progressError)
        alert('Could not transition. Please try again.')
        setTransitioning(false)
        return
      }

      navigate('/home', { replace: true })
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setTransitioning(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={styles.loadingPhone}>Loading...</div>
      </div>
    )
  }

  // === Derived: anti-shame data ===
  const longestStreakDays = tracker?.longest_streak_seconds
    ? Math.floor(tracker.longest_streak_seconds / 86400)
    : 0
  const checklistDone = progress.commit_checklist
    ? Object.values(progress.commit_checklist).filter(Boolean).length
    : 0

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* TOP BAR */}
        <div style={styles.topBar}>
          <p style={styles.brandLine}>Vow</p>
          <button
            onClick={() => navigate('/profile')}
            style={styles.profileBtn}
            aria-label="Profile"
          >
            <ProfileIcon />
          </button>
        </div>

        {/* TILE 1 — GREETING */}
        <GreetingTile firstName={firstName} />

        {/* TILE 2 — WHAT STILL STANDS (anti-shame) */}
        <WhatStillStandsTile
          bio={bio}
          anchorCount={anchorCount}
          longestStreakDays={longestStreakDays}
          checklistDone={checklistDone}
        />

        {/* TILE 3 — FRACTURE DIAGNOSTIC (core data point) */}
        <FractureDiagnosticTile onLog={handleLogFracture} />

        {/* TILE 4 — THE KINDER VOICE (anti-AVE reframe) */}
        <KinderVoiceTile onReframe={handleReframe} />

        {/* TILE — GENTLE CHECK-IN (shared signal) */}
        <TodayCheckinTile checkin={todayCheckin} onOpen={() => setCheckinOpen(true)} />

        {/* JOURNAL (shared) */}
        <JournalTile stage="reclaim" />

        {/* TILE 5 — ANCHORS */}
        <AnchorsTile navigate={navigate} anchorCount={anchorCount} />

        {/* TILE 6 — WHEN YOU'RE READY (re-entry CTAs) */}
        <WhenYoureReadyTile
          onMoveToCommit={handleMoveToCommit}
          onRestartEndure={handleRestartEndure}
          transitioning={transitioning}
          hasSubstance={!!progress.primary_substance}
        />

        <BottomNav />
      </div>

      <DailyCheckin
        isOpen={checkinOpen}
        onClose={() => setCheckinOpen(false)}
        stage="reclaim"
        existing={todayCheckin}
        onSaved={handleCheckinSaved}
      />
    </div>
  )
}

// ===================================================================
// TILE: GENTLE CHECK-IN (shared signal; present-focused, no failure framing)
// ===================================================================
function TodayCheckinTile({ checkin, onOpen }) {
  if (checkin) {
    const m = moodByScore(checkin.mood_score) || moodByValue(checkin.mood)
    return (
      <div style={{ ...styles.tile, ...styles.tileLogged }}>
        <p style={styles.tileEyebrow}>Checked in</p>
        <div style={styles.checkinSummaryRow}>
          <span style={{ ...styles.moodPill, background: m?.color || '#B9A07E' }} />
          <div>
            <p style={styles.checkinSummaryMood}>
              {m?.label || 'Noted'}{checkin.felt_pull ? ' \u00b7 the pull is around' : ''}
            </p>
            <p style={styles.checkinSummarySub}>
              Energy {checkin.energy ?? '\u2013'}/5
              {checkin.note ? ` \u00b7 \u201c${checkin.note}\u201d` : ''}
            </p>
          </div>
        </div>
        <button onClick={onOpen} style={styles.checkinEditBtn}>Edit</button>
      </div>
    )
  }
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Right now</p>
      <h2 style={styles.tileTitle}>How are you, this moment?</h2>
      <p style={styles.tileBody}>
        Not the slip. Just now. A half-minute, only if it helps you land.
      </p>
      <button onClick={onOpen} style={styles.checkinCtaBtn}>Check in</button>
    </div>
  )
}

function localDateStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// ===================================================================
// TILE: GREETING
// ===================================================================
function GreetingTile({ firstName }) {
  return (
    <div style={styles.greetingTile}>
      <p style={styles.greetingEyebrow}>RECLAIM</p>
      <h1 style={styles.greetingTitle}>
        You came back today{firstName ? `, ${firstName}` : ''}.
      </h1>
      <p style={styles.greetingSubtitle}>
        What you built before is still here. Take your time.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: WHAT STILL STANDS (anti-shame, validates preserved work)
// ===================================================================
function WhatStillStandsTile({ bio, anchorCount, longestStreakDays, checklistDone }) {
  const items = []

  if (bio && bio.trim().length > 0) {
    items.push({
      label: 'Your reason for starting',
      value: 'preserved',
    })
  }
  if (anchorCount > 0) {
    items.push({
      label: `${anchorCount} ${anchorCount === 1 ? 'anchor' : 'anchors'} saved`,
      value: 'still there',
    })
  }
  if (longestStreakDays > 0) {
    items.push({
      label: 'Your longest stretch',
      value: `${longestStreakDays} ${longestStreakDays === 1 ? 'day' : 'days'}`,
    })
  }
  if (checklistDone > 0) {
    items.push({
      label: 'Infrastructure you built',
      value: `${checklistDone} ${checklistDone === 1 ? 'item' : 'items'}`,
    })
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>What still stands</p>
      <h2 style={styles.tileTitle}>The work isn't erased.</h2>
      <p style={styles.tileBody}>
        Whatever happened, none of this went away. It's still here, waiting.
      </p>

      {items.length > 0 ? (
        <div style={styles.standsList}>
          {items.map((item, i) => (
            <div key={i} style={styles.standsRow}>
              <span style={styles.standsLabel}>{item.label}</span>
              <span style={styles.standsValue}>{item.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p style={styles.standsEmpty}>
          You're here. That's the first thing.
        </p>
      )}
    </div>
  )
}

// ===================================================================
// TILE: REFLECTION (optional — for processing)
// ===================================================================
// ===================================================================
// TILE: FRACTURE DIAGNOSTIC (core data point)
// ===================================================================
// Reframes the slip as a perimeter that gave way under a specific pressure —
// mechanical, not moral. One categorical tap. This is the richest single
// signal for both the Mirror ("you break on exhaustion, not sadness") and the
// future AI reflection.
const FRACTURES = [
  { key: 'exhaustion', label: 'Exhaustion', sub: 'Running on empty. Too tired to hold the line.' },
  { key: 'social',     label: 'Social pressure', sub: 'The people, the place, the moment around you.' },
  { key: 'emotional',  label: 'Emotional spike', sub: 'A hard feeling surged — anger, grief, dread.' },
  { key: 'vacuum',     label: 'The vacuum', sub: 'Boredom, an empty evening, nothing to lean on.' },
]

function FractureDiagnosticTile({ onLog }) {
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const handleLog = async () => {
    if (!selected || saving) return
    setSaving(true)
    const ok = await onLog(selected)
    setSaving(false)
    if (ok) setDone(true)
    else alert('Could not save. Please try again.')
  }

  if (done) {
    const f = FRACTURES.find(x => x.key === selected)
    return (
      <div style={{ ...styles.tile, ...styles.tileLogged }}>
        <p style={styles.tileEyebrow}>Noted · not a verdict</p>
        <div style={styles.savedRow}>
          <span style={styles.savedCheck}>✓</span>
          <p style={styles.savedText}>
            {f?.label}. That's a pattern to watch, not a flaw in you. The more honestly you mark these, the clearer the warning signs get next time.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>The diagnostic</p>
      <h2 style={styles.tileTitle}>What gave way?</h2>
      <p style={styles.tileBody}>
        Not "what's wrong with you" — what was the pressure that broke through. One tap. It's how the warning signs get easier to spot.
      </p>

      <div style={styles.fractureGrid}>
        {FRACTURES.map(f => (
          <button
            key={f.key}
            onClick={() => setSelected(f.key)}
            disabled={saving}
            style={{ ...styles.fractureCell, ...(selected === f.key ? styles.fractureCellOn : {}) }}
          >
            <span style={{ ...styles.fractureLabel, ...(selected === f.key ? styles.fractureLabelOn : {}) }}>{f.label}</span>
            <span style={{ ...styles.fractureSub, ...(selected === f.key ? styles.fractureSubOn : {}) }}>{f.sub}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleLog}
        disabled={!selected || saving}
        style={{ ...styles.fractureLogBtn, ...(!selected || saving ? styles.fractureLogBtnDim : {}) }}
      >
        {saving ? 'Saving…' : 'Log it'}
      </button>
    </div>
  )
}

// ===================================================================
// TILE: THE KINDER VOICE (anti-AVE reframe — frictionless, self-soothing)
// ===================================================================
// The Abstinence Violation Effect lives in the harsh self-talk. Tapping a
// thought reveals a truer, kinder line. Logs which distortion they reached for
// (silently) so the AI can later name the shame story — but asks nothing of them.
const KINDER_PAIRS = [
  { key: 'catastrophe', harsh: "I've ruined everything.", kind: "One hard day doesn't erase the ones behind it. They still happened." },
  { key: 'willpower',   harsh: "I have no willpower.", kind: "Willpower didn't fail — you hit a hard moment. That's information, not a verdict." },
  { key: 'zero',        harsh: "I'm back to square one.", kind: "You're not at zero. You're someone who has done this before, here again." },
  { key: 'pointless',   harsh: "Why do I even bother?", kind: "Because part of you still wants this. That part just opened the app." },
]

function KinderVoiceTile({ onReframe }) {
  const [revealed, setRevealed] = useState({})

  const reveal = (pair) => {
    setRevealed(prev => {
      if (prev[pair.key]) return prev
      if (onReframe) onReframe(pair.key)
      return { ...prev, [pair.key]: true }
    })
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>The voice in your head</p>
      <h2 style={styles.tileTitle}>It's being cruel. Answer it.</h2>
      <p style={styles.tileBody}>
        Tap whichever one sounds like you right now. There's a truer line underneath.
      </p>

      <div style={styles.kinderList}>
        {KINDER_PAIRS.map(p => (
          <button
            key={p.key}
            onClick={() => reveal(p)}
            style={{ ...styles.kinderCard, ...(revealed[p.key] ? styles.kinderCardOpen : {}) }}
          >
            <span style={styles.kinderHarsh}>"{p.harsh}"</span>
            {revealed[p.key] && <span style={styles.kinderKind}>{p.kind}</span>}
          </button>
        ))}
      </div>

      <p style={styles.tileHelperText}>Let the kinder one land. Nothing to do here but read.</p>
    </div>
  )
}

// ===================================================================
// TILE: ANCHORS
// ===================================================================
function AnchorsTile({ navigate, anchorCount }) {
  const has = anchorCount > 0
  return (
    <div style={styles.anchorsTile}>
      <div style={styles.anchorsTop}>
        <div style={styles.anchorsGlyph}>
          <span style={{ ...styles.anchorsDot, background: '#C5572C' }} />
          <span style={{ ...styles.anchorsDot, background: '#C8893C', marginLeft: '-9px' }} />
          <span style={{ ...styles.anchorsDot, background: '#6B7FA0', marginLeft: '-9px' }} />
          <span style={{ ...styles.anchorsDot, background: '#6E8A6A', marginLeft: '-9px' }} />
        </div>
        <p style={styles.tileEyebrow}>Anchors</p>
      </div>
      <h3 style={styles.anchorsTitle}>Reach out to someone.</h3>
      <p style={styles.anchorsBody}>
        {has
          ? `You have ${anchorCount} ${anchorCount === 1 ? 'person' : 'people'} saved. Calling one of them might help right now.`
          : "If there's someone you trust — a friend, family, a sponsor — telling them out loud is part of how it gets processed."}
      </p>
      <button onClick={() => navigate('/anchors')} style={styles.anchorsBtnNew}>
        {has ? 'Open Anchors' : 'Set up Anchors'}
      </button>
    </div>
  )
}

// ===================================================================
// TILE: WHEN YOU'RE READY (re-entry CTAs)
// ===================================================================
function WhenYoureReadyTile({ onMoveToCommit, onRestartEndure, transitioning, hasSubstance }) {
  return (
    <div style={styles.readyTile}>
      <div style={styles.readyOrnament}>· · ·</div>
      <p style={styles.readyEyebrow}>When you're ready</p>
      <h3 style={styles.readyTitle}>Choose your re-entry.</h3>
      <p style={styles.readyBody}>
        You don't have to promise forever. Just the next 24 hours. Two paths back — both start the clock fresh from today.
      </p>

      <button
        onClick={onMoveToCommit}
        disabled={transitioning}
        style={{
          ...styles.readyBtnPrimary,
          ...(transitioning ? styles.readyBtnDisabled : {}),
        }}
      >
        {transitioning ? 'Moving...' : 'Move to Commit'}
      </button>
      <p style={styles.readyBtnHelper}>
        Set a new stop date. Use the days before to prepare.
      </p>

      {hasSubstance && (
        <>
          <div style={styles.readyDivider} />
          <button
            onClick={onRestartEndure}
            disabled={transitioning}
            style={{
              ...styles.readyBtnSecondary,
              ...(transitioning ? styles.readyBtnDisabled : {}),
            }}
          >
            {transitioning ? 'Restarting...' : 'Restart Endure now'}
          </button>
          <p style={styles.readyBtnHelper}>
            Begin again from today. The counter starts fresh.
          </p>
        </>
      )}
    </div>
  )
}

// ===================================================================
// STYLES
// ===================================================================
const styles = {
  // --- refined Anchors tile ---
  anchorsTile: {
    background: 'linear-gradient(180deg, #FFFBF4 0%, #FBF1E2 100%)',
    border: '0.5px solid #EEDFC8',
    borderRadius: '18px',
    padding: '18px 18px 16px',
    boxShadow: '0 4px 16px rgba(120,80,30,0.07)',
  },
  anchorsTop: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' },
  anchorsGlyph: { display: 'flex', alignItems: 'center' },
  anchorsDot: {
    width: '20px', height: '20px', borderRadius: '50%',
    border: '1.5px solid #FBF1E2', boxShadow: '0 1px 2px rgba(80,50,20,0.15)',
  },
  anchorsTitle: {
    fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif',
    fontWeight: 500, lineHeight: 1.3, margin: '0 0 8px',
  },
  anchorsBody: {
    fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 14px',
  },
  anchorsBtnNew: {
    width: '100%', padding: '13px', background: 'rgba(255,255,255,0.7)',
    color: '#9A4E1A', border: '0.5px solid #E3C9A3', borderRadius: '12px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif',
    boxShadow: '0 2px 8px rgba(120,80,30,0.06)',
  },

  // --- Fracture Diagnostic ---
  fractureGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' },
  fractureCell: {
    display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left',
    padding: '13px 12px', background: 'white', border: '0.5px solid #E0D5C2',
    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)', minHeight: '78px',
  },
  fractureCellOn: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', border: '0.5px solid #241710', boxShadow: '0 4px 14px rgba(40,25,10,0.25)' },
  fractureLabel: { fontSize: '14px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif' },
  fractureLabelOn: { color: '#FAF7F1' },
  fractureSub: { fontSize: '11px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4 },
  fractureSubOn: { color: 'rgba(250,247,241,0.72)' },
  fractureLogBtn: {
    width: '100%', padding: '13px', background: '#854F0B', color: '#FBF6EE', border: 'none',
    borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif',
  },
  fractureLogBtnDim: { opacity: 0.45, cursor: 'not-allowed' },

  // --- The Kinder Voice ---
  kinderList: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '4px' },
  kinderCard: {
    display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', width: '100%',
    padding: '13px 14px', background: 'white', border: '0.5px solid #E0D5C2',
    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.18s',
  },
  kinderCardOpen: { background: '#FBF6EE', border: '0.5px solid #D9C7A8' },
  kinderHarsh: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4 },
  kinderKind: { fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.55, borderTop: '0.5px solid #E8DCC2', paddingTop: '8px' },

  // --- shared saved / helper ---
  savedRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  savedCheck: {
    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)', border: '0.5px solid #C2D49A',
    color: '#3B6D11', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  savedText: { fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.5 },
  tileHelperText: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '12px 0 0' },

  // --- v2 additions: gentle daily check-in ---
  tileLogged: { background: 'linear-gradient(180deg, #F6FAE9 0%, #ECF3D5 100%)', border: '0.5px solid #C2D49A' },
  checkinSummaryRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  moodPill: { width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)' },
  checkinSummaryMood: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 2px', lineHeight: 1.3 },
  checkinSummarySub: { fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.4 },
  checkinEditBtn: { background: 'transparent', border: 'none', color: '#3B6D11', fontSize: '12px', fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer', padding: 0 },
  checkinCtaBtn: {
    width: '100%', padding: '14px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },

  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  phone: {
    background: '#FAF7F1',
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '1.5rem 1.25rem 1.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  loadingPhone: {
    background: '#FAF7F1',
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '5rem 2rem',
    textAlign: 'center',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10)',
  },

  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '4px',
  },
  brandLine: {
    fontSize: '20px', fontWeight: 500, color: '#2A1F15',
    margin: 0, fontFamily: 'Georgia, serif', letterSpacing: '-0.01em',
  },
  profileBtn: {
    background: 'transparent', border: 'none', color: '#854F0B',
    cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  // GENERIC TILE
  tile: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '18px',
    padding: '20px 20px 18px',
    boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
  },
  tileEyebrow: {
    fontSize: '10.5px', color: '#A07A3C',
    textTransform: 'uppercase', letterSpacing: '0.12em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 10px',
  },
  tileTitle: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 12px',
  },
  tileBody: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.65, margin: '0 0 14px',
  },

  // GREETING (extra breathing room for this stage)
  greetingTile: {
    textAlign: 'left',
    padding: '14px 4px 8px',
  },
  greetingEyebrow: {
    fontSize: '10px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.32em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 14px',
  },
  greetingTitle: {
    fontSize: '28px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.25, margin: '0 0 12px',
    letterSpacing: '-0.01em',
  },
  greetingSubtitle: {
    fontSize: '15px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.6, margin: 0,
  },

  // WHAT STILL STANDS
  standsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  standsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '12px',
  },
  standsLabel: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
  },
  standsValue: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    letterSpacing: '0.02em',
  },
  standsEmpty: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '4px 0 0',
    lineHeight: 1.5,
  },

  // REFLECTION
  reflectLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
  },
  reflectTextarea: {
    width: '100%',
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
    resize: 'vertical',
    minHeight: '72px',
    boxSizing: 'border-box',
    outline: 'none',
    boxShadow: 'inset 0 1px 2px rgba(80,50,20,0.04)',
  },
  reflectSaveBtn: {
    width: '100%',
    marginTop: '16px',
    padding: '13px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.22)',
    transition: 'opacity 0.2s',
  },
  reflectSaveBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  reflectSavedNote: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '10px 0 0',
  },

  // ANCHORS
  anchorsBtn: {
    width: '100%',
    padding: '13px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(80,50,20,0.05)',
  },

  // WHEN YOU'RE READY (dark tile, gold accent)
  readyTile: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    borderRadius: '20px',
    padding: '24px 22px 22px',
    textAlign: 'center',
    boxShadow: '0 6px 20px rgba(40,25,10,0.25)',
  },
  readyOrnament: {
    fontSize: '12px',
    color: 'rgba(217,181,122,0.5)',
    letterSpacing: '0.5em',
    margin: '0 0 14px',
  },
  readyEyebrow: {
    fontSize: '10px',
    color: '#D9B57A',
    textTransform: 'uppercase',
    letterSpacing: '0.28em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 10px',
  },
  readyTitle: {
    fontSize: '20px',
    color: '#FAF7F1',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 10px',
  },
  readyBody: {
    fontSize: '13px',
    color: 'rgba(250,247,241,0.75)',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 18px',
  },
  readyBtnPrimary: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(180deg, #D9B57A 0%, #B89456 100%)',
    color: '#241710',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
  },
  readyBtnSecondary: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    color: '#D9B57A',
    border: '0.5px solid rgba(217,181,122,0.35)',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  readyBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  readyBtnHelper: {
    fontSize: '11px',
    color: 'rgba(250,247,241,0.55)',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '8px 0 0',
    lineHeight: 1.5,
  },
  readyDivider: {
    height: '0.5px',
    background: 'rgba(217,181,122,0.18)',
    margin: '20px 0 4px',
  },
}