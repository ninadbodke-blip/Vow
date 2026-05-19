import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const slides = [
  {
    title: 'Welcome to Vow',
    body: 'It begins as a small flame.',
    illustration: 'spark',
  },
  {
    title: 'Hold it. Tend it.',
    body: 'Each day, it grows fiercer.',
    illustration: 'risen',
  },
]

// =====================================================================
// SLIDE 1: small wider flame (Firebase-style proportions)
// =====================================================================
function SparkIllustration() {
  return (
    <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="sparkHalo" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(255,160,80,0.22)" />
          <stop offset="50%" stopColor="rgba(255,160,80,0.08)" />
          <stop offset="100%" stopColor="rgba(255,160,80,0)" />
        </radialGradient>
        <radialGradient id="sparkOuter" cx="50%" cy="65%">
          <stop offset="0%" stopColor="#FFB85A" />
          <stop offset="50%" stopColor="#E8754A" />
          <stop offset="100%" stopColor="#A93B1A" />
        </radialGradient>
        <radialGradient id="sparkCore" cx="50%" cy="60%">
          <stop offset="0%" stopColor="#FFF6D0" />
          <stop offset="50%" stopColor="#FFD06A" />
          <stop offset="100%" stopColor="#FFA040" />
        </radialGradient>
      </defs>

      {/* Outer halo */}
      <circle cx="120" cy="125" r="110" fill="url(#sparkHalo)" />

      {/* Soft glow around flame */}
      <ellipse cx="120" cy="130" rx="55" ry="62" fill="rgba(255,176,80,0.12)" />
      <ellipse cx="120" cy="130" rx="38" ry="48" fill="rgba(255,200,100,0.16)" />

      {/* Outer flame — wider Firebase-style teardrop */}
      <path
        d="M 120 55
           C 92 78, 70 112, 70 148
           C 70 175, 92 192, 120 194
           C 148 192, 170 175, 170 148
           C 170 112, 148 78, 120 55 Z"
        fill="url(#sparkOuter)"
      />

      {/* Inner bright core */}
      <path
        d="M 120 80
           C 102 98, 90 122, 90 150
           C 90 168, 102 180, 120 182
           C 138 180, 150 168, 150 150
           C 150 122, 138 98, 120 80 Z"
        fill="url(#sparkCore)"
      />

      {/* Bright center column */}
      <ellipse cx="120" cy="140" rx="10" ry="24" fill="#FFFCE8" opacity="0.7" />
    </svg>
  )
}

