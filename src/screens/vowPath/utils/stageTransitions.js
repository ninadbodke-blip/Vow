// =====================================================================
// STAGE TRANSITIONS
// =====================================================================
// Pure functions that update vow_path_progress to move between stages.
// =====================================================================

import { supabase } from '../../../supabaseClient'

export const STAGE_INFO = {
  notice: { label: 'Notice', totalDays: 5, durationLabel: '5 days' },
  reflect: { label: 'Reflect', totalDays: 21, durationLabel: '21 days' },
  commit: { label: 'Commit', totalDays: 10, durationLabel: '10 days' },
  endure: { label: 'Endure', totalDays: 21, durationLabel: '21 days' },
  build: { label: 'Build', totalDays: 9, durationLabel: '9 weeks, one chapter each' },
  reclaim: { label: 'Reclaim', totalDays: 4, durationLabel: '3-4 days' },
}

async function performStageTransition({ fromStage, toStage, extraFields = {} }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No authenticated user' }

  const { data: progress, error: fetchError } = await supabase
    .from('vow_path_progress')
    .select('completed_stages')
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchError) return { error: fetchError.message }

  const existingCompleted = progress?.completed_stages || []

  let updatedCompleted = existingCompleted
  if (fromStage && !existingCompleted.some(c => c.stage === fromStage)) {
    updatedCompleted = [
      ...existingCompleted,
      { stage: fromStage, completed_at: new Date().toISOString() },
    ]
  }

  const updates = {
    current_stage: toStage,
    current_day: 1,
    last_completed_day: 0,
    last_completed_at: null,
    completed_stages: updatedCompleted,
    vow_path_status: 'active',
    updated_at: new Date().toISOString(),
    ...extraFields,
  }

  const { error: updateError } = await supabase
    .from('vow_path_progress')
    .update(updates)
    .eq('user_id', user.id)

  if (updateError) return { error: updateError.message }
  return { success: true }
}

// =====================================================================
// NOTICE -> NEXT STAGE
// Doors: 'reflect', 'wait_30_days', 'not_for_me'
// =====================================================================
export async function transitionFromNotice({ doorChoice }) {
  if (doorChoice === 'reflect') {
    const result = await performStageTransition({
      fromStage: 'notice',
      toStage: 'reflect',
    })
    return { ...result, nextStage: 'reflect' }
  }

  if (doorChoice === 'wait_30_days') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No authenticated user' }

    // "I need time to sit with this." Nothing locks — Notice stays complete and
    // the fork (Day 5) remains open, so the user can return and choose Reflect
    // whenever they're ready. We only record that they reached the fork.
    const { error } = await supabase
      .from('vow_path_progress')
      .update({
        vow_path_status: 'active',
        last_completed_day: 5,
        last_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    return { success: true, nextStage: null, action: 'wait_30_days' }
  }

  if (doorChoice === 'not_for_me') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No authenticated user' }

    const { error } = await supabase
      .from('vow_path_progress')
      .update({
        vow_path_status: 'closed_permanently',
        last_completed_day: 5,
        last_completed_at: new Date().toISOString(),
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    return { success: true, nextStage: null, action: 'closed_permanently' }
  }

  return { error: 'Unknown door choice: ' + doorChoice }
}

// =====================================================================
// REFLECT -> NEXT STAGE
// Doors: 'commit', 'endure', 'not_ready'
// =====================================================================
export async function transitionFromReflect({ doorChoice }) {
  if (doorChoice === 'commit') {
    const result = await performStageTransition({
      fromStage: 'reflect',
      toStage: 'commit',
    })
    return { ...result, nextStage: 'commit' }
  }

  if (doorChoice === 'endure') {
    const result = await performStageTransition({
      fromStage: 'reflect',
      toStage: 'endure',
      extraFields: { endure_starts_at: new Date().toISOString() },
    })
    return { ...result, nextStage: 'endure' }
  }

  if (doorChoice === 'not_ready') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No authenticated user' }

    const { error } = await supabase
      .from('vow_path_progress')
      .update({
        vow_path_status: 'paused',
        last_completed_day: 21,
        last_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    return { success: true, nextStage: null, action: 'not_ready' }
  }

  return { error: 'Unknown door choice: ' + doorChoice }
}

// =====================================================================
// COMMIT -> ENDURE
// Reads stop_date from commit_day_1 artifact.
// =====================================================================
export async function transitionFromCommit() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No authenticated user' }

  const { data: day1Artifact } = await supabase
    .from('vow_artifacts')
    .select('content')
    .eq('user_id', user.id)
    .eq('artifact_type', 'commit_day_1')
    .maybeSingle()

  const stopDateStr = day1Artifact?.content?.stop_date
  if (!stopDateStr) {
    const result = await performStageTransition({
      fromStage: 'commit',
      toStage: 'endure',
      extraFields: { endure_starts_at: new Date().toISOString() },
    })
    return { ...result, nextStage: 'endure', stopDateInFuture: false }
  }

  const stopDate = new Date(stopDateStr)
  const now = new Date()
  const isFuture = stopDate > now

  const result = await performStageTransition({
    fromStage: 'commit',
    toStage: 'endure',
    extraFields: { endure_starts_at: stopDate.toISOString() },
  })

  return {
    ...result,
    nextStage: 'endure',
    stopDateInFuture: isFuture,
    stopDate: stopDateStr,
  }
}

// =====================================================================
// ENDURE -> BUILD (Build is "coming soon" for May 28 pilot)
// =====================================================================
export async function transitionFromEndure() {
  const result = await performStageTransition({
    fromStage: 'endure',
    toStage: 'build',
  })
  return { ...result, nextStage: 'build' }
}

// =====================================================================
// DIRECT STAGE ENTRY — from Stage Check
// =====================================================================
export async function enterStageDirectly({ stage }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No authenticated user' }

  const extraFields = stage === 'endure'
    ? { endure_starts_at: new Date().toISOString() }
    : {}

  const updates = {
    current_stage: stage,
    current_day: 1,
    last_completed_day: 0,
    last_completed_at: null,
    vow_path_status: 'active',
    updated_at: new Date().toISOString(),
    ...extraFields,
  }

  const { error } = await supabase
    .from('vow_path_progress')
    .update(updates)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true, nextStage: stage }
}