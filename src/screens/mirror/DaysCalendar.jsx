import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

// =====================================================================
// THE BOOK OF DAYS — a gentle month calendar of the record.
// =====================================================================
// One square per day:
//   · quiet green      — a day inside the record with nothing logged
//   · gold             — an urge was met and logged that day
//   · clay             — a slip was weathered that day (a small gold dot
//                        joins it if urges were also logged)
//   · faint            — before the record began, or still to come
// Reads the SAME truth the history screens read — streak_history for
// slips (ended_at) and urge_logs for urges (created_at) — so the three
// views can never disagree. Read-only: this component writes nothing.
// Presented as a floating card over the Mirror; tap outside to close.
// =====================================================================

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const dstr = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
const monthKey = (y, m) => y * 12 + m

export default function DaysCalendar({ open, onClose }) {
  const [loading, setLoading] = useState(true)
  const [slipDays, setSlipDays] = useState(new Set())
  const [urgeDays, setUrgeDays] = useState(new Map()) // date -> count
  const [recordStart, setRecordStart] = useState(null) // Date
  const [view, setView] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() } })
  const [selected, setSelected] = useState(null) // date string

  useEffect(() => {
    if (!open) return
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) { setLoading(false); return }

      const [{ data: trackers }, { data: slips }, { data: urges }] = await Promise.all([
        supabase.from('trackers').select('start_date, created_at').eq('user_id', user.id).order('created_at').limit(1),
        supabase.from('streak_history').select('ended_at').eq('user_id', user.id),
        supabase.from('urge_logs').select('created_at').eq('user_id', user.id),
      ])
      if (cancelled) return

      const sd = new Set((slips || []).filter(r => r.ended_at).map(r => dstr(r.ended_at)))
      const ud = new Map()
      ;(urges || []).forEach(r => { const k = dstr(r.created_at); ud.set(k, (ud.get(k) || 0) + 1) })

      // The record begins at the earliest thing we know about — the first
      // tracker, the first urge, or the first slip. Days before it are
      // simply outside the story, not "clean".
      const candidates = []
      if (trackers && trackers[0]) candidates.push(new Date(trackers[0].created_at || trackers[0].start_date))
      ;(slips || []).forEach(r => r.ended_at && candidates.push(new Date(r.ended_at)))
      ;(urges || []).forEach(r => candidates.push(new Date(r.created_at)))
      const start = candidates.length ? new Date(Math.min(...candidates.map(d => d.getTime()))) : null

      setSlipDays(sd)
      setUrgeDays(ud)
      setRecordStart(start)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [open])

  if (!open) return null

  const now = new Date()
  const todayStr = dstr(now)
  const minKey = recordStart ? monthKey(recordStart.getFullYear(), recordStart.getMonth()) : monthKey(now.getFullYear(), now.getMonth())
  const maxKey = monthKey(now.getFullYear(), now.getMonth())
  const curKey = monthKey(view.y, view.m)

  const shift = (delta) => {
    const k = curKey + delta
    if (k < minKey || k > maxKey) return
    setView({ y: Math.floor(k / 12), m: k % 12 })
    setSelected(null)
  }

  // Build the month grid, Monday-first.
  const first = new Date(view.y, view.m, 1)
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7 // 0 = Monday
  const cells = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const startStr = recordStart ? dstr(recordStart) : null

  const cellState = (d) => {
    const ds = `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (ds > todayStr || !startStr || ds < startStr) return { kind: 'outside', ds }
    if (slipDays.has(ds)) return { kind: 'slip', ds, urges: urgeDays.get(ds) || 0 }
    if (urgeDays.has(ds)) return { kind: 'urge', ds, urges: urgeDays.get(ds) }
    return { kind: 'quiet', ds }
  }

  // The selected day's story, straight from the sets (month-independent).
  const sel = !selected ? null
    : slipDays.has(selected) ? { kind: 'slip', urges: urgeDays.get(selected) || 0 }
    : urgeDays.has(selected) ? { kind: 'urge', urges: urgeDays.get(selected) }
    : { kind: 'quiet' }

  const selLine = !selected ? null
    : sel.kind === 'slip'
      ? `A slip, weathered${sel.urges ? ` — and ${sel.urges} ${sel.urges === 1 ? 'urge' : 'urges'} met that day too` : ''}. The record kept going.`
      : sel.kind === 'urge'
        ? `${sel.urges} ${sel.urges === 1 ? 'urge' : 'urges'} met and ridden out. That's the work, done.`
        : 'A quiet day. Nothing needed logging.'

  return (
    <div style={C.overlay} onClick={onClose}>
      <div style={C.card} onClick={(e) => e.stopPropagation()}>
        <p style={C.eyebrow}>Day by day</p>
        <h3 style={C.title}>The book of days</h3>

        {loading ? (
          <p style={C.loading}>Gathering the days…</p>
        ) : (
          <>
            <div style={C.navRow}>
              <button onClick={() => shift(-1)} style={{ ...C.navBtn, opacity: curKey <= minKey ? 0.25 : 1 }} disabled={curKey <= minKey}>‹</button>
              <span style={C.monthLabel}>{MONTHS[view.m]} {view.y}</span>
              <button onClick={() => shift(1)} style={{ ...C.navBtn, opacity: curKey >= maxKey ? 0.25 : 1 }} disabled={curKey >= maxKey}>›</button>
            </div>

            <div style={C.grid}>
              {WEEKDAYS.map((w, i) => <span key={`w${i}`} style={C.weekday}>{w}</span>)}
              {cells.map((d, i) => {
                if (d === null) return <span key={`e${i}`} />
                const st = cellState(d)
                const isSel = selected === st.ds
                const base =
                  st.kind === 'slip' ? C.cellSlip :
                  st.kind === 'urge' ? C.cellUrge :
                  st.kind === 'quiet' ? C.cellQuiet : C.cellOutside
                return (
                  <button
                    key={d}
                    onClick={() => st.kind !== 'outside' && setSelected(isSel ? null : st.ds)}
                    style={{ ...C.cell, ...base, ...(isSel ? C.cellSelected : {}), cursor: st.kind === 'outside' ? 'default' : 'pointer' }}
                    aria-label={st.ds}
                  >
                    <span style={C.cellNum}>{d}</span>
                    {st.kind === 'slip' && st.urges > 0 && <span style={C.slipUrgeDot} />}
                  </button>
                )
              })}
            </div>

            {selLine && <p style={C.selLine}>{selLine}</p>}

            <div style={C.legend}>
              <span style={C.legendItem}><span style={{ ...C.legendSwatch, ...C.cellQuiet }} /> quiet day</span>
              <span style={C.legendItem}><span style={{ ...C.legendSwatch, ...C.cellUrge }} /> an urge, ridden</span>
              <span style={C.legendItem}><span style={{ ...C.legendSwatch, ...C.cellSlip }} /> a slip, weathered</span>
            </div>

            <p style={C.footnote}>Every square is a day you were in this. Slips are part of the record, not the end of it.</p>
          </>
        )}

        <button onClick={onClose} style={C.closeBtn}>Close</button>
      </div>
    </div>
  )
}

