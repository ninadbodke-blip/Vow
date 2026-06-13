import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export default function LetterWriter({
  letterKey,
  promptHeader,
  starterPrompts,
  unsealOnKey,
  minWords = 20,
  suggestedWords = 0,
  helperText,
  dayNumber,
  substance,
  existingData,
  onSave,
  saving,
}) {
  const [step, setStep] = useState(0) // 0: write, 1: confirm seal, 2: post-seal
  const [letterText, setLetterText] = useState('')
  const [existingLetter, setExistingLetter] = useState(null)
  const [loadingLetter, setLoadingLetter] = useState(true)

  // Load any existing letter for this letterKey
  useEffect(() => {
    async function loadExisting() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoadingLetter(false)
        return
      }

      const { data } = await supabase
        .from('sealed_letters')
        .select('*')
        .eq('user_id', user.id)
        .eq('letter_key', letterKey)
        .maybeSingle()

      if (data) {
        setExistingLetter(data)
        setLetterText(data.letter_text)
        // If already sealed, jump to post-seal view
        if (data.is_sealed) {
          setStep(2)
        }
      }
      setLoadingLetter(false)
    }
    loadExisting()
  }, [letterKey])

  const wordCount = letterText.trim().split(/\s+/).filter(Boolean).length
  const canSeal = wordCount >= minWords
  const progressGoal = suggestedWords > minWords ? suggestedWords : minWords
  const progressPct = Math.min(100, Math.round((wordCount / progressGoal) * 100))
  const reachedSuggested = suggestedWords > 0 && wordCount >= suggestedWords

  // Compute the unseal-on day text for the seal warning
  const unsealOnLabel = (() => {
    if (!unsealOnKey) return null
    // e.g. "reflect_day_20" → "Day 20"
    const match = unsealOnKey.match(/day_(\d+)/)
    if (match) return `Day ${match[1]}`
    return null
  })()

  // ---- Loading state ----
  if (loadingLetter) {
    return (
      <div style={styles.loadingState}>Loading your letter...</div>
    )
  }

  // ---- Step 0: Write ----
  if (step === 0) {
    return (
      <div>
        <h2 style={styles.promptHeader}>{promptHeader}</h2>

        {helperText && (
          <p style={styles.helperBanner}>{helperText}</p>
        )}

        <textarea
          value={letterText}
          onChange={(e) => setLetterText(e.target.value)}
          placeholder="Start writing here..."
          style={styles.textarea}
          autoFocus
        />

        <div style={styles.metaRow}>
          <span style={styles.wordCount}>
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
            {minWords > 0 && (
              <span style={styles.wordCountTarget}>{suggestedWords > 0 ? ` / ${suggestedWords} suggested` : ` / ${minWords} minimum`}</span>
            )}
          </span>
          {existingLetter && !existingLetter.is_sealed && (
            <span style={styles.editingNote}>Editing earlier draft</span>
          )}
        </div>

        {minWords > 0 && (
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
            {suggestedWords > minWords && (
              <div style={{ ...styles.progressSuggestMark, left: `${Math.min(100, (minWords / suggestedWords) * 100)}%` }} title="minimum" />
            )}
          </div>
        )}

        {starterPrompts && starterPrompts.length > 0 && (
          <div style={styles.startersBlock}>
            <p style={styles.startersLabel}>
              {wordCount < 10
                ? 'Pick one to begin, or write your own opening:'
                : 'Stuck? Try writing about one of these:'}
            </p>
            {starterPrompts.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  const cleaned = s.replace(/^["\u201c"]|["\u201d"]$/g, '').trim()
                  const insert = letterText.trim().length === 0 ? cleaned : `${letterText.trim()}\n\n${cleaned}`
                  setLetterText(insert)
                }}
                style={styles.starterItem}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setStep(1)}
          disabled={!canSeal}
          style={{
            ...styles.primaryBtn,
            ...(!canSeal ? styles.primaryBtnDisabled : {}),
          }}
        >
          Continue to seal
        </button>

        {!canSeal && (
          <p style={styles.helpText}>
            {`A few more — aim for at least ${minWords} words before sealing. You're at ${wordCount}.`}
          </p>
        )}
        {canSeal && suggestedWords > 0 && !reachedSuggested && (
          <p style={styles.suggestText}>
            {`You can seal this now. If it helps, ${suggestedWords - wordCount} more words would let it breathe — most people find ${suggestedWords} feels right.`}
          </p>
        )}
      </div>
    )
  }

  // ---- Step 1: Confirm seal ----
  if (step === 1) {
    const handleSeal = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      try {
        const { error } = await supabase
          .from('sealed_letters')
          .upsert({
            user_id: user.id,
            letter_key: letterKey,
            letter_text: letterText.trim(),
            word_count: wordCount,
            stage: 'reflect',
            day_number: dayNumber || null,
            unseal_on_key: unsealOnKey,
            is_sealed: true,
            sealed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,letter_key' })

        if (error) {
          console.error('Failed to seal letter:', error)
          alert('Could not seal the letter. Please try again.')
          return
        }

        // Also save the artifact for day-completion tracking
        onSave({
          letter_key: letterKey,
          word_count: wordCount,
          sealed_at: new Date().toISOString(),
        })
      } catch (err) {
        console.error(err)
        alert('Something went wrong. Please try again.')
      }
    }

    const previewLines = letterText.trim().split('\n').slice(0, 4)

    return (
      <div>
        <h2 style={styles.sealHeader}>Ready to seal?</h2>

        <div style={styles.previewCard}>
          {previewLines.map((line, i) => (
            <p key={i} style={styles.previewLine}>
              {line || <span style={{ opacity: 0.4 }}>—</span>}
            </p>
          ))}
          {letterText.trim().split('\n').length > 4 && (
            <p style={styles.previewMore}>...</p>
          )}
        </div>

        <div style={styles.sealNote}>
          <p style={styles.sealNoteText}>
            {`Once sealed, this letter is locked. You can't edit it after sealing.`}
          </p>
          {unsealOnLabel && (
            <p style={styles.sealNoteText}>
              {`You'll see it again on ${unsealOnLabel}.`}
            </p>
          )}
        </div>

        <div style={styles.btnRow}>
          <button onClick={() => setStep(0)} style={styles.secondaryBtn}>
            Go back and edit
          </button>
          <button
            onClick={handleSeal}
            disabled={saving}
            style={{
              ...styles.primaryBtnFlex,
              ...(saving ? styles.primaryBtnDisabled : {}),
            }}
          >
            {saving ? 'Sealing...' : 'Seal the letter'}
          </button>
        </div>
      </div>
    )
  }

  // ---- Step 2: Post-seal (read-only confirmation) ----
  if (step === 2) {
    return (
      <div style={styles.postSealBlock}>
        <div style={styles.sealedIcon}>📜</div>
        <p style={styles.sealedLabel}>Sealed</p>
        <p style={styles.sealedDate}>
          {existingLetter?.sealed_at
            ? new Date(existingLetter.sealed_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : new Date().toLocaleDateString()}
        </p>

        <div style={styles.sealedDivider}></div>

        <p style={styles.sealedText}>
          {`Your letter is sealed. It's stored privately in your Vow records.`}
        </p>
        {unsealOnLabel && (
          <p style={styles.sealedText}>
            {`You'll see it again on ${unsealOnLabel}.`}
          </p>
        )}

        {/* If reached here from re-entering the day, give a way to mark as completed */}
        {!existingData && (
          <button
            onClick={() => onSave({
              letter_key: letterKey,
              already_sealed: true,
            })}
            style={{ ...styles.primaryBtn, marginTop: '1.5rem' }}
          >
            Continue
          </button>
        )}
      </div>
    )
  }

  return null
}

const styles = {
  loadingState: {
    textAlign: 'center',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    padding: '2rem',
  },
  promptHeader: {
    fontSize: '20px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontWeight: 500,
    lineHeight: 1.4,
    margin: '0 0 1.25rem',
    textAlign: 'center',
  },
  textarea: {
    width: '100%',
    minHeight: '280px',
    padding: '16px 18px',
    background: '#FDFBF6',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.65,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: 'inset 0 1px 3px rgba(80,50,20,0.04)',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    padding: '0 4px',
  },
  wordCount: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontVariantNumeric: 'tabular-nums',
  },
  suggestText: { fontSize: '12.5px', color: '#7C6A52', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, margin: '10px 0 0', textAlign: 'center' },
  progressSuggestMark: { position: 'absolute', top: '-2px', width: '1.5px', height: 'calc(100% + 4px)', background: '#C9A85C', opacity: 0.8 },
  wordCountTarget: {
    color: '#9C8C78',
    opacity: 0.7,
  },
  editingNote: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  helperBanner: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1rem',
    padding: '0.85rem 1rem',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '10px',
  },
  progressTrack: { position: 'relative',
    height: '3px',
    background: '#EFE7D7',
    borderRadius: '999px',
    overflow: 'hidden',
    marginBottom: '1.25rem',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #D9B57A 0%, #B89567 100%)',
    borderRadius: '999px',
    transition: 'width 0.25s ease-out',
  },
  startersBlock: {
    padding: '0.85rem 1rem',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '12px',
    marginBottom: '1.25rem',
  },
  startersLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontWeight: 500,
    margin: '0 0 0.6rem',
  },
  starterItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    padding: '6px 0',
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.5,
    cursor: 'pointer',
    borderBottom: '0.5px solid #EFE7D7',
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
  primaryBtnFlex: {
    flex: 2, padding: '16px',
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
    flex: 1, padding: '16px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  helpText: {
    fontSize: '11px',
    color: '#9C8C78',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
    marginTop: '0.75rem',
    marginBottom: 0,
  },
  sealHeader: {
    fontSize: '22px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 1.5rem',
    textAlign: 'center',
  },
  previewCard: {
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '14px',
    padding: '1.25rem 1.25rem',
    marginBottom: '1.25rem',
    boxShadow: 'inset 0 1px 3px rgba(80,50,20,0.04)',
  },
  previewLine: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: '0 0 0.4rem',
  },
  previewMore: {
    fontSize: '14px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    margin: '0.5rem 0 0',
    textAlign: 'center',
  },
  sealNote: {
    padding: '0.85rem 1rem',
    background: '#F4ECDD',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    marginBottom: '1.25rem',
  },
  sealNoteText: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: '0 0 0.4rem',
  },
  btnRow: {
    display: 'flex',
    gap: '10px',
  },
  postSealBlock: {
    textAlign: 'center',
    padding: '1rem',
  },
  sealedIcon: {
    fontSize: '48px',
    marginBottom: '0.75rem',
  },
  sealedLabel: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    margin: 0,
  },
  sealedDate: {
    fontSize: '13px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0.5rem 0 0',
  },
  sealedDivider: {
    height: '0.5px',
    background: '#E8DFD0',
    width: '40%',
    margin: '1.5rem auto',
  },
  sealedText: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 0.6rem',
    maxWidth: '320px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}