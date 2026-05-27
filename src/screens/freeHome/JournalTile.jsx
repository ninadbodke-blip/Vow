import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../supabaseClient'
import SheetPortal from '../../components/SheetPortal'
import { JOURNAL_PROMPTS, chaptersFor } from './journalPrompts'

// ===================================================================
// JOURNAL TILE  (shared across all six free homes)
// ===================================================================
// Shows 5 prompts for the period, invites any 3, all free. Daily for every
// stage except Build (weekly). Each saved response is one row in
// free_stage_signals { signal_type:'journal', payload:{ chapter, prompt_id,
// prompt, response, period_key } } — rich, categorical, AI-narratable data.
// Self-contained: fetches its own user + this period's entries, like DailyCheckin.
// ===================================================================

const TARGET = 3

function pad(n) { return String(n).padStart(2, '0') }
function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function mondayOf(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  d.setHours(0, 0, 0, 0)
  return d
}
// stable integer index from a YYYY-MM-DD key
function periodIndex(periodKey) {
  return Math.floor(Date.parse(periodKey + 'T00:00:00') / 86400000)
}

// Deterministic 5-of-the-period: skip one chapter (rotating day to day), take
// one prompt from each of the other five. Same 5 all period; varied across
// chapters; cycles through the whole bank over time.
function pickPrompts(stage, periodKey) {
  const all = JOURNAL_PROMPTS[stage] || []
  const chapters = chaptersFor(stage)
  if (!chapters.length) return []
  const idx = periodIndex(periodKey)
  const skip = ((idx % chapters.length) + chapters.length) % chapters.length
  const picks = []
  chapters.forEach((ch, ci) => {
    if (ci === skip) return
    const inCh = all.filter(p => p.chapter === ch)
    if (!inCh.length) return
    const within = (((idx + ci) % inCh.length) + inCh.length) % inCh.length
    picks.push(inCh[within])
  })
  return picks
}

