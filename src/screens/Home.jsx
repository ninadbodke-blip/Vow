import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../LanguageContext'
import { supabase } from '../supabaseClient'
import { checkAndMarkMilestones } from '../milestoneHelpers'

const FREE_LIMIT = 2

export default function Home() {
  const { lang, setLang, t } = useLang()
  const navigate = useNavigate()

  const [trackers, setTrackers] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [, setTickCount] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showProModal, setShowProModal] = useState(false)
  const [userName, setUserName] = useState('')
  const [toastMilestones, setToastMilestones] = useState([])

  useEffect(() => {
    const id = setInterval(() => setTickCount(c => c + 1), 100)
    return () => clearInterval(id)
  }, [])

  const loadTrackers = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/signup')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    if (profile?.full_name) setUserName(profile.full_name)

    const { data, error: trackerError } = await supabase
      .from('trackers')
      .select(`
        *,
        addiction_types (id, name, icon),
        tracker_savings (savings_type, per_day_amount)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at')

    if (trackerError) {
      setError(trackerError.message)
    } else if (!data || data.length === 0) {
      navigate('/onboarding/addiction')
    } else {
      setTrackers(data)
      if (activeIdx >= data.length) setActiveIdx(0)

      const allNew = []
      for (const tr of data) {
        const newOnes = await checkAndMarkMilestones(tr, user.id)
        allNew.push(...newOnes.map(m => ({ ...m, trackerName: tr.addiction_types.name })))
      }
      if (allNew.length > 0) {
        setToastMilestones(allNew)
        setTimeout(() => setToastMilestones([]), 4000)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTrackers()
  }, [])

  const resetLang = () => {
    localStorage.removeItem('vow_lang')
    setLang(null)
    navigate('/')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/signup')
  }

  const handleAddMore = () => {
    if (trackers.length >= FREE_LIMIT) {
      setShowProModal(true)
      return
    }
    navigate('/onboarding/addiction')
  }

  const handleDeleteTracker = async () => {
    const tracker = trackers[activeIdx]
    if (!tracker) return

    const { error: delErr } = await supabase
      .from('trackers')
      .update({ is_active: false })
      .eq('id', tracker.id)

    if (delErr) {
      alert('Could not delete: ' + delErr.message)
      return
    }
    setShowDeleteConfirm(false)
    setActiveIdx(0)
    setLoading(true)
    await loadTrackers()
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={{...styles.phone, textAlign: 'center', color: '#9C8C78', paddingTop: '4rem'}}>
          Loading your trackers...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.frame}>
        <div style={{...styles.phone, textAlign: 'center', color: '#B23B3B', paddingTop: '4rem'}}>
          Error: {error}
        </div>
      </div>
    )
  }

  const tracker = trackers[activeIdx]
  if (!tracker) return null

  const startDate = new Date(tracker.start_date)
  const now = new Date()
  let total = Math.floor((now - startDate) / 1000)
  const secs = total % 60; total = Math.floor(total / 60)
  const mins = total % 60; total = Math.floor(total / 60)
  const hours = total % 24; total = Math.floor(total / 24)
  const totalDays = total
  const years = Math.floor(totalDays / 365)
  const remainingAfterYears = totalDays - (years * 365)
  const months = Math.floor(remainingAfterYears / 30)
  const days = remainingAfterYears - (months * 30)

  const totalDaysClean = Math.floor((now - startDate) / (1000 * 60 * 60 * 24))

  const moneySaving = tracker.tracker_savings?.find(s => s.savings_type === 'money')
  const timeSaving = tracker.tracker_savings?.find(s => s.savings_type === 'time')

  const moneySaved = moneySaving 
    ? (totalDaysClean * Number(moneySaving.per_day_amount)).toLocaleString('en-IN')
    : null
  
  const timeSavedMinutes = timeSaving
    ? totalDaysClean * Number(timeSaving.per_day_amount)
    : null
  
  let timeSavedStr = null
  if (timeSavedMinutes !== null) {
    const tDays = Math.floor(timeSavedMinutes / (60 * 24))
    const tHours = Math.floor((timeSavedMinutes % (60 * 24)) / 60)
    if (tDays > 0) timeSavedStr = `${tDays} days, ${tHours} hrs`
    else if (tHours > 0) timeSavedStr = `${tHours} hours`
    else timeSavedStr = `${Math.round(timeSavedMinutes)} mins`
  }

  const startDateStr = startDate.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const longestDays = Math.max(
    totalDaysClean,
    Math.floor((tracker.longest_streak_seconds || 0) / 86400)
  )

  const pad = (n) => String(n).padStart(2, '0')

  // Days in current month — for accurate days jar
  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  // JAR FILL PERCENTAGES — each unit measures only itself within its own cycle
  const ms = now.getMilliseconds()
  const yearsFill = (years / 10) * 100             // max 10 years
  const monthsFill = (months / 12) * 100            // max 12 months
  const daysFill = (days / daysInCurrentMonth) * 100 // max 28-31 days
  const hoursFill = (hours / 24) * 100              // max 24 hours
  const minsFill = (mins / 60) * 100                // max 60 mins
  const secsFill = ((secs * 1000 + ms) / 60000) * 100 // smooth fill within each second

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.brand}>
          <p style={styles.logo}>{t('appName')}</p>
          <p style={styles.tag}>{t('tagline')}</p>
          {userName && (
            <p style={{
              fontSize: '13px',
              color: '#6B5C4A',
              margin: '0.75rem 0 0',
              fontFamily: 'Georgia, serif',
            }}>
              Welcome, <b style={{color: '#2A1F15', fontWeight: 500}}>{userName}</b>
            </p>
          )}
        </div>

        <div style={styles.trackerSwitcher}>
          {trackers.map((tr, idx) => (
            <button
              key={tr.id}
              onClick={() => setActiveIdx(idx)}
              style={{
                ...styles.switchBtn,
                ...(idx === activeIdx ? styles.switchBtnActive : {})
              }}
            >
              {tr.addiction_types.icon} {tr.addiction_types.name}
            </button>
          ))}
          <button 
            onClick={handleAddMore} 
            style={{
              ...styles.switchBtn,
              ...(trackers.length >= FREE_LIMIT ? styles.proBtn : styles.addBtn)
            }}
          >
            {trackers.length >= FREE_LIMIT ? '+ Add (Pro)' : '+ Add'}
          </button>
        </div>

        <div style={styles.trackerCard}>
          <div style={styles.addictionRow}>
            <div style={styles.addictionIcon}>{tracker.addiction_types.icon}</div>
            <div style={{flex: 1}}>
              <p style={styles.addictionName}>{tracker.addiction_types.name}</p>
              <p style={styles.addictionSince}>Since {startDateStr}</p>
            </div>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              style={styles.deleteIcon}
              title="Delete tracker"
            >
              ✕
            </button>
          </div>

          <p style={styles.stayedLine}>
            {t('youveStayed')} <b style={styles.bold}>{tracker.addiction_types.name}</b> {t('freeFor')}
          </p>

          <div style={styles.gridA}>
            <Cell n={years} u="year" fillPercent={yearsFill} hideIfZero />
            <Cell n={months} u="months" fillPercent={monthsFill} />
            <Cell n={days} u="days" fillPercent={daysFill} />
            <div style={styles.row2}>
              <Cell n={pad(hours)} u="hours" fillPercent={hoursFill} />
              <Cell n={pad(mins)} u="mins" fillPercent={minsFill} />
              <Cell n={pad(secs)} u="secs" fillPercent={secsFill} accent />
            </div>
          </div>

          <div style={styles.savingsStack}>
            {moneySaved !== null && (
              <div style={styles.savingsRow}>
                <span style={styles.savingsLabel}>{t('moneySaved')}</span>
                <span style={styles.savingsValue}>₹{moneySaved}</span>
              </div>
            )}
            {timeSavedStr !== null && (
              <div style={styles.savingsRow}>
                <span style={styles.savingsLabel}>Time saved</span>
                <span style={styles.savingsValue}>{timeSavedStr}</span>
              </div>
            )}
            <div style={styles.savingsRow}>
              <span style={styles.savingsLabel}>{t('longestStreak')}</span>
              <span style={styles.savingsValue}>{longestDays} days</span>
            </div>
            <button
              onClick={() => navigate(`/milestones/${tracker.id}`)}
              style={styles.milestonesLink}
            >
              🏆 View milestones →
            </button>
          </div>
        </div>

        <div style={styles.actions}>
          <button 
            onClick={() => navigate(`/urge/${tracker.id}`)}
            style={{...styles.btn, ...styles.btnUrge}}
          >
            {t('logUrge')}
          </button>
          <button 
            onClick={() => navigate(`/slip/${tracker.id}`)}
            style={{...styles.btn, ...styles.btnSlip}}
          >
            {t('iSlipped')}
          </button>
        </div>

        <div style={styles.tabRow}>
          <button style={{...styles.tab, ...styles.tabActive, border: 'none', cursor: 'pointer', fontFamily: 'inherit'}}>{t('home')}</button>
          <button 
            onClick={() => alert('Community coming soon')}
            style={{...styles.tab, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit'}}
          >
            {t('community')}
          </button>
          <button 
            onClick={() => navigate('/profile')}
            style={{...styles.tab, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit'}}
          >
            {t('profile')}
          </button>
        </div>

        <div style={styles.devBar}>
          <button onClick={resetLang} style={styles.devBtn}>Reset language</button>
          <button onClick={signOut} style={styles.devBtn}>Sign out</button>
        </div>

        {showDeleteConfirm && (
          <div style={styles.modal}>
            <div style={styles.modalCard}>
              <p style={styles.modalTitle}>Delete this tracker?</p>
              <p style={styles.modalBody}>
                Your {tracker.addiction_types.name} tracker will be removed.
                You can always add it back later.
              </p>
              <div style={styles.modalActions}>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{...styles.btn, ...styles.btnSlip, flex: 1}}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteTracker}
                  style={{...styles.btn, ...styles.btnDanger, flex: 1}}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showProModal && (
          <div style={styles.modal}>
            <div style={styles.modalCard}>
              <div style={{textAlign: 'center', marginBottom: '1rem'}}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✨</div>
                <p style={styles.modalTitle}>Unlock Vow Pro</p>
              </div>
              <p style={styles.modalBody}>
                Track unlimited addictions, unlock the Circle of Support for family,
                access journal, get shareable milestone cards, and more.
              </p>
              <div style={{
                background: '#F4ECDD',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '1.25rem',
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '11px', color: '#8A7B6A',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  margin: '0 0 4px',
                }}>
                  Vow Pro
                </p>
                <p style={{
                  fontSize: '20px', fontWeight: 500, color: '#2A1F15',
                  margin: 0, fontFamily: 'Georgia, serif',
                }}>
                  ₹149<span style={{fontSize: '13px', color: '#8A7B6A'}}> /month</span>
                </p>
                <p style={{
                  fontSize: '11px', color: '#7A8C5A', margin: '4px 0 0', fontWeight: 500,
                }}>
                  or ₹999/year — save 44%
                </p>
              </div>
              <div style={styles.modalActions}>
                <button 
                  onClick={() => setShowProModal(false)}
                  style={{...styles.btn, ...styles.btnSlip, flex: 1}}
                >
                  Maybe later
                </button>
                <button 
                  onClick={() => {
                    alert('Payment integration coming soon. For now, this is just a preview.')
                    setShowProModal(false)
                  }}
                  style={{...styles.btn, ...styles.btnUrge, flex: 1}}
                >
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        )}

        {toastMilestones.length > 0 && (
          <div style={styles.toast}>
            <div style={styles.toastInner}>
              <span style={styles.toastIcon}>{toastMilestones[0].badge_icon}</span>
              <div>
                <p style={styles.toastTitle}>
                  {toastMilestones.length === 1 
                    ? `${toastMilestones[0].label} unlocked!`
                    : `${toastMilestones.length} milestones unlocked!`}
                </p>
                <p style={styles.toastSub}>
                  {toastMilestones.length === 1
                    ? `Tap "View milestones" to celebrate.`
                    : `Your journey is bigger than you thought.`}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function Cell({ n, u, accent, fillPercent, hideIfZero }) {
  const isHidden = hideIfZero && (!n || n === 0 || n === '00')
  
  return (
    <div style={styles.cellA}>
      {!isHidden && (
        <div 
          style={{
            ...styles.cellFill,
            height: `${Math.min(fillPercent || 0, 100)}%`,
            background: accent
              ? 'linear-gradient(180deg, rgba(197,87,44,0.30) 0%, rgba(197,87,44,0.55) 100%)'
              : 'linear-gradient(180deg, rgba(217,151,80,0.25) 0%, rgba(197,109,44,0.45) 100%)',
          }}
        />
      )}
      <div style={styles.cellContent}>
        {isHidden ? (
          <p style={{...styles.cellU, marginTop: '14px'}}>—</p>
        ) : (
          <>
            <p style={{...styles.cellN, ...(accent ? styles.cellAccent : {})}}>{n}</p>
            <p style={styles.cellU}>{u}</p>
          </>
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  phone: {
    background: '#FAF7F1',
    maxWidth: '420px',
    width: '100%',
    borderRadius: '28px',
    padding: '2rem 1.25rem 1.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
    position: 'relative',
  },
  brand: { textAlign: 'center', marginBottom: '1.5rem' },
  logo: {
    fontSize: '32px', fontWeight: 500, color: '#2A1F15', margin: 0,
    letterSpacing: '-0.02em', fontFamily: 'Georgia, serif',
  },
  tag: {
    fontSize: '12px', color: '#8A7B6A', fontStyle: 'italic',
    margin: '4px 0 0', fontFamily: 'Georgia, serif',
  },
  trackerSwitcher: {
    display: 'flex', gap: '6px', marginBottom: '1rem',
    overflowX: 'auto', paddingBottom: '4px',
  },
  switchBtn: {
    padding: '8px 12px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#9C8C78',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    boxShadow: '0 1px 2px rgba(80,50,20,0.04)',
  },
  switchBtnActive: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: '0.5px solid #241710',
    boxShadow: '0 2px 8px rgba(40,25,10,0.2)',
  },
  addBtn: {
    background: 'transparent',
    border: '1px dashed #C9B894',
    color: '#9C8C78',
  },
  proBtn: {
    background: 'linear-gradient(180deg, #FAEEDA 0%, #F4DDB8 100%)',
    border: '0.5px solid #D9B57A',
    color: '#854F0B',
    fontWeight: 500,
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
  deleteIcon: {
    width: '28px', height: '28px',
    background: 'transparent',
    border: 'none',
    color: '#C9B894',
    fontSize: '14px',
    cursor: 'pointer',
    borderRadius: '6px',
    fontFamily: 'inherit',
  },
  stayedLine: {
    fontSize: '12px', color: '#6B5C4A', textAlign: 'center',
    marginBottom: '14px', fontFamily: 'Georgia, serif',
  },
  bold: { fontWeight: 500, color: '#2A1F15' },
  gridA: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1.5rem' },
  row2: { gridColumn: 'span 3', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  cellA: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F6EFDD 100%)',
    borderRadius: '12px',
    padding: '12px 4px 10px',
    textAlign: 'center',
    border: '0.5px solid #ECE2CD',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7), 0 1px 2px rgba(120,80,30,0.04)',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '54px',
  },
  cellFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  cellContent: {
    position: 'relative',
    zIndex: 1,
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
  milestonesLink: {
    width: '100%',
    background: 'transparent',
    border: '0.5px dashed #DDCFB6',
    borderRadius: '10px',
    padding: '10px',
    fontSize: '12px',
    color: '#854F0B',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: '4px',
  },
  actions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '1rem 0 1.25rem' },
  btn: {
    padding: '13px 8px', borderRadius: '14px', fontSize: '13px',
    fontWeight: 500, textAlign: 'center', border: 'none', cursor: 'pointer',
    fontFamily: 'inherit',
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
  btnDanger: {
    background: 'linear-gradient(180deg, #B23B3B 0%, #8E2828 100%)',
    color: 'white',
    boxShadow: '0 4px 14px rgba(140,40,40,0.25)',
  },
  tabRow: {
    display: 'flex', gap: '4px', padding: '6px', background: 'white',
    borderRadius: '16px', border: '0.5px solid #E8DFD0',
    boxShadow: '0 4px 14px rgba(80,50,20,0.05)',
    marginBottom: '1rem',
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
  devBar: {
    display: 'flex', gap: '8px', justifyContent: 'center',
    marginTop: '0.5rem', opacity: 0.5,
  },
  devBtn: {
    padding: '4px 10px', background: 'transparent', border: '0.5px solid #DDCFB6',
    borderRadius: '6px', fontSize: '10px', color: '#9C8C78',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(40,25,15,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', zIndex: 100,
  },
  modalCard: {
    background: '#FAF7F1',
    maxWidth: '360px',
    width: '100%',
    borderRadius: '20px',
    padding: '1.75rem 1.5rem',
    boxShadow: '0 20px 60px rgba(40,25,15,0.3)',
  },
  modalTitle: {
    fontSize: '17px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 8px', fontFamily: 'Georgia, serif',
  },
  modalBody: {
    fontSize: '13px', color: '#6B5C4A',
    margin: '0 0 1.5rem', lineHeight: 1.5,
  },
  modalActions: {
    display: 'flex', gap: '8px',
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 200,
    maxWidth: '90vw',
  },
  toastInner: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    borderRadius: '14px',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 8px 24px rgba(40,25,10,0.4)',
    border: '0.5px solid rgba(255,255,255,0.08)',
  },
  toastIcon: { fontSize: '28px' },
  toastTitle: {
    fontSize: '14px', fontWeight: 500, margin: 0,
    fontFamily: 'Georgia, serif',
  },
  toastSub: {
    fontSize: '11px', margin: '2px 0 0',
    color: '#E8DCC2', fontStyle: 'italic',
  },
}