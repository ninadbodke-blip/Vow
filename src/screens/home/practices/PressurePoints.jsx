import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// TOOL: "The three pillars"  (Staying steady)
// ===================================================================
// A structure doesn't fall from one bad night — it falls when the
// load goes up while the pillars under it go soft. Each day: name
// this week's load, then press and hold to lock each pillar you
// actually held today. The last seven days build into a grid, so a
// soft pillar shows up before it becomes a crack.
//
// Data: free_stage_signals, stage 'build',
// signal_type 'build_pillars' (same contract as the old home),
// payload { stress (1–5), pillars: [keys], high_stress, date } —
// one row per day, updated in place.
// ===================================================================

const STRESS_LEVELS = [
  { v: 1, label: 'Feather-light' },
  { v: 2, label: 'Manageable' },
  { v: 3, label: 'Loaded' },
  { v: 4, label: 'Heavy' },
  { v: 5, label: 'Crushing' },
]

const PILLARS = [
  { key: 'sleep', label: 'Solid sleep', sub: 'the hours you actually got' },
  { key: 'movement', label: 'Movement', sub: 'you moved the body' },
  { key: 'silence', label: 'Silence', sub: 'time alone with no noise' },
]

const HOLD_MS = 1300

const localDateStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function PillarHold({ label, sub, locked, onLock, onUnlock }) {
  const [pct, setPct] = useState(0)
  const timerRef = useRef(null)

  const stop = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (!locked) setPct(0)
  }
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const start = (e) => {
    e.preventDefault()
    if (locked) { onUnlock(); return }
    if (timerRef.current) return
    timerRef.current = setInterval(() => {
      setPct((p) => {
        const next = p + 100 / (HOLD_MS / 30)
        if (next >= 100) {
          clearInterval(timerRef.current); timerRef.current = null
          onLock(); return 0
        }
        return next
      })
    }, 30)
  }

  return (
    <button
      onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
      style={{ ...S.pillar, ...(locked ? S.pillarOn : {}) }}
    >
      {!locked && pct > 0 && <span style={{ ...S.pillarFill, width: `${pct}%` }} />}
      <span style={S.pillarText}>
        <span style={{ ...S.pillarLabel, ...(locked ? S.pillarLabelOn : {}) }}>{label}</span>
        <span style={{ ...S.pillarSub, ...(locked ? S.pillarSubOn : {}) }}>{locked ? 'held today — tap to undo' : sub}</span>
      </span>
      <span style={{ ...S.pillarMark, opacity: locked ? 1 : 0 }}>✓</span>
    </button>
  )
}

