import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "Clear the path"  (Getting ready)
// ===================================================================
// Small concrete moves made *before* day one, so day one asks less.
// Each completed move is appended as its own row — same contract the
// old home used — so this is a log of preparation, not a checklist
// that can be quietly unchecked.
//
// Data: free_stage_signals, stage 'commit',
// signal_type 'commit_prep' (append per move),
// payload { category, description, date, logged_at }.
// ===================================================================

const MOVES = [
  { key: 'remove',        label: 'Get it out of the house' },
  { key: 'contact',       label: 'Delete the contact or the app' },
  { key: 'tell',          label: 'Tell one person the day' },
  { key: 'first_evening', label: 'Plan the first evening' },
  { key: 'stock',         label: 'Stock up on the alternatives' },
  { key: 'money',         label: 'Put the money out of easy reach' },
]

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function ClearThePath({ stage = 'commit' }) {
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState([])          // categories already logged
  const [ownMoves, setOwnMoves] = useState([])  // descriptions of 'own' rows
  const [ownText, setOwnText] = useState('')
  const [busyKey, setBusyKey] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'commit_prep')
        .order('created_at', { ascending: true })
      if (cancelled) return
      const cats = []
      const own = []
      for (const r of data || []) {
        const c = r.payload?.category
        if (!c) continue
        if (c === 'own') { if (r.payload?.description) own.push(r.payload.description) }
        else if (!cats.includes(c)) cats.push(c)
      }
      setDone(cats)
      setOwnMoves(own)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const logMove = async (category, description) => {
    if (busyKey) return
    setBusyKey(category)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setBusyKey(null); return }
    const now = new Date()
    const payload = { category, description: (description || '').trim() || null, date: localDateStr(), logged_at: now.toISOString() }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'commit_prep', payload })
    if (!error) {
      if (category === 'own') { setOwnMoves((m) => [...m, payload.description]); setOwnText('') }
      else setDone((d) => [...d, category])
    }
    setBusyKey(null)
  }

  const total = MOVES.length
  const cleared = done.length

  if (loading) return <p style={S.muted}>One moment…</p>

  return (
    <div style={S.wrap}>
      <p style={S.intro}>
        None of these change your mind — they change your odds. Tap a move once it’s actually done.
      </p>

      <div style={S.list}>
        {MOVES.map((m) => {
          const isDone = done.includes(m.key)
          return (
            <button
              key={m.key}
              disabled={isDone || busyKey === m.key}
              onClick={() => logMove(m.key, m.label)}
              style={{ ...S.move, ...(isDone ? S.moveDone : {}) }}
            >
              <span style={{ ...S.tick, ...(isDone ? S.tickOn : {}) }}>{isDone ? '✓' : ''}</span>
              <span style={{ ...S.moveLabel, ...(isDone ? S.moveLabelDone : {}) }}>{m.label}</span>
            </button>
          )
        })}
      </div>

      {ownMoves.map((d, i) => (
        <div key={i} style={{ ...S.move, ...S.moveDone, cursor: 'default' }}>
          <span style={{ ...S.tick, ...S.tickOn }}>✓</span>
          <span style={{ ...S.moveLabel, ...S.moveLabelDone }}>{d}</span>
        </div>
      ))}

      <div style={S.ownRow}>
        <input
          style={S.ownInput}
          value={ownText}
          onChange={(e) => setOwnText(e.target.value)}
          placeholder="A move of your own, once it’s done…"
          maxLength={80}
        />
        <button
          style={{ ...S.ownAdd, opacity: ownText.trim() ? 1 : 0.45 }}
          disabled={!ownText.trim() || busyKey === 'own'}
          onClick={() => logMove('own', ownText)}
        >
          Log it
        </button>
      </div>

      <p style={S.progress}>
        {cleared === 0 && ownMoves.length === 0
          ? 'Nothing cleared yet — and no rush. Day one will thank you for any of these.'
          : `${cleared + ownMoves.length} ${cleared + ownMoves.length === 1 ? 'move' : 'moves'} cleared. Each one makes day one lighter.`}
      </p>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 14px' },
  list: { display: 'flex', flexDirection: 'column', gap: 7 },
  move: { display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', padding: '11px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FDFBF6', cursor: 'pointer', marginTop: 0 },
  moveDone: { background: '#F2EFE3', border: '0.5px solid #DCD4BE' },
  tick: { width: 20, height: 20, borderRadius: '50%', border: '1px solid #C9BFA8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#5F8A4E', flexShrink: 0, background: '#FFFFFF' },
  tickOn: { border: '1px solid #5F8A4E', background: '#EFF3E8' },
  moveLabel: { fontFamily: 'Georgia, serif', fontSize: 13.5, color: '#2A1F15' },
  moveLabelDone: { color: '#9C8C78', textDecoration: 'line-through', textDecorationColor: 'rgba(156,140,120,0.5)' },
  ownRow: { display: 'flex', gap: 8, marginTop: 10 },
  ownInput: { flex: 1, boxSizing: 'border-box', padding: '11px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: 13, color: '#2A1F15', outline: 'none' },
  ownAdd: { padding: '0 16px', borderRadius: 12, border: 'none', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  progress: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#854F0B', margin: '14px 0 0', textAlign: 'center', lineHeight: 1.5 },
}