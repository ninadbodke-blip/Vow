import { useState, useEffect } from 'react'

export default function StoriesRecognition({
  stories,
  promptText,
  existingData,
  onSave,
  saving,
}) {
  // For each story id, track 'familiar' | 'not_familiar' | null
  const [responses, setResponses] = useState({})

  useEffect(() => {
    if (existingData?.responses) {
      setResponses(existingData.responses)
    }
  }, [existingData])

  const setResponse = (storyId, value) => {
    setResponses(prev => ({ ...prev, [storyId]: value }))
  }

  const allResponded = stories.every(s => responses[s.id])
  const familiarCount = Object.values(responses).filter(v => v === 'familiar').length

  const handleSave = () => {
    if (!allResponded) return
    onSave({
      responses,
      familiar_count: familiarCount,
      total_stories: stories.length,
    })
  }

  return (
    <div>
      <p style={styles.promptText}>{promptText}</p>

      <div style={styles.storyList}>
        {stories.map((story, idx) => {
          const response = responses[story.id]
          return (
            <div key={story.id} style={styles.storyCard}>
              <div style={styles.storyHeader}>
                <span style={styles.storyNumber}>{idx + 1}</span>
                <p style={styles.storyIntro}>{story.intro}</p>
              </div>

              <p style={styles.storyBody}>{story.body}</p>

              <div style={styles.responseRow}>
                <button
                  onClick={() => setResponse(story.id, 'familiar')}
                  style={{
                    ...styles.responseBtn,
                    ...(response === 'familiar' ? styles.responseBtnSelectedFamiliar : {}),
                  }}
                >
                  Familiar
                </button>
                <button
                  onClick={() => setResponse(story.id, 'not_familiar')}
                  style={{
                    ...styles.responseBtn,
                    ...(response === 'not_familiar' ? styles.responseBtnSelectedNot : {}),
                  }}
                >
                  Not familiar
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={!allResponded || saving}
        style={{
          ...styles.saveBtn,
          ...(!allResponded || saving ? styles.saveBtnDisabled : {}),
        }}
      >
        {saving ? 'Saving...' : 'Save & continue'}
      </button>

      {!allRespondedHelper(allResponded, stories.length, responses)}
    </div>
  )
}

function allRespondedHelper(allResponded, total, responses) {
  if (allResponded) return null
  const responded = Object.keys(responses).length
  return (
    <p style={styles.helpText}>
      {responded} of {total} stories responded to.
    </p>
  )
}

const styles = {
  promptText: {
    fontSize: '14px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0 0 1.25rem',
  },
  storyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '1.25rem',
  },
  storyCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '18px',
    padding: '1.25rem 1.25rem 1rem',
    boxShadow: '0 4px 14px rgba(80,50,20,0.05)',
  },
  storyHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    marginBottom: '0.65rem',
  },
  storyNumber: {
    fontSize: '24px',
    fontWeight: 500,
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
    flexShrink: 0,
  },
  storyIntro: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    flex: 1,
  },
  storyBody: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.65,
    margin: '0 0 1rem',
  },
  responseRow: {
    display: 'flex',
    gap: '8px',
  },
  responseBtn: {
    flex: 1,
    padding: '10px',
    background: '#FDFBF6',
    border: '0.5px solid #DDCFB6',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B5C4A',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  responseBtnSelectedFamiliar: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '1px solid #C5572C',
    color: '#854F0B',
  },
  responseBtnSelectedNot: {
    background: 'linear-gradient(180deg, #FDFBF6 0%, #F0EBDF 100%)',
    border: '1px solid #9C8C78',
    color: '#6B5C4A',
  },
  saveBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  saveBtnDisabled: {
    background: '#C9B894',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  helpText: {
    fontSize: '11px',
    color: '#9C8C78',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
    marginTop: '0.75rem',
    marginBottom: 0,
  },
}