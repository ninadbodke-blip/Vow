import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLang } from '../LanguageContext'
import { supabase } from '../supabaseClient'

const TECHNIQUES = [
  { id: 'breath', name: 'Breathe', duration: 90 },
  { id: 'tap', name: 'Tap to focus', duration: 30 },
  { id: 'cold', name: 'Cold water', duration: 10 },
  { id: 'senses', name: '5-4-3-2-1', duration: 0 },
  { id: 'why', name: 'Your why', duration: 0 },
  { id: 'reach', name: 'Reach out', duration: 0 },
]

export default function UrgeFlow() {
  const { trackerId } = useParams()
  const navigate = useNavigate()
  const { t } = useLang()

  const [step, setStep] = useState('intro')
  const [techniqueIdx, setTechniqueIdx] = useState(0)
  const [tracker, setTracker] = useState(null)
  const [profileBio, setProfileBio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [feedbackIntensity, setFeedbackIntensity] = useState(null)
  const [feedbackTrigger, setFeedbackTrigger] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: trackerData } = await supabase
          .from('trackers')
          .select('*, addiction_types(name, icon)')
          .eq('id', trackerId)
          .single()
        if (!trackerData) { navigate('/home'); return }
        setTracker(trackerData)

        const { data: profile } = await supabase
          .from('profiles')
          .select('bio')
          .eq('id', user.id)
          .single()
        setProfileBio(profile?.bio || null)
      } catch (err) {
        navigate('/home')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [trackerId])

  const saveAndExit = async (passed) => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('urge_logs').insert({
        user_id: user.id,
        tracker_id: trackerId,
        intensity: feedbackIntensity || 'Moderate',
        triggers: feedbackTrigger ? [feedbackTrigger] : [],
        notes: passed ? 'Rode out the urge' : 'Completed all 6 techniques',
        resisted: true,
      })
      navigate('/home')
    } catch (err) {
      alert('Could not save: ' + err.message)
      setSaving(false)
    }
  }

  const startTechniques = () => {
    setStep('technique')
    setTechniqueIdx(0)
  }

  const onTechniqueDone = () => setStep('check')
  const onUrgePassed = () => setStep('feedback')
  const onUrgeStillHere = () => {
    if (techniqueIdx < TECHNIQUES.length - 1) {
      setTechniqueIdx(techniqueIdx + 1)
      setStep('technique')
    } else {
      setStep('end')
    }
  }

  if (loading || !tracker) {
    return (
      <div style={styles.frame}>
        <div style={styles.card}>
          <p style={{textAlign: 'center', color: '#9C8C78'}}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={styles.card}>
        {step === 'intro' && <Intro tracker={tracker} onStart={startTechniques} onCancel={() => navigate('/home')} />}
        {step === 'technique' && (
          <Technique
            technique={TECHNIQUES[techniqueIdx]}
            techniqueIdx={techniqueIdx}
            tracker={tracker}
            profileBio={profileBio}
            onDone={onTechniqueDone}
            onSkip={onTechniqueDone}
          />
        )}
        {step === 'check' && <CheckIn onPassed={onUrgePassed} onStill={onUrgeStillHere} />}
        {step === 'feedback' && (
          <Feedback
            intensity={feedbackIntensity}
            setIntensity={setFeedbackIntensity}
            trigger={feedbackTrigger}
            setTrigger={setFeedbackTrigger}
            onDone={() => saveAndExit(true)}
            saving={saving}
          />
        )}
        {step === 'end' && <FinalMessage onDone={() => saveAndExit(false)} saving={saving} />}
      </div>
    </div>
  )
}

