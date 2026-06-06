import { useState, useEffect, useMemo } from 'react'

// =====================================================================
// What's true for you (Reflect · Day 4) — the eight indicators.
// One at a time: True / Not sure / Not true. Then a calibrated, non-
// diagnostic recognition reading of how many landed true, and what the
// 'not sure' pile tends to mean. Saves sorts / counts (portrait-safe).
// =====================================================================

const CHOICES = [
  { v: 'true', label: 'True', color: '#C5572C', soft: '#F7E2D5' },
  { v: 'not_sure', label: 'Not sure', color: '#6B7A88', soft: '#E8EDF1' },
  { v: 'not_true', label: 'Not true', color: '#9C8C78', soft: '#F0EBE2' },
]

export default function TruthSort({ statements = [], existingData, onSave, saving }) {
  const [idx, setIdx] = useState(0) // 0..n-1 then 'reading'
  const [sorts, setSorts] = useState({})

  useEffect(() => {
    if (existingData?.sorts) { setSorts(existingData.sorts); setIdx('reading') }
  }, [existingData])

  const counts = useMemo(() => ({
    true: Object.values(sorts).filter(v => v === 'true').length,
    not_true: Object.values(sorts).filter(v => v === 'not_true').length,
    not_sure: Object.values(sorts).filter(v => v === 'not_sure').length,
  }), [sorts])

  const save = () => onSave({ sorts, counts })

  // ---------------- READING ----------------
  if (idx === 'reading') {
    const t = counts.true
    const main = t <= 1
      ? "Very few of these landed as true for you. That's worth taking as real information — it may be that use isn't costing you the way it costs others. It can also be early. Either way, you looked honestly, which was the point."
      : t <= 4
      ? "Some of these are true for you — which is the most common place to be in this stage. Not none, not all: enough to be worth attention, not so many that the picture feels settled."
      : t <= 6
      ? "More than half of these are true for you. Taken together, that's a meaningful pattern — the kind that's hard to keep explaining away one item at a time, which is usually exactly how it gets explained away."
      : "Almost all of these are true for you. That isn't a verdict or a diagnosis — but it is a clear, honest picture, and seeing it laid out in one place is a different thing from feeling it in pieces."
    return (
      <div>
        <p style={S.lead}>These eight are among the signs that use has tipped from habit toward something with more of a hold. Here's how they landed.</p>
        <div style={S.meterCard}>
          <div style={S.meterStrip}>
            {statements.map(s => {
              const c = CHOICES.find(x => x.v === sorts[s.id]) || { color: '#E0D5C2' }
              return <span key={s.id} style={{ ...S.seg, background: c.color }} />
            })}
          </div>
          <p style={S.meterCount}><strong style={{ color: '#C5572C', fontSize: '22px' }}>{counts.true}</strong> <span style={{ color: '#7A6A52' }}>of {statements.length} true</span></p>
          <div style={S.legend}>
            <span style={{ color: '#C5572C' }}>● {counts.true} true</span>
            <span style={{ color: '#6B7A88' }}>● {counts.not_sure} not sure</span>
            <span style={{ color: '#9C8C78' }}>● {counts.not_true} not true</span>
          </div>
        </div>
        <p style={S.reading}>{main}</p>
        {counts.not_sure >= 2 && <p style={S.reading}>You left {counts.not_sure} as <em>not sure</em>. That uncertainty isn't a failure to answer — it's usually where the honest answer is still forming. Those are the ones worth returning to.</p>}
        <p style={S.coda}>None of this decides anything. It's a baseline: what's true today, named plainly.</p>
        <div style={S.row2}>
          <button onClick={() => setIdx(statements.length - 1)} style={S.back}>‹ Back</button>
          <button onClick={save} disabled={saving} style={{ ...S.cta, flex: 1, marginTop: 0, ...(saving ? S.ctaOff : {}) }}>
            {saving ? 'Saving…' : 'Keep this baseline ›'}
          </button>
        </div>
      </div>
    )
  }

  // ---------------- A STATEMENT ----------------
  const stmt = statements[idx]
  if (!stmt) return null
  const chosen = sorts[stmt.id]
  const last = idx === statements.length - 1
  return (
    <div>
      <div style={S.dots}>
        {statements.map((_, i) => <span key={i} style={{ ...S.dot, ...(i === idx ? S.dotOn : sorts[statements[i].id] ? S.dotDone : {}) }} />)}
      </div>
      <p style={S.counter}>{idx + 1} of {statements.length}</p>
      <div style={S.stmtCard}><p style={S.stmtText}>{stmt.text}</p></div>
      <p style={S.hint}>"Sort of" isn't an option. Which is closer?</p>
      <div style={S.choices}>
        {CHOICES.map(c => {
          const on = chosen === c.v
          return (
            <button key={c.v} onClick={() => setSorts(p => ({ ...p, [stmt.id]: c.v }))}
              style={{ ...S.choice, ...(on ? { background: c.soft, border: `1.5px solid ${c.color}`, color: c.color, fontWeight: 600 } : {}) }}>
              {c.label}
            </button>
          )
        })}
      </div>
      <div style={S.row2}>
        {idx > 0 && <button onClick={() => setIdx(idx - 1)} style={S.back}>‹ Back</button>}
        <button onClick={() => setIdx(last ? 'reading' : idx + 1)} disabled={!chosen}
          style={{ ...S.cta, flex: 1, marginTop: 0, ...(!chosen ? S.ctaOff : {}) }}>
          {!chosen ? 'Choose one' : last ? 'See the picture ›' : 'Next ›'}
        </button>
      </div>
    </div>
  )
}

