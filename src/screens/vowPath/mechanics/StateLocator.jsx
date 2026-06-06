import { useState } from 'react'

// DAY 2 — "The three states"
// Meet the polyvagal states, then PLACE yourself on a vertical ladder:
// where you are right now, and where you sit on a normal day — two markers
// on one ladder. Then a tailored read, then name your earliest drop-signal.
// Tactile placement, not a menu. (type: 'stateLocator')
export default function StateLocator({ data, onSave, saving }) {
  const {
    states = [],
    teachIntro = [],
    placePrompt,
    placeNowLabel = 'Right now',
    placeUsualLabel = 'On a normal day',
    read = {},
    readTail,
    signalPrompt,
    signalOptions = [],
  } = data

  const [phase, setPhase] = useState('meet')
  const [nowState, setNowState] = useState(null)
  const [usualState, setUsualState] = useState(null)
  const [placing, setPlacing] = useState('now')
  const [signal, setSignal] = useState(null)
  const [signalCustom, setSignalCustom] = useState('')

  const byId = (id) => states.find(s => s.id === id) || {}
  const labelOf = (id) => byId(id).label || ''

  const finalize = () => {
    onSave({
      current_state: nowState,
      default_state: usualState,
      early_signal: signal === 'custom' ? `custom:${signalCustom.trim()}` : signal,
      located_at: new Date().toISOString(),
    })
  }

  const placeRung = (id) => {
    if (placing === 'now') { setNowState(id); setPlacing('usual') }
    else { setUsualState(id) }
  }

  const ladder = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', margin: '1.15rem 0' }}>
      {states.map(s => {
        const isNow = nowState === s.id
        const isUsual = usualState === s.id
        const lit = isNow || isUsual
        return (
          <button
            key={s.id}
            onClick={() => placeRung(s.id)}
            style={{
              textAlign: 'left', padding: '14px 16px', borderRadius: '14px', cursor: 'pointer', width: '100%',
              border: lit ? `2px solid ${s.color}` : '0.5px solid #E0D5C2',
              background: lit
                ? `linear-gradient(180deg, ${hexA(s.color, 0.15)} 0%, ${hexA(s.color, 0.06)} 100%)`
                : '#FDFBF6',
              transition: 'all .15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexWrap: 'wrap', marginBottom: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: '15.5px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif' }}>{s.label}</span>
              {s.clinical && <span style={{ fontSize: '11.5px', color: '#A2906F', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>{s.clinical}</span>}
              <span style={{ flex: 1 }} />
              {isNow && <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#fff', background: s.color, borderRadius: '20px', padding: '2px 9px', fontFamily: 'Georgia, serif' }}>● now</span>}
              {isUsual && <span style={{ fontSize: '10.5px', fontWeight: 600, color: s.color, background: 'transparent', border: `1.5px solid ${s.color}`, borderRadius: '20px', padding: '1px 8px', fontFamily: 'Georgia, serif' }}>○ usually</span>}
            </div>
            <p style={{ fontSize: '12.5px', color: '#6B5840', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: 0 }}>{s.body}</p>
          </button>
        )
      })}
    </div>
  )

  // ===================== MEET =====================
  if (phase === 'meet') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Day 2 · The three states</p>
        <h2 style={S.prompt}>Three states, not moods.</h2>
        {teachIntro.map((t, i) => (
          <p key={i} style={{ ...S.body, marginBottom: i === teachIntro.length - 1 ? '0.5rem' : '0.85rem' }}>{t}</p>
        ))}
        <div style={S.footer}>
          <button onClick={() => setPhase('place')} style={S.primaryBtn}>Meet them ›</button>
        </div>
      </div>
    )
  }

  // ===================== PLACE =====================
  if (phase === 'place') {
    const ready = nowState && usualState
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Place yourself</p>
        <h2 style={S.prompt}>{placePrompt || 'Here are the three. Where are you?'}</h2>

        <div style={{ display: 'flex', gap: '7px', background: '#F2EADA', padding: '4px', borderRadius: '11px', marginTop: '0.9rem' }}>
          {[['now', placeNowLabel, nowState], ['usual', placeUsualLabel, usualState]].map(([k, lbl, val]) => {
            const on = placing === k
            return (
              <button key={k} onClick={() => setPlacing(k)}
                style={{
                  flex: 1, padding: '9px 6px', borderRadius: '8px', cursor: 'pointer', border: 'none',
                  background: on ? '#FFFFFF' : 'transparent',
                  boxShadow: on ? '0 1px 4px rgba(110,68,16,0.12)' : 'none',
                  color: on ? '#5A3A0E' : '#8A7355', fontWeight: on ? 600 : 400,
                  fontSize: '13px', fontFamily: 'Georgia, serif',
                }}>
                {lbl}{val ? ` · ${labelOf(val)}` : ''}
              </button>
            )
          })}
        </div>
        <p style={{ ...S.hint, marginTop: '0.6rem' }}>
          {placing === 'now' ? 'Tap the rung that fits this moment.' : 'Now tap where you sit on an ordinary day.'}
        </p>

        {ladder()}

        <div style={S.footer}>
          <button onClick={() => setPhase('meet')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('read')} disabled={!ready} style={{ ...S.primaryBtnFlex, ...(!ready ? S.disabled : {}) }}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== READ =====================
  if (phase === 'read') {
    const usual = byId(usualState)
    const same = nowState === usualState
    const nowVsUsual = same
      ? `And that is where you are right now, too.`
      : `Right now, though, you are in ${labelOf(nowState).toLowerCase()} — a different rung than your usual one. States move. That is the whole point: you are not stuck on one.`
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>What the ladder says</p>
        <div style={{ ...S.card, borderLeft: `3px solid ${usual.color || '#854F0B'}` }}>
          <p style={S.cardText}>{read[usualState] || read.default}</p>
        </div>
        <p style={{ ...S.body, marginTop: '0.9rem' }}>{nowVsUsual}</p>
        {readTail && <p style={{ ...S.body, marginTop: '0.85rem' }}>{readTail}</p>}
        <div style={S.footer}>
          <button onClick={() => setPhase('place')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('signal')} style={S.primaryBtnFlex}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== SIGNAL =====================
  if (phase === 'signal') {
    const ready = signal && (signal !== 'custom' || signalCustom.trim())
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Your earliest sign</p>
        <h2 style={S.prompt}>{signalPrompt || 'When you start to slip from settled, what is the first sign in your body?'}</h2>
        <p style={S.hint}>The earliest one you can catch. Naming it is how you reach the rung before you fall far.</p>
        <div style={S.optList}>
          {signalOptions.map(o => {
            const on = signal === o.id
            return <button key={o.id} onClick={() => setSignal(o.id)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>{o.label}</button>
          })}
          <button onClick={() => setSignal('custom')} style={{ ...S.opt, ...(signal === 'custom' ? S.optOn : {}) }}>Something else…</button>
          {signal === 'custom' && (
            <input value={signalCustom} onChange={e => setSignalCustom(e.target.value)} placeholder="Name it" style={S.input} maxLength={90} />
          )}
        </div>
        <div style={S.footer}>
          <button onClick={() => setPhase('read')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('review')} disabled={!ready} style={{ ...S.primaryBtnFlex, ...(!ready ? S.disabled : {}) }}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== REVIEW =====================
  if (phase === 'review') {
    const sigLabel = signal === 'custom' ? signalCustom.trim() : ((signalOptions.find(o => o.id === signal) || {}).label || '')
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Located</p>
        <div style={S.reviewCard}><p style={S.reviewLabel}>Right now</p><p style={S.reviewBig}>{labelOf(nowState)}</p></div>
        <div style={S.reviewCard}><p style={S.reviewLabel}>Most days</p><p style={S.reviewBig}>{labelOf(usualState)}</p></div>
        <div style={S.reviewCard}><p style={S.reviewLabel}>First sign you're slipping</p><p style={S.reviewBig}>{sigLabel}</p></div>
        <div style={S.footer}>
          <button onClick={() => setPhase('signal')} style={S.secondaryBtn} disabled={saving}>‹ Back</button>
          <button onClick={finalize} disabled={saving} style={{ ...S.primaryBtnFlex, ...(saving ? S.disabled : {}) }}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    )
  }

  return null
}

function hexA(hex, a) {
  const h = String(hex || '#854F0B').replace('#', '')
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${a})`
}

const S = {
  container: { padding: 0 },
  eyebrow: { fontSize: '11px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: 'Georgia, serif', margin: '0 0 0.75rem' },
  prompt: { fontSize: '20px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.32, margin: '0 0 0.6rem' },
  body: { fontSize: '14.5px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.62, margin: 0 },
  hint: { fontSize: '13px', color: '#8A7355', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 0.25rem' },
  footer: { display: 'flex', gap: '10px', marginTop: '1.75rem' },
  primaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  primaryBtnFlex: { flex: 1, padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  secondaryBtn: { padding: '14px 20px', background: 'transparent', color: '#8A7355', border: '0.5px solid #D9C9B0', borderRadius: '12px', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  disabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  card: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F5EEDF 100%)', borderRadius: '0 12px 12px 0', padding: '15px 17px' },
  cardText: { fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.62, margin: 0 },
  optList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.85rem' },
  opt: { textAlign: 'left', padding: '13px 15px', borderRadius: '11px', border: '0.5px solid #E0D5C2', background: '#FDFBF6', color: '#3A2D1E', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer', lineHeight: 1.4 },
  optOn: { border: '1.5px solid #8A5A1A', background: 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)', color: '#5A3A0E', fontWeight: 600 },
  input: { width: '100%', padding: '12px 14px', border: '0.5px solid #C9A86F', borderRadius: '11px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', marginTop: '2px' },
  reviewCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #EADFCB', borderRadius: '13px', padding: '14px 16px', marginBottom: '10px' },
  reviewLabel: { fontSize: '10px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'Georgia, serif', margin: '0 0 0.35rem' },
  reviewBig: { fontSize: '15.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.4 },
}
