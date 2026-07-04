// ===================================================================
// TOOL: "What still stands"  (Getting back up)
// ===================================================================
// After a slip the voice says "everything's gone" — so here is the
// field where everything actually is. Six standing stones, one for
// each thing the slip did not take. They were never knocked down;
// they're just hard to see through the morning mist. Tap each one
// and it clarifies. See all six, and the sun is up.
//
// Data: free_stage_signals, stage 'reclaim', signal_type
// 'reclaim_stands' (unchanged), payload { kept: [keys], date } —
// one row per day, updated in place.
// ===================================================================
import { useState, useEffect } from 'react'
import {
  localDateStr, loadTodayRow, appendSignal, updateSignal,
  ScienceFooter, K, P,
} from './practiceKit'

const STANDS = [
  { key: 'reasons',  label: 'Your reasons',                              short: 'reasons' },
  { key: 'days',     label: 'Every day you already had',                 short: 'the days' },
  { key: 'learning', label: 'What you know about the pattern now',       short: 'the learning' },
  { key: 'people',   label: 'The people who know',                       short: 'the people' },
  { key: 'tools',    label: 'Your tools and routines',                   short: 'the tools' },
  { key: 'here',     label: 'The fact that you came back here',          short: 'being here' },
]

// six menhirs across the field — varied, old, unbothered
const STONES = [
  { x: 42,  w: 20, h: 46, lean: -2 },
  { x: 86,  w: 17, h: 56, lean: 1.5 },
  { x: 129, w: 22, h: 40, lean: -1 },
  { x: 172, w: 18, h: 52, lean: 2 },
  { x: 215, w: 21, h: 44, lean: -1.5 },
  { x: 258, w: 17, h: 50, lean: 1 },
]

function StoneField({ kept, onToggle }) {
  const allSeen = kept.length === STANDS.length
  return (
    <div style={{ ...K.stage, height: 172 }}>
      <svg viewBox="0 0 300 172" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="vowStandSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E9E2D2" /><stop offset="100%" stopColor="#F8F2E3" />
          </linearGradient>
          <linearGradient id="vowStoneLit" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#B5A481" /><stop offset="78%" stopColor="#C4B49A" />
            <stop offset="100%" stopColor="#E4CFA4" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="172" fill="url(#vowStandSky)" />
        {/* the sun comes up as the stones are seen */}
        <circle cx="268" cy="30" r="12" fill="#E9C98E"
          opacity={0.2 + (kept.length / STANDS.length) * 0.7}
          style={{ transition: 'opacity 0.5s' }} />
        {allSeen && <circle cx="268" cy="30" r="20" fill="#E9C98E" opacity="0.22" />}
        {/* the field */}
        <rect x="0" y="128" width="300" height="44" fill="#EBE2CC" />
        <ellipse cx="150" cy="130" rx="175" ry="9" fill="#E3D8BC" />
        {/* the stones */}
        {STANDS.map((s, i) => {
          const st = STONES[i]
          const seen = kept.includes(s.key)
          const baseY = 130
          return (
            <g key={s.key} onClick={() => onToggle(s.key)} style={{ cursor: 'pointer' }}
              transform={`rotate(${st.lean} ${st.x} ${baseY})`}>
              {/* shadow */}
              <ellipse cx={st.x + 3} cy={baseY + 2} rx={st.w * 0.68} ry="3.2"
                fill={P.barkDark} opacity={seen ? 0.16 : 0.06} style={{ transition: 'opacity 0.5s' }} />
              {/* the stone — always there; seeing it is the change */}
              <path
                d={`M ${st.x - st.w / 2} ${baseY}
                    L ${st.x - st.w / 2 + 2} ${baseY - st.h * 0.72}
                    Q ${st.x - st.w / 2 + 3} ${baseY - st.h} ${st.x} ${baseY - st.h - 2}
                    Q ${st.x + st.w / 2 - 2} ${baseY - st.h} ${st.x + st.w / 2 - 1} ${baseY - st.h * 0.66}
                    L ${st.x + st.w / 2} ${baseY} Z`}
                fill={seen ? 'url(#vowStoneLit)' : '#EDE6D4'}
                stroke={seen ? P.stoneEdge : '#D8CDB4'}
                strokeWidth={seen ? 0.9 : 0.8}
                strokeDasharray={seen ? 'none' : '3 3'}
                opacity={seen ? 1 : 0.75}
                style={{ transition: 'all 0.5s' }} />
              {/* first light on the east edge */}
              {seen && (
                <path d={`M ${st.x + st.w / 2 - 1} ${baseY - st.h * 0.66} L ${st.x + st.w / 2} ${baseY}`}
                  fill="none" stroke={P.goldSoft} strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
              )}
              <text x={st.x} y={baseY + 15} textAnchor="middle" fontFamily="Georgia, serif" fontSize="7.5"
                fontStyle="italic" fill={seen ? P.deepGold : P.muted}
                style={{ transition: 'fill 0.5s' }}>{s.short}</text>
            </g>
          )
        })}
        <text x="150" y="20" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9" fontStyle="italic"
          fill={allSeen ? P.deepGold : P.muted} style={{ transition: 'fill 0.5s' }}>
          {allSeen ? 'all of it, still standing' : 'tap each stone the slip did not take'}
        </text>
      </svg>
    </div>
  )
}

export default function WhatStillStands({ stage = 'reclaim' }) {
  const [loading, setLoading] = useState(true)
  const [todayRowId, setTodayRowId] = useState(null)
  const [kept, setKept] = useState([])
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const today = await loadTodayRow('reclaim_stands')
      if (cancelled) return
      if (today?.payload) {
        setTodayRowId(today.id)
        setKept(Array.isArray(today.payload.kept) ? today.payload.kept : [])
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const toggle = (key) => {
    setKept(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]))
  }

  const handleSave = async () => {
    if (saving || kept.length === 0) return
    setSaving(true)
    const payload = { kept, date: localDateStr() }
    if (todayRowId) {
      await updateSignal(todayRowId, payload)
    } else {
      const id = await appendSignal(stage, 'reclaim_stands', payload)
      if (id) setTodayRowId(id)
    }
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2200)
    setSaving(false)
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        The voice after a slip says everything is gone. This is the field where everything actually is. The stones were never knocked down — they are just hard to see through the morning. Tap each one the slip did not take.
      </p>
      <StoneField kept={kept} onToggle={toggle} />
      <div style={K.chips}>
        {STANDS.map(s => (
          <button key={s.key} onClick={() => toggle(s.key)}
            style={{ ...K.chip, ...(kept.includes(s.key) ? K.chipOn : {}) }}>{s.label}</button>
        ))}
      </div>
      <button onClick={handleSave} disabled={kept.length === 0 || saving}
        style={{ ...K.saveBtn, ...(kept.length === 0 ? K.saveBtnDim : {}) }}>
        {saving ? 'One moment…' : savedFlash ? 'On record ✓' : 'Keep the inventory'}
      </button>
      {kept.length > 0 && (
        <p style={K.doneLine}>
          {kept.length} of {STANDS.length} seen. The slip took a day. It did not take these.
        </p>
      )}
      <ScienceFooter text="The all-is-lost feeling has a name — the abstinence violation effect — and it, not the slip itself, is what most often turns one lapse into a relapse. Its antidote is exactly this: a concrete inventory of what remains, because the catastrophizing voice cannot survive an itemized list." />
    </div>
  )
}