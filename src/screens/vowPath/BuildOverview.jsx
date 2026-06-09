import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import {
  BUILD_DAYS,
  BUILD_TOTAL_DAYS,
  BUILD_PHASES,
  getCurrentBuildWeek,
} from './data/buildContent'
import { useStageBackground } from './utils/silhouettes'

const STATUS = {
  COMPLETED: 'completed',
  CURRENT: 'current',
  OPEN: 'open',
  LOCKED: 'locked',
}

const STAGE_END = 'End of Build'
const DAYS = [1, 2, 3, 4, 5, 6, 7]

export default function BuildOverview() {
  const navigate = useNavigate()

  const [progress, setProgress] = useState(null)
  const [completedDays, setCompletedDays] = useState(new Set())
  const [currentWeek, setCurrentWeek] = useState(1)
  const [loaded, setLoaded] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const heroPaint = useStageBackground('build')

  // Offline practice tracking: { [weekNum]: { [dayIdx 1-7]: 'done' | 'missed' } }
  const [offlineMarks, setOfflineMarks] = useState({})
  const [activeOffline, setActiveOffline] = useState(null) // the week object whose sheet is open
  const [offlineDraft, setOfflineDraft] = useState({})
  const [savingOffline, setSavingOffline] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/app/welcome'); return }

      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!progressRow || progressRow.current_stage !== 'build') {
        setAccessDenied(true)
        setLoaded(true)
        return
      }

      setProgress(progressRow)
      setCurrentWeek(getCurrentBuildWeek(progressRow.build_starts_at))

      const { data: artifacts } = await supabase
        .from('vow_artifacts')
        .select('artifact_type, content, day_number')
        .eq('user_id', user.id)
        .eq('stage', 'build')

      const completed = new Set()
      const offMap = {}
      ;(artifacts || []).forEach(a => {
        if (a.artifact_type && a.artifact_type.startsWith('build_offline_week_')) {
          const wk = parseInt(a.artifact_type.replace('build_offline_week_', ''), 10)
          if (wk) offMap[wk] = (a.content && a.content.marks) || {}
        } else if (a.day_number !== null && a.day_number !== undefined) {
          completed.add(a.day_number)
        }
      })
      setCompletedDays(completed)
      setOfflineMarks(offMap)
      setLoaded(true)
    }
    load()
  }, [navigate])

  // Build is week-gated: the current week opens by elapsed time, completed
  // weeks come from artifacts, future weeks stay locked.
  const getDayStatus = (weekNum) => {
    if (completedDays.has(weekNum)) return STATUS.COMPLETED
    if (weekNum === currentWeek) return STATUS.CURRENT
    if (weekNum < currentWeek) return STATUS.OPEN
    return STATUS.LOCKED
  }

  const isDayTappable = (weekNum) => {
    if (import.meta.env.DEV) return true
    if (progress?.is_pilot_mode) return true
    const status = getDayStatus(weekNum)
    return status !== STATUS.LOCKED
  }

  const handleDayTap = (weekNum) => {
    if (!isDayTappable(weekNum)) return
    navigate(`/app/vow-path/build/day/${weekNum}`)
  }

  // ---- offline practice tracking ----
  const doneCount = (marks) => Object.values(marks || {}).filter(v => v === 'done').length
  const openOffline = (week) => { setOfflineDraft({ ...(offlineMarks[week.day] || {}) }); setActiveOffline(week) }
  const closeOffline = () => setActiveOffline(null)
  const markDay = (d, val) => setOfflineDraft(prev => ({ ...prev, [d]: prev[d] === val ? undefined : val }))

  const saveOffline = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !activeOffline) return
    setSavingOffline(true)
    const marks = {}
    Object.entries(offlineDraft).forEach(([k, v]) => { if (v) marks[k] = v })
    const wk = activeOffline.day
    const { error } = await supabase
      .from('vow_artifacts')
      .upsert({
        user_id: user.id,
        artifact_type: `build_offline_week_${wk}`,
        content: { activity_id: activeOffline.offlinePractice?.id || null, marks },
        stage: 'build',
        day_number: wk,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,artifact_type' })
    setSavingOffline(false)
    if (!error) {
      setOfflineMarks(prev => ({ ...prev, [wk]: marks }))
      setActiveOffline(null)
    } else {
      console.error('Failed to save offline marks:', error)
      alert('Could not save. Please try again.')
    }
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
            <p style={styles.headerTitle}>Build</p>
            <div style={{ width: '60px' }}></div>
          </div>
          <div style={styles.lockedBlock}>
            <div style={styles.lockedIcon}>⏳</div>
            <p style={styles.lockedTitle}>Not yet.</p>
            <p style={styles.lockedReason}>{`You haven't reached Build yet. It opens after Endure.`}</p>
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
  const isPilotOrDev = import.meta.env.DEV || progress?.is_pilot_mode

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* 1 — Hero bleed with nav pills overlaid */}
        <div style={styles.heroWrap}>
          <div style={heroPaint} aria-hidden="true" />
          <div style={styles.heroNav}>
            <button onClick={() => navigate('/app/vow-path')} style={styles.pillBtn}>‹ Vow Path</button>
            <button onClick={() => navigate('/app/library/build')} style={styles.pillBtn}>Library</button>
          </div>
        </div>

        {/* 2 — Title pulled up into the hero's dissolve */}
        <div style={styles.frontispiece}>
          <h1 style={styles.stageTitle}>Build</h1>
          <p style={styles.progressLine}>
            <span style={styles.progressEmph}>{totalCompleted}</span> of {BUILD_TOTAL_DAYS} weeks gathered
          </p>
        </div>

        {/* 3 — Pilot / dev note */}
        {isPilotOrDev && (
          <div style={styles.pilotNoteWrap}>
            <p style={styles.pilotNote}>
              {import.meta.env.DEV ? 'Dev mode: all weeks unlocked.' : 'Pilot mode: all weeks unlocked.'}
            </p>
          </div>
        )}

        {/* 4 — Continuous thread behind the centred phase headers + week list */}
        <div style={styles.listWrap}>
          <div style={styles.thread} aria-hidden="true" />
          {BUILD_PHASES.map((phase) => {
            const [start, end] = phase.dayRange
            const phaseWeeks = BUILD_DAYS.filter(d => d.day >= start && d.day <= end)
            return (
              <div key={phase.key}>
                <div style={styles.phaseHeader}>
                  <p style={styles.phaseTitle}>{`· ${phase.title.toUpperCase()} ·`}</p>
                  {phase.subtitle && <p style={styles.phaseSubtitle}>{phase.subtitle}</p>}
                </div>

                {phaseWeeks.map((week) => {
                  const status = getDayStatus(week.day)
                  const tappable = isDayTappable(week.day)
                  const isToday = status === STATUS.CURRENT
                  const isDone = status === STATUS.COMPLETED
                  const isLocked = status === STATUS.LOCKED && !tappable
                  const marks = offlineMarks[week.day] || {}
                  const showStrip = tappable && week.offlinePractice

                  return (
                    <div key={week.day}>
                      {isToday ? (
                        <button onClick={() => handleDayTap(week.day)} style={styles.vaultCard}>
                          <span style={styles.vaultEyebrow}>This week's work</span>
                          <span style={styles.vaultTitle}>{week.arrivalTitle}</span>
                          {week.arrivalSubtitle && (
                            <span style={styles.vaultSubtitle}>{week.arrivalSubtitle}</span>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDayTap(week.day)}
                          disabled={!tappable}
                          style={{
                            ...styles.dayRow,
                            ...(isLocked ? styles.dayRowLocked : {}),
                            cursor: tappable ? 'pointer' : 'not-allowed',
                          }}
                        >
                          <span style={{ ...styles.dayNode, color: isDone ? '#D9B57A' : '#C9BBA3' }}>
                            {isDone ? '✦' : '·'}
                          </span>
                          <span style={styles.dayContent}>
                            <span style={{ ...styles.dayTitle, ...(isDone ? styles.dayTitleDone : {}) }}>
                              {week.arrivalTitle}
                            </span>
                            {week.arrivalSubtitle && (
                              <span style={styles.daySubtitle}>{week.arrivalSubtitle}</span>
                            )}
                          </span>
                        </button>
                      )}

                      {showStrip && (
                        <button onClick={() => openOffline(week)} style={styles.offlineStrip}>
                          <div style={styles.offlineStripTop}>
                            <span style={styles.offlineTag}>Offline practice</span>
                            <span style={styles.offlineCount}>{doneCount(marks)}/7</span>
                          </div>
                          <span style={styles.offlineName}>{week.offlinePractice.title}</span>
                          <div style={styles.offlineDots}>
                            {DAYS.map(d => {
                              const m = marks[d]
                              return (
                                <span key={d} style={{
                                  ...styles.offDot,
                                  ...(m === 'done' ? styles.offDotDone : m === 'missed' ? styles.offDotMissed : {}),
                                }} />
                              )
                            })}
                          </div>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* 5 — The anchor */}
        <div style={styles.anchor}>
          <span style={styles.anchorMark}>✧</span>
          <span style={styles.anchorText}>{STAGE_END}</span>
        </div>

        {/* Offline practice marking sheet */}
        {activeOffline && activeOffline.offlinePractice && (
          <div style={styles.sheetOverlay} onClick={closeOffline}>
            <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
              <div style={styles.sheetHandle} aria-hidden="true" />
              <p style={styles.sheetEyebrow}>Offline this week · Week {activeOffline.day}</p>
              <p style={styles.sheetTitle}>{activeOffline.offlinePractice.title}</p>
              <p style={styles.sheetAction}>{activeOffline.offlinePractice.action}</p>
              {activeOffline.offlinePractice.why && (
                <div style={styles.whyBox}>
                  <p style={styles.whyText}>{activeOffline.offlinePractice.why}</p>
                </div>
              )}

              <p style={styles.sheetQ}>Mark each day — honestly. Both answers count.</p>
              <div style={styles.dayMarks}>
                {DAYS.map(d => (
                  <div key={d} style={styles.dayMarkRow}>
                    <span style={styles.dayMarkLabel}>Day {d}</span>
                    <div style={styles.dayMarkBtns}>
                      <button
                        onClick={() => markDay(d, 'done')}
                        style={{ ...styles.markBtn, ...(offlineDraft[d] === 'done' ? styles.markBtnDone : {}) }}
                      >
                        Did it
                      </button>
                      <button
                        onClick={() => markDay(d, 'missed')}
                        style={{ ...styles.markBtn, ...(offlineDraft[d] === 'missed' ? styles.markBtnMissed : {}) }}
                      >
                        Didn't
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={saveOffline}
                disabled={savingOffline}
                style={{ ...styles.sheetSave, ...(savingOffline ? styles.sheetSaveDisabled : {}) }}
              >
                {savingOffline ? 'Saving…' : 'Save'}
              </button>
              <button onClick={closeOffline} style={styles.sheetCancel}>Not now</button>
            </div>
          </div>
        )}

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
  heroWrap: { position: 'relative', height: 'clamp(250px, 44vh, 400px)', margin: '-1.75rem -1.25rem 0' },
  heroNav: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2.25rem 1.5rem 0' },
  pillBtn: {
    background: 'rgba(250, 247, 241, 0.22)', WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)',
    border: '0.5px solid rgba(255, 255, 255, 0.4)', color: '#3A2A1C', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', padding: '7px 16px', borderRadius: '999px',
  },

  // 2 — Title
  frontispiece: { position: 'relative', zIndex: 1, textAlign: 'center', marginTop: '-52px', padding: '0 0.5rem' },
  stageTitle: {
    fontSize: 'clamp(28px, 8vw, 34px)', fontWeight: 400, color: '#2A1F15', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', margin: '0 0 0.6rem', letterSpacing: '0.01em', lineHeight: 1.1,
  },
  progressLine: { fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', letterSpacing: '0.02em', margin: 0 },
  progressEmph: { color: '#854F0B' },

  // 3 — Pilot note
  pilotNoteWrap: { textAlign: 'center', margin: '1.25rem 0 0' },
  pilotNote: { display: 'inline-block', fontSize: '11px', color: '#9C8C78', fontStyle: 'italic', fontFamily: 'Georgia, serif', background: '#F2ECE0', borderRadius: '999px', padding: '5px 14px' },

  // 4 — Continuous thread + list
  listWrap: { position: 'relative', marginTop: '2.5rem', paddingTop: '0.25rem', paddingBottom: '48px' },
  thread: {
    position: 'absolute', left: '19px', top: '88px', bottom: 0, width: '1.5px',
    background: 'linear-gradient(180deg, rgba(217,181,122,0.6) 0%, rgba(217,181,122,0.6) 80%, rgba(217,181,122,0) 100%)',
  },
  phaseHeader: { textAlign: 'center', margin: '2rem 0 1.25rem' },
  phaseTitle: { fontSize: '12px', fontWeight: 600, color: '#854F0B', fontFamily: '-apple-system, sans-serif', textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0 0 0.35rem' },
  phaseSubtitle: { fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.4 },

  dayRow: {
    position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%',
    background: 'transparent', border: 'none', textAlign: 'left', padding: '15px 4px', fontFamily: 'inherit',
  },
  dayRowLocked: { opacity: 0.3 },
  dayNode: { width: '30px', flexShrink: 0, textAlign: 'center', fontSize: '15px', lineHeight: '1.5', marginTop: '1px', background: '#FAF7F1' },
  dayContent: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '1px' },
  dayTitle: { fontSize: '16px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.35 },
  dayTitleDone: { color: '#9C8C78', fontStyle: 'italic', fontWeight: 400 },
  daySubtitle: { fontSize: '13px', color: '#9C8C78', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.4 },

  vaultCard: {
    position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '5px', width: '100%',
    textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', borderRadius: '18px', padding: '20px 22px',
    margin: '10px 0', boxShadow: '0 14px 30px -12px rgba(40,25,10,0.5)',
  },
  vaultEyebrow: { fontSize: '10px', color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600, fontFamily: '-apple-system, sans-serif' },
  vaultTitle: { fontSize: '19px', fontWeight: 500, color: '#FAF7F1', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.3 },
  vaultSubtitle: { fontSize: '13px', color: '#CBBA98', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.45 },

  // Offline practice strip (under each accessible week)
  offlineStrip: {
    display: 'block', width: 'calc(100% - 42px)', marginLeft: '42px', marginTop: '-2px', marginBottom: '10px',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F5EEDF 100%)', border: '0.5px solid #EADFCB',
    borderRadius: '12px', padding: '11px 13px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
  },
  offlineStripTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' },
  offlineTag: { fontSize: '9.5px', color: '#A1814E', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 600, fontFamily: '-apple-system, sans-serif' },
  offlineCount: { fontSize: '11px', color: '#854F0B', fontFamily: 'Georgia, serif', fontWeight: 600 },
  offlineName: { display: 'block', fontSize: '13px', color: '#5A4A36', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.35, marginBottom: '8px' },
  offlineDots: { display: 'flex', gap: '7px' },
  offDot: { width: '9px', height: '9px', borderRadius: '50%', background: '#E6DCC8', boxSizing: 'border-box', flexShrink: 0 },
  offDotDone: { background: '#D9B57A' },
  offDotMissed: { background: 'transparent', border: '1.5px solid #CBB892' },

  // 5 — Anchor
  anchor: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', marginTop: '2px' },
  anchorMark: { fontSize: '14px', color: '#D9B57A' },
  anchorText: { fontSize: '12px', color: '#9C8C78', fontStyle: 'italic', fontFamily: 'Georgia, serif', letterSpacing: '0.04em' },

  // Offline marking bottom sheet
  sheetOverlay: {
    position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(40,25,15,0.45)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    WebkitBackdropFilter: 'blur(2px)', backdropFilter: 'blur(2px)',
  },
  sheet: {
    background: '#FAF7F1', width: '100%', maxWidth: '440px', borderRadius: '24px 24px 0 0',
    padding: '14px 22px 28px', boxShadow: '0 -10px 40px rgba(40,25,10,0.25)', maxHeight: '90vh', overflowY: 'auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  sheetHandle: { width: '40px', height: '4px', borderRadius: '2px', background: '#D8CCB8', margin: '0 auto 16px' },
  sheetEyebrow: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, margin: '0 0 6px', textAlign: 'center' },
  sheetTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.3, margin: '0 0 10px', textAlign: 'center' },
  sheetAction: { fontSize: '14.5px', color: '#3A2D1E', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: '0 0 12px' },
  whyBox: { background: '#F2ECE0', borderRadius: '12px', padding: '12px 14px', margin: '0 0 4px' },
  whyText: { fontSize: '12.5px', color: '#7A6A52', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: 0 },
  sheetQ: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', margin: '20px 0 11px' },
  dayMarks: { display: 'flex', flexDirection: 'column', gap: '8px' },
  dayMarkRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  dayMarkLabel: { width: '52px', flexShrink: 0, fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif' },
  dayMarkBtns: { display: 'flex', gap: '8px', flex: 1 },
  markBtn: {
    flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E0D3BC', background: '#FFFDF9',
    color: '#6B5C4A', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  markBtnDone: { background: '#6E7F4E', border: '1px solid #6E7F4E', color: '#FBF6EA' },
  markBtnMissed: { background: '#EFE6D6', border: '1px solid #D9C9B0', color: '#8A7355' },
  sheetSave: {
    width: '100%', marginTop: '20px', padding: '14px', borderRadius: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  sheetSaveDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  sheetCancel: { width: '100%', marginTop: '10px', padding: '10px', background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '13px', fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer' },

  // --- kept for loading / accessDenied states ---
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' },
  backBtn: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px', minWidth: '60px', textAlign: 'left' },
  headerTitle: { fontSize: '17px', fontWeight: 500, color: '#2A1F15', margin: 0, fontFamily: 'Georgia, serif' },
  lockedBlock: { textAlign: 'center', padding: '3rem 1rem' },
  lockedIcon: { fontSize: '40px', marginBottom: '1.25rem' },
  lockedTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: '0 0 1rem' },
  lockedReason: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: 0, maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' },
  primaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)' },
}