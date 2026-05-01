import { useState, useEffect } from 'react'

// Calculated ONCE when the page loads, so the counter actually progresses
const FIXED_START_DATE = new Date(Date.now() - (379 * 24 * 60 * 60 * 1000) - (6 * 60 * 60 * 1000) - (22 * 60 * 1000) - (47 * 1000))

function App() {
  const [tickCount, setTickCount] = useState(0)

  const tracker = {
    name: 'Cigarettes',
    icon: '🚬',
    moneyPerDay: 150,
    longestStreakDays: 379,
  }

  useEffect(() => {
    const id = setInterval(() => {
      setTickCount(c => c + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Calculate elapsed using current time at each render
  const now = new Date()
  let total = Math.floor((now - FIXED_START_DATE) / 1000)
  const secs = total % 60; total = Math.floor(total / 60)
  const mins = total % 60; total = Math.floor(total / 60)
  const hours = total % 24; total = Math.floor(total / 24)
  const totalDays = total
  const years = Math.floor(totalDays / 365)
  const remainingAfterYears = totalDays - (years * 365)
  const months = Math.floor(remainingAfterYears / 30)
  const days = remainingAfterYears - (months * 30)

  const totalDaysClean = Math.floor((now - FIXED_START_DATE) / (1000 * 60 * 60 * 24))
  const moneySaved = (totalDaysClean * tracker.moneyPerDay).toLocaleString('en-IN')
  const startDateStr = FIXED_START_DATE.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.brand}>
          <p style={styles.logo}>Vow</p>
          <p style={styles.tag}>Keep the vow.</p>
        </div>

        <div style={styles.trackerCard}>
          <div style={styles.addictionRow}>
            <div style={styles.addictionIcon}>{tracker.icon}</div>
            <div>
              <p style={styles.addictionName}>{tracker.name}</p>
              <p style={styles.addictionSince}>Since {startDateStr}</p>
            </div>
          </div>

          <p style={styles.stayedLine}>
            You've stayed <b style={styles.bold}>{tracker.name}</b> free for
          </p>

          <div style={styles.gridA}>
            <Cell n={years} u="year" />
            <Cell n={months} u="months" />
            <Cell n={days} u="days" />
            <div style={styles.row2}>
              <Cell n={pad(hours)} u="hours" />
              <Cell n={pad(mins)} u="mins" />
              <Cell n={pad(secs)} u="secs" accent />
            </div>
          </div>

          <div style={styles.savingsStack}>
            <div style={styles.savingsRow}>
              <span style={styles.savingsLabel}>Money saved</span>
              <span style={styles.savingsValue}>₹{moneySaved}</span>
            </div>
            <div style={styles.savingsRow}>
              <span style={styles.savingsLabel}>Longest streak</span>
              <span style={styles.savingsValue}>{tracker.longestStreakDays} days</span>
            </div>
          </div>
        </div>

        <div style={styles.actions}>
          <button style={{...styles.btn, ...styles.btnUrge}}>Log urge</button>
          <button style={{...styles.btn, ...styles.btnSlip}}>I slipped</button>
        </div>

        <div style={styles.tabRow}>
          <div style={{...styles.tab, ...styles.tabActive}}>Home</div>
          <div style={styles.tab}>Journal</div>
          <div style={styles.tab}>Community</div>
          <div style={styles.tab}>Profile</div>
        </div>

      </div>
    </div>
  )
}

function Cell({ n, u, accent }) {
  return (
    <div style={styles.cellA}>
      <p style={{...styles.cellN, ...(accent ? styles.cellAccent : {})}}>{n}</p>
      <p style={styles.cellU}>{u}</p>
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
  phone: {
    background: '#FAF7F1',
    maxWidth: '420px',
    width: '100%',
    borderRadius: '28px',
    padding: '2rem 1.25rem 1.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  brand: { textAlign: 'center', marginBottom: '1.75rem' },
  logo: {
    fontSize: '32px', fontWeight: 500, color: '#2A1F15', margin: 0,
    letterSpacing: '-0.02em', fontFamily: 'Georgia, serif',
  },
  tag: {
    fontSize: '12px', color: '#8A7B6A', fontStyle: 'italic',
    margin: '4px 0 0', fontFamily: 'Georgia, serif',
  },
  trackerCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    borderRadius: '20px', padding: '1.5rem 1.25rem',
    border: '0.5px solid #E8DFD0',
    boxShadow: '0 6px 20px rgba(80,50,20,0.06), 0 1px 3px rgba(80,50,20,0.04)',
    marginBottom: '0.75rem',
  },
  addictionRow: {
    display: 'flex', alignItems: 'center', gap: '11px',
    marginBottom: '1.25rem', paddingBottom: '1.25rem',
    borderBottom: '0.5px solid #EFE7D7',
  },
  addictionIcon: {
    width: '38px', height: '38px', borderRadius: '11px',
    background: '#F4ECDD', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '18px',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 1px 2px rgba(120,80,30,0.06)',
  },
  addictionName: { fontSize: '14px', fontWeight: 500, color: '#2A1F15', margin: 0 },
  addictionSince: { fontSize: '11px', color: '#9C8C78', margin: '2px 0 0' },
  stayedLine: {
    fontSize: '12px', color: '#6B5C4A', textAlign: 'center',
    marginBottom: '14px', fontFamily: 'Georgia, serif',
  },
  bold: { fontWeight: 500, color: '#2A1F15' },
  gridA: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1.5rem' },
  row2: { gridColumn: 'span 3', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  cellA: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F6EFDD 100%)',
    borderRadius: '12px', padding: '12px 4px 10px', textAlign: 'center',
    border: '0.5px solid #ECE2CD',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7), 0 1px 2px rgba(120,80,30,0.04)',
  },
  cellN: {
    fontSize: '22px', fontWeight: 500, color: '#2A1F15',
    lineHeight: 1, margin: 0, fontVariantNumeric: 'tabular-nums',
  },
  cellU: {
    fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em',
    color: '#9C8C78', marginTop: '5px', margin: '5px 0 0',
  },
  cellAccent: { color: '#C5572C' },
  savingsStack: { display: 'flex', flexDirection: 'column', gap: '8px' },
  savingsRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 14px',
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    borderRadius: '12px', border: '0.5px solid #E8DCC2',
  },
  savingsLabel: {
    fontSize: '11px', color: '#8A7B6A', textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  savingsValue: { fontSize: '14px', fontWeight: 500, color: '#2A1F15', fontVariantNumeric: 'tabular-nums' },
  actions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '1rem 0 1.25rem' },
  btn: {
    padding: '13px 8px', borderRadius: '14px', fontSize: '13px',
    fontWeight: 500, textAlign: 'center', border: 'none', cursor: 'pointer',
  },
  btnUrge: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
  },
  btnSlip: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F2E5 100%)',
    color: '#2A1F15', border: '0.5px solid #DDCFB6',
    boxShadow: '0 3px 10px rgba(80,50,20,0.06)',
  },
  tabRow: {
    display: 'flex', gap: '4px', padding: '6px', background: 'white',
    borderRadius: '16px', border: '0.5px solid #E8DFD0',
    boxShadow: '0 4px 14px rgba(80,50,20,0.05)',
  },
  tab: {
    flex: 1, padding: '9px 4px', textAlign: 'center', fontSize: '11px',
    color: '#9C8C78', borderRadius: '10px',
  },
  tabActive: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #EFE5D0 100%)',
    color: '#2A1F15', fontWeight: 500,
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)',
  },
}

export default App