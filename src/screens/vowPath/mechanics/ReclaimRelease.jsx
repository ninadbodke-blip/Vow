import { useState, useRef, useEffect } from 'react'

// "Say the worst of it." Write the harshest thing the slip is telling you,
// then press and hold — the words fade away under your finger until gone.
const HOLD_MS = 3200
const DECAY_MS = 1500

export default function ReclaimRelease({ existingData, onSave, saving, prompt, placeholder }) {
  const done0 = !!(existingData && existingData.released)
  const [phase, setPhase] = useState(done0 ? 'done' : 'write') // write | release | done
  const [text, setText] = useState(existingData?.text || '')
  const [progress, setProgress] = useState(done0 ? 100 : 0)
  const [holdingUi, setHoldingUi] = useState(false)
  const holdingRef = useRef(false)
  const rafRef = useRef(null)
  const lastRef = useRef(null)

  useEffect(() => {
    if (phase !== 'release') return
    const tick = (t) => {
      if (lastRef.current == null) lastRef.current = t
      const dt = t - lastRef.current
      lastRef.current = t
      setProgress((p) => {
        const d = holdingRef.current ? (dt / HOLD_MS) * 100 : -(dt / DECAY_MS) * 100
        return Math.max(0, Math.min(100, p + d))
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastRef.current = null }
  }, [phase])

  useEffect(() => {
    if (progress >= 100 && phase === 'release') {
      holdingRef.current = false
      setHoldingUi(false)
      setPhase('done')
    }
  }, [progress, phase])

  const startHold = (e) => { e.preventDefault(); holdingRef.current = true; setHoldingUi(true) }
  const endHold = () => { holdingRef.current = false; setHoldingUi(false) }

  const goRelease = () => { if (text.trim().length > 0) setPhase('release') }
  const complete = () => { if (!saving) onSave({ released: true, text }) }

  // --- WRITE ---
  if (phase === 'write') {
    return (
      <div style={S.wrap}>
        <p style={S.stepLabel}>Say it</p>
        {prompt ? <p style={S.prompt}>{prompt}</p> : null}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder || 'The worst of it is…'}
          style={S.textarea}
          rows={6}
        />
        <button onClick={goRelease} disabled={!text.trim()} style={{ ...S.primaryBtn, opacity: text.trim() ? 1 : 0.45 }}>
          I've said it
        </button>
      </div>
    )
  }

  // --- DONE ---
  if (phase === 'done') {
    return (
      <div style={S.wrap}>
        <p style={S.stepLabel}>Set down</p>
        <div style={S.doneBox}>
          <span style={S.doneMark}>◦</span>
          <p style={S.doneText}>It's gone from the screen. Let it be gone from you too.</p>
        </div>
        <button onClick={complete} disabled={saving} style={{ ...S.primaryBtn, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </div>
    )
  }

  // --- RELEASE (press & hold to dissolve) ---
  const opacity = Math.max(0, 1 - (progress / 100) * 0.97)
  const blur = (progress / 100) * 4
  const C = 2 * Math.PI * 26
  return (
    <div style={S.wrap}>
      <p style={S.stepLabel}>Let it go</p>
      <div style={S.releaseCard}>
        <p style={{ ...S.releaseText, opacity, filter: `blur(${blur}px)` }}>{text}</p>
      </div>

      <div
        style={{ ...S.holdPad, ...(holdingUi ? S.holdPadActive : {}) }}
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
      >
        <svg viewBox="0 0 60 60" width="58" height="58" style={{ flexShrink: 0 }}>
          <circle cx="30" cy="30" r="26" fill="none" stroke="#E8DFD0" strokeWidth="3" />
          <circle cx="30" cy="30" r="26" fill="none" stroke="#854F0B" strokeWidth="3"
            strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress / 100)}
            transform="rotate(-90 30 30)" />
        </svg>
        <span style={S.holdLabel}>{holdingUi ? 'Letting it go…' : 'Press and hold to let it go'}</span>
      </div>
    </div>
  )
}

const S = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '1.1rem', padding: '0.5rem 0 1rem' },
  stepLabel: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, margin: 0, alignSelf: 'flex-start' },
  prompt: { fontSize: '15px', color: '#3A2D1E', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.45, margin: 0 },
  textarea: { width: '100%', boxSizing: 'border-box', resize: 'vertical', background: '#FDFBF6', border: '1px solid #E8DFD0', borderRadius: '14px', padding: '14px 15px', fontSize: '16px', lineHeight: 1.6, color: '#2A1F15', fontFamily: 'Georgia, serif', outline: 'none' },
  releaseCard: { background: '#FDFBF6', border: '1px solid #EFE7D7', borderRadius: '16px', padding: '1.5rem 1.4rem', minHeight: '120px', display: 'flex', alignItems: 'center' },
  releaseText: { fontSize: '18px', lineHeight: 1.6, color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', whiteSpace: 'pre-wrap', margin: 0, transition: 'opacity 0.08s linear, filter 0.08s linear' },
  holdPad: { display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'center', background: '#FBF6EA', border: '1px solid #EADFCB', borderRadius: '16px', padding: '16px', cursor: 'pointer', userSelect: 'none', touchAction: 'none', transition: 'background 0.2s ease' },
  holdPadActive: { background: '#F3E8D2' },
  holdLabel: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  doneBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem 1rem', textAlign: 'center' },
  doneMark: { fontSize: '30px', color: '#D9B57A' },
  doneText: { fontSize: '15px', color: '#3A2D1E', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: 0, maxWidth: '300px' },
  primaryBtn: { width: '100%', padding: '15px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 4px 14px rgba(40,25,10,0.25)' },
}