import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { canEnterStage, isExploringPastStage } from './utils/stageAccess'
import {
  REFLECT_V2_DAYS as REFLECT_DAYS,
  REFLECT_V2_TOTAL_DAYS as REFLECT_TOTAL_DAYS,
  REFLECT_V2_PHASES as REFLECT_PHASES,
} from './data/reflectV2Content'
import { useStageBackground } from './utils/silhouettes'
import { PracticeArchetypeIcon } from './practiceArchetypeIcons'

const STATUS = {
  COMPLETED: 'completed',
  CURRENT: 'current',
  LOCKED: 'locked',
}

const STAGE_END = 'End of Reflect'


// =====================================================================
// Drawn medallions — small SVG vignettes in the day-world palette, one
// per day, so the timeline reads as a journey without any image assets.
// Pure decoration: all tap/lock/status logic is untouched around them.
// =====================================================================
const MP = { ring: '#D9B57A', ringSoft: '#E4D4B4', bg: '#F6EFE2', bark: '#82603F', barkD: '#5F4429', leaf: '#74875A', leafL: '#93A36B', gold: '#C9A85C', goldD: '#854F0B', cream: '#FDFBF6', ink: '#3A2A1C', mut: '#B8A88E' }

function MedallionArt({ day }) {
  switch (day) {
    case 1: return (<g><path d="M24 34 L24 22" stroke={MP.bark} strokeWidth="2" fill="none"/><path d="M24 26 C18 24 14 18 15 13 C21 13 25 17 24 24 M24 24 C27 18 32 15 36 16 C35 21 30 25 24 26" fill={MP.leafL}/><circle cx="24" cy="15" r="4.5" fill={MP.leaf}/></g>)
    case 2: return (<g><rect x="15" y="12" width="18" height="24" rx="2.5" fill={MP.cream} stroke={MP.gold} strokeWidth="1.4"/><path d="M19 18 H29 M19 23 H29 M19 28 H25" stroke={MP.mut} strokeWidth="1.4" strokeLinecap="round"/><path d="M15 14 C13 16 13 32 15 34" stroke={MP.bark} strokeWidth="1.6" fill="none"/></g>)
    case 3: return (<g><path d="M10 24 C15 16 33 16 38 24 C33 32 15 32 10 24 Z" fill={MP.cream} stroke={MP.bark} strokeWidth="1.5"/><circle cx="24" cy="24" r="5.5" fill={MP.leaf}/><circle cx="24" cy="24" r="2.2" fill={MP.ink}/></g>)
    case 4: return (<g><path d="M12 33 L19 20 L25 33 Z" fill={MP.leafL}/><path d="M20 33 L28 15 L36 33 Z" fill={MP.leaf}/><circle cx="31" cy="19" r="1.6" fill={MP.cream}/></g>)
    case 5: return (<g><ellipse cx="18" cy="31" rx="6" ry="2.6" fill={MP.gold}/><ellipse cx="18" cy="28" rx="6" ry="2.6" fill={MP.goldD}/><path d="M30 34 L30 24" stroke={MP.bark} strokeWidth="1.8"/><path d="M30 27 C27 25 25 22 26 19 C29 20 31 22 30 27 M30 25 C32 22 35 21 37 22 C36 25 33 26 30 25" fill={MP.leafL}/></g>)
    case 6: case 17: return (<g><rect x="12" y="16" width="24" height="16" rx="2" fill={MP.cream} stroke={MP.gold} strokeWidth="1.4"/><path d="M12 17 L24 26 L36 17" stroke={MP.gold} strokeWidth="1.4" fill="none"/><circle cx="33" cy="15" r="3" fill={MP.goldD}/></g>)
    case 7: case 14: case 19: return (<g><rect x="21" y="20" width="6" height="13" rx="1.5" fill={MP.cream} stroke={MP.gold} strokeWidth="1"/><ellipse cx="24" cy="34" rx="8" ry="2" fill={MP.goldD} opacity="0.35"/><path d="M24 12 C26.5 15.5 26 18 24 19 C22 18 21.5 15.5 24 12 Z" fill={MP.gold}/><circle cx="24" cy="16" r="4.5" fill={MP.gold} opacity="0.22"/></g>)
    case 8: return (<g><path d="M24 13 L24 33 M14 17 L34 17" stroke={MP.bark} strokeWidth="1.8"/><path d="M10 24 C10 27 18 27 18 24 L14 17 Z" fill={MP.leafL}/><path d="M30 27 C30 30 38 30 38 27 L34 17 Z" fill={MP.leaf}/><rect x="19" y="32" width="10" height="2.4" rx="1.2" fill={MP.bark}/></g>)
    case 9: return (<g><circle cx="24" cy="15" r="4" fill={MP.bark}/><path d="M24 20 C18 22 17 27 18 34 L30 34 C31 27 30 22 24 20 Z" fill={MP.leafL}/><circle cx="24" cy="26" r="2.2" fill={MP.goldD}/></g>)
    case 10: return (<g><path d="M17 34 C16 25 19 16 24 12 C29 16 32 25 31 34 Z" fill={MP.mut}/><path d="M24 12 C29 16 32 25 31 34 L24 34 Z" fill={MP.bark} opacity="0.35"/><path d="M20 24 H28" stroke={MP.cream} strokeWidth="1.8" strokeLinecap="round"/></g>)
    case 11: return (<g><path d="M24 35 L24 26 C24 21 19 19 15 15" stroke={MP.bark} strokeWidth="2.2" fill="none"/><path d="M24 26 C24 21 29 19 33 15" stroke={MP.gold} strokeWidth="2.2" fill="none"/><circle cx="33" cy="14" r="2.6" fill={MP.gold}/><circle cx="15" cy="14" r="2.2" fill={MP.mut}/></g>)
    case 12: return (<g><path d="M13 16 h22 a2 2 0 0 1 2 2 v9 a2 2 0 0 1 -2 2 H22 l-6 5 v-5 h-3 a2 2 0 0 1 -2 -2 v-9 a2 2 0 0 1 2 -2 Z" fill={MP.cream} stroke={MP.bark} strokeWidth="1.5"/><path d="M18 21 H30 M18 25 H26" stroke={MP.mut} strokeWidth="1.5" strokeLinecap="round"/></g>)
    case 13: return (<g><rect x="19" y="15" width="10" height="15" rx="2" fill={MP.cream} stroke={MP.bark} strokeWidth="1.5"/><path d="M19 15 L24 11 L29 15" stroke={MP.bark} strokeWidth="1.5" fill="none"/><path d="M24 30 L24 34" stroke={MP.bark} strokeWidth="1.5"/><circle cx="24" cy="22" r="3" fill={MP.gold}/><circle cx="24" cy="22" r="5.5" fill={MP.gold} opacity="0.2"/></g>)
    case 15: return (<g><circle cx="16" cy="19" r="4" fill={MP.leafL}/><circle cx="28" cy="15" r="3.2" fill={MP.leaf}/><circle cx="34" cy="23" r="2.8" fill={MP.mut}/><path d="M14 30 H34 M17 34 H31" stroke={MP.bark} strokeWidth="1.8" strokeLinecap="round"/></g>)
    case 16: return (<g><rect x="13" y="14" width="9" height="20" rx="2" fill={MP.cream} stroke={MP.mut} strokeWidth="1.4"/><rect x="26" y="14" width="9" height="20" rx="2" fill={MP.cream} stroke={MP.gold} strokeWidth="1.4"/><path d="M16 20 h3 M16 25 h3 M29 20 h3 M29 25 h3 M29 30 h3" stroke={MP.bark} strokeWidth="1.3" strokeLinecap="round"/></g>)
    case 18: return (<g><path d="M12 29 H36" stroke={MP.bark} strokeWidth="2"/><path d="M15 29 v-5 M20 29 v-8 M25 29 v-5 M30 29 v-8 M35 29 v-5" stroke={MP.bark} strokeWidth="1.5"/><circle cx="30" cy="17" r="2.8" fill={MP.gold}/></g>)
    case 20: return (<g><rect x="14" y="12" width="20" height="24" rx="2" fill={MP.cream} stroke={MP.gold} strokeWidth="1.6"/><circle cx="24" cy="21" r="4" fill={MP.mut}/><path d="M17 33 C19 27 29 27 31 33" fill={MP.leafL}/></g>)
    case 21: return (<g>{[13, 21, 29].map((x, i) => (<path key={x} d={`M${x} 33 v-13 a3 3 0 0 1 6 0 v13 Z`} fill={i === 1 ? MP.gold : MP.cream} stroke={i === 1 ? MP.goldD : MP.mut} strokeWidth="1.3"/>))}</g>)
    default: return (<g><path d="M24 34 L24 20" stroke={MP.bark} strokeWidth="2"/><path d="M24 24 C20 22 18 18 19 15 C23 16 25 19 24 24 M24 22 C26 19 30 17 32 18 C31 21 27 23 24 22" fill={MP.leafL}/></g>)
  }
}

