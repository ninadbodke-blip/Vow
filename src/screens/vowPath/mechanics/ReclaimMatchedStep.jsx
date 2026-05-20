import { useState, useRef, useEffect } from 'react'

const STAGES = [
  {
    key: 'notice',
    label: 'Notice',
    desc: 'Watching the patterns. Light reading. No commitments yet. Useful if your reason for stopping has gone unclear.',
    arcX: 50, arcY: 70,
  },
  {
    key: 'reflect',
    label: 'Reflect',
    desc: 'Sitting with whether this matters to you. Quiet. Useful if you\'re ambivalent about the work right now.',
    arcX: 125, arcY: 52,
  },
  {
    key: 'commit',
    label: 'Commit',
    desc: 'Building the infrastructure for stopping. Active. Useful if practices and anchors have gone slack.',
    arcX: 200, arcY: 46,
  },
  {
    key: 'endure',
    label: 'Endure',
    desc: 'Day 1 again. Loud and clear. Useful if you\'re in active urge state or recent active use.',
    arcX: 275, arcY: 52,
  },
  {
    key: 'build',
    label: 'Build',
    desc: 'Weekly entries on identity and practice. Maintenance. Useful if the slip felt isolated and most of what you\'d built is still in place.',
    arcX: 350, arcY: 70,
  },
]

const PLACEMENT_VIEW_W = 400
const PLACEMENT_VIEW_H = 170
const ZONE_R = 28
const SNAP_TOLERANCE = ZONE_R + 8
const MARKER_START = { x: 200, y: 145 }

const STEP_VIEW_W = 320
const STEP_VIEW_H = 420
const HANDLE_START_Y = 380
const HANDLE_END_Y = 40
const HANDLE_FAST_VELOCITY = 1.2

