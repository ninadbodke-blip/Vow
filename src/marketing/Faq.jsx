import MarketingLayout from './MarketingLayout'

const QUESTIONS = [
  {
    q: 'Is Vow medical treatment?',
    a: "No. Vow is a recovery support tool, not medical or clinical care. If you're in crisis or need clinical help, please reach out to a doctor or one of the helplines in our footer. Vow is designed to walk alongside professional care, not replace it.",
  },
  {
    q: 'What data does Vow collect, and how private is it?',
    a: "Your recovery data — your stage, journal entries, check-ins, anchors, addiction type — lives in our database (Supabase) and is tied to your account. We don't share it with anyone, we don't sell it, and we don't run ads. The full data practices are in our Privacy Policy.",
  },
  {
    q: 'Will my anchors see my journal or my data?',
    a: "No. Your anchors are people you choose to support you, and they only see what you choose to share with them. They can send you reactions through a private link; they never see your journal, your slips, or your full progress.",
  },
  {
    q: 'What happens if I slip or relapse?',
    a: "You go to Reclaim, the stage built for exactly this moment. No shame, no starting over from zero. Just an honest look at what happened and a softer way home. Three slips during Endure or Build move you to Reclaim automatically.",
  },
  {
    q: "What if I'm not ready to quit yet?",
    a: "Then Notice and Reflect are for you. Recovery doesn't start with quitting — it starts with seeing. Vow's first two stages are built for the long upstream work of understanding before deciding.",
  },
  {
    q: 'Is Vow available on iOS?',
    a: "Vow is a Progressive Web App, which means you can install it on iOS by visiting vowapp.in in Safari and tapping Share → Add to Home Screen. A dedicated Play Store listing for Android is rolling out. A native iOS App Store listing is on the roadmap.",
  },
  {
    q: 'How does the twenty percent rural commitment work?',
    a: "Twenty percent of Vow Labs' net margin (after costs) is allocated to rural addiction recovery programs in India. We'll report annually on what was contributed and where. This is built into the company, not an add-on.",
  },
  {
    q: 'Can I delete my data?',
    a: "Yes. You can delete your account and all associated data from the Profile screen in the app. Once deleted, your data is gone from our systems within the timeframe described in our Privacy Policy.",
  },
  {
    q: 'Who built Vow?',
    a: "Vow Labs is a small independent studio in India, founded by Ninad Bodke. More on the About page.",
  },
]

export default function Faq() {
  return (
    <MarketingLayout>
      <section style={styles.heroSection}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Frequently asked</p>
          <h1 style={styles.title}>Honest answers.</h1>
          <p style={styles.lede}>
            The things people actually ask about a recovery app. If yours
            isn't here, write to us — the answer might end up on this page.
          </p>
        </div>
      </section>

      <section style={styles.qaSection}>
        <div style={styles.inner}>
          {QUESTIONS.map((item) => (
            <div key={item.q} style={styles.qaItem}>
              <h3 style={styles.qaQ}>{item.q}</h3>
              <p style={styles.qaA}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  )
}

const styles = {
  heroSection: {
    padding: '80px 32px 40px',
  },
  qaSection: {
    padding: '20px 32px 80px',
  },
  inner: {
    maxWidth: '760px',
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
    margin: 0,
    maxWidth: '620px',
    fontFamily: 'Georgia, serif',
  },
  qaItem: {
    padding: '28px 0',
    borderBottom: '0.5px solid #E8DCC2',
  },
  qaQ: {
    fontSize: '19px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: '0 0 10px',
    fontFamily: 'Georgia, serif',
  },
  qaA: {
    fontSize: '16.5px',
    color: '#5B4F3F',
    lineHeight: 1.65,
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
}
