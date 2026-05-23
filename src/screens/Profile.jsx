import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../LanguageContext'
import { supabase } from '../supabaseClient'
import BottomNav from '../components/BottomNav'

const STAGE_LABELS = {
  notice: 'Notice',
  reflect: 'Reflect',
  commit: 'Commit',
  endure: 'Endure',
  build: 'Build',
  reclaim: 'Reclaim',
}

// Profile stage navigator — like the picker, but it CAN show Reclaim and it
// respects the 30-day Build gate. Order is the journey order.
const STAGE_META = [
  { key: 'notice',  label: 'Notice',  icon: '👁', desc: 'Just watching the pattern. No pressure to change yet.' },
  { key: 'reflect', label: 'Reflect', icon: '🔍', desc: 'Looking honestly at what it is costing you.' },
  { key: 'commit',  label: 'Commit',  icon: '🤝', desc: 'Getting ready. Building toward a stop date.' },
  { key: 'endure',  label: 'Endure',  icon: '🛡', desc: 'The early stretch. Holding the line, day by day.' },
  { key: 'build',   label: 'Build',   icon: '🌱', desc: 'Past the acute phase. Building the life around it.' },
  { key: 'reclaim', label: 'Reclaim', icon: '🌊', desc: 'Back after a slip. Nothing you built is lost.' },
]

