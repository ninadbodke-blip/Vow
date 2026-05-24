import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import VowBrandMark from '../../components/VowBrandMark'
import DailyCheckin, { moodByScore, moodByValue } from './DailyCheckin'
import JournalTile from './JournalTile'
import BottomNav from '../../components/BottomNav'

// ===================================================================
// BUILD-FREE HOME  (Maintenance stage)
// ===================================================================
// Months in. The acute work of Endure is behind them; the risk now is
// complacency creep and quiet psychological drift. This home is built
// around heavy, deliberate work — not shallow taps:
//   1. Capital Drain   — allocate reclaimed hours, expose idle risk
//   2. Stress Pillars  — press-and-hold routines under measured load
//   3. The Crucible    — forge proof + its cost into a permanent ledger
//   4. Blindspot Radar — catch the drift before it becomes an urge
// Every interaction lives behind a floating card. The home shows only
// slim launchers that collapse to a one-line summary once done.
// All captures are structured for the Mirror + post-pilot AI reflections.
// ===================================================================

const HOUR_POOL = 14

const CAPITAL_BUCKETS = [
  { key: 'physical', label: 'Physical', icon: '💪', sub: 'body, sleep, training' },
  { key: 'relational', label: 'Relational', icon: '🤝', sub: 'people who matter' },
  { key: 'craft', label: 'Craft', icon: '🛠️', sub: 'work, skill, making' },
  { key: 'rest', label: 'Rest', icon: '🌙', sub: 'genuine recovery' },
]

const PILLARS = [
  { key: 'sleep', label: 'Solid sleep', sub: 'the hours you actually got' },
  { key: 'movement', label: 'Movement', sub: 'you moved the body' },
  { key: 'silence', label: 'Silence', sub: 'time alone with no noise' },
]

const GHOSTS = [
  { key: 'entitlement', label: 'Entitlement', sub: "I've earned a break" },
  { key: 'resentment', label: 'Resentment', sub: "anger I haven't spoken" },
  { key: 'isolation', label: 'Isolation', sub: 'pulling away from people' },
  { key: 'nostalgia', label: 'Nostalgia', sub: 'romanticizing the old life' },
]

const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

