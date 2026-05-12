import { useState } from 'react'

export default function EnvironmentMapper({ data, onSave, saving }) {
  const {
    zones,
    allowCustomPerZone,
    customPrompt,
    selfNamingPrompt,
    selfNamingOptions,
  } = data

  // Phases: 'zone:0', 'zone:1', 'zone:2', 'zone:3', 'review', 'naming'
  const [phase, setPhase] = useState('zone:0')

  // Per-zone selections
  const [selections, setSelections] = useState({})
  const [customLines, setCustomLines] = useState({})
  const [customInputs, setCustomInputs] = useState({})
  const [selfNaming, setSelfNaming] = useState(null)

  const currentZoneIdx = phase.startsWith('zone:') ? parseInt(phase.split(':')[1], 10) : -1
  const zone = currentZoneIdx >= 0 ? zones[currentZoneIdx] : null

  const toggleItem = (zoneId, itemId) => {
    setSelections(prev => {
      const zoneSelections = prev[zoneId] || []
      return {
        ...prev,
        [zoneId]: zoneSelections.includes(itemId)
          ? zoneSelections.filter(x => x !== itemId)
          : [...zoneSelections, itemId]
      }
    })
  }

  const addCustomLine = (zoneId) => {
    const text = (customInputs[zoneId] || '').trim()
    if (!text) return
    const current = customLines[zoneId] || []
    if (current.length >= 3) return
    setCustomLines(prev => ({ ...prev, [zoneId]: [...current, text] }))
    setCustomInputs(prev => ({ ...prev, [zoneId]: '' }))
  }

  const removeCustomLine = (zoneId, idx) => {
    const current = customLines[zoneId] || []
    setCustomLines(prev => ({ ...prev, [zoneId]: current.filter((_, i) => i !== idx) }))
  }

  const advance = () => {
    if (currentZoneIdx < zones.length - 1) {
      setPhase(`zone:${currentZoneIdx + 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setPhase('review')
    }
  }

  const goBackPhase = () => {
    if (currentZoneIdx > 0) {
      setPhase(`zone:${currentZoneIdx - 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const totalSelected = Object.values(selections).reduce((sum, arr) => sum + arr.length, 0)
    + Object.values(customLines).reduce((sum, arr) => sum + arr.length, 0)

  const finalize = () => {
    onSave({
      selections,
      custom_lines: customLines,
      total_actions: totalSelected,
      self_naming: selfNaming,
    })
  }

  // ===================================================================
  // PHASE: ZONE
  // ===================================================================
  if (zone) {
    const zoneSelections = selections[zone.id] || []
    const zoneCustom = customLines[zone.id] || []
    const customInput = customInputs[zone.id] || ''

    return (
      <div style={styles.container}>
        <p style={styles.progressLabel}>Zone {currentZoneIdx + 1} of {zones.length}</p>
        <h2 style={styles.zoneTitle}>{zone.label}</h2>
        <p style={styles.subtext}>{zone.prompt}</p>

        <div style={styles.optionList}>
          {zone.items.map(item => {
            const selected = zoneSelections.includes(item.id)
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(zone.id, item.id)}
                style={{
                  ...styles.optionCard,
                  ...(selected ? styles.optionCardSelected : {}),
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {allowCustomPerZone && (
          <div style={styles.customSection}>
            {zoneCustom.map((line, idx) => (
              <div key={`cl_${idx}`} style={{ ...styles.optionCard, ...styles.optionCardSelected, ...styles.customRow }}>
                <span>{line}</span>
                <button onClick={() => removeCustomLine(zone.id, idx)} style={styles.removeBtn}>×</button>
              </div>
            ))}

            {zoneCustom.length < 3 && (
              <div style={styles.customInputRow}>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInputs(prev => ({ ...prev, [zone.id]: e.target.value }))}
                  placeholder={customPrompt}
                  style={styles.customInput}
                  onKeyDown={(e) => { if (e.key === 'Enter') addCustomLine(zone.id) }}
                />
                <button onClick={() => addCustomLine(zone.id)} style={styles.customAddBtn}>Add</button>
              </div>
            )}
          </div>
        )}

        <div style={styles.footer}>
          {currentZoneIdx > 0 && (
            <button onClick={goBackPhase} style={styles.secondaryBtn}>‹ Back</button>
          )}
          <button onClick={advance} style={styles.primaryBtnFlex}>
            {currentZoneIdx === zones.length - 1 ? 'Review' : `Next: ${zones[currentZoneIdx + 1].label.toLowerCase()}`}
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVIEW
  // ===================================================================
  if (phase === 'review') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>Your action list.</h2>
        <p style={styles.subtext}>{totalSelected} actions across {zones.filter(z => (selections[z.id]?.length || 0) + (customLines[z.id]?.length || 0) > 0).length} zones.</p>

        <div style={styles.reviewList}>
          {zones.map(z => {
            const zoneSel = selections[z.id] || []
            const zoneCustom = customLines[z.id] || []
            if (zoneSel.length === 0 && zoneCustom.length === 0) return null
            return (
              <div key={z.id} style={styles.reviewCard}>
                <p style={styles.reviewLabel}>{z.label}</p>
                <ul style={styles.reviewItemList}>
                  {zoneSel.map(itemId => {
                    const item = z.items.find(i => i.id === itemId)
                    return item ? <li key={itemId} style={styles.reviewItem}>{item.label}</li> : null
                  })}
                  {zoneCustom.map((line, idx) => (
                    <li key={`c${idx}`} style={styles.reviewItem}>{line}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase(`zone:${zones.length - 1}`)} style={styles.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('naming')} style={styles.primaryBtnFlex}>Continue</button>
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
  zoneTitle: {
    fontSize: '24px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.25,
    margin: '0 0 0.5rem',
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
  optionList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  optionCard: {
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    fontSize: '13.5px', color: '#2A1F15',
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
  customRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  customSection: { marginTop: '8px' },
  customInputRow: { display: 'flex', gap: '8px', marginTop: '8px' },
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
  reviewList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  reviewCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px',
  },
  reviewLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.5rem',
  },
  reviewItemList: { margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' },
  reviewItem: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    margin: '0 0 0.25rem',
  },
  namingList: { display: 'flex', flexDirection: 'column', gap: '10px' },
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