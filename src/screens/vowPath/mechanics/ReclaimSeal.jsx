import { useState, useRef, useEffect } from 'react'

// "Set the day down." Lower today (a small light) into the still water and let
// it sink. The day closes so it doesn't bleed into tomorrow.
const VIEW_W = 320
const VIEW_H = 230
const START = { x: 160, y: 52 }
const SINK = { x: 160, y: 214 }
const WATER_Y = 188
const SINK_TRIGGER_Y = 166

export default function ReclaimSeal({ existingData, onSave, saving }) {
  const done0 = !!(existingData && existingData.sealed)
  const [sealed, setSealed] = useState(done0)
  const [pos, setPos] = useState(done0 ? { ...SINK } : { ...START })
  const [dragging, setDragging] = useState(false)
  const [ripple, setRipple] = useState(done0)
  const svgRef = useRef(null)

  const toSvg = (cx, cy) => {
    const r = svgRef.current.getBoundingClientRect()
    return { x: ((cx - r.left) / r.width) * VIEW_W, y: ((cy - r.top) / r.height) * VIEW_H }
  }

  useEffect(() => {
    if (!sealed) return
    const t = setTimeout(() => setRipple(true), 60)
    return () => clearTimeout(t)
  }, [sealed])

  const onDown = (e) => {
    if (sealed || !svgRef.current) return
    const p = toSvg(e.clientX, e.clientY)
    if (Math.hypot(p.x - pos.x, p.y - pos.y) > 30) return
    setDragging(true)
    try { svgRef.current.setPointerCapture(e.pointerId) } catch (err) {}
  }

  const onMove = (e) => {
    if (!dragging || sealed) return
    const p = toSvg(e.clientX, e.clientY)
    setPos({ x: Math.max(16, Math.min(VIEW_W - 16, p.x)), y: Math.max(16, Math.min(VIEW_H - 8, p.y)) })
  }

  const onUp = (e) => {
    if (!dragging) return
    try { if (svgRef.current) svgRef.current.releasePointerCapture(e.pointerId) } catch (err) {}
    setDragging(false)
    if (pos.y >= SINK_TRIGGER_Y) {
      setPos({ ...SINK })
      setSealed(true)
    } else {
      setPos({ ...START })
    }
  }

  const complete = () => { if (!saving) onSave({ sealed: true }) }

  return (
    <div style={S.wrap}>
      <p style={S.stepLabel}>{sealed ? 'Closed' : 'Set it down'}</p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={S.svg}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
      >
        {/* still water */}
        <defs>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E7EDE8" />
            <stop offset="100%" stopColor="#DCE5E0" />
          </linearGradient>
        </defs>
        <rect x="0" y={WATER_Y} width={VIEW_W} height={VIEW_H - WATER_Y} fill="url(#water)" />
        <line x1="0" y1={WATER_Y} x2={VIEW_W} y2={WATER_Y} stroke="#CBD6CE" strokeWidth="1" />
        <ellipse cx="100" cy={WATER_Y + 14} rx="46" ry="4" fill="none" stroke="#CBD6CE" strokeWidth="0.75" opacity="0.6" />
        <ellipse cx="225" cy={WATER_Y + 22} rx="40" ry="3.5" fill="none" stroke="#CBD6CE" strokeWidth="0.75" opacity="0.45" />

        {/* ripple where today entered */}
        <g style={{
          transformOrigin: `${SINK.x}px ${WATER_Y}px`,
          transform: ripple ? 'scale(1.7)' : 'scale(0.3)',
          opacity: ripple ? 0 : 0.55,
          transition: 'transform 1.2s ease-out, opacity 1.2s ease-out',
          pointerEvents: 'none',
        }}>
          <ellipse cx={SINK.x} cy={WATER_Y} rx="30" ry="8" fill="none" stroke="#A9BBB0" strokeWidth="1.5" />
        </g>

        {/* faint guide line down to the water (before sealing) */}
        {!sealed && !dragging && (
          <line x1={START.x} y1={START.y + 16} x2={SINK.x} y2={WATER_Y - 6}
            stroke="#D8CFC0" strokeWidth="1" strokeDasharray="2 5" opacity="0.6" style={{ pointerEvents: 'none' }} />
        )}

        {/* today — a small light */}
        <g
          transform={`translate(${pos.x}, ${pos.y})`}
          style={{
            transition: dragging ? 'none' : 'transform 0.5s cubic-bezier(0.4,0,0.5,1), opacity 0.6s ease',
            opacity: sealed ? 0 : 1,
            cursor: sealed ? 'default' : 'grab',
          }}
        >
          <circle r="20" fill="#F4D9A0" opacity="0.35" />
          <circle r="13" fill="#F4D9A0" opacity="0.55" />
          <circle r="8" fill="#E8B860" stroke="#C99A3E" strokeWidth="1" />
          <text x="0" y="-26" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="11" fill="#854F0B" style={{ pointerEvents: 'none' }}>today</text>
        </g>
      </svg>

      <p style={S.hint}>{sealed ? 'The day is set down. It rests now.' : 'Lower today into the still water. Let it rest.'}</p>

      {sealed && (
        <button onClick={complete} disabled={saving} style={{ ...S.primaryBtn, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Continue'}
        </button>
      )}
    </div>
  )
}

const S = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '0.85rem', alignItems: 'center', padding: '0.5rem 0 1rem', width: '100%' },
  stepLabel: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, margin: 0, alignSelf: 'flex-start' },
  svg: { width: '100%', maxWidth: '320px', aspectRatio: `${VIEW_W} / ${VIEW_H}`, background: '#FDFBF6', borderRadius: '20px', border: '0.5px solid #EFE7D7', touchAction: 'none', userSelect: 'none', cursor: 'grab' },
  hint: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: 0, minHeight: '20px', maxWidth: '300px' },
  primaryBtn: { width: '100%', padding: '15px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 4px 14px rgba(40,25,10,0.25)' },
}