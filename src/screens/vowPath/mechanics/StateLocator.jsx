import { useState } from 'react'

export default function StateLocator({ data, onSave, saving }) {
  const {
    version = 'locator',
    introHeader,
    states = [],
    locatorHeader,
    locatorSubtext,
    oscillationHeader,
    oscillationSubtext,
    contextualPrompt,
    contextualOptions,
    rankPrompt,
    contextualPromptDominant,
    contextualPromptSecondary,
  } = data

  // For locator: phases: 'intro' -> 'locate_now' -> 'oscillation' -> 'contextual' -> 'review'
  // For map: phases: 'intro' -> 'rank' -> 'contextual_dominant' -> 'contextual_secondary' -> 'review'
  const [phase, setPhase] = useState('intro')

  const [currentState, setCurrentState] = useState(null)
  const [oscillationStates, setOscillationStates] = useState([])
  const [rankedStates, setRankedStates] = useState([]) // Day 18: ordered list
  const [contextualPicks, setContextualPicks] = useState([])
  const [contextualDominant, setContextualDominant] = useState([])
  const [contextualSecondary, setContextualSecondary] = useState([])

  const isMap = version === 'map'

  const toggleOscillation = (id) => {
    setOscillationStates(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  const toggleContextual = (setter, list, id) => {
    setter(list.includes(id) ? list.filter(x => x !== id) : [...list, id])
  }

  const handleRankPick = (id) => {
    setRankedStates(prev => {
      if (prev.includes(id)) {
        // Remove and re-add (move to end)
        return [...prev.filter(x => x !== id), id]
      }
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const removeFromRank = (id) => {
    setRankedStates(prev => prev.filter(x => x !== id))
  }

  const finalize = () => {
    if (isMap) {
      onSave({
        version: 'map',
        ranked_states: rankedStates,
        dominant_state: rankedStates[0],
        secondary_state: rankedStates[1],
        least_state: rankedStates[2],
        contextual_dominant: contextualDominant,
        contextual_secondary: contextualSecondary,
      })
    } else {
      onSave({
        version,
        current_state: currentState,
        oscillation_states: oscillationStates,
        contextual_pulls: contextualPicks,
      })
    }
  }

  // ===================================================================
  // PHASE: INTRO — show the three states
  // ===================================================================
  if (phase === 'intro') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{introHeader || 'The three states.'}</h2>
        <p style={styles.subtext}>Read each. Then continue.</p>

        <div style={styles.statesList}>
          {states.map(state => (
            <div key={state.id} style={{ ...styles.stateCard, borderLeftColor: state.color }}>
              <p style={styles.stateLabel}>{state.label}</p>
              <p style={styles.stateDescription}>{state.description}</p>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase(isMap ? 'rank' : 'locate_now')} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // MAP MODE — RANK
  // ===================================================================
  if (isMap && phase === 'rank') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{rankPrompt || 'Rank the three states by where you have been:'}</h2>
        <p style={styles.subtext}>Tap in order — most time first, second-most second, least last.</p>

        <div style={styles.statesList}>
          {states.map(state => {
            const idx = rankedStates.indexOf(state.id)
            const rank = idx >= 0 ? idx + 1 : null
            const rankLabel = rank === 1 ? 'Most' : rank === 2 ? 'Second' : rank === 3 ? 'Least' : null
            return (
              <button
                key={state.id}
                onClick={() => rank ? removeFromRank(state.id) : handleRankPick(state.id)}
                style={{
                  ...styles.stateCardButton,
                  borderLeftColor: state.color,
                  ...(rank ? styles.stateCardSelected : {}),
                }}
              >
                <div style={styles.stateCardContent}>
                  <p style={styles.stateLabel}>{state.label}</p>
                  <p style={styles.stateDescription}>{state.description}</p>
                </div>
                {rank && (
                  <div style={styles.rankBadge}>
                    <span style={styles.rankNum}>{rank}</span>
                    <span style={styles.rankLabel}>{rankLabel}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('intro')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('contextual_dominant')}
            disabled={rankedStates.length !== 3}
            style={{
              ...styles.primaryBtnFlex,
              ...(rankedStates.length !== 3 ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // MAP MODE — CONTEXTUAL DOMINANT
  // ===================================================================
  if (isMap && phase === 'contextual_dominant') {
    const dominantState = states.find(s => s.id === rankedStates[0])
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{contextualPromptDominant || `What pulls you into your dominant state, now?`}</h2>
        {dominantState && (
          <p style={styles.subtextEmphasis}>
            Dominant: <strong>{dominantState.label}</strong>
          </p>
        )}

        <div style={styles.optionList}>
          {contextualOptions.map(opt => {
            const selected = contextualDominant.includes(opt.id)
            return (
              <button
                key={opt.id}
                onClick={() => toggleContextual(setContextualDominant, contextualDominant, opt.id)}
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
          <button onClick={() => setPhase('rank')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('contextual_secondary')}
            disabled={contextualDominant.length === 0}
            style={{
              ...styles.primaryBtnFlex,
              ...(contextualDominant.length === 0 ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // MAP MODE — CONTEXTUAL SECONDARY
  // ===================================================================
  if (isMap && phase === 'contextual_secondary') {
    const secondaryState = states.find(s => s.id === rankedStates[1])
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{contextualPromptSecondary || `What pulls you into your secondary state?`}</h2>
        {secondaryState && (
          <p style={styles.subtextEmphasis}>
            Secondary: <strong>{secondaryState.label}</strong>
          </p>
        )}

        <div style={styles.optionList}>
          {contextualOptions.map(opt => {
            const selected = contextualSecondary.includes(opt.id)
            return (
              <button
                key={opt.id}
                onClick={() => toggleContextual(setContextualSecondary, contextualSecondary, opt.id)}
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
          <button onClick={() => setPhase('contextual_dominant')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('review')}
            disabled={contextualSecondary.length === 0}
            style={{
              ...styles.primaryBtnFlex,
              ...(contextualSecondary.length === 0 ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // LOCATOR MODE — LOCATE NOW
  // ===================================================================
  if (!isMap && phase === 'locate_now') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{locatorHeader}</h2>
        <p style={styles.subtext}>{locatorSubtext}</p>

        <div style={styles.statesList}>
          {states.map(state => {
            const selected = currentState === state.id
            return (
              <button
                key={state.id}
                onClick={() => setCurrentState(state.id)}
                style={{
                  ...styles.stateCardButton,
                  borderLeftColor: state.color,
                  ...(selected ? styles.stateCardSelected : {}),
                }}
              >
                <div style={styles.stateCardContent}>
                  <p style={styles.stateLabel}>{state.label}</p>
                  <p style={styles.stateDescription}>{state.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('intro')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('oscillation')}
            disabled={!currentState}
            style={{
              ...styles.primaryBtnFlex,
              ...(!currentState ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // LOCATOR MODE — OSCILLATION (pick 2)
  // ===================================================================
  if (!isMap && phase === 'oscillation') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{oscillationHeader}</h2>
        <p style={styles.subtext}>{oscillationSubtext} Pick the two you spend most time in.</p>

        <div style={styles.statesList}>
          {states.map(state => {
            const selected = oscillationStates.includes(state.id)
            return (
              <button
                key={state.id}
                onClick={() => toggleOscillation(state.id)}
                style={{
                  ...styles.stateCardButton,
                  borderLeftColor: state.color,
                  ...(selected ? styles.stateCardSelected : {}),
                }}
              >
                <div style={styles.stateCardContent}>
                  <p style={styles.stateLabel}>{state.label}</p>
                  <p style={styles.stateDescription}>{state.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('locate_now')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('contextual')}
            disabled={oscillationStates.length !== 2}
            style={{
              ...styles.primaryBtnFlex,
              ...(oscillationStates.length !== 2 ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // LOCATOR MODE — CONTEXTUAL
  // ===================================================================
  if (!isMap && phase === 'contextual') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{contextualPrompt}</h2>
        <p style={styles.subtext}>One tap.</p>

        <div style={styles.optionList}>
          {contextualOptions.map(opt => {
            const selected = contextualPicks.includes(opt.id)
            return (
              <button
                key={opt.id}
                onClick={() => setContextualPicks([opt.id])} // single-select
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
          <button onClick={() => setPhase('oscillation')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('review')}
            disabled={contextualPicks.length === 0}
            style={{
              ...styles.primaryBtnFlex,
              ...(contextualPicks.length === 0 ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVIEW — both modes
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>{isMap ? 'Your nervous system map.' : 'Your location.'}</h2>

      {isMap ? (
        <>
          <div style={styles.reviewCard}>
            <p style={styles.reviewLabel}>Across the past 18 days</p>
            {rankedStates.map((sid, idx) => {
              const state = states.find(s => s.id === sid)
              const rankLabel = idx === 0 ? 'Most time in' : idx === 1 ? 'Second-most time in' : 'Least time in'
              return state ? (
                <div key={sid} style={styles.reviewRow}>
                  <span style={styles.reviewRowLabel}>{rankLabel}:</span>{' '}
                  <span style={styles.reviewRowValue}>{state.label}</span>
                </div>
              ) : null
            })}
          </div>

          <div style={styles.reviewCard}>
            <p style={styles.reviewLabel}>What pulls you into your dominant state</p>
            <ul style={styles.reviewItemList}>
              {contextualDominant.map(id => {
                const opt = contextualOptions.find(o => o.id === id)
                return opt ? <li key={id} style={styles.reviewItem}>{opt.label}</li> : null
              })}
            </ul>
          </div>
        </>
      ) : (
        <>
          <div style={styles.reviewCard}>
            <p style={styles.reviewLabel}>Right now</p>
            <p style={styles.reviewBig}>{states.find(s => s.id === currentState)?.label}</p>
          </div>

          <div style={styles.reviewCard}>
            <p style={styles.reviewLabel}>You oscillate between</p>
            <ul style={styles.reviewItemList}>
              {oscillationStates.map(id => {
                const state = states.find(s => s.id === id)
                return state ? <li key={id} style={styles.reviewItem}>{state.label}</li> : null
              })}
            </ul>
          </div>

          {contextualPicks.length > 0 && (
            <div style={styles.reviewCard}>
              <p style={styles.reviewLabel}>What pulled you into the substance</p>
              <p style={styles.reviewItemFlat}>
                {contextualOptions.find(o => o.id === contextualPicks[0])?.label}
              </p>
            </div>
          )}
        </>
      )}

      <div style={styles.footer}>
        <button
          onClick={() => setPhase(isMap ? 'contextual_secondary' : 'contextual')}
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
  subtextEmphasis: {
    fontSize: '13px', color: '#854F0B',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55, margin: '0 0 1.25rem',
  },
  statesList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  stateCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderLeftWidth: '4px',
    borderRadius: '14px',
    padding: '14px',
  },
  stateCardButton: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderLeftWidth: '4px',
    borderRadius: '14px',
    padding: '14px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
    transition: 'all 0.15s',
  },
  stateCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  stateCardContent: { flex: 1 },
  stateLabel: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.4rem',
    lineHeight: 1.3,
  },
  stateDescription: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
    margin: 0,
  },
  rankBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#854F0B',
    borderRadius: '12px',
    padding: '6px 10px',
    flexShrink: 0,
    minWidth: '54px',
  },
  rankNum: {
    fontSize: '18px',
    color: '#FAF7F1',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1,
  },
  rankLabel: {
    fontSize: '9px',
    color: '#FAF7F1',
    fontFamily: 'Georgia, serif',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginTop: '2px',
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
    margin: '0 0 0.6rem',
  },
  reviewBig: {
    fontSize: '16px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0, lineHeight: 1.4,
  },
  reviewRow: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    margin: '0 0 0.35rem',
  },
  reviewRowLabel: {
    color: '#854F0B',
    fontStyle: 'italic',
  },
  reviewRowValue: {
    color: '#2A1F15',
  },
  reviewItemList: { margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' },
  reviewItem: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    margin: '0 0 0.25rem',
  },
  reviewItemFlat: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    margin: 0,
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