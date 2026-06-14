import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function QuitNicotineHub() {
  useSeo({
    title: 'Quitting Nicotine: A Calmer Way Through | Vow',
    description:
      'Quitting smoking or vaping is hard in ways nobody quite warns you about. An honest, non-clinical guide to what the early days actually feel like — and how to get through them one at a time.',
    canonical: 'https://vowapp.in/quit-nicotine',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting Nicotine</p>
          <h1 style={styles.title}>A calmer way through quitting nicotine.</h1>

          <p style={styles.lede}>
            Most guides about quitting smoking or vaping read like a pamphlet in
            a waiting room. Drink water. Chew gum. Hold a pencil. All true, all
            useless at 11pm when the craving is loud and your hands won't settle.
            This is a different kind of guide — about what quitting nicotine
            actually feels like from the inside, and how to move through it
            without treating yourself like a problem to be fixed.
          </p>

          <p style={styles.body}>
            Nicotine is one of the most habit-forming substances people live
            with, partly because it threads itself into the smallest seams of a
            day: the first cigarette with coffee, the vape between meetings, the
            one on the balcony when everything gets to be too much. Quitting
            isn't only about the chemical. It's about a hundred tiny moments that
            used to have a cigarette in them, and now don't. That's why willpower
            alone so often isn't enough — you're not fighting a craving, you're
            rebuilding a day.
          </p>

          <p style={styles.body}>
            The good news, and it is genuinely good news, is that the body is
            remarkably quick to begin recovering once nicotine stops arriving.
            The hardest stretch is usually short and front-loaded — measured in
            days, not months. What lingers longer is the habit: the reach, the
            ritual, the reflex. And habits, unlike chemistry, respond to
            patience and to having something else to do with the moment. That is
            the whole premise of getting through this calmly rather than
            white-knuckling it.
          </p>

          <h2 style={styles.h2}>The shape of the first weeks</h2>
          <p style={styles.body}>
            Nobody can tell you exactly how your quit will go, because it depends
            on how much, how long, and what nicotine was doing for you. But there
            is a rough shape most people recognise. The first few days are the
            steepest — the body is loudly noticing the absence, and everything
            feels turned up: irritability, restlessness, a foggy head, sleep that
            won't quite land. Somewhere around the third day, many people hit the
            sharpest point, the moment where quitting feels least possible. If you
            know that peak is coming, it loses some of its power. It is not a sign
            you're failing. It is, almost always, the worst of it announcing that
            it's nearly over.
          </p>
          <p style={styles.body}>
            After that first week, the physical edge softens and the work
            quietly changes. The cravings that remain are less about chemistry
            and more about cue — the specific places, people, and feelings your
            brain learned to pair with smoking. This is the part the pamphlets
            skip, and it's the part Vow was built for: not the first 72 hours,
            but the long, ordinary stretch after, where staying quit means
            slowly teaching a thousand moments a new ending.
          </p>

          <h2 style={styles.h2}>Reading, for the parts nobody warns you about</h2>
          <p style={styles.body}>
            We're writing a series of honest, specific pieces about the moments
            that actually trip people up — the ones the clinical guides gloss
            over. Start with these:
          </p>

          <div style={styles.linkList}>
            <Link to="/quit-vaping-day-3" style={styles.linkCard}>
              <span style={styles.linkTitle}>Why day 3 of quitting vaping is the hardest →</span>
              <span style={styles.linkSub}>What's happening on the day it feels least possible — and why it means you're close.</span>
            </Link>
            <Link to="/what-to-do-with-your-hands-quit-smoking" style={styles.linkCard}>
              <span style={styles.linkTitle}>What to do with your hands when you quit smoking →</span>
              <span style={styles.linkSub}>The restlessness nobody mentions, and what actually helps the reach.</span>
            </Link>
            <Link to="/first-cigarette-free-morning" style={styles.linkCard}>
              <span style={styles.linkTitle}>The first cigarette-free morning →</span>
              <span style={styles.linkSub}>Mornings are built around the first one. Here's how to meet the new one.</span>
            </Link>
          </div>

          <h2 style={styles.h2}>A note on how we talk about this</h2>
          <p style={styles.body}>
            Vow is not a treatment, a clinic, or a cure, and nothing here is
            medical advice. If you're dealing with heavy dependence or
            withdrawal that frightens you, a doctor is the right first call, and
            there is no weakness in making it. What Vow offers is something
            quieter and more daily: a structured, gentle companion for the long
            work of staying with a decision you've already made — built on
            behaviour-change research, written like a human being, and designed
            never to shame you for a hard day.
          </p>

          <div style={styles.ctaWrap}>
            <p style={styles.ctaText}>
              If you want a calmer way to walk through it, day by day:
            </p>
            <Link to="/app" style={styles.ctaBtn}>See how Vow works →</Link>
          </div>
        </div>
      </article>
    </MarketingLayout>
  )
}

const styles = {
  section: { padding: '80px 32px' },
  inner: { maxWidth: '720px', margin: '0 auto' },
  eyebrow: {
    fontSize: '12px', color: '#A07A3C', textTransform: 'uppercase',
    letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 16px',
  },
  title: {
    fontSize: 'clamp(34px, 5vw, 50px)', fontWeight: 400, color: '#2A1F15',
    lineHeight: 1.15, margin: '0 0 28px', fontFamily: 'Georgia, serif',
  },
  lede: {
    fontSize: '20px', color: '#3A2A1C', lineHeight: 1.6, margin: '0 0 24px',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
  },
  body: {
    fontSize: '18px', color: '#5B4F3F', lineHeight: 1.68, margin: '0 0 18px', fontFamily: 'Georgia, serif',
  },
  h2: {
    fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 400, color: '#2A1F15',
    lineHeight: 1.25, margin: '44px 0 16px', fontFamily: 'Georgia, serif',
  },
  linkList: { display: 'flex', flexDirection: 'column', gap: '12px', margin: '8px 0 8px' },
  linkCard: {
    display: 'block', textDecoration: 'none', padding: '18px 20px',
    background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: '14px',
  },
  linkTitle: { display: 'block', fontSize: '17px', color: '#854F0B', fontFamily: 'Georgia, serif', marginBottom: '5px' },
  linkSub: { display: 'block', fontSize: '15px', color: '#6B5C4A', fontFamily: 'Georgia, serif', lineHeight: 1.5 },
  ctaWrap: {
    marginTop: '48px', paddingTop: '32px', borderTop: '0.5px solid #E5D9C2',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px',
  },
  ctaText: { fontSize: '18px', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0 },
  ctaBtn: {
    display: 'inline-block', textDecoration: 'none', padding: '14px 26px',
    background: 'linear-gradient(180deg, #3A2A1C, #241710)', color: '#F6E8C4',
    borderRadius: '12px', fontSize: '16px', fontFamily: 'Georgia, serif',
  },
}