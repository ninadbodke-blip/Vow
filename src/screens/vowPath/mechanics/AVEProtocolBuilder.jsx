import { useState } from 'react'

export default function AVEProtocolBuilder({ data, onSave, saving }) {
  const { steps, closeConfirm } = data

  // Phases: 'step:0' -> 'step:1' -> 'step:2' -> 'step:3' -> 'review'
  const [phase, setPhase] = useState('step:0')

  // Per-step selections
  const [selections, setSelections] = useState({})

  const currentStepIdx = phase.startsWith('step:') ? parseInt(phase.split(':')[1], 10) : -1
  const step = currentStepIdx >= 0 ? steps[currentStepIdx] : null

  const toggleOption = (stepId, optionId) => {
    setSelections(prev => {
      const current = prev[stepId] || []
      return {
        ...prev,
        [stepId]: current.includes(optionId)
          ? current.filter(x => x !== optionId)
          : [...current, optionId]
      }
    })
  }

  const advance = () => {
    if (currentStepIdx < steps.length - 1) {
      setPhase(`step:${currentStepIdx + 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setPhase('review')
    }
  }

  const goBack = () => {
    if (currentStepIdx > 0) {
      setPhase(`step:${currentStepIdx - 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const stepHasSelection = (stepId) => (selections[stepId] || []).length > 0

  const allStepsHaveSelection = steps.every(s => stepHasSelection(s.id))

  const finalize = () => {
    const protocol = steps.map(s => ({
      step_id: s.id,
      header: s.header,
      selected_options: selections[s.id] || [],
      selected_labels: (selections[s.id] || []).map(optId => {
        const opt = s.options.find(o => o.id === optId)
        return opt?.label || optId
      })
    }))
    onSave({
      protocol,
      built_at: new Date().toISOString(),
    })
  }

  // ===================================================================
  // PHASE: STEP
  // ===================================================================
  if (step) {
    const currentSelections = selections[step.id] || []

    return (
      <div style={styles.container}>
        <p style={styles.progressLabel}>
          Step {currentStepIdx + 1} of {steps.length}
        </p>

        <h2 style={styles.stepHeader}>{step.header}</h2>
        <p style={styles.subtext}>{step.subtext}</p>

        <div style={styles.optionList}>
          {step.options.map(opt => {
            const selected = currentSelections.includes(opt.id)
            return (
              <button
                key={opt.id}
                onClick={() => toggleOption(step.id, opt.id)}
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
          {currentStepIdx > 0 && (
            <button onClick={goBack} style={styles.secondaryBtn}>‹ Back</button>
          )}
          <button
            onClick={advance}
            disabled={currentSelections.length === 0}
            style={{
              ...styles.primaryBtnFlex,
              ...(currentSelections.length === 0 ? styles.primaryBtnDisabled : {}),
            }}
          >
            {currentStepIdx === steps.length - 1 ? 'Review' : 'Continue'}
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
      <h2 style={styles.prompt}>Your AVE protocol.</h2>
      <p style={styles.subtext}>Pre-decided. If a slip happens, this is what you do.</p>

      <div style={styles.protocolDocument}>
        {steps.map((s, idx) => {
          const sels = selections[s.id] || []
          if (sels.length === 0) return null
          return (
            <div key={s.id} style={styles.protocolStep}>
              <p style={styles.protocolStepNum}>Step {idx + 1}</p>
              <p style={styles.protocolStepHeader}>{s.header}</p>
              <ul style={styles.protocolList}>
                {sels.map(optId => {
                  const opt = s.options.find(o => o.id === optId)
                  return opt ? <li key={optId} style={styles.protocolItem}>{opt.label}</li> : null
                })}
              </ul>
            </div>
          )
        })}
      </div>

      {closeConfirm && (
        <div style={styles.confirmCard}>
          <p style={styles.confirmText}>{closeConfirm}</p>
        </div>
      )}

      <div style={styles.footer}>
        <button onClick={() => setPhase(`step:${steps.length - 1}`)} style={styles.secondaryBtn}>‹ Back</button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Save the protocol'}
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
  progressLabel: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    margin: '0 0 0.75rem',
  },
  stepHeader: {
    fontSize: '22px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 0.5rem',
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
  protocolDocument: {
    background: '#FDFBF6',
    border: '1px solid #E0D5C2',
    borderRadius: '16px',
    padding: '20px 18px',
    marginBottom: '1rem',
    boxShadow: '0 4px 12px rgba(80,50,20,0.06)',
  },
  protocolStep: { marginBottom: '1.25rem' },
  protocolStepNum: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 4px',
  },
  protocolStepHeader: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.5rem',
    lineHeight: 1.4,
  },
  protocolList: { margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' },
  protocolItem: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
    margin: '0 0 0.35rem',
  },
  confirmCard: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '1rem',
  },
  confirmText: {
    fontSize: '13.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
    textAlign: 'center',
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
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
  },
}