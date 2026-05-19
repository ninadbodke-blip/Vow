export default function BuildTwoStepBranching({
  value,
  onChange,
  isWritable = true,
  step1 = {},
  step2By = {},
  skipLabel = 'Skip today',
  allMarks = {},
  todayKey,
}) {
  const direction = value?.direction || null
  const category = value?.category || null

  const pickDirection = (opt) => {
    if (!isWritable) return
    if (direction === opt) {
      onChange(null)
    } else {
      onChange({ direction: opt, category: null })
    }
  }

  const pickCategory = (opt) => {
    if (!isWritable) return
    if (category === opt) {
      onChange({ direction, category: null })
    } else {
      onChange({ direction, category: opt })
    }
  }

  const handleSkip = () => {
    if (!isWritable) return
    onChange(null)
  }

  const currentStep2 = direction ? step2By[direction] : null

  const pastDays = Object.entries(allMarks)
    .filter(([date]) => date !== todayKey)
    .sort(([a], [b]) => a.localeCompare(b))

  return (
    <div style={styles.container}>

      {/* Step 1 — Direction */}
      <div style={styles.section}>
        {step1.title && (
          <p style={styles.sectionLabel}>{step1.title}</p>
        )}
        <div style={styles.directionRow}>
          {(step1.options || []).map((opt) => {
            const isSelected = direction === opt
            return (
              <button
                key={opt}
                onClick={() => pickDirection(opt)}
                disabled={!isWritable}
                style={{
                  ...styles.directionChip,
                  ...(isSelected ? styles.directionChipSelected : {}),
                }}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 2 — Category for chosen direction */}
      {currentStep2 && (
        <div style={styles.section}>
          {currentStep2.title && (
            <p style={styles.sectionLabel}>{currentStep2.title}</p>
          )}
          <div style={styles.categoryList}>
            {(currentStep2.options || []).map((opt) => {
              const isSelected = category === opt
              return (
                <button
                  key={opt}
                  onClick={() => pickCategory(opt)}
                  disabled={!isWritable}
                  style={{
                    ...styles.categoryRow,
                    ...(isSelected ? styles.categoryRowSelected : {}),
                  }}
                >
                  <span style={{
                    ...styles.categoryText,
                    ...(isSelected ? styles.categoryTextSelected : {}),
                  }}>
                    {opt}
                  </span>
                  {isSelected && <span style={styles.checkmark}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <button
        onClick={handleSkip}
        disabled={!isWritable}
        style={styles.skipBtn}
      >
        {skipLabel}
      </button>

      {pastDays.length > 0 && (
        <div style={styles.historyBlock}>
          <p style={styles.historyLabel}>This week's marks</p>
          <div style={styles.historyList}>
            {pastDays.map(([date, mark]) => (
              <div key={date} style={styles.historyRow}>
                <span style={styles.historyDate}>{formatDateShort(date)}</span>
                <span style={styles.historyValue}>
                  {mark === null
                    ? '— skipped'
                    : (mark?.direction
                        ? `${mark.direction}${mark.category ? ` — ${mark.category}` : ''}`
                        : '— skipped')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

function formatDateShort(key) {
  if (!key) return ''
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const styles = {
  container: { width: '100%' },
  section: {
    marginBottom: '1.25rem',
  },
  sectionLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    margin: '0 0 0.75rem',
  },
  directionRow: {
    display: 'flex',
    gap: '8px',
    flexDirection: 'column',
  },
  directionChip: {
    padding: '12px 14px',
    background: '#FAF7F1',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    fontSize: '13.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
    boxShadow: '0 1px 3px rgba(80,50,20,0.04)',
  },
  directionChipSelected: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: '0.5px solid #2A1F15',
    boxShadow: '0 3px 8px rgba(40,25,10,0.20)',
    fontStyle: 'normal',
    fontWeight: 500,
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  categoryRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px 14px',
    background: '#FAF7F1',
    border: '0.5px solid #E0D5C2',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  categoryRowSelected: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    border: '0.5px solid #2A1F15',
  },
  categoryText: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    flex: 1,
  },
  categoryTextSelected: {
    color: '#FAF7F1',
    fontStyle: 'normal',
  },
  checkmark: {
    fontSize: '13px',
    color: '#D9B57A',
    fontWeight: 600,
    marginLeft: '10px',
    flexShrink: 0,
  },
  skipBtn: {
    width: '100%',
    padding: '10px',
    background: '#FAF7F1',
    border: '0.5px dashed #D4C8B0',
    borderRadius: '10px',
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginTop: '0.5rem',
  },
  historyBlock: {
    marginTop: '1.5rem',
    paddingTop: '1.25rem',
    borderTop: '0.5px solid #EFE7D7',
  },
  historyLabel: {
    fontSize: '10px',
    color: '#9C8C78',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    margin: '0 0 0.75rem',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  historyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '6px 10px',
    background: '#FAF7F1',
    borderRadius: '8px',
    border: '0.5px solid #EFE7D7',
  },
  historyDate: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  historyValue: {
    fontSize: '12px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
}