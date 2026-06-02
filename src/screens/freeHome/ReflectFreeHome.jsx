import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import SheetPortal from '../../components/SheetPortal'
import VowBrandMark from '../../components/VowBrandMark'
import QuickLogModal from './QuickLogModal'
import DailyCheckin, { moodByScore, moodByValue } from './DailyCheckin'
import JournalTile from './JournalTile'
import BottomNav from '../../components/BottomNav'
import StageWayfinder from './StageWayfinder'

// ===================================================================
// REFLECT-FREE HOME
// ===================================================================
// Stage: Reflect (contemplation). User is weighing whether to stop.
// Tone: honest, conflicted, no pressure. Both sides of the trade visible.
//
// Engine (primary, weekly): Weighing slider + always-visible journal +
//   trajectory chart of past values.
// Engine (secondary, daily): shared Quick Log → Trajectory + Memory mirrors.
// Demoted: daily reflection prompt + recent answers.
// Nav: bottom tabs handle Home / Mirror / Motivation / Vow Path.
//      Profile (state-picker + sign out) lives behind humanoid icon top-right.
// ===================================================================

const MEMORY_UNLOCK_AT = 5
const MEMORY_MIN_AGE_DAYS = 7
const TRAJECTORY_FULL_AT_DAYS = 30

const TIME_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  late_night: 'Late night',
}

const CONTEXT_LABELS = {
  alone: 'alone',
  with_friends: 'with friends',
  with_family: 'with family',
  with_partner: 'with a partner',
  at_work: 'at work',
  other: 'other setting',
}

const FEELING_LABELS = {
  numb: 'felt numb',
  regret: 'felt regret',
  relief: 'felt relief',
  indifferent: 'felt indifferent',
  tired: 'felt tired',
  other: 'felt something else',
}

const REFLECT_PROMPTS = [
  {
    id: 'reflect_case_for_stopping',
    question: "What's the case for stopping today?",
    options: ['Health', 'Money', 'Time', 'Relationships', 'Self-respect', 'Honestly, none today'],
  },
  {
    id: 'reflect_what_would_lose',
    question: 'What would you lose if you stopped?',
    options: ['A way to relax', 'A way to celebrate', 'A way to cope', 'A social thing', 'A habit / familiarity', "Don't know yet"],
  },
  {
    id: 'reflect_who_does_it_help',
    question: 'Who does it help when you do it?',
    options: ['Just me, briefly', 'Me and others', 'Nobody really', 'Hard to say', 'It used to. Not as much now.'],
  },
  {
    id: 'reflect_what_costs_most',
    question: 'What does it cost you most, right now?',
    options: ['Time', 'Money', 'Energy', 'Sleep', 'Closeness with someone', "Don't know"],
  },
  {
    id: 'reflect_imagine_a_year',
    question: 'If nothing changes, where will you be in a year?',
    options: ['Same as now', 'A little worse', 'A lot worse', 'Better — I might cut down', 'Better — I might stop', "Don't want to think about it"],
  },
  {
    id: 'reflect_who_around_you',
    question: 'Who in your life has noticed?',
    options: ['Partner / spouse', 'Close friend', 'Family', 'Nobody yet', "I'm not sure", "I don't want them to"],
  },
  {
    id: 'reflect_decision_weight',
    question: 'How close are you to a decision?',
    options: ['Not close', 'Thinking about it', 'Leaning toward stopping', 'Almost ready', 'Going back and forth'],
  },
]

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

const REFLECT_REFLECTIONS = [
  'Two things can be true: it helps you, and it costs you.',
  'You don’t have to decide today. Just look honestly.',
  'Ambivalence isn’t weakness. It’s the sound of weighing something real.',
  'The cost is easy to look past. Look at it anyway.',
  'What it gives you is real. So is what it takes. Hold both.',
  'You’re allowed to want it and to want to be free of it.',
  'Clarity comes from looking, not from forcing an answer.',
]

const LogGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8.5v7M8.5 12h7" />
  </svg>
)
const WeighGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v15" />
    <path d="M7 20h10" />
    <path d="M4 8h16" />
    <path d="M4 8l-2.5 5h5z" />
    <path d="M20 8l-2.5 5h5z" />
  </svg>
)
const BalanceGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15a8 8 0 0 1 16 0" />
    <path d="M12 15l4-4" />
    <circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none" />
  </svg>
)

