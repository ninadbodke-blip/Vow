// =====================================================================
// paypalCheckout.js — frontend PayPal flow for the Vow Path (web, international)
// =====================================================================
// PayPal mirror of razorpayCheckout.js. PayPal's JS SDK is button-based: it
// renders its own PayPal/card buttons into a container element. This module:
//   1. Loads PayPal's JS SDK once (with the public client id).
//   2. Renders the PayPal Buttons into a container you pass in.
//   3. createOrder -> calls our paypal-create-order Edge Function (amount fixed
//      server-side) and hands the order id back to the SDK.
//   4. onApprove -> calls our paypal-capture-order Edge Function, which captures
//      server-side and grants the 'vow_path' entitlement. Same entitlement
//      Razorpay writes, so the paywall stays one source of truth.
//
// The CLIENT ID is public and read from VITE_PAYPAL_CLIENT_ID. The SECRET never
// appears here — it lives only in Supabase function secrets.
// =====================================================================

import { supabase } from '../supabaseClient'

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID
const PAYPAL_CURRENCY = 'USD'
const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL || 'https://wawvqiahdywadnlwzlrh.supabase.co'}/functions/v1`
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Load the PayPal JS SDK once; resolve when window.paypal is ready.
let scriptPromise = null
function loadPayPalScript() {
  if (typeof window !== 'undefined' && window.paypal) return Promise.resolve(true)
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    if (!PAYPAL_CLIENT_ID) {
      reject(new Error('PayPal is not configured.'))
      return
    }
    const s = document.createElement('script')
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}&currency=${PAYPAL_CURRENCY}&intent=capture`
    s.onload = () => resolve(true)
    s.onerror = () => { scriptPromise = null; reject(new Error('Could not load PayPal. Check your connection.')) }
    document.body.appendChild(s)
  })
  return scriptPromise
}

async function authedHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  return {
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      Authorization: `Bearer ${token || ANON_KEY}`,
    },
    hasUserToken: !!token,
  }
}

/**
 * Renders the PayPal buttons into a container element.
 * @param {object} opts
 * @param {HTMLElement} opts.container - the DOM node to render buttons into
 * @param {function} opts.onSuccess - called after server capture succeeds
 * @param {function} opts.onError   - called with a user-facing message on failure
 * @param {function} [opts.onCancel] - called if the user cancels the PayPal window
 * @returns {Promise<boolean>} resolves true once buttons are rendered
 */
export async function renderPayPalButtons({ container, onSuccess, onError, onCancel }) {
  if (!PAYPAL_CLIENT_ID) {
    onError?.('International payments are not configured yet.')
    return false
  }
  if (!container) {
    onError?.('Could not render PayPal.')
    return false
  }

  try {
    await loadPayPalScript()
  } catch (e) {
    onError?.(e?.message || 'Could not load PayPal.')
    return false
  }

  // Clear any prior render (e.g. if the paywall re-opens).
  container.innerHTML = ''

  try {
    window.paypal.Buttons({
      style: { layout: 'vertical', shape: 'rect', color: 'gold', label: 'paypal' },

      // Move 1: create the order via our Edge Function.
      createOrder: async () => {
        const res = await fetch(`${FUNCTIONS_BASE}/paypal-create-order`, {
          method: 'POST',
          headers: (await authedHeaders()).headers,
          body: JSON.stringify({}),
        })
        const data = await res.json()
        if (!res.ok || !data.order_id) {
          throw new Error(data?.error || 'Could not start the PayPal payment.')
        }
        return data.order_id
      },

      // Move 2: the buyer approved — capture server-side, which grants the
      // entitlement. We require a real user token here (the entitlement is
      // written for that user), same as the Razorpay verify step.
      onApprove: async (data) => {
        const { headers: vHeaders, hasUserToken } = await authedHeaders()
        if (!hasUserToken) {
          onError?.('Your session expired. Please sign in again, then retry — if you were charged, it will be honored once you do.')
          return
        }
        try {
          const res = await fetch(`${FUNCTIONS_BASE}/paypal-capture-order`, {
            method: 'POST',
            headers: vHeaders,
            body: JSON.stringify({ order_id: data.orderID }),
          })
          const result = await res.json()
          if (res.ok && result.success) {
            onSuccess?.(result)
          } else {
            onError?.(result?.error || 'We could not confirm your payment. If you were charged, contact support.')
          }
        } catch {
          onError?.('We could not confirm your payment. If you were charged, contact support.')
        }
      },

      onCancel: () => { onCancel?.() },

      onError: (err) => {
        console.error('PayPal Buttons error:', err)
        onError?.('Something went wrong with PayPal. Please try again.')
      },
    }).render(container)

    return true
  } catch (e) {
    onError?.(e?.message || 'Could not render PayPal.')
    return false
  }
}