import { useEffect, useRef, useState } from 'react'

// ===================================================================
// ORBIT HERO — the Anchors page sky.
// ===================================================================
// You are the steady light at the centre. Your anchors are bodies
// around you: unreached, they drift far on a faint eccentric path;
// reached (a call, a message, a heartbeat in the last 7 days), they
// pull into a close circular orbit and ride it, names upright.
// The centre light trembles when you're alone out there and settles
// as the orbit fills. Deliberately COMPACT — about half the height
// of the home/motivation heroes, so the crew list stays close.
// Props: berths = [{ id, name, reached }]  (max 3)
// ===================================================================

const ORBIT_CSS = `
@keyframes vowOrbSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
@keyframes vowOrbSpinR { from { transform: rotate(0deg) } to { transform: rotate(-360deg) } }
.vowOrbA { animation: vowOrbSpin linear infinite; transform-origin: 150px 72px; }
.vowOrbA.rev { animation-name: vowOrbSpinR; }
.vowOrbB { animation: vowOrbSpinR linear infinite; transform-box: fill-box; transform-origin: 50% 50%; }
.vowOrbB.rev { animation-name: vowOrbSpin; }
@keyframes vowOrbJitHard { 0%,100% { transform: translate(0,0) } 22% { transform: translate(1.5px,-1px) } 48% { transform: translate(-1.3px,.9px) } 74% { transform: translate(.9px,1.3px) } }
@keyframes vowOrbJitSoft { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-.8px,.6px) } }
@keyframes vowOrbBreathe { 0%,100% { opacity: .85 } 50% { opacity: 1 } }
.vowOrbJit0 { animation: vowOrbJitHard .55s linear infinite; transform-box: fill-box; }
.vowOrbJit1 { animation: vowOrbJitHard .8s linear infinite; transform-box: fill-box; }
.vowOrbJit2 { animation: vowOrbJitSoft 1.6s ease-in-out infinite; transform-box: fill-box; }
.vowOrbCalm { animation: vowOrbBreathe 4.5s ease-in-out infinite; }
@keyframes vowOrbWobble { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-3px,2px) } }
.vowOrbFar { animation: vowOrbWobble 5.5s ease-in-out infinite; transform-box: fill-box; }
@keyframes vowOrbPop { 0% { transform: scale(.2); opacity: 0 } 60% { transform: scale(1.35); opacity: 1 } 100% { transform: scale(1) } }
.vowOrbPop { animation: vowOrbPop .8s cubic-bezier(.3,.8,.4,1.15) both; transform-box: fill-box; transform-origin: 50% 50%; }
@keyframes vowOrbTrail { 0% { stroke-dashoffset: 160; opacity: .9 } 70% { opacity: .7 } 100% { stroke-dashoffset: 0; opacity: 0 } }
.vowOrbTrail { stroke-dasharray: 160; animation: vowOrbTrail 1s ease-out forwards; }
@media (prefers-reduced-motion: reduce) {
  .vowOrbA, .vowOrbB, .vowOrbJit0, .vowOrbJit1, .vowOrbJit2, .vowOrbCalm, .vowOrbFar, .vowOrbPop, .vowOrbTrail { animation: none !important; }
}`

const WORDS = ['Adrift', 'Far apart', 'Pulling closer', 'In orbit', 'Held in orbit']
const FAR = [{ x: 44, y: 30 }, { x: 256, y: 36 }, { x: 236, y: 116 }]
const RINGS = [34, 47, 60]
const SPINS = [11, 15.5, 20]
const DUST = [
  [22, 18, 0.22], [70, 12, 0.16], [128, 22, 0.18], [205, 14, 0.2], [276, 24, 0.15],
  [16, 96, 0.16], [60, 130, 0.18], [200, 134, 0.15], [284, 100, 0.2],
]

const levelFor = (n, r) => {
  if (n === 0) return 0
  if (r === 0) return 1
  if (r === n && n >= 2) return 4
  if ((r === n && n === 1) || r >= 2) return 3
  return 2
}

