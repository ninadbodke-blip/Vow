import { useEffect, useState, useRef } from 'react'
import VowPathInvite from './VowPathInvite'
import StageWayfinder from './StageWayfinder'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import SheetPortal from '../../components/SheetPortal'
import VowBrandMark from '../../components/VowBrandMark'
import QuickLogModal from './QuickLogModal'
import DailyCheckin from './DailyCheckin'
import JournalTile from './JournalTile'
import { TodayCheckinTile, AwarenessStripTile } from './CheckinTiles'
import BottomNav from '../../components/BottomNav'

// ===================================================================
// NOTICE-FREE HOME  (v2 — capture-rich)
// ===================================================================
// Stage: Notice (precontemplation). User hasn't decided anything is wrong.
// Tone: curious, observational, no pressure, no judgment.
//
// NEW in v2 — the daily check-in (free_daily_checkins) is the hero:
// mood / energy / did-the-pull-show-up / what-was-around / body signals.
// It feeds the Mirror. A 7-day awareness strip (mood-coloured, NOT an
// abstinence streak) and an evolved in-home Daily Mirror sit beneath it.
//
// Preserved: Quick Log (instance logs), Week Meter, daily prompt, recents.
// ===================================================================

const MIRROR_UNLOCK_AT = 5         // in-home pattern threshold (instance logs)
const CHECKIN_INSIGHT_AT = 5       // in-home pattern threshold (check-ins)

const TIME_LABELS = {
  morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', late_night: 'Late night',
}
const CHECKIN_CONTEXT_LABELS = {
  stress: 'stress', lonely: 'loneliness', bored: 'boredom', social: 'social settings',
  tired: 'tiredness', conflict: 'conflict', restless: 'restlessness', celebration: 'celebration',
  nothing: 'nothing nameable',
}
const TIME_BUCKETS = ['morning', 'afternoon', 'evening', 'late_night']

// Daily reflective line — rotates by date, no pressure, observational.
const NOTICE_REFLECTIONS = [
  'Noticing changes nothing and everything. You’re just learning to see.',
  'No need to fix what you’re only beginning to look at.',
  'The fact that you opened this today is itself a kind of answer.',
  'You’re allowed to just watch for a while.',
  'Patterns don’t judge. They show up when you pay attention.',
  'Whatever you find in here, it was already true. Now you can see it.',
  'Curiosity is gentler than willpower, and it lasts a lot longer.',
  'Some days the weather’s heavy. Logging it doesn’t make it heavier.',
]

// ===================================================================
// DAILY PROMPT BANK (preserved)
// ===================================================================
const NOTICE_PROMPTS = [
  { id: 'when_today', question: 'When did it come up today?',
    options: ['Morning', 'Afternoon', 'Evening', 'Late night', 'Not yet today', "Don't remember"] },
  { id: 'how_after', question: 'How did you feel after, the last time?',
    options: ['Relieved', 'Numb', 'Regretful', 'Indifferent', 'Tired', "Don't remember"] },
  { id: 'what_pulled', question: 'What pulled you toward it, last time?',
    options: ['Stress', 'Boredom', 'Habit / time of day', 'Social setting', 'Hard emotion', 'Just happened'] },
  { id: 'who_around', question: 'Who was around when it happened, last time?',
    options: ['Alone', 'With friends', 'With family', 'With partner', 'At work', 'Other'] },
  { id: 'did_plan', question: 'Did you plan it, or did it just happen?',
    options: ['I planned it', 'It just happened', 'Somewhere in between', "Don't remember"] },
  { id: 'cost_today', question: 'What did it cost you today?',
    options: ['Time', 'Money', 'Energy', 'Sleep', 'Nothing I can name', 'Not sure yet'] },
  { id: 'thought_after', question: 'What did you think about it afterward?',
    options: ['That was fine', 'That was too much', "I shouldn't have", "Didn't think about it", 'Mixed feelings'] },
  { id: 'where_mind', question: 'Where did your mind go right before?',
    options: ['Replaying something', 'Avoiding something', 'Just restless', 'Wanting a break', 'Nowhere — habit', 'Not sure'] },
  { id: 'how_long', question: 'How long did the urge last today?',
    options: ['Seconds', 'A few minutes', 'On and off all day', 'Still here', "Didn't really notice"] },
  { id: 'what_helped', question: 'Did anything make it quieter today?',
    options: ['Moving / a walk', 'Talking to someone', 'A distraction', 'Waiting it out', 'Nothing I tried', "Didn't need to"] },
  { id: 'first_reach', question: 'What was the first thing you reached for today?',
    options: ['My phone', 'Coffee / a drink', 'The habit', 'Food', 'Nothing in particular', "Don't remember"] },
  { id: 'noticed_more', question: 'Did you notice it more or less than usual?',
    options: ['A lot more', 'A bit more', 'About the same', 'Less', 'Hard to say'] },
]

const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

const LogGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8.5v7M8.5 12h7" />
  </svg>
)
const AnchorGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2.2" />
    <path d="M12 7.2V21M5 13a7 7 0 0 0 14 0M3 13h2m14 0h2" />
  </svg>
)
const EyeGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
)

function localDateStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// ===================================================================
// MAIN COMPONENT
// ===================================================================
export default function NoticeFreeHome({ progress }) {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [logs, setLogs] = useState([])
  const [totalLogCount, setTotalLogCount] = useState(0)
  const [recentNoticings, setRecentNoticings] = useState([])
  const [todayPromptLogged, setTodayPromptLogged] = useState(false)

  // check-in state
  const [todayCheckin, setTodayCheckin] = useState(null)
  const [recentCheckins, setRecentCheckins] = useState([])
  const [checkinCount, setCheckinCount] = useState(0)
  const [checkinOpen, setCheckinOpen] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [surfaceOpen, setSurfaceOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles').select('first_name, full_name').eq('id', user.id).maybeSingle()
      if (profile?.first_name) setFirstName(profile.first_name)
      else if (profile?.full_name) setFirstName(profile.full_name.split(' ')[0])
      else if (user.email) setFirstName(user.email.split('@')[0])

      // ---- daily check-ins (new primary signal) ----
      const today = localDateStr()
      const { data: tc } = await supabase
        .from('free_daily_checkins').select('*')
        .eq('user_id', user.id).eq('checkin_date', today).maybeSingle()
      if (tc) setTodayCheckin(tc)

      const { data: rc } = await supabase
        .from('free_daily_checkins').select('*')
        .eq('user_id', user.id).order('checkin_date', { ascending: false }).limit(14)
      if (rc) setRecentCheckins(rc)

      const { count: cc } = await supabase
        .from('free_daily_checkins').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      if (cc !== null) setCheckinCount(cc)

      // ---- instance logs (preserved) ----
      const { data: logsData } = await supabase
        .from('free_instance_logs').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
      if (logsData) setLogs(logsData)

      const { count } = await supabase
        .from('free_instance_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      if (count !== null) setTotalLogCount(count)

      // ---- daily prompt history (preserved) ----
      const { data: noticings } = await supabase
        .from('free_noticings').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
      if (noticings) {
        setRecentNoticings(noticings)
        const t = new Date().toDateString()
        setTodayPromptLogged(noticings.some(n => new Date(n.created_at).toDateString() === t))
      }

      setLoading(false)
    }
    load()
  }, [])

  const handleLogged = (newLog) => {
    setLogs(prev => [newLog, ...prev].slice(0, 50))
    setTotalLogCount(prev => prev + 1)
  }

  const handleCheckinSaved = (row) => {
    const wasNew = !todayCheckin
    setTodayCheckin(row)
    setRecentCheckins(prev => {
      const without = prev.filter(c => c.checkin_date !== row.checkin_date)
      return [row, ...without].slice(0, 14)
    })
    if (wasNew) setCheckinCount(prev => prev + 1)
  }

  if (loading) {
    return (
      <div style={styles.frame}><div style={styles.loadingPhone}>Loading...</div></div>
    )
  }

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const reflection = NOTICE_REFLECTIONS[new Date().getDate() % NOTICE_REFLECTIONS.length]

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* WAYFINDING HEADER */}
        <div style={styles.topBar}>
          <VowBrandMark />
          <StageWayfinder progress={progress} />
          <button onClick={() => navigate('/app/profile')} style={styles.profileBtn} aria-label="Profile">
            <ProfileIcon />
          </button>
        </div>

        {/* HERO — today (dark vault, stateful) */}
        <div style={styles.hero}>
          <p style={styles.heroEyebrow}>A closer look · Today</p>
          <p style={styles.heroGreeting}>{greet}{firstName ? `, ${firstName}` : ''}.</p>
          <p style={styles.heroReflection}>{reflection}</p>
          {todayCheckin ? (
            <div style={styles.heroDoneRow}>
              <span style={styles.heroDoneTick}>✓</span>
              <span style={styles.heroDoneText}>You’ve checked in today.</span>
              <button onClick={() => setCheckinOpen(true)} style={styles.heroUpdate}>Update</button>
            </div>
          ) : (
            <button onClick={() => setCheckinOpen(true)} style={styles.heroCta}>Check in for today</button>
          )}
        </div>

        {/* SECTION — the daily noticing work */}
        <div style={styles.sectionWrap}>
          <div style={styles.sectionHeader}>
            <p style={styles.sectionTitle}>Today’s noticing</p>
            <p style={styles.sectionHint}>Small observations. No pressure to change anything yet.</p>
          </div>
          <AutopilotAuditTile />
          <ContextRadarTile />
          <RoiDeltaTile />
          <NoticePromptTile
            todayLogged={todayPromptLogged}
            onLogged={(newNoticing) => {
              setRecentNoticings(prev => [newNoticing, ...prev].slice(0, 5))
              setTodayPromptLogged(true)
            }}
          />
        </div>

        {/* SECTION — reflect */}
        <div style={styles.sectionWrap}>
          <div style={styles.sectionHeader}>
            <p style={styles.sectionTitle}>In your words</p>
          </div>
          <JournalTile stage="notice" />
        </div>

        {/* TOOLS — floating glyph toolkit (no boxes) */}
        <div style={styles.sectionWrap}>
          <p style={styles.toolkitLabel}>Tools</p>
          <div style={styles.toolkit}>
            <button onClick={() => setModalOpen(true)} style={styles.toolBtn}>
              <span style={styles.toolIcon}><LogGlyph /></span>
              <span style={styles.toolLabel}>Log a moment</span>
            </button>
            <CaughtMyselfTile />
          </div>
        </div>

        {/* WHAT'S SURFACING — collapsible insights */}
        <div style={styles.sectionWrap}>
          <button onClick={() => setSurfaceOpen(o => !o)} style={styles.surfaceToggle}>
            <span style={styles.surfaceToggleText}>
              <span style={styles.sectionTitle}>What’s surfacing</span>
              <span style={styles.surfaceHint}>Your 7-day mood, your week, your recent answers</span>
            </span>
            <span style={styles.surfaceChevron}>{surfaceOpen ? '⌄' : '›'}</span>
          </button>
          {surfaceOpen && (
            <div style={styles.surfaceBody}>
              <AwarenessStripTile checkins={recentCheckins} />
              {logs.length > 0 && <WeekMeterTile logs={logs} />}
              {recentNoticings.length > 0 && <RecentNoticingsTile noticings={recentNoticings} />}
              <button onClick={() => navigate('/app/mirror')} style={styles.oracleLink}>
                Your full reflection lives in the Oracle <span style={styles.oracleLinkArrow}>→</span>
              </button>
            </div>
          )}
          <VowPathInvite stage="notice" variant="calm" />
        </div>

        <BottomNav />
      </div>

      <DailyCheckin
        isOpen={checkinOpen}
        onClose={() => setCheckinOpen(false)}
        stage="notice"
        includeBody
        existing={todayCheckin}
        onSaved={handleCheckinSaved}
      />
      <QuickLogModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onLogged={handleLogged} />
    </div>
  )
}

// ===================================================================
// TILE: GREETING (preserved)
// ===================================================================
function GreetingTile({ firstName, substanceLabel }) {
  const hour = new Date().getHours()
  let timeGreeting = 'Hello'
  if (hour < 12) timeGreeting = 'Good morning'
  else if (hour < 18) timeGreeting = 'Good afternoon'
  else timeGreeting = 'Good evening'

  return (
    <div style={styles.greetingTile}>
      <p style={styles.greetingEyebrow}>NOTICE</p>
      <h1 style={styles.greetingTitle}>
        {timeGreeting}{firstName ? `, ${firstName}` : ''}.
      </h1>
      <p style={styles.greetingSubtitle}>
        Watching the patterns around <em style={styles.substanceEm}>{substanceLabel}</em>.
        No pressure to decide anything yet.
      </p>
    </div>
  )
}


