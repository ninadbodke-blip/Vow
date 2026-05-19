import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../LanguageContext'
import { supabase } from '../../supabaseClient'

function DemonFace({ selected }) {
  if (selected) {
    return (
      <div style={demonStyles.selectedWrap}>
        <div style={demonStyles.selectedIcon}>{selected.icon}</div>
        <p style={demonStyles.selectedName}>{selected.name}</p>
        <p style={demonStyles.tapToChange}>Tap to change</p>
      </div>
    )
  }

  return (
    <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="auraOuter" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(180,30,20,0.18)" />
          <stop offset="60%" stopColor="rgba(180,30,20,0.05)" />
          <stop offset="100%" stopColor="rgba(180,30,20,0)" />
        </radialGradient>
        <linearGradient id="bodyDark" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#3A0A0A" />
          <stop offset="55%" stopColor="#1A0404" />
          <stop offset="100%" stopColor="#080000" />
        </linearGradient>
        <linearGradient id="hornGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A0202" />
          <stop offset="50%" stopColor="#2A0808" />
          <stop offset="100%" stopColor="#4A0E0E" />
        </linearGradient>
        <radialGradient id="eyeGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#FFF0A0" />
          <stop offset="20%" stopColor="#FFB040" />
          <stop offset="55%" stopColor="#E8401A" />
          <stop offset="85%" stopColor="#8A1010" />
          <stop offset="100%" stopColor="#3A0202" />
        </radialGradient>
        <radialGradient id="eyeHalo" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(255,140,40,0.45)" />
          <stop offset="100%" stopColor="rgba(255,140,40,0)" />
        </radialGradient>
      </defs>

      {/* Outer red aura */}
      <circle cx="120" cy="125" r="118" fill="url(#auraOuter)" />

      {/* Smoke wisps - left */}
      <path
        d="M 35 220 Q 50 180 40 140 Q 55 160 45 110"
        stroke="rgba(60,20,10,0.2)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 60 230 Q 75 200 70 175"
        stroke="rgba(60,20,10,0.12)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />

      {/* Smoke wisps - right */}
      <path
        d="M 205 220 Q 190 180 200 140 Q 185 160 195 110"
        stroke="rgba(60,20,10,0.2)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 180 230 Q 165 200 170 175"
        stroke="rgba(60,20,10,0.12)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />

      {/* Left horn - long, curved back */}
      <path
        d="M 72 92
           Q 50 65, 32 36
           Q 27 28, 35 30
           Q 50 50, 65 75
           Q 70 85, 72 92 Z"
        fill="url(#hornGrad)"
      />

      {/* Right horn */}
      <path
        d="M 168 92
           Q 190 65, 208 36
           Q 213 28, 205 30
           Q 190 50, 175 75
           Q 170 85, 168 92 Z"
        fill="url(#hornGrad)"
      />

      {/* Horn glints */}
      <path
        d="M 40 48 Q 36 40, 36 32"
        stroke="rgba(200,80,40,0.45)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 200 48 Q 204 40, 204 32"
        stroke="rgba(200,80,40,0.45)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />

      {/* Main head - angular silhouette */}
      <path
        d="M 72 92
           L 62 130
           Q 60 165, 80 195
           Q 100 215, 120 222
           Q 140 215, 160 195
           Q 180 165, 178 130
           L 168 92
           Q 145 80, 120 80
           Q 95 80, 72 92 Z"
        fill="url(#bodyDark)"
      />

      {/* Face contour shadows (cheeks) */}
      <path
        d="M 78 155 Q 88 200, 120 220 Q 100 205, 86 165 Z"
        fill="rgba(0,0,0,0.5)"
      />
      <path
        d="M 162 155 Q 152 200, 120 220 Q 140 205, 154 165 Z"
        fill="rgba(0,0,0,0.5)"
      />

      {/* Eye halos */}
      <ellipse cx="95" cy="135" rx="24" ry="16" fill="url(#eyeHalo)" />
      <ellipse cx="145" cy="135" rx="24" ry="16" fill="url(#eyeHalo)" />

      {/* Eyes - angular almond */}
      <path
        d="M 78 132
           Q 90 124, 110 132
           Q 110 141, 100 143
           Q 85 143, 78 138 Z"
        fill="url(#eyeGlow)"
      />
      <path
        d="M 162 132
           Q 150 124, 130 132
           Q 130 141, 140 143
           Q 155 143, 162 138 Z"
        fill="url(#eyeGlow)"
      />

      {/* Eye bright spots */}
      <ellipse cx="95" cy="132" rx="3" ry="2" fill="#FFF6D0" opacity="0.9" />
      <ellipse cx="145" cy="132" rx="3" ry="2" fill="#FFF6D0" opacity="0.9" />

      {/* Vertical slit pupils */}
      <path d="M 95 127 Q 96.5 134, 95 141 Q 93.5 134, 95 127 Z" fill="#000" />
      <path d="M 145 127 Q 146.5 134, 145 141 Q 143.5 134, 145 127 Z" fill="#000" />

      {/* Brow ridge shadows */}
      <path d="M 75 121 Q 95 115, 115 124 Q 95 128, 75 126 Z" fill="#000" opacity="0.65" />
      <path d="M 125 124 Q 145 115, 165 121 Q 145 128, 125 128 Z" fill="#000" opacity="0.65" />

      {/* Jagged fang-mouth */}
      <path
        d="M 88 175
           L 92 185 L 98 175 L 102 185 L 108 175 L 112 185 L 118 175 L 122 185
           L 128 175 L 132 185 L 138 175 L 142 185 L 148 175 L 152 184
           Q 135 196, 120 197 Q 105 196, 88 175 Z"
        fill="#000"
        opacity="0.95"
      />

      {/* Mouth inner depth */}
      <path
        d="M 100 185 Q 120 193, 140 185 Q 130 196, 120 196 Q 110 196, 100 185 Z"
        fill="#1A0204"
      />
    </svg>
  )
}

