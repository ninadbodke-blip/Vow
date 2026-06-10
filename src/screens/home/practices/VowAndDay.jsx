import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "Your vow & your day"  (Getting ready)
// ===================================================================
// Two decisions that make it real: one honest line in the user's own
// voice, and the day it begins. The line is theirs — no templates,
// no minimum length. The day gets a quiet countdown.
//
// Data: free_stage_signals, stage 'commit'.
//   signal_type 'commit_vow'        payload { text }        (append; latest read)
//   signal_type 'commit_start_date' payload { date }        (one row, updated)
// commit_vow keeps the old home's contract, so an old vow carries over.
// ===================================================================

const localDateStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d }
const nextSaturday = () => { const d = new Date(); const diff = (6 - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + diff); return d }
const friendly = (iso) => {
  const [y, m, dd] = iso.split('-').map(Number)
  return new Date(y, m - 1, dd).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
}
const daysUntil = (iso) => {
  const [y, m, dd] = iso.split('-').map(Number)
  const target = new Date(y, m - 1, dd)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

export default function VowAndDay({ stage = 'commit' }) {
  const [loading, setLoading] = useState(true)
  const [vow, setVow] = useState('')
  const [savedVow, setSavedVow] = useState('')
  const [dateRowId, setDateRowId] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) { setLoading(false); return }
      const [{ data: vowRows }, { data: dateRows }] = await Promise.all([
        supabase.from('free_stage_signals').select('payload')
          .eq('user_id', user.id).eq('signal_type', 'commit_vow')
          .order('created_at', { ascending: false }).limit(1),
        supabase.from('free_stage_signals').select('id, payload')
          .eq('user_id', user.id).eq('signal_type', 'commit_start_date')
          .order('created_at', { ascending: false }).limit(1),
      ])
      if (cancelled) return
      const v = vowRows && vowRows[0]?.payload?.text
      if (v) { setSavedVow(v); setVow(v) }
      const dr = dateRows && dateRows[0]
      if (dr?.payload?.date) { setDateRowId(dr.id); setStartDate(dr.payload.date) }
      if (!v && !dr) setEditing(true)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canSave = vow.trim().length > 0 && !!startDate

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    let ok = true
    if (vow.trim() !== savedVow) {
      const { error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'commit_vow', payload: { text: vow.trim() } })
      ok = !error
      if (ok) setSavedVow(vow.trim())
    }
    if (ok) {
      const payload = { date: startDate }
      if (dateRowId) {
        const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', dateRowId)
        ok = !error
      } else {
        const { data, error } = await supabase.from('free_stage_signals')
          .insert({ user_id: user.id, stage, signal_type: 'commit_start_date', payload })
          .select('id').single()
        ok = !error && !!data
        if (ok) setDateRowId(data.id)
      }
    }
    if (ok) setEditing(false)
    setSaving(false)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  const dleft = startDate ? daysUntil(startDate) : null

  if (!editing && savedVow && startDate) {
    return (
      <div style={S.wrap}>
        <div style={S.vowCard}>
          <p style={S.vowText}>“{savedVow}”</p>
        </div>
        <div style={S.dayCard}>
          <p style={S.dayMain}>
            {dleft > 1 && `Day one is ${friendly(startDate)} — ${dleft} days from now.`}
            {dleft === 1 && 'Day one is tomorrow.'}
            {dleft === 0 && 'Day one is today.'}
            {dleft < 0 && `Day one was ${friendly(startDate)}.`}
          </p>
          {dleft >= 0 && <p style={S.daySub}>Until then, this mode is for getting the ground ready — nothing more is asked.</p>}
          {dleft < 0 && <p style={S.daySub}>If you have begun, Early days is waiting in your profile whenever you switch.</p>}
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Change the line or the day</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>One line, in your own voice — the reason that is actually yours. Then pick the day it begins.</p>

      <p style={S.q}>Your line</p>
      <textarea
        style={S.textarea}
        value={vow}
        onChange={(e) => setVow(e.target.value)}
        placeholder="Say it the way you’d say it out loud…"
        rows={3}
        maxLength={240}
      />

      <p style={S.q}>Your day</p>
      <div style={S.chips}>
        <button onClick={() => { setStartDate(localDateStr()); setShowPicker(false) }}
          style={{ ...S.chip, ...(startDate === localDateStr() ? S.chipOn : {}) }}>Today</button>
        <button onClick={() => { setStartDate(localDateStr(addDays(1))); setShowPicker(false) }}
          style={{ ...S.chip, ...(startDate === localDateStr(addDays(1)) ? S.chipOn : {}) }}>Tomorrow</button>
        <button onClick={() => { setStartDate(localDateStr(nextSaturday())); setShowPicker(false) }}
          style={{ ...S.chip, ...(startDate === localDateStr(nextSaturday()) ? S.chipOn : {}) }}>This weekend</button>
        <button onClick={() => setShowPicker(true)} style={{ ...S.chip, ...(showPicker ? S.chipOn : {}) }}>Pick a date…</button>
      </div>
      {showPicker && (
        <input type="date" style={S.dateInput} value={startDate} min={localDateStr()}
          onChange={(e) => setStartDate(e.target.value)} />
      )}
      {startDate && !showPicker && (
        <p style={S.preview}>{friendly(startDate)}{dleft > 0 ? ` — ${dleft} day${dleft === 1 ? '' : 's'} from now` : dleft === 0 ? ' — today' : ''}</p>
      )}

      <button style={{ ...S.saveBtn, opacity: canSave ? 1 : 0.45 }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Set it down'}
      </button>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 12px' },
  q: { fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: 14.5, fontWeight: 500, margin: '14px 0 8px' },
  textarea: { width: '100%', boxSizing: 'border-box', padding: '12px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: 14.5, fontStyle: 'italic', color: '#2A1F15', outline: 'none', resize: 'none', lineHeight: 1.5 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: { padding: '8px 12px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 12.5, cursor: 'pointer' },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },
  dateInput: { marginTop: 9, padding: '10px 12px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: 13.5, color: '#2A1F15', outline: 'none' },
  preview: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#854F0B', margin: '9px 0 0' },
  saveBtn: { width: '100%', marginTop: 18, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  vowCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '18px 16px' },
  vowText: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15.5, color: '#2A1F15', lineHeight: 1.55, margin: 0, textAlign: 'center' },
  dayCard: { marginTop: 10, background: '#F8F2E4', border: '0.5px solid #EADFC8', borderRadius: 14, padding: '13px 15px' },
  dayMain: { fontFamily: 'Georgia, serif', fontSize: 13.5, color: '#2A1F15', margin: 0, textAlign: 'center' },
  daySub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#9C8C78', margin: '6px 0 0', textAlign: 'center', lineHeight: 1.5 },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}