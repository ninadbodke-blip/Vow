import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// =====================================================================
// MARKETING LAYOUT
// =====================================================================
// Shared wrapper for every public marketing page. Provides:
//  - a responsive top nav (logo + links + CTA; collapses to a hamburger
//    menu under ~820px), and
//  - a dark "vault" footer (brand + mission + socials, link columns,
//    crisis helplines, and the Vow Labs / MSME line).
//
// Mobile behaviour is driven by a scoped <style> block (media queries) so
// we get real breakpoints without an external CSS file. Inline styles
// handle everything non-responsive.
// =====================================================================

const NAV_LINKS = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/quit-nicotine', label: 'Guides' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
]

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  )
}

export default function MarketingLayout({ children }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const go = (to) => {
    setMenuOpen(false)
    navigate(to)
  }

  return (
    <div style={styles.page}>
      <style>{`
        .vow-nav-desktop { display: flex; align-items: center; gap: 28px; }
        .vow-burger { display: none; background: none; border: none; cursor: pointer; color: #2A1F15; padding: 6px; line-height: 0; }
        @media (max-width: 820px) {
          .vow-nav-desktop { display: none; }
          .vow-burger { display: inline-flex; }
        }
        @media (min-width: 821px) {
          .vow-nav-panel { display: none !important; }
        }
        .vow-footer-grid { display: grid; grid-template-columns: 1.7fr 1fr 1fr 1fr; gap: 40px; }
        @media (max-width: 820px) { .vow-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; } }
        @media (max-width: 480px) { .vow-footer-grid { grid-template-columns: 1fr; gap: 28px; } }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerRow}>
          <Link to="/" style={styles.logo} aria-label="Vow home">
            <img src="/favicon.svg" alt="" style={styles.logoMark} />
            <span style={styles.logoText}>Vow</span>
          </Link>

          <nav className="vow-nav-desktop">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} style={styles.navLink}>{l.label}</Link>
            ))}
            <button onClick={() => navigate('/app')} style={styles.ctaBtn}>
              Get the app
            </button>
          </nav>

          <button
            className="vow-burger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav className="vow-nav-panel" style={styles.navPanel}>
            {NAV_LINKS.map((l) => (
              <button key={l.to} onClick={() => go(l.to)} style={styles.panelLink}>
                {l.label}
              </button>
            ))}
            <button onClick={() => go('/app')} style={styles.panelCta}>
              Get the app
            </button>
          </nav>
        )}
      </header>

      <main style={styles.main}>{children}</main>

      <footer style={styles.footer}>
        <div className="vow-footer-grid" style={styles.footerInner}>
          <div style={styles.brandCol}>
            <span style={styles.footerLogo}>Vow</span>
            <p style={styles.mission}>
              A quiet companion for the long work of recovery. Built in India.
            </p>
            <p style={styles.availability}>
              Available as a web app today. Android app coming soon to Google Play.
            </p>
            <div style={styles.social}>
              <a href="https://www.instagram.com/vowapp.in/" target="_blank" rel="noreferrer" style={styles.socialLink} aria-label="Instagram"><InstagramIcon /></a>
              <a href="https://x.com/vowappin" target="_blank" rel="noreferrer" style={styles.socialLink} aria-label="X"><XIcon /></a>
              <a href="https://www.facebook.com/profile.php?id=61590264526239" target="_blank" rel="noreferrer" style={styles.socialLink} aria-label="Facebook"><FacebookIcon /></a>
            </div>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerHeading}>Product</h4>
            <Link to="/" style={styles.footerLink}>Home</Link>
            <Link to="/how-it-works" style={styles.footerLink}>How it works</Link>
            <Link to="/quit-nicotine" style={styles.footerLink}>Guides</Link>
            <Link to="/pricing" style={styles.footerLink}>Pricing</Link>
            <Link to="/faq" style={styles.footerLink}>FAQ</Link>
          </div>
          <div style={styles.footerCol}>
            <h4 style={styles.footerHeading}>Company</h4>
            <Link to="/about" style={styles.footerLink}>About Vow Labs</Link>
            <Link to="/contact" style={styles.footerLink}>Contact</Link>
          </div>
          <div style={styles.footerCol}>
            <h4 style={styles.footerHeading}>Legal</h4>
            <Link to="/privacy" style={styles.footerLink}>Privacy Policy</Link>
            <Link to="/terms" style={styles.footerLink}>Terms of Service</Link>
          </div>
        </div>

        <div style={styles.footerBottom}>
          <p style={styles.crisis}>
            <span style={styles.crisisLabel}>In crisis?</span>{' '}
            <a href="tel:+919820466726" style={styles.crisisLink}>AASRA · +91 98204 66726</a>
            <span style={styles.crisisSep}> · </span>
            <a href="tel:+919152987821" style={styles.crisisLink}>iCall · +91 91529 87821</a>
          </p>
          <p style={styles.copyright}>
            © 2026 Vow<sup style={styles.tm}>™</sup> Labs · Made in India · Udyam-registered MSME
          </p>
        </div>
      </footer>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#FAF7F1',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    width: '100%',
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '20px 32px',
    boxSizing: 'border-box',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: '#2A1F15',
  },
  logoMark: { width: '30px', height: '30px', display: 'block' },
  logoText: {
    fontSize: '22px',
    fontWeight: 500,
    letterSpacing: '0.02em',
    fontFamily: 'Georgia, serif',
  },
  navLink: {
    color: '#5B4F3F',
    textDecoration: 'none',
    fontSize: '14.5px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: 400,
  },
  ctaBtn: {
    background: '#2A1F15',
    color: '#FAF7F1',
    border: 'none',
    padding: '10px 22px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    cursor: 'pointer',
    letterSpacing: '0.01em',
  },
  navPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginTop: '14px',
    paddingTop: '14px',
    borderTop: '0.5px solid #E8DCC2',
  },
  panelLink: {
    background: 'none',
    border: 'none',
    textAlign: 'left',
    color: '#3A2E20',
    fontSize: '17px',
    fontFamily: 'Georgia, serif',
    padding: '12px 2px',
    cursor: 'pointer',
  },
  panelCta: {
    marginTop: '8px',
    background: '#2A1F15',
    color: '#FAF7F1',
    border: 'none',
    padding: '14px 22px',
    borderRadius: '999px',
    fontSize: '15px',
    fontWeight: 500,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  main: { flex: 1 },

  footer: {
    background: '#2A1F15',
    color: '#FAF7F1',
    padding: '64px 32px 32px',
    marginTop: '80px',
  },
  footerInner: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  brandCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  footerLogo: {
    fontSize: '24px',
    fontWeight: 500,
    color: '#FAF7F1',
    fontFamily: 'Georgia, serif',
    letterSpacing: '0.02em',
  },
  mission: {
    fontSize: '15px',
    color: '#B8AC9A',
    lineHeight: 1.6,
    margin: '14px 0 0',
    fontFamily: 'Georgia, serif',
    maxWidth: '320px',
  },
  availability: {
    fontSize: '13px',
    color: '#8C8170',
    lineHeight: 1.6,
    margin: '14px 0 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    maxWidth: '320px',
  },
  social: {
    display: 'flex',
    gap: '16px',
    marginTop: '22px',
  },
  socialLink: {
    color: '#C9A86A',
    display: 'inline-flex',
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '11px',
  },
  footerHeading: {
    fontSize: '11px',
    color: '#C9A86A',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    margin: '0 0 6px',
  },
  footerLink: {
    fontSize: '14px',
    color: '#CFC4B4',
    textDecoration: 'none',
    fontFamily: 'Georgia, serif',
  },
  footerBottom: {
    maxWidth: '1100px',
    margin: '48px auto 0',
    paddingTop: '24px',
    borderTop: '0.5px solid rgba(255,255,255,0.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'center',
  },
  crisis: {
    fontSize: '12.5px',
    color: '#9C8F7C',
    margin: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  crisisLabel: { color: '#C9A86A' },
  crisisLink: { color: '#CFC4B4', textDecoration: 'none' },
  crisisSep: { color: '#6B5C4A' },
  copyright: {
    fontSize: '12px',
    color: '#8C8170',
    margin: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  tm: {
    fontSize: '0.62em',
    verticalAlign: 'super',
    letterSpacing: 0,
    marginLeft: '1px',
  },
}