import { useState, useMemo } from 'react'

// =====================================================================
// Stop date (Commit · Day 1) — the commitment device, made vivid.
// A live countdown and a 10–30-day readiness-window band, the date
// landing in range. Then reasons, then the night-before plan.
// Saves stop_date / days_from_today / reasons / custom_reasons /
// night_before_plan (shape preserved).
// =====================================================================

const iso = (d) => d.toISOString().slice(0, 10)
const daysBetween = (a, b) => Math.round((a.setHours(0,0,0,0) ? a - b : a - b) / 86400000)

export default function DatePicker({ data, onSave, saving, existingData }) {
  const {
    minDaysFromNow = 10, maxDaysFromNow = 30,
    datePickerHeader = 'When does it stop?', datePickerSubtext = '',
    reasonsHeader = 'Why this date?', reasonsSubtext = '', reasonOptions = [],
    allowCustomReasons = true, customReasonPrompt = 'Another reason',
    nightBeforeHeader = 'The night before.', nightBeforeSubtext = '', nightBeforeOptions = [],
  } = data || {}

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const minDate = useMemo(() => { const d = new Date(today); d.setDate(d.getDate() + minDaysFromNow); return d }, [today])
  const maxDate = useMemo(() => { const d = new Date(today); d.setDate(d.getDate() + maxDaysFromNow); return d }, [today])

  const [phase, setPhase] = useState('date') // 'date' | 'reasons' | 'night'
  const [selectedDate, setSelectedDate] = useState(existingData?.stop_date || '')
  const [reasons, setReasons] = useState(existingData?.reasons || [])
  const [customReasons, setCustomReasons] = useState(existingData?.custom_reasons || [])
  const [reasonInput, setReasonInput] = useState('')
  const [nightBefore, setNightBefore] = useState(existingData?.night_before_plan || [])

  const daysFromToday = useMemo(() => {
    if (!selectedDate) return null
    const d = new Date(selectedDate); d.setHours(0,0,0,0)
    return Math.round((d - today) / 86400000)
  }, [selectedDate, today])
  const inRange = daysFromToday != null && daysFromToday >= minDaysFromNow && daysFromToday <= maxDaysFromNow
  const bandPct = daysFromToday == null ? 0 : Math.max(0, Math.min(100, ((daysFromToday - minDaysFromNow) / (maxDaysFromNow - minDaysFromNow)) * 100))

  const toggle = (arr, set, id) => set(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id])
  const addReason = () => { const v = reasonInput.trim(); if (!v) return; setCustomReasons([...customReasons, v]); setReasonInput('') }

  const prettyDate = selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : ''
  const save = () => onSave({ stop_date: selectedDate, days_from_today: daysFromToday, reasons, custom_reasons: customReasons, night_before_plan: nightBefore })

  // ============================ DATE ============================
  if (phase === 'date') {
    return (
      <div>
        <p style={S.prompt}>{datePickerHeader}</p>
        <p style={S.lead}>{datePickerSubtext}</p>

        <div style={S.countWrap}>
          {daysFromToday == null ? (
            <span style={S.countEmpty}>Choose a date below</span>
          ) : (
            <>
              <span style={S.countNum}>{daysFromToday}</span>
              <span style={S.countLabel}>{daysFromToday === 1 ? 'day from today' : 'days from today'}{inRange ? '' : ' — outside the window'}</span>
              {inRange && <span style={S.countDate}>{prettyDate}</span>}
            </>
          )}
        </div>

        <div style={S.bandWrap}>
          <div style={S.band}>
            <span style={{ ...S.bandFill, opacity: inRange ? 1 : 0.35 }} />
            {daysFromToday != null && <span style={{ ...S.marker, left: `${bandPct}%`, background: inRange ? '#C5572C' : '#B59A78' }} />}
          </div>
          <div style={S.bandLabels}><span>{minDaysFromNow} days</span><span>ready window</span><span>{maxDaysFromNow} days</span></div>
        </div>

        <input type="date" value={selectedDate} min={iso(minDate)} max={iso(maxDate)} onChange={e => setSelectedDate(e.target.value)} style={S.dateInput} />
        {daysFromToday != null && !inRange && <p style={S.warn}>That's outside the {minDaysFromNow}–{maxDaysFromNow} day window. Closer and there isn't time to prepare; further and the date stops feeling real.</p>}

        <button onClick={() => setPhase('reasons')} disabled={!inRange} style={{ ...S.cta, ...(!inRange ? S.ctaOff : {}) }}>
          {!selectedDate ? 'Pick a date' : !inRange ? 'Choose a date in the window' : 'This is the date ›'}
        </button>
      </div>
    )
  }

  // ============================ REASONS ============================
  if (phase === 'reasons') {
    const any = reasons.length + customReasons.length > 0
    return (
      <div>
        <p style={S.prompt}>{reasonsHeader}</p>
        <p style={S.lead}>{reasonsSubtext}</p>
        <div style={S.chips}>
          {reasonOptions.map(o => {
            const on = reasons.includes(o.id)
            return <button key={o.id} onClick={() => toggle(reasons, setReasons, o.id)} style={{ ...S.chip, ...(on ? S.chipOn : {}) }}>{o.label}</button>
          })}
          {customReasons.map((r, i) => (
            <button key={`c${i}`} onClick={() => setCustomReasons(customReasons.filter((_, idx) => idx !== i))} style={{ ...S.chip, ...S.chipOn }}>{r} ✕</button>
          ))}
        </div>
        {allowCustomReasons && (
          <div style={S.addRow}>
            <input value={reasonInput} onChange={e => setReasonInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReason()} placeholder={customReasonPrompt} style={S.input} />
            <button onClick={addReason} disabled={!reasonInput.trim()} style={{ ...S.addBtn, ...(reasonInput.trim() ? {} : S.addOff) }}>Add</button>
          </div>
        )}
        <div style={S.row2}>
          <button onClick={() => setPhase('date')} style={S.back}>‹ Back</button>
          <button onClick={() => setPhase('night')} disabled={!any} style={{ ...S.cta, flex: 1, marginTop: 0, ...(!any ? S.ctaOff : {}) }}>{any ? 'The night before ›' : 'Pick at least one'}</button>
        </div>
      </div>
    )
  }

  // ============================ NIGHT ============================
  const anyNight = nightBefore.length > 0
  return (
    <div>
      <p style={S.prompt}>{nightBeforeHeader}</p>
      <p style={S.lead}>{nightBeforeSubtext}</p>
      <div style={S.list}>
        {nightBeforeOptions.map(o => {
          const on = nightBefore.includes(o.id)
          return (
            <button key={o.id} onClick={() => toggle(nightBefore, setNightBefore, o.id)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>
              <span style={{ ...S.box, ...(on ? S.boxOn : {}) }}>{on ? '✓' : ''}</span>
              <span style={S.optText}>{o.label}</span>
            </button>
          )
        })}
      </div>
      <div style={S.row2}>
        <button onClick={() => setPhase('reasons')} style={S.back}>‹ Back</button>
        <button onClick={save} disabled={!anyNight || saving} style={{ ...S.cta, flex: 1, marginTop: 0, ...(!anyNight || saving ? S.ctaOff : {}) }}>{saving ? 'Saving…' : 'Set the date ›'}</button>
      </div>
    </div>
  )
}

