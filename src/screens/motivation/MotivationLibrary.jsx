import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ARTICLES } from './data/articles'
import { THEMES, THEME_MAP } from './data/themes'
import { supabase } from '../../supabaseClient'
import VowBrandMark from '../../components/VowBrandMark'

// ===================================================================
// MOTIVATION LIBRARY — the full shelf, one weather at a time.
// ===================================================================
// Reached from the category tiles on the Motivation home (or the
// thin "All essays" tile). /app/motivation/library shows everything
// visible to this user; /app/motivation/library/:theme filters to
// one of tonight's weathers. Read essays carry their lit star.
// ===================================================================

export default function MotivationLibrary() {
  const navigate = useNavigate()
  const { theme } = useParams()
  const [substance, setSubstance] = useState(null)
  const [readSlugs, setReadSlugs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (active) setLoading(false); return }
      const { data: vp } = await supabase.from('vow_path_progress')
        .select('primary_substance').eq('user_id', user.id).maybeSingle()
      if (active && vp?.primary_substance) setSubstance(vp.primary_substance)
      const { data: readRows } = await supabase.from('free_stage_signals')
        .select('payload').eq('user_id', user.id).eq('signal_type', 'motivation_read')
      if (active && readRows) setReadSlugs(readRows.map(r => r.payload?.slug).filter(Boolean))
      if (active) setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])

  const themeDef = THEMES.find(t => t.key === theme) || null
  const visible = ARTICLES.filter(a => a.substance === null || a.substance === substance)
  const list = themeDef ? visible.filter(a => (THEME_MAP[themeDef.key] || []).includes(a.slug)) : visible
  const readCount = list.filter(a => readSlugs.includes(a.slug)).length

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.topBar}>
          <button onClick={() => navigate('/app/motivation')} style={styles.backBtn}>&lsaquo; Back</button>
          <span style={styles.brandCenter}><VowBrandMark size={17} /></span>
          <div style={{ width: '60px' }} />
        </div>

        <div style={styles.head}>
          {themeDef && <p style={styles.eyebrow}>Tonight&rsquo;s weather</p>}
          <h1 style={styles.title}>{themeDef ? themeDef.label : 'All essays'}</h1>
          <p style={styles.meta}>
            {list.length} {list.length === 1 ? 'essay' : 'essays'}{readCount ? ` \u00B7 ${readCount} read \u00B7 ${readCount} ${readCount === 1 ? 'star' : 'stars'} lit` : ''}
          </p>
        </div>

        {loading ? (
          <p style={styles.empty}>One moment…</p>
        ) : list.length === 0 ? (
          <p style={styles.empty}>Nothing shelved here yet.</p>
        ) : (
          <div style={styles.list}>
            {list.map(a => {
              const isRead = readSlugs.includes(a.slug)
              return (
                <button key={a.id} onClick={() => navigate(`/app/motivation/article/${a.slug}`)} style={styles.row}>
                  <span style={styles.rowGlyph}>
                    {isRead ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#D9B57A"><path d="M12 3l2.2 5.3L20 9l-4.3 3.8L17 19l-5-3-5 3 1.3-6.2L4 9l5.8-.7z" /></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9B57A" strokeWidth="1.5"><path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4z" /><path d="M5 4v13a3 3 0 003 3" /></svg>
                    )}
                  </span>
                  <span style={styles.rowText}>
                    <span style={styles.rowTitle}>{a.title}</span>
                    {a.subtitle && <span style={styles.rowSub}>{a.subtitle}</span>}
                  </span>
                  <span style={styles.rowMeta}>
                    <span style={isRead ? styles.litStar : styles.hollowStar}>{isRead ? '\u2726' : '\u2727'}</span>
                    <span style={styles.rowMetaText}>{isRead ? 'read' : `${a.readMinutes} min`}</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  frame: { minHeight: '100vh', background: 'linear-gradient(180deg, #FDFBF6 0%, #F6EFDD 100%)', padding: '1.25rem 1rem 3rem', display: 'flex', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  phone: { maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' },

  topBar: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brandCenter: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', pointerEvents: 'none' },
  backBtn: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px', minWidth: '60px', textAlign: 'left' },

  head: { textAlign: 'center', padding: '6px 0 2px' },
  eyebrow: { fontSize: '9.5px', letterSpacing: '0.26em', textTransform: 'uppercase', color: '#854F0B', fontFamily: 'Georgia, serif', margin: '0 0 7px' },
  title: { fontSize: '24px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0, lineHeight: 1.25 },
  meta: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '8px 0 0', fontVariantNumeric: 'tabular-nums' },

  list: { display: 'flex', flexDirection: 'column', gap: '9px' },
  empty: { fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0', margin: 0 },
  row: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '13px', background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: '16px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', boxShadow: '0 2px 6px rgba(80,50,20,0.04)' },
  rowGlyph: { width: '40px', height: '40px', flexShrink: 0, borderRadius: '12px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '0.5px solid rgba(217,181,122,0.35)' },
  rowText: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' },
  rowTitle: { fontSize: '14px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.35 },
  rowSub: { fontSize: '11.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4 },
  rowMeta: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px', flexShrink: 0 },
  litStar: { color: '#C9A85C', fontSize: '15px', lineHeight: 1 },
  hollowStar: { color: '#C9B894', fontSize: '15px', lineHeight: 1, opacity: 0.6 },
  rowMetaText: { fontSize: '10.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontVariantNumeric: 'tabular-nums' },
}