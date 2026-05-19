export default function BuildDayTimelinePick({
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

  // Past days from allMarks, oldest first, excluding today
  const pastDays = Object.entries(allMarks)
    .filter(([date]) => date !== todayKey)
    .sort(([a], [b]) => a.localeCompare(b))

  const todayLabel = formatDate(todayKey)

  return (
    <div style={styles.container}>
      <p style={styles.todayLabel}>{todayLabel}</p>

      {/* Horizontal time strip */}
      <div style={styles.stripWrap}>
        <div style={styles.stripLine}></div>
        <div style={styles.stripPicks}>
          {options.map((opt) => {
            const isSelected = value === opt
            return (
              <button
                key={opt}
                onClick={() => handlePick(opt)}
                disabled={!isWritable}
                style={styles.stripPickBtn}
              >
                <div style={{
                  ...styles.stripTick,
                  ...(isSelected ? styles.stripTickSelected : {}),
                }}></div>
                <span style={{
                  ...styles.stripLabel,
                  ...(isSelected ? styles.stripLabelSelected : {}),
                }}>
                  {opt}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        disabled={!isWritable}
        style={styles.skipBtn}
      >
        {skipLabel}
      </button>

      {/* Past days' marks */}
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

// ---------- helpers ----------

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
    margin: '0 0 1.5rem',
  },
  stripWrap: {
    position: 'relative',
    padding: '0.5rem 0 1rem',
    marginBottom: '1rem',
  },
  stripLine: {
    position: 'absolute',
    top: '1rem',
    left: '8%',
    right: '8%',
    height: '0.5px',
    background: '#E0D5C2',
    zIndex: 0,
  },
  stripPicks: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  stripPickBtn: {
    background: 'transparent',
    border: 'none',
    padding: '0 2px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    fontFamily: 'inherit',
    minWidth: 0,
  },
  stripTick: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#FAF7F1',
    border: '1px solid #D4C8B0',
    transition: 'all 0.15s',
  },
  stripTickSelected: {
    background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)',
    border: '1px solid #A14222',
    width: '16px',
    height: '16px',
    boxShadow: '0 0 0 4px rgba(197,87,44,0.18)',
    transform: 'translateY(-2px)',
  },
  stripLabel: {
    fontSize: '10px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    marginTop: '8px',
    letterSpacing: '0.02em',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  stripLabelSelected: {
    color: '#854F0B',
    fontWeight: 500,
    fontStyle: 'normal',
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