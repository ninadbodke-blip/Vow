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
      `Today is Day Zero. The day you stopped, or the day Vow asks you to mark as the start of Endure.`,
      `There's a ritual today, and a map. The ritual marks the threshold. The map shows what to expect physiologically over the first 72 hours.`,
      `No reading after this. Just the marking, then the map.`,
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
      `Most people who try to stop think of stopping as a battle of will. Polyvagal theory offers a different model.`,
      `Your nervous system has three states. Not moods — physiological states. Ventral vagal: safe and connected. Sympathetic: mobilized, fight-or-flight. Dorsal vagal: shutdown, collapse, dissociation.`,
      `Substances and behaviors are, for most people, ways of moving between these states. Alcohol shifts sympathetic to ventral. Cannabis shifts sympathetic to dorsal. Cocaine shifts dorsal to sympathetic. The substance is the lever.`,
      `Today you'll learn the three states in plain language. Then you'll locate yourself — where you are right now, and where you tend to oscillate.`,
      `The location is the work. Once you can name the state, you have options other than the substance.`,
    ],
    mechanic: {
      type: 'stateLocator',
      data: {
        introHeader: 'The three states.',
        states: [
          {
            id: 'ventral',
            label: 'Ventral vagal — safe and connected',
            description: `Calm but engaged. Curious. Able to make eye contact. Hunger and fullness work normally. Sleep restores you. You're available for conversation, work, intimacy.`,
            color: '#7A8C5A',
          },
          {
            id: 'sympathetic',
            label: 'Sympathetic — mobilized',
            description: `Heart rate up. Muscles tense. Mind racing or scanning. Could be productive (focused intensity) or dysregulated (anxiety, panic, anger). The body is preparing for action.`,
            color: '#C5572C',
          },
          {
            id: 'dorsal',
            label: 'Dorsal vagal — shutdown',
            description: `Low energy. Disconnected. Numb. Sleep doesn't restore. Difficulty engaging — with people, work, anything. Can look like depression. Can look like dissociation. The body has gone into preservation mode.`,
            color: '#6B5C4A',
          },
        ],
        locatorHeader: 'Where are you, right now?',
        locatorSubtext: 'Tap the state that fits best. There is no right answer.',
        oscillationHeader: 'Where do you tend to oscillate between?',
        oscillationSubtext: 'Across a normal week, what are the two states you spend most time in?',
        contextualPrompt: 'What pulled you into the substance, usually?',
        contextualOptions: [
          { id: 'sympathetic_to_ventral', label: 'From sympathetic (anxious/wound up) toward calm' },
          { id: 'dorsal_to_sympathetic', label: 'From dorsal (numb/shutdown) toward feeling alive' },
          { id: 'either_to_dorsal', label: 'From wherever I was toward dorsal (escape, shutdown)' },
          { id: 'not_sure_yet', label: `I'm not sure yet` },
        ],
      }
    },
    closingTitle: 'You located yourself.',
    closingBody: `The state has a name now. Without the substance, you'll move between states differently. The map will help.`,
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
      `The using mind tells a simple story: I used because I wanted to. I used for fun. I used because it was Friday.`,
      `The body tells a more honest one. The substance was, for most users, a way of not feeling specific emotions. Not all emotions. Specific ones. The ones that, for whatever reason in your specific history, became unsafe to feel without help.`,
      `Today's exercise surfaces those. You'll see a structured list of emotions that substance use commonly protects against. You tap the ones that fit your case. Custom additions allowed.`,
      `This isn't journaling. The list is provided. Your job is recognition, not generation.`,
    ],
    mechanic: {
      type: 'protectedEmotionsMap',
      data: {
        prompt: 'The substance was helping you not feel:',
        subtext: 'Tap every one that fits. The list is curated from clinical research.',
        emotionCategories: [
          {
            key: 'core',
            label: 'Core feelings',
            items: [
              { id: 'loneliness', label: 'Loneliness — even around people' },
              { id: 'shame', label: 'Shame — at being who you are' },
              { id: 'anger', label: 'Anger you were never allowed to express' },
              { id: 'grief', label: 'Grief — old, unresolved' },
              { id: 'fear', label: 'Fear that has no specific object' },
              { id: 'emptiness', label: 'Emptiness — a hollow feeling' },
            ]
          },
          {
            key: 'relational',
            label: 'Relational',
            items: [
              { id: 'unloved', label: `Being unloved or unloveable` },
              { id: 'invisible', label: 'Being invisible — not seen, not heard' },
              { id: 'too_much', label: 'Being too much for people' },
              { id: 'not_enough', label: 'Being not enough' },
              { id: 'abandoned', label: 'Being abandoned — old or current' },
              { id: 'unsafe', label: 'Being unsafe with the people who should keep you safe' },
            ]
          },
          {
            key: 'existential',
            label: 'Existential',
            items: [
              { id: 'pointlessness', label: 'A sense that none of this matters' },
              { id: 'failure', label: 'Being a failure at things you cared about' },
              { id: 'imposter', label: 'Being an imposter in your own life' },
              { id: 'stuck', label: `Being stuck — no way forward` },
              { id: 'wasted_time', label: 'Time wasted — years you can\'t get back' },
            ]
          },
        ],
        allowCustom: true,
        customPrompt: 'Another emotion the substance was protecting against',
        followUpPrompt: 'Looking at the list:',
        followUpOptions: [
          { id: 'all_familiar', label: 'All of these were familiar before the substance was here.' },
          { id: 'started_before', label: 'Most of these started long before the substance did.' },
          { id: 'substance_made_them_worse', label: 'The substance made some of these worse over time.' },
          { id: 'first_time_seeing', label: 'Some of these I am seeing for the first time today.' },
        ],
      }
    },
    closingTitle: 'They are named.',
    closingBody: `Naming is not curing. But the using mind cannot pretend they aren't there anymore.`,
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
      `Most people who slip during early sobriety do not slip because the substance won. They slip because of what happens after a single use.`,
      `The pattern has a name. Abstinence Violation Effect, identified by Marlatt and Gordon in 1985. One slip triggers shame. The shame triggers more use. More use confirms the identity ("I'm a failure"). The identity makes further use feel inevitable. A single lapse becomes a full relapse.`,
      `The intervention is pre-decision. Today, before any slip has happened, you build the protocol for what you'd do if it did. The protocol is small. It interrupts the shame spiral before it builds.`,
      `Pre-deciding doesn't make slipping more likely. It makes a single slip stay a single slip.`,
    ],
    mechanic: {
      type: 'aveProtocolBuilder',
      data: {
        steps: [
          {
            id: 'first_minute',
            header: 'In the first minute after, you will:',
            subtext: 'Before the shame builds. Before the second use feels inevitable.',
            options: [
              { id: 'stop_immediately', label: 'Stop immediately. Put down whatever is in hand.' },
              { id: 'leave_the_room', label: 'Leave the room. Physically change location.' },
              { id: 'cold_water', label: 'Cold water on the face' },
              { id: 'message_someone', label: 'Message someone you trust — even just one word' },
              { id: 'ten_breaths', label: 'Sit down and take ten slow breaths' },
            ]
          },
          {
            id: 'first_hour',
            header: 'In the first hour, you will:',
            subtext: 'The shame is loud now. It will tell you the day is ruined.',
            options: [
              { id: 'call_someone', label: 'Call someone — hear a voice, not a text' },
              { id: 'write_it_plainly', label: 'Write down what happened, plainly, without judgment' },
              { id: 'why_you_started', label: 'Bring to mind exactly why you started' },
              { id: 'walk_outside', label: 'Walk outside for 20 minutes' },
              { id: 'name_the_emotion', label: 'Name what is actually happening underneath' },
            ]
          },
          {
            id: 'first_day',
            header: 'The rest of the day, you will:',
            subtext: 'The day is not over. The relapse is what would happen next, not what happened.',
            options: [
              { id: 'eat_a_real_meal', label: 'Eat a real meal' },
              { id: 'reach_out_person', label: "Reach out to one person who knows what you're working on" },
              { id: 'one_small_routine', label: 'Get back to one small routine — water, a walk, a shower' },
              { id: 'sleep_at_normal_time', label: 'Sleep at your normal time' },
              { id: 'no_using_again_today', label: 'Not use again, no matter what — the slip stays a slip' },
            ]
          },
          {
            id: 'reframe',
            header: 'You will say to yourself:',
            subtext: `Tap the framing that you can actually believe. You'll need it in the moment.`,
            options: [
              { id: 'one_slip_not_relapse', label: 'One slip is not a relapse. The relapse is what I do next.' },
              { id: 'data_not_verdict', label: `This is data. Not a verdict on me.` },
              { id: 'choosing_again_now', label: `I'm choosing to stop again. Right now.` },
              { id: 'no_perfect_record', label: `My recovery doesn't require a perfect record. It requires continuing.` },
            ]
          },
        ],
        closeConfirm: 'I have built the protocol. If I slip, this is what I will do.',
      }
    },
    closingTitle: 'The protocol exists.',
    closingBody: `Built before any slip. Available if one comes.`,
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
      `On Day 2 you learned the three nervous-system states — ventral, sympathetic, dorsal. Today's exercise builds on that: matching what you do to which state you're in.`,
      `Most people in early sobriety try to manage difficult moments with one strategy — breathwork, or distraction, or going for a walk. The trouble is that the same strategy that helps in one state can make another state worse. Box breathing calms sympathetic but deepens dorsal. A walk helps ventral but is impossible in deep dorsal. Cold water shocks dorsal into sympathetic, which is good if you're shut down but bad if you're already wound up.`,
      `Today you'll build a small, personal plan. For each state: how you'll recognize you're in it, the one move you reach for first, and a backup if that's not enough.`,
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
    closingBody: `Different state, different move. The right one is now available.`,
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
      `Today is the close of Phase 1. The first week. The hardest stretch in terms of pure physiology, often.`,
      `Today's exercise is short. You'll see a brief summary of what the first week covered. You'll tap how it landed.`,
      `Then Phase 2 begins tomorrow — the middle week. Different texture. The flatness.`,
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
      `In early sobriety, the witness is the most useful capacity you can develop. It lets you notice a craving without becoming the craving. Notice a shame thought without becoming a shamed person. Notice the flatness without identifying with it as who you now are.`,
      `Today's exercise is short. A guided sit. You'll do it in the app, with prompts, for five minutes. The point is to feel — directly, even briefly — what witness consciousness is. Once you've felt it, you can return to it.`,
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
      `Today is Day 10. Halfway through Endure. There is no exercise today other than a single tap of how you are.`,
      `No structured work. Just an audio from Ninad, and one tap.`,
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
      `Recovery runs on what you put in the space the substance used to fill. Whether you planned those replacements at the start or you've been finding them as you go, eleven days in there is something \u2014 or a few things \u2014 you've been reaching for instead.`,
      `Today is a check-in on that. Some of it is working, some of it isn't; some is going better than expected, some is harder. You'll surface what's actually been happening \u2014 without judgment, just observation \u2014 and decide what to adjust.`,
    ],
    mechanic: {
      type: 'replacementEngineCheck',
      data: {
        pullFromArtifact: 'commit_day_4',
        statusOptions: [
          { id: 'started_on_schedule', label: 'Started on schedule. Doing it as committed.' },
          { id: 'started_less_often', label: 'Started, but less often than committed.' },
          { id: 'started_shorter', label: 'Started, but for shorter than committed.' },
          { id: 'havent_started', label: `Haven't started yet.` },
          { id: 'replaced_with_other', label: 'Replaced this with something else organically.' },
        ],
        difficultyPrompt: `What's making it hard?`,
        difficultyOptions: [
          { id: 'energy_low', label: 'Energy is low. Flatness makes initiation hard.' },
          { id: 'time_shorter', label: `Time is shorter than I planned for.` },
          { id: 'predicted_obstacle', label: 'The obstacle I predicted on Day 4 is the obstacle.' },
          { id: 'didnt_predict', label: `It's something I didn't predict.` },
          { id: 'nothing_specific', label: 'Nothing specific — just have not done it.' },
        ],
        adjustmentPrompt: 'What is the right adjustment?',
        adjustmentOptions: [
          { id: 'keep_same', label: 'Keep the same commitment. Do it.' },
          { id: 'shrink_size', label: 'Shrink the size — shorter or less frequent — and actually do it.' },
          { id: 'swap_activity', label: 'Swap this activity for something else.' },
          { id: 'pause_one', label: `Pause one of the two-three, focus on the others.` },
          { id: 'add_accountability', label: 'Add accountability — tell the anchor person.' },
        ],
        freshAddPrompt: 'What have you been reaching for?',
        freshAddSubtext: `Name one to three things you've actually been doing instead \u2014 to fill the space, get through the evening, take the edge off. They don't have to be impressive or even healthy. Just honest.`,
        freshStatusOptions: [
          { id: 'going_well', label: 'Going well. I reach for it without thinking now.' },
          { id: 'hit_and_miss', label: 'Hit and miss. Some days yes, some days no.' },
          { id: 'barely', label: 'Barely. I keep meaning to and not doing it.' },
          { id: 'not_really', label: 'Honestly, not really happening.' },
          { id: 'drifted_else', label: 'I drifted to something else instead.' },
        ],
        freshDifficultyOptions: [
          { id: 'energy_low', label: 'Energy is low. The flatness makes starting hard.' },
          { id: 'no_time', label: 'No time \u2014 it keeps getting eaten.' },
          { id: 'forget', label: 'I just forget in the moment.' },
          { id: 'doesnt_help_yet', label: "It doesn't do much for me yet." },
          { id: 'nothing_specific', label: 'Nothing specific \u2014 I just have not.' },
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
    closingBody: `Adjustment is part of the work. The point is not perfect execution. The point is the engine keeps running.`,
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
      `William White's framework names four kinds of recovery capital — the resources that determine whether someone sustains change. They are: physical (body, sleep, money, housing), human (skills, education, work), social (relationships, support), and cultural (values, meaning, identity, faith).`,
      `Most people in early sobriety overinvest in one or two and ignore the others. Today is a baseline assessment of where you actually stand on all four. Not aspirationally — currently.`,
      `On Day 16 you'll do the deep dive on whichever capital is the weakest. Today is just the snapshot.`,
    ],
    mechanic: {
      type: 'capitalAssessment',
      data: {
        version: 'baseline',
        capitals: [
          {
            key: 'physical',
            label: 'Physical capital',
            description: 'Your body. Sleep. Money. Housing. Health insurance. Physical safety.',
            items: [
              { id: 'sleep_consistent', label: 'My sleep is roughly consistent and restorative' },
              { id: 'eating_normally', label: 'I am eating normally most days' },
              { id: 'physical_health_okay', label: 'My physical health is roughly okay' },
              { id: 'financial_stable', label: 'My finances are roughly stable' },
              { id: 'housing_stable', label: 'My housing is stable' },
              { id: 'health_coverage', label: 'I have access to medical care if needed' },
            ]
          },
          {
            key: 'human',
            label: 'Human capital',
            description: 'Skills. Education. Work. Self-efficacy. Things you can do.',
            items: [
              { id: 'work_engaged', label: 'I am working, or doing meaningful work' },
              { id: 'skills_using', label: 'I am using my skills' },
              { id: 'learning_something', label: 'I am learning something new' },
              { id: 'projects_alive', label: 'I have projects I care about' },
              { id: 'can_handle_things', label: 'I can handle most things life puts in front of me' },
            ]
          },
          {
            key: 'social',
            label: 'Social capital',
            description: 'Relationships. Support. Community. People who know about your work on this.',
            items: [
              { id: 'anchor_person_active', label: 'Anchor person is active and engaged' },
              { id: 'witnesses_know', label: 'Multiple witnesses know about the vow' },
              { id: 'close_relationships_okay', label: 'Close relationships are roughly okay' },
              { id: 'community_belong', label: 'I belong to at least one community (workplace, friends, group)' },
              { id: 'someone_to_talk_to', label: 'I have someone to talk to when something hard happens' },
            ]
          },
          {
            key: 'cultural',
            label: 'Cultural capital',
            description: 'Values, meaning, identity, faith or philosophy, sense of belonging.',
            items: [
              { id: 'sense_of_purpose', label: 'I have a sense of what I am for' },
              { id: 'values_clear', label: 'My values are roughly clear to me' },
              { id: 'spiritual_practice', label: 'I have some form of spiritual or contemplative practice' },
              { id: 'cultural_belonging', label: 'I belong somewhere — tradition, culture, community' },
              { id: 'identity_beyond_substance', label: 'My identity is not centered on the substance or its absence' },
            ]
          },
        ],
        summaryHeader: 'Your baseline.',
        summarySubtext: 'On Day 16 you will go deeper into the capital that scored lowest.',
      }
    },
    closingTitle: 'The baseline is set.',
    closingBody: `Day 16 will go deeper into whichever capital scored lowest.`,
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
      `On Day 6 you made a structured statement of what the shame story has been saying. You also saw the alternative framings — not affirmations, but more accurate descriptions in clinical language.`,
      `Today, with a week between, you'll read what you made and see if anything has shifted. Sometimes the alternative framings have already settled in. Sometimes the original statement still feels truer. Both are useful information.`,
    ],
    mechanic: {
      type: 'shameStatement',
      data: {
        version: 'revisit',
        pullFromArtifact: 'endure_day_6',
        revisitHeader: 'Your statement from Day 6.',
        revisitSubtext: 'Read it whole. Then mark how each component lands now.',
        landingOptions: [
          { id: 'less_true', label: 'Feels less true than it did' },
          { id: 'about_same', label: 'About the same' },
          { id: 'still_true', label: 'Still feels true' },
          { id: 'reframe_landing', label: 'The reframe has started to land' },
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
      `Phase 2 ends today. The middle week — anhedonia, the witness, halfway, the capital baseline, the shame revisit.`,
      `Phase 3 begins tomorrow. The return. Things start coming back in Phase 3 — not the substance, the rest of life. Pleasure registering again. Connection landing again. The reasons for the vow becoming more vivid, not less.`,
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
      `Day 4 introduced the AVE protocol — what to do if you slip. Today is a different kind of check-in. Most people, by Day 15, have either had a near-slip or a real slip or have been within an inch of one and pulled back. Today is for naming that honestly.`,
      `The point is not confession. It's data. What were the conditions when the urge was loudest? What pulled you back, or didn't? Knowing this is what makes the second half of Endure different from the first half.`,
    ],
    mechanic: {
      type: 'lapseRelapseRecall',
      data: {
        statusPrompt: 'What has actually happened?',
        statusOptions: [
          { id: 'no_close_calls', label: `No close calls. The urge has been manageable.` },
          { id: 'close_calls_held', label: 'A few close calls. I held.' },
          { id: 'one_close_call', label: 'One specific close call. I held.' },
          { id: 'slipped_once', label: 'I slipped once. Used the AVE protocol.' },
          { id: 'slipped_more_than_once', label: 'I have slipped more than once.' },
        ],
        conditionsPrompt: 'When the urge was loudest, what was happening?',
        conditionsOptions: [
          { id: 'specific_emotion', label: 'A specific emotion was loud — anger, loneliness, shame, grief' },
          { id: 'specific_person', label: 'A specific person or interaction triggered it' },
          { id: 'specific_setting', label: 'A specific setting (bar, party, alone at home, etc.)' },
          { id: 'specific_time', label: 'A specific time of day (evening, late night, weekend)' },
          { id: 'no_specific_trigger', label: 'No specific trigger — it just appeared' },
          { id: 'physical_state', label: 'A physical state — tired, hungry, sick' },
        ],
        held_pulledBack_prompt: 'What pulled you back, or did the work?',
        held_pulledBack_options: [
          { id: 'reread_vow', label: 'I re-read the vow' },
          { id: 'anchor_person', label: 'The anchor person was reachable' },
          { id: 'urge_breaker', label: 'An urge breaker from the Day 5 if-then library' },
          { id: 'remembered_why', label: 'I remembered why I was doing this' },
          { id: 'physical_action', label: 'A specific physical action — cold water, walk, etc.' },
          { id: 'just_waited', label: 'I just waited. The urge passed on its own.' },
          { id: 'witness', label: 'The witness — watching it without becoming it' },
        ],
      }
    },
    closingTitle: 'It is named.',
    closingBody: `What you wrote is data, not verdict. The second half of Endure adjusts to it.`,
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
      `On Day 12 you assessed all four capitals — physical, human, social, cultural. Today you go deeper into whichever scored lowest. The point is not to fix it today. The point is to know which one will need the most attention across the next month and beyond.`,
      `Today's exercise will pull your Day 12 scores, surface the lowest capital, and walk you through specific work areas within it.`,
    ],
    mechanic: {
      type: 'capitalAssessment',
      data: {
        version: 'deep_dive',
        pullFromArtifact: 'endure_day_12',
        deepDivePrompt: 'For your lowest capital, what specific area needs the most work?',
        physicalAreas: [
          { id: 'sleep', label: 'Sleep — make it consistent and protected' },
          { id: 'nutrition', label: 'Eating — regular, real food' },
          { id: 'exercise', label: 'Body movement — even 20 minutes/day' },
          { id: 'medical', label: 'Medical — book the appointment that has been delayed' },
          { id: 'finances', label: 'Finances — start tracking, even badly' },
        ],
        humanAreas: [
          { id: 'work_meaning', label: 'Work — find one project that feels meaningful' },
          { id: 'skill_building', label: 'Skills — start learning something new, small commitment' },
          { id: 'self_efficacy', label: 'Self-efficacy — pick something I can finish in a week' },
          { id: 'creative_work', label: 'Creative work — even 20 minutes/day' },
        ],
        socialAreas: [
          { id: 'anchor_more_active', label: 'Anchor person — make the relationship more active' },
          { id: 'add_witness', label: 'Add another witness or two' },
          { id: 'repair_relationship', label: 'Repair one specific relationship' },
          { id: 'community', label: 'Find or join one community' },
          { id: 'tell_one_more', label: 'Tell one more person about the vow' },
        ],
        culturalAreas: [
          { id: 'contemplative_practice', label: 'Start a small contemplative practice — 10 min/day' },
          { id: 'values_clarify', label: 'Clarify three values — write them, post them' },
          { id: 'tradition_return', label: 'Return to a tradition I left' },
          { id: 'meaning_project', label: 'Take on a project that is purely about meaning' },
        ],
        commitmentPrompt: 'What is the smallest commitment for the next 30 days?',
      }
    },
    closingTitle: 'The lowest capital has work named.',
    closingBody: `Not all at once. Smallest commitment. The next month of work, focused.`,
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
      `Day 11 was the first replacement engine check. Today is the second. A week between. Things may have changed — what was hard may be easier now, what was easy may have stalled, you may have adjusted naturally without realizing it.`,
      `Today's exercise is the same shape as Day 11, but reads from your Day 11 data so you can see what shifted.`,
    ],
    mechanic: {
      type: 'replacementEngineCheck',
      data: {
        version: 'second',
        pullFromArtifact: 'commit_day_4',
        pullPriorCheck: 'endure_day_11',
        statusOptions: [
          { id: 'consistent', label: 'Consistent. Doing it as committed.' },
          { id: 'consistent_smaller', label: 'Consistent but at smaller size than committed.' },
          { id: 'inconsistent', label: 'Inconsistent — some weeks yes, some no.' },
          { id: 'swapped', label: 'Swapped for something else, which is working.' },
          { id: 'stopped', label: 'Stopped doing this one.' },
        ],
        whatChangedPrompt: 'What has changed since Day 11?',
        whatChangedOptions: [
          { id: 'easier_to_initiate', label: `It's easier to initiate now.` },
          { id: 'something_started_clicking', label: 'Something has started clicking.' },
          { id: 'flatness_lifted', label: 'The flatness has lifted, so reward registers more.' },
          { id: 'still_hard', label: 'Still hard. Doing it anyway.' },
          { id: 'realized_wrong_activity', label: `Realized this wasn't the right activity for me.` },
        ],
      }
    },
    closingTitle: 'Second check complete.',
    closingBody: `Adjustment continues. The engine keeps running.`,
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
      `On Day 2 you located yourself in the polyvagal three-state model. Day 5 you built state-matched responses. Today you'll do a full map — across all eighteen days, where have you actually been spending time, and where do you tend to oscillate now that the substance isn't part of the regulation?`,
      `The map will surface the dominant state, the secondary state, and the specific moments that pulled you toward each.`,
    ],
    mechanic: {
      type: 'stateLocator',
      data: {
        version: 'map',
        introHeader: 'Across the past eighteen days:',
        introSubtext: 'Tap which state you have spent most time in, second-most time in, and least.',
        rankPrompt: 'Rank the three states by where you have been:',
        contextualPromptDominant: `What pulls you into your dominant state, now?`,
        contextualPromptSecondary: `What pulls you into your secondary state?`,
        contextualOptions: [
          { id: 'specific_people', label: 'Specific people' },
          { id: 'specific_settings', label: 'Specific settings (work, home, social)' },
          { id: 'time_of_day', label: 'Time of day' },
          { id: 'specific_emotions', label: 'Specific emotions surfacing' },
          { id: 'physical_state', label: 'Physical state (tired, fed, hungry, sick)' },
          { id: 'unexpected', label: `Sometimes unexpectedly — I can't name why` },
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
      `Day 16 named cultural capital — values, meaning, identity. Today goes specifically into values. Most people think they know their values but have never named them in a way that holds up. Today you'll do that.`,
      `The exercise pulls from a structured list. You tap what is true. Then you rank the top five. The point is not the list itself. It's that the next year of your life will be more coherent if you can name what you actually value, not what you think you should value.`,
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
            ]
          },
          {
            key: 'work',
            label: 'Work and craft',
            items: [
              { id: 'mastery', label: 'Mastery — being genuinely good at something' },
              { id: 'service', label: 'Service — making other people\'s lives better' },
              { id: 'creativity', label: 'Creativity — making things that did not exist before' },
              { id: 'rigor', label: 'Rigor — doing things properly' },
              { id: 'impact', label: 'Impact — leaving things better than I found them' },
            ]
          },
          {
            key: 'self',
            label: 'Self',
            items: [
              { id: 'integrity', label: 'Integrity — being the same person in all rooms' },
              { id: 'growth', label: 'Growth — being better next year than this year' },
              { id: 'courage', label: 'Courage — doing the hard thing because it is right' },
              { id: 'discipline', label: 'Discipline — keeping promises to myself' },
              { id: 'humility', label: 'Humility — knowing what I don\'t know' },
              { id: 'self_respect', label: 'Self-respect — earning it through action' },
            ]
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
              { id: 'meaning', label: 'Meaning — the sense that this is for something' },
            ]
          },
        ],
        allowCustom: true,
        customPrompt: 'A value of your own',
        rankPrompt: 'Now rank your top 5.',
        rankSubtext: 'Drag or tap in order. These are the five that, if you had to choose, you would never trade.',
      }
    },
    closingTitle: 'Your values are surfaced.',
    closingBody: `Cultural capital is built on values made explicit. The list is yours now.`,
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
      `Twenty days of work are behind you. The portrait today is not a self-description you generate. It is a portrait made from your actual taps across Endure — the states you have spent time in, the protected emotions you named, the AVE protocol you built, the shame statement you wrote, the capitals you mapped, the values you ranked, the urges you held against.`,
      `The portrait will assemble itself. You will read it. Then you'll tap which parts of it are most true.`,
    ],
    mechanic: {
      type: 'endurePortrait',
      data: {
        pullFromArtifacts: [
          'endure_day_2', 'endure_day_3', 'endure_day_4', 'endure_day_6',
          'endure_day_8', 'endure_day_12', 'endure_day_15', 'endure_day_18', 'endure_day_19',
        ],
        composedHeader: 'Your portrait, in your own taps.',
        composedSubtext: 'Assembled from the eighteen days behind you. Read it whole.',
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
      `Today is Day 21. The last day of Endure. There is one exercise — reading your vow, then marking Day 21 with a single tap.`,
      `The vow was sealed on Commit Day 8. It has held for twenty-one days. Today you read it again, with twenty-one days of holding underneath you.`,
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