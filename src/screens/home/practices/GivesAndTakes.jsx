import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "What it gives, what it takes"  (A closer look)
// ===================================================================
// Three honest taps: how you feel before, what it promises, how it
// actually leaves you. The practice draws no conclusion — it just
// lets the user see promise and payback side by side.
//
// Data: free_stage_signals, stage 'notice',
// signal_type 'notice_roi' (same contract as the old home),
// payload { before, promise, after, date } — one row, updated in place.
// ===================================================================

const BEFORES  = ['Restless', 'Stressed', 'Bored', 'Low', 'Wired', 'Fine, honestly']
const PROMISES = ['Relief', 'Escape', 'A reward', 'Calm', 'Sleep', 'Fun']
const AFTERS   = ['Flat', 'Foggy', 'Guilty', 'About the same', 'Worse', 'Better, briefly']

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function GivesAndTakes({ stage = 'notice' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [before, setBefore] = useState('')
  const [promise, setPromise] = useState('')
  const [after, setAfter] = useState('')
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
        .eq('signal_type', 'notice_roi')
        .order('created_at', { ascending: false })
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row && row.payload) {
        setRowId(row.id)
        setBefore(row.payload.before || '')
        setPromise(row.payload.promise || '')
        setAfter(row.payload.after || '')
      } else {
        setEditing(true)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canSave = before && promise && after

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { before, promise, after, date: localDateStr() }
    if (rowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      if (!error) setEditing(false)
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'notice_roi', payload })
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
        <p style={S.intro}>Both columns, side by side. No verdict — that part stays yours.</p>
        <div style={S.ledger}>
          <div style={S.col}>
            <p style={S.colHead}>It promises</p>
            <p style={S.colVal}>{promise}</p>
            <p style={S.colSub}>when you feel {before.toLowerCase()}</p>
          </div>
          <div style={S.colDivider} />
          <div style={S.col}>
            <p style={S.colHead}>It leaves you</p>
            <p style={S.colVal}>{after}</p>
            <p style={S.colSub}>an hour later</p>
          </div>
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Weigh it again</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>Think of how it usually goes — not the best time, not the worst. The usual one.</p>
      <Row label="Right before it, you mostly feel…" options={BEFORES} value={before} onPick={setBefore} />
      <Row label="And it promises…" options={PROMISES} value={promise} onPick={setPromise} />
      <Row label="An hour after, it actually leaves you…" options={AFTERS} value={after} onPick={setAfter} />
      <button style={{ ...S.saveBtn, opacity: canSave ? 1 : 0.45 }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Save the ledger'}
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
  ledger: { display: 'flex', alignItems: 'stretch', background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '14px 6px' },
  col: { flex: 1, textAlign: 'center', padding: '0 8px' },
  colDivider: { width: 1, background: '#E8DFD0' },
  colHead: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#9C8C78', margin: '0 0 4px', textTransform: 'lowercase' },
  colVal: { fontFamily: 'Georgia, serif', fontSize: 16, color: '#2A1F15', margin: 0 },
  colSub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#9C8C78', margin: '4px 0 0' },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}