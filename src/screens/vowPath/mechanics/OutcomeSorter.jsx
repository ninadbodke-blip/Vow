import { useState, useEffect } from 'react'

export default function OutcomeSorter({
  outcomes,
  existingData,
  onSave,
  saving,
}) {
  const [sorts, setSorts] = useState({})
  // Each outcome id → 'hopeful' | 'scared' | 'neutral' | null

  useEffect(() => {
    if (existingData?.sorts) {
      setSorts(existingData.sorts)
    }
  }, [existingData])

  const setSort = (outcomeId, value) => {
    setSorts(prev => ({ ...prev, [outcomeId]: value }))
  }

  const allSorted = outcomes.every(o => sorts[o.id])
  const counts = {
    hopeful: Object.values(sorts).filter(v => v === 'hopeful').length,
    scared: Object.values(sorts).filter(v => v === 'scared').length,
    neutral: Object.values(sorts).filter(v => v === 'neutral').length,
  }

  const handleSave = () => {
    if (!allSorted) return
    onSave({ sorts, counts })
  }

  return (
    <div>
      <h2 style={styles.header}>How does each one feel?</h2>
      <p style={styles.subtext}>
        For each outcome, tap hopeful, scared, or neutral.
      </p>

      <div style={styles.list}>
        {outcomes.map(outcome => {
          const sort = sorts[outcome.id]
          return (
            <div key={outcome.id} style={styles.card}>
              <p style={styles.outcomeText}>{outcome.label}</p>
              <div style={styles.sortRow}>
                <button
                  onClick={() => setSort(outcome.id, 'hopeful')}
                  style={{
                    ...styles.sortBtn,
                    ...(sort === 'hopeful' ? styles.sortBtnHopeful : {}),
                  }}
                >
                  Hopeful
                </button>
                <button
                  onClick={() => setSort(outcome.id, 'scared')}
                  style={{
                    ...styles.sortBtn,
                    ...(sort === 'scared' ? styles.sortBtnScared : {}),
                  }}
                >
                  Scared
                </button>
                <button
                  onClick={() => setSort(outcome.id, 'neutral')}
                  style={{
                    ...styles.sortBtn,
                    ...(sort === 'neutral' ? styles.sortBtnNeutral : {}),
                  }}
                >
                  Neutral
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={styles.summaryRow}>
        <span style={{ ...styles.summaryItem, color: '#3B6D11' }}>Hopeful: {counts.hopeful}</span>
        <span style={styles.summaryDot}>·</span>
        <span style={{ ...styles.summaryItem, color: '#854F0B' }}>Scared: {counts.scared}</span>
        <span style={styles.summaryDot}>·</span>
        <span style={{ ...styles.summaryItem, color: '#5C4D70' }}>Neutral: {counts.neutral}</span>
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
          Sort all {outcomes.length} outcomes to continue.
        </p>
      )}
    </div>
  )
}

const styles = {
  header: {
    fontSize: '22px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 0.75rem',
  },
  subtext: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1.5rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '1.25rem',
  },
  card: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px 16px',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  outcomeText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
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
    fontSize: '11px',
    fontFamily: 'inherit',
    color: '#6B5C4A',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  sortBtnHopeful: {
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '1px solid #7A8C5A',
    color: '#3B6D11',
  },
  sortBtnScared: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '1px solid #C5572C',
    color: '#854F0B',
  },
  sortBtnNeutral: {
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
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
  },
  summaryItem: {
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 500,
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