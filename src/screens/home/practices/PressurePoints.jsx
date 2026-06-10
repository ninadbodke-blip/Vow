import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "Pressure points"  (Staying steady)
// ===================================================================
// Month two slips rarely come from nowhere — they come from load.
// The user marks this week's overall pressure and taps which parts of
// life are carrying the most. When the load is high, the practice
// says the quiet part: heavy weeks are when routines earn their keep.
//
// Data: free_stage_signals, stage 'build',
// signal_type 'build_pillars' (same contract as the old home),
// payload { stress (1–5), pillars: [keys], high_stress, date }.
// One row per day, updated in place.
// ===================================================================

const PILLARS = [
  { key: 'work',          label: 'Work' },
  { key: 'money',         label: 'Money' },
  { key: 'sleep',         label: 'Sleep' },
  { key: 'relationships', label: 'People close to you' },
  { key: 'health',        label: 'Health' },
  { key: 'boredom',       label: 'Empty hours' },
]

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function PressurePoints({ stage = 'build' }) {
  const [loading, setLoading] = useState(true)
  const [todayRowId, setTodayRowId] = useState(null)
  const [stress, setStress] = useState(0)
  const [picked, setPicked] = useState([])
  const [editing, setEditing] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('id, payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'build_pillars')
        .order('created_at', { ascending: false })
        .limit(4)
      if (cancelled) return
      const today = localDateStr()
      const todays = (data || []).find((r) => r.payload?.date === today)
      if (todays) {
        setTodayRowId(todays.id)
        setStress(Number(todays.payload.stress) || 0)
        setPicked(Array.isArray(todays.payload.pillars) ? todays.payload.pillars : [])
        setEditing(false)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const togglePillar = (k) =>
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))

  const canSave = stress > 0

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { stress, pillars: picked, high_stress: stress >= 4 && picked.length > 0, date: localDateStr() }
    if (todayRowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', todayRowId)
      if (!error) setEditing(false)
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'build_pillars', payload })
        .select('id').single()
      if (!error && data) { setTodayRowId(data.id); setEditing(false) }
    }
    setSaving(false)
  }

  const pickedLabels = PILLARS.filter((p) => picked.includes(p.key)).map((p) => p.label.toLowerCase())
  const carryLine =
    pickedLabels.length === 0 ? 'Nothing singled out — an evenly loaded week.'
    : pickedLabels.length === 1 ? `${pickedLabels[0][0].toUpperCase()}${pickedLabels[0].slice(1)} is carrying the most right now.`
    : `${pickedLabels.slice(0, -1).join(', ')} and ${pickedLabels[pickedLabels.length - 1]} are carrying the most right now.`

  if (loading) return <p style={S.muted}>One moment…</p>

  if (!editing) {
    return (
      <div style={S.wrap}>
        <p style={S.intro}>Checked for today. Load shifts — this is worth a glance whenever the week changes shape.</p>
        <div style={S.savedCard}>
          <div style={S.dotsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} style={{ ...S.dot, ...(n <= stress ? S.dotOn : {}) }} />
            ))}
            <span style={S.dotsLabel}>{stress <= 2 ? 'light' : stress === 3 ? 'medium' : 'heavy'}</span>
          </div>
          <p style={S.savedLine}>{carryLine}</p>
          {stress >= 4 && (
            <p style={S.heavyNote}>Heavy weeks are when your routines earn their keep. Keep the evenings simple; don’t add new battles.</p>
          )}
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Check again</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>Steadiness isn’t tested on calm weeks. Where’s the load sitting right now?</p>

      <p style={S.q}>Overall, this week feels…</p>
      <div style={S.dotsPick}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setStress(n)} style={{ ...S.dotBtn, ...(n <= stress ? S.dotBtnOn : {}) }} aria-label={`Level ${n}`} />
        ))}
        <span style={S.dotsLabel}>{stress === 0 ? 'tap to set' : stress <= 2 ? 'light' : stress === 3 ? 'medium' : 'heavy'}</span>
      </div>

      <p style={S.q}>And which parts are carrying the most?</p>
      <div style={S.chips}>
        {PILLARS.map((p) => (
          <button key={p.key} onClick={() => togglePillar(p.key)}
            style={{ ...S.chip, ...(picked.includes(p.key) ? S.chipOn : {}) }}>{p.label}</button>
        ))}
      </div>

      <button style={{ ...S.saveBtn, opacity: canSave ? 1 : 0.45 }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Mark the load'}
      </button>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 12px' },
  q: { fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: 14.5, fontWeight: 500, margin: '14px 0 8px' },
  dotsPick: { display: 'flex', alignItems: 'center', gap: 9 },
  dotBtn: { width: 22, height: 22, borderRadius: '50%', border: '1px solid #D8CCB2', background: '#FDFBF6', cursor: 'pointer', padding: 0 },
  dotBtnOn: { background: 'linear-gradient(180deg, #D9B57A, #C9A85C)', border: '1px solid #B8954C' },
  dotsRow: { display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center' },
  dot: { width: 12, height: 12, borderRadius: '50%', border: '1px solid #D8CCB2', background: '#FDFBF6', display: 'inline-block' },
  dotOn: { background: '#C9A85C', border: '1px solid #B8954C' },
  dotsLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#9C8C78', marginLeft: 4 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: { padding: '8px 12px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 12.5, cursor: 'pointer' },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },
  saveBtn: { width: '100%', marginTop: 18, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  savedCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '15px' },
  savedLine: { fontFamily: 'Georgia, serif', fontSize: 14, color: '#2A1F15', margin: '11px 0 0', textAlign: 'center' },
  heavyNote: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#854F0B', margin: '9px 0 0', textAlign: 'center', lineHeight: 1.55 },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}