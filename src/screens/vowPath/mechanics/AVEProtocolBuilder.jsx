import { useState } from 'react'

// DAY 4 — "A lapse is not a relapse"
// The AVE protocol as a walked decision-path: three stations of a slip
// (first minute / first hour / rest of the day), each a single decisive
// move that assembles into a visible path. Then the reframe — the line that
// interrupts the spiral — picked AND written in your own words.
// Keeps protocol[] (Day 20 reads it). (type: 'aveProtocolBuilder')
export default function AVEProtocolBuilder({ data, onSave, saving }) {
  const {
    teachIntro = [],
    stations = [],
    reframePrompt,
    reframeOptions = [],
    reframeWritePrompt,
    twoStories = {},
  } = data

  const [phase, setPhase] = useState('teach')
  const [picks, setPicks] = useState({})        // stationId -> optionId
  const [openIdx, setOpenIdx] = useState(0)
  const [reframePick, setReframePick] = useState(null)
  const [ownLine, setOwnLine] = useState('')

  const optLabel = (st, oid) => ((st.options.find(o => o.id === oid)) || {}).label || ''
  const allDecided = stations.length > 0 && stations.every(s => picks[s.id])

  const pickOption = (sIdx, sId, oId) => {
    setPicks(p => ({ ...p, [sId]: oId }))
    const nextUndecided = stations.findIndex((s, i) => i > sIdx && !picks[s.id])
    setOpenIdx(nextUndecided === -1 ? -1 : nextUndecided)
  }

  const finalize = () => {
    const protocol = [
      ...stations.map(s => ({
        step_id: s.id, header: s.label,
        selected_options: [picks[s.id]].filter(Boolean),
        selected_labels: [optLabel(s, picks[s.id])].filter(Boolean),
      })),
      {
        step_id: 'reframe', header: 'The reframe',
        selected_options: [reframePick].filter(Boolean),
        selected_labels: [((reframeOptions.find(o => o.id === reframePick)) || {}).label].filter(Boolean),
      },
    ]
    onSave({
      protocol,
      reframe_choice: reframePick,
      reframe_line: ownLine.trim(),
      built_at: new Date().toISOString(),
    })
  }

  // ===================== TEACH =====================
  if (phase === 'teach') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>Day 4 · A lapse is not a relapse</p>
        <h2 style={S.prompt}>The danger isn't the slip. It's the story after.</h2>
        {teachIntro.map((t, i) => (
          <p key={i} style={{ ...S.body, marginBottom: i === teachIntro.length - 1 ? '0.5rem' : '0.85rem' }}>{t}</p>
        ))}
        <div style={S.footer}>
          <button onClick={() => setPhase('path')} style={S.primaryBtn}>Build the path ›</button>
        </div>
      </div>
    )
  }

  // ===================== PATH =====================
  if (phase === 'path') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>If it happens</p>
        <h2 style={S.prompt}>Walk the slip. One move at each step.</h2>
        <p style={S.hint}>Decide each now, while it's calm. In the moment you won't be deciding — you'll be following.</p>

        <div style={{ marginTop: '1.1rem' }}>
          {stations.map((s, idx) => {
            const decided = !!picks[s.id]
            const open = openIdx === idx
            const last = idx === stations.length - 1
            return (
              <div key={s.id} style={{ display: 'flex', gap: '12px' }}>
                {/* rail */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: '15px', height: '15px', borderRadius: '50%', marginTop: '3px',
                    background: decided ? '#8A5A1A' : '#FDFBF6',
                    border: decided ? 'none' : '2px solid #D9C9B0',
                  }} />
                  {!last && <div style={{ width: '2px', flex: 1, minHeight: '14px', background: decided ? '#C9A86F' : '#E6DAC4' }} />}
                </div>
                {/* content */}
                <div style={{ flex: 1, paddingBottom: last ? 0 : '14px' }}>
                  <button onClick={() => setOpenIdx(open ? -1 : idx)} style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%' }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', margin: '0 0 2px' }}>{s.label}</p>
                    {!open && decided && <p style={{ fontSize: '13.5px', color: '#7A3A12', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0 }}>{optLabel(s, picks[s.id])}</p>}
                    {!open && !decided && <p style={{ fontSize: '12.5px', color: '#A8946F', fontFamily: 'Georgia, serif', margin: 0 }}>Tap to choose your move</p>}
                  </button>
                  {open && (
                    <>
                      <p style={{ fontSize: '12.5px', color: '#8A7355', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: '4px 0 9px' }}>{s.cue}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                        {s.options.map(o => {
                          const on = picks[s.id] === o.id
                          return <button key={o.id} onClick={() => pickOption(idx, s.id, o.id)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>{o.label}</button>
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div style={S.footer}>
          <button onClick={() => setPhase('teach')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('reframe')} disabled={!allDecided} style={{ ...S.primaryBtnFlex, ...(!allDecided ? S.disabled : {}) }}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== REFRAME =====================
  if (phase === 'reframe') {
    const ready = !!reframePick
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>The reframe</p>
        <h2 style={S.prompt}>Two voices speak after a slip. One of them lies.</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', margin: '1rem 0 1.3rem' }}>
          <div style={{ borderLeft: '3px solid #C5572C', background: 'linear-gradient(180deg, #FBEEE6 0%, #F8E6DB 100%)', borderRadius: '0 11px 11px 0', padding: '11px 14px' }}>
            <p style={{ fontSize: '10.5px', color: '#B2541F', textTransform: 'uppercase', letterSpacing: '0.13em', fontFamily: 'Georgia, serif', margin: '0 0 4px' }}>The shame voice</p>
            <p style={{ fontSize: '14px', color: '#7A3A12', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: 0 }}>{twoStories.ave}</p>
          </div>
          <div style={{ borderLeft: '3px solid #7A8C5A', background: 'linear-gradient(180deg, #F1F4E9 0%, #E9EFDC 100%)', borderRadius: '0 11px 11px 0', padding: '11px 14px' }}>
            <p style={{ fontSize: '10.5px', color: '#5E7040', textTransform: 'uppercase', letterSpacing: '0.13em', fontFamily: 'Georgia, serif', margin: '0 0 4px' }}>The data voice</p>
            <p style={{ fontSize: '14px', color: '#4A5A30', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: 0 }}>{twoStories.data}</p>
          </div>
        </div>

        <p style={S.groupLabel}>{reframePrompt || 'Pick the one you can actually believe:'}</p>
        <div style={S.optList}>
          {reframeOptions.map(o => {
            const on = reframePick === o.id
            return <button key={o.id} onClick={() => setReframePick(o.id)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>{o.label}</button>
          })}
        </div>

        <p style={{ ...S.groupLabel, marginTop: '1.3rem' }}>{reframeWritePrompt || 'In your own words (optional):'}</p>
        <textarea value={ownLine} onChange={e => setOwnLine(e.target.value)} placeholder="The line you would actually say to yourself…" rows={2} style={S.textarea} maxLength={160} />

        <div style={S.footer}>
          <button onClick={() => setPhase('path')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('review')} disabled={!ready} style={{ ...S.primaryBtnFlex, ...(!ready ? S.disabled : {}) }}>Continue ›</button>
        </div>
      </div>
    )
  }

  // ===================== REVIEW =====================
  if (phase === 'review') {
    const reframeText = ownLine.trim() || ((reframeOptions.find(o => o.id === reframePick)) || {}).label || ''
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>If it happens — your path</p>
        <div style={{ ...S.card, padding: '4px 0' }}>
          {stations.map((s, i) => (
            <div key={s.id} style={{ padding: '11px 16px', borderBottom: i < stations.length - 1 ? '0.5px solid #EADFCB' : 'none' }}>
              <p style={{ fontSize: '10.5px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'Georgia, serif', margin: '0 0 2px' }}>{s.label}</p>
              <p style={{ fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.4 }}>{optLabel(s, picks[s.id])}</p>
            </div>
          ))}
        </div>
        <div style={{ ...S.reviewCard, marginTop: '12px', borderLeft: '3px solid #8A5A1A' }}>
          <p style={S.reviewLabel}>The reframe</p>
          <p style={{ fontSize: '15.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.45 }}>"{reframeText}"</p>
        </div>
        <div style={S.footer}>
          <button onClick={() => setPhase('reframe')} style={S.secondaryBtn} disabled={saving}>‹ Back</button>
          <button onClick={finalize} disabled={saving} style={{ ...S.primaryBtnFlex, ...(saving ? S.disabled : {}) }}>{saving ? 'Saving…' : 'Save the path'}</button>
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
  groupLabel: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600, fontFamily: 'Georgia, serif', margin: '0 0 0.5rem' },
  footer: { display: 'flex', gap: '10px', marginTop: '1.75rem' },
  primaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  primaryBtnFlex: { flex: 1, padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  secondaryBtn: { padding: '14px 20px', background: 'transparent', color: '#8A7355', border: '0.5px solid #D9C9B0', borderRadius: '12px', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  disabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  card: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F5EEDF 100%)', borderRadius: '13px', overflow: 'hidden', border: '0.5px solid #EADFCB' },
  optList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.3rem' },
  opt: { textAlign: 'left', padding: '12px 14px', borderRadius: '11px', border: '0.5px solid #E0D5C2', background: '#FDFBF6', color: '#3A2D1E', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer', lineHeight: 1.4 },
  optOn: { border: '1.5px solid #8A5A1A', background: 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)', color: '#5A3A0E', fontWeight: 600 },
  textarea: { width: '100%', padding: '12px 14px', border: '0.5px solid #C9A86F', borderRadius: '11px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5, resize: 'vertical' },
  reviewCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #EADFCB', borderRadius: '13px', padding: '14px 16px' },
  reviewLabel: { fontSize: '10px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'Georgia, serif', margin: '0 0 0.35rem' },
}