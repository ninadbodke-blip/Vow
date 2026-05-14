import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export default function EndurePortrait({ data, onSave, saving }) {
  const {
    pullFromArtifacts,
    composedHeader,
    composedSubtext,
    recognitionPrompt,
    recognitionOptions,
  } = data

  // Phases: 'load' -> 'compose' -> 'reveal' -> 'recognition'
  const [phase, setPhase] = useState('load')

  const [artifactsLoaded, setArtifactsLoaded] = useState({})
  const [portraitSections, setPortraitSections] = useState([])
  const [recognition, setRecognition] = useState(null)
  const [missingArtifacts, setMissingArtifacts] = useState([])

  // Load all 9 artifacts at once
  useEffect(() => {
    async function loadArtifacts() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: artifacts } = await supabase
        .from('vow_artifacts')
        .select('artifact_type, content')
        .eq('user_id', user.id)
        .in('artifact_type', pullFromArtifacts)

      const map = {}
      const missing = [...pullFromArtifacts]
      ;(artifacts || []).forEach(a => {
        map[a.artifact_type] = a.content
        const idx = missing.indexOf(a.artifact_type)
        if (idx >= 0) missing.splice(idx, 1)
      })

      setArtifactsLoaded(map)
      setMissingArtifacts(missing)

      // Build the portrait
      const sections = composePortrait(map)
      setPortraitSections(sections)

      setPhase('compose')
    }
    loadArtifacts()
  }, [pullFromArtifacts])

  const finalize = () => {
    onSave({
      portrait_sections: portraitSections,
      missing_artifacts: missingArtifacts,
      recognition_tap: recognition,
      composed_at: new Date().toISOString(),
    })
  }

  // ===================================================================
  // PHASE: LOAD
  // ===================================================================
  if (phase === 'load') {
    return (
      <div style={{ ...styles.container, textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Assembling your portrait from twenty days of work...
        </p>
      </div>
    )
  }

  // ===================================================================
  // PHASE: COMPOSE — preview before reveal
  // ===================================================================
  if (phase === 'compose') {
    return (
      <div style={styles.container}>
        <div style={styles.composeBlock}>
          <p style={styles.composeEyebrow}>Twenty days, assembled</p>
          <h2 style={styles.composeTitle}>Your portrait is ready.</h2>
          <p style={styles.composeText}>
            It was made from your own taps across Endure. The states you spent time in, the protected emotions you named, the AVE protocol you built, the shame statement, the capitals you mapped, the urges you held against, the values you ranked.
          </p>
          <p style={styles.composeTextSecondary}>
            None of this is generated. All of it is yours.
          </p>
          {missingArtifacts.length > 0 && (
            <p style={styles.composeMissing}>
              {missingArtifacts.length} sections couldn't be assembled from your data. The portrait is built from what is available.
            </p>
          )}
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('reveal')} style={styles.primaryBtn}>
            Read the portrait
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVEAL — the actual portrait
  // ===================================================================
  if (phase === 'reveal') {
    return (
      <div style={styles.container}>
        <div style={styles.portraitHeader}>
          <p style={styles.portraitEyebrow}>{composedHeader || 'Your portrait, in your own taps.'}</p>
          <h2 style={styles.portraitTitle}>Who you are now.</h2>
          <p style={styles.portraitSubtext}>{composedSubtext || 'Read it whole. No rush.'}</p>
          <div style={styles.portraitOrnament}>· · ·</div>
        </div>

        <div style={styles.portraitArticle}>
          {portraitSections.map((section, idx) => (
            <div key={idx} style={styles.portraitSection}>
              <p style={styles.portraitSectionHeading}>{section.heading}</p>
              {section.paragraphs.map((para, pidx) => (
                <p key={pidx} style={styles.portraitParagraph}>{para}</p>
              ))}
            </div>
          ))}
        </div>

        <div style={styles.portraitOrnamentEnd}>· · ·</div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('recognition')} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: RECOGNITION
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>{recognitionPrompt}</h2>
      <p style={styles.subtext}>One tap.</p>

      <div style={styles.optionList}>
        {recognitionOptions.map(opt => {
          const selected = recognition === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setRecognition(opt.id)}
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
        <button onClick={() => setPhase('reveal')} style={styles.secondaryBtn}>‹ Re-read</button>
        <button
          onClick={finalize}
          disabled={!recognition || saving}
          style={{
            ...styles.primaryBtnFlex,
            ...((!recognition || saving) ? styles.primaryBtnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Save the portrait'}
        </button>
      </div>
    </div>
  )
}

// =====================================================================
// PORTRAIT COMPOSER
// =====================================================================
// Reads the 9 source artifacts and assembles narrative sections.
// Each section uses real data from the user's taps.
// =====================================================================

function composePortrait(artifacts) {
  const sections = []

  // ----- Section 1: Where you have been (Day 2 + Day 18) -----
  const day2 = artifacts.endure_day_2
  const day18 = artifacts.endure_day_18

  if (day18?.ranked_states) {
    const dominant = stateLabel(day18.dominant_state)
    const secondary = stateLabel(day18.secondary_state)
    sections.push({
      heading: 'Where you have been',
      paragraphs: [
        `Across the past eighteen days, you spent most of your time in ${dominant}. Second-most in ${secondary}.`,
        `That oscillation pattern is yours. Without the substance, your nervous system moved between states differently than it used to. The new pattern is what you have been learning to recognize.`,
      ],
    })
  } else if (day2?.current_state) {
    const stateLbl = stateLabel(day2.current_state)
    sections.push({
      heading: 'Where you have been',
      paragraphs: [
        `When you first located yourself, on Day 2, you placed yourself in ${stateLbl}. The map of where you have been since is still being drawn.`,
      ],
    })
  }

  // ----- Section 2: What was underneath (Day 3) -----
  const day3 = artifacts.endure_day_3
  if (day3?.selected_emotions || day3?.custom_emotions) {
    const count = (day3.selected_emotions?.length || 0) + (day3.custom_emotions?.length || 0)
    const followUpId = day3.follow_up
    let followUpLine = ''
    if (followUpId === 'all_familiar') {
      followUpLine = `All of them were familiar before the substance was here.`
    } else if (followUpId === 'started_before') {
      followUpLine = `Most of them started long before the substance did.`
    } else if (followUpId === 'substance_made_them_worse') {
      followUpLine = `The substance made some of them worse over time.`
    } else if (followUpId === 'first_time_seeing') {
      followUpLine = `Some of them, you were seeing for the first time.`
    }

    sections.push({
      heading: 'What was underneath',
      paragraphs: [
        `You named ${count} ${count === 1 ? 'emotion' : 'emotions'} the substance was helping you not feel. ${followUpLine}`,
        `These are not the problem. They are the territory the substance was managing. Without it, they surface. The work is not to make them go away — it is to feel them without needing help.`,
      ],
    })
  }

  // ----- Section 3: What you built (Day 4 — AVE protocol) -----
  const day4 = artifacts.endure_day_4
  if (day4?.protocol) {
    sections.push({
      heading: 'What you built for a slip',
      paragraphs: [
        `On Day 4 you built the AVE protocol. The first-minute response, the first-hour response, the rest-of-the-day response, the reframe. It existed before any slip happened. That is what made it useful.`,
        `The slip-as-data, not slip-as-verdict, framing is yours now. A slip is information, not a sentence.`,
      ],
    })
  }

  // ----- Section 4: The shame story (Day 6) -----
  const day6 = artifacts.endure_day_6
  if (day6?.statement_parts) {
    const part1 = day6.statement_parts.find(p => p.component_id === 'who_i_am')
    if (part1?.picked_label && part1?.reframe) {
      sections.push({
        heading: 'The shame story, named',
        paragraphs: [
          `The shame said you were ${part1.picked_label.toLowerCase()}.`,
          `The more accurate description: ${part1.reframe.toLowerCase().replace(/\.$/, '')}.`,
          `Both are now on paper. The first is what the shame has been saying. The second is what is more honest.`,
        ],
      })
    }
  }

  // ----- Section 5: The flatness (Day 8) -----
  const day8 = artifacts.endure_day_8
  if (day8) {
    const flatCount = day8.flat_count || 0
    const availableCount = day8.still_available_count || 0
    if (flatCount > 0 || availableCount > 0) {
      sections.push({
        heading: 'The flatness, the openings',
        paragraphs: [
          `By Day 8 you named where the flatness was: ${flatCount} ${flatCount === 1 ? 'area' : 'areas'} of pleasure had gone quiet. The dopamine system, recalibrating.`,
          `You also named what was still available — ${availableCount} ${availableCount === 1 ? 'thing' : 'things'} that still landed. The flatness was real, but not absolute.`,
        ],
      })
    }
  }

  // ----- Section 6: Where the work goes next (Day 12 / Day 16) -----
  const day12 = artifacts.endure_day_12
  const day16 = artifacts.endure_day_16
  if (day12?.capital_scores) {
    const lowestKey = day16?.lowest_capital || findLowestCapital(day12.capital_scores)
    const lowestLabel = capitalLabel(lowestKey)
    const sectionLines = [
      `Your strongest capital is what is currently holding the work together. Your lowest capital — ${lowestLabel.toLowerCase()} — is where the next month focuses.`,
    ]
    if (day16?.commitment_text) {
      sectionLines.push(`The commitment you wrote: "${day16.commitment_text}"`)
    } else {
      sectionLines.push(`The specific work, the smallest commitment, is what comes after Endure.`)
    }
    sections.push({
      heading: 'Where the work goes next',
      paragraphs: sectionLines,
    })
  }

  // ----- Section 7: The honest data (Day 15) -----
  const day15 = artifacts.endure_day_15
  if (day15?.status) {
    let statusLine = ''
    if (day15.status === 'no_close_calls') {
      statusLine = `By Day 15 you had no close calls. The urge had been manageable. That is data, not a guarantee.`
    } else if (day15.status === 'close_calls_held') {
      statusLine = `By Day 15 you had close calls and held through each. The vow stayed intact.`
    } else if (day15.status === 'one_close_call') {
      statusLine = `By Day 15 you had one specific close call. You held.`
    } else if (day15.status === 'slipped_once') {
      statusLine = `By Day 15 you had slipped once. You used the AVE protocol you built on Day 4. The slip stayed a slip.`
    } else if (day15.status === 'slipped_more_than_once') {
      statusLine = `By Day 15 there had been more than one slip. You were continuing the work anyway. That continuation is what matters.`
    }
    sections.push({
      heading: 'The honest data',
      paragraphs: [statusLine],
    })
  }

  // ----- Section 8: What you value (Day 19) -----
  const day19 = artifacts.endure_day_19
  if (day19?.ranked_top_5 && day19.ranked_top_5.length > 0) {
    const top3 = day19.ranked_top_5.slice(0, 3).map(v => v.label.toLowerCase()).join(', ')
    sections.push({
      heading: 'What you value',
      paragraphs: [
        `On Day 19 you ranked your top five values. The top three: ${top3}.`,
        `These are the things you would not trade. The cultural capital built on values made explicit is what holds the work after the structured days end.`,
      ],
    })
  }

  // ----- Closing section -----
  sections.push({
    heading: 'Who you are now',
    paragraphs: [
      `You are not the substance. You are not the absence of the substance. You are the person who walked through twenty days, named what was underneath, built the protocol, mapped the nervous system, and held the vow.`,
      `That person is who reads this portrait. That person is who you have become through the doing.`,
    ],
  })

  return sections
}

// Helpers for label resolution
function stateLabel(stateId) {
  const map = {
    ventral: 'ventral vagal — safe and connected',
    sympathetic: 'sympathetic — mobilized',
    dorsal: 'dorsal vagal — shutdown',
  }
  return map[stateId] || stateId
}

function capitalLabel(key) {
  const map = {
    physical: 'Physical capital',
    human: 'Human capital',
    social: 'Social capital',
    cultural: 'Cultural capital',
  }
  return map[key] || key
}

function findLowestCapital(scores) {
  let lowest = null
  let lowestVal = Infinity
  Object.entries(scores).forEach(([k, v]) => {
    if (v < lowestVal) {
      lowest = k
      lowestVal = v
    }
  })
  return lowest
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
  composeBlock: {
    textAlign: 'center',
    padding: '2rem 1rem',
  },
  composeEyebrow: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.18em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 1rem',
  },
  composeTitle: {
    fontSize: '28px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.25,
    margin: '0 0 1.5rem',
  },
  composeText: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.75,
    margin: '0 0 1.25rem',
    maxWidth: '340px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  composeTextSecondary: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '300px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  composeMissing: {
    fontSize: '11.5px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '1.5rem 0 0',
    lineHeight: 1.5,
  },
  portraitHeader: {
    textAlign: 'center',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    marginBottom: '2rem',
  },
  portraitEyebrow: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.85rem',
  },
  portraitTitle: {
    fontSize: '32px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.2,
    margin: '0 0 0.85rem',
  },
  portraitSubtext: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.5,
    margin: '0 0 1.5rem',
  },
  portraitOrnament: {
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    marginTop: '1rem',
  },
  portraitOrnamentEnd: {
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    textAlign: 'center',
    margin: '2rem 0 1.5rem',
  },
  portraitArticle: {
    paddingBottom: '0.5rem',
  },
  portraitSection: {
    marginBottom: '2.25rem',
  },
  portraitSectionHeading: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontWeight: 500,
    margin: '0 0 1rem',
    paddingTop: '1rem',
    borderTop: '0.5px solid #E8DFD0',
    textAlign: 'center',
  },
  portraitParagraph: {
    fontSize: '16px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.85,
    margin: '0 0 1.25rem',
  },
  optionList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  optionCard: {
    padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    fontSize: '14px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer', textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
  },
  optionCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
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