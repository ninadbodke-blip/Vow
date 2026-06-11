import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// TOOL: "Your vow"  (Getting ready)
// ===================================================================
// The date lives under the tree now. This is just the words — written
// to the person you'll be at 11 p.m. on a hard night, looking for
// permission. Once sealed, the vow becomes an illuminated card,
// signed and dated. Saying it differently appends; nothing is lost.
//
// Data: free_stage_signals, stage 'commit',
// signal_type 'commit_vow', payload { text } — appended, latest read.
// (Renewals in Early days append to the same thread.)
// ===================================================================

const STARTERS = [
  'I\u2019m doing this because\u2026',
  'I refuse to keep\u2026',
  'The person I\u2019m doing this for\u2026',
  'This time is different because\u2026',
]

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
      const { data: { user } } = await supabase.auth.getUser()
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
    const { data: { user } } = await supabase.auth.getUser()
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

  if (loading) return <p style={S.muted}>One moment…</p>

  if (!writing && savedVow) {
    const signed = savedAt
      ? new Date(savedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })
      : ''
    return (
      <div style={S.wrap}>
        <div style={S.vowCard}>
          <span style={S.bigQuote}>“</span>
          <p style={S.vowText}>{savedVow}</p>
          <p style={S.signed}>— sealed {signed}{count > 1 ? ` \u00B7 written ${count} times` : ''}</p>
        </div>
        <p style={S.aloud}>Read it once, out loud. It lands different in the air.</p>
        <button style={S.rewriteLink} onClick={() => { setDraft(savedVow); setWriting(true) }}>
          Say it differently
        </button>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <p style={S.intro}>
        Every attempt before this one had a reason. This one gets words. Write it to the person you’ll be at 11 p.m. on a hard night — tired, bargaining, looking for permission. Give them something to hold instead.
      </p>
      <div style={S.starters}>
        {STARTERS.map((s) => (
          <button key={s} style={S.starter} onClick={() => setDraft((d) => (d ? d : s.replace('\u2026', ' ')))}>
            {s}
          </button>
        ))}
      </div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="One honest line is enough…"
        maxLength={280}
        style={S.textarea}
        disabled={saving}
      />
      <p style={S.charCount}>{draft.length}/280</p>
      <button style={{ ...S.sealBtn, opacity: draft.trim() ? 1 : 0.45 }} disabled={!draft.trim() || saving} onClick={seal}>
        {saving ? 'Sealing\u2026' : 'Seal the vow'}
      </button>
      {savedVow && (
        <button style={S.rewriteLink} onClick={() => { setWriting(false); setDraft('') }}>
          Keep the one I have
        </button>
      )}
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 13px' },
  starters: { display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 11 },
  starter: { padding: '7px 12px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FBF7EE', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, cursor: 'pointer' },
  textarea: { width: '100%', boxSizing: 'border-box', minHeight: 96, padding: '13px 14px', borderRadius: 14, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#2A1F15', fontSize: 15, fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, resize: 'vertical', outline: 'none' },
  charCount: { fontFamily: 'Georgia, serif', fontSize: 10.5, color: '#9C8C78', textAlign: 'right', margin: '4px 0 0' },
  sealBtn: { width: '100%', marginTop: 12, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  vowCard: { position: 'relative', background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: 16, padding: '22px 20px 16px', boxShadow: '0 3px 14px rgba(120,90,40,0.07)' },
  bigQuote: { position: 'absolute', top: 6, left: 12, fontFamily: 'Georgia, serif', fontSize: 38, color: '#D9B57A', opacity: 0.55, lineHeight: 1 },
  vowText: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 17, color: '#2A1F15', lineHeight: 1.6, margin: '6px 0 0', textAlign: 'center' },
  signed: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#9C8C78', textAlign: 'right', margin: '12px 0 0' },
  aloud: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#854F0B', textAlign: 'center', margin: '13px 0 0', lineHeight: 1.5 },
  rewriteLink: { display: 'block', margin: '10px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}