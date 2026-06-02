import MarketingLayout from './MarketingLayout'

export default function About() {
  return (
    <MarketingLayout>
      <section style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>About</p>
          <h1 style={styles.title}>Vow Labs.</h1>
          <p style={styles.body}>
            Vow Labs is a small independent studio building software for the
            hardest, most private work humans do — including the work of
            recovery. We're Udyam-registered in India and operate out of Mumbai.
          </p>
          <p style={styles.body}>
            Vow is our first product. It exists because behavior change
            frameworks like the Transtheoretical Model have decades of evidence
            behind them, and almost no apps actually use them seriously. Most
            habit and recovery apps reward streaks and punish slips. Real
            recovery looks different.
          </p>

          <p style={styles.eyebrowSecond}>The founder</p>
          <p style={styles.body}>
            Vow was built by Ninad Bodke. The founder note — why this exists,
            how it started, what running has to do with quitting smoking — is
            being written and will live here soon.
          </p>

          <p style={styles.eyebrowSecond}>The promise</p>
          <p style={styles.body}>
            Twenty percent of Vow Labs' net margin goes to rural addiction
            recovery programs in India — places where structured care barely
            reaches. If Vow earns, people who need it most receive.
          </p>
        </div>
      </section>
    </MarketingLayout>
  )
}

const styles = {
  section: {
    padding: '80px 32px',
  },
  inner: {
    maxWidth: '720px',
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
  eyebrowSecond: {
    fontSize: '12px',
    color: '#A07A3C',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '48px 0 16px',
  },
  title: {
    fontSize: 'clamp(36px, 5vw, 52px)',
    fontWeight: 400,
    color: '#2A1F15',
    lineHeight: 1.15,
    margin: '0 0 28px',
    fontFamily: 'Georgia, serif',
  },
  body: {
    fontSize: '18px',
    color: '#5B4F3F',
    lineHeight: 1.65,
    margin: '0 0 18px',
    fontFamily: 'Georgia, serif',
  },
}
