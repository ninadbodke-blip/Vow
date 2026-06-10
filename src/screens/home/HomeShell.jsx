import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import BottomNav from '../../components/BottomNav'
import SheetPortal from '../../components/SheetPortal'
import DailyCheckin from '../freeHome/DailyCheckin'
import TreeHero from './TreeHero'
import { modeFor } from './modes'

// ===================================================================
// HOME SHELL — one home for every free mode.
// ===================================================================
// Layout (six things, no tile stack):
//   eyebrow + greeting → THE TREE (tend = check-in) → one practice
//   card for today → "when it hits" (urge/slip, per mode) → anchors
//   and milestones whisper lines → one surfacing line when earned.
//
// The mode's data key drives the sky, the practices, and nothing the
// user can read. HomeRouter only sends migrated modes here; the rest
// stay on their old homes.
// ===================================================================

function localDateStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const dayOfYear = () => {
  const now = new Date()
  return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
}

const CONTEXT_WORDS = {
  stress: 'Stress', lonely: 'Feeling alone', bored: 'Boredom', social: 'Being out with people',
  tired: 'Tiredness', conflict: 'Arguments', restless: 'Restlessness', celebration: 'Celebration',
}

const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

function PracticeSheet({ open, onClose, eyebrow, title, children }) {
  if (!open) return null
  return (
    <SheetPortal>
      <div style={styles.sheetOverlay} onClick={onClose}>
        <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
          <div style={styles.sheetHandle} />
          <p style={styles.sheetEyebrow}>{eyebrow}</p>
          <h2 style={styles.sheetTitle}>{title}</h2>
          <div style={styles.sheetBody}>{children}</div>
          <button onClick={onClose} style={styles.sheetClose}>Close</button>
        </div>
      </div>
    </SheetPortal>
  )
}

