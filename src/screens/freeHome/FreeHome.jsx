import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import VowBrandMark from '../../components/VowBrandMark'
import BottomNav from '../../components/BottomNav'
import DailyCheckin from './DailyCheckin'
import FreeMenu from './FreeMenu'
import { collectionForStage } from './collections/collections'

// ===================================================================
// FREE HOME  (v3 — de-staged daily landing)
// ===================================================================
// One calm home for every free user. The daily check-in, a few
// in-the-moment tools, a reason to keep going, and one gentle nudge
// toward today's practice. Everything deeper lives behind the menu.
// No stage names, no journey, no sequence shown.
// ===================================================================

function localDateStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function humanizeDuration(startStr) {
  if (!startStr) return null
  const start = new Date(startStr)
  if (isNaN(start.getTime())) return null
  const ms = Date.now() - start.getTime()
  if (ms < 0) return null
  const days = Math.floor(ms / 86400000)
  if (days < 1) return 'Today.'
  if (days < 7) return `${days} day${days === 1 ? '' : 's'}.`
  if (days < 56) {
    const w = Math.floor(days / 7), d = days % 7
    return d ? `${w} week${w === 1 ? '' : 's'}, ${d} day${d === 1 ? '' : 's'}.` : `${w} week${w === 1 ? '' : 's'}.`
  }
  const months = Math.floor(days / 30.44)
  const remDays = days - Math.floor(months * 30.44)
  const w = Math.floor(remDays / 7)
  return w ? `${months} month${months === 1 ? '' : 's'}, ${w} week${w === 1 ? '' : 's'}.` : `${months} month${months === 1 ? '' : 's'}.`
}

const HamburgerGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
)
const ProfileGlyph = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)
const WaveGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9c1.4 0 2.1-2 3.5-2s2.1 2 3.5 2 2.1-2 3.5-2 2.1 2 3.5 2 2.1-2 3.5-2" />
    <path d="M2 15c1.4 0 2.1-2 3.5-2s2.1 2 3.5 2 2.1-2 3.5-2 2.1 2 3.5 2 2.1-2 3.5-2" />
  </svg>
)
const RestartGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 2.6-6.4" /><path d="M3 4v4h4" />
  </svg>
)

function ActionChip({ glyph, label, onClick }) {
  return (
    <button onClick={onClick} style={styles.chip}>
      <span style={styles.chipGlyph}>{glyph}</span>
      <span style={styles.chipLabel}>{label}</span>
    </button>
  )
}

