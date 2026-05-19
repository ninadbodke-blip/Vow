export default function BuildSingleSelectFreeText({
  value,
  onChange,
  isWritable = true,
  options = [],
  otherTrigger = 'Something else',
  otherPlaceholder = 'Your answer...',
}) {
  const isOtherSelected =
    typeof value === 'object' && value !== null && 'other' in value
  const otherText = isOtherSelected ? value.other : ''
  const pickedOption = (() => {
    if (typeof value === 'string') return value
    if (isOtherSelected) return otherTrigger
    return null
  })()

  const handlePick = (opt) => {
    if (!isWritable) return
    if (opt === otherTrigger) {
      if (isOtherSelected) {
        onChange(null)
      } else {
        onChange({ other: '' })
      }
    } else {
      if (pickedOption === opt) {
        onChange(null)
      } else {
        onChange(opt)
      }
    }
  }

  const handleOtherTextChange = (e) => {
    if (!isWritable) return
    onChange({ other: e.target.value })
  }

  return (
    <div style={styles.container}>
      {options.map((opt) => {
        const isSelected = pickedOption === opt
        return (
          <button
            key={opt}
            onClick={() => handlePick(opt)}
            disabled={!isWritable}
            style={{
              ...styles.row,
              ...(isSelected ? styles.rowSelected : {}),
              ...(!isWritable ? styles.rowDisabled : {}),
            }}
          >
            <span style={{
              ...styles.rowText,
              ...(isSelected ? styles.rowTextSelected : {}),
            }}>
              {opt}
            </span>
            {isSelected && <span style={styles.checkmark}>✓</span>}
          </button>
        )
      })}

      {isOtherSelected && (
        <input
          type="text"
          value={otherText}
          onChange={handleOtherTextChange}
          placeholder={otherPlaceholder}
          disabled={!isWritable}
          style={styles.otherInput}
          autoFocus
        />
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 14px',
    background: '#FAF7F1',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'all 0.15s',
    boxShadow: '0 1px 3px rgba(80,50,20,0.04)',
  },
  rowSelected: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    border: '0.5px solid #2A1F15',
    boxShadow: '0 3px 10px rgba(40,25,10,0.20)',
  },
  rowDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  rowText: {
    fontSize: '13.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.4,
    flex: 1,
  },
  rowTextSelected: {
    color: '#FAF7F1',
    fontStyle: 'normal',
    fontWeight: 500,
  },
  checkmark: {
    fontSize: '14px',
    color: '#D9B57A',
    fontWeight: 600,
    marginLeft: '12px',
    flexShrink: 0,
  },
  otherInput: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    color: '#2A1F15',
    background: '#FDFBF6',
    border: '0.5px solid #C5572C',
    borderRadius: '12px',
    outline: 'none',
    boxShadow: 'inset 0 1px 3px rgba(80,50,20,0.05), 0 0 0 3px rgba(197,87,44,0.10)',
    boxSizing: 'border-box',
    marginTop: '4px',
  },
}