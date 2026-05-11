import { useNavigate } from 'react-router-dom'

export default function VowPathIntro() {
  const navigate = useNavigate()

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.header}>
          <button onClick={() => navigate('/home')} style={styles.backBtn}>‹ Back</button>
          <p style={styles.headerTitle}>The Vow Path</p>
          <div style={{ width: '40px' }}></div>
        </div>

        <div style={styles.heroIcon}>🌿</div>

        <h1 style={styles.title}>A guided journey,<br/>built for where you are.</h1>

        <p style={styles.body}>
          The Vow Path is a structured program. Not a single program — six,
          one for each stage of the journey from first noticing the
          substance to a year past quitting.
        </p>

        <p style={styles.body}>
          Different people are at different points. The path that works for
          someone in early sobriety isn't the path that works for someone
          still considering whether to change. So before we begin, we need
          to know where you are.
        </p>

        <div style={styles.divider}></div>

        <p style={styles.subhead}>Fifteen questions. Honest answers.</p>

        <p style={styles.bodyMuted}>
          The next screen is a short check-in. Fifteen statements about how
          you've been feeling, what you've been doing, what you're noticing
          in yourself. You'll mark how true each one is for you, on a scale
          from "not at all" to "completely."
        </p>

        <p style={styles.bodyMuted}>
          Takes about two minutes. Once you're done, Vow shows you which
          stage you're at and what the path forward looks like.
        </p>

        <div style={styles.divider}></div>

        <button
          onClick={() => navigate('/vow-path/substance')}
          style={styles.primaryBtn}
        >
          Begin the check
        </button>

        <p style={styles.privacyLine}>
          Your answers are private. Only you and Vow see them.
        </p>

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
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  backBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
  },
  headerTitle: {
    fontSize: '17px', fontWeight: 500, color: '#2A1F15',
    margin: 0, fontFamily: 'Georgia, serif',
  },
  heroIcon: {
    fontSize: '48px', textAlign: 'center', margin: '1rem 0 1.25rem',
  },
  title: {
    fontSize: '26px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 1.5rem', fontFamily: 'Georgia, serif',
    lineHeight: 1.25, textAlign: 'center',
  },
  body: {
    fontSize: '15px', color: '#2A1F15',
    margin: '0 0 1rem', lineHeight: 1.65,
    fontFamily: 'Georgia, serif',
  },
  bodyMuted: {
    fontSize: '14px', color: '#6B5C4A',
    margin: '0 0 0.85rem', lineHeight: 1.6,
    fontFamily: 'Georgia, serif',
  },
  subhead: {
    fontSize: '13px', color: '#854F0B', margin: '0 0 0.75rem',
    fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em',
  },
  divider: {
    height: '0.5px', background: '#E8DFD0',
    margin: '1.5rem 0',
  },
  primaryBtn: {
    width: '100%', padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
    marginTop: '0.5rem',
  },
  privacyLine: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textAlign: 'center', margin: '1rem 0 0',
  },
}