// ===================================================================
// MAIN COMPONENT
// ===================================================================
export default function ReflectFreeHome({ progress }) {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [currentWeighing, setCurrentWeighing] = useState(null)
  const [pastWeighings, setPastWeighings] = useState([])
  const [logs, setLogs] = useState([])
  const [totalLogCount, setTotalLogCount] = useState(0)
  const [recentReflections, setRecentReflections] = useState([])
  const [todayReflectionLogged, setTodayReflectionLogged] = useState(false)
  const [todayCheckin, setTodayCheckin] = useState(null)
  const [recentCheckins, setRecentCheckins] = useState([])
  const [checkinCount, setCheckinCount] = useState(0)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [balanceLatest, setBalanceLatest] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [surfaceOpen, setSurfaceOpen] = useState(false)
  const [weighingOpen, setWeighingOpen] = useState(false)
  const [balanceOpen, setBalanceOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, full_name')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.first_name) setFirstName(profile.first_name)
      else if (profile?.full_name) setFirstName(profile.full_name.split(' ')[0])
      else if (user.email) setFirstName(user.email.split('@')[0])

      const weekOfStr = formatDateForDB(new Date())
      const { data: weighings } = await supabase
        .from('free_reflect_weighings')
        .select('*')
        .eq('user_id', user.id)
        .order('week_of', { ascending: false })
        .limit(20)

      if (weighings) {
        const current = weighings.find(w => w.week_of === weekOfStr)
        const past = weighings.filter(w => w.week_of < weekOfStr).slice(0, 12)
        setCurrentWeighing(current || null)
        setPastWeighings(past)
      }

      const { data: logsData } = await supabase
        .from('free_instance_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(60)
      if (logsData) setLogs(logsData)

      const { count } = await supabase
        .from('free_instance_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if (count !== null) setTotalLogCount(count)

      const { data: reflections } = await supabase
        .from('free_reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (reflections) {
        setRecentReflections(reflections)
        const today = new Date().toDateString()
        const hasToday = reflections.some(r =>
          new Date(r.created_at).toDateString() === today
        )
        setTodayReflectionLogged(hasToday)
      }

      // ---- daily check-ins (shared signal) ----
      const todayStr = localDateStr()
      const { data: tc } = await supabase
        .from('free_daily_checkins').select('*')
        .eq('user_id', user.id).eq('checkin_date', todayStr).maybeSingle()
      if (tc) setTodayCheckin(tc)

      const { data: rc } = await supabase
        .from('free_daily_checkins').select('*')
        .eq('user_id', user.id).order('checkin_date', { ascending: false }).limit(14)
      if (rc) setRecentCheckins(rc)

      const { count: cc } = await supabase
        .from('free_daily_checkins').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      if (cc !== null) setCheckinCount(cc)

      // ---- latest emotional-balance signal ----
      const { data: bal } = await supabase
        .from('free_stage_signals').select('*')
        .eq('user_id', user.id).eq('signal_type', 'reflect_balance')
        .order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (bal) setBalanceLatest(bal)

      setLoading(false)
    }
    load()
  }, [])

  const handleLogged = (newLog) => {
    setLogs(prev => [newLog, ...prev].slice(0, 60))
    setTotalLogCount(prev => prev + 1)
  }

  const handleWeighingSaved = (saved) => {
    setCurrentWeighing(saved)
  }

  const handleReflectionLogged = (newRow) => {
    setRecentReflections(prev => [newRow, ...prev].slice(0, 3))
    setTodayReflectionLogged(true)
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

  const handleBalanceSaved = (row) => {
    setBalanceLatest(row)
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={styles.loadingPhone}>Loading...</div>
      </div>
    )
  }

  const eligibleMemoryLogs = logs.filter(log => {
    const daysAgo = Math.floor((Date.now() - new Date(log.created_at)) / (1000 * 60 * 60 * 24))
    return daysAgo >= MEMORY_MIN_AGE_DAYS
  })
  const showMemoryTile = totalLogCount >= MEMORY_UNLOCK_AT && eligibleMemoryLogs.length > 0

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const reflection = REFLECT_REFLECTIONS[new Date().getDate() % REFLECT_REFLECTIONS.length]

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
          <p style={styles.heroEyebrow}>Reflect · Today</p>
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

        {/* SECTION — the daily examination */}
        <div style={styles.sectionWrap}>
          <div style={styles.sectionHeader}>
            <p style={styles.sectionTitle}>Look closer</p>
            <p style={styles.sectionHint}>The honest weighing — both what it gives you and what it takes.</p>
          </div>
          <CompoundingCostTile substanceLabel={progress.substance_label} />
          <RationalizationGridTile />
          <DissonanceTile />
          <ReflectPromptTile
            todayLogged={todayReflectionLogged}
            onLogged={handleReflectionLogged}
          />
        </div>

        {/* SECTION — reflect */}
        <div style={styles.sectionWrap}>
          <div style={styles.sectionHeader}>
            <p style={styles.sectionTitle}>In your words</p>
          </div>
          <JournalTile stage="reflect" />
        </div>

        {/* TOOLS — glyph toolkit */}
        <div style={styles.sectionWrap}>
          <p style={styles.toolkitLabel}>Tools</p>
          <div style={styles.toolkit}>
            <button onClick={() => setModalOpen(true)} style={styles.toolBtn}>
              <span style={styles.toolIcon}><LogGlyph /></span>
              <span style={styles.toolLabel}>Log a moment</span>
            </button>
            <button onClick={() => setWeighingOpen(true)} style={styles.toolBtn}>
              <span style={styles.toolIcon}><WeighGlyph /></span>
              <span style={styles.toolLabel}>Where it sits today</span>
            </button>
            <button onClick={() => setBalanceOpen(true)} style={styles.toolBtn}>
              <span style={styles.toolIcon}><BalanceGlyph /></span>
              <span style={styles.toolLabel}>Balance meter</span>
            </button>
          </div>
        </div>

        {/* WHAT'S SURFACING — collapsible insights */}
        <div style={styles.sectionWrap}>
          <button onClick={() => setSurfaceOpen(o => !o)} style={styles.surfaceToggle}>
            <span style={styles.surfaceToggleText}>
              <span style={styles.sectionTitle}>What’s surfacing</span>
              <span style={styles.surfaceHint}>Your trajectory, what you noted before, your answers</span>
            </span>
            <span style={styles.surfaceChevron}>{surfaceOpen ? '⌄' : '›'}</span>
          </button>
          {surfaceOpen && (
            <div style={styles.surfaceBody}>
              <TrajectoryMirrorTile
                logs={logs}
                totalLogCount={totalLogCount}
                onOpenLog={() => setModalOpen(true)}
              />
              {showMemoryTile && <WhatYouNotedBeforeTile logs={eligibleMemoryLogs} />}
              {recentReflections.length > 0 && <RecentReflectionsTile reflections={recentReflections} />}
              <button onClick={() => navigate('/app/mirror')} style={styles.oracleLink}>
                Your full reflection lives in the Oracle <span style={styles.oracleLinkArrow}>→</span>
              </button>
            </div>
          )}
        </div>

        <BottomNav />
      </div>

      {/* TOOL: Where it sits today (the weekly weighing) */}
      {weighingOpen && (
        <SheetPortal><div style={styles.sheetBackdrop} onClick={() => setWeighingOpen(false)}>
          <div style={styles.toolSheetWrap} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setWeighingOpen(false)} style={styles.toolSheetClose}>✕</button>
            <WeeklyWeighingTile
              currentWeighing={currentWeighing}
              pastWeighings={pastWeighings}
              onSaved={handleWeighingSaved}
            />
          </div>
        </div></SheetPortal>
      )}

      {/* TOOL: Balance meter */}
      {balanceOpen && (
        <SheetPortal><div style={styles.sheetBackdrop} onClick={() => setBalanceOpen(false)}>
          <div style={styles.toolSheetWrap} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setBalanceOpen(false)} style={styles.toolSheetClose}>✕</button>
            <BalanceMetersTile latest={balanceLatest} onSaved={handleBalanceSaved} />
          </div>
        </div></SheetPortal>
      )}

      <DailyCheckin
        isOpen={checkinOpen}
        onClose={() => setCheckinOpen(false)}
        stage="reflect"
        existing={todayCheckin}
        onSaved={handleCheckinSaved}
      />
      <QuickLogModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onLogged={handleLogged}
      />
    </div>
  )
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
      <p style={styles.greetingEyebrow}>REFLECT</p>
      <h1 style={styles.greetingTitle}>
        {timeGreeting}{firstName ? `, ${firstName}` : ''}.
      </h1>
      <p style={styles.greetingSubtitle}>
        Looking honestly at <em style={styles.substanceEm}>{substanceLabel}</em>.
        Both sides of the trade.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: WEEKLY WEIGHING (primary)
