import { useState, useRef } from 'react'

// "Mending." A slip feels like it cut the line in two. Here the day you slipped
// floats LOOSE above the line; you drag it back down and it snaps into place —
// the line was whole all along. One forgiving gesture, then Continue.
const VIEW_W = 320
const VIEW_H = 200
const LINE_Y = 120
const LINE_X1 = 24
const LINE_X2 = 296
const TARGET = { x: 168, y: 120 }
const START = { x: 168, y: 46 }
const PAST_BEADS = [56, 96, 136, 208, 248, 288]
const SNAP_DIST = 32
const GRAB_R = 28

export default function ReclaimMending({ existingData, onSave, saving }) {
  const hasExisting = !!(existingData && (existingData.mended || (existingData.mending && existingData.mending.mending_completed)))
  const [placed, setPlaced] = useState(hasExisting)
  const [pos, setPos] = useState(hasExisting ? { ...TARGET } : { ...START })
  const [dragging, setDragging] = useState(false)
  const svgRef = useRef(null)
  const startTimeRef = useRef(Date.now())

  const clientToSvg = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * VIEW_W,
      y: ((clientY - rect.top) / rect.height) * VIEW_H,
    }
  }

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

  const settleHome = () => {
    setPos({ ...TARGET })
    setPlaced(true)
    setDragging(false)
  }

  const onDown = (e) => {
    if (placed || !svgRef.current) return
    const p = clientToSvg(e.clientX, e.clientY)
    if (dist(p, pos) > GRAB_R) return
    setDragging(true)
    try { svgRef.current.setPointerCapture(e.pointerId) } catch (err) {}
  }

  const onMove = (e) => {
    if (!dragging || placed) return
    const p = clientToSvg(e.clientX, e.clientY)
    const np = { x: clamp(p.x, 14, VIEW_W - 14), y: clamp(p.y, 14, VIEW_H - 14) }
    if (dist(np, TARGET) < SNAP_DIST) {
      try { svgRef.current.releasePointerCapture(e.pointerId) } catch (err) {}
      settleHome()
      return
    }
    setPos(np)
  }

  const onUp = (e) => {
    if (!dragging) return
    try { if (svgRef.current) svgRef.current.releasePointerCapture(e.pointerId) } catch (err) {}
    if (placed) { setDragging(false); return }
    if (dist(pos, TARGET) < SNAP_DIST) {
      settleHome()
    } else {
      // Not close enough — drift gently back to the start so they can try again.
      setDragging(false)
      setPos({ ...START })
    }
  }

  const handleComplete = () => {
    if (saving) return
    onSave({
      mended: true,
      placed: true,
      total_duration_ms: Date.now() - startTimeRef.current,
      timestamp_completed: new Date().toISOString(),
    })
  }

  const instruction = placed
    ? 'The line runs straight through it. Nothing was broken.'
    : (dragging ? 'Bring it down to its place on the line.' : 'One day has come loose. Drag it back onto the line.')

  return (
    <div style={styles.container}>
      <p style={styles.stepLabel}>{placed ? 'Whole' : 'Mending'}</p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={styles.svg}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
      >
        {/* soft glow under the line once it's whole */}
        {placed && (
          <line x1={LINE_X1} y1={LINE_Y} x2={LINE_X2} y2={LINE_Y}
            stroke="#E8A175" strokeWidth="9" strokeLinecap="round" opacity="0.22"
            style={{ transition: 'opacity 0.6s ease-out' }} />
        )}

        {/* the continuous line */}
        <line x1={LINE_X1} y1={LINE_Y} x2={LINE_X2} y2={LINE_Y}
          stroke="#C5572C" strokeWidth="3" strokeLinecap="round" />

        {/* the days already on the line */}
        {PAST_BEADS.map((x, i) => (
          <circle key={i} cx={x} cy={LINE_Y} r="3.5" fill="#C5572C" opacity="0.7" />
        ))}

        {/* the empty slot waiting for today */}
        {!placed && (
          <circle cx={TARGET.x} cy={TARGET.y} r="9" fill="none"
            stroke="#C9A36A" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.9" />
        )}

        {/* faint guide showing where the loose day belongs */}
        {!placed && !dragging && (
          <line x1={START.x} y1={START.y + 13} x2={TARGET.x} y2={TARGET.y - 13}
            stroke="#D8CFC0" strokeWidth="1" strokeDasharray="2 4" opacity="0.7"
            style={{ pointerEvents: 'none' }} />
        )}

        {/* the loose "today" bead */}
        <g
          transform={`translate(${pos.x}, ${pos.y})`}
          style={{
            transition: dragging ? 'none' : 'transform 0.34s cubic-bezier(0.2,0.7,0.2,1)',
            cursor: placed ? 'default' : 'grab',
          }}
        >
          {placed && <circle r="13" fill="#E8A175" opacity="0.35" />}
          <circle r="9" fill="#D9B57A" stroke="#241710" strokeWidth="1.5" />
          <text x="0" y={placed ? 30 : -16} textAnchor="middle"
            fontFamily="Georgia, serif" fontStyle="italic" fontSize="11" fill="#854F0B"
            style={{ pointerEvents: 'none' }}>today</text>
        </g>
      </svg>

      <p style={styles.instruction}>{instruction}</p>

      {placed && (
        <button
          onClick={handleComplete}
          disabled={saving}
          style={{ ...styles.continueBtn, ...(saving ? styles.btnDisabled : {}) }}
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>
      )}
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '0.85rem', alignItems: 'center', paddingBottom: '1rem', width: '100%' },
  stepLabel: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, margin: '0 0 0.25rem', alignSelf: 'flex-start' },
  svg: {
    width: '100%', maxWidth: '320px', aspectRatio: `${VIEW_W} / ${VIEW_H}`,
    background: '#FDFBF6', borderRadius: '20px', border: '0.5px solid #EFE7D7',
    touchAction: 'none', userSelect: 'none', cursor: 'grab',
  },
  instruction: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: 0, lineHeight: 1.5, maxWidth: '320px', minHeight: '40px' },
  continueBtn: {
    width: '100%', padding: '16px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500,
    cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
}