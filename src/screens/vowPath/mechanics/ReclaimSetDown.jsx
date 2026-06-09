import { useState, useRef } from 'react'

// "What you're carrying." The weights sit stacked; drag each one off and let
// it fall. The load lightens, one piece at a time.
const VIEW_W = 320
const VIEW_H = 236
const BAR_W = 224
const BAR_H = 40
const GAP = 12
const TOP_Y = 22
const BAR_X = (VIEW_W - BAR_W) / 2
const DEFAULT_WEIGHTS = ['The shame', 'I let people down', 'Back to zero', `I can't do this`]

export default function ReclaimSetDown({ existingData, onSave, saving, weights }) {
  const labels = Array.isArray(weights) && weights.length ? weights.slice(0, 5) : DEFAULT_WEIGHTS
  const done0 = !!(existingData && existingData.set_down)

  const initBars = () => labels.map((label, i) => ({
    id: i, label, homeY: TOP_Y + i * (BAR_H + GAP),
    dx: 0, dy: 0, removed: done0,
  }))
  const [bars, setBars] = useState(initBars)
  const [dragId, setDragId] = useState(null)
  const svgRef = useRef(null)
  const grabRef = useRef({ x: 0, y: 0 })

  const toSvg = (cx, cy) => {
    const r = svgRef.current.getBoundingClientRect()
    return { x: ((cx - r.left) / r.width) * VIEW_W, y: ((cy - r.top) / r.height) * VIEW_H }
  }

  const remaining = bars.filter((b) => !b.removed).length
  const allDown = remaining === 0

  const onDown = (e) => {
    if (allDown || !svgRef.current) return
    const p = toSvg(e.clientX, e.clientY)
    // top-most (last drawn) bar under the pointer
    for (let i = bars.length - 1; i >= 0; i--) {
      const b = bars[i]
      if (b.removed) continue
      const x0 = BAR_X + b.dx, y0 = b.homeY + b.dy
      if (p.x >= x0 && p.x <= x0 + BAR_W && p.y >= y0 && p.y <= y0 + BAR_H) {
        grabRef.current = { x: p.x - x0, y: p.y - y0 }
        setDragId(b.id)
        try { svgRef.current.setPointerCapture(e.pointerId) } catch (err) {}
        return
      }
    }
  }

  const onMove = (e) => {
    if (dragId == null) return
    const p = toSvg(e.clientX, e.clientY)
    setBars((prev) => prev.map((b) => b.id === dragId
      ? { ...b, dx: p.x - grabRef.current.x - BAR_X, dy: p.y - (b.homeY) - grabRef.current.y }
      : b))
  }

  const onUp = (e) => {
    if (dragId == null) return
    try { if (svgRef.current) svgRef.current.releasePointerCapture(e.pointerId) } catch (err) {}
    setBars((prev) => prev.map((b) => {
      if (b.id !== dragId) return b
      const pulledOff = Math.abs(b.dx) > 78 || b.dy > 64 || b.dy < -64
      if (pulledOff) {
        const dir = b.dx >= 0 ? 1 : -1
        return { ...b, removed: true, dx: dir * 320, dy: b.dy + 40 }
      }
      return { ...b, dx: 0, dy: 0 }
    }))
    setDragId(null)
  }

  const complete = () => { if (!saving) onSave({ set_down: true, count: labels.length }) }

  const splitLabel = (label) => {
    if (label.length <= 14) return [label]
    const mid = label.lastIndexOf(' ', Math.ceil(label.length / 2) + 4)
    if (mid <= 0) return [label]
    return [label.slice(0, mid), label.slice(mid + 1)]
  }

  return (
    <div style={S.wrap}>
      <p style={S.stepLabel}>{allDown ? 'Lighter' : `${remaining} still to set down`}</p>

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
        {bars.map((b) => {
          const lines = splitLabel(b.label)
          return (
            <g key={b.id}
              transform={`translate(${b.dx}, ${b.dy})`}
              style={{
                transition: dragId === b.id ? 'none' : 'transform 0.35s cubic-bezier(0.3,0.6,0.3,1), opacity 0.35s ease',
                opacity: b.removed ? 0 : 1,
                cursor: b.removed ? 'default' : 'grab',
              }}
            >
              <rect x={BAR_X} y={b.homeY} width={BAR_W} height={BAR_H} rx="12"
                fill="#F1E8D6" stroke="#E0D2B8" strokeWidth="1" />
              {lines.map((ln, k) => (
                <text key={k} x={VIEW_W / 2} y={b.homeY + BAR_H / 2 + (lines.length === 1 ? 5 : (k === 0 ? -2 : 13))}
                  textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic"
                  fontSize={lines.length === 1 ? 15 : 12.5} fill="#3A2D1E" style={{ pointerEvents: 'none' }}>
                  {ln}
                </text>
              ))}
            </g>
          )
        })}
      </svg>

      <p style={S.hint}>{allDown ? 'You set it all down.' : 'Drag each weight off and let it drop.'}</p>

      {allDown && (
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
  hint: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: 0, minHeight: '20px' },
  primaryBtn: { width: '100%', padding: '15px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 4px 14px rgba(40,25,10,0.25)' },
}