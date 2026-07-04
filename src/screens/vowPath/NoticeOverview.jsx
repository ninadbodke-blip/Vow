import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { canEnterStage, isExploringPastStage } from './utils/stageAccess'
import {
  NOTICE_V2_DAYS as NOTICE_DAYS,
  NOTICE_TOTAL_DAYS,
  NOTICE_PHASES,
} from './data/noticeContent'
import { useStageBackground } from './utils/silhouettes'
import { PracticeArchetypeIcon } from './practiceArchetypeIcons'
import { Medallion, WeekBadge, CandleArt } from './overviewKit'

// Drawn-medallion art per day, and a badge per phase — visual only.
const DAY_ART = { 1: 'boundary', 2: 'drift', 3: 'people', 4: 'journal', 5: 'fork' }
const PHASE_ART = { notice: 'eye' }


const STATUS = {
  COMPLETED: 'completed',
  CURRENT: 'current',
  LOCKED: 'locked',
}

// Per-stage frontispiece copy. (Template: move to stage config when extending.)
const STAGE_EPIGRAPH = 'Looking at the shape of the habit, before deciding what to do with it.'
const STAGE_END = 'End of Notice'

export default function NoticeOverview() {
  const navigate = useNavigate()

  const [progress, setProgress] = useState(null)
  const [completedDays, setCompletedDays] = useState(new Set())
  const [loaded, setLoaded] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [checkins, setCheckins] = useState({})
  const [activeDay, setActiveDay] = useState(null)
  const [draft, setDraft] = useState({ didIt: null, felt: null, helpful: null, note: '' })
  // Visual-only: future phases render collapsed with a '+ N more' toggle.
  const [expandedPhases, setExpandedPhases] = useState({})
  const heroUrl = useStageBackground('notice')

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

      if (!canEnterStage(progressRow, 'notice')) {
        setAccessDenied(true)
        setLoaded(true)
        return
      }

      setProgress(progressRow)

      const { data: artifacts } = await supabase
        .from('vow_artifacts')
        .select('day_number')
        .eq('user_id', user.id)
        .eq('stage', 'notice')

      const completed = new Set(
        (artifacts || [])
          .map(a => a.day_number)
          .filter(d => d !== null && d !== undefined)
      )
      setCompletedDays(completed)

      const { data: checkinRows } = await supabase
        .from('practice_checkins')
        .select('day_number, did_it, felt, helpful, note')
        .eq('user_id', user.id)
        .eq('stage', 'notice')
      const checkinMap = {}
      ;(checkinRows || []).forEach(r => { checkinMap[r.day_number] = r })
      setCheckins(checkinMap)

      setLoaded(true)
    }
    load()
  }, [navigate])

  const getDayStatus = (dayNum) => {
    if (completedDays.has(dayNum)) return STATUS.COMPLETED
    if (!progress) return STATUS.LOCKED
    // The "next / Today" day is the first day of THIS stage not yet completed,
    // read from this stage's own artifacts. That keeps the brown card advancing
    // even when revisiting a past stage, where last_completed_day tracks your
    // *current* stage rather than this one.
    let nextDay
    if (isExploringPastStage(progress, 'notice')) {
      nextDay = 1
      while (completedDays.has(nextDay)) nextDay++
    } else {
      nextDay = (progress.last_completed_day || 0) + 1
    }
    if (dayNum === nextDay) return STATUS.CURRENT
    return STATUS.LOCKED
  }

  const isDayTappable = (dayNum) => {
    if (import.meta.env.DEV) return true
    if (progress?.is_pilot_mode) return true
    if (isExploringPastStage(progress, 'notice')) return true
    const status = getDayStatus(dayNum)
    return status === STATUS.COMPLETED || status === STATUS.CURRENT
  }

  const handleDayTap = (dayNum) => {
    if (!isDayTappable(dayNum)) return
    navigate(`/app/vow-path/notice/day/${dayNum}`)
  }

  const openCheckin = (day) => {
    const existing = checkins[day.day]
    setDraft({
      didIt: existing?.did_it || null,
      felt: existing?.felt || null,
      helpful: existing?.helpful ?? null,
      note: existing?.note || '',
    })
    setActiveDay(day)
  }

  const saveCheckin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !activeDay) return
    const isNo = draft.didIt === 'no'
    const payload = {
      user_id: user.id,
      stage: 'notice',
      day_number: activeDay.day,
      archetype: activeDay.practice?.archetype || null,
      practice_title: activeDay.practice?.title || null,
      did_it: draft.didIt,
      felt: isNo ? null : (draft.felt || null),
      helpful: isNo ? null : draft.helpful,
      note: draft.note?.trim() || null,
      responded_at: new Date().toISOString(),
    }
    const { error } = await supabase
      .from('practice_checkins')
      .upsert(payload, { onConflict: 'user_id,stage,day_number' })
    if (!error) {
      setCheckins(prev => ({ ...prev, [activeDay.day]: payload }))
      setActiveDay(null)
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
            <p style={styles.headerTitle}>Notice</p>
            <div style={{ width: '60px' }}></div>
          </div>
          <div style={styles.lockedBlock}>
            <div style={styles.lockedIcon}>⏳</div>
            <p style={styles.lockedTitle}>Not yet.</p>
            <p style={styles.lockedReason}>{`You haven't started Notice yet. Take the Stage Check first.`}</p>
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

  const lastCompleted = progress?.last_completed_day || 0
  const totalCompleted = completedDays.size
  const isPilotOrDev = import.meta.env.DEV || progress?.is_pilot_mode

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* 1 — Hero bleed with nav pills overlaid */}
        <div style={styles.heroWrap}>
          {heroUrl && <img src={heroUrl} alt="" style={styles.heroImg} />}
          <div style={styles.heroNav}>
            <button onClick={() => navigate('/app/vow-path')} style={styles.pillBtn}>‹ Vow Path</button>
            <button onClick={() => navigate('/app/library/notice')} style={styles.pillBtn}>Library</button>
          </div>
        </div>

        {/* 2 — Title + a single quiet progress line, married into the dissolve */}
        <div style={styles.frontispiece}>
          <h1 style={styles.stageTitle}>Notice</h1>
          <p style={styles.progressLine}>
            <span style={styles.progressEmph}>{totalCompleted}</span> of {NOTICE_TOTAL_DAYS} days gathered
          </p>
        </div>

        {/* 4 — The sectioned timeline: phase badges, drawn medallions, one thread */}
        <div style={styles.listWrap}>
          <div style={styles.thread} aria-hidden="true" />
          {NOTICE_PHASES.map((phase) => {
            const [start, end] = phase.dayRange
            const phaseDays = NOTICE_DAYS.filter(d => d.day >= start && d.day <= end)
            // Visual-only progressive disclosure: phases entirely ahead of the
            // current day show their first three exercises + a "+ N more"
            // toggle. Day logic is untouched — expanding reveals the same rows
            // with the same handlers.
            const currentDayNum = lastCompleted + 1
            const isFuturePhase = start > currentDayNum && !isPilotOrDev
            const expanded = !!expandedPhases[phase.key]
            const visibleDays = (isFuturePhase && !expanded) ? phaseDays.slice(0, 3) : phaseDays
            const hiddenCount = phaseDays.length - visibleDays.length
            return (
              <div key={phase.key}>
                <div style={styles.phaseHeader}>
                  <span style={styles.phaseBadge}><WeekBadge art={PHASE_ART[phase.key] || 'sprig'} /></span>
                  <span style={styles.phaseHeadText}>
                    <p style={styles.phaseTitle}>{phase.title.toUpperCase()}</p>
                    {phase.subtitle && <p style={styles.phaseSubtitle}>{phase.subtitle}</p>}
                  </span>
                </div>

                {visibleDays.map((day) => {
                  const status = getDayStatus(day.day)
                  const tappable = isDayTappable(day.day)
                  const isToday = status === STATUS.CURRENT
                  const isDone = status === STATUS.COMPLETED
                  const isLocked = status === STATUS.LOCKED && !tappable
                  const isCloseDay = /,\s*close|\bcloses\b/i.test(day.arrivalTitle)
                  const hasCheckin = isDone && day.practice
                  const checkinDone = !!checkins[day.day]

                  if (isToday) {
                    return (
                      <button
                        key={day.day}
                        onClick={() => handleDayTap(day.day)}
                        style={styles.vaultCard}
                      >
                        <span style={styles.vaultText}>
                          <span style={styles.vaultEyebrow}>Today's work</span>
                          <span style={styles.vaultTitle}>{day.arrivalTitle}</span>
                          {day.arrivalSubtitle && (
                            <span style={styles.vaultSubtitle}>{day.arrivalSubtitle}</span>
                          )}
                        </span>
                        <CandleArt />
                      </button>
                    )
                  }

                  if (isCloseDay) {
                    // Phase-close days read as a rest, not an exercise — same
                    // button and tap handler, quieter clothing. Their practice
                    // check-in ("Did you try it?" / "Noted") is preserved.
                    return (
                      <div key={day.day} style={{ position: 'relative' }}>
                        <button
                          onClick={() => handleDayTap(day.day)}
                          disabled={!tappable}
                          style={{
                            ...styles.closeCard,
                            ...(isLocked ? styles.dayRowLocked : {}),
                            cursor: tappable ? 'pointer' : 'not-allowed',
                            paddingRight: hasCheckin ? '84px' : '16px',
                          }}
                        >
                          <span style={{ ...styles.closeTitle, ...(isDone ? styles.dayTitleDone : {}) }}>{day.arrivalTitle}</span>
                          {day.arrivalSubtitle && <span style={styles.closeSub}>{day.arrivalSubtitle}</span>}
                        </button>
                        {hasCheckin && (
                          <button
                            onClick={() => openCheckin(day)}
                            style={styles.checkinMarker}
                            aria-label={checkinDone ? 'Edit your check-in' : 'Add a practice check-in'}
                          >
                            <span style={{
                              ...styles.checkinRing,
                              ...(checkinDone ? styles.checkinRingDone : {}),
                            }}>
                              {day.practice?.archetype && (
                                <PracticeArchetypeIcon archetype={day.practice.archetype} size={15} />
                              )}
                            </span>
                            <span style={styles.checkinLabel}>
                              {checkinDone ? 'Noted' : 'Did you try it?'}
                            </span>
                          </button>
                        )}
                      </div>
                    )
                  }

                  return (
                    <div key={day.day} style={{ position: 'relative' }}>
                      <button
                        onClick={() => handleDayTap(day.day)}
                        disabled={!tappable}
                        style={{
                          ...styles.dayRow,
                          ...(isLocked ? styles.dayRowLocked : {}),
                          cursor: tappable ? 'pointer' : 'not-allowed',
                          paddingRight: hasCheckin ? '84px' : '4px',
                        }}
                      >
                        <Medallion art={DAY_ART[day.day] || 'sprig'} done={isDone} locked={isLocked} />
                        <span style={styles.dayContent}>
                          <span style={styles.dayNum}>{day.day - start + 1}</span>
                          <span style={styles.dayTexts}>
                            <span style={{
                              ...styles.dayTitle,
                              ...(isDone ? styles.dayTitleDone : {}),
                            }}>{day.arrivalTitle}</span>
                            {day.arrivalSubtitle && (
                              <span style={styles.daySubtitle}>{day.arrivalSubtitle}</span>
                            )}
                          </span>
                        </span>
                      </button>

                      {hasCheckin && (
                        <button
                          onClick={() => openCheckin(day)}
                          style={styles.checkinMarker}
                          aria-label={checkinDone ? 'Edit your check-in' : 'Add a practice check-in'}
                        >
                          <span style={{
                            ...styles.checkinRing,
                            ...(checkinDone ? styles.checkinRingDone : {}),
                          }}>
                            {day.practice?.archetype && (
                              <PracticeArchetypeIcon archetype={day.practice.archetype} size={15} />
                            )}
                          </span>
                          <span style={styles.checkinLabel}>
                            {checkinDone ? 'Noted' : 'Did you try it?'}
                          </span>
                        </button>
                      )}
                    </div>
                  )
                })}

                {hiddenCount > 0 && (
                  <button
                    style={styles.moreBtn}
                    onClick={() => setExpandedPhases(prev => ({ ...prev, [phase.key]: true }))}
                  >
                    + {hiddenCount} more {hiddenCount === 1 ? 'exercise' : 'exercises'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

                {/* 5 — The anchor */}
        <div style={styles.anchor}>
          <span style={styles.anchorMark}>✧</span>
          <span style={styles.anchorText}>{STAGE_END}</span>
        </div>

        {/* Check-in bottom sheet */}
        {activeDay && (
          <div style={styles.sheetOverlay} onClick={() => setActiveDay(null)}>
            <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
              <div style={styles.sheetHandle} aria-hidden="true" />
              <p style={styles.sheetEyebrow}>How it landed</p>
              <p style={styles.sheetTitle}>{activeDay.practice?.title}</p>

              <p style={styles.sheetQ}>Did you get to it?</p>
              <div style={styles.sheetOptions}>
                {[['yes', 'I did'], ['tried', 'I tried'], ['no', 'Not this time']].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setDraft(d => ({ ...d, didIt: val }))}
                    style={{ ...styles.optionBtn, ...(draft.didIt === val ? styles.optionBtnActive : {}) }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {draft.didIt === 'no' && (
                <p style={styles.sheetGentle}>
                  That{'\u2019'}s alright. Noticing that you didn{'\u2019'}t is its own kind of honesty {'\u2014'} the practice will keep.
                </p>
              )}

              {(draft.didIt === 'yes' || draft.didIt === 'tried') && (
                <>
                  <p style={styles.sheetQ}>How did it sit with you?</p>
                  <div style={styles.sheetOptions}>
                    {['Lighter', 'Harder than I expected', 'It surprised me', 'No different'].map(f => (
                      <button
                        key={f}
                        onClick={() => setDraft(d => ({ ...d, felt: f }))}
                        style={{ ...styles.chipBtn, ...(draft.felt === f ? styles.chipBtnActive : {}) }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <p style={styles.sheetQ}>Was it worth doing?</p>
                  <div style={styles.sheetOptions}>
                    {[['yes', true], ['no', false]].map(([key, bool]) => (
                      <button
                        key={key}
                        onClick={() => setDraft(d => ({ ...d, helpful: bool }))}
                        style={{ ...styles.optionBtn, ...(draft.helpful === bool ? styles.optionBtnActive : {}) }}
                      >
                        {bool ? 'Yes' : 'Not really'}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <textarea
                value={draft.note}
                onChange={(e) => setDraft(d => ({ ...d, note: e.target.value }))}
                placeholder="Anything you want to remember? (optional)"
                style={styles.sheetNote}
                rows={2}
              />

              <button
                onClick={saveCheckin}
                disabled={!draft.didIt}
                style={{ ...styles.sheetSave, ...(!draft.didIt ? styles.sheetSaveDisabled : {}) }}
              >
                {checkins[activeDay.day] ? 'Update' : 'Save'}
              </button>
              <button onClick={() => setActiveDay(null)} style={styles.sheetCancel}>Not now</button>
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
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '2.25rem 1.5rem 0',
  },
  pillBtn: {
    background: 'rgba(38, 26, 16, 0.82)',
    border: '0.5px solid rgba(255, 255, 255, 0.55)',
    color: '#FBF7EE', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    padding: '7px 16px', borderRadius: '999px',
  },

  // 2 — Title pulled up into the hero's dissolve
  frontispiece: {
    position: 'relative', zIndex: 1, textAlign: 'center',
    marginTop: '8px', padding: '0 0.5rem',
  },
  stageTitle: {
    fontSize: 'clamp(28px, 8vw, 34px)', fontWeight: 400, color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 0.6rem', letterSpacing: '0.01em', lineHeight: 1.1,
  },
  progressLine: {
    fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', textAlign: 'center', letterSpacing: '0.02em', margin: 0,
  },
  progressEmph: { color: '#854F0B' },
  epigraph: {
    fontSize: '15px', color: '#6B5C4A', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', lineHeight: 1.6, margin: '0 auto', maxWidth: '290px',
  },

  // 3 — One-line tally
  tally: {
    display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
    gap: '4px 10px', margin: '1.5rem 0 0',
  },
  tallyMarks: { display: 'inline-flex', gap: '7px' },
  tallyMark: { fontSize: '15px', lineHeight: 1 },
  tallyText: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4 },
  tallyEmph: { color: '#854F0B', fontStyle: 'normal', fontWeight: 500 },

  pilotNote: {
    textAlign: 'center', fontSize: '11px', color: '#854F0B',
    fontStyle: 'italic', fontFamily: 'Georgia, serif', margin: '1.5rem 0 0',
  },

  // 4 — Continuous thread + list
  listWrap: { position: 'relative', marginTop: '1.4rem', paddingTop: '0.25rem', paddingBottom: '44px' },

  // one continuous thread, aligned to the medallion centres
  thread: {
    position: 'absolute', left: '23px', top: '20px', bottom: 0, width: '1.5px',
    background: 'linear-gradient(180deg, rgba(217,181,122,0.55) 0%, rgba(217,181,122,0.55) 82%, rgba(217,181,122,0) 100%)',
  },

  phaseHeader: {
    position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center',
    gap: '13px', margin: '1.9rem 0 0.9rem', textAlign: 'left',
  },
  phaseBadge: {
    flex: '0 0 40px', width: '40px', height: '40px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', background: '#FAF7F1',
    borderRadius: '50%', marginLeft: '4px',
  },
  phaseHeadText: { display: 'flex', flexDirection: 'column', gap: '2px' },
  phaseTitle: {
    fontSize: '12px', fontWeight: 600, color: '#854F0B',
    fontFamily: '-apple-system, sans-serif', textTransform: 'uppercase',
    letterSpacing: '0.18em', margin: 0,
  },
  phaseSubtitle: { fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.4 },

  dayRow: {
    position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center',
    gap: '12px', width: '100%', background: 'transparent', border: 'none',
    textAlign: 'left', padding: '10px 4px', fontFamily: 'inherit',
  },
  dayRowLocked: { opacity: 0.38 },
  dayContent: { flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: '9px' },
  dayNum: {
    flex: '0 0 auto', fontSize: '13px', color: '#B8A88E',
    fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums',
  },
  dayTexts: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' },
  dayTitle: { fontSize: '15.5px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.35 },
  dayTitleDone: { color: '#9C8C78', fontStyle: 'italic', fontWeight: 400 },
  daySubtitle: { fontSize: '12.5px', color: '#9C8C78', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.4 },

  // Today's work — the dark vault card, now with the drawn candle
  vaultCard: {
    position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center',
    gap: '14px', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    borderRadius: '18px', padding: '18px 20px', margin: '10px 0',
    boxShadow: '0 10px 24px -12px rgba(40,25,10,0.5)',
  },
  vaultText: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px' },
  vaultEyebrow: {
    fontSize: '10px', fontWeight: 600, color: '#D9B57A', textTransform: 'uppercase',
    letterSpacing: '0.2em', fontFamily: '-apple-system, sans-serif',
  },
  vaultTitle: { fontSize: '19px', fontWeight: 500, color: '#FAF7F1', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.3 },
  vaultSubtitle: { fontSize: '13px', color: '#CBBA98', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.45 },

  // week-close days — a rest, not an exercise
  closeCard: {
    position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '4px', width: '100%', border: '0.5px solid #EBDFC9',
    background: '#FBF7EE', borderRadius: '14px', padding: '14px 16px',
    margin: '8px 0', fontFamily: 'inherit', textAlign: 'center',
  },
  closeTitle: { fontSize: '15px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.35 },
  closeSub: { fontSize: '12.5px', color: '#9C8C78', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.4 },

  // "+ N more exercises" toggle for weeks still ahead
  moreBtn: {
    position: 'relative', zIndex: 1, display: 'block', background: 'transparent',
    border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    fontSize: '13px', color: '#854F0B', padding: '6px 4px 6px 56px', textAlign: 'left',
  },

  checkinMarker: {
    position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
    background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px',
    zIndex: 2, fontFamily: 'inherit', width: '76px',
  },
  checkinRing: {
    width: '30px', height: '30px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', background: '#FDFBF6',
    border: '1.5px solid #D8CCB8', color: '#9C8C78',
  },
  checkinRingDone: { background: '#D9B57A', border: '1.5px solid #D9B57A', color: '#3A2A1C', fontWeight: 700 },
  checkinLabel: {
    fontSize: '9.5px', color: '#9C8C78', fontFamily: '-apple-system, sans-serif',
    letterSpacing: '0.02em', whiteSpace: 'nowrap',
  },

  sheetOverlay: {
    position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(40,25,15,0.55)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  },
  sheet: {
    background: '#FAF7F1', width: '100%', maxWidth: '440px',
    borderRadius: '24px 24px 0 0', padding: '14px 22px 28px',
    boxShadow: '0 -10px 40px rgba(40,25,10,0.25)', maxHeight: '88vh', overflowY: 'auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  sheetHandle: { width: '40px', height: '4px', borderRadius: '2px', background: '#D8CCB8', margin: '0 auto 16px' },
  sheetEyebrow: {
    fontSize: '11px', color: '#854F0B', textTransform: 'uppercase',
    letterSpacing: '0.2em', fontWeight: 600, margin: '0 0 6px', textAlign: 'center',
  },
  sheetTitle: {
    fontSize: '19px', color: '#2A1F15', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', lineHeight: 1.3, margin: '0 0 4px', textAlign: 'center',
  },
  sheetQ: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', margin: '18px 0 9px' },
  sheetGentle: {
    fontSize: '13px', color: '#8A7A66', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.5, margin: '14px 0 0', background: '#F2ECE0', padding: '12px 14px', borderRadius: '12px',
  },
  sheetOptions: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  optionBtn: {
    flex: '1 1 auto', minWidth: '88px', padding: '11px 12px', borderRadius: '12px',
    border: '1px solid #E0D3BC', background: '#FFFDF9', color: '#5A4A38',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  optionBtnActive: { background: '#3A2A1C', border: '1px solid #3A2A1C', color: '#FAF7F1' },
  chipBtn: {
    padding: '8px 14px', borderRadius: '999px', border: '1px solid #E0D3BC',
    background: '#FFFDF9', color: '#5A4A38', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
  },
  chipBtnActive: { background: '#854F0B', border: '1px solid #854F0B', color: '#FAF7F1' },
  sheetNote: {
    width: '100%', marginTop: '18px', padding: '12px 14px', borderRadius: '12px',
    border: '1px solid #E0D3BC', background: '#FFFDF9', color: '#2A1F15',
    fontSize: '14px', fontFamily: 'Georgia, serif', resize: 'vertical', boxSizing: 'border-box',
  },
  sheetSave: {
    width: '100%', marginTop: '18px', padding: '14px', borderRadius: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1',
    border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  sheetSaveDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  sheetCancel: {
    width: '100%', marginTop: '10px', padding: '10px', background: 'transparent',
    border: 'none', color: '#9C8C78', fontSize: '13px', fontStyle: 'italic',
    fontFamily: 'Georgia, serif', cursor: 'pointer',
  },

  // 5 — Anchor
  anchor: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', marginTop: '2px' },  anchorMark: { fontSize: '14px', color: '#D9B57A' },
  anchorText: { fontSize: '12px', color: '#9C8C78', fontStyle: 'italic', fontFamily: 'Georgia, serif', letterSpacing: '0.04em' },

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