// ===================================================================
// TILE: DAILY MIRROR (in-home reflection, gated, new)
// ===================================================================
function DailyMirrorTile({ checkins, checkinCount, logs }) {
  const todayKey = new Date().toDateString()
  const line = NOTICE_REFLECTIONS[Math.abs(hashString(todayKey)) % NOTICE_REFLECTIONS.length]
  const ready = checkinCount >= CHECKIN_INSIGHT_AT

  return (
    <div style={styles.tile}>
      <div style={styles.mirrorOrnament}>· · ·</div>
      <p style={styles.mirrorEyebrow}>THE DAILY MIRROR</p>
      <p style={styles.reflectionLine}>{line}</p>

      {ready ? (
        <PatternRows checkins={checkins} logs={logs} />
      ) : (
        <p style={styles.tileHelperText}>
          Patterns will surface here as you check in &mdash; {CHECKIN_INSIGHT_AT - checkinCount} more to go.
        </p>
      )}
    </div>
  )
}

function PatternRows({ checkins, logs }) {
  const rows = []

  // Most common context around it
  const topCtx = countArrayField(checkins, 'contexts', ['nothing'])
  if (topCtx.value) {
    rows.push({
      label: 'Most around it',
      value: CHECKIN_CONTEXT_LABELS[topCtx.value] || topCtx.value,
      percent: topCtx.percent,
    })
  }

  // Mood lean
  const scored = checkins.filter(c => c.mood_score != null)
  if (scored.length >= 3) {
    const avg = scored.reduce((s, c) => s + c.mood_score, 0) / scored.length
    let phrase
    if (avg < 2.5) phrase = 'leaning heavy lately'
    else if (avg < 3.5) phrase = 'mostly flat lately'
    else if (avg < 4.5) phrase = 'steadier than you might think'
    else phrase = 'lighter than you might expect'
    rows.push({ label: 'Mood', value: phrase, percent: null })
  }

  // Pull frequency
  const withPull = checkins.filter(c => c.felt_pull != null)
  if (withPull.length >= 3) {
    const felt = withPull.filter(c => c.felt_pull).length
    rows.push({
      label: 'The pull',
      value: `showed up ${felt} of ${withPull.length} recent days`,
      percent: null,
    })
  }

  if (rows.length === 0) {
    return <p style={styles.tileHelperText}>Keep checking in &mdash; the picture is still forming.</p>
  }

  return (
    <>
      <div style={styles.mirrorList}>
        {rows.map((r, i) => (
          <div key={i} style={styles.mirrorRow}>
            <p style={styles.mirrorRowLabel}>{r.label}</p>
            <p style={styles.mirrorRowValue}>
              {r.value}
              {r.percent != null && <span style={styles.mirrorRowPercent}> &middot; {r.percent}%</span>}
            </p>
          </div>
        ))}
      </div>
      <p style={styles.mirrorFoot}>The looking is the work.</p>
    </>
  )
}

// ===================================================================
// TILE: QUICK LOG (preserved; footer softened)
// ===================================================================
function QuickLogTile({ logs, totalLogCount, onOpen }) {
  const todayCount = logs.filter(l =>
    new Date(l.created_at).toDateString() === new Date().toDateString()
  ).length

  let footerText
  if (totalLogCount === 0) footerText = 'For the moments worth marking specifically.'
  else if (todayCount === 0) footerText = 'Nothing logged today.'
  else if (todayCount === 1) footerText = '1 moment logged today.'
  else footerText = `${todayCount} moments logged today.`

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Also</p>
      <h2 style={styles.tileTitle}>Log a moment</h2>
      <p style={styles.tileBody}>
        20 seconds &mdash; when, where, how it felt. Separate from your daily check-in.
      </p>
      <button onClick={onOpen} style={styles.quickLogBtnGhost}>+ I just did it</button>
      <p style={styles.tileHelperText}>{footerText}</p>
    </div>
  )
}

