import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import DailyCheckin, { moodByScore, moodByValue } from './DailyCheckin'
import JournalTile from './JournalTile'
import BottomNav from '../../components/BottomNav'

// ===================================================================
// BUILD-FREE HOME
// ===================================================================
// Stage: Build (maintenance). User has sustained sobriety — months in.
// The acute work of Endure is behind them. The risk now is complacency
// creep. The home reflects that shift: weekly cadence not daily, calmer
// counter, user-defined practices, less crisis-shaped.
//
// Engine (primary, weekly): Pulse Check — "How's it sitting?"
// Secondary: User-defined practices (what they're building).
// Nav: bottom tabs handle Home / Mirror / Motivation / Vow Path.
// ===================================================================

const MAX_SUPPORTS = 6

const BALANCE_DOMAINS = [
  { key: 'rest', label: 'Rest' },
  { key: 'connection', label: 'Connection' },
  { key: 'movement', label: 'Movement' },
  { key: 'meaning', label: 'Meaning' },
  { key: 'play', label: 'Play' },
]

const SUPPORT_TYPES = [
  { key: 'person', label: 'A person' },
  { key: 'routine', label: 'A routine' },
  { key: 'place', label: 'A place' },
  { key: 'reason', label: 'A reason' },
]

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

// ===================================================================
// MAIN COMPONENT
// ===================================================================
export default function BuildFreeHome({ progress: initialProgress }) {
  const navigate = useNavigate()

  const [progress, setProgress] = useState(initialProgress)
  const [tracker, setTracker] = useState(null)
  const [firstName, setFirstName] = useState('')
  const [todayCheckin, setTodayCheckin] = useState(null)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [nowTs, setNowTs] = useState(Date.now())
  const [balanceLatest, setBalanceLatest] = useState(null)
  const [becomingRecent, setBecomingRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, full_name')
        .eq('id', user.id)
        .maybeSingle()
      if (profileData?.first_name) setFirstName(profileData.first_name)
      else if (profileData?.full_name) setFirstName(profileData.full_name.split(' ')[0])
      else if (user.email) setFirstName(user.email.split('@')[0])

      const { data: trackers } = await supabase
        .from('trackers')
        .select(`
          *,
          addiction_types (id, name, icon)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at')

      if (trackers && trackers.length > 0) {
        setTracker(trackers[0])
      }

      // ---- daily check-in (shared signal; gentle in maintenance) ----
      const { data: tc } = await supabase
        .from('free_daily_checkins').select('*')
        .eq('user_id', user.id).eq('checkin_date', localDateStr()).maybeSingle()
      if (tc) setTodayCheckin(tc)

      // ---- latest balance + recent becoming (Mirror + AI signals) ----
      const { data: bal } = await supabase
        .from('free_stage_signals').select('*')
        .eq('user_id', user.id).eq('signal_type', 'build_balance')
        .order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (bal) setBalanceLatest(bal)

      const { data: bec } = await supabase
        .from('free_stage_signals').select('*')
        .eq('user_id', user.id).eq('signal_type', 'build_evidence')
        .order('created_at', { ascending: false }).limit(8)
      if (bec) setBecomingRecent(bec)

      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // === Balance dials (lifestyle balance) ===
  const handleBalanceSave = async (vals) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const weekOf = formatDateForDB(getMondayOfWeek(new Date()))
    const { data: saved, error } = await supabase.from('free_stage_signals').insert({
      user_id: user.id, stage: 'build', signal_type: 'build_balance',
      payload: { ...vals, week_of: weekOf },
    }).select().single()
    if (error) { console.error('Failed to save balance:', error); return false }
    setBalanceLatest(saved)
    return true
  }

  // === Becoming (weekly identity evidence) ===
  const handleBecomingSave = async (text) => {
    if (!text.trim()) return false
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const weekOf = formatDateForDB(getMondayOfWeek(new Date()))
    const { data: saved, error } = await supabase.from('free_stage_signals').insert({
      user_id: user.id, stage: 'build', signal_type: 'build_evidence',
      payload: { text: text.trim(), week_of: weekOf },
    }).select().single()
    if (error) { console.error('Failed to save becoming:', error); return false }
    setBecomingRecent(prev => [saved, ...prev].slice(0, 8))
    return true
  }

  const handleCheckinSaved = (row) => setTodayCheckin(row)

  const handleMoveToReclaim = async () => {
    if (!window.confirm("Move to Reclaim? It's a gentler space to regroup — your streak and progress stay saved.")) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('vow_path_progress')
      .update({ free_state: 'reclaim', endure_slip_count: 0, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
    if (error) { console.error('Move to reclaim failed:', error); alert('Could not move. Please try again.'); return }
    navigate('/home', { replace: true })
  }

  // === Supports ("what holds you up" — folds in old practices) ===
  const handleSupportAdd = async (name, type) => {
    if (!name.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const current = progress.build_practices || []
    if (current.length >= MAX_SUPPORTS) { alert(`You can keep up to ${MAX_SUPPORTS} supports.`); return }
    const item = { id: `sup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, name: name.trim(), type, last_leaned_week: null, created_at: new Date().toISOString() }
    const next = [...current, item]
    setProgress(p => ({ ...p, build_practices: next }))
    const { error } = await supabase.from('vow_path_progress').update({ build_practices: next, updated_at: new Date().toISOString() }).eq('user_id', user.id)
    if (error) { console.error('Failed to add support:', error); setProgress(p => ({ ...p, build_practices: current })); alert('Could not save. Please try again.') }
  }

  const handleSupportDelete = async (id) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const current = progress.build_practices || []
    const next = current.filter(s => s.id !== id)
    setProgress(p => ({ ...p, build_practices: next }))
    const { error } = await supabase.from('vow_path_progress').update({ build_practices: next, updated_at: new Date().toISOString() }).eq('user_id', user.id)
    if (error) { console.error('Failed to delete support:', error); setProgress(p => ({ ...p, build_practices: current })) }
  }

  const handleSupportLean = async (id) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const weekOf = formatDateForDB(getMondayOfWeek(new Date()))
    const current = progress.build_practices || []
    const target = current.find(s => s.id === id)
    if (!target || target.last_leaned_week === weekOf) return
    const next = current.map(s => (s.id === id ? { ...s, last_leaned_week: weekOf } : s))
    setProgress(p => ({ ...p, build_practices: next }))
    await supabase.from('vow_path_progress').update({ build_practices: next, updated_at: new Date().toISOString() }).eq('user_id', user.id)
    await supabase.from('free_stage_signals').insert({
      user_id: user.id, stage: 'build', signal_type: 'build_capital',
      payload: { support_name: target.name, support_type: target.type, week_of: weekOf },
    })
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
          <p style={styles.brandLine}>Vow</p>
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

        {/* SLIM PERPETUAL COUNTER (or setup prompt) */}
        {tracker ? (
          <SlimCounterTile tracker={tracker} nowTs={nowTs} />
        ) : (
          <SetupPromptTile
            substanceLabel={progress.substance_label}
            navigate={navigate}
          />
        )}

        {/* DAILY CHECK-IN (gentle, shared signal) */}
        <TodayCheckinTile checkin={todayCheckin} onOpen={() => setCheckinOpen(true)} />

        {/* JOURNAL (shared) */}
        <JournalTile stage="build" />

        {/* THE BALANCE — lifestyle balance dials */}
        <BalanceDialsTile latest={balanceLatest} onSave={handleBalanceSave} />

        {/* WHAT HOLDS YOU UP — supports (folds in practices) */}
        <SupportsTile
          supports={progress.build_practices || []}
          onAdd={handleSupportAdd}
          onDelete={handleSupportDelete}
          onLean={handleSupportLean}
        />

        {/* BECOMING — weekly identity evidence */}
        <BecomingTile recent={becomingRecent} onSave={handleBecomingSave} />

        {/* ANCHORS */}
        <AnchorsTile navigate={navigate} />

        {/* ACTION (slim, only if tracker exists) */}
        {tracker && (
          <ActionTile
            tracker={tracker}
            navigate={navigate}
            slipCount={progress.endure_slip_count || 0}
            onMoveToReclaim={handleMoveToReclaim}
          />
        )}

        <BottomNav />
      </div>

      <DailyCheckin
        isOpen={checkinOpen}
        onClose={() => setCheckinOpen(false)}
        stage="build"
        existing={todayCheckin}
        onSaved={handleCheckinSaved}
      />
    </div>
  )
}

