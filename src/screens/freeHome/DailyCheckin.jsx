import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../supabaseClient'
import SheetPortal from '../../components/SheetPortal'
import { reflectionFor } from './checkinReflections'

// ===================================================================
// DAILY CHECK-IN — the tending ritual (shared across all free homes)
// ===================================================================
// Three quick inputs, no typing:
//   1. "How heavy was today?"   — slider  -> mood_score (1..6)
//   2. "How was the craving?"   — slider  -> felt_pull + pull_intensity
//   3. "Where are you tonight?" — tap one -> end-state (the quote anchor)
//
// On Tend: saves to free_daily_checkins (same shape as before), computes
// a reflection quote from the combination, and hands BOTH the row and the
// reflection to onSaved(). The home then rustles the tree and floats the
// quote up — so this sheet just closes.
//
// Props: isOpen, onClose, stage, includeBody (ignored now), existing, onSaved
//
// MOOD_META + moodBy* are still exported unchanged (Mirror & other homes
// read them); mood_score still spans 1..6 so nothing downstream shifts.
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

// ---- input 1: heaviness. slider 0..100 -> mood_score 6..1 (heavy = low score)
const HEAVY_STOPS = ['light', 'manageable', 'a lot', 'heavy', 'crushing']
function heavyLabel(v) { return HEAVY_STOPS[Math.min(HEAVY_STOPS.length - 1, Math.floor(v / (100 / HEAVY_STOPS.length)))] }
// map heaviness 0..1 -> mood_score 6..1, and to a MOOD_META entry for color/value
function moodFromHeaviness(v01) {
  const score = Math.max(1, Math.min(6, Math.round(6 - v01 * 5)))
  return moodByScore(score)
}

// ---- input 2: craving. slider 0..100 -> felt_pull + pull_intensity (0..5)
const CRAVE_STOPS = ['never came', 'faint', 'medium', 'strong', 'intense']
function craveLabel(v) { return CRAVE_STOPS[Math.min(CRAVE_STOPS.length - 1, Math.floor(v / (100 / CRAVE_STOPS.length)))] }
function pullFromCraving(v01) {
  // 0 => not felt; otherwise intensity 1..5
  if (v01 <= 0.02) return { felt: false, intensity: null }
  return { felt: true, intensity: Math.max(1, Math.min(5, Math.round(v01 * 5))) }
}

// ---- input 3: end-state taps (the quote's anchor) ----
const END_STATES = [
  { value: 'proud',       label: 'Proud' },
  { value: 'calm',        label: 'Calm' },
  { value: 'drained',     label: 'Drained' },
  { value: 'restless',    label: 'Restless' },
  { value: 'frustrated',  label: 'Frustrated' },
  { value: 'heavyhearted',label: 'Heavy-hearted' },
  { value: 'steady',      label: 'Steady' },
  { value: 'hopeful',     label: 'Hopeful' },
]

// recover slider positions from an existing row (so "Tend again" pre-fills)
function heavyFromExisting(row) {
  if (!row || row.mood_score == null) return 50
  return Math.round((6 - row.mood_score) / 5 * 100)
}
function craveFromExisting(row) {
  if (!row || row.felt_pull == null) return 0
  if (!row.felt_pull) return 0
  return Math.round((row.pull_intensity || 3) / 5 * 100)
}

function localDateStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const LeafGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 19C5 9 12 4 20 4c0 8-5 15-15 15z" />
    <path d="M5 19c3-5 7-9 11-11" />
  </svg>
)

const FADE_CSS = `
@keyframes vowCkFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .vowCkFade { animation: none !important; } }`

// ---- a calm gradient slider (shared by both inputs) ----
function FeelSlider({ value, onChange, gradient, stops, disabled }) {
  const trackRef = useRef(null)
  const draggingRef = useRef(false)

  const pickFromX = (clientX) => {
    const el = trackRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    onChange(Math.round(t * 100))
  }
  const onDown = (e) => {
    if (disabled) return
    draggingRef.current = true
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId)
    pickFromX(e.clientX)
  }
  const onMove = (e) => { if (draggingRef.current) pickFromX(e.clientX) }
  const onUp = () => { draggingRef.current = false }

  return (
    <div style={S.sliderWrap}>
      <div
        ref={trackRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        style={{ ...S.sliderTrack, background: gradient, touchAction: 'none' }}
      >
        <span style={{ ...S.sliderThumb, left: `${value}%` }} />
      </div>
      <div style={S.sliderEnds}>
        {stops.map((s, i) => (
          <span key={i} style={{ ...S.sliderEnd, ...(craveOrHeavyActive(value, i, stops.length) ? S.sliderEndOn : {}) }}>{s}</span>
        ))}
      </div>
    </div>
  )
}
// highlight the stop label closest to the current value
function craveOrHeavyActive(value, i, n) {
  const active = Math.min(n - 1, Math.floor(value / (100 / n)))
  return active === i
}

