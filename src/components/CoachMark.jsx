import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

// =====================================================================
// CoachMark — a gentle guided tour ("coach marks" / spotlight).
// =====================================================================
// Reusable across screens. You pass an ordered list of steps; each step
// points at a real on-screen element (via a ref) and shows a card with a
// title + body and an arrow toward the element. The engine:
//   - dims the whole screen and "cuts out" a spotlight around the target
//   - scrolls the target into view, then measures its position
//   - places the card above or below the target (auto-flips near edges)
//   - draws a small arrow from the card toward the spotlight
//   - re-measures on resize / scroll so it stays aligned
//
// Calm, unhurried styling to match Vow. Plain-English copy lives in the
// steps the caller passes, not here.
//
// Props:
//   steps: [{ ref, title, body, placement? }]  // placement: 'auto'|'top'|'bottom'
//   open:  boolean
//   onClose: () => void   // called on finish or skip
//   onStepChange?: (index) => void  // lets caller scroll/prepare per step
// =====================================================================

const PAD = 10          // spotlight padding around the target
const CARD_GAP = 14     // gap between spotlight and card

export default function CoachMark({ steps = [], open, onClose, onStepChange }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState(null)      // target bounding rect
  const [ready, setReady] = useState(false)
  const cardRef = useRef(null)
  const [cardH, setCardH] = useState(0)

  const step = steps[i]

  // Measure the current target (after scrolling it into view).
  const measure = useCallback(() => {
    const el = step?.ref?.current
    if (!el) { setRect(null); return }
    const r = el.getBoundingClientRect()
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right })
  }, [step])

  // On step change: tell caller, scroll target into view, then measure.
  useEffect(() => {
    if (!open) return
    setReady(false)
    onStepChange?.(i)
    const el = step?.ref?.current
    if (el) {
      try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }) } catch { el.scrollIntoView() }
    }
    // Wait for the smooth scroll to settle, then measure.
    const t = setTimeout(() => { measure(); setReady(true) }, 380)
    return () => clearTimeout(t)
  }, [i, open, step, measure, onStepChange])

  // Keep aligned on resize/scroll while open.
  useLayoutEffect(() => {
    if (!open) return
    const onMove = () => measure()
    window.addEventListener('resize', onMove)
    window.addEventListener('scroll', onMove, true)
    return () => {
      window.removeEventListener('resize', onMove)
      window.removeEventListener('scroll', onMove, true)
    }
  }, [open, measure])

  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight)
  }, [i, ready, rect])

  // Reset to first step whenever reopened.
  useEffect(() => { if (open) setI(0) }, [open])

  if (!open || !step) return null

  const vh = window.innerHeight
  const vw = window.innerWidth

  // Decide card placement: below the target unless that would overflow.
  let placeBelow = true
  if (rect) {
    const spaceBelow = vh - rect.bottom
    const spaceAbove = rect.top
    if (step.placement === 'top') placeBelow = false
    else if (step.placement === 'bottom') placeBelow = true
    else placeBelow = spaceBelow >= spaceAbove   // auto
  }

  // Spotlight rect (padded), clamped to viewport.
  const spot = rect ? {
    top: Math.max(rect.top - PAD, 6),
    left: Math.max(rect.left - PAD, 6),
    width: Math.min(rect.width + PAD * 2, vw - 12),
    height: rect.height + PAD * 2,
  } : null

  // Card vertical position.
  let cardTop
  if (rect) {
    cardTop = placeBelow ? spot.top + spot.height + CARD_GAP : spot.top - CARD_GAP - cardH
    // clamp
    cardTop = Math.max(12, Math.min(cardTop, vh - cardH - 12))
  } else {
    cardTop = vh / 2 - cardH / 2
  }

  const isLast = i === steps.length - 1

  return createPortal(
    <div style={S.root} aria-modal="true" role="dialog">
      {/* Dim overlay via four panels around the spotlight (so the target stays bright + tappable-looking) */}
      {spot ? (
        <>
          <div style={{ ...S.dim, top: 0, left: 0, width: '100%', height: spot.top }} />
          <div style={{ ...S.dim, top: spot.top, left: 0, width: spot.left, height: spot.height }} />
          <div style={{ ...S.dim, top: spot.top, left: spot.left + spot.width, width: `calc(100% - ${spot.left + spot.width}px)`, height: spot.height }} />
          <div style={{ ...S.dim, top: spot.top + spot.height, left: 0, width: '100%', height: `calc(100% - ${spot.top + spot.height}px)` }} />
          {/* spotlight ring */}
          <div style={{ ...S.ring, top: spot.top, left: spot.left, width: spot.width, height: spot.height }} />
        </>
      ) : (
        <div style={{ ...S.dim, inset: 0, width: '100%', height: '100%' }} />
      )}

      {/* Arrow from card toward the spotlight */}
      {rect && (
        <div
          style={{
            ...S.arrow,
            top: placeBelow ? cardTop - 9 : cardTop + cardH + 1,
            left: Math.max(24, Math.min(rect.left + rect.width / 2 - 8, vw - 40)),
            transform: placeBelow ? 'rotate(180deg)' : 'none',
          }}
          aria-hidden="true"
        >
          <svg width="18" height="10" viewBox="0 0 18 10"><path d="M9 0L18 10H0z" fill="#FCFAF5" /></svg>
        </div>
      )}

      {/* The card */}
      <div ref={cardRef} style={{ ...S.card, top: cardTop }}>
        <div style={S.stepDots}>
          {steps.map((_, n) => (
            <span key={n} style={{ ...S.dot, ...(n === i ? S.dotOn : {}) }} />
          ))}
        </div>
        {step.title && <p style={S.title}>{step.title}</p>}
        {step.body && <p style={S.body}>{step.body}</p>}
        <div style={S.actions}>
          <button onClick={onClose} style={S.skip}>Skip</button>
          <div style={S.rightBtns}>
            {i > 0 && (
              <button onClick={() => setI(i - 1)} style={S.back}>Back</button>
            )}
            <button
              onClick={() => { if (isLast) onClose(); else setI(i + 1) }}
              style={S.next}
            >
              {isLast ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

const S = {
  root: { position: 'fixed', inset: 0, zIndex: 4000, fontFamily: 'Georgia, "Times New Roman", serif' },
  dim: { position: 'fixed', background: 'rgba(34,23,16,0.74)', transition: 'all 0.25s ease' },
  ring: {
    position: 'fixed',
    borderRadius: '16px',
    boxShadow: '0 0 0 2px rgba(217,181,122,0.9), 0 0 22px rgba(217,181,122,0.35)',
    transition: 'all 0.25s ease',
    pointerEvents: 'none',
  },
  arrow: { position: 'fixed', zIndex: 4001, transition: 'all 0.2s ease' },
  card: {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(330px, calc(100vw - 36px))',
    boxSizing: 'border-box',
    background: '#FCFAF5',
    borderRadius: '18px',
    padding: '18px 20px 16px',
    boxShadow: '0 16px 50px rgba(20,12,6,0.45)',
    zIndex: 4002,
    transition: 'top 0.2s ease',
  },
  stepDots: { display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '12px' },
  dot: { width: '5px', height: '5px', borderRadius: '50%', background: '#E0D4BE' },
  dotOn: { background: '#854F0B', width: '16px', borderRadius: '3px' },
  title: { fontSize: '17px', color: '#2A1F15', fontWeight: 500, fontStyle: 'italic', margin: '0 0 6px', textAlign: 'center', lineHeight: 1.3 },
  body: { fontSize: '14px', color: '#5B4F3F', lineHeight: 1.55, margin: '0 0 16px', textAlign: 'center' },
  actions: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  rightBtns: { display: 'flex', alignItems: 'center', gap: '8px' },
  skip: { background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer', padding: '8px 4px' },
  back: { background: 'transparent', border: '0.5px solid #DDCFB6', color: '#854F0B', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer', padding: '8px 14px', borderRadius: '10px' },
  next: { background: 'linear-gradient(180deg,#3A2A1C,#241710)', border: 'none', color: '#F6E8C4', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', padding: '9px 18px', borderRadius: '10px' },
}