// ────────── INTRO with milestone meter ──────────
function Intro({ onStart, onCancel, tracker }) {
  const [milestoneInfo, setMilestoneInfo] = useState(null)

  useEffect(() => {
    async function loadMilestoneProgress() {
      if (!tracker) return
      const start = new Date(tracker.start_date)
      const now = new Date()
      const totalSecondsClean = (now - start) / 1000
      const daysCleanFloat = totalSecondsClean / 86400
      const daysCleanInt = Math.floor(daysCleanFloat)

      const { data: milestones } = await supabase
        .from('milestones')
        .select('*')
        .order('days_required')

      if (!milestones) return

      let lastReached = null
      let nextMilestone = null
      for (const m of milestones) {
        if (m.days_required <= daysCleanInt) {
          lastReached = m
        } else {
          nextMilestone = m
          break
        }
      }

      if (!nextMilestone) {
        setMilestoneInfo({
          daysClean: daysCleanInt,
          progressPct: 100,
          nextLabel: 'Beyond all milestones',
          allReached: true,
        })
        return
      }

      // Progress measured from start of streak (not from last milestone)
      const progressPct = Math.min(
        Math.max(Math.round((daysCleanFloat / nextMilestone.days_required) * 100), 0),
        99
      )

      setMilestoneInfo({
        daysClean: daysCleanInt,
        progressPct,
        nextLabel: nextMilestone.label,
        nextIcon: nextMilestone.badge_icon,
        nextDays: nextMilestone.days_required,
        allReached: false,
      })
    }
    loadMilestoneProgress()
  }, [tracker])

  return (
    <div style={styles.center}>
      <div style={styles.softIcon}>🌊</div>
      <h2 style={styles.bigTitle}>You're not alone in this moment.</h2>
      <p style={styles.body}>
        Urges rise. They peak. They pass.
      </p>

      {milestoneInfo && !milestoneInfo.allReached && (
        <div style={styles.meterCard}>
          <SemiCircleMeter percent={milestoneInfo.progressPct} />
          <p style={styles.meterCompletedText}>
            You're <b>{milestoneInfo.progressPct}%</b> through to your next milestone
          </p>
          <p style={styles.meterMilestoneText}>
            {milestoneInfo.nextIcon} {milestoneInfo.nextLabel}
          </p>
          <p style={styles.meterMotivation}>
            Don't let this urge undo your progress.
          </p>
        </div>
      )}

      {milestoneInfo?.allReached && (
        <div style={styles.meterCard}>
          <p style={styles.meterMotivation}>
            You've crossed every milestone we have. You're a force.
          </p>
        </div>
      )}

      <p style={styles.subtle}>We'll guide you through 6 short steps. No thinking required.</p>
      <div style={styles.actions}>
        <button onClick={onCancel} style={{...styles.btn, ...styles.btnSecondary}}>Not now</button>
        <button onClick={onStart} style={{...styles.btn, ...styles.btnPrimary}}>Begin</button>
      </div>
    </div>
  )
}

function SemiCircleMeter({ percent }) {
  const RADIUS = 70
  const STROKE_WIDTH = 12
  const CIRC_LENGTH = Math.PI * RADIUS

  const angle = 180 - (percent / 100) * 180
  const angleRad = (angle * Math.PI) / 180
  const pinX = 90 + RADIUS * Math.cos(angleRad)
  const pinY = 90 - RADIUS * Math.sin(angleRad)
  const filledLength = (percent / 100) * CIRC_LENGTH

  return (
    <svg viewBox="0 0 180 100" style={{ width: '180px', height: '100px' }}>
      <path
        d={`M 20 90 A ${RADIUS} ${RADIUS} 0 0 1 160 90`}
        fill="none"
        stroke="#E8DFD0"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
      <path
        d={`M 20 90 A ${RADIUS} ${RADIUS} 0 0 1 160 90`}
        fill="none"
        stroke="url(#meterGrad)"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={`${filledLength} ${CIRC_LENGTH}`}
      />
      <defs>
        <linearGradient id="meterGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#E8A064" />
          <stop offset="100%" stopColor="#C5572C" />
        </linearGradient>
      </defs>
      <line
        x1="90" y1="90"
        x2={pinX} y2={pinY}
        stroke="#2A1F15"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="90" cy="90" r="6" fill="#2A1F15" />
      <circle cx="90" cy="90" r="3" fill="#FAF7F1" />
    </svg>
  )
}

// ────────── TECHNIQUE ROUTER ──────────
function Technique({ technique, techniqueIdx, profileBio, onDone, onSkip }) {
  const stepNum = techniqueIdx + 1
  const total = TECHNIQUES.length

  if (technique.id === 'breath') return <BreathTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'tap') return <TapTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'cold') return <ColdTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'senses') return <SensesTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'why') return <WhyTechnique stepNum={stepNum} total={total} profileBio={profileBio} onDone={onDone} />
  if (technique.id === 'reach') return <ReachOutTechnique stepNum={stepNum} total={total} onDone={onDone} />
  return null
}

