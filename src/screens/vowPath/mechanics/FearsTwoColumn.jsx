import { useState, useEffect, useMemo } from 'react'

// =====================================================================
// The Balance (Reflect · Day 16) — Decisional balance for ambivalence.
// Two sets of fears: stopping (left) vs continuing (right). Name them,
// give each a weight, then a real scale tips toward the heavier side.
// MI framing: the point is to SEE which way you lean, not to decide.
// Saves left_selected / right_selected / left_customs / right_customs /
// total_count (portrait-compatible) plus weights + tipped_toward.
// =====================================================================

const SIDE = {
  left: { color: '#8A5A1A', soft: '#F3E7D2' },
  right: { color: '#C5572C', soft: '#F7E2D5' },
}
const DEFAULT_W = 3

export default function FearsTwoColumn({
  leftColumn = {},
  rightColumn = {},
  allowCustom = true,
  maxCustomPerSide = 2,
  existingData,
  onSave,
  saving,
}) {
  const [step, setStep] = useState(0) // 0 name · 1 weigh · 2 balance
  const [leftSel, setLeftSel] = useState([])
  const [rightSel, setRightSel] = useState([])
  const [leftCustoms, setLeftCustoms] = useState([]) // [{id,label}]
  const [rightCustoms, setRightCustoms] = useState([])
  const [weights, setWeights] = useState({}) // id -> 1..5
  const [draftL, setDraftL] = useState('')
  const [draftR, setDraftR] = useState('')

  useEffect(() => {
    if (!existingData) return
    const toObjs = (arr, p) => (arr || []).map((c, i) => (typeof c === 'string' ? { id: `${p}c${i}`, label: c } : c))
    setLeftSel(existingData.left_selected || [])
    setRightSel(existingData.right_selected || [])
    setLeftCustoms(toObjs(existingData.left_customs, 'l'))
    setRightCustoms(toObjs(existingData.right_customs, 'r'))
    setWeights(existingData.weights || {})
    if ((existingData.left_selected || []).length || (existingData.right_selected || []).length) setStep(2)
  }, [existingData])

  const lFears = leftColumn.fears || []
  const rFears = rightColumn.fears || []
  const labelFor = (side, id) => {
    const pool = side === 'left' ? lFears : rFears
    const cust = side === 'left' ? leftCustoms : rightCustoms
    return (pool.find(f => f.id === id) || cust.find(c => c.id === id) || {}).label || id
  }

  const toggle = (side, id) => {
    const [sel, setSel] = side === 'left' ? [leftSel, setLeftSel] : [rightSel, setRightSel]
    setSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    setWeights(w => (w[id] ? w : { ...w, [id]: DEFAULT_W }))
  }
  const addCustom = (side) => {
    const draft = side === 'left' ? draftL : draftR
    const v = draft.trim(); if (!v) return
    const list = side === 'left' ? leftCustoms : rightCustoms
    if (list.length >= maxCustomPerSide) return
    const id = `${side[0]}c${Date.now() % 100000}`
    const obj = { id, label: v }
    if (side === 'left') { setLeftCustoms([...leftCustoms, obj]); setDraftL('') }
    else { setRightCustoms([...rightCustoms, obj]); setDraftR('') }
    setWeights(w => ({ ...w, [id]: DEFAULT_W }))
  }
  const removeCustom = (side, id) => {
    if (side === 'left') setLeftCustoms(leftCustoms.filter(c => c.id !== id))
    else setRightCustoms(rightCustoms.filter(c => c.id !== id))
  }

  const leftItems = useMemo(() => [...leftSel.map(id => ({ id, label: labelFor('left', id) })), ...leftCustoms], [leftSel, leftCustoms])
  const rightItems = useMemo(() => [...rightSel.map(id => ({ id, label: labelFor('right', id) })), ...rightCustoms], [rightSel, rightCustoms])
  const totalCount = leftItems.length + rightItems.length
  const lw = leftItems.reduce((s, it) => s + (weights[it.id] || DEFAULT_W), 0)
  const rw = rightItems.reduce((s, it) => s + (weights[it.id] || DEFAULT_W), 0)
  const tot = lw + rw || 1
  const frac = (rw - lw) / tot
  const tipped = Math.abs(frac) < 0.08 ? 'even' : frac > 0 ? 'change' : 'staying'

  const save = () => {
    onSave({
      left_selected: leftSel,
      right_selected: rightSel,
      left_customs: leftCustoms.map(c => c.label),
      right_customs: rightCustoms.map(c => c.label),
      total_count: totalCount,
      weights,
      left_weight: lw,
      right_weight: rw,
      tipped_toward: tipped,
    })
  }

  // ---------- shared bits ----------
  const WEIGHT_WORD = ['', 'light', 'some', 'real', 'heavy', 'crushing']
  const Heft = ({ id, color }) => {
    const w = weights[id] || DEFAULT_W
    const pct = ((w - 1) / 4) * 100
    return (
      <div style={S.heftWrap}>
        <div style={S.sliderRow}>
          <span style={S.sliderTrack}>
            <span style={{ ...S.sliderFill, width: `${pct}%`, background: color, opacity: 0.45 + (w / 5) * 0.55 }} />
          </span>
          <input
            type="range" min="1" max="5" step="1" value={w}
            onChange={(e) => setWeights(p => ({ ...p, [id]: Number(e.target.value) }))}
            className="vowFearSlider"
            aria-label="How heavy this fear sits"
            style={{ ...S.slider, '--vow-thumb': color }}
          />
        </div>
        <span style={{ ...S.weightWord, color }}>{WEIGHT_WORD[w]}</span>
      </div>
    )
  }

  // ============================ STEP 0 · NAME ============================
  if (step === 0) {
    const Column = ({ side, col, sel, customs, draft, setDraft }) => {
      const c = SIDE[side]
      return (
        <div style={{ marginBottom: '1.4rem' }}>
          <div style={{ ...S.colHead, borderColor: c.color }}>
            <p style={S.colTitle}>{col.title}</p>
            <p style={{ ...S.colSub, color: c.color }}>{col.subtitle}</p>
          </div>
          <div style={S.list}>
            {(col.fears || []).map(f => {
              const on = sel.includes(f.id)
              return (
                <button key={f.id} onClick={() => toggle(side, f.id)}
                  style={{ ...S.fearBtn, ...(on ? { background: c.soft, border: `1px solid ${c.color}`, boxShadow: `0 3px 10px ${c.color}14` } : {}) }}>
                  <span style={{ ...S.box, ...(on ? { background: c.color, border: `1px solid ${c.color}` } : {}) }}>{on ? '✓' : ''}</span>
                  <span style={S.fearText}>{f.label}</span>
                </button>
              )
            })}
            {customs.map(cu => (
              <button key={cu.id} onClick={() => removeCustom(side, cu.id)}
                style={{ ...S.fearBtn, background: c.soft, border: `1px solid ${c.color}` }}>
                <span style={{ ...S.box, background: c.color, border: `1px solid ${c.color}` }}>✓</span>
                <span style={{ ...S.fearText, fontStyle: 'italic' }}>{cu.label}</span>
                <span style={S.removeX}>remove</span>
              </button>
            ))}
            {allowCustom && customs.length < maxCustomPerSide && (
              <div style={S.customRow}>
                <input value={draft} onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustom(side)}
                  placeholder="Add your own…" style={S.input} />
                <button onClick={() => addCustom(side)} style={{ ...S.addBtn, color: c.color, borderColor: c.color }}>Add</button>
              </div>
            )}
          </div>
        </div>
      )
    }
    return (
      <div>
        <p style={S.lead}>Both sides are real. Name the fears that actually live in you — the ones you're afraid of if you stop, and the ones you're afraid of if you don't.</p>
        <Column side="left" col={leftColumn} sel={leftSel} customs={leftCustoms} draft={draftL} setDraft={setDraftL} />
        <Column side="right" col={rightColumn} sel={rightSel} customs={rightCustoms} draft={draftR} setDraft={setDraftR} />
        <button onClick={() => setStep(1)} disabled={totalCount < 2}
          style={{ ...S.cta, ...(totalCount < 2 ? S.ctaOff : {}) }}>
          {totalCount < 2 ? 'Name at least two' : `Weigh these ${totalCount} ›`}
        </button>
      </div>
    )
  }

  // ============================ STEP 1 · WEIGH ============================
  if (step === 1) {
    const Block = ({ side, items, title }) => {
      const c = SIDE[side]
      return (
        <div style={{ marginBottom: '1.3rem' }}>
          <div style={{ ...S.colHead, borderColor: c.color, marginBottom: '0.7rem' }}>
            <p style={{ ...S.colSub, color: c.color, fontStyle: 'normal', fontWeight: 600, letterSpacing: '0.04em' }}>{title}</p>
          </div>
          {items.map(it => (
            <div key={it.id} style={S.weighRowCol}>
              <span style={S.weighLabel}>{it.label}</span>
              <Heft id={it.id} color={c.color} />
            </div>
          ))}
        </div>
      )
    }
    return (
      <div>
        <style>{`
          .vowFearSlider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; border-radius: 50%; background: var(--vow-thumb, #C5572C); border: 2px solid #FBF6EA; box-shadow: 0 2px 6px rgba(60,30,10,0.35); cursor: pointer; }
          .vowFearSlider::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: var(--vow-thumb, #C5572C); border: 2px solid #FBF6EA; box-shadow: 0 2px 6px rgba(60,30,10,0.35); cursor: pointer; }
          .vowFearSlider::-webkit-slider-runnable-track { background: transparent; }
          .vowFearSlider::-moz-range-track { background: transparent; }
        `}</style>
        <p style={S.lead}>Now give each one a weight — not how likely it is, but how <em>heavy</em> it sits. Slide each fear from light to crushing. Some are loud but light; some are quiet but enormous.</p>
        <div style={S.scaleHint}><span>barely there</span><span>crushing</span></div>
        {leftItems.length > 0 && <Block side="left" items={leftItems} title={leftColumn.subtitle || 'If I stop'} />}
        {rightItems.length > 0 && <Block side="right" items={rightItems} title={rightColumn.subtitle || "If I don't stop"} />}
        <div style={S.row2}>
          <button onClick={() => setStep(0)} style={S.back}>‹ Back</button>
          <button onClick={() => setStep(2)} style={{ ...S.cta, flex: 1, marginTop: 0 }}>See the balance ›</button>
        </div>
      </div>
    )
  }

  // ============================ STEP 2 · BALANCE ============================
  const ang = frac * 15
  const rad = (ang * Math.PI) / 180
  const cx = 160, py = 60, half = 118, chain = 28
  const lx = cx - half * Math.cos(rad), ly = py - half * Math.sin(rad)
  const rx = cx + half * Math.cos(rad), ry = py + half * Math.sin(rad)
  const pan = (x, y, c, weight) => (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + chain} stroke="#BBA989" strokeWidth="1.2" />
      <ellipse cx={x} cy={y + chain} rx="46" ry="9" fill={c} opacity="0.16" />
      <path d={`M ${x - 46} ${y + chain} Q ${x} ${y + chain + 16} ${x + 46} ${y + chain}`} fill="none" stroke={c} strokeWidth="2.2" />
      <circle cx={x} cy={y + chain - 1} r="13" fill={c} />
      <text x={x} y={y + chain + 3} textAnchor="middle" fontSize="13" fontWeight="700" fill="#FFFFFF" fontFamily="Georgia, serif">{weight}</text>
    </g>
  )
  const readingText =
    tipped === 'change'
      ? "Right now, what you're afraid of if you don't change weighs more than what you're afraid of in changing. The scale is leaning toward change — not because anyone pushed it, but because your own fears already lean that way. That's worth noticing. You don't have to act on it today."
      : tipped === 'staying'
      ? "Right now, the fears of stopping weigh more than the fears of continuing. That's an honest place to be, and a common one in this stage — the cost of staying hasn't yet outgrown the fear of change. Nothing here says it should. But it's worth seeing clearly which way you lean today, because for most people it shifts."
      : "Your two sets of fears weigh almost the same. That stuck, balanced feeling has a name — ambivalence — and it's the defining experience of this stage, not a failure of it. You're not refusing to decide; you're holding two true things at once. Seeing them on one scale is the work."

  return (
    <div>
      <p style={S.lead}>This is where you lean today — not a verdict, just the shape of your own fears, weighed honestly.</p>
      <div style={S.scaleCard}>
        <svg viewBox="0 0 320 200" style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* base + post */}
          <path d="M 130 196 L 190 196 L 178 168 L 142 168 Z" fill="#6E4410" opacity="0.9" />
          <rect x={cx - 3} y={py + 4} width="6" height="166" rx="3" fill="#6E4410" />
          {/* beam */}
          <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#6E4410" strokeWidth="5" strokeLinecap="round" />
          <circle cx={cx} cy={py} r="6.5" fill="#3A2A1C" />
          {/* pans */}
          {pan(lx, ly, SIDE.left.color, lw)}
          {pan(rx, ry, SIDE.right.color, rw)}
        </svg>
        <div style={S.panLabels}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ ...S.panTitle, color: SIDE.left.color }}>{leftColumn.title || 'If I stop'}</p>
            <p style={S.panMeta}>{leftItems.length} fear{leftItems.length === 1 ? '' : 's'} · weight {lw}</p>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ ...S.panTitle, color: SIDE.right.color }}>{rightColumn.title || "If I don't stop"}</p>
            <p style={S.panMeta}>{rightItems.length} fear{rightItems.length === 1 ? '' : 's'} · weight {rw}</p>
          </div>
        </div>
      </div>
      <p style={S.reading}>{readingText}</p>
      <div style={S.row2}>
        <button onClick={() => setStep(1)} style={S.back}>‹ Adjust</button>
        <button onClick={save} disabled={saving} style={{ ...S.cta, flex: 1, marginTop: 0, ...(saving ? S.ctaOff : {}) }}>
          {saving ? 'Saving…' : 'This is where I am ›'}
        </button>
      </div>
    </div>
  )
}

