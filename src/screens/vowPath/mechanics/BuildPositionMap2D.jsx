import { useRef } from 'react'

// Map area lives inside the SVG viewBox 0..300, with 10px padding
// so labels can render outside the active tap region (10..290).
const VIEW = 300
const PAD = 10
const HALF = (VIEW - 2 * PAD) / 2   // 140 — half-extent in SVG units

export default function BuildPositionMap2D({
  value,
  onChange,
  isWritable = true,
  axisX,
  axisY,
  ghosts = [],
}) {
  const svgRef = useRef(null)

  const handleTap = (evt) => {
    if (!isWritable) return
    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const clientX = evt.changedTouches
      ? evt.changedTouches[0].clientX
      : evt.clientX
    const clientY = evt.changedTouches
      ? evt.changedTouches[0].clientY
      : evt.clientY

    const relX = clientX - rect.left
    const relY = clientY - rect.top

    // Convert client coords to SVG viewBox coords
    const svgX = (relX / rect.width) * VIEW
    const svgY = (relY / rect.height) * VIEW

    // Clamp inside the active map area
    const cX = Math.max(PAD, Math.min(VIEW - PAD, svgX))
    const cY = Math.max(PAD, Math.min(VIEW - PAD, svgY))

    // Normalize to -1..1 (y inverted so "top" is positive)
    const xNorm = (cX - VIEW / 2) / HALF
    const yNorm = -((cY - VIEW / 2) / HALF)

    onChange({
      x: Math.max(-1, Math.min(1, xNorm)),
      y: Math.max(-1, Math.min(1, yNorm)),
    })
  }

  // Render marker from saved value, converting back to SVG coords
  const markerX = value ? value.x * HALF + VIEW / 2 : null
  const markerY = value ? -value.y * HALF + VIEW / 2 : null

  return (
    <div style={styles.container}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        style={{
          ...styles.map,
          cursor: isWritable ? 'crosshair' : 'default',
        }}
        onClick={handleTap}
        onTouchEnd={handleTap}
      >
        {/* Background frame */}
        <rect
          x={PAD} y={PAD}
          width={VIEW - 2 * PAD} height={VIEW - 2 * PAD}
          rx="14"
          fill="#FAF7F1"
          stroke="#E8DFD0"
          strokeWidth="1"
        />

        {/* Crosshair grid */}
        <line
          x1={VIEW / 2} y1={PAD} x2={VIEW / 2} y2={VIEW - PAD}
          stroke="#E8DFD0" strokeWidth="0.5"
        />
        <line
          x1={PAD} y1={VIEW / 2} x2={VIEW - PAD} y2={VIEW / 2}
          stroke="#E8DFD0" strokeWidth="0.5"
        />

        {/* Diagonals — subtle visual depth */}
        <line
          x1={PAD} y1={PAD} x2={VIEW - PAD} y2={VIEW - PAD}
          stroke="#EFE7D7" strokeWidth="0.5" strokeDasharray="2 4"
        />
        <line
          x1={VIEW - PAD} y1={PAD} x2={PAD} y2={VIEW - PAD}
          stroke="#EFE7D7" strokeWidth="0.5" strokeDasharray="2 4"
        />

        {/* Axis labels (top / bottom / left / right) */}
        <text
          x={VIEW / 2} y={PAD + 12} textAnchor="middle"
          fontFamily="Georgia, serif" fontStyle="italic"
          fontSize="11" fill="#854F0B"
          style={{ pointerEvents: 'none' }}
        >
          {axisY?.top}
        </text>
        <text
          x={VIEW / 2} y={VIEW - PAD - 5} textAnchor="middle"
          fontFamily="Georgia, serif" fontStyle="italic"
          fontSize="11" fill="#854F0B"
          style={{ pointerEvents: 'none' }}
        >
          {axisY?.bottom}
        </text>
        <text
          x={PAD + 8} y={VIEW / 2 + 4} textAnchor="start"
          fontFamily="Georgia, serif" fontStyle="italic"
          fontSize="11" fill="#854F0B"
          style={{ pointerEvents: 'none' }}
        >
          {axisX?.left}
        </text>
        <text
          x={VIEW - PAD - 8} y={VIEW / 2 + 4} textAnchor="end"
          fontFamily="Georgia, serif" fontStyle="italic"
          fontSize="11" fill="#854F0B"
          style={{ pointerEvents: 'none' }}
        >
          {axisX?.right}
        </text>

        {/* Ghost markers from prior entries — dashed muted circles + "Week N" label */}
        {ghosts.map((ghost) => {
          const gx = ghost.x * HALF + VIEW / 2
          const gy = -ghost.y * HALF + VIEW / 2
          return (
            <g key={`ghost-${ghost.day}`} style={{ pointerEvents: 'none' }}>
              <circle
                cx={gx} cy={gy} r="9"
                fill="none"
                stroke="#9C8C78"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.7"
              />
              <circle
                cx={gx} cy={gy} r="2"
                fill="#9C8C78"
                opacity="0.6"
              />
              <text
                x={gx} y={gy - 13}
                textAnchor="middle"
                fontFamily="Georgia, serif"
                fontStyle="italic"
                fontSize="9"
                fill="#9C8C78"
                opacity="0.85"
              >
                Week {ghost.day}
              </text>
            </g>
          )
        })}

        {/* Active marker */}
        {value && (
          <g style={{ pointerEvents: 'none' }}>
            <circle
              cx={markerX} cy={markerY} r="16"
              fill="rgba(197,87,44,0.15)"
            />
            <circle
              cx={markerX} cy={markerY} r="8"
              fill="#C5572C"
              stroke="#FAF7F1"
              strokeWidth="2"
            />
          </g>
        )}

        {/* Tap hint when no value yet — suppressed if ghosts are present
            (the ghost itself signals the map is interactive). */}
        {!value && ghosts.length === 0 && (
          <text
            x={VIEW / 2} y={VIEW / 2 + 4} textAnchor="middle"
            fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="12" fill="#9C8C78"
            style={{ pointerEvents: 'none' }}
          >
            Tap to mark
          </text>
        )}
      </svg>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  map: {
    width: '100%',
    maxWidth: '300px',
    aspectRatio: '1 / 1',
    touchAction: 'none',
    userSelect: 'none',
  },
}