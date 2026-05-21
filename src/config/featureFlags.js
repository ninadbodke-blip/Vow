// =====================================================================
// FEATURE FLAGS
// =====================================================================
// Env-driven, so the SAME code runs open on the Vercel PWA pilot and gated
// in the native (Play Store) build. Only the env vars differ — no code edits
// when transitioning.
//
//   Vercel pilot   (leave unset, or set to 'false'):
//     VITE_CADENCE_LOCKED=false    -> Vow Path days open, no 24h gate
//     VITE_PAYWALL_ENABLED=false   -> Vow Path open to everyone
//
//   Native launch  (.env for the APK build):
//     VITE_CADENCE_LOCKED=true     -> daily cadence enforced
//     VITE_PAYWALL_ENABLED=true    -> Vow Path requires an entitlement
//
// Vite only exposes vars prefixed with VITE_ to the client. A var that is
// absent reads as undefined, so the strict === 'true' comparison defaults
// every flag to OFF (pilot-open) unless explicitly enabled.
// =====================================================================

const featureFlags = {
  CADENCE_LOCKED: import.meta.env.VITE_CADENCE_LOCKED === 'true',
  PAYWALL_ENABLED: import.meta.env.VITE_PAYWALL_ENABLED === 'true',
}

export default featureFlags