// ===================================================================
function WeeklyWeighingTile({ currentWeighing, pastWeighings, onSaved }) {
  const [sliderValue, setSliderValue] = useState(currentWeighing?.weighing_value ?? 50)
  const [journalText, setJournalText] = useState(currentWeighing?.journal_text ?? '')
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const isUpdate = !!currentWeighing

  const trajectoryData = [...pastWeighings].reverse()
  if (currentWeighing) trajectoryData.push(currentWeighing)

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const weekOfStr = formatDateForDB(new Date())

      const { data: saved, error } = await supabase
        .from('free_reflect_weighings')
        .upsert({
          user_id: user.id,
          week_of: weekOfStr,
          weighing_value: sliderValue,
          journal_text: journalText.trim() || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,week_of' })
        .select()
        .single()

      if (error) {
        console.error('Failed to save weighing:', error)
        alert('Could not save. Please try again.')
        setSaving(false)
        return
      }

      if (onSaved) onSaved(saved)
      setSaving(false)
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2500)
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const descriptor = describeWeighing(sliderValue)

  return (
    <div style={styles.tile}>
      <style>{`
        .vow-weighing-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, #DDCFB6 0%, #854F0B 100%);
          border-radius: 4px;
          outline: none;
          margin: 0;
          padding: 0;
        }
        .vow-weighing-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 26px;
          height: 26px;
          background: linear-gradient(180deg, #FFFFFF 0%, #F4ECDD 100%);
          border: 1.5px solid #854F0B;
          border-radius: 50%;
          cursor: grab;
          box-shadow: 0 2px 8px rgba(40,25,10,0.25);
        }
        .vow-weighing-slider::-webkit-slider-thumb:active { cursor: grabbing; }
        .vow-weighing-slider::-moz-range-thumb {
          width: 26px;
          height: 26px;
          background: linear-gradient(180deg, #FFFFFF 0%, #F4ECDD 100%);
          border: 1.5px solid #854F0B;
          border-radius: 50%;
          cursor: grab;
          box-shadow: 0 2px 8px rgba(40,25,10,0.25);
        }
        .vow-weighing-slider:disabled::-webkit-slider-thumb { cursor: not-allowed; opacity: 0.6; }
        .vow-journal-textarea::placeholder {
          color: #9C8C78;
          font-style: italic;
        }
        .vow-journal-textarea:focus {
          border-color: #854F0B;
        }
      `}</style>

      <p style={styles.tileEyebrow}>Today</p>
      <h2 style={styles.tileTitle}>How are you weighing it?</h2>

      <div style={styles.weighingValueDisplay}>
        <p style={styles.weighingValueNumber}>{sliderValue}</p>
        <p style={styles.weighingValueDescriptor}>{descriptor}</p>
      </div>

      <div style={styles.sliderContainer}>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="vow-weighing-slider"
          disabled={saving}
        />
        <div style={styles.sliderLabelsRow}>
          <span style={styles.sliderEndLabel}>Keep it</span>
          <span style={styles.sliderEndLabel}>Stop it</span>
        </div>
      </div>

      <p style={styles.journalLabel}>A few sentences (optional)</p>
      <textarea
        value={journalText}
        onChange={(e) => setJournalText(e.target.value)}
        placeholder="What's true today? 2-4 sentences."
        rows={3}
        disabled={saving}
        className="vow-journal-textarea"
        style={styles.journalTextarea}
      />

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          ...styles.weighingSaveBtn,
          ...(saving ? styles.weighingSaveBtnDisabled : {}),
        }}
      >
        {saving
          ? 'Saving...'
          : justSaved
            ? '✓ Saved'
            : isUpdate
              ? "Update today's weighing"
              : "Save today's weighing"}
      </button>

      <p style={styles.tileHelperText}>
        {isUpdate
          ? `Last updated ${formatRelativeTime(currentWeighing.updated_at)} · Editable until midnight.`
          : 'One entry per day. Editable any time today.'}
      </p>

      {trajectoryData.length >= 2 && (
        <>
          <div style={styles.weighingDivider} />
          <p style={styles.trajectoryHeading}>Your trajectory</p>
          <WeighingTrajectoryChart dataPoints={trajectoryData} />
        </>
      )}
    </div>
  )
}

function describeWeighing(v) {
  if (v <= 20) return 'Wanting to keep it'
  if (v <= 40) return 'Leaning toward keeping it'
  if (v <= 60) return 'Going back and forth'
  if (v <= 80) return 'Leaning toward stopping it'
  return 'Wanting to stop it'
}

