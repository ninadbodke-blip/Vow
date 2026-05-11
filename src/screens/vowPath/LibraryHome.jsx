import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { REFLECT_DEEP_READS } from './data/reflectDeepReads'

const WEEKS = [
  { num: 1, title: 'Week 1 — See it', range: [1, 7] },
  { num: 2, title: 'Week 2 — Feel it', range: [8, 14] },
  { num: 3, title: 'Week 3 — Decide', range: [15, 21] },
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
        .select('last_completed_day, is_pilot_mode, current_stage')
        .eq('user_id', user.id)
        .maybeSingle()

      setProgress(progressRow)
      setLoading(false)
    }
    load()
  }, [navigate])

  const isUnlocked = (dayNumber) => {
    if (import.meta.env.DEV) return true
    if (!progress) return false
    if (progress.is_pilot_mode) return true
    if (progress.current_stage !== 'reflect') return false
    return dayNumber <= (progress.last_completed_day || 0)
  }

  const unlockedCount = (() => {
    if (!progress) return 0
    if (import.meta.env.DEV || progress.is_pilot_mode) return 21
    if (progress.current_stage !== 'reflect') return 0
    return progress.last_completed_day || 0
  })()

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, textAlign: 'center', color: '#9C8C78', paddingTop: '4rem', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.topBar}>
          <button onClick={() => navigate('/vow-path/reflect')} style={styles.backBtn}>‹ Reflect</button>
          <p style={styles.topBarTitle}>Library</p>
          <div style={{ width: '60px' }}></div>
        </div>

        <div style={styles.headerBlock}>
          <p style={styles.label}>Reflect deep reads</p>
          <h1 style={styles.title}>Why each day works.</h1>
          <p style={styles.subtitle}>
            Companion essays to every day of Reflect. They unlock as you complete each day.
          </p>
          <div style={styles.progressNote}>
            <strong style={{ color: '#854F0B' }}>{unlockedCount}</strong> of 21 unlocked.
          </div>
        </div>

        {WEEKS.map(week => {
          const [start, end] = week.range
          const days = []
          for (let d = start; d <= end; d++) {
            const dr = REFLECT_DEEP_READS[d]
            if (dr) days.push(dr)
          }
          return (
            <div key={week.num} style={styles.weekSection}>
              <p style={styles.weekTitle}>{week.title}</p>
              <div style={styles.dayList}>
                {days.map(dr => {
                  const unlocked = isUnlocked(dr.day)
                  return (
                    <button
                      key={dr.day}
                      onClick={() => unlocked ? navigate(`/library/reflect/day/${dr.day}`) : null}
                      disabled={!unlocked}
                      style={{
                        ...styles.dayRow,
                        ...(unlocked ? {} : styles.dayRowLocked),
                      }}
                    >
                      <div style={styles.dayNum}>
                        <span style={{ ...styles.dayNumText, ...(unlocked ? {} : styles.dayNumTextLocked) }}>
                          {String(dr.day).padStart(2, '0')}
                        </span>
                      </div>

                      <div style={styles.dayContent}>
                        <p style={{
                          ...styles.dayTitle,
                          ...(unlocked ? {} : styles.dayTitleLocked),
                        }}>
                          {dr.title}
                        </p>
                        <p style={{
                          ...styles.daySubtitle,
                          ...(unlocked ? {} : styles.daySubtitleLocked),
                        }}>
                          {dr.subtitle}
                        </p>
                      </div>

                      <div style={styles.dayMeta}>
                        {unlocked ? (
                          <>
                            <span style={styles.dayMinutes}>{dr.readMinutes} min</span>
                            <span style={styles.dayArrow}>›</span>
                          </>
                        ) : (
                          <span style={styles.dayLockIcon}>🔒</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

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
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '1.5rem 1.25rem 2rem',
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
    marginBottom: '1.5rem',
    paddingLeft: '4px',
  },
  label: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    margin: '0 0 0.6rem',
  },
  title: {
    fontSize: '26px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.25,
    margin: '0 0 0.5rem',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: '0 0 0.85rem',
  },
  progressNote: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  weekSection: {
    marginBottom: '1.5rem',
  },
  weekTitle: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    margin: '0 4px 0.75rem',
  },
  dayList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  dayRow: {
    display: 'flex', alignItems: 'center',
    width: '100%',
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    gap: '12px',
    transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  dayRowLocked: {
    background: '#F0EBDF',
    borderColor: '#E0D8C5',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  dayNum: {
    width: '32px', height: '32px',
    borderRadius: '50%',
    background: '#F4ECDD',
    border: '0.5px solid #E0D5C2',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  dayNumText: {
    fontSize: '12px', fontWeight: 500,
    color: '#854F0B',
    fontVariantNumeric: 'tabular-nums',
  },
  dayNumTextLocked: {
    color: '#B5A990',
  },
  dayContent: {
    flex: 1,
    minWidth: 0,
  },
  dayTitle: {
    fontSize: '14px', fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0,
    lineHeight: 1.35,
  },
  dayTitleLocked: {
    color: '#9C8C78',
  },
  daySubtitle: {
    fontSize: '11px', color: '#9C8C78',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    margin: '2px 0 0',
    lineHeight: 1.4,
  },
  daySubtitleLocked: {
    color: '#B5A990',
  },
  dayMeta: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dayMinutes: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontVariantNumeric: 'tabular-nums',
  },
  dayArrow: {
    fontSize: '18px',
    color: '#854F0B',
    fontWeight: 500,
  },
  dayLockIcon: {
    fontSize: '14px',
    opacity: 0.4,
  },
}