import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import SheetPortal from '../../components/SheetPortal'

// ===================================================================
// DAILY CHECK-IN  (shared across all free homes)
// ===================================================================
// One short check per day — three taps in plain English. Upserts a
// single row into free_daily_checkins (unique on user_id + checkin_date),
// so re-opening the same day edits rather than duplicates.
//
// Steps: how you're feeling → did the urge come → what was around it
// (+ where it sat in the body, for the looking-closely home only).
// Picking a mood washes the whole sheet in that mood's colour — the
// check-in is bathed in the day's mood from then on.
//
// Props:
//   isOpen        bool
//   onClose       () => void
//   stage         data key ('notice'|'reflect'|'commit'|'endure'|'build'|'reclaim')
//   includeBody   bool   — show the body step (the notice home uses true)
//   existing      row | null — today's check-in, to pre-fill on edit
//   onSaved       (row) => void
//
// Data shape is unchanged: mood/mood_score/energy/felt_pull/
// pull_intensity/contexts/body_signals/note. The energy question was
// removed from the UI for simplicity; an existing row's energy value is
// preserved on edit, new rows save energy as null.
// ===================================================================

// Mood vocabulary — ordinal score drives all trend math in the Oracle.
// Colour runs warm-clay (heavy) → soft-sage (good); deliberately NOT a
// red/green traffic light. Exported so homes render summaries the same way.
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

// felt_pull is derived: 'none' => false; everything else => true + intensity.
// Four plain choices instead of the old six-step intensity ladder.
const URGE_OPTIONS = [
  { value: 'none',    label: 'No, not today',  felt: false, intensity: null },
  { value: 'mild',    label: 'A little',       felt: true,  intensity: 2 },
  { value: 'strong',  label: 'Quite strong',   felt: true,  intensity: 4 },
  { value: 'intense', label: 'Very strong',    felt: true,  intensity: 5 },
]

// Map any stored intensity (including old 6-step rows) back to an option.
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

// Soft wash of the mood colour, layered over cream.
const hexToRgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