function formatRelativeTime(timestamptzStr) {
  if (!timestamptzStr) return 'just now'
  const then = new Date(timestamptzStr)
  const now = new Date()
  const diffSec = Math.floor((now - then) / 1000)
  if (diffSec < 60) return 'just now'
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60)
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`
  }
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  const days = Math.floor(diffSec / 86400)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
}

// ===================================================================
// COMPONENT: WEIGHING TRAJECTORY CHART
// ===================================================================
function WeighingTrajectoryChart({ dataPoints }) {
  if (dataPoints.length < 2) return null

  const W = 340
  const H = 130
  const PX = 30
  const PY = 22
  const cw = W - 2 * PX
  const ch = H - 2 * PY

  const points = dataPoints.map((dp, i) => {
    const x = PX + (i / (dataPoints.length - 1)) * cw
    const y = PY + (1 - dp.weighing_value / 100) * ch
    return { x, y, value: dp.weighing_value }
  })

  const pathStr = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  ).join(' ')

  const first = dataPoints[0].weighing_value
  const last = dataPoints[dataPoints.length - 1].weighing_value
  const delta = last - first
  const days = dataPoints.length

  let summary, summaryColor
  if (delta > 0) {
    summary = `▲ ${delta} points toward stopping over ${days} ${days === 1 ? 'day' : 'days'}`
    summaryColor = '#3B6D11'
  } else if (delta < 0) {
    summary = `▼ ${Math.abs(delta)} points toward keeping over ${days} ${days === 1 ? 'day' : 'days'}`
    summaryColor = '#854F0B'
  } else {
    summary = `Steady over ${days} ${days === 1 ? 'day' : 'days'}`
    summaryColor = '#9C8C78'
  }

  return (
    <div style={styles.trajectoryWrap}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={styles.trajectoryChart}
        preserveAspectRatio="xMidYMid meet"
      >
        <text x={PX - 6} y={PY + 4} fontSize="9" fill="#9C8C78"
              textAnchor="end" fontFamily="Georgia, serif" fontStyle="italic">Stop</text>
        <text x={PX - 6} y={H - PY + 6} fontSize="9" fill="#9C8C78"
              textAnchor="end" fontFamily="Georgia, serif" fontStyle="italic">Keep</text>

        <line x1={PX} y1={PY + ch / 2} x2={PX + cw} y2={PY + ch / 2}
              stroke="#E0D5C2" strokeWidth="0.5" strokeDasharray="2 3" />

        <path d={pathStr} stroke="#854F0B" strokeWidth="2" fill="none"
              strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => {
          const isCurrent = i === points.length - 1
          return (
            <g key={i}>
              <circle
                cx={p.x} cy={p.y}
                r={isCurrent ? 5 : 4}
                fill={isCurrent ? '#854F0B' : '#FAF7F1'}
                stroke="#854F0B"
                strokeWidth="1.5"
              />
              <text
                x={p.x} y={p.y - (isCurrent ? 11 : 9)}
                fontSize={isCurrent ? '11' : '10'}
                fill="#854F0B"
                textAnchor="middle"
                fontFamily="Georgia, serif"
                fontWeight={isCurrent ? '600' : '500'}
              >
                {p.value}
              </text>
            </g>
          )
        })}
      </svg>
      <p style={{ ...styles.trajectorySummary, color: summaryColor }}>{summary}</p>
    </div>
  )
}

// ===================================================================
// TILE: QUICK LOG (secondary)
// ===================================================================
function QuickLogTile({ logs, totalLogCount, onOpen }) {
  const todayCount = logs.filter(l =>
    new Date(l.created_at).toDateString() === new Date().toDateString()
  ).length

  let footerText
  if (totalLogCount === 0) {
    footerText = 'Your first log starts the mirrors below.'
  } else if (todayCount === 0) {
    footerText = 'Nothing logged today.'
  } else if (todayCount === 1) {
    footerText = '1 moment logged today.'
  } else {
    footerText = `${todayCount} moments logged today.`
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Today</p>
      <h2 style={styles.tileTitle}>Log a moment</h2>
      <p style={styles.tileBody}>
        20 seconds — when, where, how it felt. Feeds the mirrors below.
      </p>
      <button onClick={onOpen} style={styles.quickLogBtnSecondary}>
        + I just did it
      </button>
      <p style={styles.tileHelperText}>{footerText}</p>
    </div>
  )
}

// ===================================================================
// TILE: TRAJECTORY MIRROR
// ===================================================================
function TrajectoryMirrorTile({ logs, totalLogCount, onOpenLog }) {
  if (totalLogCount === 0) {
    return (
      <div style={styles.tile}>
        <p style={styles.tileEyebrow}>Trajectory</p>
        <h3 style={styles.meterEmptyTitle}>Start logging to see your trajectory.</h3>
        <p style={styles.tileBody}>
          Trajectory unlocks at 30 days of logging. It shows whether you're using
          more or less than the previous month.
        </p>
        <button onClick={onOpenLog} style={styles.trajectoryEmptyBtn}>
          + Log a moment
        </button>
      </div>
    )
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const firstLogDate = logs.length > 0 ? new Date(logs[logs.length - 1].created_at) : null
  const daysSinceFirstLog = firstLogDate
    ? Math.floor((now - firstLogDate) / (1000 * 60 * 60 * 24))
    : 0

  const recentLogs = logs.filter(l => new Date(l.created_at) >= thirtyDaysAgo)
  const previousLogs = logs.filter(l => {
    const d = new Date(l.created_at)
    return d >= sixtyDaysAgo && d < thirtyDaysAgo
  })
  const recentCount = recentLogs.length
  const previousCount = previousLogs.length

  if (daysSinceFirstLog < TRAJECTORY_FULL_AT_DAYS) {
    const daysLeft = TRAJECTORY_FULL_AT_DAYS - daysSinceFirstLog
    return (
      <div style={styles.tile}>
        <p style={styles.tileEyebrow}>Trajectory</p>
        <div style={styles.trajectoryCount}>
          <p style={styles.trajectoryNumber}>{recentCount}</p>
          <p style={styles.trajectoryNumberLabel}>
            {recentCount === 1 ? 'moment' : 'moments'} in {daysSinceFirstLog} {daysSinceFirstLog === 1 ? 'day' : 'days'} of logging
          </p>
        </div>
        <p style={styles.tileHelperText}>
          Full trajectory unlocks at 30 days · {daysLeft} {daysLeft === 1 ? 'day' : 'days'} to go.
        </p>
      </div>
    )
  }

  const delta = recentCount - previousCount
  let deltaText, deltaArrow, deltaColor
  if (previousCount === 0) {
    deltaText = 'No prior 30-day window to compare.'
    deltaArrow = ''
    deltaColor = '#9C8C78'
  } else if (delta > 0) {
    deltaText = `${delta} more than the 30 days before`
    deltaArrow = '▲'
    deltaColor = '#C5572C'
  } else if (delta < 0) {
    deltaText = `${Math.abs(delta)} fewer than the 30 days before`
    deltaArrow = '▼'
    deltaColor = '#3B6D11'
  } else {
    deltaText = 'Same as the 30 days before'
    deltaArrow = '·'
    deltaColor = '#9C8C78'
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Trajectory</p>
      <div style={styles.trajectoryCompareRow}>
        <div style={styles.trajectoryCell}>
          <p style={styles.trajectoryCellLabel}>Previous 30</p>
          <p style={styles.trajectoryCellNumber}>{previousCount}</p>
        </div>
        <div style={styles.trajectoryDivider} />
        <div style={styles.trajectoryCell}>
          <p style={styles.trajectoryCellLabel}>Last 30</p>
          <p style={styles.trajectoryCellNumberActive}>{recentCount}</p>
        </div>
      </div>
      <p style={{ ...styles.trajectoryDelta, color: deltaColor }}>
        {deltaArrow && <span style={{ marginRight: '4px' }}>{deltaArrow}</span>}
        {deltaText}
      </p>
    </div>
  )
}

// ===================================================================
// TILE: WHAT YOU NOTED BEFORE
// ===================================================================
function WhatYouNotedBeforeTile({ logs }) {
  const memories = pickMemories(logs, 2)
  if (memories.length === 0) return null

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>What you noted before</p>
      <div style={styles.memoryList}>
        {memories.map(log => {
          const daysAgo = Math.floor(
            (Date.now() - new Date(log.created_at)) / (1000 * 60 * 60 * 24)
          )
          return (
            <div key={log.id} style={styles.memoryRow}>
              <p style={styles.memoryDate}>
                {daysAgo} {daysAgo === 1 ? 'day' : 'days'} ago
              </p>
              <p style={styles.memoryDetail}>
                {TIME_LABELS[log.time_of_day] || log.time_of_day}
                {' · '}
                {CONTEXT_LABELS[log.context] || log.context}
                {' · '}
                {FEELING_LABELS[log.feeling_after] || log.feeling_after}
              </p>
            </div>
          )
        })}
      </div>
      <p style={styles.tileHelperText}>Your earlier self, surfacing.</p>
    </div>
  )
}

function pickMemories(logs, count) {
  if (logs.length === 0) return []
  const seed = Math.abs(hashString(new Date().toDateString()))
  const shuffled = [...logs]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed + i * 31) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

// ===================================================================
// TILE: DAILY REFLECTION PROMPT (demoted)
// ===================================================================
function ReflectPromptTile({ todayLogged, onLogged }) {
  const todayKey = new Date().toDateString()
  const promptIdx = Math.abs(hashString(todayKey + 'reflect')) % REFLECT_PROMPTS.length
  const prompt = REFLECT_PROMPTS[promptIdx]

  const [selectedOption, setSelectedOption] = useState(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(todayLogged)

  const handleSelect = async (option) => {
    if (done || saving) return
    setSelectedOption(option)
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: newRow, error } = await supabase
        .from('free_reflections')
        .insert({
          user_id: user.id,
          prompt_id: prompt.id,
          prompt_text: prompt.question,
          response: option,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to save reflection:', error)
        setSaving(false)
        setSelectedOption(null)
        alert('Could not save. Please try again.')
        return
      }

      setDone(true)
      setSaving(false)
      if (onLogged && newRow) onLogged(newRow)
    } catch (err) {
      console.error(err)
      setSaving(false)
      setSelectedOption(null)
    }
  }

  if (done) {
    return (
      <div style={{ ...styles.tile, ...styles.tileLogged }}>
        <p style={styles.tileEyebrow}>Today's reflection</p>
        <div style={styles.loggedRow}>
          <span style={styles.checkmark}>✓</span>
          <p style={styles.loggedText}>You reflected today. Come back tomorrow.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Today's reflection</p>
      <h2 style={styles.tileTitle}>{prompt.question}</h2>
      <div style={styles.optionsGrid}>
        {prompt.options.map(option => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            disabled={saving}
            style={{
              ...styles.optionChip,
              ...(selectedOption === option ? styles.optionChipSelected : {}),
              ...(saving && selectedOption !== option ? styles.optionChipFading : {}),
            }}
          >
            {option}
          </button>
        ))}
      </div>
      <p style={styles.tileHelperText}>
        Optional. A side question while you log and weigh.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: RECENT REFLECTIONS (demoted)
// ===================================================================
function RecentReflectionsTile({ reflections }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Recent answers</p>
      <h3 style={styles.tileSubtitleHeader}>From past daily reflections</h3>
      <div style={styles.reflectionsList}>
        {reflections.map(r => {
          const date = new Date(r.created_at)
          const dayLabel = formatDayLabel(date)
          return (
            <div key={r.id} style={styles.reflectionRow}>
              <p style={styles.reflectionDate}>{dayLabel}</p>
              <p style={styles.reflectionPrompt}>{r.prompt_text}</p>
              <p style={styles.reflectionResponse}>{r.response}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ===================================================================
// HELPERS
// ===================================================================
// ===================================================================
// TILE: TODAY'S CHECK-IN (hero, shared signal)
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
              {m?.label || 'Noted'}{checkin.felt_pull ? ' \u00b7 the pull showed up' : ''}
            </p>
            <p style={styles.checkinSummarySub}>
              Energy {checkin.energy ?? '\u2013'}/5
              {checkin.note ? ` \u00b7 \u201c${checkin.note}\u201d` : ''}
            </p>
          </div>
        </div>
        <button onClick={onOpen} style={styles.checkinEditBtn}>Edit today's check-in</button>
      </div>
    )
  }
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Today's weather</p>
      <h2 style={styles.tileTitle}>How are you, really?</h2>
      <p style={styles.tileBody}>
        A quiet half-minute. Mood, energy, whether the pull came by. Nobody sees it but you.
      </p>
      <button onClick={onOpen} style={styles.checkinCtaBtn}>Check in</button>
    </div>
  )
}

// ===================================================================
// TILE: EMOTIONAL BALANCE METERS (reflect-specific, new)
// ===================================================================
// Three spectrums the user marks. Each save inserts a free_stage_signals
// row (signal_type 'reflect_balance', payload {axis: 1..5}), building a
// time series the Mirror reads as the push/pull over the contemplation.
const BALANCE_AXES = [
  { key: 'guilt_relief', left: 'Guilt', right: 'Relief' },
  { key: 'control_dependence', left: 'Control', right: 'Dependence' },
  { key: 'peace_escape', left: 'Peace', right: 'Escape' },
]

function BalanceMetersTile({ latest, onSaved }) {
  const init = (k) => latest?.payload?.[k] ?? 3
  const [vals, setVals] = useState({
    guilt_relief: init('guilt_relief'),
    control_dependence: init('control_dependence'),
    peace_escape: init('peace_escape'),
  })
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const setAxis = (k, v) => {
    setVals(prev => ({ ...prev, [k]: v }))
    setJustSaved(false)
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: saved, error } = await supabase
        .from('free_stage_signals')
        .insert({
          user_id: user.id, stage: 'reflect',
          signal_type: 'reflect_balance', payload: vals,
        })
        .select().single()
      if (error) {
        console.error('Failed to save balance:', error)
        alert('Could not save. Please try again.')
        setSaving(false); return
      }
      if (onSaved) onSaved(saved)
      setSaving(false); setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2500)
    } catch (err) {
      console.error(err); setSaving(false)
    }
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Where it sits today</p>
      <h2 style={styles.tileTitle}>The feeling, on three lines.</h2>
      <p style={styles.tileBody}>
        No middle is &ldquo;correct.&rdquo; Just mark where today actually falls.
      </p>

      <div style={styles.balanceList}>
        {BALANCE_AXES.map(axis => (
          <div key={axis.key} style={styles.balanceAxis}>
            <div style={styles.balanceLabels}>
              <span>{axis.left}</span><span>{axis.right}</span>
            </div>
            <div style={styles.balanceTrack}>
              <div style={styles.balanceTrackLine} />
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setAxis(axis.key, n)}
                  disabled={saving}
                  style={{ ...styles.balanceDot, ...(vals[axis.key] === n ? styles.balanceDotOn : {}) }}
                  aria-label={`${axis.left} to ${axis.right}, position ${n}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving} style={styles.balanceSaveBtn}>
        {saving ? 'Saving\u2026' : justSaved ? 'Saved \u2713' : (latest ? 'Update' : 'Save how it sits')}
      </button>
      <p style={styles.tileHelperText}>
        These build a quiet picture of the push and pull over time.
      </p>
    </div>
  )
}

