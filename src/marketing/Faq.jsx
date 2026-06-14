import MarketingLayout from './MarketingLayout'
import useSeo from './useSeo'

const QUESTIONS = [
  {
    q: "What if I'm not even sure I'm ready to quit?",
    a: "Then you're exactly who Vow's first stages are for. Recovery doesn't begin with quitting — it begins with noticing. Most tools assume you've already decided and just need willpower. Vow doesn't. Notice and Reflect are built for the long, honest work of understanding your relationship with a substance before you commit to changing it. You're allowed to start from 'I don't know yet.'",
  },
  {
    q: "What happens if I slip?",
    a: "Nothing you need to be ashamed of, and nothing that erases your progress. A slip moves you into Reclaim — a stage built for exactly that moment — not back to zero. We believe shame is one of the most reliable causes of relapse there is, so Vow is designed never to add to it. You get an honest look at what happened and a gentler way back. Slipping is part of almost every real recovery; Vow is built around that truth rather than against it.",
  },
  {
    q: "Is Vow actually going to help, or is it just another app?",
    a: "Vow is built on the Transtheoretical Model — a framework for behaviour change with decades of clinical evidence behind it — rather than on streaks and badges. It meets you at your real stage and gives you work that fits it. We won't promise it cures anything; no honest tool can. What we can say is that it takes the science seriously, speaks to you like an adult, and is designed for the long, unglamorous middle of recovery that most apps ignore.",
  },
  {
    q: "Is Vow medical treatment?",
    a: "No. Vow is a recovery companion, not medical or clinical care, and it isn't a substitute for a doctor, therapist, or treatment program. For some substances — heavy daily drinking especially — stopping suddenly can be medically dangerous, and you should start with a doctor. If you're in crisis, please reach out to a professional or one of the helplines in our footer. Vow is built to walk alongside professional care, not replace it.",
  },
  {
    q: "How private is this, really?",
    a: "Private by design. Your stage, journal, check-ins, anchors, and substance type live in our secure database, tied only to your account. We don't sell your data, we don't share it, and we don't run ads — there's no business model here that depends on your information. The full detail is in our Privacy Policy, and you can delete everything at any time.",
  },
  {
    q: "Will the people I add as anchors see my journal?",
    a: "No. Anchors are people you choose to have in your corner, and they only ever see what you deliberately choose to share. They can send you encouragement through a private link. They never see your journal, your slips, or your full progress. What you write in Vow stays yours.",
  },
  {
    q: "Why is it one payment instead of a subscription?",
    a: "Because recovery has hard weeks, and we never want you wondering whether you can still afford the thing helping you through one. The core of Vow is free forever. The full guided Vow Path is a single one-time payment, yours to keep for good — no renewals, no monthly charge, no losing access because money got tight. You pay once; it's there on your worst day regardless.",
  },
  {
    q: "Can I use Vow for free?",
    a: "Yes, genuinely. The entire path is walkable in the free version — all six stages, daily check-ins, the journal, your anchors, the urge log, and the slip flow. The one-time payment unlocks the deeper, day-by-day guided program, but the things you need on an ordinary hard day are free and always will be.",
  },
  {
    q: "Can I get Vow on my phone?",
    a: "Yes. Vow works in your browser at vowapp.in, and you can install it to your home screen — on iPhone, open it in Safari and tap Share, then Add to Home Screen. An Android listing on the Play Store is rolling out, and a native iOS app is on the roadmap.",
  },
  {
    q: "Can I delete my data?",
    a: "Completely, whenever you want. You can delete your account and everything tied to it from the Profile screen in the app, and it's removed from our systems within the timeframe set out in our Privacy Policy. No emails to send, no hoops.",
  },
  {
    q: "Who built Vow, and why?",
    a: "Vow was built by Ninad Bodke at Vow Labs, a small independent studio in Mumbai. It exists because the recovery software that should have existed didn't — something serious about the science, honest about the difficulty, and gentle with the person doing the work. There's more on the About page.",
  },
]

export default function Faq() {
  useSeo({
    title: 'Questions About Vow, Answered Honestly | Vow',
    description:
      'Honest, empathetic answers about Vow — what happens if you slip, whether you have to be ready to quit, how private it is, why it is one payment not a subscription, and more.',
    canonical: 'https://vowapp.in/faq',
    type: 'website',
  })

  return (
    <MarketingLayout>
      <section style={styles.heroSection}>
        <div style={styles.inner}>
          <p style={styles.eyebrow}>Questions, answered honestly</p>
          <h1 style={styles.title}>The things you're actually wondering.</h1>
          <p style={styles.lede}>
            Not corporate FAQ filler — the real questions people carry when
            they're thinking about doing something this hard. If yours isn't
            here, write to us, and it might end up on this page.
          </p>
        </div>
      </section>

      <section style={styles.qaSection}>
        <div style={styles.inner}>
          {QUESTIONS.map((item) => (
            <div key={item.q} style={styles.qaItem}>
              <h3 style={styles.qaQ}>{item.q}</h3>
              <p style={styles.qaA}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  )
}

const styles = {
  heroSection: { padding: '80px 32px 40px' },
  qaSection: { padding: '20px 32px 80px' },
  inner: { maxWidth: '760px', margin: '0 auto' },
  eyebrow: { fontSize: '12px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 16px' },
  title: { fontSize: 'clamp(34px, 5vw, 50px)', fontWeight: 400, color: '#2A1F15', lineHeight: 1.15, margin: '0 0 24px', fontFamily: 'Georgia, serif' },
  lede: { fontSize: '18px', color: '#5B4F3F', lineHeight: 1.65, margin: 0, maxWidth: '620px', fontFamily: 'Georgia, serif' },
  qaItem: { padding: '28px 0', borderBottom: '0.5px solid #E8DCC2' },
  qaQ: { fontSize: '19px', fontWeight: 500, color: '#2A1F15', margin: '0 0 10px', fontFamily: 'Georgia, serif' },
  qaA: { fontSize: '16.5px', color: '#5B4F3F', lineHeight: 1.68, margin: 0, fontFamily: 'Georgia, serif' },
}