export default function HomeShell({ progress }) {
  const navigate = useNavigate()
  const freeState = progress?.free_state || 'notice'
  const mode = modeFor(freeState)

  const [firstName, setFirstName] = useState('')
  const [userId, setUserId] = useState('vow')
  const [tracker, setTracker] = useState(null)
  const [todayCheckin, setTodayCheckin] = useState(null)
  const [checkinCount, setCheckinCount] = useState(0)
  const [recentCheckins, setRecentCheckins] = useState([])
  const [anchor, setAnchor] = useState(null)
  const [slipCount, setSlipCount] = useState(progress?.endure_slip_count || 0)
  const [loading, setLoading] = useState(true)

  const [checkinOpen, setCheckinOpen] = useState(false)
  const [openPractice, setOpenPractice] = useState(null)   // a practice object
  const [allOpen, setAllOpen] = useState(false)
  const [movingToReclaim, setMovingToReclaim] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if (!cancelled) setUserId(user.id)

      // fresh slip count for the slip→step-back indicator
      const { data: vppRow } = await supabase
        .from('vow_path_progress').select('endure_slip_count')
        .eq('user_id', user.id).maybeSingle()
      if (!cancelled && vppRow) setSlipCount(vppRow.endure_slip_count || 0)

      const { data: profile } = await supabase
        .from('profiles').select('first_name, full_name')
        .eq('id', user.id).maybeSingle()
      if (!cancelled) {
        if (profile?.first_name) setFirstName(profile.first_name)
        else if (profile?.full_name) setFirstName(profile.full_name.split(' ')[0])
        else if (user.email) setFirstName(user.email.split('@')[0])
      }

      const { data: trackers } = await supabase
        .from('trackers')
        .select(`*, addiction_types (id, name, icon), tracker_savings (savings_type, per_day_amount)`)
        .eq('user_id', user.id).eq('is_active', true).order('created_at')
      if (!cancelled && trackers && trackers.length > 0) setTracker(trackers[0])

      const { data: tc } = await supabase
        .from('free_daily_checkins').select('*')
        .eq('user_id', user.id).eq('checkin_date', localDateStr()).maybeSingle()
      if (!cancelled && tc) setTodayCheckin(tc)

      const { count } = await supabase
        .from('free_daily_checkins').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if (!cancelled && typeof count === 'number') setCheckinCount(count)

      const { data: recents } = await supabase
        .from('free_daily_checkins').select('felt_pull, contexts, checkin_date')
        .eq('user_id', user.id).order('checkin_date', { ascending: false }).limit(14)
      if (!cancelled && recents) setRecentCheckins(recents)

      const { data: anchors } = await supabase
        .from('anchors').select('name')
        .eq('user_id', user.id).order('position').limit(1)
      if (!cancelled && anchors && anchors.length > 0) setAnchor(anchors[0])

      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleCheckinSaved = (row) => {
    const isNewToday = !todayCheckin
    setTodayCheckin(row)
    if (isNewToday) setCheckinCount(c => c + 1)   // the tree grows
  }

  const handleMoveToReclaim = async () => {
    if (!window.confirm("Step back and regroup? It's a gentler space — your streak and everything you've built stay saved.")) return
    setMovingToReclaim(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMovingToReclaim(false); return }
    const { error } = await supabase
      .from('vow_path_progress')
      .update({ free_state: 'reclaim', endure_slip_count: 0, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
    if (error) { console.error('Move failed:', error); alert('Could not move. Please try again.'); setMovingToReclaim(false); return }
    window.location.assign('/app/home')
  }

  if (loading) {
    return <div style={styles.frame}><div style={styles.loadingCard}>Loading...</div></div>
  }

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const daysFree = tracker ? Math.floor((Date.now() - new Date(tracker.start_date).getTime()) / 86400000) : null

  const practices = mode.practices || []
  const todayPractice = practices.length > 0 ? practices[dayOfYear() % practices.length] : null

  // ---- one surfacing line, only when the data has earned it ----
  let surfacing = null
  const pulledDays = recentCheckins.filter(r => r.felt_pull)
  if (pulledDays.length >= 3) {
    const freq = {}
    for (const r of pulledDays) for (const c of (r.contexts || [])) {
      if (c === 'nothing') continue
      freq[c] = (freq[c] || 0) + 1
    }
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]
    if (top && top[1] >= 3 && CONTEXT_WORDS[top[0]]) {
      surfacing = `${CONTEXT_WORDS[top[0]]} was around ${top[1]} of your last ${pulledDays.length} urges.`
    }
  }
  if (!surfacing && checkinCount >= 7) {
    surfacing = `You've checked in ${checkinCount} times. Patterns are forming.`
  }

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* TOP */}
        <div style={styles.topBar}>
          <p style={styles.eyebrow}>{mode.label}</p>
          <button onClick={() => navigate('/app/profile')} style={styles.iconBtn} aria-label="Profile">
            <ProfileIcon />
          </button>
        </div>
        <h1 style={styles.greeting}>{greet}{firstName ? `, ${firstName}` : ''}.</h1>

        {/* THE TREE */}
        <TreeHero
          seed={userId}
          mode={freeState}
          count={checkinCount}
          counter={mode.counter}
          daysFree={daysFree}
          tendedToday={!!todayCheckin}
          onTend={() => setCheckinOpen(true)}
        />

        {/* no tracker yet, in a day-count mode */}
        {mode.counter === 'days' && !tracker && (
          <button onClick={() => navigate('/app/onboarding/setup')} style={styles.setupCard}>
            <p style={styles.setupTitle}>Start your day count</p>
            <p style={styles.setupSub}>A quiet counter from the day you stopped. Two minutes to set up →</p>
          </button>
        )}

        {/* TODAY'S PRACTICE */}
        {todayPractice && (
          <>
            <p style={styles.sectionLabel}>Today</p>
            <button onClick={() => setOpenPractice(todayPractice)} style={styles.practiceCard}>
              <p style={styles.practiceTitle}>{todayPractice.title}</p>
              <p style={styles.practiceLine}>{todayPractice.line} · {todayPractice.minutes} min</p>
            </button>
            {practices.length > 1 && (
              <button onClick={() => setAllOpen(true)} style={styles.moreLink}>All practices</button>
            )}
          </>
        )}

        {/* WHEN IT HITS */}
        {mode.inTheMoment && tracker && (
          <>
            <p style={styles.sectionLabel}>When it hits</p>
            <div style={styles.hitRow}>
              <button onClick={() => navigate(`/app/urge/${tracker.id}`)} style={styles.hitBtn}>Ride it out</button>
              <button onClick={() => navigate(`/app/slip/${tracker.id}`)} style={styles.hitBtn}>I slipped</button>
            </div>
            {slipCount > 0 && slipCount < 3 && (
              <p style={styles.slipNote}>{slipCount} of 3 slips this stretch — still here, still counts.</p>
            )}
            {slipCount >= 3 && (
              <div style={styles.reclaimInvite}>
                <p style={styles.reclaimText}>
                  Three slips this stretch. That's not failure — it's a sign the ground shifted under you. There's a gentler place to regroup, and everything you've built stays exactly where it is.
                </p>
                <button onClick={handleMoveToReclaim} disabled={movingToReclaim} style={styles.reclaimBtn}>
                  {movingToReclaim ? 'One moment…' : 'Step back and regroup'}
                </button>
              </div>
            )}
          </>
        )}

        {/* WHISPER ROWS */}
        <div style={styles.whispers}>
          <button onClick={() => navigate('/app/anchors')} style={styles.whisper}>
            {anchor ? `For ${anchor.name} · your anchors →` : 'Add the people you\u2019re doing this for →'}
          </button>
          {tracker && (
            <button onClick={() => navigate(`/app/milestones/${tracker.id}`)} style={styles.whisper}>
              What you’ve kept · milestones →
            </button>
          )}
          {surfacing && (
            <button onClick={() => navigate('/app/mirror')} style={{ ...styles.whisper, ...styles.surfacing }}>
              {surfacing} →
            </button>
          )}
        </div>

        <BottomNav />
      </div>

      <DailyCheckin
        isOpen={checkinOpen}
        onClose={() => setCheckinOpen(false)}
        stage={freeState}
        includeBody={freeState === 'notice'}
        existing={todayCheckin}
        onSaved={handleCheckinSaved}
      />

      <PracticeSheet
        open={!!openPractice}
        onClose={() => setOpenPractice(null)}
        eyebrow="Today’s practice"
        title={openPractice?.title}
      >
        {openPractice && <openPractice.Component stage={freeState} tracker={tracker} />}
      </PracticeSheet>

      <PracticeSheet open={allOpen} onClose={() => setAllOpen(false)} eyebrow={mode.label} title="Practices">
        <div style={styles.allList}>
          {practices.map(p => (
            <button key={p.id} onClick={() => { setAllOpen(false); setOpenPractice(p) }} style={styles.allItem}>
              <span style={styles.allTitle}>{p.title}</span>
              <span style={styles.allLine}>{p.line} · {p.minutes} min</span>
            </button>
          ))}
        </div>
      </PracticeSheet>
    </div>
  )
}

