import { useState } from 'react'
import { supabase } from '../../supabaseClient'

// ===================================================================
// JAR COUNTER — the filling-jars clock, dark and golden.
// ===================================================================
// Six jars (years · months · days over hours · mins · secs), each a
// dark vessel filling with gold toward its next unit — the seconds
// jar rises smoothly on a fast tick. Same decomposition math as the
// old hero (365/30 split; the days jar fills against the real length
// of the current month). "Since … · change" opens a small panel to
// correct the start date — it updates the tracker and tells the home.
// ===================================================================

function Jar({ n, u, fill, accent, hideIfZero }) {
  const hidden = hideIfZero && (!n || n === 0 || n === '00')
  return (
    <div style={S.jar}>
      {!hidden && (
        <div style={{
          ...S.fill,
          height: `${Math.min(fill || 0, 100)}%`,
          background: accent
            ? 'linear-gradient(180deg, rgba(232,196,138,0.30) 0%, rgba(217,151,80,0.62) 100%)'
            : 'linear-gradient(180deg, rgba(217,181,122,0.16) 0%, rgba(201,168,92,0.50) 100%)',
        }} />
      )}
      <div style={S.content}>
        {hidden ? (
          <p style={{ ...S.u, marginTop: 10 }}>—</p>
        ) : (
          <>
            <p style={{ ...S.n, ...(accent ? S.nAccent : {}) }}>{n}</p>
            <p style={S.u}>{u}</p>
          </>
        )}
      </div>
    </div>
  )
}

const toInputValue = (d) => {
  const p = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function JarCounter({ startISO, trackerId = null, onStartChanged = null }) {
  const [, setTick] = useState(0)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  // fast tick so the seconds jar fills smoothly
  useState(() => {
    const id = setInterval(() => setTick((t) => t + 1), 250)
    return () => clearInterval(id)
  })

  if (!startISO) return null
  const startDate = new Date(startISO)
  const now = new Date()
  let total = Math.floor((now - startDate) / 1000)
  if (total < 0) total = 0
  const secs = total % 60; total = Math.floor(total / 60)
  const mins = total % 60; total = Math.floor(total / 60)
  const hours = total % 24; total = Math.floor(total / 24)
  const totalDays = total
  const years = Math.floor(totalDays / 365)
  const remAfterY = totalDays - years * 365
  const months = Math.floor(remAfterY / 30)
  const days = remAfterY - months * 30

  const pad = (n) => String(n).padStart(2, '0')
  const ms = now.getMilliseconds()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const yFill = (years / 10) * 100
  const moFill = (months / 12) * 100
  const dFill = (days / daysInMonth) * 100
  const hFill = (hours / 24) * 100
  const miFill = (mins / 60) * 100
  const sFill = ((secs * 1000 + ms) / 60000) * 100

  const sinceStr = startDate.toLocaleString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const openEdit = () => { setDraft(toInputValue(startDate)); setErr(''); setEditing(true) }

  const saveEdit = async () => {
    if (saving) return
    const d = new Date(draft)
    if (isNaN(d.getTime())) { setErr('That date didn’t read right — try again.'); return }
    if (d.getTime() > Date.now()) { setErr('Pick a time in the past.'); return }
    setSaving(true)
    const iso = d.toISOString()
    const { error } = await supabase.from('trackers').update({ start_date: iso }).eq('id', trackerId)
    setSaving(false)
    if (error) { setErr('Could not save. Please try again.'); return }
    setEditing(false)
    if (onStartChanged) onStartChanged(iso)
  }

  return (
    <div style={S.wrap}>
      <div style={S.grid}>
        <Jar n={years} u={years === 1 ? 'year' : 'years'} fill={yFill} hideIfZero />
        <Jar n={months} u="months" fill={moFill} />
        <Jar n={days} u="days" fill={dFill} />
        <Jar n={pad(hours)} u="hours" fill={hFill} />
        <Jar n={pad(mins)} u="mins" fill={miFill} />
        <Jar n={pad(secs)} u="secs" fill={sFill} accent />
      </div>

      {!editing ? (
        <p style={S.since}>
          Since {sinceStr}
          {trackerId && (
            <>
              {' · '}
              <button style={S.changeLink} onClick={openEdit}>change</button>
            </>
          )}
        </p>
      ) : (
        <div style={S.editPanel}>
          <p style={S.editLabel}>When did this start?</p>
          <input
            type="datetime-local"
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setErr('') }}
            style={S.editInput}
            max={toInputValue(new Date())}
          />
          {err && <p style={S.editErr}>{err}</p>}
          <div style={S.editRow}>
            <button style={S.editCancel} onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
            <button style={S.editSave} onClick={saveEdit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

const S = {
  wrap: { margin: '10px auto 0', maxWidth: 320 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 },
  jar: {
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    border: '0.5px solid rgba(217,181,122,0.38)', borderRadius: 12,
    padding: '9px 3px 8px', textAlign: 'center', minHeight: 46,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 10px -4px rgba(20,10,4,0.45)',
  },
  fill: { position: 'absolute', bottom: 0, left: 0, right: 0, transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1)', pointerEvents: 'none', zIndex: 0 },
  content: { position: 'relative', zIndex: 1 },
  n: { fontSize: 18, fontWeight: 500, color: '#F5EBDA', lineHeight: 1, margin: 0, fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums' },
  nAccent: { color: '#E8C48A' },
  u: { fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(245,235,218,0.5)', margin: '4px 0 0' },
  since: { fontSize: 11, color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '7px 0 0' },
  changeLink: { background: 'transparent', border: 'none', padding: 0, color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11, textDecoration: 'underline', cursor: 'pointer', pointerEvents: 'auto' },
  editPanel: { marginTop: 8, background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: 12, padding: '10px 12px', pointerEvents: 'auto' },
  editLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#6B5C4A', margin: '0 0 6px', textAlign: 'center' },
  editInput: { width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 9, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#2A1F15', fontSize: 13, fontFamily: 'inherit' },
  editErr: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#A8431F', margin: '6px 0 0', textAlign: 'center' },
  editRow: { display: 'flex', gap: 8, marginTop: 8 },
  editCancel: { flex: 1, padding: '8px', background: 'transparent', border: '0.5px solid #E2D7C3', borderRadius: 9, color: '#6B5C4A', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit' },
  editSave: { flex: 1, padding: '8px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', border: 'none', borderRadius: 9, color: '#FAF7F1', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit' },
}