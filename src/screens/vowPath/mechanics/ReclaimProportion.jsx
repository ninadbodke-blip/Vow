import { useState, useRef, useEffect } from 'react'

const VIEW_W = 320
const VIEW_H = 380
const TODAY_X = VIEW_W / 2
const TODAY_Y = VIEW_H / 2
const MIN_DOTS_BEFORE_DONE = 5
const TODAY_KEEPOUT_RADIUS = 22  // don't place dots inside this radius of "today"

export default function ReclaimProportion({ existingData, onSave, saving }) {
  const hasExisting = !!(existingData?.proportion?.dot_positions && existingData?.tomorrow_position)
  const [stage, setStage] = useState(hasExisting ? 'review' : 'proportion')
  const [dots, setDots] = useState(existingData?.proportion?.dot_positions || [])
  const [tomorrow, setTomorrow] = useState(existingData?.tomorrow_position || null)
  const svgRef = useRef(null)
  const startTimeRef = useRef(Date.now())
  const [autoSaving, setAutoSaving] = useState(false)

  const clientToSvg = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * VIEW_W,
      y: ((clientY - rect.top) / rect.height) * VIEW_H,
    }
  }

  const handleSvgClick = (e) => {
    if (!svgRef.current) return
    const { x, y } = clientToSvg(e.clientX, e.clientY)

    if (stage === 'proportion') {
      const dx = x - TODAY_X
      const dy = y - TODAY_Y
      if (dx * dx + dy * dy < TODAY_KEEPOUT_RADIUS * TODAY_KEEPOUT_RADIUS) return
      setDots(prev => [...prev, { x, y, timestamp: Date.now() }])
      return
    }

    if (stage === 'tomorrow' && !tomorrow) {
      setTomorrow({ x, y })
      setStage('done')
    }
  }

  // When tomorrow placed, briefly show full constellation, then save
  useEffect(() => {
    if (stage !== 'done' || autoSaving) return
    setAutoSaving(true)
    const t = setTimeout(() => {
      onSave({
        proportion: {
          dots_placed: dots.length,
          dot_positions: dots,
        },
        tomorrow_position: tomorrow,
        timestamp_started: new Date(startTimeRef.current).toISOString(),
        timestamp_completed: new Date().toISOString(),
        total_duration_ms: Date.now() - startTimeRef.current,
      })
    }, 1400)
    return () => clearTimeout(t)
  }, [stage])

  const handleReviewContinue = () => {
    onSave(existingData)
  }

  const handleProceedToTomorrow = () => {
    setStage('tomorrow')
  }

  // Today dot shrinks slightly as more dots accumulate (visual reframe)
  const todayRadius = Math.max(10, 18 - dots.length * 0.4)

  const instructionText = (() => {
    if (stage === 'proportion' && dots.length === 0) return 'Today feels like everything right now. Tap anywhere to add the other days around it.'
    if (stage === 'proportion' && dots.length < MIN_DOTS_BEFORE_DONE) return `Keep going. ${MIN_DOTS_BEFORE_DONE - dots.length} more to see it.`
    if (stage === 'proportion') return 'Tap more if you want. Or tap Done.'
    if (stage === 'tomorrow') return 'One more mark — for tomorrow. Tap once anywhere outside what you\'ve placed.'
    if (stage === 'done') return 'Today is one. Tomorrow is on the map.'
    return ''
  })()

  if (stage === 'review') {
    return (
      <div style={styles.container}>
        <div style={styles.reviewBox}>
          <p style={styles.reviewLabel}>Day 2 · Completed</p>
          <p style={styles.reviewBody}>
            You placed today in proportion. You marked tomorrow on the map.
          </p>
          <p style={styles.reviewMeta}>
            {existingData?.proportion?.dots_placed || 0} dots placed
          </p>
        </div>
        <button
          onClick={handleReviewContinue}
          disabled={saving}
          style={{
            ...styles.continueBtn,
            ...(saving ? styles.btnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <p style={styles.stepLabel}>
        {stage === 'tomorrow' ? 'Act 2 · Tomorrow' : 'Act 1 · Proportion'}
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={styles.svg}
        onClick={handleSvgClick}
      >
        {/* Scattered "other days" dots */}
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r="3.5"
            fill="#9C8C78"
            opacity="0.7"
          />
        ))}

        {/* Today dot */}
        <circle cx={TODAY_X} cy={TODAY_Y} r={todayRadius} fill="#C5572C" />
        <text
          x={TODAY_X}
          y={TODAY_Y - todayRadius - 10}
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fontSize="12"
          fill="#854F0B"
          style={{ pointerEvents: 'none' }}
        >
          Today
        </text>

        {/* Tomorrow mark */}
        {tomorrow && (
          <g style={{ pointerEvents: 'none' }}>
            <circle cx={tomorrow.x} cy={tomorrow.y} r="6" fill="#E8A175" />
            <text
              x={tomorrow.x}
              y={tomorrow.y - 14}
              textAnchor="middle"
              fontFamily="Georgia, serif"
              fontStyle="italic"
              fontSize="11"
              fill="#854F0B"
            >
              Tomorrow
            </text>
          </g>
        )}
      </svg>

      <p style={styles.instruction}>{instructionText}</p>

      {stage === 'proportion' && dots.length >= MIN_DOTS_BEFORE_DONE && (
        <button onClick={handleProceedToTomorrow} style={styles.primaryBtn}>
          Done
        </button>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    alignItems: 'center',
    paddingBottom: '1rem',
    width: '100%',
  },
  stepLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    margin: '0 0 0.25rem',
    alignSelf: 'flex-start',
  },
  svg: {
    width: '100%',
    maxWidth: '320px',
    aspectRatio: `${VIEW_W} / ${VIEW_H}`,
    background: '#FDFBF6',
    borderRadius: '20px',
    border: '0.5px solid #EFE7D7',
    cursor: 'crosshair',
    touchAction: 'manipulation',
    userSelect: 'none',
  },
  instruction: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.5,
    maxWidth: '320px',
    minHeight: '40px',
  },
  primaryBtn: {
    padding: '12px 32px',
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
  reviewBox: {
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '16px',
    padding: '1.5rem 1.25rem',
    textAlign: 'center',
    width: '100%',
  },
  reviewLabel: {
    fontSize: '10px',
    color: '#3B6D11',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    margin: '0 0 1rem',
  },
  reviewBody: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1rem',
  },
  reviewMeta: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    letterSpacing: '0.04em',
  },
  continueBtn: {
    width: '100%',
    padding: '16px',
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
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}