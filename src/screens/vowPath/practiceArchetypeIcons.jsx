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
  // Anchor — tie a realisation to something steady (an anchor)
  anchor: (
    <>
      <circle cx="12" cy="4.5" r="2" />
      <path d="M12 6.5V21" />
      <path d="M7.5 10.5h9" />
      <path d="M4.5 13.5a7.5 7.5 0 0 0 15 0" />
      <path d="M4.5 13.5l-1.9.4M19.5 13.5l1.9.4" />
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