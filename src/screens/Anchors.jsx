import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import BottomNav from '../components/BottomNav'

const MAX_ANCHORS = 3

const RELATIONSHIPS = [
  { value: 'mother', label: 'Mother', icon: '👩' },
  { value: 'father', label: 'Father', icon: '👨' },
  { value: 'partner', label: 'Partner', icon: '💑' },
  { value: 'sibling', label: 'Sibling', icon: '👫' },
  { value: 'friend', label: 'Friend', icon: '🤝' },
  { value: 'sponsor', label: 'Sponsor', icon: '🪶' },
  { value: 'counselor', label: 'Counselor', icon: '🧘' },
  { value: 'other', label: 'Other', icon: '⚓' },
]

const HEARTBEAT_MESSAGE = "Just wanted to let you know I'm doing okay today."

// Warm, distinct avatar tints per relationship — keeps the list lively.
const REL_COLORS = {
  mother: '#C5572C', father: '#8A6A3C', partner: '#B0567A', sibling: '#6E8A6A',
  friend: '#C8893C', sponsor: '#6B7FA0', counselor: '#8A6FA0', other: '#9C8C78',
}
const relColor = (rel) => REL_COLORS[rel] || REL_COLORS.other

const BackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
)
const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

export default function Anchors() {
  const navigate = useNavigate()

  const [anchors, setAnchors] = useState([])
  const [reactions, setReactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingAnchor, setEditingAnchor] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [shareModal, setShareModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [showHeartbeatSheet, setShowHeartbeatSheet] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/signup'); return }

    const { data: anchorsData } = await supabase
      .from('anchors')
      .select('*')
      .eq('user_id', user.id)
      .order('position')
    
    setAnchors(anchorsData || [])

    const { data: reactionsData } = await supabase
      .from('anchor_reactions')
      .select('*, anchors(name, relationship)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    
    setReactions(reactionsData || [])
    setLoading(false)
  }

  const handleSaveAnchor = async (anchor) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingAnchor?.id) {
      await supabase
        .from('anchors')
        .update({
          name: anchor.name,
          phone: anchor.phone,
          relationship: anchor.relationship,
          why_note: anchor.why_note,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingAnchor.id)
    } else {
      const nextPosition = anchors.length + 1
      await supabase
        .from('anchors')
        .insert({
          user_id: user.id,
          name: anchor.name,
          phone: anchor.phone,
          relationship: anchor.relationship,
          why_note: anchor.why_note,
          position: nextPosition,
        })
    }

    setEditingAnchor(null)
    setShowAddModal(false)
    await loadData()
  }

  const handleDelete = async (anchorId) => {
    await supabase.from('anchors').delete().eq('id', anchorId)
    setConfirmDelete(null)
    await loadData()
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleHeartbeat = () => {
  if (anchors.length === 0) return
  setShowHeartbeatSheet(true)
}

const sendHeartbeatTo = (anchor) => {
  const cleanPhone = anchor.phone.replace(/\D/g, '')
  const body = encodeURIComponent(HEARTBEAT_MESSAGE)
  window.open(`https://wa.me/${cleanPhone}?text=${body}`, '_blank')
}

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={{...styles.phone, textAlign: 'center', color: '#9C8C78'}}>
          Loading...
        </div>
      </div>
    )
  }

  const canAddMore = anchors.length < MAX_ANCHORS

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>
        
        <div style={styles.topBar}>
          <button onClick={() => navigate('/home')} style={styles.iconNavBtn} aria-label="Back to home">
            <BackIcon />
          </button>
          <p style={styles.topTitle}>Anchors</p>
          <button onClick={() => navigate('/profile')} style={styles.iconNavBtn} aria-label="Profile">
            <ProfileIcon />
          </button>
        </div>

        <div style={styles.intro}>
          <div style={styles.introIcon}>⚓</div>
          <p style={styles.introText}>
            People who steady you in the storm.
          </p>
          <p style={styles.introSubtle}>
            {anchors.length > 0
              ? `${anchors.length} of ${MAX_ANCHORS} added · always private`
              : 'Up to 3 trusted people. Always private.'}
          </p>
        </div>

        {/* RECENT REACTIONS */}
        {reactions.length > 0 && (
          <div style={styles.reactionsSection}>
            <p style={styles.sectionLabel}>Recent love</p>
            <div style={styles.reactionsList}>
              {reactions.map(r => (
                <div key={r.id} style={styles.reactionCard}>
                  <span style={styles.reactionAnchor}>
                    {RELATIONSHIPS.find(rel => rel.value === r.anchors?.relationship)?.icon || '⚓'} {r.anchors?.name}
                  </span>
                  <span style={styles.reactionText}>"{r.reaction_text}"</span>
                  <span style={styles.reactionTime}>{formatRelative(r.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HEARTBEAT BUTTON — only if anchors exist */}
        {anchors.length > 0 && (
          <button onClick={handleHeartbeat} style={styles.heartbeatBtn}>
            <span style={{fontSize: '17px'}}>💛</span>
            <span>Send heartbeat — "I'm doing okay"</span>
          </button>
        )}

        {anchors.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyMedallion}>⚓</div>
            <p style={styles.emptyText}>
              No anchors yet.<br/>
              Add someone you trust — a parent, partner, or close friend.
            </p>
            <button onClick={() => setShowAddModal(true)} style={styles.btnPrimary}>
              + Add your first anchor
            </button>
          </div>
        ) : (
          <>
            <div style={styles.anchorsList}>
              {anchors.map((anchor) => (
                <AnchorCard
                  key={anchor.id}
                  anchor={anchor}
                  onEdit={() => setEditingAnchor(anchor)}
                  onDelete={() => setConfirmDelete(anchor)}
                  onShare={() => setShareModal(anchor)}
                />
              ))}
            </div>

            {canAddMore && (
              <button onClick={() => setShowAddModal(true)} style={styles.addMoreBtn}>
                + Add another anchor
              </button>
            )}

            {!canAddMore && (
              <p style={styles.maxedNote}>
                You've added the maximum 3 anchors. Remove one to add another.
              </p>
            )}
          </>
        )}

        <div style={styles.privacyNote}>
          <p style={styles.privacyTitle}>🔒 Your privacy</p>
          <p style={styles.privacyText}>
            Anchors are stored privately. They only see what you choose to share via the link you send them.
          </p>
        </div>

        <BottomNav />

        {(showAddModal || editingAnchor) && (
          <AnchorFormModal
            anchor={editingAnchor}
            onSave={handleSaveAnchor}
            onCancel={() => {
              setShowAddModal(false)
              setEditingAnchor(null)
            }}
          />
        )}

        {confirmDelete && (
          <div style={styles.modal} onClick={() => setConfirmDelete(null)}>
            <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
              <p style={styles.modalTitle}>Remove this anchor?</p>
              <p style={styles.modalBody}>
                {confirmDelete.name} will no longer appear during urges.
              </p>
              <div style={styles.modalActions}>
                <button onClick={() => setConfirmDelete(null)} style={styles.btnSecondary}>Cancel</button>
                <button onClick={() => handleDelete(confirmDelete.id)} style={styles.btnDanger}>Remove</button>
              </div>
            </div>
          </div>
        )}

        {shareModal && (
          <ShareModal
            anchor={shareModal}
            onClose={() => setShareModal(null)}
            onShared={() => showToast('Link copied. Send it via WhatsApp or SMS.')}
          />
        )}

        {showHeartbeatSheet && (
  <div style={styles.modal} onClick={() => setShowHeartbeatSheet(false)}>
    <div style={styles.formModalCard} onClick={e => e.stopPropagation()}>
      <p style={styles.modalTitle}>💛 Send heartbeat</p>
      <p style={styles.modalBody}>
        A simple "I'm doing okay" to your anchors via WhatsApp. Tap each one — sent personally.
      </p>

      <div style={styles.heartbeatList}>
        {anchors.map(anchor => {
          const rel = RELATIONSHIPS.find(r => r.value === anchor.relationship) || RELATIONSHIPS[7]
          return (
            <button
              key={anchor.id}
              onClick={() => sendHeartbeatTo(anchor)}
              style={styles.heartbeatRow}
            >
              <div style={styles.heartbeatAvatar}>
                {anchor.name.charAt(0).toUpperCase()}
              </div>
              <div style={styles.heartbeatInfo}>
                <p style={styles.heartbeatName}>
                  {anchor.name}
                  <span style={styles.heartbeatRelChip}>{rel.icon} {rel.label}</span>
                </p>
                <p style={styles.heartbeatPhone}>{anchor.phone}</p>
              </div>
              <div style={styles.heartbeatSendIcon}>
                <span style={{fontSize: '18px'}}>💬</span>
              </div>
            </button>
          )
        })}
      </div>

      <p style={styles.helperNote}>
        Opens WhatsApp with the message pre-filled. Just hit send.
      </p>

      <div style={styles.modalActions}>
        <button onClick={() => setShowHeartbeatSheet(false)} style={styles.btnSecondary}>Done</button>
      </div>
    </div>
  </div>
)}

        {toast && (
          <div style={styles.toast}>
            <p style={styles.toastText}>{toast}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AnchorCard({ anchor, onEdit, onDelete, onShare }) {
  const initial = anchor.name.charAt(0).toUpperCase()
  const rel = RELATIONSHIPS.find(r => r.value === anchor.relationship) || RELATIONSHIPS[7]
  const whyPreview = anchor.why_note ? anchor.why_note.slice(0, 80) : null
  const c = relColor(anchor.relationship)

  return (
    <div style={{ ...styles.anchorCard, borderLeft: `3px solid ${c}` }}>
      <div style={styles.anchorTop}>
        <div style={{ ...styles.anchorAvatar, background: c }}>{initial}</div>
        <div style={styles.anchorInfo}>
          <p style={styles.anchorName}>
            {anchor.name}
            <span style={{ ...styles.anchorRelChip, background: `${c}1A`, color: c }}>{rel.icon} {rel.label}</span>
          </p>
          <p style={styles.anchorPhone}>{anchor.phone}</p>
        </div>
        <div style={styles.anchorActions}>
          <button onClick={onEdit} style={styles.iconBtn} aria-label="Edit">✎</button>
          <button onClick={onDelete} style={styles.iconBtn} aria-label="Remove">✕</button>
        </div>
      </div>

      {whyPreview && (
        <div style={styles.whyPreview}>
          <span style={styles.whyQuote}>"</span>
          <span style={styles.whyPreviewText}>
            {whyPreview}{anchor.why_note.length > 80 ? '...' : ''}
          </span>
        </div>
      )}

      <button onClick={onShare} style={styles.shareBtn}>
        🔗 Share private link
      </button>
    </div>
  )
}

function AnchorFormModal({ anchor, onSave, onCancel }) {
  const [name, setName] = useState(anchor?.name || '')
  const [phone, setPhone] = useState(anchor?.phone || '')
  const [relationship, setRelationship] = useState(anchor?.relationship || 'mother')
  const [whyNote, setWhyNote] = useState(anchor?.why_note || '')
  const [error, setError] = useState(null)

  const handleSave = () => {
    if (!name.trim()) { setError('Please enter a name.'); return }
    if (!phone.trim()) { setError('Please enter a phone number.'); return }
    
    const cleanPhone = phone.replace(/\s+/g, '')
    if (cleanPhone.length < 7) { setError('Please enter a valid phone number.'); return }

    onSave({
      name: name.trim(),
      phone: cleanPhone,
      relationship,
      why_note: whyNote.trim() || null,
    })
  }

  return (
    <div style={styles.modal} onClick={onCancel}>
      <div style={styles.formModalCard} onClick={e => e.stopPropagation()}>
        <p style={styles.modalTitle}>{anchor ? 'Edit anchor' : 'Add an anchor'}</p>

        <label style={styles.fieldLabel}>Name</label>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setError(null) }}
          placeholder="e.g. Mom, Aman, Dr. Mehta"
          style={styles.input}
          autoFocus
        />

        <label style={styles.fieldLabel}>Phone number</label>
        <input
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setError(null) }}
          placeholder="+91 9876543210"
          type="tel"
          style={styles.input}
        />

        <label style={styles.fieldLabel}>Relationship</label>
        <div style={styles.relGrid}>
          {RELATIONSHIPS.map(rel => (
            <button
              key={rel.value}
              onClick={() => setRelationship(rel.value)}
              style={{
                ...styles.relChip,
                ...(relationship === rel.value ? styles.relChipActive : {}),
              }}
            >
              <span style={{fontSize: '16px'}}>{rel.icon}</span>
              <span>{rel.label}</span>
            </button>
          ))}
        </div>

        <label style={styles.fieldLabel}>Why this person matters</label>
        <textarea
          value={whyNote}
          onChange={(e) => setWhyNote(e.target.value)}
          placeholder="On hard days, you'll see this. Write a line that brings you back to them."
          style={styles.textarea}
          maxLength={300}
        />
        <p style={styles.charCount}>{whyNote.length}/300</p>

        {error && <p style={styles.errorText}>{error}</p>}

        <div style={styles.modalActions}>
          <button onClick={onCancel} style={styles.btnSecondary}>Cancel</button>
          <button onClick={handleSave} style={styles.btnPrimary}>
            {anchor ? 'Save changes' : 'Add anchor'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ShareModal({ anchor, onClose, onShared }) {
  const inviteUrl = `${window.location.origin}/a/${anchor.invite_token}`
  const shareMessage = `Hi ${anchor.name}, I'm working on something important. This link will let you support me from afar: ${inviteUrl}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      onShared()
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = inviteUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      onShared()
    }
  }

  const sendViaSms = () => {
    const body = encodeURIComponent(shareMessage)
    window.location.href = `sms:${anchor.phone}?body=${body}`
  }

  const sendViaWhatsapp = () => {
    const body = encodeURIComponent(shareMessage)
    const cleanPhone = anchor.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanPhone}?text=${body}`, '_blank')
  }

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.formModalCard} onClick={e => e.stopPropagation()}>
        <p style={styles.modalTitle}>Share with {anchor.name}</p>
        <p style={styles.modalBody}>
          They'll see only your first name, your current streak, and a few reaction buttons. Nothing more.
        </p>

        <div style={styles.linkBox}>
          <p style={styles.linkText}>{inviteUrl}</p>
        </div>

        <div style={styles.shareActions}>
          <button onClick={copyLink} style={styles.shareActionBtn}>
            <span style={{fontSize: '20px'}}>📋</span>
            <span>Copy link</span>
          </button>
          <button onClick={sendViaWhatsapp} style={styles.shareActionBtn}>
            <span style={{fontSize: '20px'}}>💬</span>
            <span>WhatsApp</span>
          </button>
          <button onClick={sendViaSms} style={styles.shareActionBtn}>
            <span style={{fontSize: '20px'}}>📱</span>
            <span>SMS</span>
          </button>
        </div>

        <p style={styles.helperNote}>
          🔒 Anyone with this link can see your streak. Share only with people you trust.
        </p>

        <div style={styles.modalActions}>
          <button onClick={onClose} style={styles.btnSecondary}>Close</button>
        </div>
      </div>
    </div>
  )
}

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

const styles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem',
    display: 'flex', justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  phone: {
    background: '#FAF7F1',
    maxWidth: '440px', width: '100%',
    borderRadius: '28px',
    padding: '1.5rem 1.25rem 1.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  topTitle: {
    fontSize: '17px', fontWeight: 500, color: '#2A1F15', margin: 0,
    fontFamily: 'Georgia, serif', letterSpacing: '0.01em',
  },
  iconNavBtn: {
    background: 'transparent', border: 'none', color: '#854F0B',
    cursor: 'pointer', padding: '4px 6px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', minWidth: '34px',
  },
  header: { marginBottom: '1.5rem', padding: '0 4px' },
  pageTitle: {
    fontSize: '20px', fontWeight: 500, color: '#2A1F15',
    margin: 0, fontFamily: 'Georgia, serif',
  },
  intro: {
    textAlign: 'center', marginBottom: '1.25rem',
    padding: '1.25rem',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F6EFDD 100%)',
    border: '0.5px solid #E8DCC2',
    borderRadius: '16px',
  },
  introIcon: { fontSize: '32px', marginBottom: '0.5rem' },
  introText: {
    fontSize: '15px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 4px',
    fontStyle: 'italic',
  },
  introSubtle: {
    fontSize: '12px', color: '#8A7B6A',
    fontFamily: 'Georgia, serif',
    margin: 0,
  },

  // RECENT REACTIONS
  reactionsSection: { marginBottom: '1.25rem' },
  sectionLabel: {
    fontSize: '10px', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#9C8C78',
    margin: '0 0 8px', fontWeight: 500,
    paddingLeft: '4px',
  },
  reactionsList: {
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  reactionCard: {
    display: 'flex', flexWrap: 'wrap', gap: '6px',
    alignItems: 'center',
    padding: '10px 12px',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F6EFDD 100%)',
    border: '0.5px solid #E8DCC2',
    borderRadius: '12px',
  },
  reactionAnchor: {
    fontSize: '12px', fontWeight: 500, color: '#2A1F15',
  },
  reactionText: {
    fontSize: '13px', color: '#854F0B',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    flex: 1,
  },
  reactionTime: {
    fontSize: '10px', color: '#9C8C78',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },

  // HEARTBEAT
  heartbeatBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', width: '100%',
    padding: '14px',
    background: 'linear-gradient(180deg, #FAEEDA 0%, #F4DDB8 100%)',
    border: '0.5px solid #D9B57A',
    borderRadius: '14px',
    color: '#854F0B',
    fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
    marginBottom: '1.25rem',
    boxShadow: '0 2px 8px rgba(133,79,11,0.1)',
  },

  emptyState: { textAlign: 'center', padding: '2rem 1rem' },
  emptyMedallion: {
    width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
    background: 'radial-gradient(circle at 50% 40%, #FBF1DD 0%, #F1E3C6 100%)',
    border: '0.5px solid #E3D2AE',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.7), 0 4px 14px rgba(133,79,11,0.08)',
  },
  emptyText: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.6, margin: '0 0 1.5rem',
  },
  anchorsList: {
    display: 'flex', flexDirection: 'column', gap: '8px',
    marginBottom: '1rem',
  },

  // ANCHOR CARD
  anchorCard: {
    padding: '14px',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  anchorTop: {
    display: 'flex', alignItems: 'center', gap: '12px',
  },
  anchorAvatar: {
    width: '42px', height: '42px', borderRadius: '50%',
    background: 'linear-gradient(180deg, #C5572C 0%, #A8431F 100%)',
    color: '#FAF7F1',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontWeight: 500, fontFamily: 'Georgia, serif',
    flexShrink: 0,
  },
  anchorInfo: { flex: 1, minWidth: 0 },
  anchorName: {
    fontSize: '14px', fontWeight: 500, color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0,
    display: 'flex', alignItems: 'center', gap: '8px',
    flexWrap: 'wrap',
  },
  anchorRelChip: {
    fontSize: '10px',
    background: '#F4ECDD',
    color: '#854F0B',
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: 500,
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    fontStyle: 'normal',
  },
  anchorPhone: {
    fontSize: '12px', color: '#6B5C4A',
    margin: '2px 0 0',
    fontVariantNumeric: 'tabular-nums',
  },
  anchorActions: {
    display: 'flex', gap: '4px', flexShrink: 0,
  },
  iconBtn: {
    width: '32px', height: '32px',
    background: 'transparent',
    border: '0.5px solid #E8DFD0',
    borderRadius: '8px',
    color: '#9C8C78', fontSize: '13px',
    cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  whyPreview: {
    margin: '10px 0 0',
    padding: '8px 12px',
    background: '#F4ECDD',
    borderRadius: '8px',
    border: '0.5px solid #E8DCC2',
    fontSize: '12px',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    color: '#2A1F15',
    lineHeight: 1.5,
    display: 'flex', alignItems: 'flex-start', gap: '4px',
  },
  whyQuote: {
    color: '#C5572C', fontSize: '20px', lineHeight: 1,
    fontWeight: 700, opacity: 0.6, flexShrink: 0,
  },
  whyPreviewText: { flex: 1 },
  shareBtn: {
    width: '100%',
    marginTop: '10px',
    padding: '8px 12px',
    background: 'transparent',
    border: '0.5px dashed #C9B894',
    borderRadius: '10px',
    color: '#854F0B',
    fontSize: '12px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
  },

  addMoreBtn: {
    width: '100%',
    padding: '14px',
    background: 'transparent',
    border: '1px dashed #C9B894',
    borderRadius: '14px',
    color: '#854F0B',
    fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
    marginBottom: '1.25rem',
  },
  maxedNote: {
    fontSize: '12px', color: '#9C8C78',
    textAlign: 'center', fontStyle: 'italic',
    margin: '0 0 1.25rem',
    fontFamily: 'Georgia, serif',
  },
  privacyNote: {
    background: '#F4ECDD',
    border: '0.5px solid #E8DCC2',
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '1rem',
  },
  privacyTitle: {
    fontSize: '11px', textTransform: 'uppercase',
    letterSpacing: '0.08em', color: '#854F0B',
    margin: '0 0 4px', fontWeight: 600,
  },
  privacyText: {
    fontSize: '11px', color: '#6B5C4A',
    margin: 0, lineHeight: 1.5,
    fontFamily: 'Georgia, serif',
  },
  btnPrimary: {
    padding: '11px 24px', borderRadius: '999px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  btnSecondary: {
    padding: '11px 24px', borderRadius: '999px',
    background: 'white', color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  btnDanger: {
    padding: '11px 24px', borderRadius: '999px',
    background: 'linear-gradient(180deg, #B23B3B 0%, #8E2828 100%)',
    color: 'white', border: 'none',
    fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  tabRow: {
    display: 'flex', gap: '4px', padding: '6px',
    background: 'white', borderRadius: '16px',
    border: '0.5px solid #E8DFD0',
    boxShadow: '0 4px 14px rgba(80,50,20,0.05)',
    marginTop: '0.5rem',
  },
  tab: {
    flex: 1, padding: '9px 4px', textAlign: 'center',
    fontSize: '11px', color: '#9C8C78', borderRadius: '10px',
    background: 'transparent', border: 'none',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  tabActive: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #EFE5D0 100%)',
    color: '#2A1F15', fontWeight: 500,
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)',
  },

  // MODAL
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(40,25,15,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', zIndex: 100,
    backdropFilter: 'blur(4px)',
  },
  modalCard: {
    background: '#FAF7F1', maxWidth: '360px', width: '100%',
    borderRadius: '20px', padding: '1.75rem 1.5rem',
    boxShadow: '0 20px 60px rgba(40,25,15,0.3)',
  },
  formModalCard: {
    background: '#FAF7F1', maxWidth: '420px', width: '100%',
    borderRadius: '20px', padding: '1.75rem 1.5rem',
    boxShadow: '0 20px 60px rgba(40,25,15,0.3)',
    maxHeight: '92vh', overflowY: 'auto',
  },
  modalTitle: {
    fontSize: '17px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 1rem', fontFamily: 'Georgia, serif',
  },
  modalBody: {
    fontSize: '13px', color: '#6B5C4A',
    margin: '0 0 1rem', lineHeight: 1.5,
    fontFamily: 'Georgia, serif',
  },
  modalActions: {
    display: 'flex', gap: '8px', justifyContent: 'flex-end',
    marginTop: '1.25rem',
  },

  // FORM FIELDS
  fieldLabel: {
    display: 'block',
    fontSize: '11px', textTransform: 'uppercase',
    letterSpacing: '0.08em', color: '#9C8C78',
    fontWeight: 500, margin: '1rem 0 6px',
  },
  input: {
    width: '100%', padding: '11px 14px',
    borderRadius: '10px', border: '0.5px solid #DDCFB6',
    background: 'white', fontSize: '14px',
    color: '#2A1F15', fontFamily: 'inherit',
    boxSizing: 'border-box', outline: 'none',
  },
  textarea: {
    width: '100%', padding: '10px 12px',
    borderRadius: '10px', border: '0.5px solid #DDCFB6',
    background: 'white', fontSize: '13px',
    color: '#2A1F15', fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    boxSizing: 'border-box', outline: 'none',
    minHeight: '80px', resize: 'vertical',
    lineHeight: 1.5,
  },
  charCount: {
    fontSize: '10px', color: '#9C8C78',
    textAlign: 'right', margin: '4px 0 0',
  },

  // RELATIONSHIP GRID
  relGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px',
  },
  relChip: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '4px', padding: '10px 4px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '10px',
    fontSize: '10px', color: '#6B5C4A',
    cursor: 'pointer', fontFamily: 'inherit',
    fontWeight: 500,
  },
  relChipActive: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '0.5px solid #C5572C',
    color: '#2A1F15',
  },

  helperNote: {
    fontSize: '11px', color: '#854F0B',
    background: '#F4ECDD',
    padding: '8px 12px', borderRadius: '8px',
    margin: '0.875rem 0 0',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
  },
  errorText: {
    fontSize: '12px', color: '#B23B3B',
    background: '#FBEBEB',
    padding: '8px 12px', borderRadius: '8px',
    margin: '0.875rem 0 0',
  },

  // SHARE MODAL
  linkBox: {
    background: '#F4ECDD',
    border: '0.5px solid #E8DCC2',
    borderRadius: '10px',
    padding: '10px 12px',
    margin: '0 0 1rem',
    overflowX: 'auto',
  },
  linkText: {
    fontSize: '12px', color: '#854F0B',
    margin: 0, fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
  shareActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  shareActionBtn: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '4px',
    padding: '14px 8px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    fontSize: '11px', color: '#2A1F15',
    fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
  },

