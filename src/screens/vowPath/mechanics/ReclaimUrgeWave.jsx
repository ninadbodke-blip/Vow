import { useState, useRef, useEffect } from 'react'

// "Ride it out." Keep a finger on the wave; it rises, crests, and falls on its
// own. Proves the urge passes without being fed. (Urge surfing.)
const VIEW_W = 320
const VIEW_H = 200
const X0 = 24
const X1 = 296
const BASE_Y = 152
const AMP = 100
const RIDE_MS = 20000

const px = (t) => X0 + t * (X1 - X0)
const py = (t) => BASE_Y - AMP * Math.sin(t * Math.PI)

function pathFor(fromT, toT) {
  const pts = []
  const steps = 48
  for (let i = 0; i <= steps; i++) {
    const t = fromT + ((toT - fromT) * i) / steps
    pts.push(`${px(t).toFixed(1)},${py(t).toFixed(1)}`)
  }
  return pts.join(' ')
}

export default function ReclaimUrgeWave({ existingData, onSave, saving }) {
  const done0 = !!(existingData && existingData.rode_it)
  const [phase, setPhase] = useState(done0 ? 'done' : 'ride') // ride | done
  const [progress, setProgress] = useState(done0 ? 1 : 0)
  const [holdingUi, setHoldingUi] = useState(false)
  const holdingRef = useRef(false)
  const rafRef = useRef(null)
  const lastRef = useRef(null)

  useEffect(() => {
    if (phase !== 'ride') return
    const tick = (t) => {
      if (lastRef.current == null) lastRef.current = t
      const dt = t - lastRef.current
      lastRef.current = t
      if (holdingRef.current) {
        setProgress((p) => Math.min(1, p + dt / RIDE_MS))
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastRef.current = null }
  }, [phase])

  useEffect(() => {
    if (progress >= 1 && phase === 'ride') {
      holdingRef.current = false
      setHoldingUi(false)
      setPhase('done')
    }
  }, [progress, phase])

  const start = (e) => { e.preventDefault(); holdingRef.current = true; setHoldingUi(true) }
  const stop = () => { holdingRef.current = false; setHoldingUi(false) }
  const complete = () => { if (!saving) onSave({ rode_it: true }) }

  const label = (() => {
    if (phase === 'done') return 'It passed. It always does.'
    if (!holdingUi && progress === 0) return 'Press and hold the wave. Ride it up.'
    if (!holdingUi && progress > 0) return 'You lifted off — press and hold to keep riding.'
    if (progress < 0.4) return "It's rising. Stay with it."
    if (progress < 0.62) return "This is the peak. Don't move. Just ride."
    return "And now it's easing…"
  })()

  const dotT = progress
  const showDot = phase === 'ride'

  return (
    <div style={S.wrap}>
      <p style={S.stepLabel}>{phase === 'done' ? 'Passed' : 'Ride it'}</p>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={S.svg}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
      >
        <line x1={X0} y1={BASE_Y} x2={X1} y2={BASE_Y} stroke="#EADFCB" strokeWidth="1" />

        {/* full wave (faint) */}
        <polyline points={pathFor(0, 1)} fill="none" stroke="#E3D3B6" strokeWidth="2" strokeLinecap="round" />

        {/* traveled wave (warm) */}
        {progress > 0 && (
          <polyline points={pathFor(0, progress)} fill="none" stroke="#C5572C" strokeWidth="3" strokeLinecap="round" />
        )}

        {/* the riding dot */}
        {showDot && (
          <g style={{ pointerEvents: 'none' }}>
            {holdingUi && <circle cx={px(dotT)} cy={py(dotT)} r="11" fill="#E8A175" opacity="0.35" />}
            <circle cx={px(dotT)} cy={py(dotT)} r="6" fill="#C5572C" stroke="#FDFBF6" strokeWidth="1.5" />
          </g>
        )}

        {phase === 'done' && (
          <circle cx={px(1)} cy={py(1)} r="5" fill="#D9B57A" />
        )}
      </svg>

      <p style={S.hint}>{label}</p>

      {phase === 'done' && (
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
  svg: { width: '100%', maxWidth: '320px', aspectRatio: `${VIEW_W} / ${VIEW_H}`, background: '#FDFBF6', borderRadius: '20px', border: '0.5px solid #EFE7D7', touchAction: 'none', userSelect: 'none', cursor: 'pointer' },
  hint: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: 0, minHeight: '20px', maxWidth: '300px' },
  primaryBtn: { width: '100%', padding: '15px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 4px 14px rgba(40,25,10,0.25)' },
}