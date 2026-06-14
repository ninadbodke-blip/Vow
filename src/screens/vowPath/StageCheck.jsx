import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import {
  STAGE_CHECK_QUESTIONS,
  LIKERT_OPTIONS,
  resolveQuestion,
} from './data/stageCheckQuestions'
import { scoreAssessment } from './data/stageScoring'

const QUESTIONS_PER_SCREEN = 5
const TOTAL_SCREENS = Math.ceil(STAGE_CHECK_QUESTIONS.length / QUESTIONS_PER_SCREEN)

export default function StageCheck() {
  const navigate = useNavigate()
  const [currentScreen, setCurrentScreen] = useState(0)
  const [responses, setResponses] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  const [substanceLabel, setSubstanceLabel] = useState(null)
  const [substanceVerb, setSubstanceVerb] = useState(null)
  const [primarySubstance, setPrimarySubstance] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load substance metadata from vow_path_progress
  useEffect(() => {
    async function loadSubstance() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/app/welcome')
        return
      }

      const { data: progress } = await supabase
        .from('vow_path_progress')
        .select('primary_substance, substance_label, substance_verb')
        .eq('user_id', user.id)
        .maybeSingle()

      // If no substance picked yet, route back to picker
      if (!progress?.substance_label) {
        navigate('/app/vow-path/substance')
        return
      }

      setPrimarySubstance(progress.primary_substance)
      setSubstanceLabel(progress.substance_label)
      setSubstanceVerb(progress.substance_verb)
      setLoading(false)
    }
    loadSubstance()
  }, [navigate])

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, textAlign: 'center', color: '#9C8C78', paddingTop: '4rem' }}>
          Loading...
        </div>
      </div>
    )
  }

  const startIdx = currentScreen * QUESTIONS_PER_SCREEN
  const endIdx = startIdx + QUESTIONS_PER_SCREEN
  const screenQuestions = STAGE_CHECK_QUESTIONS.slice(startIdx, endIdx)

  const isLastScreen = currentScreen === TOTAL_SCREENS - 1

  const allAnsweredOnScreen = screenQuestions.every(
    q => responses[q.id] !== undefined
  )

  const selectAnswer = (questionId, value) => {
    setResponses({ ...responses, [questionId]: value })
    if (showValidation) setShowValidation(false)
  }

  const goNext = async () => {
    if (!allAnsweredOnScreen) {
      setShowValidation(true)
      return
    }

    if (!isLastScreen) {
      setCurrentScreen(currentScreen + 1)
      setShowValidation(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/app/welcome'); return }

      const result = scoreAssessment(responses)

      const { error: insertError } = await supabase
        .from('urica_assessments')
        .insert({
          user_id: user.id,
          responses,
          scores: result.scores,
          override_rule_triggered: result.override_rule_triggered,
          assigned_stage: result.assigned_stage_slug,
          primary_substance: primarySubstance,
        })

      if (insertError) {
        console.error('Failed to save assessment:', insertError)
        alert('Could not save your results. Please try again.')
        setSubmitting(false)
        return
      }

      navigate(`/app/vow-path/result/${result.assigned_stage_slug}`)
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const goBack = () => {
    if (currentScreen === 0) {
      navigate('/app/vow-path/substance')
      return
    }
    setCurrentScreen(currentScreen - 1)
    setShowValidation(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.header}>
          <button onClick={goBack} style={styles.backBtn}>‹ Back</button>
          <p style={styles.headerTitle}>Stage Check</p>
          <div style={{ width: '40px' }}></div>
        </div>

        <div style={styles.progTrack}>
          <div style={{ ...styles.progFill, width: `${((currentScreen + 1) / TOTAL_SCREENS) * 100}%` }} />
        </div>

        <p style={styles.progressLabel}>
          Step {currentScreen + 1} of {TOTAL_SCREENS}
        </p>

        <p style={styles.scaleHint}>
          There are no right answers here. Read each line and mark how true it feels for you right now.
        </p>

        <div style={styles.questionsList}>
          {screenQuestions.map((q, idx) => {
            const answer = responses[q.id]
            const isUnanswered = showValidation && answer === undefined
            const resolvedText = resolveQuestion(q, substanceLabel, substanceVerb)
            return (
              <div
                key={q.id}
                style={{
                  ...styles.questionBlock,
                  ...(isUnanswered ? styles.questionBlockError : {}),
                }}
              >
                <p style={styles.questionNumber}>
                  Question {startIdx + idx + 1}
                </p>
                <p style={styles.questionText}>{resolvedText}</p>

                <div style={styles.scaleRow}>
                  {LIKERT_OPTIONS.map((opt) => {
                    const isSelected = answer === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => selectAnswer(q.id, opt.value)}
                        title={opt.label}
                        aria-label={opt.label}
                        style={styles.scaleSeg}
                      >
                        <span style={{
                          ...styles.scaleBar,
                          ...(isSelected ? styles.scaleBarSelected : {}),
                        }}>
                          {opt.value}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div style={styles.scaleEnds}>
                  <span style={styles.endCap}>Not true at all</span>
                  <span style={styles.endCap}>Completely true</span>
                </div>
              </div>
            )
          })}
        </div>

        {showValidation && !allAnsweredOnScreen && (
          <p style={styles.validationMsg}>
            Please answer all questions on this screen before continuing.
          </p>
        )}

        <button
          onClick={goNext}
          disabled={submitting}
          style={{
            ...styles.primaryBtn,
            ...(submitting ? styles.primaryBtnDisabled : {}),
          }}
        >
          {submitting
            ? 'Saving...'
            : (isLastScreen ? 'See your stage' : 'Next')}
        </button>

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
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '1.5rem 1.25rem 2rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  backBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
  },
  headerTitle: {
    fontSize: '17px', fontWeight: 500, color: '#2A1F15',
    margin: 0, fontFamily: 'Georgia, serif',
  },
  progTrack: {
    height: '3px', background: '#EAE0CE', borderRadius: '2px',
    overflow: 'hidden', marginBottom: '9px',
  },
  progFill: {
    height: '100%', background: 'linear-gradient(90deg,#D9B57A,#C9A85C)',
    borderRadius: '2px', transition: 'width 0.35s ease',
  },
  progressLabel: {
    fontSize: '11px', color: '#B0A18C',
    textTransform: 'uppercase', letterSpacing: '0.12em',
    margin: '0 0 1.5rem', textAlign: 'center', fontWeight: 500,
  },
  scaleHint: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textAlign: 'center', margin: '0 0 1.5rem',
    lineHeight: 1.5,
  },
  questionsList: {
    display: 'flex', flexDirection: 'column',
    gap: '16px', marginBottom: '1.5rem',
  },
  questionBlock: {
    background: '#FFFFFF',
    border: '0.5px solid #EDE4D2',
    borderRadius: '20px',
    padding: '22px 20px 18px',
    margin: 0,
    boxShadow: '0 4px 16px rgba(80,50,20,0.04)',
    transition: 'border-color 0.2s, background 0.2s',
  },
  questionBlockError: {
    background: '#FBF1ED',
    border: '0.5px solid #E8B59B',
  },
  questionNumber: {
    fontSize: '10px', color: '#C2B49A',
    textTransform: 'uppercase', letterSpacing: '0.16em',
    margin: '0 0 9px', fontWeight: 500,
  },
  questionText: {
    fontSize: '17px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.5,
    margin: '0 0 20px',
  },
  scaleRow: {
    display: 'flex', gap: '7px',
  },
  scaleSeg: {
    flex: 1, cursor: 'pointer', border: 'none', background: 'transparent',
    padding: 0, fontFamily: 'inherit',
  },
  scaleBar: {
    width: '100%', height: '40px', borderRadius: '11px', boxSizing: 'border-box',
    background: '#F6F0E4', border: '1px solid #ECE2CF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: 500, fontFamily: 'Georgia, serif', color: '#B0A18C',
    transition: 'all 0.16s ease',
  },
  scaleBarSelected: {
    background: 'linear-gradient(180deg,#D9B57A,#C9A85C)',
    border: '1px solid #BE9B54', color: '#3A2A1C', fontWeight: 600,
    boxShadow: '0 5px 14px rgba(201,168,92,0.32)', transform: 'translateY(-1px)',
  },
  scaleEnds: {
    display: 'flex', justifyContent: 'space-between',
    marginTop: '8px', padding: '0 2px',
  },
  endCap: {
    fontSize: '11px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#A89A82',
  },
  validationMsg: {
    fontSize: '12px',
    color: '#A14222',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
    margin: '0 0 1rem',
  },
  primaryBtn: {
    width: '100%', padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: {
    background: '#C9B894',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}