const demonStyles = {
  selectedWrap: {
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '2px solid #C5572C',
    borderRadius: '50%',
    boxShadow: '0 8px 24px rgba(197,87,44,0.2)',
  },
  selectedIcon: { fontSize: '64px', marginBottom: '8px' },
  selectedName: {
    fontSize: '16px', fontWeight: 600, color: '#2A1F15',
    fontFamily: 'Georgia, serif', margin: 0,
  },
  tapToChange: {
    fontSize: '11px', color: '#9C8C78',
    margin: '4px 0 0', fontStyle: 'italic',
  },
}

export default function AddictionPicker({ onboardingDone }) {
  const { t } = useLang()
  const navigate = useNavigate()

  const [addictions, setAddictions] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showFounderMessage, setShowFounderMessage] = useState(false)
  const [showAddictionList, setShowAddictionList] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { navigate('/signup'); return }

        const { data: addictionData, error: addictionError } = await supabase
          .from('addiction_types').select('*').order('id')

        if (addictionError) {
          console.error('Failed to load addiction_types:', addictionError)
          setError('Could not load options. Please refresh.')
          setLoading(false)
          return
        }

        setAddictions(addictionData || [])

        if (!onboardingDone) setShowFounderMessage(true)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [onboardingDone])

  const handleNext = async () => {
    if (!selected) {
      setError('Tap the face above to name your vice.')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/signup'); return }

      const substanceUpdate = {
        user_id: user.id,
        primary_substance: selected.id,
        substance_label: selected.name,
        updated_at: new Date().toISOString(),
      }
      if (selected.family) substanceUpdate.substance_family = selected.family
      if (selected.verb) substanceUpdate.substance_verb = selected.verb

      const { error: upsertError } = await supabase
        .from('vow_path_progress')
        .upsert(substanceUpdate, { onConflict: 'user_id' })

      if (upsertError) {
        console.error('Failed to save substance selection:', upsertError)
        setError('Could not save your selection. Please try again.')
        setSaving(false)
        return
      }

      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id)

      navigate('/onboarding/state-picker')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const filteredAddictions = addictions.filter(a => {
    if (!searchQuery) return true
    return a.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div style={{ ...styles.frame, alignItems: 'center' }}>
        <div style={{ ...styles.card, textAlign: 'center', color: '#9C8C78' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          Which vice do you vow to address?
        </h1>
        <p style={styles.subtitle}>
          Tap the face below to name it.
        </p>

        <button
          onClick={() => setShowAddictionList(true)}
          style={styles.demonBtn}
          aria-label="Pick your vice"
        >
          <DemonFace selected={selected} />
        </button>

        {!selected && (
          <p style={styles.hintText}>Tap to choose</p>
        )}

        {error && <div style={styles.err}>{error}</div>}

        <button
          onClick={handleNext}
          disabled={!selected || saving}
          style={{
            ...styles.btn,
            ...(selected && !saving ? styles.btnPrimary : styles.btnDisabled),
          }}
        >
          {saving ? 'Saving...' : (selected ? 'Continue' : 'Pick first')}
        </button>
      </div>

      {/* ADDICTION LIST MODAL */}
      {showAddictionList && (
        <div style={styles.listModal} onClick={() => setShowAddictionList(false)}>
          <div style={styles.listSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.sheetHandle}></div>
            <p style={styles.sheetTitle}>Pick your vice</p>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              autoFocus
            />
            <div style={styles.listGrid}>
              {filteredAddictions.length === 0 ? (
                <p style={styles.emptyMsg}>No matches found.</p>
              ) : (
                filteredAddictions.map(a => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setSelected(a)
                      setShowAddictionList(false)
                      setSearchQuery('')
                      setError(null)
                    }}
                    style={styles.listItem}
                  >
                    <span style={styles.listIcon}>{a.icon}</span>
                    <span style={styles.listName}>{a.name}</span>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setShowAddictionList(false)}
              style={styles.closeSheet}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FOUNDER MESSAGE */}
      {showFounderMessage && (
        <div style={founderStyles.modal}>
          <div style={founderStyles.modalCard}>
            <div style={founderStyles.waveIcon}>👋</div>
            <h3 style={founderStyles.title}>Welcome to Vow.</h3>
            <p style={founderStyles.body}>
              I built this app after battling substance abuse for 15 years.
              With the support of my loved ones, I was able to overcome it.
            </p>
            <p style={founderStyles.bodyEmphasis}>
              I'm sharing this to remind you — it's not impossible.<br />
              You can do this too.
            </p>
            <div style={founderStyles.signature}>— Ninad, founder</div>
            <button
              onClick={() => setShowFounderMessage(false)}
              style={founderStyles.btn}
            >
              Begin
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: '#FAF7F1',
    maxWidth: '420px',
    width: '100%',
    borderRadius: '28px',
    padding: '2rem 1.75rem 2.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: '0.5rem 0 0.5rem',
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: '13px',
    color: '#8A7B6A',
    margin: '0 0 2.5rem',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
  },
  demonBtn: {
    width: '240px',
    height: '240px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    margin: '0 auto 1rem',
    transition: 'transform 0.2s',
  },
  hintText: {
    fontSize: '12px',
    color: '#9C8C78',
    fontStyle: 'italic',
    margin: '0 0 2rem',
    fontFamily: 'Georgia, serif',
  },
  err: {
    fontSize: '12px',
    color: '#B23B3B',
    textAlign: 'center',
    padding: '8px 12px',
    background: '#FBEBEB',
    borderRadius: '8px',
    margin: '0 0 1rem',
    width: '100%',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: 'auto',
  },
  btnPrimary: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  btnDisabled: {
    background: '#E8DFD0',
    color: '#9C8C78',
    cursor: 'not-allowed',
  },
  listModal: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(40,25,15,0.55)',
    backdropFilter: 'blur(4px)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '0 0.5rem',
  },
  listSheet: {
    background: '#FAF7F1',
    width: '100%',
    maxWidth: '440px',
    maxHeight: '80vh',
    borderRadius: '24px 24px 0 0',
    padding: '0.75rem 1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 -10px 40px rgba(40,25,15,0.3)',
  },
  sheetHandle: {
    width: '40px',
    height: '4px',
    background: '#DDCFB6',
    borderRadius: '2px',
    margin: '0 auto 1rem',
  },
  sheetTitle: {
    fontSize: '17px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: '0 0 1rem',
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
  },
  searchInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '0.5px solid #DDCFB6',
    background: 'white',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
    marginBottom: '12px',
  },
  listGrid: {
    overflowY: 'auto',
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    padding: '4px 4px 12px 0',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '13px',
    color: '#2A1F15',
    fontWeight: 500,
    textAlign: 'left',
    boxShadow: '0 1px 3px rgba(80,50,20,0.04)',
  },
  listIcon: { fontSize: '18px' },
  listName: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  emptyMsg: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: '#9C8C78',
    fontStyle: 'italic',
    fontSize: '13px',
    padding: '2rem 0',
    fontFamily: 'Georgia, serif',
  },
  closeSheet: {
    width: '100%',
    padding: '12px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: '0.5rem',
  },
}

const founderStyles = {
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(40,25,15,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', zIndex: 250,
    backdropFilter: 'blur(4px)',
  },
  modalCard: {
    background: '#FAF7F1',
    maxWidth: '380px',
    width: '100%',
    borderRadius: '24px',
    padding: '2rem 1.75rem',
    boxShadow: '0 20px 60px rgba(40,25,15,0.4)',
    textAlign: 'center',
  },
  waveIcon: { fontSize: '40px', marginBottom: '1rem' },
  title: {
    fontSize: '22px', fontWeight: 600, color: '#2A1F15',
    margin: '0 0 1rem', fontFamily: 'Georgia, serif',
  },
  body: {
    fontSize: '14px', color: '#6B5C4A',
    margin: '0 0 1rem', lineHeight: 1.6, fontFamily: 'Georgia, serif',
  },
  bodyEmphasis: {
    fontSize: '14px', color: '#2A1F15',
    margin: '0 0 1.25rem', lineHeight: 1.6,
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
  },
  signature: {
    fontSize: '12px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    marginBottom: '1.75rem',
  },
  btn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
  },
}