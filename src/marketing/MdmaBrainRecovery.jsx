import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function MdmaBrainRecovery() {
  useSeo({
    title: 'Does Your Brain Recover After Quitting MDMA? | Vow',
    description:
      'After heavy MDMA use, many people worry the damage is permanent. An honest look at what the science says about serotonin recovery, what heals, how long it takes, and what is still unknown.',
    canonical: 'https://vowapp.in/does-brain-recover-after-mdma',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting MDMA</p>
          <h1 style={styles.title}>Does your brain recover after quitting MDMA?</h1>

          <p style={styles.lede}>
            It's the question that arrives at 3am after one too many heavy
            weekends: have I broken something? The flat mood, the foggy memory,
            the sense that the easy happiness you used to feel has dimmed — it's
            frightening, and the internet is full of both reassuring myths and
            terrifying ones. Here's an honest attempt at the real answer, which
            is mostly hopeful, partly uncertain, and worth understanding clearly.
          </p>

          <h2 style={styles.h2}>The reassuring part</h2>
          <p style={styles.body}>
            For most people, most of what you feel after stopping MDMA recovers.
            The low mood, anxiety, fogginess, and flatness of the days and weeks
            after use are largely down to depleted serotonin — and your brain
            restocks serotonin. For occasional users, that happens within days.
            For frequent users, the serotonin system generally settles back
            toward normal over a few weeks of not using. Studies that have
            followed people after they quit MDMA tend to find their mood and
            psychological health <em>improve</em> once they stop — which makes
            sense, because the thing that was depleting them is gone. The
            grey-feeling brain you're worried about is, in most cases, a
            recovering brain, not a permanently damaged one.
          </p>

          <h2 style={styles.h2}>The honest, uncertain part</h2>
          <p style={styles.body}>
            It would be dishonest to promise that nothing lasts. Heavy, long-term
            MDMA use has been associated with longer-term changes in the brain's
            serotonin system, and with memory and mood difficulties that can take
            a good while to lift — and researchers are genuinely still working out
            how much of that fully reverses and how much can linger. The honest
            summary is: the brain is far more resilient than the scare stories
            suggest, recovery is the rule rather than the exception, but heavier
            and longer use asks for more recovery time, and there's still a lot
            science doesn't know. What's clear is that continuing to use is the
            thing that prevents recovery; stopping is what allows it to begin.
          </p>

          <h2 style={styles.h2}>What helps your brain recover</h2>
          <p style={styles.body}>
            There's no pill or supplement that has been reliably shown to "repair"
            the brain after MDMA, and you should be wary of anything sold on that
            promise. What genuinely helps is unglamorous and real: time without
            the drug, above all — recovery simply needs the absence of fresh
            depletion. Beyond that, the things that support brain and mood health
            generally: proper sleep, real food, regular movement and daylight,
            and not piling other heavy substance use on top. Give your brain those
            conditions and the time, and it does the repair work itself. Your job
            is mostly to get out of its way.
          </p>

          <h2 style={styles.h2}>Be patient with the timeline</h2>
          <p style={styles.body}>
            The hard part is that recovery is gradual and invisible — you can't
            feel your serotonin transporters returning, so for a while it can seem
            like nothing's improving and you've been left permanently flat. That
            flatness lifting is slow and uneven, and the temptation, cruelly, is
            to use again just to feel something — which restarts the depletion.
            The people who recover are the ones who give it the weeks and months
            it asks for. If you're in the thick of it, our pieces on{' '}
            <Link to="/mdma-midweek-blues" style={styles.inlineLink}>the midweek blues</Link>{' '}
            and{' '}
            <Link to="/how-to-get-through-mdma-comedown" style={styles.inlineLink}>getting through the comedown</Link>{' '}
            cover the day-to-day, and the{' '}
            <Link to="/quit-mdma" style={styles.inlineLink}>guide to quitting MDMA calmly</Link>{' '}
            holds the whole picture.
          </p>

          <p style={styles.body}>
            So: does your brain recover? For the great majority of people,
            substantially yes — given time, rest, and a real break. The most
            important thing you can do for the brain you're worried about is the
            thing you're already considering: stop, and let it heal.
          </p>

          <div style={styles.ctaWrap}>
            <p style={styles.ctaText}>
              Vow is a calm, daily companion for the long work of staying stopped
              — not a treatment or a cure, just something steady to walk with
              while your brain finds its way back.
            </p>
            <Link to="/app" style={styles.ctaBtn}>See how Vow works →</Link>
          </div>

          <p style={styles.disclaimer}>
            This article is for general support and information, not medical
            advice. Persistent low mood, memory problems, or thoughts of harming
            yourself are worth discussing with a doctor or mental health
            professional.
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