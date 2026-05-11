export default function PlaceholderMechanic({ onSave, saving }) {
  const handleSave = () => {
    onSave({ placeholder: true, viewed_at: new Date().toISOString() })
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.icon}>🛠️</div>
      <h2 style={styles.header}>Coming in the next build.</h2>
      <p style={styles.body}>
        This day's content is being assembled. It'll be available shortly.
        For now, tap below to mark it as viewed and continue.
      </p>
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          ...styles.btn,
          ...(saving ? styles.btnDisabled : {}),
        }}
      >
        {saving ? 'Saving...' : 'Mark as viewed'}
      </button>
    </div>
  )
}

const styles = {
  wrap: {
    textAlign: 'center',
    padding: '2rem 1rem',
  },
  icon: {
    fontSize: '40px', marginBottom: '1.25rem',
  },
  header: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 1rem',
  },
  body: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1.5rem',
    maxWidth: '320px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  btn: {
    width: '100%', padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  btnDisabled: {
    background: '#C9B894',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}