export default function DailyCheckin({
  isOpen,
  onClose,
  stage = 'notice',
  includeBody = false, // eslint-disable-line no-unused-vars
  existing = null,
  onSaved,
}) {
  const [heavy, setHeavy] = useState(50)       // 0..100
  const [crave, setCrave] = useState(0)        // 0..100
  const [endState, setEndState] = useState(null)
  const [energy, setEnergy] = useState(null)   // preserved from existing; no UI
  const [touched, setTouched] = useState(false) // did they move/confirm the sliders
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setSaving(false)
    if (existing) {
      setHeavy(heavyFromExisting(existing))
      setCrave(craveFromExisting(existing))
      setEndState(existing.end_state || null)
      setEnergy(existing.energy ?? null)
      setTouched(true)
    } else {
      setHeavy(50); setCrave(0); setEndState(null); setEnergy(null); setTouched(false)
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null

  const canTend = touched && !!endState

  const handleSave = async () => {
    if (saving || !canTend) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSaving(false); return }

      const h01 = heavy / 100
      const c01 = crave / 100
      const moodEntry = moodFromHeaviness(h01)
      const pull = pullFromCraving(c01)

      const row = {
        user_id: user.id,
        stage,
        checkin_date: localDateStr(),
        mood: moodEntry?.value ?? null,
        mood_score: moodEntry?.score ?? null,
        energy: energy ?? null,
        felt_pull: pull.felt,
        pull_intensity: pull.intensity,
        end_state: endState,
        contexts: [],
        body_signals: [],
        note: null,
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

      // compute the reflection from the combination
      const reflection = reflectionFor({ heaviness: h01, craving: c01, endState, stage })

      setSaving(false)
      // hand the row + reflection up; the home rustles the tree + floats the quote
      if (onSaved) onSaved(data, reflection)
      onClose()
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const todayNice = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <SheetPortal><div style={S.overlay} onClick={onClose}>
      <style>{FADE_CSS}</style>
      <div style={S.card} onClick={(e) => e.stopPropagation()}>
        <div style={S.content}>

          <div style={S.header}>
            <span style={S.headerGlyph}><LeafGlyph /></span>
            <div style={S.headerText}>
              <p style={S.eyebrow}>Tending</p>
              <p style={S.dateLine}>{todayNice}</p>
            </div>
            <button onClick={onClose} style={S.closeBtn} disabled={saving} aria-label="Close">×</button>
          </div>

          {/* 1 — the day */}
          <p style={S.q}>How heavy was today?</p>
          <FeelSlider
            value={heavy}
            onChange={(v) => { setHeavy(v); setTouched(true) }}
            gradient="linear-gradient(90deg, #7E9B5A 0%, #B9A07E 50%, #8A5A3C 100%)"
            stops={HEAVY_STOPS}
            disabled={saving}
          />

          {/* 2 — the craving */}
          <p style={S.q}>How was the craving today?</p>
          <FeelSlider
            value={crave}
            onChange={(v) => { setCrave(v); setTouched(true) }}
            gradient="linear-gradient(90deg, #B9C89E 0%, #D9B57A 55%, #B0603F 100%)"
            stops={CRAVE_STOPS}
            disabled={saving}
          />

          {/* 3 — where you are tonight */}
          <p style={S.q}>Where are you tonight?</p>
          <div style={S.stateWrap}>
            {END_STATES.map(s => (
              <button
                key={s.value}
                onClick={() => setEndState(s.value)}
                disabled={saving}
                style={{ ...S.stateChip, ...(endState === s.value ? S.stateChipOn : {}) }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !canTend}
            style={{ ...S.tendBtn, opacity: canTend ? 1 : 0.4 }}
          >
            {saving ? 'Tending…' : existing ? 'Tend again' : 'Tend the tree'}
          </button>

          <p style={S.helper}>There's no wrong answer here. Just what's true.</p>
        </div>
      </div>
    </div></SheetPortal>
  )
}

const S = {
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

  q: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '20px 0 12px' },

  // sliders
  sliderWrap: { padding: '2px 4px 0' },
  sliderTrack: {
    position: 'relative', height: '14px', borderRadius: '999px',
    border: '0.5px solid rgba(60,40,20,0.18)', cursor: 'pointer',
    boxShadow: 'inset 0 1px 3px rgba(60,40,20,0.18)',
  },
  sliderThumb: {
    position: 'absolute', top: '50%', width: '26px', height: '26px', borderRadius: '50%',
    background: '#FAF7F1', border: '2.5px solid #3A2A1C', transform: 'translate(-50%, -50%)',
    boxShadow: '0 2px 8px rgba(60,40,20,0.35)', pointerEvents: 'none',
    transition: 'left 0.12s ease',
  },
  sliderEnds: { display: 'flex', justifyContent: 'space-between', marginTop: '9px', padding: '0 1px' },
  sliderEnd: { fontSize: '10.5px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#B9A88E', transition: 'color 0.2s ease' },
  sliderEndOn: { color: '#854F0B', fontWeight: 500 },

  // end-state taps
  stateWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  stateChip: {
    padding: '9px 15px', borderRadius: '999px', border: '0.5px solid #E2D7C3',
    background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', fontSize: '13.5px', cursor: 'pointer',
  },
  stateChipOn: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#F6E8C4', border: '0.5px solid #241710' },

  tendBtn: {
    width: '100%', marginTop: '22px', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    border: '0.5px solid rgba(217,181,122,0.35)',
    borderRadius: '13px', color: '#FAF7F1', fontSize: '14.5px', fontWeight: 500,
    fontFamily: 'Georgia, serif', cursor: 'pointer',
    boxShadow: '0 6px 16px -6px rgba(30,18,8,0.5)',
  },
  helper: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '10px 0 0' },
}