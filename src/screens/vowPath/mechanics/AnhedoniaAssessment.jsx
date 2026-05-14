import { useState } from 'react'

export default function AnhedoniaAssessment({ data, onSave, saving }) {
  const {
    prompt,
    subtext,
    categories,
    followUpHeader,
    followUpOptions,
  } = data

  // Phases: 'select' -> 'reveal' -> 'naming'
  const [phase, setPhase] = useState('select')

  const [flatIds, setFlatIds] = useState([])
  const [stillWorksIds, setStillWorksIds] = useState([])
  const [followUp, setFollowUp] = useState(null)

  // Categories split: "whats_available" is the positive category
  const flatCategories = categories.filter(c => c.key !== 'whats_available')
  const positiveCategory = categories.find(c => c.key === 'whats_available')

  const toggleFlat = (id) => {
    setFlatIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleStillWorks = (id) => {
    setStillWorksIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const finalize = () => {
    onSave({
      flat_areas: flatIds,
      still_available: stillWorksIds,
      flat_count: flatIds.length,
      still_available_count: stillWorksIds.length,
      follow_up: followUp,
    })
  }

  // ===================================================================
  // PHASE: SELECT
  // ===================================================================
  if (phase === 'select') {
    const flatTotal = flatIds.length
    const stillTotal = stillWorksIds.length

    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{prompt}</h2>
        <p style={styles.subtext}>{subtext}</p>

        {flatCategories.map(cat => (
          <div key={cat.key} style={styles.categoryBlock}>
            <p style={styles.categoryLabel}>{cat.label}</p>
            <div style={styles.itemList}>
              {cat.items.map(item => {
                const selected = flatIds.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleFlat(item.id)}
                    style={{
                      ...styles.item,
                      ...(selected ? styles.itemSelectedFlat : {}),
                    }}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {positiveCategory && (
          <div style={styles.positiveCategoryBlock}>
            <p style={styles.positiveCategoryLabel}>{positiveCategory.label}</p>
            <p style={styles.positiveCategoryHint}>
              The flatness is not absolute. Tap what is still landing for you.
            </p>
            <div style={styles.itemList}>
              {positiveCategory.items.map(item => {
                const selected = stillWorksIds.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleStillWorks(item.id)}
                    style={{
                      ...styles.item,
                      ...(selected ? styles.itemSelectedPositive : {}),
                    }}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.countLine}>
            {flatTotal} areas flat · {stillTotal} still available
          </p>
          <button
            onClick={() => setPhase('reveal')}
            disabled={flatTotal === 0 && stillTotal === 0}
            style={{
              ...styles.primaryBtn,
              ...((flatTotal === 0 && stillTotal === 0) ? styles.primaryBtnDisabled : {}),
            }}
          >
            See the assessment
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
        <h2 style={styles.revealTitle}>The assessment.</h2>

        {flatIds.length > 0 && (
          <div style={styles.assessCard}>
            <p style={styles.assessLabel}>Where the flatness is</p>
            {flatCategories.map(cat => {
              const catItems = cat.items.filter(i => flatIds.includes(i.id))
              if (catItems.length === 0) return null
              return (
                <div key={cat.key} style={styles.assessCategoryRow}>
                  <p style={styles.assessCategoryLabel}>{cat.label}</p>
                  <ul style={styles.assessList}>
                    {catItems.map(i => (
                      <li key={i.id} style={styles.assessItem}>{i.label}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}

        {stillWorksIds.length > 0 && positiveCategory && (
          <div style={styles.positiveAssessCard}>
            <p style={styles.positiveAssessLabel}>What is still available</p>
            <ul style={styles.assessList}>
              {positiveCategory.items.filter(i => stillWorksIds.includes(i.id)).map(i => (
                <li key={i.id} style={styles.assessItem}>{i.label}</li>
              ))}
            </ul>
            <p style={styles.positiveNote}>
              These are worth returning to over the next two weeks.
            </p>
          </div>
        )}

        <p style={styles.revealNote}>
          The flatness has a name and a shape now. It is not who you are. It is the dopamine system recalibrating.
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
      <h2 style={styles.prompt}>{followUpHeader}</h2>

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
          {saving ? 'Saving...' : 'Save the assessment'}
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
  positiveCategoryBlock: {
    background: '#FDFBF6',
    border: '0.5px solid #E0D5C2',
    borderLeft: '4px solid #7A8C5A',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '1.25rem',
  },
  positiveCategoryLabel: {
    fontSize: '12px', color: '#3B6D11',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.35rem',
  },
  positiveCategoryHint: {
    fontSize: '12px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 0.85rem',
    lineHeight: 1.5,
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
  itemSelectedFlat: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  itemSelectedPositive: {
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '1px solid #7A8C5A',
    boxShadow: '0 2px 8px rgba(122,140,90,0.18)',
    color: '#2A1F15',
  },
  revealTitle: {
    fontSize: '24px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    margin: '0 0 1.25rem', textAlign: 'center',
  },
  assessCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '10px',
  },
  positiveAssessCard: {
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '0.5px solid #7A8C5A',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '10px',
  },
  assessLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.75rem',
  },
  positiveAssessLabel: {
    fontSize: '11px', color: '#3B6D11',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.6rem',
  },
  assessCategoryRow: { marginBottom: '0.85rem' },
  assessCategoryLabel: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontWeight: 500,
    margin: '0 0 0.35rem',
  },
  assessList: { margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' },
  assessItem: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
    margin: '0 0 0.3rem',
  },
  positiveNote: {
    fontSize: '12.5px',
    color: '#3B6D11',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0.75rem 0 0',
    lineHeight: 1.55,
  },
  revealNote: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.65, textAlign: 'center',
    margin: '1rem 0 0',
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