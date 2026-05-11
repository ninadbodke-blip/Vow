import { useState, useEffect } from 'react'

export default function ReadinessRuler({
  existingData,
  onSave,
  saving,
}) {
  const [step, setStep] = useState(0) // 0: slider, 1: followups
  const [readiness, setReadiness] = useState(5)
  const [whyNotLower, setWhyNotLower] = useState('')
  const [whatWouldMoveHigher, setWhatWouldMoveHigher] = useState('')

  useEffect(() => {
    if (existingData) {
      setReadiness(existingData.readiness_score ?? 5)
      setWhyNotLower(existingData.why_not_lower ?? '')
      setWhatWouldMoveHigher(existingData.what_would_move_higher ?? '')
    }
  }, [existingData])

  const handleSave = () => {
    onSave({
      readiness_score: readiness,
      why_not_lower: whyNotLower.trim(),
      what_would_move_higher: whatWouldMoveHigher.trim(),
      recorded_at: new Date().toISOString(),
    })
  }

  const readinessLabel = (() => {
    if (readiness <= 2) return 'Not ready'
    if (readiness <= 4) return 'Still weighing'
    if (readiness <= 6) return 'Considering'
    if (readiness <= 8) return 'Mostly ready'
    return 'Ready'
  })()

  // Conditional logic for which follow-ups to show
  const showWhyNotLower = readiness > 1   // hides at 1 (no lower possible)
  const showWhatWouldMoveHigher = readiness < 10  // hides at 10 (no higher possible)

  // ---- Step 0: Slider ----
  if (step === 0) {
    return (
      <div>
        <h2 style={styles.header}>How ready are you, today?</h2>
        <p style={styles.subtext}>
          1 means not ready at all. 10 means fully ready. Pick the number that feels honest.
        </p>

        <div style={styles.readingsBlock}>
          <div style={styles.readingsNumber}>{readiness}</div>
          <div style={styles.readingsLabel}>{readinessLabel}</div>
        </div>

        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={readiness}
          onChange={(e) => setReadiness(parseInt(e.target.value, 10))}
          style={styles.slider}
        />

        <div style={styles.scaleLabels}>
          <span style={styles.scaleLabel}>1 — Not ready</span>
          <span style={styles.scaleLabel}>10 — Ready</span>
        </div>

        <button onClick={() => setStep(1)} style={{ ...styles.primaryBtn, marginTop: '1.5rem' }}>
          Continue
        </button>
      </div>
    )
  }

  // ---- Step 1: Follow-ups ----
  // Special case: at 1, show only "what would move it higher"
  // At 10, show only "why not lower"
  // Otherwise, show both

  return (
    <div>
      <h2 style={styles.header}>
        {readiness === 1
          ? 'One question.'
          : readiness === 10
            ? 'One question.'
            : 'Two questions.'}
      </h2>
      <p style={styles.subtext}>
        Your readiness is at <strong style={{ color: '#854F0B' }}>{readiness}</strong> ({readinessLabel}).
        {readiness === 1 && ' One follow-up anchors what that number means.'}
        {readiness === 10 && ' One follow-up anchors what that number means.'}
        {readiness > 1 && readiness < 10 && ' Two short follow-ups anchor what that number means.'}
      </p>

      {showWhyNotLower && (
        <div style={styles.followupBlock}>
          <label style={styles.followupLabel}>
            {`Why isn't it lower?`}
          </label>
          <p style={styles.followupHint}>
            {`The number you picked is higher than the lowest you could have picked. What's keeping you above the floor?`}
          </p>
          <textarea
            value={whyNotLower}
            onChange={(e) => setWhyNotLower(e.target.value)}
            placeholder="A short answer is fine..."
            style={styles.textarea}
            rows={4}
          />
        </div>
      )}

      {showWhatWouldMoveHigher && (
        <div style={styles.followupBlock}>
          <label style={styles.followupLabel}>
            What would move it higher?
          </label>
          <p style={styles.followupHint}>
            What would have to change, or become true, for your readiness to go up by 1 or 2 points?
          </p>
          <textarea
            value={whatWouldMoveHigher}
            onChange={(e) => setWhatWouldMoveHigher(e.target.value)}
            placeholder="A short answer is fine..."
            style={styles.textarea}
            rows={4}
          />
        </div>
      )}

      <div style={styles.btnRow}>
        <button onClick={() => setStep(0)} style={styles.secondaryBtn}>
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            ...styles.primaryBtnFlex,
            ...(saving ? styles.saveBtnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Save & continue'}
        </button>
      </div>
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
  readingsBlock: {
    textAlign: 'center',
    padding: '1.5rem 0 1rem',
  },
  readingsNumber: {
    fontSize: '72px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  readingsLabel: {
    fontSize: '14px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    marginTop: '0.5rem',
    textTransform: 'lowercase',
    letterSpacing: '0.06em',
  },
  slider: {
    width: '100%',
    appearance: 'none',
    height: '6px',
    background: 'linear-gradient(90deg, #C5572C 0%, #854F0B 100%)',
    borderRadius: '999px',
    outline: 'none',
    cursor: 'pointer',
  },
  scaleLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.5rem',
  },
  scaleLabel: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  followupBlock: {
    marginBottom: '1.25rem',
  },
  followupLabel: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    display: 'block',
    marginBottom: '4px',
  },
  followupHint: {
    fontSize: '12px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 0.5rem',
    lineHeight: 1.5,
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    background: '#FDFBF6',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: 'inset 0 1px 3px rgba(80,50,20,0.04)',
  },
  btnRow: {
    display: 'flex',
    gap: '10px',
  },
  primaryBtn: {
    width: '100%', padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnFlex: {
    flex: 2, padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  secondaryBtn: {
    flex: 1, padding: '16px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  saveBtnDisabled: {
    background: '#C9B894',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}