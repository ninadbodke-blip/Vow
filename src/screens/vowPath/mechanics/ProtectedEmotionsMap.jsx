import { useState } from 'react'

// DAY 3 — "What was underneath"
// Two-layer map: first what the substance DID for you (its function), then
// lift the lid — the feeling underneath each. Experiential-avoidance teaching,
// then the one feeling that now needs another route, and one way to stay with
// it. (type: 'protectedEmotionsMap')
export default function ProtectedEmotionsMap({ data, onSave, saving }) {
  const {
    teachIntro = [],
    functionsPrompt,
    functions = [],
    underneathPrompt,
    feelingGroups = [],
    allowCustom = true,
    customPrompt = 'Another feeling it was managing',
    read = {},
    followUpPrompt,
    followUpOptions = [],
    keyPrompt,
    withPrompt,
    withOptions = [],
  } = data

  const [phase, setPhase] = useState('open')
  const [funcs, setFuncs] = useState([])          // function ids
  const [feels, setFeels] = useState([])          // feeling ids
  const [customText, setCustomText] = useState('')
  const [customFeels, setCustomFeels] = useState([])
  const [followUp, setFollowUp] = useState(null)
  const [keyFeel, setKeyFeel] = useState(null)
  const [withPick, setWithPick] = useState(null)
  const [withCustom, setWithCustom] = useState('')

  const allFeelItems = feelingGroups.flatMap(g => g.items)
  const feelLabel = (id) => (allFeelItems.find(f => f.id === id) || {}).label || id
  const funcLabel = (id) => (functions.find(f => f.id === id) || {}).label || id
  const toggle = (arr, set, id) => set(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id])
  const totalFeel = feels.length + customFeels.length

  const addCustom = () => {
    const t = customText.trim()
    if (t && !customFeels.includes(t)) { setCustomFeels([...customFeels, t]); setCustomText('') }
  }

  const finalize = () => {
    onSave({
      // --- fields EndurePortrait (Day 20) reads ---
      selected_emotions: feels,
      custom_emotions: customFeels,
      follow_up: followUp,
      // --- richer data ---
      functions: funcs,
      key_feeling: keyFeel,
      staying_with: withPick === 'custom' ? `custom:${withCustom.trim()}` : withPick,
      mapped_at: new Date().toISOString(),
    })
  }

  // ===================== OPEN (teach) =====================
  if (phase === 'open') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Day 3 · What was underneath</p>
        <h2 style={S.prompt}>The substance had a job.</h2>
        {teachIntro.map((t, i) => (
          <p key={i} style={{ ...S.body, marginBottom: i === teachIntro.length - 1 ? '0.5rem' : '0.85rem' }}>{t}</p>
        ))}
        <div style={S.footer}>
          <button onClick={() => setPhase('functions')} style={S.primaryBtn}>Begin ›</button>
        </div>
      </div>
    )
  }

  // ===================== FUNCTIONS (layer 1) =====================
  if (phase === 'functions') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>First layer</p>
        <h2 style={S.prompt}>{functionsPrompt || 'What did it do for you, in the moment?'}</h2>
        <p style={S.hint}>Tap the ones that ring true. No judgement here — it worked, or you wouldn't have kept reaching for it.</p>
        <div style={S.optList}>
          {functions.map(o => {
            const on = funcs.includes(o.id)
            return <button key={o.id} onClick={() => toggle(funcs, setFuncs, o.id)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>{o.label}</button>
          })}
        </div>
        <div style={S.footer}>
          <button onClick={() => setPhase('open')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('underneath')} disabled={funcs.length === 0} style={{ ...S.primaryBtnFlex, ...(funcs.length === 0 ? S.disabled : {}) }}>Lift the lid ›</button>
        </div>
      </div>
    )
  }

  // ===================== UNDERNEATH (layer 2) =====================
  if (phase === 'underneath') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Underneath</p>
        <h2 style={S.prompt}>{underneathPrompt || 'And under that — what was it really managing?'}</h2>

        {funcs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '0.4rem 0 0.9rem' }}>
            {funcs.map(id => (
              <span key={id} style={{ fontSize: '11px', color: '#8A6A3A', background: '#F4E7CE', border: '0.5px solid #DEC9A0', borderRadius: '20px', padding: '4px 10px', fontFamily: 'Georgia, serif' }}>
                {funcLabel(id).split('—')[0].trim().toLowerCase()}
              </span>
            ))}
          </div>
        )}

        {feelingGroups.map(g => (
          <div key={g.key} style={{ marginBottom: '1rem' }}>
            <p style={S.groupLabel}>{g.label}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {g.items.map(f => {
                const on = feels.includes(f.id)
                return (
                  <button key={f.id} onClick={() => toggle(feels, setFeels, f.id)}
                    style={{
                      textAlign: 'left', padding: '9px 13px', borderRadius: '20px', cursor: 'pointer',
                      border: on ? '1.5px solid #B2541F' : '0.5px solid #E0D5C2',
                      background: on ? 'linear-gradient(180deg, #F7E3CF 0%, #F1D6BA 100%)' : '#FDFBF6',
                      color: on ? '#7A3A12' : '#4A3A28', fontWeight: on ? 600 : 400,
                      fontSize: '13px', fontFamily: 'Georgia, serif', lineHeight: 1.35, transition: 'all .12s',
                    }}>
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {allowCustom && (
          <div style={{ marginTop: '0.5rem' }}>
            {customFeels.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {customFeels.map((c, i) => (
                  <span key={i} style={{ fontSize: '12.5px', color: '#7A3A12', background: 'linear-gradient(180deg, #F7E3CF 0%, #F1D6BA 100%)', border: '1px solid #D9B57A', borderRadius: '20px', padding: '5px 11px', fontFamily: 'Georgia, serif' }}>
                    {c} <span onClick={() => setCustomFeels(customFeels.filter((_, j) => j !== i))} style={{ cursor: 'pointer', opacity: 0.55, marginLeft: '3px' }}>×</span>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '7px' }}>
              <input value={customText} onChange={e => setCustomText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()} placeholder={customPrompt} style={{ ...S.input, marginTop: 0, flex: 1 }} maxLength={60} />
              <button onClick={addCustom} disabled={!customText.trim()} style={{ ...S.secondaryBtn, padding: '12px 16px', opacity: customText.trim() ? 1 : 0.4 }}>Add</button>
            </div>
          </div>
        )}

        <div style={S.footer}>
          <button onClick={() => setPhase('functions')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('read')} disabled={totalFeel === 0} style={{ ...S.primaryBtnFlex, ...(totalFeel === 0 ? S.disabled : {}) }}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== READ (synthesis + follow-up) =====================
  if (phase === 'read') {
    const ready = !!followUp
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>What this means</p>
        <p style={{ ...S.body, marginBottom: '0.85rem' }}>
          You lifted {totalFeel} {totalFeel === 1 ? 'feeling' : 'feelings'}. {read.lead}
        </p>
        <div style={{ ...S.card, borderLeft: '3px solid #854F0B' }}>
          <p style={S.cardText}>{read.reframe}</p>
        </div>

        <p style={{ ...S.groupLabel, marginTop: '1.4rem' }}>{followUpPrompt || 'Looking at what you lifted:'}</p>
        <div style={S.optList}>
          {followUpOptions.map(o => {
            const on = followUp === o.id
            return <button key={o.id} onClick={() => setFollowUp(o.id)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>{o.label}</button>
          })}
        </div>

        <div style={S.footer}>
          <button onClick={() => setPhase('underneath')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('choose')} disabled={!ready} style={{ ...S.primaryBtnFlex, ...(!ready ? S.disabled : {}) }}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== CHOOSE (key feeling + staying-with) =====================
  if (phase === 'choose') {
    const chosen = [...feels, ...customFeels.map((c, i) => `custom_${i}`)]
    const chosenLabel = (id) => id.startsWith('custom_') ? customFeels[Number(id.split('_')[1])] : feelLabel(id)
    const ready = keyFeel && withPick && (withPick !== 'custom' || withCustom.trim())
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>The one that matters most</p>
        <h2 style={S.prompt}>{keyPrompt || 'Without the substance, which one most needs another way through?'}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '0.85rem' }}>
          {chosen.map(id => {
            const on = keyFeel === id
            return (
              <button key={id} onClick={() => setKeyFeel(id)}
                style={{
                  padding: '9px 13px', borderRadius: '20px', cursor: 'pointer',
                  border: on ? '1.5px solid #8A5A1A' : '0.5px solid #E0D5C2',
                  background: on ? 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)' : '#FDFBF6',
                  color: on ? '#5A3A0E' : '#4A3A28', fontWeight: on ? 600 : 400,
                  fontSize: '13px', fontFamily: 'Georgia, serif',
                }}>
                {chosenLabel(id)}
              </button>
            )
          })}
        </div>

        <h2 style={{ ...S.prompt, marginTop: '1.6rem' }}>{withPrompt || 'One way to stay with it — not fix it, just be with it:'}</h2>
        <div style={S.optList}>
          {withOptions.map(o => {
            const on = withPick === o.id
            return <button key={o.id} onClick={() => setWithPick(o.id)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>{o.label}</button>
          })}
          <button onClick={() => setWithPick('custom')} style={{ ...S.opt, ...(withPick === 'custom' ? S.optOn : {}) }}>Something else…</button>
          {withPick === 'custom' && (
            <input value={withCustom} onChange={e => setWithCustom(e.target.value)} placeholder="Name it" style={S.input} maxLength={90} />
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
    const keyLabel = keyFeel && keyFeel.startsWith('custom_') ? customFeels[Number(keyFeel.split('_')[1])] : feelLabel(keyFeel)
    const wLabel = withPick === 'custom' ? withCustom.trim() : ((withOptions.find(o => o.id === withPick) || {}).label || '')
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Named</p>
        <div style={S.reviewCard}>
          <p style={S.reviewLabel}>What it was managing</p>
          <p style={S.reviewBig}>{totalFeel} {totalFeel === 1 ? 'feeling' : 'feelings'}, lifted into the light</p>
        </div>
        <div style={S.reviewCard}>
          <p style={S.reviewLabel}>The one that needs another route</p>
          <p style={S.reviewBig}>{keyLabel}</p>
        </div>
        <div style={S.reviewCard}>
          <p style={S.reviewLabel}>How you'll stay with it</p>
          <p style={S.reviewBig}>{wLabel}</p>
        </div>
        <div style={S.footer}>
          <button onClick={() => setPhase('choose')} style={S.secondaryBtn} disabled={saving}>‹ Back</button>
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
  prompt: { fontSize: '21px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.34, margin: '0 0 0.6rem' },
  body: { fontSize: '15.5px', color: '#3A2D1E', fontFamily: 'Georgia, serif', lineHeight: 1.72, margin: 0 },
  hint: { fontSize: '14px', color: '#7E6A52', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 0.25rem' },
  groupLabel: { fontSize: '11.5px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.13em', fontWeight: 600, fontFamily: 'Georgia, serif', margin: '0 0 0.5rem' },
  footer: { display: 'flex', gap: '10px', marginTop: '1.75rem' },
  primaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  primaryBtnFlex: { flex: 1, padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  secondaryBtn: { padding: '14px 20px', background: 'transparent', color: '#8A7355', border: '0.5px solid #D9C9B0', borderRadius: '12px', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  disabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  card: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F5EEDF 100%)', borderRadius: '0 12px 12px 0', padding: '15px 17px' },
  cardText: { fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.62, margin: 0 },
  optList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.85rem' },
  opt: { textAlign: 'left', padding: '13px 15px', borderRadius: '11px', border: '0.5px solid #E0D5C2', background: '#FDFBF6', color: '#3A2D1E', fontSize: '14.5px', fontFamily: 'Georgia, serif', cursor: 'pointer', lineHeight: 1.45 },
  optOn: { border: '1.5px solid #8A5A1A', background: 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)', color: '#5A3A0E', fontWeight: 600 },
  input: { width: '100%', padding: '12px 14px', border: '0.5px solid #C9A86F', borderRadius: '11px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', marginTop: '2px' },
  reviewCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #EADFCB', borderRadius: '13px', padding: '14px 16px', marginBottom: '10px' },
  reviewLabel: { fontSize: '10px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'Georgia, serif', margin: '0 0 0.35rem' },
  reviewBig: { fontSize: '15.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.4 },
}
