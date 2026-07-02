// ===================================================================
// TOOL: "How ready, honestly"  (Getting ready)
// ===================================================================
// Readiness is a number that moves — so it gets a vessel that fills
// and a line that remembers. Each check appends; the sparkline shows
// every previous one, and the practice asks the question that does
// the real work: not "why isn't it higher?" but "why isn't it lower?"
// That answer is fuel that was already in the tank.
//
// Data: free_stage_signals, stage 'commit', signal_type
// 'commit_confidence' (unchanged), payload { score 0–100,
// blocker|null } — appended each check, as before.
// ===================================================================
import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import { getUser, ScienceFooter, K, P } from './practiceKit'

const BLOCKERS = [
  'Fear of failing again',
  'The first evening',
  'Telling people',
  'Losing the relief',
  'The habit hours',
  'Nothing — just the date',
]

// vessel geometry: a rounded amphora-ish bowl, filled to score%
function Vessel({ score }) {
  const TOP = 34, BOTTOM = 132
  const level = BOTTOM - ((BOTTOM - TOP) * score) / 100
  return (
    <div style={{ ...K.stage, height: 160 }}>
      <svg viewBox="0 0 300 160" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="vowVesselSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EFD9B6" /><stop offset="100%" stopColor="#FAF0DC" />
          </linearGradient>
          <linearGradient id="vowVesselFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E9C98E" /><stop offset="100%" stopColor="#C9A85C" />
          </linearGradient>
          <clipPath id="vowVesselClip">
            <path d="M 122 34 C 122 30 130 27 150 27 C 170 27 178 30 178 34 C 178 58 186 66 186 92 C 186 122 170 134 150 134 C 130 134 114 122 114 92 C 114 66 122 58 122 34 Z" />
          </clipPath>
        </defs>
        <rect x="0" y="0" width="300" height="160" fill="url(#vowVesselSky)" />
        <circle cx="46" cy="30" r="10" fill="#E9C98E" opacity="0.45" />
        <rect x="0" y="138" width="300" height="22" fill="#EFE6D2" />
        <line x1="0" y1="138" x2="300" y2="138" stroke={P.wash} strokeWidth="1" opacity="0.7" />
        {/* the liquid, clipped to the vessel */}
        <g clipPath="url(#vowVesselClip)">
          <rect x="108" y={level} width="84" height={140 - level + 20}
            fill="url(#vowVesselFill)" opacity="0.9"
            style={{ transition: 'y 0.5s cubic-bezier(0.4,0,0.2,1), height 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
          <line x1="114" y1={level} x2="186" y2={level} stroke="#F6E8C4" strokeWidth="1.4" opacity="0.85"
            style={{ transition: 'y1 0.5s, y2 0.5s' }} />
        </g>
        {/* the vessel itself */}
        <path d="M 122 34 C 122 30 130 27 150 27 C 170 27 178 30 178 34 C 178 58 186 66 186 92 C 186 122 170 134 150 134 C 130 134 114 122 114 92 C 114 66 122 58 122 34 Z"
          fill="none" stroke={P.barkDark} strokeWidth="2.2" />
        <ellipse cx="150" cy="30" rx="28" ry="4.5" fill="none" stroke={P.barkDark} strokeWidth="1.6" />
        {/* score */}
        <text x="228" y="86" fontFamily="Georgia, serif" fontSize="24" fill={P.ink} fontVariantNumeric="tabular-nums">{score}</text>
        <text x="228" y="100" fontFamily="Georgia, serif" fontSize="9" fontStyle="italic" fill={P.body}>out of 100</text>
      </svg>
    </div>
  )
}

function Sparkline({ points }) {
  if (points.length < 2) return null
  const W = 260, H = 42, PAD = 6
  const step = (W - PAD * 2) / (points.length - 1)
  const pts = points.map((s, i) => `${PAD + i * step},${H - PAD - ((H - PAD * 2) * s) / 100}`)
  const last = pts[pts.length - 1].split(',')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: H, marginTop: 4 }}>
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#EDE2CB" strokeWidth="1" />
      <polyline points={pts.join(' ')} fill="none" stroke={P.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => {
        const [x, y] = p.split(',')
        return <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 3.2 : 2} fill={i === pts.length - 1 ? P.deepGold : P.goldgreen} />
      })}
      <text x={Number(last[0])} y={Number(last[1]) - 6} textAnchor="middle" fontFamily="Georgia, serif" fontSize="8.5" fill={P.deepGold}>{points[points.length - 1]}</text>
    </svg>
  )
}

