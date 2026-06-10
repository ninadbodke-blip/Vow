// ===================================================================
// GLYPHS — the home's shared ink-line icon set.
// ===================================================================
// All 24×24, stroke-only, currentColor, so they inherit the clay/ink
// tone of whatever circle they sit in.
// ===================================================================

const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

// Urge — waves stacked, the thing that rises and passes.
export const UrgeWavesGlyph = () => (
  <svg {...base}>
    <path d="M3 7c1.5-2.4 3-2.4 4.5 0s3 2.4 4.5 0 3-2.4 4.5 0 3 2.4 4.5 0" />
    <path d="M3 12.5c1.5-2.4 3-2.4 4.5 0s3 2.4 4.5 0 3-2.4 4.5 0 3 2.4 4.5 0" />
    <path d="M3 18c1.5-2.4 3-2.4 4.5 0s3 2.4 4.5 0 3-2.4 4.5 0 3 2.4 4.5 0" />
  </svg>
)

// Slip — the line dips, then climbs back out.
export const SlipRiseGlyph = () => (
  <svg {...base}>
    <path d="M3 8c3.5 0 4 9 8 9s5.5-6.5 9-10" />
    <path d="M16.5 6.5L20 7l-.5 3.5" />
  </svg>
)

// The hard hour — the evening arc with the hour marked on it.
export const HardHourGlyph = () => (
  <svg {...base}>
    <path d="M4 17Q12 4 20 17" />
    <circle cx="4" cy="17" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="20" cy="17" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="14.6" cy="11.2" r="2.8" fill="currentColor" stroke="none" />
  </svg>
)

// Instead, I… — the path forks; you took the other branch.
export const InsteadGlyph = () => (
  <svg {...base}>
    <path d="M12 20v-8" />
    <path d="M12 12C12 9 9.5 8.2 7 5.5" />
    <path d="M12 12c0-3 2.5-3.8 5-6.5" />
    <circle cx="7" cy="5.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="17" cy="5.5" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)

// In your words — a quill.
export const WordsGlyph = () => (
  <svg {...base}>
    <path d="M19.5 4.5C13 5.5 8 10 6 18.5" />
    <path d="M6 18.5C12.5 17 17.5 12 19.5 4.5" />
    <path d="M6 18.5L4 20.5" />
    <path d="M9 14c2.5-1.5 5.5-4 7.5-6.5" />
  </svg>
)

// Anchors — the people you're doing this for.
export const AnchorGlyph = () => (
  <svg {...base}>
    <circle cx="12" cy="5" r="2.2" />
    <path d="M12 7.2V20" />
    <path d="M5.5 13a6.5 6.5 0 0 0 13 0" />
    <path d="M3.5 13H7M17 13h3.5" />
  </svg>
)

// Milestones — the flag of what you've kept.
export const MilestoneGlyph = () => (
  <svg {...base}>
    <path d="M6.5 21V4" />
    <path d="M6.5 5h10l-2.7 3.5L16.5 12h-10" />
  </svg>
)