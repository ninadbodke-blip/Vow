import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function MdmaMidweekBlues() {
  useSeo({
    title: 'The Midweek Blues: Why Tuesday Feels So Dark After a Weekend on MDMA | Vow',
    description:
      'The "midweek blues" or "Tuesday blues" hit most people days after taking MDMA. Why the crash lands midweek, what serotonin has to do with it, and how to get through the dark days.',
    canonical: 'https://vowapp.in/mdma-midweek-blues',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting MDMA</p>
          <h1 style={styles.title}>The midweek blues: why Tuesday feels so dark after a weekend on MDMA.</h1>

          <p style={styles.lede}>
            You took it on Saturday and felt incredible. Sunday was tired but
            okay. And then Tuesday arrives and the floor drops out — a heavy,
            inexplicable low, a flatness, a creeping anxiety, maybe a sense that
            everything is bleak and you can't quite say why. If this rhythm is
            familiar, you've met the midweek blues. It's one of the most common
            experiences in all of MDMA use, and there's a clean explanation for
            why it lands days later rather than the morning after.
          </p>

          <h2 style={styles.h2}>Why the crash is delayed</h2>
          <p style={styles.body}>
            MDMA produces its magic by forcing your brain to release a huge surge
            of serotonin — the chemical most tied to mood, contentment, and a
            sense of wellbeing — far more than it would ever release on its own.
            For a few hours, you're running on borrowed abundance. But your brain
            can't manufacture serotonin that fast, so once the surge is spent,
            you're left depleted, with less serotonin available than normal while
            your brain slowly restocks. That restocking takes days, not hours —
            which is why the low doesn't hit the next morning but builds toward
            the middle of the week, often peaking around Tuesday or Wednesday.
            The misery is real, but it's chemical arithmetic, not a verdict on
            your life.
          </p>
          <p style={styles.body}>
            This is so consistent that the vast majority of regular weekend users
            report it — the "midweek blues" or "suicide Tuesday," as it's grimly
            nicknamed. Knowing it's coming, and knowing it's the serotonin
            drought and not your real baseline, takes some of the terror out of
            it. The thoughts that arrive during the dip — that everything is
            hopeless, that you've ruined something — feel utterly convincing in
            the moment and are, quite literally, your brain running low on the
            chemical that makes things feel okay.
          </p>

          <h2 style={styles.h2}>Getting through the dip</h2>
          <p style={styles.body}>
            You can't refill serotonin on demand, but you can support the body
            doing it and avoid making the dip deeper. Sleep is the big one —
            serotonin and sleep are tightly linked, and MDMA wrecks both, so
            protecting your rest matters more than usual. Eat properly even when
            you don't feel like it; a depleted, undernourished body feels the low
            harder. Gentle daylight and movement genuinely help mood chemistry.
            And go easy on yourself socially and at work, because the midweek
            blues can make ordinary stresses feel enormous.
          </p>
          <p style={styles.body}>
            The most important thing, though, is what <em>not</em> to do: don't
            chase the low away with more MDMA or other substances. It's the most
            natural impulse — you feel terrible, and the thing that made you feel
            wonderful is right there — but using to escape the comedown is the
            exact mechanism by which occasional use slides into a problem, and it
            digs the serotonin hole deeper for next time. The dip passes on its
            own. Riding it out, even once, teaches you that it ends without a fix.
          </p>

          <h2 style={styles.h2}>When the blues stop being just midweek</h2>
          <p style={styles.body}>
            For occasional users, the blues come and go with each use. But the
            more often you use, the less fully your mood recovers between times,
            until the midweek low starts bleeding into a more permanent flatness.
            That's usually the sign people are ready to stop — when the drug that
            promised more feeling is quietly leaving them with less. If that's
            where you are, our{' '}
            <Link to="/how-to-get-through-mdma-comedown" style={styles.inlineLink}>guide to getting through the comedown</Link>{' '}
            covers the practical side, and{' '}
            <Link to="/does-brain-recover-after-mdma" style={styles.inlineLink}>does your brain recover after MDMA</Link>{' '}
            answers the question that tends to follow. The{' '}
            <Link to="/quit-mdma" style={styles.inlineLink}>guide to quitting MDMA calmly</Link>{' '}
            puts it all together.
          </p>

          <div style={styles.ctaWrap}>
            <p style={styles.ctaText}>
              Vow is a calm, daily companion for the long work of cutting back or
              quitting — not a treatment, just something steady to walk with
              through the low days.
            </p>
            <Link to="/app" style={styles.ctaBtn}>See how Vow works →</Link>
          </div>

          <p style={styles.disclaimer}>
            This article is for general support and information, not medical
            advice. If the low mood is severe, or you have thoughts of harming
            yourself, please contact a doctor or a crisis line.
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