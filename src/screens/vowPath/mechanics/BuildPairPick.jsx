export default function BuildPairPick({
  value,
  onChange,
  isWritable = true,
  columnA = {},
  columnB = {},
  skipLabel = 'Skip today',
  allMarks = {},
  todayKey,
}) {
  const what = value?.what || null
  const effect = value?.effect || null

  const pickA = (opt) => {
    if (!isWritable) return
    if (what === opt) {
      onChange(null)
    } else {
      onChange({ what: opt, effect: null })
    }
  }

  const pickB = (opt) => {
    if (!isWritable) return
    if (effect === opt) {
      onChange({ what, effect: null })
    } else {
      onChange({ what, effect: opt })
    }
  }

  const handleSkip = () => {
    if (!isWritable) return
    onChange(null)
  }

  // Past days history
  const pastDays = Object.entries(allMarks)
    .filter(([date]) => date !== todayKey)
    .sort(([a], [b]) => a.localeCompare(b))

  return (
    <div style={styles.container}>
      {/* Column A */}
      <div style={styles.section}>
        {columnA.title && (
          <p style={styles.sectionLabel}>{columnA.title}</p>
        )}
        <div style={styles.gridA}>
          {(columnA.options || []).map((opt) => (
            <button
              key={opt}
              onClick={() => pickA(opt)}
              disabled={!isWritable}
              style={{
                ...styles.chip,
                ...(what === opt ? styles.chipSelected : {}),
                ...(!isWritable ? styles.chipDisabled : {}),
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Column B — only revealed after Column A is picked */}
      {what && (
        <div style={styles.section}>
          {columnB.title && (
            <p style={styles.sectionLabel}>{columnB.title}</p>
          )}
          <div style={styles.gridB}>
            {(columnB.options || []).map((opt) => (
              <button
                key={opt}
                onClick={() => pickB(opt)}
                disabled={!isWritable}
                style={{
                  ...styles.chip,
                  ...(effect === opt ? styles.chipSelected : {}),
                  ...(!isWritable ? styles.chipDisabled : {}),
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Skip */}
      <button
        onClick={handleSkip}
        disabled={!isWritable}
        style={styles.skipBtn}
      >
        {skipLabel}
      </button>

      {/* Past days history */}
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
                    : (mark?.what
                        ? `${mark.what}${mark.effect ? ` — ${mark.effect}` : ''}`
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
  gridA: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  gridB: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  chip: {
    padding: '10px 8px',
    background: '#FAF7F1',
    border: '0.5px solid #E0D5C2',
    borderRadius: '999px',
    fontSize: '12.5px',
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