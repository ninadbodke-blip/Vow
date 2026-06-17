// =====================================================================
// CHECK-IN REFLECTIONS — the quote that floats up after you tend the tree.
// =====================================================================
// The daily check-in captures three things:
//   heaviness  (0..1)  — how heavy the day was        [light → crushing]
//   craving    (0..1)  — how strong the pull was      [never came → intense]
//   endState   (string)— where they are tonight       [one of 8 taps]
//
// resolveMood() collapses that combination into ONE mood. The end-state is
// the anchor; heaviness + craving shade it and break ties. Each mood has a
// small pool per tier (early vs established) that rotates by day so repeat
// nights stay fresh.
//
// Voice rules (non-negotiable): plain English a tired person can read at
// 9pm, like a friend who's been there. No therapy-speak, no clichés, no
// "you've got this," nothing that could sting on a genuinely bad night.
// =====================================================================

// The 8 end-states, mapped to their "home" mood (before shading).
// Moods: settled · quietVictory · weathered · raw · steady · tender
const END_STATE_HOME = {
  proud: 'quietVictory',
  calm: 'settled',
  drained: 'weathered',
  restless: 'steady',
  frustrated: 'raw',
  heavyhearted: 'tender',
  steady: 'steady',
  hopeful: 'settled',
}

// Resolve the combination into a single mood key.
// heaviness/craving are 0..1; endState is one of the keys above.
export function resolveMood({ heaviness = 0, craving = 0, endState = 'steady' }) {
  const home = END_STATE_HOME[endState] || 'steady'

  // --- shading rules, in priority order ---

  // A strong/intense craving that was resisted and still ended well = quiet victory.
  if (craving >= 0.6 && (endState === 'proud' || endState === 'hopeful' || endState === 'calm')) {
    return 'quietVictory'
  }

  // A heavy day that was carried through (drained / steady / restless) = weathered.
  if (heaviness >= 0.65 && (endState === 'drained' || endState === 'steady' || endState === 'restless' || endState === 'still_here')) {
    return 'weathered'
  }

  // Frustrated or heavy-hearted on a heavy day = raw (the most careful pool).
  if (heaviness >= 0.6 && (endState === 'frustrated' || endState === 'heavyhearted')) {
    return 'raw'
  }

  // A genuinely light, quiet day that ended calm/at-peace, low pull = settled.
  if (heaviness <= 0.3 && craving <= 0.3 && (endState === 'calm' || endState === 'proud' || endState === 'hopeful')) {
    return 'settled'
  }

  // Low-energy, soft day (drained/heavy-hearted) without a hard craving = tender.
  if (craving <= 0.4 && (endState === 'drained' || endState === 'heavyhearted')) {
    return 'tender'
  }

  return home
}

// Pick which tier: 'early' for the opening stages + reclaim, 'established' later.
export function tierForStage(stage) {
  if (stage === 'endure' || stage === 'build') return 'established'
  return 'early'  // notice, reflect, commit, reclaim
}

// Deterministic daily rotation within a pool (stable per day, varies day to day).
function pickByDay(pool) {
  if (!pool || pool.length === 0) return ''
  const now = new Date()
  const dayIndex = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000
  )
  return pool[dayIndex % pool.length]
}

// Public: get the reflection line for a check-in.
export function reflectionFor({ heaviness, craving, endState, stage }) {
  const mood = resolveMood({ heaviness, craving, endState })
  const tier = tierForStage(stage)
  const pool = (REFLECTIONS[mood] && REFLECTIONS[mood][tier]) || REFLECTIONS.steady[tier]
  return { mood, line: pickByDay(pool) }
}

