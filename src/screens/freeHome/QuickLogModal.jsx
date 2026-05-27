import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import SheetPortal from '../../components/SheetPortal'

// ===================================================================
// QUICK LOG MODAL
// ===================================================================
// Universal logger for the free tier. Used by Notice-free and Reflect-free.
// 3-step chip selection: time of day / context / feeling after.
// Auto-advances on each tap. Submits on final tap. ~20 seconds end-to-end.
// ===================================================================

const TIME_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'late_night', label: 'Late night' },
]

const CONTEXT_OPTIONS = [
  { value: 'alone', label: 'Alone' },
  { value: 'with_friends', label: 'With friends' },
  { value: 'with_family', label: 'With family' },
  { value: 'with_partner', label: 'With partner' },
  { value: 'at_work', label: 'At work' },
  { value: 'other', label: 'Other' },
]

const FEELING_OPTIONS = [
  { value: 'numb', label: 'Numb' },
  { value: 'regret', label: 'Regret' },
  { value: 'relief', label: 'Relief' },
  { value: 'indifferent', label: 'Indifferent' },
  { value: 'tired', label: 'Tired' },
  { value: 'other', label: 'Other' },
]

const STEP_META = {
  1: { eyebrow: 'Step 1 of 3', question: 'When did it come up?' },
  2: { eyebrow: 'Step 2 of 3', question: 'Who was around?' },
  3: { eyebrow: 'Step 3 of 3', question: 'How did you feel after?' },
}

export default function QuickLogModal({ isOpen, onClose, onLogged }) {
  const [step, setStep] = useState(1)
  const [timeOfDay, setTimeOfDay] = useState(null)
  const [contextValue, setContextValue] = useState(null)
  const [saving, setSaving] = useState(false)

  // Reset whenever the modal reopens
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setTimeOfDay(null)
      setContextValue(null)
      setSaving(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleStep1Tap = (value) => {
    setTimeOfDay(value)
    setStep(2)
  }

  const handleStep2Tap = (value) => {
    setContextValue(value)
    setStep(3)
  }

  const handleStep3Tap = async (feelingValue) => {
    if (saving) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: newLog, error } = await supabase
        .from('free_instance_logs')
        .insert({
          user_id: user.id,
          time_of_day: timeOfDay,
          context: contextValue,
          feeling_after: feelingValue,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to save log:', error)
        alert('Could not save. Please try again.')
        setSaving(false)
        return
      }

      if (onLogged) onLogged(newLog)
      onClose()
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const meta = STEP_META[step]
  const currentOptions =
    step === 1 ? TIME_OPTIONS
    : step === 2 ? CONTEXT_OPTIONS
    : FEELING_OPTIONS
  const handleTap =
    step === 1 ? handleStep1Tap
    : step === 2 ? handleStep2Tap
    : handleStep3Tap

  return (
    <SheetPortal><div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div style={styles.header}>
          {step > 1 ? (
            <button onClick={handleBack} style={styles.backBtn} disabled={saving}>
              ‹ Back
            </button>
          ) : (
            <div style={styles.headerSpacer} />
          )}
          <div style={styles.stepDots}>
            {[1, 2, 3].map(n => (
              <div
                key={n}
                style={{
                  ...styles.stepDot,
                  ...(n === step ? styles.stepDotActive : {}),
                  ...(n < step ? styles.stepDotDone : {}),
                }}
              />
            ))}
          </div>
          <button onClick={onClose} style={styles.closeBtn} disabled={saving}>
            ×
          </button>
        </div>

        {/* QUESTION */}
        <p style={styles.eyebrow}>{meta.eyebrow}</p>
        <h2 style={styles.question}>{meta.question}</h2>

        {/* CHIPS */}
        <div style={styles.optionsGrid}>
          {currentOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleTap(opt.value)}
              disabled={saving}
              style={{
                ...styles.optionChip,
                ...(saving ? styles.optionChipFading : {}),
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* HELPER */}
        <p style={styles.helper}>
          {saving ? 'Saving...' : 'No right answer. What\'s true.'}
        </p>

      </div>
    </div></SheetPortal>
  )
}

// ===================================================================
// STYLES
// ===================================================================
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(40,25,15,0.55)',
    backdropFilter: 'blur(4px)',
    zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: '#FAF7F1',
    maxWidth: '400px',
    width: '100%',
    borderRadius: '20px',
    padding: '1.5rem 1.5rem 1.25rem',
    boxShadow: '0 20px 60px rgba(40,25,15,0.3)',
  },

  // HEADER
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: '#854F0B',
    fontSize: '13px',
    fontStyle: 'italic',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    padding: '4px 0',
    minWidth: '50px',
    textAlign: 'left',
  },
  headerSpacer: {
    minWidth: '50px',
  },
  stepDots: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  stepDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#E0D5C2',
    transition: 'all 0.2s',
  },
  stepDotActive: {
    background: '#854F0B',
    width: '20px',
    borderRadius: '3px',
  },
  stepDotDone: {
    background: '#C2D49A',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#9C8C78',
    fontSize: '22px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '0 4px',
    minWidth: '50px',
    textAlign: 'right',
    lineHeight: 1,
  },

  // QUESTION
  eyebrow: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.24em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
    textAlign: 'center',
  },
  question: {
    fontSize: '20px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 18px',
    textAlign: 'center',
  },

  // CHIPS
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    marginBottom: '14px',
  },
  optionChip: {
    padding: '14px 10px',
    background: 'white',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
    lineHeight: 1.4,
  },
  optionChipFading: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  // HELPER
  helper: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: 0,
  },
}