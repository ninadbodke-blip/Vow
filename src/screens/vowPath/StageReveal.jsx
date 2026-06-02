import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { STAGE_REVEALS } from './data/stageReveals'

export default function StageReveal() {
  const navigate = useNavigate()
  const { stageSlug } = useParams()
  const reveal = STAGE_REVEALS[stageSlug]
  const [starting, setStarting] = useState(false)
  const [substanceLabel, setSubstanceLabel] = useState('')

  useEffect(() => {
    if (!reveal) {
      navigate('/app/home')
      return
    }

    async function loadSubstance() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: progress } = await supabase
        .from('vow_path_progress')
        .select('substance_label')
        .eq('user_id', user.id)
        .maybeSingle()
      if (progress?.substance_label) {
        setSubstanceLabel(progress.substance_label)
      }
    }
    loadSubstance()
  }, [reveal, navigate])

  if (!reveal) return null

  const isAvailable = reveal.status === 'available'

  const handleBegin = async () => {
    if (!isAvailable || starting) return

    setStarting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/app/welcome')
        return
      }

      const { data: existingProgress } = await supabase
        .from('vow_path_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      const completedStages = existingProgress?.completed_stages || []

      const upsertData = {
        user_id: user.id,
        current_stage: stageSlug,
        current_day: 1,
        stage_started_at: new Date().toISOString(),
        last_completed_day: 0,
        vow_path_status: 'active',
        completed_stages: completedStages,
        updated_at: new Date().toISOString(),
      }

      // Stage-specific start timestamps
      // (mirrors enterStageDirectly in utils/stageTransitions.js)
      if (stageSlug === 'endure') {
        upsertData.endure_starts_at = new Date().toISOString()
      }
      if (stageSlug === 'build') {
        upsertData.build_starts_at = new Date().toISOString()
      }

      if (existingProgress) {
        if (existingProgress.substance_label) upsertData.substance_label = existingProgress.substance_label
        if (existingProgress.substance_family) upsertData.substance_family = existingProgress.substance_family
        if (existingProgress.substance_verb) upsertData.substance_verb = existingProgress.substance_verb
        if (existingProgress.primary_substance) upsertData.primary_substance = existingProgress.primary_substance
        if (existingProgress.path_started_at) upsertData.path_started_at = existingProgress.path_started_at
        if (existingProgress.is_pilot_mode !== undefined) upsertData.is_pilot_mode = existingProgress.is_pilot_mode
      } else {
        upsertData.path_started_at = new Date().toISOString()
        upsertData.is_paused = false
      }

      const { error: upsertError } = await supabase
        .from('vow_path_progress')
        .upsert(upsertData, { onConflict: 'user_id' })

      if (upsertError) {
        console.error('Failed to start path:', upsertError)
        console.error('Error message:', upsertError.message)
        console.error('Error details:', upsertError.details)
        alert(`Could not start the path: ${upsertError.message}`)
        setStarting(false)
        return
      }

      // Route to the overview, not directly to Day 1.
      // The user sees the full stage shape first, then taps Day 1 themselves.
      navigate(`/app/vow-path/${stageSlug}`)
    } catch (err) {
      console.error('Unexpected error:', err)
      alert(`Something went wrong: ${err.message}`)
      setStarting(false)
    }
  }

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.header}>
          <button onClick={() => navigate('/app/vow-path/check')} style={styles.backBtn}>‹ Back</button>
          <p style={styles.headerTitle}>Your stage</p>
          <div style={{ width: '60px' }}></div>
        </div>

        <h1 style={styles.headline}>{reveal.headline}</h1>
        <p style={styles.subhead}>{reveal.subhead}</p>

        {substanceLabel && (
          <p style={styles.substanceLine}>
            For your work on <em style={styles.substanceLabel}>{substanceLabel}</em>.
          </p>
        )}

        <div style={styles.metaRow}>
          <span style={styles.metaPill}>{reveal.duration}</span>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.body}>
          {reveal.body.split('\n\n').map((para, idx) => (
            <p key={idx} style={styles.bodyPara}>{para}</p>
          ))}
        </div>

        {isAvailable ? (
          <>
            <div style={styles.divider}></div>

            <button
              onClick={handleBegin}
              disabled={starting}
              style={{
                ...styles.primaryBtn,
                ...(starting ? styles.primaryBtnDisabled : {}),
              }}
            >
              {starting ? 'Starting...' : `Begin ${reveal.name}`}
            </button>

            <p style={styles.privacyLine}>
              Your work is private. Only you and Vow see it.
            </p>
          </>
        ) : (
          <>
            <div style={styles.comingSoonCard}>
              <p style={styles.comingSoonLabel}>Coming soon</p>
              <p style={styles.comingSoonBody}>{reveal.coming_soon_note}</p>
            </div>

            <button
              onClick={() => navigate('/app/vow-path/check')}
              style={styles.secondaryBtn}
            >
              Take the Stage Check again
            </button>

            <button
              onClick={() => navigate('/app/home')}
              style={styles.tertiaryBtn}
            >
              Back to home
            </button>
          </>
        )}

      </div>
    </div>
  )
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
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  headerTitle: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#854F0B',
    margin: 0,
    fontFamily: 'inherit',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    textAlign: 'center',
  },
  headline: {
    fontSize: '34px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: '0 0 0.5rem',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.15,
    textAlign: 'center',
  },
  subhead: {
    fontSize: '15px',
    color: '#6B5C4A',
    margin: '0 0 0.85rem',
    textAlign: 'center',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  substanceLine: {
    fontSize: '13px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0 0 1rem',
  },
  substanceLabel: {
    color: '#854F0B',
    fontStyle: 'italic',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  metaPill: {
    fontSize: '11px', fontWeight: 500,
    padding: '5px 14px',
    borderRadius: '999px',
    background: '#F4ECDD',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    border: '0.5px solid #E8DCC2',
  },
  divider: {
    height: '0.5px',
    background: '#E8DFD0',
    margin: '1.5rem 0',
  },
  body: {
    fontSize: '15px',
    color: '#2A1F15',
    lineHeight: 1.7,
    fontFamily: 'Georgia, serif',
  },
  bodyPara: {
    margin: '0 0 1rem',
  },
  primaryBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  secondaryBtn: {
    width: '100%',
    padding: '14px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 3px 10px rgba(80,50,20,0.06)',
    marginTop: '1rem',
  },
  tertiaryBtn: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    color: '#854F0B',
    border: 'none',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontStyle: 'italic',
    marginTop: '8px',
  },
  comingSoonCard: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E8DCC2',
    borderRadius: '14px',
    padding: '1rem 1.25rem',
    marginTop: '1.25rem',
  },
  comingSoonLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#854F0B',
    margin: '0 0 6px',
    fontWeight: 500,
  },
  comingSoonBody: {
    fontSize: '13px',
    color: '#2A1F15',
    margin: 0,
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.5,
  },
  privacyLine: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '1rem 0 0',
  },
  backBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
    minWidth: '60px', textAlign: 'left',
  },
}