// ===================================================================
// DAILY: "Where your hours go"  (Staying steady)
// ===================================================================
// Recovery hands back about 14 hours a week — and unclaimed hours
// are where it creeps back in. The four accounts are pots now: every
// hour deposited grows the sprout in that pot, and the idle hours
// hang over the garden as mist until each one is spoken for. All
// fourteen deployed, the mist clears and the sun is out.
//
// Data: free_stage_signals, stage 'build', signal_type
// 'build_allocation' (unchanged), payload { physical, relational,
// craft, rest, idle, week_of } — appended per lock, week read by
// week_of, exactly as before.
// ===================================================================
import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import { getUser, ScienceFooter, K, P } from './practiceKit'

const HOUR_POOL = 14
const CAPITAL_BUCKETS = [
  { key: 'physical',   label: 'Body',   sub: 'body, sleep, training' },
  { key: 'relational', label: 'People', sub: 'people who matter' },
  { key: 'craft',      label: 'Craft',  sub: 'work, skill, making' },
  { key: 'rest',       label: 'Rest',   sub: 'genuine recovery' },
]

const mondayISO = () => {
  const d = new Date()
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function Pot({ x, hours }) {
  const stem = Math.min(hours, 7) * 6
  const topY = 118 - stem
  return (
    <g>
      {/* the pot */}
      <path d={`M ${x - 16} 120 L ${x - 12} 142 L ${x + 12} 142 L ${x + 16} 120 Z`} fill={P.mound} />
      <rect x={x - 18} y="116" width="36" height="6" rx="2.5" fill={P.bark} />
      <ellipse cx={x} cy="119" rx="13" ry="2.4" fill={P.barkDark} opacity="0.5" />
      {/* the sprout — one segment per hour */}
      {hours > 0 && (
        <>
          <path d={`M ${x} 118 C ${x - 1.5} ${118 - stem * 0.5} ${x + 1.5} ${118 - stem * 0.7} ${x} ${topY}`}
            fill="none" stroke={P.deep} strokeWidth="2" strokeLinecap="round"
            style={{ transition: 'd 0.4s' }} />
          {hours >= 2 && <ellipse cx={x - 5} cy={topY + stem * 0.35} rx="4.6" ry="2.3" fill={P.mid} transform={`rotate(-28 ${x - 5} ${topY + stem * 0.35})`} />}
          {hours >= 3 && <ellipse cx={x + 5} cy={topY + stem * 0.55} rx="4.6" ry="2.3" fill={P.light} transform={`rotate(28 ${x + 5} ${topY + stem * 0.55})`} />}
          {hours >= 5 && <circle cx={x} cy={topY - 2} r="2.6" fill={P.goldSoft} />}
        </>
      )}
    </g>
  )
}

function Garden({ buckets, idle }) {
  const mistO = idle / HOUR_POOL
  const xs = [48, 116, 184, 252]
  return (
    <div style={{ ...K.stage, height: 168 }}>
      <svg viewBox="0 0 300 168" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="vowGardenSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EDE8DB" /><stop offset="100%" stopColor="#F8F3E6" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="168" fill="url(#vowGardenSky)" />
        {/* the sun, out in proportion to hours claimed */}
        <circle cx="264" cy="30" r="12" fill="#E9C98E" opacity={0.25 + (1 - mistO) * 0.65} style={{ transition: 'opacity 0.4s' }} />
        {/* idle hours as mist over the garden */}
        <g style={{ opacity: mistO * 0.9, transition: 'opacity 0.4s' }} fill="#DDD3BC">
          <ellipse cx="90" cy="42" rx="58" ry="10" opacity="0.7" />
          <ellipse cx="180" cy="34" rx="52" ry="9" opacity="0.6" />
          <ellipse cx="140" cy="52" rx="70" ry="8" opacity="0.5" />
        </g>
        {idle > 0 ? (
          <text x="150" y="24" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9.5" fontStyle="italic" fill={P.body} opacity="0.9">
            {idle} idle hour{idle === 1 ? '' : 's'} still in the mist
          </text>
        ) : (
          <text x="150" y="24" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9.5" fontStyle="italic" fill={P.deepGold}>
            every hour spoken for — the mist is clear
          </text>
        )}
        {/* the shelf of pots */}
        <rect x="0" y="142" width="300" height="26" fill="#EFE6D2" />
        <line x1="0" y1="142" x2="300" y2="142" stroke={P.wash} strokeWidth="1" opacity="0.7" />
        {CAPITAL_BUCKETS.map((b, i) => <Pot key={b.key} x={xs[i]} hours={buckets[b.key] || 0} />)}
        {CAPITAL_BUCKETS.map((b, i) => (
          <text key={b.key} x={xs[i]} y="156" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8.5" fontStyle="italic" fill={P.body}>
            {b.label.toLowerCase()} · {buckets[b.key] || 0}h
          </text>
        ))}
      </svg>
    </div>
  )
}

export default function TodaysDeposit({ stage = 'build' }) {
  const [loading, setLoading] = useState(true)
  const [buckets, setBuckets] = useState({ physical: 0, relational: 0, craft: 0, rest: 0 })
  const [saving, setSaving] = useState(false)
  const [lockedAt, setLockedAt] = useState(null)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const user = await getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('payload, created_at')
        .eq('user_id', user.id)
        .eq('signal_type', 'build_allocation')
        .order('created_at', { ascending: false })
        .limit(8)
      if (cancelled) return
      const row = (data || []).find((r) => r.payload?.week_of === mondayISO())
      if (row?.payload) {
        setBuckets({
          physical: Number(row.payload.physical) || 0,
          relational: Number(row.payload.relational) || 0,
          craft: Number(row.payload.craft) || 0,
          rest: Number(row.payload.rest) || 0,
        })
        setLockedAt(row.created_at)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const allocated = CAPITAL_BUCKETS.reduce((s, b) => s + (buckets[b.key] || 0), 0)
  const idle = Math.max(0, HOUR_POOL - allocated)

  const bump = (key, delta) => {
    setBuckets((p) => {
      const cur = p[key] || 0
      if (delta > 0 && allocated >= HOUR_POOL) return p
      const next = Math.max(0, cur + delta)
      return { ...p, [key]: next }
    })
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const user = await getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('free_stage_signals').insert({
      user_id: user.id, stage, signal_type: 'build_allocation',
      payload: { ...buckets, idle, week_of: mondayISO() },
    })
    setSaving(false)
    if (!error) {
      setLockedAt(new Date().toISOString())
      setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2200)
    }
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        Recovery hands back about fourteen hours a week — and the ones left idle are where it creeps back in. Deposit each hour into a pot and watch the garden claim the week.
      </p>
      <Garden buckets={buckets} idle={idle} />
      {CAPITAL_BUCKETS.map((b) => (
        <div key={b.key} style={D.row}>
          <span style={D.rowText}>
            <span style={D.rowLabel}>{b.label}</span>
            <span style={D.rowSub}>{b.sub}</span>
          </span>
          <span style={D.stepper}>
            <button onClick={() => bump(b.key, -1)} style={D.stepBtn} aria-label={`less ${b.label}`}>−</button>
            <span style={D.stepVal}>{buckets[b.key] || 0}</span>
            <button onClick={() => bump(b.key, 1)} style={{ ...D.stepBtn, ...(allocated >= HOUR_POOL ? { opacity: 0.4 } : {}) }} aria-label={`more ${b.label}`}>+</button>
          </span>
        </div>
      ))}
      <button onClick={handleSave} disabled={saving} style={K.saveBtn}>
        {saving ? 'One moment…' : savedFlash ? 'Planted ✓' : lockedAt ? 'Update the week\u2019s split' : 'Plant the week\u2019s hours'}
      </button>
      {idle === 0 && <p style={K.doneLine}>All fourteen deployed. An hour with a name on it is an hour it can’t have.</p>}
      <ScienceFooter text="Relapse research keeps finding the same quiet culprit: unstructured time. Hours with a named purpose are hours the old habit cannot book — which is why allocating the reclaimed fourteen, concretely and in advance, outperforms simply intending to stay busy." />
    </div>
  )
}

const D = {
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 2px', borderBottom: '0.5px solid #F0E9DA' },
  rowText: { display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left' },
  rowLabel: { fontFamily: 'Georgia, serif', fontSize: 13.5, color: '#2A1F15' },
  rowSub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10.5, color: '#9C8C78' },
  stepper: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  stepBtn: { width: 30, height: 30, borderRadius: '50%', border: '0.5px solid #DDCFB6', background: '#FDFBF6', color: '#2A1F15', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1 },
  stepVal: { fontFamily: 'Georgia, serif', fontSize: 15, color: '#2A1F15', minWidth: 18, textAlign: 'center', fontVariantNumeric: 'tabular-nums' },
}