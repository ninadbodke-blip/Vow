import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function HandsQuitSmoking() {
  useSeo({
    title: 'What to Do With Your Hands When You Quit Smoking | Vow',
    description:
      'The restlessness in your hands after you quit smoking is real and nobody warns you about it. Why it happens, and what actually helps the reach — beyond holding a pencil.',
    canonical: 'https://vowapp.in/what-to-do-with-your-hands-quit-smoking',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting nicotine</p>
          <h1 style={styles.title}>What to do with your hands when you quit smoking.</h1>

          <p style={styles.lede}>
            Every guide tells you to hold a pencil. It's not wrong, exactly. But
            if you've just quit smoking and your hands feel like they belong to
            someone else — reaching for a pocket that's empty, fidgeting at
            nothing, restless in a way you can't quite locate — a pencil is going
            to feel like a thin answer. The restlessness is real. Here's why it's
            there, and what actually helps.
          </p>

          <h2 style={styles.h2}>Why your hands won't settle</h2>
          <p style={styles.body}>
            Smoking was never only about nicotine. It was a choreography — a
            hundred times a day, your hands did the same small dance: reach,
            tap, light, lift, draw, rest. That sequence got wired in deep,
            repeated more often than almost anything else you do. When you quit,
            the chemical craving is one thing, but the <em>hands</em> have their
            own memory. They go looking for the choreography and find nothing.
            That's the fidget, the reach, the strange empty-handedness. It isn't
            a sign you're about to cave. It's a habit that hasn't yet learned the
            dance is over.
          </p>
          <p style={styles.body}>
            This is also why so many people say the physical reach outlasts the
            chemical craving. The nicotine clears in days. The hands take longer,
            because they're not detoxing — they're un-learning. And un-learning
            responds to two things: giving the moment something else to do, and
            letting enough ordinary days pass that the reach quietly fades.
          </p>

          <h2 style={styles.h2}>What actually helps the reach</h2>
          <p style={styles.body}>
            The pencil advice points in the right direction — give the hands an
            object — it's just told without any feeling for the moment. The truth
            is that almost anything small and tactile works, and the best one is
            whatever you'll actually keep on you. Some people carry a smooth
            stone, a coin, a worry bead, a bit of string, a fidget ring. The
            object matters less than the having of it: something to find in your
            pocket when the hand goes looking, so the reach lands on <em>this</em>{' '}
            instead of nothing.
          </p>
          <p style={styles.body}>
            Beyond an object, it helps to give the hands real work at the exact
            moments the reach was loudest. The cigarette after a meal? Get up and
            wash the dishes — wet hands can't hold a cigarette, and the task fills
            the gap. The one with coffee? Hold the cup with both hands, or switch
            where you drink it so the cue is weaker. The balcony cigarette when
            stress builds? That's the hardest, because there the cigarette was
            doing a job — and the answer isn't an object, it's a different way to
            put the stress down. A few slow breaths with a hand on your chest. A
            short walk. Anything that lets the hands move and the body discharge
            what it's holding.
          </p>
          <p style={styles.body}>
            And there's a quieter trick that helps more than it sounds: notice
            the reach without obeying it. When your hand drifts toward the old
            pocket, you don't have to scold it. Just see it — <em>there it goes,
            looking again</em> — and let it land somewhere else. Each time you do,
            the habit loosens a little. You're not fighting your hands. You're
            gently retraining them.
          </p>

          <h2 style={styles.h2}>It gets quieter</h2>
          <p style={styles.body}>
            The empty-handed feeling is one of the most under-warned parts of
            quitting, and one of the most temporary. Give it objects, give it
            tasks, give it a few weeks of ordinary days, and the reach fades from
            a constant tug to an occasional flicker to, eventually, nothing much
            at all. If you want the fuller picture of how the early days tend to
            go, our{' '}
            <Link to="/quit-nicotine" style={styles.inlineLink}>guide to quitting nicotine calmly</Link>{' '}
            walks through the whole arc, and{' '}
            <Link to="/quit-vaping-day-3" style={styles.inlineLink}>why day three is the hardest</Link>{' '}
            covers the steepest stretch.
          </p>

          <div style={styles.ctaWrap}>
            <p style={styles.ctaText}>
              Vow gives the restless moments somewhere to go — small, tactile
              things to do instead of reaching, one day at a time.
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