export default function HowReady({ stage = 'commit' }) {
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState([])          // ascending, oldest → newest
  const [blockers, setBlockers] = useState([])
  const [score, setScore] = useState(60)
  const [blocker, setBlocker] = useState('')
  const [saving, setSaving] = useState(false)
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
        .eq('signal_type', 'commit_confidence')
        .order('created_at', { ascending: true })
        .limit(60)
      if (cancelled) return
      const rows = (data || []).filter(r => r.payload?.score != null)
      setScores(rows.map(r => Number(r.payload.score)))
      setBlockers(rows.map(r => r.payload.blocker).filter(Boolean))
      const latest = rows[rows.length - 1]
      if (latest) {
        setScore(Number(latest.payload.score))
        setBlocker(latest.payload.blocker || '')
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const user = await getUser()
    if (!user) { setSaving(false); return }
    const payload = { score, blocker: blocker || null }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'commit_confidence', payload })
    if (!error) {
      setScores(s => [...s, score])
      if (blocker) setBlockers(b => [...b, blocker])
      setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2200)
    }
    setSaving(false)
  }

  // blocker tally
  let blockerLine = null
  if (blockers.length >= 2) {
    const bc = {}
    blockers.forEach(b => { bc[b] = (bc[b] || 0) + 1 })
    const top = Object.entries(bc).sort((a, b) => b[1] - a[1])[0]
    blockerLine = `most named: \u201c${top[0].toLowerCase()}\u201d \u00d7${top[1]}`
  }

  const spark = scores.slice(-12)

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        Not the brave answer — the honest one. Fill the vessel to where it actually sits today, then notice the stranger question underneath.
      </p>
      <Vessel score={score} />
      <input type="range" min="0" max="100" value={score}
        onChange={(e) => setScore(Number(e.target.value))} style={R.range} />
      <div style={R.endLabels}>
        <span style={R.endLabel}>Not yet</span>
        <span style={R.endLabel}>Ready</span>
      </div>
      {score > 0 && (
        <p style={R.flip}>It isn't zero. Why not lower? Whatever just answered that — that's fuel already in the tank.</p>
      )}
      <p style={K.q}>The one thing most in the way?</p>
      <div style={K.chips}>
        {BLOCKERS.map((b) => (
          <button key={b} onClick={() => setBlocker(blocker === b ? '' : b)} style={{ ...K.chip, ...(blocker === b ? K.chipOn : {}) }}>{b}</button>
        ))}
      </div>
      <button onClick={handleSave} disabled={saving} style={K.saveBtn}>
        {saving ? 'One moment…' : savedFlash ? 'Checked ✓' : 'Check it in'}
      </button>
      {spark.length >= 2 && (
        <div style={K.pattern}>
          <p style={K.patternLabel}>Your number, moving — {scores.length} checks</p>
          <Sparkline points={spark} />
          {blockerLine && <p style={K.patternText}>{blockerLine}</p>}
        </div>
      )}
      <ScienceFooter text="This is a readiness ruler from motivational interviewing. The number matters less than two things it produces: the movement (watching your own line climb is more convincing than any pep talk) and the flipped question — asking why the score isn't lower surfaces motivation that was already yours." />
    </div>
  )
}

const R = {
  range: { width: '100%', marginTop: 4, accentColor: '#854F0B' },
  endLabels: { display: 'flex', justifyContent: 'space-between', marginTop: 2 },
  endLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10.5, color: '#9C8C78' },
  flip: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#854F0B', margin: '10px 0 0', lineHeight: 1.55, textAlign: 'center' },
}