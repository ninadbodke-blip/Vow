import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLang } from '../LanguageContext'
import { supabase } from '../supabaseClient'

const TECHNIQUES = [
  { id: 'breath', name: 'Breathe', duration: 90 },
  { id: 'tap', name: 'Tap to focus', duration: 30 },
  { id: 'dissolve', name: 'Let them go', duration: 0 },
  { id: 'wipe', name: 'Clear the fog', duration: 0 },
  { id: 'pulse', name: 'Slow the pulse', duration: 0 },
  { id: 'unclench', name: 'Unclench', duration: 0 },
  { id: 'circles', name: 'Slow circles', duration: 0 },
  { id: 'senses', name: '5-4-3-2-1', duration: 0 },
  { id: 'why', name: 'Your why', duration: 0 },
  { id: 'reach', name: 'Reach out', duration: 0 },
]

const RELATIONSHIPS = [
  { value: 'mother', label: 'Mother', icon: '👩' },
  { value: 'father', label: 'Father', icon: '👨' },
  { value: 'partner', label: 'Partner', icon: '💑' },
  { value: 'sibling', label: 'Sibling', icon: '👫' },
  { value: 'friend', label: 'Friend', icon: '🤝' },
  { value: 'sponsor', label: 'Sponsor', icon: '🪶' },
  { value: 'counselor', label: 'Counselor', icon: '🧘' },
  { value: 'other', label: 'Other', icon: '⚓' },
]

const URGE_MESSAGE = "Hey, I'm having a tough moment. Can you talk?"

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
  const [passedTechnique, setPassedTechnique] = useState(null)
  const [saving, setSaving] = useState(false)
  const startedRef = useRef(Date.now())

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
      const elapsed = Math.max(1, Math.round((Date.now() - startedRef.current) / 1000))
      await supabase.from('urge_logs').insert({
        user_id: user.id,
        tracker_id: trackerId,
        intensity: feedbackIntensity || 'Moderate',
        triggers: feedbackTrigger ? [feedbackTrigger] : [],
        notes: passed ? 'Rode out the urge' : 'Worked through the techniques',
        resisted: true,
        duration_seconds: elapsed,
        technique_used: passed ? passedTechnique : null,
        technique_helped: passed ? true : false,
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
  const onUrgePassed = () => {
    setPassedTechnique(TECHNIQUES[techniqueIdx]?.id ?? null)
    setStep('feedback')
  }
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
  if (technique.id === 'dissolve') return <DissolveTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'wipe') return <WipeTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'pulse') return <PulseTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'unclench') return <UnclenchTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'circles') return <CirclesTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
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

// ────────── 2. TAP TO FOCUS ──────────
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

// ────────── 3. DISSOLVE (sweep the embers away) ──────────
function DissolveTechnique({ stepNum, total, onDone, onSkip }) {
  const COUNT = 9
  const areaRef = useRef(null)
  const [motes, setMotes] = useState(() =>
    Array.from({ length: COUNT }).map((_, i) => ({
      id: i,
      bx: 15 + Math.random() * 70,
      by: 16 + Math.random() * 66,
      phase: Math.random() * Math.PI * 2,
      alive: true,
    }))
  )
  const [tick, setTick] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!done && motes.length && motes.every(m => !m.alive)) {
      setDone(true)
      setTimeout(onDone, 900)
    }
  }, [motes, done, onDone])

  const remaining = motes.filter(m => m.alive).length

  const dissolveAt = (clientX, clientY) => {
    const rect = areaRef.current && areaRef.current.getBoundingClientRect()
    if (!rect) return
    const px = ((clientX - rect.left) / rect.width) * 100
    const py = ((clientY - rect.top) / rect.height) * 100
    setMotes(prev => prev.map(m => {
      if (!m.alive) return m
      const ox = m.bx + Math.sin(tick / 8 + m.phase) * 3
      const oy = m.by + Math.cos(tick / 10 + m.phase) * 3
      const d = Math.hypot(px - ox, py - oy)
      return d < 12 ? { ...m, alive: false } : m
    }))
  }
  const onMove = (e) => { if (e.buttons || e.pressure > 0) dissolveAt(e.clientX, e.clientY) }

  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Let them go</p>
      <p style={styles.bodyTitle}>{done ? 'All gone.' : 'Brush the embers away.'}</p>
      <p style={styles.subtle}>
        {done ? 'One by one, until there were none.' : 'Drag your finger across each one. No rush.'}
      </p>

      <div
        ref={areaRef}
        style={styles.dissolveArea}
        onPointerDown={(e) => dissolveAt(e.clientX, e.clientY)}
        onPointerMove={onMove}
      >
        {motes.map(m => {
          const ox = m.bx + Math.sin(tick / 8 + m.phase) * 3
          const oy = m.by + Math.cos(tick / 10 + m.phase) * 3
          return (
            <div key={m.id} style={{
              ...styles.mote,
              left: ox + '%', top: oy + '%',
              ...(m.alive ? {} : styles.moteGone),
            }} />
          )
        })}
      </div>

      <p style={styles.subtle}>{done ? '' : remaining + ' left'}</p>
      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
    </div>
  )
}

