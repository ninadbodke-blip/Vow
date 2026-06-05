import { useState } from 'react'

// Daily anchors — pick TWO morning and TWO evening on a single screen.
// onSave shape: { anchors: [{ time_window, anchor_id, anchor_label, is_custom }], why_text }
export default function DailyAnchorPicker({ data, onSave, saving }) {
  const {
    morningOptions = [],
    eveningOptions = [],
    allowCustom = true,
    customPrompt = 'Your own',
    whyTheseHeader = 'Why these four?',
    whyTheseSubtext = 'One sentence. Optional, but worth doing.',
    perGroup = 2,
  } = data

  // Phases: 'select' -> 'why' -> 'review'
  const [phase, setPhase] = useState('select')
  const [morning, setMorning] = useState([])   // array of option-id or 'custom:text', max `perGroup`
  const [evening, setEvening] = useState([])
  const [customMorning, setCustomMorning] = useState('')
  const [customEvening, setCustomEvening] = useState('')
  const [whyText, setWhyText] = useState('')

  const toggle = (sel, setSel, id) => {
    setSel((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= perGroup) return prev   // capped — must deselect first
      return [...prev, id]
    })
  }

  const addCustom = (sel, setSel, text, clear) => {
    const t = (text || '').trim()
    if (!t) return
    const val = `custom:${t}`
    setSel((prev) => {
      if (prev.includes(val) || prev.length >= perGroup) return prev
      return [...prev, val]
    })
    clear()
  }

  const labelFor = (options, sel) =>
    sel.startsWith('custom:') ? sel.slice(7) : (options.find((o) => o.id === sel)?.label || sel)

  const bothChosen = morning.length === perGroup && evening.length === perGroup

  const finalize = () => {
    const toRows = (sel, options, tw) =>
      sel.map((s) => {
        const isCustom = s.startsWith('custom:')
        return {
          time_window: tw,
          anchor_id: isCustom ? null : s,
          anchor_label: labelFor(options, s),
          is_custom: isCustom,
        }
      })
    onSave({
      anchors: [...toRows(morning, morningOptions, 'morning'), ...toRows(evening, eveningOptions, 'evening')],
      why_text: whyText.trim() || null,
    })
  }

  // ----- a reusable picker group -----
  const Group = ({ title, options, sel, setSel, customText, setCustomText }) => {
    const full = sel.length >= perGroup
    return (
      <div style={styles.group}>
        <div style={styles.groupHead}>
          <p style={styles.groupLabel}>{title}</p>
          <p style={styles.groupCount}>{sel.length}/{perGroup}</p>
        </div>
        <div style={styles.optionList}>
          {options.map((opt) => {
            const selected = sel.includes(opt.id)
            const dimmed = full && !selected
            return (
              <button
                key={opt.id}
                onClick={() => toggle(sel, setSel, opt.id)}
                style={{
                  ...styles.optionCard,
                  ...(selected ? styles.optionCardSelected : {}),
                  ...(dimmed ? styles.optionCardDimmed : {}),
                }}
              >
                <span style={styles.tick}>{selected ? '◆' : '◇'}</span>
                {opt.label}
              </button>
            )
          })}

          {/* any custom picks already added show as selected rows */}
          {sel.filter((s) => s.startsWith('custom:')).map((s) => (
            <button key={s} onClick={() => toggle(sel, setSel, s)} style={{ ...styles.optionCard, ...styles.optionCardSelected }}>
              <span style={styles.tick}>◆</span>{s.slice(7)}
            </button>
          ))}
        </div>

        {allowCustom && !full && (
          <div style={styles.customInputRow}>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={customPrompt}
              style={styles.customInput}
              onKeyDown={(e) => { if (e.key === 'Enter') addCustom(sel, setSel, customText, () => setCustomText('')) }}
            />
            <button onClick={() => addCustom(sel, setSel, customText, () => setCustomText(''))} style={styles.customAddBtn}>Add</button>
          </div>
        )}
      </div>
    )
  }

  // ===================================================================
  // PHASE: SELECT
  // ===================================================================
  if (phase === 'select') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>Your daily anchors</h2>
        <p style={styles.subtext}>Two for the morning, two for the evening. Each one small, under five minutes, done every day.</p>

        <Group title="Morning — pick 2" options={morningOptions} sel={morning} setSel={setMorning} customText={customMorning} setCustomText={setCustomMorning} />
        <div style={styles.groupGap} />
        <Group title="Evening — pick 2" options={eveningOptions} sel={evening} setSel={setEvening} customText={customEvening} setCustomText={setCustomEvening} />

        <div style={styles.footer}>
          <button
            onClick={() => setPhase('why')}
            disabled={!bothChosen}
            style={{ ...styles.primaryBtnFlex, ...(!bothChosen ? styles.primaryBtnDisabled : {}) }}
          >
            {bothChosen ? 'Continue' : 'Pick two of each'}
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: WHY
  // ===================================================================
  if (phase === 'why') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{whyTheseHeader}</h2>
        <p style={styles.subtext}>{whyTheseSubtext}</p>

        <textarea
          value={whyText}
          onChange={(e) => setWhyText(e.target.value)}
          placeholder="One sentence, if you want."
          style={styles.textarea}
          rows={3}
          maxLength={240}
        />

        <div style={styles.footer}>
          <button onClick={() => setPhase('select')} style={styles.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('review')} style={styles.primaryBtnFlex}>Continue</button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVIEW
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>Your daily anchors.</h2>

      <div style={styles.anchorsCard}>
        <p style={styles.anchorsLabel}>Morning</p>
        {morning.map((s) => (
          <div key={s} style={styles.anchorRow}>
            <div style={styles.anchorDot}></div>
            <p style={styles.anchorText}>{labelFor(morningOptions, s)}</p>
          </div>
        ))}

        <div style={styles.anchorsDivider}></div>

        <p style={styles.anchorsLabel}>Evening</p>
        {evening.map((s) => (
          <div key={s} style={styles.anchorRow}>
            <div style={styles.anchorDot}></div>
            <p style={styles.anchorText}>{labelFor(eveningOptions, s)}</p>
          </div>
        ))}

        {whyText.trim() && (
          <>
            <div style={styles.anchorsDivider}></div>
            <p style={styles.anchorsLabel}>Why these</p>
            <p style={styles.anchorWhy}>{whyText}</p>
          </>
        )}
      </div>

      <p style={styles.note}>
        Four small things. Done every day. They hold the days together when nothing dramatic is happening.
      </p>

      <div style={styles.footer}>
        <button onClick={() => setPhase('why')} style={styles.secondaryBtn}>‹ Back</button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Save the anchors'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { paddingTop: '0.5rem' },
  prompt: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.3, margin: '0 0 0.5rem' },
  subtext: { fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 1.5rem' },
  group: {},
  groupGap: { height: '1.75rem' },
  groupHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 0 0.7rem' },
  groupLabel: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: 0 },
  groupCount: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0 },
  optionList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  optionCard: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 14px', background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '12px',
    fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer', textAlign: 'left',
    lineHeight: 1.4, transition: 'all 0.15s', width: '100%',
  },
  optionCardSelected: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '1px solid #C5572C', boxShadow: '0 2px 8px rgba(197,87,44,0.12)' },
  optionCardDimmed: { opacity: 0.4 },
  tick: { color: '#C5572C', fontSize: '12px', flexShrink: 0 },
  customInputRow: { display: 'flex', gap: '8px', marginTop: '8px' },
  customInput: {
    flex: 1, padding: '10px 12px', border: '1px solid #C5AE8A', borderRadius: '10px',
    fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', outline: 'none', background: 'white',
  },
  customAddBtn: { padding: '0 16px', background: '#854F0B', color: '#FAF7F1', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' },
  textarea: {
    width: '100%', padding: '14px', border: '0.5px solid #E0D5C2', borderRadius: '12px',
    fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', background: '#FDFBF6',
    outline: 'none', boxSizing: 'border-box', lineHeight: 1.65, resize: 'vertical',
  },
  anchorsCard: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '0.5px solid #E0D5C2', borderRadius: '14px', padding: '16px', marginBottom: '1rem' },
  anchorsLabel: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 0.6rem' },
  anchorRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' },
  anchorDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#854F0B', flexShrink: 0 },
  anchorText: { fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.4 },
  anchorsDivider: { height: '0.5px', background: '#E0D5C2', margin: '1rem 0' },
  anchorWhy: { fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.55 },
  note: { fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 1rem', textAlign: 'center' },
  footer: { marginTop: '1.5rem', display: 'flex', gap: '8px' },
  primaryBtnFlex: {
    flex: 1, padding: '14px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1',
    border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  secondaryBtn: { padding: '14px 18px', background: 'white', color: '#2A1F15', border: '0.5px solid #DDCFB6', borderRadius: '14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
}