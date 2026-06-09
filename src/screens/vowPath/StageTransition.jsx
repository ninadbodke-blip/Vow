import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const TRANSITION_CONTENT = {
  'notice-to-reflect': {
    eyebrow: 'Threshold',
    title: 'You move from Notice into Reflect.',
    body: [
      `Notice was 5 days of seeing — what crossed, where you've drifted, what the people around you have been doing, what you've quietly given up.`,
      `Reflect is 21 days. Longer, slower, more honest. The shape of what you're carrying. The reasons. The triggers. The costs. The voice.`,
      `Not all of it is comfortable. None of it is wasted.`,
    ],
    nextStageBlurb: 'Reflect is 21 days. One day at a time, in order.',
    continueLabel: 'Begin Reflect Day 1',
    nextPath: '/app/vow-path/reflect',
  },
  'reflect-to-commit': {
    eyebrow: 'Threshold',
    title: 'You move from Reflect into Commit.',
    body: [
      `Reflect was 21 days of looking honestly. Commit is 10 days of building the infrastructure for stopping.`,
      `A specific stop date. An environment audit. An anchor person. A replacement engine. An if-then library. Daily anchors. Conversations. A sealed vow. Witnesses.`,
      `The work changes shape now. From looking to building.`,
    ],
    nextStageBlurb: 'Commit is 10 days. You will set a stop date between 10 and 30 days from today on Day 1.',
    continueLabel: 'Enter Commit',
    nextPath: '/app/vow-path/commit',
  },
  'reflect-to-endure': {
    eyebrow: 'Threshold',
    title: 'You move directly into Endure.',
    body: [
      `Reflect is closed. You chose to skip Commit — to go directly to Endure.`,
      `That's a choice users make if they've already stopped, or if their stop date is now. Endure assumes the vow has been made, somewhere, in some form. It's the structured path through the first 21 days after.`,
      `Three phases. Crash. Flatness. Return.`,
    ],
    nextStageBlurb: 'Endure is 21 days from today.',
    continueLabel: 'Enter Endure',
    nextPath: '/app/vow-path/endure',
  },
  'commit-to-endure': {
    eyebrow: 'Threshold',
    title: 'The stop date you set.',
    body: [
      `Commit is closed. The vow is sealed. The infrastructure is built. The conversations are had.`,
      `What comes next is Endure — 21 days from your stop date. Three phases. Crash. Flatness. Return.`,
      `The structure exists for exactly this. The first day is Day Zero, the marking. From there, the path is set.`,
    ],
    nextStageBlurb: null,
    continueLabel: 'Enter Endure',
    nextPath: '/app/vow-path/endure',
  },
  'endure-to-build': {
    eyebrow: 'Threshold',
    title: 'Endure is complete.',
    body: [
      `Twenty-one days of structured holding. Crash, flatness, return. The vow held.`,
      `What comes next is Build — 9 modules over 9 weeks, set across a roughly twelve-week window. A slower cadence than the daily stages, by design: there is no streak to keep. You return when each week's work is ready for you.`,
      `The daily holding is behind you. Build is the slower work of constructing the post-vow life — the body, relationships, work, meaning.`,
    ],
    nextStageBlurb: 'Build is 9 modules, roughly one a week. No daily streak — you come back as each one opens.',
    continueLabel: 'Enter Build',
    nextPath: '/app/vow-path/build',
  },
}

