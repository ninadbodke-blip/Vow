// ===================================================================
// TOOL: "The rehearsal"  (Getting ready) — replaces "Clear the path"
// ===================================================================
// Clear-the-path was a one-time checklist; this is the daily version
// of the same idea. Each day brings one realistic scene — the offer,
// the quiet house, the bad day — and the user chooses their move,
// then presses and holds while they run the scene in their head,
// doing the move. Every rehearsal lays one stone on the path to the
// dawn gate. Day one arrives on a road already walked.
//
// Data: free_stage_signals, stage 'commit', signal_type
// 'commit_rehearsal' (new, additive — Mirror groups by type, so a
// new type is safe), payload { scene_id, scene, move, date } —
// appended per rehearsal.
// ===================================================================
import { useState, useEffect, useRef } from 'react'
import {
  localDateStr, dayOfYear, loadSignals, appendSignal,
  ScienceFooter, K, P,
} from './practiceKit'

const SCENES = [
  { id: 'offer',    t: 'The offer', s: 'A friend holds one out to you. Easy smile, no pressure. \u201cCome on, just this once.\u201d' },
  { id: 'quiet',    t: 'The quiet house', s: 'It\u2019s 11 p.m. Everyone\u2019s asleep or gone. The evening is yours and the old company knows your address.' },
  { id: 'badday',   t: 'The terrible day', s: 'Everything went wrong since morning. The voice says you\u2019ve earned it — that today doesn\u2019t count.' },
  { id: 'toast',    t: 'The celebration', s: 'Good news, raised glasses, someone pressing one into your hand. Saying no here feels like ruining it.' },
  { id: 'route',    t: 'The shop on the way', s: 'The route home walks you right past the usual place. Your feet know the turn before you do.' },
  { id: 'bed',      t: 'Scrolling in bed', s: 'Late, tired, screen-lit. Your defenses went to sleep an hour before you did.' },
  { id: 'argument', t: 'After the argument', s: 'The door just slammed — theirs or yours. Every nerve is asking for the fastest exit from this feeling.' },
  { id: 'friday',   t: 'The Friday feeling', s: 'The week is done and the old reward whispers that it\u2019s tradition. Rituals are the deepest grooves.' },
  { id: 'company',  t: 'The old company', s: 'The message arrives: \u201cWe\u2019re out — come.\u201d You know exactly how those evenings go, minute by minute.' },
  { id: 'justone',  t: 'The \u201cjust one\u201d thought', s: 'It arrives sounding perfectly reasonable: one won\u2019t matter, you\u2019ve been good, you can stop after.' },
]

const MOVES = [
  'Say the line: \u201cNot tonight.\u201d',
  'Leave the room for ten minutes',
  'Text someone before deciding',
  'Eat or drink something else first',
  'Walk \u2014 out the door, ten minutes',
  'Call the evening early',
]

const HOLD_MS = 4000
const MAX_STONES = 14

// the stone path: foreground → gate, a gentle S-curve, shrinking with distance
const STONE_POS = Array.from({ length: MAX_STONES }, (_, k) => {
  const t = k / (MAX_STONES - 1)
  return {
    x: 150 + 30 * Math.sin(t * 3.1) * (1 - t * 0.8),
    y: 180 - t * 56,
    rx: 12 - t * 6.5,
    ry: 5.2 - t * 2.7,
  }
})

const GATE_CSS = `
@keyframes vowStoneSet { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: translateY(0) } }
.vowStoneNew { animation: vowStoneSet 0.5s ease-out; }
@media (prefers-reduced-motion: reduce) { .vowStoneNew { animation: none !important; } }`

