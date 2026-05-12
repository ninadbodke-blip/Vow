import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../supabaseClient'

export default function ThreeDoorsNotice({ data, onSave, onComplete, saving: parentSaving }) {
  const navigate = useNavigate()
  const handleFinalize = onSave || onComplete

  const { landingPrompt, landingOptions, doors } = data

  // Phases: 'summary' -> 'landing' -> 'fork' -> 'confirm'
  const [phase, setPhase] = useState('summary')

  const [landingTap, setLandingTap] = useState(null)
  const [selectedDoor, setSelectedDoor] = useState(null)
  const [saving, setSaving] = useState(false)

  // Days 1-4 summary data
  const [day1Data, setDay1Data] = useState(null)
  const [day2Data, setDay2Data] = useState(null)
  const [day3Data, setDay3Data] = useState(null)
  const [day4Data, setDay4Data] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: artifacts } = await supabase
        .from('vow_artifacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('stage', 'notice')
        .in('day_number', [1, 2, 3, 4])

      if (artifacts) {
        const d1 = artifacts.find(a => a.day_number === 1)
        const d2 = artifacts.find(a => a.day_number === 2)
        const d3 = artifacts.find(a => a.day_number === 3)
        const d4 = artifacts.find(a => a.day_number === 4)
        setDay1Data(d1?.content || null)
        setDay2Data(d2?.content || null)
        setDay3Data(d3?.content || null)
        setDay4Data(d4?.content || null)
      }
    }
    load()
  }, [])

  const selectDoor = (doorId) => {
    setSelectedDoor(doorId)
    setPhase('confirm')
  }

  const confirmDoor = async () => {
    if (saving) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }

    try {
      // Write notice_decisions row
      await supabase.from('notice_decisions').upsert({
        user_id: user.id,
        decision: selectedDoor,
        letter_landing_tap: landingTap,
      }, { onConflict: 'user_id' })

      // Update vow_path_progress based on door
      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('completed_stages')
        .eq('user_id', user.id)
        .maybeSingle()

      const completed = progressRow?.completed_stages || []
      completed.push({
        stage: 'notice',
        completed_at: new Date().toISOString(),
        decision: selectedDoor,
      })

      let progressUpdate = { completed_stages: completed }

      if (selectedDoor === 'reflect') {
        progressUpdate.current_stage = 'reflect'
        progressUpdate.current_day = 1
        progressUpdate.last_completed_day = 0
        progressUpdate.stage_started_at = new Date().toISOString()
        progressUpdate.vow_path_status = 'active'
      } else if (selectedDoor === 'wait_30_days') {
        const nextEligible = new Date()
        nextEligible.setDate(nextEligible.getDate() + 30)
        progressUpdate.vow_path_status = 'paused_30_days'
        progressUpdate.next_eligible_at = nextEligible.toISOString()
      } else if (selectedDoor === 'not_for_me') {
        progressUpdate.vow_path_status = 'closed_permanent'
        progressUpdate.closed_at = new Date().toISOString()
      }

      await supabase.from('vow_path_progress')
        .update(progressUpdate)
        .eq('user_id', user.id)

      // Save Day 5 artifact
      handleFinalize({
        landing_tap: landingTap,
        door_selected: selectedDoor,
        selected_at: new Date().toISOString(),
      })

      setTimeout(() => {
        if (selectedDoor === 'reflect') {
          navigate('/vow-path/reflect/day/1')
        } else {
          navigate('/home')
        }
      }, 200)
    } catch (err) {
      console.error('Error saving door selection:', err)
      setSaving(false)
    }
  }

  const cancelDoor = () => {
    setSelectedDoor(null)
    setPhase('fork')
  }

  // ===================================================================
  // PHASE: SUMMARY — the four days
  // ===================================================================
  if (phase === 'summary') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>The four days.</h2>
        <p style={styles.subtext}>A brief look at what you've seen.</p>

        <div style={styles.summaryList}>
          <div style={styles.summaryCard}>
            <p style={styles.summaryDay}>Day 1 — Lines crossed</p>
            <p style={styles.summaryBody}>
              You named {(day1Data?.lines_identified?.length || 0) + (day1Data?.custom_lines?.length || 0)} lines.
              You've crossed {day1Data?.crossed_count || 0} of them.
            </p>
          </div>

          <div style={styles.summaryCard}>
            <p style={styles.summaryDay}>Day 2 — The trajectory</p>
            <p style={styles.summaryBody}>
              Direction: {day2Data?.trajectory_shape?.replace(/_/g, ' ') || 'unknown'}.
            </p>
          </div>

          <div style={styles.summaryCard}>
            <p style={styles.summaryDay}>Day 3 — The relationships</p>
            <p style={styles.summaryBody}>
              You named {day3Data?.people?.length || 0} people closest to you.
              {day3Data?.aggregated_patterns?.stopped_bringing_up_count > 0 && (
                <> {day3Data.aggregated_patterns.stopped_bringing_up_count} of them have stopped bringing up your use, or never started.</>
              )}
            </p>
          </div>

          <div style={styles.summaryCard}>
            <p style={styles.summaryDay}>Day 4 — The ledger</p>
            <p style={styles.summaryBody}>
              You named {day4Data?.total_count || 0} things you've given up.
              {day4Data?.categories_touched?.length > 0 && (
                <> Across {day4Data.categories_touched.length} {day4Data.categories_touched.length === 1 ? 'area' : 'areas'} of life.</>
              )}
            </p>
          </div>
        </div>

        <p style={styles.summaryNote}>
          This is what's now visible.
        </p>

        <div style={styles.footer}>
          <button onClick={() => setPhase('landing')} style={styles.primaryBtn}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: LANDING — single tap
  // ===================================================================
  if (phase === 'landing') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>{landingPrompt}</h2>

        <div style={styles.optionList}>
          {landingOptions.map(opt => {
            const selected = landingTap === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setLandingTap(opt.id)}
                style={{
                  ...styles.optionCard,
                  ...(selected ? styles.optionCardSelected : {}),
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <div style={styles.footer}>
          <button
            onClick={() => setPhase('fork')}
            disabled={!landingTap}
            style={{
              ...styles.primaryBtn,
              ...(landingTap ? {} : styles.primaryBtnDisabled),
            }}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: FORK — three doors
  // ===================================================================
  if (phase === 'fork') {
    return (
      <div style={styles.container}>
        <h2 style={styles.prompt}>The fork.</h2>
        <p style={styles.subtext}>Three doors. Each is fully respected. There is no right one.</p>

        <div style={styles.doorList}>
          {doors.map(door => (
            <button
              key={door.id}
              onClick={() => selectDoor(door.id)}
              style={styles.doorCard}
            >
              <p style={styles.doorNum}>Door {door.number}</p>
              <p style={styles.doorTitle}>{door.title}</p>
              <p style={styles.doorDescription}>{door.description}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ===================================================================
  // PHASE: CONFIRM
  // ===================================================================
  const door = doors.find(d => d.id === selectedDoor)
  if (!door) return null

  return (
    <div style={styles.container}>
      <h2 style={styles.confirmTitle}>{door.confirmTitle}</h2>
      <p style={styles.confirmBody}>{door.confirmBody}</p>

      <div style={styles.footer}>
        <button
          onClick={confirmDoor}
          disabled={saving}
          style={{
            ...styles.primaryBtn,
            ...(saving ? styles.primaryBtnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : door.confirmButton}
        </button>
        <button
          onClick={cancelDoor}
          disabled={saving}
          style={styles.secondaryBtn}
        >
          Go back
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { paddingTop: '0.5rem' },
  prompt: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 0.5rem',
  },
  subtext: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.55, margin: '0 0 1.25rem',
  },
  optionList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  optionCard: {
    padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    fontSize: '14px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer', textAlign: 'left',
    lineHeight: 1.4,
    transition: 'all 0.15s',
  },
  optionCardSelected: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 2px 8px rgba(197,87,44,0.12)',
  },
  summaryList: {
    display: 'flex', flexDirection: 'column', gap: '10px',
    marginBottom: '1rem',
  },
  summaryCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '12px 14px',
  },
  summaryDay: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.12em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 6px',
  },
  summaryBody: {
    fontSize: '13.5px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0, lineHeight: 1.5,
  },
  summaryNote: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.6, textAlign: 'center',
    margin: '0 0 1rem',
  },
  doorList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  doorCard: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '16px',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  doorNum: {
    fontSize: '11px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.12em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 6px',
  },
  doorTitle: {
    fontSize: '16px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    margin: '0 0 8px', lineHeight: 1.4,
  },
  doorDescription: {
    fontSize: '12.5px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.5, margin: 0,
  },
  confirmTitle: {
    fontSize: '24px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    margin: '0 0 1rem', textAlign: 'center',
  },
  confirmBody: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.65, textAlign: 'center',
    margin: '0 0 1.5rem',
  },
  footer: {
    marginTop: '1.5rem',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  primaryBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: {
    opacity: 0.4, cursor: 'not-allowed',
    boxShadow: 'none',
  },
  secondaryBtn: {
    width: '100%', padding: '12px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
  },
}