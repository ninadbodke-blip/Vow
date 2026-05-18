import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import BottomNav from '../../components/BottomNav'

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

  const showSetupTile = stopDateState === 'not_set' || editingStopDate
  const showCountdown = stopDateState === 'future' && !editingStopDate
  const showArrived = stopDateState === 'past' && !editingStopDate

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
    const newMove = {
      id: `move_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      logged_at: now.toISOString(),
      date: formatDateInput(now),
      category,
      description: (description || '').trim() || null,
    }

    const currentMoves = progress.commit_moves || []
    const newMoves = [newMove, ...currentMoves].slice(0, 500)

    setProgress(p => ({ ...p, commit_moves: newMoves }))

    const { error } = await supabase
      .from('vow_path_progress')
      .update({
        commit_moves: newMoves,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to save move:', error)
      setProgress(p => ({ ...p, commit_moves: currentMoves }))
      alert('Could not save. Please try again.')
      return false
    }
    return true
  }

  const handleDeleteMove = async (id) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const currentMoves = progress.commit_moves || []
    const newMoves = currentMoves.filter(m => m.id !== id)

    setProgress(p => ({ ...p, commit_moves: newMoves }))

    const { error } = await supabase
      .from('vow_path_progress')
      .update({
        commit_moves: newMoves,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to delete move:', error)
      setProgress(p => ({ ...p, commit_moves: currentMoves }))
      alert('Could not delete. Please try again.')
    }
  }

  const handleBeginEndure = async () => {
    if (transitioning) return
    setTransitioning(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const addictionTypeId = Number(progress.primary_substance)

      const { data: existingTrackers } = await supabase
        .from('trackers')
        .select('id')
        .eq('user_id', user.id)
        .eq('addiction_type_id', addictionTypeId)
        .eq('is_active', true)

      if (!existingTrackers || existingTrackers.length === 0) {
        const { error: trackerError } = await supabase
          .from('trackers')
          .insert({
            user_id: user.id,
            addiction_type_id: addictionTypeId,
            start_date: new Date().toISOString(),
            is_active: true,
            tracker_status: 'active',
          })

        if (trackerError) {
          console.error('Failed to create tracker:', trackerError)
          alert('Could not start Endure. Please try again.')
          setTransitioning(false)
          return
        }
      }

      const { error: progressError } = await supabase
        .from('vow_path_progress')
        .update({
          free_state: 'endure',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (progressError) {
        console.error('Failed to update free_state:', progressError)
        alert('Could not transition. Please try again.')
        setTransitioning(false)
        return
      }

      navigate('/home', { replace: true })
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setTransitioning(false)
    }
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

        <GreetingTile firstName={firstName} substanceLabel={progress.substance_label} />

        {showSetupTile && (
          <StopDateSetupTile
            prefillValue={progress.endure_starts_at}
            onSave={handleSaveStopDate}
            onCancel={editingStopDate ? () => setEditingStopDate(false) : null}
            saving={savingDate}
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

        <PreparationLogTile
          moves={progress.commit_moves || []}
          stopDateISO={progress.endure_starts_at}
          onAddMove={handleAddMove}
          onDeleteMove={handleDeleteMove}
        />

        <AnchorsTile navigate={navigate} anchorCount={anchorCount} />

        <BottomNav />
      </div>
    </div>
  )
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
        <div style={styles.todayMovesList}>
          {todayMoves.map(move => {
            const cat = CATEGORY_BY_VALUE[move.category]
            return (
              <div key={move.id} style={styles.moveRow}>
                <span style={styles.moveIcon}>{cat?.icon || '·'}</span>
                <div style={styles.moveContent}>
                  <p style={styles.moveCategoryLabel}>{cat?.label || move.category}</p>
                  {move.description && (
                    <p style={styles.moveDescription}>{move.description}</p>
                  )}
                </div>
                <button
                  onClick={() => onDeleteMove(move.id)}
                  style={styles.moveDelete}
                  aria-label="Delete move"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}

      {logging ? (
        <MoveLogger
          onCancel={() => setLogging(false)}
          onSave={async (category, description) => {
            const ok = await onAddMove(category, description)
            if (ok) setLogging(false)
          }}
        />
      ) : (
        <button onClick={() => setLogging(true)} style={styles.logMoveBtn}>
          + Log a move
        </button>
      )}

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
  // Build a 14-day window ending at stop_date (or today+7 if no stop_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = formatDateInput(today)

  const endDate = stopDateISO
    ? new Date(stopDateISO + 'T00:00:00')
    : new Date(today.getTime() + 7 * 86400000)
  const startDate = new Date(endDate.getTime() - 13 * 86400000)

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

  const stopDateStr = stopDateISO || formatDateInput(endDate)

  // Split into 2 rows of 7
  const row1 = days.slice(0, 7)
  const row2 = days.slice(7, 14)

  const startLabel = new Date(days[0] + 'T00:00:00')
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  const endLabel = endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  const renderSquare = (dateStr, i) => {
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
        <div style={styles.mapRow}>
          {row1.map(renderSquare)}
        </div>
        <div style={styles.mapRow}>
          {row2.map(renderSquare)}
        </div>
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
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Anchors</p>
      <h3 style={styles.tileTitle}>
        {anchorCount > 0 ? 'Who you\'d call at midnight' : 'Save one person'}
      </h3>
      <p style={styles.tileBody}>
        {anchorCount > 0
          ? `${anchorCount} ${anchorCount === 1 ? 'person' : 'people'} saved. The list should reflect who's actually in your life.`
          : 'One trusted person whose name you\'d call if it gets hard. Adding to your anchors counts as a move.'}
      </p>
      <button
        onClick={() => navigate('/anchors')}
        style={styles.anchorsBtn}
      >
        {anchorCount > 0 ? 'Open Anchors' : 'Set up Anchors'}
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
    fontSize: '11px', color: '#854F0B',
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
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    border: '0.5px solid #241710',
    boxShadow: '0 3px 10px rgba(40,25,10,0.2)',
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