import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useLang } from '../LanguageContext'
import { supabase } from '../supabaseClient'

const SPIKE_TECHNIQUES = [
  { id: 'breath', name: 'The arch', duration: 90 },
  { id: 'tap', name: 'The constellation', duration: 30 },
  { id: 'dissolve', name: 'The sand garden', duration: 0 },
  { id: 'wipe', name: 'Reveal the canvas', duration: 0 },
  { id: 'pulse', name: 'The pendulum', duration: 0 },
  { id: 'unclench', name: 'Unclench', duration: 0 },
  { id: 'circles', name: 'Trace the path', duration: 0 },
  { id: 'senses', name: '5-4-3-2-1', duration: 0 },
  { id: 'why', name: 'The vault', duration: 0 },
  { id: 'reach', name: 'Reach out', duration: 0 },
]

// Slow-creep track — calmer and diagnostic. A creep is depletion, not a surge,
// so distraction games patronize it. These name the deficit and redirect.
const CREEP_TECHNIQUES = [
  { id: 'halt',           name: 'Name what is low', duration: 0 },
  { id: 'change_channel', name: 'Change the channel', duration: 0 },
  { id: 'deploy_defense', name: 'Deploy a defense', duration: 0 },
  { id: 'why',            name: 'The vault', duration: 0 },
  { id: 'reach',          name: 'Reach out', duration: 0 },
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

// Grounding rationale pinned under every technique — turns a toy into a tool.
function WhyFooter({ text }) {
  return <p style={styles.whyFooter}>Why this works — {text}</p>
}

// Works two ways: as a routed screen (/app/urge/:trackerId) or embedded
// in a floating card (pass trackerId + onExit props). Every path that
// used to navigate home now goes through exit().
export default function UrgeFlow({ trackerId: trackerIdProp = null, onExit = null } = {}) {
  const { trackerId: trackerIdParam } = useParams()
  const trackerId = trackerIdProp || trackerIdParam
  const navigate = useNavigate()
  const location = useLocation()
  const exit = () => { if (onExit) onExit(); else navigate('/app/home') }
  const { t } = useLang()

  const initialVelocity = (location.state && location.state.velocity) || null
  const [velocity, setVelocity] = useState(initialVelocity)
  const [step, setStep] = useState(initialVelocity ? 'intro' : 'velocity')
  const [techniqueIdx, setTechniqueIdx] = useState(0)
  const [tracker, setTracker] = useState(null)
  const [profileBio, setProfileBio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [feedbackIntensity, setFeedbackIntensity] = useState(null)
  const [feedbackTriggers, setFeedbackTriggers] = useState([])
  const [passedTechnique, setPassedTechnique] = useState(null)
  const [saving, setSaving] = useState(false)
  const startedRef = useRef(Date.now())

  const techniques = velocity === 'creep' ? CREEP_TECHNIQUES : SPIKE_TECHNIQUES

  const chooseVelocity = (v) => {
    setVelocity(v)
    setStep('intro')
  }

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: trackerData } = await supabase
          .from('trackers')
          .select('*, addiction_types(name, icon)')
          .eq('id', trackerId)
          .single()
        if (!trackerData) { exit(); return }
        setTracker(trackerData)

        const { data: profile } = await supabase
          .from('profiles')
          .select('bio')
          .eq('id', user.id)
          .single()
        setProfileBio(profile?.bio || null)
      } catch (err) {
        exit()
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
        triggers: feedbackTriggers,
        notes: passed ? 'Rode out the urge' : 'Worked through the techniques',
        resisted: true,
        duration_seconds: elapsed,
        technique_used: passed ? passedTechnique : null,
        technique_helped: passed ? true : false,
      })
      exit()
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
    setPassedTechnique(techniques[techniqueIdx]?.id ?? null)
    setStep('feedback')
  }
  const onUrgeStillHere = () => {
    if (techniqueIdx < techniques.length - 1) {
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
        {step === 'velocity' && <VelocityPicker onChoose={chooseVelocity} onCancel={() => exit()} />}
        {step === 'intro' && <Intro tracker={tracker} onStart={startTechniques} onCancel={() => exit()} />}
        {step === 'technique' && (
          <Technique
            technique={techniques[techniqueIdx]}
            techniqueIdx={techniqueIdx}
            total={techniques.length}
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
            triggers={feedbackTriggers}
            setTriggers={setFeedbackTriggers}
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

      <p style={styles.subtle}>A few short steps, one at a time. No thinking required.</p>
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
    <svg viewBox="0 0 180 100" style={{ width: '180px', height: '100px', display: 'block', margin: '0 auto' }}>
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
// ────────── VELOCITY PICKER (when not pre-tagged from the home) ──────────
function VelocityPicker({ onChoose, onCancel }) {
  return (
    <div style={styles.center}>
      <div style={styles.softIcon}>🌊</div>
      <h2 style={styles.bigTitle}>What kind of urge is this?</h2>
      <p style={styles.body}>Naming how it is coming at you changes what actually helps.</p>
      <div style={styles.velocityPickRow}>
        <button onClick={() => onChoose('spike')} style={styles.velocityPickBtn}>
          <span style={styles.velocityPickIcon}>⚡</span>
          <span style={styles.velocityPickLabel}>Sudden spike</span>
          <span style={styles.velocityPickSub}>A trigger hit. It came on fast and strong.</span>
        </button>
        <button onClick={() => onChoose('creep')} style={styles.velocityPickBtn}>
          <span style={styles.velocityPickIcon}>🌫️</span>
          <span style={styles.velocityPickLabel}>Slow creep</span>
          <span style={styles.velocityPickSub}>Worn down. It has been building all evening.</span>
        </button>
      </div>
      <button onClick={onCancel} style={{ ...styles.btn, ...styles.btnSecondary }}>Not now</button>
    </div>
  )
}

// ────────── CREEP: HALT (name the deficit, then several fixes for it) ──────────
const HALT_OPTIONS = [
  { key: 'hungry', label: 'Hungry', icon: '🍽️', fixes: [
    "Eat something with protein or fat — skip the sugar.",
    "Drink a full glass of water first. Thirst fakes a craving.",
    "Low blood sugar feels like needing something. Usually it is just food.",
  ] },
  { key: 'angry', label: 'Angry', icon: '🔥', fixes: [
    "Name what you are actually angry about — out loud or on paper.",
    "Move it out of your body: a brisk walk, push-ups, shake it off.",
    "Make no decisions for 20 minutes. Anger is a bad advisor.",
  ] },
  { key: 'lonely', label: 'Lonely', icon: '🫂', fixes: [
    "Text one person right now — even just a hello.",
    "Put yourself near other people: a café, a call, a walk.",
    "Loneliness wants you alone with the urge. Do not allow it.",
  ] },
  { key: 'tired', label: 'Tired', icon: '🌙', fixes: [
    "Lie down for 20 minutes. This is the big one for slow creeps.",
    "Lower the lights and the noise. Stop asking your brain to perform.",
    "Half the time the creep is just exhaustion wearing your name.",
  ] },
  { key: 'bored', label: 'Bored', icon: '🪟', fixes: [
    "Change rooms. A creep needs a still, empty setting.",
    "Start one tiny task — two dishes, one tidy surface.",
    "Boredom is the creep's favorite weather. Break the stillness.",
  ] },
]

function HALTTechnique({ stepNum, total, onDone, onSkip }) {
  const [picked, setPicked] = useState(null)
  const opt = HALT_OPTIONS.find(o => o.key === picked)
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Name what is low</p>
      <h2 style={styles.bigTitle}>This usually is not the substance.</h2>
      <p style={styles.body}>A slow creep is almost always one of these underneath. Which is loudest right now?</p>
      <div style={styles.haltGrid}>
        {HALT_OPTIONS.map(o => (
          <button key={o.key} onClick={() => setPicked(o.key)}
            style={{ ...styles.haltCell, ...(picked === o.key ? styles.haltCellOn : {}) }}>
            <span style={styles.haltIcon}>{o.icon}</span>
            <span style={{ ...styles.haltLabel, ...(picked === o.key ? styles.haltLabelOn : {}) }}>{o.label}</span>
          </button>
        ))}
      </div>
      {opt && (
        <div style={styles.haltFixes}>
          {opt.fixes.map((f, i) => (
            <div key={i} style={styles.haltFixRow}>
              <span style={styles.haltFixDot}>·</span>
              <span style={styles.haltFixText}>{f}</span>
            </div>
          ))}
        </div>
      )}
      <div style={styles.actions}>
        <button onClick={onSkip} style={{ ...styles.btn, ...styles.btnSecondary }}>Skip</button>
        <button onClick={onDone} disabled={!picked}
          style={{ ...styles.btn, ...styles.btnPrimary, ...(!picked ? { opacity: 0.45 } : {}) }}>
          {picked ? 'Next' : 'Pick one'}
        </button>
      </div>
      <WhyFooter text="A slow creep is usually an unmet need, not a true craving. Name it and you can meet it directly." />
    </div>
  )
}

// ────────── CREEP: CHANGE THE CHANNEL (one of many, per entry) ──────────
const CHANGE_CHANNEL = [
  "Step outside for two minutes — even just the doorway.",
  "Move to a different room and stay there a while.",
  "Splash cold water on your face. Wake the system up.",
  "Put on one song and decide nothing until it ends.",
  "Make a hot drink. The ritual matters more than the drink.",
  "Tidy one small surface near you — just one.",
  "Open a window and look at something far away.",
  "Stretch for sixty seconds. Reach for the ceiling.",
  "Take the trash out. A pointless errand resets the room.",
  "Wash two dishes. Not all of them — just two.",
  "Change the lighting. Lamp on, overhead off.",
  "Walk to the farthest point in your home and back.",
  "Change your shirt. A small physical reset.",
  "Close the app or tab that pulled you here.",
  "Find five things moving outside a window.",
]

function ChangeChannelTechnique({ stepNum, total, onDone, onSkip }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * CHANGE_CHANNEL.length))
  const another = () => setIdx(i => (i + 1) % CHANGE_CHANNEL.length)
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Change the channel</p>
      <h2 style={styles.bigTitle}>Break the setting.</h2>
      <p style={styles.body}>A creep needs a still, unchanging room. Move, and it loses its grip. One thing, right now:</p>
      <div style={styles.suggestCard}>
        <p style={styles.suggestText}>{CHANGE_CHANNEL[idx]}</p>
      </div>
      <button onClick={another} style={styles.suggestAnother}>Show me another ›</button>
      <div style={styles.actions}>
        <button onClick={onSkip} style={{ ...styles.btn, ...styles.btnSecondary }}>Skip</button>
        <button onClick={onDone} style={{ ...styles.btn, ...styles.btnPrimary }}>Done</button>
      </div>
      <WhyFooter text="Breaking your physical setting disrupts the cue-conditioned loop that drives the creep." />
    </div>
  )
}

