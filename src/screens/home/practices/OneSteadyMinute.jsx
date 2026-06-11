import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "One steady minute"  (every mode, every day — the daily)
// ===================================================================
// The permanent door of the Today section: sixty seconds of guided
// breath. A circle grows on the in-breath, holds, and falls on the
// long out-breath — five rounds. No streaks, no scores; just done.
//
// Data: free_stage_signals, signal_type 'daily_steady',
// payload { date, rounds } — one row per day, updated in place.
// ===================================================================

const PHASES = [
  { key: 'in',   label: 'Breathe in',  secs: 4, scale: 1 },
  { key: 'hold', label: 'Hold it',     secs: 2, scale: 1 },
  { key: 'out',  label: 'Let it go',   secs: 6, scale: 0.55 },
]
const ROUNDS = 5

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function OneSteadyMinute({ stage = 'notice' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [doneToday, setDoneToday] = useState(false)
  const [running, setRunning] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [round, setRound] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('id, payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'daily_steady')
        .order('created_at', { ascending: false })
        .limit(2)
      if (cancelled) return
      const todays = (data || []).find((r) => r.payload?.date === localDateStr())
      if (todays) { setRowId(todays.id); setDoneToday(true) }
      setLoading(false)
    }
    load()
    return () => { cancelled = true; if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const finish = async () => {
    setRunning(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = { date: localDateStr(), rounds: ROUNDS }
    if (rowId) {
      await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      setDoneToday(true)
    } else {
      const { data } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'daily_steady', payload })
        .select('id').single()
      if (data) setRowId(data.id)
      setDoneToday(true)
    }
  }

  const step = (pIdx, r) => {
    setPhaseIdx(pIdx)
    setRound(r)
    const phase = PHASES[pIdx]
    timerRef.current = setTimeout(() => {
      const nextP = (pIdx + 1) % PHASES.length
      const nextR = nextP === 0 ? r + 1 : r
      if (nextR >= ROUNDS) { finish(); return }
      step(nextP, nextR)
    }, phase.secs * 1000)
  }

  const start = () => {
    if (running) return
    setRunning(true)
    setDoneToday(false)
    step(0, 0)
  }

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setRunning(false)
    setPhaseIdx(0)
    setRound(0)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  const phase = PHASES[phaseIdx]

  if (running) {
    return (
      <div style={S.wrap}>
        <div style={S.stageArea}>
          <div
            style={{
              ...S.circle,
              transform: `scale(${phase.scale})`,
              transition: `transform ${phase.secs}s ${phase.key === 'out' ? 'ease-out' : 'ease-in-out'}`,
            }}
          />
          <p style={S.phaseLabel}>{phase.label}</p>
        </div>
        <div style={S.dots}>
          {Array.from({ length: ROUNDS }, (_, i) => (
            <span key={i} style={{ ...S.dot, ...(i < round ? S.dotDone : i === round ? S.dotNow : {}) }} />
          ))}
        </div>
        <button style={S.stopLink} onClick={stop}>Stop early — it still counts as showing up</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>
        {doneToday
          ? 'Steadied today. The minute is here again whenever the day tilts.'
          : 'Before the tools, before the day — one minute of nothing but breath. The circle leads; you follow.'}
      </p>
      <div style={S.stageArea}>
        <div style={{ ...S.circle, transform: 'scale(0.7)' }} />
        {doneToday && <p style={S.doneMark}>✓</p>}
      </div>
      <button style={S.startBtn} onClick={start}>
        {doneToday ? 'Sit again' : 'Begin the minute'}
      </button>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px', textAlign: 'center' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 8px', textAlign: 'left' },
  stageArea: { position: 'relative', height: 168, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  circle: {
    width: 128, height: 128, borderRadius: '50%',
    background: 'radial-gradient(circle at 38% 32%, #F4E8CE 0%, #D9B57A 64%, #C9A85C 100%)',
    boxShadow: '0 10px 30px -8px rgba(133,79,11,0.35), inset 0 -6px 14px rgba(133,79,11,0.18)',
  },
  phaseLabel: { position: 'absolute', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15, color: '#3A2A1C', margin: 0 },
  doneMark: { position: 'absolute', fontSize: 26, color: '#5F8A4E', margin: 0 },
  dots: { display: 'flex', gap: 8, justifyContent: 'center', margin: '10px 0 4px' },
  dot: { width: 9, height: 9, borderRadius: '50%', border: '1px solid #D8CCB2', background: '#FDFBF6' },
  dotNow: { background: '#D9B57A', border: '1px solid #B8954C' },
  dotDone: { background: '#C9A85C', border: '1px solid #B8954C', opacity: 0.6 },
  startBtn: { width: '100%', marginTop: 12, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  stopLink: { background: 'transparent', border: 'none', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, textDecoration: 'underline', cursor: 'pointer', marginTop: 8 },
}