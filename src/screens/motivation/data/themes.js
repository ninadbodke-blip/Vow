/**
 * Motivation themes — "tonight's weather."
 * Four moods an evening can take; each maps to the essays written
 * for it. Slugs not listed anywhere are still reachable under All.
 */

export const THEMES = [
  { key: 'nostalgia', label: 'Nostalgia' },
  { key: 'exhaustion', label: 'Exhaustion' },
  { key: 'vacuum', label: 'The Vacuum' },
  { key: 'justone', label: '"Just one"' },
]

export const THEME_MAP = {
  nostalgia: [
    'the-room-you-were-trying-to-leave',
    'what-it-was-doing-for-you',
    'the-same-evening-two-thousand-times',
    'the-myth-of-the-creative-spark',
    'the-people-who-knew-you-before',
  ],
  exhaustion: [
    'the-person-you-are-at-3-am',
    'the-20-minute-wave-anatomy',
    'the-dopamine-debt-collection',
    'what-the-craving-knows-about-clocks',
    'the-four-hungers-of-a-bad-evening',
  ],
  vacuum: [
    'the-8-pm-vacuum',
    'the-evacuation-protocol',
    'after-the-peaks',
    'why-sobriety-is-lonelier-than-use',
    'boredom-is-not-the-enemy',
    'the-room-you-recover-in',
  ],
  justone: [
    'the-math-of-just-one-time',
    'the-permission-slip',
    'waiting-for-rock-bottom-is-a-trap',
    'the-high-functioning-paradox',
    'the-myth-of-the-right-time',
    'the-apology-you-owe-yourself',
    'you-cannot-think-your-way-out',
  ],
}