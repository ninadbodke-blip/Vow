export default function BuildTextureMultiPick({
  value = [],
  onChange,
  isWritable = true,
  options = [],
  exactCount = 3,
  ghosts = [],
}) {
  const selected = Array.isArray(value) ? value : []
  const isFull = selected.length >= exactCount

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

  const formatTexture = (t) => t.charAt(0).toUpperCase() + t.slice(1)

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
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
              {formatTexture(opt)}
            </button>
          )
        })}
      </div>

      <p style={styles.counter}>
        {selected.length} / {exactCount} picked
      </p>

      {ghosts.length > 0 && (
        <div style={styles.ghostBlock}>
          <div style={styles.ghostDivider}></div>
          {ghosts.map((ghost) => (
            <p key={`ghost-${ghost.day}`} style={styles.ghostLine}>
              <span style={styles.ghostLabel}>Week {ghost.day}</span>
              <span style={styles.ghostSep}> — </span>
              <span style={styles.ghostText}>
                {ghost.textures.map(formatTexture).join(' · ')}
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { width: '100%' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '0.85rem',
  },
  chip: {
    padding: '10px 8px',
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
  ghostBlock: {
    marginTop: '0.85rem',
  },
  ghostDivider: {
    height: '0.5px',
    background: '#EFE7D7',
    width: '40%',
    margin: '0 auto 0.75rem',
  },
  ghostLine: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0 0 0.25rem',
    lineHeight: 1.5,
  },
  ghostLabel: {
    color: '#854F0B',
    fontStyle: 'normal',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
  },
  ghostSep: {
    color: '#C9BBA6',
  },
  ghostText: {
    color: '#7A6B58',
  },
}