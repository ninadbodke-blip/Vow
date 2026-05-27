import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import VowBrandMark from '../../components/VowBrandMark'
import BottomNav from '../../components/BottomNav'
import DailyCheckin, { moodByScore, moodByValue } from './DailyCheckin'
import JournalTile from './JournalTile'
import { resolveAddictionTypeId } from '../vowPath/utils/addictionTypes'

// ===================================================================
// COMMIT-FREE HOME
// ===================================================================
// Engine: Preparation Log ("Today's Move"). User logs concrete prep
// acts via category chip + optional one-liner. Contribution map shows
// the countdown window filling up. Data feeds Mirror.
// ===================================================================

const MOVE_CATEGORIES = [
  { value: 'told_someone',    icon: '🗣',  label: 'Told someone' },
  { value: 'pictured_future', icon: '🧠',  label: 'Pictured a future moment' },
  { value: 'reduced_access',  icon: '🏠',  label: 'Made it harder to access' },
  { value: 'asked_support',   icon: '📞',  label: 'Asked for support' },
  { value: 'made_plan',       icon: '🎯',  label: 'Made a plan' },
  { value: 'learned',         icon: '📚',  label: 'Learned something' },
  { value: 'removed_trigger', icon: '🧹',  label: 'Removed a trigger' },
  { value: 'rehearsed_no',    icon: '🚫',  label: 'Rehearsed saying no' },
  { value: 'set_reward',      icon: '🎁',  label: 'Lined up a reward' },
  { value: 'wrote_it_down',   icon: '✍️',  label: 'Wrote it down' },
]

const CATEGORY_BY_VALUE = MOVE_CATEGORIES.reduce((acc, c) => {
  acc[c.value] = c
  return acc
}, {})

const ProfileIcon = () => (
  <svg
    width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

// ===================================================================
// MAIN COMPONENT
// ===================================================================
export default function CommitFreeHome({ progress: initialProgress }) {
  const navigate = useNavigate()

  const [progress, setProgress] = useState(initialProgress)
  const [firstName, setFirstName] = useState('')
  const [anchorCount, setAnchorCount] = useState(0)
  const [todayCheckin, setTodayCheckin] = useState(null)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [confidenceLatest, setConfidenceLatest] = useState(null)
  const [vowLatest, setVowLatest] = useState(null)
  const [moves, setMoves] = useState([])   // preparation moves (stored as commit_prep signals)
  const [loading, setLoading] = useState(true)
  const [, setTickCount] = useState(0)
  const [savingDate, setSavingDate] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [editingStopDate, setEditingStopDate] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setTickCount(c => c + 1), 1000)
    return () => clearInterval(id)
  }, [])

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

      const { count } = await supabase
        .from('anchors')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if (count !== null) setAnchorCount(count)

      // daily check-in (shared signal)
      const { data: tc } = await supabase
        .from('free_daily_checkins').select('*')
        .eq('user_id', user.id).eq('checkin_date', localDateStr()).maybeSingle()
      if (tc) setTodayCheckin(tc)

      // latest readiness + vow signals
      const { data: conf } = await supabase
        .from('free_stage_signals').select('*')
        .eq('user_id', user.id).eq('signal_type', 'commit_confidence')
        .order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (conf) setConfidenceLatest(conf)

      const { data: vow } = await supabase
        .from('free_stage_signals').select('*')
        .eq('user_id', user.id).eq('signal_type', 'commit_vow')
        .order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (vow) setVowLatest(vow)

      // preparation moves — stored as signals, consistent with readiness/vow
      const { data: prepRows } = await supabase
        .from('free_stage_signals').select('id, payload, created_at')
        .eq('user_id', user.id).eq('signal_type', 'commit_prep')
        .order('created_at', { ascending: false })
      if (prepRows) {
        setMoves(prepRows.map(r => ({
          id: r.id,
          date: r.payload?.date,
          category: r.payload?.category,
          description: r.payload?.description || null,
          logged_at: r.payload?.logged_at,
        })))
      }

      setLoading(false)
    }
    load()
  }, [])

  const stopDate = progress.endure_starts_at
    ? new Date(progress.endure_starts_at + 'T00:00:00')
    : null
  const nowForState = new Date()
  const stopDateState = !stopDate
    ? 'not_set'
    : stopDate.getTime() <= nowForState.getTime()
      ? 'past'
      : 'future'

  const showCountdown = stopDateState === 'future'
  const showArrived = stopDateState === 'past'

  const handleSaveStopDate = async (dateStr) => {
    setSavingDate(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('vow_path_progress')
        .update({
          endure_starts_at: dateStr,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Failed to save stop date:', error)
        alert('Could not save. Please try again.')
        return
      }
      setProgress(data)
      setEditingStopDate(false)
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
    } finally {
      setSavingDate(false)
    }
  }

  const handleAddMove = async (category, description) => {
    if (!category) return false
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const now = new Date()
    const payload = {
      category,
      description: (description || '').trim() || null,
      date: formatDateInput(now),
      logged_at: now.toISOString(),
    }

    const { data, error } = await supabase
      .from('free_stage_signals')
      .insert({ user_id: user.id, stage: 'commit', signal_type: 'commit_prep', payload })
      .select('id').single()

    if (error || !data) {
      console.error('Failed to save move:', error)
      alert('Could not save. Please try again.')
      return false
    }
    setMoves(prev => [{ id: data.id, ...payload }, ...prev].slice(0, 500))
    return true
  }

  const handleDeleteMove = async (id) => {
    const prev = moves
    setMoves(cur => cur.filter(m => m.id !== id))
    const { error } = await supabase.from('free_stage_signals').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete move:', error)
      setMoves(prev)
      alert('Could not delete. Please try again.')
    }
  }

  const handleBeginEndure = async () => {
    if (transitioning) return
    setTransitioning(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setTransitioning(false); return }
      const now = new Date().toISOString()

      // RESUME PATH: a live streak already running + Endure begun before means the
      // user reached Endure/Build, wandered back here to look around, and is now
      // returning. Keep the clock running — never restart it, never relock Build.
      const { data: liveTrk } = await supabase.from('trackers')
        .select('id').eq('user_id', user.id).eq('is_active', true).order('created_at').limit(1)
      if (liveTrk && liveTrk.length) {
        const { data: ev } = await supabase.from('free_stage_signals')
          .select('id').eq('user_id', user.id)
          .or('signal_type.eq.endure_began,stage.eq.endure,stage.eq.build').limit(1)
        if (ev && ev.length) {
          const { error: rErr } = await supabase.from('vow_path_progress')
            .update({ free_state: 'endure', updated_at: now }).eq('user_id', user.id)
          if (rErr) {
            console.error('resume endure failed:', rErr)
            alert('Could not return to Endure: ' + (rErr.message || 'please try again.'))
            setTransitioning(false)
            return
          }
          window.location.assign('/home')
          return
        }
      }

      const addictionTypeId = await resolveAddictionTypeId(progress.primary_substance)

      // (Re)start a tracker so the counter has something to run on. Prefer the
      // one for this substance, else the user's most recent. A tracker hiccup
      // must NOT block the transition — landing in Endure is what matters.
      let trackerId = null
      if (addictionTypeId != null) {
        const { data: byType } = await supabase.from('trackers').select('id')
          .eq('user_id', user.id).eq('addiction_type_id', addictionTypeId).order('created_at')
        if (byType && byType.length > 0) trackerId = byType[0].id
      }
      if (!trackerId) {
        const { data: anyTrk } = await supabase.from('trackers').select('id')
          .eq('user_id', user.id).order('created_at')
        if (anyTrk && anyTrk.length > 0) trackerId = anyTrk[0].id
      }
      if (trackerId) {
        const { error: tErr } = await supabase.from('trackers')
          .update({ start_date: now, is_active: true, tracker_status: 'active' })
          .eq('id', trackerId)
        if (tErr) console.error('tracker reactivate failed (continuing):', tErr)
      } else if (addictionTypeId != null) {
        const { error: iErr } = await supabase.from('trackers')
          .insert({ user_id: user.id, addiction_type_id: addictionTypeId, start_date: now, is_active: true, tracker_status: 'active' })
        if (iErr) console.error('tracker insert failed (continuing):', iErr)
      }

      // The transition itself — the only step that gates landing in Endure.
      const { error: progressError } = await supabase
        .from('vow_path_progress')
        .update({
          free_state: 'endure',
          endure_starts_at: null,
          endure_slip_count: 0,
          updated_at: now,
        })
        .eq('user_id', user.id)

      if (progressError) {
        console.error('Failed to update free_state:', progressError)
        alert('Could not start Endure: ' + (progressError.message || 'please try again.'))
        setTransitioning(false)
        return
      }

      // Mark that Endure has genuinely begun — future re-entries resume this streak.
      await supabase.from('free_stage_signals').insert({
        user_id: user.id, stage: 'endure', signal_type: 'endure_began', payload: { began_at: now },
      })

      window.location.assign('/home')
    } catch (err) {
      console.error(err)
      alert('Something went wrong: ' + (err?.message || 'please try again.'))
      setTransitioning(false)
    }
  }

    const handleCheckinSaved = (row) => setTodayCheckin(row)
  const handleConfidenceSaved = (row) => setConfidenceLatest(row)
  const handleVowSaved = (row) => setVowLatest(row)

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

        <GreetingTile firstName={firstName} substanceLabel={progress.substance_label} />

        <TodayCheckinTile checkin={todayCheckin} onOpen={() => setCheckinOpen(true)} />

        {/* JOURNAL (shared) */}
        <JournalTile stage="commit" />

        {stopDateState === 'not_set' && (
          <Launcher
            icon="📅"
            title="Set your stop date"
            summary="Pick the day you stop — up to 14 days out."
            done={false}
            onOpen={() => setEditingStopDate(true)}
          />
        )}
        {showCountdown && (
          <CountdownTile
            stopDate={stopDate}
            onChangeDate={() => setEditingStopDate(true)}
          />
        )}
        {showArrived && (
          <StopDateArrivedTile
            stopDate={stopDate}
            onBeginEndure={handleBeginEndure}
            onPickNewDate={() => setEditingStopDate(true)}
            transitioning={transitioning}
          />
        )}
        <StopDateSheet
          open={editingStopDate}
          prefillValue={progress.endure_starts_at}
          onSave={handleSaveStopDate}
          onClose={() => setEditingStopDate(false)}
          saving={savingDate}
        />

        <ReadinessTile latest={confidenceLatest} onSaved={handleConfidenceSaved} />

        <VowTile latest={vowLatest} onSaved={handleVowSaved} />

        {/* DEFENSIVE ENGINEERING — launchers open blurred cards */}
        <PerimeterLockTile />

        <FearMatrixTile />

        <PreparationLogTile
          moves={moves}
          stopDateISO={progress.endure_starts_at}
          onAddMove={handleAddMove}
          onDeleteMove={handleDeleteMove}
        />

        <AnchorsTile navigate={navigate} anchorCount={anchorCount} />

        <BottomNav />
      </div>

      <DailyCheckin
        isOpen={checkinOpen}
        onClose={() => setCheckinOpen(false)}
        stage="commit"
        existing={todayCheckin}
        onSaved={handleCheckinSaved}
      />
    </div>
  )
}

