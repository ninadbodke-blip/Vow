import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import BottomNav from '../../components/BottomNav'
import SheetPortal from '../../components/SheetPortal'
import VowBrandMark from '../../components/VowBrandMark'
import CoachMark from '../../components/CoachMark'
import DailyCheckin from '../freeHome/DailyCheckin'
import UrgeFlow from '../UrgeFlow'
import SlipFlow from '../SlipFlow'
import TreeHero from './TreeHero'
import { modeFor, JOURNAL } from './modes'
import SetYourDay from './practices/SetYourDay'
import StageWayfinder from '../freeHome/StageWayfinder'
import VowPathInvite from '../freeHome/VowPathInvite'
import { createStageMove } from '../freeHome/stageMove'
import { UrgeWavesGlyph, SlipRiseGlyph, AnchorGlyph, MilestoneGlyph } from './glyphs'

// ===================================================================
// HOME SHELL — one home for every free mode.
// ===================================================================
// Layout: eyebrow + greeting → THE TREE (tend = check-in) → today's
// practice + a glyph-tile row of all practices → "In the moment"
// (urge/slip opened as floating cards, not new screens) → anchors &
// milestones rows → one surfacing line when earned.
// ===================================================================

function localDateStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const dayOfYear = () => {
  const now = new Date()
  return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
}

const CONTEXT_WORDS = {
  stress: 'Stress', lonely: 'Feeling alone', bored: 'Boredom', social: 'Being out with people',
  tired: 'Tiredness', conflict: 'Arguments', restless: 'Restlessness', celebration: 'Celebration',
}

const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

function PracticeSheet({ open, onClose, eyebrow, title, children }) {
  if (!open) return null
  return (
    <SheetPortal>
      <div style={styles.sheetOverlay} onClick={onClose}>
        <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
          <div style={styles.sheetHandle} />
          <p style={styles.sheetEyebrow}>{eyebrow}</p>
          <h2 style={styles.sheetTitle}>{title}</h2>
          <div style={styles.sheetBody}>{children}</div>
          <button onClick={onClose} style={styles.sheetClose}>Close</button>
        </div>
      </div>
    </SheetPortal>
  )
}

// The urge/slip flows, floating over the home instead of replacing it.
function FlowCard({ open, onClose, children }) {
  if (!open) return null
  return (
    <SheetPortal>
      <div style={styles.flowOverlay}>
        <div style={styles.flowCard}>
          <button onClick={onClose} style={styles.flowClose} aria-label="Close">×</button>
          <div style={styles.flowScroll}>{children}</div>
        </div>
      </div>
    </SheetPortal>
  )
}

