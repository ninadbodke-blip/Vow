import { Link } from 'react-router-dom'
import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

export default function WeedInsomnia() {
  useSeo({
    title: "Quitting Weed and Can't Sleep: The Insomnia Nobody Warns You About | Vow",
    description:
      'Insomnia after quitting weed is one of the most common and most quit-derailing symptoms. Why it happens, how long it lasts, and how to get through the sleepless nights without going back.',
    canonical: 'https://vowapp.in/quitting-weed-cant-sleep',
  })

  return (
    <MarketingLayout>
      <article style={styles.section}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Quitting weed</p>
          <h1 style={styles.title}>Quitting weed and can't sleep: the insomnia nobody warns you about.</h1>

          <p style={styles.lede}>
            If you used weed to fall asleep — and a great many daily users do —
            then the first nights after quitting can be brutal. You lie there
            wide awake, mind running, body tired but refusing to switch off,
            watching the hours go by. It's exhausting, demoralising, and it's the
            single most common reason people give for going back: <em>I just
            need to sleep.</em> Understanding why it's happening, and that it
            ends, is what gets you through the worst of it.
          </p>

          <h2 style={styles.h2}>Why sleep falls apart</h2>
          <p style={styles.body}>
            If weed was your way of getting to sleep, your brain had outsourced
            part of the job. THC helped switch off the racing thoughts and bring
            on drowsiness, and over months or years your natural ability to fall
            asleep unaided got rusty from disuse. Take the weed away suddenly and
            that ability isn't there yet — it has to wake back up, and for a
            stretch you're left trying to sleep with neither the crutch nor the
            restored natural skill. On top of that, the general restlessness and
            anxiety of early withdrawal make the mind louder exactly when you
            need it to quiet. The result is insomnia that can feel total in the
            first few nights.
          </p>
          <p style={styles.body}>
            It's worth knowing this is one of the best-documented cannabis
            withdrawal symptoms — reduced sleep time and trouble falling asleep
            show up reliably in studies of people who've recently quit. You are
            not uniquely broken. Your sleep system is recalibrating, and
            recalibration takes a little time.
          </p>

          <h2 style={styles.h2}>How long it lasts</h2>
          <p style={styles.body}>
            For most people the sharpest insomnia is in the first several nights
            to the first week or two, easing as the body relearns to fall asleep
            on its own. It rarely vanishes overnight — it tends to improve in
            uneven steps, a slightly better night, then a bad one, then two
            better ones. The vivid dreams that often arrive around the same time
            can make the sleep you <em>do</em> get feel less restful for a while.
            All of this is the same recalibration, and all of it passes. Many
            people find that, weeks on, they're sleeping more deeply than they
            had in years of using.
          </p>

          <h2 style={styles.h2}>Getting through the sleepless nights</h2>
          <p style={styles.body}>
            You can't force sleep, but you can build the conditions that let it
            return, and you can stop fighting it in ways that make it worse. The
            most useful shift is to take the pressure off: lying in bed furious
            that you're not asleep keeps you awake. If you've been awake a long
            while, it often helps to get up, sit somewhere dim and dull for a bit,
            and go back when you feel heavy, rather than lie there battling the
            clock. Beyond that, the ordinary sleep basics matter more than usual
            right now — a consistent wake time above all, since that anchors the
            whole rhythm; daylight and a little movement during the day; winding
            down without bright screens; easing off caffeine after the morning.
            None of these are magic, but stacked together they shorten the rough
            patch.
          </p>
          <p style={styles.body}>
            And hold onto the timeline when a bad night tempts you back. The
            sleeplessness is loudest in exactly the window where quitting feels
            least sustainable — which means a sleepless night is not proof that
            you can't do this without weed. It's proof that your sleep system is
            mid-repair. Give it the nights it needs, and it comes back.
          </p>

          <p style={styles.body}>
            The insomnia and the{' '}
            <Link to="/vivid-dreams-after-quitting-weed" style={styles.inlineLink}>vivid dreams after quitting weed</Link>{' '}
            are two halves of the same sleep recalibration. The{' '}
            <Link to="/quit-weed" style={styles.inlineLink}>guide to quitting weed calmly</Link>{' '}
            covers the full picture, and if the daytime feels as flat as the
            nights are restless,{' '}
            <Link to="/everything-feels-flat-after-weed" style={styles.inlineLink}>when everything feels flat</Link>{' '}
            is worth a read.
          </p>

          <div style={styles.ctaWrap}>
            <p style={styles.ctaText}>
              Vow is a calm, daily companion for the long work of quitting — not
              a treatment, just something steady to walk with through the hard
              nights.
            </p>
            <Link to="/app" style={styles.ctaBtn}>See how Vow works →</Link>
          </div>

          <p style={styles.disclaimer}>
            This article is for general support and information, not medical
            advice. If insomnia is severe or persistent, consider speaking with a
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