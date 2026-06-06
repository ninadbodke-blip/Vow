import { useState, useEffect, useMemo } from 'react'

// =====================================================================
// What brought you here (Reflect · Day 1) — reasons, then the quiet one.
// Step 0: pick the reasons that are true (multi-select + custom).
// Step 1: mark the one you'd least say out loud — the reason that
// actually moves you (intrinsic change talk). Saves selected_chips /
// custom_additions / custom_chips (portrait-compatible) + core_reason.
// =====================================================================

export default function MultiSelectChips({
  header,
  subtext,
  chips = [],
  allowCustom = true,
  minSelection = 1,
  existingData,
  onSave,
  saving,
}) {
  const [step, setStep] = useState(0)
  const [selectedIds, setSelectedIds] = useState([])
  const [customs, setCustoms] = useState([]) // [{id,label}]
  const [draft, setDraft] = useState('')
  const [coreId, setCoreId] = useState(null)

  useEffect(() => {
    if (!existingData) return
    setSelectedIds(existingData.selected_chips || [])
    const cs = (existingData.custom_chips || existingData.custom_additions || []).map((c, i) => (typeof c === 'string' ? { id: `c${i}`, label: c } : c))
    setCustoms(cs)
    if (existingData.core_reason) setCoreId(existingData.core_reason)
    if ((existingData.selected_chips || []).length) setStep(1)
  }, [existingData])

  const byId = useMemo(() => Object.fromEntries(chips.map(c => [c.id, c.label])), [chips])
  const toggle = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const addCustom = () => {
    const v = draft.trim(); if (!v || customs.length >= 5) return
    setCustoms([...customs, { id: `c${Date.now() % 100000}`, label: v }]); setDraft('')
  }
  const removeCustom = (id) => { setCustoms(customs.filter(c => c.id !== id)); if (coreId === id) setCoreId(null) }

  const chosen = useMemo(() => [
    ...selectedIds.map(id => ({ id, label: byId[id] || id })),
    ...customs.map(c => ({ id: c.id, label: c.label, custom: true })),
  ], [selectedIds, customs, byId])
  const total = chosen.length

  const labelOf = (id) => (chosen.find(c => c.id === id) || {}).label || null
  const save = (core) => {
    onSave({
      selected_chips: selectedIds,
      custom_additions: customs.map(c => c.label),
      custom_chips: customs.map(c => c.label),
      custom_addition: customs[0]?.label || null,
      core_reason: core || null,
      core_reason_label: core ? labelOf(core) : null,
    })
  }

  // ============================ STEP 0 · THE REASONS ============================
  if (step === 0) {
    return (
      <div>
        <p style={S.lead}>{subtext || 'Tap any that feel true. As many as you want. None of them commit you to anything.'}</p>
        <div style={S.chipWrap}>
          {chips.map(chip => {
            const on = selectedIds.includes(chip.id)
            return (
              <button key={chip.id} onClick={() => toggle(chip.id)} style={{ ...S.chip, ...(on ? S.chipOn : {}) }}>
                {on && <span style={S.tick}>✓</span>}{chip.label}
              </button>
            )
          })}
          {customs.map(c => (
            <button key={c.id} onClick={() => removeCustom(c.id)} style={{ ...S.chip, ...S.chipOn, fontStyle: 'italic' }}>
              <span style={S.tick}>✓</span>{c.label}<span style={S.chipX}>×</span>
            </button>
          ))}
        </div>
        {allowCustom && customs.length < 5 && (
          <div style={S.customRow}>
            <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder="Add your own…" style={S.input} />
            <button onClick={addCustom} disabled={!draft.trim()} style={{ ...S.addBtn, ...(draft.trim() ? {} : S.addOff) }}>Add</button>
          </div>
        )}
        <button onClick={() => setStep(1)} disabled={total < minSelection} style={{ ...S.cta, ...(total < minSelection ? S.ctaOff : {}) }}>
          {total < minSelection ? 'Tap at least one' : `Continue with ${total} ›`}
        </button>
      </div>
    )
  }

  // ============================ STEP 1 · THE QUIET ONE ============================
  return (
    <div>
      <p style={S.prompt}>You named {total} {total === 1 ? 'reason' : 'reasons'}. Now the harder question.</p>
      <p style={S.lead}>Which one would you <em>least</em> want to say out loud? That's usually the one that actually moves you — the reasons that sound responsible rarely do the real work.</p>
      <div style={S.list}>
        {chosen.map(c => {
          const on = coreId === c.id
          return (
            <button key={c.id} onClick={() => setCoreId(on ? null : c.id)} style={{ ...S.row, ...(on ? S.rowOn : {}) }}>
              <span style={{ ...S.radio, ...(on ? S.radioOn : {}) }}>{on ? '●' : ''}</span>
              <span style={{ ...S.rowText, ...(c.custom ? { fontStyle: 'italic' } : {}) }}>{c.label}</span>
            </button>
          )
        })}
      </div>
      {coreId && <p style={S.note}>That's the one to keep where you'll keep running into it. Not a promise — just the true thing, where the part of you that likes to forget has to keep seeing it.</p>}
      <button onClick={() => save(coreId)} disabled={!coreId || saving} style={{ ...S.cta, ...(!coreId || saving ? S.ctaOff : {}) }}>
        {saving ? 'Saving…' : 'Keep this one ›'}
      </button>
      <button onClick={() => save(null)} style={S.ghost}>They all weigh the same →</button>
      <button onClick={() => setStep(0)} style={S.backLink}>‹ back to the list</button>
    </div>
  )
}

