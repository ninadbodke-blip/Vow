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