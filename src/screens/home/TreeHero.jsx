import { useMemo, useRef, useEffect } from 'react'

// ===================================================================
// THE VOW TREE
// ===================================================================
// A hand-drawn ink tree that grows one stroke per daily check-in.
// It grows from honesty, not abstinence: it never shrinks, never
// resets, and a slip logged honestly grows it like any other day.
//
// The structure is generated deterministically from a per-user seed,
// so every tree is unique and identical across sessions. Growth is
// simply: show the first `count` elements of the generated sequence.
// The sky behind the tree shifts quietly with the user's mode.
//
// count 0 → the planted seed from onboarding. count 1 → first stem.
// ===================================================================

const MAX_GROWTH = 110

// Small fast deterministic PRNG + string hash
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

const LEAF_COLORS = ['#D9B57A', '#6E8A6A', '#7E9B5A', '#C8A86A']
const SOIL_Y = 146
const BASE_X = 120

function generateTree(seed) {
  const rng = mulberry32(seed)
  const segs = []
  const leaves = []
  let tips = [{ x: BASE_X, y: SOIL_Y, ang: -Math.PI / 2, depth: 0, w: 4.4 }]
  let i = 1

  while (i <= MAX_GROWTH && tips.length > 0) {
    const ti = Math.floor(rng() * tips.length)
    const t = tips[ti]

    const len = Math.max(7, 16 - t.depth * 1.5) * (0.8 + rng() * 0.5)
    let ang = t.ang + (rng() - 0.5) * 0.55
    ang = ang * 0.82 + (-Math.PI / 2) * 0.18   // gentle pull upright

    let x2 = t.x + Math.cos(ang) * len
    let y2 = t.y + Math.sin(ang) * len
    x2 = Math.min(216, Math.max(24, x2))
    y2 = Math.min(SOIL_Y - 4, Math.max(26, y2))

    const mx = (t.x + x2) / 2 + (rng() - 0.5) * 6
    const my = (t.y + y2) / 2 + (rng() - 0.5) * 6

    segs.push({
      idx: i,
      d: `M${t.x.toFixed(1)} ${t.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
      w: Math.max(0.9, t.w),
    })
    i++

    const next = { x: x2, y: y2, ang, depth: t.depth + 1, w: t.w * 0.8 }

    // branch sometimes
    if (t.depth >= 1 && t.depth < 6 && tips.length < 7 && rng() < 0.42) {
      tips.push({ ...next, ang: ang + (0.35 + rng() * 0.45) * (rng() < 0.5 ? -1 : 1), w: next.w * 0.9 })
    }

    tips[ti] = next
    if (next.depth > 7) {
      tips.splice(tips.indexOf(next), 1)
      if (tips.length === 0) tips = [{ x: BASE_X, y: SOIL_Y - 40, ang: -Math.PI / 2, depth: 3, w: 1.6 }]
    }

    // leaves arrive once the tree has some shape
    if (i <= MAX_GROWTH && i > 10 && t.depth >= 2 && rng() < 0.7) {
      leaves.push({
        idx: i,
        x: Math.min(214, Math.max(26, x2 + (rng() - 0.5) * 9)),
        y: Math.min(SOIL_Y - 8, Math.max(24, y2 + (rng() - 0.5) * 9)),
        r: 2.4 + rng() * 2.3,
        c: LEAF_COLORS[Math.floor(rng() * LEAF_COLORS.length)],
      })
      i++
    }
  }
  return { segs, leaves }
}

// Per-mode skies — the part that quietly tells you where you are.
const SKIES = {
  notice:  { top: '#E9E3D9', bottom: '#F5F0E5', ground: '#EDE6D6', sun: { cx: 184, cy: 56, r: 13, o: 0.35 }, extra: 'mist' },
  reflect: { top: '#E4DED6', bottom: '#F3EBDA', ground: '#ECE3D0', sun: { cx: 184, cy: 48, r: 14, o: 0.5 },  extra: null },
  commit:  { top: '#EFE0C8', bottom: '#F8EFDC', ground: '#EFE6D2', sun: { cx: 120, cy: 144, r: 20, o: 0.85 }, extra: null },
  endure:  { top: '#F3EBDA', bottom: '#FBF5E8', ground: '#EFE6D2', sun: { cx: 184, cy: 42, r: 16, o: 0.9 },  extra: null },
  build:   { top: '#F1EBD8', bottom: '#FAF4E6', ground: '#EBE2CD', sun: { cx: 150, cy: 34, r: 17, o: 0.95 }, extra: 'roots' },
  reclaim: { top: '#DDDCD8', bottom: '#EFEBE2', ground: '#E6E1D4', sun: { cx: 184, cy: 48, r: 13, o: 0.25 }, extra: 'rain' },
}

function Rain() {
  const drops = (offset) => {
    const lines = []
    for (let k = 0; k < 9; k++) {
      const x = 30 + k * 22 + (k % 2 === 0 ? 6 : 0) + offset
      const y = 18 + ((k * 37) % 70)
      lines.push(<line key={k} x1={x} y1={y} x2={x - 2.5} y2={y + 9} stroke="#8E939B" strokeWidth="1" strokeLinecap="round" opacity="0.4" />)
    }
    return lines
  }
  return (
    <>
      <g>
        <animateTransform attributeName="transform" type="translate" from="0 -34" to="0 34" dur="1.5s" repeatCount="indefinite" />
        {drops(0)}
      </g>
      <g>
        <animateTransform attributeName="transform" type="translate" from="0 -34" to="0 34" dur="2.1s" repeatCount="indefinite" />
        {drops(11)}
      </g>
    </>
  )
}

export default function TreeHero({
  seed = 'vow',
  mode = 'endure',          // data key, drives the sky only
  count = 0,                // total check-ins ever — the tree's growth
  counter = 'days',         // 'days' | 'tending' | 'standing'
  daysFree = null,          // for counter='days', when a tracker exists
  tendedToday = false,
  onTend,
  caption = null,           // optional override for the line under the count
}) {
  const sky = SKIES[mode] || SKIES.endure
  const tree = useMemo(() => generateTree(hashStr(String(seed))), [seed])

  const shown = Math.min(count, MAX_GROWTH)
  const prevRef = useRef(shown)
  useEffect(() => { prevRef.current = shown }, [shown])
  const prevShown = prevRef.current

  // ---- the line under the tree ----
  let countLine = null, subLine = null
  if (counter === 'days') {
    if (daysFree !== null) {
      countLine = `Day ${daysFree + 1}`
      subLine = caption || 'Your tree grows when you check in — a slip can\u2019t shrink it.'
    } else {
      countLine = 'Your tree'
      subLine = caption || 'It grows a little every time you check in.'
    }
  } else if (counter === 'tending') {
    countLine = count === 0 ? 'Your tree is planted' : `Tended ${count} ${count === 1 ? 'time' : 'times'}`
    subLine = caption || 'It grows a little every time you check in.'
  } else {
    countLine = 'Still standing'
    subLine = caption || 'Rain is how it grows.'
  }

  return (
    <div style={styles.card}>
      <style>{'@keyframes vowGrow { from { opacity: 0; } to { opacity: 1; } }'}</style>

      <div style={styles.skyWrap}>
        <svg viewBox="0 0 240 170" style={{ width: '100%', display: 'block' }} role="img" aria-label="Your tree">
          <defs>
            <linearGradient id="vowSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={sky.top} />
              <stop offset="100%" stopColor={sky.bottom} />
            </linearGradient>
          </defs>

          {/* sky */}
          <rect x="0" y="0" width="240" height="170" fill="url(#vowSky)" />

          {/* sun (drawn before ground so a horizon sun half-sets into it) */}
          <circle cx={sky.sun.cx} cy={sky.sun.cy} r={sky.sun.r} fill="#EAD9B4" opacity={sky.sun.o} />

          {sky.extra === 'rain' && <Rain />}

          {/* ground band + soil line */}
          <rect x="0" y={SOIL_Y} width="240" height={170 - SOIL_Y} fill={sky.ground} />
          <path d={`M16 ${SOIL_Y} H224`} stroke="#3A2A1C" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />

          {sky.extra === 'mist' && (
            <>
              <ellipse cx="86" cy={SOIL_Y - 14} rx="58" ry="9" fill="#FFFFFF" opacity="0.35" />
              <ellipse cx="168" cy={SOIL_Y - 5} rx="52" ry="8" fill="#FFFFFF" opacity="0.28" />
            </>
          )}
          {sky.extra === 'roots' && (
            <>
              <path d={`M${BASE_X - 8} ${SOIL_Y} q-7 8 -16 11`} stroke="#3A2A1C" strokeWidth="1.3" fill="none" opacity="0.35" strokeLinecap="round" />
              <path d={`M${BASE_X} ${SOIL_Y} v12`} stroke="#3A2A1C" strokeWidth="1.3" fill="none" opacity="0.35" strokeLinecap="round" />
              <path d={`M${BASE_X + 8} ${SOIL_Y} q7 8 16 11`} stroke="#3A2A1C" strokeWidth="1.3" fill="none" opacity="0.35" strokeLinecap="round" />
            </>
          )}

          {/* the seed — always there, from the day they planted it */}
          <ellipse cx={BASE_X} cy={SOIL_Y + 4} rx="7" ry="8.5" fill="#7A5A38" stroke="#3A2A1C" strokeWidth="1.2" opacity={shown > 0 ? 0.55 : 1} />

          {/* growth: branches then leaves, in planted order */}
          {tree.segs.filter(s => s.idx <= shown).map(s => (
            <path
              key={`s${s.idx}`}
              d={s.d}
              stroke="#3A2A1C"
              strokeWidth={s.w}
              fill="none"
              strokeLinecap="round"
              style={s.idx > prevShown ? { animation: 'vowGrow 0.9s ease forwards', opacity: 0 } : undefined}
            />
          ))}
          {tree.leaves.filter(l => l.idx <= shown).map(l => (
            <circle
              key={`l${l.idx}`}
              cx={l.x}
              cy={l.y}
              r={l.r}
              fill={l.c}
              style={l.idx > prevShown ? { animation: 'vowGrow 1.1s ease forwards', opacity: 0 } : undefined}
            />
          ))}
        </svg>
      </div>

      <div style={styles.below}>
        <p style={styles.countLine}>{countLine}</p>
        <p style={styles.subLine}>{subLine}</p>

        {tendedToday ? (
          <div style={styles.tendedRow}>
            <span style={styles.tendedTick}>✓</span>
            <span style={styles.tendedText}>Tended today</span>
            <button onClick={onTend} style={styles.tendedUpdate}>Update</button>
          </div>
        ) : (
          <button onClick={onTend} style={styles.tendBtn}>Tend your tree · 30 sec</button>
        )}
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
  },
  skyWrap: { display: 'block' },
  below: { padding: '12px 16px 16px', textAlign: 'center' },
  countLine: { fontSize: '17px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0 },
  subLine: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '3px 0 12px', lineHeight: 1.45 },
  tendBtn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '13px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '0 4px 14px rgba(40,25,10,0.22)',
  },
  tendedRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  tendedTick: { color: '#5F8A4E', fontSize: '15px' },
  tendedText: { fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif' },
  tendedUpdate: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '12px', fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer', textDecoration: 'underline', padding: 0 },
}