// =====================================================================
// revenueCatCheckout.js — Android (Play Billing via RevenueCat)
// =====================================================================
// The Android counterpart to razorpayCheckout.js / paypalCheckout.js. On the
// Android app, Google requires digital goods to be sold through Play Billing —
// Razorpay/PayPal are NOT allowed in-app. RevenueCat wraps Play Billing and
// validates the purchase receipt.
//
// Flow:
//   1. configure() — called once at app start (native only). Initializes the
//      RevenueCat SDK with the PUBLIC Google API key and identifies the user by
//      their Supabase user id (so RevenueCat's app-user-id == Supabase user id,
//      which lets the webhook map the purchase back to the right user).
//   2. purchaseVowPath() — fetches the current offering, buys the vow_path
//      package, and returns success/cancel/error.
//
// The AUTHORITATIVE entitlement write happens server-side: RevenueCat fires a
// webhook to the revenuecat-webhook Edge Function, which writes the same
// 'entitlements' row Razorpay/PayPal write (source: 'revenuecat'). This module
// also refreshes the local entitlement after purchase for immediate UX.
//
// The PUBLIC SDK key (VITE_REVENUECAT_GOOGLE_API_KEY) is safe in the bundle —
// it's a public key by design. No secret lives here.
// =====================================================================

import { Capacitor } from '@capacitor/core'
import { supabase } from '../supabaseClient'

const ENTITLEMENT_ID = 'vow_path'          // must match the entitlement id in RevenueCat
const PACKAGE_LOOKUP = 'vow_path_lifetime'  // the product id; used to find the package in the offering

let configured = false

// Lazy-load the plugin so the web bundle never tries to evaluate native code.
async function getPurchases() {
  const mod = await import('@revenuecat/purchases-capacitor')
  return mod.Purchases
}

/**
 * Initialize RevenueCat. Call once after the user is known (native only).
 * Safe to call multiple times; only configures once.
 */
export async function configureRevenueCat() {
  if (!Capacitor.isNativePlatform()) return            // web uses Razorpay/PayPal, not this
  if (configured) return

  const apiKey = import.meta.env.VITE_REVENUECAT_GOOGLE_API_KEY
  if (!apiKey) {
    console.warn('RevenueCat Google API key not set (VITE_REVENUECAT_GOOGLE_API_KEY)')
    return
  }

  try {
    const Purchases = await getPurchases()

    // Identify the user by their Supabase id so RevenueCat's app-user-id matches
    // our user id. The webhook relies on this to write the right entitlement.
    const { data: { user } } = await supabase.auth.getUser()

    await Purchases.configure({
      apiKey,
      appUserID: user?.id ?? null,   // null => RevenueCat anonymous id; we re-identify on login
    })
    configured = true
  } catch (e) {
    console.error('RevenueCat configure failed:', e)
  }
}

/**
 * Re-identify the RevenueCat user (call on login, after configure).
 * Ensures purchases attach to the correct Supabase user id.
 */
export async function identifyRevenueCatUser(userId) {
  if (!Capacitor.isNativePlatform() || !configured || !userId) return
  try {
    const Purchases = await getPurchases()
    await Purchases.logIn({ appUserID: userId })
  } catch (e) {
    console.error('RevenueCat logIn failed:', e)
  }
}

/**
 * Purchase the Vow Path via Play Billing.
 * @param {object} opts
 * @param {function} opts.onSuccess - purchase completed (entitlement active)
 * @param {function} opts.onCancel  - user cancelled the Play purchase sheet
 * @param {function} opts.onError   - failure, with a user-facing message
 */
export async function purchaseVowPath({ onSuccess, onCancel, onError }) {
  if (!Capacitor.isNativePlatform()) {
    onError?.('In-app purchase is only available in the Android app.')
    return
  }
  if (!configured) {
    await configureRevenueCat()
    if (!configured) { onError?.('Purchases are not available right now.'); return }
  }

  try {
    const Purchases = await getPurchases()

    // Get the current offering and find the vow_path package.
    const offerings = await Purchases.getOfferings()
    const current = offerings?.current
    if (!current || !current.availablePackages?.length) {
      onError?.('No purchase options are available right now.')
      return
    }

    // Prefer a package whose product id matches vow_path_lifetime; else first.
    let pkg = current.availablePackages.find(
      (p) => p.product?.identifier === PACKAGE_LOOKUP,
    ) || current.availablePackages[0]

    const purchaseResult = await Purchases.purchasePackage({ aPackage: pkg })

    // Check the entitlement is now active in the customer info.
    const active = purchaseResult?.customerInfo?.entitlements?.active || {}
    if (active[ENTITLEMENT_ID]) {
      onSuccess?.()
    } else {
      // Purchase went through but entitlement not reflected yet — the webhook
      // will still write it server-side; treat as success but note it.
      onSuccess?.()
    }
  } catch (e) {
    // RevenueCat sets userCancelled on the error when the user backs out.
    if (e?.userCancelled || e?.code === 'PURCHASE_CANCELLED' || e?.message?.toLowerCase().includes('cancel')) {
      onCancel?.()
    } else {
      console.error('purchaseVowPath failed:', e)
      onError?.('The purchase could not be completed. Please try again.')
    }
  }
}

/**
 * Restore purchases (for users who reinstall or switch devices).
 * Returns true if the vow_path entitlement is active after restore.
 */
export async function restoreVowPath() {
  if (!Capacitor.isNativePlatform() || !configured) return false
  try {
    const Purchases = await getPurchases()
    const info = await Purchases.restorePurchases()
    const active = info?.customerInfo?.entitlements?.active || {}
    return !!active[ENTITLEMENT_ID]
  } catch (e) {
    console.error('restorePurchases failed:', e)
    return false
  }
}