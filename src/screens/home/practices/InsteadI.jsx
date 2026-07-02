// ===================================================================
// TOOL: "Instead, I…"  (Early days)
// ===================================================================
// Every hour reclaimed from the habit grows a leaf on the branch.
// Log what you did instead and how it moved you, and two things
// accumulate: the branch fills in, and the evidence sorts itself —
// what actually lifts you, ranked by your own numbers, not ours.
//
// Data: free_activity_logs (unchanged table and fields):
// { activity_type, mood_before, mood_after } — one row per log.
// Legacy activity values (moved/outside/made) still render.
// ===================================================================
import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import { getUser, ScienceFooter, K, P } from './practiceKit'

const ACTIVITY_TYPES = [
  { value: 'walk',     label: 'Went for a walk or workout',     icon: '🚶' },
  { value: 'reached',  label: 'Talked to someone',              icon: '💬' },
  { value: 'food',     label: 'Had something to eat',            icon: '🍽️' },
  { value: 'absorbed', label: 'Watched or listened to something', icon: '📺' },
  { value: 'work',     label: 'Got busy with work or chores',   icon: '🧹' },
  { value: 'calm',     label: 'Prayed or meditated',            icon: '🙏' },
  { value: 'rested',   label: 'Slept or rested',                icon: '😴' },
  { value: 'other',    label: 'Something else',                 icon: '✨' },
]
const MOOD_FACES = ['😣', '😕', '😐', '🙂', '😄']
const INSIGHT_PHRASE = {
  walk: 'a walk or workout', reached: 'talking to someone', food: 'something to eat',
  absorbed: 'watching or listening', work: 'getting busy', calm: 'praying or meditating',
  rested: 'sleeping or resting', other: 'something else',
  moved: 'moving your body', outside: 'getting outside', made: 'making something',
}

const LEAF_CSS = `
@keyframes vowLeafGrow { from { opacity: 0; transform: scale(0) } to { opacity: 1; transform: scale(1) } }
.vowLeafNew { transform-box: fill-box; transform-origin: center; animation: vowLeafGrow 0.6s ease-out; }
@media (prefers-reduced-motion: reduce) { .vowLeafNew { animation: none !important; } }`

const MAX_LEAVES = 22
const LEAF_POS = Array.from({ length: MAX_LEAVES }, (_, k) => {
  const t = k / (MAX_LEAVES - 1)
  const x = 34 + t * 232
  const above = k % 2 === 0
  return {
    x,
    y: 96 - t * 30 + (above ? -12 : 10) - ((k * 3) % 5),
    branchY: 96 - t * 30,
    rot: (above ? -1 : 1) * (18 + ((k * 7) % 20)),
    tone: k % 3,
  }
})

function Branch({ count, justGrew }) {
  const shown = Math.min(count, MAX_LEAVES)
  const tones = [P.deep, P.mid, P.light]
  return (
    <div style={{ ...K.stage, height: 150 }}>
      <style>{LEAF_CSS}</style>
      <svg viewBox="0 0 300 150" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="vowBranchSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EDE8DB" /><stop offset="100%" stopColor="#F8F3E6" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="150" fill="url(#vowBranchSky)" />
        <circle cx="262" cy="28" r="10" fill="#E9C98E" opacity="0.5" />
        {/* the branch, entering from the left */}
        <path d="M 6 106 C 70 100 150 88 292 62" fill="none" stroke={P.bark} strokeWidth="5" strokeLinecap="round" />
        <path d="M 6 106 C 70 100 150 88 292 62" fill="none" stroke={P.barkDark} strokeWidth="5" strokeLinecap="round" opacity="0.25" strokeDasharray="2 9" />
        {/* leaves — one per hour reclaimed */}
        {LEAF_POS.slice(0, shown).map((l, i) => (
          <g key={i} className={justGrew && i === shown - 1 ? 'vowLeafNew' : undefined}>
            <line x1={l.x} y1={l.branchY} x2={l.x} y2={l.y + 3} stroke={P.deep} strokeWidth="1" opacity="0.7" />
            <ellipse cx={l.x} cy={l.y} rx="5.6" ry="2.9" fill={tones[l.tone]}
              transform={`rotate(${l.rot} ${l.x} ${l.y})`} opacity="0.92" />
          </g>
        ))}
        {count > MAX_LEAVES && (
          <text x="290" y="142" textAnchor="end" fontFamily="Georgia, serif" fontSize="8.5" fontStyle="italic" fill={P.body} opacity="0.85">
            +{count - MAX_LEAVES} more leaves
          </text>
        )}
        {count === 0 && (
          <text x="150" y="136" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9.5" fontStyle="italic" fill={P.muted}>
            a bare branch — the first hour reclaimed grows the first leaf
          </text>
        )}
      </svg>
    </div>
  )
}

