import { useState, useEffect } from 'react'

const SLIDER_STYLE_ID = 'vow-slider-styles'
const SLIDER_CSS = `
  .vow-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    background: linear-gradient(180deg, #EFE7D7 0%, #E5DCC8 100%);
    border-radius: 999px;
    outline: none;
    cursor: pointer;
  }
  .vow-slider::-webkit-slider-runnable-track {
    height: 6px;
    background: transparent;
    border-radius: 999px;
  }
  .vow-slider::-moz-range-track {
    height: 6px;
    background: linear-gradient(180deg, #EFE7D7 0%, #E5DCC8 100%);
    border-radius: 999px;
  }
  .vow-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(180deg, #E5C18A 0%, #B89567 100%);
    border: 2px solid #FAF7F1;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(40,25,10,0.25);
    margin-top: -8px;
  }
  .vow-slider::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(180deg, #E5C18A 0%, #B89567 100%);
    border: 2px solid #FAF7F1;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(40,25,10,0.25);
  }
  .vow-slider:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px rgba(217,181,122,0.25), 0 2px 6px rgba(40,25,10,0.25);
  }
  .vow-slider:focus::-moz-range-thumb {
    box-shadow: 0 0 0 4px rgba(217,181,122,0.25), 0 2px 6px rgba(40,25,10,0.25);
  }
`

function ensureSliderStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(SLIDER_STYLE_ID)) return
  const el = document.createElement('style')
  el.id = SLIDER_STYLE_ID
  el.innerHTML = SLIDER_CSS
  document.head.appendChild(el)
}

export default function TimeMoneyCalculator({ substance, existingData, onSave, saving }) {
  useEffect(() => { ensureSliderStyles() }, [])
  // Time fields (hours per week)
  const [usingTime, setUsingTime] = useState(5)
  const [prepTime, setPrepTime] = useState(1)
  const [recoveryTime, setRecoveryTime] = useState(2)
  const [thinkingTime, setThinkingTime] = useState(2)

  // Money field (rupees per week)
  const [moneyPerWeek, setMoneyPerWeek] = useState(1000)

  // Years
  const [yearsOnThis, setYearsOnThis] = useState(3)

  const [step, setStep] = useState(0) // 0: time, 1: money, 2: result

  useEffect(() => {
    if (existingData) {
      setUsingTime(existingData.using_time_per_week ?? 5)
      setPrepTime(existingData.prep_time_per_week ?? 1)
      setRecoveryTime(existingData.recovery_time_per_week ?? 2)
      setThinkingTime(existingData.thinking_time_per_week ?? 2)
      setMoneyPerWeek(existingData.money_per_week ?? 1000)
      setYearsOnThis(existingData.years_on_this ?? 3)
    }
  }, [existingData])

  const totalHoursPerWeek = usingTime + prepTime + recoveryTime + thinkingTime
  const hoursPerYear = totalHoursPerWeek * 52
  const lifetimeHours = Math.round(hoursPerYear * yearsOnThis)
  const lifetimeDays = Math.round(lifetimeHours / 24)
  const lifetimeMonths = (lifetimeDays / 30).toFixed(1)

  const moneyPerYear = moneyPerWeek * 52
  const lifetimeMoney = moneyPerYear * yearsOnThis

  const formatIndianCurrency = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} crore`
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} lakh`
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)},000`
    return `₹${num}`
  }

  const handleFinalSave = () => {
    onSave({
      using_time_per_week: usingTime,
      prep_time_per_week: prepTime,
      recovery_time_per_week: recoveryTime,
      thinking_time_per_week: thinkingTime,
      money_per_week: moneyPerWeek,
      years_on_this: yearsOnThis,
      computed_lifetime_hours: lifetimeHours,
      computed_lifetime_months: parseFloat(lifetimeMonths),
      computed_lifetime_money: lifetimeMoney,
    })
  }

  // ---- Step 0: Time sliders ----
  if (step === 0) {
    return (
      <div>
        <h2 style={styles.header}>The time, honestly.</h2>
        <p style={styles.subtext}>
          Four sliders. Hours per week. Average across recent months.
        </p>

        <SliderField
          label="Using time"
          sublabel="The act itself"
          value={usingTime}
          onChange={setUsingTime}
          min={0} max={50} step={1}
          unit="hours/week"
        />
        <SliderField
          label="Preparation time"
          sublabel="Getting it, planning, anticipating"
          value={prepTime}
          onChange={setPrepTime}
          min={0} max={20} step={1}
          unit="hours/week"
        />
        <SliderField
          label="Recovery time"
          sublabel="The morning after, the slow start, the dragging"
          value={recoveryTime}
          onChange={setRecoveryTime}
          min={0} max={30} step={1}
          unit="hours/week"
        />
        <SliderField
          label="Thinking-about-it time"
          sublabel="The mental occupation, the planning when you should be focused elsewhere"
          value={thinkingTime}
          onChange={setThinkingTime}
          min={0} max={20} step={1}
          unit="hours/week"
        />

        <div style={styles.runningTotal}>
          Total: <strong>{totalHoursPerWeek}</strong> hours per week
        </div>

        <button onClick={() => setStep(1)} style={styles.primaryBtn}>
          Continue to money
        </button>
      </div>
    )
  }

  // ---- Step 1: Money ----
  if (step === 1) {
    return (
      <div>
        <h2 style={styles.header}>The money, honestly.</h2>
        <p style={styles.subtext}>
          What does this cost you per week, in total? Include the substance itself, related purchases, anything tied to using.
        </p>

        <div style={styles.moneyDisplay}>
          <span style={styles.rupeeSymbol}>{'\u20b9'}</span>
          <input
            type="number"
            inputMode="numeric"
            value={moneyPerWeek === 0 ? '' : moneyPerWeek}
            onChange={(e) => {
              const v = e.target.value
              if (v === '') { setMoneyPerWeek(0); return }
              const n = parseInt(v, 10)
              if (!isNaN(n) && n >= 0) setMoneyPerWeek(n)
            }}
            placeholder="0"
            style={styles.moneyInput}
            min={0}
            max={100000}
          />
          <span style={styles.moneyPer}>per week</span>
        </div>

        <p style={styles.moneyHint}>
          {`Round up if you're not sure.`}
        </p>

        <div style={styles.yearsSection}>
          <p style={styles.yearsLabel}>How many years has this been the pattern?</p>
          <SliderField
            label=""
            sublabel=""
            value={yearsOnThis}
            onChange={setYearsOnThis}
            min={1} max={30} step={1}
            unit={yearsOnThis === 1 ? 'year' : 'years'}
            hideLabel
          />
        </div>

        <div style={styles.btnRow}>
          <button onClick={() => setStep(0)} style={styles.secondaryBtn}>
            Back
          </button>
          <button onClick={() => setStep(2)} style={styles.primaryBtnFlex}>
            See the totals
          </button>
        </div>
      </div>
    )
  }

  // ---- Step 2: Result ----
  if (step === 2) {
    return (
      <div>
        <h2 style={styles.header}>What it takes.</h2>

        <div style={styles.resultCard}>
          <p style={styles.resultLabel}>Time, computed across {yearsOnThis} {yearsOnThis === 1 ? 'year' : 'years'}</p>
          <p style={styles.resultBig}>{lifetimeHours.toLocaleString()} <span style={styles.resultUnit}>hours</span></p>
          <p style={styles.resultSub}>{`That's ${lifetimeDays} days. About ${lifetimeMonths} months of your life, awake and continuous.`}</p>
        </div>

        <div style={styles.resultCard}>
          <p style={styles.resultLabel}>Money, computed across {yearsOnThis} {yearsOnThis === 1 ? 'year' : 'years'}</p>
          <p style={styles.resultBig}>{formatIndianCurrency(lifetimeMoney)}</p>
          <p style={styles.resultSub}>{`That's ${formatIndianCurrency(moneyPerYear)} per year. ${formatIndianCurrency(moneyPerWeek * 4)} per month.`}</p>
        </div>

        <p style={styles.resultNote}>
          No commentary. The numbers are computed from your inputs.
        </p>

        <div style={styles.btnRow}>
          <button onClick={() => setStep(1)} style={styles.secondaryBtn}>
            Back
          </button>
          <button
            onClick={handleFinalSave}
            disabled={saving}
            style={{ ...styles.primaryBtnFlex, ...(saving ? styles.saveBtnDisabled : {}) }}
          >
            {saving ? 'Saving...' : 'Save & continue'}
          </button>
        </div>
      </div>
    )
  }

  return null
}

