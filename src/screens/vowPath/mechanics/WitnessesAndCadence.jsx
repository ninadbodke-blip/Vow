import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export default function WitnessesAndCadence({ data, onSave, saving }) {
  const {
    witnessesHeader,
    witnessesSubtext,
    maxWitnesses,
    relationshipOptions,
    timingOptions,
    cadenceHeader,
    cadenceSubtext,
    cadenceOptions,
  } = data

  // Phases: 'vow_display' -> 'witnesses' -> 'cadence' -> 'review'
  const [phase, setPhase] = useState('vow_display')

  const [sealedVow, setSealedVow] = useState(null)
  const [witnesses, setWitnesses] = useState([])
  const [currentName, setCurrentName] = useState('')
  const [currentRelationship, setCurrentRelationship] = useState('')
  const [currentTiming, setCurrentTiming] = useState('')
  const [cadence, setCadence] = useState(null)

  useEffect(() => {
    async function loadVow() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: day8 } = await supabase
        .from('vow_artifacts')
        .select('content')
        .eq('user_id', user.id)
        .eq('artifact_type', 'commit_day_8')
        .maybeSingle()
      if (day8?.content) {
        setSealedVow(day8.content)
      }
    }
    loadVow()
  }, [])

  const canAddWitness = currentName.trim() && currentRelationship && currentTiming && witnesses.length < maxWitnesses

  const addWitness = () => {
    if (!canAddWitness) return
    setWitnesses([...witnesses, {
      name: currentName.trim(),
      relationship: currentRelationship,
      timing: currentTiming,
    }])
    setCurrentName('')
    setCurrentRelationship('')
    setCurrentTiming('')
  }

  const removeWitness = (idx) => {
    setWitnesses(witnesses.filter((_, i) => i !== idx))
  }

  const finalize = () => {
    onSave({
      witnesses,
      cadence,
      witness_count: witnesses.length,
    })
  }

  // ===================================================================
  // PHASE: VOW DISPLAY
  // ===================================================================
  if (phase === 'vow_display') {
    if (!sealedVow) {
      return (
        <div style={styles.container}>
          <p style={styles.loadingNote}>Loading your sealed vow...</p>
        </div>
      )
    }

    const sealedDate = sealedVow.sealed_at
      ? new Date(sealedVow.sealed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : null
    const stopDate = sealedVow.stop_date
      ? new Date(sealedVow.stop_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : null

    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>Your sealed vow.</h2>
        <p style={styles.subtext}>This is what the witnesses will know about.</p>

        <div style={styles.vowDocument}>
          {sealedVow.vow_parts && Object.entries(sealedVow.vow_parts).map(([key, text]) => (
            <div key={key} style={styles.vowSection}>
              <p style={styles.vowSectionLabel}>{labelForKey(key)}</p>
              <p style={styles.vowSectionBody}>{text}</p>
            </div>
          ))}

          <div style={styles.vowFooter}>
            <p style={styles.vowDate}>
              {sealedDate && `Sealed ${sealedDate}`}
              {stopDate && ` · Stop date: ${stopDate}`}
            </p>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('witnesses')} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: WITNESSES
  // ===================================================================
  if (phase === 'witnesses') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{witnessesHeader}</h2>
        <p style={styles.subtext}>{witnessesSubtext}</p>

        {witnesses.length > 0 && (
          <div style={styles.witnessList}>
            {witnesses.map((w, idx) => (
              <div key={idx} style={styles.witnessRow}>
                <div>
                  <p style={styles.witnessName}>{w.name}</p>
                  <p style={styles.witnessMeta}>
                    {relationshipOptions.find(r => r.id === w.relationship)?.label} ·{' '}
                    {timingOptions.find(t => t.id === w.timing)?.label}
                  </p>
                </div>
                <button onClick={() => removeWitness(idx)} style={styles.removeBtn}>×</button>
              </div>
            ))}
          </div>
        )}

        {witnesses.length < maxWitnesses && (
          <div style={styles.addForm}>
            <p style={styles.addFormTitle}>
              {witnesses.length === 0 ? 'Add your first witness' : `Add another (${witnesses.length}/${maxWitnesses})`}
            </p>

            <input
              type="text"
              value={currentName}
              onChange={(e) => setCurrentName(e.target.value)}
              placeholder="Name"
              style={styles.input}
              maxLength={60}
            />

            <div style={styles.fieldLabel}>Relationship</div>
            <div style={styles.chipRow}>
              {relationshipOptions.map(r => (
                <button
                  key={r.id}
                  onClick={() => setCurrentRelationship(r.id)}
                  style={{
                    ...styles.chip,
                    ...(currentRelationship === r.id ? styles.chipSelected : {}),
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div style={styles.fieldLabel}>Timing</div>
            <div style={styles.chipRow}>
              {timingOptions.map(t => (
                <button
                  key={t.id}
                  onClick={() => setCurrentTiming(t.id)}
                  style={{
                    ...styles.chip,
                    ...(currentTiming === t.id ? styles.chipSelected : {}),
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              onClick={addWitness}
              disabled={!canAddWitness}
              style={{
                ...styles.addBtn,
                ...(canAddWitness ? {} : styles.addBtnDisabled),
              }}
            >
              Add this witness
            </button>
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.countLine}>{witnesses.length} of up to {maxWitnesses} witnesses</p>
          <button
            onClick={() => setPhase('cadence')}
            disabled={witnesses.length === 0}
            style={{
              ...styles.primaryBtn,
              ...(witnesses.length === 0 ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: CADENCE
  // ===================================================================
  if (phase === 'cadence') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{cadenceHeader}</h2>
        <p style={styles.subtext}>{cadenceSubtext}</p>

        <div style={styles.optionList}>
          {cadenceOptions.map(opt => {
            const selected = cadence === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setCadence(opt.id)}
                style={{
                  ...styles.optionCard,
                  ...(selected ? styles.optionCardSelected : {}),
                }}
              >
                <p style={styles.optionCardTitle}>{opt.label}</p>
                {opt.description && (
                  <p style={styles.optionCardDescription}>{opt.description}</p>
                )}
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('witnesses')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('review')}
            disabled={!cadence}
            style={{
              ...styles.primaryBtnFlex,
              ...(!cadence ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVIEW
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>Witnesses and cadence.</h2>

      <div style={styles.reviewCard}>
        <p style={styles.reviewLabel}>Witnesses</p>
        {witnesses.map((w, idx) => (
          <div key={idx} style={styles.reviewWitnessRow}>
            <p style={styles.reviewWitnessName}>{w.name}</p>
            <p style={styles.reviewWitnessMeta}>
              {relationshipOptions.find(r => r.id === w.relationship)?.label} ·{' '}
              {timingOptions.find(t => t.id === w.timing)?.label}
            </p>
          </div>
        ))}
      </div>

      <div style={styles.reviewCard}>
        <p style={styles.reviewLabel}>Cadence</p>
        <p style={styles.reviewItem}>
          {cadenceOptions.find(o => o.id === cadence)?.label}
        </p>
      </div>

      <div style={styles.footer}>
        <button onClick={() => setPhase('cadence')} style={styles.secondaryBtn}>‹ Back</button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

function labelForKey(key) {
  const map = {
    what: 'What I am promising',
    why: 'Why',
    how_long: 'For how long',
  }
  return map[key] || key
}

const styles = {
  container: { paddingTop: '0.5rem' },
  prompt: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 0.5rem',
  },
  subtext: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.55, margin: '0 0 1.25rem',
  },
  loadingNote: {
    fontSize: '13px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  vowDocument: {
    background: '#FDFBF6',
    border: '1px solid #E0D5C2',
    borderRadius: '16px',
    padding: '20px 18px',
    marginBottom: '1rem',
    boxShadow: '0 4px 12px rgba(80,50,20,0.06)',
  },
  vowSection: { marginBottom: '1.25rem' },
  vowSectionLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.5rem',
  },
  vowSectionBody: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.7,
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  vowFooter: {
    borderTop: '0.5px solid #E0D5C2',
    paddingTop: '0.85rem',
    marginTop: '0.25rem',
  },
  vowDate: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    textAlign: 'center',
  },
  witnessList: {
    display: 'flex', flexDirection: 'column', gap: '8px',
    marginBottom: '1.25rem',
  },
  witnessRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
  },
  witnessName: {
    fontSize: '14px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0, lineHeight: 1.3,
  },
  witnessMeta: {
    fontSize: '11px', color: '#854F0B',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '2px 0 0', lineHeight: 1.3,
  },
  removeBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '20px',
    cursor: 'pointer', padding: '0 4px', lineHeight: 1,
  },
  addForm: {
    padding: '14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
  },
  addFormTitle: {
    fontSize: '12px', color: '#854F0B',
    fontFamily: 'Georgia, serif',
    textTransform: 'uppercase', letterSpacing: '0.12em',
    fontWeight: 500,
    margin: '0 0 0.85rem',
  },
  input: {
    width: '100%', padding: '10px 12px',
    border: '0.5px solid #E0D5C2',
    borderRadius: '10px',
    fontSize: '13.5px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    outline: 'none', background: '#FDFBF6',
    boxSizing: 'border-box',
    marginBottom: '0.85rem',
  },
  fieldLabel: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 6px',
  },
  chipRow: {
    display: 'flex', flexWrap: 'wrap', gap: '6px',
    marginBottom: '0.85rem',
  },
  chip: {
    padding: '6px 12px',
    background: 'white',
    border: '0.5px solid #DDCFB6',
    borderRadius: '999px',
    fontSize: '12px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  chipSelected: {
    background: '#854F0B',
    border: '1px solid #854F0B',
    color: '#FAF7F1',
  },
  addBtn: {
    width: '100%', padding: '10px',
    background: '#F4ECDD', color: '#854F0B',
    border: '0.5px solid #E0D5C2',
    borderRadius: '10px',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'Georgia, serif',
  },
  addBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  optionList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  optionCard: {
    padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  optionCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  optionCardTitle: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 4px',
    lineHeight: 1.4,
  },
  optionCardDescription: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.4,
  },
  reviewCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '10px',
  },
  reviewLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.75rem',
  },
  reviewWitnessRow: { marginBottom: '0.5rem' },
  reviewWitnessName: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 2px',
    lineHeight: 1.3,
  },
  reviewWitnessMeta: {
    fontSize: '11.5px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  reviewItem: {
    fontSize: '13.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0,
    lineHeight: 1.5,
  },
  countLine: {
    fontSize: '11.5px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 8px',
    textAlign: 'center',
  },
  footer: { marginTop: '1.5rem', display: 'flex', gap: '8px' },
  primaryBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnFlex: {
    flex: 1, padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  secondaryBtn: {
    padding: '14px 18px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}