export default function OrbitHero({ berths = [] }) {
  const crew = berths.slice(0, 3)
  const reachedList = crew.filter(b => b.reached)
  const farList = crew.filter(b => !b.reached)
  const n = crew.length
  const r = reachedList.length
  const lvl = levelFor(n, r)

  // capture animation: which ids just flipped to reached
  const prevRef = useRef({})
  const [captured, setCaptured] = useState(() => new Set())
  useEffect(() => {
    const prev = prevRef.current
    const fresh = crew.filter(b => b.reached && prev[b.id] === false).map(b => b.id)
    const map = {}
    crew.forEach(b => { map[b.id] = b.reached })
    prevRef.current = map
    if (fresh.length) {
      setCaptured(new Set(fresh))
      const t = setTimeout(() => setCaptured(new Set()), 1100)
      return () => clearTimeout(t)
    }
  }, [crew.map(b => `${b.id}:${b.reached}`).join('|')])

  const jitClass = lvl <= 1 ? 'vowOrbJit0' : lvl === 2 ? 'vowOrbJit1' : lvl === 3 ? 'vowOrbJit2' : 'vowOrbCalm'
  const haloOp = [0.16, 0.22, 0.36, 0.55, 0.75][lvl]

  const subLine = lvl >= 4
    ? 'Held in orbit. Nothing tonight can knock you loose.'
    : lvl === 0
      ? 'Add one person. One is enough to bend a path.'
      : lvl === 1
        ? 'They are out there. Reach, and they pull in close.'
        : 'Reach out below \u2014 and watch them pull in close.'

  return (
    <div style={styles.wrap}>
      <style>{ORBIT_CSS}</style>
      <svg viewBox="0 0 300 148" xmlns="http://www.w3.org/2000/svg" style={styles.art}>
        <defs>
          <radialGradient id="vowOrbNight" cx="50%" cy="46%" r="78%">
            <stop offset="0%" stopColor="#2E1C12" /><stop offset="55%" stopColor="#1A100A" /><stop offset="100%" stopColor="#120A05" />
          </radialGradient>
          <radialGradient id="vowOrbHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F6E0A8" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#E8A85C" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#E8A85C" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="300" height="148" fill="url(#vowOrbNight)" />
        {DUST.map(([x, y, o], i) => (
          <circle key={i} cx={x} cy={y} r="0.9" fill="#EFDCAF" opacity={o} />
        ))}

        {/* the far, eccentric path of the unreached */}
        {farList.length > 0 && (
          <ellipse cx="150" cy="72" rx="118" ry="50" fill="none" stroke="#3A2A1C" strokeWidth="0.7" strokeDasharray="3 5" opacity="0.6" />
        )}

        {/* close orbits + travelling bodies, names upright */}
        {reachedList.map((b, j) => {
          const ring = RINGS[j] || RINGS[2]
          const rev = j === 1
          const style = { animationDuration: `${SPINS[j] || 20}s`, animationDelay: `${-(j * 4.1)}s` }
          return (
            <g key={b.id}>
              <circle cx="150" cy="72" r={ring} fill="none" stroke="#C9A85C" strokeWidth="0.8" opacity="0.4" />
              <g className={`vowOrbA${rev ? ' rev' : ''}`} style={style}>
                <g transform={`translate(150, ${72 - ring})`}>
                  <g className={`vowOrbB${rev ? ' rev' : ''}`} style={style}>
                    <g className={captured.has(b.id) ? 'vowOrbPop' : undefined}>
                      <circle cx="0" cy="0" r="6.5" fill="#EFDCAF" opacity="0.18" />
                      <circle cx="0" cy="0" r="2.9" fill="#EFDCAF" />
                      <text x="0" y="12" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="8" fill="#EFDCAF" opacity="0.9">
                        {(b.name || '').slice(0, 10)}
                      </text>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          )
        })}

        {/* capture trails for the just-reached */}
        {crew.map((b, i) => {
          if (!captured.has(b.id)) return null
          const j = reachedList.findIndex(x => x.id === b.id)
          const ring = RINGS[j] || RINGS[2]
          const f = FAR[i] || FAR[0]
          return (
            <line key={`t${b.id}`} className="vowOrbTrail"
              x1={f.x} y1={f.y} x2="150" y2={72 - ring}
              stroke="#C9A85C" strokeWidth="1" strokeLinecap="round" />
          )
        })}

        {/* the unreached, drifting far */}
        {crew.map((b, i) => {
          if (b.reached) return null
          const f = FAR[i] || FAR[0]
          return (
            <g key={b.id} className="vowOrbFar" style={{ animationDelay: `${-(i * 1.7)}s` }}>
              <circle cx={f.x} cy={f.y} r="2.3" fill="#8A7660" />
              <text x={f.x} y={f.y + 11} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="8" fill="#7A6A58">
                {(b.name || '').slice(0, 10)}
              </text>
            </g>
          )
        })}

        {/* YOU — the centre light */}
        <circle cx="150" cy="72" r="26" fill="url(#vowOrbHalo)" style={{ opacity: haloOp, transition: 'opacity 1.4s' }} />
        <g className={jitClass}>
          <circle cx="150" cy="72" r="9" fill="#F6E0A8" opacity="0.15" />
          <circle cx="150" cy="72" r="4.3" fill="#F6E0A8" />
        </g>
      </svg>

      <div style={styles.under}>
        <p style={styles.steadyLine}>
          {n === 0 ? 'No anchors yet' : `${WORDS[lvl]} \u00B7 ${r} of ${n} in orbit`}
        </p>
        <div style={styles.hairline} />
        <p style={styles.hintLine}>The right people pull you into a steadier orbit.</p>
        <p style={styles.subLine}>{subLine}</p>
      </div>
    </div>
  )
}

const styles = {
  wrap: { borderRadius: '22px', overflow: 'hidden', boxShadow: '0 14px 34px -10px rgba(20,10,4,0.5), inset 0 0 46px rgba(0,0,0,0.3)' },
  art: { display: 'block', width: '100%', height: 'auto' },
  under: { padding: '11px 14px 13px', textAlign: 'center', background: 'linear-gradient(180deg, #241710 0%, #2E1C12 100%)' },
  steadyLine: { fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D9B57A', fontFamily: 'Georgia, serif', margin: '0 0 7px' },
  hairline: { width: '54px', height: '1px', background: 'linear-gradient(90deg, transparent, #C9A85C, transparent)', margin: '0 auto 8px' },
  hintLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '12.5px', color: '#FAF7F1', lineHeight: 1.5, margin: 0 },
  subLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '10.5px', color: '#CBBA98', margin: '7px 0 0' },
}