// ────────── 1. BREATHING ──────────
function BreathTechnique({ stepNum, total, onDone, onSkip }) {
  const [phase, setPhase] = useState('in')
  const [secondsLeft, setSecondsLeft] = useState(90)

  useEffect(() => {
    const phases = ['in', 'hold1', 'out', 'hold2']
    let phaseIdx = 0
    const phaseTimer = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % 4
      setPhase(phases[phaseIdx])
    }, 4000)

    const countdown = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(countdown)
          clearInterval(phaseTimer)
          setTimeout(onDone, 500)
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => {
      clearInterval(phaseTimer)
      clearInterval(countdown)
    }
  }, [])

  const phaseLabel = { in: 'Breathe in', hold1: 'Hold', out: 'Breathe out', hold2: 'Hold' }[phase]
  const circleScale = phase === 'in' ? 1.4 : phase === 'out' ? 0.7 : phase === 'hold1' ? 1.4 : 0.7

  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Breathe</p>
      <div style={styles.breathingArea}>
        <div style={{...styles.breathCircle, transform: `scale(${circleScale})`}}>
          <span style={styles.breathLabel}>{phaseLabel}</span>
        </div>
      </div>
      <p style={styles.timerText}>{secondsLeft}s</p>
      <button onClick={onSkip} style={styles.skipText}>Skip this one</button>
    </div>
  )
}

// ────────── 2. TAP TO FOCUS — 3x4 grid ──────────
function TapTechnique({ stepNum, total, onDone, onSkip }) {
  const GRID_ROWS = 4
  const GRID_COLS = 3
  const TOTAL_TILES = GRID_ROWS * GRID_COLS

  const [secondsLeft, setSecondsLeft] = useState(30)
  const [activeIdx, setActiveIdx] = useState(0)
  const [successIdx, setSuccessIdx] = useState(null)
  const [hits, setHits] = useState(0)

  const moveTimerRef = useRef(null)
  const activeIdxRef = useRef(0)

  useEffect(() => {
    activeIdxRef.current = activeIdx
  }, [activeIdx])

  const pickNewTile = () => {
    let next
    do {
      next = Math.floor(Math.random() * TOTAL_TILES)
    } while (next === activeIdxRef.current)
    return next
  }

  const scheduleNextMove = () => {
    if (moveTimerRef.current) clearTimeout(moveTimerRef.current)
    moveTimerRef.current = setTimeout(() => {
      setActiveIdx(pickNewTile())
      scheduleNextMove()
    }, 1000)
  }

  useEffect(() => {
    scheduleNextMove()

    const countdown = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(countdown)
          if (moveTimerRef.current) clearTimeout(moveTimerRef.current)
          setTimeout(onDone, 500)
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => {
      if (moveTimerRef.current) clearTimeout(moveTimerRef.current)
      clearInterval(countdown)
    }
  }, [])

  const handleTap = (idx) => {
    if (idx !== activeIdxRef.current) return
    setSuccessIdx(idx)
    setHits(h => h + 1)
    setTimeout(() => setSuccessIdx(null), 200)
    setActiveIdx(pickNewTile())
    scheduleNextMove()
  }

  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Tap to focus</p>
      <p style={styles.bodyTitle}>Tap the glowing tile.</p>
      <p style={styles.subtle}>Move with the light.</p>

      <div style={styles.tapGrid}>
        {Array.from({length: TOTAL_TILES}).map((_, i) => (
          <button
            key={i}
            onClick={() => handleTap(i)}
            style={{
              ...styles.tapGridTile,
              ...(i === activeIdx ? styles.tapGridActive : {}),
              ...(i === successIdx ? styles.tapGridSuccess : {}),
            }}
            aria-label={`Tile ${i + 1}`}
          >
            <span style={{
              ...styles.tapGridDot,
              opacity: i === activeIdx || i === successIdx ? 1 : 0,
              color: i === successIdx ? '#7A8C5A' : '#C5572C',
            }}>•</span>
          </button>
        ))}
      </div>

      <div style={styles.tapStats}>
        <span style={styles.timerText}>{secondsLeft}s</span>
        <span style={styles.dot}> · </span>
        <span style={styles.timerText}>{hits} hits</span>
      </div>

      <button onClick={onSkip} style={styles.skipText}>Skip this one</button>
    </div>
  )
}

