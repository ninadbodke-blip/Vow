import { useRef } from 'react'
import { motion } from 'framer-motion'

// =====================================================================
// VOW PAGE TRANSITION — "The Breath"
// A slow, heavy fade with a slight upward drift and a blur-to-clear focus
// pull. Wraps the routed screen so every navigation crossfades.
//
// IMPORTANT (why this isn't just a plain motion.div):
// A lingering `transform` or `filter` on an ancestor creates a containing
// block that breaks `position: fixed` for everything inside it — and Vow's
// BottomNav, modals, and several fixed CTAs live inside the routed tree.
// Framer Motion leaves both properties on the element after animating, so
// once the ENTER settles we strip them back to `none`. Visually identical
// (translateY(0) == none, blur(0px) == none), but the containing block is
// gone, so fixed elements behave correctly at rest. During the transition
// itself the whole screen — nav included — drifts and blurs as one piece,
// which is the intended effect.
// =====================================================================

// Flip to false if low-end Android devices stutter on the blur. Animating
// `filter` runs off the compositor fast-path; opacity + drift alone still
// reads as "the breath" and is cheap everywhere.
const USE_BLUR = true

const variants = {
  initial: { opacity: 0, y: 12, ...(USE_BLUR && { filter: 'blur(4px)' }) },
  animate: { opacity: 1, y: 0, ...(USE_BLUR && { filter: 'blur(0px)' }) },
  exit: { opacity: 0, y: -12, ...(USE_BLUR && { filter: 'blur(4px)' }) },
}

export default function PageTransition({ children }) {
  const ref = useRef(null)

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      onAnimationComplete={() => {
        // Strip the resting transform/filter so they don't leave a
        // containing block that detaches position:fixed children.
        // Framer Motion re-applies both on the next (exit) animation.
        if (ref.current) {
          ref.current.style.transform = 'none'
          ref.current.style.filter = 'none'
        }
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