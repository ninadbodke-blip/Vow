import { useState, useEffect } from 'react'

export default function TriggerChecklist({
  header,
  subtext,
  triggers,
  allowCustom,
  maxCustom = 3,
  minSelection = 1,
  existingData,
  onSave,
  saving,
}) {
  const [selectedIds, setSelectedIds] = useState([])
  const [customs, setCustoms] = useState([])

  useEffect(() => {
    if (existingData) {
      setSelectedIds(existingData.selected_triggers || [])
      setCustoms(existingData.custom_triggers || [])
    }
  }, [existingData])

  const toggleTrigger = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const addCustom = () => {
    if (customs.length >= maxCustom) return
    setCustoms([...customs, ''])
  }

  const updateCustom = (idx, val) => {
    const next = [...customs]
    next[idx] = val
    setCustoms(next)
  }

  const removeCustom = (idx) => {
    setCustoms(customs.filter((_, i) => i !== idx))
  }

  const validCustoms = customs.filter(c => c.trim().length > 0)
  const totalSelected = selectedIds.length + validCustoms.length
  const canSave = totalSelected >= minSelection

  const handleSave = () => {
    if (!canSave) return
    onSave({
      selected_triggers: selectedIds,
      custom_triggers: validCustoms.map(c => c.trim()),
    })
  }

  return (
    <div>
      <h2 style={styles.header}>{header}</h2>
      {subtext && <p style={styles.subtext}>{subtext}</p>}

      <div style={styles.list}>
        {triggers.map(trig => {
          const isSelected = selectedIds.includes(trig.id)
          return (
            <button
              key={trig.id}
              onClick={() => toggleTrigger(trig.id)}
              style={{
                ...styles.row,
                ...(isSelected ? styles.rowSelected : {}),
              }}
            >
              <span style={{ ...styles.checkbox, ...(isSelected ? styles.checkboxSelected : {}) }}>
                {isSelected ? '✓' : ''}
              </span>
              <span style={styles.rowLabel}>{trig.label}</span>
            </button>
          )
        })}
      </div>

      {allowCustom && (
        <div style={styles.customSection}>
          {customs.map((c, i) => (
            <div key={i} style={styles.customRow}>
              <input
                type="text"
                value={c}
                onChange={(e) => updateCustom(i, e.target.value)}
                placeholder="Add another trigger"
                maxLength={80}
                style={styles.customInput}
              />
              <button
                onClick={() => removeCustom(i)}
                style={styles.removeBtn}
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
          {customs.length < maxCustom && (
            <button onClick={addCustom} style={styles.addCustomBtn}>
              + Add another trigger
            </button>
          )}
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
  list: {
    display: 'flex', flexDirection: 'column',
    gap: '6px',
    marginBottom: '1rem',
  },
  row: {
    display: 'flex', alignItems: 'center',
    width: '100%',
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    fontFamily: 'inherit',
    fontSize: '14px',
    color: '#2A1F15',
    cursor: 'pointer',
    textAlign: 'left',
    gap: '12px',
    transition: 'all 0.15s',
    boxShadow: '0 2px 4px rgba(80,50,20,0.04)',
  },
  rowSelected: {
    background: '#FDFBF6',
    border: '1px solid #C5572C',
  },
  checkbox: {
    width: '20px', height: '20px',
    borderRadius: '6px',
    border: '1px solid #DDCFB6',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px',
    color: '#FAF7F1',
    flexShrink: 0,
    background: 'white',
  },
  checkboxSelected: {
    background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)',
    border: '1px solid #A14222',
  },
  rowLabel: {
    flex: 1,
    lineHeight: 1.4,
  },
  customSection: {
    display: 'flex', flexDirection: 'column',
    gap: '8px',
    marginBottom: '1.25rem',
    marginTop: '0.5rem',
  },
  customRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
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
  removeBtn: {
    width: '36px', height: '36px',
    background: 'transparent',
    border: '0.5px solid #DDCFB6',
    borderRadius: '8px',
    color: '#9C8C78',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'inherit',
  },
  addCustomBtn: {
    background: 'transparent',
    border: '0.5px dashed #DDCFB6',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '12px', fontWeight: 500,
    color: '#854F0B',
    fontFamily: 'inherit',
    cursor: 'pointer',
    width: '100%',
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