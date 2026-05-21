import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import DailyCheckin, { moodByScore, moodByValue } from './DailyCheckin'
import BottomNav from '../../components/BottomNav'

// ===================================================================
// BUILD-FREE HOME
// ===================================================================
// Stage: Build (maintenance). User has sustained sobriety — months in.
// The acute work of Endure is behind them. The risk now is complacency
// creep. The home reflects that shift: weekly cadence not daily, calmer
// counter, user-defined practices, less crisis-shaped.
//
// Engine (primary, weekly): Pulse Check — "How's it sitting?"
// Secondary: User-defined practices (what they're building).
// Nav: bottom tabs handle Home / Mirror / Motivation / Vow Path.
// ===================================================================

const PULSE_OPTIONS = [
  { value: 'quiet', label: 'Quiet', helper: 'Distant. Barely there.', color: '#7A8C5A' },
  { value: 'stable', label: 'Stable', helper: 'Present but quiet. Holding shape.', color: '#B89456' },
  { value: 'itching', label: 'Itching', helper: 'A tug. Worth noticing.', color: '#C5572C' },
  { value: 'loud', label: 'Loud', helper: 'Hard week. Worth tending to.', color: '#A04C2A' },
]

// Ordinal for the Mirror (1 = quietest week, 4 = hardest).
const PULSE_SCORE = { quiet: 1, stable: 2, itching: 3, loud: 4 }

