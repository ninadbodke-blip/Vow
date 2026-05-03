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

  const [editingName, setEditingName] = useState(false)
  const [editingWhy, setEditingWhy] = useState(false)
  const [showFullWhy, setShowFullWhy] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [whyDraft, setWhyDraft] = useState('')
  const [showSettings, setShowSettings] = useState(false)

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
          .from('streak_history').select('*')
          .eq('user_id', u.id).order('ended_at', { ascending: false })
        setAllSlipHistory(slips || [])

        const { data: urges } = await supabase
          .from('urge_logs').select('*')
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
      <div style={{...styles.phone, textAlign: 'center', color: '#9C8C78'}}>
        Loading...
      </div>
    </div>
  )
}

  const now = new Date()
  const activeTracker = trackers.find(tr => tr.id === activeTrackerId)
  const slipHistory = allSlipHistory.filter(s => s.tracker_id === activeTrackerId)
  const urgeLogs = allUrgeLogs.filter(u => u.tracker_id === activeTrackerId)

  let activeStats = null
  if (activeTracker) {
    const start = new Date(activeTracker.start_date)
    const days = Math.floor((now - start) / (1000 * 60 * 60 * 24))
    const moneySaving = activeTracker.tracker_savings?.find(s => s.savings_type === 'money')
    const timeSaving = activeTracker.tracker_savings?.find(s => s.savings_type === 'time')
    const moneySaved = moneySaving ? days * Number(moneySaving.per_day_amount) : 0
    const timeMinutes = timeSaving ? days * Number(timeSaving.per_day_amount) : 0
    const bestSec = Math.max(activeTracker.longest_streak_seconds || 0, Math.floor((now - start) / 1000))
    const bestDays = Math.floor(bestSec / 86400)
    const lastSlip = slipHistory[0]
    const daysSinceLastSlip = lastSlip
      ? Math.floor((now - new Date(lastSlip.ended_at)) / (1000 * 60 * 60 * 24))
      : null

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
        timeStr = `${hrs}h`
      }
    } else if (timeSaving) {
      timeStr = '0h'
    }

    activeStats = {
      days, moneySaved, timeStr, bestDays, daysSinceLastSlip,
      hasMoney: !!moneySaving, hasTime: !!timeSaving,
      hasSlip: daysSinceLastSlip !== null,
      fought, caught, total, foughtPct,
    }
  }

  const fullBio = profile?.bio || ''
  const previewLength = Math.min(fullBio.length, 140)
  const bioPreview = fullBio.slice(0, previewLength).trim()
  const hasMore = fullBio.length > previewLength

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* IDENTITY CARD WITH GEAR */}
<div style={styles.identityCard}>
  <div style={styles.avatar}>
    {(profile?.full_name || 'V').charAt(0).toUpperCase()}
  </div>
  <div style={styles.identityText}>
    {editingName ? (
      <div style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
        <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} style={styles.inlineInput} autoFocus />
        <button onClick={saveName} style={styles.miniBtn}>✓</button>
        <button onClick={() => { setEditingName(false); setNameDraft(profile?.full_name || '') }} style={styles.miniBtnSecondary}>✕</button>
      </div>
    ) : (
      <>
        <div style={styles.nameLine}>
          <span style={styles.nameText}>{profile?.full_name || 'Your name'}</span>
          <button onClick={() => setEditingName(true)} style={styles.editIcon} aria-label="Edit name">✎</button>
        </div>
        <p style={styles.emailText}>{user?.email}</p>
      </>
    )}
  </div>
  <button onClick={() => setShowSettings(true)} style={styles.gearBtn} aria-label="Settings">⚙</button>
