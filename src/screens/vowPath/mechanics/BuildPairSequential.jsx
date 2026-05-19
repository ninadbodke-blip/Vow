export default function BuildPairSequential({
  value,
  onChange,
  isWritable = true,
  step1 = {},
  step2 = {},
}) {
  const v1 = value?.step1 || null
  const v2 = value?.step2 || null

  const pick1 = (opt) => {
    if (!isWritable) return
    if (v1 === opt) {
      onChange(null)
    } else {
      // If step 2 was already picked and now we change step 1,
      // clear step 2 if it would conflict (excludePicked case)
      const shouldClearStep2 = step2.excludePicked && v2 === opt
      onChange({ step1: opt, step2: shouldClearStep2 ? null : v2 })
    }
  }

  const pick2 = (opt) => {
    if (!isWritable) return
    if (v2 === opt) {
      onChange({ step1: v1, step2: null })
    } else {
      onChange({ step1: v1, step2: opt })
    }
  }

  // For step 2, compute options (potentially excluding step 1 pick)
  const step2Options = (() => {
    const base = step2.options || []
    if (step2.excludePicked && v1) {
      return base.filter(o => o !== v1)
    }
    return base
  })()

  return (
    <div style={styles.container}>

      {/* Step 1 */}
      <div style={styles.section}>
        {step1.title && (
          <p style={styles.sectionLabel}>{step1.title}</p>
        )}
        <div style={styles.rowList}>
          {(step1.options || []).map((opt) => {
            const isSelected = v1 === opt
            return (
              <button
                key={opt}
                onClick={() => pick1(opt)}
                disabled={!isWritable}
                style={{
                  ...styles.row,
                  ...(isSelected ? styles.rowSelected : {}),
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
        </div>
      </div>

      {/* Step 2 — revealed only after step 1 picked */}
      {v1 && (
        <div style={styles.section}>
          {step2.title && (
            <p style={styles.sectionLabel}>{step2.title}</p>
          )}
          <div style={styles.rowList}>
            {step2Options.map((opt) => {
              const isSelected = v2 === opt
              return (
                <button
                  key={opt}
                  onClick={() => pick2(opt)}
                  disabled={!isWritable}
                  style={{
                    ...styles.row,
                    ...(isSelected ? styles.rowSelected : {}),
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
          </div>
        </div>
      )}

    </div>
  )
}

const styles = {
  container: { width: '100%' },
  section: {
    marginBottom: '1.5rem',
  },
  sectionLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    margin: '0 0 0.75rem',
  },
  rowList: {
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
}