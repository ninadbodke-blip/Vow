import { useState, useEffect } from 'react'
import { getSubstance, buildCustomSubstance } from '../data/substances'

const DURATION_BANDS = [
  { id: 'less_than_6_months', label: 'Less than 6 months' },
  { id: '6_to_12_months', label: '6 months to a year' },
  { id: '1_to_3_years', label: '1 to 3 years' },
  { id: '3_to_5_years', label: '3 to 5 years' },
  { id: '5_to_10_years', label: '5 to 10 years' },
  { id: 'more_than_10_years', label: 'More than 10 years' },
]

const DURATION_TO_DAYS = {
  less_than_6_months: 90,
  '6_to_12_months': 270,
  '1_to_3_years': 730,
  '3_to_5_years': 1460,
  '5_to_10_years': 2740,
  more_than_10_years: 4380,
}

export default function LandscapeBuilder({ substance, existingData, onSave, saving }) {
  const [step, setStep] = useState(0) // 0: frequency, 1: amount, 2: duration, 3: result
  const [daysPerWeek, setDaysPerWeek] = useState(3)
  const [amountPerSession, setAmountPerSession] = useState(2)
  const [duration, setDuration] = useState(null)

  // Get substance metadata for unit display
  const substanceMeta = substance.primary && substance.primary !== 'custom'
    ? (getSubstance(substance.primary) || buildCustomSubstance(substance.primary))
    : { actionVerb: 'use', unit: 'times', unitMax: 15 }

  useEffect(() => {
    if (existingData) {
      setDaysPerWeek(existingData.days_per_week ?? 3)
      setAmountPerSession(existingData.amount_per_session ?? 2)
      setDuration(existingData.duration_band ?? null)
    }
  }, [existingData])

  const handleFinalSave = () => {
    if (!duration) return
    const lifetimeDays = DURATION_TO_DAYS[duration]
    const lifetimeEstimate = Math.round(
      (daysPerWeek / 7) * lifetimeDays * amountPerSession
    )
    onSave({
      days_per_week: daysPerWeek,
      amount_per_session: amountPerSession,
      amount_unit: substanceMeta.unit,
      duration_band: duration,
      computed_lifetime_estimate: lifetimeEstimate,
    })
  }

  // ---- Step 0: Frequency ----
  if (step === 0) {
    return (
      <div>
        <h2 style={styles.header}>How many days a week?</h2>
        <p style={styles.subtext}>Your honest average over the last 3 months.</p>

        <div style={styles.sliderDisplay}>
          <span style={styles.sliderValue}>{daysPerWeek}</span>
          <span style={styles.sliderUnit}>{daysPerWeek === 1 ? 'day' : 'days'} a week</span>
        </div>

        <input
          type="range"
          min={0}
          max={7}
          step={1}
          value={daysPerWeek}
          onChange={e => setDaysPerWeek(parseInt(e.target.value, 10))}
          style={styles.slider}
        />
        <div style={styles.sliderAnchors}>
          <span>0</span>
          <span>7</span>
        </div>

        <button onClick={() => setStep(1)} style={styles.primaryBtn}>Continue</button>
      </div>
    )
  }

  // ---- Step 1: Amount ----
  if (step === 1) {
    const amountStep = substanceMeta.unitStep || 1
    return (
      <div>
        <h2 style={styles.header}>On a typical day you {substanceMeta.actionVerb}, how much?</h2>
        <p style={styles.subtext}>The unit changes with what you're working on.</p>

        <div style={styles.sliderDisplay}>
          <span style={styles.sliderValue}>{amountPerSession}</span>
          <span style={styles.sliderUnit}>{substanceMeta.unit}</span>
        </div>

        <input
          type="range"
          min={0}
          max={substanceMeta.unitMax}
          step={amountStep}
          value={amountPerSession}
          onChange={e => setAmountPerSession(parseFloat(e.target.value))}
          style={styles.slider}
        />
        <div style={styles.sliderAnchors}>
          <span>0</span>
          <span>{substanceMeta.unitMax}</span>
        </div>

        <button onClick={() => setStep(2)} style={styles.primaryBtn}>Continue</button>
      </div>
    )
  }

  // ---- Step 2: Duration ----
  if (step === 2) {
    return (
      <div>
        <h2 style={styles.header}>How long has this been the pattern?</h2>

        <div style={styles.durationList}>
          {DURATION_BANDS.map(band => (
            <button
              key={band.id}
              onClick={() => setDuration(band.id)}
              style={{
                ...styles.durationBtn,
                ...(duration === band.id ? styles.durationBtnSelected : {}),
              }}
            >
              {band.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setStep(3)}
          disabled={!duration}
          style={{
            ...styles.primaryBtn,
            ...(!duration ? styles.primaryBtnDisabled : {}),
          }}
        >
          Continue
        </button>
      </div>
    )
  }

  // ---- Step 3: Result reveal ----
  if (step === 3) {
    const lifetimeDays = DURATION_TO_DAYS[duration]
    const lifetimeEstimate = Math.round(
      (daysPerWeek / 7) * lifetimeDays * amountPerSession
    )
    const durationLabel = DURATION_BANDS.find(b => b.id === duration)?.label?.toLowerCase()

    return (
      <div>
        <h2 style={styles.header}>Your landscape.</h2>

        <div style={styles.resultCard}>
          <p style={styles.resultLine}>
            <strong style={styles.resultEmphasis}>{substance.label}</strong>
          </p>
          <p style={styles.resultLine}>
            {daysPerWeek} {daysPerWeek === 1 ? 'day' : 'days'} a week
          </p>
          <p style={styles.resultLine}>
            {amountPerSession} {substanceMeta.unit} per session
          </p>
          <div style={styles.resultDivider}></div>
          <p style={styles.resultLine}>
            This pattern has been with you for {durationLabel}.
          </p>
          <p style={styles.resultLine}>
            Approximately <strong>{lifetimeEstimate.toLocaleString()}</strong> {substanceMeta.unit} over that time.
          </p>
        </div>

        <p style={styles.resultNote}>No judgment. Just the picture.</p>

        <button
          onClick={handleFinalSave}
          disabled={saving}
          style={{
            ...styles.primaryBtn,
            ...(saving ? styles.primaryBtnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Save & continue'}
        </button>
      </div>
    )
  }

  return null
}

const styles = {
  header: {
    fontSize: '22px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 0.75rem',
  },
  subtext: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1.5rem',
  },
  sliderDisplay: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  sliderValue: {
    fontSize: '56px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontVariantNumeric: 'tabular-nums',
    display: 'block',
    lineHeight: 1,
  },
  sliderUnit: {
    fontSize: '13px', color: '#854F0B',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    display: 'inline-block',
    marginTop: '0.5rem',
  },
  slider: {
    width: '100%',
    appearance: 'none',
    height: '6px',
    background: '#EFE7D7',
    borderRadius: '999px',
    outline: 'none',
    margin: '0.5rem 0',
  },
  sliderAnchors: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'inherit',
    marginBottom: '1.5rem',
  },
  durationList: {
    display: 'flex', flexDirection: 'column',
    gap: '8px',
    marginBottom: '1.5rem',
  },
  durationBtn: {
    width: '100%',
    padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  durationBtnSelected: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '1px solid #C5572C',
    boxShadow: '0 4px 12px rgba(197,87,44,0.15)',
  },
  resultCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '20px',
    padding: '1.75rem 1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
  },
  resultLine: {
    fontSize: '16px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.65rem',
    lineHeight: 1.5,
  },
  resultEmphasis: {
    color: '#854F0B',
    fontStyle: 'italic',
    textTransform: 'capitalize',
  },
  resultDivider: {
    height: '0.5px',
    background: '#E8DFD0',
    margin: '0.85rem 0',
  },
  resultNote: {
    fontSize: '12px', color: '#9C8C78',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
    margin: '0 0 1.5rem',
  },
  primaryBtn: {
    width: '100%', padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  primaryBtnDisabled: {
    background: '#C9B894',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}