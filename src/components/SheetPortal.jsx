import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// =====================================================================
// SHEET PORTAL
// =====================================================================
// Renders an overlay (backdrop + card) into document.body via a portal.
//
// WHY: every routed screen is wrapped in PageTransition's framer-motion
// element, which carries a transient transform/filter. An ancestor with a
// transform OR a non-none filter becomes the containing block for its
// position:fixed descendants — silently turning "fixed-to-viewport" into
// "absolute-to-that-ancestor", so a sheet lands somewhere in the (tall,
// possibly scrolled) page instead of in front of the user.
//
// Portaling to document.body lifts the overlay OUT of that wrapper entirely,
// so its position:fixed always resolves against the viewport. We also lock
// background scroll while the sheet is mounted, so it can never sit at a
// scrolled offset. Mount this only while the sheet is open (it is always
// rendered conditionally), so the scroll lock tracks open/closed for free.
// =====================================================================

export default function SheetPortal({ children }) {
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])

  if (typeof document === 'undefined') return null
  return createPortal(children, document.body)
}