// ===================================================================
// ACTIVITY SHEET + LAUNCHER — clean home, options live in floating cards
// ===================================================================
function ActivitySheet({ open, onClose, eyebrow, title, children }) {
  if (!open) return null
  return (
    <div style={styles.sheetBackdrop} onClick={onClose}>
      <div style={styles.sheetCard} onClick={(e) => e.stopPropagation()}>
        <div style={styles.sheetHead}>
          <div style={{ flex: 1 }}>
            {eyebrow && <p style={styles.sheetEyebrow}>{eyebrow}</p>}
            <h2 style={styles.sheetTitle}>{title}</h2>
          </div>
          <button onClick={onClose} style={styles.sheetClose} aria-label="Close">✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

function Launcher({ icon, title, summary, done, onOpen }) {
  return (
    <button onClick={onOpen} style={styles.launcher}>
      <div style={styles.launcherTop}>
        <span style={styles.launcherIcon}>{icon}</span>
        <span style={{ ...styles.launcherChip, ...(done ? styles.launcherChipDone : {}) }}>
          {done ? 'Logged ✓' : 'Open ›'}
        </span>
      </div>
      <h2 style={styles.launcherTitle}>{title}</h2>
      <p style={styles.launcherSummary}>{summary}</p>
    </button>
  )
}

// Stop-date picker, now inside a floating card
function StopDateSheet({ open, prefillValue, onSave, onClose, saving }) {
  const today = new Date()
  const max = new Date()
  max.setDate(today.getDate() + 14)
  const [selectedDate, setSelectedDate] = useState(prefillValue || '')
  useEffect(() => { if (open) setSelectedDate(prefillValue || '') }, [open, prefillValue])

  return (
    <ActivitySheet open={open} onClose={onClose} eyebrow="Stop date" title="When will you stop?">
      <p style={styles.sheetLead}>
        Pick a date within the next 14 days. The countdown begins at midnight on that day.
      </p>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        min={formatDateInput(today)}
        max={formatDateInput(max)}
        style={styles.dateInput}
      />
      <button
        onClick={() => selectedDate && onSave(selectedDate)}
        disabled={saving || !selectedDate}
        style={{ ...styles.sheetSaveBtn, ...((saving || !selectedDate) ? styles.saveBtnDim : {}) }}
      >
        {saving ? 'Saving…' : 'Save stop date'}
      </button>
      <p style={styles.tileHelperText}>You can change this any time before stop day.</p>
    </ActivitySheet>
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
      <h2 style={styles.tileTitle}>How are you, really?</h2>
      <p style={styles.tileBody}>
        A quiet half-minute. Mood, energy, whether the pull came by. Nobody sees it but you.
      </p>
      <button onClick={onOpen} style={styles.checkinCtaBtn}>Check in</button>
    </div>
  )
}

// ===================================================================
// TILE: READINESS RULER (commit_confidence, new)
// ===================================================================
// 1..10 readiness. Each save inserts a free_stage_signals row
// (signal_type 'commit_confidence', payload {score}) -> trend in Mirror.
const READINESS_BLOCKERS = [
  'Cravings still strong',
  'Not sure I can do it',
  'Stress is too high',
  'No support lined up yet',
  'Afraid of what I’ll lose',
  'Nothing — I’m ready',
]

function ReadinessTile({ latest, onSaved }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(latest?.payload?.score ?? 5)
  const [blocker, setBlocker] = useState(latest?.payload?.blocker ?? null)
  const [saving, setSaving] = useState(false)
  const savedScore = latest?.payload?.score ?? null

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: saved, error } = await supabase
        .from('free_stage_signals')
        .insert({ user_id: user.id, stage: 'commit', signal_type: 'commit_confidence', payload: { score: value, blocker } })
        .select().single()
      if (error) { console.error(error); alert('Could not save. Please try again.'); setSaving(false); return }
      if (onSaved && saved) onSaved(saved)
      setSaving(false); setOpen(false)
    } catch (err) { console.error(err); setSaving(false) }
  }

  const done = savedScore != null
  const summary = done ? `You're at ${savedScore}/10 right now.` : 'Mark how ready you actually feel today.'

  return (
    <>
      <Launcher icon="🎯" title="Readiness, today" summary={summary} done={done} onOpen={() => setOpen(true)} />
      <ActivitySheet open={open} onClose={() => setOpen(false)} eyebrow="Readiness · today" title="How ready do you feel?">
        <p style={styles.sheetLead}>
          Not how ready you think you should feel. How ready you actually are, right now.
        </p>
        <div style={styles.rulerRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <button key={n} onClick={() => setValue(n)} disabled={saving}
              style={{ ...styles.rulerSeg, ...(n <= value ? styles.rulerSegOn : {}) }}
              aria-label={`Readiness ${n} of 10`} />
          ))}
        </div>
        <div style={styles.rulerLabels}>
          <span>Not yet</span>
          <span style={styles.rulerValue}>{value}/10</span>
          <span>Fully ready</span>
        </div>
        <p style={styles.cGroupLabel}>What's the biggest thing in the way?</p>
        <div style={styles.cPillWrap}>
          {READINESS_BLOCKERS.map(b => (
            <button key={b} onClick={() => setBlocker(b)} disabled={saving}
              style={{ ...styles.cPill, ...(blocker === b ? styles.cPillThreatOn : {}) }}>{b}</button>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving} style={styles.sheetSaveBtn}>
          {saving ? 'Saving…' : (done ? 'Update readiness' : 'Save readiness')}
        </button>
      </ActivitySheet>
    </>
  )
}