// ===================================================================
// MAIN COMPONENT
// ===================================================================
export default function BuildFreeHome({ progress: initialProgress }) {
  const navigate = useNavigate()

  const [progress, setProgress] = useState(initialProgress)
  const [tracker, setTracker] = useState(null)
  const [firstName, setFirstName] = useState('')
  const [todayCheckin, setTodayCheckin] = useState(null)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [nowTs, setNowTs] = useState(Date.now())
  const [allocationLatest, setAllocationLatest] = useState(null)
  const [pillarsToday, setPillarsToday] = useState(null)
  const [blindspotToday, setBlindspotToday] = useState(null)
  const [ledger, setLedger] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const today = localDateStr()

      const { data: profileData } = await supabase
        .from('profiles').select('first_name, full_name')
        .eq('id', user.id).maybeSingle()
      if (profileData?.first_name) setFirstName(profileData.first_name)
      else if (profileData?.full_name) setFirstName(profileData.full_name.split(' ')[0])
      else if (user.email) setFirstName(user.email.split('@')[0])

      const { data: trackers } = await supabase
        .from('trackers')
        .select('*, addiction_types (id, name, icon)')
        .eq('user_id', user.id).eq('is_active', true).order('created_at')
      if (trackers && trackers.length > 0) setTracker(trackers[0])

      const { data: tc } = await supabase
        .from('free_daily_checkins').select('*')
        .eq('user_id', user.id).eq('checkin_date', today).maybeSingle()
      if (tc) setTodayCheckin(tc)

      // latest capital allocation (weekly)
      const { data: alloc } = await supabase
        .from('free_stage_signals').select('*')
        .eq('user_id', user.id).eq('signal_type', 'build_allocation')
        .order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (alloc) setAllocationLatest(alloc)

      // pillars logged today
      const { data: pil } = await supabase
        .from('free_stage_signals').select('*')
        .eq('user_id', user.id).eq('signal_type', 'build_pillars')
        .order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (pil && pil.payload && pil.payload.date === today) setPillarsToday(pil)

      // blindspot scan today
      const { data: bs } = await supabase
        .from('free_stage_signals').select('*')
        .eq('user_id', user.id).eq('signal_type', 'build_blindspot')
        .order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (bs && bs.payload && bs.payload.date === today) setBlindspotToday(bs)

      // the crucible ledger (build_evidence — proof + cost; old rows have text)
      const { data: ev } = await supabase
        .from('free_stage_signals').select('*')
        .eq('user_id', user.id).eq('signal_type', 'build_evidence')
        .order('created_at', { ascending: false }).limit(12)
      if (ev) setLedger(ev)

      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // === Capital Drain (weekly hour allocation) ===
  const handleSaveAllocation = async (buckets) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const allocated = CAPITAL_BUCKETS.reduce((s, b) => s + (buckets[b.key] || 0), 0)
    const idle = Math.max(0, HOUR_POOL - allocated)
    const weekOf = formatDateForDB(getMondayOfWeek(new Date()))
    const { data: saved, error } = await supabase.from('free_stage_signals').insert({
      user_id: user.id, stage: 'build', signal_type: 'build_allocation',
      payload: { ...buckets, idle, week_of: weekOf },
    }).select().single()
    if (error) { console.error('Failed to save allocation:', error); return false }
    setAllocationLatest(saved)
    return true
  }

  // === Stress-Tested Pillars (daily) ===
  const handleSavePillars = async ({ stress, locked }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const lockedKeys = PILLARS.filter(p => locked[p.key]).map(p => p.key)
    const today = localDateStr()
    const { data: saved, error } = await supabase.from('free_stage_signals').insert({
      user_id: user.id, stage: 'build', signal_type: 'build_pillars',
      payload: { stress, pillars: lockedKeys, high_stress: stress >= 4 && lockedKeys.length > 0, date: today },
    }).select().single()
    if (error) { console.error('Failed to save pillars:', error); return false }
    setPillarsToday(saved)
    return true
  }

  // === Blindspot Radar (daily) ===
  const handleSaveBlindspot = async (ghosts) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const today = localDateStr()
    const { data: saved, error } = await supabase.from('free_stage_signals').insert({
      user_id: user.id, stage: 'build', signal_type: 'build_blindspot',
      payload: { ghosts, date: today },
    }).select().single()
    if (error) { console.error('Failed to save blindspot:', error); return false }
    setBlindspotToday(saved)
    return true
  }

  // === The Crucible (forge proof + cost into the ledger) ===
  const handleForge = async ({ proof, cost }) => {
    if (!proof.trim()) return false
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const weekOf = formatDateForDB(getMondayOfWeek(new Date()))
    const { data: saved, error } = await supabase.from('free_stage_signals').insert({
      user_id: user.id, stage: 'build', signal_type: 'build_evidence',
      payload: { proof: proof.trim(), cost: cost.trim(), week_of: weekOf, forged_at: new Date().toISOString() },
    }).select().single()
    if (error) { console.error('Failed to forge:', error); return false }
    setLedger(prev => [saved, ...prev].slice(0, 12))
    return true
  }

  // === Urge velocity — matches Endure (spike/creep → urge flow) ===
  const handleLogUrge = async (velocity) => {
    if (!tracker) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('free_stage_signals').insert({
        user_id: user.id, stage: 'build', signal_type: 'urge_velocity',
        payload: { velocity, logged_at: new Date().toISOString() },
      })
    }
    navigate(`/urge/${tracker.id}`, { state: { velocity } })
  }

  const handleCheckinSaved = (row) => setTodayCheckin(row)

  const handleMoveToReclaim = async () => {
    if (!window.confirm("Move to Reclaim? It's a gentler space to regroup — your streak and progress stay saved.")) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('vow_path_progress')
      .update({ free_state: 'reclaim', endure_slip_count: 0, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
    if (error) { console.error('Move to reclaim failed:', error); alert('Could not move: ' + error.message); return }
    window.location.assign('/home')
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={styles.loadingPhone}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.topBar}>
          <VowBrandMark />
          <button onClick={() => navigate('/profile')} style={styles.profileBtn} aria-label="Profile">
            <ProfileIcon />
          </button>
        </div>

        <GreetingTile firstName={firstName} substanceLabel={progress.substance_label} />

        {tracker ? (
          <SlimCounterTile tracker={tracker} nowTs={nowTs} />
        ) : (
          <SetupPromptTile substanceLabel={progress.substance_label} navigate={navigate} />
        )}

        <TodayCheckinTile checkin={todayCheckin} onOpen={() => setCheckinOpen(true)} />

        <JournalTile stage="build" />

        <CapitalDrainTile latest={allocationLatest} onSave={handleSaveAllocation} />

        <StressPillarsTile today={pillarsToday} onSave={handleSavePillars} />

        <CrucibleTile ledger={ledger} onForge={handleForge} />

        <BlindspotRadarTile today={blindspotToday} onSave={handleSaveBlindspot} />

        <AnchorsTile navigate={navigate} />

        {tracker && (
          <ActionTile
            tracker={tracker}
            navigate={navigate}
            slipCount={progress.endure_slip_count || 0}
            onMoveToReclaim={handleMoveToReclaim}
            onLogUrge={handleLogUrge}
          />
        )}

        <BottomNav />
      </div>

      <DailyCheckin
        isOpen={checkinOpen}
        onClose={() => setCheckinOpen(false)}
        stage="build"
        existing={todayCheckin}
        onSaved={handleCheckinSaved}
      />
    </div>
  )
}

// ===================================================================
// SHARED: floating card + launcher
// ===================================================================
function ActivitySheet({ open, onClose, eyebrow, title, children }) {
  if (!open) return null
  return (
    <div style={styles.sheetBackdrop} onClick={onClose}>
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
    </div>
  )
}

function Launcher({ icon, title, summary, done, onOpen }) {
  return (
    <button onClick={onOpen} style={styles.launcher}>
      <div style={styles.launcherTop}>
        <span style={styles.launcherIcon}>{icon}</span>
        <span style={{ ...styles.launcherChip, ...(done ? styles.launcherChipDone : {}) }}>
          {done ? 'Done ✓' : 'Open ›'}
        </span>
      </div>
      <h2 style={styles.launcherTitle}>{title}</h2>
      <p style={styles.launcherSummary}>{summary}</p>
    </button>
  )
}

