// =====================================================================
// useEntitlement — does the current user own the Vow Path?
// =====================================================================
// Reads the 'entitlements' table (RLS lets a user see only their own row).
// This is the flag both Razorpay (web) and, later, RevenueCat (Android) write,
// so it's the single source of truth for the paywall gate.
//
// Returns { loading, hasVowPath, refresh }.
// =====================================================================

import { useState, useEffect, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'
import { supabase } from '../supabaseClient'
import { nativeHasVowPath } from './revenueCatCheckout'

export function useEntitlement(product = 'vow_path') {
  const [loading, setLoading] = useState(true)
  const [hasEntitlement, setHasEntitlement] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setHasEntitlement(false); return }
      const { data, error } = await supabase
        .from('entitlements')
        .select('active')
        .eq('user_id', user.id)
        .eq('product', product)
        .eq('active', true)
        .maybeSingle()
      if (!error && data) { setHasEntitlement(true); return }
      // On native, fall back to RevenueCat's own validated entitlement (instant,
      // and resilient to webhook lag) for the Vow Path.
      if (Capacitor.isNativePlatform() && product === 'vow_path' && (await nativeHasVowPath())) {
        setHasEntitlement(true); return
      }
      if (error) console.error('Entitlement read failed:', error)
      setHasEntitlement(false)
    } catch (e) {
      console.error('Entitlement read error:', e)
      setHasEntitlement(false)
    } finally {
      setLoading(false)
    }
  }, [product])

  useEffect(() => { refresh() }, [refresh])

  return { loading, hasVowPath: hasEntitlement, refresh }
}