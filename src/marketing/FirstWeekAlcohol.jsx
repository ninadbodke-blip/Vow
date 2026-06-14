import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function FirstWeekAlcohol() {
  useSeo({
    title: 'What the First Week Without Alcohol Actually Feels Like | Vow',
    description:
      'The first week sober is rarely what people expect. Less about physical withdrawal, more about the mind games. An honest day-by-day of what the first alcohol-free week really feels like.',
    canonical: 'https://vowapp.in/first-week-without-alcohol',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting drinking</p>
          <h1 style={styles.title}>What the first week without alcohol actually feels like.</h1>

          <p style={styles.lede}>
            People brace for the first week sober expecting shakes and sweats.
            Some of that can happen. But the thing almost everyone who's done it
            says afterward is the same: the hard part wasn't the body. It was the
            head. The first week is less a physical detox and more a week-long
            argument with your own mind — and knowing that in advance is half of
            getting through it.
          </p>

          <div style={styles.safety}>
            <p style={styles.safetyText}>
              If you've been drinking heavily every day, please read this with
              one caveat: severe alcohol withdrawal is a medical situation, not
              a willpower one. Shaking, confusion, hallucinations, or seizures
              mean you need a doctor now, not a blog. A supervised detox is the
              safe way to start. The rest of this is written for the much more
              common experience of a hard but not dangerous first week.
            </p>
          </div>

          <h2 style={styles.h2}>The first day or two</h2>
          <p style={styles.body}>
            Alcohol leaves the body within about a day, so the earliest stretch
            is partly physical: poor sleep, a foggy and effortful mind, maybe
            sweating or a low, jittery mood as your system adjusts to its
            absence. For many people who weren't daily heavy drinkers, this is
            milder than feared — more like a long, flat hangover that won't quite
            lift. What's louder than the body, almost immediately, is the
            relief: waking without the dread, the racing 4am guilt, the
            promising-yourself-never-again. That relief is real, and it's worth
            holding onto, because the mind is about to test it.
          </p>

          <h2 style={styles.h2}>The mind games</h2>
          <p style={styles.body}>
            This is the part nobody warns you about, and the part that throws
            people off. Somewhere in the first few days, your own head starts
            negotiating. <em>You went two days without a drink — clearly you
            don't have a problem. It's been a hard day; start tomorrow instead.
            Everyone else drinks; why can't you? Just one won't hurt.</em> The
            voice is relentless and it is persuasive, because it sounds exactly
            like you. The single most useful thing to understand is that this
            chatter is not the truth about your life — it's a habit defending
            itself, and it gets quieter the longer you don't feed it.
          </p>
          <p style={styles.body}>
            You don't have to win the argument. You just have to not act on it
            for today. A surprising number of people get through the first week
            on one quiet promise repeated daily: <em>not today. I'll deal with
            forever some other time. Today, I just don't drink.</em> Shrinking
            the decision down to a single day makes an impossible thing
            manageable — and a week is just seven of those days, one at a time.
          </p>

          <h2 style={styles.h2}>The end of the week</h2>
          <p style={styles.body}>
            By the end of the first alcohol-free week, two things usually shift.
            The sleep starts to deepen — alcohol wrecks sleep quality even when
            it knocks you out, so a week in, mornings often arrive with an
            energy you'd forgotten. And the mind games, while not gone, lose some
            of their volume; you've proved to yourself, seven times, that the
            craving crests and passes without a drink. That's not nothing.
            That's the beginning of a new pattern.
          </p>
          <p style={styles.body}>
            What comes after the first week is a longer, gentler kind of work —
            the anxiety that can linger (we wrote about{' '}
            <Link to="/hangxiety" style={styles.inlineLink}>hangxiety and why it gets worse before better</Link>),
            and the reality that staying sober means meeting a hundred ordinary
            evenings a new way. If you ever do drink again, that isn't the end of
            anything either —{' '}
            <Link to="/day-one-again" style={styles.inlineLink}>starting over without shame</Link>{' '}
            is part of how almost everyone gets there. The fuller picture is in
            our{' '}
            <Link to="/quit-drinking" style={styles.inlineLink}>guide to quitting drinking calmly</Link>.
          </p>

          <p style={styles.body}>
            For now, though, there's only this week. And the hardest part of it
            is a voice in your head, not a poison in your blood. You can outlast
            a voice.
          </p>

          <div style={styles.ctaWrap}>
            <p style={styles.ctaText}>
              Vow is a calm, daily companion for the long work after the first
              hard week — not a treatment, just something steady to walk with.
            </p>
            <Link to="/app" style={styles.ctaBtn}>See how Vow works →</Link>
          </div>

          <p style={styles.disclaimer}>
            This article is for general support and information, not medical
            advice. Severe alcohol withdrawal can be dangerous and requires
            medical care.
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
  safety: { background: '#FBF1ED', border: '0.5px solid #E8B59B', borderRadius: '14px', padding: '18px 20px', margin: '0 0 24px' },
  safetyText: { fontSize: '15.5px', color: '#7A4A33', lineHeight: 1.6, margin: 0, fontFamily: 'Georgia, serif' },
  body: { fontSize: '18px', color: '#5B4F3F', lineHeight: 1.68, margin: '0 0 18px', fontFamily: 'Georgia, serif' },
  h2: { fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 400, color: '#2A1F15', lineHeight: 1.25, margin: '44px 0 16px', fontFamily: 'Georgia, serif' },
  inlineLink: { color: '#854F0B', textDecoration: 'underline' },
  ctaWrap: { marginTop: '48px', paddingTop: '32px', borderTop: '0.5px solid #E5D9C2', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' },
  ctaText: { fontSize: '18px', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0 },
  ctaBtn: { display: 'inline-block', textDecoration: 'none', padding: '14px 26px', background: 'linear-gradient(180deg, #3A2A1C, #241710)', color: '#F6E8C4', borderRadius: '12px', fontSize: '16px', fontFamily: 'Georgia, serif' },
  disclaimer: { fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginTop: '28px', lineHeight: 1.5 },
}