export default function FreeHome({ progress }) {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [trackerStart, setTrackerStart] = useState(null)
  const [trackerId, setTrackerId] = useState(null)
  const [todayCheckin, setTodayCheckin] = useState(null)
  const [anchor, setAnchor] = useState(null)
  const [loading, setLoading] = useState(true)

  const [checkinOpen, setCheckinOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles').select('first_name, full_name').eq('id', user.id).maybeSingle()
      if (!cancelled) {
        if (profile?.first_name) setFirstName(profile.first_name)
        else if (profile?.full_name) setFirstName(profile.full_name.split(' ')[0])
        else if (user.email) setFirstName(user.email.split('@')[0])
      }

      const { data: trackers } = await supabase
        .from('trackers').select('id, start_date')
        .eq('user_id', user.id).order('created_at', { ascending: true }).limit(1)
      if (!cancelled && trackers && trackers[0]) {
        setTrackerId(trackers[0].id)
        setTrackerStart(trackers[0].start_date || null)
      }

      const { data: tc } = await supabase
        .from('free_daily_checkins').select('*')
        .eq('user_id', user.id).eq('checkin_date', localDateStr()).maybeSingle()
      if (!cancelled && tc) setTodayCheckin(tc)

      const { data: anchors } = await supabase
        .from('anchors').select('name, relationship')
        .eq('user_id', user.id).order('position', { ascending: true }).limit(1)
      if (!cancelled && anchors && anchors[0]) setAnchor(anchors[0])

      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleCheckinSaved = (row) => setTodayCheckin(row)

  if (loading) {
    return <div style={styles.frame}><div style={styles.loadingPhone}>Loading…</div></div>
  }

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const duration = humanizeDuration(trackerStart)
  const stage = progress?.free_state || 'notice'
  const suggested = collectionForStage(stage)

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* TOP BAR */}
        <div style={styles.topBar}>
          <button onClick={() => setMenuOpen(true)} style={styles.iconBtn} aria-label="Menu">
            <HamburgerGlyph />
          </button>
          <VowBrandMark size={22} />
          <button onClick={() => navigate('/app/profile')} style={styles.iconBtn} aria-label="Profile">
            <ProfileGlyph />
          </button>
        </div>

        {/* GREETING */}
        <div style={styles.greetWrap}>
          <h1 style={styles.greeting}>{greet}{firstName ? `, ${firstName}` : ''}.</h1>
          {duration && <p style={styles.duration}>{duration}</p>}
        </div>

        {/* CHECK-IN HERO */}
        <div style={styles.hero}>
          <p style={styles.heroEyebrow}>Today</p>
          {todayCheckin ? (
            <>
              <div style={styles.heroDoneRow}>
                <span style={styles.heroTick}>✓</span>
                <span style={styles.heroDoneText}>You’ve checked in today.</span>
              </div>
              <button onClick={() => setCheckinOpen(true)} style={styles.heroGhost}>Update today’s check-in</button>
            </>
          ) : (
            <>
              <h2 style={styles.heroTitle}>How are you, today?</h2>
              <p style={styles.heroSub}>A quiet check-in. It takes about a minute, and it’s just for you.</p>
              <button onClick={() => setCheckinOpen(true)} style={styles.heroBtn}>Begin check-in</button>
            </>
          )}
        </div>

        {/* RIGHT NOW */}
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Right now</p>
          <div style={styles.chipRow}>
            <ActionChip
              glyph={<WaveGlyph />}
              label="Ride an urge"
              onClick={() => navigate(trackerId ? `/app/urge/${trackerId}` : '/app/home')}
            />
            <ActionChip
              glyph={<RestartGlyph />}
              label="I slipped"
              onClick={() => navigate(trackerId ? `/app/slip/${trackerId}` : '/app/home')}
            />
          </div>
        </div>

        {/* WHY YOU'RE HERE */}
        <button
          onClick={() => navigate('/app/anchors')}
          style={{ ...styles.card, ...styles.cardButton }}
        >
          <p style={styles.cardEyebrow}>Why you’re here</p>
          {anchor ? (
            <>
              <p style={styles.anchorLine}>You’re doing this for {anchor.name}.</p>
              <p style={styles.cardLink}>See your anchors →</p>
            </>
          ) : (
            <p style={styles.anchorLine}>Add a reason you’re here →</p>
          )}
        </button>

        {/* SUGGESTED */}
        <button
          onClick={() => navigate(`/app/practices/${suggested.id}`)}
          style={{ ...styles.card, ...styles.cardButton, ...styles.suggestCard }}
        >
          <p style={styles.cardEyebrow}>Suggested for you</p>
          <p style={styles.suggestTitle}>{suggested.label}</p>
          <p style={styles.suggestSub}>{suggested.subtitle}.</p>
          <p style={styles.cardLink}>Open <span aria-hidden="true">→</span></p>
        </button>

        <BottomNav />
      </div>

      <DailyCheckin
        isOpen={checkinOpen}
        onClose={() => setCheckinOpen(false)}
        stage={stage}
        includeBody
        existing={todayCheckin}
        onSaved={handleCheckinSaved}
      />
      <FreeMenu open={menuOpen} onClose={() => setMenuOpen(false)} suggestedId={suggested.id} trackerId={trackerId} />
    </div>
  )
}

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
    display: 'flex', flexDirection: 'column', gap: '20px',
  },
  loadingPhone: {
    background: '#FAF7F1', maxWidth: '440px', width: '100%', borderRadius: '28px',
    padding: '5rem 2rem', textAlign: 'center', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic', boxShadow: '0 14px 40px rgba(60,40,20,0.10)',
  },

  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { background: 'transparent', border: 'none', color: '#854F0B', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  greetWrap: { paddingLeft: '2px', marginTop: '-4px' },
  greeting: { fontSize: '26px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.2, margin: 0, letterSpacing: '-0.01em' },
  duration: { fontSize: '15px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '8px 0 0' },

  hero: {
    background: 'linear-gradient(170deg, #FFFFFF 0%, #FBF6EC 100%)',
    border: '0.5px solid #E8DFD0', borderRadius: '20px',
    padding: '20px 20px 22px', boxShadow: '0 6px 20px rgba(80,50,20,0.06)',
  },
  heroEyebrow: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 12px' },
  heroTitle: { fontSize: '23px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.25, margin: '0 0 8px', letterSpacing: '-0.01em' },
  heroSub: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 18px' },
  heroBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '13px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  heroDoneRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
  heroTick: { width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)', border: '0.5px solid #C2D49A', color: '#3B6D11', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroDoneText: { fontSize: '16px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  heroGhost: { width: '100%', padding: '12px', background: 'white', color: '#3A2A1C', border: '0.5px solid #D9CBB4', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif' },

  section: {},
  sectionLabel: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 12px', paddingLeft: '2px' },
  chipRow: { display: 'flex', gap: '10px' },
  chip: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '16px 8px', background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)', border: '0.5px solid #E8DFD0', borderRadius: '16px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 12px rgba(80,50,20,0.05)' },
  chipGlyph: { width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(217,181,122,0.16)', color: '#854F0B', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chipLabel: { fontSize: '12.5px', color: '#3A2D1E', fontFamily: 'Georgia, serif', textAlign: 'center', lineHeight: 1.25 },

  card: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0', borderRadius: '18px',
    padding: '18px 18px 16px', boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
  },
  cardButton: { display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' },
  cardEyebrow: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 10px' },
  anchorLine: { fontSize: '18px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4, margin: 0 },
  cardLink: { fontSize: '12.5px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '12px 0 0' },

  suggestCard: { background: 'linear-gradient(160deg, #F6EFE2 0%, #F0E6D3 100%)', border: '0.5px solid #E4D5BB' },
  suggestTitle: { fontSize: '19px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.25, margin: '0 0 5px' },
  suggestSub: { fontSize: '13.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.45, margin: 0 },
}