export default function DailyCheckin({
  isOpen,
  onClose,
  stage = 'notice',
  includeBody = false,
  existing = null,
  onSaved,
}) {
  // Three plain steps; the body step joins only when asked for.
  const stepKeys = ['mood', 'urge', 'contexts', ...(includeBody ? ['body'] : [])]
  const totalSteps = stepKeys.length
  const lastIdx = totalSteps - 1

  const [stepIdx, setStepIdx] = useState(0)
  const [mood, setMood] = useState(null)
  const [energy, setEnergy] = useState(null)   // preserved from existing rows; no UI
  const [urge, setUrge] = useState(null)       // an URGE_OPTIONS entry
  const [contexts, setContexts] = useState([])
  const [bodySignals, setBodySignals] = useState([])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  // Reset / pre-fill whenever the modal opens
  useEffect(() => {
    if (!isOpen) return
    setStepIdx(0)
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

  const key = stepKeys[stepIdx]
  const advance = () => setStepIdx(i => Math.min(i + 1, lastIdx))
  const back = () => setStepIdx(i => Math.max(i - 1, 0))

  const toggle = (arr, setArr, value) => {
    // "nothing"/"none" are mutually exclusive with the rest
    if (value === 'nothing' || value === 'none') {
      setArr(arr.includes(value) ? [] : [value])
      return
    }
    const cleaned = arr.filter(v => v !== 'nothing' && v !== 'none')
    setArr(cleaned.includes(value) ? cleaned.filter(v => v !== value) : [...cleaned, value])
  }

  const handleSave = async () => {
    if (saving) return
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
      onClose()
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  // ---- step content ------------------------------------------------
  let eyebrow, question, bodyEl
  const isMulti = key === 'contexts' || key === 'body'

  if (key === 'mood') {
    eyebrow = `Step 1 of ${totalSteps}`
    question = 'How are you feeling today?'
    bodyEl = (
      <div style={styles.moodGrid}>
        {MOOD_META.map(m => (
          <button
            key={m.value}
            onClick={() => { setMood(m); setTimeout(advance, 380) }}
            disabled={saving}
            style={{
              ...styles.moodChip,
              ...(mood?.value === m.value ? styles.moodChipSelected : {}),
            }}
          >
            <span style={{ ...styles.moodDot, background: m.color }} />
            {m.label}
          </button>
        ))}
      </div>
    )
  } else if (key === 'urge') {
    eyebrow = `Step 2 of ${totalSteps}`
    question = 'Did you feel the urge today?'
    bodyEl = (
      <div style={styles.optionsGrid}>
        {URGE_OPTIONS.map(p => (
          <button
            key={p.value}
            onClick={() => { setUrge(p); advance() }}
            disabled={saving}
            style={{
              ...styles.optionChip,
              ...(urge?.value === p.value ? styles.optionChipSelected : {}),
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    )
  } else if (key === 'contexts') {
    eyebrow = `Step 3 of ${totalSteps}`
    question = urge && urge.felt ? 'What was happening around it?' : 'What was today like, mostly?'
    bodyEl = (
      <div style={styles.optionsGrid}>
        {CONTEXT_OPTIONS.map(c => (
          <button
            key={c.value}
            onClick={() => toggle(contexts, setContexts, c.value)}
            disabled={saving}
            style={{
              ...styles.optionChip,
              ...(contexts.includes(c.value) ? styles.optionChipSelected : {}),
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
    )
  } else if (key === 'body') {
    eyebrow = `Step ${totalSteps} of ${totalSteps}`
    question = 'Where did you feel it in your body?'
    bodyEl = (
      <div style={styles.optionsGrid}>
        {BODY_OPTIONS.map(b => (
          <button
            key={b.value}
            onClick={() => toggle(bodySignals, setBodySignals, b.value)}
            disabled={saving}
            style={{
              ...styles.optionChip,
              ...(bodySignals.includes(b.value) ? styles.optionChipSelected : {}),
            }}
          >
            {b.label}
          </button>
        ))}
      </div>
    )
  }

  const onLastStep = stepIdx === lastIdx

  return (
    <SheetPortal><div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        {/* the day's mood washes over the whole sheet */}
        <div
          style={{
            ...styles.moodWash,
            background: mood ? hexToRgba(mood.color, 0.16) : 'transparent',
            opacity: mood ? 1 : 0,
          }}
        />
        <div style={styles.content}>

          <div style={styles.header}>
            {stepIdx > 0 ? (
              <button onClick={back} style={styles.backBtn} disabled={saving}>‹ Back</button>
            ) : <div style={styles.headerSpacer} />}
            <div style={styles.stepDots}>
              {stepKeys.map((_, n) => (
                <div key={n} style={{
                  ...styles.stepDot,
                  ...(n === stepIdx ? styles.stepDotActive : {}),
                  ...(n < stepIdx ? styles.stepDotDone : {}),
                }} />
              ))}
            </div>
            <button onClick={onClose} style={styles.closeBtn} disabled={saving}>×</button>
          </div>

          <p style={styles.eyebrow}>{eyebrow}</p>
          <h2 style={styles.question}>{question}</h2>

          {bodyEl}

          {/* Multi-select steps need an explicit continue/save. */}
          {isMulti && (
            <>
              {onLastStep && (
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="A word or two, if you want (optional)"
                  style={styles.noteInput}
                  disabled={saving}
                  maxLength={140}
                />
              )}
              <button
                onClick={onLastStep ? handleSave : advance}
                disabled={saving}
                style={styles.continueBtn}
              >
                {saving ? 'Saving…' : onLastStep ? 'Save check-in' : 'Continue'}
              </button>
            </>
          )}

          <p style={styles.helper}>
            {isMulti ? 'Tap any that fit, or none. There is no wrong answer.' : 'There is no wrong answer. Just what is true.'}
          </p>
        </div>
      </div>
    </div></SheetPortal>
  )
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(40,25,15,0.55)', backdropFilter: 'blur(4px)',
    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    position: 'relative', overflow: 'hidden',
    background: '#FAF7F1', maxWidth: '400px', width: '100%',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(40,25,15,0.3)',
  },
  moodWash: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
    transition: 'background 0.6s ease, opacity 0.6s ease',
  },
  content: {
    position: 'relative',
    padding: '1.5rem 1.5rem 1.25rem',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  backBtn: {
    background: 'transparent', border: 'none', color: '#854F0B',
    fontSize: '13px', fontStyle: 'italic', cursor: 'pointer',
    fontFamily: 'Georgia, serif', padding: '4px 0', minWidth: '50px', textAlign: 'left',
  },
  headerSpacer: { minWidth: '50px' },
  stepDots: { display: 'flex', alignItems: 'center', gap: '6px' },
  stepDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#E0D5C2', transition: 'all 0.2s' },
  stepDotActive: { background: '#854F0B', width: '20px', borderRadius: '3px' },
  stepDotDone: { background: '#C2D49A' },
  closeBtn: {
    background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '22px',
    cursor: 'pointer', fontFamily: 'inherit', padding: '0 4px', minWidth: '50px',
    textAlign: 'right', lineHeight: 1,
  },
  eyebrow: {
    fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.24em',
    fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 8px', textAlign: 'center',
  },
  question: {
    fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 18px', textAlign: 'center',
  },

  // mood
  moodGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' },
  moodChip: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
    padding: '14px 8px', background: 'white', border: '0.5px solid #E0D5C2',
    borderRadius: '12px', fontSize: '13px', fontWeight: 500, color: '#2A1F15',
    fontFamily: 'Georgia, serif', cursor: 'pointer', transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  moodChipSelected: { border: '1.5px solid #854F0B', background: '#FBF6EE' },
  moodDot: { width: '14px', height: '14px', borderRadius: '50%' },

  // generic chips
  optionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' },
  optionChip: {
    padding: '14px 10px', background: 'white', border: '0.5px solid #E0D5C2',
    borderRadius: '12px', fontSize: '13px', fontWeight: 500, color: '#2A1F15',
    fontFamily: 'Georgia, serif', cursor: 'pointer', transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)', lineHeight: 1.4,
  },
  optionChipSelected: { border: '1.5px solid #854F0B', background: '#FBF6EE' },

  noteInput: {
    width: '100%', boxSizing: 'border-box', padding: '12px 14px',
    border: '0.5px solid #E0D5C2', borderRadius: '12px', background: 'white',
    fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif',
    marginBottom: '10px', outline: 'none',
  },
  continueBtn: {
    width: '100%', padding: '14px', background: '#854F0B', border: 'none',
    borderRadius: '12px', color: '#FBF6EE', fontSize: '14px', fontWeight: 500,
    fontFamily: 'Georgia, serif', cursor: 'pointer', marginBottom: '12px',
  },
  helper: {
    fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', textAlign: 'center', margin: 0,
  },
}