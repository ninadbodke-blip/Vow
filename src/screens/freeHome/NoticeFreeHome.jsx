import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import QuickLogModal from './QuickLogModal'
import BottomNav from '../../components/BottomNav'

// ===================================================================
// NOTICE-FREE HOME
// ===================================================================
// Stage: Notice (precontemplation). User hasn't decided anything is wrong.
// Tone: curious, observational, no pressure, no judgment.
//
// Engine: Quick Log → week meter + mirror unlocked at 5 logs.
// Demoted (lower on page): daily prompt + recent noticings.
// Nav: bottom tabs handle Home / Mirror / Motivation / Vow Path.
//      Profile (state-picker + sign out) lives behind humanoid icon top-right.
// ===================================================================

const MIRROR_UNLOCK_AT = 5

const TIME_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  late_night: 'Late night',
}

const TIME_PLURAL = {
  morning: 'mornings',
  afternoon: 'afternoons',
  evening: 'evenings',
  late_night: 'late nights',
}

const CONTEXT_LABELS = {
  alone: 'alone',
  with_friends: 'with friends',
  with_family: 'with family',
  with_partner: 'with a partner',
  at_work: 'at work',
  other: 'other settings',
}

const FEELING_LABELS = {
  numb: 'numb',
  regret: 'regret',
  relief: 'relief',
  indifferent: 'indifferent',
  tired: 'tired',
  other: 'other',
}

const TIME_BUCKETS = ['morning', 'afternoon', 'evening', 'late_night']

// ===================================================================
// DAILY PROMPT BANK
// ===================================================================
const NOTICE_PROMPTS = [
  {
    id: 'when_today',
    question: 'When did it come up today?',
    options: ['Morning', 'Afternoon', 'Evening', 'Late night', 'Not yet today', "Don't remember"],
  },
  {
    id: 'how_after',
    question: 'How did you feel after, the last time?',
    options: ['Relieved', 'Numb', 'Regretful', 'Indifferent', 'Tired', "Don't remember"],
  },
  {
    id: 'what_pulled',
    question: 'What pulled you toward it, last time?',
    options: ['Stress', 'Boredom', 'Habit / time of day', 'Social setting', 'Hard emotion', 'Just happened'],
  },
  {
    id: 'who_around',
    question: 'Who was around when it happened, last time?',
    options: ['Alone', 'With friends', 'With family', 'With partner', 'At work', 'Other'],
  },
  {
    id: 'did_plan',
    question: 'Did you plan it, or did it just happen?',
    options: ['I planned it', 'It just happened', 'Somewhere in between', "Don't remember"],
  },
  {
    id: 'cost_today',
    question: 'What did it cost you today?',
    options: ['Time', 'Money', 'Energy', 'Sleep', 'Nothing I can name', 'Not sure yet'],
  },
  {
    id: 'thought_after',
    question: 'What did you think about it afterward?',
    options: ['That was fine', 'That was too much', "I shouldn't have", "Didn't think about it", 'Mixed feelings'],
  },
]

