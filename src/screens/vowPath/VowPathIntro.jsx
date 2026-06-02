import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { STAGE_ORDER } from './utils/stageAccess'
import VowPathMark from '../../components/VowPathMark'

// =====================================================================
// VOW PATH HUB
// A literary, architectural "table of contents" for the program:
//   - a dark "vault" hero for the stage you're currently at
//   - a continuous thread binding the five linear chapters
//   - Reclaim set apart at the bottom as a quiet sanctuary
// Visual layer only — all placement logic lives in getStageStatus /
// handleStageTap, unchanged from the working build.
// =====================================================================

const STAGES = [
  { key: 'notice',  number: '01', label: 'Notice',  clinical: 'Pre-contemplation', duration: '5 days',           tagline: "Looking carefully, before you know what you're looking at.", accent: '#A89B85' },
  { key: 'reflect', number: '02', label: 'Reflect', clinical: 'Contemplation',     duration: '21 days',          tagline: 'Sitting with whether this matters.',                        accent: '#C9A96E' },
  { key: 'commit',  number: '03', label: 'Commit',  clinical: 'Preparation',       duration: '10 days',          tagline: 'Gathering yourself.',                                       accent: '#B57842' },
  { key: 'endure',  number: '04', label: 'Endure',  clinical: 'Action',            duration: '21 days',          tagline: 'Walking through.',                                          accent: '#C5572C' },
  { key: 'build',   number: '05', label: 'Build',   clinical: 'Maintenance',       duration: '9 weekly entries', tagline: 'Living the vow.',                                           accent: '#854F0B' },
  { key: 'reclaim', number: '06', label: 'Reclaim', clinical: 'Recycling',         duration: '5 days',           tagline: 'Beginning again.',                                          accent: '#9C6E5A' },
]

