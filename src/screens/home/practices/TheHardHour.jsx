import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'
import { ScienceFooter } from './practiceKit'

// ===================================================================
// PRACTICE: "The hard hour"  (Early Days)
// ===================================================================
// Every early day has one hour that's harder than the rest — and it's
// usually the same one. The user names tonight's hour on an evening
// arc, places one defense on it, and (optionally) picks who they'd
// message if it bites. Deciding now, not then.
//
// The impact is the loop: next time they open this after that hour
// has passed, it asks "how did it go?" — one tap, and a quiet tally
// of held hours builds.
//
// Data: free_stage_signals rows, stage 'endure',
// signal_type 'endure_hard_hour',
// payload { date, hour, plan, plan_label, own_note, person, outcome }.
// One row per date; the outcome is written onto the same row later.
// ===================================================================

const HOURS = [18, 19, 20, 21, 22, 23, 0, 1, 2]

const hourLabel = (h) => {
  if (h === 0) return '12 am'
  if (h < 12) return `${h} am`
  if (h === 12) return '12 pm'
  return `${h - 12} pm`
}

const DEFENSES = [
  { value: 'out',    label: 'Out of the house',      icon: '🚪' },
  { value: 'people', label: 'With someone',          icon: '🤝' },
  { value: 'busy',   label: 'Phone away, hands busy', icon: '✋' },
  { value: 'eat',    label: 'Eat first',             icon: '🍽️' },
  { value: 'sleep',  label: 'Early to bed',          icon: '🌙' },
  { value: 'own',    label: 'My own plan',           icon: '✍️' },
]
const DEFENSE_BY_VALUE = DEFENSES.reduce((a, d) => { a[d.value] = d; return a }, {})

function localDateStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// The slot for (date, hour) ends an hour after it starts. Hours 0–2
// belong to the night that started on `date`, i.e. the next morning.
function slotEnd(dateStr, hour) {
  const d = new Date(`${dateStr}T00:00:00`)
  if (hour >= 18) d.setHours(hour + 1, 0, 0, 0)
  else { d.setDate(d.getDate() + 1); d.setHours(hour + 1, 0, 0, 0) }
  return d
}