// ===================================================================
// TILE: TODAY'S CHECK-IN (gentle, shared signal)
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
      <p style={styles.tileEyebrow}>A quiet check-in</p>
      <h2 style={styles.tileTitle}>Want to drop in today?</h2>
      <p style={styles.tileBody}>
        Optional, this far in. A half-minute on mood, energy, and how the pull's been &mdash; it keeps your Mirror honest.
      </p>
      <button onClick={onOpen} style={styles.checkinCtaBtn}>Check in</button>
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
      <p style={styles.greetingEyebrow}>BUILD</p>
      <h1 style={styles.greetingTitle}>
        {timeGreeting}{firstName ? `, ${firstName}` : ''}.
      </h1>
      <p style={styles.greetingSubtitle}>
        Holding the shape on <em style={styles.substanceEm}>{substanceLabel}</em>.
        This is the long work.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: SLIM COUNTER (perpetual, ambient — not the hero) (calmer than Endure's live ticker)
// ===================================================================
function SlimCounterTile({ tracker, nowTs }) {
  const start = new Date(tracker.start_date).getTime()
  const elapsed = Math.max(0, nowTs - start)
  const totalSec = Math.floor(elapsed / 1000)
  const days = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <div style={styles.slimCounter}>
      <span style={styles.slimDot} />
      <span style={styles.slimDays}>{days} {days === 1 ? 'day' : 'days'}</span>
      <span style={styles.slimClock}>{pad(h)}:{pad(m)}:{pad(s)}</span>
      <span style={styles.slimFree}>free</span>
    </div>
  )
}