// ────────── CREEP: DEPLOY A DEFENSE (one of many, per entry) ──────────
const DEPLOY_DEFENSE = [
  "Decide your next hour out loud, right now. Name the one thing you will do.",
  "Put the cue physically out of reach before you sit back down.",
  "Text someone that you will check in with them in an hour.",
  "Set a 30-minute timer. Promise to reassess only when it rings.",
  "Eat or drink something before you do anything else.",
  "Put your shoes on. Just the shoes. Then decide.",
  "Write the urge down with the time next to it. Watch it age.",
  "Pick tomorrow-you over tonight-you for this one decision.",
  "Leave the spot where this usually happens.",
  "Say the real cost out loud: what does giving in actually buy tonight?",
]

function DeployDefenseTechnique({ stepNum, total, onDone, onSkip }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * DEPLOY_DEFENSE.length))
  const another = () => setIdx(i => (i + 1) % DEPLOY_DEFENSE.length)
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Deploy a defense</p>
      <h2 style={styles.bigTitle}>Set up the next hour.</h2>
      <p style={styles.body}>A defense is one small move that makes the hour ahead safer. Try this:</p>
      <div style={styles.suggestCard}>
        <p style={styles.suggestText}>{DEPLOY_DEFENSE[idx]}</p>
      </div>
      <button onClick={another} style={styles.suggestAnother}>Show me another ›</button>
      <div style={styles.actions}>
        <button onClick={onSkip} style={{ ...styles.btn, ...styles.btnSecondary }}>Skip</button>
        <button onClick={onDone} style={{ ...styles.btn, ...styles.btnPrimary }}>Done</button>
      </div>
      <WhyFooter text="Pre-deciding the next hour removes the in-the-moment decision the urge is trying to win." />
    </div>
  )
}