// ===================================================================
// PROFILE ICON (top-right of header)
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
export default function NoticeFreeHome({ progress }) {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [logs, setLogs] = useState([])
  const [totalLogCount, setTotalLogCount] = useState(0)
  const [recentNoticings, setRecentNoticings] = useState([])
  const [todayPromptLogged, setTodayPromptLogged] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, full_name')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.first_name) setFirstName(profile.first_name)
      else if (profile?.full_name) setFirstName(profile.full_name.split(' ')[0])
      else if (user.email) setFirstName(user.email.split('@')[0])

      // Instance logs — recent 50 (covers meter window + mirror sample)
      const { data: logsData } = await supabase
        .from('free_instance_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (logsData) setLogs(logsData)

      // Total count for unlock threshold
      const { count } = await supabase
        .from('free_instance_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if (count !== null) setTotalLogCount(count)

      // Daily prompt history
      const { data: noticings } = await supabase
        .from('free_noticings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (noticings) {
        setRecentNoticings(noticings)
        const today = new Date().toDateString()
        const hasToday = noticings.some(n =>
          new Date(n.created_at).toDateString() === today
        )
        setTodayPromptLogged(hasToday)
      }

      setLoading(false)
    }
    load()
  }, [])

  const handleLogged = (newLog) => {
    setLogs(prev => [newLog, ...prev].slice(0, 50))
    setTotalLogCount(prev => prev + 1)
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
        <GreetingTile firstName={firstName} substanceLabel={progress.substance_label} />

        {/* TILE 2 — QUICK LOG (primary) */}
        <QuickLogTile
          logs={logs}
          totalLogCount={totalLogCount}
          onOpen={() => setModalOpen(true)}
        />

        {/* TILE 3 — WEEK METER */}
        <WeekMeterTile logs={logs} />

        {/* TILE 4 — MIRROR (hidden until 5 logs) */}
        {totalLogCount >= MIRROR_UNLOCK_AT && <MirrorTile logs={logs} />}

        {/* TILE 5 — DAILY PROMPT (demoted) */}
        <NoticePromptTile
          todayLogged={todayPromptLogged}
          onLogged={(newNoticing) => {
            setRecentNoticings(prev => [newNoticing, ...prev].slice(0, 5))
            setTodayPromptLogged(true)
          }}
        />

        {/* TILE 6 — RECENT NOTICINGS (demoted) */}
        {recentNoticings.length > 0 && (
          <RecentNoticingsTile noticings={recentNoticings} />
        )}

        <BottomNav />
      </div>

      {/* QUICK LOG MODAL */}
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
// TILE: QUICK LOG (primary hook)
// ===================================================================
function QuickLogTile({ logs, totalLogCount, onOpen }) {
  const todayCount = logs.filter(l =>
    new Date(l.created_at).toDateString() === new Date().toDateString()
  ).length

  const remainingForMirror = MIRROR_UNLOCK_AT - totalLogCount

  let footerText
  if (totalLogCount === 0) {
    footerText = 'Your first log starts the mirror.'
  } else if (totalLogCount < MIRROR_UNLOCK_AT) {
    footerText = `${remainingForMirror} more ${remainingForMirror === 1 ? 'log' : 'logs'} to unlock your first mirror.`
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
        20 seconds — when, where, how it felt. The data is yours.
      </p>
      <button onClick={onOpen} style={styles.quickLogBtn}>
        + I just did it
      </button>
      <p style={styles.tileHelperText}>{footerText}</p>
    </div>
  )
}

// ===================================================================
// TILE: WEEK METER
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

  if (logs.length === 0) {
    return (
      <div style={styles.tile}>
        <p style={styles.tileEyebrow}>Last 7 days</p>
        <h3 style={styles.meterEmptyTitle}>Start logging to see your week.</h3>
        <p style={styles.tileHelperText}>
          Each entry is a small data point. Patterns emerge fast.
        </p>
      </div>
    )
  }

  const distribution = {}
  for (const bucket of TIME_BUCKETS) distribution[bucket] = 0
  for (const log of thisWeekLogs) {
    if (distribution[log.time_of_day] !== undefined) {
      distribution[log.time_of_day] += 1
    }
  }
  const maxBucket = Math.max(...Object.values(distribution), 1)

  let deltaText, deltaArrow, deltaColor
  if (lastCount === 0 && thisCount === 0) {
    deltaText = 'No comparison yet.'
    deltaArrow = ''
    deltaColor = '#9C8C78'
  } else if (lastCount === 0) {
    deltaText = 'First 7 days of logging.'
    deltaArrow = ''
    deltaColor = '#9C8C78'
  } else if (delta > 0) {
    deltaText = `${delta} more than previous 7 days`
    deltaArrow = '▲'
    deltaColor = '#C5572C'
  } else if (delta < 0) {
    deltaText = `${Math.abs(delta)} fewer than previous 7 days`
    deltaArrow = '▼'
    deltaColor = '#3B6D11'
  } else {
    deltaText = 'Same as previous 7 days'
    deltaArrow = '·'
    deltaColor = '#9C8C78'
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Last 7 days</p>
      <div style={styles.meterCountRow}>
        <p style={styles.meterCount}>{thisCount}</p>
        <p style={styles.meterCountLabel}>
          {thisCount === 1 ? 'moment' : 'moments'}
        </p>
      </div>
      <p style={{ ...styles.meterDelta, color: deltaColor }}>
        {deltaArrow && <span style={{ marginRight: '4px' }}>{deltaArrow}</span>}
        {deltaText}
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
// TILE: MIRROR (threshold-unlocked)
// ===================================================================
function MirrorTile({ logs }) {
  const topTime = computeTopValue(logs, 'time_of_day')
  const topContext = computeTopValue(logs, 'context')
  const topFeeling = computeTopValue(logs, 'feeling_after')

  return (
    <div style={styles.tile}>
      <div style={styles.mirrorOrnament}>· · ·</div>
      <p style={styles.mirrorEyebrow}>THE MIRROR</p>
      <p style={styles.mirrorIntro}>
        Patterns from your last {logs.length} {logs.length === 1 ? 'log' : 'logs'}.
      </p>

      <div style={styles.mirrorList}>
        <MirrorRow
          label="When"
          value={`Mostly ${TIME_PLURAL[topTime.value] || topTime.value}`}
          percent={topTime.percent}
        />
        <MirrorRow
          label="Setting"
          value={`Mostly ${CONTEXT_LABELS[topContext.value] || topContext.value}`}
          percent={topContext.percent}
        />
        <MirrorRow
          label="After"
          value={`Mostly ${FEELING_LABELS[topFeeling.value] || topFeeling.value}`}
          percent={topFeeling.percent}
        />
      </div>

      <p style={styles.mirrorFoot}>The looking is the work.</p>
    </div>
  )
}

function MirrorRow({ label, value, percent }) {
  return (
    <div style={styles.mirrorRow}>
      <p style={styles.mirrorRowLabel}>{label}</p>
      <p style={styles.mirrorRowValue}>
        {value}
        <span style={styles.mirrorRowPercent}> · {percent}%</span>
      </p>
    </div>
  )
}

function computeTopValue(logs, field) {
  const counts = {}
  for (const log of logs) {
    const v = log[field]
    counts[v] = (counts[v] || 0) + 1
  }
  let topValue = null
  let topCount = 0
  for (const [v, c] of Object.entries(counts)) {
    if (c > topCount) {
      topValue = v
      topCount = c
    }
  }
  return {
    value: topValue,
    count: topCount,
    percent: logs.length > 0 ? Math.round((topCount / logs.length) * 100) : 0,
  }
}

// ===================================================================
// TILE: DAILY PROMPT (demoted)
// ===================================================================
function NoticePromptTile({ todayLogged, onLogged }) {
  const todayKey = new Date().toDateString()
  const promptIdx = Math.abs(hashString(todayKey)) % NOTICE_PROMPTS.length
  const prompt = NOTICE_PROMPTS[promptIdx]

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
        .from('free_noticings')
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
        console.error('Failed to save noticing:', error)
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
        <p style={styles.tileEyebrow}>Today's question</p>
        <div style={styles.loggedRow}>
          <span style={styles.checkmark}>✓</span>
          <p style={styles.loggedText}>You answered today. Come back tomorrow.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Today's question</p>
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
        Optional. A side question while you log your moments.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: RECENT NOTICINGS (demoted)
// ===================================================================
function RecentNoticingsTile({ noticings }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Recent answers</p>
      <h3 style={styles.tileSubtitleHeader}>From past daily questions</h3>

      <div style={styles.noticingsList}>
        {noticings.map(n => {
          const date = new Date(n.created_at)
          const dayLabel = formatDayLabel(date)
          return (
            <div key={n.id} style={styles.noticingRow}>
              <p style={styles.noticingDate}>{dayLabel}</p>
              <p style={styles.noticingPrompt}>{n.prompt_text}</p>
              <p style={styles.noticingResponse}>{n.response}</p>
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

  // GREETING TILE
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

  // QUICK LOG TILE
  quickLogBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },

  // WEEK METER
  meterEmptyTitle: {
    fontSize: '16px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    fontStyle: 'italic',
    margin: '0 0 8px',
  },
  meterCountRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '4px',
  },
  meterCount: {
    fontSize: '38px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1,
    margin: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  meterCountLabel: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  meterDelta: {
    fontSize: '12px',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 14px',
  },
  meterDistHeading: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '8px 0 8px',
  },
  meterDistList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  meterDistRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  meterDistLabel: {
    fontSize: '12px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    width: '80px',
    flexShrink: 0,
  },
  meterDistBarBg: {
    flex: 1,
    height: '8px',
    background: '#F4ECDD',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  meterDistBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #D9B57A 0%, #B89456 100%)',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  meterDistCount: {
    fontSize: '12px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    width: '20px',
    textAlign: 'right',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },

  // MIRROR
  mirrorOrnament: {
    fontSize: '12px',
    color: '#C9B894',
    letterSpacing: '0.5em',
    textAlign: 'center',
    margin: '0 0 10px',
  },
  mirrorEyebrow: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.32em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
    margin: '0 0 6px',
  },
  mirrorIntro: {
    fontSize: '12px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0 0 16px',
  },
  mirrorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '14px',
  },
  mirrorRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '10px 12px',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '10px',
  },
  mirrorRowLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: 0,
  },
  mirrorRowValue: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: 0,
    lineHeight: 1.4,
  },
  mirrorRowPercent: {
    color: '#9C8C78',
    fontWeight: 400,
    fontStyle: 'italic',
  },
  mirrorFoot: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: 0,
  },

  // OPTIONS GRID (daily prompt chips)
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
  optionChipFading: {
    opacity: 0.4,
  },

  // LOGGED STATE (daily prompt done)
  loggedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  checkmark: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '0.5px solid #C2D49A',
    color: '#3B6D11',
    fontSize: '16px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  loggedText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.5,
  },

  // NOTICINGS LIST
  noticingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  noticingRow: {
    padding: '10px 12px',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '10px',
  },
  noticingDate: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 4px',
  },
  noticingPrompt: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 3px',
    lineHeight: 1.4,
  },
  noticingResponse: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: 0,
    lineHeight: 1.4,
  },
}