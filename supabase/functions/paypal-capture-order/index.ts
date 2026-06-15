// =====================================================================
// paypal-capture-order — Supabase Edge Function (Deno)
// =====================================================================
// PayPal mirror of verify-payment, and the security-critical move. The browser
// sends the PayPal order id (from onApprove). We:
//   1. Identify the logged-in user from their Supabase auth token.
//   2. Capture the order SERVER-SIDE via PayPal's API using our secret. Only a
//      genuinely approved order can be captured, and capturing server-side (not
//      trusting a client "it succeeded" claim) is what proves the payment.
//   3. Verify the capture COMPLETED and that the captured amount/currency match
//      what we expect (defense against tampering).
//   4. ONLY then write the 'vow_path' entitlement for that user, using the
//      service-role key (bypasses RLS — clients can't do this).
//
// Sandbox vs live is controlled by the PAYPAL_ENV secret ('sandbox' | 'live').
// =====================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// What we expect a Vow Path purchase to be. Must match paypal-create-order.
const EXPECTED_AMOUNT_USD = '99.00'
const EXPECTED_CURRENCY = 'USD'

function paypalBase(): string {
  const env = (Deno.env.get('PAYPAL_ENV') || 'sandbox').toLowerCase()
  return env === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

async function getAccessToken(clientId: string, secret: string): Promise<string | null> {
  const auth = btoa(`${clientId}:${secret}`)
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) {
    console.error('PayPal token request failed:', await res.text())
    return null
  }
  const data = await res.json()
  return data.access_token || null
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
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const secret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!clientId || !secret || !supabaseUrl || !serviceKey) {
      console.error('paypal-capture-order not configured (missing secret or service key)')
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

    // --- 2. Read the order id the client got from onApprove ---
    const body = await req.json().catch(() => ({}))
    const orderId = body?.order_id
    if (!orderId || typeof orderId !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing order id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- 3. Capture the order server-side ---
    const accessToken = await getAccessToken(clientId, secret)
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Could not authenticate with PayPal' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const capRes = await fetch(`${paypalBase()}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    const cap = await capRes.json()

    if (!capRes.ok) {
      console.error('PayPal capture failed for user', user.id, 'order', orderId, cap)
      return new Response(JSON.stringify({ error: 'Payment capture failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- 4. Verify the capture actually COMPLETED + amount/currency match ---
    if (cap.status !== 'COMPLETED') {
      console.warn('PayPal order not COMPLETED for user', user.id, 'status', cap.status)
      return new Response(JSON.stringify({ error: 'Payment not completed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const capture = cap?.purchase_units?.[0]?.payments?.captures?.[0]
    const amount = capture?.amount?.value
    const currency = capture?.amount?.currency_code
    const captureId = capture?.id
    if (amount !== EXPECTED_AMOUNT_USD || currency !== EXPECTED_CURRENCY) {
      console.warn('PayPal amount mismatch for user', user.id, 'got', amount, currency)
      return new Response(JSON.stringify({ error: 'Payment amount mismatch' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- 5. Grant the entitlement (service role bypasses RLS) ---
    // amount stored in cents to fit the integer column (99.00 -> 9900).
    const amountCents = Math.round(parseFloat(amount) * 100)
    const admin = createClient(supabaseUrl, serviceKey)
    const { error: upsertErr } = await admin
      .from('entitlements')
      .upsert(
        {
          user_id: user.id,
          product: 'vow_path',
          active: true,
          source: 'paypal',
          paypal_order_id: orderId,
          paypal_capture_id: captureId,
          amount: amountCents,
          currency: EXPECTED_CURRENCY,
        },
        { onConflict: 'user_id,product' },
      )
    if (upsertErr) {
      console.error('Entitlement write failed:', upsertErr)
      return new Response(
        JSON.stringify({ error: 'Payment captured but could not be recorded. Contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(JSON.stringify({ success: true, product: 'vow_path' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('paypal-capture-order error:', e)
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
