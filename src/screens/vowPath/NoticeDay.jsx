import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { isCadenceBypassed } from './utils/vowPathGating'
import { canEnterStage, isExploringPastStage } from './utils/stageAccess'
import { audioUrl } from './utils/audioUrl'
import {
  getNoticeDay,
  NOTICE_TOTAL_DAYS,
} from './data/noticeContent'

import TwoPassMultiSelect from './mechanics/TwoPassMultiSelect'
import TrajectoryMap from './mechanics/TrajectoryMap'
import RelationshipMap from './mechanics/RelationshipMap'
import LedgerOfForgone from './mechanics/LedgerOfForgone'
import ThreeDoorsNotice from './mechanics/ThreeDoorsNotice'
import usePersistedStep from '../../hooks/usePersistedStep'

// Practice archetype glyphs — inlined here so NoticeDay has no external icon dependency.
// 24x24, stroke currentColor (inherits Vow clay-brown), weight 1.5, round caps.
const PRACTICE_GLYPHS = {
  plant: (<><path d="M12 21v-8" /><path d="M12 13c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6z" /><path d="M12 12c0-2.8 2.2-5 5-5 0 2.8-2.2 5-5 5z" /></>),
  say: (<><path d="M5 9.5h2.6L11 6.5v11L7.6 14.5H5z" /><path d="M14.4 9.2a4 4 0 0 1 0 5.6" /><path d="M17 7a7 7 0 0 1 0 10" /></>),
  catch: (<><circle cx="9.5" cy="9" r="5" /><path d="M9.5 4v10M4.5 9h10" /><path d="M13.1 12.6L20 19.5" /></>),
  watch: (<><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" /><circle cx="12" cy="12" r="2.6" /></>),
  anchor: (<><circle cx="12" cy="4.5" r="2" /><path d="M12 6.5V21" /><path d="M7.5 10.5h9" /><path d="M4.5 13.5a7.5 7.5 0 0 0 15 0" /><path d="M4.5 13.5l-1.9.4M19.5 13.5l1.9.4" /></>),
  document: (<><path d="M7 3.5h6l4 4V20.5H7z" /><path d="M13 3.5v4h4" /><path d="M9.8 12.5h4.4M9.8 15.5h4.4" /></>),
  map: (<><path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" /><path d="M9 4.5v13M15 6.5v13" /></>),
  pause: (<><circle cx="12" cy="12" r="8.5" /><path d="M10 9v6M14 9v6" /></>),
  shed: (<><path d="M16.5 4.5c.5 7-3.5 12-9.5 13 0-7 3.5-12 9.5-13z" /><path d="M7 17.5c2.5-3.6 5.2-6.1 9-8" /><path d="M18.4 3l1.8-1.8" /></>),
}

function PracticeArchetypeIcon({ archetype, size = 30 }) {
  const glyph = PRACTICE_GLYPHS[archetype]
  if (!glyph) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {glyph}
    </svg>
  )
}

const STEP = {
  ARRIVAL: 'arrival',
  AUDIO: 'audio',
  INTRO: 'intro',
  INTERACTION: 'interaction',
  PRACTICE: 'practice',
  CLOSING: 'closing',
}

const MECHANIC_COMPONENTS = {
  twoPassMultiSelect: TwoPassMultiSelect,
  trajectoryMap: TrajectoryMap,
  relationshipMap: RelationshipMap,
  ledgerOfForgone: LedgerOfForgone,
  threeDoorsNotice: ThreeDoorsNotice,
}

export default function NoticeDay() {
  const navigate = useNavigate()
  const { dayNumber: dayNumberParam } = useParams()
  const dayNumber = parseInt(dayNumberParam, 10)
  const dayContent = getNoticeDay(dayNumber)

  const [step, setStep] = usePersistedStep(`vow_step_notice_${dayNumber}`, STEP.ARRIVAL, { skipPersist: [STEP.CLOSING] })
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [progress, setProgress] = useState(null)
  const [substance, setSubstance] = useState(null)
  const [accessLoading, setAccessLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [accessReason, setAccessReason] = useState('')

  const [interactionData, setInteractionData] = useState(null)
  const [existingArtifact, setExistingArtifact] = useState(null)
  const [saving, setSaving] = useState(false)

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
      if (!user) {
        navigate('/welcome')
        return
      }

      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!canEnterStage(progressRow, 'notice')) {
        setAccessDenied(true)
        setAccessReason('You have not started Notice yet.')
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

      const artifactType = `notice_day_${dayNumber}`
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
    if (isExploringPastStage(progressRow, 'notice')) return { allowed: true }

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
    if (dayContent?.openings) seq.push(STEP.INTRO)
    seq.push(STEP.INTERACTION)
    if (dayContent?.practice) seq.push(STEP.PRACTICE)
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
      navigate('/vow-path/notice')
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

      const artifactType = `notice_day_${dayNumber}`

      const { error: artifactError } = await supabase
        .from('vow_artifacts')
        .upsert({
          user_id: user.id,
          artifact_type: artifactType,
          content: data,
          stage: 'notice',
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
      if (wasLatestDay && !isExploringPastStage(progress, 'notice')) {
        await supabase
          .from('vow_path_progress')
          .update({
            last_completed_day: dayNumber,
            last_completed_at: new Date().toISOString(),
            current_day: Math.min(dayNumber + 1, NOTICE_TOTAL_DAYS),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
      }

      setSaving(false)

      // Day 5 (ThreeDoorsNotice) handles its own navigation
      if (dayContent.mechanic.type !== 'threeDoorsNotice') {
        advance()
      }
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const getBackLabel = () => {
    const sequence = buildStepSequence()
    const idx = sequence.indexOf(step)
    if (idx === 0 || step === STEP.CLOSING) {
      return '‹ Overview'
    }
    return '‹ Back'
  }

  // ---- Render states ----

  if (accessLoading) {
    return (
      <div style={styles.frame}>
        <div style={styles.loadingPhone}>
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
            <button onClick={() => navigate('/vow-path/notice')} style={styles.backBtn}>‹ Overview</button>
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

  // Get the opening variant for intro phase
  const completedStages = progress?.completed_stages || []
  let openingVariant = 'A'
  if (dayNumber === 1 && completedStages.some(c => c.stage === 'notice')) {
    openingVariant = 'C'
  }
  const opening = dayContent.openings?.[openingVariant] || dayContent.openings?.A

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
            <div style={styles.dayLabel}>Day {String(dayNumber).padStart(2, '0')}</div>
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

  // ---- AUDIO (A note from Ninad) ----
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
            <div style={{ width: '40px' }}></div>
            <div style={{ width: '40px' }}></div>
          </div>

          <div style={styles.audioCard}>
            <div style={styles.audioLabel}>A note from Ninad</div>
            <button onClick={togglePlay} style={styles.audioPlayBtn} aria-label={isPlaying ? 'Pause' : 'Play'}>
              <span style={styles.audioPlayIcon}>{isPlaying ? '❚❚' : '▶'}</span>
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
    const introParagraphs = opening?.intro?.split('\n\n') || []
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
            {introParagraphs.map((para, i) => (
              (i === 0 && para)
                ? <p key={i} style={styles.readingPara}><span style={styles.dropCap}>{para.charAt(0)}</span>{para.slice(1)}</p>
                : <p key={i} style={styles.readingPara}>{para}</p>
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
            onComplete={handleSaveInteraction}
            saving={saving}
            dayNumber={dayNumber}
          />
        </div>
      </div>
    )
  }

  // ---- PRACTICE (real-world, "between now and tomorrow"; opt-in via dayContent.practice) ----
  if (step === STEP.PRACTICE && dayContent.practice) {
    const practice = dayContent.practice
    const body = Array.isArray(practice.body) ? practice.body : [practice.body]
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.header}>
            <button onClick={goBack} style={styles.backBtn}>{getBackLabel()}</button>
            <div style={{ width: '40px' }}></div>
            <div style={{ width: '40px' }}></div>
          </div>

          <div style={styles.introHeaderBlock}>
            {practice.archetype && (
              <div style={{ color: '#854F0B', display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <PracticeArchetypeIcon archetype={practice.archetype} size={30} />
              </div>
            )}
            <div style={styles.introDayLabel}>{practice.eyebrow || 'Between now and tomorrow'}</div>
            <h2 style={styles.introTitle}>{practice.title}</h2>
            <div style={styles.introDivider}></div>
          </div>

          <div style={styles.readingBlock}>
            {body.map((para, i) => (
              <p key={i} style={styles.readingPara}>{para}</p>
            ))}
          </div>

          <button onClick={advance} style={styles.primaryBtn}>
            {practice.button || 'I\u2019ll carry this'}
          </button>
        </div>
      </div>
    )
  }

  // ---- CLOSING ----
  if (step === STEP.CLOSING) {
    const isFinalDay = dayNumber === NOTICE_TOTAL_DAYS
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, ...styles.centeredPhone }}>
          <div style={styles.sealWrap} aria-hidden="true">
            <svg viewBox="0 0 64 64" width="54" height="54">
              <circle cx="32" cy="32" r="30" fill="none" stroke="#D9B57A" strokeWidth="1" opacity="0.45" />
              <path d="M18 47 L18 30 A14 14 0 0 1 46 30 L46 47" fill="none" stroke="#D9B57A" strokeWidth="2" strokeLinecap="round" />
              <path d="M32 22 L35.5 31 L32 40 L28.5 31 Z" fill="#D9B57A" />
            </svg>
          </div>
          <p style={styles.sealLabel}>The artifact is sealed.</p>
          <div style={styles.closingDivider}></div>
          <p style={styles.closingLine}>{dayContent.closingTitle}</p>
          {dayContent.closingBody && (
            <p style={styles.closingBody}>{dayContent.closingBody}</p>
          )}

          <button
            onClick={() => navigate(`/library/notice/day/${dayNumber}`)}
            style={styles.libraryLink}
          >
            Curious about the science behind this? Read the deep read →
          </button>

          <button
            onClick={() => navigate('/vow-path/notice')}
            style={{ ...styles.primaryBtn, marginTop: '1.5rem' }}
          >
            Return to the path
          </button>
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
  dayLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.3em',
    fontWeight: 500, marginBottom: '1.75rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  arrivalTitle: {
    fontSize: '38px', color: '#2A1F15',
    margin: '0 0 1rem',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    fontStyle: 'italic',
    lineHeight: 1.18,
    letterSpacing: '-0.01em',
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
  dropCap: {
    float: 'left', fontFamily: 'Georgia, serif', fontSize: '52px',
    lineHeight: 0.82, color: '#854F0B', fontWeight: 500, margin: '4px 10px 0 0',
  },
  sealWrap: { margin: '0 auto 1.1rem', display: 'flex', justifyContent: 'center' },
  sealLabel: {
    fontSize: '12px', color: '#854F0B', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.2em',
    fontWeight: 500, margin: 0,
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
}
