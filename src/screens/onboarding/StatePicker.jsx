import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

const STATE_OPTIONS = [
  {
    id: 'notice',
    label: `I haven't really thought about whether it's a problem.`,
    sublabel: 'Just curious. Not committing to anything.',
  },
  {
    id: 'reflect',
    label: `I'm starting to wonder if it's costing me.`,
    sublabel: 'Looking honestly. Not ready to decide yet.',
  },
  {
    id: 'commit',
    label: `I want to stop, but I haven't yet.`,
    sublabel: 'Getting ready. Building toward a stop date.',
  },
  {
    id: 'endure',
    label: `I've stopped recently, or I'm about to.`,
    sublabel: 'In the early stretch. Holding the vow.',
  },
  {
    id: 'build',
    label: `I've been clean a while. Building forward.`,
    sublabel: 'The work shifts. From stopping to building.',
  },
  {
    id: 'reclaim',
    label: `I slipped. I'm returning.`,
    sublabel: 'Coming back. The progress hasn\u2019t been lost.',
  },
]

export default function StatePicker() {
  const navigate = useNavigate()

  const [selectedId, setSelectedId] = useState(null)
  const [substanceLabel, setSubstanceLabel] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/welcome')
        return
      }

      const { data: progress } = await supabase
        .from('vow_path_progress')
        .select('substance_label, free_state')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!progress?.substance_label) {
        // No addiction selected yet, send them back
        navigate('/onboarding/addiction')
        return
      }

      setSubstanceLabel(progress.substance_label)
      if (progress.free_state) setSelectedId(progress.free_state)
      setLoading(false)
    }
    load()
  }, [navigate])

  const handleContinue = async () => {
    if (!selectedId) {
      setError('Tap one option that feels closest to where you are.')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/welcome')
        return
      }

      const { error: updateError } = await supabase
        .from('vow_path_progress')
        .update({
          free_state: selectedId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Failed to save state:', updateError)
        setError('Could not save. Please try again.')
        setSaving(false)
        return
      }

      navigate('/home')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={styles.loadingCard}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={styles.card}>

        <div style={styles.heroBlock}>
          <p style={styles.eyebrow}>Where you are</p>
          <h1 style={styles.title}>One question first.</h1>
          <p style={styles.subtitle}>
            Where are you with{' '}
            <em style={styles.substanceEm}>{substanceLabel}</em>
            {' '}right now?
          </p>
          <p style={styles.helperText}>
            Pick the one that feels closest. You can change this anytime.
          </p>
        </div>

        <div style={styles.optionsList}>
          {STATE_OPTIONS.map(option => {
            const isSelected = selectedId === option.id
            return (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedId(option.id)
                  setError(null)
                }}
                style={{
                  ...styles.optionCard,
                  ...(isSelected ? styles.optionCardSelected : {}),
                }}
              >
                <div style={styles.optionContent}>
                  <p style={{
                    ...styles.optionLabel,
                    ...(isSelected ? styles.optionLabelSelected : {}),
                  }}>
                    {option.label}
                  </p>
                  <p style={{
                    ...styles.optionSublabel,
                    ...(isSelected ? styles.optionSublabelSelected : {}),
                  }}>
                    {option.sublabel}
                  </p>
                </div>
                <div style={{
                  ...styles.optionRadio,
                  ...(isSelected ? styles.optionRadioSelected : {}),
                }}>
                  {isSelected && <div style={styles.optionRadioInner}></div>}
                </div>
              </button>
            )
          })}
        </div>

        {error && <div style={styles.err}>{error}</div>}

        <button
          onClick={handleContinue}
          disabled={!selectedId || saving}
          style={{
            ...styles.continueBtn,
            ...((!selectedId || saving) ? styles.continueBtnDisabled : {}),
          }}
        >
          {saving ? 'Setting up your home...' : 'Continue'}
        </button>

        <p style={styles.privacyNote}>
          Your work is private. Only you see it.
        </p>

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
  card: {
    background: '#FAF7F1',
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '2rem 1.5rem 2rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  loadingCard: {
    background: '#FAF7F1',
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '5rem 2rem',
    textAlign: 'center',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10)',
  },
  heroBlock: {
    textAlign: 'center',
    paddingTop: '0.5rem',
    marginBottom: '2rem',
  },
  eyebrow: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 1rem',
  },
  title: {
    fontSize: '28px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.25,
    margin: '0 0 0.85rem',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
    margin: '0 0 0.75rem',
  },
  substanceEm: {
    color: '#854F0B',
    fontStyle: 'italic',
    fontWeight: 500,
  },
  helperText: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.5,
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '1.5rem',
  },
  optionCard: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    width: '100%',
    padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  optionCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 4px 14px rgba(197,87,44,0.18)',
  },
  optionContent: {
    flex: 1,
    minWidth: 0,
  },
  optionLabel: {
    fontSize: '14.5px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0,
    lineHeight: 1.4,
  },
  optionLabelSelected: {
    color: '#2A1F15',
  },
  optionSublabel: {
    fontSize: '12px',
    color: '#9C8C78',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    margin: '4px 0 0',
    lineHeight: 1.4,
  },
  optionSublabelSelected: {
    color: '#854F0B',
  },
  optionRadio: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '1.5px solid #C9B894',
    background: 'white',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2px',
    transition: 'all 0.15s',
  },
  optionRadioSelected: {
    borderColor: '#C5572C',
    background: 'white',
  },
  optionRadioInner: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)',
  },
  err: {
    fontSize: '12px',
    color: '#B23B3B',
    textAlign: 'center',
    padding: '8px 12px',
    background: '#FBEBEB',
    borderRadius: '8px',
    margin: '0 0 1rem',
  },
  continueBtn: {
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
  continueBtnDisabled: {
    background: '#E8DFD0',
    color: '#9C8C78',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  privacyNote: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '1rem 0 0',
  },
}