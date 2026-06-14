import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function QuitVapingDay3() {
  useSeo({
    title: 'Why Day 3 of Quitting Vaping Is the Hardest (and What Nobody Tells You) | Vow',
    description:
      'Day three is when quitting vaping feels least possible. Here is what is actually happening, why the worst day is also a turning point, and how to get through the hours that feel endless.',
    canonical: 'https://vowapp.in/quit-vaping-day-3',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting nicotine</p>
          <h1 style={styles.title}>Why day 3 of quitting vaping is the hardest — and what nobody tells you.</h1>

          <p style={styles.lede}>
            If you're somewhere in the third day without your vape and quietly
            wondering whether you've made a terrible mistake — you haven't, and
            you're not imagining how bad it feels. Day three is, for most people,
            the steepest part of the climb. Knowing why doesn't make it painless.
            But it can change what the day means.
          </p>

          <h2 style={styles.h2}>What's actually happening on day three</h2>
          <p style={styles.body}>
            When you stop vaping, nicotine clears your body fairly fast. By the
            third day there's very little left, and your brain — which had
            quietly reorganised itself around a steady supply — is now adjusting
            to its absence all at once. That adjustment is what you're feeling.
            The irritability that arrives from nowhere. The fog that makes simple
            tasks feel like wading. The restlessness, the short fuse, the sleep
            that won't come or won't stay. None of it is weakness. It's a nervous
            system recalibrating, and it happens to be loudest right about now.
          </p>
          <p style={styles.body}>
            Here's the part that matters most, and the part the clinical timelines
            state so flatly it's easy to miss: this is the peak. Day three is
            generally where the symptoms are most intense, which means it's also
            the place where they begin, slowly, to ease. You are not at the start
            of an endless worsening. You are very close to the top of the hill.
            Most people find that from day four onward, the physical edge starts
            to dull — not vanish, but soften, day by day.
          </p>

          <h2 style={styles.h2}>Why it feels emotional, not just physical</h2>
          <p style={styles.body}>
            People expect cravings. What surprises them on day three is the
            <em> mood</em>. A flatness, or a strange grief, or anger that seems out
            of proportion to anything actually happening. There's a reason for
            this. Many people who vape describe it as the thing that calms them,
            steadies them, takes the edge off. In truth, nicotine creates a good
            deal of the tension it then appears to relieve — each hit quieting a
            restlessness that the previous hit helped cause. Take it away, and for
            a few days you're left holding the restlessness with nothing to quiet
            it. That's not your real baseline. It's the withdrawal talking, and it
            is temporary.
          </p>
          <p style={styles.body}>
            It helps, genuinely, to name it while it's happening: <em>this is day
            three, this is the hardest part, this is my brain recalibrating and
            not the truth about my life.</em> Putting words to it creates a little
            distance between you and the feeling — enough room to not act on it.
          </p>

          <h2 style={styles.h2}>Getting through the hours that feel endless</h2>
          <p style={styles.body}>
            On a day like this, the goal isn't to feel good. It's to get to
            tomorrow without vaping, and let tomorrow be a little easier. A few
            things that help, less because they're clever and more because they
            give the moment somewhere to go:
          </p>
          <p style={styles.body}>
            Shrink the horizon. You don't have to quit forever today. You have to
            not vape for the next ten minutes, and cravings rarely last longer
            than that — they crest and fall like a wave, even the big ones. When
            one arrives, the task is simply to outlast this one. Then the next.
            Move your body, even a little, because the restlessness is partly
            physical and motion gives it an outlet — a walk around the block does
            more than it has any right to. Change rooms when a craving hits a
            place that's soaked in the habit. Drink water, eat something, keep
            your hands occupied — not as a cure, but as a way of being kind to a
            system that's working hard. And tell one person you're on day three,
            so you're not carrying it alone in your own head.
          </p>

          <h2 style={styles.h2}>After day three</h2>
          <p style={styles.body}>
            If you can get through this, you've cleared the sharpest physical
            stretch. What comes next is a different, gentler kind of work — the
            slow business of staying quit when the cravings are no longer about
            chemistry but about habit and cue. That's the long middle of
            quitting, and it's the part most people are least prepared for, and
            the part a steady daily companion helps with most. We've written more
            about the whole arc in our{' '}
            <Link to="/quit-nicotine" style={styles.inlineLink}>guide to quitting nicotine calmly</Link>,
            and about{' '}
            <Link to="/first-cigarette-free-morning" style={styles.inlineLink}>meeting the first mornings without it</Link>.
          </p>

          <p style={styles.body}>
            For now, though, there's only today. You're on day three. It's the
            hardest one. And you're nearly through it.
          </p>

          <div style={styles.ctaWrap}>
            <p style={styles.ctaText}>
              Vow is a calm, daily companion for the long work after the first
              hard days — not a treatment, just something steady to walk with.
            </p>
            <Link to="/app" style={styles.ctaBtn}>See how Vow works →</Link>
          </div>

          <p style={styles.disclaimer}>
            This article is for general support and information, not medical
            advice. Severe withdrawal symptoms are worth discussing with a
            doctor.
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