import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function About() {
  useSeo({
    title: 'About Vow — Recovery Built on Evidence, Not Streaks | Vow',
    description:
      'Vow is a recovery companion built on decades of behaviour-change science, designed to be honest, non-punitive, and human. Why it exists, who built it, and what makes it different.',
    canonical: 'https://vowapp.in/about',
    type: 'website',
  })

  return (
    <MarketingLayout>
      <section style={styles.hero}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>About</p>
          <h1 style={styles.title}>Recovery deserves better software.</h1>
          <p style={styles.lede}>
            Most recovery and habit apps do the same two things: they reward a
            streak, and they punish a slip. Vow was built on the conviction that
            both are wrong — that real recovery is not a streak to protect or a
            failure to be shamed, but a long, non-linear, deeply human process
            that good software should meet with patience instead of points.
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrowSecond}>What Vow is</p>
          <p style={styles.body}>
            Vow is a recovery companion for people working to leave a
            substance behind — alcohol, nicotine, cannabis, and others. It is
            built around the Transtheoretical Model of behaviour change, a
            framework with decades of clinical evidence behind it, which
            recognises that change moves through stages: not being ready, getting
            ready, acting, and the long work of staying. Almost no app takes that
            science seriously. Vow is built on it from the ground up.
          </p>
          <p style={styles.body}>
            That means Vow meets you wherever you actually are. Not ready to
            quit? There's real work for that — the upstream work of noticing and
            understanding before deciding. Mid-attempt? There's a structured,
            day-by-day path. Slipped? There's a stage built for exactly that
            moment, with no shame and no reset to zero. The whole design rejects
            the idea that recovery is a clean line, because for almost everyone,
            it isn't.
          </p>

          <p style={styles.eyebrowSecond}>What makes it different</p>
          <p style={styles.body}>
            Three things. First, it is <strong>non-punitive by design</strong> —
            a slip moves you toward support, never back to zero, because shame is
            one of the most reliable engines of relapse there is, and an app that
            shames you is an app working against you. Second, it is
            <strong> honest</strong> — the writing throughout speaks plainly about
            what the hard parts actually feel like, rather than offering the thin
            reassurance most recovery content settles for. And third, it is
            <strong> private and calm</strong> — no ads, no data selling, no
            engagement tricks, no noise. Just a quiet, steady place to do hard
            work.
          </p>
          <p style={styles.body}>
            And it is built to remove every excuse not to use it. The core of Vow
            is free, forever. The deeper guided journey is a one-time payment, not
            a subscription — because no one should wonder, during a hard week,
            whether they can afford the thing helping them stay alive to it.
          </p>

          <p style={styles.eyebrowSecond}>The founder</p>
          <p style={styles.body}>
            Vow was built by Ninad Bodke — solo, deliberately, and from lived
            understanding of how hard this work is and how badly the existing
            tools serve it. Vow exists because the recovery software that should
            have existed didn't: something serious about the science, honest
            about the difficulty, and gentle with the person doing the work.
          </p>
          {/* PLACEHOLDER: Ninad — add your personal founder note here. Whatever
              you're comfortable sharing publicly: why you built this, what it
              came out of, what running has to do with quitting. Keep or cut the
              line above as you prefer. This is your story to tell in your words. */}
          <p style={styles.bodyMuted}>
            A fuller founder note is on its way — the why behind Vow, in Ninad's
            own words.
          </p>

          <p style={styles.eyebrowSecond}>Vow Labs</p>
          <p style={styles.body}>
            Vow is the first product of Vow Labs, a small independent studio
            based in Mumbai, India, and Udyam-registered. We build software for
            the hardest, most private work people do. We're not venture-funded,
            not chasing scale for its own sake, and not interested in turning
            recovery into a subscription. We're interested in building something
            that genuinely helps — and in doing it carefully.
          </p>
        </div>
      </section>
    </MarketingLayout>
  )
}

const styles = {
  hero: { padding: '80px 32px 32px' },
  section: { padding: '32px 32px 80px' },
  inner: { maxWidth: '720px', margin: '0 auto' },
  eyebrow: { fontSize: '12px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 16px' },
  eyebrowSecond: { fontSize: '12px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '44px 0 16px' },
  title: { fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400, color: '#2A1F15', lineHeight: 1.15, margin: '0 0 24px', fontFamily: 'Georgia, serif' },
  lede: { fontSize: '20px', color: '#3A2A1C', lineHeight: 1.6, margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  body: { fontSize: '18px', color: '#5B4F3F', lineHeight: 1.68, margin: '0 0 18px', fontFamily: 'Georgia, serif' },
  bodyMuted: { fontSize: '16px', color: '#9C8C78', lineHeight: 1.6, margin: '0 0 18px', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
}