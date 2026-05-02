import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../LanguageContext'
import { supabase } from '../../supabaseClient'

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
  logo: {
    fontSize: '32px', fontWeight: 500, color: '#2A1F15', margin: 0,
    textAlign: 'center', letterSpacing: '-0.02em', fontFamily: 'Georgia, serif',
  },
  tag: {
    fontSize: '12px', color: '#8A7B6A', fontStyle: 'italic',
    margin: '4px 0 2.5rem', textAlign: 'center', fontFamily: 'Georgia, serif',
  },
  toggleRow: {
    display: 'flex', gap: '4px', padding: '4px',
    background: '#F0E8D7', borderRadius: '12px', marginBottom: '1.75rem',
  },
  toggleBtn: {
    flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
    fontSize: '13px', cursor: 'pointer', background: 'transparent',
    color: '#9C8C78', fontWeight: 500, fontFamily: 'inherit',
  },
  toggleActive: {
    background: '#FAF7F1', color: '#2A1F15',
    boxShadow: '0 1px 3px rgba(80,50,20,0.08)',
  },
  field: { marginBottom: '1rem' },
  label: {
    display: 'block', fontSize: '12px', color: '#6B5C4A',
    marginBottom: '6px', fontWeight: 500,
  },
  input: {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    border: '0.5px solid #DDCFB6', background: 'white',
    fontSize: '14px', color: '#2A1F15', fontFamily: 'inherit',
    boxSizing: 'border-box', outline: 'none',
  },
  submitBtn: {
    width: '100%', padding: '14px', marginTop: '0.5rem',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '12px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
    fontFamily: 'inherit',
  },
  submitBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  err: {
    fontSize: '12px', color: '#B23B3B', marginTop: '8px',
    textAlign: 'center', padding: '8px', background: '#FBEBEB',
    borderRadius: '6px',
  },
  success: {
    fontSize: '12px', color: '#2D6E50', marginTop: '8px',
    textAlign: 'center', padding: '8px', background: '#E5F4EC',
    borderRadius: '6px',
  },
  footer: {
    textAlign: 'center', fontSize: '11px', color: '#9C8C78',
    marginTop: '1.25rem',
  },
}

export default function SignUp() {
  const { t } = useLang()
  const navigate = useNavigate()

  const [mode, setMode] = useState('signup') // 'signup' or 'signin'
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

        // Update profile with name
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
        <p style={styles.logo}>Vow</p>
        <p style={styles.tag}>{t('tagline')}</p>

        <div style={styles.toggleRow}>
          <button
            type="button"
            style={{...styles.toggleBtn, ...(mode === 'signup' ? styles.toggleActive : {})}}
            onClick={() => { setMode('signup'); setError(null); setSuccess(null) }}
          >
            {t('signUp')}
          </button>
          <button
            type="button"
            style={{...styles.toggleBtn, ...(mode === 'signin' ? styles.toggleActive : {})}}
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
            style={{...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {})}}
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