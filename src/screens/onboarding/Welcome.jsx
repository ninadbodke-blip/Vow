import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const slides = [
  {
    title: 'It begins\nquietly.',
    body: 'One decision. One spark.',
    illustration: 'spark',
  },
  {
    title: "Willpower fades.\nSystems don't.",
    body: "We'll build yours.",
    illustration: 'lantern',
  },
  {
    title: 'Reclaim\nwhat it took.',
    body: 'Time. Energy. You. Step in.',
    illustration: 'furnace',
  },
]

// =====================================================================
// SLIDE 1: small wider flame (Firebase-style proportions)
// =====================================================================
// SLIDE 1: the spark — a quiet, pulsing ember.
// =====================================================================
function SparkIllustration() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {/* Outer ambient glow */}
      <circle cx="50" cy="50" r="20" fill="#854F0B" opacity="0.2">
        <animate attributeName="r" values="18; 26; 18" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.1; 0.3; 0.1" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Inner spark */}
      <circle cx="50" cy="50" r="8" fill="#D9B57A">
        <animate attributeName="r" values="7; 10; 7" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7; 1; 0.7" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

// =====================================================================
// SLIDE 2: the lantern — a shielded flame, infrastructure around it.
// =====================================================================
function LanternIllustration() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {/* Lantern structure */}
      <path d="M 30 20 L 70 20 L 80 80 L 20 80 Z" fill="none" stroke="#6B5C4A" strokeWidth="2" opacity="0.6" />
      <path d="M 20 80 L 80 80" stroke="#6B5C4A" strokeWidth="4" fill="none" />
      <path d="M 40 20 L 50 8 L 60 20" fill="none" stroke="#6B5C4A" strokeWidth="2" />
      <path d="M 35 20 L 35 80 M 65 20 L 65 80" stroke="#6B5C4A" strokeWidth="1" opacity="0.3" fill="none" />
      {/* Shielded flame (contained morph) */}
      <path d="M50 45 Q55 65 50 75 Q45 65 50 45" fill="#D9B57A">
        <animate attributeName="d" values="M50 45 Q55 65 50 75 Q45 65 50 45; M50 40 Q58 65 50 75 Q42 65 50 40; M50 45 Q55 65 50 75 Q45 65 50 45" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}

// =====================================================================
// SLIDE 3: the furnace — a roaring, multi-layered fire.
// =====================================================================
function FurnaceIllustration() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {/* Back flame (clay, slow) */}
      <path d="M50 15 Q70 50 50 90 Q30 50 50 15" fill="#854F0B" opacity="0.8">
        <animate attributeName="d" values="M50 15 Q70 50 50 90 Q30 50 50 15; M45 20 Q75 45 50 90 Q25 55 45 20; M55 20 Q65 55 50 90 Q35 45 55 20; M50 15 Q70 50 50 90 Q30 50 50 15" dur="1.8s" repeatCount="indefinite" />
      </path>
      {/* Core flame (gold, fast) */}
      <path d="M50 35 Q65 65 50 90 Q35 65 50 35" fill="#D9B57A">
        <animate attributeName="d" values="M50 35 Q65 65 50 90 Q35 65 50 35; M52 30 Q60 60 50 90 Q30 70 52 30; M48 30 Q70 70 50 90 Q40 60 48 30; M50 35 Q65 65 50 90 Q35 65 50 35" dur="1.2s" repeatCount="indefinite" />
      </path>
      {/* Inner hot spark (cream, rapid flicker) */}
      <path d="M50 55 Q55 75 50 90 Q45 75 50 55" fill="#FAF7F1">
        <animate attributeName="d" values="M50 55 Q55 75 50 90 Q45 75 50 55; M48 50 Q58 70 50 90 Q42 70 48 50; M50 55 Q55 75 50 90 Q45 75 50 55" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}

// =====================================================================
function IgniteButton({ onIgnite }) {
  const [progress, setProgress] = useState(0)
  const timer = useRef(null)

  const clear = () => { if (timer.current) { clearInterval(timer.current); timer.current = null } }
  const start = () => {
    if (timer.current) return
    timer.current = setInterval(() => {
      setProgress(p => {
        const n = p + 2 // ~1.5s to fill (30ms x 50 steps)
        if (n >= 100) { clear(); onIgnite(); return 100 }
        return n
      })
    }, 30)
  }
  const stop = () => { clear(); setProgress(p => (p >= 100 ? 100 : 0)) }
  useEffect(() => () => clear(), [])

  const holding = progress > 0 && progress < 100
  return (
    <button
      style={styles.igniteBtn}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
    >
      <span style={{ ...styles.igniteFill, width: `${progress}%` }} />
      <span style={styles.igniteLabel}>{holding ? 'Igniting…' : 'Hold to Ignite'}</span>
    </button>
  )
}

