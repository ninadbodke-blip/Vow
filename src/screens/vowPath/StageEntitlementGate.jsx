import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { supabase } from '../../supabaseClient'
import VowPathPaywall from './VowPathPaywall'
import { nativeHasVowPath } from '../../lib/revenueCatCheckout'

// =====================================================================
// StageEntitlementGate — wraps every Vow Path STAGE route so a stage's
// content cannot be reached without owning the 'vow_path' entitlement,
// no matter which door the user came through (assessment reveal, the
// intro map, a Reclaim move, or a deep link). This is the single,
// unbypassable chokepoint.
//
// Behaviour:
//   * checking  → a quiet loading state (no fl__icker of locked content)
//   * paid      → render the stage (children)
//   * unpaid    → render the paywall; on purchase, re-check and let them in
// =====================================================================

const STAGE_NAMES = {
  notice: 'Notice',
  reflect: 'Reflect',
  commit: 'Commit',
  endure: 'Early days',
  build: 'Staying steady',
  reclaim: 'Getting back up',
}

export default function StageEntitlementGate({ stage, children }) {
  const navigate = useNavigate()
  const params = useParams()
  const [state, setState] = useState('checking') // 'checking' | 'paid' | 'unpaid'

  // Resolve the stage name for the paywall CTA. `stage` may be passed in, or
  // inferred from the route param for the result screen etc.
  const stageKey = stage || params.stageSlug || params.toStage || params.stage || ''
  const stageName = STAGE_NAMES[stageKey] || 'the Vow Path'

  async function check() {
    setState('checking')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/app/welcome'); return }
      const { data: ent, error } = await supabase
        .from('entitlements')
        .select('active')
        .eq('user_id', user.id)
        .eq('product', 'vow_path')
        .eq('active', true)
        .maybeSingle()
      if (!error && ent) { setState('paid'); return }
      // On native, RevenueCat's own validated entitlement is authoritative and
      // instant — this covers the brief gap before the webhook writes the table
      // right after a purchase, plus a reinstall / new device on the same account.
      if (Capacitor.isNativePlatform() && (await nativeHasVowPath())) { setState('paid'); return }
      // No entitlement (or a read error): fail CLOSED — never hand out access
      // because a check failed.
      if (error) console.error('Entitlement check failed:', error)
      setState('unpaid')
    } catch (e) {
      console.error('Entitlement check error:', e)
      setState('unpaid')
    }
  }

  useEffect(() => { check() /* eslint-disable-next-line */ }, [])

  if (state === 'checking') {
    return (
      <div style={S.frame}>
        <div style={S.loadingCard}>
          <p style={S.loadingText}>One moment…</p>
        </div>
      </div>
    )
  }

  if (state === 'unpaid') {
    return (
      <div style={S.frame}>
        <div style={S.loadingCard} />
        <VowPathPaywall
          stageName={stageName}
          onUnlocked={() => check()}
          onClose={() => navigate('/app/home')}
        />
      </div>
    )
  }

  return children
}

const S = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  loadingCard: { textAlign: 'center' },
  loadingText: { fontSize: '15px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
}