export default function PressurePoints({ stage = 'build' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [stress, setStress] = useState(0)
  const [locked, setLocked] = useState({})
  const [history, setHistory] = useState([])
  const [saving, setSaving] = useState(false)
  const [savedTick, setSavedTick] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('id, payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'build_pillars')
        .order('created_at', { ascending: false })
        .limit(20)
      if (cancelled) return
      const rows = data || []
      const today = rows.find((r) => r.payload?.date === localDateStr())
      if (today?.payload) {
        setRowId(today.id)
        setStress(Number(today.payload.stress) || 0)
        setLocked((today.payload.pillars || []).reduce((a, k) => { a[k] = true; return a }, {}))
      }
      setHistory(rows.filter((r) => r.payload?.date).map((r) => r.payload))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const lockedKeys = PILLARS.filter((p) => locked[p.key]).map((p) => p.key)

  const persist = async (nextStress, nextLockedKeys) => {
    if (saving) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = {
      stress: nextStress,
      pillars: nextLockedKeys,
      high_stress: nextStress >= 4 && nextLockedKeys.length > 0,
      date: localDateStr(),
    }
    if (rowId) {
      await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
    } else {
      const { data } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'build_pillars', payload })
        .select('id').single()
      if (data) setRowId(data.id)
    }
    setHistory((h) => [payload, ...h.filter((p) => p.date !== payload.date)])
    setSaving(false)
    setSavedTick(true)
    setTimeout(() => setSavedTick(false), 1500)
  }

  const pickStress = (v) => { setStress(v); persist(v, lockedKeys) }
  const lockPillar = (key) => {
    const next = { ...locked, [key]: true }
    setLocked(next)
    persist(stress, PILLARS.filter((p) => next[p.key]).map((p) => p.key))
  }
  const unlockPillar = (key) => {
    const next = { ...locked, [key]: false }
    setLocked(next)
    persist(stress, PILLARS.filter((p) => next[p.key]).map((p) => p.key))
  }

  // last 7 days for the grid (today first)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return localDateStr(d)
  })
  const byDate = history.reduce((a, p) => { if (!a[p.date]) a[p.date] = p; return a }, {})
  const anyHistory = days.some((d) => byDate[d])

  const insight = (() => {
    if (!stress && lockedKeys.length === 0) return null
    if (stress >= 4 && lockedKeys.length >= 2) return 'Heavy load with the pillars held under it — this is exactly the work.'
    if (stress >= 4 && lockedKeys.length === 0) return 'A heavy week with nothing locked under it is how cracks start. Pick one pillar tonight and hold just that.'
    if (stress >= 4) return 'Heavy week. One pillar is holding — a second would take real weight off the evening.'
    return 'Lighter week — lock the pillars anyway. They are cheapest to hold when nothing is pressing.'
  })()

  if (loading) return <p style={S.muted}>One moment…</p>

  return (
    <div style={S.wrap}>
      <p style={S.intro}>
        A structure doesn’t fall from one bad night. It falls when the load goes up while the pillars under it go soft. Name the load, then hold what holds you.
      </p>

      <p style={S.q}>This week’s load</p>
      <div style={S.chips}>
        {STRESS_LEVELS.map((s) => (
          <button key={s.v} onClick={() => pickStress(s.v)} style={{ ...S.chip, ...(stress === s.v ? S.chipOn : {}) }}>{s.label}</button>
        ))}
      </div>

      <p style={S.q}>Press and hold each pillar you held today</p>
      <div style={S.pillarList}>
        {PILLARS.map((p) => (
          <PillarHold
            key={p.key}
            label={p.label}
            sub={p.sub}
            locked={!!locked[p.key]}
            onLock={() => lockPillar(p.key)}
            onUnlock={() => unlockPillar(p.key)}
          />
        ))}
      </div>

      {insight && <p style={S.insight}>{savedTick ? 'Saved. ' : ''}{insight}</p>}

      {anyHistory && (
        <div style={S.gridCard}>
          <p style={S.gridHead}>The last seven days</p>
          {PILLARS.map((p) => (
            <div key={p.key} style={S.gridRow}>
              <span style={S.gridLabel}>{p.label}</span>
              <span style={S.gridDots}>
                {days.slice().reverse().map((d) => {
                  const held = byDate[d]?.pillars?.includes(p.key)
                  return <span key={d} style={{ ...S.dot, ...(held ? S.dotOn : {}) }} />
                })}
              </span>
            </div>
          ))}
          <p style={S.gridFoot}>oldest → today. A pillar missing three days in a row is the crack forming.</p>
        </div>
      )}
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 12px' },
  q: { fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: 14.5, fontWeight: 500, margin: '14px 0 8px' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: { padding: '8px 12px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 12.5, cursor: 'pointer' },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },
  pillarList: { display: 'flex', flexDirection: 'column', gap: 9 },
  pillar: { position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '13px 14px', background: '#FDFBF6', border: '0.5px solid #E2D7C3', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' },
  pillarOn: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', border: '0.5px solid #241710' },
  pillarFill: { position: 'absolute', left: 0, top: 0, bottom: 0, background: 'linear-gradient(90deg, rgba(217,181,122,0.25), rgba(201,168,92,0.45))', pointerEvents: 'none', transition: 'width 0.05s linear' },
  pillarText: { position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  pillarLabel: { fontFamily: 'Georgia, serif', fontSize: 14.5, color: '#2A1F15', fontWeight: 500 },
  pillarLabelOn: { color: '#FAF7F1' },
  pillarSub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#9C8C78' },
  pillarSubOn: { color: '#D9B57A' },
  pillarMark: { position: 'relative', color: '#D9B57A', fontSize: 15, transition: 'opacity 0.2s' },
  insight: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#854F0B', lineHeight: 1.55, margin: '14px 0 0' },
  gridCard: { marginTop: 16, background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: 14, padding: '12px 14px' },
  gridHead: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11, color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 9px' },
  gridRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 },
  gridLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#6B5C4A', width: 84, flexShrink: 0 },
  gridDots: { display: 'flex', gap: 6 },
  dot: { width: 13, height: 13, borderRadius: '50%', background: '#EFE9DA', border: '0.5px solid #E2D7C3' },
  dotOn: { background: 'linear-gradient(180deg, #D9B57A, #C9A85C)', border: '0.5px solid #B8923F' },
  gridFoot: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10.5, color: '#9C8C78', margin: '4px 0 0' },
}