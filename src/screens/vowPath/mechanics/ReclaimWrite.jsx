import { useState } from 'react'

// A simple, calm write-in. One textarea, or two when `prompts` is given.
// Saves { text } for a single field, or { fields: [...] } for multiple.
export default function ReclaimWrite({
  existingData,
  onSave,
  saving = false,
  prompt,
  prompts,
  placeholder,
  minChars = 1,
}) {
  const fields = Array.isArray(prompts) && prompts.length > 0
    ? prompts
    : [{ label: prompt || '', placeholder: placeholder || 'Write here…' }]

  const initial = () => {
    if (existingData && Array.isArray(existingData.fields)) {
      return fields.map((_, i) => existingData.fields[i] || '')
    }
    if (existingData && typeof existingData.text === 'string') {
      return fields.map((_, i) => (i === 0 ? existingData.text : ''))
    }
    return fields.map(() => '')
  }

  const [values, setValues] = useState(initial)

  const update = (i, v) => {
    setValues((prev) => {
      const next = [...prev]
      next[i] = v
      return next
    })
  }

  const total = values.join('').trim().length
  const canSave = total >= (minChars || 1) && !saving

  const handleSave = () => {
    if (!canSave) return
    if (fields.length === 1) onSave({ text: values[0] || '' })
    else onSave({ fields: values })
  }

  return (
    <div style={styles.wrap}>
      {fields.map((f, i) => (
        <div key={i} style={styles.field}>
          {f.label ? <p style={styles.label}>{f.label}</p> : null}
          <textarea
            value={values[i] || ''}
            onChange={(e) => update(i, e.target.value)}
            placeholder={f.placeholder || 'Write here…'}
            style={styles.textarea}
            rows={fields.length > 1 ? 4 : 8}
          />
        </div>
      ))}
      <button
        onClick={handleSave}
        disabled={!canSave}
        style={{ ...styles.saveBtn, opacity: canSave ? 1 : 0.45, cursor: canSave ? 'pointer' : 'not-allowed' }}
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0 1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.55rem' },
  label: {
    fontSize: '15px', color: '#3A2D1E', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', lineHeight: 1.45, margin: 0,
  },
  textarea: {
    width: '100%', boxSizing: 'border-box', resize: 'vertical',
    background: '#FDFBF6', border: '1px solid #E8DFD0', borderRadius: '14px',
    padding: '14px 15px', fontSize: '16px', lineHeight: 1.6, color: '#2A1F15',
    fontFamily: 'Georgia, serif', outline: 'none',
  },
  saveBtn: {
    marginTop: '0.25rem', width: '100%', padding: '15px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 500, fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
}