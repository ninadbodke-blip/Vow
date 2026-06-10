import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "The blind spot"  (Staying steady)
// ===================================================================
// The classic month-two pattern: confidence rises, distance shrinks.
// Two honest sliders — how solid it feels, and how close you actually
// stood to the old situations this week — and one quiet read of the
// quadrant they land in. Awareness, not alarm.
//
// Data: free_stage_signals, stage 'build',
// signal_type 'build_drift', payload { confidence, exposure, date }.
// One row per day, updated in place.
// ===================================================================

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const readFor = (conf, exp) => {
  if (conf > 60 && exp > 60) return 'Feeling solid while standing close — that’s the classic blind spot. Nothing to fix tonight; just keep your eyes open and your exits easy.'
  if (conf > 60 && exp <= 60) return 'Solid, and keeping clear of it. Quiet weeks like this count double.'
  if (conf <= 60 && exp > 60) return 'Close to it, and feeling it. Be kind to your evenings this week — fewer decisions, earlier nights.'
  return 'Steadying from a distance. That’s exactly how it’s done.'
}

function Slider({ label, leftLabel, rightLabel, value, onChange }) {
  return (
    <>
      <p style={S.q}>{label}</p>
      <input type="range" min="0" max="100" value={value} onChange={(e) => onChange(Number(e.target.value))} style={S.range} />
      <div style={S.endLabels}>
        <span style={S.endLabel}>{leftLabel}</span>
        <span style={S.endLabel}>{rightLabel}</span>
      </div>
    </>
  )
}

export default function TheBlindSpot({ stage = 'build' }) {
  const [loading, setLoading] = useState(true)
  const [todayRowId, setTodayRowId] = useState(null)
  const [confidence, setConfidence] = useState(50)
  const [exposure, setExposure] = useState(30)
  const [editing, setEditing] = useState(true)
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
        .eq('signal_type', 'build_drift')
        .order('created_at', { ascending: false })
        .limit(3)
      if (cancelled) return
      const today = localDateStr()
      const todays = (data || []).find((r) => r.payload?.date === today)
      if (todays) {
        setTodayRowId(todays.id)
        setConfidence(Number(todays.payload.confidence) ?? 50)
        setExposure(Number(todays.payload.exposure) ?? 30)
        setEditing(false)
      }
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
    const payload = { confidence, exposure, date: localDateStr() }
    if (todayRowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', todayRowId)
      if (!error) setEditing(false)
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'build_drift', payload })
        .select('id').single()
      if (!error && data) { setTodayRowId(data.id); setEditing(false) }
    }
    setSaving(false)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  if (!editing) {
    return (
      <div style={S.wrap}>
        <div style={S.savedCard}>
          <MiniBar label="feels solid" value={confidence} />
          <MiniBar label="stood close" value={exposure} />
          <p style={S.readLine}>{readFor(confidence, exposure)}</p>
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Check again</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>Two honest answers, this week only. Feeling safe and being safe aren’t the same thing — this is where you check the gap.</p>
      <Slider
        label="How solid does it feel right now?"
        leftLabel="Shaky" rightLabel="Solid"
        value={confidence} onChange={setConfidence}
      />
      <Slider
        label="How close did you stand to the old situations this week?"
        leftLabel="Kept my distance" rightLabel="Right in them"
        value={exposure} onChange={setExposure}
      />
      <button style={S.saveBtn} disabled={saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'See where that lands'}
      </button>
    </div>
  )
}

function MiniBar({ label, value }) {
  return (
    <div style={S.miniRow}>
      <span style={S.miniLabel}>{label}</span>
      <div style={S.miniTrack}>
        <div style={{ ...S.miniFill, width: `${value}%` }} />
      </div>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 12px' },
  q: { fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: 14.5, fontWeight: 500, margin: '16px 0 6px' },
  range: { width: '100%', accentColor: '#854F0B' },
  endLabels: { display: 'flex', justifyContent: 'space-between', marginTop: 2 },
  endLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#9C8C78' },
  saveBtn: { width: '100%', marginTop: 20, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  savedCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '15px' },
  miniRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 },
  miniLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#9C8C78', width: 78, flexShrink: 0 },
  miniTrack: { flex: 1, height: 8, borderRadius: 999, background: '#EFE9DA', border: '0.5px solid #E2D7C3', position: 'relative', overflow: 'hidden' },
  miniFill: { position: 'absolute', left: 0, top: 0, bottom: 0, background: 'linear-gradient(90deg, #D9C9A4, #C9A85C)' },
  readLine: { fontFamily: 'Georgia, serif', fontSize: 13.5, color: '#2A1F15', margin: '8px 0 0', lineHeight: 1.55, textAlign: 'center' },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}