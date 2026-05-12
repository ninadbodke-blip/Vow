import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export default function VowDrafter({ data, onSave, saving }) {
  const {
    prompts,
    previewHeader,
    previewSubtext,
    sealConfirmHeader,
    sealConfirmBody,
    sealButtonLabel,
  } = data

  // Phases: 'prompt:0' -> 'prompt:1' -> 'prompt:2' -> 'preview' -> 'seal_confirm'
  const [phase, setPhase] = useState('prompt:0')

  const [answers, setAnswers] = useState({}) // { promptId: text }
  const [stopDate, setStopDate] = useState(null)

  // Load stop date from Day 1 artifact to inject into placeholders
  useEffect(() => {
    async function loadStopDate() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: day1 } = await supabase
        .from('vow_artifacts')
        .select('content')
        .eq('user_id', user.id)
        .eq('artifact_type', 'commit_day_1')
        .maybeSingle()
      if (day1?.content?.stop_date) {
        setStopDate(day1.content.stop_date)
      }
    }
    loadStopDate()
  }, [])

  const currentPromptIdx = phase.startsWith('prompt:') ? parseInt(phase.split(':')[1], 10) : -1
  const currentPrompt = currentPromptIdx >= 0 ? prompts[currentPromptIdx] : null

  const updateAnswer = (id, text) => {
    setAnswers(prev => ({ ...prev, [id]: text }))
  }

  const formatStopDate = () => {
    if (!stopDate) return '[your stop date]'
    const d = new Date(stopDate)
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const resolvedPlaceholder = (p) => {
    if (!p?.placeholder) return ''
    return p.placeholder.replace(/\[date\]/g, formatStopDate())
  }

  const advancePrompt = () => {
    if (currentPromptIdx < prompts.length - 1) {
      setPhase(`prompt:${currentPromptIdx + 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setPhase('preview')
    }
  }

  const goBackPrompt = () => {
    if (currentPromptIdx > 0) {
      setPhase(`prompt:${currentPromptIdx - 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const allFilled = prompts.every(p => (answers[p.id] || '').trim().length >= p.minLength)

  const sealNow = () => {
    onSave({
      vow_parts: answers,
      stop_date: stopDate,
      sealed_at: new Date().toISOString(),
      is_sealed: true,
    })
  }

  // ===================================================================
  // PHASE: PROMPT (one of three)
  // ===================================================================
  if (currentPrompt) {
    const text = answers[currentPrompt.id] || ''
    const isTooShort = text.trim().length < currentPrompt.minLength
    const isTooLong = text.length > currentPrompt.maxLength

    return (
      <div style={styles.container}>
        <p style={styles.progressLabel}>
          Prompt {currentPromptIdx + 1} of {prompts.length}
        </p>

        <h2 style={styles.prompt}>{currentPrompt.header}</h2>
        <p style={styles.subtext}>{currentPrompt.subtext}</p>

        <textarea
          value={text}
          onChange={(e) => updateAnswer(currentPrompt.id, e.target.value)}
          placeholder={resolvedPlaceholder(currentPrompt)}
          style={styles.textarea}
          rows={8}
          maxLength={currentPrompt.maxLength + 100}
        />

        <p style={styles.counter}>
          {text.length} characters
          {isTooShort && ` · need at least ${currentPrompt.minLength}`}
          {isTooLong && ` · over the ${currentPrompt.maxLength} limit`}
        </p>

        {currentPrompt.suggestions?.length > 0 && (
          <div style={styles.suggestionsCard}>
            <p style={styles.suggestionsLabel}>Suggestions</p>
            <ul style={styles.suggestionsList}>
              {currentPrompt.suggestions.map((s, i) => (
                <li key={i} style={styles.suggestionItem}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={styles.footer}>
          {currentPromptIdx > 0 && (
            <button onClick={goBackPrompt} style={styles.secondaryBtn}>‹ Back</button>
          )}
          <button
            onClick={advancePrompt}
            disabled={isTooShort || isTooLong}
            style={{
              ...styles.primaryBtnFlex,
              ...((isTooShort || isTooLong) ? styles.primaryBtnDisabled : {}),
            }}
          >
            {currentPromptIdx === prompts.length - 1 ? 'Preview the vow' : 'Continue'}
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: PREVIEW
  // ===================================================================
  if (phase === 'preview') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{previewHeader}</h2>
        <p style={styles.subtext}>{previewSubtext}</p>

        <div style={styles.vowDocument}>
          {prompts.map(p => (
            <div key={p.id} style={styles.vowSection}>
              <p style={styles.vowSectionLabel}>{p.header}</p>
              <p style={styles.vowSectionBody}>{answers[p.id]}</p>
            </div>
          ))}

          <div style={styles.vowFooter}>
            <p style={styles.vowDate}>
              Drafted {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {stopDate && ` · Stop date: ${formatStopDate()}`}
            </p>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase(`prompt:${prompts.length - 1}`)} style={styles.secondaryBtn}>
            ‹ Edit
          </button>
          <button onClick={() => setPhase('seal_confirm')} style={styles.primaryBtnFlex}>
            Seal the vow
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: SEAL CONFIRM
  // ===================================================================
  return (
    <div style={styles.container}>
      <div style={styles.sealConfirmIcon}>🜂</div>
      <h2 style={styles.sealTitle}>{sealConfirmHeader}</h2>
      <p style={styles.sealBody}>{sealConfirmBody}</p>

      <div style={styles.footer}>
        <button onClick={() => setPhase('preview')} style={styles.secondaryBtn}>
          ‹ Re-read
        </button>
        <button
          onClick={sealNow}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Sealing...' : sealButtonLabel}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { paddingTop: '0.5rem' },
  prompt: {
    fontSize: '22px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 0.5rem',
  },
  subtext: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.55, margin: '0 0 1.25rem',
  },
  progressLabel: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    margin: '0 0 0.75rem',
  },
  textarea: {
    width: '100%',
    padding: '16px',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    background: '#FDFBF6',
    outline: 'none',
    boxSizing: 'border-box',
    lineHeight: 1.7,
    resize: 'vertical',
    minHeight: '180px',
  },
  counter: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '8px 0 0',
    textAlign: 'right',
  },
  suggestionsCard: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    padding: '14px',
    marginTop: '1rem',
  },
  suggestionsLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.6rem',
  },
  suggestionsList: { margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' },
  suggestionItem: {
    fontSize: '12.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
    margin: '0 0 0.35rem',
  },
  vowDocument: {
    background: '#FDFBF6',
    border: '1px solid #E0D5C2',
    borderRadius: '16px',
    padding: '24px 20px',
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
    margin: '0 0 0.6rem',
  },
  vowSectionBody: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.7,
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  vowFooter: {
    borderTop: '0.5px solid #E0D5C2',
    paddingTop: '1rem',
    marginTop: '0.5rem',
  },
  vowDate: {
    fontSize: '11.5px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    textAlign: 'center',
  },
  sealConfirmIcon: {
    fontSize: '48px',
    textAlign: 'center',
    margin: '2rem 0 1rem',
    color: '#854F0B',
  },
  sealTitle: {
    fontSize: '26px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 1rem',
    textAlign: 'center',
    lineHeight: 1.25,
  },
  sealBody: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    textAlign: 'center',
    margin: '0 0 2rem',
    maxWidth: '340px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  footer: { marginTop: '1.5rem', display: 'flex', gap: '8px' },
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