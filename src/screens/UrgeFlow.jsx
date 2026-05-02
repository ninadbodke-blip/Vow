import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLang } from '../LanguageContext'
import { supabase } from '../supabaseClient'

export default function UrgeFlow() {
  const { trackerId } = useParams()
  const navigate = useNavigate()
  const { t } = useLang()

  const [step, setStep] = useState(1)
  const [tracker, setTracker] = useState(null)
  const [pastNotes, setPastNotes] = useState([])
  const [triggerTypes, setTriggerTypes] = useState([])
  const [loading, setLoading] = useState(true)

  // User selections
  const [intensity, setIntensity] = useState(null)
  const [selectedTriggers, setSelectedTriggers] = useState([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Load tracker, past notes, triggers
  useEffect(() => {
    async function load() {
      try {
        const { data: trackerData, error: tErr } = await supabase
          .from('trackers')
          .select('*, addiction_types(name, icon)')
          .eq('id', trackerId)
          .single()
        if (tErr) throw tErr
        setTracker(trackerData)

        // Load past slip notes for this tracker (most recent 3)
        const { data: notesData } = await supabase
          .from('streak_history')
          .select('reset_note, ended_at, duration_seconds')
          .eq('tracker_id', trackerId)
          .not('reset_note', 'is', null)
          .order('ended_at', { ascending: false })
          .limit(3)
        setPastNotes(notesData || [])

        // Load triggers
        const { data: triggersData } = await supabase
          .from('trigger_types')
          .select('*')
          .order('id')
        setTriggerTypes(triggersData || [])
      } catch (err) {
        navigate('/home')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [trackerId])

  const toggleTrigger = (id) => {
    if (selectedTriggers.includes(id)) {
      setSelectedTriggers(selectedTriggers.filter(t => t !== id))
    } else {
      setSelectedTriggers([...selectedTriggers, id])
    }
  }

  const goNext = () => {
    // Step 1 (wave) → step 2 if past notes exist, else step 3
    if (step === 1) {
      if (pastNotes.length > 0) setStep(2)
      else setStep(3)
      return
    }
    // Step 2 (past notes) → step 3
    if (step === 2) { setStep(3); return }
    // Step 3 (intensity) → step 4 (need intensity selected)
    if (step === 3) {
      if (!intensity) return
      setStep(4); return
    }
    // Step 4 (triggers) → step 5
    if (step === 4) { setStep(5); return }
  }

  const goBack = () => {
    if (step === 1) { navigate('/home'); return }
    if (step === 3 && pastNotes.length === 0) { setStep(1); return }
    setStep(step - 1)
  }

  const saveAndFinish = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const triggerNames = triggerTypes
        .filter(t => selectedTriggers.includes(t.id))
        .map(t => t.name)

      await supabase.from('urge_logs').insert({
        user_id: user.id,
        tracker_id: trackerId,
        intensity,
        triggers: triggerNames,
        notes: notes || null,
        resisted: true,
      })
      setStep(6) // closing message
    } catch (err) {
      alert('Could not save: ' + err.message)
      setSaving(false)
    }
  }

  const formatDateAgo = (dateStr) => {
    const date = new Date(dateStr)
    const days = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days} days ago`
    if (days < 365) return `${Math.floor(days/30)} months ago`
    return `${Math.floor(days/365)} years ago`
  }

  if (loading || !tracker) {
    return (
      <div style={styles.frame}>
        <div style={{...styles.card, textAlign: 'center', color: '#9C8C78'}}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={styles.card}>

        {/* STEP 1 — WAVE METAPHOR */}
        {step === 1 && (
          <div style={styles.waveScreen}>
            <h2 style={styles.poeticTitle}>
              Urges are like waves.
            </h2>
            <p style={styles.poeticBody}>
              They rise.<br/>
              They peak.<br/>
              And eventually,<br/>
              they subside.
            </p>
            
            {/* Watercolor sunrise SVG */}
            <svg viewBox="0 0 360 180" style={styles.sunrise}>
              <defs>
                <radialGradient id="sun" cx="50%" cy="100%" r="60%">
                  <stop offset="0%" stopColor="#F4DDB8" stopOpacity="0.95"/>
                  <stop offset="50%" stopColor="#E8C397" stopOpacity="0.5"/>
                  <stop offset="100%" stopColor="#E8C397" stopOpacity="0"/>
                </radialGradient>
                <linearGradient id="hill1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#C5572C" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#8E3A18" stopOpacity="0.55"/>
                </linearGradient>
                <linearGradient id="hill2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6B5C4A" stopOpacity="0.35"/>
                  <stop offset="100%" stopColor="#3A2A1C" stopOpacity="0.5"/>
                </linearGradient>
                <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#FAEEDA" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#F4DDB8" stopOpacity="0.3"/>
                </linearGradient>
              </defs>
              {/* Sky */}
              <rect width="360" height="180" fill="url(#sky)"/>
              {/* Sun glow */}
              <circle cx="180" cy="180" r="120" fill="url(#sun)"/>
              {/* Sun disc */}
              <circle cx="180" cy="180" r="30" fill="#E8A064" opacity="0.85"/>
              {/* Distant hills */}
              <path d="M0,140 Q60,115 120,125 T240,118 T360,128 L360,180 L0,180 Z" fill="url(#hill2)"/>
              {/* Closer hills */}
              <path d="M0,155 Q80,135 160,148 T320,142 T360,150 L360,180 L0,180 Z" fill="url(#hill1)"/>
            </svg>

            <button onClick={goNext} style={{...styles.btn, ...styles.btnPrimary, width: '100%'}}>
              Next
            </button>
          </div>
        )}

        {/* STEP 2 — PAST REFLECTIONS */}
        {step === 2 && (
          <>
            <div style={styles.iconCircleSmall}>
              <span style={{fontSize: '20px'}}>📜</span>
            </div>
            <h2 style={styles.title}>Your past self left you something.</h2>
            <p style={styles.body}>
              Here's what you wrote during previous slips. Read gently — patterns hide here.
            </p>
            <div style={styles.notesList}>
              {pastNotes.map((n, idx) => (
                <div key={idx} style={styles.noteCard}>
                  <p style={styles.noteDate}>{formatDateAgo(n.ended_at)}</p>
                  <p style={styles.noteText}>"{n.reset_note}"</p>
                </div>
              ))}
            </div>
            <div style={styles.actions}>
              <button onClick={goBack} style={{...styles.btn, ...styles.btnSecondary}}>Back</button>
              <button onClick={goNext} style={{...styles.btn, ...styles.btnPrimary}}>Continue</button>
            </div>
          </>
        )}

        {/* STEP 3 — INTENSITY */}
        {step === 3 && (
          <>
            <h2 style={styles.title}>How strong is the urge?</h2>
            <p style={styles.body}>Be honest. Naming it gives you power over it.</p>
            <div style={styles.intensityGrid}>
              {[
                { key: 'Mild', emoji: '😌', desc: 'Background hum' },
                { key: 'Moderate', emoji: '😟', desc: 'Hard to ignore' },
                { key: 'Strong', emoji: '😣', desc: 'Loud and demanding' },
              ].map(i => (
                <button
                  key={i.key}
                  onClick={() => setIntensity(i.key)}
                  style={{
                    ...styles.intensityBtn,
                    ...(intensity === i.key ? styles.intensitySelected : {})
                  }}
                >
                  <div style={styles.intensityEmoji}>{i.emoji}</div>
                  <p style={{...styles.intensityLabel, ...(intensity === i.key ? styles.intensityLabelActive : {})}}>{i.key}</p>
                  <p style={{...styles.intensityDesc, ...(intensity === i.key ? styles.intensityDescActive : {})}}>{i.desc}</p>
                </button>
              ))}
            </div>
            <div style={styles.actions}>
              <button onClick={goBack} style={{...styles.btn, ...styles.btnSecondary}}>Back</button>
              <button 
                onClick={goNext} 
                disabled={!intensity}
                style={{
                  ...styles.btn, ...styles.btnPrimary, 
                  ...(!intensity ? styles.btnDisabled : {})
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 4 — TRIGGERS */}
        {step === 4 && (
          <>
            <h2 style={styles.title}>What's happening right now?</h2>
            <p style={styles.body}>Pick everything that fits. There's no wrong answer.</p>
            <div style={styles.triggerGrid}>
              {triggerTypes.map(tr => (
                <button
                  key={tr.id}
                  onClick={() => toggleTrigger(tr.id)}
                  style={{
                    ...styles.triggerChip,
                    ...(selectedTriggers.includes(tr.id) ? styles.triggerSelected : {})
                  }}
                >
                  {tr.name}
                </button>
              ))}
            </div>
            <div style={styles.actions}>
              <button onClick={goBack} style={{...styles.btn, ...styles.btnSecondary}}>Back</button>
              <button onClick={goNext} style={{...styles.btn, ...styles.btnPrimary}}>Next</button>
            </div>
          </>
        )}

        {/* STEP 5 — NOTES */}
        {step === 5 && (
          <>
            <h2 style={styles.title}>Anything else on your mind?</h2>
            <p style={styles.body}>
              Optional. Sometimes writing it down is the resistance itself.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's the urge whispering? What's around you? What were you doing 10 minutes ago?"
              style={styles.textarea}
              maxLength={1000}
            />
            <p style={styles.charCount}>{notes.length}/1000</p>
            <div style={styles.actions}>
              <button onClick={goBack} disabled={saving} style={{...styles.btn, ...styles.btnSecondary}}>Back</button>
              <button 
                onClick={saveAndFinish} 
                disabled={saving}
                style={{...styles.btn, ...styles.btnPrimary, ...(saving ? styles.btnDisabled : {})}}
              >
                {saving ? '...' : 'Save'}
              </button>
            </div>
          </>
        )}

        {/* STEP 6 — CLOSING */}
        {step === 6 && (
          <div style={{textAlign: 'center'}}>
            <div style={styles.bigIcon}>🌊</div>
            <h2 style={styles.bigTitle}>You felt it. You logged it.</h2>
            <p style={{...styles.body, fontSize: '15px'}}>
              That's strength. The urge will pass.<br/>
              You stayed. Your streak stayed.
            </p>
            <button 
              onClick={() => navigate('/home')}
              style={{...styles.btn, ...styles.btnPrimary, width: '100%', marginTop: '1.5rem'}}
            >
              Back home
            </button>
          </div>
        )}

      </div>
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
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: '#FAF7F1',
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '2.25rem 1.75rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  waveScreen: { textAlign: 'center' },
  poeticTitle: {
    fontSize: '26px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 1.5rem', fontFamily: 'Georgia, serif', lineHeight: 1.3,
  },
  poeticBody: {
    fontSize: '17px', color: '#6B5C4A',
    margin: '0 0 2rem', lineHeight: 1.7,
    fontFamily: 'Georgia, serif',
  },
  sunrise: {
    width: '100%',
    height: 'auto',
    borderRadius: '14px',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 16px rgba(80,50,20,0.08)',
  },
  iconCircleSmall: {
    width: '52px', height: '52px',
    margin: '0 auto 1rem',
    borderRadius: '50%',
    background: '#F4ECDD',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: '20px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 0.5rem', fontFamily: 'Georgia, serif', textAlign: 'center',
    lineHeight: 1.3,
  },
  bigTitle: {
    fontSize: '24px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 0.75rem', fontFamily: 'Georgia, serif', lineHeight: 1.3,
  },
  body: {
    fontSize: '13px', color: '#6B5C4A',
    margin: '0 0 1.25rem', lineHeight: 1.6,
    fontFamily: 'Georgia, serif', textAlign: 'center',
  },
  notesList: {
    display: 'flex', flexDirection: 'column', gap: '10px',
    marginBottom: '1.25rem',
  },
  noteCard: {
    background: '#F4ECDD',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '0.5px solid #E8DCC2',
  },
  noteDate: {
    fontSize: '10px', color: '#9C8C78',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    margin: '0 0 4px',
  },
  noteText: {
    fontSize: '13px', color: '#2A1F15',
    lineHeight: 1.5, margin: 0,
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
  },
  intensityGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px', marginBottom: '1.25rem',
  },
  intensityBtn: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '16px 8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'center',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  intensitySelected: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    border: '0.5px solid #241710',
    boxShadow: '0 4px 12px rgba(40,25,10,0.25)',
  },
  intensityEmoji: { fontSize: '28px', marginBottom: '6px' },
  intensityLabel: {
    fontSize: '13px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 2px',
  },
  intensityLabelActive: { color: '#FAF7F1' },
  intensityDesc: {
    fontSize: '10px', color: '#9C8C78',
    margin: 0, lineHeight: 1.3,
  },
  intensityDescActive: { color: '#E8DCC2' },
  triggerGrid: {
    display: 'flex', flexWrap: 'wrap', gap: '6px',
    marginBottom: '1.25rem',
  },
  triggerChip: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '999px',
    padding: '8px 14px',
    fontSize: '12px',
    color: '#2A1F15',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 500,
  },
  triggerSelected: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: '0.5px solid #241710',
  },
  textarea: {
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
    minHeight: '120px',
    resize: 'vertical',
    marginBottom: '4px',
    lineHeight: 1.5,
  },
  charCount: {
    fontSize: '11px', color: '#9C8C78',
    textAlign: 'right', margin: '0 0 1rem',
  },
  bigIcon: { fontSize: '52px', marginBottom: '1rem' },
  actions: { display: 'flex', gap: '8px', marginTop: '0.5rem' },
  btn: {
    padding: '14px',
    borderRadius: '12px',
    fontSize: '13px',
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
    boxShadow: '0 3px 10px rgba(80,50,20,0.06)',
  },
  btnDisabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
}