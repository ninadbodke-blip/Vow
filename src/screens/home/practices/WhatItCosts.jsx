// ===================================================================
// TOOL: "What it costs"  (Weighing it up)
// ===================================================================
// The one-time arithmetic is now a running meter. Two small numbers
// — money and hours in an ordinary day of it — and from the first
// measurement onward the meter simply runs, live, to the second.
// No currency symbols, no lecture. The size of it, moving.
//
// Data: free_stage_signals, stage 'reflect', signal_type
// 'reflect_cost' (unchanged), payload { daily_cost, daily_hours,
// max_horizon, first_measured } — one row, updated in place;
// first_measured is additive and preserved across edits (older rows
// fall back to the row's created_at).
// ===================================================================
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../supabaseClient'
import { getUser, ScienceFooter, K, P } from './practiceKit'

const HOUR_CHIPS = [0.5, 1, 2, 3, 4, 5]
const fmt = (n) => Math.round(n).toLocaleString()
const fmt1 = (n) => (Math.round(n * 10) / 10).toLocaleString()

function MeterCard({ cost, hours, since }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const days = Math.max(0, (now - since) / 86400000)
  const runMoney = cost * days
  const runHours = hours * days
  const sinceLabel = new Date(since).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })
  return (
    <div style={M.card}>
      <p style={M.eyebrow}>The meter, since you first measured — {sinceLabel}</p>
      {cost > 0 && (
        <p style={M.big}>{fmt(runMoney)}<span style={M.unit}> in money</span></p>
      )}
      {hours > 0 && (
        <p style={{ ...M.big, ...(cost > 0 ? { fontSize: 21, opacity: 0.92 } : {}) }}>
          {fmt1(runHours)}<span style={M.unit}> hours</span>
        </p>
      )}
      <p style={M.tick}>it moves while you watch</p>
    </div>
  )
}

export default function WhatItCosts({ stage = 'reflect' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [cost, setCost] = useState('')
  const [hours, setHours] = useState(null)
  const [maxHorizon, setMaxHorizon] = useState(null)
  const [firstMeasured, setFirstMeasured] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const firstRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const user = await getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('id, payload, created_at')
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
        const first = row.payload.first_measured || row.created_at
        firstRef.current = first
        setFirstMeasured(first)
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
    const user = await getUser()
    if (!user) { setSaving(false); return }
    const first = firstRef.current || new Date().toISOString()
    firstRef.current = first
    const payload = {
      daily_cost: c || null, daily_hours: h || null,
      max_horizon: maxHorizon != null ? maxHorizon : 0,
      first_measured: first,
    }
    if (rowId) {
      await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
    } else {
      const { data } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'reflect_cost', payload })
        .select('id').single()
      if (data) setRowId(data.id)
    }
    setFirstMeasured(first)
    setEditing(false)
    setSaving(false)
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  if (!editing && hasInput && firstMeasured) {
    const sinceTs = new Date(firstMeasured).getTime()
    return (
      <div style={K.wrap}>
        <p style={K.intro}>
          An ordinary day of it, carried forward. The meter was always running — the only change is that now it's visible.
        </p>
        <MeterCard cost={c} hours={h} since={sinceTs} />
        <div style={M.yearRow}>
          {c > 0 && <span style={M.yearItem}><b style={M.yearNum}>{fmt(yearMoney)}</b> a year</span>}
          {h > 0 && <span style={M.yearItem}><b style={M.yearNum}>{fmt(yearHours)}</b> hours a year — about {fmt(wakingDays)} waking days</span>}
        </div>
        <button style={K.editLink} onClick={() => setEditing(true)}>Change the numbers</button>
        <ScienceFooter text="Small daily amounts are designed to slip past the brain's accounting — behavioral economists call it denomination neglect. Aggregating them into one visible, moving total is the standard correction: the cost was never small, it was only ever divided." />
      </div>
    )
  }

  return (
    <div style={K.wrap}>
      <p style={K.intro}>Think of an ordinary day of it — not a heavy one. Rough numbers are fine; the meter does the rest.</p>
      <p style={K.q}>About how much money?</p>
      <input
        style={M.input}
        inputMode="numeric"
        value={cost}
        onChange={(e) => setCost(e.target.value.replace(/[^0-9.]/g, ''))}
        placeholder="0"
        maxLength={8}
      />
      <p style={K.q}>And about how much time?</p>
      <div style={K.chips}>
        {HOUR_CHIPS.map((hc) => (
          <button key={hc} onClick={() => setHours(hours === hc ? null : hc)}
            style={{ ...K.chip, ...(hours === hc ? K.chipOn : {}) }}>
            {hc === 0.5 ? 'Half an hour' : `${hc} hour${hc > 1 ? 's' : ''}`}
          </button>
        ))}
      </div>
      {hasInput && (
        <p style={M.preview}>
          Across a year: {c > 0 ? `${fmt(yearMoney)} in money` : ''}{c > 0 && h > 0 ? ' · ' : ''}
          {h > 0 ? `${fmt(yearHours)} hours — about ${fmt(wakingDays)} waking days` : ''}
        </p>
      )}
      <button style={{ ...K.saveBtn, ...(!hasInput ? K.saveBtnDim : {}) }} disabled={!hasInput || saving} onClick={handleSave}>
        {saving ? 'One moment…' : 'Start the meter'}
      </button>
      <ScienceFooter text="Small daily amounts are designed to slip past the brain's accounting — behavioral economists call it denomination neglect. Aggregating them into one visible, moving total is the standard correction: the cost was never small, it was only ever divided." />
    </div>
  )
}

const M = {
  card: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    borderRadius: 16, padding: '18px 18px 14px', textAlign: 'center',
    boxShadow: '0 8px 20px -10px rgba(40,25,10,0.45)', margin: '4px 0 10px',
  },
  eyebrow: { fontSize: 9.5, color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, margin: '0 0 10px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  big: { fontFamily: 'Georgia, serif', fontSize: 30, color: '#F6E8C4', margin: '0 0 2px', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 },
  unit: { fontSize: 12.5, color: '#CBBA98', fontStyle: 'italic' },
  tick: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10, color: '#9C8C78', margin: '8px 0 0' },
  yearRow: { display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'center', margin: '2px 0 0' },
  yearItem: { fontFamily: 'Georgia, serif', fontSize: 12.5, color: '#6B5C4A', fontStyle: 'italic' },
  yearNum: { color: '#2A1F15', fontStyle: 'normal', fontWeight: 500 },
  input: { width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FDFBF6', fontFamily: 'Georgia, serif', fontSize: 16, color: '#2A1F15', outline: 'none' },
  preview: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#854F0B', margin: '12px 0 0', textAlign: 'center' },
}