const S = {
  lead: { fontSize: '15px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: '0 0 1.2rem' },
  prompt: { fontSize: '18px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.35, margin: '0 0 0.5rem' },
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '0.5rem' },
  chip: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '20px', fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 4px rgba(80,50,20,0.04)', transition: 'all 0.15s' },
  chipOn: { background: 'linear-gradient(180deg, #FDFBF6 0%, #F7E2D5 100%)', border: '1px solid #C5572C', color: '#5A3A0E', fontWeight: 600 },
  tick: { fontSize: '11px', color: '#C5572C' },
  chipX: { fontSize: '14px', color: '#A14222', marginLeft: '2px' },
  customRow: { display: 'flex', gap: '8px', margin: '0.6rem 0 0' },
  input: { flex: 1, padding: '11px 13px', borderRadius: '10px', border: '0.5px solid #DDCFB6', background: 'white', fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', boxSizing: 'border-box', outline: 'none' },
  addBtn: { background: 'transparent', border: '0.5px solid #C5572C', borderRadius: '10px', padding: '0 18px', fontSize: '13px', fontWeight: 600, color: '#C5572C', fontFamily: 'inherit', cursor: 'pointer' },
  addOff: { opacity: 0.4, cursor: 'not-allowed' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px', margin: '0.4rem 0 0' },
  row: { display: 'flex', alignItems: 'center', gap: '11px', width: '100%', padding: '13px 15px', background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '12px', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 4px rgba(80,50,20,0.04)', transition: 'all 0.15s' },
  rowOn: { background: 'linear-gradient(180deg, #FDFBF6 0%, #F7E2D5 100%)', border: '1px solid #C5572C', boxShadow: '0 3px 12px rgba(197,87,44,0.12)' },
  radio: { width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #DDCFB6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#C5572C', flexShrink: 0, background: 'white' },
  radioOn: { border: '1.5px solid #C5572C' },
  rowText: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.45 },
  note: { fontSize: '13.5px', color: '#7A6A52', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '1rem 0 0', padding: '0 2px' },
  cta: { width: '100%', padding: '16px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)', marginTop: '1.1rem' },
  ctaOff: { background: '#C9B894', boxShadow: 'none', cursor: 'not-allowed' },
  ghost: { width: '100%', padding: '12px', background: 'transparent', color: '#854F0B', border: 'none', fontSize: '13.5px', cursor: 'pointer', fontFamily: 'inherit', marginTop: '0.4rem' },
  backLink: { width: '100%', padding: '6px', background: 'transparent', color: '#9C8C78', border: 'none', fontSize: '12.5px', cursor: 'pointer', fontFamily: 'inherit', fontStyle: 'italic' },
}
