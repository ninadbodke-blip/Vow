import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { transitionFromNotice } from '../utils/stageTransitions'

export default function ThreeDoorsNotice({ data, onSave, saving }) {
  const navigate = useNavigate()
  const { landingPrompt, landingOptions, doors } = data

  // Phases: 'landing' -> 'doors' -> 'confirm'
  const [phase, setPhase] = useState('landing')
  const [landingChoice, setLandingChoice] = useState(null)
  const [selectedDoor, setSelectedDoor] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const [error, setError] = useState(null)

  const pickLanding = (option) => {
    setLandingChoice(option)
    setPhase('doors')
  }

  const tapDoor = (door) => {
    setSelectedDoor(door)
    setPhase('confirm')
  }

  const confirmDoor = async () => {
    setTransitioning(true)
    setError(null)

    // Save the artifact (records landing choice + door choice)
    await onSave({
      landing_choice_id: landingChoice?.id,
      landing_choice_label: landingChoice?.label,
      door_id: selectedDoor.id,
      door_title: selectedDoor.title,
      decided_at: new Date().toISOString(),
    })

    const result = await transitionFromNotice({ doorChoice: selectedDoor.id })

    if (result.error) {
      setError(result.error)
      setTransitioning(false)
      return
    }

    if (result.nextStage === 'reflect') {
      navigate('/app/vow-path/transition/notice/to/reflect')
    } else if (result.action === 'wait_30_days' || result.action === 'closed_permanently') {
      navigate('/app/home')
    } else {
      navigate('/app/home')
    }
  }

  // ====================================================================
  // PHASE: LANDING
  // ====================================================================
  if (phase === 'landing') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{landingPrompt}</h2>

        <div style={styles.landingList}>
          {landingOptions.map(option => (
            <button
              key={option.id}
              onClick={() => pickLanding(option)}
              style={styles.landingCard}
            >
              <p style={styles.landingLabel}>{option.label}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ====================================================================
  // PHASE: DOORS
  // ====================================================================
  if (phase === 'doors') {
    return (
      <div style={styles.container}>
        <p style={styles.doorsEyebrow}>Three doors stand in front of you.</p>
        <p style={styles.doorsSubtext}>
          No right one. Each is fully respected.
        </p>

        <div style={styles.doorsList}>
          {doors.map(door => (
            <button
              key={door.id}
              onClick={() => tapDoor(door)}
              style={styles.doorCard}
            >
              <div style={styles.doorNumber}>{door.number}</div>
              <div style={styles.doorContent}>
                <p style={styles.doorTitle}>{door.title}</p>
                {door.description && (
                  <p style={styles.doorDescription}>{door.description}</p>
                )}
              </div>
              <div style={styles.doorChevron}>›</div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setPhase('landing')}
          style={styles.backLink}
        >
          ‹ Back
        </button>
      </div>
    )
  }

  // ====================================================================
  // PHASE: CONFIRM
  // ====================================================================
  return (
    <div style={styles.container}>
      <p style={styles.confirmEyebrow}>You chose Door {selectedDoor.number}.</p>
      <h2 style={styles.confirmTitle}>{selectedDoor.confirmTitle}</h2>

      {selectedDoor.confirmBody && (
        <div style={styles.confirmBody}>
          <p style={styles.confirmBodyText}>{selectedDoor.confirmBody}</p>
        </div>
      )}

      {error && <p style={styles.errorText}>{error}</p>}

      <div style={styles.footer}>
        <button
          onClick={() => { setSelectedDoor(null); setPhase('doors') }}
          style={styles.secondaryBtn}
          disabled={transitioning}
        >
          ‹ Change
        </button>
        <button
          onClick={confirmDoor}
          disabled={transitioning || saving}
          style={{
            ...styles.primaryBtnFlex,
            ...((transitioning || saving) ? styles.primaryBtnDisabled : {}),
          }}
        >
          {transitioning ? 'Walking through...' : (selectedDoor.confirmButton || 'Confirm')}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { paddingTop: '0.5rem' },
  prompt: {
    fontSize: '22px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 1.5rem',
  },
  landingList: {
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  landingCard: {
    width: '100%', padding: '16px 18px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
    transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  landingLabel: {
    fontSize: '15px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 400,
    margin: 0, lineHeight: 1.4,
  },
  doorsEyebrow: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    margin: '0 0 0.5rem', lineHeight: 1.3,
  },
  doorsSubtext: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 1.5rem', lineHeight: 1.55,
  },
  doorsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  doorCard: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    width: '100%', padding: '16px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '16px',
    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
    gap: '12px', transition: 'all 0.15s',
    boxShadow: '0 2px 8px rgba(80,50,20,0.04)',
  },
  doorNumber: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontSize: '14px', fontWeight: 500,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: '2px',
  },
  doorContent: { flex: 1, minWidth: 0 },
  doorTitle: {
    fontSize: '15px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    margin: '0 0 4px', lineHeight: 1.35,
  },
  doorDescription: {
    fontSize: '12.5px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: 0, lineHeight: 1.5,
  },
  doorChevron: {
    fontSize: '22px', color: '#854F0B', fontWeight: 500,
    flexShrink: 0, alignSelf: 'center',
  },
  backLink: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '12px',
    fontStyle: 'italic', fontFamily: 'Georgia, serif',
    cursor: 'pointer', padding: '12px 0',
    marginTop: '1rem',
  },
  confirmEyebrow: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.18em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.85rem',
  },
  confirmTitle: {
    fontSize: '24px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 1.25rem',
  },
  confirmBody: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '1.25rem',
  },
  confirmBodyText: {
    fontSize: '14px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.65, margin: 0,
  },
  errorText: {
    fontSize: '12px', color: '#A14222',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 1rem', textAlign: 'center',
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