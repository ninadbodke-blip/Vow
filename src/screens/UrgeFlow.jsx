import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useLang } from '../LanguageContext'
import { supabase } from '../supabaseClient'

// ===================================================================
// THE URGE FLOW — Vow's crisis-moment tool.
// ===================================================================
// Visual register: the home tree's night counterpart. Every stage is
// a small piece of the same world as TreeHero and NightSky — star
// gold (#EFDCAF) on deep ink (#241710), moons with layered halos,
// drifting clouds, serif cues. Nothing clinical, nothing gamified:
// each technique is a real regulation tool wearing a quiet scene,
// with the science named underneath it.
//
// Two tracks, chosen up front (or pre-tagged from home):
//   spike — a trigger hit fast; body-first tools to ride it out
//   creep — slow depletion; diagnostic tools that name and redirect
// ===================================================================

const SPIKE_TECHNIQUES = [
  { id: 'breath', name: 'The tide', duration: 90 },
  { id: 'wave', name: 'The wave', duration: 80 },
  { id: 'tap', name: 'The constellation', duration: 30 },
  { id: 'dissolve', name: 'The sand garden', duration: 0 },
  { id: 'wipe', name: 'Clear the mist', duration: 0 },
  { id: 'pulse', name: 'The lantern', duration: 0 },
  { id: 'unclench', name: 'Unclench', duration: 0 },
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
  { id: 'tape',           name: 'Play the tape', duration: 0 },
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

// The science pinned under every technique — turns a scene into a tool.
function WhyFooter({ text }) {
  return <p style={styles.whyFooter}>The science — {text}</p>
}

// Shared night-sky dressing for the dark stages: faint stars, a small
// moon with layered halo, one slow drifting cloud. Purely decorative,
// drawn in the NightSky idiom so the whole app feels like one world.
function NightDressing({ stars = [], moon = { cx: 162, cy: 36, r: 8 }, cloud = true }) {
  return (
    <>
      {moon && (
        <>
          <circle cx={moon.cx} cy={moon.cy} r={moon.r * 2.1} fill="rgba(239,220,175,0.08)" />
          <circle cx={moon.cx} cy={moon.cy} r={moon.r * 1.45} fill="rgba(239,220,175,0.12)" />
          <circle cx={moon.cx} cy={moon.cy} r={moon.r} fill="url(#urgeMoonG)" />
          <circle cx={moon.cx - 2.6} cy={moon.cy - 2} r={moon.r * 0.22} fill="#241710" opacity="0.12" />
          <circle cx={moon.cx + 2.2} cy={moon.cy + 2.6} r={moon.r * 0.16} fill="#241710" opacity="0.10" />
        </>
      )}
      <g fill="#EFDCAF">
        {stars.map(([x, y, r, o], i) => <circle key={i} cx={x} cy={y} r={r} opacity={o} />)}
      </g>
      {cloud && (
        <g opacity="0.08" fill="#EFDCAF">
          <animateTransform attributeName="transform" type="translate" from="-70 0" to="220 0" dur="90s" repeatCount="indefinite" />
          <ellipse cx="40" cy="26" rx="30" ry="5" /><ellipse cx="62" cy="29" rx="18" ry="3.6" />
        </g>
      )}
      <defs>
        <radialGradient id="urgeMoonG" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#F6E8C4" /><stop offset="100%" stopColor="#E8D2A0" />
        </radialGradient>
      </defs>
    </>
  )
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
      <div style={onExit ? styles.frameEmbedded : styles.frame}>
        <div style={onExit ? styles.cardEmbedded : styles.card}>
          <p style={{textAlign: 'center', color: '#9C8C78'}}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={onExit ? styles.frameEmbedded : styles.frame}>
      <div style={onExit ? styles.cardEmbedded : styles.card}>
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

// ────────── VELOCITY PICKER (when not pre-tagged from the home) ──────────
function VelocityPicker({ onChoose, onCancel }) {
  return (
    <div style={styles.center}>
      <div style={styles.softIcon}>🌊</div>
      <h2 style={styles.bigTitle}>What kind of urge is this?</h2>
      <p style={styles.body}>Naming how it is coming at you changes what actually helps.</p>
      <div style={styles.velocityPickRow}>
        <button onClick={() => onChoose('spike')} style={styles.velocityPickBtn}>
          <span style={styles.velocityPickLabel}>Sudden spike</span>
          <span style={styles.velocityPickSub}>A trigger hit. It came on fast and strong.</span>
        </button>
        <button onClick={() => onChoose('creep')} style={styles.velocityPickBtn}>
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
      <WhyFooter text="A slow-building urge usually rides on a bodily deficit. The HALT check, borrowed from recovery practice, names the true need — hunger, anger, loneliness, tiredness — so you can meet it directly instead of medicating it." />
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
      <WhyFooter text="Cravings are heavily cue-conditioned — trained to a particular room, chair, and hour. Changing your physical setting interrupts the cue mid-sentence, which is why the pull so often stays behind in the room you left." />
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
      <WhyFooter text="Deciding the next hour in advance moves the choice out of the moment of weakness. Behavioral science calls these implementation intentions — one of its most replicated findings: pre-made decisions hold when in-the-moment willpower does not." />
    </div>
  )
}

// ────────── CREEP: PLAY THE TAPE (episodic future thinking) ──────────
const TAPE_SCENES = [
  { k: 'SCENE ONE', t: 'The first ten minutes.', b: 'Play it honestly. The relief arrives — it always does. Watch it closely, and notice how quickly this scene is over.' },
  { k: 'SCENE TWO', t: 'Two hours in.', b: 'The relief has left the room. What is sitting there instead? Play this part too — the part the urge never screens for you.' },
  { k: 'SCENE THREE', t: 'Tomorrow morning.', b: 'The waking up. The first thought. You already know this scene by heart — you have watched it before.' },
  { k: 'THE OTHER TAPE', t: 'You didn\u2019t.', b: 'The evening stays ordinary. Maybe even a little dull. And the morning is clean, quiet, and entirely yours.' },
]

function PlayTapeTechnique({ stepNum, total, onDone, onSkip }) {
  const [scene, setScene] = useState(0)
  const cur = TAPE_SCENES[scene]
  const last = scene === TAPE_SCENES.length - 1
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · Play the tape</p>
      <h2 style={styles.bigTitle}>Run it all the way through.</h2>
      <p style={styles.body}>The urge only ever shows you the opening scene. Watch the whole film — slowly, honestly.</p>
      <div style={styles.tapeCard}>
        <p style={styles.tapeEyebrow}>{cur.k}</p>
        <p style={styles.tapeTitle}>{cur.t}</p>
        <p style={styles.tapeBody}>{cur.b}</p>
      </div>
      <div style={styles.roundDots}>
        {TAPE_SCENES.map((_, i) => (
          <div key={i} style={{ ...styles.roundDot, ...(i < scene ? styles.roundDotDone : {}), ...(i === scene ? styles.roundDotActive : {}) }} />
        ))}
      </div>
      <div style={styles.actions}>
        <button onClick={onSkip} style={{ ...styles.btn, ...styles.btnSecondary }}>Skip</button>
        {last ? (
          <button onClick={onDone} style={{ ...styles.btn, ...styles.btnPrimary }}>Done</button>
        ) : (
          <button onClick={() => setScene(s => s + 1)} style={{ ...styles.btn, ...styles.btnPrimary }}>Next scene ›</button>
        )}
      </div>
      <WhyFooter text="Vividly imagining the delayed consequences — not just the immediate reward — is called episodic future thinking. It measurably weakens delay discounting, the brain's habit of overpricing tonight and underpricing tomorrow." />
    </div>
  )
}

// ────────── TECHNIQUE ROUTER ──────────
function Technique({ technique, techniqueIdx, total, profileBio, onDone, onSkip }) {
  const stepNum = techniqueIdx + 1

  if (technique.id === 'breath') return <BreathTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'wave') return <WaveTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'tap') return <TapTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'dissolve') return <DissolveTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'wipe') return <WipeTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'pulse') return <PulseTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'unclench') return <UnclenchTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'senses') return <SensesTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'why') return <WhyTechnique stepNum={stepNum} total={total} profileBio={profileBio} onDone={onDone} />
  if (technique.id === 'reach') return <ReachOutTechnique stepNum={stepNum} total={total} onDone={onDone} />
  if (technique.id === 'halt') return <HALTTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'change_channel') return <ChangeChannelTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'deploy_defense') return <DeployDefenseTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  if (technique.id === 'tape') return <PlayTapeTechnique stepNum={stepNum} total={total} onDone={onDone} onSkip={onSkip} />
  return null
}