// ────────── 3. COLD WATER ──────────
function ColdTechnique({ stepNum, total, onDone, onSkip }) {
  const [secondsLeft, setSecondsLeft] = useState(10)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started) return
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(id)
          setTimeout(onDone, 800)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [started])

  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Cold water</p>
      <div style={styles.softIcon}>💧</div>
      {!started ? (
        <>
          <h3 style={styles.bigTitle}>Splash cold water on your face.</h3>
          <p style={styles.body}>
            10 seconds is enough.<br/>
            Cold activates a reflex that calms your nervous system.
          </p>
          <p style={styles.subtle}>If you can't access water, skip this one.</p>
          <div style={styles.actions}>
            <button onClick={onSkip} style={{...styles.btn, ...styles.btnSecondary}}>Skip</button>
            <button onClick={() => setStarted(true)} style={{...styles.btn, ...styles.btnPrimary}}>I'm ready</button>
          </div>
        </>
      ) : (
        <>
          <h3 style={styles.bigTitle}>Go now.</h3>
          <p style={styles.body}>Cold water on your face.<br/>We'll wait.</p>
          <div style={styles.bigTimer}>{secondsLeft}</div>
        </>
      )}
    </div>
  )
}

// ────────── 4. 5-4-3-2-1 SENSES ──────────
function SensesTechnique({ stepNum, total, onDone, onSkip }) {
  const senses = [
    { count: 5, label: 'things you can see', icon: '👁️', skippable: false },
    { count: 4, label: 'things you can touch', icon: '✋', skippable: false },
    { count: 3, label: 'things you can hear', icon: '👂', skippable: false },
    { count: 2, label: 'things you can smell', icon: '👃', skippable: true },
    { count: 1, label: 'thing you can taste', icon: '👅', skippable: true },
  ]
  const [senseIdx, setSenseIdx] = useState(0)
  const [tapped, setTapped] = useState(0)

  const current = senses[senseIdx]

  const advance = () => {
    if (senseIdx < senses.length - 1) {
      setSenseIdx(senseIdx + 1)
      setTapped(0)
    } else {
      setTimeout(onDone, 400)
    }
  }

  const tap = () => {
    const next = tapped + 1
    if (next >= current.count) advance()
    else setTapped(next)
  }

  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Ground yourself</p>
      <div style={styles.sensesIcon}>{current.icon}</div>
      <p style={styles.bodyTitle}>
        Find <b>{current.count - tapped}</b> {current.label}
      </p>
      <p style={styles.subtle}>Tap below as you find each one.</p>

      <div style={styles.senseDotsRow}>
        {Array.from({length: current.count}).map((_, i) => (
          <div key={i} style={{
            ...styles.senseDot,
            ...(i < tapped ? styles.senseDotFilled : {})
          }} />
        ))}
      </div>

      <button onClick={tap} style={{...styles.btnPill, ...styles.btnPrimary, marginTop: '1.5rem'}}>
        Found one ✓
      </button>
      {current.skippable && (
        <button onClick={advance} style={styles.skipText}>None nearby — skip</button>
      )}
      {!current.skippable && (
        <button onClick={onSkip} style={styles.skipText}>Skip this technique</button>
      )}
    </div>
  )
}

