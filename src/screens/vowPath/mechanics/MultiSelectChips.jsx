import { useState, useEffect } from 'react'

export default function MultiSelectChips({
  header,
  subtext,
  chips,
  allowCustom,
  minSelection = 1,
  existingData,
  onSave,
  saving,
}) {
  const [selectedIds, setSelectedIds] = useState([])
  const [customLines, setCustomLines] = useState([])
  const [customInput, setCustomInput] = useState('')

  // Hydrate from existing data (supports the new array and the legacy single field)
  useEffect(() => {
    if (existingData) {
      setSelectedIds(existingData.selected_chips || [])
      if (Array.isArray(existingData.custom_additions)) {
        setCustomLines(existingData.custom_additions)
      } else if (existingData.custom_addition) {
        setCustomLines([existingData.custom_addition])
      }
    }
  }, [existingData])

  const toggleChip = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const addCustomLine = () => {
    const trimmed = customInput.trim()
    if (trimmed.length > 0 && customLines.length < 5) {
      setCustomLines([...customLines, trimmed])
      setCustomInput('')
    }
  }

  const removeCustomLine = (idx) => {
    setCustomLines(customLines.filter((_, i) => i !== idx))
  }

  const totalSelected = selectedIds.length + customLines.length
  const canSave = totalSelected >= minSelection
  const canAddCustom = customInput.trim().length > 0 && customLines.length < 5

  const handleSave = () => {
    if (!canSave) return
    onSave({
      selected_chips: selectedIds,
      custom_additions: customLines,
      custom_addition: customLines[0] || null,
    })
  }

  return (
    <div>
      <h2 style={styles.header}>{header}</h2>
      {subtext && <p style={styles.subtext}>{subtext}</p>}

      <div style={styles.chipGrid}>
        {chips.map(chip => {
          const isSelected = selectedIds.includes(chip.id)
          return (
            <button
              key={chip.id}
              onClick={() => toggleChip(chip.id)}
              style={{
                ...styles.chip,
                ...(isSelected ? styles.chipSelected : {}),
              }}
            >
              {chip.label}
            </button>
          )
        })}
        {customLines.map((line, idx) => (
          <div
            key={`custom_${idx}`}
            style={{ ...styles.chip, ...styles.chipSelected, ...styles.chipCustom }}
          >
            <span>{line}</span>
            <button
              onClick={() => removeCustomLine(idx)}
              style={styles.removeBtn}
              aria-label="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {allowCustom && customLines.length < 5 && (
        <div style={styles.customInputRow}>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Add your own..."
            maxLength={80}
            style={styles.customInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canAddCustom) addCustomLine()
            }}
          />
          <button
            onClick={addCustomLine}
            disabled={!canAddCustom}
            style={{
              ...styles.customAddBtn,
              ...(canAddCustom ? {} : styles.customAddBtnDisabled),
            }}
          >
            + Add
          </button>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!canSave || saving}
        style={{
          ...styles.saveBtn,
          ...(!canSave || saving ? styles.saveBtnDisabled : {}),
        }}
      >
        {saving ? 'Saving...' : 'Save & continue'}
      </button>

      <p style={styles.countNote}>
        {totalSelected} selected
        {existingData && ' · Editing previous response'}
      </p>
    </div>
  )
}

const styles = {
  header: {
    fontSize: '22px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 0.75rem',
  },
  subtext: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1.25rem',
  },
  chipGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '1rem',
  },
  chip: {
    background: 'white',
    border: '0.5px solid #DDCFB6',
    borderRadius: '999px',
    padding: '10px 16px',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.15s',
    boxShadow: '0 2px 4px rgba(80,50,20,0.04)',
  },
  chipSelected: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 4px 12px rgba(197,87,44,0.15)',
  },
  customToggle: {
    background: 'transparent',
    border: '0.5px dashed #DDCFB6',
    borderRadius: '999px',
    padding: '10px 16px',
    fontSize: '12px', fontWeight: 500,
    color: '#854F0B',
    fontFamily: 'inherit',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.15s',
    marginBottom: '0.75rem',
  },
  customToggleActive: {
    color: '#9C8C78',
  },
  customInput: {
    flex: 1,
    padding: '12px 14px',
    borderRadius: '12px',
    border: '0.5px solid #DDCFB6',
    background: 'white',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
  },
  customSection: {
    display: 'flex', flexWrap: 'wrap', gap: '8px',
    marginBottom: '1rem', alignItems: 'center',
  },
  chipCustom: {
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  removeBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '18px',
    cursor: 'pointer', padding: 0, lineHeight: 1,
  },
  customInputRow: {
    display: 'flex', gap: '8px', width: '100%',
    marginBottom: '1.25rem',
  },
  customAddBtn: {
    padding: '12px 18px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '12px',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(40,25,10,0.20)',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  customAddBtnDisabled: {
    background: '#C9B894',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  saveBtn: {
    width: '100%', padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  saveBtnDisabled: {
    background: '#C9B894',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  countNote: {
    fontSize: '11px', color: '#9C8C78',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    margin: '0.75rem 0 0',
    textAlign: 'center',
  },
}