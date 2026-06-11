import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// DAILY: "Today's shield"  (Getting back up)
// ===================================================================
// After a slip, grand promises are the trap. The daily here is one
// small promise for one short window — the old home's shield, kept:
// pick the window, pick the move, hold just that.
//
// Data: free_stage_signals, stage 'reclaim',
// signal_type 'reclaim_shield' (same contract — same option strings —
// as the old home), payload { window, action, date } — appended; the
// date field is additive and ignored by old readers.
// ===================================================================

const SHIELD_WINDOWS = ['Next hour', 'Next 12 hours', 'Just today']
const SHIELD_ACTIONS = ['Go to sleep', 'Step outside', 'Drink water', 'Text my anchor', 'Stay off my phone']

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function TodaysShield({ stage = 'reclaim' }) {
  const [loading, setLoading] = useState(true)
  const [todays, setTodays] = useState([])
  const [windowSel, setWindowSel] = useState('')
  const [action, setAction] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'reclaim_shield')
        .order('created_at', { ascending: false })
        .limit(6)
      if (cancelled) return
      setTodays((data || []).map((r) => r.payload).filter((p) => p?.date === localDateStr()))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canRaise = windowSel && action

  const raise = async () => {
    if (saving || !canRaise) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { window: windowSel, action, date: localDateStr() }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'reclaim_shield', payload })
    if (!error) {
      setTodays((t) => [payload, ...t])
      setWindowSel(''); setAction('')
    }
    setSaving(false)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  return (
    <div style={S.wrap}>
      <p style={S.intro}>
        Not forever — just a window. One small promise you can actually keep is worth more right now than ten brave ones.
      </p>

      <p style={S.q}>For the…</p>
      <div style={S.chips}>
        {SHIELD_WINDOWS.map((w) => (
          <button key={w} onClick={() => setWindowSel(windowSel === w ? '' : w)} style={{ ...S.chip, ...(windowSel === w ? S.chipOn : {}) }}>{w}</button>
        ))}
      </div>

      <p style={S.q}>I will…</p>
      <div style={S.chips}>
        {SHIELD_ACTIONS.map((a) => (
          <button key={a} onClick={() => setAction(action === a ? '' : a)} style={{ ...S.chip, ...(action === a ? S.chipOn : {}) }}>{a}</button>
        ))}
      </div>

      <button style={{ ...S.saveBtn, opacity: canRaise ? 1 : 0.45 }} disabled={!canRaise || saving} onClick={raise}>
        {saving ? 'Raising…' : 'Raise the shield'}
      </button>

      {todays.length > 0 && (
        <div style={S.heldCard}>
          <p style={S.heldHead}>Held today</p>
          {todays.map((p, i) => (
            <p key={i} style={S.heldLine}>{p.action} — {p.window.toLowerCase()}</p>
          ))}
        </div>
      )}
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 12px' },
  q: { fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: 14.5, fontWeight: 500, margin: '14px 0 8px' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: { padding: '8px 12px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 12.5, cursor: 'pointer' },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },
  saveBtn: { width: '100%', marginTop: 16, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  heldCard: { marginTop: 16, background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '12px 14px' },
  heldHead: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11, color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 7px' },
  heldLine: { fontFamily: 'Georgia, serif', fontSize: 13, color: '#2A1F15', margin: '0 0 5px', lineHeight: 1.45 },
}