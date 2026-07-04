import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import AnimatedVowFlame from '../../components/AnimatedVowFlame'
import { Capacitor } from '@capacitor/core'

// ===================================================================
// SAVE PROGRESS — the real ask, moved to the moment it's earned.
// ===================================================================
// Shown once, right after a fresh anonymous tracker starts ticking.
// This is a LINK, not a new signup: supabase.auth.updateUser() upgrades
// the existing anonymous session to a permanent one in place, so the
// user.id — and everything already written under it (substance, stage,
// the tracker itself) — never changes and never needs to move.
//
// Google linking is offered on web via supabase.auth.linkIdentity(),
// which is a supported redirect-based flow for upgrading an anonymous
// session. On native we don't offer it here: the app's existing Google
// flow authenticates via a Credential Manager ID token, and linking an
// ID-token identity onto an *existing* anonymous session isn't a flow
// supabase-js exposes today — attempting it risks silently creating a
// second, disconnected account rather than upgrading this one. Email
// and password is offered on both platforms; it always works exactly
// the same way.
//
// Skipping is always safe: the anonymous session keeps working normally
// on this device. Profile.jsx carries a standing, low-pressure reminder
// for anyone who skips here, since an anonymous session only lives in
// this device's local storage.
// ===================================================================

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  )
}

const CSS = `
@keyframes vowRise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@keyframes vaultRise { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
.vrise { animation: vowRise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
.vault-rise { animation: vaultRise 0.8s cubic-bezier(0.2, 0.75, 0.2, 1) both; }
.vow-input::placeholder { color: rgba(250,247,241,0.32); }
.vow-input:focus { border-bottom-color: #D9B57A; box-shadow: 0 8px 16px -12px rgba(217,181,122,0.7); }
.vow-google:hover { background: rgba(250,247,241,0.07); border-color: rgba(250,247,241,0.4); }
.vow-google:active { transform: translateY(1px); }
.vow-submit:hover:not(:disabled) { filter: brightness(1.05); transform: translateY(-1px); }
.vow-submit:active:not(:disabled) { transform: translateY(0); }
.vow-skip:hover { color: #F0E7D6; }
.vow-footer-link:hover { color: rgba(217,181,122,1); }
@media (prefers-reduced-motion: reduce) { .vrise, .vault-rise { animation: none; } }
`

