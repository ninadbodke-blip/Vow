// Practice archetype glyphs.
// Drawn to match the free-home "Tools" icon style exactly:
// 24x24 viewBox, fill none, stroke currentColor, weight 1.5, round caps/joins.
// Colour is inherited from the parent (Vow clay-brown #854F0B), so the icon
// stays on-palette wherever it is used and works across every stage's practice step.

const PATHS = {
  // Plant — place something real where you'll keep seeing it (upright sprout)
  plant: (
    <>
      <path d="M12 21v-8" />
      <path d="M12 13c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6z" />
      <path d="M12 12c0-2.8 2.2-5 5-5 0 2.8-2.2 5-5 5z" />
    </>
  ),
  // Say — speak a truth aloud (speaker + sound)
  say: (
    <>
      <path d="M5 9.5h2.6L11 6.5v11L7.6 14.5H5z" />
      <path d="M14.4 9.2a4 4 0 0 1 0 5.6" />
      <path d="M17 7a7 7 0 0 1 0 10" />
    </>
  ),
  // Catch — intercept something in the moment (a net)
  catch: (
    <>
      <circle cx="9.5" cy="9" r="5" />
      <path d="M9.5 4v10M4.5 9h10" />
      <path d="M13.1 12.6L20 19.5" />
    </>
  ),
  // Watch — observe one real moment (an eye)
  watch: (
    <>
      <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  // Tether — tie a realisation to something steady (two linked rings)
  tether: (
    <>
      <circle cx="9.5" cy="12" r="4.2" />
      <circle cx="14.5" cy="12" r="4.2" />
    </>
  ),
  // Document — capture a real artefact of a moment (a page)
  document: (
    <>
      <path d="M7 3.5h6l4 4V20.5H7z" />
      <path d="M13 3.5v4h4" />
      <path d="M9.8 12.5h4.4M9.8 15.5h4.4" />
    </>
  ),
  // Map — alter the route to break autopilot (a folded map)
  map: (
    <>
      <path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" />
      <path d="M9 4.5v13M15 6.5v13" />
    </>
  ),
  // Pause — put a real gap between impulse and action (pause symbol)
  pause: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 9v6M14 9v6" />
    </>
  ),
  // Shed — let one small thing fall away (a single falling leaf)
  shed: (
    <>
      <path d="M16.5 4.5c.5 7-3.5 12-9.5 13 0-7 3.5-12 9.5-13z" />
      <path d="M7 17.5c2.5-3.6 5.2-6.1 9-8" />
      <path d="M18.4 3l1.8-1.8" />
    </>
  ),

  // Cup — a warm drink, attended (mug + steam)
  cup: (
    <>
      <path d="M5 10h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
      <path d="M16 11h2.2a2.3 2.3 0 0 1 0 4.6H16" />
      <path d="M8 3.4c-.7.9.7 1.7 0 2.8M12 3.4c-.7.9.7 1.7 0 2.8" />
    </>
  ),
  // Walk — a body in motion
  walk: (
    <>
      <circle cx="13" cy="4.3" r="1.9" />
      <path d="M13 6.4v6.2" />
      <path d="M13 12.6l-3.2 6.4" />
      <path d="M13 12.6l3 5.6" />
      <path d="M13 8.6l3.6 1.7" />
      <path d="M13 8.6L9.4 10" />
    </>
  ),
  // Music — a note, for listening
  music: (
    <>
      <path d="M9 16.5V5l9-2v9" />
      <circle cx="6.6" cy="16.5" r="2.4" />
      <circle cx="15.6" cy="14.5" r="2.4" />
    </>
  ),
  // Sun — being outside, daylight
  sun: (
    <>
      <circle cx="12" cy="12" r="3.8" />
      <path d="M12 2.6v2.1M12 19.3v2.1M2.6 12h2.1M19.3 12h2.1M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5" />
    </>
  ),
  // Spark — something to look forward to
  spark: (
    <>
      <path d="M12 3l1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9z" />
    </>
  ),
  // Swap — hand one slot to something better (two arrows)
  swap: (
    <>
      <path d="M4 9h12" />
      <path d="M13 6l3 3-3 3" />
      <path d="M20 15H8" />
      <path d="M11 12l-3 3 3 3" />
    </>
  ),
  // Book — read for pleasure (an open book)
  book: (
    <>
      <path d="M12 6.5v13" />
      <path d="M12 6.5C9.5 5 6.5 5 4 6v12c2.5-1 5.5-1 8 .5" />
      <path d="M12 6.5C14.5 5 17.5 5 20 6v12c-2.5-1-5.5-1-8 .5" />
    </>
  ),
  // Check — a promise kept (a checkmark)
  check: (
    <>
      <path d="M5 13l4.5 4.5L20 6" />
    </>
  ),
}

export const PRACTICE_ARCHETYPES = Object.keys(PATHS)

export function PracticeArchetypeIcon({ archetype, size = 30 }) {
  const glyph = PATHS[archetype]
  if (!glyph) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  )
}

export default PracticeArchetypeIcon