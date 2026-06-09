// =====================================================================
// RECLAIM STAGE CONTENT — 5 MODULES, 5 EXERCISES EACH
// =====================================================================
// Post-slip TRIAGE stage. NOT a linear progression like the others.
// On each entry the user is shown ONE module (picked at random, avoiding
// recently-seen ones). Every module is 4 unique exercises + a shared 5th
// exercise: the matched step that routes them back into the stage that fits.
// Each exercise keeps a `rationale` shown after the activity — the plain-
// English reason it works.
// =====================================================================

export const RECLAIM_TOTAL_DAYS = 5

// ---------------------------------------------------------------------
// SHARED 5th EXERCISE — the matched step (re-entry). Identical content in
// every module; only the saved artifactType differs (so completion is
// tracked per module).
// ---------------------------------------------------------------------
const SHARED_MATCHED_STEP = {
  arrivalTitle: 'The matched step.',
  arrivalSubtitle: 'Where you actually are. Not where you wish you were.',
  intro: [
    `This is the last day of Reclaim. The work today is to step back into the journey — but at the right place. Not "starting over." Not picking up where you were and pretending nothing happened. The right place for where you actually are right now.`,
    `The research on recovery is clear about this: the stage you re-enter matters more than the speed. Going back to a stage that's too early feels like being treated as less than you are, and people drop off. Jumping to one that's too far ahead skips the work that needs doing now. The matched step is what keeps people on the spiral instead of off it.`,
    `Two acts today.`,
    `First, you'll place yourself on the journey map — the five stages laid out below. Tap each one to feel what its first days look like and what it asks of you. Then drag your marker onto the stage that fits where you actually are.`,
    `Second, you'll step in. One slow gesture across the line. The app will take you to that stage as you finish the gesture.`,
    `That's the close of Reclaim.`,
  ],
  mechanic: 'reclaim_matched_step',
  mechanicProps: { needsStageProgress: true },
  closingLine: 'Reclaim closed. Five acts.',
  rationale: [
    `The model behind these stages started from a surprising finding: when researchers compared recovery methods, the method mattered less than whether it matched the person's current stage. A matched step works far better than a mismatched one. So today wasn't about willpower. It was about placement — picking the right rung to step back onto.`,
    `Going back too early sets off resistance — the irritation you feel when something treats you like you know less than you do. People quit. Going back too far ahead skips the very work the slip just showed you still needs doing. The matched stage is the one that holds.`,
    `Why the slow drag instead of a button? Research on follow-through shows that slow, deliberate action makes people far more likely to actually do the thing than a quick tap does. The slow gesture was the real moment of choosing — a line crossed in your body, not just on a screen.`,
    `Reclaim closed. The work of the last day was making sure the step back in landed at the right place — not just any step.`,
  ],
}

function matchedStep(artifactType) {
  return { ...SHARED_MATCHED_STEP, day: 5, artifactType }
}

