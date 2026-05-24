import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import VowBrandMark from '../../components/VowBrandMark'
import { checkAndMarkMilestones } from '../../milestoneHelpers'
import DailyCheckin, { moodByScore, moodByValue } from './DailyCheckin'
import JournalTile from './JournalTile'
import BottomNav from '../../components/BottomNav'

// ===================================================================
// ENDURE-FREE HOME
// ===================================================================
// Stage: Endure (action). User has stopped or is about to.
// Tone: holding, continuing, the vow is active.
// Centerpiece: sobriety counter with jar fill.
// Nav: bottom tabs handle Home / Mirror / Motivation / Vow Path.
//      Profile (state-picker + sign out) lives behind humanoid icon top-right.
//      Anchors lives as a dedicated tile here (stage-relevant for Endure).
// ===================================================================

const ProfileIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

export default function EndureFreeHome({ progress }) {
  const navigate = useNavigate()

  const [tracker, setTracker] = useState(null)
  const [firstName, setFirstName] = useState('')
  const [todayCheckin, setTodayCheckin] = useState(null)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [activityLogs, setActivityLogs] = useState([])
  const [, setTickCount] = useState(0)
  const [toastMilestones, setToastMilestones] = useState([])
  const [showAddPlaceholder, setShowAddPlaceholder] = useState(false)
  const [slipCount, setSlipCount] = useState(progress.endure_slip_count || 0)
  const [loading, setLoading] = useState(true)

  // 100ms tick for live counter animation
  useEffect(() => {
    const id = setInterval(() => setTickCount(c => c + 1), 100)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // fresh slip count for the slip→Reclaim indicator
      const { data: vppRow } = await supabase
        .from('vow_path_progress').select('endure_slip_count')
        .eq('user_id', user.id).maybeSingle()
      if (vppRow) setSlipCount(vppRow.endure_slip_count || 0)

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, full_name')
        .eq('id', user.id)
        .maybeSingle()
      if (profile?.first_name) setFirstName(profile.first_name)
      else if (profile?.full_name) setFirstName(profile.full_name.split(' ')[0])
      else if (user.email) setFirstName(user.email.split('@')[0])

      const { data: trackers } = await supabase
        .from('trackers')
        .select(`
          *,
          addiction_types (id, name, icon),
          tracker_savings (savings_type, per_day_amount)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at')

      if (trackers && trackers.length > 0) {
        const tr = trackers[0]
        setTracker(tr)

        const newOnes = await checkAndMarkMilestones(tr, user.id)
        if (newOnes && newOnes.length > 0) {
          setToastMilestones(newOnes.map(m => ({ ...m, trackerName: tr.addiction_types?.name || 'Your tracker' })))
          setTimeout(() => setToastMilestones([]), 4000)
        }
      }

      // ---- daily check-in (shared signal) ----
      const { data: tc } = await supabase
        .from('free_daily_checkins').select('*')
        .eq('user_id', user.id).eq('checkin_date', localDateStr()).maybeSingle()
      if (tc) setTodayCheckin(tc)

      // ---- replacement / grounding activity logs ----
      const { data: acts } = await supabase
        .from('free_activity_logs').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(40)
      if (acts) setActivityLogs(acts)

      setLoading(false)
    }
    load()
  }, [])

  const handleCheckinSaved = (row) => setTodayCheckin(row)
  const handleActivitySaved = (row) => setActivityLogs(prev => [row, ...prev].slice(0, 40))

  const handleUpdateStartDate = async (newISO) => {
    if (!tracker) return
    const { error } = await supabase.from('trackers').update({ start_date: newISO }).eq('id', tracker.id)
    if (error) { console.error('Failed to update start date:', error); alert('Could not update the date. Please try again.'); return }
    setTracker(prev => ({ ...prev, start_date: newISO }))
  }

  const handleMoveToReclaim = async () => {
    if (!window.confirm("Move to Reclaim? It's a gentler space to regroup — your streak and progress stay saved.")) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('vow_path_progress')
      .update({ free_state: 'reclaim', endure_slip_count: 0, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
    if (error) { console.error('Move to reclaim failed:', error); alert('Could not move. Please try again.'); return }
    window.location.assign('/home')
  }

  const handleMoveToBuild = async () => {
    if (!window.confirm("Move to Build? The work shifts from holding the line to building the life around it — your counter and progress stay.")) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('vow_path_progress')
      .update({ free_state: 'build', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
    if (error) { console.error('Move to build failed:', error); alert('Could not move. Please try again.'); return }
    window.location.assign('/home')
  }

  // Urge velocity — log the spike/creep signal (feeds the Mirror), then hand
  // off to the real urge-breaking flow. Captured even if they bail mid-flow.
  const handleLogUrge = async (velocity) => {
    if (!tracker) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('free_stage_signals').insert({
        user_id: user.id, stage: 'endure', signal_type: 'urge_velocity',
        payload: { velocity, logged_at: new Date().toISOString() },
      })
    }
    navigate(`/urge/${tracker.id}`, { state: { velocity } })
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={styles.loadingPhone}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* TOP BAR */}
        <div style={styles.topBar}>
          <VowBrandMark />
          <button
            onClick={() => navigate('/profile')}
            style={styles.profileBtn}
            aria-label="Profile"
          >
            <ProfileIcon />
          </button>
        </div>

        {/* TILE 1 — GREETING */}
        <GreetingTile
          firstName={firstName}
          substanceLabel={progress.substance_label}
        />

        {/* TILE 2 — TRACKER PILLS */}
        <TrackerPillsTile
          tracker={tracker}
          onAddPress={() => setShowAddPlaceholder(true)}
        />

        {/* TILE 3 — COUNTER (or set-up prompt if no tracker) */}
        {tracker ? (
          <CounterTile tracker={tracker} navigate={navigate} onUpdateStart={handleUpdateStartDate} />
        ) : (
          <CounterSetupPromptTile
            substanceLabel={progress.substance_label}
            navigate={navigate}
          />
        )}

        {/* TILE 4 — URGE / SLIP ACTIONS */}
        {tracker && (
          <ActionTile
            tracker={tracker}
            navigate={navigate}
            slipCount={slipCount}
            onMoveToReclaim={handleMoveToReclaim}
            onLogUrge={handleLogUrge}
          />
        )}

        {/* TILE — DAILY CHECK-IN (shared signal) */}
        <TodayCheckinTile checkin={todayCheckin} onOpen={() => setCheckinOpen(true)} />

        {/* DAILY VITALS — sleep ledger + head-weather (logs for the Mirror) */}
        <DailyVitalsTile />

        {/* JOURNAL (shared) */}
        <JournalTile stage="endure" />

        {/* TILE — REPLACEMENT ACTIVITY (mood before -> after) */}
        <ActivityLogTile activityLogs={activityLogs} onSaved={handleActivitySaved} />

        {/* TILE 5 — SAVINGS / MILESTONES */}
        {tracker && (
          <SavingsMilestonesTile tracker={tracker} navigate={navigate} />
        )}

        {/* BUILD GATE — locked until the counter reaches 30 days */}
        {tracker && <BuildGateTile tracker={tracker} onMoveToBuild={handleMoveToBuild} />}

        {/* TILE 6 — ANCHORS (stage-relevant for Endure) */}
        <AnchorsTile navigate={navigate} />

        <BottomNav />

        {/* ADD PLACEHOLDER MODAL */}
        {showAddPlaceholder && (
          <div style={styles.modal} onClick={() => setShowAddPlaceholder(false)}>
            <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
              <p style={styles.modalTitle}>Multi-addiction support, soon.</p>
              <p style={styles.modalBody}>
                For now, Vow holds one vow at a time. Tracking multiple addictions
                is coming in a future update.
              </p>
              <button
                onClick={() => setShowAddPlaceholder(false)}
                style={styles.modalCloseBtn}
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* MILESTONE TOAST */}
        {toastMilestones.length > 0 && (
          <div style={styles.toast}>
            <div style={styles.toastInner}>
              <span style={styles.toastIcon}>{toastMilestones[0].badge_icon}</span>
              <div>
                <p style={styles.toastTitle}>
                  {toastMilestones.length === 1
                    ? `${toastMilestones[0].label} unlocked.`
                    : `${toastMilestones.length} milestones unlocked.`}
                </p>
                <p style={styles.toastSub}>
                  Tap milestones to see them.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      <DailyCheckin
        isOpen={checkinOpen}
        onClose={() => setCheckinOpen(false)}
        stage="endure"
        existing={todayCheckin}
        onSaved={handleCheckinSaved}
      />
    </div>
  )
}

// ===================================================================
// TILE: TODAY'S CHECK-IN (hero, shared signal)
// ===================================================================
function TodayCheckinTile({ checkin, onOpen }) {
  if (checkin) {
    const m = moodByScore(checkin.mood_score) || moodByValue(checkin.mood)
    return (
      <div style={{ ...styles.tile, ...styles.tileLogged }}>
        <p style={styles.tileEyebrow}>Today's check-in</p>
        <div style={styles.checkinSummaryRow}>
          <span style={{ ...styles.moodPill, background: m?.color || '#B9A07E' }} />
          <div>
            <p style={styles.checkinSummaryMood}>
              {m?.label || 'Noted'}{checkin.felt_pull ? ' \u00b7 the pull showed up' : ''}
            </p>
            <p style={styles.checkinSummarySub}>
              Energy {checkin.energy ?? '\u2013'}/5
              {checkin.note ? ` \u00b7 \u201c${checkin.note}\u201d` : ''}
            </p>
          </div>
        </div>
        <button onClick={onOpen} style={styles.checkinEditBtn}>Edit today's check-in</button>
      </div>
    )
  }
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Today's weather</p>
      <h2 style={styles.tileTitle}>How are you holding up?</h2>
      <p style={styles.tileBody}>
        A quiet half-minute. Mood, energy, whether the pull came by. Nobody sees it but you.
      </p>
      <button onClick={onOpen} style={styles.checkinCtaBtn}>Check in</button>
    </div>
  )
}

// ===================================================================
// TILE: REPLACEMENT ACTIVITY (free_activity_logs, new)
// ===================================================================
// Captures what the user reached for instead, with mood before -> after.
// The lift (after minus before) per activity is what powers the Mirror's
// "you tend to feel lighter after walks" once enough is logged.
const ACTIVITY_TYPES = [
  { value: 'moved',    label: 'Moved my body',  icon: '🏃' },
  { value: 'reached',  label: 'Reached out',    icon: '💬' },
  { value: 'outside',  label: 'Got outside',    icon: '🌿' },
  { value: 'made',     label: 'Made something', icon: '🎨' },
  { value: 'absorbed', label: 'Got absorbed',   icon: '🎧' },
  { value: 'rested',   label: 'Rested',         icon: '🛋️' },
  { value: 'other',    label: 'Something else', icon: '✨' },
]

const MOOD_FACES = ['😣', '😕', '😐', '🙂', '😄']
const ACTIVITY_LABEL = ACTIVITY_TYPES.reduce((a, t) => { a[t.value] = t.label; return a }, {})

function activityInsight(logs) {
  const byType = {}
  for (const l of logs) {
    if (l.mood_before == null || l.mood_after == null) continue
    const t = l.activity_type
    if (!byType[t]) byType[t] = { sum: 0, n: 0 }
    byType[t].sum += (l.mood_after - l.mood_before)
    byType[t].n += 1
  }
  let best = null
  for (const [t, { sum, n }] of Object.entries(byType)) {
    if (n < 3) continue
    const lift = sum / n
    if (lift > 0.3 && (!best || lift > best.lift)) best = { type: t, lift, n }
  }
  return best
}

function MoodMini({ label, value, onChange, disabled }) {
  return (
    <div style={styles.moodMiniRow}>
      <span style={styles.moodMiniLabel}>{label}</span>
      <div style={styles.moodMiniDots}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            disabled={disabled}
            style={{ ...styles.moodMiniDot, ...(value && n <= value ? styles.moodMiniDotOn : {}) }}
            aria-label={`${label} ${n} of 5`}
          />
        ))}
      </div>
    </div>
  )
}

function MoodFaces({ label, value, onChange, disabled }) {
  return (
    <div style={styles.faceRow}>
      <span style={styles.faceLabel}>{label}</span>
      <div style={styles.faceBtns}>
        {MOOD_FACES.map((f, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            disabled={disabled}
            style={{ ...styles.faceBtn, ...(value === i + 1 ? styles.faceBtnOn : {}) }}
            aria-label={`${label} ${i + 1} of 5`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  )
}

function ActivityLogTile({ activityLogs, onSaved }) {
  const [type, setType] = useState(null)
  const [before, setBefore] = useState(null)
  const [after, setAfter] = useState(null)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const insight = activityInsight(activityLogs)

  const reset = () => { setType(null); setBefore(null); setAfter(null) }

  const handleSave = async () => {
    if (saving || !type || !before || !after) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: saved, error } = await supabase
        .from('free_activity_logs')
        .insert({
          user_id: user.id, stage: 'endure',
          activity_type: type, mood_before: before, mood_after: after,
        })
        .select().single()
      if (error) {
        console.error('Failed to save activity:', error)
        alert('Could not save. Please try again.')
        setSaving(false); return
      }
      if (onSaved && saved) onSaved(saved)
      setSaving(false); reset(); setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2800)
    } catch (err) {
      console.error(err); setSaving(false)
    }
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Instead of using</p>
      <h2 style={styles.tileTitle}>Did something else today?</h2>
      <p style={styles.tileBody}>
        What you reached for instead &mdash; and how it shifted you &mdash; is worth noticing.
      </p>

      <div style={styles.actChips}>
        {ACTIVITY_TYPES.map(a => (
          <button
            key={a.value}
            onClick={() => { setType(a.value); setJustSaved(false) }}
            disabled={saving}
            style={{ ...styles.actChip, ...(type === a.value ? styles.actChipOn : {}) }}
          >
            <span style={styles.actChipIcon}>{a.icon}</span> {a.label}
          </button>
        ))}
      </div>

      {type && (
        <div style={styles.actBeforeAfter}>
          <MoodFaces label="Before you did it" value={before} onChange={setBefore} disabled={saving} />
          <MoodFaces label="And after" value={after} onChange={setAfter} disabled={saving} />
          {before && after && (
            <div style={styles.shiftRow}>
              <span style={styles.shiftFace}>{MOOD_FACES[before - 1]}</span>
              <span style={styles.shiftArrow}>→</span>
              <span style={styles.shiftFace}>{MOOD_FACES[after - 1]}</span>
              <span style={styles.shiftDelta}>
                {after > before
                  ? `+${after - before} lighter — that's the point`
                  : after < before
                    ? "still heavy, and that's okay"
                    : 'held steady'}
              </span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !before || !after}
            style={{ ...styles.actSaveBtn, ...((!before || !after) ? styles.actSaveBtnDim : {}) }}
          >
            {saving ? 'Saving\u2026' : 'Save'}
          </button>
        </div>
      )}

      {justSaved && (
        <p style={styles.actSavedNote}>Logged. That counts &mdash; you did something instead.</p>
      )}

      {insight && !type && (
        <p style={styles.actInsight}>
          You tend to feel lighter after {ACTIVITY_LABEL[insight.type].toLowerCase()}.
          <span style={styles.actInsightSub}> Based on {insight.n} times.</span>
        </p>
      )}

      {!type && !justSaved && !insight && (
        <p style={styles.tileHelperText}>
          Even small things count. The pattern of what helps builds over time.
        </p>
      )}
    </div>
  )
}

function localDateStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// ===================================================================
// TILE: GREETING
// ===================================================================
function GreetingTile({ firstName, substanceLabel }) {
  const hour = new Date().getHours()
  let timeGreeting = 'Hello'
  if (hour < 12) timeGreeting = 'Good morning'
  else if (hour < 18) timeGreeting = 'Good afternoon'
  else timeGreeting = 'Good evening'

  return (
    <div style={styles.greetingTile}>
      <p style={styles.greetingEyebrow}>ENDURE</p>
      <h1 style={styles.greetingTitle}>
        {timeGreeting}{firstName ? `, ${firstName}` : ''}.
      </h1>
      <p style={styles.greetingSubtitle}>
        Holding the vow on <em style={styles.substanceEm}>{substanceLabel}</em>.
        One more day.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: TRACKER PILLS
// ===================================================================
function TrackerPillsTile({ tracker, onAddPress }) {
  return (
    <div style={styles.pillsRow}>
      {tracker ? (
        <button style={{ ...styles.trackerPill, ...styles.trackerPillActive }}>
          {tracker.addiction_types?.icon || '·'} {tracker.addiction_types?.name || 'Your tracker'}
        </button>
      ) : (
        <button style={{ ...styles.trackerPill, ...styles.trackerPillEmpty }}>
          No tracker yet
        </button>
      )}
      <button
        onClick={onAddPress}
        style={{ ...styles.trackerPill, ...styles.trackerPillAdd }}
      >
        + Add (soon)
      </button>
    </div>
  )
}

// ===================================================================
// TILE: BUILD GATE — Build unlocks at 30 days on the counter
// ===================================================================
// Forward progression Endure -> Build is gated on the counter reaching 30
// days. Users who picked Build directly at onboarding never see this (they're
// already in free_state 'build'); this only governs the organic step up.
const BUILD_UNLOCK_DAYS = 30

function BuildGateTile({ tracker, onMoveToBuild }) {
  if (!tracker) return null
  const days = Math.floor((Date.now() - new Date(tracker.start_date).getTime()) / 86400000)
  const ready = days >= BUILD_UNLOCK_DAYS
  const pct = Math.max(0, Math.min(100, Math.round((days / BUILD_UNLOCK_DAYS) * 100)))

  if (ready) {
    return (
      <div style={{ ...styles.tile, ...styles.buildReadyTile }}>
        <p style={styles.tileEyebrow}>A new chapter</p>
        <h2 style={styles.tileTitle}>You've held {days} days.</h2>
        <p style={styles.tileBody}>
          Thirty days is the turn. The work shifts now &mdash; from stopping to building the life that makes staying easier.
        </p>
        <button onClick={onMoveToBuild} style={styles.buildMoveBtn}>Move to Build  &rarr;</button>
      </div>
    )
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Next chapter &middot; locked</p>
      <h2 style={styles.tileTitle}>Build unlocks at 30 days.</h2>
      <p style={styles.tileBody}>
        Hold the line a little longer. When the counter reaches 30 days, the work shifts from stopping to building.
      </p>
      <div style={styles.buildGateBarBg}>
        <div style={{ ...styles.buildGateBarFill, width: `${pct}%` }} />
      </div>
      <p style={styles.buildGateText}>{days} of {BUILD_UNLOCK_DAYS} days &middot; {Math.max(0, BUILD_UNLOCK_DAYS - days)} to go</p>
    </div>
  )
}

// ===================================================================
// TILE: COUNTER
// ===================================================================
function toLocalInput(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function CounterTile({ tracker, navigate, onUpdateStart }) {
  const [editing, setEditing] = useState(false)
  const [dtValue, setDtValue] = useState('')
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

  const pad = (n) => String(n).padStart(2, '0')
  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const ms = now.getMilliseconds()
  const yearsFill = (years / 10) * 100
  const monthsFill = (months / 12) * 100
  const daysFill = (days / daysInCurrentMonth) * 100
  const hoursFill = (hours / 24) * 100
  const minsFill = (mins / 60) * 100
  const secsFill = ((secs * 1000 + ms) / 60000) * 100

  const startDateStr = startDate.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div style={styles.counterTile}>
      <div style={styles.counterHeader}>
        <div style={styles.counterIcon}>{tracker.addiction_types.icon}</div>
        <div style={{ flex: 1 }}>
          <p style={styles.counterName}>{tracker.addiction_types.name}</p>
          <p style={styles.counterSince}>
            Since {startDateStr}
            <button
              onClick={() => { setDtValue(toLocalInput(startDate)); setEditing(true) }}
              style={styles.editStartBtn}
            >
              edit
            </button>
          </p>
        </div>
      </div>

      {editing && (
        <div style={styles.editStartPanel}>
          <input
            type="datetime-local"
            value={dtValue}
            max={toLocalInput(new Date())}
            onChange={(e) => setDtValue(e.target.value)}
            style={styles.editStartInput}
          />
          <div style={styles.editStartBtns}>
            <button onClick={() => setEditing(false)} style={styles.editStartCancel}>Cancel</button>
            <button
              onClick={() => {
                if (!dtValue) return
                const d = new Date(dtValue)
                if (isNaN(d.getTime())) return
                if (d.getTime() > Date.now()) { alert("That date is in the future — pick one that's already passed."); return }
                onUpdateStart(d.toISOString())
                setEditing(false)
              }}
              style={styles.editStartSave}
            >
              Save
            </button>
          </div>
        </div>
      )}

      <p style={styles.stayedLine}>
        Free from <b style={styles.bold}>{tracker.addiction_types.name}</b> for
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
          <p style={{ ...styles.cellU, marginTop: '14px' }}>—</p>
        ) : (
          <>
            <p style={{ ...styles.cellN, ...(accent ? styles.cellAccent : {}) }}>{n}</p>
            <p style={styles.cellU}>{u}</p>
          </>
        )}
      </div>
    </div>
  )
}

