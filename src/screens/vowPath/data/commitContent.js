// =====================================================================
// COMMIT STAGE CONTENT — 10 DAYS
// =====================================================================
// Methodology: Implementation intentions (Gollwitzer), identity-level
// habit replacement (Wood, Clear), spaced retrieval, public
// commitment, written vow as central artifact.
// =====================================================================

export const COMMIT_TOTAL_DAYS = 10

export const COMMIT_PHASES = [
  {
    key: 'foundation',
    title: 'Foundation',
    subtitle: 'The date, the environment, the anchor person.',
    dayRange: [1, 3],
  },
  {
    key: 'infrastructure',
    title: 'Infrastructure',
    subtitle: 'What grows in, what you reach for, what holds the days.',
    dayRange: [4, 6],
  },
  {
    key: 'conversation_and_vow',
    title: 'Conversation and vow',
    subtitle: 'The talks. The vow itself. The witnesses.',
    dayRange: [7, 9],
  },
  {
    key: 'threshold',
    title: 'The threshold',
    subtitle: 'The eve.',
    dayRange: [10, 10],
  },
]

export const COMMIT_DAYS = [

  // ===================================================================
  // DAY 1 — THE DATE
  // ===================================================================
  {
    day: 1,
    arrivalTitle: 'The date.',
    arrivalSubtitle: 'Where Commit begins.',
    artifactType: 'commit_day_1',
    founderAudio: {
      transcript: `Hi. It's Ninad.

You chose to commit. I don't want to make a big ceremony out of it, because the ceremony was never the point — what you do after is. But I do want to mark it. You stood in front of three doors and you walked through the hard one. Okay. Let's get to work.

Here's what Commit is, and what it isn't. It is not the part where you quit. Not yet. People get this backwards all the time. They decide to change, and then they try to white-knuckle it starting that same night, no plan, pure willpower — and willpower runs out around nine p.m., and they're back where they started by the weekend. That's not a character flaw. That's just bad preparation.

So we're not doing that. The next ten days are preparation. We build the actual kit before you need it. The plan for the urges, before the urge shows up. The people you'll lean on. The things that fill the space the substance is about to leave. The honest conversations. We get all of it in place while you're calm and clear, so that the tired, tempted version of you later doesn't have to figure it out from scratch in the worst possible moment.

By the end of these ten days, you'll set a date. A real one. But not today. Today we just start building.

One thing at a time. I'll talk to you near the end, right before the date. Let's begin.`,
      audioSrc: 'commit/day_01.mp3',
    },
    intro: [
      `Today is the spine of Commit. Everything across the next nine days builds toward one thing: a date. Without it, the preparation has nothing to organise around — it stays a wish, and wishes drift.`,
      `You'll pick a date between ten and thirty days from today, and the window matters. Closer than ten days and there isn't time to prepare the ground — the environment, the people, the plans. Further than thirty and the date stops feeling real; it slides into "someday," and someday is where change quietly goes to die. Ten to thirty days is close enough to be real and far enough to be ready.`,
      `Then you'll name why you picked this date specifically. Not why you're stopping — that work is done, you did it in Reflect. Why this date: a Monday, the week after a trip, before a birthday, the anniversary of something. A date with a reason behind it holds far better than an arbitrary one, because the reason is the part the using self can't easily argue away.`,
      `Finally, a brief plan for the night before — the last evening has its own weight, and naming in advance how you'll spend it takes some of the charge out of it. Today you set the point that everything else from here now points toward.`,
    ],
    mechanic: {
      type: 'datePicker',
      data: {
        minDaysFromNow: 10,
        maxDaysFromNow: 30,
        datePickerHeader: 'When does the substance stop being part of your life?',
        datePickerSubtext: `Pick a date between 10 and 30 days from today. Closer than that and you won't have time to prepare. Further than that and the date stops feeling real.`,
        reasonsHeader: 'Why this date?',
        reasonsSubtext: `Pick the reasons that are true. There's no right answer.`,
        reasonOptions: [
          { id: 'enough_time_to_prepare', label: 'It gives me enough time to prepare' },
          { id: 'milestone_coming', label: 'A milestone is coming I want to be clear for' },
          { id: 'something_specific_ending', label: 'Something specific is ending soon (event, trip, stretch)' },
          { id: 'specific_person', label: 'A specific person matters' },
          { id: 'close_enough_not_lose_nerve', label: `I want it close enough that I don't lose nerve` },
          { id: 'marks_something_meaningful', label: 'It marks something meaningful to me' },
          { id: 'felt_right', label: 'I just picked a date that felt right' },
        ],
        allowCustomReasons: true,
        customReasonPrompt: 'Another reason',
        nightBeforeHeader: 'The night before — a brief plan.',
        nightBeforeSubtext: `Three small things, planned in advance. The night before is when most people slip — not from craving, but from the unstructured anticipation.`,
        nightBeforeOptions: [
          { id: 'no_substance_in_home', label: 'No substance in the home that night' },
          { id: 'specific_dinner', label: 'Specific dinner plan (with someone, or specific food)' },
          { id: 'in_bed_by_specific_time', label: 'In bed by a specific time' },
          { id: 'phone_away_from_bed', label: 'Phone away from bed' },
          { id: 'tell_someone_in_advance', label: 'Tell one specific person what tomorrow is' },
          { id: 'no_alcohol_setting', label: `No setting where alcohol/substance will be present` },
          { id: 'something_to_look_forward_to', label: 'Something specific to look forward to the next morning' },
        ],
      }
    },
    closingTitle: 'The date is set.',
    closingBody: `Everything else from here builds toward it.`,
  },

  // ===================================================================
  // DAY 2 — THE ENVIRONMENT
  // ===================================================================
  {
    day: 2,
    arrivalTitle: 'The environment.',
    arrivalSubtitle: 'What stays, what changes, what you remove.',
    artifactType: 'commit_day_2',
    intro: [
      `Most people who decide to stop pay attention only to themselves — their willpower, their motivation, their resolve — and leave everything around them exactly as it was. The same bottle in the same cabinet. The same friends in the same group chat. The same app one tap away. The same route home past the same place. Then they're surprised that stopping is so hard.`,
      `It isn't a failure of will. It's a failure of design. Behaviour is shaped far more by environment than by intention — what's easy to reach gets reached for, and what's out of sight stays mostly out of mind. The substance was easy, in large part, because your surroundings were quietly arranged to make it easy.`,
      `So today's work isn't more resolve. It's changing the environment so that not using becomes the lower-friction default — the path of least resistance, rather than the thing you have to fight uphill every single day.`,
      `You'll map four zones: home, routine, phone, and social. For each, you'll mark what stays, what changes, and what gets removed entirely. Be specific and be honest — a vague intention to "see certain people less" does nothing, but naming the exact group chat you'll mute does. The list you build today becomes your action checklist for the next nine days.`,
    ],
    mechanic: {
      type: 'environmentMapper',
      data: {
        zones: [
          {
            id: 'home',
            label: 'Home',
            prompt: 'What in your home environment needs to change?',
            items: [
              { id: 'remove_substance', label: 'Remove all substance from the home' },
              { id: 'remove_paraphernalia', label: 'Remove paraphernalia (glasses, ashtrays, devices, etc.)' },
              { id: 'change_storage', label: 'Empty/repurpose the specific storage location' },
              { id: 'remove_visual_triggers', label: 'Remove visual triggers (gifts, memorabilia, art)' },
              { id: 'change_evening_chair', label: 'Change the specific chair/spot where you used' },
              { id: 'remove_specific_glass', label: 'Remove the specific glass/cup/object associated' },
            ]
          },
          {
            id: 'routine',
            label: 'Routine',
            prompt: 'What in your daily routine needs to change?',
            items: [
              { id: 'morning_routine_change', label: 'Different morning routine (no association)' },
              { id: 'evening_routine_change', label: 'Different evening wind-down' },
              { id: 'commute_route_change', label: 'Different commute route (avoid specific store/bar)' },
              { id: 'lunch_break_change', label: 'Different lunch break (different place or company)' },
              { id: 'weekend_pattern_change', label: 'Different weekend pattern (Friday/Saturday specifically)' },
              { id: 'stress_release_change', label: 'New stress-release activity slotted into the day' },
            ]
          },
          {
            id: 'phone',
            label: 'Phone',
            prompt: 'What on your phone needs to change?',
            items: [
              { id: 'delete_delivery_apps', label: 'Delete delivery apps (alcohol, weed delivery)' },
              { id: 'delete_dating_apps', label: 'Delete dating apps (if relevant to use)' },
              { id: 'delete_betting_apps', label: 'Delete betting/gambling apps' },
              { id: 'block_specific_websites', label: 'Block specific websites (porn, gambling, etc.)' },
              { id: 'remove_specific_contacts', label: `Remove specific contacts (dealers, drinking buddies you can't unfollow)` },
              { id: 'mute_specific_chats', label: 'Mute or leave specific group chats' },
              { id: 'screen_time_limits', label: 'Set screen time limits on relevant apps' },
              { id: 'block_substance_content', label: 'Block substance content on social media' },
            ]
          },
          {
            id: 'social',
            label: 'Social',
            prompt: 'What in your social environment needs to change?',
            items: [
              { id: 'tell_close_circle', label: 'Tell close circle (so they stop offering)' },
              { id: 'decline_recurring_event', label: 'Decline a recurring event that centers on use' },
              { id: 'space_from_specific_people', label: 'Take space from specific people for the first 30 days' },
              { id: 'find_substance_free_setting', label: 'Find a substance-free regular setting' },
              { id: 'reschedule_high_risk_plans', label: 'Reschedule the high-risk plan in next 30 days' },
              { id: 'tell_one_workmate', label: 'Tell one trusted workmate' },
            ]
          },
        ],
        allowCustomPerZone: true,
        customPrompt: 'Something specific to your environment',
        selfNamingPrompt: 'Looking at the map:',
        selfNamingOptions: [
          { id: 'doable_this_week', label: 'This is doable. I can move on most of it this week.' },
          { id: 'harder_than_expected', label: 'Some of these are harder than I expected.' },
          { id: 'need_anchor_person_help', label: `I'll need to lean on someone to help with some of these.` },
        ]
      }
    },
    closingTitle: 'The environment is the change.',
    closingBody: `Move on these in the days before your date. You don't have to do them all today.`,
  },

  // ===================================================================
  // DAY 3 — THE ANCHOR PERSON
  // ===================================================================
  {
    day: 3,
    arrivalTitle: 'The anchor person.',
    arrivalSubtitle: 'One person who knows the date.',
    artifactType: 'commit_day_3',
    intro: [
      `Most people who try to change a behaviour do it privately, and most of them fail. The reason usually isn't strength of will. It's that a change held entirely in private has no external memory. The using self is a skilled editor — it can rewrite the plan, soften the commitment, quietly move the date — and if no one else ever heard the original, there's nobody to notice the edit.`,
      `Today is about naming one specific person who will know your date and check in with you across the next nine days and beyond. Not a group. Not "my friends." One specific person, named — who becomes the place the commitment lives outside your own head.`,
      `They don't need to be your closest relationship, or someone who has been through this themselves. They need three specific qualities: they take you seriously, they won't shame you if you slip, and they're genuinely reachable in a hard moment — a real person you could message at 9pm on a bad night. Choose for those three things, not for who you feel you ought to pick.`,
      `You'll choose them today, and you'll also draft what you'll tell them — because "I should mention it sometime" never becomes a conversation. Having the words ready is what turns the intention into something that actually gets said.`,
    ],
    mechanic: {
      type: 'anchorPersonPicker',
      data: {
        relationshipOptions: [
          { id: 'partner', label: 'Partner' },
          { id: 'parent', label: 'Parent' },
          { id: 'sibling', label: 'Sibling' },
          { id: 'close_friend', label: 'Close friend' },
          { id: 'therapist', label: 'Therapist' },
          { id: 'mentor_coach', label: 'Mentor / coach' },
          { id: 'colleague', label: 'Trusted colleague' },
          { id: 'sponsor', label: 'Sponsor / recovery community contact' },
          { id: 'other', label: 'Other' },
        ],
        qualitiesPrompt: 'Three qualities to check.',
        qualitiesSubtext: 'All three should be true. If not, consider someone else.',
        qualityChecks: [
          { id: 'takes_seriously', label: `They'll take this seriously.` },
          { id: 'no_shame', label: `They won't shame me if I slip.` },
          { id: 'reachable', label: `I can reach them in a hard moment.` },
        ],
        contactMethodPrompt: 'How will you be in touch with them?',
        contactMethodOptions: [
          { id: 'in_person', label: 'In person (we see each other regularly)' },
          { id: 'phone_call', label: 'Phone call' },
          { id: 'text_messages', label: 'Text messages' },
          { id: 'voice_notes', label: 'Voice notes' },
          { id: 'video_call', label: 'Video call' },
          { id: 'mix', label: 'A mix' },
        ],
        cadencePrompt: 'How often will you check in?',
        cadenceOptions: [
          { id: 'daily_first_30', label: 'Daily for the first 30 days, then weekly' },
          { id: 'every_few_days', label: 'Every 2-3 days' },
          { id: 'weekly', label: 'Weekly' },
          { id: 'as_needed', label: 'Only when I need to' },
        ],
        messagePromptHeader: 'What will you tell them?',
        messagePromptSubtext: `A draft. You can refine before you actually send it. The draft makes the conversation real.`,
        messageStarter: `Hi [name],\n\nI'm doing some work to change my relationship with [substance]. I've picked a stop date — it's [date]. I'm asking if you'd be the person I check in with about it. It would mean [contact method], around [cadence].\n\nNothing dramatic. Just one person who knows.`,
      }
    },
    closingTitle: 'One person knows the date.',
    closingBody: `Send the message in the next 48 hours. The conversation is the work.`,
  },

  // ===================================================================
  // DAY 4 — THE REPLACEMENT ENGINE (revised)
  // ===================================================================
  {
    day: 4,
    intro: [
      `When something leaves your life, it leaves a space — and a space doesn't stay empty. Stopping isn't subtraction; it's substitution. If you only remove the substance and put nothing where it was, the space keeps the exact shape of the thing that left, and sooner or later that shape pulls the old thing back into it.`,
      `This is one of the most consistent findings in the research on lasting change: what predicts whether a stop holds isn't how hard you white-knuckle the absence, but what grows into the space the substance used to fill. The substance was doing real jobs — soothing, energising, marking the end of a day, giving you something to look forward to. Those jobs don't vanish when it does. Something has to take them over.`,
      `Today is about naming what grows in — not the fast, in-the-moment fixes, which come tomorrow, but the slower things that fill the space across weeks and months: the activities, routines, and pursuits that quietly do the jobs the substance was doing, better and without the cost.`,
      `You'll build from a starting set or your own ideas, then commit to a few that are genuinely realistic — not aspirational. A replacement you'll actually do beats an impressive one you won't. The aim isn't to fill every hour; it's to make sure the space has something real growing in it before the old thing tries to grow back.`,
    ],
    arrivalTitle: 'The replacement engine.',
    arrivalSubtitle: 'What will grow into the space.',
    artifactType: 'commit_day_4',
    introByFamily: {
      substance: [
        `The substance occupied real space in your life. Hours. Energy. Dopamine. The thing you looked forward to. The thing that softened hard moments. The thing that punctuated your week.`,
        `Stopping the substance doesn't remove the space. It empties the space. If nothing comes in to fill it, the using self will offer the old answer — and the old answer will win, because nothing else is competing for that space yet.`,
        `Today's exercise is about what comes in.`,
        `Not the small tactical things you do when a craving hits — those come tomorrow. Today is about the larger activities that will grow into the space across weeks and months. Things you already enjoy or have wanted to do. Running. Reading. Cooking. Building something with your hands. Learning an instrument. Something that gives you the kind of engagement the substance was giving you, but builds instead of depletes.`,
        `You'll pick 2-3. Then you'll commit to a specific starting size — how often, for how long. The commitment is small on purpose. The point is starting, not optimizing.`,
      ],
      behavior: [
        `The behavior occupied real space in your life. Hours. Dopamine. The fast, intense reward. The anticipation. The private ritual.`,
        `Stopping doesn't remove the space. It empties the space. If nothing comes in to fill it, the using self offers the old answer. The old answer wins because nothing else is competing for that space yet.`,
        `Today's exercise is about what comes in.`,
        `Not the small tactical things for when a craving hits — those come tomorrow. Today is about the larger activities that will grow into the space. Important to know: the activities work best when they engage similar systems to what the behavior was engaging. Variable reward. Anticipation. Sustained attention. Skill-building over time.`,
        `Running. Climbing. Learning a language. Building something with hands. A creative practice with daily output. A sport with progression. You'll pick 2-3. Then commit to a specific starting size.`,
      ]
    },
    mechanic: {
      type: 'replacementEngineBuilder',
      data: {
        inventoryHeader: 'What do you already enjoy, or have wanted to do?',
        inventorySubtext: `Tap any that fit. Be generous with the tapping — you're making a longlist, not committing yet.`,
        activityCategories: [
          {
            key: 'physical',
            label: 'Physical',
            items: [
              { id: 'running', label: 'Running / jogging', emoji: '🏃' },
              { id: 'strength', label: 'Strength training / gym', emoji: '🏋️' },
              { id: 'yoga', label: 'Yoga', emoji: '🧘' },
              { id: 'swimming', label: 'Swimming', emoji: '🏊' },
              { id: 'cycling', label: 'Cycling', emoji: '🚴' },
              { id: 'hiking', label: 'Hiking / outdoor walks', emoji: '⛰️' },
              { id: 'sport', label: 'A specific sport', emoji: '🥋' },
            ]
          },
          {
            key: 'creative',
            label: 'Creative',
            items: [
              { id: 'reading', label: 'Reading', emoji: '📚' },
              { id: 'writing', label: 'Writing', emoji: '✍️' },
              { id: 'visual_art', label: 'Painting / drawing', emoji: '🎨' },
              { id: 'instrument', label: 'Learning an instrument', emoji: '🎵' },
              { id: 'music_making', label: 'Music — playing or producing', emoji: '🎸' },
              { id: 'photography', label: 'Photography', emoji: '📷' },
            ]
          },
          {
            key: 'making',
            label: 'Making',
            items: [
              { id: 'cooking', label: 'Cooking / baking', emoji: '👨‍🍳' },
              { id: 'woodworking', label: 'Woodworking / building', emoji: '🔨' },
              { id: 'gardening', label: 'Gardening / plant care', emoji: '🌱' },
              { id: 'pet', label: 'Time with a pet', emoji: '🐕' },
            ]
          },
          {
            key: 'mental',
            label: 'Mental',
            items: [
              { id: 'learning', label: 'Learning something new (language, course)', emoji: '📖' },
              { id: 'strategy_game', label: 'Strategy game (chess, etc.)', emoji: '♟️' },
              { id: 'puzzles', label: 'Puzzles / craft', emoji: '🧩' },
            ]
          },
          {
            key: 'connection',
            label: 'Connection',
            items: [
              { id: 'volunteer', label: 'Volunteer work', emoji: '🤝' },
              { id: 'family_time', label: 'Time with family — structured', emoji: '👨‍👩‍👧' },
              { id: 'hobby_community', label: 'A specific hobby community', emoji: '🤓' },
            ]
          },
        ],
        allowCustom: true,
        customPrompt: 'Add something else',
        starterPathLink: `I don't know what I like.`,
        starterHeader: `That's okay. Let's pick a starter.`,
        starterBody: `Some people get to this day and realize the substance has been the entire dopamine economy for years. That's real. Here's a different way to do this.

You don't need to love your replacement activity on Day 1. You need to give your nervous system something to attach to while it rewires. The first 30 days are about the nervous system, not about enjoyment.

Pick one from below that has the lowest barrier for you to try. Commit to it for 30 days. If you don't like it after 30 days, swap it out.`,
        starterOptions: [
          { id: 'walking', label: 'Walking — outdoors, 30 minutes, no phone', emoji: '🚶' },
          { id: 'reading_starter', label: 'Reading — anything, 20 minutes, before bed', emoji: '📚' },
          { id: 'cooking_starter', label: 'Cooking — one new recipe per week', emoji: '👨‍🍳' },
          { id: 'bodyweight', label: 'Simple bodyweight workout — 15 min, 3x/week', emoji: '💪' },
          { id: 'language', label: 'Learning a language — 15 min/day on an app', emoji: '🗣️' },
        ],
        commitHeader: 'Pick 2-3 to commit to.',
        commitSubtext: `The ones that, when you imagine yourself doing them regularly, feel like a version of you you'd want to be.`,
        frequencyOptions: [
          { id: 'two_x_week', label: '2x per week' },
          { id: 'three_x_week', label: '3x per week' },
          { id: 'four_x_week', label: '4x per week' },
          { id: 'daily', label: 'Daily' },
        ],
        durationOptions: [
          { id: 'fifteen_min', label: '15 minutes' },
          { id: 'thirty_min', label: '30 minutes' },
          { id: 'forty_five_min', label: '45 minutes' },
          { id: 'one_hour', label: '1 hour' },
          { id: 'longer', label: 'Longer' },
        ],
        obstaclesHeader: `What's most likely to stop you?`,
        obstaclesSubtext: `Naming the obstacle is the first step in handling it.`,
        obstacleOptions: [
          { id: 'weather_seasons', label: 'Bad weather / season changes' },
          { id: 'travel', label: 'Travel / disrupted routine' },
          { id: 'cost_setup', label: 'Cost / equipment / setup' },
          { id: 'time_of_day', label: `Time of day I'd planned doesn't work` },
          { id: 'energy_fatigue', label: 'Energy / fatigue' },
          { id: 'no_accountability', label: 'Lack of accountability' },
          { id: 'boredom_few_weeks', label: `I'll get bored after a few weeks` },
          { id: 'start_strong_taper', label: `I'll start strong and taper off` },
        ],
      }
    },
    closingTitle: `You're not just stopping.`,
    closingBody: `You're starting something else.`,
  },

  // ===================================================================
  // DAY 5 — THE IF-THEN LIBRARY (revised — urge breakers + social scripts)
  // ===================================================================
  {
    day: 5,
    arrivalTitle: 'The if-then library.',
    arrivalSubtitle: 'What you reach for in the hard moment.',
    artifactType: 'commit_day_5',
    intro: [
      `Yesterday was about what grows into the space across months. Today is the opposite timescale: what you reach for in the hard moment — when a craving lands without warning, when someone offers, when the using self speaks up at 9pm on an ordinary Tuesday and starts making its case.`,
      `The technique has a name and a deep evidence base: implementation intentions, or if-then plans. "If X happens, then I will do Y" — decided now, in the calm, so that you're not trying to make a good decision while a craving is loud and your judgement is the first thing it takes. Pre-deciding moves the choice out of the worst possible moment and into the best one.`,
      `Why it works is mechanical, not motivational. A craving narrows your attention and rushes you toward the familiar action. A pre-made if-then plan gives that narrowed attention somewhere else to go — a specific response already loaded, so there's no gap for the using voice to fill with persuasion.`,
      `You'll build two sets. First, social scripts: what you actually say when someone offers, asks why you're not drinking, or pushes — short, easy lines you won't have to invent on the spot. Second, urge breakers: small, fast, physical things to do when a craving hits and you're alone. Both come pre-loaded; you'll keep the ones that fit you, and add your own.`,
    ],
    mechanic: {
      type: 'ifThenLibraryBuilder',
      data: {
        socialHeader: 'Social scripts.',
        socialSubtext: 'For when someone offers, asks, or pushes.',
        socialSituations: [
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
            situation: `Someone asks why you're not using`,
            responses: [
              { id: 'just_decided_take_break', label: `"Just decided to take a break."` },
              { id: 'feels_better_without', label: `"Feels better without it."` },
              { id: 'doctor_advice', label: `"On doctor's advice." (true or framing)` },
              { id: 'trying_something_new', label: `"Trying something new this year."` },
            ],
            allowCustom: true,
          },
          {
            id: 'pushed_to_use',
            situation: `Someone pushes after you've already declined`,
            responses: [
              { id: 'said_no_already', label: `"I said no — let's talk about something else."` },
              { id: 'firmer_no_thanks', label: `"No thanks. Really."` },
              { id: 'walk_away', label: `Walk away physically. Get a different drink. Find someone else.` },
            ],
            allowCustom: true,
          },
          {
            id: 'group_chat_invite',
            situation: `A group chat invites you to a high-risk plan`,
            responses: [
              { id: 'sorry_busy', label: `"Sorry, can't make it." (no detail)` },
              { id: 'rain_check', label: `"Rain check — meet up another way?" (suggest alternative)` },
              { id: 'mute_chat', label: `Mute the chat for the night` },
            ],
            allowCustom: true,
          },
        ],
        urgeBreakersHeader: 'Urge breakers.',
        urgeBreakersSubtext: `For when a craving hits and you're alone. Pick the ones you'll actually do.`,
        urgeBreakerCategories: [
          {
            key: 'physical_fast',
            label: 'Fast physical (under 2 min)',
            items: [
              { id: 'box_breathing', label: 'Box breathing — 4 in, 4 hold, 4 out, 4 hold, repeat 4x' },
              { id: 'cold_water_face', label: 'Cold water on face (mammalian dive response)' },
              { id: 'walk_in_place', label: 'Walk in place for 60 seconds, focus on feet' },
              { id: 'glass_of_water', label: 'Drink a full glass of water, slowly' },
              { id: 'push_ups', label: '10 push-ups or jumping jacks' },
              { id: 'shoulders_release', label: 'Drop shoulders, exhale fully, repeat 5 times' },
            ]
          },
          {
            key: 'movement',
            label: 'Movement (5-10 min)',
            items: [
              { id: 'walk_outside', label: 'Walk outside, even if just around the block' },
              { id: 'stretch_routine', label: 'A short stretch routine' },
              { id: 'change_rooms', label: 'Change rooms completely. Different chair, different space.' },
              { id: 'shower', label: 'Take a shower (warm or cool)' },
            ]
          },
          {
            key: 'connection',
            label: 'Connection',
            items: [
              { id: 'text_anchor_person', label: 'Text the anchor person (even just a 🌊)' },
              { id: 'call_someone', label: 'Call someone, anyone — pick from list of 3' },
              { id: 'voice_note_to_self', label: 'Send a voice note to the anchor person' },
            ]
          },
          {
            key: 'mind',
            label: 'Mind',
            items: [
              { id: 'reread_vow', label: 'Re-read the vow' },
              { id: 'name_emotion', label: 'Name what you actually feel underneath the craving' },
              { id: 'urge_surf', label: `Urge surf — set timer for 10 min, watch the urge rise and fall without acting` },
              { id: 'remember_last_time', label: `Remember how you felt the last morning after using` },
            ]
          },
        ],
        allowCustomBreakers: true,
        customBreakerPrompt: 'Your own urge breaker',
        selfNamingPrompt: 'Looking at the library:',
        selfNamingOptions: [
          { id: 'feel_prepared', label: 'I feel prepared for most of these moments.' },
          { id: 'social_ones_harder', label: 'The social ones are harder than the alone ones.' },
          { id: 'alone_ones_harder', label: 'The alone ones are harder than the social ones.' },
          { id: 'need_more_practice', label: 'I need to practice these out loud before they feel real.' },
        ]
      }
    },
    closingTitle: 'The library is built.',
    closingBody: `The hard moments will come. You won't have to think.`,
  },

  // ===================================================================
  // DAY 6 — DAILY ANCHORS (revised — strict micro-habits)
  // ===================================================================
  {
    day: 6,
    arrivalTitle: 'Daily anchors.',
    arrivalSubtitle: 'Four small things, every day.',
    artifactType: 'commit_day_6',
    intro: [
      `Replacement activities, from Day 4, grow in over weeks and months. The if-then library, from Day 5, is for the sharp, hard moments. Today is about the in-between — the ordinary daily rhythm that holds the days together when nothing dramatic is happening, which is most of the time.`,
      `Daily anchors are micro-habits: small, fixed actions, under five minutes each, done every day no matter what. A few minutes of movement. A made bed. A page written. A short walk after dinner. None of them is impressive on its own — and that's exactly the point. Their power isn't in the single act.`,
      `Their power is structural. Early sobriety is destabilising partly because the day loses its shape — the substance used to be a fixed point the hours arranged themselves around, and without it the day can stretch out shapeless, leaving the using self plenty of empty room to fill. Anchors give the day a skeleton again: reliable points that make the time feel held rather than open.`,
      `You'll pick four — two for the morning, two for the evening — from a curated list, or add your own. Choose ones small enough that you'll still do them on a bad day, not only a good one. The bad days are precisely when the rhythm has to hold.`,
    ],
    mechanic: {
      type: 'dailyAnchorPicker',
      data: {
        anchorSlots: [
          { id: 'morning_1', label: 'Morning anchor #1', timeWindow: 'morning' },
          { id: 'morning_2', label: 'Morning anchor #2', timeWindow: 'morning' },
          { id: 'evening_1', label: 'Evening anchor #1', timeWindow: 'evening' },
          { id: 'evening_2', label: 'Evening anchor #2', timeWindow: 'evening' },
        ],
        morningOptions: [
          { id: 'cold_water_face_morn', label: 'Cold water on the face, first thing' },
          { id: 'water_before_coffee', label: 'A glass of water before coffee' },
          { id: 'two_min_breath', label: '2 minutes of breath at the window' },
          { id: 'one_thing_paper', label: 'Write one thing on paper — the day ahead, in one line' },
          { id: 'make_the_bed', label: 'Make the bed' },
          { id: 'stretch_2_min', label: '2 minutes of stretching' },
          { id: 'open_curtains', label: 'Open the curtains, look outside for 60 seconds' },
          { id: 'read_one_page', label: 'Read one page of a book (not phone)' },
        ],
        eveningOptions: [
          { id: 'phone_away_30_min', label: 'Phone away from bed by [specific time]' },
          { id: 'tea_or_water', label: 'A specific tea or water ritual' },
          { id: 'one_line_journal', label: 'One line in a journal — what was the day' },
          { id: 'shower_before_bed', label: 'Shower before bed' },
          { id: 'no_screens_30_min', label: 'No screens 30 minutes before sleep' },
          { id: 'tomorrow_one_thing', label: 'Write tomorrow on paper — one thing, one line' },
          { id: 'read_before_sleep', label: 'Read for 15 minutes before sleep' },
          { id: 'gratitude_one_line', label: 'One line of gratitude' },
        ],
        allowCustomPerSlot: true,
        customPrompt: 'Your own anchor',
        whyTheseHeader: 'Why these four?',
        whyTheseSubtext: 'One sentence. Optional, but worth doing.',
      }
    },
    closingTitle: 'The day has a shape now.',
    closingBody: `Four small things. Done every day. They hold.`,
  },

  // ===================================================================
  // DAY 7 — THE CONVERSATIONS
  // ===================================================================
  {
    day: 7,
    arrivalTitle: 'The conversations.',
    arrivalSubtitle: 'The talks you may need to have.',
    artifactType: 'commit_day_7',
    intro: [
      `Some of the work of Commit is entirely internal — your environment, your daily anchors, your if-then library, things only you need to know about. Some of it, though, means saying something out loud to specific people, and that tends to be the part people most want to avoid.`,
      `Today you'll plan up to six conversations. Not all of them will apply to you — pick the ones that do and leave the rest. For each, you'll draft roughly what you'd say. The draft isn't a script to memorise word for word; it's the thing that makes the conversation possible at all. The reason hard conversations don't happen is almost never that the words came out wrong — it's that they were never prepared, so the moment kept getting postponed.`,
      `The aim isn't to convince anyone of anything, or to win an argument about your choice — you don't owe anyone a defence. The aim is simply to tell the people who need to know what's true: briefly, calmly, and in the way that's easiest for them to actually hear, so that the people around you aren't unknowingly working against something they don't even know is happening.`,
      `Pick the conversations that genuinely matter, and get the words ready today.`,
    ],
    mechanic: {
      type: 'conversationPlanner',
      data: {
        conversations: [
          {
            id: 'partner',
            label: 'Partner / spouse',
            promptHeader: 'Telling your partner.',
            framingText: `If your partner doesn't already know about the stop date, this conversation is high on the list. They're closest to your daily life and will notice the changes. Telling them in advance prevents them from inventing a reason for the changes themselves.`,
            messageStarter: `I've decided to stop [substance]. My date is [date]. I'm telling you in advance because [reason]. I'm not asking you to do anything specific — just to know.`,
          },
          {
            id: 'family',
            label: 'Family (parents, siblings)',
            promptHeader: 'Telling family.',
            framingText: `Family conversations vary widely. Some families will be supportive. Some will overreact. Some will minimize. The conversation is for you — to remove the secret. It doesn't require them to respond the right way.`,
            messageStarter: `Wanted to let you know — I've made a decision to stop [substance], starting [date]. Not making a big deal of it, just wanted you to know.`,
          },
          {
            id: 'close_friends',
            label: 'Close friends',
            promptHeader: 'Telling close friends.',
            framingText: `Pick the 2-3 closest. Not the whole group. Group conversations can pull the announcement into a debate. Individual conversations are clearer.`,
            messageStarter: `Hey, wanted to tell you — I'm stopping [substance], starting [date]. Could use you knowing about it. No need for anything specific from you.`,
          },
          {
            id: 'specific_friend_who_uses',
            label: 'A specific friend you use with',
            promptHeader: 'Telling someone you usually use with.',
            framingText: `This is one of the harder conversations because the friendship may be built partly on shared use. Telling them clearly, while still respecting the friendship, is the work. They may need time. You're not asking them to stop too.`,
            messageStarter: `Wanted to tell you in advance because we've spent a lot of [activity] together — I'm stopping [substance] on [date]. Doesn't change anything about us. I might be different in [setting] for a while.`,
          },
          {
            id: 'work_manager',
            label: 'Manager / colleague',
            promptHeader: 'At work, if needed.',
            framingText: `Most people don't need to tell their manager. Tell only if your use has affected work or if there's a regular work-related drinking situation you need to navigate. Keep it brief, framed as personal time off if needed.`,
            messageStarter: `I'm working on something personal that's going to mean [specific change — leaving early on Fridays / not joining drinks / etc.] for the next few months. Wanted to flag in advance.`,
          },
          {
            id: 'doctor_therapist',
            label: 'Doctor / therapist',
            promptHeader: 'Medical / mental health support.',
            framingText: `If your use has been heavy or long-term, telling a doctor is important. There may be withdrawal considerations, medication interactions, or follow-up care that matter. The conversation is medical, not moral.`,
            messageStarter: `I'd like to talk about something — I've decided to stop [substance], starting [date]. Wanted to check whether there's anything I should know medically.`,
          },
        ],
        selfNamingPrompt: 'Looking at the list:',
        selfNamingOptions: [
          { id: 'all_planned', label: `I know who I'm talking to and roughly what I'll say.` },
          { id: 'some_uncertain', label: `Some of these I'm still uncertain about.` },
          { id: 'will_do_few_at_a_time', label: `I'll do them a few at a time over the coming days.` },
        ]
      }
    },
    closingTitle: 'The conversations are real now.',
    closingBody: `Have them in the next 9 days. Not all at once.`,
  },

  // ===================================================================
  // DAY 8 — THE VOW (writing day)
  // ===================================================================
  {
    day: 8,
    arrivalTitle: 'The vow.',
    arrivalSubtitle: 'In your own words. Today.',
    artifactType: 'commit_day_8',
    intro: [
      `Today is the writing day. The only writing day in Commit.`,
      `Everything you've built in the past seven days has been infrastructure — the date, the conversation, the environment, the replacements, the if-then plans, the anchors, the rehearsed responses. The infrastructure exists to hold up something. What it holds up is the vow.`,
      `The vow is not a contract with Vow. It's not a contract with anyone except yourself. It's the specific, written, dated statement of what you're promising and to whom — even if the "whom" is just the version of you who will read this later.`,
      `You'll write it now, in your own words, using three structured prompts: what you're promising, why, and for how long. The format is provided so that the vow has a known shape. The content is yours.`,
      `The vow will be sealed at the end. After sealing, you can re-read it but you can't edit it. The unedited-ness is part of what makes it a vow rather than a journal entry.`,
    ],
    mechanic: {
      type: 'vowDrafter',
      data: {
        prompts: [
          {
            id: 'what',
            header: 'What are you promising?',
            subtext: `The specific behavior, in clear words. Not "to do better." Not "to try." The specific thing that stops.`,
            placeholder: `From [date] forward, I will not...`,
            suggestions: [
              `Be specific: not "I won't drink as much" but "I won't drink"`,
              `Name the substance directly`,
              `Avoid hedges like "try," "attempt," "work on"`,
              `Include exceptions if any (e.g., "except for prescribed medication, taken only as prescribed")`,
            ],
            minLength: 30,
            maxLength: 500,
          },
          {
            id: 'why',
            header: 'Why this vow?',
            subtext: `The reasons you're holding to. Not all the reasons — the ones that will hold when it's hard.`,
            placeholder: `I'm promising this because...`,
            suggestions: [
              `Specific people or roles you want to be present for`,
              `Specific things you've given up that you want back`,
              `Specific costs that have become unbearable`,
              `Specific version of yourself you want to be`,
            ],
            minLength: 50,
            maxLength: 800,
          },
          {
            id: 'how_long',
            header: 'For how long?',
            subtext: `The vow has a stated duration. Indefinite is allowed and common. Specific time periods are also allowed.`,
            placeholder: `This vow holds for...`,
            suggestions: [
              `"For the rest of my life."`,
              `"For one year, after which I will reassess from a clear-headed position."`,
              `"For 90 days at minimum, and indefinitely if that is what serves me."`,
              `Any duration that is honest`,
            ],
            minLength: 10,
            maxLength: 300,
          }
        ],
        previewHeader: 'Read your vow.',
        previewSubtext: `Read it slowly. If anything needs to change, you can edit before sealing.`,
        sealConfirmHeader: 'Seal the vow.',
        sealConfirmBody: `After sealing, you can re-read but you cannot edit. The unedited-ness is part of what makes this a vow.`,
        sealButtonLabel: 'Seal the vow',
      }
    },
    closingTitle: 'The vow exists.',
    closingBody: `In your own words. Sealed.`,
  },

  // ===================================================================
  // DAY 9 — WITNESSES & CADENCE
  // ===================================================================
  {
    day: 9,
    arrivalTitle: 'Witnesses and cadence.',
    arrivalSubtitle: `Who knows, and how often you'll return to it.`,
    artifactType: 'commit_day_9',
    intro: [
      `You sealed the vow yesterday. Today's work does two things with it: it names who knows the vow exists — your witnesses — and it sets how often you'll come back to it — the cadence. Both are about giving the vow a life beyond the single moment you wrote it.`,
      `Witnesses aren't about asking anyone's permission, and they aren't the same as the anchor person from Day 3. They're about telling a few specific people that this vow exists, so the commitment has an external memory beyond your own. The using self is remarkably good at forgetting what it agreed to the moment keeping that agreement becomes inconvenient. The people who witnessed it are not.`,
      `Cadence is the schedule for re-reading the vow. The research on written commitments is consistent: they hold considerably better when revisited at planned intervals than when they're only remembered in a crisis — by which point the using self has often already begun negotiating. A vow you reread on a set rhythm stays a living thing, rather than a sentence you wrote once and quietly filed away.`,
      `You'll set both today. Vow will then surface your own words back to you at the intervals you choose — not as a notification to swipe away, but as a standing appointment with the thing you decided.`,
    ],
    mechanic: {
      type: 'witnessesAndCadence',
      data: {
        witnessesHeader: 'Who knows?',
        witnessesSubtext: `List the people who know about the vow. They don't have to be asked permission. They just have to know it exists.`,
        maxWitnesses: 4,
        relationshipOptions: [
          { id: 'partner', label: 'Partner' },
          { id: 'parent', label: 'Parent' },
          { id: 'sibling', label: 'Sibling' },
          { id: 'close_friend', label: 'Close friend' },
          { id: 'therapist', label: 'Therapist' },
          { id: 'doctor', label: 'Doctor' },
          { id: 'sponsor', label: 'Sponsor / recovery contact' },
          { id: 'other', label: 'Other' },
        ],
        timingOptions: [
          { id: 'already_told', label: 'Already told them' },
          { id: 'will_tell_soon', label: 'Will tell them in the next few days' },
          { id: 'will_tell_before_date', label: 'Will tell them before the stop date' },
        ],
        cadenceHeader: 'How often will you return to the vow?',
        cadenceSubtext: `When Vow will surface the vow for you to re-read. You can ignore the reminders, but the surfacing itself does work.`,
        cadenceOptions: [
          {
            id: 'daily_30_then_weekly',
            label: 'Daily, the first 30 days. Weekly after that.',
            description: 'Most common. Strong support through Endure.'
          },
          {
            id: 'weekly',
            label: 'Weekly, on a specific day.',
            description: 'Lower friction. Less reinforcement.'
          },
        ]
      }
    },
    closingTitle: 'The vow is witnessed.',
    closingBody: `The cadence is set.`,
  },

  // ===================================================================
  // DAY 10 — THE EVE
  // ===================================================================
  {
    day: 10,
    arrivalTitle: 'The eve.',
    arrivalSubtitle: 'What you built. What comes next.',
    artifactType: 'commit_day_10',
    founderAudio: {
      transcript: `Hi. It's Ninad.

This is the one I was building up to. You're at the end of Commit, which means the date is real now. It isn't an idea anymore. It's on the calendar, and it's close.

I remember this exact spot. The night before. That strange mix of feeling ready and feeling terrified, both at full volume at the same time. If that's what's in your chest right now — good. It means you understand what you're about to do. The people who aren't a little scared here are usually the ones who haven't really decided yet.

I want to remind you what you've actually got, because the fear is going to try to tell you you're walking in empty-handed. You're not. You spent ten days building. You have a plan for the urges. You already know the specific moments that are going to be hardest, and you've already decided what you'll do inside them. You've got people who know. You've got things to put in the empty hours. None of that is theory. You made it, on purpose, for exactly this.

So when the using voice tells you you're not ready — and it will, probably tomorrow — you can answer it honestly. You are ready. Not because you feel strong. You might not feel strong at all. You're ready because you prepared, and preparation is the thing that holds when the feelings don't.

The vow you're about to make is yours. Not mine. Not the app's. Yours. Say it like you mean it, because you do.

I'll talk to you on the other side, once it's actually started. You've got this part. Go.`,
      audioSrc: 'commit/day_10.mp3',
    },
    intro: [
      `Today is Day 10 — the last day of Commit. There's no builder today, nothing to assemble. Just a single, honest tap, and a moment to take in what these ten days actually produced.`,
      `Because you did produce something concrete. You set a date with a reason behind it. You redesigned your environment so that not using is the easier path. You named a person who will hold the date with you. You planted what grows into the space, loaded the if-then plans for the hard moments, anchored your days, prepared the conversations, sealed the vow in your own words, and set who witnesses it and how often you'll return. That isn't motivation — it's infrastructure. The scaffolding a real change actually stands on.`,
      `Tomorrow, or whenever your stop date arrives, Endure begins — the actual change, the part all of this was built to hold. The preparation is finished. What's ahead is different work, and you've made the ground ready for it.`,
      `For today, just one tap. Mark the end of the building, and rest before the climb.`,
    ],
    mechanic: {
      type: 'finalTap',
      data: {
        header: 'How are you, today?',
        subtext: 'No right answer. One tap.',
        options: [
          {
            id: 'ready',
            label: 'Ready. The date is the date. I am walking through it.',
            response: `Good. You built the infrastructure. The infrastructure is real. Walk through.`
          },
          {
            id: 'scared_but_going',
            label: `Scared. But I'm going.`,
            response: `Scared is honest. Scared and going is what most people are when they cross. The infrastructure holds whether you feel ready or not.`
          },
          {
            id: 'not_sure',
            label: `Not sure. I'm questioning whether I'll actually go through with it.`,
            response: `That's also honest. Read the vow tonight. Read it tomorrow morning. The vow is what you wrote when you were thinking most clearly. Trust it.`
          },
        ]
      }
    },
    closingTitle: 'Commit is complete.',
    closingBody: `Tomorrow, or on the date, Endure begins.`,
  },

]