export default function SaveProgress() {
  const navigate = useNavigate()

  const [checking, setChecking] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Only meaningful for an anonymous session. A permanent user who lands
  // here (deep link, back button) just goes home — nothing to save.
  useEffect(() => {
    let cancelled = false
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user || !user.is_anonymous) { navigate('/app/home', { replace: true }); return }
      setChecking(false)
    }
    check()
    return () => { cancelled = true }
  }, [navigate])

  const handleGoogle = async () => {
    setError(null)
    setOauthLoading(true)
    try {
      // Web-only redirect-based identity link (see file header for why
      // native is intentionally not offered here).
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/app/home` },
      })
      if (error) throw error
      // A successful call redirects the whole page to Google.
    } catch (err) {
      setError(err.message)
      setOauthLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      // Upgrades THIS session's user in place — same user.id throughout, so
      // the substance, stage, and tracker already written stay exactly where
      // they are. No new account, no migration.
      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
        data: name.trim() ? { full_name: name.trim() } : undefined,
      })
      if (error) throw error

      if (name.trim() && data?.user?.id) {
        await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', data.user.id)
      }

      setSuccess('Saved. Check your email to confirm it, if asked.')
      setTimeout(() => navigate('/app/home'), 1400)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const skip = () => navigate('/app/home')

  if (checking) return null

  return (
    <div style={styles.frame}>
      <style>{CSS}</style>
      <div style={styles.grain} />

      <div style={styles.topZone}>
        <div className="vrise" style={{ ...styles.markHalo, animationDelay: '0s' }}>
          <AnimatedVowFlame size={48} theme="light" />
        </div>
        <p className="vrise" style={{ ...styles.logo, animationDelay: '0.05s' }}>Vow</p>

        <h1 className="vrise" style={{ ...styles.headline, animationDelay: '0.16s' }}>
          Your counter just started.
        </h1>
        <p className="vrise" style={{ ...styles.headlineSub, animationDelay: '0.22s' }}>
          Save it now, so a new phone or a reinstall can't take it from you.
        </p>
      </div>

      <div className="vault-rise" style={styles.vault}>
        <span style={styles.vaultGrip} />

        {!Capacitor.isNativePlatform() && (
          <>
            <button
              type="button"
              className="vow-google"
              style={{ ...styles.googleBtn, ...(oauthLoading ? styles.btnDisabled : {}) }}
              onClick={handleGoogle}
              disabled={oauthLoading}
            >
              <GoogleG />
              {oauthLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine} />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              className="vow-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              placeholder="Your name (optional)"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              className="vow-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              placeholder="you@example.com"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              className="vow-input"
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
            className="vow-submit"
            disabled={loading}
            style={{ ...styles.submitBtn, ...(loading ? styles.btnDisabled : {}) }}
          >
            {loading ? 'One moment…' : 'Save my progress'}
          </button>

          {error && <p style={styles.err}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
        </form>

        <button type="button" className="vow-skip" onClick={skip} style={styles.skipLink}>
          Not now — remind me later
        </button>

        <p style={styles.footer}>
          By continuing, you agree to our{' '}
          <Link to="/terms" className="vow-footer-link" style={styles.footerLink}>Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="vow-footer-link" style={styles.footerLink}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}

const styles = {
  frame: {
    minHeight: '100vh',
    background:
      'radial-gradient(1100px 560px at 50% -14%, rgba(197,87,44,0.13), transparent 58%), ' +
      'radial-gradient(820px 480px at 50% 60%, rgba(133,79,11,0.07), transparent 60%), ' +
      'linear-gradient(180deg, #F4EFE4 0%, #ECE4D5 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    position: 'relative',
    overflowX: 'hidden',
  },
  grain: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
    opacity: 0.035,
    pointerEvents: 'none',
  },

  topZone: {
    position: 'relative',
    width: '100%',
    maxWidth: '460px',
    flex: '1 1 auto',
    minHeight: '36vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2.75rem 1.75rem 1.5rem',
    boxSizing: 'border-box',
  },
  markHalo: {
    width: '62px',
    height: '62px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at 50% 44%, rgba(255,184,90,0.22), rgba(255,184,90,0) 70%)',
    border: '0.5px solid #EFE2CC',
  },
  logo: {
    fontSize: '30px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: '0.6rem 0 0',
    letterSpacing: '-0.01em',
    fontFamily: 'Georgia, serif',
  },
  headline: {
    fontSize: '25px',
    lineHeight: 1.24,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '1.75rem 0 0.6rem',
    letterSpacing: '-0.01em',
  },
  headlineSub: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
  },

  vault: {
    position: 'relative',
    width: '100%',
    maxWidth: '460px',
    marginTop: 'auto',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    borderRadius: '32px 32px 0 0',
    padding: '1.5rem 1.75rem calc(2rem + env(safe-area-inset-bottom, 0px))',
    boxSizing: 'border-box',
    boxShadow: '0 -24px 60px -30px rgba(40,25,10,0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  vaultGrip: {
    display: 'block',
    width: '38px',
    height: '4px',
    borderRadius: '999px',
    background: 'rgba(250,247,241,0.18)',
    margin: '0 auto 1.4rem',
  },

  field: { marginBottom: '1.15rem' },
  label: {
    display: 'block',
    fontSize: '10.5px',
    color: 'rgba(250,247,241,0.5)',
    marginBottom: '7px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontFamily: 'Georgia, serif',
  },
  input: {
    width: '100%',
    padding: '9px 2px',
    border: 'none',
    borderBottom: '1px solid rgba(250,247,241,0.22)',
    background: 'transparent',
    fontSize: '15px',
    color: '#FAF7F1',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
    borderRadius: 0,
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },

  submitBtn: {
    width: '100%',
    padding: '15px',
    marginTop: '0.5rem',
    background: 'linear-gradient(180deg, #D9B57A 0%, #B89456 100%)',
    color: '#2A1810',
    border: 'none',
    borderRadius: '13px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 8px 22px -8px rgba(216,181,122,0.5), inset 0 1px 0 rgba(255,255,255,0.35)',
    fontFamily: 'Georgia, serif',
    letterSpacing: '0.01em',
    transition: 'filter 0.2s ease, transform 0.2s ease',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '0 0 1.5rem',
  },
  dividerLine: {
    flex: 1,
    height: '0.5px',
    background: 'rgba(250,247,241,0.16)',
  },
  dividerText: {
    fontSize: '10px',
    color: 'rgba(250,247,241,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
  },

  googleBtn: {
    width: '100%',
    padding: '13px',
    borderRadius: '13px',
    background: 'transparent',
    border: '0.5px solid rgba(250,247,241,0.28)',
    color: '#FAF7F1',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontFamily: 'inherit',
    transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.1s ease',
    letterSpacing: '0.01em',
  },

  skipLink: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    background: 'transparent',
    border: 'none',
    color: 'rgba(250,247,241,0.55)',
    fontSize: '12.5px',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    cursor: 'pointer',
    margin: '1.1rem 0 0',
    padding: '4px',
  },

  err: {
    fontSize: '12px',
    color: '#F2C0B6',
    marginTop: '12px',
    textAlign: 'center',
    padding: '10px',
    background: 'rgba(178,59,59,0.18)',
    border: '0.5px solid rgba(226,120,100,0.3)',
    borderRadius: '9px',
  },
  success: {
    fontSize: '12px',
    color: '#CDEBD7',
    marginTop: '12px',
    textAlign: 'center',
    padding: '10px',
    background: 'rgba(45,110,80,0.2)',
    border: '0.5px solid rgba(120,180,140,0.3)',
    borderRadius: '9px',
  },

  footer: {
    textAlign: 'center',
    fontSize: '11px',
    color: 'rgba(250,247,241,0.45)',
    marginTop: '1.1rem',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
  },
  footerLink: {
    color: 'rgba(217,181,122,0.85)',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
    transition: 'color 0.2s ease',
  },
}