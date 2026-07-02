// ===================================================================
// TOOL: "Renew your vow"  (Early days)
// ===================================================================
// The vow was written once; here it is kept. Press and hold — a gold
// ring closes, and the seal stamps for today. Every past renewal
// stands in a row of small seals beneath the words. You can also say
// it in new words; both count, nothing is lost.
//
// Data: free_stage_signals, signal_type 'commit_vow' (unchanged),
// payload { text } for the original and { text, renewed: true, date }
// for each renewal — appended, exactly as before.
// ===================================================================
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../supabaseClient'
import { localDateStr, getUser, ScienceFooter, K, P } from './practiceKit'

const HOLD_MS = 1100

function SealRow({ dates }) {
  const shown = dates.slice(0, 14)
  if (shown.length === 0) return null
  return (
    <div style={R.sealRow}>
      {shown.map((d, i) => (
        <svg key={i} viewBox="0 0 20 20" style={{ width: 15, height: 15 }}>
          <circle cx="10" cy="10" r="8" fill={P.deepGold} opacity={Math.max(0.35, 0.95 - i * 0.05)} />
          <circle cx="10" cy="10" r="5.4" fill="none" stroke="#F6E8C4" strokeWidth="0.6" opacity="0.6" />
          <text x="10" y="13.2" textAnchor="middle" fontFamily="Georgia, serif" fontSize="7.5" fontStyle="italic" fill="#F6E8C4">V</text>
        </svg>
      ))}
      {dates.length > 14 && <span style={R.sealMore}>+{dates.length - 14}</span>}
    </div>
  )
}

