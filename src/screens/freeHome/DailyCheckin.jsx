import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../supabaseClient'
import SheetPortal from '../../components/SheetPortal'

// ===================================================================
// DAILY CHECK-IN — the tending ritual  (shared across all free homes)
// ===================================================================
// This is the thirty seconds that grows the tree, so it should feel
// like tending, not form-filling. One calm surface instead of paged
// steps: the day's weather is set by DRAGGING a thumb along a band
// that blends all six mood colours (the whole sheet washes in the
// chosen colour as you move); the pull is one row of quiet capsules;
// contexts (and the body row, where asked for) are light italic chips
// that fade in as you go. The closing act is named for what it does:
// "Tend the tree."
//
// Props (unchanged):
//   isOpen, onClose, stage, includeBody, existing, onSaved
//
// Data shape (unchanged, byte for byte): mood / mood_score / energy
// (preserved from existing rows; no UI) / felt_pull / pull_intensity /
// contexts / body_signals / note — upserted on user_id + checkin_date.
// MOOD_META and the moodBy* helpers are exported exactly as before;
// the Mirror and older homes read them.
// ===================================================================

export const MOOD_META = [
  { value: 'heavy', label: 'Heavy', score: 1, color: '#8A5A3C' },
  { value: 'low',   label: 'Low',   score: 2, color: '#A6764A' },
  { value: 'flat',  label: 'Flat',  score: 3, color: '#B9A07E' },
  { value: 'okay',  label: 'Okay',  score: 4, color: '#9DA86F' },
  { value: 'light', label: 'Light', score: 5, color: '#7E9B5A' },
  { value: 'good',  label: 'Good',  score: 6, color: '#5F8A4E' },
]

export const moodByValue = (v) => MOOD_META.find(m => m.value === v) || null
export const moodByScore = (s) => MOOD_META.find(m => m.score === s) || null

const URGE_OPTIONS = [
  { value: 'none',    label: 'It stayed away', felt: false, intensity: null },
  { value: 'mild',    label: 'A little',       felt: true,  intensity: 2 },
  { value: 'strong',  label: 'Quite strong',   felt: true,  intensity: 4 },
  { value: 'intense', label: 'Very strong',    felt: true,  intensity: 5 },
]

const urgeFromExisting = (row) => {
  if (!row || row.felt_pull == null) return null
  if (!row.felt_pull) return URGE_OPTIONS[0]
  const i = row.pull_intensity || 3
  if (i <= 2) return URGE_OPTIONS[1]
  if (i <= 4) return URGE_OPTIONS[2]
  return URGE_OPTIONS[3]
}

const CONTEXT_OPTIONS = [
  { value: 'stress',      label: 'Stress' },
  { value: 'lonely',      label: 'Feeling alone' },
  { value: 'bored',       label: 'Boredom' },
  { value: 'social',      label: 'Out with people' },
  { value: 'tired',       label: 'Tired' },
  { value: 'conflict',    label: 'A fight or argument' },
  { value: 'restless',    label: 'Restless' },
  { value: 'celebration', label: 'Celebrating something' },
  { value: 'nothing',     label: 'Nothing I can point to' },
]

const BODY_OPTIONS = [
  { value: 'head',      label: 'Head' },
  { value: 'chest',     label: 'Chest' },
  { value: 'stomach',   label: 'Stomach' },
  { value: 'jaw',       label: 'Jaw / face' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'hands',     label: 'Hands' },
  { value: 'restless',  label: 'Restless all over' },
  { value: 'none',      label: 'Nowhere — I felt calm' },
]

function localDateStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const hexToRgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

const LeafGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 19C5 9 12 4 20 4c0 8-5 15-15 15z" />
    <path d="M5 19c3-5 7-9 11-11" />
  </svg>
)

const FADE_CSS = `
@keyframes vowCkFade { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .vowCkFade { animation: none !important; } }`

