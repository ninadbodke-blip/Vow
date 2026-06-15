import { useState, useRef, useEffect } from 'react'
import { startVowPathPurchase } from '../../lib/razorpayCheckout'
import { renderPayPalButtons } from '../../lib/paypalCheckout'

// =====================================================================
// VowPathPaywall — the soft paywall shown when a non-paying user tries to
// enter their allotted stage. It previews what the Vow Path is (so it's an
// invitation, not a wall), then offers the one-time lifetime purchase via
// Razorpay. On success, onUnlocked() fires and the caller proceeds into the
// stage. On web this is the only way to buy; Android will buy via Play later,
// but both write the same 'vow_path' entitlement, so this gate is universal.
//
// Props:
//   stageName   - the stage they're about to enter (for the CTA copy)
//   onUnlocked  - called after payment is verified server-side
//   onClose     - called if they dismiss without buying
// =====================================================================

const PRICE_LABEL = '₹999'

const WHAT_YOU_GET = [
  ['The full six-stage path', 'Notice, Reflect, Commit, Early days, Staying steady, and Getting back up — the whole journey, not a taste of it.'],
  ['Daily guided work', 'Each day opens a short, tactile practice built for where you actually are — not a generic checklist.'],
  ['Yours for good', 'A one-time payment. No subscription, no renewals. The path stays open whenever you need it.'],
]

export default function VowPathPaywall({ stageName = 'the Vow Path', onUnlocked, onClose }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const paypalRef = useRef(null)

  // Render PayPal buttons (international option) into their container once.
  useEffect(() => {
    let cancelled = false
    if (paypalRef.current) {
      renderPayPalButtons({
        container: paypalRef.current,
        onSuccess: () => { if (!cancelled) onUnlocked?.() },
        onError: (msg) => { if (!cancelled) setError(msg) },
        onCancel: () => {},
      })
    }
    return () => { cancelled = true }
  }, [])

  const handlePurchase = async () => {
    setError(null)
    setBusy(true)
    await startVowPathPurchase({
      onSuccess: () => { setBusy(false); onUnlocked?.() },
      onError: (msg) => { setBusy(false); setError(msg) },
      onDismiss: () => { setBusy(false) }, // they closed the Razorpay modal; stay on the paywall
    })
  }

  return (
    <div style={S.backdrop} onClick={() => { if (!busy) onClose?.() }}>
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

        {error && <p style={S.error}>{error}</p>}

        <button
          onClick={handlePurchase}
          disabled={busy}
          style={{ ...S.payBtn, ...(busy ? S.payBtnBusy : {}) }}
        >
          {busy ? 'Opening payment…' : `Unlock for ${PRICE_LABEL} — begin ${stageName}`}
        </button>

        <p style={S.fineprint}>One-time payment · lifetime access · secure checkout by Razorpay (India)</p>

        <div style={S.divider}>
          <span style={S.dividerLine} />
          <span style={S.dividerText}>or pay internationally</span>
          <span style={S.dividerLine} />
        </div>

        <div ref={paypalRef} style={S.paypalWrap} />
        <p style={S.fineprint}>International cards &amp; PayPal · billed in USD</p>

        <button onClick={() => { if (!busy) onClose?.() }} style={S.laterBtn} disabled={busy}>
          Maybe later
        </button>
      </div>
    </div>
  )
}

const S = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(40,25,15,0.55)',
    backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)',
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
  payBtnBusy: { opacity: 0.7, cursor: 'default' },
  fineprint: { fontSize: '11.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '12px 0 0' },
  laterBtn: { width: '100%', padding: '13px', marginTop: '10px', background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '13.5px', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  divider: { display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0 16px' },
  dividerLine: { flex: 1, height: '1px', background: '#E5D9C2' },
  dividerText: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', whiteSpace: 'nowrap' },
  paypalWrap: { minHeight: '52px' },
}