// ===================================================================
// TILE: WEEK METER (preserved)
// ===================================================================
function WeekMeterTile({ logs }) {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const thisWeekLogs = logs.filter(l => new Date(l.created_at) >= sevenDaysAgo)
  const lastWeekLogs = logs.filter(l => {
    const d = new Date(l.created_at)
    return d >= fourteenDaysAgo && d < sevenDaysAgo
  })

  const thisCount = thisWeekLogs.length
  const lastCount = lastWeekLogs.length
  const delta = thisCount - lastCount

  const distribution = {}
  for (const bucket of TIME_BUCKETS) distribution[bucket] = 0
  for (const log of thisWeekLogs) {
    if (distribution[log.time_of_day] !== undefined) distribution[log.time_of_day] += 1
  }
  const maxBucket = Math.max(...Object.values(distribution), 1)

  let deltaText, deltaArrow, deltaColor
  if (lastCount === 0 && thisCount === 0) { deltaText = 'No comparison yet.'; deltaArrow = ''; deltaColor = '#9C8C78' }
  else if (lastCount === 0) { deltaText = 'First 7 days of logging.'; deltaArrow = ''; deltaColor = '#9C8C78' }
  else if (delta > 0) { deltaText = `${delta} more than previous 7 days`; deltaArrow = '\u25b2'; deltaColor = '#C5572C' }
  else if (delta < 0) { deltaText = `${Math.abs(delta)} fewer than previous 7 days`; deltaArrow = '\u25bc'; deltaColor = '#3B6D11' }
  else { deltaText = 'Same as previous 7 days'; deltaArrow = '\u00b7'; deltaColor = '#9C8C78' }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Logged moments &middot; last 7 days</p>
      <div style={styles.meterCountRow}>
        <p style={styles.meterCount}>{thisCount}</p>
        <p style={styles.meterCountLabel}>{thisCount === 1 ? 'moment' : 'moments'}</p>
      </div>
      <p style={{ ...styles.meterDelta, color: deltaColor }}>
        {deltaArrow && <span style={{ marginRight: '4px' }}>{deltaArrow}</span>}{deltaText}
      </p>

      {thisCount > 0 && (
        <>
          <p style={styles.meterDistHeading}>Time of day</p>
          <div style={styles.meterDistList}>
            {TIME_BUCKETS.map(bucket => {
              const count = distribution[bucket]
              const pct = (count / maxBucket) * 100
              return (
                <div key={bucket} style={styles.meterDistRow}>
                  <span style={styles.meterDistLabel}>{TIME_LABELS[bucket]}</span>
                  <div style={styles.meterDistBarBg}>
                    <div style={{ ...styles.meterDistBarFill, width: `${pct}%` }} />
                  </div>
                  <span style={styles.meterDistCount}>{count}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ===================================================================
// TILE: DAILY PROMPT (preserved)
// ===================================================================
// ===================================================================
// ACTIVITY SHEET + LAUNCHER — clean home, options live in floating cards
// ===================================================================
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
          {done ? 'Logged ✓' : 'Open ›'}
        </span>
      </div>
      <h2 style={styles.launcherTitle}>{title}</h2>
      <p style={styles.launcherSummary}>{summary}</p>
    </button>
  )
}

// ===================================================================
// TILE: AUTOPILOT AUDIT — how awake was the choice?
// ===================================================================
const AUTOPILOT_LABELS = { 1: 'Total autopilot', 2: 'Barely there', 3: 'Half-aware', 4: 'Mostly present', 5: 'Fully conscious' }
const AUTOPILOT_BEFORE = ['Scrolling', 'Working', 'Eating', 'With people', 'Winding down', 'Stressed about something', 'Just woke up', 'Nothing / idle']

function AutopilotAuditTile() {
  const [open, setOpen] = useState(false)
  const [level, setLevel] = useState(3)
  const [beforeAct, setBeforeAct] = useState(null)
  const [rowId, setRowId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedLevel, setSavedLevel] = useState(null)
  const [savedBefore, setSavedBefore] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('free_stage_signals')
        .select('id, payload').eq('user_id', user.id).eq('stage', 'notice')
        .eq('signal_type', 'notice_autopilot').eq('payload->>date', localDateStr())
        .order('created_at', { ascending: false }).limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row) {
        setRowId(row.id)
        if (row.payload?.level) { setLevel(row.payload.level); setSavedLevel(row.payload.level) }
        if (row.payload?.before_activity) { setBeforeAct(row.payload.before_activity); setSavedBefore(row.payload.before_activity) }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const done = savedLevel != null && savedBefore != null
  const summary = done ? `${AUTOPILOT_LABELS[savedLevel]} · ${savedBefore.toLowerCase()}` : 'How awake were you — and what came right before?'

  const handleSave = async () => {
    if (saving || !beforeAct) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { level, before_activity: beforeAct, date: localDateStr() }
    let ok = false
    if (rowId) { const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId); ok = !error }
    else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage: 'notice', signal_type: 'notice_autopilot', payload }).select('id').single()
      ok = !error && !!data; if (ok) setRowId(data.id)
    }
    setSaving(false)
    if (ok) { setSavedLevel(level); setSavedBefore(beforeAct); setOpen(false) } else alert('Could not save. Please try again.')
  }

  return (
    <>
      <Launcher icon="🌀" title="Autopilot audit" summary={summary} done={done} onOpen={() => setOpen(true)} />
      <ActivitySheet open={open} onClose={() => setOpen(false)} eyebrow="Awareness · today" title="How awake were you?">
        <p style={styles.sheetLead}>When the habit happened today, how conscious was the choice? No judgment — just notice.</p>
        <p style={styles.auditCurrent}>{AUTOPILOT_LABELS[level]}</p>
        <input type="range" min={1} max={5} step={1} value={level}
          onChange={(e) => setLevel(parseInt(e.target.value, 10))} style={styles.auditSlider} />
        <div style={styles.auditEnds}>
          <span>Total autopilot</span>
          <span>Fully conscious</span>
        </div>
        <p style={styles.nGroupLabel}>What were you doing right before?</p>
        <div style={styles.nPillWrap}>
          {AUTOPILOT_BEFORE.map(b => (
            <button key={b} onClick={() => setBeforeAct(b)} disabled={saving}
              style={{ ...styles.nPill, ...(beforeAct === b ? styles.nPillOn : {}) }}>{b}</button>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving || !beforeAct}
          style={{ ...styles.sheetSaveBtn, ...(!beforeAct ? styles.saveBtnDim : {}) }}>
          {saving ? 'Saving…' : 'Log this'}
        </button>
      </ActivitySheet>
    </>
  )
}

// ===================================================================
// TILE: CONTEXT RADAR — map the perimeter
// ===================================================================
const RADAR_LOCATIONS = ['Home', 'Work', 'Car / commute', 'Out / social', 'In bed', 'Bathroom', 'Somewhere else']
const RADAR_COMPANY = ['Alone', 'Partner', 'Family', 'Friends', 'Coworkers', 'Around strangers']
const RADAR_TIME = ['Morning', 'Midday', 'Evening', 'Late night']

function ContextRadarTile() {
  const [open, setOpen] = useState(false)
  const [location, setLocation] = useState(null)
  const [company, setCompany] = useState(null)
  const [timeOfDay, setTimeOfDay] = useState(null)
  const [rowId, setRowId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedLocation, setSavedLocation] = useState(null)
  const [savedCompany, setSavedCompany] = useState(null)
  const [savedTime, setSavedTime] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('free_stage_signals')
        .select('id, payload').eq('user_id', user.id).eq('stage', 'notice')
        .eq('signal_type', 'notice_context').eq('payload->>date', localDateStr())
        .order('created_at', { ascending: false }).limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row) {
        setRowId(row.id)
        setLocation(row.payload?.location || null); setSavedLocation(row.payload?.location || null)
        setCompany(row.payload?.company || null); setSavedCompany(row.payload?.company || null)
        setTimeOfDay(row.payload?.time_of_day || null); setSavedTime(row.payload?.time_of_day || null)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const done = savedLocation != null && savedCompany != null && savedTime != null
  const summary = done ? `${savedLocation} · ${savedCompany} · ${savedTime}` : 'Where, with whom, and when did it hit?'

  const handleSave = async () => {
    if (saving || !location || !company || !timeOfDay) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { location, company, time_of_day: timeOfDay, date: localDateStr() }
    let ok = false
    if (rowId) { const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId); ok = !error }
    else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage: 'notice', signal_type: 'notice_context', payload }).select('id').single()
      ok = !error && !!data; if (ok) setRowId(data.id)
    }
    setSaving(false)
    if (ok) { setSavedLocation(location); setSavedCompany(company); setSavedTime(timeOfDay); setOpen(false) } else alert('Could not save. Please try again.')
  }

  return (
    <>
      <Launcher icon="📍" title="Context radar" summary={summary} done={done} onOpen={() => setOpen(true)} />
      <ActivitySheet open={open} onClose={() => setOpen(false)} eyebrow="The perimeter · today" title="Map the environment">
        <p style={styles.sheetLead}>Where it happens, who's around, and when. Just mapping the terrain — no judgment.</p>
        <p style={styles.nGroupLabel}>Where</p>
        <div style={styles.nPillWrap}>
          {RADAR_LOCATIONS.map(loc => (
            <button key={loc} onClick={() => setLocation(loc)} disabled={saving}
              style={{ ...styles.nPill, ...(location === loc ? styles.nPillOn : {}) }}>{loc}</button>
          ))}
        </div>
        <p style={styles.nGroupLabel}>Who</p>
        <div style={styles.nPillWrap}>
          {RADAR_COMPANY.map(co => (
            <button key={co} onClick={() => setCompany(co)} disabled={saving}
              style={{ ...styles.nPill, ...(company === co ? styles.nPillOn : {}) }}>{co}</button>
          ))}
        </div>
        <p style={styles.nGroupLabel}>When</p>
        <div style={styles.nPillWrap}>
          {RADAR_TIME.map(t => (
            <button key={t} onClick={() => setTimeOfDay(t)} disabled={saving}
              style={{ ...styles.nPill, ...(timeOfDay === t ? styles.nPillOn : {}) }}>{t}</button>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving || !location || !company || !timeOfDay}
          style={{ ...styles.sheetSaveBtn, ...((!location || !company || !timeOfDay) ? styles.saveBtnDim : {}) }}>
          {saving ? 'Saving…' : 'Log pattern'}
        </button>
      </ActivitySheet>
    </>
  )
}

// ===================================================================
// TILE: ROI DELTA — the real return
// ===================================================================
const ROI_BEFORE = ['Stressed', 'Bored', 'Anxious', 'Tired', 'Sad', 'Restless', 'Lonely', 'Overwhelmed', 'Fine, honestly']
const ROI_PROMISE = ['Relief', 'A break', 'A reward', 'Take the edge off', 'Just one', 'Energy', 'To feel normal', 'Escape']
const ROI_AFTER = ['Numb', 'Guilty', 'More anxious', 'Relieved', 'Empty', 'Calmer', 'The same', 'Worse']

function RoiDeltaTile() {
  const [open, setOpen] = useState(false)
  const [before, setBefore] = useState(null)
  const [promise, setPromise] = useState(null)
  const [after, setAfter] = useState(null)
  const [rowId, setRowId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedBefore, setSavedBefore] = useState(null)
  const [savedPromise, setSavedPromise] = useState(null)
  const [savedAfter, setSavedAfter] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('free_stage_signals')
        .select('id, payload').eq('user_id', user.id).eq('stage', 'notice')
        .eq('signal_type', 'notice_roi').eq('payload->>date', localDateStr())
        .order('created_at', { ascending: false }).limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row) {
        setRowId(row.id)
        setBefore(row.payload?.before || null); setSavedBefore(row.payload?.before || null)
        setPromise(row.payload?.promise || null); setSavedPromise(row.payload?.promise || null)
        setAfter(row.payload?.after || null); setSavedAfter(row.payload?.after || null)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const done = savedBefore != null && savedPromise != null && savedAfter != null
  const summary = done ? `${savedBefore} → ${savedAfter}` : 'What did it promise — and what did it pay back?'

  const handleSave = async () => {
    if (saving || !before || !promise || !after) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { before, promise, after, date: localDateStr() }
    let ok = false
    if (rowId) { const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId); ok = !error }
    else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage: 'notice', signal_type: 'notice_roi', payload }).select('id').single()
      ok = !error && !!data; if (ok) setRowId(data.id)
    }
    setSaving(false)
    if (ok) { setSavedBefore(before); setSavedPromise(promise); setSavedAfter(after); setOpen(false) } else alert('Could not save. Please try again.')
  }

  return (
    <>
      <Launcher icon="📉" title="The real return" summary={summary} done={done} onOpen={() => setOpen(true)} />
      <ActivitySheet open={open} onClose={() => setOpen(false)} eyebrow="The return · today" title="What did it actually pay back?">
        <p style={styles.sheetLead}>The habit makes a promise. Notice what it actually delivered an hour later.</p>
        <p style={styles.nGroupLabel}>Before, you felt</p>
        <div style={styles.nPillWrap}>
          {ROI_BEFORE.map(b => (
            <button key={b} onClick={() => setBefore(b)} disabled={saving}
              style={{ ...styles.nPill, ...(before === b ? styles.nPillOn : {}) }}>{b}</button>
          ))}
        </div>
        <p style={styles.nGroupLabel}>It promised</p>
        <div style={styles.nPillWrap}>
          {ROI_PROMISE.map(pr => (
            <button key={pr} onClick={() => setPromise(pr)} disabled={saving}
              style={{ ...styles.nPill, ...(promise === pr ? styles.nPillOn : {}) }}>{pr}</button>
          ))}
        </div>
        <p style={styles.nGroupLabel}>An hour after</p>
        <div style={styles.nPillWrap}>
          {ROI_AFTER.map(a => (
            <button key={a} onClick={() => setAfter(a)} disabled={saving}
              style={{ ...styles.nPill, ...(after === a ? styles.nPillOn : {}) }}>{a}</button>
          ))}
        </div>
        {before && promise && after && (
          <div style={styles.roiEquation}>
            <p style={styles.roiEqText}><strong>{before}</strong> → <strong>{after}</strong></p>
            <p style={styles.roiEqNote}>It promised {promise.toLowerCase()}. That's the actual return.</p>
          </div>
        )}
        <button onClick={handleSave} disabled={saving || !before || !promise || !after}
          style={{ ...styles.sheetSaveBtn, ...((!before || !promise || !after) ? styles.saveBtnDim : {}) }}>
          {saving ? 'Saving…' : 'Log the return'}
        </button>
      </ActivitySheet>
    </>
  )
}