export default function JournalTile({ stage }) {
  const weekly = stage === 'build'
  const periodKey = useMemo(
    () => (weekly ? localDateStr(mondayOf(new Date())) : localDateStr()),
    [weekly]
  )
  const prompts = useMemo(() => pickPrompts(stage, periodKey), [stage, periodKey])

  const [entries, setEntries] = useState({})   // prompt_id -> { id, response }
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [drafts, setDrafts] = useState({})      // prompt_id -> text
  const [savingId, setSavingId] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('free_stage_signals')
        .select('id, payload')
        .eq('user_id', user.id)
        .eq('stage', stage)
        .eq('signal_type', 'journal')
        .eq('payload->>period_key', periodKey)
      if (cancelled) return
      const map = {}
      ;(data || []).forEach(row => {
        const pid = row.payload && row.payload.prompt_id
        if (pid) map[pid] = { id: row.id, response: (row.payload && row.payload.response) || '' }
      })
      setEntries(map)
    }
    load()
    return () => { cancelled = true }
  }, [stage, periodKey])

  const doneCount = Object.values(entries).filter(e => e.response && e.response.trim()).length

  const openModal = () => {
    // seed drafts from any saved responses
    const seed = {}
    prompts.forEach(p => { if (entries[p.id]) seed[p.id] = entries[p.id].response })
    setDrafts(seed)
    setExpandedId(null)
    setOpen(true)
  }

  const handleSave = async (prompt) => {
    const text = (drafts[prompt.id] || '').trim()
    if (!text) return
    setSavingId(prompt.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSavingId(null); return }
    const payload = {
      chapter: prompt.chapter,
      prompt_id: prompt.id,
      prompt: prompt.text,
      response: text,
      period_key: periodKey,
    }
    const existing = entries[prompt.id]
    let ok = false
    if (existing && existing.id) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', existing.id)
      ok = !error
      if (!ok) console.error('Journal update failed:', error)
      if (ok) setEntries(prev => ({ ...prev, [prompt.id]: { id: existing.id, response: text } }))
    } else {
      const { data, error } = await supabase
        .from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'journal', payload })
        .select('id').single()
      ok = !error && !!data
      if (!ok) console.error('Journal insert failed:', error)
      if (ok) setEntries(prev => ({ ...prev, [prompt.id]: { id: data.id, response: text } }))
    }
    setSavingId(null)
    if (ok) setExpandedId(null)
    else alert('Could not save. Please try again.')
  }

  const periodWord = weekly ? 'week' : 'day'

  // ---- tile face ----
  let face
  if (doneCount >= TARGET) {
    face = (
      <div style={{ ...styles.tile, ...styles.tileDone }}>
        <p style={styles.eyebrow}>Journal</p>
        <div style={styles.doneRow}>
          <span style={styles.doneCheck}>{'\u2713'}</span>
          <div>
            <p style={styles.doneTitle}>{doneCount} written this {periodWord}.</p>
            <p style={styles.doneSub}>That's a full {periodWord}. You can stop here, or keep going.</p>
          </div>
        </div>
        <button onClick={openModal} style={styles.ghostBtn}>Open journal</button>
      </div>
    )
  } else if (doneCount > 0) {
    face = (
      <div style={styles.tile}>
        <p style={styles.eyebrow}>Journal</p>
        <h2 style={styles.title}>{doneCount} of {TARGET} this {periodWord}.</h2>
        <p style={styles.body}>A little more, if you have it in you. Any three makes a full {periodWord}.</p>
        <button onClick={openModal} style={styles.ctaBtn}>Continue</button>
      </div>
    )
  } else {
    face = (
      <div style={styles.tile}>
        <p style={styles.eyebrow}>Journal</p>
        <h2 style={styles.title}>Write a little, this {periodWord}.</h2>
        <p style={styles.body}>Five small things to think about. Do any three — a few honest lines is plenty.</p>
        <button onClick={openModal} style={styles.ctaBtn}>Open journal</button>
      </div>
    )
  }

  return (
    <>
      {face}
      {open && (
        <SheetPortal><div style={styles.overlay} onClick={() => setOpen(false)}>
          <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.sheetHead}>
              <div>
                <p style={styles.eyebrow}>Journal</p>
                <h2 style={styles.sheetTitle}>A few things to sit with</h2>
              </div>
              <button onClick={() => setOpen(false)} style={styles.closeBtn} aria-label="Close">{'\u00d7'}</button>
            </div>
            <p style={styles.sheetSub}>
              Pick whichever ones speak to you. Any three is a full {periodWord} &mdash; {doneCount} so far.
            </p>

            <div style={styles.promptList}>
              {prompts.map(p => {
                const saved = entries[p.id]
                const isDone = saved && saved.response && saved.response.trim()
                const isOpen = expandedId === p.id
                return (
                  <div key={p.id} style={{ ...styles.promptCard, ...(isDone ? styles.promptCardDone : {}) }}>
                    <button
                      onClick={() => setExpandedId(isOpen ? null : p.id)}
                      style={styles.promptHeadBtn}
                    >
                      <span style={styles.promptChapter}>{p.chapter}{isDone ? `  ${'\u2713'}` : ''}</span>
                      <span style={styles.promptText}>{p.text}</span>
                    </button>

                    {!isOpen && isDone && (
                      <p style={styles.savedPeek} onClick={() => setExpandedId(p.id)}>
                        {saved.response}
                      </p>
                    )}

                    {isOpen && (
                      <div style={styles.editBlock}>
                        <textarea
                          value={drafts[p.id] || ''}
                          onChange={(e) => setDrafts(prev => ({ ...prev, [p.id]: e.target.value }))}
                          placeholder="A few honest lines…"
                          rows={4}
                          style={styles.textarea}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(p)}
                          disabled={!(drafts[p.id] || '').trim() || savingId === p.id}
                          style={{ ...styles.saveBtn, ...(!(drafts[p.id] || '').trim() || savingId === p.id ? styles.saveBtnDim : {}) }}
                        >
                          {savingId === p.id ? 'Saving…' : isDone ? 'Update' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <button onClick={() => setOpen(false)} style={styles.doneSheetBtn}>Done for now</button>
          </div>
        </div></SheetPortal>
      )}
    </>
  )
}

// ===================================================================
// STYLES  (cohesive with the homes; softer eyebrow + hairline accents)
// ===================================================================
const styles = {
  tile: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '18px',
    padding: '18px 18px 16px',
    boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
  },
  tileDone: { background: 'linear-gradient(180deg, #F6FAE9 0%, #ECF3D5 100%)', border: '0.5px solid #C2D49A' },
  eyebrow: {
    fontSize: '10.5px', color: '#A07A3C', textTransform: 'uppercase',
    letterSpacing: '0.12em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 9px',
  },
  title: { fontSize: '19px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.3, margin: '0 0 10px' },
  body: { fontSize: '13.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 14px' },
  ctaBtn: {
    width: '100%', padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.22)',
  },
  ghostBtn: {
    background: 'transparent', border: 'none', color: '#3B6D11', fontSize: '12.5px',
    fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer', padding: 0,
  },
  doneRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  doneCheck: {
    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)', border: '0.5px solid #C2D49A',
    color: '#3B6D11', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  doneTitle: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 2px', lineHeight: 1.3 },
  doneSub: { fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.4 },

  // ---- modal ----
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(36,23,16,0.5)',
    backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-end',
    justifyContent: 'center', zIndex: 1000, padding: '0',
  },
  sheet: {
    background: '#FAF7F1', width: '100%', maxWidth: '440px',
    borderRadius: '24px 24px 0 0', padding: '20px 18px calc(20px + env(safe-area-inset-bottom))',
    maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 -10px 40px rgba(40,25,10,0.25)',
  },
  sheetHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' },
  sheetTitle: { fontSize: '22px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0, lineHeight: 1.2 },
  closeBtn: {
    background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '26px', lineHeight: 1,
    cursor: 'pointer', padding: '0 4px', fontFamily: 'inherit',
  },
  sheetSub: { fontSize: '12.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '6px 0 16px', lineHeight: 1.5 },

  promptList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  promptCard: { background: '#FFFFFF', border: '0.5px solid #E8DFD0', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 8px rgba(80,50,20,0.04)' },
  promptCardDone: { background: 'linear-gradient(180deg, #FBFDF4 0%, #F4F8E8 100%)', border: '0.5px solid #D2DFB4' },
  promptHeadBtn: {
    display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', width: '100%',
    background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit',
  },
  promptChapter: { fontSize: '9.5px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'Georgia, serif', fontWeight: 500 },
  promptText: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.4 },
  savedPeek: {
    fontSize: '13px', color: '#5A6B3A', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.5, margin: '10px 0 0', cursor: 'pointer',
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  editBlock: { marginTop: '12px' },
  textarea: {
    width: '100%', boxSizing: 'border-box', padding: '12px 13px', background: '#FFFFFF',
    border: '0.5px solid #DDCFB6', borderRadius: '12px', fontSize: '14px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', lineHeight: 1.55, resize: 'vertical', outline: 'none',
    boxShadow: 'inset 0 1px 2px rgba(80,50,20,0.04)',
  },
  saveBtn: {
    marginTop: '10px', width: '100%', padding: '11px', background: '#854F0B', color: '#FBF6EE',
    border: 'none', borderRadius: '11px', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif',
  },
  saveBtnDim: { opacity: 0.45, cursor: 'not-allowed' },
  doneSheetBtn: {
    marginTop: '16px', width: '100%', padding: '13px', background: 'transparent', color: '#6B5C4A',
    border: '0.5px solid #DDCFB6', borderRadius: '12px', fontSize: '13.5px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
  },
}