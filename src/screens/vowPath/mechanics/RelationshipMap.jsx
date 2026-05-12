// src/screens/vowPath/mechanics/RelationshipMap.jsx
import { useState } from 'react'

export default function RelationshipMap({ data, onComplete }) {
  const {
    minPeople = 3,
    maxPeople = 5,
    relationships,
    ageBands,
    questions,
    selfNamingPrompt,
    selfNamingOptions,
  } = data

  // Phases: 'name' -> 'questions' -> 'reveal' -> 'naming'
  const [phase, setPhase] = useState('name')

  // People list
  const [people, setPeople] = useState([])
  const [currentPersonName, setCurrentPersonName] = useState('')
  const [currentRelationship, setCurrentRelationship] = useState('')
  const [currentAgeBand, setCurrentAgeBand] = useState('')

  // Per-person answers — keyed by person index, then question id
  const [answers, setAnswers] = useState({})

  // Current state in the questions phase
  const [currentPersonIdx, setCurrentPersonIdx] = useState(0)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)

  // Self-naming
  const [selfNaming, setSelfNaming] = useState(null)

  // ---------------- Add person ----------------

  const canAddPerson = currentPersonName.trim().length > 0 &&
                       currentRelationship &&
                       currentAgeBand

  const addPerson = () => {
    if (!canAddPerson) return
    setPeople([...people, {
      name_or_initial: currentPersonName.trim(),
      relationship: currentRelationship,
      age_band: currentAgeBand,
    }])
    setCurrentPersonName('')
    setCurrentRelationship('')
    setCurrentAgeBand('')
  }

  const removePerson = (idx) => {
    setPeople(people.filter((_, i) => i !== idx))
  }

  const canProceedFromNaming = people.length >= minPeople

  // ---------------- Answer question ----------------

  const setAnswer = (personIdx, questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [personIdx]: {
        ...(prev[personIdx] || {}),
        [questionId]: optionId,
      }
    }))
  }

  const currentAnswer = answers[currentPersonIdx]?.[questions[currentQuestionIdx]?.id]

  const advanceQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1)
    } else if (currentPersonIdx < people.length - 1) {
      setCurrentPersonIdx(currentPersonIdx + 1)
      setCurrentQuestionIdx(0)
    } else {
      setPhase('reveal')
    }
  }

  // ---------------- Aggregated patterns ----------------

  const computeAggregated = () => {
    let stopped_bringing_up_count = 0
    let cant_remember_count = 0
    let treatment_changed_count = 0
    let has_child_under_18 = false

    people.forEach((p, idx) => {
      const a = answers[idx] || {}
      if (a.brings_it_up === 'used_to_stopped') stopped_bringing_up_count++
      if (a.brings_it_up === 'never') stopped_bringing_up_count++
      if (a.last_conversation === 'cant_remember' || a.last_conversation === 'this_year_unknown' || a.last_conversation === 'before_started') {
        cant_remember_count++
      }
      if (a.treatment_changed === 'yes_noticeably' || a.treatment_changed === 'yes_small' || a.treatment_changed === 'cooled_overall') {
        treatment_changed_count++
      }
      if (p.relationship === 'child' && p.age_band === 'under_18') {
        has_child_under_18 = true
      }
    })

    return {
      stopped_bringing_up_count,
      cant_remember_count,
      treatment_changed_count,
      has_child_under_18,
    }
  }

  const aggregated = computeAggregated()

  // ---------------- Helpers for display ----------------

  const findOptionLabel = (questionId, optionId) => {
    const q = questions.find(q => q.id === questionId)
    const opt = q?.options.find(o => o.id === optionId)
    return opt?.label || optionId
  }

  const findRelationshipLabel = (relId) => {
    return relationships.find(r => r.id === relId)?.label || relId
  }

  // ---------------- Finalize ----------------

  const finalize = () => {
    onComplete({
      people: people.map((p, idx) => ({
        ...p,
        ...(answers[idx] || {})
      })),
      aggregated_patterns: aggregated,
      self_naming: selfNaming,
    })
  }

  // ===================================================================
  // PHASE: NAME
  // ===================================================================
  if (phase === 'name') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>The 3-5 people closest to you.</h2>
        <p style={styles.subtext}>
          The people who are actually in your life. Not who you wish were closer. The ones who are.
        </p>

        {/* Already-named people */}
        {people.length > 0 && (
          <div style={styles.personList}>
            {people.map((p, idx) => (
              <div key={idx} style={styles.personRow}>
                <div>
                  <p style={styles.personName}>{p.name_or_initial}</p>
                  <p style={styles.personMeta}>
                    {findRelationshipLabel(p.relationship)} · {ageBands.find(a => a.id === p.age_band)?.label}
                  </p>
                </div>
                <button onClick={() => removePerson(idx)} style={styles.removeBtn}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Add person form */}
        {people.length < maxPeople && (
          <div style={styles.addForm}>
            <p style={styles.addFormTitle}>
              {people.length === 0 ? 'Name your first person.' : `Add another (${people.length}/${maxPeople})`}
            </p>

            <input
              type="text"
              value={currentPersonName}
              onChange={(e) => setCurrentPersonName(e.target.value)}
              placeholder="Name or initial"
              style={styles.input}
              maxLength={50}
            />

            <div style={styles.label}>Relationship</div>
            <div style={styles.optionRow}>
              {relationships.map(r => (
                <button
                  key={r.id}
                  onClick={() => setCurrentRelationship(r.id)}
                  style={{
                    ...styles.optionChip,
                    ...(currentRelationship === r.id ? styles.optionChipSelected : {}),
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div style={styles.label}>Age</div>
            <div style={styles.optionRow}>
              {ageBands.map(a => (
                <button
                  key={a.id}
                  onClick={() => setCurrentAgeBand(a.id)}
                  style={{
                    ...styles.optionChip,
                    ...(currentAgeBand === a.id ? styles.optionChipSelected : {}),
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <button
              onClick={addPerson}
              disabled={!canAddPerson}
              style={{
                ...styles.addBtn,
                ...(canAddPerson ? {} : styles.addBtnDisabled),
              }}
            >
              Add this person
            </button>
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.count}>
            {people.length} of {minPeople}-{maxPeople} added
            {people.length < minPeople ? ` · need ${minPeople - people.length} more` : ''}
          </p>
          <button
            onClick={() => setPhase('questions')}
            disabled={!canProceedFromNaming}
            style={{
              ...styles.primaryBtn,
              ...(canProceedFromNaming ? {} : styles.primaryBtnDisabled),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: QUESTIONS
  // ===================================================================
  if (phase === 'questions') {
    const person = people[currentPersonIdx]
    const question = questions[currentQuestionIdx]

    return (
      <div style={styles.container}>
        <p style={styles.progressLabel}>
          Person {currentPersonIdx + 1} of {people.length} · Question {currentQuestionIdx + 1} of {questions.length}
        </p>

        <h2 style={styles.questionPersonName}>{person.name_or_initial}</h2>
        <p style={styles.questionPersonMeta}>
          {findRelationshipLabel(person.relationship)}
        </p>

        <p style={styles.questionPrompt}>{question.prompt}</p>

        <div style={styles.optionList}>
          {question.options.map(opt => {
            const selected = currentAnswer === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setAnswer(currentPersonIdx, question.id, opt.id)}
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
          <button
            onClick={advanceQuestion}
            disabled={!currentAnswer}
            style={{
              ...styles.primaryBtn,
              ...(currentAnswer ? {} : styles.primaryBtnDisabled),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVEAL
  // ===================================================================
  if (phase === 'reveal') {
    return (
      <div style={styles.container}>
        <h2 style={styles.revealTitle}>The map.</h2>

        <div style={styles.personRevealList}>
          {people.map((p, idx) => {
            const a = answers[idx] || {}
            return (
              <div key={idx} style={styles.personRevealCard}>
                <p style={styles.personRevealName}>
                  {p.name_or_initial} — {findRelationshipLabel(p.relationship).toLowerCase()}
                </p>
                <div style={styles.personRevealAnswers}>
                  <p style={styles.answerRow}>
                    <span style={styles.answerLabel}>Last full conversation, no substance:</span>{' '}
                    <span style={styles.answerValue}>{findOptionLabel('last_conversation', a.last_conversation)}</span>
                  </p>
                  <p style={styles.answerRow}>
                    <span style={styles.answerLabel}>Brings up your use:</span>{' '}
                    <span style={styles.answerValue}>{findOptionLabel('brings_it_up', a.brings_it_up)}</span>
                  </p>
                  <p style={styles.answerRow}>
                    <span style={styles.answerLabel}>How they treat you:</span>{' '}
                    <span style={styles.answerValue}>{findOptionLabel('treatment_changed', a.treatment_changed)}</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div style={styles.aggregatedBlock}>
          <p style={styles.aggregatedTitle}>You named {people.length} people. Here's what you said:</p>
          <ul style={styles.aggregatedList}>
            {aggregated.stopped_bringing_up_count > 0 && (
              <li style={styles.aggregatedItem}>
                {aggregated.stopped_bringing_up_count} of them {aggregated.stopped_bringing_up_count === 1 ? 'has' : 'have'} either stopped bringing up your use, or never started.
              </li>
            )}
            {aggregated.cant_remember_count > 0 && (
              <li style={styles.aggregatedItem}>
                You can't remember the last fully-present conversation with {aggregated.cant_remember_count} of them.
              </li>
            )}
            {aggregated.treatment_changed_count > 0 && (
              <li style={styles.aggregatedItem}>
                {aggregated.treatment_changed_count} of them {aggregated.treatment_changed_count === 1 ? 'is' : 'are'} {aggregated.treatment_changed_count === 1 ? 'someone' : 'people'} whose treatment of you has changed.
              </li>
            )}
          </ul>
        </div>

        {aggregated.has_child_under_18 && (
          <div style={styles.specialCaseBlock}>
            <p style={styles.specialCaseText}>
              You named your child. They are under 18.
              <br /><br />
              They have known you only in the version of you that uses.
              <br /><br />
              They have no memory of you without this.
            </p>
          </div>
        )}

        <div style={styles.footer}>
          <button onClick={() => setPhase('naming')} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: NAMING
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>{selfNamingPrompt}</h2>

      <div style={styles.namingList}>
        {selfNamingOptions.map(opt => {
          const selected = selfNaming === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setSelfNaming(opt.id)}
              style={{
                ...styles.namingCard,
                ...(selected ? styles.namingCardSelected : {}),
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <div style={styles.footer}>
        <button
          onClick={finalize}
          disabled={!selfNaming}
          style={{
            ...styles.primaryBtn,
            ...(selfNaming ? {} : styles.primaryBtnDisabled),
          }}
        >
          Continue
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
  personList: {
    display: 'flex', flexDirection: 'column', gap: '8px',
    marginBottom: '1.25rem',
  },
  personRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
  },
  personName: {
    fontSize: '14px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0, lineHeight: 1.3,
  },
  personMeta: {
    fontSize: '11px', color: '#854F0B',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '2px 0 0', lineHeight: 1.3,
  },
  removeBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '20px',
    cursor: 'pointer', padding: '0 4px', lineHeight: 1,
  },
  addForm: {
    padding: '14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
  },
  addFormTitle: {
    fontSize: '12px', color: '#854F0B',
    fontFamily: 'Georgia, serif',
    textTransform: 'uppercase', letterSpacing: '0.12em',
    fontWeight: 500,
    margin: '0 0 0.85rem',
  },
  input: {
    width: '100%', padding: '10px 12px',
    border: '0.5px solid #E0D5C2',
    borderRadius: '10px',
    fontSize: '13.5px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    outline: 'none', background: '#FDFBF6',
    boxSizing: 'border-box',
    marginBottom: '0.85rem',
  },
  label: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 6px',
  },
  optionRow: {
    display: 'flex', flexWrap: 'wrap', gap: '6px',
    marginBottom: '0.85rem',
  },
  optionChip: {
    padding: '6px 12px',
    background: 'white',
    border: '0.5px solid #DDCFB6',
    borderRadius: '999px',
    fontSize: '12px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  optionChipSelected: {
    background: '#854F0B',
    border: '1px solid #854F0B',
    color: '#FAF7F1',
  },
  addBtn: {
    width: '100%', padding: '10px',
    background: '#F4ECDD', color: '#854F0B',
    border: '0.5px solid #E0D5C2',
    borderRadius: '10px',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'Georgia, serif',
  },
  addBtnDisabled: {
    opacity: 0.4, cursor: 'not-allowed',
  },
  progressLabel: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    margin: '0 0 0.75rem', textAlign: 'center',
  },
  questionPersonName: {
    fontSize: '22px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    margin: '0 0 0.25rem', textAlign: 'center',
  },
  questionPersonMeta: {
    fontSize: '12px', color: '#854F0B',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 1.5rem', textAlign: 'center',
  },
  questionPrompt: {
    fontSize: '15px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5, margin: '0 0 1.25rem',
  },
  optionList: {
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  optionCard: {
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    fontSize: '13.5px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
  },
  optionCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  revealTitle: {
    fontSize: '24px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    margin: '0 0 1.25rem', textAlign: 'center',
  },
  personRevealList: {
    display: 'flex', flexDirection: 'column', gap: '10px',
    marginBottom: '1.25rem',
  },
  personRevealCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px',
  },
  personRevealName: {
    fontSize: '15px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    margin: '0 0 0.85rem',
  },
  personRevealAnswers: {
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  answerRow: {
    fontSize: '12.5px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0, lineHeight: 1.5,
  },
  answerLabel: {
    color: '#854F0B', fontStyle: 'italic',
  },
  answerValue: {
    color: '#2A1F15',
  },
  aggregatedBlock: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '1rem',
  },
  aggregatedTitle: {
    fontSize: '13px', color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 0.75rem',
  },
  aggregatedList: {
    margin: 0, padding: '0 0 0 1rem',
    listStyle: 'disc',
  },
  aggregatedItem: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
    margin: '0 0 0.5rem',
  },
  specialCaseBlock: {
    background: '#FFF5EE',
    border: '1px solid #C5572C',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '1rem',
  },
  specialCaseText: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
  },
  namingList: {
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  namingCard: {
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
  namingCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  count: {
    fontSize: '11.5px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 8px', textAlign: 'center',
  },
  footer: {
    marginTop: '1.5rem',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  primaryBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: {
    opacity: 0.4, cursor: 'not-allowed',
    boxShadow: 'none',
  },
}