// =====================================================================
// THE BANK — 6 moods × 2 tiers × a small pool each.
// =====================================================================
export const REFLECTIONS = {

  // ---- SETTLED — an easy, quiet day; low pull; at ease ----
  settled: {
    early: [
      'A quiet day is not a small thing. It is the ground everything else grows from.',
      'Days like this are easy to overlook. Don\u2019t. This is what getting better feels like.',
      'Nothing dramatic happened today, and that is its own kind of good.',
      'You had a calm day. Let yourself simply have it, without waiting for the catch.',
    ],
    established: [
      'This calm used to be rare. Notice how much more often it visits now.',
      'You\u2019ve built a life where a quiet evening is normal. That took real work.',
      'Peace like this isn\u2019t luck anymore. It\u2019s the shape of what you\u2019ve made.',
      'An ordinary, easy day. You earned the right to find these unremarkable.',
    ],
  },

  // ---- QUIET VICTORY — felt the pull, didn't act ----
  quietVictory: {
    early: [
      'It asked, and you said no. That is not a small thing \u2014 that is the whole thing.',
      'The urge came and left without you. Remember tonight that it can.',
      'Wanting it and doing it are two different things. Today you kept them apart.',
      'You felt all of that and still didn\u2019t move. That is strength, even if it didn\u2019t feel like it.',
    ],
    established: [
      'You\u2019ve gotten good at this \u2014 feeling it fully, and letting it pass anyway.',
      'Every time you don\u2019t act, the pull loses a little of its old authority.',
      'This is what strong looks like for you now: quiet, steady, and nobody clapping.',
      'The craving showed up out of habit. You answered out of who you\u2019ve become.',
    ],
  },

  // ---- WEATHERED — heavy day, high pull, carried it through ----
  weathered: {
    early: [
      'You didn\u2019t have to do it well. You only had to get through it. And you did.',
      'The hardest days count double. This was one of them, and you\u2019re still standing.',
      'You\u2019re still here. On a day like today, that is the entire victory.',
      'Heavy days don\u2019t mean you\u2019re failing. They mean you\u2019re doing something hard.',
    ],
    established: [
      'You\u2019ve carried heavier than this and kept walking. Tonight was proof again.',
      'Storms don\u2019t undo the ground you\u2019ve built. They test it. It held.',
      'You know this weight now \u2014 and you know it lifts. That knowing was hard-won.',
      'A day like this once might have ended differently. Look how you met it instead.',
    ],
  },

  // ---- RAW — heavy + frustrated/down; the most careful pool ----
  // These must validate, never fix. No silver linings, no "tomorrow's better."
  raw: {
    early: [
      'Today was hard, and you don\u2019t have to dress it up as anything else.',
      'Some days just take everything. You don\u2019t owe anyone a brave face tonight.',
      'You\u2019re allowed to have a bad day inside a good decision. Both are true.',
      'It was a rough one. You showed up here anyway, and that counts for something.',
    ],
    established: [
      'Even now, some days are just heavy. That\u2019s not a step backward \u2014 it\u2019s being human.',
      'You\u2019ve come far enough to know: a hard night isn\u2019t the whole story.',
      'Frustration doesn\u2019t erase your progress. It just means today asked a lot of you.',
      'Be as kind to yourself tonight as you\u2019d be to someone you love having this exact day.',
    ],
  },

  // ---- STEADY — ordinary, unremarkable, holding ----
  steady: {
    early: [
      'You showed up. On the ordinary days, that is the entire practice.',
      'Not every day has to mean something. Some just have to be gotten through, simply.',
      'Steady is underrated. Steady is how this actually gets done.',
      'A plain day, met plainly. That\u2019s a good day, even if it doesn\u2019t feel like one.',
    ],
    established: [
      'Quietly, day after day, you keep choosing this. That repetition is the whole thing.',
      'Nothing remarkable about today \u2014 except that you\u2019re still here doing it.',
      'The unglamorous days are the ones that built everything you have now.',
      'Steady isn\u2019t boring. Steady is what freedom looks like once the noise dies down.',
    ],
  },

  // ---- TENDER — low, soft, spent; gentle and rest-focused ----
  tender: {
    early: [
      'You sound tired. That\u2019s allowed. Rest is part of the work, not a break from it.',
      'Be gentle with yourself tonight. You\u2019ve been carrying more than you let on.',
      'Soft days need soft treatment. Let tonight be only about resting.',
      'You don\u2019t have to be strong every hour. Right now, just be kind to yourself.',
    ],
    established: [
      'Even this far in, some nights you just need rest. Let yourself have it.',
      'You\u2019ve earned the right to a gentle evening. Take it without guilt.',
      'Tiredness isn\u2019t weakness. It\u2019s what carrying something real feels like. Rest now.',
      'Be tender with yourself tonight. Tomorrow doesn\u2019t need anything from you yet.',
    ],
  },
}