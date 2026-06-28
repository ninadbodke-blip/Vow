import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../LanguageContext'
import { supabase } from '../../supabaseClient'

// =====================================================================
// THE SEED — the first frame of the tree story.
// =====================================================================
// Unselected: a seed rests on the soil, waiting. Selecting a habit
// settles the seed into the ground and a small sprout appears — naming
// it is the planting. The home screen's tree grows from here.
// =====================================================================
function SeedHero({ selected }) {
  const planted = !!selected
  return (
    <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%' }}>
      {/* soft morning sun, brightens once planted */}
      <circle cx="186" cy="52" r="17" fill="#EAD9B4" opacity={planted ? 0.9 : 0.45} style={{ transition: 'opacity 0.6s ease' }} />

      {/* gentle halo around the seed while it waits */}
      {!planted && (
        <circle cx="120" cy="152" r="26" fill="none" stroke="#D9B57A" strokeWidth="1">
          <animate attributeName="r" values="22; 30; 22" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.12; 0.4; 0.12" dur="3.2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* the sprout — grows in when planted */}
      <g style={{ opacity: planted ? 1 : 0, transition: 'opacity 0.7s ease 0.15s' }}>
        <path d="M120 158 C120 146 119 138 120 126" stroke="#3A2A1C" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M120 134 C112 128 106 126 99 126 C104 134 111 137 120 136 Z" fill="#6E8A6A" />
        <path d="M120 128 C128 121 134 119 141 120 C136 128 129 131 120 130 Z" fill="#7E9B5A" />
      </g>

      {/* the seed — rests above the line, settles into it when planted */}
      <ellipse
        cx="120"
        cy={planted ? 166 : 152}
        rx="11"
        ry="14"
        fill="#7A5A38"
        stroke="#3A2A1C"
        strokeWidth="1.6"
        style={{ transition: 'cy 0.5s ease' }}
      >
        {!planted && <animate attributeName="cy" values="152; 148; 152" dur="3.2s" repeatCount="indefinite" />}
      </ellipse>
      <path d="M120 145 C122 150 122 158 120 162" stroke="#3A2A1C" strokeWidth="1" fill="none" opacity="0.5" />

      {/* the soil line, drawn over the seed so it sits "in" the ground */}
      <path d="M38 168 H202" stroke="#3A2A1C" strokeWidth="2" strokeLinecap="round" />
      <path d="M54 176 H86 M104 178 H128 M150 176 H184" stroke="#3A2A1C" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}

const seedStyles = {
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
  const [showAddictionList, setShowAddictionList] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { navigate('/app/signup'); return }

        const { data: addictionData, error: addictionError } = await supabase
          .from('addiction_types').select('*').order('id')

        if (addictionError) {
          console.error('Failed to load addiction_types:', addictionError)
          setError('Could not load the list. Please refresh.')
          setLoading(false)
          return
        }

        setAddictions(addictionData || [])
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
      setError('Pick one from the list to continue.')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/app/signup'); return }

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

      navigate('/app/onboarding/state-picker')
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
          What do you want to work on?
        </h1>
        <p style={styles.subtitle}>
          Pick the one that brought you here. You can change it later.
        </p>

        <button
          onClick={() => setShowAddictionList(true)}
          style={styles.seedBtn}
          aria-label="Choose what you want to work on"
        >
          <SeedHero selected={selected} />
        </button>

        {selected ? (
          <div style={seedStyles.nameWrap}>
            <p style={seedStyles.selectedName}>{selected.icon} {selected.name}</p>
            <p style={seedStyles.hint}>Tap the seed to change</p>
          </div>
        ) : (
          <p style={styles.hintText}>Tap the seed to choose</p>
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
          {saving ? 'Saving...' : (selected ? 'Continue' : 'Choose one to continue')}
        </button>
      </div>

      {/* ADDICTION LIST MODAL */}
      {showAddictionList && (
        <div style={styles.listModal} onClick={() => setShowAddictionList(false)}>
          <div style={styles.listSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.sheetHandle}></div>
            <p style={styles.sheetTitle}>What do you want to work on?</p>
            <div style={styles.listGrid}>
              {displayList.length === 0 ? (
                <p style={styles.emptyMsg}>The list didn't load — please refresh.</p>
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
            <button onClick={() => setShowAddictionList(false)} style={styles.closeSheet}>
              Close
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
  seedBtn: {
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