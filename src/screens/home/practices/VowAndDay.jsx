// ===================================================================
// TOOL: "Your vow"  (Getting ready)
// ===================================================================
// The date lives under the tree; this is just the words — written to
// the person you'll be at 11 p.m. on a hard night, looking for
// permission. Once sealed it becomes an illuminated card: a drop
// capital in gold, double rules, signed and dated, a small seal
// pressed at the foot. Saying it differently appends; nothing is lost.
// One-time by design — a vow should be. The depth is in rereading.
//
// Data: free_stage_signals, stage 'commit', signal_type 'commit_vow'
// (unchanged), payload { text } — appended, latest read. Renewals
// (from Early days) carry { renewed: true } and are excluded from
// the "written N times" count, as before.
// ===================================================================
import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import { getUser, Steps, ScienceFooter, K, P } from './practiceKit'

const STARTERS = [
  'I\u2019m doing this because\u2026',
  'I refuse to keep\u2026',
  'The person I\u2019m doing this for\u2026',
  'This time is different because\u2026',
]

function IlluminatedVow({ text, signed, count }) {
  const trimmed = (text || '').trim()
  const capital = trimmed.charAt(0).toUpperCase()
  const rest = trimmed.slice(1)
  return (
    <div style={V.card}>
      {/* double gold rule, illuminated-manuscript style */}
      <div style={V.ruleOuter}>
        <div style={V.ruleInner}>
          <p style={V.vowText}>
            <span style={V.capital}>{capital}</span>{rest}
          </p>
          <p style={V.signed}>— sealed {signed}{count > 1 ? ` \u00B7 said ${count} ways` : ''}</p>
          {/* the seal */}
          <svg viewBox="0 0 40 40" style={{ width: 34, height: 34, display: 'block', margin: '10px auto 0' }}>
            <circle cx="20" cy="20" r="15" fill={P.deepGold} opacity="0.92" />
            <circle cx="20" cy="20" r="15" fill="none" stroke="#6B3F08" strokeWidth="1" opacity="0.5" />
            <circle cx="20" cy="20" r="11" fill="none" stroke="#F6E8C4" strokeWidth="0.7" opacity="0.55" />
            <text x="20" y="25" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" fontStyle="italic" fill="#F6E8C4">V</text>
            <path d="M 8 31 Q 12 34 16 32" fill="none" stroke={P.deepGold} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function VowAndDay({ stage = 'commit' }) {
  const [loading, setLoading] = useState(true)
  const [savedVow, setSavedVow] = useState('')
  const [savedAt, setSavedAt] = useState(null)
  const [count, setCount] = useState(0)
  const [draft, setDraft] = useState('')
  const [writing, setWriting] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const user = await getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('payload, created_at')
        .eq('user_id', user.id)
        .eq('signal_type', 'commit_vow')
        .order('created_at', { ascending: false })
        .limit(40)
      if (cancelled) return
      const rows = data || []
      const latest = rows.find((r) => r.payload?.text)
      if (latest) {
        setSavedVow(latest.payload.text)
        setSavedAt(latest.created_at)
      } else {
        setWriting(true)
      }
      setCount(rows.filter((r) => r.payload?.text && !r.payload?.renewed).length)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const seal = async () => {
    const text = draft.trim()
    if (saving || !text) return
    setSaving(true)
    const user = await getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'commit_vow', payload: { text } })
    setSaving(false)
    if (!error) {
      setSavedVow(text)
      setSavedAt(new Date().toISOString())
      setCount((n) => n + 1)
      setDraft('')
      setWriting(false)
    }
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  if (!writing && savedVow) {
    const signed = savedAt
      ? new Date(savedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })
      : ''
    return (
      <div style={K.wrap}>
        <IlluminatedVow text={savedVow} signed={signed} count={count} />
        <p style={V.readNote}>Read it slowly. Out loud, if you can — the 11 p.m. version of you will need to recognise the voice.</p>
        <button style={K.editLink} onClick={() => { setDraft(savedVow); setWriting(true) }}>Say it differently</button>
        <ScienceFooter text="A commitment written in your own words works differently from one merely intended: writing recruits deeper encoding, and values-affirmation studies show a self-authored line measurably steadies behaviour at depleted moments. This card exists to be reread, not rewritten." />
      </div>
    )
  }

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        Not a slogan — one honest line, addressed to the person you'll be at 11 p.m. on a hard night, looking for permission.
      </p>
      <Steps items={[
        'Picture that exact moment — the room, the hour, the mood.',
        'Write the one line that person needs to read.',
        'Read it back once, slowly. Then seal it.',
      ]} />
      <div style={K.chips}>
        {STARTERS.map((s) => (
          <button key={s} onClick={() => setDraft(d => (d.trim() ? d : s.replace('\u2026', ' ')))} style={K.chip}>{s}</button>
        ))}
      </div>
      <textarea
        style={V.textarea}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="In your own words…"
        rows={4}
        maxLength={280}
      />
      <button style={{ ...K.saveBtn, ...(!draft.trim() ? K.saveBtnDim : {}) }} disabled={!draft.trim() || saving} onClick={seal}>
        {saving ? 'One moment…' : 'Seal it'}
      </button>
      <ScienceFooter text="A commitment written in your own words works differently from one merely intended: writing recruits deeper encoding, and values-affirmation studies show a self-authored line measurably steadies behaviour at depleted moments. This card exists to be reread, not rewritten." />
    </div>
  )
}

const V = {
  card: { margin: '2px 0 4px' },
  ruleOuter: {
    background: 'linear-gradient(180deg, #FCF7EA 0%, #F6EEDA 100%)',
    border: '1px solid #C9A85C', borderRadius: 14, padding: 5,
    boxShadow: '0 8px 22px -10px rgba(133,79,11,0.28)',
  },
  ruleInner: {
    border: '0.5px solid rgba(201,168,92,0.55)', borderRadius: 10,
    padding: '18px 18px 16px', textAlign: 'center',
  },
  capital: {
    fontFamily: 'Georgia, serif', fontSize: 34, color: '#854F0B',
    lineHeight: 0.9, paddingRight: 2, fontStyle: 'normal', fontWeight: 500,
  },
  vowText: {
    fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 16.5,
    color: '#2A1F15', lineHeight: 1.65, margin: 0, textAlign: 'left',
  },
  signed: {
    fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5,
    color: '#854F0B', margin: '12px 0 0', textAlign: 'right',
  },
  readNote: {
    fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12,
    color: '#6B5C4A', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.55,
  },
  textarea: {
    width: '100%', boxSizing: 'border-box', marginTop: 10, padding: '13px 14px',
    borderRadius: 13, border: '0.5px solid #E2D7C3', background: '#FDFBF6',
    fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14.5,
    color: '#2A1F15', outline: 'none', resize: 'vertical', lineHeight: 1.6,
  },
}