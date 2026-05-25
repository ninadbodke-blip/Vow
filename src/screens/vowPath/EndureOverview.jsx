import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { canEnterStage, isExploringPastStage } from './utils/stageAccess'
import {
  ENDURE_DAYS,
  ENDURE_TOTAL_DAYS,
  ENDURE_PHASES,
} from './data/endureContent'

const STATUS = {
  COMPLETED: 'completed',
  CURRENT: 'current',
  LOCKED: 'locked',
}

export default function EndureOverview() {
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

      if (!canEnterStage(progressRow, 'endure')) {
        setAccessDenied(true)
        setLoaded(true)
        return
      }

      setProgress(progressRow)

      const { data: artifacts } = await supabase
        .from('vow_artifacts')
        .select('day_number')
        .eq('user_id', user.id)
        .eq('stage', 'endure')

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
    if (isExploringPastStage(progress, 'endure')) return true
    const status = getDayStatus(dayNum)
    return status === STATUS.COMPLETED || status === STATUS.CURRENT
  }

  const handleDayTap = (dayNum) => {
    if (!isDayTappable(dayNum)) return
    navigate(`/vow-path/endure/day/${dayNum}`)
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
            <p style={styles.headerTitle}>Endure</p>
            <div style={{ width: '60px' }}></div>
          </div>
          <div style={styles.lockedBlock}>
            <div style={styles.lockedIcon}>⏳</div>
            <p style={styles.lockedTitle}>Not yet.</p>
            <p style={styles.lockedReason}>{`You haven't started Endure yet. Take the Stage Check first, or complete Commit.`}</p>
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

  // ===================================================================
  // WAITING STATE — stop date is in the future
  // ===================================================================
  const endureStartsAt = progress?.endure_starts_at
  const isWaiting = endureStartsAt && new Date(endureStartsAt) > new Date()

  if (isWaiting && !import.meta.env.DEV && !progress?.is_pilot_mode) {
    const startDate = new Date(endureStartsAt)
    const now = new Date()
    const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24))
    const formattedDate = startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.header}>
            <button onClick={() => navigate('/vow-path')} style={styles.backBtn}>‹ Vow Path</button>
            <p style={styles.headerTitle}>Endure</p>
            <div style={{ width: '60px' }}></div>
          </div>

          <div style={styles.waitingBlock}>
            <div style={styles.waitingOrnament}>· · ·</div>
            <p style={styles.waitingEyebrow}>The vow is sealed.</p>
            <h1 style={styles.waitingTitle}>
              Endure begins in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}.
            </h1>
            <p style={styles.waitingDate}>{formattedDate}</p>
            <div style={styles.waitingOrnament}>· · ·</div>

            <div style={styles.waitingBody}>
              <p style={styles.waitingPara}>
                The stop date you set on Commit Day 1 is when Endure begins. Until then, the structure you built — the daily anchors, the if-then library, the conversations — is what holds the days.
              </p>
              <p style={styles.waitingPara}>
                Re-read your vow. Talk to your anchor person. Walk slowly toward the date.
              </p>
              <p style={styles.waitingPara}>
                When the stop date arrives, Endure Day Zero unlocks here.
              </p>
            </div>

            <button onClick={() => navigate('/home')} style={styles.primaryBtn}>
              Return home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===================================================================
  // MAIN VIEW — Endure has started
  // ===================================================================
  const lastCompleted = progress?.last_completed_day || 0
  const totalCompleted = completedDays.size
  const isPilotOrDev = import.meta.env.DEV || progress?.is_pilot_mode

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.header}>
          <button onClick={() => navigate('/vow-path')} style={styles.backBtn}>‹ Vow Path</button>
          <p style={styles.headerTitle}>Endure</p>
          <button onClick={() => navigate('/library/endure')} style={styles.libraryBtn}>
            Library
          </button>
        </div>

                <div style={styles.tallyBlock}>
          <p style={styles.tallyEyebrow}>Your journey</p>
          <p style={styles.tallyLine}>
            You have gathered <span style={styles.tallyEmph}>{totalCompleted}</span> of {ENDURE_TOTAL_DAYS} days.
          </p>
          <div style={styles.tallyMarks}>
            {Array.from({ length: ENDURE_TOTAL_DAYS }).map((_, i) => {
              const n = i + 1
              const done = n <= totalCompleted
              const today = !done && n === lastCompleted + 1
              return (
                <span key={i} style={{
                  ...styles.tallyMark,
                  color: done ? '#D9B57A' : today ? '#854F0B' : '#C9BBA3',
                  opacity: done || today ? 1 : 0.7,
                }}>{done ? '✦' : today ? '✧' : '·'}</span>
              )
            })}
          </div>
          <p style={styles.tallySubtitle}>
            {totalCompleted === 0
              ? 'Begin with Day 1.'
              : totalCompleted === ENDURE_TOTAL_DAYS
                ? 'Endure is complete.'
                : `Day ${lastCompleted + 1} is next.`}
          </p>
        </div>

        {isPilotOrDev && (
          <div style={styles.pilotNoteWrap}>
            <p style={styles.pilotNote}>
              {import.meta.env.DEV ? 'Dev mode: all days unlocked.' : 'Pilot mode: all days unlocked.'}
            </p>
          </div>
        )}

        {ENDURE_PHASES.map((phase) => {
          const [start, end] = phase.dayRange
          const phaseDays = ENDURE_DAYS.filter(d => d.day >= start && d.day <= end)

          return (
            <div key={phase.key} style={styles.phaseSection}>
              <div style={styles.phaseHeader}>
                <p style={styles.phaseTitle}>{phase.title}</p>
                <p style={styles.phaseSubtitle}>{phase.subtitle}</p>
              </div>

                            <div style={styles.threadWrap}>
                <div style={styles.thread} />
                {phaseDays.map((day) => {
                  const status = getDayStatus(day.day)
                  const tappable = isDayTappable(day.day)
                  const isToday = status === STATUS.CURRENT
                  const isDone = status === STATUS.COMPLETED
                  const isLocked = status === STATUS.LOCKED && !tappable
                  return (
                    <button
                      key={day.day}
                      onClick={() => handleDayTap(day.day)}
                      disabled={!tappable}
                      style={{
                        ...styles.threadRow,
                        ...(isToday ? styles.threadRowToday : {}),
                        ...(isLocked ? styles.threadRowLocked : {}),
                        cursor: tappable ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <span style={{
                        ...styles.threadNode,
                        color: (isDone || isToday) ? '#D9B57A' : '#C9BBA3',
                        background: isToday ? 'transparent' : '#FAF7F1',
                      }}>{(isDone || isToday) ? '✦' : '·'}</span>
                      <span style={styles.threadContent}>
                        {isToday && <span style={styles.todayEyebrow}>Today's work</span>}
                        <span style={{
                          ...styles.threadTitle,
                          ...(isToday ? styles.threadTitleToday : {}),
                          ...(isDone ? styles.threadTitleDone : {}),
                        }}>{day.arrivalTitle}</span>
                        {day.arrivalSubtitle && (
                          <span style={{
                            ...styles.threadSubtitle,
                            ...(isToday ? styles.threadSubtitleToday : {}),
                          }}>{day.arrivalSubtitle}</span>
                        )}
                      </span>
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
  tallyBlock: { textAlign: 'center', margin: '0 0 2rem', padding: '0.5rem 0' },
  tallyEyebrow: { fontSize: '11px', color: '#9C8C78', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 500, margin: '0 0 0.75rem' },
  tallyLine: { fontSize: '17px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 1rem', lineHeight: 1.4 },
  tallyEmph: { color: '#854F0B', fontStyle: 'normal', fontWeight: 500 },
  tallyMarks: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', margin: '0 0 0.85rem' },
  tallyMark: { fontSize: '15px', lineHeight: 1 },
  tallySubtitle: { fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0 },
  threadWrap: { position: 'relative', paddingLeft: '2px' },
  thread: { position: 'absolute', left: '15px', top: '14px', bottom: '14px', width: '1.5px', background: '#D9B57A', opacity: 0.45, zIndex: 0 },
  threadRow: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', padding: '11px 4px', fontFamily: 'inherit' },
  threadRowToday: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', borderRadius: '16px', padding: '16px', margin: '6px 0', boxShadow: '0 10px 24px -10px rgba(40,25,10,0.45)' },
  threadRowLocked: { opacity: 0.3 },
  threadNode: { width: '28px', flexShrink: 0, textAlign: 'center', fontSize: '14px', lineHeight: '1.5' },
  threadContent: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '1px' },
  todayEyebrow: { fontSize: '10px', color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500 },
  threadTitle: { fontSize: '15px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.35 },
  threadTitleToday: { color: '#FAF7F1' },
  threadTitleDone: { color: '#9C8C78', fontStyle: 'italic', fontWeight: 400 },
  threadSubtitle: { fontSize: '12px', color: '#9C8C78', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.4 },
  threadSubtitleToday: { color: '#CBBA98' },
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

  // WAITING STATE
  waitingBlock: {
    textAlign: 'center',
    padding: '2rem 1rem 1rem',
  },
  waitingOrnament: {
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    margin: '0 0 1.5rem',
  },
  waitingEyebrow: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 1rem',
  },
  waitingTitle: {
    fontSize: '28px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.25,
    margin: '0 0 0.5rem',
  },
  waitingDate: {
    fontSize: '14px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 1.5rem',
  },
  waitingBody: {
    margin: '2rem 0',
    textAlign: 'left',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
  },
  waitingPara: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.75,
    margin: '0 0 1.25rem',
  },

  // SUMMARY
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