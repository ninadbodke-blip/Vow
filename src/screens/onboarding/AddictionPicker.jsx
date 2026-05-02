import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../LanguageContext'
import { supabase } from '../../supabaseClient'

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
    maxWidth: '460px',
    width: '100%',
    borderRadius: '28px',
    padding: '2rem 1.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  header: { textAlign: 'center', marginBottom: '1.5rem' },
  title: {
    fontSize: '22px', fontWeight: 500, color: '#2A1F15', margin: 0,
    fontFamily: 'Georgia, serif',
  },
  subtitle: {
    fontSize: '12px', color: '#8A7B6A', margin: '6px 0 0',
  },
  countBar: {
    fontSize: '11px', color: '#6B5C4A',
    textAlign: 'center', marginBottom: '1rem',
    padding: '8px', background: '#F4ECDD',
    borderRadius: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '1.5rem',
  },
  tile: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px 6px',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
    transition: 'all 0.15s',
    position: 'relative',
    fontFamily: 'inherit',
  },
  tileSelected: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    border: '0.5px solid #241710',
    boxShadow: '0 4px 12px rgba(40,25,10,0.25)',
  },
  tileExisting: {
    background: '#E8DCC2',
    border: '0.5px solid #C9B894',
    cursor: 'not-allowed',
  },
  tileLocked: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  icon: { fontSize: '22px', marginBottom: '4px' },
  name: {
    fontSize: '11px',
    color: '#2A1F15',
    fontWeight: 500,
    margin: 0,
    lineHeight: 1.25,
  },
  nameSelected: { color: '#FAF7F1' },
  badge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    color: 'white',
    borderRadius: '6px',
    padding: '1px 5px',
    fontSize: '8px',
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  badgeAdded: { background: '#7A8C5A' },
  badgePro: { background: '#D97757' },
  bottomBar: { display: 'flex', flexDirection: 'column', gap: '8px' },
  btn: {
    padding: '14px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnPrimary: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  btnSecondary: {
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
  },
  btnDisabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  err: {
    fontSize: '12px', color: '#B23B3B',
    textAlign: 'center', padding: '8px',
    background: '#FBEBEB', borderRadius: '6px',
    marginBottom: '8px',
  },
}

const FREE_LIMIT = 2

export default function AddictionPicker() {
  const { t } = useLang()
  const navigate = useNavigate()

  const [addictions, setAddictions] = useState([])
  const [existingIds, setExistingIds] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          navigate('/signup')
          return
        }

        // Load all addiction types
        const { data: addictionData, error: aErr } = await supabase
          .from('addiction_types')
          .select('*')
          .order('id')
        if (aErr) throw aErr

        // Load user's existing active trackers
        const { data: trackerData, error: tErr } = await supabase
          .from('trackers')
          .select('addiction_type_id')
          .eq('user_id', user.id)
          .eq('is_active', true)
        if (tErr) throw tErr

        const existing = trackerData.map(t => t.addiction_type_id).filter(Boolean)
        setExistingIds(existing)
        setAddictions(addictionData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const slotsLeft = FREE_LIMIT - existingIds.length
  const canAddMore = slotsLeft > 0

  const toggle = (id) => {
    setError(null)
    if (existingIds.includes(id)) {
      setError('You\'re already tracking this. Go back to home to view it.')
      return
    }
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id))
    } else {
      if (selected.length >= slotsLeft) {
        setError(`Free plan allows ${FREE_LIMIT} addictions. You're already tracking ${existingIds.length}. Delete one or upgrade to Premium.`)
        return
      }
      setSelected([...selected, id])
    }
  }

  const handleNext = () => {
    if (selected.length === 0) {
      setError('Please choose at least one to begin.')
      return
    }
    navigate('/onboarding/setup', { state: { selectedIds: selected } })
  }

  const handleBack = () => {
    if (existingIds.length > 0) navigate('/home')
    else navigate('/signup')
  }

  if (loading) {
    return (
      <div style={{...styles.frame, alignItems: 'center'}}>
        <div style={{...styles.card, textAlign: 'center', color: '#9C8C78'}}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {existingIds.length > 0 ? 'Add another addiction' : t('pickAddictions')}
          </h2>
          <p style={styles.subtitle}>
            {existingIds.length > 0
              ? `You can add ${slotsLeft} more on free plan`
              : t('pickUpTo2')}
          </p>
        </div>

        <div style={styles.countBar}>
          {existingIds.length > 0 && `${existingIds.length} already tracking · `}
          {selected.length} of {slotsLeft} new selected
        </div>

        {error && <div style={styles.err}>{error}</div>}

        <div style={styles.grid}>
          {addictions.map(a => {
            const isExisting = existingIds.includes(a.id)
            const isSelected = selected.includes(a.id)
            const wouldExceed = !isSelected && !isExisting && selected.length >= slotsLeft

            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggle(a.id)}
                disabled={isExisting || wouldExceed}
                style={{
                  ...styles.tile,
                  ...(isSelected ? styles.tileSelected : {}),
                  ...(isExisting ? styles.tileExisting : {}),
                  ...(wouldExceed ? styles.tileLocked : {}),
                }}
              >
                {isExisting && <span style={{...styles.badge, ...styles.badgeAdded}}>Added</span>}
                {wouldExceed && !isExisting && <span style={{...styles.badge, ...styles.badgePro}}>Pro</span>}
                <div style={styles.icon}>{a.icon}</div>
                <p style={{...styles.name, ...(isSelected ? styles.nameSelected : {})}}>
                  {a.name}
                </p>
              </button>
            )
          })}
        </div>

        <div style={styles.bottomBar}>
          <button
            onClick={handleNext}
            disabled={selected.length === 0 || !canAddMore}
            style={{
              ...styles.btn,
              ...styles.btnPrimary,
              ...(selected.length === 0 || !canAddMore ? styles.btnDisabled : {})
            }}
          >
            {t('next')}
          </button>
          {existingIds.length > 0 && (
            <button onClick={handleBack} style={{...styles.btn, ...styles.btnSecondary}}>
              {t('back')} to home
            </button>
          )}
        </div>
      </div>
    </div>
  )
}