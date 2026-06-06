import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export default function CapitalAssessment({ data, onSave, saving }) {
  const {
    version = 'baseline',
    capitals = [],
    summaryHeader,
    summarySubtext,
    pullFromArtifact,
    deepDivePrompt,
    physicalAreas,
    humanAreas,
    socialAreas,
    culturalAreas,
    commitmentPrompt,
  } = data

  const isDeepDive = version === 'deep_dive'

  // Baseline phases: 'capital:0' -> 'capital:1' -> 'capital:2' -> 'capital:3' -> 'summary'
  // Deep dive phases: 'load' -> 'reveal_lowest' -> 'pick_area' -> 'commitment' -> 'review'
  const [phase, setPhase] = useState(isDeepDive ? 'load' : 'capital:0')

  // Baseline state
  const [taps, setTaps] = useState({}) // { itemId: true }

  // Deep dive state
  const [baselineData, setBaselineData] = useState(null)
  const [lowestCapitalKey, setLowestCapitalKey] = useState(null)
  const [pickedArea, setPickedArea] = useState(null)
  const [commitmentText, setCommitmentText] = useState('')

  // Load baseline for deep dive
  useEffect(() => {
    if (!isDeepDive) return
    async function load() {
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
        // Find lowest capital by score
        const scores = artifact.content.capital_scores || {}
        let lowestKey = null
        let lowestScore = Infinity
        Object.entries(scores).forEach(([key, score]) => {
          if (score < lowestScore) {
            lowestScore = score
            lowestKey = key
          }
        })
        setLowestCapitalKey(lowestKey)
        setPhase('reveal_lowest')
      } else {
        setPhase('no_baseline')
      }
    }
    load()
  }, [isDeepDive, pullFromArtifact])

  const currentCapitalIdx = phase.startsWith('capital:') ? parseInt(phase.split(':')[1], 10) : -1
  const currentCapital = currentCapitalIdx >= 0 ? capitals[currentCapitalIdx] : null

  const toggleTap = (itemId) => {
    setTaps(prev => {
      const next = { ...prev }
      if (next[itemId]) delete next[itemId]
      else next[itemId] = true
      return next
    })
  }

  const capitalScore = (capital) => {
    return capital.items.filter(item => taps[item.id]).length
  }

  const advance = () => {
    if (currentCapitalIdx < capitals.length - 1) {
      setPhase(`capital:${currentCapitalIdx + 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setPhase('summary')
    }
  }

  const goBack = () => {
    if (currentCapitalIdx > 0) {
      setPhase(`capital:${currentCapitalIdx - 1}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const finalizeBaseline = () => {
    const scores = {}
    capitals.forEach(c => {
      scores[c.key] = capitalScore(c)
    })

    const tapsArray = Object.keys(taps)
    const totalScore = tapsArray.length
    const totalPossible = capitals.reduce((sum, c) => sum + c.items.length, 0)

    onSave({
      version: 'baseline',
      capital_scores: scores,
      tapped_items: tapsArray,
      total_score: totalScore,
      total_possible: totalPossible,
      assessed_at: new Date().toISOString(),
    })
  }

  const finalizeDeepDive = () => {
    onSave({
      version: 'deep_dive',
      lowest_capital: lowestCapitalKey,
      picked_area: pickedArea,
      commitment_text: commitmentText.trim() || null,
      assessed_at: new Date().toISOString(),
    })
  }

  // ===================================================================
  // BASELINE — CAPITAL PHASE
  // ===================================================================
  if (currentCapital) {
    return (
      <div style={styles.container}>
        <p style={styles.progressLabel}>
          Capital {currentCapitalIdx + 1} of {capitals.length}
        </p>

        <h2 style={styles.capitalHeader}>{currentCapital.label}</h2>
        <p style={styles.subtext}>{currentCapital.description}</p>

        <div style={styles.itemList}>
          {currentCapital.items.map(item => {
            const tapped = !!taps[item.id]
            return (
              <button
                key={item.id}
                onClick={() => toggleTap(item.id)}
                style={{
                  ...styles.item,
                  ...(tapped ? styles.itemTapped : {}),
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <p style={styles.countLine}>
            {capitalScore(currentCapital)} of {currentCapital.items.length} true for you
          </p>
          {currentCapitalIdx > 0 ? (
            <div style={styles.btnRow}>
              <button onClick={goBack} style={styles.secondaryBtn}>‹ Back</button>
              <button onClick={advance} style={styles.primaryBtnFlex}>
                {currentCapitalIdx === capitals.length - 1 ? 'See the baseline' : 'Next capital'}
              </button>
            </div>
          ) : (
            <button onClick={advance} style={styles.primaryBtn}>
              Next capital
            </button>
          )}
        </div>
      </div>
    )
  }

  // ===================================================================
  // BASELINE — SUMMARY
  // ===================================================================
  if (phase === 'summary') {
    const _sorted = capitals.map(c => ({ label: c.label, pct: c.items.length ? capitalScore(c) / c.items.length : 0 })).sort((a, b) => b.pct - a.pct)
    const _strongest = _sorted[0] && _sorted[0].label
    const _thinnest = _sorted[_sorted.length - 1] && _sorted[_sorted.length - 1].label
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{summaryHeader || 'Your baseline.'}</h2>
        <p style={styles.subtext}>{summarySubtext || ''}</p>

        <div style={styles.scoresCard}>
          {capitals.map(c => {
            const score = capitalScore(c)
            const total = c.items.length
            const pct = (score / total) * 100
            return (
              <div key={c.key} style={styles.scoreRow}>
                <div style={styles.scoreLabel}>{c.label}</div>
                <div style={styles.scoreBar}>
                  <div
                    style={{
                      ...styles.scoreFill,
                      width: `${pct}%`,
                    }}
                  ></div>
                </div>
                <div style={styles.scoreNum}>{score}/{total}</div>
              </div>
            )
          })}
        </div>

        <div style={{ background: 'linear-gradient(180deg, #FBF6EA 0%, #F5EEDF 100%)', borderLeft: '3px solid #C5572C', borderRadius: '0 12px 12px 0', padding: '14px 16px' }}>
          <p style={{ fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', margin: '0 0 0.5rem', lineHeight: 1.5 }}>Strongest right now: {_strongest}. Thinnest: {_thinnest}.</p>
          <p style={{ fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>Most people lean hard on one or two of these and let the rest thin out. The thin one isn't a failure \u2014 it's where the next month has the most to give. On Day 16 you'll go deeper there.</p>
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase(`capital:${capitals.length - 1}`)} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={finalizeBaseline}
            disabled={saving}
            style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
          >
            {saving ? 'Saving...' : 'Save the baseline'}
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // DEEP DIVE — LOAD STATES
  // ===================================================================
  if (phase === 'load') {
    return (
      <div style={{ ...styles.container, textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Loading your Day 12 baseline...
        </p>
      </div>
    )
  }

  if (phase === 'no_baseline') {
    return (
      <div style={styles.container}>
        <div style={styles.noBaselineBlock}>
          <p style={styles.noBaselineText}>
            We couldn't find your Day 12 capital baseline. The deep dive needs the baseline to identify the lowest capital. Use the back button to complete Day 12 first.
          </p>
        </div>
      </div>
    )
  }

  // ===================================================================
  // DEEP DIVE — REVEAL LOWEST
  // ===================================================================
  if (phase === 'reveal_lowest') {
    const lowestCapital = capitals.find(c => c.key === lowestCapitalKey)
    return (
      <div style={styles.container}>
        <p style={styles.eyebrow}>Your weakest capital</p>
        <h2 style={styles.capitalHeader}>{lowestCapital?.label}</h2>
        <p style={styles.subtext}>{lowestCapital?.description}</p>

        <div style={styles.lowestNote}>
          <p style={styles.lowestNoteText}>
            This is where the next month of work focuses. Not all at once — one specific area, smallest commitment.
          </p>
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('pick_area')} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // DEEP DIVE — PICK AREA
  // ===================================================================
  if (phase === 'pick_area') {
    const areasMap = {
      physical: physicalAreas,
      human: humanAreas,
      social: socialAreas,
      cultural: culturalAreas,
    }
    const areas = areasMap[lowestCapitalKey] || []

    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{deepDivePrompt}</h2>
        <p style={styles.subtext}>Pick one. The point is not to do everything — it's to do one thing.</p>

        <div style={styles.optionList}>
          {areas.map(area => {
            const selected = pickedArea === area.id
            return (
              <button
                key={area.id}
                onClick={() => setPickedArea(area.id)}
                style={{
                  ...styles.optionCard,
                  ...(selected ? styles.optionCardSelected : {}),
                }}
              >
                {area.label}
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('reveal_lowest')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('commitment')}
            disabled={!pickedArea}
            style={{
              ...styles.primaryBtnFlex,
              ...(!pickedArea ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // DEEP DIVE — COMMITMENT
  // ===================================================================
  if (phase === 'commitment') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{commitmentPrompt}</h2>
        <p style={styles.subtext}>
          One sentence. The smallest version of the commitment, not the ideal one. Smaller is more durable.
        </p>

        <textarea
          value={commitmentText}
          onChange={(e) => setCommitmentText(e.target.value)}
          placeholder="In the next 30 days, I will..."
          style={styles.textarea}
          rows={4}
          maxLength={300}
        />

        <p style={styles.helper}>
          {commitmentText.length} characters
        </p>

        <div style={styles.footer}>
          <button onClick={() => setPhase('pick_area')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('review')}
            disabled={commitmentText.trim().length < 10}
            style={{
              ...styles.primaryBtnFlex,
              ...(commitmentText.trim().length < 10 ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // DEEP DIVE — REVIEW
  // ===================================================================
  const areasMap = {
    physical: physicalAreas,
    human: humanAreas,
    social: socialAreas,
    cultural: culturalAreas,
  }
  const areas = areasMap[lowestCapitalKey] || []
  const pickedAreaObj = areas.find(a => a.id === pickedArea)
  const lowestCapital = capitals.find(c => c.key === lowestCapitalKey)

  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>Your focus.</h2>
      <p style={styles.subtext}>For the next 30 days.</p>

      <div style={styles.reviewCard}>
        <p style={styles.reviewLabel}>Capital</p>
        <p style={styles.reviewBig}>{lowestCapital?.label}</p>
      </div>

      <div style={styles.reviewCard}>
        <p style={styles.reviewLabel}>Specific area</p>
        <p style={styles.reviewBig}>{pickedAreaObj?.label}</p>
      </div>

      <div style={styles.reviewCard}>
        <p style={styles.reviewLabel}>Your commitment</p>
        <p style={styles.reviewMessage}>{commitmentText}</p>
      </div>

      <div style={styles.footer}>
        <button onClick={() => setPhase('commitment')} style={styles.secondaryBtn}>‹ Back</button>
        <button
          onClick={finalizeDeepDive}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Save'}
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
  eyebrow: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.18em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.6rem',
  },
  capitalHeader: {
    fontSize: '24px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 0.5rem',
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
  itemList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  item: {
    padding: '11px 13px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '10px',
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer', textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
    width: '100%',
  },
  itemTapped: {
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '1px solid #7A8C5A',
    boxShadow: '0 2px 8px rgba(122,140,90,0.15)',
  },
  scoresCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '1rem',
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '0.85rem',
  },
  scoreLabel: {
    fontSize: '12px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    width: '90px',
    flexShrink: 0,
  },
  scoreBar: {
    flex: 1,
    height: '6px',
    background: '#EFE7D7',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #C5572C 0%, #854F0B 100%)',
    borderRadius: '999px',
    transition: 'width 0.4s ease-out',
  },
  scoreNum: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontVariantNumeric: 'tabular-nums',
    width: '40px',
    textAlign: 'right',
    flexShrink: 0,
  },
  summaryNote: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1rem',
    textAlign: 'center',
  },
  lowestNote: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '1rem',
  },
  lowestNoteText: {
    fontSize: '13.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: 0,
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
  textarea: {
    width: '100%',
    padding: '14px',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    background: '#FDFBF6',
    outline: 'none',
    boxSizing: 'border-box',
    lineHeight: 1.65,
    resize: 'vertical',
    minHeight: '120px',
  },
  helper: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '8px 0 0',
    textAlign: 'right',
  },
  reviewCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '10px',
  },
  reviewLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.5rem',
  },
  reviewBig: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: 0,
    lineHeight: 1.4,
  },
  reviewMessage: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  countLine: {
    fontSize: '11.5px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 8px', textAlign: 'center',
  },
  footer: { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' },
  btnRow: { display: 'flex', gap: '8px' },
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