import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { audioUrl } from './utils/audioUrl'
import { isCadenceBypassed } from './utils/vowPathGating'
import { canEnterStage, isExploringPastStage } from './utils/stageAccess'
import { getEndureDay, ENDURE_TOTAL_DAYS } from './data/endureContent'
import { transitionFromEndure } from './utils/stageTransitions'

// Endure mechanic components
import GuidedHold from './mechanics/GuidedHold'
import StateLocator from './mechanics/StateLocator'
import ProtectedEmotionsMap from './mechanics/ProtectedEmotionsMap'
import AVEProtocolBuilder from './mechanics/AVEProtocolBuilder'
import StateMatchedResponse from './mechanics/StateMatchedResponse'
import ShameStatement from './mechanics/ShameStatement'
import PhaseClose from './mechanics/PhaseClose'
import AnhedoniaAssessment from './mechanics/AnhedoniaAssessment'
import GuidedWitness from './mechanics/GuidedWitness'
import ReplacementEngineCheck from './mechanics/ReplacementEngineCheck'
import CapitalAssessment from './mechanics/CapitalAssessment'
import LapseRelapseRecall from './mechanics/LapseRelapseRecall'
import ValuesPortrait from './mechanics/ValuesPortrait'
import EndurePortrait from './mechanics/EndurePortrait'
import VowHeld from './mechanics/VowHeld'
import usePersistedStep from '../../hooks/usePersistedStep'

// Reused from Commit
import FinalTap from './mechanics/FinalTap'

const STEP = {
  ARRIVAL: 'arrival',
  AUDIO: 'audio',
  INTRO: 'intro',
  INTERACTION: 'interaction',
  CLOSING: 'closing',
}

const MECHANIC_COMPONENTS = {
  guidedHold: GuidedHold,
  stateLocator: StateLocator,
  protectedEmotionsMap: ProtectedEmotionsMap,
  aveProtocolBuilder: AVEProtocolBuilder,
  stateMatchedResponse: StateMatchedResponse,
  shameStatement: ShameStatement,
  phaseClose: PhaseClose,
  anhedoniaAssessment: AnhedoniaAssessment,
  guidedWitness: GuidedWitness,
  replacementEngineCheck: ReplacementEngineCheck,
  capitalAssessment: CapitalAssessment,
  lapseRelapseRecall: LapseRelapseRecall,
  valuesPortrait: ValuesPortrait,
  endurePortrait: EndurePortrait,
  vowHeld: VowHeld,
  finalTap: FinalTap,
}

