import { useState } from 'react'

export default function IfThenLibraryBuilder({ data, onSave, saving }) {
  const {
    socialHeader,
    socialSubtext,
    socialSituations,
    urgeBreakersHeader,
    urgeBreakersSubtext,
    urgeBreakerCategories,
    allowCustomBreakers,
    customBreakerPrompt,
    selfNamingPrompt,
    selfNamingOptions,
  } = data

  // Phases: 'social' -> 'urge_breakers' -> 'review' -> 'naming'
  const [phase, setPhase] = useState('social')

  // Social responses per situation: { situationId: [responseIds] }
  const [socialResponses, setSocialResponses] = useState({})
  // Custom social responses per situation
  const [socialCustom, setSocialCustom] = useState({})
  const [socialCustomInputs, setSocialCustomInputs] = useState({})

  // Urge breakers — flat list of ids selected
  const [urgeBreakers, setUrgeBreakers] = useState([])
  const [customBreakers, setCustomBreakers] = useState([])
  const [customBreakerInput, setCustomBreakerInput] = useState('')

  const [selfNaming, setSelfNaming] = useState(null)

  const toggleSocialResponse = (situationId, responseId) => {
    setSocialResponses(prev => {
      const current = prev[situationId] || []
      return {
        ...prev,
        [situationId]: current.includes(responseId)
          ? current.filter(x => x !== responseId)
          : [...current, responseId]
      }
    })
  }

  const addSocialCustom = (situationId) => {
    const text = (socialCustomInputs[situationId] || '').trim()
    if (!text) return
    const current = socialCustom[situationId] || []
    if (current.length >= 2) return
    setSocialCustom(prev => ({ ...prev, [situationId]: [...current, text] }))
    setSocialCustomInputs(prev => ({ ...prev, [situationId]: '' }))
  }

  const removeSocialCustom = (situationId, idx) => {
    const current = socialCustom[situationId] || []
    setSocialCustom(prev => ({ ...prev, [situationId]: current.filter((_, i) => i !== idx) }))
  }

  const toggleUrgeBreaker = (id) => {
    setUrgeBreakers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const addCustomBreaker = () => {
    const trimmed = customBreakerInput.trim()
    if (trimmed.length > 0 && customBreakers.length < 3) {
      setCustomBreakers([...customBreakers, trimmed])
      setCustomBreakerInput('')
    }
  }

  const removeCustomBreaker = (idx) => {
    setCustomBreakers(customBreakers.filter((_, i) => i !== idx))
  }

  // Counts
  const totalSocialResponses = Object.values(socialResponses).reduce((sum, arr) => sum + arr.length, 0)
    + Object.values(socialCustom).reduce((sum, arr) => sum + arr.length, 0)
  const totalUrgeBreakers = urgeBreakers.length + customBreakers.length

  const finalize = () => {
    onSave({
      social_scripts: socialResponses,
      social_custom: socialCustom,
      urge_breakers: urgeBreakers,
      custom_breakers: customBreakers,
      total_social_responses: totalSocialResponses,
      total_urge_breakers: totalUrgeBreakers,
      self_naming: selfNaming,
    })
  }

  // ===================================================================
  // PHASE: SOCIAL
  // ===================================================================
  if (phase === 'social') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{socialHeader}</h2>
        <p style={styles.subtext}>{socialSubtext}</p>

        {socialSituations.map(sit => {
          const selectedResponses = socialResponses[sit.id] || []
          const customForThis = socialCustom[sit.id] || []
          const customInput = socialCustomInputs[sit.id] || ''

          return (
            <div key={sit.id} style={styles.situationBlock}>
              <p style={styles.situationLabel}>If:</p>
              <p style={styles.situationText}>{sit.situation}</p>
              <p style={styles.thenLabel}>Then:</p>

              <div style={styles.responseList}>
                {sit.responses.map(resp => {
                  const selected = selectedResponses.includes(resp.id)
                  return (
                    <button
                      key={resp.id}
                      onClick={() => toggleSocialResponse(sit.id, resp.id)}
                      style={{
                        ...styles.responseCard,
                        ...(selected ? styles.responseCardSelected : {}),
                      }}
                    >
                      {resp.label}
                    </button>
                  )
                })}

                {customForThis.map((line, idx) => (
                  <div key={`sc_${idx}`} style={{ ...styles.responseCard, ...styles.responseCardSelected, ...styles.customRow }}>
                    <span>{line}</span>
                    <button onClick={() => removeSocialCustom(sit.id, idx)} style={styles.removeBtn}>×</button>
                  </div>
                ))}

                {sit.allowCustom && customForThis.length < 2 && (
                  <div style={styles.customInputRow}>
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setSocialCustomInputs(prev => ({ ...prev, [sit.id]: e.target.value }))}
                      placeholder="Your own response"
                      style={styles.customInput}
                      onKeyDown={(e) => { if (e.key === 'Enter') addSocialCustom(sit.id) }}
                    />
                    <button onClick={() => addSocialCustom(sit.id)} style={styles.customAddBtn}>Add</button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <div style={styles.footer}>
          <p style={styles.countLine}>{totalSocialResponses} responses picked</p>
          <button
            onClick={() => setPhase('urge_breakers')}
            disabled={totalSocialResponses === 0}
            style={{
              ...styles.primaryBtn,
              ...(totalSocialResponses === 0 ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: URGE BREAKERS
  // ===================================================================
  if (phase === 'urge_breakers') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{urgeBreakersHeader}</h2>
        <p style={styles.subtext}>{urgeBreakersSubtext}</p>

        {urgeBreakerCategories.map(cat => (
          <div key={cat.key} style={styles.categoryBlock}>
            <p style={styles.categoryLabel}>{cat.label}</p>
            <div style={styles.responseList}>
              {cat.items.map(item => {
                const selected = urgeBreakers.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleUrgeBreaker(item.id)}
                    style={{
                      ...styles.responseCard,
                      ...(selected ? styles.responseCardSelected : {}),
                    }}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {allowCustomBreakers && (
          <div style={styles.categoryBlock}>
            <p style={styles.categoryLabel}>Your own</p>
            <div style={styles.responseList}>
              {customBreakers.map((line, idx) => (
                <div key={`cb_${idx}`} style={{ ...styles.responseCard, ...styles.responseCardSelected, ...styles.customRow }}>
                  <span>{line}</span>
                  <button onClick={() => removeCustomBreaker(idx)} style={styles.removeBtn}>×</button>
                </div>
              ))}
              {customBreakers.length < 3 && (
                <div style={styles.customInputRow}>
                  <input
                    type="text"
                    value={customBreakerInput}
                    onChange={(e) => setCustomBreakerInput(e.target.value)}
                    placeholder={customBreakerPrompt}
                    style={styles.customInput}
                    onKeyDown={(e) => { if (e.key === 'Enter') addCustomBreaker() }}
                  />
                  <button onClick={addCustomBreaker} style={styles.customAddBtn}>Add</button>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={styles.footer}>
          <button onClick={() => setPhase('social')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('review')}
            disabled={totalUrgeBreakers === 0}
            style={{
              ...styles.primaryBtnFlex,
              ...(totalUrgeBreakers === 0 ? styles.primaryBtnDisabled : {}),
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
  if (phase === 'review') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>Your library.</h2>
        <p style={styles.subtext}>{totalSocialResponses} social responses, {totalUrgeBreakers} urge breakers.</p>

        <div style={styles.reviewCard}>
          <p style={styles.reviewLabel}>Social scripts</p>
          {socialSituations.map(sit => {
            const sel = socialResponses[sit.id] || []
            const cust = socialCustom[sit.id] || []
            if (sel.length === 0 && cust.length === 0) return null
            return (
              <div key={sit.id} style={styles.reviewSituation}>
                <p style={styles.reviewSituationText}>{sit.situation}</p>
                <ul style={styles.reviewItemList}>
                  {sel.map(rId => {
                    const r = sit.responses.find(x => x.id === rId)
                    return r ? <li key={rId} style={styles.reviewItem}>{r.label}</li> : null
                  })}
                  {cust.map((line, idx) => (
                    <li key={`c${idx}`} style={styles.reviewItem}>{line}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div style={styles.reviewCard}>
          <p style={styles.reviewLabel}>Urge breakers</p>
          <ul style={styles.reviewItemList}>
            {urgeBreakerCategories.map(cat =>
              cat.items.filter(i => urgeBreakers.includes(i.id)).map(i => (
                <li key={i.id} style={styles.reviewItem}>{i.label}</li>
              ))
            )}
            {customBreakers.map((line, idx) => (
              <li key={`cb${idx}`} style={styles.reviewItem}>{line}</li>
            ))}
          </ul>
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('urge_breakers')} style={styles.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('naming')} style={styles.primaryBtnFlex}>Continue</button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: NAMING
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>{selfNamingPrompt}</h2>

      <div style={styles.namingList}>
        {selfNamingOptions.map(opt => {
          const selected = selfNaming === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setSelfNaming(opt.id)}
              style={{
                ...styles.namingCard,
                ...(selected ? styles.namingCardSelected : {}),
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <div style={styles.footer}>
        <button
          onClick={finalize}
          disabled={!selfNaming || saving}
          style={{
            ...styles.primaryBtn,
            ...((!selfNaming || saving) ? styles.primaryBtnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Save the library'}
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
  situationBlock: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '12px',
  },
  situationLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 4px',
  },
  situationText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.85rem',
    lineHeight: 1.4,
  },
  thenLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.5rem',
  },
  responseList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  responseCard: {
    padding: '10px 12px',
    background: '#FDFBF6',
    border: '0.5px solid #E0D5C2',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
    width: '100%',
  },
  responseCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  customRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  customInputRow: { display: 'flex', gap: '8px' },
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
  categoryBlock: { marginBottom: '1.25rem' },
  categoryLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.6rem',
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
    margin: '0 0 0.75rem',
  },
  reviewSituation: { marginBottom: '0.85rem' },
  reviewSituationText: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.35rem',
    lineHeight: 1.4,
  },
  reviewItemList: { margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' },
  reviewItem: {
    fontSize: '12.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    margin: '0 0 0.25rem',
  },
  namingList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  namingCard: {
    padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
  },
  namingCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  countLine: {
    fontSize: '11.5px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 8px',
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
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}