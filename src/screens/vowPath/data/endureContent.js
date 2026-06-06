// =====================================================================
// ENDURE STAGE CONTENT — 21 DAYS
// =====================================================================
// Methodology: Marlatt/Gordon Relapse Prevention (AVE, lapse-vs-relapse),
// Pia Mellody (shame and inner-child work via structured selection),
// Polyvagal theory (Porges, Dana — three states, regulation),
// William White Recovery Capital (4 capitals),
// Indian contemplative traditions (sakshi bhava witness consciousness,
// Bhagavad Gita on action without attachment to fruit).
// =====================================================================

export const ENDURE_TOTAL_DAYS = 21

export const ENDURE_PHASES = [
  {
    key: 'phase_1',
    title: 'Phase 1 — Crash and what is underneath',
    subtitle: 'The first week.',
    dayRange: [1, 7],
  },
  {
    key: 'phase_2',
    title: 'Phase 2 — The flatness',
    subtitle: 'The middle week.',
    dayRange: [8, 14],
  },
  {
    key: 'phase_3',
    title: 'Phase 3 — The return',
    subtitle: 'The third week.',
    dayRange: [15, 21],
  },
]

export const ENDURE_DAYS = [

  // ===================================================================
  // DAY 1 — DAY ZERO RITUAL
  // ===================================================================
  {
    day: 1,
    arrivalTitle: 'Day Zero.',
    arrivalSubtitle: 'You marked it.',
    artifactType: 'endure_day_1',
    founderAudio: {
      transcript: `Hi. It's Ninad.

You started. Whatever today felt like — and it might have felt like hell — you started, you're here, and right now that is the only thing that matters.

I'm going to be honest with you, because I think you'd rather have the truth than a pep talk. This next stretch is the hardest part of the whole thing. Not the most dramatic. The hardest. Your body's adjusting. Your sleep might be wrecked. You might feel anxious, or angry, or just wrong in a way you can't quite point to. That is not a sign you're failing. That's the sign it's working. That's your whole system recalibrating after a long time of running on something else.

Here's what I need you to know going in. This phase is loud at first, and then it goes quiet — and the quiet is actually the trickier part. I'll talk to you about that when we get there. For right now, while it's loud: you do not have to get through the whole month today. You don't even have to get through tomorrow. You have to get through the next hour. And when that one's done, the next one. That is the real unit of this. Not thirty days. One hour.

When the urge comes, and it will, remember it's a wave, not a wall. It rises, it peaks, and if you don't feed it, it breaks. You've got the tools you built in Commit. Use them. They were never decoration. They were for exactly this.

I'm with you on this part. One hour at a time. Go.`,
      audioSrc: 'endure/day_01.mp3',
    },
    intro: [
      `Today is Day Zero — the day you stopped, or the day Vow asks you to mark as the start of Endure. It deserves a threshold, not a quiet slide into the work. So today there is a ritual and a map, and almost no reading.`,
      `The ritual is simple: a held breath, a marking, a line drawn between before and after. Thresholds matter because the mind remembers them. Years from now you may not recall Day 9 or Day 14, but you will remember the day you decided this one counted as the beginning.`,
      `The map is the first seventy-two hours, physiologically. The early days are the hardest in pure bodily terms — the system recalibrating without the thing it had been leaning on. Knowing roughly what to expect, hour by hour, takes some of the fear out of it: what feels like something going wrong is usually the body doing exactly what it should. Mark the threshold, then read the map. That is all today asks.`,
    ],
    mechanic: {
      type: 'guidedHold',
      data: {
        holdHeader: 'Hold the threshold.',
        holdSubtext: 'Place your finger on the circle. Hold for 10 seconds. Day Zero begins when you lift.',
        holdDuration: 10,
        holdCompleteTitle: 'Day Zero is marked.',
        holdCompleteSubtext: 'The next exercise is the 72-hour map.',
        mapHeader: 'The first 72 hours.',
        mapSubtext: `For most substances and behaviors, the first three days have specific physiological signatures. Tap what you're already noticing. Tap what you're worried about.`,
        mapCategories: [
          {
            key: 'sleep',
            label: 'Sleep',
            items: [
              { id: 'trouble_falling_asleep', label: 'Trouble falling asleep' },
              { id: 'waking_at_night', label: 'Waking through the night' },
              { id: 'vivid_dreams', label: 'Vivid or unsettling dreams' },
              { id: 'sleep_seems_okay', label: 'Sleep seems okay so far' },
            ]
          },
          {
            key: 'body',
            label: 'Body',
            items: [
              { id: 'sweating_restlessness', label: 'Sweating or restlessness' },
              { id: 'flu_like_symptoms', label: 'Flu-like aches or shivers' },
              { id: 'heightened_anxiety', label: 'Anxiety in the body — chest, stomach' },
              { id: 'tight_jaw_shoulders', label: 'Tight jaw, shoulders, or hands' },
              { id: 'body_feels_okay', label: 'Body feels okay so far' },
            ]
          },
          {
            key: 'mind',
            label: 'Mind',
            items: [
              { id: 'irritability', label: 'Irritability with people who matter' },
              { id: 'racing_thoughts', label: 'Racing or looping thoughts' },
              { id: 'mental_fog', label: 'Mental fog or slowness' },
              { id: 'brittle_calm', label: 'A strange brittle calm' },
              { id: 'craving_loud', label: 'The craving is loud' },
              { id: 'craving_quiet', label: 'The craving is quiet — almost suspicious' },
            ]
          },
        ],
        markingPrompt: 'Now / Worried about',
        nowLabel: 'Already noticing',
        worriedLabel: 'Worried about',
      }
    },
    closingTitle: 'Day Zero is marked.',
    closingBody: `The 72-hour map is in your records. Return to it when something is happening.

The first three days are different. Walk through them.`,
  },

  // ===================================================================
  // DAY 2 — POLYVAGAL INTRO
  // ===================================================================
  {
    day: 2,
    arrivalTitle: 'Three states.',
    arrivalSubtitle: 'A map of your own nervous system.',
    artifactType: 'endure_day_2',
    intro: [
      `Most people treat stopping as a battle of will. There is a more useful lens — your nervous system, and the three states it moves through.`,
      `Polyvagal theory describes three physiological states — not moods you choose, but gears your body shifts into. Settled, when you feel safe. Wound up, when it senses threat and mobilises. Shut down, when threat runs too long and it powers off to protect you.`,
      `For most people, the substance was the lever between them — something to drop from wound-up to settled, to lift out of shutdown, or to escape into numbness. It moved you between gears on command.`,
      `None of these is good or bad. The work is simply being able to name the one you're in — because you can't shift a gear you can't feel. Today you'll place yourself on the three, and find the earliest sign that tells you you're slipping.`,
    ],
    mechanic: {
      type: 'stateLocator',
      data: {
        states: [
          { id: 'settled', label: 'Settled', clinical: 'ventral vagal', color: '#7A8C5A', body: `Calm but awake. Curious. Able to look someone in the eye, to work, to rest and actually be restored. The state where connection feels possible.` },
          { id: 'wound_up', label: 'Wound up', clinical: 'sympathetic', color: '#C5572C', body: `Mobilised — heart up, muscles tight, mind racing or scanning. Can be sharp focus; can be anxiety or anger. The body braced for action.` },
          { id: 'shut_down', label: 'Shut down', clinical: 'dorsal vagal', color: '#6B7A88', body: `Low, flat, far away. Numb. Sleep doesn't restore. Hard to engage with anyone or anything. The body in preservation mode.` },
        ],
        placePrompt: `Here are the three. Where are you?`,
        placeNowLabel: 'Right now',
        placeUsualLabel: 'On a normal day',
        read: {
          settled: `Most days, you place yourself in settled — and that is real, and easy to undervalue. A regulated nervous system is quiet; it doesn't announce itself. The work here is less about getting somewhere and more about protecting it, and catching the slips early.`,
          wound_up: `Most days run wound up — alert, braced, the engine high. This is a body still scanning for threat, often louder early in sobriety because the substance used to mute exactly this. It is not a flaw to force down; it eases as safety and connection build. What you're after is more genuine rest, not constant calm.`,
          shut_down: `Most days sit closer to shut down — flat, numb, at a distance. This is the oldest protection: when wound-up runs too long, the system pulls the plug. It is exhausting, and easy to mistake for laziness, but it is protection, not failure. It lifts through gentle re-engagement, never through force.`,
          default: `That is your usual rung. Knowing it is the start — you can't change a pattern you can't see.`,
        },
        readTail: `Day 18 will map all of this in proportion — how your whole week splits across the three. For now, it is enough to know your rung, and to feel the shifts as they happen.`,
        signalPrompt: `When you start to slip from settled, what is the first sign in your body?`,
        signalOptions: [
          { id: 'jaw_shoulders', label: 'Jaw, neck, or shoulders tighten' },
          { id: 'chest_breath', label: 'Chest tightens, breath goes shallow' },
          { id: 'mind_speeds', label: 'My mind speeds up — racing or looping' },
          { id: 'energy_drops', label: 'Energy drops; things go foggy or heavy' },
          { id: 'irritable', label: 'Irritability — everything starts to grate' },
          { id: 'pull_away', label: 'I start pulling away from people' },
          { id: 'urge_numb', label: 'The urge to numb or escape shows up' },
        ],
      }
    },
    closingTitle: 'You located yourself.',
    closingBody: `The rung has a name now, and so does the first sign you're leaving it. That is what gives you a move other than the substance.`,
  },

  // ===================================================================
  // DAY 3 — PROTECTED EMOTIONS
  // ===================================================================
  {
    day: 3,
    arrivalTitle: 'What was underneath.',
    arrivalSubtitle: 'The emotions the substance was protecting you from.',
    artifactType: 'endure_day_3',
    intro: [
      `The using mind keeps the story simple: I used because I wanted to. The body tells a quieter, more honest version. Most substance use isn't really about the substance — it's about a feeling the substance made bearable, or made vanish for a while.`,
      `Psychologists call this experiential avoidance: the pull to escape an inner experience we don't want to have. The trouble is the feeling doesn't actually leave — it waits, and the avoiding slowly becomes its own second problem. What the substance protected you from is still there underneath, and meeting it directly, even briefly, is what loosens its grip.`,
      `So today you'll trace it in two layers. First, what the substance actually did for you — numbed, loosened, quieted, lifted. Then the feeling underneath that it was managing: the thing you were reaching past it to avoid. Naming a feeling is not the same as being overwhelmed by it. Named, it becomes something you can work with, instead of something that quietly runs you from below.`,
    ],
    mechanic: {
      type: 'protectedEmotionsMap',
      data: {
        functionsPrompt: `What did it do for you, in the moment?`,
        functions: [
          { id: 'edge_off', label: 'Took the edge off — made the day bearable' },
          { id: 'quiet_head', label: 'Quieted my head — stopped the noise' },
          { id: 'feel_something', label: 'Made me feel something — when I had gone numb' },
          { id: 'with_people', label: 'Made me okay around people' },
          { id: 'numb_ache', label: 'Numbed an ache I did not want to feel' },
          { id: 'a_break', label: 'Gave me a break from being me' },
          { id: 'reward', label: 'Was the reward — the thing to look forward to' },
          { id: 'switch_off', label: 'Let me stop, switch off, and sleep' },
        ],
        underneathPrompt: `And underneath that — what was it really managing?`,
        feelingGroups: [
          {
            key: 'core',
            label: 'Core feelings',
            items: [
              { id: 'loneliness', label: 'Loneliness' },
              { id: 'shame', label: 'Shame' },
              { id: 'anger', label: 'Anger I was never allowed' },
              { id: 'grief', label: 'Grief, old and unresolved' },
              { id: 'fear', label: 'Fear with no object' },
              { id: 'emptiness', label: 'Emptiness' },
            ],
          },
          {
            key: 'relational',
            label: 'Relational',
            items: [
              { id: 'unloved', label: 'Being unloveable' },
              { id: 'invisible', label: 'Being invisible' },
              { id: 'too_much', label: 'Being too much' },
              { id: 'not_enough', label: 'Being not enough' },
              { id: 'abandoned', label: 'Being abandoned' },
            ],
          },
          {
            key: 'existential',
            label: 'Deeper down',
            items: [
              { id: 'pointlessness', label: 'That none of it matters' },
              { id: 'failure', label: 'Being a failure' },
              { id: 'imposter', label: 'Being an imposter' },
              { id: 'stuck', label: 'Being stuck, no way forward' },
            ],
          },
        ],
        allowCustom: true,
        customPrompt: 'Another feeling it was managing',
        read: {
          lead: `Underneath the reasons, what the substance was holding down were feelings — most of them older than the using itself.`,
          reframe: `Here is what the using mind gets backwards: these were never the problem. They are information — signals, not threats. The problem was that the substance was the only exit you had. Recovery isn't making them disappear. It is building other ways to be with them, until you no longer need the old door.`,
        },
        followUpPrompt: `Looking at what you lifted:`,
        followUpOptions: [
          { id: 'all_familiar', label: 'All of these were familiar before the substance arrived.' },
          { id: 'started_before', label: 'Most of them started long before the substance did.' },
          { id: 'substance_made_them_worse', label: 'The substance made some of them worse over time.' },
          { id: 'first_time_seeing', label: 'Some of these I am seeing clearly for the first time.' },
        ],
        keyPrompt: `Without the substance, which one most needs another way through now?`,
        withPrompt: `One way to stay with it — not to fix it, just to be with it:`,
        withOptions: [
          { id: 'name_it', label: `Name it out loud — "this is grief"` },
          { id: 'breathe', label: 'Stay with it and breathe, for sixty seconds' },
          { id: 'tell', label: 'Tell one person it is here' },
          { id: 'move', label: 'Move my body until it loosens' },
          { id: 'write', label: 'Write it down, unfiltered' },
          { id: 'watch', label: 'Let it be — watch it crest and pass' },
        ],
      }
    },
    closingTitle: 'They are named.',
    closingBody: `Naming is not curing. But the using mind can't pretend they aren't there anymore — and now you know which door to build first.`,
  },

  // ===================================================================
  // DAY 4 — AVE PROTOCOL
  // ===================================================================
  {
    day: 4,
    arrivalTitle: 'A lapse is not a relapse.',
    arrivalSubtitle: `What you'll do if you slip.`,
    artifactType: 'endure_day_4',
    intro: [
      `Most people who slip in early sobriety don't relapse because the substance won. They relapse because of the story that starts the moment after: "I've blown it." Marlatt and Gordon named this in 1985 — the Abstinence Violation Effect. One slip triggers shame; the shame says the day, the week, the whole effort is ruined; and that thought, not the substance, is what turns one use into ten.`,
      `So the real intervention isn't willpower in the moment — it is a decision made now, before any slip. A small, clear path for what you do if it happens, built to interrupt the story before it gathers speed.`,
      `Pre-deciding this does not make slipping more likely. It makes a single slip stay a single slip. Today, before anything has happened, you'll build that path — one move at each step — and write the line you'll tell yourself if the moment comes.`,
    ],
    mechanic: {
      type: 'aveProtocolBuilder',
      data: {
        teachIntro: [
          `Most people who slip in early sobriety don't relapse because the substance won. They relapse because of the story that starts the moment after: "I've blown it." Marlatt and Gordon named this in 1985 — the Abstinence Violation Effect. One slip triggers shame; the shame says the day, the week, the whole effort is ruined; and that thought, not the substance, is what turns one use into ten.`,
          `So the real intervention isn't willpower in the moment — it is a decision made now, before any slip. A small, clear path for what you do if it happens, built to interrupt the story before it gathers speed.`,
          `Pre-deciding this does not make slipping more likely. It makes a single slip stay a single slip.`,
        ],
        stations: [
          {
            id: 'first_minute',
            label: 'The first minute',
            cue: `The moment you realise — before the shame builds, before the next one feels inevitable.`,
            options: [
              { id: 'stop_immediately', label: 'Stop. Put down whatever is in hand.' },
              { id: 'leave_the_room', label: 'Leave the room — change location, physically.' },
              { id: 'say_it_aloud', label: 'Say it out loud: this is a slip, not the end.' },
              { id: 'message_someone', label: 'Message your person — even one word.' },
              { id: 'ten_breaths', label: 'Sit down. Ten slow breaths.' },
            ],
          },
          {
            id: 'first_hour',
            label: 'The first hour',
            cue: `The shame is loudest now. It will tell you the day is already ruined.`,
            options: [
              { id: 'call_someone', label: 'Call someone — a voice, not a text.' },
              { id: 'write_it_plainly', label: 'Write what happened, plainly, no judgement.' },
              { id: 'remember_why', label: 'Bring to mind exactly why you started.' },
              { id: 'walk_outside', label: 'Walk outside, twenty minutes.' },
              { id: 'name_underneath', label: 'Name what is actually happening underneath.' },
            ],
          },
          {
            id: 'first_day',
            label: 'The rest of that day',
            cue: `The day is not blown. The relapse is what happens next — not what already happened.`,
            options: [
              { id: 'no_second_slip', label: 'No second slip — sober again from here.' },
              { id: 'eat_real_meal', label: 'Eat a real meal.' },
              { id: 'one_small_routine', label: 'Return to one routine — water, a walk, a shower.' },
              { id: 'reach_person', label: 'Reach one person who knows the work.' },
              { id: 'sleep_normal', label: 'Sleep at your normal time.' },
            ],
          },
        ],
        reframePrompt: `Pick the one you can actually believe:`,
        reframeOptions: [
          { id: 'one_slip', label: 'One slip is not a relapse. The relapse is what I do next.' },
          { id: 'data_not_verdict', label: 'This is data, not a verdict on me.' },
          { id: 'choosing_again', label: 'I am choosing to stop again. Right now.' },
          { id: 'no_perfect_record', label: 'Recovery does not need a perfect record. It needs continuing.' },
        ],
        reframeWritePrompt: `Now, in your own words — the line you would actually say to yourself:`,
        twoStories: {
          ave: `"I've blown it. Might as well finish what I started — I'm a failure anyway."`,
          data: `"That was one use. It is information about a gap in the plan, not proof of who I am. I stop again, now."`,
        },
      }
    },
    closingTitle: 'The path exists.',
    closingBody: `Built before any slip, and waiting if one comes. A slip is data now, not a verdict — and you already know your first move.`,
  },

  // ===================================================================
  // DAY 5 — STATE-MATCHED RESPONSE
  // ===================================================================
  {
    day: 5,
    arrivalTitle: 'State-matched response.',
    arrivalSubtitle: 'The right move depends on where you are.',
    artifactType: 'endure_day_5',
    intro: [
      `On Day 2 you met the three states — settled, wound up, and shut down. Today matches your response to whichever one you're actually in, because the same move that soothes one state can make another worse. Matching matters more than effort: the right small move in the right state beats a big effort in the wrong one.`,
      `A long exhale calms a wound-up system but deepens a shut-down one. A brisk walk helps when you're steady but is close to impossible in deep shutdown. Cold water shocks shutdown back into motion — exactly the wrong thing when you're already revved. One strategy can't cover all three.`,
      `So you'll build a small, specific plan for each state: how you'll know you're in it, the one move you reach for first, and a backup if that isn't enough. The point is to decide now, while it's calm — so that in the moment you're following a plan you already trust, instead of improvising at your worst.`,
    ],
    mechanic: {
      type: 'stateMatchedResponse',
      data: {
        sectionPrompts: {
          sign: `How you'll know you're here`,
          primary: 'Your first move',
          backup: `If that's not enough`,
        },
        states: [
          {
            key: 'sympathetic',
            color: '#C5572C',
            label: 'When sympathetic — wound up, anxious',
            subtext: 'Bring the charge down without numbing it.',
            signs: [
              { id: 'racing_thoughts', label: 'Racing thoughts, hard to slow down' },
              { id: 'tight_body', label: 'Tight chest, jaw, or shoulders' },
              { id: 'cant_sit', label: `Can't sit still` },
              { id: 'short_fuse', label: 'Short fuse — easily irritated' },
              { id: 'heart_pounding', label: 'Heart pounding' },
            ],
            moves: [
              { id: 'long_exhale', label: 'Long, slow exhales — breathe out longer than you breathe in' },
              { id: 'cool_water_sym', label: 'Cool water on the wrists and face' },
              { id: 'slow_walk', label: 'A slow walk — no phone, no destination' },
              { id: 'burn_it_off', label: 'Push hard for sixty seconds, then stop and feel it drain' },
              { id: 'name_it_sym', label: `Say it out loud: "I'm revved up. It will pass."` },
            ],
          },
          {
            key: 'dorsal',
            color: '#6B7A88',
            label: 'When dorsal — shut down, numb, flat',
            subtext: 'Get the system moving again, gently.',
            signs: [
              { id: 'heavy', label: 'Heavy, hard to move' },
              { id: 'foggy', label: 'Foggy, far away' },
              { id: 'no_talk', label: `Don't want to talk to anyone` },
              { id: 'nothing_worth', label: 'Nothing feels worth doing' },
              { id: 'time_blur', label: 'Losing track of time' },
            ],
            moves: [
              { id: 'feet_down', label: 'Stand up. Press both feet into the floor.' },
              { id: 'cold_water_dorsal', label: 'Cold water on the face — one sharp shock' },
              { id: 'five_things', label: 'Name five things you can see, out loud' },
              { id: 'hum_sing', label: 'Hum or sing for a minute' },
              { id: 'hear_a_voice', label: 'Call someone — just to hear a voice' },
            ],
          },
          {
            key: 'ventral',
            color: '#7A8C5A',
            label: 'When ventral — steady, here, okay',
            subtext: `You're in a good state. Keep it, and use it.`,
            signs: [
              { id: 'breathe_easy', label: 'Breathing comes easy' },
              { id: 'interested', label: 'Actually interested in something' },
              { id: 'want_reach', label: 'You want to reach out' },
              { id: 'present', label: 'Present, not bracing for anything' },
              { id: 'shoulders_down', label: 'Shoulders down' },
            ],
            moves: [
              { id: 'savor', label: `Name what's good right now, slowly` },
              { id: 'reach_easy', label: `Reach out to someone while it's easy` },
              { id: 'absorbing', label: 'Do something absorbing you genuinely like' },
              { id: 'set_up_later', label: `Put one thing in place for later — you're clear now` },
              { id: 'rest_on_purpose', label: 'Rest on purpose — no screen' },
            ],
          },
        ],
        allowCustom: true,
        customPrompt: 'Your own',
      }
    },
    closingTitle: 'The toolkit is built.',
    closingBody: `Different state, different move — and the right one is now decided before you need it.`,
  },

  // ===================================================================
  // DAY 6 — SHAME STATEMENT
  // ===================================================================
  {
    day: 6,
    arrivalTitle: 'Shame is not the same as guilt.',
    arrivalSubtitle: 'And it does not have to run things.',
    artifactType: 'endure_day_6',
    intro: [
      `Guilt is "I did a bad thing." Shame is "I am bad." Guilt is about behavior. Shame is about identity. Guilt motivates change. Shame motivates hiding — and, often, more use.`,
      `Almost everyone who develops a substance pattern carries shame underneath it. Some of it is shame about the use itself. Most of it is older — shame from family of origin, shame from specific events, shame that the using self has been managing for years.`,
      `Today's exercise doesn't ask you to write about your shame. It asks you to name what the shame has been saying — in its own words, the ones the using mind has heard for years. You'll build the whole statement first. Then, one part at a time, you'll see a more accurate version of each piece.`,
      `Pia Mellody's work on developmental trauma and inner-child shame is the foundation of this exercise. The structure here is hers, adapted for the format.`,
    ],
    mechanic: {
      type: 'shameStatement',
      data: {
        version: 'baseline',
        introCard: `This isn't positive thinking, and the alternative framings aren't affirmations. Shame makes claims that are global, permanent, and total \u2014 about all of you, forever. The more accurate version is simply more precise: specific where the shame is global, temporary where it's permanent, about behaviour where the shame is about your worth.`,
        components: [
          {
            id: 'who_i_am',
            prompt: 'The shame says I am:',
            options: [
              { id: 'broken', label: 'Broken \u2014 something in me is fundamentally damaged', reframe: 'Not broken. A person with a substance pattern \u2014 one of the most common and most treatable patterns there is.' },
              { id: 'weak', label: "Weak \u2014 everyone else has willpower and I don't", reframe: 'Not weak. Willpower was never the mechanism. A substance has been doing a job inside your nervous system \u2014 that is chemistry, not character.' },
              { id: 'failure', label: 'A failure \u2014 at work, at relationships, at life', reframe: 'Not a failure. A person with real successes and real costs, like anyone \u2014 except some of yours got tangled up with a substance.' },
              { id: 'too_much', label: 'Too much for people, and somehow not enough \u2014 both at once', reframe: 'A person whose sense of "too much" and "not enough" was shaped long before the substance, and can be looked at directly now.' },
              { id: 'bad_person', label: 'A bad person, underneath all of it', reframe: 'A person who has done things you regret while a substance was involved. That is behaviour. It is not the same as being bad.' },
              { id: 'should_have', label: 'Someone who should have sorted this out years ago', reframe: 'A person sorting it out at the first moment it actually became possible. Earlier was not available to you.' },
            ]
          },
          {
            id: 'what_i_deserve',
            prompt: 'The shame says I deserve:',
            options: [
              { id: 'nothing', label: "Nothing good \u2014 not until I've fixed this", reframe: 'The same patience and care you would give a friend in exactly this situation \u2014 starting now, not after.' },
              { id: 'punishment', label: 'To be punished for what I have done', reframe: 'Accountability for specific actions, and repair where it is possible. Punishing your whole self is not repair \u2014 it is just more shame.' },
              { id: 'alone', label: 'To carry this alone', reframe: 'Support. Almost no one does this alone, and the ones who try relapse more often, not less.' },
              { id: 'suffering', label: "To suffer \u2014 it's what I've earned", reframe: 'No one has to suffer to deserve recovery. Suffering does not pay anything back.' },
              { id: 'no_help', label: 'No help \u2014 I should be able to do this myself', reframe: 'Help is how most lasting change actually happens. Needing it is ordinary, not shameful.' },
            ]
          },
          {
            id: 'what_others_think',
            prompt: 'The shame says other people think:',
            options: [
              { id: 'disappointing', label: 'I am a disappointment to the people who matter', reframe: 'Most people who love you are far more worried about you than disappointed in you. Shame predicts the harshest version, and it is usually wrong.' },
              { id: 'avoided', label: 'People keep their distance because of this', reframe: 'Most of the distance you feel is built from the inside by the using self \u2014 not put there by others.' },
              { id: 'never_trust', label: 'No one will ever fully trust me again', reframe: 'Trust returns through ordinary, repeated, kept commitments. Slowly \u2014 but it does return. It is not gone for good.' },
              { id: 'burden', label: 'I am a burden to everyone around me', reframe: 'The people close to you are not counting your costs the way you are. To them you are a person they care about who is going through something.' },
              { id: 'seen_through', label: "If people really knew me, they'd think less of me", reframe: 'People who have watched someone through this tend to respond with recognition, not contempt. Being known is usually safer than the shame predicts.' },
            ]
          },
          {
            id: 'what_future_holds',
            prompt: 'The shame says about what comes next:',
            options: [
              { id: 'too_late', label: "It's too late for me \u2014 the damage is already done", reframe: 'It is not too late. The body and brain begin repairing within days of stopping and keep repairing for years. "Too late" is a feeling, not a finding.' },
              { id: 'always_like_this', label: "I'll always be like this \u2014 this is just who I am now", reframe: 'A substance pattern is a state you are in, not a fixed identity. States change. People move out of this one every day.' },
              { id: 'one_slip_over', label: 'One slip and the whole thing is over', reframe: 'Recovery is a direction, not a clean record. A slip is a data point on the way \u2014 not the end of the road.' },
              { id: 'never_normal', label: "I'll never get a normal life with this hanging over me", reframe: 'Most people in steady recovery describe fuller lives, not smaller ones. The "normal" the shame mourns is often what was keeping you stuck.' },
            ]
          },
        ],
        wholeHeader: 'What the shame has been saying.',
        wholeSubtext: 'Read it as one thing. This is the story it tells \u2014 not the situation you are in.',
        reframeHeader: 'Closer to true.',
        reframeSubtext: 'The shame said one thing. Here is the more accurate version of each part \u2014 read slowly.',
      }
    },
    closingTitle: 'The statement is on paper now.',
    closingBody: `The shame told a story. You wrote down what the story has been saying. That's the first move.`,
  },

  // ===================================================================
  // DAY 7 — PHASE 1 CLOSE
  // ===================================================================
  {
    day: 7,
    arrivalTitle: 'Phase 1, close.',
    arrivalSubtitle: 'The first week.',
    artifactType: 'endure_day_7',
    intro: [
      `Today closes Phase 1 — the first week, and often the hardest stretch in pure physiological terms. The body has been recalibrating without the thing it leaned on, and you stayed with it. That is not a small thing, even when it doesn't feel dramatic from the inside.`,
      `Closings matter as much as openings. Without them the days blur together and progress turns invisible — you only ever feel how far is left, never how far you've come. So today is deliberately short: a brief summary of what the first week covered, and a single tap for how it actually landed. No new work, no reading to push through.`,
      `Then Phase 2 begins tomorrow — the middle week, with a different texture entirely. The acute physical storm settles, and in its place comes the flatness: the strange greyness where nothing quite registers. It's a different kind of challenge, and naming it in advance makes it easier to meet. For now, just mark the week you finished.`,
    ],
    mechanic: {
      type: 'phaseClose',
      data: {
        phaseNumber: 1,
        phaseName: 'Phase 1 — Crash and what is underneath',
        summaryItems: [
          { day: 1, label: 'Day Zero ritual', sublabel: 'The hold-tap and the 72-hour map' },
          { day: 2, label: 'Three states of the nervous system', sublabel: 'Polyvagal locator' },
          { day: 3, label: 'Protected emotions', sublabel: 'What the substance was helping you not feel' },
          { day: 4, label: 'AVE protocol', sublabel: 'Pre-decided response to a slip' },
          { day: 5, label: 'State-matched response', sublabel: 'Different state, different move' },
          { day: 6, label: 'Shame statement', sublabel: 'Naming the story, finding the reframe' },
        ],
        landingPrompt: 'How did the first week land?',
        landingOptions: [
          { id: 'harder_than_expected', label: 'It was harder than I expected.' },
          { id: 'about_what_expected', label: 'About what I expected.' },
          { id: 'easier_than_expected', label: 'Easier than I expected (which I want to be careful about).' },
          { id: 'lost_track', label: 'I lost track of the days. They blurred.' },
        ],
        nextPhasePreview: `Phase 2 — the flatness. The middle week is different in texture from the first. Less acute, more dulled. Many people describe it as worse, in a way, than the crash. We'll work with what is surfacing.`,
      }
    },
    closingTitle: 'Phase 1 is closed.',
    closingBody: `Phase 2 begins tomorrow.`,
  },

  // ===================================================================
  // DAY 8 — ANHEDONIA
  // ===================================================================
  {
    day: 8,
    arrivalTitle: 'The flatness, named.',
    arrivalSubtitle: 'Anhedonia — and why it is good news.',
    artifactType: 'endure_day_8',
    intro: [
      `If you're feeling flat right now — nothing tastes right, nothing's fun, nothing seems worth the effort — you're not imagining it, and you're not turning back into who you were. The flatness has a name: anhedonia. It's the dopamine system, deprived of the oversized signal it had been getting, going temporarily quiet.`,
      `Most people hit this around Day 7-14. It can feel identical to depression, but it isn't a verdict on your life and it isn't a sign something is wrong. It's the predictable middle of the body recalibrating — turning the gain back down to a normal range. It lifts over weeks, usually in flickers before it returns in full.`,
      `Here is the part that matters most, because it runs against instinct: while the system is quiet, you don't wait to feel like doing things. You do the small things anyway. The capacity for pleasure comes back through use, not before it — and the people who keep gently touching what still lands get their range back faster than the ones who wait to feel motivated.`,
      `So today is two moves. First you'll map the flatness — where it's deepest, and what, surprisingly, still lands. Then you'll pick two of the things that still land and commit to returning to them every day this week. Naming it takes the weight off. Returning to the small things is what brings the colour back.`,
    ],
    mechanic: {
      type: 'anhedoniaAssessment',
      data: {
        prompt: 'Where is the flatness?',
        subtext: 'Tap each one that fits your experience right now.',
        categories: [
          {
            key: 'sensory',
            label: 'Sensory pleasure',
            items: [
              { id: 'food_taste', label: 'Food tastes flat or wrong' },
              { id: 'music', label: `Music doesn't move me the way it did` },
              { id: 'physical_touch', label: 'Physical touch feels less rewarding' },
              { id: 'beauty', label: `Things I used to find beautiful don't land` },
            ]
          },
          {
            key: 'social',
            label: 'Social pleasure',
            items: [
              { id: 'conversation', label: 'Conversation feels effortful, not rewarding' },
              { id: 'humor', label: 'Things are not as funny as they should be' },
              { id: 'intimacy', label: 'Intimacy feels distant' },
              { id: 'recognition', label: 'Recognition or praise lands flat' },
            ]
          },
          {
            key: 'achievement',
            label: 'Achievement pleasure',
            items: [
              { id: 'finishing_things', label: 'Finishing a task does nothing' },
              { id: 'small_wins', label: `Small wins don't register` },
              { id: 'progress', label: 'Progress feels meaningless' },
            ]
          },
          {
            key: 'whats_available',
            label: 'What is still available',
            items: [
              { id: 'sleep_relief', label: 'Sleep, when it comes, is relieving' },
              { id: 'cool_water', label: 'Cool water, sunlight, fresh air' },
              { id: 'pets', label: 'Time with pets or animals' },
              { id: 'kids', label: 'Kids — the unfiltered version of them' },
              { id: 'specific_smells', label: 'Specific smells — coffee, rain, food cooking' },
              { id: 'movement', label: 'The release after physical movement' },
            ]
          },
        ],
        revealTeaching: `While the dopamine system is quiet, motivation won't show up first \u2014 so you act without it. You keep touching the small things that still land: not to feel better today, but because the capacity comes back through use. Do the available things on purpose, and the signal returns faster than if you wait for it.`,
        anchorHeader: 'Choose two to return to.',
        anchorSubtext: 'From what still lands, pick two to return to every day this week \u2014 deliberately, on the calendar, not only when you feel like it.',
        anchorNote: 'Small. Daily. Even on the days they give almost nothing back \u2014 that is exactly how the signal comes back online.',
        allowCustom: true,
        customPrompt: 'Something else that still lands',
        followUpHeader: 'Looking at the assessment:',
        followUpOptions: [
          { id: 'mostly_flat', label: 'Most of it is flat right now. That is hard to sit in.' },
          { id: 'some_still_works', label: 'Some areas are flat, but more still works than I expected.' },
          { id: 'surprised_what_works', label: `I'm surprised by what is still landing.` },
          { id: 'naming_helps', label: 'Giving it a name takes some of the weight off.' },
          { id: 'will_do_the_two', label: `I'll do the two small things, even flat.` },
        ],
      }
    },
    closingTitle: 'The flatness has a name.',
    closingBody: `It will not feel like this forever \u2014 the dopamine system recalibrates over weeks, usually in flickers before it returns in full. The two things you chose are worth returning to every day, especially on the days they seem to give nothing back. That is the work right now.`,
  },

  // ===================================================================
  // DAY 9 — GUIDED WITNESS
  // ===================================================================
  {
    day: 9,
    arrivalTitle: 'The witness.',
    arrivalSubtitle: `Sakshi bhava — the part of you that watches.`,
    artifactType: 'endure_day_9',
    intro: [
      `Indian contemplative traditions name something the West has often missed — sakshi bhava, the witness consciousness. The part of you that is not your thoughts, not your feelings, not your cravings, not your body. The part that watches all of them happen.`,
      `In early sobriety, the witness is the most useful capacity you can develop. It lets you notice a craving without becoming the craving. Notice a shame thought without becoming a shamed person. Notice the flatness without taking it as who you now are.`,
      `Today's exercise is short — a guided sit, with prompts, for about five minutes. The point isn't to empty your mind or to get it right; it's to feel, directly and even briefly, what the witness actually is. Concepts about it don't help much. The felt sense of stepping back even an inch — of being the one who notices rather than the one swept along — is the whole thing. Once you've touched it, you can return to it on any hard day, and the craving or the shame becomes something you're watching pass rather than something you are.`,
    ],
    mechanic: {
      type: 'guidedWitness',
      data: {
        durationSeconds: 300, // 5 minutes
        prompts: [
          { atSecond: 0, text: `Sit comfortably. Eyes can be open or closed.` },
          { atSecond: 15, text: `Notice your breath. Don't change it. Just notice.` },
          { atSecond: 45, text: `Notice the thoughts that come. Don't push them away. Don't follow them.` },
          { atSecond: 90, text: `Notice that you are noticing the thoughts. There is the thinker. There is the watcher.` },
          { atSecond: 135, text: `Notice any feeling in the body. Don't change it. Just notice.` },
          { atSecond: 180, text: `Notice that you are noticing the feeling. There is the feeling. There is the watcher.` },
          { atSecond: 225, text: `The watcher does not need to do anything. It is already doing the work — just by watching.` },
          { atSecond: 270, text: `Return to your breath. Stay for the last 30 seconds.` },
          { atSecond: 300, text: `That was the witness. You can return to it any time.` },
        ],
        followUpHeader: 'After the sit:',
        followUpOptions: [
          { id: 'felt_it', label: 'I felt what the witness was.' },
          { id: 'partly_felt', label: 'I felt it partly. Some moments yes, some no.' },
          { id: 'hard_to_locate', label: `I couldn't really locate it. Will try again.` },
          { id: 'mind_too_loud', label: `My mind was too loud today.` },
        ],
      }
    },
    closingTitle: 'You met the witness.',
    closingBody: `Whatever you experienced was correct. The capacity is built through return, not through perfection.`,
  },

  // ===================================================================
  // DAY 10 — HALFWAY (FOUNDER AUDIO)
  // ===================================================================
  {
    day: 10,
    arrivalTitle: 'Halfway.',
    arrivalSubtitle: 'Ten days in.',
    artifactType: 'endure_day_10',
    founderAudio: {
      transcript: `Hi. It's Ninad.

You're about halfway through Endure. If the loud part has died down and you're now in a kind of grey, flat nothing — not in crisis anymore, but nothing really feels good either — then you've landed exactly where I wanted to talk to you.

This flatness is the part that ends most attempts. Not the crash. The crash is frightening, but it's obvious. You can see it coming and you brace for it. The flatness is sneaky. It doesn't hurt enough to scare you, and it lasts long enough to bore you, and one grey afternoon you think, well, if this is what sober feels like, what's even the point. And you go back. Not because you're weak. Because nobody warned you the grey was coming, or that it ends.

So I'm warning you. The grey is temporary. Here's what's actually happening. For a long time, your brain got its good feelings handed to it, so it quietly stopped making as much of its own. Now you've stopped the deliveries, and your own supply hasn't caught back up yet. That gap is the grey. And it closes. Your brain comes back online. Slowly, in patches, not in a straight line — but it comes back.

Don't try to fix the flatness with a quick hit of something. That only digs the hole deeper. Let the small stuff stay small for now. Walk, sleep, get some sunlight, the boring reliable things. You're not chasing a high. You're just letting the needle climb back up to normal.

Stay in the grey a little longer. It is not where you're going to live. It's the last stretch of road before the colour comes back. Keep going.`,
      audioSrc: 'endure/day_10.mp3',
    },
    intro: [
      `Today is Day 10 — halfway through Endure. There's no structured exercise: no mapping, no building, nothing to complete. Just an audio from Ninad, and a single tap for how you are right now.`,
      `Halfway points are worth pausing on. The beginning has its own fierce energy — the decision is fresh, the stakes feel vivid. The end is close enough to pull you forward. The middle is where most things quietly get abandoned, not because they got harder, but because the early urgency faded and nothing rose to replace it. You're standing at exactly that point, and you're still here.`,
      `So today asks almost nothing of you, on purpose. Not every day needs to be effortful to count. Some days the work is simply to notice you're still walking, mark it honestly, and keep going. Listen to the audio, tap how you are, and let that be enough — some days, simply still being here is the whole achievement.`,
    ],
    mechanic: {
      type: 'finalTap',
      data: {
        header: 'How are you, halfway in?',
        subtext: 'One tap.',
        options: [
          {
            id: 'walking_through',
            label: `I'm walking through it. The structure is working.`,
            response: `Good. The structure isn't supposed to feel inspiring right now. It's supposed to hold. It is holding.`,
          },
          {
            id: 'flat_but_continuing',
            label: 'The flatness is real, but I am continuing.',
            response: `That's exactly what halfway looks like. The flatness is a known stretch. It recalibrates. Continuing is the work.`,
          },
          {
            id: 'thinking_about_using',
            label: `I'm thinking about using more than I want to admit.`,
            response: `Naming it is the move. Re-read the vow today. Reach out to the anchor person. Use the AVE protocol from Day 4 if you slip — it exists for exactly this.`,
          },
          {
            id: 'something_shifted',
            label: 'Something has shifted. Not sure how to name it yet.',
            response: `That's also right. The middle of Endure has a quality that's hard to describe. The witness exercise from yesterday helps. Stay with it.`,
          },
        ]
      }
    },
    closingTitle: 'Halfway is real.',
    closingBody: `The ten days ahead are different in shape from the ten behind. Keep walking.`,
  },

  // ===================================================================
  // DAY 11 — REPLACEMENT ENGINE CHECK (1st)
  // ===================================================================
  {
    day: 11,
    arrivalTitle: 'The replacement engine — check-in.',
    arrivalSubtitle: 'What you\u2019ve been reaching for. What is actually happening.',
    artifactType: 'endure_day_11',
    intro: [
      `Recovery runs on what you put in the space the substance used to fill. You don't beat a habit by leaving a hole where it was — you put something in the hole that does a version of the same job the substance was doing: soothing, energising, connecting, marking the end of a day.`,
      `And a replacement only holds if it's actually being done. A plan you aren't running isn't an engine — it's a diagram. The point isn't to keep good intentions on a list; it's to have a few real things turning over in daily life, quietly doing the work the substance used to do.`,
      `Eleven days in, there's something — or a few things — you've been reaching for instead. So today is a check, not a test, and there's no judgement in it. You'll set how alive each one is right now: what's genuinely working, what isn't, what's harder than you expected. Then you'll decide what to adjust. An honest reading now is worth far more than an optimistic one.`,
    ],
    mechanic: {
      type: 'replacementEngineCheck',
      data: {
        pullFromArtifact: 'commit_day_4',
        engineTeach: [
          `Recovery runs on what fills the space the substance used to take. You don't beat a habit by leaving a hole where it was — you put something in the hole that does a version of the same job. And it only holds if it is actually being done: a plan you aren't running isn't an engine, it's a diagram.`,
          `So this is a check, not a test. Some of what you reach for is working, some isn't, some is harder than expected. You'll set how alive each one is right now — no judgement, just the reading — and decide what to adjust.`,
        ],
        dialPrompt: `How alive is this practice right now?`,
        statusOptions: [
          { id: 'started_on_schedule', label: 'Doing it as committed', rank: 4 },
          { id: 'started_shorter', label: 'Doing it, but shorter than planned', rank: 3 },
          { id: 'started_less_often', label: 'Doing it, but less often than planned', rank: 2 },
          { id: 'havent_started', label: `Haven't really started yet`, rank: 1 },
          { id: 'replaced_with_other', label: 'I replaced this with something else, organically', off: true },
        ],
        difficultyPrompt: `What's making it hard?`,
        difficultyOptions: [
          { id: 'energy_low', label: 'Energy is low. Flatness makes starting hard.' },
          { id: 'time_shorter', label: 'Time is shorter than I planned for.' },
          { id: 'predicted_obstacle', label: 'The obstacle I predicted on Day 4 is the obstacle.' },
          { id: 'didnt_predict', label: `It's something I didn't predict.` },
          { id: 'nothing_specific', label: 'Nothing specific — I just have not done it.' },
        ],
        adjustmentPrompt: 'What is the right adjustment?',
        adjustmentOptions: [
          { id: 'keep_same', label: 'Keep the same commitment. Do it.' },
          { id: 'shrink_size', label: 'Shrink it — shorter or less often — and actually do it.' },
          { id: 'swap_activity', label: 'Swap this for something else.' },
          { id: 'pause_one', label: 'Pause this one; focus on the others.' },
          { id: 'add_accountability', label: 'Add accountability — tell the anchor person.' },
        ],
        freshAddPrompt: 'What have you been reaching for?',
        freshAddSubtext: `One to three things you've actually been doing instead — to fill the space, get through the evening, take the edge off. They don't have to be impressive or even healthy. Just honest.`,
        freshStatusOptions: [
          { id: 'going_well', label: 'I reach for it without thinking now', rank: 4 },
          { id: 'hit_and_miss', label: 'Hit and miss — some days yes, some no', rank: 3 },
          { id: 'barely', label: 'Barely — I keep meaning to and not doing it', rank: 2 },
          { id: 'not_really', label: 'Honestly, not really happening', rank: 1 },
          { id: 'drifted_else', label: 'I drifted to something else instead', off: true },
        ],
        freshDifficultyOptions: [
          { id: 'energy_low', label: 'Energy is low. The flatness makes starting hard.' },
          { id: 'no_time', label: 'No time — it keeps getting eaten.' },
          { id: 'forget', label: 'I just forget in the moment.' },
          { id: 'doesnt_help_yet', label: `It doesn't do much for me yet.` },
          { id: 'nothing_specific', label: 'Nothing specific — I just have not.' },
        ],
        freshAdjustmentOptions: [
          { id: 'do_more', label: 'Keep it, and actually do it more often.' },
          { id: 'make_smaller', label: 'Make it smaller, so it actually happens.' },
          { id: 'swap', label: 'Swap it for something that fits better.' },
          { id: 'add_one', label: 'Add one more thing to reach for.' },
          { id: 'set_a_time', label: 'Attach it to a set time of day.' },
          { id: 'tell_someone', label: 'Tell someone, so it is not only in my head.' },
        ],
      }
    },
    closingTitle: 'The engine is checked.',
    closingBody: `Adjustment is part of the work. The point was never perfect execution — it is that the engine keeps running.`,
  },

  // ===================================================================
  // DAY 12 — CAPITAL BASELINE
  // ===================================================================
  {
    day: 12,
    arrivalTitle: 'Recovery capital.',
    arrivalSubtitle: 'The four kinds, and where you actually stand.',
    artifactType: 'endure_day_12',
    intro: [
      `"Recovery capital" is one of the most reliable predictors of whether change lasts — the resources you can draw on, across four kinds. Cloud and Granfield's work put it plainly: the more capital around you, the better the odds — more than willpower, more than how bad things got.`,
      `The four kinds are physical (health, money, a stable place to be), human (skills, self-belief, the capacity to cope), social (the people who actually show up for you), and cultural (values, belonging, a sense of who you are beyond the substance). Most people in early sobriety lean hard on one or two and let the rest quietly thin out.`,
      `So this is an honest snapshot of all four — not where you'd like to be, where you actually stand right now. You'll tap what's true in each, see the shape they make together, and notice which one is carrying you and which has worn thinnest.`,
    ],
    mechanic: {
      type: 'capitalProfile',
      data: {
        capitals: [
          {
            key: 'physical',
            label: 'Physical & material',
            description: 'The practical ground you stand on — your body and health, sleep, food, money, a stable place to live, feeling safe day to day.',
            items: [
              { id: 'sleep_consistent', label: 'Sleep is roughly consistent and restorative' },
              { id: 'eating_normally', label: 'Eating normally most days' },
              { id: 'physical_health_okay', label: 'Physical health is roughly okay' },
              { id: 'financial_stable', label: 'Finances are roughly stable' },
              { id: 'housing_stable', label: 'Housing is stable' },
              { id: 'health_coverage', label: 'Medical care if I need it' },
            ],
          },
          {
            key: 'human',
            label: 'Human capital',
            description: 'Skills, work, learning, and the felt sense that you can handle what comes.',
            items: [
              { id: 'work_engaged', label: 'Working, or doing meaningful work' },
              { id: 'skills_using', label: 'Using my skills' },
              { id: 'learning_something', label: 'Learning something new' },
              { id: 'projects_alive', label: 'Projects I care about' },
              { id: 'can_handle_things', label: 'I can handle most of what life puts in front of me' },
            ],
          },
          {
            key: 'social',
            label: 'Social capital',
            description: 'Relationships, support, community — people who know about your work on this.',
            items: [
              { id: 'anchor_person_active', label: 'Anchor person is active and engaged' },
              { id: 'witnesses_know', label: 'Witnesses know about the vow' },
              { id: 'close_relationships_okay', label: 'Close relationships roughly okay' },
              { id: 'community_belong', label: 'I belong to at least one community' },
              { id: 'someone_to_talk_to', label: 'Someone to talk to when something hard happens' },
            ],
          },
          {
            key: 'cultural',
            label: 'Cultural capital',
            description: 'Meaning, values, identity, faith or philosophy — a sense of belonging beyond the substance.',
            items: [
              { id: 'sense_of_purpose', label: 'A sense of what I am for' },
              { id: 'values_clear', label: 'My values are roughly clear to me' },
              { id: 'spiritual_practice', label: 'Some contemplative or spiritual practice' },
              { id: 'cultural_belonging', label: 'I belong somewhere — tradition, culture, community' },
              { id: 'identity_beyond_substance', label: 'My identity is not centred on the substance' },
            ],
          },
        ],
        profileShape: {
          balanced: `Your profile is fairly even — no single kind carrying all the others. A broad base like that is steadier than it feels: support comes from more than one place, so a wobble in one doesn't topple everything.`,
          spiky: `Your profile leans hard on one or two kinds while others run thin. That is normal this early — but a base resting on one pillar is fragile. The thin ones aren't failures; they're where a little attention buys the most stability.`,
        },
        reflectPrompt: `Which one, grown even a little, would steady the rest right now?`,
      }
    },
    closingTitle: 'The baseline is set.',
    closingBody: `You can see the shape now — what's holding, and what's thin. On Day 16 you'll go deeper into whichever kind came out thinnest.`,
  },

  // ===================================================================
  // DAY 13 — SHAME REVISIT
  // ===================================================================
  {
    day: 13,
    arrivalTitle: 'The shame statement, revisited.',
    arrivalSubtitle: `Reading what you wrote on Day 6, with seven days between.`,
    artifactType: 'endure_day_13',
    intro: [
      `On Day 6 you wrote a structured statement of what the shame story has been telling you — the harsh, familiar narration that addiction installs and then pretends is simply the truth. You also saw the alternative framings beside it: not affirmations or pep talk, but more accurate descriptions of the same facts in plain clinical language.`,
      `Shame is sticky because it disguises itself as honesty. It doesn't feel like an attack; it feels like finally seeing yourself clearly. That's exactly why it has to be written down and looked at from the outside, where its claims can be checked rather than just believed.`,
      `Today, with a week between you and that statement, you'll read back what you made and notice whether anything has shifted. Sometimes the alternative framings have quietly settled in, and the original now reads as too harsh. Sometimes the old statement still feels truer and the gap hasn't closed. Both are real information — not a test you pass or fail, just an honest reading of where the story stands now.`,
    ],
    mechanic: {
      type: 'shameStatement',
      data: {
        version: 'revisit',
        pullFromArtifact: 'endure_day_6',
        revisitHeader: 'Your statement from Day 6.',
        revisitSubtext: 'Read it whole. For each part, mark which feels closer to true today \u2014 the shame line, or the more accurate version.',
        landingOptions: [
          { id: 'shame_still_truer', label: 'The shame line still feels truer.' },
          { id: 'see_not_feel', label: "I can see the reframe is right, but I don't feel it yet." },
          { id: 'starting_to_shift', label: "Somewhere in between \u2014 it's starting to shift." },
          { id: 'reframe_truer', label: 'The reframe feels more true now.' },
        ],
      }
    },
    closingTitle: 'You looked again.',
    closingBody: `Shame work is slow. The point is not that it's gone. The point is that you can now see the difference between the story and the situation.`,
  },

  // ===================================================================
  // DAY 14 — PHASE 2 CLOSE
  // ===================================================================
  {
    day: 14,
    arrivalTitle: 'Phase 2, close.',
    arrivalSubtitle: 'The middle week.',
    artifactType: 'endure_day_14',
    intro: [
      `Phase 2 ends today — the middle week, and in some ways the strangest one. It held the flatness, the witness, the halfway mark, your recovery-capital baseline, and the return to the shame statement. Less physical drama than week one, but its own kind of demanding: the work of staying when nothing feels like much.`,
      `As with each phase, today closes deliberately rather than letting the days dissolve into one another. A short summary of what the middle week covered, and a tap for how it landed. Marking the close is how the progress becomes visible to you, instead of staying something you only know in the abstract.`,
      `Then Phase 3 begins tomorrow — the return. This is where things start coming back: not the substance, but the rest of life. Pleasure beginning to register again, connection landing again, the reasons behind the vow becoming more vivid rather than fading. The hardest physiological stretch is behind you. What's ahead is rebuilding.`,
    ],
    mechanic: {
      type: 'phaseClose',
      data: {
        phaseNumber: 2,
        phaseName: 'Phase 2 — The flatness',
        summaryItems: [
          { day: 8, label: 'Anhedonia named', sublabel: 'The flatness has a shape' },
          { day: 9, label: 'The witness', sublabel: 'Sakshi bhava — what watches' },
          { day: 10, label: 'Halfway', sublabel: 'A single tap' },
          { day: 11, label: 'Replacement engine check', sublabel: 'What is actually happening' },
          { day: 12, label: 'Recovery capital baseline', sublabel: 'Where you currently stand on four capitals' },
          { day: 13, label: 'Shame revisit', sublabel: 'Reading what you wrote, a week later' },
        ],
        landingPrompt: 'How did the middle week land?',
        landingOptions: [
          { id: 'flatness_worst', label: 'The flatness was the worst part.' },
          { id: 'easier_than_phase_1', label: 'Easier than Phase 1, in a different way.' },
          { id: 'something_shifted', label: 'Something shifted, but I can\'t quite name it.' },
          { id: 'just_endured', label: 'I just endured. That was the work.' },
        ],
        nextPhasePreview: `Phase 3 — the return. Pleasure starts to come back. Connection lands again. The reasons for the vow get clearer, not blurrier.`,
      }
    },
    closingTitle: 'Phase 2 is closed.',
    closingBody: `Phase 3 begins tomorrow.`,
  },

  // ===================================================================
  // DAY 15 — LAPSE/RELAPSE & WHAT NEARLY HAPPENED
  // ===================================================================
  {
    day: 15,
    arrivalTitle: 'Lapse vs. relapse, in your own data.',
    arrivalSubtitle: 'What nearly happened, named honestly.',
    artifactType: 'endure_day_15',
    intro: [
      `Day 4 built the plan for if you slip. Today looks backward instead of forward. By now most people have had something — a real slip, a near one, or an urge that came within an inch of winning — and today is for taking one of those and looking at it honestly.`,
      `Not as confession, and not to relitigate the guilt. As data. An urge is never a single moment that arrives out of nowhere, however much it feels that way. It's a chain: a trigger, a state, a thought, a decision, a window. The reason it can feel like it 'just happened' is that the early links are quiet and easy to miss.`,
      `Once you can see the links laid out, you can see where the chain might have broken — and where it could break next time. That's the whole point of looking back: not to feel worse about what happened, but to find the specific, catchable moment earlier in the sequence where a different move was genuinely possible.`,
    ],
    mechanic: {
      type: 'lapseRelapseRecall',
      data: {
        statusPrompt: `First — what has actually happened so far?`,
        statusOptions: [
          { id: 'no_close_calls', label: `No close calls. The urge has stayed manageable.` },
          { id: 'close_calls_held', label: 'A few close calls. I held through each.' },
          { id: 'one_close_call', label: 'One specific close call. I held.' },
          { id: 'slipped_once', label: 'I slipped once. I used the AVE protocol.' },
          { id: 'slipped_more_than_once', label: 'I have slipped more than once.' },
        ],
        protectivePrompt: `What has kept the urge manageable?`,
        chainTeach: [
          `An urge or a slip is never random, and never just one moment. It is a chain: the situation you were in, the state underneath it, the thought that gave permission, the urge itself, and what you did.`,
          `Seeing the chain isn't about guilt. It is leverage. A chain breaks at any link — and the earliest link is always the easiest to catch.`,
        ],
        notePrompt: `The moment, in one line (optional)`,
        situationPrompt: `Where, and when, was it loudest?`,
        situationOptions: [
          { id: 'alone_home', label: 'Alone at home' },
          { id: 'a_person', label: 'A specific person, or an argument' },
          { id: 'bar_party', label: 'Somewhere it was around — a bar, a party' },
          { id: 'late_night', label: 'Late at night' },
          { id: 'after_work', label: 'After work, winding down' },
          { id: 'hard_day', label: 'The end of a hard day' },
        ],
        statePrompt: `Underneath, what state were you in?`,
        stateOptions: [
          { id: 'tired_hungry', label: 'Tired, hungry, run down' },
          { id: 'loud_emotion', label: 'A loud emotion — anger, loneliness, grief' },
          { id: 'numb', label: 'Numb, flat, far away' },
          { id: 'restless', label: 'Restless, bored, understimulated' },
          { id: 'stressed', label: 'Stressed, overwhelmed' },
        ],
        thoughtPrompt: `The thought that gave permission`,
        thoughtOptions: [
          { id: 'just_one', label: `"Just one."` },
          { id: 'earned_it', label: `"I've earned it. I deserve it."` },
          { id: 'no_one_knows', label: `"No one will know."` },
          { id: 'cant_stand', label: `"I can't sit with this feeling."` },
          { id: 'whats_point', label: `"What's the point anyway."` },
        ],
        intensityPrompt: `How loud did the urge get?`,
        outcomePrompt: `And then?`,
        outcomeOptions: [
          { id: 'held', label: 'I held.' },
          { id: 'nearly', label: 'I nearly did, then stopped.' },
          { id: 'slipped', label: 'I slipped once.' },
          { id: 'used', label: 'I used.' },
        ],
        forkPrompt: `Looking back, which link was the most catchable — the earliest place you could have stepped out?`,
        breakerPrompt: `And what could have broken it, right there?`,
        breakerOptions: [
          { id: 'reread_vow', label: 'Re-read the vow' },
          { id: 'anchor_person', label: 'Reach the anchor person' },
          { id: 'urge_breaker', label: 'An if-then urge-breaker from Day 5' },
          { id: 'leave', label: 'Leave the situation entirely' },
          { id: 'physical', label: 'Cold water, a walk — move the body' },
          { id: 'just_wait', label: 'Wait — let the urge crest and fall' },
          { id: 'witness', label: `The witness — watch it, don't become it` },
        ],
        allowCustom: true,
      }
    },
    closingTitle: 'The chain is visible.',
    closingBody: `What you traced is data, not a verdict — and now you know its weakest link. The second half of Endure builds from there.`,
  },

  // ===================================================================
  // DAY 16 — CAPITAL DEEP DIVE
  // ===================================================================
  {
    day: 16,
    arrivalTitle: 'The weakest capital, examined.',
    arrivalSubtitle: 'Where the next month of work focuses.',
    artifactType: 'endure_day_16',
    intro: [
      `On Day 12 you mapped all four kinds of recovery capital — physical, human, social, cultural — the resources research consistently finds matter more than willpower for whether change actually lasts. Today you'll see that whole picture again, with a little distance from it, and then go deep on the one kind that's currently thinnest.`,
      `The thinnest capital is usually where the next real risk lives, and also where the most growth is available. But it's easy to look at a depleted area and feel only the size of the gap — which tends to produce a long list of vague intentions and no actual movement.`,
      `So this isn't about fixing it today. It's about choosing one real, specific move — the kind that genuinely builds that particular capital — and a small plan concrete enough that you can picture it happening this week. One move you can see yourself doing beats ten you merely approve of. That's where the next month of work begins.`,
    ],
    mechanic: {
      type: 'capitalAssessment',
      data: {
        version: 'deep_dive',
        pullFromArtifact: 'endure_day_12',
        deepDivePrompt: "Choose the one move you'll make.",
        commitmentPrompt: 'Make it a plan you can picture.',
        capitals: [
          {
            key: 'physical',
            label: 'Physical & material',
            description: 'The practical ground you stand on — your body and health, sleep, food, money, a stable place to live, and feeling safe day to day.',
            why: `Material strain — debt, shaky housing, no cushion, a health thing you've put off — is one of the most reliable pressures behind relapse: insecurity quietly taxes the same self-control you're spending to stay sober. Building this capital isn't self-improvement, it's securing the base — money you don't touch, one bill faced, housing made less uncertain, the body treated as the asset it is. Every bit of stability you add is load taken off your willpower.`,
            moves: [
              { id: 'money_buffer', label: "Start a cushion — set up one small automatic transfer into a separate account you don't touch" },
              { id: 'one_bill', label: 'Face one bill or debt — the one that sits in your chest. Call, set a plan, or make one payment' },
              { id: 'housing', label: "Make housing less uncertain — have the one conversation or start the paperwork you've avoided" },
              { id: 'deferred_health', label: "Book the medical or dental thing you've put off — untreated pain is a quiet relapse pressure" },
              { id: 'sleep_protected', label: 'Protect sleep as infrastructure — a fixed wind-down and wake time, guarded like an appointment' },
            ],
          },
          {
            key: 'human',
            label: 'Human capital',
            description: 'Skills, education, work, and the sense that you can handle what comes.',
            why: `Human capital is your skills and work, but the part addiction damages most is self-efficacy — the felt sense that you can affect your own life. The research here is clear: that sense is rebuilt mainly through mastery — succeeding at something hard, not being told you can. So it grows when you re-engage a real skill or piece of work, and just as much when you stack small finished things until the brain re-learns: I start things, and I complete them.`,
            moves: [
              { id: 'mastery_task', label: 'Pick one thing you can start and finish this week — small, concrete, visible — so you have a real win to stand on' },
              { id: 'skill_restart', label: 'Restart one skill the using years interrupted — the smallest first session, twenty minutes' },
              { id: 'work_step', label: "Take the one work step that would make you feel useful again — the move you've been stalling on" },
              { id: 'finish_unfinished', label: 'Close one nagging, unfinished task — completion is what restores a sense of agency' },
              { id: 'future_marker', label: 'Name one thing you want true in six months and the first step — addiction collapses the future; this reopens it' },
            ],
          },
          {
            key: 'social',
            label: 'Social capital',
            description: 'Relationships, support, community — the people around you.',
            why: `Of the four, social capital most strongly predicts whether recovery lasts — more than willpower or how motivated you feel. The mechanism is network change: people whose circle tilts toward those who support the change do far better, and isolation is one of the strongest pulls back toward use. The work is deliberate — deepen one trusted tie, and add one new connection where recovery-supportive people are. Not when you feel like it. On purpose.`,
            moves: [
              { id: 'deepen_bond', label: 'Deepen one tie — pick someone genuinely on your side and make the relationship more active this week' },
              { id: 'add_connection', label: 'Add one new connection — go once to a group, meeting, class, or community where supportive people are' },
              { id: 'repair_one', label: "Repair one rupture the substance caused that's worth mending — take the first honest step" },
              { id: 'widen_who_knows', label: "Tell one more trusted person what you're doing — secrecy isolates; being known protects" },
              { id: 'ask_for_one', label: 'Ask one person for one specific thing this week — receiving support is itself what builds the tie' },
            ],
          },
          {
            key: 'cultural',
            label: 'Cultural capital',
            description: 'Meaning, values, identity, and belonging beyond the substance.',
            why: `Cultural capital is your values, meaning, and identity — and recovery is partly an identity shift, away from a using self toward a fuller one. The research on recovery identity and values-based living finds that meaning, and a valued identity beyond the substance, is what protects the change over time. It's built by getting clear on what you actually value — the things the substance crowded out — and then acting on them. Values become real through action, not reflection.`,
            moves: [
              { id: 'enact_value', label: 'Name one value the substance pushed aside, and do one concrete thing this week that enacts it' },
              { id: 'reconnect_tradition', label: 'Return to one practice, faith, or tradition you drifted from — a small re-entry, just once' },
              { id: 'meaning_project', label: "Take on one thing that's purely about meaning, not usefulness — creative, devotional, or service" },
              { id: 'contribute', label: 'Do one act of service or help someone — contribution is one of the strongest sources of recovery meaning' },
              { id: 'identity_beyond', label: 'Name one thing you want to be known for that has nothing to do with the substance, and take a step toward it' },
            ],
          },
        ],
      }
    },
    closingTitle: 'The work is named, and small.',
    closingBody: `One move, one plan, this week. That is how a thin capital thickens — not all at once, but with something specific you can actually picture doing.`,
  },

  // ===================================================================
  // DAY 17 — REPLACEMENT ENGINE CHECK (2nd)
  // ===================================================================
  {
    day: 17,
    arrivalTitle: 'Replacement engine — second check.',
    arrivalSubtitle: 'A week later. What has changed.',
    artifactType: 'endure_day_17',
    intro: [
      `Day 11 was your first replacement-engine check — an honest reading of what you'd been reaching for in the space the substance used to fill, and how alive each of those things actually was. This is the second reading, a week on.`,
      `Things move in a week. What was hard can ease as the flatness lifts and energy returns. What felt easy can quietly stall. And you may have adjusted something without quite noticing you did. A single snapshot can't show any of that; two, spaced apart, can.`,
      `So this uses the same dial as before, but this time it remembers Day 11. For each practice you'll see where you set it then, and where it sits now — the movement made visible instead of guessed at. Recovery in the middle weeks rarely feels like progress from the inside; seeing the shift on the page is one of the few honest ways to know it's happening.`,
    ],
    mechanic: {
      type: 'replacementEngineCheck',
      data: {
        version: 'second',
        pullFromArtifact: 'commit_day_4',
        pullPriorCheck: 'endure_day_11',
        engineTeach: [
          `Day 11 was the first reading. This is the second, a week on. Things move in a week — what was hard can ease as the flatness lifts, what was easy can stall, and you may have adjusted without noticing.`,
          `Same dial as before, but this time it remembers Day 11. For each practice you'll see where you set it then, and where it sits now — so the shift is visible, not guessed.`,
        ],
        dialPrompt: `How alive is this practice now?`,
        statusOptions: [
          { id: 'consistent', label: 'Consistent — doing it as committed', rank: 4 },
          { id: 'consistent_smaller', label: 'Consistent, at a smaller size', rank: 3 },
          { id: 'inconsistent', label: 'Inconsistent — some weeks yes, some no', rank: 2 },
          { id: 'stopped', label: 'Stopped doing this one', rank: 1 },
          { id: 'swapped', label: 'Swapped for something else, which is working', off: true },
        ],
        whatChangedPrompt: 'What has changed since Day 11?',
        whatChangedOptions: [
          { id: 'easier_to_initiate', label: `It's easier to initiate now.` },
          { id: 'something_started_clicking', label: 'Something has started clicking.' },
          { id: 'flatness_lifted', label: 'The flatness has lifted, so reward registers more.' },
          { id: 'still_hard', label: 'Still hard. Doing it anyway.' },
          { id: 'realized_wrong_activity', label: `Realized this wasn't the right activity for me.` },
        ],
        priorStatusOptions: [
          { id: 'started_on_schedule', label: 'Doing it as committed', rank: 4 },
          { id: 'started_shorter', label: 'Doing it, but shorter than planned', rank: 3 },
          { id: 'started_less_often', label: 'Doing it, but less often', rank: 2 },
          { id: 'havent_started', label: `Hadn't really started`, rank: 1 },
          { id: 'replaced_with_other', label: 'Replaced with something else' },
        ],
        priorFreshStatusOptions: [
          { id: 'going_well', label: 'Reaching for it without thinking', rank: 4 },
          { id: 'hit_and_miss', label: 'Hit and miss', rank: 3 },
          { id: 'barely', label: 'Barely', rank: 2 },
          { id: 'not_really', label: 'Not really happening', rank: 1 },
          { id: 'drifted_else', label: 'Drifted to something else' },
        ],
      }
    },
    closingTitle: 'Second check complete.',
    closingBody: `Adjustment continues. The engine keeps running — and now you can see it doing so.`,
  },

  // ===================================================================
  // DAY 18 — NERVOUS SYSTEM MAP
  // ===================================================================
  {
    day: 18,
    arrivalTitle: 'Your nervous system, mapped.',
    arrivalSubtitle: 'Across these eighteen days.',
    artifactType: 'endure_day_18',
    intro: [
      `On Day 2 you located yourself in the three states of the polyvagal model — settled, wound up, shut down. On Day 5 you built responses matched to each. Today you'll do the full map: across all eighteen days, where have you actually been spending your time, and where do you tend to oscillate now that the substance isn't part of how you regulate?`,
      `This matters because the substance was, among other things, a nervous-system tool — a fast way to shift state when you were too wound up or too shut down. Take it away and the question becomes unavoidable: what's regulating you now? For a while the honest answer is often 'not much, yet' — and that is precisely what these eighteen days have been quietly rebuilding.`,
      `The map will show how your time splits across the three states, what tends to pull you toward the hardest one for you, and what reliably brings you back. Seeing the shape of it — not as a feeling but as a pattern — is what lets you work with your own system instead of being caught off guard by it.`,
    ],
    mechanic: {
      type: 'nervousSystemMap',
      data: {
        version: 'map',
        buildPrompt: `Across a typical recent day — not your worst, not your best — how much time do you spend in each?`,
        buildSubtext: `These are the three states from Day 2. Tap a level for each. Your map builds as you go.`,
        levels: ['None', 'A little', 'Some', 'A lot', 'Most'],
        states: [
          { id: 'settled', label: 'Settled', sub: 'calm, present, able to connect', color: '#7A8C5A' },
          { id: 'wound_up', label: 'Wound up', sub: 'anxious, restless, on alert', color: '#C5572C' },
          { id: 'shut_down', label: 'Shut down', sub: 'flat, numb, withdrawn', color: '#6B7A88' },
        ],
        teach: {
          intro: `For years the substance did this regulating for you — something to take the edge off, or lift you up, or shut everything down on command. Your nervous system learned to outsource the job. Without it, the shifts feel rawer and more frequent — and that is not relapse, it is your system relearning to steady itself on its own. The goal was never to live in settled all the time; no one does. It is to widen the time you spend there, and shorten the drops — through safety, real connection, and small repeated returns, not force.`,
          settled: `Settled is where most of your day sits right now. That is real, and easy to overlook — a regulated nervous system is quiet, so it rarely announces itself. The work here is not to get somewhere. It is to protect what you have built, and to notice what keeps you here.`,
          wound_up: `Most of your day runs activated — alert, restless, braced for something. This is a body still scanning for threat, often louder early on because the substance used to mute exactly this. It is not a flaw to override by force; it settles as safety and connection accumulate. What you are after is more genuine rest, not constant calm.`,
          shut_down: `A good part of your day sits in shutdown — flat, numb, far away. This is the oldest protective state: when activation runs too high for too long, the system pulls the plug. It is exhausting, and easy to mistake for laziness, but it is protection, not failure. It lifts through gentle re-engagement — a little movement, a little warmth, one safe person — never by pushing.`,
        },
        pullPrompt: `What tends to pull you toward {state}?`,
        pullOptions: [
          { id: 'people', label: 'Certain people' },
          { id: 'settings', label: 'Certain places — work, home, social' },
          { id: 'time', label: 'A particular time of day' },
          { id: 'emotion', label: 'A specific feeling surfacing' },
          { id: 'body', label: 'My body — tired, hungry, unwell' },
          { id: 'unnamed', label: `Sometimes nothing I can name` },
        ],
        returnPrompt: `What reliably brings you back toward settled?`,
        returnOptions: [
          { id: 'movement', label: 'Moving my body — a walk, anything' },
          { id: 'person', label: 'One particular person' },
          { id: 'outside', label: 'Getting outside' },
          { id: 'breath', label: 'Slowing my breathing down' },
          { id: 'ritual', label: 'A small routine or grounding thing' },
          { id: 'sound', label: 'Music, or sound' },
        ],
      }
    },
    closingTitle: 'The map is made.',
    closingBody: `Without the substance, the oscillation is different. Knowing the new pattern is the work.`,
  },

  // ===================================================================
  // DAY 19 — VALUES PORTRAIT
  // ===================================================================
  {
    day: 19,
    arrivalTitle: 'Cultural capital.',
    arrivalSubtitle: 'What you actually value, surfaced.',
    artifactType: 'endure_day_19',
    intro: [
      `Day 16 touched cultural capital — meaning, values, identity. Today goes straight at values, because they are what holds the work once the structured days end. A value isn't a belief you keep on a shelf; it's a direction you move in — the kind of person your choices are walking you toward.`,
      `The substance didn't only cost time and money. It crowded out the things you value, because those things needed the attention and energy it was eating. Naming your values, and acting on even one, is how an identity beyond the substance starts to come back.`,
      `You'll surface what actually matters — not what you wish mattered, but what genuinely drives the choices you make — rank your top five, see clearly what the substance crowded out, and pick one value to act on this week. A value you never act on stays theoretical; one small, concrete move is what turns a word into a direction you are actually walking.`,
    ],
    mechanic: {
      type: 'valuesPortrait',
      data: {
        prompt: 'Tap each value that genuinely matters to you.',
        subtext: 'Not what you wish mattered. What actually drives the choices you make.',
        valueCategories: [
          {
            key: 'relational',
            label: 'Relational',
            items: [
              { id: 'honesty', label: 'Honesty — even when it costs' },
              { id: 'loyalty', label: 'Loyalty to specific people' },
              { id: 'love', label: 'Love — given and received' },
              { id: 'kindness', label: 'Kindness — to people, animals, strangers' },
              { id: 'family', label: 'Family — being present for them' },
              { id: 'friendship', label: 'Friendship that lasts' },
            ],
          },
          {
            key: 'work',
            label: 'Work and craft',
            items: [
              { id: 'mastery', label: 'Mastery — being genuinely good at something' },
              { id: 'service', label: `Service — making other people's lives better` },
              { id: 'creativity', label: 'Creativity — making things that did not exist before' },
              { id: 'rigor', label: 'Rigor — doing things properly' },
              { id: 'impact', label: 'Impact — leaving things better than I found them' },
            ],
          },
          {
            key: 'self',
            label: 'Self',
            items: [
              { id: 'integrity', label: 'Integrity — the same person in every room' },
              { id: 'growth', label: 'Growth — better next year than this' },
              { id: 'courage', label: 'Courage — the hard thing because it is right' },
              { id: 'discipline', label: 'Discipline — keeping promises to myself' },
              { id: 'humility', label: `Humility — knowing what I don't know` },
              { id: 'self_respect', label: 'Self-respect — earned through action' },
            ],
          },
          {
            key: 'experience',
            label: 'Experience',
            items: [
              { id: 'beauty', label: 'Beauty — noticing it, making it' },
              { id: 'curiosity', label: 'Curiosity — staying open' },
              { id: 'adventure', label: 'Adventure — saying yes to new things' },
              { id: 'peace', label: 'Peace — quiet, slowness, presence' },
              { id: 'pleasure', label: 'Pleasure — earned, not stolen' },
              { id: 'meaning', label: 'Meaning — the sense this is for something' },
            ],
          },
        ],
        allowCustom: true,
        customPrompt: 'A value of your own',
        rankPrompt: 'Now place your top five, in order.',
        crowdedOutPrompt: 'Which of these did the substance crowd out the most?',
        enactLeadPrompt: 'Pick one to act on this week',
        enactActionPrompt: 'One small, concrete thing you will do this week toward it:',
        enactWhenPrompt: 'When? (optional)',
      }
    },
    closingTitle: 'Your values are surfaced.',
    closingBody: `Cultural capital is built on values made explicit — and on acting on them. The list is yours now, and one of them has a move attached this week.`,
  },

  // ===================================================================
  // DAY 20 — ENDURE PORTRAIT
  // ===================================================================
  {
    day: 20,
    arrivalTitle: 'Who you are now.',
    arrivalSubtitle: 'Twenty days through.',
    artifactType: 'endure_day_20',
    intro: [
      `Twenty days of work are behind you. The portrait today is unlike anything else in Endure: it isn't a self-description you sit down and compose. It's assembled from your actual taps across these twenty days — the states you've spent time in, the protected emotions you named, the AVE protocol you built, the shame statement you wrote, the capitals you mapped, the values you ranked, the urges you held against.`,
      `There's a reason it's built this way rather than asked. The using mind is an unreliable narrator about itself — quick to minimise, quick to catastrophise, quick to forget. A portrait drawn from what you actually did, day after day, sidesteps all of that. It reflects the evidence back, not the story.`,
      `So the portrait will assemble itself, and you'll read it — possibly recognising things about this stretch you hadn't put into words. Then you'll tap which parts of it ring most true. Not to grade it, but because choosing what's true is itself a way of claiming the work as yours.`,
    ],
    mechanic: {
      type: 'endurePortrait',
      data: {
        pullFromArtifacts: [
          'endure_day_2', 'endure_day_3', 'endure_day_4', 'endure_day_6',
          'endure_day_8', 'endure_day_12', 'endure_day_15', 'endure_day_16', 'endure_day_18', 'endure_day_19',
        ],
        composedHeader: 'Your portrait, in your own taps.',
        composedSubtext: 'Assembled from twenty days of your own taps. Read it whole.',
        recognitionPrompt: 'Looking at the portrait:',
        recognitionOptions: [
          { id: 'recognize_self', label: 'I recognize myself in this.' },
          { id: 'mostly_recognize', label: 'I mostly recognize myself. A few parts feel off.' },
          { id: 'feels_more_real', label: 'It feels more real than how I usually describe myself.' },
          { id: 'doesnt_sound_like_me', label: `It doesn't fully sound like me yet.` },
        ],
      }
    },
    closingTitle: 'The portrait exists.',
    closingBody: `Made from your actual data. Yours to return to.`,
  },

  // ===================================================================
  // DAY 21 — VOW HELD
  // ===================================================================
  {
    day: 21,
    arrivalTitle: 'The vow, held.',
    arrivalSubtitle: 'Twenty-one days.',
    artifactType: 'endure_day_21',
    founderAudio: {
      transcript: `Hi. It's Ninad.

Twenty-one days through Endure. The hardest stage in the whole journey, and you're standing at the end of it. I'm going to say this plainly, with no decoration. You did the thing most people don't. You held the vow through the part where it actually hurt.

Think about where you were three weeks ago. Day one of this stage, in the thick of it, getting through it an hour at a time. And then the grey. And you stayed anyway. Through the loud part and the flat part both. That is not luck, and it is not willpower running on fumes. That's you, choosing the same thing over and over on the days it gave you nothing back. That is the realest kind of strength there is, and almost nobody sees it, because from the outside it doesn't look like anything. I see it. It counts.

Here's the truth about what comes next, because I won't lie to you even now. It does get easier. But it doesn't become automatic. The work just changes shape — from holding on, to building a life that's actually worth staying sober for. That's the next stage. It's gentler than this one. You've already done the hardest part there is.

And if you slipped somewhere in here — if it wasn't clean — hear me on this. It doesn't erase any of it. A slip is one point on a long line that's still pointing up. You're still here. You came back. That coming-back is the whole skill. That's what the people who make it actually do.

You kept a promise to yourself through the hardest weeks of it. Carry that with you. You earned it the hard way.

I'll see you in Build. Go on — you've more than earned what's next.`,
      audioSrc: 'endure/day_21.mp3',
    },
    intro: [
      `Today is Day 21 — the last day of Endure. There's a single exercise: reading your vow again, then marking the day with one tap. After three weeks of building, naming, and holding, the close is deliberately quiet.`,
      `The vow was sealed back on Commit, Day 8. It has now held for twenty-one days — through the acute first week, through the flatness of the middle, through the slow return of the third. You didn't hold it by willpower alone; you held it by building the things underneath it, day by day, that make a vow possible to keep.`,
      `So today you read it once more, but you read it differently — with twenty-one days of actual holding underneath the words. The same sentences mean something else now than they did when you first wrote them. Mark the day. Endure is complete, and what you've built here is what the next stage stands on.`,
    ],
    mechanic: {
      type: 'vowHeld',
      data: {
        pullFromArtifact: 'commit_day_8',
        readPrompt: 'Read the vow. Slowly.',
        readSubtext: 'The vow has held for twenty-one days. Today you return to it.',
        markPrompt: 'Mark Day 21.',
        markOptions: [
          {
            id: 'held',
            label: 'I held. The vow is intact.',
            response: `That's the data. Twenty-one days held. The structure worked. What comes next — Build, or the rest of your life — is built on this.`,
          },
          {
            id: 'held_with_slips',
            label: 'I held mostly. There were slips. I returned each time.',
            response: `Returning is what makes the difference between a slip and a relapse. You returned. The vow held in the sense that matters most — you kept walking.`,
          },
          {
            id: 'didnt_hold',
            label: `I didn't hold all the way. I am here anyway.`,
            response: `Being here is what matters. The work continues from where you are. The vow can be re-read, returned to, even re-written. Reclaim is the stage for after a slip — it exists for exactly this.`,
          },
        ],
      }
    },
    closingTitle: 'Endure is complete.',
    closingBody: `Twenty-one days. The vow held in the way it was meant to.

What comes next is a longer, less structured stretch. The work continues — through Build, through the rest of your life, through return.`,
  },

]

