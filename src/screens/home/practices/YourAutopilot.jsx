// ===================================================================
// TOOL: "Without thinking"  (A closer look)
// ===================================================================
// No verdicts here. Each time it runs, the user logs how awake they
// were and what came right before — and every observation becomes a
// mark on the awareness dial. Over entries, the pattern surfaces on
// its own: where the autopilot usually flies, and what usually hands
// it the controls. Seeing the machine is the whole practice.
//
// Data: free_stage_signals, stage 'notice',
// signal_type 'notice_autopilot' (unchanged), payload
// { level, before_activity, date } — now APPENDED per observation
// (was one row updated in place), so the dial accumulates memory.
// ===================================================================
import { useState, useEffect } from 'react'
import {
  localDateStr, loadSignals, appendSignal,
  Chips, Steps, ScienceFooter, K, P,
} from './practiceKit'

const LEVELS = [
  { value: 0, label: 'I fully chose it' },
  { value: 1, label: 'I half noticed' },
  { value: 2, label: 'I barely noticed' },
  { value: 3, label: 'I only realised afterwards' },
]
const SHORT = ['Chose it', 'Half', 'Barely', 'After']
const BEFORE = ['Scrolling', 'Work stress', 'After dinner', 'Boredom', 'Being social', 'An argument', 'Late night', 'Just habit']

// dial geometry: semicircle, 180° (fully chose) → 0° (only afterwards)
const CX = 150, CY = 128, R = 96
const angleFor = (level) => 180 - (level / 3) * 180
const ptAt = (deg, r) => {
  const rad = (deg * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) }
}

