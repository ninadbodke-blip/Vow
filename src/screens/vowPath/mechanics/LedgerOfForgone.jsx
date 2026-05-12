import { useState } from 'react'

export default function LedgerOfForgone({ data, onSave, onComplete, saving }) {
  const {
    prompt,
    subtext,
    minSelections = 3,
    helperText,
    categories = [],
    allowCustom = true,
    customPrompt = 'Something else',
    selfNamingPrompt,
    selfNamingOptions,
  } = data

  const handleFinalize = onSave || onComplete

  // Phases: 'select' -> 'reveal' -> 'naming'
  const [phase, setPhase] = useState('select')
  const [selectedIds, setSelectedIds] = useState([])
  const [customLines, setCustomLines] = useState([])
  const [customInput, setCustomInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [selfNaming, setSelfNaming] = useState(null)

  const toggle = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const addCustomLine = () => {
    const trimmed = customInput.trim()
    if (trimmed.length > 0 && customLines.length < 5) {
      setCustomLines([...customLines, trimmed])
      setCustomInput('')
      setShowCustomInput(false)
    }
  }

  const removeCustomLine = (idx) => {
    setCustomLines(customLines.filter((_, i) => i !== idx))
  }

  const totalSelected = selectedIds.length + customLines.length
  const canProceedSelect = totalSelected >= minSelections

  // Compute the assembled ledger for reveal
  const assembledLedger = categories.map(cat => {
    const itemsSelected = cat.items.filter(item => selectedIds.includes(item.id))
    return { category: cat.label, key: cat.key, items: itemsSelected }
  }).filter(c => c.items.length > 0)

  const finalize = () => {
    handleFinalize({
      selected_ids: selectedIds,
      custom_lines: customLines,
      total_count: totalSelected,
      categories_touched: assembledLedger.map(c => c.key),
      self_naming: selfNaming,
    })
  }

  // ===================================================================
  // PHASE: SELECT
  // ===================================================================
  if (phase === 'select') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{prompt}</h2>
        {subtext && <p style={styles.subtext}>{subtext}</p>}

        {categories.map(cat => (
          <div key={cat.key} style={styles.categoryBlock}>
            <p style={styles.categoryLabel}>{cat.label}</p>
            <div style={styles.itemList}>
              {cat.items.map(item => {
                const selected = selectedIds.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    style={{
                      ...styles.item,
                      ...(selected ? styles.itemSelected : {}),
                    }}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {allowCustom && (
          <div style={styles.customSection}>
            <p style={styles.categoryLabel}>Something else</p>

            {customLines.map((line, idx) => (
              <div key={`custom_${idx}`} style={{ ...styles.item, ...styles.itemSelected, ...styles.itemCustom }}>
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

            {!showCustomInput && customLines.length < 5 && (
              <button
                onClick={() => setShowCustomInput(true)}
                style={{ ...styles.item, ...styles.itemAdd }}
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
                  placeholder="Type and add..."
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
        )}

        {helperText && <p style={styles.helper}>{helperText}</p>}

        <div style={styles.footer}>
          <p style={styles.count}>
            {totalSelected} selected{canProceedSelect ? '' : ` · need ${minSelections - totalSelected} more`}
          </p>
          <button
            onClick={() => setPhase('reveal')}
            disabled={!canProceedSelect}
            style={{
              ...styles.primaryBtn,
              ...(canProceedSelect ? {} : styles.primaryBtnDisabled),
            }}
          >
            See the ledger
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVEAL
  // ===================================================================
  if (phase === 'reveal') {
    return (
      <div style={styles.container}>
        <h2 style={styles.revealTitle}>The ledger.</h2>
        <p style={styles.revealSubtitle}>
          {totalSelected} things you've given up.
        </p>

        <div style={styles.ledgerCard}>
          {assembledLedger.map(cat => (
            <div key={cat.key} style={styles.ledgerCategory}>
              <p style={styles.ledgerCategoryLabel}>{cat.category}</p>
              <ul style={styles.ledgerList}>
                {cat.items.map(item => (
                  <li key={item.id} style={styles.ledgerItem}>{item.label}</li>
                ))}
              </ul>
            </div>
          ))}

          {customLines.length > 0 && (
            <div style={styles.ledgerCategory}>
              <p style={styles.ledgerCategoryLabel}>In your own words</p>
              <ul style={styles.ledgerList}>
                {customLines.map((line, idx) => (
                  <li key={`custom_${idx}`} style={styles.ledgerItem}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p style={styles.revealNote}>
          You named these. None of them came from us.
        </p>

        <div style={styles.footer}>
          <button onClick={() => setPhase('naming')} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: NAMING
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>{selfNamingPrompt}</h2>

      <div style={styles.namingList}>
        {selfNamingOptions.map(opt => {
          const selected = selfNaming === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setSelfNaming(opt.id)}
              style={{
                ...styles.namingCard,
                ...(selected ? styles.namingCardSelected : {}),
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <div style={styles.footer}>
        <button
          onClick={finalize}
          disabled={!selfNaming || saving}
          style={{
            ...styles.primaryBtn,
            ...((!selfNaming || saving) ? styles.primaryBtnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  )
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
  categoryBlock: {
    marginBottom: '1.5rem',
  },
  categoryLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.16em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.6rem',
  },
  itemList: {
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  item: {
    padding: '10px 12px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '10px',
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
  },
  itemSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  itemCustom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  itemAdd: {
    background: 'transparent',
    border: '1px dashed #C5AE8A',
    color: '#854F0B',
    fontStyle: 'italic',
  },
  removeBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '20px',
    cursor: 'pointer', padding: 0, lineHeight: 1,
  },
  customSection: {
    marginBottom: '1.5rem',
  },
  customInputRow: {
    display: 'flex', gap: '8px',
    marginTop: '6px',
  },
  customInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #C5AE8A',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    background: 'white',
  },
  customAddBtn: {
    padding: '0 16px',
    background: '#854F0B',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '10px',
    fontSize: '12px',
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
  revealTitle: {
    fontSize: '24px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    margin: '0 0 0.5rem', textAlign: 'center',
  },
  revealSubtitle: {
    fontSize: '13px', color: '#854F0B',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 1.5rem', textAlign: 'center',
  },
  ledgerCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '1rem',
  },
  ledgerCategory: {
    marginBottom: '1rem',
  },
  ledgerCategoryLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.5rem',
  },
  ledgerList: {
    margin: 0, padding: '0 0 0 1rem',
    listStyle: 'disc',
  },
  ledgerItem: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
    margin: '0 0 0.35rem',
  },
  revealNote: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.6, textAlign: 'center',
    margin: '0 0 1rem',
  },
  namingList: {
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  namingCard: {
    padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    fontSize: '14px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer', textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
  },
  namingCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  count: {
    fontSize: '11.5px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 8px', textAlign: 'center',
  },
  footer: {
    marginTop: '1.5rem',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  primaryBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: {
    opacity: 0.4, cursor: 'not-allowed',
    boxShadow: 'none',
  },
}