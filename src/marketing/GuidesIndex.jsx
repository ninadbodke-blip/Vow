import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

const GUIDES = [
  {
    to: '/quit-nicotine',
    title: 'Quitting nicotine',
    blurb: 'Smoking and vaping. The reach, the restlessness, the first cigarette-free mornings, and why day three is the hardest.',
  },
  {
    to: '/quit-drinking',
    title: 'Quitting drinking',
    blurb: 'Alcohol. The mind games of the first week, hangxiety, and how to start over without shame when the counter resets.',
  },
  {
    to: '/quit-weed',
    title: 'Quitting weed',
    blurb: "Cannabis. The withdrawal nobody warns you about — vivid dreams, the insomnia, and the flatness that lifts.",
  },
  {
    to: '/quit-mdma',
    title: 'Quitting MDMA',
    blurb: 'Ecstasy. The midweek blues, getting through the comedown, and the honest truth about whether your brain recovers.',
  },
]

export default function GuidesIndex() {
  useSeo({
    title: 'Recovery Guides: Honest Writing for the Hard Parts | Vow',
    description:
      'Honest, non-clinical guides to quitting — nicotine, alcohol, weed, MDMA. Written for the moments the medical pages skip: the cravings, the comedowns, the mind games, and the slow way through.',
    canonical: 'https://vowapp.in/guides',
    type: 'website',
  })

  return (
    <MarketingLayout>
      <section style={styles.heroSection}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Guides</p>
          <h1 style={styles.title}>Honest writing for the hard parts.</h1>
          <p style={styles.lede}>
            Most guides about quitting read like a pamphlet in a waiting room.
            These don't. They're about what quitting actually feels like from the
            inside — the cravings, the comedowns, the mind games, the long
            ordinary stretch nobody prepares you for — and how to move through it
            calmly, without treating yourself like a problem to be fixed.
          </p>
        </div>
      </section>

      <section style={styles.gridSection}>
        <div style={styles.grid}>
          {GUIDES.map((g) => (
            <Link key={g.to} to={g.to} style={styles.card}>
              <h2 style={styles.cardTitle}>{g.title} →</h2>
              <p style={styles.cardBlurb}>{g.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section style={styles.noteSection}>
        <div style={styles.inner}>
          <p style={styles.note}>
            None of these are medical advice, and Vow is not a treatment or a
            cure. For dependence that's dangerous to stop suddenly — heavy daily
            drinking, and some other substances — please start with a doctor.
            What we offer is the quieter, daily companionship of the long work
            after the decision is made.
          </p>
        </div>
      </section>
    </MarketingLayout>
  )
}

const styles = {
  heroSection: { padding: '80px 32px 32px', textAlign: 'center' },
  inner: { maxWidth: '720px', margin: '0 auto' },
  eyebrow: { fontSize: '12px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 16px' },
  title: { fontSize: 'clamp(34px, 5vw, 50px)', fontWeight: 400, color: '#2A1F15', lineHeight: 1.15, margin: '0 0 24px', fontFamily: 'Georgia, serif' },
  lede: { fontSize: '18px', color: '#5B4F3F', lineHeight: 1.65, margin: '0 auto', maxWidth: '620px', fontFamily: 'Georgia, serif' },
  gridSection: { padding: '24px 32px 40px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '900px', margin: '0 auto' },
  card: { display: 'block', textDecoration: 'none', background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: '18px', padding: '28px 26px' },
  cardTitle: { fontSize: '22px', fontWeight: 400, color: '#854F0B', margin: '0 0 10px', fontFamily: 'Georgia, serif' },
  cardBlurb: { fontSize: '16px', color: '#5B4F3F', lineHeight: 1.6, margin: 0, fontFamily: 'Georgia, serif' },
  noteSection: { padding: '24px 32px 80px' },
  note: { fontSize: '15px', color: '#9C8C78', lineHeight: 1.6, margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' },
}