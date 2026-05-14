import { useState } from 'react'

export default function LapseRelapseRecall({ data, onSave, saving }) {
  const {
    statusPrompt,
    statusOptions,
    conditionsPrompt,
    conditionsOptions,
    held_pulledBack_prompt,
    held_pulledBack_options,
  } = data

  // Phases: 'status' -> 'conditions' (if applicable) -> 'pulled_back' (if applicable) -> 'review'
  const [phase, setPhase] = useState('status')
  const [status, setStatus] = useState(null)
  const [conditions, setConditions] = useState([])
  const [pulledBack, setPulledBack] = useState([])

  // Skip the deeper questions if user picked "no_close_calls"
  const shouldAskDeeper = status && status !== 'no_close_calls'

  const toggleCondition = (id) => {
    setConditions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const togglePulledBack = (id) => {
    setPulledBack(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const finalize = () => {
    onSave({
      status,
      conditions,
      pulled_back: pulledBack,
      recalled_at: new Date().toISOString(),
    })
  }

  // ===================================================================
  // PHASE: STATUS
  // ===================================================================
  if (phase === 'status') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{statusPrompt}</h2>
        <p style={styles.subtext}>One tap. Honest.</p>

        <div style={styles.optionList}>
          {statusOptions.map(opt => {
            const selected = status === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setStatus(opt.id)}
                style={{
                  ...styles.optionCard,
                  ...(selected ? styles.optionCardSelected : {}),
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button
            onClick={() => setPhase(shouldAskDeeper ? 'conditions' : 'review')}
            disabled={!status}
            style={{
              ...styles.primaryBtn,
              ...(!status ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: CONDITIONS
  // ===================================================================
  if (phase === 'conditions') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{conditionsPrompt}</h2>
        <p style={styles.subtext}>Tap each that applies. There may be more than one.</p>

        <div style={styles.optionList}>
          {conditionsOptions.map(opt => {
            const selected = conditions.includes(opt.id)
            return (
              <button
                key={opt.id}
                onClick={() => toggleCondition(opt.id)}
                style={{
                  ...styles.optionCard,
                  ...(selected ? styles.optionCardSelected : {}),
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('status')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('pulled_back')}
            disabled={conditions.length === 0}
            style={{
              ...styles.primaryBtnFlex,
              ...(conditions.length === 0 ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: PULLED BACK
  // ===================================================================
  if (phase === 'pulled_back') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{held_pulledBack_prompt}</h2>
        <p style={styles.subtext}>Tap each. There may be more than one.</p>

        <div style={styles.optionList}>
          {held_pulledBack_options.map(opt => {
            const selected = pulledBack.includes(opt.id)
            return (
              <button
                key={opt.id}
                onClick={() => togglePulledBack(opt.id)}
                style={{
                  ...styles.optionCard,
                  ...(selected ? styles.optionCardSelected : {}),
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('conditions')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('review')}
            disabled={pulledBack.length === 0}
            style={{
              ...styles.primaryBtnFlex,
              ...(pulledBack.length === 0 ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVIEW
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>What you named.</h2>
      <p style={styles.subtext}>Data, not verdict.</p>

      <div style={styles.reviewCard}>
        <p style={styles.reviewLabel}>Status</p>
        <p style={styles.reviewBig}>
          {statusOptions.find(o => o.id === status)?.label}
        </p>
      </div>

      {conditions.length > 0 && (
        <div style={styles.reviewCard}>
          <p style={styles.reviewLabel}>When the urge was loudest</p>
          <ul style={styles.reviewList}>
            {conditions.map(id => {
              const opt = conditionsOptions.find(o => o.id === id)
              return opt ? <li key={id} style={styles.reviewItem}>{opt.label}</li> : null
            })}
          </ul>
        </div>
      )}

      {pulledBack.length > 0 && (
        <div style={styles.reviewCard}>
          <p style={styles.reviewLabel}>What pulled you back / did the work</p>
          <ul style={styles.reviewList}>
            {pulledBack.map(id => {
              const opt = held_pulledBack_options.find(o => o.id === id)
              return opt ? <li key={id} style={styles.reviewItem}>{opt.label}</li> : null
            })}
          </ul>
        </div>
      )}

      <p style={styles.summaryNote}>
        The second half of Endure adjusts to what you named here.
      </p>

      <div style={styles.footer}>
        <button
          onClick={() => setPhase(shouldAskDeeper ? 'pulled_back' : 'status')}
          style={styles.secondaryBtn}
        >
          ‹ Back
        </button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { paddingTop: '0.5rem' },
  prompt: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 0.5rem',
  },
  subtext: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.55, margin: '0 0 1.25rem',
  },
  optionList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  optionCard: {
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    fontSize: '13.5px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer', textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
    width: '100%',
  },
  optionCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  reviewCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '10px',
  },
  reviewLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.5rem',
  },
  reviewBig: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0,
    lineHeight: 1.45,
  },
  reviewList: { margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' },
  reviewItem: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
    margin: '0 0 0.25rem',
  },
  summaryNote: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1rem',
    textAlign: 'center',
  },
  footer: { marginTop: '1.5rem', display: 'flex', gap: '8px' },
  primaryBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
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
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
  },
}