// ===================================================================
// TILE: VOW (commit_vow, new — light free-tier version)
// ===================================================================
const VOW_STARTERS = ['I’m doing this because', 'I’m done with', 'What I’ll get back is', 'The person I want to be']

function VowTile({ latest, onSaved }) {
  const existingText = latest?.payload?.text || ''
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(existingText)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setText(latest?.payload?.text || '') }, [latest])

  const handleSave = async () => {
    if (saving || !text.trim()) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: saved, error } = await supabase
        .from('free_stage_signals')
        .insert({ user_id: user.id, stage: 'commit', signal_type: 'commit_vow', payload: { text: text.trim() } })
        .select().single()
      if (error) { console.error(error); alert('Could not save. Please try again.'); setSaving(false); return }
      if (onSaved && saved) onSaved(saved)
      setSaving(false); setOpen(false)
    } catch (err) { console.error(err); setSaving(false) }
  }

  const done = !!existingText
  const summary = done ? `"${existingText}"` : "Write the one line you'll come back to."

  return (
    <>
      <Launcher icon="🤝" title="Your vow" summary={summary} done={done} onOpen={() => setOpen(true)} />
      <ActivitySheet open={open} onClose={() => setOpen(false)} eyebrow="Your vow" title="What are you committing to?">
        <p style={styles.sheetLead}>
          One honest line, in your own words. Something to come back to on the hard days.
        </p>
        <div style={styles.vowStarters}>
          {VOW_STARTERS.map(st => (
            <button key={st} type="button" disabled={saving}
              onClick={() => setText(t => (t.trim() ? t.trimEnd() + ' ' : '') + st + ' ')}
              style={styles.vowStarterChip}>{st}…</button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="I'm doing this because…"
          style={styles.vowInput} rows={3} maxLength={280} disabled={saving} />
        <button onClick={handleSave} disabled={saving || !text.trim()}
          style={{ ...styles.sheetSaveBtn, ...(!text.trim() ? styles.saveBtnDim : {}) }}>
          {saving ? 'Saving…' : (done ? 'Revise my vow' : 'Save my vow')}
        </button>
      </ActivitySheet>
    </>
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
      <p style={styles.greetingEyebrow}>COMMIT</p>
      <h1 style={styles.greetingTitle}>
        {timeGreeting}{firstName ? `, ${firstName}` : ''}.
      </h1>
      <p style={styles.greetingSubtitle}>
        Preparing to stop <em style={styles.substanceEm}>{substanceLabel}</em>.
        Every move counts now.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: STOP DATE SETUP
// ===================================================================
function StopDateSetupTile({ prefillValue, onSave, onCancel, saving }) {
  const today = new Date()
  const max = new Date()
  max.setDate(today.getDate() + 14)

  const [selectedDate, setSelectedDate] = useState(prefillValue || '')

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Stop date</p>
      <h2 style={styles.tileTitle}>When will you stop?</h2>
      <p style={styles.tileBody}>
        Pick a date within the next 14 days. The countdown begins at midnight
        on that day.
      </p>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        min={formatDateInput(today)}
        max={formatDateInput(max)}
        style={styles.dateInput}
      />

      <div style={styles.setupBtnRow}>
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={saving}
            style={styles.setupCancelBtn}
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => selectedDate && onSave(selectedDate)}
          disabled={saving || !selectedDate}
          style={{
            ...styles.setupSaveBtn,
            ...(saving || !selectedDate ? styles.setupSaveBtnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Save stop date'}
        </button>
      </div>

      <p style={styles.tileHelperText}>
        You can change this any time before stop day.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: COUNTDOWN
// ===================================================================
function CountdownTile({ stopDate, onChangeDate }) {
  const now = new Date()
  let totalMs = stopDate.getTime() - now.getTime()
  if (totalMs < 0) totalMs = 0

  const totalSecs = Math.floor(totalMs / 1000)
  const days = Math.floor(totalSecs / 86400)
  const hours = Math.floor((totalSecs % 86400) / 3600)
  const mins = Math.floor((totalSecs % 3600) / 60)
  const secs = totalSecs % 60

  const dateStr = stopDate.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div style={styles.countdownTile}>
      <p style={styles.countdownEyebrow}>STOP DATE</p>
      <h2 style={styles.countdownDate}>{dateStr}</h2>

      <div style={styles.countdownDivider} />

      <div style={styles.countdownGrid}>
        <div style={styles.countdownCell}>
          <p style={styles.countdownN}>{days}</p>
          <p style={styles.countdownU}>days</p>
        </div>
        <div style={styles.countdownCell}>
          <p style={styles.countdownN}>{String(hours).padStart(2, '0')}</p>
          <p style={styles.countdownU}>hrs</p>
        </div>
        <div style={styles.countdownCell}>
          <p style={styles.countdownN}>{String(mins).padStart(2, '0')}</p>
          <p style={styles.countdownU}>mins</p>
        </div>
        <div style={styles.countdownCell}>
          <p style={styles.countdownN}>{String(secs).padStart(2, '0')}</p>
          <p style={styles.countdownU}>secs</p>
        </div>
      </div>

      <p style={styles.countdownMicro}>
        Use these days to prepare. The map below fills as you do.
      </p>

      <button onClick={onChangeDate} style={styles.changeDateBtn}>
        Change stop date
      </button>
    </div>
  )
}

// ===================================================================
// TILE: STOP DATE ARRIVED
// ===================================================================
function StopDateArrivedTile({ stopDate, onBeginEndure, onPickNewDate, transitioning }) {
  const now = new Date()
  const isToday = stopDate.toDateString() === now.toDateString()
  const headline = isToday ? 'Your stop date has arrived.' : 'Your stop date has passed.'
  const body = isToday
    ? 'Today is the day you chose. You can begin now, or pick a new date.'
    : 'The date you picked has passed. Begin now, or set a new date forward.'

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Stop date</p>
      <h2 style={styles.tileTitle}>{headline}</h2>
      <p style={styles.tileBody}>{body}</p>

      <button
        onClick={onBeginEndure}
        disabled={transitioning}
        style={{
          ...styles.beginEndureBtn,
          ...(transitioning ? styles.beginEndureBtnDisabled : {}),
        }}
      >
        {transitioning ? 'Starting Endure...' : 'Begin Endure now'}
      </button>

      <button
        onClick={onPickNewDate}
        disabled={transitioning}
        style={styles.pickNewDateBtn}
      >
        Pick a new date
      </button>

      <p style={styles.tileHelperText}>
        From the moment you tap, your day count begins.
      </p>
    </div>
  )
}

// ===================================================================
// TILE: PERIMETER LOCK — secure the infrastructure (commit_perimeter)
// ===================================================================
const PERIMETER_PROTOCOLS = [
  { id: 'environment', label: 'Environment cleared', sub: 'Stash and cues removed' },
  { id: 'access', label: 'Access cut off', sub: 'Sources and suppliers blocked' },
  { id: 'anchor', label: 'Anchor notified', sub: 'Someone knows Day 0' },
  { id: 'day1', label: 'Day 1 planned', sub: 'First 24 hours mapped' },
  { id: 'triggers', label: 'Triggers mapped', sub: 'You know where it hits' },
  { id: 'times', label: 'High-risk hours flagged', sub: 'You know when it hits' },
  { id: 'money', label: 'Money guarded', sub: 'Spending paths limited' },
  { id: 'reward', label: 'A reward lined up', sub: 'Something to aim toward' },
]

function PerimeterLockTile() {
  const [open, setOpen] = useState(false)
  const [locked, setLocked] = useState([])
  const [rowId, setRowId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedLocked, setSavedLocked] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('free_stage_signals')
        .select('id, payload').eq('user_id', user.id).eq('stage', 'commit')
        .eq('signal_type', 'commit_perimeter')
        .order('created_at', { ascending: false }).limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row) { setRowId(row.id); const lk = row.payload?.locked || []; setLocked(lk); setSavedLocked(lk) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const toggle = (id) => setLocked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const total = PERIMETER_PROTOCOLS.length
  const livePct = Math.round((locked.length / total) * 100)
  const done = savedLocked != null && savedLocked.length > 0
  const savedPct = done ? Math.round((savedLocked.length / total) * 100) : 0
  const summary = done
    ? `Perimeter ${savedPct}% locked · ${savedLocked.length} of ${total}`
    : 'Lock down your infrastructure before Day 0.'

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { locked }
    let ok = false
    if (rowId) { const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId); ok = !error }
    else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage: 'commit', signal_type: 'commit_perimeter', payload }).select('id').single()
      ok = !error && !!data; if (ok) setRowId(data.id)
    }
    setSaving(false)
    if (ok) { setSavedLocked(locked); setOpen(false) } else alert('Could not save. Please try again.')
  }

  return (
    <>
      <Launcher icon="🔒" title="Perimeter lock" summary={summary} done={done} onOpen={() => setOpen(true)} />
      <ActivitySheet open={open} onClose={() => setOpen(false)} eyebrow="Defensive engineering" title="Secure the infrastructure">
        <p style={styles.sheetLead}>
          Four protocols to lock down before Day 0. Tap each as you secure it — a vow on unsecured ground is fragile.
        </p>
        <div style={styles.perimGrid}>
          {PERIMETER_PROTOCOLS.map(pr => {
            const isLocked = locked.includes(pr.id)
            return (
              <button key={pr.id} onClick={() => toggle(pr.id)} disabled={saving}
                style={{ ...styles.perimCell, ...(isLocked ? styles.perimCellLocked : {}) }}>
                <span style={styles.perimLockIcon}>{isLocked ? '🔒' : '○'}</span>
                <span style={{ ...styles.perimCellLabel, ...(isLocked ? styles.perimCellLabelOn : {}) }}>{pr.label}</span>
                <span style={{ ...styles.perimCellSub, ...(isLocked ? styles.perimCellSubOn : {}) }}>{pr.sub}</span>
              </button>
            )
          })}
        </div>
        <p style={styles.perimPct}>{livePct}% locked</p>
        <button onClick={handleSave} disabled={saving} style={styles.sheetSaveBtn}>
          {saving ? 'Saving…' : 'Lock it in'}
        </button>
      </ActivitySheet>
    </>
  )
}

