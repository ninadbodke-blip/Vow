import { useState, useEffect } from 'react'

export default function BodyMap({
  header,
  subtext,
  zones,
  existingData,
  onSave,
  saving,
}) {
  const [selectedZones, setSelectedZones] = useState({})
  // Each entry: { tapped: true, note: 'optional text' }

  useEffect(() => {
    if (existingData?.zones && typeof existingData.zones === 'object') {
      setSelectedZones(existingData.zones)
    }
  }, [existingData])

  const toggleZone = (zoneId) => {
    setSelectedZones(prev => {
      if (prev[zoneId]) {
        // Untap — remove the entry entirely
        const next = { ...prev }
        delete next[zoneId]
        return next
      } else {
        return { ...prev, [zoneId]: { tapped: true, note: '' } }
      }
    })
  }

  const updateNote = (zoneId, note) => {
    setSelectedZones(prev => ({
      ...prev,
      [zoneId]: { ...prev[zoneId], note },
    }))
  }

  const selectedCount = Object.keys(selectedZones).length
  const canSave = selectedCount >= 1

  const handleSave = () => {
    if (!canSave) return
    onSave({
      zones: selectedZones,
      selected_count: selectedCount,
    })
  }

  return (
    <div>
      <h2 style={styles.header}>{header}</h2>
      {subtext && <p style={styles.subtext}>{subtext}</p>}

      <div style={styles.zoneList}>
        {zones.map(zone => {
          const isSelected = !!selectedZones[zone.id]
          const note = selectedZones[zone.id]?.note || ''

          return (
            <div key={zone.id} style={styles.zoneItem}>
              <button
                onClick={() => toggleZone(zone.id)}
                style={{
                  ...styles.zoneRow,
                  ...(isSelected ? styles.zoneRowSelected : {}),
                }}
              >
                <span style={{ ...styles.checkbox, ...(isSelected ? styles.checkboxSelected : {}) }}>
                  {isSelected ? '✓' : ''}
                </span>
                <div style={styles.zoneContent}>
                  <p style={styles.zoneLabel}>{zone.label}</p>
                  <p style={styles.zoneExamples}>{zone.examples}</p>
                </div>
              </button>

              {isSelected && (
                <input
                  type="text"
                  value={note}
                  onChange={(e) => updateNote(zone.id, e.target.value)}
                  placeholder="Add a short note (optional)"
                  maxLength={120}
                  style={styles.noteInput}
                />
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={!canSave || saving}
        style={{
          ...styles.saveBtn,
          ...(!canSave || saving ? styles.saveBtnDisabled : {}),
        }}
      >
        {saving ? 'Saving...' : 'Save & continue'}
      </button>

      <p style={styles.countNote}>
        {selectedCount === 0 ? 'Tap at least one zone to continue.' : `${selectedCount} ${selectedCount === 1 ? 'zone' : 'zones'} tapped`}
        {existingData && ' · Editing previous response'}
      </p>
    </div>
  )
}

const styles = {
  header: {
    fontSize: '22px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 0.75rem',
  },
  subtext: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1.5rem',
  },
  zoneList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '1.25rem',
  },
  zoneItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  zoneRow: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textAlign: 'left',
    gap: '12px',
    transition: 'all 0.15s',
    boxShadow: '0 2px 4px rgba(80,50,20,0.04)',
  },
  zoneRowSelected: {
    background: 'linear-gradient(180deg, #FDFBF6 0%, #F8F1E1 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 3px 10px rgba(197,87,44,0.10)',
  },
  checkbox: {
    width: '20px', height: '20px',
    borderRadius: '6px',
    border: '1px solid #DDCFB6',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px',
    color: '#FAF7F1',
    flexShrink: 0,
    background: 'white',
    marginTop: '2px',
  },
  checkboxSelected: {
    background: 'linear-gradient(180deg, #C5572C 0%, #A14222 100%)',
    border: '1px solid #A14222',
  },
  zoneContent: {
    flex: 1,
    minWidth: 0,
  },
  zoneLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 2px',
    lineHeight: 1.3,
  },
  zoneExamples: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.4,
  },
  noteInput: {
    width: '100%',
    padding: '10px 12px',
    background: '#FDFBF6',
    border: '0.5px solid #DDCFB6',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    boxSizing: 'border-box',
    outline: 'none',
    marginLeft: '32px',
    width: 'calc(100% - 32px)',
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
  countNote: {
    fontSize: '11px',
    color: '#9C8C78',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    margin: '0.75rem 0 0',
    textAlign: 'center',
  },
}