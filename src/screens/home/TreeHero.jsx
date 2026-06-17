import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { buildTree, GROUND_Y, MAX_GROWTH, BIRD_SCHEDULE } from './treeEngine'
import JarCounter from './JarCounter'
import DayOneCounter from './DayOneCounter'

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

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Bird flight + wing-flap live in CSS (cheap, GPU-friendly); GSAP handles
// the canopy rustle and vine sway because those targets live inside the
// engine's injected SVG string.
const MOTION_CSS = `
@keyframes vowFly { from { transform: translateX(-46px); } to { transform: translateX(286px); } }
@keyframes vowBob { from { transform: translateY(-2.5px); } to { transform: translateY(2.5px); } }
@keyframes vowWing { from { transform: scaleY(1); } to { transform: scaleY(0.45); } }
@keyframes vowDrift { from { transform: translateX(-260px); } to { transform: translateX(260px); } }
@media (prefers-reduced-motion: reduce) {
  .vowFly, .vowBob, .vowWing, .vowCloud { animation: none !important; }
}`

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
  commit:  { top: '#EFD9B6', bottom: '#FAF0DC', ground: '#EFE6D2', sun: { cx: 66, cy: GROUND_Y - 2, r: 20, o: 0.9 }, extra: 'horizon',
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
  rustleSignal = 0,
  caption = null,
  trackerStartISO = null,
  commitTargetISO = null,
  onSetDay = null,
  trackerId = null,
  onStartChanged = null,
}) {
  const sky = SKIES[mode] || SKIES.endure
  const shown = Math.min(count, MAX_GROWTH)

  const prevShownRef = useRef(shown)
  const freshGRef = useRef(null)
  const artRef = useRef(null)

  // 1-second heartbeat for the live tickers (commit countdown / endure count-up)
  const [, setTickNow] = useState(0)
  useEffect(() => {
    const ticking = (counter === 'days' && trackerStartISO) || (mode === 'commit' && commitTargetISO)
    if (!ticking) return
    const id = setInterval(() => setTickNow((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [counter, mode, trackerStartISO, commitTargetISO])

  // settled art (batched) + the new check-in's leaves, separately
  const built = useMemo(
    () => buildTree(seed, shown, prevShownRef.current),
    [seed, shown]   // prevShownRef is read on purpose; it updates with shown
  )

  // the rustle — each batched canopy layer sways on its own rhythm, slightly
  // out of phase with the others, so the foliage shimmers against the wood;
  // vines swing from where they hang. Re-bound whenever the art re-renders.
  useEffect(() => {
    const root = artRef.current
    if (!root || reducedMotion()) return
    const tweens = []
    root.querySelectorAll('.vow-canopy').forEach((el, i) => {
      const dur = 1.9 + ((i * 0.37) % 1.6)
      const amp = 0.8 + ((i * 0.23) % 0.8)
      tweens.push(gsap.fromTo(el,
        { rotation: -amp, y: 0, transformOrigin: '50% 45%' },
        { rotation: amp, y: 0.6, transformOrigin: '50% 45%', duration: dur, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: (i * 0.31) % 1.4 },
      ))
    })
    root.querySelectorAll('.vow-vine').forEach((el, i) => {
      tweens.push(gsap.fromTo(el,
        { rotation: -2.2, transformOrigin: '50% 0%' },
        { rotation: 2.2, transformOrigin: '50% 0%', duration: 2.3 + i * 0.55, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.35 },
      ))
    })
    return () => { tweens.forEach(tw => tw.kill()) }
  }, [built])

  // a one-time BOOM of leaves when a check-in is tended — the foliage
  // swells and settles, while the trunk/branches stay put. Targets the
  // batched `.vow-canopy` paths and scale-pops them. Uses the SAME
  // transformOrigin ('50% 45%') the idle sway uses (passed in GSAP vars,
  // not inline CSS — GSAP resolves it against the SVG bbox, which works in
  // WebView), so the boom and the idle sway share one origin and never
  // fight. Deferred a frame so any tree rebuild has settled.
  useEffect(() => {
    if (!rustleSignal) return
    const root = artRef.current
    if (!root || reducedMotion()) return
    const raf = requestAnimationFrame(() => {
      const leaves = root.querySelectorAll('.vow-canopy')
      if (!leaves.length) return
      leaves.forEach((el, i) => {
        gsap.fromTo(el,
          { scale: 1, transformOrigin: '50% 45%' },
          {
            scale: 1.18, duration: 0.28, ease: 'back.out(3)',
            transformOrigin: '50% 45%',
            delay: i * 0.07,
            yoyo: true, repeat: 1,
            overwrite: false,
          }
        )
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [rustleSignal])

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

  // ---- the line under the tree (live tickers for endure + commit) ----
  const pad2 = (n) => String(n).padStart(2, '0')
  const friendly = (iso) => {
    const [fy, fm, fd] = iso.split('-').map(Number)
    return new Date(fy, fm - 1, fd).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
  }
  const nowMs = Date.now()

  let countLine = null, tickLine = null, subLine = null, bigIsTick = false, showSetDay = false
  if (counter === 'days') {
    const startMs = trackerStartISO ? new Date(trackerStartISO).getTime() : null
    if (startMs && startMs <= nowMs) {
      const el = nowMs - startMs
      const d = Math.floor(el / 86400000)
      if (mode === 'endure') {
        countLine = `Day ${d + 1}`
      } else {
        tickLine = `Day ${d + 1} · ${pad2(Math.floor(el / 3600000) % 24)}:${pad2(Math.floor(el / 60000) % 60)}:${pad2(Math.floor(el / 1000) % 60)} — and counting`
      }
      subLine = caption || 'Your tree grows when you check in — a slip can’t shrink it.'
    } else if (daysFree !== null) {
      countLine = `Day ${daysFree + 1}`
      subLine = caption || 'Your tree grows when you check in — a slip can’t shrink it.'
    } else {
      countLine = 'Your tree'
      subLine = caption || 'It grows a little every time you check in.'
    }
  } else if (counter === 'tending') {
    if (mode === 'commit' && commitTargetISO) {
      // The DayOneCounter tile below renders the full reverse counter
      // (old-home style) with its own change-the-day affordance.
      subLine = null
    } else {
      countLine = count === 0 ? 'Your tree is planted' : `Tended ${count} ${count === 1 ? 'time' : 'times'}`
      if (mode === 'commit') {
        showSetDay = true
        subLine = caption || 'A countdown to day one will live right here.'
      } else {
        subLine = caption || 'It grows a little every time you check in.'
      }
    }
  } else {
    countLine = 'Still standing'
    subLine = caption || 'Rain is how it grows.'
  }
  if (!caption && shown >= MAX_GROWTH) {
    subLine = 'A year of tending, in full leaf.'
  }

  return (
    <div style={styles.card}>
      <style>{MOTION_CSS}</style>
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
            <ellipse
              key={i}
              className="vowCloud"
              style={{ animation: `vowDrift ${110 + i * 35}s linear infinite`, animationDelay: `${-(i * 47 + 22)}s` }}
              cx={c[0]} cy={c[1]} rx={c[2]} ry={c[3]} fill="#FFFFFF" opacity={0.42 - i * 0.07}
            />
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

          {/* birds — alive after day 150, a second after 300; they glide
              behind the canopy, flapping as they go */}
          {BIRD_SCHEDULE.filter((b) => shown >= b.b).map((b, i) => (
            <g key={i} transform={`translate(0 ${b.y})`} opacity="0.75">
              <g className="vowFly" style={{ animation: `vowFly ${b.dur}s linear infinite`, animationDelay: `${b.delay}s` }}>
                <g className="vowBob" style={{ animation: `vowBob ${2.2 + i * 0.7}s ease-in-out infinite alternate` }}>
                  <path
                    className="vowWing"
                    style={{ animation: `vowWing ${0.62 + i * 0.16}s ease-in-out infinite alternate`, transformBox: 'fill-box', transformOrigin: 'center' }}
                    d={`M0 0 q ${3 * b.sc} ${-2.6 * b.sc} ${6 * b.sc} 0 M${6 * b.sc} 0 q ${3 * b.sc} ${-2.6 * b.sc} ${6 * b.sc} 0`}
                    stroke="#3A2A1C" strokeWidth="1.1" fill="none" strokeLinecap="round"
                  />
                </g>
              </g>
            </g>
          ))}

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
          <g>
            <g ref={artRef} dangerouslySetInnerHTML={{ __html: built.html }} />
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
        {countLine && <p style={bigIsTick ? styles.tickBig : styles.countLine}>{countLine}</p>}
        {tickLine && <p style={styles.tickLine}>{tickLine}</p>}
        {mode === 'endure' && counter === 'days' && trackerStartISO && (
          <JarCounter startISO={trackerStartISO} trackerId={trackerId} onStartChanged={onStartChanged} />
        )}
        {mode === 'commit' && commitTargetISO && (
          <DayOneCounter targetISO={commitTargetISO} onChange={onSetDay} />
        )}
        {subLine && <p style={styles.subLine}>{subLine}</p>}
        {showSetDay && onSetDay && (
          <button onClick={onSetDay} style={styles.setDayBtn}>Set your day ›</button>
        )}

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
  skyWrap: { display: 'block', position: 'relative' },
  below: { padding: '12px 16px 16px', textAlign: 'center' },
  countLine: { fontSize: '17px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0 },
  tickBig: { fontSize: '21px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '10px 0 0', textAlign: 'center', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' },
  tickLine: { fontSize: '13px', color: '#854F0B', fontFamily: 'Georgia, serif', margin: '3px 0 0', textAlign: 'center', fontVariantNumeric: 'tabular-nums' },
  setDayBtn: { display: 'block', margin: '9px auto 0', padding: '9px 18px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: '0.5px solid rgba(217,181,122,0.4)', borderRadius: '999px', fontSize: '12.5px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 4px 12px -4px rgba(30,18,8,0.4)' },
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
  tendedUpdate: { background: 'transparent', border: '0.5px solid #DDCFB6', color: '#854F0B', fontSize: '11px', fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer', padding: '4px 12px', borderRadius: '9px', marginLeft: '4px' },
}