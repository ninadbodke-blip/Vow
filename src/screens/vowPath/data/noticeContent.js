// =====================================================================
// NOTICE STAGE CONTENT — 5 DAYS
// =====================================================================
// Methodology: Transtheoretical Model (Prochaska & DiClemente) for
// consciousness raising in precontemplation. Each day surfaces what
// the user already knows about themselves through their own answers.
// =====================================================================

export const NOTICE_TOTAL_DAYS = 5

export const NOTICE_PHASES = [
  {
    key: 'notice',
    title: 'Notice',
    subtitle: 'Five days of looking at what you already know.',
    dayRange: [1, 5],
  },
]

export const NOTICE_V2_DAYS = [
  // ===================================================================
  // DAY 1 — LINES CROSSED
  // ===================================================================
  {
    day: 1,
    arrivalTitle: 'Lines crossed.',
    arrivalSubtitle: `The lines you said you'd never cross.`,
    artifactType: 'notice_day_1',
    founderAudio: {
      audioSrc: 'notice/day_01.mp3',
      transcript: `Hi. It's Ninad. I'm the person who made this.

I want to tell you why this app exists, and then I'll get out of your way.

I made Vow because I used to be exactly where you are right now. Holding a phone, opening something like this, not totally sure if I was serious or just poking at the idea. And every app I tried wanted to congratulate me. Counters, streaks, little fires, badges. Like I'd won something. I hadn't won anything. I was scared, and I was tired, and the last thing I needed was a cartoon flame telling me I was on a roll.

So Vow doesn't do that. There's no streak to break in here. There's no number you can lose. If you slip, you don't get punished, and you don't get sent back to the start. That was the whole point of building it.

What you're in right now is called Notice. It's small on purpose. We are not asking you to quit anything yet. We're not asking you to promise anything. For these few days, all you're doing is looking. Just paying attention to something you've probably spent a long time not looking at directly.

That's the whole job for now. Look.

I'll talk to you again further in. For now — I'm genuinely glad you opened this. That part is harder than it sounds, and you already did it.

Okay. Go ahead.`,
    },
    openings: {
      A: {
        intro: `You're here because the Stage Check placed you in Notice. Most people in this stage don't think they have a problem. They've heard the warnings. They've seen the lists of symptoms. None of it has felt like it applies to them.

This stage isn't designed to convince you of anything. It's designed to surface things you already know about yourself, in a way that's harder to look past.

Today is the first of those things.

Most people who use a substance regularly have personal lines — things they tell themselves they'd never do with it. These lines exist before any data, before any clinical category. They're personal commitments to who you are.

Today you'll name yours. Then you'll mark which ones you've crossed. The crossed lines are yours. The not-crossed lines are yours too.`
      },
      C: {
        intro: `You've done Notice before. The Stage Check brought you back here. The lines you held last time might be different now.`
      }
    },
    mechanic: {
      type: 'twoPassMultiSelect',
      data: {
        promptStep1: 'Which of these are personal lines for you?',
        subtextStep1: `Tap the ones that are (or were) lines you held for yourself. Not the ones that sound right. The ones you actually told yourself, at some point.`,
        minSelections: 3,
        helperText: 'Most people identify 6-10. Take your time.',
        chips: [
          { id: 'morning', label: `I'd never use first thing in the morning` },
          { id: 'before_noon', label: `I'd never use before noon` },
          { id: 'alone', label: `I'd never use alone` },
          { id: 'at_work', label: `I'd never use at work` },
          { id: 'around_children', label: `I'd never use around my children` },
          { id: 'to_sleep', label: `I'd never use to fall asleep` },
          { id: 'for_stress', label: `I'd never use to handle stress` },
          { id: 'for_hard_feelings', label: `I'd never use to manage hard feelings` },
          { id: 'hide_from_partner', label: `I'd never hide it from my partner` },
          { id: 'lie_to_doctor', label: `I'd never lie to a doctor about my use` },
          { id: 'beyond_means', label: `I'd never spend more than I could afford` },
          { id: 'affect_work', label: `I'd never let it affect my work` },
          { id: 'affect_relationship', label: `I'd never let it affect a relationship` },
          { id: 'on_workday', label: `I'd never use on a workday` },
          { id: 'for_celebration', label: `I'd never use to handle a celebration` },
          { id: 'for_disappointment', label: `I'd never use to handle disappointment` },
        ],
        allowCustom: true,
        customPrompt: 'A line of your own',
        promptStep2: 'Which of these have you crossed?',
        subtextStep2: `Not the ones you bend occasionally. The ones you've actually crossed — done the thing you said you wouldn't.`,
      }
    },
    closingTitle: `You said you wouldn't.`,
    closingBody: `And you have.

That's worth knowing.`,
  },

  // ===================================================================
  // DAY 2 — THE DRIFT
  // ===================================================================
  {
    day: 2,
    arrivalTitle: 'The drift.',
    arrivalSubtitle: 'Where you started, where you are.',
    artifactType: 'notice_day_2',
    openings: {
      A: {
        intro: `Most people who use a substance regularly tell themselves their use is stable. "It's the same as it's always been." "I've had this under control for years."

Sometimes that's true. More often it's not. The pattern has moved — slowly enough that no single day looked different from the one before it, but unmistakable when you look across years.

Today's exercise maps your trajectory. Not how much you used. Where you've been on a scale of behavior, at five points in your life.

The scale describes behavioral patterns, not quantities. Quantity is something the using mind can argue with. Behavioral pattern is harder to dispute.

Most people are surprised by what the map shows. Not by where they are today — they know where they are. By the direction they've been moving.`
      }
    },
    mechanic: {
      type: 'trajectoryMap',
      data: {
        tiers: {
          substance: [
            { tier: 0, label: 'Never tried it.' },
            { tier: 1, label: 'Tried it occasionally. Only socially, with others.' },
            { tier: 2, label: `Used socially, more regularly. Always with others or at events. Wouldn't think to use alone.` },
            { tier: 3, label: 'Started using alone occasionally. Still mostly social. Use is no longer fully tied to events.' },
            { tier: 4, label: 'Regular use, often alone. Some weeks heavier than others. Has become part of your week.' },
            { tier: 5, label: 'Daily or near-daily. Built into the rhythm of your life. The day feels off without it.' },
            { tier: 6, label: 'First thing you think about, or last thing before sleep. You plan parts of your day around it.' },
          ],
          behavior_porn: [
            { tier: 0, label: 'Never.' },
            { tier: 1, label: 'Occasional, intentional. Spaced out.' },
            { tier: 2, label: 'Regular but not frequent. Mostly intentional and contained.' },
            { tier: 3, label: 'Multiple times a week. Still mostly intentional.' },
            { tier: 4, label: 'Daily or near-daily.' },
            { tier: 5, label: 'Multiple times daily. First thing in the morning or last thing before sleep.' },
            { tier: 6, label: `Driving daily decisions. Pulling time and energy from things you'd otherwise value.` },
          ],
          behavior_gambling: [
            { tier: 0, label: 'Never.' },
            { tier: 1, label: 'Occasional, social only. Small amounts, with friends.' },
            { tier: 2, label: 'Regular but only on planned occasions (sports seasons, casino visits, etc.).' },
            { tier: 3, label: `Spontaneous sessions. Started using money you'd allocated for something else.` },
            { tier: 4, label: 'Frequent. Hiding amounts. Spending more time tracking and planning than you let on.' },
            { tier: 5, label: 'Daily or near-daily. Chasing losses.' },
            { tier: 6, label: `Borrowing. Lying about debts. Can't stop within a session even when you intend to.` },
          ]
        },
        landmarks: [
          { id: 'before', label: 'Before any of this was in your life', preset: 0, locked: true },
          { id: 'started', label: 'When you first started using regularly', preset: null },
          { id: 'five_years', label: 'Five years ago (or a major life event from then)', preset: null, allowContext: true, contextPlaceholder: 'What were you doing then?' },
          { id: 'two_years', label: 'Two years ago (or a more recent reference point)', preset: null, allowContext: true, contextPlaceholder: 'What was happening then?' },
          { id: 'today', label: 'Today', preset: null },
        ],
        selfNamingPrompt: 'Looking at the direction:',
        selfNamingOptions: [
          { id: 'knew', label: 'I knew it had moved this much.' },
          { id: 'didnt_realize', label: `I didn't realize it had moved this much.` },
          { id: 'stable_long_time', label: `It hasn't moved. It's been like this for years.` },
        ]
      }
    },
    closingTitle: 'The trajectory exists now.',
    closingBody: `You can't unsee it.`,
  },

  // ===================================================================
  // DAY 3 — THE RELATIONSHIPS
  // ===================================================================
  {
    day: 3,
    arrivalTitle: 'The people.',
    arrivalSubtitle: `What they've been doing while you've been using.`,
    artifactType: 'notice_day_3',
    openings: {
      A: {
        intro: `You don't need to think your behavior is a problem to notice what's been happening around it.

Today's exercise maps the people closest to you, and the small specific things they've been doing — or have stopped doing — in response to your use. You'll name 3 to 5 specific people. For each, you'll answer three questions.

The questions aren't about whether they think you have a problem. They're about specific observable behaviors. When was the last time you had a fully-present conversation with them. Whether they've ever brought up your use. Whether the way they treat you has changed.

The answers are factual. You either had that conversation last week, or you didn't. They either bring it up, or they don't. You can't argue with what people have actually done.

Most people are surprised by what the map shows.`
      }
    },
    mechanic: {
      type: 'relationshipMap',
      data: {
        minPeople: 3,
        maxPeople: 5,
        relationships: [
          { id: 'partner', label: 'Partner' },
          { id: 'parent', label: 'Parent' },
          { id: 'sibling', label: 'Sibling' },
          { id: 'child', label: 'Child' },
          { id: 'close_friend', label: 'Close friend' },
          { id: 'colleague', label: 'Colleague' },
          { id: 'other', label: 'Other' },
        ],
        ageBands: [
          { id: 'under_18', label: 'Under 18' },
          { id: '18_30', label: '18-30' },
          { id: '30_50', label: '30-50' },
          { id: '50_plus', label: '50+' },
        ],
        questions: [
          {
            id: 'last_conversation',
            prompt: 'When was the last time you had a real conversation with this person — fully present, no substance in your system?',
            options: [
              { id: 'this_week', label: 'This week' },
              { id: 'this_month', label: 'This month' },
              { id: 'this_year_unknown', label: `This year, but I can't remember when` },
              { id: 'cant_remember', label: `I genuinely can't remember` },
              { id: 'before_started', label: 'Before any of this started' },
              { id: 'not_applicable', label: 'Not applicable' },
            ]
          },
          {
            id: 'brings_it_up',
            prompt: 'Has this person ever brought up your use?',
            options: [
              { id: 'often', label: 'Often. They bring it up regularly.' },
              { id: 'sometimes', label: `Sometimes. They've brought it up several times.` },
              { id: 'once_twice', label: 'Once or twice. It came up, then dropped.' },
              { id: 'never', label: `Never. They've never said anything.` },
              { id: 'used_to_stopped', label: 'They used to. They stopped.' },
            ]
          },
          {
            id: 'treatment_changed',
            prompt: 'Has the way they treat you changed?',
            options: [
              { id: 'yes_noticeably', label: 'Yes, noticeably.' },
              { id: 'yes_small', label: 'Yes, in small ways.' },
              { id: 'not_sure', label: 'Not sure.' },
              { id: 'no', label: 'No, they treat me the same as always.' },
              { id: 'cooled_overall', label: 'The relationship has cooled overall.' },
            ]
          }
        ],
        selfNamingPrompt: 'Looking at the map:',
        selfNamingOptions: [
          { id: 'knew', label: 'I knew this was the shape of things.' },
          { id: 'didnt_realize', label: `I didn't realize how clearly it shows.` },
          { id: 'want_to_argue', label: `I want to argue with parts of it, but I named the answers.` },
        ]
      }
    },
    closingTitle: 'The people around you have been watching.',
    closingBody: `This is what they've been doing.`,
  },

  // ===================================================================
  // DAY 4 — THE LEDGER OF FORGONE THINGS  (NEW — replaces letter)
  // ===================================================================
  {
    day: 4,
    arrivalTitle: 'What you have given up.',
    arrivalSubtitle: `The ledger most people don't keep.`,
    artifactType: 'notice_day_4',
    openings: {
      A: {
        intro: `Substance use is rarely free.

The cost shows up first in money, sometimes. More often, it shows up in things you used to do, time you used to have, hobbies you used to care about, people you used to see, parts of yourself you used to recognize — all quietly traded away over years for the use itself.

Most people who use regularly don't keep this ledger. The using mind has no interest in tracking what's been given up. It tracks only what's available to use next.

Today's exercise is the ledger. You'll be shown a list of things that get quietly traded in regular use. You'll tap the ones that match your specific case. You don't have to justify any of them. The taps make the ledger.

By the end, the ledger will be in front of you — yours, in your own taps. The using mind has been working to keep this out of view. That work ends today.`
      }
    },
    mechanic: {
      type: 'ledgerOfForgone',
      data: {
        prompt: 'What have you actually given up?',
        subtext: `Tap every one that's true for you. Not what sounds right — what's actually happened in your life.`,
        minSelections: 3,
        helperText: 'Most people tap 8-15. Take your time.',
        categories: [
          {
            key: 'time',
            label: 'Time',
            items: [
              { id: 'hours_per_week', label: 'Hours per week I used to spend on other things' },
              { id: 'evenings', label: 'Most of my evenings' },
              { id: 'weekends', label: 'Most of my weekends' },
              { id: 'mornings', label: 'Mornings that used to belong to me' },
              { id: 'sleep_quality', label: 'Sleep I never get back' },
            ]
          },
          {
            key: 'body',
            label: 'Body',
            items: [
              { id: 'fitness', label: 'A level of fitness I used to have' },
              { id: 'energy', label: 'Energy I used to wake up with' },
              { id: 'sexual_function', label: 'Sexual function or interest' },
              { id: 'general_health', label: 'General health I used to take for granted' },
              { id: 'appetite_eating', label: 'A normal relationship with food' },
              { id: 'recovery_speed', label: 'How quickly I used to recover from things' },
            ]
          },
          {
            key: 'mind',
            label: 'Mind',
            items: [
              { id: 'focus', label: 'Focus I could sustain for hours' },
              { id: 'memory', label: 'Memory of things I should remember' },
              { id: 'emotional_range', label: 'Emotions I used to feel fully' },
              { id: 'patience', label: 'Patience with people who matter to me' },
              { id: 'spontaneity', label: 'Spontaneity that did not require a substance' },
            ]
          },
          {
            key: 'identity',
            label: 'Identity',
            items: [
              { id: 'hobbies_abandoned', label: 'Hobbies I used to love' },
              { id: 'creative_work', label: 'Creative work I used to do' },
              { id: 'ambition', label: 'Ambition I used to have' },
              { id: 'who_i_thought_id_be', label: 'The version of me I thought I would be by now' },
              { id: 'self_respect', label: 'Self-respect on certain days' },
            ]
          },
          {
            key: 'relationships',
            label: 'Relationships',
            items: [
              { id: 'closeness_partner', label: 'Closeness with my partner I used to have' },
              { id: 'parenting_presence', label: 'Being fully present as a parent' },
              { id: 'friendships', label: 'Friendships that have quietly faded' },
              { id: 'family_trust', label: 'Trust from family members' },
              { id: 'sexual_intimacy', label: 'Sexual intimacy that did not need the substance' },
            ]
          },
          {
            key: 'money_work',
            label: 'Money and work',
            items: [
              { id: 'money_spent', label: 'Money I would not want to count' },
              { id: 'opportunities_passed', label: 'Professional opportunities I passed on' },
              { id: 'workplace_reputation', label: 'A reputation at work I used to have' },
              { id: 'savings_not_built', label: 'Savings that should have been built by now' },
              { id: 'side_projects', label: 'Side projects I started and abandoned' },
            ]
          },
        ],
        allowCustom: true,
        customPrompt: 'Something else you have given up',
        selfNamingPrompt: 'Looking at the ledger:',
        selfNamingOptions: [
          { id: 'larger_than_expected', label: 'The list is larger than I expected.' },
          { id: 'about_right', label: 'The list is about what I expected.' },
          { id: 'argue_specifics', label: 'I want to argue with some of these, but I tapped them.' },
        ]
      }
    },
    closingTitle: 'The ledger is yours now.',
    closingBody: `This is what has been quietly traded.

The using mind has been working to keep it out of view.`,
  },

  // ===================================================================
  // DAY 5 — THE FOUR DAYS, AND THE FORK  (UPDATED — no letter)
  // ===================================================================
  {
    day: 5,
    arrivalTitle: 'The four days, and the fork.',
    arrivalSubtitle: 'What you have seen. What you decide.',
    artifactType: 'notice_day_5',
    openings: {
      A: {
        intro: `Today is the close of Notice.

You'll see the four days assembled — what you crossed, where you've drifted, what those closest to you have been doing, the ledger of what you've given up.

Then you'll be given three doors. There's no right one. Each is fully respected.

No commentary from us today. The day is yours.`
      }
    },
    mechanic: {
      type: 'threeDoorsNotice',
      data: {
        landingPrompt: 'Looking at the four days:',
        landingOptions: [
          { id: 'harder_than_expected', label: 'It landed harder than I expected.' },
          { id: 'about_as_expected', label: 'It landed about as expected.' },
          { id: 'didnt_feel_anything', label: `I didn't really feel anything looking at it.` },
        ],
        doors: [
          {
            id: 'reflect',
            number: 1,
            title: 'I want to look at this more carefully.',
            description: 'This routes to Reflect — the next stage. Twenty-one days of more structured looking. Not commitment to stop. Just looking, more deeply.',
            confirmTitle: 'Reflect begins now.',
            confirmBody: `Twenty-one days. Three weeks. By the end, you'll have a picture of yourself you don't have today.`,
            confirmButton: 'Begin Reflect Day 1',
          },
          {
            id: 'wait_30_days',
            number: 2,
            title: 'I need time to sit with this.',
            description: 'The Vow Path closes for 30 days. The Stage Check becomes available again after that, if you want to return. Nothing more is asked of you.',
            confirmTitle: 'Take your time.',
            confirmBody: 'The Vow Path closes today. The Stage Check becomes available again in 30 days. You can return to your records anytime through your home screen.',
            confirmButton: 'Close',
          },
          {
            id: 'not_for_me',
            number: 3,
            title: `I've looked. This isn't for me.`,
            description: `The Vow Path closes permanently. You won't be prompted to return. Your records are preserved privately. Nothing more is asked of you.`,
            confirmTitle: 'Understood.',
            confirmBody: `The Vow Path closes today. You won't be prompted to return. The records of what you've looked at are preserved privately in your Vow account. We're glad you looked. That matters more than what you decided.`,
            confirmButton: 'Close the Vow Path',
          }
        ]
      }
    },
    closingTitle: 'You looked.',
    closingBody: 'That matters more than what you decided.',
  },
]

export function getNoticeDay(dayNumber) {
  return NOTICE_V2_DAYS.find(d => d.day === dayNumber) || null
}

export function getNoticeOpeningVariant(dayNumber, completedStages = []) {
  const day = getNoticeDay(dayNumber)
  if (!day) return null

  if (dayNumber === 1 && completedStages.some(c => c.stage === 'notice')) {
    return day.openings.C || day.openings.A
  }

  return day.openings.A
}