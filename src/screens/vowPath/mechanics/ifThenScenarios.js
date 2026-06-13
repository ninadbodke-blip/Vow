// =====================================================================
// IF-THEN SOCIAL SCENARIOS — keyed by what the person is actually quitting.
// =====================================================================
// The Commit Day-5 library used one hardcoded set of scenarios written for
// drinking ("Someone offers you a drink at an event"). That breaks for
// cannabis, cigarettes, porn, gambling, etc. This resolver returns the right
// set of IF→THEN cards for the user's substance.
//
// Resolution order, most → least specific:
//   1. exact slug   (e.g. 'pornography', 'gambling', 'cigarettes')
//   2. family        ('substance' = ingested/refusable in company,
//                     'behavior'  = private compulsion, no social offer)
//   3. generic fallback
//
// Social-substance sets share a shape (someone offers / asks why / pushes /
// risky-plan invite). Behavior sets are different in kind: the "scripts" are
// the moments the urge actually arrives, since nobody offers you porn at a
// party. Each scenario: { id, situation, responses:[{id,label}], allowCustom }.
// =====================================================================

// ---- shared response: every set ends with an honesty option ----
const decline = (verbLine) => [
  { id: 'no_thanks_plain', label: `"No thanks." (no explanation)` },
  { id: 'not_tonight', label: verbLine },
  { id: 'taking_break', label: `"I'm taking a break from it."` },
  { id: 'doing_diff', label: `"I'm doing something different right now."` },
]

const whyResponses = [
  { id: 'just_decided', label: `"Just decided to take a break."` },
  { id: 'feels_better', label: `"Feels better without it."` },
  { id: 'health', label: `"For my health." (true, and enough)` },
  { id: 'trying_new', label: `"Trying something different this year."` },
]

const pushedResponses = (alt) => [
  { id: 'said_no', label: `"I said no — let's talk about something else."` },
  { id: 'firmer', label: `"No. Really."` },
  { id: 'leave', label: alt },
]

// ---- SUBSTANCE family default (covers alcohol/cannabis/cocaine/etc.) ----
const substanceDefault = [
  {
    id: 'offered_at_event',
    situation: `Someone offers it to you`,
    responses: decline(`"Not for me right now." (no further detail)`),
    allowCustom: true,
  },
  {
    id: 'asked_why',
    situation: `Someone asks why you're not using`,
    responses: whyResponses,
    allowCustom: true,
  },
  {
    id: 'pushed_to_use',
    situation: `Someone pushes after you've already declined`,
    responses: pushedResponses(`Step away physically. Get a glass of water, find someone else.`),
    allowCustom: true,
  },
  {
    id: 'group_chat_invite',
    situation: `A group chat invites you to a high-risk plan`,
    responses: [
      { id: 'cant_make_it', label: `"Sorry, can't make it." (no detail)` },
      { id: 'rain_check', label: `"Rain check — meet up another way?"` },
      { id: 'mute_chat', label: `Mute the chat for the night` },
    ],
    allowCustom: true,
  },
]

