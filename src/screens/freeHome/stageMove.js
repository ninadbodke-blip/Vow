import { supabase } from '../../supabaseClient'
import { resolveAddictionTypeId } from '../vowPath/utils/addictionTypes'

// One source of truth for stage labels used in confirmation copy.
export const STAGE_LABELS = {
  notice: 'Notice',
  reflect: 'Reflect',
  commit: 'Commit',
  endure: 'Endure',
  build: 'Build',
  reclaim: 'Reclaim',
}

// Faithful extraction of Profile's stage-move logic so the profile screen AND
// the home wayfinder drive the streak / Endure-clock / slip side-effects through
// the exact same code. The host owns its own `moving` + `sheet` state and renders
// the sheet overlay with its own styles; this factory returns goToStage, which
// decides what to do (move directly, or raise a confirmation sheet) and performs
// the database mutations. Call it during render with the current values.
export function createStageMove({
  stage,
  tracker,
  hasBegunEndure,
  stopDateISO,
  primarySubstance,
  daysOnTracker,
  buildUnlocked,
  moving,
  setMoving,
  setSheet,
  navigate,
  onClose = () => {},
}) {
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
    navigate('/app/home', { replace: true })
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
      navigate('/app/home', { replace: true })
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
    navigate('/app/home', { replace: true })
  }

  const goToStage = (target) => {
    if (moving || target === stage) { onClose(); return }

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

  return goToStage
}