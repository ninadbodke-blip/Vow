import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../../LanguageContext'
import { supabase } from '../../supabaseClient'
import { resolveAddictionTypeId } from '../vowPath/utils/addictionTypes'

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
    padding: '2rem 1.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  progress: {
    fontSize: '11px',
    color: '#9C8C78',
    textAlign: 'center',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  addictionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    background: '#F4ECDD',
    borderRadius: '12px',
    marginBottom: '1.5rem',
  },
  addictionIcon: { fontSize: '28px' },
  addictionName: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
  sectionTitle: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontWeight: 500,
    margin: '0 0 10px',
    fontFamily: 'Georgia, serif',
  },
  sectionTitleSmall: {
    fontSize: '12px',
    color: '#8A7B6A',
    fontWeight: 500,
    margin: '0 0 8px',
    fontFamily: 'Georgia, serif',
  },
  optionRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '1rem',
  },
  optionBtn: {
    padding: '14px 8px',
    borderRadius: '10px',
    border: '0.5px solid #E8DFD0',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    fontSize: '13px',
    fontWeight: 500,
    color: '#2A1F15',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  optionSelected: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: '0.5px solid #241710',
  },
  dateInput: {
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
    marginBottom: '1rem',
  },
  costRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px',
    marginBottom: '0.75rem',
  },
  costBtn: {
    padding: '12px 4px',
    borderRadius: '10px',
    border: '0.5px solid #E8DFD0',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    fontSize: '13px',
    fontWeight: 500,
    color: '#2A1F15',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  customInput: {
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
    marginBottom: '1rem',
  },
  trackingTypeRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '1.25rem',
  },
  typeBtn: {
    padding: '14px 6px',
    borderRadius: '12px',
    border: '0.5px solid #E8DFD0',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'center',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  typeBtnSelected: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    border: '0.5px solid #241710',
    boxShadow: '0 4px 12px rgba(40,25,10,0.25)',
  },
  typeIcon: { fontSize: '20px', marginBottom: '4px' },
  typeLabel: {
    fontSize: '12px',
    color: '#2A1F15',
    fontWeight: 500,
    margin: 0,
  },
  typeLabelSelected: { color: '#FAF7F1' },
  bottomBar: {
    display: 'flex',
    gap: '8px',
    marginTop: '1.5rem',
  },
  btn: {
    padding: '14px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    flex: 1,
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
    fontSize: '12px',
    color: '#B23B3B',
    textAlign: 'center',
    padding: '8px',
    background: '#FBEBEB',
    borderRadius: '6px',
    marginTop: '8px',
  },
}

const COST_PRESETS = [50, 100, 200, 500]
const TIME_PRESETS = [15, 30, 60, 120]