// ────────── 1. THE TIDE (structured breathing — 4/4/4/4 box, 90s) ──────────
// The old "arch" animation is gone. The breath is now the tide on a night
// shore: water rises as you breathe in, holds at the full, falls as you
// let go, rests at the ebb. Same timing engine as before.
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
  const phaseLabel = { in: 'Breathe in', hold1: 'Hold', out: 'Breathe out', hold2: 'Rest' }[phase]
  const phaseCue = {
    in: 'the tide is coming in',
    hold1: 'full — hold it gently',
    out: 'let it all go back',
    hold2: 'still water — empty',
  }[phase]
  const high = phase === 'in' || phase === 'hold1'
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · The tide</p>
      <p style={styles.bodyTitle}>Breathe with the tide.</p>
      <p style={styles.subtle}>In for four as it rises. Hold. Out for four as it falls. Rest. Stay until the shore is quiet.</p>
      <div style={styles.stageDark}>
        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', display: 'block' }}>
          <NightDressing
            moon={{ cx: 158, cy: 34, r: 8 }}
            stars={[[26, 22, 1.1, 0.4], [58, 40, 0.9, 0.3], [104, 18, 1, 0.35], [186, 66, 0.9, 0.3], [38, 62, 0.8, 0.25]]}
          />
          <text x="100" y="66" textAnchor="middle" fontFamily="Georgia, serif" fontSize="16" fill="#F4ECDD" opacity="0.92">{phaseLabel}</text>
          <text x="100" y="84" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fontStyle="italic" fill="#CBBA98" opacity="0.8">{phaseCue}</text>
          <defs>
            <linearGradient id="urgeTideG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(217,181,122,0.34)" />
              <stop offset="100%" stopColor="rgba(217,181,122,0.04)" />
            </linearGradient>
          </defs>
          {/* the water — one group, translated by breath */}
          <g style={{ transform: `translateY(${high ? -44 : 0}px)`, transition: 'transform 4s cubic-bezier(0.4,0,0.2,1)' }}>
            <path d="M -20 150 Q 5 145 30 149 T 80 148 T 130 149 T 180 148 T 230 149 L 230 240 L -20 240 Z" fill="url(#urgeTideG)" />
            <path d="M -20 150 Q 5 145 30 149 T 80 148 T 130 149 T 180 148 T 230 149" fill="none" stroke="#EFDCAF" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
            <path d="M -20 162 Q 10 158 40 161 T 100 160 T 160 161 T 230 160" fill="none" stroke="#EFDCAF" strokeWidth="0.9" opacity="0.28" />
            <circle cx="52" cy="148" r="1.1" fill="#F6E8C4" opacity="0.7" />
            <circle cx="122" cy="149" r="0.9" fill="#F6E8C4" opacity="0.6" />
            <circle cx="176" cy="148" r="1" fill="#F6E8C4" opacity="0.65" />
          </g>
        </svg>
      </div>
      <p style={styles.timerText}>{secondsLeft}s</p>
      <button onClick={onSkip} style={styles.skipText}>Skip this one</button>
      <WhyFooter text="A slow four-count exhale is the most direct lever on the vagus nerve — it slows the heart, and the body reads a slowing heart as safety. Ninety seconds is roughly how long a surge of stress chemicals takes to wash out of the bloodstream." />
    </div>
  )
}