function DawnGate({ stones, justLaid }) {
  const shown = Math.min(stones, MAX_STONES)
  return (
    <div style={{ ...K.stage, height: 190 }}>
      <style>{GATE_CSS}</style>
      <svg viewBox="0 0 300 190" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="vowDawnSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EFD9B6" /><stop offset="100%" stopColor="#FAF0DC" />
          </linearGradient>
          <radialGradient id="vowDawnSun" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#E9C98E" /><stop offset="100%" stopColor="rgba(233,201,142,0)" />
          </radialGradient>
        </defs>
        {/* dawn — the commit sky: sun sitting on the horizon */}
        <rect x="0" y="0" width="300" height="122" fill="url(#vowDawnSky)" />
        <circle cx="150" cy="120" r="42" fill="url(#vowDawnSun)" opacity="0.55" />
        <circle cx="150" cy="120" r="19" fill="#E9C98E" opacity="0.9" />
        <ellipse cx="52" cy="70" rx="24" ry="4.8" fill="#FFFFFF" opacity="0.35" />
        <ellipse cx="238" cy="52" rx="18" ry="4" fill="#FFFFFF" opacity="0.3" />
        {/* ground */}
        <rect x="0" y="120" width="300" height="70" fill="#EFE6D2" />
        <line x1="0" y1="120" x2="300" y2="120" stroke={P.wash} strokeWidth="1" opacity="0.6" />
        {/* the gate on the horizon */}
        <rect x="131" y="74" width="7" height="47" rx="1.5" fill={P.barkDark} />
        <rect x="162" y="74" width="7" height="47" rx="1.5" fill={P.barkDark} />
        <rect x="125" y="68" width="50" height="7" rx="2.5" fill={P.bark} />
        <rect x="128" y="78" width="3" height="3" fill={P.goldSoft} opacity="0.8" />
        <rect x="169" y="78" width="3" height="3" fill={P.goldSoft} opacity="0.8" />
        {/* the stones already laid */}
        {STONE_POS.slice(0, shown).map((s, i) => (
          <g key={i} className={justLaid && i === shown - 1 ? 'vowStoneNew' : undefined}>
            <ellipse cx={s.x + 1.4} cy={s.y + 1.6} rx={s.rx} ry={s.ry} fill={P.barkDark} opacity="0.15" />
            <ellipse cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill={P.stone} stroke={P.stoneEdge} strokeWidth="0.5" />
            <ellipse cx={s.x - s.rx * 0.25} cy={s.y - s.ry * 0.3} rx={s.rx * 0.45} ry={s.ry * 0.4} fill="#D8CBAE" opacity="0.7" />
          </g>
        ))}
        {stones > MAX_STONES && (
          <text x="288" y="184" textAnchor="end" fontFamily="Georgia, serif" fontSize="8.5" fontStyle="italic" fill={P.body} opacity="0.8">
            +{stones - MAX_STONES} behind you
          </text>
        )}
        {stones === 0 && (
          <text x="150" y="168" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9.5" fontStyle="italic" fill={P.muted}>
            the path to the gate is unlaid — one stone a day
          </text>
        )}
      </svg>
    </div>
  )
}

