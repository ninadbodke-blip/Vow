import { useState } from 'react'

export default function ValuesPortrait({ data, onSave, saving }) {
  const {
    prompt,
    subtext,
    valueCategories,
    allowCustom,
    customPrompt,
    rankPrompt,
    rankSubtext,
  } = data

  // Phases: 'select' -> 'rank' -> 'review'
  const [phase, setPhase] = useState('select')

  const [selectedIds, setSelectedIds] = useState([]) // standard value ids
  const [customValues, setCustomValues] = useState([]) // [{id: 'c_0', label: '...'}]
  const [customInput, setCustomInput] = useState('')
  const [rankedTop5, setRankedTop5] = useState([]) // ordered ids (mix of standard + custom)

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    // If removing a value that's ranked, remove from rank too
    setRankedTop5(prev => prev.filter(rid => rid !== id))
  }

  const addCustom = () => {
    const text = customInput.trim()
    if (!text || customValues.length >= 4) return
    const newId = `custom_${customValues.length}_${Date.now()}`
    setCustomValues([...customValues, { id: newId, label: text }])
    setCustomInput('')
  }

  const removeCustom = (id) => {
    setCustomValues(customValues.filter(c => c.id !== id))
    setRankedTop5(prev => prev.filter(rid => rid !== id))
  }

  // Build a unified list of selected values for rank phase
  const allSelectedValues = (() => {
    const standardSelected = valueCategories.flatMap(cat =>
      cat.items
        .filter(item => selectedIds.includes(item.id))
        .map(item => ({ id: item.id, label: item.label, category: cat.label }))
    )
    const customSelected = customValues.map(c => ({ id: c.id, label: c.label, category: 'In your own words' }))
    return [...standardSelected, ...customSelected]
  })()

  const handleRankPick = (id) => {
    setRankedTop5(prev => {
      if (prev.includes(id)) {
        // Already ranked — unrank it
        return prev.filter(x => x !== id)
      }
      if (prev.length >= 5) return prev // max 5
      return [...prev, id]
    })
  }

  const totalSelected = selectedIds.length + customValues.length

  const finalize = () => {
    const rankedDetailed = rankedTop5.map((id, idx) => {
      const val = allSelectedValues.find(v => v.id === id)
      return {
        rank: idx + 1,
        id,
        label: val?.label,
        category: val?.category,
      }
    })

    onSave({
      all_selected: selectedIds,
      custom_values: customValues,
      ranked_top_5: rankedDetailed,
      total_count: totalSelected,
      surfaced_at: new Date().toISOString(),
    })
  }

  // ===================================================================
  // PHASE: SELECT
  // ===================================================================
  if (phase === 'select') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{prompt}</h2>
        <p style={styles.subtext}>{subtext}</p>

        {valueCategories.map(cat => (
          <div key={cat.key} style={styles.categoryBlock}>
            <p style={styles.categoryLabel}>{cat.label}</p>
            <div style={styles.itemList}>
              {cat.items.map(item => {
                const selected = selectedIds.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
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
            <p style={styles.categoryLabel}>Your own</p>

            {customValues.map(c => (
              <div key={c.id} style={{ ...styles.item, ...styles.itemSelected, ...styles.itemCustom }}>
                <span>{c.label}</span>
                <button onClick={() => removeCustom(c.id)} style={styles.removeBtn}>×</button>
              </div>
            ))}

            {customValues.length < 4 && (
              <div style={styles.customInputRow}>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={customPrompt}
                  style={styles.customInput}
                  onKeyDown={(e) => { if (e.key === 'Enter') addCustom() }}
                />
                <button onClick={addCustom} style={styles.customAddBtn}>Add</button>
              </div>
            )}
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.countLine}>
            {totalSelected} values tapped
            {totalSelected < 5 && ' · need at least 5 to rank'}
          </p>
          <button
            onClick={() => setPhase('rank')}
            disabled={totalSelected < 5}
            style={{
              ...styles.primaryBtn,
              ...(totalSelected < 5 ? styles.primaryBtnDisabled : {}),
            }}
          >
            Rank the top 5
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: RANK
  // ===================================================================
  if (phase === 'rank') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{rankPrompt}</h2>
        <p style={styles.subtext}>{rankSubtext}</p>

        <div style={styles.rankList}>
          {allSelectedValues.map(val => {
            const idx = rankedTop5.indexOf(val.id)
            const rank = idx >= 0 ? idx + 1 : null
            return (
              <button
                key={val.id}
                onClick={() => handleRankPick(val.id)}
                style={{
                  ...styles.rankCard,
                  ...(rank ? styles.rankCardSelected : {}),
                }}
              >
                <div style={styles.rankCardContent}>
                  <p style={styles.rankValueLabel}>{val.label}</p>
                  <p style={styles.rankValueCategory}>{val.category}</p>
                </div>
                {rank && (
                  <div style={styles.rankBadge}>
                    <span style={styles.rankNum}>{rank}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <p style={styles.countLine}>
            {rankedTop5.length} of 5 ranked
            {rankedTop5.length > 0 && rankedTop5.length < 5 && ` · ${5 - rankedTop5.length} more`}
          </p>
          <div style={styles.btnRow}>
            <button onClick={() => setPhase('select')} style={styles.secondaryBtn}>‹ Back</button>
            <button
              onClick={() => setPhase('review')}
              disabled={rankedTop5.length !== 5}
              style={{
                ...styles.primaryBtnFlex,
                ...(rankedTop5.length !== 5 ? styles.primaryBtnDisabled : {}),
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVIEW
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>Your top five.</h2>
      <p style={styles.subtext}>The values you would not trade.</p>

      <div style={styles.portraitCard}>
        {rankedTop5.map((id, idx) => {
          const val = allSelectedValues.find(v => v.id === id)
          if (!val) return null
          return (
            <div key={id} style={styles.portraitRow}>
              <div style={styles.portraitRank}>
                <span style={styles.portraitRankNum}>{idx + 1}</span>
              </div>
              <div style={styles.portraitContent}>
                <p style={styles.portraitLabel}>{val.label}</p>
                <p style={styles.portraitCategory}>{val.category}</p>
              </div>
            </div>
          )
        })}
      </div>

      <p style={styles.note}>
        Cultural capital is built on values made explicit. These five are yours now.
      </p>

      <div style={styles.footer}>
        <button onClick={() => setPhase('rank')} style={styles.secondaryBtn}>‹ Back</button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Save the portrait'}
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
  categoryBlock: { marginBottom: '1.25rem' },
  categoryLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.6rem',
  },
  itemList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  item: {
    padding: '10px 12px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '10px',
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer', textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
    width: '100%',
  },
  itemSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  itemCustom: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
  },
  customSection: { marginBottom: '1.25rem' },
  customInputRow: { display: 'flex', gap: '8px', marginTop: '6px' },
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
  },
  removeBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '18px',
    cursor: 'pointer', padding: 0, lineHeight: 1,
  },
  rankList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  rankCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    width: '100%',
    gap: '10px',
    transition: 'all 0.15s',
  },
  rankCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  rankCardContent: { flex: 1, minWidth: 0 },
  rankValueLabel: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 2px',
    lineHeight: 1.3,
  },
  rankValueCategory: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  rankBadge: {
    width: '32px', height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)',
    color: '#FAF7F1',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 6px rgba(197,87,44,0.30)',
  },
  rankNum: {
    fontSize: '15px',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  portraitCard: {
    background: '#FDFBF6',
    border: '1px solid #E0D5C2',
    borderRadius: '16px',
    padding: '20px 18px',
    marginBottom: '1rem',
    boxShadow: '0 4px 12px rgba(80,50,20,0.06)',
  },
  portraitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    paddingBottom: '0.85rem',
    marginBottom: '0.85rem',
    borderBottom: '0.5px solid #E8DFD0',
  },
  portraitRank: {
    width: '36px', height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  portraitRankNum: {
    fontSize: '15px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  portraitContent: { flex: 1 },
  portraitLabel: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 3px',
    lineHeight: 1.35,
  },
  portraitCategory: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  note: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1rem',
    textAlign: 'center',
  },
  countLine: {
    fontSize: '11.5px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 8px', textAlign: 'center',
  },
  footer: { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' },
  btnRow: { display: 'flex', gap: '8px' },
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