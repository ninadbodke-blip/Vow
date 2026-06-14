import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function MdmaComedown() {
  useSeo({
    title: 'How to Get Through an MDMA Comedown | Vow',
    description:
      'The MDMA comedown brings fatigue, low mood, anxiety and poor sleep for a few days after use. What actually helps you ride it out, what to avoid, and why not to chase it away with more.',
    canonical: 'https://vowapp.in/how-to-get-through-mdma-comedown',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting MDMA</p>
          <h1 style={styles.title}>How to get through an MDMA comedown.</h1>

          <p style={styles.lede}>
            The comedown is the price MDMA charges after the fact: the flat,
            anxious, exhausted, low-feeling days that follow even a single night.
            It can range from a mild grey fog to a genuinely rough stretch of
            depression and dread. There's no switch to turn it off — your brain
            simply needs time to restock what the drug spent — but there's a lot
            you can do to make it gentler, and one big thing you shouldn't do.
          </p>

          <h2 style={styles.h2}>What's actually happening</h2>
          <p style={styles.body}>
            MDMA gives you its euphoria by emptying your brain's reserves of
            serotonin and other mood chemicals all at once. The comedown is the
            aftermath of that spending: your brain is left depleted and needs
            several days to rebuild its supply, and while it does, you feel the
            shortage as low mood, anxiety, irritability, fatigue, and disrupted
            sleep. It's not a sign of weakness or that something has gone wrong.
            It's the predictable second half of how the drug works, and for most
            people the worst of it lasts one to three days.
          </p>

          <h2 style={styles.h2}>What actually helps</h2>
          <p style={styles.body}>
            The comedown responds to the basics, done deliberately. <strong>Rest
            and sleep</strong> come first — your brain rebuilds mood chemistry
            largely while you sleep, and MDMA disrupts sleep badly, so the first
            day or two is genuinely a time to do very little and let your body
            recover. <strong>Eat and hydrate sensibly</strong> — gentle,
            nourishing food even if you feel nauseous or have no appetite, and
            normal amounts of water (you no longer need to sip constantly the way
            you should while actually on MDMA). A depleted, dehydrated, hungry
            body feels the low far harder.
          </p>
          <p style={styles.body}>
            Beyond that: <strong>gentle daylight and a little movement</strong> —
            a slow walk outside does more for mood chemistry than it feels like
            it will. <strong>Lower the stakes</strong> for a couple of days —
            don't schedule anything demanding or emotionally fraught while you're
            in the dip, because the comedown makes ordinary stress feel huge and
            small problems feel like catastrophes. And <strong>be skeptical of
            your own thoughts</strong> while you're down. The bleakness, the
            certainty that things are hopeless, the harsh self-judgement — these
            are symptoms of a depleted brain, not insights. Let them pass without
            acting on them.
          </p>

          <h2 style={styles.h2}>The one thing not to do</h2>
          <p style={styles.body}>
            Don't chase the comedown away with more MDMA, or with other drugs or
            alcohol. It is the most understandable impulse in the world — you
            feel awful, and you know exactly what would make you feel good again —
            but it's also the precise mechanism by which casual use becomes a
            habit and then a problem. Using to escape a comedown deepens the next
            one, builds tolerance, and trains your brain to need the drug to feel
            normal. Every comedown you ride out without a fix is proof to yourself
            that it ends on its own. It always does.
          </p>

          <h2 style={styles.h2}>If the comedowns are getting worse</h2>
          <p style={styles.body}>
            If you're noticing the comedowns getting heavier, lasting longer, or
            bleeding into a flatness that doesn't fully lift between uses, that's
            your brain telling you it needs a longer break — and the good news is
            it recovers well when given one. Our piece on{' '}
            <Link to="/mdma-midweek-blues" style={styles.inlineLink}>the midweek blues</Link>{' '}
            explains the delayed-crash rhythm, and{' '}
            <Link to="/does-brain-recover-after-mdma" style={styles.inlineLink}>does your brain recover after MDMA</Link>{' '}
            answers the question most people are quietly asking. The fuller arc is
            in our{' '}
            <Link to="/quit-mdma" style={styles.inlineLink}>guide to quitting MDMA calmly</Link>.
          </p>

          <div style={styles.ctaWrap}>
            <p style={styles.ctaText}>
              Vow is a calm, daily companion for the long work of cutting back or
              quitting — not a treatment, just something steady to walk with
              through the flat days.
            </p>
            <Link to="/app" style={styles.ctaBtn}>See how Vow works →</Link>
          </div>

          <p style={styles.disclaimer}>
            This article is for general support and information, not medical
            advice. If the low mood is severe, or you have thoughts of harming
            yourself, please contact a doctor or a crisis line. MDMA's acute
            dangers (overheating, dangerous interactions with antidepressants)
            are medical emergencies.
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