const COST_HORIZONS = [
  { label: '2 weeks',  days: 14 },
  { label: '1 month',  days: 30 },
  { label: '3 months', days: 91 },
  { label: '6 months', days: 182 },
  { label: '9 months', days: 273 },
  { label: '1 year',   days: 365 },
  { label: '15 months', days: 456 },
  { label: '18 months', days: 548 },
  { label: '2 years',  days: 730 },
  { label: '3 years',  days: 1095 },
  { label: '4 years',  days: 1460 },
  { label: '5 years',  days: 1825 },
]

const RATIONALIZATIONS = [
  "I earned it today",
  "I'll quit next week",
  "Just one won't hurt",
  "I need it to sleep",
  "I'm too stressed",
  "I can control it",
  "Everyone does it",
  "It's not that bad",
  "I'll make up for it",
  "I've had a hard day",
  "I deserve a break",
  "It's the only thing that helps",
  "I'll start fresh tomorrow",
  "No one will know",
  "I'm not as bad as others",
]

const DISSONANCE_VALUES = [
  'scale my career',
  'buy a home',
  'be present for my family',
  'get my health back',
  'feel proud of myself',
  'be free of this',
  'be a better parent',
  'sleep properly again',
  'trust myself again',
  'save real money',
]

const DISSONANCE_ACTIONS = [
  'numb out',
  'spend my money',
  'hide from everyone',
  'waste the night',
  'break my own word',
  'escape',
  'put it off again',
  'lie to myself',
  'lose the morning',
]

const DISSONANCE_DRIFT = ['Further from it', 'Slipping back', 'Standing still', 'Inching closer', 'Closer to it']

// ===================================================================
// ACTIVITY SHEET — shared blurred-backdrop popup card
// ===================================================================
// Keeps the home clean: every interaction happens in here, never inline.
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

