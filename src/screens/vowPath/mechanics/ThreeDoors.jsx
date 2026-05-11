import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export default function ThreeDoors({ onSave, saving }) {
  const [step, setStep] = useState(0) // 0: letter view, 1: read instructions, 2: pick a door, 3: confirm
  const [day17Letter, setDay17Letter] = useState(null)
  const [day18Readiness, setDay18Readiness] = useState(null)
  const [loadingLetter, setLoadingLetter] = useState(true)
  const [selectedDoor, setSelectedDoor] = useState(null)
  const [decisionNotes, setDecisionNotes] = useState('')

  useEffect(() => {
    async function loadLetterAndReadiness() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoadingLetter(false)
          return
        }

        // Load the Day 17 letter and unseal it
        const { data: letter } = await supabase
          .from('sealed_letters')
          .select('*')
          .eq('user_id', user.id)
          .eq('letter_key', 'reflect_day_17_letter_from_future_self')
          .maybeSingle()

        if (letter) {
          setDay17Letter(letter)
          // Mark unsealed if not already
          if (letter.is_sealed) {
            await supabase
              .from('sealed_letters')
              .update({
                is_sealed: false,
                unsealed_at: new Date().toISOString(),
              })
              .eq('user_id', user.id)
              .eq('letter_key', 'reflect_day_17_letter_from_future_self')
          }
        }

        // Also load the Day 18 readiness score for context
        const { data: readinessArtifact } = await supabase
          .from('vow_artifacts')
          .select('content')
          .eq('user_id', user.id)
          .eq('artifact_type', 'reflect_day_18_readiness')
          .maybeSingle()

        if (readinessArtifact?.content) {
          setDay18Readiness(readinessArtifact.content.readiness_score)
        }

        setLoadingLetter(false)
      } catch (err) {
        console.error('Failed to load letter:', err)
        setLoadingLetter(false)
      }
    }
    loadLetterAndReadiness()
  }, [])

  const doors = [
    {
      id: 'commit',
      label: 'I am ready to commit.',
      sublabel: 'Begin Commit — the 10-day preparation phase.',
      description: `You have looked honestly. You have decided. The next step is to build what's needed before you start. Commit is for that.`,
    },
    {
      id: 'wait',
      label: 'I need more time.',
      sublabel: 'Wait 30 days. Re-check the Stage Check then.',
      description: `You have looked honestly. You are not yet ready to commit. That is information, not failure. The work of Reflect doesn't expire — when you're ready, you'll know.`,
    },
    {
      id: 'not_for_me',
      label: `This isn't for me, or isn't for me yet.`,
      sublabel: `Close the Vow Path. You can return whenever you want.`,
      description: `You have looked honestly. You have decided that this isn't your path right now. Vow honors that decision. Your work here is preserved.`,
    },
  ]

  const handleSaveDecision = async () => {
    if (!selectedDoor) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Write to reflect_decisions table
      const { error: decisionError } = await supabase
        .from('reflect_decisions')
        .upsert({
          user_id: user.id,
          decision: selectedDoor,
          decision_notes: decisionNotes.trim(),
          readiness_score_at_decision: day18Readiness,
          decided_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

      if (decisionError) {
        console.error('Failed to write decision:', decisionError)
        alert('Could not save your decision. Please try again.')
        return
      }

      // Save the artifact (for day completion tracking)
      onSave({
        decision: selectedDoor,
        decision_notes: decisionNotes.trim(),
        readiness_score_at_decision: day18Readiness,
        decided_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
    }
  }

  if (loadingLetter) {
    return <div style={styles.loadingState}>Loading the letter...</div>
  }

  // ---- Step 0: The Day 17 letter, unsealed ----
  if (step === 0) {
    return (
      <div>
        <h2 style={styles.letterHeader}>
          The letter from your future self.
        </h2>
        <p style={styles.letterSubhead}>
          Sealed four days ago. Unsealed today, by you.
        </p>

        {day17Letter ? (
          <div style={styles.letterCard}>
            <div style={styles.letterTopBar}>
              <span style={styles.letterUnsealedLabel}>UNSEALED TODAY</span>
              <span style={styles.letterDate}>
                Sealed {day17Letter.sealed_at
                  ? new Date(day17Letter.sealed_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : ''}
              </span>
            </div>
            <p style={styles.letterPrompt}>From me, five years from now:</p>
            <div style={styles.letterBody}>
              {day17Letter.letter_text.split('\n').map((line, i) => (
                <p key={i} style={styles.letterLine}>
                  {line || '\u00A0'}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.noLetterCard}>
            <p style={styles.noLetterText}>
              No Day 17 letter was found. If you skipped Day 17, you can still continue.
            </p>
          </div>
        )}

        <button onClick={() => setStep(1)} style={{ ...styles.primaryBtn, marginTop: '1.5rem' }}>
          Continue
        </button>
      </div>
    )
  }

  // ---- Step 1: Three doors intro ----
  if (step === 1) {
    return (
      <div>
        <h2 style={styles.doorsHeader}>The three doors.</h2>

        <div style={styles.intro}>
          <p style={styles.introPara}>
            Below are three doors. Each is a way of honoring what you've looked at over these 21 days.
          </p>
          <p style={styles.introPara}>
            No door is wrong. The work is choosing the one that fits where you actually are, not where you wish you were.
          </p>
          <p style={styles.introPara}>
            Read all three. Then pick.
          </p>
        </div>

        <button onClick={() => setStep(2)} style={styles.primaryBtn}>
          Show me the doors
        </button>
      </div>
    )
  }

  // ---- Step 2: Pick a door ----
  if (step === 2) {
    return (
      <div>
        <h2 style={styles.doorsHeader}>Pick a door.</h2>
        {day18Readiness !== undefined && (
          <p style={styles.readinessHint}>
            Your readiness on Day 18 was <strong style={{ color: '#854F0B' }}>{day18Readiness}/10</strong>.
          </p>
        )}

        <div style={styles.doorList}>
          {doors.map(door => {
            const isSelected = selectedDoor === door.id
            return (
              <button
                key={door.id}
                onClick={() => setSelectedDoor(door.id)}
                style={{
                  ...styles.doorBtn,
                  ...(isSelected ? styles.doorBtnSelected : {}),
                }}
              >
                <p style={styles.doorLabel}>{door.label}</p>
                <p style={styles.doorSublabel}>{door.sublabel}</p>
                {isSelected && (
                  <p style={styles.doorDescription}>{door.description}</p>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setStep(3)}
          disabled={!selectedDoor}
          style={{
            ...styles.primaryBtn,
            ...(!selectedDoor ? styles.primaryBtnDisabled : {}),
            marginTop: '1rem',
          }}
        >
          Continue with this door
        </button>
      </div>
    )
  }

  // ---- Step 3: Confirm ----
  if (step === 3) {
    const chosenDoor = doors.find(d => d.id === selectedDoor)

    return (
      <div>
        <h2 style={styles.confirmHeader}>You picked:</h2>
        <div style={styles.confirmCard}>
          <p style={styles.confirmDoorLabel}>{chosenDoor.label}</p>
          <p style={styles.confirmDoorSublabel}>{chosenDoor.sublabel}</p>
          <div style={styles.confirmDivider}></div>
          <p style={styles.confirmDescription}>{chosenDoor.description}</p>
        </div>

        <div style={styles.notesBlock}>
          <label style={styles.notesLabel}>
            Anything you want to write to yourself, before this is locked in?
          </label>
          <p style={styles.notesHint}>
            Optional. A note from this version of you, to whoever returns here later.
          </p>
          <textarea
            value={decisionNotes}
            onChange={(e) => setDecisionNotes(e.target.value)}
            placeholder="A few sentences..."
            style={styles.notesTextarea}
            rows={4}
          />
        </div>

        <div style={styles.btnRow}>
          <button onClick={() => setStep(2)} style={styles.secondaryBtn}>
            Back
          </button>
          <button
            onClick={handleSaveDecision}
            disabled={saving}
            style={{
              ...styles.primaryBtnFlex,
              ...(saving ? styles.primaryBtnDisabled : {}),
            }}
          >
            {saving ? 'Saving...' : 'Lock it in'}
          </button>
        </div>
      </div>
    )
  }

  return null
}

const styles = {
  loadingState: {
    textAlign: 'center',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    padding: '2rem',
  },
  letterHeader: {
    fontSize: '22px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 0.4rem',
    textAlign: 'center',
  },
  letterSubhead: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0 0 1.5rem',
  },
  letterCard: {
    background: 'linear-gradient(180deg, #FFFEF8 0%, #FDFBF6 100%)',
    border: '1px solid #C5572C',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 4px 14px rgba(197,87,44,0.12)',
  },
  letterTopBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.85rem',
  },
  letterUnsealedLabel: {
    fontSize: '10px',
    color: '#C5572C',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 600,
  },
  letterDate: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  letterPrompt: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 0.85rem',
  },
  letterBody: {
    paddingTop: '0.5rem',
    borderTop: '0.5px solid #EFE7D7',
  },
  letterLine: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.75,
    margin: '0 0 0.5rem',
  },
  noLetterCard: {
    background: '#FDFBF6',
    border: '0.5px dashed #DDCFB6',
    borderRadius: '14px',
    padding: '1.5rem 1.25rem',
    textAlign: 'center',
  },
  noLetterText: {
    fontSize: '13px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  doorsHeader: {
    fontSize: '24px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 1rem',
    textAlign: 'center',
  },
  readinessHint: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0 0 1.5rem',
  },
  intro: {
    marginBottom: '1.5rem',
  },
  introPara: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.75,
    margin: '0 0 1rem',
  },
  doorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '0.5rem',
  },
  doorBtn: {
    width: '100%',
    padding: '18px 20px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '16px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
    boxShadow: '0 2px 8px rgba(80,50,20,0.04)',
  },
  doorBtnSelected: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 4px 16px rgba(197,87,44,0.15)',
  },
  doorLabel: {
    fontSize: '17px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 4px',
    lineHeight: 1.3,
  },
  doorSublabel: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  doorDescription: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0.85rem 0 0',
    paddingTop: '0.85rem',
    borderTop: '0.5px solid #DDCFB6',
  },
  confirmHeader: {
    fontSize: '18px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontWeight: 500,
    margin: '0 0 1rem',
    textAlign: 'center',
  },
  confirmCard: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '1px solid #C5572C',
    borderRadius: '16px',
    padding: '1.25rem 1.25rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 16px rgba(197,87,44,0.15)',
  },
  confirmDoorLabel: {
    fontSize: '20px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 4px',
    lineHeight: 1.3,
  },
  confirmDoorSublabel: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  confirmDivider: {
    height: '0.5px',
    background: '#C5572C',
    opacity: 0.3,
    margin: '0.85rem 0',
  },
  confirmDescription: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.7,
    margin: 0,
  },
  notesBlock: {
    marginBottom: '1.25rem',
  },
  notesLabel: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    display: 'block',
    marginBottom: '4px',
  },
  notesHint: {
    fontSize: '12px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 0.5rem',
    lineHeight: 1.5,
  },
  notesTextarea: {
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
  primaryBtnDisabled: {
    background: '#C9B894',
    boxShadow: 'none',
    cursor: 'not-allowed',
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
}