// ---- per-slug overrides ----
const BY_SLUG = {
  alcohol: [
    {
      id: 'offered_at_event',
      situation: `Someone offers you a drink at an event`,
      responses: [
        { id: 'just_water_thanks', label: `"Just water, thanks." (no explanation)` },
        { id: 'not_drinking_tonight', label: `"I'm not drinking tonight." (no further detail)` },
        { id: 'taking_break', label: `"I'm taking a break from it."` },
        { id: 'doing_something_diff', label: `"I'm doing something different right now."` },
      ],
      allowCustom: true,
    },
    {
      id: 'asked_why',
      situation: `Someone asks why you're not drinking`,
      responses: whyResponses,
      allowCustom: true,
    },
    {
      id: 'pushed_to_use',
      situation: `Someone pushes after you've already declined`,
      responses: pushedResponses(`Get a soft drink in your hand. A full glass ends most of the pushing.`),
      allowCustom: true,
    },
    {
      id: 'group_chat_invite',
      situation: `The plan is "let's get drinks"`,
      responses: [
        { id: 'sorry_busy', label: `"Sorry, can't make it." (no detail)` },
        { id: 'suggest_alt', label: `"Coffee instead?" (suggest a non-drinking plan)` },
        { id: 'mute_chat', label: `Mute the chat for the night` },
      ],
      allowCustom: true,
    },
  ],

  cigarettes: [
    {
      id: 'offered_smoke',
      situation: `Someone offers you a cigarette, or calls you out for a smoke break`,
      responses: [
        { id: 'quit_plain', label: `"I quit." (two words, no more)` },
        { id: 'not_smoking', label: `"I'm not smoking these days."` },
        { id: 'taking_break', label: `"Taking a break from it."` },
        { id: 'go_keep_company', label: `"I'll come stand, but I'm not smoking."` },
      ],
      allowCustom: true,
    },
    {
      id: 'asked_why',
      situation: `Someone asks why you stopped`,
      responses: whyResponses,
      allowCustom: true,
    },
    {
      id: 'the_smoke_break',
      situation: `The crew heads out for the smoke break and you'd normally go`,
      responses: [
        { id: 'stay_put', label: `Stay at your desk. The break is the trigger, not the cigarette.` },
        { id: 'walk_instead', label: `Take your own walk instead — same air, no smoke` },
        { id: 'water_run', label: `Make it a water/tea run instead` },
      ],
      allowCustom: true,
    },
    {
      id: 'after_meal_drink',
      situation: `The after-meal or with-a-drink moment hits`,
      responses: [
        { id: 'leave_table', label: `Get up from the table right away` },
        { id: 'gum_mint', label: `Gum or a mint in the mouth instead` },
        { id: 'hands_busy', label: `Give your hands something else to hold` },
      ],
      allowCustom: true,
    },
  ],

  pornography: [
    {
      id: 'alone_with_device',
      situation: `You're alone with your phone or laptop, late, and the pull starts`,
      responses: [
        { id: 'leave_room', label: `Get up and leave the room — take the device with you, into the open` },
        { id: 'phone_down_charge', label: `Put the phone on its charger in another room` },
        { id: 'text_anchor', label: `Text your anchor person — even just a 🌊` },
        { id: 'cold_water', label: `Cold water on the face, then a different task` },
      ],
      allowCustom: true,
    },
    {
      id: 'the_bargain',
      situation: `Your mind makes the bargain — "just this once," "just to look"`,
      responses: [
        { id: 'name_it', label: `Name it out loud: "this is the urge talking, not me"` },
        { id: 'ten_minutes', label: `"Not now — I'll decide in 10 minutes." (the wave usually passes)` },
        { id: 'why_started', label: `Re-read why you started (your vow)` },
      ],
      allowCustom: true,
    },
    {
      id: 'triggered_by_feed',
      situation: `Something in a feed or a search pulls you toward it`,
      responses: [
        { id: 'close_app', label: `Close the app fully, not just switch tabs` },
        { id: 'blockers_on', label: `Confirm your blocker is on — fix it now if it's off` },
        { id: 'change_context', label: `Change your physical context — stand up, go outside` },
      ],
      allowCustom: true,
    },
    {
      id: 'stress_or_lonely',
      situation: `You're stressed, bored, or lonely — the usual on-ramp`,
      responses: [
        { id: 'real_need', label: `Ask what you actually need right now — rest, food, company?` },
        { id: 'call_someone', label: `Call or message a real person instead` },
        { id: 'move_body', label: `Move your body for five minutes` },
      ],
      allowCustom: true,
    },
  ],

  gambling: [
    {
      id: 'urge_to_bet',
      situation: `The urge to place a bet arrives`,
      responses: [
        { id: 'not_now_10', label: `"Not now — I'll decide in 10 minutes." (urges crest and fall)` },
        { id: 'close_apps', label: `Close the betting app; open something else entirely` },
        { id: 'text_anchor', label: `Text your anchor person before doing anything` },
        { id: 'why_started', label: `Re-read why you started (your vow)` },
      ],
      allowCustom: true,
    },
    {
      id: 'chasing_a_loss',
      situation: `You just lost, and the pull to win it back is loud`,
      responses: [
        { id: 'name_chase', label: `Name it: "this is chasing — it's how it always gets worse"` },
        { id: 'walk_away', label: `Physically walk away from the screen or table` },
        { id: 'log_it', label: `Write down what you'd be risking, in rupees, right now` },
      ],
      allowCustom: true,
    },
    {
      id: 'invited_to_play',
      situation: `Friends invite you to bet, play cards, or hit the casino`,
      responses: [
        { id: 'not_my_thing', label: `"Not my thing anymore." (no debate)` },
        { id: 'come_not_play', label: `"I'll come, but I'm not playing." (only if you trust yourself)` },
        { id: 'skip_it', label: `Skip it this time — suggest a different plan` },
      ],
      allowCustom: true,
    },
    {
      id: 'access_moment',
      situation: `You have money in hand and access is one tap away`,
      responses: [
        { id: 'add_friction', label: `Add friction now — log out, delete the app, hand someone your card` },
        { id: 'move_money', label: `Move the money somewhere harder to reach` },
        { id: 'self_exclude', label: `Use the self-exclusion / cooling-off setting if there is one` },
      ],
      allowCustom: true,
    },
  ],
}

// behaviors with no specific set fall back to a private-compulsion shape
const behaviorDefault = [
  {
    id: 'urge_arrives',
    situation: `The urge arrives when you're alone`,
    responses: [
      { id: 'not_now_10', label: `"Not now — I'll decide in 10 minutes."` },
      { id: 'leave_context', label: `Change your physical context immediately` },
      { id: 'text_anchor', label: `Text your anchor person — even just a 🌊` },
      { id: 'why_started', label: `Re-read why you started (your vow)` },
    ],
    allowCustom: true,
  },
  {
    id: 'the_bargain',
    situation: `Your mind makes the bargain — "just this once"`,
    responses: [
      { id: 'name_it', label: `Name it out loud: "this is the urge talking, not me"` },
      { id: 'ride_wave', label: `Ride the wave — set a timer, let it crest and pass` },
      { id: 'move_body', label: `Move your body for five minutes` },
    ],
    allowCustom: true,
  },
  {
    id: 'access_one_tap',
    situation: `Access is one tap away`,
    responses: [
      { id: 'add_friction', label: `Add friction now — log out, move the device, turn on a blocker` },
      { id: 'open_space', label: `Move into an open, shared space` },
      { id: 'call_someone', label: `Call a real person instead` },
    ],
    allowCustom: true,
  },
]

// Whether to call them "Social scripts" (substances) or "When the urge hits"
// (private behaviors), since the framing differs.
export function ifThenSocialHeader(substance) {
  return substance?.family === 'behavior' ? 'When the urge hits.' : 'Social scripts.'
}

export function ifThenSocialSubtext(substance) {
  return substance?.family === 'behavior'
    ? `The moments it usually arrives, with a response already chosen — so you're not deciding in the heat of it.`
    : `The situations you'll actually face, with a line already chosen.`
}

export function getIfThenScenarios(substance) {
  if (!substance) return substanceDefault
  const slug = substance.primary || substance.id
  if (slug && BY_SLUG[slug]) return BY_SLUG[slug]
  if (substance.family === 'behavior') return behaviorDefault
  return substanceDefault
}