// ===================================================================
// TILE: TODAY'S CHECK-IN (gentle, shared signal)
// ===================================================================
function TodayCheckinTile({ checkin, onOpen }) {
  if (checkin) {
    const m = moodByScore(checkin.mood_score) || moodByValue(checkin.mood)
    return (
      <div style={{ ...styles.tile, ...styles.tileLogged }}>
        <p style={styles.tileEyebrow}>Today's check-in</p>
        <div style={styles.checkinSummaryRow}>
          <span style={{ ...styles.moodPill, background: m?.color || '#B9A07E' }} />
          <div>
            <p style={styles.checkinSummaryMood}>
              {m?.label || 'Noted'}{checkin.felt_pull ? ' · the pull showed up' : ''}
            </p>
            <p style={styles.checkinSummarySub}>
              Energy {checkin.energy ?? '–'}/5
              {checkin.note ? ` · "${checkin.note}"` : ''}
            </p>
          </div>
        </div>
        <button onClick={onOpen} style={styles.checkinEditBtn}>Edit today's check-in</button>
      </div>
    )
  }
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>A quiet check-in</p>
      <h2 style={styles.tileTitle}>Want to drop in today?</h2>
      <p style={styles.tileBody}>
        Optional, this far in. A half-minute on mood, energy, and how the pull's been — it keeps your Mirror honest.
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
function GreetingTile({ firstName, substanceLabel }) {
  const hour = new Date().getHours()
  let timeGreeting = 'Hello'
  if (hour < 12) timeGreeting = 'Good morning'
  else if (hour < 18) timeGreeting = 'Good afternoon'
  else timeGreeting = 'Good evening'

  return (
    <div style={styles.greetingTile}>
      <p style={styles.greetingEyebrow}>BUILD</p>
      <h1 style={styles.greetingTitle}>
        {timeGreeting}{firstName ? `, ${firstName}` : ''}.
      </h1>
      <p style={styles.greetingSubtitle}>
        Holding the shape on <em style={styles.substanceEm}>{substanceLabel}</em>.
        This is the long work — quieter, heavier.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: SLIM COUNTER (ambient — not the hero)
// ===================================================================
function SlimCounterTile({ tracker, nowTs }) {
  const start = new Date(tracker.start_date).getTime()
  const elapsed = Math.max(0, nowTs - start)
  const totalSec = Math.floor(elapsed / 1000)
  const days = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <div style={styles.slimCounter}>
      <span style={styles.slimDot} />
      <span style={styles.slimDays}>{days} {days === 1 ? 'day' : 'days'}</span>
      <span style={styles.slimClock}>{pad(h)}:{pad(m)}:{pad(s)}</span>
      <span style={styles.slimFree}>free</span>
    </div>
  )
}

// ===================================================================
// TILE: SETUP PROMPT (no tracker)
// ===================================================================
function SetupPromptTile({ substanceLabel, navigate }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Tracker</p>
      <h2 style={styles.tileTitle}>Set up a tracker for {substanceLabel}?</h2>
      <p style={styles.tileBody}>
        Track your time free, savings, and milestones. Optional, but it reinforces the identity you're building.
      </p>
      <button onClick={() => navigate('/onboarding/setup')} style={styles.tileSecondaryBtn}>
        Set up tracking
      </button>
    </div>
  )
}

// ===================================================================
// MECHANIC 1: THE CAPITAL DRAIN (risk management)
// ===================================================================
function CapitalDrainTile({ latest, onSave }) {
  const [open, setOpen] = useState(false)
  const initBuckets = () => CAPITAL_BUCKETS.reduce((a, b) => {
    a[b.key] = (latest && latest.payload && latest.payload[b.key] != null) ? latest.payload[b.key] : 0
    return a
  }, {})
  const [buckets, setBuckets] = useState(initBuckets)
  const [saving, setSaving] = useState(false)

  const allocated = CAPITAL_BUCKETS.reduce((s, b) => s + (buckets[b.key] || 0), 0)
  const idle = Math.max(0, HOUR_POOL - allocated)
  const secured = idle === 0

  const bump = (key, delta) => {
    setBuckets(p => {
      const cur = p[key] || 0
      if (delta > 0 && allocated >= HOUR_POOL) return p
      const next = Math.max(0, cur + delta)
      return { ...p, [key]: next }
    })
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const ok = await onSave(buckets)
    setSaving(false)
    if (ok) setOpen(false)
    else alert('Could not save. Please try again.')
  }

  const idleLatest = latest && latest.payload ? (latest.payload.idle ?? 0) : null
  const summary = latest
    ? (idleLatest === 0
        ? 'Board secured · all 14 reclaimed hours deployed'
        : `${idleLatest}h still unsecured — high-risk vacuum`)
    : 'Distribute your 14 reclaimed hours into what holds you.'

  return (
    <>
      <Launcher icon="⏳" title="The capital drain"
        summary={summary} done={!!latest && idleLatest === 0} onOpen={() => setOpen(true)} />

      <ActivitySheet open={open} onClose={() => setOpen(false)}
        eyebrow="Risk management" title="Where do this week's hours go?">
        <p style={styles.sheetLead}>
          Recovery hands you back roughly 14 hours a week. Unstructured, unspoken-for time is
          where relapse lives. Deploy every hour — leave none idle.
        </p>

        <div style={{ ...styles.cdPool, ...(secured ? styles.cdPoolSafe : {}) }}>
          <span style={styles.cdPoolNum}>{idle}h</span>
          <span style={{ ...styles.cdPoolLabel, ...(secured ? styles.cdPoolLabelSafe : styles.cdPoolLabelRisk) }}>
            {secured ? 'Secured — nothing idle' : 'Unsecured idle time (high relapse risk)'}
          </span>
        </div>

        <div style={styles.cdBucketList}>
          {CAPITAL_BUCKETS.map(b => (
            <div key={b.key} style={styles.cdBucketRow}>
              <span style={styles.cdBucketIcon}>{b.icon}</span>
              <div style={styles.cdBucketInfo}>
                <span style={styles.cdBucketLabel}>{b.label}</span>
                <span style={styles.cdBucketSub}>{b.sub}</span>
              </div>
              <div style={styles.cdStepper}>
                <button onClick={() => bump(b.key, -1)}
                  style={{ ...styles.cdStepBtn, ...((buckets[b.key] || 0) <= 0 ? styles.cdStepBtnDim : {}) }}>−</button>
                <span style={styles.cdStepVal}>{buckets[b.key] || 0}h</span>
                <button onClick={() => bump(b.key, 1)}
                  style={{ ...styles.cdStepBtn, ...(allocated >= HOUR_POOL ? styles.cdStepBtnDim : {}) }}>+</button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleSave} disabled={saving} style={styles.sheetSaveBtn}>
          {saving ? 'Saving…' : secured ? 'Lock the board ✓' : 'Save (still unsecured)'}
        </button>
      </ActivitySheet>
    </>
  )
}

// ===================================================================
// MECHANIC 2: STRESS-TESTED PILLARS
// ===================================================================
function PillarHold({ label, sub, locked, onLock }) {
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef(null)

  const stop = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    if (!locked) setProgress(0)
  }

  const start = () => {
    if (locked || intervalRef.current) return
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        const next = p + 2 // ~1.5s to fill (30ms * 50 steps)
        if (next >= 100) {
          clearInterval(intervalRef.current); intervalRef.current = null
          onLock()
          return 100
        }
        return next
      })
    }, 30)
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  return (
    <button
      style={{ ...styles.pillarBtn, ...(locked ? styles.pillarBtnLocked : {}) }}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
    >
      {!locked && <span style={{ ...styles.pillarFill, width: `${progress}%` }} />}
      <span style={styles.pillarBtnInner}>
        <span style={styles.pillarBtnText}>
          <span style={{ ...styles.pillarLabel, ...(locked ? styles.pillarLabelLocked : {}) }}>{label}</span>
          <span style={{ ...styles.pillarSub, ...(locked ? styles.pillarSubLocked : {}) }}>{sub}</span>
        </span>
        <span style={{ ...styles.pillarState, ...(locked ? styles.pillarStateLocked : {}) }}>
          {locked ? 'Held ✓' : 'Hold'}
        </span>
      </span>
    </button>
  )
}

