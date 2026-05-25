import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { STAGE_ORDER } from './utils/stageAccess'

// =====================================================================
// VOW PATH HUB
// =====================================================================
// Central navigation surface for the paid Vow Path program.
// Shows all 6 stages, adapts to user state:
//   - Pre-assessment: stages are informational; primary CTA = take Stage Check.
//   - Post-assessment: current stage → overview, visited stages → library,
//     locked stages → no nav.
// =====================================================================

const STAGES = [
  {
    key: 'notice',
    number: '01',
    label: 'Notice',
    clinical: 'Pre-contemplation',
    duration: '5 days',
    tagline: 'Looking carefully, before you know what you\'re looking at.',
    description: 'For the part of yourself that doesn\'t yet think the using is a problem. Watching the patterns. Surfacing what you already know.',
    accent: '#A89B85',
  },
  {
    key: 'reflect',
    number: '02',
    label: 'Reflect',
    clinical: 'Contemplation',
    duration: '21 days',
    tagline: 'Sitting with whether this matters.',
    description: 'Three weeks of structured looking. Your reasons, your trigger patterns, the costs of use, the fears on both sides. No commitments yet.',
    accent: '#C9A96E',
  },
  {
    key: 'commit',
    number: '03',
    label: 'Commit',
    clinical: 'Preparation',
    duration: '10 days',
    tagline: 'Gathering yourself.',
    description: 'Ten days of preparation. A stop date. The map of your environment. Your anchor person. The library for the hard moments. The sealed vow.',
    accent: '#B57842',
  },
  {
    key: 'endure',
    number: '04',
    label: 'Endure',
    clinical: 'Action',
    duration: '21 days',
    tagline: 'Walking through.',
    description: 'For the early sobriety stretch. The cravings, the flatness, the sleep, the using voice. Working with what surfaces, not against it.',
    accent: '#C5572C',
  },
  {
    key: 'build',
    number: '05',
    label: 'Build',
    clinical: 'Maintenance',
    duration: '9 weekly entries',
    tagline: 'Living the vow.',
    description: 'Nine weekly entries across about twelve weeks. Identity, practice, the life on the other side. Slower, deliberately so.',
    accent: '#854F0B',
  },
  {
    key: 'reclaim',
    number: '06',
    label: 'Reclaim',
    clinical: 'Recycling',
    duration: '5 days',
    tagline: 'Beginning again.',
    description: 'Five days of quiet acts. No required writing. After a slip — the work is to interrupt the cascade and step back at the matched place.',
    accent: '#9C6E5A',
  },
]

const STAGES_WITH_LIBRARY = ['notice', 'reflect', 'commit', 'endure']

