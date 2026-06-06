import { useState } from 'react'

// Day 8 — anhedonia. Map the flatness, learn the move (behavioral activation),
// commit to two still-available things to return to daily, then name how it lands.
export default function AnhedoniaAssessment({ data, onSave, saving }) {
  const {
    prompt,
    subtext,
    categories,
    revealTeaching,
    anchorHeader = 'Choose two to return to.',
    anchorSubtext = 'From what still lands, pick two to return to every day this week.',
    anchorNote = 'Small. Daily. Even on the days they give almost nothing back — that is how the signal comes back online.',
    allowCustom = true,
    customPrompt = 'Something else that still lands',
    followUpHeader,
    followUpOptions,
  } = data

  // Phases: 'select' -> 'reveal' -> 'anchor' -> 'naming'
  const [phase, setPhase] = useState('select')
  const [flatIds, setFlatIds] = useState([])
  const [stillWorksIds, setStillWorksIds] = useState([])
  const [stillCustom, setStillCustom] = useState([])
  const [customInput, setCustomInput] = useState('')
  const [dailyReturns, setDailyReturns] = useState([]) // max 2
  const [followUp, setFollowUp] = useState(null)

  const flatCategories = categories.filter((c) => c.key !== 'whats_available')
  const positiveCategory = categories.find((c) => c.key === 'whats_available')
  const positiveItems = positiveCategory ? positiveCategory.items : []
  const customItems = stillCustom.map((t) => ({ id: `custom:${t}`, label: t }))
  const anchorCandidates = [...positiveItems.filter((i) => stillWorksIds.includes(i.id)), ...customItems]
  // if they marked fewer than 2 still-available, widen the pool to the full positive list
  const anchorPool = anchorCandidates.length >= 2 ? anchorCandidates : [...positiveItems, ...customItems]

  const toggleFlat = (id) =>
    setFlatIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const toggleStillWorks = (id) =>
    setStillWorksIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const addCustom = () => {
    const t = customInput.trim()
    if (!t || stillCustom.includes(t)) return
    setStillCustom((prev) => [...prev, t])
    setCustomInput('')
  }
  const removeCustom = (t) => {
    setStillCustom((prev) => prev.filter((x) => x !== t))
    setDailyReturns((prev) => prev.filter((x) => x !== `custom:${t}`))
  }

  const toggleReturn = (id) =>
    setDailyReturns((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return prev
      return [...prev, id]
    })

  const labelForReturn = (id) =>
    id.startsWith('custom:') ? id.slice(7) : (positiveItems.find((i) => i.id === id) || {}).label || id

  const finalize = () => {
    onSave({
      flat_areas: flatIds,
      still_available: stillWorksIds,
      still_custom: stillCustom,
      daily_returns: dailyReturns,
      daily_return_labels: dailyReturns.map(labelForReturn),
      flat_count: flatIds.length,
      still_available_count: stillWorksIds.length + stillCustom.length,
      follow_up: followUp,
      built_at: new Date().toISOString(),
    })
  }

  // ===================================================================
  // PHASE: SELECT
  // ===================================================================
  if (phase === 'select') {
    const flatTotal = flatIds.length
    const stillTotal = stillWorksIds.length + stillCustom.length
    return (
      <div style={styles.container}>
        <p style={styles.eyebrow}>Day 8 · The flatness</p>
        <h2 style={styles.prompt}>{prompt}</h2>
        <p style={styles.subtext}>{subtext}</p>

        {flatCategories.map((cat) => (
          <div key={cat.key} style={styles.categoryBlock}>
            <p style={styles.categoryLabel}>{cat.label}</p>
            <div style={styles.itemList}>
              {cat.items.map((item) => {
                const selected = flatIds.includes(item.id)
                return (
                  <button key={item.id} onClick={() => toggleFlat(item.id)}
                    style={{ ...styles.item, ...(selected ? styles.itemSelectedFlat : {}) }}>
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
            <p style={styles.positiveCategoryHint}>The flatness is not absolute. Tap what is still landing for you — even a little.</p>
            <div style={styles.itemList}>
              {positiveCategory.items.map((item) => {
                const selected = stillWorksIds.includes(item.id)
                return (
                  <button key={item.id} onClick={() => toggleStillWorks(item.id)}
                    style={{ ...styles.item, ...(selected ? styles.itemSelectedPositive : {}) }}>
                    {item.label}
                  </button>
                )
              })}
              {customItems.map((ci) => (
                <button key={ci.id} onClick={() => removeCustom(ci.label)}
                  style={{ ...styles.item, ...styles.itemSelectedPositive, ...styles.customChip }}>
                  <span>{ci.label}</span><span style={styles.removeX}>×</span>
                </button>
              ))}
            </div>
            {allowCustom && (
              <div style={styles.customInputRow}>
                <input type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={customPrompt} style={styles.customInput}
                  onKeyDown={(e) => { if (e.key === 'Enter') addCustom() }} />
                <button onClick={addCustom} style={styles.customAddBtn}>Add</button>
              </div>
            )}
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.countLine}>{flatTotal} areas flat · {stillTotal} still available</p>
          <button onClick={() => setPhase('reveal')} disabled={flatTotal === 0 && stillTotal === 0}
            style={{ ...styles.primaryBtn, ...((flatTotal === 0 && stillTotal === 0) ? styles.primaryBtnDisabled : {}) }}>
            See the assessment
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVEAL — the map + the move (behavioral activation)
  // ===================================================================
  if (phase === 'reveal') {
    const stillSelected = [...positiveItems.filter((i) => stillWorksIds.includes(i.id)), ...customItems]
    return (
      <div style={styles.container}>
        <h2 style={styles.revealTitle}>The assessment.</h2>

        {flatIds.length > 0 && (
          <div style={styles.assessCard}>
            <p style={styles.assessLabel}>Where the flatness is</p>
            {flatCategories.map((cat) => {
              const catItems = cat.items.filter((i) => flatIds.includes(i.id))
              if (catItems.length === 0) return null
              return (
                <div key={cat.key} style={styles.assessCategoryRow}>
                  <p style={styles.assessCategoryLabel}>{cat.label}</p>
                  <ul style={styles.assessList}>{catItems.map((i) => <li key={i.id} style={styles.assessItem}>{i.label}</li>)}</ul>
                </div>
              )
            })}
          </div>
        )}

        {stillSelected.length > 0 && (
          <div style={styles.positiveAssessCard}>
            <p style={styles.positiveAssessLabel}>What is still available</p>
            <ul style={styles.assessList}>{stillSelected.map((i) => <li key={i.id} style={styles.assessItem}>{i.label}</li>)}</ul>
          </div>
        )}

        {revealTeaching && (
          <div style={styles.teachingCard}>
            <p style={styles.teachingLabel}>The move, while it's flat</p>
            <p style={styles.teachingText}>{revealTeaching}</p>
          </div>
        )}

        <div style={styles.footer}>
          <button onClick={() => setPhase('select')} style={styles.secondaryBtn}>‹ Back</button>
          <button onClick={() => { setPhase('anchor'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={styles.primaryBtnFlex}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: ANCHOR — commit to two still-available things, daily
  // ===================================================================
  if (phase === 'anchor') {
    const full = dailyReturns.length >= 2
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{anchorHeader}</h2>
        <p style={styles.subtext}>{anchorSubtext}</p>

        <div style={styles.itemList}>
          {anchorPool.map((opt) => {
            const selected = dailyReturns.includes(opt.id)
            const dimmed = full && !selected
            return (
              <button key={opt.id} onClick={() => toggleReturn(opt.id)}
                style={{ ...styles.item, ...(selected ? styles.itemSelectedPositive : {}), ...(dimmed ? styles.itemDimmed : {}) }}>
                <span style={styles.tick}>{selected ? '◆' : '◇'}</span>{opt.label}
              </button>
            )
          })}
        </div>

        <p style={styles.anchorNote}>{anchorNote}</p>

        <div style={styles.footer}>
          <button onClick={() => setPhase('reveal')} style={styles.secondaryBtn}>‹ Back</button>
          <button onClick={() => { setPhase('naming'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            disabled={dailyReturns.length < 2}
            style={{ ...styles.primaryBtnFlex, ...(dailyReturns.length < 2 ? styles.primaryBtnDisabled : {}) }}>
            {dailyReturns.length < 2 ? 'Pick two' : 'Continue'}
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

      {dailyReturns.length === 2 && (
        <div style={styles.returnsRecap}>
          <p style={styles.returnsRecapLabel}>Returning to, daily</p>
          <p style={styles.returnsRecapText}>{labelForReturn(dailyReturns[0])} · {labelForReturn(dailyReturns[1])}</p>
        </div>
      )}

      <div style={styles.optionList}>
        {followUpOptions.map((opt) => {
          const selected = followUp === opt.id
          return (
            <button key={opt.id} onClick={() => setFollowUp(opt.id)}
              style={{ ...styles.optionCard, ...(selected ? styles.optionCardSelected : {}) }}>
              {opt.label}
            </button>
          )
        })}
      </div>

      <div style={styles.footer}>
        <button onClick={() => setPhase('anchor')} style={styles.secondaryBtn}>‹ Back</button>
        <button onClick={finalize} disabled={!followUp || saving}
          style={{ ...styles.primaryBtnFlex, ...((!followUp || saving) ? styles.primaryBtnDisabled : {}) }}>
          {saving ? 'Saving…' : 'Save the assessment'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { paddingTop: '0.5rem' },
  eyebrow: { fontSize: '11px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: 'Georgia, serif', margin: '0 0 0.75rem' },
  prompt: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.3, margin: '0 0 0.5rem' },
  subtext: { fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 1.25rem' },
  categoryBlock: { marginBottom: '1.25rem' },
  categoryLabel: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 0.6rem' },
  positiveCategoryBlock: { background: '#FDFBF6', border: '0.5px solid #E0D5C2', borderLeft: '4px solid #7A8C5A', borderRadius: '14px', padding: '14px', marginBottom: '1.25rem' },
  positiveCategoryLabel: { fontSize: '12px', color: '#3B6D11', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 0.35rem' },
  positiveCategoryHint: { fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 0.85rem', lineHeight: 1.5 },
  itemList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  item: { display: 'flex', alignItems: 'center', gap: '9px', padding: '11px 13px', background: '#FDFBF6', border: '0.5px solid #E0D5C2', borderRadius: '11px', fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4, transition: 'all 0.15s', width: '100%' },
  itemSelectedFlat: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '1px solid #C5572C', boxShadow: '0 2px 8px rgba(197,87,44,0.12)' },
  itemSelectedPositive: { background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)', border: '1px solid #7A8C5A', boxShadow: '0 2px 8px rgba(122,140,90,0.18)', color: '#2A1F15' },
  itemDimmed: { opacity: 0.4 },
  tick: { color: '#3B6D11', fontSize: '11px', flexShrink: 0 },
  customChip: { justifyContent: 'space-between' },
  removeX: { color: '#3B6D11', fontSize: '16px', lineHeight: 1 },
  customInputRow: { display: 'flex', gap: '8px', marginTop: '8px' },
  customInput: { flex: 1, padding: '10px 12px', border: '1px solid #B8C79A', borderRadius: '10px', fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', outline: 'none', background: 'white' },
  customAddBtn: { padding: '0 16px', background: '#5C6E3C', color: '#FAF7F1', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' },
  revealTitle: { fontSize: '24px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 1.25rem', textAlign: 'center' },
  assessCard: { background: 'linear-gradient(180deg, #FDFBF6 0%, #F7F0E3 100%)', border: '0.5px solid #EADFCB', borderRadius: '13px', padding: '14px', marginBottom: '10px' },
  positiveAssessCard: { background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)', border: '0.5px solid #7A8C5A', borderRadius: '14px', padding: '14px', marginBottom: '10px' },
  assessLabel: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 0.75rem' },
  positiveAssessLabel: { fontSize: '11px', color: '#3B6D11', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 0.6rem' },
  assessCategoryRow: { marginBottom: '0.85rem' },
  assessCategoryLabel: { fontSize: '12px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 500, margin: '0 0 0.35rem' },
  assessList: { margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' },
  assessItem: { fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.55, margin: '0 0 0.3rem' },
  teachingCard: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F5EEDF 100%)', borderLeft: '3px solid #C5572C', borderRadius: '0 12px 12px 0', padding: '16px 16px', marginTop: '12px' },
  teachingLabel: { fontSize: '10px', color: '#C5572C', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 600, fontFamily: 'Georgia, serif', margin: '0 0 0.5rem' },
  teachingText: { fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.62, margin: 0 },
  anchorNote: { fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '1rem 0 0', textAlign: 'center' },
  returnsRecap: { background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)', border: '0.5px solid #7A8C5A', borderRadius: '12px', padding: '12px 14px', marginBottom: '1rem' },
  returnsRecapLabel: { fontSize: '10px', color: '#3B6D11', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 0.3rem' },
  returnsRecapText: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.45 },
  optionList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  optionCard: { padding: '13px 15px', background: '#FDFBF6', border: '0.5px solid #E0D5C2', borderRadius: '11px', fontSize: '14px', color: '#3A2D1E', fontFamily: 'Georgia, serif', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4, transition: 'all 0.15s' },
  optionCardSelected: { background: 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)', border: '1.5px solid #8A5A1A', boxShadow: '0 1px 6px rgba(110,68,16,0.12)', fontWeight: 600, color: '#5A3A0E' },
  countLine: { fontSize: '11.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 8px', textAlign: 'center' },
  footer: { marginTop: '1.5rem', display: 'flex', gap: '8px' },
  primaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  primaryBtnFlex: { flex: 1, padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  primaryBtnDisabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  secondaryBtn: { padding: '14px 20px', background: 'transparent', color: '#8A7355', border: '0.5px solid #D9C9B0', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif' },
}
