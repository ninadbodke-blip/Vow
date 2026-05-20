import { useState, useEffect } from 'react'

// =====================================================================
// usePersistedStep
// =====================================================================
// Like useState, but persists the value (a string) in sessionStorage.
// Survives tab-switches, browser-reloads, and mobile background-suspension.
// Optional `skipPersist` array: when the current value is in this list,
// the sessionStorage entry is removed (use for terminal/post-save steps
// like 'closing' so they don't replay on the next visit).
//
// Usage:
//   const [step, setStep] = usePersistedStep(
//     `vow_step_reclaim_${dayNumber}`,
//     STEP.ARRIVAL,
//     { skipPersist: [STEP.CLOSING] }
//   )
// =====================================================================

export default function usePersistedStep(key, initialValue, options = {}) {
  const { skipPersist = [] } = options

  const [value, setValue] = useState(() => {
    try {
      const saved = sessionStorage.getItem(key)
      return saved !== null ? saved : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      if (skipPersist.includes(value)) {
        sessionStorage.removeItem(key)
      } else {
        sessionStorage.setItem(key, value)
      }
    } catch {}
    // skipPersist intentionally omitted from deps; it's a static list per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value])

  return [value, setValue]
}