// ---- the weather band: drag (or tap) along a blend of all six moods ----
function MoodBand({ mood, onPick, disabled }) {
  const trackRef = useRef(null)
  const draggingRef = useRef(false)

  const pickFromX = (clientX) => {
    const el = trackRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    const idx = Math.round(t * (MOOD_META.length - 1))
    const next = MOOD_META[idx]
    if (!mood || next.value !== mood.value) onPick(next)
  }

  const onDown = (e) => {
    if (disabled) return
    draggingRef.current = true
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId)
    pickFromX(e.clientX)
  }
  const onMove = (e) => { if (draggingRef.current) pickFromX(e.clientX) }
  const onUp = () => { draggingRef.current = false }

  const idx = mood ? MOOD_META.findIndex(m => m.value === mood.value) : null
  const stops = MOOD_META.map((m, i) => `${m.color} ${(i / (MOOD_META.length - 1)) * 100}%`).join(', ')

  return (
    <div style={S.bandWrap}>
      <div style={S.bandWordRow}>
        {mood ? (
          <span key={mood.value} className="vowCkFade" style={{ ...S.bandWord, color: mood.color, animation: 'vowCkFade 0.3s ease' }}>
            {mood.label}
          </span>
        ) : (
          <span style={S.bandWordEmpty}>slide to where the day sits</span>
        )}
      </div>
      <div
        ref={trackRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        role="slider"
        aria-label="How the day feels, from heavy to good"
        aria-valuemin={1}
        aria-valuemax={6}
        aria-valuenow={mood ? mood.score : undefined}
        style={{ ...S.bandTrack, background: `linear-gradient(90deg, ${stops})`, touchAction: 'none' }}
      >
        {MOOD_META.map((m, i) => (
          <span key={m.value} style={{ ...S.bandTick, left: `${(i / (MOOD_META.length - 1)) * 100}%` }} />
        ))}
        {idx != null && (
          <span
            style={{
              ...S.bandThumb,
              left: `${(idx / (MOOD_META.length - 1)) * 100}%`,
              borderColor: mood.color,
            }}
          />
        )}
      </div>
      <div style={S.bandEnds}>
        <span style={S.bandEnd}>heavy</span>
        <span style={S.bandEnd}>good</span>
      </div>
    </div>
  )
}

