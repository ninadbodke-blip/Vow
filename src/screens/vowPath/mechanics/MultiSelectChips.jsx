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
  const [customText, setCustomText] = useState('')
  const [customMode, setCustomMode] = useState(false)

  // Hydrate from existing data
  useEffect(() => {
    if (existingData) {
      setSelectedIds(existingData.selected_chips || [])
      if (existingData.custom_addition) {
        setCustomText(existingData.custom_addition)
        setCustomMode(true)
      }
    }
  }, [existingData])

  const toggleChip = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const totalSelected = selectedIds.length + (customMode && customText.trim() ? 1 : 0)
  const canSave = totalSelected >= minSelection

  const handleSave = () => {
    if (!canSave) return
    onSave({
      selected_chips: selectedIds,
      custom_addition: customMode && customText.trim() ? customText.trim() : null,
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
      </div>

      {allowCustom && (
        <>
          <button
            onClick={() => setCustomMode(!customMode)}
            style={{
              ...styles.customToggle,
              ...(customMode ? styles.customToggleActive : {}),
            }}
          >
            {customMode ? '✕ Cancel custom' : '+ Add your own'}
          </button>

          {customMode && (
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="What is it?"
              maxLength={80}
              style={styles.customInput}
              autoFocus
            />
          )}
        </>
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
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '0.5px solid #DDCFB6',
    background: 'white',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
    marginBottom: '1rem',
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