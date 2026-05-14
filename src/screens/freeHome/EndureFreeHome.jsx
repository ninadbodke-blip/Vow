import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { checkAndMarkMilestones } from '../../milestoneHelpers'

// ===================================================================
// ENDURE-FREE HOME
// ===================================================================
// Stage: Endure (action). User has stopped or is about to.
// Tone: holding, continuing, the vow is active.
// Centerpiece: sobriety counter with jar fill.
// ===================================================================

export default function EndureFreeHome({ progress }) {
  const navigate = useNavigate()

  const [tracker, setTracker] = useState(null)
  const [firstName, setFirstName] = useState('')
  const [, setTickCount] = useState(0)
  const [toastMilestones, setToastMilestones] = useState([])
  const [showAddPlaceholder, setShowAddPlaceholder] = useState(false)
  const [loading, setLoading] = useState(true)

  // 100ms tick for live counter animation
  useEffect(() => {
    const id = setInterval(() => setTickCount(c => c + 1), 100)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Profile for greeting
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, full_name')
        .eq('id', user.id)
        .maybeSingle()
      if (profile?.first_name) setFirstName(profile.first_name)
      else if (profile?.full_name) setFirstName(profile.full_name.split(' ')[0])
      else if (user.email) setFirstName(user.email.split('@')[0])

      // Active tracker (single addiction in pilot)
      const { data: trackers } = await supabase
        .from('trackers')
        .select(`
          *,
          addiction_types (id, name, icon),
          tracker_savings (savings_type, per_day_amount)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at')

      if (trackers && trackers.length > 0) {
        const tr = trackers[0]
        setTracker(tr)

        // Check for new milestones
        const newOnes = await checkAndMarkMilestones(tr, user.id)
        if (newOnes && newOnes.length > 0) {
          setToastMilestones(newOnes.map(m => ({ ...m, trackerName: tr.addiction_types.name })))
          setTimeout(() => setToastMilestones([]), 4000)
        }
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

        {/* TILE 1 — GREETING */}
        <GreetingTile
          firstName={firstName}
          substanceLabel={progress.substance_label}
        />

        {/* TILE 2 — TRACKER PILLS (single + add placeholder) */}
        <TrackerPillsTile
          tracker={tracker}
          onAddPress={() => setShowAddPlaceholder(true)}
        />

        {/* TILE 3 — COUNTER (or set-up prompt if no tracker) */}
        {tracker ? (
          <CounterTile tracker={tracker} navigate={navigate} />
        ) : (
          <CounterSetupPromptTile
            substanceLabel={progress.substance_label}
            navigate={navigate}
          />
        )}

        {/* TILE 4 — URGE / SLIP ACTIONS (only if tracker exists) */}
        {tracker && (
          <ActionTile tracker={tracker} navigate={navigate} />
        )}

        {/* TILE 5 — SAVINGS / MILESTONES (only if tracker exists) */}
        {tracker && (
          <SavingsMilestonesTile tracker={tracker} navigate={navigate} />
        )}

        {/* TILE 6 — VOW PATH CTA (continuation framing) */}
        <VowPathCTATile navigate={navigate} />

        {/* TILE 7 — QUICK LINKS */}
        <QuickLinksTile navigate={navigate} />

        {/* FOOTER */}
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

        {/* ADD PLACEHOLDER MODAL */}
        {showAddPlaceholder && (
          <div style={styles.modal} onClick={() => setShowAddPlaceholder(false)}>
            <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
              <p style={styles.modalTitle}>Multi-addiction support, soon.</p>
              <p style={styles.modalBody}>
                For now, Vow holds one vow at a time. Tracking multiple addictions
                is coming in a future update.
              </p>
              <button
                onClick={() => setShowAddPlaceholder(false)}
                style={styles.modalCloseBtn}
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* MILESTONE TOAST */}
        {toastMilestones.length > 0 && (
          <div style={styles.toast}>
            <div style={styles.toastInner}>
              <span style={styles.toastIcon}>{toastMilestones[0].badge_icon}</span>
              <div>
                <p style={styles.toastTitle}>
                  {toastMilestones.length === 1
                    ? `${toastMilestones[0].label} unlocked.`
                    : `${toastMilestones.length} milestones unlocked.`}
                </p>
                <p style={styles.toastSub}>
                  Tap milestones to see them.
                </p>
              </div>
            </div>
          </div>
        )}

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
      <p style={styles.greetingEyebrow}>ENDURE</p>
      <h1 style={styles.greetingTitle}>
        {timeGreeting}{firstName ? `, ${firstName}` : ''}.
      </h1>
      <p style={styles.greetingSubtitle}>
        Holding the vow on <em style={styles.substanceEm}>{substanceLabel}</em>.
        One more day.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: TRACKER PILLS (single + add placeholder)
// ===================================================================
function TrackerPillsTile({ tracker, onAddPress }) {
  return (
    <div style={styles.pillsRow}>
      {tracker ? (
        <button style={{ ...styles.trackerPill, ...styles.trackerPillActive }}>
          {tracker.addiction_types.icon} {tracker.addiction_types.name}
        </button>
      ) : (
        <button style={{ ...styles.trackerPill, ...styles.trackerPillEmpty }}>
          No tracker yet
        </button>
      )}
      <button
        onClick={onAddPress}
        style={{ ...styles.trackerPill, ...styles.trackerPillAdd }}
      >
        + Add (soon)
      </button>
    </div>
  )
}

// ===================================================================
// TILE: COUNTER (the big jar fill display)
// ===================================================================
function CounterTile({ tracker, navigate }) {
  const startDate = new Date(tracker.start_date)
  const now = new Date()
  let total = Math.floor((now - startDate) / 1000)
  const secs = total % 60; total = Math.floor(total / 60)
  const mins = total % 60; total = Math.floor(total / 60)
  const hours = total % 24; total = Math.floor(total / 24)
  const totalDays = total
  const years = Math.floor(totalDays / 365)
  const remainingAfterYears = totalDays - (years * 365)
  const months = Math.floor(remainingAfterYears / 30)
  const days = remainingAfterYears - (months * 30)

  const pad = (n) => String(n).padStart(2, '0')
  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const ms = now.getMilliseconds()
  const yearsFill = (years / 10) * 100
  const monthsFill = (months / 12) * 100
  const daysFill = (days / daysInCurrentMonth) * 100
  const hoursFill = (hours / 24) * 100
  const minsFill = (mins / 60) * 100
  const secsFill = ((secs * 1000 + ms) / 60000) * 100

  const startDateStr = startDate.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div style={styles.counterTile}>
      <div style={styles.counterHeader}>
        <div style={styles.counterIcon}>{tracker.addiction_types.icon}</div>
        <div style={{ flex: 1 }}>
          <p style={styles.counterName}>{tracker.addiction_types.name}</p>
          <p style={styles.counterSince}>Since {startDateStr}</p>
        </div>
      </div>

      <p style={styles.stayedLine}>
        Free from <b style={styles.bold}>{tracker.addiction_types.name}</b> for
      </p>

      <div style={styles.gridA}>
        <Cell n={years} u="year" fillPercent={yearsFill} hideIfZero />
        <Cell n={months} u="months" fillPercent={monthsFill} />
        <Cell n={days} u="days" fillPercent={daysFill} />
        <div style={styles.row2}>
          <Cell n={pad(hours)} u="hours" fillPercent={hoursFill} />
          <Cell n={pad(mins)} u="mins" fillPercent={minsFill} />
          <Cell n={pad(secs)} u="secs" fillPercent={secsFill} accent />
        </div>
      </div>
    </div>
  )
}

function Cell({ n, u, accent, fillPercent, hideIfZero }) {
  const isHidden = hideIfZero && (!n || n === 0 || n === '00')
  return (
    <div style={styles.cellA}>
      {!isHidden && (
        <div
          style={{
            ...styles.cellFill,
            height: `${Math.min(fillPercent || 0, 100)}%`,
            background: accent
              ? 'linear-gradient(180deg, rgba(197,87,44,0.30) 0%, rgba(197,87,44,0.55) 100%)'
              : 'linear-gradient(180deg, rgba(217,151,80,0.25) 0%, rgba(197,109,44,0.45) 100%)',
          }}
        />
      )}
      <div style={styles.cellContent}>
        {isHidden ? (
          <p style={{ ...styles.cellU, marginTop: '14px' }}>—</p>
        ) : (
          <>
            <p style={{ ...styles.cellN, ...(accent ? styles.cellAccent : {}) }}>{n}</p>
            <p style={styles.cellU}>{u}</p>
          </>
        )}
      </div>
    </div>
  )
}

// ===================================================================
// TILE: COUNTER SETUP PROMPT (when no tracker)
// ===================================================================
function CounterSetupPromptTile({ substanceLabel, navigate }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Optional</p>
      <h2 style={styles.tileTitle}>Set up a tracker?</h2>
      <p style={styles.tileBody}>
        If you've already stopped <em style={styles.substanceEm}>{substanceLabel}</em>,
        Vow can show your days, savings, and milestones. Optional — your home
        works either way.
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
// TILE: ACTIONS (urge / slip)
// ===================================================================
function ActionTile({ tracker, navigate }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>In the moment</p>
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
        Urges pass. Slips aren't the end.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: SAVINGS / MILESTONES
// ===================================================================
function SavingsMilestonesTile({ tracker, navigate }) {
  const startDate = new Date(tracker.start_date)
  const now = new Date()
  const totalDaysClean = Math.floor((now - startDate) / (1000 * 60 * 60 * 24))

  const moneySaving = tracker.tracker_savings?.find(s => s.savings_type === 'money')
  const timeSaving = tracker.tracker_savings?.find(s => s.savings_type === 'time')

  const moneySaved = moneySaving
    ? (totalDaysClean * Number(moneySaving.per_day_amount)).toLocaleString('en-IN')
    : null

  const timeSavedMinutes = timeSaving
    ? totalDaysClean * Number(timeSaving.per_day_amount)
    : null

  let timeSavedStr = null
  if (timeSavedMinutes !== null) {
    const tDays = Math.floor(timeSavedMinutes / (60 * 24))
    const tHours = Math.floor((timeSavedMinutes % (60 * 24)) / 60)
    if (tDays > 0) timeSavedStr = `${tDays} days, ${tHours} hrs`
    else if (tHours > 0) timeSavedStr = `${tHours} hours`
    else timeSavedStr = `${Math.round(timeSavedMinutes)} mins`
  }

  const longestDays = Math.max(
    totalDaysClean,
    Math.floor((tracker.longest_streak_seconds || 0) / 86400)
  )

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>What you've kept</p>

      <div style={styles.savingsStack}>
        {moneySaved !== null && (
          <div style={styles.savingsRow}>
            <span style={styles.savingsLabel}>Money saved</span>
            <span style={styles.savingsValue}>₹{moneySaved}</span>
          </div>
        )}
        {timeSavedStr !== null && (
          <div style={styles.savingsRow}>
            <span style={styles.savingsLabel}>Time saved</span>
            <span style={styles.savingsValue}>{timeSavedStr}</span>
          </div>
        )}
        <div style={styles.savingsRow}>
          <span style={styles.savingsLabel}>Longest streak</span>
          <span style={styles.savingsValue}>{longestDays} days</span>
        </div>
      </div>

      <button
        onClick={() => navigate(`/milestones/${tracker.id}`)}
        style={styles.milestonesLink}
      >
        🏆 View milestones →
      </button>
    </div>
  )
}

// ===================================================================
// TILE: VOW PATH CTA (continuation framing for Endure)
// ===================================================================
function VowPathCTATile({ navigate }) {
  return (
    <div style={styles.ctaTile}>
      <div style={styles.ctaOrnament}>· · ·</div>
      <p style={styles.ctaEyebrow}>The Vow Path</p>
      <h3 style={styles.ctaTitle}>Walk the structured 21 days.</h3>
      <p style={styles.ctaBody}>
        The crash, the flatness, the return — three phases mapped, day by day.
        For the stretch where most people leave, and the return when pleasure flickers back.
      </p>
      <button
        onClick={() => navigate('/vow-path')}
        style={styles.ctaBtn}
      >
        Continue with Vow Path
      </button>
      <p style={styles.ctaMicro}>21 days · designed for where you are</p>
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
    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit', padding: '4px 8px', fontStyle: 'italic',
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

  // TRACKER PILLS
  pillsRow: {
    display: 'flex', gap: '6px',
    overflowX: 'auto', paddingBottom: '2px',
  },
  trackerPill: {
    padding: '8px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '999px',
    fontSize: '12px', fontWeight: 500,
    color: '#9C8C78', cursor: 'default',
    fontFamily: 'inherit', whiteSpace: 'nowrap',
    boxShadow: '0 1px 2px rgba(80,50,20,0.04)',
  },
  trackerPillActive: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: '0.5px solid #241710',
    boxShadow: '0 2px 8px rgba(40,25,10,0.2)',
  },
  trackerPillEmpty: {
    background: '#F4ECDD',
    color: '#9C8C78',
    fontStyle: 'italic',
  },
  trackerPillAdd: {
    background: 'transparent',
    border: '1px dashed #C9B894',
    color: '#9C8C78',
    cursor: 'pointer',
  },

  // COUNTER TILE
  counterTile: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    borderRadius: '20px', padding: '1.5rem 1.25rem',
    border: '0.5px solid #E8DFD0',
    boxShadow: '0 6px 20px rgba(80,50,20,0.06)',
  },
  counterHeader: {
    display: 'flex', alignItems: 'center', gap: '11px',
    marginBottom: '1.25rem', paddingBottom: '1.25rem',
    borderBottom: '0.5px solid #EFE7D7',
  },
  counterIcon: {
    width: '38px', height: '38px', borderRadius: '11px',
    background: '#F4ECDD', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '18px',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 1px 2px rgba(120,80,30,0.06)',
  },
  counterName: { fontSize: '14px', fontWeight: 500, color: '#2A1F15', margin: 0 },
  counterSince: { fontSize: '11px', color: '#9C8C78', margin: '2px 0 0' },
  stayedLine: {
    fontSize: '12px', color: '#6B5C4A', textAlign: 'center',
    marginBottom: '14px', fontFamily: 'Georgia, serif',
  },
  bold: { fontWeight: 500, color: '#2A1F15' },
  gridA: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  row2: {
    gridColumn: 'span 3',
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
  },
  cellA: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F6EFDD 100%)',
    borderRadius: '12px',
    padding: '12px 4px 10px',
    textAlign: 'center',
    border: '0.5px solid #ECE2CD',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7), 0 1px 2px rgba(120,80,30,0.04)',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '54px',
  },
  cellFill: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none', zIndex: 0,
  },
  cellContent: { position: 'relative', zIndex: 1 },
  cellN: {
    fontSize: '22px', fontWeight: 500, color: '#2A1F15',
    lineHeight: 1, margin: 0, fontVariantNumeric: 'tabular-nums',
  },
  cellU: {
    fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em',
    color: '#9C8C78', marginTop: '5px', margin: '5px 0 0',
  },
  cellAccent: { color: '#C5572C' },

  // ACTIONS
  actionsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
  },
  actionBtn: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '6px',
    padding: '16px 8px',
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
  actionIcon: { fontSize: '22px' },
  actionLabel: {
    fontSize: '13px', fontWeight: 500,
    fontFamily: 'Georgia, serif',
  },

  // SAVINGS / MILESTONES
  savingsStack: {
    display: 'flex', flexDirection: 'column', gap: '8px',
    marginBottom: '12px',
  },
  savingsRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 14px',
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    borderRadius: '12px',
    border: '0.5px solid #E8DCC2',
  },
  savingsLabel: {
    fontSize: '11px', color: '#8A7B6A',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  savingsValue: {
    fontSize: '14px', fontWeight: 500, color: '#2A1F15',
    fontVariantNumeric: 'tabular-nums',
  },
  milestonesLink: {
    width: '100%',
    background: 'transparent',
    border: '0.5px dashed #DDCFB6',
    borderRadius: '10px',
    padding: '10px',
    fontSize: '12px', color: '#854F0B', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
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
    fontSize: '12px', color: 'rgba(250,247,241,0.4)',
    letterSpacing: '0.5em', margin: '0 0 14px',
  },
  ctaEyebrow: {
    fontSize: '10px', color: '#D9B57A',
    textTransform: 'uppercase', letterSpacing: '0.24em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
  },
  ctaTitle: {
    fontSize: '20px', color: '#FAF7F1',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 10px',
  },
  ctaBody: {
    fontSize: '13px', color: 'rgba(250,247,241,0.75)',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.6, margin: '0 0 16px',
  },
  ctaBtn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(180deg, #D9B57A 0%, #B89456 100%)',
    color: '#241710', border: 'none', borderRadius: '12px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
  },
  ctaMicro: {
    fontSize: '11px', color: 'rgba(250,247,241,0.5)',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '10px 0 0',
  },

  // QUICK LINKS
  quickLinksRow: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px',
  },
  quickLink: {
    padding: '14px 10px',
    background: 'white',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    fontFamily: 'inherit', cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  quickLinkIcon: { fontSize: '24px', marginBottom: '4px' },
  quickLinkLabel: {
    fontSize: '12px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0,
  },

  // FOOTER
  footer: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '8px', marginTop: '0.5rem', paddingTop: '0.5rem',
  },
  footerLink: {
    background: 'transparent', border: 'none',
    color: '#9C8C78', fontSize: '11px', fontStyle: 'italic',
    cursor: 'pointer', fontFamily: 'Georgia, serif', padding: '4px 8px',
  },
  footerSeparator: { color: '#C9B894', fontSize: '10px' },

  // MODAL
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(40,25,15,0.55)',
    backdropFilter: 'blur(4px)',
    zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  },
  modalCard: {
    background: '#FAF7F1',
    maxWidth: '360px',
    width: '100%',
    borderRadius: '20px',
    padding: '1.75rem 1.5rem',
    boxShadow: '0 20px 60px rgba(40,25,15,0.3)',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: '17px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 12px', fontFamily: 'Georgia, serif',
  },
  modalBody: {
    fontSize: '13px', color: '#6B5C4A',
    margin: '0 0 1.5rem', lineHeight: 1.5,
    fontFamily: 'Georgia, serif',
  },
  modalCloseBtn: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '12px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },

  // TOAST
  toast: {
    position: 'fixed', bottom: '24px', left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 200, maxWidth: '90vw',
  },
  toastInner: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    borderRadius: '14px',
    padding: '14px 18px',
    display: 'flex', alignItems: 'center', gap: '12px',
    boxShadow: '0 8px 24px rgba(40,25,10,0.4)',
    border: '0.5px solid rgba(255,255,255,0.08)',
  },
  toastIcon: { fontSize: '28px' },
  toastTitle: {
    fontSize: '14px', fontWeight: 500, margin: 0,
    fontFamily: 'Georgia, serif',
  },
  toastSub: {
    fontSize: '11px', margin: '2px 0 0',
    color: '#E8DCC2', fontStyle: 'italic',
  },
}