const MAX_PRACTICES = 5

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
export default function BuildFreeHome({ progress: initialProgress }) {
  const navigate = useNavigate()

  const [progress, setProgress] = useState(initialProgress)
  const [tracker, setTracker] = useState(null)
  const [firstName, setFirstName] = useState('')
  const [todayCheckin, setTodayCheckin] = useState(null)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, full_name')
        .eq('id', user.id)
        .maybeSingle()
      if (profileData?.first_name) setFirstName(profileData.first_name)
      else if (profileData?.full_name) setFirstName(profileData.full_name.split(' ')[0])
      else if (user.email) setFirstName(user.email.split('@')[0])

      const { data: trackers } = await supabase
        .from('trackers')
        .select(`
          *,
          addiction_types (id, name, icon)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at')

      if (trackers && trackers.length > 0) {
        setTracker(trackers[0])
      }

      // ---- daily check-in (shared signal; gentle in maintenance) ----
      const { data: tc } = await supabase
        .from('free_daily_checkins').select('*')
        .eq('user_id', user.id).eq('checkin_date', localDateStr()).maybeSingle()
      if (tc) setTodayCheckin(tc)

      setLoading(false)
    }
    load()
  }, [])

  // === Pulse handlers ===
  const handlePulseSave = async (value) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const weekOf = formatDateForDB(getMondayOfWeek(new Date()))
    const now = new Date().toISOString()
    const currentLog = progress.build_pulse_log || []

    const existingIdx = currentLog.findIndex(e => e.week_of === weekOf)
    let newLog
    if (existingIdx >= 0) {
      newLog = [...currentLog]
      newLog[existingIdx] = { week_of: weekOf, value, logged_at: now }
    } else {
      newLog = [...currentLog, { week_of: weekOf, value, logged_at: now }]
    }

    newLog.sort((a, b) => b.week_of.localeCompare(a.week_of))
    if (newLog.length > 26) newLog = newLog.slice(0, 26)

    setProgress(p => ({ ...p, build_pulse_log: newLog }))

    const { error } = await supabase
      .from('vow_path_progress')
      .update({
        build_pulse_log: newLog,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to save pulse:', error)
      setProgress(p => ({ ...p, build_pulse_log: currentLog }))
      alert('Could not save. Please try again.')
      return
    }

    // Mirror visibility: record the weekly pulse as a build_review signal.
    // (Insert per save; the Mirror reads the latest per week_of.)
    await supabase.from('free_stage_signals').insert({
      user_id: user.id,
      stage: 'build',
      signal_type: 'build_review',
      payload: { pulse: value, pulse_score: PULSE_SCORE[value] ?? null, week_of: weekOf },
    })
  }

  const handleCheckinSaved = (row) => setTodayCheckin(row)

  // === Practice handlers ===
  const handlePracticeAdd = async (text) => {
    if (!text.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const currentPractices = progress.build_practices || []
    if (currentPractices.length >= MAX_PRACTICES) {
      alert(`You can have up to ${MAX_PRACTICES} practices at a time.`)
      return
    }

    const newPractice = {
      id: `prac_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text: text.trim(),
      created_at: new Date().toISOString(),
    }
    const newPractices = [...currentPractices, newPractice]

    setProgress(p => ({ ...p, build_practices: newPractices }))

    const { error } = await supabase
      .from('vow_path_progress')
      .update({
        build_practices: newPractices,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to add practice:', error)
      setProgress(p => ({ ...p, build_practices: currentPractices }))
      alert('Could not save. Please try again.')
    }
  }

  const handlePracticeDelete = async (id) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const currentPractices = progress.build_practices || []
    const newPractices = currentPractices.filter(p => p.id !== id)

    setProgress(p => ({ ...p, build_practices: newPractices }))

    const { error } = await supabase
      .from('vow_path_progress')
      .update({
        build_practices: newPractices,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to delete practice:', error)
      setProgress(p => ({ ...p, build_practices: currentPractices }))
      alert('Could not delete. Please try again.')
    }
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
        <GreetingTile
          firstName={firstName}
          substanceLabel={progress.substance_label}
        />

        {/* TILE 2 — QUIET COUNTER (or setup prompt) */}
        {tracker ? (
          <QuietCounterTile tracker={tracker} />
        ) : (
          <SetupPromptTile
            substanceLabel={progress.substance_label}
            navigate={navigate}
          />
        )}

        {/* TILE — DAILY CHECK-IN (gentle, shared signal) */}
        <TodayCheckinTile checkin={todayCheckin} onOpen={() => setCheckinOpen(true)} />

        {/* TILE 3 — WEEKLY PULSE CHECK */}
        <PulseCheckTile
          pulseLog={progress.build_pulse_log || []}
          onSave={handlePulseSave}
        />

        {/* TILE 4 — PRACTICES */}
        <PracticesTile
          practices={progress.build_practices || []}
          onAdd={handlePracticeAdd}
          onDelete={handlePracticeDelete}
        />

        {/* TILE 5 — ANCHORS */}
        <AnchorsTile navigate={navigate} />

        {/* TILE 6 — ACTION (slim, only if tracker exists) */}
        {tracker && <ActionTile tracker={tracker} navigate={navigate} />}

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
      <p style={styles.tileEyebrow}>A quiet check-in</p>
      <h2 style={styles.tileTitle}>Want to drop in today?</h2>
      <p style={styles.tileBody}>
        Optional, this far in. A half-minute on mood, energy, and how the pull's been &mdash; it keeps your Mirror honest.
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
        This is the long work.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: QUIET COUNTER (calmer than Endure's live ticker)
// ===================================================================
function QuietCounterTile({ tracker }) {
  const startDate = new Date(tracker.start_date)
  const now = new Date()
  const totalDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24))
  const months = Math.floor(totalDays / 30)
  const remainingDays = totalDays - (months * 30)
  const years = Math.floor(months / 12)
  const remainingMonths = months - (years * 12)

  const startDateStr = startDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Identity headline
  let identityHeadline
  if (years >= 1) {
    identityHeadline = `${years} ${years === 1 ? 'year' : 'years'}${remainingMonths > 0 ? `, ${remainingMonths} mo` : ''}`
  } else if (months >= 1) {
    identityHeadline = `${months} ${months === 1 ? 'month' : 'months'}${remainingDays > 0 ? `, ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}` : ''}`
  } else {
    identityHeadline = `${totalDays} ${totalDays === 1 ? 'day' : 'days'}`
  }

  return (
    <div style={styles.counterTile}>
      <p style={styles.counterEyebrow}>Yours</p>
      <p style={styles.counterHeadline}>{identityHeadline}</p>
      <p style={styles.counterFree}>
        free from <span style={styles.counterBold}>{tracker.addiction_types.name}</span>
      </p>
      <p style={styles.counterSince}>Since {startDateStr}</p>
    </div>
  )
}

// ===================================================================
// TILE: SETUP PROMPT (fallback when no tracker)
// ===================================================================
function SetupPromptTile({ substanceLabel, navigate }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Tracker</p>
      <h2 style={styles.tileTitle}>Set up a tracker for {substanceLabel}?</h2>
      <p style={styles.tileBody}>
        Track your time free, savings, and milestones. Optional but useful for
        identity reinforcement at this stage.
      </p>
      <button
        onClick={() => navigate('/onboarding/setup')}
        style={styles.tileSecondaryBtn}
      >
        Set up tracking
      </button>
    </div>
  )
}

