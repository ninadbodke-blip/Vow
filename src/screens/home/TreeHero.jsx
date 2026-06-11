import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { buildTree, GROUND_Y, MAX_GROWTH } from './treeEngine'

// ===================================================================
// THE VOW TREE — the home's living hero.
// ===================================================================
// Art + growth rules live in treeEngine.js (pure, tested). This
// component composes the per-mode sky behind it, renders the settled
// tree, and uses GSAP for the two moments of life:
//   • new leaves pop out of their branch when a check-in saves
//   • a slow idle breeze, its rhythm seeded per user
// It grows from honesty: count = total check-ins ever. It never
// shrinks, never resets; a slip logged honestly grows it like any
// other day. count 0 = the planted seed from onboarding.
// ===================================================================

function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

const VIEW_H = 232

// Per-mode skies — the quiet signal of where you are.
const SKIES = {
  // A closer look — pale, misty early light; the sun barely there.
  notice:  { top: '#E5E1D9', bottom: '#F4F0E6', ground: '#ECE5D4', sun: { cx: 184, cy: 56, r: 12, o: 0.3 }, extra: 'mist',
             clouds: [[56, 66, 24, 5.5], [88, 74, 15, 4], [150, 58, 19, 4.5]] },
  // Weighing it up — neutral, even afternoon. Nothing leans.
  reflect: { top: '#E3DACA', bottom: '#F4ECDC', ground: '#EBE2CE', sun: { cx: 184, cy: 48, r: 14, o: 0.55 }, extra: null,
             clouds: [[60, 70, 21, 4.5], [166, 62, 14, 3.5]] },
  // Getting ready — dawn. The sun sits on the horizon, about to rise.
  commit:  { top: '#EFD9B6', bottom: '#FAF0DC', ground: '#EFE6D2', sun: { cx: 120, cy: GROUND_Y - 2, r: 20, o: 0.9 }, extra: 'horizon',
             clouds: [[66, 60, 22, 4.5]] },
  // Early days — clear morning, the ringed sun of held days.
  endure:  { top: '#F3EBDA', bottom: '#FBF5E8', ground: '#EFE6D2', sun: { cx: 192, cy: 46, r: 13, o: 0.9 }, extra: 'ring',
             clouds: [[58, 74, 20, 4.5], [78, 80, 13, 3.5]] },
  // Staying steady — high bright noon, the sun at full strength.
  build:   { top: '#EDEAD4', bottom: '#FAF4E4', ground: '#EAE1CB', sun: { cx: 150, cy: 34, r: 16, o: 0.95 }, extra: 'ring',
             clouds: [[50, 52, 16, 3.5], [176, 64, 12, 3]] },
  // Getting back up — grey rain that the line below answers: rain is how it grows.
  reclaim: { top: '#D2D2CF', bottom: '#E9E6DE', ground: '#E1DDD0', sun: { cx: 184, cy: 48, r: 11, o: 0.2 }, extra: 'rain',
             clouds: [] },
}

function Rain() {
  const drops = (offset) => {
    const lines = []
    for (let k = 0; k < 10; k++) {
      const x = 26 + k * 20 + (k % 2 === 0 ? 6 : 0) + offset
      const y = 14 + ((k * 41) % 150)
      lines.push(<line key={k} x1={x} y1={y} x2={x - 2.5} y2={y + 10} stroke="#8E939B" strokeWidth="1" strokeLinecap="round" opacity="0.4" />)
    }
    return lines
  }
  return (
    <>
      <g>
        <animateTransform attributeName="transform" type="translate" from="0 -44" to="0 44" dur="1.5s" repeatCount="indefinite" />
        {drops(0)}
      </g>
      <g>
        <animateTransform attributeName="transform" type="translate" from="0 -44" to="0 44" dur="2.1s" repeatCount="indefinite" />
        {drops(10)}
      </g>
    </>
  )
}

