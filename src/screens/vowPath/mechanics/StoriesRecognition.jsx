import { useState, useEffect, useMemo } from 'react'

// =====================================================================
// Four stories (Reflect · Day 13) — recognition, not agreement.
// Read each vignette, then place yourself on a recognition slider
// (not me ⇄ that's exactly me). A closing summary shows where you saw
// the most of yourself. Saves familiar_count / total_stories
// (portrait-compatible) plus per-story recognition + most_familiar.
// =====================================================================

const LABELS = { 1: 'Not me at all', 2: 'A little', 3: 'Some of this', 4: 'A lot of this', 5: "That's exactly me" }
const FAMILIAR_AT = 4

export default function StoriesRecognition({ stories = [], promptText, existingData, onSave, saving }) {
  const [idx, setIdx] = useState(0) // 0..n-1, then 'summary'
  const [values, setValues] = useState({}) // id -> 1..5

  useEffect(() => {
    if (!existingData?.responses) return
    const v = {}
    Object.entries(existingData.responses).forEach(([id, r]) => {
      v[id] = typeof r === 'number' ? r : r === 'familiar' ? 5 : r === 'not_familiar' ? 1 : 3
    })
    setValues(v); setIdx('summary')
  }, [existingData])

  const valOf = (id) => values[id] ?? 3
  const setVal = (id, n) => setValues(p => ({ ...p, [id]: n }))
  const familiarCount = useMemo(() => stories.filter(s => valOf(s.id) >= FAMILIAR_AT).length, [values, stories])
  const mostFamiliar = useMemo(() => [...stories].sort((a, b) => valOf(b.id) - valOf(a.id))[0], [values, stories])

  const save = () => {
    onSave({
      responses: Object.fromEntries(stories.map(s => [s.id, valOf(s.id)])),
      familiar_count: familiarCount,
      total_stories: stories.length,
      most_familiar: familiarCount > 0 ? mostFamiliar?.id : null,
    })
  }

  // ---------------- SUMMARY ----------------
  if (idx === 'summary') {
    const summaryLine = familiarCount === 0
      ? "None of the four landed as strongly familiar — and that's real information, not a wrong answer. Recognition can't be forced; it either matched something or it didn't."
      : `Of the four, you saw the most of yourself in ${mostFamiliar?.intro?.split(',')[0] || 'one of them'}. Recognition isn't agreement — it's the detail in someone else's account that quietly matched something in yours. ${familiarCount} of the four landed as familiar. The ones that did are worth sitting with.`
    return (
      <div>
        <p style={S.lead}>Where you saw yourself, and where you didn't.</p>
        <div style={S.recapWrap}>
          {stories.map(s => {
            const v = valOf(s.id)
            return (
              <div key={s.id} style={S.recapRow}>
                <span style={S.recapName}>{s.intro?.split(',')[0] || s.id}</span>
                <span style={S.recapTrack}>
                  <span style={{ ...S.recapFill, width: `${(v / 5) * 100}%`, opacity: 0.35 + (v / 5) * 0.65 }} />
                </span>
                <span style={S.recapVal}>{LABELS[v]}</span>
              </div>
            )
          })}
        </div>
        <p style={S.reading}>{summaryLine}</p>
        <div style={S.row2}>
          <button onClick={() => setIdx(stories.length - 1)} style={S.back}>‹ Back</button>
          <button onClick={save} disabled={saving} style={{ ...S.cta, flex: 1, marginTop: 0, ...(saving ? S.ctaOff : {}) }}>
            {saving ? 'Saving…' : 'Done ›'}
          </button>
        </div>
      </div>
    )
  }

  // ---------------- A STORY ----------------
  const story = stories[idx]
  if (!story) return null
  const v = valOf(story.id)
  const last = idx === stories.length - 1
  return (
    <div>
      <div style={S.dots}>
        {stories.map((_, i) => <span key={i} style={{ ...S.dot, ...(i === idx ? S.dotOn : i < idx ? S.dotDone : {}) }} />)}
      </div>
      <div style={S.storyCard}>
        <p style={S.storyName}>{story.intro}</p>
        <p style={S.storyBody}>{story.body}</p>
      </div>
      <p style={S.qPrompt}>{promptText || 'How much of this is familiar?'}</p>
      <div style={S.sliderWrap}>
        <input type="range" min="1" max="5" step="1" value={v} onChange={e => setVal(story.id, Number(e.target.value))} style={S.slider} />
        <div style={S.sliderEnds}><span>not me</span><span>exactly me</span></div>
        <p style={S.sliderLabel}>{LABELS[v]}</p>
      </div>
      <div style={S.row2}>
        {idx > 0 && <button onClick={() => setIdx(idx - 1)} style={S.back}>‹ Back</button>}
        <button onClick={() => setIdx(last ? 'summary' : idx + 1)} style={{ ...S.cta, flex: 1, marginTop: 0 }}>
          {last ? 'See what you saw ›' : 'Next story ›'}
        </button>
      </div>
    </div>
  )
}

const S = {
  lead: { fontSize: '15px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: '0 0 1.2rem' },
  dots: { display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1.1rem' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', background: '#E0D5C2' },
  dotOn: { background: '#C5572C', transform: 'scale(1.25)' },
  dotDone: { background: '#C9A86F' },
  storyCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #E8DFD0', borderRadius: '16px', padding: '1.2rem 1.25rem', boxShadow: '0 3px 14px rgba(80,50,20,0.06)' },
  storyName: { fontSize: '12px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', letterSpacing: '0.02em', margin: '0 0 0.7rem' },
  storyBody: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.66, margin: 0 },
  qPrompt: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '1.3rem 0 0.7rem' },
  sliderWrap: { padding: '0 2px 0.4rem' },
  slider: { width: '100%', height: '8px', borderRadius: '4px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(90deg, #DDCFB6 0%, #C5572C 100%)', outline: 'none', cursor: 'pointer', accentColor: '#C5572C' },
  sliderEnds: { display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '6px 0 0' },
  sliderLabel: { fontSize: '16px', color: '#5A3A0E', fontFamily: 'Georgia, serif', fontWeight: 500, textAlign: 'center', margin: '0.5rem 0 0' },
  recapWrap: { display: 'flex', flexDirection: 'column', gap: '10px', background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #E8DFD0', borderRadius: '16px', padding: '1.1rem 1.2rem' },
  recapRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  recapName: { fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, width: '64px', flexShrink: 0 },
  recapTrack: { flex: 1, height: '8px', borderRadius: '4px', background: '#EFE7D7', overflow: 'hidden' },
  recapFill: { display: 'block', height: '100%', background: 'linear-gradient(90deg, #C9A86F 0%, #C5572C 100%)', borderRadius: '4px' },
  recapVal: { fontSize: '11px', color: '#7A6A52', fontFamily: 'Georgia, serif', fontStyle: 'italic', width: '78px', textAlign: 'right', flexShrink: 0 },
  reading: { fontSize: '15px', color: '#3A2D1E', fontFamily: 'Georgia, serif', lineHeight: 1.65, margin: '1.2rem 0 1.3rem' },
  cta: { width: '100%', padding: '16px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)', marginTop: '1.1rem' },
  ctaOff: { background: '#C9B894', boxShadow: 'none', cursor: 'not-allowed' },
  row2: { display: 'flex', gap: '10px', alignItems: 'center', marginTop: '1.1rem' },
  back: { padding: '16px 18px', background: 'transparent', color: '#854F0B', border: '0.5px solid #DDCFB6', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
}
