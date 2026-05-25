// =====================================================================
// STAGE ACCESS
// The Vow Path stages run in a fixed order. A user is assigned a current
// stage by the assessment. From there:
//   - the current stage and any stage BEFORE it are open (explorable)
//   - stages AFTER the current one stay locked
//
// "Exploring a past stage" must be non-destructive: there's only one
// shared current_day / last_completed_day on the progress row (it tracks
// the real, assigned stage), so revisiting an earlier stage bypasses the
// day cadence and never writes to that position. Artifacts still save.
// =====================================================================

export const STAGE_ORDER = ['notice', 'reflect', 'commit', 'endure', 'build', 'reclaim']

export function stageIndex(stageKey) {
  return STAGE_ORDER.indexOf(stageKey)
}

// Can this stage's flow be opened at all? (current or any earlier stage)
export function canEnterStage(progressRow, stageKey) {
  if (!progressRow || !progressRow.current_stage) return false
  const cur = stageIndex(progressRow.current_stage)
  const tgt = stageIndex(stageKey)
  if (cur < 0 || tgt < 0) return false
  return tgt <= cur
}

// Is the user revisiting a stage they've already moved past?
export function isExploringPastStage(progressRow, stageKey) {
  if (!progressRow || !progressRow.current_stage) return false
  const cur = stageIndex(progressRow.current_stage)
  const tgt = stageIndex(stageKey)
  if (cur < 0 || tgt < 0) return false
  return tgt < cur
}