// ===================================================================
// DAILY: "The worry, answered"  (Getting ready)
// ===================================================================
// Worry is the brain rehearsing a threat without an ending. Here the
// worry is drawn — a cloud over the dawn field — and choosing the
// counter-move draws the tether: the cloud, staked to the ground,
// answered. Each answered morning leaves a stake standing.
//
// Data: free_stage_signals, stage 'commit', signal_type 'commit_fear'
// (unchanged; same option strings), payload { threat, sign,
// mitigation, date } — `date` is additive; one row per day now
// (today updated in place, new day inserts).
// ===================================================================
import { useState, useEffect } from 'react'
import {
  localDateStr, loadTodayRow, loadSignals, appendSignal, updateSignal,
  Chips, ScienceFooter, K, P,
} from './practiceKit'

const FEAR_THREATS = ['Boredom', 'Physical pain', 'Social pressure', 'Emotional crash', 'A celebration', 'Loneliness', 'A fight or stress', 'The old place or routine', 'A sudden craving', "Can't sleep"]
const FEAR_SIGNS = ['Restlessness', 'A "just once" thought', 'Reaching for my phone', 'Bargaining with myself', 'Pulling away from people', 'A spike of stress']
const FEAR_COUNTERS = ['Call my anchor', 'Ride the 20-min wave', 'Leave the room', 'Go to sleep', 'Move my body', 'Text someone now', 'Re-read my vow', 'Eat and drink water']

function WorryScene({ threat, answered, answeredCount }) {
  const stakes = Math.min(answeredCount, 8)
  return (
    <div style={{ ...K.stage, height: 156 }}>
      <svg viewBox="0 0 300 156" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="vowWorrySky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EFD9B6" /><stop offset="100%" stopColor="#FAF0DC" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="112" fill="url(#vowWorrySky)" />
        <circle cx="252" cy="98" r="15" fill="#E9C98E" opacity="0.85" />
        <circle cx="252" cy="98" r="26" fill="#E9C98E" opacity="0.18" />
        <rect x="0" y="110" width="300" height="46" fill="#EFE6D2" />
        <line x1="0" y1="110" x2="300" y2="110" stroke={P.wash} strokeWidth="1" opacity="0.7" />
        {/* the worry cloud — settles lower once tethered */}
        <g style={{ transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)', transform: `translateY(${answered ? 14 : 0}px)` }}>
          <g opacity="0.95">
            <ellipse cx="112" cy="44" rx="42" ry="14" fill="#E7DECA" />
            <ellipse cx="90" cy="38" rx="24" ry="11" fill="#EDE5D2" />
            <ellipse cx="134" cy="37" rx="26" ry="12" fill="#E2D8C1" />
          </g>
          <text x="112" y="48" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9.5" fontStyle="italic" fill={P.ink} opacity="0.85">
            {threat ? threat.toLowerCase() : 'the worry'}
          </text>
          {/* the tether, drawn when a counter-move exists */}
          {answered && (
            <path d="M 112 58 C 112 76 110 84 108 96" fill="none" stroke={P.deepGold} strokeWidth="1.4" strokeDasharray="3 3" opacity="0.9" />
          )}
        </g>
        {/* the stake it ties to */}
        {answered && (
          <g>
            <rect x="105.5" y="108" width="4" height="14" rx="1.5" fill={P.barkDark}
              style={{ transform: 'rotate(-6deg)', transformOrigin: '107px 122px' }} />
            <circle cx="107" cy="107" r="2.2" fill={P.goldSoft} />
          </g>
        )}
        {/* stakes of past answered mornings, standing along the field */}
        {Array.from({ length: stakes }).map((_, i) => (
          <g key={i} opacity={0.35 + 0.06 * i}>
            <rect x={206 + i * 10.5} y="122" width="2.6" height="10" rx="1.2" fill={P.bark} />
          </g>
        ))}
        {answeredCount > 0 && (
          <text x="288" y="146" textAnchor="end" fontFamily="Georgia, serif" fontSize="8" fontStyle="italic" fill={P.body} opacity="0.85">
            {answeredCount} morning{answeredCount === 1 ? '' : 's'} answered
          </text>
        )}
      </svg>
    </div>
  )
}

export default function TheWorryAnswered({ stage = 'commit' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [threat, setThreat] = useState('')
  const [sign, setSign] = useState('')
  const [mitigation, setMitigation] = useState('')
  const [answeredCount, setAnsweredCount] = useState(0)
  const [answeredToday, setAnsweredToday] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [today, rows] = await Promise.all([
        loadTodayRow('commit_fear'),
        loadSignals('commit_fear', 60),
      ])
      if (cancelled) return
      if (today?.payload?.threat) {
        setRowId(today.id)
        setThreat(today.payload.threat || '')
        setSign(today.payload.sign || '')
        setMitigation(today.payload.mitigation || '')
        setAnsweredToday(true)
      }
      setAnsweredCount(rows.filter(r => r.payload?.threat && r.payload?.mitigation).length)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canSave = threat && sign && mitigation
  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const payload = { threat, sign, mitigation, date: localDateStr() }
    if (rowId) {
      await updateSignal(rowId, payload)
    } else {
      const id = await appendSignal(stage, 'commit_fear', payload)
      if (id) { setRowId(id); setAnsweredCount(n => n + 1) }
    }
    setAnsweredToday(true)
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2200)
    setSaving(false)
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        The countdown gets easier when the biggest worry has an ending. Name today's likeliest threat, its first sign, your counter-move — and tether it while you're calm.
      </p>
      <WorryScene threat={threat} answered={answeredToday || (canSave && !!mitigation)} answeredCount={answeredCount} />
      <Chips label="Today's likeliest threat?" options={FEAR_THREATS} value={threat} onPick={setThreat} />
      <Chips label="The first sign it's arriving?" options={FEAR_SIGNS} value={sign} onPick={setSign} />
      <Chips label="Your counter-move, chosen now:" options={FEAR_COUNTERS} value={mitigation} onPick={setMitigation} />
      <button onClick={handleSave} disabled={!canSave || saving}
        style={{ ...K.saveBtn, ...(!canSave ? K.saveBtnDim : {}) }}>
        {saving ? 'One moment…' : savedFlash ? 'Tethered ✓' : 'Tether it'}
      </button>
      {answeredToday && (
        <p style={K.doneLine}>Answered for today. Worries rotate — tomorrow brings the next one, and the next stake.</p>
      )}
      <ScienceFooter text="Worry is threat-rehearsal with no final scene — the loop keeps running because it never resolves. Naming the threat, its first sign, and a pre-chosen counter-move gives it the ending it was missing; with a plan attached, the same thought registers as preparation instead of alarm." />
    </div>
  )
}