import { useState } from 'react'

// DAY 15 — "Lapse vs. relapse, in your own data"
// Reconstruct one real urge or slip as a CHAIN: situation -> state -> thought
// -> urge intensity (slider) -> what you did. Then find the most catchable
// link, and what could have broken it there. A no-close-calls branch stays
// lighter. Keeps `status` (Day 20 reads it). (type: 'lapseRelapseRecall')
export default function LapseRelapseRecall({ data, onSave, saving }) {
  const {
    statusPrompt,
    statusOptions = [],
    protectivePrompt,
    chainTeach = [],
    notePrompt,
    situationPrompt,
    situationOptions = [],
    statePrompt,
    stateOptions = [],
    thoughtPrompt,
    thoughtOptions = [],
    intensityPrompt,
    outcomePrompt,
    outcomeOptions = [],
    forkPrompt,
    breakerPrompt,
    breakerOptions = [],
    allowCustom = true,
  } = data

  const [phase, setPhase] = useState('status')
  const [status, setStatus] = useState(null)
  const [protective, setProtective] = useState([])
  const [note, setNote] = useState('')
  const [whereWhen, setWhereWhen] = useState(null)
  const [feltState, setFeltState] = useState(null)
  const [thought, setThought] = useState(null)
  const [intensity, setIntensity] = useState(6)
  const [outcome, setOutcome] = useState(null)
  const [catchable, setCatchable] = useState(null)
  const [breaker, setBreaker] = useState(null)
  const [breakerCustom, setBreakerCustom] = useState('')

  const lbl = (opts, id) => ((opts.find(o => o.id === id)) || {}).label || ''
  const isLight = status === 'no_close_calls'

  const finalize = () => {
    if (isLight) {
      onSave({ status, protective_factors: protective, reflected_at: new Date().toISOString() })
    } else {
      onSave({
        status,
        note: note.trim(),
        chain: { situation: whereWhen, state: feltState, thought, intensity, outcome },
        catchable_link: catchable,
        breaker: breaker === 'custom' ? `custom:${breakerCustom.trim()}` : breaker,
        reconstructed_at: new Date().toISOString(),
      })
    }
  }

  const chips = (opts, val, set) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
      {opts.map(o => {
        const on = val === o.id
        return (
          <button key={o.id} onClick={() => set(o.id)}
            style={{
              textAlign: 'left', padding: '9px 13px', borderRadius: '20px', cursor: 'pointer',
              border: on ? '1.5px solid #8A5A1A' : '0.5px solid #E0D5C2',
              background: on ? 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)' : '#FDFBF6',
              color: on ? '#5A3A0E' : '#4A3A28', fontWeight: on ? 600 : 400,
              fontSize: '13px', fontFamily: 'Georgia, serif', lineHeight: 1.35,
            }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )

  const node = (n, color, content) => (
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: color, color: '#FBF6EA', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', marginTop: '2px' }}>{n}</div>
        {n < 5 && <div style={{ width: '2px', flex: 1, minHeight: '16px', background: '#E6DAC4' }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: n < 5 ? '16px' : 0 }}>{content}</div>
    </div>
  )

  // ===================== STATUS =====================
  if (phase === 'status') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Day 15 · The honest data</p>
        <h2 style={S.prompt}>{statusPrompt || 'First — what has actually happened?'}</h2>
        <p style={S.hint}>Not confession. Data. The honest answer is the useful one.</p>
        <div style={S.optList}>
          {statusOptions.map(o => {
            const on = status === o.id
            return <button key={o.id} onClick={() => setStatus(o.id)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>{o.label}</button>
          })}
        </div>
        <div style={S.footer}>
          <button onClick={() => setPhase(isLight ? 'protective' : 'teach')} disabled={!status} style={{ ...S.primaryBtn, ...(!status ? S.disabled : {}) }}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== PROTECTIVE (light branch) =====================
  if (phase === 'protective') {
    const toggle = (id) => setProtective(protective.includes(id) ? protective.filter(x => x !== id) : [...protective, id])
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>What's been holding</p>
        <h2 style={S.prompt}>{protectivePrompt || 'What has kept the urge manageable?'}</h2>
        <p style={S.hint}>No close calls is real progress. Worth knowing what is doing the work — so you can keep doing it.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '0.85rem' }}>
          {breakerOptions.map(o => {
            const on = protective.includes(o.id)
            return (
              <button key={o.id} onClick={() => toggle(o.id)}
                style={{
                  textAlign: 'left', padding: '10px 14px', borderRadius: '20px', cursor: 'pointer',
                  border: on ? '1.5px solid #6E7A4A' : '0.5px solid #E0D5C2',
                  background: on ? 'linear-gradient(180deg, #F1F4E9 0%, #E7EDD9 100%)' : '#FDFBF6',
                  color: on ? '#4A5A30' : '#4A3A28', fontWeight: on ? 600 : 400,
                  fontSize: '13px', fontFamily: 'Georgia, serif',
                }}>
                {o.label}
              </button>
            )
          })}
        </div>
        <div style={S.footer}>
          <button onClick={() => setPhase('status')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('review')} disabled={protective.length === 0} style={{ ...S.primaryBtnFlex, ...(protective.length === 0 ? S.disabled : {}) }}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== TEACH (chain) =====================
  if (phase === 'teach') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>How an urge actually works</p>
        <h2 style={S.prompt}>It was never one moment. It was a chain.</h2>
        {chainTeach.map((t, i) => (
          <p key={i} style={{ ...S.body, marginBottom: i === chainTeach.length - 1 ? '0.5rem' : '0.85rem' }}>{t}</p>
        ))}
        <div style={S.footer}>
          <button onClick={() => setPhase('status')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('reconstruct')} style={S.primaryBtnFlex}>Reconstruct it ›</button>
        </div>
      </div>
    )
  }

  // ===================== RECONSTRUCT (chain) =====================
  if (phase === 'reconstruct') {
    const ready = whereWhen && feltState && thought && outcome
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>The chain</p>
        <h2 style={S.prompt}>Take the loudest one. Lay out the links.</h2>

        {notePrompt && (
          <input value={note} onChange={e => setNote(e.target.value)} placeholder={notePrompt} style={{ ...S.input, margin: '0.5rem 0 1.2rem' }} maxLength={110} />
        )}

        <div>
          {node(1, '#9A7B4F', <>
            <p style={S.nodeLabel}>{situationPrompt || 'Where, and when?'}</p>
            {chips(situationOptions, whereWhen, setWhereWhen)}
          </>)}
          {node(2, '#A86A3A', <>
            <p style={S.nodeLabel}>{statePrompt || 'Underneath, what state?'}</p>
            {chips(stateOptions, feltState, setFeltState)}
          </>)}
          {node(3, '#B2541F', <>
            <p style={S.nodeLabel}>{thoughtPrompt || 'The thought that gave permission'}</p>
            {chips(thoughtOptions, thought, setThought)}
          </>)}
          {node(4, '#C5572C', <>
            <p style={S.nodeLabel}>{intensityPrompt || 'How loud did the urge get?'}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
              <input type="range" min={1} max={10} value={intensity} onChange={e => setIntensity(Number(e.target.value))} style={{ flex: 1, accentColor: '#C5572C' }} />
              <span style={{ fontSize: '17px', fontWeight: 600, color: '#C5572C', fontFamily: 'Georgia, serif', minWidth: '42px', textAlign: 'right' }}>{intensity}/10</span>
            </div>
          </>)}
          {node(5, '#7A3A12', <>
            <p style={S.nodeLabel}>{outcomePrompt || 'And then?'}</p>
            {chips(outcomeOptions, outcome, setOutcome)}
          </>)}
        </div>

        <div style={S.footer}>
          <button onClick={() => setPhase('teach')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('forks')} disabled={!ready} style={{ ...S.primaryBtnFlex, ...(!ready ? S.disabled : {}) }}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== FORKS =====================
  if (phase === 'forks') {
    const links = [
      { id: 'situation', label: `The situation — ${lbl(situationOptions, whereWhen)}` },
      { id: 'state', label: `The state — ${lbl(stateOptions, feltState)}` },
      { id: 'thought', label: `The thought — ${lbl(thoughtOptions, thought)}` },
      { id: 'urge', label: `The urge — ${intensity}/10` },
    ]
    const ready = catchable && breaker && (breaker !== 'custom' || breakerCustom.trim())
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Where it could have broken</p>
        <h2 style={S.prompt}>{forkPrompt || 'Which link was the most catchable?'}</h2>
        <p style={S.hint}>A chain breaks at any link. The earliest one is usually the easiest.</p>
        <div style={S.optList}>
          {links.map(o => {
            const on = catchable === o.id
            return <button key={o.id} onClick={() => setCatchable(o.id)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>{o.label}</button>
          })}
        </div>

        <p style={{ ...S.groupLabel, marginTop: '1.4rem' }}>{breakerPrompt || 'What could have broken it there?'}</p>
        <div style={S.optList}>
          {breakerOptions.map(o => {
            const on = breaker === o.id
            return <button key={o.id} onClick={() => setBreaker(o.id)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>{o.label}</button>
          })}
          {allowCustom && <button onClick={() => setBreaker('custom')} style={{ ...S.opt, ...(breaker === 'custom' ? S.optOn : {}) }}>Something else…</button>}
          {breaker === 'custom' && <input value={breakerCustom} onChange={e => setBreakerCustom(e.target.value)} placeholder="Name it" style={S.input} maxLength={90} />}
        </div>

        <div style={S.footer}>
          <button onClick={() => setPhase('reconstruct')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('review')} disabled={!ready} style={{ ...S.primaryBtnFlex, ...(!ready ? S.disabled : {}) }}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== REVIEW =====================
  if (phase === 'review') {
    if (isLight) {
      const names = protective.map(id => lbl(breakerOptions, id)).filter(Boolean)
      return (
        <div style={S.container}>
          <p style={S.eyebrow}>What's holding</p>
          <div style={S.reviewCard}>
            <p style={S.reviewLabel}>So far</p>
            <p style={S.reviewBig}>No close calls — the urge has stayed manageable.</p>
          </div>
          <div style={{ ...S.reviewCard, marginTop: '10px' }}>
            <p style={S.reviewLabel}>What's doing the work</p>
            <p style={S.reviewBig}>{names.join(' · ')}</p>
          </div>
          <div style={S.footer}>
            <button onClick={() => setPhase('protective')} style={S.secondaryBtn} disabled={saving}>‹ Back</button>
            <button onClick={finalize} disabled={saving} style={{ ...S.primaryBtnFlex, ...(saving ? S.disabled : {}) }}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      )
    }
    const linkName = { situation: 'the situation', state: 'the state underneath', thought: 'the thought', urge: 'the urge itself' }[catchable] || catchable
    const breakerText = breaker === 'custom' ? breakerCustom.trim() : lbl(breakerOptions, breaker)
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>The chain, traced</p>
        <div style={{ ...S.card, padding: '12px 16px' }}>
          <p style={S.chainLine}><b style={S.chainKey}>Situation</b> {lbl(situationOptions, whereWhen)}</p>
          <p style={S.chainLine}><b style={S.chainKey}>State</b> {lbl(stateOptions, feltState)}</p>
          <p style={S.chainLine}><b style={S.chainKey}>Thought</b> {lbl(thoughtOptions, thought)}</p>
          <p style={S.chainLine}><b style={S.chainKey}>Urge</b> {intensity}/10</p>
          <p style={{ ...S.chainLine, marginBottom: 0 }}><b style={S.chainKey}>Then</b> {lbl(outcomeOptions, outcome)}</p>
        </div>
        <div style={{ ...S.reviewCard, marginTop: '12px', borderLeft: '3px solid #8A5A1A' }}>
          <p style={S.reviewLabel}>The most catchable link</p>
          <p style={S.reviewBig}>{linkName.charAt(0).toUpperCase() + linkName.slice(1)} — broken by {breakerText.toLowerCase()}</p>
        </div>
        <div style={S.footer}>
          <button onClick={() => setPhase('forks')} style={S.secondaryBtn} disabled={saving}>‹ Back</button>
          <button onClick={finalize} disabled={saving} style={{ ...S.primaryBtnFlex, ...(saving ? S.disabled : {}) }}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    )
  }

  return null
}

const S = {
  container: { padding: 0 },
  eyebrow: { fontSize: '11px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: 'Georgia, serif', margin: '0 0 0.75rem' },
  prompt: { fontSize: '20px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.32, margin: '0 0 0.6rem' },
  body: { fontSize: '14.5px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.62, margin: 0 },
  hint: { fontSize: '13px', color: '#8A7355', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 0.25rem' },
  nodeLabel: { fontSize: '13.5px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', margin: '0 0 0.55rem', lineHeight: 1.35 },
  groupLabel: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600, fontFamily: 'Georgia, serif', margin: '0 0 0.5rem' },
  footer: { display: 'flex', gap: '10px', marginTop: '1.75rem' },
  primaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  primaryBtnFlex: { flex: 1, padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  secondaryBtn: { padding: '14px 20px', background: 'transparent', color: '#8A7355', border: '0.5px solid #D9C9B0', borderRadius: '12px', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  disabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  card: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F5EEDF 100%)', borderRadius: '13px', border: '0.5px solid #EADFCB' },
  optList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.3rem' },
  opt: { textAlign: 'left', padding: '12px 14px', borderRadius: '11px', border: '0.5px solid #E0D5C2', background: '#FDFBF6', color: '#3A2D1E', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer', lineHeight: 1.4 },
  optOn: { border: '1.5px solid #8A5A1A', background: 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)', color: '#5A3A0E', fontWeight: 600 },
  input: { width: '100%', padding: '12px 14px', border: '0.5px solid #C9A86F', borderRadius: '11px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', marginTop: '2px' },
  reviewCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #EADFCB', borderRadius: '13px', padding: '14px 16px' },
  reviewLabel: { fontSize: '10px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'Georgia, serif', margin: '0 0 0.35rem' },
  reviewBig: { fontSize: '15.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.4 },
  chainLine: { fontSize: '14px', color: '#3A2D1E', fontFamily: 'Georgia, serif', margin: '0 0 0.5rem', lineHeight: 1.45 },
  chainKey: { display: 'inline-block', width: '74px', fontSize: '10px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, verticalAlign: 'middle' },
}