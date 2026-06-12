// ===================================================================
// MILESTONE PLATE — "The Turning of the Light."
// ===================================================================
// One world, painted at any day of the journey. A parametric painter:
// day → t (0..1) → pre-dawn (Day Zero) → dawn + sprout → noon over a
// growing tree → golden hour → dusk and first stars → deep night with
// a day-seeded constellation → and, on the FINAL milestone only, the
// crown: the night constellation settling onto the full canopy.
// Pure component — give it { day, label, isFinal, anim }.
// Catalog values come from the DB; this paints whatever it is given.
// ===================================================================

// curve anchors: how the year spends its light
const ANCHORS = [[0, 0], [1, 0.06], [7, 0.20], [14, 0.30], [30, 0.44], [60, 0.58], [90, 0.70], [180, 0.86], [365, 1]]

export function dayToT(day) {
  if (day <= 0) return 0
  if (day >= 365) return 1
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const [ad, at] = ANCHORS[i], [bd, bt] = ANCHORS[i + 1]
    if (day >= ad && day < bd) return at + (bt - at) * (day - ad) / (bd - ad)
  }
  return 1
}

// the floater's voice — exact lines for the named days, warm ranges between
export function lineFor(day, label) {
  const exact = {
    0: 'The decision, made in the dark. Everything starts here.',
    1: 'The hardest sunrise is behind you.',
    7: 'A full week. Proof it can be done.',
    14: 'Two weeks. The roots have started to hold.',
    21: 'Three weeks. The new normal is forming.',
    30: 'A whole month. The tree is real now.',
    50: 'Fifty days. A number with weight.',
    60: 'Two months. The light is turning gold, and so are you.',
    90: 'A quarter of a year. Night falls, and it holds no fear.',
    100: 'One hundred days. Say it out loud, once.',
    180: 'Half a year of sky. The stars know your name by now.',
    222: 'Two hundred and twenty-two. The kind of number you keep.',
    365: 'One year. The day tree and the night sky, one and the same.',
  }
  if (exact[day]) return exact[day]
  if (day < 7) return `${label}. The mornings are starting to add up.`
  if (day < 14) return 'Past the first week, and still standing.'
  if (day < 30) return `${label}. Quietly stacking, day on day.`
  if (day < 50) return 'The weeks are stacking like rings in the trunk.'
  if (day < 90) return `${label}, deep in the golden stretch.`
  if (day < 180) return 'The stars are gathering, one steady day at a time.'
  if (day < 300) return `${label}. Deep night, held without fear.`
  return `${label}. The sky is nearly full.`
}

// page-level CSS (inject once on the screen that renders plates)
export const MILESTONE_PLATE_CSS = `
@keyframes vowMsTwk { 0%,100% { opacity: .5 } 50% { opacity: 1 } }
.vowMsTw { animation: vowMsTwk 2.8s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .vowMsTw { animation: none !important; } }`

// time-of-day keyframes: t, skyTop, skyMid, horizon, ground, sun, canopy, trunk
const KEYS = [
  [0.00, '#1A1210', '#241710', '#3A2415', '#150D07', 0, '#2E2A18', '#241708'],
  [0.06, '#F2D6A6', '#F6E2BC', '#F0BC7E', '#7A653C', 1, '#7E7A3C', '#5A4326'],
  [0.28, '#EAE0BC', '#F4ECD0', '#EFD7A2', '#6E5C36', 1, '#6E7A38', '#523E22'],
  [0.50, '#E8C892', '#EFD3A0', '#E8A85C', '#5C4A2C', 1, '#5E6630', '#46341E'],
  [0.64, '#B07238', '#C98D4A', '#E8A85C', '#3C2C18', 0.55, '#4A4A26', '#3A2A18'],
  [0.80, '#4A2818', '#7A4424', '#C98D4A', '#241710', 0, '#33301C', '#2A1C10'],
  [1.00, '#170D08', '#241710', '#4A2818', '#140B06', 0, '#241F12', '#1E140A'],
]
const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const xh = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
const mix = (a, b, k) => a + (b - a) * k
const mixHex = (a, b, k) => xh(hx(a).map((v, i) => mix(v, hx(b)[i], k)))
function env(t) {
  let i = 0
  while (i < KEYS.length - 2 && KEYS[i + 1][0] < t) i++
  const A = KEYS[i], B = KEYS[i + 1], k = (t - A[0]) / (B[0] - A[0] || 1)
  return {
    top: mixHex(A[1], B[1], k), mid: mixHex(A[2], B[2], k), hor: mixHex(A[3], B[3], k),
    ground: mixHex(A[4], B[4], k), sun: mix(A[5], B[5], k),
    canopy: mixHex(A[6], B[6], k), trunk: mixHex(A[7], B[7], k),
  }
}
const rnd = (i, s) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x) }

