// =====================================================================
// CHECK-IN REFLECTIONS — the quote that floats up after you tend the tree.
// =====================================================================
// The daily check-in captures three things:
//   heaviness  (0..1)  — how heavy the day was        [light -> crushing]
//   craving    (0..1)  — how strong the pull was      [never came -> intense]
//   endState   (string)— where they are tonight       [one of 8 taps]
//
// resolveMood() collapses that combination into ONE mood. The end-state is
// the anchor; heaviness + craving shade it and break ties. Each mood has a
// deep pool per tier (early vs established) that rotates by day so repeat
// nights stay fresh for weeks.
//
// Voice: plain English a tired person can read at 9pm, like a friend who's
// been there. Wide palette — blunt, poetic, aphoristic, warm, wisdom-
// flavored — but never therapy-speak, never cliche, and nothing that could
// sting on a genuinely bad night (see the RAW pool especially).
//
// All lines are original to Vow. No attributed/translated quotes (avoids
// copyright + misattribution; keeps one consistent voice).
// =====================================================================

// The 8 end-states, mapped to their "home" mood (before shading).
// Moods: settled - quietVictory - weathered - raw - steady - tender
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

  // A strong craving that was resisted and still ended well = quiet victory.
  if (craving >= 0.6 && (endState === 'proud' || endState === 'hopeful' || endState === 'calm')) {
    return 'quietVictory'
  }

  // A heavy day carried through (drained / steady / restless) = weathered.
  if (heaviness >= 0.65 && (endState === 'drained' || endState === 'steady' || endState === 'restless')) {
    return 'weathered'
  }

  // Frustrated or heavy-hearted on a heavy day = raw (the most careful pool).
  if (heaviness >= 0.6 && (endState === 'frustrated' || endState === 'heavyhearted')) {
    return 'raw'
  }

  // A genuinely light, quiet day, low pull, ended calm/proud/hopeful = settled.
  if (heaviness <= 0.3 && craving <= 0.3 && (endState === 'calm' || endState === 'proud' || endState === 'hopeful')) {
    return 'settled'
  }

  // Low-energy, soft day (drained / heavy-hearted) without a hard craving = tender.
  if (craving <= 0.4 && (endState === 'drained' || endState === 'heavyhearted')) {
    return 'tender'
  }

  return home
}

