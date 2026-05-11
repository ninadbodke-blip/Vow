import { useState, useEffect } from 'react'

export default function TruthSort({
  statements,
  existingData,
  onSave,
  saving,
}) {
  // Track each statement's sort: 'true' | 'not_true' | 'not_sure' | null
  const [sorts, setSorts] = useState({})

  useEffect(() => {
    if (existingData?.sorts) {
      setSorts(existingData.sorts)
    }
  }, [existingData])

  const setSort = (statementId, value) => {
    setSorts(prev => ({ ...prev, [statementId]: value }))
  }

  const allSorted = statements.every(s => sorts[s.id])
  const counts = {
    true: Object.values(sorts).filter(v => v === 'true').length,
    not_true: Object.values(sorts).filter(v => v === 'not_true').length,
    not_sure: Object.values(sorts).filter(v => v === 'not_sure').length,
  }

  const handleSave = () => {
    if (!allSorted) return
    onSave({ sorts, counts })
  }

  return (
    <div>
      <h2 style={styles.header}>{`What's true for you?`}</h2>
      <p style={styles.subtext}>
        {`For each, tap True, Not true, or Not sure. "Sort of" is not an option.`}
      </p>

      <div style={styles.statementList}>
        {statements.map(stmt => {
          const sort = sorts[stmt.id]
          return (
            <div key={stmt.id} style={styles.statementCard}>
              <p style={styles.statementText}>{stmt.text}</p>
              <div style={styles.sortRow}>
                <button
                  onClick={() => setSort(stmt.id, 'true')}
                  style={{
                    ...styles.sortBtn,
                    ...(sort === 'true' ? styles.sortBtnSelectedTrue : {}),
                  }}
                >
                  True
                </button>
                <button
                  onClick={() => setSort(stmt.id, 'not_true')}
                  style={{
                    ...styles.sortBtn,
                    ...(sort === 'not_true' ? styles.sortBtnSelectedFalse : {}),
                  }}
                >
                  Not true
                </button>
                <button
                  onClick={() => setSort(stmt.id, 'not_sure')}
                  style={{
                    ...styles.sortBtn,
                    ...(sort === 'not_sure' ? styles.sortBtnSelectedUnsure : {}),
                  }}
                >
                  Not sure
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={styles.summaryRow}>
        <span style={styles.summaryItem}>True: {counts.true}</span>
        <span style={styles.summaryDot}>·</span>
        <span style={styles.summaryItem}>Not true: {counts.not_true}</span>
        <span style={styles.summaryDot}>·</span>
        <span style={styles.summaryItem}>Not sure: {counts.not_sure}</span>
      </div>

      <button
        onClick={handleSave}
        disabled={!allSorted || saving}
        style={{
          ...styles.saveBtn,
          ...(!allSorted || saving ? styles.saveBtnDisabled : {}),
        }}
      >
        {saving ? 'Saving...' : 'Save & continue'}
      </button>

      {!allSorted && (
        <p style={styles.helpText}>
          Sort all {statements.length} statements to continue.
        </p>
      )}
    </div>
  )
}

const styles = {
  header: {
    fontSize: '22px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 0.75rem',
  },
  subtext: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1.5rem',
  },
  statementList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '1.5rem',
  },
  statementCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px 16px',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  statementText: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    margin: '0 0 0.85rem',
  },
  sortRow: {
    display: 'flex',
    gap: '6px',
  },
  sortBtn: {
    flex: 1,
    padding: '9px 6px',
    background: '#FDFBF6',
    border: '0.5px solid #DDCFB6',
    borderRadius: '10px',
    fontSize: '12px',
    fontFamily: 'inherit',
    color: '#6B5C4A',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  sortBtnSelectedTrue: {
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '1px solid #7A8C5A',
    color: '#3B6D11',
  },
  sortBtnSelectedFalse: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '1px solid #C5572C',
    color: '#854F0B',
  },
  sortBtnSelectedUnsure: {
    background: 'linear-gradient(180deg, #ECE6F4 0%, #DCD3E8 100%)',
    border: '1px solid #7A6B8C',
    color: '#5C4D70',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    marginBottom: '1.25rem',
  },
  summaryItem: {
    fontVariantNumeric: 'tabular-nums',
  },
  summaryDot: {
    color: '#DDCFB6',
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
  helpText: {
    fontSize: '11px',
    color: '#9C8C78',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
    marginTop: '0.75rem',
    marginBottom: 0,
  },
}