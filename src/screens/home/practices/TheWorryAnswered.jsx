import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// DAILY: "The worry, answered"  (Getting ready)
// ===================================================================
// The countdown gets easier when the biggest worry has a plan. Each
// day before day one: today's likeliest threat, the first sign it's
// arriving, and the counter-move — chosen now, while calm.
//
// Data: free_stage_signals, stage 'commit',
// signal_type 'commit_fear' (same contract — same option strings —
// as the old home), payload { threat, sign, mitigation }. One row,
// updated in place; revisiting daily is the practice.
// ===================================================================

const FEAR_THREATS = ['Boredom', 'Physical pain', 'Social pressure', 'Emotional crash', 'A celebration', 'Loneliness', 'A fight or stress', 'The old place or routine', 'A sudden craving', "Can't sleep"]
const FEAR_SIGNS = ['Restlessness', 'A "just once" thought', 'Reaching for my phone', 'Bargaining with myself', 'Pulling away from people', 'A spike of stress']
const FEAR_COUNTERS = ['Call my anchor', 'Ride the 20-min wave', 'Leave the room', 'Go to sleep', 'Move my body', 'Text someone now', 'Re-read my vow', 'Eat and drink water']

export default function TheWorryAnswered({ stage = 'commit' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [threat, setThreat] = useState('')
  const [sign, setSign] = useState('')
  const [mitigation, setMitigation] = useState('')
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
        .eq('signal_type', 'commit_fear')
        .order('created_at', { ascending: false })
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row?.payload?.threat) {
        setRowId(row.id)
        setThreat(row.payload.threat || '')
        setSign(row.payload.sign || '')
        setMitigation(row.payload.mitigation || '')
      } else setEditing(true)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canSave = threat && sign && mitigation

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { threat, sign, mitigation }
    if (rowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      if (!error) setEditing(false)
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'commit_fear', payload })
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
        <p style={S.intro}>Answered — for now. Worries rotate; come back tomorrow and answer the next one.</p>
        <div style={S.savedCard}>
          <p style={S.threatLine}>{threat}</p>
          <p style={S.signLine}>first sign: {sign.toLowerCase()}</p>
          <div style={S.arrow}>↓</div>
          <p style={S.counterLine}>{mitigation}</p>
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Answer a different worry</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>Pick the worry most likely to actually show up — then beat it to the plan.</p>
      <Row label="The likeliest threat" options={FEAR_THREATS} val={threat} onPick={setThreat} />
      <Row label="How it usually announces itself" options={FEAR_SIGNS} val={sign} onPick={setSign} />
      <Row label="Your counter-move, decided now" options={FEAR_COUNTERS} val={mitigation} onPick={setMitigation} />
      <button style={{ ...S.saveBtn, opacity: canSave ? 1 : 0.45 }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Answer it'}
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
  threatLine: { fontFamily: 'Georgia, serif', fontSize: 15, color: '#2A1F15', margin: 0 },
  signLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#9C8C78', margin: '4px 0 0' },
  arrow: { fontFamily: 'Georgia, serif', color: '#C9A85C', fontSize: 14, margin: '7px 0' },
  counterLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14.5, color: '#854F0B', margin: 0 },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}