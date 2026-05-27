import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

// =====================================================================
// VOW PAGE TRANSITION — "The Breath"
// A slow, heavy fade with a slight upward drift and a blur-to-clear focus
// pull. Wraps the routed screen so every navigation crossfades.
//
// IMPORTANT (containing-block correctness):
// A lingering `transform` or a NON-none `filter` on an ancestor creates a
// containing block that breaks `position: fixed` for everything inside it —
// the BottomNav, fixed CTAs, etc. The subtle trap: the resting state of the
// "animate" variant used to be `filter: blur(0px)`, and blur(0px) is STILL a
// filter function (not `none`), so it kept the containing block alive — and
// Framer Motion re-commits it on every re-render, which the homes do often.
//
// Fix: once the enter settles we (a) flip the resting filter to `none`
// (blur(0px) -> none is visually identical, no flicker) so the target no
// longer carries a filter, and (b) strip any residual inline transform/filter.
// During the transition itself the screen still drifts and blurs as one piece.
//
// Floating sheets/modals additionally render through <SheetPortal> (portaled
// to document.body), so they are immune to this regardless.
// =====================================================================

// Flip to false if low-end Android devices stutter on the blur.
const USE_BLUR = true

export default function PageTransition({ children }) {
  const ref = useRef(null)
  const [settled, setSettled] = useState(false)

  const initial = { opacity: 0, y: 12, ...(USE_BLUR && { filter: 'blur(4px)' }) }
  const animate = settled
    ? { opacity: 1, y: 0, ...(USE_BLUR && { filter: 'none' }) }
    : { opacity: 1, y: 0, ...(USE_BLUR && { filter: 'blur(0px)' }) }
  const exit = { opacity: 0, y: -12, ...(USE_BLUR && { filter: 'blur(4px)' }) }

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      onAnimationComplete={() => {
        if (ref.current) {
          ref.current.style.transform = 'none'
          ref.current.style.filter = 'none'
        }
        setSettled(true)
      }}
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </motion.div>
  )
}