// Pick the tier: 'early' for the opening stages + reclaim, 'established' later.
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
// THE BANK — 6 moods x 2 tiers x 17 lines each = 204.
// =====================================================================
export const REFLECTIONS = {

  // ---- SETTLED — an easy, quiet day; low pull; at ease ----
  settled: {
    early: [
      "A quiet day is not a small thing. It's the ground everything else grows from.",
      "Nothing happened today. That's the good news.",
      "Calm isn't boring. Calm is what you were missing.",
      "Some days just let you breathe. Let this be one.",
      "You didn't have to fight anything today. Rest in that.",
      "Peace arrived quietly, the way it usually does.",
      "An ordinary evening. Once, you'd have traded a lot for one of these.",
      "Today asked nothing hard of you. Take the gift.",
      "Still water is still an achievement.",
      "You're allowed to enjoy an easy day without bracing for the next one.",
      "Quiet isn't the absence of life. It's the start of one.",
      "Nothing to report, and everything to be glad about.",
      "The day was soft. Be soft with it.",
      "This is what you were reaching for all along. Just this.",
      "No storms today. Sit in the sun a while.",
      "An easy day is your body's way of saying thank you.",
      "The day was kind to you. Let yourself notice it.",
    ],
    established: [
      "This calm used to be rare. Notice how often it visits now.",
      "You built a life where a quiet evening is ordinary. That was the work.",
      "Peace isn't luck anymore. It's the shape of what you've made.",
      "You once couldn't picture a night this easy. Here it is.",
      "The ground feels steady because you made it so.",
      "You stopped bracing for the fall. It's been holding for a while now.",
      "Calm became your normal. Don't rush past that.",
      "There's nothing to manage tonight — and that's not luck, it's progress.",
      "This is what the far side looks like: unremarkable, and yours.",
      "The storms got rarer because you got stronger.",
      "You don't have to earn an easy night anymore. You already did.",
      "A still evening, and you're no longer suspicious of it. That's growth.",
      "The life you wanted turned out to be made of quiet days like this.",
      "Look how normal peace has become for you.",
      "You grew this quiet. Stand in it.",
      "Ordinary is the reward. You're living in it.",
      "You used to chase peace. Now it just lives here, with you.",
    ],
  },

  // ---- QUIET VICTORY — felt the pull, didn't act ----
  quietVictory: {
    early: [
      "It asked, and you said no. That's not small — that's the whole thing.",
      "The urge came and left without you. It can. Remember that.",
      "Wanting it and doing it are two different things. Today you kept them apart.",
      "You felt all of that and didn't move. That's strength, even if it didn't feel like it.",
      "The craving lost today — quietly, with nobody watching.",
      "You don't have to win loudly. You just have to win. You did.",
      "An urge is a wave. Today you let it break and didn't go under.",
      "No one saw the hardest thing you did today. You know what it was.",
      "You proved it again: the pull isn't in charge. You are.",
      "Saying no once makes the next no easier. You just made it easier.",
      "The want was loud. Your no was louder.",
      "You sat with something hard and didn't run. That's the skill, right there.",
      "It wanted you back. You stayed yourself.",
      "Today you were stronger than a very old habit. Don't shrug that off.",
      "The urge passed, the way they all do. You waited it out. That's the win.",
      "You met the pull and kept your word to yourself.",
      "You wanted it, and chose yourself instead. That's the whole game.",
    ],
    established: [
      "You've gotten good at this — feeling it fully, and letting it pass anyway.",
      "Every time you don't act, the pull loses a little of its old authority.",
      "This is what strong looks like for you now: quiet, steady, and nobody clapping.",
      "The craving showed up out of habit. You answered out of who you've become.",
      "You barely had to fight it. That ease was years in the making.",
      "The urge is smaller now because you stopped feeding it. Today proved it.",
      "Old hunger, met by a newer, steadier you.",
      "The pull still visits. It just doesn't run you anymore.",
      "You've taught yourself something most people never learn: how to want, and not take.",
      "It used to win. Tonight it didn't come close.",
      "You know the shape of this urge by now — and you know you outlast it.",
      "Another no, added to the thousands. This is how a life turns.",
      "The craving is a guest now, not a master. You showed it the door.",
      "You felt it, named it, and let it go. That's practice, not luck.",
      "Resisting got quieter because you got stronger. That's the whole arc.",
      "The pull knocked. You didn't even get up.",
      "The pull is just a habit now, and you've outgrown it. Tonight showed that.",
    ],
  },

  // ---- WEATHERED — heavy day, high pull, carried it through ----
  weathered: {
    early: [
      "You didn't have to do it well. You only had to get through it. And you did.",
      "The hardest days count double. This was one of them, and you're still standing.",
      "You're still here. On a day like today, that's the entire victory.",
      "Heavy days don't mean you're failing. They mean you're doing something hard.",
      "You carried it. That's all today asked, and you did it.",
      "Getting through is enough. You don't owe today anything more than that.",
      "Some days you don't win — you survive them. Today you survived. That counts.",
      "The weight was real. So was your refusal to put it down the wrong way.",
      "You made it to the end of a hard day without giving in. Sit with that.",
      "Nobody gets a light load every day. You shouldered a heavy one and kept walking.",
      "Today tried to take more than you had. You held on anyway.",
      "A hard day survived is a hard day won. Don't let anyone tell you different.",
      "You bent under it and didn't break. That's not weakness — that's the point.",
      "The day was heavy and you're still here to call it heavy. That's something.",
      "You don't have to feel strong to have been strong. Today you were.",
      "It was a long, hard climb. Look — you're at the top of today.",
      "You walked through fire today and came out the other side. That's enough.",
    ],
    established: [
      "You've carried heavier than this and kept walking. Tonight was proof again.",
      "Storms don't undo the ground you've built. They test it. It held.",
      "You know this weight now — and you know it lifts. That knowing was hard-won.",
      "A day like this once might have ended differently. Look how you met it instead.",
      "You've survived every hard day so far. Your record is perfect.",
      "The heavy days come less often now, and you weather them better. Both are true.",
      "You've done hard before. Tonight your body remembered how.",
      "This would have flattened an earlier you. It didn't flatten this one.",
      "Years of practice met today's weight. The practice won.",
      "You carried it the way you've learned to — steady, without trading yourself away.",
      "The storm came. You'd built for it. That's why you're still standing.",
      "You don't fear these days the way you used to. You know how they end.",
      "Heavy is just heavy now. It's not dangerous anymore. Look how far that is.",
      "You held the line on a day that tested it hard. That line is yours.",
      "The weight was familiar, and so was your strength. You came through.",
      "A hard day, met by someone who's met many. You're not new to this anymore.",
      "You've weathered worse and built more. Today was just one more storm passed.",
    ],
  },

  // ---- RAW — heavy + frustrated/down; the most careful pool ----
  // Validate, never fix. No silver linings, no "tomorrow's better."
  raw: {
    early: [
      "Today was hard, and you don't have to dress it up as anything else.",
      "Some days just take everything. You don't owe anyone a brave face tonight.",
      "You're allowed to have a bad day inside a good decision. Both are true.",
      "It was a rough one. You showed up here anyway, and that counts for something.",
      "You don't have to find the lesson tonight. You just have to get to sleep.",
      "Hard is hard. You don't need to explain it or fix it right now.",
      "Today hurt. Let it have been hard without making it mean something about you.",
      "You're not doing it wrong because today was awful. Some days are just awful.",
      "Be as gentle with yourself tonight as the day was rough.",
      "You made it to the end of a bad day. That's the only thing it asked of you.",
      "Frustration is allowed. You're human, doing a hard thing, on a hard day.",
      "You don't have to feel okay. You just have to make it to tomorrow. You're almost there.",
      "A bad day is weather, not a verdict. It passes. You stay.",
      "It's okay that this was heavy. It was. You're still here telling me so.",
      "Nothing about tonight needs solving. Just be kind to yourself and rest.",
      "You held on through a day that gave you every reason not to. That's not nothing.",
      "Today was unkind. You don't have to be unkind to yourself on top of it.",
    ],
    established: [
      "Even now, some days are just heavy. That's not a step backward — it's being human.",
      "You've come far enough to know: a hard night isn't the whole story.",
      "Frustration doesn't erase your progress. It means today asked a lot of you.",
      "Be as kind to yourself tonight as you'd be to someone you love having this exact day.",
      "You've had bad days before and stayed the course. This is just another one.",
      "Progress doesn't mean the hard days stop. It means they don't run you anymore.",
      "A rough night, this far in, is still just a rough night. You know it passes.",
      "You don't have to be grateful tonight. You just have to be gentle.",
      "Even the strong stretches have hard days. This is one. It doesn't undo the rest.",
      "You've earned the right to have an awful day without it scaring you.",
      "The difference now: you know a bad day is a bad day, not the beginning of the end.",
      "Tonight is heavy. Tomorrow doesn't have to be. You've seen that enough to trust it.",
      "You're allowed to be tired and frustrated and still be doing beautifully.",
      "Hard days don't take anything from what you've built. They just ask you to rest.",
      "You've survived worse than this and kept going. Tonight just needs you to be kind.",
      "Don't measure yourself by today. Measure yourself by the fact you're still here.",
      "A hard night doesn't move you backward. It just asks you to rest, and you can.",
    ],
  },

  // ---- STEADY — ordinary, unremarkable, holding ----
  steady: {
    early: [
      "You showed up. On the ordinary days, that's the entire practice.",
      "Not every day has to mean something. Some just have to be gotten through.",
      "Steady is underrated. Steady is how this actually gets done.",
      "A plain day, met plainly. That's a good day, even if it doesn't feel like one.",
      "Nothing to write home about, and that's perfectly fine.",
      "You kept the promise today. Quietly, like most days. That's the work.",
      "Ordinary days are the bricks. You laid another one.",
      "No drama, no disaster. Just you, doing it again.",
      "Showing up when it's boring is the hardest skill there is. You did it.",
      "The middle days matter most, and nobody talks about them. This was one.",
      "You don't need a reason to be proud of a regular day done right.",
      "Steady isn't flashy. Steady is what works.",
      "An unremarkable day, remarkably, done. That adds up.",
      "You did the plain, quiet thing again. That's the whole secret.",
      "Today wasn't a battle. It was just a day. You handled it.",
      "One more ordinary day in the right direction. They're the ones that count.",
      "You did the quiet, unremarkable right thing. Again. That's how it's done.",
    ],
    established: [
      "Quietly, day after day, you keep choosing this. That repetition is the whole thing.",
      "Nothing remarkable about today — except that you're still here doing it.",
      "The unglamorous days built everything you have now.",
      "Steady isn't boring. Steady is what freedom looks like once the noise dies down.",
      "You've made this so routine it barely registers. That's mastery.",
      "The ordinary days stopped being hard. You just live them now.",
      "Another plain day, kept. This is what a changed life actually feels like.",
      "You don't celebrate these anymore. You just live them. That's the win.",
      "Day after quiet day — that's not nothing. That's everything, stacked up.",
      "The consistency you have now, you forged out of much harder days.",
      "This is what you were building toward: days so steady they're forgettable.",
      "You've turned the hard thing into a habit. Few people ever do.",
      "Routine used to scare you. Now it holds you. That's a long way traveled.",
      "A regular day, lived clean, without thinking hard about it. That's arrival.",
      "The quiet streak of ordinary days is the real monument. You're still building it.",
      "You made steadiness look easy. It wasn't. You just got good at it.",
      "The ordinary days are yours now, clean and uneventful. That's the whole prize.",
    ],
  },

  // ---- TENDER — low, soft, spent; gentle and rest-focused ----
  tender: {
    early: [
      "You sound tired. That's allowed. Rest is part of the work, not a break from it.",
      "Be gentle with yourself tonight. You've been carrying more than you let on.",
      "Soft days need soft treatment. Let tonight be only about resting.",
      "You don't have to be strong every hour. Right now, just be kind to yourself.",
      "Tired is not a failing. It's what doing hard things feels like. Rest now.",
      "Put it down for the night. It'll keep. You need the rest more.",
      "You've done enough today. Truly. Let yourself stop.",
      "Tonight, ask nothing of yourself but rest.",
      "A weary day deserves a soft landing. Give yourself one.",
      "You're allowed to be low without anything being wrong. Just be gentle.",
      "Rest isn't quitting. It's how you make it to tomorrow.",
      "Let tonight be small and quiet. You don't have to carry anything else.",
      "Some days you just need to be held a little. Hold yourself.",
      "You're spent, and that's okay. Spent means you gave it what you had.",
      "Be soft with yourself. The day already wasn't.",
      "There's nothing to do tonight but rest. So rest.",
      "Lay it down for tonight. You can pick it back up when you've rested.",
    ],
    established: [
      "Even this far in, some nights you just need rest. Let yourself have it.",
      "You've earned the right to a gentle evening. Take it without guilt.",
      "Tiredness isn't weakness. It's what carrying something real feels like. Rest now.",
      "Be tender with yourself tonight. Tomorrow doesn't need anything from you yet.",
      "You don't have to be strong tonight. You've been strong enough, long enough.",
      "Rest is allowed, even now. Especially now.",
      "You've done the work for so long. Tonight, let the work be rest.",
      "A soft night, this deep in, is well earned. Sink into it.",
      "You know by now that rest is part of it. So put it all down.",
      "Even the steady get weary. Be gentle. You've more than earned it.",
      "You've carried this a long way. Set it down for the night.",
      "Tonight, be as kind to yourself as you've become strong. Both are yours.",
      "The work will be there tomorrow. Tonight is for rest, and you've earned it.",
      "You've nothing to prove tonight. You proved it months ago. Rest.",
      "Let tonight be soft. You've made a life sturdy enough to hold a gentle evening.",
      "Be good to yourself tonight. You've been good to yourself a long time now.",
      "You've earned every soft evening you'll ever take. Take this one.",
    ],
  },
}