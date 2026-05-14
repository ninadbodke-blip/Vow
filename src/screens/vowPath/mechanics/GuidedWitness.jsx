import { useState, useEffect, useRef } from 'react'

export default function GuidedWitness({ data, onSave, saving }) {
  const {
    durationSeconds = 300,
    prompts,
    followUpHeader,
    followUpOptions,
  } = data

  // Phases: 'intro' -> 'sit' -> 'complete' -> 'naming'
  const [phase, setPhase] = useState('intro')

  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [followUp, setFollowUp] = useState(null)

  const lastTickRef = useRef(null)
  const rafRef = useRef(null)

  // Find the currently-active prompt
  const activePrompt = (() => {
    const sortedPrompts = [...prompts].sort((a, b) => a.atSecond - b.atSecond)
    let current = null
    for (const p of sortedPrompts) {
      if (elapsedSeconds >= p.atSecond) current = p
    }
    return current
  })()

  // Timer logic
  useEffect(() => {
    if (!isPlaying) {
      lastTickRef.current = null
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const tick = (timestamp) => {
      if (lastTickRef.current === null) lastTickRef.current = timestamp
      const delta = (timestamp - lastTickRef.current) / 1000
      lastTickRef.current = timestamp

      setElapsedSeconds(prev => {
        const next = prev + delta
        if (next >= durationSeconds) {
          setIsPlaying(false)
          setPhase('complete')
          return durationSeconds
        }
        return next
      })

      if (isPlaying) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, durationSeconds])

  const togglePlay = () => {
    setIsPlaying(prev => !prev)
  }

  const restartSit = () => {
    setElapsedSeconds(0)
    setIsPlaying(false)
    setPhase('intro')
  }

  const skipToEnd = () => {
    setElapsedSeconds(durationSeconds)
    setIsPlaying(false)
    setPhase('complete')
  }

  const minutesLeft = Math.floor((durationSeconds - elapsedSeconds) / 60)
  const secondsLeft = Math.floor((durationSeconds - elapsedSeconds) % 60)
  const progress = elapsedSeconds / durationSeconds

  const finalize = () => {
    onSave({
      duration_seconds: durationSeconds,
      completed: elapsedSeconds >= durationSeconds,
      time_sat: Math.floor(elapsedSeconds),
      follow_up: followUp,
    })
  }

  // ===================================================================
  // PHASE: INTRO
  // ===================================================================
  if (phase === 'intro') {
    return (
      <div style={styles.container}>
        <div style={styles.introBlock}>
          <div style={styles.lotusGlyph}>·</div>
          <h2 style={styles.introTitle}>Five minutes.</h2>
          <p style={styles.introText}>
            Sit comfortably. Eyes can be open or closed. The prompts will appear when they're ready.
          </p>
          <p style={styles.introTextSmall}>
            You can pause at any time. The sit will not progress while paused.
          </p>
        </div>

        <div style={styles.footer}>
          <button onClick={() => { setPhase('sit'); setIsPlaying(true) }} style={styles.primaryBtn}>
            Begin
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: SIT
  // ===================================================================
  if (phase === 'sit') {
    const ringSize = 240
    const strokeWidth = 3
    const radius = (ringSize - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference * (1 - progress)

    return (
      <div style={styles.container}>
        <div style={styles.sitFrame}>
          <div style={styles.ringWrap}>
            <svg width={ringSize} height={ringSize} style={styles.svg}>
              <circle
                cx={ringSize / 2} cy={ringSize / 2}
                r={radius}
                stroke="#E0D5C2"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <circle
                cx={ringSize / 2} cy={ringSize / 2}
                r={radius}
                stroke="#854F0B"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
              />
            </svg>

            <div style={styles.ringCenter}>
              <p style={styles.timeRemaining}>
                {minutesLeft}:{String(secondsLeft).padStart(2, '0')}
              </p>
              <p style={styles.timeLabel}>remaining</p>
            </div>
          </div>

          <div style={styles.promptBox}>
            <p style={styles.promptText}>
              {activePrompt?.text || `Settle in. Notice your breath.`}
            </p>
          </div>

          <div style={styles.controls}>
            <button onClick={togglePlay} style={styles.controlBtn}>
              {isPlaying ? '❚❚ Pause' : '▶ Resume'}
            </button>
            <button onClick={skipToEnd} style={styles.controlBtnSecondary}>
              Skip to end
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: COMPLETE
  // ===================================================================
  if (phase === 'complete') {
    return (
      <div style={styles.container}>
        <div style={styles.completeBlock}>
          <div style={styles.completeIcon}>·</div>
          <h2 style={styles.completeTitle}>The sit is complete.</h2>
          <p style={styles.completeText}>
            Whatever you experienced was correct. The capacity is built through return, not perfection.
          </p>
        </div>

        <div style={styles.footer}>
          <button onClick={restartSit} style={styles.secondaryBtn}>
            Sit again
          </button>
          <button onClick={() => setPhase('naming')} style={styles.primaryBtnFlex}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: NAMING
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>{followUpHeader}</h2>

      <div style={styles.optionList}>
        {followUpOptions.map(opt => {
          const selected = followUp === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setFollowUp(opt.id)}
              style={{
                ...styles.optionCard,
                ...(selected ? styles.optionCardSelected : {}),
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <div style={styles.footer}>
        <button
          onClick={finalize}
          disabled={!followUp || saving}
          style={{
            ...styles.primaryBtn,
            ...((!followUp || saving) ? styles.primaryBtnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { paddingTop: '0.5rem' },
  introBlock: {
    textAlign: 'center',
    padding: '2rem 1rem 1rem',
  },
  lotusGlyph: {
    fontSize: '40px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    margin: '0 0 1.5rem',
    letterSpacing: '0.4em',
  },
  introTitle: {
    fontSize: '28px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 1.25rem',
    lineHeight: 1.25,
  },
  introText: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.7,
    margin: '0 0 1rem',
    maxWidth: '340px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  introTextSmall: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '320px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  sitFrame: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem 0',
  },
  ringWrap: {
    position: 'relative',
    width: 240,
    height: 240,
    marginBottom: '2rem',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  ringCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRemaining: {
    fontSize: '48px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
    margin: 0,
  },
  timeLabel: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    margin: '4px 0 0',
  },
  promptBox: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '14px',
    padding: '18px 20px',
    width: '100%',
    minHeight: '90px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  promptText: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: 0,
    textAlign: 'center',
    transition: 'opacity 0.4s ease',
  },
  controls: {
    display: 'flex',
    gap: '8px',
    width: '100%',
  },
  controlBtn: {
    flex: 1,
    padding: '12px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  controlBtnSecondary: {
    padding: '12px 16px',
    background: 'transparent',
    color: '#854F0B',
    border: 'none',
    fontSize: '12px',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
  },
  completeBlock: {
    textAlign: 'center',
    padding: '2.5rem 1rem',
  },
  completeIcon: {
    fontSize: '40px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    margin: '0 0 1.5rem',
    letterSpacing: '0.4em',
  },
  completeTitle: {
    fontSize: '24px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 1rem',
    lineHeight: 1.3,
  },
  completeText: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: 0,
    maxWidth: '320px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  prompt: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 1rem',
  },
  optionList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  optionCard: {
    padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    fontSize: '14px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer', textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
  },
  optionCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  footer: { marginTop: '1.5rem', display: 'flex', gap: '8px' },
  primaryBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnFlex: {
    flex: 1, padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  secondaryBtn: {
    padding: '14px 18px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
  },
}