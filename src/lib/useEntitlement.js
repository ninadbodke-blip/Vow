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
import { supabase } from '../supabaseClient'

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
      if (error) { console.error('Entitlement read failed:', error); setHasEntitlement(false); return }
      setHasEntitlement(!!data)
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