// ────────── 2. THE WAVE (urge surfing — watch it crest and pass) ──────────
// The signature move of relapse prevention, drawn literally: the urge as a
// night swell that rises, crests, and falls over ~80 seconds while you do
// nothing but watch it from the shore.
const WAVE_DUR = 80000
const WAVE_PTS = Array.from({ length: 101 }, (_, i) => ({
  x: 10 + i * 1.8,
  y: 148 - 96 * Math.exp(-Math.pow(i - 50, 2) / (2 * 17 * 17)),
}))
const WAVE_PHASES = [
  [0.16, 'Find it', 'Where does it sit — chest, throat, hands? Give it a place and a size.'],
  [0.42, 'It rises', 'Let it climb. You are not the wave. You are the one watching it.'],
  [0.58, 'The crest', 'This is as high as it gets. It cannot climb past its own peak.'],
  [0.85, 'It falls', 'You did nothing — and it is already falling. That is the whole secret.'],
  [1.01, 'It passes', 'Nearly gone. They always pass. Every single one so far has.'],
]

function WaveTechnique({ stepNum, total, onDone, onSkip }) {
  const [idx, setIdx] = useState(0)
  const doneRef = useRef(false)
  useEffect(() => {
    let raf
    const start = performance.now()
    const loop = (now) => {
      const p = Math.min(1, (now - start) / WAVE_DUR)
      const next = Math.round(p * 100)
      setIdx(prev => (next !== prev ? next : prev))
      if (p >= 1) {
        if (!doneRef.current) { doneRef.current = true; setTimeout(onDone, 700) }
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  const p = idx / 100
  const phase = WAVE_PHASES.find(([limit]) => p < limit) || WAVE_PHASES[WAVE_PHASES.length - 1]
  const marker = WAVE_PTS[idx]
  const ridden = WAVE_PTS.slice(0, idx + 1).map(pt => `${pt.x},${pt.y}`).join(' ')
  const full = WAVE_PTS.map(pt => `${pt.x},${pt.y}`).join(' ')
  const secondsLeft = Math.ceil((1 - p) * (WAVE_DUR / 1000))
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · The wave</p>
      <p style={styles.bodyTitle}>{phase[1]}</p>
      <p style={styles.subtle}>{phase[2]}</p>
      <div style={styles.stageDark}>
        <svg viewBox="0 0 200 170" style={{ width: '100%', height: '100%', display: 'block' }}>
          <NightDressing
            moon={{ cx: 168, cy: 28, r: 7 }}
            stars={[[24, 20, 1, 0.4], [62, 34, 0.9, 0.3], [120, 16, 1, 0.3], [40, 52, 0.8, 0.25]]}
          />
          <defs>
            <linearGradient id="urgeWaveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(217,181,122,0.14)" />
              <stop offset="100%" stopColor="rgba(217,181,122,0.02)" />
            </linearGradient>
          </defs>
          <line x1="10" y1="148" x2="190" y2="148" stroke="#EFDCAF" strokeWidth="0.6" strokeDasharray="2 4" opacity="0.25" />
          <polygon points={`${full} 190,148 10,148`} fill="url(#urgeWaveFill)" />
          <polyline points={full} fill="none" stroke="#6B5C4A" strokeWidth="1.4" opacity="0.5" />
          <polyline points={ridden} fill="none" stroke="#EFDCAF" strokeWidth="2" strokeLinecap="round" opacity="0.95" />
          {marker && (
            <>
              <circle cx={marker.x} cy={marker.y} r="6.5" fill="rgba(246,232,196,0.18)" />
              <circle cx={marker.x} cy={marker.y} r="2.8" fill="#F6E8C4" />
            </>
          )}
        </svg>
      </div>
      <p style={styles.timerText}>{secondsLeft}s</p>
      <button onClick={onSkip} style={styles.skipText}>Skip this one</button>
      <WhyFooter text="Cravings behave like waves — left unfed, they crest and subside on their own, usually within minutes. This is urge surfing, from relapse-prevention research: observing the urge instead of wrestling it starves it of the struggle it feeds on." />
    </div>
  )
}

// ────────── 3. THE CONSTELLATION (spatial attention, night-sky idiom) ──────────
// No more random dots: each session draws a real figure from Vow's sky,
// star by star, edge by edge — the same language as the Motivation page.
const CONSTELLATIONS = [
  { name: 'The Anchor', line: 'Something that holds.', pts: [
    { x: 50, y: 14, p: -1 }, { x: 36, y: 24, p: 0 }, { x: 64, y: 24, p: 0 },
    { x: 50, y: 50, p: 0 }, { x: 50, y: 74, p: 3 }, { x: 28, y: 62, p: 4 }, { x: 72, y: 62, p: 4 },
  ] },
  { name: 'The Lantern', line: 'Carried through the dark.', pts: [
    { x: 50, y: 12, p: -1 }, { x: 36, y: 26, p: 0 }, { x: 64, y: 26, p: 0 },
    { x: 36, y: 62, p: 1 }, { x: 64, y: 62, p: 2 }, { x: 50, y: 74, p: 3 }, { x: 50, y: 44, p: 5 },
  ] },
  { name: 'The Bird', line: 'It lifts, when it is ready.', pts: [
    { x: 30, y: 62, p: -1 }, { x: 44, y: 52, p: 0 }, { x: 58, y: 44, p: 1 },
    { x: 70, y: 38, p: 2 }, { x: 78, y: 42, p: 3 }, { x: 48, y: 28, p: 1 }, { x: 56, y: 66, p: 1 },
  ] },
]

const CONSTELLATION_CSS = `
@keyframes urgeStarPulse { 0%,100% { transform: scale(0.8); opacity: 0.6 } 50% { transform: scale(1.15); opacity: 1 } }
@keyframes urgeEdgeDraw { to { stroke-dashoffset: 0 } }
.urgeNextStar { animation: urgeStarPulse 1.7s ease-in-out infinite; }
.urgeEdge { stroke-dasharray: 90; stroke-dashoffset: 90; animation: urgeEdgeDraw 0.8s ease forwards; }
@media (prefers-reduced-motion: reduce) {
  .urgeNextStar { animation: none !important; }
  .urgeEdge { stroke-dashoffset: 0; animation: none !important; }
}`

function TapTechnique({ stepNum, total, onDone, onSkip }) {
  const [figure] = useState(() => CONSTELLATIONS[Math.floor(Math.random() * CONSTELLATIONS.length)])
  const NEED = figure.pts.length
  const [placedCount, setPlacedCount] = useState(0)
  const [done, setDone] = useState(false)
  const current = figure.pts[placedCount]
  const tapStar = () => {
    if (done) return
    const next = placedCount + 1
    setPlacedCount(next)
    if (next >= NEED) { setDone(true); setTimeout(onDone, 1400) }
  }
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · The constellation</p>
      <p style={styles.bodyTitle}>{done ? `${figure.name}.` : 'Set the stars.'}</p>
      <p style={styles.subtle}>
        {done ? figure.line : 'One star at a time. Breathe in as you find it — tap it as you breathe out.'}
      </p>
      <div style={styles.stageDark}>
        <style>{CONSTELLATION_CSS}</style>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {/* far sky */}
          <g fill="#EFDCAF">
            <circle cx="12" cy="12" r="0.7" opacity="0.35" /><circle cx="88" cy="10" r="0.6" opacity="0.3" />
            <circle cx="8" cy="80" r="0.6" opacity="0.25" /><circle cx="92" cy="86" r="0.7" opacity="0.3" />
            <circle cx="22" cy="90" r="0.5" opacity="0.25" /><circle cx="80" cy="74" r="0.5" opacity="0.2" />
            <circle cx="16" cy="44" r="0.5" opacity="0.2" /><circle cx="90" cy="46" r="0.5" opacity="0.22" />
          </g>
          {/* moon sliver */}
          <circle cx="86" cy="16" r="6" fill="rgba(239,220,175,0.08)" />
          <circle cx="86" cy="16" r="3.4" fill="#E8D2A0" opacity="0.8" />
          <circle cx="84.6" cy="15" r="2.9" fill="#241710" opacity="0.88" />
          {/* drawn edges */}
          {figure.pts.slice(0, placedCount).map((pt, i) => (
            pt.p >= 0 ? (
              <line key={`e${i}`} className="urgeEdge"
                x1={figure.pts[pt.p].x} y1={figure.pts[pt.p].y} x2={pt.x} y2={pt.y}
                stroke="#D9B57A" strokeWidth={done ? 0.7 : 0.5} opacity={done ? 0.95 : 0.75} />
            ) : null
          ))}
          {/* placed stars with sparkle crosses */}
          {figure.pts.slice(0, placedCount).map((pt, i) => (
            <g key={`s${i}`}>
              <circle cx={pt.x} cy={pt.y} r={done ? 1.6 : 1.3} fill="#EFDCAF" />
              {i % 2 === 0 && (
                <g stroke="#EFDCAF" strokeWidth="0.3" opacity="0.75">
                  <line x1={pt.x - 2.6} y1={pt.y} x2={pt.x + 2.6} y2={pt.y} />
                  <line x1={pt.x} y1={pt.y - 2.6} x2={pt.x} y2={pt.y + 2.6} />
                </g>
              )}
            </g>
          ))}
        </svg>
        {!done && current && (
          <button onClick={tapStar} aria-label="Star" className="urgeNextStar" style={{
            position: 'absolute', left: current.x + '%', top: current.y + '%',
            width: '34px', height: '34px', marginLeft: '-17px', marginTop: '-17px',
            borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer',
            background: 'radial-gradient(circle, rgba(246,232,196,0.95) 0%, rgba(217,181,122,0.35) 38%, rgba(217,181,122,0) 70%)',
          }} />
        )}
      </div>
      <div style={styles.roundDots}>
        {Array.from({ length: NEED }).map((_, i) => (
          <div key={i} style={{ ...styles.roundDot, ...(i < placedCount ? styles.roundDotDone : {}) }} />
        ))}
      </div>
      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
      <WhyFooter text="Deliberate visual search and precise aiming recruit the brain's attention networks — the same limited bandwidth a craving needs to keep its loop running. Pair each tap with an out-breath and you occupy the loop and slow the body at once." />
    </div>
  )
}

// ────────── 4. THE SAND GARDEN (slow, deliberate movement) ──────────
// Same raking mechanic; the bed is now a proper karesansui — grain,
// stones with shadow and light, faint old circles around them.
const SAND_GRAINS = Array.from({ length: 42 }, (_, k) => ({
  x: (k * 37 + 13) % 96 + 2,
  y: (k * 53 + 29) % 92 + 4,
  r: 0.28 + ((k * 7) % 3) * 0.1,
}))

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
      <p style={styles.subtle}>{done ? 'Every groove drawn by your own hand.' : 'Slow strokes — one for each out-breath. Curve around the stones. Comb the whole bed.'}</p>
      <div ref={areaRef} style={styles.stageClay} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} onPointerCancel={onUp}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {/* wooden frame */}
          <rect x="1.2" y="1.2" width="97.6" height="97.6" fill="none" stroke="#B99C6E" strokeWidth="1.6" opacity="0.55" rx="2.5" />
          {/* sand grain */}
          <g fill="#8F7A52" opacity="0.14">
            {SAND_GRAINS.map((g, i) => <circle key={i} cx={g.x} cy={g.y} r={g.r} />)}
          </g>
          {/* old faint circles around the stones — the garden's memory */}
          <g fill="none" stroke="#A8916A" opacity="0.16">
            <ellipse cx="64" cy="58" rx="15" ry="11" strokeWidth="0.6" />
            <ellipse cx="64" cy="58" rx="20" ry="15" strokeWidth="0.5" />
            <ellipse cx="30" cy="30" rx="10" ry="7.5" strokeWidth="0.6" />
            <ellipse cx="30" cy="30" rx="14" ry="10.5" strokeWidth="0.5" />
          </g>
          {/* the large stone */}
          <ellipse cx="65.5" cy="61.5" rx="10" ry="4.5" fill="#7A6647" opacity="0.28" />
          <ellipse cx="64" cy="58" rx="9.5" ry="7" fill="#A8946E" />
          <ellipse cx="62.5" cy="56" rx="6.8" ry="4.6" fill="#C0AD87" opacity="0.85" />
          <ellipse cx="61" cy="54.5" rx="3.4" ry="2.1" fill="#D3C3A0" opacity="0.8" />
          {/* the small stone */}
          <ellipse cx="31" cy="32.5" rx="6.4" ry="3" fill="#7A6647" opacity="0.25" />
          <ellipse cx="30" cy="30" rx="6" ry="4.4" fill="#AF9C75" />
          <ellipse cx="29" cy="28.6" rx="3.6" ry="2.4" fill="#CBB995" opacity="0.85" />
          {/* the visitor's rake lines */}
          {tines.map((arr, k) => arr.length > 1 ? (
            <polyline key={k} points={arr.map(pt => `${pt.x},${pt.y}`).join(' ')} fill="none" stroke="#B08A48" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          ) : null)}
        </svg>
      </div>
      <div style={{ width: '180px', height: '3px', borderRadius: '2px', background: '#E8DFD0', margin: '0.25rem auto 0', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: Math.min(100, Math.round((coverage / NEED) * 100)) + '%', background: 'linear-gradient(90deg, #D9B57A, #B89456)', transition: 'width 0.15s' }} />
      </div>
      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
      <WhyFooter text="Slow, repetitive hand movement regulates the same way pacing or kneading dough does — rhythmic motor action lowers physical arousal and gives restlessness somewhere real to go. The rake is doing what the substance promised to." />
    </div>
  )
}

