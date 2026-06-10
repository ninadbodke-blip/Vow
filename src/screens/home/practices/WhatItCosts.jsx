import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "What it costs"  (Weighing it up)
// ===================================================================
// Two small numbers — money and hours in a typical day of it — and
// the practice does the only thing arithmetic is good for here:
// shows a year. No currency symbols, no lecture. Just the size of it.
//
// Data: free_stage_signals, stage 'reflect',
// signal_type 'reflect_cost' (same contract as the old home),
// payload { daily_cost, daily_hours, max_horizon } — one row,
// updated in place. max_horizon is preserved for old rows.
// ===================================================================

const HOUR_CHIPS = [0.5, 1, 2, 3, 4, 5]

const fmt = (n) => Math.round(n).toLocaleString()

export default function WhatItCosts({ stage = 'reflect' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [cost, setCost] = useState('')
  const [hours, setHours] = useState(null)
  const [maxHorizon, setMaxHorizon] = useState(null)
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
        .eq('signal_type', 'reflect_cost')
        .order('created_at', { ascending: false })
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row && row.payload) {
        setRowId(row.id)
        if (row.payload.daily_cost != null) setCost(String(row.payload.daily_cost))
        if (row.payload.daily_hours != null) setHours(Number(row.payload.daily_hours))
        if (row.payload.max_horizon != null) setMaxHorizon(row.payload.max_horizon)
      } else {
        setEditing(true)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const c = Number(cost) || 0
  const h = hours || 0
  const hasInput = c > 0 || h > 0
  const yearMoney = c * 365
  const yearHours = h * 365
  const wakingDays = Math.round(yearHours / 16)

  const handleSave = async () => {
    if (saving || !hasInput) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { daily_cost: c || null, daily_hours: h || null, max_horizon: maxHorizon != null ? maxHorizon : 0 }
    if (rowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      if (!error) setEditing(false)
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'reflect_cost', payload })
        .select('id').single()
      if (!error && data) { setRowId(data.id); setEditing(false) }
    }
    setSaving(false)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  if (!editing && hasInput) {
    return (
      <div style={S.wrap}>
        <p style={S.intro}>A typical day, carried across a year. The numbers are yours; so is what they mean.</p>
        <div style={S.yearCard}>
          {c > 0 && (
            <div style={S.yearRow}>
              <span style={S.yearLabel}>money</span>
              <span style={S.yearVal}>{fmt(yearMoney)}</span>
              <span style={S.yearSub}>a year</span>
            </div>
          )}
          {h > 0 && (
            <div style={S.yearRow}>
              <span style={S.yearLabel}>time</span>
              <span style={S.yearVal}>{fmt(yearHours)} hours</span>
              <span style={S.yearSub}>about {fmt(wakingDays)} waking days</span>
            </div>
          )}
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Change the numbers</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>Think of an ordinary day of it — not a heavy one. Rough numbers are fine.</p>

      <p style={S.q}>About how much money?</p>
      <input
        style={S.input}
        inputMode="numeric"
        value={cost}
        onChange={(e) => setCost(e.target.value.replace(/[^0-9.]/g, ''))}
        placeholder="0"
        maxLength={8}
      />

      <p style={S.q}>And about how much time?</p>
      <div style={S.chips}>
        {HOUR_CHIPS.map((hc) => (
          <button key={hc} onClick={() => setHours(hours === hc ? null : hc)}
            style={{ ...S.chip, ...(hours === hc ? S.chipOn : {}) }}>
            {hc === 0.5 ? 'Half an hour' : `${hc} hour${hc > 1 ? 's' : ''}`}
          </button>
        ))}
      </div>

      {hasInput && (
        <p style={S.preview}>
          Across a year: {c > 0 ? `${fmt(yearMoney)} in money` : ''}{c > 0 && h > 0 ? ' · ' : ''}
          {h > 0 ? `${fmt(yearHours)} hours — about ${fmt(wakingDays)} waking days` : ''}
        </p>
      )}

      <button style={{ ...S.saveBtn, opacity: hasInput ? 1 : 0.45 }} disabled={!hasInput || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Add it up'}
      </button>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 12px' },
  q: { fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: 14.5, fontWeight: 500, margin: '14px 0 8px' },
  input: { width: '100%', boxSizing: 'border-box', padding: '12px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: 16, color: '#2A1F15', outline: 'none' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: { padding: '8px 12px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 12.5, cursor: 'pointer' },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },
  preview: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#854F0B', margin: '14px 0 0', lineHeight: 1.5 },
  saveBtn: { width: '100%', marginTop: 16, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  yearCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 10 },
  yearRow: { display: 'flex', alignItems: 'baseline', gap: 9 },
  yearLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#9C8C78', width: 48 },
  yearVal: { fontFamily: 'Georgia, serif', fontSize: 17, color: '#2A1F15' },
  yearSub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#854F0B' },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}