export default function ReclaimMatchedStep({
  existingData,
  saving,
  stageProgress = {},
  onCompleteAndTransition,
  rationale = [],
}) {
  const hasExisting = !!(existingData?.placement?.chosen_stage && existingData?.step_in?.route_fired_to)

  const [subStage, setSubStage] = useState(hasExisting ? 'review' : 'placement')
  const [chosenStage, setChosenStage] = useState(null)
  const [explored, setExplored] = useState(new Set())
  const [panelStage, setPanelStage] = useState(null)
  const [markerPos, setMarkerPos] = useState(MARKER_START)
  const [isDraggingMarker, setIsDraggingMarker] = useState(false)
  const placementSvgRef = useRef(null)

  const [handleY, setHandleY] = useState(HANDLE_START_Y)
  const [isDraggingHandle, setIsDraggingHandle] = useState(false)
  const [showSlower, setShowSlower] = useState(false)
  const [pauseCount, setPauseCount] = useState(0)
  const [stepInComplete, setStepInComplete] = useState(false)
  const stepSvgRef = useRef(null)
  const lastMoveRef = useRef({ y: HANDLE_START_Y, t: Date.now() })
  const stepStartTimeRef = useRef(null)

  const [pendingArtifact, setPendingArtifact] = useState(null)

  const startTimeRef = useRef(Date.now())
  const slowerTimerRef = useRef(null)

  // ===== PLACEMENT HANDLERS =====

  const placementToSvg = (clientX, clientY) => {
    const rect = placementSvgRef.current.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * PLACEMENT_VIEW_W,
      y: ((clientY - rect.top) / rect.height) * PLACEMENT_VIEW_H,
    }
  }

  const handleZoneTap = (stageKey, e) => {
    e.stopPropagation()
    setPanelStage(stageKey)
    setExplored(prev => new Set(prev).add(stageKey))
  }

  const handleMarkerPointerDown = (e) => {
    e.stopPropagation()
    if (!placementSvgRef.current) return
    setIsDraggingMarker(true)
    try { placementSvgRef.current.setPointerCapture(e.pointerId) } catch {}
  }

  const handlePlacementPointerMove = (e) => {
    if (!isDraggingMarker) return
    const { x, y } = placementToSvg(e.clientX, e.clientY)
    const clampedX = Math.max(10, Math.min(PLACEMENT_VIEW_W - 10, x))
    const clampedY = Math.max(10, Math.min(PLACEMENT_VIEW_H - 10, y))
    setMarkerPos({ x: clampedX, y: clampedY })
  }

  const handlePlacementPointerUp = (e) => {
    if (!isDraggingMarker) return
    setIsDraggingMarker(false)
    try { if (placementSvgRef.current) placementSvgRef.current.releasePointerCapture(e.pointerId) } catch {}

    let bestStage = null
    let bestDist = Infinity
    for (const s of STAGES) {
      const dx = markerPos.x - s.arcX
      const dy = markerPos.y - s.arcY
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < SNAP_TOLERANCE && d < bestDist) {
        bestDist = d
        bestStage = s
      }
    }

    if (bestStage) {
      setMarkerPos({ x: bestStage.arcX, y: bestStage.arcY })
      setChosenStage(bestStage.key)
      setTimeout(() => {
        setSubStage('step_in')
        setHandleY(HANDLE_START_Y)
        lastMoveRef.current = { y: HANDLE_START_Y, t: Date.now() }
      }, 1000)
    }
  }

  // ===== STEP-IN HANDLERS =====

  const stepToSvg = (clientX, clientY) => {
    const rect = stepSvgRef.current.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * STEP_VIEW_W,
      y: ((clientY - rect.top) / rect.height) * STEP_VIEW_H,
    }
  }

  const handleHandlePointerDown = (e) => {
    if (stepInComplete) return
    if (!stepSvgRef.current) return
    const { y } = stepToSvg(e.clientX, e.clientY)
    if (Math.abs(y - handleY) > 60) return
    setIsDraggingHandle(true)
    if (!stepStartTimeRef.current) stepStartTimeRef.current = Date.now()
    lastMoveRef.current = { y, t: Date.now() }
    try { stepSvgRef.current.setPointerCapture(e.pointerId) } catch {}
  }

  const handleStepPointerMove = (e) => {
    if (!isDraggingHandle || stepInComplete) return
    const { y } = stepToSvg(e.clientX, e.clientY)
    const newY = Math.max(HANDLE_END_Y, Math.min(HANDLE_START_Y, y))

    const now = Date.now()
    const dt = now - lastMoveRef.current.t
    const dy = lastMoveRef.current.y - y
    if (dt > 0 && dy > 0) {
      const v = dy / dt
      if (v > HANDLE_FAST_VELOCITY) {
        if (!showSlower) {
          setShowSlower(true)
          if (slowerTimerRef.current) clearTimeout(slowerTimerRef.current)
          slowerTimerRef.current = setTimeout(() => setShowSlower(false), 1800)
        }
      }
    }

    setHandleY(newY)
    lastMoveRef.current = { y, t: now }

    if (newY <= HANDLE_END_Y + 5) {
      triggerStepIn()
    }
  }

  const handleStepPointerUp = (e) => {
    if (!isDraggingHandle) return
    setIsDraggingHandle(false)
    if (!stepInComplete && handleY > HANDLE_END_Y + 10) {
      setPauseCount(p => p + 1)
    }
    try { if (stepSvgRef.current) stepSvgRef.current.releasePointerCapture(e.pointerId) } catch {}
  }

  const triggerStepIn = () => {
    if (stepInComplete) return
    setStepInComplete(true)

    const artifactData = {
      placement: {
        stages_explored: [...explored],
        chosen_stage: chosenStage,
      },
      step_in: {
        step_duration_ms: stepStartTimeRef.current ? Date.now() - stepStartTimeRef.current : 0,
        pause_count: pauseCount,
        route_fired_to: chosenStage,
        timestamp_step_complete: new Date().toISOString(),
      },
      timestamp_started: new Date(startTimeRef.current).toISOString(),
      timestamp_completed: new Date().toISOString(),
      total_duration_ms: Date.now() - startTimeRef.current,
    }

    setPendingArtifact(artifactData)

    // After a brief pause to let the "Stepping into [Stage]..." moment register,
    // advance to the rationale screen.
    setTimeout(() => {
      setSubStage('rationale')
    }, 1200)
  }

  const handleFinalStepIn = () => {
    if (!pendingArtifact) return
    onCompleteAndTransition(chosenStage, pendingArtifact)
  }

  useEffect(() => () => {
    if (slowerTimerRef.current) clearTimeout(slowerTimerRef.current)
  }, [])

  const handleBackToPlacement = () => {
    setSubStage('placement')
    setChosenStage(null)
    setMarkerPos(MARKER_START)
    setHandleY(HANDLE_START_Y)
    setStepInComplete(false)
    setPendingArtifact(null)
  }

  // ===== RENDER =====

  if (subStage === 'review') {
    return (
      <div style={styles.container}>
        <div style={styles.reviewBox}>
          <p style={styles.reviewLabel}>Day 5 · Completed</p>
          <p style={styles.reviewBody}>
            You stepped back in at {existingData.placement.chosen_stage}.
          </p>
        </div>
        <p style={styles.note}>
          Reclaim is closed. Use the back button to return to the overview.
        </p>
      </div>
    )
  }

  if (subStage === 'rationale') {
    const chosen = STAGES.find(s => s.key === chosenStage)
    return (
      <div style={styles.container}>
        <div style={styles.rationaleHeader}>
          <div style={styles.savedIcon}>✓</div>
          <p style={styles.savedLabel}>Threshold crossed</p>
        </div>

        <p style={styles.rationaleHero}>
          Stepping into {chosen?.label}.
        </p>

        <div style={styles.divider}></div>

        <p style={styles.rationaleEyebrow}>Why we did this</p>

        <div style={styles.rationaleBlock}>
          {rationale.map((para, i) => (
            <p key={i} style={styles.rationalePara}>{para}</p>
          ))}
        </div>

        <button
          onClick={handleFinalStepIn}
          disabled={saving}
          style={{
            ...styles.primaryBtn,
            ...(saving ? styles.btnDisabled : {}),
          }}
        >
          {saving ? 'Stepping in...' : `Step into ${chosen?.label}`}
        </button>
      </div>
    )
  }

  if (subStage === 'placement') {
    const chosen = STAGES.find(s => s.key === chosenStage)
    const panel = STAGES.find(s => s.key === panelStage)
    const progressForPanel = panelStage && stageProgress[panelStage]
      ? stageProgress[panelStage].length
      : 0

    return (
      <div style={styles.container}>
        <p style={styles.stepLabel}>Act 1 · Place yourself</p>

        <svg
          ref={placementSvgRef}
          viewBox={`0 0 ${PLACEMENT_VIEW_W} ${PLACEMENT_VIEW_H}`}
          style={styles.placementSvg}
          onPointerMove={handlePlacementPointerMove}
          onPointerUp={handlePlacementPointerUp}
          onPointerCancel={handlePlacementPointerUp}
        >
          <path
            d={`M ${STAGES[0].arcX} ${STAGES[0].arcY} Q ${PLACEMENT_VIEW_W / 2} ${STAGES[2].arcY - 8} ${STAGES[4].arcX} ${STAGES[4].arcY}`}
            fill="none"
            stroke="#EFE7D7"
            strokeWidth="1"
          />

          {STAGES.map(s => {
            const isChosen = chosenStage === s.key
            const isPanel = panelStage === s.key
            return (
              <g
                key={s.key}
                onClick={(e) => handleZoneTap(s.key, e)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={s.arcX}
                  cy={s.arcY}
                  r={ZONE_R}
                  fill={isChosen ? '#C5572C' : '#FDF1E4'}
                  stroke={isPanel || isChosen ? '#854F0B' : '#E0CDB3'}
                  strokeWidth={isPanel ? '1.5' : '0.5'}
                  opacity={chosenStage && !isChosen ? 0.35 : 1}
                />
                <text
                  x={s.arcX}
                  y={s.arcY + 4}
                  textAnchor="middle"
                  fontFamily="Georgia, serif"
                  fontStyle="italic"
                  fontSize="11"
                  fontWeight="500"
                  fill={isChosen ? '#FAF7F1' : '#2A1F15'}
                  style={{ pointerEvents: 'none' }}
                >
                  {s.label}
                </text>
              </g>
            )
          })}

          {!chosenStage && (
            <g
              onPointerDown={handleMarkerPointerDown}
              style={{ cursor: 'grab', touchAction: 'none' }}
            >
              <circle
                cx={markerPos.x}
                cy={markerPos.y}
                r="10"
                fill="#C5572C"
                stroke="#FAF7F1"
                strokeWidth="2"
              />
              <text
                x={markerPos.x}
                y={markerPos.y + 24}
                textAnchor="middle"
                fontFamily="Georgia, serif"
                fontStyle="italic"
                fontSize="10"
                fill="#854F0B"
                style={{ pointerEvents: 'none' }}
              >
                me
              </text>
            </g>
          )}
        </svg>

        {panel && !chosenStage && (
          <div style={styles.panel}>
            <p style={styles.panelLabel}>{panel.label}</p>
            <p style={styles.panelDesc}>{panel.desc}</p>
            {progressForPanel > 0 && (
              <p style={styles.panelMeta}>
                You've completed {progressForPanel} day{progressForPanel > 1 ? 's' : ''} of {panel.label} before. Choosing it now starts fresh from Day 1.
              </p>
            )}
            <button
              onClick={() => setPanelStage(null)}
              style={styles.panelClose}
            >
              Close
            </button>
          </div>
        )}

        {!panel && !chosenStage && (
          <p style={styles.instruction}>
            Tap each stage to feel its first days. Then drag the marker onto the one that fits.
          </p>
        )}

        {chosen && (
          <p style={styles.instruction}>
            {chosen.label}. Get ready to step in.
          </p>
        )}
      </div>
    )
  }

  // step_in
  const chosen = STAGES.find(s => s.key === chosenStage)

  return (
    <div style={styles.container}>
      <p style={styles.stepLabel}>Act 2 · Step in</p>

      <button onClick={handleBackToPlacement} style={styles.backLink}>
        ‹ Choose again
      </button>

      <svg
        ref={stepSvgRef}
        viewBox={`0 0 ${STEP_VIEW_W} ${STEP_VIEW_H}`}
        style={styles.stepSvg}
        onPointerMove={handleStepPointerMove}
        onPointerUp={handleStepPointerUp}
        onPointerCancel={handleStepPointerUp}
      >
        <text
          x={STEP_VIEW_W / 2}
          y={30}
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize={20 + (1 - (handleY - HANDLE_END_Y) / (HANDLE_START_Y - HANDLE_END_Y)) * 8}
          fill="#2A1F15"
          opacity={0.5 + (1 - (handleY - HANDLE_END_Y) / (HANDLE_START_Y - HANDLE_END_Y)) * 0.5}
          style={{ pointerEvents: 'none', transition: 'all 0.2s' }}
        >
          {chosen?.label}
        </text>

        <line
          x1={STEP_VIEW_W / 2}
          y1={HANDLE_END_Y + 10}
          x2={STEP_VIEW_W / 2}
          y2={HANDLE_START_Y}
          stroke="#EFE7D7"
          strokeWidth="1"
          strokeDasharray="3 4"
        />

        <g
          onPointerDown={handleHandlePointerDown}
          style={{ cursor: 'grab', touchAction: 'none' }}
        >
          <circle cx={STEP_VIEW_W / 2} cy={handleY} r="22" fill="rgba(197,87,44,0.15)" />
          <circle cx={STEP_VIEW_W / 2} cy={handleY} r="14" fill="#C5572C" stroke="#FAF7F1" strokeWidth="2" />
          <text
            x={STEP_VIEW_W / 2}
            y={handleY + 4}
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontStyle="italic"
            fontSize="10"
            fill="#FAF7F1"
            style={{ pointerEvents: 'none' }}
          >
            ↑
          </text>
        </g>

        {showSlower && (
          <text
            x={STEP_VIEW_W / 2}
            y={STEP_VIEW_H - 20}
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontStyle="italic"
            fontSize="12"
            fill="#854F0B"
            opacity="0.85"
            style={{ pointerEvents: 'none' }}
          >
            Slower. This is the threshold.
          </text>
        )}
      </svg>

      <p style={styles.instruction}>
        {stepInComplete
          ? `Stepping into ${chosen?.label}...`
          : 'One slow gesture to step in. Drag the handle upward, slowly.'}
      </p>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    alignItems: 'center',
    paddingBottom: '1rem',
    width: '100%',
  },
  stepLabel: {
    fontSize: '10px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.18em',
    fontWeight: 500, margin: '0 0 0.25rem',
    alignSelf: 'flex-start',
  },
  backLink: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '13px', cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    alignSelf: 'flex-start', padding: '4px 0',
  },
  placementSvg: {
    width: '100%', maxWidth: '380px',
    aspectRatio: `${PLACEMENT_VIEW_W} / ${PLACEMENT_VIEW_H}`,
    background: '#FDFBF6', borderRadius: '20px',
    border: '0.5px solid #EFE7D7',
    touchAction: 'none', userSelect: 'none',
  },
  stepSvg: {
    width: '100%', maxWidth: '320px',
    aspectRatio: `${STEP_VIEW_W} / ${STEP_VIEW_H}`,
    background: '#FDFBF6', borderRadius: '20px',
    border: '0.5px solid #EFE7D7',
    touchAction: 'none', userSelect: 'none',
  },
  instruction: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textAlign: 'center', margin: 0, lineHeight: 1.5,
    maxWidth: '320px', minHeight: '40px',
  },
  panel: {
    width: '100%', background: '#FDFBF6',
    border: '0.5px solid #EFE7D7', borderRadius: '14px',
    padding: '1.1rem 1rem', textAlign: 'center',
  },
  panelLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.18em',
    fontWeight: 500, margin: '0 0 0.5rem',
  },
  panelDesc: {
    fontSize: '14px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', lineHeight: 1.55, margin: 0,
  },
  panelMeta: {
    fontSize: '12px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.5, margin: '0.75rem 0 0',
  },
  panelClose: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '12px', cursor: 'pointer',
    marginTop: '0.85rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  reviewBox: {
    background: '#FDFBF6', border: '0.5px solid #EFE7D7',
    borderRadius: '16px', padding: '1.5rem 1.25rem',
    textAlign: 'center', width: '100%',
  },
  reviewLabel: {
    fontSize: '10px', color: '#3B6D11',
    textTransform: 'uppercase', letterSpacing: '0.18em',
    fontWeight: 500, margin: '0 0 1rem',
  },
  reviewBody: {
    fontSize: '15px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.6, margin: 0,
  },
  note: {
    fontSize: '13px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textAlign: 'center', margin: 0,
  },
  rationaleHeader: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center',
    marginTop: '0.5rem',
  },
  savedIcon: {
    width: '48px', height: '48px', borderRadius: '50%',
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '0.5px solid #C2D49A', color: '#3B6D11',
    fontSize: '22px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: '0.5rem', fontWeight: 500,
  },
  savedLabel: {
    fontSize: '11px', color: '#3B6D11',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textTransform: 'uppercase', letterSpacing: '0.18em',
    fontWeight: 500, margin: 0,
  },
  rationaleHero: {
    fontSize: '22px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.4, margin: '0.75rem auto 0',
    textAlign: 'center', maxWidth: '320px',
  },
  divider: {
    height: '0.5px', background: '#E8DFD0',
    width: '50%', margin: '1.5rem auto 1rem',
  },
  rationaleEyebrow: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.18em',
    fontWeight: 500, margin: '0 0 1rem',
    textAlign: 'center',
  },
  rationaleBlock: {
    padding: '0 0.25rem', width: '100%',
  },
  rationalePara: {
    fontSize: '14.5px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.75, margin: '0 0 1.1rem',
  },
  primaryBtn: {
    width: '100%', padding: '16px', marginTop: '0.5rem',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  btnDisabled: {
    opacity: 0.5, cursor: 'not-allowed',
  },
}