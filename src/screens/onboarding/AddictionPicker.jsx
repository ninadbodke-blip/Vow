import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../LanguageContext'
import { supabase } from '../../supabaseClient'

function BlackHole({ selected, lit }) {
  const glow = lit || !!selected
  return (
    <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="voidGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="52%" stopColor="#0A0705" />
          <stop offset="80%" stopColor="#1C140D" />
          <stop offset="100%" stopColor="#2A1F15" />
        </radialGradient>
        <radialGradient id="holeHalo" cx="50%" cy="50%">
          <stop offset="58%" stopColor="rgba(217,181,122,0)" />
          <stop offset="84%" stopColor="rgba(217,181,122,0.5)" />
          <stop offset="100%" stopColor="rgba(217,181,122,0)" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="120" r="116" fill="url(#holeHalo)" opacity={glow ? 1 : 0} style={{ transition: 'opacity 0.5s ease' }} />
      <circle cx="120" cy="120" r="92" fill="url(#voidGrad)" />
      <circle cx="120" cy="120" r="92" fill="none" stroke={glow ? '#D9B57A' : '#3A2A1C'} strokeWidth={glow ? 3 : 2} opacity={glow ? 0.95 : 0.55} style={{ transition: 'stroke 0.5s ease, opacity 0.5s ease' }} />
      <circle cx="120" cy="120" r="62" fill="none" stroke="rgba(217,181,122,0.16)" strokeWidth="1">
        <animate attributeName="opacity" values="0.10; 0.28; 0.10" dur="3.4s" repeatCount="indefinite" />
        <animate attributeName="r" values="60; 66; 60" dur="3.4s" repeatCount="indefinite" />
      </circle>
      {selected && (
        <text x="120" y="120" textAnchor="middle" dominantBaseline="central" fontSize="62">{selected.icon}</text>
      )}
    </svg>
  )
}

const holeStyles = {
  nameWrap: { textAlign: 'center', margin: '0 0 1.5rem' },
  selectedName: { fontSize: '16px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', margin: '0.25rem 0 0' },
  hint: { fontSize: '12px', color: '#9C8C78', fontStyle: 'italic', margin: '0.25rem 0 0', fontFamily: 'Georgia, serif' },
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
  const [lighting, setLighting] = useState(false)

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
      setError('Tap the void above to name it.')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/signup'); return }

      const substanceUpdate = {
        user_id: user.id,
        // Canonical format is the addiction_types.slug. Fall back to the numeric
        // id (as text) only if a row somehow lacks a slug; resolveAddictionTypeId
        // tolerates both.
        primary_substance: selected.slug || String(selected.id),
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

  // Curated pilot list. Each entry maps to whatever real addiction_types row
  // exists; MDMA + Ecstasy collapse into one. Everything else stays hidden.
  const ALLOWED = [
    { match: ['cigarette', 'smok', 'nicotine', 'tobacco'] },
    { match: ['marijuana', 'cannabis', 'weed'] },
    { match: ['alcohol'] },
    { match: ['mdma', 'ecstasy', 'molly'], display: 'MDMA / Ecstasy' },
    { match: ['heroin'] },
    { match: ['porn'] },
    { match: ['gambl', 'betting'] },
  ]
  const displayList = []
  const usedIds = new Set()
  for (const entry of ALLOWED) {
    const row = addictions.find(r => {
      if (usedIds.has(r.id)) return false
      const hay = ((r.name || '') + ' ' + (r.slug || '')).toLowerCase()
      return entry.match.some(m => hay.includes(m))
    })
    if (row) { usedIds.add(row.id); displayList.push(entry.display ? { ...row, name: entry.display } : row) }
  }

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
          What's pulling at you?
        </h1>
        <p style={styles.subtitle}>
          Tap the void to light it up — then name it.
        </p>

        <button
          onClick={() => {
            if (selected) { setShowAddictionList(true); return }
            setLighting(true)
            setTimeout(() => setShowAddictionList(true), 420)
          }}
          style={styles.demonBtn}
          aria-label="Light it up"
        >
          <BlackHole selected={selected} lit={lighting} />
        </button>

        {selected ? (
          <div style={holeStyles.nameWrap}>
            <p style={holeStyles.selectedName}>{selected.name}</p>
            <p style={holeStyles.hint}>Tap to change</p>
          </div>
        ) : (
          <p style={styles.hintText}>{lighting ? 'Lighting it up…' : 'Tap to light it up'}</p>
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
          {saving ? 'Saving...' : (selected ? 'Continue' : 'Light it up first')}
        </button>
      </div>

      {/* ADDICTION LIST MODAL */}
      {showAddictionList && (
        <div style={styles.listModal} onClick={() => { setShowAddictionList(false); setLighting(false) }}>
          <div style={styles.listSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.sheetHandle}></div>
            <p style={styles.sheetTitle}>Name what's pulling at you</p>
            <div style={styles.listGrid}>
              {displayList.length === 0 ? (
                <p style={styles.emptyMsg}>Options didn't load — please refresh.</p>
              ) : (
                displayList.map(a => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setSelected(a)
                      setShowAddictionList(false)
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
            <button onClick={() => { setShowAddictionList(false); setLighting(false) }} style={styles.closeSheet}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* FOUNDER MESSAGE */}
      {showFounderMessage && (
        <div style={founderStyles.modal}>
          <div style={founderStyles.modalCard}>
            <div style={founderStyles.flame} aria-hidden="true">
              <svg viewBox="0 0 24 32" width="26" height="34">
                <path d="M12 1 C 13 8, 20 10, 18 19 C 17.5 26, 12 31, 12 31 C 12 31, 6.5 26, 6 19 C 4 10, 11 8, 12 1 Z" fill="#D9B57A" />
                <path d="M12 12 C 13 16, 15 18, 14 23 C 13.5 27, 12 30, 12 30 C 12 30, 10.5 27, 10 23 C 9 18, 11 16, 12 12 Z" fill="#FBE3B8" />
              </svg>
            </div>
            <p style={founderStyles.body}>
              It took me 15 years to put this down, and I couldn't have done it alone. This app is the hand I wish I'd had sooner.
            </p>
            <p style={founderStyles.welcome}>Welcome.</p>
            <div style={founderStyles.signature}>— Ninad</div>
            <button onClick={() => setShowFounderMessage(false)} style={founderStyles.btn}>
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
  flame: { display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' },
  welcome: { fontSize: '16px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 1.25rem' },
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