export default function Welcome() {
  const navigate = useNavigate()
  const [idx, setIdx] = useState(0)

  const isLast = idx === slides.length - 1
  const next = () => setIdx(i => (i < slides.length - 1 ? i + 1 : i))
  const prev = () => setIdx(i => (i > 0 ? i - 1 : i))
  const skip = () => navigate('/signup')
  const ignite = () => navigate('/signup')

  // Swipe left = forward, right = back. Taps (dx ~ 0) pass through to buttons.
  const swipeX = useRef(null)
  const onSwipeStart = (e) => { swipeX.current = e.clientX }
  const onSwipeEnd = (e) => {
    if (swipeX.current == null) return
    const dx = e.clientX - swipeX.current
    swipeX.current = null
    if (Math.abs(dx) < 45) return
    if (dx < 0) next(); else prev()
  }

  const slide = slides[idx]
  const lit = slides.length > 1 ? idx / (slides.length - 1) : 1

  return (
    <div style={styles.frame}>
      <div
        style={{
          ...styles.glow,
          opacity: 0.18 + lit * 0.5,
          transform: `translate(-50%, -50%) scale(${0.8 + lit * 0.55})`,
        }}
      />

      <div style={styles.shell} onPointerDown={onSwipeStart} onPointerUp={onSwipeEnd} onPointerLeave={() => { swipeX.current = null }}>
        <button onClick={skip} style={styles.skipBtn}>Skip</button>

        <div style={styles.illustration}>
          {slide.illustration === 'spark' && <SparkIllustration />}
          {slide.illustration === 'lantern' && <LanternIllustration />}
          {slide.illustration === 'furnace' && <FurnaceIllustration />}
        </div>

        <h1
          style={{
            ...styles.title,
            textShadow: `0 0 ${10 + lit * 26}px rgba(255,190,110,${0.12 + lit * 0.4})`,
          }}
        >
          {slide.title.split('\n').map((line, i) => (
            <span key={i} style={{ display: 'block' }}>{line}</span>
          ))}
        </h1>
        <p style={styles.body}>{slide.body}</p>

        <div style={styles.dots}>
          {slides.map((_, i) => (
            <div key={i} style={{ ...styles.dot, ...(i === idx ? styles.dotActive : {}) }} />
          ))}
        </div>

        {isLast ? (
          <IgniteButton onIgnite={ignite} />
        ) : (
          <button onClick={next} style={styles.continueBtn}>Continue →</button>
        )}
      </div>
    </div>
  )
}

const styles = {
  frame: {
    minHeight: '100vh',
    background:
      'radial-gradient(900px 520px at 50% 6%, rgba(197,87,44,0.16), transparent 60%), ' +
      'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    padding: '2rem 1.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '42%',
    left: '50%',
    width: '520px',
    height: '520px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(255,176,80,0.5) 0%, rgba(255,140,60,0.12) 45%, rgba(255,140,60,0) 72%)',
    pointerEvents: 'none',
    transition: 'opacity 0.6s ease, transform 0.6s ease',
    zIndex: 0,
  },
  shell: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '430px',
    width: '100%',
    minHeight: '600px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '1.25rem',
  },
  skipBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    background: 'transparent',
    border: 'none',
    color: '#9C8C78',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  illustration: {
    width: '230px',
    height: '230px',
    margin: '2.75rem auto 1.75rem',
  },
  title: {
    fontSize: '27px',
    fontWeight: 500,
    color: '#FAF7F1',
    margin: '0 0 1rem',
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
    transition: 'text-shadow 0.6s ease',
  },
  body: {
    fontSize: '15px',
    color: '#9C8C78',
    margin: '0 0 auto',
    textAlign: 'center',
    lineHeight: 1.6,
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    maxWidth: '320px',
  },
  dots: {
    display: 'flex',
    gap: '8px',
    margin: '2rem 0 1.5rem',
    justifyContent: 'center',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'rgba(250,247,241,0.22)',
    transition: 'all 0.3s',
  },
  dotActive: {
    background: 'linear-gradient(180deg, #D9B57A 0%, #B89456 100%)',
    width: '24px',
    borderRadius: '4px',
  },
  continueBtn: {
    width: '100%',
    padding: '15px',
    background: 'transparent',
    color: '#FAF7F1',
    border: '0.5px solid rgba(250,247,241,0.3)',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.02em',
  },
  igniteBtn: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    padding: '16px',
    background: 'rgba(250,247,241,0.04)',
    border: '1px solid #B89456',
    borderRadius: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  igniteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #D9B57A 0%, #B89456 100%)',
    transition: 'width 0.03s linear',
    zIndex: 0,
  },
  igniteLabel: {
    position: 'relative',
    zIndex: 1,
    fontSize: '15px',
    fontWeight: 600,
    color: '#FAF7F1',
    fontFamily: 'Georgia, serif',
    letterSpacing: '0.03em',
    textShadow: '0 1px 3px rgba(40,20,5,0.55)',
  },
}