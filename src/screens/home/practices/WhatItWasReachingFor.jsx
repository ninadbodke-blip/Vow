import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "What it was reaching for"  (Getting back up — tool three)
// ===================================================================
// Under most slips there's a real need that picked a bad route. The
// user names the need without shame, then sketches one other way it
// could be met — even an imperfect one.
//
// Data: free_stage_signals, stage 'reclaim',
// signal_type 'reclaim_need' (same contract as the old home),
// payload { needs: [..], alternative, logged_at } — appended.
// ===================================================================

const NEEDS = [
  'Relief',
  'Rest',
  'Connection',
  'To feel something',
  'To feel nothing',
  'A reward',
  'An escape hatch',
]

export default function WhatItWasReachingFor({ stage = 'reclaim' }) {
  const [loading, setLoading] = useState(true)
  const [latest, setLatest] = useState(null)
  const [needs, setNeeds] = useState([])
  const [alt, setAlt] = useState('')
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
        .eq('signal_type', 'reclaim_need')
        .order('created_at', { ascending: false })
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row?.payload?.needs?.length) setLatest(row.payload)
      else setEditing(true)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const toggle = (n) => setNeeds((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]))
  const canSave = needs.length > 0

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { needs, alternative: alt.trim() || null, logged_at: new Date().toISOString() }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'reclaim_need', payload })
    if (!error) { setLatest(payload); setEditing(false); setNeeds([]); setAlt('') }
    setSaving(false)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  if (!editing && latest) {
    return (
      <div style={S.wrap}>
        <p style={S.intro}>The need was real. The route is what slipped — and routes can be redrawn.</p>
        <div style={S.savedCard}>
          <p style={S.needsLine}>It was reaching for {latest.needs.map((n) => n.toLowerCase()).join(', ')}.</p>
          {latest.alternative && <p style={S.altLine}>“{latest.alternative}”</p>}
          {latest.alternative && <p style={S.altTag}>another way to meet it</p>}
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Look at it again</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>No shame in this one — needs are not the problem. What was it actually reaching for?</p>

      <div style={S.chips}>
        {NEEDS.map((n) => (
          <button key={n} onClick={() => toggle(n)} style={{ ...S.chip, ...(needs.includes(n) ? S.chipOn : {}) }}>{n}</button>
        ))}
      </div>

      <p style={S.q}>One other way that need could be met — even imperfectly?</p>
      <textarea style={S.textarea} value={alt} onChange={(e) => setAlt(e.target.value)} rows={2} maxLength={160}
        placeholder="A call, a walk, an early night, asking for help…" />

      <button style={{ ...S.saveBtn, opacity: canSave ? 1 : 0.45 }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Name the need'}
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
  textarea: { width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: 13.5, fontStyle: 'italic', color: '#2A1F15', outline: 'none', resize: 'none', lineHeight: 1.5 },
  saveBtn: { width: '100%', marginTop: 16, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  savedCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '16px 15px', textAlign: 'center' },
  needsLine: { fontFamily: 'Georgia, serif', fontSize: 14, color: '#2A1F15', margin: 0, lineHeight: 1.5 },
  altLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14.5, color: '#2A1F15', margin: '10px 0 0' },
  altTag: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#854F0B', margin: '4px 0 0' },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}