// Shared launcher — the warm dark card (urge-velocity look). No options inline.
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
// TILE: COMPOUNDING COST — the time machine
// ===================================================================
function CompoundingCostTile({ substanceLabel }) {
  const [open, setOpen] = useState(false)
  const [cost, setCost] = useState('')
  const [hours, setHours] = useState('')
  const [idx, setIdx] = useState(0)
  const [maxIdx, setMaxIdx] = useState(0)
  const [rowId, setRowId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedCost, setSavedCost] = useState(null)
  const [savedHours, setSavedHours] = useState(null)
  const [savedMax, setSavedMax] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('free_stage_signals')
        .select('id, payload').eq('user_id', user.id).eq('stage', 'reflect')
        .eq('signal_type', 'reflect_cost')
        .order('created_at', { ascending: false }).limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row) {
        setRowId(row.id)
        const pl = row.payload || {}
        if (pl.daily_cost != null) { setCost(String(pl.daily_cost)); setSavedCost(pl.daily_cost) }
        if (pl.daily_hours != null) { setHours(String(pl.daily_hours)); setSavedHours(pl.daily_hours) }
        if (pl.max_horizon != null) { setMaxIdx(pl.max_horizon); setSavedMax(pl.max_horizon) }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const slide = (v) => { setIdx(v); if (v > maxIdx) setMaxIdx(v) }

  const c = parseFloat(cost) || 0
  const hr = parseFloat(hours) || 0
  const h = COST_HORIZONS[idx]
  const totalCost = Math.round(c * h.days)
  const totalHours = Math.round(hr * h.days)
  const fullDays = Math.round(totalHours / 24)
  const hasInput = c > 0 || hr > 0
  const fmt = (n) => n.toLocaleString('en-IN')

  const done = savedCost != null || savedHours != null
  const summary = done
    ? `${savedCost ? `₹${fmt(savedCost)}/day` : ''}${savedCost && savedHours ? ' · ' : ''}${savedHours ? `${savedHours}h/day` : ''}${savedMax != null ? ` — looked ${COST_HORIZONS[savedMax].label} ahead` : ''}`
    : 'See what a single day really costs, compounded forward.'

  const handleSave = async () => {
    if (saving || !hasInput) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const finalMax = Math.max(maxIdx, idx)
    const payload = { daily_cost: c, daily_hours: hr, max_horizon: finalMax }
    let ok = false
    if (rowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      ok = !error
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage: 'reflect', signal_type: 'reflect_cost', payload }).select('id').single()
      ok = !error && !!data
      if (ok) setRowId(data.id)
    }
    setSaving(false)
    if (ok) { setSavedCost(c); setSavedHours(hr); setSavedMax(finalMax); setOpen(false) }
    else alert('Could not save. Please try again.')
  }

  return (
    <>
      <Launcher icon="💸" title="The real cost, over time" summary={summary} done={done} onOpen={() => setOpen(true)} />
      <ActivitySheet open={open} onClose={() => setOpen(false)}
        eyebrow="The real cost · over time" title="Run the numbers forward">
        <p style={styles.sheetLead}>
          Be honest about what a single day{substanceLabel ? ` of ${substanceLabel}` : ''} costs you. Then watch it compound.
        </p>
        <div style={styles.costInputs}>
          <div style={styles.costField}>
            <label style={styles.costLabel}>Daily cost (₹)</label>
            <input type="number" inputMode="numeric" value={cost} placeholder="0"
              onChange={(e) => setCost(e.target.value)} style={styles.costInput} />
          </div>
          <div style={styles.costField}>
            <label style={styles.costLabel}>Hours lost / day</label>
            <input type="number" inputMode="decimal" value={hours} placeholder="0"
              onChange={(e) => setHours(e.target.value)} style={styles.costInput} />
          </div>
        </div>

        <p style={styles.costHorizonLabel}>Looking ahead: <strong>{h.label}</strong></p>
        <input type="range" min={0} max={COST_HORIZONS.length - 1} step={1} value={idx}
          onChange={(e) => slide(parseInt(e.target.value, 10))} style={styles.costSlider} />
        <div style={styles.costEnds}>
          <span>{COST_HORIZONS[0].label}</span>
          <span>{COST_HORIZONS[COST_HORIZONS.length - 1].label}</span>
        </div>

        {hasInput ? (
          <div style={styles.costProjection}>
            <p style={styles.costProjLead}>At this rate, in {h.label} you will</p>
            {c > 0 && <p style={styles.costProjBig}>spend ₹{fmt(totalCost)}</p>}
            {hr > 0 && <p style={styles.costProjBig}>lose {fmt(totalHours)} hours</p>}
            {hr > 0 && <p style={styles.costProjSub}>that's {fmt(fullDays)} full days of your life</p>}
          </div>
        ) : (
          <p style={styles.tileHelperText}>Enter a daily cost or hours to watch it compound.</p>
        )}

        <button onClick={handleSave} disabled={saving || !hasInput}
          style={{ ...styles.sheetSaveBtn, ...(!hasInput ? styles.costSaveBtnDim : {}) }}>
          {saving ? 'Saving…' : 'Save this'}
        </button>
      </ActivitySheet>
    </>
  )
}

// ===================================================================
// TILE: RATIONALIZATION GRID — name the lie
// ===================================================================
function RationalizationGridTile() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState([])
  const [loudest, setLoudest] = useState(null)
  const [rowId, setRowId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedLies, setSavedLies] = useState(null)
  const [savedLoudest, setSavedLoudest] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('free_stage_signals')
        .select('id, payload').eq('user_id', user.id).eq('stage', 'reflect')
        .eq('signal_type', 'reflect_rationalization').eq('payload->>date', localDateStr())
        .order('created_at', { ascending: false }).limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row) { setRowId(row.id); const lies = row.payload?.lies || []; setSelected(lies); setSavedLies(lies); setLoudest(row.payload?.loudest || null); setSavedLoudest(row.payload?.loudest || null) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const toggle = (lie) => setSelected(prev => prev.includes(lie) ? prev.filter(x => x !== lie) : [...prev, lie])

  const done = savedLies != null
  const summary = done
    ? (savedLies.length ? `${savedLies.length} named today — "${savedLies[0]}"${savedLies.length > 1 ? ' …' : ''}` : 'A clear day — no lies logged.')
    : 'Name the excuses your brain tried to sell you today.'

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { lies: selected, loudest: selected.includes(loudest) ? loudest : null, date: localDateStr() }
    let ok = false
    if (rowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      ok = !error
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage: 'reflect', signal_type: 'reflect_rationalization', payload }).select('id').single()
      ok = !error && !!data
      if (ok) setRowId(data.id)
    }
    setSaving(false)
    if (ok) { setSavedLies(selected); setSavedLoudest(selected.includes(loudest) ? loudest : null); setOpen(false) }
    else alert('Could not save. Please try again.')
  }

  return (
    <>
      <Launcher icon="🧠" title="Which lies today?" summary={summary} done={done} onOpen={() => setOpen(true)} />
      <ActivitySheet open={open} onClose={() => setOpen(false)}
        eyebrow="The stories · today" title="Which lies did your brain try to sell you today?">
        <p style={styles.sheetLead}>
          Naming the trick drains its power. No judgment — the addiction writes these, not you.
        </p>
        <div style={styles.ratGrid}>
          {RATIONALIZATIONS.map(lie => (
            <button key={lie} onClick={() => toggle(lie)} disabled={saving}
              style={{ ...styles.ratPill, ...(selected.includes(lie) ? styles.ratPillOn : {}) }}>
              {lie}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <>
            <p style={styles.dissLabel}>Which one was loudest today?</p>
            <div style={styles.ratGrid}>
              {selected.map(lie => (
                <button key={lie} onClick={() => setLoudest(lie)} disabled={saving}
                  style={{ ...styles.ratPill, ...(loudest === lie ? styles.ratPillOn : {}) }}>
                  {lie}
                </button>
              ))}
            </div>
          </>
        )}
        <button onClick={handleSave} disabled={saving} style={styles.sheetSaveBtn}>
          {saving ? 'Saving…' : "Log today's friction"}
        </button>
      </ActivitySheet>
    </>
  )
}