// ===================================================================
// TILE: FEAR MITIGATION MATRIX — if/then for Day 0 (commit_fear)
// ===================================================================
const FEAR_THREATS = ['Boredom', 'Physical pain', 'Social pressure', 'Emotional crash', 'A celebration', 'Loneliness', 'A fight or stress', 'The old place or routine', 'A sudden craving', "Can't sleep"]
const FEAR_SIGNS = ['Restlessness', 'A "just once" thought', 'Reaching for my phone', 'Bargaining with myself', 'Pulling away from people', 'A spike of stress']
const FEAR_COUNTERS = ['Call my anchor', 'Ride the 20-min wave', 'Leave the room', 'Go to sleep', 'Move my body', 'Text someone now', 'Re-read my vow', 'Eat and drink water']

function FearMatrixTile() {
  const [open, setOpen] = useState(false)
  const [threat, setThreat] = useState(null)
  const [sign, setSign] = useState(null)
  const [mitigation, setMitigation] = useState(null)
  const [rowId, setRowId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedThreat, setSavedThreat] = useState(null)
  const [savedSign, setSavedSign] = useState(null)
  const [savedMitigation, setSavedMitigation] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('free_stage_signals')
        .select('id, payload').eq('user_id', user.id).eq('stage', 'commit')
        .eq('signal_type', 'commit_fear')
        .order('created_at', { ascending: false }).limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row) {
        setRowId(row.id)
        setThreat(row.payload?.threat || null); setSavedThreat(row.payload?.threat || null)
        setSign(row.payload?.sign || null); setSavedSign(row.payload?.sign || null)
        setMitigation(row.payload?.mitigation || null); setSavedMitigation(row.payload?.mitigation || null)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const done = savedThreat != null && savedSign != null && savedMitigation != null
  const summary = done ? `${savedThreat} → ${savedMitigation}` : 'Name your Day 0 risk — and your counter-move.'

  const handleSave = async () => {
    if (saving || !threat || !sign || !mitigation) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { threat, sign, mitigation }
    let ok = false
    if (rowId) { const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId); ok = !error }
    else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage: 'commit', signal_type: 'commit_fear', payload }).select('id').single()
      ok = !error && !!data; if (ok) setRowId(data.id)
    }
    setSaving(false)
    if (ok) { setSavedThreat(threat); setSavedSign(sign); setSavedMitigation(mitigation); setOpen(false) } else alert('Could not save. Please try again.')
  }

  return (
    <>
      <Launcher icon="🛡️" title="Fear mitigation matrix" summary={summary} done={done} onOpen={() => setOpen(true)} />
      <ActivitySheet open={open} onClose={() => setOpen(false)} eyebrow="Map the threat · Day 0" title="If this hits, then what?">
        <p style={styles.sheetLead}>
          The brain panics near Day 0 and pushes you to delay. Name the risk now and pair it with a move — that shrinks its power.
        </p>
        <p style={styles.cGroupLabel}>My biggest risk on Day 0 will be…</p>
        <div style={styles.cPillWrap}>
          {FEAR_THREATS.map(t => (
            <button key={t} onClick={() => setThreat(t)} disabled={saving}
              style={{ ...styles.cPill, ...(threat === t ? styles.cPillThreatOn : {}) }}>{t}</button>
          ))}
        </div>
        <p style={styles.cGroupLabel}>The first sign it's coming will be…</p>
        <div style={styles.cPillWrap}>
          {FEAR_SIGNS.map(sg => (
            <button key={sg} onClick={() => setSign(sg)} disabled={saving}
              style={{ ...styles.cPill, ...(sign === sg ? styles.cPillSignOn : {}) }}>{sg}</button>
          ))}
        </div>
        <p style={styles.cGroupLabel}>When it hits, I will…</p>
        <div style={styles.cPillWrap}>
          {FEAR_COUNTERS.map(co => (
            <button key={co} onClick={() => setMitigation(co)} disabled={saving}
              style={{ ...styles.cPill, ...(mitigation === co ? styles.cPillCounterOn : {}) }}>{co}</button>
          ))}
        </div>
        {threat && sign && mitigation && (
          <div style={styles.cMatrix}>
            <p style={styles.cMatrixText}>If <strong>{threat}</strong> hits</p>
            <p style={styles.cMatrixText}>— first sign, <strong>{sign.toLowerCase()}</strong> —</p>
            <p style={styles.cMatrixText}>then I'll <strong>{mitigation.toLowerCase()}</strong>.</p>
            <p style={styles.cMatrixNote}>The threat is mapped. The plan is sound.</p>
          </div>
        )}
        <button onClick={handleSave} disabled={saving || !threat || !sign || !mitigation}
          style={{ ...styles.sheetSaveBtn, ...((!threat || !sign || !mitigation) ? styles.saveBtnDim : {}) }}>
          {saving ? 'Saving…' : 'Lock the plan'}
        </button>
      </ActivitySheet>
    </>
  )
}