</div>

        {/* THE WHY — clean serif card */}
        <div style={styles.whySection}>
          <p style={styles.sectionLabel}>Why I started</p>
          
          {editingWhy ? (
            <div style={styles.whyEditCard}>
              <textarea
                value={whyDraft}
                onChange={(e) => setWhyDraft(e.target.value)}
                placeholder="On weak days, this is what brought you here..."
                style={styles.whyTextarea}
                autoFocus
                maxLength={3000}
              />
              <div style={styles.whyEditActions}>
                <button onClick={() => { setEditingWhy(false); setWhyDraft(profile?.bio || '') }} style={styles.btnGhost}>Cancel</button>
                <button onClick={saveWhy} style={styles.btnDark}>Save</button>
              </div>
            </div>
          ) : fullBio ? (
  <div style={styles.whyCard}>
    <p style={styles.whyText}>
      {showFullWhy ? fullBio : (bioPreview + (hasMore ? '...' : ''))}
    </p>
    <div style={styles.whyFooter}>
      {hasMore && (
        <button onClick={() => setShowFullWhy(!showFullWhy)} style={styles.whyLink}>
          {showFullWhy ? 'Show less' : 'Read more'}
        </button>
      )}
      <button onClick={() => setEditingWhy(true)} style={styles.whyLinkMuted}>Edit</button>
    </div>
  </div>
) : (
            <button onClick={() => setEditingWhy(true)} style={styles.whyEmptyBtn}>
              <span style={{fontSize: '18px', marginRight: '8px'}}>✎</span>
              Write your why
            </button>
          )}
        </div>

        {/* TRACKER CHIPS */}
        {trackers.length > 0 && (
          <div style={styles.section}>
            <p style={styles.sectionLabel}>Tracking</p>
            <div style={styles.trackerChips}>
              {trackers.map(tr => {
                const isActive = tr.id === activeTrackerId
                return (
                  <button
                    key={tr.id}
                    onClick={() => setActiveTrackerId(tr.id)}
                    style={{
                      ...styles.chip,
                      ...(isActive ? styles.chipActive : {})
                    }}
                  >
                    <span style={{marginRight: '6px'}}>{tr.addiction_types.icon}</span>
                    {tr.addiction_types.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {activeTracker && activeStats && (
          <>
            <div style={styles.section}>
              <p style={styles.sectionLabel}>
                {activeTracker.addiction_types.name} · {activeStats.days} {activeStats.days === 1 ? 'day' : 'days'} clean
              </p>

              <div style={styles.metricGrid}>
                {activeStats.hasMoney && (
                  <div style={styles.metricCard}>
                    <p style={styles.metricValue}>₹{activeStats.moneySaved.toLocaleString('en-IN')}</p>
                    <p style={styles.metricLabel}>Saved</p>
                  </div>
                )}
                {activeStats.hasTime && (
                  <div style={styles.metricCard}>
                    <p style={styles.metricValue}>{activeStats.timeStr}</p>
                    <p style={styles.metricLabel}>Reclaimed</p>
                  </div>
                )}
                <div style={styles.metricCard}>
                  <p style={styles.metricValue}>{activeStats.bestDays}</p>
                  <p style={styles.metricLabel}>Best streak</p>
                </div>
                {activeStats.hasSlip && (
                  <div style={styles.metricCard}>
                    <p style={styles.metricValue}>{activeStats.daysSinceLastSlip}d</p>
                    <p style={styles.metricLabel}>Since last slip</p>
                  </div>
                )}
              </div>
            </div>

            {activeStats.total > 0 && (
              <div style={styles.section}>
                <div style={styles.hardMomentsBar}>
                  <div style={styles.hardLine}>
                    <span style={styles.hardLabel}>You stood strong</span>
                    <span style={styles.hardPct}>{activeStats.foughtPct}%</span>
                  </div>
                  <div style={styles.barTrack}>
                    <div style={{...styles.barFill, width: `${activeStats.foughtPct}%`}}></div>
                  </div>
                  <p style={styles.hardSub}>
                    {activeStats.fought} fought · {activeStats.caught} caught
                  </p>
                </div>
              </div>
            )}

            <div style={styles.section}>
              <div style={styles.historyLinks}>
                <button onClick={() => navigate(`/slips?tracker=${activeTrackerId}`)} style={styles.linkRow}>
                  <span style={styles.linkIcon}>📜</span>
                  <span style={styles.linkLabel}>Slip history</span>
                  <span style={styles.linkCount}>{slipHistory.length}</span>
                  <span style={styles.linkArrow}>›</span>
                </button>
                <div style={styles.linkDivider}></div>
                <button onClick={() => navigate(`/urges?tracker=${activeTrackerId}`)} style={styles.linkRow}>
                  <span style={styles.linkIcon}>🌊</span>
                  <span style={styles.linkLabel}>Urge log</span>
                  <span style={styles.linkCount}>{urgeLogs.length}</span>
                  <span style={styles.linkArrow}>›</span>
                </button>
                <div style={styles.linkDivider}></div>
                <button onClick={() => navigate(`/milestones/${activeTrackerId}`)} style={styles.linkRow}>
                  <span style={styles.linkIcon}>🏆</span>
                  <span style={styles.linkLabel}>Milestones</span>
                  <span style={styles.linkArrow}>›</span>
                </button>
              </div>
            </div>
          </>
        )}

        <div style={styles.tabRow}>
  <button onClick={() => navigate('/home')} style={styles.tab}>{t('home')}</button>
  <button onClick={() => navigate('/anchors')} style={styles.tab}>Anchors</button>
  <button style={{...styles.tab, ...styles.tabActive}}>{t('profile')}</button>
</div>

        {showSettings && (
          <div style={styles.modal} onClick={() => setShowSettings(false)}>
            <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
              <p style={styles.modalTitle}>Settings</p>
              <button onClick={resetLang} style={styles.settingsRow}>
                <span>Language: {lang === 'hi' ? 'हिंदी' : 'English'}</span>
                <span style={{color: '#9C8C78'}}>›</span>
              </button>
              <div style={styles.settingsDivider}></div>
              <button onClick={signOut} style={{...styles.settingsRow, color: '#B23B3B'}}>
                <span>Sign out</span>
                <span style={{color: '#9C8C78'}}>›</span>
              </button>
              <button onClick={() => setShowSettings(false)} style={styles.modalClose}>Close</button>
            </div>
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
    display: 'flex', justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  phone: {
  background: '#FAF7F1',
  maxWidth: '420px', width: '100%',
  borderRadius: '28px',
  padding: '2.5rem 1.25rem 1.5rem',
  boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
},

  gearBtn: {
  width: '34px', height: '34px',
  background: 'rgba(232,223,208,0.4)',
  border: '0.5px solid #E8DFD0',
  borderRadius: '50%',
  color: '#6B5C4A', fontSize: '15px',
  cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 0,
  flexShrink: 0,
},

  identityCard: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '16px 18px',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '16px',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(80,50,20,0.04)',
  },
  avatar: {
    width: '48px', height: '48px', borderRadius: '50%',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', fontWeight: 500, fontFamily: 'Georgia, serif',
    flexShrink: 0,
  },
  identityText: {
    flex: 1, minWidth: 0,
    display: 'flex', flexDirection: 'column', gap: '3px',
  },
  nameLine: {
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  nameText: {
    fontSize: '15px', fontWeight: 500, color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  emailText: {
    fontSize: '11px', color: '#9C8C78',
    margin: 0,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  editIcon: {
    background: 'transparent', border: 'none',
    color: '#9C8C78', fontSize: '12px',
    cursor: 'pointer', padding: '0 4px',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  inlineInput: {
    flex: 1, padding: '6px 10px', borderRadius: '8px',
    border: '0.5px solid #DDCFB6', fontSize: '14px',
    fontFamily: 'inherit', outline: 'none',
    minWidth: 0,
  },
  miniBtn: { padding: '6px 10px', borderRadius: '8px', border: 'none', background: '#3A2A1C', color: '#FAF7F1', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', flexShrink: 0 },
  miniBtnSecondary: { padding: '6px 10px', borderRadius: '8px', border: '0.5px solid #DDCFB6', background: 'white', color: '#2A1F15', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', flexShrink: 0 },

  // SECTIONS
  section: { marginBottom: '1.25rem' },
  sectionLabel: {
    fontSize: '10px', textTransform: 'uppercase',
    letterSpacing: '0.1em', color: '#9C8C78',
    margin: '0 0 10px', fontWeight: 500,
    paddingLeft: '4px',
  },

  // WHY SECTION
  whySection: { marginBottom: '1.5rem' },
  whyCard: {
  background: 'linear-gradient(180deg, #2A1F15 0%, #1A1208 100%)',
  border: '0.5px solid #3A2A1C',
  borderRadius: '16px',
  padding: '1.5rem 1.5rem 1.25rem',
  boxShadow: '0 6px 20px rgba(20,12,5,0.25), inset 0 1px 0 rgba(212,175,100,0.08)',
},
  quoteOpen: {
    position: 'absolute',
    top: '0px', left: '14px',
    fontSize: '52px',
    fontFamily: 'Georgia, serif',
    color: '#C5572C',
    lineHeight: 1,
    fontWeight: 700,
    opacity: 0.45,
  },
  whyText: {
  fontSize: '14px',
  color: '#D4AF64',
  fontFamily: 'Georgia, serif',
  fontStyle: 'italic',
  lineHeight: 1.75,
  margin: 0,
  whiteSpace: 'pre-wrap',
  letterSpacing: '0.01em',
},
  whyFooter: {
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '1rem',
  paddingTop: '0.875rem',
  borderTop: '0.5px solid rgba(212,175,100,0.2)',
},
  whyLink: {
  background: 'transparent', border: 'none', padding: 0,
  color: '#D4AF64', fontSize: '12px',
  fontWeight: 500, cursor: 'pointer',
  fontFamily: 'inherit',
  letterSpacing: '0.02em',
},
whyLinkMuted: {
  background: 'transparent', border: 'none', padding: 0,
  color: 'rgba(212,175,100,0.55)', fontSize: '12px',
  cursor: 'pointer', fontFamily: 'inherit',
  textDecoration: 'underline', textUnderlineOffset: '2px',
  letterSpacing: '0.02em',
},
  whyEmptyBtn: {
    width: '100%',
    padding: '20px',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F6EFDD 100%)',
    border: '1px dashed #C9B894',
    borderRadius: '16px',
    color: '#854F0B', cursor: 'pointer',
    fontFamily: 'Georgia, serif', fontSize: '13px',
    fontWeight: 500, fontStyle: 'italic',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  whyEditCard: {
    background: 'white',
    border: '0.5px solid #E8DCC2',
    borderRadius: '16px',
    padding: '14px',
  },
  whyTextarea: {
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    border: '0.5px solid #DDCFB6', background: '#FDFBF6',
    fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif',
    boxSizing: 'border-box', outline: 'none', minHeight: '140px',
    resize: 'vertical', lineHeight: 1.6, fontStyle: 'italic',
  },
  whyEditActions: {
    display: 'flex', justifyContent: 'flex-end', gap: '8px',
    marginTop: '10px',
  },
  btnGhost: {
    padding: '7px 14px', borderRadius: '999px',
    background: 'transparent', color: '#6B5C4A',
    border: '0.5px solid #DDCFB6',
    fontSize: '12px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  btnDark: {
    padding: '7px 16px', borderRadius: '999px',
    background: '#3A2A1C', color: '#FAF7F1',
    border: 'none',
    fontSize: '12px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
  },

  // TRACKER CHIPS
  trackerChips: {
    display: 'flex', gap: '6px', flexWrap: 'wrap',
  },
  chip: {
    padding: '7px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '999px',
    fontSize: '12px', color: '#9C8C78',
    cursor: 'pointer', fontFamily: 'inherit',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  chipActive: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: '0.5px solid #241710',
    boxShadow: '0 2px 6px rgba(40,25,10,0.2)',
  },

  // METRICS
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  metricCard: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '0.5px solid #E8DCC2',
    borderRadius: '14px',
    padding: '14px',
  },
  metricValue: {
    fontSize: '22px', fontWeight: 500, color: '#2A1F15',
    margin: 0, fontFamily: 'Georgia, serif',
    fontVariantNumeric: 'tabular-nums', lineHeight: 1.1,
  },
  metricLabel: {
    fontSize: '10px', color: '#8A7B6A',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    margin: '4px 0 0', fontWeight: 500,
  },

  // HARD MOMENTS
  hardMomentsBar: {
    background: 'white', border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '14px',
  },
  hardLine: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'baseline', marginBottom: '8px',
  },
  hardLabel: {
    fontSize: '12px', color: '#6B5C4A', fontWeight: 500,
  },
  hardPct: {
    fontSize: '17px', fontWeight: 500, color: '#7A8C5A',
    fontFamily: 'Georgia, serif',
    fontVariantNumeric: 'tabular-nums',
  },
  barTrack: {
    height: '6px', background: '#EFE7D7',
    borderRadius: '3px', overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #7A8C5A 0%, #5A6B45 100%)',
    borderRadius: '3px',
    transition: 'width 0.4s ease-out',
  },
  hardSub: {
    fontSize: '10px', color: '#9C8C78',
    margin: '6px 0 0', fontStyle: 'italic',
  },

  // HISTORY LINKS
  historyLinks: {
    background: 'white', border: '0.5px solid #E8DFD0',
    borderRadius: '14px', overflow: 'hidden',
  },
  linkRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    width: '100%', padding: '14px 16px',
    background: 'transparent', border: 'none',
    cursor: 'pointer', fontFamily: 'inherit',
    textAlign: 'left',
  },
  linkIcon: { fontSize: '17px', flexShrink: 0 },
  linkLabel: { fontSize: '14px', color: '#2A1F15', flex: 1, fontWeight: 500 },
  linkCount: {
    fontSize: '12px', color: '#9C8C78',
    background: '#F4ECDD',
    padding: '2px 10px', borderRadius: '999px',
    fontWeight: 500,
  },
  linkArrow: { color: '#9C8C78', fontSize: '18px', flexShrink: 0 },
  linkDivider: { height: '0.5px', background: '#EFE7D7', margin: '0 16px' },

  // TAB BAR
  tabRow: {
    display: 'flex', gap: '4px', padding: '6px',
    background: 'white', borderRadius: '16px',
    border: '0.5px solid #E8DFD0',
    boxShadow: '0 4px 14px rgba(80,50,20,0.05)',
    marginTop: '0.5rem',
  },
  tab: {
    flex: 1, padding: '9px 4px', textAlign: 'center',
    fontSize: '11px', color: '#9C8C78', borderRadius: '10px',
    background: 'transparent', border: 'none',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  tabActive: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #EFE5D0 100%)',
    color: '#2A1F15', fontWeight: 500,
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)',
  },

  // MODAL
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(40,25,15,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', zIndex: 100,
    backdropFilter: 'blur(4px)',
  },
  modalCard: {
    background: '#FAF7F1', maxWidth: '360px', width: '100%',
    borderRadius: '20px', padding: '1.5rem',
    boxShadow: '0 20px 60px rgba(40,25,15,0.3)',
  },
  modalTitle: {
    fontSize: '17px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 1rem', fontFamily: 'Georgia, serif',
  },
  settingsRow: {
    display: 'flex', justifyContent: 'space-between',
    width: '100%', padding: '14px 4px',
    border: 'none', background: 'transparent',
    fontSize: '13px', color: '#2A1F15',
    cursor: 'pointer', fontFamily: 'inherit',
    textAlign: 'left',
  },
  settingsDivider: { height: '0.5px', background: '#EFE7D7', margin: '0 4px' },
  modalClose: {
    width: '100%', padding: '12px',
    background: 'white', color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
    marginTop: '1rem',
  },
}