export default function VowPathIntro() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(null)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/app/welcome'); return }

      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('current_stage')
        .eq('user_id', user.id)
        .maybeSingle()

      setProgress(progressRow)
      setLoading(false)
    }
    load()
  }, [navigate])

  const hasAssessment = !!progress?.current_stage
  const currentStage = progress?.current_stage

  const getStageStatus = (stageKey) => {
    if (!hasAssessment) return 'pre_assessment'
    if (stageKey === currentStage) return 'current'
    // Reclaim is not a sequential stage — it's relapse support, always available.
    if (stageKey === 'reclaim') return 'relapse_support'
    const ci = STAGE_ORDER.indexOf(currentStage)
    const ti = STAGE_ORDER.indexOf(stageKey)
    if (ti >= 0 && ci >= 0 && ti < ci) return 'visited'   // past stage — explorable
    return 'locked'   // future stage
  }

  const handleStageTap = (stageKey) => {
    const status = getStageStatus(stageKey)
    if (status === 'pre_assessment' || status === 'locked') return
    if (status === 'relapse_support') {
      // Reclaim opens directly as relapse support. If it isn't your assigned
      // stage, the Reclaim screens treat it as a non-destructive visit.
      navigate('/app/vow-path/reclaim')
      return
    }
    if (status === 'current') {
      navigate(`/app/vow-path/${stageKey}`)
      return
    }
    if (status === 'visited') {
      // Past stage — open it fully for exploration.
      navigate(`/app/vow-path/${stageKey}`)
    }
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, textAlign: 'center', color: '#9C8C78', paddingTop: '4rem' }}>
          Loading...
        </div>
      </div>
    )
  }

  const currentStageObj = currentStage ? STAGES.find((s) => s.key === currentStage) : null
  const journey = STAGES.filter((s) => s.key !== 'reclaim')
  const reclaim = STAGES.find((s) => s.key === 'reclaim')
  const reclaimStatus = getStageStatus('reclaim')

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* ---- HEADER ---- */}
        <div style={styles.topBar}>
          <button onClick={() => navigate('/app/home')} style={styles.backBtn}>‹ Home</button>
        </div>
        <div style={styles.brand}>
          <VowPathMark size={40} theme="light" />
          <span style={styles.wordmark}>Vow Path</span>
        </div>

        {/* ---- HERO ---- */}
        {hasAssessment && currentStageObj ? (
          // DARK VAULT — the chapter you're currently at
          <section style={styles.hero}>
            <span style={styles.heroWatermark}>{currentStageObj.number}</span>
            <div style={styles.heroInner}>
              <p style={styles.heroEyebrow}>You are here</p>
              <span style={styles.heroRule} />
              <h1 style={styles.heroName}>{currentStageObj.label}</h1>
              <p style={styles.heroMeta}>
                Chapter {currentStageObj.number} &nbsp;·&nbsp; {currentStageObj.clinical} &nbsp;·&nbsp; {currentStageObj.duration}
              </p>
              <p style={styles.heroTagline}>“{currentStageObj.tagline}”</p>
              <button
                onClick={() => handleStageTap(currentStage)}
                onMouseEnter={() => setHovered('cta')}
                onMouseLeave={() => setHovered(null)}
                style={{ ...styles.heroCta, ...(hovered === 'cta' ? styles.heroCtaHover : {}) }}
              >
                {currentStage === 'reclaim' ? 'Enter Reclaim' : 'Continue Chapter'}
                <span style={styles.heroCtaArrow}>→</span>
              </button>
            </div>
          </section>
        ) : (
          // PRE-ASSESSMENT — the program, before you're placed
          <section style={styles.introHero}>
            <p style={styles.eyebrow}>The program</p>
            <h1 style={styles.introTitle}>Six stages,<br />one journey.</h1>
            <p style={styles.introLede}>Designed by the research.<br />Walked at your pace.</p>
            <span style={styles.heroDivider} />
            <p style={styles.introPara}>
              The Vow Path is six structured programs in one — each tailored to a
              stage of the journey, from first noticing a substance to a year past
              quitting.
            </p>
            <p style={styles.introPara}>
              Before we begin, you'll take a short assessment so we can place you
              at the right stage.
            </p>
          </section>
        )}

        {/* ---- THE CONTINUOUS THREAD (linear chapters 01–05) ---- */}
        <nav style={styles.thread} aria-label="The journey">
          {journey.map((s, i) => {
            const status = getStageStatus(s.key)
            const isLast = i === journey.length - 1
            const isCurrent = status === 'current'
            const isVisited = status === 'visited'
            const awaiting = status === 'locked' || status === 'pre_assessment'
            const interactive = isCurrent || isVisited
            const isHover = hovered === s.key

            const lineStyle = {
              ...styles.threadLine,
              ...(isCurrent ? styles.lineCurrent : isVisited ? styles.linePast : styles.lineFuture),
            }

            return (
              <div
                key={s.key}
                onClick={() => handleStageTap(s.key)}
                onMouseEnter={() => interactive && setHovered(s.key)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  ...styles.threadRow,
                  ...(awaiting ? styles.threadRowFuture : {}),
                  cursor: interactive ? 'pointer' : 'default',
                }}
              >
                <span style={styles.watermark}>{s.number}</span>

                <div style={styles.rail}>
                  <span style={lineStyle} />
                  {isCurrent ? (
                    <span style={styles.nodeCurrent}>✧</span>
                  ) : isVisited ? (
                    <span style={styles.nodePast} />
                  ) : (
                    <span style={styles.nodeFuture} />
                  )}
                </div>

                <div
                  style={{
                    ...styles.threadContent,
                    ...(isLast ? { borderBottom: 'none' } : {}),
                    ...(isHover && interactive ? { transform: 'translateX(4px)' } : {}),
                  }}
                >
                  <p
                    style={{
                      ...styles.clinicalEyebrow,
                      ...(isCurrent ? styles.clinicalEyebrowCurrent : {}),
                      ...(awaiting ? styles.clinicalEyebrowFuture : {}),
                    }}
                  >
                    {awaiting ? 'Awaiting' : s.clinical}
                  </p>
                  <h2 style={{ ...styles.threadName, ...(isHover && interactive ? { color: '#1C140C' } : {}) }}>
                    {s.label}
                  </h2>
                  <p style={styles.threadDuration}>{s.duration}</p>
                  <p style={styles.threadTagline}>{s.tagline}</p>
                </div>
              </div>
            )
          })}
        </nav>

        {/* ---- THE SANCTUARY (Reclaim) — only when it's relapse support ---- */}
        {reclaimStatus === 'relapse_support' && (
          <section
            onClick={() => handleStageTap('reclaim')}
            onMouseEnter={() => setHovered('sanctuary')}
            onMouseLeave={() => setHovered(null)}
            style={{ ...styles.sanctuary, ...(hovered === 'sanctuary' ? styles.sanctuaryHover : {}) }}
          >
            <div style={styles.sanctuaryHead}>
              <span style={styles.shield}>
                <svg width="26" height="30" viewBox="0 0 24 28" fill="none" aria-hidden="true">
                  <path
                    d="M12 1.5 L21.5 5.2 V13 C21.5 19.8 17 24.6 12 26.5 C7 24.6 2.5 19.8 2.5 13 V5.2 Z"
                    stroke="#C5572C" strokeWidth="1.25" strokeLinejoin="round" fill="none"
                  />
                  <path
                    d="M12 6 L12 18 M7.5 11.5 L12 15.5 L16.5 11.5"
                    stroke="#C5572C" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.55"
                  />
                </svg>
              </span>
              <div>
                <p style={styles.sanctuaryEyebrow}>The Sanctuary</p>
                <h2 style={styles.sanctuaryName}>{reclaim.label}</h2>
              </div>
            </div>
            <p style={styles.sanctuaryMeta}>{reclaim.clinical} &nbsp;·&nbsp; {reclaim.duration}</p>
            <p style={styles.sanctuaryTagline}>{reclaim.tagline}</p>
            <p style={styles.sanctuaryNote}>
              Here if you slip. A quiet place to interrupt the cascade and step back in.
            </p>
          </section>
        )}

        {/* ---- CTA ---- */}
        <div style={styles.ctaBlock}>
          {!hasAssessment ? (
            <>
              <button onClick={() => navigate('/app/vow-path/substance')} style={styles.primaryCta}>
                Take the Stage Check
              </button>
              <p style={styles.ctaSub}>15 questions. About two minutes. Honest answers, in private.</p>
            </>
          ) : (
            <button onClick={() => navigate('/app/vow-path/check')} style={styles.tertiaryCta}>
              Re-take the Stage Check
            </button>
          )}
        </div>

        <p style={styles.privacyNote}>
          Your answers and your work are private. Only you and Vow see them.
        </p>

      </div>
    </div>
  )
}

