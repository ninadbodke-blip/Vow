import { useState } from 'react'

export default function TwoPassMultiSelect({ data, onComplete }) {
  const {
    promptStep1,
    subtextStep1,
    minSelections = 3,
    helperText,
    chips = [],
    allowCustom = true,
    customPrompt = 'A line of your own',
    promptStep2,
    subtextStep2,
  } = data

  // Phases: 'identify' -> 'mark' -> 'reveal'
  const [phase, setPhase] = useState('identify')

  // Step 1 state
  const [selectedIds, setSelectedIds] = useState([])
  const [customLines, setCustomLines] = useState([])
  const [customInput, setCustomInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Step 2 state
  const [crossedIds, setCrossedIds] = useState([])

  const allSelectedChips = [
    ...chips.filter(c => selectedIds.includes(c.id)),
    ...customLines.map((label, idx) => ({
      id: `custom_${idx}`,
      label,
      isCustom: true,
    })),
  ]

  // ---------------- Step 1 handlers ----------------

  const toggleChip = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const addCustomLine = () => {
    const trimmed = customInput.trim()
    if (trimmed.length > 0 && customLines.length < 4) {
      setCustomLines([...customLines, trimmed])
      setCustomInput('')
      setShowCustomInput(false)
    }
  }

  const removeCustomLine = (idx) => {
    setCustomLines(customLines.filter((_, i) => i !== idx))
  }

  const totalSelected = selectedIds.length + customLines.length
  const canProceedStep1 = totalSelected >= minSelections

  // ---------------- Step 2 handlers ----------------

  const toggleCrossed = (id) => {
    setCrossedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const allMarked = allSelectedChips.every(c =>
    crossedIds.includes(c.id) || true
  )
  // All marked = user has seen each card. Since we allow either state,
  // proceeding requires at least having looked. We track this by clicking continue.
  const canProceedStep2 = true

  // ---------------- Reveal computation ----------------

  const linesHeld = allSelectedChips.filter(c => !crossedIds.includes(c.id))
  const linesCrossed = allSelectedChips.filter(c => crossedIds.includes(c.id))

  // Reflect a crossed line back as the person's own words.
  // Preset chips read "I'd never ___" → "You said you'd never ___."
  const reflectBack = (label) => {
    const m = label.match(/^I'd never (.+)$/i)
    if (m) return `You said you'd never ${m[1]}.`
    return `You said: "${label}"`
  }

  // ---------------- Complete ----------------

  const finalize = () => {
    onComplete({
      lines_identified: selectedIds,
      custom_lines: customLines,
      lines_crossed: crossedIds.filter(id => !id.startsWith('custom_')),
      custom_lines_crossed: crossedIds
        .filter(id => id.startsWith('custom_'))
        .map(id => customLines[parseInt(id.split('_')[1])])
        .filter(Boolean),
      lines_held: linesHeld.map(c => c.id),
      crossed_count: linesCrossed.length,
      held_count: linesHeld.length,
    })
  }

  // ===================================================================
  // PHASE: IDENTIFY
  // ===================================================================
  if (phase === 'identify') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{promptStep1}</h2>
        {subtextStep1 && <p style={styles.subtext}>{subtextStep1}</p>}

        <div style={styles.chipGrid}>
          {chips.map(chip => {
            const selected = selectedIds.includes(chip.id)
            return (
              <button
                key={chip.id}
                onClick={() => toggleChip(chip.id)}
                style={{
                  ...styles.chip,
                  ...(selected ? styles.chipSelected : {}),
                }}
              >
                {chip.label}
              </button>
            )
          })}

          {customLines.map((line, idx) => (
            <div key={`custom_${idx}`} style={{ ...styles.chip, ...styles.chipSelected, ...styles.chipCustom }}>
              <span>{line}</span>
              <button
                onClick={() => removeCustomLine(idx)}
                style={styles.removeBtn}
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          ))}

          {allowCustom && !showCustomInput && customLines.length < 4 && (
            <button
              onClick={() => setShowCustomInput(true)}
              style={{ ...styles.chip, ...styles.chipAdd }}
            >
              + {customPrompt}
            </button>
          )}

          {showCustomInput && (
            <div style={styles.customInputRow}>
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Type your line..."
                style={styles.customInput}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addCustomLine()
                  if (e.key === 'Escape') { setShowCustomInput(false); setCustomInput('') }
                }}
              />
              <button onClick={addCustomLine} style={styles.customAddBtn}>Add</button>
            </div>
          )}
        </div>

        {helperText && (
          <p style={styles.helper}>{helperText}</p>
        )}

        <div style={styles.footer}>
          <p style={styles.count}>
            {totalSelected} selected{canProceedStep1 ? '' : ` · need ${minSelections - totalSelected} more`}
          </p>
          <button
            onClick={() => setPhase('mark')}
            disabled={!canProceedStep1}
            style={{
              ...styles.primaryBtn,
              ...(canProceedStep1 ? {} : styles.primaryBtnDisabled),
            }}
          >
            Continue
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
        <h2 style={styles.prompt}>{promptStep2}</h2>
        {subtextStep2 && <p style={styles.subtext}>{subtextStep2}</p>}

        <div style={styles.cardList}>
          {allSelectedChips.map(chip => {
            const crossed = crossedIds.includes(chip.id)
            return (
              <button
                key={chip.id}
                onClick={() => toggleCrossed(chip.id)}
                style={{
                  ...styles.markCard,
                  ...(crossed ? styles.markCardCrossed : {}),
                }}
              >
                <span style={styles.markCardLabel}>{chip.label}</span>
                <span style={styles.markCardState}>
                  {crossed ? `I've crossed this` : `I haven't crossed this`}
                </span>
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button
            onClick={() => setPhase('reveal')}
            style={styles.primaryBtn}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVEAL
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.revealTitle}>The lines.</h2>

      <div style={styles.revealGrid}>
        <div style={styles.revealColumn}>
          <p style={styles.revealColumnTitle}>Lines still held</p>
          {linesHeld.length === 0 ? (
            <p style={styles.revealEmpty}>None.</p>
          ) : (
            <ul style={styles.revealList}>
              {linesHeld.map(c => (
                <li key={c.id} style={styles.revealItem}>{c.label}</li>
              ))}
            </ul>
          )}
        </div>

        <div style={styles.revealColumn}>
          <p style={styles.revealColumnTitle}>Lines crossed</p>
          {linesCrossed.length === 0 ? (
            <p style={styles.revealEmpty}>None.</p>
          ) : (
            <ul style={styles.revealList}>
              {linesCrossed.map(c => (
                <li key={c.id} style={styles.revealMirror}>
                  <span style={styles.revealMirrorSaid}>{reflectBack(c.label)}</span>
                  <span style={styles.revealMirrorDid}> You have.</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p style={styles.revealNote}>
        These are the lines you named. The ones you've crossed are in the right column.
        <br /><br />
        No commentary from us. You named them. You crossed them.
      </p>

      <div style={styles.footer}>
        <button onClick={finalize} style={styles.primaryBtn}>
          Continue
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    paddingTop: '0.5rem',
  },
  prompt: {
    fontSize: '20px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 0.5rem',
  },
  subtext: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: '0 0 1.25rem',
  },
  chipGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '0.75rem',
  },
  chip: {
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    fontSize: '13.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
    lineHeight: 1.4,
  },
  chipSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  chipCustom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  chipAdd: {
    background: 'transparent',
    border: '1px dashed #C5AE8A',
    color: '#854F0B',
    fontStyle: 'italic',
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#854F0B',
    fontSize: '20px',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
  },
  customInputRow: {
    display: 'flex',
    gap: '8px',
  },
  customInput: {
    flex: 1,
    padding: '12px 14px',
    border: '1px solid #C5AE8A',
    borderRadius: '12px',
    fontSize: '13.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    background: 'white',
  },
  customAddBtn: {
    padding: '0 18px',
    background: '#854F0B',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  helper: {
    fontSize: '11.5px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0.5rem 0 0',
    textAlign: 'center',
  },
  footer: {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  count: {
    fontSize: '11.5px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    textAlign: 'center',
  },
  primaryBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  markCard: {
    padding: '14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontFamily: 'inherit',
  },
  markCardCrossed: {
    background: 'linear-gradient(180deg, #FFF4ED 0%, #FBEADC 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.15)',
  },
  markCardLabel: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.4,
  },
  markCardState: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  revealTitle: {
    fontSize: '24px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 1.5rem',
    textAlign: 'center',
  },
  revealGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginBottom: '1.5rem',
  },
  revealColumn: {
    padding: '1rem',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
  },
  revealColumnTitle: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.75rem',
  },
  revealList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  revealItem: {
    fontSize: '13.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    padding: '6px 0',
    borderBottom: '0.5px solid #F0E9DC',
  },
  revealMirror: {
    fontSize: '14px',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
    padding: '8px 0',
    borderBottom: '0.5px solid #F0E9DC',
    listStyle: 'none',
  },
  revealMirrorSaid: {
    fontStyle: 'italic',
    color: '#2A1F15',
  },
  revealMirrorDid: {
    color: '#A14222',
    fontWeight: 500,
  },
  revealEmpty: {
    fontSize: '13px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  revealNote: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    textAlign: 'center',
    margin: '0 0 1rem',
  },
}