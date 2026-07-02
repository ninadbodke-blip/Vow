// ===================================================================
// TOOL: "The blind spot"  (Staying steady)
// ===================================================================
// The classic month-two pattern: confidence rises, distance shrinks.
// The two sliders now place a live dot on a drawn map — how solid it
// feels across, how close you actually stood up — and past check-ins
// trail behind it, so drift toward the corner shows up as a path,
// not a surprise. Awareness, not alarm.
//
// Data: free_stage_signals, stage 'build', signal_type 'build_drift'
// (unchanged), payload { confidence, exposure, date } — one row per
// day, updated in place.
// ===================================================================
import { useState, useEffect } from 'react'
import {
  localDateStr, loadTodayRow, loadSignals, appendSignal, updateSignal,
  ScienceFooter, K, P,
} from './practiceKit'

const readFor = (conf, exp) => {
  if (conf > 60 && exp > 60) return 'Feeling solid while standing close — that\u2019s the classic blind spot. Nothing to fix tonight; just keep your eyes open and your exits easy.'
  if (conf > 60 && exp <= 60) return 'Solid, and keeping clear of it. Quiet weeks like this count double.'
  if (conf <= 60 && exp > 60) return 'Close to it, and feeling it. Be kind to your evenings this week — fewer decisions, earlier nights.'
  return 'Steadying from a distance. That\u2019s exactly how it\u2019s done.'
}

// map geometry
const MX = 58, MY = 22, MW = 184, MH = 108
const px = (conf) => MX + (conf / 100) * MW
const py = (exp) => MY + MH - (exp / 100) * MH

function QuadrantMap({ confidence, exposure, history }) {
  const trail = history.slice(0, 8)
  return (
    <div style={{ ...K.stage, height: 168 }}>
      <svg viewBox="0 0 300 168" style={{ display: 'block', width: '100%', height: '100%' }}>
        <rect x="0" y="0" width="300" height="168" fill="#F6F1E3" />
        {/* the field */}
        <rect x={MX} y={MY} width={MW} height={MH} rx="8" fill="#FDFBF6" stroke="#E2D7C3" strokeWidth="0.8" />
        <line x1={MX + MW / 2} y1={MY + 4} x2={MX + MW / 2} y2={MY + MH - 4} stroke="#EDE2CB" strokeWidth="0.8" strokeDasharray="3 4" />
        <line x1={MX + 4} y1={MY + MH / 2} x2={MX + MW - 4} y2={MY + MH / 2} stroke="#EDE2CB" strokeWidth="0.8" strokeDasharray="3 4" />
        {/* the blind-spot corner, softly named */}
        <rect x={MX + MW / 2} y={MY} width={MW / 2} height={MH / 2} rx="8" fill={P.gold} opacity="0.09" />
        <text x={MX + MW - 8} y={MY + 13} textAnchor="end" fontFamily="Georgia, serif" fontSize="7.5" fontStyle="italic" fill={P.deepGold} opacity="0.85">the blind spot</text>
        {/* axis labels */}
        <text x={MX + MW / 2} y={MY + MH + 15} textAnchor="middle" fontFamily="Georgia, serif" fontSize="8.5" fontStyle="italic" fill={P.body}>feels solid →</text>
        <text x={MX - 10} y={MY + MH / 2} textAnchor="middle" fontFamily="Georgia, serif" fontSize="8.5" fontStyle="italic" fill={P.body}
          transform={`rotate(-90 ${MX - 10} ${MY + MH / 2})`}>standing close →</text>
        {/* the trail of past check-ins */}
        {trail.length > 1 && (
          <polyline
            points={trail.map(p => `${px(Number(p.confidence) || 0)},${py(Number(p.exposure) || 0)}`).join(' ')}
            fill="none" stroke={P.goldgreen} strokeWidth="1" opacity="0.4" strokeDasharray="2 3" />
        )}
        {trail.map((p, i) => (
          i === 0 ? null : (
            <circle key={i} cx={px(Number(p.confidence) || 0)} cy={py(Number(p.exposure) || 0)} r="2.4"
              fill={P.goldgreen} opacity={Math.max(0.2, 0.7 - i * 0.08)} />
          )
        ))}
        {/* today, live */}
        <g style={{ transition: 'transform 0.25s' }} transform={`translate(${px(confidence)}, ${py(exposure)})`}>
          <circle r="7" fill={P.goldSoft} opacity="0.3" />
          <circle r="3.6" fill={P.deepGold} />
        </g>
      </svg>
    </div>
  )
}

function Slider({ label, leftLabel, rightLabel, value, onChange }) {
  return (
    <>
      <p style={K.q}>{label}</p>
      <input type="range" min="0" max="100" value={value} onChange={(e) => onChange(Number(e.target.value))} style={B.range} />
      <div style={B.endLabels}>
        <span style={B.endLabel}>{leftLabel}</span>
        <span style={B.endLabel}>{rightLabel}</span>
      </div>
    </>
  )
}

export default function TheBlindSpot({ stage = 'build' }) {
  const [loading, setLoading] = useState(true)
  const [todayRowId, setTodayRowId] = useState(null)
  const [confidence, setConfidence] = useState(50)
  const [exposure, setExposure] = useState(30)
  const [history, setHistory] = useState([])
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [today, rows] = await Promise.all([
        loadTodayRow('build_drift'),
        loadSignals('build_drift', 14),
      ])
      if (cancelled) return
      if (today?.payload) {
        setTodayRowId(today.id)
        setConfidence(Number(today.payload.confidence) ?? 50)
        setExposure(Number(today.payload.exposure) ?? 30)
      }
      setHistory(rows.map(r => r.payload).filter(p => p?.date))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const payload = { confidence, exposure, date: localDateStr() }
    if (todayRowId) {
      await updateSignal(todayRowId, payload)
    } else {
      const id = await appendSignal(stage, 'build_drift', payload)
      if (id) setTodayRowId(id)
    }
    setHistory(h => [payload, ...h.filter(p => p.date !== payload.date)])
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2200)
    setSaving(false)
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        Feeling safe and being safe aren’t the same thing — and the gap between them lives in the top-right corner. Two honest sliders place you on the map; your past weeks trail behind.
      </p>
      <QuadrantMap confidence={confidence} exposure={exposure} history={history} />
      <Slider label="How solid does it feel right now?" leftLabel="Shaky" rightLabel="Untouchable"
        value={confidence} onChange={setConfidence} />
      <Slider label="How close did you stand to the old situations this week?" leftLabel="Kept clear" rightLabel="Right in them"
        value={exposure} onChange={setExposure} />
      <button onClick={handleSave} disabled={saving} style={K.saveBtn}>
        {saving ? 'One moment…' : savedFlash ? 'Placed on the map ✓' : 'Place today on the map'}
      </button>
      <p style={K.doneLine}>{readFor(confidence, exposure)}</p>
      <ScienceFooter text="Overconfidence is one of the best-replicated relapse predictors: felt strength rises faster than actual resilience, and distance to old cues quietly shrinks with it. Plotting both on one map makes the dangerous drift — up and to the right — visible as a path while it is still just a path." />
    </div>
  )
}

const B = {
  range: { width: '100%', marginTop: 4, accentColor: '#854F0B' },
  endLabels: { display: 'flex', justifyContent: 'space-between', marginTop: 2 },
  endLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10.5, color: '#9C8C78' },
}