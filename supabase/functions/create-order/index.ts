// =====================================================================
// create-order — Supabase Edge Function (Deno)
// =====================================================================
// Move 1 of the payment flow: the browser asks this function to create a
// Razorpay order. We call Razorpay's Orders API server-side using the secret
// (which lives ONLY in Supabase function secrets, never in the browser), and
// return just the order_id + amount the checkout popup needs.
//
// The amount is fixed SERVER-SIDE here (₹999 lifetime) on purpose — never
// trust an amount sent from the browser, or a user could pay ₹1 for the Path.
// =====================================================================


// The one product we sell on web today: Vow Path lifetime.
// Amount is in paise. ₹999 = 99900 paise. Change here if pricing changes.
// CORS headers so the browser (vowapp.in) can call this function.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const VOW_PATH_AMOUNT_PAISE = 99900
const CURRENCY = 'INR'

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
    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!keyId || !keySecret) {
      console.error('Razorpay keys not configured in function secrets')
      return new Response(JSON.stringify({ error: 'Payment not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Amount/currency are fixed server-side. We accept an optional short
    // receipt note from the client purely for our own reconciliation.
    let receipt = `vowpath_${Date.now()}`
    try {
      const body = await req.json()
      if (body?.receipt && typeof body.receipt === 'string') {
        receipt = body.receipt.slice(0, 40)
      }
    } catch { /* no body is fine */ }

    const amount = VOW_PATH_AMOUNT_PAISE
    if (amount < 100) {
      return new Response(JSON.stringify({ error: 'Amount too low' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Razorpay uses HTTP Basic auth: base64("key_id:key_secret")
    const auth = btoa(`${keyId}:${keySecret}`)
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: CURRENCY,
        receipt,
        notes: { product: 'vow_path' },
      }),
    })

    const data = await rzpRes.json()

    if (!rzpRes.ok) {
      // 401 from Razorpay → bad/auth keys; otherwise surface a 500.
      const status = rzpRes.status === 401 ? 401 : 500
      console.error('Razorpay order creation failed:', data)
      return new Response(
        JSON.stringify({ error: data?.error?.description || 'Order creation failed' }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ order_id: data.id, amount: data.amount, currency: data.currency }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    console.error('create-order error:', e)
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
