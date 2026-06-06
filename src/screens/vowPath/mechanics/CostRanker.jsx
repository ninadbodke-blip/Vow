import { useState, useEffect, useMemo } from 'react'

// =====================================================================
// What it costs you (Reflect · Day 8) — rank, then weigh.
// Step 0: order the five costs (arrows; #1 = matters most).
// Step 1: give each a weight; they render as bars, and the gap between
// what you RANK first and what you WEIGH heaviest is surfaced.
// Saves ranking / ranking_with_metadata (cost_id,rank,label) for the
// portrait, plus weights + heaviest_cost.
// =====================================================================

const DEFAULT_W = 3

export default function CostRanker({ costs = [], existingData, onSave, saving }) {
  const [step, setStep] = useState(0)
  const [order, setOrder] = useState(costs.map(c => c.id))
  const [weights, setWeights] = useState({})

  useEffect(() => {
    if (!existingData) return
    const valid = new Set(costs.map(c => c.id))
    if (Array.isArray(existingData.ranking)) {
      const kept = existingData.ranking.filter(id => valid.has(id))
      const rest = costs.map(c => c.id).filter(id => !kept.includes(id))
      setOrder([...kept, ...rest])
    }
    if (existingData.weights) setWeights(existingData.weights)
    if (existingData.ranking) setStep(1)
  }, [existingData])

  const byId = useMemo(() => Object.fromEntries(costs.map(c => [c.id, c])), [costs])
  const labelOf = (id) => (byId[id] || {}).label || id
  const wOf = (id) => weights[id] ?? DEFAULT_W
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= order.length) return
    const next = [...order];[next[i], next[j]] = [next[j], next[i]]; setOrder(next)
  }
  const heaviest = useMemo(() => [...order].sort((a, b) => wOf(b) - wOf(a))[0], [order, weights])

  const save = () => {
    onSave({
      ranking: order,
      ranking_with_metadata: order.map((id, idx) => ({ rank: idx + 1, cost_id: id, label: labelOf(id), weight: wOf(id) })),
      weights,
      top_ranked: order[0],
      heaviest_cost: heaviest,
    })
  }

  const Heft = ({ id }) => {
    const w = wOf(id)
    return (
      <div style={S.heftBars}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setWeights(p => ({ ...p, [id]: n }))}
            style={{ ...S.heftBar, height: `${7 + n * 4}px`, background: n <= w ? '#C5572C' : '#E6DAC6' }} />
        ))}
      </div>
    )
  }

  // ---------------- STEP 0 · RANK ----------------
  if (step === 0) {
    return (
      <div>
        <p style={S.lead}>Use the arrows to put these in order. The one at the top is the cost that, when you're honest, matters most to you — not the one that sounds most responsible.</p>
        <div style={S.list}>
          {order.map((id, i) => {
            const c = byId[id]; if (!c) return null
            return (
              <div key={id} style={S.rankRow}>
                <span style={S.badge}>{i + 1}</span>
                <span style={{ flex: 1 }}>
                  <span style={S.costLabel}>{c.label}</span>
                  <span style={S.costDesc}>{c.description}</span>
                </span>
                <span style={S.arrows}>
                  <button onClick={() => move(i, -1)} disabled={i === 0} style={{ ...S.arrow, ...(i === 0 ? S.arrowOff : {}) }}>▲</button>
                  <button onClick={() => move(i, 1)} disabled={i === order.length - 1} style={{ ...S.arrow, ...(i === order.length - 1 ? S.arrowOff : {}) }}>▼</button>
                </span>
              </div>
            )
          })}
        </div>
        <button onClick={() => setStep(1)} style={S.cta}>Now weigh them ›</button>
      </div>
    )
  }

  // ---------------- STEP 1 · WEIGH + REVEAL ----------------
  const sameTop = heaviest === order[0]
  const reflection = sameTop
    ? `Your heaviest cost and your first-ranked cost are the same — ${labelOf(order[0])}. That alignment is worth keeping. It's the one to put in front of everything else when a decision gets hard.`
    : `You ranked ${labelOf(order[0])} first, but weighed ${labelOf(heaviest)} heaviest. That gap is worth sitting with — the cost that matters most in principle isn't always the one that actually presses on you day to day, and the one that presses is often the one that moves you.`
  return (
    <div>
      <p style={S.lead}>Ranking tells you the order. Now the weight — how heavily does each of these actually sit on you? Drag each up. Order and weight aren't always the same thing.</p>
      <div style={S.weighList}>
        {order.map((id, i) => (
          <div key={id} style={S.weighRow}>
            <div style={S.weighHead}>
              <span style={S.badgeSm}>{i + 1}</span>
              <span style={S.weighLabel}>{labelOf(id)}</span>
              <Heft id={id} />
            </div>
            <span style={S.barTrack}><span style={{ ...S.barFill, width: `${(wOf(id) / 5) * 100}%`, opacity: 0.4 + (wOf(id) / 5) * 0.6 }} /></span>
          </div>
        ))}
      </div>
      <p style={S.reading}>{reflection}</p>
      <div style={S.row2}>
        <button onClick={() => setStep(0)} style={S.back}>‹ Reorder</button>
        <button onClick={save} disabled={saving} style={{ ...S.cta, flex: 1, marginTop: 0, ...(saving ? S.ctaOff : {}) }}>
          {saving ? 'Saving…' : 'This is the picture ›'}
        </button>
      </div>
    </div>
  )
}

