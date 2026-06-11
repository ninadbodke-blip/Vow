import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "The week's proof"  (Staying steady — tool three)
// ===================================================================
// Steadiness gets invisible. This tool enters one piece of evidence
// at a time — a thing you actually did — so the week leaves a record
// you can hold against any doubting voice.
//
// Data: free_stage_signals, stage 'build',
// signal_type 'build_evidence' (same contract as the old home),
// payload { kind, proof, instead, week_of, forged_at } — appended.
// ===================================================================

const KINDS = [
  { key: 'said_no',  label: 'Said no' },
  { key: 'sat_urge', label: 'Sat through an urge' },
  { key: 'people',   label: 'Chose people' },
  { key: 'built',    label: 'Built something' },
  { key: 'rested',   label: 'Rested on purpose' },
]

const mondayISO = () => {
  const d = new Date()
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function WeeksProof({ stage = 'build' }) {
  const [loading, setLoading] = useState(true)
  const [recent, setRecent] = useState([])
  const [kind, setKind] = useState('')
  const [proof, setProof] = useState('')
  const [instead, setInstead] = useState('')
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
        .eq('signal_type', 'build_evidence')
        .order('created_at', { ascending: false })
        .limit(3)
      if (cancelled) return
      setRecent((data || []).map((r) => r.payload).filter((p) => p?.proof))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canSave = proof.trim().length > 0

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { kind: kind || null, proof: proof.trim(), instead: instead.trim() || null, week_of: mondayISO(), forged_at: new Date().toISOString() }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'build_evidence', payload })
    if (!error) {
      setRecent((r) => [payload, ...r].slice(0, 3))
      setKind(''); setProof(''); setInstead('')
    }
    setSaving(false)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  return (
    <div style={S.wrap}>
      <p style={S.intro}>One thing you actually did — entered into evidence. Doubt argues badly against a written record.</p>

      <div style={S.chips}>
        {KINDS.map((k) => (
          <button key={k.key} onClick={() => setKind(kind === k.key ? '' : k.key)} style={{ ...S.chip, ...(kind === k.key ? S.chipOn : {}) }}>{k.label}</button>
        ))}
      </div>

      <input style={S.input} value={proof} onChange={(e) => setProof(e.target.value)} maxLength={120}
        placeholder="What you did, plainly" />
      <input style={{ ...S.input, marginTop: 8 }} value={instead} onChange={(e) => setInstead(e.target.value)} maxLength={120}
        placeholder="Instead of… (optional)" />

      <button style={{ ...S.saveBtn, opacity: canSave ? 1 : 0.45 }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Enter it into evidence'}
      </button>

      {recent.length > 0 && (
        <div style={S.recent}>
          <p style={S.recentHead}>On record</p>
          {recent.map((p, i) => (
            <p key={i} style={S.recentLine}>
              {p.proof}{p.instead ? <span style={S.recentInstead}> — instead of {p.instead.toLowerCase()}</span> : null}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 12px' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 11 },
  chip: { padding: '8px 12px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 12.5, cursor: 'pointer' },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },
  input: { width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: 13.5, color: '#2A1F15', outline: 'none' },
  saveBtn: { width: '100%', marginTop: 14, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  recent: { marginTop: 16, background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '12px 14px' },
  recentHead: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11, color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 7px' },
  recentLine: { fontFamily: 'Georgia, serif', fontSize: 13, color: '#2A1F15', margin: '0 0 5px', lineHeight: 1.45 },
  recentInstead: { color: '#9C8C78', fontStyle: 'italic' },
}