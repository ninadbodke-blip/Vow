import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../LanguageContext'
import { supabase } from '../supabaseClient'

export default function Profile() {
  const { lang, setLang, t } = useLang()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [trackers, setTrackers] = useState([])
  const [allSlipHistory, setAllSlipHistory] = useState([])
  const [allUrgeLogs, setAllUrgeLogs] = useState([])
  const [activeTrackerId, setActiveTrackerId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Editable fields
  const [editingName, setEditingName] = useState(false)
  const [editingWhy, setEditingWhy] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [whyDraft, setWhyDraft] = useState('')
  const [whyExpanded, setWhyExpanded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        if (!u) { navigate('/signup'); return }
        setUser(u)

        const { data: p } = await supabase
          .from('profiles').select('*').eq('id', u.id).single()
        setProfile(p)
        setNameDraft(p?.full_name || '')
        setWhyDraft(p?.bio || '')

        const { data: trackerData } = await supabase
          .from('trackers')
          .select('*, addiction_types(name, icon), tracker_savings(savings_type, per_day_amount)')
          .eq('user_id', u.id).eq('is_active', true).order('created_at')
        setTrackers(trackerData || [])
        if (trackerData?.length > 0) setActiveTrackerId(trackerData[0].id)

        const { data: slips } = await supabase
          .from('streak_history')
          .select('*, trackers(addiction_types(name, icon))')
          .eq('user_id', u.id).order('ended_at', { ascending: false })
        setAllSlipHistory(slips || [])

        const { data: urges } = await supabase
          .from('urge_logs')
          .select('*, trackers(addiction_types(name, icon))')
          .eq('user_id', u.id).order('created_at', { ascending: false })
        setAllUrgeLogs(urges || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const saveName = async () => {
    await supabase.from('profiles').update({ full_name: nameDraft }).eq('id', user.id)
    setProfile({ ...profile, full_name: nameDraft })
    setEditingName(false)
  }

  const saveWhy = async () => {
    await supabase.from('profiles').update({ bio: whyDraft }).eq('id', user.id)
    setProfile({ ...profile, bio: whyDraft })
    setEditingWhy(false)
  }

  const resetLang = () => {
    localStorage.removeItem('vow_lang')
    setLang(null)
    navigate('/')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/signup')
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={{...styles.phone, textAlign: 'center', color: '#9C8C78', paddingTop: '4rem'}}>
          Loading your journey...
        </div>
      </div>
    )
  }

  const now = new Date()

  // Selected tracker
  const activeTracker = trackers.find(t => t.id === activeTrackerId)

  // Filter slips and urges to active tracker
  const slipHistory = allSlipHistory.filter(s => s.tracker_id === activeTrackerId)
  const urgeLogs = allUrgeLogs.filter(u => u.tracker_id === activeTrackerId)

  // Calculate per-tracker stats
  let activeStats = null
  if (activeTracker) {
    const start = new Date(activeTracker.start_date)
    const days = Math.floor((now - start) / (1000 * 60 * 60 * 24))

    const moneySaving = activeTracker.tracker_savings?.find(s => s.savings_type === 'money')
    const timeSaving = activeTracker.tracker_savings?.find(s => s.savings_type === 'time')
    const moneySaved = moneySaving ? days * Number(moneySaving.per_day_amount) : 0
    const timeMinutes = timeSaving ? days * Number(timeSaving.per_day_amount) : 0

    const bestSec = Math.max(
      activeTracker.longest_streak_seconds || 0,
      Math.floor((now - start) / 1000)
    )
    const bestDays = Math.floor(bestSec / 86400)

    const lastSlip = slipHistory[0]
    const daysSinceLastSlip = lastSlip
      ? Math.floor((now - new Date(lastSlip.ended_at)) / (1000 * 60 * 60 * 24))
      : null

    // Hard moments — fought (urges) + caught (slips)
    const fought = urgeLogs.length
    const caught = slipHistory.length
    const total = fought + caught
    const foughtPct = total > 0 ? Math.round((fought / total) * 100) : null

    let timeStr = null
    if (timeMinutes > 0) {
      const hrs = Math.floor(timeMinutes / 60)
      if (hrs >= 24) {
        const d = Math.floor(hrs / 24)
        timeStr = `${d}d ${hrs % 24}h`
      } else {
        timeStr = `${hrs} hours`
      }
    }

    activeStats = {
      days, moneySaved, timeStr, bestDays, daysSinceLastSlip,
      hasMoney: !!moneySaving, hasTime: !!timeSaving,
      fought, caught, total, foughtPct,
    }
  }

  const formatDateAgo = (dateStr) => {
    const date = new Date(dateStr)
    const days = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days}d ago`
    if (days < 365) return `${Math.floor(days/30)}mo ago`
    return `${Math.floor(days/365)}y ago`
  }

  const whyShortPreview = profile?.bio
    ? profile.bio.split('\n')[0].slice(0, 120) + (profile.bio.length > 120 ? '...' : '')
    : null

  const mealsEquiv = activeStats?.moneySaved >= 200 ? Math.floor(activeStats.moneySaved / 200) : null

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.brand}>
          <p style={styles.logo}>{t('appName')}</p>
          <p style={styles.tag}>{t('tagline')}</p>
        </div>

        {/* IDENTITY */}
        <div style={styles.identityCard}>
          <div style={styles.avatar}>
            {(profile?.full_name || 'V').charAt(0).toUpperCase()}
          </div>
          {editingName ? (
            <div style={{display: 'flex', gap: '6px', flex: 1}}>
              <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} style={styles.inlineInput} autoFocus />
              <button onClick={saveName} style={styles.miniBtn}>✓</button>
              <button onClick={() => { setEditingName(false); setNameDraft(profile?.full_name || '') }} style={styles.miniBtnSecondary}>✕</button>
            </div>
          ) : (
            <div style={{flex: 1}}>
              <p style={styles.identityName}>
                {profile?.full_name || 'Your name'}
                <button onClick={() => setEditingName(true)} style={styles.editIcon}>✎</button>
              </p>
              <p style={styles.identityEmail}>{user?.email}</p>
            </div>
          )}
        </div>

        {/* WHY I STARTED */}
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Why I started</p>
          <div style={styles.whyCard}>
            {editingWhy ? (
              <>
                <textarea
                  value={whyDraft}
                  onChange={(e) => setWhyDraft(e.target.value)}
                  placeholder="On weak days, this is what brought you here. Write it for your future self."
                  style={styles.whyTextarea}
                  autoFocus
                  maxLength={3000}
                />
                <div style={{display: 'flex', gap: '6px', marginTop: '8px'}}>
                  <button onClick={saveWhy} style={{...styles.btnSm, ...styles.btnPrimarySm}}>Save</button>
                  <button onClick={() => { setEditingWhy(false); setWhyDraft(profile?.bio || '') }} style={{...styles.btnSm, ...styles.btnSecondarySm}}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                {profile?.bio ? (
                  <>
                    <p style={styles.whyText}>{whyExpanded ? profile.bio : whyShortPreview}</p>
                    <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                      {profile.bio.length > 120 && (
                        <button onClick={() => setWhyExpanded(!whyExpanded)} style={styles.linkBtn}>
                          {whyExpanded ? 'Show less' : 'Read full why'}
                        </button>
                      )}
                      <button onClick={() => setEditingWhy(true)} style={styles.linkBtn}>Edit</button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => setEditingWhy(true)} style={styles.addBtn}>+ Add your why</button>
                )}
              </>
            )}
          </div>
        </div>

        {/* CURRENT STREAKS — clickable tiles */}
        {trackers.length > 0 && (
          <div style={styles.section}>
            <p style={styles.sectionLabel}>Current streaks</p>
            <p style={styles.sectionHint}>Tap a tracker to see its details below</p>
            <div style={styles.streakGrid}>
              {trackers.map(tr => {
                const start = new Date(tr.start_date)
                const days = Math.floor((now - start) / (1000 * 60 * 60 * 24))
                const isActive = tr.id === activeTrackerId
                return (
                  <button
                    key={tr.id}
                    onClick={() => setActiveTrackerId(tr.id)}
                    style={{
                      ...styles.streakCard,
                      ...(isActive ? styles.streakCardActive : {})
                    }}
                  >
                    <p style={styles.streakIcon}>{tr.addiction_types.icon}</p>
                    <p style={{...styles.streakNumber, ...(isActive ? styles.streakNumberActive : {})}}>{days}</p>
                    <p style={{...styles.streakUnit, ...(isActive ? styles.streakUnitActive : {})}}>days clean</p>
                    <p style={{...styles.streakSub, ...(isActive ? styles.streakSubActive : {})}}>{tr.addiction_types.name}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {activeTracker && activeStats && (
          <>
            {/* PROGRESS — for selected tracker */}
            <div style={styles.section}>
              <p style={styles.sectionLabel}>
                {activeTracker.addiction_types.icon} {activeTracker.addiction_types.name} — Progress
              </p>
              <div style={styles.metricGrid}>
                {activeStats.hasMoney && (
                  <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Money saved</p>
                    <p style={styles.metricValue}>₹{activeStats.moneySaved.toLocaleString('en-IN')}</p>
                    {mealsEquiv && <p style={styles.metricSub}>≈ {mealsEquiv} meals</p>}
                  </div>
                )}
                {activeStats.hasTime && (
  <div style={styles.metricCard}>
    <p style={styles.metricLabel}>Time reclaimed</p>
    <p style={styles.metricValue}>{activeStats.timeStr || '0 hours'}</p>
    <p style={styles.metricSub}>got back to you</p>
  </div>
)}
                <div style={styles.metricCard}>
                  <p style={styles.metricLabel}>Best streak</p>
                  <p style={styles.metricValue}>{activeStats.bestDays}</p>
                  <p style={styles.metricSub}>days, ever</p>
                </div>
                {activeStats.daysSinceLastSlip !== null ? (
                  <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Last slip</p>
                    <p style={styles.metricValue}>{activeStats.daysSinceLastSlip}</p>
                    <p style={styles.metricSub}>days ago</p>
                  </div>
                ) : (
                  <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Last slip</p>
                    <p style={styles.metricValue}>—</p>
                    <p style={styles.metricSub}>none yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* HARD MOMENTS — for selected tracker */}
            {activeStats.total > 0 && (
              <div style={styles.section}>
                <p style={styles.sectionLabel}>Hard moments faced</p>
                <div style={styles.urgeStatsCard}>
                  <div style={styles.urgeStatRow}>
                    <span style={styles.urgeStatLabel}>Times you fought the wave</span>
                    <span style={{...styles.urgeStatValue, color: '#7A8C5A'}}>
                      {activeStats.fought}
                    </span>
                  </div>
                  <div style={styles.urgeStatRow}>
                    <span style={styles.urgeStatLabel}>Times the wave caught you</span>
                    <span style={{...styles.urgeStatValue, color: '#A8693E'}}>
                      {activeStats.caught}
                    </span>
                  </div>
                  <div style={{...styles.urgeStatRow, borderTop: '0.5px solid #EFE7D7', paddingTop: '10px', marginTop: '4px'}}>
                    <span style={{...styles.urgeStatLabel, fontWeight: 500}}>You stood strong</span>
                    <span style={{...styles.urgeStatValue, fontSize: '17px', fontFamily: 'Georgia, serif'}}>
                      {activeStats.foughtPct}%
                    </span>
                  </div>
                  <p style={styles.urgeAffirmation}>
                    {activeStats.foughtPct >= 80 
                      ? `You're winning the fight ${activeStats.fought} out of ${activeStats.total} times. Most can't say that.`
                      : activeStats.foughtPct >= 50
                      ? `Recovery is rarely a straight line. You're still showing up.`
                      : `Slips are part of the journey. The fact that you're tracking is itself courage.`
                    }
                  </p>
                </div>
              </div>
            )}

            {/* SLIP HISTORY — for selected tracker */}
            {slipHistory.length > 0 && (
              <div style={styles.section}>
                <p style={styles.sectionLabel}>Slip history</p>
                <div style={styles.historyList}>
                  {slipHistory.slice(0, 10).map(slip => (
                    <div key={slip.id} style={styles.historyCard}>
                      <div style={styles.historyHeader}>
                        <span style={styles.historyName}>
                          Streak lasted {Math.floor(slip.duration_seconds / 86400)} days
                        </span>
                        <span style={styles.historyDate}>{formatDateAgo(slip.ended_at)}</span>
                      </div>
                      {slip.reset_note && (
                        <p style={styles.historyNote}>"{slip.reset_note}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* URGE LOG — for selected tracker */}
            {urgeLogs.length > 0 && (
              <div style={styles.section}>
                <p style={styles.sectionLabel}>Urge log</p>
                <div style={styles.historyList}>
                  {urgeLogs.slice(0, 10).map(urge => (
                    <div key={urge.id} style={styles.historyCard}>
                      <div style={styles.historyHeader}>
                        <span style={{
                          ...styles.intensityPill,
                          background: urge.intensity === 'Strong' ? '#FBE3D8' :
                                      urge.intensity === 'Moderate' ? '#FAEEDA' : '#EAF3DE',
                          color: urge.intensity === 'Strong' ? '#933F1F' :
                                 urge.intensity === 'Moderate' ? '#854F0B' : '#3B6D11',
                        }}>{urge.intensity}</span>
                        <span style={styles.historyDate}>{formatDateAgo(urge.created_at)}</span>
                      </div>
                      {urge.triggers?.length > 0 && (
                        <p style={styles.historyMeta}>{urge.triggers.join(' · ')}</p>
                      )}
                      {urge.notes && (
                        <p style={styles.historyNote}>"{urge.notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* SETTINGS */}
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Settings</p>
          <div style={styles.settingsCard}>
            <button onClick={resetLang} style={styles.settingsRow}>
              <span>Language: {lang === 'hi' ? 'हिंदी' : 'English'}</span>
              <span style={{color: '#9C8C78'}}>›</span>
            </button>
            <div style={styles.settingsDivider}></div>
            <button onClick={signOut} style={{...styles.settingsRow, color: '#B23B3B'}}>
              <span>Sign out</span>
              <span style={{color: '#9C8C78'}}>›</span>
            </button>
          </div>
        </div>

        {/* TAB BAR */}
        <div style={styles.tabRow}>
          <button onClick={() => navigate('/home')} style={styles.tab}>{t('home')}</button>
          <button onClick={() => alert('Community coming soon')} style={styles.tab}>{t('community')}</button>
          <button style={{...styles.tab, ...styles.tabActive}}>{t('profile')}</button>
        </div>

      </div>
    </div>
  )
}

const styles = {
  frame: { minHeight: '100vh', background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)', padding: '2rem 1rem', display: 'flex', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  phone: { background: '#FAF7F1', maxWidth: '420px', width: '100%', borderRadius: '28px', padding: '2rem 1.25rem 1.5rem', boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)' },
  brand: { textAlign: 'center', marginBottom: '1.25rem' },
  logo: { fontSize: '28px', fontWeight: 500, color: '#2A1F15', margin: 0, letterSpacing: '-0.02em', fontFamily: 'Georgia, serif' },
  tag: { fontSize: '11px', color: '#8A7B6A', fontStyle: 'italic', margin: '4px 0 0', fontFamily: 'Georgia, serif' },
  identityCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '14px', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(80,50,20,0.04)' },
  avatar: { width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 500, fontFamily: 'Georgia, serif' },
  identityName: { fontSize: '15px', fontWeight: 500, color: '#2A1F15', margin: 0, fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: '6px' },
  identityEmail: { fontSize: '11px', color: '#9C8C78', margin: '2px 0 0' },
  editIcon: { background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '12px', cursor: 'pointer', padding: '0 4px', fontFamily: 'inherit' },
  inlineInput: { flex: 1, padding: '6px 10px', borderRadius: '8px', border: '0.5px solid #DDCFB6', fontSize: '14px', fontFamily: 'inherit', outline: 'none' },
  miniBtn: { padding: '6px 10px', borderRadius: '8px', border: 'none', background: '#3A2A1C', color: '#FAF7F1', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px' },
  miniBtnSecondary: { padding: '6px 10px', borderRadius: '8px', border: '0.5px solid #DDCFB6', background: 'white', color: '#2A1F15', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px' },
  section: { marginBottom: '1.25rem' },
  sectionLabel: { fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9C8C78', margin: '0 0 8px', fontWeight: 500 },
  sectionHint: { fontSize: '11px', color: '#A89C88', fontStyle: 'italic', margin: '0 0 8px' },
  whyCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)', border: '0.5px solid #E8DFD0', borderRadius: '14px', padding: '14px 16px' },
  whyText: { fontSize: '13px', color: '#2A1F15', lineHeight: 1.6, margin: 0, fontFamily: 'Georgia, serif', whiteSpace: 'pre-wrap' },
  whyTextarea: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid #DDCFB6', background: 'white', fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', boxSizing: 'border-box', outline: 'none', minHeight: '120px', resize: 'vertical', lineHeight: 1.5 },
  linkBtn: { background: 'transparent', border: 'none', padding: 0, color: '#854F0B', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' },
  addBtn: { background: '#F4ECDD', border: '1px dashed #C9B894', borderRadius: '10px', padding: '14px', width: '100%', color: '#854F0B', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500 },
  btnSm: { padding: '8px 14px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  btnPrimarySm: { background: '#3A2A1C', color: '#FAF7F1' },
  btnSecondarySm: { background: 'white', color: '#2A1F15', border: '0.5px solid #DDCFB6' },
  streakGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' },
  streakCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)', border: '0.5px solid #E8DFD0', borderRadius: '14px', padding: '16px 14px', textAlign: 'center', boxShadow: '0 2px 8px rgba(80,50,20,0.04)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
  streakCardActive: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', border: '0.5px solid #241710', boxShadow: '0 6px 18px rgba(40,25,10,0.3)' },
  streakIcon: { fontSize: '20px', margin: '0 0 4px' },
  streakNumber: { fontSize: '36px', fontWeight: 500, color: '#2A1F15', margin: 0, lineHeight: 1, fontFamily: 'Georgia, serif' },
  streakNumberActive: { color: '#FAF7F1' },
  streakUnit: { fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9C8C78', margin: '4px 0 8px' },
  streakUnitActive: { color: '#E8DCC2' },
  streakSub: { fontSize: '12px', color: '#2A1F15', fontWeight: 500, margin: 0 },
  streakSubActive: { color: '#FAF7F1' },
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' },
  metricCard: { background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)', border: '0.5px solid #E8DCC2', borderRadius: '12px', padding: '12px 14px' },
  metricLabel: { fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8A7B6A', margin: '0 0 4px', fontWeight: 500 },
  metricValue: { fontSize: '20px', fontWeight: 500, color: '#2A1F15', margin: 0, fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums' },
  metricSub: { fontSize: '10px', color: '#9C8C78', margin: '4px 0 0' },
  urgeStatsCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)', border: '0.5px solid #E8DFD0', borderRadius: '14px', padding: '14px 16px' },
  urgeStatRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0' },
  urgeStatLabel: { fontSize: '13px', color: '#6B5C4A' },
  urgeStatValue: { fontSize: '14px', fontWeight: 500, color: '#2A1F15' },
  urgeAffirmation: { fontSize: '12px', color: '#7A8C5A', fontStyle: 'italic', margin: '8px 0 0', fontFamily: 'Georgia, serif', paddingTop: '8px', borderTop: '0.5px solid #EFE7D7', lineHeight: 1.5 },
  historyList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  historyCard: { background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '12px', padding: '10px 12px' },
  historyHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', justifyContent: 'space-between' },
  historyName: { fontSize: '12px', fontWeight: 500, color: '#2A1F15' },
  historyDate: { fontSize: '10px', color: '#9C8C78', textTransform: 'uppercase', letterSpacing: '0.04em' },
  historyMeta: { fontSize: '11px', color: '#8A7B6A', margin: '4px 0 0' },
  historyNote: { fontSize: '12px', color: '#2A1F15', fontStyle: 'italic', margin: '6px 0 0', fontFamily: 'Georgia, serif', lineHeight: 1.5, paddingTop: '6px', borderTop: '0.5px solid #EFE7D7' },
  intensityPill: { fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  settingsCard: { background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '14px', overflow: 'hidden' },
  settingsRow: { display: 'flex', justifyContent: 'space-between', width: '100%', padding: '14px 16px', border: 'none', background: 'transparent', fontSize: '13px', color: '#2A1F15', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' },
  settingsDivider: { height: '0.5px', background: '#EFE7D7' },
  tabRow: { display: 'flex', gap: '4px', padding: '6px', background: 'white', borderRadius: '16px', border: '0.5px solid #E8DFD0', boxShadow: '0 4px 14px rgba(80,50,20,0.05)', marginTop: '1rem' },
  tab: { flex: 1, padding: '9px 4px', textAlign: 'center', fontSize: '11px', color: '#9C8C78', borderRadius: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  tabActive: { background: 'linear-gradient(180deg, #F4ECDD 0%, #EFE5D0 100%)', color: '#2A1F15', fontWeight: 500, boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)' },
}