const S = {
  lead: { fontSize: '15px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: '0 0 1.2rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  rankRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '12px', boxShadow: '0 2px 4px rgba(80,50,20,0.04)' },
  badge: { width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, fontFamily: 'Georgia, serif', flexShrink: 0 },
  costLabel: { display: 'block', fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 600 },
  costDesc: { display: 'block', fontSize: '12.5px', color: '#7A6A52', fontFamily: 'Georgia, serif', lineHeight: 1.45, marginTop: '2px' },
  arrows: { display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 },
  arrow: { width: '30px', height: '24px', background: '#FBF7EF', border: '0.5px solid #DDCFB6', borderRadius: '7px', color: '#854F0B', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit', padding: 0 },
  arrowOff: { opacity: 0.3, cursor: 'not-allowed' },
  weighList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  weighRow: { display: 'flex', flexDirection: 'column', gap: '7px' },
  weighHead: { display: 'flex', alignItems: 'center', gap: '10px' },
  badgeSm: { width: '20px', height: '20px', borderRadius: '50%', background: '#EFE7D7', color: '#854F0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, fontFamily: 'Georgia, serif', flexShrink: 0 },
  weighLabel: { flex: 1, fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500 },
  barTrack: { height: '9px', borderRadius: '5px', background: '#EFE7D7', overflow: 'hidden' },
  barFill: { display: 'block', height: '100%', background: 'linear-gradient(90deg, #C9A86F 0%, #C5572C 100%)', borderRadius: '5px', transition: 'width 0.18s' },
  heftBars: { display: 'flex', alignItems: 'flex-end', gap: '4px', height: '28px', flexShrink: 0 },
  heftBar: { width: '11px', border: 'none', borderRadius: '3px', cursor: 'pointer', padding: 0, transition: 'background 0.12s' },
  reading: { fontSize: '15px', color: '#3A2D1E', fontFamily: 'Georgia, serif', lineHeight: 1.65, margin: '1.3rem 0 1.3rem' },
  cta: { width: '100%', padding: '16px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)', marginTop: '1.2rem' },
  ctaOff: { background: '#C9B894', boxShadow: 'none', cursor: 'not-allowed' },
  row2: { display: 'flex', gap: '10px', alignItems: 'center' },
  back: { padding: '16px 18px', background: 'transparent', color: '#854F0B', border: '0.5px solid #DDCFB6', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
}