export default function HomeShell({ progress }) {
  const navigate = useNavigate()
  const freeState = progress?.free_state || 'notice'
  const mode = modeFor(freeState)

  const [firstName, setFirstName] = useState('')
  const [userId, setUserId] = useState('vow')
  const [tracker, setTracker] = useState(null)
  const [todayCheckin, setTodayCheckin] = useState(null)
  const [checkinCount, setCheckinCount] = useState(0)
  const [recentCheckins, setRecentCheckins] = useState([])
  const [anchor, setAnchor] = useState(null)
  const [slipCount, setSlipCount] = useState(progress?.endure_slip_count || 0)
  const [commitTarget, setCommitTarget] = useState(null)

  // The chosen day-one date (from "Your vow & your day") powers the
  // countdown ticker under the tree in Getting ready. Re-fetched when
  // a practice sheet closes, so setting the date updates it live.
  const refreshCommitTarget = async () => {
    if (freeState !== 'commit') { setCommitTarget(null); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('free_stage_signals')
      .select('payload')
      .eq('user_id', user.id)
      .eq('signal_type', 'commit_start_date')
      .order('created_at', { ascending: false })
      .limit(1)
    setCommitTarget(data?.[0]?.payload?.date || null)
  }
  useEffect(() => { refreshCommitTarget() }, [freeState])
  const [loading, setLoading] = useState(true)

  const [checkinOpen, setCheckinOpen] = useState(false)
  const [openPractice, setOpenPractice] = useState(null)   // a practice object
  const [flowOpen, setFlowOpen] = useState(null)           // 'urge' | 'slip' | null
  const [movingToReclaim, setMovingToReclaim] = useState(false)
  const [stageSheet, setStageSheet] = useState(null)

  // ---- Guided tour (coach marks) ----
  const treeRef = useRef(null)
  const wayfinderRef = useRef(null)
  const todayRef = useRef(null)
  const journalRef = useRef(null)
  const toolsRef = useRef(null)
  const yoursRef = useRef(null)
  const vowPathRef = useRef(null)
  const [tourOpen, setTourOpen] = useState(false)

  // Show the tour once, on first arrival, gated by a DB flag (home_oriented).
  useEffect(() => {
    let cancelled = false
    async function maybeStartTour() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return
      const { data } = await supabase
        .from('vow_path_progress')
        .select('home_oriented')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!cancelled && data && !data.home_oriented) {
        // small delay so the home has painted before we measure targets
        setTimeout(() => { if (!cancelled) setTourOpen(true) }, 600)
      }
    }
    maybeStartTour()
    return () => { cancelled = true }
  }, [])

  const finishTour = useCallback(async () => {
    setTourOpen(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('vow_path_progress')
        .update({ home_oriented: true })
        .eq('user_id', user.id)
    }
  }, [])

  // Steps are built after render values exist (see `tourSteps` below return guard).

  async function loadAll(silent = false) {
    if (!silent) setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const { data: vppRow } = await supabase
      .from('vow_path_progress').select('endure_slip_count')
      .eq('user_id', user.id).maybeSingle()
    if (vppRow) setSlipCount(vppRow.endure_slip_count || 0)

    const { data: profile } = await supabase
      .from('profiles').select('first_name, full_name')
      .eq('id', user.id).maybeSingle()
    if (profile?.first_name) setFirstName(profile.first_name)
    else if (profile?.full_name) setFirstName(profile.full_name.split(' ')[0])
    else if (user.email) setFirstName(user.email.split('@')[0])

    const { data: trackers } = await supabase
      .from('trackers')
      .select(`*, addiction_types (id, name, icon), tracker_savings (savings_type, per_day_amount)`)
      .eq('user_id', user.id).eq('is_active', true).order('created_at')
    setTracker(trackers && trackers.length > 0 ? trackers[0] : null)

    const { data: tc } = await supabase
      .from('free_daily_checkins').select('*')
      .eq('user_id', user.id).eq('checkin_date', localDateStr()).maybeSingle()
    setTodayCheckin(tc || null)

    const { count } = await supabase
      .from('free_daily_checkins').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if (typeof count === 'number') setCheckinCount(count)

    const { data: recents } = await supabase
      .from('free_daily_checkins').select('felt_pull, contexts, checkin_date')
      .eq('user_id', user.id).order('checkin_date', { ascending: false }).limit(14)
    if (recents) setRecentCheckins(recents)

    const { data: anchors } = await supabase
      .from('anchors').select('name')
      .eq('user_id', user.id).order('position').limit(1)
    setAnchor(anchors && anchors.length > 0 ? anchors[0] : null)

    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckinSaved = (row) => {
    const isNewToday = !todayCheckin
    setTodayCheckin(row)
    if (isNewToday) setCheckinCount(c => c + 1)   // the tree grows
  }

  const closeFlow = () => {
    setFlowOpen(null)
    loadAll(true)   // tracker, slip count, free_state may all have changed
  }

  // Reclaim move routes through the shared engine (one source of truth for the
  // counter reset + the styled confirm sheet). This button is the slip-driven
  // path (3 slips), which the engine's "Getting back up" sheet frames correctly.
  const emDaysOnTracker = tracker?.start_date
    ? Math.floor((Date.now() - new Date(tracker.start_date).getTime()) / 86400000)
    : 0
  const goToStage = createStageMove({
    stage: freeState,
    tracker,
    hasBegunEndure: freeState === 'endure' || freeState === 'build',
    stopDateISO: null,
    primarySubstance: progress?.primary_substance || null,
    daysOnTracker: emDaysOnTracker,
    buildUnlocked: freeState === 'build' || emDaysOnTracker >= 30,
    moving: movingToReclaim,
    setMoving: setMovingToReclaim,
    setSheet: setStageSheet,
    navigate: () => window.location.assign('/app/home'),
  })
  const handleMoveToReclaim = () => goToStage('reclaim')
  if (loading) {
    return <div style={styles.frame}><div style={styles.loadingCard}>Loading...</div></div>
  }

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const daysFree = tracker ? Math.floor((Date.now() - new Date(tracker.start_date).getTime()) / 86400000) : null

  const tools = mode.tools || []

  // ---- one surfacing line, only when the data has earned it ----
  let surfacing = null
  const pulledDays = recentCheckins.filter(r => r.felt_pull)
  if (pulledDays.length >= 3) {
    const freq = {}
    for (const r of pulledDays) for (const c of (r.contexts || [])) {
      if (c === 'nothing') continue
      freq[c] = (freq[c] || 0) + 1
    }
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]
    if (top && top[1] >= 3 && CONTEXT_WORDS[top[0]]) {
      surfacing = `${CONTEXT_WORDS[top[0]]} was around ${top[1]} of your last ${pulledDays.length} urges.`
    }
  }
  if (!surfacing && checkinCount >= 7) {
    surfacing = `You’ve checked in ${checkinCount} times. Patterns are forming.`
  }

  // ---- Guided tour steps (home screen). Only include steps whose target
  // actually renders in this mode, so no arrow ever points at nothing. ----
  const tourSteps = [
    {
      ref: treeRef,
      title: 'This is your tree.',
      body: 'It grows as you show up. Tap it each day to check in — just a quick note on how you’re doing. That’s the heart of it.',
      placement: 'bottom',
    },
    {
      ref: wayfinderRef,
      title: 'Where you are right now.',
      body: 'Recovery has stages. Tap here any time to see them all and move between them as things change for you.',
      placement: 'bottom',
    },
    ...(mode.daily ? [{
      ref: todayRef,
      title: 'Today’s little thing.',
      body: 'One short activity for today — a couple of minutes. Small, doable, and made for the stage you’re in.',
      placement: 'top',
    }] : []),
    {
      ref: journalRef,
      title: 'Write it out.',
      body: 'A private space to put down whatever’s on your mind. No rules — just your words, whenever you need them.',
      placement: 'top',
    },
    ...(tools.length > 0 ? [{
      ref: toolsRef,
      title: 'Tools for right now.',
      body: 'Quick things you can reach for when you need a hand. Come back to these whenever a moment gets hard.',
      placement: 'top',
    }] : []),
    {
      ref: yoursRef,
      title: 'Yours to keep.',
      body: 'The people you’re doing this for, and the milestones you earn along the way. They stay yours, no matter what.',
      placement: 'top',
    },
    {
      ref: vowPathRef,
      title: 'Ready for more?',
      body: 'The Vow Path is a deeper, day-by-day journey — hands-on tools and proven, science-backed techniques to guide your recovery. Open it whenever you’re ready.',
      placement: 'top',
    },
  ]

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* TOP */}
        <div style={styles.topBar}>
          <span ref={wayfinderRef}><StageWayfinder progress={progress} /></span>
          <span style={styles.brandCenter}><VowBrandMark size={17} /></span>
          <button onClick={() => navigate('/app/profile')} style={styles.iconBtn} aria-label="Profile">
            <ProfileIcon />
          </button>
        </div>
        <h1 style={styles.greeting}>{greet}{firstName ? `, ${firstName}` : ''}.</h1>

        {/* THE TREE */}
        <div ref={treeRef}>
        <TreeHero
          seed={userId}
          mode={freeState}
          count={checkinCount}
          counter={mode.counter}
          daysFree={daysFree}
          trackerStartISO={tracker?.start_date || null}
          commitTargetISO={commitTarget}
          onSetDay={() => setOpenPractice({ id: 'set_day', title: 'Day one', minutes: 1, Component: SetYourDay, Glyph: null, eyebrow: 'Your day' })}
          trackerId={tracker?.id || null}
          onStartChanged={(iso) => setTracker((p) => (p ? { ...p, start_date: iso } : p))}
          tendedToday={!!todayCheckin}
          onTend={() => setCheckinOpen(true)}
        />
        </div>

        {/* no tracker yet, in a day-count mode */}
        {mode.counter === 'days' && !tracker && (
          <button onClick={() => navigate('/app/onboarding/setup')} style={styles.setupCard}>
            <p style={styles.setupTitle}>Start your day count</p>
            <p style={styles.setupSub}>A quiet counter from the day you stopped. Two minutes to set up →</p>
          </button>
        )}

        {/* TODAY — this mode's own daily, then the journal, then the mode's tools */}
        {mode.daily && (
          <>
            <p style={styles.sectionLabel}>Today</p>
            <button ref={todayRef} onClick={() => setOpenPractice({ ...mode.daily, eyebrow: 'Today' })} style={styles.practiceCard}>
              <span style={styles.practiceGlyph}>{mode.daily.Glyph && <mode.daily.Glyph />}</span>
              <span style={styles.practiceText}>
                <span style={styles.practiceTitle}>{mode.daily.title}</span>
                <span style={styles.practiceLine}>{mode.daily.line} · {mode.daily.minutes} min</span>
              </span>
              <span style={styles.practiceArrow}>›</span>
            </button>
          </>
        )}

        {/* IN YOUR WORDS — the journal, its own long bar */}
        <button ref={journalRef} onClick={() => setOpenPractice({ ...JOURNAL, eyebrow: 'In your words' })} style={styles.journalBar}>
          <span style={styles.journalGlyph}><JOURNAL.Glyph /></span>
          <span style={styles.practiceText}>
            <span style={styles.journalTitle}>{JOURNAL.title}</span>
            <span style={styles.practiceLine}>{JOURNAL.line}</span>
          </span>
          <span style={styles.practiceArrow}>›</span>
        </button>

        {/* TOOLS — the mode's three */}
        {tools.length > 0 && (
          <>
            <p style={styles.sectionLabel}>Tools</p>
            <div ref={toolsRef} style={styles.practiceGrid}>
              {tools.map(p => (
                <button key={p.id} onClick={() => setOpenPractice({ ...p, eyebrow: 'Tools' })} style={styles.miniTile}>
                  <span style={styles.miniGlyph}>{p.Glyph && <p.Glyph />}</span>
                  <span style={styles.miniTitle}>{p.title}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* IN THE MOMENT — the urge/slip flows, as floating cards */}
        {mode.inTheMoment && tracker && (
          <>
            <p style={styles.sectionLabel}>In the moment</p>
            <div style={styles.hitRow}>
              <button onClick={() => setFlowOpen('urge')} style={styles.hitCard}>
                <span style={styles.hitGlyph}><UrgeWavesGlyph /></span>
                <span style={styles.hitText}>
                  <span style={styles.hitTitle}>Ride the urge</span>
                  <span style={styles.hitSub}>Tools that work in minutes</span>
                </span>
              </button>
              <button onClick={() => setFlowOpen('slip')} style={styles.hitCard}>
                <span style={styles.hitGlyph}><SlipRiseGlyph /></span>
                <span style={styles.hitText}>
                  <span style={styles.hitTitle}>I slipped</span>
                  <span style={styles.hitSub}>Log it gently. Nothing is lost.</span>
                </span>
              </button>
            </div>
            {slipCount > 0 && slipCount < 3 && (
              <p style={styles.slipNote}>{slipCount} of 3 slips this stretch — still here, still counts.</p>
            )}
            {slipCount >= 3 && (
              <div style={styles.reclaimInvite}>
                <p style={styles.reclaimText}>
                  Three slips this stretch. That's not failure — it's a sign the ground shifted under you. There's a gentler place to regroup. The counter starts fresh there, but every milestone you've earned stays yours.
                </p>
                <button onClick={handleMoveToReclaim} disabled={movingToReclaim} style={styles.reclaimBtn}>
                  {movingToReclaim ? 'One moment…' : 'Step back and regroup'}
                </button>
              </div>
            )}
          </>
        )}

        {/* YOURS — anchors & milestones */}
        <p style={{ ...styles.sectionLabel, marginTop: '22px' }}>Yours</p>
        <div ref={yoursRef} style={{ ...styles.yoursGrid, gridTemplateColumns: tracker ? '1fr 1fr' : '1fr' }}>
          <button onClick={() => navigate('/app/anchors')} style={styles.yoursCard}>
            <span style={styles.yoursGlyph}><AnchorGlyph /></span>
            <span style={styles.yoursTitle}>Your anchors</span>
            <span style={styles.yoursSub}>{anchor ? `For ${anchor.name}, and the people who hold you to it` : 'The people you’re doing this for'}</span>
          </button>
          {tracker && (
            <button onClick={() => navigate(`/app/milestones/${tracker.id}`)} style={styles.yoursCard}>
              <span style={styles.yoursGlyph}><MilestoneGlyph /></span>
              <span style={styles.yoursTitle}>Milestones</span>
              <span style={styles.yoursSub}>What you’ve kept, marked along the way</span>
            </button>
          )}
        </div>
        {surfacing && (
          <button onClick={() => navigate('/app/mirror')} style={styles.surfacingRow}>
            {surfacing} →
          </button>
        )}

        <div ref={vowPathRef}>
        <VowPathInvite
          stage={freeState}
          variant={freeState === 'endure' ? 'moment' : 'calm'}
          momentLabel={freeState === 'endure' ? "You're holding the line" : undefined}
        />
        </div>

        <BottomNav />

        {/* Gentle guided tour — first visit, replayable via the "?" */}
        <CoachMark steps={tourSteps} open={tourOpen} onClose={finishTour} />
        {!tourOpen && (
          <button
            onClick={() => setTourOpen(true)}
            style={styles.tourReplay}
            aria-label="Show me around"
            title="Show me around"
          >
            ?
          </button>
        )}

        {stageSheet && (
          <SheetPortal>
            <div style={styles.sheetOverlay} onClick={() => { if (!movingToReclaim) setStageSheet(null) }}>
              <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
                <div style={styles.sheetHandle} />
                <h2 style={styles.sheetTitle}>{stageSheet.title}</h2>
                <p style={{ fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', lineHeight: 1.55, margin: '0 0 16px', textAlign: 'center' }}>{stageSheet.body}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {stageSheet.actions.map((a, i) => (
                    <button
                      key={i}
                      disabled={movingToReclaim}
                      onClick={() => { const fn = a.run; if (fn) fn() }}
                      style={{
                        width: '100%', padding: '13px', borderRadius: '11px', fontSize: '13.5px', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
                        ...(a.primary
                          ? { background: 'linear-gradient(180deg,#3A2A1C,#241710)', color: '#FAF7F1', border: 'none' }
                          : a.danger
                            ? { background: 'linear-gradient(180deg,#7A2E1C,#5A2014)', color: '#FAF7F1', border: 'none' }
                            : { background: 'transparent', color: '#854F0B', border: '0.5px solid #DDCFB6' }),
                      }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SheetPortal>
        )}
      </div>

      <DailyCheckin
        isOpen={checkinOpen}
        onClose={() => setCheckinOpen(false)}
        stage={freeState}
        includeBody={freeState === 'notice'}
        existing={todayCheckin}
        onSaved={handleCheckinSaved}
      />

      <PracticeSheet
        open={!!openPractice}
        onClose={() => { setOpenPractice(null); refreshCommitTarget() }}
        eyebrow={openPractice?.eyebrow || 'Practice'}
        title={openPractice?.title}
      >
        {openPractice && <openPractice.Component stage={freeState} tracker={tracker} />}
      </PracticeSheet>

      <FlowCard open={flowOpen === 'urge'} onClose={closeFlow}>
        {flowOpen === 'urge' && tracker && <UrgeFlow trackerId={tracker.id} onExit={closeFlow} />}
      </FlowCard>
      <FlowCard open={flowOpen === 'slip'} onClose={closeFlow}>
        {flowOpen === 'slip' && tracker && <SlipFlow trackerId={tracker.id} onExit={closeFlow} />}
      </FlowCard>
    </div>
  )
}

const styles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '1.25rem 1rem 6rem',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  phone: { maxWidth: '440px', width: '100%' },
  loadingCard: {
    background: '#FAF7F1', maxWidth: '440px', width: '100%', borderRadius: '28px',
    padding: '5rem 2rem', textAlign: 'center', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10)', alignSelf: 'flex-start',
  },

  topBar: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' },
  brandCenter: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', pointerEvents: 'none' },
  eyebrow: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: 0 },
  iconBtn: { width: '38px', height: '38px', borderRadius: '50%', border: '0.5px solid #E0D5C2', background: 'rgba(255,255,255,0.7)', color: '#6B5C4A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  tourReplay: { position: 'fixed', right: '16px', bottom: '88px', width: '34px', height: '34px', borderRadius: '50%', border: '0.5px solid #DDCFB6', background: '#FCFAF5', color: '#854F0B', fontSize: '16px', fontFamily: 'Georgia, serif', fontStyle: 'italic', cursor: 'pointer', boxShadow: '0 4px 14px rgba(60,40,20,0.18)', zIndex: 1500 },
  greeting: { fontSize: '22px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 14px', lineHeight: 1.25 },

  setupCard: { display: 'block', width: '100%', textAlign: 'left', marginTop: '12px', padding: '14px 16px', background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: '16px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(80,50,20,0.05)' },
  setupTitle: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0 },
  setupSub: { fontSize: '12.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '4px 0 0', lineHeight: 1.45 },

  sectionLabel: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '20px 0 8px', paddingLeft: '2px' },

  practiceCard: { display: 'flex', alignItems: 'center', gap: '14px', width: '100%', textAlign: 'left', padding: '16px', background: 'linear-gradient(180deg, #FBF7EE 0%, #F6EFE0 100%)', border: '0.5px solid #E5D9C2', borderRadius: '18px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 18px rgba(80,50,20,0.07)' },
  practiceGlyph: { width: '48px', height: '48px', flexShrink: 0, borderRadius: '14px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#D9B57A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px -4px rgba(30,18,8,0.45)' },
  practiceText: { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
  practiceTitle: { fontSize: '17px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.2 },
  practiceLine: { fontSize: '12.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.45 },
  practiceArrow: { marginLeft: 'auto', fontSize: '22px', color: '#B9A07E', fontFamily: 'Georgia, serif', lineHeight: 1, paddingLeft: '6px' },
  journalBar: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', marginTop: '10px', padding: '13px 16px', background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: '16px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 12px rgba(80,50,20,0.05)' },
  journalGlyph: { width: '40px', height: '40px', flexShrink: 0, borderRadius: '12px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#D9B57A', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  journalTitle: { fontSize: '15.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.2 },

  practiceGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '9px', marginTop: '9px', alignItems: 'stretch' },
  miniTile: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', minHeight: '98px', padding: '13px 6px 11px', background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(80,50,20,0.04)' },
  miniGlyph: { width: '38px', height: '38px', flexShrink: 0, borderRadius: '12px', background: 'rgba(58,42,28,0.07)', color: '#6B4F23', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  miniTitle: { fontSize: '11.5px', color: '#3A2D1E', fontFamily: 'Georgia, serif', textAlign: 'center', lineHeight: 1.25 },

  hitRow: { display: 'flex', gap: '10px', alignItems: 'stretch' },
  hitCard: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', minHeight: '66px', padding: '13px 12px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', border: '0.5px solid rgba(217,181,122,0.35)', borderRadius: '16px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', boxShadow: '0 8px 20px -8px rgba(30,18,8,0.5)' },
  hitGlyph: { width: '38px', height: '38px', flexShrink: 0, borderRadius: '50%', background: 'rgba(217,181,122,0.16)', color: '#D9B57A', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  hitText: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  hitTitle: { fontSize: '13.5px', color: '#FAF7F1', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.2 },
  hitSub: { fontSize: '10.5px', color: '#CBBA98', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.3 },

  slipNote: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '8px 2px 0' },
  reclaimInvite: { marginTop: '10px', padding: '14px 15px', background: '#FBF4E6', border: '0.5px solid #E4D5BB', borderRadius: '14px' },
  reclaimText: { fontSize: '13px', color: '#3A2D1E', fontFamily: 'Georgia, serif', lineHeight: 1.55, margin: '0 0 10px' },
  reclaimBtn: { width: '100%', padding: '11px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },

  whispers: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' },
  glyphRow: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', padding: '12px 13px', background: 'rgba(255,255,255,0.7)', border: '0.5px solid #E5D9C2', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit' },
  rowGlyph: { width: '34px', height: '34px', flexShrink: 0, borderRadius: '11px', background: 'rgba(58,42,28,0.07)', color: '#6B4F23', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, fontSize: '13.5px', color: '#3A2D1E', fontFamily: 'Georgia, serif', lineHeight: 1.35 },
  rowArrow: { fontSize: '13px', color: '#B9A07E' },
  surfacingRow: { background: 'transparent', border: 'none', textAlign: 'left', padding: '10px 2px 0', fontSize: '13px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', cursor: 'pointer' },
  yoursGrid: { display: 'grid', gap: '10px', marginTop: '10px' },
  yoursCard: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '7px', textAlign: 'left', padding: '14px 13px', background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: '16px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(120,90,40,0.05)' },
  yoursGlyph: { width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#D9B57A', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '0.5px solid rgba(217,181,122,0.35)' },
  yoursTitle: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500 },
  yoursSub: { fontSize: '11.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.45 },

  sheetOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(40,25,15,0.55)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0.5rem' },
  sheet: { background: '#FAF7F1', width: '100%', maxWidth: '440px', maxHeight: '85vh', borderRadius: '24px 24px 0 0', padding: '0.75rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(40,25,15,0.3)' },
  sheetHandle: { width: '40px', height: '4px', background: '#DDCFB6', borderRadius: '2px', margin: '0 auto 12px', flexShrink: 0 },
  sheetEyebrow: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 4px', textAlign: 'center' },
  sheetTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 14px', textAlign: 'center' },
  sheetBody: { overflowY: 'auto', flex: 1, paddingBottom: '6px' },
  sheetClose: { width: '100%', padding: '12px', background: 'white', color: '#2A1F15', border: '0.5px solid #DDCFB6', borderRadius: '12px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginTop: '10px', flexShrink: 0 },

  flowOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(36,23,16,0.6)', backdropFilter: 'blur(4px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem' },
  flowCard: { position: 'relative', width: '100%', maxWidth: '460px', maxHeight: 'min(92vh, 820px)', background: '#FAF7F1', borderRadius: '22px', overflow: 'hidden', boxShadow: '0 24px 70px rgba(30,18,8,0.45)', display: 'flex', flexDirection: 'column' },
  flowClose: { position: 'absolute', top: '10px', right: '10px', zIndex: 5, width: '34px', height: '34px', borderRadius: '50%', border: '0.5px solid #E0D5C2', background: 'rgba(250,247,241,0.92)', color: '#6B5C4A', fontSize: '17px', lineHeight: 1, cursor: 'pointer' },
  flowScroll: { overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
}