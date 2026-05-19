export default function BuildBinaryRowPicks({
  value,
  onChange,
  isWritable = true,
  rows = [],
  skipLabel = "Can't read it today",
  allMarks = {},
  todayKey,
}) {
  const currentValues = value || {}

  const updateRow = (rowKey, val) => {
    if (!isWritable) return
    const current = currentValues[rowKey]
    if (current === val) {
      // deselect
      const next = { ...currentValues }
      delete next[rowKey]
      onChange(Object.keys(next).length === 0 ? null : next)
    } else {
      onChange({ ...currentValues, [rowKey]: val })
    }
  }

  const handleSkip = () => {
    if (!isWritable) return
    onChange(null)
  }

  const pastDays = Object.entries(allMarks)
    .filter(([date]) => date !== todayKey)
    .sort(([a], [b]) => a.localeCompare(b))

  return (
    <div style={styles.container}>

      {rows.map((row) => {
        const currentPick = currentValues[row.key]
        return (
          <div key={row.key} style={styles.rowBlock}>
            <p style={styles.rowLabel}>{row.label}</p>
            <div style={styles.binaryButtons}>
              {row.options.map((opt) => {
                const isSelected = currentPick === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateRow(row.key, opt.value)}
                    disabled={!isWritable}
                    style={{
                      ...styles.binaryBtn,
                      ...(isSelected ? styles.binaryBtnSelected : {}),
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

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
                  {formatMark(mark, rows)}
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

function formatMark(mark, rows) {
  if (!mark) return '— skipped'
  if (typeof mark !== 'object') return '— skipped'
  const parts = rows
    .map(row => {
      const v = mark[row.key]
      if (!v) return null
      return v.charAt(0).toUpperCase() + v.slice(1)
    })
    .filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : '— partial'
}

const styles = {
  container: { width: '100%' },
  rowBlock: {
    marginBottom: '1rem',
  },
  rowLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    margin: '0 0 0.5rem',
  },
  binaryButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  binaryBtn: {
    padding: '12px 10px',
    background: '#FAF7F1',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    fontSize: '13.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(80,50,20,0.04)',
  },
  binaryBtnSelected: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: '0.5px solid #2A1F15',
    boxShadow: '0 3px 8px rgba(40,25,10,0.20)',
    fontStyle: 'normal',
    fontWeight: 500,
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
    gap: '8px',
  },
  historyDate: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    flexShrink: 0,
  },
  historyValue: {
    fontSize: '12px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'right',
  },
}