function Technique({ technique, techniqueIdx, total, profileBio, onDone, onSkip }) {
  const stepNum = techniqueIdx + 1

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
  if (technique.id === 'halt') return <HALTTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'change_channel') return <ChangeChannelTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'deploy_defense') return <DeployDefenseTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  return null
}

// ────────── 1. THE ARCH (structured breathing) ──────────
function BreathTechnique({ stepNum, total, onDone, onSkip }) {
  const [phase, setPhase] = useState('in')
  const [secondsLeft, setSecondsLeft] = useState(90)
  useEffect(() => {
    const phases = ['in', 'hold1', 'out', 'hold2']
    let phaseIdx = 0
    const phaseTimer = setInterval(() => { phaseIdx = (phaseIdx + 1) % 4; setPhase(phases[phaseIdx]) }, 4000)
    const countdown = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(countdown); clearInterval(phaseTimer); setTimeout(onDone, 500); return 0 }
        return s - 1
      })
    }, 1000)
    return () => { clearInterval(phaseTimer); clearInterval(countdown) }
  }, [])
  const phaseLabel = { in: 'Breathe in', hold1: 'Hold', out: 'Breathe out', hold2: 'Hold' }[phase]
  const scaleY = (phase === 'in' || phase === 'hold1') ? 1 : 0.45
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · The arch</p>
      <div style={styles.stageDark}>
        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', display: 'block' }}>
          <g style={{ transform: `scaleY(${scaleY})`, transformOrigin: '100px 178px', transition: 'transform 4s cubic-bezier(0.4,0,0.2,1)' }}>
            <path d="M 48 178 L 48 96 A 52 52 0 0 1 152 96 L 152 178" fill="none" stroke="#D9B57A" strokeWidth="10" strokeLinecap="round" opacity="0.12" />
            <path d="M 48 178 L 48 96 A 52 52 0 0 1 152 96 L 152 178" fill="none" stroke="#D9B57A" strokeWidth="2.5" strokeLinecap="round" opacity="0.92" />
          </g>
          <text x="100" y="150" textAnchor="middle" fontFamily="Georgia, serif" fontSize="15" fill="#F4ECDD" opacity="0.9">{phaseLabel}</text>
        </svg>
      </div>
      <p style={styles.timerText}>{secondsLeft}s</p>
      <button onClick={onSkip} style={styles.skipText}>Skip this one</button>
      <WhyFooter text="Deep, structured breathing pulls the nervous system out of fight-or-flight." />
    </div>
  )
}

