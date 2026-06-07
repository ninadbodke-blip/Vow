import { useState, useMemo } from 'react'

// =====================================================================
// Environment map (Commit · Day 2) — stimulus control, made visual.
// Four zones on one canvas (home / routine / phone / social). Each card
// fills as you queue changes; a running tally shows friction removed.
// Then a self-naming step. Saves selections / custom_lines /
// total_actions / self_naming (unchanged shape).
// =====================================================================

const ZONE_META = {
  home: { glyph: '⌂' }, routine: { glyph: '↻' }, phone: { glyph: '▢' }, social: { glyph: '◑' },
}

export default function EnvironmentMapper({ data, onSave, saving }) {
  const { zones = [], allowCustomPerZone = true, selfNamingPrompt, selfNamingOptions = [] } = data || {}
  const [phase, setPhase] = useState('map') // 'map' | 'naming'
  const [selections, setSelections] = useState({})
  const [customLines, setCustomLines] = useState({})
  const [customInputs, setCustomInputs] = useState({})
  const [selfNaming, setSelfNaming] = useState(null)

  const sel = (z) => selections[z] || []
  const cust = (z) => customLines[z] || []
  const toggle = (z, id) => setSelections(p => {
    const cur = p[z] || []
    return { ...p, [z]: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] }
  })
  const addCustom = (z) => {
    const v = (customInputs[z] || '').trim(); if (!v) return
    setCustomLines(p => ({ ...p, [z]: [...(p[z] || []), v] }))
    setCustomInputs(p => ({ ...p, [z]: '' }))
  }
  const removeCustom = (z, i) => setCustomLines(p => ({ ...p, [z]: (p[z] || []).filter((_, idx) => idx !== i) }))

  const zoneCount = (z) => sel(z.id).length + cust(z.id).length
  const zoneTotal = (z) => (z.items || []).length + cust(z.id).length
  const totalSelected = useMemo(
    () => zones.reduce((n, z) => n + zoneCount(z), 0),
    [selections, customLines, zones]
  )

  const save = () => onSave({ selections, custom_lines: customLines, total_actions: totalSelected, self_naming: selfNaming })

  // ============================ NAMING ============================
  if (phase === 'naming') {
    return (
      <div>
        <p style={S.prompt}>{selfNamingPrompt || 'And who are you becoming, as you do this?'}</p>
        <div style={S.list}>
          {selfNamingOptions.map(opt => {
            const on = selfNaming === opt.id
            return (
              <button key={opt.id} onClick={() => setSelfNaming(on ? null : opt.id)} style={{ ...S.namingRow, ...(on ? S.namingOn : {}) }}>
                <span style={{ ...S.radio, ...(on ? S.radioOn : {}) }}>{on ? '●' : ''}</span>
                <span style={S.namingText}>{opt.label}</span>
              </button>
            )
          })}
        </div>
        <div style={S.row2}>
          <button onClick={() => setPhase('map')} style={S.back}>‹ Back</button>
          <button onClick={save} disabled={!selfNaming || saving} style={{ ...S.cta, flex: 1, marginTop: 0, ...(!selfNaming || saving ? S.ctaOff : {}) }}>
            {saving ? 'Saving…' : 'Lock the plan ›'}
          </button>
        </div>
      </div>
    )
  }

  // ============================ MAP ============================
  return (
    <div>
      <p style={S.lead}>Four zones. In each, mark every change you'll make — what you remove, mute, delete, reroute. The unselected things stay. Each change you queue is a bit of friction taken off the hard days ahead.</p>

      <div style={S.tally}>
        <span style={S.tallyNum}>{totalSelected}</span>
        <span style={S.tallyLabel}>{totalSelected === 1 ? 'change queued' : 'changes queued'} across your environment</span>
      </div>

      {zones.map(z => {
        const n = zoneCount(z), tot = zoneTotal(z)
        const input = customInputs[z.id] || ''
        return (
          <div key={z.id} style={S.zoneCard}>
            <div style={S.zoneHead}>
              <span style={S.zoneGlyph}>{(ZONE_META[z.id] || {}).glyph || '•'}</span>
              <span style={{ flex: 1 }}>
                <span style={S.zoneLabel}>{z.label}</span>
                <span style={S.zonePrompt}>{z.prompt}</span>
              </span>
              <span style={S.zoneCount}>{n}</span>
            </div>
            <div style={S.fillTrack}><span style={{ ...S.fill, width: `${tot ? (n / tot) * 100 : 0}%` }} /></div>
            <div style={S.items}>
              {(z.items || []).map(it => {
                const on = sel(z.id).includes(it.id)
                return (
                  <button key={it.id} onClick={() => toggle(z.id, it.id)} style={{ ...S.item, ...(on ? S.itemOn : {}) }}>
                    <span style={{ ...S.box, ...(on ? S.boxOn : {}) }}>{on ? '✓' : ''}</span>
                    <span style={S.itemText}>{it.label}</span>
                  </button>
                )
              })}
              {cust(z.id).map((line, i) => (
                <button key={`c${i}`} onClick={() => removeCustom(z.id, i)} style={{ ...S.item, ...S.itemOn }}>
                  <span style={{ ...S.box, ...S.boxOn }}>✓</span>
                  <span style={{ ...S.itemText, fontStyle: 'italic' }}>{line}</span>
                  <span style={S.removeX}>remove</span>
                </button>
              ))}
              {allowCustomPerZone && (
                <div style={S.customRow}>
                  <input value={input} onChange={e => setCustomInputs(p => ({ ...p, [z.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addCustom(z.id)} placeholder="Add your own…" style={S.input} />
                  <button onClick={() => addCustom(z.id)} disabled={!input.trim()} style={{ ...S.addBtn, ...(input.trim() ? {} : S.addOff) }}>Add</button>
                </div>
              )}
            </div>
          </div>
        )
      })}

      <button onClick={() => setPhase('naming')} disabled={totalSelected < 1} style={{ ...S.cta, ...(totalSelected < 1 ? S.ctaOff : {}) }}>
        {totalSelected < 1 ? 'Mark at least one change' : 'This is my action list ›'}
      </button>
    </div>
  )
}

const S = {
  lead: { fontSize: '15px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: '0 0 1.2rem' },
  prompt: { fontSize: '18px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.4, margin: '0 0 1.1rem' },
  tally: { display: 'flex', alignItems: 'baseline', gap: '10px', justifyContent: 'center', background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '0.5px solid #E8DFD0', borderRadius: '14px', padding: '0.9rem 1rem', marginBottom: '1.2rem' },
  tallyNum: { fontSize: '30px', color: '#C5572C', fontFamily: 'Georgia, serif', fontWeight: 700, lineHeight: 1 },
  tallyLabel: { fontSize: '12.5px', color: '#7A6A52', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  zoneCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #E8DFD0', borderRadius: '16px', padding: '1rem 1rem 0.9rem', marginBottom: '1rem', boxShadow: '0 2px 10px rgba(80,50,20,0.05)' },
  zoneHead: { display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '0.6rem' },
  zoneGlyph: { width: '30px', height: '30px', borderRadius: '8px', background: '#F4ECDD', color: '#854F0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 },
  zoneLabel: { display: 'block', fontSize: '16px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 600 },
  zonePrompt: { display: 'block', fontSize: '12px', color: '#7A6A52', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginTop: '1px' },
  zoneCount: { fontSize: '18px', color: '#C5572C', fontFamily: 'Georgia, serif', fontWeight: 700, flexShrink: 0 },
  fillTrack: { height: '5px', borderRadius: '3px', background: '#EFE7D7', overflow: 'hidden', marginBottom: '0.9rem' },
  fill: { display: 'block', height: '100%', background: 'linear-gradient(90deg, #C9A86F 0%, #C5572C 100%)', borderRadius: '3px', transition: 'width 0.2s' },
  items: { display: 'flex', flexDirection: 'column', gap: '7px' },
  item: { display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%', padding: '11px 13px', background: 'white', border: '0.5px solid #EBE3D5', borderRadius: '11px', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', transition: 'all 0.13s' },
  itemOn: { background: 'linear-gradient(180deg, #FDFBF6 0%, #F7E2D5 100%)', border: '1px solid #C5572C' },
  box: { width: '17px', height: '17px', borderRadius: '5px', border: '1px solid #DDCFB6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#FAF7F1', flexShrink: 0, background: 'white', marginTop: '1px' },
  boxOn: { background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)', border: '1px solid #A14222' },
  itemText: { flex: 1, fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.45 },
  removeX: { fontSize: '10px', color: '#9C8C78', fontStyle: 'italic', alignSelf: 'center', flexShrink: 0 },
  customRow: { display: 'flex', gap: '8px', marginTop: '1px' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '10px', border: '0.5px solid #DDCFB6', background: 'white', fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', boxSizing: 'border-box', outline: 'none' },
  addBtn: { background: 'transparent', border: '0.5px solid #C5572C', borderRadius: '10px', padding: '0 16px', fontSize: '12.5px', fontWeight: 600, color: '#C5572C', fontFamily: 'inherit', cursor: 'pointer' },
  addOff: { opacity: 0.4, cursor: 'not-allowed' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  namingRow: { display: 'flex', alignItems: 'center', gap: '11px', width: '100%', padding: '14px 15px', background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '12px', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 4px rgba(80,50,20,0.04)', transition: 'all 0.15s' },
  namingOn: { background: 'linear-gradient(180deg, #FDFBF6 0%, #F7E2D5 100%)', border: '1px solid #C5572C', boxShadow: '0 3px 12px rgba(197,87,44,0.12)' },
  radio: { width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #DDCFB6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#C5572C', flexShrink: 0, background: 'white' },
  radioOn: { border: '1.5px solid #C5572C' },
  namingText: { fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.45 },
  cta: { width: '100%', padding: '16px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)', marginTop: '0.7rem' },
  ctaOff: { background: '#C9B894', boxShadow: 'none', cursor: 'not-allowed' },
  row2: { display: 'flex', gap: '10px', alignItems: 'center', marginTop: '1.1rem' },
  back: { padding: '16px 18px', background: 'transparent', color: '#854F0B', border: '0.5px solid #DDCFB6', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
}
