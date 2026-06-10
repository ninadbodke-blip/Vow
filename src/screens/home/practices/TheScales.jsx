import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "The scales"  (Weighing it up)
// ===================================================================
// One slider, both ends honest: "staying as I am" ↔ "changing this".
// The user weighs in, adds one word for why, and over time sees the
// lean of their own last few weigh-ins — their data, not our opinion.
//
// Data: free_stage_signals, stage 'reflect',
// signal_type 'reflect_lean', payload { lean (0–100), word, date }.
// One row per day (today's row updates in place); trend reads last 5.
// ===================================================================

const WORDS = ['Tired', 'Curious', 'Scared', 'Ready', 'Stuck', 'Hopeful', 'Torn']

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function TheScales({ stage = 'reflect' }) {
  const [loading, setLoading] = useState(true)
  const [todayRowId, setTodayRowId] = useState(null)
  const [lean, setLean] = useState(50)
  const [word, setWord] = useState('')
  const [history, setHistory] = useState([])
  const [savedToday, setSavedToday] = useState(false)
  const [editing, setEditing] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('id, payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'reflect_lean')
        .order('created_at', { ascending: false })
        .limit(6)
      if (cancelled) return
      const rows = (data || []).filter((r) => r.payload && r.payload.lean != null)
      setHistory(rows.map((r) => r.payload))
      const today = localDateStr()
      const todays = rows.find((r) => r.payload.date === today)
      if (todays) {
        setTodayRowId(todays.id)
        setLean(Number(todays.payload.lean))
        setWord(todays.payload.word || '')
        setSavedToday(true)
        setEditing(false)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { lean, word: word || null, date: localDateStr() }
    if (todayRowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', todayRowId)
      if (!error) { setSavedToday(true); setEditing(false) }
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'reflect_lean', payload })
        .select('id').single()
      if (!error && data) {
        setTodayRowId(data.id)
        setHistory((h) => [payload, ...h])
        setSavedToday(true)
        setEditing(false)
      }
    }
    setSaving(false)
  }

  const leanText = lean > 55 ? 'toward changing this' : lean < 45 ? 'toward staying as you are' : 'right in the middle'
  const changeCount = history.slice(0, 5).filter((p) => Number(p.lean) > 55).length
  const weighIns = Math.min(history.length, 5)

  if (loading) return <p style={S.muted}>One moment…</p>

  if (savedToday && !editing) {
    return (
      <div style={S.wrap}>
        <p style={S.intro}>Weighed in for today. The scales will be here tomorrow — they usually move.</p>
        <div style={S.savedCard}>
          <ScaleBar lean={lean} />
          <p style={S.savedLine}>You lean {leanText}{word ? ` — feeling ${word.toLowerCase()}` : ''}.</p>
          {weighIns >= 3 && (
            <p style={S.trend}>{changeCount} of your last {weighIns} weigh-ins leaned toward change.</p>
          )}
        </div>
        <button style={S.editLink} onClick={() => setEditing(true)}>Weigh again</button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>No right answer. Just where you honestly are, today only.</p>

      <ScaleBar lean={lean} />
      <input
        type="range" min="0" max="100" value={lean}
        onChange={(e) => setLean(Number(e.target.value))}
        style={S.range}
      />
      <div style={S.endLabels}>
        <span style={S.endLabel}>Staying as I am</span>
        <span style={S.endLabel}>Changing this</span>
      </div>

      <p style={S.q}>One word for today?</p>
      <div style={S.chips}>
        {WORDS.map((w) => (
          <button key={w} onClick={() => setWord(word === w ? '' : w)} style={{ ...S.chip, ...(word === w ? S.chipOn : {}) }}>{w}</button>
        ))}
      </div>

      <button style={S.saveBtn} disabled={saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Weigh in'}
      </button>
    </div>
  )
}

function ScaleBar({ lean }) {
  return (
    <div style={S.barWrap}>
      <div style={S.barTrack}>
        <div style={{ ...S.barFill, width: `${lean}%` }} />
        <div style={{ ...S.barThumb, left: `calc(${lean}% - 9px)` }} />
      </div>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 16px' },
  q: { fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: 14.5, fontWeight: 500, margin: '16px 0 8px' },
  barWrap: { padding: '6px 2px 2px' },
  barTrack: { position: 'relative', height: 10, borderRadius: 999, background: 'linear-gradient(90deg, #EDE6D6 0%, #E4D9BF 100%)', border: '0.5px solid #E2D7C3' },
  barFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999, background: 'linear-gradient(90deg, #D9C9A4 0%, #C9A85C 100%)', opacity: 0.85 },
  barThumb: { position: 'absolute', top: -5, width: 18, height: 18, borderRadius: '50%', background: '#FAF7F1', border: '1.5px solid #854F0B', boxShadow: '0 1px 5px rgba(60,40,20,0.25)' },
  range: { width: '100%', marginTop: 10, accentColor: '#854F0B' },
  endLabels: { display: 'flex', justifyContent: 'space-between', marginTop: 4 },
  endLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#9C8C78' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: { padding: '8px 12px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 12.5, cursor: 'pointer' },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },
  saveBtn: { width: '100%', marginTop: 18, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  savedCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '16px 15px' },
  savedLine: { fontFamily: 'Georgia, serif', fontSize: 14.5, color: '#2A1F15', margin: '12px 0 0', textAlign: 'center' },
  trend: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#854F0B', margin: '8px 0 0', textAlign: 'center' },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}