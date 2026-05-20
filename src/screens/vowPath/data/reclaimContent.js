// =====================================================================
// RECLAIM STAGE CONTENT — 5 DAYS
// =====================================================================
// Post-slip TRIAGE stage. NOT a linear progression like the others.
// Job: route the user back into the prior stage that fits where they
// actually are (TTM stage-matched re-entry).
// Each day includes a `rationale` shown after the activity — explains
// the science/clinical logic behind what the user just did.
// =====================================================================

export const RECLAIM_TOTAL_DAYS = 5

export const RECLAIM_PHASES = [
  {
    key: 'reclaim',
    title: 'Reclaim',
    subtitle: 'Five days. Then the matched step back in.',
    dayRange: [1, 5],
  },
]

export const RECLAIM_DAYS = [

  // Day 1 — Walking the Spiral
  {
    day: 1,
    arrivalTitle: 'Walking the spiral.',
    arrivalSubtitle: 'You came back. That\'s the move.',
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

  // Day 2 — Right-sizing
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

  // Day 3 — Still standing
  {
    day: 3,
    arrivalTitle: 'Still standing.',
    arrivalSubtitle: 'What the slip couldn\'t reach.',
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
    closingLine: 'That\'s your anchor for what comes next.\nDay 3 is done.',
    rationale: [
      `The slip narrows attention to deficits — what's gone, what's failed, what's been compromised. Day 3 widened it back to what's still intact. This isn't just optimism. It draws on Claude Steele's self-affirmation theory: when self-integrity is threatened (which a slip absolutely does), surfacing other sources of identity protects against further unhealthy choices. People who do this kind of work after a setback are measurably less likely to repeat the setback.`,
      `You didn't read a pre-written list. You tapped each item into being, in a position you chose. That distinction matters. Research on embodied agency by Niedenthal and others shows that the act of constructing something with your body lands more deeply than passive reception. The six things weren't told to you. You surfaced them.`,
      `Picking the one that felt most solid was a values-clarification move from Acceptance and Commitment Therapy (Steven Hayes). When you select the most-solid thing, you're not just making a preference. You're creating a behavioral anchor — something specific to return to over the next few days, especially when the cascade tries to restart.`,
      `The slip didn't take everything. The work of Day 3 was making that visible.`,
    ],
  },

  // Day 4 — Mending
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

  // Day 5 — The matched step
  {
    day: 5,
    arrivalTitle: 'The matched step.',
    arrivalSubtitle: 'Where you actually are. Not where you wish you were.',
    artifactType: 'reclaim_day_5',
    intro: [
      `This is the last day of Reclaim. The work today is to step back into the journey — but at the right place. Not "starting over." Not picking up where you were and pretending nothing happened. The right place for where you actually are right now.`,
      `The literature on recovery is clear about this: the stage you re-enter matters more than the speed. Returning to a stage that's too early feels infantilizing and people drop off. Returning to one that's too far ahead skips the work that needs to be done now. The matched step is what gets people through the spiral instead of off it.`,
      `Two acts today.`,
      `First, you'll place yourself on the journey map — the five stages laid out below. Tap each one to feel what its first days look like, what its mood is, what it asks of you. Then drag your marker onto the stage that fits where you actually are.`,
      `Second, you'll step in. One slow gesture across the threshold. The app will route you to that stage as you complete the gesture.`,
      `That's the close of Reclaim.`,
    ],
    mechanic: 'reclaim_matched_step',
    mechanicProps: {
      needsStageProgress: true,
    },
    closingLine: 'Reclaim closed. Five days, five acts.',
    rationale: [
      `The Transtheoretical Model, developed by James Prochaska and Carlo DiClemente, started from a counterintuitive finding: when researchers compared different recovery interventions, the specific intervention mattered less than whether it matched the person's current stage. Stage-matched interventions outperformed mismatched ones, often dramatically. That's why Day 5 wasn't about commitment or willpower. It was about placement.`,
      `Returning to a stage that's too early triggers what psychologists call reactance — the resistance you feel when a process treats you like you know less than you do. People drop off. Returning to one that's too far ahead skips work that the slip itself revealed needs doing. The matched stage is the one that holds.`,
      `Why the slow drag instead of a button? Peter Gollwitzer's research on implementation intentions shows that effortful, deliberate action increases follow-through dramatically compared to quick decisions. The slow gesture wasn't aesthetic. It was the moment of bodily commitment to a specific stage, at a specific time. The next forty-eight hours feel different when there's been a felt threshold crossed, not just a button tapped.`,
      `Reclaim closed. Five days, five acts. The work of Day 5 was making sure the step back in was a step at the right place — not just any step.`,
    ],
  },
]

export function getReclaimDay(dayNumber) {
  return RECLAIM_DAYS.find(d => d.day === dayNumber) || null
}