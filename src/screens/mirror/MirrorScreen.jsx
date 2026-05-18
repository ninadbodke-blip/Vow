import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'

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

export default function MirrorScreen() {
  const navigate = useNavigate()

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.header}>
          <div style={{ width: '40px' }}></div>
          <p style={styles.headerTitle}>Mirror</p>
          <button
            onClick={() => navigate('/profile')}
            style={styles.profileBtn}
            aria-label="Profile"
          >
            <ProfileIcon />
          </button>
        </div>

        <div style={styles.comingSoonBlock}>
          <div style={styles.ornament}>· · ·</div>
          <p style={styles.eyebrow}>Coming soon</p>
          <h1 style={styles.title}>The Mirror is being built.</h1>
          <p style={styles.body}>
            A patient look at everything you've logged. Patterns over weeks, not days.
            The longer view that complements the snapshot on Home.
          </p>
          <div style={styles.ornament}>· · ·</div>
        </div>

        <BottomNav />
      </div>
    </div>
  )
}

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
    padding: '1.5rem 1.5rem 2rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  headerTitle: {
    fontSize: '17px', fontWeight: 500, color: '#2A1F15',
    margin: 0, fontFamily: 'Georgia, serif',
    textAlign: 'center', flex: 1,
  },
  profileBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B',
    cursor: 'pointer', fontFamily: 'inherit',
    padding: '4px 8px',
    minWidth: '40px',
    display: 'flex', justifyContent: 'flex-end',
  },
  comingSoonBlock: {
    textAlign: 'center',
    padding: '4rem 1rem 2rem',
  },
  ornament: {
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    margin: '0 0 1.5rem',
  },
  eyebrow: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 1.25rem',
  },
  title: {
    fontSize: '26px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 1.25rem',
    maxWidth: '320px',
    marginLeft: 'auto', marginRight: 'auto',
  },
  body: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.7,
    margin: '0 auto 1.5rem',
    maxWidth: '320px',
  },
}