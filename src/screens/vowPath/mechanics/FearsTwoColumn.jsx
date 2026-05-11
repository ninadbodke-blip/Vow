import { useState, useEffect } from 'react'

export default function FearsTwoColumn({
  leftColumn,
  rightColumn,
  allowCustom,
  maxCustomPerSide = 2,
  existingData,
  onSave,
  saving,
}) {
  const [leftSelected, setLeftSelected] = useState([])
  const [rightSelected, setRightSelected] = useState([])
  const [leftCustoms, setLeftCustoms] = useState([])
  const [rightCustoms, setRightCustoms] = useState([])
  const [activeSide, setActiveSide] = useState('left')

  useEffect(() => {
    if (existingData) {
      setLeftSelected(existingData.left_selected || [])
      setRightSelected(existingData.right_selected || [])
      setLeftCustoms(existingData.left_customs || [])
      setRightCustoms(existingData.right_customs || [])
    }
  }, [existingData])

  const toggleLeft = (id) => {
    setLeftSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const toggleRight = (id) => {
    setRightSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const addCustom = (side) => {
    if (side === 'left' && leftCustoms.length < maxCustomPerSide) {
      setLeftCustoms([...leftCustoms, ''])
    } else if (side === 'right' && rightCustoms.length < maxCustomPerSide) {
      setRightCustoms([...rightCustoms, ''])
    }
  }

  const updateCustom = (side, idx, val) => {
    if (side === 'left') {
      const next = [...leftCustoms]; next[idx] = val
      setLeftCustoms(next)
    } else {
      const next = [...rightCustoms]; next[idx] = val
      setRightCustoms(next)
    }
  }

  const removeCustom = (side, idx) => {
    if (side === 'left') {
      setLeftCustoms(leftCustoms.filter((_, i) => i !== idx))
    } else {
      setRightCustoms(rightCustoms.filter((_, i) => i !== idx))
    }
  }

  const leftCustomsValid = leftCustoms.filter(c => c.trim().length > 0)
  const rightCustomsValid = rightCustoms.filter(c => c.trim().length > 0)
  const totalSelected = leftSelected.length + rightSelected.length + leftCustomsValid.length + rightCustomsValid.length
  const canSave = totalSelected >= 1

  const handleSave = () => {
    if (!canSave) return
    onSave({
      left_selected: leftSelected,
      right_selected: rightSelected,
      left_customs: leftCustomsValid.map(c => c.trim()),
      right_customs: rightCustomsValid.map(c => c.trim()),
      total_count: totalSelected,
    })
  }

  const renderSide = (side) => {
    const col = side === 'left' ? leftColumn : rightColumn
    const selected = side === 'left' ? leftSelected : rightSelected
    const customs = side === 'left' ? leftCustoms : rightCustoms
    const toggle = side === 'left' ? toggleLeft : toggleRight
    const sideColor = side === 'left' ? '#C5572C' : '#7A8C5A'

    return (
      <div style={styles.column}>
        <div style={{ ...styles.columnHeader, borderLeftColor: sideColor }}>
          <p style={styles.columnTitle}>{col.title}</p>
          <p style={styles.columnSubtitle}>{col.subtitle}</p>
        </div>

        <div style={styles.fearList}>
          {col.fears.map(fear => {
            const isSelected = selected.includes(fear.id)
            return (
              <button
                key={fear.id}
                onClick={() => toggle(fear.id)}
                style={{
                  ...styles.fearBtn,
                  ...(isSelected ? styles.fearBtnSelected : {}),
                }}
              >
                <span style={{ ...styles.checkbox, ...(isSelected ? styles.checkboxSelected : {}) }}>
                  {isSelected ? '✓' : ''}
                </span>
                <p style={styles.fearText}>{fear.label}</p>
              </button>
            )
          })}
        </div>

        {allowCustom && (
          <div style={styles.customsBlock}>
            {customs.map((c, i) => (
              <div key={i} style={styles.customRow}>
                <input
                  type="text"
                  value={c}
                  onChange={(e) => updateCustom(side, i, e.target.value)}
                  placeholder="A fear of your own"
                  maxLength={100}
                  style={styles.customInput}
                />
                <button
                  onClick={() => removeCustom(side, i)}
                  style={styles.removeBtn}
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
            {customs.length < maxCustomPerSide && (
              <button onClick={() => addCustom(side)} style={styles.addCustomBtn}>
                + Add your own
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveSide('left')}
          style={{
            ...styles.tab,
            ...(activeSide === 'left' ? styles.tabActive : {}),
            ...(activeSide === 'left' ? { borderLeftColor: '#C5572C' } : {}),
          }}
        >
          <span style={styles.tabLabel}>{leftColumn.title}</span>
          {leftSelected.length + leftCustomsValid.length > 0 && (
            <span style={styles.tabCount}>{leftSelected.length + leftCustomsValid.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveSide('right')}
          style={{
            ...styles.tab,
            ...(activeSide === 'right' ? styles.tabActive : {}),
            ...(activeSide === 'right' ? { borderLeftColor: '#7A8C5A' } : {}),
          }}
        >
          <span style={styles.tabLabel}>{rightColumn.title}</span>
          {rightSelected.length + rightCustomsValid.length > 0 && (
            <span style={styles.tabCount}>{rightSelected.length + rightCustomsValid.length}</span>
          )}
        </button>
      </div>

      {activeSide === 'left' && renderSide('left')}
      {activeSide === 'right' && renderSide('right')}

      <button
        onClick={handleSave}
        disabled={!canSave || saving}
        style={{
          ...styles.saveBtn,
          ...(!canSave || saving ? styles.saveBtnDisabled : {}),
          marginTop: '1.25rem',
        }}
      >
        {saving ? 'Saving...' : 'Save & continue'}
      </button>

      <p style={styles.countNote}>
        {totalSelected === 0 ? 'Tap at least one fear from either side.' : `${totalSelected} ${totalSelected === 1 ? 'fear' : 'fears'} named`}
      </p>
    </div>
  )
}

const styles = {
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '1.25rem',
  },
  tab: {
    flex: 1,
    padding: '12px 8px',
    background: '#FDFBF6',
    border: '0.5px solid #DDCFB6',
    borderLeft: '3px solid transparent',
    borderRadius: '12px',
    fontSize: '13px',
    fontFamily: 'inherit',
    color: '#6B5C4A',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: 'white',
    color: '#2A1F15',
    boxShadow: '0 4px 12px rgba(80,50,20,0.08)',
  },
  tabLabel: {
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
  },
  tabCount: {
    fontSize: '10px',
    color: '#854F0B',
    fontVariantNumeric: 'tabular-nums',
    fontStyle: 'italic',
  },
  column: {
    // Wrapper
  },
  columnHeader: {
    padding: '0 0 0.85rem 12px',
    borderLeft: '3px solid #C5572C',
    marginBottom: '1rem',
  },
  columnTitle: {
    fontSize: '17px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 2px',
  },
  columnSubtitle: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  fearList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '0.75rem',
  },
  fearBtn: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textAlign: 'left',
    gap: '10px',
    transition: 'all 0.15s',
    boxShadow: '0 2px 4px rgba(80,50,20,0.04)',
  },
  fearBtnSelected: {
    background: 'linear-gradient(180deg, #FDFBF6 0%, #F8F1E1 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 3px 10px rgba(197,87,44,0.08)',
  },
  checkbox: {
    width: '18px', height: '18px',
    borderRadius: '5px',
    border: '1px solid #DDCFB6',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px',
    color: '#FAF7F1',
    flexShrink: 0,
    background: 'white',
    marginTop: '2px',
  },
  checkboxSelected: {
    background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)',
    border: '1px solid #A14222',
  },
  fearText: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0,
    lineHeight: 1.5,
    flex: 1,
  },
  customsBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '0.5rem',
  },
  customRow: {
    display: 'flex',
    gap: '8px',
  },
  customInput: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '10px',
    border: '0.5px solid #DDCFB6',
    background: 'white',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    boxSizing: 'border-box',
    outline: 'none',
  },
  removeBtn: {
    width: '32px', height: '32px',
    background: 'transparent',
    border: '0.5px solid #DDCFB6',
    borderRadius: '8px',
    color: '#9C8C78',
    cursor: 'pointer',
    fontSize: '11px',
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
    fontSize: '11px',
    color: '#9C8C78',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    margin: '0.75rem 0 0',
    textAlign: 'center',
  },
}