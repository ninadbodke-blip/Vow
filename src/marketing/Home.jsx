import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'

// =====================================================================
// HOMEPAGE
// =====================================================================
// Premium editorial landing page. Top to bottom: ember-flame hero with the
// positioning line, a short "what Vow is" beat, the six stages as an
// interactive vertical "thread" (accordion),
// and a closing CTA. Nav + footer live in the shared MarketingLayout.
//
// Responsiveness: most of this page is fluid already (clamp() type +
// auto-fit grids + a naturally vertical thread). A small scoped <style>
// block at the top trims horizontal padding on phones. No external CSS.
// =====================================================================

const STAGES = [
  { name: 'Notice', desc: "See what's actually happening, without judgment." },
  { name: 'Reflect', desc: 'Understand the patterns before trying to change them.' },
  { name: 'Commit', desc: 'Make the decision real. Pick the date. Tell someone.' },
  { name: 'Endure', desc: 'Get through the first storm. The cravings will pass.' },
  { name: 'Build', desc: 'Replace the old shape with new ones that hold up.' },
  { name: 'Reclaim', desc: 'When a slip comes, return with kindness, not shame.' },
]

// Each stage maps loosely to a moment in the journey, so the
// section doubles as a teaser of the writing inside the app. (Full, indexable
// pages can hang off these cards later; for now they read as a standing index.)

