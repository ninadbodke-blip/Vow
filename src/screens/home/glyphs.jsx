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

// ===== Practice glyphs for the five migrated modes =====

// Your autopilot — the loop that runs itself.
export const AutopilotGlyph = () => (
  <svg {...base}>
    <path d="M19 12a7 7 0 1 1-2.05-4.95" />
    <path d="M17.5 3.5v4h-4" />
  </svg>
)

// What it gives, what it takes — two directions of the same ledger.
export const LedgerGlyph = () => (
  <svg {...base}>
    <path d="M7 14V5M7 5l-2.6 2.6M7 5l2.6 2.6" />
    <path d="M17 10v9M17 19l-2.6-2.6M17 19l2.6-2.6" />
  </svg>
)

// The scales — both ends honest.
export const ScalesGlyph = () => (
  <svg {...base}>
    <path d="M12 4v16M8.5 20h7" />
    <path d="M4 7h16" />
    <path d="M6.5 7l-2.3 4.5h4.6L6.5 7zM4.2 11.5a2.3 2.3 0 0 0 4.6 0" />
    <path d="M17.5 7l-2.3 4.5h4.6L17.5 7zM15.2 11.5a2.3 2.3 0 0 0 4.6 0" />
  </svg>
)

// What it costs — the hours running out.
export const CostGlyph = () => (
  <svg {...base}>
    <path d="M7 3.5h10M7 20.5h10" />
    <path d="M8 3.5c0 4 3 5.5 4 8.5 1-3 4-4.5 4-8.5M8 20.5c0-4 3-5.5 4-8.5 1 3 4 4.5 4 8.5" />
  </svg>
)

// Your vow & your day — the sun coming up on it.
export const VowDayGlyph = () => (
  <svg {...base}>
    <path d="M4 17h16" />
    <path d="M7.5 17a4.5 4.5 0 0 1 9 0" />
    <path d="M12 8.5V6M6.8 10.8l-1.6-1.6M17.2 10.8l1.6-1.6" />
  </svg>
)

// Clear the path — the way through, opened.
export const PathGlyph = () => (
  <svg {...base}>
    <path d="M6 20c6-2 0-6 5-8.5S17 6 17 4" />
    <path d="M14.5 4H17v2.5" />
  </svg>
)

// Pressure points — the gauge of the week.
export const GaugeGlyph = () => (
  <svg {...base}>
    <path d="M4.5 16.5a7.5 7.5 0 0 1 15 0" />
    <path d="M12 16.5l3.6-4.4" />
    <path d="M5.5 16.5h-1M19.5 16.5h-1M12 8.5v-1" />
  </svg>
)

// The blind spot — looking, with one thing just outside the look.
export const BlindspotGlyph = () => (
  <svg {...base}>
    <path d="M3.5 12.5s3-4.5 7.5-4.5 7.5 4.5 7.5 4.5-3 4.5-7.5 4.5-7.5-4.5-7.5-4.5z" />
    <circle cx="11" cy="12.5" r="1.9" />
    <circle cx="19.8" cy="5.4" r="1.1" />
  </svg>
)

// What still stands — the pillar that held.
export const StandsGlyph = () => (
  <svg {...base}>
    <path d="M5 20h14" />
    <path d="M7 5h10" />
    <path d="M9 5v15M15 5v15" />
    <path d="M6 5l1-1.5h10L18 5" />
  </svg>
)

// The kinder voice — the gentler thing, said.
export const KinderGlyph = () => (
  <svg {...base}>
    <path d="M20 11.5a8 7 0 0 1-8 7c-1 0-2-.15-2.9-.45L4.5 19.5l1.2-3.4A7 7 0 0 1 4 11.5a8 7 0 0 1 16 0z" />
    <path d="M12 14.2s-2.6-1.5-2.6-3.1c0-.9.7-1.6 1.5-1.6.5 0 .9.25 1.1.65.2-.4.6-.65 1.1-.65.8 0 1.5.7 1.5 1.6 0 1.6-2.6 3.1-2.6 3.1z" />
  </svg>
)

// ===== Daily + tool-three glyphs =====

// One steady minute — the breath, ringed.
export const BreathGlyph = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="3.6" />
  </svg>
)

// Where it happens — the pattern's address.
export const PinGlyph = () => (
  <svg {...base}>
    <path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" />
    <circle cx="12" cy="10.3" r="2.3" />
  </svg>
)

// The excuses — the lines it speaks.
export const ExcuseGlyph = () => (
  <svg {...base}>
    <path d="M20 11.5a8 7 0 0 1-8 7c-1 0-2-.15-2.9-.45L4.5 19.5l1.2-3.4A7 7 0 0 1 4 11.5a8 7 0 0 1 16 0z" />
    <path d="M8.6 9.6q1.4.4 1.4 1.7t-1.4 1.7M13.6 9.6q1.4.4 1.4 1.7t-1.4 1.7" />
  </svg>
)

// How ready, honestly — the dial of it.
export const ReadyGlyph = () => (
  <svg {...base}>
    <path d="M5 16.5a7.5 7.5 0 0 1 14.4-2.9" />
    <path d="M12 16.5l4.6-3.1" />
    <path d="M19.4 16.5h-1M5.6 16.5h-1" />
  </svg>
)

// Renew your vow — the small flame, kept lit.
export const RenewGlyph = () => (
  <svg {...base}>
    <path d="M12 3.5q4.5 5 4.5 10a4.5 5.5 0 0 1-9 0q0-5 4.5-10z" />
    <path d="M12 11q1.9 2.4 1.9 4.2a1.9 2.4 0 0 1-3.8 0Q10.1 13.4 12 11z" />
  </svg>
)

// The week's proof — entered into evidence.
export const ProofGlyph = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.3 12.4l2.5 2.6 4.9-5.4" />
  </svg>
)

// What it was reaching for — the open reach.
export const ReachGlyph = () => (
  <svg {...base}>
    <path d="M5 18.5q7-1.5 14 0" />
    <path d="M12 15V6.5" />
    <path d="M8.6 9.4 12 6l3.4 3.4" />
  </svg>
)