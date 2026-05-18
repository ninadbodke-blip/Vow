import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import BottomNav from '../../components/BottomNav'

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

      setLoading(false)
    }
    load()
  }, [])

  // === Reflection save handler ===
  const handleSaveReflection = async (whatHappened, whatLearned) => {
    if (!whatHappened?.trim() && !whatLearned?.trim()) return false

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const currentReflections = progress.reclaim_reflections || []
    const newEntry = {
      id: `refl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      logged_at: new Date().toISOString(),
      what_happened: whatHappened?.trim() || null,
      what_learned: whatLearned?.trim() || null,
    }
    const newReflections = [newEntry, ...currentReflections].slice(0, 50)

    setProgress(p => ({ ...p, reclaim_reflections: newReflections }))

    const { error } = await supabase
      .from('vow_path_progress')
      .update({
        reclaim_reflections: newReflections,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to save reflection:', error)
      setProgress(p => ({ ...p, reclaim_reflections: currentReflections }))
      return false
    }
    return true
  }

  // === Re-entry handlers ===
  const handleMoveToCommit = async () => {
    if (transitioning) return
    setTransitioning(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('vow_path_progress')
        .update({
          free_state: 'commit',
          endure_starts_at: null,  // clear old stop date — they pick fresh
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
      const addictionTypeId = Number(progress.primary_substance)
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

      // Flip free_state to endure
      const { error: progressError } = await supabase
        .from('vow_path_progress')
        .update({
          free_state: 'endure',
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

        {/* TILE 3 — REFLECTION (optional) */}
        <ReflectionTile onSave={handleSaveReflection} />

        {/* TILE 4 — ANCHORS */}
        <AnchorsTile navigate={navigate} anchorCount={anchorCount} />

        {/* TILE 5 — WHEN YOU'RE READY (re-entry CTAs) */}
        <WhenYoureReadyTile
          onMoveToCommit={handleMoveToCommit}
          onRestartEndure={handleRestartEndure}
          transitioning={transitioning}
          hasSubstance={!!progress.primary_substance}
        />

        <BottomNav />
      </div>
    </div>
  )
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
function ReflectionTile({ onSave }) {
  const [whatHappened, setWhatHappened] = useState('')
  const [whatLearned, setWhatLearned] = useState('')
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const canSave = whatHappened.trim().length > 0 || whatLearned.trim().length > 0

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    const ok = await onSave(whatHappened, whatLearned)
    setSaving(false)
    if (ok) {
      setWhatHappened('')
      setWhatLearned('')
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 4000)
    } else {
      alert('Could not save. Please try again.')
    }
  }

  return (
    <div style={styles.tile}>
      <style>{`
        .vow-reflect-textarea::placeholder {
          color: #9C8C78;
          font-style: italic;
        }
        .vow-reflect-textarea:focus {
          border-color: #854F0B;
        }
      `}</style>

      <p style={styles.tileEyebrow}>If you want</p>
      <h2 style={styles.tileTitle}>Sit with what happened.</h2>
      <p style={styles.tileBody}>
        Writing it down can help. Both fields are optional. This is just for you.
      </p>

      <p style={styles.reflectLabel}>What happened?</p>
      <textarea
        value={whatHappened}
        onChange={(e) => setWhatHappened(e.target.value)}
        placeholder="The trigger, the moment, what led up to it..."
        rows={3}
        disabled={saving}
        className="vow-reflect-textarea"
        style={styles.reflectTextarea}
      />

      <p style={{ ...styles.reflectLabel, marginTop: '14px' }}>
        What did it show you?
      </p>
      <textarea
        value={whatLearned}
        onChange={(e) => setWhatLearned(e.target.value)}
        placeholder="Something to remember for next time..."
        rows={3}
        disabled={saving}
        className="vow-reflect-textarea"
        style={styles.reflectTextarea}
      />

      <button
        onClick={handleSave}
        disabled={!canSave || saving}
        style={{
          ...styles.reflectSaveBtn,
          ...(!canSave || saving ? styles.reflectSaveBtnDisabled : {}),
        }}
      >
        {saving ? 'Saving...' : justSaved ? '✓ Saved' : 'Save reflection'}
      </button>

      {justSaved && (
        <p style={styles.reflectSavedNote}>
          You can come back and write more another time.
        </p>
      )}
    </div>
  )
}

// ===================================================================
// TILE: ANCHORS
// ===================================================================
function AnchorsTile({ navigate, anchorCount }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Anchors</p>
      <h3 style={styles.tileTitle}>Reach out to someone.</h3>
      <p style={styles.tileBody}>
        {anchorCount > 0
          ? `You have ${anchorCount} ${anchorCount === 1 ? 'person' : 'people'} saved. Calling one of them might help right now.`
          : "If there's someone you trust — a friend, family, a sponsor — consider telling them. Saying it out loud is part of how it gets processed."}
      </p>
      <button
        onClick={() => navigate('/anchors')}
        style={styles.anchorsBtn}
      >
        {anchorCount > 0 ? 'Open Anchors' : 'Set up Anchors'}
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
        Two paths back. There's no rush. These are here when you want them.
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
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.16em',
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