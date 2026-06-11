import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "Renew your vow"  (Early days)
// ===================================================================
// The vow was written once. Here it is kept: press and hold the seal,
// a gold ring closes around your thumb, and the same words are said
// again for today. You can also say it in new words — both count.
//
// Data: free_stage_signals, signal_type 'commit_vow' (unchanged),
// payload { text } for the original and { text, renewed: true, date }
// for each renewal — appended, same as before.
// ===================================================================

const HOLD_MS = 1100

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function RenewYourVow({ stage = 'endure' }) {
  const [loading, setLoading] = useState(true)
  const [vowText, setVowText] = useState('')
  const [draft, setDraft] = useState('')
  const [rewriting, setRewriting] = useState(false)
  const [renewals, setRenewals] = useState(0)
  const [renewedToday, setRenewedToday] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pct, setPct] = useState(0)
  const holdRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'commit_vow')
        .order('created_at', { ascending: false })
        .limit(60)
      if (cancelled) return
      const rows = data || []
      const latest = rows.find((r) => r.payload?.text)
      if (latest) setVowText(latest.payload.text)
      setRenewals(rows.filter((r) => r.payload?.renewed).length)
      setRenewedToday(rows.some((r) => r.payload?.renewed && r.payload?.date === localDateStr()))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => () => { if (holdRef.current) clearInterval(holdRef.current) }, [])

  const saveRenewal = async (text) => {
    if (saving) return false
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return false }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'commit_vow', payload: { text, renewed: true, date: localDateStr() } })
    setSaving(false)
    if (error) return false
    setVowText(text)
    setRenewals((n) => n + 1)
    setRenewedToday(true)
    return true
  }

  const startHold = (e) => {
    e.preventDefault()
    if (saving || renewedToday || holdRef.current) return
    holdRef.current = setInterval(() => {
      setPct((p) => {
        const next = p + (100 / (HOLD_MS / 33))
        if (next >= 100) {
          clearInterval(holdRef.current)
          holdRef.current = null
          saveRenewal(vowText)
          return 100
        }
        return next
      })
    }, 33)
  }

  const endHold = () => {
    if (holdRef.current) { clearInterval(holdRef.current); holdRef.current = null }
    setPct((p) => (p >= 100 ? p : 0))
  }

  const keepNewWords = async () => {
    const text = draft.trim()
    if (!text) return
    const ok = await saveRenewal(text)
    if (ok) { setRewriting(false); setDraft('') }
  }

  const writeFirst = async () => {
    if (saving || !draft.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'commit_vow', payload: { text: draft.trim() } })
    if (!error) { setVowText(draft.trim()); setDraft('') }
    setSaving(false)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  // ---- no vow yet: write the first line right here ----
  if (!vowText) {
    return (
      <div style={S.wrap}>
        <p style={S.intro}>There’s no vow written yet. One honest line, in your own voice — the reason that is really yours.</p>
        <textarea style={S.textarea} value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} maxLength={240}
          placeholder="Say it the way you’d say it out loud…" />
        <button style={{ ...S.saveBtn, opacity: draft.trim() ? 1 : 0.45 }} disabled={!draft.trim() || saving} onClick={writeFirst}>
          {saving ? 'Saving…' : 'Set it down'}
        </button>
      </div>
    )
  }

  // ---- rewriting: say it in new words ----
  if (rewriting) {
    return (
      <div style={S.wrap}>
        <p style={S.intro}>Same promise, new words. Say it the way it feels today.</p>
        <textarea style={S.textarea} value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} maxLength={240} />
        <button style={{ ...S.saveBtn, opacity: draft.trim() ? 1 : 0.45 }} disabled={!draft.trim() || saving} onClick={keepNewWords}>
          {saving ? 'Saving…' : 'Keep these words'}
        </button>
        <button style={S.ghostLink} onClick={() => { setRewriting(false); setDraft('') }}>Never mind</button>
      </div>
    )
  }

  const ringBg = `conic-gradient(#D9B57A ${Math.min(pct, 100) * 3.6}deg, rgba(217,181,122,0.18) 0deg)`

  return (
    <div style={{ ...S.wrap, textAlign: 'center' }}>
      <div style={S.vowCard}>
        <span style={S.quoteMark}>“</span>
        <p style={S.vowText}>{vowText}</p>
      </div>

      {renewedToday ? (
        <>
          <div style={S.sealDone}>
            <span style={S.sealDot} />
            <p style={S.sealedLine}>Renewed for today.</p>
          </div>
          <p style={S.countLine}>
            {renewals === 1 ? 'That was the first renewal.' : `You’ve renewed it ${renewals} times.`}
          </p>
          <p style={S.softLine}>Same words tomorrow — or new ones. Both count.</p>
        </>
      ) : (
        <>
          <div
            style={{ ...S.ring, background: ringBg }}
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div style={S.ringInner}>
              <span style={S.ringWord}>{pct > 0 ? 'Hold…' : 'Hold'}</span>
              <span style={S.ringSub}>to renew</span>
            </div>
          </div>
          <p style={S.holdHint}>Press and hold the seal — say the words to yourself while it fills.</p>
          {renewals > 0 && <p style={S.countLine}>Renewed {renewals} {renewals === 1 ? 'time' : 'times'} so far.</p>}
        </>
      )}

      <button style={S.ghostLink} onClick={() => { setDraft(vowText); setRewriting(true) }}>Say it in new words</button>
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 12px' },
  textarea: { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#2A1F15', fontSize: 14, fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, resize: 'vertical', outline: 'none' },
  saveBtn: { width: '100%', marginTop: 12, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  vowCard: { position: 'relative', background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: 14, padding: '18px 18px 16px', marginBottom: 16, textAlign: 'left' },
  quoteMark: { position: 'absolute', top: 2, left: 10, fontFamily: 'Georgia, serif', fontSize: 34, color: '#D9B57A', lineHeight: 1 },
  vowText: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15.5, color: '#2A1F15', lineHeight: 1.6, margin: 0, paddingLeft: 14 },
  ring: { width: 132, height: 132, borderRadius: '50%', margin: '4px auto 0', padding: 5, boxSizing: 'border-box', cursor: 'pointer', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' },
  ringInner: { width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%, #4A372A 0%, #3A2A1C 55%, #241710 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' },
  ringWord: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 17, color: '#F5EBDA' },
  ringSub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11, color: 'rgba(245,235,218,0.55)' },
  holdHint: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#9C8C78', margin: '12px auto 0', maxWidth: 250, lineHeight: 1.5 },
  sealDone: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  sealDot: { width: 12, height: 12, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #E8C48A, #C9A85C 70%)', boxShadow: '0 0 10px rgba(217,181,122,0.6)' },
  sealedLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15, color: '#2A1F15', margin: 0 },
  countLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#854F0B', margin: '10px 0 0' },
  softLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#9C8C78', margin: '6px 0 0' },
  ghostLink: { display: 'block', margin: '14px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
}