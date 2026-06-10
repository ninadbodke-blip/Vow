import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "The kinder voice"  (Getting back up)
// ===================================================================
// The harsh voice after a slip is loud and certain. This practice
// doesn't argue with it — it borrows a different one: the user picks
// what the voice is saying, then writes what they'd say to a friend
// they love in the exact same situation. The gap between the two
// sentences is the practice.
//
// Data: free_stage_signals, stage 'reclaim',
// signal_type 'reclaim_kinder', payload { harsh, kinder, date }.
// Appends — each rewrite is kept; the latest is shown.
// ===================================================================

const HARSH = [
  'I ruined everything',
  'I am back to zero',
  'I always do this',
  'What is even the point',
  'I am weak',
]

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function KinderVoice({ stage = 'reclaim' }) {
  const [loading, setLoading] = useState(true)
  const [latest, setLatest] = useState(null)
  const [harsh, setHarsh] = useState('')
  const [ownHarsh, setOwnHarsh] = useState('')
  const [kinder, setKinder] = useState('')
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
        .eq('signal_type', 'reclaim_kinder')
        .order('created_at', { ascending: false })
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row?.payload?.kinder) setLatest(row.payload)
      else setEditing(true)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const harshText = harsh === 'own' ? ownHarsh.trim() : harsh
  const canSave = !!harshText && kinder.trim().length > 0

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { harsh: harshText, kinder: kinder.trim(), date: localDateStr() }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'reclaim_kinder', payload })
    if (!error) {
      setLatest(payload)
      setEditing(false)
      setHarsh(''); setOwnHarsh(''); setKinder('')
    }
    setSaving(false)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  if (!editing && latest) {
    return (
      <div style={S.wrap}>
        <p style={S.intro}>The voice said one thing. You said another. Keep the second one where you can see it.</p>
        <div style={S.pairCard}>
          <p style={S.harshLine}>“{latest.harsh}”</p>
          <div style={S.arrow}>↓</div>
          <p style={S.kinderLine}>“{latest.kinder}”</p>
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Answer it again</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>You do not have to believe the kinder voice yet. You only have to write it down.</p>

      <p style={S.q}>What is the loud voice saying?</p>
      <div style={S.chips}>
        {HARSH.map((h) => (
          <button key={h} onClick={() => setHarsh(h)} style={{ ...S.chip, ...(harsh === h ? S.chipOn : {}) }}>{h}</button>
        ))}
        <button onClick={() => setHarsh('own')} style={{ ...S.chip, ...(harsh === 'own' ? S.chipOn : {}) }}>Something else…</button>
      </div>
      {harsh === 'own' && (
        <input
          style={S.input}
          value={ownHarsh}
          onChange={(e) => setOwnHarsh(e.target.value)}
          placeholder="What it keeps saying, word for word"
          maxLength={80}
        />
      )}

      <p style={S.q}>Now — a friend you love slipped last night. Same situation, same history. What do you say to them?</p>
      <textarea
        style={S.textarea}
        value={kinder}
        onChange={(e) => setKinder(e.target.value)}
        placeholder="Say it to them. Then notice it was also for you…"
        rows={3}
        maxLength={300}
      />

      <button style={{ ...S.saveBtn, opacity: canSave ? 1 : 0.45 }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Keep the kinder line'}
      </button>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 12px' },
  q: { fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: 14.5, fontWeight: 500, margin: '14px 0 8px', lineHeight: 1.45 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: { padding: '8px 12px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 12.5, cursor: 'pointer' },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },
  input: { width: '100%', boxSizing: 'border-box', marginTop: 9, padding: '11px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: 13.5, color: '#2A1F15', outline: 'none' },
  textarea: { width: '100%', boxSizing: 'border-box', padding: '12px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: 14, fontStyle: 'italic', color: '#2A1F15', outline: 'none', resize: 'none', lineHeight: 1.55 },
  saveBtn: { width: '100%', marginTop: 16, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  pairCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '16px 15px', textAlign: 'center' },
  harshLine: { fontFamily: 'Georgia, serif', fontSize: 12.5, color: '#9C8C78', margin: 0, textDecoration: 'line-through', textDecorationColor: 'rgba(156,140,120,0.45)' },
  arrow: { fontFamily: 'Georgia, serif', color: '#C9A85C', fontSize: 14, margin: '7px 0' },
  kinderLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15, color: '#2A1F15', margin: 0, lineHeight: 1.55 },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}