const S = {
  prompt: { fontSize: '19px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.36, margin: '0 0 0.5rem' },
  lead: { fontSize: '14.5px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.55, margin: '0 0 1.2rem' },
  countWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '0.5px solid #E8DFD0', borderRadius: '16px', padding: '1.3rem 1rem', marginBottom: '1rem' },
  countEmpty: { fontSize: '14px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  countNum: { fontSize: '52px', color: '#C5572C', fontFamily: 'Georgia, serif', fontWeight: 700, lineHeight: 1 },
  countLabel: { fontSize: '13px', color: '#7A6A52', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  countDate: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', marginTop: '4px' },
  bandWrap: { marginBottom: '1.1rem' },
  band: { position: 'relative', height: '8px', borderRadius: '4px', background: '#EFE7D7', overflow: 'visible' },
  bandFill: { position: 'absolute', inset: 0, borderRadius: '4px', background: 'linear-gradient(90deg, #E8C9A0 0%, #C9A86F 50%, #E8C9A0 100%)' },
  marker: { position: 'absolute', top: '-4px', width: '16px', height: '16px', borderRadius: '50%', border: '2px solid white', transform: 'translateX(-50%)', boxShadow: '0 1px 4px rgba(80,50,20,0.3)', transition: 'left 0.2s' },
  bandLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', marginTop: '8px' },
  dateInput: { width: '100%', padding: '13px 14px', borderRadius: '12px', border: '0.5px solid #DDCFB6', background: 'white', fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', boxSizing: 'border-box', outline: 'none' },
  warn: { fontSize: '12.5px', color: '#A14222', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, margin: '0.7rem 0 0' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '0.9rem' },
  chip: { padding: '10px 14px', borderRadius: '999px', border: '0.5px solid #DDCFB6', background: 'white', fontSize: '13px', color: '#3A2D1E', fontFamily: 'Georgia, serif', cursor: 'pointer', transition: 'all 0.13s' },
  chipOn: { background: 'linear-gradient(180deg, #FDFBF6 0%, #F7E2D5 100%)', border: '1px solid #C5572C', color: '#2A1F15' },
  list: { display: 'flex', flexDirection: 'column', gap: '7px' },
  opt: { display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%', padding: '12px 13px', background: 'white', border: '0.5px solid #EBE3D5', borderRadius: '11px', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', transition: 'all 0.13s' },
  optOn: { background: 'linear-gradient(180deg, #FDFBF6 0%, #F7E2D5 100%)', border: '1px solid #C5572C' },
  box: { width: '17px', height: '17px', borderRadius: '5px', border: '1px solid #DDCFB6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#FAF7F1', flexShrink: 0, background: 'white', marginTop: '1px' },
  boxOn: { background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)', border: '1px solid #A14222' },
  optText: { flex: 1, fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.45 },
  addRow: { display: 'flex', gap: '8px', marginBottom: '0.5rem' },
  input: { flex: 1, padding: '11px 13px', borderRadius: '10px', border: '0.5px solid #DDCFB6', background: 'white', fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', boxSizing: 'border-box', outline: 'none' },
  addBtn: { background: 'transparent', border: '0.5px solid #C5572C', borderRadius: '10px', padding: '0 18px', fontSize: '13px', fontWeight: 600, color: '#C5572C', fontFamily: 'inherit', cursor: 'pointer' },
  addOff: { opacity: 0.4, cursor: 'not-allowed' },
  cta: { width: '100%', padding: '16px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)', marginTop: '0.4rem' },
  ctaOff: { background: '#C9B894', boxShadow: 'none', cursor: 'not-allowed' },
  row2: { display: 'flex', gap: '10px', alignItems: 'center', marginTop: '1.1rem' },
  back: { padding: '16px 18px', background: 'transparent', color: '#854F0B', border: '0.5px solid #DDCFB6', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
}