//HEARTBEAT
heartbeatList: {
  display: 'flex', flexDirection: 'column', gap: '8px',
  margin: '0.75rem 0',
},
heartbeatRow: {
  display: 'flex', alignItems: 'center', gap: '12px',
  padding: '12px',
  background: 'white',
  border: '0.5px solid #E8DFD0',
  borderRadius: '12px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  textAlign: 'left',
  width: '100%',
  transition: 'all 0.15s',
},
heartbeatAvatar: {
  width: '38px', height: '38px', borderRadius: '50%',
  background: 'linear-gradient(180deg, #C5572C 0%, #A8431F 100%)',
  color: '#FAF7F1',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '15px', fontWeight: 500, fontFamily: 'Georgia, serif',
  flexShrink: 0,
},
heartbeatInfo: { flex: 1, minWidth: 0 },
heartbeatName: {
  fontSize: '13px', fontWeight: 500, color: '#2A1F15',
  margin: 0, fontFamily: 'Georgia, serif',
  display: 'flex', alignItems: 'center', gap: '6px',
  flexWrap: 'wrap',
},
heartbeatRelChip: {
  fontSize: '10px',
  background: '#F4ECDD',
  color: '#854F0B',
  padding: '1px 8px',
  borderRadius: '999px',
  fontWeight: 500,
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
  fontStyle: 'normal',
},
heartbeatPhone: {
  fontSize: '11px', color: '#6B5C4A',
  margin: '2px 0 0',
  fontVariantNumeric: 'tabular-nums',
},
heartbeatSendIcon: {
  width: '36px', height: '36px',
  borderRadius: '10px',
  background: 'linear-gradient(180deg, #25D366 0%, #1da955 100%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
  boxShadow: '0 3px 10px rgba(37,211,102,0.3)',
},
  
  // TOAST
  toast: {
    position: 'fixed',
    bottom: '24px', left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    padding: '12px 20px', borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(40,25,10,0.4)',
    zIndex: 300,
    maxWidth: '90vw',
  },
  toastText: {
    fontSize: '13px', margin: 0,
    fontFamily: 'Georgia, serif',
  },
}