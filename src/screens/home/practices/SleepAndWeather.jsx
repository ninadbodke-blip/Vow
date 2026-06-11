import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// TOOL: "Sleep & weather"  (Early days)
// ===================================================================
// The two vitals that predict a hard evening: last night's sleep and
// today's inner weather. Thirty seconds, two taps — and a quiet
// warning when both run low, because that's the night to guard.
//
// Data: free_stage_signals, stage 'endure',
// signal_type 'daily_vitals' (same contract as the old home),
// payload { sleep, weather, date } — one row per day, updated.
// ===================================================================

const SLEEPS = ['Rough', 'Broken', 'Okay', 'Solid']
const WEATHERS = ['Stormy', 'Grey', 'Clearing', 'Bright']

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function SleepAndWeather({ stage = 'endure' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [sleep, setSleep] = useState('')
  const [weather, setWeather] = useState('')
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
        .eq('signal_type', 'daily_vitals')
        .eq('payload->>date', localDateStr())
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row?.payload) {
        setRowId(row.id)
        setSleep(row.payload.sleep || '')
        setWeather(row.payload.weather || '')
        if (row.payload.sleep && row.payload.weather) setEditing(false)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canSave = sleep && weather
  const lowSleep = sleep === 'Rough' || sleep === 'Broken'
  const lowWeather = weather === 'Stormy' || weather === 'Grey'

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { sleep, weather, date: localDateStr() }
    if (rowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      if (!error) setEditing(false)
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'daily_vitals', payload })
        .select('id').single()
      if (!error && data) { setRowId(data.id); setEditing(false) }
    }
    setSaving(false)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  if (!editing && canSave) {
    return (
      <div style={S.wrap}>
        <div style={S.savedCard}>
          <p style={S.vitalLine}>sleep: {sleep.toLowerCase()} · weather: {weather.toLowerCase()}</p>
          {lowSleep && lowWeather ? (
            <p style={S.warnLine}>Short sleep under a grey sky — tonight is a night to guard. Keep it simple, keep it early.</p>
          ) : lowSleep || lowWeather ? (
            <p style={S.noteLine}>One vital running low. Be a little gentler with the evening than usual.</p>
          ) : (
            <p style={S.noteLine}>Both vitals holding. Ordinary days like this are where the ground gets laid.</p>
          )}
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Update the vitals</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>Two readings, thirty seconds. Hard evenings rarely arrive unannounced — these are the announcements.</p>
      <p style={S.q}>Last night’s sleep</p>
      <div style={S.chips}>
        {SLEEPS.map((s) => (
          <button key={s} onClick={() => setSleep(s)} style={{ ...S.chip, ...(sleep === s ? S.chipOn : {}) }}>{s}</button>
        ))}
      </div>
      <p style={S.q}>Today’s inner weather</p>
      <div style={S.chips}>
        {WEATHERS.map((w) => (
          <button key={w} onClick={() => setWeather(w)} style={{ ...S.chip, ...(weather === w ? S.chipOn : {}) }}>{w}</button>
        ))}
      </div>
      <button style={{ ...S.saveBtn, opacity: canSave ? 1 : 0.45 }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Take the readings'}
      </button>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 12px' },
  q: { fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: 14.5, fontWeight: 500, margin: '14px 0 8px' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: { padding: '8px 12px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 12.5, cursor: 'pointer' },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },
  saveBtn: { width: '100%', marginTop: 18, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  savedCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '15px', textAlign: 'center' },
  vitalLine: { fontFamily: 'Georgia, serif', fontSize: 14, color: '#2A1F15', margin: 0 },
  warnLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#854F0B', margin: '8px 0 0', lineHeight: 1.55 },
  noteLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#9C8C78', margin: '8px 0 0', lineHeight: 1.55 },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}