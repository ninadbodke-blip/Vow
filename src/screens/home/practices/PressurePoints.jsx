// ===================================================================
// TOOL: "The three pillars"  (Staying steady)
// ===================================================================
// A structure doesn't fall from one bad night — it falls when the
// load goes up while the pillars under it go soft. The structure is
// drawn now: a beam carrying this week's load-stone, held by three
// pillars that light up solid as each one is pressed and held. The
// last seven days build into a grid, so a soft pillar shows up
// before it becomes a crack.
//
// Data: free_stage_signals, stage 'build', signal_type
// 'build_pillars' (unchanged), payload { stress (1–5), pillars:
// [keys], high_stress, date } — one row per day, updated in place.
// ===================================================================
import { useState, useEffect, useRef } from 'react'
import {
  localDateStr, loadTodayRow, loadSignals, appendSignal, updateSignal,
  ScienceFooter, K, P,
} from './practiceKit'

const STRESS_LEVELS = [
  { v: 1, label: 'Feather-light' },
  { v: 2, label: 'Manageable' },
  { v: 3, label: 'Loaded' },
  { v: 4, label: 'Heavy' },
  { v: 5, label: 'Crushing' },
]
const PILLARS = [
  { key: 'sleep', label: 'Solid sleep', sub: 'the hours you actually got' },
  { key: 'movement', label: 'Movement', sub: 'you moved the body' },
  { key: 'silence', label: 'Silence', sub: 'time alone with no noise' },
]
const HOLD_MS = 1300
const WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function Structure({ stress, locked }) {
  const xs = [78, 150, 222]
  const stoneW = 34 + Math.max(0, stress - 1) * 16
  return (
    <div style={{ ...K.stage, height: 160 }}>
      <svg viewBox="0 0 300 160" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="vowPillarSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EDE8DB" /><stop offset="100%" stopColor="#F8F3E6" />
          </linearGradient>
          <linearGradient id="vowPillarHeld" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E9C98E" /><stop offset="100%" stopColor="#C9A85C" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="160" fill="url(#vowPillarSky)" />
        {/* the week's load, resting on the beam */}
        {stress > 0 && (
          <g style={{ transition: 'all 0.4s' }}>
            <rect x={150 - stoneW / 2} y={54 - Math.min(stress * 4, 20)} width={stoneW} height={Math.min(14 + stress * 3, 28)} rx="6"
              fill={P.stone} stroke={P.stoneEdge} strokeWidth="0.7" />
            <ellipse cx={150 - stoneW * 0.18} cy={54 - Math.min(stress * 4, 20) + 5} rx={stoneW * 0.2} ry="3" fill="#D8CBAE" opacity="0.7" />
          </g>
        )}
        {/* the beam */}
        <rect x="52" y="66" width="196" height="8" rx="3.5" fill={P.barkDark} />
        {/* the three pillars */}
        {PILLARS.map((p, i) => {
          const held = !!locked[p.key]
          return (
            <g key={p.key}>
              <rect x={xs[i] - 9} y="74" width="18" height="58" rx="3"
                fill={held ? 'url(#vowPillarHeld)' : 'none'}
                stroke={held ? P.deepGold : '#CDBFA4'}
                strokeWidth={held ? 1 : 1.2}
                strokeDasharray={held ? 'none' : '4 4'}
                style={{ transition: 'all 0.35s' }} />
              <rect x={xs[i] - 12} y="70" width="24" height="5" rx="2" fill={held ? P.deepGold : '#CDBFA4'} opacity={held ? 0.9 : 0.6} style={{ transition: 'all 0.35s' }} />
              <rect x={xs[i] - 12} y="132" width="24" height="5" rx="2" fill={held ? P.deepGold : '#CDBFA4'} opacity={held ? 0.9 : 0.6} style={{ transition: 'all 0.35s' }} />
              <text x={xs[i]} y="150" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8.5" fontStyle="italic"
                fill={held ? P.deepGold : P.muted}>{p.key}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function PillarHold({ label, sub, locked, onLock, onUnlock }) {
  const [pct, setPct] = useState(0)
  const timerRef = useRef(null)
  const stop = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (!locked) setPct(0)
  }
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])
  const start = (e) => {
    e.preventDefault()
    if (locked) { onUnlock(); return }
    if (timerRef.current) return
    timerRef.current = setInterval(() => {
      setPct((p) => {
        const next = p + 100 / (HOLD_MS / 30)
        if (next >= 100) {
          clearInterval(timerRef.current); timerRef.current = null
          onLock(); return 0
        }
        return next
      })
    }, 30)
  }
  return (
    <button
      onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
      style={{ ...G.pillarBtn, ...(locked ? G.pillarBtnOn : {}) }}
    >
      {!locked && pct > 0 && <span style={{ ...G.pillarFill, width: `${pct}%` }} />}
      <span style={G.pillarText}>
        <span style={{ ...G.pillarLabel, ...(locked ? G.pillarLabelOn : {}) }}>{label}</span>
        <span style={{ ...G.pillarSub, ...(locked ? G.pillarSubOn : {}) }}>{locked ? 'held today — tap to undo' : sub}</span>
      </span>
      <span style={{ ...G.pillarMark, opacity: locked ? 1 : 0 }}>✓</span>
    </button>
  )
}

function WeekGrid({ history }) {
  const byDate = {}
  history.forEach(p => { if (p?.date) byDate[p.date] = p })
  const cols = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    cols.push({ label: WD[d.getDay()], p: byDate[key], isToday: i === 0 })
  }
  return (
    <div style={G.grid}>
      <div style={G.gridRowLabels}>
        {PILLARS.map(p => <span key={p.key} style={G.gridRowLabel}>{p.key}</span>)}
        <span style={G.gridRowLabel}>load</span>
      </div>
      {cols.map((c, i) => (
        <div key={i} style={G.gridCol}>
          {PILLARS.map(p => {
            const held = c.p && Array.isArray(c.p.pillars) && c.p.pillars.includes(p.key)
            return <span key={p.key} style={{ ...G.gridDot, ...(held ? G.gridDotOn : c.p ? G.gridDotOff : {}) }} />
          })}
          <span style={{ ...G.gridLoad, opacity: c.p ? 0.35 + (Number(c.p.stress) || 0) * 0.13 : 0.15 }} />
          <span style={{ ...G.gridWd, ...(c.isToday ? { color: '#854F0B', fontWeight: 600 } : {}) }}>{c.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function PressurePoints({ stage = 'build' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [stress, setStress] = useState(0)
  const [locked, setLocked] = useState({})
  const [history, setHistory] = useState([])
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [today, rows] = await Promise.all([
        loadTodayRow('build_pillars'),
        loadSignals('build_pillars', 14),
      ])
      if (cancelled) return
      if (today?.payload) {
        setRowId(today.id)
        setStress(Number(today.payload.stress) || 0)
        setLocked((today.payload.pillars || []).reduce((a, k) => { a[k] = true; return a }, {}))
      }
      setHistory(rows.map(r => r.payload).filter(p => p?.date))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const save = async (nextStress, nextLocked) => {
    if (saving) return
    setSaving(true)
    const pillars = Object.keys(nextLocked).filter(k => nextLocked[k])
    const payload = { stress: nextStress || null, pillars, high_stress: (nextStress || 0) >= 4, date: localDateStr() }
    if (rowId) {
      await updateSignal(rowId, payload)
    } else {
      const id = await appendSignal(stage, 'build_pillars', payload)
      if (id) setRowId(id)
    }
    setHistory(h => [payload, ...h.filter(p => p.date !== payload.date)])
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1800)
    setSaving(false)
  }

  const pickStress = (v) => { setStress(v); save(v, locked) }
  const lockPillar = (key) => { const next = { ...locked, [key]: true }; setLocked(next); save(stress, next) }
  const unlockPillar = (key) => { const next = { ...locked, [key]: false }; setLocked(next); save(stress, next) }

  const heldCount = Object.values(locked).filter(Boolean).length
  const softUnderLoad = stress >= 4 && heldCount <= 1

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        A structure doesn't fall from one bad night — it falls when the load rises while the pillars go soft. Name this week's weight, then press and hold each pillar you actually held today.
      </p>
      <Structure stress={stress} locked={locked} />
      <p style={K.q}>How heavy is this week, honestly?</p>
      <div style={K.chips}>
        {STRESS_LEVELS.map(s => (
          <button key={s.v} onClick={() => pickStress(s.v)} style={{ ...K.chip, ...(stress === s.v ? K.chipOn : {}) }}>{s.label}</button>
        ))}
      </div>
      <p style={K.q}>The pillars you held today — press and hold to lock:</p>
      <div style={G.pillarList}>
        {PILLARS.map(p => (
          <PillarHold key={p.key} label={p.label} sub={p.sub} locked={!!locked[p.key]}
            onLock={() => lockPillar(p.key)} onUnlock={() => unlockPillar(p.key)} />
        ))}
      </div>
      {savedFlash && <p style={K.doneLine}>Held. The grid remembers.</p>}
      {softUnderLoad && (
        <p style={G.softNote}>Heavy week, soft pillars — that combination deserves gentleness, not alarm. Pick the easiest pillar and hold just that one tonight.</p>
      )}
      {history.length > 0 && (
        <div style={K.pattern}>
          <p style={K.patternLabel}>The last seven days</p>
          <WeekGrid history={history} />
        </div>
      )}
      <ScienceFooter text="Stress doesn't cause relapse by itself — it causes it through the pillars, degrading sleep, movement, and quiet first. Tracking load and supports side by side catches the dangerous combination (rising weight, softening structure) days before it feels like a craving." />
    </div>
  )
}

const G = {
  pillarList: { display: 'flex', flexDirection: 'column', gap: 8 },
  pillarBtn: { position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%', padding: '12px 14px', borderRadius: 13, border: '0.5px solid #E2D7C3', background: '#FDFBF6', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' },
  pillarBtnOn: { background: 'linear-gradient(180deg, #F4ECDD 0%, #EFE3CB 100%)', border: '1px solid #C9A85C' },
  pillarFill: { position: 'absolute', left: 0, top: 0, bottom: 0, background: 'rgba(233,201,142,0.3)' },
  pillarText: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 1 },
  pillarLabel: { fontFamily: 'Georgia, serif', fontSize: 13.5, color: '#2A1F15' },
  pillarLabelOn: { color: '#854F0B' },
  pillarSub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10.5, color: '#9C8C78' },
  pillarSubOn: { color: '#A67B3B' },
  pillarMark: { position: 'relative', color: '#854F0B', fontSize: 15, transition: 'opacity 0.25s' },
  softNote: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#854F0B', margin: '10px 0 0', lineHeight: 1.55, textAlign: 'center' },
  grid: { display: 'flex', gap: 6, alignItems: 'flex-end', marginTop: 4 },
  gridRowLabels: { display: 'flex', flexDirection: 'column', gap: 5, paddingBottom: 15 },
  gridRowLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 8, color: '#9C8C78', height: 10, lineHeight: '10px' },
  gridCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 },
  gridDot: { width: 10, height: 10, borderRadius: '50%', background: 'transparent', border: '0.8px solid #E0D5C0', display: 'block' },
  gridDotOn: { background: '#C9A85C', border: '0.8px solid #B8934A' },
  gridDotOff: { background: '#EFE8D6', border: '0.8px solid #E0D5C0' },
  gridLoad: { width: 12, height: 5, borderRadius: 2.5, background: '#8A7458', display: 'block' },
  gridWd: { fontSize: 8, color: '#B8A88E', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
}