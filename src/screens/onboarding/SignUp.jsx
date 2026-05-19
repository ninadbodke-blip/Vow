import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../LanguageContext'
import { supabase } from '../../supabaseClient'

function MiniFlame() {
  return (
    <svg viewBox="0 0 32 40" style={{ width: '24px', height: '30px' }}>
      <defs>
        <radialGradient id="miniFlameOuter" cx="50%" cy="60%">
          <stop offset="0%" stopColor="#FFB85A" />
          <stop offset="100%" stopColor="#C5572C" />
        </radialGradient>
        <radialGradient id="miniFlameCore" cx="50%" cy="55%">
          <stop offset="0%" stopColor="#FFE8A8" />
          <stop offset="100%" stopColor="#FFA040" />
        </radialGradient>
      </defs>
      <ellipse cx="16" cy="20" rx="11" ry="16" fill="rgba(255,176,80,0.18)" />
      <path
        d="M 16 6 C 9 14, 8 24, 11 30 C 12 35, 14 38, 16 39 C 18 38, 20 35, 21 30 C 24 24, 23 14, 16 6 Z"
        fill="url(#miniFlameOuter)"
      />
      <path
        d="M 16 14 C 12 20, 12 27, 14 31 C 15 34, 16 35, 16 35 C 16 35, 17 34, 18 31 C 20 27, 20 20, 16 14 Z"
        fill="url(#miniFlameCore)"
      />
    </svg>
  )
}

export default function SignUp() {
  const { t } = useLang()
  const navigate = useNavigate()

  const [mode, setMode] = useState('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        })
        if (error) throw error

        if (data.user) {
          await supabase
            .from('profiles')
            .update({ full_name: name })
            .eq('id', data.user.id)
        }

        setSuccess('Account created! Check your email if confirmation is required.')
        setTimeout(() => navigate('/onboarding/addiction'), 1500)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/home')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.frame}>
      <div style={styles.card}>
        <div style={styles.brandStack}>
          <MiniFlame />
          <p style={styles.logo}>Vow</p>
          <p style={styles.tag}>{t('tagline')}</p>
        </div>

        <div style={styles.ornament}>· · ·</div>

        <div style={styles.toggleRow}>
          <button
            type="button"
            style={{ ...styles.toggleBtn, ...(mode === 'signup' ? styles.toggleActive : {}) }}
            onClick={() => { setMode('signup'); setError(null); setSuccess(null) }}
          >
            {t('signUp')}
          </button>
          <button
            type="button"
            style={{ ...styles.toggleBtn, ...(mode === 'signin' ? styles.toggleActive : {}) }}
            onClick={() => { setMode('signin'); setError(null); setSuccess(null) }}
          >
            {t('signIn')}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={styles.field}>
              <label style={styles.label}>{t('name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
                placeholder="Ninad"
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              placeholder="you@example.com"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {}) }}
          >
            {loading ? '...' : (mode === 'signup' ? t('signUp') : t('signIn'))}
          </button>

          {error && <p style={styles.err}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
        </form>

        <p style={styles.footer}>
          By continuing, you agree to keep your vow.
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
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: '#FAF7F1',
    maxWidth: '420px',
    width: '100%',
    borderRadius: '28px',
    padding: '2.5rem 2rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  brandStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  logo: {
    fontSize: '36px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: '6px 0 0',
    textAlign: 'center',
    letterSpacing: '-0.02em',
    fontFamily: 'Georgia, serif',
  },
  tag: {
    fontSize: '13px',
    color: '#8A7B6A',
    fontStyle: 'italic',
    margin: '6px 0 0',
    textAlign: 'center',
    fontFamily: 'Georgia, serif',
    letterSpacing: '0.01em',
  },
  ornament: {
    fontSize: '12px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    textAlign: 'center',
    margin: '1.5rem 0',
  },
  toggleRow: {
    display: 'flex',
    gap: '4px',
    padding: '4px',
    background: '#F0E8D7',
    borderRadius: '12px',
    marginBottom: '1.75rem',
  },
  toggleBtn: {
    flex: 1,
    padding: '11px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    background: 'transparent',
    color: '#9C8C78',
    fontWeight: 500,
    fontFamily: 'inherit',
    letterSpacing: '0.02em',
  },
  toggleActive: {
    background: '#FAF7F1',
    color: '#2A1F15',
    boxShadow: '0 1px 3px rgba(80,50,20,0.08)',
  },
  field: { marginBottom: '1rem' },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#6B5C4A',
    marginBottom: '6px',
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '0.5px solid #DDCFB6',
    background: 'white',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
    boxShadow: 'inset 0 1px 2px rgba(80,50,20,0.03)',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    marginTop: '0.5rem',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
    fontFamily: 'inherit',
    letterSpacing: '0.02em',
  },
  submitBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  err: {
    fontSize: '12px',
    color: '#B23B3B',
    marginTop: '8px',
    textAlign: 'center',
    padding: '8px',
    background: '#FBEBEB',
    borderRadius: '6px',
  },
  success: {
    fontSize: '12px',
    color: '#2D6E50',
    marginTop: '8px',
    textAlign: 'center',
    padding: '8px',
    background: '#E5F4EC',
    borderRadius: '6px',
  },
  footer: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#9C8C78',
    marginTop: '1.5rem',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
  },
}