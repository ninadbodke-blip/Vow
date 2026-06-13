import { useEffect, useMemo, useRef, useState } from 'react'

// ===================================================================
// THE ORACLE POOL — the tree, reflected in still water at dusk.
// ===================================================================
// The third element. Home is the tree by day (earth); Motivation is
// the tree by night (sky); the Oracle is water — a mirror that shows
// you yourself. Clarity is earned by tending: the more of the last
// seven days you've checked in, the stiller the water and the
// sharper the reflection. Once a day, a pebble can be dropped: the
// surface stirs, settles, and one true thing from the week surfaces.
//
// Props: { clarity 0-100, daysTended 0-7, pebbleCount 0-7,
//          pebbleToday bool, insight string|null, onPebble() }
// onPebble fires only on the first tap of the day; every tap ripples.
// ===================================================================

const ORACLE_CSS = `
@keyframes vowPoolShimmer { from { transform: translateX(-300px) } to { transform: translateX(300px) } }
@keyframes vowPoolSway { 0%,100% { transform: rotate(-2.5deg) } 50% { transform: rotate(2.5deg) } }
@keyframes vowPoolFly { 0%,100% { transform: translate(0,0); opacity: .15 } 25% { opacity: .7 } 50% { transform: translate(8px,-6px); opacity: .25 } 75% { opacity: .6 } }
@keyframes vowPoolTwinkle { 0%,100% { opacity: .45 } 50% { opacity: 1 } }
@keyframes vowPoolWobble { 0%,100% { transform: translateX(0) } 50% { transform: translateX(2px) } }
@keyframes vowPoolHint { 0%,100% { opacity: .4 } 50% { opacity: .85 } }
@keyframes vowPoolRing { from { width: 6px; height: 6px; opacity: .9 } to { width: 120px; height: 120px; opacity: 0 } }
@keyframes vowPoolFall { from { margin-top: -46px; opacity: .9 } to { margin-top: 0; opacity: 0 } }
@keyframes vowPoolPop { 0% { transform: scale(.4); opacity: 0 } 40% { transform: scale(1.25); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
.vowPoolSh { animation: vowPoolShimmer linear infinite; }
.vowPoolReed { transform-box: fill-box; transform-origin: bottom center; animation: vowPoolSway ease-in-out infinite; }
.vowPoolFly { transform-box: fill-box; animation: vowPoolFly ease-in-out infinite; }
.vowPoolStar { animation: vowPoolTwinkle 3.2s ease-in-out infinite; }
.vowPoolRStar { transform-box: fill-box; animation: vowPoolWobble 3.4s ease-in-out infinite; }
.vowPoolHintT { animation: vowPoolHint 2.6s ease-in-out infinite; }
.vowPoolRingD { position: absolute; border: 1.2px solid rgba(217,181,122,0.7); border-radius: 50%; transform: translate(-50%,-50%); pointer-events: none; animation: vowPoolRing 1.5s ease-out forwards; }
.vowPoolPebD { position: absolute; width: 5px; height: 4px; background: #B8A88E; border-radius: 50%; transform: translate(-50%,-50%); pointer-events: none; animation: vowPoolFall .38s ease-in forwards; }
.vowPoolPopG { transform-box: fill-box; transform-origin: center; animation: vowPoolPop .7s ease forwards; }
@media (prefers-reduced-motion: reduce) {
  .vowPoolSh, .vowPoolReed, .vowPoolFly, .vowPoolStar, .vowPoolRStar, .vowPoolHintT { animation: none !important; }
}`

