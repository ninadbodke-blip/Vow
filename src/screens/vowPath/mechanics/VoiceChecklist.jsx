import { useState, useEffect, useMemo } from 'react'

// =====================================================================
// The Using Voice (Reflect · Day 12) — Addictive-voice recognition.
// Recognise each permission-giving line, rate how convincing it is to
// YOU, then meet a calm counter for each. The point (AVRT / cognitive
// distortions): the voice is a script, not you — naming it shrinks it.
// Saves selected_statements / custom_statements / total_count
// (portrait-compatible) plus convincing + loudest_pattern/text.
// =====================================================================

const COUNTERS = {
  just_one: "If one were really enough, it wouldn't have to keep making the same promise.",
  just_once: "If once were enough, it wouldn't keep asking.",
  deserve_it: "You deserve to feel good tomorrow too — and this is the thing that quietly takes that away.",
  deserve_break: "A break that costs you the next morning isn't rest. It's the voice borrowing against you.",
  tomorrow: "Tomorrow has been the plan for a while now. The voice loves a date it never has to keep.",
  not_that_bad: "It was never about whether someone has it worse. It's whether this is costing you what you said it costs.",
  everyone_does: "Everyone isn't sitting where you are, reading this, at this hour. You are.",
  special_occasion: "If enough days don't count, the counting is the problem.",
  no_one_knows: "The part of you keeping it secret already knows what the secret means.",
  cant_handle: "You got through hard things before it, and you will after it. 'Can't' is the dependence talking, not the truth.",
  cant_relax: "You could before it, and you will after it. 'Can't' is the dependence, not the fact.",
}
const GENERIC = "That's the voice doing its job — making the case for the thing that's hurting you. You don't have to win the argument. You just have to notice it's a script."
const DEFAULT_C = 3

