import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

// ===================================================================
// NOTICE-FREE HOME
// ===================================================================
// Stage: Notice (precontemplation). User hasn't decided anything is wrong.
// Tone: curious, observational, no pressure. No counter, no streaks.
// Daily action: log one thing you noticed about your pattern.
// ===================================================================

export default function NoticeFreeHome({ progress }) {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [recentNoticings, setRecentNoticings] = useState([])
  const [todayLogged, setTodayLogged] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get first name for greeting
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, full_name')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.first_name) {
        setFirstName(profile.first_name)
      } else if (profile?.full_name) {
        setFirstName(profile.full_name.split(' ')[0])
      } else if (user.email) {
        setFirstName(user.email.split('@')[0])
      }

      // Load recent noticings from free_noticings table
      const { data: noticings } = await supabase
        .from('free_noticings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (noticings) {
        setRecentNoticings(noticings)

        // Check if any noticing was logged today
        const today = new Date().toDateString()
        const hasToday = noticings.some(n => new Date(n.created_at).toDateString() === today)
        setTodayLogged(hasToday)
      }

      setLoading(false)
    }
    load()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/welcome')
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
          <button onClick={() => navigate('/profile')} style={styles.profileBtn}>
            Profile
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* TILE 1 — GREETING                                           */}
        {/* ─────────────────────────────────────────────────────────── */}
        <GreetingTile
          firstName={firstName}
          substanceLabel={progress.substance_label}
        />

        {/* ─────────────────────────────────────────────────────────── */}
        {/* TILE 2 — TODAY'S NOTICE PROMPT                              */}
        {/* ─────────────────────────────────────────────────────────── */}
        <NoticePromptTile
          substanceLabel={progress.substance_label}
          todayLogged={todayLogged}
          onLogged={(newNoticing) => {
            setRecentNoticings([newNoticing, ...recentNoticings].slice(0, 5))
            setTodayLogged(true)
          }}
        />

        {/* ─────────────────────────────────────────────────────────── */}
        {/* TILE 3 — RECENT NOTICINGS                                   */}
        {/* ─────────────────────────────────────────────────────────── */}
        {recentNoticings.length > 0 && (
          <RecentNoticingsTile noticings={recentNoticings} />
        )}

        {/* ─────────────────────────────────────────────────────────── */}
        {/* TILE 4 — VOW PATH CTA (curiosity-driven)                    */}
        {/* ─────────────────────────────────────────────────────────── */}
        <VowPathCTATile navigate={navigate} />

        {/* ─────────────────────────────────────────────────────────── */}
        {/* TILE 5 — QUICK LINKS                                        */}
        {/* ─────────────────────────────────────────────────────────── */}
        <QuickLinksTile navigate={navigate} />

        {/* FOOTER — change state link */}
        <div style={styles.footer}>
          <button
            onClick={() => navigate('/onboarding/state-picker')}
            style={styles.footerLink}
          >
            Where I am has changed
          </button>
          <span style={styles.footerSeparator}>·</span>
          <button onClick={handleSignOut} style={styles.footerLink}>
            Sign out
          </button>
        </div>

      </div>
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
        Looking at <em style={styles.substanceEm}>{substanceLabel}</em>{' '}
        with curiosity. No pressure to decide anything yet.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: NOTICE PROMPT (rotating daily)
// ===================================================================
const NOTICE_PROMPTS = [
  {
    id: 'when_today',
    question: 'When did it come up today?',
    options: [
      'Morning',
      'Afternoon',
      'Evening',
      'Late night',
      'Not yet today',
      `Don't remember`,
    ],
  },
  {
    id: 'how_after',
    question: 'How did you feel after, the last time?',
    options: [
      'Relieved',
      'Numb',
      'Regretful',
      'Indifferent',
      'Tired',
      `Don't remember`,
    ],
  },
  {
    id: 'what_pulled',
    question: 'What pulled you toward it, last time?',
    options: [
      'Stress',
      'Boredom',
      'Habit / time of day',
      'Social setting',
      'Hard emotion',
      'Just happened',
    ],
  },
  {
    id: 'who_around',
    question: 'Who was around when it happened, last time?',
    options: [
      'Alone',
      'With friends',
      'With family',
      'With partner',
      'At work',
      'Other',
    ],
  },
  {
    id: 'did_plan',
    question: 'Did you plan it, or did it just happen?',
    options: [
      'I planned it',
      'It just happened',
      'Somewhere in between',
      `Don't remember`,
    ],
  },
  {
    id: 'cost_today',
    question: 'What did it cost you today?',
    options: [
      'Time',
      'Money',
      'Energy',
      'Sleep',
      'Nothing I can name',
      'Not sure yet',
    ],
  },
  {
    id: 'thought_after',
    question: 'What did you think about it afterward?',
    options: [
      `That was fine`,
      `That was too much`,
      `I shouldn't have`,
      `Didn't think about it`,
      `Mixed feelings`,
    ],
  },
]

