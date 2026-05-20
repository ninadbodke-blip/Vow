import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import {
  COMMIT_DAYS,
  COMMIT_TOTAL_DAYS,
  COMMIT_PHASES,
} from './data/commitContent'

const STATUS = {
  COMPLETED: 'completed',
  CURRENT: 'current',
  LOCKED: 'locked',
}

export default function CommitOverview() {
  const navigate = useNavigate()

  const [progress, setProgress] = useState(null)
  const [completedDays, setCompletedDays] = useState(new Set())
  const [loaded, setLoaded] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/welcome')
        return
      }

      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!progressRow || progressRow.current_stage !== 'commit') {
        setAccessDenied(true)
        setLoaded(true)
        return
      }

      setProgress(progressRow)

      const { data: artifacts } = await supabase
        .from('vow_artifacts')
        .select('day_number')
        .eq('user_id', user.id)
        .eq('stage', 'commit')

      const completed = new Set(
        (artifacts || [])
          .map(a => a.day_number)
          .filter(d => d !== null && d !== undefined)
      )
      setCompletedDays(completed)
      setLoaded(true)
    }
    load()
  }, [navigate])

  const getDayStatus = (dayNum) => {
    if (completedDays.has(dayNum)) return STATUS.COMPLETED
    if (!progress) return STATUS.LOCKED
    const lastCompleted = progress.last_completed_day || 0
    const nextDay = lastCompleted + 1
    if (dayNum === nextDay) return STATUS.CURRENT
    return STATUS.LOCKED
  }

  const isDayTappable = (dayNum) => {
    if (import.meta.env.DEV) return true
    if (progress?.is_pilot_mode) return true
    const status = getDayStatus(dayNum)
    return status === STATUS.COMPLETED || status === STATUS.CURRENT
  }

  const handleDayTap = (dayNum) => {
    if (!isDayTappable(dayNum)) return
    navigate(`/vow-path/commit/day/${dayNum}`)
  }

  if (!loaded) {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, textAlign: 'center', color: '#9C8C78', paddingTop: '4rem' }}>
          Loading...
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.header}>
            <button onClick={() => navigate('/vow-path')} style={styles.backBtn}>‹ Vow Path</button>
            <p style={styles.headerTitle}>Commit</p>
            <div style={{ width: '60px' }}></div>
          </div>
          <div style={styles.lockedBlock}>
            <div style={styles.lockedIcon}>⏳</div>
            <p style={styles.lockedTitle}>Not yet.</p>
            <p style={styles.lockedReason}>{`You haven't started Commit yet. Take the Stage Check first.`}</p>
            <button
              onClick={() => navigate('/vow-path')}
              style={{ ...styles.primaryBtn, marginTop: '1.5rem' }}
            >
              Take the Stage Check
            </button>
          </div>
        </div>
      </div>
    )
  }

  const lastCompleted = progress?.last_completed_day || 0
  const totalCompleted = completedDays.size
  const isPilotOrDev = import.meta.env.DEV || progress?.is_pilot_mode

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.header}>
          <button onClick={() => navigate('/vow-path')} style={styles.backBtn}>‹ Vow Path</button>
          <p style={styles.headerTitle}>Commit</p>
          <button onClick={() => navigate('/library/commit')} style={styles.libraryBtn}>
            Library
          </button>
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Your journey</p>
          <p style={styles.summaryNumbers}>
            <span style={styles.summaryBig}>{totalCompleted}</span>
            <span style={styles.summarySlash}> / </span>
            <span style={styles.summaryTotal}>{COMMIT_TOTAL_DAYS}</span>
          </p>
          <p style={styles.summarySubtitle}>
            {totalCompleted === 0
              ? 'Begin with Day 1.'
              : totalCompleted === COMMIT_TOTAL_DAYS
                ? 'Commit is complete.'
                : `Day ${lastCompleted + 1} is next.`}
          </p>

          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${(totalCompleted / COMMIT_TOTAL_DAYS) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {isPilotOrDev && (
          <div style={styles.pilotNoteWrap}>
            <p style={styles.pilotNote}>
              {import.meta.env.DEV ? 'Dev mode: all days unlocked.' : 'Pilot mode: all days unlocked.'}
            </p>
          </div>
        )}

        {COMMIT_PHASES.map((phase) => {
          const [start, end] = phase.dayRange
          const phaseDays = COMMIT_DAYS.filter(d => d.day >= start && d.day <= end)

          return (
            <div key={phase.key} style={styles.phaseSection}>
              <div style={styles.phaseHeader}>
                <p style={styles.phaseTitle}>{phase.title}</p>
                <p style={styles.phaseSubtitle}>{phase.subtitle}</p>
              </div>

              <div style={styles.dayList}>
                {phaseDays.map((day) => {
                  const status = getDayStatus(day.day)
                  const tappable = isDayTappable(day.day)

                  return (
                    <button
                      key={day.day}
                      onClick={() => handleDayTap(day.day)}
                      disabled={!tappable}
                      style={{
                        ...styles.dayRow,
                        ...(status === STATUS.COMPLETED ? styles.dayRowCompleted : {}),
                        ...(status === STATUS.CURRENT ? styles.dayRowCurrent : {}),
                        ...(status === STATUS.LOCKED && !tappable ? styles.dayRowLocked : {}),
                        ...(status === STATUS.LOCKED && tappable ? styles.dayRowLockedBypass : {}),
                      }}
                    >
                      <div style={styles.dayNumber}>
                        <span style={styles.dayNumberText}>
                          {String(day.day).padStart(2, '0')}
                        </span>
                      </div>

                      <div style={styles.dayContent}>
                        <p style={{
                          ...styles.dayTitle,
                          ...(status === STATUS.LOCKED && !tappable ? styles.dayTitleLocked : {}),
                        }}>
                          {day.arrivalTitle}
                        </p>
                        {day.arrivalSubtitle && (
                          <p style={{
                            ...styles.daySubtitle,
                            ...(status === STATUS.LOCKED && !tappable ? styles.daySubtitleLocked : {}),
                          }}>
                            {day.arrivalSubtitle}
                          </p>
                        )}
                      </div>

                      <div style={styles.dayStatus}>
                        {status === STATUS.COMPLETED && (
                          <div style={styles.statusCheck}>✓</div>
                        )}
                        {status === STATUS.CURRENT && (
                          <div style={styles.statusCurrent}>Today</div>
                        )}
                        {status === STATUS.LOCKED && !tappable && (
                          <div style={styles.statusLocked}>🔒</div>
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
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  backBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
    minWidth: '60px', textAlign: 'left',
  },
  headerTitle: {
    fontSize: '17px', fontWeight: 500, color: '#2A1F15',
    margin: 0, fontFamily: 'Georgia, serif',
  },
  libraryBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
    minWidth: '60px', textAlign: 'right',
    fontStyle: 'italic',
  },
  summaryCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '20px',
    padding: '1.5rem 1.25rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
  },
  summaryLabel: {
    fontSize: '11px', color: '#9C8C78',
    textTransform: 'uppercase', letterSpacing: '0.12em',
    fontWeight: 500, margin: '0 0 0.5rem',
  },
  summaryNumbers: { margin: '0 0 0.5rem' },
  summaryBig: {
    fontSize: '48px', fontWeight: 500, color: '#2A1F15',
    fontFamily: 'Georgia, serif', lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  summarySlash: {
    fontSize: '24px', color: '#9C8C78',
    fontFamily: 'Georgia, serif',
  },
  summaryTotal: {
    fontSize: '24px', color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontVariantNumeric: 'tabular-nums',
  },
  summarySubtitle: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 1rem',
  },
  progressBar: {
    width: '100%', height: '4px',
    background: '#EFE7D7',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #C5572C 0%, #854F0B 100%)',
    borderRadius: '999px',
    transition: 'width 0.4s ease-out',
  },
  pilotNoteWrap: {
    display: 'flex', justifyContent: 'center',
    marginBottom: '1.25rem',
  },
  pilotNote: {
    fontSize: '11px', color: '#854F0B',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    margin: 0,
    padding: '6px 14px',
    background: '#F4ECDD',
    borderRadius: '999px',
    border: '0.5px solid #E8DCC2',
  },
  phaseSection: { marginBottom: '1.75rem' },
  phaseHeader: { marginBottom: '0.75rem', paddingLeft: '4px' },
  phaseTitle: {
    fontSize: '14px', fontWeight: 500, color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 2px',
  },
  phaseSubtitle: {
    fontSize: '12px', color: '#854F0B',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: 0,
  },
  dayList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  dayRow: {
    display: 'flex', alignItems: 'center',
    width: '100%', padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    cursor: 'pointer', fontFamily: 'inherit',
    textAlign: 'left', gap: '12px',
    transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  dayRowCompleted: { background: '#FDFBF6', borderColor: '#E0D5C2' },
  dayRowCurrent: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 4px 14px rgba(197,87,44,0.18)',
  },
  dayRowLocked: {
    background: '#F0EBDF', borderColor: '#E0D8C5',
    cursor: 'not-allowed', boxShadow: 'none',
  },
  dayRowLockedBypass: {
    background: '#FDFBF6', borderColor: '#E0D5C2',
    borderStyle: 'dashed', cursor: 'pointer',
  },
  dayNumber: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: '#F4ECDD',
    border: '0.5px solid #E0D5C2',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  dayNumberText: {
    fontSize: '12px', fontWeight: 500, color: '#854F0B',
    fontVariantNumeric: 'tabular-nums',
  },
  dayContent: { flex: 1, minWidth: 0 },
  dayTitle: {
    fontSize: '14px', fontWeight: 500, color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0, lineHeight: 1.35,
  },
  dayTitleLocked: { color: '#9C8C78' },
  daySubtitle: {
    fontSize: '11px', color: '#9C8C78',
    fontStyle: 'italic', fontFamily: 'Georgia, serif',
    margin: '2px 0 0', lineHeight: 1.4,
  },
  daySubtitleLocked: { color: '#B5A990' },
  dayStatus: {
    flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '52px',
  },
  statusCheck: {
    width: '24px', height: '24px', borderRadius: '50%',
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '0.5px solid #C2D49A',
    color: '#3B6D11',
    fontSize: '14px', fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statusCurrent: {
    fontSize: '10px', fontWeight: 500, color: '#FAF7F1',
    background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)',
    padding: '4px 10px', borderRadius: '999px',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  statusLocked: { fontSize: '12px', opacity: 0.4 },
  lockedBlock: { textAlign: 'center', padding: '3rem 1rem' },
  lockedIcon: { fontSize: '40px', marginBottom: '1.25rem' },
  lockedTitle: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 1rem',
  },
  lockedReason: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.6, margin: 0,
    maxWidth: '320px',
    marginLeft: 'auto', marginRight: 'auto',
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
}