import { supabase } from '../../../supabaseClient'

// =====================================================================
// ADDICTION TYPE RESOLUTION
// =====================================================================
// vow_path_progress.primary_substance is canonically a substances.js slug
// (e.g. "cannabis"). The trackers system needs the numeric addiction_types.id.
// addiction_types.slug is the single source of truth that links the two.
//
// This resolver also tolerates a legacy numeric value in primary_substance
// (older onboarding rows created before the slug migration), so it is safe to
// deploy before the one-time data migration has run.
//
// Returns a Number id, or null when the substance can't be mapped to a row
// (e.g. a custom/free-text substance with no addiction_types entry).
// =====================================================================

export async function resolveAddictionTypeId(primarySubstance) {
  if (primarySubstance == null) return null

  // Legacy path: value is already a numeric addiction_types.id (stored as TEXT).
  const numeric = Number(primarySubstance)
  if (!Number.isNaN(numeric)) return numeric

  // Canonical path: value is a slug — translate via addiction_types.slug.
  const { data, error } = await supabase
    .from('addiction_types')
    .select('id')
    .eq('slug', primarySubstance)
    .maybeSingle()

  if (error) {
    console.error('resolveAddictionTypeId lookup failed:', error)
    return null
  }
  return data?.id ?? null
}