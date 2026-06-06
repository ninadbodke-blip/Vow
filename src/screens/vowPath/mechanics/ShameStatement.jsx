import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

// Day 6 (baseline) + Day 13 (revisit). Baseline builds a shame statement, shows it whole,
// then walks the reframes. Revisit reconstructs the parts from the saved Day 6 artifact.
export default function ShameStatement({ data, onSave, saving }) {
  const {
    version = 'baseline',
    introCard,
    components,
    statementHeader,
    statementSubtext,
    wholeHeader,
    wholeSubtext,
    reframeHeader,
    reframeSubtext,
    pullFromArtifact,
    revisitHeader,
    revisitSubtext,
    landingOptions,
  } = data

  const isRevisit = version === 'revisit'

  // baseline: 'intro' -> 'pick:0'..'pick:N' -> 'statement' -> 'review'
  // revisit:  'load'  -> 'land:0'..'land:N' -> 'review'
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
        setPhase('no_baseline')
      }
    }
    loadBaseline()
  }, [isRevisit, pullFromArtifact])

  // In revisit mode the component definitions come from the saved artifact (Day 13's config
  // doesn't carry them). Each reconstructed component has exactly the one option that was picked.
  const effectiveComponents = isRevisit
    ? (baselineData?.statement_parts || []).map((sp) => ({
        id: sp.component_id,
        prompt: sp.prompt,
        options: [{ id: sp.picked_option, label: sp.picked_label, reframe: sp.reframe }],
      }))
    : (components || [])

  const stepIdx = (() => {
    if (phase.startsWith('pick:')) return parseInt(phase.split(':')[1], 10)
    if (phase.startsWith('land:')) return parseInt(phase.split(':')[1], 10)
    return -1
  })()
  const currentComponent = stepIdx >= 0 ? effectiveComponents[stepIdx] : null

  const pickOption = (componentId, optionId) =>
    setPickedByComponent((prev) => ({ ...prev, [componentId]: optionId }))
  const setLanding = (componentId, landingId) =>
    setLandingByComponent((prev) => ({ ...prev, [componentId]: landingId }))

  const advance = () => {
    if (stepIdx < effectiveComponents.length - 1) {
      setPhase(isRevisit ? `land:${stepIdx + 1}` : `pick:${stepIdx + 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setPhase(isRevisit ? 'review' : 'statement')
      window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const optFor = (c) => c.options.find((o) => o.id === pickedByComponent[c.id])

  const finalize = () => {
    if (isRevisit) {
      onSave({
        version: 'revisit',
        baseline_picks: pickedByComponent,
        landing_by_component: landingByComponent,
        revisited_at: new Date().toISOString(),
      })
    } else {
      const statementParts = effectiveComponents.map((c) => {
        const opt = optFor(c)
        return {
          component_id: c.id,
          prompt: c.prompt,
          picked_option: pickedByComponent[c.id],
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
  // INTRO (baseline)
  // ===================================================================
  if (phase === 'intro') {
    return (
      <div style={styles.container}>
        <p style={styles.eyebrow}>Day 6 · Shame is not guilt</p>
        <h2 style={styles.prompt}>Before we start.</h2>
        <div style={styles.introCard}>
          <p style={styles.introText}>{introCard}</p>
        </div>
        <div style={styles.footer}>
          <button onClick={() => setPhase('pick:0')} style={styles.primaryBtn}>Begin</button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // LOAD / NO_BASELINE (revisit)
  // ===================================================================
  if (phase === 'load') {
    return (
      <div style={{ ...styles.container, textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Loading your Day 6 statement…</p>
      </div>
    )
  }
  if (phase === 'no_baseline') {
    return (
      <div style={styles.container}>
        <div style={styles.noBaselineBlock}>
          <p style={styles.noBaselineText}>We couldn't find your Day 6 shame statement. You can build one now, then return to today's exercise.</p>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PICK (baseline) — one part at a time
  // ===================================================================
  if (phase.startsWith('pick:') && currentComponent) {
    const picked = pickedByComponent[currentComponent.id]
    return (
      <div style={styles.container}>
        <p style={styles.progressLabel}>Part {stepIdx + 1} of {effectiveComponents.length}</p>
        <h2 style={styles.componentPrompt}>{currentComponent.prompt}</h2>
        <p style={styles.subtext}>Pick the one that cuts closest. There's no wrong answer here.</p>

        <div style={styles.optionList}>
          {currentComponent.options.map((opt) => {
            const selected = picked === opt.id
            return (
              <button key={opt.id} onClick={() => pickOption(currentComponent.id, opt.id)}
                style={{ ...styles.optionCard, ...(selected ? styles.optionCardSelected : {}) }}>
                {opt.label}
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button onClick={goBack} style={styles.secondaryBtn}>‹ Back</button>
          <button onClick={advance} disabled={!picked}
            style={{ ...styles.primaryBtnFlex, ...(!picked ? styles.primaryBtnDisabled : {}) }}>
            {stepIdx === effectiveComponents.length - 1 ? 'See the whole statement' : 'Continue'}
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // STATEMENT (baseline) — the assembled shame story, read whole
  // ===================================================================
  if (phase === 'statement') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{wholeHeader || 'What the shame has been saying.'}</h2>
        <p style={styles.subtext}>{wholeSubtext || 'Read it as one thing. This is the story it tells — not the situation you are in.'}</p>

        <div style={styles.shameDoc}>
          {effectiveComponents.map((c) => {
            const opt = optFor(c)
            if (!opt) return null
            return (
              <div key={c.id} style={styles.shamePart}>
                <p style={styles.shamePromptLine}>{c.prompt}</p>
                <p style={styles.shameLineWhole}>{opt.label}</p>
              </div>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase(`pick:${effectiveComponents.length - 1}`)} style={styles.secondaryBtn}>‹ Back</button>
          <button onClick={() => { setPhase('review'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={styles.primaryBtnFlex}>
            Now, the more accurate version
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // LAND (revisit) — one part at a time, legible reframe
  // ===================================================================
  if (phase.startsWith('land:') && currentComponent) {
    const baselineOpt = optFor(currentComponent)
    const landing = landingByComponent[currentComponent.id]
    return (
      <div style={styles.container}>
        <p style={styles.progressLabel}>Part {stepIdx + 1} of {effectiveComponents.length}</p>
        <h2 style={styles.componentPrompt}>{currentComponent.prompt}</h2>

        {baselineOpt && (
          <div style={styles.reframeBlock}>
            <p style={styles.shameSaidLabel}>On Day 6 you picked</p>
            <p style={styles.shameStruck}>{baselineOpt.label}</p>
            {baselineOpt.reframe && (
              <div style={styles.reframeInner}>
                <p style={styles.closerLabel}>Closer to true</p>
                <p style={styles.reframeProminent}>{baselineOpt.reframe}</p>
              </div>
            )}
          </div>
        )}

        <p style={styles.landingHeader}>How does it land now?</p>
        <div style={styles.optionList}>
          {landingOptions.map((opt) => {
            const selected = landing === opt.id
            return (
              <button key={opt.id} onClick={() => setLanding(currentComponent.id, opt.id)}
                style={{ ...styles.optionCard, ...(selected ? styles.optionCardSelected : {}) }}>
                {opt.label}
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          {stepIdx > 0 && <button onClick={goBack} style={styles.secondaryBtn}>‹ Back</button>}
          <button onClick={advance} disabled={!landing}
            style={{ ...styles.primaryBtnFlex, ...(!landing ? styles.primaryBtnDisabled : {}) }}>
            {stepIdx === effectiveComponents.length - 1 ? 'Review' : 'Continue'}
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // REVIEW — legible reframes (shame struck, reframe prominent)
  // ===================================================================
  const reviewH = isRevisit ? (revisitHeader || 'Your statement from Day 6.') : (reframeHeader || 'Closer to true.')
  const reviewS = isRevisit ? (revisitSubtext || 'How each part lands now.') : (reframeSubtext || 'The shame said one thing. Here is the more accurate version of each.')

  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>{reviewH}</h2>
      <p style={styles.subtext}>{reviewS}</p>

      <div style={styles.statementDocument}>
        {effectiveComponents.map((c) => {
          const opt = optFor(c)
          if (!opt) return null
          const landingId = landingByComponent[c.id]
          const landingOpt = landingOptions?.find((l) => l.id === landingId)
          return (
            <div key={c.id} style={styles.statementPart}>
              <p style={styles.partPrompt}>{c.prompt}</p>
              <p style={styles.shameSaidLabel}>The shame said</p>
              <p style={styles.shameStruck}>{opt.label}</p>
              {opt.reframe && (
                <div style={styles.reframeInner}>
                  <p style={styles.closerLabel}>Closer to true</p>
                  <p style={styles.reframeProminent}>{opt.reframe}</p>
                </div>
              )}
              {isRevisit && landingOpt && (
                <div style={styles.landingBadge}><span style={styles.landingBadgeText}>{landingOpt.label}</span></div>
              )}
            </div>
          )
        })}
      </div>

      <div style={styles.footer}>
        <button onClick={() => setPhase(isRevisit ? `land:${effectiveComponents.length - 1}` : 'statement')} style={styles.secondaryBtn}>‹ Back</button>
        <button onClick={finalize} disabled={saving} style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}>
          {saving ? 'Saving…' : 'Save the statement'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { paddingTop: '0.5rem' },
  eyebrow: { fontSize: '11px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: 'Georgia, serif', margin: '0 0 0.75rem' },
  prompt: { fontSize: '21px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.32, margin: '0 0 0.5rem' },
  subtext: { fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 1.25rem' },
  progressLabel: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.75rem' },
  introCard: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '0.5px solid #E0D5C2', borderRadius: '14px', padding: '16px', marginBottom: '1rem' },
  introText: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.65, margin: 0 },
  componentPrompt: { fontSize: '22px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.3, margin: '0 0 0.5rem' },
  optionList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  optionCard: { padding: '12px 14px', background: '#FDFBF6', border: '0.5px solid #E0D5C2', borderRadius: '11px', fontSize: '13.5px', color: '#3A2D1E', fontFamily: 'Georgia, serif', cursor: 'pointer', textAlign: 'left', lineHeight: 1.45, transition: 'all 0.15s', width: '100%' },
  optionCardSelected: { background: 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)', border: '1.5px solid #8A5A1A', boxShadow: '0 1px 6px rgba(110,68,16,0.12)', fontWeight: 600, color: '#5A3A0E' },

  // ----- assembled shame statement (the "whole story" beat) -----
  shameDoc: { background: 'linear-gradient(180deg, #2F2218 0%, #211610 100%)', borderRadius: '16px', padding: '22px 20px', marginBottom: '1rem', boxShadow: '0 6px 18px rgba(30,18,8,0.22)' },
  shamePart: { marginBottom: '1.1rem' },
  shamePromptLine: { fontSize: '11px', color: '#C9A96E', fontFamily: 'Georgia, serif', fontStyle: 'italic', letterSpacing: '0.04em', margin: '0 0 0.25rem' },
  shameLineWhole: { fontSize: '16px', color: '#F2E7D5', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: 0 },

  // ----- reframe display (LEGIBLE: shame struck + muted, reframe prominent) -----
  statementDocument: { background: '#FDFBF6', border: '1px solid #E0D5C2', borderRadius: '16px', padding: '18px 16px', marginBottom: '1rem', boxShadow: '0 4px 12px rgba(80,50,20,0.06)' },
  statementPart: { marginBottom: '1.4rem', paddingBottom: '1.2rem', borderBottom: '0.5px solid #ECE2D1' },
  partPrompt: { fontSize: '12px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 0.6rem', lineHeight: 1.4 },
  shameSaidLabel: { fontSize: '9.5px', color: '#B0A088', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 0.25rem' },
  shameStruck: { fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textDecoration: 'line-through', textDecorationColor: 'rgba(156,140,120,0.6)', lineHeight: 1.5, margin: '0 0 0.85rem' },
  reframeBlock: { background: '#FDFBF6', border: '0.5px solid #E0D5C2', borderRadius: '14px', padding: '14px', marginBottom: '1.25rem' },
  reframeInner: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F5EEDF 100%)', borderLeft: '3px solid #C5572C', borderRadius: '0 10px 10px 0', padding: '12px 14px' },
  closerLabel: { fontSize: '9.5px', color: '#C5572C', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 600, fontFamily: 'Georgia, serif', margin: '0 0 0.4rem' },
  reframeProminent: { fontSize: '15.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: 0 },

  landingHeader: { fontSize: '13px', color: '#854F0B', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 500, margin: '0 0 0.75rem' },
  landingBadge: { display: 'inline-block', background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '0.5px solid #E0D5C2', borderRadius: '999px', padding: '4px 12px', marginTop: '0.85rem' },
  landingBadgeText: { fontSize: '11px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic' },

  noBaselineBlock: { background: '#FFF5EE', border: '1px solid #E0D5C2', borderRadius: '14px', padding: '14px' },
  noBaselineText: { fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: 0 },

  footer: { marginTop: '1.5rem', display: 'flex', gap: '8px' },
  primaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  primaryBtnFlex: { flex: 1, padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  primaryBtnDisabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  secondaryBtn: { padding: '14px 20px', background: 'transparent', color: '#8A7355', border: '0.5px solid #D9C9B0', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif' },
}
