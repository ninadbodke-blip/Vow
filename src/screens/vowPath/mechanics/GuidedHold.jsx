import { useState, useEffect, useRef } from 'react'

export default function GuidedHold({ data, onSave, saving }) {
  const {
    holdHeader,
    holdSubtext,
    holdDuration = 10,
    holdCompleteTitle,
    holdCompleteSubtext,
    mapHeader,
    mapSubtext,
    mapCategories,
    nowLabel = 'Already noticing',
    worriedLabel = 'Worried about',
  } = data

  // Phases: 'hold' -> 'hold_complete' -> 'map' -> 'review'
  const [phase, setPhase] = useState('hold')

  // Hold state
  const [isHolding, setIsHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0) // 0-1
  const [holdSecondsLeft, setHoldSecondsLeft] = useState(holdDuration)
  const holdStartTime = useRef(null)
  const holdRafId = useRef(null)

  // Map state — Sets of IDs
  const [noticingNow, setNoticingNow] = useState(new Set())
  const [worriedAbout, setWorriedAbout] = useState(new Set())

  // ---- Hold logic ----

  const beginHold = () => {
    setIsHolding(true)
    holdStartTime.current = performance.now()
    tickHold()
  }

  const tickHold = () => {
    if (holdStartTime.current === null) return
    const now = performance.now()
    const elapsed = (now - holdStartTime.current) / 1000
    const progress = Math.min(elapsed / holdDuration, 1)
    const secondsLeft = Math.max(0, Math.ceil(holdDuration - elapsed))
    setHoldProgress(progress)
    setHoldSecondsLeft(secondsLeft)

    if (progress >= 1) {
      setIsHolding(false)
      holdStartTime.current = null
      setPhase('hold_complete')
    } else {
      holdRafId.current = requestAnimationFrame(tickHold)
    }
  }

  const releaseHold = () => {
    if (holdProgress >= 1) return // Hold completed, don't reset
    setIsHolding(false)
    holdStartTime.current = null
    if (holdRafId.current) {
      cancelAnimationFrame(holdRafId.current)
      holdRafId.current = null
    }
    setHoldProgress(0)
    setHoldSecondsLeft(holdDuration)
  }

  useEffect(() => {
    return () => {
      if (holdRafId.current) cancelAnimationFrame(holdRafId.current)
    }
  }, [])

  // ---- Map logic ----

  const toggleNoticing = (id) => {
    setNoticingNow(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleWorried = (id) => {
    setWorriedAbout(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalTaps = noticingNow.size + worriedAbout.size

  // ---- Finalize ----

  const finalize = () => {
    onSave({
      day_zero_marked_at: new Date().toISOString(),
      noticing_now: Array.from(noticingNow),
      worried_about: Array.from(worriedAbout),
      total_taps: totalTaps,
    })
  }

  // ===================================================================
  // PHASE: HOLD
  // ===================================================================
  if (phase === 'hold') {
    const ringSize = 200
    const strokeWidth = 4
    const radius = (ringSize - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference * (1 - holdProgress)

    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{holdHeader}</h2>
        <p style={styles.subtext}>{holdSubtext}</p>

        <div style={styles.holdRingContainer}>
          <button
            onMouseDown={beginHold}
            onMouseUp={releaseHold}
            onMouseLeave={releaseHold}
            onTouchStart={(e) => { e.preventDefault(); beginHold() }}
            onTouchEnd={releaseHold}
            onTouchCancel={releaseHold}
            style={{
              ...styles.holdRing,
              ...(isHolding ? styles.holdRingActive : {}),
            }}
            aria-label="Hold to mark Day Zero"
          >
            <svg width={ringSize} height={ringSize} style={styles.holdSvg}>
              {/* Background circle */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke="#E0D5C2"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke="#C5572C"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                style={{ transition: isHolding ? 'none' : 'stroke-dashoffset 0.3s ease' }}
              />
            </svg>
            <div style={styles.holdCenter}>
              {isHolding ? (
                <span style={styles.holdNumber}>{holdSecondsLeft}</span>
              ) : (
                <span style={styles.holdInstruction}>Press<br />and hold</span>
              )}
            </div>
          </button>
        </div>

        {isHolding && (
          <p style={styles.holdActiveNote}>Keep holding...</p>
        )}
      </div>
    )
  }

  // ===================================================================
  // PHASE: HOLD COMPLETE
  // ===================================================================
  if (phase === 'hold_complete') {
    return (
      <div style={styles.container}>
        <div style={styles.completeIcon}>✓</div>
        <h2 style={styles.completeTitle}>{holdCompleteTitle}</h2>
        <p style={styles.completeSubtext}>{holdCompleteSubtext}</p>

        <div style={styles.footer}>
          <button onClick={() => setPhase('map')} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: MAP
  // ===================================================================
  if (phase === 'map') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{mapHeader}</h2>
        <p style={styles.subtext}>{mapSubtext}</p>

        <div style={styles.legendBox}>
          <div style={styles.legendRow}>
            <span style={{ ...styles.legendDot, background: '#C5572C' }}></span>
            <span style={styles.legendLabel}>{nowLabel}</span>
          </div>
          <div style={styles.legendRow}>
            <span style={{ ...styles.legendDot, background: '#9C8C78' }}></span>
            <span style={styles.legendLabel}>{worriedLabel}</span>
          </div>
        </div>

        {mapCategories.map(cat => (
          <div key={cat.key} style={styles.categoryBlock}>
            <p style={styles.categoryLabel}>{cat.label}</p>
            <div style={styles.itemList}>
              {cat.items.map(item => {
                const isNoticing = noticingNow.has(item.id)
                const isWorried = worriedAbout.has(item.id)
                return (
                  <div key={item.id} style={styles.itemRow}>
                    <div style={styles.itemLabel}>{item.label}</div>
                    <div style={styles.itemActions}>
                      <button
                        onClick={() => toggleNoticing(item.id)}
                        style={{
                          ...styles.tagBtn,
                          ...(isNoticing ? styles.tagBtnNowActive : {}),
                        }}
                        aria-label={`Mark as ${nowLabel}`}
                      >
                        Now
                      </button>
                      <button
                        onClick={() => toggleWorried(item.id)}
                        style={{
                          ...styles.tagBtn,
                          ...(isWorried ? styles.tagBtnWorriedActive : {}),
                        }}
                        aria-label={`Mark as ${worriedLabel}`}
                      >
                        Worried
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div style={styles.footer}>
          <p style={styles.countLine}>
            {noticingNow.size} noticing now · {worriedAbout.size} worried about
          </p>
          <button onClick={() => setPhase('review')} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVIEW
  // ===================================================================
  const noticingItems = mapCategories.flatMap(c =>
    c.items.filter(i => noticingNow.has(i.id)).map(i => ({ ...i, category: c.label }))
  )
  const worriedItems = mapCategories.flatMap(c =>
    c.items.filter(i => worriedAbout.has(i.id)).map(i => ({ ...i, category: c.label }))
  )

  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>Your 72-hour map.</h2>
      <p style={styles.subtext}>Yours to return to over the next three days.</p>

      {noticingItems.length > 0 && (
        <div style={styles.reviewCard}>
          <p style={{ ...styles.reviewLabel, color: '#C5572C' }}>{nowLabel}</p>
          <ul style={styles.reviewList}>
            {noticingItems.map(i => (
              <li key={i.id} style={styles.reviewItem}>{i.label}</li>
            ))}
          </ul>
        </div>
      )}

      {worriedItems.length > 0 && (
        <div style={styles.reviewCard}>
          <p style={{ ...styles.reviewLabel, color: '#6B5C4A' }}>{worriedLabel}</p>
          <ul style={styles.reviewList}>
            {worriedItems.map(i => (
              <li key={i.id} style={styles.reviewItem}>{i.label}</li>
            ))}
          </ul>
        </div>
      )}

      <p style={styles.reviewNote}>
        The map is data. When something is happening over the next three days, return here. What you tapped was on the list of things to expect.
      </p>

      <div style={styles.footer}>
        <button onClick={() => setPhase('map')} style={styles.secondaryBtn}>‹ Back</button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Mark Day Zero'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { paddingTop: '0.5rem' },
  prompt: {
    fontSize: '22px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 0.5rem',
    textAlign: 'center',
  },
  subtext: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.55, margin: '0 0 1.5rem',
    textAlign: 'center',
  },
  holdRingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem 0',
    userSelect: 'none',
  },
  holdRing: {
    position: 'relative',
    width: 200,
    height: 200,
    border: 'none',
    background: '#FDFBF6',
    borderRadius: '50%',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 4px 16px rgba(80,50,20,0.08)',
    padding: 0,
    touchAction: 'none',
  },
  holdRingActive: {
    transform: 'scale(0.97)',
    boxShadow: '0 2px 8px rgba(80,50,20,0.12)',
    background: '#FBF6EA',
  },
  holdSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  holdCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdNumber: {
    fontSize: '54px',
    fontWeight: 500,
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  holdInstruction: {
    fontSize: '14px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  holdActiveNote: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0.5rem 0 0',
  },
  completeIcon: {
    width: '64px', height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '0.5px solid #C2D49A',
    color: '#3B6D11',
    fontSize: '32px', fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '2rem auto 1rem',
  },
  completeTitle: {
    fontSize: '24px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    textAlign: 'center',
    margin: '0 0 0.75rem',
    lineHeight: 1.3,
  },
  completeSubtext: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 1.55,
    margin: '0 0 2rem',
  },
  legendBox: {
    background: '#FDFBF6',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    padding: '10px 14px',
    marginBottom: '1.25rem',
    display: 'flex',
    gap: '16px',
  },
  legendRow: {
    display: 'flex', alignItems: 'center', gap: '6px',
  },
  legendDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: '11px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  categoryBlock: { marginBottom: '1.25rem' },
  categoryLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.6rem',
  },
  itemList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  itemRow: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },
  itemLabel: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.4,
    flex: 1,
  },
  itemActions: {
    display: 'flex',
    gap: '4px',
    flexShrink: 0,
  },
  tagBtn: {
    padding: '5px 10px',
    background: 'white',
    border: '0.5px solid #DDCFB6',
    borderRadius: '999px',
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tagBtnNowActive: {
    background: '#C5572C',
    border: '1px solid #C5572C',
    color: '#FAF7F1',
  },
  tagBtnWorriedActive: {
    background: '#9C8C78',
    border: '1px solid #9C8C78',
    color: '#FAF7F1',
  },
  reviewCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '10px',
  },
  reviewLabel: {
    fontSize: '11px',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.6rem',
  },
  reviewList: { margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' },
  reviewItem: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    margin: '0 0 0.25rem',
  },
  reviewNote: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.6, textAlign: 'center',
    margin: '1rem 0 0',
  },
  countLine: {
    fontSize: '11.5px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 8px', textAlign: 'center',
  },
  footer: { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' },
  primaryBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnFlex: {
    flex: 1, padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  secondaryBtn: {
    padding: '14px 18px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
  },
}