const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const styles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: SANS,
  },
  phone: {
    background: '#FAF7F1',
    maxWidth: '460px',
    width: '100%',
    borderRadius: '32px',
    padding: '1.5rem 1.25rem 2.5rem',
    boxShadow: '0 18px 50px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },

  // ---- HEADER ----
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '0.25rem',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: '#854F0B',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: SANS,
    padding: '4px 8px',
    minWidth: '60px',
    textAlign: 'left',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.6rem',
    margin: '1.5rem 0 2.5rem',
  },
  wordmark: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#6B5C4A',
    textTransform: 'uppercase',
    letterSpacing: '0.30em',
    fontFamily: SANS,
  },

  // ---- HERO (DARK VAULT) ----
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '24px',
    padding: '2.3rem 1.8rem 1.9rem',
    margin: '0.5rem 0 2.5rem',
    backgroundImage:
      'radial-gradient(130% 80% at 50% -15%, rgba(217,194,138,0.20) 0%, rgba(217,194,138,0) 58%), linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    boxShadow: '0 24px 60px rgba(36,23,16,0.30), inset 0 1px 0 rgba(217,194,138,0.10)',
  },
  heroWatermark: {
    position: 'absolute',
    top: '50%',
    right: '-12px',
    transform: 'translateY(-46%)',
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontSize: '200px',
    lineHeight: 1,
    color: 'rgba(250,247,241,0.05)',
    pointerEvents: 'none',
    userSelect: 'none',
    letterSpacing: '-0.04em',
  },
  heroInner: { position: 'relative', zIndex: 1 },
  heroEyebrow: {
    fontSize: '10.5px',
    fontWeight: 600,
    color: '#D9C28A',
    textTransform: 'uppercase',
    letterSpacing: '0.30em',
    margin: '0 0 0.8rem',
    fontFamily: SANS,
  },
  heroRule: {
    display: 'block',
    width: '34px',
    height: '1px',
    background: 'linear-gradient(90deg, #D9C28A 0%, rgba(217,194,138,0) 100%)',
    margin: '0 0 1.2rem',
  },
  heroName: {
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontWeight: 400,
    fontSize: '52px',
    lineHeight: 0.98,
    letterSpacing: '-0.015em',
    color: '#FAF7F1',
    margin: '0 0 0.85rem',
  },
  heroMeta: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#B7A485',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    margin: '0 0 1.2rem',
    fontFamily: SANS,
  },
  heroTagline: {
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontSize: '16.5px',
    lineHeight: 1.55,
    color: '#DCCDB6',
    margin: '0 0 1.8rem',
    maxWidth: '300px',
  },
  heroCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '0.5px solid rgba(217,194,138,0.35)',
    background: 'linear-gradient(180deg, #9A5C12 0%, #7C4608 100%)',
    color: '#FBF3E4',
    fontFamily: SANS,
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    padding: '0.85rem 1.5rem',
    borderRadius: '13px',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(120,68,8,0.35)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  heroCtaHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 24px rgba(120,68,8,0.45)',
  },
  heroCtaArrow: { fontSize: '15px', lineHeight: 1 },

  // ---- PRE-ASSESSMENT INTRO ----
  introHero: {
    textAlign: 'center',
    padding: '1.5rem 0.5rem 0.5rem',
    marginBottom: '2.25rem',
  },
  eyebrow: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.24em',
    fontWeight: 600,
    margin: '0 0 1.4rem',
    fontFamily: SANS,
  },
  introTitle: {
    fontSize: '42px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: SERIF,
    lineHeight: 1.08,
    letterSpacing: '-0.01em',
    margin: '0 0 1.3rem',
  },
  introLede: {
    fontSize: '15px',
    color: '#6B5C4A',
    fontFamily: SERIF,
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: '0 auto 1.75rem',
    maxWidth: '320px',
  },
  heroDivider: {
    display: 'block',
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, #D9C28A 50%, transparent 100%)',
    width: '60%',
    margin: '0 auto 1.9rem',
  },
  introPara: {
    fontSize: '14.5px',
    color: '#4A3D2E',
    fontFamily: SERIF,
    lineHeight: 1.75,
    margin: '0 0 1.1rem',
    textAlign: 'left',
  },

  // ---- THE THREAD ----
  thread: { position: 'relative' },
  threadRow: {
    position: 'relative',
    display: 'flex',
    overflow: 'hidden',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    padding: 0,
    fontFamily: 'inherit',
  },
  threadRowFuture: { opacity: 0.4 },
  watermark: {
    position: 'absolute',
    top: '50%',
    right: '-6px',
    transform: 'translateY(-50%)',
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontSize: '146px',
    lineHeight: 1,
    color: 'rgba(42,31,21,0.055)',
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 0,
    letterSpacing: '-0.04em',
  },
  rail: { position: 'relative', flexShrink: 0, width: '46px', zIndex: 1 },
  threadLine: { position: 'absolute', top: 0, bottom: 0, left: '22px', width: 0 },
  linePast: { borderLeft: '1.5px solid #2A1F15' },
  lineCurrent: { borderLeft: '1.5px solid #854F0B', boxShadow: '0 0 10px 1px rgba(133,79,11,0.45)' },
  lineFuture: { borderLeft: '1.5px dashed rgba(107,92,74,0.35)' },
  nodePast: {
    position: 'absolute', top: '50%', left: '22px', transform: 'translate(-50%, -50%)',
    width: '8px', height: '8px', borderRadius: '50%', background: '#2A1F15',
    boxShadow: '0 0 0 4px #FAF7F1',
  },
  nodeCurrent: {
    position: 'absolute', top: '50%', left: '22px', transform: 'translate(-50%, -50%)',
    fontSize: '17px', lineHeight: 1, color: '#854F0B', background: '#FAF7F1',
    borderRadius: '50%', width: '24px', height: '24px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    textShadow: '0 0 9px rgba(133,79,11,0.55)',
  },
  nodeFuture: {
    position: 'absolute', top: '50%', left: '22px', transform: 'translate(-50%, -50%)',
    width: '8px', height: '8px', borderRadius: '50%', background: '#FAF7F1',
    border: '1px solid rgba(107,92,74,0.45)',
  },
  threadContent: {
    flex: 1, position: 'relative', zIndex: 1, minWidth: 0,
    padding: '1.7rem 0',
    borderBottom: '1px solid rgba(217,194,138,0.4)',
    transition: 'transform 0.22s ease, color 0.22s ease',
  },
  clinicalEyebrow: {
    fontSize: '9.5px', fontWeight: 600, color: '#9C8463',
    textTransform: 'uppercase', letterSpacing: '0.22em',
    margin: '0 0 0.55rem', fontFamily: SANS,
  },
  clinicalEyebrowCurrent: { color: '#854F0B' },
  clinicalEyebrowFuture: { color: '#6B5C4A', letterSpacing: '0.30em' },
  threadName: {
    fontFamily: SERIF, fontWeight: 400, fontSize: '31px', lineHeight: 1.05,
    color: '#2A1F15', margin: '0 0 0.45rem',
  },
  threadDuration: {
    fontSize: '10px', fontWeight: 500, color: '#9C8C78',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    margin: '0 0 0.7rem', fontFamily: SANS,
  },
  threadTagline: {
    fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px', lineHeight: 1.55,
    color: '#6B5C4A', margin: 0, maxWidth: '300px',
  },

  // ---- THE SANCTUARY ----
  sanctuary: {
    display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'left',
    marginTop: '2.5rem', padding: '1.8rem 1.6rem',
    borderRadius: '18px', border: '1px dashed #C5572C',
    background: 'rgba(197,87,44,0.05)', cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'transform 0.22s ease, background 0.22s ease',
  },
  sanctuaryHover: { transform: 'translateY(-2px)', background: 'rgba(197,87,44,0.08)' },
  sanctuaryHead: { display: 'flex', alignItems: 'center', gap: '0.95rem', marginBottom: '0.85rem' },
  shield: {
    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '44px', height: '44px', borderRadius: '50%',
    background: 'rgba(197,87,44,0.07)', border: '0.5px solid rgba(197,87,44,0.25)',
  },
  sanctuaryEyebrow: {
    fontSize: '9.5px', fontWeight: 600, color: '#C5572C',
    textTransform: 'uppercase', letterSpacing: '0.24em',
    margin: '0 0 0.3rem', fontFamily: SANS,
  },
  sanctuaryName: { fontFamily: SERIF, fontWeight: 400, fontSize: '27px', lineHeight: 1, color: '#2A1F15', margin: 0 },
  sanctuaryMeta: {
    fontSize: '10px', fontWeight: 500, color: '#9C8463',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    margin: '0 0 0.7rem', fontFamily: SANS,
  },
  sanctuaryTagline: { fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px', lineHeight: 1.5, color: '#6B5C4A', margin: '0 0 0.6rem' },
  sanctuaryNote: { fontFamily: SERIF, fontSize: '13px', lineHeight: 1.6, color: '#8A7558', margin: 0 },

  // ---- CTA ----
  ctaBlock: { marginTop: '2.25rem', padding: '0 0.25rem' },
  primaryCta: {
    width: '100%', boxSizing: 'border-box', padding: '18px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '16px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: SANS,
    boxShadow: '0 6px 18px rgba(40,25,10,0.28)', letterSpacing: '0.02em',
  },
  ctaSub: {
    fontSize: '12px', color: '#9C8C78', fontFamily: SERIF, fontStyle: 'italic',
    textAlign: 'center', margin: '0.85rem 0 0', lineHeight: 1.5,
  },
  tertiaryCta: {
    width: '100%', boxSizing: 'border-box', padding: '14px', background: 'transparent', color: '#854F0B',
    border: '0.5px solid #DDCFB6', borderRadius: '14px', fontSize: '13px',
    fontWeight: 500, cursor: 'pointer', fontFamily: SANS, fontStyle: 'italic',
  },
  privacyNote: {
    fontSize: '11px', color: '#9C8C78', fontFamily: SERIF, fontStyle: 'italic',
    textAlign: 'center', margin: '1.75rem 0 0', lineHeight: 1.5,
  },
}