import { useState, useEffect, useMemo } from 'react'

// =====================================================================
// The outcomes of changing (Reflect · Day 15) — feel, then map.
// Step 0: a dread⇄want slider for each outcome of changing.
// Step 1: all eight plotted on a feeling spectrum, with a reading that
// treats dread as a thing to plan for, not a reason to stay.
// Saves sorts / counts {hopeful,scared,neutral} (portrait-compatible)
// plus per-outcome values.
// =====================================================================

const SHORT = { money: 'Money', sleep: 'Health', time: 'Time', partner: 'Partner', identity: 'Identity', social: 'Social', emotions: 'Emotions', future: 'Future' }
const LABELS = { 1: 'I dread this', 2: 'Uneasy', 3: 'Neutral', 4: 'Hopeful', 5: 'I want this' }
const short = (o) => SHORT[o.id] || (o.id ? o.id.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()) : '')
const bucketOf = (v) => (v >= 4 ? 'hopeful' : v <= 2 ? 'scared' : 'neutral')
const ZONE = { hopeful: '#7A8C5A', scared: '#C5572C', neutral: '#9C8C78' }

export default function OutcomeSorter({ outcomes = [], existingData, onSave, saving }) {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState({}) // id -> 1..5

  useEffect(() => {
    if (!existingData) return
    if (existingData.values) { setValues(existingData.values); setStep(1); return }
    if (existingData.sorts) {
      const v = {}
      Object.entries(existingData.sorts).forEach(([id, b]) => { v[id] = b === 'hopeful' ? 4 : b === 'scared' ? 2 : 3 })
      setValues(v); setStep(1)
    }
  }, [existingData])

  const valOf = (id) => values[id] ?? 3
  const counts = useMemo(() => {
    const c = { hopeful: 0, scared: 0, neutral: 0 }
    outcomes.forEach(o => { c[bucketOf(valOf(o.id))]++ })
    return c
  }, [values, outcomes])

  const save = () => {
    onSave({
      sorts: Object.fromEntries(outcomes.map(o => [o.id, bucketOf(valOf(o.id))])),
      counts,
      values: Object.fromEntries(outcomes.map(o => [o.id, valOf(o.id)])),
    })
  }

  // ---------------- STEP 0 · FEEL EACH ----------------
  if (step === 0) {
    return (
      <div>
        <p style={S.lead}>These are some of the things that change if you stop. For each, move the slider to how you actually feel about it — not how you think you should feel.</p>
        <div style={S.feelList}>
          {outcomes.map(o => {
            const v = valOf(o.id)
            return (
              <div key={o.id} style={S.feelRow}>
                <p style={S.outcomeText}>{o.label}</p>
                <input type="range" min="1" max="5" step="1" value={v} onChange={e => setValues(p => ({ ...p, [o.id]: Number(e.target.value) }))} style={S.slider} />
                <div style={S.sliderEnds}><span>dread</span><span style={{ ...S.feelNow, color: ZONE[bucketOf(v)] }}>{LABELS[v]}</span><span>want</span></div>
              </div>
            )
          })}
        </div>
        <button onClick={() => setStep(1)} style={S.cta}>See where they land ›</button>
      </div>
    )
  }

  // ---------------- STEP 1 · THE MAP ----------------
  const reading = counts.hopeful > counts.scared
    ? `More of what changing brings, you welcome than dread. That's the pull — worth keeping in view. The few you dread aren't reasons to stay; they're the parts of changing that need a plan, not avoidance.`
    : counts.scared > counts.hopeful
    ? `Right now you dread more of these outcomes than you welcome — which is honest, and common this early. Dread of an outcome is often what quietly keeps the door shut. Naming exactly which ones, instead of a vague fear of "changing", is what makes them workable.`
    : `Your hopes and dreads about changing fall almost evenly — the shape of real ambivalence. Both lists are true. The work isn't to argue yourself out of the dread; it's to see both clearly enough to choose with your eyes open.`
  return (
    <div>
      <p style={S.lead}>Every outcome, placed by how you feel about it.</p>
      <div style={S.mapCard}>
        <div style={{ ...S.mapField, height: `${outcomes.length * 26 + 16}px` }}>
          {outcomes.map((o, i) => {
            const v = valOf(o.id)
            const xPct = 6 + ((v - 1) / 4) * 88           // clamp into [6,94] so nothing clips
            const labelLeft = v >= 4                       // right-side dots → label sits to the LEFT
            return (
              <div
                key={o.id}
                style={{
                  ...S.dotWrap,
                  left: `${xPct}%`,
                  top: `${10 + i * 26}px`,
                  flexDirection: labelLeft ? 'row-reverse' : 'row',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <span style={{ ...S.dot, background: ZONE[bucketOf(v)] }} />
                <span style={{ ...S.dotLabel, [labelLeft ? 'marginRight' : 'marginLeft']: '5px' }}>{short(o)}</span>
              </div>
            )
          })}
        </div>
        <div style={S.axis}><span>dread</span><span>neutral</span><span>want</span></div>
      </div>
      <div style={S.tally}>
        <span style={{ color: ZONE.hopeful }}>● {counts.hopeful} welcomed</span>
        <span style={{ color: ZONE.neutral }}>● {counts.neutral} neutral</span>
        <span style={{ color: ZONE.scared }}>● {counts.scared} dreaded</span>
      </div>
      <p style={S.reading}>{reading}</p>
      <div style={S.row2}>
        <button onClick={() => setStep(0)} style={S.back}>‹ Adjust</button>
        <button onClick={save} disabled={saving} style={{ ...S.cta, flex: 1, marginTop: 0, ...(saving ? S.ctaOff : {}) }}>
          {saving ? 'Saving…' : 'This is the map ›'}
        </button>
      </div>
    </div>
  )
}

const S = {
  lead: { fontSize: '15px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: '0 0 1.2rem' },
  feelList: { display: 'flex', flexDirection: 'column', gap: '1.15rem' },
  feelRow: { display: 'flex', flexDirection: 'column' },
  outcomeText: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: '0 0 0.6rem' },
  slider: { width: '100%', height: '8px', borderRadius: '4px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(90deg, #C5572C 0%, #C9A86F 50%, #7A8C5A 100%)', outline: 'none', cursor: 'pointer', accentColor: '#854F0B' },
  sliderEnds: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '6px 0 0' },
  feelNow: { fontSize: '12px', fontStyle: 'normal', fontWeight: 600, fontFamily: 'Georgia, serif' },
  mapCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #E8DFD0', borderRadius: '16px', padding: '1rem 1rem 0.75rem', boxShadow: '0 3px 14px rgba(80,50,20,0.06)' },
  mapField: { position: 'relative', borderLeft: '1px dashed #E0D5C2', borderRight: '1px dashed #E0D5C2', background: 'linear-gradient(90deg, rgba(197,87,44,0.05) 0%, rgba(255,255,255,0) 50%, rgba(122,140,90,0.06) 100%)' },
  dotWrap: { position: 'absolute', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', zIndex: 1 },
  dot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, boxShadow: '0 1px 3px rgba(60,40,20,0.2)' },
  dotLabel: { fontSize: '11.5px', color: '#3A2D1E', fontFamily: 'Georgia, serif', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' },
  axis: { display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginTop: '8px', padding: '0 2px' },
  tally: { display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px', fontFamily: 'Georgia, serif', fontWeight: 600, margin: '0.9rem 0 0' },
  reading: { fontSize: '15px', color: '#3A2D1E', fontFamily: 'Georgia, serif', lineHeight: 1.65, margin: '1rem 0 1.3rem' },
  cta: { width: '100%', padding: '16px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)', marginTop: '1.2rem' },
  ctaOff: { background: '#C9B894', boxShadow: 'none', cursor: 'not-allowed' },
  row2: { display: 'flex', gap: '10px', alignItems: 'center' },
  back: { padding: '16px 18px', background: 'transparent', color: '#854F0B', border: '0.5px solid #DDCFB6', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
}