import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../LanguageContext'

const slides = [
  {
    title: 'Welcome to Vow',
    body: 'Keep your promise. Find your way back.',
    illustration: 'chain',
  },
  {
    title: 'Track your Progress,\nLive your Vow',
    body: 'Stay strong — one day at a time. Remember the "why" for your vow.',
    illustration: 'mountain',
  },
]

function ChainIllustration() {
  return (
    <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="circleGrad" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#E8A064" />
          <stop offset="100%" stopColor="#C5572C" />
        </radialGradient>
        <linearGradient id="linkGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#FAF7F1" />
          <stop offset="100%" stopColor="#E8DCC2" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="110" fill="url(#circleGrad)" />
      <circle cx="120" cy="120" r="110" fill="rgba(0,0,0,0.04)" transform="translate(4, 4)" />
      
      {/* Left chain link (broken, falling away) */}
      <g transform="translate(60, 110) rotate(-15)">
        <ellipse cx="0" cy="0" rx="22" ry="14" fill="none" stroke="url(#linkGrad)" strokeWidth="8" />
      </g>
      
      {/* Right chain link (broken, falling away) */}
      <g transform="translate(180, 130) rotate(20)">
        <ellipse cx="0" cy="0" rx="22" ry="14" fill="none" stroke="url(#linkGrad)" strokeWidth="8" />
      </g>
      
      {/* Break sparks in middle */}
      <g transform="translate(120, 120)">
        <line x1="-12" y1="0" x2="-22" y2="-8" stroke="#FAF7F1" strokeWidth="3" strokeLinecap="round" />
        <line x1="-8" y1="-10" x2="-12" y2="-22" stroke="#FAF7F1" strokeWidth="3" strokeLinecap="round" />
        <line x1="12" y1="0" x2="22" y2="-8" stroke="#FAF7F1" strokeWidth="3" strokeLinecap="round" />
        <line x1="8" y1="-10" x2="12" y2="-22" stroke="#FAF7F1" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="-14" x2="0" y2="-26" stroke="#FAF7F1" strokeWidth="3" strokeLinecap="round" />
      </g>
      
      {/* Rising bird/dove silhouette */}
      <g transform="translate(120, 75)" fill="#FAF7F1">
        <path d="M -16 0 Q -8 -8 0 0 Q 8 -8 16 0 Q 8 4 0 4 Q -8 4 -16 0 Z" />
      </g>
    </svg>
  )
}

function MountainIllustration() {
  return (
    <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="circleGrad2" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#E8A064" />
          <stop offset="100%" stopColor="#C5572C" />
        </radialGradient>
        <linearGradient id="mountainGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#5A4A38" />
          <stop offset="100%" stopColor="#3A2A1C" />
        </linearGradient>
        <linearGradient id="snowGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F4ECDD" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="110" fill="url(#circleGrad2)" />
      
      {/* Left mountain (smaller) */}
      <path d="M 50 175 L 90 95 L 130 175 Z" fill="url(#mountainGrad)" opacity="0.85" />
      <path d="M 90 95 L 75 120 L 105 120 Z" fill="url(#snowGrad)" />
      
      {/* Right mountain (smaller) */}
      <path d="M 130 175 L 170 100 L 210 175 Z" fill="url(#mountainGrad)" opacity="0.85" />
      <path d="M 170 100 L 155 125 L 185 125 Z" fill="url(#snowGrad)" />
      
      {/* Center mountain (largest) */}
      <path d="M 80 180 L 130 70 L 180 180 Z" fill="url(#mountainGrad)" />
      <path d="M 130 70 L 110 105 L 150 105 Z" fill="url(#snowGrad)" />
      
      {/* Flag on tallest peak */}
      <line x1="130" y1="70" x2="130" y2="50" stroke="#FAF7F1" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 130 50 L 148 56 L 130 62 Z" fill="#FAEEDA" />
      
      {/* Subtle shadow at bottom of circle */}
      <ellipse cx="120" cy="200" rx="80" ry="8" fill="rgba(0,0,0,0.12)" />
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

const skip = () => {
  navigate('/signup')
}

  const slide = slides[idx]

  return (
    <div style={styles.frame}>
      <div style={styles.card}>
        <button onClick={skip} style={styles.skipBtn}>Skip</button>

        <div style={styles.illustration}>
          {slide.illustration === 'chain' && <ChainIllustration />}
          {slide.illustration === 'mountain' && <MountainIllustration />}
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
                ...(i === idx ? styles.dotActive : {})
              }}
            />
          ))}
        </div>

        <button onClick={next} style={styles.nextBtn}>
          {idx === slides.length - 1 ? 'Get Started' : 'Continue →'}
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
    minHeight: '600px',
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
  },
  illustration: {
    width: '220px',
    height: '220px',
    margin: '3rem auto 2rem',
  },
  title: {
    fontSize: '26px',
    fontWeight: 600,
    color: '#2A1F15',
    margin: '0 0 1rem',
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
    lineHeight: 1.25,
  },
  body: {
    fontSize: '15px',
    color: '#6B5C4A',
    margin: '0 0 auto',
    textAlign: 'center',
    lineHeight: 1.6,
    fontFamily: 'Georgia, serif',
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
    transition: 'all 0.2s',
  },
  dotActive: {
    background: '#3A2A1C',
    width: '24px',
    borderRadius: '4px',
  },
  nextBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
  },
}