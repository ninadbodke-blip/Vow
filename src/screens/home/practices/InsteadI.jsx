import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "Instead, I…"  (Early Days)
// ===================================================================
// Log what you did instead of using, and how it shifted you. Over time
// it builds personal evidence of what actually helps. One row per log
// in free_activity_logs (activity_type, mood_before, mood_after).
//
// The options are deliberately non-overlapping — each is a different
// mechanism of relief: body / people / food / screen / hands / spirit /
// sleep. Old data values (reached, absorbed, rested, moved, outside,
// made) still resolve in the insight line via LEGACY_LABELS.
// ===================================================================

const ACTIVITY_TYPES = [
  { value: 'walk',     label: 'Went for a walk or workout',     icon: '🚶' },
  { value: 'reached',  label: 'Talked to someone',              icon: '💬' },
  { value: 'food',     label: 'Had something to eat',            icon: '🍽️' },
  { value: 'absorbed', label: 'Watched or listened to something', icon: '📺' },
  { value: 'work',     label: 'Got busy with work or chores',   icon: '🧹' },
  { value: 'calm',     label: 'Prayed or meditated',            icon: '🙏' },
  { value: 'rested',   label: 'Slept or rested',                icon: '😴' },
  { value: 'other',    label: 'Something else',                 icon: '✨' },
]

const MOOD_FACES = ['😣', '😕', '😐', '🙂', '😄']

// Labels for types still in the picker + types from older logs, so the
// insight line never renders "undefined".
const LEGACY_LABELS = {
  moved: 'Moving your body',
  outside: 'Getting outside',
  made: 'Making something',
}
const INSIGHT_PHRASE = {
  walk: 'a walk or workout',
  reached: 'talking to someone',
  food: 'something to eat',
  absorbed: 'watching or listening to something',
  work: 'getting busy with work',
  calm: 'praying or meditating',
  rested: 'sleeping or resting',
  other: 'doing something else',
  moved: 'moving your body',
  outside: 'getting outside',
  made: 'making something',
}

function activityInsight(logs) {
  const byType = {}
  for (const l of logs) {
    if (l.mood_before == null || l.mood_after == null) continue
    const t = l.activity_type
    if (!byType[t]) byType[t] = { sum: 0, n: 0 }
    byType[t].sum += (l.mood_after - l.mood_before)
    byType[t].n += 1
  }
  let best = null
  for (const [t, { sum, n }] of Object.entries(byType)) {
    if (n < 3) continue
    const lift = sum / n
    if (lift > 0.3 && (!best || lift > best.lift)) best = { type: t, lift, n }
  }
  return best
}