function NoticePromptTile({ substanceLabel, todayLogged, onLogged }) {
  // Pick today's prompt deterministically from the date
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
        <p style={styles.tileEyebrow}>Today</p>
        <div style={styles.loggedRow}>
          <span style={styles.checkmark}>✓</span>
          <p style={styles.loggedText}>You noticed today. Come back tomorrow.</p>
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
        No right answer. Just what's true today.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: RECENT NOTICINGS
// ===================================================================
function RecentNoticingsTile({ noticings }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Recent</p>
      <h3 style={styles.tileSubtitleHeader}>What you've noticed</h3>

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

      <p style={styles.tileHelperText}>
        Each entry is a small data point about your pattern.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: VOW PATH CTA — curiosity-framed for Notice
// ===================================================================
function VowPathCTATile({ navigate }) {
  return (
    <div style={styles.ctaTile}>
      <div style={styles.ctaOrnament}>· · ·</div>
      <p style={styles.ctaEyebrow}>The Vow Path</p>
      <h3 style={styles.ctaTitle}>Look more carefully at your patterns.</h3>
      <p style={styles.ctaBody}>
        Five days of structured observation. Your specific lines, your trajectory,
        the relationships around you. The looking is the work.
      </p>
      <button
        onClick={() => navigate('/vow-path')}
        style={styles.ctaBtn}
      >
        Explore Notice
      </button>
      <p style={styles.ctaMicro}>5 days · designed for where you are</p>
    </div>
  )
}

// ===================================================================
// TILE: QUICK LINKS
// ===================================================================
function QuickLinksTile({ navigate }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Also available</p>
      <div style={styles.quickLinksRow}>
        <button onClick={() => navigate('/anchors')} style={styles.quickLink}>
          <div style={styles.quickLinkIcon}>🌿</div>
          <p style={styles.quickLinkLabel}>Anchors</p>
        </button>
        <button onClick={() => navigate('/library')} style={styles.quickLink}>
          <div style={styles.quickLinkIcon}>📖</div>
          <p style={styles.quickLinkLabel}>Library</p>
        </button>
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

  // TOP BAR
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  brandLine: {
    fontSize: '20px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: 0,
    fontFamily: 'Georgia, serif',
    letterSpacing: '-0.01em',
  },
  profileBtn: {
    background: 'transparent',
    border: 'none',
    color: '#854F0B',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '4px 8px',
    fontStyle: 'italic',
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
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 10px',
  },
  tileTitle: {
    fontSize: '20px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 16px',
  },
  tileSubtitleHeader: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 12px',
  },
  tileHelperText: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '12px 0 0',
    textAlign: 'center',
  },

  // GREETING TILE
  greetingTile: {
    textAlign: 'left',
    padding: '8px 4px 4px',
  },
  greetingEyebrow: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.24em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
  },
  greetingTitle: {
    fontSize: '26px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.2,
    margin: '0 0 10px',
    letterSpacing: '-0.01em',
  },
  greetingSubtitle: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: 0,
  },
  substanceEm: {
    color: '#854F0B',
    fontWeight: 500,
    fontStyle: 'italic',
  },

  // OPTIONS GRID
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

  // LOGGED STATE
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

  // CTA TILE
  ctaTile: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    borderRadius: '20px',
    padding: '22px 20px',
    textAlign: 'center',
    boxShadow: '0 6px 20px rgba(40,25,10,0.25)',
  },
  ctaOrnament: {
    fontSize: '12px',
    color: 'rgba(250,247,241,0.4)',
    letterSpacing: '0.5em',
    margin: '0 0 14px',
  },
  ctaEyebrow: {
    fontSize: '10px',
    color: '#D9B57A',
    textTransform: 'uppercase',
    letterSpacing: '0.24em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
  },
  ctaTitle: {
    fontSize: '20px',
    color: '#FAF7F1',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 10px',
  },
  ctaBody: {
    fontSize: '13px',
    color: 'rgba(250,247,241,0.75)',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 16px',
  },
  ctaBtn: {
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
  ctaMicro: {
    fontSize: '11px',
    color: 'rgba(250,247,241,0.5)',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '10px 0 0',
  },

  // QUICK LINKS
  quickLinksRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  quickLink: {
    padding: '14px 10px',
    background: 'white',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  quickLinkIcon: {
    fontSize: '24px',
    marginBottom: '4px',
  },
  quickLinkLabel: {
    fontSize: '12px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: 0,
  },

  // FOOTER
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
  },
  footerLink: {
    background: 'transparent',
    border: 'none',
    color: '#9C8C78',
    fontSize: '11px',
    fontStyle: 'italic',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    padding: '4px 8px',
  },
  footerSeparator: {
    color: '#C9B894',
    fontSize: '10px',
  },
}