function SliderField({ label, sublabel, value, onChange, min, max, step, unit, hideLabel }) {
  return (
    <div style={fieldStyles.field}>
      {!hideLabel && (
        <>
          <div style={fieldStyles.labelRow}>
            <span style={fieldStyles.label}>{label}</span>
            <span style={fieldStyles.value}>{value} {unit}</span>
          </div>
          {sublabel && <p style={fieldStyles.sublabel}>{sublabel}</p>}
        </>
      )}
      {hideLabel && (
        <div style={fieldStyles.labelRowCentered}>
          <span style={fieldStyles.valueBig}>{value}</span>
          <span style={fieldStyles.unitText}>{unit}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="vow-slider"
        style={fieldStyles.slider}
      />
    </div>
  )
}

const fieldStyles = {
  field: {
    marginBottom: '1.25rem',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '4px',
  },
  labelRowCentered: {
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  label: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
  },
  value: {
    fontSize: '14px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontVariantNumeric: 'tabular-nums',
  },
  valueBig: {
    fontSize: '40px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  unitText: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    marginLeft: '8px',
  },
  sublabel: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 6px',
  },
  slider: {
    width: '100%',
    appearance: 'none',
    height: '5px',
    background: '#EFE7D7',
    borderRadius: '999px',
    outline: 'none',
  },
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
  runningTotal: {
    fontSize: '14px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '0.75rem',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '10px',
    marginBottom: '1.25rem',
  },
  moneyDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '0.5rem',
  },
  rupeeSymbol: {
    fontSize: '32px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
  },
  moneyInput: {
    fontSize: '44px',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    color: '#2A1F15',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #DDCFB6',
    width: '180px',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
    outline: 'none',
    padding: '4px 0',
  },
  moneyPer: {
    fontSize: '14px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  moneyHint: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0 0 2rem',
  },
  yearsSection: {
    marginBottom: '1.5rem',
  },
  yearsLabel: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  resultCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '18px',
    padding: '1.5rem 1.25rem',
    marginBottom: '1rem',
    boxShadow: '0 4px 14px rgba(80,50,20,0.05)',
  },
  resultLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontWeight: 500,
    margin: '0 0 0.5rem',
  },
  resultBig: {
    fontSize: '32px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.5rem',
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  resultUnit: {
    fontSize: '15px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontWeight: 400,
    marginLeft: '6px',
  },
  resultSub: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.5,
    margin: 0,
  },
  resultNote: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0 0 1.5rem',
  },
  btnRow: {
    display: 'flex',
    gap: '10px',
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
  primaryBtnFlex: {
    flex: 2,
    padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  secondaryBtn: {
    flex: 1,
    padding: '16px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  saveBtnDisabled: {
    background: '#C9B894',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}