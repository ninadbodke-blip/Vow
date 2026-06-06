import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export default function ReplacementEngineCheck({ data, onSave, saving }) {
  const {
    version = 'first',
    pullFromArtifact = 'commit_day_4',
    pullPriorCheck,
    statusOptions,
    difficultyPrompt,
    difficultyOptions,
    adjustmentPrompt,
    adjustmentOptions,
    whatChangedPrompt,
    whatChangedOptions,
    freshStatusOptions,
    freshDifficultyOptions,
    freshAdjustmentOptions,
    freshAddPrompt,
    freshAddSubtext,
  } = data

  const isSecondCheck = version === 'second'

  const [loadingState, setLoadingState] = useState('loading')
  const [committedActivities, setCommittedActivities] = useState([])
  const [source, setSource] = useState('commit')
  const [freshInput, setFreshInput] = useState('')
  const [priorCheckData, setPriorCheckData] = useState(null)

  // Per-activity entries: { activityId: { status, difficulty, adjustment, whatChanged } }
  const [entries, setEntries] = useState({})

  // Phases: 'load' -> 'list' -> 'activity:<idx>' -> 'review'
  const [phase, setPhase] = useState('load')
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoadingState('no_user')
        return
      }

      const { data: commitArtifact } = await supabase
        .from('vow_artifacts')
        .select('content')
        .eq('user_id', user.id)
        .eq('artifact_type', pullFromArtifact)
        .maybeSingle()

      if (!commitArtifact?.content?.committed_activities) {
        setSource('fresh')
        setLoadingState('ready')
        setPhase('collect')
        return
      }

      setCommittedActivities(commitArtifact.content.committed_activities)

      if (isSecondCheck && pullPriorCheck) {
        const { data: priorArtifact } = await supabase
          .from('vow_artifacts')
          .select('content')
          .eq('user_id', user.id)
          .eq('artifact_type', pullPriorCheck)
          .maybeSingle()
        if (priorArtifact?.content) {
          setPriorCheckData(priorArtifact.content)
        }
      }

      setLoadingState('ready')
      setPhase('list')
    }
    load()
  }, [pullFromArtifact, pullPriorCheck, isSecondCheck])

  const statusOpts = source === 'fresh' ? (freshStatusOptions || statusOptions) : statusOptions
  const difficultyOpts = source === 'fresh' ? (freshDifficultyOptions || difficultyOptions) : difficultyOptions
  const adjustmentOpts = source === 'fresh' ? (freshAdjustmentOptions || adjustmentOptions) : adjustmentOptions

  const addFresh = () => {
    const t = freshInput.trim()
    if (!t || committedActivities.length >= 3) return
    if (committedActivities.some(a => a.label.toLowerCase() === t.toLowerCase())) { setFreshInput(''); return }
    setCommittedActivities(prev => [...prev, { activity: `fresh_${prev.length}_${Date.now()}`, label: t, frequency: null, duration: null, is_fresh: true }])
    setFreshInput('')
  }
  const removeFresh = (aid) => setCommittedActivities(prev => prev.filter(a => a.activity !== aid))

  const updateEntry = (activityId, field, value) => {
    setEntries(prev => ({
      ...prev,
      [activityId]: { ...(prev[activityId] || {}), [field]: value }
    }))
  }

  const openActivity = (idx) => {
    setActiveIdx(idx)
    setPhase(`activity:${idx}`)
  }

  const closeActivity = () => {
    setPhase('list')
  }

  const allEntriesComplete = committedActivities.every((activity, idx) => {
    const id = activity.activity || `idx_${idx}`
    const entry = entries[id]
    if (isSecondCheck) {
      return entry?.status && entry?.whatChanged
    }
    return entry?.status && entry?.adjustment
  })

  const finalize = () => {
    const checkData = committedActivities.map((activity, idx) => {
      const id = activity.activity || `idx_${idx}`
      const entry = entries[id] || {}
      return {
        activity_id: id,
        activity_label: activity.label,
        committed_frequency: activity.frequency,
        committed_duration: activity.duration,
        status: entry.status,
        difficulty: entry.difficulty,
        adjustment: entry.adjustment,
        what_changed: entry.whatChanged,
      }
    })

    onSave({
      version,
      source,
      check_data: checkData,
      checked_at: new Date().toISOString(),
    })
  }

  // ===================================================================
  // LOAD / NO DATA STATES
  // ===================================================================
  if (loadingState === 'loading') {
    return (
      <div style={{ ...styles.container, textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Loading your replacement engine...
        </p>
      </div>
    )
  }

  if (phase === 'collect') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{freshAddPrompt || 'What have you been reaching for?'}</h2>
        <p style={styles.subtext}>{freshAddSubtext || "Name one to three things you've actually been doing instead. They don't have to be impressive or even healthy. Just honest."}</p>

        <div style={styles.activityList}>
          {committedActivities.map(a => (
            <div key={a.activity} style={styles.freshChip}>
              <span style={styles.freshChipText}>{a.label}</span>
              <button onClick={() => removeFresh(a.activity)} style={styles.freshChipX}>×</button>
            </div>
          ))}
        </div>

        {committedActivities.length < 3 && (
          <div style={styles.freshInputRow}>
            <input
              type="text"
              value={freshInput}
              onChange={e => setFreshInput(e.target.value)}
              placeholder="e.g. walking, the gym, tea, scrolling, calling someone"
              style={styles.freshInput}
              onKeyDown={e => { if (e.key === 'Enter') addFresh() }}
            />
            <button onClick={addFresh} style={styles.freshAddBtn}>Add</button>
          </div>
        )}

        <div style={styles.footer}>
          <button
            onClick={() => setPhase('list')}
            disabled={committedActivities.length === 0}
            style={{ ...styles.primaryBtn, ...(committedActivities.length === 0 ? styles.primaryBtnDisabled : {}) }}
          >
            {committedActivities.length === 0 ? 'Add at least one' : 'Continue'}
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: LIST
  // ===================================================================
  if (phase === 'list') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{source === 'fresh' ? "What you've been reaching for." : 'Your replacement activities.'}</h2>
        <p style={styles.subtext}>
          {source === 'fresh' ? "Tap into each one to check how it's going and what you'll adjust." : "Tap into each one to check status and what you'll adjust."}
        </p>

        <div style={styles.activityList}>
          {committedActivities.map((activity, idx) => {
            const id = activity.activity || `idx_${idx}`
            const entry = entries[id]
            const isDone = isSecondCheck
              ? entry?.status && entry?.whatChanged
              : entry?.status && entry?.adjustment

            return (
              <button
                key={id}
                onClick={() => openActivity(idx)}
                style={{
                  ...styles.activityRow,
                  ...(isDone ? styles.activityRowDone : {}),
                }}
              >
                <div style={styles.activityLeft}>
                  <p style={styles.activityName}>{activity.label}</p>
                  {activity.frequency ? (
                    <p style={styles.activityCommitted}>Committed: {activity.frequency}, {activity.duration}</p>
                  ) : (
                    <p style={styles.activityCommitted}>Something you've been reaching for</p>
                  )}
                  {entry?.status && (
                    <p style={styles.activityStatus}>
                      Status: {statusOpts.find(o => o.id === entry.status)?.label}
                    </p>
                  )}
                </div>
                <div style={styles.activityRight}>
                  {isDone ? (
                    <div style={styles.doneCheck}>✓</div>
                  ) : (
                    <div style={styles.chevron}>›</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <p style={styles.countLine}>
            {Object.keys(entries).filter(id => {
              const e = entries[id]
              return isSecondCheck ? e?.status && e?.whatChanged : e?.status && e?.adjustment
            }).length} of {committedActivities.length} checked
          </p>
          <button
            onClick={() => setPhase('review')}
            disabled={!allEntriesComplete}
            style={{
              ...styles.primaryBtn,
              ...(!allEntriesComplete ? styles.primaryBtnDisabled : {}),
            }}
          >
            Review
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: ACTIVITY
  // ===================================================================
  if (phase.startsWith('activity:')) {
    const activity = committedActivities[activeIdx]
    const id = activity.activity || `idx_${activeIdx}`
    const entry = entries[id] || {}

    // Find prior check entry if second check
    let priorEntry = null
    if (isSecondCheck && priorCheckData?.check_data) {
      priorEntry = priorCheckData.check_data.find(c => c.activity_id === id)
    }

    return (
      <div style={styles.container}>
        <button onClick={closeActivity} style={styles.backLink}>‹ All activities</button>

        <h2 style={styles.activityHeader}>{activity.label}</h2>
        {activity.frequency ? (
          <p style={styles.activityHeaderSub}>Committed: {activity.frequency}, {activity.duration}</p>
        ) : (
          <p style={styles.activityHeaderSub}>Something you've been reaching for these 11 days</p>
        )}

        {priorEntry && (
          <div style={styles.priorCard}>
            <p style={styles.priorLabel}>On Day 11 you said:</p>
            <p style={styles.priorText}>
              Status: {statusOpts.find(o => o.id === priorEntry.status)?.label || priorEntry.status}
            </p>
          </div>
        )}

        {/* STATUS */}
        <div style={styles.field}>
          <p style={styles.fieldLabel}>Status</p>
          <div style={styles.optionList}>
            {statusOpts.map(opt => {
              const selected = entry.status === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => updateEntry(id, 'status', opt.id)}
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
        </div>

        {/* DIFFICULTY (first check only) */}
        {!isSecondCheck && entry.status && (
          <div style={styles.field}>
            <p style={styles.fieldLabel}>{difficultyPrompt}</p>
            <div style={styles.optionList}>
              {difficultyOpts.map(opt => {
                const selected = entry.difficulty === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => updateEntry(id, 'difficulty', opt.id)}
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
          </div>
        )}

        {/* ADJUSTMENT (first check only) */}
        {!isSecondCheck && entry.status && (
          <div style={styles.field}>
            <p style={styles.fieldLabel}>{adjustmentPrompt}</p>
            <div style={styles.optionList}>
              {adjustmentOpts.map(opt => {
                const selected = entry.adjustment === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => updateEntry(id, 'adjustment', opt.id)}
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
          </div>
        )}

        {/* WHAT CHANGED (second check only) */}
        {isSecondCheck && entry.status && (
          <div style={styles.field}>
            <p style={styles.fieldLabel}>{whatChangedPrompt}</p>
            <div style={styles.optionList}>
              {whatChangedOptions.map(opt => {
                const selected = entry.whatChanged === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => updateEntry(id, 'whatChanged', opt.id)}
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
          </div>
        )}

        <div style={styles.footer}>
          <button
            onClick={closeActivity}
            disabled={isSecondCheck ? !(entry.status && entry.whatChanged) : !(entry.status && entry.adjustment)}
            style={{
              ...styles.primaryBtn,
              ...((isSecondCheck ? !(entry.status && entry.whatChanged) : !(entry.status && entry.adjustment)) ? styles.primaryBtnDisabled : {}),
            }}
          >
            Done with this one
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVIEW
  // ===================================================================
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>Engine check, summarized.</h2>
      <p style={styles.subtext}>Adjustment is part of the work.</p>

      {committedActivities.map((activity, idx) => {
        const id = activity.activity || `idx_${idx}`
        const entry = entries[id] || {}
        return (
          <div key={id} style={styles.reviewCard}>
            <p style={styles.reviewActivityName}>{activity.label}</p>
            <p style={styles.reviewStatus}>
              Status: {statusOpts.find(o => o.id === entry.status)?.label}
            </p>
            {!isSecondCheck && entry.adjustment && (
              <p style={styles.reviewAdjustment}>
                Adjustment: {adjustmentOpts.find(o => o.id === entry.adjustment)?.label}
              </p>
            )}
            {isSecondCheck && entry.whatChanged && (
              <p style={styles.reviewAdjustment}>
                What changed: {whatChangedOptions.find(o => o.id === entry.whatChanged)?.label}
              </p>
            )}
          </div>
        )
      })}

      <div style={styles.footer}>
        <button onClick={() => setPhase('list')} style={styles.secondaryBtn}>‹ Back</button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Save the check'}
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
  noBaselineBlock: {
    background: '#FFF5EE',
    border: '1px solid #E0D5C2',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '1rem',
  },
  noBaselineTitle: {
    fontSize: '14px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.5rem',
  },
  noBaselineText: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
  },
  freshChip: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '12px 14px', background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '1px solid #C5572C', borderRadius: '12px' },
  freshChipText: { fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.4 },
  freshChipX: { background: 'none', border: 'none', color: '#854F0B', fontSize: '18px', lineHeight: 1, cursor: 'pointer', padding: '0 2px' },
  freshInputRow: { display: 'flex', gap: '8px', marginTop: '10px' },
  freshInput: { flex: 1, padding: '11px 13px', border: '1px solid #C5AE8A', borderRadius: '11px', fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', outline: 'none', background: 'white' },
  freshAddBtn: { padding: '0 18px', background: '#854F0B', color: '#FAF7F1', border: 'none', borderRadius: '11px', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer' },
  activityList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  activityRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    gap: '12px',
    transition: 'all 0.15s',
  },
  activityRowDone: {
    background: '#FDFBF6',
    border: '0.5px solid #C2D49A',
  },
  activityLeft: { flex: 1, minWidth: 0 },
  activityRight: { flexShrink: 0 },
  activityName: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 4px',
    lineHeight: 1.3,
  },
  activityCommitted: {
    fontSize: '11.5px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.3,
  },
  activityStatus: {
    fontSize: '11.5px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    margin: '4px 0 0',
    lineHeight: 1.3,
  },
  doneCheck: {
    width: '26px', height: '26px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '0.5px solid #C2D49A',
    color: '#3B6D11',
    fontSize: '14px', fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  chevron: {
    fontSize: '20px',
    color: '#854F0B',
    fontWeight: 500,
  },
  backLink: {
    background: 'transparent',
    border: 'none',
    color: '#854F0B',
    fontSize: '13px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: '4px 0',
    marginBottom: '1rem',
    fontWeight: 500,
  },
  activityHeader: {
    fontSize: '22px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.25rem',
    lineHeight: 1.3,
  },
  activityHeaderSub: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 1.5rem',
  },
  priorCard: {
    background: '#FDFBF6',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '1.25rem',
  },
  priorLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.35rem',
  },
  priorText: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0,
    lineHeight: 1.5,
  },
  field: { marginBottom: '1.5rem' },
  fieldLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.6rem',
  },
  optionList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  optionCard: {
    padding: '11px 13px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    fontSize: '13px', color: '#2A1F15',
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
  reviewCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '10px',
  },
  reviewActivityName: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.4rem',
    lineHeight: 1.3,
  },
  reviewStatus: {
    fontSize: '12px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.3rem',
    lineHeight: 1.4,
  },
  reviewAdjustment: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.4,
  },
  countLine: {
    fontSize: '11.5px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 8px', textAlign: 'center',
  },
  footer: { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' },
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