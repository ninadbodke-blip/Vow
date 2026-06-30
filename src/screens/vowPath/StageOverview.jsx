import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { canEnterStage, isExploringPastStage } from './utils/stageAccess'
import { useStageBackground } from './utils/silhouettes'
import { PracticeArchetypeIcon } from './practiceArchetypeIcons'

// =====================================================================
// StageOverview — the one shared "Sectioned Timeline" (Option 3) layout
// for every LINEAR Vow Path stage (Notice, Reflect, Commit, Endure, Build).
//
// Each stage is a thin wrapper that passes its own data:
//   <StageOverview
//     stageKey="reflect" title="Reflect"
//     phases={REFLECT_PHASES} days={REFLECT_DAYS} totalDays={21}
//     routeBase="/app/vow-path/reflect" libraryRoute="/app/library/reflect"
//     progressLabel="days gathered" stageEndLabel="End of Reflect" />
//
// All progress/cadence/exploration logic is per-stage (keyed on stageKey),
// identical to the original per-stage overviews — only the render changed.
// =====================================================================

const STATUS = { COMPLETED: 'completed', CURRENT: 'current', LOCKED: 'locked' }

function CheckGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7" stroke="#FBF7EE" strokeWidth="2.6"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="#B5A88F" strokeWidth="1.8" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#B5A88F" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function StageOverview({
  stageKey,
  title,
  phases,
  days,
  totalDays,
  routeBase,
  libraryRoute,
  progressLabel = 'days gathered',
  stageEndLabel = 'End of stage',
}) {
  const navigate = useNavigate()

  const [progress, setProgress] = useState(null)
  const [completedDays, setCompletedDays] = useState(new Set())
  const [loaded, setLoaded] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [checkins, setCheckins] = useState({})
  const [activeDay, setActiveDay] = useState(null)
  const [draft, setDraft] = useState({ didIt: null, felt: null, helpful: null, note: '' })
  const [expandedPhases, setExpandedPhases] = useState(new Set())
  const heroUrl = useStageBackground(stageKey)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/app/welcome'); return }

      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!canEnterStage(progressRow, stageKey)) {
        setAccessDenied(true)
        setLoaded(true)
        return
      }
      setProgress(progressRow)

      const { data: artifacts } = await supabase
        .from('vow_artifacts')
        .select('day_number')
        .eq('user_id', user.id)
        .eq('stage', stageKey)
      setCompletedDays(new Set(
        (artifacts || []).map(a => a.day_number).filter(d => d !== null && d !== undefined)
      ))

      const { data: checkinRows } = await supabase
        .from('practice_checkins')
        .select('day_number, did_it, felt, helpful, note')
        .eq('user_id', user.id)
        .eq('stage', stageKey)
      const checkinMap = {}
      ;(checkinRows || []).forEach(r => { checkinMap[r.day_number] = r })
      setCheckins(checkinMap)

      setLoaded(true)
    }
    load()
  }, [navigate, stageKey])

  const getDayStatus = (dayNum) => {
    if (completedDays.has(dayNum)) return STATUS.COMPLETED
    if (!progress) return STATUS.LOCKED
    let nextDay
    if (isExploringPastStage(progress, stageKey)) {
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
    if (isExploringPastStage(progress, stageKey)) return true
    const status = getDayStatus(dayNum)
    return status === STATUS.COMPLETED || status === STATUS.CURRENT
  }

  const handleDayTap = (dayNum) => {
    if (!isDayTappable(dayNum)) return
    navigate(`${routeBase}/day/${dayNum}`)
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
      stage: stageKey,
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
            <p style={styles.headerTitle}>{title}</p>
            <div style={{ width: '60px' }} />
          </div>
          <div style={styles.lockedBlock}>
            <div style={styles.lockedIcon}>⏳</div>
            <p style={styles.lockedTitle}>Not yet.</p>
            <p style={styles.lockedReason}>{`You haven't started ${title} yet. Take the Stage Check first.`}</p>
            <button onClick={() => navigate('/app/vow-path')} style={{ ...styles.primaryBtn, marginTop: '1.5rem' }}>
              Take the Stage Check
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalCompleted = completedDays.size
  const multiPhase = phases.length > 1

  // Which phase holds the active (completed/current) work? Everything up to and
  // including it expands; the one right after "peeks" (first 3); the rest collapse.
  const phaseIsActive = (phase) => {
    const [s, e] = phase.dayRange
    return days.some(d => d.day >= s && d.day <= e &&
      (getDayStatus(d.day) === STATUS.COMPLETED || getDayStatus(d.day) === STATUS.CURRENT))
  }
  let activeIdx = phases.findIndex(phaseIsActive)
  const nextIdx = activeIdx >= 0 ? activeIdx + 1 : 0

  // ---- one day row (done / current / locked) ----
  const renderDayRow = (day, indexInPhase) => {
    const status = getDayStatus(day.day)
    const tappable = isDayTappable(day.day)
    const isDone = status === STATUS.COMPLETED
    const isToday = status === STATUS.CURRENT
    const isLocked = status === STATUS.LOCKED && !tappable

    return (
      <div key={day.day} style={styles.row}>
        <div style={styles.nodeCol}>
          <span style={{
            ...styles.node,
            ...(isDone ? styles.nodeDone : isToday ? styles.nodeToday : styles.nodeLocked),
          }}>
            {day.practice?.archetype
              ? <PracticeArchetypeIcon archetype={day.practice.archetype} size={17} />
              : <span style={styles.nodeDot} />}
          </span>
        </div>

        <button
          onClick={() => handleDayTap(day.day)}
          disabled={!tappable}
          style={{ ...styles.body, cursor: tappable ? 'pointer' : 'default', opacity: isLocked ? 0.55 : 1 }}
        >
          <span style={styles.bodyTitleRow}>
            <span style={styles.dayNum}>{indexInPhase}</span>
            <span style={{ ...styles.dayTitle, ...(isDone ? styles.dayTitleDone : {}) }}>
              {day.arrivalTitle}
            </span>
          </span>
          {day.arrivalSubtitle && <span style={styles.daySub}>{day.arrivalSubtitle}</span>}
        </button>

        <div style={styles.statusCol}>
          {isDone && (
            <button
              onClick={() => day.practice && openCheckin(day)}
              style={{ ...styles.statusBtn, ...(checkins[day.day] ? styles.checkBadgeNoted : styles.checkBadge) }}
              aria-label={day.practice ? (checkins[day.day] ? 'Edit your check-in' : 'Add a practice check-in') : 'Completed'}
            >
              <CheckGlyph />
            </button>
          )}
          {isToday && <span style={styles.currentDot} aria-label="Today" />}
          {isLocked && <span style={styles.lockWrap} aria-label="Locked"><LockGlyph /></span>}
        </div>
      </div>
    )
  }

  // ---- the dark "Today's work" card, anchored at the current day ----
  const renderTodayCard = (day) => (
    <button key={`today-${day.day}`} onClick={() => handleDayTap(day.day)} style={styles.vaultCard}>
      <span style={styles.vaultEyebrow}>Today's work</span>
      <span style={styles.vaultTitle}>{day.arrivalTitle}</span>
      {day.arrivalSubtitle && <span style={styles.vaultSubtitle}>{day.arrivalSubtitle}</span>}
      <span style={styles.vaultGo}>Begin →</span>
    </button>
  )

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* Hero */}
        <div style={styles.heroWrap}>
          {heroUrl && <img src={heroUrl} alt="" style={styles.heroImg} />}
          <div style={styles.heroNav}>
            <button onClick={() => navigate('/app/vow-path')} style={styles.pillBtn}>‹ Vow Path</button>
            {libraryRoute && <button onClick={() => navigate(libraryRoute)} style={styles.pillBtn}>Library</button>}
          </div>
        </div>

        {/* Title + progress */}
        <div style={styles.frontispiece}>
          <h1 style={styles.stageTitle}>{title}</h1>
          <p style={styles.progressLine}>
            <span style={styles.progressEmph}>{totalCompleted}</span> of {totalDays} {progressLabel}
          </p>
        </div>

        {/* The sectioned timeline */}
        <div style={styles.timeline}>
          <div style={styles.spine} aria-hidden="true" />

          {phases.map((phase, i) => {
            const [start, end] = phase.dayRange
            const phaseDays = days.filter(d => d.day >= start && d.day <= end)
            const expanded = i <= activeIdx || expandedPhases.has(phase.key)
            const peeking = !expanded && i === nextIdx
            const shown = expanded ? phaseDays : peeking ? phaseDays.slice(0, 3) : []
            const hidden = phaseDays.length - shown.length
            const currentDay = phaseDays.find(d => getDayStatus(d.day) === STATUS.CURRENT)

            const firstArche = phaseDays[0]?.practice?.archetype

            return (
              <div key={phase.key} style={styles.phaseBlock}>
                {multiPhase && (
                  <div style={styles.phaseHeader}>
                    <span style={{
                      ...styles.phaseMedallion,
                      ...(i <= activeIdx ? styles.phaseMedallionActive : {}),
                    }}>
                      {firstArche
                        ? <PracticeArchetypeIcon archetype={firstArche} size={22} />
                        : <span style={styles.nodeDot} />}
                    </span>
                    <div style={styles.phaseHeaderText}>
                      <p style={styles.phaseEyebrow}>{phase.title.toUpperCase()}</p>
                      {phase.subtitle && <p style={styles.phaseSub}>{phase.subtitle}</p>}
                    </div>
                  </div>
                )}

                {shown.map((day, idx) => {
                  const row = renderDayRow(day, idx + 1)
                  // Drop the dark card in right after the current day's row.
                  if (currentDay && day.day === currentDay.day) {
                    return (
                      <div key={`wrap-${day.day}`}>
                        {row}
                        {renderTodayCard(day)}
                      </div>
                    )
                  }
                  return row
                })}

                {!expanded && hidden > 0 && (
                  <button
                    onClick={() => setExpandedPhases(prev => new Set(prev).add(phase.key))}
                    style={styles.expander}
                  >
                    + {hidden} {peeking ? 'more exercises' : 'exercises'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Anchor */}
        <div style={styles.anchor}>
          <span style={styles.anchorMark}>✧</span>
          <span style={styles.anchorText}>{stageEndLabel}</span>
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
                  <button key={val} onClick={() => setDraft(d => ({ ...d, didIt: val }))}
                    style={{ ...styles.optionBtn, ...(draft.didIt === val ? styles.optionBtnActive : {}) }}>
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
                      <button key={f} onClick={() => setDraft(d => ({ ...d, felt: f }))}
                        style={{ ...styles.chipBtn, ...(draft.felt === f ? styles.chipBtnActive : {}) }}>
                        {f}
                      </button>
                    ))}
                  </div>

                  <p style={styles.sheetQ}>Was it worth doing?</p>
                  <div style={styles.sheetOptions}>
                    {[['yes', true], ['no', false]].map(([key, bool]) => (
                      <button key={key} onClick={() => setDraft(d => ({ ...d, helpful: bool }))}
                        style={{ ...styles.optionBtn, ...(draft.helpful === bool ? styles.optionBtnActive : {}) }}>
                        {bool ? 'Yes' : 'Not really'}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <textarea value={draft.note} onChange={(e) => setDraft(d => ({ ...d, note: e.target.value }))}
                placeholder="Anything you want to remember? (optional)" style={styles.sheetNote} rows={2} />

              <button onClick={saveCheckin} disabled={!draft.didIt}
                style={{ ...styles.sheetSave, ...(!draft.didIt ? styles.sheetSaveDisabled : {}) }}>
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

const SERIF = 'Georgia, serif'
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const NODE_COL = 56
const SPINE_X = 27

const styles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem', display: 'flex', justifyContent: 'center', fontFamily: SANS,
  },
  phone: {
    width: '100%', maxWidth: '440px', background: '#FAF7F1',
    borderRadius: '28px', overflow: 'hidden', position: 'relative',
    boxShadow: '0 10px 40px rgba(58,42,28,0.10)',
  },

  // Hero
  heroWrap: { position: 'relative', width: '100%', background: '#EFE7D7' },
  heroImg: { display: 'block', width: '100%', height: 'auto' },
  heroNav: {
    position: 'absolute', top: '14px', left: '14px', right: '14px',
    display: 'flex', justifyContent: 'space-between',
  },
  pillBtn: {
    background: 'rgba(38, 26, 16, 0.82)', border: '0.5px solid rgba(255,255,255,0.55)',
    color: '#FBF7EE', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    padding: '7px 16px', borderRadius: '999px',
  },

  // Title + progress
  frontispiece: { textAlign: 'center', padding: '1.6rem 1.5rem 0.4rem' },
  stageTitle: {
    fontSize: 'clamp(28px, 8vw, 34px)', fontWeight: 400, color: '#2A1F15',
    fontFamily: SERIF, fontStyle: 'italic', margin: '0 0 0.5rem', letterSpacing: '0.01em', lineHeight: 1.1,
  },
  progressLine: {
    fontSize: '13px', color: '#9C8C78', fontFamily: SERIF, fontStyle: 'italic',
    textAlign: 'center', letterSpacing: '0.02em', margin: 0,
  },
  progressEmph: { color: '#854F0B' },

  // Timeline
  timeline: { position: 'relative', padding: '1.4rem 1.4rem 0.5rem' },
  spine: {
    position: 'absolute', top: '0.5rem', bottom: '1.5rem', left: `calc(1.4rem + ${SPINE_X}px)`,
    width: '2px', borderRadius: '2px',
    background: 'linear-gradient(180deg, rgba(217,181,122,0) 0%, rgba(217,181,122,0.55) 8%, rgba(217,181,122,0.55) 88%, rgba(217,181,122,0) 100%)',
  },
  phaseBlock: { position: 'relative' },

  // Phase header (medallion + eyebrow), left-aligned on the spine
  phaseHeader: { display: 'flex', alignItems: 'center', gap: '14px', margin: '1.9rem 0 0.9rem' },
  phaseMedallion: {
    width: '52px', height: '52px', flexShrink: 0, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#FAF7F1', border: '1.5px solid #E2D2B4', color: '#A98F63',
    marginLeft: `${(NODE_COL - 52) / 2}px`, boxShadow: '0 1px 0 rgba(217,181,122,0.25)',
  },
  phaseMedallionActive: { border: '1.5px solid #D9B57A', color: '#854F0B', background: '#FBF3E3' },
  phaseHeaderText: { display: 'flex', flexDirection: 'column', gap: '3px' },
  phaseEyebrow: {
    fontSize: '12px', fontWeight: 600, color: '#854F0B', fontFamily: SANS,
    textTransform: 'uppercase', letterSpacing: '0.18em', margin: 0,
  },
  phaseSub: { fontSize: '13px', color: '#6B5C4A', fontFamily: SERIF, fontStyle: 'italic', margin: 0, lineHeight: 1.4 },

  // Day row
  row: { display: 'flex', alignItems: 'flex-start', position: 'relative' },
  nodeCol: { width: `${NODE_COL}px`, flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: '12px' },
  node: {
    width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1,
  },
  nodeDone: { background: '#FBF3E3', border: '1.5px solid #E2C893', color: '#9A7B43' },
  nodeToday: { background: '#FBF3E3', border: '2px solid #D9B57A', color: '#854F0B', boxShadow: '0 0 0 4px rgba(217,181,122,0.16)' },
  nodeLocked: { background: '#FAF7F1', border: '1.5px solid #E6DDCC', color: '#C2B49C' },
  nodeDot: { width: '7px', height: '7px', borderRadius: '50%', background: 'currentColor', display: 'block' },

  body: {
    flex: 1, minWidth: 0, background: 'transparent', border: 'none', textAlign: 'left',
    fontFamily: 'inherit', padding: '12px 6px 12px 4px', display: 'flex', flexDirection: 'column', gap: '3px',
  },
  bodyTitleRow: { display: 'flex', alignItems: 'baseline', gap: '8px' },
  dayNum: { fontSize: '12px', fontWeight: 600, color: '#C2A875', fontFamily: SANS, flexShrink: 0, minWidth: '12px' },
  dayTitle: { fontSize: '16px', fontWeight: 500, color: '#2A1F15', fontFamily: SERIF, lineHeight: 1.3 },
  dayTitleDone: { color: '#9C8C78', fontStyle: 'italic', fontWeight: 400 },
  daySub: { fontSize: '13px', color: '#9C8C78', fontStyle: 'italic', fontFamily: SERIF, lineHeight: 1.4, paddingLeft: '20px' },

  statusCol: { width: '40px', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '20px' },
  statusBtn: {
    width: '24px', height: '24px', borderRadius: '50%', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  },
  checkBadge: { background: '#7C8A56' },
  checkBadgeNoted: { background: '#6E7B4F' },
  currentDot: { width: '14px', height: '14px', borderRadius: '50%', background: '#B8841F', boxShadow: '0 0 0 4px rgba(184,132,31,0.16)', display: 'block' },
  lockWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center' },

  // Dark "Today's work" card
  vaultCard: {
    display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', textAlign: 'left',
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    borderRadius: '18px', padding: '18px 20px', margin: '8px 0 10px',
    boxShadow: '0 6px 20px rgba(36,23,16,0.22)',
  },
  vaultEyebrow: { fontSize: '10px', color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600, fontFamily: SANS },
  vaultTitle: { fontSize: '19px', fontWeight: 500, color: '#FAF7F1', fontFamily: SERIF, fontStyle: 'italic', lineHeight: 1.3 },
  vaultSubtitle: { fontSize: '13px', color: '#CBBA98', fontStyle: 'italic', fontFamily: SERIF, lineHeight: 1.45 },
  vaultGo: { fontSize: '13px', color: '#E7C98F', fontWeight: 600, fontFamily: SANS, marginTop: '6px', letterSpacing: '0.02em' },

  // Collapsed-phase expander
  expander: {
    display: 'inline-block', marginLeft: `${NODE_COL}px`, marginTop: '4px', marginBottom: '4px',
    background: 'transparent', border: 'none', color: '#854F0B', fontSize: '13px', fontWeight: 600,
    fontFamily: SANS, cursor: 'pointer', padding: '8px 4px', letterSpacing: '0.01em',
  },

  // Anchor
  anchor: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.5rem 0 2rem' },
  anchorMark: { fontSize: '14px', color: '#D9B57A' },
  anchorText: { fontSize: '12px', color: '#9C8C78', fontStyle: 'italic', fontFamily: SERIF, letterSpacing: '0.04em' },

  // Access-denied / loading
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.25rem 0.5rem' },
  backBtn: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px', minWidth: '60px', textAlign: 'left' },
  headerTitle: { fontSize: '17px', fontWeight: 500, color: '#2A1F15', margin: 0, fontFamily: SERIF },
  lockedBlock: { textAlign: 'center', padding: '3rem 1.5rem 4rem' },
  lockedIcon: { fontSize: '40px', marginBottom: '1.25rem' },
  lockedTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: SERIF, margin: '0 0 1rem' },
  lockedReason: { fontSize: '14px', color: '#6B5C4A', fontFamily: SERIF, fontStyle: 'italic', lineHeight: 1.6, margin: 0, maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' },
  primaryBtn: {
    display: 'inline-block', padding: '12px 24px', borderRadius: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1',
    border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },

  // Check-in sheet
  sheetOverlay: { position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(40,25,15,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
  sheet: { background: '#FAF7F1', width: '100%', maxWidth: '440px', borderRadius: '24px 24px 0 0', padding: '14px 22px 28px', fontFamily: SANS },
  sheetHandle: { width: '40px', height: '4px', borderRadius: '2px', background: '#D8CCB8', margin: '0 auto 16px' },
  sheetEyebrow: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600, margin: '0 0 6px', textAlign: 'center' },
  sheetTitle: { fontSize: '19px', color: '#2A1F15', fontFamily: SERIF, fontStyle: 'italic', lineHeight: 1.3, margin: '0 0 4px', textAlign: 'center' },
  sheetQ: { fontSize: '14px', color: '#6B5C4A', fontFamily: SERIF, margin: '18px 0 9px' },
  sheetGentle: { fontSize: '13px', color: '#8A7A66', fontFamily: SERIF, fontStyle: 'italic', lineHeight: 1.5, margin: '14px 0 0', background: '#F2ECE0', padding: '12px 14px', borderRadius: '12px' },
  sheetOptions: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  optionBtn: { flex: '1 1 auto', minWidth: '88px', padding: '11px 12px', borderRadius: '12px', border: '1px solid #E0D3BC', background: '#FFFDF9', color: '#5A4A38', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  optionBtnActive: { background: '#3A2A1C', border: '1px solid #3A2A1C', color: '#FAF7F1' },
  chipBtn: { padding: '8px 14px', borderRadius: '999px', border: '1px solid #E0D3BC', background: '#FFFDF9', color: '#5A4A38', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' },
  chipBtnActive: { background: '#854F0B', border: '1px solid #854F0B', color: '#FAF7F1' },
  sheetNote: { width: '100%', marginTop: '18px', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E0D3BC', background: '#FFFDF9', color: '#2A1F15', fontSize: '14px', fontFamily: SERIF, resize: 'vertical', boxSizing: 'border-box' },
  sheetSave: { width: '100%', marginTop: '18px', padding: '14px', borderRadius: '14px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  sheetSaveDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  sheetCancel: { width: '100%', marginTop: '10px', padding: '10px', background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '13px', fontStyle: 'italic', fontFamily: SERIF, cursor: 'pointer' },
}