// ────────── 4. CLEAR THE FOG (wipe to reveal) ──────────
function WipeTechnique({ stepNum, total, onDone, onSkip }) {
  const COLS = 7, ROWS = 5
  const TOTAL = COLS * ROWS
  const NEED = Math.round(TOTAL * 0.8)
  const areaRef = useRef(null)
  const [cleared, setCleared] = useState(() => new Set())
  const [done, setDone] = useState(false)

  const clearAt = (clientX, clientY) => {
    const rect = areaRef.current && areaRef.current.getBoundingClientRect()
    if (!rect) return
    const cx = Math.floor(((clientX - rect.left) / rect.width) * COLS)
    const cy = Math.floor(((clientY - rect.top) / rect.height) * ROWS)
    if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return
    const idx = cy * COLS + cx
    setCleared(prev => {
      if (prev.has(idx)) return prev
      const next = new Set(prev)
      next.add(idx)
      if (!done && next.size >= NEED) { setDone(true); setTimeout(onDone, 1100) }
      return next
    })
  }
  const onMove = (e) => { if (e.buttons || e.pressure > 0) clearAt(e.clientX, e.clientY) }

  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Clear the fog</p>
      <p style={styles.bodyTitle}>Wipe it away.</p>
      <p style={styles.subtle}>Drag across the haze. There's something underneath.</p>

      <div
        ref={areaRef}
        style={styles.wipeArea}
        onPointerDown={(e) => clearAt(e.clientX, e.clientY)}
        onPointerMove={onMove}
      >
        <div style={styles.wipeRevealText}>This is already passing.</div>
        <div style={styles.wipeGrid}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} style={{ ...styles.wipeCell, ...(cleared.has(i) || done ? styles.wipeCellGone : {}) }} />
          ))}
        </div>
      </div>

      <p style={styles.subtle}>{done ? 'Clear.' : 'Keep going.'}</p>
      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
    </div>
  )
}