// ────────── 2. THE CONSTELLATION (spatial attention) ──────────
function TapTechnique({ stepNum, total, onDone, onSkip }) {
  const NEED = 5
  const [placed, setPlaced] = useState([])
  const [current, setCurrent] = useState({ x: 50, y: 34 })
  const [done, setDone] = useState(false)
  const randPoint = (prev) => {
    let pt, guard = 0
    do { pt = { x: 16 + Math.random() * 68, y: 18 + Math.random() * 62 }; guard++ }
    while (prev && Math.hypot(pt.x - prev.x, pt.y - prev.y) < 22 && guard < 20)
    return pt
  }
  const tapStar = () => {
    if (done) return
    const next = [...placed, current]
    setPlaced(next)
    if (next.length >= NEED) { setDone(true); setTimeout(onDone, 900) }
    else setCurrent(randPoint(current))
  }
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · The constellation</p>
      <p style={styles.bodyTitle}>{done ? 'There it is.' : 'Connect the stars.'}</p>
      <p style={styles.subtle}>{done ? 'Drawn, one quiet point at a time.' : 'Tap each star as it appears. No rush.'}</p>
      <div style={styles.stageDark}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {placed.length > 1 && (
            <polyline points={placed.map(pt => `${pt.x},${pt.y}`).join(' ')} fill="none" stroke="#D9B57A" strokeWidth="0.4" opacity="0.7" />
          )}
          {placed.map((pt, i) => <circle key={i} cx={pt.x} cy={pt.y} r="1.3" fill="#D9B57A" />)}
        </svg>
        {!done && (
          <button onClick={tapStar} aria-label="Star" style={{
            position: 'absolute', left: current.x + '%', top: current.y + '%',
            width: '32px', height: '32px', marginLeft: '-16px', marginTop: '-16px',
            borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer',
            background: 'radial-gradient(circle, rgba(217,181,122,0.95) 0%, rgba(217,181,122,0.35) 35%, rgba(217,181,122,0) 70%)',
          }} />
        )}
      </div>
      <div style={styles.roundDots}>
        {Array.from({ length: NEED }).map((_, i) => (
          <div key={i} style={{ ...styles.roundDot, ...(i < placed.length ? styles.roundDotDone : {}) }} />
        ))}
      </div>
      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
      <WhyFooter text="Engaging spatial attention interrupts the obsessive thought loop of a craving." />
    </div>
  )
}

// ────────── 3. THE SAND GARDEN (slow, deliberate movement) ──────────
function DissolveTechnique({ stepNum, total, onDone, onSkip }) {
  const areaRef = useRef(null)
  const [tines, setTines] = useState([[], [], []])
  const [coverage, setCoverage] = useState(0)
  const [done, setDone] = useState(false)
  const lastRef = useRef(null)
  const cellsRef = useRef(new Set())
  const COLS = 9, ROWS = 7
  const NEED = 0.6
  const OFF = 3.2
  const toPct = (cx, cy) => {
    const r = areaRef.current.getBoundingClientRect()
    return { x: ((cx - r.left) / r.width) * 100, y: ((cy - r.top) / r.height) * 100 }
  }
  const rakeAt = (cx, cy) => {
    if (done) return
    const pos = toPct(cx, cy)
    const gx = Math.min(COLS - 1, Math.max(0, Math.floor((pos.x / 100) * COLS)))
    const gy = Math.min(ROWS - 1, Math.max(0, Math.floor((pos.y / 100) * ROWS)))
    cellsRef.current.add(gy * COLS + gx)
    const cov = cellsRef.current.size / (COLS * ROWS)
    setCoverage(cov)
    const last = lastRef.current
    if (last) {
      const dx = pos.x - last.x, dy = pos.y - last.y
      const len = Math.hypot(dx, dy) || 1
      if (len > 0.6) {
        const px = -dy / len, py = dx / len
        setTines(prev => prev.map((arr, k) => {
          const o = (k - 1) * OFF
          return [...arr, { x: pos.x + px * o, y: pos.y + py * o }]
        }))
        lastRef.current = pos
      }
    } else {
      lastRef.current = pos
    }
    if (cov >= NEED && !done) { setDone(true); setTimeout(onDone, 800) }
  }
  const onDown = (e) => { lastRef.current = null; rakeAt(e.clientX, e.clientY) }
  const onMove = (e) => { if (e.buttons || e.pressure > 0) rakeAt(e.clientX, e.clientY) }
  const onUp = () => { lastRef.current = null }
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · The sand garden</p>
      <p style={styles.bodyTitle}>{done ? 'The garden is calm.' : 'Rake the sand.'}</p>
      <p style={styles.subtle}>{done ? 'Every groove drawn by your own hand.' : 'Drag slowly to comb the sand around the stone. Cover the whole bed.'}</p>
      <div ref={areaRef} style={styles.stageClay} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} onPointerCancel={onUp}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <ellipse cx="50" cy="50" rx="9" ry="7" fill="#B9A47C" opacity="0.6" />
          <ellipse cx="50" cy="48.5" rx="6.5" ry="4.5" fill="#CDBB95" opacity="0.5" />
          {tines.map((arr, k) => arr.length > 1 ? (
            <polyline key={k} points={arr.map(pt => `${pt.x},${pt.y}`).join(' ')} fill="none" stroke="#C2923F" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          ) : null)}
        </svg>
      </div>
      <div style={{ width: '180px', height: '4px', borderRadius: '2px', background: '#E8DFD0', margin: '0.25rem auto 0', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: Math.min(100, Math.round((coverage / NEED) * 100)) + '%', background: 'linear-gradient(90deg, #D9B57A, #B89456)', transition: 'width 0.15s' }} />
      </div>
      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
      <WhyFooter text="Slow, deliberate physical movement grounds the body in the present moment." />
    </div>
  )
}

