// =====================================================================
// verify-payment — Supabase Edge Function (Deno)
// =====================================================================
// Move 3 of the payment flow, and the security-critical one. The browser sends
// the three values Razorpay returned (order_id, payment_id, signature). We:
//   1. Identify the logged-in user from their Supabase auth token.
//   2. Recompute HMAC-SHA256(order_id + "|" + payment_id) with the SECRET and
//      compare to the signature Razorpay sent. Only the real Razorpay could
//      have produced a matching signature, so this proves the payment is real.
//   3. ONLY if it matches, write the 'vow_path' entitlement for that user,
//      using the service-role key (bypasses RLS — clients can't do this).
//
// If the signature doesn't match, we return 400 and grant nothing.
// =====================================================================

// CORS headers so the browser (vowapp.in) can call this function.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// constant-time-ish hex compare to avoid leaking via timing
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!keySecret || !supabaseUrl || !serviceKey) {
      console.error('verify-payment not configured (missing secret or service key)')
      return new Response(JSON.stringify({ error: 'Payment not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- 1. Identify the user from their auth token ---
    const authHeader = req.headers.get('Authorization') || ''
    const jwt = authHeader.replace('Bearer ', '')
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    // A client scoped to the caller's token, used only to resolve their identity.
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    })
    const { data: { user }, error: userErr } = await userClient.auth.getUser()
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- 2. Read + validate the payment fields ---
    const body = await req.json().catch(() => ({}))
    const orderId = body?.razorpay_order_id
    const paymentId = body?.razorpay_payment_id
    const signature = body?.razorpay_signature
    if (!orderId || !paymentId || !signature) {
      return new Response(JSON.stringify({ error: 'Missing payment fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- 3. Verify the signature ---
    const expected = await hmacSha256Hex(keySecret, `${orderId}|${paymentId}`)
    if (!safeEqual(expected, String(signature))) {
      console.warn('Signature mismatch for user', user.id, 'order', orderId)
      return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- 4. Signature valid → grant the entitlement (service role bypasses RLS) ---
    const admin = createClient(supabaseUrl, serviceKey)
    const { error: upsertErr } = await admin
      .from('entitlements')
      .upsert(
        {
          user_id: user.id,
          product: 'vow_path',
          active: true,
          source: 'razorpay',
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          currency: 'INR',
        },
        { onConflict: 'user_id,product' },
      )
    if (upsertErr) {
      console.error('Entitlement write failed:', upsertErr)
      // Payment is real but we failed to record it — return 500 so the client
      // can retry / you can reconcile. Do NOT tell the user it failed to pay.
      return new Response(
        JSON.stringify({ error: 'Payment verified but could not be recorded. Contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(JSON.stringify({ success: true, product: 'vow_path' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('verify-payment error:', e)
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
