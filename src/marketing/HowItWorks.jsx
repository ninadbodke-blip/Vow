import { useNavigate } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'

const STAGES = [
  {
    name: 'Notice',
    length: '5 days',
    desc: "Before you can change anything, you have to see it clearly. Notice is about getting curious about your own patterns — when, where, why — without trying to fix anything yet.",
  },
  {
    name: 'Reflect',
    length: '21 days',
    desc: 'Once you see the patterns, you can understand them. Reflect is where the story underneath comes into focus. The triggers, the moments, the costs you might not have let yourself count.',
  },
  {
    name: 'Commit',
    length: '10 days',
    desc: "Decisions only become real when you make them real. Commit is the runway — picking the date, naming the people who'll know, gathering what you need before the first hard day.",
  },
  {
    name: 'Endure',
    length: '21 days',
    desc: 'The first three weeks are the storm. Endure is built for those days — the crash moments, the cravings, the urge to bargain. With every tool you need, including the replacement activity engine.',
  },
  {
    name: 'Build',
    length: '9 weekly entries',
    desc: 'Old shapes need replacing, not just removing. Build is the long quiet work of putting something solid where the old thing used to be. Identity, routine, the people you keep close.',
  },
  {
    name: 'Reclaim',
    length: '14 days',
    desc: "When a slip happens — and for most people, it does — Reclaim is the path back. No shame, no starting over from zero. Just an honest look at what happened and a softer way home.",
  },
]

export default function HowItWorks() {
  const navigate = useNavigate()

  return (
    <MarketingLayout>
      <section style={styles.heroSection}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>How it works</p>
          <h1 style={styles.title}>Six stages. One honest path.</h1>
          <p style={styles.lede}>
            Vow is built on the Transtheoretical Model — the most studied
            framework for behavior change. We've renamed the stages to fit how
            recovery actually feels, and rebuilt each one for the work it
            requires.
          </p>
        </div>
      </section>

      <section style={styles.stagesSection}>
        <div style={styles.inner}>
          {STAGES.map((s, i) => (
            <article key={s.name} style={styles.stageRow}>
              <div style={styles.stageLeft}>
                <p style={styles.stageNum}>{String(i + 1).padStart(2, '0')}</p>
                <h2 style={styles.stageName}>{s.name}</h2>
                <p style={styles.stageLength}>{s.length}</p>
              </div>
              <p style={styles.stageDesc}>{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={styles.tiersSection}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Two tiers</p>
          <h2 style={styles.h2}>Free where it counts. Paid where it goes deeper.</h2>
          <p style={styles.body}>
            Every stage has a free home — daily check-ins, the journal, your
            anchors, the replacement activity engine, all six stages of the path
            walkable for free. <strong style={styles.strong}>Vow Path</strong> is the deep
            guided journey: a structured day-by-day program for each stage with
            written guidance, prompts that change over time, and the full library.
          </p>
          <p style={styles.body}>
            One-time payment. ₹999 in India, $99 internationally. Pay once,
            keep it. No subscriptions to cancel during a hard week.
          </p>
          <button onClick={() => navigate('/pricing')} style={styles.tertiaryBtn}>
            See pricing →
          </button>
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.inner}>
          <h2 style={styles.ctaTitle}>Walk the first stage.</h2>
          <button onClick={() => navigate('/app')} style={styles.heroCta}>
            Begin your journey
          </button>
        </div>
      </section>
    </MarketingLayout>
  )
}

const styles = {
  heroSection: {
    padding: '80px 32px 40px',
  },
  stagesSection: {
    padding: '40px 32px 80px',
  },
  tiersSection: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    padding: '80px 32px',
  },
  ctaSection: {
    padding: '80px 32px 100px',
    textAlign: 'center',
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
  title: {
    fontSize: 'clamp(34px, 5vw, 50px)',
    fontWeight: 400,
    color: '#2A1F15',
    lineHeight: 1.15,
    margin: '0 0 24px',
    fontFamily: 'Georgia, serif',
  },
  lede: {
    fontSize: '19px',
    color: '#5B4F3F',
    lineHeight: 1.65,
    margin: '0',
    maxWidth: '680px',
    fontFamily: 'Georgia, serif',
  },
  stageRow: {
    display: 'grid',
    gridTemplateColumns: '180px 1fr',
    gap: '32px',
    padding: '32px 0',
    borderTop: '0.5px solid #E8DCC2',
    alignItems: 'start',
  },
  stageLeft: {
    paddingTop: '4px',
  },
  stageNum: {
    fontSize: '12px',
    color: '#A07A3C',
    letterSpacing: '0.18em',
    margin: '0 0 8px',
    fontFamily: 'Georgia, serif',
  },
  stageName: {
    fontSize: '26px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: '0 0 4px',
    fontFamily: 'Georgia, serif',
  },
  stageLength: {
    fontSize: '13px',
    color: '#9C8C78',
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
  stageDesc: {
    fontSize: '17px',
    color: '#5B4F3F',
    lineHeight: 1.65,
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
  h2: {
    fontSize: 'clamp(28px, 4vw, 38px)',
    fontWeight: 400,
    color: '#2A1F15',
    lineHeight: 1.2,
    margin: '0 0 24px',
    fontFamily: 'Georgia, serif',
  },
  body: {
    fontSize: '18px',
    color: '#5B4F3F',
    lineHeight: 1.65,
    margin: '0 0 18px',
    fontFamily: 'Georgia, serif',
  },
  strong: {
    color: '#2A1F15',
    fontWeight: 600,
  },
  tertiaryBtn: {
    background: 'transparent',
    color: '#2A1F15',
    border: 'none',
    padding: '0',
    fontSize: '16px',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    textDecoration: 'underline',
    marginTop: '12px',
  },
  ctaTitle: {
    fontSize: 'clamp(28px, 4vw, 38px)',
    fontWeight: 400,
    color: '#2A1F15',
    margin: '0 0 32px',
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
  },
}
