import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import SheetPortal from '../../components/SheetPortal'
import VowBrandMark from '../../components/VowBrandMark'
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
  const [forkOpen, setForkOpen] = useState(false)
  const [reentryOpen, setReentryOpen] = useState(false)

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
  const handleLogFracture = async (fractureType, leak) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { error } = await supabase.from('free_stage_signals').insert({
      user_id: user.id,
      stage: 'reclaim',
      signal_type: 'reclaim_return',
      payload: { fracture_type: fractureType, leak: leak || null },
    })
    if (error) {
      console.error('Failed to log fracture:', error)
      return false
    }
    return true
  }

  // === Swipe-to-shield micro-contract ===
  const handleShield = async (windowSel, action) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { error } = await supabase.from('free_stage_signals').insert({
      user_id: user.id,
      stage: 'reclaim',
      signal_type: 'reclaim_shield',
      payload: { window: windowSel, action },
    })
    if (error) {
      console.error('Failed to log shield:', error)
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

  const handleLogReach = async (needs, alt) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { error } = await supabase.from('free_stage_signals').insert({
      user_id: user.id, stage: 'reclaim', signal_type: 'reclaim_need',
      payload: { needs, alternative: (alt || '').trim() || null, logged_at: new Date().toISOString() },
    })
    if (error) { console.error('Failed to save need:', error); return false }
    return true
  }

  const handleLogChain = async (steps, forkStep) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { error } = await supabase.from('free_stage_signals').insert({
      user_id: user.id, stage: 'reclaim', signal_type: 'reclaim_chain',
      payload: { steps, fork_step: forkStep || null, logged_at: new Date().toISOString() },
    })
    if (error) { console.error('Failed to save chain:', error); return false }
    return true
  }

  const handleCheckinSaved = (row) => setTodayCheckin(row)

  // === Re-entry handlers ===
  const handleMoveToCommit = async () => {
    if (transitioning) return
    setTransitioning(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setTransitioning(false); return }

      // Commit owns no live counter — pause the tracker (longest streak preserved
      // on the row). A tracker hiccup must NOT block the move.
      if (tracker?.id) {
        const { error: tErr } = await supabase.from('trackers')
          .update({ is_active: false }).eq('id', tracker.id)
        if (tErr) console.error('tracker pause failed (continuing):', tErr)
      }

      const { error } = await supabase
        .from('vow_path_progress')
        .update({
          free_state: 'commit',
          endure_starts_at: null,
          endure_slip_count: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Failed to move to commit:', error)
        alert('Could not move to Commit: ' + (error.message || 'please try again.'))
        setTransitioning(false)
        return
      }
      window.location.assign('/home')
    } catch (err) {
      console.error(err)
      alert('Something went wrong: ' + (err?.message || 'please try again.'))
      setTransitioning(false)
    }
  }

  const handleRestartEndure = async () => {
    if (transitioning) return
    setTransitioning(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setTransitioning(false); return }
      const now = new Date().toISOString()
      const addictionTypeId = await resolveAddictionTypeId(progress.primary_substance)

      // (Re)start a tracker so the counter runs. Prefer this substance, else the
      // most recent. Never let a tracker hiccup block the re-entry.
      let trackerId = null
      if (addictionTypeId != null) {
        const { data: byType } = await supabase.from('trackers').select('id')
          .eq('user_id', user.id).eq('addiction_type_id', addictionTypeId).order('created_at')
        if (byType && byType.length > 0) trackerId = byType[0].id
      }
      if (!trackerId) {
        const { data: anyTrk } = await supabase.from('trackers').select('id')
          .eq('user_id', user.id).order('created_at')
        if (anyTrk && anyTrk.length > 0) trackerId = anyTrk[0].id
      }
      if (trackerId) {
        const { error: tErr } = await supabase.from('trackers')
          .update({ start_date: now, is_active: true, tracker_status: 'active' }).eq('id', trackerId)
        if (tErr) console.error('tracker reactivate failed (continuing):', tErr)
      } else if (addictionTypeId != null) {
        const { error: iErr } = await supabase.from('trackers')
          .insert({ user_id: user.id, addiction_type_id: addictionTypeId, start_date: now, is_active: true, tracker_status: 'active' })
        if (iErr) console.error('tracker insert failed (continuing):', iErr)
      }

      const { error: progressError } = await supabase
        .from('vow_path_progress')
        .update({
          free_state: 'endure',
          endure_slip_count: 0,
          updated_at: now,
        })
        .eq('user_id', user.id)

      if (progressError) {
        console.error('Failed to update free_state:', progressError)
        alert('Could not restart Endure: ' + (progressError.message || 'please try again.'))
        setTransitioning(false)
        return
      }
      window.location.assign('/home')
    } catch (err) {
      console.error(err)
      alert('Something went wrong: ' + (err?.message || 'please try again.'))
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
          <VowBrandMark />
          <button
            onClick={() => navigate('/profile')}
            style={styles.profileBtn}
            aria-label="Profile"
          >
            <ProfileIcon />
          </button>
        </div>

        {/* OPENING — warm held space: greeting + what still stands */}
        <OpeningPanel
          firstName={firstName}
          bio={bio}
          anchorCount={anchorCount}
          longestStreakDays={longestStreakDays}
          checklistDone={checklistDone}
        />

        {/* RIGHT NOW */}
        <SectionLabel title="Right now" hint="No verdict here — just a place to set it down." />
        <FractureDiagnosticTile onLog={handleLogFracture} />
        <ReachingForTile onSave={handleLogReach} />
        <KinderVoiceTile onReframe={handleReframe} />
        <ShieldTile onShield={handleShield} />

        {/* IN YOUR WORDS */}
        <SectionLabel title="In your words" />
        <JournalTile stage="reclaim" />

        {/* TOOLS — glyph toolkit (matches other stages) */}
        <div>
          <p style={styles.toolkitLabel}>Tools</p>
          <div style={styles.toolkit}>
            <button onClick={() => setForkOpen(true)} style={styles.toolBtn}>
              <span style={styles.toolIcon}><ForkGlyph /></span>
              <span style={styles.toolLabel}>Where was the fork?</span>
            </button>
            <button onClick={() => navigate('/anchors')} style={styles.toolBtn}>
              <span style={styles.toolIcon}><AnchorGlyph /></span>
              <span style={styles.toolLabel}>Anchors</span>
            </button>
            <button onClick={() => setReentryOpen(true)} style={styles.toolBtn}>
              <span style={styles.toolIcon}><ReclaimGlyph /></span>
              <span style={styles.toolLabel}>Reclaim</span>
            </button>
          </div>
        </div>

        <BottomNav />
      </div>

      <ForkTile open={forkOpen} onClose={() => setForkOpen(false)} onSave={handleLogChain} />

      <ReentrySheet
        open={reentryOpen}
        onClose={() => setReentryOpen(false)}
        onMoveToCommit={handleMoveToCommit}
        onRestartEndure={handleRestartEndure}
        transitioning={transitioning}
        hasSubstance={!!progress.primary_substance}
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
// ===================================================================
// OPENING PANEL (warm held space: greeting merged with what still stands)
// ===================================================================
function OpeningPanel({ firstName, bio, anchorCount, longestStreakDays, checklistDone }) {
  const items = []
  if (bio && bio.trim().length > 0) items.push({ label: 'Your reason for starting', value: 'preserved' })
  if (anchorCount > 0) items.push({ label: `${anchorCount} ${anchorCount === 1 ? 'anchor' : 'anchors'} saved`, value: 'still there' })
  if (longestStreakDays > 0) items.push({ label: 'Your longest stretch', value: `${longestStreakDays} ${longestStreakDays === 1 ? 'day' : 'days'}` })
  if (checklistDone > 0) items.push({ label: 'Infrastructure you built', value: `${checklistDone} ${checklistDone === 1 ? 'item' : 'items'}` })

  return (
    <div style={styles.openPanel}>
      <p style={styles.openEyebrow}>RECLAIM</p>
      <h1 style={styles.openTitle}>You came back{firstName ? `, ${firstName}` : ''}.</h1>
      <p style={styles.openBody}>
        Whatever happened, none of what you built was erased. It's still here, waiting. Take your time.
      </p>
      {items.length > 0 ? (
        <div style={styles.openStands}>
          <p style={styles.openStandsHead}>What still stands</p>
          {items.map((item, i) => (
            <div key={i} style={styles.standsRow}>
              <span style={styles.standsLabel}>{item.label}</span>
              <span style={styles.standsValue}>{item.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p style={styles.standsEmpty}>You're here. That's the first thing.</p>
      )}
    </div>
  )
}

// ===================================================================
// SECTION LABEL (whisper-quiet group header)
// ===================================================================
function SectionLabel({ title, hint }) {
  return (
    <div style={styles.sectionLabelWrap}>
      <p style={styles.sectionLabelText}>{title}</p>
      {hint ? <p style={styles.sectionLabelHint}>{hint}</p> : null}
    </div>
  )
}

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
const ForkGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21v-6" />
    <path d="M12 15c0-4-6-4-6-8V3" />
    <path d="M12 15c0-4 6-4 6-8V3" />
  </svg>
)

const AnchorGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2.4" />
    <path d="M12 7.4V21" />
    <path d="M5 13a7 7 0 0 0 14 0" />
    <path d="M8 12H4M20 12h-4" />
  </svg>
)

const ReclaimGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-3.4-7" />
    <path d="M21 3v5h-5" />
  </svg>
)

const REACH_NEEDS = [
  'Relief from stress', 'To escape', 'A lift or energy', 'Connection',
  'To quiet my mind', 'To celebrate', 'To feel less',
]

// ===================================================================
// TILE: WHAT WERE YOU REACHING FOR (the need beneath the slip)
// ===================================================================
function ReachingForTile({ onSave }) {
  const [open, setOpen] = useState(false)
  const [needs, setNeeds] = useState([])
  const [alt, setAlt] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(null)

  const toggle = (n) => setNeeds(prev => (prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]))
  const ready = needs.length > 0

  const handleSave = async () => {
    if (!ready || saving) return
    setSaving(true)
    const ok = await onSave(needs, alt)
    setSaving(false)
    if (ok) { setDone({ needs: [...needs] }); setOpen(false) }
    else alert('Could not save. Please try again.')
  }

  const summary = done
    ? done.needs.join(' · ')
    : 'The slip was trying to get you something. What was it?'
  const openSheet = () => { setNeeds([]); setAlt(''); setOpen(true) }

  return (
    <>
      <Launcher icon="🧭" title="What were you reaching for?" summary={summary} done={!!done} onOpen={openSheet} />
      <ActivitySheet open={open} onClose={() => setOpen(false)} eyebrow="The need underneath" title="What were you really reaching for?">
        <p style={styles.sheetLead}>
          A slip isn't weakness — it's reaching for something. Name what it was after. That's the thing we can meet a kinder way next time.
        </p>
        <div style={styles.reachWrap}>
          {REACH_NEEDS.map(n => (
            <button key={n} type="button" onClick={() => toggle(n)} disabled={saving}
              style={{ ...styles.reachChip, ...(needs.includes(n) ? styles.reachChipOn : {}) }}>{n}</button>
          ))}
        </div>
        <label style={styles.reachAltLabel}>What else, even something small, could meet that? <span style={styles.reachOptional}>optional</span></label>
        <input type="text" value={alt} onChange={(e) => setAlt(e.target.value)}
          placeholder="e.g. A walk, calling Sam, an early night"
          maxLength={140} style={styles.reachInput} />
        <button onClick={handleSave} disabled={!ready || saving}
          style={{ ...styles.sheetSaveBtn, ...(!ready ? styles.saveBtnDim : {}) }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </ActivitySheet>
    </>
  )
}

// ===================================================================
// TILE: WHERE WAS THE FORK (gentle decision-chain walk-back — a tool)
// ===================================================================
function ForkTile({ open, onClose, onSave }) {
  const [steps, setSteps] = useState([''])
  const [forkIdx, setForkIdx] = useState(null)
  const [saving, setSaving] = useState(false)

  const setStep = (i, v) => setSteps(prev => prev.map((x, j) => (j === i ? v : x)))
  const addStep = () => setSteps(prev => (prev.length < 3 ? [...prev, ''] : prev))
  const removeStep = (i) => { setSteps(prev => prev.filter((_, j) => j !== i)); setForkIdx(null) }

  const ready = steps.some(x => x.trim().length > 0)

  const handleSave = async () => {
    if (!ready || saving) return
    setSaving(true)
    const clean = steps.map(x => x.trim()).filter(Boolean)
    const forkStep = (forkIdx != null && steps[forkIdx]) ? steps[forkIdx].trim() : null
    const ok = await onSave(clean, forkStep)
    setSaving(false)
    if (ok) { setSteps(['']); setForkIdx(null); onClose() }
    else alert('Could not save. Please try again.')
  }

  return (
    <ActivitySheet open={open} onClose={onClose} eyebrow="No blame — just the map" title="Where was the fork?">
      <p style={styles.sheetLead}>
        A slip is rarely one moment — it's a few small steps. Walk back two or three. We're not reliving it; we're finding the door you can use next time.
      </p>
      {steps.map((stp, i) => (
        <div key={i} style={styles.forkStepRow}>
          <span style={styles.forkStepNum}>{i + 1}</span>
          <input type="text" value={stp} onChange={(e) => setStep(i, e.target.value)}
            placeholder={i === 0 ? 'e.g. Skipped dinner, came home wired and alone' : 'then…'}
            maxLength={120} style={styles.forkInput} />
          {steps.length > 1 && (
            <button type="button" onClick={() => removeStep(i)} style={styles.forkRemove} aria-label="Remove step">✕</button>
          )}
        </div>
      ))}
      {steps.length < 3 && (
        <button type="button" onClick={addStep} style={styles.forkAdd}>+ add a step</button>
      )}
      {ready && (
        <>
          <p style={styles.forkPickLabel}>Which step was the earliest fork — where another small choice was open?</p>
          <div style={styles.forkPickWrap}>
            {steps.map((stp, i) => (stp.trim() ? (
              <button key={i} type="button" onClick={() => setForkIdx(i)}
                style={{ ...styles.forkPick, ...(forkIdx === i ? styles.forkPickOn : {}) }}>Step {i + 1}</button>
            ) : null))}
          </div>
        </>
      )}
      <button onClick={handleSave} disabled={!ready || saving}
        style={{ ...styles.sheetSaveBtn, ...(!ready ? styles.saveBtnDim : {}) }}>
        {saving ? 'Saving…' : 'Save the map'}
      </button>
    </ActivitySheet>
  )
}

function ReentrySheet({ open, onClose, onMoveToCommit, onRestartEndure, transitioning, hasSubstance }) {
  return (
    <ActivitySheet open={open} onClose={onClose} eyebrow="When you're ready" title="Choose your re-entry.">
      <p style={styles.sheetLead}>
        Just the next 24 hours — both paths start the clock fresh from today.
      </p>
      {hasSubstance && (
        <button onClick={onRestartEndure} disabled={transitioning} style={styles.readyPrimaryBtn}>
          {transitioning ? 'Starting…' : 'Restart Endure now'}
        </button>
      )}
      <button onClick={onMoveToCommit} disabled={transitioning} style={styles.readySecondaryBtn}>
        {transitioning ? 'Moving…' : 'Move to Commit'}
      </button>
    </ActivitySheet>
  )
}

function ActivitySheet({ open, onClose, eyebrow, title, children }) {
  if (!open) return null
  return (
    <SheetPortal><div style={styles.sheetBackdrop} onClick={onClose}>
      <div style={styles.sheetCard} onClick={(e) => e.stopPropagation()}>
        <div style={styles.sheetHead}>
          <div style={{ flex: 1 }}>
            {eyebrow && <p style={styles.sheetEyebrow}>{eyebrow}</p>}
            <h2 style={styles.sheetTitle}>{title}</h2>
          </div>
          <button onClick={onClose} style={styles.sheetClose} aria-label="Close">✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div></SheetPortal>
  )
}

function Launcher({ icon, title, summary, done, onOpen }) {
  return (
    <button onClick={onOpen} style={styles.launcher}>
      <div style={styles.launcherTop}>
        <span style={styles.launcherIcon}>{icon}</span>
        <span style={{ ...styles.launcherChip, ...(done ? styles.launcherChipDone : {}) }}>
          {done ? 'Noted ✓' : 'Open ›'}
        </span>
      </div>
      <h2 style={styles.launcherTitle}>{title}</h2>
      <p style={styles.launcherSummary}>{summary}</p>
    </button>
  )
}

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
  { key: 'exhaustion', label: 'Exhaustion', sub: 'Running on empty.', leaks: ['Too little sleep', 'Overworked', 'Out of willpower', 'Physically unwell'] },
  { key: 'social',     label: 'Social',     sub: 'The people or the place.', leaks: ["Couldn't say no", 'Wanted to blend in', 'Ambient pressure', 'Felt left out'] },
  { key: 'emotional',  label: 'Emotion',    sub: 'A hard feeling surged.', leaks: ['Anger', 'Grief or loss', 'Anxiety', 'Loneliness'] },
  { key: 'vacuum',     label: 'The vacuum', sub: 'Empty time, nothing to lean on.', leaks: ['Dead evening', 'Boredom', 'Procrastinating', 'Reward / celebration'] },
]

// Cascading autopsy: tap the breach, then the exact leak. Mechanical, not moral.
function FractureDiagnosticTile({ onLog }) {
  const [open, setOpen] = useState(false)
  const [primary, setPrimary] = useState(null)
  const [leak, setLeak] = useState(null)
  const [saving, setSaving] = useState(false)
  const [logged, setLogged] = useState(null)

  const primaryObj = FRACTURES.find(f => f.key === primary)

  const handleLog = async () => {
    if (!primary || saving) return
    setSaving(true)
    const ok = await onLog(primary, leak)
    setSaving(false)
    if (ok) {
      const f = FRACTURES.find(x => x.key === primary)
      setLogged({ label: f?.label || primary, leak })
      setOpen(false)
    } else alert('Could not save. Please try again.')
  }

  const done = !!logged
  const summary = done
    ? `${logged.label}${logged.leak ? ` · ${logged.leak}` : ''}`
    : 'What gave way? Name it — no verdict, just data.'

  const openSheet = () => { setPrimary(null); setLeak(null); setOpen(true) }

  return (
    <>
      <Launcher icon="🧩" title="What gave way?" summary={summary} done={done} onOpen={openSheet} />
      <ActivitySheet open={open} onClose={() => setOpen(false)} eyebrow="The diagnostic · not a verdict" title="What breached the perimeter?">
        <p style={styles.sheetLead}>Not what's wrong with you — what was the pressure that broke through. Two taps, and the warning signs get easier to spot.</p>
        <p style={styles.rcGroupLabel}>The breach</p>
        <div style={styles.rcGrid2}>
          {FRACTURES.map(f => (
            <button key={f.key} onClick={() => { setPrimary(f.key); setLeak(null) }} disabled={saving}
              style={{ ...styles.rcCell, ...(primary === f.key ? styles.rcCellOn : {}) }}>
              <span style={{ ...styles.rcCellLabel, ...(primary === f.key ? styles.rcCellTextOn : {}) }}>{f.label}</span>
              <span style={{ ...styles.rcCellSub, ...(primary === f.key ? styles.rcCellTextOn : {}) }}>{f.sub}</span>
            </button>
          ))}
        </div>
        {primaryObj && (
          <>
            <p style={styles.rcGroupLabel}>The exact leak</p>
            <div style={styles.rcPillWrap}>
              {primaryObj.leaks.map(lk => (
                <button key={lk} onClick={() => setLeak(lk)} disabled={saving}
                  style={{ ...styles.rcPill, ...(leak === lk ? styles.rcPillOn : {}) }}>{lk}</button>
              ))}
            </div>
          </>
        )}
        <button onClick={handleLog} disabled={!primary || saving}
          style={{ ...styles.sheetSaveBtn, ...(!primary ? styles.saveBtnDim : {}) }}>
          {saving ? 'Saving…' : 'Log it'}
        </button>
      </ActivitySheet>
    </>
  )
}

const KINDER_PAIRS = [
  { key: 'catastrophe', harsh: "I've ruined everything.", kind: "One hard day doesn't erase the ones behind it. They still happened." },
  { key: 'zero',        harsh: "I'm back to square one.", kind: "You're not at zero. You're someone who has done this before, here again." },
  { key: 'willpower',   harsh: "I have no willpower.", kind: "Willpower didn't fail — you hit a hard moment. That's information, not a verdict." },
  { key: 'pointless',   harsh: "Why do I even bother?", kind: "Because part of you still wants this. That part just opened the app." },
]

// Compassion flip: name the shame, then flip it to a kinder, truer voice.
function KinderVoiceTile({ onReframe }) {
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState(null)
  const [flipped, setFlipped] = useState(false)
  const [didReframe, setDidReframe] = useState(false)

  const pickedObj = KINDER_PAIRS.find(p => p.key === picked)

  const flip = () => {
    if (!picked || flipped) return
    setFlipped(true)
    setDidReframe(true)
    if (onReframe) onReframe(picked)
  }

  const summary = didReframe ? 'You met the cruel voice with a kinder one.' : 'When the voice gets cruel, answer it.'
  const openSheet = () => { setPicked(null); setFlipped(false); setOpen(true) }

  return (
    <>
      <Launcher icon="🕊️" title="The voice in your head" summary={summary} done={didReframe} onOpen={openSheet} />
      <ActivitySheet open={open} onClose={() => setOpen(false)} eyebrow="The compassion flip" title="It's being cruel. Answer it.">
        <p style={styles.sheetLead}>Tap the thought that sounds like you right now.</p>
        <div style={styles.rcPillWrap}>
          {KINDER_PAIRS.map(p => (
            <button key={p.key} onClick={() => { setPicked(p.key); setFlipped(false) }}
              style={{ ...styles.kinderPick, ...(picked === p.key ? styles.kinderPickOn : {}) }}>
              "{p.harsh}"
            </button>
          ))}
        </div>
        {pickedObj && !flipped && (
          <button onClick={flip} style={styles.flipBtn}>Flip to a kinder voice →</button>
        )}
        {pickedObj && flipped && (
          <div style={styles.kindReveal}>
            <p style={styles.kindRevealText}>{pickedObj.kind}</p>
          </div>
        )}
      </ActivitySheet>
    </>
  )
}

const SHIELD_WINDOWS = ['Next hour', 'Next 12 hours', 'Just today']
const SHIELD_ACTIONS = ['Go to sleep', 'Step outside', 'Drink water', 'Text my anchor', 'Stay off my phone']

// Swipe-to-shield: a small promise for a short window, sealed by a deliberate drag.
function ShieldTile({ onShield }) {
  const [open, setOpen] = useState(false)
  const [windowSel, setWindowSel] = useState(null)
  const [action, setAction] = useState(null)
  const [slide, setSlide] = useState(0)
  const [saving, setSaving] = useState(false)
  const [locked, setLocked] = useState(null)

  const canSlide = !!windowSel && !!action && !saving
  const done = !!locked
  const summary = done ? `${locked.window} · ${locked.action} ✓` : 'Lock one small promise for the next stretch.'

  const onSlideChange = async (v) => {
    if (!canSlide) { setSlide(0); return }
    setSlide(v)
    if (v >= 100) {
      setSaving(true)
      const ok = await onShield(windowSel, action)
      setSaving(false)
      if (ok) { setLocked({ window: windowSel, action }); setOpen(false) }
      else { alert('Could not save. Please try again.'); setSlide(0) }
    }
  }

  const release = () => { if (slide < 100) setSlide(0) }
  const openSheet = () => { setWindowSel(null); setAction(null); setSlide(0); setOpen(true) }

  return (
    <>
      <Launcher icon="🛡️" title="Shield the next stretch" summary={summary} done={done} onOpen={openSheet} />
      <ActivitySheet open={open} onClose={() => setOpen(false)} eyebrow="A micro-contract" title="One promise, sealed by hand">
        <p style={styles.sheetLead}>You don't have to promise forever — just one small thing, for one short window.</p>
        <p style={styles.rcGroupLabel}>For the…</p>
        <div style={styles.rcPillWrap}>
          {SHIELD_WINDOWS.map(w => (
            <button key={w} onClick={() => { setWindowSel(w); setSlide(0) }}
              style={{ ...styles.rcPill, ...(windowSel === w ? styles.rcPillOn : {}) }}>{w}</button>
          ))}
        </div>
        <p style={styles.rcGroupLabel}>I will…</p>
        <div style={styles.rcPillWrap}>
          {SHIELD_ACTIONS.map(a => (
            <button key={a} onClick={() => { setAction(a); setSlide(0) }}
              style={{ ...styles.rcPill, ...(action === a ? styles.rcPillOn : {}) }}>{a}</button>
          ))}
        </div>
        <div style={{ ...styles.slideTrack, ...(canSlide ? {} : styles.slideTrackDim) }}>
          <span style={styles.slideLabel}>{slide >= 100 ? 'Sealed ✓' : 'Slide to seal →'}</span>
          <input type="range" min={0} max={100} value={slide} disabled={!canSlide || saving}
            onChange={(e) => onSlideChange(parseInt(e.target.value, 10))}
            onMouseUp={release} onTouchEnd={release} style={styles.slideInput} />
        </div>
      </ActivitySheet>
    </>
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
      <h3 style={styles.readyTitle}>Choose your re-entry.</h3>
      <p style={styles.readyBody}>
        Just the next 24 hours — both paths start the clock fresh from today.
      </p>
      {hasSubstance && (
        <button onClick={onRestartEndure} disabled={transitioning} style={styles.readyPrimaryBtn}>
          {transitioning ? 'Starting…' : 'Restart Endure now'}
        </button>
      )}
      <button onClick={onMoveToCommit} disabled={transitioning} style={styles.readySecondaryBtn}>
        {transitioning ? 'Moving…' : 'Move to Commit'}
      </button>
    </div>
  )
}

// ===================================================================
// STYLES
// ===================================================================
const styles = {
  reachWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' },
  reachChip: { padding: '9px 13px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '20px', fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  reachChipOn: { background: 'linear-gradient(180deg, #6E3A1C 0%, #3A2415 100%)', color: '#FAF7F1', border: '0.5px solid #3A2415' },
  reachAltLabel: { display: 'block', fontSize: '12.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', margin: '0 0 8px', lineHeight: 1.4 },
  reachOptional: { color: '#9C8C78', fontStyle: 'italic' },
  reachInput: { width: '100%', boxSizing: 'border-box', padding: '12px 14px', background: 'white', border: '0.5px solid #DDCFB6', borderRadius: '12px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', outline: 'none', marginBottom: '14px' },
  forkStepRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  forkStepNum: { flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%', background: '#F3EADB', color: '#854F0B', fontSize: '12px', fontWeight: 600, fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  forkInput: { flex: 1, boxSizing: 'border-box', padding: '11px 13px', background: 'white', border: '0.5px solid #DDCFB6', borderRadius: '11px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', outline: 'none' },
  forkRemove: { flexShrink: 0, background: 'transparent', border: 'none', color: '#B9A07E', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', padding: '4px' },
  forkAdd: { background: 'transparent', border: 'none', color: '#854F0B', cursor: 'pointer', fontSize: '13px', fontFamily: 'Georgia, serif', fontStyle: 'italic', padding: '2px 0 4px', marginBottom: '10px' },
  forkPickLabel: { fontSize: '12.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', lineHeight: 1.45, margin: '6px 0 10px' },
  forkPickWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' },
  forkPick: { padding: '8px 14px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '18px', fontSize: '12.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  forkPickOn: { background: 'linear-gradient(180deg, #6E3A1C 0%, #3A2415 100%)', color: '#FAF7F1', border: '0.5px solid #3A2415' },
  toolkitLabel: { fontSize: '13px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', margin: '0 0 16px', paddingLeft: '2px' },
  toolkit: { display: 'flex', gap: '8px', justifyContent: 'center' },
  toolBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '16px 6px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  toolIcon: { color: '#854F0B', display: 'flex' },
  toolLabel: { fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', textAlign: 'center', lineHeight: 1.3 },
  openPanel: { background: 'linear-gradient(180deg, #FBF4E8 0%, #F6ECDC 100%)', border: '0.5px solid #ECDFC8', borderRadius: '22px', padding: '22px 22px 20px', boxShadow: '0 6px 20px rgba(120,80,30,0.08)' },
  openEyebrow: { fontSize: '10.5px', color: '#B0894A', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 10px' },
  openTitle: { fontSize: '24px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.25, margin: '0 0 10px' },
  openBody: { fontSize: '14.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 16px' },
  openStands: { borderTop: '0.5px solid rgba(180,140,80,0.22)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' },
  openStandsHead: { fontSize: '10px', color: '#9A7636', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 2px' },
  sectionLabelWrap: { margin: '8px 2px 0' },
  sectionLabelText: { fontSize: '11px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: 0 },
  sectionLabelHint: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4, margin: '4px 0 0' },
  launcher: { display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', background: 'linear-gradient(155deg, #6E3A1C 0%, #3A2415 100%)', borderRadius: '18px', padding: '16px 18px', marginBottom: '14px', boxShadow: '0 6px 18px rgba(40,25,10,0.18)', fontFamily: 'inherit' },
  launcherTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  launcherIcon: { fontSize: '22px', lineHeight: 1 },
  launcherChip: { fontSize: '11px', fontWeight: 600, color: 'rgba(250,247,241,0.85)', background: 'rgba(250,247,241,0.12)', border: '0.5px solid rgba(250,247,241,0.22)', borderRadius: '20px', padding: '4px 10px', fontFamily: 'Georgia, serif' },
  launcherChipDone: { color: '#DFF0C2', background: 'rgba(120,160,60,0.22)', border: '0.5px solid rgba(180,210,130,0.4)' },
  launcherTitle: { fontSize: '17px', fontWeight: 600, color: '#FAF7F1', fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  launcherSummary: { fontSize: '12.5px', color: 'rgba(250,247,241,0.72)', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.45 },
  sheetBackdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(40,25,15,0.55)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', zIndex: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px' },
  sheetCard: { width: '100%', maxWidth: '430px', maxHeight: '88vh', overflowY: 'auto', background: '#FCFAF5', borderRadius: '22px', padding: '20px 20px 22px', boxShadow: '0 24px 70px rgba(40,25,15,0.4)' },
  sheetHead: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' },
  sheetEyebrow: { fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A07A3C', fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  sheetTitle: { fontSize: '19px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.25 },
  sheetClose: { flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', border: '0.5px solid #E0D5C2', background: 'white', color: '#6B5C4A', fontSize: '13px', cursor: 'pointer', lineHeight: 1 },
  sheetLead: { fontSize: '13.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: '0 0 16px' },
  sheetSaveBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FBF6EE', border: 'none', borderRadius: '13px', fontSize: '14px', fontWeight: 500, fontFamily: 'Georgia, serif', cursor: 'pointer', marginTop: '4px' },
  saveBtnDim: { opacity: 0.45, cursor: 'not-allowed' },
  rcGroupLabel: { fontSize: '13px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '6px 0 8px' },
  rcGrid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' },
  rcCell: { display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start', textAlign: 'left', padding: '12px 13px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit' },
  rcCellOn: { background: 'linear-gradient(180deg, #F5E9D4 0%, #EEDFC2 100%)', border: '1px solid #C99A4E', boxShadow: '0 2px 8px rgba(180,140,70,0.18)' },
  rcCellLabel: { fontSize: '14px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif' },
  rcCellSub: { fontSize: '11px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.35 },
  rcCellTextOn: { color: '#5A3A12' },
  rcPillWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' },
  rcPill: { padding: '9px 14px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '20px', fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  rcPillOn: { background: 'linear-gradient(180deg, #F5E9D4 0%, #EEDFC2 100%)', color: '#5A3A12', border: '1px solid #C99A4E' },
  kinderPick: { width: '100%', textAlign: 'left', padding: '12px 14px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '14px', fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', cursor: 'pointer' },
  kinderPickOn: { background: 'linear-gradient(180deg, #F5E9D4 0%, #EEDFC2 100%)', color: '#5A3A12', border: '1px solid #C99A4E' },
  flipBtn: { width: '100%', padding: '12px', background: 'white', color: '#854F0B', border: '0.5px solid #DDCFB6', borderRadius: '12px', fontSize: '13.5px', fontWeight: 500, fontFamily: 'Georgia, serif', cursor: 'pointer', marginTop: '4px' },
  kindReveal: { background: 'linear-gradient(180deg, #FBF5EA 0%, #F4EAD7 100%)', border: '0.5px solid #E6D4B4', borderRadius: '14px', padding: '16px', marginTop: '6px' },
  kindRevealText: { fontSize: '15px', color: '#3A2A1C', fontFamily: 'Georgia, serif', lineHeight: 1.55, margin: 0 },
  slideTrack: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '52px', background: 'linear-gradient(180deg, #F3E9D8 0%, #ECDFC6 100%)', border: '0.5px solid #DDCFB6', borderRadius: '26px', marginTop: '6px', overflow: 'hidden' },
  slideTrackDim: { opacity: 0.5 },
  slideLabel: { position: 'absolute', fontSize: '13px', color: '#8A6A3A', fontFamily: 'Georgia, serif', fontStyle: 'italic', pointerEvents: 'none' },
  slideInput: { width: '100%', height: '52px', margin: 0, accentColor: '#854F0B', background: 'transparent', cursor: 'pointer' },
  readyPrimaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FBF6EE', border: 'none', borderRadius: '13px', fontSize: '15px', fontWeight: 500, fontFamily: 'Georgia, serif', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 4px 14px rgba(40,25,10,0.22)' },
  readySecondaryBtn: { width: '100%', padding: '13px', background: 'white', color: '#854F0B', border: '0.5px solid #DDCFB6', borderRadius: '12px', fontSize: '14px', fontWeight: 500, fontFamily: 'Georgia, serif', cursor: 'pointer' },
  readyHelper: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.5, margin: '12px 0 0' },
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