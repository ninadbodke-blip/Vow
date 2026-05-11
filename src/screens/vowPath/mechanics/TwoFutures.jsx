import { useState, useEffect } from 'react'

export default function TwoFutures({
  cardA,
  cardB,
  promptText,
  existingData,
  onSave,
  saving,
}) {
  const [step, setStep] = useState(0) // 0: read cards, 1: pick
  const [selectedFuture, setSelectedFuture] = useState(null)
  // 'a' = continuing version, 'b' = stopped version

  useEffect(() => {
    if (existingData?.future_selected) {
      setSelectedFuture(existingData.future_selected)
      setStep(1)
    }
  }, [existingData])

  const handleSave = () => {
    if (!selectedFuture) return
    onSave({
      future_selected: selectedFuture,
      // Save reference to what was selected — useful for portrait day
      future_selected_title: selectedFuture === 'a' ? cardA.title : cardB.title,
    })
  }

  // ---- Step 0: Read both cards ----
  if (step === 0) {
    return (
      <div>
        <p style={styles.intro}>
          Read both cards. Take your time.
        </p>

        {/* Card A — continuing version */}
        <div style={{ ...styles.futureCard, ...styles.futureCardA }}>
          <div style={styles.cardLabel}>Version A</div>
          <h3 style={styles.cardTitle}>{cardA.title}</h3>
          <p style={styles.cardSubtitle}>{cardA.subtitle}</p>
          <div style={styles.cardDivider}></div>
          <div style={styles.cardBody}>
            {cardA.body.map((line, i) => (
              <p key={i} style={styles.cardLine}>{line}</p>
            ))}
          </div>
        </div>

        {/* Card B — stopped version */}
        <div style={{ ...styles.futureCard, ...styles.futureCardB }}>
          <div style={styles.cardLabel}>Version B</div>
          <h3 style={styles.cardTitle}>{cardB.title}</h3>
          <p style={styles.cardSubtitle}>{cardB.subtitle}</p>
          <div style={styles.cardDivider}></div>
          <div style={styles.cardBody}>
            {cardB.body.map((line, i) => (
              <p key={i} style={styles.cardLine}>{line}</p>
            ))}
          </div>
        </div>

        <button onClick={() => setStep(1)} style={styles.primaryBtn}>
          Continue
        </button>
      </div>
    )
  }

  // ---- Step 1: Pick which feels closer ----
  return (
    <div>
      <h2 style={styles.promptHeader}>{promptText}</h2>
      <p style={styles.promptHint}>
        Not which you'd prefer. Which feels more likely if nothing changes.
      </p>

      <div style={styles.pickList}>
        <button
          onClick={() => setSelectedFuture('a')}
          style={{
            ...styles.pickBtn,
            ...(selectedFuture === 'a' ? styles.pickBtnSelected : {}),
          }}
        >
          <div style={styles.pickLabel}>Version A</div>
          <p style={styles.pickTitle}>{cardA.title}</p>
          <p style={styles.pickSubtitle}>{cardA.subtitle}</p>
        </button>

        <button
          onClick={() => setSelectedFuture('b')}
          style={{
            ...styles.pickBtn,
            ...(selectedFuture === 'b' ? styles.pickBtnSelected : {}),
          }}
        >
          <div style={styles.pickLabel}>Version B</div>
          <p style={styles.pickTitle}>{cardB.title}</p>
          <p style={styles.pickSubtitle}>{cardB.subtitle}</p>
        </button>
      </div>

      <button
        onClick={() => setStep(0)}
        style={styles.secondaryBtn}
      >
        Re-read the cards
      </button>

      <button
        onClick={handleSave}
        disabled={!selectedFuture || saving}
        style={{
          ...styles.primaryBtn,
          ...(!selectedFuture || saving ? styles.primaryBtnDisabled : {}),
          marginTop: '0.75rem',
        }}
      >
        {saving ? 'Saving...' : 'Save & continue'}
      </button>
    </div>
  )
}

const styles = {
  intro: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0 0 1.5rem',
  },
  futureCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '18px',
    padding: '1.5rem 1.25rem',
    marginBottom: '1.25rem',
    boxShadow: '0 4px 14px rgba(80,50,20,0.05)',
  },
  futureCardA: {
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderLeftColor: '#C5572C',
  },
  futureCardB: {
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderLeftColor: '#7A8C5A',
  },
  cardLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    marginBottom: '0.4rem',
  },
  cardTitle: {
    fontSize: '20px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 0.25rem',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  cardDivider: {
    height: '0.5px',
    background: '#E8DFD0',
    margin: '0.85rem 0',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  cardLine: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.6,
    margin: 0,
  },
  promptHeader: {
    fontSize: '20px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.4,
    margin: '0 0 0.5rem',
    textAlign: 'center',
  },
  promptHint: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0 0 1.5rem',
  },
  pickList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '1rem',
  },
  pickBtn: {
    width: '100%',
    padding: '16px 18px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '16px',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  pickBtnSelected: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 4px 12px rgba(197,87,44,0.15)',
  },
  pickLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    marginBottom: '0.4rem',
  },
  pickTitle: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 2px',
    lineHeight: 1.3,
  },
  pickSubtitle: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  primaryBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: {
    background: '#C9B894',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  secondaryBtn: {
    width: '100%',
    padding: '14px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}