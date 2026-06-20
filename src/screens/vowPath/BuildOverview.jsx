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
import { PracticeArchetypeIcon } from './practiceArchetypeIcons'
import { isCadenceBypassed } from './utils/vowPathGating'
import { isExploringPastStage } from './utils/stageAccess'

const STATUS = {
  COMPLETED: 'completed',
  CURRENT: 'current',
  OPEN: 'open',
  LOCKED: 'locked',
}

const STAGE_END = 'End of Build'
const DAYS = [1, 2, 3, 4, 5, 6, 7]
const MS_PER_DAY = 1000 * 60 * 60 * 24

export default function BuildOverview() {
  const navigate = useNavigate()

  const [progress, setProgress] = useState(null)
  const [completedDays, setCompletedDays] = useState(new Set())
  const [currentWeek, setCurrentWeek] = useState(1)
  const [loaded, setLoaded] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const heroUrl = useStageBackground('build')

  // Offline practice tracking: { [weekNum]: { [dayIdx 1-7]: 'done' | 'missed' } }
  const [offlineMarks, setOfflineMarks] = useState({})
  const [activeOffline, setActiveOffline] = useState(null) // the week object whose sheet is open
  const [offlineDraft, setOfflineDraft] = useState({})
  const [savingOffline, setSavingOffline] = useState(false)
  const [activeDayCard, setActiveDayCard] = useState(null) // { week, act } for the per-day floating card
  const [dayCardChoice, setDayCardChoice] = useState(null) // 'done' | 'missed' | null

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

  // When the cadence is bypassed (local dev, pilot tester, or the pilot flag),
  // every week and every offline day opens immediately — for testing.
  const bypass = isCadenceBypassed(progress)

  // How many days into the run we are (0 on the first day), used to open each
  // offline day only after it has actually started.
  const daysSinceStart = progress?.build_starts_at
    ? Math.max(0, Math.floor((Date.now() - new Date(progress.build_starts_at).getTime()) / MS_PER_DAY))
    : 0

  // Number of this week's 7 offline days that have started (and so are markable).
  const availableDaysInWeek = (weekNum) => {
    if (bypass) return 7
    return Math.max(0, Math.min(7, daysSinceStart - (weekNum - 1) * 7 + 1))
  }

  // Build is week-gated: the current week opens by elapsed time, completed
  // weeks come from artifacts, future weeks stay locked.
  // For an EXPLORED Build (Reclaim user revisiting), the time-based currentWeek
  // is stale (their original run elapsed long ago), so gate cards by sequence
  // using completed entries — matching BuildDay's explored-stage rule exactly,
  // so a card's appearance never disagrees with whether the day will open.
  const exploringBuild = isExploringPastStage(progress, 'build')
  const nextExploredEntry = (() => {
    if (!exploringBuild) return null
    let n = 1
    while (completedDays.has(n)) n++
    return n
  })()
  const getDayStatus = (weekNum) => {
    if (completedDays.has(weekNum)) return STATUS.COMPLETED
    if (exploringBuild) {
      if (weekNum === nextExploredEntry) return STATUS.CURRENT
      return STATUS.LOCKED
    }
    if (weekNum === currentWeek) return STATUS.CURRENT
    if (weekNum < currentWeek) return STATUS.OPEN
    return STATUS.LOCKED
  }

  const isDayTappable = (weekNum) => {
    if (bypass) return true
    return getDayStatus(weekNum) !== STATUS.LOCKED
  }

  const handleDayTap = (weekNum) => {
    if (!isDayTappable(weekNum)) return
    navigate(`/app/vow-path/build/day/${weekNum}`)
  }

  // ---- offline practice tracking ----
  const doneCountOf = (marks) => Object.values(marks || {}).filter(v => v === 'done').length
  const markedCountOf = (marks) => Object.values(marks || {}).filter(v => v === 'done' || v === 'missed').length
  const openOffline = (week) => { setOfflineDraft({ ...(offlineMarks[week.day] || {}) }); setActiveOffline(week) }
  const closeOffline = () => setActiveOffline(null)
  const openDayCard = (week, act) => { setDayCardChoice((offlineMarks[week.day] || {})[act.day] || null); setActiveDayCard({ week, act }) }
  const closeDayCard = () => setActiveDayCard(null)
  const saveDayCard = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !activeDayCard) return
    setSavingOffline(true)
    const wk = activeDayCard.week.day
    const marks = { ...(offlineMarks[wk] || {}) }
    if (dayCardChoice) marks[activeDayCard.act.day] = dayCardChoice
    else delete marks[activeDayCard.act.day]
    const { error } = await supabase
      .from('vow_artifacts')
      .upsert({
        user_id: user.id,
        artifact_type: `build_offline_week_${wk}`,
        content: { marks },
        stage: 'build',
        day_number: wk,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,artifact_type' })
    setSavingOffline(false)
    if (!error) { setOfflineMarks(prev => ({ ...prev, [wk]: marks })); setActiveDayCard(null) }
    else { console.error('Failed to save day mark:', error); alert('Could not save. Please try again.') }
  }
  const markDay = (d, val) => {
    if (!activeOffline) return
    if (d > availableDaysInWeek(activeOffline.day)) return // can't mark a day that hasn't started
    setOfflineDraft(prev => ({ ...prev, [d]: prev[d] === val ? undefined : val }))
  }

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

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* 1 — Hero bleed with nav pills overlaid */}
        <div style={styles.heroWrap}>
          {heroUrl && <img src={heroUrl} alt="" style={styles.heroImg} />}
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

        {/* 3 — Testing note */}
        {bypass && (
          <div style={styles.pilotNoteWrap}>
            <p style={styles.pilotNote}>Testing mode — all weeks and days unlocked.</p>
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
                  const weekLogged = markedCountOf(marks) >= 7
                  const showStrip = tappable && (week.dailyActivities || week.offlinePractice)

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

                      {/* Offline practice — per-day glyph chips (new model) */}
                      {showStrip && week.dailyActivities && (
                        <div style={styles.dailyWrap}>
                          <div style={styles.dailyHead}>
                            <span style={styles.offlineTag}>Daily practice</span>
                            <span style={styles.offlineProgress}>{doneCountOf(marks)}/7</span>
                          </div>
                          <div style={styles.dailyChips}>
                            {week.dailyActivities.map((act) => {
                              const m = marks[act.day]
                              const dayLocked = act.day > availableDaysInWeek(week.day)
                              return (
                                <button
                                  key={act.day}
                                  onClick={() => { if (!dayLocked) openDayCard(week, act) }}
                                  disabled={dayLocked}
                                  style={{ ...styles.dayChip, ...(dayLocked ? styles.dayChipLocked : {}) }}
                                  aria-label={`Day ${act.day}: ${act.title}`}
                                >
                                  <span style={{
                                    ...styles.dayChipRing,
                                    ...(m === 'done' ? styles.dayChipRingDone : m === 'missed' ? styles.dayChipRingMissed : {}),
                                  }}>
                                    <PracticeArchetypeIcon archetype={act.glyph} size={15} />
                                  </span>
                                  <span style={styles.dayChipNum}>{act.day}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Offline practice — single glyph marker (fallback until a week is split into days) */}
                      {showStrip && !week.dailyActivities && (
                        <button onClick={() => openOffline(week)} style={styles.offlineStrip}>
                          <span style={{ ...styles.glyphRing, ...(weekLogged ? styles.glyphRingDone : {}) }}>
                            <PracticeArchetypeIcon archetype={week.offlinePractice.archetype} size={16} />
                          </span>
                          <span style={styles.offlineBody}>
                            <span style={styles.offlineTag}>Offline practice</span>
                            <span style={styles.offlineName}>{week.offlinePractice.title}</span>
                          </span>
                          <span style={styles.offlineProgress}>{doneCountOf(marks)}/7</span>
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

        {/* Per-day floating card (new daily model) */}
        {activeDayCard && (
          <div style={styles.sheetOverlay} onClick={closeDayCard}>
            <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
              <div style={styles.sheetHandle} aria-hidden="true" />
              <span style={styles.sheetGlyph}>
                <PracticeArchetypeIcon archetype={activeDayCard.act.glyph} size={22} />
              </span>
              <p style={styles.sheetEyebrow}>Week {activeDayCard.week.day} · Day {activeDayCard.act.day}</p>
              <p style={styles.sheetTitle}>{activeDayCard.act.title}</p>
              <p style={styles.sheetAction}>{activeDayCard.act.body}</p>
              <p style={styles.sheetQ}>Did you do it today?</p>
              <div style={styles.dayMarkBtns}>
                <button
                  onClick={() => setDayCardChoice(dayCardChoice === 'done' ? null : 'done')}
                  style={{ ...styles.markBtn, ...(dayCardChoice === 'done' ? styles.markBtnDone : {}) }}
                >
                  Did it
                </button>
                <button
                  onClick={() => setDayCardChoice(dayCardChoice === 'missed' ? null : 'missed')}
                  style={{ ...styles.markBtn, ...(dayCardChoice === 'missed' ? styles.markBtnMissed : {}) }}
                >
                  Didn't
                </button>
              </div>
              <button
                onClick={saveDayCard}
                disabled={savingOffline}
                style={{ ...styles.sheetSave, ...(savingOffline ? styles.sheetSaveDisabled : {}) }}
              >
                {savingOffline ? 'Saving…' : 'Save'}
              </button>
              <button onClick={closeDayCard} style={styles.sheetCancel}>Not now</button>
            </div>
          </div>
        )}

        {/* Offline practice marking sheet — tracks the whole week */}
        {activeOffline && activeOffline.offlinePractice && (() => {
          const avail = availableDaysInWeek(activeOffline.day)
          return (
            <div style={styles.sheetOverlay} onClick={closeOffline}>
              <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
                <div style={styles.sheetHandle} aria-hidden="true" />
                <span style={styles.sheetGlyph}>
                  <PracticeArchetypeIcon archetype={activeOffline.offlinePractice.archetype} size={22} />
                </span>
                <p style={styles.sheetEyebrow}>Offline this week · Week {activeOffline.day}</p>
                <p style={styles.sheetTitle}>{activeOffline.offlinePractice.title}</p>
                <p style={styles.sheetAction}>{activeOffline.offlinePractice.action}</p>
                {activeOffline.offlinePractice.why && (
                  <div style={styles.whyBox}>
                    <p style={styles.whyText}>{activeOffline.offlinePractice.why}</p>
                  </div>
                )}

                <p style={styles.sheetQ}>Mark each day as it comes — honestly. Both answers count.</p>
                <div style={styles.dayMarks}>
                  {DAYS.map(d => {
                    const locked = d > avail
                    return (
                      <div key={d} style={{ ...styles.dayMarkRow, ...(locked ? styles.dayMarkRowLocked : {}) }}>
                        <span style={styles.dayMarkLabel}>Day {d}</span>
                        {locked ? (
                          <span style={styles.dayLockedNote}>not yet</span>
                        ) : (
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
                        )}
                      </div>
                    )
                  })}
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
          )
        })()}

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
    margin: '-1.75rem -1.25rem 0',
    background: '#EFE7D7',
    overflow: 'hidden',
  },
  heroImg: { display: 'block', width: '100%', height: 'auto' },
  heroNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2.25rem 1.5rem 0' },
  pillBtn: {
    background: 'rgba(38, 26, 16, 0.42)', WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)',
    border: '0.5px solid rgba(255, 255, 255, 0.55)', color: '#FBF7EE', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', padding: '7px 16px', borderRadius: '999px',
  },

  // 2 — Title
  frontispiece: { position: 'relative', zIndex: 1, textAlign: 'center', marginTop: '8px', padding: '0 0.5rem' },
  stageTitle: {
    fontSize: 'clamp(28px, 8vw, 34px)', fontWeight: 400, color: '#2A1F15', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', margin: '0 0 0.6rem', letterSpacing: '0.01em', lineHeight: 1.1,
  },
  progressLine: { fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', letterSpacing: '0.02em', margin: 0 },
  progressEmph: { color: '#854F0B' },

  // 3 — Testing note
  pilotNoteWrap: { textAlign: 'center', margin: '1.25rem 0 0' },
  pilotNote: { display: 'inline-block', fontSize: '11px', color: '#9C8C78', fontStyle: 'italic', fontFamily: 'Georgia, serif', background: '#F2ECE0', borderRadius: '999px', padding: '5px 14px' },

  // 4 — Continuous thread + list
  listWrap: { position: 'relative', marginTop: '1.25rem', paddingTop: '0.25rem', paddingBottom: '48px' },
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

  // Offline practice marker — glyph ring + title + weekly progress
  offlineStrip: {
    display: 'flex', alignItems: 'center', gap: '11px', width: 'calc(100% - 48px)', marginLeft: '42px', boxSizing: 'border-box',
    marginTop: '-2px', marginBottom: '10px',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F5EEDF 100%)', border: '0.5px solid #EADFCB',
    borderRadius: '14px', padding: '10px 13px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
  },
  glyphRing: {
    width: '34px', height: '34px', flexShrink: 0, borderRadius: '50%', border: '1.5px solid #C9A86A',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#854F0B', background: '#FFFDF8', lineHeight: 1,
  },
  glyphRingDone: { background: '#D9B57A', border: '1.5px solid #D9B57A', color: '#3A2A1C' },
  offlineBody: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' },
  offlineTag: { fontSize: '9.5px', color: '#A1814E', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 600, fontFamily: '-apple-system, sans-serif' },
  offlineName: { fontSize: '13px', color: '#5A4A36', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.3 },
  offlineProgress: { flexShrink: 0, fontSize: '12px', color: '#854F0B', fontFamily: 'Georgia, serif', fontWeight: 600 },

  // Per-day glyph chips (new daily model)
  dailyWrap: {
    width: 'calc(100% - 34px)', marginLeft: '30px', boxSizing: 'border-box', marginTop: '-2px', marginBottom: '12px',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F5EEDF 100%)', border: '0.5px solid #EADFCB',
    borderRadius: '14px', padding: '11px 9px 13px',
  },
  dailyHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '9px', padding: '0 2px' },
  dailyChips: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '3px', width: '100%', boxSizing: 'border-box' },
  dayChip: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 0', fontFamily: 'inherit', flex: '1 1 0', minWidth: 0, maxWidth: '13.5%' },
  dayChipLocked: { opacity: 0.32, cursor: 'not-allowed' },
  dayChipRing: {
    width: '100%', maxWidth: '32px', aspectRatio: '1 / 1', borderRadius: '50%', border: '1.5px solid #C9A86A',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#854F0B', background: '#FFFDF8', lineHeight: 1,
    boxSizing: 'border-box', flexShrink: 0, overflow: 'hidden',
  },
  dayChipRingDone: { background: '#D9B57A', border: '1.5px solid #D9B57A', color: '#3A2A1C' },
  dayChipRingMissed: { background: '#F3EAD9', border: '1.5px dashed #C2A878', color: '#A1814E' },
  dayChipNum: { fontSize: '10px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontWeight: 600 },

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
  sheetHandle: { width: '40px', height: '4px', borderRadius: '2px', background: '#D8CCB8', margin: '0 auto 14px' },
  sheetGlyph: {
    width: '44px', height: '44px', borderRadius: '50%', border: '1.5px solid #C9A86A', color: '#854F0B',
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', background: '#FFFDF8',
  },
  sheetEyebrow: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, margin: '0 0 6px', textAlign: 'center' },
  sheetTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.3, margin: '0 0 10px', textAlign: 'center' },
  sheetAction: { fontSize: '14.5px', color: '#3A2D1E', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: '0 0 12px' },
  whyBox: { background: '#F2ECE0', borderRadius: '12px', padding: '12px 14px', margin: '0 0 4px' },
  whyText: { fontSize: '12.5px', color: '#7A6A52', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: 0 },
  sheetQ: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', margin: '20px 0 11px' },
  dayMarks: { display: 'flex', flexDirection: 'column', gap: '8px' },
  dayMarkRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  dayMarkRowLocked: { opacity: 0.55 },
  dayMarkLabel: { width: '52px', flexShrink: 0, fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif' },
  dayMarkBtns: { display: 'flex', gap: '8px', flex: 1 },
  dayLockedNote: { flex: 1, fontSize: '12px', color: '#B0A088', fontStyle: 'italic', fontFamily: 'Georgia, serif', textAlign: 'right' },
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