export default function TheRehearsal({ stage = 'commit' }) {
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [doneTodayScene, setDoneTodayScene] = useState(null)
  const [sceneIdx, setSceneIdx] = useState(() => dayOfYear() % SCENES.length)
  const [move, setMove] = useState('')
  const [ownMove, setOwnMove] = useState('')
  const [holdPct, setHoldPct] = useState(0)
  const [justLaid, setJustLaid] = useState(false)
  const holdRef = useRef(null)
  const savingRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const rows = await loadSignals('commit_rehearsal', 80)
      if (cancelled) return
      setTotal(rows.length)
      const today = rows.find(r => r.payload?.date === localDateStr())
      if (today) setDoneTodayScene(today.payload?.scene || null)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => () => { if (holdRef.current) clearInterval(holdRef.current) }, [])

  const scene = SCENES[sceneIdx]
  const moveText = move === 'own' ? ownMove.trim() : move
  const armed = !!moveText

  const anotherScene = () => {
    setSceneIdx(i => (i + 1) % SCENES.length)
    setMove(''); setOwnMove(''); setHoldPct(0)
  }

  const layStone = async () => {
    if (savingRef.current) return
    savingRef.current = true
    await appendSignal(stage, 'commit_rehearsal', {
      scene_id: scene.id, scene: scene.t, move: moveText, date: localDateStr(),
    })
    setTotal(t => t + 1)
    setDoneTodayScene(scene.t)
    setJustLaid(true); setTimeout(() => setJustLaid(false), 700)
    setMove(''); setOwnMove(''); setHoldPct(0)
    savingRef.current = false
  }

  const startHold = () => {
    if (!armed || holdRef.current) return
    const t0 = performance.now()
    holdRef.current = setInterval(() => {
      const pct = Math.min(100, ((performance.now() - t0) / HOLD_MS) * 100)
      setHoldPct(pct)
      if (pct >= 100) { clearInterval(holdRef.current); holdRef.current = null; layStone() }
    }, 50)
  }
  const stopHold = () => {
    if (holdRef.current) { clearInterval(holdRef.current); holdRef.current = null }
    setHoldPct(0)
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        One scene a day, answered before it arrives. Pick your move, then hold the stone and run the whole scene in your head — see yourself doing it. Day one should walk in on a road you’ve already walked.
      </p>
      <DawnGate stones={total} justLaid={justLaid} />

      <div style={R.sceneCard}>
        <p style={R.sceneEyebrow}>{doneTodayScene ? 'Another scene' : 'Today\u2019s scene'}</p>
        <p style={R.sceneTitle}>{scene.t}</p>
        <p style={R.sceneBody}>{scene.s}</p>
      </div>
      <button onClick={anotherScene} style={K.editLink}>Show me a different scene ›</button>

      <p style={K.q}>Your move, decided now:</p>
      <div style={K.chips}>
        {MOVES.map(m => (
          <button key={m} onClick={() => { setMove(m); setHoldPct(0) }} style={{ ...K.chip, ...(move === m ? K.chipOn : {}) }}>{m}</button>
        ))}
        <button onClick={() => setMove('own')} style={{ ...K.chip, ...(move === 'own' ? K.chipOn : {}) }}>My own move…</button>
      </div>
      {move === 'own' && (
        <input style={K.ownInput} value={ownMove} onChange={(e) => setOwnMove(e.target.value)}
          placeholder="What will you do, exactly?" maxLength={80} />
      )}

      <button
        onPointerDown={startHold} onPointerUp={stopHold} onPointerLeave={stopHold} onPointerCancel={stopHold}
        disabled={!armed}
        style={{
          ...K.saveBtn, ...(!armed ? K.saveBtnDim : {}),
          position: 'relative', overflow: 'hidden', touchAction: 'none',
          WebkitUserSelect: 'none', userSelect: 'none',
        }}>
        <span style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: `${holdPct}%`,
          background: 'rgba(233,201,142,0.28)', transition: holdPct === 0 ? 'width 0.25s' : 'none',
        }} />
        <span style={{ position: 'relative' }}>
          {holdPct > 0 ? 'See yourself doing it\u2026' : armed ? 'Hold \u2014 and run the scene in your head' : 'Pick your move first'}
        </span>
      </button>

      {total > 0 && (
        <div style={K.pattern}>
          <p style={K.patternLabel}>{total} scene{total === 1 ? '' : 's'} rehearsed</p>
          <p style={K.patternText}>
            {doneTodayScene
              ? `Today\u2019s stone is laid \u2014 \u201c${doneTodayScene}\u201d, answered. Another scene is optional, never owed.`
              : 'Each stone is a fight the 11 p.m. version of you never has to have.'}
          </p>
        </div>
      )}

      <ScienceFooter text="Two mechanisms in one hold: if-then planning (implementation intentions roughly double follow-through, across hundreds of studies) and imaginal rehearsal — mentally running an action recruits much of the same circuitry as doing it, so a scene rehearsed calm is measurably easier to exit when it arrives live." />
    </div>
  )
}

const R = {
  sceneCard: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    borderRadius: 16, padding: '16px 17px 15px', textAlign: 'left',
    boxShadow: '0 8px 20px -10px rgba(40,25,10,0.45)', marginTop: 2,
  },
  sceneEyebrow: { fontSize: 9.5, color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600, margin: '0 0 6px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  sceneTitle: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 17, color: '#FAF7F1', margin: '0 0 6px', lineHeight: 1.3 },
  sceneBody: { fontFamily: 'Georgia, serif', fontSize: 13, color: '#CBBA98', lineHeight: 1.55, margin: 0 },
}