const friendlyDay = (dateStr) => {
  const today = localDateStr()
  if (dateStr === today) return 'Earlier tonight'
  const y = new Date(); y.setDate(y.getDate() - 1)
  if (dateStr === localDateStr(y)) return 'Last night'
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

// Points along the evening arc (quadratic curve), one per hour.
const ARC = { x0: 18, y0: 74, cx: 150, cy: 2, x1: 282, y1: 74 }
const arcPoint = (t) => ({
  x: (1 - t) * (1 - t) * ARC.x0 + 2 * (1 - t) * t * ARC.cx + t * t * ARC.x1,
  y: (1 - t) * (1 - t) * ARC.y0 + 2 * (1 - t) * t * ARC.cy + t * t * ARC.y1,
})
const HOUR_POINTS = HOURS.map((h, i) => ({ h, ...arcPoint(i / (HOURS.length - 1)) }))

const OUTCOME_NOTE = {
  clean: 'Held. That’s how it’s done — one hour at a time.',
  held: 'Held. The hard ones count double.',
  bit: 'Noted, without judgment. Tonight gets its own plan.',
}

export default function TheHardHour() {
  const [rows, setRows] = useState([])
  const [anchors, setAnchors] = useState([])
  const [loading, setLoading] = useState(true)

  // planner state
  const [hour, setHour] = useState(null)
  const [defense, setDefense] = useState(null)
  const [ownNote, setOwnNote] = useState('')
  const [person, setPerson] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [outcomeNote, setOutcomeNote] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('free_stage_signals')
        .select('id, payload, created_at')
        .eq('user_id', user.id)
        .eq('signal_type', 'endure_hard_hour')
        .order('created_at', { ascending: false })
        .limit(60)

      const { data: anchorRows } = await supabase
        .from('anchors').select('name')
        .eq('user_id', user.id).order('position').limit(4)

      if (cancelled) return
      if (data) setRows(data)
      if (anchorRows) setAnchors(anchorRows.map(a => a.name).filter(Boolean))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return <p style={styles.helper}>Loading…</p>

  const now = new Date()
  const today = localDateStr()
  const todayRow = rows.find(r => r.payload?.date === today) || null

  // most recent past, unanswered hour → the follow-up question
  const pending = rows.find(r =>
    r.payload?.date && r.payload?.hour != null &&
    !r.payload?.outcome &&
    slotEnd(r.payload.date, r.payload.hour) <= now
  ) || null

  const heldCount = rows.filter(r => r.payload?.outcome === 'clean' || r.payload?.outcome === 'held').length

  // the pattern: which hours keep getting named
  const hourTally = {}
  rows.forEach(r => { const h = r.payload?.hour; if (h != null) hourTally[h] = (hourTally[h] || 0) + 1 })
  const hourPattern = HOURS.filter(h => hourTally[h]).map(h => ({ h, n: hourTally[h] }))
  const patternMax = hourPattern.reduce((m, x) => Math.max(m, x.n), 0)
  const patternTotal = hourPattern.reduce((s, x) => s + x.n, 0)

  const answerOutcome = async (row, outcome) => {
    if (saving) return
    setSaving(true)
    const newPayload = { ...row.payload, outcome, outcome_at: new Date().toISOString() }
    const { data, error } = await supabase
      .from('free_stage_signals')
      .update({ payload: newPayload })
      .eq('id', row.id).select().single()
    setSaving(false)
    if (error) { console.error(error); alert('Could not save. Please try again.'); return }
    setRows(prev => prev.map(r => (r.id === row.id ? data : r)))
    setOutcomeNote(OUTCOME_NOTE[outcome])
  }

  const startEditing = () => {
    if (todayRow) {
      setHour(todayRow.payload?.hour ?? null)
      setDefense(todayRow.payload?.plan ?? null)
      setOwnNote(todayRow.payload?.own_note || '')
      setPerson(todayRow.payload?.person || null)
    }
    setEditing(true)
  }

  const savePlan = async () => {
    if (saving || hour == null || !defense) return
    if (defense === 'own' && !ownNote.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const payload = {
      date: today,
      hour,
      plan: defense,
      plan_label: defense === 'own' ? ownNote.trim() : DEFENSE_BY_VALUE[defense].label,
      own_note: defense === 'own' ? ownNote.trim() : null,
      person: person || null,
      outcome: null,
    }

    let saved = null
    if (todayRow) {
      const { data, error } = await supabase
        .from('free_stage_signals')
        .update({ payload }).eq('id', todayRow.id).select().single()
      if (error) { console.error(error); alert('Could not save. Please try again.'); setSaving(false); return }
      saved = data
      setRows(prev => prev.map(r => (r.id === todayRow.id ? saved : r)))
    } else {
      const { data, error } = await supabase
        .from('free_stage_signals')
        .insert({ user_id: user.id, stage: 'endure', signal_type: 'endure_hard_hour', payload })
        .select().single()
      if (error) { console.error(error); alert('Could not save. Please try again.'); setSaving(false); return }
      saved = data
      setRows(prev => [saved, ...prev])
    }
    setSaving(false)
    setEditing(false)
  }

  // ----------------------------------------------------------------
  // 1) FOLLOW-UP — a guarded hour has passed and wants one honest tap
  // ----------------------------------------------------------------
  if (pending && !editing) {
    const p = pending.payload
    return (
      <div>
        {outcomeNote ? (
          <>
            <p style={styles.outcomeNote}>{outcomeNote}</p>
            {heldCount > 0 && <p style={styles.tally}>You’ve held {heldCount} hard {heldCount === 1 ? 'hour' : 'hours'}.</p>}
            <button onClick={() => setOutcomeNote(null)} style={styles.primaryBtn}>
              {rows.find(r => r.payload?.date === today && !r.payload?.outcome && slotEnd(today, r.payload?.hour) > now) ? 'Done' : 'Plan tonight’s hour'}
            </button>
          </>
        ) : (
          <>
            <p style={styles.followEyebrow}>Last time</p>
            <h3 style={styles.followQ}>{friendlyDay(p.date)}, {hourLabel(p.hour)} — how did it go?</h3>
            <p style={styles.followPlan}>The plan was: {p.plan_label}{p.person ? `, with ${p.person} a message away` : ''}.</p>
            <div style={styles.outcomeCol}>
              <button onClick={() => answerOutcome(pending, 'clean')} disabled={saving} style={styles.outcomeBtn}>Passed clean</button>
              <button onClick={() => answerOutcome(pending, 'held')} disabled={saving} style={styles.outcomeBtn}>Hard, but I held</button>
              <button onClick={() => answerOutcome(pending, 'bit')} disabled={saving} style={styles.outcomeBtn}>It bit</button>
            </div>
            <p style={styles.helper}>One honest tap. There’s no wrong answer.</p>
          </>
        )}
      </div>
    )
  }

  // ----------------------------------------------------------------
  // 2) TONIGHT IS ALREADY PLANNED — show the guard standing
  // ----------------------------------------------------------------
  if (todayRow && !editing) {
    const p = todayRow.payload
    const passed = slotEnd(p.date, p.hour) <= now
    return (
      <div>
        {passed && p.outcome ? (
          <>
            <p style={styles.plannedLine}>Tonight’s hard hour has passed.</p>
            <p style={styles.plannedSub}>{OUTCOME_NOTE[p.outcome]}</p>
          </>
        ) : (
          <>
            <p style={styles.plannedLine}>Tonight, {hourLabel(p.hour)} — {p.plan_label}.</p>
            {p.person && <p style={styles.plannedSub}>And {p.person} is a message away if it bites.</p>}
          </>
        )}
        {heldCount > 0 && <p style={styles.tally}>You’ve held {heldCount} hard {heldCount === 1 ? 'hour' : 'hours'}.</p>}
        {!passed && (
          <button onClick={startEditing} style={styles.ghostBtn}>Change tonight’s plan</button>
        )}
      </div>
    )
  }

  // ----------------------------------------------------------------
  // 3) PLANNER — name the hour, place the defense
  // ----------------------------------------------------------------
  return (
    <div>
      <p style={styles.body}>
        Every early day has one hour that’s harder than the rest. Name tonight’s — and decide now, not then.
      </p>

      <svg viewBox="0 0 300 96" style={{ width: '100%', display: 'block' }}>
        <path d={`M${ARC.x0} ${ARC.y0} Q${ARC.cx} ${ARC.cy} ${ARC.x1} ${ARC.y1}`} stroke="#D9B57A" strokeWidth="1.6" fill="none" />
        {HOUR_POINTS.map(pt => (
          <g key={pt.h} onClick={() => setHour(pt.h)} style={{ cursor: 'pointer' }}>
            <circle cx={pt.x} cy={pt.y} r="13" fill="transparent" />
            <circle
              cx={pt.x} cy={pt.y}
              r={hour === pt.h ? 9 : 3.2}
              fill={hour === pt.h ? '#2A1B10' : '#B9A07E'}
              style={{ transition: 'r 0.2s ease, fill 0.2s ease' }}
            />
            {hour === pt.h && (
              <text x={pt.x} y={pt.y + 3} textAnchor="middle" fontSize="8" fill="#FAF7F1" fontFamily="Georgia, serif">
                {pt.h === 0 ? 12 : pt.h > 12 ? pt.h - 12 : pt.h}
              </text>
            )}
          </g>
        ))}
        <text x={ARC.x0} y="92" textAnchor="middle" fontSize="9" fill="#9C8C78" fontFamily="Georgia, serif">6 pm</text>
        <text x={ARC.x1} y="92" textAnchor="middle" fontSize="9" fill="#9C8C78" fontFamily="Georgia, serif">2 am</text>
      </svg>
      <p style={styles.hourLine}>{hour != null ? `Tonight, ${hourLabel(hour)}` : 'Tap the hour on the arc'}</p>

      {patternTotal >= 3 && (
        <div style={styles.patternBox}>
          <p style={styles.patternHead}>When it usually gets hard</p>
          {hourPattern.map(({ h, n }) => (
            <div key={h} style={styles.patternRow}>
              <span style={styles.patternLabel}>{hourLabel(h)}</span>
              <div style={styles.patternTrack}>
                <div style={{ ...styles.patternFill, width: `${(n / patternMax) * 100}%` }} />
              </div>
              <span style={styles.patternVal}>{n}</span>
            </div>
          ))}
          <p style={styles.patternFoot}>{patternTotal} hard {patternTotal === 1 ? 'hour' : 'hours'} named so far — the pattern is the useful part.</p>
        </div>
      )}

      {hour != null && (
        <>
          <p style={styles.fieldLabel}>What will you be doing instead?</p>
          <div style={styles.chips}>
            {DEFENSES.map(d => (
              <button
                key={d.value}
                onClick={() => setDefense(d.value)}
                disabled={saving}
                style={{ ...styles.chip, ...(defense === d.value ? styles.chipOn : {}) }}
              >
                <span style={styles.chipIcon}>{d.icon}</span> {d.label}
              </button>
            ))}
          </div>
          {defense === 'own' && (
            <input
              type="text"
              value={ownNote}
              onChange={(e) => setOwnNote(e.target.value)}
              placeholder="Your plan, in a few words"
              style={styles.input}
              maxLength={80}
              disabled={saving}
            />
          )}

          {anchors.length > 0 && (
            <>
              <p style={styles.fieldLabel}>If it bites, I’ll message…</p>
              <div style={styles.chips}>
                {anchors.map(name => (
                  <button
                    key={name}
                    onClick={() => setPerson(person === name ? null : name)}
                    disabled={saving}
                    style={{ ...styles.chip, ...(person === name ? styles.chipOn : {}) }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            onClick={savePlan}
            disabled={saving || !defense || (defense === 'own' && !ownNote.trim())}
            style={{ ...styles.primaryBtn, ...((!defense || (defense === 'own' && !ownNote.trim())) ? styles.primaryBtnDim : {}) }}
          >
            {saving ? 'Saving…' : 'Place the guard'}
          </button>
        </>
      )}

      {heldCount > 0 && <p style={styles.tally}>You’ve held {heldCount} hard {heldCount === 1 ? 'hour' : 'hours'}.</p>}
      <ScienceFooter text="Cravings keep appointments: for most people the hard hour is the same hour, night after night, because cue-conditioning runs on the clock. Naming it and placing the defense while calm moves the decision out of the hour itself — and the how-did-it-go loop teaches you which guards actually hold." />
    </div>
  )
}

const styles = {
  patternBox: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '12px 14px', margin: '4px 0 12px' },
  patternHead: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11, color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 8px' },
  patternRow: { display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 },
  patternLabel: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#6B5C4A', width: 56, flexShrink: 0 },
  patternTrack: { flex: 1, height: 7, borderRadius: 999, background: '#EFE9DA', border: '0.5px solid #E2D7C3', position: 'relative', overflow: 'hidden' },
  patternFill: { position: 'absolute', left: 0, top: 0, bottom: 0, background: 'linear-gradient(90deg, #D9C9A4, #C9A85C)' },
  patternVal: { fontFamily: 'Georgia, serif', fontSize: 12, color: '#2A1F15', width: 18, textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  patternFoot: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#9C8C78', margin: '6px 0 0', lineHeight: 1.45 },
  body: { fontSize: '13.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', lineHeight: 1.55, margin: '0 0 8px' },
  hourLine: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', textAlign: 'center', margin: '2px 0 14px' },
  fieldLabel: { fontSize: '12px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 8px' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '12px' },
  chip: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 12px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '18px', fontSize: '12.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer', textAlign: 'left' },
  chipOn: { border: '1.5px solid #854F0B', background: '#FBF6EE' },
  chipIcon: { fontSize: '14px' },
  input: { width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: '0.5px solid #E0D5C2', borderRadius: '12px', background: 'white', fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', outline: 'none', marginBottom: '12px' },
  primaryBtn: { width: '100%', padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  primaryBtnDim: { opacity: 0.45, cursor: 'not-allowed' },
  ghostBtn: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '12.5px', fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer', padding: '4px 0 0', textDecoration: 'underline' },

  followEyebrow: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 6px' },
  followQ: { fontSize: '17px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.35, margin: '0 0 6px' },
  followPlan: { fontSize: '12.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 14px', lineHeight: 1.45 },
  outcomeCol: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' },
  outcomeBtn: { width: '100%', padding: '12px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '12px', fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  outcomeNote: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 8px' },

  plannedLine: { fontSize: '15.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.4, margin: '0 0 4px' },
  plannedSub: { fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 6px' },
  tally: { fontSize: '12.5px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '8px 0 10px' },
  helper: { fontSize: '11.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '4px 0 0' },
}