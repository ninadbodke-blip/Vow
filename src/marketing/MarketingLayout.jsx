import { Link, useNavigate } from 'react-router-dom'

// =====================================================================
// MARKETING LAYOUT
// =====================================================================
// Shared wrapper for every public marketing page (Home, About, HowItWorks,
// Pricing, FAQ, Contact). Provides the top nav (logo + links + "Get the
// app" CTA) and the footer (three link columns + crisis helplines + the
// Vow Labs · MSME line). Marketing pages just import this and pass their
// content as children.
// =====================================================================

export default function MarketingLayout({ children }) {
  const navigate = useNavigate()

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.logo} aria-label="Vow home">
          <img src="/favicon.svg" alt="" style={styles.logoMark} />
          <span style={styles.logoText}>Vow</span>
        </Link>
        <nav style={styles.nav}>
          <Link to="/how-it-works" style={styles.navLink}>How it works</Link>
          <Link to="/pricing" style={styles.navLink}>Pricing</Link>
          <Link to="/about" style={styles.navLink}>About</Link>
          <Link to="/faq" style={styles.navLink}>FAQ</Link>
          <button onClick={() => navigate('/app')} style={styles.ctaBtn}>
            Get the app
          </button>
        </nav>
      </header>

      <main style={styles.main}>
        {children}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerCol}>
            <h4 style={styles.footerHeading}>Product</h4>
            <Link to="/" style={styles.footerLink}>Home</Link>
            <Link to="/how-it-works" style={styles.footerLink}>How it works</Link>
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
    padding: '24px 32px',
    boxSizing: 'border-box',
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
  logoMark: {
    width: '30px',
    height: '30px',
    display: 'block',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 500,
    letterSpacing: '0.02em',
    fontFamily: 'Georgia, serif',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
  },
  navLink: {
    color: '#5B4F3F',
    textDecoration: 'none',
    fontSize: '14.5px',
    fontFamily: 'Georgia, serif',
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
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    letterSpacing: '0.01em',
  },
  main: { flex: 1 },
  footer: {
    background: '#F4ECDD',
    borderTop: '0.5px solid #E8DCC2',
    padding: '60px 32px 36px',
    marginTop: '80px',
  },
  footerInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '40px',
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  footerHeading: {
    fontSize: '11px',
    color: '#A07A3C',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 6px',
  },
  footerLink: {
    fontSize: '14px',
    color: '#5B4F3F',
    textDecoration: 'none',
    fontFamily: 'Georgia, serif',
  },
  footerBottom: {
    maxWidth: '1100px',
    margin: '40px auto 0',
    paddingTop: '24px',
    borderTop: '0.5px solid #E8DCC2',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'center',
  },
  crisis: {
    fontSize: '12.5px',
    color: '#7B6B58',
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
  crisisLabel: {
    color: '#A07A3C',
  },
  crisisLink: {
    color: '#5B4F3F',
    textDecoration: 'none',
  },
  crisisSep: {
    color: '#C9B998',
  },
  copyright: {
    fontSize: '12px',
    color: '#9C8C78',
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
  tm: {
    fontSize: '0.62em',
    verticalAlign: 'super',
    letterSpacing: 0,
    marginLeft: '1px',
  },
}
