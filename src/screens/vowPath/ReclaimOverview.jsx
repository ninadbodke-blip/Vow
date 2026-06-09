import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { canEnterReclaim } from './utils/stageAccess'
import { isCadenceBypassed } from './utils/vowPathGating'
import {
  RECLAIM_DAYS,
  RECLAIM_TOTAL_DAYS,
  RECLAIM_PHASES,
} from './data/reclaimContent'
import { useStageBackground } from './utils/silhouettes'

const STATUS = {
  COMPLETED: 'completed',
  CURRENT: 'current',
  OPEN: 'open',
  LOCKED: 'locked',
}

const STAGE_END = 'The step back in'

export default function ReclaimOverview() {
  const navigate = useNavigate()

  const [progress, setProgress] = useState(null)
  const [completedDays, setCompletedDays] = useState(new Set())
  const [loaded, setLoaded] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const heroPaint = useStageBackground('reclaim')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/app/welcome')
        return
      }

      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      // Reclaim is open to any Vow Path user — it is relapse support, not a
      // sequential stage. No stage-order gate.
      if (!canEnterReclaim(progressRow)) {
        setAccessDenied(true)
        setLoaded(true)
        return
      }

      setProgress(progressRow)

      const { data: artifacts } = await supabase
        .from('vow_artifacts')
        .select('day_number')
        .eq('user_id', user.id)
        .eq('stage', 'reclaim')

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

  // Current = the first day not yet completed (or past the end once all five are done).
  let currentDay = RECLAIM_TOTAL_DAYS + 1
  for (let d = 1; d <= RECLAIM_TOTAL_DAYS; d++) {
    if (!completedDays.has(d)) { currentDay = d; break }
  }

  const getDayStatus = (dayNum) => {
    if (completedDays.has(dayNum)) return STATUS.COMPLETED
    if (dayNum === currentDay) return STATUS.CURRENT
    if (dayNum < currentDay) return STATUS.OPEN
    return STATUS.LOCKED
  }

  const isDayTappable = (dayNum) => {
    if (isCadenceBypassed(progress)) return true
    return getDayStatus(dayNum) !== STATUS.LOCKED
  }

  const handleDayTap = (dayNum) => {
    if (!isDayTappable(dayNum)) return
    navigate(`/app/vow-path/reclaim/day/${dayNum}`)
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
            <button onClick={() => navigate('/app/vow-path')} style={styles.backBtn}>‹ Vow Path</button>
            <p style={styles.headerTitle}>Reclaim</p>
            <div style={{ width: '60px' }}></div>
          </div>
          <div style={styles.lockedBlock}>
            <div style={styles.lockedIcon}>◷</div>
            <p style={styles.lockedTitle}>Not yet.</p>
            <p style={styles.lockedReason}>{`Reclaim is part of the Vow Path. Take the Stage Check to begin — and it will be here if you ever need a place to regroup.`}</p>
            <button
              onClick={() => navigate('/app/vow-path')}
              style={{ ...styles.primaryBtn, marginTop: '1.5rem' }}
            >
              Take the Stage Check
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalCompleted = completedDays.size
  const phase = RECLAIM_PHASES[0]

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* 1 — Hero bleed with the back pill overlaid */}
        <div style={styles.heroWrap}>
          <div style={heroPaint} aria-hidden="true" />
          <div style={styles.heroNav}>
            <button onClick={() => navigate('/app/vow-path')} style={styles.pillBtn}>‹ Vow Path</button>
          </div>
        </div>

        {/* 2 — Title + the quiet framing line, married into the dissolve */}
        <div style={styles.frontispiece}>
          <h1 style={styles.stageTitle}>Reclaim</h1>
          {phase?.subtitle && <p style={styles.introLine}>{phase.subtitle}</p>}
          <p style={styles.progressLine}>
            <span style={styles.progressEmph}>{totalCompleted}</span> of {RECLAIM_TOTAL_DAYS} days
          </p>
        </div>

        {/* 4 — The continuous thread + the five days */}
        <div style={styles.listWrap}>
          <div style={styles.thread} aria-hidden="true" />
          {RECLAIM_DAYS.map((day) => {
            const status = getDayStatus(day.day)
            const tappable = isDayTappable(day.day)
            const isToday = status === STATUS.CURRENT
            const isDone = status === STATUS.COMPLETED
            const isLocked = status === STATUS.LOCKED && !tappable

            if (isToday) {
              return (
                <button
                  key={day.day}
                  onClick={() => handleDayTap(day.day)}
                  style={styles.vaultCard}
                >
                  <span style={styles.vaultEyebrow}>{day.day === 1 ? 'Begin here' : "Today's work"}</span>
                  <span style={styles.vaultTitle}>{day.arrivalTitle}</span>
                  {day.arrivalSubtitle && (
                    <span style={styles.vaultSubtitle}>{day.arrivalSubtitle}</span>
                  )}
                </button>
              )
            }

            return (
              <button
                key={day.day}
                onClick={() => handleDayTap(day.day)}
                disabled={!tappable}
                style={{
                  ...styles.dayRow,
                  ...(isLocked ? styles.dayRowLocked : {}),
                  cursor: tappable ? 'pointer' : 'not-allowed',
                }}
              >
                <span style={{
                  ...styles.dayNode,
                  color: isDone ? '#D9B57A' : '#C9BBA3',
                }}>{isDone ? '✦' : '·'}</span>
                <span style={styles.dayContent}>
                  <span style={{
                    ...styles.dayTitle,
                    ...(isDone ? styles.dayTitleDone : {}),
                  }}>{day.arrivalTitle}</span>
                  {day.arrivalSubtitle && (
                    <span style={styles.daySubtitle}>{day.arrivalSubtitle}</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {/* 5 — The anchor */}
        <div style={styles.anchor}>
          <span style={styles.anchorMark}>✧</span>
          <span style={styles.anchorText}>{STAGE_END}</span>
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
    position: 'relative',
    zIndex: 0,
    background: '#FAF7F1',
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '1.75rem 1.25rem 2.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
    overflow: 'hidden',
  },

  // 1 — Hero
  heroWrap: {
    position: 'relative',
    height: 'clamp(250px, 44vh, 400px)',
    margin: '-1.75rem -1.25rem 0',
  },
  heroNav: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '2.25rem 1.5rem 0',
  },
  pillBtn: {
    background: 'rgba(250, 247, 241, 0.22)',
    WebkitBackdropFilter: 'blur(12px)',
    backdropFilter: 'blur(12px)',
    border: '0.5px solid rgba(255, 255, 255, 0.4)',
    color: '#3A2A1C', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
    padding: '7px 16px', borderRadius: '999px',
  },

  // 2 — Title pulled up into the hero's dissolve
  frontispiece: {
    position: 'relative', zIndex: 1, textAlign: 'center',
    marginTop: '-52px', padding: '0 0.5rem',
  },
  stageTitle: {
    fontSize: 'clamp(28px, 8vw, 34px)', fontWeight: 400, color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 0.6rem', letterSpacing: '0.01em', lineHeight: 1.1,
  },
  introLine: {
    fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', textAlign: 'center', lineHeight: 1.45,
    margin: '0 auto 0.5rem', maxWidth: '300px',
  },
  progressLine: {
    fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', textAlign: 'center', letterSpacing: '0.02em', margin: 0,
  },
  progressEmph: { color: '#854F0B' },

  // 4 — Continuous thread + list (single-phase: spine starts near the top)
  listWrap: { position: 'relative', marginTop: '2.5rem', paddingTop: '0.25rem', paddingBottom: '48px' },
  thread: {
    position: 'absolute', left: '19px', top: '18px', bottom: 0, width: '1.5px',
    background: 'linear-gradient(180deg, rgba(217,181,122,0.6) 0%, rgba(217,181,122,0.6) 80%, rgba(217,181,122,0) 100%)',
  },

  dayRow: {
    position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start',
    gap: '12px', width: '100%', background: 'transparent', border: 'none',
    textAlign: 'left', padding: '15px 4px', fontFamily: 'inherit',
  },
  dayRowLocked: { opacity: 0.3 },
  dayNode: {
    width: '30px', flexShrink: 0, textAlign: 'center', fontSize: '15px',
    lineHeight: '1.5', marginTop: '1px', background: '#FAF7F1',
  },
  dayContent: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '1px' },
  dayTitle: { fontSize: '16px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.35 },
  dayTitleDone: { color: '#9C8C78', fontStyle: 'italic', fontWeight: 400 },
  daySubtitle: { fontSize: '13px', color: '#9C8C78', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.4 },

  vaultCard: {
    position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column',
    gap: '5px', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    borderRadius: '18px', padding: '20px 22px', margin: '10px 0',
    boxShadow: '0 14px 30px -12px rgba(40,25,10,0.5)',
  },
  vaultEyebrow: {
    fontSize: '10px', color: '#D9B57A', textTransform: 'uppercase',
    letterSpacing: '0.2em', fontWeight: 600, fontFamily: '-apple-system, sans-serif',
  },
  vaultTitle: { fontSize: '19px', fontWeight: 500, color: '#FAF7F1', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.3 },
  vaultSubtitle: { fontSize: '13px', color: '#CBBA98', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.45 },

  // 5 — Anchor
  anchor: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', marginTop: '2px' },
  anchorMark: { fontSize: '14px', color: '#D9B57A' },
  anchorText: { fontSize: '12px', color: '#9C8C78', fontStyle: 'italic', fontFamily: 'Georgia, serif', letterSpacing: '0.04em' },

  // --- loading / accessDenied states ---
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' },
  backBtn: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px', minWidth: '60px', textAlign: 'left' },
  headerTitle: { fontSize: '17px', fontWeight: 500, color: '#2A1F15', margin: 0, fontFamily: 'Georgia, serif' },
  lockedBlock: { textAlign: 'center', padding: '3rem 1rem' },
  lockedIcon: { fontSize: '34px', marginBottom: '1.25rem', color: '#C9BBA3' },
  lockedTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: '0 0 1rem' },
  lockedReason: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: 0, maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' },
  primaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)' },
}