export default function Profile() {
  const { lang, setLang } = useLang()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stage, setStage] = useState(null)
  const [loading, setLoading] = useState(true)

  const [editingName, setEditingName] = useState(false)
  const [editingWhy, setEditingWhy] = useState(false)
  const [showFullWhy, setShowFullWhy] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [whyDraft, setWhyDraft] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showStages, setShowStages] = useState(false)
  const [tracker, setTracker] = useState(null)
  const [moving, setMoving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        if (!u) { navigate('/signup'); return }
        setUser(u)

        const { data: p } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .maybeSingle()
        setProfile(p)
        setNameDraft(p?.full_name || '')
        setWhyDraft(p?.bio || '')

        const { data: vpp } = await supabase
          .from('vow_path_progress')
          .select('free_state')
          .eq('user_id', u.id)
          .maybeSingle()
        if (vpp?.free_state) setStage(vpp.free_state)

        const { data: trk } = await supabase
          .from('trackers')
          .select('id, start_date')
          .eq('user_id', u.id)
          .eq('is_active', true)
          .order('created_at')
          .limit(1)
        if (trk && trk[0]) setTracker(trk[0])
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

  const daysOnTracker = tracker?.start_date
    ? Math.floor((Date.now() - new Date(tracker.start_date).getTime()) / 86400000)
    : 0
  const buildUnlocked = stage === 'build' || stage === 'reclaim' || daysOnTracker >= 30

  const goToStage = async (target) => {
    if (moving || target === stage) { setShowStages(false); return }
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) return

    // Build gate — same rule as the Endure home
    if (target === 'build' && !buildUnlocked) {
      alert(`Build unlocks once you have held 30 days in Endure. You are at ${daysOnTracker} of 30.`)
      return
    }

    // Reclaim — nudge that slips are tracked better via the slip button
    if (target === 'reclaim') {
      const ok = window.confirm(`Slips get tracked properly when you record them with the "I slipped" button on your Endure or Build page — that keeps your history and patterns accurate. Move to Reclaim anyway?`)
      if (!ok) return
      setMoving(true)
      await supabase.from('vow_path_progress')
        .update({ free_state: 'reclaim', endure_slip_count: 0, updated_at: new Date().toISOString() })
        .eq('user_id', u.id)
      navigate('/home', { replace: true })
      return
    }

    // Backward from a counter stage (Endure/Build) to an earlier stage
    const backward = (stage === 'endure' || stage === 'build')
      && (target === 'commit' || target === 'reflect' || target === 'notice')
    if (backward) {
      const toReclaim = window.confirm(`Going back usually follows a slip. Reclaim is the gentler space and it keeps your streak intact. Go to Reclaim instead?\n\nOK = go to Reclaim\nCancel = continue going back`)
      if (toReclaim) {
        setMoving(true)
        await supabase.from('vow_path_progress')
          .update({ free_state: 'reclaim', endure_slip_count: 0, updated_at: new Date().toISOString() })
          .eq('user_id', u.id)
        navigate('/home', { replace: true })
        return
      }
      const confirmReset = window.confirm(`Moving to ${STAGE_LABELS[target]} ends your current run — the counter starts fresh when you next enter Endure. Everything you've logged (urges, slips, your longest streak) stays saved. Continue?`)
      if (!confirmReset) return
      setMoving(true)
      if (tracker?.id) await supabase.from('trackers').update({ is_active: false }).eq('id', tracker.id)
      await supabase.from('vow_path_progress')
        .update({ free_state: target, endure_starts_at: null, endure_slip_count: 0, updated_at: new Date().toISOString() })
        .eq('user_id', u.id)
      navigate('/home', { replace: true })
      return
    }

    // Default forward / lateral. Moving to a no-counter stage resets the tracker.
    setMoving(true)
    const noCounterStage = target === 'notice' || target === 'reflect' || target === 'commit'
    if (noCounterStage && tracker?.id) {
      await supabase.from('trackers').update({ is_active: false }).eq('id', tracker.id)
    }
    const patch = { free_state: target, updated_at: new Date().toISOString() }
    if (noCounterStage) { patch.endure_starts_at = null; patch.endure_slip_count = 0 }
    await supabase.from('vow_path_progress').update(patch).eq('user_id', u.id)
    navigate('/home', { replace: true })
  }

  const resetLang = () => {
    localStorage.removeItem('vow_lang')
    setLang(null)
    navigate('/')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/welcome')
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, textAlign: 'center', color: '#9C8C78' }}>
          Loading...
        </div>
      </div>
    )
  }

  const fullBio = profile?.bio || ''
  const previewLength = Math.min(fullBio.length, 140)
  const bioPreview = fullBio.slice(0, previewLength).trim()
  const hasMore = fullBio.length > previewLength

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* TOP BAR */}
        <div style={styles.topBar}>
          <p style={styles.brandLine}>Vow</p>
          <button
            onClick={() => setShowSettings(true)}
            style={styles.gearBtn}
            aria-label="Settings"
          >
            ⚙
          </button>
        </div>

        {/* IDENTITY CARD */}
        <div style={styles.identityCard}>
          <div style={styles.avatar}>
            {(profile?.full_name || 'V').charAt(0).toUpperCase()}
          </div>
          <div style={styles.identityText}>
            {editingName ? (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  style={styles.inlineInput}
                  autoFocus
                />
                <button onClick={saveName} style={styles.miniBtn}>✓</button>
                <button
                  onClick={() => { setEditingName(false); setNameDraft(profile?.full_name || '') }}
                  style={styles.miniBtnSecondary}
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <div style={styles.nameLine}>
                  <span style={styles.nameText}>
                    {profile?.full_name || 'Your name'}
                  </span>
                  <button
                    onClick={() => setEditingName(true)}
                    style={styles.editIcon}
                    aria-label="Edit name"
                  >
                    ✎
                  </button>
                </div>
                <p style={styles.emailText}>{user?.email}</p>
                {stage && (
                  <span style={styles.stageBadge}>{STAGE_LABELS[stage]} path</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* WHY I STARTED */}
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
                <button
                  onClick={() => { setEditingWhy(false); setWhyDraft(profile?.bio || '') }}
                  style={styles.btnGhost}
                >
                  Cancel
                </button>
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
                <button onClick={() => setEditingWhy(true)} style={styles.whyLinkMuted}>
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditingWhy(true)} style={styles.whyEmptyBtn}>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>✎</span>
              Write your why
            </button>
          )}
        </div>

        {/* YOUR PATH */}
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Your path</p>
          <div style={styles.pathLinks}>
            <button
              onClick={() => setShowStages(s => !s)}
              style={styles.pathRow}
            >
              <div style={styles.pathRowText}>
                <p style={styles.pathRowLabel}>Move to a different stage</p>
                <p style={styles.pathRowHelper}>
                  Recovery isn't a straight line. Jump to where you actually are.
                </p>
              </div>
              <span style={styles.linkArrow}>{showStages ? '⌄' : '›'}</span>
            </button>

            {showStages && (
              <div style={styles.stageNav}>
                {STAGE_META.map(st => {
                  const isCurrent = st.key === stage
                  const locked = st.key === 'build' && !buildUnlocked
                  return (
                    <button
                      key={st.key}
                      onClick={() => goToStage(st.key)}
                      disabled={moving || isCurrent}
                      style={{ ...styles.stageRow, ...(isCurrent ? styles.stageRowCurrent : {}), ...(locked ? styles.stageRowLocked : {}) }}
                    >
                      <div style={{ ...styles.stageCircle, ...(isCurrent ? styles.stageCircleCurrent : {}) }}>
                        <span>{locked ? '🔒' : st.icon}</span>
                      </div>
                      <div style={styles.stageBand}>
                        <p style={styles.stageRowLabel}>
                          {st.label}
                          {isCurrent && <span style={styles.stageHereTag}> · you're here</span>}
                          {locked && <span style={styles.stageLockTag}> · unlocks at 30 days</span>}
                        </p>
                        <p style={styles.stageRowDesc}>{st.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            <div style={styles.linkDivider}></div>
            <button onClick={signOut} style={styles.pathRow}>
              <div style={styles.pathRowText}>
                <p style={{ ...styles.pathRowLabel, color: '#B23B3B' }}>Sign out</p>
              </div>
              <span style={styles.linkArrow}>›</span>
            </button>
          </div>
        </div>

        <BottomNav />

        {/* SETTINGS MODAL */}
        {showSettings && (
          <div style={styles.modal} onClick={() => setShowSettings(false)}>
            <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
              <p style={styles.modalTitle}>Settings</p>
              <button onClick={resetLang} style={styles.settingsRow}>
                <span>Language: {lang === 'hi' ? 'हिंदी' : 'English'}</span>
                <span style={{ color: '#9C8C78' }}>›</span>
              </button>
              <button onClick={() => setShowSettings(false)} style={styles.modalClose}>
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  stageNav: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' },
  stageRow: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', padding: '12px', background: '#FFFFFF', border: '0.5px solid #E8DFD0', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(80,50,20,0.04)' },
  stageRowCurrent: { background: 'linear-gradient(180deg, #FBF6EE 0%, #F4EAD8 100%)', border: '0.5px solid #D9C7A8', cursor: 'default' },
  stageRowLocked: { opacity: 0.72 },
  stageCircle: { width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: 'linear-gradient(180deg, #F4ECDD 0%, #EADFCB 100%)', border: '0.5px solid #E0D5C2' },
  stageCircleCurrent: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', border: '0.5px solid #241710' },
  stageBand: { flex: 1, minWidth: 0 },
  stageRowLabel: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 2px' },
  stageHereTag: { fontSize: '11px', color: '#854F0B', fontStyle: 'italic', fontWeight: 400 },
  stageLockTag: { fontSize: '11px', color: '#9C8C78', fontStyle: 'italic', fontWeight: 400 },
  stageRowDesc: { fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4, margin: 0 },
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
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '1.5rem 1.25rem 1.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  // TOP BAR
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  brandLine: {
    fontSize: '20px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: 0,
    fontFamily: 'Georgia, serif',
    letterSpacing: '-0.01em',
  },
  gearBtn: {
    width: '34px',
    height: '34px',
    background: 'rgba(232,223,208,0.4)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '50%',
    color: '#6B5C4A',
    fontSize: '15px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    flexShrink: 0,
  },

  // IDENTITY CARD
  identityCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '18px',
    boxShadow: '0 4px 16px rgba(80,50,20,0.05)',
  },
  avatar: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    flexShrink: 0,
    boxShadow: '0 3px 10px rgba(40,25,10,0.2)',
  },
  identityText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingTop: '2px',
  },
  nameLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  nameText: {
    fontSize: '17px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.005em',
  },
  emailText: {
    fontSize: '12px',
    color: '#9C8C78',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'Georgia, serif',
  },
  stageBadge: {
    display: 'inline-block',
    marginTop: '8px',
    padding: '3px 11px',
    background: 'rgba(133,79,11,0.08)',
    color: '#854F0B',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    borderRadius: '999px',
    fontFamily: 'Georgia, serif',
    border: '0.5px solid rgba(133,79,11,0.15)',
    alignSelf: 'flex-start',
  },
  editIcon: {
    background: 'transparent',
    border: 'none',
    color: '#9C8C78',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '0 4px',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  inlineInput: {
    flex: 1,
    padding: '6px 10px',
    borderRadius: '8px',
    border: '0.5px solid #DDCFB6',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    minWidth: 0,
  },
  miniBtn: {
    padding: '6px 10px',
    borderRadius: '8px',
    border: 'none',
    background: '#3A2A1C',
    color: '#FAF7F1',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '12px',
    flexShrink: 0,
  },
  miniBtnSecondary: {
    padding: '6px 10px',
    borderRadius: '8px',
    border: '0.5px solid #DDCFB6',
    background: 'white',
    color: '#2A1F15',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '12px',
    flexShrink: 0,
  },

  // SECTIONS
  section: {},
  sectionLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: '#9C8C78',
    margin: '0 0 10px',
    fontWeight: 500,
    paddingLeft: '4px',
    fontFamily: 'Georgia, serif',
  },

  // WHY SECTION
  whySection: {},
  whyCard: {
    background: 'linear-gradient(180deg, #2A1F15 0%, #1A1208 100%)',
    border: '0.5px solid #3A2A1C',
    borderRadius: '18px',
    padding: '1.5rem 1.5rem 1.25rem',
    boxShadow: '0 6px 20px rgba(20,12,5,0.25), inset 0 1px 0 rgba(212,175,100,0.08)',
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    paddingTop: '0.875rem',
    borderTop: '0.5px solid rgba(212,175,100,0.2)',
  },
  whyLink: {
    background: 'transparent',
    border: 'none',
    padding: 0,
    color: '#D4AF64',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.02em',
  },
  whyLinkMuted: {
    background: 'transparent',
    border: 'none',
    padding: 0,
    color: 'rgba(212,175,100,0.55)',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
    letterSpacing: '0.02em',
  },
  whyEmptyBtn: {
    width: '100%',
    padding: '24px',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F6EFDD 100%)',
    border: '1px dashed #C9B894',
    borderRadius: '18px',
    color: '#854F0B',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    fontSize: '14px',
    fontWeight: 500,
    fontStyle: 'italic',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyEditCard: {
    background: 'white',
    border: '0.5px solid #E8DCC2',
    borderRadius: '18px',
    padding: '14px',
  },
  whyTextarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '0.5px solid #DDCFB6',
    background: '#FDFBF6',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    boxSizing: 'border-box',
    outline: 'none',
    minHeight: '140px',
    resize: 'vertical',
    lineHeight: 1.6,
    fontStyle: 'italic',
  },
  whyEditActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '10px',
  },
  btnGhost: {
    padding: '8px 14px',
    borderRadius: '999px',
    background: 'transparent',
    color: '#6B5C4A',
    border: '0.5px solid #DDCFB6',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnDark: {
    padding: '8px 18px',
    borderRadius: '999px',
    background: '#3A2A1C',
    color: '#FAF7F1',
    border: 'none',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  // YOUR PATH
  pathLinks: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(80,50,20,0.04)',
  },
  pathRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '16px 18px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  pathRowText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  pathRowLabel: {
    fontSize: '14px',
    color: '#2A1F15',
    fontWeight: 500,
    margin: 0,
    fontFamily: 'Georgia, serif',
    lineHeight: 1.3,
  },
  pathRowHelper: {
    fontSize: '11px',
    color: '#9C8C78',
    fontStyle: 'italic',
    margin: 0,
    fontFamily: 'Georgia, serif',
    lineHeight: 1.4,
  },
  linkArrow: {
    color: '#9C8C78',
    fontSize: '18px',
    flexShrink: 0,
  },
  linkDivider: {
    height: '0.5px',
    background: '#EFE7D7',
    margin: '0 18px',
  },

  // MODAL
  modal: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(40,25,15,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 100,
    backdropFilter: 'blur(4px)',
  },
  modalCard: {
    background: '#FAF7F1',
    maxWidth: '360px',
    width: '100%',
    borderRadius: '20px',
    padding: '1.5rem',
    boxShadow: '0 20px 60px rgba(40,25,15,0.3)',
  },
  modalTitle: {
    fontSize: '17px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: '0 0 1rem',
    fontFamily: 'Georgia, serif',
  },
  settingsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '14px 4px',
    border: 'none',
    background: 'transparent',
    fontSize: '13px',
    color: '#2A1F15',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  modalClose: {
    width: '100%',
    padding: '12px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: '1rem',
  },
}