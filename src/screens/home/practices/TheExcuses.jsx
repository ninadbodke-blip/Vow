// ===================================================================
// TOOL: "The excuses"  (Weighing it up)
// ===================================================================
// Every habit has a press office; now its favorite lines get tallied.
// Each day the user marks which lines it used and which was loudest,
// and the board keeps score in ink strokes — four bars and a cut,
// the old way. Over days, the leaderboard writes itself: the loudest
// lines rise, and a named line works less well every time it's named.
//
// Data: free_stage_signals, stage 'reflect', signal_type
// 'reflect_rationalization' (unchanged; same line strings), payload
// { lies: [..], loudest, date } — now one row PER DAY (today updated
// in place, new day inserts), so the tally can accumulate.
// ===================================================================
import { useState, useEffect } from 'react'
import {
  localDateStr, loadTodayRow, loadSignals, appendSignal, updateSignal,
  ScienceFooter, K, P,
} from './practiceKit'

const LIES = [
  'Just one won\u2019t matter',
  'I\u2019ve earned it',
  'I\u2019ll stop tomorrow',
  'It helps me cope',
  'Everyone does it',
  'I\u2019m fine, actually',
  'It\u2019s not that bad',
]

// ink tally: groups of five — four strokes and a diagonal cut
function TallyMarks({ n }) {
  const groups = Math.floor(n / 5)
  const rest = n % 5
  const parts = []
  for (let g = 0; g < groups; g++) parts.push(5)
  if (rest > 0) parts.push(rest)
  const width = parts.reduce((w, p) => w + (p === 5 ? 22 : p * 5 + 2), 0) + 4
  let x = 2
  return (
    <svg viewBox={`0 0 ${Math.max(width, 10)} 18`} style={{ height: 15, width: Math.max(width, 10) * (15 / 18), display: 'block' }}>
      {parts.map((p, gi) => {
        const strokes = []
        const gx = x
        const count = p === 5 ? 4 : p
        for (let i = 0; i < count; i++) {
          strokes.push(<line key={i} x1={gx + i * 5} y1="2.5" x2={gx + i * 5 + 0.6} y2="15.5" stroke={P.ink} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />)
        }
        if (p === 5) {
          strokes.push(<line key="cut" x1={gx - 2.5} y1="13.5" x2={gx + 17} y2="3.5" stroke={P.deepGold} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />)
        }
        x += p === 5 ? 22 : p * 5 + 2
        return <g key={gi}>{strokes}</g>
      })}
    </svg>
  )
}

function TallyBoard({ counts, loudCounts, todayPicks }) {
  const rows = LIES
    .map(l => ({ line: l, n: counts[l] || 0, loud: loudCounts[l] || 0 }))
    .filter(r => r.n > 0)
    .sort((a, b) => b.n - a.n || b.loud - a.loud)
  return (
    <div style={E.board}>
      <p style={E.boardHead}>its favorite lines</p>
      {rows.length === 0 ? (
        <p style={E.boardEmpty}>nothing on the board yet — the first marking starts the count</p>
      ) : rows.map((r, i) => (
        <div key={r.line} style={{ ...E.boardRow, ...(i === rows.length - 1 ? { borderBottom: 'none' } : {}) }}>
          <span style={E.boardLine}>
            “{r.line}”
            {todayPicks.includes(r.line) && <span style={E.todayDot} />}
          </span>
          <span style={E.boardTally}>
            <TallyMarks n={r.n} />
            <span style={E.boardCount}>\u00d7{r.n}{r.loud > 0 ? ` \u00b7 loudest \u00d7${r.loud}` : ''}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

export default function TheExcuses({ stage = 'reflect' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [selected, setSelected] = useState([])
  const [loudest, setLoudest] = useState('')
  const [historyRows, setHistoryRows] = useState([])
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [today, rows] = await Promise.all([
        loadTodayRow('reflect_rationalization'),
        loadSignals('reflect_rationalization', 60),
      ])
      if (cancelled) return
      if (today?.payload) {
        setRowId(today.id)
        setSelected(Array.isArray(today.payload.lies) ? today.payload.lies : [])
        setLoudest(today.payload.loudest || '')
      }
      setHistoryRows(rows.map(r => r.payload).filter(Boolean))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const toggle = (l) => {
    setSelected((s) => (s.includes(l) ? s.filter((x) => x !== l) : [...s, l]))
    if (loudest === l && selected.includes(l)) setLoudest('')
  }

  const canSave = selected.length > 0
  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const payload = { lies: selected, loudest: selected.includes(loudest) ? loudest : null, date: localDateStr() }
    if (rowId) {
      await updateSignal(rowId, payload)
      setHistoryRows(h => [payload, ...h.filter(p => p.date !== payload.date)])
    } else {
      const id = await appendSignal(stage, 'reflect_rationalization', payload)
      if (id) { setRowId(id); setHistoryRows(h => [payload, ...h]) }
    }
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2200)
    setSaving(false)
  }

  // the board's arithmetic across days
  const counts = {}, loudCounts = {}
  historyRows.forEach(p => {
    ;(Array.isArray(p.lies) ? p.lies : []).forEach(l => { counts[l] = (counts[l] || 0) + 1 })
    if (p.loudest) loudCounts[p.loudest] = (loudCounts[p.loudest] || 0) + 1
  })

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        Which of these did it actually use on you — today, or the last time? Mark every one that sounds familiar. The board keeps the tally; a named line works less well each time it’s named.
      </p>
      <TallyBoard counts={counts} loudCounts={loudCounts} todayPicks={selected} />
      <p style={K.q}>Today’s markings:</p>
      <div style={K.chips}>
        {LIES.map((l) => (
          <button key={l} onClick={() => toggle(l)} style={{ ...K.chip, ...(selected.includes(l) ? K.chipOn : {}) }}>{l}</button>
        ))}
      </div>
      {selected.length > 1 && (
        <>
          <p style={K.q}>Which one was the loudest?</p>
          <div style={K.chips}>
            {selected.map((l) => (
              <button key={l} onClick={() => setLoudest(loudest === l ? '' : l)}
                style={{ ...K.chip, ...(loudest === l ? E.loudOn : {}) }}>{l}</button>
            ))}
          </div>
        </>
      )}
      <button style={{ ...K.saveBtn, ...(!canSave ? K.saveBtnDim : {}) }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'One moment…' : savedFlash ? 'Marked on the board ✓' : 'Mark the board'}
      </button>
      <ScienceFooter text="In acceptance-and-commitment work this is defusion: a thought seen as a thought — “there’s the ‘just one’ line again” — loses most of its behavioral pull. The tally speeds it up: a line that has been counted seven times starts announcing itself before it can persuade." />
    </div>
  )
}

const E = {
  board: { background: '#FDFBF6', border: '0.5px solid #E2D7C3', borderRadius: 14, padding: '12px 14px 6px', boxShadow: '0 4px 12px -6px rgba(80,50,20,0.12)' },
  boardHead: { fontSize: 9.5, color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600, margin: '0 0 8px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  boardEmpty: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#9C8C78', margin: '2px 0 10px' },
  boardRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '7px 0', borderBottom: '0.5px solid #F0E9DA' },
  boardLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#2A1F15', display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 },
  todayDot: { width: 5, height: 5, borderRadius: '50%', background: '#C9A85C', flexShrink: 0, display: 'inline-block' },
  boardTally: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  boardCount: { fontFamily: 'Georgia, serif', fontSize: 10, color: '#9C8C78', fontStyle: 'italic', whiteSpace: 'nowrap' },
  loudOn: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: '0.5px solid #241710' },
}