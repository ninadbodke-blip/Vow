import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function QuitWeedHub() {
  useSeo({
    title: 'Quitting Weed: A Calmer Way Through | Vow',
    description:
      'Weed is supposed to be the easy one to quit — which is exactly why the withdrawal blindsides people. An honest, non-clinical guide to what quitting cannabis actually feels like, and how to get through it.',
    canonical: 'https://vowapp.in/quit-weed',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting Weed</p>
          <h1 style={styles.title}>A calmer way through quitting weed.</h1>

          <p style={styles.lede}>
            Here's the thing nobody prepares you for: weed is supposed to be the
            easy one. Not addictive, no real withdrawal, just put it down. So
            when you stop and the sleep falls apart, the dreams turn strange and
            vivid, your appetite vanishes and your mood goes sideways, the worst
            part isn't the symptoms — it's the confusion. <em>This isn't meant to
            be happening.</em> It is happening, it's real, and understanding why
            is the first step to getting through it without reaching for the one
            thing that would make it stop.
          </p>

          <p style={styles.body}>
            For people who use cannabis occasionally, stopping really is simple.
            But for daily, long-term users — especially of today's high-THC
            flower, concentrates, and edibles — the body adapts, and when the
            cannabis stops arriving, it pushes back. That pushback is cannabis
            withdrawal, and despite the cultural story that it doesn't exist, it
            is well-documented and genuinely uncomfortable. It's rarely
            dangerous, which matters — but it's real, and being told it's "all in
            your head" when you're sweating through your sheets at 3am is its own
            small cruelty. So let's be honest about it instead.
          </p>

          <h2 style={styles.h2}>What quitting weed actually involves</h2>
          <p style={styles.body}>
            Weed is rarely just a substance. It's the wind-down after work, the
            thing that makes the evening soft, the reliable off-switch for a busy
            mind, the ritual that bookends the day. Quitting isn't only about the
            chemical leaving your system — it's about facing the evening, the
            boredom, the racing thoughts, the act of falling asleep, all without
            the tool you'd been using to manage them. That's why willpower alone
            so often isn't the whole answer. You're not just resisting a craving;
            you're relearning how to do the ordinary things weed had quietly
            taken over.
          </p>

          <h2 style={styles.h2}>The shape of the early weeks</h2>
          <p style={styles.body}>
            Everyone's different, depending on how much and how long you used,
            but there's a familiar arc. The first few days often bring the
            sharpest stretch — irritability, anxiety, a low mood, headaches,
            cold sweats, and an appetite that disappears entirely. Then, often
            around the time you'd expect things to be easing, the sleep gets
            strange: difficulty falling asleep, and the famously vivid,
            sometimes unpleasant dreams that arrive as your brain's dreaming
            sleep rebounds from years of suppression. These can last a few weeks
            before tapering. None of it is permanent, and none of it means
            something is wrong with you. It's a system recalibrating, loudly, and
            then quieting down.
          </p>

          <h2 style={styles.h2}>Reading, for the parts nobody warns you about</h2>
          <p style={styles.body}>
            We write honest, specific pieces about the moments that actually trip
            people up. Start here:
          </p>

          <div style={styles.linkList}>
            <Link to="/vivid-dreams-after-quitting-weed" style={styles.linkCard}>
              <span style={styles.linkTitle}>Why you get vivid dreams after quitting weed →</span>
              <span style={styles.linkSub}>The strangest, most-Googled symptom — and the oddly reassuring reason behind it.</span>
            </Link>
            <Link to="/quitting-weed-cant-sleep" style={styles.linkCard}>
              <span style={styles.linkTitle}>Quitting weed and can't sleep →</span>
              <span style={styles.linkSub}>The insomnia that derails more quits than anything else, and how to get through the nights.</span>
            </Link>
            <Link to="/everything-feels-flat-after-weed" style={styles.linkCard}>
              <span style={styles.linkTitle}>When everything feels flat after weed →</span>
              <span style={styles.linkSub}>The boredom and greyness nobody mentions — why the evenings feel empty, and that it lifts.</span>
            </Link>
          </div>

          <h2 style={styles.h2}>A note on how we talk about this</h2>
          <p style={styles.body}>
            Vow is not a treatment, a clinic, or a cure, and nothing here is
            medical advice. Cannabis withdrawal is rarely dangerous, but if your
            symptoms are severe, or if you're struggling with your mental health,
            please talk to a doctor — there's no weakness in it. What Vow offers
            is quieter and more daily: a structured, gentle companion for the
            long work of staying with a decision you've already made — built on
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