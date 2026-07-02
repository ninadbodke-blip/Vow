// ===================================================================
// TOOL: "The basics"  (Early days)
// ===================================================================
// Sleep, food, movement — the three things that decide how hard
// tonight feels. Now they make literal weather: each checked day
// draws its own sky in a seven-day strip — clear when the basics
// held, clouding over as they slip. Tonight's forecast, honestly.
//
// Data: free_stage_signals, stage 'endure', signal_type
// 'daily_vitals' (unchanged; same option strings), payload
// { sleep, food, movement, date } — one row per day, updated in place.
// ===================================================================
import { useState, useEffect } from 'react'
import {
  localDateStr, loadTodayRow, loadSignals, appendSignal, updateSignal,
  Chips, ScienceFooter, K, P,
} from './practiceKit'

const SLEEPS = ['Badly', 'Okay', 'Well']
const FOODS = ['Not really', 'Mostly', 'Yes']
const MOVES = ['No', 'A little', 'Yes']
const LOWS = ['Badly', 'Not really', 'No']

const WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const lowsOf = (p) => [p?.sleep, p?.food, p?.movement].filter(v => LOWS.includes(v)).length

// one small sky per day: 0 lows = clear, 1 = a passing cloud,
// 2 = clouded, 3 = heavy weather. no day is a bad day — just weather.
function DaySky({ lows, empty, isToday }) {
  return (
    <svg viewBox="0 0 36 36" style={{ width: 32, height: 32, display: 'block' }}>
      <rect x="1" y="1" width="34" height="34" rx="8"
        fill={empty ? '#F4EFE2' : '#EFE8D6'}
        stroke={isToday ? P.deepGold : '#E2D7C3'} strokeWidth={isToday ? 1.3 : 0.6} />
      {empty ? (
        <circle cx="18" cy="18" r="1.6" fill="none" stroke="#D8CBAE" strokeWidth="0.8" />
      ) : (
        <>
          {lows <= 1 && (
            <>
              <circle cx={lows === 0 ? 18 : 14} cy={lows === 0 ? 17 : 14} r="6" fill="#E9C98E" />
              <circle cx={lows === 0 ? 18 : 14} cy={lows === 0 ? 17 : 14} r="8.5" fill="#E9C98E" opacity="0.25" />
            </>
          )}
          {lows >= 1 && (
            <g fill="#DDD3BC">
              <ellipse cx="21" cy="22" rx="9" ry="4.2" />
              <ellipse cx="16" cy="19.5" rx="6" ry="3.4" />
            </g>
          )}
          {lows >= 2 && (
            <g fill="#CBBFA4">
              <ellipse cx="14" cy="14" rx="7.5" ry="3.8" />
              <ellipse cx="20" cy="12" rx="5" ry="3" />
            </g>
          )}
          {lows >= 3 && (
            <g fill="#B9AC8F">
              <ellipse cx="18" cy="26" rx="10" ry="4" />
            </g>
          )}
        </>
      )}
    </svg>
  )
}

function WeatherStrip({ days }) {
  return (
    <div style={{ ...K.stage, padding: '12px 10px 8px', display: 'block' }}>
      <div style={W.row}>
        {days.map((d, i) => (
          <div key={i} style={W.cell}>
            <DaySky lows={d.lows} empty={d.empty} isToday={d.isToday} />
            <span style={{ ...W.wd, ...(d.isToday ? { color: P.deepGold, fontWeight: 600 } : {}) }}>{d.label}</span>
          </div>
        ))}
      </div>
      <p style={W.caption}>the week's weather — drawn by sleep, food, and movement</p>
    </div>
  )
}

export default function SleepAndWeather({ stage = 'endure' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [sleep, setSleep] = useState('')
  const [food, setFood] = useState('')
  const [movement, setMovement] = useState('')
  const [days, setDays] = useState([])
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [today, recent] = await Promise.all([
        loadTodayRow('daily_vitals'),
        loadSignals('daily_vitals', 12),
      ])
      if (cancelled) return
      if (today?.payload) {
        setRowId(today.id)
        if (SLEEPS.includes(today.payload.sleep)) setSleep(today.payload.sleep)
        if (FOODS.includes(today.payload.food)) setFood(today.payload.food)
        if (MOVES.includes(today.payload.movement)) setMovement(today.payload.movement)
      }
      const byDate = {}
      recent.forEach(r => { if (r.payload?.date) byDate[r.payload.date] = r.payload })
      const arr = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        const p = byDate[key]
        arr.push({ label: WD[d.getDay()], lows: p ? lowsOf(p) : 0, empty: !p, isToday: i === 0 })
      }
      setDays(arr)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canSave = sleep && food && movement
  const lows = [sleep, food, movement].filter((v) => LOWS.includes(v)).length

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const payload = { sleep, food, movement, date: localDateStr() }
    if (rowId) {
      await updateSignal(rowId, payload)
    } else {
      const id = await appendSignal(stage, 'daily_vitals', payload)
      if (id) setRowId(id)
    }
    setDays(ds => ds.map(d => (d.isToday ? { ...d, lows, empty: false } : d)))
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2200)
    setSaving(false)
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        Plain words, three questions. These decide how hard tonight feels — so they get checked before tonight arrives, and the week draws its own weather.
      </p>
      <WeatherStrip days={days} />
      <Chips label="How did you sleep last night?" options={SLEEPS} value={sleep} onPick={setSleep} />
      <Chips label="Have you eaten properly today?" options={FOODS} value={food} onPick={setFood} />
      <Chips label="Did you move your body?" options={MOVES} value={movement} onPick={setMovement} />
      <button onClick={handleSave} disabled={!canSave || saving}
        style={{ ...K.saveBtn, ...(!canSave ? K.saveBtnDim : {}) }}>
        {saving ? 'One moment…' : savedFlash ? 'Weather drawn ✓' : 'Draw today\u2019s weather'}
      </button>
      {canSave && (
        lows >= 2 ? (
          <p style={W.warn}>Two or more of the basics slipped today. That makes evenings harder than they need to be — keep tonight simple and get to bed early.</p>
        ) : lows === 1 ? (
          <p style={K.doneLine}>One of the basics slipped. Nothing dramatic — just go a bit easier on yourself this evening.</p>
        ) : (
          <p style={K.doneLine}>All three held. Clear skies going into tonight.</p>
        )
      )}
      <ScienceFooter text="Most “sudden” cravings are hours in the making: short sleep alone measurably raises next-day impulsivity, and low blood sugar reads to the brain as needing something. Checking the three levers before evening is how a hard night gets seen coming — and softened in advance." />
    </div>
  )
}

const W = {
  row: { display: 'flex', justifyContent: 'space-between' },
  cell: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  wd: { fontSize: 8.5, color: '#B8A88E', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '0.05em' },
  caption: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 9, color: '#9C8C78', textAlign: 'center', margin: '8px 0 0' },
  warn: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#854F0B', margin: '10px 0 0', lineHeight: 1.55, textAlign: 'center' },
}