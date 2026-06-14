import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function DayOneAgain() {
  useSeo({
    title: 'Day One, Again: On Starting Over Without Shame | Vow',
    description:
      'If you have reset your sobriety counter more times than you can count, this is for you. Why starting over is not failure, and how to begin again without the shame that makes relapse worse.',
    canonical: 'https://vowapp.in/day-one-again',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting drinking</p>
          <h1 style={styles.title}>Day one, again: on starting over without shame.</h1>

          <p style={styles.lede}>
            Maybe you had thirty days, or ninety, or a year, and then one evening
            it was gone and you're back at the start. Maybe you've been back at
            the start more times than you can count. There's a particular despair
            in typing "day 1" into an app again — the sense that you've failed at
            the one thing you most wanted, that the reset erases everything
            before it. It doesn't. And the belief that it does is one of the most
            dangerous parts of the whole thing.
          </p>

          <h2 style={styles.h2}>The counter is not the truth</h2>
          <p style={styles.body}>
            Sobriety counters are useful, but they tell a cruel kind of story:
            that your progress lives in an unbroken number, and that a single
            drink deletes all of it back to zero. That's not how change actually
            works. The ninety days you strung together taught your body and mind
            things that one night doesn't un-teach. You learned which evenings
            were dangerous, what the craving felt like and that it passed, who
            you could call, what it was like to wake without dread. None of that
            knowledge resets. The number on the counter went back to one; you
            did not.
          </p>
          <p style={styles.body}>
            Real recovery, for most people, is not a clean line from drinking to
            not-drinking. It's a series of attempts, each one carrying forward
            what the last one learned. The people who eventually get free are
            rarely the ones who never slipped — they're the ones who got back up
            faster each time, and who refused to let a slip become a spiral.
          </p>

          <h2 style={styles.h2}>Why shame is the real danger</h2>
          <p style={styles.body}>
            Here's the trap, and it's worth seeing clearly. A slip is one drink,
            one night. What turns one night into a week, or a month, or a full
            return, is almost never the alcohol itself — it's the <em>shame</em>.
            The story that says: you blew it, you always do this, you're not the
            kind of person who can change, so you may as well keep drinking now.
            That story feels like honesty. It is actually the single most
            reliable engine of relapse there is. The drink reset the counter; the
            shame is what keeps you from starting it again.
          </p>
          <p style={styles.body}>
            So the most important thing you can do after a slip is also the
            hardest: refuse the shame. Not by pretending it didn't happen, but by
            treating it the way you'd treat a friend who slipped — with
            disappointment, maybe, but also with the plain, steadying message
            that one night is one night, and the next day is available, and they
            are not back at nothing. You'd never tell a friend that ninety days
            of effort meant nothing because of one evening. Don't tell yourself
            that either.
          </p>

          <h2 style={styles.h2}>Beginning again</h2>
          <p style={styles.body}>
            Starting over doesn't require a grand recommitment or a perfect
            Monday. It requires one thing: not drinking today. The same quiet
            promise that worked the first time works every time —{' '}
            <em>not today; I'll deal with forever some other time.</em> And this
            time you start with everything the previous attempts gave you, which
            is more than you think. Begin again from where you actually are, not
            from zero, and not from the version of you that's busy listing your
            failures.
          </p>
          <p style={styles.body}>
            If you're in the thick of the early days, our piece on{' '}
            <Link to="/first-week-without-alcohol" style={styles.inlineLink}>what the first week without alcohol feels like</Link>{' '}
            walks through it, and{' '}
            <Link to="/hangxiety" style={styles.inlineLink}>hangxiety</Link>{' '}
            covers the anxiety that often drives the reach. The wider arc lives
            in our{' '}
            <Link to="/quit-drinking" style={styles.inlineLink}>guide to quitting drinking calmly</Link>.
          </p>

          <p style={styles.body}>
            Day one again isn't a verdict. It's just a day, the same as the last
            first day — except you've done this before, and that counts for more
            than the counter will ever show.
          </p>

          <div style={styles.ctaWrap}>
            <p style={styles.ctaText}>
              Vow was built on this exact belief: that a slip is not a failure,
              and that nothing you've built is lost. It's a companion for getting
              back up, gently, as many times as it takes.
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