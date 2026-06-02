import { useNavigate } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'

// =====================================================================
// HOMEPAGE
// =====================================================================
// The first thing the world sees at vowapp.in. Hero with the flame, brief
// promise, primary CTA. Then: what Vow is in two sentences, the six-stage
// path as a previewed grid, and a closing CTA. All marketing pages share
// MarketingLayout (nav + footer).
// =====================================================================

const STAGES = [
  { name: 'Notice', desc: "See what's actually happening, without judgment." },
  { name: 'Reflect', desc: 'Understand the patterns before trying to change them.' },
  { name: 'Commit', desc: 'Make the decision real. Pick the date. Tell someone.' },
  { name: 'Endure', desc: 'Get through the first storm. The cravings will pass.' },
  { name: 'Build', desc: 'Replace the old shape with new ones that hold up.' },
  { name: 'Reclaim', desc: 'When a slip comes, return with kindness, not shame.' },
]

// ---------------------------------------------------------------------
// HERO FLAME
// Ported from the Welcome screen's third slide (the "furnace"), recolored
// for the cream background: the center glows ember-orange (#F0712B) rather
// than the app's cream-white, and a soft radial halo sits behind it so the
// whole thing reads as a warm light source. Three layers flicker at
// different speeds (back 1.8s, core 1.2s, ember 0.8s).
// ---------------------------------------------------------------------
function HeroFlame() {
  return (
    <div style={styles.flameWrap} aria-hidden="true">
      <div style={styles.flameGlow} />
      <svg viewBox="0 0 100 100" style={styles.flameSvg} xmlns="http://www.w3.org/2000/svg">
        {/* Back flame — deep amber, slow */}
        <path d="M50 15 Q70 50 50 90 Q30 50 50 15" fill="#8A4310" opacity="0.85">
          <animate attributeName="d" values="M50 15 Q70 50 50 90 Q30 50 50 15; M45 20 Q75 45 50 90 Q25 55 45 20; M55 20 Q65 55 50 90 Q35 45 55 20; M50 15 Q70 50 50 90 Q30 50 50 15" dur="1.8s" repeatCount="indefinite" />
        </path>
        {/* Core flame — burnt orange (brand clay), faster */}
        <path d="M50 35 Q65 65 50 90 Q35 65 50 35" fill="#C5572C">
          <animate attributeName="d" values="M50 35 Q65 65 50 90 Q35 65 50 35; M52 30 Q60 60 50 90 Q30 70 52 30; M48 30 Q70 70 50 90 Q40 60 48 30; M50 35 Q65 65 50 90 Q35 65 50 35" dur="1.2s" repeatCount="indefinite" />
        </path>
        {/* Inner ember — glowing ember-orange, rapid flicker (was cream-white) */}
        <path d="M50 55 Q55 75 50 90 Q45 75 50 55" fill="#F0712B">
          <animate attributeName="d" values="M50 55 Q55 75 50 90 Q45 75 50 55; M48 50 Q58 70 50 90 Q42 70 48 50; M50 55 Q55 75 50 90 Q45 75 50 55" dur="0.8s" repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()

  return (
    <MarketingLayout>
      {/* HERO */}
      <section style={styles.hero}>
        <HeroFlame />
        <h1 style={styles.heroTitle}>
          A structured path<br />towards recovery.
        </h1>
        <p style={styles.heroSubtitle}>
          Grounded in evidence.<br />
          Designed to be there for the hard days.
        </p>
        <button onClick={() => navigate('/app')} style={styles.heroCta}>
          Begin your journey
        </button>
      </section>

      {/* WHAT IS VOW */}
      <section style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>What is Vow</p>
          <h2 style={styles.sectionTitle}>Not a tracker. A companion.</h2>
          <p style={styles.body}>
            Vow is a sobriety and recovery app for people who've decided that this
            matters. It's built on the Transtheoretical Model — the most studied
            framework in behavior change — and rebuilt for the messy, non-linear
            truth of real recovery.
          </p>
          <p style={styles.body}>
            No streaks to brag about. No badges. No social feed. Just the work,
            made walkable, one day at a time.
          </p>
        </div>
      </section>

      {/* SIX STAGES */}
      <section style={styles.sectionAlt}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Six stages · one path</p>
          <h2 style={styles.sectionTitle}>Where you are matters.</h2>
          <p style={styles.body}>
            Recovery doesn't move in straight lines. Vow meets you at the stage
            you're in and offers what that stage actually needs — different on day
            three than on day three hundred.
          </p>
          <div style={styles.stagesGrid}>
            {STAGES.map((s, i) => (
              <div key={s.name} style={styles.stageCard}>
                <p style={styles.stageNum}>{String(i + 1).padStart(2, '0')}</p>
                <h3 style={styles.stageName}>{s.name}</h3>
                <p style={styles.stageDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.inner}>
          <h2 style={styles.ctaTitle}>Ready when you are.</h2>
          <button onClick={() => navigate('/app')} style={styles.heroCta}>
            Begin your journey
          </button>
        </div>
      </section>
    </MarketingLayout>
  )
}

const styles = {
  hero: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '80px 32px 100px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  flameWrap: {
    position: 'relative',
    width: 'clamp(180px, 30vw, 260px)',
    height: 'clamp(180px, 30vw, 260px)',
    marginBottom: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameGlow: {
    position: 'absolute',
    inset: '-22%',
    background:
      'radial-gradient(circle at 50% 60%, rgba(240,113,43,0.30) 0%, rgba(240,113,43,0.14) 36%, rgba(240,113,43,0) 70%)',
    filter: 'blur(6px)',
    pointerEvents: 'none',
  },
  flameSvg: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'visible',
  },
  heroTitle: {
    fontSize: 'clamp(36px, 6vw, 58px)',
    fontWeight: 400,
    color: '#2A1F15',
    lineHeight: 1.12,
    margin: '0 0 24px',
    fontFamily: 'Georgia, serif',
    letterSpacing: '-0.01em',
  },
  heroSubtitle: {
    fontSize: 'clamp(17px, 2vw, 20px)',
    color: '#5B4F3F',
    lineHeight: 1.55,
    margin: '0 0 40px',
    fontFamily: 'Georgia, serif',
  },
  heroCta: {
    background: '#2A1F15',
    color: '#FAF7F1',
    border: 'none',
    padding: '16px 36px',
    borderRadius: '999px',
    fontSize: '16px',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    letterSpacing: '0.01em',
  },
  section: {
    padding: '80px 32px',
  },
  sectionAlt: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    padding: '80px 32px',
  },
  inner: {
    maxWidth: '880px',
    margin: '0 auto',
  },
  eyebrow: {
    fontSize: '12px',
    color: '#A07A3C',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 16px',
  },
  sectionTitle: {
    fontSize: 'clamp(28px, 4vw, 40px)',
    fontWeight: 400,
    color: '#2A1F15',
    lineHeight: 1.2,
    margin: '0 0 24px',
    fontFamily: 'Georgia, serif',
    letterSpacing: '-0.005em',
  },
  body: {
    fontSize: '18px',
    color: '#5B4F3F',
    lineHeight: 1.65,
    margin: '0 0 18px',
    fontFamily: 'Georgia, serif',
  },
  stagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginTop: '40px',
  },
  stageCard: {
    background: '#FAF7F1',
    border: '0.5px solid #E8DCC2',
    borderRadius: '14px',
    padding: '22px 22px 24px',
  },
  stageNum: {
    fontSize: '12px',
    color: '#A07A3C',
    letterSpacing: '0.18em',
    margin: '0 0 8px',
    fontFamily: 'Georgia, serif',
  },
  stageName: {
    fontSize: '22px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: '0 0 10px',
    fontFamily: 'Georgia, serif',
  },
  stageDesc: {
    fontSize: '15px',
    color: '#5B4F3F',
    lineHeight: 1.55,
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
  ctaSection: {
    padding: '80px 32px 100px',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: 'clamp(28px, 4vw, 38px)',
    fontWeight: 400,
    color: '#2A1F15',
    margin: '0 0 32px',
    fontFamily: 'Georgia, serif',
  },
}