function MoodFaces({ label, value, onChange }) {
  return (
    <div style={I.faceRow}>
      <span style={I.faceLabel}>{label}</span>
      <div style={I.faceBtns}>
        {MOOD_FACES.map((f, i) => (
          <button key={i} onClick={() => onChange(i + 1)}
            style={{ ...I.faceBtn, ...(value === i + 1 ? I.faceBtnOn : {}) }}
            aria-label={`${label} ${i + 1} of 5`}>{f}</button>
        ))}
      </div>
    </div>
  )
}

export default function InsteadI({ stage = 'endure' }) {
  const [logs, setLogs] = useState([])
  const [type, setType] = useState(null)
  const [before, setBefore] = useState(null)
  const [after, setAfter] = useState(null)
  const [saving, setSaving] = useState(false)
  const [justGrew, setJustGrew] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const user = await getUser()
      if (!user || cancelled) return
      const { data } = await supabase
        .from('free_activity_logs').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(60)
      if (!cancelled && data) setLogs(data)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canSave = type && before != null && after != null
  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const user = await getUser()
    if (!user) { setSaving(false); return }
    const row = { user_id: user.id, activity_type: type, mood_before: before, mood_after: after }
    const { error } = await supabase.from('free_activity_logs').insert(row)
    if (!error) {
      setLogs(l => [row, ...l])
      setType(null); setBefore(null); setAfter(null)
      setJustGrew(true); setTimeout(() => setJustGrew(false), 800)
    }
    setSaving(false)
  }

  // what actually helps — ranked by your own lift
  const byType = {}
  logs.forEach(l => {
    if (l.mood_before == null || l.mood_after == null) return
    if (!byType[l.activity_type]) byType[l.activity_type] = { sum: 0, n: 0 }
    byType[l.activity_type].sum += (l.mood_after - l.mood_before)
    byType[l.activity_type].n += 1
  })
  const ranked = Object.entries(byType)
    .filter(([, v]) => v.n >= 2)
    .map(([t, v]) => ({ t, lift: v.sum / v.n, n: v.n }))
    .sort((a, b) => b.lift - a.lift)
    .slice(0, 3)

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        The habit used to take this hour. Log what you did with it instead — and how it moved you. The branch keeps the hours; the numbers learn what actually lifts you.
      </p>
      <Branch count={logs.length} justGrew={justGrew} />
      <p style={K.q}>What did you do instead?</p>
      <div style={K.chips}>
        {ACTIVITY_TYPES.map(a => (
          <button key={a.value} onClick={() => setType(a.value)}
            style={{ ...K.chip, ...(type === a.value ? K.chipOn : {}) }}>{a.icon} {a.label}</button>
        ))}
      </div>
      <MoodFaces label="Before" value={before} onChange={setBefore} />
      <MoodFaces label="After" value={after} onChange={setAfter} />
      <button onClick={handleSave} disabled={!canSave || saving}
        style={{ ...K.saveBtn, ...(!canSave ? K.saveBtnDim : {}) }}>
        {saving ? 'One moment…' : 'Grow the leaf'}
      </button>
      {ranked.length > 0 && (
        <div style={K.pattern}>
          <p style={K.patternLabel}>What lifts you — your own evidence</p>
          {ranked.map(r => (
            <p key={r.t} style={{ ...K.patternText, margin: '2px 0' }}>
              {INSIGHT_PHRASE[r.t] || r.t} — {r.lift >= 0 ? '+' : ''}{(Math.round(r.lift * 10) / 10)} on average, over {r.n} times
            </p>
          ))}
        </div>
      )}
      <ScienceFooter text="Behavioral activation in miniature: recovery holds when the reclaimed hours get refilled with things that genuinely regulate you. Your own before-and-after numbers beat any generic list — after a dozen leaves, this tool knows what works on you better than a textbook does." />
    </div>
  )
}

const I = {
  faceRow: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 },
  faceLabel: { fontFamily: 'Georgia, serif', fontSize: 13, color: '#2A1F15', width: 48, textAlign: 'left', flexShrink: 0 },
  faceBtns: { display: 'flex', gap: 6 },
  faceBtn: { fontSize: 19, background: '#FDFBF6', border: '0.5px solid #E2D7C3', borderRadius: 10, padding: '5px 8px', cursor: 'pointer', filter: 'grayscale(0.55)', opacity: 0.75 },
  faceBtnOn: { border: '1px solid #C9A85C', background: '#F4ECDD', filter: 'none', opacity: 1 },
}