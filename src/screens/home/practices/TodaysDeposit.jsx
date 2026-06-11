import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// DAILY: "Today's deposit"  (Staying steady)
// ===================================================================
// The hours the habit used to take are capital now. Each day, one
// deposit: which account got time today, and roughly how much. The
// week accumulates — the same ledger the old home kept.
//
// Data: free_stage_signals, stage 'build',
// signal_type 'build_allocation' (same contract as the old home),
// payload { physical, relational, craft, rest, idle, week_of } —
// one row per week; daily deposits add into it.
// ===================================================================

const BUCKETS = [
  { key: 'physical',   label: 'Physical' },
  { key: 'relational', label: 'Relational' },
  { key: 'craft',      label: 'Craft' },
  { key: 'rest',       label: 'Rest' },
]
const MINUTES = [15, 30, 45, 60, 90]

const mondayISO = () => {
  const d = new Date()
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`)

export default function TodaysDeposit({ stage = 'build' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [week, setWeek] = useState({ physical: 0, relational: 0, craft: 0, rest: 0, idle: 0 })
  const [bucket, setBucket] = useState('')
  const [mins, setMins] = useState(null)
  const [justBanked, setJustBanked] = useState(false)
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
        .eq('signal_type', 'build_allocation')
        .eq('payload->>week_of', mondayISO())
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row?.payload) {
        setRowId(row.id)
        setWeek({
          physical: Number(row.payload.physical) || 0,
          relational: Number(row.payload.relational) || 0,
          craft: Number(row.payload.craft) || 0,
          rest: Number(row.payload.rest) || 0,
          idle: Number(row.payload.idle) || 0,
        })
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canBank = bucket && mins

  const bank = async () => {
    if (saving || !canBank) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const next = { ...week, [bucket]: (week[bucket] || 0) + mins }
    const payload = { ...next, week_of: mondayISO() }
    if (rowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      if (!error) { setWeek(next); setJustBanked(true) }
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'build_allocation', payload })
        .select('id').single()
      if (!error && data) { setRowId(data.id); setWeek(next); setJustBanked(true) }
    }
    setBucket(''); setMins(null)
    setSaving(false)
    setTimeout(() => setJustBanked(false), 2400)
  }

  const weekTotal = BUCKETS.reduce((s, b) => s + (week[b.key] || 0), 0)

  if (loading) return <p style={S.muted}>One moment…</p>

  return (
    <div style={S.wrap}>
      <p style={S.intro}>The hours it used to take belong to you now. One deposit a day keeps them claimed.</p>

      <p style={S.q}>Where did time go today?</p>
      <div style={S.chips}>
        {BUCKETS.map((b) => (
          <button key={b.key} onClick={() => setBucket(bucket === b.key ? '' : b.key)} style={{ ...S.chip, ...(bucket === b.key ? S.chipOn : {}) }}>{b.label}</button>
        ))}
      </div>

      <p style={S.q}>Roughly how much?</p>
      <div style={S.chips}>
        {MINUTES.map((m) => (
          <button key={m} onClick={() => setMins(mins === m ? null : m)} style={{ ...S.chip, ...(mins === m ? S.chipOn : {}) }}>{fmtMin(m)}</button>
        ))}
      </div>

      <button style={{ ...S.saveBtn, opacity: canBank ? 1 : 0.45 }} disabled={!canBank || saving} onClick={bank}>
        {saving ? 'Banking…' : justBanked ? 'Banked ✓' : 'Bank the deposit'}
      </button>

      {weekTotal > 0 && (
        <div style={S.weekCard}>
          <p style={S.weekHead}>This week’s ledger</p>
          {BUCKETS.filter((b) => week[b.key] > 0).map((b) => (
            <div key={b.key} style={S.weekRow}>
              <span style={S.weekLabel}>{b.label.toLowerCase()}</span>
              <div style={S.weekTrack}>
                <div style={{ ...S.weekFill, width: `${Math.min(100, (week[b.key] / Math.max(weekTotal, 1)) * 100)}%` }} />
              </div>
              <span style={S.weekVal}>{fmtMin(week[b.key])}</span>
            </div>
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
  q: { fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: 14.5, fontWeight: 500, margin: '14px 0 8px' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: { padding: '8px 12px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 12.5, cursor: 'pointer' },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },
  saveBtn: { width: '100%', marginTop: 16, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  weekCard: { marginTop: 16, background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '12px 14px' },
  weekHead: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11, color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 8px' },
  weekRow: { display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 },
  weekLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#6B5C4A', width: 66, flexShrink: 0 },
  weekTrack: { flex: 1, height: 7, borderRadius: 999, background: '#EFE9DA', border: '0.5px solid #E2D7C3', position: 'relative', overflow: 'hidden' },
  weekFill: { position: 'absolute', left: 0, top: 0, bottom: 0, background: 'linear-gradient(90deg, #D9C9A4, #C9A85C)' },
  weekVal: { fontFamily: 'Georgia, serif', fontSize: 12, color: '#2A1F15', width: 48, textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
}