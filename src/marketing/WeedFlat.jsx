import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function WeedFlat() {
  useSeo({
    title: 'When Everything Feels Flat: Boredom and the Empty Evening After Weed | Vow',
    description:
      'After quitting weed, a lot of people hit a grey flatness — nothing is fun, the evenings feel empty. Why this anhedonia happens, why it is temporary, and how to sit with the boredom.',
    canonical: 'https://vowapp.in/everything-feels-flat-after-weed',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting weed</p>
          <h1 style={styles.title}>When everything feels flat: boredom and the empty evening after weed.</h1>

          <p style={styles.lede}>
            A week or two into quitting weed, once the worst physical symptoms
            have passed, a quieter and stranger thing often sets in: a grey
            flatness. Nothing's exactly wrong, but nothing's fun either. The
            evenings feel empty and long. Food, music, shows, company — all of it
            slightly muted, like the colour's been turned down. This is one of
            the least-discussed parts of quitting, and one of the most likely to
            make you wonder whether it's even worth it. It is. And the flatness,
            like everything else, lifts.
          </p>

          <h2 style={styles.h2}>Why everything feels grey</h2>
          <p style={styles.body}>
            There are two things going on, and they compound each other. The
            first is chemical. Weed reliably triggered your brain's reward
            system — the little hit of pleasure and ease that came with using.
            Lean on that for long enough and the brain turns down its own
            baseline pleasure response to compensate. When you stop, you're left
            with that dialled-down baseline for a while, and ordinary things that
            should feel good register as flat. The clinical word is anhedonia —
            a reduced ability to feel pleasure — and it's a normal, temporary
            part of the brain recalibrating its reward chemistry.
          </p>
          <p style={styles.body}>
            The second is about habit, and it's just as real. Weed had quietly
            become the thing you <em>did</em> — the evening's main event, the
            reliable way to make ordinary time feel like something. Take it away
            and you're suddenly face to face with hours that the weed used to
            fill, and with how much of your enjoyment had been routed through it.
            The emptiness isn't only chemical. It's the discovery that you'd
            stopped building other ways to enjoy your own evenings, because you
            didn't need to.
          </p>

          <h2 style={styles.h2}>Why it's temporary — and worth waiting out</h2>
          <p style={styles.body}>
            The chemical half recovers on its own. As your brain's reward system
            returns to its natural setting — usually over a few weeks to a couple
            of months — ordinary pleasures start coming back, and many people
            describe the return almost with surprise: food tastes like something
            again, a song actually moves them, a walk is genuinely nice. The
            grey lifts. What you do in the meantime matters, though, because the
            flatness is the single most seductive argument for going back —
            <em> if nothing's fun anyway, why bother staying sober?</em> That
            thought feels reasonable and is almost entirely the anhedonia talking.
          </p>

          <h2 style={styles.h2}>Sitting with the boredom</h2>
          <p style={styles.body}>
            The trap is to wait passively for fun to return while doing nothing —
            because empty, unstructured evenings make the flatness louder and the
            craving stronger. The thing that actually helps is gently, almost
            mechanically, putting things back into the evening before they feel
            rewarding: the walk you don't especially want to take, the meal you
            cook properly, the call to a friend, the book, the small project.
            Early on, you do these <em>without</em> the reward — they'll feel a
            bit flat too, at first. But you're doing two things at once: giving
            the hours a shape, and slowly rebuilding the muscle of enjoying
            things directly, so that when your brain chemistry catches up,
            there's a life there ready to feel good again.
          </p>
          <p style={styles.body}>
            Boredom, it turns out, isn't the enemy here — it's just the
            uncomfortable gap between an old source of pleasure and the new ones
            you haven't built yet. Sit in it, fill it on purpose, and wait. The
            colour comes back.
          </p>

          <p style={styles.body}>
            The flatness often overlaps with the{' '}
            <Link to="/quitting-weed-cant-sleep" style={styles.inlineLink}>sleep trouble</Link>{' '}
            and{' '}
            <Link to="/vivid-dreams-after-quitting-weed" style={styles.inlineLink}>vivid dreams</Link>{' '}
            of the same period — exhaustion makes everything greyer. The{' '}
            <Link to="/quit-weed" style={styles.inlineLink}>guide to quitting weed calmly</Link>{' '}
            puts the whole arc together.
          </p>

          <div style={styles.ctaWrap}>
            <p style={styles.ctaText}>
              Vow is built for exactly this stretch — the slow rebuilding of a
              life that feels good on its own. Not a cure. A companion for the
              empty evenings until they fill again.
            </p>
            <Link to="/app" style={styles.ctaBtn}>See how Vow works →</Link>
          </div>

          <p style={styles.disclaimer}>
            This article is for general support and information, not medical
            advice. If low mood is severe or persistent, please talk to a doctor
            or mental health professional.
          </p>
        </div>
      </article>
    </MarketingLayout>
  )
}

const styles = {
  section: { padding: '80px 32px' },
  inner: { maxWidth: '720px', margin: '0 auto' },
  eyebrow: { fontSize: '12px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 16px' },
  title: { fontSize: 'clamp(30px, 4.5vw, 46px)', fontWeight: 400, color: '#2A1F15', lineHeight: 1.18, margin: '0 0 28px', fontFamily: 'Georgia, serif' },
  lede: { fontSize: '20px', color: '#3A2A1C', lineHeight: 1.6, margin: '0 0 24px', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  body: { fontSize: '18px', color: '#5B4F3F', lineHeight: 1.68, margin: '0 0 18px', fontFamily: 'Georgia, serif' },
  h2: { fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 400, color: '#2A1F15', lineHeight: 1.25, margin: '44px 0 16px', fontFamily: 'Georgia, serif' },
  inlineLink: { color: '#854F0B', textDecoration: 'underline' },
  ctaWrap: { marginTop: '48px', paddingTop: '32px', borderTop: '0.5px solid #E5D9C2', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' },
  ctaText: { fontSize: '18px', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0 },
  ctaBtn: { display: 'inline-block', textDecoration: 'none', padding: '14px 26px', background: 'linear-gradient(180deg, #3A2A1C, #241710)', color: '#F6E8C4', borderRadius: '12px', fontSize: '16px', fontFamily: 'Georgia, serif' },
  disclaimer: { fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginTop: '28px', lineHeight: 1.5 },
}