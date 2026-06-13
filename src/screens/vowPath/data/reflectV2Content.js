// =====================================================================
// REFLECT v2 — 21 Days of Content
// =====================================================================
// Each day has:
//   - day:               1-21
//   - week:              1, 2, or 3
//   - phase:             "see_it" | "feel_it" | "decide"
//   - dayType:           "read" | "interactive" | "write" | "audio" | "special"
//   - mechanic:          which interaction component to render
//   - arrivalTitle:      shown on arrival screen
//   - arrivalSubtitle:   italic subhead on arrival screen
//   - intro:             paragraphs of intro copy (shown before interaction)
//   - founderAudio:      optional founder audio object (for Days 1, 10, 21)
//   - mechanicProps:     props passed to the mechanic component
//   - resultCopy:        text for the result reveal screen (function or string)
//   - closingLine:       final dignified line
//   - artifactType:      key used when saving to vow_artifacts
//   - byFamily:          optional object — if present, content branches
//                        by substance_family ("substance" | "behavior")
// =====================================================================

export const REFLECT_V2_DAYS = [
  // ===================================================================
  // WEEK 1 — SEE IT (Days 1-7)
  // ===================================================================

  {
    day: 1,
    week: 1,
    phase: 'see_it',
    dayType: 'audio',
    mechanic: 'multi_select_chips',
    arrivalTitle: 'What brought you here.',
    arrivalSubtitle: 'The single most important question of these three weeks.',
    founderAudio: {
      audioSrc: 'reflect/day_01.mp3',
      transcript: `Hi. It's Ninad again.

You made it to Reflect. I don't say that lightly. A lot of people look once, put the phone down, and that's the end of it. You came back. That matters more than you know right now.

Here's what these next three weeks are. Reflect is where we stop just glancing at it and actually sit with it. Both sides. What the substance gives you — and it does give you something, I'm not going to pretend it doesn't — and what it takes. We hold both of those at the same time, which is uncomfortable, because most of us have spent years only ever looking at one side at a time.

I want to be straight with you about something. This stage is not going to push you toward quitting. If anyone builds a tool that quietly herds you toward one answer, they're selling you something. Vow isn't. By the end of Reflect you might decide you're ready to change. You might decide you're not. You might decide you need more time. All three of those are real, allowed endings. I mean that completely.

Your only job for the next twenty-one days is to be honest in here. Nobody reads what you write. Not me, not anyone. So you can finally stop performing — for your family, for your boss, for yourself — and just say the true thing.

That's the work. I'll be back around the halfway mark. Go on.`,
    },
    intro: [
      'Every person who reaches Reflect arrived for a reason. Usually more than one, and usually not the reason they’d give out loud if someone asked.',
      'There’s the public reason — the one that’s easy to admit, the one that sounds responsible. “I want to be healthier.” “I want to save money.” “It’s time.” Underneath it, almost always, is a quieter one: a specific moment, a thing someone said, a number that scared you, a morning you don’t want to repeat, an expression on someone’s face. The quiet reason is the one that actually moves people. The public one rarely does.',
      'Today is small, and it asks only one thing: what actually brought you here. Not the version for your family or your doctor. The real one — or the several real ones, including the ones you’re not proud of, and the ones that feel embarrassingly small.',
      'This matters more than it looks. The reason you start is what you come back to on the hard days, and there will be hard days. People who can name a true, specific reason are far more likely to still be standing months from now than people running on a vague sense that they should. “Should” burns off fast under pressure. A real reason — your real reason — doesn’t.',
      'So be honest in here. No one reads this. Not me, not anyone. You can finally stop choosing the acceptable answer and choose the true one. Tap whatever is real, as much as is real, and add your own line if nothing in the list fits.',
    ],
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'plant',
      title: 'Put the real reason where you can’t avoid it.',
      body: [
        'Before tomorrow, write the truest reason you tapped — in your own words — somewhere you’ll keep running into it without looking for it. Your lock screen. A line in your wallet. The corner of the mirror.',
        'Not a promise, not a plan. Just the reason, sitting where the part of you that likes to forget has to keep seeing it.',
      ],
      button: 'I’ll carry this',
    },
    mechanicProps: {
      header: 'What brought you here?',
      subtext: 'Tap any that feel true. As many as you want. None of them commit you to anything.',
      chips: [
        { id: 'specific_moment', label: 'A specific moment recently' },
        { id: 'partner_said', label: 'Something a partner or family member said' },
        { id: 'health', label: 'A health concern' },
        { id: 'money', label: 'Money it costs me' },
        { id: 'sleep_energy', label: 'Sleep, energy, or how I feel each day' },
        { id: 'work', label: 'Work or career consequences' },
        { id: 'someone_died', label: 'Someone close to me died from this' },
        { id: 'just_want_to_know', label: 'I just want to know what\u2019s actually happening' },
        { id: 'tried_before', label: 'I\u2019ve tried to stop before and slipped' },
        { id: 'dont_know', label: 'I don\u2019t fully know yet' },
      ],
      allowCustom: true,
      minSelection: 1,
    },
    resultCopy: null,
    closingLine: 'You showed up. The rest is also showing up.',
    artifactType: 'reflect_day_1_arrival',
  },

  {
    day: 2,
    week: 1,
    phase: 'see_it',
    dayType: 'interactive',
    mechanic: 'landscape_builder',
    arrivalTitle: 'What, exactly.',
    arrivalSubtitle: 'The first picture is the picture of facts.',
    intro: [
      'Most people who use a substance regularly underestimate how much they use. This is well-documented — across decades of self-report studies, the actual amount turns out to be 20 to 50 percent higher than what people first guess. The brain protects itself by keeping the numbers unclear.',
      'Today we make the numbers real.',
      'You\u2019ll map two sessions a day across a typical week \u2014 the morning side, the evening side. Not an ideal week. A real one. If this week felt heavy, draw a heavy week. If it was lighter than usual, draw the average. The map only works if it\u2019s yours.',
      'This isn\u2019t to shame you. The number is whatever it is. But honest numbers are the foundation of everything else in these three weeks. Without them, you\u2019re working with the using self\u2019s estimate \u2014 and the using self has a strong incentive to round down.',
      'Be honest. Round up if you\u2019re not sure. The picture only works if it\u2019s true.',
    ],
    mechanicProps: {},
    closingLine: 'The numbers exist now. They\u2019ve been there all along.',
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'document',
      title: 'Find one real number.',
      body: [
        'It’s easy to keep the numbers a little unclear — “about this much,” “more or less.” Sometime today, take one of them — what you spend, how often, how much — and work out the real number. Don’t change anything. Just stop guessing low.',
        'You don’t have to write it down. Just let yourself know the true number, once.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_2_landscape',
  },

  {
    day: 3,
    week: 1,
    phase: 'see_it',
    dayType: 'interactive',
    mechanic: 'trigger_checklist',
    arrivalTitle: 'When it happens.',
    arrivalSubtitle: 'Your specific pattern, mapped.',
    intro: [
      'Yesterday you named what the substance is. Today: when it shows up — and underneath that, what it’s actually for. A trigger is never random. Every reach has a job it is doing.',
      'Clinicians call this a functional analysis, and it turns on two questions. First: is the cue inside you — a feeling like stress, loneliness, or boredom — or around you, in a place, a person, a time of day? Second, and more revealing: are you reaching to escape something hard, or to amplify something good? Most problematic use is escape — relief from a feeling you would rather not sit in. But not all of it; for some, the pull is mostly celebration, connection, intensity. They are different problems, and they need different answers.',
      'So today is more than a checklist. You will mark what is real, set how strongly each one pulls, then watch them land on a map — inside or around you, escape or enhance. The shape they make is the point. Most people assume their triggers are scattered and unknowable, and find instead that they cluster, hard, in one corner. A pattern you can see is a pattern you can plan for.',
    ],
    mechanicProps: {
      header: 'Which of these are real for you?',
      subtext: 'Tap the ones you actually recognise — skip the rest. You’ll weigh and place them next.',
      axisLabels: { top: 'to escape a feeling', bottom: 'to chase a feeling', left: 'inside\nhow you feel', right: 'situations\naround you' },
      triggers: [
        { id: 'stress', label: 'Stress at work or in life', kind: 'emotional', pull: 'escape' },
        { id: 'boredom', label: 'Boredom — empty time', kind: 'emotional', pull: 'escape' },
        { id: 'loneliness', label: 'Loneliness or disconnection', kind: 'emotional', pull: 'escape' },
        { id: 'anger', label: 'Anger or frustration', kind: 'emotional', pull: 'escape' },
        { id: 'anxiety', label: 'Anxiety — racing thoughts', kind: 'emotional', pull: 'escape' },
        { id: 'sadness', label: 'Sadness or low mood', kind: 'emotional', pull: 'escape' },
        { id: 'avoidance', label: 'Numbing something out', kind: 'emotional', pull: 'escape' },
        { id: 'sleep', label: 'Sleep — to drop off', kind: 'emotional', pull: 'escape' },
        { id: 'time_of_day', label: 'Time of day (after work, late night)', kind: 'situational', pull: 'escape' },
        { id: 'habit', label: 'Habit — the situation cues it', kind: 'situational', pull: 'escape' },
        { id: 'people', label: 'People you use with', kind: 'situational', pull: 'enhance' },
        { id: 'places', label: 'Places (a bar, a party)', kind: 'situational', pull: 'enhance' },
        { id: 'celebration', label: 'Celebration — something good', kind: 'situational', pull: 'enhance' },
        { id: 'sex', label: 'Sex or intimacy', kind: 'situational', pull: 'enhance' },
      ],
      allowCustom: true,
      maxCustom: 3,
      minSelection: 1,
    },
    closingLine: 'A pattern named is a pattern less in control of you.',
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'watch',
      title: 'See one of them coming.',
      body: [
        'Today, one of the triggers you tapped will arrive — a stretch of boredom, a certain hour, a particular person, a spike of stress. When it does, just notice it coming, the way you’d notice weather. “There it is.”',
        'You don’t have to do anything about it. Seeing it arrive is the whole practice — a pattern you can see coming has a little less hold on you.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_3_triggers',
  },

  {
    day: 4,
    week: 1,
    phase: 'see_it',
    dayType: 'interactive',
    mechanic: 'truth_sort',
    arrivalTitle: 'What\u2019s true.',
    arrivalSubtitle: 'Eight statements. Three piles.',
    intro: [
      'When you give a half-answer about yourself \u2014 "kind of," "sometimes," "depends" \u2014 the half-answer feels safe. It\u2019s also stuck. As long as you can stay in "sort of," you never quite have to decide what to do about anything.',
      'The half-answer is the using mind\u2019s favourite shelter. It keeps every question open, every decision deferred, every change something you can put off until next week. It also keeps you exactly where you are.',
      'Today\u2019s exercise refuses the half-answer. You\u2019ll see eight statements about your relationship with the substance. For each, three options: true, not true, not sure. "Sort of" isn\u2019t available.',
      '"Not sure" is the deliberate safety valve. You\u2019re not forced into yes or no when you genuinely don\u2019t know. But you can\u2019t hide in "sort of" or "depends."',
      'How you sort these is private \u2014 no one will see it. The point isn\u2019t to give the "right" answer. It\u2019s to stop hiding inside the wrong question.',
    ],
    mechanicProps: {
      statements: [
        { id: 'getting_defensive', text: 'I get defensive when someone asks about my use.' },
        { id: 'rules_broken', text: 'I\u2019ve made rules about my use and broken them.' },
        { id: 'others_noticed', text: 'People around me have noticed before I have.' },
        { id: 'used_for_emotion', text: 'I use to handle hard emotions.' },
        { id: 'lied_about_amount', text: 'I\u2019ve lied about how much I use \u2014 to someone close, or to myself.' },
        { id: 'cant_imagine_without', text: 'I can\u2019t fully imagine a version of my life without it.' },
        { id: 'wanted_to_stop', text: 'There have been days I\u2019ve genuinely wanted to stop.' },
        { id: 'occupies_more', text: 'It occupies more of my mind than I want it to.' },
      ],
    },
    closingLine: 'A statement you’ve sorted is harder to dodge later.',
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'catch',
      title: 'Catch yourself half-answering.',
      body: [
        'Today’s exercise took away “sort of.” Real life will give it back — you’ll hear yourself say “I don’t really,” “only sometimes,” “it’s not a big deal.” When you catch it, quietly finish the true sentence instead.',
        'No one else has to hear it. You just stop letting the half-answer stand in your own head, once.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_4_truth_sort',
  },

  {
    day: 5,
    week: 1,
    phase: 'see_it',
    dayType: 'interactive',
    mechanic: 'time_money_calculator',
    arrivalTitle: 'What it takes.',
    arrivalSubtitle: 'Time and money, computed honestly.',
    intro: [
      'You may have already filled in the simpler cost tracker on the Reflect home \u2014 a quick place to mark what your use costs you in time and money. This is its deeper sibling. Same question, slowed down. The numbers you put here will go further than the ones you may have written there.',
      'There\u2019s a difference between knowing, in general, that the substance costs time and money, and seeing the specific computed total for your specific use.',
      'The general knowledge has been with you for years. It hasn\u2019t produced change. The specific number, sometimes, does.',
      'Today\u2019s sliders go beyond the direct cost. You\u2019ll account for time spent preparing, recovering, and thinking about it \u2014 because those are also time the substance occupies, even if it doesn\u2019t feel that way in the moment.',
      'The numbers will be larger than you expect. That\u2019s not because we inflated anything. It\u2019s because you\u2019ve been carrying costs you weren\u2019t counting.',
    ],
    mechanicProps: {},
    closingLine: 'The numbers exist now. They\u2019ve been accumulating all along.',
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'document',
      title: 'Catch one real receipt of the cost.',
      body: [
        'The number you saw today was a total. Sometime before tomorrow, catch one piece of it in the wild — the actual receipt, the actual hour, the actual thing you skipped to make room — and let it sit with you a second longer than is comfortable.',
        'Not to feel bad. Just to turn one big number into one real thing you can actually see.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_5_time_money',
  },

  {
    day: 6,
    week: 1,
    phase: 'see_it',
    dayType: 'write',
    mechanic: 'letter_writer',
    arrivalTitle: 'A letter to who you were.',
    arrivalSubtitle: 'Before any of this entered your life.',
    intro: [
      `There's a version of you from before. Before the substance had a place in your week. Before any of the patterns you've now named started.`,
      `Today, you write a letter to that version. Not to your current self. Not to your future self. To the person you were before this began.`,
      `Write to them as you would to someone you owed an honest accounting to. Tell them what you'd want them to know. What you'd warn them about. What you'd wish for them.`,
      `Take your time. There's no minimum length. There's no maximum. What matters is that you write to them, honestly, in your own voice.`,
      `This letter will be sealed at the end. You won't see it again until Day 20, when your full portrait surfaces.`,
    ],
    mechanicProps: {
      letterKey: 'reflect_day_6_letter_to_past_self',
      promptHeader: `Dear me, before any of this:`,
      starterPrompts: [
        `"The thing I wish you'd known is..."`,
        `"If you start this thing, here is what actually happens, year by year..."`,
        `"There is a version of you that exists in ten years if you don't, and another if you do. Here is what they look like..."`,
        `"The first time the substance entered your life, this is what I remember about that day..."`,
        `"The cost no one will ever tell you about, because they couldn't have known, is..."`,
        `"What I would want you to ask yourself, before any of this begins, is..."`,
      ],
      minWords: 75,
      suggestedWords: 125,
      helperText: 'Even a short letter counts. A hundred words or so usually lets it breathe — but write what is true, not what hits a number.',
      unsealOnKey: 'reflect_day_20',
    },
    closingLine: `You wrote to them. They live in you still.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'say',
      title: 'Say the one line out loud.',
      body: [
        'The letter is sealed now — you won’t see it again until Day 20. But its truest line doesn’t need paper. Sometime tonight, alone, say that one thing out loud: the thing you most wanted that earlier version of you to know.',
        'Just once, in your own voice. Some things only feel real once you’ve heard yourself say them.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_6_letter',
  },

  {
    day: 7,
    week: 1,
    phase: 'see_it',
    dayType: 'read',
    mechanic: 'truth_check',
    arrivalTitle: 'The first week closes.',
    arrivalSubtitle: 'A pause. A reading. A small tap.',
    intro: [
      `Seven days in. The first phase of Reflect — the seeing — closes today. In a week you've named your real reasons for being here, drawn the landscape of facts, mapped your specific triggers, sorted the hard statements, counted what this has actually cost in time and money, and written to the version of you from before any of it began.`,
      `That's a lot of looking, and looking has a cost of its own. Most programmes that run for twenty-one or thirty days treat every day as interchangeable — content, exercise, content, exercise, straight through. Vow doesn't, because that isn't how the mind actually works. The brain doesn't integrate self-knowledge in real time; it consolidates in the gaps between effort. Push without pause and the insights stay loose, half-formed, easy to lose.`,
      `So today is deliberately small: a short reading of what the first week surfaced, and one honest tap for how it landed. Nothing to produce, nothing new to face. This is a phase boundary, and its whole job is to let last week's work settle into something you know rather than something you merely did.`,
      `Tomorrow, week two begins — the feeling phase. Where this week was about seeing the trade clearly, next week is about feeling both sides of it at the same time: what the substance gives you, honestly, and what it takes, just as honestly. That's harder than seeing, and naming it now makes it easier to meet. For today, just the closing tap.`,
    ],
    mechanicProps: {
      promptText: 'How did the first week land?',
      options: [
        { id: 'landed_true', label: 'This is true for me. The picture is honest.' },
        { id: 'landed_partial', label: `Some of it landed. Some I'm still sitting with.` },
        { id: 'landed_skip', label: 'Skip this question.' },
      ],
    },
    closingLine: `The seeing is the foundation of what comes next.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'pause',
      title: 'Let the week settle, somewhere quiet.',
      body: [
        'You’ve seen a lot in seven days, and the mind works that kind of thing out in the quiet, not in the moment. So today asks for almost nothing: find ten quiet minutes — a walk, a chair, no screen — and don’t try to figure anything out.',
        'If one thing from this week keeps coming back on its own, that’s the one to carry into the next. You don’t have to name it. Just let it be there.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_7_phase_1_close',
  },

  // ===================================================================
  // WEEK 2 — FEEL IT (Days 8-14)
  // ===================================================================

  {
    day: 8,
    week: 2,
    phase: 'feel_it',
    dayType: 'interactive',
    mechanic: 'cost_ranker',
    arrivalTitle: 'What it costs you.',
    arrivalSubtitle: 'Five costs. One ranking.',
    intro: [
      `When people are asked to rate the costs of substance use on a scale, the data is mostly noise. "How much does your health matter?" gets answered with 9 or 10 from almost everyone.`,
      `The using self is happy to rate everything highly, because high ratings produce no priority. And no priority produces no action.`,
      `Today's exercise refuses the rating. You'll see five categories of cost. You don't rate them. You rank them \u2014 put them in order, from most to least important to you.`,
      `What sits at your #1 is, by the structure of the exercise, the cost that pulls hardest against what the substance is doing to your life. That's the information the ranking produces.`,
    ],
    mechanicProps: {
      costs: [
        { id: 'health', label: 'Health', description: 'Your body. Sleep, energy, organs, longevity.' },
        { id: 'money', label: 'Money', description: 'What this has cost you financially. Direct and indirect.' },
        { id: 'relationships', label: 'Relationships', description: 'Partner, family, friends. The closeness that has shifted.' },
        { id: 'work', label: 'Work and career', description: 'Performance, focus, ambition, what you could have built.' },
        { id: 'self', label: 'Self', description: `Who you are. Who you wanted to be. The version of yourself you're not quite living up to.` },
      ],
    },
    closingLine: `The #1 cost is the one that pulls hardest.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'watch',
      title: 'Watch for the one at the top.',
      body: [
        'Today you put your costs in order. The one you ranked first will show up in some small way before tomorrow — a moment, a reminder, a feeling. When it does, just let yourself see it. That’s the one that matters most to you.',
        'You don’t have to do anything about it. Just don’t look away this time.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_8_cost_ranking',
  },

  {
    day: 9,
    week: 2,
    phase: 'feel_it',
    dayType: 'interactive',
    mechanic: 'body_map',
    arrivalTitle: 'What your body knows.',
    arrivalSubtitle: 'A map of what you carry.',
    intro: [
      `Your mind has been arguing about this for years — building cases, making exceptions, quietly moving the line of what's acceptable. The body has been keeping its own record the entire time, and the body doesn't argue. It just registers, and it doesn't forget.`,
      `This matters because the body often knows the cost long before the mind will admit it. Sleep that isn't quite sleep. A stomach that has learned to brace. Tension held somewhere that didn't used to hold it. Energy that shows up late and leaves early. None of this is a moral verdict or proof of anything in particular — it's data, the kind the using mind is very practised at talking over.`,
      `Today's exercise makes that record visible. You'll see a map of the common zones where people carry the physical weight of use, and you tap any where you've noticed something. For each one you tap, you can note briefly, in your own words, what you've actually noticed there — not for anyone else to read, just to put it into language.`,
      `This is a baseline, not a diagnosis. The point isn't to frighten you or to total up damage; it's simply to stop overriding what your body has been telling you and let it be named. If anything you mark genuinely worries you, that conversation belongs with a doctor, not an app. What you do with the baseline from here is entirely yours.`,
    ],
    mechanicProps: {
      header: 'Where have you noticed something?',
      subtext: 'Tap any that apply. For each, you can add a short note.',
      zones: [
        { id: 'head', label: 'Head', examples: 'Headaches, mental fog, racing thoughts' },
        { id: 'sleep', label: 'Sleep', examples: 'Difficulty falling asleep, broken sleep, no rest from sleep' },
        { id: 'energy', label: 'Energy', examples: 'Mornings, afternoons, the dragging feeling' },
        { id: 'gut', label: 'Stomach / gut', examples: 'Digestion, nausea, appetite changes' },
        { id: 'chest', label: 'Chest / heart', examples: 'Racing, tightness, irregular feeling' },
        { id: 'liver_kidney', label: 'Liver or kidneys', examples: 'Pain, tenderness, things a doctor flagged' },
        { id: 'mood', label: 'Mood and emotions', examples: 'Anxiety, low mood, irritability, flatness' },
        { id: 'skin', label: 'Skin and appearance', examples: 'Skin changes, weight, aging that feels accelerated' },
        { id: 'libido', label: 'Libido / intimacy', examples: 'Desire, performance, presence' },
        { id: 'memory', label: 'Memory and focus', examples: `Forgetting things, losing track, can't concentrate` },
      ],
    },
    byFamily: {
      behavior: {
        mechanicProps: {
          header: 'Where have you noticed something?',
          subtext: 'Tap any that apply. For each, you can add a short note.',
          zones: [
            { id: 'sleep', label: 'Sleep', examples: 'Late-night use, broken sleep, not enough hours' },
            { id: 'energy', label: 'Energy', examples: 'Mornings, afternoons, the depleted feeling' },
            { id: 'mood', label: 'Mood and emotions', examples: 'Shame after, anxiety, low mood, restlessness' },
            { id: 'libido', label: 'Sex life with a partner', examples: 'Desire, presence, comparison, performance' },
            { id: 'time', label: 'Time and attention', examples: 'Hours lost, the pull during work or other moments' },
            { id: 'memory', label: 'Memory and focus', examples: 'Trouble concentrating on real life' },
            { id: 'spiritual', label: 'Sense of self', examples: `Who you are, who you'd like to be, the gap` },
            { id: 'isolation', label: 'Connection with others', examples: 'Pulling away from people, avoiding closeness' },
            { id: 'work', label: 'Work or studies', examples: 'Productivity, distraction, sneaking time during the day' },
            { id: 'finances', label: 'Finances', examples: 'Money lost, debt, hiding spend (especially for gambling)' },
          ],
        },
      },
    },
    closingLine: `The body has been keeping a record. Now you've seen it.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'watch',
      title: 'Check in with your body, once.',
      body: [
        'Today was about what your body carries. Sometime this afternoon, stop for ten seconds and just feel it — your chest, your shoulders, your stomach, how tired your eyes are. Don’t fix anything. Just notice what’s there.',
        'Your body has been carrying this the whole time. Today you just listen to it for a moment.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_9_body_map',
  },

  {
    day: 10,
    week: 2,
    phase: 'feel_it',
    dayType: 'audio',
    mechanic: 'soft_tap',
    intro: [
      `Ten days in — just past the halfway mark of Reflect. There's no exercise today in the usual sense: nothing to map, nothing to sort, nothing to build. Today is a checkpoint, not a task.`,
      `Halfway is worth pausing on, because it's where a surprising number of things quietly get abandoned — not when they're hardest, but when the early momentum has worn off and the finish still isn't in view. The novelty of starting has gone; the end is still days away. You're standing in exactly that stretch, and you're still here, which is the entire point of marking it.`,
      `The first half asked a lot of you — your real reasons, your true costs, the body's record, the voice that argues for use. The second half turns toward feeling, and eventually toward deciding. Before that shift, a breath.`,
      `So today is light on purpose. An audio, and one soft tap for how you're actually doing right now. Not every day has to be effortful to count. Some days the only work is to notice you're still walking, and to keep going.`,
    ],
    arrivalTitle: 'Halfway.',
    arrivalSubtitle: 'Ten days down. Eleven to go.',
    founderAudio: {
      audioSrc: 'reflect/day_10.mp3',
      transcript: `Hi. It's Ninad.

You're at the halfway point of Reflect. Ten, eleven days in. I wanted to stop you here for a second, because the middle is where people quietly drift off, and I don't want that to be you.

Think about what you've already done. You looked at the actual numbers. The days, the amounts, maybe the money, maybe the years. That is not a small thing. Most people never let themselves see those numbers laid out, because the numbers are the part that's hard to argue with. You let yourself see them. That took something.

Here's a thing I learned the hard way, so you don't have to. The middle of this kind of work feels like nothing is happening. You're not having a big dramatic breakthrough every day. Some days you write two flat sentences, close the app, and feel like you wasted your time. You didn't. This stage was never about breakthroughs. It's about accumulation. You're slowly building an honest picture of your own life, one ordinary day at a time, and the picture only works because you keep showing up to add to it.

The second half goes deeper. We start looking forward. What changes if you stop. What it costs if you don't. Who you'd be on either side of this. Keep being honest in there. It's working even when it doesn't feel like it's working.

I'll see you at the end. Keep going.`,
    },
    intro: [],
    mechanicProps: {
      promptText: 'How are you, today?',
      options: [
        { id: 'steady', label: `Steady. The work is landing as it should.` },
        { id: 'heavier', label: `Heavier than I expected. But I'm still here.` },
        { id: 'wobbling', label: `Wobbling. Not sure I can keep going.` },
        { id: 'detached', label: `Detached. The work isn't quite landing for me.` },
      ],
    },
    closingLine: `Halfway. Eleven more days. Stay with it.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'say',
      title: 'Mark the halfway point.',
      body: [
        'You’re halfway. That’s further than most people get. Sometime today, do one small thing to mark it — not a reward, just a moment. Step outside for a minute. Make a proper cup of tea. Say it out loud: “ten days.”',
        'You don’t have to feel proud. You just have to notice that you’re still here.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_10_halfway',
  },

  {
    day: 11,
    week: 2,
    phase: 'feel_it',
    dayType: 'interactive',
    mechanic: 'two_futures',
    arrivalTitle: 'Two futures.',
    arrivalSubtitle: 'Five years from now. Two versions.',
    intro: [
      `Today's exercise pairs the desired future with the realistic alternative. Most behavior change efforts only ask you to imagine the better version. That's been studied carefully, and it produces less change than you'd expect \u2014 imagining a good future, by itself, gives you the emotional payoff without the work.`,
      `What works is contrast. You'll see two cards. One is your life five years from now if nothing changes \u2014 if you keep using the way you do today. The other is your life five years from now if you've stopped or significantly cut back.`,
      `Read both, slowly. Then pick the one that feels closer to your actual trajectory. Not which one you'd prefer. Which one feels more likely if you don't act.`,
    ],
    mechanicProps: {
      cardA: {
        title: 'The continuing version',
        subtitle: 'If nothing changes',
        body: [
          `It\u2019s the same week you have now \u2014 the same windows, the same evenings \u2014 except the substance has been in it for five more years.`,
          `Your face shows it. Your sleep shows it. The way you move in the morning shows it.`,
          `The people closest to you have stopped expecting some things from you. Quietly. You can tell.`,
          `There were three or four moments where you almost stopped. None of them held. You remember each of them with a faint shame you don\u2019t talk about.`,
          `The version of yourself you used to be able to picture clearly \u2014 what you\u2019d build, who you\u2019d be \u2014 is harder to see now. Not gone. Just further away.`,
        ],
      },
      cardB: {
        title: 'The other version',
        subtitle: 'If you stop',
        body: [
          `It is five years on, and you have not used in those five years. The fact has stopped being remarkable. It is just how you live now.`,
          `The first months were the hardest thing you\u2019ve done. The next year was easier. By the third year, it stopped being a story you told about yourself.`,
          `There is money that used to go to this, and now goes to something you can point to. There are hours in your week that used to be lost. They are not lost any more.`,
          `Someone close to you noticed the change before you said anything. Someone else never had to be told at all.`,
          `The version of yourself you used to picture \u2014 the one you stopped picturing because the gap had become painful \u2014 is, by now, mostly the version you actually are.`,
        ],
      },
      promptText: 'Which feels closer to your trajectory?',
    },
    byFamily: {
      behavior: {
        mechanicProps: {
          cardA: {
            title: 'The continuing version',
            subtitle: 'If nothing changes',
            body: [
              `It\u2019s the same week. The same hours. The behaviour is still in them \u2014 quietly, regularly, and for slightly longer each year.`,
              `The hours it took back then are still being taken. You\u2019ve stopped counting them.`,
              `Whoever you are closest to \u2014 a partner, or whoever comes next \u2014 has been shaped by it in ways you\u2019ve learned not to look at. There are things they no longer ask you.`,
              `There were a few stretches where you cut back. You remember each of them, a little fondly, like a holiday from yourself. None of them held.`,
              `The version of yourself you wanted to be \u2014 present, focused, in your own life \u2014 is harder to picture now. Not impossible. Just further away.`,
            ],
          },
          cardB: {
            title: 'The other version',
            subtitle: 'If you stop',
            body: [
              `It is five years on, and the behaviour has not pulled on your week in those five years. You sometimes forget it used to.`,
              `The first three months were hard in a way you didn\u2019t know you could survive. After that, the difficulty thinned out. By the second year it was simply gone.`,
              `The hours that used to disappear into it are now spent on people you can name, work you can show, and things you\u2019d been quietly wanting to do for years.`,
              `The way you are with the people closest to you is different. You are more there. They feel it before you do.`,
              `The version of yourself you used to picture and then stopped picturing \u2014 the one that had begun to hurt to imagine \u2014 is, by now, the version you actually live.`,
            ],
          },
          promptText: 'Which feels closer to your trajectory?',
        },
      },
    },
    closingLine: `The version you pick as closer is the version you're moving toward \u2014 unless something changes.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'watch',
      title: 'Picture both of them, once.',
      body: [
        'You drew two versions of five years from now. Sometime today — waiting somewhere, lying in bed — bring both back for a minute. The one where nothing changes. The one where it does. Hold them next to each other.',
        'You don’t have to choose anything today. Just let yourself really see both.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_11_two_futures',
  },

  {
    day: 12,
    week: 2,
    phase: 'feel_it',
    dayType: 'interactive',
    mechanic: 'voice_checklist',
    arrivalTitle: 'The using voice.',
    arrivalSubtitle: 'The voice that argues for using.',
    intro: [
      `Almost everyone who uses something regularly has an internal voice that argues for it. This isn't weakness or a character flaw — it's how a habit defends itself. The voice is old, well-practised, and genuinely persuasive, and it works from a surprisingly small script: a handful of lines it reuses, almost word for word, at the moments it knows you're most likely to listen.`,
      `The real trick is that the voice doesn't sound like a voice. It sounds like you — like level-headed thinking, like a fair point, like a piece of wisdom arriving exactly when you need it. "You've earned this." "Just one." "Not today — tomorrow." It borrows your own tone and your own reasoning so that you won't notice it's a script running on you rather than a thought you're having.`,
      `Today is not about arguing with it. Arguing almost never works — the voice always has a comeback ready, and the debate itself keeps you tangled up with the thing. Today is something quieter and far more durable: learning to recognise the voice as a voice. Each line belongs to a pattern, and each pattern has a name. The name is the work.`,
      `You'll meet the lines you know, mark how convincing each one actually is to you — because they don't all pull equally — and then see the answer to each. Once a line has a name, the next time it shows up it arrives as a pattern you recognise instead of as fresh, urgent wisdom. And a pattern you can see coming is one you can finally answer.`,
    ],
    mechanicProps: {
      header: 'Which of these have you heard yourself say?',
      subtext: 'Tap any you recognize. You can also add your own.',
      statements: [
        { id: 'just_one', text: `"Just one. I can stop after one."`, pattern: 'The promise that keeps moving' },
        { id: 'deserve_it', text: `"I deserve this after the day/week I had."`, pattern: 'The reward framing' },
        { id: 'tomorrow', text: `"I'll start tomorrow. (Or next week. Or after this event.)"`, pattern: 'The future date that keeps moving' },
        { id: 'not_that_bad', text: `"It's not that bad. People drink/use way more than I do."`, pattern: 'Comparing down to feel okay' },
        { id: 'special_occasion', text: `"This is a special occasion. Doesn't count."`, pattern: 'The exception that becomes the rule' },
        { id: 'cant_handle', text: `"I can't get through this without it."`, pattern: 'The dependence framed as necessity' },
      ],
      allowCustom: true,
      maxCustom: 2,
    },
    byFamily: {
      behavior: {
        mechanicProps: {
          header: 'Which of these have you heard yourself say?',
          subtext: 'Tap any you recognize. You can also add your own.',
          statements: [
            { id: 'just_once', text: `"Just this once. I can stop after this."`, pattern: 'The promise that keeps moving' },
            { id: 'deserve_break', text: `"I deserve a break. I've earned this."`, pattern: 'The reward framing' },
            { id: 'tomorrow', text: `"I'll quit/cut back starting tomorrow. Just not today."`, pattern: 'The future date that keeps moving' },
            { id: 'everyone_does', text: `"Everyone does this. It's not a big deal."`, pattern: 'Comparing down to feel okay' },
            { id: 'no_one_knows', text: `"No one knows. As long as no one knows, it's fine."`, pattern: 'The private exception' },
            { id: 'cant_relax', text: `"I can't relax/sleep/handle this without it."`, pattern: 'The dependence framed as necessity' },
          ],
          allowCustom: true,
          maxCustom: 2,
        },
      },
    },
    closingLine: `A statement with a name has less power than one without.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'catch',
      title: 'Catch the voice when it speaks.',
      body: [
        'Today you named the voice that argues for using — the one that says “you’ve earned it,” “just this once,” “tomorrow.” It will speak again today. When it does, just notice it for what it is: that voice, doing its usual job.',
        'You don’t have to argue back. Spotting it as it happens takes away most of its power.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_12_using_voice',
  },

  {
    day: 13,
    week: 2,
    phase: 'feel_it',
    dayType: 'read',
    mechanic: 'stories_recognition',
    arrivalTitle: 'Others who looked.',
    arrivalSubtitle: 'Four stories. Four moments of seeing.',
    intro: [
      `Today is a lighter day, mostly reading. Four short stories of people who sat honestly with their own use — not dramatic rock-bottom accounts, but ordinary moments of noticing, the kind that rarely make it into the version anyone tells out loud.`,
      `There's a reason today works through other people's stories rather than more questions about you. Recognition often arrives sideways. There are things about our own use that are almost impossible to see when we look straight at them, and then obvious the instant we see them in someone else. A small detail in a stranger's account lands, and something in your own life that you'd been walking past for years suddenly comes into focus.`,
      `So these aren't meant to be relatable in every detail — they're meant to surface those moments of recognition. You won't see yourself in all four. Some won't apply to you at all, and that's useful information too. After each one, a single honest response: familiar, or not familiar.`,
      `That small act is the work — not because the tap records anything important, but because deciding "yes, that one" or "no, not me" makes you hold the story up against your own life, which is the whole point. You don't have to reach for a reaction. Let each one land where it actually lands.`,
    ],
    mechanicProps: {
      stories: [
        {
          id: 'rhea',
          intro: 'Rhea, 34, marketing manager in Bangalore.',
          body: `Rhea had told herself for years that her drinking was social. She drank with friends, at events, on weekends. Then she started tracking it \u2014 just for one month, just out of curiosity. By the end of the month, she realized she'd had a drink on 22 of 30 evenings. Most weren't social. Most were on the couch, alone, after work. The number "social drinker" had stopped being accurate years ago. She hadn't noticed.`,
        },
        {
          id: 'arjun',
          intro: 'Arjun, 41, partner in a consulting firm.',
          body: `Arjun had always been functional. He performed well at work. He showed up for his kids. He told himself this meant the smoking and drinking were fine. Then his father, who had been just as functional, died at 67 from complications related to decades of "just functional" use. At his father's funeral, Arjun realized he was watching his own future. The grief and the recognition arrived in the same week.`,
        },
        {
          id: 'priya',
          intro: 'Priya, 29, doctor in Delhi.',
          body: `Priya started using cannabis recreationally in medical school. She told herself it helped her sleep. Years later, she realized she hadn't fallen asleep without it in seven years. The "help with sleep" framing had turned into something else. Not a problem, exactly. But also not what she'd thought it was.`,
        },
        {
          id: 'sanjay',
          intro: 'Sanjay, 52, civil servant.',
          body: `Sanjay had quit drinking twice before. Both times, it had stuck for several months. Both times, it had come back. The third time he considered quitting, he was tired of the cycle. He didn't want to be the kind of person who quit and started, quit and started. He wanted to look honestly at why the previous attempts hadn't held. The looking was harder than the quitting.`,
        },
      ],
      promptText: 'For each, was anything familiar?',
    },
    byFamily: {
      behavior: {
        mechanicProps: {
          stories: [
            {
              id: 'rohit_porn',
              intro: 'Rohit, 31, software engineer in Bangalore.',
              body: `Rohit had started watching porn casually in college. By his thirties, it was a daily routine \u2014 usually before bed, sometimes mid-day if he was working from home. He'd told himself it was fine. Then he noticed something. He'd stopped reaching for his partner. Not consciously. Just less often. He hadn't realized how slowly that had happened.`,
            },
            {
              id: 'meera_gambling',
              intro: 'Meera, 39, runs a small business in Mumbai.',
              body: `Meera had started with fantasy cricket in her thirties. Small amounts. Then bigger amounts. Then she realized she'd been hiding the size of her losses from her husband for the past two years. Not lying outright. Just not mentioning them. The not-mentioning had grown to cover a lot of ground.`,
            },
            {
              id: 'kabir_porn',
              intro: 'Kabir, 27, recently engaged.',
              body: `Kabir had used porn since he was 14. He didn't think it was a problem. He had a fianc\u00e9e he loved. He performed fine. He wasn't compulsive. But when he tried to stop for 30 days, just to see, he found himself thinking about it constantly. The thinking was the thing he hadn't known was there.`,
            },
            {
              id: 'vivek_gambling',
              intro: 'Vivek, 46, builder.',
              body: `Vivek had quit gambling twice before. Both times, it had stuck for several months. Both times, it had come back \u2014 usually after a stressful project or a difficult month. The third time he considered stopping, he didn't want to just stop again. He wanted to understand why he kept returning. The returning had a pattern. He'd never sat with the pattern long enough to name it.`,
            },
          ],
          promptText: 'For each, was anything familiar?',
        },
      },
    },
    closingLine: `You're not alone in any of this. That's not a slogan. That's what the data shows.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'tether',
      title: 'Think of one person who turned things around.',
      body: [
        'Today you read about strangers who looked at themselves honestly. Sometime today, think of one real person you actually know — or knew — who faced something hard and came out the other side. A relative, a friend, someone from years ago.',
        'If they could, the door isn’t closed for you either. You don’t have to fully believe that yet. Just bring the person to mind.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_13_stories',
  },

  {
    day: 14,
    week: 2,
    phase: 'feel_it',
    dayType: 'read',
    mechanic: 'truth_check',
    arrivalTitle: 'The Weighing closes.',
    arrivalSubtitle: 'A pause. A reading. A small tap.',
    intro: [
      `Fourteen days. Two weeks. The Weighing is closing.`,
      `Week 2 was harder than Week 1. That was the design landing \u2014 not a sign of failure. The Mirror week (Week 1) was about seeing what is. The Weighing week (Week 2) was about feeling both sides of the trade.`,
      `If pieces of it felt like grief \u2014 for what the substance has given you that you might be giving up \u2014 that grief is appropriate, not weakness. The substance has, in some sense, been a relationship. Acknowledging the loss of any relationship is the work of metabolizing it.`,
      `Most people in change research who follow through on a decision \u2014 who actually stop, and stay stopped \u2014 say later that the hardest part wasn't the stopping. It was the part where they had to feel both sides honestly before deciding. That's what Week 2 was for.`,
      `Week 3 begins tomorrow. Where you actually stand.`,
      `But today \u2014 just a closing tap.`,
    ],
    mechanicProps: {
      promptText: 'How did the second week land?',
      options: [
        { id: 'landed_heavy', label: `It landed. Heavier than Week 1, but I'm still here.` },
        { id: 'landed_some', label: `Some of it landed. Some I'm still sitting with.` },
        { id: 'landed_lighter', label: `Honestly, lighter than expected. I was more ready than I thought.` },
        { id: 'landed_skip', label: 'Skip this question.' },
      ],
    },
    closingLine: `The feeling is the foundation of the deciding.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'pause',
      title: 'Let the second week settle.',
      body: [
        'Two weeks done. This week asked you to feel both sides — what it gives you, and what it takes. That’s heavier than the first week. Today, give it room: find a quiet stretch — a walk, a bath, a slow coffee — and don’t try to tidy any of it up.',
        'If both sides are sitting in you at once and nothing feels settled, that’s not a problem to fix. That’s exactly where you’re meant to be right now.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_14_phase_2_close',
  },

  // ===================================================================
  // WEEK 3 — DECIDE (Days 15-21)
  // ===================================================================

  {
    day: 15,
    week: 3,
    phase: 'decide',
    dayType: 'interactive',
    mechanic: 'outcome_sorter',
    arrivalTitle: 'What would change.',
    arrivalSubtitle: 'Eight outcomes. Three feelings.',
    intro: [
      `If you stopped using, what would happen? Not as inspirational poster. As specific changes to your specific life.`,
      `Today's exercise lists eight outcomes that commonly follow a decision to stop. Some are practical (money saved, sleep improved). Some are relational (different conversations with your partner). Some are internal (a different relationship with yourself).`,
      `You won't sort them by which you want. You'll sort them by how each one feels in your body when you consider it: hopeful, scared, or neutral.`,
      `"Scared" is not weakness. Some of these changes \u2014 even the good ones \u2014 produce fear, because they change something about who you've been. The fear is information.`,
    ],
    mechanicProps: {
      outcomes: [
        { id: 'money', label: `Money you've been spending becomes available for other things.` },
        { id: 'sleep', label: `Sleep, energy, and physical health improve over months.` },
        { id: 'time', label: `Hours that went to using become hours for other things.` },
        { id: 'partner', label: `Conversations with your partner change. Some get easier. Some get harder before they get easier.` },
        { id: 'identity', label: `You stop being the person who uses. You start being someone else.` },
        { id: 'social', label: `Social events that used to include the substance shift. Some friends shift with you. Some don't.` },
        { id: 'emotions', label: `Hard emotions arrive without their usual softener. You feel things more directly.` },
        { id: 'future', label: `Possible futures that weren't possible while using become possible.` },
      ],
    },
    closingLine: `The mix is what's true. Hopeful and scared, both, are how it actually feels.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'watch',
      title: 'Picture one thing that would change.',
      body: [
        'Today you sorted what might change if things were different. Sometime today, pick just one of those changes — the one that surprised you — and let yourself imagine it fully for a minute. Not as a plan. Just as a picture: what would that actually look like, on an ordinary day?',
        'You’re not deciding anything. You’re just letting one possible future feel real for a moment.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_15_outcomes',
  },

  {
    day: 16,
    week: 3,
    phase: 'decide',
    dayType: 'interactive',
    mechanic: 'fears_two_column',
    arrivalTitle: 'The fears.',
    arrivalSubtitle: 'On both sides.',
    intro: [
      `Most people focus only on the fears of continuing. They forget there are also fears of stopping.`,
      `Today's exercise names both sides. Two columns. Left: what you're afraid of if you stop. Right: what you're afraid of if you don't.`,
      `You'll see common fears in each column. Tap any that are true for you. You can also add your own.`,
      `When both columns are visible at once, the actual shape of the choice gets clearer. The decision isn't between fear and no-fear. It's between two different sets of fears. The work is choosing which set you'd rather carry.`,
    ],
    mechanicProps: {
      leftColumn: {
        title: 'If I stop',
        subtitle: 'Fears of stopping',
        fears: [
          { id: 'social_awkward', label: `Social situations will feel awkward without it.` },
          { id: 'identity_loss', label: `I won't know who I am without it.` },
          { id: 'pleasure_lost', label: `I'll lose something I enjoy.` },
          { id: 'cant_cope', label: `I won't be able to cope with hard emotions.` },
          { id: 'boring', label: `Life will be boring or grey.` },
          { id: 'cant_sleep', label: `I won't be able to sleep / relax / unwind.` },
        ],
      },
      rightColumn: {
        title: `If I don't stop`,
        subtitle: 'Fears of continuing',
        fears: [
          { id: 'health_decline', label: `My health declines, in ways I can't reverse.` },
          { id: 'relationship_damage', label: `Damage to my relationship that becomes permanent.` },
          { id: 'time_lost', label: `Years pass and the same pattern is still there.` },
          { id: 'identity_decline', label: `I become a version of myself I don't respect.` },
          { id: 'professional_consequence', label: `Work or financial consequences I can't take back.` },
          { id: 'death', label: `I die earlier than I should have.` },
        ],
      },
      allowCustom: true,
      maxCustomPerSide: 2,
    },
    byFamily: {
      behavior: {
        mechanicProps: {
          leftColumn: {
            title: 'If I stop',
            subtitle: 'Fears of stopping',
            fears: [
              { id: 'cant_relax', label: `I won't have a way to relax or wind down.` },
              { id: 'sex_life', label: `My sex life or relationship to my body will feel emptier.` },
              { id: 'boredom', label: `I'll have hours in my week I don't know what to do with.` },
              { id: 'identity_loss', label: `It feels like part of who I am.` },
              { id: 'no_pleasure', label: `I'll lose something I enjoy, even if it's costing me.` },
              { id: 'cant_cope', label: `I won't have a way to handle stress or hard emotions.` },
            ],
          },
          rightColumn: {
            title: `If I don't stop`,
            subtitle: 'Fears of continuing',
            fears: [
              { id: 'relationship_damage', label: `My partner finds out, or it damages our intimacy permanently.` },
              { id: 'time_lost', label: `Years more of my life given to this.` },
              { id: 'identity_decline', label: `I become a version of myself I don't respect.` },
              { id: 'financial_ruin', label: `Financial damage I can't recover from (especially for gambling).` },
              { id: 'compulsion_grows', label: `The pull gets stronger, not weaker, with time.` },
              { id: 'discovery_consequence', label: `Someone finds out and I can't control the consequence.` },
            ],
          },
          allowCustom: true,
          maxCustomPerSide: 2,
        },
      },
    },
    closingLine: `The decision isn't between fear and no-fear. It's between two sets of fears.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'say',
      title: 'Say the biggest one out loud.',
      body: [
        'You wrote fears on both sides today — the fear of stopping, and the fear of carrying on like this. Sometime today, alone, say the biggest one out loud. Just name it, plainly, in the open air.',
        'Fears get smaller when they stop living only in your head. You don’t have to solve it. Just hear yourself say it once.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_16_fears',
  },

  {
    day: 17,
    week: 3,
    phase: 'decide',
    dayType: 'write',
    mechanic: 'letter_writer',
    arrivalTitle: 'A letter from your future self.',
    arrivalSubtitle: 'From the version of you five years from now.',
    intro: [
      `Today, you write a different kind of letter. Not to yourself. From yourself.`,
      `Imagine the version of you, five years from today, who is on the other side of this. They've made a decision and held it. They have the perspective you don't have yet \u2014 the perspective that comes only from having walked the path.`,
      `Write a letter from that version of yourself to the version of you reading this now. What would they tell you? What do they wish you'd known? What was harder than they'd expected? What was easier? What turned out to matter?`,
      `This is the second sealed letter. It will be sealed at the end. You'll see it again on Day 21, when you stand at the three doors.`,
      `Take your time. Let yourself write as if you actually were that future version. They have things to say.`,
    ],
    mechanicProps: {
      letterKey: 'reflect_day_17_letter_from_future_self',
      promptHeader: 'From me, five years from now:',
      starterPrompts: [
        `"The thing I wish you'd known is..."`,
        `"What I want you to do right now is..."`,
        `"I want to tell you about the year you're about to have..."`,
      ],
      unsealOnKey: 'reflect_day_21',
      dayNumber: 17,
    },
    closingLine: `They wrote to you. From a version of you that exists, somewhere ahead.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'plant',
      title: 'Keep one line your future self wrote.',
      body: [
        'You wrote today as the person you might be in five years. Pick the one line from that letter you’d most want to hear on a hard day. Keep it close — say it to yourself before bed, or put it where you’ll see it tomorrow.',
        'It came from you. That version of you was real enough to write to you. Let them.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_17_letter_from_future',
  },

  {
    day: 18,
    week: 3,
    phase: 'decide',
    dayType: 'interactive',
    mechanic: 'readiness_ruler',
    arrivalTitle: 'Readiness.',
    arrivalSubtitle: 'Where are you, today?',
    intro: [
      `One of the most reliable findings in the entire science of behaviour change is almost suspiciously simple. The strongest single predictor of whether someone follows through on a decision to change isn't the quality of their reasons, the resources they can draw on, or even the support around them. It's their own honest answer to one question: how ready do you actually feel?`,
      `Not how ready you think you ought to be. Not how ready you'd tell your family, or your doctor, or your own conscience you are. How ready you genuinely feel, today, in private, with no one watching and nothing to perform. That private number turns out to predict what people actually do better than almost anything that can be measured from the outside — which is exactly what this whole stage has been quietly building toward letting you read.`,
      `So today is the readiness ruler: a single slider, one through ten. There is no right number, and no number you're supposed to be reaching for. A two is not a failure and a nine is not a promise — each is simply information about where you honestly stand right now.`,
      `Below the slider, two short questions to anchor the number: why it sits there and not lower, and what it would take to move it higher. They only take a moment, and they turn a bare figure into something you can actually use. Wherever the slider settles, that's today's reading — and it's completely allowed to move tomorrow.`,
    ],
    mechanicProps: {},
    closingLine: `The number is information. It doesn't decide. You do.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'watch',
      title: 'Notice where you actually are.',
      body: [
        'Today you marked how ready you feel. Readiness isn’t fixed — it moves through the day. Sometime later, in the middle of something ordinary, check again: where am I right now, honestly? Higher than this morning? Lower?',
        'You’re not trying to push the number up. You’re just learning to read your own weather — a good skill to have before any line gets drawn.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_18_readiness',
  },

  {
    day: 19,
    week: 3,
    phase: 'decide',
    dayType: 'read',
    mechanic: 'truth_check',
    arrivalTitle: 'What ready means.',
    arrivalSubtitle: 'A pause. A reading. A small tap.',
    intro: [
      `Yesterday you rated your readiness. Today's question is what that rating means.`,
      `"Ready" doesn't mean unafraid. It doesn't mean certain. It doesn't mean having a perfect plan. People who succeed at hard change almost always start before they feel fully ready. The waiting-to-feel-ready, in fact, is one of the things that keeps people stuck.`,
      `What "ready" actually means is something simpler: ready enough to begin. To take the next step, knowing the steps after that are not yet visible.`,
      `Some of you, yesterday, rated yourself at 9 or 10. Some of you rated yourself at 3 or 4. Both are valid readings of where you actually are. The work of Day 21 \u2014 two days from now \u2014 is to take that reading honestly and to decide what to do with it.`,
      `Tomorrow, you see what you've made. Your full portrait, every artifact from these three weeks, surfaced at once.`,
      `Today, one tap.`,
    ],
    mechanicProps: {
      promptText: 'What does ready feel like for you right now?',
      options: [
        { id: 'ready_to_begin', label: `Ready enough to begin. I don't need to be certain.` },
        { id: 'almost_ready', label: `Almost there. Maybe not quite yet.` },
        { id: 'not_ready', label: `Not ready. The looking has been valuable, but I'm not at action.` },
        { id: 'something_else', label: `Something else, that none of these quite capture.` },
      ],
    },
    closingLine: `Whatever ready means for you, the next two days will hold it.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'pause',
      title: 'Sit with the question, don’t answer it.',
      body: [
        'Today’s reading was about what “ready” really means. Don’t try to decide today whether you are. Instead, find a few quiet minutes and hold the question loosely: what would “ready” even feel like, for me?',
        'Some questions are meant to be carried for a while, not answered on the spot. This is one of them. Let it sit.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_19_what_ready_means',
  },

  {
    day: 20,
    week: 3,
    phase: 'decide',
    dayType: 'special',
    mechanic: 'portrait_reveal',
    arrivalTitle: 'Your portrait.',
    arrivalSubtitle: 'Three weeks. Surfaced.',
    intro: [
      `For nineteen days, you have been making something. Most of it has not been visible to you yet \u2014 each day stood alone.`,
      `Today, all of it surfaces.`,
      `What you'll see next is your full portrait. Your reasons for being here. Your specific landscape. Your trigger map. The statements you sorted. The time and money this has taken. The letter you wrote to who you were \u2014 unsealed now, after fourteen days in the dark. Your costs ranked. Your body's record. Your readings of the using voice. Stories you recognized in. The two futures, and which one you said feels closer. The fears, on both sides. The number that came up when you rated your readiness honestly.`,
      `Take your time with it. There's no need to read every word again. The pieces are there for you, in your own voice, ready to be seen all at once.`,
      `Tomorrow is the last day. Three doors.`,
    ],
    mechanicProps: {},
    closingLine: `What you have made is yours. Tomorrow, you decide what to do with it.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'watch',
      title: 'Take in the whole picture, slowly.',
      body: [
        'Today three weeks of your own words came back to you — including the letter you sealed on Day 6. That’s a lot to see at once. Sometime today, when you’re not rushed, read it slowly, the way you’d read something a friend wrote to you.',
        'This is the most honest picture of yourself you’ve made in a long time. Don’t judge it. Just look at it, all the way through.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_20_portrait',
  },

  {
    day: 21,
    week: 3,
    phase: 'decide',
    dayType: 'special',
    mechanic: 'three_doors',
    arrivalTitle: 'Three doors.',
    arrivalSubtitle: 'The last day. Where do you actually stand?',
    founderAudio: {
      audioSrc: 'reflect/day_21.mp3',
      transcript: `Hi. It's Ninad.

