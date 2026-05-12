import { useState } from 'react'

export default function ConversationPlanner({ data, onSave, saving }) {
  const { conversations, selfNamingPrompt, selfNamingOptions } = data

  // Phases: 'list' (overview) -> 'draft:<id>' -> 'review' -> 'naming'
  const [phase, setPhase] = useState('list')

  // Per-conversation drafts: { conversationId: { willHave, draft } }
  const [convoState, setConvoState] = useState({})
  const [activeId, setActiveId] = useState(null)
  const [selfNaming, setSelfNaming] = useState(null)

  const updateConvo = (id, field, value) => {
    setConvoState(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value }
    }))
  }

  const openDraft = (id) => {
    const convo = conversations.find(c => c.id === id)
    setActiveId(id)
    // Pre-fill with starter if no draft yet
    if (!convoState[id]?.draft && convo?.messageStarter) {
      updateConvo(id, 'draft', convo.messageStarter)
    }
    setPhase(`draft:${id}`)
  }

  const skipConvo = (id) => {
    updateConvo(id, 'willHave', 'skipped')
    setPhase('list')
  }

  const completeDraft = () => {
    updateConvo(activeId, 'willHave', 'planned')
    setActiveId(null)
    setPhase('list')
  }

  const plannedCount = conversations.filter(c => convoState[c.id]?.willHave === 'planned').length
  const skippedCount = conversations.filter(c => convoState[c.id]?.willHave === 'skipped').length
  const decidedCount = plannedCount + skippedCount

  const allDecided = decidedCount === conversations.length

  const finalize = () => {
    onSave({
      conversations: conversations.map(c => ({
        id: c.id,
        label: c.label,
        will_have: convoState[c.id]?.willHave || 'undecided',
        draft: convoState[c.id]?.draft || null,
      })),
      planned_count: plannedCount,
      skipped_count: skippedCount,
      self_naming: selfNaming,
    })
  }

  // ===================================================================
  // PHASE: LIST
  // ===================================================================
  if (phase === 'list') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>The conversations.</h2>
        <p style={styles.subtext}>
          Tap into each one. Decide if it applies. If it does, draft what you'd say.
        </p>

        <div style={styles.convoList}>
          {conversations.map(convo => {
            const state = convoState[convo.id]
            const isPlanned = state?.willHave === 'planned'
            const isSkipped = state?.willHave === 'skipped'

            return (
              <button
                key={convo.id}
                onClick={() => openDraft(convo.id)}
                style={{
                  ...styles.convoCard,
                  ...(isPlanned ? styles.convoCardPlanned : {}),
                  ...(isSkipped ? styles.convoCardSkipped : {}),
                }}
              >
                <div style={styles.convoCardLeft}>
                  <p style={styles.convoLabel}>{convo.label}</p>
                  {isPlanned && <p style={styles.convoStatus}>Drafted</p>}
                  {isSkipped && <p style={styles.convoStatus}>Skipped</p>}
                  {!state && <p style={styles.convoStatusPending}>Tap to plan</p>}
                </div>
                <div style={styles.convoCardRight}>
                  {isPlanned && <div style={styles.convoCheck}>✓</div>}
                  {isSkipped && <div style={styles.convoSkip}>—</div>}
                  {!state && <div style={styles.convoChevron}>›</div>}
                </div>
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <p style={styles.countLine}>
            {plannedCount} drafted, {skippedCount} skipped, {conversations.length - decidedCount} undecided
          </p>
          <button
            onClick={() => setPhase('naming')}
            disabled={!allDecided}
            style={{
              ...styles.primaryBtn,
              ...(!allDecided ? styles.primaryBtnDisabled : {}),
            }}
          >
            {allDecided ? 'Continue' : 'Decide all conversations first'}
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: DRAFT
  // ===================================================================
  if (phase.startsWith('draft:')) {
    const convo = conversations.find(c => c.id === activeId)
    if (!convo) return null

    const draft = convoState[activeId]?.draft || ''

    return (
      <div style={styles.container}>
        <button
          onClick={() => { setActiveId(null); setPhase('list') }}
          style={styles.backLink}
        >
          ‹ All conversations
        </button>

        <h2 style={styles.convoTitleLarge}>{convo.promptHeader}</h2>

        <div style={styles.framingCard}>
          <p style={styles.framingText}>{convo.framingText}</p>
        </div>

        <p style={styles.draftLabel}>Your draft</p>
        <textarea
          value={draft}
          onChange={(e) => updateConvo(activeId, 'draft', e.target.value)}
          placeholder={convo.messageStarter}
          style={styles.textarea}
          rows={8}
        />

        <div style={styles.footer}>
          <button onClick={() => skipConvo(activeId)} style={styles.secondaryBtn}>
            Skip — doesn't apply
          </button>
          <button
            onClick={completeDraft}
            disabled={draft.trim().length < 20}
            style={{
              ...styles.primaryBtnFlex,
              ...(draft.trim().length < 20 ? styles.primaryBtnDisabled : {}),
            }}
          >
            Save draft
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
          disabled={!selfNaming || saving}
          style={{
            ...styles.primaryBtn,
            ...((!selfNaming || saving) ? styles.primaryBtnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Save the plan'}
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
  convoList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  convoCard: {
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
  convoCardPlanned: {
    background: '#FDFBF6',
    border: '0.5px solid #C2D49A',
  },
  convoCardSkipped: {
    background: '#F0EBDF',
    border: '0.5px solid #E0D8C5',
    opacity: 0.7,
  },
  convoCardLeft: { flex: 1, minWidth: 0 },
  convoCardRight: { flexShrink: 0 },
  convoLabel: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 4px',
    lineHeight: 1.3,
  },
  convoStatus: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  convoStatusPending: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  convoCheck: {
    width: '26px', height: '26px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '0.5px solid #C2D49A',
    color: '#3B6D11',
    fontSize: '14px', fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  convoSkip: {
    width: '26px', height: '26px',
    borderRadius: '50%',
    background: '#EFE7D7',
    color: '#9C8C78',
    fontSize: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  convoChevron: {
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
  convoTitleLarge: {
    fontSize: '22px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 1rem',
    lineHeight: 1.25,
  },
  framingCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    padding: '14px',
    marginBottom: '1.5rem',
  },
  framingText: {
    fontSize: '13.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.65,
    margin: 0,
  },
  draftLabel: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    margin: '0 0 0.5rem',
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
    minHeight: '160px',
  },
  namingList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  namingCard: {
    padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
  },
  namingCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  countLine: {
    fontSize: '11.5px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 8px',
    textAlign: 'center',
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
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}