export default function VoiceChecklist({
  header,
  subtext,
  statements = [],
  allowCustom = true,
  maxCustom = 2,
  existingData,
  onSave,
  saving,
}) {
  const [step, setStep] = useState(0) // 0 recognise · 1 convincing · 2 counters
  const [selectedIds, setSelectedIds] = useState([])
  const [customs, setCustoms] = useState([]) // [{id,text}]
  const [convincing, setConvincing] = useState({}) // id -> 1..5
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!existingData) return
    setSelectedIds(existingData.selected_statements || [])
    const cs = (existingData.custom_statements || []).map((c, i) => (typeof c === 'string' ? { id: `c${i}`, text: c } : c))
    setCustoms(cs)
    setConvincing(existingData.convincing || {})
    if ((existingData.selected_statements || []).length) setStep(2)
  }, [existingData])

  const byId = useMemo(() => Object.fromEntries(statements.map(s => [s.id, s])), [statements])
  const toggle = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    setConvincing(c => (c[id] ? c : { ...c, [id]: DEFAULT_C }))
  }
  const addCustom = () => {
    const v = draft.trim(); if (!v || customs.length >= maxCustom) return
    const id = `c${Date.now() % 100000}`
    setCustoms([...customs, { id, text: v }]); setDraft('')
    setConvincing(c => ({ ...c, [id]: DEFAULT_C }))
  }
  const removeCustom = (id) => setCustoms(customs.filter(c => c.id !== id))

  const items = useMemo(() => [
    ...selectedIds.map(id => ({ id, text: (byId[id] || {}).text || id, pattern: (byId[id] || {}).pattern || null, counter: COUNTERS[id] || GENERIC })),
    ...customs.map(c => ({ id: c.id, text: c.text, pattern: 'Your own', counter: GENERIC, custom: true })),
  ], [selectedIds, customs, byId])
  const totalSelected = items.length

  const ordered = useMemo(() => [...items].sort((a, b) => (convincing[b.id] || 0) - (convincing[a.id] || 0)), [items, convincing])
  const loudest = ordered[0]

  const save = () => {
    onSave({
      selected_statements: selectedIds,
      custom_statements: customs.map(c => c.text.trim()).filter(Boolean),
      total_count: totalSelected,
      convincing,
      loudest_pattern: loudest?.pattern || null,
      loudest_text: loudest?.text || null,
    })
  }

  const Heft = ({ id }) => {
    const w = convincing[id] || DEFAULT_C
    return (
      <div style={S.heftBars}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setConvincing(p => ({ ...p, [id]: n }))}
            style={{ ...S.heftBar, height: `${7 + n * 4}px`, background: n <= w ? '#C5572C' : '#E6DAC6' }} />
        ))}
      </div>
    )
  }

  // ============================ STEP 0 · RECOGNISE ============================
  if (step === 0) {
    return (
      <div>
        <p style={S.lead}>{subtext || "These are the lines the using part of the mind uses to get its way. Tap the ones you've heard in your own head — the wording doesn't have to be exact."}</p>
        <div style={S.list}>
          {statements.map(stmt => {
            const on = selectedIds.includes(stmt.id)
            return (
              <button key={stmt.id} onClick={() => toggle(stmt.id)}
                style={{ ...S.card, ...(on ? S.cardOn : {}) }}>
                <span style={{ ...S.box, ...(on ? S.boxOn : {}) }}>{on ? '✓' : ''}</span>
                <span style={{ flex: 1 }}>
                  <span style={S.quote}>{stmt.text}</span>
                  {on && stmt.pattern && <span style={S.patternTag}>{stmt.pattern}</span>}
                </span>
              </button>
            )
          })}
          {customs.map(cu => (
            <button key={cu.id} onClick={() => removeCustom(cu.id)} style={{ ...S.card, ...S.cardOn }}>
              <span style={{ ...S.box, ...S.boxOn }}>✓</span>
              <span style={{ flex: 1 }}><span style={{ ...S.quote, fontStyle: 'italic' }}>{cu.text}</span></span>
              <span style={S.removeX}>remove</span>
            </button>
          ))}
          {allowCustom && customs.length < maxCustom && (
            <div style={S.customRow}>
              <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()}
                placeholder="Add a line you hear…" style={S.input} />
              <button onClick={addCustom} style={S.addBtn}>Add</button>
            </div>
          )}
        </div>
        <button onClick={() => setStep(1)} disabled={totalSelected < 1} style={{ ...S.cta, ...(totalSelected < 1 ? S.ctaOff : {}) }}>
          {totalSelected < 1 ? 'Tap the ones you recognise' : `These ${totalSelected} ›`}
        </button>
      </div>
    )
  }

  // ============================ STEP 1 · HOW CONVINCING ============================
  if (step === 1) {
    return (
      <div>
        <p style={S.lead}>Now, honestly — how convincing is each one <em>to you</em>, in the moment? Some you see straight through. Some still win.</p>
        <div style={S.scaleHint}><span>I see through it</span><span>it usually wins</span></div>
        {items.map(it => (
          <div key={it.id} style={S.weighRow}>
            <span style={S.weighLabel}>{it.text}</span>
            <Heft id={it.id} />
          </div>
        ))}
        <div style={S.row2}>
          <button onClick={() => setStep(0)} style={S.back}>‹ Back</button>
          <button onClick={() => setStep(2)} style={{ ...S.cta, flex: 1, marginTop: 0 }}>Answer them ›</button>
        </div>
      </div>
    )
  }

  // ============================ STEP 2 · THE COUNTER ============================
  const readingText = loudest
    ? `The one you find most convincing right now is ${loudest.pattern ? `the ${loudest.pattern.toLowerCase()}` : 'your own line'} — ${loudest.text}. None of these are you. They're a script the using mind runs, almost word for word, in nearly everyone who has been caught by something. Naming a line as the script — not the truth — is what lets you hear it coming and answer it. You just did that with ${totalSelected} of them.`
    : ''
  return (
    <div>
      <p style={S.lead}>Each line, and the answer to it. The loudest ones are at the top.</p>
      <div style={S.exchangeWrap}>
        {ordered.map(it => (
          <div key={it.id} style={S.exchange}>
            <div style={S.voiceLine}>
              <span style={S.voiceMark}>“</span>
              <span style={{ flex: 1 }}>
                <span style={S.voiceText}>{it.text.replace(/^["“]|["”]$/g, '')}</span>
                {it.pattern && <span style={S.patternTag}>{it.pattern}</span>}
              </span>
            </div>
            <div style={S.counterLine}>
              <span style={S.counterArrow}>↳</span>
              <span style={S.counterText}>{it.counter}</span>
            </div>
          </div>
        ))}
      </div>
      <p style={S.reading}>{readingText}</p>
      <div style={S.row2}>
        <button onClick={() => setStep(1)} style={S.back}>‹ Back</button>
        <button onClick={save} disabled={saving} style={{ ...S.cta, flex: 1, marginTop: 0, ...(saving ? S.ctaOff : {}) }}>
          {saving ? 'Saving…' : 'I can hear it now ›'}
        </button>
      </div>
    </div>
  )
}

