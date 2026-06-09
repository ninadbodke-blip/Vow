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
        arrivalSubtitle: 'The line is whole. Today is part of it.',
        artifactType: 'reclaim_day_4',
        intro: [
          `A slip can feel like it broke something. Like the days you'd put together, the steady run you were on, the line you were walking — all of it is now in two pieces. There's a "before" and an "after." And the "after" part doesn't feel like it counts as the same thing anymore.`,
          `That feeling has a job. It's the same push that turns one slip into a long return. It whispers the same thing every time: it's broken now, so there's no real point in going on. The line has been cut. Why keep walking it?`,
          `But that's not how recovery actually works. The slip isn't a break in the line. It's one point along the line. The line keeps going right through it. The people who make it for the long run aren't the ones who never slipped — they're the ones who learned to count the slip as part of the walk, not the end of it.`,
          `Today you'll show yourself this with your own hand. Below is your line, with your days set along it like beads. One bead — today — has come loose. It's floating above the line, on its own, cut off. Your job is simple: take it, and drag it back down onto the line where it belongs.`,
          `When it drops into place, you'll see the truth of it. The line runs straight through today. Nothing was ever really broken. The slip is part of the path, not the end of it.`,
        ],
        mechanic: 'reclaim_mending',
        mechanicProps: {},
        closingLine: 'The line is whole. Today is part of it.\nTomorrow, we look at where to step next.',
        rationale: [
          `There's a real difference between a story with a break in it and a story with a hard chapter in it. People who study recovery have seen this for decades: when someone treats a slip as a break, they tend to stop walking the path. When they treat it as just a rough chapter, they keep going. Moving that loose day back onto the line, with your own hand, made that idea something you did — not just something you read.`,
          `Remember that feeling from earlier — the one that says the line has been cut, so there's no point going on? It has one job: to make you quit. The act you just did argued straight back at it. You saw the loose day join the line. You saw the line stay whole. That picture is much harder to argue with than a thought in your head.`,
          `Why drag it with your finger instead of just tapping a button? Because the body learns things the mind alone can't. Scientists who study how we think have shown that physical actions — moving something, joining two things together — shape how we understand them. Pulling the loose day back into the line gives you a felt sense of "it's all one piece" that no words on a screen can give you.`,
          `And the beads stretching off both ends of the line did something too. They quietly placed today between a past and a future. Research on the kind of looping, stuck thinking that often follows a slip shows that small reminders of "there's a before and an after" help break the loop. You weren't only fixing today. You were already standing inside a longer story.`,
          `The slip was one point on the line. The work today was simply to see it that way — clearly, with your own eyes and your own hand — and let every other reading fall away.`,
        ],
      },
      matchedStep('reclaim_day_5'),
    ],
  },

  // ===================================================================
  // MODULE 2 — Set It Down  (release the post-slip load; gesture, not journaling)
  // ===================================================================
  {
    id: 'setdown',
    title: 'Set It Down',
    subtitle: 'Put down what the slip made you pick up.',
    days: [
      {
        day: 1,
        arrivalTitle: 'Say the worst of it.',
        arrivalSubtitle: 'Then let it go.',
        artifactType: 'reclaim_setdown_d1',
        intro: [
          `After a slip, there's a voice that says the cruelest things. "You're a failure. You'll never change. What's even the point." Right now it might feel like the plain truth.`,
          `Today you're going to do two things with it. First, get it out. Write down the harshest thing the slip is telling you — the worst of it, in its own words. Don't clean it up or make it kinder. Just put it on the screen where you can see it.`,
          `Then you're going to set it down. You'll press and hold the words, and watch them go — until the screen is clear and the weight of them is off you.`,
        ],
        mechanic: 'reclaim_release',
        mechanicProps: {
          prompt: `Write the harshest thing the slip is telling you. Don't soften it.`,
          placeholder: `The worst of it is…`,
        },
        closingLine: `You said it, and then you let it go.\nIt doesn't get to ride home with you.`,
        rationale: [
          `Getting a painful thought out of your head and onto a screen does something real. Researchers who study writing about hard feelings find that naming a thing plainly takes some of its sting away. While it stays trapped inside, it feels huge and true. Written down, it's just a sentence — and you can finally see it for what it is.`,
          `And there's a reason you let it go with your hand instead of only reading it. A slip loads you with shame, and shame is exactly what turns one slip into many. Putting the harsh thought down — actually watching it disappear — tells your body the load is off. You don't have to carry that into tomorrow.`,
        ],
      },
      {
        day: 2,
        arrivalTitle: `What you're carrying.`,
        arrivalSubtitle: 'Take the weight off, one piece at a time.',
        artifactType: 'reclaim_setdown_d2',
        intro: [
          `A slip doesn't just happen and end. It leaves you carrying things — heavy ones. The shame of it. The feeling that you let people down. The dread of going "back to zero." The quiet fear that maybe you can't do this after all.`,
          `You've been holding all of it at once, and it's heavy. So today you're going to set it down — not all in a rush, but one piece at a time.`,
          `Below are the weights, resting on a ledge. Take each one in your hand and drag it off. Let it drop. Feel the load get a little lighter with every one you put down.`,
        ],
        mechanic: 'reclaim_set_down',
        mechanicProps: {
          weights: ['The shame', 'I let people down', 'Back to zero', `I can't do this`],
        },
        closingLine: `Lighter. You don't have to hold all of that.\nNot tonight.`,
        rationale: [
          `When everything piles up at once, it feels like one giant, crushing weight you can't do anything about. But it's never really one thing — it's several smaller things stacked together. Pulling them apart and naming them is the first relief: now it's pieces, not a mountain.`,
          `Setting each one down with your hand matters more than just thinking "I should let this go." Your body believes what it does, not what it's told. Lifting each weight off, one at a time, is you proving to yourself that these things can be put down — that you are not required to carry them every minute of every day.`,
        ],
      },
      {
        day: 3,
        arrivalTitle: 'Ride it out.',
        arrivalSubtitle: 'The urge rises. Then it always falls.',
        artifactType: 'reclaim_setdown_d3',
        intro: [
          `After a slip, the pull often doesn't stop — it can come back, hard. "I already slipped, so what's the difference now." That's the moment that turns one slip into a whole week of them.`,
          `Here's the thing about an urge: it isn't a straight line that climbs forever. It's a wave. It rises, it peaks, and then — if you don't feed it — it falls back down on its own. Usually faster than you'd think.`,
          `So you're not going to fight this one. You're going to ride it. Put your finger on the wave and follow it as it rises. When it peaks, stay with it — that's the hardest part. Then watch it come back down, all the way, until it's passed.`,
        ],
        mechanic: 'reclaim_urge_wave',
        mechanicProps: {},
        closingLine: `It passed. It always does.\nYou rode it instead of feeding it.`,
        rationale: [
          `This is a skill called "urge surfing," and it's one of the most useful things in all of recovery. People assume an urge will just keep climbing until they give in. But cravings don't work that way. Left alone, an urge rises, crests, and fades — most pass within minutes.`,
          `The trap is believing the only way to end the feeling is to act on it. Riding the wave proves otherwise, with your own eyes and your own hand: you stayed with it, you didn't feed it, and it passed anyway. Once you've felt that happen, the next urge has a lot less power over you — because now you know how it ends.`,
        ],
      },
      {
        day: 4,
        arrivalTitle: 'Set the day down.',
        arrivalSubtitle: 'Let today rest. Tomorrow is clean.',
        artifactType: 'reclaim_setdown_d4',
        intro: [
          `It's been a hard day. You don't have to fix anything else tonight. There's only one thing left to do: put the day down, so it doesn't follow you into tomorrow.`,
          `Below is today — this whole heavy day — held in one small light. Take it, and lower it gently into the still water. Let it sink. Let it rest.`,
          `When it settles, the day is closed. Whatever happened in it stays in it. Tomorrow opens clean.`,
        ],
        mechanic: 'reclaim_seal',
        mechanicProps: {},
        closingLine: `Today is set down.\nTomorrow, you begin again — clean.`,
        rationale: [
          `One of the quiet traps after a slip is letting the bad day bleed into the next one, and the next, until a single slip has stained a whole week. Closing the day on purpose — marking a clear end to it — stops that bleed. It says: that was one day, and it is over now.`,
          `Endings matter to the mind. A small, deliberate closing — lowering the day into still water — tells you the chapter is finished, the way turning off a light tells you it's time to rest. You're not pretending the slip didn't happen. You're refusing to let it own tomorrow. Tonight you set it down. Tomorrow you pick the path back up — clean.`,
        ],
      },
      matchedStep('reclaim_setdown_d5'),
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
          `Here's a strange thing about a slip. The way you're talking to yourself right now — the harshness, the disappointment, the "I should have known better" — you would never, ever talk to a friend that way. If someone you cared about came to you hurting, you'd be gentle with them without even thinking about it.`,
          `So today you're not going to try to fix anything, or feel any particular way. You're just going to do that gentle thing — but pointed in a slightly different direction. A friend has just messaged you. They slipped too, after doing really well for a long time. They feel awful about it. Read what they wrote.`,
          `Then write back to them. Don't perform, and don't lecture. Just say what's true and kind, the way you naturally would for someone you care about who's having a hard night. Take your time with it.`,
          `When you're done, we'll do one small thing with what you wrote. That small thing is the whole point of today.`,
        ],
        mechanic: 'reclaim_chair_flip',
        mechanicProps: {
          friendMessage: `Hey… I messed up last night. I was clean for three months and I threw it away. I feel like such a fraud. I don't even know why I'm telling you this.`,
        },
        closingLine: `Those were your words.\nThey were always meant for you too.`,
        rationale: [
          `There's a simple, well-studied reason this works. We are almost always kinder, calmer, and clearer when we're giving advice to someone else than when we're talking to ourselves. The exact same problem feels lighter and more solvable when it belongs to a friend. Researchers call this "self-distancing," and it's one of the most reliable ways there is to quiet a storm of hard feelings.`,
          `When you wrote to your "friend," you were really writing to yourself. You probably knew that, somewhere, the whole time. You just took out all the cruelty you'd normally aim inward — and what was left was the honest, caring voice underneath. That's the voice that's always been there for other people. Today you turned it toward you.`,
          `And here's why that's not just a nice feeling: the kind voice is the one that actually keeps you going. The cruel voice doesn't make you stronger — it makes the next slip more likely, because shame and self-attack wear a person down. Learning to talk to yourself like someone worth helping isn't soft. It's one of the most practical recovery skills there is.`,
        ],
      },
      {
        day: 2,
        arrivalTitle: 'In your own name.',
        arrivalSubtitle: 'Tell the story like it happened to someone you know.',
        artifactType: 'reclaim_chair_d2',
        intro: [
          `Yesterday you spoke to a friend. Today you're going to do something that sounds a little odd at first — but stick with it, because it has a real effect.`,
          `Tell the story of your own slip. But instead of saying "I," use your own name, as if you're talking about someone else. So it comes out like: "Sam had a hard day on Tuesday. By the evening they were worn down, and…" — but with your name in place of Sam's.`,
          `Walk through it for a few lines. What was the day like for that person? What were they carrying? How did it happen? Tell it plainly and fairly, the way you'd describe what happened to someone you know and care about — not a criminal, just a human being who was struggling.`,
          `Using your name instead of "I" will feel strange, and maybe a little stiff. That's not a mistake. That little bit of strangeness is exactly the thing doing the work.`,
        ],
        mechanic: 'reclaim_write',
        mechanicProps: {
          prompt: `Tell the story of your slip using your name, not "I".`,
          placeholder: `[Your name] slipped on…`,
        },
        closingLine: `You looked at it from one step back.\nFrom there, it's easier to be fair.`,
        rationale: [
          `This is a small trick with a surprisingly big effect, and it's been tested carefully. When people describe a painful moment using their own name instead of "I," they calm down faster and judge themselves less harshly. Something about that one-word swap puts a little space between you and the raw feeling.`,
          `From inside "I," the slip is happening to you — it's huge, it's personal, it presses right up against your face. From a step back, looking at a person with a name, the same event gets smaller and clearer. You can finally see the whole situation around it, instead of only the pain of it.`,
          `And from that small distance, something fairer becomes possible. You start to see the slip as one event in a long and complicated life — not as the final proof of who that person is. You'd offer that fairness to anyone else without a second thought. Today you practiced offering it to yourself.`,
        ],
      },
      {
        day: 3,
        arrivalTitle: 'One year from now.',
        arrivalSubtitle: 'Let the future you say something back.',
        artifactType: 'reclaim_chair_d3',
        intro: [
          `Picture yourself one year from today. Not a perfect, magazine version — just you, twelve months on, having kept going. Some things are different. Some are steadier. The slip that feels so loud right now is a long way behind you.`,
          `That version of you — the one who's a year down the road — knows something you can't quite feel today. They know how this week turned out. They know whether it mattered as much as it seems to right now. And they remember exactly what this hard moment felt like, because they lived through it themselves.`,
          `So let them speak. Write a short note from that future you, looking back at this exact week — the slip, this heavy feeling, all of it. What do they want you to know right now? What would they tell you, gently, if they could reach back and put a hand on your shoulder?`,
          `Keep it short, and keep it honest. A few real lines will mean more than a long speech.`,
        ],
        mechanic: 'reclaim_write',
        mechanicProps: {
          prompt: `Write a short note from yourself one year ahead, to yourself today.`,
          placeholder: `Hey — it's me, a year on…`,
        },
        closingLine: `The future you isn't angry about this week.\nThey're just glad you kept going.`,
        rationale: [
          `When a slip happens, this week swells up and fills the whole sky. It feels enormous, like it changes everything. But time has a way of shrinking things back down to their real size. A year from now, one bad night is a small dot far back on the road — not the whole picture, just a single point on a long line.`,
          `The catch is that knowing this and feeling it are two different things. Someone else telling you "it'll be okay" tends to bounce right off, because they're standing outside it. But when the reassurance comes from you — from a version of you who actually made it through — it lands differently. You trust yourself in a way you simply can't trust a stranger's comfort.`,
          `This is also why looking ahead calms people down. Reaching toward a steadier future self, even just in your imagination for a minute, quietly lowers the panic of the present. You weren't only writing a note today. You were proving to yourself that there is a "later" — and that it's worth walking toward.`,
        ],
      },
      {
        day: 4,
        arrivalTitle: 'The two voices.',
        arrivalSubtitle: 'Catch the cruel one. Answer it kindly.',
        artifactType: 'reclaim_chair_d4',
        intro: [
          `After a slip, there are usually two voices inside, talking at once. One is cruel. It says things like "you failed again," "you always do this," "what's even the point." It's loud, and it feels like it's telling you the plain truth.`,
          `The other voice is the kind one — the same one you used when you wrote to your friend. It's quieter, but it's fairer, and it's the one that actually helps. Today you're going to put these two voices side by side, and let the kind one answer back.`,
          `First, write down exactly what the cruel voice is saying to you right now. Don't clean it up or soften it. Get the real, harsh words out onto the screen where you can see them. There's something about seeing them written down that already starts to take the edge off.`,
          `Then, underneath, answer it — in the kind voice. Say back to that cruel line whatever a good friend would say if they'd heard it out loud. You don't have to win the argument. You just have to answer.`,
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
          `The cruel voice feels like the plain truth, but it isn't. It's a habit — a worn groove your mind slides into, especially when you're already down. And like any habit, it only stays strong as long as you obey it without question. The moment you start answering it, it begins to lose its grip.`,
          `That's what you just practiced: catching the harsh thought, and then meeting it with a fairer, kinder one. The kinder thought doesn't have to be cheerful or fake — it just has to be more honest than the cruel one. Most of the time, the cruel voice is exaggerating, and simply telling the truth back to it is enough.`,
          `Do this enough times and something quietly shifts. You're training a new groove. The kind voice, which used to be faint and easy to drown out, slowly gets stronger and starts showing up on its own. You're not just feeling a bit better today — you're teaching yourself how to be on your own side.`,
        ],
      },
      matchedStep('reclaim_chair_d5'),
    ],
  },

]

// Modules that are live and can be shown (in display order).
export const RECLAIM_MODULE_POOL = ['spiral', 'setdown', 'chair']

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