// ===================================================================
// TILE: PREPARATION LOG (the engine)
// ===================================================================
function PreparationLogTile({ moves, stopDateISO, onAddMove, onDeleteMove }) {
  const [logging, setLogging] = useState(false)
  const todayStr = formatDateInput(new Date())
  const todayMoves = moves.filter(m => m.date === todayStr)
  const totalMoves = moves.length
  const daysTouched = new Set(moves.map(m => m.date)).size

  // Top category
  const categoryCounts = moves.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1
    return acc
  }, {})
  const topCategoryEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]
  const topCategory = topCategoryEntry ? CATEGORY_BY_VALUE[topCategoryEntry[0]] : null

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>
        Today's preparation
        {todayMoves.length > 0 && <span style={styles.eyebrowCount}> · {todayMoves.length} {todayMoves.length === 1 ? 'move' : 'moves'}</span>}
      </p>
      <h2 style={styles.tileTitle}>
        {todayMoves.length === 0
          ? 'What did you do today to prepare?'
          : "Today's moves"}
      </h2>
      <p style={styles.tileBody}>
        {todayMoves.length === 0
          ? 'Tell someone. Picture a future moment. Move the bottle. Each one counts. Each one fills the map below.'
          : 'You can log more whenever something happens.'}
      </p>

      {todayMoves.length > 0 && (
        <div style={styles.todayChipsWrap}>
          {todayMoves.map(move => {
            const cat = CATEGORY_BY_VALUE[move.category]
            return (
              <span key={move.id} style={styles.todayChip}>
                <span style={styles.todayChipIcon}>{cat?.icon || '·'}</span>
                <span style={styles.todayChipLabel}>{cat?.label || move.category}</span>
                <button onClick={() => onDeleteMove(move.id)} style={styles.todayChipDel} aria-label="Delete move">✕</button>
              </span>
            )
          })}
        </div>
      )}

      <button onClick={() => setLogging(true)} style={styles.logMoveBtn}>
        + Log a move
      </button>
      <ActivitySheet
        open={logging}
        onClose={() => setLogging(false)}
        eyebrow="Today's preparation"
        title="What did you do?"
      >
        <MoveLogger
          onCancel={() => setLogging(false)}
          onSave={async (category, description) => {
            const ok = await onAddMove(category, description)
            if (ok) setLogging(false)
          }}
        />
      </ActivitySheet>

      {/* Stats row */}
      {totalMoves > 0 && (
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <p style={styles.statN}>{totalMoves}</p>
            <p style={styles.statU}>{totalMoves === 1 ? 'move' : 'moves'}</p>
          </div>
          <div style={styles.statItem}>
            <p style={styles.statN}>{daysTouched}</p>
            <p style={styles.statU}>{daysTouched === 1 ? 'day' : 'days'}</p>
          </div>
          {topCategory && (
            <div style={styles.statItem}>
              <p style={styles.statN}>{topCategory.icon}</p>
              <p style={styles.statU}>most common</p>
            </div>
          )}
        </div>
      )}

      {/* Contribution map */}
      <ContributionMap moves={moves} stopDateISO={stopDateISO} />
    </div>
  )
}