const S = {
  lead: { fontSize: '15px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: '0 0 1.3rem' },
  colHead: { padding: '0 0 0.6rem 12px', borderLeft: '3px solid #C5572C', marginBottom: '0.9rem' },
  colTitle: { fontSize: '17px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 2px' },
  colSub: { fontSize: '12px', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0 },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  fearBtn: { display: 'flex', alignItems: 'flex-start', width: '100%', padding: '12px 14px', background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '12px', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', gap: '10px', transition: 'all 0.15s', boxShadow: '0 2px 4px rgba(80,50,20,0.04)' },
  box: { width: '18px', height: '18px', borderRadius: '5px', border: '1px solid #DDCFB6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#FAF7F1', flexShrink: 0, background: 'white', marginTop: '1px' },
  fearText: { fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.5, flex: 1 },
  removeX: { fontSize: '10px', color: '#9C8C78', fontStyle: 'italic', alignSelf: 'center', flexShrink: 0 },
  customRow: { display: 'flex', gap: '8px', marginTop: '2px' },
  input: { flex: 1, padding: '11px 13px', borderRadius: '10px', border: '0.5px solid #DDCFB6', background: 'white', fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', boxSizing: 'border-box', outline: 'none' },
  addBtn: { background: 'transparent', border: '0.5px solid #C5572C', borderRadius: '10px', padding: '0 16px', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' },
  weighRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '0.5px solid #EEE6D7' },
  weighLabel: { fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.45, flex: 1 },
  weighRowCol: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0', borderBottom: '0.5px solid #EEE6D7' },
  sliderRow: { position: 'relative', flex: 1, height: '26px', display: 'flex', alignItems: 'center' },
  sliderTrack: { position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', height: '10px', borderRadius: '6px', background: '#EFE7D7', overflow: 'hidden', pointerEvents: 'none' },
  sliderFill: { display: 'block', height: '100%', borderRadius: '6px' },
  slider: { position: 'relative', zIndex: 1, width: '100%', margin: 0, background: 'transparent', WebkitAppearance: 'none', appearance: 'none', height: '26px', cursor: 'pointer' },
  weightWord: { fontSize: '12px', fontFamily: 'Georgia, serif', fontStyle: 'italic', minWidth: '56px', textAlign: 'right', flexShrink: 0 },
  heftWrap: { width: '100%', display: 'flex', alignItems: 'center', gap: '10px' },
  scaleHint: { display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '-0.6rem 0 1rem', padding: '0 2px' },
  scaleCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #E8DFD0', borderRadius: '18px', padding: '1.4rem 1rem 1.1rem', boxShadow: '0 3px 14px rgba(80,50,20,0.06)' },
  panLabels: { display: 'flex', gap: '10px', marginTop: '0.4rem' },
  panTitle: { fontSize: '14px', fontFamily: 'Georgia, serif', fontWeight: 600, margin: '0 0 1px' },
  panMeta: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0 },
  reading: { fontSize: '15px', color: '#3A2D1E', fontFamily: 'Georgia, serif', lineHeight: 1.65, margin: '1.2rem 0 1.3rem' },
  cta: { width: '100%', padding: '16px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)', marginTop: '0.5rem' },
  ctaOff: { background: '#C9B894', boxShadow: 'none', cursor: 'not-allowed' },
  row2: { display: 'flex', gap: '10px', alignItems: 'center' },
  back: { padding: '16px 18px', background: 'transparent', color: '#854F0B', border: '0.5px solid #DDCFB6', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
}