// ────────── 4. REVEAL THE CANVAS (tactile reveal) ──────────
const REVEAL_LINES = [
  'This is already passing.',
  'The wave always breaks. So will this one.',
  'You have outlasted every urge before this.',
  'The feeling is loud. It is not in charge.',
  'You are not the urge. You are the one watching it.',
  'It peaks, then it fades. Always.',
  'Right now is the hardest part. It gets easier from here.',
  'You do not have to fight it. Just outlast it.',
  'Breathe. The intensity is already dropping.',
  'This moment is temporary. Your streak is not.',
  'You have made it through worse than this.',
  'The craving wants you to believe it is forever. It is not.',
  'Stay here a moment longer. It is loosening.',
  'One more minute. Then one more. That is all this takes.',
  'The urge is a visitor, not a resident.',
  'You are stronger than a passing thought.',
  'Tomorrow-you is already grateful.',
  'Let it rise and fall without you. It will.',
  'Nothing in the next ten minutes is permanent, except waiting.',
  'Soft. Slow. This ends on its own.',
]

function WipeTechnique({ stepNum, total, onDone, onSkip }) {
  const COLS = 7, ROWS = 5
  const TOTAL = COLS * ROWS
  const NEED = Math.round(TOTAL * 0.8)
  const areaRef = useRef(null)
  const [cleared, setCleared] = useState(() => new Set())
  const [done, setDone] = useState(false)
  const [line] = useState(() => REVEAL_LINES[Math.floor(Math.random() * REVEAL_LINES.length)])
  const clearAt = (cx, cy) => {
    const rect = areaRef.current && areaRef.current.getBoundingClientRect()
    if (!rect) return
    const gx = Math.floor(((cx - rect.left) / rect.width) * COLS)
    const gy = Math.floor(((cy - rect.top) / rect.height) * ROWS)
    if (gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS) return
    const idx = gy * COLS + gx
    setCleared(prev => {
      if (prev.has(idx)) return prev
      const next = new Set(prev); next.add(idx)
      if (!done && next.size >= NEED) { setDone(true); setTimeout(onDone, 1100) }
      return next
    })
  }
  const onMove = (e) => { if (e.buttons || e.pressure > 0) clearAt(e.clientX, e.clientY) }
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Reveal the canvas</p>
      <p style={styles.bodyTitle}>Clear the dark.</p>
      <p style={styles.subtle}>Wipe slowly across. There is something underneath.</p>
      <div ref={areaRef} style={{ ...styles.stageClay, cursor: 'pointer' }} onPointerDown={(e) => clearAt(e.clientX, e.clientY)} onPointerMove={onMove}>
        <div style={styles.revealText}>{line}</div>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', pointerEvents: 'none' }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} style={{ background: 'linear-gradient(135deg, #3A2A1C, #241710)', opacity: cleared.has(i) || done ? 0 : 1, transition: 'opacity 0.45s' }} />
          ))}
        </div>
      </div>
      <p style={styles.subtle}>{done ? 'Clear.' : 'Keep going.'}</p>
      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
      <WhyFooter text="Slow, repetitive touch quiets the brain alarm centers and restores focus." />
    </div>
  )
}

// ────────── 5. THE PENDULUM (entrain a slowing rhythm) ──────────
function PulseTechnique({ stepNum, total, onDone, onSkip }) {
  const NEED = 4
  const [hits, setHits] = useState(0)
  const [angle, setAngle] = useState(0)
  const [flash, setFlash] = useState(false)
  const [done, setDone] = useState(false)
  const periodRef = useRef(1600)
  const tRef = useRef(0)
  const angleRef = useRef(0)
  useEffect(() => {
    let raf, last = performance.now()
    const loop = (now) => {
      const dt = now - last; last = now
      tRef.current += dt
      const a = 38 * Math.sin((tRef.current / periodRef.current) * Math.PI)
      angleRef.current = a; setAngle(a)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  const tap = () => {
    if (done) return
    if (Math.abs(angleRef.current) < 12) {
      const n = hits + 1
      setHits(n); setFlash(true); setTimeout(() => setFlash(false), 180)
      periodRef.current += 450
      if (n >= NEED) { setDone(true); setTimeout(onDone, 900) }
    }
  }
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · The pendulum</p>
      <p style={styles.bodyTitle}>{done ? 'Slower now.' : 'Tap as it crosses the center.'}</p>
      <p style={styles.subtle}>{done ? 'You brought the rhythm down with you.' : 'Each tap slows the swing. Follow it down.'}</p>
      <div style={styles.stageDark} onPointerDown={tap}>
        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', display: 'block' }}>
          <line x1="100" y1="40" x2="100" y2="172" stroke="#6B5C4A" strokeWidth="0.75" opacity="0.3" />
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '100px 40px' }}>
            <line x1="100" y1="40" x2="100" y2="158" stroke="#D9B57A" strokeWidth="2.5" strokeLinecap="round" opacity="0.92" />
            <circle cx="100" cy="158" r={flash ? 11 : 8} fill="#D9B57A" style={{ transition: 'r 0.15s' }} />
          </g>
          <circle cx="100" cy="40" r="3" fill="#B89456" />
        </svg>
      </div>
      <div style={styles.roundDots}>
        {Array.from({ length: NEED }).map((_, i) => (
          <div key={i} style={{ ...styles.roundDot, ...(i < hits ? styles.roundDotDone : {}) }} />
        ))}
      </div>
      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
      <WhyFooter text="Matching an external, slowing rhythm naturally decelerates a racing heart." />
    </div>
  )
}

