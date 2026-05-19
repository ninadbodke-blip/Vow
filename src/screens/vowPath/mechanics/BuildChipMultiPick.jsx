export default function BuildChipMultiPick({
  value = [],
  onChange,
  isWritable = true,
  options = [],
  min = 1,
  max = 1,
  columns = 2,
}) {
  const selected = Array.isArray(value) ? value : []
  const isFull = selected.length >= max

  const toggle = (opt) => {
    if (!isWritable) return
    const isCurrentlySelected = selected.includes(opt)
    if (isCurrentlySelected) {
      onChange(selected.filter(s => s !== opt))
    } else {
      if (isFull) return
      onChange([...selected, opt])
    }
  }

  const counterText = (() => {
    if (selected.length === 0) {
      return min === max ? `Pick ${min}` : `Pick ${min}–${max}`
    }
    return `${selected.length} / ${max} picked`
  })()

  return (
    <div style={styles.container}>
      <div style={{
        ...styles.grid,
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt)
          const dimmed = isFull && !isSelected
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              disabled={!isWritable}
              style={{
                ...styles.chip,
                ...(isSelected ? styles.chipSelected : {}),
                ...(dimmed ? styles.chipDimmed : {}),
                ...(!isWritable ? styles.chipDisabled : {}),
              }}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          )
        })}
      </div>
      <p style={styles.counter}>{counterText}</p>
    </div>
  )
}

const styles = {
  container: { width: '100%' },
  grid: {
    display: 'grid',
    gap: '8px',
    marginBottom: '0.85rem',
  },
  chip: {
    padding: '10px 12px',
    background: '#FAF7F1',
    border: '0.5px solid #E0D5C2',
    borderRadius: '999px',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(80,50,20,0.04)',
    lineHeight: 1.3,
  },
  chipSelected: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: '0.5px solid #2A1F15',
    boxShadow: '0 3px 8px rgba(40,25,10,0.20)',
    fontStyle: 'normal',
  },
  chipDimmed: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  chipDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  counter: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: 0,
    letterSpacing: '0.04em',
  },
}