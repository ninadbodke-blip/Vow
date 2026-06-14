import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function Hangxiety() {
  useSeo({
    title: 'Hangxiety: Why Anxiety Gets Worse Before It Gets Better | Vow',
    description:
      'Hangxiety — the dread and anxiety that follow drinking — can get worse in early sobriety before it improves. Why it happens, why it is temporary, and how to sit with it.',
    canonical: 'https://vowapp.in/hangxiety',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting drinking</p>
          <h1 style={styles.title}>Hangxiety: why anxiety gets worse before it gets better.</h1>

          <p style={styles.lede}>
            If you've ever woken after drinking with a nameless dread — a
            tight-chested certainty that something is wrong, that you said the
            wrong thing, that everything is somehow worse — you've met hangxiety.
            And if you've recently stopped drinking and found the anxiety got
            <em> louder</em> for a while rather than quieter, you're not doing it
            wrong. There's a reason, and it's worth understanding, because the
            understanding is what gets you through it.
          </p>

          <h2 style={styles.h2}>What hangxiety actually is</h2>
          <p style={styles.body}>
            Alcohol calms you in the moment by nudging your brain's chemistry
            toward sedation. But the brain is a balancing machine: when alcohol
            pushes one way, it pushes back the other way to compensate. As the
            alcohol wears off, that compensation is left exposed — the brain is
            now tilted toward over-arousal, and you feel it as anxiety, dread,
            a racing heart, a sense of impending wrongness. That's hangxiety. It
            isn't a moral verdict on last night. It's a chemical rebound, as
            mechanical as a spring snapping back.
          </p>
          <p style={styles.body}>
            Here's the cruel irony that traps so many people: the most reliable
            short-term cure for hangxiety is more alcohol — which is exactly how
            the cycle tightens. Each drink quiets today's dread and deepens
            tomorrow's. So the anxiety that feels like a reason to drink is, in
            fact, largely <em>caused</em> by the drinking. Naming that is the
            first crack of light.
          </p>

          <h2 style={styles.h2}>Why it can get worse before it gets better</h2>
          <p style={styles.body}>
            When you stop drinking, you'd expect the anxiety to lift immediately.
            For some it does. But for many, the first stretch of sobriety brings
            <em> more</em> anxiety, not less — and this is the point where people
            lose heart and conclude sobriety "isn't working." What's really
            happening is that a brain accustomed to regular sedation is
            recalibrating, and during that recalibration the over-arousal can run
            high. You've taken away the thing that was numbing the anxiety, and
            for a while you feel the anxiety bare. This is temporary. It is the
            nervous system finding its level again, not a preview of permanent
            life without the drink.
          </p>
          <p style={styles.body}>
            It helps, genuinely, to put a frame around it as it happens:
            <em> this is rebound anxiety, my brain is rebalancing, this is the
            worst of it and it is temporary.</em> The feeling doesn't vanish on
            command, but naming it creates distance — enough to not mistake the
            sensation for the truth, and enough to not reach for the thing that
            would restart the cycle.
          </p>

          <h2 style={styles.h2}>Sitting with it until it passes</h2>
          <p style={styles.body}>
            You can't think your way out of hangxiety, but you can make it more
            survivable. The body responds to the body: slow breathing, where the
            out-breath is longer than the in-breath, tells an over-aroused
            nervous system it's safe. Movement — a walk, anything — burns off
            some of the adrenaline the anxiety is riding on. Water, food, and
            sleep matter more than they seem, because a depleted body amplifies
            dread. And time, plainly, is the active ingredient: hangxiety, like a
            craving, crests and falls. The task is not to fix it but to outlast
            this wave of it, and then the next, until the brain finishes
            settling and the baseline quietly returns — often to a calmer place
            than it ever reached while you were drinking.
          </p>

          <p style={styles.body}>
            If you're in the first days of this, our piece on{' '}
            <Link to="/first-week-without-alcohol" style={styles.inlineLink}>what the first week without alcohol feels like</Link>{' '}
            covers the wider terrain, and the{' '}
            <Link to="/quit-drinking" style={styles.inlineLink}>guide to quitting drinking calmly</Link>{' '}
            lays out the whole arc. If the anxiety has already led to a slip,{' '}
            <Link to="/day-one-again" style={styles.inlineLink}>starting over without shame</Link>{' '}
            is for you.
          </p>

          <div style={styles.ctaWrap}>
            <p style={styles.ctaText}>
              Vow gives the anxious moments somewhere to go — small, grounding
              things to do instead of reaching, one day at a time.
            </p>
            <Link to="/app" style={styles.ctaBtn}>See how Vow works →</Link>
          </div>

          <p style={styles.disclaimer}>
            This article is for general support and information, not medical
            advice. Persistent or severe anxiety is worth discussing with a
            doctor or mental health professional.
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