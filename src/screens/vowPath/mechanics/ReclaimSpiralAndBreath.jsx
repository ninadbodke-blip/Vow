import { useState, useRef } from 'react'
import ReclaimSpiralTrace from './ReclaimSpiralTrace'
import ReclaimBreathCircle from './ReclaimBreathCircle'

function determineInitialStage(existingData) {
  if (existingData?.spiral && existingData?.breath) return 'review'
  if (existingData?.spiral && !existingData?.breath) return 'breath'
  return 'spiral'
}

export default function ReclaimSpiralAndBreath({ existingData, onSave, saving }) {
  const [stage, setStage] = useState(() => determineInitialStage(existingData))
  const [spiralData, setSpiralData] = useState(existingData?.spiral || null)
  const startTimeRef = useRef(Date.now())

  const handleSpiralComplete = (data) => {
    setSpiralData(data)
    // Brief pause so user sees the completed spiral before transition
    setTimeout(() => setStage('breath'), 800)
  }

  const handleBreathComplete = (breathData) => {
    onSave({
      spiral: spiralData,
      breath: breathData,
      timestamp_started: new Date(startTimeRef.current).toISOString(),
      timestamp_completed: new Date().toISOString(),
      total_duration_ms: Date.now() - startTimeRef.current,
    })
  }

  const handleReviewContinue = () => {
    // Re-save the existing data to advance to the closing step
    onSave(existingData)
  }

  if (stage === 'review') {
    return (
      <div style={styles.container}>
        <div style={styles.reviewBox}>
          <p style={styles.reviewLabel}>Day 1 · Completed</p>
          <p style={styles.reviewBody}>
            You traced the spiral. You took the three breaths. The work
            for Day 1 is already done.
          </p>
          {existingData?.spiral?.trace_completeness != null && (
            <p style={styles.reviewMeta}>
              Trace · {existingData.spiral.trace_completeness}% &nbsp;·&nbsp;
              Breaths · {existingData.breath?.cycles_completed || 0} of 3
            </p>
          )}
        </div>
        <button
          onClick={handleReviewContinue}
          disabled={saving}
          style={{
            ...styles.continueBtn,
            ...(saving ? styles.continueBtnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    )
  }

  if (stage === 'spiral') {
    return (
      <div style={styles.container}>
        <p style={styles.stepLabel}>Act 1 · The trace</p>
        <ReclaimSpiralTrace onComplete={handleSpiralComplete} />
      </div>
    )
  }

  if (stage === 'breath') {
    return (
      <div style={styles.container}>
        <p style={styles.stepLabel}>Act 2 · The breath</p>
        <ReclaimBreathCircle onComplete={handleBreathComplete} saving={saving} />
      </div>
    )
  }

  return null
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    paddingBottom: '1rem',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    margin: '0 0 0.25rem',
    alignSelf: 'flex-start',
  },
  reviewBox: {
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '16px',
    padding: '1.5rem 1.25rem',
    textAlign: 'center',
    width: '100%',
  },
  reviewLabel: {
    fontSize: '10px',
    color: '#3B6D11',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    margin: '0 0 1rem',
  },
  reviewBody: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1rem',
  },
  reviewMeta: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    letterSpacing: '0.04em',
  },
  continueBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  continueBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}