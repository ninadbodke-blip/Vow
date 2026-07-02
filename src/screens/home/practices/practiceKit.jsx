// ===================================================================
// PRACTICE KIT — shared bones of every home practice.
// ===================================================================
// The revamped practices are small living scenes, not forms: each one
// draws itself in the tree's day-world (bark, leaf-greens, gold, cream
// — the same palette as treeEngine), grows from the user's own
// entries, and ends with the science in small serif type.
//
// This module holds what they share: date + supabase helpers for the
// free_stage_signals contracts (append / one-row-per-day), the chip
// rows, the numbered micro-steps, the science footer, and the style
// register the old practices established.
// ===================================================================
import { supabase } from '../../../supabaseClient'

export const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const dayOfYear = () => {
  const now = new Date()
  return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user || null
}

// Latest rows of one signal type, newest first.
export async function loadSignals(type, limit = 60) {
  const user = await getUser()
  if (!user) return []
  const { data } = await supabase
    .from('free_stage_signals')
    .select('id, payload, created_at')
    .eq('user_id', user.id)
    .eq('signal_type', type)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data || []
}

// Today's row of a one-row-per-day signal, or null.
export async function loadTodayRow(type) {
  const user = await getUser()
  if (!user) return null
  const { data } = await supabase
    .from('free_stage_signals')
    .select('id, payload')
    .eq('user_id', user.id)
    .eq('signal_type', type)
    .eq('payload->>date', localDateStr())
    .limit(1)
  return (data && data[0]) || null
}

// Append a new row. Returns the new id, or null.
export async function appendSignal(stage, type, payload) {
  const user = await getUser()
  if (!user) return null
  const { data } = await supabase
    .from('free_stage_signals')
    .insert({ user_id: user.id, stage, signal_type: type, payload })
    .select('id').single()
  return data ? data.id : null
}

// Update an existing row's payload in place.
export async function updateSignal(id, payload) {
  await supabase.from('free_stage_signals').update({ payload }).eq('id', id)
}

// ── shared pieces ──────────────────────────────────────────────────

export function ScienceFooter({ text }) {
  return <p style={K.science}>The science — {text}</p>
}

export function Steps({ items }) {
  return (
    <div style={K.steps}>
      {items.map((s, i) => (
        <div key={i} style={K.stepRow}>
          <span style={K.stepNum}>{i + 1}</span>
          <span style={K.stepText}>{s}</span>
        </div>
      ))}
    </div>
  )
}

export function Chips({ label, options, value, onPick }) {
  return (
    <>
      {label ? <p style={K.q}>{label}</p> : null}
      <div style={K.chips}>
        {options.map((o) => (
          <button key={o} onClick={() => onPick(o)} style={{ ...K.chip, ...(value === o ? K.chipOn : {}) }}>{o}</button>
        ))}
      </div>
    </>
  )
}

// The day-world palette, lifted from treeEngine so every scene
// belongs to the same country as the tree.
export const P = {
  ink: '#3A2A1C', bark: '#82603F', barkDark: '#5F4429',
  deep: '#5F7048', mid: '#74875A', light: '#93A36B', pale: '#ACB97E',
  goldgreen: '#B2A45E', gold: '#C9A85C', goldSoft: '#E9C98E', glow: '#F6E8C4',
  wash: '#DCC9A6', mound: '#B89B72', stone: '#C4B49A', stoneEdge: '#A8916A',
  deepGold: '#854F0B', muted: '#9C8C78', body: '#6B5C4A', paper: '#FDFBF6',
}

export const K = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 12px' },
  q: { fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: 14.5, fontWeight: 500, margin: '14px 0 8px' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: { padding: '8px 12px', borderRadius: 999, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#3A2A1C', fontFamily: 'Georgia, serif', fontSize: 12.5, cursor: 'pointer' },
  chipOn: { background: '#F4ECDD', border: '1px solid #C9A85C' },
  ownInput: { width: '100%', boxSizing: 'border-box', marginTop: 8, padding: '10px 12px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FDFBF6', fontFamily: 'Georgia, serif', fontSize: 13, color: '#2A1F15', outline: 'none' },
  saveBtn: { width: '100%', marginTop: 18, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  saveBtnDim: { opacity: 0.45, cursor: 'default' },
  savedCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: 14, padding: '16px 15px', textAlign: 'center' },
  savedLine: { fontFamily: 'Georgia, serif', fontSize: 14.5, color: '#2A1F15', margin: 0 },
  savedSub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#9C8C78', margin: '5px 0 0' },
  editLink: { display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' },
  // the scene — every practice's living picture
  stage: { position: 'relative', width: '100%', borderRadius: 16, overflow: 'hidden', border: '0.5px solid #E2D7C3', boxShadow: '0 6px 18px -8px rgba(80,50,20,0.18)', margin: '4px 0 12px', background: '#FBF5E8' },
  // numbered micro-steps
  steps: { display: 'flex', flexDirection: 'column', gap: 7, margin: '2px 0 12px' },
  stepRow: { display: 'flex', gap: 9, alignItems: 'flex-start' },
  stepNum: { width: 17, height: 17, borderRadius: '50%', background: '#F4ECDD', border: '0.5px solid #C9A85C', color: '#854F0B', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  stepText: { fontFamily: 'Georgia, serif', fontSize: 12.5, color: '#6B5C4A', lineHeight: 1.5 },
  // the pattern read-back — what the data says so far
  pattern: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '0.5px solid #E8DCC2', borderRadius: 12, padding: '11px 13px', margin: '10px 0 0' },
  patternLabel: { fontSize: 9.5, color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, margin: '0 0 4px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  patternText: { fontFamily: 'Georgia, serif', fontSize: 13, color: '#2A1F15', lineHeight: 1.5, margin: 0 },
  // the science, pinned last
  science: { fontSize: 11, color: '#9C8C78', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: '16px auto 0', maxWidth: 320, borderTop: '0.5px solid #EFE7D7', paddingTop: 11 },
  doneLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#854F0B', textAlign: 'center', margin: '10px 0 0' },
}