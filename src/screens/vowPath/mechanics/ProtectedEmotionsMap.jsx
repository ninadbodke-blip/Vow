import { useState } from 'react'

export default function ProtectedEmotionsMap({ data, onSave, saving }) {
  const {
    prompt,
    subtext,
    emotionCategories,
    allowCustom,
    customPrompt,
    followUpPrompt,
    followUpOptions,
  } = data

  // Phases: 'select' -> 'reveal' -> 'naming'
  const [phase, setPhase] = useState('select')

  const [selectedIds, setSelectedIds] = useState([])
  const [customEmotions, setCustomEmotions] = useState([])
  const [customInput, setCustomInput] = useState('')
  const [followUp, setFollowUp] = useState(null)

  const toggle = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (trimmed.length > 0 && customEmotions.length < 4) {
      setCustomEmotions([...customEmotions, trimmed])
      setCustomInput('')
    }
  }

  const removeCustom = (idx) => {
    setCustomEmotions(customEmotions.filter((_, i) => i !== idx))
  }

  const totalSelected = selectedIds.length + customEmotions.length

  const assembledMap = emotionCategories.map(cat => {
    const itemsSelected = cat.items.filter(item => selectedIds.includes(item.id))
    return { category: cat.label, key: cat.key, items: itemsSelected }
  }).filter(c => c.items.length > 0)

  const finalize = () => {
    onSave({
      selected_emotions: selectedIds,
      custom_emotions: customEmotions,
      total_count: totalSelected,
      categories_touched: assembledMap.map(c => c.key),
      follow_up: followUp,
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

        {emotionCategories.map(cat => (
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

            {customEmotions.map((label, idx) => (
              <div key={`ce_${idx}`} style={{ ...styles.item, ...styles.itemSelected, ...styles.itemCustom }}>
                <span>{label}</span>
                <button onClick={() => removeCustom(idx)} style={styles.removeBtn}>×</button>
              </div>
            ))}

            {customEmotions.length < 4 && (
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
            {totalSelected} selected
          </p>
          <button
            onClick={() => setPhase('reveal')}
            disabled={totalSelected === 0}
            style={{
              ...styles.primaryBtn,
              ...(totalSelected === 0 ? styles.primaryBtnDisabled : {}),
            }}
          >
            See the map
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
        <h2 style={styles.revealTitle}>The map.</h2>
        <p style={styles.revealSubtitle}>
          {totalSelected} emotions the substance was helping you not feel.
        </p>

        <div style={styles.mapCard}>
          {assembledMap.map(cat => (
            <div key={cat.key} style={styles.mapCategory}>
              <p style={styles.mapCategoryLabel}>{cat.category}</p>
              <ul style={styles.mapList}>
                {cat.items.map(item => (
                  <li key={item.id} style={styles.mapItem}>{item.label}</li>
                ))}
              </ul>
            </div>
          ))}

          {customEmotions.length > 0 && (
            <div style={styles.mapCategory}>
              <p style={styles.mapCategoryLabel}>In your own words</p>
              <ul style={styles.mapList}>
                {customEmotions.map((label, idx) => (
                  <li key={`c_${idx}`} style={styles.mapItem}>{label}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p style={styles.revealNote}>
          The substance was a way of not feeling these. Without it, they surface.
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
      <h2 style={styles.prompt}>{followUpPrompt}</h2>

      <div style={styles.optionList}>
        {followUpOptions.map(opt => {
          const selected = followUp === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setFollowUp(opt.id)}
              style={{
                ...styles.optionCard,
                ...(selected ? styles.optionCardSelected : {}),
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
          disabled={!followUp || saving}
          style={{
            ...styles.primaryBtn,
            ...((!followUp || saving) ? styles.primaryBtnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Save the map'}
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
  categoryBlock: { marginBottom: '1.5rem' },
  categoryLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.16em',
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
  customSection: { marginBottom: '1.5rem' },
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
  mapCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '1rem',
  },
  mapCategory: { marginBottom: '1rem' },
  mapCategoryLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.5rem',
  },
  mapList: { margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' },
  mapItem: {
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
  optionList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  optionCard: {
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
  optionCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  countLine: {
    fontSize: '11.5px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 8px', textAlign: 'center',
  },
  footer: { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' },
  primaryBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
}