export default function DailyCheckin({
  isOpen,
  onClose,
  stage = 'notice',
  includeBody = false,
  existing = null,
  onSaved,
}) {
  const [mood, setMood] = useState(null)
  const [energy, setEnergy] = useState(null)   // preserved from existing rows; no UI
  const [urge, setUrge] = useState(null)
  const [contexts, setContexts] = useState([])
  const [bodySignals, setBodySignals] = useState([])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [tended, setTended] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setSaving(false)
    if (existing) {
      setMood(moodByValue(existing.mood))
      setEnergy(existing.energy ?? null)
      setUrge(urgeFromExisting(existing))
      setContexts(existing.contexts || [])
      setBodySignals(existing.body_signals || [])
      setNote(existing.note || '')
    } else {
      setMood(null); setEnergy(null); setUrge(null)
      setContexts([]); setBodySignals([]); setNote('')
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null

  const toggle = (arr, setArr, value) => {
    if (value === 'nothing' || value === 'none') {
      setArr(arr.includes(value) ? [] : [value])
      return
    }
    const cleaned = arr.filter(v => v !== 'nothing' && v !== 'none')
    setArr(cleaned.includes(value) ? cleaned.filter(v => v !== value) : [...cleaned, value])
  }

  const handleSave = async () => {
    if (saving || !mood || !urge) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSaving(false); return }

      const row = {
        user_id: user.id,
        stage,
        checkin_date: localDateStr(),
        mood: mood?.value ?? null,
        mood_score: mood?.score ?? null,
        energy: energy ?? null,
        felt_pull: urge ? urge.felt : null,
        pull_intensity: urge ? urge.intensity : null,
        contexts,
        body_signals: includeBody ? bodySignals : [],
        note: note.trim() || null,
      }

      const { data, error } = await supabase
        .from('free_daily_checkins')
        .upsert(row, { onConflict: 'user_id,checkin_date' })
        .select()
        .single()

      if (error) {
        console.error('Failed to save check-in:', error)
        alert('Could not save. Please try again.')
        setSaving(false)
        return
      }
      if (onSaved) onSaved(data)
      setSaving(false)
      setTended(true)
      setTimeout(() => { setTended(false); onClose() }, 1300)
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const todayNice = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
  const showPull = !!mood
  const showRest = !!urge
  const canTend = !!mood && !!urge

  return (
    <SheetPortal><div style={S.overlay} onClick={onClose}>
      <style>{FADE_CSS}</style>
      <div style={S.card} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            ...S.moodWash,
            background: mood ? hexToRgba(mood.color, 0.17) : 'transparent',
            opacity: mood ? 1 : 0,
          }}
        />
        {tended && (
          <div className="vowCkFade" style={{ ...S.tendedLayer, animation: 'vowCkFade 0.3s ease' }}>
            <span style={{ ...S.tendedRing, color: mood ? mood.color : '#854F0B', borderColor: mood ? hexToRgba(mood.color, 0.55) : '#C9A85C' }}>
              <LeafGlyph />
            </span>
            <p style={S.tendedTitle}>Tended.</p>
            <p style={S.tendedSub}>The tree drinks. Come back tomorrow.</p>
          </div>
        )}
        <div style={S.content}>

          <div style={S.header}>
            <span style={S.headerGlyph}><LeafGlyph /></span>
            <div style={S.headerText}>
              <p style={S.eyebrow}>Tending</p>
              <p style={S.dateLine}>{todayNice}</p>
            </div>
            <button onClick={onClose} style={S.closeBtn} disabled={saving} aria-label="Close">×</button>
          </div>

          <p style={S.q}>How did the day sit with you?</p>
          <MoodBand mood={mood} onPick={setMood} disabled={saving} />

          {showPull && (
            <div className="vowCkFade" style={{ animation: 'vowCkFade 0.35s ease' }}>
              <p style={S.q}>And the pull — did it come by?</p>
              <div style={S.pullRow}>
                {URGE_OPTIONS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setUrge(p)}
                    disabled={saving}
                    style={{ ...S.pullChip, ...(urge?.value === p.value ? S.pullChipOn : {}) }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showRest && (
            <div className="vowCkFade" style={{ animation: 'vowCkFade 0.35s ease' }}>
              <p style={S.q}>{urge.felt ? 'What was around it?' : 'What was the day made of, mostly?'}</p>
              <div style={S.chipWrap}>
                {CONTEXT_OPTIONS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => toggle(contexts, setContexts, c.value)}
                    disabled={saving}
                    style={{ ...S.chip, ...(contexts.includes(c.value) ? S.chipOn : {}) }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {includeBody && (
                <>
                  <p style={S.q}>Where did it sit in your body?</p>
                  <div style={S.chipWrap}>
                    {BODY_OPTIONS.map(b => (
                      <button
                        key={b.value}
                        onClick={() => toggle(bodySignals, setBodySignals, b.value)}
                        disabled={saving}
                        style={{ ...S.chip, ...(bodySignals.includes(b.value) ? S.chipOn : {}) }}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="A line worth keeping, if there is one…"
                style={S.noteInput}
                disabled={saving}
                maxLength={140}
              />
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !canTend}
            style={{ ...S.tendBtn, opacity: canTend ? 1 : 0.4 }}
          >
            {saving ? 'Tending…' : existing ? 'Tend again' : 'Tend the tree'}
          </button>

          <p style={S.helper}>There’s no wrong answer here. Just what’s true.</p>
        </div>
      </div>
    </div></SheetPortal>
  )
}

const S = {
  tendedLayer: { position: 'absolute', inset: 0, zIndex: 4, background: 'rgba(250,247,241,0.97)', borderRadius: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textAlign: 'center', padding: 24 },
  tendedRing: { width: 52, height: 52, borderRadius: '50%', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6, background: '#FDFBF6' },
  tendedTitle: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 21, color: '#2A1F15', margin: 0 },
  tendedSub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#9C8C78', margin: 0 },
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(40,25,15,0.55)', backdropFilter: 'blur(4px)',
    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    position: 'relative', overflow: 'hidden',
    background: '#FAF7F1', maxWidth: '400px', width: '100%',
    maxHeight: '90vh', overflowY: 'auto',
    borderRadius: '22px',
    boxShadow: '0 20px 60px rgba(40,25,15,0.3)',
  },
  moodWash: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
    transition: 'background 0.5s ease, opacity 0.5s ease',
  },
  content: { position: 'relative', padding: '1.25rem 1.4rem 1.25rem' },

  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' },
  headerGlyph: {
    width: '32px', height: '32px', flexShrink: 0, borderRadius: '10px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#D9B57A',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerText: { flex: 1 },
  eyebrow: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: 0 },
  dateLine: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '2px 0 0' },
  closeBtn: { background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '24px', cursor: 'pointer', padding: '0 2px', lineHeight: 1 },

  q: { fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '16px 0 8px' },

  // the weather band
  bandWrap: { padding: '2px 4px 0' },
  bandWordRow: { height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bandWord: { fontSize: '24px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 500, lineHeight: 1 },
  bandWordEmpty: { fontSize: '12.5px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#B9A88E' },
  bandTrack: {
    position: 'relative', height: '18px', borderRadius: '999px',
    border: '0.5px solid rgba(60,40,20,0.18)', cursor: 'pointer',
    boxShadow: 'inset 0 1px 3px rgba(60,40,20,0.18)', marginTop: '6px',
  },
  bandTick: { position: 'absolute', top: '50%', width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(250,247,241,0.75)', transform: 'translate(-50%, -50%)', pointerEvents: 'none' },
  bandThumb: {
    position: 'absolute', top: '50%', width: '28px', height: '28px', borderRadius: '50%',
    background: '#FAF7F1', border: '2.5px solid', transform: 'translate(-50%, -50%)',
    boxShadow: '0 2px 8px rgba(60,40,20,0.35)', pointerEvents: 'none',
    transition: 'left 0.16s ease, border-color 0.16s ease',
  },
  bandEnds: { display: 'flex', justifyContent: 'space-between', marginTop: '6px', padding: '0 2px' },
  bandEnd: { fontSize: '10.5px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#B9A88E' },

  // the pull
  pullRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '7px' },
  pullChip: {
    padding: '11px 8px', background: '#FDFBF6', border: '0.5px solid #E2D7C3',
    borderRadius: '12px', fontSize: '12.5px', color: '#3A2A1C',
    fontFamily: 'Georgia, serif', cursor: 'pointer', lineHeight: 1.3,
  },
  pullChipOn: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: '0.5px solid #241710' },

  // contexts / body
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: '7px' },
  chip: {
    padding: '8px 12px', borderRadius: '999px', border: '0.5px solid #E2D7C3',
    background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif',
    fontSize: '12.5px', cursor: 'pointer',
  },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },

  noteInput: {
    width: '100%', boxSizing: 'border-box', marginTop: '14px', padding: '11px 13px',
    border: '0.5px solid #E2D7C3', borderRadius: '12px', background: '#FFFFFF',
    fontSize: '13px', fontStyle: 'italic', color: '#2A1F15', fontFamily: 'Georgia, serif', outline: 'none',
  },
  tendBtn: {
    width: '100%', marginTop: '16px', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    border: '0.5px solid rgba(217,181,122,0.35)',
    borderRadius: '13px', color: '#FAF7F1', fontSize: '14.5px', fontWeight: 500,
    fontFamily: 'Georgia, serif', cursor: 'pointer',
    boxShadow: '0 6px 16px -6px rgba(30,18,8,0.5)',
  },
  helper: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '10px 0 0' },
}