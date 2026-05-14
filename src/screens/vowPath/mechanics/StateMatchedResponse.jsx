import { useState } from 'react'

export default function StateMatchedResponse({ data, onSave, saving }) {
  const {
    states,
    minPerState = 2,
    allowCustom,
    customPrompt,
  } = data

  // Phases: 'state:0' -> 'state:1' -> 'state:2' -> 'review'
  const [phase, setPhase] = useState('state:0')

  // Per-state selections: { stateKey: [optionIds] }
  const [selections, setSelections] = useState({})
  // Per-state custom: { stateKey: [strings] }
  const [customLines, setCustomLines] = useState({})
  const [customInputs, setCustomInputs] = useState({})

  const currentStateIdx = phase.startsWith('state:') ? parseInt(phase.split(':')[1], 10) : -1
  const currentState = currentStateIdx >= 0 ? states[currentStateIdx] : null

  const toggle = (stateKey, optionId) => {
    setSelections(prev => {
      const current = prev[stateKey] || []
      return {
        ...prev,
        [stateKey]: current.includes(optionId)
          ? current.filter(x => x !== optionId)
          : [...current, optionId]
      }
    })
  }

  const addCustom = (stateKey) => {
    const text = (customInputs[stateKey] || '').trim()
    if (!text) return
    const current = customLines[stateKey] || []
    if (current.length >= 2) return
    setCustomLines(prev => ({ ...prev, [stateKey]: [...current, text] }))
    setCustomInputs(prev => ({ ...prev, [stateKey]: '' }))
  }

  const removeCustom = (stateKey, idx) => {
    const current = customLines[stateKey] || []
    setCustomLines(prev => ({ ...prev, [stateKey]: current.filter((_, i) => i !== idx) }))
  }

  const stateTotalCount = (stateKey) => {
    return (selections[stateKey] || []).length + (customLines[stateKey] || []).length
  }

  const advance = () => {
    if (currentStateIdx < states.length - 1) {
      setPhase(`state:${currentStateIdx + 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setPhase('review')
    }
  }

  const goBack = () => {
    if (currentStateIdx > 0) {
      setPhase(`state:${currentStateIdx - 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const finalize = () => {
    const toolkit = states.map(s => ({
      state_key: s.key,
      state_label: s.label,
      selected_options: selections[s.key] || [],
      selected_labels: (selections[s.key] || []).map(optId => {
        const opt = s.options.find(o => o.id === optId)
        return opt?.label || optId
      }),
      custom_responses: customLines[s.key] || [],
    }))
    onSave({ toolkit, built_at: new Date().toISOString() })
  }

  // ===================================================================
  // PHASE: STATE
  // ===================================================================
  if (currentState) {
    const currentSelections = selections[currentState.key] || []
    const currentCustom = customLines[currentState.key] || []
    const currentInput = customInputs[currentState.key] || ''
    const count = stateTotalCount(currentState.key)
    const meetsMin = count >= minPerState

    return (
      <div style={styles.container}>
        <p style={styles.progressLabel}>
          State {currentStateIdx + 1} of {states.length}
        </p>

        <h2 style={styles.stateHeader}>{currentState.label}</h2>
        <p style={styles.subtext}>{currentState.subtext}</p>

        <div style={styles.optionList}>
          {currentState.options.map(opt => {
            const selected = currentSelections.includes(opt.id)
            return (
              <button
                key={opt.id}
                onClick={() => toggle(currentState.key, opt.id)}
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

        {allowCustom && (
          <div style={styles.customSection}>
            {currentCustom.map((line, idx) => (
              <div key={`cl_${idx}`} style={{ ...styles.optionCard, ...styles.optionCardSelected, ...styles.customRow }}>
                <span>{line}</span>
                <button onClick={() => removeCustom(currentState.key, idx)} style={styles.removeBtn}>×</button>
              </div>
            ))}

            {currentCustom.length < 2 && (
              <div style={styles.customInputRow}>
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCustomInputs(prev => ({ ...prev, [currentState.key]: e.target.value }))}
                  placeholder={customPrompt}
                  style={styles.customInput}
                  onKeyDown={(e) => { if (e.key === 'Enter') addCustom(currentState.key) }}
                />
                <button onClick={() => addCustom(currentState.key)} style={styles.customAddBtn}>Add</button>
              </div>
            )}
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.countLine}>
            {count} picked{meetsMin ? '' : ` · need at least ${minPerState}`}
          </p>
          {currentStateIdx > 0 && (
            <div style={styles.btnRow}>
              <button onClick={goBack} style={styles.secondaryBtn}>‹ Back</button>
              <button
                onClick={advance}
                disabled={!meetsMin}
                style={{
                  ...styles.primaryBtnFlex,
                  ...(!meetsMin ? styles.primaryBtnDisabled : {}),
                }}
              >
                {currentStateIdx === states.length - 1 ? 'Review' : 'Next state'}
              </button>
            </div>
          )}
          {currentStateIdx === 0 && (
            <button
              onClick={advance}
              disabled={!meetsMin}
              style={{
                ...styles.primaryBtn,
                ...(!meetsMin ? styles.primaryBtnDisabled : {}),
              }}
            >
              Next state
            </button>
          )}
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVIEW
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>Your state-matched toolkit.</h2>
      <p style={styles.subtext}>Different state, different move. The toolkit is yours now.</p>

      {states.map(s => {
        const sels = selections[s.key] || []
        const custom = customLines[s.key] || []
        if (sels.length === 0 && custom.length === 0) return null
        return (
          <div key={s.key} style={styles.toolkitCard}>
            <p style={styles.toolkitStateLabel}>{s.label}</p>
            <ul style={styles.toolkitList}>
              {sels.map(optId => {
                const opt = s.options.find(o => o.id === optId)
                return opt ? <li key={optId} style={styles.toolkitItem}>{opt.label}</li> : null
              })}
              {custom.map((line, idx) => (
                <li key={`c${idx}`} style={styles.toolkitItem}>{line}</li>
              ))}
            </ul>
          </div>
        )
      })}

      <div style={styles.footer}>
        <button onClick={() => setPhase(`state:${states.length - 1}`)} style={styles.secondaryBtn}>‹ Back</button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Save the toolkit'}
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
  stateHeader: {
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
  progressLabel: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    margin: '0 0 0.75rem',
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
  customRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
  },
  customSection: { marginTop: '8px' },
  customInputRow: { display: 'flex', gap: '8px', marginTop: '6px' },
  customInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #C5AE8A',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    background: 'white',
  },
  customAddBtn: {
    padding: '0 16px',
    background: '#854F0B',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  removeBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '18px',
    cursor: 'pointer', padding: 0, lineHeight: 1,
  },
  toolkitCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '10px',
  },
  toolkitStateLabel: {
    fontSize: '13px', color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.6rem',
    lineHeight: 1.4,
  },
  toolkitList: { margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' },
  toolkitItem: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
    margin: '0 0 0.35rem',
  },
  countLine: {
    fontSize: '11.5px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 8px', textAlign: 'center',
  },
  footer: { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' },
  btnRow: { display: 'flex', gap: '8px' },
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