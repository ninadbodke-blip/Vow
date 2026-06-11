import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// DAILY: "Catch it in the act"  (A closer look)
// ===================================================================
// The noticing mode's whole skill, made tactile: each time the pull
// shows up today, one tap marks the catch. No judgement, no target —
// the count itself is the practice of seeing.
//
// Data: free_stage_signals, stage 'notice',
// signal_type 'notice_catch' (same contract as the old home),
// payload { count, date } — one row per day, updated in place.
// ===================================================================

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const lineFor = (n) => {
  if (n === 0) return 'Nothing caught yet today — and that can be true too.'
  if (n === 1) return 'One catch. The pattern just became visible.'
  if (n <= 3) return `${n} catches today. You\u2019re watching it, not the other way round.`
  return `${n} catches today. Seeing it this clearly is the practice working.`
}

export default function CatchItInTheAct({ stage = 'notice' }) {
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [pulse, setPulse] = useState(false)
  const rowIdRef = useRef(null)
  const countRef = useRef(0)
  const savingRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('id, payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'notice_catch')
        .eq('payload->>date', localDateStr())
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row) {
        rowIdRef.current = row.id
        countRef.current = Number(row.payload?.count) || 0
        setCount(countRef.current)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const catchOne = async () => {
    if (savingRef.current) return
    savingRef.current = true
    countRef.current += 1
    setCount(countRef.current)
    setPulse(true)
    setTimeout(() => setPulse(false), 350)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const payload = { count: countRef.current, date: localDateStr() }
      if (rowIdRef.current) {
        await supabase.from('free_stage_signals').update({ payload }).eq('id', rowIdRef.current)
      } else {
        const { data } = await supabase.from('free_stage_signals')
          .insert({ user_id: user.id, stage, signal_type: 'notice_catch', payload })
          .select('id').single()
        if (data) rowIdRef.current = data.id
      }
    }
    savingRef.current = false
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  return (
    <div style={S.wrap}>
      <p style={S.intro}>
        Whenever you feel the pull today — even faintly — come back and tap once. That moment of noticing is the entire exercise.
      </p>
      <button
        onClick={catchOne}
        style={{ ...S.catchBtn, transform: pulse ? 'scale(0.96)' : 'scale(1)' }}
      >
        <span style={S.catchCount}>{count}</span>
        <span style={S.catchLabel}>I just caught it</span>
      </button>
      <p style={S.countLine}>{lineFor(count)}</p>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px', textAlign: 'center' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 16px', textAlign: 'left' },
  catchBtn: {
    width: 152, height: 152, borderRadius: '50%', margin: '0 auto',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
    background: 'radial-gradient(circle at 38% 32%, #4A372A 0%, #3A2A1C 55%, #241710 100%)',
    border: '1px solid rgba(217,181,122,0.45)', cursor: 'pointer',
    boxShadow: '0 12px 30px -10px rgba(30,18,8,0.55)',
    transition: 'transform 0.18s ease',
  },
  catchCount: { fontFamily: 'Georgia, serif', fontSize: 34, color: '#D9B57A', lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  catchLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#FAF7F1' },
  countLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#854F0B', margin: '16px 0 0', lineHeight: 1.5 },
}