export default function RenewYourVow({ stage = 'endure' }) {
  const [loading, setLoading] = useState(true)
  const [vowText, setVowText] = useState('')
  const [draft, setDraft] = useState('')
  const [rewriting, setRewriting] = useState(false)
  const [renewals, setRenewals] = useState(0)
  const [renewalDates, setRenewalDates] = useState([])
  const [renewedToday, setRenewedToday] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pct, setPct] = useState(0)
  const holdRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const user = await getUser()
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
      const renewed = rows.filter((r) => r.payload?.renewed)
      setRenewals(renewed.length)
      setRenewalDates(renewed.map((r) => r.payload?.date).filter(Boolean))
      setRenewedToday(renewed.some((r) => r.payload?.date === localDateStr()))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => () => { if (holdRef.current) clearInterval(holdRef.current) }, [])

  const saveRenewal = async (text) => {
    if (saving) return false
    setSaving(true)
    const user = await getUser()
    if (!user) { setSaving(false); return false }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'commit_vow', payload: { text, renewed: true, date: localDateStr() } })
    setSaving(false)
    if (error) return false
    setVowText(text)
    setRenewals((n) => n + 1)
    setRenewalDates((d) => [localDateStr(), ...d])
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
    const user = await getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'commit_vow', payload: { text: draft.trim() } })
    setSaving(false)
    if (!error) { setVowText(draft.trim()); setDraft('') }
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  // ---- no vow yet: write the first line right here ----
  if (!vowText) {
    return (
      <div style={K.wrap}>
        <p style={K.intro}>There’s no vow written yet. One honest line, in your own voice — the reason that is really yours.</p>
        <textarea style={R.textarea} value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} maxLength={240}
          placeholder="Say it the way you’d say it out loud…" />
        <button style={{ ...K.saveBtn, ...(!draft.trim() ? K.saveBtnDim : {}) }} disabled={!draft.trim() || saving} onClick={writeFirst}>
          {saving ? 'One moment…' : 'Set it down'}
        </button>
      </div>
    )
  }

  // ---- rewriting: say it in new words ----
  if (rewriting) {
    return (
      <div style={K.wrap}>
        <p style={K.intro}>Same promise, new words. Say it the way it feels today.</p>
        <textarea style={R.textarea} value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} maxLength={240} />
        <button style={{ ...K.saveBtn, ...(!draft.trim() ? K.saveBtnDim : {}) }} disabled={!draft.trim() || saving} onClick={keepNewWords}>
          {saving ? 'One moment…' : 'Keep these words'}
        </button>
        <button style={K.editLink} onClick={() => { setRewriting(false); setDraft('') }}>Never mind</button>
      </div>
    )
  }

  const ringBg = `conic-gradient(#D9B57A ${Math.min(pct, 100) * 3.6}deg, rgba(217,181,122,0.18) 0deg)`

  return (
    <div style={{ ...K.wrap, textAlign: 'center' }}>
      <div style={R.vowCard}>
        <span style={R.quoteMark}>“</span>
        <p style={R.vowText}>{vowText}</p>
      </div>

      {renewedToday ? (
        <>
          <svg viewBox="0 0 60 60" style={{ width: 54, height: 54, display: 'block', margin: '14px auto 4px' }}>
            <circle cx="30" cy="30" r="22" fill={P.deepGold} opacity="0.92" />
            <circle cx="30" cy="30" r="22" fill="none" stroke="#6B3F08" strokeWidth="1.2" opacity="0.5" />
            <circle cx="30" cy="30" r="16" fill="none" stroke="#F6E8C4" strokeWidth="0.9" opacity="0.55" />
            <text x="30" y="37" textAnchor="middle" fontFamily="Georgia, serif" fontSize="18" fontStyle="italic" fill="#F6E8C4">V</text>
          </svg>
          <p style={R.sealedLine}>Renewed for today.</p>
          <p style={R.countLine}>
            {renewals === 1 ? 'That was the first renewal.' : `Said and kept, ${renewals} times now.`}
          </p>
          <SealRow dates={renewalDates} />
          <p style={R.softLine}>Same words tomorrow — or new ones. Both count.</p>
        </>
      ) : (
        <>
          <div
            style={{ ...R.ring, background: ringBg }}
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div style={R.ringInner}>
              <span style={R.ringV}>V</span>
              <span style={R.ringHint}>{pct > 0 ? 'keep holding…' : 'press and hold'}</span>
            </div>
          </div>
          <p style={R.softLine}>Hold the seal, and say the words to yourself as it closes.</p>
          {renewalDates.length > 0 && <SealRow dates={renewalDates} />}
        </>
      )}

      <button style={K.editLink} onClick={() => { setDraft(vowText); setRewriting(true) }}>Say it in new words</button>
      <ScienceFooter text="Re-commitment works by retrieval: each renewal re-activates the original reason and re-encodes it against today's context, which is how a promise stays load-bearing instead of becoming wallpaper. The small ritual — hold, say it, seal — gives the memory a motor anchor." />
    </div>
  )
}

const R = {
  vowCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '16px 16px 14px', textAlign: 'left', position: 'relative' },
  quoteMark: { position: 'absolute', top: 4, left: 10, fontFamily: 'Georgia, serif', fontSize: 30, color: '#C9A85C', opacity: 0.5 },
  vowText: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15.5, color: '#2A1F15', lineHeight: 1.6, margin: '0 0 0 16px' },
  ring: { width: 96, height: 96, borderRadius: '50%', margin: '16px auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', boxShadow: '0 6px 16px -6px rgba(133,79,11,0.35)' },
  ringInner: { width: 78, height: 78, borderRadius: '50%', background: 'linear-gradient(180deg, #FCF7EA 0%, #F4ECDD 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 },
  ringV: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 24, color: '#854F0B', lineHeight: 1 },
  ringHint: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 8.5, color: '#9C8C78' },
  sealedLine: { fontFamily: 'Georgia, serif', fontSize: 14.5, color: '#2A1F15', margin: '2px 0 0' },
  countLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#854F0B', margin: '4px 0 0' },
  softLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#9C8C78', margin: '8px 0 0' },
  sealRow: { display: 'flex', gap: 5, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 10 },
  sealMore: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10, color: '#9C8C78' },
  textarea: { width: '100%', boxSizing: 'border-box', marginTop: 8, padding: '13px 14px', borderRadius: 13, border: '0.5px solid #E2D7C3', background: '#FDFBF6', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14.5, color: '#2A1F15', outline: 'none', resize: 'vertical', lineHeight: 1.6 },
}