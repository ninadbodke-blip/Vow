// =====================================================================
// revenuecat-webhook — Supabase Edge Function (Deno)
// =====================================================================
// Receives RevenueCat webhook events and writes the durable 'vow_path'
// entitlement for the purchasing user. This is the server-authoritative
// record the app's gate reads (the entitlements table). The Android app also
// trusts RevenueCat's own validated entitlement for the INSTANT unlock, so a
// slow webhook never blocks a paying user — this keeps the record durable and
// in sync across devices and the web.
//
// AUTH: RevenueCat sends a fixed Authorization header that YOU configure in the
// RevenueCat dashboard (Integrations -> Webhooks -> "Authorization header
// value"). We compare it against REVENUECAT_WEBHOOK_AUTH. Any request without
// the matching header is rejected.
//
// USER MAPPING: the app calls Purchases.logIn(supabaseUserId), so
// event.app_user_id IS the Supabase auth user id (a UUID).
//
// DEPLOY NOTE (important): RevenueCat sends OUR custom Authorization header,
// not a Supabase JWT, so this must be deployed with JWT verification OFF or
// Supabase's gateway will 401 it before it runs:
//     supabase functions deploy revenuecat-webhook --no-verify-jwt
//
// ENV (Supabase function secrets):
//   REVENUECAT_WEBHOOK_AUTH    — shared secret (set the SAME value in RC dashboard)
//   SUPABASE_URL               — auto-provided
//   SUPABASE_SERVICE_ROLE_KEY  — auto-provided
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PRODUCT = 'vow_path'
const ENTITLEMENT_ID = 'vow_path'

// Event types that GRANT the lifetime entitlement.
const GRANT_TYPES = new Set([
  'INITIAL_PURCHASE',
  'NON_RENEWING_PURCHASE', // the one a one-time / non-consumable product fires
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
])
// Event types that REVOKE it (refund / chargeback / expiry).
const REVOKE_TYPES = new Set([
  'CANCELLATION',
  'EXPIRATION',
  'REFUND',
])

// Constant-time-ish compare to avoid leaking the secret via timing.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' },
    })
  }

  const expectedAuth = Deno.env.get('REVENUECAT_WEBHOOK_AUTH')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!expectedAuth || !supabaseUrl || !serviceKey) {
    console.error('revenuecat-webhook not configured (missing auth secret or service key)')
    return new Response(JSON.stringify({ error: 'Not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  // --- Authenticate the webhook (fixed header set in the RC dashboard) ---
  const auth = req.headers.get('Authorization') || ''
  if (!safeEqual(auth, expectedAuth)) {
    console.warn('revenuecat-webhook: bad Authorization header')
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const event = body?.event ?? {}
    const type = String(event?.type || '')
    const appUserId = String(event?.app_user_id || '')

    const grants = GRANT_TYPES.has(type)
    const revokes = REVOKE_TYPES.has(type)

    // Acknowledge test pings and any event that's neither a grant nor a revoke
    // (TEST, SUBSCRIBER_ALIAS, BILLING_ISSUE, ...) so RevenueCat won't retry.
    if (!grants && !revokes) {
      return new Response(JSON.stringify({ ok: true, ignored: type || 'unknown' }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      })
    }

    // app_user_id was set to the Supabase user id at logIn; must be a UUID.
    if (!isUuid(appUserId)) {
      console.warn('revenuecat-webhook: app_user_id is not a Supabase UUID, skipping:', appUserId)
      return new Response(JSON.stringify({ ok: true, skipped: 'non-uuid app_user_id' }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      })
    }

    // If RevenueCat tells us which entitlements are involved, only act when ours is.
    const entIds: string[] = Array.isArray(event?.entitlement_ids) ? event.entitlement_ids : []
    if (entIds.length && !entIds.includes(ENTITLEMENT_ID)) {
      return new Response(JSON.stringify({ ok: true, ignored: 'other entitlement' }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      })
    }

    // Service-role client bypasses RLS (clients can't write entitlements).
    const admin = createClient(supabaseUrl, serviceKey)
    const { error: upsertErr } = await admin
      .from('entitlements')
      .upsert(
        {
          user_id: appUserId,
          product: PRODUCT,
          active: grants, // true on a grant event, false on refund/expiry
          source: 'revenuecat',
          currency: event?.currency || 'INR',
        },
        { onConflict: 'user_id,product' },
      )
    if (upsertErr) {
      console.error('revenuecat-webhook entitlement write failed:', upsertErr)
      // 500 → RevenueCat retries the webhook with backoff.
      return new Response(JSON.stringify({ error: 'Could not record entitlement' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`revenuecat-webhook: ${grants ? 'granted' : 'revoked'} ${PRODUCT} for ${appUserId} (${type})`)
    return new Response(JSON.stringify({ ok: true, product: PRODUCT, active: grants }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('revenuecat-webhook error:', e)
    // 500 → RevenueCat retries.
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
})
