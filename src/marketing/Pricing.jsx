import { useNavigate } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function Pricing() {
  const navigate = useNavigate()

  useSeo({
    title: 'Why Vow Is One Payment, Not a Subscription | Vow',
    description:
      'Vow has no subscription. The core is free forever, and the full guided Vow Path is yours for good after a single one-time payment. Here is why we built it that way.',
    canonical: 'https://vowapp.in/why-one-payment',
    type: 'website',
  })

  return (
    <MarketingLayout>
      <section style={styles.heroSection}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Why one payment</p>
          <h1 style={styles.title}>No subscription. Yours for good.</h1>
          <p style={styles.lede}>
            Vow will never charge you every month. The core of Vow is free,
            forever. And the full guided Vow Path is yours to keep for good after
            a single, one-time payment. That's the whole model — and it's a
            deliberate choice, not a temporary promotion.
          </p>
        </div>
      </section>

      <section style={styles.bodySection}>
        <div style={styles.inner}>
          <p style={styles.eyebrowSecond}>Free where it counts</p>
          <p style={styles.body}>
            You can walk the entire path in the free version of Vow — all six
            stages, daily check-ins, the journal, your anchors, the urge log, the
            slip flow. Recovery shouldn't be locked behind a paywall, and the
            things you need on an ordinary hard day are free and always will be.
          </p>

          <p style={styles.eyebrowSecond}>One payment for the deeper journey</p>
          <p style={styles.body}>
            The Vow Path — the deep, guided, day-by-day program through each
            stage — is unlocked with one payment, once. After that it's yours
            permanently. No renewals, no monthly charge, no losing access because
            a card expired during a difficult month.
          </p>

          <p style={styles.eyebrowSecond}>Why we refuse subscriptions</p>
          <p style={styles.body}>
            Because recovery has hard weeks, and we never want someone to wonder,
            in the middle of one, whether they can still afford the thing helping
            them through it. A subscription quietly turns your recovery into a
            recurring bill, and threatens to take support away exactly when money
            is tight and life is hardest. We won't build that. You pay once. You
            keep it. It's there on your worst day whether or not anything else is.
          </p>
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.inner}>
          <h2 style={styles.ctaTitle}>Start free. Stay as long as you need.</h2>
          <button onClick={() => navigate('/app')} style={styles.ctaBtn}>
            Open Vow →
          </button>
          <button onClick={() => navigate('/faq')} style={styles.linkBtn}>
            Read the common questions →
          </button>
        </div>
      </section>
    </MarketingLayout>
  )
}

const styles = {
  heroSection: { padding: '80px 32px 32px', textAlign: 'center' },
  bodySection: { padding: '24px 32px 40px' },
  ctaSection: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    padding: '72px 32px', textAlign: 'center',
  },
  inner: { maxWidth: '720px', margin: '0 auto' },
  eyebrow: { fontSize: '12px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 16px' },
  eyebrowSecond: { fontSize: '12px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '36px 0 14px' },
  title: { fontSize: 'clamp(34px, 5vw, 50px)', fontWeight: 400, color: '#2A1F15', lineHeight: 1.15, margin: '0 0 24px', fontFamily: 'Georgia, serif' },
  lede: { fontSize: '20px', color: '#3A2A1C', lineHeight: 1.6, margin: '0 auto', maxWidth: '620px', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  body: { fontSize: '18px', color: '#5B4F3F', lineHeight: 1.68, margin: '0 0 18px', fontFamily: 'Georgia, serif' },
  ctaTitle: { fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 400, color: '#2A1F15', lineHeight: 1.2, margin: '0 0 28px', fontFamily: 'Georgia, serif' },
  ctaBtn: {
    background: 'linear-gradient(180deg, #3A2A1C, #241710)', color: '#F6E8C4',
    border: 'none', padding: '15px 32px', borderRadius: '999px', fontSize: '16px',
    fontFamily: 'Georgia, serif', cursor: 'pointer', display: 'inline-block',
  },
  linkBtn: {
    background: 'transparent', color: '#5B4F3F', border: 'none', fontSize: '15px',
    fontFamily: 'Georgia, serif', cursor: 'pointer', textDecoration: 'underline',
    display: 'block', margin: '20px auto 0', padding: 0,
  },
}