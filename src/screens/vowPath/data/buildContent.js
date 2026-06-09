// =====================================================================
// BUILD STAGE CONTENT (URICA Maintenance)
// =====================================================================
// 9 weekly entries across weeks 1-9 of a ~12-week window.
// Each entry has: framing prose + Activity A (weekly) + Activity B (weekly)
// + Activity C (daily, optional) + Notes (optional).
// Saves into vow_artifacts with stage='build' and day_number = entry index.
// =====================================================================

export const BUILD_TOTAL_DAYS = 9

export const BUILD_PHASES = [
  { key: 'arriving', title: 'Arriving', subtitle: 'Settling into the quiet.', dayRange: [1, 3] },
  { key: 'constructing', title: 'Constructing', subtitle: 'Who you are when no one is watching.', dayRange: [4, 6] },
  { key: 'horizon', title: 'Horizon', subtitle: 'The longer view.', dayRange: [7, 9] },
]

// =====================================================================
// SHARED VOCABULARY
// =====================================================================

const TEXTURES_12 = [
  'still', 'restless', 'heavy', 'light',
  'watchful', 'dull', 'slow', 'alert',
  'sharp', 'warm', 'brittle', 'vacant',
]

const TENANTS_12 = [
  'Work', 'Food', 'The phone', 'Social media',
  'Exercise', 'A relationship', 'Sleep', 'News',
  'Shopping', 'Gaming', 'Silence/withdrawal', 'Walking',
]

const LADDER_POSITIONS_5 = [
  'Knew before I did',
  'Knows fully',
  'Half-knows',
  "Doesn't know yet",
  "I don't want them to know yet",
]

// =====================================================================
// BUILD DAYS
// =====================================================================

