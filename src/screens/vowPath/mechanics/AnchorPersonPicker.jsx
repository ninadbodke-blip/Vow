import { useState } from 'react'

export default function AnchorPersonPicker({ data, onSave, saving }) {
  const {
    relationshipOptions,
    qualitiesPrompt,
    qualitiesSubtext,
    qualityChecks,
    contactMethodPrompt,
    contactMethodOptions,
    cadencePrompt,
    cadenceOptions,
    messagePromptHeader,
    messagePromptSubtext,
    messageStarter,
  } = data

  // Phases: 'pick' -> 'qualities' -> 'contact' -> 'cadence' -> 'message' -> 'review'
  const [phase, setPhase] = useState('pick')

  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState(null)
  const [qualitiesConfirmed, setQualitiesConfirmed] = useState([])
  const [contactMethod, setContactMethod] = useState(null)
  const [cadence, setCadence] = useState(null)
  const [message, setMessage] = useState(messageStarter || '')

  const toggleQuality = (id) => {
    setQualitiesConfirmed(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const allQualitiesChecked = qualityChecks.every(q => qualitiesConfirmed.includes(q.id))

  const finalize = () => {
    onSave({
      anchor_name: name,
      anchor_relationship: relationship,
      qualities_confirmed: qualitiesConfirmed,
      contact_method: contactMethod,
      cadence,
      draft_message: message,
    })
  }

  // ===================================================================
  // PHASE: PICK
  // ===================================================================
  if (phase === 'pick') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>Who's your anchor?</h2>
        <p style={styles.subtext}>One person who knows the date and checks in.</p>

        <div style={styles.field}>
          <label style={styles.fieldLabel}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Their name"
            style={styles.input}
            maxLength={60}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.fieldLabel}>Relationship</label>
          <div style={styles.chipRow}>
            {relationshipOptions.map(r => {
              const selected = relationship === r.id
              return (
                <button
                  key={r.id}
                  onClick={() => setRelationship(r.id)}
                  style={{
                    ...styles.chip,
                    ...(selected ? styles.chipSelected : {}),
                  }}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
        </div>

        <div style={styles.footer}>
          <button
            onClick={() => setPhase('qualities')}
            disabled={!name.trim() || !relationship}
            style={{
              ...styles.primaryBtn,
              ...((!name.trim() || !relationship) ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: QUALITIES
  // ===================================================================
  if (phase === 'qualities') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{qualitiesPrompt}</h2>
        <p style={styles.subtext}>{qualitiesSubtext}</p>

        <div style={styles.optionList}>
          {qualityChecks.map(q => {
            const selected = qualitiesConfirmed.includes(q.id)
            return (
              <button
                key={q.id}
                onClick={() => toggleQuality(q.id)}
                style={{
                  ...styles.optionCard,
                  ...(selected ? styles.optionCardSelected : {}),
                }}
              >
                {q.label}
              </button>
            )
          })}
        </div>

        {!allQualitiesChecked && qualitiesConfirmed.length > 0 && (
          <p style={styles.warningNote}>
            All three should be true. If they're not, consider picking someone else.
          </p>
        )}

        <div style={styles.footer}>
          <button onClick={() => setPhase('pick')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('contact')}
            disabled={!allQualitiesChecked}
            style={{
              ...styles.primaryBtnFlex,
              ...(!allQualitiesChecked ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: CONTACT METHOD
  // ===================================================================
  if (phase === 'contact') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{contactMethodPrompt}</h2>

        <div style={styles.optionList}>
          {contactMethodOptions.map(opt => {
            const selected = contactMethod === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setContactMethod(opt.id)}
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
          <button onClick={() => setPhase('qualities')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('cadence')}
            disabled={!contactMethod}
            style={{
              ...styles.primaryBtnFlex,
              ...(!contactMethod ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: CADENCE
  // ===================================================================
  if (phase === 'cadence') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{cadencePrompt}</h2>

        <div style={styles.optionList}>
          {cadenceOptions.map(opt => {
            const selected = cadence === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setCadence(opt.id)}
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
          <button onClick={() => setPhase('contact')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('message')}
            disabled={!cadence}
            style={{
              ...styles.primaryBtnFlex,
              ...(!cadence ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: MESSAGE
  // ===================================================================
  if (phase === 'message') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{messagePromptHeader}</h2>
        <p style={styles.subtext}>{messagePromptSubtext}</p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={messageStarter}
          style={styles.textarea}
          rows={10}
        />

        <p style={styles.helper}>
          You don't have to send this exact text. Drafting it makes the conversation real in advance.
        </p>

        <div style={styles.footer}>
          <button onClick={() => setPhase('cadence')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('review')}
            disabled={message.trim().length < 20}
            style={{
              ...styles.primaryBtnFlex,
              ...(message.trim().length < 20 ? styles.primaryBtnDisabled : {}),
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
      <h2 style={styles.prompt}>Your anchor person.</h2>

      <div style={styles.reviewCard}>
        <p style={styles.reviewLabel}>Person</p>
        <p style={styles.reviewBig}>{name}</p>
        <p style={styles.reviewSmall}>
          {relationshipOptions.find(r => r.id === relationship)?.label}
        </p>
      </div>

      <div style={styles.reviewCard}>
        <p style={styles.reviewLabel}>How and how often</p>
        <p style={styles.reviewItemFlat}>
          {contactMethodOptions.find(o => o.id === contactMethod)?.label}
        </p>
        <p style={styles.reviewItemFlat}>
          {cadenceOptions.find(o => o.id === cadence)?.label}
        </p>
      </div>

      <div style={styles.reviewCard}>
        <p style={styles.reviewLabel}>Your draft message</p>
        <p style={styles.reviewMessage}>{message}</p>
      </div>

      <div style={styles.footer}>
        <button onClick={() => setPhase('message')} style={styles.secondaryBtn}>‹ Back</button>
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
  helper: {
    fontSize: '12px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.5,
    margin: '0.75rem 0 0',
  },
  warningNote: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    background: '#FFF5EE',
    border: '1px solid #E0D5C2',
    borderRadius: '10px',
    padding: '10px 12px',
    margin: '12px 0 0',
    lineHeight: 1.5,
  },
  field: { marginBottom: '1.25rem' },
  fieldLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.5rem',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '0.5px solid #E0D5C2',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    background: '#FDFBF6',
    outline: 'none',
    boxSizing: 'border-box',
  },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  chip: {
    padding: '8px 14px',
    background: 'white',
    border: '0.5px solid #DDCFB6',
    borderRadius: '999px',
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  chipSelected: {
    background: '#854F0B',
    border: '1px solid #854F0B',
    color: '#FAF7F1',
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
  },
  optionCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  textarea: {
    width: '100%',
    padding: '14px',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    background: '#FDFBF6',
    outline: 'none',
    boxSizing: 'border-box',
    lineHeight: 1.65,
    resize: 'vertical',
    minHeight: '180px',
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
    fontSize: '18px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.25rem',
    lineHeight: 1.3,
  },
  reviewSmall: {
    fontSize: '12px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: 0,
  },
  reviewItemFlat: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    margin: '0 0 0.25rem',
  },
  reviewMessage: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: 0,
    whiteSpace: 'pre-wrap',
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