import { useState } from 'react'

export default function PhaseClose({ data, onSave, saving }) {
  const {
    phaseNumber,
    phaseName,
    summaryItems,
    landingPrompt,
    landingOptions,
    nextPhasePreview,
  } = data

  // Phases: 'summary' -> 'landing' -> 'preview'
  const [phase, setPhase] = useState('summary')
  const [landing, setLanding] = useState(null)

  const finalize = () => {
    onSave({
      phase_number: phaseNumber,
      phase_name: phaseName,
      landing_tap: landing,
      closed_at: new Date().toISOString(),
    })
  }

  // ===================================================================
  // PHASE: SUMMARY
  // ===================================================================
  if (phase === 'summary') {
    return (
      <div style={styles.container}>
        <p style={styles.eyebrow}>Phase {phaseNumber}, close</p>
        <h2 style={styles.phaseTitle}>{phaseName}</h2>
        <p style={styles.subtext}>A brief look at what the phase covered.</p>

        <div style={styles.summaryList}>
          {summaryItems.map(item => (
            <div key={item.day} style={styles.summaryCard}>
              <div style={styles.dayPill}>
                <span style={styles.dayPillText}>Day {item.day}</span>
              </div>
              <div style={styles.summaryContent}>
                <p style={styles.summaryLabel}>{item.label}</p>
                <p style={styles.summarySublabel}>{item.sublabel}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('landing')} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: LANDING
  // ===================================================================
  if (phase === 'landing') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{landingPrompt}</h2>
        <p style={styles.subtext}>One tap. No right answer.</p>

        <div style={styles.optionList}>
          {landingOptions.map(opt => {
            const selected = landing === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setLanding(opt.id)}
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
          <button onClick={() => setPhase('summary')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('preview')}
            disabled={!landing}
            style={{
              ...styles.primaryBtnFlex,
              ...(!landing ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: PREVIEW
  // ===================================================================
  return (
    <div style={styles.container}>
      <p style={styles.eyebrow}>Next</p>
      <h2 style={styles.phaseTitle}>What comes after</h2>

      <div style={styles.previewCard}>
        <p style={styles.previewText}>{nextPhasePreview}</p>
      </div>

      <div style={styles.footer}>
        <button onClick={() => setPhase('landing')} style={styles.secondaryBtn}>‹ Back</button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Close the phase'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { paddingTop: '0.5rem' },
  eyebrow: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.18em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.6rem',
  },
  phaseTitle: {
    fontSize: '26px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.25,
    margin: '0 0 1rem',
  },
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
  summaryList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  summaryCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    padding: '12px 14px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  dayPill: {
    background: '#F4ECDD',
    border: '0.5px solid #E0D5C2',
    borderRadius: '999px',
    padding: '4px 10px',
    flexShrink: 0,
  },
  dayPillText: {
    fontSize: '10px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  summaryContent: { flex: 1 },
  summaryLabel: {
    fontSize: '13.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 2px',
    lineHeight: 1.4,
  },
  summarySublabel: {
    fontSize: '11.5px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.4,
  },
  optionList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  optionCard: {
    padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    fontSize: '14px', color: '#2A1F15',
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
  previewCard: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '16px',
    padding: '18px',
    marginBottom: '1rem',
  },
  previewText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.7,
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