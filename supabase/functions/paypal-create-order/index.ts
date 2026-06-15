// =====================================================================
// paypal-create-order — Supabase Edge Function (Deno)
// =====================================================================
// PayPal mirror of create-order. Move 1 of the PayPal flow: the browser asks
// this function to create a PayPal order. We:
//   1. Get a PayPal OAuth access token using the client id + secret (the
//      SECRET lives ONLY in Supabase function secrets, never in the browser).
//   2. Create an order with the amount fixed SERVER-SIDE (never trust an
//      amount from the browser, or someone could pay $1 for the Path).
//   3. Return just the PayPal order id the JS SDK needs.
//
// Sandbox vs live is controlled by the PAYPAL_ENV secret ('sandbox' | 'live').
// =====================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// The one product we sell internationally on web today: Vow Path lifetime.
// Amount fixed server-side. USD chosen as the international settlement currency.
// Change here if international pricing changes.
const VOW_PATH_AMOUNT_USD = '99.00'
const CURRENCY = 'USD'

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
    if (!clientId || !secret) {
      console.error('PayPal credentials not configured in function secrets')
      return new Response(JSON.stringify({ error: 'Payment not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const accessToken = await getAccessToken(clientId, secret)
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Could not authenticate with PayPal' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create the order. Amount/currency fixed server-side.
    const orderRes = await fetch(`${paypalBase()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: { currency_code: CURRENCY, value: VOW_PATH_AMOUNT_USD },
            description: 'Vow Path — lifetime access',
            custom_id: 'vow_path',
          },
        ],
      }),
    })

    const order = await orderRes.json()
    if (!orderRes.ok) {
      console.error('PayPal order creation failed:', order)
      return new Response(
        JSON.stringify({ error: 'Order creation failed' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ order_id: order.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    console.error('paypal-create-order error:', e)
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
