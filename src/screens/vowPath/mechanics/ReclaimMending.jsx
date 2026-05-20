import { useState, useRef, useEffect } from 'react'

const VIEW_W = 320
const VIEW_H = 200
const LINE_Y = 100
const LINE_X_START = 20
const LINE_X_END = 300
const GAP_X_START = 130
const GAP_X_END = 190
const GAP_WIDTH = GAP_X_END - GAP_X_START
const NUM_CELLS = 30
const CELL_W = GAP_WIDTH / NUM_CELLS
const VERTICAL_TOLERANCE = 30
const COMPLETION_RATIO = 0.85
const FORWARD_REGION_X_MIN = GAP_X_END + 30

export default function ReclaimMending({ existingData, onSave, saving }) {
  const hasExisting = !!(existingData?.mending?.mending_completed && existingData?.forward_mark)
  const [stage, setStage] = useState(hasExisting ? 'review' : 'mending')
  const [filledCells, setFilledCells] = useState(new Set())
  const [forwardMark, setForwardMark] = useState(existingData?.forward_mark || null)
  const [isDragging, setIsDragging] = useState(false)
  const svgRef = useRef(null)
  const startTimeRef = useRef(Date.now())
  const mendStartRef = useRef(null)
  const mendEndRef = useRef(null)

  const clientToSvg = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * VIEW_W,
      y: ((clientY - rect.top) / rect.height) * VIEW_H,
    }
  }

  const fillCell = (x, y) => {
    if (Math.abs(y - LINE_Y) > VERTICAL_TOLERANCE) return
    if (x < GAP_X_START || x > GAP_X_END) return
    const idx = Math.floor((x - GAP_X_START) / CELL_W)
    if (idx < 0 || idx >= NUM_CELLS) return
    setFilledCells(prev => {
      if (prev.has(idx)) return prev
      const next = new Set(prev)
      next.add(idx)
      return next
    })
  }

  const handlePointerDown = (e) => {
    if (stage !== 'mending' || !svgRef.current) return
    const { x, y } = clientToSvg(e.clientX, e.clientY)
    if (Math.abs(y - LINE_Y) > VERTICAL_TOLERANCE) return
    if (x < GAP_X_START - 15 || x > GAP_X_END + 15) return
    if (!mendStartRef.current) mendStartRef.current = Date.now()
    setIsDragging(true)
    fillCell(x, y)
    try { svgRef.current.setPointerCapture(e.pointerId) } catch {}
  }

  const handlePointerMove = (e) => {
    if (!isDragging || stage !== 'mending') return
    const { x, y } = clientToSvg(e.clientX, e.clientY)
    fillCell(x, y)
  }

  const handlePointerUp = (e) => {
    if (!isDragging) return
    setIsDragging(false)
    try { if (svgRef.current) svgRef.current.releasePointerCapture(e.pointerId) } catch {}
  }

  // Transition to forward stage when gap is sufficiently filled
  useEffect(() => {
    if (stage !== 'mending') return
    if (filledCells.size >= NUM_CELLS * COMPLETION_RATIO) {
      mendEndRef.current = Date.now()
      const t = setTimeout(() => setStage('forward'), 900)
      return () => clearTimeout(t)
    }
  }, [filledCells, stage])

  const handleForwardTap = (e) => {
    if (stage !== 'forward' || !svgRef.current || forwardMark) return
    const { x, y } = clientToSvg(e.clientX, e.clientY)
    if (x < FORWARD_REGION_X_MIN) return
    setForwardMark({ x, y, timestamp: Date.now() })
  }

  // Auto-save when forward mark placed
  useEffect(() => {
    if (stage !== 'forward' || !forwardMark) return
    const t = setTimeout(() => {
      onSave({
        mending: {
          mending_completed: true,
          drag_duration_ms: mendEndRef.current && mendStartRef.current
            ? mendEndRef.current - mendStartRef.current
            : 0,
          cells_filled: filledCells.size,
        },
        forward_mark: forwardMark,
        timestamp_started: new Date(startTimeRef.current).toISOString(),
        timestamp_completed: new Date().toISOString(),
        total_duration_ms: Date.now() - startTimeRef.current,
      })
    }, 1200)
    return () => clearTimeout(t)
  }, [forwardMark, stage])

  const handleReviewContinue = () => {
    onSave(existingData)
  }

  if (stage === 'review') {
    return (
      <div style={styles.container}>
        <div style={styles.reviewBox}>
          <p style={styles.reviewLabel}>Day 4 · Completed</p>
          <p style={styles.reviewBody}>
            The line is whole. The slip is part of it.
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

  const mendingComplete = filledCells.size >= NUM_CELLS * COMPLETION_RATIO

  const instructionText = (() => {
    if (stage === 'mending' && filledCells.size === 0) return 'Drag your finger across the gap. Slowly.'
    if (stage === 'mending' && !mendingComplete) return 'Keep going. Cross the gap.'
    if (stage === 'mending' && mendingComplete) return 'The line is whole.'
    if (stage === 'forward' && !forwardMark) return 'One more. Tap once at the far right end of the line.'
    if (forwardMark) return 'The slip is part of the path, not the end of it.'
    return ''
  })()

  // Build the mended overlay path from filled cells (continuous span min→max)
  let mendStart = null, mendEnd = null
  if (filledCells.size > 0) {
    const arr = [...filledCells].sort((a, b) => a - b)
    mendStart = GAP_X_START + arr[0] * CELL_W
    mendEnd = GAP_X_START + (arr[arr.length - 1] + 1) * CELL_W
  }

  return (
    <div style={styles.container}>
      <p style={styles.stepLabel}>
        {stage === 'forward' ? 'Act 2 · Forward' : 'Act 1 · Mending'}
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={styles.svg}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleForwardTap}
      >
        {/* Left half of line */}
        <line
          x1={LINE_X_START}
          y1={LINE_Y}
          x2={GAP_X_START}
          y2={LINE_Y}
          stroke="#C5572C"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Right half of line */}
        <line
          x1={GAP_X_END}
          y1={LINE_Y}
          x2={LINE_X_END}
          y2={LINE_Y}
          stroke="#C5572C"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Gap guide (subtle dashed) — fades when mended */}
        {!mendingComplete && (
          <line
            x1={GAP_X_START}
            y1={LINE_Y}
            x2={GAP_X_END}
            y2={LINE_Y}
            stroke="#D8CFC0"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}

        {/* Mended overlay — slightly lighter shade */}
        {mendStart != null && (
          <line
            x1={mendStart}
            y1={LINE_Y}
            x2={mendEnd}
            y2={LINE_Y}
            stroke="#E8A175"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {/* "today" label — fades after mending */}
        <text
          x={(GAP_X_START + GAP_X_END) / 2}
          y={LINE_Y - 16}
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fontSize="11"
          fill="#854F0B"
          opacity={mendingComplete ? 0.4 : 1}
          style={{ pointerEvents: 'none', transition: 'opacity 0.6s ease-out' }}
        >
          today
        </text>

        {/* Subtle marker on mended section after completion */}
        {mendingComplete && (
          <circle
            cx={(GAP_X_START + GAP_X_END) / 2}
            cy={LINE_Y}
            r="2"
            fill="#854F0B"
            opacity="0.6"
          />
        )}

        {/* Forward mark */}
        {forwardMark && (
          <g style={{ pointerEvents: 'none' }}>
            <circle cx={forwardMark.x} cy={forwardMark.y} r="5" fill="#C5572C" />
            <text
              x={forwardMark.x}
              y={forwardMark.y - 12}
              textAnchor="middle"
              fontFamily="Georgia, serif"
              fontStyle="italic"
              fontSize="11"
              fill="#854F0B"
            >
              next
            </text>
          </g>
        )}
      </svg>

      <p style={styles.instruction}>{instructionText}</p>
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
    touchAction: 'none',
    userSelect: 'none',
    cursor: 'crosshair',
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
    margin: 0,
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