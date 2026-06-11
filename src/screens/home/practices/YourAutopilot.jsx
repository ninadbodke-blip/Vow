import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "Your autopilot"  (A closer look)
// ===================================================================
// No verdicts here. The user names how awake they were the last time
// it ran, and what came right before. Seeing the autopilot is the
// whole practice — deciding anything about it belongs to later modes.
//
// Data: free_stage_signals, stage 'notice',
// signal_type 'notice_autopilot' (same contract as the old home),
// payload { level, before_activity, date } — one row, updated in place.
// ===================================================================

const LEVELS = [
  { value: 0, label: 'I fully chose it' },
  { value: 1, label: 'I half noticed' },
  { value: 2, label: 'I barely noticed' },
  { value: 3, label: 'I only realised afterwards' },
]

const BEFORE = ['Scrolling', 'Work stress', 'After dinner', 'Boredom', 'Being social', 'An argument', 'Late night', 'Just habit']

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function YourAutopilot({ stage = 'notice' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [level, setLevel] = useState(null)
  const [before, setBefore] = useState('')
  const [ownBefore, setOwnBefore] = useState('')
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
        .eq('signal_type', 'notice_autopilot')
        .order('created_at', { ascending: false })
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row) {
        setRowId(row.id)
        if (row.payload?.level != null) setLevel(Math.min(3, Number(row.payload.level)))
        if (row.payload?.before_activity) {
          if (BEFORE.includes(row.payload.before_activity)) setBefore(row.payload.before_activity)
          else { setBefore('own'); setOwnBefore(row.payload.before_activity) }
        }
      } else {
        setEditing(true)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const beforeText = before === 'own' ? ownBefore.trim() : before
  const canSave = level != null && !!beforeText

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { level, before_activity: beforeText, date: localDateStr() }
    if (rowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      if (!error) setEditing(false)
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'notice_autopilot', payload })
        .select('id').single()
      if (!error && data) { setRowId(data.id); setEditing(false) }
    }
    setSaving(false)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  if (!editing && level != null && beforeText) {
    return (
      <div style={S.wrap}>
        <p style={S.intro}>This is what you noticed. It can change any time you look again.</p>
        <div style={S.savedCard}>
          <p style={S.savedLine}>{LEVELS[level].label}</p>
          <p style={S.savedSub}>usually right after — {beforeText.toLowerCase()}</p>
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Look again</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>Think of the last time it happened almost on its own. No need to judge it — just remember it.</p>

      <p style={S.q}>How much did you choose it?</p>
      <div style={S.levels}>
        {LEVELS.map((l) => (
          <button key={l.value} onClick={() => setLevel(l.value)}
            style={{ ...S.levelBtn, ...(level === l.value ? S.levelOn : {}) }}>
            {l.label}
          </button>
        ))}
      </div>

      <p style={S.q}>What came right before?</p>
      <div style={S.chips}>
        {BEFORE.map((b) => (
          <button key={b} onClick={() => setBefore(b)}
            style={{ ...S.chip, ...(before === b ? S.chipOn : {}) }}>{b}</button>
        ))}
        <button onClick={() => setBefore('own')} style={{ ...S.chip, ...(before === 'own' ? S.chipOn : {}) }}>Something else…</button>
      </div>
      {before === 'own' && (
        <input
          style={S.input}
          value={ownBefore}
          onChange={(e) => setOwnBefore(e.target.value)}
          placeholder="What came before, in your words"
          maxLength={60}
        />
      )}

      <button style={{ ...S.saveBtn, opacity: canSave ? 1 : 0.45 }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Save what you noticed'}
      </button>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 14px' },
  q: { fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: 14.5, fontWeight: 500, margin: '14px 0 8px' },
  levels: { display: 'flex', flexDirection: 'column', gap: 7 },
  levelBtn: { textAlign: 'left', padding: '11px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 13.5, cursor: 'pointer' },
  levelOn: { background: '#F4ECDD', border: '1px solid #C9A85C', boxShadow: '0 1px 6px rgba(133,79,11,0.10)' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: { padding: '8px 12px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 12.5, cursor: 'pointer' },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },
  input: { width: '100%', boxSizing: 'border-box', marginTop: 9, padding: '11px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: 13.5, color: '#2A1F15', outline: 'none' },
  saveBtn: { width: '100%', marginTop: 18, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  savedCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '16px 15px', textAlign: 'center' },
  savedLine: { fontFamily: 'Georgia, serif', fontSize: 15.5, color: '#2A1F15', margin: 0 },
  savedSub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#9C8C78', margin: '5px 0 0' },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}