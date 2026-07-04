// ===================================================================
// DAILY: "Today's shield"  (Getting back up)
// ===================================================================
// After a slip, grand promises are the trap — so the daily here is
// one small promise for one short window, and now the shield is
// real: it arms as the window and the move are chosen, the boss
// catching light when both are set. Every shield raised joins the
// row beneath. Small, held, and then the next one.
//
// Data: free_stage_signals, stage 'reclaim', signal_type
// 'reclaim_shield' (unchanged; same option strings), payload
// { window, action, date } — appended per raise, as before.
// ===================================================================
import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import { localDateStr, getUser, Chips, ScienceFooter, K, P } from './practiceKit'

const SHIELD_WINDOWS = ['Next hour', 'Next 12 hours', 'Just today']
const SHIELD_ACTIONS = ['Go to sleep', 'Step outside', 'Drink water', 'Text my anchor', 'Stay off my phone']

function Shield({ windowSel, action }) {
  const armed = !!(windowSel && action)
  const half = !!(windowSel || action)
  return (
    <div style={{ ...K.stage, height: 168 }}>
      <svg viewBox="0 0 300 168" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="vowShieldSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E9E2D2" /><stop offset="100%" stopColor="#F8F2E3" />
          </linearGradient>
          <radialGradient id="vowShieldWood" cx="42%" cy="38%">
            <stop offset="0%" stopColor="#A98A5E" /><stop offset="100%" stopColor="#82603F" />
          </radialGradient>
          <radialGradient id="vowShieldBoss" cx="42%" cy="38%">
            <stop offset="0%" stopColor="#F6E8C4" /><stop offset="60%" stopColor="#E9C98E" />
            <stop offset="100%" stopColor="#C9A85C" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="300" height="168" fill="url(#vowShieldSky)" />
        <rect x="0" y="140" width="300" height="28" fill="#EBE2CC" />
        <line x1="0" y1="140" x2="300" y2="140" stroke={P.wash} strokeWidth="1" opacity="0.7" />
        {/* the post it leans against */}
        <rect x="196" y="52" width="7" height="90" rx="2.5" fill={P.barkDark} opacity="0.85" />
        {/* the shield */}
        <g transform="rotate(-7 138 96)" style={{ transition: 'opacity 0.5s' }} opacity={armed ? 1 : half ? 0.85 : 0.6}>
          <ellipse cx="141" cy="141" rx="46" ry="5" fill={P.barkDark} opacity={armed ? 0.16 : 0.08} />
          <circle cx="138" cy="94" r="48"
            fill={armed ? 'url(#vowShieldWood)' : '#EDE6D4'}
            stroke={armed ? P.barkDark : '#CDBFA4'}
            strokeWidth={armed ? 3 : 2}
            strokeDasharray={armed ? 'none' : '5 4'}
            style={{ transition: 'all 0.5s' }} />
          {/* rim rivets */}
          {armed && [0, 60, 120, 180, 240, 300].map(a => {
            const r = (a * Math.PI) / 180
            return <circle key={a} cx={138 + 41 * Math.cos(r)} cy={94 + 41 * Math.sin(r)} r="1.8" fill={P.goldSoft} opacity="0.8" />
          })}
          {/* wood grain */}
          {armed && (
            <>
              <path d="M 100 82 Q 138 74 176 82" fill="none" stroke={P.barkDark} strokeWidth="0.8" opacity="0.35" />
              <path d="M 98 108 Q 138 116 178 108" fill="none" stroke={P.barkDark} strokeWidth="0.8" opacity="0.35" />
            </>
          )}
          {/* the boss */}
          <circle cx="138" cy="94" r={armed ? 13 : 10}
            fill={armed ? 'url(#vowShieldBoss)' : 'none'}
            stroke={armed ? '#A67B3B' : '#CDBFA4'} strokeWidth="1.2"
            strokeDasharray={armed ? 'none' : '3 3'}
            style={{ transition: 'all 0.5s' }} />
          {armed && <circle cx="138" cy="94" r="20" fill={P.goldSoft} opacity="0.18" />}
        </g>
        {/* what it's armed with */}
        <text x="138" y="30" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fontStyle="italic"
          fill={windowSel ? P.deepGold : P.muted} style={{ transition: 'fill 0.4s' }}>
          {windowSel ? windowSel.toLowerCase() : 'pick the window'}
        </text>
        <text x="138" y="160" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fontStyle="italic"
          fill={action ? P.deepGold : P.muted} style={{ transition: 'fill 0.4s' }}>
          {action ? action.toLowerCase() : 'pick the move'}
        </text>
      </svg>
    </div>
  )
}

