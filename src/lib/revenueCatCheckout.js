// =====================================================================
// revenueCatCheckout.js — Android (Play Billing) purchase for the Vow Path
// =====================================================================
// Native counterpart to razorpayCheckout.js (web / India) and
// paypalCheckout.js (web / international). Google Play policy requires digital
// goods in-app to go through Play Billing, so on Android the one-time lifetime
// Vow Path purchase runs through RevenueCat -> Play Billing here.
//
// WHO-HAS-PAID, source of truth: still the Supabase `entitlements` table
// (product = 'vow_path', active = true). That row is written server-side by the
// RevenueCat webhook (supabase/functions/revenuecat-webhook). For the INSTANT
// post-purchase unlock (and offline / relaunch resilience) the app also trusts
// RevenueCat's own validated entitlement via nativeHasVowPath(), so we never
// race the webhook.
//
// Everything here is a safe no-op on web (Capacitor.isNativePlatform() === false);
// web keeps using Razorpay / PayPal.
//
// SETUP — these MUST match the RevenueCat dashboard:
//   * Entitlement identifier ...... 'vow_path'                    (ENTITLEMENT_ID)
//   * Android public SDK key ...... VITE_REVENUECAT_ANDROID_KEY   (.env / Cloudflare build var; starts 'goog_')
//   * An Offering whose Package maps to the Play product (e.g. vow_path_lifetime),
//     with that product attached to the 'vow_path' entitlement.
//
// NOTE: importing this file makes @revenuecat/purchases-capacitor a hard
// dependency, so `npm i @revenuecat/purchases-capacitor` must be run or the
// (Rolldown) build will fail on the unresolved import.
// =====================================================================

import { Capacitor } from '@capacitor/core'
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor'

// Keep equal to the `product` value in the entitlements table so web + Android
// stay aligned on the same entitlement name.
const ENTITLEMENT_ID = 'vow_path'

const ANDROID_API_KEY = import.meta.env.VITE_REVENUECAT_ANDROID_KEY

let configured = false

const isNative = () => Capacitor.isNativePlatform()

// ---------------------------------------------------------------------
// configureRevenueCat() — call once, early in app startup (native only).
// ---------------------------------------------------------------------
export async function configureRevenueCat() {
  if (!isNative() || configured) return
  if (!ANDROID_API_KEY) {
    console.warn('[RevenueCat] VITE_REVENUECAT_ANDROID_KEY is not set; skipping configure.')
    return
  }
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.INFO })
    await Purchases.configure({ apiKey: ANDROID_API_KEY })
    configured = true
  } catch (e) {
    console.error('[RevenueCat] configure failed:', e)
  }
}

// ---------------------------------------------------------------------
// identifyRevenueCatUser(supabaseUserId) — tie RevenueCat's app user id to the
// Supabase auth user id. The webhook reads this id (event.app_user_id) to write
// the correct entitlements row, so this MUST run after sign-in and before any
// purchase.
// ---------------------------------------------------------------------
export async function identifyRevenueCatUser(supabaseUserId) {
  if (!isNative() || !supabaseUserId) return
  if (!configured) await configureRevenueCat()
  if (!configured) return
  try {
    await Purchases.logIn({ appUserID: supabaseUserId })
  } catch (e) {
    console.error('[RevenueCat] logIn failed:', e)
  }
}

// ---------------------------------------------------------------------
// logoutRevenueCat() — call on sign-out so a shared device doesn't carry one
// user's entitlement into the next session.
// ---------------------------------------------------------------------
export async function logoutRevenueCat() {
  if (!isNative() || !configured) return
  try {
    await Purchases.logOut()
  } catch (e) {
    // logOut throws if already anonymous — safe to ignore.
  }
}

// ---------------------------------------------------------------------
// nativeHasVowPath() — does RevenueCat consider this user entitled right now?
// Used by the paywall gate on native for an instant, webhook-independent unlock
// (RevenueCat validates the receipt server-side, so this is safe to trust).
// Returns false on web or on any error.
// ---------------------------------------------------------------------
export async function nativeHasVowPath() {
  if (!isNative()) return false
  if (!configured) await configureRevenueCat()
  if (!configured) return false
  try {
    const { customerInfo } = await Purchases.getCustomerInfo()
    return !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]
  } catch (e) {
    console.error('[RevenueCat] getCustomerInfo failed:', e)
    return false
  }
}

// ---------------------------------------------------------------------
// purchaseVowPath({ onSuccess, onCancel, onError }) — run the Play Billing
// purchase for the Vow Path lifetime product. Mirrors the callback shape of
// startVowPathPurchase (Razorpay).
// ---------------------------------------------------------------------
export async function purchaseVowPath({ onSuccess, onCancel, onError } = {}) {
  if (!isNative()) {
    onError?.('In-app purchase is only available in the Android app.')
    return
  }
  if (!configured) await configureRevenueCat()
  if (!configured) {
    onError?.('The store is not ready yet. Please try again in a moment.')
    return
  }

  try {
    const offerings = await Purchases.getOfferings()
    const pkg = offerings?.current?.availablePackages?.[0]
    if (!pkg) {
      onError?.('No products are available right now. Please try again later.')
      return
    }

    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })

    // The purchase completed (Play charged). Unlock regardless of whether the
    // entitlement object has propagated yet — never block a paying user.
    if (!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]) {
      console.warn('[RevenueCat] purchase succeeded but entitlement not active yet; unlocking anyway.')
    }
    onSuccess?.()
  } catch (e) {
    if (isUserCancelled(e)) {
      onCancel?.()
    } else {
      console.error('[RevenueCat] purchase failed:', e)
      onError?.(humanError(e))
    }
  }
}

// ---------------------------------------------------------------------
// restoreVowPath({ onSuccess, onError }) — re-link a prior purchase (new
// device, reinstall). Surface from a "Restore purchases" link on the paywall.
// ---------------------------------------------------------------------
export async function restoreVowPath({ onSuccess, onError } = {}) {
  if (!isNative()) {
    onError?.('Restore is only available in the Android app.')
    return
  }
  if (!configured) await configureRevenueCat()
  if (!configured) {
    onError?.('The store is not ready yet. Please try again in a moment.')
    return
  }
  try {
    const { customerInfo } = await Purchases.restorePurchases()
    if (customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]) onSuccess?.()
    else onError?.('No previous purchase was found for this account.')
  } catch (e) {
    console.error('[RevenueCat] restore failed:', e)
    onError?.(humanError(e))
  }
}

// ---------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------
function isUserCancelled(e) {
  if (!e) return false
  if (e.userCancelled === true) return true
  const code = String(e.code || '').toUpperCase()
  if (code.includes('CANCEL')) return true
  return /cancel/i.test(e.message || '')
}

function humanError(e) {
  const msg = e?.message || ''
  if (/network|connection/i.test(msg)) return 'Network problem reaching the store. Please try again.'
  if (/already.*(own|purchased)/i.test(msg)) return 'You already own the Vow Path — try "Restore purchases".'
  return 'The purchase could not be completed. Please try again.'
}