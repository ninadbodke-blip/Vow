import { useState } from 'react'

// Day 5 — for each nervous-system state: recognize it, choose ONE first move, and an optional backup.
// onSave: { plans: [{ state_key, state_label, sign, sign_id, first_move, first_move_id, backup, backup_id }], built_at }
export default function StateMatchedResponse({ data, onSave, saving }) {
  const {
    states = [],
    allowCustom = true,
    customPrompt = 'Your own',
    sectionPrompts = {},
  } = data
  const SIGN_P = sectionPrompts.sign || "How you'll know you're here"
  const PRIMARY_P = sectionPrompts.primary || 'Your first move'
  const BACKUP_P = sectionPrompts.backup || "If that's not enough"

  const [phase, setPhase] = useState('state:0')
  // picks: { [stateKey]: { sign, primary, backup } } — each value = optionId | 'custom:text' | undefined
  const [picks, setPicks] = useState({})
  const [customInputs, setCustomInputs] = useState({}) // { 'stateKey:section': text }

  const idx = phase.startsWith('state:') ? parseInt(phase.split(':')[1], 10) : -1
  const state = idx >= 0 ? states[idx] : null

  const setPick = (sk, section, val) =>
    setPicks((prev) => {
      const cur = { ...(prev[sk] || {}) }
      cur[section] = cur[section] === val ? undefined : val
      if (section === 'primary' && cur.backup && cur.backup === cur.primary) cur.backup = undefined
      return { ...prev, [sk]: cur }
    })

  const setCustom = (sk, section) => {
    const key = `${sk}:${section}`
    const text = (customInputs[key] || '').trim()
    if (!text) return
    setPicks((prev) => ({ ...prev, [sk]: { ...(prev[sk] || {}), [section]: `custom:${text}` } }))
    setCustomInputs((prev) => ({ ...prev, [key]: '' }))
  }

  const labelFor = (st, section, val) => {
    if (!val) return null
    if (val.startsWith('custom:')) return val.slice(7)
    const pool = section === 'sign' ? st.signs : st.moves
    return (pool.find((o) => o.id === val) || {}).label || val
  }

  const advance = () => {
    if (idx < states.length - 1) { setPhase(`state:${idx + 1}`); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    else setPhase('review')
  }
  const goBack = () => { if (idx > 0) { setPhase(`state:${idx - 1}`); window.scrollTo({ top: 0, behavior: 'smooth' }) } }

  const finalize = () => {
    const idPart = (v) => (v && !v.startsWith('custom:') ? v : null)
    const plans = states.map((s) => {
      const p = picks[s.key] || {}
      return {
        state_key: s.key,
        state_label: s.label,
        sign: labelFor(s, 'sign', p.sign),
        sign_id: idPart(p.sign),
        first_move: labelFor(s, 'primary', p.primary),
        first_move_id: idPart(p.primary),
        backup: p.backup ? labelFor(s, 'primary', p.backup) : null,
        backup_id: idPart(p.backup),
      }
    })
    onSave({ plans, built_at: new Date().toISOString() })
  }

  // single-select section
  const Section = ({ sk, section, title, options }) => {
    const sel = (picks[sk] || {})[section]
    const ckey = `${sk}:${section}`
    const customVal = sel && sel.startsWith('custom:') ? sel.slice(7) : null
    return (
      <div style={styles.section}>
        <p style={styles.sectionLabel}>{title}</p>
        <div style={styles.optionList}>
          {options.map((opt) => {
            const selected = sel === opt.id
            return (
              <button key={opt.id} onClick={() => setPick(sk, section, opt.id)}
                style={{ ...styles.optionCard, ...(selected ? styles.optionCardSelected : {}) }}>
                <span style={styles.radio}>{selected ? '●' : '○'}</span>{opt.label}
              </button>
            )
          })}
          {customVal && (
            <button onClick={() => setPick(sk, section, sel)} style={{ ...styles.optionCard, ...styles.optionCardSelected }}>
              <span style={styles.radio}>●</span>{customVal}
            </button>
          )}
        </div>
        {allowCustom && !customVal && (
          <div style={styles.customInputRow}>
            <input type="text" value={customInputs[ckey] || ''}
              onChange={(e) => setCustomInputs((prev) => ({ ...prev, [ckey]: e.target.value }))}
              placeholder={customPrompt} style={styles.customInput}
              onKeyDown={(e) => { if (e.key === 'Enter') setCustom(sk, section) }} />
            <button onClick={() => setCustom(sk, section)} style={styles.customAddBtn}>Add</button>
          </div>
        )}
      </div>
    )
  }

  // ===================================================================
  // PHASE: STATE
  // ===================================================================
  if (state) {
    const p = picks[state.key] || {}
    const canAdvance = p.sign && p.primary
    const backupOptions = state.moves.filter((o) => o.id !== p.primary)
    return (
      <div style={styles.container}>
        <p style={styles.progressLabel}>State {idx + 1} of {states.length}</p>
        <h2 style={styles.stateHeader}>{state.label}</h2>
        <p style={styles.subtext}>{state.subtext}</p>

        <Section sk={state.key} section="sign" title={SIGN_P} options={state.signs} />
        <Section sk={state.key} section="primary" title={PRIMARY_P} options={state.moves} />
        {p.primary && <Section sk={state.key} section="backup" title={BACKUP_P} options={backupOptions} />}

        <div style={styles.footer}>
          {idx > 0 && <button onClick={goBack} style={styles.secondaryBtn}>‹ Back</button>}
          <button onClick={advance} disabled={!canAdvance}
            style={{ ...styles.primaryBtnFlex, ...(!canAdvance ? styles.primaryBtnDisabled : {}) }}>
            {!canAdvance ? 'Pick a sign and a first move' : (idx === states.length - 1 ? 'Review' : 'Next state')}
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVIEW
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>Your plan.</h2>
      <p style={styles.subtext}>Different state, different move. Read each one back.</p>

      {states.map((s) => {
        const p = picks[s.key] || {}
        if (!p.sign || !p.primary) return null
        return (
          <div key={s.key} style={styles.planCard}>
            <p style={styles.planState}>{s.label}</p>
            <div style={styles.planRow}><span style={styles.planKey}>When I notice</span><span style={styles.planVal}>{labelFor(s, 'sign', p.sign)}</span></div>
            <div style={styles.planRow}><span style={styles.planKey}>I’ll</span><span style={styles.planVal}>{labelFor(s, 'primary', p.primary)}</span></div>
            {p.backup && <div style={styles.planRow}><span style={styles.planKey}>If that’s not enough</span><span style={styles.planVal}>{labelFor(s, 'primary', p.backup)}</span></div>}
          </div>
        )
      })}

      <div style={styles.footer}>
        <button onClick={() => setPhase(`state:${states.length - 1}`)} style={styles.secondaryBtn}>‹ Back</button>
        <button onClick={finalize} disabled={saving} style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}>
          {saving ? 'Saving...' : 'Save the plan'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { paddingTop: '0.5rem' },
  prompt: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.3, margin: '0 0 0.5rem' },
  stateHeader: { fontSize: '22px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.3, margin: '0 0 0.5rem' },
  subtext: { fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 1.5rem' },
  progressLabel: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.75rem' },
  section: { marginBottom: '1.75rem' },
  sectionLabel: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 0.7rem' },
  optionList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  optionCard: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 14px', background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '12px',
    fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4, transition: 'all 0.15s', width: '100%',
  },
  optionCardSelected: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '1px solid #C5572C', boxShadow: '0 2px 8px rgba(197,87,44,0.12)' },
  radio: { color: '#C5572C', fontSize: '11px', flexShrink: 0 },
  customInputRow: { display: 'flex', gap: '8px', marginTop: '8px' },
  customInput: { flex: 1, padding: '10px 12px', border: '1px solid #C5AE8A', borderRadius: '10px', fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', outline: 'none', background: 'white' },
  customAddBtn: { padding: '0 16px', background: '#854F0B', color: '#FAF7F1', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' },
  planCard: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '0.5px solid #E0D5C2', borderRadius: '14px', padding: '16px', marginBottom: '12px' },
  planState: { fontSize: '13px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 500, margin: '0 0 0.85rem', lineHeight: 1.4 },
  planRow: { display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '0.7rem' },
  planKey: { fontSize: '10.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.12em' },
  planVal: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.45 },
  footer: { marginTop: '1.5rem', display: 'flex', gap: '8px' },
  primaryBtnFlex: { flex: 1, padding: '14px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)' },
  primaryBtnDisabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  secondaryBtn: { padding: '14px 18px', background: 'white', color: '#2A1F15', border: '0.5px solid #DDCFB6', borderRadius: '14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
}