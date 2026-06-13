// =====================================================================
// razorpayCheckout.js — frontend payment flow for the Vow Path (web)
// =====================================================================
// Orchestrates the browser side of the payment:
//   1. Loads Razorpay's checkout script (once).
//   2. Calls our create-order Edge Function to get an order_id.
//   3. Opens the Razorpay modal with that order.
//   4. On success, sends the result to verify-payment, which grants the
//      'vow_path' entitlement server-side.
//
// The KEY_ID is public and read from VITE_RAZORPAY_KEY_ID. The SECRET never
// appears here — it lives only in Supabase function secrets.
// =====================================================================

import { supabase } from './supabaseClient'

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID
const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL || 'https://wawvqiahdywadnlwzlrh.supabase.co'}/functions/v1`

// Load the checkout script once; resolve when window.Razorpay is ready.
let scriptPromise = null
function loadRazorpayScript() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve(true)
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => { scriptPromise = null; reject(new Error('Could not load the payment library. Check your connection.')) }
    document.body.appendChild(s)
  })
  return scriptPromise
}

async function authedHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  return {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QkML7XK9TV0uSg6PwULI8Q_IWGquee9',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/**
 * Runs the full purchase flow for the Vow Path.
 * @param {object} opts
 * @param {object} opts.user        - { name?, email?, contact? } to prefill the modal (optional)
 * @param {function} opts.onSuccess - called after server verification succeeds
 * @param {function} opts.onError   - called with a user-facing message on any failure
 * @param {function} [opts.onDismiss] - called if the user closes the modal without paying
 */
export async function startVowPathPurchase({ user = {}, onSuccess, onError, onDismiss }) {
  try {
    if (!RAZORPAY_KEY_ID) {
      onError?.('Payments are not configured yet. Please try again later.')
      return
    }

    await loadRazorpayScript()

    // 1. Create the order server-side.
    const orderRes = await fetch(`${FUNCTIONS_BASE}/create-order`, {
      method: 'POST',
      headers: await authedHeaders(),
      body: JSON.stringify({ receipt: `vowpath_${Date.now()}` }),
    })
    const order = await orderRes.json()
    if (!orderRes.ok) {
      onError?.(order?.error || 'Could not start the payment. Please try again.')
      return
    }

    // 2. Open the Razorpay modal.
    const rzp = new window.Razorpay({
      key: RAZORPAY_KEY_ID,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Vow',
      description: 'Vow Path — lifetime access',
      prefill: {
        name: user.name || '',
        email: user.email || '',
        contact: user.contact || '',
      },
      theme: { color: '#854F0B' },
      modal: {
        ondismiss: () => { onDismiss?.() },
      },
      handler: async (response) => {
        // 3. Verify server-side; entitlement is granted there.
        try {
          const verifyRes = await fetch(`${FUNCTIONS_BASE}/verify-payment`, {
            method: 'POST',
            headers: await authedHeaders(),
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
          const result = await verifyRes.json()
          if (verifyRes.ok && result.success) {
            onSuccess?.(result)
          } else {
            onError?.(result?.error || 'We could not confirm your payment. If you were charged, contact support.')
          }
        } catch {
          onError?.('We could not confirm your payment. If you were charged, contact support.')
        }
      },
    })

    rzp.on('payment.failed', (resp) => {
      onError?.(resp?.error?.description || 'The payment did not go through. Please try again.')
    })

    rzp.open()
  } catch (e) {
    onError?.(e?.message || 'Something went wrong starting the payment.')
  }
}