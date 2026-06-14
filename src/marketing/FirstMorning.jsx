import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function FirstMorning() {
  useSeo({
    title: 'The First Cigarette-Free Morning: What to Expect | Vow',
    description:
      'The first morning without a cigarette is stranger than people expect — the whole routine was built around it. What the early mornings feel like, and how to meet the new one.',
    canonical: 'https://vowapp.in/first-cigarette-free-morning',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting nicotine</p>
          <h1 style={styles.title}>The first cigarette-free morning.</h1>

          <p style={styles.lede}>
            For a lot of people who smoke, the morning cigarette isn't one of the
            day's cigarettes — it's the hinge the whole morning swings on. The
            kettle, the step outside, the first long draw before the day
            properly begins. So the first morning without it can feel less like a
            missing cigarette and more like a missing part of the morning itself.
            If you woke up today and the hours felt oddly shapeless, that's why.
          </p>

          <h2 style={styles.h2}>Why the morning hits differently</h2>
          <p style={styles.body}>
            Nicotine levels drop overnight, so by morning the body is at its
            emptiest and the craving is often at its sharpest — that's the
            chemical half. But the larger half is the ritual. The first cigarette
            was woven into a sequence so practised you stopped noticing it: wake,
            coffee, smoke, begin. Pull one thread out of a sequence that tight and
            the whole thing feels like it's come loose. The coffee tastes like
            it's waiting for something. The pause where the cigarette went sits
            there, empty. None of this is a sign you can't do it. It's just what
            it feels like when a deep routine is mid-repair.
          </p>

          <h2 style={styles.h2}>Meeting the new morning</h2>
          <p style={styles.body}>
            The instinct is to keep everything the same and simply subtract the
            cigarette — but that leaves a cigarette-shaped hole in the exact spot
            you feel it most. It tends to go easier if you gently rearrange the
            morning instead, so the cue has somewhere new to land. Small things,
            but they matter:
          </p>
          <p style={styles.body}>
            Change the choreography. If coffee on the balcony was the trigger,
            drink it at the table, or take it on a short walk, or hold the cup
            with both hands so they're occupied. Move the order of things around
            so the morning doesn't run down the exact groove that used to end in
            a cigarette. Give the first ten minutes a different shape — a few
            slow breaths by the window, a stretch, a splash of cold water, a page
            of something. The point isn't that any one of these replaces the
            cigarette. It's that the morning gets a new pattern to follow, and a
            new pattern is the thing that, over time, stops pointing at smoking.
          </p>
          <p style={styles.body}>
            And go easy on the hour. You're not failing because the morning feels
            strange. The strangeness is the work happening. Most people find the
            morning craving is one of the most stubborn at first and one of the
            most rewarding to outlast — because once a handful of mornings have
            passed without a cigarette, the routine quietly rebuilds itself around
            the absence, and the hinge stops needing it.
          </p>

          <h2 style={styles.h2}>One morning at a time</h2>
          <p style={styles.body}>
            You don't have to imagine a lifetime of cigarette-free mornings today.
            You only have to get through this one. Then the next one is a little
            less strange, and the one after that less still. That's genuinely how
            it goes — not a single triumphant morning, but a slow accumulation of
            ordinary ones until the new shape feels like yours. If it helps to see
            the wider arc, our{' '}
            <Link to="/quit-nicotine" style={styles.inlineLink}>guide to quitting nicotine calmly</Link>{' '}
            lays out the early weeks, and{' '}
            <Link to="/what-to-do-with-your-hands-quit-smoking" style={styles.inlineLink}>what to do with your hands</Link>{' '}
            covers the restlessness that often comes with these mornings.
          </p>

          <div style={styles.ctaWrap}>
            <p style={styles.ctaText}>
              Vow is built for exactly this — the slow, daily rebuilding of a life
              around the absence. Not a cure. A companion for the mornings.
            </p>
            <Link to="/app" style={styles.ctaBtn}>See how Vow works →</Link>
          </div>

          <p style={styles.disclaimer}>
            This article is for general support and information, not medical
            advice.
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