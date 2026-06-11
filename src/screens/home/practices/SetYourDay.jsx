import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// SHEET: "Day one"  (Getting ready)
// ===================================================================
// Picking the day, and nothing else. Not someday — a date with a
// name. Quick chips for the near ones, a picker for the rest, and
// the countdown begins under the tree the moment it's sealed.
//
// Data: free_stage_signals, stage 'commit',
// signal_type 'commit_start_date', payload { date } — one row,
// updated in place (same contract the countdown reads).
// ===================================================================

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d }
const nextSaturday = () => {
  const d = new Date()
  const delta = ((6 - d.getDay()) + 7) % 7 || 7
  d.setDate(d.getDate() + delta)
  return d
}

export default function SetYourDay({ stage = 'commit' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [date, setDate] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sealed, setSealed] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('id, payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'commit_start_date')
        .order('created_at', { ascending: false })
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row?.payload?.date) {
        setRowId(row.id)
        setDate(row.payload.date)
        setSealed(true)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const seal = async (d) => {
    if (saving || !d) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { date: d }
    if (rowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      if (!error) { setDate(d); setSealed(true) }
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'commit_start_date', payload })
        .select('id').single()
      if (!error && data) { setRowId(data.id); setDate(d); setSealed(true) }
    }
    setSaving(false)
    setShowPicker(false)
  }

  const CHIPS = [
    { label: 'Tomorrow', d: addDays(1) },
    { label: 'In three days', d: addDays(3) },
    { label: 'This Saturday', d: nextSaturday() },
    { label: 'In a week', d: addDays(7) },
  ]

  if (loading) return <p style={S.muted}>One moment…</p>

  if (sealed && date && !showPicker) {
    const target = new Date(`${date}T00:00:00`)
    const daysLeft = Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86400000))
    const nice = target.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
    return (
      <div style={S.wrap}>
        <div style={S.sealedCard}>
          <p style={S.sealedEyebrow}>Sealed</p>
          <p style={S.sealedDate}>{nice}</p>
          <p style={S.sealedSub}>{daysLeft === 0 ? 'That is today.' : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} from now.`} The tree is already counting every second.</p>
        </div>
        <p style={S.note}>A date can be moved — but each move costs a little belief. Move it once if you must, then let it stand.</p>
        <button style={S.changeLink} onClick={() => setShowPicker(true)}>Move the day</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>
        Not someday. A date with a name — close enough to feel, far enough to prepare for. The moment you choose it, a countdown starts under your tree, and the getting-ready begins for real.
      </p>
      <div style={S.chips}>
        {CHIPS.map((c) => (
          <button key={c.label} disabled={saving} onClick={() => seal(iso(c.d))} style={S.chip}>
            <span style={S.chipLabel}>{c.label}</span>
            <span style={S.chipDate}>{c.d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          </button>
        ))}
      </div>
      <p style={S.orLine}>or pick the exact day</p>
      <input
        type="date"
        min={iso(addDays(1))}
        max={iso(addDays(30))}
        onChange={(e) => e.target.value && seal(e.target.value)}
        style={S.dateInput}
        disabled={saving}
      />
      <p style={S.helper}>Within the next thirty days — momentum has a shelf life.</p>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 14px' },
  chips: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 },
  chip: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '13px 8px', background: '#FDFBF6', border: '0.5px solid #E2D7C3', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit' },
  chipLabel: { fontFamily: 'Georgia, serif', fontSize: 14, color: '#2A1F15', fontWeight: 500 },
  chipDate: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11, color: '#9C8C78' },
  orLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#9C8C78', textAlign: 'center', margin: '14px 0 8px' },
  dateInput: { width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#2A1F15', fontSize: 14, fontFamily: 'inherit' },
  helper: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#9C8C78', textAlign: 'center', margin: '8px 0 0' },
  sealedCard: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', borderRadius: 16, padding: '18px 16px', textAlign: 'center' },
  sealedEyebrow: { fontSize: 9.5, color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.26em', fontFamily: 'Georgia, serif', margin: '0 0 7px' },
  sealedDate: { fontFamily: 'Georgia, serif', fontSize: 18, color: '#FAF7F1', margin: 0 },
  sealedSub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#CBBA98', margin: '8px 0 0', lineHeight: 1.5 },
  note: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#854F0B', lineHeight: 1.55, margin: '13px 0 0', textAlign: 'center' },
  changeLink: { display: 'block', margin: '10px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}