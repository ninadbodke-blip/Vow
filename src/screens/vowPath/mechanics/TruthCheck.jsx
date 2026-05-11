import { useState, useEffect } from 'react'

export default function TruthCheck({
  promptText,
  options,
  existingData,
  onSave,
  saving,
}) {
  const [selectedOption, setSelectedOption] = useState(null)

  useEffect(() => {
    if (existingData?.option_selected) {
      setSelectedOption(existingData.option_selected)
    }
  }, [existingData])

  const handleSave = () => {
    if (!selectedOption) return
    onSave({
      option_selected: selectedOption,
      responded_at: new Date().toISOString(),
    })
  }

  return (
    <div>
      <h2 style={styles.promptHeader}>{promptText}</h2>

      <div style={styles.optionList}>
        {options.map(opt => {
          const isSelected = selectedOption === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setSelectedOption(opt.id)}
              style={{
                ...styles.optionBtn,
                ...(isSelected ? styles.optionBtnSelected : {}),
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={!selectedOption || saving}
        style={{
          ...styles.primaryBtn,
          ...(!selectedOption || saving ? styles.saveBtnDisabled : {}),
        }}
      >
        {saving ? 'Saving...' : 'Save & continue'}
      </button>
    </div>
  )
}

const styles = {
  promptHeader: {
    fontSize: '20px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.4,
    margin: '0 0 1.5rem',
    textAlign: 'center',
  },
  optionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '1.5rem',
  },
  optionBtn: {
    width: '100%',
    padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    textAlign: 'left',
    lineHeight: 1.5,
    transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  optionBtnSelected: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 4px 12px rgba(197,87,44,0.15)',
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
  saveBtnDisabled: {
    background: '#C9B894',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}