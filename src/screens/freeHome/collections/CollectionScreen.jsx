import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import BottomNav from '../../../components/BottomNav'
import { getCollection } from './collections'
import UnderstandTheHabit from './UnderstandTheHabit'

// Bodies that are fully built. The other five collections fall through
// to a calm placeholder until their exercises are converted.
const BODIES = {
  habit: UnderstandTheHabit,
}

function Placeholder() {
  return (
    <div style={styles.placeholder}>
      <p style={styles.placeholderMark}>◌</p>
      <p style={styles.placeholderText}>
        This collection is being prepared. It will be here soon — there’s no rush, and nothing
        you need to do until then.
      </p>
    </div>
  )
}

export default function CollectionScreen() {
  const navigate = useNavigate()
  const { collectionId } = useParams()
  const col = getCollection(collectionId)

  useEffect(() => {
    if (!col) navigate('/app/home', { replace: true })
  }, [col, navigate])

  if (!col) return null

  const Body = BODIES[col.id]

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>
        <div style={styles.topBar}>
          <button onClick={() => navigate('/app/home')} style={styles.iconBtn} aria-label="Back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span style={styles.brandLine}>Vow</span>
          <span style={{ width: 32 }} />
        </div>

        <div style={styles.header}>
          <p style={styles.eyebrow}>Practice</p>
          <h1 style={styles.title}>{col.label}</h1>
          <p style={styles.intro}>{col.intro}</p>
        </div>

        <div style={styles.body}>
          {Body ? <Body /> : <Placeholder />}
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
    padding: '2rem 1rem', display: 'flex', justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  phone: {
    background: '#FAF7F1', maxWidth: '440px', width: '100%', borderRadius: '28px',
    padding: '1.5rem 1.25rem 1.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' },
  iconBtn: { background: 'transparent', border: 'none', color: '#854F0B', cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandLine: { fontSize: '20px', fontWeight: 500, color: '#2A1F15', margin: 0, fontFamily: 'Georgia, serif', letterSpacing: '-0.01em' },

  header: { marginBottom: '6px', paddingLeft: '2px' },
  eyebrow: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.24em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 10px' },
  title: { fontSize: '28px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.18, margin: '0 0 12px', letterSpacing: '-0.01em' },
  intro: { fontSize: '14.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.62, margin: 0 },

  body: { marginTop: '8px' },

  placeholder: { textAlign: 'center', padding: '40px 16px 28px' },
  placeholderMark: { fontSize: '34px', color: '#C9B894', margin: '0 0 16px' },
  placeholderText: { fontSize: '14px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: 0, maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' },
}