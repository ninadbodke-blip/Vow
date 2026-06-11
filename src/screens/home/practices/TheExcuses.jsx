import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "The excuses"  (Weighing it up — tool three)
// ===================================================================
// Every habit has a press office. The user marks the lines it uses
// on them and names the loudest one. No counter-arguments offered —
// named excuses simply work less well.
//
// Data: free_stage_signals, stage 'reflect',
// signal_type 'reflect_rationalization' (same contract as the old home),
// payload { lies: [..], loudest, date } — one row, updated in place.
// ===================================================================

const LIES = [
  'Just one won’t matter',
  'I’ve earned it',
  'I’ll stop tomorrow',
  'It helps me cope',
  'Everyone does it',
  'I’m fine, actually',
  'It’s not that bad',
]

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function TheExcuses({ stage = 'reflect' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [selected, setSelected] = useState([])
  const [loudest, setLoudest] = useState('')
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
        .eq('signal_type', 'reflect_rationalization')
        .order('created_at', { ascending: false })
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row?.payload) {
        setRowId(row.id)
        setSelected(Array.isArray(row.payload.lies) ? row.payload.lies : [])
        setLoudest(row.payload.loudest || '')
      } else setEditing(true)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const toggle = (l) => {
    setSelected((s) => (s.includes(l) ? s.filter((x) => x !== l) : [...s, l]))
    if (loudest === l && selected.includes(l)) setLoudest('')
  }

  const canSave = selected.length > 0

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { lies: selected, loudest: selected.includes(loudest) ? loudest : null, date: localDateStr() }
    if (rowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      if (!error) setEditing(false)
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'reflect_rationalization', payload })
        .select('id').single()
      if (!error && data) { setRowId(data.id); setEditing(false) }
    }
    setSaving(false)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  if (!editing && canSave) {
    return (
      <div style={S.wrap}>
        <p style={S.intro}>Named. They don’t vanish — they just work less well once you can see them coming.</p>
        <div style={S.savedCard}>
          {loudest && <p style={S.loudLine}>“{loudest}”</p>}
          {loudest && <p style={S.loudTag}>the loudest one</p>}
          <p style={S.savedSub}>{selected.length} {selected.length === 1 ? 'line' : 'lines'} on the list</p>
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Update the list</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>Which of these does it actually say to you? Tap every one that sounds familiar.</p>
      <div style={S.chips}>
        {LIES.map((l) => (
          <button key={l} onClick={() => toggle(l)} style={{ ...S.chip, ...(selected.includes(l) ? S.chipOn : {}) }}>{l}</button>
        ))}
      </div>

      {selected.length > 1 && (
        <>
          <p style={S.q}>And the loudest?</p>
          <div style={S.chips}>
            {selected.map((l) => (
              <button key={l} onClick={() => setLoudest(loudest === l ? '' : l)} style={{ ...S.chip, ...(loudest === l ? S.loudOn : {}) }}>{l}</button>
            ))}
          </div>
        </>
      )}

      <button style={{ ...S.saveBtn, opacity: canSave ? 1 : 0.45 }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Name them'}
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
  loudOn: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: '1px solid #241710' },
  saveBtn: { width: '100%', marginTop: 18, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  savedCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '16px 15px', textAlign: 'center' },
  loudLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15.5, color: '#2A1F15', margin: 0 },
  loudTag: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#854F0B', margin: '4px 0 8px' },
  savedSub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#9C8C78', margin: 0 },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}