// Medallion = drawn vignette in a ringed circle, with a status badge:
// gold check when done, small padlock when locked. Current day never
// renders a medallion (it renders as the Today's-work vault card).
function Medallion({ day, done, locked }) {
  return (
    <span style={{ position: 'relative', width: 40, height: 40, flex: '0 0 40px', display: 'inline-block' }}>
      <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
        <circle cx="24" cy="24" r="22" fill={MP.bg} stroke={done ? MP.ring : MP.ringSoft} strokeWidth="1.6" />
        <g opacity={locked ? 0.45 : 1}><MedallionArt day={day} /></g>
      </svg>
      {done && (
        <svg viewBox="0 0 16 16" width="15" height="15" style={{ position: 'absolute', right: -2, bottom: -1 }} aria-hidden="true">
          <circle cx="8" cy="8" r="7.5" fill={MP.goldD} />
          <path d="M4.6 8.2 L7 10.6 L11.4 5.8" stroke="#FAF7F1" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {locked && (
        <svg viewBox="0 0 16 16" width="14" height="14" style={{ position: 'absolute', right: -1, bottom: 0 }} aria-hidden="true">
          <circle cx="8" cy="8" r="7.5" fill="#EDE4D2" stroke="#D8CCB8" strokeWidth="0.8" />
          <rect x="5" y="7.2" width="6" height="4.6" rx="1" fill={MP.mut} />
          <path d="M6.2 7.2 v-1.4 a1.8 1.8 0 0 1 3.6 0 v1.4" stroke={MP.mut} strokeWidth="1.3" fill="none" />
        </svg>
      )}
    </span>
  )
}

// Week badge on the phase header — sprig / scales / doors for the three arcs.
function WeekBadge({ week }) {
  return (
    <svg viewBox="0 0 48 48" width="36" height="36" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="none" stroke={MP.ring} strokeWidth="1.4" />
      {week === 1 && <MedallionArt day={0} />}
      {week === 2 && <MedallionArt day={8} />}
      {week === 3 && <MedallionArt day={21} />}
    </svg>
  )
}

// The candle on the Today's-work vault card.
function CandleArt() {
  return (
    <svg viewBox="0 0 44 56" width="40" height="51" aria-hidden="true" style={{ flex: '0 0 40px' }}>
      <circle cx="22" cy="18" r="14" fill="#F6E8C4" opacity="0.13" />
      <circle cx="22" cy="18" r="8" fill="#F6E8C4" opacity="0.16" />
      <rect x="17" y="24" width="10" height="22" rx="2" fill="#EFE2C8" />
      <rect x="17" y="24" width="10" height="4" rx="2" fill="#E4D2AC" />
      <path d="M22 22 v-3" stroke="#5F4429" strokeWidth="1.2" />
      <path d="M22 8 C25.4 12.6 24.8 16 22 17.6 C19.2 16 18.6 12.6 22 8 Z" fill="#EFDCAF" />
      <path d="M22 11 C23.6 13.4 23.3 15.2 22 16.1 C20.7 15.2 20.4 13.4 22 11 Z" fill="#D9B57A" />
      <ellipse cx="22" cy="49" rx="13" ry="2.6" fill="#120B06" opacity="0.5" />
    </svg>
  )
}

export default function ReflectOverview() {
  const navigate = useNavigate()

  const [progress, setProgress] = useState(null)
  const [completedDays, setCompletedDays] = useState(new Set())
  const [loaded, setLoaded] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [checkins, setCheckins] = useState({})
  const [activeDay, setActiveDay] = useState(null)
  const [draft, setDraft] = useState({ didIt: null, felt: null, helpful: null, note: '' })
  // Visual-only: future weeks render collapsed with a '+ N more' toggle.
  const [expandedPhases, setExpandedPhases] = useState({})
  const heroUrl = useStageBackground('reflect')

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

      if (!canEnterStage(progressRow, 'reflect')) {
        setAccessDenied(true)
        setLoaded(true)
        return
      }

      setProgress(progressRow)

      const { data: artifacts } = await supabase
        .from('vow_artifacts')
        .select('day_number')
        .eq('user_id', user.id)
        .eq('stage', 'reflect')

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
        .eq('stage', 'reflect')
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
    if (isExploringPastStage(progress, 'reflect')) {
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
    if (isExploringPastStage(progress, 'reflect')) return true
    const status = getDayStatus(dayNum)
    return status === STATUS.COMPLETED || status === STATUS.CURRENT
  }

  const handleDayTap = (dayNum) => {
    if (!isDayTappable(dayNum)) return
    navigate(`/app/vow-path/reflect/day/${dayNum}`)
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
      stage: 'reflect',
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
            <p style={styles.headerTitle}>Reflect</p>
            <div style={{ width: '60px' }}></div>
          </div>
          <div style={styles.lockedBlock}>
            <div style={styles.lockedIcon}>⏳</div>
            <p style={styles.lockedTitle}>Not yet.</p>
            <p style={styles.lockedReason}>{`You haven't started Reflect yet. Take the Stage Check first.`}</p>
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
            <button onClick={() => navigate('/app/library/reflect')} style={styles.pillBtn}>Library</button>
          </div>
        </div>

        {/* 2 — Title + a single quiet progress line, married into the dissolve */}
        <div style={styles.frontispiece}>
          <h1 style={styles.stageTitle}>Reflect</h1>
          <p style={styles.progressLine}>
            <span style={styles.progressEmph}>{totalCompleted}</span> of {REFLECT_TOTAL_DAYS} days gathered
          </p>
        </div>

        {/* 4 — The sectioned timeline: week badges, drawn medallions, one thread */}
        <div style={styles.listWrap}>
          <div style={styles.thread} aria-hidden="true" />
          {REFLECT_PHASES.map((phase) => {
            const [start, end] = phase.dayRange
            const phaseDays = REFLECT_DAYS.filter(d => d.day >= start && d.day <= end)
            // Visual-only progressive disclosure, per the approved mockup:
            // weeks that are entirely ahead of the current day show their first
            // three exercises + a "+ N more" toggle. Day logic is untouched —
            // expanding reveals the same rows with the same handlers.
            const currentDayNum = lastCompleted + 1
            const isFuturePhase = start > currentDayNum && !isPilotOrDev
            const expanded = !!expandedPhases[phase.key]
            const visibleDays = (isFuturePhase && !expanded) ? phaseDays.slice(0, 3) : phaseDays
            const hiddenCount = phaseDays.length - visibleDays.length
            return (
              <div key={phase.key}>
                <div style={styles.phaseHeader}>
                  <span style={styles.phaseBadge}><WeekBadge week={phase.week} /></span>
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
                  const isCloseDay = /closes/i.test(day.arrivalTitle)

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
                    // Week-close days read as a rest, not an exercise —
                    // same button, same tap handler, quieter clothing. Their
                    // practice check-in ("Did you try it?" / "Noted") is
                    // preserved exactly like every other completed day.
                    const closeHasCheckin = isDone && day.practice
                    const closeCheckinDone = !!checkins[day.day]
                    return (
                      <div key={day.day} style={{ position: 'relative' }}>
                        <button
                          onClick={() => handleDayTap(day.day)}
                          disabled={!tappable}
                          style={{
                            ...styles.closeCard,
                            ...(isLocked ? styles.dayRowLocked : {}),
                            cursor: tappable ? 'pointer' : 'not-allowed',
                            paddingRight: closeHasCheckin ? '84px' : '16px',
                          }}
                        >
                          <span style={{ ...styles.closeTitle, ...(isDone ? styles.dayTitleDone : {}) }}>{day.arrivalTitle}</span>
                          {day.arrivalSubtitle && <span style={styles.closeSub}>{day.arrivalSubtitle}</span>}
                        </button>
                        {closeHasCheckin && (
                          <button
                            onClick={() => openCheckin(day)}
                            style={styles.checkinMarker}
                            aria-label={closeCheckinDone ? 'Edit your check-in' : 'Add a practice check-in'}
                          >
                            <span style={{
                              ...styles.checkinRing,
                              ...(closeCheckinDone ? styles.checkinRingDone : {}),
                            }}>
                              {day.practice?.archetype && (
                                <PracticeArchetypeIcon archetype={day.practice.archetype} size={15} />
                              )}
                            </span>
                            <span style={styles.checkinLabel}>
                              {closeCheckinDone ? 'Noted' : 'Did you try it?'}
                            </span>
                          </button>
                        )}
                      </div>
                    )
                  }

                  const hasCheckin = isDone && day.practice
                  const checkinDone = !!checkins[day.day]
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
                        <Medallion day={day.day} done={isDone} locked={isLocked} />
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
  anchor: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', marginTop: '2px' },
  anchorMark: { fontSize: '14px', color: '#D9B57A' },
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