Twenty-one days. You started Reflect not really knowing what it was, and you stayed with it the whole way through. Sit with that for one second before you do anything else, because you're about to rush past it, and it deserves a second.

Three weeks ago you opened this and you were only willing to look. Now you've done the looking. You held both sides of it. You wrote the true things down. You watched your own mind argue with itself, and you didn't look away. Whatever you decide next, you're deciding it as someone who actually knows what they're choosing. Not someone guessing. Not someone in denial. That is rare. Most people never get this clear.

So here's where it goes. In a moment, Vow is going to give you three honest doors, and I want to be completely straight that they carry equal weight. You can decide you're ready to commit to changing. You can decide this isn't the time, and step away — and that is allowed, really allowed, with no guilt trip from me. Or you can decide you need to keep reflecting a while longer.

I am not going to tell you which one to walk through. If I did, I'd be doing the exact thing I built this whole app to never do.

What I'll say is this. Whatever you choose, you are not the same person who opened this three weeks ago. That person couldn't see clearly. You can now. And clarity, once you've got it, is yours to keep. It doesn't go away.

Thank you for letting me walk part of this with you. Go ahead and choose. I'll be here either way.`,
    },
    intro: [
      `Twenty-one days. The work of Reflect closes today. You came in to stop just glancing at this and actually sit with it — both sides, held at the same time — and you did exactly that, day after day, including on the days it was uncomfortable and the days you'd rather not have opened the app at all.`,
      `Today is not more input. It's the decision the whole stage has been quietly building toward, made now — with everything you've surfaced laid out in front of you, rather than from the vague, pressured sense that you simply should. Below, in order: a brief reading of where the work has brought you; the letter you sealed back on Day 17, written from a version of you five years down the line; and then the three doors.`,
      `About those doors, and this matters as much on the last day as it did on the first: there is no door Vow is hoping you walk through. The promise you read on Day 1 holds here at the end. You might decide you're ready to change. You might decide you're not. You might decide you need more time. All three are real, allowed answers — and whichever one is honest is the right one.`,
      `So take your time. There's no rush, and nothing here is graded or recorded against you. This is the one decision the whole of Reflect was for. Meet it as honestly as you've met everything that led to it.`,
    ],
    mechanicProps: {
      data: {
        prompt: 'Three doors stand in front of you.',
        subtext: `Twenty-one days of looking honestly are behind you. What comes next is a choice. The doors are not equal \u2014 each is fully respected.`,
        doors: [
          {
            id: 'commit',
            label: `I'm ready. Begin Commit.`,
            description: '10 days of building the infrastructure for stopping.',
            confirmText: `Commit is 10 days. You'll set a specific stop date on Day 1, between 10 and 30 days from today. By Day 10 you'll have a sealed vow and the structure to walk into Endure.`,
          },
          {
            id: 'endure',
            label: 'I have already stopped \u2014 take me to Endure.',
            description: 'Begin Endure directly. 21 days of structured holding.',
            confirmText: `Endure is for the early stretch after stopping. It assumes the vow has been made already \u2014 through Commit, or in another way. Three phases over 21 days: crash, flatness, return.`,
          },
          {
            id: 'not_ready',
            label: `I'm not ready to commit yet. I need more time.`,
            description: 'Stay with Reflect. Return when ready.',
            confirmText: `Not being ready is a real and honest answer. The work you did in these 21 days is yours. When something shifts \u2014 when the readiness arrives \u2014 you can return.`,
          },
        ],
      },
    },
    closingLine: `The door you pick is the door you pick. You're not locked in.`,
    practice: {
      eyebrow: 'Carry this with you',
      archetype: 'say',
      title: 'Say where you really stand, out loud.',
      body: [
        'You’ve reached the last day, and three doors. Before you walk through one, do this: somewhere private, say out loud where you honestly stand right now. Not where you should be. Not where anyone wants you to be. Where you actually are.',
        'Whatever you choose, choose it awake — with your own real position said plainly, in your own voice, first.',
      ],
      button: 'I’ll carry this',
    },
    artifactType: 'reflect_day_21_three_doors',
  },
]

export const REFLECT_V2_TOTAL_DAYS = 21

export function getReflectV2Day(dayNumber) {
  return REFLECT_V2_DAYS.find(d => d.day === dayNumber) || null
}

// Phase definitions for the overview
export const REFLECT_V2_PHASES = [
  {
    key: 'see_it',
    week: 1,
    title: 'Week 1 \u2014 See it',
    subtitle: 'Days 1\u20137. Looking honestly.',
    dayRange: [1, 7],
  },
  {
    key: 'feel_it',
    week: 2,
    title: 'Week 2 \u2014 Feel it',
    subtitle: 'Days 8\u201314. Both sides, felt fully.',
    dayRange: [8, 14],
  },
  {
    key: 'decide',
    week: 3,
    title: 'Week 3 \u2014 Decide',
    subtitle: 'Days 15\u201321. Where do you actually stand?',
    dayRange: [15, 21],
  },
]