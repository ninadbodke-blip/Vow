import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { transitionFromReflect } from '../utils/stageTransitions'

export default function ThreeDoors({ data, onSave, saving }) {
  const navigate = useNavigate()
  const { prompt, subtext, doors } = data

  const [phase, setPhase] = useState('tap')
  const [selectedDoor, setSelectedDoor] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const [error, setError] = useState(null)

  const tapDoor = (door) => {
    setSelectedDoor(door)
    setPhase('confirm')
  }

  const confirmDoor = async () => {
    setTransitioning(true)
    setError(null)

    await onSave({
      door_id: selectedDoor.id,
      door_label: selectedDoor.label,
      decided_at: new Date().toISOString(),
    })

    const result = await transitionFromReflect({ doorChoice: selectedDoor.id })

    if (result.error) {
      setError(result.error)
      setTransitioning(false)
      return
    }

    if (result.nextStage === 'commit') {
      navigate('/vow-path/transition/reflect/to/commit')
    } else if (result.nextStage === 'endure') {
      navigate('/vow-path/transition/reflect/to/endure')
    } else {
      navigate('/home')
    }
  }

  if (phase === 'tap') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{prompt}</h2>
        <p style={styles.subtext}>{subtext}</p>

        <div style={styles.doorsList}>
          {doors.map(door => (
            <button key={door.id} onClick={() => tapDoor(door)} style={styles.doorCard}>
              <div style={styles.doorContent}>
                <p style={styles.doorLabel}>{door.label}</p>
                {door.description && (
                  <p style={styles.doorDescription}>{door.description}</p>
                )}
              </div>
              <div style={styles.doorChevron}>›</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <p style={styles.confirmEyebrow}>You chose:</p>
      <h2 style={styles.confirmTitle}>{selectedDoor.label}</h2>

      {selectedDoor.confirmText && (
        <div style={styles.confirmBody}>
          <p style={styles.confirmBodyText}>{selectedDoor.confirmText}</p>
        </div>
      )}

      {error && <p style={styles.errorText}>{error}</p>}

      <div style={styles.footer}>
        <button
          onClick={() => { setSelectedDoor(null); setPhase('tap') }}
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
          {transitioning ? 'Walking through...' : 'Walk through this door'}
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
    lineHeight: 1.3, margin: '0 0 0.5rem',
  },
  subtext: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.55, margin: '0 0 1.5rem',
  },
  doorsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  doorCard: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', padding: '18px 18px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '16px',
    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
    gap: '12px', transition: 'all 0.15s',
    boxShadow: '0 2px 8px rgba(80,50,20,0.04)',
  },
  doorContent: { flex: 1, minWidth: 0 },
  doorLabel: {
    fontSize: '15px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    margin: '0 0 4px', lineHeight: 1.35,
  },
  doorDescription: {
    fontSize: '12.5px', color: '#854F0B',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: 0, lineHeight: 1.4,
  },
  doorChevron: {
    fontSize: '24px', color: '#854F0B', fontWeight: 500,
    flexShrink: 0,
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