import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "Renew your vow"  (Early days — tool three)
// ===================================================================
// The vow was written in Getting ready; here it is said again. One
// tap a day, the same words — repetition is the whole mechanism.
// If no vow exists yet, the first line can be written right here.
//
// Data: free_stage_signals, signal_type 'commit_vow' (the same signal
// the vow has always lived in), payload { text } for the original and
// { text, renewed: true, date } for each renewal — appended.
// ===================================================================

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function RenewYourVow({ stage = 'endure' }) {
  const [loading, setLoading] = useState(true)
  const [vowText, setVowText] = useState('')
  const [draft, setDraft] = useState('')
  const [renewals, setRenewals] = useState(0)
  const [renewedToday, setRenewedToday] = useState(false)
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
        .eq('signal_type', 'commit_vow')
        .order('created_at', { ascending: false })
        .limit(60)
      if (cancelled) return
      const rows = data || []
      const latest = rows.find((r) => r.payload?.text)
      if (latest) setVowText(latest.payload.text)
      setRenewals(rows.filter((r) => r.payload?.renewed).length)
      setRenewedToday(rows.some((r) => r.payload?.renewed && r.payload?.date === localDateStr()))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const renew = async () => {
    if (saving || !vowText || renewedToday) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'commit_vow', payload: { text: vowText, renewed: true, date: localDateStr() } })
    if (!error) { setRenewals((n) => n + 1); setRenewedToday(true) }
    setSaving(false)
  }

  const writeFirst = async () => {
    if (saving || !draft.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'commit_vow', payload: { text: draft.trim() } })
    if (!error) { setVowText(draft.trim()); setDraft('') }
    setSaving(false)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  if (!vowText) {
    return (
      <div style={S.wrap}>
        <p style={S.intro}>There’s no vow on record yet. One honest line, in your own voice — the reason that is actually yours.</p>
        <textarea style={S.textarea} value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} maxLength={240}
          placeholder="Say it the way you’d say it out loud…" />
        <button style={{ ...S.saveBtn, opacity: draft.trim() ? 1 : 0.45 }} disabled={!draft.trim() || saving} onClick={writeFirst}>
          {saving ? 'Saving…' : 'Set it down'}
        </button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>The same words, said again. That’s not repetition — that’s how a vow stays alive.</p>
      <div style={S.vowCard}>
        <p style={S.vowText}>“{vowText}”</p>
      </div>
      {renewals > 0 && (
        <p style={S.tally}>Renewed {renewals} {renewals === 1 ? 'time' : 'times'} so far.</p>
      )}
      <button style={{ ...S.saveBtn, opacity: renewedToday ? 0.5 : 1 }} disabled={renewedToday || saving} onClick={renew}>
        {renewedToday ? 'Renewed today ✓' : saving ? 'One moment…' : 'Renew it today'}
      </button>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 12px' },
  textarea: { width: '100%', boxSizing: 'border-box', padding: '12px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: 14.5, fontStyle: 'italic', color: '#2A1F15', outline: 'none', resize: 'none', lineHeight: 1.5 },
  vowCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '18px 16px' },
  vowText: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15.5, color: '#2A1F15', lineHeight: 1.55, margin: 0, textAlign: 'center' },
  tally: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#854F0B', margin: '10px 0 0', textAlign: 'center' },
  saveBtn: { width: '100%', marginTop: 14, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
}