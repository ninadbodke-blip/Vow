// ===================================================================
// TOOL: "The scales"  (Weighing it up)
// ===================================================================
// The scales are real now: a beam on a pillar that tips as the
// slider moves, pans hanging plumb, pebbles gathering on the heavier
// side. One weigh-in a day; the last five stay visible as a quiet
// trace, so the lean of a week belongs to the user's own eyes.
//
// Data: free_stage_signals, stage 'reflect', signal_type
// 'reflect_lean' (unchanged), payload { lean 0–100, word|null, date }
// — one row per day, updated in place; trend reads the recent rows.
// ===================================================================
import { useState, useEffect } from 'react'
import {
  localDateStr, loadSignals, appendSignal, updateSignal,
  ScienceFooter, K, P,
} from './practiceKit'

const WORDS = ['Tired', 'Curious', 'Scared', 'Ready', 'Stuck', 'Hopeful', 'Torn']

// beam geometry
const PIVOT = { x: 150, y: 54 }
const ARM = 92
const MAX_DEG = 11

function BeamScales({ lean }) {
  const deg = ((lean - 50) / 50) * MAX_DEG
  const rad = (deg * Math.PI) / 180
  const leftEnd = { x: PIVOT.x - ARM * Math.cos(rad), y: PIVOT.y - ARM * Math.sin(rad) }
  const rightEnd = { x: PIVOT.x + ARM * Math.cos(rad), y: PIVOT.y + ARM * Math.sin(rad) }
  const CHAIN = 30
  const leftPebbles = Math.round((100 - lean) / 22)
  const rightPebbles = Math.round(lean / 22)
  const Pan = ({ end, pebbles, label }) => (
    <g style={{ transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)', transform: `translate(${end.x}px, ${end.y}px)` }}>
      <line x1="-9" y1="0" x2="0" y2={CHAIN - 4} stroke={P.bark} strokeWidth="0.9" opacity="0.75" />
      <line x1="9" y1="0" x2="0" y2={CHAIN - 4} stroke={P.bark} strokeWidth="0.9" opacity="0.75" />
      <path d={`M -17 ${CHAIN - 3} Q 0 ${CHAIN + 9} 17 ${CHAIN - 3} Z`} fill={P.gold} opacity="0.9" stroke={P.stoneEdge} strokeWidth="0.5" />
      {Array.from({ length: pebbles }).map((_, i) => (
        <circle key={i} cx={-8 + (i % 5) * 4} cy={CHAIN - 1 - Math.floor(i / 5) * 3} r="1.9" fill={P.barkDark} opacity="0.75" />
      ))}
      <text x="0" y={CHAIN + 20} textAnchor="middle" fontFamily="Georgia, serif" fontSize="8.5" fontStyle="italic" fill={P.body}>{label}</text>
    </g>
  )
  return (
    <div style={{ ...K.stage, height: 168 }}>
      <svg viewBox="0 0 300 168" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="vowScaleSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EDE8DB" /><stop offset="100%" stopColor="#F8F3E6" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="168" fill="url(#vowScaleSky)" />
        <circle cx="44" cy="28" r="10" fill="#E9C98E" opacity="0.45" />
        {/* floor */}
        <rect x="0" y="146" width="300" height="22" fill="#EFE6D2" />
        <line x1="0" y1="146" x2="300" y2="146" stroke={P.wash} strokeWidth="1" opacity="0.7" />
        {/* pillar */}
        <path d="M 138 146 L 143 68 L 157 68 L 162 146 Z" fill={P.bark} />
        <path d="M 128 146 L 172 146 L 168 152 L 132 152 Z" fill={P.barkDark} />
        {/* the beam */}
        <g style={{ transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)', transform: `rotate(${deg}deg)`, transformOrigin: `${PIVOT.x}px ${PIVOT.y}px` }}>
          <rect x={PIVOT.x - ARM - 4} y={PIVOT.y - 2.4} width={(ARM + 4) * 2} height="4.8" rx="2.4" fill={P.barkDark} />
        </g>
        <circle cx={PIVOT.x} cy={PIVOT.y} r="5" fill={P.ink} />
        <circle cx={PIVOT.x} cy={PIVOT.y} r="2" fill={P.goldSoft} />
        {/* the pans hang plumb from the beam's ends */}
        <Pan end={leftEnd} pebbles={leftPebbles} label="as I am" />
        <Pan end={rightEnd} pebbles={rightPebbles} label="change this" />
      </svg>
    </div>
  )
}

function LeanTrace({ history }) {
  // small horizontal axis, each past weigh-in a dot placed by its lean
  const rows = history.slice(0, 5)
  if (rows.length === 0) return null
  return (
    <svg viewBox="0 0 300 34" style={{ display: 'block', width: '100%', height: 34, marginTop: 6 }}>
      <line x1="30" y1="14" x2="270" y2="14" stroke="#E2D7C3" strokeWidth="1" />
      <line x1="150" y1="9" x2="150" y2="19" stroke="#D8CBAE" strokeWidth="1" />
      <text x="30" y="30" fontFamily="Georgia, serif" fontSize="7.5" fontStyle="italic" fill={P.muted}>same</text>
      <text x="270" y="30" textAnchor="end" fontFamily="Georgia, serif" fontSize="7.5" fontStyle="italic" fill={P.muted}>change</text>
      {rows.map((p, i) => (
        <circle key={i} cx={30 + (Number(p.lean) / 100) * 240} cy="14" r={i === 0 ? 3.4 : 2.4}
          fill={i === 0 ? P.deepGold : P.goldgreen} opacity={i === 0 ? 1 : Math.max(0.3, 0.8 - i * 0.15)} />
      ))}
    </svg>
  )
}

export default function TheScales({ stage = 'reflect' }) {
  const [loading, setLoading] = useState(true)
  const [todayRowId, setTodayRowId] = useState(null)
  const [lean, setLean] = useState(50)
  const [word, setWord] = useState('')
  const [history, setHistory] = useState([])
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const rows = (await loadSignals('reflect_lean', 8)).filter(r => r.payload && r.payload.lean != null)
      if (cancelled) return
      setHistory(rows.map(r => r.payload))
      const todays = rows.find(r => r.payload.date === localDateStr())
      if (todays) {
        setTodayRowId(todays.id)
        setLean(Number(todays.payload.lean))
        setWord(todays.payload.word || '')
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const payload = { lean, word: word || null, date: localDateStr() }
    if (todayRowId) {
      await updateSignal(todayRowId, payload)
      setHistory(h => [payload, ...h.filter(p => p.date !== payload.date)])
    } else {
      const id = await appendSignal(stage, 'reflect_lean', payload)
      if (id) { setTodayRowId(id); setHistory(h => [payload, ...h]) }
    }
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2200)
    setSaving(false)
  }

  const leanText = lean > 55 ? 'toward changing this' : lean < 45 ? 'toward staying as you are' : 'right in the middle'
  const recent = history.slice(0, 5)
  const changeCount = recent.filter(p => Number(p.lean) > 55).length

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        No right answer — just where the weight honestly sits, today only. Move the slider and watch the beam agree with you.
      </p>
      <BeamScales lean={lean} />
      <input type="range" min="0" max="100" value={lean}
        onChange={(e) => setLean(Number(e.target.value))} style={T.range} />
      <div style={T.endLabels}>
        <span style={T.endLabel}>Keep things the same</span>
        <span style={T.endLabel}>Change this</span>
      </div>
      <p style={K.q}>One word for how it feels?</p>
      <div style={K.chips}>
        {WORDS.map((w) => (
          <button key={w} onClick={() => setWord(word === w ? '' : w)} style={{ ...K.chip, ...(word === w ? K.chipOn : {}) }}>{w}</button>
        ))}
      </div>
      <button onClick={handleSave} disabled={saving} style={K.saveBtn}>
        {saving ? 'One moment…' : savedFlash ? 'Weighed in ✓' : todayRowId ? 'Weigh in again' : 'Weigh in for today'}
      </button>
      <p style={K.doneLine}>You lean {leanText}{word ? ` — feeling ${word.toLowerCase()}` : ''}.</p>
      {recent.length >= 2 && (
        <div style={K.pattern}>
          <p style={K.patternLabel}>Your last {recent.length} weigh-ins</p>
          <LeanTrace history={history} />
          <p style={K.patternText}>{changeCount} of {recent.length} leaned toward change. The answer moving is the answer working.</p>
        </div>
      )}
      <ScienceFooter text="Ambivalence is not indecision — it is two motivational systems reporting honestly. Decisional-balance research shows the lean shifts day to day, and that watching your own weigh-ins move is more persuasive than any argument someone else could put on the scale." />
    </div>
  )
}

const T = {
  range: { width: '100%', marginTop: 4, accentColor: '#854F0B' },
  endLabels: { display: 'flex', justifyContent: 'space-between', marginTop: 2 },
  endLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10.5, color: '#9C8C78' },
}