function MoodFaces({ label, value, onChange, disabled }) {
  return (
    <div style={styles.faceRow}>
      <span style={styles.faceLabel}>{label}</span>
      <div style={styles.faceBtns}>
        {MOOD_FACES.map((f, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            disabled={disabled}
            style={{ ...styles.faceBtn, ...(value === i + 1 ? styles.faceBtnOn : {}) }}
            aria-label={`${label} ${i + 1} of 5`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function InsteadI({ stage = 'endure' }) {
  const [logs, setLogs] = useState([])
  const [type, setType] = useState(null)
  const [before, setBefore] = useState(null)
  const [after, setAfter] = useState(null)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('free_activity_logs').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(40)
      if (!cancelled && data) setLogs(data)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const insight = activityInsight(logs)
  const reset = () => { setType(null); setBefore(null); setAfter(null) }

  const handleSave = async () => {
    if (saving || !type || !before || !after) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: saved, error } = await supabase
        .from('free_activity_logs')
        .insert({
          user_id: user.id, stage,
          activity_type: type, mood_before: before, mood_after: after,
        })
        .select().single()
      if (error) {
        console.error('Failed to save activity:', error)
        alert('Could not save. Please try again.')
        setSaving(false); return
      }
      if (saved) setLogs(prev => [saved, ...prev].slice(0, 40))
      setSaving(false); reset(); setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2800)
    } catch (err) {
      console.error(err); setSaving(false)
    }
  }

  return (
    <div>
      <p style={styles.body}>
        When the urge came — or the empty hour did — what did you do instead? It's worth keeping.
      </p>

      <div style={styles.actChips}>
        {ACTIVITY_TYPES.map(a => (
          <button
            key={a.value}
            onClick={() => { setType(a.value); setJustSaved(false) }}
            disabled={saving}
            style={{ ...styles.actChip, ...(type === a.value ? styles.actChipOn : {}) }}
          >
            <span style={styles.actChipIcon}>{a.icon}</span> {a.label}
          </button>
        ))}
      </div>

      {type && (
        <div>
          <MoodFaces label="Before you did it" value={before} onChange={setBefore} disabled={saving} />
          <MoodFaces label="And after" value={after} onChange={setAfter} disabled={saving} />
          {before && after && (
            <div style={styles.shiftRow}>
              <span style={styles.shiftFace}>{MOOD_FACES[before - 1]}</span>
              <span style={styles.shiftArrow}>→</span>
              <span style={styles.shiftFace}>{MOOD_FACES[after - 1]}</span>
              <span style={styles.shiftDelta}>
                {after > before
                  ? `+${after - before} lighter — that's the point`
                  : after < before
                    ? "still heavy, and that's okay"
                    : 'held steady'}
              </span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !before || !after}
            style={{ ...styles.saveBtn, ...((!before || !after) ? styles.saveBtnDim : {}) }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {justSaved && (
        <p style={styles.savedNote}>Saved. That counts — you did something else with that hour.</p>
      )}

      {insight && !type && (
        <p style={styles.insight}>
          You tend to feel lighter after {INSIGHT_PHRASE[insight.type] || LEGACY_LABELS[insight.type] || 'that'}.
          <span style={styles.insightSub}> Based on {insight.n} times.</span>
        </p>
      )}

      {!type && !justSaved && !insight && (
        <p style={styles.helper}>
          Even small things count. What helps you becomes a pattern over time.
        </p>
      )}
    </div>
  )
}

const styles = {
  body: { fontSize: '13.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', lineHeight: 1.55, margin: '0 0 14px' },
  actChips: { display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '12px' },
  actChip: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 12px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '18px', fontSize: '12.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer', textAlign: 'left' },
  actChipOn: { border: '1.5px solid #854F0B', background: '#FBF6EE' },
  actChipIcon: { fontSize: '14px' },
  faceRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', margin: '0 0 10px' },
  faceLabel: { fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  faceBtns: { display: 'flex', gap: '5px' },
  faceBtn: { width: '34px', height: '34px', borderRadius: '50%', border: '0.5px solid #E0D5C2', background: 'white', fontSize: '16px', cursor: 'pointer', padding: 0, lineHeight: 1 },
  faceBtnOn: { border: '1.5px solid #854F0B', background: '#FBF6EE' },
  shiftRow: { display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 12px', flexWrap: 'wrap' },
  shiftFace: { fontSize: '18px' },
  shiftArrow: { color: '#9C8C78', fontSize: '13px' },
  shiftDelta: { fontSize: '12px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  saveBtn: { width: '100%', padding: '12px', background: '#854F0B', border: 'none', borderRadius: '12px', color: '#FBF6EE', fontSize: '13.5px', fontWeight: 500, fontFamily: 'Georgia, serif', cursor: 'pointer' },
  saveBtnDim: { opacity: 0.45, cursor: 'not-allowed' },
  savedNote: { fontSize: '12.5px', color: '#5F8A4E', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '10px 0 0', textAlign: 'center' },
  insight: { fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: '6px 0 0', lineHeight: 1.5 },
  insightSub: { color: '#9C8C78', fontStyle: 'italic', fontSize: '12px' },
  helper: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '4px 0 0' },
}