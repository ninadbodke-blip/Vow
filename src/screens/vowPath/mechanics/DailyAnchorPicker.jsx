import { useState } from 'react'

export default function DailyAnchorPicker({ data, onSave, saving }) {
  const {
    anchorSlots,
    morningOptions,
    eveningOptions,
    allowCustomPerSlot,
    customPrompt,
    whyTheseHeader,
    whyTheseSubtext,
  } = data

  // Phases: 'slot:0' -> 'slot:1' -> 'slot:2' -> 'slot:3' -> 'why' -> 'review'
  const [phase, setPhase] = useState('slot:0')

  // Per-slot selection: { slotId: 'anchorId' | 'custom:text' }
  const [selections, setSelections] = useState({})
  const [customInputs, setCustomInputs] = useState({})
  const [whyText, setWhyText] = useState('')

  const currentSlotIdx = phase.startsWith('slot:') ? parseInt(phase.split(':')[1], 10) : -1
  const slot = currentSlotIdx >= 0 ? anchorSlots[currentSlotIdx] : null

  const optionsForSlot = (slot) => {
    if (!slot) return []
    return slot.timeWindow === 'morning' ? morningOptions : eveningOptions
  }

  const selectAnchor = (slotId, anchorId) => {
    setSelections(prev => ({ ...prev, [slotId]: anchorId }))
  }

  const useCustomAnchor = (slotId) => {
    const text = (customInputs[slotId] || '').trim()
    if (!text) return
    setSelections(prev => ({ ...prev, [slotId]: `custom:${text}` }))
  }

  const advance = () => {
    if (currentSlotIdx < anchorSlots.length - 1) {
      setPhase(`slot:${currentSlotIdx + 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setPhase('why')
    }
  }

  const goBackPhase = () => {
    if (currentSlotIdx > 0) {
      setPhase(`slot:${currentSlotIdx - 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const labelForSelection = (slotId) => {
    const sel = selections[slotId]
    if (!sel) return null
    if (sel.startsWith('custom:')) {
      return sel.slice(7)
    }
    const slot = anchorSlots.find(s => s.id === slotId)
    const opts = optionsForSlot(slot)
    const opt = opts.find(o => o.id === sel)
    return opt?.label || sel
  }

  const finalize = () => {
    const anchors = anchorSlots.map(slot => {
      const sel = selections[slot.id]
      const isCustom = sel?.startsWith('custom:')
      return {
        slot_id: slot.id,
        slot_label: slot.label,
        time_window: slot.timeWindow,
        anchor_id: isCustom ? null : sel,
        anchor_label: labelForSelection(slot.id),
        is_custom: isCustom,
      }
    })

    onSave({
      anchors,
      why_text: whyText.trim() || null,
    })
  }

  // ===================================================================
  // PHASE: SLOT
  // ===================================================================
  if (slot) {
    const opts = optionsForSlot(slot)
    const currentSel = selections[slot.id]
    const isCustomSelected = currentSel?.startsWith('custom:')
    const customInput = customInputs[slot.id] || ''

    return (
      <div style={styles.container}>
        <p style={styles.progressLabel}>Anchor {currentSlotIdx + 1} of {anchorSlots.length}</p>
        <h2 style={styles.slotTitle}>{slot.label}</h2>
        <p style={styles.subtext}>Pick one. Under 5 minutes. Done every day.</p>

        <div style={styles.optionList}>
          {opts.map(opt => {
            const selected = currentSel === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => selectAnchor(slot.id, opt.id)}
                style={{
                  ...styles.optionCard,
                  ...(selected ? styles.optionCardSelected : {}),
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {allowCustomPerSlot && (
          <div style={styles.customSection}>
            <p style={styles.customLabel}>Your own</p>
            <div style={styles.customInputRow}>
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInputs(prev => ({ ...prev, [slot.id]: e.target.value }))}
                placeholder={customPrompt}
                style={styles.customInput}
                onKeyDown={(e) => { if (e.key === 'Enter') useCustomAnchor(slot.id) }}
              />
              <button onClick={() => useCustomAnchor(slot.id)} style={styles.customAddBtn}>Use</button>
            </div>
            {isCustomSelected && (
              <p style={styles.customSelectedNote}>
                Using: {currentSel.slice(7)}
              </p>
            )}
          </div>
        )}

        <div style={styles.footer}>
          {currentSlotIdx > 0 && (
            <button onClick={goBackPhase} style={styles.secondaryBtn}>‹ Back</button>
          )}
          <button
            onClick={advance}
            disabled={!currentSel}
            style={{
              ...styles.primaryBtnFlex,
              ...(!currentSel ? styles.primaryBtnDisabled : {}),
            }}
          >
            {currentSlotIdx === anchorSlots.length - 1 ? 'Continue' : 'Next anchor'}
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: WHY
  // ===================================================================
  if (phase === 'why') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{whyTheseHeader}</h2>
        <p style={styles.subtext}>{whyTheseSubtext}</p>

        <textarea
          value={whyText}
          onChange={(e) => setWhyText(e.target.value)}
          placeholder="One sentence, if you want."
          style={styles.textarea}
          rows={3}
          maxLength={240}
        />

        <div style={styles.footer}>
          <button onClick={() => setPhase(`slot:${anchorSlots.length - 1}`)} style={styles.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('review')} style={styles.primaryBtnFlex}>Continue</button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVIEW
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>Your daily anchors.</h2>

      <div style={styles.anchorsCard}>
        <p style={styles.anchorsLabel}>Morning</p>
        {anchorSlots.filter(s => s.timeWindow === 'morning').map(slot => (
          <div key={slot.id} style={styles.anchorRow}>
            <div style={styles.anchorDot}></div>
            <p style={styles.anchorText}>{labelForSelection(slot.id)}</p>
          </div>
        ))}

        <div style={styles.anchorsDivider}></div>

        <p style={styles.anchorsLabel}>Evening</p>
        {anchorSlots.filter(s => s.timeWindow === 'evening').map(slot => (
          <div key={slot.id} style={styles.anchorRow}>
            <div style={styles.anchorDot}></div>
            <p style={styles.anchorText}>{labelForSelection(slot.id)}</p>
          </div>
        ))}

        {whyText.trim() && (
          <>
            <div style={styles.anchorsDivider}></div>
            <p style={styles.anchorsLabel}>Why these</p>
            <p style={styles.anchorWhy}>{whyText}</p>
          </>
        )}
      </div>

      <p style={styles.note}>
        Four small things. Done every day. They hold the days together when nothing dramatic is happening.
      </p>

      <div style={styles.footer}>
        <button onClick={() => setPhase('why')} style={styles.secondaryBtn}>‹ Back</button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Save the anchors'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { paddingTop: '0.5rem' },
  prompt: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 0.5rem',
  },
  slotTitle: {
    fontSize: '22px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.5rem',
    lineHeight: 1.25,
  },
  subtext: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.55, margin: '0 0 1.25rem',
  },
  progressLabel: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    margin: '0 0 0.75rem',
  },
  optionList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  optionCard: {
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    fontSize: '13.5px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer', textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
    width: '100%',
  },
  optionCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  customSection: { marginTop: '1.25rem' },
  customLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.5rem',
  },
  customInputRow: { display: 'flex', gap: '8px' },
  customInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #C5AE8A',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    background: 'white',
  },
  customAddBtn: {
    padding: '0 16px',
    background: '#854F0B',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  customSelectedNote: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '8px 0 0',
  },
  textarea: {
    width: '100%',
    padding: '14px',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    background: '#FDFBF6',
    outline: 'none',
    boxSizing: 'border-box',
    lineHeight: 1.65,
    resize: 'vertical',
  },
  anchorsCard: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '1rem',
  },
  anchorsLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.6rem',
  },
  anchorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
  },
  anchorDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#854F0B',
    flexShrink: 0,
  },
  anchorText: {
    fontSize: '13.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0,
    lineHeight: 1.4,
  },
  anchorsDivider: {
    height: '0.5px',
    background: '#E0D5C2',
    margin: '1rem 0',
  },
  anchorWhy: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.55,
  },
  note: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1rem',
    textAlign: 'center',
  },
  footer: { marginTop: '1.5rem', display: 'flex', gap: '8px' },
  primaryBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnFlex: {
    flex: 1, padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  secondaryBtn: {
    padding: '14px 18px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}