// ────────── 5. CLEAR THE MIST (tactile reveal — night behind fog) ──────────
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
  'This moment is temporary. What you are building is not.',
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
      <p style={styles.techCount}>{stepNum} of {total} · Clear the mist</p>
      <p style={styles.bodyTitle}>Clear the mist.</p>
      <p style={styles.subtle}>Wipe slowly, like breath off cold glass. The night is underneath, and something is written in it.</p>
      <div ref={areaRef} style={{ ...styles.stageDark, cursor: 'pointer' }} onPointerDown={(e) => clearAt(e.clientX, e.clientY)} onPointerMove={onMove}>
        {/* the night behind the fog */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <g fill="#EFDCAF">
            <circle cx="12" cy="14" r="0.7" opacity="0.4" /><circle cx="88" cy="12" r="0.6" opacity="0.35" />
            <circle cx="20" cy="84" r="0.6" opacity="0.3" /><circle cx="84" cy="80" r="0.7" opacity="0.3" />
            <circle cx="50" cy="8" r="0.5" opacity="0.3" /><circle cx="8" cy="50" r="0.5" opacity="0.25" />
            <circle cx="93" cy="46" r="0.5" opacity="0.25" />
          </g>
          <circle cx="85" cy="15" r="5.5" fill="rgba(239,220,175,0.09)" />
          <circle cx="85" cy="15" r="3.2" fill="#E8D2A0" opacity="0.85" />
        </svg>
        <div style={styles.revealText}>{line}</div>
        {/* the fog bank — soft pale puffs that wipe away */}
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', pointerEvents: 'none' }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} style={{
              background: `radial-gradient(circle at ${30 + (i % 3) * 20}% ${35 + ((i * 7) % 3) * 15}%, rgba(231,225,213,0.97) 0%, rgba(208,200,185,0.94) 55%, rgba(189,180,163,0.9) 100%)`,
              borderRadius: '46%',
              transform: `scale(1.35) rotate(${((i % 5) - 2) * 8}deg)`,
              opacity: cleared.has(i) || done ? 0 : 1,
              transition: 'opacity 0.5s',
            }} />
          ))}
        </div>
      </div>
      <p style={styles.subtle}>{done ? 'Clear.' : 'Keep going.'}</p>
      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
      <WhyFooter text="Slow tactile motion toward a small reveal borrows the brain's anticipation circuitry — the same dopamine machinery the urge runs on — and points it somewhere harmless, while the wiping rhythm settles the hands the craving wants busy." />
    </div>
  )
}