// ────────── 5. SLOW THE PULSE (tap a slowing rhythm) ──────────
function PulseTechnique({ stepNum, total, onDone, onSkip }) {
  const NEED = 6
  const [taps, setTaps] = useState(0)
  const [phase, setPhase] = useState(0)
  const cycleRef = useRef(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let raf
    let last = performance.now()
    const loop = (now) => {
      const period = 2200 + cycleRef.current * 500
      const dt = now - last
      last = now
      setPhase(p => {
        let np = p + dt / period
        if (np >= 1) { np -= 1; cycleRef.current += 1 }
        return np
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const wave = Math.sin(phase * Math.PI)
  const scale = 0.55 + wave * 0.6
  const glow = 0.2 + wave * 0.5

  const tap = () => {
    if (done) return
    const n = taps + 1
    setTaps(n)
    if (n >= NEED) { setDone(true); setTimeout(onDone, 900) }
  }

  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Slow the pulse</p>
      <p style={styles.bodyTitle}>{done ? 'Slower now.' : 'Tap each time it fills.'}</p>
      <p style={styles.subtle}>
        {done ? 'You brought it down with you.' : 'Every round comes a little slower. Follow it down.'}
      </p>

      <div style={styles.pulseArea} onPointerDown={tap}>
        <div style={{
          ...styles.pulseCore,
          transform: 'scale(' + scale + ')',
          boxShadow: '0 0 ' + Math.round(20 + glow * 40) + 'px rgba(122,140,90,' + glow.toFixed(2) + ')',
        }} />
      </div>

      <div style={styles.roundDots}>
        {Array.from({ length: NEED }).map((_, i) => (
          <div key={i} style={{ ...styles.roundDot, ...(i < taps || done ? styles.roundDotDone : {}) }} />
        ))}
      </div>
      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
    </div>
  )
}


// ────────── 4. UNCLENCH (tension / release) ──────────
function UnclenchTechnique({ stepNum, total, onDone, onSkip }) {
  const ROUNDS = 3
  const CLENCH_S = 5
  const RELEASE_S = 5
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState('clench')
  const [clenchHeld, setClenchHeld] = useState(0)
  const [releaseLeft, setReleaseLeft] = useState(RELEASE_S)
  const [holding, setHolding] = useState(false)
  const [done, setDone] = useState(false)
  const tickRef = useRef(null)

  const startHold = () => {
    if (phase !== 'clench' || done) return
    setHolding(true)
    if (tickRef.current) clearInterval(tickRef.current)
    tickRef.current = setInterval(() => {
      setClenchHeld(h => {
        const next = Math.min(1, h + 0.1 / CLENCH_S)
        if (next >= 1) {
          clearInterval(tickRef.current)
          setHolding(false)
          setPhase('release')
          setReleaseLeft(RELEASE_S)
        }
        return next
      })
    }, 100)
  }
  const stopHold = () => {
    if (phase !== 'clench') return
    setHolding(false)
    if (tickRef.current) clearInterval(tickRef.current)
  }

  useEffect(() => {
    if (phase !== 'release') return
    const id = setInterval(() => {
      setReleaseLeft(s => {
        if (s <= 1) {
          clearInterval(id)
          if (round + 1 >= ROUNDS) {
            setDone(true)
            setTimeout(onDone, 900)
          } else {
            setRound(r => r + 1)
            setClenchHeld(0)
            setPhase('clench')
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase, round])

  useEffect(() => () => { if (tickRef.current) clearInterval(tickRef.current) }, [])

  const clenchScale = 1 - clenchHeld * 0.4
  const releaseT = (RELEASE_S - releaseLeft) / RELEASE_S
  const releaseScale = 0.6 + releaseT * 0.5
  const scale = done ? 1.1 : phase === 'clench' ? clenchScale : releaseScale
  const isClench = phase === 'clench'

  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} &middot; Unclench</p>
      <p style={styles.bodyTitle}>
        {done ? 'Loosened.' : isClench ? 'Press and hold. Tense everything.' : 'Now let go. Completely.'}
      </p>
      <p style={styles.subtle}>
        {done ? 'Your body remembers how to let go.'
          : isClench ? `Round ${round + 1} of ${ROUNDS} \u2014 squeeze while you hold.`
          : 'Soften your hands, your jaw, your shoulders.'}
      </p>

      <div
        style={styles.clenchArea}
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
      >
        <div style={{
          ...styles.clenchBlob,
          transform: `scale(${scale})`,
          background: isClench
            ? `radial-gradient(circle, rgba(197,87,44,${0.22 + clenchHeld * 0.5}) 0%, rgba(197,87,44,0.10) 100%)`
            : 'radial-gradient(circle, rgba(122,140,90,0.32) 0%, rgba(122,140,90,0.12) 100%)',
          borderColor: isClench ? 'rgba(197,87,44,0.5)' : 'rgba(122,140,90,0.55)',
        }} />
      </div>

      <div style={styles.roundDots}>
        {Array.from({ length: ROUNDS }).map((_, i) => (
          <div key={i} style={{
            ...styles.roundDot,
            ...(i < round || done ? styles.roundDotDone : {}),
            ...(i === round && !done ? styles.roundDotActive : {}),
          }} />
        ))}
      </div>

      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
    </div>
  )
}

// ────────── 5. SLOW CIRCLES (drag to fill) ──────────
function CirclesTechnique({ stepNum, total, onDone, onSkip }) {
  const TARGET = 3600
  const [progress, setProgress] = useState(0)
  const [dot, setDot] = useState(null)
  const [done, setDone] = useState(false)
  const lastRef = useRef(null)
  const accRef = useRef(0)
  const areaRef = useRef(null)

  const move = (e) => {
    if (done) return
    const rect = areaRef.current && areaRef.current.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setDot({ x, y })
    if (lastRef.current) {
      const dx = x - lastRef.current.x
      const dy = y - lastRef.current.y
      const d = Math.min(28, Math.sqrt(dx * dx + dy * dy))
      accRef.current += d
      const p = Math.min(1, accRef.current / TARGET)
      setProgress(p)
      if (p >= 1) {
        setDone(true)
        setTimeout(onDone, 900)
      }
    }
    lastRef.current = { x, y }
  }
  const end = () => { lastRef.current = null; setDot(null) }

  const R = 60
  const C = 2 * Math.PI * R

  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} &middot; Slow circles</p>
      <p style={styles.bodyTitle}>Trace slow circles.</p>
      <p style={styles.subtle}>Keep your finger moving, gently. Fill the ring.</p>

      <div
        ref={areaRef}
        style={styles.circleArea}
        onPointerDown={(e) => { lastRef.current = null; move(e) }}
        onPointerMove={(e) => { if (e.buttons || e.pressure > 0) move(e) }}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
      >
        <svg width="170" height="170" viewBox="0 0 160 160" style={{ pointerEvents: 'none' }}>
          <circle cx="80" cy="80" r={R} fill="none" stroke="#E8DFD0" strokeWidth="8" />
          <circle
            cx="80" cy="80" r={R} fill="none" stroke="#7A8C5A" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - progress)}
            transform="rotate(-90 80 80)" style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
          <text x="80" y="87" textAnchor="middle" fontFamily="Georgia, serif" fontSize="20" fill="#2A1F15">
            {Math.round(progress * 100)}%
          </text>
        </svg>
        {dot && <div style={{ ...styles.circleDot, left: dot.x, top: dot.y }} />}
      </div>

      <p style={styles.subtle}>{done ? 'Settled.' : 'Slow is the point.'}</p>
      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
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

// ────────── 6. REACH OUT — with anchors integration ──────────
function ReachOutTechnique({ stepNum, total, onDone }) {
  const [anchors, setAnchors] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    async function loadAnchors() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('anchors')
        .select('*')
        .eq('user_id', user.id)
        .order('position')
      setAnchors(data || [])
      setLoading(false)
    }
    loadAnchors()
  }, [])

  const handleCall = (anchor) => {
    window.location.href = `tel:${anchor.phone}`
  }

  const handleWhatsApp = (anchor) => {
    const cleanPhone = anchor.phone.replace(/\D/g, '')
    const body = encodeURIComponent(URGE_MESSAGE)
    window.open(`https://wa.me/${cleanPhone}?text=${body}`, '_blank')
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Reach out</p>
      <div style={styles.softIcon}>⚓</div>
      <h3 style={styles.bigTitle}>You don't have to do this alone.</h3>
      <p style={styles.body}>
        Reach out to an anchor.<br/>
        You don't have to explain. Just hearing a voice helps.
      </p>

      {loading ? (
        <p style={{...styles.subtle, marginTop: '1rem'}}>Loading...</p>
      ) : anchors.length === 0 ? (
        <div style={styles.anchorsEmptyBox}>
          <p style={styles.anchorsEmptyText}>
            No anchors set up yet.
          </p>
          <p style={styles.anchorsEmptySubtle}>
            After this urge passes, add 1-3 trusted people in the Anchors tab. They'll be here next time.
          </p>
        </div>
      ) : (
        <div style={styles.anchorsListUrge}>
          {anchors.map(anchor => {
            const rel = RELATIONSHIPS.find(r => r.value === anchor.relationship) || RELATIONSHIPS[7]
            const isExpanded = expandedId === anchor.id
            const hasWhy = !!anchor.why_note

            return (
              <div key={anchor.id} style={styles.anchorCardUrge}>
                <div style={styles.anchorCardHead}>
                  <div style={styles.anchorRowAvatar}>
                    {anchor.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.anchorRowInfo}>
                    <p style={styles.anchorRowName}>
                      {anchor.name}
                      <span style={styles.anchorRelBadge}>{rel.icon} {rel.label}</span>
                    </p>
                    <p style={styles.anchorRowPhone}>{anchor.phone}</p>
                  </div>
                </div>

                {hasWhy && (
                  <button
                    onClick={() => toggleExpand(anchor.id)}
                    style={styles.whyToggle}
                  >
                    {isExpanded ? '▾ Hide why' : '▸ Why they matter'}
                  </button>
                )}

                {isExpanded && hasWhy && (
                  <div style={styles.whyExpanded}>
                    <span style={styles.whyExpandedQuote}>"</span>
                    <p style={styles.whyExpandedText}>{anchor.why_note}</p>
                  </div>
                )}

                <div style={styles.anchorActions}>
                  <button
                    onClick={() => handleCall(anchor)}
                    style={styles.callBtn}
                  >
                    <span style={{fontSize: '17px'}}>📞</span>
                    <span>Call</span>
                  </button>
                  <button
                    onClick={() => handleWhatsApp(anchor)}
                    style={styles.msgBtn}
                  >
                    <span style={{fontSize: '17px'}}>💬</span>
                    <span>Message</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

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

// ────────── FEEDBACK ──────────
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
  // ---- revamped interactive urge-breakers (dissolve / wipe / pulse) ----
  dissolveArea: { position: 'relative', width: '280px', height: '300px', margin: '0.5rem auto 0.75rem', borderRadius: '20px', background: 'radial-gradient(circle at 50% 55%, rgba(197,87,44,0.06), rgba(250,247,241,0))', touchAction: 'none', cursor: 'pointer' },
  mote: { position: 'absolute', width: '36px', height: '36px', marginLeft: '-18px', marginTop: '-18px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(222,158,98,0.95) 0%, rgba(197,87,44,0.5) 55%, rgba(197,87,44,0) 76%)', transition: 'opacity 0.45s, transform 0.45s', pointerEvents: 'none' },
  moteGone: { opacity: 0, transform: 'scale(2)' },
  wipeArea: { position: 'relative', width: '280px', height: '170px', margin: '0.75rem auto', borderRadius: '16px', overflow: 'hidden', touchAction: 'none', cursor: 'pointer', border: '0.5px solid #E8DFD0' },
  wipeRevealText: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1.5rem', fontFamily: 'Georgia, serif', fontSize: '19px', fontStyle: 'italic', color: '#2A1F15' },
  wipeGrid: { position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', pointerEvents: 'none' },
  wipeCell: { background: 'linear-gradient(135deg, #EDE4D4, #E1D5BF)', transition: 'opacity 0.3s' },
  wipeCellGone: { opacity: 0 },
  pulseArea: { width: '220px', height: '220px', margin: '0.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none', cursor: 'pointer' },
  pulseCore: { width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(122,140,90,0.9) 0%, rgba(122,140,90,0.28) 70%)', transition: 'transform 0.06s linear' },

  // ---- new interactive urge-breakers (wave / unclench / circles) ----
  waveArea: {
    width: '200px', height: '200px', position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0.5rem 0', touchAction: 'none', userSelect: 'none', cursor: 'pointer',
  },
  waveOrb: {
    width: '110px', height: '110px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(70,130,150,0.40) 0%, rgba(70,130,150,0.15) 100%)',
    border: '2px solid rgba(70,130,150,0.5)',
    transition: 'transform 0.2s ease-out, opacity 0.2s', pointerEvents: 'none',
  },
  waveRing: {
    position: 'absolute', width: '184px', height: '184px', borderRadius: '50%',
    border: '1px dashed #CFC2AC', opacity: 0.6, transition: 'all 0.2s', pointerEvents: 'none',
  },
  waveRingOn: { borderColor: 'rgba(70,130,150,0.55)', opacity: 1 },
  wavePhase: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: '0.5rem 0 0.75rem' },
  waveBarBg: { width: '100%', maxWidth: '240px', height: '6px', background: '#F4ECDD', borderRadius: '3px', overflow: 'hidden', margin: '0 auto' },
  waveBarFill: { height: '100%', background: 'linear-gradient(90deg, #6FA3B5 0%, #4E8597 100%)', borderRadius: '3px', transition: 'width 0.1s linear' },

  clenchArea: {
    width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0.5rem 0', touchAction: 'none', userSelect: 'none', cursor: 'pointer',
  },
  clenchBlob: {
    width: '130px', height: '130px',
    borderRadius: '46% 54% 52% 48% / 50% 46% 54% 50%',
    border: '2px solid rgba(197,87,44,0.5)',
    transition: 'transform 0.15s ease-out, background 0.3s, border-color 0.3s', pointerEvents: 'none',
  },
  roundDots: { display: 'flex', gap: '8px', marginTop: '1.25rem' },
  roundDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#E0D5C2', transition: 'all 0.2s' },
  roundDotActive: { background: '#C5572C' },
  roundDotDone: { background: '#7A8C5A' },

  circleArea: {
    width: '220px', height: '220px', position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0.5rem 0', touchAction: 'none', userSelect: 'none', cursor: 'crosshair',
  },
  circleDot: {
    position: 'absolute', width: '18px', height: '18px', borderRadius: '50%',
    background: '#7A8C5A', transform: 'translate(-50%, -50%)', pointerEvents: 'none',
    boxShadow: '0 0 0 4px rgba(122,140,90,0.25)',
  },

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
    fontSize: '14px', color: '#2A1F15',
    margin: '0.5rem 0 0.25rem',
    fontFamily: 'Georgia, serif', lineHeight: 1.4,
  },
  meterMilestoneText: {
    fontSize: '13px', color: '#854F0B',
    margin: '0 0 0.5rem', fontWeight: 500,
    fontFamily: 'Georgia, serif',
  },
  meterMotivation: {
    fontSize: '12px', color: '#9C8C78',
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
    padding: '11px 28px', borderRadius: '999px',
    fontSize: '13px', fontWeight: 500,
    border: 'none', cursor: 'pointer',
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
  // ANCHORS in urge flow
  anchorsListUrge: {
    display: 'flex', flexDirection: 'column', gap: '10px',
    width: '100%', boxSizing: 'border-box',
    margin: '1rem 0 0',
  },
  anchorCardUrge: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '12px',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  anchorCardHead: {
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%',
  },
  anchorRowAvatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'linear-gradient(180deg, #C5572C 0%, #A8431F 100%)',
    color: '#FAF7F1',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: 500, fontFamily: 'Georgia, serif',
    flexShrink: 0,
  },
  anchorRowInfo: { flex: 1, minWidth: 0, textAlign: 'left' },
  anchorRowName: {
    fontSize: '14px', fontWeight: 500, color: '#2A1F15',
    margin: 0, fontFamily: 'Georgia, serif',
    display: 'flex', alignItems: 'center', gap: '6px',
    flexWrap: 'wrap',
  },
  anchorRelBadge: {
    fontSize: '10px',
    background: '#F4ECDD',
    color: '#854F0B',
    padding: '1px 8px',
    borderRadius: '999px',
    fontWeight: 500,
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    fontStyle: 'normal',
  },
  anchorRowPhone: {
    fontSize: '11px', color: '#6B5C4A',
    margin: '2px 0 0',
    fontVariantNumeric: 'tabular-nums',
  },
  whyToggle: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '11px',
    cursor: 'pointer', fontFamily: 'inherit',
    fontWeight: 500, padding: '8px 0 4px',
    width: '100%', textAlign: 'left',
    fontStyle: 'italic',
  },
  whyExpanded: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E8DCC2',
    borderRadius: '10px',
    padding: '10px 12px',
    margin: '6px 0 8px',
    display: 'flex', alignItems: 'flex-start', gap: '6px',
  },
  whyExpandedQuote: {
    fontSize: '20px',
    color: '#C5572C',
    lineHeight: 0.8,
    fontWeight: 700,
    fontFamily: 'Georgia, serif',
    opacity: 0.55,
    flexShrink: 0,
  },
  whyExpandedText: {
    fontSize: '12px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.5,
    margin: 0,
    flex: 1,
    textAlign: 'left',
  },
  anchorActions: {
    display: 'flex', gap: '8px', marginTop: '10px',
  },
  callBtn: {
    flex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '10px',
    background: 'linear-gradient(180deg, #7A8C5A 0%, #5A6B45 100%)',
    color: 'white',
    border: 'none', borderRadius: '12px',
    fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 3px 10px rgba(122,140,90,0.3)',
  },
  msgBtn: {
    flex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '10px',
    background: 'linear-gradient(180deg, #25D366 0%, #1da955 100%)',
    color: 'white',
    border: 'none', borderRadius: '12px',
    fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 3px 10px rgba(37,211,102,0.3)',
  },
  anchorsEmptyBox: {
    background: '#F4ECDD',
    border: '0.5px dashed #C9B894',
    borderRadius: '12px', padding: '16px',
    margin: '1rem 0 0', width: '100%', boxSizing: 'border-box',
  },
  anchorsEmptyText: {
    fontSize: '13px', color: '#2A1F15',
    margin: '0 0 4px', fontWeight: 500,
    fontFamily: 'Georgia, serif',
  },
  anchorsEmptySubtle: {
    fontSize: '11px', color: '#854F0B',
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