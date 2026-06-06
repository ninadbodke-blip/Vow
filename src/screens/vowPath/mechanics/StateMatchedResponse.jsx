import { useState } from 'react'

// Day 5 — state-matched response. For each nervous-system state: a recognition
// sign, the first move, an optional backup. Polished to the shared design
// language (teaching beat + per-state colour). onSave shape unchanged:
// { plans: [{ state_key, state_label, sign, sign_id, first_move, first_move_id, backup, backup_id }], built_at }
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
  const [picks, setPicks] = useState({})
  const [customInputs, setCustomInputs] = useState({})

  const idx = phase.startsWith('state:') ? parseInt(phase.split(':')[1], 10) : -1
  const state = idx >= 0 ? states[idx] : null

  const setPick = (sk, section, val) => setPicks(prev => {
    const cur = { ...(prev[sk] || {}) }
    cur[section] = cur[section] === val ? undefined : val
    if (section === 'primary' && cur.backup && cur.backup === cur.primary) cur.backup = undefined
    return { ...prev, [sk]: cur }
  })
  const setCustom = (sk, section) => {
    const key = `${sk}:${section}`
    const text = (customInputs[key] || '').trim()
    if (!text) return
    setPicks(prev => ({ ...prev, [sk]: { ...(prev[sk] || {}), [section]: `custom:${text}` } }))
    setCustomInputs(prev => ({ ...prev, [key]: '' }))
  }
  const labelFor = (st, section, val) => {
    if (!val) return null
    if (val.startsWith('custom:')) return val.slice(7)
    const pool = section === 'sign' ? st.signs : st.moves
    return (pool.find(o => o.id === val) || {}).label || val
  }
  const advance = () => { if (idx < states.length - 1) { setPhase(`state:${idx + 1}`); window.scrollTo({ top: 0, behavior: 'smooth' }) } else setPhase('review') }
  const goBack = () => { if (idx > 0) { setPhase(`state:${idx - 1}`); window.scrollTo({ top: 0, behavior: 'smooth' }) } }

  const finalize = () => {
    const idPart = v => (v && !v.startsWith('custom:') ? v : null)
    const plans = states.map(s => {
      const p = picks[s.key] || {}
      return {
        state_key: s.key, state_label: s.label,
        sign: labelFor(s, 'sign', p.sign), sign_id: idPart(p.sign),
        first_move: labelFor(s, 'primary', p.primary), first_move_id: idPart(p.primary),
        backup: p.backup ? labelFor(s, 'primary', p.backup) : null, backup_id: idPart(p.backup),
      }
    })
    onSave({ plans, built_at: new Date().toISOString() })
  }

  const Section = ({ sk, section, title, options, accent }) => {
    const sel = (picks[sk] || {})[section]
    const ckey = `${sk}:${section}`
    const customVal = sel && sel.startsWith('custom:') ? sel.slice(7) : null
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={S.sectionLabel}>{title}</p>
        <div style={S.optList}>
          {options.map(opt => {
            const selected = sel === opt.id
            return (
              <button key={opt.id} onClick={() => setPick(sk, section, opt.id)} style={{ ...S.opt, ...(selected ? optOn(accent) : {}) }}>{opt.label}</button>
            )
          })}
          {customVal && <button onClick={() => setPick(sk, section, sel)} style={{ ...S.opt, ...optOn(accent) }}>{customVal}</button>}
        </div>
        {allowCustom && !customVal && (
          <div style={{ display: 'flex', gap: '7px', marginTop: '8px' }}>
            <input value={customInputs[ckey] || ''} onChange={e => setCustomInputs(prev => ({ ...prev, [ckey]: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') setCustom(sk, section) }} placeholder={customPrompt} style={{ ...S.input, marginTop: 0, flex: 1 }} maxLength={80} />
            <button onClick={() => setCustom(sk, section)} disabled={!(customInputs[ckey] || '').trim()} style={{ ...S.secondaryBtn, padding: '11px 15px', opacity: (customInputs[ckey] || '').trim() ? 1 : 0.4 }}>Add</button>
          </div>
        )}
      </div>
    )
  }

  // ===================== STATE =====================
  if (state) {
    const p = picks[state.key] || {}
    const canAdvance = p.sign && p.primary
    const backupOptions = state.moves.filter(o => o.id !== p.primary)
    const accent = state.color || '#854F0B'
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>State {idx + 1} of {states.length}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.4rem' }}>
          <span style={{ width: '13px', height: '13px', borderRadius: '50%', background: accent, flexShrink: 0 }} />
          <h2 style={{ ...S.prompt, margin: 0 }}>{state.label}</h2>
        </div>
        <p style={S.hint}>{state.subtext}</p>
        <div style={{ marginTop: '1.1rem' }}>
          <Section sk={state.key} section="sign" title={SIGN_P} options={state.signs} accent={accent} />
          <Section sk={state.key} section="primary" title={PRIMARY_P} options={state.moves} accent={accent} />
          {p.primary && <Section sk={state.key} section="backup" title={BACKUP_P} options={backupOptions} accent={accent} />}
        </div>
        <div style={S.footer}>
          {idx > 0 && <button onClick={goBack} style={S.secondaryBtn}>‹ Back</button>}
          <button onClick={advance} disabled={!canAdvance} style={{ ...S.primaryBtnFlex, ...(!canAdvance ? S.disabled : {}) }}>{idx === states.length - 1 ? 'Review ›' : 'Next state ›'}</button>
        </div>
      </div>
    )
  }

  // ===================== REVIEW =====================
  return (
    <div style={S.container}>
      <p style={S.eyebrow}>Your plan</p>
      <h2 style={S.prompt}>Different state, different move.</h2>
      <div style={{ marginTop: '0.8rem' }}>
        {states.map(s => {
          const p = picks[s.key] || {}
          if (!p.sign || !p.primary) return null
          return (
            <div key={s.key} style={{ ...S.card, borderLeft: `3px solid ${s.color || '#854F0B'}`, padding: '14px 16px', marginBottom: '11px' }}>
              <p style={{ fontSize: '13px', color: s.color || '#854F0B', fontFamily: 'Georgia, serif', fontWeight: 600, margin: '0 0 0.7rem' }}>{s.label}</p>
              <p style={S.planRow}><span style={S.planKey}>When I notice</span>{labelFor(s, 'sign', p.sign)}</p>
              <p style={S.planRow}><span style={S.planKey}>I'll</span>{labelFor(s, 'primary', p.primary)}</p>
              {p.backup && <p style={{ ...S.planRow, marginBottom: 0 }}><span style={S.planKey}>If not enough</span>{labelFor(s, 'primary', p.backup)}</p>}
            </div>
          )
        })}
      </div>
      <div style={S.footer}>
        <button onClick={() => setPhase(`state:${states.length - 1}`)} style={S.secondaryBtn} disabled={saving}>‹ Back</button>
        <button onClick={finalize} disabled={saving} style={{ ...S.primaryBtnFlex, ...(saving ? S.disabled : {}) }}>{saving ? 'Saving…' : 'Save the plan'}</button>
      </div>
    </div>
  )
}

function hexA(hex, a) {
  const h = String(hex || '#854F0B').replace('#', '')
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`
}
const optOn = (accent) => ({ border: `1.5px solid ${accent}`, background: `linear-gradient(180deg, ${hexA(accent, 0.13)} 0%, ${hexA(accent, 0.05)} 100%)`, color: '#3A2A1C', fontWeight: 600 })

const S = {
  container: { padding: 0 },
  eyebrow: { fontSize: '11px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: 'Georgia, serif', margin: '0 0 0.8rem' },
  prompt: { fontSize: '21px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.34, margin: '0 0 0.6rem' },
  body: { fontSize: '15.5px', color: '#3A2D1E', fontFamily: 'Georgia, serif', lineHeight: 1.72, margin: 0 },
  hint: { fontSize: '14px', color: '#7E6A52', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 0.25rem' },
  sectionLabel: { fontSize: '11.5px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.13em', fontWeight: 600, fontFamily: 'Georgia, serif', margin: '0 0 0.6rem' },
  footer: { display: 'flex', gap: '10px', marginTop: '1.9rem' },
  primaryBtn: { width: '100%', padding: '15px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '13px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  primaryBtnFlex: { flex: 1, padding: '15px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '13px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  secondaryBtn: { padding: '15px 20px', background: 'transparent', color: '#8A7355', border: '0.5px solid #D9C9B0', borderRadius: '13px', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  disabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  card: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F5EEDF 100%)', borderRadius: '14px', border: '0.5px solid #EADFCB' },
  optList: { display: 'flex', flexDirection: 'column', gap: '9px' },
  opt: { textAlign: 'left', padding: '14px 16px', borderRadius: '12px', border: '0.5px solid #E0D5C2', background: '#FDFBF6', color: '#3A2D1E', fontSize: '14.5px', fontFamily: 'Georgia, serif', cursor: 'pointer', lineHeight: 1.45, width: '100%' },
  input: { width: '100%', padding: '12px 14px', border: '0.5px solid #C9A86F', borderRadius: '11px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box' },
  planRow: { fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: '0 0 0.6rem', lineHeight: 1.5 },
  planKey: { display: 'block', fontSize: '10.5px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'Georgia, serif', marginBottom: '1px' },
}