// ===================================================================
// TILE: SETUP PROMPT (fallback when no tracker)
// ===================================================================
function SetupPromptTile({ substanceLabel, navigate }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Tracker</p>
      <h2 style={styles.tileTitle}>Set up a tracker for {substanceLabel}?</h2>
      <p style={styles.tileBody}>
        Track your time free, savings, and milestones. Optional but useful for
        identity reinforcement at this stage.
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
// TILE: BALANCE DIALS (lifestyle balance -> build_balance)
// ===================================================================
function BalanceDialsTile({ latest, onSave }) {
  const init = (k) => (latest && latest.payload && latest.payload[k] != null) ? latest.payload[k] : 3
  const [vals, setVals] = useState(() => BALANCE_DOMAINS.reduce((a, d) => { a[d.key] = init(d.key); return a }, {}))
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const setDomain = (k, v) => { setVals(p => ({ ...p, [k]: v })); setJustSaved(false) }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const ok = await onSave(vals)
    setSaving(false)
    if (ok) { setJustSaved(true); setTimeout(() => setJustSaved(false), 2500) }
    else alert('Could not save. Please try again.')
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>The balance</p>
      <h2 style={styles.tileTitle}>How full is the tank?</h2>
      <p style={styles.tileBody}>
        Maintenance slips when life tilts — too many shoulds, not enough that fills you. Mark where each one sits this week.
      </p>

      <div style={styles.balanceList}>
        {BALANCE_DOMAINS.map(d => (
          <div key={d.key} style={styles.balanceRow}>
            <span style={styles.balanceLabel}>{d.label}</span>
            <div style={styles.balanceDots}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setDomain(d.key, n)}
                  disabled={saving}
                  style={{ ...styles.balanceDot, ...(vals[d.key] >= n ? styles.balanceDotOn : {}) }}
                  aria-label={`${d.label} ${n} of 5`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.balanceScale}><span>Running empty</span><span>Full</span></div>

      <button onClick={handleSave} disabled={saving} style={styles.balanceSaveBtn}>
        {saving ? 'Saving…' : justSaved ? 'Saved ✓' : (latest ? 'Update' : 'Save this week')}
      </button>
    </div>
  )
}

// ===================================================================
// TILE: WHAT HOLDS YOU UP (supports -> build_capital)
// ===================================================================
function SupportsTile({ supports, onAdd, onDelete, onLean }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('person')
  const weekOf = formatDateForDB(getMondayOfWeek(new Date()))
  const atLimit = supports.length >= MAX_SUPPORTS
  const typeLabel = (k) => { const t = SUPPORT_TYPES.find(x => x.key === k); return t ? t.label : '' }

  const submit = () => {
    if (!name.trim()) return
    onAdd(name, type)
    setName(''); setType('person'); setAdding(false)
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>What holds you up</p>
      <h2 style={styles.tileTitle}>The things that keep you here.</h2>
      <p style={styles.tileBody}>
        A person, a routine, a place, a reason. Name them — then tap the ones you actually leaned on this week.
      </p>

      {supports.length === 0 && !adding && (
        <p style={styles.practicesEmpty}>Nothing named yet. Start with one.</p>
      )}

      {supports.length > 0 && (
        <div style={styles.supportsList}>
          {supports.map(s => {
            const leaned = s.last_leaned_week === weekOf
            return (
              <div key={s.id} style={styles.supportRow}>
                <div style={styles.supportInfo}>
                  <span style={styles.supportName}>{s.name}</span>
                  <span style={styles.supportType}>{typeLabel(s.type)}</span>
                </div>
                <button
                  onClick={() => onLean(s.id)}
                  disabled={leaned}
                  style={{ ...styles.leanBtn, ...(leaned ? styles.leanBtnOn : {}) }}
                >
                  {leaned ? 'Leaned on ✓' : 'Leaned on'}
                </button>
                <button onClick={() => onDelete(s.id)} style={styles.supportDelete} aria-label="Remove">✕</button>
              </div>
            )
          })}
        </div>
      )}

      {adding ? (
        <div style={styles.practicesAddBlock}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name it — e.g. my morning walk, or Priya"
            maxLength={60}
            style={styles.practicesInput}
          />
          <div style={styles.supportTypeRow}>
            {SUPPORT_TYPES.map(t => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                style={{ ...styles.supportTypeChip, ...(type === t.key ? styles.supportTypeChipOn : {}) }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={styles.practicesAddBtnRow}>
            <button onClick={() => { setAdding(false); setName('') }} style={styles.practicesCancelBtn}>Cancel</button>
            <button onClick={submit} style={styles.practicesSaveBtn}>Add</button>
          </div>
        </div>
      ) : (
        !atLimit && <button onClick={() => setAdding(true)} style={styles.practicesAddBtn}>+ Name a support</button>
      )}

      {atLimit && <p style={styles.tileHelperText}>That's a solid list. Tend it as life changes.</p>}
    </div>
  )
}

// ===================================================================
// TILE: BECOMING (weekly identity evidence -> build_evidence)
// ===================================================================
function BecomingTile({ recent, onSave }) {
  const weekOf = formatDateForDB(getMondayOfWeek(new Date()))
  const doneThisWeek = recent.some(r => r.payload && r.payload.week_of === weekOf)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!text.trim() || saving) return
    setSaving(true)
    const ok = await onSave(text)
    setSaving(false)
    if (ok) setText('')
    else alert('Could not save. Please try again.')
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Becoming</p>
      <h2 style={styles.tileTitle}>Who you're turning into.</h2>
      <p style={styles.tileBody}>
        One line a week. Small proof — something the old you wouldn't have managed.
      </p>

      {!doneThisWeek && (
        <>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="This week I'm someone who…"
            maxLength={120}
            disabled={saving}
            style={styles.becomingInput}
          />
          <button
            onClick={handleSave}
            disabled={!text.trim() || saving}
            style={{ ...styles.becomingSaveBtn, ...((!text.trim() || saving) ? styles.becomingSaveBtnDim : {}) }}
          >
            {saving ? 'Saving…' : 'Add this week'}
          </button>
        </>
      )}

      {doneThisWeek && <p style={styles.becomingDone}>Logged this week. The thread keeps growing.</p>}

      {recent.length > 0 && (
        <div style={styles.becomingThread}>
          {recent.map(r => (
            <div key={r.id} style={styles.becomingItem}>
              <span style={styles.becomingWeek}>{formatWeekLabel((r.payload && r.payload.week_of) || '')}</span>
              <span style={styles.becomingText}>{r.payload && r.payload.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ===================================================================
// TILE: ANCHORS
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
      <h3 style={styles.anchorsTitle}>The people who'd notice.</h3>
      <p style={styles.anchorsBody}>
        Here, anchors are less about crisis and more about staying connected.
        Keep the list reflecting who's actually in your life.
      </p>
      <button onClick={() => navigate('/anchors')} style={styles.anchorsBtnNew}>
        Open Anchors
      </button>
    </div>
  )
}

// ===================================================================
// TILE: ACTION (slim — slip/urge still available)
// ===================================================================
function ActionTile({ tracker, navigate, slipCount = 0, onMoveToReclaim }) {
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>If it gets loud</p>
      <h2 style={styles.tileTitle}>Urge Incoming</h2>
      <div style={styles.actionsRow}>
        <button
          onClick={() => navigate(`/urge/${tracker.id}`)}
          style={{ ...styles.actionBtn, ...styles.actionUrge }}
        >
          <span style={styles.actionIcon}>🌊</span>
          <span style={styles.actionLabel}>Log an urge</span>
        </button>
        <button
          onClick={() => navigate(`/slip/${tracker.id}`)}
          style={{ ...styles.actionBtn, ...styles.actionSlip }}
        >
          <span style={styles.actionIcon}>🫂</span>
          <span style={styles.actionLabel}>I slipped</span>
        </button>
      </div>
      <p style={styles.tileHelperText}>
        Rare doesn't mean impossible. The tools are still here.
      </p>

      {slipCount > 0 && (
        <div style={styles.slipProgress}>
          <div style={styles.slipDots}>
            {[1, 2, 3].map(n => (
              <span key={n} style={{ ...styles.slipDot, ...(slipCount >= n ? styles.slipDotOn : {}) }} />
            ))}
          </div>
          <span style={styles.slipProgressText}>
            {Math.min(slipCount, 3)} of 3 this stretch{slipCount < 3 ? ` · ${3 - slipCount} more before Reclaim` : ''}
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
// HELPERS
// ===================================================================
function getMondayOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDateForDB(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatWeekLabel(weekOfStr) {
  const d = new Date(weekOfStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ===================================================================
// STYLES
// ===================================================================
const styles = {
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
  slipDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#E8DFD0', border: '0.5px solid #DDCFB6' },
  slipDotOn: { background: '#C5572C', border: '0.5px solid #A8461F' },
  slipProgressText: { fontSize: '11.5px', color: '#8A6A3C', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4 },
  reclaimNudge: { marginTop: '14px', padding: '14px', borderRadius: '14px', background: 'linear-gradient(180deg, #FFFBF4 0%, #FBF1E2 100%)', border: '0.5px solid #EAD9BE' },
  reclaimNudgeText: { fontSize: '12.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 12px' },
  reclaimNudgeBtn: { width: '100%', padding: '12px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '11px', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(40,25,10,0.22)' },

  // --- slim perpetual counter ---
  slimCounter: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: '#FBF6EE', border: '0.5px solid #EFE7D7', borderRadius: '999px', alignSelf: 'flex-start' },
  slimDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#7E9B5A', flexShrink: 0, boxShadow: '0 0 0 3px rgba(126,155,90,0.18)' },
  slimDays: { fontSize: '13px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif' },
  slimClock: { fontSize: '12px', color: '#854F0B', fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' },
  slimFree: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' },

  // --- balance dials ---
  balanceList: { display: 'flex', flexDirection: 'column', gap: '12px', margin: '4px 0 10px' },
  balanceRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  balanceLabel: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', minWidth: '88px' },
  balanceDots: { display: 'flex', gap: '7px' },
  balanceDot: { width: '20px', height: '20px', borderRadius: '50%', background: 'white', border: '1px solid #E0D5C2', cursor: 'pointer', transition: 'all 0.15s', padding: 0 },
  balanceDotOn: { background: '#C8A86A', border: '1px solid #B6924E' },
  balanceScale: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 14px' },
  balanceSaveBtn: { width: '100%', padding: '13px', background: '#854F0B', color: '#FBF6EE', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif' },

  // --- supports ---
  supportsList: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' },
  supportRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#FDFBF6', border: '0.5px solid #EFE7D7', borderRadius: '10px' },
  supportInfo: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' },
  supportName: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.3 },
  supportType: { fontSize: '10px', color: '#9C8C78', fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.08em' },
  leanBtn: { padding: '6px 10px', background: 'white', border: '0.5px solid #DDCFB6', borderRadius: '999px', fontSize: '11px', fontWeight: 500, color: '#854F0B', cursor: 'pointer', fontFamily: 'Georgia, serif', flexShrink: 0 },
  leanBtnOn: { background: 'linear-gradient(180deg, #F6FAE9 0%, #ECF3D5 100%)', border: '0.5px solid #C2D49A', color: '#3B6D11', cursor: 'default' },
  supportDelete: { background: 'transparent', border: 'none', color: '#BCAE99', fontSize: '13px', cursor: 'pointer', padding: '2px 4px', flexShrink: 0 },
  supportTypeRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '0 0 8px' },
  supportTypeChip: { padding: '6px 12px', background: 'white', border: '0.5px solid #DDCFB6', borderRadius: '999px', fontSize: '12px', color: '#6B5C4A', cursor: 'pointer', fontFamily: 'Georgia, serif' },
  supportTypeChipOn: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: '0.5px solid #241710' },

  // --- becoming ---
  becomingInput: { width: '100%', boxSizing: 'border-box', padding: '12px 14px', background: 'white', border: '0.5px solid #DDCFB6', borderRadius: '12px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', outline: 'none', marginBottom: '10px' },
  becomingSaveBtn: { width: '100%', padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Georgia, serif', boxShadow: '0 4px 14px rgba(40,25,10,0.22)' },
  becomingSaveBtnDim: { opacity: 0.5, cursor: 'not-allowed' },
  becomingDone: { fontSize: '12px', color: '#3B6D11', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '0 0 4px' },
  becomingThread: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px', borderTop: '0.5px solid #EFE7D7', paddingTop: '14px' },
  becomingItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  becomingWeek: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Georgia, serif', fontWeight: 500 },
  becomingText: { fontSize: '13.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.45 },
  // --- v2 additions: gentle daily check-in ---
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
    textTransform: 'uppercase', letterSpacing: '0.16em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 10px',
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

  // GREETING
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

  // QUIET COUNTER
  counterTile: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '18px',
    padding: '24px 22px 20px',
    boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
    textAlign: 'left',
  },
  counterEyebrow: {
    fontSize: '10px', color: '#854F0B',
    textTransform: 'uppercase', letterSpacing: '0.28em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 12px',
  },
  counterHeadline: {
    fontSize: '32px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.1,
    margin: '0 0 6px',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.01em',
  },
  counterFree: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 14px',
    lineHeight: 1.4,
  },
  counterBold: {
    color: '#2A1F15', fontWeight: 500, fontStyle: 'italic',
  },
  counterSince: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    margin: 0,
    letterSpacing: '0.04em',
  },

  // PULSE CHECK
  pulseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  pulseBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    padding: '12px 12px 10px',
    background: 'white',
    border: '0.5px solid #E0D5C2',
    borderRadius: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  pulseBtnPicked: {
    borderWidth: '1px',
    boxShadow: '0 3px 10px rgba(80,50,20,0.08)',
  },
  pulseDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginBottom: '2px',
    transition: 'box-shadow 0.15s',
  },
  pulseLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
  },
  pulseHelper: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.4,
  },

  pulseDivider: {
    height: '0.5px',
    background: '#E0D5C2',
    margin: '18px 0 12px',
  },
  pulseTrajLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
  },
  pulseTrajRow: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  pulseTrajItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  pulseTrajDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  pulseTrajWeek: {
    fontSize: '10px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },

  // PRACTICES
  practicesEmpty: {
    fontSize: '13px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '4px 0 12px',
    textAlign: 'center',
  },
  practicesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '12px',
  },
  practiceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '10px',
  },
  practiceBullet: {
    fontSize: '20px',
    color: '#854F0B',
    lineHeight: 1,
    flexShrink: 0,
  },
  practiceText: {
    flex: 1,
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.4,
  },
  practiceDelete: {
    background: 'transparent',
    border: 'none',
    color: '#9C8C78',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 6px',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  practicesAddBtn: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    color: '#854F0B',
    border: '1px dashed #C9B894',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  practicesAddBlock: {
    background: '#FDFBF6',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    padding: '10px',
  },
  practicesInput: {
    width: '100%',
    padding: '10px 12px',
    background: 'white',
    border: '0.5px solid #DDCFB6',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '8px',
  },
  practicesAddBtnRow: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  practicesCancelBtn: {
    padding: '8px 14px',
    background: 'transparent',
    color: '#6B5C4A',
    border: '0.5px solid #DDCFB6',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  practicesSaveBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 3px 10px rgba(40,25,10,0.2)',
  },
  practicesSaveBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  // ANCHORS
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

  // ACTIONS (slim)
  actionsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
  },
  actionBtn: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '6px',
    padding: '14px 8px',
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
  actionIcon: { fontSize: '20px' },
  actionLabel: {
    fontSize: '13px', fontWeight: 500,
    fontFamily: 'Georgia, serif',
  },
}