export default function TrackerSetup() {
  const { t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()

  const [addictions, setAddictions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [setupData, setSetupData] = useState({})

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/app/signup')
        return
      }

      // Step 1: Figure out which addiction(s) we are setting up.
      // Source priority:
      //   A) route state.selectedIds — coming from AddictionPicker
      //   B) vow_path_progress.primary_substance — deep-linked from a free home
      let selectedIds = location.state?.selectedIds || []

      if (selectedIds.length === 0) {
        const { data: progress } = await supabase
          .from('vow_path_progress')
          .select('primary_substance')
          .eq('user_id', user.id)
          .maybeSingle()

        // primary_substance may be a numeric addiction_types.id (onboarding) or a
        // substances.js slug (Vow Path). resolveAddictionTypeId handles both.
        const resolvedId = await resolveAddictionTypeId(progress?.primary_substance)
        if (resolvedId != null) selectedIds = [resolvedId]
      }

      // Step 2: Nothing trackable — surface a clear message instead of a blank screen.
      if (selectedIds.length === 0) {
        setError("Tracking isn't available for this substance yet.")
        setLoading(false)
        return
      }

      // Step 3: Did this user already create a tracker for this addiction?
      // If so, skip setup and bounce back to /home — they don't need to set up again.
      const { data: existingTrackers } = await supabase
        .from('trackers')
        .select('id, addiction_type_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .in('addiction_type_id', selectedIds)

      if (existingTrackers && existingTrackers.length === selectedIds.length) {
        navigate('/app/home')
        return
      }

      // Filter selectedIds down to those not yet tracked
      const alreadyTracked = new Set((existingTrackers || []).map(t => t.addiction_type_id))
      const toSetUp = selectedIds.filter(id => !alreadyTracked.has(id))

      if (toSetUp.length === 0) {
        navigate('/app/home')
        return
      }

      // Step 4: Load addiction_types details for the selected ones
      const { data: addictionData, error: loadError } = await supabase
        .from('addiction_types')
        .select('*')
        .in('id', toSetUp)

      if (loadError) {
        setError(loadError.message)
        setLoading(false)
        return
      }

const ordered = toSetUp.map(id => addictionData.find(a => a.id === id)).filter(Boolean)
setAddictions(ordered)
setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div style={{ ...styles.frame, alignItems: 'center' }}>
        <div style={{ ...styles.card, textAlign: 'center', color: '#9C8C78' }}>Loading...</div>
      </div>
    )
  }

  if (addictions.length === 0) {
    return (
      <div style={{ ...styles.frame, alignItems: 'center' }}>
        <div style={styles.card}>
          <p style={{ fontFamily: 'Georgia, serif', color: '#2A1F15', fontSize: '15px', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
            {error || "Tracking isn't available for this substance yet."}
          </p>
          <button onClick={() => navigate('/app/home')} style={{ ...styles.optionBtn, width: '100%' }}>
            Back to home
          </button>
        </div>
      </div>
    )
  }

  const current = addictions[currentIdx]
  if (!current) return null
  const currentSetup = setupData[current.id] || { trackingType: 'money' }

  const updateSetup = (changes) => {
    setSetupData({
      ...setupData,
      [current.id]: { ...currentSetup, ...changes }
    })
    setError(null)
  }

  const setQuitOption = (option) => {
    let date = new Date()
    if (option === 'yesterday') {
      date.setDate(date.getDate() - 1)
    } else if (option === 'earlier') {
      updateSetup({ quitOption: option })
      return
    }
    updateSetup({
      quitOption: option,
      startDate: date.toISOString(),
    })
  }

  const setEarlierDate = (dateStr) => {
    updateSetup({ startDate: new Date(dateStr).toISOString() })
  }

  const setTrackingType = (type) => {
    updateSetup({
      trackingType: type,
      cost: 0,
      customCost: '',
      timeMinutes: 0,
      customTime: '',
    })
  }

  const setCost = (amount) => updateSetup({ cost: amount, customCost: '' })
  const setCustomCost = (val) => updateSetup({ customCost: val, cost: parseFloat(val) || 0 })

  const setTime = (minutes) => updateSetup({ timeMinutes: minutes, customTime: '' })
  const setCustomTime = (val) => updateSetup({ customTime: val, timeMinutes: parseFloat(val) || 0 })

  const isCurrentValid = () => {
    if (!currentSetup.startDate) return false
    const type = currentSetup.trackingType || 'money'
    if (type === 'money') return currentSetup.cost > 0
    if (type === 'time') return currentSetup.timeMinutes > 0
    if (type === 'both') return currentSetup.cost > 0 && currentSetup.timeMinutes > 0
    return false
  }

  const handleNext = async () => {
    if (!isCurrentValid()) {
      setError('Please complete all required fields.')
      return
    }

    if (currentIdx < addictions.length - 1) {
      setCurrentIdx(currentIdx + 1)
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')

      const trackersToInsert = addictions.map(a => ({
        user_id: user.id,
        addiction_type_id: a.id,
        start_date: setupData[a.id].startDate,
        is_active: true,
        tracker_status: 'active',
      }))

      const { data: insertedTrackers, error: insertError } = await supabase
        .from('trackers')
        .insert(trackersToInsert)
        .select()

      if (insertError) throw insertError

      const savingsToInsert = []
      insertedTrackers.forEach((tracker, idx) => {
        const data = setupData[addictions[idx].id]
        const type = data.trackingType || 'money'

        if (type === 'money' || type === 'both') {
          savingsToInsert.push({
            tracker_id: tracker.id,
            savings_type: 'money',
            per_day_amount: data.cost,
          })
        }
        if (type === 'time' || type === 'both') {
          savingsToInsert.push({
            tracker_id: tracker.id,
            savings_type: 'time',
            per_day_amount: data.timeMinutes,
          })
        }
      })

      const { error: savingsError } = await supabase
        .from('tracker_savings')
        .insert(savingsToInsert)

      if (savingsError) throw savingsError

      // The counter just started ticking — the single best moment to ask an
      // anonymous user to save their progress, since they now have something
      // real to lose. A permanent account skips straight home, unchanged.
      navigate(user.is_anonymous ? '/app/onboarding/save-progress' : '/app/home')
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1)
    else navigate('/app/home')
  }

  const trackingType = currentSetup.trackingType || 'money'

  return (
    <div style={styles.frame}>
      <div style={styles.card}>
        <p style={styles.progress}>Setup {currentIdx + 1} of {addictions.length}</p>

        <div style={styles.addictionHeader}>
          <span style={styles.addictionIcon}>{current.icon}</span>
          <h3 style={styles.addictionName}>{current.name}</h3>
        </div>

        <p style={styles.sectionTitle}>{t('whenDidYouQuit')}?</p>
        <div style={styles.optionRow}>
          {['today', 'yesterday', 'earlier'].map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setQuitOption(opt)}
              style={{
                ...styles.optionBtn,
                ...(currentSetup.quitOption === opt ? styles.optionSelected : {})
              }}
            >
              {t(opt)}
            </button>
          ))}
        </div>

        {currentSetup.quitOption === 'earlier' && (
          <input
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={currentSetup.startDate ? currentSetup.startDate.split('T')[0] : ''}
            onChange={(e) => setEarlierDate(e.target.value)}
            style={styles.dateInput}
          />
        )}

        <p style={styles.sectionTitle}>What do you want to track?</p>
        <div style={styles.trackingTypeRow}>
          <button
            type="button"
            onClick={() => setTrackingType('money')}
            style={{ ...styles.typeBtn, ...(trackingType === 'money' ? styles.typeBtnSelected : {}) }}
          >
            <div style={styles.typeIcon}>💰</div>
            <p style={{ ...styles.typeLabel, ...(trackingType === 'money' ? styles.typeLabelSelected : {}) }}>Money</p>
          </button>
          <button
            type="button"
            onClick={() => setTrackingType('time')}
            style={{ ...styles.typeBtn, ...(trackingType === 'time' ? styles.typeBtnSelected : {}) }}
          >
            <div style={styles.typeIcon}>⏱️</div>
            <p style={{ ...styles.typeLabel, ...(trackingType === 'time' ? styles.typeLabelSelected : {}) }}>Time</p>
          </button>
          <button
            type="button"
            onClick={() => setTrackingType('both')}
            style={{ ...styles.typeBtn, ...(trackingType === 'both' ? styles.typeBtnSelected : {}) }}
          >
            <div style={styles.typeIcon}>✨</div>
            <p style={{ ...styles.typeLabel, ...(trackingType === 'both' ? styles.typeLabelSelected : {}) }}>Both</p>
          </button>
        </div>

        {(trackingType === 'money' || trackingType === 'both') && (
          <>
            <p style={styles.sectionTitleSmall}>Money spent per day (₹)</p>
            <div style={styles.costRow}>
              {COST_PRESETS.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCost(amt)}
                  style={{
                    ...styles.costBtn,
                    ...(currentSetup.cost === amt && !currentSetup.customCost ? styles.optionSelected : {})
                  }}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="0"
              placeholder="Custom amount"
              value={currentSetup.customCost || ''}
              onChange={(e) => setCustomCost(e.target.value)}
              style={styles.customInput}
            />
          </>
        )}

        {(trackingType === 'time' || trackingType === 'both') && (
          <>
            <p style={styles.sectionTitleSmall}>Time spent per day (mins)</p>
            <div style={styles.costRow}>
              {TIME_PRESETS.map(min => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setTime(min)}
                  style={{
                    ...styles.costBtn,
                    ...(currentSetup.timeMinutes === min && !currentSetup.customTime ? styles.optionSelected : {})
                  }}
                >
                  {min}m
                </button>
              ))}
            </div>
            <input
              type="number"
              min="0"
              placeholder="Custom minutes"
              value={currentSetup.customTime || ''}
              onChange={(e) => setCustomTime(e.target.value)}
              style={styles.customInput}
            />
          </>
        )}

        {error && <div style={styles.err}>{error}</div>}

        <div style={styles.bottomBar}>
          <button
            onClick={handleBack}
            disabled={saving}
            style={{ ...styles.btn, ...styles.btnSecondary }}
          >
            {t('back')}
          </button>
          <button
            onClick={handleNext}
            disabled={!isCurrentValid() || saving}
            style={{
              ...styles.btn,
              ...styles.btnPrimary,
              ...(!isCurrentValid() || saving ? styles.btnDisabled : {})
            }}
          >
            {saving ? '...' : (currentIdx === addictions.length - 1 ? t('finish') : t('next'))}
          </button>
        </div>
      </div>
    </div>
  )
}