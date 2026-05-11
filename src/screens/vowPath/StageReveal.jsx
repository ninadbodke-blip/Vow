import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

// =====================================================================
// STAGE REVEAL
// =====================================================================
// Shown after Stage Check. Reads the assigned stage from the URL
// (e.g., /vow-path/result/reflect → stageSlug = 'reflect').
// Updates vow_path_progress to set current_stage = the assigned stage.
// Renders stage-specific copy, then routes the user to the right
// next step.
// =====================================================================

const STAGE_REVEALS = {
  notice: {
    label: 'Notice',
    headline: `You're at the threshold.`,
    subhead: 'The first stage. Where most journeys actually begin.',
    body: [
      `You're here because something brought you to look. Maybe a worry. Maybe a moment. Maybe just a sense.`,
      `Notice is the stage of looking honestly at what is, before deciding what to do about it. There's no commitment yet. No date. Just attention.`,
      `Fourteen days. Mostly short. By the end, you'll know more about what you're actually working with than you do today.`,
    ],
    cta: 'Begin Notice',
    nextRoute: '/vow-path/notice',
    available: false,
    notReadyMessage: `Notice is being built. The other five stages are coming. For now, you can take the Stage Check again to see if you're closer to Reflect.`,
  },
  reflect: {
    label: 'Reflect',
    headline: `You're at Reflect.`,
    subhead: `Sitting with what you've seen. Three weeks. Twenty-one days.`,
    body: [
      `You've seen something. You're not yet sure what to do about it. That's exactly where Reflect is built for.`,
      `Three weeks. Three phases. Week 1 is See It — looking at what's actually happening. Week 2 is Feel It — the costs, the body, both sides honestly. Week 3 is Decide — where you actually stand.`,
      `Most days are short. Four minutes on average. A few are longer. By Day 21, you'll have a picture of yourself you didn't have when you started.`,
    ],
    cta: 'Begin Reflect',
    nextRoute: '/vow-path/reflect',
    available: true,
  },
  commit: {
    label: 'Commit',
    headline: `You're at Commit.`,
    subhead: 'Gathering yourself. The 30-day preparation phase.',
    body: [
      `You've looked. You've weighed. You're ready to begin building what comes next.`,
      `Commit is the 30-day preparation phase. You'll build the kit you need: the replacement plans, the if-then library, the conversations to have, the environment to set up.`,
      `It's not abstinence yet. It's the work that makes abstinence possible.`,
    ],
    cta: 'Begin Commit',
    nextRoute: '/vow-path/commit',
    available: false,
    notReadyMessage: `Commit is being built. For now, you can take the Stage Check again, or explore Reflect if you'd like to start there.`,
  },
  endure: {
    label: 'Endure',
    headline: `You're at Endure.`,
    subhead: 'Walking through. The hardest stretch.',
    body: [
      `You're in it. The early stretch. Cravings, mood swings, empty time, the body recalibrating.`,
      `Endure is for this stretch — not as a test, but as a structure. Daily check-ins, urge-handling tools, the small honest acts that get you through one day at a time.`,
      `Thirty days. Most people who reach Endure say it's the hardest of the six.`,
    ],
    cta: 'Begin Endure',
    nextRoute: '/vow-path/endure',
    available: false,
    notReadyMessage: 'Endure is being built. For now, you can take the Stage Check again, or explore Reflect.',
  },
  build: {
    label: 'Build',
    headline: `You're at Build.`,
    subhead: 'Living the vow. The new pattern, settling in.',
    body: [
      'The hardest stretch is behind you. The pattern is changing. The new version of you is starting to feel like the real version.',
      'Build is the stage of integration. Habits hardening. Identity shifting. The work of staying built when nothing dramatic is happening.',
      'Thirty days. Less white-knuckled than Endure. Just as important.',
    ],
    cta: 'Begin Build',
    nextRoute: '/vow-path/build',
    available: false,
    notReadyMessage: 'Build is being built. For now, you can take the Stage Check again, or explore Reflect.',
  },
  reclaim: {
    label: 'Reclaim',
    headline: `You're at Reclaim.`,
    subhead: 'Beginning again. After a slip.',
    body: [
      `You slipped. That's data, not failure. The work now is different from the work before — it's the work of returning.`,
      `Reclaim is for the days right after. Honest accounting of what happened. What was the trigger. What's different now. What returns first.`,
      'Fourteen days. Then back to whichever stage you were in.',
    ],
    cta: 'Begin Reclaim',
    nextRoute: '/vow-path/reclaim',
    available: false,
    notReadyMessage: 'Reclaim is being built. For now, you can take the Stage Check again.',
  },
}