// ---------------------------------------------------------------------
// HERO FLAME
// Ported from the Welcome screen's third slide (the "furnace"), in the Vow
// flame palette: deep clay back (#854F0B), gold core (#D9B57A), and an
// ember-red inner spark (#C5572C), with a soft radial halo behind it. Three
// layers flicker at different speeds (back 1.8s, core 1.2s, ember 0.8s).
// ---------------------------------------------------------------------
function HeroFlame() {
  return (
    <div style={styles.flameWrap} aria-hidden="true">
      <div style={styles.flameGlow} />
      <svg viewBox="0 0 100 100" style={styles.flameSvg} xmlns="http://www.w3.org/2000/svg">
        <path d="M50 15 Q70 50 50 90 Q30 50 50 15" fill="#854F0B" opacity="0.85">
          <animate attributeName="d" values="M50 15 Q70 50 50 90 Q30 50 50 15; M45 20 Q75 45 50 90 Q25 55 45 20; M55 20 Q65 55 50 90 Q35 45 55 20; M50 15 Q70 50 50 90 Q30 50 50 15" dur="1.8s" repeatCount="indefinite" />
        </path>
        <path d="M50 35 Q65 65 50 90 Q35 65 50 35" fill="#D9B57A">
          <animate attributeName="d" values="M50 35 Q65 65 50 90 Q35 65 50 35; M52 30 Q60 60 50 90 Q30 70 52 30; M48 30 Q70 70 50 90 Q40 60 48 30; M50 35 Q65 65 50 90 Q35 65 50 35" dur="1.2s" repeatCount="indefinite" />
        </path>
        <path d="M50 55 Q55 75 50 90 Q45 75 50 55" fill="#C5572C">
          <animate attributeName="d" values="M50 55 Q55 75 50 90 Q45 75 50 55; M48 50 Q58 70 50 90 Q42 70 48 50; M50 55 Q55 75 50 90 Q45 75 50 55" dur="0.8s" repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------
// STAGE THREAD (accordion)
// A vertical gold thread with a node per stage. Each row shows the number
// and name; tapping expands a short description. One open at a time.
// ---------------------------------------------------------------------
function StageThread() {
  const [open, setOpen] = useState(0)

  return (
    <div style={styles.thread}>
      <div style={styles.threadLine} aria-hidden="true" />
      {STAGES.map((s, i) => {
        const isOpen = open === i
        return (
          <div key={s.name} style={styles.threadItem}>
            <span style={{ ...styles.threadDot, background: isOpen ? '#C5572C' : '#FAF7F1' }} aria-hidden="true" />
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={styles.threadHeader}
              aria-expanded={isOpen}
            >
              <span style={styles.threadNum}>{String(i + 1).padStart(2, '0')}</span>
              <span style={styles.threadName}>{s.name}</span>
              <span style={styles.threadToggle}>{isOpen ? '\u2212' : '+'}</span>
            </button>
            <div
              style={{
                ...styles.threadBody,
                maxHeight: isOpen ? '120px' : '0',
                opacity: isOpen ? 1 : 0,
              }}
            >
              <p style={styles.threadDesc}>{s.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()

  return (
    <MarketingLayout>
      <style>{`
        @media (max-width: 700px) {
          .vow-pad { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* HERO */}
      <section className="vow-pad" style={styles.hero}>
        <HeroFlame />
        <h1 style={styles.heroTitle}>
          A structured path<br />towards recovery.
        </h1>
        <p style={styles.heroSubtitle}>
          Not just a tracker — a companion for the messy,<br />
          non-linear reality of recovery.
        </p>
        <button onClick={() => navigate('/app')} style={styles.heroCta}>
          Begin your journey
        </button>
        <p style={styles.heroNote}>
          Free to start. Works on any phone — Android app coming soon to Google Play.
        </p>
      </section>

      {/* WHAT IS VOW */}
      <section className="vow-pad" style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>What is Vow</p>
          <h2 style={styles.sectionTitle}>Not just a tracker. A companion.</h2>
          <p style={styles.body}>
            Vow is a sobriety and recovery app for people who've decided that this
            matters. It's built on the Transtheoretical Model — the most studied
            framework in behavior change — and rebuilt for the messy, non-linear
            truth of real recovery.
          </p>
          <p style={styles.body}>
            The streak counter is there if you want it — but it was never the
            point. No badges to chase, no feed to perform for. Just the work,
            made walkable, one day at a time.
          </p>
        </div>
      </section>

      {/* SIX STAGES — interactive thread */}
      <section className="vow-pad" style={styles.sectionAlt}>
        <div style={styles.innerNarrow}>
          <p style={styles.eyebrow}>Six stages · one path</p>
          <h2 style={styles.sectionTitle}>Where you are matters.</h2>
          <p style={styles.body}>
            Recovery doesn't move in straight lines. Vow meets you at the stage
            you're in and offers what that stage actually needs — different on day
            three than on day three hundred.
          </p>
          <StageThread />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="vow-pad" style={styles.ctaSection}>
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
    padding: '72px 32px 96px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  flameWrap: {
    position: 'relative',
    width: 'clamp(180px, 30vw, 260px)',
    height: 'clamp(180px, 30vw, 260px)',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameGlow: {
    position: 'absolute',
    inset: '-22%',
    background:
      'radial-gradient(circle at 50% 60%, rgba(197,87,44,0.30) 0%, rgba(197,87,44,0.14) 36%, rgba(197,87,44,0) 70%)',
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
    margin: '0 0 22px',
    fontFamily: 'Georgia, serif',
    letterSpacing: '-0.01em',
  },
  heroSubtitle: {
    fontSize: 'clamp(17px, 2vw, 20px)',
    color: '#5B4F3F',
    lineHeight: 1.55,
    margin: '0 0 36px',
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
  heroNote: {
    fontSize: '13.5px',
    color: '#9C8C78',
    margin: '18px 0 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  section: {
    padding: '76px 32px',
  },
  sectionAlt: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    padding: '76px 32px',
  },
  inner: {
    maxWidth: '880px',
    margin: '0 auto',
  },
  innerNarrow: {
    maxWidth: '720px',
    margin: '0 auto',
  },
  eyebrow: {
    fontSize: '12px',
    color: '#A07A3C',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    margin: '0 0 16px',
  },
  sectionTitle: {
    fontSize: 'clamp(28px, 4vw, 40px)',
    fontWeight: 400,
    color: '#2A1F15',
    lineHeight: 1.2,
    margin: '0 0 22px',
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

  // ---- Stage thread ----
  thread: {
    position: 'relative',
    marginTop: '40px',
    paddingLeft: '4px',
  },
  threadLine: {
    position: 'absolute',
    left: '7px',
    top: '8px',
    bottom: '8px',
    width: '1.5px',
    background: '#D9B57A',
    opacity: 0.8,
  },
  threadItem: {
    position: 'relative',
    paddingLeft: '34px',
    borderBottom: '0.5px solid rgba(168,122,60,0.18)',
  },
  threadDot: {
    position: 'absolute',
    left: '2px',
    top: '21px',
    width: '11px',
    height: '11px',
    borderRadius: '50%',
    border: '1.5px solid #C5572C',
    boxSizing: 'border-box',
    transition: 'background 0.25s ease',
  },
  threadHeader: {
    width: '100%',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 0',
    textAlign: 'left',
    fontFamily: 'Georgia, serif',
  },
  threadNum: {
    fontSize: '12px',
    color: '#A07A3C',
    letterSpacing: '0.14em',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    minWidth: '22px',
  },
  threadName: {
    fontSize: 'clamp(20px, 3vw, 26px)',
    fontWeight: 400,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
  },
  threadToggle: {
    marginLeft: 'auto',
    fontSize: '22px',
    color: '#A07A3C',
    fontWeight: 400,
    lineHeight: 1,
  },
  threadBody: {
    overflow: 'hidden',
    transition: 'max-height 0.35s ease, opacity 0.3s ease',
  },
  threadDesc: {
    fontSize: '17px',
    color: '#5B4F3F',
    lineHeight: 1.6,
    margin: '0 0 18px',
    fontStyle: 'italic',
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
    margin: '0 0 30px',
    fontFamily: 'Georgia, serif',
  },
}