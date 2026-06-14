import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function QuitMdmaHub() {
  useSeo({
    title: 'Quitting MDMA: A Calmer Way Through | Vow',
    description:
      'MDMA leaves no classic withdrawal, but the comedown, the midweek blues, and the slow flattening of mood are real. An honest, non-clinical guide to quitting ecstasy and letting your brain recover.',
    canonical: 'https://vowapp.in/quit-mdma',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting MDMA</p>
          <h1 style={styles.title}>A calmer way through quitting MDMA.</h1>

          <p style={styles.lede}>
            MDMA is the drug that gives you the best night and then quietly takes
            it back. There's no shaking, sweating withdrawal the way there is with
            some substances — which is exactly why people underestimate it. What
            it has instead is the comedown: the flat, grey, anxious days that
            follow, the famous midweek crash, and, with heavy use, a slow dimming
            of the very feelings it once amplified. This is a guide to that
            quieter cost, and to letting your brain find its way back.
          </p>

          <p style={styles.body}>
            Here's the mechanism in plain terms. MDMA works by flooding your
            brain with serotonin and other mood chemicals all at once — that's
            the euphoria, the warmth, the sense that everything and everyone is
            wonderful. But the brain only has so much to give, and after the flood
            comes the drought: for a few days your serotonin runs low, and you
            feel the absence as low mood, anxiety, emptiness, and exhaustion. Do
            it often enough and the drought stops fully lifting between uses. The
            comedown isn't a side effect that happens to some people. It's the
            other half of how the drug works.
          </p>

          <h2 style={styles.h2}>What quitting MDMA actually involves</h2>
          <p style={styles.body}>
            For most people, MDMA isn't a daily habit — it's tied to specific
            places and moods: the festival, the club, the particular friends, the
            need to feel open and connected and free. So quitting is often less
            about a physical craving and more about those associations, and about
            the discovery that the easy euphoria and connection MDMA delivered
            now have to be found, or rebuilt, without it. The hard part isn't
            usually a withdrawal symptom. It's the gap where the chemical
            shortcut to joy used to be — and the patience to let real joy return
            at its own slower pace.
          </p>

          <h2 style={styles.h2}>The shape of it</h2>
          <p style={styles.body}>
            After use, the comedown crash typically lasts one to three days —
            fatigue, low and anxious mood, poor sleep, the sense that the colour
            has drained out of things. For occasional users, that lifts and life
            returns to normal. For frequent users, the picture is longer: a
            week or two of emotional sensitivity, lethargy, and lingering low
            mood, with the serotonin system generally settling back toward normal
            over roughly three to four weeks of not using. The encouraging truth,
            borne out in the research, is that mood and wellbeing tend to
            <em> improve</em> after people stop — the brain is remarkably good at
            recovering, given time and a break.
          </p>

          <h2 style={styles.h2}>Reading, for the parts nobody warns you about</h2>
          <p style={styles.body}>
            We write honest, specific pieces about the moments that actually trip
            people up. Start here:
          </p>

          <div style={styles.linkList}>
            <Link to="/mdma-midweek-blues" style={styles.linkCard}>
              <span style={styles.linkTitle}>The midweek blues: why Tuesday feels so dark →</span>
              <span style={styles.linkSub}>The crash that hits days after a weekend on MDMA — why it happens, and that it passes.</span>
            </Link>
            <Link to="/how-to-get-through-mdma-comedown" style={styles.linkCard}>
              <span style={styles.linkTitle}>How to get through an MDMA comedown →</span>
              <span style={styles.linkSub}>The flat, anxious days after — and how to ride them out without reaching for more.</span>
            </Link>
            <Link to="/does-brain-recover-after-mdma" style={styles.linkCard}>
              <span style={styles.linkTitle}>Does your brain recover after quitting MDMA? →</span>
              <span style={styles.linkSub}>The question everyone asks at 3am. An honest look at what heals, and how long it takes.</span>
            </Link>
          </div>

          <h2 style={styles.h2}>A note on how we talk about this</h2>
          <p style={styles.body}>
            Vow is not a treatment, a clinic, or a cure, and nothing here is
            medical advice. MDMA's most serious dangers are acute — overheating,
            drinking too much water, and dangerous interactions with
            antidepressants and other drugs — and the comedown low mood can,
            occasionally, get dark enough that it matters: if you're struggling
            badly, or having thoughts of harming yourself, please reach out to a
            doctor or a crisis line, the kind listed at the foot of this page.
            What Vow offers is quieter and more daily: a structured, gentle
            companion for the long work of staying with a decision you've already
            made — written like a human being, and designed never to shame you
            for a hard day.
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