function StressPillarsTile({ today, onSave }) {
  const [open, setOpen] = useState(false)
  const [stress, setStress] = useState(today?.payload?.stress ?? 3)
  const [locked, setLocked] = useState(() => {
    const start = {}
    const had = (today && today.payload && today.payload.pillars) || []
    PILLARS.forEach(p => { start[p.key] = had.includes(p.key) })
    return start
  })
  const [saving, setSaving] = useState(false)

  const lockedCount = PILLARS.filter(p => locked[p.key]).length
  const stressLabel = ['Calm', 'Low', 'Steady', 'High', 'Heavy'][stress - 1] || 'Steady'

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const ok = await onSave({ stress, locked })
    setSaving(false)
    if (ok) setOpen(false)
    else alert('Could not save. Please try again.')
  }

  const summary = today
    ? `${lockedCount} of 3 held · stress was ${(['calm','low','steady','high','heavy'][(today.payload?.stress ?? 3) - 1]) || 'steady'}`
    : 'Stress-test the routines that hold you up.'

  return (
    <>
      <Launcher icon="🧱" title="Stress-tested pillars"
        summary={summary} done={!!today} onOpen={() => setOpen(true)} />

      <ActivitySheet open={open} onClose={() => setOpen(false)}
        eyebrow="Load-bearing" title="Did the pillars hold today?">
        <p style={styles.sheetLead}>
          A routine is easy on a calm day. It only counts as load-bearing if it survives the
          weight. Set today's load, then hold each pillar you actually kept.
        </p>

        <div style={styles.stressWrap}>
          <div style={styles.stressLabelRow}>
            <span style={styles.stressCap}>Ambient stress today</span>
            <span style={styles.stressVal}>{stressLabel}</span>
          </div>
          <input type="range" min="1" max="5" step="1" value={stress}
            onChange={(e) => setStress(Number(e.target.value))} style={styles.stressSlider} />
          <div style={styles.stressEnds}><span>Calm</span><span>Heavy</span></div>
        </div>

        <div style={styles.pillarList}>
          {PILLARS.map(p => (
            <PillarHold key={p.key} label={p.label} sub={p.sub}
              locked={locked[p.key]} onLock={() => setLocked(prev => ({ ...prev, [p.key]: true }))} />
          ))}
        </div>

        {stress >= 4 && lockedCount > 0 && (
          <p style={styles.pillarBadge}>You held the line under pressure. The foundation is hardening.</p>
        )}

        <button onClick={handleSave} disabled={saving} style={styles.sheetSaveBtn}>
          {saving ? 'Saving…' : "Log today's load"}
        </button>
        <p style={styles.pillarHint}>Press and hold a pillar for a moment — no quick taps. The weight is the point.</p>
      </ActivitySheet>
    </>
  )
}

