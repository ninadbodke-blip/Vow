import { useState, useEffect } from 'react'

const STORAGE_KEY = 'vow_build_entry_6_names'

function loadNamesFromLocalStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveNamesToLocalStorage(names) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names))
  } catch {}
}

export default function BuildClosenessLadder({
  value = [],
  onChange,
  isWritable = true,
  options = [],
  maxSlots = 5,
}) {
  const [names, setNames] = useState(() => loadNamesFromLocalStorage())

  useEffect(() => {
    saveNamesToLocalStorage(names)
  }, [names])

  const positions = Array.isArray(value) ? value : []
  const slotCount = Math.max(names.length, positions.length, 1)

  const updateName = (idx, name) => {
    if (!isWritable) return
    const next = [...names]
    next[idx] = name
    setNames(next)
  }

  const updatePosition = (idx, position) => {
    if (!isWritable) return
    const next = [...positions]
    while (next.length <= idx) next.push({ position: null })
    next[idx] = { position }
    onChange(next)
  }

  const removeSlot = (idx) => {
    if (!isWritable) return
    setNames(names.filter((_, i) => i !== idx))
    onChange(positions.filter((_, i) => i !== idx))
  }

  const addSlot = () => {
    if (!isWritable) return
    if (slotCount >= maxSlots) return
    setNames([...names, ''])
    onChange([...positions, { position: null }])
  }

  return (
    <div style={styles.container}>
      <p style={styles.privacyNote}>
        Names live on this device only. They are never sent to the server.
      </p>

      {Array.from({ length: slotCount }).map((_, idx) => {
        const name = names[idx] || ''
        const position = positions[idx]?.position || null

        return (
          <div key={idx} style={styles.slot}>
            <div style={styles.slotHeader}>
              <span style={styles.slotIndex}>{idx + 1}</span>
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(idx, e.target.value)}
                placeholder="Name or initials"
                disabled={!isWritable}
                style={styles.nameInput}
              />
              {isWritable && (
                <button
                  onClick={() => removeSlot(idx)}
                  style={styles.removeBtn}
                  aria-label="Remove"
                >
                  ✕
                </button>
              )}
            </div>

            <div style={styles.ladder}>
              {options.map((opt) => {
                const isSelected = position === opt
                return (
                  <button
                    key={opt}
                    onClick={() => updatePosition(idx, opt)}
                    disabled={!isWritable}
                    style={{
                      ...styles.rung,
                      ...(isSelected ? styles.rungSelected : {}),
                    }}
                  >
                    <span style={{
                      ...styles.rungText,
                      ...(isSelected ? styles.rungTextSelected : {}),
                    }}>
                      {opt}
                    </span>
                    {isSelected && <span style={styles.checkmark}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {slotCount < maxSlots && isWritable && (
        <button onClick={addSlot} style={styles.addBtn}>
          + Add another person
        </button>
      )}
    </div>
  )
}

const styles = {
  container: { width: '100%' },
  privacyNote: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 1.25rem',
    padding: '8px 12px',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '8px',
    lineHeight: 1.5,
  },
  slot: {
    background: '#FAF7F1',
    border: '0.5px solid #E0D5C2',
    borderRadius: '14px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  slotHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '0.85rem',
  },
  slotIndex: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#F4ECDD',
    border: '0.5px solid #E0D5C2',
    color: '#854F0B',
    fontSize: '11px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  nameInput: {
    flex: 1,
    padding: '8px 10px',
    fontSize: '13px',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    color: '#2A1F15',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '8px',
    outline: 'none',
    boxShadow: 'inset 0 1px 2px rgba(80,50,20,0.04)',
  },
  removeBtn: {
    width: '28px',
    height: '28px',
    background: 'transparent',
    border: '0.5px solid #E0D5C2',
    borderRadius: '50%',
    color: '#9C8C78',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ladder: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  rung: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '8px 12px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  rungSelected: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    border: '0.5px solid #2A1F15',
  },
  rungText: {
    fontSize: '12.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    flex: 1,
  },
  rungTextSelected: {
    color: '#FAF7F1',
    fontStyle: 'normal',
  },
  checkmark: {
    fontSize: '12px',
    color: '#D9B57A',
    fontWeight: 600,
    marginLeft: '10px',
    flexShrink: 0,
  },
  addBtn: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    border: '0.5px dashed #D4C8B0',
    borderRadius: '12px',
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
}