// ────────── 5. THE WHY — Brick Wall ──────────
function WhyTechnique({ stepNum, total, profileBio, onDone }) {
  const ROWS = 4
  const COLS = 5
  const TOTAL_BRICKS = ROWS * COLS
  const TAPS_TO_BREAK = 5

  const [quote, setQuote] = useState(null)
  const [tapsCount, setTapsCount] = useState(0)
  const [particles, setParticles] = useState([])
  const [allCrumbled, setAllCrumbled] = useState(false)

  useEffect(() => {
    async function loadQuote() {
      const { data } = await supabase
        .from('urge_quotes')
        .select('quote_text')
        .eq('is_active', true)
      if (data && data.length > 0) {
        const random = data[Math.floor(Math.random() * data.length)]
        setQuote(random.quote_text)
      } else {
        setQuote('Most urges fade if you don\'t act on them. Just wait. It will pass.')
      }
    }
    loadQuote()
  }, [])

  const handleWallTap = (e) => {
    if (tapsCount >= TAPS_TO_BREAK || allCrumbled) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const particleCount = 8 + Math.floor(Math.random() * 5)
    const newParticles = Array.from({length: particleCount}).map((_, i) => ({
      id: Date.now() + i,
      x, y,
      angle: (Math.random() * 360),
      distance: 40 + Math.random() * 60,
      size: 4 + Math.random() * 6,
    }))
    setParticles(p => [...p, ...newParticles])

    setTimeout(() => {
      setParticles(p => p.filter(particle => !newParticles.some(np => np.id === particle.id)))
    }, 700)

    const newTaps = tapsCount + 1
    setTapsCount(newTaps)

    if (newTaps >= TAPS_TO_BREAK) {
      setTimeout(() => setAllCrumbled(true), 300)
    }
  }

  const bioPreview = profileBio ? profileBio.slice(0, 80) : ''
  const bioRest = profileBio ? profileBio.slice(80) : ''
  const revealRatio = Math.min(tapsCount / TAPS_TO_BREAK, 1)
  const restRevealed = bioRest.slice(0, Math.floor(bioRest.length * revealRatio))
  const crackOpacity = tapsCount / TAPS_TO_BREAK

  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Your why</p>

      {profileBio && (
        <div style={styles.whyBoxCompact}>
          <p style={styles.whyText}>
            {bioPreview}
            <span style={{opacity: revealRatio > 0 ? 1 : 0.15, transition: 'opacity 0.5s'}}>
              {restRevealed}
            </span>
            {bioRest.length > restRevealed.length && (
              <span style={{opacity: 0.15}}>{bioRest.slice(restRevealed.length)}</span>
            )}
          </p>
        </div>
      )}

      <p style={styles.bodyTitle}>Break this wall</p>
      <p style={styles.subtle}>
        {tapsCount === 0 ? 'Strike the wall.' :
         tapsCount < TAPS_TO_BREAK ? `${TAPS_TO_BREAK - tapsCount} more strikes...` :
         'The wall has fallen.'}
      </p>

      <div
        onClick={handleWallTap}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '300px',
          margin: '1rem auto 0',
          cursor: allCrumbled ? 'default' : 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={styles.quoteBackdrop}>
          <p style={{
            ...styles.quoteText,
            opacity: allCrumbled ? 1 : 0.3 + (tapsCount * 0.14),
            transition: 'opacity 0.4s',
          }}>
            {quote || '...'}
          </p>
        </div>

        <div style={{
          ...styles.brickWall,
          opacity: allCrumbled ? 0 : 1,
          transition: 'opacity 0.6s ease-out',
          pointerEvents: allCrumbled ? 'none' : 'auto',
        }}>
          {Array.from({length: TOTAL_BRICKS}).map((_, i) => {
            const fallDelay = allCrumbled ? (i * 30) : 0
            return (
              <div
                key={i}
                style={{
                  ...styles.brick,
                  ...(allCrumbled ? {
                    transform: `translateY(${100 + Math.random() * 60}px) rotate(${(Math.random() - 0.5) * 60}deg)`,
                    opacity: 0,
                    transition: `transform 0.7s ease-in ${fallDelay}ms, opacity 0.5s ease-in ${fallDelay}ms`,
                  } : {})
                }}
              />
            )
          })}
        </div>

        <svg
          style={{
            ...styles.crackOverlay,
            opacity: allCrumbled ? 0 : crackOpacity,
            pointerEvents: 'none',
          }}
          viewBox="0 0 300 200"
          preserveAspectRatio="none"
        >
          {tapsCount >= 1 && (
            <path d="M 50 30 L 80 60 L 70 90 L 110 110 L 90 140 L 130 170"
              stroke="#1A0805" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
          )}
          {tapsCount >= 2 && (
            <path d="M 0 80 L 40 75 L 70 90 L 120 78 L 170 95 L 220 80 L 270 92 L 300 85"
              stroke="#1A0805" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
          )}
          {tapsCount >= 3 && (
            <>
              <path d="M 150 100 L 180 130 L 170 160 L 200 180"
                stroke="#1A0805" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
              <path d="M 150 100 L 120 130 L 90 150"
                stroke="#1A0805" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.75" />
            </>
          )}
          {tapsCount >= 4 && (
            <path d="M 200 0 L 210 30 L 195 50 L 220 70 L 240 50 L 260 80 L 280 60"
              stroke="#1A0805" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
          )}
          {tapsCount >= 5 && (
            <>
              <path d="M 30 10 L 50 40 L 40 70" stroke="#1A0805" strokeWidth="1.5" fill="none" opacity="0.7" />
              <path d="M 240 30 L 260 60 L 250 100" stroke="#1A0805" strokeWidth="1.5" fill="none" opacity="0.7" />
              <path d="M 80 150 L 100 175 L 80 195" stroke="#1A0805" strokeWidth="1.5" fill="none" opacity="0.7" />
            </>
          )}
        </svg>

        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: `linear-gradient(180deg, #8E5A38 0%, #4A2A14 100%)`,
              borderRadius: '2px',
              pointerEvents: 'none',
              zIndex: 10,
              animation: `particleFly-${p.id} 0.7s ease-out forwards`,
            }}
          >
            <style>
              {`@keyframes particleFly-${p.id} {
                0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 1; }
                100% {
                  transform: translate(
                    calc(-50% + ${Math.cos(p.angle * Math.PI / 180) * p.distance}px),
                    calc(-50% + ${Math.sin(p.angle * Math.PI / 180) * p.distance}px)
                  ) rotate(${(Math.random() - 0.5) * 360}deg) scale(0.3);
                  opacity: 0;
                }
              }`}
            </style>
          </div>
        ))}
      </div>

      <button
        onClick={onDone}
        disabled={!allCrumbled}
        style={{
          ...styles.btnPill,
          ...(allCrumbled ? styles.btnPrimary : styles.btnSecondary),
          marginTop: '1.5rem',
          opacity: allCrumbled ? 1 : 0.5,
          cursor: allCrumbled ? 'pointer' : 'not-allowed',
        }}
      >
        {allCrumbled ? "I'm ready →" : 'Keep going'}
      </button>
    </div>
  )
}

