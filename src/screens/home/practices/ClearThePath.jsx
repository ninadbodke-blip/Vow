import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// TOOL: "Clear the path"  (Getting ready)
// ===================================================================
// Day one shouldn't have to fight yesterday's leftovers. Six concrete
// fights, each with its reason on the card — press and hold to clear
// one, and it strikes through for good. Every hold now is a battle
// the 2 a.m. version of you never has to have.
//
// Data: free_stage_signals, stage 'commit',
// signal_type 'commit_prep' (same contract — append per move),
// payload { category, description, date, logged_at }.
// ===================================================================

const MOVES = [
  { key: 'remove',        label: 'Get it out of the house',        why: 'If it\u2019s in the house, the 2 a.m. you will find it.' },
  { key: 'contact',       label: 'Delete the contact or the app',  why: 'You can\u2019t text a number that isn\u2019t there.' },
  { key: 'tell',          label: 'Tell one person the day',        why: 'A vow witnessed is twice as heavy \u2014 in the good way.' },
  { key: 'first_evening', label: 'Plan the first evening',         why: 'The first evening is half the war. Decide it now, while you\u2019re strong.' },
  { key: 'stock',         label: 'Stock up on the alternatives',   why: 'Empty hands reach backwards. Fill the fridge, the shelf, the evening.' },
  { key: 'money',         label: 'Put the money out of easy reach', why: 'Friction beats willpower every single time.' },
]

const HOLD_MS = 1200

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function MoveCard({ label, why, cleared, onClear }) {
  const [pct, setPct] = useState(0)
  const timerRef = useRef(null)
  const stop = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (!cleared) setPct(0)
  }
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])
  const start = (e) => {
    e.preventDefault()
    if (cleared || timerRef.current) return
    timerRef.current = setInterval(() => {
      setPct((p) => {
        const next = p + 100 / (HOLD_MS / 30)
        if (next >= 100) {
          clearInterval(timerRef.current); timerRef.current = null
          onClear(); return 0
        }
        return next
      })
    }, 30)
  }
  return (
    <button
      onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
      style={{ ...S.move, ...(cleared ? S.moveOn : {}) }}
    >
      {!cleared && pct > 0 && <span style={{ ...S.moveFill, width: `${pct}%` }} />}
      <span style={S.moveText}>
        <span style={{ ...S.moveLabel, ...(cleared ? S.moveLabelOn : {}) }}>{label}</span>
        <span style={{ ...S.moveWhy, ...(cleared ? S.moveWhyOn : {}) }}>{cleared ? 'cleared' : why}</span>
      </span>
      <span style={{ ...S.moveMark, opacity: cleared ? 1 : 0 }}>✓</span>
    </button>
  )
}

export default function ClearThePath({ stage = 'commit' }) {
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState([])
  const [ownMoves, setOwnMoves] = useState([])
  const [ownText, setOwnText] = useState('')
  const [saving, setSaving] = useState(false)

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
      const doneKeys = []
      const own = []
      for (const r of data || []) {
        const c = r.payload?.category
        if (!c) continue
        if (c === 'own') { if (r.payload?.description) own.push(r.payload.description) }
        else if (!doneKeys.includes(c)) doneKeys.push(c)
      }
      setDone(doneKeys)
      setOwnMoves(own)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const log = async (category, description = null) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const now = new Date()
    const payload = { category, description, date: localDateStr(), logged_at: now.toISOString() }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'commit_prep', payload })
    return !error
  }

  const clearMove = async (key) => {
    if (done.includes(key)) return
    setDone((d) => [...d, key])
    const ok = await log(key)
    if (!ok) setDone((d) => d.filter((k) => k !== key))
  }

  const addOwn = async () => {
    const text = ownText.trim()
    if (!text || saving) return
    setSaving(true)
    const ok = await log('own', text)
    if (ok) { setOwnMoves((m) => [...m, text]); setOwnText('') }
    setSaving(false)
  }

  const clearedCount = done.filter((k) => MOVES.some((m) => m.key === k)).length
  const allClear = clearedCount === MOVES.length

  if (loading) return <p style={S.muted}>One moment…</p>

  return (
    <div style={S.wrap}>
      <p style={S.intro}>
        Day one shouldn’t have to fight yesterday’s leftovers. Each card is a fight you can win right now, while it’s easy — press and hold to clear it for good.
      </p>

      <div style={S.list}>
        {MOVES.map((m) => (
          <MoveCard key={m.key} label={m.label} why={m.why} cleared={done.includes(m.key)} onClear={() => clearMove(m.key)} />
        ))}
      </div>

      <p style={S.progress}>
        {allClear
          ? 'The path is clear. Now it\u2019s just you and the date.'
          : `${clearedCount} of ${MOVES.length} cleared \u00B7 every hold is one less fight on day one.`}
      </p>

      <p style={S.q}>Something only you would know to clear?</p>
      <div style={S.ownRow}>
        <input
          value={ownText}
          onChange={(e) => setOwnText(e.target.value)}
          placeholder="Name it, then clear it…"
          maxLength={90}
          style={S.ownInput}
          disabled={saving}
        />
        <button onClick={addOwn} disabled={!ownText.trim() || saving} style={{ ...S.ownBtn, opacity: ownText.trim() ? 1 : 0.45 }}>Clear</button>
      </div>
      {ownMoves.length > 0 && (
        <div style={S.ownList}>
          {ownMoves.map((t, i) => (
            <p key={i} style={S.ownItem}>✓ {t}</p>
          ))}
        </div>
      )}
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 13px' },
  list: { display: 'flex', flexDirection: 'column', gap: 9 },
  move: { position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '12px 14px', background: '#FDFBF6', border: '0.5px solid #E2D7C3', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' },
  moveOn: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', border: '0.5px solid #241710' },
  moveFill: { position: 'absolute', left: 0, top: 0, bottom: 0, background: 'linear-gradient(90deg, rgba(217,181,122,0.25), rgba(201,168,92,0.45))', pointerEvents: 'none', transition: 'width 0.05s linear' },
  moveText: { position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  moveLabel: { fontFamily: 'Georgia, serif', fontSize: 14, color: '#2A1F15', fontWeight: 500 },
  moveLabelOn: { color: '#FAF7F1', textDecoration: 'line-through', textDecorationColor: 'rgba(217,181,122,0.7)' },
  moveWhy: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#9C8C78', lineHeight: 1.4 },
  moveWhyOn: { color: '#D9B57A' },
  moveMark: { position: 'relative', color: '#D9B57A', fontSize: 15, transition: 'opacity 0.2s' },
  progress: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#854F0B', textAlign: 'center', margin: '13px 0 0', lineHeight: 1.5 },
  q: { fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: 14, fontWeight: 500, margin: '16px 0 8px' },
  ownRow: { display: 'flex', gap: 8 },
  ownInput: { flex: 1, boxSizing: 'border-box', padding: '11px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#2A1F15', fontSize: 13.5, fontFamily: 'Georgia, serif', fontStyle: 'italic', outline: 'none' },
  ownBtn: { padding: '11px 18px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 },
  ownList: { marginTop: 10 },
  ownItem: { fontFamily: 'Georgia, serif', fontSize: 13, color: '#2A1F15', margin: '0 0 5px', lineHeight: 1.45 },
}