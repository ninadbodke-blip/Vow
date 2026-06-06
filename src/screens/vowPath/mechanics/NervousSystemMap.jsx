import { useState } from 'react'

// Day 18 — "The new oscillation"
// A hand-built nervous-system proportion map. The person taps how much of a
// typical day they spend in each polyvagal state; a live bar fills in as a
// "map." Then a substance-specific reading, then one tight reflection
// (what pulls you toward the hardest state, what brings you back).
export default function NervousSystemMap({ data, onSave, saving }) {
  const {
    states = [],
    buildPrompt,
    buildSubtext,
    levels = ['None', 'A little', 'Some', 'A lot', 'Most'],
    teach = {},
    pullPrompt,
    pullOptions = [],
    returnPrompt,
    returnOptions = [],
  } = data

  const [phase, setPhase] = useState('build')
  const [vals, setVals] = useState({})        // { stateId: 0..4 }
  const [pull, setPull] = useState(null)
  const [pullCustom, setPullCustom] = useState('')
  const [back, setBack] = useState(null)
  const [backCustom, setBackCustom] = useState('')

  const sum = states.reduce((a, s) => a + (vals[s.id] || 0), 0)
  const settled = states.find(s => s.id === 'settled') || states[0]
  const dominant = states.reduce(
    (best, s) => ((vals[s.id] || 0) > (best ? (vals[best.id] || 0) : -1) ? s : best),
    null,
  )
  const nonSettled = states.filter(s => s.id !== (settled && settled.id))
  const target =
    nonSettled.reduce(
      (best, s) => ((vals[s.id] || 0) > (best ? (vals[best.id] || 0) : -1) ? s : best),
      null,
    ) || nonSettled[0] || dominant
  const pct = (id) => (sum > 0 ? Math.round(((vals[id] || 0) / sum) * 100) : 0)

  const finalize = () => {
    onSave({
      version: 'map',
      state_levels: vals,
      proportions: states.reduce((o, s) => { o[s.id] = pct(s.id); return o }, {}),
      dominant_state: dominant && dominant.id,
      target_state: target && target.id,
      pull: pull === 'custom' ? `custom:${pullCustom.trim()}` : pull,
      brings_back: back === 'custom' ? `custom:${backCustom.trim()}` : back,
      mapped_at: new Date().toISOString(),
    })
  }

  const mapBar = () => (
    <div>
      <div style={{ display: 'flex', height: '36px', borderRadius: '9px', overflow: 'hidden', border: '0.5px solid #E0D5C2', background: '#F2EADA' }}>
        {sum === 0
          ? null
          : states.map(s => {
              const w = ((vals[s.id] || 0) / sum) * 100
              if (w === 0) return null
              return <div key={s.id} style={{ width: `${w}%`, background: s.color, transition: 'width .28s ease' }} />
            })}
      </div>
      <p style={{ fontSize: '11px', color: '#8A7355', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '7px 0 0', textAlign: 'center' }}>
        {sum === 0 ? 'Set a level on each — your map fills in as you go' : 'Your nervous system, across a typical day'}
      </p>
    </div>
  )

  const legend = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: '13px 0 4px', flexWrap: 'wrap' }}>
      {states.map(s => (
        <span key={s.id} style={{ fontSize: '12px', color: '#6B5840', fontFamily: 'Georgia, serif' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: s.color, marginRight: '5px' }} />
          {s.label} {pct(s.id)}%
        </span>
      ))}
    </div>
  )

  // ===================== BUILD =====================
  if (phase === 'build') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Day 18 · The new oscillation</p>
        <h2 style={S.prompt}>{buildPrompt}</h2>
        <p style={S.subtext}>{buildSubtext}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', margin: '1.25rem 0' }}>
          {states.map(s => (
            <div key={s.id}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '7px', flexWrap: 'wrap' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif' }}>{s.label}</span>
                <span style={{ fontSize: '12px', color: '#8A7355', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{s.sub}</span>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {levels.map((lv, i) => {
                  const on = (vals[s.id] ?? -1) === i
                  return (
                    <button
                      key={i}
                      onClick={() => setVals(v => ({ ...v, [s.id]: i }))}
                      style={{
                        flex: 1, padding: '10px 2px', borderRadius: '8px', cursor: 'pointer',
                        border: on ? `1.5px solid ${s.color}` : '0.5px solid #E0D5C2',
                        background: on ? s.color : '#FDFBF6',
                        color: on ? '#FFFFFF' : '#6B5840',
                        fontSize: '11px', fontFamily: 'Georgia, serif', fontWeight: on ? 600 : 400,
                        lineHeight: 1.2, transition: 'all .12s',
                      }}
                    >
                      {lv}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {mapBar()}

        <div style={S.footer}>
          <button onClick={() => setPhase('read')} disabled={sum === 0} style={{ ...S.primaryBtn, ...(sum === 0 ? S.disabled : {}) }}>
            See what it says
          </button>
        </div>
      </div>
    )
  }

  // ===================== READ =====================
  if (phase === 'read') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Your map</p>
        {mapBar()}
        {legend()}

        {dominant && teach[dominant.id] && (
          <div style={{ ...S.card, borderLeft: `3px solid ${dominant.color}` }}>
            <p style={S.cardText}>{teach[dominant.id]}</p>
          </div>
        )}

        {teach.intro && (
          <div style={S.teachPlain}>
            <p style={S.cardText}>{teach.intro}</p>
          </div>
        )}

        <div style={S.footer}>
          <button onClick={() => setPhase('build')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('reflect')} style={S.primaryBtnFlex}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== REFLECT =====================
  if (phase === 'reflect') {
    const ready =
      pull && (pull !== 'custom' || pullCustom.trim()) &&
      back && (back !== 'custom' || backCustom.trim())
    const targetLabel = (target && target.label ? target.label.toLowerCase() : 'that state')
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Two things to notice</p>
        <h2 style={S.prompt}>{(pullPrompt || 'What tends to pull you toward {state}?').replace('{state}', targetLabel)}</h2>
        <div style={S.optList}>
          {pullOptions.map(o => {
            const on = pull === o.id
            return <button key={o.id} onClick={() => setPull(o.id)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>{o.label}</button>
          })}
          <button onClick={() => setPull('custom')} style={{ ...S.opt, ...(pull === 'custom' ? S.optOn : {}) }}>Something else…</button>
          {pull === 'custom' && (
            <input value={pullCustom} onChange={e => setPullCustom(e.target.value)} placeholder="Name it" style={S.input} maxLength={80} />
          )}
        </div>

        <h2 style={{ ...S.prompt, marginTop: '1.6rem' }}>{returnPrompt || 'What brings you back toward settled?'}</h2>
        <div style={S.optList}>
          {returnOptions.map(o => {
            const on = back === o.id
            return <button key={o.id} onClick={() => setBack(o.id)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>{o.label}</button>
          })}
          <button onClick={() => setBack('custom')} style={{ ...S.opt, ...(back === 'custom' ? S.optOn : {}) }}>Something else…</button>
          {back === 'custom' && (
            <input value={backCustom} onChange={e => setBackCustom(e.target.value)} placeholder="Name it" style={S.input} maxLength={80} />
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
    const pullLabel = pull === 'custom' ? pullCustom.trim() : ((pullOptions.find(o => o.id === pull) || {}).label || '')
    const backLabel = back === 'custom' ? backCustom.trim() : ((returnOptions.find(o => o.id === back) || {}).label || '')
    const targetLabel = (target && target.label ? target.label.toLowerCase() : 'that state')
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Your nervous-system map</p>
        {mapBar()}
        {legend()}
        <div style={{ height: '10px' }} />

        <div style={S.reviewCard}>
          <p style={S.reviewLabel}>Where you spend most time</p>
          <p style={S.reviewBig}>{dominant && dominant.label}</p>
        </div>
        <div style={S.reviewCard}>
          <p style={S.reviewLabel}>What pulls you toward {targetLabel}</p>
          <p style={S.reviewBig}>{pullLabel}</p>
        </div>
        <div style={S.reviewCard}>
          <p style={S.reviewLabel}>What brings you back</p>
          <p style={S.reviewBig}>{backLabel}</p>
        </div>

        <div style={S.footer}>
          <button onClick={() => setPhase('reflect')} style={S.secondaryBtn} disabled={saving}>‹ Back</button>
          <button onClick={finalize} disabled={saving} style={{ ...S.primaryBtnFlex, ...(saving ? S.disabled : {}) }}>
            {saving ? 'Saving…' : 'Save the map'}
          </button>
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
  subtext: { fontSize: '14px', color: '#6B5840', fontFamily: 'Georgia, serif', lineHeight: 1.55, margin: '0 0 0.25rem' },
  footer: { display: 'flex', gap: '10px', marginTop: '1.75rem' },
  primaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  primaryBtnFlex: { flex: 1, padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  secondaryBtn: { padding: '14px 20px', background: 'transparent', color: '#8A7355', border: '0.5px solid #D9C9B0', borderRadius: '12px', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  disabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  card: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F5EEDF 100%)', borderRadius: '0 12px 12px 0', padding: '15px 17px', margin: '1.25rem 0 0.75rem' },
  teachPlain: { padding: '2px', margin: '0.5rem 0 0' },
  cardText: { fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.62, margin: 0 },
  optList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.85rem' },
  opt: { textAlign: 'left', padding: '13px 15px', borderRadius: '11px', border: '0.5px solid #E0D5C2', background: '#FDFBF6', color: '#3A2D1E', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer', lineHeight: 1.4 },
  optOn: { border: '1.5px solid #8A5A1A', background: 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)', color: '#5A3A0E', fontWeight: 600 },
  input: { width: '100%', padding: '12px 14px', border: '0.5px solid #C9A86F', borderRadius: '11px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', marginTop: '2px' },
  reviewCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #EADFCB', borderRadius: '13px', padding: '14px 16px', marginBottom: '10px' },
  reviewLabel: { fontSize: '10px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'Georgia, serif', margin: '0 0 0.35rem' },
  reviewBig: { fontSize: '15.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.4 },
}