// ---------------------------------------------------------------------
// THE MODULES
// ---------------------------------------------------------------------
export const RECLAIM_MODULES = [

  // ===================================================================
  // MODULE 1 — Walking the Spiral  (the original; land + right-size + integrate)
  // ===================================================================
  {
    id: 'spiral',
    title: 'Walking the Spiral',
    subtitle: 'Land, steady yourself, and put the slip back in proportion.',
    days: [
      {
        day: 1,
        arrivalTitle: 'Walking the spiral.',
        arrivalSubtitle: `You came back. That's the move.`,
        artifactType: 'reclaim_day_1',
        intro: [
          `You came back. That's the move today — small but not nothing. The work for Day 1 is to stay here for a minute and let the rest wait.`,
          `Two acts. The first: below is a spiral. Trace it from the outside in, slowly, with your finger. There's no hurry to reach the center. Don't think about anything specific while you trace — the gesture itself is the work.`,
          `The second: when you reach the middle, place a hand on your chest and breathe with the small circle that appears. Three breaths. That's the whole day.`,
        ],
        mechanic: 'reclaim_spiral_and_breath',
        mechanicProps: {},
        closingLine: 'Two acts. Day 1 is done.\nTomorrow we look outward.',
        rationale: [
          `The spiral wasn't decoration. It comes from research by Prochaska and DiClemente on how people actually change — they call the journey a spiral, not a straight line. Relapse isn't a fall off the path. It's a station on it. Tracing that with your finger, slowly, made the idea something your hand knows, not just something you read.`,
          `The minutes and hours right after a slip are the most dangerous part of the slip. Alan Marlatt, who shaped most of modern relapse prevention research, named the cascade that happens there — the shame, the helplessness, the "what's the point" thinking — the Abstinence Violation Effect. It's what turns lapses into longer returns. Day 1's job was to interrupt that cascade before it gathered speed.`,
          `Hand-on-chest with paced breathing is from Mindfulness-Based Relapse Prevention, an intervention that consistently outperforms talk-only approaches in the window right after a slip. The slow contraction-and-expansion pattern activates your parasympathetic nervous system, which calms the fight-or-flight response that shame keeps switched on. Three breaths is small. Three breaths is also the difference between activating that system and not.`,
          `You came back. The work of Day 1 was making that act real in your body, not just in your head.`,
        ],
      },
      {
        day: 2,
        arrivalTitle: 'Right-sizing.',
        arrivalSubtitle: 'The slip is one. The path continues.',
        artifactType: 'reclaim_day_2',
        intro: [
          `Yesterday you arrived. Today, the slip wants to fill the whole frame. Shame works by inflating one event until it feels like everything else — your recovery, your worth, your future — has been canceled by it.`,
          `It hasn't.`,
          `Two small acts. The first puts today in proportion to the rest of your days. The second is a single mark that says tomorrow is already on the map. Neither asks you to do anything heroic. Both are quiet.`,
          `The slip was one day. The path continues. That's the work for today.`,
        ],
        mechanic: 'reclaim_proportion',
        mechanicProps: {},
        closingLine: 'Today is one. Tomorrow is already placed.\nDay 2 is done.',
        rationale: [
          `Shame doesn't argue. It just expands. After a slip, the slip wants to take up the whole frame — your worth, your future, your sense of who you are. Aaron Beck, who founded cognitive therapy, called this pattern "catastrophizing" — treating one event as if it determined everything. Day 2's activity wasn't asking you to feel differently about the slip. It was asking you to manually demonstrate, with taps on a screen, that the slip is one day among many.`,
          `Each gray dot you placed was a day. Not metaphorically. Christine Padesky's evidence-gathering technique in cognitive therapy works exactly this way — instead of arguing with shame's claims, you accumulate counter-evidence visibly until the distortion can no longer hold its shape. You were doing that with your taps.`,
          `Placing tomorrow at the edge of the constellation used a technique researchers call temporal distancing. Work by Bruehlman-Senecal and colleagues shows that the simple act of orienting toward a future self — even a few hours forward — measurably reduces present-moment distress. Tomorrow wasn't an abstract idea. You put it somewhere on the screen. It became a place you can walk toward.`,
          `Today is one. The path continues. The work of Day 2 was making that mathematical, not motivational.`,
        ],
      },
      {
        day: 3,
        arrivalTitle: 'Still standing.',
        arrivalSubtitle: `What the slip couldn't reach.`,
        artifactType: 'reclaim_day_3',
        intro: [
          `The slip wants you to think it took everything. It didn't. You're farther along the spiral than you were before — even with this slip in the count.`,
          `Today's work is to see what's still here. Not a list to make. Six small things, revealed one at a time by tapping them into being on the screen. Things that didn't disappear. Things the slip couldn't reach.`,
          `Two acts. First, you'll surface what survived. Then you'll mark which one feels most solid — your anchor for the next move.`,
        ],
        mechanic: 'reclaim_still_standing',
        mechanicProps: {
          retrieveFromStages: ['reflect', 'commit', 'build'],
        },
        closingLine: `That's your anchor for what comes next.\nDay 3 is done.`,
        rationale: [
          `The slip narrows attention to deficits — what's gone, what's failed, what's been compromised. Day 3 widened it back to what's still intact. This isn't just optimism. It draws on Claude Steele's self-affirmation theory: when self-integrity is threatened (which a slip absolutely does), surfacing other sources of identity protects against further unhealthy choices. People who do this kind of work after a setback are measurably less likely to repeat the setback.`,
          `You didn't read a pre-written list. You tapped each item into being, in a position you chose. That distinction matters. Research on embodied agency by Niedenthal and others shows that the act of constructing something with your body lands more deeply than passive reception. The six things weren't told to you. You surfaced them.`,
          `Picking the one that felt most solid was a values-clarification move from Acceptance and Commitment Therapy (Steven Hayes). When you select the most-solid thing, you're not just making a preference. You're creating a behavioral anchor — something specific to return to over the next few days, especially when the cascade tries to restart.`,
          `The slip didn't take everything. The work of Day 3 was making that visible.`,
        ],
      },
      {
        day: 4,
        arrivalTitle: 'Mending.',
        arrivalSubtitle: 'The line is whole. The slip is part of it.',
        artifactType: 'reclaim_day_4',
        intro: [
          `The slip can feel like it broke something. Like the work you've been doing, the days you'd put together, the line you were walking — all of it is now in two pieces. Before, and after. And the "after" piece doesn't really count as the same work anymore.`,
          `That feeling is the cascade. It's the same mechanism that pushes people from one slip into a full return. It says: this is broken now. There's no reason to keep going. The line has been cut.`,
          `That's not how recovery actually moves. The slip isn't a break in the line. It's a moment in the line. The line continues through it. The people who recover long-term aren't the ones who never slipped — they're the ones who learned to see slips as included, not as cancellations.`,
          `Today's act is to make this concrete — physically, in your hand. Below is a line with a small gap where today sits. You're going to close it. Drag your finger across the gap. The line will become whole. Today will be inside it, not outside it.`,
          `That's the mending. The slip is part of the path, not the end of it.`,
        ],
        mechanic: 'reclaim_mending',
        mechanicProps: {},
        closingLine: 'The line is whole. The slip is part of it.\nTomorrow we look at where to step next.',
        rationale: [
          `There's a meaningful difference between a story with a break in it and a story with a difficult chapter in it. Narrative therapy research from Michael White and David Epston shows that distinction matters enormously for long-term recovery. People who frame slips as breaks tend to stop walking the path. People who frame them as chapters keep walking. The mending gesture made that frame physical, not just conceptual.`,
          `The Abstinence Violation Effect from Day 1 has one specific job — convince you the line has been cut. That there's no point continuing because it's already broken. The mending activity directly contradicted that signal at the level of your hand and your eye. You closed the gap. The line is whole. That visual record is harder to argue with than self-talk.`,
          `Why drag, not tap? The cognitive scientist George Lakoff and the broader embodied cognition literature have shown that physical metaphors aren't decoration — they shape thought at the level of how concepts are built. Closing a gap with your finger creates a felt sense of integration that you can't get from reading the word "integration."`,
          `Adding the forward mark beyond the line's right edge introduced prospective time. Research on rumination by Watkins and colleagues shows that small bridges between past and future reduce the depressive looping that often follows a slip. You weren't just looking at what you mended. You were already looking past it.`,
          `The slip was a moment in the line. The work of Day 4 was making that the only available reading.`,
        ],
      },
      matchedStep('reclaim_day_5'),
    ],
  },

  // ===================================================================
  // MODULE 2 — What Happened  (calm, blame-free reconstruction -> prevention)
  // ===================================================================
  {
    id: 'reconstruct',
    title: 'What Happened',
    subtitle: 'Look back calmly at how the slip happened — with no blame.',
    days: [
      {
        day: 1,
        arrivalTitle: 'The hours before.',
        arrivalSubtitle: 'Walk back through what led up to it.',
        artifactType: 'reclaim_reconstruct_d1',
        intro: [
          `A slip almost never comes out of nowhere. Something led up to it — a hard day, a feeling, a place, a moment when the door opened.`,
          `Today, just walk back through it. Start a few hours before the slip and tell what happened, step by step, up to the moment itself. Don't judge any of it. You're not in trouble. You're only looking.`,
          `Write it like a simple story: this happened, then this, then this.`,
        ],
        mechanic: 'reclaim_write',
        mechanicProps: {
          prompt: `Tell what happened in the hours before the slip, step by step.`,
          placeholder: `That afternoon, I…`,
        },
        closingLine: `You looked at it without flinching.\nThat's how you learn from it.`,
        rationale: [
          `Slips follow a chain. Almost always there were small steps before the slip itself — a stress, a place, a choice that seemed harmless at the time. People who study relapse call these "high-risk situations," and they turn out to be surprisingly predictable once you look.`,
          `You can't change a moment you never look at. Writing the chain down, calmly, turns the slip from a mystery into something you can understand — and next time, see coming.`,
        ],
      },
      {
        day: 2,
        arrivalTitle: 'The quiet fork.',
        arrivalSubtitle: 'Find the small choice that opened the door.',
        artifactType: 'reclaim_reconstruct_d2',
        intro: [
          `Look back at the story you just wrote. Somewhere in it there was a small, quiet choice — long before the slip — where things could have gone another way.`,
          `It usually doesn't look important at the time. "I'll just stop by." "I'll keep it in the house." "I won't tell anyone I'm struggling." Small doors. But that's where the slip really started.`,
          `Find that one moment. Write it down, and write what made it feel okay at the time.`,
        ],
        mechanic: 'reclaim_write',
        mechanicProps: {
          prompt: `What was the small, early choice that opened the door — and why did it feel okay then?`,
          placeholder: `The moment was when I…`,
        },
        closingLine: `That quiet fork is where your power is.\nNot at the slip — before it.`,
        rationale: [
          `These small early choices have a name in relapse research — "seemingly unimportant decisions." They feel harmless, but each one quietly moves you closer to the edge. By the time the strong urge hits, the real decision was already made hours ago.`,
          `Finding your fork matters because that early moment is much easier to change than the urge itself. You have far more control at the quiet fork than at the cliff.`,
        ],
      },
      {
        day: 3,
        arrivalTitle: 'What it was really about.',
        arrivalSubtitle: 'Name the thing underneath.',
        artifactType: 'reclaim_reconstruct_d3',
        intro: [
          `The slip was about more than the substance. Underneath, something was pushing — a feeling or a need you were trying to deal with.`,
          `It's usually one of a few things: you were upset or angry, you were lonely, you were worn out, or you were celebrating and let your guard down. Sometimes it's a person or a place that always does this to you.`,
          `Be honest. What was really going on underneath? Name it plainly.`,
        ],
        mechanic: 'reclaim_write',
        mechanicProps: {
          prompt: `What feeling or need was really underneath the slip?`,
          placeholder: `Underneath it, I think I was…`,
        },
        closingLine: `Now you know what to watch for.\nThe real trigger has a name.`,
        rationale: [
          `The substance is rarely the real driver. Studies of relapse find that most slips are pushed by a few underlying states — bad moods, conflict with someone, or feeling worn down. There's even a simple checklist for it: H.A.L.T. — Hungry, Angry, Lonely, Tired.`,
          `When you can name the real thing underneath, you can deal with the real thing — instead of fighting the urge again and again on the surface.`,
        ],
      },
      {
        day: 4,
        arrivalTitle: 'The earlier exit.',
        arrivalSubtitle: 'Plan the one different move for next time.',
        artifactType: 'reclaim_reconstruct_d4',
        intro: [
          `Go back to your quiet fork — that small, early moment. Next time you're there, what's one different thing you could do?`,
          `Keep it simple and real. "If I feel that way again, I'll call this person." "If I'm near that place, I'll take the other road." "If it's in the house, I'll get rid of it tonight." One clear move you can actually make.`,
          `Write it as an if-then: "If this happens, then I'll do that."`,
        ],
        mechanic: 'reclaim_write',
        mechanicProps: {
          prompt: `Write one if-then plan for your fork: "If ___ happens, then I'll ___."`,
          placeholder: `If I… then I'll…`,
        },
        closingLine: `You've got an exit now.\nThat's one less open door.`,
        rationale: [
          `Deciding your move in advance is one of the most proven tricks in all of behavior change. Psychologists call these "if-then plans," and people who make them follow through far more often — because the decision is already made before the hard moment arrives.`,
          `You can't rely on willpower in the middle of a strong urge. But a plan you made earlier, when you were calm, can carry you through it.`,
        ],
      },
      matchedStep('reclaim_reconstruct_d5'),
    ],
  },

  // ===================================================================
  // MODULE 3 — The Other Chair  (perspective-flip / self-distancing)
  // ===================================================================
  {
    id: 'chair',
    title: 'The Other Chair',
    subtitle: `Be as kind to yourself as you'd be to a friend.`,
    days: [
      {
        day: 1,
        arrivalTitle: 'A friend who slipped.',
        arrivalSubtitle: `Say to them what you can't say to yourself.`,
        artifactType: 'reclaim_chair_d1',
        intro: [
          `Here's the thing about a slip: you'd never talk to a friend the way you're talking to yourself right now.`,
          `So today you're not going to fix anything. A friend has just messaged you. They slipped too, after doing really well. Read their message, and write back to them. Be honest, but be kind — the way you would be with someone you care about.`,
          `Then we'll do one small thing with what you wrote.`,
        ],
        mechanic: 'reclaim_chair_flip',
        mechanicProps: {
          friendMessage: `Hey… I messed up last night. I was clean for three months and I threw it away. I feel like such a fraud. I don't even know why I'm telling you this.`,
        },
        closingLine: `Those were your words.\nThey were always meant for you too.`,
        rationale: [
          `There's a simple reason this works. Researchers found that we are much kinder and much smarter when we give advice to someone else than when we talk to ourselves. The same problem feels lighter and clearer from the outside.`,
          `When you wrote to your "friend," you were really writing to yourself — you just took the harshness out. That kinder voice is the one that actually helps you keep going. The cruel one only makes the next slip more likely.`,
        ],
      },
      {
        day: 2,
        arrivalTitle: 'In your own name.',
        arrivalSubtitle: 'Tell the story like it happened to someone you know.',
        artifactType: 'reclaim_chair_d2',
        intro: [
          `Yesterday you wrote to a friend. Today, tell the story of your own slip — but use your name instead of "I".`,
          `So write it like this: "Sam slipped on Tuesday. They'd had a hard day, and…" — but with your name. Keep going for a few lines. Just tell what happened, plainly, like you're talking about someone you know and care about.`,
          `Using your name instead of "I" feels strange at first. That's the point.`,
        ],
        mechanic: 'reclaim_write',
        mechanicProps: {
          prompt: `Tell the story of your slip using your name, not "I".`,
          placeholder: `[Your name] slipped on…`,
        },
        closingLine: `You looked at it from one step back.\nFrom there, it's easier to be fair.`,
        rationale: [
          `This is a small trick with a big effect. Studies show that when people describe a hard moment using their own name instead of "I", they feel calmer and judge themselves less harshly. It puts a little space between you and the pain.`,
          `From that small distance, you can see the slip as one event in a long story — not as proof of who you are.`,
        ],
      },
      {
        day: 3,
        arrivalTitle: 'One year from now.',
        arrivalSubtitle: 'Let the future you say something back.',
        artifactType: 'reclaim_chair_d3',
        intro: [
          `Imagine yourself one year from today. You kept going. Things are steadier now.`,
          `That version of you is looking back at this exact week — the slip, this hard feeling. Write a short note from them, to you. What would they want you to know right now?`,
          `Keep it short. A few honest lines.`,
        ],
        mechanic: 'reclaim_write',
        mechanicProps: {
          prompt: `Write a short note from yourself one year ahead, to yourself today.`,
          placeholder: `Hey — it's me, a year on…`,
        },
        closingLine: `The future you isn't angry about this week.\nThey're just glad you kept going.`,
        rationale: [
          `When a slip happens, this week feels huge. But time shrinks it. A year from now, one bad night is a small dot, not the whole picture.`,
          `Hearing that from "future you" lands in a way that someone else saying "it'll be okay" never does — because it's coming from you.`,
        ],
      },
      {
        day: 4,
        arrivalTitle: 'The two voices.',
        arrivalSubtitle: 'Catch the cruel one. Answer it kindly.',
        artifactType: 'reclaim_chair_d4',
        intro: [
          `There are two voices after a slip. One is cruel — "you failed, you always do this, what's the point." The other is kind, the one you used with your friend.`,
          `First, write down exactly what the cruel voice is saying to you right now. Don't soften it. Get it out.`,
          `Then, underneath, answer it — in the kind voice. Say back to that cruel line what a good friend would say.`,
        ],
        mechanic: 'reclaim_write',
        mechanicProps: {
          prompts: [
            { label: `The cruel voice says…`, placeholder: `Write the harsh thoughts, word for word.` },
            { label: `The kind voice answers…`, placeholder: `Now answer it, the way you'd answer a friend.` },
          ],
        },
        closingLine: `You don't have to believe the cruel voice.\nYou can answer it. You just did.`,
        rationale: [
          `The cruel voice feels like the truth, but it isn't — it's just a habit. And like any habit, it gets weaker when you answer it instead of obeying it.`,
          `Every time you catch the harsh thought and reply with a kinder, fairer one, you train a new habit. Over time, the kind voice gets louder on its own.`,
        ],
      },
      matchedStep('reclaim_chair_d5'),
    ],
  },

]

// Modules that are live and can be shown (in display order).
export const RECLAIM_MODULE_POOL = ['spiral', 'reconstruct', 'chair']

export function getModule(id) {
  return RECLAIM_MODULES.find((m) => m.id === id) || null
}

export function getReclaimExercise(moduleId, dayNumber) {
  const m = getModule(moduleId)
  if (!m) return null
  return m.days.find((d) => d.day === dayNumber) || null
}

// Pick a module at random, avoiding the most recently shown ones.
// `history` is an array of module ids, most-recent last.
export function pickReclaimModule(history = []) {
  const pool = RECLAIM_MODULE_POOL
  if (pool.length === 0) return null
  if (pool.length === 1) return pool[0]
  const excludeCount = Math.min(2, pool.length - 1)
  const recent = history.slice(-excludeCount)
  let candidates = pool.filter((id) => !recent.includes(id))
  if (candidates.length === 0) {
    const last = history[history.length - 1]
    candidates = pool.filter((id) => id !== last)
  }
  if (candidates.length === 0) candidates = pool.slice()
  return candidates[Math.floor(Math.random() * candidates.length)]
}