export default function OraclePool({ clarity = 0, daysTended = 0, pebbleCount = 0, pebbleToday = false, insight = null, onPebble }) {
  const wrapRef = useRef(null)
  const dispRef = useRef(null)
  const settleRaf = useRef(null)
  const [ripples, setRipples] = useState([])
  const prevPebbles = useRef(pebbleCount)
  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const baseScale = Math.max(1.5, 16 - clarity * 0.145)
  const reflOpacity = Math.min(0.95, 0.45 + clarity * 0.005)

  useEffect(() => {
    if (dispRef.current) dispRef.current.setAttribute('scale', baseScale.toFixed(1))
    return () => { if (settleRaf.current) cancelAnimationFrame(settleRaf.current) }
  }, [baseScale])

  const justFilled = pebbleCount > prevPebbles.current
  useEffect(() => { prevPebbles.current = pebbleCount }, [pebbleCount])

  const handleTap = (e) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const scaleF = rect.width / 300
    if (y < 96 * scaleF || y > 216 * scaleF) return

    const id = Date.now()
    setRipples((r) => [...r, { id, x, y }])
    setTimeout(() => setRipples((r) => r.filter((q) => q.id !== id)), 1600)

    if (!reduceMotion && dispRef.current) {
      const bump = baseScale + 9
      dispRef.current.setAttribute('scale', bump.toFixed(1))
      const t0 = performance.now()
      const settle = (t) => {
        const k = Math.min(1, (t - t0) / 1600)
        dispRef.current?.setAttribute('scale', (bump + (baseScale - bump) * k).toFixed(1))
        if (k < 1) settleRaf.current = requestAnimationFrame(settle)
      }
      setTimeout(() => { settleRaf.current = requestAnimationFrame(settle) }, 380)
    }

    if (!pebbleToday && onPebble) onPebble()
  }

  // 7 shore pebbles along the near bank
  const pebbles = []
  for (let i = 0; i < 7; i++) {
    const x = 78 + i * 24
    const y = 221 - Math.sin((i / 6) * Math.PI) * 4
    const filled = i < pebbleCount
    const isNewest = filled && i === pebbleCount - 1 && justFilled
    pebbles.push(
      filled ? (
        <g key={i} className={isNewest ? 'vowPoolPopG' : undefined}>
          <ellipse cx={x} cy={y} rx="5.2" ry="3.6" fill="#C9A85C" opacity="0.92" />
          <ellipse cx={x - 1.4} cy={y - 1} rx="1.6" ry="1" fill="#F3E2B8" opacity="0.75" />
        </g>
      ) : (
        <ellipse key={i} cx={x} cy={y} rx="5.2" ry="3.6" fill="none" stroke="#4A372A" strokeWidth="1" />
      )
    )
  }


  return (
    <div style={S.pool} ref={wrapRef} onClick={handleTap}>
      <style>{ORACLE_CSS}</style>
      <svg style={S.art} viewBox="0 0 300 230" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="vowPoolDusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A1610" /><stop offset="50%" stopColor="#4A2818" />
            <stop offset="82%" stopColor="#9A5A28" /><stop offset="100%" stopColor="#D89A55" />
          </linearGradient>
          <linearGradient id="vowPoolWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#321B0D" /><stop offset="16%" stopColor="#1F1109" /><stop offset="100%" stopColor="#120A05" />
          </linearGradient>
          <filter id="vowPoolDistort" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="2" seed="7" result="n">
              {!reduceMotion && (
                <animate attributeName="baseFrequency" dur="9s" values="0.012 0.045;0.015 0.075;0.012 0.045" repeatCount="indefinite" />
              )}
            </feTurbulence>
            <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* DUSK SKY */}
        <rect x="0" y="0" width="300" height="96" fill="url(#vowPoolDusk)" />
        <ellipse cx="150" cy="97" rx="120" ry="16" fill="#F0B470" opacity="0.35" />
        <circle className="vowPoolStar" cx="58" cy="22" r="1.3" fill="#F6E8C4" />
        <circle className="vowPoolStar" style={{ animationDelay: '1.2s' }} cx="232" cy="16" r="1" fill="#F6E8C4" />
        <circle className="vowPoolStar" style={{ animationDelay: '0.6s' }} cx="196" cy="34" r="1.9" fill="#FAF0D6" />
        <ellipse className="vowPoolSh" style={{ animationDuration: '150s' }} cx="150" cy="26" rx="44" ry="5" fill="#F6E8C4" opacity="0.07" />

        {/* SHORE + TREE + REEDS */}
        <path d="M0 92 Q150 86 300 92 L300 100 Q150 94 0 100 Z" fill="#1A0F08" />
        <g>
          <path d="M128.6 94 L128.6 70 Q130 67 131.4 70 L131.4 94 Z" fill="#241405" />
          <ellipse cx="130" cy="58" rx="21" ry="15" fill="#2E1A08" />
          <ellipse cx="118" cy="64" rx="12" ry="9" fill="#2E1A08" />
          <ellipse cx="142" cy="63" rx="12" ry="9" fill="#2E1A08" />
          <ellipse cx="130" cy="58" rx="21" ry="15" fill="#D89A55" opacity="0.18" />
        </g>
        <g className="vowPoolReed" style={{ animationDuration: '5s' }}>
          <path d="M236 94 Q238 76 235 62" stroke="#241405" strokeWidth="2" fill="none" />
          <ellipse cx="235" cy="60" rx="2.2" ry="6" fill="#241405" />
        </g>
        <g className="vowPoolReed" style={{ animationDuration: '6.4s', animationDelay: '0.8s' }}>
          <path d="M248 94 Q249 80 247 70" stroke="#241405" strokeWidth="1.6" fill="none" />
          <ellipse cx="247" cy="68" rx="1.8" ry="5" fill="#241405" />
        </g>
        <circle className="vowPoolFly" style={{ animationDuration: '9s' }} cx="222" cy="78" r="1.4" fill="#E8C77F" />
        <circle className="vowPoolFly" style={{ animationDuration: '12s', animationDelay: '3s' }} cx="64" cy="84" r="1.2" fill="#E8C77F" />

        {/* WATER */}
        <rect x="0" y="96" width="300" height="134" fill="url(#vowPoolWater)" />
        <ellipse cx="150" cy="100" rx="120" ry="9" fill="#F0B470" opacity="0.20" />

        {/* THE REFLECTION — distorted by the living water */}
        <g filter="url(#vowPoolDistort)" opacity={reflOpacity}>
          <ellipse cx="150" cy="103" rx="120" ry="7" fill="#F0B470" opacity="0.38" />
          <g stroke="#EFDCAF" fill="none" strokeLinecap="round">
            <path d="M130 100 L130 126" strokeWidth="2.4" opacity="0.95" />
            <path d="M130 112 Q122 119 114 124" strokeWidth="1.2" opacity="0.72" />
            <path d="M130 114 Q138 121 146 127" strokeWidth="1.2" opacity="0.72" />
            <ellipse cx="130" cy="138" rx="20" ry="13" strokeWidth="1.1" opacity="0.66" />
            <ellipse cx="119" cy="132" rx="11" ry="8" strokeWidth="1" opacity="0.52" />
            <ellipse cx="141" cy="131" rx="11" ry="8" strokeWidth="1" opacity="0.52" />
          </g>
          <g fill="#F6E8C4">
            <circle cx="124" cy="135" r="1.4" opacity="0.9" /><circle cx="136" cy="139" r="1.2" opacity="0.8" />
            <circle cx="130" cy="146" r="1.1" opacity="0.7" /><circle cx="118" cy="128" r="1" opacity="0.65" />
            <circle cx="143" cy="127" r="1" opacity="0.65" />
          </g>
          <circle className="vowPoolRStar" cx="196" cy="118" r="1.6" fill="#FAF0D6" opacity="0.8" />
        </g>

        {/* shimmer bands */}
        <ellipse className="vowPoolSh" style={{ animationDuration: '34s' }} cx="150" cy="128" rx="60" ry="1.6" fill="#E8C77F" opacity="0.14" />
        <ellipse className="vowPoolSh" style={{ animationDuration: '46s', animationDelay: '-20s' }} cx="150" cy="156" rx="44" ry="1.3" fill="#E8C77F" opacity="0.10" />
        <ellipse className="vowPoolSh" style={{ animationDuration: '58s', animationDelay: '-9s' }} cx="150" cy="184" rx="70" ry="1.6" fill="#E8C77F" opacity="0.07" />

        {/* tap hint — only until today's pebble is dropped */}
        {!pebbleToday && (
          <text className="vowPoolHintT" x="150" y="178" textAnchor="middle"
            fontFamily="Georgia, serif" fontStyle="italic" fontSize="10.5" fill="#F3E2B8">
            Tap the water
          </text>
        )}

        {/* NEAR SHORE + the week's pebbles */}
        <path d="M0 218 Q150 208 300 218 L300 230 L0 230 Z" fill="#120A05" />
        <g>{pebbles}</g>
      </svg>

      {/* HTML overlays: falling pebble + expanding rings */}
      {ripples.map((r) => (
        <span key={r.id}>
          <span className="vowPoolPebD" style={{ left: r.x, top: r.y }} />
          <span className="vowPoolRingD" style={{ left: r.x, top: r.y }} />
          <span className="vowPoolRingD" style={{ left: r.x, top: r.y, animationDelay: '0.18s' }} />
          <span className="vowPoolRingD" style={{ left: r.x, top: r.y, animationDelay: '0.36s' }} />
        </span>
      ))}

      <div style={S.under}>
        <p style={S.clarityLine}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D9B57A" strokeWidth="2" style={{ marginRight: 7, verticalAlign: '-1px' }}><circle cx="12" cy="12" r="8" /></svg>
          Checked in {daysTended} of the last 7 days
        </p>
        <div style={S.hairline} />
        <p style={S.eyebrow}>Today&rsquo;s reflection</p>
        <p style={S.insight}>
          {insight || 'Tap the water above to see one honest thing about your week.'}
        </p>
        <p style={S.pebNote}>
          One reflection a day &middot; {pebbleCount} of 7 collected this week
        </p>
      </div>
    </div>
  )
}

const S = {
  pool: { position: 'relative', borderRadius: 24, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 14px 36px -10px rgba(30,16,6,0.55), inset 0 0 50px rgba(0,0,0,0.28)' },
  art: { display: 'block', width: '100%', height: 'auto' },
  under: { padding: '13px 16px 15px', textAlign: 'center', background: 'linear-gradient(180deg, #241710 0%, #2E1C12 100%)' },
  clarityLine: { fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D9B57A', fontFamily: 'Georgia, serif', margin: '0 0 8px' },
  hairline: { width: 54, height: 1, background: 'linear-gradient(90deg, transparent, #C9A85C, transparent)', margin: '0 auto 9px' },
  eyebrow: { fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(217,181,122,0.65)', fontFamily: 'Georgia, serif', margin: '0 0 7px' },
  insight: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14.5, color: '#FAF7F1', lineHeight: 1.58, margin: 0, minHeight: 42, transition: 'opacity 0.4s' },
  pebNote: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10.5, color: '#CBBA98', margin: '9px 0 0' },
}