// =====================================================================
// SLIDE 2: horizontal hand from the side, flame floating above the palm.
// Single cohesive silhouette. Gap of ~45px between flame base & palm.
// =====================================================================
function RisenIllustration() {
  return (
    <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="risenBg" cx="50%" cy="35%">
          <stop offset="0%" stopColor="rgba(255,140,60,0.32)" />
          <stop offset="50%" stopColor="rgba(255,140,60,0.08)" />
          <stop offset="100%" stopColor="rgba(255,140,60,0)" />
        </radialGradient>

        <radialGradient id="risenOuter" cx="50%" cy="75%">
          <stop offset="0%" stopColor="#FFB840" />
          <stop offset="35%" stopColor="#F87830" />
          <stop offset="70%" stopColor="#C5331A" />
          <stop offset="100%" stopColor="#6A1408" />
        </radialGradient>
        <radialGradient id="risenMid" cx="50%" cy="70%">
          <stop offset="0%" stopColor="#FFE680" />
          <stop offset="50%" stopColor="#FFA040" />
          <stop offset="100%" stopColor="#D03818" />
        </radialGradient>
        <radialGradient id="risenCore" cx="50%" cy="65%">
          <stop offset="0%" stopColor="#FFFCE8" />
          <stop offset="50%" stopColor="#FFE068" />
          <stop offset="100%" stopColor="#FFB040" />
        </radialGradient>

        {/* Hand gradient — anchored to SVG coords, NOT bounding box.
            Light at the top (where the flame hits), dark below. */}
        <linearGradient
          id="handGrad"
          x1="0" y1="230"
          x2="0" y2="140"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#3A2208" />
          <stop offset="100%" stopColor="#B86A24" />
        </linearGradient>

        <radialGradient id="palmGlow" cx="50%" cy="0%">
          <stop offset="0%" stopColor="rgba(255,180,80,0.5)" />
          <stop offset="100%" stopColor="rgba(255,180,80,0)" />
        </radialGradient>
      </defs>

      {/* Warm backdrop */}
      <circle cx="120" cy="90" r="115" fill="url(#risenBg)" />

      {/* =========== THE FLAME =========== */}

      {/* Outer aura */}
      <path
        d="M 60 138
           Q 45 80, 95 25
           Q 115 5, 140 0
           Q 158 14, 168 48
           Q 200 70, 205 138
           Q 195 156, 165 156
           Q 130 158, 95 156
           Q 62 152, 60 138 Z"
        fill="rgba(255,140,60,0.16)"
      />

      {/* Main outer flame body */}
      <path
        d="M 138 12
           C 102 30, 75 70, 75 115
           C 75 138, 102 148, 132 148
           C 162 148, 188 138, 188 115
           C 188 70, 162 30, 138 12 Z"
        fill="url(#risenOuter)"
      />

      {/* Right secondary tongue */}
      <path
        d="M 170 60
           Q 192 35, 200 12
           Q 196 38, 192 70
           Q 200 92, 182 102
           Q 168 98, 170 60 Z"
        fill="url(#risenMid)"
      />

      {/* Left secondary tongue */}
      <path
        d="M 82 100
           Q 62 80, 58 55
           Q 65 78, 76 90
           Q 74 110, 82 112 Z"
        fill="url(#risenMid)"
      />

      {/* Mid flame layer */}
      <path
        d="M 138 30
           C 110 48, 88 82, 88 120
           C 88 140, 110 148, 132 148
           C 154 148, 174 140, 174 120
           C 174 82, 158 48, 138 30 Z"
        fill="url(#risenMid)"
      />

      {/* Hot inner core */}
      <path
        d="M 138 52
           C 118 68, 100 98, 100 128
           C 100 142, 116 148, 132 148
           C 148 148, 162 142, 162 128
           C 162 98, 152 68, 138 52 Z"
        fill="url(#risenCore)"
      />

      {/* White-hot central column */}
      <ellipse cx="134" cy="105" rx="7" ry="28" fill="#FFFCE8" opacity="0.85" />

      {/* Rising sparks */}
      <circle cx="98" cy="28" r="1.5" fill="rgba(255,210,130,0.7)" />
      <circle cx="172" cy="38" r="1.3" fill="rgba(255,210,130,0.6)" />
      <circle cx="125" cy="6" r="1" fill="rgba(255,210,130,0.5)" />
      <circle cx="158" cy="18" r="0.9" fill="rgba(255,210,130,0.55)" />
      <circle cx="78" cy="52" r="0.7" fill="rgba(255,210,130,0.35)" />
      <circle cx="195" cy="78" r="1" fill="rgba(255,210,130,0.45)" />
      <circle cx="108" cy="42" r="0.6" fill="rgba(255,210,130,0.3)" />
      <circle cx="180" cy="96" r="0.7" fill="rgba(255,210,130,0.4)" />

      {/* Palm glow halo — warm light from flame falling on the hand */}
      <ellipse cx="135" cy="175" rx="85" ry="15" fill="url(#palmGlow)" />

      {/* =========== THE HAND — single cohesive silhouette =========== */}

      <path
        d="M -10 235
           L -10 200
           L 55 200
           Q 70 200, 82 195
           Q 92 190, 100 187

           Q 103 178, 110 172
           Q 118 168, 124 172
           Q 130 178, 128 185
           Q 126 188, 122 188

           L 170 188

           Q 182 188, 192 180
           Q 206 165, 206 148
           Q 204 138, 194 140
           Q 184 144, 180 156
           Q 176 172, 168 182
           Q 160 188, 150 190

           Q 148 200, 152 215
           Q 150 228, 138 232
           Q 110 235, 70 233
           L -10 233 Z"
        fill="url(#handGrad)"
      />

      {/* Highlight along top of palm where flame hits */}
      <ellipse cx="138" cy="186" rx="28" ry="2" fill="rgba(255,200,120,0.4)" />

      {/* Thumb tip catches light */}
      <ellipse cx="122" cy="172" rx="4" ry="1.5" fill="rgba(255,200,120,0.4)" />

      {/* Finger curl crest catches light */}
      <ellipse cx="200" cy="145" rx="6" ry="2" fill="rgba(255,200,120,0.45)" />

      {/* Subtle light line along top of forearm */}
      <path
        d="M -10 200 L 55 200 Q 70 200, 82 195"
        stroke="rgba(255,200,120,0.22)"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  )
}

export default function Welcome() {
  const navigate = useNavigate()
  const [idx, setIdx] = useState(0)

  const next = () => {
    if (idx < slides.length - 1) {
      setIdx(idx + 1)
    } else {
      navigate('/signup')
    }
  }

  const skip = () => navigate('/signup')

  const slide = slides[idx]

  return (
    <div style={styles.frame}>
      <div style={styles.card}>
        <button onClick={skip} style={styles.skipBtn}>Skip</button>

        <div style={styles.illustration}>
          {slide.illustration === 'spark' && <SparkIllustration />}
          {slide.illustration === 'risen' && <RisenIllustration />}
        </div>

        <h1 style={styles.title}>
          {slide.title.split('\n').map((line, i) => (
            <span key={i} style={{ display: 'block' }}>{line}</span>
          ))}
        </h1>
        <p style={styles.body}>{slide.body}</p>

        <div style={styles.dots}>
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.dot,
                ...(i === idx ? styles.dotActive : {}),
              }}
            />
          ))}
        </div>

        <button onClick={next} style={styles.nextBtn}>
          {idx === slides.length - 1 ? 'Get started' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: '#FAF7F1',
    maxWidth: '420px',
    width: '100%',
    minHeight: '620px',
    borderRadius: '28px',
    padding: '2rem 2rem 2.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  skipBtn: {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
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
    width: '240px',
    height: '240px',
    margin: '2.5rem auto 1.75rem',
  },
  title: {
    fontSize: '28px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: '0 0 1rem',
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
  },
  body: {
    fontSize: '15px',
    color: '#6B5C4A',
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
    background: '#DDCFB6',
    transition: 'all 0.3s',
  },
  dotActive: {
    background: '#3A2A1C',
    width: '24px',
    borderRadius: '4px',
  },
  nextBtn: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
    letterSpacing: '0.02em',
  },
}