export default function StageReveal() {
  const navigate = useNavigate()
  const { stageSlug } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [substance, setSubstance] = useState(null)

  const stageData = STAGE_REVEALS[stageSlug]

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/welcome')
        return
      }

      // If the URL slug is invalid, error out
      if (!stageData) {
        setError(`Unknown stage: ${stageSlug}`)
        setLoading(false)
        return
      }

      // Read substance for personalized greeting
      const { data: progress } = await supabase
        .from('vow_path_progress')
        .select('substance_label, current_stage')
        .eq('user_id', user.id)
        .maybeSingle()

      if (progress?.substance_label) {
        setSubstance(progress.substance_label)
      }

      setLoading(false)
    }
    load()
  }, [stageSlug, stageData, navigate])

  const handleBeginStage = async () => {
    if (!stageData?.available) return

    setUpdating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/welcome'); return }

      // Update progress to set this as the current stage
      const { error: updateError } = await supabase
        .from('vow_path_progress')
        .update({
          current_stage: stageSlug,
          current_day: 1,
          stage_started_at: new Date().toISOString(),
          last_completed_day: 0,
          last_completed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Failed to update progress:', updateError)
        alert('Could not start the stage. Please try again.')
        setUpdating(false)
        return
      }

      navigate(stageData.nextRoute)
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setUpdating(false)
    }
  }

  const handleRetake = () => {
    navigate('/vow-path')
  }

  // ---- Render ----

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={styles.loadingPhone}>
          Loading...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.errorBlock}>
            <p style={styles.errorIcon}>⚠️</p>
            <p style={styles.errorTitle}>Something went wrong.</p>
            <p style={styles.errorReason}>{error}</p>
            <button onClick={handleRetake} style={{ ...styles.primaryBtn, marginTop: '1.5rem' }}>
              Take the Stage Check again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.label}>Your stage</div>
        <h1 style={styles.headline}>{stageData.headline}</h1>
        <p style={styles.subhead}>{stageData.subhead}</p>

        {substance && (
          <p style={styles.substanceNote}>
            For your work on <span style={styles.substanceEmphasis}>{substance}</span>.
          </p>
        )}

        <div style={styles.divider}></div>

        <div style={styles.body}>
          {stageData.body.map((para, i) => (
            <p key={i} style={styles.bodyPara}>{para}</p>
          ))}
        </div>

        {stageData.available ? (
          <button
            onClick={handleBeginStage}
            disabled={updating}
            style={{
              ...styles.primaryBtn,
              ...(updating ? styles.primaryBtnDisabled : {}),
              marginTop: '0.5rem',
            }}
          >
            {updating ? 'Starting...' : stageData.cta}
          </button>
        ) : (
          <>
            <div style={styles.notReadyBlock}>
              <p style={styles.notReadyText}>{stageData.notReadyMessage}</p>
            </div>
            <button
              onClick={handleRetake}
              style={{ ...styles.primaryBtn, marginTop: '0.5rem' }}
            >
              Take the Stage Check again
            </button>
            <button
              onClick={() => navigate('/vow-path/reflect')}
              style={{ ...styles.secondaryBtn, marginTop: '0.75rem' }}
            >
              Explore Reflect anyway
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
    padding: '2.5rem 1.75rem 2rem',
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
  label: {
    fontSize: '12px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.16em',
    fontWeight: 500, marginBottom: '0.75rem',
    textAlign: 'center',
  },
  headline: {
    fontSize: '32px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.2,
    margin: '0 0 0.75rem',
    textAlign: 'center',
  },
  subhead: {
    fontSize: '15px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: '0 0 0.85rem',
    textAlign: 'center',
  },
  substanceNote: {
    fontSize: '13px', color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 1rem',
    textAlign: 'center',
  },
  substanceEmphasis: {
    color: '#854F0B',
  },
  divider: {
    height: '0.5px',
    background: '#E8DFD0',
    margin: '1.5rem 0',
  },
  body: {
    marginBottom: '1.75rem',
  },
  bodyPara: {
    fontSize: '15px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.7,
    margin: '0 0 1rem',
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
  notReadyBlock: {
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '14px',
    padding: '1rem 1.25rem',
    marginBottom: '1rem',
  },
  notReadyText: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
    textAlign: 'center',
  },
  errorBlock: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  errorIcon: {
    fontSize: '40px',
    margin: '0 0 1.25rem',
  },
  errorTitle: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.75rem',
  },
  errorReason: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
  },
}