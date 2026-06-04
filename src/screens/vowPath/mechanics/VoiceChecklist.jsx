import { useState, useEffect } from 'react'

export default function VoiceChecklist({
  header,
  subtext,
  statements,
  allowCustom,
  maxCustom = 2,
  existingData,
  onSave,
  saving,
}) {
  const [selectedIds, setSelectedIds] = useState([])
  const [customs, setCustoms] = useState([])

  useEffect(() => {
    if (existingData) {
      setSelectedIds(existingData.selected_statements || [])
      setCustoms(existingData.custom_statements || [])
    }
  }, [existingData])

  const toggleStatement = (id) => {
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
  const canSave = totalSelected >= 1

  const handleSave = () => {
    if (!canSave) return
    onSave({
      selected_statements: selectedIds,
      custom_statements: validCustoms.map(c => c.trim()),
      total_count: totalSelected,
    })
  }

  return (
    <div>
      <h2 style={styles.header}>{header}</h2>
      {subtext && <p style={styles.subtext}>{subtext}</p>}

      <div style={styles.list}>
        {statements.map(stmt => {
          const isSelected = selectedIds.includes(stmt.id)
          return (
            <button
              key={stmt.id}
              onClick={() => toggleStatement(stmt.id)}
              style={{
                ...styles.row,
                ...(isSelected ? styles.rowSelected : {}),
              }}
            >
              <span style={{ ...styles.checkbox, ...(isSelected ? styles.checkboxSelected : {}) }}>
                {isSelected ? '✓' : ''}
              </span>
              <div style={styles.rowContent}>
                <p style={styles.statementText}>{stmt.text}</p>
                <p style={styles.patternLabel}>{stmt.pattern}</p>
              </div>
            </button>
          )
        })}
      </div>

      {allowCustom && (
        <div style={styles.customSection}>
          {customs.map((c, i) => (
            <div key={i} style={{ ...styles.row, ...styles.rowSelected, ...styles.customRowInline }}>
              <span style={{ ...styles.checkbox, ...styles.checkboxSelected }}>{'\u2713'}</span>
              <input
                type="text"
                value={c}
                onChange={(e) => updateCustom(i, e.target.value)}
                placeholder={`A statement you've heard yourself say...`}
                maxLength={120}
                autoFocus={c === ''}
                style={styles.customInlineInput}
              />
              <button
                onClick={() => removeCustom(i)}
                style={styles.removeBtnInline}
                aria-label="Remove"
              >
                {'\u00d7'}
              </button>
            </div>
          ))}
          {customs.length < maxCustom && (
            <button onClick={addCustom} style={styles.addCustomBtn}>
              + Add a statement of your own
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
        {totalSelected === 0 ? 'Tap at least one statement to continue.' : `${totalSelected} ${totalSelected === 1 ? 'statement' : 'statements'} tapped`}
        {existingData && ' · Editing previous response'}
      </p>
    </div>
  )
}

const styles = {
  header: {
    fontSize: '22px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 0.75rem',
  },
  subtext: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1.5rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '1.25rem',
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textAlign: 'left',
    gap: '12px',
    transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  rowSelected: {
    background: 'linear-gradient(180deg, #FDFBF6 0%, #F8F1E1 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 3px 10px rgba(197,87,44,0.10)',
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
    marginTop: '3px',
  },
  checkboxSelected: {
    background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)',
    border: '1px solid #A14222',
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
  },
  statementText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 4px',
    lineHeight: 1.45,
  },
  patternLabel: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    margin: 0,
    lineHeight: 1.4,
    textTransform: 'lowercase',
    letterSpacing: '0.04em',
  },
  customSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '1.25rem',
    marginTop: '0.5rem',
  },
  customRowInline: {
    cursor: 'default',
    padding: '12px 14px',
    alignItems: 'center',
  },
  customInlineInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: '4px 0',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.45,
    minWidth: 0,
  },
  removeBtnInline: {
    background: 'transparent',
    border: 'none',
    color: '#854F0B',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
    flexShrink: 0,
    opacity: 0.6,
  },
  addCustomBtn: {
    background: 'transparent',
    border: '0.5px dashed #DDCFB6',
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '13px', fontWeight: 500,
    color: '#854F0B',
    fontFamily: 'inherit',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    display: 'flex', alignItems: 'center', gap: '12px',
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
    fontSize: '11px',
    color: '#9C8C78',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    margin: '0.75rem 0 0',
    textAlign: 'center',
  },
}