const S = {
  lead: { fontSize: '15px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: '0 0 1.2rem' },
  dots: { display: 'flex', justifyContent: 'center', gap: '7px', marginBottom: '0.8rem', flexWrap: 'wrap' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', background: '#E0D5C2' },
  dotOn: { background: '#C5572C', transform: 'scale(1.25)' },
  dotDone: { background: '#C9A86F' },
  counter: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 0.7rem' },
  stmtCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #E8DFD0', borderRadius: '16px', padding: '1.5rem 1.3rem', boxShadow: '0 3px 14px rgba(80,50,20,0.06)', minHeight: '88px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stmtText: { fontSize: '17px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: 0, textAlign: 'center' },
  hint: { fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '1rem 0 0.8rem' },
  choices: { display: 'flex', gap: '8px' },
  choice: { flex: 1, padding: '14px 8px', background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '12px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 4px rgba(80,50,20,0.04)', transition: 'all 0.15s' },
  meterCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #E8DFD0', borderRadius: '16px', padding: '1.2rem 1.2rem 1rem', boxShadow: '0 3px 14px rgba(80,50,20,0.06)' },
  meterStrip: { display: 'flex', gap: '4px' },
  seg: { flex: 1, height: '14px', borderRadius: '4px' },
  meterCount: { fontSize: '14px', fontFamily: 'Georgia, serif', textAlign: 'center', margin: '0.8rem 0 0.6rem' },
  legend: { display: 'flex', justifyContent: 'center', gap: '14px', fontSize: '12px', fontFamily: 'Georgia, serif', fontWeight: 600 },
  reading: { fontSize: '15px', color: '#3A2D1E', fontFamily: 'Georgia, serif', lineHeight: 1.65, margin: '1.1rem 0 0' },
  coda: { fontSize: '13.5px', color: '#7A6A52', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '1.1rem 0 0' },
  cta: { width: '100%', padding: '16px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)', marginTop: '1.1rem' },
  ctaOff: { background: '#C9B894', boxShadow: 'none', cursor: 'not-allowed' },
  row2: { display: 'flex', gap: '10px', alignItems: 'center', marginTop: '1.1rem' },
  back: { padding: '16px 18px', background: 'transparent', color: '#854F0B', border: '0.5px solid #DDCFB6', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
}
