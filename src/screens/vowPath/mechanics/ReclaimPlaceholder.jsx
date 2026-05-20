export default function ReclaimPlaceholder({
  label,
  existingData,
  onSave,
  saving,
}) {
  const handleSave = () => {
    // Save dummy data so day marks complete and we can test the full flow
    onSave({ placeholder: true, completedAt: new Date().toISOString() })
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <p style={styles.label}>{label || 'Reclaim mechanic placeholder'}</p>
        <p style={styles.body}>
          The real mechanic will be built in a later message. For now,
          tap Save to mark this day complete and continue the flow.
        </p>
        {existingData && (
          <p style={styles.note}>
            (You\'ve already completed this day. Saving again will update the timestamp.)
          </p>
        )}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          ...styles.saveBtn,
          ...(saving ? styles.saveBtnDisabled : {}),
        }}
      >
        {saving ? 'Saving...' : (existingData ? 'Update' : 'Save')}
      </button>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    paddingBottom: '1rem',
  },
  box: {
    background: '#FDFBF6',
    border: '0.5px dashed #C9BBA6',
    borderRadius: '14px',
    padding: '1.5rem 1.25rem',
    textAlign: 'center',
  },
  label: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    margin: '0 0 1rem',
  },
  body: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
  },
  note: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '1rem 0 0',
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  saveBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}