export default function EndureDay() {
  const navigate = useNavigate()
  const { dayNumber: dayNumberParam } = useParams()
  const dayNumber = parseInt(dayNumberParam, 10)
  const dayContent = getEndureDay(dayNumber)

  const [step, setStep] = usePersistedStep(`vow_step_endure_${dayNumber}`, STEP.ARRIVAL, { skipPersist: [STEP.CLOSING] })
  const [progress, setProgress] = useState(null)
  const [substance, setSubstance] = useState(null)
  const [accessLoading, setAccessLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [accessReason, setAccessReason] = useState('')

  const [interactionData, setInteractionData] = useState(null)
  const [existingArtifact, setExistingArtifact] = useState(null)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)

  // Audio
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)

  // ---- Access check ----
  useEffect(() => {
    async function checkAccess() {
      if (!dayContent) {
        setAccessDenied(true)
        setAccessReason('That day does not exist.')
        setAccessLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/welcome'); return }

      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!canEnterStage(progressRow, 'endure')) {
        setAccessDenied(true)
        setAccessReason('You have not started Endure yet.')
        setAccessLoading(false)
        return
      }

      setProgress(progressRow)
      setSubstance({
        primary: progressRow.primary_substance,
        label: progressRow.substance_label,
        family: progressRow.substance_family,
        verb: progressRow.substance_verb,
      })

      const unlocked = isDayUnlocked(progressRow, dayNumber)
      if (!unlocked.allowed) {
        setAccessDenied(true)
        setAccessReason(unlocked.reason)
        setAccessLoading(false)
        return
      }

      const artifactType = dayContent.artifactType
      const { data: artifact } = await supabase
        .from('vow_artifacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('artifact_type', artifactType)
        .maybeSingle()

      if (artifact) {
        setExistingArtifact(artifact)
        setInteractionData(artifact.content)
      }

      setAccessLoading(false)
    }
    checkAccess()
  }, [dayNumber, dayContent, navigate])

  function isDayUnlocked(progressRow, requestedDay) {
    if (isCadenceBypassed(progressRow)) return { allowed: true }
    if (isExploringPastStage(progressRow, 'endure')) return { allowed: true }

    const lastCompleted = progressRow.last_completed_day || 0
    if (requestedDay === 1) return { allowed: true }
    if (requestedDay <= lastCompleted) return { allowed: true }

    if (requestedDay !== lastCompleted + 1) {
      return {
        allowed: false,
        reason: `Day ${lastCompleted + 1} is your next day. Day ${requestedDay} unlocks after that.`,
      }
    }

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

  const buildStepSequence = () => {
    const seq = [STEP.ARRIVAL]
    if (dayContent?.founderAudio) seq.push(STEP.AUDIO)
    if (dayContent?.intro?.length > 0) seq.push(STEP.INTRO)
    seq.push(STEP.INTERACTION)
    seq.push(STEP.CLOSING)
    return seq
  }

  const advance = () => {
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
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
    const sequence = buildStepSequence()
    const idx = sequence.indexOf(step)

    if (idx === 0 || step === STEP.CLOSING) {
      navigate('/vow-path/endure')
      return
    }

    if (idx > 0) {
      setStep(sequence[idx - 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSaveInteraction = async (data) => {
    setInteractionData(data)
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/welcome'); return }

      const artifactType = dayContent.artifactType

      const { error: artifactError } = await supabase
        .from('vow_artifacts')
        .upsert({
          user_id: user.id,
          artifact_type: artifactType,
          content: data,
          stage: 'endure',
          day_number: dayNumber,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,artifact_type' })

      if (artifactError) {
        console.error('Failed to save artifact:', artifactError)
        alert('Could not save. Please try again.')
        setSaving(false)
        return
      }

      const wasLatestDay = dayNumber > (progress?.last_completed_day || 0)
      if (wasLatestDay && !isExploringPastStage(progress, 'endure')) {
        const updates = {
          last_completed_day: dayNumber,
          last_completed_at: new Date().toISOString(),
          current_day: Math.min(dayNumber + 1, ENDURE_TOTAL_DAYS),
          updated_at: new Date().toISOString(),
        }

        await supabase
          .from('vow_path_progress')
          .update(updates)
          .eq('user_id', user.id)
      }

      setSaving(false)
      advance() // to closing
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  // ---- ENDURE COMPLETION (Day 21 -> Build transition) ----
  const handleEndureComplete = async () => {
    setCompleting(true)
    const result = await transitionFromEndure()
    if (result.error) {
      alert('Could not transition to Build: ' + result.error)
      setCompleting(false)
      return
    }
    navigate('/vow-path/transition/endure/to/build')
  }

  const getBackLabel = () => {
    const sequence = buildStepSequence()
    const idx = sequence.indexOf(step)
    if (idx === 0 || step === STEP.CLOSING) {
      return '\u2039 Overview'
    }
    return '\u2039 Back'
  }

  // ---- Render states ----

  if (accessLoading) {
    return (
      <div style={styles.frame}>
        <div style={styles.loadingPhone}>Loading...</div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.header}>
            <button onClick={() => navigate('/vow-path/endure')} style={styles.backBtn}>{'\u2039'} Overview</button>
            <div style={{ width: '40px' }}></div>
            <div style={{ width: '40px' }}></div>
          </div>
          <div style={styles.lockedBlock}>
            <div style={styles.lockedIcon}>{'\u23f3'}</div>
            <p style={styles.lockedTitle}>Not yet.</p>
            <p style={styles.lockedReason}>{accessReason}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!dayContent) return null

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

  // ---- AUDIO ----
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
            <button onClick={togglePlay} style={styles.audioPlayBtn} aria-label={isPlaying ? 'Pause' : 'Play'}>
              <span style={styles.audioPlayIcon}>{isPlaying ? '\u275a\u275a' : '\u25b6'}</span>
            </button>
            <p style={styles.audioCaption}>
              {audioError
                ? 'Audio not yet available. Read the script below.'
                : (isPlaying ? 'Playing...' : 'Tap to play')}
            </p>
            {dayContent.founderAudio.audioSrc && (
              <audio
                ref={audioRef}
                src={audioUrl(dayContent.founderAudio.audioSrc)}
                onEnded={() => setIsPlaying(false)}
                onError={() => setAudioError(true)}
                preload="none"
                style={{ display: 'none' }}
              />
            )}
          </div>

          <details style={styles.transcriptDetails}>
            <summary style={styles.transcriptSummary}>Read the script</summary>
            <div style={styles.transcriptBody}>
              {dayContent.founderAudio.transcript.split('\n\n').map((para, i) => (
                <p key={i} style={styles.transcriptPara}>{para}</p>
              ))}
            </div>
          </details>

          <button onClick={advance} style={styles.primaryBtn}>Continue</button>
        </div>
      </div>
    )
  }

  // ---- INTRO ----
  if (step === STEP.INTRO) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.header}>
            <button onClick={goBack} style={styles.backBtn}>{getBackLabel()}</button>
            <div style={{ width: '40px' }}></div>
            <div style={{ width: '40px' }}></div>
          </div>

          <div style={styles.introHeaderBlock}>
            <div style={styles.introDayLabel}>Day {dayNumber}</div>
            <h2 style={styles.introTitle}>{dayContent.arrivalTitle}</h2>
            {dayContent.arrivalSubtitle && (
              <p style={styles.introSubtitle}>{dayContent.arrivalSubtitle}</p>
            )}
            <div style={styles.introDivider}></div>
          </div>

          <div style={styles.readingBlock}>
            {dayContent.intro.map((para, i) => (
              <p key={i} style={styles.readingPara}>{para}</p>
            ))}
          </div>

          <button onClick={advance} style={styles.primaryBtn}>Continue</button>
        </div>
      </div>
    )
  }

  // ---- INTERACTION ----
  if (step === STEP.INTERACTION) {
    const MechanicComponent = MECHANIC_COMPONENTS[dayContent.mechanic.type]

    if (!MechanicComponent) {
      return (
        <div style={styles.frame}>
          <div style={styles.phone}>
            <p>Unknown mechanic: {dayContent.mechanic.type}</p>
          </div>
        </div>
      )
    }

    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.header}>
            <button onClick={goBack} style={styles.backBtn}>{getBackLabel()}</button>
            <p style={styles.headerTitle}>Day {dayNumber}</p>
            <div style={{ width: '40px' }}></div>
          </div>

          <MechanicComponent
            data={dayContent.mechanic.data}
            substance={substance}
            existingData={interactionData}
            onSave={handleSaveInteraction}
            saving={saving}
            dayNumber={dayNumber}
          />
        </div>
      </div>
    )
  }

  // ---- CLOSING ----
  if (step === STEP.CLOSING) {
    const isFinalDay = dayNumber === ENDURE_TOTAL_DAYS
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, ...styles.centeredPhone }}>
          <div style={styles.savedIcon}>{'\u2713'}</div>
          <p style={styles.savedLabel}>Saved</p>
          <div style={styles.closingDivider}></div>
          <p style={styles.closingLine}>{dayContent.closingTitle}</p>
          {dayContent.closingBody && (
            <p style={styles.closingBody}>{dayContent.closingBody}</p>
          )}

          <button
            onClick={() => navigate(`/library/endure/day/${dayNumber}`)}
            style={styles.libraryLink}
          >
            Curious about the science behind this? Read the deep read {'\u2192'}
          </button>

          {isFinalDay ? (
            <button
              onClick={handleEndureComplete}
              disabled={completing}
              style={{ ...styles.primaryBtn, marginTop: '1.5rem', ...(completing ? { opacity: 0.5 } : {}) }}
            >
              {completing ? 'Walking through...' : 'Continue to threshold'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/vow-path/endure')}
              style={{ ...styles.primaryBtn, marginTop: '1.5rem' }}
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
  loadingPhone: {
    background: '#FAF7F1',
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '5rem 2rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10)',
    color: '#9C8C78',
    textAlign: 'center',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  arrivalContent: {
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
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
  introHeaderBlock: {
    textAlign: 'center',
    marginBottom: '2rem',
    paddingTop: '1.5rem',
  },
  introDayLabel: {
    fontSize: '12px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    marginBottom: '0.85rem',
  },
  introTitle: {
    fontSize: '28px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.25,
    margin: '0 0 0.6rem',
  },
  introSubtitle: {
    fontSize: '15px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.5,
    margin: '0 0 1.5rem',
  },
  introDivider: {
    height: '0.5px',
    background: '#E8DFD0',
    width: '40%',
    margin: '0 auto',
  },
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
  readingBlock: {
    marginBottom: '2rem',
    paddingLeft: '0.25rem',
    paddingRight: '0.25rem',
  },
  readingPara: {
    fontSize: '16px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.8,
    margin: '0 0 1.35rem',
  },
  savedIcon: {
    width: '56px', height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '0.5px solid #C2D49A',
    color: '#3B6D11',
    fontSize: '28px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1rem',
    fontWeight: 500,
  },
  savedLabel: {
    fontSize: '12px',
    color: '#3B6D11',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    margin: 0,
  },
  closingDivider: {
    height: '0.5px',
    background: '#E8DFD0',
    width: '40%',
    margin: '1.75rem auto',
  },
  closingLine: {
    fontSize: '22px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    margin: 0,
    maxWidth: '340px',
    textAlign: 'center',
  },
  closingBody: {
    fontSize: '15px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0.75rem 0 0',
    maxWidth: '340px',
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
  },
  libraryLink: {
    background: 'transparent',
    border: 'none',
    color: '#854F0B',
    fontSize: '12px',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    padding: '12px 16px',
    marginTop: '1.5rem',
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
    textUnderlineOffset: '4px',
    lineHeight: 1.5,
  },
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
  primaryBtn: {
    width: '100%', padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
}