// ===================================================================
// MECHANIC 3: THE CRUCIBLE (identity ledger)
// ===================================================================
function CrucibleTile({ ledger, onForge }) {
  const [open, setOpen] = useState(false)
  const [proof, setProof] = useState('')
  const [cost, setCost] = useState('')
  const [step, setStep] = useState(0) // 0 idle, 1 heat, 2 strike, 3 forging
  const [saving, setSaving] = useState(false)

  const ready = proof.trim().length > 0
  const forgeLabels = ['Heat the iron', 'Strike', 'Forge it in']
  const stepHint = step === 0 ? 'Tap 1 of 3' : step === 1 ? 'Tap 2 of 3' : 'Tap 3 of 3'

  const tapForge = async () => {
    if (!ready || saving) return
    if (step < 2) { setStep(step + 1); return }
    setSaving(true)
    const ok = await onForge({ proof, cost })
    setSaving(false)
    if (ok) { setProof(''); setCost(''); setStep(0); setOpen(false) }
    else { setStep(0); alert('Could not forge. Please try again.') }
  }

  const weekOf = formatDateForDB(getMondayOfWeek(new Date()))
  const forgedThisWeek = ledger.some(r => r.payload && r.payload.week_of === weekOf)
  const summary = ledger.length
    ? `${ledger.length} ${ledger.length === 1 ? 'proof' : 'proofs'} in the ledger`
    : 'Forge an undeniable proof of who you are now.'

  return (
    <>
      <Launcher icon="⚒️" title="The crucible"
        summary={summary} done={forgedThisWeek} onOpen={() => setOpen(true)} />

      <ActivitySheet open={open} onClose={() => setOpen(false)}
        eyebrow="Identity ledger" title="Forge a proof.">
        <p style={styles.sheetLead}>
          A new self isn't built by doing good things — it's forged by paying the cost of
          refusing the old one. Name the proof, then name what it cost.
        </p>

        <label style={styles.cruLabel}>The proof</label>
        <input type="text" value={proof} onChange={(e) => { setProof(e.target.value); setStep(0) }}
          placeholder="e.g. Stayed calm when it escalated" maxLength={120} style={styles.cruInput} />

        <label style={styles.cruLabel}>The cost</label>
        <input type="text" value={cost} onChange={(e) => { setCost(e.target.value); setStep(0) }}
          placeholder="e.g. Swallowed my pride, rejected the easy out" maxLength={120} style={styles.cruInput} />

        <div style={styles.cruPips}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ ...styles.cruPip, ...(step > i ? styles.cruPipOn : {}) }} />
          ))}
        </div>

        <button onClick={tapForge} disabled={!ready || saving}
          style={{ ...styles.cruForgeBtn, ...((!ready || saving) ? styles.cruForgeBtnDim : {}) }}>
          {saving ? 'Forging…' : `${forgeLabels[step] || 'Forge it in'} · ${stepHint}`}
        </button>

        {ledger.length > 0 && (
          <div style={styles.cruLedger}>
            <p style={styles.cruLedgerHead}>The ledger</p>
            {ledger.map(r => {
              const p = r.payload || {}
              return (
                <div key={r.id} style={styles.cruLedgerItem}>
                  <span style={styles.cruLedgerProof}>{p.proof || p.text}</span>
                  {p.cost ? <span style={styles.cruLedgerCost}>Cost — {p.cost}</span> : null}
                </div>
              )
            })}
          </div>
        )}
      </ActivitySheet>
    </>
  )
}

// ===================================================================
// MECHANIC 4: THE BLINDSPOT RADAR
// ===================================================================
function BlindspotRadarTile({ today, onSave }) {
  const [open, setOpen] = useState(false)
  const [ghosts, setGhosts] = useState(() => (today && today.payload && today.payload.ghosts) || [])
  const [saving, setSaving] = useState(false)

  const toggle = (key) => setGhosts(prev => prev.includes(key) ? prev.filter(g => g !== key) : [...prev, key])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const ok = await onSave(ghosts)
    setSaving(false)
    if (ok) setOpen(false)
    else alert('Could not save. Please try again.')
  }

  const summary = today
    ? (today.payload?.ghosts?.length
        ? `${today.payload.ghosts.length} flagged today — worth watching`
        : 'Scanned today · nothing drifting')
    : 'Catch the drift before it becomes an urge.'

  return (
    <>
      <Launcher icon="📡" title="Blindspot radar"
        summary={summary} done={!!today} onOpen={() => setOpen(true)} />

      <ActivitySheet open={open} onClose={() => setOpen(false)}
        eyebrow="Pre-relapse detection" title="Where's the drift today?">
        <p style={styles.sheetLead}>
          A slip in maintenance starts weeks early — as a quiet thought, not an urge. Tap any
          ghost you felt today. Naming it strips its cover.
        </p>

        <div style={styles.bsGrid}>
          {GHOSTS.map(g => {
            const on = ghosts.includes(g.key)
            return (
              <button key={g.key} onClick={() => toggle(g.key)}
                style={{ ...styles.bsCell, ...(on ? styles.bsCellOn : {}) }}>
                <span style={{ ...styles.bsCellLabel, ...(on ? styles.bsCellLabelOn : {}) }}>{g.label}</span>
                <span style={{ ...styles.bsCellSub, ...(on ? styles.bsCellSubOn : {}) }}>{g.sub}</span>
              </button>
            )
          })}
        </div>

        <button onClick={handleSave} disabled={saving} style={styles.sheetSaveBtn}>
          {saving ? 'Saving…' : ghosts.length ? `Log ${ghosts.length} flagged` : 'Log a clear scan'}
        </button>
      </ActivitySheet>
    </>
  )
}

