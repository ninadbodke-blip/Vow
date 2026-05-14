import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export default function ShameStatement({ data, onSave, saving }) {
  const {
    version = 'baseline',
    introCard,
    components,
    statementHeader,
    statementSubtext,
    pullFromArtifact,
    revisitHeader,
    revisitSubtext,
    landingOptions,
  } = data

  const isRevisit = version === 'revisit'

  // For baseline: phases: 'intro' -> 'pick:0' -> 'pick:1' -> ... -> 'review'
  // For revisit: phases: 'load' -> 'land:0' -> 'land:1' -> ... -> 'review'
  const [phase, setPhase] = useState(isRevisit ? 'load' : 'intro')
  const [pickedByComponent, setPickedByComponent] = useState({}) // { componentId: optionId }
  const [baselineData, setBaselineData] = useState(null)
  const [landingByComponent, setLandingByComponent] = useState({}) // { componentId: landingId }

  // Load baseline artifact for revisit mode
  useEffect(() => {
    if (!isRevisit) return
    async function loadBaseline() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: artifact } = await supabase
        .from('vow_artifacts')
        .select('content')
        .eq('user_id', user.id)
        .eq('artifact_type', pullFromArtifact)
        .maybeSingle()
      if (artifact?.content) {
        setBaselineData(artifact.content)
        setPickedByComponent(artifact.content.picked_by_component || {})
        setPhase('land:0')
      } else {
        // No baseline found — fall back to message
        setPhase('no_baseline')
      }
    }
    loadBaseline()
  }, [isRevisit, pullFromArtifact])

  // Active step index
  const stepIdx = (() => {
    if (phase.startsWith('pick:')) return parseInt(phase.split(':')[1], 10)
    if (phase.startsWith('land:')) return parseInt(phase.split(':')[1], 10)
    return -1
  })()

  const currentComponent = stepIdx >= 0 ? components[stepIdx] : null

  const pickOption = (componentId, optionId) => {
    setPickedByComponent(prev => ({ ...prev, [componentId]: optionId }))
  }

  const setLanding = (componentId, landingId) => {
    setLandingByComponent(prev => ({ ...prev, [componentId]: landingId }))
  }

  const advance = () => {
    if (stepIdx < components.length - 1) {
      setPhase(isRevisit ? `land:${stepIdx + 1}` : `pick:${stepIdx + 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setPhase('review')
    }
  }

  const goBack = () => {
    if (stepIdx > 0) {
      setPhase(isRevisit ? `land:${stepIdx - 1}` : `pick:${stepIdx - 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (!isRevisit) {
      setPhase('intro')
    }
  }

  const finalize = () => {
    if (isRevisit) {
      onSave({
        version: 'revisit',
        baseline_picks: pickedByComponent,
        landing_by_component: landingByComponent,
        revisited_at: new Date().toISOString(),
      })
    } else {
      // Build statement text from picks
      const statementParts = components.map(c => {
        const optId = pickedByComponent[c.id]
        const opt = c.options.find(o => o.id === optId)
        return {
          component_id: c.id,
          prompt: c.prompt,
          picked_option: optId,
          picked_label: opt?.label,
          reframe: opt?.reframe,
        }
      })
      onSave({
        version: 'baseline',
        picked_by_component: pickedByComponent,
        statement_parts: statementParts,
        built_at: new Date().toISOString(),
      })
    }
  }

  // ===================================================================
  // INTRO (baseline only)
  // ===================================================================
  if (phase === 'intro') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>Before we start.</h2>

        <div style={styles.introCard}>
          <p style={styles.introText}>{introCard}</p>
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('pick:0')} style={styles.primaryBtn}>
            Begin
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // LOAD (revisit only — waiting state)
  // ===================================================================
  if (phase === 'load') {
    return (
      <div style={{ ...styles.container, textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Loading your Day 6 statement...
        </p>
      </div>
    )
  }

  if (phase === 'no_baseline') {
    return (
      <div style={styles.container}>
        <div style={styles.noBaselineBlock}>
          <p style={styles.noBaselineText}>
            We couldn't find your Day 6 shame statement. You can build one now, then return to today's exercise.
          </p>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PICK (baseline) — one component at a time
  // ===================================================================
  if (phase.startsWith('pick:') && currentComponent) {
    const picked = pickedByComponent[currentComponent.id]

    return (
      <div style={styles.container}>
        <p style={styles.progressLabel}>
          Part {stepIdx + 1} of {components.length}
        </p>

        <h2 style={styles.componentPrompt}>{currentComponent.prompt}</h2>
        <p style={styles.subtext}>Pick the one that most closely fits.</p>

        <div style={styles.optionList}>
          {currentComponent.options.map(opt => {
            const selected = picked === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => pickOption(currentComponent.id, opt.id)}
                style={{
                  ...styles.optionCard,
                  ...(selected ? styles.optionCardSelected : {}),
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button onClick={goBack} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={advance}
            disabled={!picked}
            style={{
              ...styles.primaryBtnFlex,
              ...(!picked ? styles.primaryBtnDisabled : {}),
            }}
          >
            {stepIdx === components.length - 1 ? 'See the statement' : 'Continue'}
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // LAND (revisit) — one component at a time
  // ===================================================================
  if (phase.startsWith('land:') && currentComponent) {
    const baselineOptId = pickedByComponent[currentComponent.id]
    const baselineOpt = currentComponent.options.find(o => o.id === baselineOptId)
    const landing = landingByComponent[currentComponent.id]

    return (
      <div style={styles.container}>
        <p style={styles.progressLabel}>
          Part {stepIdx + 1} of {components.length}
        </p>

        <h2 style={styles.componentPrompt}>{currentComponent.prompt}</h2>

        {baselineOpt && (
          <div style={styles.baselineCard}>
            <p style={styles.baselineLabel}>On Day 6 you picked:</p>
            <p style={styles.baselineText}>{baselineOpt.label}</p>
            {baselineOpt.reframe && (
              <>
                <div style={styles.baselineDivider}></div>
                <p style={styles.baselineLabel}>The reframe:</p>
                <p style={styles.baselineReframe}>{baselineOpt.reframe}</p>
              </>
            )}
          </div>
        )}

        <p style={styles.landingHeader}>How does it land now?</p>

        <div style={styles.optionList}>
          {landingOptions.map(opt => {
            const selected = landing === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setLanding(currentComponent.id, opt.id)}
                style={{
                  ...styles.optionCard,
                  ...(selected ? styles.optionCardSelected : {}),
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          {stepIdx > 0 && (
            <button onClick={goBack} style={styles.secondaryBtn}>‹ Back</button>
          )}
          <button
            onClick={advance}
            disabled={!landing}
            style={{
              ...styles.primaryBtnFlex,
              ...(!landing ? styles.primaryBtnDisabled : {}),
            }}
          >
            {stepIdx === components.length - 1 ? 'Review' : 'Continue'}
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // REVIEW
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>{statementHeader || 'Your statement.'}</h2>
      <p style={styles.subtext}>{statementSubtext || 'Read it whole.'}</p>

      <div style={styles.statementDocument}>
        {components.map((c, idx) => {
          const optId = pickedByComponent[c.id]
          const opt = c.options.find(o => o.id === optId)
          if (!opt) return null

          const landingId = landingByComponent[c.id]
          const landingOpt = landingOptions?.find(l => l.id === landingId)

          return (
            <div key={c.id} style={styles.statementPart}>
              <p style={styles.statementPrompt}>{c.prompt}</p>
              <p style={styles.statementPick}>{opt.label}</p>
              {opt.reframe && (
                <>
                  <p style={styles.statementReframeLabel}>The reframe:</p>
                  <p style={styles.statementReframe}>{opt.reframe}</p>
                </>
              )}
              {isRevisit && landingOpt && (
                <div style={styles.landingBadge}>
                  <span style={styles.landingBadgeText}>{landingOpt.label}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={styles.footer}>
        <button
          onClick={() => setPhase(isRevisit ? `land:${components.length - 1}` : `pick:${components.length - 1}`)}
          style={styles.secondaryBtn}
        >
          ‹ Back
        </button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Save the statement'}
        </button>
      </div>
    </div>
  )
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
    margin: '0 0 0.75rem',
  },
  introCard: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '1rem',
  },
  introText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: 0,
  },
  componentPrompt: {
    fontSize: '22px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 0.5rem',
  },
  optionList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  optionCard: {
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    fontSize: '13.5px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer', textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
    width: '100%',
  },
  optionCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  baselineCard: {
    background: '#FDFBF6',
    border: '0.5px solid #E0D5C2',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '1.25rem',
  },
  baselineLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.4rem',
  },
  baselineText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
    margin: '0 0 0.5rem',
  },
  baselineDivider: {
    height: '0.5px',
    background: '#E0D5C2',
    margin: '0.85rem 0',
  },
  baselineReframe: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
  },
  landingHeader: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    margin: '0 0 0.75rem',
  },
  statementDocument: {
    background: '#FDFBF6',
    border: '1px solid #E0D5C2',
    borderRadius: '16px',
    padding: '20px 18px',
    marginBottom: '1rem',
    boxShadow: '0 4px 12px rgba(80,50,20,0.06)',
  },
  statementPart: {
    marginBottom: '1.5rem',
    paddingBottom: '1.25rem',
    borderBottom: '0.5px solid #E8DFD0',
  },
  statementPrompt: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 0.5rem',
    lineHeight: 1.4,
  },
  statementPick: {
    fontSize: '14.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.55,
    margin: '0 0 0.75rem',
  },
  statementReframeLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.3rem',
  },
  statementReframe: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: 0,
  },
  landingBadge: {
    display: 'inline-block',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '999px',
    padding: '4px 12px',
    marginTop: '0.6rem',
  },
  landingBadgeText: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  noBaselineBlock: {
    background: '#FFF5EE',
    border: '1px solid #E0D5C2',
    borderRadius: '14px',
    padding: '14px',
  },
  noBaselineText: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
  },
  footer: { marginTop: '1.5rem', display: 'flex', gap: '8px' },
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