// ────────── 6. UNCLENCH (progressive muscle release) ──────────
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
        if (next >= 1) { clearInterval(tickRef.current); setHolding(false); setPhase('release'); setReleaseLeft(RELEASE_S) }
        return next
      })
    }, 100)
  }
  const stopHold = () => { if (phase !== 'clench') return; setHolding(false); if (tickRef.current) clearInterval(tickRef.current) }
  useEffect(() => {
    if (phase !== 'release') return
    const id = setInterval(() => {
      setReleaseLeft(s => {
        if (s <= 1) {
          clearInterval(id)
          if (round + 1 >= ROUNDS) { setDone(true); setTimeout(onDone, 900) }
          else { setRound(r => r + 1); setClenchHeld(0); setPhase('clench') }
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
      <p style={styles.techCount}>{stepNum} of {total} · Unclench</p>
      <p style={styles.bodyTitle}>{done ? 'Loosened.' : isClench ? 'Press and hold. Tense everything.' : 'Now let go. Completely.'}</p>
      <p style={styles.subtle}>
        {done ? 'Your body remembers how to let go.'
          : isClench ? `Round ${round + 1} of ${ROUNDS} — squeeze while you hold.`
          : 'Soften your hands, your jaw, your shoulders.'}
      </p>
      <div style={styles.clenchArea} onPointerDown={startHold} onPointerUp={stopHold} onPointerLeave={stopHold} onPointerCancel={stopHold}>
        <div style={{
          ...styles.clenchBlob,
          transform: `scale(${scale})`,
          background: isClench
            ? `radial-gradient(circle, rgba(58,42,28,${0.5 + clenchHeld * 0.45}) 0%, rgba(36,23,16,0.45) 100%)`
            : 'radial-gradient(circle, rgba(122,140,90,0.34) 0%, rgba(122,140,90,0.12) 100%)',
          borderColor: isClench ? 'rgba(58,42,28,0.7)' : 'rgba(122,140,90,0.55)',
        }} />
      </div>
      <div style={styles.roundDots}>
        {Array.from({ length: ROUNDS }).map((_, i) => (
          <div key={i} style={{ ...styles.roundDot, ...(i < round || done ? styles.roundDotDone : {}), ...(i === round && !done ? styles.roundDotActive : {}) }} />
        ))}
      </div>
      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
      <WhyFooter text="Progressive muscle release burns off the adrenaline fueling the urge." />
    </div>
  )
}

// ────────── 7. TRACE THE PATH (sustained guided focus) ──────────
function CirclesTechnique({ stepNum, total, onDone, onSkip }) {
  const areaRef = useRef(null)
  const pathRef = useRef(null)
  const samplesRef = useRef([])
  const progressRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const [dot, setDot] = useState(null)
  const [stray, setStray] = useState(false)
  const [done, setDone] = useState(false)
  const PATH = 'M 50 98 C 90 93, 90 89, 50 85 C 10 81, 10 77, 50 73 C 90 69, 90 65, 50 61 C 10 57, 10 53, 50 49 C 90 45, 90 41, 50 37 C 10 33, 10 29, 50 25 C 90 21, 90 17, 50 13 C 30 9, 38 5, 50 3'
  const N = 240
  useEffect(() => {
    const path = pathRef.current
    if (!path || !path.getTotalLength) return
    const tot = path.getTotalLength()
    const arr = []
    for (let i = 0; i <= N; i++) {
      const pt = path.getPointAtLength((tot * i) / N)
      arr.push({ x: pt.x, y: pt.y })
    }
    samplesRef.current = arr
    setDot(arr[0])
  }, [])
  const move = (e) => {
    if (done) return
    const samples = samplesRef.current
    if (!samples.length || !areaRef.current) return
    const r = areaRef.current.getBoundingClientRect()
    const fx = e.clientX - r.left, fy = e.clientY - r.top
    const toPx = (sp) => ({ x: (sp.x / 100) * r.width, y: (sp.y / 100) * r.height })
    const prog = progressRef.current
    const WINDOW = 16, TOL = 30
    let best = prog, near = false
    for (let j = prog; j <= Math.min(samples.length - 1, prog + WINDOW); j++) {
      const sp = toPx(samples[j])
      if (Math.hypot(fx - sp.x, fy - sp.y) < TOL) { best = j; near = true }
    }
    setStray(!near)
    if (best > prog) {
      progressRef.current = best
      setProgress(best / (samples.length - 1))
      setDot(samples[best])
      if (best >= samples.length - 2 && !done) { setDone(true); setTimeout(onDone, 800) }
    }
  }
  const end = () => {}
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Trace the path</p>
      <p style={styles.bodyTitle}>{done ? 'You reached the top.' : 'Follow the winding road.'}</p>
      <p style={styles.subtle}>
        {done ? 'Every curve, slow and steady.'
          : stray ? 'Stay on the path — ease back onto the line.'
          : 'Trace the whole path up, curve by curve. Keep your finger on the line.'}
      </p>
      <div ref={areaRef} style={{ ...styles.stageClay, height: '300px' }}
        onPointerDown={move} onPointerMove={(e) => { if (e.buttons || e.pressure > 0) move(e) }}
        onPointerUp={end} onPointerLeave={end} onPointerCancel={end}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path ref={pathRef} d={PATH} fill="none" stroke="#CBB893" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
          <path d={PATH} fill="none" stroke="#854F0B" strokeWidth="1.6" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - progress} style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
          {dot ? <circle cx={dot.x} cy={dot.y} r="2.4" fill="#D9B57A" stroke="#FFFDF8" strokeWidth="0.5" /> : null}
        </svg>
      </div>
      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
      <WhyFooter text="Continuous, guided motion demands focus, leaving less room for panic." />
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
      <WhyFooter text="Engaging your physical senses pulls the brain out of the future and into the room." />
    </div>
  )
}

// ────────── 9. THE VAULT LOCK (spatial puzzle reveals your vow) ──────────
function WhyTechnique({ stepNum, total, profileBio, onDone }) {
  const [quote, setQuote] = useState(null)
  const [offsets, setOffsets] = useState([-58, 64, -40])
  const [unlocked, setUnlocked] = useState(false)
  const dragRef = useRef(null)
  useEffect(() => {
    async function loadQuote() {
      const { data } = await supabase.from('urge_quotes').select('quote_text').eq('is_active', true)
      if (data && data.length > 0) setQuote(data[Math.floor(Math.random() * data.length)].quote_text)
      else setQuote('Most urges fade if you do not act on them. Just wait. It will pass.')
    }
    loadQuote()
  }, [])
  const down = (idx) => (e) => {
    if (unlocked) return
    dragRef.current = { idx, startX: e.clientX, startOffset: offsets[idx] }
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e) => {
    const d = dragRef.current
    if (!d) return
    const nx = Math.max(-92, Math.min(92, d.startOffset + (e.clientX - d.startX)))
    setOffsets(prev => { const n = [...prev]; n[d.idx] = nx; return n })
  }
  const up = () => {
    const d = dragRef.current
    if (!d) return
    setOffsets(prev => {
      const n = [...prev]
      if (Math.abs(n[d.idx]) < 14) n[d.idx] = 0
      if (n.every(o => o === 0) && !unlocked) setUnlocked(true)
      return n
    })
    dragRef.current = null
  }
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · The vault</p>
      <p style={styles.bodyTitle}>{unlocked ? 'The vault opens.' : 'Align the lock.'}</p>
      <p style={styles.subtle}>{unlocked ? 'What you keep inside is still true.' : 'Drag each band to the center. Line all three up.'}</p>
      <div style={{ ...styles.stageDark, minHeight: '200px', height: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '22px 20px', boxSizing: 'border-box' }}
        onPointerMove={move} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}>
        {unlocked ? (
          <div style={styles.vaultReveal}>
            {profileBio ? <p style={styles.vaultWhy}>{profileBio}</p> : null}
            {quote ? <p style={styles.vaultQuote}>{quote}</p> : null}
            {!profileBio && !quote ? <p style={styles.vaultWhy}>You opened it. Now ride this out.</p> : null}
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '50%', top: '-6px', bottom: '-6px', width: '1px', background: 'rgba(217,181,122,0.35)' }} />
            {offsets.map((off, i) => (
              <div key={i} onPointerDown={down(i)} style={{
                height: '34px', margin: '8px 0', borderRadius: '8px',
                transform: `translateX(${off}px)`,
                background: off === 0 ? 'linear-gradient(180deg, #E9C98E 0%, #CBA767 100%)' : 'linear-gradient(180deg, #D9B57A 0%, #B89456 100%)',
                boxShadow: off === 0 ? '0 0 16px rgba(217,181,122,0.5)' : '0 2px 8px rgba(0,0,0,0.35)',
                touchAction: 'none', cursor: 'grab', transition: 'background 0.2s, box-shadow 0.2s',
              }} />
            ))}
          </div>
        )}
      </div>
      <button onClick={onDone} disabled={!unlocked} style={{
        ...styles.btnPill, ...(unlocked ? styles.btnPrimary : styles.btnSecondary),
        marginTop: '1.25rem', opacity: unlocked ? 1 : 0.5, cursor: unlocked ? 'pointer' : 'not-allowed',
      }}>
        {unlocked ? "I'm ready →" : 'Align to open'}
      </button>
      <WhyFooter text="Solving a simple spatial puzzle brings the thinking brain back online." />
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
      <WhyFooter text="Addiction thrives in isolation. Connection breaks the circuit." />
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
function Feedback({ intensity, setIntensity, triggers: selectedTriggers, setTriggers, onDone, saving }) {
  const intensities = ['Mild', 'Moderate', 'Strong']
  const TRIGGER_OPTIONS = [
    'Stress', 'Anxiety', 'Boredom', 'Loneliness', 'Frustration', 'Anger',
    'Sadness', 'Fatigue', "Can't sleep", 'Hunger', 'Pain', 'Overwhelm',
    'Conflict', 'Social', 'Peer pressure', 'Celebration', 'Reward', 'Company',
    'Habit', 'Saw a cue', 'Time of day', 'Idle time', 'Relationship', 'Money worries'
  ]
  const toggle = (tr) =>
    setTriggers(prev => prev.includes(tr) ? prev.filter(x => x !== tr) : [...prev, tr])

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
      <p style={{...styles.body, marginTop: '1.5rem'}}>
        What triggered it? <span style={{ opacity: 0.55, fontSize: '13px' }}>pick any that fit</span>
      </p>
      <div style={styles.tapRow}>
        {TRIGGER_OPTIONS.map(tr => (
          <button key={tr} onClick={() => toggle(tr)}
            style={{...styles.tapChip, ...(selectedTriggers.includes(tr) ? styles.tapChipActive : {})}}>
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
  // ---- revamped "Airlock" interactions: calm geometry, no fire/shatter ----
  whyFooter: { fontSize: '11px', color: '#9C8C78', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: '1.6rem auto 0', maxWidth: '300px', borderTop: '0.5px solid #EFE7D7', paddingTop: '0.9rem' },
  stageDark: { width: '100%', maxWidth: '300px', height: '230px', borderRadius: '20px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', margin: '0.5rem auto 0.75rem', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 26px -12px rgba(40,25,10,0.5)', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' },
  stageClay: { width: '100%', maxWidth: '300px', height: '250px', borderRadius: '20px', background: 'linear-gradient(180deg, #EFE2CC 0%, #E3D2B4 100%)', margin: '0.5rem auto 0.75rem', position: 'relative', overflow: 'hidden', border: '0.5px solid #DDCBA8', boxShadow: 'inset 0 2px 10px rgba(120,90,40,0.12)', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', cursor: 'crosshair' },
  revealText: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1.75rem', fontFamily: 'Georgia, serif', fontSize: '19px', fontStyle: 'italic', color: '#2A1F15' },
  vaultReveal: { padding: '0.5rem 0.5rem 0', width: '100%', maxWidth: '320px', margin: '0 auto' },
  vaultWhy: { fontSize: '17px', color: '#EFDCAF', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 1rem', textAlign: 'center' },
  vaultQuote: { fontSize: '13px', color: '#CBBA98', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, margin: 0, textAlign: 'center' },
  velocityPickRow: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', margin: '1rem 0 1.5rem' },
  velocityPickBtn: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', padding: '16px 18px', background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)', border: '0.5px solid #E8DFD0', borderRadius: '16px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 4px 14px rgba(80,50,20,0.06)', fontFamily: 'inherit' },
  velocityPickIcon: { fontSize: '24px', lineHeight: 1 },
  velocityPickLabel: { fontSize: '17px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif' },
  velocityPickSub: { fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4 },
  haltGrid: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', margin: '1rem 0' },
  haltCell: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px 14px', minWidth: '84px', background: '#FFFFFF', border: '0.5px solid #E8DFD0', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit' },
  haltCellOn: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', border: '0.5px solid #241710' },
  haltIcon: { fontSize: '22px', lineHeight: 1 },
  haltLabel: { fontSize: '13px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif' },
  haltLabelOn: { color: '#FAF7F1' },
  haltFixes: { display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', margin: '0.25rem 0 1rem', textAlign: 'left' },
  haltFixRow: { display: 'flex', gap: '8px', alignItems: 'flex-start' },
  haltFixDot: { color: '#C5572C', fontSize: '18px', lineHeight: 1.3, flexShrink: 0 },
  haltFixText: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.5 },
  suggestCard: { width: '100%', boxSizing: 'border-box', padding: '20px', background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)', border: '0.5px solid #E8DFD0', borderRadius: '16px', margin: '1rem 0 0.5rem', boxShadow: '0 4px 14px rgba(80,50,20,0.06)' },
  suggestText: { fontSize: '17px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: 0 },
  suggestAnother: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '13px', fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer', marginBottom: '1.25rem' },
  // ---- revamped interactive urge-breakers (dissolve / wipe / pulse) ----

  // ---- new interactive urge-breakers (wave / unclench / circles) ----

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
  timerText: {
    fontSize: '12px', color: '#9C8C78',
    fontVariantNumeric: 'tabular-nums', margin: '0.5rem 0',
  },
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