// ===================================================================
// TILE: ANCHORS
// ===================================================================
function AnchorsTile({ navigate }) {
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
      <h3 style={styles.anchorsTitle}>The people who'd notice.</h3>
      <p style={styles.anchorsBody}>
        Here, anchors are less about crisis and more about staying connected.
        Keep the list reflecting who's actually in your life.
      </p>
      <button onClick={() => navigate('/anchors')} style={styles.anchorsBtnNew}>
        Open Anchors
      </button>
    </div>
  )
}

// ===================================================================
// TILE: ACTION (urge/slip safety net — matches Endure)
// ===================================================================
function ActionTile({ tracker, navigate, slipCount = 0, onMoveToReclaim, onLogUrge }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>If it gets loud</p>
      <h2 style={styles.tileTitle}>Urge Incoming</h2>
      <p style={styles.tileBody}>
        Name how it's coming at you — a sudden spike, or a slow creep. That alone takes some of its power.
      </p>

      <div style={styles.velocityRow}>
        <button onClick={() => onLogUrge('spike')} style={{ ...styles.velocityBtn, ...styles.velocitySpike }}>
          <span style={styles.velocityIcon}>⚡</span>
          <span style={styles.velocityLabel}>Sudden spike</span>
          <span style={styles.velocitySub}>a trigger hit</span>
        </button>
        <button onClick={() => onLogUrge('creep')} style={{ ...styles.velocityBtn, ...styles.velocityCreep }}>
          <span style={styles.velocityIcon}>🌫️</span>
          <span style={styles.velocityLabel}>Slow creep</span>
          <span style={styles.velocitySub}>worn down, tired</span>
        </button>
      </div>

      <button onClick={() => navigate(`/slip/${tracker.id}`)} style={styles.slipFallbackBtn}>
        I slipped
      </button>
      <p style={styles.tileHelperText}>
        Rare doesn't mean impossible. The tools are still here.
      </p>

      {slipCount > 0 && (
        <div style={styles.slipProgress}>
          <div style={styles.slipDots}>
            {[1, 2, 3].map(n => (
              <span key={n} style={{ ...styles.slipDot, ...(slipCount >= n ? styles.slipDotOn : {}) }} />
            ))}
          </div>
          <span style={styles.slipProgressText}>
            {Math.min(slipCount, 3)} of 3 slips this stretch
          </span>
        </div>
      )}

      {slipCount >= 3 && (
        <div style={styles.reclaimNudge}>
          <p style={styles.reclaimNudgeText}>
            Three slips this stretch. That's not a failure — it's a sign the ground shifted under you. Reclaim is a gentler place to regroup, and everything you've built stays exactly where it is. If you're honest with yourself, it might be time to step back.
          </p>
          <button onClick={onMoveToReclaim} style={styles.reclaimNudgeBtn}>
            Move to Reclaim
          </button>
        </div>
      )}
    </div>
  )
}