export default function VowPathIntro() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(null)
  const [visitedStages, setVisitedStages] = useState(new Set())

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/welcome'); return }

      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('current_stage')
        .eq('user_id', user.id)
        .maybeSingle()

      setProgress(progressRow)

      const { data: artifacts } = await supabase
        .from('vow_artifacts')
        .select('stage')
        .eq('user_id', user.id)

      const visited = new Set(
        (artifacts || []).map(a => a.stage).filter(Boolean)
      )
      setVisitedStages(visited)
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
      // Reclaim is reached by re-checking in after a slip — a recent slip
      // routes you there via the scoring matrix, without disturbing progress.
      navigate('/vow-path/check')
      return
    }
    if (status === 'current') {
      navigate(`/vow-path/${stageKey}`)
      return
    }
    if (status === 'visited') {
      // Past stage — open it fully for exploration.
      navigate(`/vow-path/${stageKey}`)
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

  const currentStageObj = currentStage ? STAGES.find(s => s.key === currentStage) : null

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* HEADER */}
        <div style={styles.header}>
          <button onClick={() => navigate('/home')} style={styles.backBtn}>‹ Home</button>
          <p style={styles.headerTitle}>Vow Path</p>
          <div style={{ width: '60px' }}></div>
        </div>

        {/* HERO */}
        <div style={styles.heroBlock}>
          <p style={styles.eyebrow}>The program</p>
          <h1 style={styles.heroTitle}>
            Six stages,<br/>one journey.
          </h1>
          <p style={styles.heroTagline}>
            Designed by the research.<br/>Walked at your pace.
          </p>
          <div style={styles.heroDivider}></div>
        </div>

        {/* CURRENT STATUS — only after assessment */}
        {hasAssessment && currentStageObj && (
          <div style={styles.statusBanner}>
            <p style={styles.statusEyebrow}>You are at</p>
            <p style={styles.statusStage}>{currentStageObj.label}</p>
            <p style={styles.statusMeta}>
              <em>{currentStageObj.clinical}</em> · {currentStageObj.duration}
            </p>
          </div>
        )}

        {/* INTRO COPY — only pre-assessment */}
        {!hasAssessment && (
          <div style={styles.introBlock}>
            <p style={styles.introPara}>
              The Vow Path is six structured programs in one — each one tailored
              to a stage of the journey from first noticing a substance to a year
              past quitting.
            </p>
            <p style={styles.introPara}>
              The path that works for someone in early sobriety is not the path
              that works for someone still considering whether to change. Before
              we begin, you'll take a short assessment so we can place you at
              the right stage.
            </p>
          </div>
        )}

        {/* STAGE TILES */}
        <div style={styles.tilesBlock}>
          {STAGES.map((stage) => {
            const status = getStageStatus(stage.key)
            const isTappable = status === 'current' || status === 'visited' || status === 'relapse_support'

            const tileStyle = {
              ...styles.tile,
              ...(status === 'current' ? styles.tileCurrent : {}),
              ...(status === 'visited' ? styles.tileVisited : {}),
              ...(status === 'relapse_support' ? styles.tileRelapse : {}),
              ...(status === 'locked' ? styles.tileLocked : {}),
              ...(status === 'pre_assessment' ? styles.tilePreAssessment : {}),
              ...(isTappable ? {} : { cursor: 'default' }),
            }

            return (
              <button
                key={stage.key}
                onClick={() => handleStageTap(stage.key)}
                disabled={!isTappable}
                style={tileStyle}
              >
                {/* Left accent bar — stage-specific color */}
                <span
                  style={{
                    ...styles.accentBar,
                    background: stage.accent,
                    opacity: status === 'locked' ? 0.35 : 1,
                  }}
                ></span>

                <div style={styles.tileLeft}>
                  <span style={styles.tileNumber}>{stage.number}</span>
                </div>

                <div style={styles.tileBody}>
                  <h3 style={{
                    ...styles.tileLabel,
                    ...(status === 'locked' ? styles.dimmedText : {}),
                  }}>
                    {stage.label}
                  </h3>
                  <p style={{
                    ...styles.tileMeta,
                    ...(status === 'locked' ? styles.dimmedText : {}),
                  }}>
                    {stage.duration} · <em>{stage.clinical}</em>
                  </p>
                  <p style={{
                    ...styles.tileTagline,
                    ...(status === 'locked' ? styles.dimmedText : {}),
                  }}>
                    {stage.tagline}
                  </p>
                  <p style={{
                    ...styles.tileDescription,
                    ...(status === 'locked' ? styles.dimmedTextDeep : {}),
                  }}>
                    {stage.description}
                  </p>
                </div>

                <div style={styles.tileRight}>
                  {status === 'current' && (
                    <span style={styles.tagCurrent}>Continue</span>
                  )}
                  {status === 'visited' && (
                    <span style={styles.tagVisited}>Revisit</span>
                  )}
                  {status === 'relapse_support' && (
                    <span style={styles.tagRelapse}>Support</span>
                  )}
                  {status === 'locked' && (
                    <span style={styles.lockIcon}>🔒</span>
                  )}
                  {status === 'pre_assessment' && (
                    <span style={styles.preDot}>·</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* CTA */}
        <div style={styles.ctaBlock}>
          {!hasAssessment ? (
            <>
              <button
                onClick={() => navigate('/vow-path/substance')}
                style={styles.primaryCta}
              >
                Take the Stage Check
              </button>
              <p style={styles.ctaSub}>
                15 questions. About two minutes. Honest answers, in private.
              </p>
            </>
          ) : (
            <button
              onClick={() => navigate('/vow-path/check')}
              style={styles.tertiaryCta}
            >
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
    background: '#FAF7F1',
    maxWidth: '460px',
    width: '100%',
    borderRadius: '32px',
    padding: '1.5rem 1.25rem 2.5rem',
    boxShadow: '0 18px 50px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  backBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
    minWidth: '60px', textAlign: 'left',
  },
  headerTitle: {
    fontSize: '14px', fontWeight: 500, color: '#9C8C78',
    margin: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
  },

  // HERO
  heroBlock: {
    textAlign: 'center',
    padding: '2.5rem 0.5rem 1.5rem',
  },
  eyebrow: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.24em',
    fontWeight: 500,
    margin: '0 0 1.5rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  heroTitle: {
    fontSize: '42px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.08,
    letterSpacing: '-0.01em',
    margin: '0 0 1.5rem',
  },
  heroTagline: {
    fontSize: '15px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: '0 auto 2rem',
    maxWidth: '320px',
  },
  heroDivider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, #D9C28A 50%, transparent 100%)',
    width: '60%',
    margin: '0 auto',
  },

  // STATUS BANNER (post-assessment)
  statusBanner: {
    textAlign: 'center',
    padding: '1.5rem 1rem',
    margin: '0 0 1.5rem',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0CDB3',
    borderRadius: '18px',
    boxShadow: '0 3px 12px rgba(80,50,20,0.05)',
  },
  statusEyebrow: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontWeight: 500,
    margin: '0 0 0.5rem',
  },
  statusStage: {
    fontSize: '26px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.35rem',
    lineHeight: 1.1,
  },
  statusMeta: {
    fontSize: '12px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    margin: 0,
  },

  // INTRO COPY (pre-assessment)
  introBlock: {
    padding: '0 0.5rem',
    marginBottom: '2rem',
  },
  introPara: {
    fontSize: '14.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.75,
    margin: '0 0 1.1rem',
  },

  // TILES
  tilesBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '2rem',
  },
  tile: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    padding: '1.1rem 1rem 1.1rem 1.4rem',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '18px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    gap: '14px',
    transition: 'all 0.18s ease-out',
    boxShadow: '0 3px 10px rgba(80,50,20,0.05)',
    overflow: 'hidden',
  },
  tileCurrent: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C9A96E',
    boxShadow: '0 4px 16px rgba(180,130,60,0.18)',
  },
  tileVisited: {
    background: 'linear-gradient(180deg, #FDFBF6 0%, #F8F1E1 100%)',
    border: '0.5px solid #DDCFB6',
  },
  tileLocked: {
    background: 'linear-gradient(180deg, #F4EFE3 0%, #ECE4D2 100%)',
    border: '0.5px solid #DCD1BD',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  tilePreAssessment: {
    cursor: 'default',
  },
  tileRelapse: {
    background: 'linear-gradient(180deg, #FCF7F4 0%, #F6EDE7 100%)',
    border: '0.5px dashed #D8C3B6',
    boxShadow: '0 2px 8px rgba(120,80,60,0.06)',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '3px',
    background: '#C5572C',
  },
  tileLeft: {
    flexShrink: 0,
    width: '38px',
    paddingTop: '2px',
  },
  tileNumber: {
    fontSize: '20px',
    fontFamily: 'Georgia, serif',
    fontWeight: 400,
    color: '#854F0B',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.04em',
  },
  tileBody: {
    flex: 1,
    minWidth: 0,
  },
  tileLabel: {
    fontSize: '22px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.25rem',
    lineHeight: 1.2,
  },
  tileMeta: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 500,
    margin: '0 0 0.6rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  tileTagline: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.5,
    margin: '0 0 0.5rem',
  },
  tileDescription: {
    fontSize: '13px',
    color: '#5C4E3D',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.6,
    margin: 0,
  },
  dimmedText: {
    color: '#9C8C78',
  },
  dimmedTextDeep: {
    color: '#B5A990',
  },
  tileRight: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'flex-start',
    paddingTop: '4px',
    minWidth: '70px',
    justifyContent: 'flex-end',
  },
  tagCurrent: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#FAF7F1',
    background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)',
    padding: '5px 11px',
    borderRadius: '999px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    boxShadow: '0 2px 6px rgba(197,87,44,0.3)',
  },
  tagVisited: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#854F0B',
    background: '#F4ECDD',
    border: '0.5px solid #E0D5C2',
    padding: '5px 11px',
    borderRadius: '999px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  tagRelapse: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#8A5A44',
    background: '#F3E7E0',
    border: '0.5px solid #E2CFC4',
    padding: '5px 11px',
    borderRadius: '999px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  lockIcon: {
    fontSize: '14px',
    opacity: 0.35,
  },
  preDot: {
    fontSize: '20px',
    color: '#C9BBA6',
    lineHeight: 1,
  },

  // CTA
  ctaBlock: {
    marginTop: '2rem',
    padding: '0 0.25rem',
  },
  primaryCta: {
    width: '100%',
    padding: '18px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '0 6px 18px rgba(40,25,10,0.28)',
    letterSpacing: '0.02em',
  },
  ctaSub: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0.85rem 0 0',
    lineHeight: 1.5,
  },
  tertiaryCta: {
    width: '100%',
    padding: '14px',
    background: 'transparent',
    color: '#854F0B',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontStyle: 'italic',
  },
  privacyNote: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '1.5rem 0 0',
    lineHeight: 1.5,
  },
}