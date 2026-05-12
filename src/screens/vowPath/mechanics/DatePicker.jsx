import { useState } from 'react'

export default function DatePicker({ data, onSave, saving }) {
  const {
    minDaysFromNow,
    maxDaysFromNow,
    datePickerHeader,
    datePickerSubtext,
    reasonsHeader,
    reasonsSubtext,
    reasonOptions,
    allowCustomReasons,
    customReasonPrompt,
    nightBeforeHeader,
    nightBeforeSubtext,
    nightBeforeOptions,
  } = data

  // Phases: 'date' -> 'reasons' -> 'night_before' -> 'review'
  const [phase, setPhase] = useState('date')

  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedReasons, setSelectedReasons] = useState([])
  const [customReasons, setCustomReasons] = useState([])
  const [customReasonInput, setCustomReasonInput] = useState('')
  const [nightBefore, setNightBefore] = useState([])

  // Compute date bounds
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const minDate = new Date(today)
  minDate.setDate(today.getDate() + minDaysFromNow)
  const maxDate = new Date(today)
  maxDate.setDate(today.getDate() + maxDaysFromNow)

  const formatDateInput = (d) => d.toISOString().split('T')[0]
  const formatDateDisplay = (d) => {
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }
  const daysFromToday = (d) => {
    const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const toggleReason = (id) => {
    setSelectedReasons(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleNightBefore = (id) => {
    setNightBefore(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const addCustomReason = () => {
    const trimmed = customReasonInput.trim()
    if (trimmed.length > 0 && customReasons.length < 3) {
      setCustomReasons([...customReasons, trimmed])
      setCustomReasonInput('')
    }
  }

  const removeCustomReason = (idx) => {
    setCustomReasons(customReasons.filter((_, i) => i !== idx))
  }

  const finalize = () => {
    onSave({
      stop_date: selectedDate,
      days_from_today: daysFromToday(new Date(selectedDate)),
      reasons: selectedReasons,
      custom_reasons: customReasons,
      night_before_plan: nightBefore,
    })
  }

  // ===================================================================
  // PHASE: DATE
  // ===================================================================
  if (phase === 'date') {
    const dateObj = selectedDate ? new Date(selectedDate) : null

    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{datePickerHeader}</h2>
        <p style={styles.subtext}>{datePickerSubtext}</p>

        <div style={styles.dateInputCard}>
          <input
            type="date"
            value={selectedDate || ''}
            min={formatDateInput(minDate)}
            max={formatDateInput(maxDate)}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>

        {dateObj && (
          <div style={styles.dateConfirmCard}>
            <p style={styles.dateConfirmDay}>{daysFromToday(dateObj)} days from today</p>
            <p style={styles.dateConfirmFull}>{formatDateDisplay(dateObj)}</p>
          </div>
        )}

        <div style={styles.footer}>
          <button
            onClick={() => setPhase('reasons')}
            disabled={!selectedDate}
            style={{
              ...styles.primaryBtn,
              ...(selectedDate ? {} : styles.primaryBtnDisabled),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: REASONS
  // ===================================================================
  if (phase === 'reasons') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{reasonsHeader}</h2>
        <p style={styles.subtext}>{reasonsSubtext}</p>

        <div style={styles.optionList}>
          {reasonOptions.map(opt => {
            const selected = selectedReasons.includes(opt.id)
            return (
              <button
                key={opt.id}
                onClick={() => toggleReason(opt.id)}
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

        {allowCustomReasons && (
          <div style={styles.customSection}>
            {customReasons.map((reason, idx) => (
              <div key={`cr_${idx}`} style={{ ...styles.optionCard, ...styles.optionCardSelected, ...styles.customRow }}>
                <span>{reason}</span>
                <button onClick={() => removeCustomReason(idx)} style={styles.removeBtn}>×</button>
              </div>
            ))}

            {customReasons.length < 3 && (
              <div style={styles.customInputRow}>
                <input
                  type="text"
                  value={customReasonInput}
                  onChange={(e) => setCustomReasonInput(e.target.value)}
                  placeholder={customReasonPrompt}
                  style={styles.customInput}
                  onKeyDown={(e) => { if (e.key === 'Enter') addCustomReason() }}
                />
                <button onClick={addCustomReason} style={styles.customAddBtn}>Add</button>
              </div>
            )}
          </div>
        )}

        <div style={styles.footer}>
          <button onClick={() => setPhase('date')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('night_before')}
            disabled={selectedReasons.length === 0 && customReasons.length === 0}
            style={{
              ...styles.primaryBtnFlex,
              ...((selectedReasons.length === 0 && customReasons.length === 0) ? styles.primaryBtnDisabled : {}),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: NIGHT BEFORE
  // ===================================================================
  if (phase === 'night_before') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{nightBeforeHeader}</h2>
        <p style={styles.subtext}>{nightBeforeSubtext}</p>

        <div style={styles.optionList}>
          {nightBeforeOptions.map(opt => {
            const selected = nightBefore.includes(opt.id)
            return (
              <button
                key={opt.id}
                onClick={() => toggleNightBefore(opt.id)}
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
          <button onClick={() => setPhase('reasons')} style={styles.secondaryBtn}>‹ Back</button>
          <button
            onClick={() => setPhase('review')}
            disabled={nightBefore.length === 0}
            style={{
              ...styles.primaryBtnFlex,
              ...(nightBefore.length === 0 ? styles.primaryBtnDisabled : {}),
            }}
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
  const dateObj = new Date(selectedDate)
  return (
    <div style={styles.container}>
      <h2 style={styles.prompt}>Review.</h2>

      <div style={styles.reviewCard}>
        <p style={styles.reviewLabel}>Your stop date</p>
        <p style={styles.reviewBig}>{formatDateDisplay(dateObj)}</p>
        <p style={styles.reviewSmall}>{daysFromToday(dateObj)} days from today</p>
      </div>

      <div style={styles.reviewCard}>
        <p style={styles.reviewLabel}>Why this date</p>
        <ul style={styles.reviewList}>
          {selectedReasons.map(id => {
            const opt = reasonOptions.find(o => o.id === id)
            return opt ? <li key={id} style={styles.reviewItem}>{opt.label}</li> : null
          })}
          {customReasons.map((r, idx) => (
            <li key={`cr_${idx}`} style={styles.reviewItem}>{r}</li>
          ))}
        </ul>
      </div>

      <div style={styles.reviewCard}>
        <p style={styles.reviewLabel}>Night before</p>
        <ul style={styles.reviewList}>
          {nightBefore.map(id => {
            const opt = nightBeforeOptions.find(o => o.id === id)
            return opt ? <li key={id} style={styles.reviewItem}>{opt.label}</li> : null
          })}
        </ul>
      </div>

      <div style={styles.footer}>
        <button onClick={() => setPhase('night_before')} style={styles.secondaryBtn}>‹ Back</button>
        <button
          onClick={finalize}
          disabled={saving}
          style={{ ...styles.primaryBtnFlex, ...(saving ? styles.primaryBtnDisabled : {}) }}
        >
          {saving ? 'Saving...' : 'Set the date'}
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
  dateInputCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  dateInput: {
    width: '100%',
    padding: '12px',
    border: '0.5px solid #E0D5C2',
    borderRadius: '10px',
    fontSize: '16px',
    fontFamily: 'Georgia, serif',
    color: '#2A1F15',
    background: '#FDFBF6',
    outline: 'none',
    boxSizing: 'border-box',
  },
  dateConfirmCard: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    borderRadius: '14px',
    padding: '1rem',
    textAlign: 'center',
  },
  dateConfirmDay: {
    fontSize: '13px', color: '#854F0B',
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  dateConfirmFull: {
    fontSize: '18px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0,
    lineHeight: 1.3,
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
  },
  optionCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  customRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  customSection: { marginTop: '8px' },
  customInputRow: { display: 'flex', gap: '8px', marginTop: '8px' },
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
  removeBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '18px',
    cursor: 'pointer', padding: 0, lineHeight: 1,
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
    fontSize: '18px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.25rem',
    lineHeight: 1.3,
  },
  reviewSmall: {
    fontSize: '12px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: 0,
  },
  reviewList: {
    margin: 0, padding: '0 0 0 1rem',
    listStyle: 'disc',
  },
  reviewItem: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
    margin: '0 0 0.25rem',
  },
  footer: {
    marginTop: '1.5rem',
    display: 'flex', gap: '8px',
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
  primaryBtnFlex: {
    flex: 1, padding: '14px',
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