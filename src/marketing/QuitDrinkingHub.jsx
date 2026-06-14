import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function QuitDrinkingHub() {
  useSeo({
    title: 'Quitting Drinking: A Calmer Way Through | Vow',
    description:
      'Quitting alcohol is less about the drink and more about the mind. An honest, non-clinical guide to what getting sober actually feels like in the early days — and how to move through it without shame.',
    canonical: 'https://vowapp.in/quit-drinking',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting Drinking</p>
          <h1 style={styles.title}>A calmer way through quitting drinking.</h1>

          <p style={styles.lede}>
            Most people expect quitting alcohol to be a battle with a bottle.
            What surprises them is that the bottle is the easy part. The harder
            part is the head — the bargaining, the hangxiety, the small voice
            that insists today doesn't count and you'll start properly tomorrow.
            This is a guide to that part: what getting sober actually feels like
            from the inside, and how to move through the early days without
            treating yourself like a case to be managed.
          </p>

          <div style={styles.safety}>
            <p style={styles.safetyText}>
              <strong>One important thing first.</strong> If you drink heavily
              every day, stopping suddenly can be genuinely dangerous — alcohol
              withdrawal at the dependent end can cause seizures and needs
              medical supervision. This is not fearmongering; it's simply true.
              Please talk to a doctor before quitting cold if you're a daily,
              heavy drinker. There is no weakness in a supervised, safe start.
              Vow is a companion for the long daily work of staying sober, not a
              substitute for medical care during detox.
            </p>
          </div>

          <p style={styles.body}>
            With that said: for a great many people, alcohol has woven itself
            into the ordinary architecture of a life — the drink that ends the
            workday, the bottle of wine that's really three, the way "just one"
            stopped being one a long time ago. Quitting isn't only chemical.
            It's the unpicking of a hundred small rituals that used to have a
            drink in them, and the slow discovery that the evening, the party,
            the hard day, the celebration, can all be met without one. That's
            why willpower alone so often fails — you're not resisting a craving,
            you're rebuilding the shape of your days.
          </p>

          <h2 style={styles.h2}>The shape of the early weeks</h2>
          <p style={styles.body}>
            Nobody can map your sobriety exactly, because it depends on how much,
            how long, and what the drinking was doing for you. But there's a
            shape many people recognise. The first days can be physically rough
            if your body is used to daily alcohol — disrupted sleep, sweating,
            a racing mind, a low and anxious mood. (If those symptoms are severe
            — shaking, confusion, anything frightening — that's the medical line
            above, not something to push through alone.) For most moderate
            drinkers, the body settles within a week or so, and the work quietly
            shifts from the physical to the mental.
          </p>
          <p style={styles.body}>
            And the mental part is the real terrain. The "mind games," as people
            who've done it call them — the relentless internal negotiation, the
            way your own head becomes the thing arguing for a drink. The
            hangxiety that gets worse before it gets better. The strange grief
            of giving up something that felt, however falsely, like a friend.
            None of this means you're failing. It means you're in the actual
            work of it, which is less a single act of stopping and more a long
            series of ordinary evenings met a new way.
          </p>

          <h2 style={styles.h2}>Reading, for the parts nobody warns you about</h2>
          <p style={styles.body}>
            We write honest, specific pieces about the moments that actually trip
            people up — the ones the clinical guides skip. Start here:
          </p>

          <div style={styles.linkList}>
            <Link to="/first-week-without-alcohol" style={styles.linkCard}>
              <span style={styles.linkTitle}>What the first week without alcohol actually feels like →</span>
              <span style={styles.linkSub}>Less about withdrawal, more about the mind games nobody warns you about.</span>
            </Link>
            <Link to="/hangxiety" style={styles.linkCard}>
              <span style={styles.linkTitle}>Hangxiety: why anxiety gets worse before it gets better →</span>
              <span style={styles.linkSub}>The dread that follows drinking, why early sobriety can amplify it, and why it passes.</span>
            </Link>
            <Link to="/day-one-again" style={styles.linkCard}>
              <span style={styles.linkTitle}>Day one, again: on starting over without shame →</span>
              <span style={styles.linkSub}>If you've reset the counter more times than you can count, this is for you.</span>
            </Link>
          </div>

          <h2 style={styles.h2}>A note on how we talk about this</h2>
          <p style={styles.body}>
            Vow is not a treatment, a clinic, or a cure, and nothing here is
            medical advice. For heavy dependence or frightening withdrawal, a
            doctor is the right first call, and a supervised detox can be the
            safest start. What Vow offers is quieter and more daily: a
            structured, gentle companion for the long work of staying with a
            decision you've already made — built on behaviour-change research,
            written like a human being, and designed never to shame you for a
            hard day or a reset.
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
  eyebrow: { fontSize: '12px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 16px' },
  title: { fontSize: 'clamp(34px, 5vw, 50px)', fontWeight: 400, color: '#2A1F15', lineHeight: 1.15, margin: '0 0 28px', fontFamily: 'Georgia, serif' },
  lede: { fontSize: '20px', color: '#3A2A1C', lineHeight: 1.6, margin: '0 0 24px', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  safety: { background: '#FBF1ED', border: '0.5px solid #E8B59B', borderRadius: '14px', padding: '18px 20px', margin: '0 0 24px' },
  safetyText: { fontSize: '15.5px', color: '#7A4A33', lineHeight: 1.6, margin: 0, fontFamily: 'Georgia, serif' },
  body: { fontSize: '18px', color: '#5B4F3F', lineHeight: 1.68, margin: '0 0 18px', fontFamily: 'Georgia, serif' },
  h2: { fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 400, color: '#2A1F15', lineHeight: 1.25, margin: '44px 0 16px', fontFamily: 'Georgia, serif' },
  linkList: { display: 'flex', flexDirection: 'column', gap: '12px', margin: '8px 0 8px' },
  linkCard: { display: 'block', textDecoration: 'none', padding: '18px 20px', background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: '14px' },
  linkTitle: { display: 'block', fontSize: '17px', color: '#854F0B', fontFamily: 'Georgia, serif', marginBottom: '5px' },
  linkSub: { display: 'block', fontSize: '15px', color: '#6B5C4A', fontFamily: 'Georgia, serif', lineHeight: 1.5 },
  ctaWrap: { marginTop: '48px', paddingTop: '32px', borderTop: '0.5px solid #E5D9C2', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' },
  ctaText: { fontSize: '18px', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0 },
  ctaBtn: { display: 'inline-block', textDecoration: 'none', padding: '14px 26px', background: 'linear-gradient(180deg, #3A2A1C, #241710)', color: '#F6E8C4', borderRadius: '12px', fontSize: '16px', fontFamily: 'Georgia, serif' },
}