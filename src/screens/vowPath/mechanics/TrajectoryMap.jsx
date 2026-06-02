import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export default function TrajectoryMap({ data, onSave, onComplete, existingData, saving }) {
  const { tiers, landmarks, selfNamingPrompt, selfNamingOptions } = data
  const handleFinalize = onSave || onComplete

  const [phase, setPhase] = useState('tiers')
  const [substanceFamily, setSubstanceFamily] = useState('substance')
  const [substanceLabel, setSubstanceLabel] = useState('')

  const [landmarkTiers, setLandmarkTiers] = useState(() => {
    const initial = {}
    landmarks.forEach(lm => {
      if (lm.preset !== null && lm.preset !== undefined) {
        initial[lm.id] = lm.preset
      }
    })
    return initial
  })

  const [landmarkContexts, setLandmarkContexts] = useState({})
  const [activeLandmarkIdx, setActiveLandmarkIdx] = useState(0)
  const [selfNaming, setSelfNaming] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: progress } = await supabase
        .from('vow_path_progress')
        .select('substance_family, substance_label')
        .eq('user_id', user.id)
        .maybeSingle()
      if (progress) {
        if (progress.substance_family === 'behavior') {
          const label = (progress.substance_label || '').toLowerCase()
          if (label.includes('porn')) setSubstanceFamily('behavior_porn')
          else if (label.includes('gambl')) setSubstanceFamily('behavior_gambling')
          else setSubstanceFamily('behavior_porn')
        } else {
          setSubstanceFamily('substance')
        }
        setSubstanceLabel(progress.substance_label || '')
      }
    }
    load()
  }, [])

  const activeTiers = tiers[substanceFamily] || tiers.substance

  const selectTier = (landmarkId, tierNum) => {
    setLandmarkTiers(prev => ({ ...prev, [landmarkId]: tierNum }))
  }

  const setContext = (landmarkId, text) => {
    setLandmarkContexts(prev => ({ ...prev, [landmarkId]: text }))
  }

  const allLandmarksTapped = landmarks.every(lm => landmarkTiers[lm.id] !== undefined)

  const trajectoryShape = (() => {
    const tiersInOrder = landmarks.map(lm => landmarkTiers[lm.id]).filter(t => t !== undefined)
    if (tiersInOrder.length < 2) return 'unknown'
    const first = tiersInOrder[0]
    const last = tiersInOrder[tiersInOrder.length - 1]
    const isMonoUp = tiersInOrder.every((t, i) => i === 0 || t >= tiersInOrder[i-1])
    const isMonoDown = tiersInOrder.every((t, i) => i === 0 || t <= tiersInOrder[i-1])
    const isFlat = tiersInOrder.every(t => t === tiersInOrder[0])
    if (isFlat) return 'flat_long'
    if (last > first && isMonoUp) return 'ascending'
    if (last < first && isMonoDown) return 'descending'
    if (last > first) return 'ascending_uneven'
    if (last < first) return 'descending_uneven'
    return 'inconsistent'
  })()

  const finalize = () => {
    handleFinalize({
      family: substanceFamily,
      substance_label: substanceLabel,
      landmarks: landmarks.map(lm => ({
        id: lm.id,
        tier: landmarkTiers[lm.id],
        context: landmarkContexts[lm.id] || null,
      })),
      trajectory_shape: trajectoryShape,
      self_naming: selfNaming,
    })
  }

  // ===================================================================
  // PHASE: TIERS — read the scale
  // ===================================================================
  if (phase === 'tiers') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>The scale.</h2>
        <p style={styles.subtext}>
          Seven tiers, ordered. Read each. You'll be picking which one describes you at five different points in your life.
        </p>

        <div style={styles.tierList}>
          {activeTiers.map(t => (
            <div key={t.tier} style={styles.tierCard}>
              <div style={styles.tierNum}>{t.tier}</div>
              <div style={styles.tierLabel}>{t.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('map')} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: MAP — pick tier for each landmark (one at a time, full options visible)
  // ===================================================================
  if (phase === 'map') {
    const landmark = landmarks[activeLandmarkIdx]
    const currentTier = landmarkTiers[landmark.id]

    const goToNextLandmark = () => {
      if (activeLandmarkIdx < landmarks.length - 1) {
        setActiveLandmarkIdx(activeLandmarkIdx + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (allLandmarksTapped) {
        setPhase('reveal')
      }
    }

    const goToPrevLandmark = () => {
      if (activeLandmarkIdx > 0) {
        setActiveLandmarkIdx(activeLandmarkIdx - 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    return (
      <div style={styles.container}>
        <p style={styles.progressLabel}>
          Landmark {activeLandmarkIdx + 1} of {landmarks.length}
        </p>

        <h2 style={styles.landmarkHeader}>{landmark.label}</h2>

        {!landmark.locked && (
          <p style={styles.subtext}>
            Tap the tier that describes you at this point.
          </p>
        )}

        {landmark.locked ? (
          <div style={styles.lockedCard}>
            <div style={styles.lockedTierNum}>{landmark.preset}</div>
            <div style={styles.lockedTierLabel}>
              {activeTiers[landmark.preset]?.label}
            </div>
            <p style={styles.lockedNote}>This one is set. Continue.</p>
          </div>
        ) : (
          <div style={styles.tierOptionList}>
            {activeTiers.filter(t => t.tier >= 1).map(t => {
              const selected = currentTier === t.tier
              return (
                <button
                  key={t.tier}
                  onClick={() => selectTier(landmark.id, t.tier)}
                  style={{
                    ...styles.tierOption,
                    ...(selected ? styles.tierOptionSelected : {}),
                  }}
                >
                  <div style={{
                    ...styles.tierOptionNum,
                    ...(selected ? styles.tierOptionNumSelected : {}),
                  }}>
                    {t.tier}
                  </div>
                  <div style={styles.tierOptionLabel}>{t.label}</div>
                </button>
              )
            })}
          </div>
        )}

        {landmark.allowContext && currentTier !== undefined && !landmark.locked && (
          <input
            type="text"
            value={landmarkContexts[landmark.id] || ''}
            onChange={(e) => setContext(landmark.id, e.target.value)}
            placeholder={landmark.contextPlaceholder || ''}
            style={styles.contextInput}
          />
        )}

        <div style={styles.footer}>
          {activeLandmarkIdx > 0 && (
            <button onClick={goToPrevLandmark} style={styles.secondaryBtn}>
              ‹ Previous
            </button>
          )}
          <button
            onClick={goToNextLandmark}
            disabled={currentTier === undefined}
            style={{
              ...styles.primaryBtn,
              ...(currentTier === undefined ? styles.primaryBtnDisabled : {}),
            }}
          >
            {activeLandmarkIdx === landmarks.length - 1 ? 'See the trajectory' : 'Next landmark'}
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVEAL — show the trajectory
  // ===================================================================
  if (phase === 'reveal') {
    const points = landmarks.map(lm => ({
      id: lm.id,
      label: lm.label,
      tier: landmarkTiers[lm.id],
      context: landmarkContexts[lm.id],
    }))

    const w = 320
    const h = 220
    const padL = 32
    const padR = 16
    const padT = 16
    const padB = 36
    const innerW = w - padL - padR
    const innerH = h - padT - padB
    const xStep = innerW / (points.length - 1)

    const yForTier = (t) => padT + innerH - (t / 6) * innerH
    const xForIdx = (i) => padL + i * xStep

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xForIdx(i)} ${yForTier(p.tier)}`)
      .join(' ')

    const verdict = (() => {
      if (trajectoryShape === 'ascending' || trajectoryShape === 'ascending_uneven') {
        return {
          title: 'This is your trajectory.',
          body: 'The direction is clear.',
        }
      }
      if (trajectoryShape === 'flat_long') {
        return {
          title: 'Your trajectory has been flat.',
          body: 'The pattern has been stable for as long as you can remember. Stability is information too. It means this is who you have been, consistently, across years.',
        }
      }
      if (trajectoryShape === 'descending' || trajectoryShape === 'descending_uneven') {
        return {
          title: 'Your trajectory has actually moved down.',
          body: `You've been pulling back. The Stage Check still placed you in Notice. Worth sitting with why.`,
        }
      }
      return {
        title: 'Your trajectory has moved up and down.',
        body: `You've tried to pull back at some point. It returned.`,
      }
    })()

    return (
      <div style={styles.container}>
        <h2 style={styles.revealTitle}>Your trajectory.</h2>

        <div style={styles.graphContainer}>
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            {[0, 2, 4, 6].map(t => (
              <g key={t}>
                <text
                  x={padL - 8}
                  y={yForTier(t) + 4}
                  fontSize="10"
                  fill="#9C8C78"
                  textAnchor="end"
                  fontFamily="Georgia, serif"
                >
                  {t}
                </text>
                <line
                  x1={padL}
                  x2={w - padR}
                  y1={yForTier(t)}
                  y2={yForTier(t)}
                  stroke="#E8DFD0"
                  strokeWidth="0.5"
                  strokeDasharray="2,3"
                />
              </g>
            ))}

            <path
              d={pathD}
              fill="none"
              stroke="#C5572C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {points.map((p, i) => (
              <circle
                key={p.id}
                cx={xForIdx(i)}
                cy={yForTier(p.tier)}
                r="5"
                fill="#854F0B"
                stroke="#FAF7F1"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>

        <div style={styles.pointsList}>
          {points.map(p => {
            const tierLabel = activeTiers[p.tier]?.label || `Tier ${p.tier}`
            return (
              <div key={p.id} style={styles.pointRow}>
                <p style={styles.pointLabel}>{shortLandmarkLabel(p.id)}:</p>
                <p style={styles.pointValue}>{tierLabel}</p>
              </div>
            )
          })}
        </div>

        <div style={styles.verdictBlock}>
          <p style={styles.verdictTitle}>{verdict.title}</p>
          <p style={styles.verdictBody}>{verdict.body}</p>
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('naming')} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: NAMING
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>{selfNamingPrompt}</h2>

      <div style={styles.namingList}>
        {selfNamingOptions.map(opt => {
          const selected = selfNaming === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setSelfNaming(opt.id)}
              style={{
                ...styles.namingCard,
                ...(selected ? styles.namingCardSelected : {}),
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <div style={styles.footer}>
        <button
          onClick={finalize}
          disabled={!selfNaming || saving}
          style={{
            ...styles.primaryBtn,
            ...((!selfNaming || saving) ? styles.primaryBtnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

function shortLandmarkLabel(id) {
  const map = {
    before: 'Before',
    started: 'When you started',
    five_years: 'Five years ago',
    two_years: 'Two years ago',
    today: 'Today',
  }
  return map[id] || id
}

const styles = {
  container: { paddingTop: '0.5rem' },
  prompt: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 0.5rem',
  },
  subtext: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.55, margin: '0 0 1.25rem',
  },
  progressLabel: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    margin: '0 0 0.75rem', textAlign: 'center',
  },
  landmarkHeader: {
    fontSize: '20px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 0.5rem',
    textAlign: 'center',
  },
  tierList: {
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  tierCard: {
    display: 'flex', gap: '12px',
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    alignItems: 'flex-start',
  },
  tierNum: {
    flexShrink: 0,
    width: '28px', height: '28px',
    borderRadius: '50%',
    background: '#F4ECDD',
    color: '#854F0B',
    fontSize: '13px', fontWeight: 500,
    fontFamily: 'Georgia, serif',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  tierLabel: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    paddingTop: '4px',
  },
  tierOptionList: {
    display: 'flex', flexDirection: 'column', gap: '8px',
    marginTop: '1rem',
  },
  tierOption: {
    display: 'flex', gap: '12px',
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    alignItems: 'flex-start',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  tierOptionSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  tierOptionNum: {
    flexShrink: 0,
    width: '28px', height: '28px',
    borderRadius: '50%',
    background: '#F4ECDD',
    color: '#854F0B',
    fontSize: '13px', fontWeight: 500,
    fontFamily: 'Georgia, serif',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  tierOptionNumSelected: {
    background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)',
    color: '#FAF7F1',
  },
  tierOptionLabel: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    paddingTop: '4px',
  },
  lockedCard: {
    padding: '14px',
    background: '#F4ECDD',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    textAlign: 'center',
    marginTop: '1rem',
  },
  lockedTierNum: {
    width: '36px', height: '36px',
    borderRadius: '50%',
    background: '#854F0B',
    color: '#FAF7F1',
    fontSize: '14px', fontWeight: 500,
    fontFamily: 'Georgia, serif',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 0.5rem',
  },
  lockedTierLabel: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    margin: '0 0 0.5rem',
  },
  lockedNote: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  contextInput: {
    width: '100%',
    marginTop: '14px',
    padding: '10px 12px',
    border: '0.5px solid #E0D5C2',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    background: '#FDFBF6',
    boxSizing: 'border-box',
  },
  revealTitle: {
    fontSize: '24px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 1.25rem',
    textAlign: 'center',
  },
  graphContainer: {
    display: 'flex',
    justifyContent: 'center',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '12px 0',
    marginBottom: '1rem',
  },
  pointsList: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '12px 14px',
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  pointRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  pointLabel: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    margin: 0,
    flexShrink: 0,
    minWidth: '110px',
  },
  pointValue: {
    fontSize: '12.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0,
    lineHeight: 1.45,
  },
  verdictBlock: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '14px',
    padding: '14px',
  },
  verdictTitle: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 0.5rem',
    fontWeight: 500,
  },
  verdictBody: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: 0,
  },
  namingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  namingCard: {
    padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
  },
  namingCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  footer: {
    marginTop: '1.5rem',
    display: 'flex',
    gap: '8px',
  },
  primaryBtn: {
    flex: 1,
    padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  secondaryBtn: {
    padding: '14px 18px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}