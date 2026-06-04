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
    practice: {
      eyebrow: 'Between now and tomorrow',
      archetype: 'catch',
      title: 'Catch the next small line.',
      body: [
        `Today you named lines you\u2019ve already crossed. Before tomorrow, watch for a small new one as it happens \u2014 the extra one, the earlier start, the rule quietly bent.`,
        `You don\u2019t have to stop it. Just catch yourself crossing, once, while it\u2019s happening. A line you can see yourself cross has less hold than one you cross in the dark.`,
      ],
      button: `I\u2019ll carry this`,
    },
    founderAudio: {
      audioSrc: 'notice/day_01.mp3',
      transcript: `Hi. It's Ninad. I'm the person who made this.

I want to tell you why this app exists, and then I'll get out of your way.

I made Vow because I used to be exactly where you are right now. Holding a phone, opening something like this, not totally sure if I was serious or just poking at the idea. And every app I tried wanted to congratulate me. Counters, streaks, badges, green checkmarks. Like I'd won something. I hadn't won anything. I was scared, and I was tired, and the last thing I needed was an app telling me I was on a roll.

So Vow doesn't do that. There's no streak to break in here. There's no number you can lose. If you slip, you don't get punished, and you don't get sent back to the start. That was the whole point of building it.

What you're in right now is called Notice. It's small on purpose. We are not asking you to quit anything yet. We're not asking you to promise anything. For these few days, all you're doing is looking. Just paying attention to something you've probably spent a long time not looking at directly.

That's the whole job for now. Look.

I'll talk to you again further in. For now — I'm genuinely glad you opened this. That part is harder than it sounds, and you already did it.

Okay. Go ahead.`,
    },
    openings: {
      A: {
        intro: `You're here because the Stage Check placed you in Notice. Most people who land here don't think they have a problem. They've heard the warnings. They've read the lists of symptoms. None of it has felt like it was about them.

So this stage doesn't try to convince you of anything. There's no lecture coming. For five days, all it does is hand you back things you already know about yourself — laid out plainly enough that they're harder to look past than they usually are.

Here's the first one.

Almost everyone who uses a substance regularly has lines. Not rules someone else handed them — their own. The thing they told themselves, early on, that they would never do. "Not in the morning." "Not alone." "Never around the kids." These come before any diagnosis, before any chart. They're quieter than that — a kind of private agreement about the sort of person you are.

The thing about lines is that they move. Slowly, one reasonable exception at a time, until the line sits somewhere you'd never have agreed to if someone had shown you the whole distance at once. Nobody decides to cross them. You just look up one day and they're behind you.

Today is in two parts. First you'll name your lines — the ones you actually held, not the ones that sound right. Then you'll mark the ones you've crossed. No one sees this but you. The crossed lines are yours. The ones still standing are yours too — and they matter just as much.`
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
    practice: {
      eyebrow: 'Between now and tomorrow',
      archetype: 'map',
      title: 'Find where it drifted.',
      body: [
        `You mapped how far the pattern has moved from where it began. Sometime today, take one ordinary detail \u2014 the amount, the time of day, the reason you reach for it \u2014 and remember honestly what it was a year or two ago.`,
        `Don\u2019t judge the gap. Just let yourself see, once, how far the quiet drift has actually carried you.`,
      ],
      button: `I\u2019ll carry this`,
    },
    openings: {
      A: {
        intro: `Yesterday was about lines — the edges you set, and where you've crossed them. Today is about movement.

Most people who use regularly tell themselves the use is steady. "It's the same as it's always been." "I've had this handled for years." Sometimes that's true. More often the pattern has been moving the whole time — slowly enough that no single day ever looked different from the one before it, and obvious only when you stand back and look across years instead of days.

That's what today does. It maps your trajectory — not how much you use, but where you've been on a ladder of behavior, at five points across your life.

We use behavior instead of amount on purpose. Amount is easy to argue with — "that was a rough stretch," "everyone uses like that sometimes." A pattern of behavior is harder to talk your way out of. You either started using alone at some point, or you didn't. You either think about it first thing now, or you don't.

You'll read the ladder once, then place yourself at each point in time. Most people aren't surprised by where they are today — they already know that. They're surprised by the line that connects the dots: how far it has moved, and which way.`
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
    practice: {
      eyebrow: 'Between now and tomorrow',
      archetype: 'watch',
      title: 'Watch one person, once.',
      body: [
        `Today you wrote down what the people around you have quietly been doing. Before tomorrow, pick one of them and just notice them \u2014 what they ask, what they\u2019ve stopped asking, how they are around you.`,
        `You don\u2019t have to say anything or fix anything. Today is only for seeing them clearly, once.`,
      ],
      button: `I\u2019ll carry this`,
    },
    openings: {
      A: {
        intro: `You don't have to believe you have a problem to notice what's been happening around it.

The people closest to you have been responding to your use for a while now — usually without a single confrontation. The responses are small and easy to miss from the inside: a question someone stopped asking, a plan that quietly stopped including you, a version of yourself you only seem to become around certain people.

Today is a ledger of those things. It works like a list, except every line is something that has actually happened. You'll read through them and tap the ones that are true for you. Not the ones that sound bad — the ones you recognize.

You don't have to name names, and you don't have to explain anything. Most people tap more than they expected to. That's the whole reason to write it down: the using mind keeps these scattered and out of view, and a list is much harder to scatter.`
      }
    },
    mechanic: {
      type: 'ledgerOfForgone',
      data: {
        prompt: 'What has actually been happening with the people around you?',
        subtext: `Tap every one that's true. Not what sounds bad — what you actually recognize.`,
        minSelections: 3,
        helperText: 'Most people tap 6-12. Take your time.',
        categories: [
          {
            key: 'conversations',
            label: 'Conversations',
            items: [
              { id: 'cant_remember_real', label: `I can't remember the last fully present conversation I had with someone close — nothing in my system` },
              { id: 'shorter', label: 'Conversations with certain people have quietly gotten shorter' },
              { id: 'avoid_sober', label: `I put off serious talks until after I've used` },
              { id: 'half_there', label: `I'm often only half-there when someone's talking to me` },
              { id: 'lost_track', label: `I've lost track of what's actually going on in the lives of people I care about` },
            ]
          },
          {
            key: 'what_they_stopped',
            label: `What they've stopped doing`,
            items: [
              { id: 'stopped_asking', label: 'Someone stopped asking how I am' },
              { id: 'stopped_inviting', label: 'I get invited to fewer things than I used to' },
              { id: 'stopped_relying', label: 'Someone stopped relying on me for things they used to' },
              { id: 'stopped_bringing_up', label: 'Someone used to bring up my use, and then stopped' },
              { id: 'stopped_expecting', label: 'People have stopped expecting me to follow through' },
            ]
          },
          {
            key: 'around_my_use',
            label: 'What I arrange around it',
            items: [
              { id: 'time_use', label: 'I time my use around when people are home or asleep' },
              { id: 'hide_amount', label: 'I keep the real amount or frequency to myself' },
              { id: 'made_sure', label: `Someone brought it up once, and I made sure they wouldn't again` },
              { id: 'lie_small', label: 'I tell small lies about where I was or what I did' },
              { id: 'plan_around', label: 'I make or skip plans depending on whether I can use' },
            ]
          },
          {
            key: 'who_i_am',
            label: 'Who I am around them',
            items: [
              { id: 'quieter_version', label: `There's a person I'm a quieter, more guarded version of myself around now` },
              { id: 'shorter_temper', label: 'I have a shorter temper with people who matter to me' },
              { id: 'less_present_parent', label: `I'm less present as a parent than I want to be` },
              { id: 'two_versions', label: `There's a me before I use and a me after, and people can tell which one they're getting` },
              { id: 'withdraw', label: 'I withdraw from people rather than let them see me using' },
            ]
          },
          {
            key: 'trust',
            label: 'Trust',
            items: [
              { id: 'trust_cooled', label: 'A relationship has cooled, and I know my use is part of why' },
              { id: 'broken_small_promises', label: `I've broken small promises enough times that they've stopped landing` },
              { id: 'someone_worries', label: 'Someone close worries about me and tries not to show it' },
              { id: 'someone_gave_up', label: 'Someone seems to have quietly given up on saying anything' },
            ]
          },
        ],
        allowCustom: true,
        customPrompt: `Something else that's been happening`,
        selfNamingPrompt: 'Looking at the ledger:',
        selfNamingOptions: [
          { id: 'knew', label: 'I knew this was the shape of things.' },
          { id: 'didnt_realize', label: `I didn't realize how much had quietly changed.` },
          { id: 'want_to_argue', label: `I want to argue with parts of it, but I tapped them.` },
        ]
      }
    },
    closingTitle: 'The people have been part of this.',
    closingBody: `None of this needed a confrontation to be true.

It has been happening in the small things — and now it is written down where you can see it.`,
  },

  // ===================================================================
  // DAY 4 — THE LEDGER OF FORGONE THINGS  (NEW — replaces letter)
  // ===================================================================
  {
    day: 4,
    arrivalTitle: 'What you have given up.',
    arrivalSubtitle: `The ledger most people don't keep.`,
    artifactType: 'notice_day_4',
    practice: {
      eyebrow: 'Between now and tomorrow',
      archetype: 'shed',
      title: 'Catch one thing you set down.',
      body: [
        `You listed the things your use has quietly cost you \u2014 the hobbies, the plans, the mornings. Sometime today, catch one of them in real life: the thing you\u2019d have done, the person you\u2019d have called, the hour you\u2019d have spent otherwise.`,
        `Not to feel bad. Just to turn one line on the ledger into something real you can see.`,
      ],
      button: `I\u2019ll carry this`,
    },
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
              { id: 'first_hour', label: `The first hour of the day, before I've reached for anything` },
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
              { id: 'boredom', label: 'The ability to sit with a dull moment without reaching for something' },
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
              { id: 'remembered_conversations', label: `Conversations I'd actually remember the next day` },
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
        ],
        mostWantBackPrompt: 'Of everything here, which one would you most want back?',
        mostWantBackSubtext: 'Just one. The one that, if you could have it back, would matter most.',
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
            description: 'Nothing more is asked of you right now. The Vow Path stays open — your records are here, and this fork waits for you. Come back and choose when you are ready.',
            confirmTitle: 'Take your time.',
            confirmBody: 'Nothing closes. The Path stays here, and you can return to this fork from your home screen whenever you want to go on — tomorrow, next week, or further out.',
            confirmButton: 'Done for now',
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