// ===================================================================
// TILE: NOTICE PROMPT — daily question (now launcher + sheet)
// ===================================================================
function NoticePromptTile({ todayLogged, onLogged }) {
  const todayKey = new Date().toDateString()
  const promptIdx = Math.abs(hashString(todayKey)) % NOTICE_PROMPTS.length
  const prompt = NOTICE_PROMPTS[promptIdx]

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(todayLogged)
  const [chosen, setChosen] = useState(null)

  const handleSelect = async (option) => {
    if (done || saving) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSaving(false); return }
      const { data: newRow, error } = await supabase
        .from('free_noticings')
        .insert({
          user_id: user.id, prompt_id: prompt.id, prompt_text: prompt.question,
          response: option, created_at: new Date().toISOString(),
        })
        .select().single()
      if (error) {
        console.error('Failed to save noticing:', error)
        setSaving(false)
        alert('Could not save. Please try again.')
        return
      }
      setChosen(option); setDone(true); setSaving(false); setOpen(false)
      if (onLogged && newRow) onLogged(newRow)
    } catch (err) {
      console.error(err); setSaving(false)
    }
  }

  const summary = done
    ? (chosen ? `You answered: "${chosen}"` : 'Answered today — back tomorrow.')
    : prompt.question

  return (
    <>
      <Launcher icon="❔" title="Today's question" summary={summary} done={done} onOpen={() => { if (!done) setOpen(true) }} />
      <ActivitySheet open={open} onClose={() => setOpen(false)} eyebrow="Today's question" title={prompt.question}>
        <p style={styles.sheetLead}>Optional — a side question while you notice. Tap what fits.</p>
        <div style={styles.nPillWrap}>
          {prompt.options.map(option => (
            <button key={option} onClick={() => handleSelect(option)} disabled={saving} style={styles.nPill}>
              {option}
            </button>
          ))}
        </div>
      </ActivitySheet>
    </>
  )
}