// ===================================================================
// TILE: COUNTER SETUP PROMPT
// ===================================================================
function CounterSetupPromptTile({ substanceLabel, navigate }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Optional</p>
      <h2 style={styles.tileTitle}>Set up a tracker?</h2>
      <p style={styles.tileBody}>
        If you've already stopped <em style={styles.substanceEm}>{substanceLabel}</em>,
        Vow can show your days, savings, and milestones. Optional — your home
        works either way.
      </p>
      <button
        onClick={() => navigate('/onboarding/setup')}
        style={styles.tileSecondaryBtn}
      >
        Set up tracking
      </button>
    </div>
  )
}

// ===================================================================
// TILE: ACTIONS
// ===================================================================
const SLEEP_OPTIONS = [
  { key: 'fragmented', label: 'Fragmented' },
  { key: 'restless',   label: 'Restless' },
  { key: 'solid',      label: 'Solid' },
]
const WEATHER_OPTIONS = [
  { key: 'heavy_fog',     label: 'Heavy fog' },
  { key: 'light_fog',     label: 'Light fog' },
  { key: 'crystal_clear', label: 'Crystal clear' },
]

// ===================================================================
// TILE: DAILY VITALS — sleep ledger + withdrawal weather
// ===================================================================
// Two substance-agnostic morning reads that, over time, show the nervous
// system settling. Self-contained (fetches its own user + today's row), one
// row per day in free_stage_signals signal_type 'daily_vitals'. Feeds Mirror.
function DailyVitalsTile() {
  const [sleep, setSleep] = useState(null)
  const [weather, setWeather] = useState(null)
  const [rowId, setRowId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedToday, setSavedToday] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('free_stage_signals')
        .select('id, payload')
        .eq('user_id', user.id)
        .eq('stage', 'endure')
        .eq('signal_type', 'daily_vitals')
        .eq('payload->>date', localDateStr())
        .order('created_at', { ascending: false })
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row) {
        setRowId(row.id)
        setSleep(row.payload?.sleep || null)
        setWeather(row.payload?.weather || null)
        setSavedToday(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSave = async () => {
    if (saving || !sleep || !weather) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { sleep, weather, date: localDateStr() }
    let ok = false
    if (rowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
      ok = !error
    } else {
      const { data, error } = await supabase
        .from('free_stage_signals')
        .insert({ user_id: user.id, stage: 'endure', signal_type: 'daily_vitals', payload })
        .select('id').single()
      ok = !error && !!data
      if (ok) setRowId(data.id)
    }
    setSaving(false)
    if (ok) { setSavedToday(true); setEditing(false) }
    else alert('Could not save. Please try again.')
  }

  if (savedToday && !editing) {
    const sl = SLEEP_OPTIONS.find(o => o.key === sleep)
    const we = WEATHER_OPTIONS.find(o => o.key === weather)
    return (
      <div style={styles.vitalsCompact}>
        <div style={styles.vitalsCompactMain}>
          <span style={styles.vitalsCompactCheck}>✓</span>
          <div>
            <p style={styles.vitalsCompactEyebrow}>Daily vitals · logged</p>
            <p style={styles.vitalsCompactLine}>{sl ? sl.label : '—'} · {we ? we.label : '—'}</p>
          </div>
        </div>
        <button onClick={() => setEditing(true)} style={styles.vitalsCompactEdit}>Edit</button>
      </div>
    )
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Daily vitals · this morning</p>
      <h2 style={styles.tileTitle}>How's the machine running?</h2>
      <p style={styles.tileBody}>
        Two quick reads. Over time these show your nervous system settling &mdash; even on the hard days.
      </p>

      <p style={styles.vitalsQ}>How did your brain rest last night?</p>
      <div style={styles.vitalsPills}>
        {SLEEP_OPTIONS.map(o => (
          <button key={o.key} onClick={() => setSleep(o.key)} disabled={saving}
            style={{ ...styles.vitalsPill, ...(sleep === o.key ? styles.vitalsPillOn : {}) }}>
            {o.label}
          </button>
        ))}
      </div>

      <p style={styles.vitalsQ}>What's the weather in your head today?</p>
      <div style={styles.vitalsPills}>
        {WEATHER_OPTIONS.map(o => (
          <button key={o.key} onClick={() => setWeather(o.key)} disabled={saving}
            style={{ ...styles.vitalsPill, ...(weather === o.key ? styles.vitalsPillOn : {}) }}>
            {o.label}
          </button>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving || !sleep || !weather}
        style={{ ...styles.vitalsSaveBtn, ...((!sleep || !weather) ? styles.vitalsSaveBtnDim : {}) }}>
        {saving ? 'Saving…' : (savedToday ? 'Save changes' : 'Log daily vitals')}
      </button>
    </div>
  )
}

function ActionTile({ tracker, navigate, slipCount = 0, onMoveToReclaim, onLogUrge }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>In the moment</p>
      <h2 style={styles.tileTitle}>Urge Incoming</h2>
      <p style={styles.tileBody}>
        Name how it's coming at you — a sudden spike, or a slow creep. That alone takes some of its power.
      </p>

      <div style={styles.velocityRow}>
        <button onClick={() => onLogUrge('spike')} style={{ ...styles.velocityBtn, ...styles.velocitySpike }}>
          <span style={styles.velocityIcon}>⚡</span>
          <span style={styles.velocityLabel}>Sudden spike</span>
          <span style={styles.velocitySub}>a trigger hit</span>
        </button>
        <button onClick={() => onLogUrge('creep')} style={{ ...styles.velocityBtn, ...styles.velocityCreep }}>
          <span style={styles.velocityIcon}>🌫️</span>
          <span style={styles.velocityLabel}>Slow creep</span>
          <span style={styles.velocitySub}>worn down, tired</span>
        </button>
      </div>

      <button onClick={() => navigate(`/slip/${tracker.id}`)} style={styles.slipFallbackBtn}>
        I slipped
      </button>
      <p style={styles.tileHelperText}>
        Urges pass. Slips aren't the end.
      </p>

      {slipCount > 0 && (
        <div style={styles.slipProgress}>
          <div style={styles.slipDots}>
            {[1, 2, 3].map(n => (
              <span key={n} style={{ ...styles.slipDot, ...(slipCount >= n ? styles.slipDotOn : {}) }} />
            ))}
          </div>
          <span style={styles.slipProgressText}>
            {Math.min(slipCount, 3)} of 3 slips this stretch
          </span>
        </div>
      )}

      {slipCount >= 3 && (
        <div style={styles.reclaimNudge}>
          <p style={styles.reclaimNudgeText}>
            Three slips this stretch. That's not a failure &mdash; it's a sign the ground shifted under you. Reclaim is a gentler place to regroup, and everything you've built stays exactly where it is. If you're honest with yourself, it might be time to step back.
          </p>
          <button onClick={onMoveToReclaim} style={styles.reclaimNudgeBtn}>
            Move to Reclaim
          </button>
        </div>
      )}
    </div>
  )
}

// ===================================================================
// TILE: SAVINGS / MILESTONES
// ===================================================================
function SavingsMilestonesTile({ tracker, navigate }) {
  const startDate = new Date(tracker.start_date)
  const now = new Date()
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

  const longestDays = Math.max(
    totalDaysClean,
    Math.floor((tracker.longest_streak_seconds || 0) / 86400)
  )

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>What you've kept</p>

      <div style={styles.savingsStack}>
        {moneySaved !== null && (
          <div style={styles.savingsRow}>
            <span style={styles.savingsLabel}>Money saved</span>
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
          <span style={styles.savingsLabel}>Longest streak</span>
          <span style={styles.savingsValue}>{longestDays} days</span>
        </div>
      </div>

      <button
        onClick={() => navigate(`/milestones/${tracker.id}`)}
        style={styles.milestonesLink}
      >
        🏆 View milestones →
      </button>
    </div>
  )
}

// ===================================================================
// TILE: ANCHORS (replaces old Quick Links — stage-relevant only for Endure)
// ===================================================================
function AnchorsTile({ navigate }) {
  return (
    <div style={styles.anchorsTile}>
      <div style={styles.anchorsTop}>
        <div style={styles.anchorsGlyph}>
          <span style={{ ...styles.anchorsDot, background: '#C5572C' }} />
          <span style={{ ...styles.anchorsDot, background: '#C8893C', marginLeft: '-9px' }} />
          <span style={{ ...styles.anchorsDot, background: '#6B7FA0', marginLeft: '-9px' }} />
          <span style={{ ...styles.anchorsDot, background: '#6E8A6A', marginLeft: '-9px' }} />
        </div>
        <p style={styles.tileEyebrow}>Anchors</p>
      </div>
      <h3 style={styles.anchorsTitle}>The people you'd call.</h3>
      <p style={styles.anchorsBody}>
        The few you'd reach for at midnight, when the urge sharpens. Worth
        lining up before you need them.
      </p>
      <button onClick={() => navigate('/anchors')} style={styles.anchorsBtnNew}>
        Open Anchors
      </button>
    </div>
  )
}

// ===================================================================
// STYLES
// ===================================================================
const styles = {
  vitalsCompact: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'linear-gradient(180deg, #F6FAE9 0%, #ECF3D5 100%)', border: '0.5px solid #C2D49A', borderRadius: '14px', padding: '12px 16px' },
  vitalsCompactMain: { display: 'flex', alignItems: 'center', gap: '10px' },
  vitalsCompactCheck: { width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)', border: '0.5px solid #C2D49A', color: '#3B6D11', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  vitalsCompactEyebrow: { fontSize: '10px', color: '#5A6B3A', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'Georgia, serif', margin: '0 0 2px' },
  vitalsCompactLine: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0 },
  vitalsCompactEdit: { background: 'transparent', border: 'none', color: '#3B6D11', fontSize: '12.5px', fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer', flexShrink: 0 },
  // --- urge velocity (spike vs slow creep) ---
  velocityRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  velocityBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px', padding: '14px', border: 'none', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', boxShadow: '0 4px 14px rgba(40,25,10,0.12)' },
  velocitySpike: { background: 'linear-gradient(180deg, #6E3A1C 0%, #3A2415 100%)' },
  velocityCreep: { background: 'linear-gradient(180deg, #4A4038 0%, #2A241E 100%)' },
  velocityIcon: { fontSize: '20px', lineHeight: 1 },
  velocityLabel: { fontSize: '14px', fontWeight: 600, color: '#FAF7F1', fontFamily: 'Georgia, serif' },
  velocitySub: { fontSize: '11px', color: 'rgba(250,247,241,0.7)', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  slipFallbackBtn: { width: '100%', padding: '11px', background: 'transparent', color: '#9C6B3C', border: '0.5px solid #E0CDB0', borderRadius: '11px', fontSize: '13px', fontWeight: 500, fontFamily: 'Georgia, serif', cursor: 'pointer' },

  // --- daily vitals (sleep ledger + withdrawal weather) ---
  vitalsQ: { fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '14px 0 8px' },
  vitalsPills: { display: 'flex', gap: '8px', marginBottom: '4px' },
  vitalsPill: { flex: 1, padding: '11px 8px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '12px', fontSize: '13px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 6px rgba(80,50,20,0.04)' },
  vitalsPillOn: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: '0.5px solid #241710', boxShadow: '0 4px 12px rgba(40,25,10,0.25)' },
  vitalsSaveBtn: { marginTop: '14px', width: '100%', padding: '13px', background: '#854F0B', color: '#FBF6EE', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif' },
  vitalsSaveBtnDim: { opacity: 0.45, cursor: 'not-allowed' },

  // --- build gate (Endure -> Build at 30 days) ---
  buildReadyTile: { background: 'linear-gradient(180deg, #F6FAE9 0%, #ECF3D5 100%)', border: '0.5px solid #C2D49A' },
  buildMoveBtn: { width: '100%', padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.22)' },
  buildGateBarBg: { width: '100%', height: '8px', background: '#F0E8D8', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' },
  buildGateBarFill: { height: '100%', background: 'linear-gradient(90deg, #C8A86A 0%, #A07A3C 100%)', borderRadius: '4px', transition: 'width 0.4s' },
  buildGateText: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, textAlign: 'center' },

  // --- counter start-date edit ---
  editStartBtn: { marginLeft: '8px', background: 'transparent', border: 'none', color: '#A07A3C', fontSize: '11px', fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer', padding: 0, textDecoration: 'underline' },
  editStartPanel: { marginTop: '12px', padding: '12px', background: '#FBF6EE', border: '0.5px solid #EFE7D7', borderRadius: '12px' },
  editStartInput: { width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: 'white', border: '0.5px solid #DDCFB6', borderRadius: '10px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', outline: 'none' },
  editStartBtns: { display: 'flex', gap: '8px', marginTop: '10px' },
  editStartCancel: { flex: 1, padding: '10px', background: 'white', border: '0.5px solid #DDCFB6', borderRadius: '10px', color: '#6B5C4A', fontSize: '13px', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  editStartSave: { flex: 1, padding: '10px', background: '#854F0B', border: 'none', borderRadius: '10px', color: '#FBF6EE', fontSize: '13px', fontWeight: 500, fontFamily: 'Georgia, serif', cursor: 'pointer' },

  // --- activity mood faces + shift ---
  actChipIcon: { fontSize: '15px' },
  faceRow: { marginBottom: '14px' },
  faceLabel: { display: 'block', fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: '8px' },
  faceBtns: { display: 'flex', gap: '8px' },
  faceBtn: { flex: 1, padding: '10px 0', fontSize: '24px', lineHeight: 1, background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '12px', cursor: 'pointer', filter: 'grayscale(0.7) opacity(0.6)', transition: 'all 0.15s' },
  faceBtnOn: { background: 'linear-gradient(180deg, #FFF8EC 0%, #FBEFD8 100%)', border: '0.5px solid #E0C28C', filter: 'none', transform: 'translateY(-1px)' },
  shiftRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', background: 'linear-gradient(180deg, #F6FAE9 0%, #ECF3D5 100%)', border: '0.5px solid #C2D49A', borderRadius: '12px', marginBottom: '12px' },
  shiftFace: { fontSize: '22px', lineHeight: 1 },
  shiftArrow: { fontSize: '16px', color: '#7E9B5A' },
  shiftDelta: { fontSize: '12.5px', color: '#3B6D11', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginLeft: '4px' },

  // --- refined Anchors tile ---
  anchorsTile: {
    background: 'linear-gradient(180deg, #FFFBF4 0%, #FBF1E2 100%)',
    border: '0.5px solid #EEDFC8',
    borderRadius: '18px',
    padding: '18px 18px 16px',
    boxShadow: '0 4px 16px rgba(120,80,30,0.07)',
  },
  anchorsTop: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' },
  anchorsGlyph: { display: 'flex', alignItems: 'center' },
  anchorsDot: {
    width: '20px', height: '20px', borderRadius: '50%',
    border: '1.5px solid #FBF1E2', boxShadow: '0 1px 2px rgba(80,50,20,0.15)',
  },
  anchorsTitle: {
    fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif',
    fontWeight: 500, lineHeight: 1.3, margin: '0 0 8px',
  },
  anchorsBody: {
    fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 14px',
  },
  anchorsBtnNew: {
    width: '100%', padding: '13px', background: 'rgba(255,255,255,0.7)',
    color: '#9A4E1A', border: '0.5px solid #E3C9A3', borderRadius: '12px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif',
    boxShadow: '0 2px 8px rgba(120,80,30,0.06)',
  },

  // --- slip progress + voluntary reclaim (ActionTile) ---
  slipProgress: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginTop: '14px', paddingTop: '14px', borderTop: '0.5px solid #EFE7D7',
  },
  slipDots: { display: 'flex', gap: '5px', flexShrink: 0 },
  slipDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#E8DFD0', border: '0.5px solid #DDCFB6',
  },
  slipDotOn: { background: '#C5572C', border: '0.5px solid #A8461F' },
  slipProgressText: {
    fontSize: '11.5px', color: '#8A6A3C', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', lineHeight: 1.4,
  },
  reclaimNudge: {
    marginTop: '14px', padding: '14px', borderRadius: '14px',
    background: 'linear-gradient(180deg, #FFFBF4 0%, #FBF1E2 100%)',
    border: '0.5px solid #EAD9BE',
  },
  reclaimNudgeText: {
    fontSize: '12.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 12px',
  },
  reclaimNudgeBtn: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '11px',
    fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.22)',
  },

  // --- v2 additions: check-in + replacement activity ---
  tileLogged: { background: 'linear-gradient(180deg, #F6FAE9 0%, #ECF3D5 100%)', border: '0.5px solid #C2D49A' },
  checkinSummaryRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  moodPill: { width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)' },
  checkinSummaryMood: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 2px', lineHeight: 1.3 },
  checkinSummarySub: { fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.4 },
  checkinEditBtn: { background: 'transparent', border: 'none', color: '#3B6D11', fontSize: '12px', fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer', padding: 0 },
  checkinCtaBtn: {
    width: '100%', padding: '14px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  actChips: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '4px' },
  actChip: {
    padding: '12px 10px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '12px',
    fontSize: '13px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif',
    cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  actChipOn: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: '0.5px solid #241710' },
  actBeforeAfter: { marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' },
  moodMiniRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  moodMiniLabel: { fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  moodMiniDots: { display: 'flex', gap: '8px' },
  moodMiniDot: { width: '22px', height: '22px', borderRadius: '50%', background: 'white', border: '1px solid #E0D5C2', cursor: 'pointer', transition: 'all 0.15s', padding: 0 },
  moodMiniDotOn: { background: '#C8A86A', border: '1px solid #B6924E' },
  actSaveBtn: {
    width: '100%', padding: '13px', background: '#854F0B', color: '#FBF6EE', border: 'none',
    borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif', marginTop: '2px',
  },
  actSaveBtnDim: { opacity: 0.45, cursor: 'not-allowed' },
  actSavedNote: { fontSize: '12px', color: '#3B6D11', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '12px 0 0' },
  actInsight: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, textAlign: 'center', margin: '14px 0 0' },
  actInsightSub: { display: 'block', fontSize: '11px', color: '#9C8C78', marginTop: '3px' },

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
    gap: '14px',
  },
  loadingPhone: {
    background: '#FAF7F1',
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '5rem 2rem',
    textAlign: 'center',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10)',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '4px',
  },
  brandLine: {
    fontSize: '20px', fontWeight: 500, color: '#2A1F15',
    margin: 0, fontFamily: 'Georgia, serif', letterSpacing: '-0.01em',
  },
  profileBtn: {
    background: 'transparent', border: 'none', color: '#854F0B',
    cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  // GENERIC TILE
  tile: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '18px',
    padding: '18px 18px 16px',
    boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
  },
  tileEyebrow: {
    fontSize: '10.5px', color: '#A07A3C',
    textTransform: 'uppercase', letterSpacing: '0.12em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 9px',
  },
  tileTitle: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 12px',
  },
  tileBody: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.6, margin: '0 0 14px',
  },
  tileHelperText: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '12px 0 0', textAlign: 'center',
  },
  tileSecondaryBtn: {
    padding: '12px 18px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(80,50,20,0.05)',
  },

  // GREETING TILE
  greetingTile: { textAlign: 'left', padding: '8px 4px 4px' },
  greetingEyebrow: {
    fontSize: '10px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.24em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
  },
  greetingTitle: {
    fontSize: '26px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.2, margin: '0 0 10px', letterSpacing: '-0.01em',
  },
  greetingSubtitle: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.55, margin: 0,
  },
  substanceEm: {
    color: '#854F0B', fontWeight: 500, fontStyle: 'italic',
  },

  // TRACKER PILLS
  pillsRow: {
    display: 'flex', gap: '6px',
    overflowX: 'auto', paddingBottom: '2px',
  },
  trackerPill: {
    padding: '8px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '999px',
    fontSize: '12px', fontWeight: 500,
    color: '#9C8C78', cursor: 'default',
    fontFamily: 'inherit', whiteSpace: 'nowrap',
    boxShadow: '0 1px 2px rgba(80,50,20,0.04)',
  },
  trackerPillActive: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: '0.5px solid #241710',
    boxShadow: '0 2px 8px rgba(40,25,10,0.2)',
  },
  trackerPillEmpty: {
    background: '#F4ECDD',
    color: '#9C8C78',
    fontStyle: 'italic',
  },
  trackerPillAdd: {
    background: 'transparent',
    border: '1px dashed #C9B894',
    color: '#9C8C78',
    cursor: 'pointer',
  },

  // COUNTER TILE
  counterTile: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    borderRadius: '20px', padding: '1.5rem 1.25rem',
    border: '0.5px solid #E8DFD0',
    boxShadow: '0 6px 20px rgba(80,50,20,0.06)',
  },
  counterHeader: {
    display: 'flex', alignItems: 'center', gap: '11px',
    marginBottom: '1.25rem', paddingBottom: '1.25rem',
    borderBottom: '0.5px solid #EFE7D7',
  },
  counterIcon: {
    width: '38px', height: '38px', borderRadius: '11px',
    background: '#F4ECDD', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '18px',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 1px 2px rgba(120,80,30,0.06)',
  },
  counterName: { fontSize: '14px', fontWeight: 500, color: '#2A1F15', margin: 0 },
  counterSince: { fontSize: '11px', color: '#9C8C78', margin: '2px 0 0' },
  stayedLine: {
    fontSize: '12px', color: '#6B5C4A', textAlign: 'center',
    marginBottom: '14px', fontFamily: 'Georgia, serif',
  },
  bold: { fontWeight: 500, color: '#2A1F15' },
  gridA: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  row2: {
    gridColumn: 'span 3',
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
  },
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
    position: 'absolute', bottom: 0, left: 0, right: 0,
    transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none', zIndex: 0,
  },
  cellContent: { position: 'relative', zIndex: 1 },
  cellN: {
    fontSize: '22px', fontWeight: 500, color: '#2A1F15',
    lineHeight: 1, margin: 0, fontVariantNumeric: 'tabular-nums',
  },
  cellU: {
    fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em',
    color: '#9C8C78', marginTop: '5px', margin: '5px 0 0',
  },
  cellAccent: { color: '#C5572C' },

  // ACTIONS
  actionsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
  },
  actionBtn: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '6px',
    padding: '16px 8px',
    borderRadius: '14px',
    border: 'none', cursor: 'pointer',
    fontFamily: 'inherit',
  },
  actionUrge: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  actionSlip: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F2E5 100%)',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    boxShadow: '0 3px 10px rgba(80,50,20,0.06)',
  },
  actionIcon: { fontSize: '22px' },
  actionLabel: {
    fontSize: '13px', fontWeight: 500,
    fontFamily: 'Georgia, serif',
  },

  // SAVINGS / MILESTONES
  savingsStack: {
    display: 'flex', flexDirection: 'column', gap: '8px',
    marginBottom: '12px',
  },
  savingsRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 14px',
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    borderRadius: '12px',
    border: '0.5px solid #E8DCC2',
  },
  savingsLabel: {
    fontSize: '11px', color: '#8A7B6A',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  savingsValue: {
    fontSize: '14px', fontWeight: 500, color: '#2A1F15',
    fontVariantNumeric: 'tabular-nums',
  },
  milestonesLink: {
    width: '100%',
    background: 'transparent',
    border: '0.5px dashed #DDCFB6',
    borderRadius: '10px',
    padding: '10px',
    fontSize: '12px', color: '#854F0B', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
  },

  // ANCHORS TILE
  anchorsBtn: {
    width: '100%',
    padding: '13px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(80,50,20,0.05)',
  },

  // MODAL
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(40,25,15,0.55)',
    backdropFilter: 'blur(4px)',
    zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  },
  modalCard: {
    background: '#FAF7F1',
    maxWidth: '360px',
    width: '100%',
    borderRadius: '20px',
    padding: '1.75rem 1.5rem',
    boxShadow: '0 20px 60px rgba(40,25,15,0.3)',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: '17px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 12px', fontFamily: 'Georgia, serif',
  },
  modalBody: {
    fontSize: '13px', color: '#6B5C4A',
    margin: '0 0 1.5rem', lineHeight: 1.5,
    fontFamily: 'Georgia, serif',
  },
  modalCloseBtn: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '12px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },

  // TOAST (bumped above BottomNav)
  toast: {
    position: 'fixed',
    bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
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
    display: 'flex', alignItems: 'center', gap: '12px',
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