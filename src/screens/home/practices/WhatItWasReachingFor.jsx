// ===================================================================
// TOOL: "What it was reaching for"  (Getting back up)
// ===================================================================
// Under most slips there's a real need that picked a bad route — so
// the route is drawn: a path that forks at dusk, one branch worn
// smooth by old feet, the other barely marked. Name the need without
// shame, sketch one other way it could be met, and the lantern at
// the end of the other branch lights. Across slips, the needs tally
// themselves: what it usually reaches for becomes knowledge.
//
// Data: free_stage_signals, stage 'reclaim', signal_type
// 'reclaim_need' (unchanged), payload { needs: [..], alternative,
// logged_at } — appended per look, as before.
// ===================================================================
import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import { getUser, ScienceFooter, K, P } from './practiceKit'

const NEEDS = [
  'Relief',
  'Rest',
  'Connection',
  'To feel something',
  'To feel nothing',
  'A reward',
  'An escape hatch',
]

function ForkScene({ needs, lit }) {
  return (
    <div style={{ ...K.stage, height: 162 }}>
      <svg viewBox="0 0 300 162" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="vowForkSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CFC0A4" /><stop offset="100%" stopColor="#EFE6D2" />
          </linearGradient>
          <radialGradient id="vowForkLamp" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#F6E8C4" /><stop offset="100%" stopColor="rgba(246,232,196,0)" />
          </radialGradient>
        </defs>
        {/* dusk */}
        <rect x="0" y="0" width="300" height="118" fill="url(#vowForkSky)" />
        <circle cx="46" cy="98" r="10" fill="#E9C98E" opacity="0.6" />
        <rect x="0" y="116" width="300" height="46" fill="#E6DCC2" />
        <line x1="0" y1="116" x2="300" y2="116" stroke={P.wash} strokeWidth="1" opacity="0.6" />
        {/* the need, named at the start of the path */}
        <text x="150" y="152" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9.5" fontStyle="italic" fill={P.ink} opacity="0.85">
          {needs.length ? `the need: ${needs.map(n => n.toLowerCase()).join(', ')}` : 'the need starts here'}
        </text>
        {/* the shared path up from the need */}
        <path d="M 150 140 C 150 128 150 122 150 112" fill="none" stroke={P.mound} strokeWidth="7" strokeLinecap="round" opacity="0.8" />
        {/* the old route — worn smooth, fading into the dark corner */}
        <path d="M 150 112 C 118 100 84 88 52 60" fill="none" stroke={P.mound} strokeWidth="7" strokeLinecap="round" opacity="0.75" />
        <path d="M 150 112 C 118 100 84 88 52 60" fill="none" stroke={P.barkDark} strokeWidth="1" strokeDasharray="1 6" opacity="0.3" />
        <ellipse cx="44" cy="50" rx="26" ry="14" fill={P.barkDark} opacity="0.14" />
        <text x="46" y="36" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" fontStyle="italic" fill={P.body} opacity="0.8">the old route</text>
        {/* the other way — barely marked, gold-dotted */}
        <path d="M 150 112 C 182 100 216 88 248 62" fill="none"
          stroke={lit ? P.gold : '#D8CDB4'} strokeWidth={lit ? 3 : 1.6}
          strokeDasharray="2 6" strokeLinecap="round" opacity={lit ? 0.9 : 0.6}
          style={{ transition: 'all 0.6s' }} />
        {/* the lantern at its end */}
        <g style={{ transition: 'opacity 0.6s' }}>
          <rect x="252" y="42" width="3" height="22" rx="1.4" fill={P.barkDark} />
          <rect x="248.5" y="34" width="10" height="12" rx="2.5" fill={lit ? 'rgba(36,23,16,0.5)' : 'none'} stroke={P.barkDark} strokeWidth="1.2" />
          {lit && (
            <>
              <circle cx="253.5" cy="40" r="12" fill="url(#vowForkLamp)" opacity="0.8" />
              <circle cx="253.5" cy="40" r="3" fill="#F6E8C4" />
            </>
          )}
        </g>
        <text x="252" y="26" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" fontStyle="italic"
          fill={lit ? P.deepGold : P.muted} style={{ transition: 'fill 0.6s' }}>the other way</text>
      </svg>
    </div>
  )
}

export default function WhatItWasReachingFor({ stage = 'reclaim' }) {
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [needs, setNeeds] = useState([])
  const [alt, setAlt] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const user = await getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'reclaim_need')
        .order('created_at', { ascending: false })
        .limit(30)
      if (cancelled) return
      setHistory((data || []).map((r) => r.payload).filter((p) => p?.needs?.length))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const toggle = (n) => setNeeds((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]))
  const canSave = needs.length > 0

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const user = await getUser()
    if (!user) { setSaving(false); return }
    const payload = { needs, alternative: alt.trim() || null, logged_at: new Date().toISOString() }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'reclaim_need', payload })
    if (!error) {
      setHistory((h) => [payload, ...h])
      setNeeds([]); setAlt('')
      setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2400)
    }
    setSaving(false)
  }

  // what it usually reaches for
  let tally = null
  if (history.length >= 2) {
    const nc = {}
    history.forEach((p) => p.needs.forEach((n) => { nc[n] = (nc[n] || 0) + 1 }))
    const top = Object.entries(nc).sort((a, b) => b[1] - a[1]).slice(0, 3)
    tally = `What it usually reaches for: ${top.map(([n, c]) => `${n.toLowerCase()} \u00d7${c}`).join(', ')}. Meet these on purpose, and the old route loses its reason.`
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        The need was real. The route is what slipped — and routes can be redrawn. Name what it was reaching for, without shame, then sketch one other way it could be met.
      </p>
      <ForkScene needs={needs} lit={alt.trim().length > 0} />
      <p style={K.q}>What was it reaching for?</p>
      <div style={K.chips}>
        {NEEDS.map((n) => (
          <button key={n} onClick={() => toggle(n)} style={{ ...K.chip, ...(needs.includes(n) ? K.chipOn : {}) }}>{n}</button>
        ))}
      </div>
      <p style={K.q}>One other way that need could be met — even an imperfect one:</p>
      <input style={F.input} value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={120}
        placeholder="Light the other way…" />
      <button onClick={handleSave} disabled={!canSave || saving}
        style={{ ...K.saveBtn, ...(!canSave ? K.saveBtnDim : {}) }}>
        {saving ? 'One moment…' : savedFlash ? 'Route redrawn ✓' : 'Redraw the route'}
      </button>
      {history.length > 0 && (
        <div style={K.pattern}>
          <p style={K.patternLabel}>{history.length} look{history.length === 1 ? '' : 's'} beneath the surface</p>
          <p style={K.patternText}>{tally || 'One more look and the pattern of needs starts to show.'}</p>
        </div>
      )}
      <ScienceFooter text="Substance use is, mechanically, a route to a legitimate destination — relief, rest, connection — chosen because it's the fastest one the brain knows. Naming the destination separates need from route, and needs met deliberately stop needing to be met by ambush. The lantern is the whole treatment plan." />
    </div>
  )
}

const F = {
  input: { width: '100%', boxSizing: 'border-box', marginTop: 2, padding: '11px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FDFBF6', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13.5, color: '#2A1F15', outline: 'none' },
}