import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export default function VowHeld({ data, onSave, saving }) {
  const {
    pullFromArtifact = 'commit_day_8',
    readPrompt,
    readSubtext,
    markPrompt,
    markOptions,
  } = data

  // Phases: 'load' -> 'read' -> 'mark' -> 'response'
  const [phase, setPhase] = useState('load')
  const [sealedVow, setSealedVow] = useState(null)
  const [selectedMark, setSelectedMark] = useState(null)

  useEffect(() => {
    async function loadVow() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: artifact } = await supabase
        .from('vow_artifacts')
        .select('content')
        .eq('user_id', user.id)
        .eq('artifact_type', pullFromArtifact)
        .maybeSingle()
      if (artifact?.content) {
        setSealedVow(artifact.content)
        setPhase('read')
      } else {
        setPhase('no_vow')
      }
    }
    loadVow()
  }, [pullFromArtifact])

  const handleMark = (optionId) => {
    setSelectedMark(optionId)
    setPhase('response')
  }

  const finalize = () => {
    onSave({
      vow_held_status: selectedMark,
      vow_read_at: new Date().toISOString(),
      vow_sealed_at: sealedVow?.sealed_at,
    })
  }

  // ===================================================================
  // PHASE: LOAD
  // ===================================================================
  if (phase === 'load') {
    return (
      <div style={{ ...styles.container, textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Loading your vow...
        </p>
      </div>
    )
  }

  // ===================================================================
  // PHASE: NO VOW
  // ===================================================================
  if (phase === 'no_vow') {
    return (
      <div style={styles.container}>
        <div style={styles.noVowBlock}>
          <p style={styles.noVowText}>
            We couldn't find your sealed vow from Commit Day 8. The vow is needed for today's exercise.
          </p>
          <p style={styles.noVowText}>
            If you took a different route to Endure — directly from the Stage Check rather than through Commit — you can still mark Day 21 with the same options below.
          </p>
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('mark')} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: READ
  // ===================================================================
  if (phase === 'read') {
    const sealedDate = sealedVow.sealed_at
      ? new Date(sealedVow.sealed_at).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : null
    const stopDate = sealedVow.stop_date
      ? new Date(sealedVow.stop_date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : null

    return (
      <div style={styles.container}>
        <div style={styles.readHeader}>
          <p style={styles.readEyebrow}>Day 21</p>
          <h2 style={styles.readTitle}>{readPrompt}</h2>
          <p style={styles.readSubtext}>{readSubtext}</p>
          <div style={styles.readOrnament}>· · ·</div>
        </div>

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

        <div style={styles.readOrnamentEnd}>· · ·</div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('mark')} style={styles.primaryBtn}>
            Continue to mark Day 21
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: MARK
  // ===================================================================
  if (phase === 'mark') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{markPrompt}</h2>
        <p style={styles.subtext}>One tap. Honest.</p>

        <div style={styles.optionList}>
          {markOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleMark(opt.id)}
              style={styles.optionCardLarge}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: RESPONSE
  // ===================================================================
  const selectedOption = markOptions.find(o => o.id === selectedMark)
  return (
    <div style={styles.container}>
      <div style={styles.responseCard}>
        <p style={styles.responseLabel}>You said:</p>
        <p style={styles.responseTap}>{selectedOption?.label}</p>
        <div style={styles.responseDivider}></div>
        <p style={styles.responseBody}>{selectedOption?.response}</p>
      </div>

      <div style={styles.footer}>
        <button onClick={() => { setSelectedMark(null); setPhase('mark') }} style={styles.secondaryBtn}>
          ‹ Change
        </button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Mark Day 21'}
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
    fontSize: '22px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 0.5rem',
    textAlign: 'center',
  },
  subtext: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.55, margin: '0 0 1.5rem',
    textAlign: 'center',
  },
  readHeader: {
    textAlign: 'center',
    paddingTop: '0.5rem',
    marginBottom: '1.5rem',
  },
  readEyebrow: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.85rem',
  },
  readTitle: {
    fontSize: '26px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.25,
    margin: '0 0 0.85rem',
  },
  readSubtext: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: '0 0 1rem',
  },
  readOrnament: {
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    marginTop: '0.5rem',
  },
  readOrnamentEnd: {
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    textAlign: 'center',
    margin: '1.5rem 0',
  },
  vowDocument: {
    background: '#FDFBF6',
    border: '1px solid #E0D5C2',
    borderRadius: '16px',
    padding: '24px 22px',
    marginBottom: '0.5rem',
    boxShadow: '0 4px 12px rgba(80,50,20,0.06)',
  },
  vowSection: {
    marginBottom: '1.5rem',
    paddingBottom: '1.25rem',
    borderBottom: '0.5px solid #E8DFD0',
  },
  vowSectionLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.6rem',
  },
  vowSectionBody: {
    fontSize: '15.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.75,
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  vowFooter: {
    paddingTop: '0.5rem',
  },
  vowDate: {
    fontSize: '11.5px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    textAlign: 'center',
  },
  optionList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  optionCardLarge: {
    padding: '22px 20px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '16px',
    fontSize: '16px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    textAlign: 'left',
    lineHeight: 1.5,
    transition: 'all 0.15s',
    boxShadow: '0 2px 8px rgba(80,50,20,0.04)',
  },
  responseCard: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '16px',
    padding: '22px',
    marginBottom: '1rem',
  },
  responseLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.5rem',
  },
  responseTap: {
    fontSize: '16px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: 0,
    lineHeight: 1.5,
  },
  responseDivider: {
    height: '0.5px',
    background: '#E0D5C2',
    margin: '1.25rem 0',
  },
  responseBody: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.75,
    margin: 0,
  },
  noVowBlock: {
    background: '#FFF5EE',
    border: '1px solid #E0D5C2',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '1rem',
  },
  noVowText: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: '0 0 0.85rem',
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
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
  },
}