// ===================================================================
// SUB: MOVE LOGGER
// ===================================================================
function MoveLogger({ onCancel, onSave }) {
  const [category, setCategory] = useState(null)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const canSave = !!category && !saving

  return (
    <div style={styles.loggerBox}>
      <p style={styles.loggerLabel}>What did you do?</p>
      <div style={styles.chipsGrid}>
        {MOVE_CATEGORIES.map(cat => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setCategory(cat.value)}
            style={{
              ...styles.chip,
              ...(category === cat.value ? styles.chipActive : {}),
            }}
          >
            <span style={styles.chipIcon}>{cat.icon}</span>
            <span style={styles.chipLabel}>{cat.label}</span>
          </button>
        ))}
      </div>

      <p style={{ ...styles.loggerLabel, marginTop: '14px' }}>
        What was it? (optional)
      </p>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g. Texted my sister."
        maxLength={120}
        style={styles.loggerInput}
      />

      <div style={styles.loggerBtnRow}>
        <button onClick={onCancel} disabled={saving} style={styles.loggerCancelBtn}>
          Cancel
        </button>
        <button
          onClick={async () => {
            if (!canSave) return
            setSaving(true)
            await onSave(category, description)
            setSaving(false)
          }}
          disabled={!canSave}
          style={{
            ...styles.loggerSaveBtn,
            ...(!canSave ? styles.loggerSaveBtnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Save move'}
        </button>
      </div>
    </div>
  )
}

// ===================================================================
// SUB: CONTRIBUTION MAP
// ===================================================================
function ContributionMap({ moves, stopDateISO }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = formatDateInput(today)

  // End the window at stop day (never before today). Start it early enough to
  // always include today AND every day a move was logged, so prep always shows.
  const rawEnd = stopDateISO
    ? new Date(stopDateISO + 'T00:00:00')
    : new Date(today.getTime() + 7 * 86400000)
  const endDate = new Date(Math.max(rawEnd.getTime(), today.getTime()))
  endDate.setHours(0, 0, 0, 0)

  const moveMs = moves
    .map(m => Date.parse(m.date + 'T00:00:00'))
    .filter(n => !Number.isNaN(n))
  let startMs = Math.min(endDate.getTime() - 13 * 86400000, today.getTime())
  if (moveMs.length) startMs = Math.min(startMs, Math.min(...moveMs))
  const startDate = new Date(startMs)
  startDate.setHours(0, 0, 0, 0)

  const days = []
  const cursor = new Date(startDate)
  while (cursor <= endDate) {
    days.push(formatDateInput(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  const movesByDate = moves.reduce((acc, m) => {
    acc[m.date] = (acc[m.date] || 0) + 1
    return acc
  }, {})

  const stopDateStr = stopDateISO || formatDateInput(rawEnd)

  const rows = []
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7))

  const startLabel = new Date(days[0] + 'T00:00:00')
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  const endLabel = endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  const renderSquare = (dateStr) => {
    const count = movesByDate[dateStr] || 0
    const isFuture = dateStr > todayStr
    const isToday = dateStr === todayStr
    const isStopDay = dateStr === stopDateStr

    let intensity = 0
    if (count >= 3) intensity = 3
    else if (count === 2) intensity = 2
    else if (count === 1) intensity = 1

    return (
      <div
        key={dateStr}
        title={`${dateStr} · ${count} ${count === 1 ? 'move' : 'moves'}`}
        style={{
          ...styles.mapSquare,
          ...(isFuture && !isStopDay ? styles.mapSquareFuture : {}),
          ...(intensity === 1 ? styles.mapSquareI1 : {}),
          ...(intensity === 2 ? styles.mapSquareI2 : {}),
          ...(intensity === 3 ? styles.mapSquareI3 : {}),
          ...(isToday ? styles.mapSquareToday : {}),
          ...(isStopDay ? styles.mapSquareStop : {}),
        }}
      />
    )
  }

  return (
    <div style={styles.mapBox}>
      <p style={styles.mapLabel}>Preparation map</p>

      <div style={styles.mapGrid}>
        {rows.map((row, ri) => (
          <div key={ri} style={styles.mapRow}>
            {row.map(renderSquare)}
          </div>
        ))}
      </div>

      <div style={styles.mapAxisRow}>
        <span style={styles.mapAxisLabel}>{startLabel}</span>
        <span style={styles.mapAxisLabel}>{endLabel} · Stop day</span>
      </div>

      <div style={styles.mapLegend}>
        <span style={styles.mapLegendLabel}>fewer</span>
        <span style={{ ...styles.mapLegendSq, ...styles.mapSquareFuture }} />
        <span style={{ ...styles.mapLegendSq, ...styles.mapSquareI1 }} />
        <span style={{ ...styles.mapLegendSq, ...styles.mapSquareI2 }} />
        <span style={{ ...styles.mapLegendSq, ...styles.mapSquareI3 }} />
        <span style={styles.mapLegendLabel}>more</span>
      </div>
    </div>
  )
}

// ===================================================================
// TILE: ANCHORS
// ===================================================================
function AnchorsTile({ navigate, anchorCount }) {
  const has = anchorCount > 0
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
      <h3 style={styles.anchorsTitle}>{has ? "Who you'd call at midnight." : 'Save one person.'}</h3>
      <p style={styles.anchorsBody}>
        {has
          ? `${anchorCount} ${anchorCount === 1 ? 'person' : 'people'} saved. The list should reflect who's actually in your life.`
          : "One trusted person you'd call if it gets hard. Lining them up counts as a move."}
      </p>
      <button onClick={() => navigate('/anchors')} style={styles.anchorsBtnNew}>
        {has ? 'Open Anchors' : 'Set up Anchors'}
      </button>
    </div>
  )
}

// ===================================================================
// HELPERS
// ===================================================================
function formatDateInput(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ===================================================================
// STYLES
// ===================================================================
const styles = {
  todayChipsWrap: { display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '12px' },
  todayChip: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 8px 6px 10px', background: '#F6EFDD', border: '0.5px solid #E8DCC4', borderRadius: '16px' },
  todayChipIcon: { fontSize: '13px', lineHeight: 1 },
  todayChipLabel: { fontSize: '12px', color: '#5A4A38', fontFamily: 'Georgia, serif' },
  todayChipDel: { background: 'transparent', border: 'none', color: '#B7A98F', fontSize: '11px', cursor: 'pointer', padding: '0 2px', lineHeight: 1, fontFamily: 'inherit' },
  perimGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' },
  perimCell: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', padding: '14px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '14px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' },
  perimCellLocked: { background: 'linear-gradient(180deg, #F5E9D4 0%, #EEDFC2 100%)', border: '1px solid #C99A4E', boxShadow: '0 3px 12px rgba(180,140,70,0.18)' },
  perimLockIcon: { fontSize: '16px', lineHeight: 1, color: '#9C8C78' },
  perimCellLabel: { fontSize: '13px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif' },
  perimCellLabelOn: { color: '#5A3A12' },
  perimCellSub: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.3 },
  perimCellSubOn: { color: '#8A7558' },
  perimPct: { fontSize: '15px', fontWeight: 600, color: '#854F0B', fontFamily: 'Georgia, serif', textAlign: 'center', margin: '0 0 14px' },
  cGroupLabel: { fontSize: '13px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '6px 0 8px' },
  cPillWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' },
  cPill: { padding: '9px 14px', background: 'white', border: '0.5px solid #E0D5C2', borderRadius: '20px', fontSize: '13px', color: '#2A1F15', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  cPillThreatOn: { background: 'linear-gradient(180deg, #F7E6DA 0%, #F0D3C0 100%)', color: '#8A3B18', border: '1px solid #C5572C' },
  cPillCounterOn: { background: 'linear-gradient(180deg, #EAF1DD 0%, #DCE8C8 100%)', color: '#3E5C22', border: '1px solid #6E8A4E' },
  cMatrix: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', borderRadius: '16px', padding: '18px', textAlign: 'center', marginBottom: '14px' },
  cMatrixText: { fontSize: '17px', color: '#FAF7F1', fontFamily: 'Georgia, serif', margin: '0 0 4px', lineHeight: 1.3 },
  cMatrixNote: { fontSize: '12.5px', color: '#D9B57A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '8px 0 0' },
  cPillSignOn: { background: 'linear-gradient(180deg, #F3E9D4 0%, #E8D6B0 100%)', color: '#7A5320', border: '1px solid #C49A52' },
  vowStarters: { display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '0 0 12px' },
  vowStarterChip: { background: '#FFFFFF', border: '0.5px solid #DDCFB6', borderRadius: '16px', padding: '7px 12px', fontSize: '12.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  // launcher cards (warm dark — the urge-velocity look)
  launcher: { display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', background: 'linear-gradient(155deg, #6E3A1C 0%, #3A2415 100%)', borderRadius: '18px', padding: '16px 18px', marginBottom: '14px', boxShadow: '0 6px 18px rgba(40,25,10,0.18)', fontFamily: 'inherit' },
  launcherTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  launcherIcon: { fontSize: '22px', lineHeight: 1 },
  launcherChip: { fontSize: '11px', fontWeight: 600, color: 'rgba(250,247,241,0.85)', background: 'rgba(250,247,241,0.12)', border: '0.5px solid rgba(250,247,241,0.22)', borderRadius: '20px', padding: '4px 10px', fontFamily: 'Georgia, serif' },
  launcherChipDone: { color: '#DFF0C2', background: 'rgba(120,160,60,0.22)', border: '0.5px solid rgba(180,210,130,0.4)' },
  launcherTitle: { fontSize: '17px', fontWeight: 600, color: '#FAF7F1', fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  launcherSummary: { fontSize: '12.5px', color: 'rgba(250,247,241,0.72)', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.45 },
  // activity sheet (blurred popup)
  sheetBackdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(40,25,15,0.55)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', zIndex: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px' },
  sheetCard: { width: '100%', maxWidth: '430px', maxHeight: '88vh', overflowY: 'auto', background: '#FCFAF5', borderRadius: '22px', padding: '20px 20px 22px', boxShadow: '0 24px 70px rgba(40,25,15,0.4)' },
  sheetHead: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' },
  sheetEyebrow: { fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A07A3C', fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  sheetTitle: { fontSize: '19px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.25 },
  sheetClose: { flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', border: '0.5px solid #E0D5C2', background: 'white', color: '#6B5C4A', fontSize: '13px', cursor: 'pointer', lineHeight: 1 },
  sheetLead: { fontSize: '13.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: '0 0 16px' },
  sheetSaveBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FBF6EE', border: 'none', borderRadius: '13px', fontSize: '14px', fontWeight: 500, fontFamily: 'Georgia, serif', cursor: 'pointer', marginTop: '4px' },
  saveBtnDim: { opacity: 0.45, cursor: 'not-allowed' },
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

  tileLogged: { background: 'linear-gradient(180deg, #F6FAE9 0%, #ECF3D5 100%)', border: '0.5px solid #C2D49A' },
  // --- v2 additions: check-in hero + readiness ruler + vow ---
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
  rulerRow: { display: 'flex', gap: '5px', margin: '4px 0 8px' },
  rulerSeg: {
    flex: 1, height: '26px', borderRadius: '6px', background: '#F4ECDD',
    border: '0.5px solid #E8DFD0', cursor: 'pointer', transition: 'all 0.12s', padding: 0,
  },
  rulerSegOn: { background: 'linear-gradient(180deg, #D9B57A 0%, #B6924E 100%)', border: '0.5px solid #A8843F' },
  rulerLabels: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: '14px',
  },
  rulerValue: { color: '#854F0B', fontStyle: 'normal', fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
  ghostSaveBtn: {
    width: '100%', padding: '13px', background: 'white', color: '#3A2A1C',
    border: '0.5px solid #D9CBB4', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(80,50,20,0.06)',
  },
  vowQuote: {
    fontSize: '17px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.5, margin: '0 0 12px', padding: '4px 0',
  },
  vowInput: {
    width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '0.5px solid #E0D5C2',
    borderRadius: '12px', background: 'white', fontSize: '14px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', lineHeight: 1.5, marginBottom: '12px', outline: 'none', resize: 'vertical',
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
  eyebrowCount: {
    color: '#3B6D11',
    letterSpacing: '0.08em',
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

  // STOP DATE
  dateInput: {
    width: '100%',
    padding: '12px 14px',
    background: 'white',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    boxShadow: 'inset 0 1px 2px rgba(80,50,20,0.04)',
    marginBottom: '12px',
    boxSizing: 'border-box',
  },
  setupBtnRow: {
    display: 'flex', gap: '8px',
  },
  setupSaveBtn: {
    flex: 1, padding: '13px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none',
    borderRadius: '12px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  setupSaveBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  setupCancelBtn: {
    padding: '13px 18px', background: 'white',
    color: '#6B5C4A', border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
  },

  countdownTile: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    borderRadius: '20px',
    padding: '22px 20px 18px',
    boxShadow: '0 6px 20px rgba(40,25,10,0.25)',
    textAlign: 'center',
  },
  countdownEyebrow: {
    fontSize: '10px', color: '#D9B57A',
    textTransform: 'uppercase', letterSpacing: '0.28em',
    fontWeight: 500, fontFamily: 'Georgia, serif',
    margin: '0 0 10px',
  },
  countdownDate: {
    fontSize: '22px', color: '#FAF7F1',
    fontFamily: 'Georgia, serif', fontWeight: 500,
    lineHeight: 1.3, margin: '0 0 14px',
  },
  countdownDivider: {
    height: '0.5px', background: 'rgba(217,181,122,0.25)',
    margin: '0 auto 14px', width: '60%',
  },
  countdownGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px',
    marginBottom: '14px',
  },
  countdownCell: {
    background: 'rgba(217,181,122,0.06)',
    borderRadius: '12px',
    padding: '14px 2px 10px',
    border: '0.5px solid rgba(217,181,122,0.15)',
  },
  countdownN: {
    fontSize: '24px', fontWeight: 500, color: '#FAF7F1',
    lineHeight: 1, margin: 0,
    fontVariantNumeric: 'tabular-nums',
    fontFamily: 'Georgia, serif',
  },
  countdownU: {
    fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em',
    color: 'rgba(217,181,122,0.7)',
    margin: '6px 0 0', fontFamily: 'Georgia, serif',
  },
  countdownMicro: {
    fontSize: '12px', color: 'rgba(250,247,241,0.55)',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.5, margin: '0 0 12px',
  },
  changeDateBtn: {
    background: 'transparent', border: 'none',
    color: 'rgba(217,181,122,0.75)',
    fontSize: '11px', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', cursor: 'pointer',
    padding: '4px 8px',
    textDecoration: 'underline',
    textDecorationColor: 'rgba(217,181,122,0.3)',
    textUnderlineOffset: '3px',
  },

  beginEndureBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #D9B57A 0%, #B89456 100%)',
    color: '#241710', border: 'none',
    borderRadius: '12px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.2)',
    marginBottom: '10px',
  },
  beginEndureBtnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  pickNewDateBtn: {
    width: '100%', padding: '12px',
    background: 'white', color: '#6B5C4A',
    border: '0.5px solid #DDCFB6', borderRadius: '12px',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
  },

  // === PREPARATION LOG ===
  todayMovesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px',
  },
  moveRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '10px 12px',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F6EFDD 100%)',
    border: '0.5px solid #E0CFA4',
    borderRadius: '12px',
  },
  moveIcon: {
    fontSize: '18px',
    lineHeight: '20px',
    flexShrink: 0,
    marginTop: '2px',
  },
  moveContent: {
    flex: 1,
    minWidth: 0,
  },
  moveCategoryLabel: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 2px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  moveDescription: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.4,
  },
  moveDelete: {
    background: 'transparent',
    border: 'none',
    color: '#9C8C78',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '4px 6px',
    fontFamily: 'inherit',
    flexShrink: 0,
  },

  logMoveBtn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.22)',
  },

  // LOGGER
  loggerBox: {
    background: 'white',
    border: '0.5px solid #DDCFB6',
    borderRadius: '14px',
    padding: '14px',
    boxShadow: '0 3px 12px rgba(80,50,20,0.06)',
  },
  loggerLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
  },
  chipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '6px',
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 10px',
    background: '#FDFBF6',
    border: '0.5px solid #E0D5C2',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    minHeight: '36px',
  },
  chipActive: {
    background: 'linear-gradient(180deg, #F5E9D4 0%, #EEDFC2 100%)',
    border: '1px solid #C99A4E',
    boxShadow: '0 2px 8px rgba(180,140,70,0.18)',
  },
  chipIcon: {
    fontSize: '16px',
    flexShrink: 0,
  },
  chipLabel: {
    fontSize: '11px',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    color: '#2A1F15',
    lineHeight: 1.25,
  },
  loggerInput: {
    width: '100%',
    padding: '10px 12px',
    background: '#FDFBF6',
    border: '0.5px solid #DDCFB6',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    boxSizing: 'border-box',
  },
  loggerBtnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '12px',
  },
  loggerCancelBtn: {
    padding: '9px 14px',
    background: 'transparent',
    color: '#6B5C4A',
    border: '0.5px solid #DDCFB6',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  loggerSaveBtn: {
    padding: '9px 18px',
    background: 'linear-gradient(180deg, #D9B57A 0%, #B89456 100%)',
    color: '#241710',
    border: 'none',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(40,25,10,0.15)',
  },
  loggerSaveBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  // STATS
  statsRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '18px',
    padding: '12px',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '12px',
  },
  statItem: {
    flex: 1,
    textAlign: 'center',
  },
  statN: {
    fontSize: '20px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 2px',
    lineHeight: 1,
  },
  statU: {
    fontSize: '10px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    letterSpacing: '0.04em',
  },

  // CONTRIBUTION MAP
  mapBox: {
    marginTop: '16px',
    padding: '14px 12px 12px',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '12px',
  },
  mapLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 10px',
  },
  mapGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    alignItems: 'center',
  },
  mapRow: {
    display: 'flex',
    gap: '5px',
  },
  mapSquare: {
    width: '28px',
    height: '28px',
    borderRadius: '5px',
    background: '#EFE7D7',
    border: '0.5px solid #E0D5C2',
  },
  mapSquareFuture: {
    background: 'transparent',
    border: '0.5px dashed #DDCFB6',
  },
  mapSquareI1: {
    background: '#E6C68A',
    border: '0.5px solid #D9B57A',
  },
  mapSquareI2: {
    background: '#D9B57A',
    border: '0.5px solid #B89456',
  },
  mapSquareI3: {
    background: '#854F0B',
    border: '0.5px solid #6B3F09',
  },
  mapSquareToday: {
    boxShadow: '0 0 0 1.5px #854F0B',
  },
  mapSquareStop: {
    background: 'linear-gradient(180deg, #D9B57A 0%, #B89456 100%)',
    border: '0.5px solid #6B3F09',
    boxShadow: '0 0 0 1px #D9B57A',
  },
  mapAxisRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
    padding: '0 4px',
  },
  mapAxisLabel: {
    fontSize: '10px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    letterSpacing: '0.02em',
  },
  mapLegend: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    marginTop: '10px',
  },
  mapLegendLabel: {
    fontSize: '9px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 4px',
  },
  mapLegendSq: {
    width: '11px',
    height: '11px',
    borderRadius: '2px',
  },

  // ANCHORS
  anchorsBtn: {
    width: '100%', padding: '13px',
    background: 'white', color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(80,50,20,0.05)',
  },
}