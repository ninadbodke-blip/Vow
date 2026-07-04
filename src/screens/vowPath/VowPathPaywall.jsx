import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { supabase } from '../../supabaseClient'
import { startVowPathPurchase } from '../../lib/razorpayCheckout'
import { renderPayPalButtons } from '../../lib/paypalCheckout'
import { purchaseVowPath } from '../../lib/revenueCatCheckout'

// =====================================================================
// VowPathPaywall — the soft paywall shown when a non-paying user tries to
// enter their allotted stage. Previews what the Vow Path is, then offers the
// one-time lifetime purchase. A single "Unlock" button opens a method picker
// (Razorpay for India / PayPal for international) so we never show a rupee
// price to an international buyer or vice-versa — each provider shows its own
// currency in its own checkout. Both write the same 'vow_path' entitlement.
//
// Props:
//   stageName   - the stage they're about to enter (for the CTA copy)
//   onUnlocked  - called after payment is verified server-side
//   onClose     - called if they dismiss without buying
// =====================================================================

const WHAT_YOU_GET = [
  ['The full six-stage path', 'Notice, Reflect, Commit, Early days, Staying steady, and Getting back up — the whole journey, not a taste of it.'],
  ['Daily guided work', 'Each day opens a short, tactile practice built for where you actually are — not a generic checklist.'],
  ['Yours for good', 'A one-time payment. No subscription, no renewals. The path stays open whenever you need it.'],
]

// --- Provider logos (official SVGs served from public/logos/) ---
function RazorpayLogo() {
  return <img src="/logos/razorpay.svg" alt="Razorpay" style={{ height: '22px', width: 'auto', display: 'block' }} />
}
function PayPalLogo() {
  return <img src="/logos/paypal.svg" alt="PayPal" style={{ height: '20px', width: 'auto', display: 'block' }} />
}