// ────────── 6. THE LANTERN (entrain a slowing rhythm) ──────────
// The pendulum, made a lantern on its chain. Same mechanic: tap as it
// crosses center; each true tap slows the swing until it comes to rest.
function PulseTechnique({ stepNum, total, onDone, onSkip }) {
  const NEED = 4
  const [hits, setHits] = useState(0)
  const [angle, setAngle] = useState(0)
  const [flash, setFlash] = useState(false)
  const [done, setDone] = useState(false)
  const periodRef = useRef(1600)
  const tRef = useRef(0)
  const angleRef = useRef(0)
  const doneRef = useRef(false)
  useEffect(() => {
    let raf, last = performance.now()
    const loop = (now) => {
      const dt = now - last; last = now
      if (!doneRef.current) {
        tRef.current += dt
        const a = 38 * Math.sin((tRef.current / periodRef.current) * Math.PI)
        angleRef.current = a; setAngle(a)
      }
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
      if (n >= NEED) { doneRef.current = true; setDone(true); setTimeout(onDone, 1200) }
    }
  }
  return (
    <div style={styles.center}>
      <p style={styles.techCount}>{stepNum} of {total} · The lantern</p>
      <p style={styles.bodyTitle}>{done ? 'At rest.' : 'Tap as the lantern crosses the center.'}</p>
      <p style={styles.subtle}>{done ? 'You slowed it to stillness. The same works on you.' : 'Each true tap slows the swing. Breathe out with every pass, and bring it to rest.'}</p>
      <div style={styles.stageDark} onPointerDown={tap}>
        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', display: 'block' }}>
          <NightDressing
            moon={{ cx: 166, cy: 30, r: 6.5 }}
            stars={[[24, 24, 1, 0.4], [58, 16, 0.8, 0.3], [140, 50, 0.8, 0.25], [34, 60, 0.7, 0.25]]}
            cloud={false}
          />
          <defs>
            <radialGradient id="urgeFlameG" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#F6E8C4" />
              <stop offset="55%" stopColor="rgba(233,201,142,0.85)" />
              <stop offset="100%" stopColor="rgba(217,181,122,0)" />
            </radialGradient>
          </defs>
          {/* the beam it hangs from */}
          <line x1="64" y1="30" x2="136" y2="30" stroke="#6B5C4A" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          {/* swing guide + center mark */}
          <path d="M 29 121 A 115 115 0 0 1 171 121" fill="none" stroke="#EFDCAF" strokeWidth="0.7" strokeDasharray="1.5 4" opacity="0.18" />
          <line x1="100" y1="116" x2="100" y2="127" stroke="#EFDCAF" strokeWidth="1" opacity="0.35" />
          {/* the lantern on its chain */}
          <g style={{
            transform: `rotate(${done ? 0 : angle}deg)`, transformOrigin: '100px 30px',
            transition: done ? 'transform 1.1s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          }}>
            <line x1="100" y1="30" x2="100" y2="128" stroke="#D9B57A" strokeWidth="1.5" opacity="0.85" />
            <circle cx="100" cy="56" r="1.5" fill="#D9B57A" opacity="0.55" />
            <circle cx="100" cy="82" r="1.5" fill="#D9B57A" opacity="0.55" />
            <circle cx="100" cy="108" r="1.5" fill="#D9B57A" opacity="0.55" />
            <rect x="95" y="126" width="10" height="4.5" rx="2" fill="#B89456" />
            <rect x="90.5" y="130" width="19" height="27" rx="4.5" fill="rgba(36,23,16,0.55)" stroke="#D9B57A" strokeWidth="1.6" />
            <line x1="100" y1="131" x2="100" y2="156" stroke="#D9B57A" strokeWidth="0.6" opacity="0.4" />
            <circle cx="100" cy="144" r={flash || done ? 8.5 : 5.5} fill="url(#urgeFlameG)" style={{ transition: 'r 0.2s' }} />
            <rect x="96" y="157" width="8" height="3" rx="1.5" fill="#B89456" />
          </g>
        </svg>
      </div>
      <div style={styles.roundDots}>
        {Array.from({ length: NEED }).map((_, i) => (
          <div key={i} style={{ ...styles.roundDot, ...(i < hits ? styles.roundDotDone : {}) }} />
        ))}
      </div>
      {!done && <button onClick={onSkip} style={styles.skipText}>Skip this one</button>}
      <WhyFooter text="Your nervous system entrains to external rhythm. Following a beat that keeps slowing coaxes heart rate and attention down with it — the same principle behind rocking, metronomes, and lullabies." />
    </div>
  )
}

// ────────── 7. UNCLENCH (progressive muscle release) ──────────
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
      <WhyFooter text="Tense-and-release — progressive muscle relaxation, in miniature — burns off the adrenaline the urge is riding, and teaches the body the felt difference between gripping and letting go." />
    </div>
  )
}

// ────────── 8. 5-4-3-2-1 SENSES ──────────
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
      <WhyFooter text="Naming what your senses can actually find right now pulls processing out of imagination and into the room — grounding used across anxiety and trauma care, because a craving lives almost entirely in the imagined next hour." />
    </div>
  )
}

