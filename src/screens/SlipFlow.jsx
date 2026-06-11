import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLang } from '../LanguageContext'
import { supabase } from '../supabaseClient'

// Works two ways: as a routed screen (/app/slip/:trackerId) or embedded
// in a floating card (pass trackerId + onExit props). Every path that
// used to navigate home now goes through exit().
export default function SlipFlow({ trackerId: trackerIdProp = null, onExit = null } = {}) {
  const { trackerId: trackerIdParam } = useParams()
  const trackerId = trackerIdProp || trackerIdParam
  const navigate = useNavigate()
  const exit = () => { if (onExit) onExit(); else navigate('/app/home') }
  const { t } = useLang()

  const [step, setStep] = useState(1) // 1=confirm, 2=acknowledgment, 3=reflection, 4=slip result
  const [tracker, setTracker] = useState(null)
  const [progress, setProgress] = useState(null)   // free-tier state for slip→Reclaim threshold
  const [slipResult, setSlipResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  // Load tracker info
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('trackers')
        .select('*, addiction_types(name, icon)')
        .eq('id', trackerId)
        .single()
      if (error) {
        exit()
        return
      }
      setTracker(data)

      // Free-tier state — drives the slip→Reclaim threshold (Endure/Build only)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: vpp } = await supabase
          .from('vow_path_progress')
          .select('free_state, endure_slip_count')
          .eq('user_id', user.id)
          .maybeSingle()
        if (vpp) setProgress(vpp)
      }

      setLoading(false)
    }
    load()
  }, [trackerId])

  // Auto-advance step 2 after 4 seconds
  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => setStep(3), 4000)
      return () => clearTimeout(timer)
    }
  }, [step])

  const handleConfirmSlip = () => {
    setStep(2)
  }

  const handleSaveAndRestart = async (skipNote = false) => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const oldStartDate = new Date(tracker.start_date)
      const slipTime = new Date()
      const durationSeconds = Math.floor((slipTime - oldStartDate) / 1000)

      // 1. Save streak to history
      await supabase.from('streak_history').insert({
        tracker_id: tracker.id,
        user_id: user.id,
        started_at: oldStartDate.toISOString(),
        ended_at: slipTime.toISOString(),
        duration_seconds: durationSeconds,
        reset_note: skipNote ? null : (note || null),
      })

      // 2. Update tracker — new start_date, increment resets, possibly update longest streak
      const newLongest = Math.max(
        tracker.longest_streak_seconds || 0,
        durationSeconds
      )

      await supabase.from('trackers').update({
        start_date: slipTime.toISOString(),
        total_resets: (tracker.total_resets || 0) + 1,
        longest_streak_seconds: newLongest,
      }).eq('id', tracker.id)

      // Slip count — free tier, Endure/Build only. We COUNT only; we no longer
      // force a move. At 3 slips the Endure/Build home shows a gentle nudge
      // suggesting Reclaim, and the user chooses. The count resets when they move.
      const fs = progress?.free_state
      if (fs === 'endure' || fs === 'build') {
        const newCount = (progress?.endure_slip_count || 0) + 1
        await supabase.from('vow_path_progress')
          .update({ endure_slip_count: newCount, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
        setSlipResult({ count: newCount, suggestReclaim: newCount >= 3 })
        setSaving(false)
        setStep(4)
        return
      }

      exit()
    } catch (err) {
      alert('Could not save: ' + err.message)
      setSaving(false)
    }
  }

  if (loading || !tracker) {
    return (
      <div style={styles.frame}>
        <div style={{...styles.card, textAlign: 'center', color: '#9C8C78'}}>Loading...</div>
      </div>
    )
  }

  // Calculate longest streak in days for display
  const oldStartDate = new Date(tracker.start_date)
  const now = new Date()
  const currentStreakDays = Math.floor((now - oldStartDate) / (1000 * 60 * 60 * 24))
  const longestDays = Math.max(
    currentStreakDays,
    Math.floor((tracker.longest_streak_seconds || 0) / 86400)
  )

  return (
    <div style={styles.frame}>
      <div style={styles.card}>

        {step === 1 && (
          <>
            <div style={styles.iconCircle}>
              <span style={{fontSize: '32px'}}>{tracker.addiction_types.icon}</span>
            </div>
            <h2 style={styles.title}>Be kind to yourself.</h2>
            <p style={styles.body}>
              You're about to reset your <b>{tracker.addiction_types.name}</b> tracker.
              Recovery is rarely a straight line — and reaching out to log this honestly is courage, not failure.
            </p>
            <p style={{...styles.body, fontStyle: 'italic', color: '#8A7B6A'}}>
              Are you sure?
            </p>
            <div style={styles.actions}>
              <button 
                onClick={() => exit()}
                style={{...styles.btn, ...styles.btnSecondary}}
              >
                Not yet, take me back
              </button>
              <button 
                onClick={handleConfirmSlip}
                style={{...styles.btn, ...styles.btnPrimary}}
              >
                Yes, I slipped
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div style={styles.acknowledgement}>
            <div style={styles.acknowledgmentIcon}>🤍</div>
            <h2 style={styles.bigTitle}>Honesty is courage.</h2>
            <p style={styles.acknowledgeBody}>
              Your <b>{longestDays}-day</b> longest streak will always be yours.
              Tomorrow is Day 1.
            </p>
            <div style={styles.dotLoader}>
              <span style={styles.dot}></span>
              <span style={styles.dot}></span>
              <span style={styles.dot}></span>
            </div>
          </div>
        )}

        {step === 3 && (
          <>
            <div style={styles.iconCircleSmall}>
              <span style={{fontSize: '22px'}}>📝</span>
            </div>
            <h2 style={styles.title}>A note for your future self?</h2>
            <p style={styles.body}>
              Sometimes a few honest words today help you understand yourself tomorrow.
              This is private — only you will see it.
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was going on? What do you want your future self to remember?"
              style={styles.textarea}
              maxLength={500}
            />
            <p style={styles.charCount}>{note.length}/500</p>
            <div style={styles.actions}>
              <button 
                onClick={() => handleSaveAndRestart(true)}
                disabled={saving}
                style={{...styles.btn, ...styles.btnSecondary}}
              >
                {saving ? '...' : 'Skip'}
              </button>
              <button 
                onClick={() => handleSaveAndRestart(false)}
                disabled={saving}
                style={{...styles.btn, ...styles.btnPrimary}}
              >
                {saving ? '...' : (note ? 'Save & restart' : 'Restart')}
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div style={styles.iconCircle}>
              <span style={{fontSize: '32px'}}>{slipResult?.suggestReclaim ? '🌱' : '🤍'}</span>
            </div>
            <h2 style={styles.title}>
              {slipResult?.suggestReclaim ? 'You showed up. Again.' : 'Logged. You showed up.'}
            </h2>
            <p style={styles.body}>
              {slipResult?.suggestReclaim
                ? "That's three slips this stretch. Not a verdict — a signal. There's a gentler space called Reclaim waiting on your home screen whenever you're ready; everything you've built stays. No rush, no shame."
                : `That's ${slipResult?.count} of 3 slips this stretch. A slip isn't the end — what counts is that you came back and logged it honestly. Keep going.`}
            </p>
            <div style={styles.actions}>
              <button
                onClick={() => exit()}
                style={{ ...styles.btn, ...styles.btnPrimary }}
              >
                Back to home
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

const styles = {
  frame: {
    minHeight: '100%',
    background: 'linear-gradient(180deg, #FDFBF6 0%, #F4EDDC 100%)',
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: 'transparent',
    maxWidth: '440px',
    width: '100%',
    minHeight: '100%',
    borderRadius: 0,
    padding: '2.5rem 1.5rem',
    boxSizing: 'border-box',
    boxShadow: 'none',
    textAlign: 'center',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  iconCircle: {
    width: '72px', height: '72px',
    margin: '0 auto 1.5rem',
    borderRadius: '50%',
    background: '#F4ECDD',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.6), 0 4px 12px rgba(120,80,30,0.08)',
  },
  iconCircleSmall: {
    width: '56px', height: '56px',
    margin: '0 auto 1.25rem',
    borderRadius: '50%',
    background: '#F4ECDD',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: '22px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 1rem', fontFamily: 'Georgia, serif',
    lineHeight: 1.3,
  },
  bigTitle: {
    fontSize: '28px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 1rem', fontFamily: 'Georgia, serif',
    lineHeight: 1.25,
  },
  body: {
    fontSize: '14px', color: '#6B5C4A',
    margin: '0 0 1rem', lineHeight: 1.6,
    fontFamily: 'Georgia, serif',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    border: '0.5px solid #DDCFB6',
    background: 'white',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
    minHeight: '100px',
    resize: 'vertical',
    marginTop: '0.5rem',
    marginBottom: '4px',
    lineHeight: 1.5,
  },
  charCount: {
    fontSize: '11px', color: '#9C8C78',
    textAlign: 'right', margin: '0 0 1rem',
  },
  actions: { display: 'flex', flexDirection: 'column', gap: '9px', width: '100%', marginTop: '1.1rem' },
  btn: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 18px',
    borderRadius: '999px',
    fontSize: '13.5px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    flex: 1,
    letterSpacing: '0.01em',
  },
  btnPrimary: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  btnSecondary: {
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    boxShadow: '0 3px 10px rgba(80,50,20,0.06)',
  },
  acknowledgement: {
    padding: '1.5rem 0',
  },
  acknowledgmentIcon: {
    fontSize: '40px',
    marginBottom: '1.25rem',
  },
  acknowledgeBody: {
    fontSize: '15px', color: '#6B5C4A',
    margin: '0 0 2rem', lineHeight: 1.6,
    fontFamily: 'Georgia, serif',
  },
  dotLoader: {
    display: 'flex', gap: '8px', justifyContent: 'center',
    marginTop: '1rem',
  },
  dot: {
    width: '8px', height: '8px',
    background: '#C9B894',
    borderRadius: '50%',
    animation: 'pulse 1.4s infinite ease-in-out',
  },
}