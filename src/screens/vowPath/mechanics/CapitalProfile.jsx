import { useState } from 'react'

// DAY 12 — "Recovery capital" (baseline)
// Per-domain signal taps build a four-axis RADAR (physical / human / social /
// cultural). Names your strongest (lean on it) and thinnest (Day 16 goes
// there), reads the shape, and asks which one, grown a little, would steady
// the rest. Saves capital_scores {key: 0-100} so Day 16's deep-dive and the
// Day 20 portrait keep working. (type: 'capitalProfile')
export default function CapitalProfile({ data, onSave, saving }) {
  const {
    teach = [],
    capitals = [],
    profileShape = {},
    reflectPrompt,
  } = data

  const [phase, setPhase] = useState('teach')
  const [capIdx, setCapIdx] = useState(0)
  const [taps, setTaps] = useState({})        // itemId -> true
  const [wouldGrow, setWouldGrow] = useState(null)

  const toggle = (id) => setTaps(p => { const n = { ...p }; if (n[id]) delete n[id]; else n[id] = true; return n })
  const countFor = (c) => (c.items || []).filter(i => taps[i.id]).length
  const pctFor = (c) => { const n = (c.items || []).length; return n ? Math.round(countFor(c) / n * 100) : 0 }

  const scores = {}            // key -> 0-100
  capitals.forEach(c => { scores[c.key] = pctFor(c) })
  const ranked = capitals.map(c => ({ c, pct: scores[c.key] })).sort((a, b) => b.pct - a.pct)
  const strongest = ranked[0]?.c
  const thinnest = ranked[ranked.length - 1]?.c
  const spread = (ranked[0]?.pct || 0) - (ranked[ranked.length - 1]?.pct || 0)

  const finalize = () => {
    const signals = {}
    capitals.forEach(c => { signals[c.key] = (c.items || []).filter(i => taps[i.id]).map(i => i.id) })
    onSave({
      version: 'baseline',
      capital_scores: scores,
      signals,
      would_grow: wouldGrow,
      assessed_at: new Date().toISOString(),
    })
  }

  // ===================== TEACH =====================
  if (phase === 'teach') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Day 12 · Recovery capital</p>
        <h2 style={S.prompt}>What you can draw on, across four kinds.</h2>
        {teach.map((t, i) => <p key={i} style={{ ...S.body, marginBottom: i === teach.length - 1 ? '0.5rem' : '0.85rem' }}>{t}</p>)}
        <div style={S.footer}>
          <button onClick={() => setPhase('assess')} style={S.primaryBtn}>Take the snapshot ›</button>
        </div>
      </div>
    )
  }

  // ===================== ASSESS (per capital) =====================
  if (phase === 'assess') {
    const c = capitals[capIdx]
    const last = capIdx === capitals.length - 1
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>{capIdx + 1} of {capitals.length}</p>
        <h2 style={S.prompt}>{c.label}</h2>
        <p style={S.hint}>{c.description}</p>
        <p style={{ ...S.groupLabel, marginTop: '1rem' }}>Tap each one that is true right now</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
          {(c.items || []).map(it => {
            const on = !!taps[it.id]
            return (
              <button key={it.id} onClick={() => toggle(it.id)}
                style={{
                  textAlign: 'left', padding: '10px 14px', borderRadius: '20px', cursor: 'pointer',
                  border: on ? '1.5px solid #6E7A4A' : '0.5px solid #E0D5C2',
                  background: on ? 'linear-gradient(180deg, #F1F4E9 0%, #E7EDD9 100%)' : '#FDFBF6',
                  color: on ? '#46562C' : '#4A3A28', fontWeight: on ? 600 : 400,
                  fontSize: '13px', fontFamily: 'Georgia, serif', lineHeight: 1.35,
                }}>
                {it.label}
              </button>
            )
          })}
        </div>
        <p style={{ fontSize: '12.5px', color: '#A8946F', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0.9rem 0 0' }}>
          {countFor(c)} of {(c.items || []).length} — no right number, just what's true
        </p>
        <div style={S.footer}>
          <button onClick={() => capIdx > 0 ? setCapIdx(capIdx - 1) : setPhase('teach')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => last ? setPhase('profile') : setCapIdx(capIdx + 1)} style={S.primaryBtnFlex}>{last ? 'See your profile ›' : 'Next ›'}</button>
        </div>
      </div>
    )
  }

  // ===================== PROFILE (radar) =====================
  if (phase === 'profile') {
    const shapeText = spread <= 30 ? profileShape.balanced : profileShape.spiky
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Your profile</p>
        <h2 style={S.prompt}>Read it as a shape, not a grade.</h2>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.6rem 0 0.4rem' }}>
          {radar(capitals, scores)}
        </div>
        <div style={{ display: 'flex', gap: '9px', marginTop: '0.6rem' }}>
          <div style={{ flex: 1, background: 'linear-gradient(180deg, #F1F4E9 0%, #E7EDD9 100%)', border: '0.5px solid #CBD6B4', borderRadius: '11px', padding: '11px 13px' }}>
            <p style={{ fontSize: '10px', color: '#5E7040', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'Georgia, serif', margin: '0 0 3px' }}>Strongest — lean on it</p>
            <p style={{ fontSize: '14px', color: '#46562C', fontFamily: 'Georgia, serif', fontWeight: 600, margin: 0 }}>{strongest?.label}</p>
          </div>
          <div style={{ flex: 1, background: 'linear-gradient(180deg, #FAEBE1 0%, #F6E0D2 100%)', border: '0.5px solid #E6C3AC', borderRadius: '11px', padding: '11px 13px' }}>
            <p style={{ fontSize: '10px', color: '#B2541F', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'Georgia, serif', margin: '0 0 3px' }}>Thinnest — Day 16 goes here</p>
            <p style={{ fontSize: '14px', color: '#7A3A12', fontFamily: 'Georgia, serif', fontWeight: 600, margin: 0 }}>{thinnest?.label}</p>
          </div>
        </div>
        {shapeText && <p style={{ ...S.body, marginTop: '1rem' }}>{shapeText}</p>}
        <div style={S.footer}>
          <button onClick={() => { setCapIdx(capitals.length - 1); setPhase('assess') }} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('reflect')} style={S.primaryBtnFlex}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== REFLECT =====================
  if (phase === 'reflect') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>One to grow</p>
        <h2 style={S.prompt}>{reflectPrompt || 'Which one, grown a little, would steady the rest?'}</h2>
        <div style={S.optList}>
          {capitals.map(c => {
            const on = wouldGrow === c.key
            return <button key={c.key} onClick={() => setWouldGrow(c.key)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>{c.label}</button>
          })}
        </div>
        <div style={S.footer}>
          <button onClick={() => setPhase('profile')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('review')} disabled={!wouldGrow} style={{ ...S.primaryBtnFlex, ...(!wouldGrow ? S.disabled : {}) }}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== REVIEW =====================
  const growLabel = (capitals.find(c => c.key === wouldGrow) || {}).label
  return (
    <div style={S.container}>
      <p style={S.eyebrow}>Baseline set</p>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '0.3rem 0 0.6rem' }}>{radar(capitals, scores, 0.78)}</div>
      <div style={S.reviewCard}>
        <p style={S.reviewLabel}>Leaning on</p>
        <p style={S.reviewBig}>{strongest?.label}</p>
      </div>
      <div style={{ ...S.reviewCard, marginTop: '10px' }}>
        <p style={S.reviewLabel}>The one to grow</p>
        <p style={S.reviewBig}>{growLabel}</p>
      </div>
      <div style={S.footer}>
        <button onClick={() => setPhase('reflect')} style={S.secondaryBtn} disabled={saving}>‹ Back</button>
        <button onClick={finalize} disabled={saving} style={{ ...S.primaryBtnFlex, ...(saving ? S.disabled : {}) }}>{saving ? 'Saving…' : 'Save the baseline'}</button>
      </div>
    </div>
  )
}