// ────────── 6. REACH OUT ──────────
function ReachOutTechnique({ stepNum, total, onDone }) {
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Reach out</p>
      <div style={styles.softIcon}>🤝</div>
      <h3 style={styles.bigTitle}>Call someone you trust.</h3>
      <p style={styles.body}>
        A parent. A friend. A sponsor.<br/>
        You don't have to talk about the urge.<br/>
        Just hearing a voice helps.
      </p>
      <div style={styles.placeholderBox}>
        <p style={styles.placeholderText}>
          Trusted contacts coming soon — for now, open your phone and call someone close.
        </p>
      </div>
      <button onClick={onDone} style={{...styles.btnPill, ...styles.btnPrimary, marginTop: '1.5rem'}}>
        Done →
      </button>
    </div>
  )
}

// ────────── CHECK-IN ──────────
function CheckIn({ onPassed, onStill }) {
  return (
    <div style={styles.center}>
      <div style={styles.softIcon}>🌊</div>
      <h3 style={styles.bigTitle}>How is the urge now?</h3>
      <p style={styles.body}>Be honest with yourself.</p>
      <div style={{...styles.actions, flexDirection: 'column', gap: '10px', width: '100%', marginTop: '1.5rem'}}>
        <button onClick={onPassed} style={{...styles.btn, ...styles.btnPrimary, width: '100%'}}>
          It's passed
        </button>
        <button onClick={onStill} style={{...styles.btn, ...styles.btnSecondary, width: '100%'}}>
          Still here
        </button>
      </div>
    </div>
  )
}

// ────────── FEEDBACK with expanded triggers + pill button ──────────
function Feedback({ intensity, setIntensity, trigger, setTrigger, onDone, saving }) {
  const intensities = ['Mild', 'Moderate', 'Strong']
  const triggers = [
    'Stress', 'Anxiety', 'Boredom', 'Loneliness', 'Frustration',
    'Fatigue', 'Social', 'Celebration', 'Company', 'Time of day',
    'Idle time', 'Relationship', 'Financial worries'
  ]

  return (
    <div style={styles.center}>
      <div style={styles.softIcon}>🌟</div>
      <h3 style={styles.bigTitle}>You rode the wave.</h3>
      <p style={styles.body}>That's strength. Quick tap — how strong was it?</p>
      <div style={styles.tapRow}>
        {intensities.map(i => (
          <button key={i} onClick={() => setIntensity(i)}
            style={{...styles.tapChip, ...(intensity === i ? styles.tapChipActive : {})}}>
            {i}
          </button>
        ))}
      </div>
      <p style={{...styles.body, marginTop: '1.5rem'}}>What triggered it?</p>
      <div style={styles.tapRow}>
        {triggers.map(tr => (
          <button key={tr} onClick={() => setTrigger(tr)}
            style={{...styles.tapChip, ...(trigger === tr ? styles.tapChipActive : {})}}>
            {tr}
          </button>
        ))}
      </div>
      <button onClick={onDone} disabled={saving}
        style={{...styles.btnPill, ...styles.btnPrimary, marginTop: '2rem'}}>
        {saving ? '...' : 'Save'}
      </button>
    </div>
  )
}

