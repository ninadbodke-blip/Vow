// ===================================================================
// TOOL: "What it gives, what it takes"  (A closer look)
// ===================================================================
// A real ledger now, not a one-time form. Each entry writes a line
// in an open book — what it promised on the left page, what it
// actually left on the right — and over entries the arithmetic does
// what arithmetic does: "Promised relief ×5. Delivered it once."
// The practice draws no conclusion. The book does.
//
// Data: free_stage_signals, stage 'notice', signal_type 'notice_roi'
// (unchanged; same option strings), payload { before, promise, after,
// date } — now APPENDED per entry (was one row updated in place).
// ===================================================================
import { useState, useEffect } from 'react'
import {
  localDateStr, loadSignals, appendSignal,
  Chips, ScienceFooter, K, P,
} from './practiceKit'

const BEFORES  = ['Restless', 'Stressed', 'Bored', 'Low', 'Wired', 'Fine, honestly']
const PROMISES = ['Relief', 'Escape', 'A reward', 'Calm', 'Sleep', 'Fun']
const AFTERS   = ['Flat', 'Foggy', 'Guilty', 'About the same', 'Worse', 'Better, briefly']

function Ledger({ entries }) {
  const shown = entries.slice(0, 4)
  const ruled = [56, 78, 100, 122]
  return (
    <div style={{ ...K.stage, height: 176 }}>
      <svg viewBox="0 0 300 176" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="vowLedgerSpine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(95,68,41,0)" />
            <stop offset="50%" stopColor="rgba(95,68,41,0.22)" />
            <stop offset="100%" stopColor="rgba(95,68,41,0)" />
          </linearGradient>
        </defs>
        {/* desk + the closed edges of the book */}
        <rect x="0" y="0" width="300" height="176" fill="#F1E8D4" />
        <rect x="16" y="12" width="268" height="152" rx="9" fill={P.barkDark} />
        <rect x="19" y="15" width="262" height="146" rx="7" fill={P.bark} />
        {/* two pages */}
        <path d="M 26 22 L 148 20 L 148 156 L 26 154 Z" fill={P.paper} stroke="#E8DCC2" strokeWidth="0.6" />
        <path d="M 274 22 L 152 20 L 152 156 L 274 154 Z" fill={P.paper} stroke="#E8DCC2" strokeWidth="0.6" />
        <rect x="140" y="18" width="20" height="140" fill="url(#vowLedgerSpine)" />
        {/* page headers */}
        <text x="87" y="40" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fontStyle="italic" fill={P.deepGold}>it promised</text>
        <text x="213" y="40" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fontStyle="italic" fill={P.deepGold}>it left me</text>
        <line x1="44" y1="45" x2="130" y2="45" stroke="#E0D3B8" strokeWidth="0.6" />
        <line x1="170" y1="45" x2="256" y2="45" stroke="#E0D3B8" strokeWidth="0.6" />
        {/* ruled lines */}
        {ruled.map((y, i) => (
          <g key={i}>
            <line x1="40" y1={y + 8} x2="134" y2={y + 8} stroke="#EDE2CB" strokeWidth="0.6" />
            <line x1="166" y1={y + 8} x2="260" y2={y + 8} stroke="#EDE2CB" strokeWidth="0.6" />
          </g>
        ))}
        {/* the entries, newest first */}
        {shown.map((e, i) => (
          <g key={i} opacity={1 - i * 0.14}>
            <text x="87" y={ruled[i] + 4} textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fontStyle="italic" fill={P.body}>
              {e.promise.toLowerCase()}
            </text>
            <text x="213" y={ruled[i] + 4} textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fontStyle="italic" fill={P.ink}>
              {e.after.toLowerCase()}
            </text>
          </g>
        ))}
        {shown.length === 0 && (
          <text x="150" y="94" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10.5" fontStyle="italic" fill={P.muted}>
            the pages are waiting for the first entry
          </text>
        )}
      </svg>
    </div>
  )
}

export default function GivesAndTakes({ stage = 'notice' }) {
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState([])
  const [before, setBefore] = useState('')
  const [promise, setPromise] = useState('')
  const [after, setAfter] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const rows = await loadSignals('notice_roi', 40)
      if (cancelled) return
      setEntries(rows
        .map(r => ({ before: r.payload?.before, promise: r.payload?.promise, after: r.payload?.after }))
        .filter(e => e.promise && e.after))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canSave = before && promise && after
  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    await appendSignal(stage, 'notice_roi', { before, promise, after, date: localDateStr() })
    setEntries(prev => [{ before, promise, after }, ...prev])
    setBefore(''); setPromise(''); setAfter('')
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2200)
    setSaving(false)
  }

  // the book's arithmetic
  let tally = null
  if (entries.length >= 3) {
    const pc = {}, ac = {}
    entries.forEach(e => {
      pc[e.promise] = (pc[e.promise] || 0) + 1
      ac[e.after] = (ac[e.after] || 0) + 1
    })
    const topP = Object.entries(pc).sort((a, b) => b[1] - a[1])[0]
    const topA = Object.entries(ac).sort((a, b) => b[1] - a[1]).slice(0, 2)
    tally = `Promised \u201c${topP[0].toLowerCase()}\u201d \u00d7${topP[1]}. Left you ${topA.map(([k, n]) => `\u201c${k.toLowerCase()}\u201d \u00d7${n}`).join(', ')}.`
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        Every time it makes its pitch — or right after it delivers — write the line. One entry per time. The book keeps the score you can't keep in your head.
      </p>
      <Ledger entries={entries} />
      <Chips label="How were you feeling before?" options={BEFORES} value={before} onPick={setBefore} />
      <Chips label="What did it promise?" options={PROMISES} value={promise} onPick={setPromise} />
      <Chips label="And what did it actually leave you with?" options={AFTERS} value={after} onPick={setAfter} />
      <button onClick={handleSave} disabled={!canSave || saving}
        style={{ ...K.saveBtn, ...(!canSave ? K.saveBtnDim : {}) }}>
        {saving ? 'One moment…' : savedFlash ? 'Entered in the ledger ✓' : 'Enter it in the ledger'}
      </button>
      {entries.length > 0 && (
        <div style={K.pattern}>
          <p style={K.patternLabel}>{entries.length} entr{entries.length === 1 ? 'y' : 'ies'} in the book</p>
          <p style={K.patternText}>{tally || 'A few more entries and the arithmetic starts speaking.'}</p>
        </div>
      )}
      <ScienceFooter text="Craving runs on the remembered promise, not the remembered result — the brain's bookkeeping is biased toward the first ten minutes. Writing both columns, entry after entry, is expectancy correction: the same mechanism behind expectancy-challenge interventions, done in your own handwriting." />
    </div>
  )
}