export const BUILD_DAYS = [

  // ===================================================================
  // ENTRY 1 — The Boredom of Being Okay
  // ===================================================================
  {
    day: 1,
    dailyActivities: [
      { day: 1, glyph: 'cup', title: 'One warm thing, slowly', body: `Make something warm to drink and drink it doing nothing else — no phone, no screen. Notice the heat, the smell, the first sip. Stay until it's gone. You're not relaxing; you're teaching a dulled system to register a small, real pleasure again.` },
      { day: 2, glyph: 'walk', title: 'A walk your body can feel', body: `Walk ten minutes with no destination and no podcast. Pay attention to your feet, your breath, the air on your skin. When your mind reaches for the to-do list, come back to the body. Movement is one of the first pleasures the system relearns.` },
      { day: 3, glyph: 'music', title: 'A song, eyes closed', body: `Play one song you loved before — foreground, not background. Sit, close your eyes, do nothing but listen, the whole way through. Notice if anything moves in you, even faintly. Music routes straight to the reward system; it's often where feeling flickers back first.` },
      { day: 4, glyph: 'plant', title: 'Fifteen minutes with your hands', body: `Make or fix or tend something for fifteen minutes — cook slowly, sketch, repair, plant. Not for the outcome; for the doing. Using your hands on something real, with attention, is the whole mechanism: the act comes first, and the small satisfaction follows it.` },
      { day: 5, glyph: 'sun', title: 'Ten minutes of outside', body: `Go outside and find one living thing to actually look at — a tree, a bird, the sky changing. No phone in your hand. Let your eyes rest on it. Plain attention to the living world lowers the static and lets ordinary pleasures land.` },
      { day: 6, glyph: 'tether', title: 'One unhurried exchange', body: `Have one small, unhurried moment with a person today — a real hello with a neighbour, a few minutes with someone you live with, phone face-down. Not a task, not a text. Connection is a primary reward; one warm exchange does more than a flat day suggests.` },
      { day: 7, glyph: 'spark', title: 'Something to look forward to', body: `Before sleep, plan one small good thing for tomorrow and let yourself anticipate it — a coffee somewhere, a walk, a call. Anticipation is its own circuit, and the substance hijacked it for years. Tonight you give it something ordinary and real to point at.` },
    ],
    offlinePractice: {
      id: 'w1',
      archetype: 'watch',
      title: `One ordinary good thing, fully felt`,
      action: `Each day, do one small ordinary pleasant thing — a coffee outside, a walk, a hot shower, a song — with your full attention. No phone, no second screen, no doing-something-else at the same time. The point is not the thing. It is relearning to feel a small reward.`,
      why: `Savouring an ordinary pleasure retrains a flattened, post-acute reward system to register small natural rewards again. This is the front line of getting feeling back.`,
    },
    arrivalTitle: 'The Boredom of Being Okay',
    arrivalSubtitle: "You've come through the loud part.",
    artifactType: 'build_entry_1',
    intro: [
      "You've come through the loud part.",
      "For weeks now, the work has been visibly hard. You stopped. You felt it. You sat with the crashes and the cravings and the flat days and the days when you weren't sure if anything you were doing was working. You did them anyway. You arrived here.",
      "Build is the stage that follows. The work doesn't stop, but the shape of the work changes. The dramatic phase is over. The phase you're entering is quieter, slower, and — for many people — surprisingly hard in a way the loud part wasn't.",
      "This is the stage most people quietly drop off. Not from crisis. From anticlimax.",
      "The body, which was running emergency systems through Endure, is starting to power down to baseline. The mind, which had a clear target — the substance, the days, the count — doesn't have one anymore. The friends and family who were watching closely have softened their attention now that you're \"fine.\" The version of you that was, however briefly, a person in recovery, is starting to become a person who used to use. The drama is leaving the room.",
      "What replaces it, at first, is a strange kind of nothing. Not unhappiness, exactly. Not boredom in the bad sense. More like: the room has gone quiet, and you don't yet know what to do in a quiet room. You catch yourself looking for something to manage. You don't find one. You don't feel proud. You don't feel triumphant. You feel, mostly, like you woke up.",
      "This is the actual texture of being okay. It is much quieter than the recovery literature has prepared you for.",
      "The thing to do here is to stay. Not to manufacture more drama. Not to start looking for a new battle to fight. Not to assume the quiet means you've stopped doing the work.",
      "The quiet is the work.",
      "The work, in Build, is to learn how to be in a life that no longer requires emergency management. Most people have never lived in one. The substance, before it became a problem, was often the first answer to how to be okay — how to make a Tuesday afternoon tolerable, how to occupy your evenings, how to feel like something was happening. Without it, the Tuesday afternoons are just Tuesday afternoons. The evenings are just evenings.",
      "It takes time to learn what to do with them.",
      "This first entry, then, is just to mark the threshold. You're not going to do dramatic work this week. You're going to notice what okay actually feels like, before it shifts — and it will shift, because you're still recalibrating — and you're going to leave a small record of it. Two markings, that's all. Future entries will come back to this one. What you mark now will be readable to you in a month, and in three.",
      "The version of you that's here, at the start of Build, is the version we're going to spend the next three months listening to.",
    ],
    mechanic: 'build_weekly_entry',
    mechanicProps: {
      weekLabel: 'Week 1',
      activityA: {
        type: 'position_map_2d',
        title: 'Position this week',
        prompt: 'Where does this week sit? Tap one point on the map.',
        axisX: { left: 'Empty', right: 'Full' },
        axisY: { top: 'Settled', bottom: 'Anxious' },
      },
      activityB: {
        type: 'texture_multi_pick',
        title: 'Pick three textures',
        prompt: 'Which three come closest to the inside of this week?',
        options: TEXTURES_12,
        exactCount: 3,
      },
      activityC: {
        type: 'day_timeline_pick',
        title: 'Tap when',
        prompt: 'When today did you feel most awake?',
        options: ['Dawn', 'Morning', 'Midday', 'Afternoon', 'Evening', 'Night'],
        skipLabel: 'No clear peak today',
      },
      notes: {
        placeholder: "This one's worth a sentence — future entries will come back to it. Skip if you'd rather not.",
      },
    },
    closingLine: 'The threshold is marked. The version of you who began is now in the record.',
  },

  // ===================================================================
  // ENTRY 2 — The Replacement Question
  // ===================================================================
  {
    day: 2,
    dailyActivities: [
      { day: 1, glyph: 'catch', title: `Notice one urge`, body: `Pick the thing you reach for out of habit now — your phone, snacks, work. Today, catch yourself once just before you reach for it, and stop for a few seconds. You don't have to stop doing it. Just notice you were about to.` },
      { day: 2, glyph: 'watch', title: `Time it once`, body: `Today, when you do that habit — scrolling, snacking, whatever it is — notice how long it lasts. Five minutes? An hour? Just check the time before and after. You're not changing anything yet. You only want to see how big it is.` },
      { day: 3, glyph: 'pause', title: `Wait ten minutes`, body: `Next time you feel the pull to reach for it today, wait ten minutes first. Set a timer. After ten minutes, do it if you still want to. Often the urge fades on its own. Either way, you waited — that's the win.` },
      { day: 4, glyph: 'swap', title: `Swap it for something better`, body: `Pick one moment today you'd usually fill with that habit, and do something better instead — a short walk, a quick call, a few pages of a book. Just once today. See how it feels to fill that moment a different way.` },
      { day: 5, glyph: 'shed', title: `Put it away for an hour`, body: `For one hour today, put the thing out of reach — phone in another room, snacks off the table. Notice what you feel without it there. It's only an hour. You're just seeing what comes up when it's not easy to grab.` },
      { day: 6, glyph: 'say', title: `Ask what you really want`, body: `Each time you reach for the habit today, ask yourself one question: what do I actually want right now? Maybe you're tired, bored, lonely, or stressed. Name the real thing. Often it isn't the snack or the phone you needed.` },
      { day: 7, glyph: 'sun', title: `Sit with nothing for a bit`, body: `Give yourself one hour today with nothing to fill it — no phone, no snacks, no busywork. Just sit, even if you feel a bit bored. Being okay with some boredom is a skill worth getting back. Try it once today.` },
    ],
    offlinePractice: {
      id: 'w2',
      archetype: 'catch',
      title: `Catch the reach`,
      action: `Each day, catch yourself once in the act of reaching for the new tenant — the phone, the snack, the extra hour of work, the scroll. Pause. Name the job it is doing for you. Then choose: continue on purpose, or put it down and do something else.`,
      why: `Catching the substitute behaviour in real time is what keeps a harmless replacement from quietly hardening into the next compulsion.`,
    },
    arrivalTitle: 'The Replacement Question',
    arrivalSubtitle: 'Something is now doing the job.',
    artifactType: 'build_entry_2',
    intro: [
      "Last week you marked where you're standing. This week we look at what's holding you up.",
      "The substance was doing a job. Sleep, social ease, time-marking, permission to feel something, permission to feel less, the cheap version of intimacy with a particular friend, an end-of-day ritual, the only acceptable form of stepping away from your own life for an hour — whatever it was, the substance was performing a function. You may have named that function already. You may not have. Either way, the function did not disappear when you stopped using.",
      "Something is now doing the job in its place.",
      "This is the thing most people don't audit. They quit the substance, they get through the loud weeks, they arrive in Build, and they don't notice that a new tenant has quietly moved into the role the substance used to occupy. Sometimes the new tenant is benign — sleep, exercise, a real friendship, a creative practice. Sometimes the new tenant is another addiction in slow motion — work, the phone, food, the gym pushed too far, a relationship being asked to do too much, news, shopping, gaming, the news again.",
      "You're probably not in crisis with the new tenant. That's why it's hard to see. The function is being met, the days are passing, you're \"fine.\" This is exactly the conditions under which a future problem assembles itself, in the same room where the last one did.",
      "The substance left, but the open role stayed open. Look at who's working it now.",
      "This audit isn't a moral one. The point isn't to find a replacement and feel bad about it. The point is to know what's currently doing the work, so that you can decide — eventually, not this week — whether to keep the arrangement, modify it, or build something more deliberate to fill the role.",
      "A few honest questions: in the last week, what did you reach for when you were uncomfortable? Where did your attention go when you weren't being watched? What did you do at the hour you used to use? What activity did you do for longer than you intended, and felt slightly worse after?",
      "The answer is the current tenant.",
      "Some weeks the tenant is healthy. Some weeks it's another version of the same room. Most of the time it's a mix — one part of the function being well-met, another part being met by something you wouldn't have endorsed if you'd been watching.",
      "Mark what you see. You don't have to do anything about it yet.",
    ],
    mechanic: 'build_weekly_entry',
    mechanicProps: {
      weekLabel: 'Week 2',
      activityA: {
        type: 'chip_multi_pick',
        title: 'Tenant inventory',
        prompt: 'Which of these have moved into the role the substance used to occupy? Pick all that have shown up this week.',
        options: TENANTS_12,
        min: 1, max: 5, columns: 2,
      },
      activityB: {
        type: 'single_select',
        title: 'Arrangement assessment',
        prompt: "Looking at what you've named, how does the current arrangement sit with you?",
        options: ['Working well', 'Hidden trade-off', 'Familiar pattern', 'Mixed', 'Too early to tell'],
      },
      activityC: {
        type: 'pair_pick',
        title: 'After the reach',
        prompt: 'When you reached for something today, what was it — and how did it leave you?',
        columnA: {
          title: 'What',
          options: ['Phone', 'Food', 'Work', 'Sleep', 'Movement', 'A person', 'Silence/nothing', 'Something else'],
        },
        columnB: {
          title: 'And how it left you',
          options: ['Helped', 'Neutral', 'Cost something'],
        },
        skipLabel: "Didn't reach today",
      },
      notes: { placeholder: 'Anything you want to add in your own words? Skip if not.' },
    },
    closingLine: "You've named the new tenant. That's enough for this week.",
  },

  // ===================================================================
  // ENTRY 3 — What You Forgot You Wanted
  // ===================================================================
  {
    day: 3,
    dailyActivities: [
      { day: 1, glyph: 'plant', title: `Try an old hobby again`, body: `Think of something you enjoyed before — an instrument, drawing, a game, anything. Spend ten minutes on it today. Don't worry about being good. Just start. The fun comes back slowly once you actually do the thing again.` },
      { day: 2, glyph: 'book', title: `Read for fifteen minutes`, body: `Read something you like for fifteen minutes today — a book, a comic, a magazine. Not the news, not your phone feed. Something you'd pick for fun. It's a calm, simple pleasure that's easy to forget you enjoy.` },
      { day: 3, glyph: 'watch', title: `Follow something you wonder about`, body: `Notice one thing today that makes you curious — a topic, a place, how something works — and spend ten minutes on it. Look it up, watch a video, learn one fact. Being curious again is a good sign. Feed it.` },
      { day: 4, glyph: 'walk', title: `Move because it feels good`, body: `Do some movement today just because it feels nice, not for exercise — a walk, dancing in your kitchen, a stretch. No goal, no counting. Your body can be a simple source of good feeling. Let it be that today.` },
      { day: 5, glyph: 'cup', title: `Eat something slowly`, body: `Pick one thing you eat today and eat it slowly, with no phone or TV — a meal, some fruit, anything you like. Notice how it tastes. Enjoying food properly is a small, easy pleasure that's simple to get back.` },
      { day: 6, glyph: 'tether', title: `See someone you like`, body: `Make a plan with someone whose company you enjoy — not because you have to, just because you like them. A coffee, a walk, an hour together. Good company is one of the best simple pleasures there is.` },
      { day: 7, glyph: 'spark', title: `Notice something you want`, body: `At the end of today, think of one thing you'd like — big or small. A trip, a skill, a kind of day. You don't have to do anything about it yet. Just notice you're starting to want things again.` },
    ],
    offlinePractice: {
      id: 'w3',
      archetype: 'plant',
      title: `Re-approach one old want`,
      action: `Each day, take one small, concrete step toward something you wanted before the substance — ten minutes of the instrument, a sketch, a real meal cooked slowly, an old book, the plan you kept postponing. Small and real beats ambitious and skipped.`,
      why: `Behavioural activation toward previously-valued activities is the most direct route back to natural reward and an identity that is not organised around the substance.`,
    },
    arrivalTitle: 'What You Forgot You Wanted',
    arrivalSubtitle: 'Slowly, the things you wanted before start coming back.',
    artifactType: 'build_entry_3',
    intro: [
      "The substance, while it was running, was doing a job that included this one: keeping you focused on the substance. Whatever else you wanted before it took over, you wanted less of, by the end. You may not remember exactly when that happened, but it happened.",
      "Once the substance is out, slowly, the things you wanted before start coming back. Not all at once. Not as fully formed desires. More like signals — faint, easy to miss, surprising when you notice them.",
      "You walk past a music store and notice you want to play guitar again. You haven't picked one up in years. You forgot you wanted to.",
      "You see someone making something with their hands and feel a small pang. You used to make things. You forgot.",
      "You read a sentence somewhere and want to write something for the first time in a long time. You forgot you used to do that, in fact, before everything else.",
      "This is the work of Build's third week. Not to pick up everything you ever wanted. Not to make a list of regrets. Just to notice what's returning, before it gets dismissed.",
      "The danger here is moving too quickly. The signal that returns isn't always something you should immediately act on. Some of what you used to want was specific to a younger you, and you've outgrown it without realizing. Some of what you used to want is exactly what you'd want again. Some of what you \"used to want\" was someone else's expectation, and you can let it go. The work, in this week, is to sit with what comes up without acting on it.",
      "What returns will surprise you. It will surprise you because the substance era was effective at suppression — not just of the obvious things (joy, intimacy) but of the small specific preferences. Your tastes were dimmed. Now they're brightening again.",
      "The substance took your tastes before it took your time. Now it's giving them back.",
      "Catch them as they brighten. Not all of them deserve to become a new project. Some of them just deserve to be noticed.",
      "Some questions to sit with this week: in the past two weeks, what have you noticed yourself wanting that surprised you? What have you walked past that triggered a faint pull? What activity, when you think about it now, makes you slightly sad that you stopped?",
      "You don't have to do anything about any of this yet. The week is about noticing. The doing comes later, if at all.",
    ],
    mechanic: 'build_weekly_entry',
    mechanicProps: {
      weekLabel: 'Week 3',
      activityA: {
        type: 'chip_multi_pick',
        title: 'Catalog of returning',
        prompt: "What's surfacing? Pick what's started coming back, even faintly.",
        options: [
          'A creative practice (writing, music, art, making)',
          'A physical activity (sport, dance, swimming, something you used to do)',
          'A type of connection (a specific person, a kind of friendship)',
          'A subject you used to be curious about',
          'A place you want to return to',
          'A taste or food you forgot you liked',
          'A way of dressing or presenting yourself',
          'A skill you let lapse',
          'A contemplative or spiritual interest',
          'Something else',
        ],
        min: 1, max: 3, columns: 1,
      },
      activityB: {
        type: 'single_select',
        title: 'The shape of the strongest pull',
        prompt: 'Think of the one that surprised you most. What is the quality of the pull right now?',
        options: [
          'A clear pull',
          'A faint signal',
          'A complicated yes',
          'A surprise to even notice',
          'A want that might already be passing',
        ],
      },
      activityC: {
        type: 'daily_single_select',
        title: "Today's photograph",
        prompt: 'Was there a moment like one of these today?',
        options: [
          'The way light moved through a window',
          'A particular kind of silence',
          'A song that pulled',
          'A face that opened',
          'A taste returning',
          'A small refusal that fit',
          'The air before rain',
        ],
        skipLabel: 'Nothing like this today',
      },
      notes: { placeholder: 'Anything you want to add in your own words? Skip if not.' },
    },
    closingLine: "Note what surfaced. Don't act on it yet — just keep it where you can see it.",
  },

  // ===================================================================
  // ENTRY 4 — The Quiet Self
  // ===================================================================
  {
    day: 4,
    dailyActivities: [
      { day: 1, glyph: 'say', title: `Be honest when you could lie`, body: `Today, do one honest thing even when you could easily get away with not — give back extra change, admit a small mistake, tell a small truth you could have hidden. No one will know but you. That's the whole point.` },
      { day: 2, glyph: 'check', title: `Keep a small promise to yourself`, body: `This morning, promise yourself one small thing you'll do today — then actually do it before bed. It can be tiny. Keeping a promise to yourself, even a small one, slowly teaches you to trust your own word again.` },
      { day: 3, glyph: 'watch', title: `Spend an hour as yourself`, body: `Spend one hour alone today with no phone and no need to look good for anyone — no posting, no scrolling. Just be by yourself, doing whatever. Notice what you're actually like when no one is watching.` },
      { day: 4, glyph: 'document', title: `Do the hidden part well`, body: `Pick one task today and do the part no one will ever check — properly anyway. The bit you could skip, the corner, the double-check. Doing good work that nobody sees is a quiet way of respecting yourself.` },
      { day: 5, glyph: 'shed', title: `Drop the act once`, body: `Notice a moment today where you're putting on a version of yourself — the 'I'm fine' act, the impressive one. Just once, drop it. Say the honest thing, or stop pretending. See how it feels to be real for a second.` },
      { day: 6, glyph: 'tether', title: `Match your words and actions`, body: `Find one thing today where what you say and what you do don't quite match — and fix it in a small way. Do the thing you said you'd do, or stop saying it. Lining up words and actions is all integrity really is.` },
      { day: 7, glyph: 'map', title: `Write down a rule you live by`, body: `Think of one rule you hold yourself to that nobody made you follow — like how you treat people, or something you just won't do. Write it down in one line. These self-made rules are the real you, underneath everything.` },
    ],
    offlinePractice: {
      id: 'w4',
      archetype: 'say',
      title: `One thing done right when no one would know`,
      action: `Each day, do one small thing the honest way precisely when you could get away with not — keep a promise you made only to yourself, return the extra change, tell the small truth you could have dodged, do the unseen part of a job properly, leave uncut the corner no one would ever check.`,
      why: `The quiet self is built from the choices no one audits. Addiction runs on a widening gap between the public self and the secret one; closing that gap through small, unwitnessed acts of integrity is how self-trust — and a self you recognise — gets rebuilt.`,
    },
    arrivalTitle: 'The Quiet Self',
    arrivalSubtitle: "Find what's underneath the performance.",
    artifactType: 'build_entry_4',
    intro: [
      "You have been, for some time now, \"a person in recovery.\" It was a useful identity. It gave shape to the work of Endure when shape was hard to find. It told other people how to be with you. It told you how to be with yourself. It made the long hard middle of stopping legible.",
      "It is also a temporary identity by design.",
      "Maintenance is the stage where \"person in recovery\" should start, slowly, to recede. Not because recovery is finished — recovery is never finished — but because identifying primarily as someone-who-quit is a stage of the work, not its destination. At some point, your relationship with the substance becomes one fact about you, alongside many other facts about you, and not the central one. The substance becomes the past, not the present-defining condition.",
      "Most people skip this part.",
      "They stay \"in recovery\" for years longer than they need to, because the alternative is unclear. Recovered Person is a legible identity. The next identity isn't given. It has to be constructed, slowly, from materials you might not yet recognize.",
      "There's a fear here, often unsaid: that the moment you stop performing recovery, the substance returns. The fear is real, but it's misdirected. The substance doesn't return from quietly being a normal person again. It returns from neglecting the maintenance work itself. You can do the maintenance — which is mostly inner — without organizing your public identity around it. People at five years sober don't introduce themselves as \"in recovery.\" They introduce themselves as themselves. The recovery is the foundation. The life is what's built on it.",
      "This week is about noticing who you are when you stop performing.",
      "Not the substance-self — that one's gone, mostly, and the version of you it suppressed is starting to return. Not the recovery-self — that's the identity you've been wearing through Endure. Not the future-self you might become if everything goes well. Just the version of you that exists in the next quiet hour. The one sitting in your apartment. The one walking to the corner. The one reading this entry.",
      "Recovery was a temporary residence. The work now is to find out where you actually live.",
      "This is harder than it sounds. Identity, for most people, is a thing they perform to others. You learn early which version of yourself gets approval, and you become that version, and over time you confuse the performance for the person. The substance was, among other things, a way to dissolve the performance for a few hours. Recovery, for many people, becomes a different kind of performance.",
      "The quiet self is what's underneath both.",
      "Some questions to live with this week: when you're alone, with no one to talk to and no phone to scroll, who is there? When you're not telling anyone about your week, what does the week feel like? When you describe yourself to a new person, do you say \"in recovery\" — and if so, do you mean it, or is it just the easiest sentence?",
      "You don't have to abandon \"in recovery\" if it still serves you. The work isn't to drop the identity. It's to find out what's underneath it.",
      "That underneath is the quiet self.",
    ],
    mechanic: 'build_weekly_entry',
    mechanicProps: {
      weekLabel: 'Week 4',
      activityA: {
        type: 'single_select',
        title: 'Identity statement',
        prompt: '"I am someone who…" — pick the line that comes closest to true right now.',
        options: [
          'notices small things',
          "listens for what's underneath",
          'waits before deciding',
          'walks without a phone',
          'reads in the morning',
          'watches the room before joining',
          'asks before reacting',
          'waits for the right hour',
          'listens for the long pauses',
          "notices what's left unsaid",
          "walks toward what's quieter",
          'makes things with their hands',
        ],
      },
      activityB: {
        type: 'chip_multi_pick',
        title: 'What you no longer claim',
        prompt: "Identities you're ready to set down, even just a little.",
        options: [
          'The fun one',
          'The functional user',
          'The one who can stop whenever',
          'The one nobody worries about',
          'The survivor',
          'The one who has it all together',
          "The one who's always available",
          'The hard worker who deserves it',
        ],
        min: 1, max: 3, columns: 1,
      },
      activityC: {
        type: 'daily_single_select',
        title: "Today's loudest self",
        prompt: 'Which version of you was loudest today?',
        options: [
          'The one who works',
          'The one who performs',
          'The one who watches',
          'The one who waits',
          'The one who hopes',
          'The quiet one',
        ],
        skipLabel: "Couldn't tell today",
      },
      notes: { placeholder: 'Anything you want to add in your own words? Skip if not.' },
    },
    closingLine: 'Whoever was loudest today is also yours. Note them.',
  },

  // ===================================================================
  // ENTRY 5 — The Inheritance
  // ===================================================================
  {
    day: 5,
    dailyActivities: [
      { day: 1, glyph: 'give', title: `Help someone having a hard time`, body: `Find one person today who's struggling and help them in a small way — listen, ask how they really are, or just be there. You understand hard times better than most people. Use that today to be kind to someone.` },
      { day: 2, glyph: 'pause', title: `Sit with a hard feeling`, body: `When something uncomfortable comes up today — boredom, stress, a low mood — try to stay with it for a minute instead of escaping it. You've handled worse before. You can sit with this. Just a minute longer than usual.` },
      { day: 3, glyph: 'watch', title: `Catch a feeling early`, body: `Today, try to notice a feeling as soon as it starts — restless, uneasy, off — before it grows. Just name it to yourself: 'I'm feeling restless.' Catching feelings early makes them easier to handle. You're good at this.` },
      { day: 4, glyph: 'map', title: `Sort out one small problem`, body: `Pick one small problem today you'd usually avoid or ask someone else to handle — and sort it out yourself. You're more capable than you give yourself credit for. Use that on one small thing today.` },
      { day: 5, glyph: 'say', title: `Say what you really think`, body: `Once today, say what you honestly think instead of what's easy — kindly, but clearly. You can usually see what's really going on. It's okay to say one honest thing out loud today.` },
      { day: 6, glyph: 'tether', title: `Message an old friend`, body: `Think of one good friend from your past — someone the friendship was real with. Send them a message or give them a call today. Good friendships can last even when a lot has changed. Reach out to one.` },
      { day: 7, glyph: 'document', title: `Write down one good thing you kept`, body: `Tonight, write down one good thing those hard years gave you — patience, understanding, strength, anything. Not all of that time was wasted. Naming one good thing you came away with makes it easier to carry.` },
    ],
    offlinePractice: {
      id: 'w5',
      archetype: 'document',
      title: `Spend one thing the years taught you`,
      action: `Each day, find one real moment to use a capacity the using years gave you — the hard-won empathy for someone struggling, the resourcefulness, the bluntness about what actually matters, the ability to sit inside discomfort without bolting. Do not just note it. Deploy it, on someone or something real.`,
      why: `Meaning-making becomes durable only when the inheritance is enacted rather than merely acknowledged. Using what the years taught you turns lost time into carried capital.`,
    },
    arrivalTitle: 'The Inheritance',
    arrivalSubtitle: 'Not all of it was loss.',
    artifactType: 'build_entry_5',
    intro: [
      "There's a version of the recovery story that frames the substance years as pure loss — years spent in a hole, years to be written off, time you'd rather forget. There's truth to this version. But it isn't the whole story, and treating it as the whole story makes the rest of Maintenance harder than it needs to be.",
      "The truth is that the substance years also gave you things.",
      "Some of them are skills. The substance taught you how to manage a state you didn't want to feel. That's a skill, even if the application was harmful. It means you know — better than most people — how to recognize the feeling of unease before it has words, how to identify when something is asking to be medicated, when the room is the room and you're in it. Most people have to learn these things in their forties. You learned them earlier.",
      "Some of them are friendships. Not all of your using-era friendships were transactions. Some of them were real, with a substance substrate that didn't determine the friendship — just provided the table. You can keep these. The substrate is gone; the friendship can still hold up.",
      "Some of them are forms of empathy. You know what it's like to live with a hidden problem. You can spot it in other people. You can be useful to them in ways someone without this history couldn't. This isn't redemption logic. It's just a fact about what you've come to understand.",
      "And some of them are tastes — the particular books you read at three in the morning, the specific music that worked, the kind of conversation you preferred when nothing was performing — these are yours, too. The substance era wasn't only the substance. You were there, and the things you encountered shaped you.",
      "This is the inheritance. Not all of it serves you forward, and we'll get to that. But some of it does.",
      "The substance years weren't only loss. The inheritance is real.",
      "The other side of the inheritance is what to leave behind. The language of rationalization (\"I deserve this,\" \"just one,\" \"I'll quit after the wedding\"). The fluency you got in self-deception. The friendships that only ever worked because of the table. Certain places that had only one purpose. Certain hours of certain days that only ever meant one thing.",
      "You can sort through this slowly. Some things you'll think you're keeping that you'll later realize you're carrying out of habit. Some things you'll think you've left behind that you'll find yourself reaching for again. The audit isn't a single decision; it's a posture you take toward your own past.",
      "And there's something else to do this week.",
      "Four weeks ago, in Entry 1, you marked the inside of that first week. A position on a map. Three textures. A version of you at the start of Build.",
      "That marking is now in front of you again. Sit with it before you mark this week. Not to judge whether the earlier version of you was right. Just to notice the distance. Some weeks the distance will be large. Some weeks it won't. The noticing — the discipline of looking at where you were before you mark where you are — is what this entry is for.",
      "The version of you who wrote Entry 1 is gone, mostly. Mark again.",
    ],
    mechanic: 'build_weekly_entry',
    mechanicProps: {
      weekLabel: 'Week 5',
      retrieveFrom: [1],
      activityA: {
        type: 'combined_mark',
        title: 'Mark again',
        prompt: 'Position and textures, same as Week 1. Mark fresh.',
        positionConfig: {
          subtitle: 'Where does this week sit?',
          axisX: { left: 'Empty', right: 'Full' },
          axisY: { top: 'Settled', bottom: 'Anxious' },
        },
        textureConfig: {
          subtitle: 'Three textures that come closest to the inside of this week.',
          options: TEXTURES_12,
          exactCount: 3,
        },
      },
      activityB: {
        type: 'pair_sequential',
        title: 'The two choices',
        prompt: 'Carry forward, leave behind.',
        step1: {
          title: "The most valuable thing you're carrying forward",
          options: [
            'A particular kind of self-honesty',
            'Empathy for hidden struggle',
            'Knowing how to be alone',
            'Pattern recognition in self and others',
            'A specific friendship from those years',
            'A particular kind of attention',
            'A creative practice that started then',
            'Resilience under low expectations',
          ],
        },
        step2: {
          title: "The heaviest thing you're leaving behind",
          options: [
            'The language of rationalization',
            'A friendship that only worked with the substance',
            'A particular hour of the week that meant one thing',
            'The identity of "the one who used"',
            "A place I don't need to go back to",
            'The voice that says "I deserve this"',
            'A particular kind of self-pity',
            'The stories I told to explain it',
          ],
        },
      },
      activityC: {
        type: 'two_step_branching',
        title: "Today's inheritance mark",
        prompt: 'Carried something forward, or released something.',
        step1: {
          title: 'Today I…',
          options: ['Carried something forward', 'Released something'],
        },
        step2By: {
          'Carried something forward': {
            title: 'What was it?',
            options: [
              'A feeling I want to keep',
              'A memory worth holding',
              'A skill I noticed I have',
              'A connection that mattered',
              'A way of being I want to repeat',
            ],
          },
          'Released something': {
            title: 'What was it?',
            options: [
              "A thought I'm done with",
              "An object I don't need",
              "A place I won't go back to",
              "A way of being I'm finished with",
              'A story about myself',
            ],
          },
        },
        skipLabel: 'Neither today',
      },
      notes: { placeholder: 'Anything you want to add in your own words? Skip if not.' },
    },
    closingLine: 'What you keep, what you set down. The audit is a posture, not a verdict.',
  },

  // ===================================================================
  // ENTRY 6 — The Audit of Closeness
  // ===================================================================
  {
    day: 6,
    dailyActivities: [
      { day: 1, glyph: 'tether', title: `Have one real conversation`, body: `Have one proper conversation today — phone down, really listening, not rushing. Ask someone a real question and wait for the real answer. One good conversation can lift a whole day. Make time for one.` },
      { day: 2, glyph: 'phone', title: `Make that call you keep avoiding`, body: `Call someone you've been meaning to reach — a parent, an old friend, someone you've lost touch with. Call, don't text. It might feel a little awkward. Do it anyway. The call you keep putting off is usually the one that matters.` },
      { day: 3, glyph: 'ear', title: `Just listen, fully`, body: `In one conversation today, just listen — don't interrupt, don't turn it back to yourself, don't plan your reply. Let the person finish. Really listening to someone is a simple thing, and people feel it when you do.` },
      { day: 4, glyph: 'say', title: `Tell someone they matter`, body: `Tell one person today something nice you usually keep to yourself — that you're glad they're around, that they helped you, that you noticed something. We often skip the warm stuff. Say it today, plainly.` },
      { day: 5, glyph: 'walk', title: `See someone in person`, body: `Meet someone face to face today instead of texting — a coffee, a quick visit, sitting together. Being in the same room is different from a screen. Let one of your connections happen in person today.` },
      { day: 6, glyph: 'watch', title: `Notice who you reach for`, body: `Today, notice who you naturally talk to and who you keep your distance from. No judging — just notice. Who do you let close? Who do you avoid? Seeing this clearly is the first step to fixing it.` },
      { day: 7, glyph: 'document', title: `Pick one person to give more time`, body: `Tonight, think of one person who deserves more of your time than they're getting. Write down one small thing you'll do this week for them — a call, a visit, a plan. Relationships are built one small effort at a time.` },
    ],
    offlinePractice: {
      id: 'w6',
      archetype: 'tether',
      title: `One real contact`,
      action: `Each day, make one genuine, unhurried point of contact with a person who matters — a real conversation, a phone call, time fully present with the phone face-down. Not a transaction, not only a text fired off between other things. One real exchange.`,
      why: `The substance was a third party in most of your relationships. Daily relational bids are the behavioural repair of a network that use quietly distorted.`,
    },
    arrivalTitle: 'The Audit of Closeness',
    arrivalSubtitle: 'The map nobody draws.',
    artifactType: 'build_entry_6',
    intro: [
      "The substance was a third party in most of your relationships, whether anyone named it or not. With it gone, the relationships are visible now in their actual shape.",
      "Some of them are exactly what you thought. The friend you talked to about real things turns out to have been talking with you about real things — the substance was incidental. You can keep that friendship now without the chemistry, and it'll hold.",
      "Some of them are different than you thought. Closer or farther than the substance was letting you see.",
      "There are friendships that were partly held together by shared using. The conversations were good, the laughter was real, but the substrate was a table you no longer sit at. Without it, you don't quite know what to do with each other. The friendship hasn't ended; it has just lost its load-bearing wall. You'll know within a year which of these can rebuild and which can't.",
      "There are relationships that were strained by the substance — people who were waiting for you, watching you carefully for years, holding their concern in. Now that you're not using, you might assume the strain is gone. It often isn't. They remember more than you do. The hurt is older than the recovery. These people might need time to trust the version of you that's appeared.",
      "And there are relationships you didn't know existed. People who quietly became important once the substance stopped occupying your attention. Some are old friends who got closer. Some are new. They tend to show up in Build, when there's actual room for them in your week.",
      "The most uncomfortable discovery in this audit is the one most people skip. Some of your closest people were close partly because you were unavailable in certain ways. They liked the version of you that was distracted, or impaired, or needed care. The version of you that's now more available, more present, is not exactly what they signed up for. Recovery can create distance even in the relationships you thought were unshakeable. That's not a failure of the relationship. It's a real cost.",
      "The substance was visible in the using. It was also visible in who you let close, and how close, and what you let them see.",
      "This week is the audit. Not the action — the action comes later, if at all. Just the looking.",
      "You're going to do something on the page that might feel strange. You're going to name a few of the people in your life, privately on the device, and place each one on a small ladder. The ladder doesn't measure how much you love them. It doesn't measure how much they matter. It measures one specific thing: how close they are to where you actually are right now.",
      "Some of them knew before you did. Some of them know fully. Some half-know. Some don't know yet. Some, you don't want to know yet — and that's information, too.",
      "The map isn't permanent. People move on it. You move on it. The point is to see, for one week, what the actual shape looks like.",
      "Not everyone has to be on the map. Five names is enough. The smallest accurate map is better than the largest theoretical one.",
    ],
    mechanic: 'build_weekly_entry',
    mechanicProps: {
      weekLabel: 'Week 6',
      activityA: {
        type: 'closeness_ladder',
        title: 'The closeness map',
        prompt: 'Name up to five people. Place each on the ladder. Initials are fine.',
        options: LADDER_POSITIONS_5,
        maxSlots: 5,
      },
      activityB: {
        type: 'single_select',
        title: 'Reading the map',
        prompt: 'Looking at the map — what does it tell you?',
        options: [
          'Closer than I thought',
          'Smaller than I thought',
          'More uneven than I thought',
          'About what I expected',
          'Hard to read yet',
        ],
      },
      activityC: {
        type: 'daily_single_select',
        title: "Today's bid",
        prompt: "What was today's most real human moment?",
        options: [
          'Said something true',
          'Was actually heard',
          'Heard someone real',
          'Felt the distance',
          'Made a small bid',
          'Felt the closeness',
          'Withdrew on purpose',
        ],
        skipLabel: 'No clear moment today',
      },
      notes: { placeholder: 'Anything you want to add in your own words? Skip if not.' },
    },
    closingLine: 'The map is a snapshot, not a sentence. People move on it.',
  },

  // ===================================================================
  // ENTRY 7 — The Long Horizon
  // ===================================================================
  {
    day: 7,
    dailyActivities: [
      { day: 1, glyph: 'coin', title: `Save a little money`, body: `Put a small amount of money aside today — into savings, or pay a bit off a debt. Even a tiny amount counts. It's a simple way of looking after the future you, who will be glad you did it.` },
      { day: 2, glyph: 'book', title: `Learn for fifteen minutes`, body: `Spend fifteen minutes today learning something that takes a long time to get good at — a language, a skill, a subject. Just one small bit. Big things are built from small daily bits. Do one today.` },
      { day: 3, glyph: 'pulse', title: `Do one thing for your health`, body: `Do one thing today for your body's future — a real walk, an early night, water instead of something else. Not about looks. Just looking after the body you'll need for years to come. One thing today.` },
      { day: 4, glyph: 'plant', title: `Move a slow project forward`, body: `Pick one big, slow thing you're working on, or want to, and move it forward a tiny bit today — one paragraph, one call, one small step. Slow things only get done one small piece at a time. Add one piece.` },
      { day: 5, glyph: 'tether', title: `Invest in a relationship`, body: `Spend time on one important relationship today without expecting anything back — a check-in, an unhurried hour, some patience. Good long-term relationships are built by showing up again and again. Show up once today.` },
      { day: 6, glyph: 'map', title: `Picture your life in five years`, body: `Take two minutes today to picture one normal day in your life five years from now — where you live, what you're doing, who's around. Make it feel real in your head. Imagining it helps you steer toward it.` },
      { day: 7, glyph: 'document', title: `Write down where you are headed`, body: `Tonight, write one direction you want your life to move in over the next five years — who you want to become, how you want your days to feel. Not a goal to hit, just a direction. Naming it helps you head there.` },
    ],
    offlinePractice: {
      id: 'w7',
      archetype: 'map',
      title: `One brick for the year`,
      action: `Each day, do one small thing that only pays off on a long horizon — a little money set aside, a page studied, the body maintained, the slow project moved an inch, a relationship tended with no immediate return.`,
      why: `Acting toward a future months or years away is direct practice against the present-bias that addiction trains. Survival was a horizon of weeks; you are practising the horizon of years.`,
    },
    arrivalTitle: 'The Long Horizon',
    arrivalSubtitle: 'Survival is a horizon of weeks.',
    artifactType: 'build_entry_7',
    intro: [
      "For years, your time horizon was short. Get through tonight. Get through this week. Make it to the next milestone. This wasn't a failure of imagination. It was the appropriate length of horizon for the work you were doing. Long-horizon thinking is a luxury when you're not sure you'll be okay by Sunday. Survival is a horizon of weeks at most. Most of recovery, by design, has happened inside that horizon.",
      "By now, in Build, the horizon can extend.",
      "Most people don't extend it. They make it through the dramatic phase, they get to Maintenance, and they keep operating in survival mode out of habit — quarter-to-quarter, month-to-month, getting through. This is the silent stagnation of long-term recovery. The crisis is over. The structure of crisis-thinking is still running. The result is years of being sober without ever asking what the sobriety is for.",
      "The work of this entry is to deliberately extend the horizon.",
      "This isn't goal-setting in the ordinary sense. Goals are about arrival, as we discussed in earlier entries. The long horizon is something else. It's a posture toward the next five and ten and twenty years — not a list of what you'll achieve, but a sense of what direction you're moving in. Some of it has nothing to do with achievement. Most of it has to do with who you'll be, what shape your days will have, what kinds of work and relationships you'll have given enough time to.",
      "The substance was, among other things, a time-compressor. It made yesterday and last month feel roughly the same. It made five years ago feel like another life. Maintenance is when chronological texture returns — when you can feel the difference between three months ago and now, when you can feel five years ahead as a real place where someone (you) will be standing.",
      "Survival is a horizon of weeks. Maintenance is a horizon of years. The shift is yours to make.",
      "Here are the kinds of questions the longer horizon makes available:",
      "What craft or skill do you want to have developed in five years that would take five years to develop? Most people are surprised when they realize there are things they could be five years better at, and the only requirement is starting now.",
      "What relationships do you want to have invested in by then? Not the dramatic ones — the slow, accumulating ones. The friendship that gets deeper because you both kept showing up. The marriage that gets more honest. The relationship with a parent that gets less complicated, or more complicated and more real.",
      "What do you want your relationship to your work to be? Not your job title in five years. The actual posture you take toward what you do all day.",
      "What do you want a typical Sunday to look like at 45? Sunday is the most important question, because Sunday is the day with the least imposed structure, and it reveals what you've actually built.",
      "You don't have to answer any of these now. The questions are bigger than this entry. The point of the entry is to make room for them — to deliberately put down the survival horizon for an hour and let the longer one come into view.",
      "You can pick it up again afterward, if you need to. The survival horizon is still there. It just doesn't have to be the only horizon anymore.",
    ],
    mechanic: 'build_weekly_entry',
    mechanicProps: {
      weekLabel: 'Week 7',
      activityA: {
        type: 'pair_sequential',
        title: 'Two five-year priorities',
        prompt: 'A primary and a secondary.',
        step1: {
          title: 'The most important thing to develop over the next five years',
          options: [
            'A craft or skill',
            'Relationships',
            'Body and health',
            'Place or home',
            'A daily practice or discipline',
            'Work or contribution',
          ],
        },
        step2: {
          title: 'And the second most important',
          options: [
            'A craft or skill',
            'Relationships',
            'Body and health',
            'Place or home',
            'A daily practice or discipline',
            'Work or contribution',
          ],
          excludePicked: true,
        },
      },
      activityB: {
        type: 'single_select',
        title: 'Looking at the horizon',
        prompt: 'When you actually try to look at the next five years — what is it like?',
        options: [
          'A relief to look at',
          'Mostly clear',
          'Mostly cloudy',
          'Surprising — different than expected',
          'Hard to look at',
        ],
      },
      activityC: {
        type: 'day_timeline_pick',
        title: "Today's horizon",
        prompt: 'Where was your attention living today?',
        options: ['Right now', 'Day or week', 'This month', 'This year', 'Longer view'],
        skipLabel: "Couldn't tell today",
      },
      notes: { placeholder: 'Anything you want to add in your own words? Skip if not.' },
    },
    closingLine: 'Set the longer horizon down and pick it back up. Most weeks, that is enough.',
  },

  // ===================================================================
  // ENTRY 8 — The Return Path
  // ===================================================================
  {
    day: 8,
    offlinePractice: {
      id: 'w8',
      archetype: 'pause',
      title: `One edge, one guard`,
      action: `Each day, notice one moment that carried even a faint pull or risk — a place, a feeling, a person, or an HALT state: hungry, angry, lonely, tired. Then take one small protective action in response: eat, rest, leave, message someone, change the plan.`,
      why: `Low-key daily noticing-plus-response is relapse prevention done calmly. It builds real risk literacy instead of the exhausting hypervigilance that burns out and backfires.`,
    },
    arrivalTitle: 'The Return Path',
    arrivalSubtitle: 'What you can name in advance, you can manage.',
    artifactType: 'build_entry_8',
    intro: [
      "There's a phase of recovery where it feels disloyal to talk about the possibility of slipping. You've worked hard. You're here. Naming the risk feels like inviting it.",
      "This entry asks you to name it anyway.",
      "The reason is simple. The literature on relapse, accumulated across decades and many thousands of cases, is clear: a substantial fraction of people in long-term recovery will slip at some point. This isn't a moral failing. It isn't evidence that the recovery was fake. It's a feature of the trajectory of most addiction recoveries, and the people who navigate it best are the people who have planned for it before it happens.",
      "The people who refuse to plan tend to fare worse if it does happen — not because they slip more often, but because when they do slip, they have no map for what comes next. The slip becomes proof. The proof becomes shame. The shame triggers more using. What started as a single occurrence becomes a full return, and the full return often takes longer to recover from than the original stopping did.",
      "This entry is about not letting that pattern run if it can be helped.",
      "Risk literacy is different from risk avoidance and from risk denial. Risk avoidance is the work you've already done — Commit, Endure, these first weeks of Build. Risk denial is the temptation to think you're past it now. Risk literacy is in between. It's the practice of knowing what your specific patterns are, what your warning signs look like, what conditions tend to precede a return — and what you'd do if you noticed those conditions assembling.",
      "You don't have to be paranoid about it. Most weeks you don't have to think about it at all. But the literacy lives in the background, available when needed. It's the equivalent of knowing where the fire exits are. You don't expect a fire. You wouldn't refuse to know.",
      "What does the literacy actually look like?",
      "Knowing your own slip pattern — what tends to come before the reach. Most people, looking back, can identify it: a specific kind of bad day, a specific person, a specific hour, a specific feeling that the substance used to mute. The pattern isn't going to surprise you if you've looked at it.",
      "Knowing the conditions that assemble it. Most slips happen at the intersection of three things: low resources (sleep, food, time), unprocessed emotion (anger, grief, loneliness — often unspoken), and proximity (the substance available, no one watching). Two of these is usually fine. Three together is the danger zone. You can learn to feel the zone forming.",
      "Knowing your first move. If you noticed the zone forming — what's the first thing you'd do? Most people have never been asked this. The answer can be small. Call one person. Leave the house. Take a walk. Eat something. Sleep early. Open this app. The first move doesn't have to be elaborate. It has to be predetermined, so you don't have to decide in the moment.",
      "What you can name in advance, you can manage. What you refuse to name often manages you.",
      "And finally — the return path itself. If a slip happens despite all of this, what's the plan?",
      "This is where Vow's structure helps. There is a separate stage built for exactly this — Reclaim. A slip doesn't mean starting over. It means returning to a place that's been built for the return. If you ever need it, it's there. You don't have to know what to do; the structure knows.",
      "The work this week is to make the literacy specific. Not in the abstract — for you, specifically.",
      "You don't have to use any of this. With luck, you won't. But the planning is the protection, and the planning is the work of this entry.",
    ],
    mechanic: 'build_weekly_entry',
    mechanicProps: {
      weekLabel: 'Week 8',
      activityA: {
        type: 'chip_multi_pick',
        title: 'The risk inventory',
        prompt: 'Which of these have, in the past, preceded a reach for the substance?',
        options: [
          'A specific person',
          'A specific place',
          'A specific feeling (loneliness, anger, grief)',
          'A specific time (a particular day or hour)',
          'Sleep deprivation',
          'Travel or disruption of routine',
          'A celebration or piece of good news',
          'A crisis or piece of bad news',
          'The substance becoming unexpectedly available',
          'A long stretch alone',
          'After a difficult conversation',
          'Running on empty for several days',
        ],
        min: 1, max: 5, columns: 1,
      },
      activityB: {
        type: 'single_select_freetext',
        title: 'The first move',
        prompt: 'If you noticed two or three of those assembling — what is the first move you would commit to?',
        options: [
          'Call a specific person',
          'Leave the house immediately',
          'Open this app',
          'Take a walk outside',
          'Eat a real meal',
          'Sleep early',
          'Write down what just happened',
          'Reach out to someone else in recovery',
          'Step into a public space',
          'Something else',
        ],
        otherTrigger: 'Something else',
        otherPlaceholder: 'Your first move...',
      },
      activityC: {
        type: 'binary_row_picks',
        title: "Today's risk weather",
        prompt: 'Quick weather check across the three.',
        rows: [
          {
            key: 'resources',
            label: 'Resources today',
            options: [
              { value: 'steady', label: 'Steady' },
              { value: 'low', label: 'Low' },
            ],
          },
          {
            key: 'emotion',
            label: 'Emotion today',
            options: [
              { value: 'settled', label: 'Settled' },
              { value: 'charged', label: 'Charged' },
            ],
          },
          {
            key: 'proximity',
            label: 'Proximity today',
            options: [
              { value: 'clear', label: 'Clear' },
              { value: 'near', label: 'Near' },
            ],
          },
        ],
        skipLabel: "Can't read it today",
      },
      notes: { placeholder: 'Anything you want to add in your own words? Skip if not.' },
    },
    closingLine: 'What you can name in advance, you can manage. The plan is yours.',
  },

  // ===================================================================
  // ENTRY 9 — Integration
  // ===================================================================
  {
    day: 9,
    offlinePractice: {
      id: 'w9',
      archetype: 'shed',
      title: `A moment where it is the floor`,
      action: `Each day, do one thing that is purely about the life you are building — the work, the relationship, the craft, the plan, the fun — and let recovery be the ground you are standing on, not the thing you are thinking about. Live one moment forward.`,
      why: `Integration is recovery receding to background while you live. The practice is deliberately letting it be the floor — assumed, not the subject — so the life on top of it can grow.`,
    },
    arrivalTitle: 'Integration',
    arrivalSubtitle: 'Recovery becomes the floor, not the room.',
    artifactType: 'build_entry_9',
    intro: [
      "You've come a long way to arrive here, and arriving here is not what you thought it would be.",
      "There isn't a ceremony at the end of this entry. There isn't a certificate, a graduation, a transition into \"after.\" The structure of Build is closing, but the structure of your life is just continuing, and the difference between those two things is the whole point of this final entry.",
      "For most of the work you've done — Notice, Reflect, Commit, Endure, and the eight weeks of Build that preceded this one — recovery was the foreground. It was the active project. It was what your attention organized around. There were stages, and days within stages, and prompts and check-ins and choices. It was, in the best sense, a thing you were doing.",
      "It should now begin to stop being that thing.",
      "Not because the work is done. The work is never done; that's the first honest sentence anyone in long-term recovery learns to live with. But the place the work occupies in your life has to change. If recovery stays in the foreground forever, it crowds out everything the recovery was supposed to make room for. People who stay in the foreground of recovery for years tend to substitute the structure of recovery for the substance — same shape, different content. The app stops being a tool and becomes another thing the day has to revolve around. That's not what you want, and it's not what Vow was built for.",
      "What's supposed to happen instead is this. Recovery starts to recede. Not disappear — recede. The vigilance becomes background. The check-ins become less frequent and more durable. The vocabulary you've been using to describe yourself (\"in recovery,\" \"at six months,\" \"still working it\") begins to drop out of your introductions, because it isn't the most interesting thing about you anymore. It's just one of the things that's true.",
      "The work becomes the floor instead of the room.",
      "Recovery doesn't end. It becomes the floor instead of the room you're in.",
      "This is what Maintenance has been preparing you for. The eight weeks of entries have asked you, in different ways, to look at this — to notice what filled the role the substance left, to recover what you'd forgotten you wanted, to construct identity outside the recovery story, to inherit honestly, to see the actual map of who's close, to extend your horizon past survival, to build risk literacy without becoming paranoid. Each of those was a small move from foreground to ground.",
      "This is the last move. Not a flourish — just the recognition that the move has been made, or is being made, and that it can be acknowledged.",
      "You'll keep using parts of Vow. The Reclaim stage is there if you need it. The Motivation tab will keep running. The data you've left in your weekly entries and your daily marks will keep being there — surfaced occasionally by ceremonies, but mostly just available. You can come back any time. You don't have to.",
      "What's changing is that opening the app becomes one of many things you do, rather than the main thing. The recovery work continues, in your life, in your weeks, in your conversations — not primarily inside this surface. Your life is the surface now. Vow is a tool you reach for when useful, the same way you'd reach for any other tool.",
      "There are three more weeks after this entry — integration time, with no new content — and then a final marker at Day 90. After that, the structure of Build is officially closed and you're in what's just called \"after.\" After has no stages. It's the rest of your life, with this work as the floor.",
      "You did this. Quietly. Across many weeks. With most of it invisible to anyone but you.",
      "That's the last sentence of Build.",
    ],
    mechanic: 'build_weekly_entry',
    mechanicProps: {
      weekLabel: 'Week 9',
      retrieveFrom: [1, 5],
      activityA: {
        type: 'combined_mark',
        title: 'The final mark',
        prompt: 'Position and textures. One last time.',
        positionConfig: {
          subtitle: 'A final position. Where do you sit now?',
          axisX: { left: 'Empty', right: 'Full' },
          axisY: { top: 'Settled', bottom: 'Anxious' },
        },
        textureConfig: {
          subtitle: 'A final three textures.',
          options: TEXTURES_12,
          exactCount: 3,
        },
      },
      activityB: {
        type: 'single_select_freetext',
        title: 'What carries forward most',
        prompt: 'Of the work you did across these nine weeks — what carries forward most actively?',
        options: [
          'The practice I committed to (from Commit/Endure)',
          'The audit of what is filling the role',
          'The desires that came back',
          'The identity I am building',
          'The audit of who is close',
          'The longer horizon',
          'The risk literacy',
          'Something else',
        ],
        otherTrigger: 'Something else',
        otherPlaceholder: 'What carries forward...',
      },
      activityC: {
        type: 'daily_single_select',
        title: "Today's takeaway",
        prompt: "This is the last week with a daily prompt. Mark only the days that feel worth marking. What's worth taking from today?",
        options: [
          'A small win',
          'An honest moment',
          'A small no',
          'A quiet hour',
          'A connection that mattered',
          'A piece of work',
          'A noticing',
          'A nothing-day (everything fine, nothing special)',
        ],
        skipLabel: 'Nothing to mark today',
      },
      notes: { placeholder: 'Anything you want to add in your own words? Skip if not.' },
    },
    closingLine: 'You did this. Quietly. Across many weeks. With most of it invisible to anyone but you.',
  },

]

// =====================================================================
// HELPERS
// =====================================================================

export function getBuildDay(dayNumber) {
  return BUILD_DAYS.find(d => d.day === dayNumber) || null
}

export function getCurrentBuildWeek(buildStartsAt) {
  if (!buildStartsAt) return 1
  const start = new Date(buildStartsAt)
  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  const daysSince = Math.max(0, (now - start) / msPerDay)
  return Math.floor(daysSince / 7) + 1
}

export function getTodayDateKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}