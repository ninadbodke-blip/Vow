// ===================================================================
// DAILY: "What matters vs what I did"  (Weighing it up)
// ===================================================================
// Ambivalence isn't confusion — it's two true things disagreeing.
// The gap between them is now drawn, not described: what matters
// stands on one bank, today stands on the other, and the water
// between widens or narrows with the honest answer. On days the two
// touch, stepping stones appear. A week of gaps leaves a trace.
//
// Data: free_stage_signals, stage 'reflect', signal_type
// 'reflect_dissonance' (unchanged; same option strings), payload
// { value, action, drift, date } — one row per day, updated in place.
// ===================================================================
import { useState, useEffect } from 'react'
import {
  localDateStr, loadTodayRow, loadSignals, appendSignal, updateSignal,
  Chips, ScienceFooter, K, P,
} from './practiceKit'

const VALUES = ['My health', 'My family', 'My self-respect', 'My freedom', 'My calm', 'My money']
const ACTIONS = ['Matched it', 'A little off', 'Went against it']
const DRIFTS = ['No gap', 'A small gap', 'A big gap']

const GAP_W = { 'No gap': 16, 'A small gap': 62, 'A big gap': 116 }

function GapScene({ value, action, drift, week }) {
  const gapW = GAP_W[drift] ?? 62
  const leftEdge = 150 - gapW / 2
  const rightEdge = 150 + gapW / 2
  const bridged = drift === 'No gap' && action === 'Matched it'
  return (
    <div style={{ ...K.stage, height: 158 }}>
      <svg viewBox="0 0 300 158" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="vowGapSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EDE8DB" /><stop offset="100%" stopColor="#F8F3E6" />
          </linearGradient>
          <linearGradient id="vowGapWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8BC9E" /><stop offset="100%" stopColor="#D8CDAF" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="158" fill="url(#vowGapSky)" />
        <circle cx="256" cy="30" r="11" fill="#E9C98E" opacity="0.5" />
        {/* the water — always there, sized by the day's honesty */}
        <rect x="0" y="88" width="300" height="46" fill="url(#vowGapWater)" />
        <path d="M 20 100 q 8 -2.5 16 0" fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.4" />
        <path d="M 250 112 q 9 -2.5 18 0" fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.35" />
        {/* left bank — what matters */}
        <g style={{ transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)', transform: `translateX(${leftEdge - 150}px)` }}>
          <path d="M -160 88 L 150 88 L 144 134 L -160 134 Z" fill="#E8DFC8" />
          <line x1="-160" y1="88" x2="150" y2="88" stroke={P.mid} strokeWidth="1.6" opacity="0.55" />
          {/* the cairn of what matters */}
          <ellipse cx="118" cy="84" rx="10" ry="4" fill={P.stone} stroke={P.stoneEdge} strokeWidth="0.5" />
          <ellipse cx="118" cy="77.5" rx="7" ry="3.4" fill={P.stone} stroke={P.stoneEdge} strokeWidth="0.5" />
          <ellipse cx="118" cy="72.5" rx="4.2" ry="2.4" fill="#D8CBAE" stroke={P.stoneEdge} strokeWidth="0.5" />
        </g>
        {/* right bank — today */}
        <g style={{ transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)', transform: `translateX(${rightEdge - 150}px)` }}>
          <path d="M 150 88 L 460 88 L 460 134 L 156 134 Z" fill="#E8DFC8" />
          <line x1="150" y1="88" x2="460" y2="88" stroke={P.mid} strokeWidth="1.6" opacity="0.55" />
          {/* today's marker post */}
          <rect x="176" y="66" width="3.5" height="21" rx="1.5" fill={P.bark} />
          <circle cx="177.8" cy="63" r="3" fill={P.goldSoft} />
        </g>
        {/* stepping stones on a closed day */}
        {bridged && (
          <g>
            <ellipse cx="142" cy="96" rx="6" ry="2.6" fill={P.stone} stroke={P.stoneEdge} strokeWidth="0.4" />
            <ellipse cx="150" cy="102" rx="6" ry="2.6" fill={P.stone} stroke={P.stoneEdge} strokeWidth="0.4" />
            <ellipse cx="158" cy="96" rx="6" ry="2.6" fill={P.stone} stroke={P.stoneEdge} strokeWidth="0.4" />
          </g>
        )}
        {/* bank labels */}
        <text x={leftEdge - 32} y="148" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8.5" fontStyle="italic" fill={P.body}>
          {value ? value.toLowerCase() : 'what matters'}
        </text>
        <text x={rightEdge + 28} y="148" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8.5" fontStyle="italic" fill={P.body}>today</text>
        {/* the week's trace — seven gaps, oldest to newest */}
        <g>
          {week.map((d, i) => {
            const x = 122 + i * 10
            if (d == null) return <circle key={i} cx={x} cy="16" r="1.4" fill="none" stroke="#D8CBAE" strokeWidth="0.7" />
            const r = d === 0 ? 2.2 : d === 1 ? 2.2 : 2.2
            const fillO = d === 0 ? 0.95 : d === 1 ? 0.55 : 0.2
            return <circle key={i} cx={x} cy="16" r={r} fill={P.deepGold} opacity={fillO} />
          })}
          <text x="150" y="30" textAnchor="middle" fontFamily="Georgia, serif" fontSize="7.5" fontStyle="italic" fill={P.muted}>
            the week's gaps — solid means closed
          </text>
        </g>
      </svg>
    </div>
  )
}

export default function BothTrueToday({ stage = 'reflect' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [value, setValue] = useState('')
  const [action, setAction] = useState('')
  const [drift, setDrift] = useState('')
  const [week, setWeek] = useState([])
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [today, recent] = await Promise.all([
        loadTodayRow('reflect_dissonance'),
        loadSignals('reflect_dissonance', 12),
      ])
      if (cancelled) return
      if (today?.payload) {
        setRowId(today.id)
        setValue(today.payload.value || '')
        setAction(today.payload.action || '')
        setDrift(today.payload.drift || '')
      }
      const byDate = {}
      recent.forEach(r => { if (r.payload?.date) byDate[r.payload.date] = DRIFTS.indexOf(r.payload.drift) })
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        days.push(byDate[key] != null && byDate[key] >= 0 ? byDate[key] : null)
      }
      setWeek(days)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canSave = value && action && drift
  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const payload = { value, action, drift, date: localDateStr() }
    if (rowId) {
      await updateSignal(rowId, payload)
    } else {
      const id = await appendSignal(stage, 'reflect_dissonance', payload)
      if (id) setRowId(id)
    }
    setWeek(w => w.map((d, i) => (i === 6 ? DRIFTS.indexOf(drift) : d)))
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2200)
    setSaving(false)
  }

  const closedDays = week.filter(d => d === 0).length
  const answeredDays = week.filter(d => d != null).length

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        Two things can both be true at once. Name what matters, name what today did about it, and let the water between them be exactly as wide as it is. No resolving — just seeing.
      </p>
      <GapScene value={value} action={action} drift={drift} week={week} />
      <Chips label="Pick one thing that really matters to you" options={VALUES} value={value} onPick={setValue} />
      <Chips label="Today, what you did about the habit…" options={ACTIONS} value={action} onPick={setAction} />
      <Chips label="How big is the gap between the two?" options={DRIFTS} value={drift} onPick={setDrift} />
      <button onClick={handleSave} disabled={!canSave || saving}
        style={{ ...K.saveBtn, ...(!canSave ? K.saveBtnDim : {}) }}>
        {saving ? 'One moment…' : savedFlash ? 'Held for today ✓' : 'Hold both for today'}
      </button>
      {answeredDays >= 3 && (
        <div style={K.pattern}>
          <p style={K.patternLabel}>This week</p>
          <p style={K.patternText}>
            The gap closed on {closedDays} of {answeredDays} answered days. Neither number is a verdict — both are information.
          </p>
        </div>
      )}
      <ScienceFooter text="Motivational-interviewing research calls this developing discrepancy: durable change starts when the distance between a held value and a lived day is seen clearly and repeatedly, without being argued away. The discomfort of holding both is not a malfunction — it is the engine." />
    </div>
  )
}