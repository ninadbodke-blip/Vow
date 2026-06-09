import { useState } from 'react'

// "The Other Chair." You write back to a friend who slipped, then the card
// flips and the SAME words you wrote are turned to face you.
export default function ReclaimChairFlip({
  existingData,
  onSave,
  saving = false,
  friendMessage = '',
}) {
  const [reply, setReply] = useState(existingData?.to_friend || '')
  const [flipped, setFlipped] = useState(!!existingData?.read_back)

  const canFlip = reply.trim().length >= 1

  const handleSave = () => {
    if (saving) return
    onSave({ to_friend: reply, read_back: true })
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.scene}>
        <div style={{ ...styles.card, transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>

          {/* FRONT — the friend, and your reply */}
          <div style={{ ...styles.face, ...styles.front }}>
            <p style={styles.eyebrow}>A message just came in</p>
            <div style={styles.bubble}>{friendMessage}</div>
            <p style={styles.replyLabel}>Write back to them</p>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Be honest — but kind, the way you would be with them…"
              style={styles.textarea}
              rows={6}
              disabled={flipped}
            />
          </div>

          {/* BACK — the same words, turned toward you */}
          <div style={{ ...styles.face, ...styles.back }}>
            <p style={styles.eyebrow}>Now read it again — slowly</p>
            <div style={styles.yourWords}>{reply || ' '}</div>
            <p style={styles.backNote}>You wrote that for a friend.{'\n'}It was always meant for you too.</p>
          </div>

        </div>
      </div>

      {!flipped ? (
        <button
          onClick={() => canFlip && setFlipped(true)}
          disabled={!canFlip}
          style={{ ...styles.primaryBtn, opacity: canFlip ? 1 : 0.45, cursor: canFlip ? 'pointer' : 'not-allowed' }}
        >
          Turn it around
        </button>
      ) : (
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ ...styles.primaryBtn, opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving…' : 'I read it'}
        </button>
      )}
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0 1rem' },
  scene: { perspective: '1400px' },
  card: {
    position: 'relative',
    minHeight: '360px',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.95s cubic-bezier(0.2, 0.7, 0.2, 1)',
  },
  face: {
    position: 'absolute', top: 0, left: 0, width: '100%', boxSizing: 'border-box',
    WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden',
    borderRadius: '20px', padding: '22px 20px',
  },
  front: {
    background: '#FDFBF6', border: '1px solid #E8DFD0',
    display: 'flex', flexDirection: 'column',
  },
  back: {
    transform: 'rotateY(180deg)',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    border: '1px solid #241710',
    display: 'flex', flexDirection: 'column', gap: '1rem',
    boxShadow: '0 14px 30px -12px rgba(40,25,10,0.5)',
  },
  eyebrow: {
    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em',
    fontWeight: 600, fontFamily: '-apple-system, sans-serif',
    color: '#854F0B', margin: '0 0 0.9rem',
  },
  bubble: {
    background: '#F1E8D6', borderRadius: '16px 16px 16px 4px',
    padding: '14px 16px', fontSize: '15px', lineHeight: 1.55,
    color: '#3A2D1E', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    marginBottom: '1.25rem',
  },
  replyLabel: {
    fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', margin: '0 0 0.5rem',
  },
  textarea: {
    width: '100%', boxSizing: 'border-box', resize: 'none',
    background: '#FFFFFF', border: '1px solid #E8DFD0', borderRadius: '14px',
    padding: '13px 14px', fontSize: '16px', lineHeight: 1.6, color: '#2A1F15',
    fontFamily: 'Georgia, serif', outline: 'none', flex: 1,
  },
  yourWords: {
    fontSize: '18px', lineHeight: 1.6, color: '#FAF7F1',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    whiteSpace: 'pre-wrap', flex: 1, overflowY: 'auto', maxHeight: '230px',
  },
  backNote: {
    fontSize: '13px', color: '#CBBA98', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', whiteSpace: 'pre-line', lineHeight: 1.5,
    margin: 0, paddingTop: '0.75rem', borderTop: '1px solid rgba(217,181,122,0.25)',
  },
  primaryBtn: {
    width: '100%', padding: '15px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 500, fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
}