// ────────── FINAL MESSAGE ──────────
function FinalMessage({ onDone, saving }) {
  return (
    <div style={styles.center}>
      <div style={styles.softIcon}>🕊️</div>
      <h3 style={styles.bigTitle}>You showed up.</h3>
      <div style={styles.finalBox}>
        <p style={styles.finalText}>
          The biggest resource to ride this urge is your own willpower and determination.
        </p>
        <p style={styles.finalEmphasis}>
          We have faith in you to keep your vow.
        </p>
      </div>
      <button onClick={onDone} disabled={saving}
        style={{...styles.btnPill, ...styles.btnPrimary, marginTop: '2rem'}}>
        {saving ? '...' : 'Back home'}
      </button>
    </div>
  )
}

const styles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: '#FAF7F1',
    maxWidth: '440px', width: '100%',
    minHeight: '600px',
    borderRadius: '28px',
    padding: '2.5rem 1.75rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  center: {
    textAlign: 'center', display: 'flex', flexDirection: 'column',
    alignItems: 'center', flex: 1, justifyContent: 'center',
  },
  softIcon: { fontSize: '44px', marginBottom: '1rem' },
  meterCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '16px',
    padding: '1.25rem 1rem 1rem',
    margin: '0.5rem 0 1.25rem',
    width: '100%',
    maxWidth: '340px',
    boxSizing: 'border-box',
    textAlign: 'center',
    boxShadow: '0 4px 14px rgba(80,50,20,0.06)',
  },
  meterCompletedText: {
    fontSize: '14px',
    color: '#2A1F15',
    margin: '0.5rem 0 0.25rem',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.4,
  },
  meterMilestoneText: {
    fontSize: '13px',
    color: '#854F0B',
    margin: '0 0 0.5rem',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
  },
  meterMotivation: {
    fontSize: '12px',
    color: '#9C8C78',
    fontStyle: 'italic',
    margin: '0.5rem 0 0',
    fontFamily: 'Georgia, serif',
    paddingTop: '0.5rem',
    borderTop: '0.5px solid #EFE7D7',
  },
  bigTitle: {
    fontSize: '22px', fontWeight: 600, color: '#2A1F15',
    margin: '0 0 0.75rem', fontFamily: 'Georgia, serif', lineHeight: 1.3,
  },
  body: {
    fontSize: '14px', color: '#6B5C4A',
    margin: '0 0 0.75rem', lineHeight: 1.6, fontFamily: 'Georgia, serif',
  },
  bodyTitle: {
    fontSize: '16px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 0.5rem', fontFamily: 'Georgia, serif',
  },
  subtle: {
    fontSize: '12px', color: '#9C8C78', fontStyle: 'italic',
    margin: '0 0 1rem', fontFamily: 'Georgia, serif',
  },
  techCount: {
    fontSize: '11px', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#9C8C78',
    fontWeight: 500, margin: '0 0 1.5rem',
  },
  actions: {
    display: 'flex', gap: '10px', width: '100%',
    marginTop: '1.25rem', maxWidth: '320px',
  },
  btn: {
    padding: '12px 20px', borderRadius: '12px', fontSize: '14px',
    fontWeight: 500, border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', flex: 1,
  },
  btnPill: {
    padding: '11px 28px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.02em',
  },
  btnPrimary: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
  },
  btnSecondary: {
    background: 'white', color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    boxShadow: '0 3px 10px rgba(80,50,20,0.06)',
  },
  skipText: {
    background: 'transparent', border: 'none',
    color: '#9C8C78', fontSize: '12px',
    cursor: 'pointer', fontFamily: 'inherit',
    marginTop: '1rem', textDecoration: 'underline',
    textUnderlineOffset: '2px',
  },
  breathingArea: {
    width: '180px', height: '180px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '1rem 0',
  },
  breathCircle: {
    width: '120px', height: '120px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(197,87,44,0.4) 0%, rgba(197,87,44,0.15) 100%)',
    border: '2px solid rgba(197,87,44,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 4s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  breathLabel: {
    fontSize: '13px', color: '#2A1F15', fontWeight: 500,
    fontFamily: 'Georgia, serif',
  },
  timerText: {
    fontSize: '12px', color: '#9C8C78',
    fontVariantNumeric: 'tabular-nums', margin: '0.5rem 0',
  },
  bigTimer: {
    fontSize: '64px', fontWeight: 600, color: '#C5572C',
    fontFamily: 'Georgia, serif',
    margin: '1.5rem 0', fontVariantNumeric: 'tabular-nums',
  },
  tapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(4, 1fr)',
    gap: '8px',
    margin: '1.25rem auto',
    width: '100%',
    maxWidth: '260px',
  },
  tapGridTile: {
    aspectRatio: '1 / 1',
    borderRadius: '14px',
    background: '#F4ECDD',
    border: '1px solid #E8DCC2',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontFamily: 'inherit',
    padding: 0,
    transition: 'all 0.2s ease-out',
    boxShadow: '0 1px 2px rgba(80,50,20,0.04)',
  },
  tapGridActive: {
    background: 'radial-gradient(circle, rgba(197,87,44,0.45) 0%, rgba(197,87,44,0.12) 100%)',
    border: '1px solid rgba(197,87,44,0.6)',
    transform: 'scale(1.06)',
    boxShadow: '0 4px 14px rgba(197,87,44,0.3)',
  },
  tapGridSuccess: {
    background: 'radial-gradient(circle, rgba(122,140,90,0.55) 0%, rgba(122,140,90,0.18) 100%)',
    border: '1px solid rgba(122,140,90,0.7)',
    transform: 'scale(1.10)',
    boxShadow: '0 6px 18px rgba(122,140,90,0.4)',
    transition: 'all 0.15s ease-out',
  },
  tapGridDot: {
    fontSize: '28px',
    color: '#C5572C',
    lineHeight: 1,
    transition: 'opacity 0.15s ease-out',
  },
  tapStats: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '4px', margin: '0.75rem 0',
  },
  dot: { color: '#9C8C78', fontSize: '12px' },
  sensesIcon: { fontSize: '36px', marginBottom: '0.5rem' },
  senseDotsRow: {
    display: 'flex', gap: '8px', justifyContent: 'center',
    marginTop: '0.75rem',
  },
  senseDot: {
    width: '14px', height: '14px', borderRadius: '50%',
    background: '#E8DFD0', border: '0.5px solid #DDCFB6',
    transition: 'all 0.3s',
  },
  senseDotFilled: {
    background: '#7A8C5A', transform: 'scale(1.1)',
  },
  whyBoxCompact: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '0.5px solid #E8DCC2',
    borderRadius: '12px',
    padding: '12px 14px',
    margin: '0 0 1rem',
    maxHeight: '110px',
    overflowY: 'auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  whyText: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap',
    textAlign: 'left',
  },
  quoteBackdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(180deg, #FAF7F1 0%, #F4ECDD 100%)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '0.5px solid #E8DCC2',
  },
  quoteText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 1.5,
    margin: 0,
  },
  brickWall: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gridTemplateRows: 'repeat(4, 1fr)',
    gap: '3px',
    padding: '4px',
    borderRadius: '12px',
    minHeight: '180px',
    zIndex: 2,
  },
  brick: {
    background: 'linear-gradient(180deg, #8E5A38 0%, #6B3F22 100%)',
    border: '1px solid #4A2A14',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.25)',
    transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
    padding: 0,
  },
  crackOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%', height: '100%',
    zIndex: 3,
    transition: 'opacity 0.3s',
  },
  placeholderBox: {
    background: '#F4ECDD',
    border: '0.5px dashed #C9B894',
    borderRadius: '12px', padding: '14px',
    margin: '1rem 0', width: '100%', boxSizing: 'border-box',
  },
  placeholderText: {
    fontSize: '12px', color: '#854F0B',
    margin: 0, fontStyle: 'italic',
    lineHeight: 1.5, fontFamily: 'Georgia, serif',
  },
  tapRow: {
    display: 'flex', flexWrap: 'wrap', gap: '6px',
    justifyContent: 'center', marginTop: '0.5rem',
  },
  tapChip: {
    padding: '8px 14px', borderRadius: '999px',
    background: 'white', border: '0.5px solid #E8DFD0',
    fontSize: '12px', color: '#2A1F15', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  tapChipActive: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: '0.5px solid #241710',
  },
  finalBox: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '0.5px solid #E8DCC2',
    borderRadius: '14px', padding: '1.5rem',
    margin: '1rem 0', width: '100%', boxSizing: 'border-box',
  },
  finalText: {
    fontSize: '14px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.7, margin: '0 0 0.75rem',
  },
  finalEmphasis: {
    fontSize: '15px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    fontWeight: 500, margin: 0, lineHeight: 1.6,
  },
}