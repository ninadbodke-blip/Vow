import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// TOOL: "The basics"  (Early days)
// ===================================================================
// Plain words, three questions: sleep, food, movement. These three
// decide how hard tonight feels, so they get checked every day. When
// two or more slip, the tool says so — gently — and asks for a
// simpler, earlier evening.
//
// Data: free_stage_signals, stage 'endure', signal_type 'daily_vitals'
// (same signal as before), payload { sleep, food, movement, date } —
// one row per day, updated in place. Older rows that only carried
// sleep + weather still load; sleep prefills and the rest is asked.
// ===================================================================

const SLEEPS = ['Badly', 'Okay', 'Well']
const FOODS = ['Not really', 'Mostly', 'Yes']
const MOVES = ['No', 'A little', 'Yes']
const LOWS = ['Badly', 'Not really', 'No']

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function SleepAndWeather({ stage = 'endure' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [sleep, setSleep] = useState('')
  const [food, setFood] = useState('')
  const [movement, setMovement] = useState('')
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
        if (SLEEPS.includes(row.payload.sleep)) setSleep(row.payload.sleep)
        if (FOODS.includes(row.payload.food)) setFood(row.payload.food)
        if (MOVES.includes(row.payload.movement)) setMovement(row.payload.movement)
        if (row.payload.sleep && row.payload.food && row.payload.movement) setEditing(false)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canSave = sleep && food && movement
  const lows = [sleep, food, movement].filter((v) => LOWS.includes(v)).length

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { sleep, food, movement, date: localDateStr() }
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

  const Row = ({ label, options, val, onPick }) => (
    <>
      <p style={S.q}>{label}</p>
      <div style={S.chips}>
        {options.map((o) => (
          <button key={o} onClick={() => onPick(o)} style={{ ...S.chip, ...(val === o ? S.chipOn : {}) }}>{o}</button>
        ))}
      </div>
    </>
  )

  if (loading) return <p style={S.muted}>One moment…</p>

  if (!editing && canSave) {
    return (
      <div style={S.wrap}>
        <div style={S.savedCard}>
          <div style={S.readRow}><span style={S.readLabel}>Sleep</span><span style={S.readVal}>{sleep}</span></div>
          <div style={S.readRow}><span style={S.readLabel}>Food</span><span style={S.readVal}>{food}</span></div>
          <div style={{ ...S.readRow, borderBottom: 'none' }}><span style={S.readLabel}>Movement</span><span style={S.readVal}>{movement}</span></div>
        </div>
        {lows >= 2 ? (
          <p style={S.warnLine}>Two or more of the basics slipped today. That makes evenings harder than they need to be — keep tonight simple and get to bed early.</p>
        ) : lows === 1 ? (
          <p style={S.noteLine}>One of the basics slipped. Nothing dramatic — just go a bit easier on yourself this evening.</p>
        ) : (
          <p style={S.noteLine}>All three held today. Quiet wins like this are what the good days are built from.</p>
        )}
        <button style={S.editLink} onClick={() => setEditing(true)}>Change the answers</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>Three quick questions. These three things decide most of how hard tonight feels — so they get checked every day.</p>
      <Row label="How did you sleep last night?" options={SLEEPS} val={sleep} onPick={setSleep} />
      <Row label="Did you eat proper meals today?" options={FOODS} val={food} onPick={setFood} />
      <Row label="Did you move your body today?" options={MOVES} val={movement} onPick={setMovement} />
      <button style={{ ...S.saveBtn, opacity: canSave ? 1 : 0.45 }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Check them off'}
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
  chip: { padding: '8px 14px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 12.5, cursor: 'pointer' },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },
  saveBtn: { width: '100%', marginTop: 18, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  savedCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '4px 15px' },
  readRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid #F0EAD9' },
  readLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#6B5C4A' },
  readVal: { fontFamily: 'Georgia, serif', fontSize: 14, color: '#2A1F15' },
  warnLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#854F0B', margin: '12px 2px 0', lineHeight: 1.55 },
  noteLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#9C8C78', margin: '12px 2px 0', lineHeight: 1.55 },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}