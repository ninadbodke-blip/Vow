import { useState } from 'react'

// DAY 19 — "Cultural capital" → values sort + enact
// Select what genuinely matters, tap them into a ranked top five, name which
// the substance crowded out most, then commit to one concrete action this
// week. Teaching: values are directions you move, not beliefs you hold (ACT).
// Keeps ranked_top_5 [{id,label}] (Day 20 reads it). (type: 'valuesPortrait')
export default function ValuesPortrait({ data, onSave, saving }) {
  const {
    teach = [],
    prompt,
    subtext,
    valueCategories = [],
    allowCustom = true,
    customPrompt = 'A value of your own',
    rankPrompt,
    crowdedOutPrompt,
    enactLeadPrompt,
    enactActionPrompt,
    enactWhenPrompt,
  } = data

  const [phase, setPhase] = useState('teach')
  const [selectedIds, setSelectedIds] = useState([])
  const [customValues, setCustomValues] = useState([])   // [{id:'c_0', label}]
  const [customInput, setCustomInput] = useState('')
  const [rankedIds, setRankedIds] = useState([])
  const [crowded, setCrowded] = useState(null)
  const [enactValue, setEnactValue] = useState(null)
  const [enactAction, setEnactAction] = useState('')
  const [enactWhen, setEnactWhen] = useState('')

  const allItems = valueCategories.flatMap(c => c.items)
  const labelOf = (id) => (allItems.find(i => i.id === id) || customValues.find(c => c.id === id) || {}).label || id
  const selectedAll = [...selectedIds, ...customValues.map(c => c.id)]
  const targetRank = Math.min(5, selectedAll.length)

  const toggleSel = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const addCustom = () => {
    const t = customInput.trim()
    if (!t) return
    const id = `c_${customValues.length}_${Date.now() % 100000}`
    setCustomValues([...customValues, { id, label: t }]); setCustomInput('')
  }
  const removeCustom = (id) => { setCustomValues(customValues.filter(c => c.id !== id)); setSelectedIds(selectedIds.filter(x => x !== id)); setRankedIds(rankedIds.filter(x => x !== id)) }
  const toggleRank = (id) => setRankedIds(p => p.includes(id) ? p.filter(x => x !== id) : (p.length >= targetRank ? p : [...p, id]))

  const finalize = () => {
    onSave({
      custom_values: customValues,
      ranked_top_5: rankedIds.map(id => ({ id, label: labelOf(id) })),
      crowded_out: crowded,
      crowded_out_label: crowded ? labelOf(crowded) : null,
      enact_value: enactValue,
      enact_value_label: enactValue ? labelOf(enactValue) : null,
      enact_action: enactAction.trim(),
      enact_when: enactWhen.trim() || null,
      completed_at: new Date().toISOString(),
    })
  }

  // ===================== TEACH =====================
  if (phase === 'teach') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Day 19 · Cultural capital</p>
        <h2 style={S.prompt}>A value is a direction, not a belief.</h2>
        {teach.map((t, i) => <p key={i} style={{ ...S.body, marginBottom: i === teach.length - 1 ? '0.5rem' : '0.85rem' }}>{t}</p>)}
        <div style={S.footer}>
          <button onClick={() => setPhase('select')} style={S.primaryBtn}>Surface them ›</button>
        </div>
      </div>
    )
  }

  // ===================== SELECT =====================
  if (phase === 'select') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>What matters</p>
        <h2 style={S.prompt}>{prompt || 'Tap each value that genuinely matters.'}</h2>
        <p style={S.hint}>{subtext || 'Not what you wish mattered. What actually drives your choices.'}</p>
        {valueCategories.map(cat => (
          <div key={cat.key} style={{ marginTop: '1rem' }}>
            <p style={S.groupLabel}>{cat.label}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {cat.items.map(it => {
                const on = selectedIds.includes(it.id)
                return <button key={it.id} onClick={() => toggleSel(it.id)} style={{ ...S.chip, ...(on ? S.chipOn : {}) }}>{it.label}</button>
              })}
            </div>
          </div>
        ))}
        {allowCustom && (
          <div style={{ marginTop: '1rem' }}>
            {customValues.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {customValues.map(c => (
                  <span key={c.id} style={{ ...S.chip, ...S.chipOn }}>{c.label} <span onClick={() => removeCustom(c.id)} style={{ cursor: 'pointer', opacity: 0.55, marginLeft: '3px' }}>×</span></span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '7px' }}>
              <input value={customInput} onChange={e => setCustomInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()} placeholder={customPrompt} style={{ ...S.input, marginTop: 0, flex: 1 }} maxLength={42} />
              <button onClick={addCustom} disabled={!customInput.trim()} style={{ ...S.secondaryBtn, padding: '12px 16px', opacity: customInput.trim() ? 1 : 0.4 }}>Add</button>
            </div>
          </div>
        )}
        <p style={{ fontSize: '12.5px', color: '#A8946F', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0.9rem 0 0' }}>{selectedAll.length} tapped — pick at least three</p>
        <div style={S.footer}>
          <button onClick={() => setPhase('teach')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => { setRankedIds(rankedIds.filter(id => selectedAll.includes(id))); setPhase('rank') }} disabled={selectedAll.length < 3} style={{ ...S.primaryBtnFlex, ...(selectedAll.length < 3 ? S.disabled : {}) }}>Rank them ›</button>
        </div>
      </div>
    )
  }

  // ===================== RANK =====================
  if (phase === 'rank') {
    const unranked = selectedAll.filter(id => !rankedIds.includes(id))
    const ready = rankedIds.length === targetRank
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>In order</p>
        <h2 style={S.prompt}>{rankPrompt || `Tap your top ${targetRank}, in order.`}</h2>
        <p style={S.hint}>The ones you would not trade. Tap to place; tap a placed one to remove it.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', margin: '1rem 0' }}>
          {rankedIds.map((id, i) => (
            <button key={id} onClick={() => toggleRank(id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', width: '100%', padding: '12px 14px', borderRadius: '11px', border: '1.5px solid #8A5A1A', background: 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)', cursor: 'pointer' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#8A5A1A', color: '#FBF6EA', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: '14.5px', color: '#5A3A0E', fontWeight: 600, fontFamily: 'Georgia, serif' }}>{labelOf(id)}</span>
              <span style={{ color: '#B89968', fontSize: '15px' }}>×</span>
            </button>
          ))}
          {rankedIds.length < targetRank && (
            <div style={{ border: '1px dashed #D9C9B0', borderRadius: '11px', padding: '10px 14px', fontSize: '12.5px', color: '#A8946F', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              Next: tap value #{rankedIds.length + 1} below
            </div>
          )}
        </div>

        {unranked.length > 0 && (
          <>
            <p style={S.groupLabel}>Tap to place</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {unranked.map(id => (
                <button key={id} onClick={() => toggleRank(id)} disabled={rankedIds.length >= targetRank} style={{ ...S.chip, opacity: rankedIds.length >= targetRank ? 0.4 : 1 }}>{labelOf(id)}</button>
              ))}
            </div>
          </>
        )}

        <div style={S.footer}>
          <button onClick={() => setPhase('select')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => { if (!crowded || !rankedIds.includes(crowded)) setCrowded(null); setPhase('crowded') }} disabled={!ready} style={{ ...S.primaryBtnFlex, ...(!ready ? S.disabled : {}) }}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== CROWDED OUT =====================
  if (phase === 'crowded') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>What it cost</p>
        <h2 style={S.prompt}>{crowdedOutPrompt || 'Which of these did the substance crowd out the most?'}</h2>
        <p style={S.hint}>It didn't only cost time and money. It ate the attention these needed.</p>
        <div style={S.optList}>
          {rankedIds.map(id => {
            const on = crowded === id
            return <button key={id} onClick={() => { setCrowded(id); if (!enactValue) setEnactValue(id) }} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>{labelOf(id)}</button>
          })}
        </div>
        <div style={S.footer}>
          <button onClick={() => setPhase('rank')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => { if (!enactValue) setEnactValue(crowded); setPhase('enact') }} disabled={!crowded} style={{ ...S.primaryBtnFlex, ...(!crowded ? S.disabled : {}) }}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== ENACT =====================
  if (phase === 'enact') {
    const ready = enactValue && enactAction.trim()
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Into action</p>
        <h2 style={S.prompt}>A value you don't act on is just a word.</h2>
        <p style={{ ...S.groupLabel, marginTop: '0.6rem' }}>{enactLeadPrompt || 'Pick one to act on this week'}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
          {rankedIds.map(id => {
            const on = enactValue === id
            return <button key={id} onClick={() => setEnactValue(id)} style={{ ...S.chip, ...(on ? S.chipOn : {}) }}>{labelOf(id)}</button>
          })}
        </div>
        <p style={{ ...S.groupLabel, marginTop: '1.3rem' }}>{enactActionPrompt || 'One small, concrete thing you will do this week toward it:'}</p>
        <textarea value={enactAction} onChange={e => setEnactAction(e.target.value)} placeholder="Small enough to actually happen. Concrete enough to know you did it." rows={2} style={S.textarea} maxLength={180} />
        <p style={{ ...S.groupLabel, marginTop: '1rem' }}>{enactWhenPrompt || 'When? (optional)'}</p>
        <input value={enactWhen} onChange={e => setEnactWhen(e.target.value)} placeholder="e.g. Saturday morning" style={{ ...S.input, marginTop: 0 }} maxLength={70} />
        <div style={S.footer}>
          <button onClick={() => setPhase('crowded')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('review')} disabled={!ready} style={{ ...S.primaryBtnFlex, ...(!ready ? S.disabled : {}) }}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== REVIEW =====================
  return (
    <div style={S.container}>
      <p style={S.eyebrow}>Your values, made explicit</p>
      <div style={{ ...S.card, padding: '6px 0' }}>
        {rankedIds.map((id, i) => (
          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '9px 16px', borderBottom: i < rankedIds.length - 1 ? '0.5px solid #EADFCB' : 'none' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#9A6A2A', fontFamily: 'Georgia, serif', width: '16px' }}>{i + 1}</span>
            <span style={{ fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif' }}>{labelOf(id)}</span>
          </div>
        ))}
      </div>
      <div style={{ ...S.reviewCard, marginTop: '12px', borderLeft: '3px solid #C5572C' }}>
        <p style={S.reviewLabel}>What it crowded out</p>
        <p style={S.reviewBig}>{crowded ? labelOf(crowded) : '—'}</p>
      </div>
      <div style={{ ...S.reviewCard, marginTop: '10px', borderLeft: '3px solid #7A8C5A' }}>
        <p style={S.reviewLabel}>This week — acting on {enactValue ? labelOf(enactValue).split('—')[0].trim().toLowerCase() : ''}</p>
        <p style={{ fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.45 }}>"{enactAction.trim()}"{enactWhen.trim() ? ` — ${enactWhen.trim()}` : ''}</p>
      </div>
      <div style={S.footer}>
        <button onClick={() => setPhase('enact')} style={S.secondaryBtn} disabled={saving}>‹ Back</button>
        <button onClick={finalize} disabled={saving} style={{ ...S.primaryBtnFlex, ...(saving ? S.disabled : {}) }}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
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
  card: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F5EEDF 100%)', borderRadius: '13px', border: '0.5px solid #EADFCB', overflow: 'hidden' },
  chip: { textAlign: 'left', padding: '9px 13px', borderRadius: '20px', border: '0.5px solid #E0D5C2', background: '#FDFBF6', color: '#4A3A28', fontSize: '13px', fontFamily: 'Georgia, serif', cursor: 'pointer', lineHeight: 1.35 },
  chipOn: { border: '1.5px solid #8A5A1A', background: 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)', color: '#5A3A0E', fontWeight: 600 },
  optList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.85rem' },
  opt: { textAlign: 'left', padding: '13px 15px', borderRadius: '11px', border: '0.5px solid #E0D5C2', background: '#FDFBF6', color: '#3A2D1E', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer', lineHeight: 1.4 },
  optOn: { border: '1.5px solid #8A5A1A', background: 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)', color: '#5A3A0E', fontWeight: 600 },
  input: { width: '100%', padding: '12px 14px', border: '0.5px solid #C9A86F', borderRadius: '11px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', marginTop: '2px' },
  textarea: { width: '100%', padding: '12px 14px', border: '0.5px solid #C9A86F', borderRadius: '11px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5, resize: 'vertical' },
  reviewCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #EADFCB', borderRadius: '13px', padding: '14px 16px' },
  reviewLabel: { fontSize: '10px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'Georgia, serif', margin: '0 0 0.35rem' },
  reviewBig: { fontSize: '15.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.4 },
}