// 4-axis radar: physical(top) human(right) social(bottom) cultural(left)
function radar(capitals, scores, scale = 1) {
  const size = 244 * scale, cx = size / 2, cy = size / 2 - 6 * scale, maxR = 80 * scale
  const colorOf = { physical: '#9A7B4F', human: '#A86A3A', social: '#6E7A4A', cultural: '#8A5A1A' }
  const pt = (key, frac) => {
    const r = frac * maxR
    if (key === 'physical') return [cx, cy - r]
    if (key === 'human') return [cx + r, cy]
    if (key === 'social') return [cx, cy + r]
    return [cx - r, cy]
  }
  const order = ['physical', 'human', 'social', 'cultural'].filter(k => capitals.some(c => c.key === k))
  const present = order.length === 4 ? order : capitals.map(c => c.key)
  const poly = (frac) => present.map(k => pt(k, frac).join(',')).join(' ')
  const dataPoly = present.map(k => pt(k, (scores[k] || 0) / 100).join(',')).join(' ')
  const labelOf = (k) => ((capitals.find(c => c.key === k) || {}).label || k).split('&')[0].split(' ')[0]
  const lp = (k) => {
    const [x, y] = pt(k, 1.16)
    if (k === 'physical') return { x, y: y - 2, anchor: 'middle' }
    if (k === 'social') return { x, y: y + 9, anchor: 'middle' }
    if (k === 'human') return { x: x + 2, y: y + 4, anchor: 'start' }
    return { x: x - 2, y: y + 4, anchor: 'end' }
  }
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ maxWidth: '100%' }}>
      {[0.25, 0.5, 0.75, 1].map(f => (
        <polygon key={f} points={poly(f)} fill="none" stroke="#E6DAC4" strokeWidth="1" />
      ))}
      {present.map(k => { const [x, y] = pt(k, 1); return <line key={k} x1={cx} y1={cy} x2={x} y2={y} stroke="#E6DAC4" strokeWidth="1" /> })}
      <polygon points={dataPoly} fill="rgba(217,181,122,0.30)" stroke="#9A6A2A" strokeWidth="2" strokeLinejoin="round" />
      {present.map(k => { const [x, y] = pt(k, (scores[k] || 0) / 100); return <circle key={k} cx={x} cy={y} r="3.5" fill={colorOf[k] || '#9A6A2A'} /> })}
      {present.map(k => { const p = lp(k); return <text key={k} x={p.x} y={p.y} textAnchor={p.anchor} fontFamily="Georgia, serif" fontSize={11 * scale} fill="#6B5840">{labelOf(k)}</text> })}
    </svg>
  )
}

