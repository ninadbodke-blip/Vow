import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../LanguageContext'
import { supabase } from '../supabaseClient'
import BottomNav from '../components/BottomNav'
import VowBrandMark from '../components/VowBrandMark'
import { resolveAddictionTypeId } from './vowPath/utils/addictionTypes'

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
  const [sheet, setSheet] = useState(null)
  const [stopDateISO, setStopDateISO] = useState(null)
  const [primarySubstance, setPrimarySubstance] = useState(null)
  const [hasBegunEndure, setHasBegunEndure] = useState(false)

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
          .select('free_state, endure_starts_at, primary_substance')
          .eq('user_id', u.id)
          .maybeSingle()
        if (vpp?.free_state) setStage(vpp.free_state)
        if (vpp) {
          setStopDateISO(vpp.endure_starts_at || null)
          setPrimarySubstance(vpp.primary_substance || null)
        }

        const { data: trk } = await supabase
          .from('trackers')
          .select('id, start_date')
          .eq('user_id', u.id)
          .eq('is_active', true)
          .order('created_at')
          .limit(1)
        if (trk && trk[0]) setTracker(trk[0])

        // Has Endure already begun at least once? If so, returning to Endure
        // after looking around an earlier stage must RESUME the live streak —
        // never restart the clock or relock Build. Onboarding activates the
        // tracker, so is_active alone can't tell us this; we look for real
        // Endure history (current stage, the begin-marker, or any endure/build signal).
        let begun = vpp?.free_state === 'endure' || vpp?.free_state === 'build'
        if (!begun) {
          const { data: ev } = await supabase
            .from('free_stage_signals')
            .select('id')
            .eq('user_id', u.id)
            .or('signal_type.eq.endure_began,stage.eq.endure,stage.eq.build')
            .limit(1)
          begun = !!(ev && ev.length)
        }
        setHasBegunEndure(begun)
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

  // Perform a stage change. reset=true deactivates the tracker + clears the
  // current run (genuine slip). reset=false preserves the counter (curiosity).
  const applyStage = async (target, { reset = false } = {}) => {
    if (moving) return
    setMoving(true)
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) { setMoving(false); return }
    if (reset && tracker?.id) {
      await supabase.from('trackers').update({ is_active: false }).eq('id', tracker.id)
    }
    const patch = { free_state: target, updated_at: new Date().toISOString() }
    if (reset) { patch.endure_starts_at = null; patch.endure_slip_count = 0 }
    if (target === 'reclaim') patch.endure_slip_count = 0
    await supabase.from('vow_path_progress').update(patch).eq('user_id', u.id)
    navigate('/home', { replace: true })
  }

  // Entering Endure is a real start, never a peek: (re)activate the tracker so
  // the day-one clock begins. Mirrors the Commit home's Begin Endure.
  const beginEndureFromCommit = async () => {
    if (moving) return
    setMoving(true)
    try {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { setMoving(false); return }
      const now = new Date().toISOString()
      const addictionTypeId = await resolveAddictionTypeId(primarySubstance)

      // Find a tracker to (re)start: prefer the one for this substance, else the
      // user's most recent tracker — so the counter always has something to run on.
      let trackerId = null
      if (addictionTypeId != null) {
        const { data: byType } = await supabase.from('trackers').select('id')
          .eq('user_id', u.id).eq('addiction_type_id', addictionTypeId).order('created_at')
        if (byType && byType.length > 0) trackerId = byType[0].id
      }
      if (!trackerId) {
        const { data: anyTrk } = await supabase.from('trackers').select('id')
          .eq('user_id', u.id).order('created_at')
        if (anyTrk && anyTrk.length > 0) trackerId = anyTrk[0].id
      }

      if (trackerId) {
        const { error: tErr } = await supabase.from('trackers')
          .update({ start_date: now, is_active: true, tracker_status: 'active' })
          .eq('id', trackerId)
        if (tErr) console.error('tracker reactivate failed:', tErr)
      } else if (addictionTypeId != null) {
        const { error: iErr } = await supabase.from('trackers')
          .insert({ user_id: u.id, addiction_type_id: addictionTypeId, start_date: now, is_active: true, tracker_status: 'active' })
        if (iErr) console.error('tracker insert failed:', iErr)
      }

      const { error: pErr } = await supabase.from('vow_path_progress')
        .update({ free_state: 'endure', endure_starts_at: null, endure_slip_count: 0, updated_at: now })
        .eq('user_id', u.id)
      if (pErr) {
        console.error('free_state update failed:', pErr)
        alert('Could not start Endure: ' + (pErr.message || 'please try again.'))
        setMoving(false)
        return
      }
      // Mark that Endure has genuinely begun — future re-entries will RESUME this
      // streak instead of restarting it. Generic signal, no migration. Best-effort.
      await supabase.from('free_stage_signals').insert({
        user_id: u.id, stage: 'endure', signal_type: 'endure_began', payload: { began_at: now },
      })
      navigate('/home', { replace: true })
    } catch (err) {
      console.error(err)
      alert('Could not start Endure. Please try again.')
      setMoving(false)
    }
  }

  // Resume Endure WITHOUT restarting the clock. Used when a live streak already
  // exists — the user reached Endure/Build, wandered back to an earlier stage to
  // look around, and is now returning. start_date is left untouched, so the
  // streak continues unbroken and Build stays unlocked.
  const resumeEndure = async () => {
    if (moving) return
    setMoving(true)
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) { setMoving(false); return }
    if (tracker?.id) {
      await supabase.from('trackers')
        .update({ is_active: true, tracker_status: 'active' })
        .eq('id', tracker.id)
    }
    await supabase.from('vow_path_progress')
      .update({ free_state: 'endure', updated_at: new Date().toISOString() })
      .eq('user_id', u.id)
    navigate('/home', { replace: true })
  }

  const goToStage = (target) => {
    if (moving || target === stage) { setShowStages(false); return }

    // From Reclaim, every move is frictionless (re-entry after a slip). Endure
    // still (re)starts the clock for real; everything else just switches.
    if (stage === 'reclaim') {
      if (target === 'endure') { beginEndureFromCommit(); return }
      applyStage(target, { reset: false })
      return
    }

    // Build gate — same rule as the Endure home
    if (target === 'build' && !buildUnlocked) {
      setSheet({
        title: 'Build is still locked',
        body: `Build opens once you've held 30 days in Endure. You're at ${daysOnTracker} of 30 — keep going.`,
        actions: [{ label: 'Got it', run: () => setSheet(null) }],
      })
      return
    }

    // Reclaim — nudge that slips track better via the slip button
    if (target === 'reclaim') {
      setSheet({
        title: 'Moving to Reclaim',
        body: `Slips get tracked best when you log them with the "I slipped" button on your Endure or Build page — that keeps your history accurate. Move to Reclaim anyway?`,
        actions: [
          { label: 'Move to Reclaim', primary: true, run: () => applyStage('reclaim') },
          { label: 'Not now', run: () => setSheet(null) },
        ],
      })
      return
    }

    // Into Endure.
    if (target === 'endure') {
      // A live streak already running + Endure begun before → this is a RESUME
      // after exploring an earlier stage. Keep the clock, no ceremony, no relock.
      if (tracker && hasBegunEndure) { resumeEndure(); return }

      // Genuine first start — the line-in-the-sand ceremony, which starts the
      // clock for real. Applaud the move; warn if they're jumping ahead of their
      // chosen stop date.
      const stopMs = (stage === 'commit' && stopDateISO)
        ? new Date(stopDateISO + 'T00:00:00').getTime() : null
      const beforeStop = stopMs != null && stopMs > Date.now()
      setSheet({
        title: beforeStop ? 'Going early? Then go.' : 'Ready to begin Endure?',
        body: beforeStop
          ? `You're stepping into Endure ahead of your stop date — and honestly, that's a bold, brilliant move. The second you confirm, your day-one clock starts for real. This isn't a look-around; it's your line in the sand. Claim it.`
          : `The moment you confirm, your day-one clock starts ticking. This is the real beginning — not a place to peek at. Ready to step in?`,
        actions: [
          { label: beforeStop ? 'Yes — start my clock now' : 'Begin Endure', primary: true, run: () => beginEndureFromCommit() },
          { label: 'Not yet', run: () => setSheet(null) },
        ],
      })
      return
    }

    // Backward from a counter stage — curiosity vs a genuine slip
    const backward = (stage === 'endure' || stage === 'build')
      && (target === 'commit' || target === 'reflect' || target === 'notice')
    if (backward) {
      setSheet({
        title: `Heading to ${STAGE_LABELS[target]}?`,
        body: `If you're just curious about this stage, look around — your Endure progress stays exactly where it is. If you slipped, Reclaim is the gentler place to land, and it keeps your streak too.`,
        actions: [
          { label: 'Just exploring — keep my progress', primary: true, run: () => applyStage(target, { reset: false }) },
          { label: 'I slipped → go to Reclaim', run: () => applyStage('reclaim') },
          { label: `I slipped → reset & go to ${STAGE_LABELS[target]}`, danger: true, run: () => applyStage(target, { reset: true }) },
          { label: 'Cancel', run: () => setSheet(null) },
        ],
      })
      return
    }

    // Default forward / lateral — no reset
    applyStage(target, { reset: false })
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
          <VowBrandMark />
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

        {sheet && (
          <div style={styles.sheetOverlay} onClick={() => { if (!moving) setSheet(null) }}>
            <div style={styles.sheetCard} onClick={(e) => e.stopPropagation()}>
              <h3 style={styles.sheetTitle}>{sheet.title}</h3>
              <p style={styles.sheetBody}>{sheet.body}</p>
              <div style={styles.sheetActions}>
                {sheet.actions.map((a, i) => (
                  <button
                    key={i}
                    onClick={a.run}
                    disabled={moving}
                    style={{ ...styles.sheetBtn, ...(a.primary ? styles.sheetBtnPrimary : a.danger ? styles.sheetBtnDanger : styles.sheetBtnGhost) }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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
  sheetOverlay: { position: 'fixed', inset: 0, background: 'rgba(36,23,16,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 },
  sheetCard: { width: '100%', maxWidth: '440px', background: '#FAF7F1', borderRadius: '24px 24px 0 0', padding: '24px 22px 28px', boxShadow: '0 -8px 40px rgba(40,25,10,0.25)' },
  sheetTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 10px' },
  sheetBody: { fontSize: '14.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 20px' },
  sheetActions: { display: 'flex', flexDirection: 'column', gap: '10px' },
  sheetBtn: { width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: 'none' },
  sheetBtnPrimary: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', boxShadow: '0 4px 14px rgba(40,25,10,0.22)' },
  sheetBtnDanger: { background: '#FBF1EC', color: '#B23B1E', border: '0.5px solid #E6C3B4' },
  sheetBtnGhost: { background: 'white', color: '#6B5C4A', border: '0.5px solid #DDCFB6' },
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