export default function MilestonePlate({ day = 0, label = '', isFinal = false, anim = false }) {
  const t = isFinal ? 1 : Math.min(dayToT(day), 0.985)
  const e = env(t)
  const gid = `vowMs${day}`

  const sunK = Math.max(0, Math.min(1, (t - 0.05) / 0.75))
  const sunX = 56 + sunK * 160
  const sunY = 66 - Math.sin(sunK * Math.PI) * 38
  const moonUp = Math.max(0, (t - 0.62) / 0.38)
  const moonY = 70 - moonUp * 40

  const s = 0.16 + t * 0.96
  const baseY = 158
  const trunkH = 46 * s
  const canR = 26 * s
  const ty = baseY - trunkH

  const starN = t <= 0.5 ? 0 : Math.round(Math.pow((t - 0.5) / 0.5, 1.15) * 34)
  const stars = []
  for (let i = 0; i < starN; i++) {
    stars.push({
      x: (14 + rnd(i, day * 0.137 + 1) * 272).toFixed(1),
      y: (10 + rnd(i, day * 0.137 + 2) * 70).toFixed(1),
      r: (0.8 + rnd(i, day * 0.137 + 3) * 1.1).toFixed(2),
      o: (0.4 + rnd(i, day + 5) * 0.5).toFixed(2),
      d: (rnd(i, 4) * 2).toFixed(1),
    })
  }

  const CROWN_P = [[150, 86], [136, 96], [164, 96], [128, 108], [172, 108], [150, 72], [142, 82], [158, 82], [150, 100]]
  const CROWN_E = [[0, 5], [0, 6], [0, 7], [6, 1], [7, 2], [1, 3], [2, 4], [0, 8]]

  return (
    <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={e.top} /><stop offset="55%" stopColor={e.mid} /><stop offset="100%" stopColor={e.hor} />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill={`url(#${gid})`} />

      {stars.map((st, i) => (
        <circle key={i} className={anim ? 'vowMsTw' : undefined} style={anim ? { animationDelay: `${st.d}s` } : undefined}
          cx={st.x} cy={st.y} r={st.r} fill="#F6E8C4" opacity={st.o} />
      ))}

      {e.sun > 0.02 && (
        <>
          <circle cx={sunX.toFixed(0)} cy={sunY.toFixed(0)} r="13" fill="#F6E0A8" opacity={e.sun.toFixed(2)} />
          <circle cx={sunX.toFixed(0)} cy={sunY.toFixed(0)} r="22" fill="#F6E0A8" opacity={(e.sun * 0.25).toFixed(2)} />
        </>
      )}
      {moonUp > 0.05 && (
        <>
          <circle cx="216" cy={moonY.toFixed(0)} r="10" fill="#EFDCAF" opacity={(0.4 + moonUp * 0.5).toFixed(2)} />
          <circle cx="213" cy={(moonY - 2).toFixed(0)} r="2.4" fill="#241710" opacity="0.12" />
        </>
      )}

      <path d="M0 156 Q150 146 300 156 L300 200 L0 200 Z" fill={e.ground} />

      {/* flora: the seed, the sprout, the tree */}
      {t < 0.02 ? (
        <>
          <ellipse cx="150" cy={baseY - 1} rx="6.5" ry="2.6" fill={e.trunk} />
          <circle className={anim ? 'vowMsTw' : undefined} cx="150" cy="44" r="1.8" fill="#F6E8C4" opacity="0.9" />
          <circle cx="150" cy="44" r="4" fill="#F6E8C4" opacity="0.15" />
        </>
      ) : t < 0.10 ? (
        <>
          <path d={`M150 ${baseY} Q149 ${baseY - 9} 150 ${baseY - 12}`} stroke={e.trunk} strokeWidth="1.6" fill="none" />
          <ellipse cx="146" cy={baseY - 12} rx="4.5" ry="2.6" fill={e.canopy} transform={`rotate(-28 146 ${baseY - 12})`} />
          <ellipse cx="154" cy={baseY - 13} rx="4.5" ry="2.6" fill={e.canopy} transform={`rotate(26 154 ${baseY - 13})`} />
        </>
      ) : (
        <>
          <path d={`M${150 - 2.6 * s} ${baseY} L${150 - 1.4 * s} ${ty} Q150 ${ty - 3} ${150 + 1.4 * s} ${ty} L${150 + 2.6 * s} ${baseY} Z`} fill={e.trunk} />
          {t > 0.3 && (
            <>
              <path d={`M150 ${baseY - trunkH * 0.55} Q${150 - 14 * s} ${baseY - trunkH * 0.75} ${150 - 20 * s} ${baseY - trunkH * 0.85}`} stroke={e.trunk} strokeWidth={(2 * s).toFixed(1)} fill="none" />
              <path d={`M150 ${baseY - trunkH * 0.62} Q${150 + 14 * s} ${baseY - trunkH * 0.82} ${150 + 20 * s} ${baseY - trunkH * 0.92}`} stroke={e.trunk} strokeWidth={(2 * s).toFixed(1)} fill="none" />
            </>
          )}
          <ellipse cx="150" cy={(ty - canR * 0.55).toFixed(1)} rx={(canR * 1.5).toFixed(1)} ry={canR.toFixed(1)} fill={e.canopy} />
          <ellipse cx={(150 - canR * 1.1).toFixed(1)} cy={(ty - canR * 0.2).toFixed(1)} rx={(canR * 0.9).toFixed(1)} ry={(canR * 0.65).toFixed(1)} fill={e.canopy} />
          <ellipse cx={(150 + canR * 1.1).toFixed(1)} cy={(ty - canR * 0.2).toFixed(1)} rx={(canR * 0.9).toFixed(1)} ry={(canR * 0.65).toFixed(1)} fill={e.canopy} />
          <ellipse cx="150" cy={(ty - canR * 0.55).toFixed(1)} rx={(canR * 1.5).toFixed(1)} ry={canR.toFixed(1)} fill="#E8C77F" opacity={(t > 0.45 && t < 0.85 ? 0.16 : 0.06).toFixed(2)} />
        </>
      )}

      {/* the crown — the final milestone only */}
      {isFinal && (
        <>
          <ellipse cx="150" cy="96" rx="52" ry="34" fill="#EFDCAF" opacity="0.12" />
          {CROWN_E.map(([a, b], i) => (
            <line key={i} x1={CROWN_P[a][0]} y1={CROWN_P[a][1]} x2={CROWN_P[b][0]} y2={CROWN_P[b][1]} stroke="#C9A85C" strokeWidth="0.9" opacity="0.7" />
          ))}
          {CROWN_P.map(([x, y], i) => (
            <circle key={i} className={anim ? 'vowMsTw' : undefined} style={anim ? { animationDelay: `${(i * 0.3).toFixed(1)}s` } : undefined}
              cx={x} cy={y} r={i === 0 ? 2.6 : 1.8} fill="#F6E8C4" />
          ))}
        </>
      )}

      {/* the day's small company: birds, fireflies, a shooting star */}
      {t > 0.18 && t < 0.5 && (
        <path d="M86 52 q5 -4 10 0 M99 56 q4 -3 8 0" stroke={mixHex('#5A4326', '#2A1F15', t)} strokeWidth="1.1" fill="none" strokeLinecap="round" />
      )}
      {t > 0.55 && t < 0.95 && (
        <>
          <circle className={anim ? 'vowMsTw' : undefined} cx="98" cy="142" r="1.3" fill="#E8C77F" />
          <circle className={anim ? 'vowMsTw' : undefined} style={anim ? { animationDelay: '1.1s' } : undefined} cx="206" cy="150" r="1.1" fill="#E8C77F" />
        </>
      )}
      {t > 0.8 && anim && (
        <line x1={(40 + rnd(1, day) * 40).toFixed(0)} y1="20" x2={(58 + rnd(1, day) * 40).toFixed(0)} y2="27"
          stroke="#F6E8C4" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      )}
    </svg>
  )
}