const C = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(42,31,21,0.45)', zIndex: 70,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem',
  },
  card: {
    width: '100%', maxWidth: '400px', maxHeight: '86vh', overflowY: 'auto',
    background: 'linear-gradient(180deg, #FDFBF6 0%, #FAF5EA 100%)',
    border: '0.5px solid #EBDFC9', borderRadius: '20px', padding: '20px 18px 16px',
    boxShadow: '0 24px 60px -24px rgba(40,25,10,0.55)', boxSizing: 'border-box',
  },
  eyebrow: { fontSize: '10px', fontWeight: 600, color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.2em', fontFamily: '-apple-system, sans-serif', margin: '0 0 4px', textAlign: 'center' },
  title: { fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 500, color: '#2A1F15', margin: '0 0 12px', textAlign: 'center' },
  loading: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#9C8C78', textAlign: 'center', padding: '2rem 0' },

  navRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 4px 10px' },
  navBtn: { background: 'transparent', border: 'none', fontSize: '22px', color: '#854F0B', cursor: 'pointer', padding: '2px 12px', fontFamily: 'Georgia, serif' },
  monthLabel: { fontFamily: 'Georgia, serif', fontSize: '15px', color: '#2A1F15' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' },
  weekday: { textAlign: 'center', fontSize: '10px', color: '#B8A88E', fontFamily: '-apple-system, sans-serif', letterSpacing: '0.08em', paddingBottom: '2px' },
  cell: {
    position: 'relative', aspectRatio: '1', borderRadius: '8px', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '-apple-system, sans-serif', padding: 0,
  },
  cellNum: { fontSize: '11.5px', lineHeight: 1 },
  cellQuiet: { background: '#DFE7CD', color: '#4C5A38' },
  cellUrge: { background: '#EFDCAF', color: '#6B4F14' },
  cellSlip: { background: '#E3B7A4', color: '#6E3A26' },
  cellOutside: { background: '#F4EEE1', color: '#CFC4AF' },
  cellSelected: { outline: '2px solid #854F0B', outlineOffset: '1px' },
  slipUrgeDot: { position: 'absolute', right: '3px', bottom: '3px', width: '5px', height: '5px', borderRadius: '50%', background: '#B8860B' },

  selLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '12.5px', color: '#6B5C4A', textAlign: 'center', lineHeight: 1.55, margin: '12px 6px 0' },

  legend: { display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', margin: '14px 0 0' },
  legendItem: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  legendSwatch: { width: '13px', height: '13px', borderRadius: '4px', display: 'inline-block' },

  footnote: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '11px', color: '#9C8C78', textAlign: 'center', lineHeight: 1.55, margin: '12px 8px 0' },
  closeBtn: {
    display: 'block', width: '100%', marginTop: '14px', padding: '12px',
    background: 'transparent', border: '0.5px solid #E2D7C3', borderRadius: '12px',
    fontFamily: 'Georgia, serif', fontSize: '14px', color: '#6B5C4A', cursor: 'pointer',
  },
}