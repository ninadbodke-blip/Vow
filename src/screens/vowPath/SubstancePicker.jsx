import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { SUBSTANCES, buildCustomSubstance } from './data/substances'

export default function SubstancePicker() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(null)
  const [customText, setCustomText] = useState('')
  const [customMode, setCustomMode] = useState(false)
  const [step, setStep] = useState('pick')  // 'pick' | 'confirm'
  const [saving, setSaving] = useState(false)

  // Pre-load existing substance choice if user has one
  useEffect(() => {
    async function loadExisting() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: progress } = await supabase
        .from('vow_path_progress')
        .select('primary_substance')
        .eq('user_id', user.id)
        .maybeSingle()

      if (progress?.primary_substance) {
        // If it's one of the standard substances, pre-select it
        if (SUBSTANCES.find(s => s.id === progress.primary_substance)) {
          setSelectedId(progress.primary_substance)
        } else if (progress.primary_substance) {
          // Otherwise treat as custom
          setCustomMode(true)
          setCustomText(progress.primary_substance)
          setSelectedId('custom')
        }
      }
    }
    loadExisting()
  }, [])

  const handlePick = (id) => {
    setSelectedId(id)
    setCustomMode(false)
  }

  const handleCustomTap = () => {
    setCustomMode(true)
    setSelectedId('custom')
  }

  // Get the substance object that's currently selected
  const getCurrentSubstance = () => {
    if (selectedId === 'custom') {
      if (!customText.trim()) return null
      return buildCustomSubstance(customText)
    }
    return SUBSTANCES.find(s => s.id === selectedId)
  }

  const canContinue = (() => {
    if (!selectedId) return false
    if (selectedId === 'custom') return customText.trim().length > 0
    return true
  })()

  const handleContinueToConfirm = () => {
    if (!canContinue) return
    setStep('confirm')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveAndProceed = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/app/welcome'); return }

      const substance = getCurrentSubstance()
      if (!substance) {
        setSaving(false)
        return
      }

      // Upsert progress with substance metadata
      const { error } = await supabase
        .from('vow_path_progress')
        .upsert({
          user_id: user.id,
          primary_substance: substance.id === 'custom' ? customText.trim() : substance.id,
          substance_label: substance.label,
          substance_family: substance.family,
          substance_verb: substance.verb,
          // Default values for fields required by progress row.
          // These are placeholders until Stage Reveal upserts the
          // actual stage assignment.
          current_stage: 'pre_stage_check',
          current_day: 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

      if (error) {
        console.error('Failed to save substance:', error)
        alert('Could not save your selection. Please try again.')
        setSaving(false)
        return
      }

      navigate('/app/vow-path/check')
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  // ---- CONFIRM STEP ----
  if (step === 'confirm') {
    const substance = getCurrentSubstance()
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, ...styles.confirmPhone }}>
          <div style={styles.confirmContent}>
            <p style={styles.confirmText}>
              The Vow Path will focus on <span style={styles.confirmSubstance}>{substance?.label}</span>.
            </p>
            <p style={styles.confirmNext}>
              Next: a short check &mdash; fifteen questions. About two minutes.
            </p>
            <button
              onClick={handleSaveAndProceed}
              disabled={saving}
              style={{
                ...styles.primaryBtn,
                ...(saving ? styles.primaryBtnDisabled : {}),
                marginTop: '2.5rem',
              }}
            >
              {saving ? 'Saving...' : 'Continue'}
            </button>
            <button
              onClick={() => setStep('pick')}
              style={{ ...styles.secondaryBtn, marginTop: '0.75rem' }}
            >
              Change selection
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- PICK STEP ----
  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.header}>
          <button onClick={() => navigate('/app/vow-path')} style={styles.backBtn}>‹ Back</button>
          <p style={styles.headerTitle}>Before we begin</p>
          <div style={{ width: '60px' }}></div>
        </div>

        <h1 style={styles.title}>Which one is the focus?</h1>

        <p style={styles.body}>
          The Vow Path adapts based on what you're working on. The
          questions, the costs, the body map, the using voice &mdash;
          they all shift slightly depending on the substance.
        </p>

        <p style={styles.body}>
          Pick the one that's the main focus today. You can come
          back to the others later.
        </p>

        <div style={styles.grid}>
          {SUBSTANCES.map((s) => (
            <button
              key={s.id}
              onClick={() => handlePick(s.id)}
              style={{
                ...styles.card,
                ...(selectedId === s.id && !customMode ? styles.cardSelected : {}),
              }}
            >
              <div style={styles.cardGlyph}>{s.glyph}</div>
              <div style={styles.cardName}>{s.name}</div>
            </button>
          ))}
        </div>

        <button
          onClick={handleCustomTap}
          style={{
            ...styles.customCard,
            ...(customMode ? styles.customCardSelected : {}),
          }}
        >
          <span style={styles.customPlus}>+</span>
          <span>Something else</span>
        </button>

        {customMode && (
          <div style={styles.customInputWrap}>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="What is it?"
              maxLength={40}
              style={styles.customInput}
              autoFocus
            />
            <p style={styles.customNote}>
              Custom entries default to the substance family. You can change later.
            </p>
          </div>
        )}

        <button
          onClick={handleContinueToConfirm}
          disabled={!canContinue}
          style={{
            ...styles.primaryBtn,
            ...(canContinue ? {} : styles.primaryBtnDisabled),
            marginTop: '1.5rem',
          }}
        >
          Continue
        </button>

        <p style={styles.changeNote}>
          You can change this later.
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
  phone: {
    background: '#FAF7F1',
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '1.5rem 1.5rem 2rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  confirmPhone: {
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  confirmContent: {
    textAlign: 'center',
    padding: '2rem 1rem',
  },
  confirmText: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    margin: '0 0 1rem',
  },
  confirmSubstance: {
    color: '#854F0B',
    fontStyle: 'italic',
  },
  confirmNext: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '1.5rem 0 0',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  backBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
    minWidth: '60px', textAlign: 'left',
  },
  headerTitle: {
    fontSize: '13px', fontWeight: 500, color: '#9C8C78',
    margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic',
  },
  title: {
    fontSize: '26px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 1rem',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.25,
    textAlign: 'center',
  },
  body: {
    fontSize: '14px', color: '#6B5C4A',
    margin: '0 0 0.85rem', lineHeight: 1.6,
    fontFamily: 'Georgia, serif',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    marginTop: '1.25rem',
    marginBottom: '8px',
  },
  card: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px 10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'center',
    transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
    minHeight: '88px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  cardSelected: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 4px 12px rgba(197,87,44,0.15)',
  },
  cardGlyph: {
    fontSize: '24px',
  },
  cardName: {
    fontSize: '12px', fontWeight: 500,
    color: '#2A1F15',
    lineHeight: 1.3,
  },
  customCard: {
    width: '100%',
    background: 'white',
    border: '0.5px dashed #DDCFB6',
    borderRadius: '14px',
    padding: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '13px', fontWeight: 500,
    color: '#854F0B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.15s',
  },
  customCardSelected: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '1px solid #C5572C',
    color: '#2A1F15',
  },
  customPlus: {
    fontSize: '16px', fontWeight: 500,
  },
  customInputWrap: {
    marginTop: '12px',
  },
  customInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '0.5px solid #DDCFB6',
    background: 'white',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
  },
  customNote: {
    fontSize: '11px', color: '#9C8C78',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    margin: '8px 0 0',
    textAlign: 'center',
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
  changeNote: {
    fontSize: '11px', color: '#9C8C78',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    margin: '0.75rem 0 0',
    textAlign: 'center',
  },
}