export function getCommitDay(dayNumber) {
  return COMMIT_DAYS.find(d => d.day === dayNumber) || null
}
// ---------------------------------------------------------------------------
// Physical / offline practices — the "between today and tomorrow" exercises.
// Keyed by day number; resolved in CommitDay and surfaced as a check-in on the
// overview. Same shape as the Notice / Reflect practices.
// ---------------------------------------------------------------------------
export const COMMIT_PRACTICES = {
  1: {
    eyebrow: 'Carry this with you',
    archetype: 'document',
    title: `Put the date somewhere it can’t be ignored.`,
    body: [
      `A date that only lives in your head is easy to move. Sometime before tomorrow, write it down where you’ll actually see it — the back of your phone, a card in your wallet, the top of a calendar. Not a reminder you’ll swipe away. Something physical.`,
      `You’re not promising anything yet. You’re only refusing to let the date stay vague. A date you can point to is much harder to quietly push a week later.`,
    ],
  },
  2: {
    eyebrow: 'Carry this with you',
    archetype: 'shed',
    title: `Clear one thing out tonight.`,
    body: [
      `You looked at what in your surroundings makes it easy. Before tomorrow, remove one of those things for real — pour it out, give it away, throw out the paraphernalia, delete the contact, unfollow the account. One concrete removal, done with your hands, not saved for later.`,
      `It doesn’t have to be everything. One thing, gone tonight, tells the part of you that’s still negotiating that this time the room around you is changing too.`,
    ],
  },
  3: {
    eyebrow: 'Carry this with you',
    archetype: 'say',
    title: `Tell one person the date.`,
    body: [
      `A vow no one witnesses is only half made. Before tomorrow, tell one person you trust the actual date — out loud, or in a message you actually send. Not the whole story if you don’t want. Just: this is the day, and I wanted you to know.`,
      `You’ll feel the pull to keep it private, so that failing can stay private too. That’s exactly why saying it matters. Once someone else holds the date, it stops being only yours to quietly cancel.`,
    ],
  },
  4: {
    eyebrow: 'Carry this with you',
    archetype: 'plant',
    title: `Start the new thing at its smallest size.`,
    body: [
      `You named what could grow into the space the substance leaves. Before tomorrow, do the smallest possible first version of one of them — a ten-minute walk, one page, one set, opening the app and signing up. Absurdly small, on purpose.`,
      `The point isn’t progress today; it’s putting one real root down while you still have momentum. Something has to grow into that space, or the old thing simply grows back.`,
    ],
  },
  5: {
    eyebrow: 'Carry this with you',
    archetype: 'catch',
    title: `Rehearse the reach, once, while it’s easy.`,
    body: [
      `You chose what to reach for when the urge comes. Before tomorrow, run it once now, while nothing is hard — actually call the person and talk for a minute, actually leave the room, actually do the breathing. Practise the move when there’s no pressure on it.`,
      `A plan you’ve only thought about tends to collapse in the real moment. A move your body has already made once is something you can fall back into when thinking goes offline.`,
    ],
  },
  6: {
    eyebrow: 'Carry this with you',
    archetype: 'tether',
    title: `Run the four anchors once today.`,
    body: [
      `You set the small daily things meant to hold the shape of your days. Before tomorrow, do all four of them once, today, in order — not to prove anything, just to feel what a day built around them is actually like.`,
      `These are the rails. Most days won’t be dramatic; they’ll be held, or not held, by whether these small things happened. Walking through them once now makes tomorrow’s version feel automatic instead of optional.`,
    ],
  },
  7: {
    eyebrow: 'Carry this with you',
    archetype: 'say',
    title: `Have the one conversation you’re avoiding.`,
    body: [
      `Some of these days turn on a conversation you’d rather not have — with a partner, a friend who only knows you around the substance, someone owed an apology or an explanation. Before tomorrow, pick the one you’ve been avoiding and either have it, or write down exactly what you’ll say and when.`,
      `You don’t have to handle all of them. Just stop letting the hardest one sit as a vague dread. Named and given a time, it shrinks into something you can actually do.`,
    ],
  },
  8: {
    eyebrow: 'Carry this with you',
    archetype: 'document',
    title: `Write the vow in your own words.`,
    body: [
      `Today the vow is yours to make. Before tomorrow, write it out by hand if you can — not a generic resolution, but the real thing, in your own plain words: what you’re stopping, and the truest reason underneath it. A few lines is enough.`,
      `Writing it by hand slows you down just enough to mean it. Keep what you write; you’ll come back to it on a day when the reason has gone quiet and you need to read it in your own voice.`,
    ],
  },
  9: {
    eyebrow: 'Carry this with you',
    archetype: 'say',
    title: `Tell the witnesses, and when you’ll check back.`,
    body: [
      `You decided who holds this with you. Before tomorrow, actually tell them — not just the date now, but that you’re asking them to witness it. And tell them how often you’ll come back: a weekly message, a standing call, a regular check-in.`,
      `A witness who never hears from you again can’t hold anything. The cadence is what turns “I told someone once” into something that keeps catching you.`,
    ],
  },
  10: {
    eyebrow: 'Carry this with you',
    archetype: 'pause',
    title: `Mark the eve, quietly.`,
    body: [
      `Tomorrow the work changes. Tonight, before you sleep, take a few minutes to mark the threshold on purpose — read back the vow you wrote, look at the date, sit for a moment with what you built across these ten days. No performance, no audience.`,
      `You’re not stepping into willpower; you’re stepping into a structure you’ve already laid. Letting yourself feel the weight of the eve, deliberately, is how the first day arrives as something you chose rather than something that just happened to you.`,
    ],
  },
}
