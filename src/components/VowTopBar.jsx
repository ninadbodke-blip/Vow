import VowBrandMark from './VowBrandMark'

// =====================================================================
// VowTopBar — the living flame + "Vow" wordmark, fixed at the top of
// every /app screen. Pointer-events pass straight through, so it never
// blocks the controls beneath; a soft cream fade keeps it readable as
// content scrolls under it.
// =====================================================================
export default function VowTopBar() {
  return (
    <div style={styles.bar}>
      <VowBrandMark size={18} />
    </div>
  )
}

const styles = {
  bar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 90,
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
    paddingBottom: '6px',
    pointerEvents: 'none',
    background: 'linear-gradient(180deg, rgba(242,237,227,0.95) 0%, rgba(242,237,227,0.75) 60%, rgba(242,237,227,0) 100%)',
  },
}