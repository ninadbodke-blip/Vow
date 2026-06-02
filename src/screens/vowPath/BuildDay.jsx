import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { isCadenceBypassed } from './utils/vowPathGating'
import { canEnterStage, isExploringPastStage } from './utils/stageAccess'
import {
  getBuildDay,
  BUILD_TOTAL_DAYS,
  getCurrentBuildWeek,
} from './data/buildContent'

import BuildWeeklyEntry from './mechanics/BuildWeeklyEntry'
import PlaceholderMechanic from './mechanics/PlaceholderMechanic'
import usePersistedStep from '../../hooks/usePersistedStep'

const STEP = {
  ARRIVAL: 'arrival',
  INTRO: 'intro',
  INTERACTION: 'interaction',
  CLOSING: 'closing',
}

const MECHANIC_COMPONENTS = {
  build_weekly_entry: BuildWeeklyEntry,
  placeholder: PlaceholderMechanic,
}

export default function BuildDay() {
  const navigate = useNavigate()
  const { dayNumber: dayNumberParam } = useParams()
  const dayNumber = parseInt(dayNumberParam, 10)
  const dayContent = getBuildDay(dayNumber)

  const [step, setStep] = usePersistedStep(`vow_step_build_${dayNumber}`, STEP.ARRIVAL, { skipPersist: [STEP.CLOSING] })
  const [progress, setProgress] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [substance, setSubstance] = useState(null)
  const [accessLoading, setAccessLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [accessReason, setAccessReason] = useState('')

  const [interactionData, setInteractionData] = useState(null)
  const [priorEntries, setPriorEntries] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function checkAccess() {
      if (!dayContent) {
        setAccessDenied(true)
        setAccessReason('That entry does not exist.')
        setAccessLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/app/welcome'); return }

      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!canEnterStage(progressRow, 'build')) {
        setAccessDenied(true)
        setAccessReason('You have not reached Build yet.')
        setAccessLoading(false)
        return
      }

      setProgress(progressRow)
      const week = getCurrentBuildWeek(progressRow.build_starts_at)
      setCurrentWeek(week)
      setSubstance({
        primary: progressRow.primary_substance,
        label: progressRow.substance_label,
        family: progressRow.substance_family,
        verb: progressRow.substance_verb,
      })

      const unlocked = isDayUnlocked(progressRow, dayNumber, week)
      if (!unlocked.allowed) {
        setAccessDenied(true)
        setAccessReason(unlocked.reason)
        setAccessLoading(false)
        return
      }

      // Load this entry's existing artifact (if user has saved before)
      const { data: artifact } = await supabase
        .from('vow_artifacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('artifact_type', dayContent.artifactType)
        .maybeSingle()

      if (artifact) {
        setInteractionData(artifact.content)
      }

      // Fetch prior entries declared in retrieveFrom config
      // (used by Entry 5 to surface Entry 1's marking; Entry 9 to surface 1+5)
      const retrieveFrom = dayContent.mechanicProps?.retrieveFrom || []
      if (retrieveFrom.length > 0) {
        const artifactTypes = retrieveFrom.map(n => `build_entry_${n}`)
        const { data: priorArts } = await supabase
          .from('vow_artifacts')
          .select('*')
          .eq('user_id', user.id)
          .eq('stage', 'build')
          .in('artifact_type', artifactTypes)

        const fetched = (priorArts || [])
          .map(art => {
            const day = parseInt(
              art.artifact_type.replace('build_entry_', ''),
              10
            )
            return { day, content: art.content }
          })
          .sort((x, y) => x.day - y.day)

        setPriorEntries(fetched)
      }

      setAccessLoading(false)
    }
    checkAccess()
  }, [dayNumber, dayContent, navigate])

  function isDayUnlocked(progressRow, requestedDay, week) {
    if (isCadenceBypassed(progressRow)) return { allowed: true }
    if (isExploringPastStage(progressRow, 'build')) return { allowed: true }
    if (requestedDay <= week) return { allowed: true }
    return {
      allowed: false,
      reason: `Entry ${requestedDay} opens in Week ${requestedDay}. You're currently in Week ${week}.`,
    }
  }

  const buildStepSequence = () => {
    const seq = [STEP.ARRIVAL]
    if (dayContent?.intro?.length > 0) seq.push(STEP.INTRO)
    seq.push(STEP.INTERACTION)
    seq.push(STEP.CLOSING)
    return seq
  }

  const advance = () => {
    const sequence = buildStepSequence()
    const idx = sequence.indexOf(step)
    if (idx >= 0 && idx < sequence.length - 1) {
      setStep(sequence[idx + 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goBack = () => {
    const sequence = buildStepSequence()
    const idx = sequence.indexOf(step)

    if (idx === 0 || step === STEP.CLOSING) {
      navigate('/app/vow-path/build')
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
      if (!user) { navigate('/app/welcome'); return }

      const { error: artifactError } = await supabase
        .from('vow_artifacts')
        .upsert({
          user_id: user.id,
          artifact_type: dayContent.artifactType,
          content: data,
          stage: 'build',
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
      if (wasLatestDay && !isExploringPastStage(progress, 'build')) {
        await supabase
          .from('vow_path_progress')
          .update({
            last_completed_day: dayNumber,
            last_completed_at: new Date().toISOString(),
            current_day: Math.min(dayNumber + 1, BUILD_TOTAL_DAYS),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
      }

      setSaving(false)
      advance()
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const getBackLabel = () => {
    const sequence = buildStepSequence()
    const idx = sequence.indexOf(step)
    if (idx === 0 || step === STEP.CLOSING) return '‹ Overview'
    return '‹ Back'
  }

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
            <button onClick={() => navigate('/app/vow-path/build')} style={styles.backBtn}>‹ Overview</button>
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

  const weekLabel = `Week ${dayNumber}`
  const isCurrentEntry = dayNumber === currentWeek || import.meta.env.DEV || progress?.is_pilot_mode

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
            <div style={{ ...styles.dayLabel, letterSpacing: '0.3em', marginBottom: '1.75rem' }}>{weekLabel}</div>
            <h1 style={{ ...styles.arrivalTitle, fontSize: '38px', fontStyle: 'italic', lineHeight: 1.18 }}>{dayContent.arrivalTitle}</h1>
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
            <div style={styles.introDayLabel}>{weekLabel}</div>
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

  if (step === STEP.INTERACTION) {
    const MechanicComponent = MECHANIC_COMPONENTS[dayContent.mechanic]

    if (!MechanicComponent) {
      return (
        <div style={styles.frame}>
          <div style={styles.phone}>
            <p>Unknown mechanic: {dayContent.mechanic}</p>
          </div>
        </div>
      )
    }

    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.header}>
            <button onClick={goBack} style={styles.backBtn}>{getBackLabel()}</button>
            <p style={styles.headerTitle}>{weekLabel}</p>
            <div style={{ width: '40px' }}></div>
          </div>

          <MechanicComponent
            {...dayContent.mechanicProps}
            substance={substance}
            existingData={interactionData}
            onSave={handleSaveInteraction}
            saving={saving}
            isCurrentEntry={isCurrentEntry}
            dayNumber={dayNumber}
            priorEntries={priorEntries}
          />
        </div>
      </div>
    )
  }

  if (step === STEP.CLOSING) {
    const isFinalEntry = dayNumber === BUILD_TOTAL_DAYS
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
          {dayContent.closingLine && (
            <p style={styles.closingLine}>{dayContent.closingLine}</p>
          )}
          <button
            onClick={() => navigate('/app/vow-path/build')}
            style={{ ...styles.primaryBtn, marginTop: '2rem' }}
          >
            {isFinalEntry ? 'Back to overview' : 'Close'}
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
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    textAlign: 'center',
    padding: '3rem 1.5rem 2rem',
    minHeight: '60vh',
  },
  centeredPhone: {
    minHeight: '70vh',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
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
  sealWrap: { margin: '0 auto 1.1rem', display: 'flex', justifyContent: 'center' },
  sealLabel: { fontSize: '12px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 500, margin: 0 },
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
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.5,
    margin: 0,
    maxWidth: '340px',
    textAlign: 'center',
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