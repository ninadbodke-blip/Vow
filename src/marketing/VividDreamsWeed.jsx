import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function VividDreamsWeed() {
  useSeo({
    title: 'Why You Get Vivid Dreams After Quitting Weed | Vow',
    description:
      'The intense, vivid dreams after quitting weed surprise almost everyone. Here is the oddly reassuring reason your brain does this, when the dreams peak, and when they fade.',
    canonical: 'https://vowapp.in/vivid-dreams-after-quitting-weed',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting weed</p>
          <h1 style={styles.title}>Why you get vivid dreams after quitting weed.</h1>

          <p style={styles.lede}>
            A few days into quitting weed, the dreams arrive — and they're
            nothing like normal dreams. Vivid, cinematic, strange, often
            unsettling, so intense you wake up rattled and unsure what was real.
            Almost everyone who quits daily cannabis meets this, and almost
            everyone finds it alarming. The good news is that it's one of the
            most well-understood parts of cannabis withdrawal, and the reason
            behind it is, oddly, a sign your brain is healing.
          </p>

          <h2 style={styles.h2}>The short version: your dreams are coming back</h2>
          <p style={styles.body}>
            Here's what's happening. We do most of our dreaming during a stage of
            sleep called REM. Cannabis, specifically THC, suppresses REM sleep —
            which is why heavy users often notice they barely dream at all, or
            can't remember dreaming for years. Your brain hasn't stopped needing
            that dreaming sleep; it's just been prevented from getting it. So
            when you quit and the THC clears, your brain does something called
            REM rebound: it floods back into all the dreaming it's been missing,
            often more intensely than normal, to make up for lost time. The
            vivid, overwhelming dreams aren't a malfunction. They're years of
            suppressed dreaming arriving at once.
          </p>
          <p style={styles.body}>
            Researchers take this symptom seriously enough that strange, vivid
            dreams are considered one of the more distinctive markers of genuine
            cannabis withdrawal — part of the evidence that cannabis withdrawal
            is real and not imagined. So if anyone has told you the dreams are
            "just in your head," they're half right: they are in your head,
            because your head is busy catching up on dreaming.
          </p>

          <h2 style={styles.h2}>When they peak, and when they fade</h2>
          <p style={styles.body}>
            The dreams usually start within the first several days of quitting
            and often intensify around the first week, which can feel
            discouraging — you've made it through the worst of the early
            symptoms, and now your nights turn turbulent. For most people, the
            vividness tapers over the following weeks as REM sleep finds its
            normal rhythm again. Some people notice it lingering longer, and
            that's still within the range of normal. Like the rest of withdrawal,
            it is a phase, not a new permanent feature of your sleep.
          </p>

          <h2 style={styles.h2}>Getting through the turbulent nights</h2>
          <p style={styles.body}>
            You can't switch off REM rebound, but you can make the nights gentler.
            What helps most is protecting your sleep in every other way, since a
            rested brain handles the turbulence better than an exhausted one:
            keep a steady sleep and wake time so your body has a rhythm to settle
            into, wind down without screens in the last stretch before bed, go
            easy on caffeine late in the day, and let your room be cool and dark.
            If you wake from a vivid dream shaken, it helps to remind yourself in
            the moment what it actually is — <em>this is REM rebound, my brain is
            catching up, this passes.</em> Naming it drains some of its power and
            makes it easier to settle back down.
          </p>
          <p style={styles.body}>
            And take the dreams, strange as it sounds, as evidence. They mean the
            cannabis is genuinely leaving your system and your brain is restoring
            something it had been going without. The vivid dreams after quitting
            weed are, quite literally, a sign of recovery happening while you
            sleep.
          </p>

          <p style={styles.body}>
            The dreams usually come hand in hand with broader sleep trouble — our
            piece on{' '}
            <Link to="/quitting-weed-cant-sleep" style={styles.inlineLink}>quitting weed and not being able to sleep</Link>{' '}
            covers the insomnia side, and the{' '}
            <Link to="/quit-weed" style={styles.inlineLink}>guide to quitting weed calmly</Link>{' '}
            lays out the whole arc. If the evenings themselves feel hollow,{' '}
            <Link to="/everything-feels-flat-after-weed" style={styles.inlineLink}>when everything feels flat</Link>{' '}
            is for you.
          </p>

          <div style={styles.ctaWrap}>
            <p style={styles.ctaText}>
              Vow is a calm, daily companion for the long work of quitting — not
              a treatment, just something steady to walk with through the strange
              early weeks.
            </p>
            <Link to="/app" style={styles.ctaBtn}>See how Vow works →</Link>
          </div>

          <p style={styles.disclaimer}>
            This article is for general support and information, not medical
            advice. If sleep problems are severe or persistent, consider speaking
            with a doctor.
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