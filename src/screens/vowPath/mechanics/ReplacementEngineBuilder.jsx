import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export default function ReplacementEngineBuilder({ data, onSave, saving }) {
  const {
    inventoryHeader,
    inventorySubtext,
    activityCategories,
    allowCustom,
    customPrompt,
    starterPathLink,
    starterHeader,
    starterBody,
    starterOptions,
    commitHeader,
    commitSubtext,
    frequencyOptions,
    durationOptions,
    obstaclesHeader,
    obstaclesSubtext,
    obstacleOptions,
  } = data

  // Phases: 'inventory' -> 'starter' (optional) -> 'commit' -> 'sizing' -> 'obstacles' -> 'review'
  const [phase, setPhase] = useState('inventory')

  // Step 1: Inventory
  const [longlist, setLonglist] = useState([])
  const [customActivities, setCustomActivities] = useState([])
  const [customInput, setCustomInput] = useState('')

  // Step 2: Starter (only if user went down that path)
  const [usedStarterPath, setUsedStarterPath] = useState(false)
  const [starterChoice, setStarterChoice] = useState(null)

  // Step 3: Committed activities (up to 3)
  const [committed, setCommitted] = useState([])

  // Step 4: Per-activity sizing
  const [sizing, setSizing] = useState({}) // { activityId: { frequency, duration } }
  const [whyText, setWhyText] = useState('')

  // Step 5: Obstacles
  const [obstacles, setObstacles] = useState([])
  const [obstacleHandling, setObstacleHandling] = useState({})

  // Family
  const [substanceFamily, setSubstanceFamily] = useState('substance')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: progress } = await supabase
        .from('vow_path_progress')
        .select('substance_family')
        .eq('user_id', user.id)
        .maybeSingle()
      if (progress?.substance_family === 'behavior') {
        setSubstanceFamily('behavior')
      } else {
        setSubstanceFamily('substance')
      }
    }
    load()
  }, [])

  // Build a flat lookup of all activities (categories + starters + custom)
  const allActivitiesLookup = () => {
    const lookup = {}
    activityCategories.forEach(cat => {
      cat.items.forEach(item => { lookup[item.id] = item })
    })
    starterOptions.forEach(opt => { lookup[opt.id] = opt })
    customActivities.forEach((label, idx) => {
      lookup[`custom_${idx}`] = { id: `custom_${idx}`, label, emoji: '✨' }
    })
    return lookup
  }

  const toggleLonglist = (id) => {
    setLonglist(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const addCustomActivity = () => {
    const trimmed = customInput.trim()
    if (trimmed.length > 0 && customActivities.length < 3) {
      setCustomActivities([...customActivities, trimmed])
      setCustomInput('')
    }
  }

  const removeCustomActivity = (idx) => {
    const id = `custom_${idx}`
    setCustomActivities(customActivities.filter((_, i) => i !== idx))
    setLonglist(longlist.filter(x => x !== id))
    setCommitted(committed.filter(x => x !== id))
  }

  const toggleCommit = (id) => {
    if (committed.includes(id)) {
      setCommitted(committed.filter(x => x !== id))
      const newSizing = { ...sizing }
      delete newSizing[id]
      setSizing(newSizing)
    } else if (committed.length < 3) {
      setCommitted([...committed, id])
    }
  }

  const setSizingForActivity = (id, field, value) => {
    setSizing(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value }
    }))
  }

  const toggleObstacle = (id) => {
    setObstacles(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const setObstacleHandlingText = (id, text) => {
    setObstacleHandling(prev => ({ ...prev, [id]: text }))
  }

  const allCommittedSized = committed.every(id =>
    sizing[id]?.frequency && sizing[id]?.duration
  )

  const finalize = () => {
    const lookup = allActivitiesLookup()
    onSave({
      family: substanceFamily,
      longlist,
      custom_activities: customActivities,
      used_starter_path: usedStarterPath,
      starter_choice: starterChoice,
      committed_activities: committed.map(id => ({
        activity: id,
        label: lookup[id]?.label || id,
        frequency: sizing[id]?.frequency,
        duration: sizing[id]?.duration,
      })),
      obstacles,
      obstacle_handling: obstacleHandling,
      why_text: whyText.trim() || null,
    })
  }

  // ===================================================================
  // PHASE: INVENTORY
  // ===================================================================
  if (phase === 'inventory') {
    const totalSelected = longlist.length + customActivities.length

    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{inventoryHeader}</h2>
        <p style={styles.subtext}>{inventorySubtext}</p>

        {activityCategories.map(cat => (
          <div key={cat.key} style={styles.categoryBlock}>
            <p style={styles.categoryLabel}>{cat.label}</p>
            <div style={styles.activityGrid}>
              {cat.items.map(item => {
                const selected = longlist.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleLonglist(item.id)}
                    style={{
                      ...styles.activityCard,
                      ...(selected ? styles.activityCardSelected : {}),
                    }}
                  >
                    <div style={styles.activityEmoji}>{item.emoji}</div>
                    <div style={styles.activityLabel}>{item.label}</div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {allowCustom && (
          <div style={styles.customSection}>
            <p style={styles.categoryLabel}>Something else</p>

            {customActivities.map((label, idx) => (
              <div key={`ca_${idx}`} style={styles.customRow}>
                <span style={styles.customLabel}>✨ {label}</span>
                <button onClick={() => removeCustomActivity(idx)} style={styles.removeBtn}>×</button>
              </div>
            ))}

            {customActivities.length < 3 && (
              <div style={styles.customInputRow}>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={customPrompt}
                  style={styles.customInput}
                  onKeyDown={(e) => { if (e.key === 'Enter') addCustomActivity() }}
                />
                <button onClick={addCustomActivity} style={styles.customAddBtn}>Add</button>
              </div>
            )}
          </div>
        )}

        <div style={styles.divider}></div>

        <button
          onClick={() => {
            setUsedStarterPath(true)
            setPhase('starter')
          }}
          style={styles.starterPathLink}
        >
          {starterPathLink}
        </button>

        <div style={styles.footer}>
          <p style={styles.countLine}>{totalSelected} selected</p>
          <button
            onClick={() => setPhase('commit')}
            disabled={totalSelected === 0}
            style={{
              ...styles.primaryBtn,
              ...(totalSelected === 0 ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: STARTER
  // ===================================================================
  if (phase === 'starter') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{starterHeader}</h2>
        <div style={styles.starterBody}>
          {starterBody.split('\n\n').map((para, i) => (
            <p key={i} style={styles.starterPara}>{para}</p>
          ))}
        </div>

        <div style={styles.activityGrid}>
          {starterOptions.map(opt => {
            const selected = starterChoice === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setStarterChoice(opt.id)}
                style={{
                  ...styles.activityCard,
                  ...(selected ? styles.activityCardSelected : {}),
                }}
              >
                <div style={styles.activityEmoji}>{opt.emoji}</div>
                <div style={styles.activityLabel}>{opt.label}</div>
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button
            onClick={() => {
              setUsedStarterPath(false)
              setStarterChoice(null)
              setPhase('inventory')
            }}
            style={styles.secondaryBtn}
          >
            ‹ Back
          </button>
          <button
            onClick={() => {
              // Auto-add starter to longlist and committed
              if (starterChoice && !longlist.includes(starterChoice)) {
                setLonglist([...longlist, starterChoice])
              }
              if (starterChoice && !committed.includes(starterChoice)) {
                setCommitted([starterChoice])
              }
              setPhase('commit')
            }}
            disabled={!starterChoice}
            style={{
              ...styles.primaryBtnFlex,
              ...(!starterChoice ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: COMMIT
  // ===================================================================
  if (phase === 'commit') {
    const lookup = allActivitiesLookup()
    const eligibleIds = [...new Set([...longlist, ...customActivities.map((_, idx) => `custom_${idx}`)])]

    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{commitHeader}</h2>
        <p style={styles.subtext}>{commitSubtext}</p>

        <p style={styles.helper}>Pick up to 3. ({committed.length}/3 chosen)</p>

        <div style={styles.activityGrid}>
          {eligibleIds.map(id => {
            const item = lookup[id]
            if (!item) return null
            const selected = committed.includes(id)
            const disabled = !selected && committed.length >= 3
            return (
              <button
                key={id}
                onClick={() => !disabled && toggleCommit(id)}
                disabled={disabled}
                style={{
                  ...styles.activityCard,
                  ...(selected ? styles.activityCardSelected : {}),
                  ...(disabled ? styles.activityCardDisabled : {}),
                }}
              >
                <div style={styles.activityEmoji}>{item.emoji || '✨'}</div>
                <div style={styles.activityLabel}>{item.label}</div>
              </button>
            )
          })}
        </div>

        <div style={styles.field}>
          <label style={styles.fieldLabel}>Why these? (optional)</label>
          <input
            type="text"
            value={whyText}
            onChange={(e) => setWhyText(e.target.value)}
            placeholder="One sentence, if you want."
            style={styles.input}
            maxLength={140}
          />
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase(usedStarterPath ? 'starter' : 'inventory')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('sizing')}
            disabled={committed.length === 0}
            style={{
              ...styles.primaryBtnFlex,
              ...(committed.length === 0 ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: SIZING
  // ===================================================================
  if (phase === 'sizing') {
    const lookup = allActivitiesLookup()
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>How often, and how long?</h2>
        <p style={styles.subtext}>
          The commitment is small on purpose. The point is starting, not optimizing.
        </p>

        {committed.map(id => {
          const item = lookup[id]
          if (!item) return null
          return (
            <div key={id} style={styles.sizingCard}>
              <p style={styles.sizingActivity}>{item.emoji || '✨'} {item.label}</p>

              <div style={styles.sizingField}>
                <p style={styles.sizingFieldLabel}>How often</p>
                <div style={styles.chipRow}>
                  {frequencyOptions.map(f => {
                    const selected = sizing[id]?.frequency === f.id
                    return (
                      <button
                        key={f.id}
                        onClick={() => setSizingForActivity(id, 'frequency', f.id)}
                        style={{
                          ...styles.chip,
                          ...(selected ? styles.chipSelected : {}),
                        }}
                      >
                        {f.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={styles.sizingField}>
                <p style={styles.sizingFieldLabel}>How long (per session)</p>
                <div style={styles.chipRow}>
                  {durationOptions.map(d => {
                    const selected = sizing[id]?.duration === d.id
                    return (
                      <button
                        key={d.id}
                        onClick={() => setSizingForActivity(id, 'duration', d.id)}
                        style={{
                          ...styles.chip,
                          ...(selected ? styles.chipSelected : {}),
                        }}
                      >
                        {d.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}

        <div style={styles.footer}>
          <button onClick={() => setPhase('commit')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('obstacles')}
            disabled={!allCommittedSized}
            style={{
              ...styles.primaryBtnFlex,
              ...(!allCommittedSized ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: OBSTACLES
  // ===================================================================
  if (phase === 'obstacles') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{obstaclesHeader}</h2>
        <p style={styles.subtext}>{obstaclesSubtext}</p>

        <div style={styles.optionList}>
          {obstacleOptions.map(opt => {
            const selected = obstacles.includes(opt.id)
            return (
              <div key={opt.id}>
                <button
                  onClick={() => toggleObstacle(opt.id)}
                  style={{
                    ...styles.optionCard,
                    ...(selected ? styles.optionCardSelected : {}),
                  }}
                >
                  {opt.label}
                </button>
                {selected && (
                  <input
                    type="text"
                    value={obstacleHandling[opt.id] || ''}
                    onChange={(e) => setObstacleHandlingText(opt.id, e.target.value)}
                    placeholder="What's your handling for this?"
                    style={styles.handlingInput}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button onClick={() => setPhase('sizing')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('review')}
            style={styles.primaryBtnFlex}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REVIEW
  // ===================================================================
  const lookup = allActivitiesLookup()
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>Your engine.</h2>

      <div style={styles.engineCard}>
        <p style={styles.engineLabel}>Replacement activities</p>
        {committed.map(id => {
          const item = lookup[id]
          if (!item) return null
          const freq = frequencyOptions.find(f => f.id === sizing[id]?.frequency)?.label
          const dur = durationOptions.find(d => d.id === sizing[id]?.duration)?.label
          return (
            <div key={id} style={styles.engineActivity}>
              <p style={styles.engineActivityName}>{item.emoji || '✨'} {item.label}</p>
              <p style={styles.engineActivitySize}>{freq}, {dur}</p>
            </div>
          )
        })}

        {obstacles.length > 0 && (
          <>
            <div style={styles.engineDivider}></div>
            <p style={styles.engineLabel}>What might stop you</p>
            <ul style={styles.engineList}>
              {obstacles.map(id => {
                const obs = obstacleOptions.find(o => o.id === id)
                const handling = obstacleHandling[id]
                return obs ? (
                  <li key={id} style={styles.engineItem}>
                    <strong>{obs.label}</strong>
                    {handling && <> — {handling}</>}
                  </li>
                ) : null
              })}
            </ul>
          </>
        )}
      </div>

      <p style={styles.engineNote}>
        This is the engine. Not what you do when a craving hits — that's tomorrow. This is what will grow into the space across weeks and months.
      </p>

      <div style={styles.footer}>
        <button onClick={() => setPhase('obstacles')} style={styles.secondaryBtn}>‹ Back</button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Save the engine'}
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
  helper: {
    fontSize: '12px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 0 1rem', textAlign: 'center',
  },
  categoryBlock: { marginBottom: '1.25rem' },
  categoryLabel: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 0.6rem',
  },
  activityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  activityCard: {
    padding: '12px 10px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.15s',
  },
  activityCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  activityCardDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  activityEmoji: { fontSize: '22px', lineHeight: 1 },
  activityLabel: {
    fontSize: '11.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.35,
  },
  customSection: { marginBottom: '1.25rem' },
  customRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 12px',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    borderRadius: '10px',
    marginBottom: '6px',
  },
  customLabel: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
  },
  removeBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '18px',
    cursor: 'pointer', padding: 0, lineHeight: 1,
  },
  customInputRow: { display: 'flex', gap: '8px', marginTop: '6px' },
  customInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #C5AE8A',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    background: 'white',
  },
  customAddBtn: {
    padding: '0 16px',
    background: '#854F0B',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  divider: {
    height: '0.5px',
    background: '#E8DFD0',
    margin: '1.5rem 0',
  },
  starterPathLink: {
    background: 'transparent',
    border: 'none',
    color: '#854F0B',
    fontSize: '13px',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    padding: '8px',
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
    textUnderlineOffset: '4px',
    width: '100%',
    textAlign: 'center',
  },
  starterBody: { marginBottom: '1.5rem' },
  starterPara: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.7,
    margin: '0 0 1rem',
  },
  sizingCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '12px',
  },
  sizingActivity: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 1rem',
    lineHeight: 1.3,
  },
  sizingField: { marginBottom: '12px' },
  sizingFieldLabel: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    margin: '0 0 0.5rem',
    fontWeight: 500,
  },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  chip: {
    padding: '7px 12px',
    background: 'white',
    border: '0.5px solid #DDCFB6',
    borderRadius: '999px',
    fontSize: '12px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  chipSelected: {
    background: '#854F0B',
    border: '1px solid #854F0B',
    color: '#FAF7F1',
  },
  field: { marginTop: '1rem' },
  fieldLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.5rem',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '0.5px solid #E0D5C2',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    background: '#FDFBF6',
    outline: 'none',
    boxSizing: 'border-box',
  },
  optionList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  optionCard: {
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    fontSize: '13.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
    width: '100%',
  },
  optionCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  handlingInput: {
    width: '100%',
    marginTop: '6px',
    padding: '10px 12px',
    border: '0.5px solid #E0D5C2',
    borderRadius: '10px',
    fontSize: '12.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    background: '#FDFBF6',
    outline: 'none',
    boxSizing: 'border-box',
  },
  engineCard: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '1rem',
  },
  engineLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.75rem',
  },
  engineActivity: { marginBottom: '0.85rem' },
  engineActivityName: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.2rem',
    lineHeight: 1.3,
  },
  engineActivitySize: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  engineDivider: {
    height: '0.5px',
    background: '#E0D5C2',
    margin: '1rem 0',
  },
  engineList: { margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' },
  engineItem: {
    fontSize: '12.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    margin: '0 0 0.35rem',
  },
  engineNote: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1rem',
    textAlign: 'center',
  },
  countLine: {
    fontSize: '11.5px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 8px',
    textAlign: 'center',
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
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}