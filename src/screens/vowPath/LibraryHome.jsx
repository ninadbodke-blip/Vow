import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

const STAGES = [
  {
    key: 'notice',
    label: 'Notice',
    subtitle: 'Precontemplation. Pattern awareness.',
    chapters: 5,
    status: 'active',
  },
  {
    key: 'reflect',
    label: 'Reflect',
    subtitle: 'Contemplation. Honest looking.',
    chapters: 21,
    status: 'active',
  },
  {
    key: 'commit',
    label: 'Commit',
    subtitle: 'Preparation. Infrastructure.',
    chapters: 10,
    status: 'active',
  },
  {
    key: 'endure',
    label: 'Endure',
    subtitle: 'Action. Holding the vow.',
    chapters: 21,
    status: 'active',
  },
  {
    key: 'build',
    label: 'Build',
    subtitle: 'The post-vow life.',
    chapters: null,
    status: 'coming_soon',
  },
  {
    key: 'reclaim',
    label: 'Reclaim',
    subtitle: 'Returning after a slip.',
    chapters: null,
    status: 'coming_soon',
  },
]

export default function LibraryHome() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/welcome')
        return
      }

      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('current_stage, last_completed_day, is_pilot_mode, completed_stages')
        .eq('user_id', user.id)
        .maybeSingle()

      setProgress(progressRow)
      setLoading(false)
    }
    load()
  }, [navigate])

  const isStageReached = (stageKey) => {
    if (!progress) return false
    if (import.meta.env.DEV || progress.is_pilot_mode) return true
    if (progress.current_stage === stageKey) return true
    const completed = progress.completed_stages || []
    return completed.some(c => c.stage === stageKey)
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={styles.loadingPhone}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.topBar}>
          <button onClick={() => navigate('/home')} style={styles.backBtn}>‹ Home</button>
          <p style={styles.topBarTitle}>Library</p>
          <div style={{ width: '60px' }}></div>
        </div>

        {/* HERO */}
        <div style={styles.hero}>
          <div style={styles.heroOrnament}>· ✦ ·</div>
          <h1 style={styles.title}>The Library</h1>
          <p style={styles.subtitle}>
            Companion essays for every day of the path. The science, the traditions,
            the reasoning underneath the work.
          </p>
          <div style={styles.heroOrnament}>· ✦ ·</div>
        </div>

        {/* THE ARCHIVE SHELVES */}
        <div style={styles.shelfWrap}>
          <div style={styles.thread} />
          {STAGES.map(stage => {
            const isActive = stage.status === 'active'
            const reached = isActive && isStageReached(stage.key)
            const isActiveText = isActive && progress?.current_stage === stage.key
            return (
              <button
                key={stage.key}
                onClick={() => isActive ? navigate(`/library/${stage.key}`) : null}
                disabled={!isActive}
                style={{
                  ...styles.shelfRow,
                  ...(isActiveText ? styles.shelfRowActive : {}),
                  ...(!isActive ? styles.shelfRowSoon : {}),
                  cursor: isActive ? 'pointer' : 'default',
                }}
              >
                <span style={{
                  ...styles.shelfNode,
                  color: (isActiveText || reached) ? '#D9B57A' : '#C9BBA3',
                  background: isActiveText ? 'transparent' : '#FAF7F1',
                }}>{(isActiveText || reached) ? '✦' : '·'}</span>
                <span style={styles.shelfBody}>
                  {isActiveText && <span style={styles.shelfEyebrowActive}>The active text</span>}
                  {!isActive && <span style={styles.shelfEyebrowSoon}>Awaiting translation</span>}
                  <span style={styles.shelfTitleRow}>
                    <span style={{
                      ...styles.shelfTitle,
                      ...(isActiveText ? styles.shelfTitleActive : {}),
                      ...(!isActive ? styles.shelfTitleSoon : {}),
                    }}>{stage.label}</span>
                    {isActive && (
                      <span style={{ ...styles.shelfChapters, ...(isActiveText ? styles.shelfChaptersActive : {}) }}>
                        {stage.chapters} {stage.chapters === 1 ? 'chapter' : 'chapters'}
                      </span>
                    )}
                  </span>
                  <span style={{
                    ...styles.shelfSubtitle,
                    ...(isActiveText ? styles.shelfSubtitleActive : {}),
                    ...(!isActive ? styles.shelfSubtitleSoon : {}),
                  }}>{stage.subtitle}</span>
                  {isActive && !isActiveText && (
                    <span style={styles.shelfStatus}>{reached ? 'The volume is open.' : "Read what's ahead"}</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        <div style={styles.footerNote}>
          <p style={styles.footerNoteText}>
            Chapters unlock as you complete each day of the corresponding stage.
            Once a chapter is unlocked, it stays available forever.
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  phone: {
    background: '#FAF7F1',
    maxWidth: '460px',
    width: '100%',
    borderRadius: '28px',
    padding: '1.5rem 1.5rem 2.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  loadingPhone: {
    background: '#FAF7F1',
    maxWidth: '460px',
    width: '100%',
    borderRadius: '28px',
    padding: '5rem 2rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10)',
    color: '#9C8C78',
    textAlign: 'center',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  topBarTitle: {
    fontSize: '13px', fontWeight: 500, color: '#9C8C78',
    margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textAlign: 'center', flex: 1,
  },
  backBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
    minWidth: '60px', textAlign: 'left',
  },
  hero: {
    textAlign: 'center',
    padding: '1.5rem 0 2rem',
  },
  heroOrnament: {
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    margin: '0 0 1.25rem',
  },
  title: {
    fontSize: '32px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.2,
    margin: '0 0 1rem',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: '0 auto 1.25rem',
    maxWidth: '320px',
  },
  tilesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '1.5rem',
  },
  tile: {
    display: 'block',
    width: '100%',
    padding: '18px 20px',
    background: 'white',
    border: '0.5px solid #E0D5C2',
    borderRadius: '18px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'all 0.2s',
    boxShadow: '0 3px 10px rgba(80,50,20,0.05)',
  },
  tileComingSoon: {
    background: '#F4EFE4',
    border: '0.5px dashed #D5C8AE',
    cursor: 'not-allowed',
    boxShadow: 'none',
    opacity: 0.7,
  },
  tileTop: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: '6px',
    gap: '12px',
  },
  tileLabel: {
    fontSize: '20px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: 0,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  tileLabelComingSoon: {
    color: '#9C8C78',
  },
  tileChapters: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontVariantNumeric: 'tabular-nums',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 500,
    flexShrink: 0,
  },
  tileChaptersSoon: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 500,
    flexShrink: 0,
  },
  tileSubtitle: {
    fontSize: '13.5px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: '0 0 12px',
  },
  tileSubtitleComingSoon: {
    color: '#9C8C78',
  },
  tileFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '8px',
    borderTop: '0.5px solid #F0E8D8',
    marginTop: '4px',
  },
  tileStatusReached: {
    fontSize: '11px',
    color: '#3B6D11',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
  },
  tileStatusLocked: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
  },
  tileArrow: {
    fontSize: '20px',
    color: '#854F0B',
    fontWeight: 500,
  },
  shelfWrap: { position: 'relative', paddingLeft: '2px', marginBottom: '1.5rem' },
  thread: { position: 'absolute', left: '15px', top: '16px', bottom: '16px', width: '1.5px', background: '#D9B57A', opacity: 0.45, zIndex: 0 },
  shelfRow: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', padding: '14px 4px', fontFamily: 'inherit' },
  shelfRowActive: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', borderRadius: '16px', padding: '18px 16px', margin: '6px 0', boxShadow: '0 10px 24px -10px rgba(40,25,10,0.45)' },
  shelfRowSoon: { opacity: 0.3 },
  shelfNode: { width: '28px', flexShrink: 0, textAlign: 'center', fontSize: '14px', lineHeight: '1.5' },
  shelfBody: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '1px' },
  shelfEyebrowActive: { fontSize: '10px', color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  shelfEyebrowSoon: { fontSize: '10px', color: '#9C8C78', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  shelfTitleRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' },
  shelfTitle: { fontSize: '19px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.01em' },
  shelfTitleActive: { color: '#FAF7F1' },
  shelfTitleSoon: { color: '#9C8C78' },
  shelfChapters: { fontSize: '11px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, flexShrink: 0, fontVariantNumeric: 'tabular-nums' },
  shelfChaptersActive: { color: '#D9B57A' },
  shelfSubtitle: { fontSize: '13.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55 },
  shelfSubtitleActive: { color: '#CBBA98' },
  shelfSubtitleSoon: { color: '#9C8C78' },
  shelfStatus: { fontSize: '12px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginTop: '2px' },
  footerNote: {
    textAlign: 'center',
    padding: '1rem 1rem 0',
  },
  footerNoteText: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: 0,
    maxWidth: '320px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}