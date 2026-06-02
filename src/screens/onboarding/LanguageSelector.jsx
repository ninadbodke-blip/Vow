import { useNavigate } from 'react-router-dom'
import { useLang } from '../../LanguageContext'

const styles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: '#FAF7F1',
    maxWidth: '420px',
    width: '100%',
    borderRadius: '28px',
    padding: '3rem 2rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
    textAlign: 'center',
  },
  logo: {
    fontSize: '40px', fontWeight: 500, color: '#2A1F15', margin: 0,
    letterSpacing: '-0.02em', fontFamily: 'Georgia, serif',
  },
  tag: {
    fontSize: '13px', color: '#8A7B6A', fontStyle: 'italic',
    margin: '6px 0 3rem', fontFamily: 'Georgia, serif',
  },
  prompt: {
    fontSize: '14px', color: '#6B5C4A', margin: '0 0 1.5rem',
    fontFamily: 'Georgia, serif',
  },
  langStack: { display: 'flex', flexDirection: 'column', gap: '12px' },
  langBtn: {
    padding: '18px',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: 500,
    color: '#2A1F15',
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(80,50,20,0.06)',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  langBtnActive: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  langSub: {
    fontSize: '12px', color: '#9C8C78', marginTop: '4px', fontWeight: 400,
  }
}

export default function LanguageSelector() {
  const { setLang } = useLang()
  const navigate = useNavigate()

  const choose = (l) => {
    setLang(l)
    navigate('/app/signup')
  }

  return (
    <div style={styles.frame}>
      <div style={styles.card}>
        <p style={styles.logo}>Vow</p>
        <p style={styles.tag}>Keep the vow. अपना वादा निभाओ।</p>

        <p style={styles.prompt}>Choose your language · अपनी भाषा चुनें</p>

        <div style={styles.langStack}>
          <button style={styles.langBtn} onClick={() => choose('en')}>
            English
            <div style={styles.langSub}>Continue in English</div>
          </button>
          <button style={styles.langBtn} onClick={() => choose('hi')}>
            हिंदी
            <div style={styles.langSub}>हिंदी में जारी रखें</div>
          </button>
        </div>
      </div>
    </div>
  )
}