const styles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '1.25rem 1rem 6rem',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  phone: { maxWidth: '440px', width: '100%' },
  loadingCard: {
    background: '#FAF7F1', maxWidth: '440px', width: '100%', borderRadius: '28px',
    padding: '5rem 2rem', textAlign: 'center', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10)', alignSelf: 'flex-start',
  },

  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' },
  eyebrow: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: 0 },
  iconBtn: { width: '38px', height: '38px', borderRadius: '50%', border: '0.5px solid #E0D5C2', background: 'rgba(255,255,255,0.7)', color: '#6B5C4A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  greeting: { fontSize: '22px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 14px', lineHeight: 1.25 },

  setupCard: { display: 'block', width: '100%', textAlign: 'left', marginTop: '12px', padding: '14px 16px', background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '16px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(80,50,20,0.05)' },
  setupTitle: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0 },
  setupSub: { fontSize: '12.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '4px 0 0', lineHeight: 1.45 },

  sectionLabel: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '20px 0 8px', paddingLeft: '2px' },
  practiceCard: { display: 'block', width: '100%', textAlign: 'left', padding: '15px 16px', background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)', border: '0.5px solid #E8DFD0', borderRadius: '16px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 12px rgba(80,50,20,0.05)' },
  practiceTitle: { fontSize: '17px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0 },
  practiceLine: { fontSize: '12.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '4px 0 0', lineHeight: 1.45 },
  moreLink: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '12.5px', fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer', padding: '7px 2px 0' },

  hitRow: { display: 'flex', gap: '9px' },
  hitBtn: { flex: 1, padding: '13px 8px', background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '13px', fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(80,50,20,0.04)' },
  slipNote: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '8px 2px 0' },
  reclaimInvite: { marginTop: '10px', padding: '14px 15px', background: '#FBF4E6', border: '0.5px solid #E4D5BB', borderRadius: '14px' },
  reclaimText: { fontSize: '13px', color: '#3A2D1E', fontFamily: 'Georgia, serif', lineHeight: 1.55, margin: '0 0 10px' },
  reclaimBtn: { width: '100%', padding: '11px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },

  whispers: { display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '20px' },
  whisper: { background: 'transparent', border: 'none', textAlign: 'left', padding: '7px 2px', fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', cursor: 'pointer' },
  surfacing: { color: '#854F0B' },

  sheetOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(40,25,15,0.55)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0.5rem' },
  sheet: { background: '#FAF7F1', width: '100%', maxWidth: '440px', maxHeight: '85vh', borderRadius: '24px 24px 0 0', padding: '0.75rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(40,25,15,0.3)' },
  sheetHandle: { width: '40px', height: '4px', background: '#DDCFB6', borderRadius: '2px', margin: '0 auto 12px', flexShrink: 0 },
  sheetEyebrow: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 4px', textAlign: 'center' },
  sheetTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 14px', textAlign: 'center' },
  sheetBody: { overflowY: 'auto', flex: 1, paddingBottom: '6px' },
  sheetClose: { width: '100%', padding: '12px', background: 'white', color: '#2A1F15', border: '0.5px solid #DDCFB6', borderRadius: '12px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginTop: '10px', flexShrink: 0 },

  allList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  allItem: { display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left', padding: '13px 14px', background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '13px', cursor: 'pointer', fontFamily: 'inherit' },
  allTitle: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500 },
  allLine: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4 },
}