export default function TreeHero({
  seed = 'vow',
  mode = 'endure',          // data key, drives the sky only
  count = 0,                // total check-ins ever — the tree's growth
  counter = 'days',         // 'days' | 'tending' | 'standing'
  daysFree = null,
  tendedToday = false,
  onTend,
  caption = null,
}) {
  const sky = SKIES[mode] || SKIES.endure
  const shown = Math.min(count, MAX_GROWTH)

  const prevShownRef = useRef(shown)
  const treeGRef = useRef(null)
  const freshGRef = useRef(null)

  // settled art (batched) + the new check-in's leaves, separately
  const built = useMemo(
    () => buildTree(seed, shown, prevShownRef.current),
    [seed, shown]   // prevShownRef is read on purpose; it updates with shown
  )

  // idle breeze — rhythm seeded per user, honours reduced-motion
  useEffect(() => {
    const g = treeGRef.current
    if (!g) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const dur = 5.6 + (hashStr(String(seed)) % 100) / 42
    gsap.set(g, { rotation: -0.65, svgOrigin: `120 ${GROUND_Y}` })
    const tween = gsap.to(g, { rotation: 0.65, duration: dur, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    return () => { tween.kill() }
  }, [seed])

  // the day's new leaves pop out of their branch
  useLayoutEffect(() => {
    const grew = shown > prevShownRef.current
    prevShownRef.current = shown
    const host = freshGRef.current
    if (!grew || !host) return
    const nodes = host.querySelectorAll('path')
    if (nodes.length === 0) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tweens = []
    nodes.forEach((el, i) => {
      tweens.push(gsap.from(el, {
        scale: 0, opacity: 0,
        svgOrigin: `${el.dataset.ox} ${el.dataset.oy}`,
        duration: 0.7, ease: 'back.out(2.2)', delay: 0.08 * i,
      }))
    })
    return () => { tweens.forEach(t => t.kill()) }
  }, [shown])

  // ---- the line under the tree ----
  let countLine = null, subLine = null
  if (counter === 'days') {
    if (daysFree !== null) {
      countLine = `Day ${daysFree + 1}`
      subLine = caption || 'Your tree grows when you check in — a slip can’t shrink it.'
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
  if (!caption && shown >= MAX_GROWTH) {
    subLine = 'A year of tending, in full leaf.'
  }

  return (
    <div style={styles.card}>
      <div style={styles.skyWrap}>
        <svg viewBox={`0 0 240 ${VIEW_H}`} style={{ width: '100%', display: 'block' }} role="img" aria-label="Your tree">
          <defs>
            <linearGradient id="vowSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={sky.top} />
              <stop offset="100%" stopColor={sky.bottom} />
            </linearGradient>
          </defs>

          {/* sky */}
          <rect x="0" y="0" width="240" height={VIEW_H} fill="url(#vowSky)" />
          {(sky.clouds || []).map((c, i) => (
            <ellipse key={i} cx={c[0]} cy={c[1]} rx={c[2]} ry={c[3]} fill="#FFFFFF" opacity={0.42 - i * 0.07} />
          ))}

          {/* sun (a horizon sun half-rises out of the ground band) */}
          {sky.extra === 'horizon' && (
            <ellipse cx={sky.sun.cx} cy={GROUND_Y - 5} rx="78" ry="20" fill="#F0D9A0" opacity="0.35" />
          )}
          <circle cx={sky.sun.cx} cy={sky.sun.cy} r={sky.sun.r} fill="#EAD9B4" opacity={sky.sun.o} />
          {sky.extra === 'ring' && (
            <circle cx={sky.sun.cx} cy={sky.sun.cy} r={sky.sun.r + 4.5} fill="none" stroke="#E6C685" strokeWidth="1.6" opacity="0.5" strokeDasharray="22 7" />
          )}

          {sky.extra === 'rain' && <Rain />}

          {/* ground band + soil line */}
          <rect x="0" y={GROUND_Y} width="240" height={VIEW_H - GROUND_Y} fill={sky.ground} />
          <path d={`M14 ${GROUND_Y} H226`} stroke="#3A2A1C" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />

          {sky.extra === 'mist' && (
            <>
              <ellipse cx="86" cy={GROUND_Y - 12} rx="58" ry="9" fill="#FFFFFF" opacity="0.35" />
              <ellipse cx="168" cy={GROUND_Y - 4} rx="52" ry="8" fill="#FFFFFF" opacity="0.28" />
            </>
          )}

          {/* the tree — settled art batched, the day's new leaves on top */}
          <g ref={treeGRef}>
            <g dangerouslySetInnerHTML={{ __html: built.html }} />
            <g ref={freshGRef}>
              {built.fresh.map((l, i) => (
                <path
                  key={`${shown}-${i}`}
                  d={l.d}
                  fill={l.fill}
                  stroke={l.outline ? '#5F7048' : undefined}
                  strokeWidth={l.outline ? 0.8 : undefined}
                  strokeLinejoin={l.outline ? 'round' : undefined}
                  data-ox={l.ox}
                  data-oy={l.oy}
                />
              ))}
            </g>
          </g>
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