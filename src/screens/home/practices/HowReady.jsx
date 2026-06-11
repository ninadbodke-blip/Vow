import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "How ready, honestly"  (Getting ready — tool three)
// ===================================================================
// One slider, one obstacle. Readiness is a number that moves — each
// check appends, so the user can watch their own number climb (or
// dip) across the days before day one.
//
// Data: free_stage_signals, stage 'commit',
// signal_type 'commit_confidence' (same contract as the old home),
// payload { score, blocker } — appended each time.
// ===================================================================

const BLOCKERS = [
  'Fear of failing again',
  'The first evening',
  'Telling people',
  'Losing the relief',
  'The habit hours',
  'Nothing — just the date',
]

export default function HowReady({ stage = 'commit' }) {
  const [loading, setLoading] = useState(true)
  const [latest, setLatest] = useState(null)
  const [score, setScore] = useState(60)
  const [blocker, setBlocker] = useState('')
  const [editing, setEditing] = useState(false)
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
        .eq('signal_type', 'commit_confidence')
        .order('created_at', { ascending: false })
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row?.payload?.score != null) {
        setLatest(row.payload)
        setScore(Number(row.payload.score))
        setBlocker(row.payload.blocker || '')
      } else setEditing(true)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { score, blocker: blocker || null }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'commit_confidence', payload })
    if (!error) { setLatest(payload); setEditing(false) }
    setSaving(false)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  if (!editing && latest) {
    return (
      <div style={S.wrap}>
        <p style={S.intro}>A number can move — that’s the point of checking it. Come back whenever it shifts.</p>
        <div style={S.savedCard}>
          <div style={S.barTrack}><div style={{ ...S.barFill, width: `${latest.score}%` }} /></div>
          <p style={S.scoreLine}>{latest.score} out of 100</p>
          {latest.blocker && <p style={S.blockLine}>in the way: {latest.blocker.toLowerCase()}</p>}
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Check it again</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>Not the brave answer — the honest one. Where does it actually sit today?</p>

      <input type="range" min="0" max="100" value={score} onChange={(e) => setScore(Number(e.target.value))} style={S.range} />
      <div style={S.endLabels}>
        <span style={S.endLabel}>Not yet</span>
        <span style={S.scoreNow}>{score}</span>
        <span style={S.endLabel}>Ready</span>
      </div>

      <p style={S.q}>And the one thing most in the way?</p>
      <div style={S.chips}>
        {BLOCKERS.map((b) => (
          <button key={b} onClick={() => setBlocker(blocker === b ? '' : b)} style={{ ...S.chip, ...(blocker === b ? S.chipOn : {}) }}>{b}</button>
        ))}
      </div>

      <button style={S.saveBtn} disabled={saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Mark the number'}
      </button>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 14px' },
  q: { fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: 14.5, fontWeight: 500, margin: '16px 0 8px' },
  range: { width: '100%', accentColor: '#854F0B' },
  endLabels: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 },
  endLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#9C8C78' },
  scoreNow: { fontFamily: 'Georgia, serif', fontSize: 16, color: '#854F0B', fontVariantNumeric: 'tabular-nums' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: { padding: '8px 12px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 12.5, cursor: 'pointer' },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },
  saveBtn: { width: '100%', marginTop: 18, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  savedCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '16px 15px' },
  barTrack: { height: 9, borderRadius: 999, background: '#EFE9DA', border: '0.5px solid #E2D7C3', position: 'relative', overflow: 'hidden' },
  barFill: { position: 'absolute', left: 0, top: 0, bottom: 0, background: 'linear-gradient(90deg, #D9C9A4, #C9A85C)' },
  scoreLine: { fontFamily: 'Georgia, serif', fontSize: 15, color: '#2A1F15', margin: '10px 0 0', textAlign: 'center' },
  blockLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#854F0B', margin: '5px 0 0', textAlign: 'center' },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}