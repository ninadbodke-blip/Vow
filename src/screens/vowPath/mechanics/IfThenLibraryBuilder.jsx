import { useState, useMemo } from 'react'

// =====================================================================
// If-then library (Commit · Day 5) — implementation intentions, visual.
// Social scripts as IF→THEN cards (trigger → pre-loaded response), then
// urge breakers by category. Saves social_scripts / social_custom /
// urge_breakers / custom_breakers / total_social_responses /
// total_urge_breakers (shape preserved).
// =====================================================================

export default function IfThenLibraryBuilder({ data, onSave, saving, existingData }) {
  const {
    socialHeader = 'Social scripts.', socialSubtext = '', socialSituations = [],
    urgeBreakersHeader = 'Urge breakers.', urgeBreakersSubtext = '', urgeBreakerCategories = [],
  } = data || {}

  const [phase, setPhase] = useState('social') // 'social' | 'urges'
  const [socialSel, setSocialSel] = useState(existingData?.social_scripts || {})
  const [socialCustom, setSocialCustom] = useState(existingData?.social_custom || {})
  const [socialInput, setSocialInput] = useState({})
  const [urges, setUrges] = useState(existingData?.urge_breakers || [])
  const [customBreakers, setCustomBreakers] = useState(existingData?.custom_breakers || [])
  const [breakerInput, setBreakerInput] = useState('')

  const respFor = (id) => socialSel[id] || []
  const custFor = (id) => socialCustom[id] || []
  const toggleResp = (sid, rid) => setSocialSel(p => {
    const cur = p[sid] || []
    return { ...p, [sid]: cur.includes(rid) ? cur.filter(x => x !== rid) : [...cur, rid] }
  })
  const addSocialCustom = (sid) => {
    const v = (socialInput[sid] || '').trim(); if (!v) return
    setSocialCustom(p => ({ ...p, [sid]: [...(p[sid] || []), v] }))
    setSocialInput(p => ({ ...p, [sid]: '' }))
  }
  const removeSocialCustom = (sid, i) => setSocialCustom(p => ({ ...p, [sid]: (p[sid] || []).filter((_, idx) => idx !== i) }))
  const toggleUrge = (id) => setUrges(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const addBreaker = () => { const v = breakerInput.trim(); if (!v) return; setCustomBreakers([...customBreakers, v]); setBreakerInput('') }

  const totalSocial = useMemo(
    () => socialSituations.reduce((n, s) => n + respFor(s.id).length + custFor(s.id).length, 0),
    [socialSel, socialCustom, socialSituations]
  )
  const totalUrges = urges.length + customBreakers.length

  const save = () => onSave({
    social_scripts: socialSel, social_custom: socialCustom,
    urge_breakers: urges, custom_breakers: customBreakers,
    total_social_responses: totalSocial, total_urge_breakers: totalUrges,
  })

  // ============================ SOCIAL ============================
  if (phase === 'social') {
    return (
      <div>
        <p style={S.prompt}>{socialHeader}</p>
        <p style={S.lead}>{socialSubtext} Pick the lines you'd actually use. Pre-decided, so you're not inventing them while you're put on the spot.</p>

        {socialSituations.map(sit => {
          const picked = respFor(sit.id), customs = custFor(sit.id)
          const has = picked.length + customs.length > 0
          const input = socialInput[sit.id] || ''
          return (
            <div key={sit.id} style={{ ...S.card, ...(has ? S.cardOn : {}) }}>
              <div style={S.ifRow}><span style={S.ifPill}>IF</span><span style={S.ifText}>{sit.situation}</span></div>
              <div style={S.thenRow}><span style={S.arrow}>↓</span><span style={S.thenLabel}>THEN</span></div>
              <div style={S.respList}>
                {(sit.responses || []).map(r => {
                  const on = picked.includes(r.id)
                  return (
                    <button key={r.id} onClick={() => toggleResp(sit.id, r.id)} style={{ ...S.resp, ...(on ? S.respOn : {}) }}>
                      <span style={{ ...S.dot, ...(on ? S.dotOn : {}) }}>{on ? '✓' : ''}</span>
                      <span style={S.respText}>{r.label}</span>
                    </button>
                  )
                })}
                {customs.map((c, i) => (
                  <button key={`c${i}`} onClick={() => removeSocialCustom(sit.id, i)} style={{ ...S.resp, ...S.respOn }}>
                    <span style={{ ...S.dot, ...S.dotOn }}>✓</span>
                    <span style={{ ...S.respText, fontStyle: 'italic' }}>{c}</span><span style={S.rm}>remove</span>
                  </button>
                ))}
                {sit.allowCustom && (
                  <div style={S.addRow}>
                    <input value={input} onChange={e => setSocialInput(p => ({ ...p, [sit.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addSocialCustom(sit.id)} placeholder="Your own line…" style={S.input} />
                    <button onClick={() => addSocialCustom(sit.id)} disabled={!input.trim()} style={{ ...S.addBtn, ...(input.trim() ? {} : S.addOff) }}>Add</button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <button onClick={() => setPhase('urges')} disabled={totalSocial < 1} style={{ ...S.cta, ...(totalSocial < 1 ? S.ctaOff : {}) }}>
          {totalSocial < 1 ? 'Pick at least one line' : 'Now the urge breakers ›'}
        </button>
      </div>
    )
  }

  // ============================ URGES ============================
  return (
    <div>
      <p style={S.prompt}>{urgeBreakersHeader}</p>
      <p style={S.lead}>{urgeBreakersSubtext}</p>

      <div style={S.tally}><span style={S.tallyNum}>{totalUrges}</span><span style={S.tallyLabel}>{totalUrges === 1 ? 'breaker loaded' : 'breakers loaded'}</span></div>

      {urgeBreakerCategories.map(cat => (
        <div key={cat.key} style={S.catBlock}>
          <p style={S.catLabel}>{cat.label}</p>
          <div style={S.respList}>
            {(cat.items || []).map(it => {
              const on = urges.includes(it.id)
              return (
                <button key={it.id} onClick={() => toggleUrge(it.id)} style={{ ...S.resp, ...(on ? S.respOn : {}) }}>
                  <span style={{ ...S.dot, ...(on ? S.dotOn : {}) }}>{on ? '✓' : ''}</span>
                  <span style={S.respText}>{it.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <p style={S.catLabel}>Your own</p>
      <div style={S.respList}>
        {customBreakers.map((c, i) => (
          <button key={i} onClick={() => setCustomBreakers(customBreakers.filter((_, idx) => idx !== i))} style={{ ...S.resp, ...S.respOn }}>
            <span style={{ ...S.dot, ...S.dotOn }}>✓</span><span style={{ ...S.respText, fontStyle: 'italic' }}>{c}</span><span style={S.rm}>remove</span>
          </button>
        ))}
        <div style={S.addRow}>
          <input value={breakerInput} onChange={e => setBreakerInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBreaker()} placeholder="A breaker that works for you…" style={S.input} />
          <button onClick={addBreaker} disabled={!breakerInput.trim()} style={{ ...S.addBtn, ...(breakerInput.trim() ? {} : S.addOff) }}>Add</button>
        </div>
      </div>

      <div style={S.row2}>
        <button onClick={() => setPhase('social')} style={S.back}>‹ Back</button>
        <button onClick={save} disabled={totalUrges < 1 || saving} style={{ ...S.cta, flex: 1, marginTop: 0, ...(totalUrges < 1 || saving ? S.ctaOff : {}) }}>{saving ? 'Saving…' : 'Save the library ›'}</button>
      </div>
    </div>
  )
}

const S = {
  prompt: { fontSize: '19px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.36, margin: '0 0 0.5rem' },
  lead: { fontSize: '14.5px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.55, margin: '0 0 1.2rem' },
  card: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #E8DFD0', borderRadius: '16px', padding: '1rem', marginBottom: '1rem', boxShadow: '0 2px 10px rgba(80,50,20,0.05)' },
  cardOn: { borderColor: '#E3C9A8' },
  ifRow: { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '0.55rem' },
  ifPill: { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#854F0B', background: '#F4ECDD', borderRadius: '6px', padding: '4px 8px', flexShrink: 0, fontFamily: 'Georgia, serif', marginTop: '1px' },
  ifText: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 600, lineHeight: 1.4 },
  thenRow: { display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 0.7rem 4px' },
  arrow: { fontSize: '15px', color: '#C5572C' },
  thenLabel: { fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#A14222', fontFamily: 'Georgia, serif' },
  respList: { display: 'flex', flexDirection: 'column', gap: '7px' },
  resp: { display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%', padding: '11px 13px', background: 'white', border: '0.5px solid #EBE3D5', borderRadius: '11px', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', transition: 'all 0.13s' },
  respOn: { background: 'linear-gradient(180deg, #FDFBF6 0%, #F7E2D5 100%)', border: '1px solid #C5572C' },
  dot: { width: '17px', height: '17px', borderRadius: '5px', border: '1px solid #DDCFB6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#FAF7F1', flexShrink: 0, background: 'white', marginTop: '1px' },
  dotOn: { background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)', border: '1px solid #A14222' },
  respText: { flex: 1, fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.45 },
  rm: { fontSize: '10px', color: '#9C8C78', fontStyle: 'italic', alignSelf: 'center', flexShrink: 0 },
  addRow: { display: 'flex', gap: '8px', marginTop: '1px' },
  input: { flex: 1, padding: '10px 12px', borderRadius: '10px', border: '0.5px solid #DDCFB6', background: 'white', fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', boxSizing: 'border-box', outline: 'none' },
  addBtn: { background: 'transparent', border: '0.5px solid #C5572C', borderRadius: '10px', padding: '0 16px', fontSize: '12.5px', fontWeight: 600, color: '#C5572C', fontFamily: 'inherit', cursor: 'pointer' },
  addOff: { opacity: 0.4, cursor: 'not-allowed' },
  tally: { display: 'flex', alignItems: 'baseline', gap: '9px', justifyContent: 'center', background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '0.5px solid #E8DFD0', borderRadius: '14px', padding: '0.8rem', marginBottom: '1.2rem' },
  tallyNum: { fontSize: '26px', color: '#C5572C', fontFamily: 'Georgia, serif', fontWeight: 700, lineHeight: 1 },
  tallyLabel: { fontSize: '12.5px', color: '#7A6A52', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  catBlock: { marginBottom: '1.1rem' },
  catLabel: { fontSize: '11.5px', color: '#854F0B', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, margin: '0 0 0.55rem' },
  cta: { width: '100%', padding: '16px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)', marginTop: '0.4rem' },
  ctaOff: { background: '#C9B894', boxShadow: 'none', cursor: 'not-allowed' },
  row2: { display: 'flex', gap: '10px', alignItems: 'center', marginTop: '1.1rem' },
  back: { padding: '16px 18px', background: 'transparent', color: '#854F0B', border: '0.5px solid #DDCFB6', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
}
