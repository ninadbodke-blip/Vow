import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { getReflectDay, REFLECT_TOTAL_DAYS } from './data/reflectContent'

// Step keys for the multi-step flow
const STEP = {
  ARRIVAL: 'arrival',
  AUDIO: 'audio',
  READING: 'reading',
  PROMPT: 'prompt',
  POST_SAVE: 'post_save',
  CLOSING: 'closing',
}

// Letter days where the prompt is presented as a letter, not a journal
const LETTER_DAYS = new Set([8, 9, 25, 26])

export default function ReflectDay() {
  const navigate = useNavigate()
  const { stageSlug, dayNumber: dayNumberParam } = useParams()

  const dayNumber = parseInt(dayNumberParam, 10)
  const dayContent = getReflectDay(dayNumber)

  const [step, setStep] = useState(STEP.ARRIVAL)
  const [progress, setProgress] = useState(null)
  const [accessLoading, setAccessLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [accessReason, setAccessReason] = useState('')

  const [journalText, setJournalText] = useState('')
  const [existingEntry, setExistingEntry] = useState(null)
  const [saving, setSaving] = useState(false)

  // Audio player state
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)

  // ---- Validation: does this day exist? Does the user have access? ----
  useEffect(() => {
    async function checkAccess() {
      if (stageSlug !== 'reflect') {
        setAccessDenied(true)
        setAccessReason('This stage is not available.')
        setAccessLoading(false)
        return
      }
      if (!dayContent) {
        setAccessDenied(true)
        setAccessReason('That day does not exist.')
        setAccessLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/welcome')
        return
      }

      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!progressRow || progressRow.current_stage !== 'reflect') {
        setAccessDenied(true)
        setAccessReason('You have not started Reflect yet.')
        setAccessLoading(false)
        return
      }

      setProgress(progressRow)

      // Check if this day is unlocked
      const unlocked = isDayUnlocked(progressRow, dayNumber)
      if (!unlocked.allowed) {
        setAccessDenied(true)
        setAccessReason(unlocked.reason)
        setAccessLoading(false)
        return
      }

      // Load any existing journal entry for this day (so user can re-read)
      const { data: entry } = await supabase
        .from('daily_journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('stage', 'reflect')
        .eq('day_number', dayNumber)
        .maybeSingle()

      if (entry) {
        setExistingEntry(entry)
        setJournalText(entry.response_text)
      }

      setAccessLoading(false)
    }
    checkAccess()
  }, [stageSlug, dayNumber, dayContent, navigate])

  // ---- Day-cadence lock logic ----
  function isDayUnlocked(progressRow, requestedDay) {
    // Dev bypass — local development
    if (import.meta.env.DEV) {
      return { allowed: true }
    }
    // Pilot mode bypass — manual flag in DB
    if (progressRow?.is_pilot_mode) {
      return { allowed: true }
    }

    const lastCompleted = progressRow.last_completed_day || 0

    // Day 1 is always allowed
    if (requestedDay === 1) {
      return { allowed: true }
    }

    // Re-reading a completed day is always allowed
    if (requestedDay <= lastCompleted) {
      return { allowed: true }
    }

    // Forward progress: only the immediate next day is allowed
    if (requestedDay !== lastCompleted + 1) {
      return {
        allowed: false,
        reason: `Day ${lastCompleted + 1} is your next day. Day ${requestedDay} unlocks after that.`,
      }
    }

    // The next day is allowed only if 24h have passed since the last completion
    if (progressRow.last_completed_at) {
      const lastTime = new Date(progressRow.last_completed_at).getTime()
      const now = Date.now()
      const hoursSince = (now - lastTime) / (1000 * 60 * 60)
      if (hoursSince < 24) {
        const hoursLeft = Math.ceil(24 - hoursSince)
        return {
          allowed: false,
          reason: `Day ${requestedDay} unlocks in about ${hoursLeft} ${hoursLeft === 1 ? 'hour' : 'hours'}. The work is meant to be done one day at a time.`,
        }
      }
    }

    return { allowed: true }
  }

  // ---- Step navigation ----
  const buildStepSequence = () => {
    const seq = [STEP.ARRIVAL]
    if (dayContent?.founderAudio) seq.push(STEP.AUDIO)
    if (dayContent?.readingParagraphs?.length > 0) seq.push(STEP.READING)
    seq.push(STEP.PROMPT)
    seq.push(STEP.POST_SAVE)
    seq.push(STEP.CLOSING)
    return seq
  }

  const advance = () => {
    // Pause audio if playing when leaving the audio screen
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
    const sequence = buildStepSequence()
    const idx = sequence.indexOf(step)
    if (idx >= 0 && idx < sequence.length - 1) {
      setStep(sequence[idx + 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goBack = () => {
    // Pause audio if playing when leaving the audio screen
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
    const sequence = buildStepSequence()
    const idx = sequence.indexOf(step)

    // From the very first step, back goes to home
    if (idx === 0) {
      navigate('/home')
      return
    }

    // From post-save and closing, back goes to home — these are after-save states,
    // there's no useful back behavior into the saved-prompt screen
    if (step === STEP.POST_SAVE || step === STEP.CLOSING) {
      navigate('/home')
      return
    }

    // Otherwise step backwards in the sequence
    if (idx > 0) {
      setStep(sequence[idx - 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // ---- Save journal entry + mark day complete ----
  const handleSave = async () => {
    if (!journalText.trim()) return

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/welcome'); return }

      // Upsert the journal entry
      const { error: journalError } = await supabase
        .from('daily_journal_entries')
        .upsert({
          user_id: user.id,
          stage: 'reflect',
          day_number: dayNumber,
          prompt_key: `reflect_day_${String(dayNumber).padStart(2, '0')}`,
          response_text: journalText.trim(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,stage,day_number' })

      if (journalError) {
        console.error('Failed to save journal:', journalError)
        alert('Could not save your entry. Please try again.')
        setSaving(false)
        return
      }

      // Update progress only if this is the latest day
      const wasLatestDay =
        dayNumber > (progress?.last_completed_day || 0)

      if (wasLatestDay) {
        const { error: progressError } = await supabase
          .from('vow_path_progress')
          .update({
            last_completed_day: dayNumber,
            last_completed_at: new Date().toISOString(),
            current_day: Math.min(dayNumber + 1, REFLECT_TOTAL_DAYS),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)

        if (progressError) {
          console.error('Failed to update progress:', progressError)
          // Non-fatal — journal saved, progress tracking failed
        }
      }

      setSaving(false)
      advance()
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const handleClose = () => {
    navigate('/home')
  }

  // Compute the back button label based on current step
  const getBackLabel = () => {
    const sequence = buildStepSequence()
    const idx = sequence.indexOf(step)
    if (idx === 0 || step === STEP.POST_SAVE || step === STEP.CLOSING) {
      return '‹ Home'
    }
    return '‹ Back'
  }

  // ---- Render states ----

  if (accessLoading) {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, textAlign: 'center', color: '#9C8C78', paddingTop: '4rem' }}>
          Loading...
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.header}>
            <button onClick={() => navigate('/home')} style={styles.backBtn}>‹ Back to home</button>
            <div style={{ width: '40px' }}></div>
            <div style={{ width: '40px' }}></div>
          </div>
          <div style={styles.lockedBlock}>
            <div style={styles.lockedIcon}>⏳</div>
            <p style={styles.lockedTitle}>Not yet.</p>
            <p style={styles.lockedReason}>{accessReason}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!dayContent) return null

  const isLetter = LETTER_DAYS.has(dayNumber)

  // ---- ARRIVAL ----
  if (step === STEP.ARRIVAL) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.header}>
            <button onClick={goBack} style={styles.backBtn}>{getBackLabel()}</button>
            <p style={styles.headerTitle}>&nbsp;</p>
            <div style={{ width: '40px' }}></div>
          </div>
          <div style={styles.arrivalContent}>
            <div style={styles.dayLabel}>Day {dayNumber}</div>
            <h1 style={styles.arrivalTitle}>{dayContent.arrivalTitle}</h1>
            {dayContent.arrivalSubtitle && (
              <p style={styles.arrivalSubtitle}>{dayContent.arrivalSubtitle}</p>
            )}
            <button onClick={advance} style={{ ...styles.primaryBtn, marginTop: '2.5rem' }}>
              Begin
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- FOUNDER AUDIO ----
  if (step === STEP.AUDIO && dayContent.founderAudio) {
    const togglePlay = () => {
      if (!audioRef.current) return
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true)
          setAudioError(false)
        }).catch(() => {
          setAudioError(true)
        })
      }
    }

    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.header}>
            <button onClick={goBack} style={styles.backBtn}>{getBackLabel()}</button>
            <p style={styles.headerTitle}>Day {dayNumber}</p>
            <div style={{ width: '40px' }}></div>
          </div>

          <div style={styles.audioCard}>
            <div style={styles.audioLabel}>A note from Ninad</div>

            <button
              onClick={togglePlay}
              style={styles.audioPlayBtn}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <span style={styles.audioPlayIcon}>
                {isPlaying ? '❚❚' : '▶'}
              </span>
            </button>

            <p style={styles.audioCaption}>
              {audioError
                ? 'Audio not yet available. Read the script below.'
                : (isPlaying ? 'Playing...' : 'Tap to play')}
            </p>

            <audio
              ref={audioRef}
              src={dayContent.founderAudio.audioSrc}
              onEnded={() => setIsPlaying(false)}
              onError={() => setAudioError(true)}
              preload="none"
              style={{ display: 'none' }}
            />
          </div>

          <details style={styles.transcriptDetails}>
            <summary style={styles.transcriptSummary}>Read the script</summary>
            <div style={styles.transcriptBody}>
              {dayContent.founderAudio.script.split('\n\n').map((para, i) => (
                <p key={i} style={styles.transcriptPara}>{para}</p>
              ))}
            </div>
          </details>

          <button onClick={advance} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ---- READING ----
  if (step === STEP.READING) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.header}>
            <button onClick={goBack} style={styles.backBtn}>{getBackLabel()}</button>
            <p style={styles.headerTitle}>Day {dayNumber}</p>
            <div style={{ width: '40px' }}></div>
          </div>

          <div style={styles.readingBlock}>
            {dayContent.readingParagraphs.map((para, i) => (
              <p key={i} style={styles.readingPara}>{para}</p>
            ))}
          </div>

          <button onClick={advance} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ---- PROMPT (journal or letter) ----
  if (step === STEP.PROMPT) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.header}>
            <button onClick={goBack} style={styles.backBtn}>{getBackLabel()}</button>
            <p style={styles.headerTitle}>Day {dayNumber}</p>
            <div style={{ width: '40px' }}></div>
          </div>

          <div style={styles.promptBlock}>
            <h2 style={styles.promptQuestion}>{dayContent.promptQuestion}</h2>
            {dayContent.promptSubtext && (
              <div style={styles.promptSubtextWrap}>
                {dayContent.promptSubtext.split('\n\n').map((para, i) => (
                  <p key={i} style={styles.promptSubtextPara}>{para}</p>
                ))}
              </div>
            )}
          </div>

          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder={isLetter ? 'Begin writing your letter...' : 'Write here...'}
            style={{
              ...styles.textarea,
              ...(isLetter ? styles.textareaLetter : {}),
            }}
            rows={isLetter ? 14 : 10}
          />

          <p style={styles.charCount}>
            {journalText.length} character{journalText.length === 1 ? '' : 's'}
            {existingEntry && ' • Editing previous entry'}
          </p>

          <button
            onClick={handleSave}
            disabled={!journalText.trim() || saving}
            style={{
              ...styles.primaryBtn,
              ...(!journalText.trim() || saving ? styles.primaryBtnDisabled : {}),
            }}
          >
            {saving ? 'Saving...' : (isLetter ? 'Seal letter' : 'Save')}
          </button>
        </div>
      </div>
    )
  }

  // ---- POST-SAVE CONFIRMATION ----
  if (step === STEP.POST_SAVE) {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, ...styles.centeredPhone }}>
          <div style={styles.savedIcon}>✓</div>
          <p style={styles.savedMessage}>{dayContent.postSaveMessage}</p>
          <button onClick={advance} style={{ ...styles.primaryBtn, marginTop: '2rem' }}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ---- CLOSING ----
  if (step === STEP.CLOSING) {
    const isFinalDay = dayNumber === REFLECT_TOTAL_DAYS
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, ...styles.centeredPhone }}>
          <p style={styles.closingLine}>{dayContent.closingLine}</p>

          {isFinalDay ? (
            <div style={{ marginTop: '2.5rem', width: '100%' }}>
              <p style={styles.finaleNote}>
                Reflect is complete. Take the Stage Check again to see where you are now.
              </p>
              <button
                onClick={() => navigate('/vow-path')}
                style={styles.primaryBtn}
              >
                Take the Stage Check again
              </button>
              <button
                onClick={handleClose}
                style={{ ...styles.secondaryBtn, marginTop: '0.75rem' }}
              >
                Back to home
              </button>
            </div>
          ) : (
            <button
              onClick={handleClose}
              style={{ ...styles.primaryBtn, marginTop: '2.5rem' }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}

const styles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  phone: {
    background: '#FAF7F1',
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '1.5rem 1.5rem 2rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  arrivalContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '3rem 1.5rem 2rem',
    minHeight: '60vh',
  },
  centeredPhone: {
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '3rem 2rem',
  },

  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  headerTitle: {
    fontSize: '13px', fontWeight: 500, color: '#9C8C78',
    margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textAlign: 'center', flex: 1,
  },
  backBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
    minWidth: '60px', textAlign: 'left',
  },

  // Arrival
  dayLabel: {
    fontSize: '12px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.16em',
    fontWeight: 500, marginBottom: '1rem',
  },
  arrivalTitle: {
    fontSize: '34px', color: '#2A1F15',
    margin: '0 0 1rem',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.2,
  },
  arrivalSubtitle: {
    fontSize: '16px', color: '#6B5C4A',
    margin: 0,
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.5,
  },

  // Audio
  audioCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '20px',
    padding: '2rem 1.5rem',
    marginBottom: '1rem',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
  },
  audioLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.12em',
    fontWeight: 500, marginBottom: '1.25rem',
  },
  audioPlayBtn: {
    width: '72px', height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 6px 18px rgba(40,25,10,0.30)',
    margin: '0 auto',
    transition: 'transform 0.1s',
  },
  audioPlayIcon: {
    color: '#FAF7F1',
    fontSize: '22px',
  },
  audioCaption: {
    fontSize: '12px', color: '#9C8C78',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    margin: '1rem 0 0',
  },
  transcriptDetails: {
    marginBottom: '1.5rem',
    padding: '0 0.5rem',
  },
  transcriptSummary: {
    fontSize: '12px', color: '#854F0B',
    cursor: 'pointer', textAlign: 'center',
    padding: '0.5rem 0',
    fontWeight: 500,
    listStyle: 'none',
  },
  transcriptBody: {
    marginTop: '0.75rem',
    padding: '1rem',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '12px',
  },
  transcriptPara: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.65,
    margin: '0 0 0.85rem',
  },

  // Reading
  readingBlock: {
    marginBottom: '1.5rem',
  },
  readingPara: {
    fontSize: '16px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.75,
    margin: '0 0 1.15rem',
  },

  // Prompt
  promptBlock: {
    marginBottom: '1rem',
  },
  promptQuestion: {
    fontSize: '22px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 1rem',
  },
  promptSubtextWrap: {
    marginBottom: '1.25rem',
  },
  promptSubtextPara: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 0.85rem',
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '0.5px solid #DDCFB6',
    background: 'white',
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'vertical',
    lineHeight: 1.6,
    marginBottom: '0.5rem',
  },
  textareaLetter: {
    background: '#FDFBF6',
    fontStyle: 'italic',
    padding: '20px 24px',
    border: '0.5px solid #E8DFD0',
  },
  charCount: {
    fontSize: '11px', color: '#9C8C78',
    textAlign: 'right',
    margin: '0 0 1.25rem',
    fontStyle: 'italic',
  },

  // Post-save
  savedIcon: {
    width: '56px', height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '0.5px solid #C2D49A',
    color: '#3B6D11',
    fontSize: '28px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1.5rem',
    fontWeight: 500,
  },
  savedMessage: {
    fontSize: '17px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '320px',
  },

  // Closing
  closingLine: {
    fontSize: '22px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    margin: 0,
    maxWidth: '340px',
    textAlign: 'center',
  },

  // Finale
  finaleNote: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0 0 1.25rem',
    lineHeight: 1.6,
  },

  // Locked
  lockedBlock: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  lockedIcon: {
    fontSize: '40px',
    marginBottom: '1.25rem',
  },
  lockedTitle: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 1rem',
  },
  lockedReason: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '320px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  // Buttons
  primaryBtn: {
    width: '100%', padding: '16px',
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
    width: '100%', padding: '14px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 3px 10px rgba(80,50,20,0.06)',
  },
}