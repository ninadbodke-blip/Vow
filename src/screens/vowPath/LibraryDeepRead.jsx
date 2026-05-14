import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { getReflectDeepRead } from './data/reflectDeepReads'
import { getNoticeDeepRead } from './data/noticeDeepReads'
import { getCommitDeepRead } from './data/commitDeepReads'
import { getEndureDeepRead } from './data/endureDeepReads'

const STAGE_GETTERS = {
  reflect: getReflectDeepRead,
  notice: getNoticeDeepRead,
  commit: getCommitDeepRead,
  endure: getEndureDeepRead,
}

const STAGE_LABELS = {
  reflect: 'Reflect',
  notice: 'Notice',
  commit: 'Commit',
  endure: 'Endure',
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
        setAccessReason(`You need to begin ${stageLabel} before reading the chapters.`)
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
          setAccessReason(`This chapter unlocks after you complete Day ${dayNumber}.`)
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
        <div style={styles.loadingPhone}>Loading...</div>
      </div>
    )
  }

  if (!content) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <Header navigate={navigate} stageKey={stageKey} stageLabel={stageLabel} />
          <div style={styles.notFound}>
            <p style={styles.notFoundTitle}>Chapter not found</p>
            <p style={styles.notFoundText}>
              The chapter for Day {dayNumber} doesn't exist.
            </p>
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
            <p style={styles.lockedTitle}>Not yet</p>
            <p style={styles.lockedText}>{accessReason}</p>
          </div>
        </div>
      </div>
    )
  }

  // Filter out the "OPENING" section label — render its prose without a heading.
  const sections = content.sections.map(s => {
    const isOpeningLabel = s.heading && s.heading.toLowerCase().trim() === 'opening'
    return { ...s, displayHeading: isOpeningLabel ? null : s.heading }
  })

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>
        <Header navigate={navigate} stageKey={stageKey} stageLabel={stageLabel} />

        {/* HERO */}
        <div style={styles.hero}>
          <div style={styles.stageBadge}>
            <span style={styles.stageBadgeText}>{stageLabel}</span>
            <span style={styles.stageBadgeDot}>·</span>
            <span style={styles.stageBadgeText}>Day {dayNumber}</span>
          </div>

          <h1 style={styles.title}>{content.title}</h1>
          {content.subtitle && (
            <p style={styles.subtitle}>{content.subtitle}</p>
          )}

          <div style={styles.metaRow}>
            <span style={styles.metaItem}>{content.readMinutes} min read</span>
          </div>

          <div style={styles.heroOrnament}>· · ·</div>
        </div>

        {/* ARTICLE */}
        <article style={styles.article}>
          {sections.map((section, sectionIdx) => {
            const isFirstSection = sectionIdx === 0

            return (
              <section key={sectionIdx} style={styles.section}>
                {section.displayHeading && (
                  <div style={styles.sectionHeadingWrap}>
                    <div style={styles.sectionOrnament}>· · ·</div>
                    <h2 style={styles.sectionHeading}>{formatHeading(section.displayHeading)}</h2>
                  </div>
                )}
                <div style={styles.sectionBody}>
                  {section.paragraphs.map((para, pIdx) => {
                    const isFirstPara = isFirstSection && pIdx === 0
                    return (
                      <p
                        key={pIdx}
                        style={isFirstPara ? styles.firstParagraph : styles.paragraph}
                      >
                        {isFirstPara ? (
                          <>
                            <span style={styles.dropCap}>{para.charAt(0)}</span>
                            {para.slice(1)}
                          </>
                        ) : (
                          para
                        )}
                      </p>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </article>

        {/* ENDING ORNAMENT */}
        <div style={styles.endOrnament}>· · ·</div>
      </div>
    </div>
  )
}

function Header({ navigate, stageLabel }) {
  return (
    <div style={styles.topBar}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>‹ Back</button>
      <p style={styles.topBarTitle}>{stageLabel} · Library</p>
      <div style={{ width: '60px' }}></div>
    </div>
  )
}

function formatHeading(raw) {
  if (!raw) return ''
  const lower = raw.toLowerCase().trim()
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
    maxWidth: '620px',
    width: '100%',
    borderRadius: '28px',
    padding: '1.5rem 2rem 2.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  loadingPhone: {
    background: '#FAF7F1',
    maxWidth: '620px',
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
    paddingTop: '1rem',
    paddingBottom: '0.5rem',
    marginBottom: '2.5rem',
  },
  stageBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 18px',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '999px',
    marginBottom: '1.75rem',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  stageBadgeText: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
  },
  stageBadgeDot: {
    color: '#C5AE8A',
    fontSize: '10px',
  },
  title: {
    fontSize: '36px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.2,
    margin: '0 auto 1rem',
    letterSpacing: '-0.015em',
    maxWidth: '480px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: '0 auto 1.5rem',
    maxWidth: '420px',
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
    letterSpacing: '0.18em',
    marginBottom: '2rem',
  },
  metaItem: {
    fontVariantNumeric: 'tabular-nums',
  },
  heroOrnament: {
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    marginTop: '0.25rem',
  },

  // ---- ARTICLE ----
  article: {
    paddingBottom: '1rem',
    maxWidth: '560px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  section: {
    marginBottom: '2.5rem',
  },
  sectionHeadingWrap: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    marginTop: '1.5rem',
  },
  sectionOrnament: {
    fontSize: '12px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    marginBottom: '1rem',
  },
  sectionHeading: {
    fontSize: '18px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontWeight: 500,
    margin: 0,
    lineHeight: 1.4,
    letterSpacing: '-0.005em',
    maxWidth: '460px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  sectionBody: {},
  paragraph: {
    fontSize: '16.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.85,
    margin: '0 0 1.4rem',
    letterSpacing: '0.005em',
  },
  firstParagraph: {
    fontSize: '17px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.85,
    margin: '0 0 1.4rem',
    letterSpacing: '0.005em',
  },
  dropCap: {
    float: 'left',
    fontSize: '52px',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 0.95,
    paddingTop: '6px',
    paddingRight: '10px',
    paddingBottom: '0px',
    color: '#854F0B',
  },

  // ---- ENDING ----
  endOrnament: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    margin: '2.5rem 0 1rem',
  },

  notFound: { textAlign: 'center', padding: '3rem 1rem' },
  notFoundTitle: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.75rem',
  },
  notFoundText: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.6, margin: 0,
  },
  locked: { textAlign: 'center', padding: '3rem 1rem' },
  lockedTitle: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
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