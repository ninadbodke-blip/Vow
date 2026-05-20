import { useState, useEffect, useRef } from 'react'

const EXPAND_MS = 4000
const CONTRACT_MS = 4500
const TOTAL_CYCLES = 3
const COMPLETION_DELAY_MS = 800

export default function ReclaimBreathCircle({ onComplete, saving }) {
  // phase: 'idle' | 'expand' | 'contract' | 'done'
  const [phase, setPhase] = useState('idle')
  const [cycle, setCycle] = useState(0)
  const startTime = useRef(null)

  const start = () => {
    startTime.current = Date.now()
    setCycle(0)
    setPhase('expand')
  }

  useEffect(() => {
    let timer
    if (phase === 'expand') {
      timer = setTimeout(() => setPhase('contract'), EXPAND_MS)
    } else if (phase === 'contract') {
      timer = setTimeout(() => {
        const next = cycle + 1
        if (next >= TOTAL_CYCLES) {
          setPhase('done')
        } else {
          setCycle(next)
          setPhase('expand')
        }
      }, CONTRACT_MS)
    } else if (phase === 'done') {
      timer = setTimeout(() => {
        onComplete({
          cycles_completed: TOTAL_CYCLES,
          duration_ms: Date.now() - (startTime.current || Date.now()),
        })
      }, COMPLETION_DELAY_MS)
    }
    return () => clearTimeout(timer)
  }, [phase, cycle, onComplete])

  if (phase === 'idle') {
    return (
      <div style={styles.container}>
        <p style={styles.idleInstruction}>
          Place a hand on your chest. Breathe with the circle for three breaths.
        </p>
        <div style={styles.idleCircle}></div>
        <button onClick={start} disabled={saving} style={styles.beginBtn}>
          Begin
        </button>
      </div>
    )
  }

  const isExpanding = phase === 'expand'
  const scale = isExpanding ? 1.6 : 0.7
  const transitionMs = isExpanding ? EXPAND_MS : CONTRACT_MS
  const phaseText =
    phase === 'expand' ? 'Breathe in' :
    phase === 'contract' ? 'Breathe out' :
    ''

  return (
    <div style={styles.container}>
      <p style={styles.cycleLabel}>
        {phase === 'done' ? '' : `Breath ${cycle + 1} of ${TOTAL_CYCLES}`}
      </p>
      <div style={styles.circleStage}>
        <div
          style={{
            ...styles.activeCircle,
            transform: `scale(${scale})`,
            transition: `transform ${transitionMs}ms ease-in-out`,
          }}
        ></div>
      </div>
      <p style={styles.phaseLabel}>{phaseText}</p>
    </div>
  )
}

const CIRCLE_BASE_SIZE = 90

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.25rem',
    width: '100%',
    paddingTop: '0.5rem',
  },
  idleInstruction: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.6,
    maxWidth: '320px',
  },
  idleCircle: {
    width: `${CIRCLE_BASE_SIZE}px`,
    height: `${CIRCLE_BASE_SIZE}px`,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(197,87,44,0.25) 0%, rgba(197,87,44,0.10) 70%, rgba(197,87,44,0) 100%)',
    margin: '1rem 0',
  },
  beginBtn: {
    padding: '14px 36px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  cycleLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    margin: 0,
    minHeight: '14px',
  },
  circleStage: {
    width: '260px',
    height: '260px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    width: `${CIRCLE_BASE_SIZE}px`,
    height: `${CIRCLE_BASE_SIZE}px`,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(197,87,44,0.45) 0%, rgba(197,87,44,0.20) 60%, rgba(197,87,44,0) 100%)',
  },
  phaseLabel: {
    fontSize: '15px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    minHeight: '20px',
  },
}