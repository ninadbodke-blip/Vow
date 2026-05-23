import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
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
  'Noticing changes nothing and everything. You\u2019re just learning to see.',
  'No need to fix what you\u2019re only beginning to look at.',
  'The fact that you opened this today is itself a kind of answer.',
  'You\u2019re allowed to just watch for a while.',
  'Patterns don\u2019t judge. They show up when you pay attention.',
  'Whatever you find in here, it was already true. Now you can see it.',
  'Curiosity is gentler than willpower, and it lasts a lot longer.',
  'Some days the weather\u2019s heavy. Logging it doesn\u2019t make it heavier.',
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
]

const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
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

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.topBar}>
          <p style={styles.brandLine}>Vow</p>
          <button onClick={() => navigate('/profile')} style={styles.profileBtn} aria-label="Profile">
            <ProfileIcon />
          </button>
        </div>

        <GreetingTile firstName={firstName} substanceLabel={progress.substance_label} />

        {/* HERO — daily check-in */}
        <TodayCheckinTile checkin={todayCheckin} onOpen={() => setCheckinOpen(true)} />

        {/* JOURNAL (shared) */}
        <JournalTile stage="notice" />

        {/* 7-day awareness strip (mood, not abstinence) */}
        <AwarenessStripTile checkins={recentCheckins} />

        {/* In-home Daily Mirror — gated, fills in */}
        <DailyMirrorTile checkins={recentCheckins} checkinCount={checkinCount} logs={logs} />

        {/* Secondary — log a specific moment */}
        <QuickLogTile logs={logs} totalLogCount={totalLogCount} onOpen={() => setModalOpen(true)} />

        {logs.length > 0 && <WeekMeterTile logs={logs} />}

        <NoticePromptTile
          todayLogged={todayPromptLogged}
          onLogged={(newNoticing) => {
            setRecentNoticings(prev => [newNoticing, ...prev].slice(0, 5))
            setTodayPromptLogged(true)
          }}
        />

        {recentNoticings.length > 0 && <RecentNoticingsTile noticings={recentNoticings} />}

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
          user_id: user.id, prompt_id: prompt.id, prompt_text: prompt.question,
          response: option, created_at: new Date().toISOString(),
        })
        .select().single()
      if (error) {
        console.error('Failed to save noticing:', error)
        setSaving(false); setSelectedOption(null)
        alert('Could not save. Please try again.')
        return
      }
      setDone(true); setSaving(false)
      if (onLogged && newRow) onLogged(newRow)
    } catch (err) {
      console.error(err); setSaving(false); setSelectedOption(null)
    }
  }

  if (done) {
    return (
      <div style={{ ...styles.tile, ...styles.tileLogged }}>
        <p style={styles.tileEyebrow}>Today's question</p>
        <div style={styles.loggedRow}>
          <span style={styles.checkmark}>&#10003;</span>
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
      <p style={styles.tileHelperText}>Optional. A side question while you notice.</p>
    </div>
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