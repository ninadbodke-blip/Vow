import { useState } from 'react'

export default function FinalTap({ data, onSave, saving }) {
  const { header, subtext, options } = data

  // Phases: 'tap' -> 'response'
  const [phase, setPhase] = useState('tap')
  const [selected, setSelected] = useState(null)

  const handleTap = (optionId) => {
    setSelected(optionId)
    setPhase('response')
  }

  const finalize = () => {
    onSave({
      final_tap: selected,
      tapped_at: new Date().toISOString(),
    })
  }

  // ===================================================================
  // PHASE: TAP
  // ===================================================================
  if (phase === 'tap') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{header}</h2>
        <p style={styles.subtext}>{subtext}</p>

        <div style={styles.optionList}>
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleTap(opt.id)}
              style={styles.optionCard}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: RESPONSE
  // ===================================================================
  const selectedOption = options.find(o => o.id === selected)
  return (
    <div style={styles.container}>
      <div style={styles.responseCard}>
        <p style={styles.responseLabel}>You said:</p>
        <p style={styles.responseTap}>{selectedOption?.label}</p>
        <div style={styles.responseDivider}></div>
        <p style={styles.responseBody}>{selectedOption?.response}</p>
      </div>

      <div style={styles.footer}>
        <button onClick={() => { setSelected(null); setPhase('tap') }} style={styles.secondaryBtn}>
          ‹ Change
        </button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Close Commit'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { paddingTop: '0.5rem' },
  prompt: {
    fontSize: '22px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 0.5rem',
  },
  subtext: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.55, margin: '0 0 1.5rem',
  },
  optionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  optionCard: {
    padding: '20px 18px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '16px',
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    textAlign: 'left',
    lineHeight: 1.5,
    transition: 'all 0.15s',
    boxShadow: '0 2px 8px rgba(80,50,20,0.04)',
  },
  responseCard: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '1rem',
  },
  responseLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.5rem',
  },
  responseTap: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: 0,
    lineHeight: 1.5,
  },
  responseDivider: {
    height: '0.5px',
    background: '#E0D5C2',
    margin: '1rem 0',
  },
  responseBody: {
    fontSize: '14.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.7,
    margin: 0,
  },
  footer: { marginTop: '1.5rem', display: 'flex', gap: '8px' },
  primaryBtnFlex: {
    flex: 1, padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  secondaryBtn: {
    padding: '14px 18px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}