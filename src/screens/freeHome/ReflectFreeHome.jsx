import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import QuickLogModal from './QuickLogModal'
import BottomNav from '../../components/BottomNav'

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
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

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

      const weekOfStr = formatDateForDB(getMondayOfWeek(new Date()))
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

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

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

        <GreetingTile firstName={firstName} substanceLabel={progress.substance_label} />

        <WeeklyWeighingTile
          currentWeighing={currentWeighing}
          pastWeighings={pastWeighings}
          onSaved={handleWeighingSaved}
        />

        <QuickLogTile
          logs={logs}
          totalLogCount={totalLogCount}
          onOpen={() => setModalOpen(true)}
        />

        <TrajectoryMirrorTile
          logs={logs}
          totalLogCount={totalLogCount}
          onOpenLog={() => setModalOpen(true)}
        />

        {showMemoryTile && <WhatYouNotedBeforeTile logs={eligibleMemoryLogs} />}

        <ReflectPromptTile
          todayLogged={todayReflectionLogged}
          onLogged={handleReflectionLogged}
        />

        {recentReflections.length > 0 && (
          <RecentReflectionsTile reflections={recentReflections} />
        )}

        <BottomNav />
      </div>

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
      const weekOfStr = formatDateForDB(getMondayOfWeek(new Date()))

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

      <p style={styles.tileEyebrow}>This week</p>
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
        placeholder="What's true this week? 2-4 sentences."
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
              ? "Update this week's weighing"
              : "Save this week's weighing"}
      </button>

      <p style={styles.tileHelperText}>
        {isUpdate
          ? `Last updated ${formatRelativeTime(currentWeighing.updated_at)} · Editable until next Monday.`
          : 'One entry per week. Editable any time until next Monday.'}
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
  const weeks = dataPoints.length

  let summary, summaryColor
  if (delta > 0) {
    summary = `▲ ${delta} points toward stopping over ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
    summaryColor = '#3B6D11'
  } else if (delta < 0) {
    summary = `▼ ${Math.abs(delta)} points toward keeping over ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
    summaryColor = '#854F0B'
  } else {
    summary = `Steady over ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
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