function Dial({ level, history }) {
  const arcStart = ptAt(180, R), arcEnd = ptAt(0, R)
  return (
    <div style={{ ...K.stage, height: 150 }}>
      <svg viewBox="0 0 300 150" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="vowDialSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E5E1D9" /><stop offset="100%" stopColor="#F4F0E6" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="150" fill="url(#vowDialSky)" />
        {/* misty morning sun, barely there — the notice sky */}
        <circle cx="258" cy="34" r="12" fill="#E9C98E" opacity="0.3" />
        {/* the arc */}
        <path d={`M ${arcStart.x} ${arcStart.y} A ${R} ${R} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
          fill="none" stroke="#E2D7C3" strokeWidth="7" strokeLinecap="round" />
        {/* awake → asleep tint along the arc */}
        <path d={`M ${arcStart.x} ${arcStart.y} A ${R} ${R} 0 0 1 ${ptAt(90, R).x} ${ptAt(90, R).y}`}
          fill="none" stroke={P.light} strokeWidth="7" strokeLinecap="round" opacity="0.5" />
        <path d={`M ${ptAt(90, R).x} ${ptAt(90, R).y} A ${R} ${R} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
          fill="none" stroke={P.mound} strokeWidth="7" strokeLinecap="round" opacity="0.5" />
        {/* stop ticks + short labels */}
        {LEVELS.map((l) => {
          const a = angleFor(l.value)
          const t1 = ptAt(a, R - 8), t2 = ptAt(a, R + 8), lb = ptAt(a, R + 20)
          return (
            <g key={l.value}>
              <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke={P.bark} strokeWidth="1.2" opacity="0.5" />
              <text x={lb.x} y={lb.y + 3} textAnchor="middle" fontFamily="Georgia, serif" fontSize="8.5"
                fontStyle="italic" fill={P.body} opacity="0.85">{SHORT[l.value]}</text>
            </g>
          )
        })}
        {/* memory dots — every past observation, fading with age */}
        {history.map((h, i) => {
          const a = angleFor(h.level)
          const p = ptAt(a + (((i * 7) % 9) - 4) * 1.4, R - 20 - ((i * 5) % 3) * 9)
          const recency = Math.max(0.22, 0.85 - i * 0.06)
          return <circle key={i} cx={p.x} cy={p.y} r="2.4" fill={P.goldgreen} opacity={recency} />
        })}
        {/* the needle */}
        {level != null && (
          <g style={{ transform: `rotate(${90 - angleFor(level)}deg)`, transformOrigin: `${CX}px ${CY}px`, transition: 'transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1)' }}>
            <line x1={CX} y1={CY} x2={CX} y2={CY - R + 26} stroke={P.deepGold} strokeWidth="2.4" strokeLinecap="round" />
          </g>
        )}
        <circle cx={CX} cy={CY} r="5.5" fill={P.ink} />
        <circle cx={CX} cy={CY} r="2.4" fill="#FAF7F1" />
        <text x={CX} y={CY + 16} textAnchor="middle" fontFamily="Georgia, serif" fontSize="8.5" fontStyle="italic" fill={P.muted}>
          how awake you were
        </text>
      </svg>
    </div>
  )
}

export default function YourAutopilot({ stage = 'notice' }) {
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [level, setLevel] = useState(null)
  const [before, setBefore] = useState('')
  const [ownBefore, setOwnBefore] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const rows = await loadSignals('notice_autopilot', 30)
      if (cancelled) return
      const h = rows
        .map(r => ({ level: Math.min(3, Number(r.payload?.level) || 0), before: r.payload?.before_activity || '' }))
        .filter(x => x.before)
      setHistory(h)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const beforeText = before === 'own' ? ownBefore.trim() : before
  const canSave = level != null && !!beforeText

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const payload = { level, before_activity: beforeText, date: localDateStr() }
    await appendSignal(stage, 'notice_autopilot', payload)
    setHistory(h => [{ level, before: beforeText }, ...h])
    setLevel(null); setBefore(''); setOwnBefore('')
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2200)
    setSaving(false)
  }

  // pattern read-back
  let patternLine = null
  if (history.length >= 2) {
    const levelCounts = [0, 0, 0, 0]
    const beforeCounts = {}
    history.forEach(h => {
      levelCounts[h.level] += 1
      beforeCounts[h.before] = (beforeCounts[h.before] || 0) + 1
    })
    const topLevel = levelCounts.indexOf(Math.max(...levelCounts))
    const topBefores = Object.entries(beforeCounts).sort((a, b) => b[1] - a[1]).slice(0, 2)
    patternLine = `It usually runs at \u201c${LEVELS[topLevel].label.toLowerCase()}\u201d \u00b7 most common lead-in: ${topBefores.map(([k, n]) => `${k.toLowerCase()} \u00d7${n}`).join(', ')}.`
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        Sometimes it happens before you even decide. Each time it does, log it here — one mark on the dial. The pattern draws itself.
      </p>
      <Dial level={level} history={history} />
      <Steps items={[
        'Think of the last time it ran — today, or the most recent one.',
        'How awake were you when it started?',
        'What came right before it?',
      ]} />
      <Chips options={LEVELS.map(l => l.label)} value={level != null ? LEVELS[level].label : ''}
        onPick={(lab) => setLevel(LEVELS.find(l => l.label === lab).value)} />
      <p style={K.q}>And right before it?</p>
      <div style={K.chips}>
        {BEFORE.map(b => (
          <button key={b} onClick={() => setBefore(b)} style={{ ...K.chip, ...(before === b ? K.chipOn : {}) }}>{b}</button>
        ))}
        <button onClick={() => setBefore('own')} style={{ ...K.chip, ...(before === 'own' ? K.chipOn : {}) }}>Something else…</button>
      </div>
      {before === 'own' && (
        <input style={K.ownInput} value={ownBefore} onChange={(e) => setOwnBefore(e.target.value)}
          placeholder="What came before?" maxLength={60} />
      )}
      <button onClick={handleSave} disabled={!canSave || saving}
        style={{ ...K.saveBtn, ...(!canSave ? K.saveBtnDim : {}) }}>
        {saving ? 'One moment…' : savedFlash ? 'Marked on the dial ✓' : 'Mark it on the dial'}
      </button>
      {history.length > 0 && (
        <div style={K.pattern}>
          <p style={K.patternLabel}>{history.length} observation{history.length === 1 ? '' : 's'} so far</p>
          <p style={K.patternText}>{patternLine || 'One more mark and the pattern starts to show.'}</p>
        </div>
      )}
      <ScienceFooter text="Habits run as cue-to-routine chains below awareness — that is their design. Each logged observation is one rep of noticing the cue with the lights on, which is exactly how habit-reversal training loosens an automatic chain: not by force, but by making it visible mid-run." />
    </div>
  )
}