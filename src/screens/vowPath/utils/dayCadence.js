// =====================================================================
// dayCadence — the single source of truth for "can the user open this day?"
// =====================================================================
// Unified rule, applied to EVERY linear stage (Notice, Reflect, Commit,
// Endure), whether it's the user's assigned stage or an earlier stage they
// jumped past via the assessment:
//
//   • A day they've ALREADY completed  -> always allowed (revisit their own work)
//   • The next uncompleted day         -> allowed only if 24h since last completion
//   • Any day beyond the next          -> locked (must go in sequence)
//
// CRITICAL: for an EXPLORED earlier stage, the user's global progress fields
// (last_completed_day / last_completed_at on vow_path_progress) describe their
// ASSIGNED stage, not this one — using them would be wrong and could corrupt
// real progress. So sequence + timing here are derived from THIS stage's own
// artifacts:
//   • stageCompletedDays   : Set<number> of day_numbers completed in this stage
//   • stageLastCompletedAt : ISO string, max(updated_at) across this stage's
//                            artifacts (the last time a day here was completed)
//
// For the ASSIGNED (current) stage these same per-stage signals are still
// correct, so the helper is used uniformly and there is no separate code path.
// =====================================================================

import { isCadenceBypassed } from './vowPathGating'

const HOURS_24_MS = 24 * 60 * 60 * 1000

export function evaluateDayCadence({
  requestedDay,
  progressRow,
  stageCompletedDays,
  stageLastCompletedAt,
}) {
  // Pilot / local-dev / pilot-tester bypass (unchanged global behavior).
  if (isCadenceBypassed(progressRow)) return { allowed: true }

  const completed = stageCompletedDays instanceof Set
    ? stageCompletedDays
    : new Set(stageCompletedDays || [])

  // Already done this exact day -> free to revisit, no waiting.
  if (completed.has(requestedDay)) return { allowed: true }

  // The next day the user should do is the first day in this stage not yet done.
  let nextDay = 1
  while (completed.has(nextDay)) nextDay++

  // Beyond the next day -> sequence lock.
  if (requestedDay !== nextDay) {
    return {
      allowed: false,
      reason: `Day ${nextDay} is your next day. Day ${requestedDay} unlocks after that.`,
    }
  }

  // It IS the next day. Day 1 with nothing completed yet opens immediately
  // (nothing to wait on). Otherwise enforce the 24h gap since the last
  // completion in THIS stage.
  if (stageLastCompletedAt) {
    const lastTime = new Date(stageLastCompletedAt).getTime()
    if (!Number.isNaN(lastTime)) {
      const hoursSince = (Date.now() - lastTime) / (1000 * 60 * 60)
      if (hoursSince < 24) {
        const hoursLeft = Math.ceil(24 - hoursSince)
        return {
          allowed: false,
          reason: `Day ${requestedDay} unlocks in about ${hoursLeft} ${hoursLeft === 1 ? 'hour' : 'hours'}. The work is meant to be done one day at a time.`,
        }
      }
    }
  }

  return { allowed: true }
}

// Helper: from a list of this-stage artifacts ({ day_number, updated_at }),
// derive the completed-days Set and the last-completion timestamp.
export function deriveStageProgress(artifacts) {
  const days = new Set()
  let lastAt = null
  for (const a of artifacts || []) {
    if (a?.day_number != null) {
      days.add(a.day_number)
      const t = a.updated_at ? new Date(a.updated_at).getTime() : NaN
      if (!Number.isNaN(t) && (lastAt === null || t > lastAt)) lastAt = t
    }
  }
  return { stageCompletedDays: days, stageLastCompletedAt: lastAt ? new Date(lastAt).toISOString() : null }
}