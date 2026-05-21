import { supabase } from '../../../supabaseClient'

// =====================================================================
// FOUNDER AUDIO URL RESOLUTION
// =====================================================================
// Founder audios live in the Supabase Storage bucket below. Content files
// store a storage path (e.g. "reflect/day_01.mp3"); this resolves it to a
// playable public URL using the configured client (no hardcoded project ref).
//
// Back-compat: anything that is already a full URL (http...) or a local
// public-folder path (/audio/...) is returned unchanged.
// =====================================================================

const BUCKET = 'founder-audio'

export function audioUrl(ref) {
  if (!ref) return null
  if (ref.startsWith('http') || ref.startsWith('/')) return ref
  return supabase.storage.from(BUCKET).getPublicUrl(ref).data.publicUrl
}