// ===================================================================
// TILE: DISSONANCE EQUATION — your want, next to the habit
// ===================================================================
function DissonanceTile() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(null)
  const [action, setAction] = useState(null)
  const [drift, setDrift] = useState(null)
  const [rowId, setRowId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedValue, setSavedValue] = useState(null)
  const [savedAction, setSavedAction] = useState(null)
  const [savedDrift, setSavedDrift] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('free_stage_signals')
        .select('id, payload').eq('user_id', user.id).eq('stage', 'reflect')
        .eq('signal_type', 'reflect_dissonance').eq('payload->>date', localDateStr())
        .order('created_at', { ascending: false }).limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row) {
        setRowId(row.id)
        setValue(row.payload?.value || null); setSavedValue(row.payload?.value || null)
        setAction(row.payload?.action || null); setSavedAction(row.payload?.action || null)
        setDrift(row.payload?.drift || null); setSavedDrift(row.payload?.drift || null)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const done = savedValue != null && savedAction != null && savedDrift != null
  const summary = done
    ? `Want to ${savedValue} — chose to ${savedAction}.`
    : 'Put your biggest want right next to the habit.'

  const handleSave = async () => {
    if (saving || !value || !action || !drift) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { value, action, drift, date: localDateStr() }
    let ok = false
    if (rowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      ok = !error
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage: 'reflect', signal_type: 'reflect_dissonance', payload }).select('id').single()
      ok = !error && !!data
      if (ok) setRowId(data.id)
    }
    setSaving(false)
    if (ok) { setSavedValue(value); setSavedAction(action); setSavedDrift(drift); setOpen(false) }
    else alert('Could not save. Please try again.')
  }

  return (
    <>
      <Launcher icon="⚖️" title="The friction" summary={summary} done={done} onOpen={() => setOpen(true)} />
      <ActivitySheet open={open} onClose={() => setOpen(false)}
        eyebrow="Two truths · today" title="The friction">
        <p style={styles.sheetLead}>
          These two can't share the same life. Put them side by side.
        </p>

        <p style={styles.dissLabel}>I deeply want to…</p>
        <div style={styles.dissGroup}>
          {DISSONANCE_VALUES.map(v => (
            <button key={v} onClick={() => setValue(v)} disabled={saving}
              style={{ ...styles.dissPill, ...(value === v ? styles.dissPillValueOn : {}) }}>{v}</button>
          ))}
        </div>

        <p style={styles.dissLabel}>…but today I'm choosing to</p>
        <div style={styles.dissGroup}>
          {DISSONANCE_ACTIONS.map(a => (
            <button key={a} onClick={() => setAction(a)} disabled={saving}
              style={{ ...styles.dissPill, ...(action === a ? styles.dissPillActionOn : {}) }}>{a}</button>
          ))}
        </div>

        {value && action && (
          <div style={styles.dissEquation}>
            <p style={styles.dissEqText}>I want to <strong>{value}</strong></p>
            <p style={styles.dissEqVs}>but today I chose to</p>
            <p style={styles.dissEqTextAlt}><strong>{action}</strong></p>
            <p style={styles.dissEqNote}>Something has to give.</p>
          </div>
        )}

        {value && action && (
          <>
            <p style={styles.dissLabel}>Today, on balance, that moved you…</p>
            <div style={styles.dissGroup}>
              {DISSONANCE_DRIFT.map(d => (
                <button key={d} onClick={() => setDrift(d)} disabled={saving}
                  style={{ ...styles.dissPill, ...(drift === d ? styles.dissPillValueOn : {}) }}>{d}</button>
              ))}
            </div>
          </>
        )}

        <button onClick={handleSave} disabled={saving || !value || !action || !drift}
          style={{ ...styles.sheetSaveBtn, ...((!value || !action || !drift) ? styles.costSaveBtnDim : {}) }}>
          {saving ? 'Saving…' : 'Hold this up'}
        </button>
      </ActivitySheet>
    </>
  )
}

function localDateStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

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
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === today) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

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
  toolBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '18px 10px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  toolIcon: { color: '#854F0B', display: 'flex' },
  toolLabel: { fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', textAlign: 'center', lineHeight: 1.3 },
  surfaceToggle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 2px', background: 'transparent', border: 'none', borderTop: '1px solid rgba(217,194,138,0.4)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' },
  surfaceToggleText: { display: 'flex', flexDirection: 'column', gap: '5px' },
  surfaceHint: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  surfaceChevron: { fontSize: '18px', color: '#854F0B', flexShrink: 0 },
  surfaceBody: { marginTop: '8px' },
  oracleLink: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', marginTop: '8px', padding: '14px', background: 'transparent', border: 'none', borderTop: '1px solid rgba(217,194,138,0.4)', color: '#854F0B', fontSize: '13px', fontFamily: 'Georgia, serif', fontStyle: 'italic', cursor: 'pointer' },
  oracleLinkArrow: { fontSize: '14px' },
  toolSheetWrap: { width: '100%', maxWidth: '430px', maxHeight: '90vh', overflowY: 'auto' },
  toolSheetClose: { display: 'block', marginLeft: 'auto', marginBottom: '10px', width: '32px', height: '32px', borderRadius: '50%', border: '0.5px solid #E0D5C2', background: 'white', color: '#6B5C4A', fontSize: '13px', cursor: 'pointer', lineHeight: 1 },
  // launcher cards (warm dark — the urge-velocity look)
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
  // compounding cost (sheet internals)
  costInputs: { display: 'flex', gap: '10px', marginBottom: '16px' },
  costField: { flex: 1 },
  costLabel: { display: 'block', fontSize: '11px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: '6px' },
  costInput: { width: '100%', boxSizing: 'border-box', padding: '11px 12px', background: 'white', border: '0.5px solid #DDCFB6', borderRadius: '10px', fontSize: '16px', color: '#2A1F15', fontFamily: 'Georgia, serif', outline: 'none' },
  costHorizonLabel: { fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: '4px 0 8px', textAlign: 'center' },
  costSlider: { width: '100%', accentColor: '#854F0B', margin: '4px 0 6px' },
  costEnds: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif' },
  costProjection: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', borderRadius: '16px', padding: '20px', textAlign: 'center', marginBottom: '14px' },
  costProjLead: { fontSize: '13px', color: 'rgba(250,247,241,0.7)', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 8px' },
  costProjBig: { fontSize: '24px', color: '#FAF7F1', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 2px', lineHeight: 1.2 },
  costProjSub: { fontSize: '12.5px', color: '#D9B57A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '8px 0 0' },
  costSaveBtnDim: { opacity: 0.45, cursor: 'not-allowed' },
  // rationalization grid (sheet internals)
  ratGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' },
  ratPill: { padding: '10px 14px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '20px', fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  ratPillOn: { background: 'linear-gradient(180deg, #6E3A1C 0%, #3A2415 100%)', color: '#FAF7F1', border: '0.5px solid #3A2415' },
  // dissonance (sheet internals)
  dissLabel: { fontSize: '13px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '6px 0 8px' },
  dissGroup: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' },
  dissPill: { padding: '9px 14px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '20px', fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  dissPillValueOn: { background: 'linear-gradient(180deg, #2F5E2A 0%, #1E3D1A 100%)', color: '#FAF7F1', border: '0.5px solid #1E3D1A' },
  dissPillActionOn: { background: 'linear-gradient(180deg, #6E3A1C 0%, #3A2415 100%)', color: '#FAF7F1', border: '0.5px solid #3A2415' },
  dissEquation: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', borderRadius: '16px', padding: '20px', textAlign: 'center', marginBottom: '14px' },
  dissEqText: { fontSize: '18px', color: '#9FD17F', fontFamily: 'Georgia, serif', margin: '0 0 6px', lineHeight: 1.3 },
  dissEqVs: { fontSize: '12px', color: 'rgba(250,247,241,0.6)', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 6px' },
  dissEqTextAlt: { fontSize: '18px', color: '#E0975A', fontFamily: 'Georgia, serif', margin: '0 0 10px', lineHeight: 1.3 },
  dissEqNote: { fontSize: '12.5px', color: '#D9B57A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0 },
  // --- v2 additions: check-in hero + emotional-balance meters ---
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
  balanceList: { display: 'flex', flexDirection: 'column', gap: '16px', margin: '4px 0 16px' },
  balanceAxis: { display: 'flex', flexDirection: 'column', gap: '8px' },
  balanceLabels: {
    display: 'flex', justifyContent: 'space-between', fontSize: '12px',
    color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic',
  },
  balanceTrack: { position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 2px' },
  balanceTrackLine: { position: 'absolute', left: '8px', right: '8px', top: '50%', height: '1px', background: '#E8DFD0' },
  balanceDot: {
    position: 'relative', width: '18px', height: '18px', borderRadius: '50%',
    background: '#FFFFFF', border: '1px solid #DCCFB8', cursor: 'pointer',
    transition: 'all 0.15s', padding: 0,
  },
  balanceDotOn: { background: '#854F0B', border: '1px solid #6E3F08', transform: 'scale(1.25)', boxShadow: '0 2px 6px rgba(80,50,20,0.25)' },
  balanceSaveBtn: {
    width: '100%', padding: '13px', background: 'white', color: '#3A2A1C',
    border: '0.5px solid #D9CBB4', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(80,50,20,0.06)',
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
    padding: '18px 18px 16px',
    boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
  },
  tileLogged: {
    background: 'linear-gradient(180deg, #F6FAE9 0%, #ECF3D5 100%)',
    border: '0.5px solid #C2D49A',
  },
  tileEyebrow: {
    fontSize: '10.5px', color: '#A07A3C',
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
    lineHeight: 1.6, margin: '0 0 14px',
  },
  tileSubtitleHeader: {
    fontSize: '14px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    margin: '0 0 12px',
  },
  tileHelperText: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '12px 0 0', textAlign: 'center',
  },

  // GREETING
  greetingTile: { textAlign: 'left', padding: '8px 4px 4px' },
  greetingEyebrow: {
    fontSize: '10px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.24em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
  },
  greetingTitle: {
    fontSize: '26px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.2, margin: '0 0 10px', letterSpacing: '-0.01em',
  },
  greetingSubtitle: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.55, margin: 0,
  },
  substanceEm: {
    color: '#854F0B', fontWeight: 500, fontStyle: 'italic',
  },

  // WEIGHING — value display + slider
  weighingValueDisplay: {
    textAlign: 'center',
    marginBottom: '14px',
  },
  weighingValueNumber: {
    fontSize: '42px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1,
    margin: '0 0 4px',
    fontVariantNumeric: 'tabular-nums',
  },
  weighingValueDescriptor: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  sliderContainer: {
    marginTop: '6px',
    marginBottom: '18px',
    padding: '0 4px',
  },
  sliderLabelsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  sliderEndLabel: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    letterSpacing: '0.04em',
  },

  // WEIGHING — journal
  journalLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
  },
  journalTextarea: {
    width: '100%',
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    resize: 'vertical',
    minHeight: '70px',
    boxSizing: 'border-box',
    outline: 'none',
    boxShadow: 'inset 0 1px 2px rgba(80,50,20,0.04)',
  },

  // WEIGHING — save button
  weighingSaveBtn: {
    width: '100%',
    padding: '14px',
    marginTop: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
    transition: 'opacity 0.2s',
  },
  weighingSaveBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },

  // WEIGHING — trajectory chart
  weighingDivider: {
    height: '0.5px',
    background: '#E0D5C2',
    margin: '20px 0 14px',
  },
  trajectoryHeading: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 10px',
  },
  trajectoryWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  trajectoryChart: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  trajectorySummary: {
    fontSize: '12px',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '4px 0 0',
  },

  // QUICK LOG SECONDARY
  quickLogBtnSecondary: {
    width: '100%',
    padding: '14px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(80,50,20,0.05)',
  },

  // INSTANCE TRAJECTORY MIRROR
  meterEmptyTitle: {
    fontSize: '16px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    fontStyle: 'italic',
    margin: '0 0 8px',
  },
  trajectoryEmptyBtn: {
    width: '100%',
    padding: '12px',
    marginTop: '4px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(80,50,20,0.05)',
  },
  trajectoryCount: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    marginBottom: '6px',
  },
  trajectoryNumber: {
    fontSize: '38px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1,
    margin: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  trajectoryNumberLabel: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  trajectoryCompareRow: {
    display: 'flex',
    alignItems: 'stretch',
    marginBottom: '14px',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '14px',
    overflow: 'hidden',
  },
  trajectoryCell: {
    flex: 1,
    padding: '14px 8px 12px',
    textAlign: 'center',
  },
  trajectoryCellLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
  },
  trajectoryCellNumber: {
    fontSize: '28px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: 0,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  trajectoryCellNumberActive: {
    fontSize: '28px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: 0,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  trajectoryDivider: {
    width: '0.5px',
    background: '#E0D5C2',
  },
  trajectoryDelta: {
    fontSize: '12px',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    textAlign: 'center',
  },

  // MEMORY
  memoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '4px',
  },
  memoryRow: {
    padding: '12px 14px',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '12px',
  },
  memoryDate: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 4px',
  },
  memoryDetail: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0,
    lineHeight: 1.5,
  },

  // OPTIONS GRID (daily prompt)
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  optionChip: {
    padding: '12px 10px',
    background: 'white',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
    lineHeight: 1.4,
  },
  optionChipSelected: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: '0.5px solid #241710',
    boxShadow: '0 4px 12px rgba(40,25,10,0.25)',
  },
  optionChipFading: { opacity: 0.4 },

  // LOGGED STATE
  loggedRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
  },
  checkmark: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '0.5px solid #C2D49A',
    color: '#3B6D11', fontSize: '16px', fontWeight: 500,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  loggedText: {
    fontSize: '14px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: 0, lineHeight: 1.5,
  },

  // RECENT REFLECTIONS
  reflectionsList: {
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  reflectionRow: {
    padding: '10px 12px',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '10px',
  },
  reflectionDate: {
    fontSize: '10px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 4px',
  },
  reflectionPrompt: {
    fontSize: '12px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 3px', lineHeight: 1.4,
  },
  reflectionResponse: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    margin: 0, lineHeight: 1.4,
  },
}