export default function StageTransition() {
  const navigate = useNavigate()
  const { fromStage, toStage } = useParams()

  const key = `${fromStage}-to-${toStage}`
  const content = TRANSITION_CONTENT[key]

  const [phase, setPhase] = useState('arrival')

  if (!content) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.errorBlock}>
            <p style={styles.errorTitle}>Unknown transition.</p>
            <p style={styles.errorText}>
              We don't recognize the path from {fromStage} to {toStage}.
            </p>
            <button onClick={() => navigate('/app/home')} style={styles.primaryBtn}>
              Return home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleContinue = () => {
    navigate(content.nextPath)
  }

  if (phase === 'arrival') {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, ...styles.centeredPhone }}>
          <div style={styles.arrivalOrnament}>· · ·</div>
          <p style={styles.arrivalEyebrow}>{content.eyebrow}</p>
          <h1 style={styles.arrivalTitle}>{content.title}</h1>
          <div style={styles.arrivalOrnament}>· · ·</div>
          <button
            onClick={() => setPhase('reading')}
            style={{ ...styles.primaryBtn, marginTop: '3rem' }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'reading') {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.topBar}>
          <button onClick={() => setPhase('arrival')} style={styles.backBtn}>‹ Back</button>
        </div>
          <div style={styles.readingHeader}>
            <p style={styles.readingEyebrow}>{content.eyebrow}</p>
            <h2 style={styles.readingTitle}>{content.title}</h2>
            <div style={styles.readingDivider}></div>
          </div>

          <div style={styles.readingBody}>
            {content.body.map((para, idx) => (
              <p key={idx} style={styles.readingPara}>{para}</p>
            ))}
          </div>

          {content.nextStageBlurb && (
            <div style={styles.blurb}>
              <p style={styles.blurbText}>{content.nextStageBlurb}</p>
            </div>
          )}

          <div style={styles.footer}>
            <button onClick={() => setPhase('continue')} style={styles.primaryBtn}>
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={{ ...styles.phone, ...styles.centeredPhone }}>
        <div style={styles.continueOrnament}>· · ·</div>

        {content.showAsComingSoon ? (
          <>
            <p style={styles.comingSoonEyebrow}>Coming soon</p>
            <p style={styles.continueText}>{content.nextStageBlurb}</p>
          </>
        ) : (
          <p style={styles.continueText}>Tap when you are ready to begin.</p>
        )}

        <button
          onClick={handleContinue}
          style={{ ...styles.primaryBtn, marginTop: '2.5rem' }}
        >
          {content.continueLabel}
        </button>
      </div>
    </div>
  )
}

const styles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  phone: {
    background: '#FAF7F1',
    maxWidth: '460px',
    width: '100%',
    borderRadius: '28px',
    padding: '2rem 1.75rem 2.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  centeredPhone: {
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '3rem 2rem',
  },
  arrivalOrnament: {
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    margin: '0 0 2rem',
  },
  arrivalEyebrow: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 1.25rem',
  },
  arrivalTitle: {
    fontSize: '32px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.25,
    margin: '0 0 2rem',
    maxWidth: '340px',
  },
  readingHeader: { textAlign: 'center', marginBottom: '2rem' },
  readingEyebrow: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.85rem',
  },
  readingTitle: {
    fontSize: '26px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.25,
    margin: '0 0 1.25rem',
  },
  readingDivider: {
    height: '0.5px',
    background: '#E8DFD0',
    width: '40%',
    margin: '0 auto',
  },
  readingBody: { marginBottom: '1.5rem' },
  readingPara: {
    fontSize: '16px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.85,
    margin: '0 0 1.35rem',
  },
  blurb: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '14px',
    padding: '14px 16px',
    marginBottom: '1rem',
  },
  blurbText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: 0,
    textAlign: 'center',
  },
  continueOrnament: {
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    marginBottom: '2rem',
  },
  continueText: {
    fontSize: '15px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: 0,
    maxWidth: '340px',
  },
  comingSoonEyebrow: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 1rem',
  },
  errorBlock: { textAlign: 'center', padding: '3rem 1rem' },
  errorTitle: {
    fontSize: '20px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.75rem',
  },
  errorText: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1.5rem',
  },
  footer: { marginTop: '1rem' },
  primaryBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  topBar: {
  display: 'flex', alignItems: 'center',
  marginBottom: '0.5rem',
},
backBtn: {
  background: 'transparent', border: 'none',
  color: '#854F0B', fontSize: '14px', fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
},
}