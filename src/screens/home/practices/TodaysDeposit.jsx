import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// DAILY: "Where your hours go"  (Staying steady)
// ===================================================================
// The old home's Capital Drain board, kept whole: recovery hands back
// roughly 14 hours a week, and unclaimed hours are where it creeps
// back in. Four accounts, steppers for each, an idle pool that turns
// from risk to secured as every hour gets spoken for.
//
// Data: free_stage_signals, stage 'build',
// signal_type 'build_allocation' (same contract as the old home),
// payload { physical, relational, craft, rest, idle, week_of } —
// a new row per save, latest row for the week wins.
// ===================================================================

const HOUR_POOL = 14
const CAPITAL_BUCKETS = [
  { key: 'physical',   label: 'Physical',   icon: '💪', sub: 'body, sleep, training' },
  { key: 'relational', label: 'Relational', icon: '🤝', sub: 'people who matter' },
  { key: 'craft',      label: 'Craft',      icon: '🛠️', sub: 'work, skill, making' },
  { key: 'rest',       label: 'Rest',       icon: '🌙', sub: 'genuine recovery' },
]

const mondayISO = () => {
  const d = new Date()
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function TodaysDeposit({ stage = 'build' }) {
  const [loading, setLoading] = useState(true)
  const [buckets, setBuckets] = useState({ physical: 0, relational: 0, craft: 0, rest: 0 })
  const [saving, setSaving] = useState(false)
  const [lockedAt, setLockedAt] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
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
  const secured = idle === 0

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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('free_stage_signals').insert({
      user_id: user.id, stage, signal_type: 'build_allocation',
      payload: { ...buckets, idle, week_of: mondayISO() },
    })
    setSaving(false)
    if (!error) setLockedAt(new Date().toISOString())
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  return (
    <div style={S.wrap}>
      <p style={S.intro}>
        Recovery hands you back roughly 14 hours a week. Unstructured, unspoken-for time is where relapse lives. Deploy every hour — leave none idle.
      </p>

      <div style={{ ...S.pool, ...(secured ? S.poolSafe : {}) }}>
        <span style={{ ...S.poolNum, color: secured ? '#5A6B45' : '#C5572C' }}>{idle}h</span>
        <span style={{ ...S.poolLabel, color: secured ? '#5A6B45' : '#A8431F' }}>
          {secured ? 'Secured — nothing idle' : 'Unsecured idle time (high relapse risk)'}
        </span>
      </div>

      <div style={S.list}>
        {CAPITAL_BUCKETS.map((b) => (
          <div key={b.key} style={S.row}>
            <span style={S.icon}>{b.icon}</span>
            <div style={S.info}>
              <span style={S.label}>{b.label}</span>
              <span style={S.sub}>{b.sub}</span>
            </div>
            <div style={S.stepper}>
              <button onClick={() => bump(b.key, -1)} style={{ ...S.stepBtn, opacity: (buckets[b.key] || 0) <= 0 ? 0.35 : 1 }}>−</button>
              <span style={S.stepVal}>{buckets[b.key] || 0}h</span>
              <button onClick={() => bump(b.key, 1)} style={{ ...S.stepBtn, opacity: allocated >= HOUR_POOL ? 0.35 : 1 }}>+</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving} style={S.saveBtn}>
        {saving ? 'Saving…' : secured ? 'Lock the board ✓' : 'Save (still unsecured)'}
      </button>
      {lockedAt && (
        <p style={S.lockedNote}>This week's board is saved — adjust and lock again any time.</p>
      )}
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 14px' },
  pool: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 9, background: '#FBF4EC', border: '0.5px solid #EAD9C6', borderRadius: 14, padding: '12px 14px', marginBottom: 14 },
  poolSafe: { background: '#F2F4EC', border: '0.5px solid #D9DFC9' },
  poolNum: { fontFamily: 'Georgia, serif', fontSize: 26, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  poolLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12 },
  list: { display: 'flex', flexDirection: 'column', gap: 9 },
  row: { display: 'flex', alignItems: 'center', gap: 11, background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '11px 12px' },
  icon: { fontSize: 20, lineHeight: 1, flexShrink: 0 },
  info: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 },
  label: { fontFamily: 'Georgia, serif', fontSize: 14, color: '#2A1F15', fontWeight: 500 },
  sub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11, color: '#9C8C78' },
  stepper: { display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 },
  stepBtn: { width: 30, height: 30, borderRadius: '50%', border: '0.5px solid #E2D7C3', background: '#FBF7EE', color: '#3A2A1C', fontSize: 16, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' },
  stepVal: { fontFamily: 'Georgia, serif', fontSize: 14, color: '#2A1F15', minWidth: 30, textAlign: 'center', fontVariantNumeric: 'tabular-nums' },
  saveBtn: { width: '100%', marginTop: 16, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  lockedNote: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#9C8C78', textAlign: 'center', margin: '9px 0 0' },
}