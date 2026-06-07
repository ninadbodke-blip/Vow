import { useState } from 'react'

// =====================================================================
// Daily anchors (Commit · Day 6) — habit architecture, made visible.
// Four micro-habits placed on a dawn→dusk day-arc (2 morning, 2 evening)
// so the day's skeleton is something you can see. Saves anchors +
// why_text (shape preserved).
// =====================================================================

export default function DailyAnchorPicker({ data, onSave, saving }) {
  const { anchorSlots = [], morningOptions = [], eveningOptions = [], allowCustomPerSlot = true, customPrompt = 'Your own anchor', whyTheseHeader = 'Why these four?', whyTheseSubtext = '' } = data || {}
  const [phase, setPhase] = useState('slot:0') // slot:0..3, 'why'
  const [selections, setSelections] = useState({}) // slotId -> anchorId | 'custom:text'
  const [customInputs, setCustomInputs] = useState({})
  const [whyText, setWhyText] = useState('')

  const idx = phase.startsWith('slot:') ? parseInt(phase.split(':')[1], 10) : -1
  const slot = idx >= 0 ? anchorSlots[idx] : null
  const optsFor = (s) => (s?.timeWindow === 'morning' ? morningOptions : eveningOptions)
  const labelFor = (s) => {
    const v = selections[s.id]; if (!v) return null
    if (v.startsWith('custom:')) return v.slice(7)
    return (optsFor(s).find(o => o.id === v) || {}).label || null
  }
  const shortFor = (s) => { const l = labelFor(s); return l ? (l.length > 16 ? l.slice(0, 15) + '…' : l) : null }

  const pickOption = (slotId, anchorId) => { setSelections(p => ({ ...p, [slotId]: anchorId })); setCustomInputs(p => ({ ...p, [slotId]: '' })) }
  const typeCustom = (slotId, text) => { setCustomInputs(p => ({ ...p, [slotId]: text })); setSelections(p => ({ ...p, [slotId]: text.trim() ? 'custom:' + text.trim() : undefined })) }

  const anchors = anchorSlots.map(s => ({ slot_id: s.id, time_window: s.timeWindow, anchor: selections[s.id] || null, label: labelFor(s) }))
  const save = () => onSave({ anchors, why_text: whyText.trim() || null })

  // ---------- the day arc ----------
  const Arc = ({ activeId }) => (
    <div style={S.arcWrap}>
      <div style={S.arcTrack}>
        <span style={S.sun}>☀</span>
        <span style={S.moon}>☾</span>
      </div>
      <div style={S.pegs}>
        {anchorSlots.map((s, i) => {
          const filled = !!selections[s.id]; const active = s.id === activeId
          const leftPct = [16, 38, 62, 84][i] ?? (i / (anchorSlots.length - 1)) * 100
          return (
            <div key={s.id} style={{ ...S.peg, left: `${leftPct}%` }}>
              <span style={{ ...S.pegDot, ...(filled ? S.pegDotFilled : {}), ...(active ? S.pegDotActive : {}) }}>{filled ? '✓' : ''}</span>
              <span style={S.pegLabel}>{shortFor(s) || (s.timeWindow === 'morning' ? 'morning' : 'evening')}</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ============================ WHY ============================
  if (phase === 'why') {
    return (
      <div>
        <Arc activeId={null} />
        <p style={S.prompt}>{whyTheseHeader}</p>
        {whyTheseSubtext && <p style={S.lead}>{whyTheseSubtext}</p>}
        <textarea value={whyText} onChange={e => setWhyText(e.target.value)} rows={3} placeholder="One sentence…" style={S.textarea} />
        <div style={S.row2}>
          <button onClick={() => setPhase('slot:3')} style={S.back}>‹ Back</button>
          <button onClick={save} disabled={saving} style={{ ...S.cta, flex: 1, marginTop: 0, ...(saving ? S.ctaOff : {}) }}>
            {saving ? 'Saving…' : 'Set the rhythm ›'}
          </button>
        </div>
      </div>
    )
  }

  // ============================ A SLOT ============================
  if (!slot) return null
  const opts = optsFor(slot)
  const sel = selections[slot.id]
  const isCustom = sel?.startsWith('custom:')
  const last = idx === anchorSlots.length - 1
  return (
    <div>
      <Arc activeId={slot.id} />
      <p style={S.slotTitle}>{slot.timeWindow === 'morning' ? 'Morning' : 'Evening'} anchor · {(idx % 2) + 1} of 2</p>
      <p style={S.lead}>{slot.timeWindow === 'morning' ? 'How the day starts sets its tone. Pick one small thing.' : 'How the day ends sets the next one up. Pick one small thing.'} Under five minutes, every day.</p>
      <div style={S.optList}>
        {opts.map(o => {
          const on = sel === o.id
          return (
            <button key={o.id} onClick={() => pickOption(slot.id, o.id)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>
              <span style={{ ...S.radio, ...(on ? S.radioOn : {}) }}>{on ? '●' : ''}</span>
              <span style={S.optText}>{o.label}</span>
            </button>
          )
        })}
        {allowCustomPerSlot && (
          <div style={{ ...S.opt, ...(isCustom ? S.optOn : {}), padding: '10px 13px' }}>
            <span style={{ ...S.radio, ...(isCustom ? S.radioOn : {}) }}>{isCustom ? '●' : ''}</span>
            <input value={customInputs[slot.id] || ''} onChange={e => typeCustom(slot.id, e.target.value)} placeholder={customPrompt} style={S.customInput} />
          </div>
        )}
      </div>
      <div style={S.row2}>
        {idx > 0 && <button onClick={() => setPhase(`slot:${idx - 1}`)} style={S.back}>‹ Back</button>}
        <button onClick={() => setPhase(last ? 'why' : `slot:${idx + 1}`)} disabled={!sel} style={{ ...S.cta, flex: 1, marginTop: 0, ...(!sel ? S.ctaOff : {}) }}>
          {!sel ? 'Pick one' : last ? 'Why these four ›' : 'Next anchor ›'}
        </button>
      </div>
    </div>
  )
}

const S = {
  lead: { fontSize: '14.5px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.55, margin: '0 0 1rem' },
  prompt: { fontSize: '18px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.4, margin: '0 0 0.5rem' },
  slotTitle: { fontSize: '12px', color: '#854F0B', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, margin: '0 0 0.5rem' },
  arcWrap: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #E8DFD0', borderRadius: '16px', padding: '1rem 1rem 1.5rem', marginBottom: '1.3rem', boxShadow: '0 2px 10px rgba(80,50,20,0.05)' },
  arcTrack: { position: 'relative', height: '6px', borderRadius: '3px', background: 'linear-gradient(90deg, #F2D9A8 0%, #FBF6EA 25%, #EFE7D7 50%, #E4DDEA 75%, #C9C2DA 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sun: { fontSize: '15px', marginLeft: '-4px', color: '#D9A441' },
  moon: { fontSize: '13px', marginRight: '-2px', color: '#8A86A8' },
  pegs: { position: 'relative', height: '46px' },
  peg: { position: 'absolute', top: 0, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '70px' },
  pegDot: { width: '20px', height: '20px', borderRadius: '50%', background: 'white', border: '1.5px solid #DDCFB6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#FAF7F1', marginTop: '-10px' },
  pegDotFilled: { background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)', border: '1.5px solid #A14222' },
  pegDotActive: { boxShadow: '0 0 0 4px rgba(197,87,44,0.18)', borderColor: '#C5572C' },
  pegLabel: { fontSize: '9.5px', color: '#7A6A52', fontFamily: 'Georgia, serif', textAlign: 'center', marginTop: '5px', lineHeight: 1.2 },
  optList: { display: 'flex', flexDirection: 'column', gap: '7px' },
  opt: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 13px', background: 'white', border: '0.5px solid #EBE3D5', borderRadius: '11px', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', transition: 'all 0.13s' },
  optOn: { background: 'linear-gradient(180deg, #FDFBF6 0%, #F7E2D5 100%)', border: '1px solid #C5572C' },
  radio: { width: '17px', height: '17px', borderRadius: '50%', border: '1.5px solid #DDCFB6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#C5572C', flexShrink: 0, background: 'white' },
  radioOn: { border: '1.5px solid #C5572C' },
  optText: { fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.4 },
  customInput: { flex: 1, border: 'none', background: 'transparent', fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', outline: 'none' },
  textarea: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '0.5px solid #DDCFB6', background: 'white', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.55, boxSizing: 'border-box', outline: 'none', resize: 'vertical' },
  cta: { width: '100%', padding: '16px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)' },
  ctaOff: { background: '#C9B894', boxShadow: 'none', cursor: 'not-allowed' },
  row2: { display: 'flex', gap: '10px', alignItems: 'center', marginTop: '1.1rem' },
  back: { padding: '16px 18px', background: 'transparent', color: '#854F0B', border: '0.5px solid #DDCFB6', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
}
