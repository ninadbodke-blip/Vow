import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { getReflectDeepRead } from './data/reflectDeepReads'
import { getNoticeDeepRead } from './data/noticeDeepReads'
import { getCommitDeepRead } from './data/commitDeepReads'

const STAGE_GETTERS = {
  reflect: getReflectDeepRead,
  notice: getNoticeDeepRead,
  commit: getCommitDeepRead,
}

const STAGE_LABELS = {
  reflect: 'Reflect',
  notice: 'Notice',
  commit: 'Commit',
}

export default function LibraryDeepRead() {
  const navigate = useNavigate()
  const location = useLocation()
  const { dayNumber: dayNumberParam } = useParams()
  const dayNumber = parseInt(dayNumberParam, 10)

  const stageMatch = location.pathname.match(/\/library\/(\w+)\/day/)
  const stageKey = stageMatch?.[1] || 'reflect'

  const getter = STAGE_GETTERS[stageKey]
  const content = getter ? getter(dayNumber) : null
  const stageLabel = STAGE_LABELS[stageKey] || 'Reflect'

  const [checking, setChecking] = useState(true)
  const [accessAllowed, setAccessAllowed] = useState(false)
  const [accessReason, setAccessReason] = useState('')

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/welcome')
        return
      }

      if (import.meta.env.DEV) {
        setAccessAllowed(true)
        setChecking(false)
        return
      }

      const { data: progress } = await supabase
        .from('vow_path_progress')
        .select('last_completed_day, is_pilot_mode, current_stage, completed_stages')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!progress) {
        setAccessAllowed(false)
        setAccessReason(`You need to begin ${stageLabel} before reading the deep reads.`)
        setChecking(false)
        return
      }

      if (progress.is_pilot_mode) {
        setAccessAllowed(true)
        setChecking(false)
        return
      }

      const completed = progress.completed_stages || []
      if (completed.some(c => c.stage === stageKey)) {
        setAccessAllowed(true)
        setChecking(false)
        return
      }

      if (progress.current_stage === stageKey) {
        const lastCompleted = progress.last_completed_day || 0
        if (dayNumber > lastCompleted) {
          setAccessAllowed(false)
          setAccessReason(`This deep read unlocks after you complete Day ${dayNumber}.`)
          setChecking(false)
          return
        }
        setAccessAllowed(true)
        setChecking(false)
        return
      }

      setAccessAllowed(false)
      setAccessReason(`You're not currently in ${stageLabel}.`)
      setChecking(false)
    }
    checkAccess()
  }, [dayNumber, stageKey, stageLabel, navigate])

  if (checking) {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, textAlign: 'center', color: '#9C8C78', paddingTop: '4rem', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Loading...
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <Header navigate={navigate} stageKey={stageKey} stageLabel={stageLabel} />
          <div style={styles.notFound}>
            <p style={styles.notFoundIcon}>📖</p>
            <h2 style={styles.notFoundTitle}>Deep read not found</h2>
            <p style={styles.notFoundText}>
              {`The deep read for Day ${dayNumber} doesn't exist.`}
            </p>
            <button onClick={() => navigate(`/library/${stageKey}`)} style={{ ...styles.primaryBtn, marginTop: '1.5rem' }}>
              Back to library
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!accessAllowed) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <Header navigate={navigate} stageKey={stageKey} stageLabel={stageLabel} />
          <div style={styles.locked}>
            <p style={styles.lockedIcon}>🔒</p>
            <h2 style={styles.lockedTitle}>Not yet</h2>
            <p style={styles.lockedText}>{accessReason}</p>
            <button onClick={() => navigate(`/library/${stageKey}`)} style={{ ...styles.primaryBtn, marginTop: '1.5rem' }}>
              Back to library
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>
        <Header navigate={navigate} stageKey={stageKey} stageLabel={stageLabel} />

        {/* HERO — centered, with the stage badge as a real visual element */}
        <div style={styles.hero}>
          <div style={styles.stageBadge}>
            <span style={styles.stageBadgeText}>{stageLabel}</span>
            <span style={styles.stageBadgeDot}>·</span>
            <span style={styles.stageBadgeText}>Day {dayNumber}</span>
          </div>

          <h1 style={styles.title}>{content.title}</h1>
          <p style={styles.subtitle}>{content.subtitle}</p>

          <div style={styles.metaRow}>
            <span style={styles.metaItem}>~{content.readMinutes} min read</span>
            <span style={styles.metaDot}>·</span>
            <span style={styles.metaItem}>{content.wordCount} words</span>
          </div>

          <div style={styles.heroDivider}>
            <span style={styles.heroDividerOrnament}>· · ·</span>
          </div>
        </div>

        {/* ARTICLE */}
        <article style={styles.article}>
          {content.sections.map((section, sectionIdx) => {
            const isOpening = section.heading && section.heading.toLowerCase() === 'opening'
            const showHeading = section.heading && !isOpening

            return (
              <section key={sectionIdx} style={styles.section}>
                {showHeading && (
                  <div style={styles.sectionHeadingWrap}>
                    <h3 style={styles.sectionHeading}>{formatHeading(section.heading)}</h3>
                  </div>
                )}
                <div style={styles.sectionBody}>
                  {section.paragraphs.map((para, pIdx) => {
                    // First paragraph of opening: drop cap treatment
                    const isFirstOpeningPara = isOpening && sectionIdx === 0 && pIdx === 0
                    return (
                      <p key={pIdx} style={isFirstOpeningPara ? styles.firstParagraph : styles.paragraph}>
                        {para}
                      </p>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </article>

        {/* ENDING ORNAMENT */}
        <div style={styles.endOrnament}>
          <span style={styles.endOrnamentMark}>· · ·</span>
        </div>

        {/* ACTIONS */}
        <div style={styles.endActions}>
          <button onClick={() => navigate(`/library/${stageKey}`)} style={styles.secondaryBtn}>
            ‹ All deep reads
          </button>
          <button onClick={() => navigate(`/vow-path/${stageKey}`)} style={styles.primaryBtnFlex}>
            Back to {stageLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function Header({ navigate, stageKey, stageLabel }) {
  return (
    <div style={styles.topBar}>
      <button onClick={() => navigate(`/library/${stageKey}`)} style={styles.backBtn}>‹ Library</button>
      <p style={styles.topBarTitle}>{stageLabel}</p>
      <div style={{ width: '60px' }}></div>
    </div>
  )
}

function formatHeading(raw) {
  if (!raw) return ''
  // Convert "WHY A SPECIFIC DATE, NOT \"WHEN I'M READY\"" -> "Why a specific date, not 'when I'm ready'"
  const lower = raw.toLowerCase()
  // Capitalize first letter
  return lower.charAt(0).toUpperCase() + lower.slice(1)
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
    padding: '1.5rem 1.75rem 2.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '2rem',
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

  // ---- HERO ----
  hero: {
    textAlign: 'center',
    paddingTop: '0.75rem',
    paddingBottom: '0.5rem',
    marginBottom: '2.5rem',
  },
  stageBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '999px',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  stageBadgeText: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
  },
  stageBadgeDot: {
    color: '#C5AE8A',
    fontSize: '10px',
  },
  title: {
    fontSize: '34px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.2,
    margin: '0 0 0.85rem',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontSize: '15px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.5,
    margin: '0 0 1.5rem',
    maxWidth: '340px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  metaItem: {
    fontVariantNumeric: 'tabular-nums',
  },
  metaDot: {
    color: '#DDCFB6',
  },
  heroDivider: {
    marginTop: '1.75rem',
    display: 'flex',
    justifyContent: 'center',
  },
  heroDividerOrnament: {
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
  },

  // ---- ARTICLE ----
  article: {
    paddingBottom: '1rem',
  },
  section: {
    marginBottom: '2.5rem',
  },
  sectionHeadingWrap: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    marginTop: '0.5rem',
  },
  sectionHeading: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontWeight: 500,
    margin: 0,
    lineHeight: 1.4,
    letterSpacing: '0.02em',
    paddingTop: '1rem',
    borderTop: '0.5px solid #E8DFD0',
    display: 'inline-block',
    paddingLeft: '2rem',
    paddingRight: '2rem',
  },
  sectionBody: {},
  paragraph: {
    fontSize: '16px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.85,
    margin: '0 0 1.35rem',
    letterSpacing: '0.005em',
  },
  firstParagraph: {
    fontSize: '17px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.85,
    margin: '0 0 1.35rem',
    letterSpacing: '0.005em',
    // Soft first-letter emphasis
  },

  // ---- ENDING ----
  endOrnament: {
    display: 'flex',
    justifyContent: 'center',
    margin: '2rem 0 1.75rem',
  },
  endOrnamentMark: {
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
  },
  endActions: {
    display: 'flex',
    gap: '10px',
  },
  primaryBtnFlex: {
    flex: 2,
    padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  secondaryBtn: {
    flex: 1,
    padding: '14px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  // ---- ERROR / LOCKED ----
  notFound: { textAlign: 'center', padding: '3rem 1rem' },
  notFoundIcon: { fontSize: '40px', margin: '0 0 1rem' },
  notFoundTitle: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.75rem',
  },
  notFoundText: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.6, margin: 0,
  },
  locked: { textAlign: 'center', padding: '3rem 1rem' },
  lockedIcon: { fontSize: '36px', margin: '0 0 1rem' },
  lockedTitle: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.75rem',
  },
  lockedText: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.6, margin: 0,
    maxWidth: '300px',
    marginLeft: 'auto', marginRight: 'auto',
  },
}