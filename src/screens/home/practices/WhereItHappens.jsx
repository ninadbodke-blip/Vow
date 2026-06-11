import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "Where it happens"  (A closer look — tool three)
// ===================================================================
// The pattern has an address. Three taps — place, company, hour —
// and the user can see the shape of when it usually finds them.
//
// Data: free_stage_signals, stage 'notice',
// signal_type 'notice_context' (same contract as the old home),
// payload { location, company, time_of_day, date } — one row, updated.
// ===================================================================

const PLACES  = ['At home', 'At work', 'Commuting', 'Out somewhere', 'A friend’s place', 'Online']
const COMPANY = ['Alone', 'With a partner', 'With friends', 'With colleagues', 'With family', 'Among strangers']
const TIMES   = ['Morning', 'Afternoon', 'Evening', 'Late night']

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function WhereItHappens({ stage = 'notice' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [location, setLocation] = useState('')
  const [company, setCompany] = useState('')
  const [timeOfDay, setTimeOfDay] = useState('')
  const [editing, setEditing] = useState(false)
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
        .eq('signal_type', 'notice_context')
        .order('created_at', { ascending: false })
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row?.payload) {
        setRowId(row.id)
        setLocation(row.payload.location || '')
        setCompany(row.payload.company || '')
        setTimeOfDay(row.payload.time_of_day || '')
      } else setEditing(true)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canSave = location && company && timeOfDay

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { location, company, time_of_day: timeOfDay, date: localDateStr() }
    if (rowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      if (!error) setEditing(false)
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'notice_context', payload })
        .select('id').single()
      if (!error && data) { setRowId(data.id); setEditing(false) }
    }
    setSaving(false)
  }

  const Row = ({ label, options, value, onPick }) => (
    <>
      <p style={S.q}>{label}</p>
      <div style={S.chips}>
        {options.map((o) => (
          <button key={o} onClick={() => onPick(o)} style={{ ...S.chip, ...(value === o ? S.chipOn : {}) }}>{o}</button>
        ))}
      </div>
    </>
  )

  if (loading) return <p style={S.muted}>One moment…</p>

  if (!editing && canSave) {
    return (
      <div style={S.wrap}>
        <p style={S.intro}>This is where it usually finds you. If that changes, just update it.</p>
        <div style={S.savedCard}>
          <p style={S.savedLine}>{location} · {company.toLowerCase()} · {timeOfDay.toLowerCase()}</p>
          <p style={S.savedSub}>that is where it usually finds you</p>
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Look again</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>Think of how it usually goes — not the odd one out. Where does it usually happen?</p>
      <Row label="Where?" options={PLACES} value={location} onPick={setLocation} />
      <Row label="Who is around?" options={COMPANY} value={company} onPick={setCompany} />
      <Row label="What time of day?" options={TIMES} value={timeOfDay} onPick={setTimeOfDay} />
      <button style={{ ...S.saveBtn, opacity: canSave ? 1 : 0.45 }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Save it'}
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
  savedLine: { fontFamily: 'Georgia, serif', fontSize: 14.5, color: '#2A1F15', margin: 0 },
  savedSub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#9C8C78', margin: '5px 0 0' },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}