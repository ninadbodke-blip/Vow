export default function BuildDailySingleSelect({
  value,
  onChange,
  isWritable = true,
  options = [],
  skipLabel = 'Skip today',
  allMarks = {},
  todayKey,
}) {
  const handlePick = (opt) => {
    if (!isWritable) return
    onChange(opt)
  }

  const handleSkip = () => {
    if (!isWritable) return
    onChange(null)
  }

  const pastDays = Object.entries(allMarks)
    .filter(([date]) => date !== todayKey)
    .sort(([a], [b]) => a.localeCompare(b))

  const todayLabel = formatDate(todayKey)

  return (
    <div style={styles.container}>
      <p style={styles.todayLabel}>{todayLabel}</p>

      <div style={styles.chipWrap}>
        {options.map((opt) => {
          const isSelected = value === opt
          return (
            <button
              key={opt}
              onClick={() => handlePick(opt)}
              disabled={!isWritable}
              style={{
                ...styles.chip,
                ...(isSelected ? styles.chipSelected : {}),
                ...(!isWritable ? styles.chipDisabled : {}),
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>

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
                  {mark === null ? '— skipped' : mark}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(key) {
  if (!key) return ''
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
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
  todayLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    textAlign: 'center',
    margin: '0 0 1.25rem',
  },
  chipWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  chip: {
    padding: '10px 14px',
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
  chipDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
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