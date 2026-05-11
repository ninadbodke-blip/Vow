import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { getReflectDeepRead } from './data/reflectDeepReads'

export default function LibraryDeepRead() {
  const navigate = useNavigate()
  const { dayNumber: dayNumberParam } = useParams()
  const dayNumber = parseInt(dayNumberParam, 10)
  const content = getReflectDeepRead(dayNumber)

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

      // Dev mode and pilot mode bypass — everything unlocked
      if (import.meta.env.DEV) {
        setAccessAllowed(true)
        setChecking(false)
        return
      }

      const { data: progress } = await supabase
        .from('vow_path_progress')
        .select('last_completed_day, is_pilot_mode, current_stage')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!progress || progress.current_stage !== 'reflect') {
        setAccessAllowed(false)
        setAccessReason('You need to begin Reflect before reading the deep reads.')
        setChecking(false)
        return
      }

      if (progress.is_pilot_mode) {
        setAccessAllowed(true)
        setChecking(false)
        return
      }

      const lastCompleted = progress.last_completed_day || 0
      if (dayNumber > lastCompleted) {
        setAccessAllowed(false)
        setAccessReason(`This deep read unlocks after you complete Day ${dayNumber}.`)
        setChecking(false)
        return
      }

      setAccessAllowed(true)
      setChecking(false)
    }
    checkAccess()
  }, [dayNumber, navigate])

  // ---- Loading state ----
  if (checking) {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, textAlign: 'center', color: '#9C8C78', paddingTop: '4rem', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Loading...
        </div>
      </div>
    )
  }

  // ---- Unknown day ----
  if (!content) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <Header navigate={navigate} />
          <div style={styles.notFound}>
            <p style={styles.notFoundIcon}>📖</p>
            <h2 style={styles.notFoundTitle}>Deep read not found</h2>
            <p style={styles.notFoundText}>
              {`The deep read for Day ${dayNumber} doesn't exist.`}
            </p>
            <button onClick={() => navigate('/library/reflect')} style={{ ...styles.primaryBtn, marginTop: '1.5rem' }}>
              Back to library
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Locked ----
  if (!accessAllowed) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <Header navigate={navigate} />
          <div style={styles.locked}>
            <p style={styles.lockedIcon}>🔒</p>
            <h2 style={styles.lockedTitle}>Not yet</h2>
            <p style={styles.lockedText}>{accessReason}</p>
            <button onClick={() => navigate('/library/reflect')} style={{ ...styles.primaryBtn, marginTop: '1.5rem' }}>
              Back to library
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Render the deep read ----
  return (
    <div style={styles.frame}>
      <div style={styles.phone}>
        <Header navigate={navigate} />

        <div style={styles.headerBlock}>
          <div style={styles.daylabel}>Day {dayNumber} · Deep read</div>
          <h1 style={styles.title}>{content.title}</h1>
          <p style={styles.subtitle}>{content.subtitle}</p>
          <div style={styles.metaRow}>
            <span style={styles.metaItem}>~{content.readMinutes} min read</span>
            <span style={styles.metaDot}>·</span>
            <span style={styles.metaItem}>{content.wordCount} words</span>
          </div>
          <div style={styles.divider}></div>
        </div>

        <article style={styles.article}>
          {content.sections.map((section, sectionIdx) => (
            <section key={sectionIdx} style={styles.section}>
              {section.heading && section.heading.toLowerCase() !== 'opening' && (
                <h3 style={styles.sectionHeading}>{formatHeading(section.heading)}</h3>
              )}
              <div style={styles.sectionBody}>
                {section.paragraphs.map((para, pIdx) => (
                  <p key={pIdx} style={styles.paragraph}>{para}</p>
                ))}
              </div>
            </section>
          ))}
        </article>

        <div style={styles.endDivider}></div>

        <div style={styles.endActions}>
          <button
            onClick={() => navigate('/library/reflect')}
            style={styles.secondaryBtn}
          >
            ‹ All deep reads
          </button>
          <button
            onClick={() => navigate(-1)}
            style={styles.primaryBtnFlex}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------- Helpers ----------

function Header({ navigate }) {
  return (
    <div style={styles.topBar}>
      <button onClick={() => navigate('/library/reflect')} style={styles.backBtn}>‹ Library</button>
      <p style={styles.topBarTitle}>Reflect</p>
      <div style={{ width: '60px' }}></div>
    </div>
  )
}

function formatHeading(raw) {
  // Convert ALL CAPS section names to Title Case for display
  // "WHY NAMING, NOT DIAGNOSING" → "Why naming, not diagnosing"
  if (!raw) return ''
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}

// ---------- Styles ----------

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
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '1.5rem 1.5rem 2rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1.5rem',
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
  headerBlock: {
    paddingTop: '0.5rem',
    marginBottom: '1.5rem',
  },
  daylabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    marginBottom: '0.85rem',
  },
  title: {
    fontSize: '28px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.25,
    margin: '0 0 0.5rem',
  },
  subtitle: {
    fontSize: '15px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: '0 0 1rem',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  metaItem: {
    fontVariantNumeric: 'tabular-nums',
  },
  metaDot: {
    color: '#DDCFB6',
  },
  divider: {
    height: '0.5px',
    background: '#E8DFD0',
    width: '40%',
    margin: '1.25rem 0 0',
  },
  article: {
    paddingBottom: '1rem',
  },
  section: {
    marginBottom: '1.5rem',
  },
  sectionHeading: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    margin: '1.5rem 0 0.85rem',
    lineHeight: 1.4,
  },
  sectionBody: {
    // wrapper
  },
  paragraph: {
    fontSize: '16px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.8,
    margin: '0 0 1.15rem',
  },
  endDivider: {
    height: '0.5px',
    background: '#E8DFD0',
    margin: '1.5rem 0 1.25rem',
  },
  endActions: {
    display: 'flex',
    gap: '10px',
  },
  primaryBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnFlex: {
    flex: 2, padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  secondaryBtn: {
    flex: 1, padding: '14px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  notFound: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  notFoundIcon: {
    fontSize: '40px', margin: '0 0 1rem',
  },
  notFoundTitle: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.75rem',
  },
  notFoundText: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
  },
  locked: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  lockedIcon: {
    fontSize: '36px', margin: '0 0 1rem',
  },
  lockedTitle: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.75rem',
  },
  lockedText: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '300px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}