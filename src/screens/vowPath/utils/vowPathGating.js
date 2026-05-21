import featureFlags from '../../../config/featureFlags'

// =====================================================================
// VOW PATH GATING
// =====================================================================
// Single source of truth for the two launch gates. Call sites never read
// env or flags directly — they call these helpers. Flipping a flag (or, at
// launch, implementing the entitlement check) changes behavior everywhere
// without touching a single call site.
// =====================================================================

// ---- CADENCE ----------------------------------------------------------
// True when the daily cadence should be BYPASSED (all reached days open).
// Bypassed when: running locally (DEV), the cadence flag is off (pilot),
// or this specific user is flagged as a pilot tester.
//
// Each day-router's isDayUnlocked() should start with:
//   if (isCadenceBypassed(progressRow)) return { allowed: true }
export function isCadenceBypassed(progress) {
  if (import.meta.env.DEV) return true
  if (!featureFlags.CADENCE_LOCKED) return true
  if (progress?.is_pilot_mode) return true
  return false
}

// ---- PAYWALL ----------------------------------------------------------
// True when the user may enter Vow Path.
// Open whenever the paywall flag is off (pilot). When the flag is on
// (launch), it defers to the entitlement check below.
export function canAccessVowPath(progress) {
  if (!featureFlags.PAYWALL_ENABLED) return true
  return hasVowPathEntitlement(progress)
}

// Placeholder entitlement check — the ONLY thing to implement at launch.
// Wire this to wherever Google Play billing records the purchase (e.g. a
// 'vow_path_entitlement' column on vow_path_progress, or a dedicated
// entitlements table). Until then it reads a column that simply won't exist
// during the pilot, which is fine because PAYWALL_ENABLED is false.
function hasVowPathEntitlement(progress) {
  // TODO(launch): replace with the real Play-billing entitlement source.
  return Boolean(progress?.vow_path_entitlement)
}