// ===================================================================
// TILE: PULSE CHECK
// ===================================================================
function PulseCheckTile({ pulseLog, onSave }) {
  const weekOf = formatDateForDB(getMondayOfWeek(new Date()))
  const thisWeek = pulseLog.find(e => e.week_of === weekOf)
  const [saving, setSaving] = useState(false)

  const handlePick = async (value) => {
    if (saving) return
    setSaving(true)
    try {
      await onSave(value)
    } finally {
      setSaving(false)
    }
  }

  // Recent pulses for inline trajectory (most recent first → display reversed)
  const recentPulses = pulseLog.slice(0, 6).reverse()

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>This week</p>
      <h2 style={styles.tileTitle}>
        {thisWeek ? "How's it sitting?" : "How's it sitting this week?"}
      </h2>
      <p style={styles.tileBody}>
        {thisWeek
          ? 'You can update this any time until next Monday.'
          : 'One tap. Tracks the rhythm of your relationship with the substance.'}
      </p>

      <div style={styles.pulseGrid}>
        {PULSE_OPTIONS.map(opt => {
          const isPicked = thisWeek?.value === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => handlePick(opt.value)}
              disabled={saving}
              style={{
                ...styles.pulseBtn,
                ...(isPicked ? styles.pulseBtnPicked : {}),
                ...(isPicked ? { borderColor: opt.color, background: `${opt.color}14` } : {}),
              }}
            >
              <span
                style={{
                  ...styles.pulseDot,
                  background: opt.color,
                  ...(isPicked ? { boxShadow: `0 0 0 3px ${opt.color}33` } : {}),
                }}
              />
              <span style={styles.pulseLabel}>{opt.label}</span>
              <span style={styles.pulseHelper}>{opt.helper}</span>
            </button>
          )
        })}
      </div>

      {recentPulses.length >= 2 && (
        <>
          <div style={styles.pulseDivider} />
          <p style={styles.pulseTrajLabel}>Recent weeks</p>
          <div style={styles.pulseTrajRow}>
            {recentPulses.map((p, i) => {
              const opt = PULSE_OPTIONS.find(o => o.value === p.value)
              return (
                <div key={i} style={styles.pulseTrajItem}>
                  <span
                    style={{
                      ...styles.pulseTrajDot,
                      background: opt?.color || '#9C8C78',
                    }}
                  />
                  <span style={styles.pulseTrajWeek}>
                    {formatWeekLabel(p.week_of)}
                  </span>
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
// TILE: PRACTICES
// ===================================================================
function PracticesTile({ practices, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!draft.trim() || saving) return
    setSaving(true)
    try {
      await onAdd(draft)
      setDraft('')
      setAdding(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDraft('')
    setAdding(false)
  }

  const atLimit = practices.length >= MAX_PRACTICES

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>What I'm building</p>
      <h2 style={styles.tileTitle}>The practices</h2>
      <p style={styles.tileBody}>
        Habits, routines, or commitments you're growing into the space the
        substance used to take. Keep the list short — three is plenty.
      </p>

      {practices.length === 0 && !adding && (
        <p style={styles.practicesEmpty}>
          Nothing yet. Add one when you're ready.
        </p>
      )}

      {practices.length > 0 && (
        <div style={styles.practicesList}>
          {practices.map(p => (
            <div key={p.id} style={styles.practiceRow}>
              <span style={styles.practiceBullet}>·</span>
              <span style={styles.practiceText}>{p.text}</span>
              <button
                onClick={() => onDelete(p.id)}
                style={styles.practiceDelete}
                aria-label="Delete practice"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div style={styles.practicesAddBlock}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            placeholder="e.g. Read 20 minutes before bed"
            maxLength={80}
            autoFocus
            style={styles.practicesInput}
          />
          <div style={styles.practicesAddBtnRow}>
            <button onClick={handleCancel} style={styles.practicesCancelBtn}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!draft.trim() || saving}
              style={{
                ...styles.practicesSaveBtn,
                ...((!draft.trim() || saving) ? styles.practicesSaveBtnDisabled : {}),
              }}
            >
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      ) : (
        !atLimit && (
          <button onClick={() => setAdding(true)} style={styles.practicesAddBtn}>
            + Add a practice
          </button>
        )
      )}

      {atLimit && !adding && (
        <p style={styles.tileHelperText}>
          {MAX_PRACTICES} is the limit. Delete one before adding another.
        </p>
      )}
    </div>
  )
}

// ===================================================================
// TILE: ANCHORS
// ===================================================================
function AnchorsTile({ navigate }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Anchors</p>
      <h3 style={styles.tileTitle}>The people who'd notice</h3>
      <p style={styles.tileBody}>
        At this stage, anchors are less about crisis and more about staying
        connected. Make sure the list still reflects who's actually in your life.
      </p>
      <button
        onClick={() => navigate('/anchors')}
        style={styles.anchorsBtn}
      >
        Open Anchors
      </button>
    </div>
  )
}

// ===================================================================
// TILE: ACTION (slim — slip/urge still available)
// ===================================================================
function ActionTile({ tracker, navigate }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>If it gets loud</p>
      <div style={styles.actionsRow}>
        <button
          onClick={() => navigate(`/urge/${tracker.id}`)}
          style={{ ...styles.actionBtn, ...styles.actionUrge }}
        >
          <span style={styles.actionIcon}>🌊</span>
          <span style={styles.actionLabel}>Log an urge</span>
        </button>
        <button
          onClick={() => navigate(`/slip/${tracker.id}`)}
          style={{ ...styles.actionBtn, ...styles.actionSlip }}
        >
          <span style={styles.actionIcon}>🫂</span>
          <span style={styles.actionLabel}>I slipped</span>
        </button>
      </div>
      <p style={styles.tileHelperText}>
        Rare doesn't mean impossible. The tools are still here.
      </p>
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

function formatWeekLabel(weekOfStr) {
  const d = new Date(weekOfStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ===================================================================
// STYLES
// ===================================================================
const styles = {
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
    padding: '18px 18px 16px',
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
    lineHeight: 1.6, margin: '0 0 14px',
  },
  tileHelperText: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '12px 0 0', textAlign: 'center',
  },
  tileSecondaryBtn: {
    padding: '12px 18px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(80,50,20,0.05)',
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

  // QUIET COUNTER
  counterTile: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '18px',
    padding: '24px 22px 20px',
    boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
    textAlign: 'left',
  },
  counterEyebrow: {
    fontSize: '10px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.28em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 12px',
  },
  counterHeadline: {
    fontSize: '32px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.1,
    margin: '0 0 6px',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.01em',
  },
  counterFree: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 14px',
    lineHeight: 1.4,
  },
  counterBold: {
    color: '#2A1F15', fontWeight: 500, fontStyle: 'italic',
  },
  counterSince: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    margin: 0,
    letterSpacing: '0.04em',
  },

  // PULSE CHECK
  pulseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  pulseBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    padding: '12px 12px 10px',
    background: 'white',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  pulseBtnPicked: {
    borderWidth: '1px',
    boxShadow: '0 3px 10px rgba(80,50,20,0.08)',
  },
  pulseDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginBottom: '2px',
    transition: 'box-shadow 0.15s',
  },
  pulseLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
  },
  pulseHelper: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.4,
  },

  pulseDivider: {
    height: '0.5px',
    background: '#E0D5C2',
    margin: '18px 0 12px',
  },
  pulseTrajLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
  },
  pulseTrajRow: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  pulseTrajItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  pulseTrajDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  pulseTrajWeek: {
    fontSize: '10px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },

  // PRACTICES
  practicesEmpty: {
    fontSize: '13px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '4px 0 12px',
    textAlign: 'center',
  },
  practicesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '12px',
  },
  practiceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '10px',
  },
  practiceBullet: {
    fontSize: '20px',
    color: '#854F0B',
    lineHeight: 1,
    flexShrink: 0,
  },
  practiceText: {
    flex: 1,
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.4,
  },
  practiceDelete: {
    background: 'transparent',
    border: 'none',
    color: '#9C8C78',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 6px',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  practicesAddBtn: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    color: '#854F0B',
    border: '1px dashed #C9B894',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  practicesAddBlock: {
    background: '#FDFBF6',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    padding: '10px',
  },
  practicesInput: {
    width: '100%',
    padding: '10px 12px',
    background: 'white',
    border: '0.5px solid #DDCFB6',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '8px',
  },
  practicesAddBtnRow: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  practicesCancelBtn: {
    padding: '8px 14px',
    background: 'transparent',
    color: '#6B5C4A',
    border: '0.5px solid #DDCFB6',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  practicesSaveBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 3px 10px rgba(40,25,10,0.2)',
  },
  practicesSaveBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  // ANCHORS
  anchorsBtn: {
    width: '100%',
    padding: '13px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(80,50,20,0.05)',
  },

  // ACTIONS (slim)
  actionsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
  },
  actionBtn: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '6px',
    padding: '14px 8px',
    borderRadius: '14px',
    border: 'none', cursor: 'pointer',
    fontFamily: 'inherit',
  },
  actionUrge: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  actionSlip: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F2E5 100%)',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    boxShadow: '0 3px 10px rgba(80,50,20,0.06)',
  },
  actionIcon: { fontSize: '20px' },
  actionLabel: {
    fontSize: '13px', fontWeight: 500,
    fontFamily: 'Georgia, serif',
  },
}