export function getEndureDay(dayNumber) {
  return ENDURE_DAYS.find(d => d.day === dayNumber) || null
}
// ---------------------------------------------------------------------------
// Physical / offline practices — the "between today and tomorrow" exercises.
// Keyed by day number; resolved in EndureDay and surfaced as a check-in on the
// overview. Phase-close days (7, 14, 21) have none — those days are reviews.
// ---------------------------------------------------------------------------
export const ENDURE_PRACTICES = {
  1: {
    eyebrow: 'Carry this with you',
    archetype: 'pause',
    title: `Get through the next hour. Then the next.`,
    body: [
      `The real unit of today isn’t the month, or even the day. It’s the next hour. Before tomorrow, when the wanting rises, set it down to that: I only have to get through this hour. When it’s done, start the next one.`,
      `Mark them if it helps — a tally on paper, a knuckle counted. Each hour you outlast is proof that the wave crests and falls without you doing anything but waiting. You don’t have to win the month tonight. You have to wait out one hour, and then be willing to do it again.`,
    ],
  },
  2: {
    eyebrow: 'Carry this with you',
    archetype: 'watch',
    title: `Locate which state you’re in, three times today.`,
    body: [
      `You learned the three states your nervous system moves through. Before tomorrow, stop three times — morning, afternoon, night — and just name which one you’re in: settled, fight-or-flight, or shut-down. No fixing. Only locating.`,
      `The craving feels different, and needs a different response, depending on which state you’re in. Getting quick at reading the state — before you react to it — is the whole skill. Three reps today begins to build it.`,
    ],
  },
  3: {
    eyebrow: 'Carry this with you',
    archetype: 'catch',
    title: `Let one protected feeling come, and stay.`,
    body: [
      `The substance was holding certain feelings off. Now they arrive. Before tomorrow, when one of them surfaces — the loneliness, the anger, the grief you’d usually numb — don’t fix it and don’t run. Sit with it for sixty seconds and let it be there.`,
      `You’re not indulging it; you’re proving it won’t kill you. A feeling you can let move through you loses its power to send you reaching. Those sixty seconds are the rep.`,
    ],
  },
  4: {
    eyebrow: 'Carry this with you',
    archetype: 'map',
    title: `Write the first five minutes after a slip.`,
    body: [
      `You learned why a single slip tries to become a collapse. Before tomorrow, write down — concretely — exactly what you’ll do in the first five minutes if it happens: who you’ll message, what you’ll say to yourself, the next single action. Decide it now, while you’re clear.`,
      `The danger of a slip isn’t the slip; it’s the story that says you’ve already failed, so you may as well keep going. A response written in advance is how you interrupt that story before it gets running.`,
    ],
  },
  5: {
    eyebrow: 'Carry this with you',
    archetype: 'pause',
    title: `Pick the move that matches the state.`,
    body: [
      `Before tomorrow, the next time an urge comes, do this in order: first locate your state, then choose the move that fits it. Wired and agitated wants something that discharges — a fast walk, cold water. Shut down and flat wants something that gently re-engages — call someone, step outside, move slowly.`,
      `Most relapse-prevention advice fails because it offers one move for every moment. The skill is matching. Read the state first; the right response follows from it.`,
    ],
  },
  6: {
    eyebrow: 'Carry this with you',
    archetype: 'document',
    title: `Write the shame sentence, and the truer one.`,
    body: [
      `You found the shame story — the sentence underneath that says what your using means about you. Before tomorrow, write it down in its ugliest, most honest form. Then, beneath it, write the truer sentence: what is actually the case.`,
      `Shame survives by staying unspoken. On paper, the cruel version usually looks less like a fact and more like an old recording. Keep both lines — you’ll read them again on Day 13.`,
    ],
  },
  8: {
    eyebrow: 'Carry this with you',
    archetype: 'plant',
    title: `Do one good thing flatly, expecting nothing.`,
    body: [
      `The flatness is your brain relearning how to feel without the substance — it lifts, but slowly. Before tomorrow, do one small thing you used to enjoy, and do it even though it will probably feel like nothing. The walk, the music, the friend.`,
      `You’re not chasing a feeling today; you’re laying track for when feeling returns. Acting before the reward comes back is part of how the reward comes back. Flat and done still counts.`,
    ],
  },
  9: {
    eyebrow: 'Carry this with you',
    archetype: 'watch',
    title: `Watch one urge instead of being it.`,
    body: [
      `You met the part of you that watches — the one that can observe a craving without being run by it. Before tomorrow, when an urge comes, step back into that watcher: name it, “there’s a craving,” and watch it like weather moving across a sky.`,
      `The urge is not you, and it is not a command. It’s a state passing through. Watched from a half-step back, it rises, peaks, and thins out on its own — and you were the sky the whole time, not the weather.`,
    ],
  },
  10: {
    eyebrow: 'Carry this with you',
    archetype: 'document',
    title: `Write down one thing that’s already different.`,
    body: [
      `Ten days. Before tomorrow, write down one concrete thing that has changed since Day Zero — sleep, money still in the account, a morning you remember, a conversation you were actually present for. One real, specific thing.`,
      `The mind quietly erases progress to keep the case for using intact. A written, specific marker is evidence you can return to when it tells you nothing has changed. It has.`,
    ],
  },
  11: {
    eyebrow: 'Carry this with you',
    archetype: 'tether',
    title: `Read your vow back, out loud.`,
    body: [
      `You committed to something at the start. Before tomorrow, find what you wrote — the vow, the reason — and read it back to yourself out loud, once. Not to judge how you’re doing. Only to put the original reason in front of you again.`,
      `By the second week the reason goes quiet and the wanting gets clever. Hearing the vow in your own voice is how you re-anchor to the thing you decided when you were thinking clearly.`,
    ],
  },
  12: {
    eyebrow: 'Carry this with you',
    archetype: 'say',
    title: `Reach the kind of support you’ve been skipping.`,
    body: [
      `You mapped the four kinds of support and saw where you actually stand. Before tomorrow, reach toward the one you’ve been neglecting — message the person, look up the meeting, book the appointment, join the room. One real move toward the gap.`,
      `People relapse in the gaps in their support, not in the parts they’ve already covered. Closing one gap this week is worth more than reinforcing what’s already strong.`,
    ],
  },
  13: {
    eyebrow: 'Carry this with you',
    archetype: 'watch',
    title: `Read what you wrote on Day 6 again.`,
    body: [
      `A week ago you wrote the shame sentence, and the truer one beneath it. Before tomorrow, read both again — and notice, without forcing anything, whether the cruel version still feels as true as it did seven days ago.`,
      `You’re not trying to make it false. You’re measuring distance. Often the words that felt like bedrock a week ago now read like an old mood. That gap, when it’s there, is the proof the story was never the fact.`,
    ],
  },
  15: {
    eyebrow: 'Carry this with you',
    archetype: 'document',
    title: `Name the moment you nearly went.`,
    body: [
      `There has been a moment — maybe more than one — where you came close. Before tomorrow, write it down honestly: what was happening, what you felt, what almost won, and what you did instead. The plain account, not the dramatic one.`,
      `Near-misses hold the most information you’ll get. Written down while it’s fresh, the moment becomes a map of your real edges — the specific situation, hour, or feeling to plan around — instead of a near-disaster you’d rather forget.`,
    ],
  },
  16: {
    eyebrow: 'Carry this with you',
    archetype: 'map',
    title: `Choose the one thing the next month is about.`,
    body: [
      `You looked at where the work goes next. Before tomorrow, choose the single focus for the coming month and make it concrete — not “do better,” but one specific, checkable thing: asleep by a set time, one meeting a week, the morning anchor, the hard conversation finally had.`,
      `A month with one clear focus moves further than a month of vague resolve. Pick the one that, if it held, would hold most of the rest up with it.`,
    ],
  },
  17: {
    eyebrow: 'Carry this with you',
    archetype: 'watch',
    title: `Notice what a week changed — and what it didn’t.`,
    body: [
      `Before tomorrow, take an honest read of the last week against the one before it. What is genuinely easier now? What is exactly as hard? Name both — the progress, and the part that hasn’t moved.`,
      `Recovery isn’t linear, and pretending everything is improving sets you up to crash when it doesn’t. Seeing it clearly — this lifted, that’s still heavy — is what keeps you steady through the parts that take longer.`,
    ],
  },
  18: {
    eyebrow: 'Carry this with you',
    archetype: 'document',
    title: `Write one true line about these eighteen days.`,
    body: [
      `Eighteen days. Before tomorrow, write a single honest sentence about what they have actually been like — not the version for anyone else, not the inspiring one. The true one.`,
      `One real line cuts through both the “I’m crushing it” story and the “nothing’s working” story. Keep it. Over time, these single lines become the most honest record you have of what this actually took.`,
    ],
  },
  19: {
    eyebrow: 'Carry this with you',
    archetype: 'plant',
    title: `Do one thing that matches what you value.`,
    body: [
      `You surfaced what you actually value — under the substance, under the noise. Before tomorrow, take one small action that lines up with one of those values: the relationship, the work, the kind of person you want to be. Small and real.`,
      `Cravings loosen their grip not when you white-knuckle them, but when the life on the other side starts to feel like yours. Acting from a value, even once, is you building that life one move at a time.`,
    ],
  },
  20: {
    eyebrow: 'Carry this with you',
    archetype: 'pause',
    title: `Let yourself register twenty days.`,
    body: [
      `Twenty days. Before tomorrow, stop for a moment and actually let it land — not as a streak to protect, but as a real stretch of choosing, again and again, often when it was hard. Don’t rush past it.`,
      `The mind that minimises progress will want to skip this. Don’t let it. Registering what you’ve done, plainly and without performance, is part of what makes the next stretch possible.`,
    ],
  },
}