function ShieldRow({ count }) {
  const shown = Math.min(count, 12)
  if (count === 0) return null
  return (
    <div style={T.row}>
      {Array.from({ length: shown }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" style={{ width: 15, height: 15 }}>
          <circle cx="10" cy="10" r="8" fill={P.bark} opacity={Math.max(0.4, 0.95 - i * 0.05)} />
          <circle cx="10" cy="10" r="3" fill={P.goldSoft} opacity="0.9" />
        </svg>
      ))}
      {count > 12 && <span style={T.more}>+{count - 12}</span>}
    </div>
  )
}

export default function TodaysShield({ stage = 'reclaim' }) {
  const [loading, setLoading] = useState(true)
  const [todays, setTodays] = useState([])
  const [totalRaised, setTotalRaised] = useState(0)
  const [windowSel, setWindowSel] = useState('')
  const [action, setAction] = useState('')
  const [saving, setSaving] = useState(false)
  const [raisedFlash, setRaisedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const user = await getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'reclaim_shield')
        .order('created_at', { ascending: false })
        .limit(60)
      if (cancelled) return
      const rows = (data || []).map((r) => r.payload).filter(Boolean)
      setTodays(rows.filter((p) => p.date === localDateStr()))
      setTotalRaised(rows.length)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canRaise = windowSel && action
  const raise = async () => {
    if (saving || !canRaise) return
    setSaving(true)
    const user = await getUser()
    if (!user) { setSaving(false); return }
    const payload = { window: windowSel, action, date: localDateStr() }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'reclaim_shield', payload })
    if (!error) {
      setTodays((t) => [payload, ...t])
      setTotalRaised((n) => n + 1)
      setWindowSel(''); setAction('')
      setRaisedFlash(true); setTimeout(() => setRaisedFlash(false), 2200)
    }
    setSaving(false)
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        Not forever — just a window. One small promise you can actually keep is worth more right now than ten brave ones. Arm it, raise it, hold just that.
      </p>
      <Shield windowSel={windowSel} action={action} />
      <Chips label="For the…" options={SHIELD_WINDOWS} value={windowSel} onPick={(w) => setWindowSel(windowSel === w ? '' : w)} />
      <Chips label="I will…" options={SHIELD_ACTIONS} value={action} onPick={(a) => setAction(action === a ? '' : a)} />
      <button onClick={raise} disabled={!canRaise || saving}
        style={{ ...K.saveBtn, ...(!canRaise ? K.saveBtnDim : {}) }}>
        {saving ? 'One moment…' : raisedFlash ? 'Raised ✓' : 'Raise the shield'}
      </button>
      {todays.length > 0 && (
        <p style={K.doneLine}>
          {todays.length === 1
            ? `Held: ${todays[0].action.toLowerCase()}, for the ${todays[0].window.toLowerCase()}. When the window closes, raise the next one.`
            : `${todays.length} shields raised today, window by window. That is how ground gets retaken.`}
        </p>
      )}
      <ShieldRow count={totalRaised} />
      {totalRaised > 0 && <p style={T.rowLabel}>{totalRaised} shield{totalRaised === 1 ? '' : 's'} raised so far</p>}
      <ScienceFooter text="After a lapse, sweeping resolutions fail at a predictable rate — and each failure teaches helplessness. Micro-commitments run the machinery in reverse: a promise scaled to one window gets kept, a kept promise rebuilds self-efficacy, and self-efficacy is the single strongest predictor of getting back up." />
    </div>
  )
}

const T = {
  row: { display: 'flex', gap: 5, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 12 },
  more: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10, color: '#9C8C78' },
  rowLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10.5, color: '#9C8C78', textAlign: 'center', margin: '4px 0 0' },
}