const S = {
  container: { padding: 0 },
  eyebrow: { fontSize: '11px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: 'Georgia, serif', margin: '0 0 0.75rem' },
  prompt: { fontSize: '20px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.32, margin: '0 0 0.6rem' },
  body: { fontSize: '14.5px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.62, margin: 0 },
  hint: { fontSize: '13px', color: '#8A7355', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 0.25rem' },
  groupLabel: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600, fontFamily: 'Georgia, serif', margin: '0 0 0.5rem' },
  footer: { display: 'flex', gap: '10px', marginTop: '1.75rem' },
  primaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  primaryBtnFlex: { flex: 1, padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  secondaryBtn: { padding: '14px 20px', background: 'transparent', color: '#8A7355', border: '0.5px solid #D9C9B0', borderRadius: '12px', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  disabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  optList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.3rem' },
  opt: { textAlign: 'left', padding: '13px 15px', borderRadius: '11px', border: '0.5px solid #E0D5C2', background: '#FDFBF6', color: '#3A2D1E', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer', lineHeight: 1.4 },
  optOn: { border: '1.5px solid #8A5A1A', background: 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)', color: '#5A3A0E', fontWeight: 600 },
  reviewCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #EADFCB', borderRadius: '13px', padding: '14px 16px' },
  reviewLabel: { fontSize: '10px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'Georgia, serif', margin: '0 0 0.35rem' },
  reviewBig: { fontSize: '15.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.4 },
}