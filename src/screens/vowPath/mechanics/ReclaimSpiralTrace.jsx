import { useRef, useState, useEffect, useMemo } from 'react'

// Spiral geometry constants
const VIEW = 300
const CENTER = VIEW / 2
const INNER_R = 10
const OUTER_R = 125
const TURNS = 3
const NUM_POINTS = 280

// Tracking tolerances
const TOLERANCE = 25              // viewBox units; how far off the path is acceptable
const COMPLETION_THRESHOLD = 0.96 // t value at which we count as "reached center"
const ENGAGEMENT_WINDOW = 0.10    // how close finger must be to maxT to engage on touchdown

export default function ReclaimSpiralTrace({ onComplete }) {
  const svgRef = useRef(null)
  const startTime = useRef(null)
  const [maxT, setMaxT] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [pauseCount, setPauseCount] = useState(0)
  const [done, setDone] = useState(false)

  // Pre-generate spiral points once
  const points = useMemo(() => generateSpiralPoints(), [])
  const fullPath = useMemo(() => pointsToPath(points), [points])
  const startPoint = points[0]

  // Emit onComplete when threshold crossed
  useEffect(() => {
    if (done) return
    if (maxT >= COMPLETION_THRESHOLD) {
      setDone(true)
      const duration_ms = startTime.current ? Date.now() - startTime.current : 0
      onComplete({
        trace_completeness: Math.round(Math.min(maxT, 1) * 100),
        pause_count: pauseCount,
        duration_ms,
      })
    }
  }, [maxT, done, pauseCount, onComplete])

  const handlePointerDown = (e) => {
    if (done || !svgRef.current) return
    const { x, y } = clientToSvg(e.clientX, e.clientY, svgRef.current)
    const { point: closest, distance } = closestPoint(x, y, points)
    if (distance > TOLERANCE) return
    if (Math.abs(closest.t - maxT) > ENGAGEMENT_WINDOW) return

    setIsDragging(true)
    if (!startTime.current) startTime.current = Date.now()
    if (closest.t > maxT) setMaxT(closest.t)

    try {
      svgRef.current.setPointerCapture(e.pointerId)
    } catch (err) {}
  }

  const handlePointerMove = (e) => {
    if (!isDragging || done || !svgRef.current) return
    const { x, y } = clientToSvg(e.clientX, e.clientY, svgRef.current)
    const { point: closest, distance } = closestPoint(x, y, points)
    if (distance > TOLERANCE) return // off-path: pause progress but don't reset
    if (closest.t > maxT) setMaxT(closest.t)
  }

  const handlePointerUp = (e) => {
    if (!isDragging) return
    setIsDragging(false)
    if (maxT < COMPLETION_THRESHOLD) {
      setPauseCount(p => p + 1)
    }
    try {
      if (svgRef.current) svgRef.current.releasePointerCapture(e.pointerId)
    } catch (err) {}
  }

  // Compute the currently-filled portion of the spiral
  const filledEndIdx = Math.ceil(maxT * points.length)
  const filledPoints = points.slice(0, filledEndIdx + 1)
  const filledPath = pointsToPath(filledPoints)

  const instructionText = (() => {
    if (done) return 'You\'re at the center.'
    if (isDragging) return 'Keep going. Slowly.'
    if (maxT === 0) return 'Trace the spiral from the outer dot to the center. Slowly.'
    return 'Touch the spiral again to continue.'
  })()

  return (
    <div style={styles.container}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        style={styles.svg}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Full spiral background */}
        <path
          d={fullPath}
          fill="none"
          stroke="#D8CFC0"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Filled (traced) portion */}
        {maxT > 0 && (
          <path
            d={filledPath}
            fill="none"
            stroke="#C5572C"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Pulsing start dot (visible until engaged) */}
        {maxT < 0.02 && (
          <circle cx={startPoint.x} cy={startPoint.y} r="8" fill="#C5572C" opacity="0.25">
            <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
        <circle cx={startPoint.x} cy={startPoint.y} r="5" fill="#C5572C" />

        {/* Center marker on completion */}
        {done && (
          <g>
            <circle cx={CENTER} cy={CENTER} r="12" fill="#C5572C" opacity="0.15" />
            <circle cx={CENTER} cy={CENTER} r="5" fill="#C5572C" />
          </g>
        )}
      </svg>

      <p style={styles.instruction}>{instructionText}</p>
    </div>
  )
}

// ---------- helpers ----------

function generateSpiralPoints() {
  const points = []
  const thetaMax = TURNS * 2 * Math.PI
  const b = (OUTER_R - INNER_R) / thetaMax
  // t=0 corresponds to outer end (theta = thetaMax),
  // t=1 corresponds to center (theta = 0)
  for (let i = 0; i < NUM_POINTS; i++) {
    const t = i / (NUM_POINTS - 1)
    const theta = (1 - t) * thetaMax
    const r = INNER_R + b * theta
    const x = CENTER + r * Math.cos(theta)
    const y = CENTER + r * Math.sin(theta)
    points.push({ x, y, t })
  }
  return points
}

function pointsToPath(points) {
  if (points.length === 0) return ''
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`
  }
  return d
}

function clientToSvg(clientX, clientY, svgEl) {
  const rect = svgEl.getBoundingClientRect()
  return {
    x: ((clientX - rect.left) / rect.width) * VIEW,
    y: ((clientY - rect.top) / rect.height) * VIEW,
  }
}

function closestPoint(svgX, svgY, points) {
  let bestI = 0
  let bestD2 = Infinity
  for (let i = 0; i < points.length; i++) {
    const dx = points[i].x - svgX
    const dy = points[i].y - svgY
    const d2 = dx * dx + dy * dy
    if (d2 < bestD2) {
      bestD2 = d2
      bestI = i
    }
  }
  return {
    point: points[bestI],
    distance: Math.sqrt(bestD2),
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
  },
  svg: {
    width: '100%',
    maxWidth: '320px',
    aspectRatio: '1 / 1',
    touchAction: 'none',
    userSelect: 'none',
    background: '#FDFBF6',
    borderRadius: '20px',
    border: '0.5px solid #EFE7D7',
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
  },
}