const S = {
  lead: { fontSize: '15px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: '0 0 1.3rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '0.4rem' },
  card: { display: 'flex', alignItems: 'flex-start', width: '100%', padding: '13px 15px', background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '12px', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', gap: '11px', transition: 'all 0.15s', boxShadow: '0 2px 4px rgba(80,50,20,0.04)' },
  cardOn: { background: 'linear-gradient(180deg, #FDFBF6 0%, #F7E2D5 100%)', border: '1px solid #C5572C', boxShadow: '0 3px 10px rgba(197,87,44,0.10)' },
  box: { width: '18px', height: '18px', borderRadius: '5px', border: '1px solid #DDCFB6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#FAF7F1', flexShrink: 0, background: 'white', marginTop: '2px' },
  boxOn: { background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)', border: '1px solid #A14222' },
  quote: { display: 'block', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.5 },
  patternTag: { display: 'inline-block', marginTop: '5px', fontSize: '10.5px', color: '#A14222', fontFamily: 'Georgia, serif', fontStyle: 'italic', letterSpacing: '0.01em' },
  removeX: { fontSize: '10px', color: '#9C8C78', fontStyle: 'italic', alignSelf: 'center', flexShrink: 0 },
  customRow: { display: 'flex', gap: '8px', marginTop: '2px' },
  input: { flex: 1, padding: '11px 13px', borderRadius: '10px', border: '0.5px solid #DDCFB6', background: 'white', fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', boxSizing: 'border-box', outline: 'none' },
  addBtn: { background: 'transparent', border: '0.5px solid #C5572C', borderRadius: '10px', padding: '0 16px', fontSize: '13px', fontWeight: 600, color: '#C5572C', fontFamily: 'inherit', cursor: 'pointer' },
  scaleHint: { display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '-0.6rem 0 1rem', padding: '0 2px' },
  weighRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '11px 0', borderBottom: '0.5px solid #EEE6D7' },
  weighLabel: { fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.45, flex: 1 },
  heftBars: { display: 'flex', alignItems: 'flex-end', gap: '4px', height: '28px', flexShrink: 0 },
  heftBar: { width: '11px', border: 'none', borderRadius: '3px', cursor: 'pointer', padding: 0, transition: 'background 0.12s' },
  exchangeWrap: { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '0.5rem' },
  exchange: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #E8DFD0', borderRadius: '14px', padding: '13px 15px', boxShadow: '0 2px 8px rgba(80,50,20,0.05)' },
  voiceLine: { display: 'flex', gap: '8px', alignItems: 'flex-start' },
  voiceMark: { fontSize: '26px', color: '#C5572C', fontFamily: 'Georgia, serif', lineHeight: 0.9, opacity: 0.55 },
  voiceText: { fontSize: '14.5px', color: '#5A3A0E', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.45 },
  counterLine: { display: 'flex', gap: '9px', alignItems: 'flex-start', marginTop: '9px', paddingTop: '9px', borderTop: '0.5px solid #EEE6D7' },
  counterArrow: { fontSize: '15px', color: '#7A8C5A', flexShrink: 0, lineHeight: 1.5 },
  counterText: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.55 },
  reading: { fontSize: '15px', color: '#3A2D1E', fontFamily: 'Georgia, serif', lineHeight: 1.65, margin: '1.2rem 0 1.3rem' },
  cta: { width: '100%', padding: '16px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)', marginTop: '0.5rem' },
  ctaOff: { background: '#C9B894', boxShadow: 'none', cursor: 'not-allowed' },
  row2: { display: 'flex', gap: '10px', alignItems: 'center' },
  back: { padding: '16px 18px', background: 'transparent', color: '#854F0B', border: '0.5px solid #DDCFB6', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
}