// ===================================================================
// HELPERS
// ===================================================================
function getMondayOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDateForDB(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ===================================================================
// STYLES
// ===================================================================
const styles = {
  // --- launchers (floating-card triggers) ---
  launcher: { display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', background: 'linear-gradient(155deg, #6E3A1C 0%, #3A2415 100%)', borderRadius: '18px', padding: '16px 18px', boxShadow: '0 6px 18px rgba(40,25,10,0.18)', fontFamily: 'inherit' },
  launcherTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  launcherIcon: { fontSize: '22px', lineHeight: 1 },
  launcherChip: { fontSize: '11px', fontWeight: 600, color: 'rgba(250,247,241,0.85)', background: 'rgba(250,247,241,0.12)', border: '0.5px solid rgba(250,247,241,0.22)', borderRadius: '20px', padding: '4px 10px', fontFamily: 'Georgia, serif' },
  launcherChipDone: { color: '#DFF0C2', background: 'rgba(120,160,60,0.22)', border: '0.5px solid rgba(180,210,130,0.4)' },
  launcherTitle: { fontSize: '17px', fontWeight: 600, color: '#FAF7F1', fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  launcherSummary: { fontSize: '12.5px', color: 'rgba(250,247,241,0.72)', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.45 },

  // --- floating card (sheet) ---
  sheetBackdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(40,25,15,0.55)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', zIndex: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px' },
  sheetCard: { width: '100%', maxWidth: '430px', maxHeight: '88vh', overflowY: 'auto', background: '#FCFAF5', borderRadius: '22px', padding: '20px 20px 22px', boxShadow: '0 24px 70px rgba(40,25,15,0.4)' },
  sheetHead: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' },
  sheetEyebrow: { fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A07A3C', fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  sheetTitle: { fontSize: '19px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.25 },
  sheetClose: { flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', border: '0.5px solid #E0D5C2', background: 'white', color: '#6B5C4A', fontSize: '13px', cursor: 'pointer', lineHeight: 1 },
  sheetLead: { fontSize: '13.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: '0 0 16px' },
  sheetSaveBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FBF6EE', border: 'none', borderRadius: '13px', fontSize: '14px', fontWeight: 500, fontFamily: 'Georgia, serif', cursor: 'pointer', marginTop: '4px' },
  saveBtnDim: { opacity: 0.45, cursor: 'not-allowed' },

  // --- capital drain ---
  cdPool: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '16px', borderRadius: '16px', background: 'linear-gradient(180deg, #FBEDE6 0%, #F6E2D6 100%)', border: '0.5px solid #E6C3AE', marginBottom: '16px' },
  cdPoolSafe: { background: 'linear-gradient(180deg, #F5E9D4 0%, #EEDFC2 100%)', border: '0.5px solid #D8BC85' },
  cdPoolNum: { fontSize: '30px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  cdPoolLabel: { fontSize: '11.5px', fontFamily: 'Georgia, serif', textAlign: 'center', lineHeight: 1.4 },
  cdPoolLabelRisk: { color: '#B23B12', fontWeight: 600 },
  cdPoolLabelSafe: { color: '#5A3A12', fontStyle: 'italic' },
  cdBucketList: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' },
  cdBucketRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'white', border: '0.5px solid #EFE7D7', borderRadius: '13px' },
  cdBucketIcon: { fontSize: '20px', lineHeight: 1, flexShrink: 0 },
  cdBucketInfo: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' },
  cdBucketLabel: { fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.2 },
  cdBucketSub: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  cdStepper: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  cdStepBtn: { width: '30px', height: '30px', borderRadius: '50%', border: '0.5px solid #DDCFB6', background: '#FBF6EE', color: '#854F0B', fontSize: '17px', lineHeight: 1, cursor: 'pointer', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cdStepBtnDim: { opacity: 0.32, cursor: 'not-allowed' },
  cdStepVal: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums', minWidth: '28px', textAlign: 'center' },

  // --- stress pillars ---
  stressWrap: { padding: '14px', borderRadius: '14px', background: '#FBF6EE', border: '0.5px solid #EFE7D7', marginBottom: '14px' },
  stressLabelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' },
  stressCap: { fontSize: '12.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif' },
  stressVal: { fontSize: '13px', color: '#854F0B', fontFamily: 'Georgia, serif', fontWeight: 600 },
  stressSlider: { width: '100%', accentColor: '#854F0B' },
  stressEnds: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginTop: '2px' },
  pillarList: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' },
  pillarBtn: { position: 'relative', overflow: 'hidden', width: '100%', border: '0.5px solid #DDCFB6', borderRadius: '13px', background: 'white', padding: 0, cursor: 'pointer', fontFamily: 'inherit', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' },
  pillarBtnLocked: { border: '1px solid #C99A4E', background: 'linear-gradient(180deg, #F5E9D4 0%, #EEDFC2 100%)' },
  pillarFill: { position: 'absolute', top: 0, left: 0, bottom: 0, background: 'linear-gradient(180deg, #F0E0C4 0%, #E6D0A8 100%)', transition: 'width 0.03s linear', zIndex: 0 },
  pillarBtnInner: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' },
  pillarBtnText: { display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' },
  pillarLabel: { fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500 },
  pillarLabelLocked: { color: '#5A3A12' },
  pillarSub: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  pillarSubLocked: { color: '#8A7558' },
  pillarState: { fontSize: '11.5px', fontWeight: 600, color: '#9C8C78', fontFamily: 'Georgia, serif', flexShrink: 0 },
  pillarStateLocked: { color: '#3B6D11' },
  pillarBadge: { fontSize: '12px', color: '#5A3A12', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '4px 0 10px', lineHeight: 1.4 },
  pillarHint: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '10px 0 0', lineHeight: 1.4 },

  // --- the crucible ---
  cruLabel: { display: 'block', fontSize: '11px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 6px' },
  cruInput: { width: '100%', boxSizing: 'border-box', padding: '12px 14px', background: 'white', border: '0.5px solid #DDCFB6', borderRadius: '12px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', outline: 'none', marginBottom: '14px' },
  cruPips: { display: 'flex', gap: '8px', justifyContent: 'center', margin: '0 0 12px' },
  cruPip: { width: '10px', height: '10px', borderRadius: '50%', background: '#E8DFD0', border: '0.5px solid #DDCFB6' },
  cruPipOn: { background: 'linear-gradient(180deg, #C8893C 0%, #9A4E1A 100%)', border: '0.5px solid #9A4E1A', boxShadow: '0 0 0 3px rgba(154,78,26,0.14)' },
  cruForgeBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #6E3A1C 0%, #3A2415 100%)', color: '#FBF6EE', border: 'none', borderRadius: '13px', fontSize: '14px', fontWeight: 600, fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 4px 14px rgba(40,25,10,0.22)' },
  cruForgeBtnDim: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  cruLedger: { marginTop: '18px', borderTop: '0.5px solid #EFE7D7', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' },
  cruLedgerHead: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0 },
  cruLedgerItem: { display: 'flex', flexDirection: 'column', gap: '2px', padding: '10px 12px', background: '#FBF6EE', border: '0.5px solid #EFE7D7', borderRadius: '11px' },
  cruLedgerProof: { fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.4, fontWeight: 500 },
  cruLedgerCost: { fontSize: '12px', color: '#8A6A3C', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4 },

  // --- blindspot radar ---
  bsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '4px' },
  bsCell: { display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start', textAlign: 'left', padding: '14px', borderRadius: '14px', background: 'white', border: '0.5px solid #E8DFD0', cursor: 'pointer', fontFamily: 'inherit' },
  bsCellOn: { background: 'linear-gradient(180deg, #F7E6DA 0%, #F2D9C8 100%)', border: '1px solid #C5572C' },
  bsCellLabel: { fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 600 },
  bsCellLabelOn: { color: '#8A3B18' },
  bsCellSub: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.35 },
  bsCellSubOn: { color: '#A8542F' },

  // --- urge velocity (matches Endure) ---
  velocityRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  velocityBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px', padding: '14px', border: 'none', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', boxShadow: '0 4px 14px rgba(40,25,10,0.12)' },
  velocitySpike: { background: 'linear-gradient(180deg, #6E3A1C 0%, #3A2415 100%)' },
  velocityCreep: { background: 'linear-gradient(180deg, #4A4038 0%, #2A241E 100%)' },
  velocityIcon: { fontSize: '20px', lineHeight: 1 },
  velocityLabel: { fontSize: '14px', fontWeight: 600, color: '#FAF7F1', fontFamily: 'Georgia, serif' },
  velocitySub: { fontSize: '11px', color: 'rgba(250,247,241,0.7)', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  slipFallbackBtn: { width: '100%', padding: '11px', background: 'transparent', color: '#9C6B3C', border: '0.5px solid #E0CDB0', borderRadius: '11px', fontSize: '13px', fontWeight: 500, fontFamily: 'Georgia, serif', cursor: 'pointer' },

  // --- slip progress + voluntary reclaim ---
  slipProgress: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', paddingTop: '14px', borderTop: '0.5px solid #EFE7D7' },
  slipDots: { display: 'flex', gap: '5px', flexShrink: 0 },
  slipDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#E8DFD0', border: '0.5px solid #DDCFB6' },
  slipDotOn: { background: '#C5572C', border: '0.5px solid #A8461F' },
  slipProgressText: { fontSize: '11.5px', color: '#8A6A3C', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4 },
  reclaimNudge: { marginTop: '14px', padding: '14px', borderRadius: '14px', background: 'linear-gradient(180deg, #FFFBF4 0%, #FBF1E2 100%)', border: '0.5px solid #EAD9BE' },
  reclaimNudgeText: { fontSize: '12.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 12px' },
  reclaimNudgeBtn: { width: '100%', padding: '12px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '11px', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.22)' },

  // --- slim perpetual counter ---
  slimCounter: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: '#FBF6EE', border: '0.5px solid #EFE7D7', borderRadius: '999px', alignSelf: 'flex-start' },
  slimDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#7E9B5A', flexShrink: 0, boxShadow: '0 0 0 3px rgba(126,155,90,0.18)' },
  slimDays: { fontSize: '13px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif' },
  slimClock: { fontSize: '12px', color: '#854F0B', fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' },
  slimFree: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' },

  // --- gentle daily check-in ---
  tileLogged: { background: 'linear-gradient(180deg, #F6FAE9 0%, #ECF3D5 100%)', border: '0.5px solid #C2D49A' },
  checkinSummaryRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  moodPill: { width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)' },
  checkinSummaryMood: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 2px', lineHeight: 1.3 },
  checkinSummarySub: { fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.4 },
  checkinEditBtn: { background: 'transparent', border: 'none', color: '#3B6D11', fontSize: '12px', fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer', padding: 0 },
  checkinCtaBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)' },

  // --- anchors ---
  anchorsTile: { background: 'linear-gradient(180deg, #FFFBF4 0%, #FBF1E2 100%)', border: '0.5px solid #EEDFC8', borderRadius: '18px', padding: '18px 18px 16px', boxShadow: '0 4px 16px rgba(120,80,30,0.07)' },
  anchorsTop: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' },
  anchorsGlyph: { display: 'flex', alignItems: 'center' },
  anchorsDot: { width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #FBF1E2', boxShadow: '0 1px 2px rgba(80,50,20,0.15)' },
  anchorsTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.3, margin: '0 0 8px' },
  anchorsBody: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 14px' },
  anchorsBtnNew: { width: '100%', padding: '13px', background: 'rgba(255,255,255,0.7)', color: '#9A4E1A', border: '0.5px solid #E3C9A3', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif', boxShadow: '0 2px 8px rgba(120,80,30,0.06)' },

  // --- frame / shell ---
  frame: { minHeight: '100vh', background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)', padding: '2rem 1rem', display: 'flex', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  phone: { background: '#FAF7F1', maxWidth: '440px', width: '100%', borderRadius: '28px', padding: '1.5rem 1.25rem 1.5rem', boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)', display: 'flex', flexDirection: 'column', gap: '14px' },
  loadingPhone: { background: '#FAF7F1', maxWidth: '440px', width: '100%', borderRadius: '28px', padding: '5rem 2rem', textAlign: 'center', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', boxShadow: '0 14px 40px rgba(60,40,20,0.10)' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' },
  brandLine: { fontSize: '20px', fontWeight: 500, color: '#2A1F15', margin: 0, fontFamily: 'Georgia, serif', letterSpacing: '-0.01em' },
  profileBtn: { background: 'transparent', border: 'none', color: '#854F0B', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  // --- generic tile ---
  tile: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)', border: '0.5px solid #E8DFD0', borderRadius: '18px', padding: '18px 18px 16px', boxShadow: '0 4px 16px rgba(80,50,20,0.06)' },
  tileEyebrow: { fontSize: '10.5px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 10px' },
  tileTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.3, margin: '0 0 12px' },
  tileBody: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 14px' },
  tileHelperText: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '12px 0 0', textAlign: 'center' },
  tileSecondaryBtn: { padding: '12px 18px', background: 'white', color: '#2A1F15', border: '0.5px solid #DDCFB6', borderRadius: '12px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(80,50,20,0.05)' },

  // --- greeting ---
  greetingTile: { textAlign: 'left', padding: '8px 4px 4px' },
  greetingEyebrow: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.24em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 8px' },
  greetingTitle: { fontSize: '26px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.2, margin: '0 0 10px', letterSpacing: '-0.01em' },
  greetingSubtitle: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: 0 },
  substanceEm: { color: '#854F0B', fontWeight: 500, fontStyle: 'italic' },
}