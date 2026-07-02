// ===================================================================
// DAILY: "Catch it in the act"  (A closer look)
// ===================================================================
// The noticing mode's whole skill, made visible: each time the pull
// shows up today, one tap — and a firefly lights over the meadow.
// The count is the swarm. No judgement, no target; the seeing is the
// practice, and by dusk you can look at exactly how much you saw.
//
// Data: free_stage_signals, stage 'notice', signal_type 'notice_catch'
// (unchanged contract), payload { count, date, hours: [..] } — one row
// per day, updated in place; `hours` is additive (each catch appends
// the hour it happened, feeding the where/when pattern).
// ===================================================================
import { useState, useEffect, useRef } from 'react'
import {
  localDateStr, loadTodayRow, loadSignals, appendSignal, updateSignal,
  ScienceFooter, K, P,
} from './practiceKit'

const lineFor = (n) => {
  if (n === 0) return 'Nothing caught yet today — and that can be true too.'
  if (n === 1) return 'One catch. Now you can see it happening.'
  if (n <= 3) return `${n} catches today. You\u2019re watching it, not the other way round.`
  return `${n} catches today. You are really seeing it now.`
}

const MEADOW_CSS = `
@keyframes vowFireflyDrift { 0%,100% { transform: translate(0,0) } 50% { transform: translate(6px,-5px) } }
@keyframes vowFireflyGlow { 0%,100% { opacity: 0.45 } 50% { opacity: 1 } }
@keyframes vowFireflyPop { from { opacity: 0; transform: scale(0) } to { opacity: 1; transform: scale(1) } }
.vowFirefly { transform-box: fill-box; transform-origin: center; animation: vowFireflyDrift ease-in-out infinite; }
.vowFireflyCore { transform-box: fill-box; transform-origin: center; animation: vowFireflyGlow ease-in-out infinite; }
.vowFireflyNew { animation: vowFireflyPop 0.5s ease-out; }
@media (prefers-reduced-motion: reduce) {
  .vowFirefly, .vowFireflyCore { animation: none !important; }
}`

// deterministic firefly positions over the grass line
const FLY_POS = Array.from({ length: 30 }, (_, k) => ({
  x: 20 + ((k * 67 + 13) % 262),
  y: 28 + ((k * 41 + 9) % 88),
  dur: 4.5 + (k % 4) * 1.3,
  delay: -((k * 1.7) % 6),
}))

// deterministic grass blades along the meadow floor
const BLADES = Array.from({ length: 26 }, (_, k) => ({
  x: 8 + k * 11 + (k % 3) * 2,
  h: 9 + ((k * 5) % 8),
  lean: ((k % 5) - 2) * 2.2,
  tone: k % 3,
}))

function Meadow({ count, justCaught }) {
  const shown = Math.min(count, FLY_POS.length)
  const grassTone = [P.deep, P.mid, P.light]
  return (
    <div style={{ ...K.stage, height: 172 }}>
      <style>{MEADOW_CSS}</style>
      <svg viewBox="0 0 300 172" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="vowDuskSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CFC0A4" /><stop offset="100%" stopColor="#EFE6D2" />
          </linearGradient>
          <radialGradient id="vowDuskSun" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#E9C98E" /><stop offset="100%" stopColor="rgba(233,201,142,0)" />
          </radialGradient>
        </defs>
        {/* dusk sky, low sun, far hill */}
        <rect x="0" y="0" width="300" height="172" fill="url(#vowDuskSky)" />
        <circle cx="246" cy="118" r="26" fill="url(#vowDuskSun)" opacity="0.7" />
        <circle cx="246" cy="118" r="11" fill="#E9C98E" opacity="0.9" />
        <ellipse cx="70" cy="140" rx="120" ry="26" fill={P.goldgreen} opacity="0.18" />
        {/* meadow floor */}
        <rect x="0" y="132" width="300" height="40" fill="#E8DFC8" />
        <ellipse cx="150" cy="134" rx="170" ry="10" fill="#E1D6BA" />
        {BLADES.map((b, i) => (
          <path key={i}
            d={`M ${b.x} 146 Q ${b.x + b.lean} ${146 - b.h * 0.6} ${b.x + b.lean * 1.6} ${146 - b.h}`}
            fill="none" stroke={grassTone[b.tone]} strokeWidth="1.1" strokeLinecap="round" opacity="0.65" />
        ))}
        {/* the fireflies — one per catch */}
        {FLY_POS.slice(0, shown).map((f, i) => (
          <g key={i} className={`vowFirefly${justCaught && i === shown - 1 ? ' vowFireflyNew' : ''}`}
            style={{ animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }}>
            <circle cx={f.x} cy={f.y} r="4.5" fill={P.glow} opacity="0.16" />
            <circle className="vowFireflyCore" cx={f.x} cy={f.y} r="1.5" fill={P.glow}
              style={{ animationDuration: `${2.2 + (i % 3) * 0.8}s`, animationDelay: `${f.delay}s` }} />
          </g>
        ))}
        {count > FLY_POS.length && (
          <text x="284" y="20" textAnchor="end" fontFamily="Georgia, serif" fontSize="9" fontStyle="italic" fill={P.body} opacity="0.8">
            +{count - FLY_POS.length} more
          </text>
        )}
      </svg>
    </div>
  )
}

const WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function WeekTrace({ days }) {
  // days: [{ label, count, isToday }]
  return (
    <div style={T.row}>
      {days.map((d, i) => (
        <div key={i} style={T.cell}>
          <svg viewBox="0 0 20 20" style={{ width: 18, height: 18, display: 'block' }}>
            {d.count > 0 ? (
              <>
                <circle cx="10" cy="10" r={Math.min(3 + d.count * 0.9, 8)} fill={P.glow} opacity="0.3" />
                <circle cx="10" cy="10" r="2.2" fill={d.isToday ? P.deepGold : P.gold} />
              </>
            ) : (
              <circle cx="10" cy="10" r="1.6" fill="none" stroke="#DDCFB6" strokeWidth="0.8" />
            )}
          </svg>
          <span style={{ ...T.num, color: d.isToday ? P.deepGold : P.muted }}>{d.count || '·'}</span>
          <span style={T.wd}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function CatchItInTheAct({ stage = 'notice' }) {
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [week, setWeek] = useState([])
  const [pulse, setPulse] = useState(false)
  const [justCaught, setJustCaught] = useState(false)
  const rowIdRef = useRef(null)
  const payloadRef = useRef({ count: 0, date: localDateStr(), hours: [] })
  const savingRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [today, recent] = await Promise.all([
        loadTodayRow('notice_catch'),
        loadSignals('notice_catch', 12),
      ])
      if (cancelled) return
      if (today) {
        rowIdRef.current = today.id
        payloadRef.current = {
          count: Number(today.payload?.count) || 0,
          date: localDateStr(),
          hours: Array.isArray(today.payload?.hours) ? today.payload.hours : [],
        }
        setCount(payloadRef.current.count)
      }
      // trace the last 7 calendar days
      const byDate = {}
      recent.forEach(r => { if (r.payload?.date) byDate[r.payload.date] = Number(r.payload.count) || 0 })
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        days.push({ label: WD[d.getDay()], count: byDate[key] || 0, isToday: i === 0 })
      }
      setWeek(days)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const catchOne = async () => {
    if (savingRef.current) return
    savingRef.current = true
    const p = payloadRef.current
    p.count += 1
    p.hours = [...p.hours, new Date().getHours()]
    setCount(p.count)
    setPulse(true); setJustCaught(true)
    setTimeout(() => setPulse(false), 350)
    setTimeout(() => setJustCaught(false), 600)
    setWeek(w => w.map(d => (d.isToday ? { ...d, count: p.count } : d)))
    const payload = { ...p }
    if (rowIdRef.current) {
      await updateSignal(rowIdRef.current, payload)
    } else {
      rowIdRef.current = await appendSignal(stage, 'notice_catch', payload)
    }
    savingRef.current = false
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        Whenever you feel the pull today — even a little — come back and tap once. Each catch lights a firefly. Just seeing it is the whole exercise.
      </p>
      <Meadow count={count} justCaught={justCaught} />
      <button onClick={catchOne} style={{ ...T.catchBtn, transform: pulse ? 'scale(0.97)' : 'scale(1)' }}>
        <span style={T.catchCount}>{count}</span>
        <span style={T.catchLabel}>I just caught it</span>
      </button>
      <p style={T.line}>{lineFor(count)}</p>
      <p style={K.patternLabel}>The last seven evenings</p>
      <WeekTrace days={week} />
      <ScienceFooter text="Noting is the core skill of mindfulness-based relapse prevention: the instant an impulse is observed and named, it stops being automatic — and automatic is the only mode in which it does its best work. Every firefly is one interruption of the loop." />
    </div>
  )
}

const T = {
  catchBtn: {
    width: '100%', padding: '15px', marginTop: 2,
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    border: 'none', borderRadius: 15, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
    boxShadow: '0 6px 16px rgba(40,25,10,0.22)',
    transition: 'transform 0.15s',
  },
  catchCount: { fontFamily: 'Georgia, serif', fontSize: 26, color: '#F6E8C4', fontWeight: 500, lineHeight: 1 },
  catchLabel: { fontFamily: 'Georgia, serif', fontSize: 14.5, color: '#FAF7F1' },
  line: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#6B5C4A', textAlign: 'center', margin: '10px 0 14px' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '2px 6px 0' },
  cell: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 },
  num: { fontFamily: 'Georgia, serif', fontSize: 10, lineHeight: 1.2 },
  wd: { fontSize: 8, color: '#B8A88E', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '0.05em' },
}