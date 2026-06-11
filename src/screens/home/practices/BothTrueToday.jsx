import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// DAILY: "Both true today"  (Weighing it up)
// ===================================================================
// Ambivalence isn't confusion — it's two true things disagreeing.
// Each day the user names one thing they value, how today's choices
// sat against it, and the size of the gap. No resolution demanded;
// the daily act is holding both without flinching.
//
// Data: free_stage_signals, stage 'reflect',
// signal_type 'reflect_dissonance' (same contract as the old home),
// payload { value, action, drift, date } — one row per day, updated.
// ===================================================================

const VALUES = ['My health', 'My family', 'My self-respect', 'My freedom', 'My calm', 'My money']
const ACTIONS = ['Matched it', 'A little off', 'Went against it']
const DRIFTS = ['No gap', 'A small gap', 'A big gap']

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function BothTrueToday({ stage = 'reflect' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [value, setValue] = useState('')
  const [action, setAction] = useState('')
  const [drift, setDrift] = useState('')
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
        .eq('signal_type', 'reflect_dissonance')
        .eq('payload->>date', localDateStr())
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row?.payload) {
        setRowId(row.id)
        setValue(row.payload.value || '')
        setAction(row.payload.action || '')
        setDrift(row.payload.drift || '')
        if (row.payload.value && row.payload.action && row.payload.drift) setEditing(false)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canSave = value && action && drift

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { value, action, drift, date: localDateStr() }
    if (rowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      if (!error) setEditing(false)
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'reflect_dissonance', payload })
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
        <p style={S.intro}>Saved for today. Seeing the gap clearly is the first step to closing it.</p>
        <div style={S.savedCard}>
          <p style={S.pairTop}>{value}</p>
          <p style={S.pairMid}>{action.toLowerCase()} today</p>
          <p style={S.pairGap}>{drift.toLowerCase()}</p>
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Answer again</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>Two things can both be true at once. Just answer honestly, for today.</p>
      <Row label="Pick one thing that really matters to you" options={VALUES} val={value} onPick={setValue} />
      <Row label="Today, what you did about the habit…" options={ACTIONS} val={action} onPick={setAction} />
      <Row label="How big is the gap between the two?" options={DRIFTS} val={drift} onPick={setDrift} />
      <button style={{ ...S.saveBtn, opacity: canSave ? 1 : 0.45 }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Save for today'}
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
  savedCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '16px 15px', textAlign: 'center' },
  pairTop: { fontFamily: 'Georgia, serif', fontSize: 15.5, color: '#2A1F15', margin: 0 },
  pairMid: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#6B5C4A', margin: '5px 0 0' },
  pairGap: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#854F0B', margin: '8px 0 0' },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}