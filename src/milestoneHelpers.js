import { supabase } from './supabaseClient'

// Check tracker's current days clean and mark any newly earned milestones in DB.
// Returns array of newly earned milestone objects (for toast display).
export async function checkAndMarkMilestones(tracker, userId) {
  const start = new Date(tracker.start_date)
  const now = new Date()
  const daysClean = Math.floor((now - start) / (1000 * 60 * 60 * 24))

  // Fetch all milestones up to current days
  const { data: eligible } = await supabase
    .from('milestones')
    .select('*')
    .lte('days_required', daysClean)
    .order('days_required')

  if (!eligible || eligible.length === 0) return []

  // Fetch already-earned milestones for this tracker
  const { data: earned } = await supabase
    .from('user_milestones')
    .select('milestone_id')
    .eq('tracker_id', tracker.id)

  const earnedIds = new Set((earned || []).map(e => e.milestone_id))
  const newlyEarned = eligible.filter(m => !earnedIds.has(m.id))

  if (newlyEarned.length === 0) return []

  // Insert new milestones
  const toInsert = newlyEarned.map(m => ({
    user_id: userId,
    tracker_id: tracker.id,
    milestone_id: m.id,
  }))

  await supabase.from('user_milestones').insert(toInsert)
  return newlyEarned
}