export default function VowPathPaywall({ stageName = 'the Vow Path', onUnlocked, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()

  // A purchase requires a real, durable account — never an anonymous session.
  // Entitlements and RevenueCat attribute to user.id; an anonymous id lives only
  // in this device's storage, so a paid unlock on it could be silently lost on
  // reinstall with no way to restore. If the buyer hasn't saved their account,
  // send them to do that first, then return them here to complete the purchase.
  // Returns true if it redirected (caller should stop).
  const requireRealAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.is_anonymous) {
      navigate('/app/signup', { state: { returnTo: location.pathname + location.search } })
      return true
    }
    return false
  }
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [showPicker, setShowPicker] = useState(false)
  const [paypalChosen, setPaypalChosen] = useState(false)
  const paypalRef = useRef(null)

  // Render PayPal's SDK buttons only once the user has chosen PayPal in the
  // picker (PayPal buttons must be rendered by the SDK, not triggered by a
  // custom click). Rendering on-demand also avoids loading PayPal for users
  // who pay with Razorpay.
  useEffect(() => {
    let cancelled = false
    if (paypalChosen && paypalRef.current) {
      renderPayPalButtons({
        container: paypalRef.current,
        onSuccess: () => { if (!cancelled) onUnlocked?.() },
        onError: (msg) => { if (!cancelled) setError(msg) },
        onCancel: () => {},
      })
    }
    return () => { cancelled = true }
  }, [paypalChosen])

  const isNative = Capacitor.isNativePlatform()

  // Android billing readiness gate.
  // True now that RevenueCat + Play Billing are live: the Android app runs the
  // real Play Billing purchase via purchaseVowPath(). Web (Razorpay/PayPal) is
  // unaffected by this flag.
  const ANDROID_BILLING_LIVE = true
  const nativePurchaseReady = isNative && ANDROID_BILLING_LIVE

  const handleRazorpay = async () => {
    setError(null)
    setBusy(true)
    await startVowPathPurchase({
      onSuccess: () => { setBusy(false); onUnlocked?.() },
      onError: (msg) => { setBusy(false); setError(msg) },
      onDismiss: () => { setBusy(false) },
    })
  }

  // Android purchase handler — runs the Play Billing purchase via RevenueCat.
  // On success, onUnlocked re-checks entitlement; the gate trusts RevenueCat's
  // own validated entitlement instantly, so the unlock never waits on the
  // webhook that durably writes the entitlements table.
  const handleNativePurchase = async () => {
    setError(null)
    setBusy(true)
    await purchaseVowPath({
      onSuccess: () => { setBusy(false); onUnlocked?.() },
      onCancel: () => { setBusy(false) },
      onError: (msg) => { setBusy(false); setError(msg) },
    })
  }

  const handleMainButton = async () => {
    if (busy) return
    if (await requireRealAccount()) return
    if (isNative) {
      if (nativePurchaseReady) handleNativePurchase()
      // if not ready, button is replaced by the coming-soon note (see render)
    } else {
      setShowPicker(true)
    }
  }

  const closePicker = () => {
    if (busy) return
    setShowPicker(false)
    setPaypalChosen(false)
    setError(null)
  }

  return (
    <div style={S.backdrop} onClick={() => { if (!busy && !showPicker) onClose?.() }}>
      <div style={S.card} onClick={(e) => e.stopPropagation()}>
        <div style={S.handle} />

        <p style={S.eyebrow}>The Vow Path</p>
        <h2 style={S.title}>Walk the whole way.</h2>
        <p style={S.lead}>
          You've found where you stand. The path from here is the heart of Vow —
          a guided way through, one day at a time. Unlock it once, keep it for good.
        </p>

        <div style={S.list}>
          {WHAT_YOU_GET.map(([h, b], i) => (
            <div key={i} style={S.row}>
              <span style={S.dot} />
              <div>
                <p style={S.rowHead}>{h}</p>
                <p style={S.rowBody}>{b}</p>
              </div>
            </div>
          ))}
        </div>

        {isNative && !nativePurchaseReady ? (
          <>
            <div style={S.comingSoon}>
              <p style={S.comingSoonTitle}>The Vow Path is coming to Android soon.</p>
              <p style={S.comingSoonBody}>
                For now, the full free experience is yours — every day, every tool,
                no charge. We'll open the deeper path here before long.
              </p>
            </div>
            <button onClick={() => onClose?.()} style={S.payBtn}>
              Continue with the free path
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleMainButton}
              style={S.payBtn}
              disabled={busy}
            >
              {busy && isNative ? 'Opening…' : `Unlock the Vow Path — begin ${stageName}`}
            </button>

            {isNative && error && <p style={{ ...S.error, marginTop: '12px', marginBottom: 0 }}>{error}</p>}

            <p style={S.fineprint}>One-time payment · lifetime access · secure checkout</p>
            <p style={S.entityLine}>Payment to Vow Labs · vowapp.in</p>
          </>
        )}

        {!(isNative && !nativePurchaseReady) && (
          <button onClick={() => onClose?.()} style={S.laterBtn}>
            Maybe later
          </button>
        )}
      </div>

      {/* METHOD PICKER — floating tile */}
      {showPicker && (
        <div style={S.pickerBackdrop} onClick={closePicker}>
          <div style={S.pickerCard} onClick={(e) => e.stopPropagation()}>
            <div style={S.handle} />
            <p style={S.pickerTitle}>Choose how to pay</p>
            <p style={S.pickerSub}>One-time payment · lifetime access</p>

            {error && <p style={S.error}>{error}</p>}

            {/* Razorpay option */}
            <button
              onClick={handleRazorpay}
              disabled={busy}
              style={{ ...S.method, ...(busy ? S.methodBusy : {}) }}
            >
              <span style={S.methodLogo}><RazorpayLogo /></span>
              <span style={S.methodLine}>If you're in India</span>
            </button>

            {/* PayPal option — choosing it reveals PayPal's SDK buttons */}
            {!paypalChosen ? (
              <button
                onClick={() => { setError(null); setPaypalChosen(true) }}
                disabled={busy}
                style={{ ...S.method, ...(busy ? S.methodBusy : {}) }}
              >
                <span style={S.methodLogo}><PayPalLogo /></span>
                <span style={S.methodLine}>If you're outside India</span>
              </button>
            ) : (
              <div style={S.paypalChosenWrap}>
                <div style={S.methodLogoRow}>
                  <PayPalLogo />
                  <span style={S.methodLine}>Billed in USD</span>
                </div>
                <div ref={paypalRef} style={S.paypalWrap} />
              </div>
            )}

            <button onClick={closePicker} style={S.laterBtn} disabled={busy}>
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const S = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(40,25,15,0.55)',
    zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  },
  card: {
    width: '100%', maxWidth: '440px', boxSizing: 'border-box',
    background: '#FCFAF5', borderTopLeftRadius: '26px', borderTopRightRadius: '26px',
    padding: '14px 22px 26px', boxShadow: '0 -20px 60px rgba(40,25,15,0.35)',
    maxHeight: '92vh', overflowY: 'auto',
  },
  handle: { width: '38px', height: '4px', borderRadius: '2px', background: '#E0D4BE', margin: '0 auto 18px' },
  eyebrow: { fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#854F0B', fontFamily: 'Georgia, serif', margin: '0 0 8px', textAlign: 'center' },
  title: { fontSize: '25px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 10px', textAlign: 'center', lineHeight: 1.2 },
  lead: { fontSize: '14.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 22px', textAlign: 'center' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px', margin: '0 0 22px' },
  row: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', background: '#C9A85C', marginTop: '7px', flexShrink: 0 },
  rowHead: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 3px' },
  rowBody: { fontSize: '13px', color: '#7C6A52', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: 0 },
  error: { fontSize: '13px', color: '#9E3F1C', fontFamily: 'Georgia, serif', background: '#F7ECE4', borderRadius: '10px', padding: '10px 12px', margin: '0 0 14px', textAlign: 'center' },
  payBtn: {
    width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
    background: 'linear-gradient(180deg, #3A2A1C, #241710)', color: '#F6E8C4',
    fontSize: '15px', fontFamily: 'Georgia, serif', fontWeight: 500, cursor: 'pointer',
    boxShadow: '0 8px 22px -8px rgba(30,18,8,0.5)',
  },
  fineprint: { fontSize: '11.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '12px 0 0' },
  entityLine: { fontSize: '11px', color: '#854F0B', fontFamily: 'Georgia, serif', textAlign: 'center', margin: '5px 0 0', letterSpacing: '0.02em' },
  laterBtn: { width: '100%', padding: '13px', marginTop: '10px', background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '13.5px', fontFamily: 'Georgia, serif', cursor: 'pointer' },

  // METHOD PICKER
  pickerBackdrop: {
    position: 'fixed', inset: 0, background: 'rgba(40,25,15,0.55)',
    zIndex: 320, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  },
  pickerCard: {
    width: '100%', maxWidth: '440px', boxSizing: 'border-box',
    background: '#FCFAF5', borderTopLeftRadius: '26px', borderTopRightRadius: '26px',
    padding: '14px 22px 26px', boxShadow: '0 -20px 60px rgba(40,25,15,0.4)',
    maxHeight: '92vh', overflowY: 'auto',
  },
  pickerTitle: { fontSize: '19px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 4px', textAlign: 'center' },
  pickerSub: { fontSize: '12.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '0 0 20px' },
  method: {
    width: '100%', boxSizing: 'border-box',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
    padding: '18px 16px', marginBottom: '12px',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E5D9C2', borderRadius: '16px',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(80,50,20,0.05)',
  },
  methodBusy: { opacity: 0.6, cursor: 'default' },
  methodLogo: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '36px' },
  methodLine: { fontSize: '13px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  paypalChosenWrap: {
    width: '100%', boxSizing: 'border-box',
    padding: '16px', marginBottom: '12px',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #C9A85C', borderRadius: '16px',
  },
  methodLogoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '14px' },
  paypalWrap: { minHeight: '52px' },
  comingSoon: {
    background: 'linear-gradient(180deg, #FBF1DD 0%, #F6E8C4 100%)',
    border: '0.5px solid #E3D2AE',
    borderRadius: '16px',
    padding: '18px 18px',
    marginBottom: '14px',
  },
  comingSoonTitle: {
    fontSize: '15.5px', color: '#854F0B', fontFamily: 'Georgia, serif',
    fontStyle: 'italic', fontWeight: 500, margin: '0 0 6px', textAlign: 'center',
  },
  comingSoonBody: {
    fontSize: '13.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif',
    lineHeight: 1.55, margin: 0, textAlign: 'center',
  },
}