// ────────── 9. THE VAULT LOCK (spatial puzzle reveals your vow) ──────────
function WhyTechnique({ stepNum, total, profileBio, onDone }) {
  const [quote, setQuote] = useState(null)
  const [offsets, setOffsets] = useState([-48, 56, -36])
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
    const nx = Math.max(-62, Math.min(62, d.startOffset + (e.clientX - d.startX)))
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
              <div key={i} style={{
                position: 'relative', height: '30px', margin: '10px 0', borderRadius: '999px',
                background: 'rgba(0,0,0,0.28)', border: '0.5px solid rgba(217,181,122,0.18)',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
              }}>
                <div onPointerDown={down(i)} style={{
                  position: 'absolute', top: '3px', bottom: '3px', left: '50%', width: '54%',
                  transform: `translateX(calc(-50% + ${off}px))`,
                  borderRadius: '999px',
                  background: off === 0 ? 'linear-gradient(180deg, #E9C98E 0%, #CBA767 100%)' : 'linear-gradient(180deg, #D9B57A 0%, #B89456 100%)',
                  boxShadow: off === 0 ? '0 0 16px rgba(217,181,122,0.55)' : '0 2px 8px rgba(0,0,0,0.35)',
                  touchAction: 'none', cursor: 'grab', transition: 'background 0.2s, box-shadow 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ width: '3px', height: '12px', borderRadius: '2px', background: 'rgba(58,42,28,0.45)' }} />
                </div>
              </div>
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
      <WhyFooter text="A small spatial puzzle re-engages the prefrontal cortex — the deliberate, planning brain a spike temporarily shouts down. What is inside the vault is your own reasoning, handed back to you at the exact moment it went quiet." />
    </div>
  )
}

// ────────── 10. REACH OUT — with anchors integration ──────────
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
      <WhyFooter text="Isolation is the urge's preferred room. Real connection — even a two-minute call — releases oxytocin, which directly dampens the stress response. It is the circuit-breaker addiction least wants you to find." />
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
  // ---- the science footer under every technique ----
  whyFooter: { fontSize: '11px', color: '#9C8C78', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: '1.6rem auto 0', maxWidth: '300px', borderTop: '0.5px solid #EFE7D7', paddingTop: '0.9rem' },
  stageDark: { width: '100%', maxWidth: '300px', height: '230px', borderRadius: '20px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', margin: '0.5rem auto 0.75rem', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 26px -12px rgba(40,25,10,0.5)', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' },
  stageClay: { width: '100%', maxWidth: '300px', height: '250px', borderRadius: '20px', background: 'linear-gradient(180deg, #EFE2CC 0%, #E3D2B4 100%)', margin: '0.5rem auto 0.75rem', position: 'relative', overflow: 'hidden', border: '0.5px solid #DDCBA8', boxShadow: 'inset 0 2px 10px rgba(120,90,40,0.12)', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', cursor: 'crosshair' },
  revealText: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1.75rem', fontFamily: 'Georgia, serif', fontSize: '19px', fontStyle: 'italic', color: '#EFDCAF' },
  vaultReveal: { padding: '0.5rem 0.5rem 0', width: '100%', maxWidth: '320px', margin: '0 auto' },
  vaultWhy: { fontSize: '17px', color: '#EFDCAF', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 1rem', textAlign: 'center' },
  vaultQuote: { fontSize: '13px', color: '#CBBA98', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, margin: 0, textAlign: 'center' },
  velocityPickRow: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', margin: '1rem 0 1.5rem' },
  velocityPickBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '14px 24px', background: '#FDFBF6', border: '0.5px solid #E2D7C3', borderRadius: '999px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 3px 12px rgba(80,50,20,0.05)', fontFamily: 'inherit' },
  velocityPickIcon: { fontSize: '24px', lineHeight: 1 },
  velocityPickLabel: { fontSize: '16px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif' },
  velocityPickSub: { fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4 },
  haltGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '9px', margin: '1rem 0', width: '100%' },
  haltCell: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '13px 8px', background: '#FDFBF6', border: '0.5px solid #E2D7C3', borderRadius: '999px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(80,50,20,0.04)' },
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

  // ---- Play the tape ----
  tapeCard: { width: '100%', boxSizing: 'border-box', padding: '22px 22px 20px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', borderRadius: '18px', margin: '1rem 0 1rem', boxShadow: '0 10px 26px -12px rgba(40,25,10,0.5)', textAlign: 'left' },
  tapeEyebrow: { fontSize: '10px', color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 600, margin: '0 0 8px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  tapeTitle: { fontSize: '19px', color: '#FAF7F1', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.3, margin: '0 0 8px' },
  tapeBody: { fontSize: '14px', color: '#CBBA98', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: 0 },

  clenchArea: {
    width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0.5rem 0', touchAction: 'none', userSelect: 'none', cursor: 'pointer',
  },
  clenchBlob: {
    width: '130px', height: '130px',
    borderRadius: '50%',
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
  frameEmbedded: {
    background: 'transparent', padding: 0,
    display: 'flex', justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  cardEmbedded: {
    background: 'transparent', maxWidth: '440px', width: '100%',
    borderRadius: 0, padding: '2rem 1.5rem 1.8rem', boxSizing: 'border-box',
    boxShadow: 'none',
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
    justifyContent: 'center',
  },
  btn: {
    padding: '12px 26px', borderRadius: '999px', fontSize: '14px',
    fontWeight: 500, border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', alignSelf: 'center',
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
    border: 'none', borderRadius: '999px',
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
    border: 'none', borderRadius: '999px',
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