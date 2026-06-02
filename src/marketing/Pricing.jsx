import { useNavigate } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'

export default function Pricing() {
  const navigate = useNavigate()

  return (
    <MarketingLayout>
      <section style={styles.heroSection}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Pricing</p>
          <h1 style={styles.title}>One payment. Yours for good.</h1>
          <p style={styles.lede}>
            We don't believe in subscription fatigue, and we definitely don't
            believe in charging someone every month while they're trying to do
            the hardest work of their life. Vow is free where it counts. Vow
            Path is paid once.
          </p>
        </div>
      </section>

      <section style={styles.tiersSection}>
        <div style={styles.tierGrid}>
          <div style={styles.tierCard}>
            <p style={styles.tierEyebrow}>Free forever</p>
            <h2 style={styles.tierName}>Vow</h2>
            <p style={styles.tierPrice}>₹0</p>
            <p style={styles.tierBlurb}>
              The whole path, walkable at your pace.
            </p>
            <ul style={styles.tierList}>
              <li style={styles.tierItem}>All six stages — Notice through Reclaim</li>
              <li style={styles.tierItem}>Daily check-ins and the journal</li>
              <li style={styles.tierItem}>Your anchors — the people who hold you up</li>
              <li style={styles.tierItem}>Replacement activity engine</li>
              <li style={styles.tierItem}>Streaks, urge log, slip flow</li>
            </ul>
            <button onClick={() => navigate('/app')} style={styles.tierCtaSecondary}>
              Start free
            </button>
          </div>

          <div style={styles.tierCardPaid}>
            <p style={styles.tierEyebrow}>Pay once · keep forever</p>
            <h2 style={styles.tierName}>Vow Path</h2>
            <p style={styles.tierPrice}>
              <span style={styles.priceMain}>₹999</span>
              <span style={styles.priceAlt}> · $99 international</span>
            </p>
            <p style={styles.tierBlurb}>
              The deep guided journey for each stage.
            </p>
            <ul style={styles.tierList}>
              <li style={styles.tierItem}>Everything in Free, plus —</li>
              <li style={styles.tierItem}>Day-by-day structured program for each stage</li>
              <li style={styles.tierItem}>Written guidance from the practice</li>
              <li style={styles.tierItem}>Prompts that change over time</li>
              <li style={styles.tierItem}>Full library — articles, motivation, mirror</li>
              <li style={styles.tierItem}>Founder audio clips through the hard parts</li>
            </ul>
            <button onClick={() => navigate('/app')} style={styles.tierCtaPrimary}>
              Get Vow Path
            </button>
          </div>
        </div>
      </section>

      <section style={styles.faqSection}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Honest answers</p>

          <div style={styles.faqItem}>
            <h3 style={styles.faqQ}>Why one-time and not a subscription?</h3>
            <p style={styles.faqA}>
              Because recovery has hard weeks, and we never want someone to
              wonder whether they can afford the app this month. You pay once.
              You keep it.
            </p>
          </div>

          <div style={styles.faqItem}>
            <h3 style={styles.faqQ}>What about refunds?</h3>
            <p style={styles.faqA}>
              Refunds follow the standard policies of the Google Play Store
              (for Android) and our payment processor (for web purchases). Full
              terms are in our Terms of Service.
            </p>
          </div>

          <div style={styles.faqItem}>
            <h3 style={styles.faqQ}>What is the twenty percent commitment?</h3>
            <p style={styles.faqA}>
              Twenty percent of Vow Labs' net margin goes to rural addiction
              recovery programs in India. Reported transparently each year.
            </p>
          </div>

          <button onClick={() => navigate('/faq')} style={styles.linkBtn}>
            See all questions →
          </button>
        </div>
      </section>
    </MarketingLayout>
  )
}

const styles = {
  heroSection: {
    padding: '80px 32px 40px',
    textAlign: 'center',
  },
  tiersSection: {
    padding: '40px 32px 80px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  faqSection: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
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
  title: {
    fontSize: 'clamp(34px, 5vw, 50px)',
    fontWeight: 400,
    color: '#2A1F15',
    lineHeight: 1.15,
    margin: '0 0 24px',
    fontFamily: 'Georgia, serif',
  },
  lede: {
    fontSize: '18px',
    color: '#5B4F3F',
    lineHeight: 1.65,
    margin: '0 auto',
    maxWidth: '600px',
    fontFamily: 'Georgia, serif',
  },
  tierGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    padding: '0 32px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  tierCard: {
    background: '#FAF7F1',
    border: '0.5px solid #E8DCC2',
    borderRadius: '18px',
    padding: '36px 32px',
  },
  tierCardPaid: {
    background: 'linear-gradient(180deg, #2A1F15 0%, #1F1610 100%)',
    border: 'none',
    borderRadius: '18px',
    padding: '36px 32px',
    color: '#FAF7F1',
  },
  tierEyebrow: {
    fontSize: '11px',
    color: '#A07A3C',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
  },
  tierName: {
    fontSize: '32px',
    fontWeight: 500,
    margin: '0 0 16px',
    fontFamily: 'Georgia, serif',
  },
  tierPrice: {
    fontSize: '20px',
    margin: '0 0 12px',
    fontFamily: 'Georgia, serif',
  },
  priceMain: {
    fontSize: '40px',
    fontWeight: 500,
  },
  priceAlt: {
    fontSize: '16px',
    color: '#9C8C78',
  },
  tierBlurb: {
    fontSize: '16px',
    color: 'inherit',
    opacity: 0.8,
    margin: '0 0 24px',
    fontFamily: 'Georgia, serif',
  },
  tierList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 32px',
  },
  tierItem: {
    fontSize: '15px',
    lineHeight: 1.55,
    padding: '8px 0',
    borderBottom: '0.5px solid rgba(232, 220, 194, 0.3)',
    fontFamily: 'Georgia, serif',
  },
  tierCtaSecondary: {
    background: 'transparent',
    color: '#2A1F15',
    border: '1px solid #2A1F15',
    padding: '14px 28px',
    borderRadius: '999px',
    fontSize: '15px',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    width: '100%',
  },
  tierCtaPrimary: {
    background: '#FAF7F1',
    color: '#2A1F15',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '999px',
    fontSize: '15px',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    width: '100%',
  },
  faqItem: {
    paddingTop: '24px',
    paddingBottom: '24px',
    borderBottom: '0.5px solid #E8DCC2',
  },
  faqQ: {
    fontSize: '18px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: '0 0 10px',
    fontFamily: 'Georgia, serif',
  },
  faqA: {
    fontSize: '16px',
    color: '#5B4F3F',
    lineHeight: 1.65,
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
  linkBtn: {
    background: 'transparent',
    color: '#2A1F15',
    border: 'none',
    fontSize: '15px',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    textDecoration: 'underline',
    marginTop: '24px',
    padding: 0,
  },
}
