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
      transcript: `Hi. It's Ninad. You're at Commit.

Reflect is behind you. You looked. You weighed. You decided. The work of Commit is different. It's the work of getting ready.

For the next ten days, you're going to build the kit you need to follow through on what you decided. The plans, the scripts, the environment, the vow itself. Most of it is interactive. Almost none of it is journaling. You're building, not reflecting.

But today, before any of that, one thing has to be true.

You need a date.

Not "soon." Not "after this thing is over." Not "when I feel ready." A specific date when the substance stops being part of your life. The date is the spine of everything else. Without it, the next nine days have nothing to build toward.

Pick honestly. Pick close enough that the work matters. Pick far enough that you can finish Commit before it arrives.

Today, you set it. Tomorrow, the building begins.`,
      audioSrc: null, // To be recorded post-May 30
    },
    intro: [
      `Today is the spine of Commit. Without a date, the next nine days have nothing to build toward.`,
      `You'll pick a date between 10 and 30 days from today. Closer than that and you won't have time to prepare. Further than that and the date stops feeling real.`,
      `Then you'll name why you picked that date specifically. Not why you're stopping — that work happened in Reflect. Why this date.`,
      `Then a brief plan for the night before.`,
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
      `Most people who decide to stop pay attention only to themselves — their willpower, their motivation, their resolve. The environment around them stays exactly the same. The same bottle in the same cabinet. The same friends in the same group chat. The same app on the same phone. The same routes home that pass the same place.`,
      `Then they're surprised when stopping is hard.`,
      `Environment makes behavior. The substance was easy because the environment was set up to make it easy. Today's work is changing the environment so that not using becomes the lower-friction default.`,
      `You'll map four zones: home, routine, phone, and social. For each, you'll mark what stays, what changes, and what gets removed entirely. The list you build today becomes your action list for the next nine days.`,
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
      `Most people who try to change a behavior do it privately, and most fail. The reason isn't strength of will. It's that change held privately has no external memory. The using self can rewrite the plan, soften the commitment, postpone the date — and there's nobody else to remember what was actually said.`,
      `Today is about naming one specific person who will know the date and check in with you across the next nine days and beyond. Not a group. Not "friends." One specific person.`,
      `The anchor person doesn't need to be your closest relationship. They need three specific qualities: they take you seriously, they won't relapse-shame, and they're reachable in a hard moment.`,
      `You'll pick them today. You'll also draft what you'll tell them.`,
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
      `Yesterday was about what grows in across months. Today is about what you reach for in the hard moment — when a craving lands, when someone offers, when the using self speaks up at 9pm on a Tuesday.`,
      `The technique is implementation intentions: if-then plans, pre-decided. "If X happens, I will do Y." Pre-decided so that you don't have to make the decision while the craving is loud.`,
      `You'll build two sets. First: social scripts — what you say when someone offers, asks why you're not using, or pushes. Second: urge breakers — small, fast, physical actions for when a craving hits and you're alone.`,
      `Both are pre-loaded options. You'll pick the ones that fit. Custom additions allowed.`,
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
      `Replacement activities (Day 4) grow in over weeks and months. If-then library (Day 5) is for the hard moment. Today is about the in-between — the daily rhythm that holds the days together when nothing dramatic is happening.`,
      `Daily anchors are micro-habits. Under 5 minutes each. Done every day, no matter what.`,
      `The point isn't the impact of any single anchor. It's that the rhythm itself becomes the structure of your day. Without it, the day stretches out and the using self has more room to fill it.`,
      `You'll pick four. Two morning, two evening. From a curated list of micro-habits.`,
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
      `Some of the work of Commit is internal — your environment, your daily anchors, your if-then library. Some of it requires speaking out loud to specific people.`,
      `Today you'll plan up to six conversations. Not all of them will apply to you. Pick the ones that do. For each, you'll draft what you'd say. The draft isn't the script you have to memorize. It's the thing that makes the conversation actually possible to have.`,
      `The point isn't to convince anyone of anything. It's to tell them what's true, briefly, in the way that's easiest for them to hear.`,
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
      `You sealed the vow yesterday. Today's interaction does two things: it names who knows about it (witnesses), and it sets how often you'll return to it (cadence).`,
      `Witnesses aren't about asking permission. They're about telling specific people that this vow exists, so the vow has a kind of external memory beyond your own. The using self can forget. The witnesses can't.`,
      `Cadence is the schedule for re-reading the vow. Research on written commitments is clear — they hold better when revisited at planned intervals rather than only when needed. You'll set the cadence today. Vow will surface the vow at those intervals.`,
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
      transcript: `Hi. It's Ninad. One last time before the date.

You're on Day 10 of Commit. Ten days ago, you came out of Reflect with a decision. Today, the preparation is done.

I want to name what you built.

You set a date. You named who needed to know. You audited your home, your routine, your phone, your social circle, and you have a specific action list for each. You built a replacement engine — each of your triggers now has a specific replacement action. You wrote if-then plans for situations you can predict. You set four daily anchors that will hold you through the harder days. You rehearsed the conversations. You wrote the vow itself, in your own words, and you sealed it. You named witnesses. You set a cadence for returning to the vow.

That's not nothing. Most people who want to change their relationship with a substance never build any of this. They wake up one day and try to stop, and they wake up the next day still using.

You're at the threshold of Endure. The actual change starts on your stop date. The first weeks will be harder than today. The infrastructure you built is what'll carry you through.

Read your vow tonight. Read it tomorrow morning. Then start.`,
      audioSrc: null,
    },
    intro: [
      `Today is Day 10. The last day of Commit.`,
      `Tomorrow — or whenever your stop date arrives — Endure begins. The actual change.`,
      `One final tap. No structured exercise today. Just a single honest moment.`,
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