// ===================================================================
// TILE: RECENT NOTICINGS (preserved)
// ===================================================================
function RecentNoticingsTile({ noticings }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Recent answers</p>
      <h3 style={styles.tileSubtitleHeader}>From past daily questions</h3>
      <div style={styles.noticingsList}>
        {noticings.map(n => (
          <div key={n.id} style={styles.noticingRow}>
            <p style={styles.noticingDate}>{formatDayLabel(new Date(n.created_at))}</p>
            <p style={styles.noticingPrompt}>{n.prompt_text}</p>
            <p style={styles.noticingResponse}>{n.response}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CaughtMyselfTile() {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [pulse, setPulse] = useState(false)
  const countRef = useRef(0)
  const rowIdRef = useRef(null)
  const savingRef = useRef(false)
  const dirtyRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('free_stage_signals')
        .select('id, payload').eq('user_id', user.id).eq('stage', 'notice')
        .eq('signal_type', 'notice_catch').eq('payload->>date', localDateStr())
        .order('created_at', { ascending: false }).limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row) {
        rowIdRef.current = row.id
        const c = row.payload?.count || 0
        countRef.current = c; setCount(c)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const flush = async () => {
    if (savingRef.current) { dirtyRef.current = true; return }
    savingRef.current = true
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const payload = { count: countRef.current, date: localDateStr() }
        if (rowIdRef.current) {
          await supabase.from('free_stage_signals').update({ payload }).eq('id', rowIdRef.current)
        } else {
          const { data } = await supabase.from('free_stage_signals')
            .insert({ user_id: user.id, stage: 'notice', signal_type: 'notice_catch', payload }).select('id').single()
          if (data) rowIdRef.current = data.id
        }
      }
    } catch (e) { /* network hiccup: count stays local, retries on next tap */ }
    savingRef.current = false
    if (dirtyRef.current) { dirtyRef.current = false; flush() }
  }

  const tap = () => {
    countRef.current += 1
    setCount(countRef.current)
    setPulse(true)
    setTimeout(() => setPulse(false), 200)
    flush()
  }

  const message = count === 0
    ? 'You’re not stopping anything — just seeing it. That noticing is the whole skill.'
    : count < 5
      ? 'That’s a rep. The pattern you can see is the one that can change.'
      : 'Five and counting. You’re catching it earlier than you think.'

  return (
    <>
      <button onClick={() => setOpen(true)} style={styles.toolBtn}>
        <span style={styles.toolIcon}><EyeGlyph /></span>
        <span style={styles.toolLabel}>Caught myself</span>
      </button>
      {open && (
        <SheetPortal><div style={styles.sheetBackdrop} onClick={() => setOpen(false)}>
          <div style={styles.sheetCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.sheetHead}>
              <div>
                <p style={styles.sheetEyebrow}>Awareness</p>
                <h3 style={styles.sheetTitle}>Caught myself</h3>
              </div>
              <button onClick={() => setOpen(false)} style={styles.sheetClose}>✕</button>
            </div>
            <p style={styles.sheetLead}>Every time you catch yourself reaching — or notice the pull before it pulls you — tap. No willpower required. Just the noticing.</p>
            <div style={styles.catchStage}>
              <button onClick={tap} style={{ ...styles.catchTarget, ...(pulse ? styles.catchTargetPulse : {}) }}>
                <span style={styles.catchCount}>{count}</span>
                <span style={styles.catchHint}>{count === 0 ? 'tap when you notice' : 'caught today'}</span>
              </button>
              <p style={styles.catchMsg}>{message}</p>
            </div>
          </div>
        </div></SheetPortal>
      )}
    </>
  )
}

// ===================================================================
// HELPERS
// ===================================================================
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

function formatDayLabel(date) {
  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === today) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Build the last 7 days (oldest -> newest), matching check-ins by date.
function buildLast7(checkins) {
  const byDate = {}
  for (const c of checkins) byDate[c.checkin_date] = c
  const todayStr = localDateStr()
  const out = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const ds = localDateStr(d)
    out.push({
      label: 'SMTWTFS'[d.getDay()],
      dateStr: ds,
      checkin: byDate[ds] || null,
      isToday: ds === todayStr,
    })
  }
  return out
}

// Top value across an array-valued field (e.g. contexts) over rows.
function countArrayField(rows, field, exclude = []) {
  const counts = {}
  let totalTagged = 0
  for (const r of rows) {
    const arr = r[field]
    if (!Array.isArray(arr)) continue
    let counted = false
    for (const v of arr) {
      if (exclude.includes(v)) continue
      counts[v] = (counts[v] || 0) + 1
      counted = true
    }
    if (counted) totalTagged += 1
  }
  let value = null, top = 0
  for (const [v, c] of Object.entries(counts)) {
    if (c > top) { value = v; top = c }
  }
  return { value, count: top, percent: totalTagged > 0 ? Math.round((top / totalTagged) * 100) : 0 }
}

// (kept for any future scalar-field use)
function computeTopValue(logs, field) {
  const counts = {}
  for (const log of logs) { const v = log[field]; counts[v] = (counts[v] || 0) + 1 }
  let topValue = null, topCount = 0
  for (const [v, c] of Object.entries(counts)) { if (c > topCount) { topValue = v; topCount = c } }
  return { value: topValue, count: topCount, percent: logs.length > 0 ? Math.round((topCount / logs.length) * 100) : 0 }
}

// ===================================================================
// STYLES
// ===================================================================
const styles = {
  // launcher cards (warm dark — the urge-velocity look)

  hero: { background: 'linear-gradient(170deg, #3A2A1C 0%, #241710 100%)', borderRadius: '22px', padding: '24px 22px 22px', margin: '6px 0 28px', boxShadow: '0 16px 36px -12px rgba(40,25,10,0.5)' },
  heroEyebrow: { fontSize: '10px', color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', margin: '0 0 14px' },
  heroGreeting: { fontSize: '15px', color: 'rgba(250,247,241,0.7)', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 10px' },
  heroReflection: { fontSize: '23px', color: '#FAF7F1', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.35, margin: '0 0 22px', letterSpacing: '-0.01em' },
  heroCta: { display: 'inline-block', padding: '13px 26px', background: 'linear-gradient(180deg, #D9B57A 0%, #B89456 100%)', color: '#2A1710', border: 'none', borderRadius: '13px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Georgia, serif', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' },
  heroDoneRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  heroDoneTick: { width: '24px', height: '24px', borderRadius: '50%', border: '1px solid rgba(217,181,122,0.6)', color: '#D9B57A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 },
  heroDoneText: { fontSize: '14px', color: 'rgba(250,247,241,0.85)', fontFamily: 'Georgia, serif', fontStyle: 'italic', flex: 1 },
  heroUpdate: { background: 'transparent', border: 'none', color: '#D9B57A', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', flexShrink: 0 },

  sectionWrap: { marginBottom: '28px' },
  sectionHeader: { marginBottom: '14px', paddingLeft: '2px' },
  sectionTitle: { fontSize: '13px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', margin: 0 },
  sectionHint: { fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '6px 0 0', lineHeight: 1.45 },

  toolkitLabel: { fontSize: '13px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', margin: '0 0 16px', paddingLeft: '2px' },
  toolkit: { display: 'flex', gap: '12px', justifyContent: 'center' },
  toolBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '18px 12px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  toolIcon: { color: '#854F0B', display: 'flex' },
  toolLabel: { fontSize: '12.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif' },

  surfaceToggle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 2px', background: 'transparent', border: 'none', borderTop: '1px solid rgba(217,194,138,0.4)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' },
  surfaceToggleText: { display: 'flex', flexDirection: 'column', gap: '5px' },
  surfaceHint: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  surfaceChevron: { fontSize: '18px', color: '#854F0B', flexShrink: 0 },
  surfaceBody: { marginTop: '8px' },
  oracleLink: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', marginTop: '8px', padding: '14px', background: 'transparent', border: 'none', borderTop: '1px solid rgba(217,194,138,0.4)', color: '#854F0B', fontSize: '13px', fontFamily: 'Georgia, serif', fontStyle: 'italic', cursor: 'pointer' },
  oracleLinkArrow: { fontSize: '14px' },
  catchStage: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0 14px' },
  catchTarget: { width: '168px', height: '168px', borderRadius: '50%', border: '1.5px solid #D9B57A', background: 'radial-gradient(circle, rgba(217,181,122,0.16) 0%, rgba(217,181,122,0) 72%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', transition: 'transform 0.18s ease, box-shadow 0.18s ease', fontFamily: 'inherit', userSelect: 'none', WebkitTapHighlightColor: 'transparent' },
  catchTargetPulse: { transform: 'scale(1.06)', boxShadow: '0 0 0 6px rgba(217,181,122,0.12)' },
  catchCount: { fontSize: '52px', color: '#854F0B', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  catchHint: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', letterSpacing: '0.04em' },
  catchMsg: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, textAlign: 'center', margin: '14px 4px 4px' },


  launcher: { display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', background: 'linear-gradient(155deg, #6E3A1C 0%, #3A2415 100%)', borderRadius: '18px', padding: '16px 18px', marginBottom: '14px', boxShadow: '0 6px 18px rgba(40,25,10,0.18)', fontFamily: 'inherit' },
  launcherTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  launcherIcon: { fontSize: '22px', lineHeight: 1 },
  launcherChip: { fontSize: '11px', fontWeight: 600, color: 'rgba(250,247,241,0.85)', background: 'rgba(250,247,241,0.12)', border: '0.5px solid rgba(250,247,241,0.22)', borderRadius: '20px', padding: '4px 10px', fontFamily: 'Georgia, serif' },
  launcherChipDone: { color: '#DFF0C2', background: 'rgba(120,160,60,0.22)', border: '0.5px solid rgba(180,210,130,0.4)' },
  launcherTitle: { fontSize: '17px', fontWeight: 600, color: '#FAF7F1', fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  launcherSummary: { fontSize: '12.5px', color: 'rgba(250,247,241,0.72)', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.45 },
  // activity sheet (blurred popup)
  sheetBackdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(40,25,15,0.55)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', zIndex: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px' },
  sheetCard: { width: '100%', maxWidth: '430px', maxHeight: '88vh', overflowY: 'auto', background: '#FCFAF5', borderRadius: '22px', padding: '20px 20px 22px', boxShadow: '0 24px 70px rgba(40,25,15,0.4)' },
  sheetHead: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' },
  sheetEyebrow: { fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A07A3C', fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  sheetTitle: { fontSize: '19px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.25 },
  sheetClose: { flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', border: '0.5px solid #E0D5C2', background: 'white', color: '#6B5C4A', fontSize: '13px', cursor: 'pointer', lineHeight: 1 },
  sheetLead: { fontSize: '13.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: '0 0 16px' },
  sheetSaveBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FBF6EE', border: 'none', borderRadius: '13px', fontSize: '14px', fontWeight: 500, fontFamily: 'Georgia, serif', cursor: 'pointer', marginTop: '4px' },
  saveBtnDim: { opacity: 0.45, cursor: 'not-allowed' },
  // autopilot audit
  auditCurrent: { fontSize: '20px', color: '#854F0B', fontFamily: 'Georgia, serif', fontWeight: 600, textAlign: 'center', margin: '4px 0 10px' },
  auditSlider: { width: '100%', accentColor: '#854F0B', margin: '4px 0 6px' },
  auditEnds: { display: 'flex', justifyContent: 'space-between', marginBottom: '18px', fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif' },
  // shared select pills (radar / roi / prompt)
  nGroupLabel: { fontSize: '13px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '6px 0 8px' },
  nPillWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' },
  nPill: { padding: '9px 14px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '20px', fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  nPillOn: { background: 'linear-gradient(180deg, #6E3A1C 0%, #3A2415 100%)', color: '#FAF7F1', border: '0.5px solid #3A2415' },
  // roi equation
  roiEquation: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', borderRadius: '16px', padding: '18px', textAlign: 'center', marginBottom: '14px' },
  roiEqText: { fontSize: '18px', color: '#FAF7F1', fontFamily: 'Georgia, serif', margin: '0 0 6px', lineHeight: 1.3 },
  roiEqNote: { fontSize: '12.5px', color: '#D9B57A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0 },
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem', display: 'flex', justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  phone: {
    background: '#FAF7F1', maxWidth: '440px', width: '100%', borderRadius: '28px',
    padding: '1.5rem 1.25rem 1.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  loadingPhone: {
    background: '#FAF7F1', maxWidth: '440px', width: '100%', borderRadius: '28px',
    padding: '5rem 2rem', textAlign: 'center', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic', boxShadow: '0 14px 40px rgba(60,40,20,0.10)',
  },

  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' },
  brandLine: { fontSize: '20px', fontWeight: 500, color: '#2A1F15', margin: 0, fontFamily: 'Georgia, serif', letterSpacing: '-0.01em' },
  profileBtn: { background: 'transparent', border: 'none', color: '#854F0B', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  // GENERIC TILE
  tile: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0', borderRadius: '18px',
    padding: '18px 18px 16px', boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
  },
  tileLogged: { background: 'linear-gradient(180deg, #F6FAE9 0%, #ECF3D5 100%)', border: '0.5px solid #C2D49A' },
  tileEyebrow: { fontSize: '10.5px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 10px' },
  tileTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.3, margin: '0 0 12px' },
  tileBody: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 14px' },
  tileSubtitleHeader: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 12px' },
  tileHelperText: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '12px 0 0', textAlign: 'center' },

  // GREETING
  greetingTile: { textAlign: 'left', padding: '8px 4px 4px' },
  greetingEyebrow: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.24em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 8px' },
  greetingTitle: { fontSize: '26px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.2, margin: '0 0 10px', letterSpacing: '-0.01em' },
  greetingSubtitle: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: 0 },
  substanceEm: { color: '#854F0B', fontWeight: 500, fontStyle: 'italic' },

  // CHECK-IN summary (logged today)
  checkinSummaryRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  moodPill: { width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)' },
  checkinSummaryMood: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 2px', lineHeight: 1.3 },
  checkinSummarySub: { fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.4 },
  checkinEditBtn: { background: 'transparent', border: 'none', color: '#3B6D11', fontSize: '12px', fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer', padding: 0 },

  // CTA buttons
  quickLogBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '12px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  quickLogBtnGhost: {
    width: '100%', padding: '13px', background: 'white', color: '#3A2A1C',
    border: '0.5px solid #D9CBB4', borderRadius: '12px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(80,50,20,0.06)',
  },

  // AWARENESS STRIP
  stripRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '4px 2px 0' },
  stripCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', flex: 1 },
  stripDot: { width: '22px', height: '22px', borderRadius: '50%', background: '#F4ECDD', border: '1px dashed #DCCFB8' },
  stripDotToday: { boxShadow: '0 0 0 2px #FAF7F1, 0 0 0 3.5px #C8A86A' },
  stripDay: { fontSize: '10px', color: '#9C8C78', fontFamily: 'Georgia, serif' },

  // DAILY MIRROR
  reflectionLine: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, textAlign: 'center', margin: '0 0 4px' },

  // WEEK METER
  meterEmptyTitle: { fontSize: '16px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, fontStyle: 'italic', margin: '0 0 8px' },
  meterCountRow: { display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' },
  meterCount: { fontSize: '38px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1, margin: 0, fontVariantNumeric: 'tabular-nums' },
  meterCountLabel: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0 },
  meterDelta: { fontSize: '12px', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 14px' },
  meterDistHeading: { fontSize: '10.5px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '8px 0 8px' },
  meterDistList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  meterDistRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  meterDistLabel: { fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', width: '80px', flexShrink: 0 },
  meterDistBarBg: { flex: 1, height: '8px', background: '#F4ECDD', borderRadius: '4px', overflow: 'hidden' },
  meterDistBarFill: { height: '100%', background: 'linear-gradient(90deg, #D9B57A 0%, #B89456 100%)', borderRadius: '4px', transition: 'width 0.3s' },
  meterDistCount: { fontSize: '12px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, width: '20px', textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' },

  // MIRROR ROWS
  mirrorOrnament: { fontSize: '12px', color: '#C9B894', letterSpacing: '0.5em', textAlign: 'center', margin: '0 0 10px' },
  mirrorEyebrow: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.32em', fontWeight: 500, fontFamily: 'Georgia, serif', textAlign: 'center', margin: '0 0 14px' },
  mirrorList: { display: 'flex', flexDirection: 'column', gap: '8px', margin: '14px 0' },
  mirrorRow: { display: 'flex', flexDirection: 'column', gap: '2px', padding: '10px 12px', background: '#FDFBF6', border: '0.5px solid #EFE7D7', borderRadius: '10px' },
  mirrorRowLabel: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: 0 },
  mirrorRowValue: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0, lineHeight: 1.4 },
  mirrorRowPercent: { color: '#9C8C78', fontWeight: 400, fontStyle: 'italic' },
  mirrorFoot: { fontSize: '12px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: 0 },

  // OPTIONS GRID (daily prompt)
  optionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' },
  optionChip: { padding: '12px 10px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '12px', fontSize: '13px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 6px rgba(80,50,20,0.04)', lineHeight: 1.4 },
  optionChipSelected: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: '0.5px solid #241710', boxShadow: '0 4px 12px rgba(40,25,10,0.25)' },
  optionChipFading: { opacity: 0.4 },

  // LOGGED STATE
  loggedRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  checkmark: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)', border: '0.5px solid #C2D49A', color: '#3B6D11', fontSize: '16px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  loggedText: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.5 },

  // NOTICINGS LIST
  noticingsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  noticingRow: { padding: '10px 12px', background: '#FDFBF6', border: '0.5px solid #EFE7D7', borderRadius: '10px' },
  noticingDate: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  noticingPrompt: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 3px', lineHeight: 1.4 },
  noticingResponse: { fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0, lineHeight: 1.4 },
}