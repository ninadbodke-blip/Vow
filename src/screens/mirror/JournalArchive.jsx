import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

// =====================================================================
// JOURNAL ARCHIVE — every word you've written, kept and re-readable.
// =====================================================================
// Lives inside the Mirror (Oracle) tab as one more quiet "moment".
// Reads every free_stage_signals row of type 'journal' for the user,
// newest first, and lets them re-read — or tap to edit — any entry.
// Editing writes back to the same row with the same payload shape the
// JournalTile uses: { chapter, prompt_id, prompt, response, period_key }.
// =====================================================================

const STAGE_WORD = {
  notice: 'A closer look',
  reflect: 'Weighing it up',
  commit: 'Getting ready',
  endure: 'Early days',
  build: 'Staying steady',
  reclaim: 'Getting back up',
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function JournalArchive() {
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState([])
  const [openId, setOpenId] = useState(null)       // entry being read/expanded
  const [editId, setEditId] = useState(null)       // entry being edited
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return
      const { data } = await supabase
        .from('free_stage_signals')
        .select('id, stage, payload, created_at')
        .eq('user_id', user.id)
        .eq('signal_type', 'journal')
        .order('created_at', { ascending: false })
      if (cancelled) return
      // keep only rows that actually hold a written response
      const rows = (data || []).filter(r => r?.payload?.response && r.payload.response.trim())
      setEntries(rows)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const beginEdit = (entry) => {
    setEditId(entry.id)
    setDraft(entry.payload.response || '')
  }

  const saveEdit = async (entry) => {
    const text = draft.trim()
    if (!text || saving) return
    setSaving(true)
    const payload = { ...entry.payload, response: text }
    const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', entry.id)
    setSaving(false)
    if (error) { alert('Could not save. Please try again.'); return }
    setEntries(prev => prev.map(e => (e.id === entry.id ? { ...e, payload } : e)))
    setEditId(null)
  }

  if (loading) return null
  if (entries.length === 0) {
    return (
      <div style={S.empty}>
        <p style={S.emptyText}>Your written words will gather here — a page you can always come back to.</p>
      </div>
    )
  }

  const shown = showAll ? entries : entries.slice(0, 4)

  return (
    <div>
      <p style={S.sectionEyebrow}>In your words</p>
      <p style={S.sectionSub}>Everything you've written, kept. Tap any entry to read it — or change it.</p>

      <div style={S.list}>
        {shown.map((entry) => {
          const isOpen = openId === entry.id
          const isEditing = editId === entry.id
          const { prompt, response } = entry.payload
          return (
            <div key={entry.id} style={S.card}>
              <button
                style={S.cardHead}
                onClick={() => { if (!isEditing) setOpenId(isOpen ? null : entry.id) }}
              >
                <span style={S.cardMeta}>
                  <span style={S.cardDate}>{formatDate(entry.created_at)}</span>
                  {entry.stage && STAGE_WORD[entry.stage] && (
                    <span style={S.cardStage}>{STAGE_WORD[entry.stage]}</span>
                  )}
                </span>
                <span style={S.cardPrompt}>{prompt}</span>
                {!isOpen && !isEditing && (
                  <span style={S.cardPeek}>{response}</span>
                )}
              </button>

              {(isOpen || isEditing) && (
                <div style={S.cardBody}>
                  {isEditing ? (
                    <>
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        style={S.textarea}
                        rows={5}
                        autoFocus
                      />
                      <div style={S.editRow}>
                        <button style={S.cancelBtn} onClick={() => setEditId(null)} disabled={saving}>Cancel</button>
                        <button style={S.saveBtn} onClick={() => saveEdit(entry)} disabled={saving}>
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={S.response}>{response}</p>
                      <button style={S.editBtn} onClick={() => beginEdit(entry)}>Edit this entry</button>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {entries.length > 4 && !showAll && (
        <button style={S.moreBtn} onClick={() => setShowAll(true)}>
          Show all {entries.length} entries
        </button>
      )}
    </div>
  )
}

const S = {
  sectionEyebrow: { fontSize: 11, color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  sectionSub: { fontSize: 13, color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 14px' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)', border: '0.5px solid #E8DFD0', borderRadius: 16, boxShadow: '0 4px 14px rgba(80,50,20,0.05)', overflow: 'hidden' },
  cardHead: { display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '15px 16px', cursor: 'pointer', fontFamily: 'inherit' },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardDate: { fontSize: 11, color: '#A07A3C', fontFamily: 'Georgia, serif', letterSpacing: '0.02em' },
  cardStage: { fontSize: 9.5, color: '#B0A188', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.12em', borderLeft: '0.5px solid #E0D4BE', paddingLeft: 8 },
  cardPrompt: { display: 'block', fontSize: 14.5, color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4, marginBottom: 5 },
  cardPeek: { display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 13, color: '#9C8C78', fontFamily: 'Georgia, serif', lineHeight: 1.5 },
  cardBody: { padding: '0 16px 16px' },
  response: { fontSize: 14, color: '#3A2A1C', fontFamily: 'Georgia, serif', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: '0 0 12px' },
  editBtn: { background: 'transparent', border: '0.5px solid #DDCFB6', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, cursor: 'pointer', padding: '6px 14px', borderRadius: 9 },
  textarea: { width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: 11, border: '0.5px solid #E2D7C3', background: '#FDFBF6', color: '#2A1F15', fontSize: 14, fontFamily: 'Georgia, serif', lineHeight: 1.6, resize: 'vertical' },
  editRow: { display: 'flex', gap: 9, marginTop: 10 },
  cancelBtn: { flex: 1, padding: '9px', background: 'transparent', border: '0.5px solid #E2D7C3', borderRadius: 10, color: '#6B5C4A', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  saveBtn: { flex: 1, padding: '9px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', border: 'none', borderRadius: 10, color: '#FAF7F1', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  moreBtn: { display: 'block', margin: '14px auto 0', background: 'transparent', border: '0.5px solid #DDCFB6', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, cursor: 'pointer', padding: '8px 18px', borderRadius: 10 },
  empty: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '0.5px solid #E0CDB3', borderRadius: 16, padding: '18px', textAlign: 'center' },
  emptyText: { fontSize: 13.5, color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: 0 },
}