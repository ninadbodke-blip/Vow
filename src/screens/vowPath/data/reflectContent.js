// =====================================================================
// REFLECT — 30 Days of Content
// =====================================================================
// All 30 days of the Reflect stage as structured data.
// Each day has: arrival, optional founder audio, reading paragraphs,
// reflection prompt, post-save message, closing line.
//
// Audio files are referenced by path but not yet uploaded.
// Player UI works; playback will 404 until you record/upload.
// =====================================================================

export const REFLECT_DAYS = [
  {
    day: 1,
    arrivalTitle: `What brought you here?`,
    arrivalSubtitle: `Take your time. This is yours.`,
    founderAudio: {
      script: `Hi. I'm Ninad.

Before I say anything else, I want to say this. You're here because something inside you knows. Maybe you can't name it yet. Maybe you've been talking yourself out of it for years. But something brought you to this app, and that something doesn't lie.

I want to tell you what these 30 days are, and what they aren't.

They aren't a quitting program. I'm not going to ask you to set a quit date. I'm not going to count how many days you've gone without. I'm not going to celebrate or shame you depending on how you're using this week.

What we're doing for the next 30 days is harder than quitting. We're going to look. Honestly. At what this thing has cost you. What it gives you that you haven't been willing to find elsewhere. Who you've become inside it. And who you might be without it.

Most people never let themselves do this. They circle the truth for years, sometimes decades, never letting it land. They quit and relapse without ever understanding why. They white-knuckle it for six months and slip back, mystified.

You and I are going to do it differently. We're going to actually look. And by Day 30, you'll know things about yourself that most people avoid their whole lives.

Some days will be uncomfortable. That's the work. If it doesn't sting at least sometimes, we're not doing it right.

There's no streak to maintain. No counter to break. Just 30 days of you, sitting with what's true. A reading, a question, a journal entry. Ten minutes a day, if you let it land.

By Day 30 you'll have three doors. You'll know which one is yours.

For today, one question. The same one I had to answer myself, years ago, before any of this changed.

What brought you here? Don't answer it for me. Answer it for you. The real answer. The one underneath the answer you'd give anyone else.

We'll talk again on Day 15.`,
      audioSrc: `/audio/reflect/day_01_founder.mp3`,
    },
    readingParagraphs: [
      `Something brought you here.`,
      `You probably know what it was, even if you haven't said it out loud.`,
      `It was a moment. Maybe a small one. A morning where you looked in the mirror and saw someone you didn't fully recognize. A bill you hid from your wife. A kid who looked at you a certain way and you knew, in your gut, that they'd noticed. A friend who quit and started looking lighter, freer, taller — and seeing them made something in your chest tighten in a way you didn't want to examine.`,
      `Or maybe it was bigger. A scare. A fight. A doctor's appointment. A morning after a night you couldn't fully account for. A specific number you saw — money spent, hours lost, weight gained, things forgotten — that you couldn't unsee.`,
      `Whatever it was, it cracked something open. And here you are.`,
      `I want to be direct with you. The fact that you're reading this means something. Most people in your situation never get this far. They sense the same thing you're sensing — that something isn't right, that they've been telling themselves a story that no longer holds — and they push it back down. They have a drink, a smoke, a hit, and the questions go quiet for another week. Another month. Another year.`,
      `You're not doing that today. You're here. That's not nothing.`,
      `But I have to be honest with you about what comes next, because if we're going to do this together, you need to know what you're signing up for.`,
      `The next 30 days are not going to make you feel better. They're going to make you feel more — more aware, more uncomfortable, more honest. You're going to look at things you've been avoiding. You're going to notice patterns you've kept hidden from yourself. You're going to write things in your journal that no one else will ever read, but that will change how you see yourself by the time we get to Day 30.`,
      `This isn't a program designed to make you quit. It's a program designed to make you unable to keep lying to yourself. What you do with that truth, when you have it, is your choice. Some users finish these 30 days and decide they're ready to commit to stopping. Some decide they're not yet ready, and they keep reflecting. Some decide they were wrong about themselves and walk away from Vow. All three of those are honest endings.`,
      `What's not honest is staying in the fog. And the fog is what we're cutting through.`,
      `So today, we begin with the simplest question, but maybe the hardest. The one that, if you answer it truly, will set the tone for everything else.`,
      `I'm not asking you to write a memoir. A few sentences. A paragraph at most. Just the truest version of the answer you can give right now.`,
      `What brought you here?`,
      `Not the polite answer. Not the answer you'd give a colleague who asked. The real one.`,
      `Take a breath. Then write.`,
    ],
    promptType: 'text',
    promptQuestion: `What brought you here?`,
    promptSubtext: `Not the surface answer. The real one. The one underneath the answer you'd tell a friend. The one you'd write in the dark, alone, with no one watching. A few sentences. A paragraph. Whatever's true. This entry is private. No one but you will ever see it. We'll come back to what you wrote on Day 30, and you'll see how much has shifted.`,
    postSaveMessage: `Saved. See you tomorrow.`,
    closingLine: `You looked today. That's the work.`,
  },
  {
    day: 2,
    arrivalTitle: `The first time`,
    arrivalSubtitle: `Where this became yours.`,
    founderAudio: null,
    readingParagraphs: [
      `Everyone has a first time. But that's not what we're after today.`,
      `The first cigarette you smoked at sixteen behind your school. The first beer at someone's older cousin's wedding. The first joint passed around in a hostel room. The first scratch card you bought on a whim. The first website you opened in a private browser when no one was home. The first line of cocaine offered at a party.`,
      `Those first times don't matter much. Most people try things. Most people taste them and either move on or don't. The casual first time is just experimentation. It's not where the addiction lives.`,
      `The first time we're after today is a different one.`,
      `It's the moment it stopped being casual.`,
      `The first time you reached for it on purpose. Not because it was offered. Not because everyone else was doing it. Because you needed it. Because something in you had decided, without quite admitting it, that this thing was now part of how you handled your life.`,
      `Go looking for that moment. It's there. Most people, when they sit with this, can find it.`,
      `For some it's the first cigarette they smoked alone. Walking home from the office after a brutal day. Standing on the balcony at 11pm. The first time it wasn't social — the first time it was for them.`,
      `For some it's the first drink poured by themselves, in their own home, with no one to drink with. A glass of whisky in front of the TV after the kids went to sleep. A beer cracked open at 4pm on a Sunday. The first time alcohol was no longer about company — it was about silence.`,
      `For some it's the first time the joint was something they sought out, not something that came around. The first time they bought their own stash. The first time they came home, locked the door, and rolled one because they couldn't face the evening sober.`,
      `For gambling, it's often the first bet placed alone. Late at night, on a phone, with money you couldn't afford to lose. Not the casino with friends. Not the cricket game with cousins. The first private bet — the one no one else knew about.`,
      `For porn, it's the first time it became compulsive. Not curious anymore. Not occasional. The first time you watched it knowing you'd watch it again later that day. Or the first time you watched it instead of dealing with something — a fight with your partner, an anxiety you didn't want to face, a Sunday afternoon when the silence got too loud.`,
      `For hard drugs, it's often the first time you sought out the second hit. The first time wasn't a choice — someone offered, you said yes. The second time was the choice. That's the one we want.`,
      `Whatever your substance, there is a moment when it crossed a line. When it stopped being something you did and started being something you needed. Most people have buried this moment. The substance doesn't want you to remember. Because if you remember the function it was originally serving, you also have to ask whether it's still serving that function — or whether the function disappeared years ago and you just kept using.`,
      `That's the question Day 2 plants. Not for you to answer in full today. Just to plant.`,
      `Today, find the moment.`,
      `Sit with it for as long as you can stand to.`,
      `Then write.`,
    ],
    promptType: 'text',
    promptQuestion: `When did it stop being casual?`,
    promptSubtext: `Not the first time you tried it. The first time you reached for it on purpose, alone, because you needed it. Where were you? What was happening in your life right then? What were you trying to feel, or trying to not feel? Most people surface a specific moment they haven't thought about in years. Whatever comes up is what was waiting to be remembered. Write it down.`,
    postSaveMessage: `Saved. We'll come back to this.`,
    closingLine: `That moment is the door. Now we know where to look.`,
  },
  {
    day: 3,
    arrivalTitle: `What does it give you?`,
    arrivalSubtitle: `The honest list.`,
    founderAudio: null,
    readingParagraphs: [
      `There is a reason you keep going back.`,
      `If using gave you nothing, you would have stopped years ago. You're not stupid. You're not weak. You're not broken in some way that other people aren't. You keep reaching for this thing because, on some level, it works. It's giving you something. It has been giving you that thing for a long time.`,
      `The first piece of looking honestly at your relationship with this substance is naming what it gives you. Without judgment. Without arguing with yourself. Without pretending the answer is "nothing, it's all bad." That answer is dishonest and you know it.`,
      `So let's actually name it.`,
      `For the cigarette smoker, what the substance gives you might be: a five-minute break from your desk that feels socially acceptable. A reason to step outside. A pattern in the day that makes time feel structured. The sharpness of focus that comes with the first drag. The companionship of smoking with colleagues. Something to do with your hands when your hands don't know where to go.`,
      `For the drinker, it might be: the moment in the evening when the day's tension finally releases. The social ease that lets you talk to people you'd otherwise avoid. The taste, which you've genuinely come to enjoy. The ritual of pouring. The marker that work is over and life can begin. The numbness when life is too sharp.`,
      `For the weed user, it might be: the slowing down of a mind that runs too fast. The creativity that feels accessible. The way ordinary food tastes again. The laughter with friends that feels easier. The escape from anxiety that nothing else has reliably touched. The permission to stop trying so hard.`,
      `For the gambler, it might be: the surge of being fully alive. The escape from a life that has felt flat for years. The hope, even false hope, that something could change today. The community of other players. The thing that happens in your brain at the moment of placing a bet.`,
      `For the porn user, it might be: the only place you feel desire without complication. The release of stress that nothing else gives you. The escape from a day you couldn't process. The privacy. The control. The reliable way to feel something when other parts of life have gone numb.`,
      `For the hard drug user, it might be: the only thing that has ever made you feel okay. The pain you don't have to carry while you're using. The version of yourself that finally feels worth something. The friends who use with you, who don't judge.`,
      `These are real. Every single one of them is real. The substance is doing real work for you. If we don't honor that, we can't have an honest conversation about anything.`,
      `What we will do, in the days ahead, is examine each of these benefits — not to dismiss them, but to ask whether the substance is actually delivering what you think it's delivering, and whether it's the only way to get what you need. That examination starts later. Today is just the list.`,
      `Today's reflection asks you to be honest. Maybe more honest than you've been with yourself in a while. Write down what this thing gives you. Not the answer that makes you sound rational. Not the answer that justifies. Just the truthful list.`,
      `You're not committing to anything by writing this list.`,
      `You're just naming what's been working.`,
    ],
    promptType: 'text',
    promptQuestion: `What does it give you?`,
    promptSubtext: `The real benefits. The ones that have kept you reaching for it. Stress relief. Sleep. Confidence. Social ease. Pleasure. Identity. Escape. Routine. Connection. Quiet. Excitement. Numbness. Something else. Don't filter. Don't argue with the list. Just write down what's actually true. This is private. No one will see it. We need this list to be honest, because we'll come back to each item later.`,
    postSaveMessage: `Saved. We'll come back to this list.`,
    closingLine: `Now we know what it's been doing for you. That changes what comes next.`,
  },
  {
    day: 4,
    arrivalTitle: `What does it cost you?`,
    arrivalSubtitle: `The other side of the ledger.`,
    founderAudio: null,
    readingParagraphs: [
      `Yesterday, we named what it gives you. Today, we name what it takes.`,
      `This is the day most people instinctively want to skip. Day 3 was easier — naming benefits is almost pleasant, in a strange way. It validates the using. It explains why you've been doing this for years. Day 4 is harder, because it asks you to look at the other side of the same coin.`,
      `But we cannot weigh anything by holding only one side. So today, we look at the costs. Not in the abstract. Not as a lecture about what addiction does to people. As a specific, personal, honest accounting of what this thing has taken from your life.`,
      `The costs come in many forms, and most people only think about one or two. Let's name the categories.`,
      `Money. This is the most obvious and the easiest to count. What have you spent this year on this thing? This month? Today? The number is almost always higher than people guess when they finally write it down. We'll come back to this with a calculator tomorrow.`,
      `Time. Hours of life consumed by using, recovering from using, planning the next use, hiding the use from people who'd notice. The time spent half-present at family events because you were waiting to leave and use. The weekends that blurred together. The mornings lost to hangovers, comedowns, or shame.`,
      `Sleep. Almost every substance disrupts sleep, even ones the user thinks "help" them sleep. The 3am wake-ups. The shallow, unrefreshing rest. The exhaustion that's become your normal.`,
      `Body. What your body has been telling you for a while now. The weight. The breath. The skin. The energy that's not what it used to be. The medical numbers you've been avoiding checking.`,
      `Mind. The focus that's slipping. The memory that's not as sharp. The emotional flatness on days you don't use. The anxiety that creeps back stronger each time the substance wears off.`,
      `Relationships. The conversations with your spouse that ended in a fight or in silence. The kid who's noticed something they don't have words for. The friends you've grown distant from because they don't share this part of your life. The friends you've grown closer to because they share it, in a way that doesn't quite feel like real friendship.`,
      `Self-respect. The promises you made to yourself that you've quietly broken, again and again. The version of yourself you imagined being by now, and aren't. The voice in your head that's gotten quieter over the years because you stopped listening to it.`,
      `Possibility. The book you didn't write. The business you didn't start. The relationship you didn't fully show up for. The version of your life that didn't happen because you were busy maintaining the one with this thing in it.`,
      `Some of these will feel sharper than others depending on what your substance is and how long you've been using. A daily smoker might feel the body costs heaviest. A gambler might feel the money and the self-respect. A porn user might feel the relationship costs most acutely. A drinker might feel the time, the sleep, and the slow accumulation of small numbnesses.`,
      `You know which categories cut deepest for you. Don't write a complete inventory. Write the ones that, when you're honest, are actually true for your life.`,
      `What you wrote yesterday is still true. The substance has been giving you something. But it has also been taking. Today we name what.`,
      `This is the harder list.`,
      `Take a breath. Then write.`,
    ],
    promptType: 'text',
    promptQuestion: `What has it cost you?`,
    promptSubtext: `Money. Time. Sleep. Body. Mind. Relationships. Self-respect. Possibility. Don't list everything. Pick the costs that, when you're honest with yourself, actually hurt to look at. Write specifically. Not "it costs me money" — but "I spent ₹X this month, and I know because I checked yesterday." Not "it costs me my marriage" — but "the conversation I avoided last week. The one I keep avoiding." This is private. We'll come back to this list later.`,
    postSaveMessage: `Saved. The harder list is done.`,
    closingLine: `Now you have both sides. We'll hold them together in the days ahead.`,
  },
  {
    day: 5,
    arrivalTitle: `The Cost Calculator`,
    arrivalSubtitle: `The actual numbers.`,
    founderAudio: null,
    readingParagraphs: [
      `Yesterday we named the costs. Today we count one of them.`,
      `Most people in your situation have a rough sense of what they spend on this thing. "A few thousand a month." "I don't really keep track." "Less than I used to." These are the things we tell ourselves so we don't have to know the truth.`,
      `Today, we know the truth.`,
      `The calculator below will ask you a few questions about your substance, how often you use it, and what each use costs. It will then show you something you've probably never seen written down: how much money this thing has actually consumed. How many hours of your life it has occupied. How many days you've effectively spent under its influence over the years.`,
      `These numbers are not designed to make you feel bad. They're designed to be true. What you do with truth is your business. But before any of the deeper work of the next 25 days, you need to see what we're working with. The fog needs to lift on this one part.`,
      `When the numbers come up, don't argue with them. Don't try to rationalize them. Just look at them.`,
      `For some users this is the day everything shifts. They see the number and something inside them quietly settles — a thing they had been avoiding for years finally lands. For others it's a confirmation of what they already suspected. Either way, the looking matters.`,
      `Be honest in the answers. The math is only as useful as the inputs are accurate. There is no judgment in this app. Vow doesn't share these numbers with anyone. You're not telling anyone but yourself.`,
      `When you're ready, open the calculator below.`,
    ],
    promptType: 'text',
    promptQuestion: `How often do you use [substance] right now? Single-select options: - Multiple times a day - Once a day - 4-6 times a week - 2-3 times a week - Once a week - Less than once a week ---------------------------------------------------------------------- STEP 3: COST PER USE ---------------------------------------------------------------------- Question (large, serif): Roughly, what does one use cost you?`,
    promptSubtext: `What surfaced when the actual math landed? Surprise? Anger? Sadness? Resignation? Something else? Don't write what you're supposed to feel. Write what actually came up.`,
    postSaveMessage: `Saved. The numbers are now part of what we're working with.`,
    closingLine: `Now you know. We'll come back to this calculator again on Day 11.`,
  },
  {
    day: 6,
    arrivalTitle: `The story you tell`,
    arrivalSubtitle: `The script you've been running.`,
    founderAudio: null,
    readingParagraphs: [
      `Every person who uses has a story they tell about it.`,
      `Sometimes the story is told out loud, to people who ask. "I just have a few drinks to unwind." "I only smoke socially." "It helps me sleep." "I'm not really a gambler — I just play occasionally."`,
      `Sometimes the story is told silently, only to ourselves. "I'm not like those addicts." "I have it under control." "I work hard, I deserve this." "I'll cut down after this project ends. After this wedding. After this year."`,
      `These stories are not lies, exactly. The person telling them often half-believes them. They were true once, or partially true, or true in a specific moment that has long since passed. But the substance has been telling itself through us for years, and the stories have been sustaining the using long after they stopped being accurate.`,
      `Today we look at the stories. Not to dismantle them. Just to look.`,
      `The most common stories are usually some version of these:`,
      `"I have it under control." This story is comforting because if it's true, no change is needed. The substance is something you manage, not something that manages you. Most users tell this story for years even as the evidence steadily contradicts it. When you say "I have it under control," ask yourself when you last decided to skip a use that you'd planned. Ask yourself how many times you've cut down and gone back. Ask yourself whether you control it or whether you've simply learned to use in a way that hasn't yet made the consequences undeniable.`,
      `"It helps me cope / sleep / focus / relax." This story is the substance's most powerful argument for itself. It positions the substance as a solution, not a problem. The complication is that almost every substance disrupts the very thing it claims to help. Alcohol fragments sleep while feeling sedating. Cannabis dulls anxiety in the moment but worsens the baseline. Tobacco sharpens focus only by treating the withdrawal it caused. Porn relieves stress only by creating new stresses. The substance is medicating problems that, in many cases, the substance itself made worse.`,
      `"I'm not like those addicts." This story is built on a false binary — you're either an addict (gutter, broken, unable to function) or you're fine. Most people who use are neither. They are functional, accomplished, employed, loved by their families, and quietly trapped. The "those addicts" framing is a way of keeping yourself outside the category that would require you to do something. Most people who eventually quit didn't fit the addict stereotype either.`,
      `"Everyone does it." This story uses social proof to neutralize personal responsibility. Even if it were true that everyone in your circle uses similarly, that doesn't mean it's working for you. And if you look honestly, "everyone" is usually the friends you've selected for, in part, because they share the habit. Your actual peer group — extended family, college friends from years ago, professional contacts who don't share your scene — is more varied than "everyone."`,
      `"I'll cut down after [thing]." This story works because the deadline is always somewhere in the future. After this wedding. After this project. After Diwali. After the year ends. The deadline arrives, and a new one appears. The story sustains the using forever by always being almost-about- to-end.`,
      `These are the most common scripts. You probably have your own variation, with your own specific phrasing.`,
      `Today we write them down. In your own words. So we can look at them in the daylight.`,
    ],
    promptType: 'text',
    promptQuestion: `What's the story you've been telling?`,
    promptSubtext: `The phrases you say out loud when someone asks. The ones you say silently to yourself when you reach for it. Write them down in your own words. Three or four. The ones you actually say. Don't argue with them on the page. Just write them. We'll look at them later.`,
    postSaveMessage: `Saved. Now they're written down.`,
    closingLine: `Stories are easier to examine when they're outside your head.`,
  },
  {
    day: 7,
    arrivalTitle: `What your body knows`,
    arrivalSubtitle: `Listen below the words.`,
    founderAudio: null,
    readingParagraphs: [
      `Your body knows things your mind hasn't admitted yet.`,
      `For six days now, we've been working in the territory of the mind. Memories, beliefs, costs, stories, numbers. All of it lives between your ears. Today we go below the neck.`,
      `This is unfamiliar terrain for most people. Especially in India, especially for men, especially for the kind of accomplished, functional, urban professional who downloads an app like this. We are taught to live in our heads. To think our way through. To analyze, plan, decide. The body becomes a vehicle that carries the mind around. We notice it when it breaks down. Otherwise, it's quiet.`,
      `But your body has been having a relationship with this substance for years, and it has been telling you things you may have stopped hearing.`,
      `Think for a moment about the daily rhythm of your using.`,
      `There is, almost always, a moment in the day when the using is coming. Maybe it's 4pm at the office. Maybe it's the moment you walk through the front door of your home. Maybe it's after dinner when the kids have gone to sleep. Maybe it's when you open your laptop alone at 11pm.`,
      `Pay attention to what happens in your body in that moment.`,
      `For most users, there is a specific physical sensation. A tightening in the chest. A restlessness in the legs. A particular quality in the stomach. A heaviness in the shoulders. A heat in the hands. The body knows what's coming, and it begins preparing — sometimes with anticipation, sometimes with dread, often with both at once.`,
      `Then the using happens. And again, the body has a specific response. A loosening. A warmth. A settling. The shoulders drop. The breath slows. The thing the body was holding releases.`,
      `Then the after. The hangover, the comedown, the morning regret. This too lives in the body. The thickness behind the eyes. The acid in the stomach. The shame that, if you pay attention, has a specific physical location — often in the chest, often in the throat.`,
      `The substance is not just doing something to your mind. It has been negotiating with your body, every day, for years.`,
      `Most users have stopped hearing what the body is saying because the conversation is so constant it has become invisible. Like white noise. Like the hum of a fan you've stopped noticing because it's always there.`,
      `Today, we listen.`,
      `The reflection below asks you to think back over the last week — the last few days, even just yesterday — and notice what your body has been doing around the substance. The signals before. The release during. The cost after. Where in your body does each of these live?`,
      `You don't need to be a meditator to do this. You don't need any vocabulary about "somatic awareness." You just need to remember what your body felt like, and write it down in plain words.`,
      `Many users find, when they do this honestly for the first time, that their body has been louder than they realized. The tightness before using is a question. The release during is an answer. The discomfort after is a reckoning. Three different things, all coming from the same body, all carrying information.`,
      `This day plants something we'll come back to. On Day 22, deeper into the program, we'll do this again with more depth. By then you'll already know what to listen for.`,
      `For today, just notice. Notice what your body has been saying. Then write.`,
    ],
    promptType: 'text',
    promptQuestion: `Where in your body does this live?`,
    promptSubtext: `Think about a recent use. Yesterday, last weekend, this morning. The hour before — what was happening in your body? Where was the tension, the restlessness, the pull? The during — what shifted? What released? What part of you got what it was waiting for? The after — what was left? Where in your body did the cost show up? Write what you noticed. Plain words. The body doesn't need fancy vocabulary.`,
    postSaveMessage: `Saved. Your body has been keeping a record.`,
    closingLine: `The body knows. It has always known. We'll come back to it on Day 22.`,
  },
  {
    day: 8,
    arrivalTitle: `A letter to who you were`,
    arrivalSubtitle: `Before this took its place.`,
    founderAudio: null,
    readingParagraphs: [
      `There was a version of you before this took its place.`,
      `Try to bring that person to mind. Not as a photograph. As a presence.`,
      `For some users, this is the eighteen-year-old self. For some it's younger — the version before college, before the hostel room, before the first time things became serious. For some it's later — the version of you in your early twenties, before a particular hard year, before something cracked. Whoever it is, find them.`,
      `That earlier you was not who you are now. They had a different body, probably leaner, certainly less tired. They had different worries, smaller in some ways, sharper in others. They had a future that was still mostly imagined — not yet lived, not yet narrowed by all the choices that would come.`,
      `Most importantly, they had not yet developed the relationship with this substance that you have now. Maybe they had tried it. Maybe they hadn't. But the thing this has become for you — the daily companion, the reliable answer, the costly habit — wasn't yet who they were. They were someone before this took its place.`,
      `I want you to write that person a letter today.`,
      `Not a greeting-card letter. Not a hopeful letter that says everything will be fine. A real one. One in which you tell them what you see now, from where you are, that they couldn't see then.`,
      `Some users, when they first try this, freeze. They don't know what to say. The earlier you is hard to find. Years of using, working, marrying, parenting, performing have buried that version. If this is you, sit for a minute. Try to remember a specific day from that time. A particular morning. A specific room you spent time in. A friend you had then who isn't in your life now. The smell of a place you used to go. Let one detail surface, and the rest will follow.`,
      `What might you say to that person?`,
      `Some things that other users have said in their letters:`,
      `"You're going to start using to handle something you can't name yet. The thing you can't name is real. The using will work for a while. Then it won't."`,
      `"You're going to fall in love. You're going to fall out of it. The way you handle the falling out is going to set a pattern you'll spend years undoing."`,
      `"You think you have time. You do, but less than you think. Don't waste these years numbing them."`,
      `"There's a person you'll meet. Then a child. They'll need a version of you that you'll need to fight to stay close to. Don't drift."`,
      `"The thing you reach for to stop feeling is going to take more from you than you're capable of imagining right now. I'm not telling you not to start. I'm telling you to start with both eyes open."`,
      `These are not letters of advice in a self-help sense. They're letters of witness. You — the person you are now, who has lived all the years between then and now — are the only one who can write this letter. No one else has seen what you've seen. No therapist, no friend, no family member. Only you.`,
      `The letter you write today will be sealed. You won't see it again until Day 30. On that day, it will be unsealed and shown to you again. By then, you'll have spent 22 more days looking at yourself. The letter will land differently then than it does today.`,
      `Take your time. There's no length requirement. Some users write a paragraph. Some write pages. Both can be powerful.`,
      `Bring that earlier version of you into the room.`,
      `Then write.`,
    ],
    promptType: 'letter',
    promptQuestion: `Write your letter to who you were.`,
    promptSubtext: `This is a letter, not a journal entry. Write to the person you were before the substance took its place — the version of you from years ago who didn't yet know what you know now.

Tell them what you see from where you are. What they couldn't see then. What you wish someone had told them. What you would tell them now, if you could reach back.

Begin with: "Dear earlier me," — and let yourself write.`,
    postSaveMessage: `flourish. Then:] Sealed. We'll see it again on Day 30.`,
    closingLine: `Some letters are written to be read later. By a different version of you.`,
  },
  {
    day: 9,
    arrivalTitle: `A letter to the substance`,
    arrivalSubtitle: `Speak to it directly.`,
    founderAudio: null,
    readingParagraphs: [
      `Yesterday, you wrote to who you were. Today, you write to what came in.`,
      `This exercise will sound strange at first. Bear with me.`,
      `The substance you have been using — alcohol, cigarettes, weed, gambling, porn, whatever yours is — has been a presence in your life. A real one. It has been with you through specific years, specific phases, specific rooms. It has occupied a particular emotional position in your life, the way a person might. It has been there at moments when other things weren't.`,
      `In a real sense, you have been in a relationship with this thing.`,
      `Most people don't think about it this way. We use the language of "habits" and "addictions" because it sounds clinical and manageable. But if you actually examine your own relationship with this substance, you'll find it has many of the features of a relationship with a person: history, mood shifts, a tone that has changed over time, things you used to love about it, things that disappoint you now, promises it once kept and now breaks, an intimacy that has hardened into something more complicated.`,
      `Today you write a letter to this thing. Directly. By name.`,
      `Dear Whisky. Dear Cigarettes. Dear Weed. Dear Pornography. Dear Gambling.`,
      `The point of writing it this way is to externalize the relationship. To take it out of your head and put it on the page. When you address something directly, you can see it. You can name what it has been to you. You can be honest in a way that internal monologue rarely allows.`,
      `What might you say in this letter?`,
      `You might tell it when you first met. The room you were in. What you needed it for. What it gave you in those early years.`,
      `You might tell it how the relationship changed. When it stopped being fun. When it started being necessary. When you realized you couldn't imagine the next decade without it, and that scared you.`,
      `You might tell it the things you still love about it. The way it has been with you through things no person was. The reliability of it, in a world where many other things let you down.`,
      `You might tell it what it has cost you. The relationships strained because of it. The years lost. The version of you that didn't get to exist because you were busy keeping this relationship alive.`,
      `You might tell it what you suspect about its true nature now. That what it has been giving you for the last few years isn't what it was giving you in the beginning. That the deal has changed. That you are paying more for less.`,
      `You might tell it where you stand now. That you don't know what you're going to do. That you're at the start of a 30-day program in which you have promised yourself only to look. That this letter is part of that looking.`,
      `End the letter however feels true. Some users end with a goodbye, even though they're not ready to actually say goodbye. Some end with "I don't know yet." Some end with anger, some with grief, some with a strange affection.`,
      `There is no correct ending. There is only what's true today.`,
      `This letter will not be sealed. You can read it back later in the program. It is part of your record.`,
      `When you're ready, address it to its name.`,
      `Then write.`,
    ],
    promptType: 'letter',
    promptQuestion: `Write your letter to the substance.`,
    promptSubtext: `This is a letter to the substance itself — alcohol, weed, nicotine, whatever yours is. Treat it as a relationship, because in many ways, it has been one.

Tell it the truth. What it gave you. What it took. What you thought you were getting. What you actually got. What you want to say to it now, before the next thirty years pass with it as your closest companion.

Begin however you want. "Dear alcohol." "Dear weed." "Dear cigarettes." Let yourself write.`,
    postSaveMessage: `Saved. Now it's been said.`,
    closingLine: `Some things only become real when you say them out loud — even on paper.`,
  },
  {
    day: 10,
    arrivalTitle: `Phase 1: The Mirror`,
    arrivalSubtitle: `Phase 1: The Mirror`,
    founderAudio: {
      script: `Hi. It's Ninad again.

Ten days ago, you and I started this. You opened an app you weren't fully sure why you'd downloaded, and you sat through Day 1 anyway. You wrote something in your journal that nobody but you will ever see. Then you came back the next day. And the next.

That's nine days of showing up to look at your own life. Most people in your situation never make it past the first day. Some make it three. Almost nobody makes it ten.

I want to mark that.

Today is the end of what I called the Mirror. The first phase. The phase where we just looked. Where we surfaced what brought you here, when this thing became yours, what it gives you, what it costs you, the actual numbers, the stories you've been telling, what your body knows, the version of you before this took its place, and the relationship you've been in with this thing.

That's a lot. More than most people examine in years.

In a moment, I'm going to step out of the way and Vow will show you back what you've written. Your own words across these ten days. Take your time with it. Read what came out of you when you were being honest. Some of it might surprise you. Some of it might land differently now than it did when you wrote it.

Then there's one prompt — a single question — to close this phase.

After today, we move into harder work. Phase 2. The Weighing. The next ten days are about holding both sides of what you've seen — what you'd lose if you stopped, what it would cost to keep going, what your life looks like five years from now in either direction. You'll see two futures. You'll feel both of them.

It will be uncomfortable. That's the work.

But you've earned the right to do that work. By doing the looking. By showing up for ten days when you didn't have to.

I'll be back at the end of Phase 2, on Day 20. Until then, you and Vow keep going.

Now look at what you've made.`,
      audioSrc: `/audio/reflect/day_10_founder.mp3`,
    },
    readingParagraphs: [
      `Today closes Phase 1: The Mirror.`,
      `For the past ten days, we've been doing one thing: looking. What brought you here. The first time. What it gives you. What it costs you. The story you tell yourself. What your body knows. Letters to who you were and to the substance itself.`,
      `These were not days of action. They were days of seeing. The Mirror phase is, in some ways, the hardest because it does not let you fix anything. It only lets you look.`,
      `If you've been honest with the questions — even imperfectly, even with resistance — you know more about yourself today than you did ten days ago. That knowing is the substrate everything else is built on.`,
      `Phase 2 begins tomorrow. The Weighing. We move from looking to weighing. From seeing what is to weighing what could be.`,
      `Listen to the audio. Then sit with the closing reflection.`,
    ],
    promptType: 'text',
    promptQuestion: `What surfaced this phase?`,
    promptSubtext: `Looking back across these ten days — your own words, your own numbers, your own letters — what did you see about yourself that you couldn't see ten days ago? Not the headline. The specific thing. Write it down. This entry closes Phase 1.`,
    postSaveMessage: `Phase 1: The Mirror — complete.`,
    closingLine: `You looked. The Weighing begins tomorrow.`,
  },
  {
    day: 11,
    arrivalTitle: `The cost continued`,
    arrivalSubtitle: `Phase 2: The Weighing`,
    founderAudio: null,
    readingParagraphs: [
      `Six days ago, you saw your numbers.`,
      `Day 5 was the day you sat with the actual cost of your relationship with this substance. The money. The hours. The days under its influence. For most users, those numbers landed harder than they expected. Some users tell me they sat with that screen for ten minutes before they could move on.`,
      `Six days have passed since then.`,
      `Today, we go back to the calculator. We add those six days to the math. And we look at what changed — even in this short window.`,
      `This is not a punishment. The first ten days of this program were not about quitting. They were about looking. You weren't asked to stop. You weren't expected to stop. The deal was that you would examine your relationship with this thing, honestly, while continuing to live the life you've been living. Most users have continued using during these ten days, at roughly the rate they always have. That's expected. That's the design.`,
      `What we're doing today is different. Today, we look at the rate. Six days is not a long time. It's barely a week. But for someone who uses daily, six days is also: six uses (or twelve, or more). Six mornings of recovery. Many hours, in some cases. A specific amount of money. A measurable cost.`,
      `This is what addiction hides. Not the big costs — those would be unbearable to face all at once. The small ones. The fifteen hundred rupees a week that disappears into a haze you can't track. The two hours every evening that go missing. The sleep quality that has degraded so slowly you no longer remember what fully rested feels like.`,
      `Annie Grace, in her book on alcohol, calls this the invisibility of small daily costs. The substance survives because the cost of any single day's use is small enough to ignore. You'd never spend ₹15,000 on a single bottle of whisky. But you'll spend ₹500 every day for a year and not feel it as ₹1,82,500. The math is the same. The feeling is completely different.`,
      `Behavioral economists have a name for this. We humans are very good at registering large, sudden losses — the ₹50,000 you'd lose if you got robbed. We are terrible at registering small, recurring losses — the ₹500 a day that adds up to the same loss but doesn't trigger the same alarm. The substance has been exploiting this asymmetry for years.`,
      `Today's exercise is small but pointed. Open the calculator again. The fields are pre-filled from your Day 5 answers. Six more days have passed. See the new total.`,
      `Then sit with the rate. Six days. That's how much in six days. That's the speed. That's the velocity at which this thing has been consuming your life — and will continue consuming, every single week, every single month, every single year, until you decide otherwise or until something forces the decision for you.`,
      `This is not designed to make you feel ashamed. Shame doesn't drive change — usually it drives more using, to numb the shame. This is designed to make the rate visible. So that whatever you decide in the days ahead, you decide with the velocity in mind, not just the snapshot.`,
      `When you're ready, open the calculator below.`,
      `The numbers are real. They have always been real. We just don't usually look at them.`,
    ],
    promptType: 'text',
    promptQuestion: `Now you see the speed. What does that change?`,
    promptSubtext: `The total was one number. The rate is another. They feel different. What surfaced when you saw how fast it was happening? Don't write what you should feel. Write what actually came up.`,
    postSaveMessage: `Saved. Now we have both — the total and the rate.`,
    closingLine: `The math doesn't lie. But the math also doesn't decide. You do.`,
  },
  {
    day: 12,
    arrivalTitle: `What you'd lose if you stopped`,
    arrivalSubtitle: `The other side of the question.`,
    founderAudio: null,
    readingParagraphs: [
      `No one tells you this. So I will.`,
      `If you stopped using tomorrow, you would lose things that matter to you. Real things. Not imagined things. Not things you'd be better off without. Real, specific, important things that would create real, specific, important holes in your life.`,
      `Most recovery content pretends this isn't true. It promises you'll only gain — better sleep, better focus, better relationships, more money, more time. All of that is real, eventually, for most people who stop. But before any of those gains arrive, there is a stretch of time where you are missing things you used to have. And those missing things are real losses.`,
      `If we don't honor them, we can't honestly weigh anything.`,
      `So today, we name them.`,
      `The first thing you might lose is a friend group, or a piece of one. Many of your friendships were built around shared using. The Friday evenings, the weekend trips, the late-night sessions, the people you only see in those contexts. If you stop, some of those friendships will weaken. Some will end. Not because the people were fake — many of them are real friends — but because the activity that bonded you isn't there anymore. You'll be the one who can't come anymore. Or who comes but doesn't drink. Or who leaves earlier. The dynamic changes. Some friendships survive that change. Some don't.`,
      `The second thing you might lose is an evening ritual that has been keeping you sane. The first drink poured at 6pm. The cigarette on the balcony after dinner. The joint after the kids sleep. These are not just substance use — they are transitions. They mark the end of work and the beginning of evening. They give shape to your day. If you stop, you lose the ritual along with the substance. You'll need to find something else to do at 6pm, or after dinner, or when the kids sleep. That's harder than it sounds.`,
      `The third thing you might lose is a way of handling difficult emotions that has worked for years. The substance has been doing real work. The anxiety it dulls. The grief it postpones. The boredom it interrupts. If you stop, those emotions don't disappear. They become unmanaged, at least temporarily. You'll feel things more sharply. That's the cost.`,
      `The fourth thing you might lose is a piece of your identity. You may not think of yourself as "a drinker" or "a smoker" or "a stoner," but parts of how you see yourself, and how others see you, are wrapped up in the using. The fun one at parties. The connoisseur of whisky. The guy with the good weed connection. The card-table regular. If you stop, those identities go. You become someone else. That can feel like loss, even when the new identity is better.`,
      `The fifth thing you might lose is the version of pleasure or relief or escape that you have come to know. Whatever the substance gives you, it gives you reliably. You know exactly what to expect. Stopping means giving up the reliability. New sources of pleasure or relief might come, but they won't come on Day 1. There will be a stretch of flatness where the substance is gone and the alternatives haven't arrived yet.`,
      `These are real losses. Naming them does not mean you shouldn't stop. It means that if you stop, you do so with both eyes open. You know what you're walking away from, not just what you're walking toward.`,
      `Today's reflection asks you to write down what you, specifically, would lose. Not the abstract list. Your list. The friend you'd see less. The 7pm ritual. The version of yourself you've been for a decade.`,
      `Be honest. We need this list.`,
    ],
    promptType: 'text',
    promptQuestion: `What would you lose if you stopped?`,
    promptSubtext: `The friend group. The ritual. The way of coping. The identity. The pleasure. Be specific. Not "I'd miss my friends" — but "I'd miss Saturday nights with Rohan and the others on his terrace. The way the conversations get good around midnight." Don't list everything. List what's actually true for you. This list is private. We need it honest, because we'll come back to it.`,
    postSaveMessage: `Saved. Now we have both lists — costs of using, costs of stopping.`,
    closingLine: `This is what honest weighing looks like. Both sides on the page. No lying.`,
  },
  {
    day: 13,
    arrivalTitle: `Five years still using`,
    arrivalSubtitle: `A specific Tuesday morning, five years from today.`,
    founderAudio: null,
    readingParagraphs: [
      `Today, we go forward five years.`,
      `I want you to imagine a specific Tuesday morning, five years from today. Not next year. Not three years. Five.`,
      `Same season as today. Roughly the same time. Around 7am.`,
      `You are in your bed. You have not stopped using during these five years. You have continued, at roughly the rate you use now. Maybe a little more. Maybe a little less. But the relationship with this substance has stayed roughly the same shape.`,
      `Take a breath.`,
      `Now look at yourself.`,
      `Your body is older. Five years older. The mirror tells you this every morning, and you've gotten used to it. Your weight is different from today's — for most users at five years on, it has crept up. Your face is heavier. Your eyes are tireder. The skin has lost some of the brightness it has now. Whatever wear the substance does to your body — and every substance does some — has accumulated. You see it when you look in the mirror. You see it when old friends comment that you look tired, or when they don't comment because they've stopped noticing.`,
      `You sit up. Your back hurts. Maybe your knees. Maybe something else. Five years of compromised sleep, compromised exercise, compromised nutrition, compromised attention to the body have done what they do.`,
      `You walk to the bathroom.`,
      `You pee. You brush your teeth. You look in the mirror.`,
      `What do you see?`,
      `This is not five-years-from-now-where-you-imagine-yourself-fitter- and-better. This is five-years-from-now-where-you-have-been-using- the-whole-time. Look honestly. The face that looks back at you has been carrying the substance for five more years than the face that looks at you now.`,
      `Walk into the kitchen.`,
      `Whoever lives with you now still lives with you, probably. Maybe you've separated. Maybe you've stayed together but the marriage has hardened into something silent. Maybe one of you has stopped trying to repair the things the substance has cost you both. Maybe the trying has continued and exhausted both of you. You know which of these is most likely. Sit with it.`,
      `If you have children, picture them. They are five years older. The seven-year-old is twelve. The fifteen-year-old is twenty. They have grown up with you in this state. They have a memory of you that includes the using. They have stories they tell each other about you that include things you wish they didn't know. They have learned to navigate around you. They love you, but not the way they would have loved a different father.`,
      `Open your phone.`,
      `Look at your bank balance. Five years of the rate you saw on Day 11. Whatever you've spent on this substance has continued to be spent. Compounded. The car you didn't buy. The trip you didn't take. The home upgrade. The investment. Add up what was lost.`,
      `Look at your work. Has the career advanced the way it would have if your evenings, nights, and weekends had been clear? Has the project you said you'd start been started? Has the side business launched? Have the ideas you had at 35 made it into the world by 40? Or have they stayed in your head, ignored, while the substance occupied the time and bandwidth that would have built them?`,
      `Walk to your living room.`,
      `Sit on the couch.`,
      `It's Tuesday. 7:30am now. Today is exactly like every other Tuesday for the last five years. You will go to work or you won't. You will use today, at the time you usually use, in the way you usually use. You will come home. You will use again, or you will go to sleep, or you will fight with your spouse, or you will be alone. Tomorrow will be Wednesday. Wednesday will be exactly like every other Wednesday for the last five years.`,
      `The five years has not been a tragedy. There have been good moments. Birthdays. Vacations. Promotions, maybe. Loved ones. But the shape of the five years has been the same shape as the current one — using as the central organizing fact, with everything else arranged around it.`,
      `This is the future where nothing changed.`,
      `Sit in it. Don't argue with it. Don't tell yourself it's exaggerated. Many users tell me, at this point in the program, that the future I described is actually the moderate version — that their realistic five-year projection is worse.`,
      `Whatever you saw, write it down.`,
      `Don't write the whole story. Write the moment that hit you. The mirror, the children, the bank balance, the kitchen, the partner, the silence, the body. The thing you saw most clearly.`,
      `We'll do the other future tomorrow.`,
      `For today, just sit with this one.`,
    ],
    promptType: 'text',
    promptQuestion: `What did you see?`,
    promptSubtext: `The image that hit you hardest. The mirror, the body, the kids, the bank balance, the partner, the silence, the work. Which one came through clearest? Write it down. Specifically. The detail that stayed with you.`,
    postSaveMessage: `Saved. We sit with this future overnight. Tomorrow we look at the other one.`,
    closingLine: `This is one of two futures. Tomorrow you'll see the other. Then you'll hold both.`,
  },
  {
    day: 14,
    arrivalTitle: `Five years stopped`,
    arrivalSubtitle: `The same Tuesday. The other future.`,
    founderAudio: null,
    readingParagraphs: [
      `Yesterday you saw one future. Today you see the other.`,
      `Same Tuesday morning. Five years from today. Same season. Roughly the same time. Around 7am.`,
      `You are in your bed.`,
      `But this time, you stopped.`,
      `It happened sometime in the last five years. Maybe right after you finished this 30-day program. Maybe a year later, after you returned to Vow and worked through Commit. Maybe two years in, after a slip that became a turning point. The exact moment doesn't matter for today's exercise. What matters is that, in this version of the future, you stopped using. And you stayed stopped.`,
      `It wasn't easy. Some weeks were brutal. Some moments you thought you couldn't do it. There were stretches of boredom, of flatness, of missing the substance with a sharpness that surprised you. There was a slip somewhere in there, probably. But you came back. You kept walking. The stopping became real.`,
      `Take a breath.`,
      `Now look at yourself.`,
      `Your body is older. Five years older. The mirror still tells you this. But the wear is different from yesterday's mirror. The eyes are clearer. The skin holds more light. The weight is closer to what your body actually wants to be. You sleep through the night now, mostly. Your back doesn't hurt the same way. When old friends comment on you, they comment on something different than they would have. You can feel the difference.`,
      `You sit up. The body doesn't complain the way it used to.`,
      `You walk to the bathroom.`,
      `You pee. You brush your teeth. You look in the mirror.`,
      `The face that looks back at you is yours. Aged five years, yes. But yours, fully — not yours-with-the-substance-living-inside. The substance is no longer occupying your face. You see it in the eyes especially. Something has come back into them.`,
      `Walk into the kitchen.`,
      `Whoever lives with you now still lives with you. The marriage is different. Not perfect — five years of repair work doesn't make anything perfect, and the years of using left damage that took time to address. But the silence has thawed. The fights are about real things now, not about the substance. There are mornings like this one where things feel ordinary and good. Five years ago, you couldn't imagine ordinary and good. Now it happens often enough that you've stopped tracking it.`,
      `If you have children, picture them. They are five years older. The seven-year-old is twelve. The fifteen-year-old is twenty. They have grown up with you in a different state for the last five years than they did before. They have a memory of you that includes both — the using version and the stopped version — and they have noticed the difference. They love you. They also trust you in a way they didn't quite trust you before. Trust is harder to earn than love, and you earned it back.`,
      `Open your phone.`,
      `Look at your bank balance. The money that used to disappear has been doing other things. Some of it is just savings. Some of it bought experiences your family will remember for the rest of their lives. Some of it went toward the home. Some of it went toward something you'd never have allowed yourself to want — a course, a tool, a beginning of something. The balance is a fact, not a fantasy. Five years of redirected money compounds.`,
      `Look at your work. The project you said you'd start has been started. Maybe finished. Maybe abandoned for a different one that turned out to matter more. The clarity that came back to you when the substance left has been put to use. The ideas you had at 35 are five years more developed now — some shipped, some still in progress. The career has moved in directions that wouldn't have been possible if your evenings and weekends had stayed clouded.`,
      `Walk to your living room.`,
      `Sit on the couch.`,
      `It's Tuesday. 7:30am now. Today is shaped differently from every Tuesday in the previous version of the future. You will go to work, or you will work from home, or you will be on a sabbatical, or you will be retired early — whatever the specific shape, your day has more space in it. There's no waiting for 6pm. No countdown to the using window. The day is just the day.`,
      `This version of the future is not paradise. You still have problems. You still have hard days. You will still have moments of grief, of stress, of boredom, of restlessness. The substance was doing real work, and now you handle those moments other ways. Some of those ways are better. Some are still being figured out.`,
      `But the shape of the five years has been different. The substance is no longer the central organizing fact. Other things are.`,
      `This is the future where you stopped.`,
      `Sit in it. Don't argue with it. Don't dismiss it as fantasy. Many users have lived this version. It's not exceptional. It's the predictable result of stopping and staying stopped.`,
      `Whatever you saw, write it down.`,
      `Don't write the whole story. Write the moment that hit you. The mirror, the kids, the bank balance, the kitchen, the partner, the work. The thing you saw most clearly.`,
      `You now hold both futures. They live next to each other in your mind.`,
      `That's the work.`,
    ],
    promptType: 'text',
    promptQuestion: `What did you see this time?`,
    promptSubtext: `The image that hit you hardest. The mirror, the body, the kids, the bank balance, the partner, the work. Which one came through clearest? Now hold this image alongside what you wrote yesterday. Both are possible. Both are five years out. Both depend on what you decide between now and then.`,
    postSaveMessage: `Saved. Both futures are now on the page. You hold them.`,
    closingLine: `This is the weight of weighing. Both futures, held together, in your hands.`,
  },
  {
    day: 15,
    arrivalTitle: `Halfway`,
    arrivalSubtitle: `The midpoint of the path.`,
    founderAudio: null,
    readingParagraphs: [
      `You're halfway.`,
      `Fifteen days ago, you opened Vow not knowing what these 30 days would be. You've now been through:`,
      `The questions about why you're here. The first time. What it gives you. What it costs you. The numbers. The stories. What your body knows. The letter to who you were. The letter to the substance. The Phase 1 retrospective. The cost continued. What you'd lose. The two futures.`,
      `That's a lot of looking. More honest looking than most people do in years.`,
      `Today is the midpoint. We don't introduce a new theme. We pause and measure.`,
      `There's a clinical instrument used in this kind of work called the Readiness Ruler. It was developed in the 1980s by William Miller, the psychologist who originated Motivational Interviewing — the methodology much of this program draws from. The Ruler is one of the most validated instruments in change psychology. It's also one of the simplest.`,
      `It asks a single question:`,
      `On a scale from 1 to 10, how ready do you feel to make a change?`,
      `That's it. One number.`,
      `The reason it works is not the number itself. The number on any single day is just a number. The reason it works is that, measured over time, the Ruler reveals the shape of your readiness. Some users see it climb steadily across a program. Some see it plateau. Some see it oscillate — high on hard days, low on quiet days. Some see it drop, which is also useful information.`,
      `There is no correct answer. A 3 is not failure. A 9 is not success. The Ruler is a measurement tool, not a judgment.`,
      `Today you give your first reading. Then on Day 27, twelve days from now, you give a second reading. At Day 30, you'll see the full trajectory plotted. Whatever the line shows is true.`,
      `For now, just answer honestly.`,
      `Don't anchor to a number you think you should pick. Don't perform readiness for Vow's benefit, and don't perform un-readiness either. The point is to capture where you actually are today, after fifteen days of looking. The number might be lower than you'd hoped. It might be higher. Either is information.`,
      `Sit for a moment with the question.`,
      `If I had to make a change today — really make it, not say I'd make it — how ready would I actually be?`,
      `Then move the slider to the number that feels true.`,
    ],
    promptType: 'text',
    promptQuestion: `How ready do you feel to make a change? Scale labels: 1 = Not ready at all 10 = Completely ready, today`,
    promptSubtext: `Not a defense of it. Just a few honest sentences about what's behind the rating. What would have to happen for it to be one number higher? What's holding it from being one number lower?`,
    postSaveMessage: `Saved. We'll come back to this on Day 27.`,
    closingLine: `Halfway through. The harder half is behind you. Phase 3 begins on Day 21.`,
  },
  {
    day: 16,
    arrivalTitle: `Stories from others`,
    arrivalSubtitle: `You are not the first to sit with this.`,
    founderAudio: null,
    readingParagraphs: [
      `You are not the first to sit with this.`,
      `Today is different from the other days. There's no exercise. No prompt designed to surface something inside you. Today you read.`,
      `Four stories. From people who were where you are. Each of them sat through their own version of Reflect — not in this app, since this app is new, but in their own way. They stopped, eventually. Or they didn't. Their stories are theirs, not lessons.`,
      `What I want is for you to recognize yourself somewhere in them. Not in all of them. Maybe just in one specific sentence. Maybe in a single image. The recognition itself is the work today.`,
      `These stories are anonymized but real. Names and identifying details have been changed.`,
      `---------------------------------------------------------------------- STORY 1 — VIVEK, 29, PUNE. CANNABIS, EIGHT YEARS. ----------------------------------------------------------------------`,
      `"I started smoking weed in my second year of college. By 2018 I was high every day. Through my last year of college, my first job, my move to Pune, my second job — every day, mostly at night, sometimes in the morning before work.`,
      `I was the high-functioning type. Never missed deadlines, never let it show. The using was private, in my flat, alone. I told myself I had it under control because nobody around me knew the extent of it.`,
      `The thing it cost me wasn't work. It was relationships. Two girlfriends in five years, both of whom told me, in different words, that they couldn't reach me. I was always there but never fully there. Both of them said some version of it: 'You're like a wall.' I'd argue with them, then go home and use, then promise myself I'd address it.`,
      `The second one ending was what finally broke through. She wasn't angry. She was just tired. The way she said goodbye made me realize that I'd been doing this to people for years and they'd been telling me and I hadn't been hearing it.`,
      `The first time I actually stopped, I was twenty-seven. I lasted four months and slipped at a friend's wedding. The second time was at twenty-eight. I lasted seven months. The third time was a year ago, and I'm still going. I'm seeing someone now. She knows the history. I'm not perfect. But I'm there when I'm with her. That's something I couldn't have said for most of my twenties."`,
      `---------------------------------------------------------------------- STORY 2 — AISHA, 36, MUMBAI. ALCOHOL, SIXTEEN YEARS. ----------------------------------------------------------------------`,
      `"I started drinking at twenty in college, with my hostel friends. We'd drink before going out, drink while we were out, drink coming back. I genuinely loved it. The conversations were better, the nights were longer, my college years felt like the version of college you see in movies.`,
      `The hostel friends scattered after college. I assumed the drinking would scatter with them. It didn't. The work crowd at my first job drank, so I drank with them. The cousins at family weddings drank, so I drank with them. Old college friends came to town, and we drank together for three nights straight to make up for lost time. There was always an occasion.`,
      `By thirty, I wasn't drinking alone yet, but I was drinking at every social event without thinking about it. By thirty-three, I was drinking alone sometimes too. By thirty-five, I was drinking most nights, even when I told myself I wouldn't.`,
      `My husband told me, after our seventh year of marriage, that he didn't recognize the woman he'd married. I was offended. I drank that night to deal with the offense. That's when I knew, but it took me eighteen more months to do anything with the knowing.`,
      `The thing that made me stop wasn't a single moment. It was the slow accumulation of times I said I'd cut down and didn't. The lying to myself wore me out. I haven't had a drink in eighteen months. The marriage is healing. Office parties are still hard. I'm still figuring out who I am at weddings without a glass in my hand."`,
      `---------------------------------------------------------------------- STORY 3 — RAJESH, 51, BANGALORE. TOBACCO, THIRTY YEARS. ----------------------------------------------------------------------`,
      `"I started chewing gutkha at twenty when I was a contractor on a construction site. Everybody chewed. By the time I was thirty I was on three packets a day. I didn't think about quitting because I didn't know anybody who had.`,
      `Then my brother got oral cancer. He was forty-six. He survived but lost half his jaw. After his surgery, I still chewed. I told myself my brother was unlucky. The first time I really tried to quit was after my own scan came back with white patches.`,
      `I am not a man of feelings. I'm a man of facts. The fact was: I had thirty years of using and a body that was telling me to stop. I stopped on a Tuesday. I bought a packet of fennel seeds and saunf, the way they tell you to in the hospital pamphlets. I chewed those for three months. I don't say it was hard. I say it was decided.`,
      `I haven't had gutkha in five years. The mouth healed. My wife says I look ten years younger. I tell her I'm just less afraid."`,
      `---------------------------------------------------------------------- STORY 4 — KARAN, 33, GURGAON. POKER, SIX YEARS. ----------------------------------------------------------------------`,
      `"It started as friendly home games with my MBA batchmates after we all moved to Delhi-NCR for jobs. Five-hundred-rupee buy-ins, beer, biryani, late nights. I was good at it, or I thought I was. I won more than I lost in that crowd.`,
      `Then someone introduced me to online poker. The home games stopped being enough. The online stakes were higher and the games never ended — there was always a table running at three in the morning. I told myself I was investing in a skill. I had spreadsheets. I tracked my hands. I read books on poker theory.`,
      `By year three, I had lost ₹14 lakh. By year five, the number was ₹32 lakh. I had taken personal loans to cover poker losses and told my wife they were for a business idea. Each time I lost a big session I'd play more to get even. Each time I won, I'd tell myself I was finally on the upswing and I'd play more to capitalize. Either way, I played more.`,
      `The thing that broke through was my wife finding the loan documents. Not the playing — she'd known about the playing. The lying. I had told her actual specific lies, repeatedly, about what the money was for. The look on her face when she put the documents in front of me is the only thing I think about when I want to log into a poker site.`,
      `I haven't played in fourteen months. The debt is two years from being cleared. The marriage is in counseling. I don't know if I'm cured. I know I'm not lying anymore."`,
      `---------------------------------------------------------------------- CLOSING FRAME ----------------------------------------------------------------------`,
      `Sit with these for a moment.`,
      `Different substances. Different ages. Different cultures, different cities, different reasons. Different paths to stopping. One of them stopped because his girlfriend left. One because of accumulated lies to herself. One because of a scan. One because of a look on his wife's face.`,
      `You will have your own version of this story, eventually. Whether it ends with you stopping or not, it will be yours.`,
      `For today, just notice. Which of these stories did you recognize yourself in? Which sentence stayed with you?`,
    ],
    promptType: 'text',
    promptQuestion: `Where did you see yourself?`,
    promptSubtext: `A single sentence from one of the four stories. The one that stayed. Write it down. Then write what about it landed for you.`,
    postSaveMessage: `Saved. You are not alone in this. Many have been where you are.`,
    closingLine: `Four stories. Four paths. Yours is being written right now.`,
  },
  {
    day: 17,
    arrivalTitle: `The two voices`,
    arrivalSubtitle: `Both of them, on the page.`,
    founderAudio: null,
    readingParagraphs: [
      `There are two voices in your head, and you've been hearing both of them for years.`,
      `One voice tells you to use. It has been there since the relationship with this substance became a real thing in your life. It has its own logic, its own arguments, its own moments of softness and its own moments of insistence. It speaks at certain times — when you're tired, when you're stressed, when you're bored, when you're celebrating, when you're alone, when you're with certain people, when the day reaches a certain hour. It uses specific phrases, often the same ones, week after week, year after year. "Just one. Just tonight. You've earned it. You can stop tomorrow. It's been a hard week. Everyone else is. You don't have a problem."`,
      `The other voice tells you to stop, or at least to look at this honestly. It has been there too — quieter, often interrupted, sometimes barely audible, but present. It's the voice that woke you up at 4am with a thought you didn't want to have. The voice that made you download Vow. The voice that asked the question on Day 1 and is still here, sixteen days later, still asking.`,
      `Most users live their entire relationship with the substance hearing both voices, but never separating them. The voices blend into a single internal noise. You move through the day with this noise running, and you don't know which voice is which. The using voice is so familiar that it sounds like you. The other voice is quieter and sounds like someone judging you. Most people, given that choice, side with the voice that sounds like them. They use.`,
      `Today we externalize them.`,
      `You're going to see two columns on the next screen. The left column is for the using voice. Everything it tells you. The exact phrases. The specific arguments. The way it sounds when it's being persuasive, when it's being soft, when it's being insistent.`,
      `The right column is for the other voice. Everything it has been trying to tell you. The phrases it uses. The arguments it makes. The moments it speaks loudest.`,
      `Both columns will be partly pre-filled. Phrases from the things you've written across these sixteen days. The benefits you wrote on Day 3 will be in the left column. The costs you wrote on Day 4 will be in the right column. Use these as starting points, then add what's actually in your head — what these specific voices actually say, in your actual words.`,
      `The point of this exercise is not to win. The point is to make both voices visible at the same time. Once they're side by side, on a screen, you can see them as two separate things instead of one blurred internal noise. They stop being you, and become two voices you happen to be able to hear.`,
      `This is the work of Day 17. Externalize them. Let both speak fully. Don't try to silence the using voice — that's the wrong move and it doesn't work. Let it say everything it has to say. Then let the other voice say everything it has to say.`,
      `When both are on the screen, sit with them. See which one you've been believing more.`,
      `The exercise is below.`,
    ],
    promptType: 'text',
    promptQuestion: `Which voice have you been believing?`,
    promptSubtext: `Look at both columns honestly. The using voice and the other voice. Which one have you been giving more weight to, this past year? This past month? Today? There's no correct answer. Just the truth.`,
    postSaveMessage: `Saved. You can come back to both columns anytime.`,
    closingLine: `Two voices, on the page. Now you can hear them as separate. That changes things.`,
  },
  {
    day: 18,
    arrivalTitle: `What scares you about quitting?`,
    arrivalSubtitle: `The honest list of fears.`,
    founderAudio: null,
    readingParagraphs: [
      `Fear is the part of this no one wants to talk about.`,
      `Most recovery content treats fear of quitting as something to overcome. As though the fear is a bug — a glitch in your motivation that needs to be fixed before you can succeed. "Don't be afraid. You can do this. Trust the process."`,
      `This is wrong. Your fear of quitting is not a glitch. It is honest information.`,
      `You are afraid because stopping would actually take things from you. Real things. We named some of them on Day 12 — the friend group, the ritual, the way of coping, the identity, the version of pleasure. Today we go deeper. Past the things you'd lose, into the fears underneath. Because fear and loss are different. Loss is the thing that's gone. Fear is what you imagine happening to you in the absence of that thing.`,
      `Most users have several fears. They have never named them out loud, even to themselves. The fears live as background pressure — a vague heaviness whenever the idea of stopping comes up. Today we make them specific.`,
      `The most common fears, in roughly the order they tend to surface:`,
      `The fear of boredom. That without the substance, your life will be flat. The evenings will be long. Time will become heavy. You will be left with nothing to look forward to. This fear is real because for many users, the substance has been the thing that made certain parts of life bearable — long evenings alone, social events that would otherwise be tedious, Sunday afternoons. If the substance goes, what fills the space? Most people don't know. The not-knowing is the fear.`,
      `The fear of the social vacuum. That stopping will cost you your friendships. The friends who use with you might fade. The events where you used to be at the center will feel different. You will have to navigate parties, weddings, work events, family functions sober — and you don't know who you are in those contexts anymore. The social fear is one of the most paralyzing because it implicates your whole life, not just the substance.`,
      `The fear of feeling everything. The substance has been doing emotional regulation work. Anxiety, grief, anger, restlessness, loneliness — the substance has been blunting all of these for years. If it goes, those feelings come back. You don't know how strong they will be. You don't know how to handle them without the substance. This fear is often unspoken because admitting it requires admitting the substance was doing emotional work, which most users have not fully acknowledged.`,
      `The fear of identity loss. Some part of who you are has become entangled with the using. The fun one. The connoisseur. The risk-taker. The card-table regular. The one with the good connections. If the substance goes, that identity goes. You don't know who you are without it. You're afraid the new version will be smaller, less interesting, less you.`,
      `The fear of failure. Underneath all of these: the fear that you will try, and you will fail, and you will end up worse off than if you hadn't tried. This is the fear that keeps many users from even trying. They imagine the embarrassment of going public with a quit attempt and slipping. They imagine telling people they've stopped and then having to walk it back. They'd rather not commit than commit and be seen failing.`,
      `These are honest fears. Naming them does not make them go away, but it makes them visible — and visible fears are easier to navigate than invisible ones.`,
      `Today's reflection asks you to write your own list. Not the abstract list. Your specific fears, in your own words.`,
      `Take a breath. Then write.`,
    ],
    promptType: 'text',
    promptQuestion: `What scares you about quitting?`,
    promptSubtext: `The boredom. The social vacuum. The feelings you'd have to feel. The identity loss. The failure. Something else. Write your specific fears in your own words. Be honest. This is private. Naming them is the only way to navigate them.`,
    postSaveMessage: `Saved. The fears are now on the page, not just in your head.`,
    closingLine: `Tomorrow, the other side. What scares you about not quitting?`,
  },
  {
    day: 19,
    arrivalTitle: `What scares you about not quitting?`,
    arrivalSubtitle: `The other side of the same fear.`,
    founderAudio: null,
    readingParagraphs: [
      `Yesterday we named what scares you about stopping. Today the other side.`,
      `The fear of quitting is loud. It speaks first. It uses present- tense language — "I will lose my friends, I will be bored, I will not know who I am." It's vivid because the things you'd lose are right here, in your current life, easy to picture.`,
      `The fear of not quitting is quieter. It speaks in future-tense, often in conditional. "What if my health gets worse. What if my wife actually leaves. What if I look back at fifty and the years are gone." The things you'd lose by continuing are more abstract — they live somewhere ahead of you, fuzzy, easy to dismiss. The using voice is very good at dismissing them. "I'll deal with that later. That's not happening to me. I have time."`,
      `But the fears of not quitting are also real. And they are usually larger, in the long run, than the fears of quitting. They just feel smaller because they're further away.`,
      `Today we make them specific.`,
      `The most common fears of not quitting, in rough order:`,
      `The fear that your body breaks. That something the substance has been quietly damaging gives way. The liver. The lungs. The mouth. The brain. The gut. The heart. You know which organ you've been ignoring the symptoms of. Most users do, even if they haven't admitted it. The fear is not death exactly — it's the slow, undignified breakdown. The hospital visits. The diagnosis you'll have to explain to your family. The treatment that costs more than the substance ever did.`,
      `The fear that the marriage ends. That the slow erosion of the last few years finally tips into something the marriage can't recover from. The conversation that becomes a real fight. The day your spouse stops trying. The look on their face that you've been seeing in flashes and now becomes permanent. Most users with partners have noticed this fear at the edge of their awareness for a while. They've been outpacing it. The fear is that they won't always be able to.`,
      `The fear that your kids lose you. Not literally. They have you. But the version of you they will remember is the version that is sometimes present and sometimes elsewhere. They will tell stories about you, eventually, that include the substance even if they don't name it. They will navigate around you. The fear is that you become a shape in their childhoods that they had to learn to handle, instead of a presence they could rely on.`,
      `The fear that you become someone you don't recognize. The most existential fear. That ten years from now, twenty years, you look in the mirror and you no longer find the person you were before this took root. The version of you that had ambitions, that was fully there, that hadn't traded away pieces of themselves in slow exchange for the substance. That person is reachable now. In ten years they may not be. The fear is the disappearance.`,
      `The fear that you ran out of time. Underneath all of these: the fear that the day you finally decide to stop arrives too late. The cancer is already there. The marriage already over. The kids already grown. The career already shaped. The body already too far gone. You decide, but the deciding doesn't undo what the years did.`,
      `These fears are not designed to scare you into stopping. They are designed to be visible. Most users have been carrying them silently. Naming them in writing makes them part of the weighing — not louder than the fears of quitting, just visible alongside them.`,
      `Today's reflection: write your own list. Specific fears, in your own words.`,
    ],
    promptType: 'text',
    promptQuestion: `What scares you about staying exactly where you are?`,
    promptSubtext: `The body breaking. The marriage. The kids. Becoming someone you don't recognize. Running out of time. Something else. Write your specific fears in your own words. The ones that have been at the edge of your awareness.`,
    postSaveMessage: `Saved. Both fear lists are now on the page.`,
    closingLine: `Tomorrow we hold both futures and both fears together. Phase 2 closes.`,
  },
  {
    day: 20,
    arrivalTitle: `Phase 2: The Weighing`,
    arrivalSubtitle: `Phase 2: The Weighing`,
    founderAudio: {
      script: `Hi. It's Ninad again.

Twenty days ago you started this. Most people don't make it past the first week. You're at the end of Phase 2.

The Mirror — Phase 1 — was about looking. Honestly, with both eyes. You named what brought you here, when this thing became yours, what it gives you, what it costs you, the actual numbers, the stories you've been telling, what your body knows, the version of you before this took its place, the relationship you've been in.

The Weighing — Phase 2, which closes today — was different. Harder, in some ways. It asked you to hold both sides at once. The cost continued. What you'd lose if you stopped. Two futures, five years from today, both vivid. The two voices in your head, externalized on a screen. The fears of quitting. The fears of not quitting.

That's a lot. More than most people in your situation ever sit with.

In a moment, Vow is going to show you back what you wrote during this phase. Not all of it. Just four pieces — the two futures and the two fear lists. Read them carefully. Hold them in the same field of awareness. They're all true. They're all yours.

Then there's one final reflection to close Phase 2.

After today, we move into Phase 3. The Question. The next ten days will not give you an answer. They will move you toward the moment of choosing — without forcing it. You will define what readiness means to you. You will measure it again. You will write a letter to your future self that will be delivered later. You will hold the question of what you actually want.

By Day 30, you'll have three doors. You'll know which one is yours.

For now, just close this phase. Read what you wrote. Then write one more thing.

I'll be back on Day 30.`,
      audioSrc: `/audio/reflect/day_20_founder.mp3`,
    },
    readingParagraphs: [
      `Today closes Phase 2: The Weighing.`,
      `For the past ten days, you've weighed. The cost continued. What you'd lose if you stopped. Five years still using. Five years stopped. Stories from others. The two voices. What scares you about quitting, and what scares you about not quitting.`,
      `The Weighing is harder than the Mirror in a different way. The Mirror asks you to look. The Weighing asks you to feel both sides honestly — not to pick a side, just to feel both.`,
      `Most people avoid this work because feeling both sides at once is uncomfortable. It would be easier to commit to one side and shut down the other. But ambivalence handled this way produces the most stable change — because you've already metabolized the loss before you decide.`,
      `Phase 3 begins tomorrow. The Question. Ten more days, and then the choice. Listen to the audio. Then sit with the closing reflection.`,
    ],
    promptType: 'text',
    promptQuestion: `Which life is yours, if you don't decide?`,
    promptSubtext: `Look at all four pieces above. The future where you kept going. The future where you stopped. The fears of quitting. The fears of staying. If you make no decision — if you simply continue exactly as you are — which future arrives by default? Write what you see honestly.`,
    postSaveMessage: `Phase 2: The Weighing — complete.`,
    closingLine: `You weighed. The Question begins tomorrow.`,
  },
  {
    day: 21,
    arrivalTitle: `What does "ready" mean?`,
    arrivalSubtitle: `Phase 3: The Question`,
    founderAudio: null,
    readingParagraphs: [
      `Most people have never asked themselves what readiness would actually look like.`,
      `There's a cultural script for it — the rock bottom narrative. "You'll be ready when you hit bottom." The image is dramatic: the public collapse, the scary moment, the accident, the partner threatening to leave, the doctor's warning. The implication is that you have to be ruined before you're ready.`,
      `This script is misleading. It's a description of one path — the path some people end up on because they didn't address things earlier. It's a story about people who waited too long. It is not a guide for anyone else.`,
      `Most people who eventually stop don't hit rock bottom. They make a quiet decision somewhere in the middle of an ordinary week. They don't tell anyone. They just stop. Or they start stopping. The decision often happens after a long stretch of looking — exactly the kind of stretch you've been in.`,
      `So if not rock bottom, what does "ready" actually look like for you?`,
      `It's a question most people have never been asked. The first answers tend to be deflections — "I'll be ready when I have more time. When the wedding is over. When work calms down. When my wife stops pressuring me." These are not answers to the question. They are conditions under which the using voice would tolerate quitting, knowing those conditions never quite arrive.`,
      `The real question is harder. What internal state would have to be true for you to actually decide to stop?`,
      `Some honest definitions, from people who eventually arrived at theirs:`,
      `"I'd be ready when I stopped feeling angry at the idea of someone telling me to quit."`,
      `"I'd be ready when I trusted that I could handle my anxiety without it."`,
      `"I'd be ready when I cared more about the version of myself I'm becoming than about the version of myself I am."`,
      `"I'd be ready when I stopped negotiating with myself in the morning."`,
      `"I'd be ready when I admitted to my wife that I want to stop, which would be a different kind of admission than the ones we've had."`,
      `These are not scripts. They are personal definitions. Each one names a specific internal shift that would have to occur for the person to genuinely decide. They are not tied to external events. They are tied to internal recognitions.`,
      `Today's reflection asks you to do this work for yourself. What would have to be true, inside you, for you to be ready? Not what others would say. Not what the cultural script says. What you would say, if you had to define it on your own terms.`,
      `You may not be there yet. The point is not to claim readiness. It is to define it — so that when it does arrive, you'll recognize it. Most people who stop describe it as recognition, not as a decision: "I just knew." What they knew was that the internal conditions had become true. They had spent years vaguely waiting to be ready without knowing what ready meant. When it arrived, they recognized it because they'd defined it.`,
      `You are defining it today. In writing. In your own words.`,
      `This is the bridge from weighing to choosing. The choice itself is for later. The shape of the choice is what we're working on now.`,
      `Take a breath. Then write.`,
    ],
    promptType: 'text',
    promptQuestion: `What would "ready" look like for you?`,
    promptSubtext: `Not what others would say. Not the rock-bottom story. Not the conditions about external timing. What internal state would have to be true for you to actually decide? Be specific. The recognition you'd feel. The shift inside.`,
    postSaveMessage: `Saved. You now have a definition of ready. We'll come back to it.`,
    closingLine: `The recognition only comes if you've defined what you're recognizing.`,
  },
  {
    day: 22,
    arrivalTitle: `A body scan for "not yet"`,
    arrivalSubtitle: `Where the resistance lives.`,
    founderAudio: null,
    readingParagraphs: [
      `On Day 7, you started listening to your body. Today we go deeper.`,
      `Yesterday you defined readiness in language. The mind named what would have to be true for you to actually decide. That's useful work. But the body has its own knowledge, and it doesn't always agree with the mind.`,
      `Many people who say "I'm ready to stop" discover, when they actually try, that their body wasn't ready in a way the mind hadn't registered. The chest tightens around the idea. The stomach knots. The shoulders carry something that didn't show up in the journal entry. The body is holding a "not yet" that the mind hasn't acknowledged.`,
      `This is not a problem. It is information. The body's "not yet" is a real signal — not a weakness to override, but a piece of data to listen to. Sometimes the body is protecting you. Sometimes it's holding old fear. Sometimes it's saying "I'm not actually decided, even though my words are confident." All of these are useful to know.`,
      `Today's exercise is a body scan focused on this question. We walk through specific regions of the body — the head, the throat, the chest, the stomach, the shoulders, the hands. At each region, you pause and notice what that part of you is holding around the idea of stopping the substance.`,
      `You are not trying to make the body feel anything in particular. You are trying to notice what it is already holding. The "not yet" might live in one specific place. Or in several. Or somewhere unexpected. Whatever you notice is true.`,
      `Take a few breaths before you begin. Sit comfortably. Read slowly.`,
    ],
    promptType: 'text',
    promptQuestion: `Where in your body does the "not yet" live?`,
    promptSubtext: `The chest. The throat. The stomach. The shoulders. Somewhere else. What is that part of your body holding? Don't analyze it. Describe it. And — does the body's answer agree with the mind's answer from yesterday? If not, what's different?`,
    postSaveMessage: `Saved. The body has been heard.`,
    closingLine: `Sometimes the body knows before the mind does. Listening to it changes`,
  },
  {
    day: 23,
    arrivalTitle: `Should vs Want`,
    arrivalSubtitle: `Two different forces. Only one sustains.`,
    founderAudio: null,
    readingParagraphs: [
      `Three thousand years ago, in a battlefield dialogue, the Bhagavad Gita made a distinction that still matters for what you're doing here.`,
      `In the Katha Upanishad, repeated and developed in the Gita, two paths are named. Shreya — the higher good, the path of what genuinely benefits you. Preya — the pleasant, the path of what feels good in the moment. The Sanskrit framing is direct: shreyaścha preyaścha manuṣyam etas — "the good and the pleasant approach the human being."`,
      `These two paths look similar on the surface. Both promise a kind of fulfillment. Both feel, in their own way, like answers. But they diverge sharply over time. The path of preya — pleasant, easy, immediate — leads in the direction of comfort that hollows the person out. The path of shreya — good, harder, longer — leads in the direction of becoming who you actually are.`,
      `The Gita's claim is that we are constantly choosing between these two, often without realizing it. Most of the time we choose preya because it's louder and more immediate. The substance you've been examining for the last twenty-two days is, almost certainly, your preya — the pleasant thing that has hollowed you out.`,
      `But there's a related distinction that matters for today, and this is where modern psychology and the Gita converge. The distinction between should and want.`,
      `When most people first try to stop using, the language they use is the language of should. I should stop because my health is bad. I should stop because my wife is unhappy. I should stop because I'm spending too much money. I should stop because I'm getting older. The "should" is real. The reasons are real. But the motivation is extrinsic — coming from outside, from obligation, from fear, from what others expect.`,
      `Extrinsic motivation does not sustain change. The research on this is clear and consistent. People who quit because they "should" — because their doctor said so, their spouse demanded it, their company tested them — relapse at much higher rates than people who quit because they want to. The difference isn't willpower. It's that "should" runs out. The pressure recedes. The doctor's appointment passes. The spouse calms down. The using voice waits for the pressure to drop, and then it comes back, and the person uses again.`,
      `Want, on the other hand, sustains. I want to be present with my children. I want to know who I am without this. I want to write the book that's been in me for ten years. I want to feel my body again. I want to stop lying to myself. The "want" comes from inside. It does not need external pressure to stay alive. It is the thing that keeps people sober for years after the initial reasons have faded.`,
      `The Gita's word for this is swadharma — your own true nature, your own deepest purpose. Shreya is what aligns with swadharma. Preya is what distracts you from it.`,
      `This is not abstract. It is the difference between people who stop and stay stopped, and people who don't.`,
      `Today's exercise is to separate the two. You make two columns. The left is should — the reasons you'd give a doctor, a parent, a friend. The right is want — the reasons that come from inside, that no one else needs to validate.`,
      `Some users find one column much shorter than the other. That's information. If your should column is full and your want column is sparse, you have not yet found your intrinsic motivation. That's not a failure — it's just where you are. If your want column is full, you are closer to readiness than you may have realized.`,
      `Make the lists. Then sit with the difference between them.`,
    ],
    promptType: 'text',
    promptQuestion: `Which column was easier to fill?`,
    promptSubtext: `If "should" came easier, you have not yet found the want. That's information, not failure. If "want" came easier, you are closer to ready than you may have realized. Either way, write a sentence about what you noticed in the difference between the two columns.`,
    postSaveMessage: `Saved. Now you can see which motivation has been driving you.`,
    closingLine: `Should fades. Want sustains. The Gita knew this three thousand years ago.`,
  },
  {
    day: 24,
    arrivalTitle: `Stories from your stage`,
    arrivalSubtitle: `The moment they knew.`,
    founderAudio: null,
    readingParagraphs: [
      `On Day 16, you read stories from people across different substances and paths. Today is more specific — about the moment readiness arrives.`,
      `These three stories are composites. They are not from Vow users — Vow is new, and we don't yet have years of users to draw from. The stories are drawn from clinical literature on the Contemplation-to-Preparation transition, from recovery memoirs, and from the documented patterns of how people in your stage actually move toward readiness. Names, locations, and specific details are fictional. The dynamics are real.`,
      `I'm telling you this because Vow's whole position is honesty. We are not going to fabricate testimonials. The stories below describe how readiness actually tends to arrive for people doing this kind of work — based on hundreds of documented accounts. By the time you read this, some of these composites may have been replaced by real stories from Vow users who agreed to share. Until then, this is what we have, and we're being honest about that.`,
      `The dynamics are still worth your attention. Most people imagine readiness will come dramatically. A revelation. A breakdown. A scene from a film. The reality, across the literature, is almost always quieter than that. The decision often arrives mid-task, in the middle of an ordinary day, in a way that surprises the person making it.`,
      `Read these slowly. Notice if any of them mirrors something you can sense at the edge of your own awareness.`,
      `---------------------------------------------------------------------- STORY 1 (COMPOSITE) — A 34-YEAR-OLD WOMAN, FIFTEEN YEARS OF SMOKING. ----------------------------------------------------------------------`,
      `"I had been trying to quit on and off for five years. Patches, gum, apps, willpower, all of it. I'd last a week, sometimes a month, then something would happen and I'd be back. I'd genuinely forgotten what 'ready' felt like, because every time I'd told myself I was ready, I'd been wrong.`,
      `The moment it actually arrived was on a Tuesday morning in March. I was making coffee. I had just finished a cigarette ten minutes earlier and was already thinking about the next one. And something in me went still. It wasn't drama. It wasn't a revelation. It was more like a quiet sentence appearing in my head: 'I don't want to do this anymore.' Not 'I should stop.' Not 'I'm going to try to stop.' Just — I don't want to do this. The tense was different. It wasn't future, it was present.`,
      `I finished my coffee. I went to work. I didn't smoke that day. Or the next. The decision had already been made before I noticed making it. That was eighteen months ago. I haven't smoked since. I've thought about it. I haven't done it. The wanting was over."`,
      `---------------------------------------------------------------------- STORY 2 (COMPOSITE) — A 41-YEAR-OLD MAN, TWENTY-TWO YEARS OF DRINKING. ----------------------------------------------------------------------`,
      `"My turning was less subtle than that. I had been doing this kind of reflective work in therapy for about four months — examining everything, weighing everything, getting nowhere visible. My therapist would ask me 'do you feel ready?' and I'd say 'I don't know,' and we'd both sit with the not knowing.`,
      `One night I was at home alone. My wife was traveling. I poured myself a drink, the way I had every night for fifteen years. I held it for a moment before drinking it. And I thought, with sudden clarity: 'I have done this exact thing twelve thousand times. Why am I doing it again right now?' I genuinely could not answer the question. I had no reason that felt true. I had habits. I had cravings. But I couldn't construct an actual reason for that specific drink in that specific moment.`,
      `I poured it down the sink. Not as a gesture. Just because the question had already broken something. I haven't had a drink in two years. The work to maintain it has been real. The decision itself, in retrospect, took thirty seconds and required no willpower because the wanting had already collapsed."`,
      `---------------------------------------------------------------------- STORY 3 (COMPOSITE) — A 27-YEAR-OLD MAN, SIX YEARS OF CANNABIS USE. ----------------------------------------------------------------------`,
      `"Mine wasn't a single moment. It was a slow erosion of the want. I had been journaling for about three months. Every entry was about the same thing — the gap between who I wanted to be and who I was. I'd write the same sentences in different orders.`,
      `One day I read back my entries from a month earlier and noticed I had been writing the same things, the same complaints, the same wishes, with no progress. I had been narrating my dissatisfaction to myself for months without moving toward anything. The narration had become its own form of using — a way to feel like I was working on it without actually doing anything.`,
      `That recognition was the readiness, for me. Not a feeling of strength. A feeling of being deeply tired of being the person who keeps saying he wants to change. I stopped two days later. The first month was harder than I expected. The second month was easier than I expected. I'm at four months now. The wanting is real. The way I knew it was real was that the writing stopped being about wanting to stop and started being about other things."`,
      `---------------------------------------------------------------------- CLOSING FRAME ----------------------------------------------------------------------`,
      `Sit with these for a moment.`,
      `Three different paths to readiness. One quiet. One sharp. One slow.`,
      `None of them involved hitting bottom. None of them involved external pressure. Each of them was a moment of internal recognition that the person could not fully explain, but knew was real.`,
      `You may not be there yet. You may be there and not know it. Either is fine.`,
      `For today, just notice. Did anything in any of these stories feel familiar? Like you've already had a quieter version of it?`,
    ],
    promptType: 'text',
    promptQuestion: `Have you had a moment like any of theirs?`,
    promptSubtext: `A small one. A quiet sentence in your head. A recognition that came and went. A drink you held longer than usual before drinking. An entry you wrote that you noticed yourself writing for the tenth time. Not a full readiness. Just a glimpse of one. Write what you remember.`,
    postSaveMessage: `Saved. The glimpse counts. We hold it.`,
    closingLine: `Readiness almost never announces itself. It usually slips in quietly`,
  },
  {
    day: 25,
    arrivalTitle: `A letter to your future self`,
    arrivalSubtitle: `To the version of you who changed.`,
    founderAudio: null,
    readingParagraphs: [
      `Today you write to a specific person.`,
      `Your future self. Someone who is, right now, only a possibility — but a real possibility. The version of you who stopped using and built a different life. The version of you we glimpsed on Day 14, in that other Tuesday morning five years from today.`,
      `You're going to write that person a letter. And then you're going to seal it. And Vow will deliver it to you on a date you choose — three months from today, six months, a year, two years. Whichever feels right. On that date, the letter will arrive in your inbox or your app, and a different version of you will read it.`,
      `There is a body of research, building over the last twenty years, on what's called future self continuity. The research is consistent: people make better long-term decisions when their future self feels real to them — not as an abstraction, but as a specific person they are about to interact with. People with a stronger felt connection to their future self save more money. Take better care of their health. Stay sober at higher rates. The mechanism isn't mysterious. When the future self is real, the present self acts on their behalf. When the future self is vague, the present self is willing to spend that future for short-term comfort.`,
      `Today's exercise is designed to make your future self real.`,
      `You write the letter as if you have changed. Not as if you might. As if you have. The letter is addressed to the version of you who stopped — who walked through the hard months, who built the life you've been imagining, who is now reading this letter from a place you can't yet see.`,
      `What might you write?`,
      `You might tell that future self what you want them to remember about today — the day you wrote the letter. The state you were in. The substance you were trying to look at honestly. The fears you held. The version of yourself you were trying to leave behind.`,
      `You might write what you hope they have built. Not in detail. In essence. The kind of mornings they wake up to. The kind of conversations they have with the people they love. The kind of work they do. The kind of body they live in.`,
      `You might tell them what you want them to know — the things you understood today, on Day 25, that may have faded by the time they read this. The reasons you wanted to change. The things you saw on Days 13 and 14. The fears that drove the decision. The wanting that finally outlasted the using.`,
      `You might end the letter with something specific you want to be true on the day they read it. "By the time you read this, I hope you have…" Whatever feels right.`,
      `Some users write a paragraph. Some write pages. Both can be powerful. The length doesn't matter. The realness of the recipient does.`,
      `After you write, you'll choose the delivery date. Three months. Six months. One year. Two years. Pick the date that feels right — the date by which you want this future to be real, or the date you want a check-in with yourself.`,
      `When the date arrives, Vow will deliver the letter back to you. Whatever has happened by then will be the context in which you read it.`,
      `Take a breath. Now write.`,
    ],
    promptType: 'letter',
    promptQuestion: `Write your letter to the future you who chose to change.`,
    promptSubtext: `Imagine the version of you, five years from now, who decided to make the change. Not perfectly. Not painlessly. But who did it. Write them a letter from where you stand today.

Tell them what you're feeling now. What you're afraid of. What you hope is true on their end. What you'd want them to remember about this version of you — the one still standing here, weighing, unsure, brave enough to write this letter at all.

Begin: "Dear future me — the one who chose,"`,
    postSaveMessage: `visual with the chosen delivery date highlighted.] Sealed. Delivery scheduled for [chosen date]. The future you is now expecting this.`,
    closingLine: `The future stops being abstract when you have mail waiting for it.`,
  },
  {
    day: 26,
    arrivalTitle: `A letter to your future self, if you don't change`,
    arrivalSubtitle: `The other letter.`,
    founderAudio: null,
    readingParagraphs: [
      `Yesterday you wrote to the version of you who changed. Today, the other letter.`,
      `This one is harder. You're going to write to the version of yourself who did not change. The version of you who continued exactly as you have been — same substance, same rate, same patterns — and arrived at a future that the using has shaped.`,
      `This is the same future you saw on Day 13. The body that has aged with the using. The marriage that has either ended or hardened into silence. The bank account that records the years. The version of yourself in the mirror you no longer fully recognize.`,
      `You are going to write to that person.`,
      `Some users, when they first encounter this exercise, resist it. "Why would I write to a version of myself I don't want to become?" The answer is that you are choosing every day, by default, to become exactly that person. Every day you don't decide to change, you take one more step in their direction. Writing them a letter forces you to acknowledge them as a real possibility — not as a warning fantasy, but as the predictable outcome of continued inaction.`,
      `Yesterday's letter was hopeful. Today's is not.`,
      `Yesterday's letter is being delivered later. Today's is not. This letter stays here, in your journal. It does not arrive in your inbox. It does not show up as a notification. It exists as a static record — written to a future you that you can still avoid becoming, if you decide to.`,
      `What might you write?`,
      `You might tell that future self what they look like. The body. The face. The eyes. The way other people see them. The version of themselves that became, over time, exactly what they kept telling themselves they'd address tomorrow.`,
      `You might tell them what they lost. Not in the abstract. The specific things. The relationships that fell apart. The work that didn't happen. The version of fatherhood, marriage, friendship, ambition that didn't get to exist. The years that stopped being countable because they all blurred together.`,
      `You might tell them what they gained — because if we're being honest, they did keep getting something. The substance kept giving them what it gives. Even at sixty, even at seventy, the using voice still tells them it's worth it. They still half- believe it. You might write to them about that — about the bargain they made and what it bought them.`,
      `You might end the letter with a simple, hard sentence. Some version of: "This is who you became because you didn't decide. I am writing this so I remember you exist as a possibility. I am writing this so I don't forget."`,
      `Or you might end it differently. Whatever feels true.`,
      `This letter is not designed to scare you into changing. It is designed to make a possible future real. Most people manage their lives by making decisions about what they will do. But many of the most important outcomes in a life are determined by what people don't decide. Continued use. Continued postponement. Continued "I'll deal with this later." The letter to the unchanged self is a way of seeing what those non-decisions add up to.`,
      `When you've written, you'll save it. It will not be sealed. It will not be delivered. It will sit in your journal. You can come back to it whenever you want — especially in moments when you're tempted to use, or when you're tempted to put off the decision again. The letter will be waiting.`,
      `Take a breath. Now write.`,
    ],
    promptType: 'letter',
    promptQuestion: `Write your letter to the future you who didn't change.`,
    promptSubtext: `Now the harder one. The version of you, five years from now, who didn't change. Same substance. Same patterns. Five more years of what you've been doing.

Don't write to shame them. Don't write a horror story. Write to the actual person you would be. With the same warmth you'd offer a friend you watched continue. Tell them what you see from here. What you noticed. What you wish you had said.

Begin: "Dear future me — the one who didn't,"`,
    postSaveMessage: `Saved. Both letters now exist — one to who you might become, one to who you might not.`,
    closingLine: `Two letters. Two futures. Both written by you, today.`,
  },
  {
    day: 27,
    arrivalTitle: `The Readiness Ruler, again`,
    arrivalSubtitle: `Twelve days later. Where are you now?`,
    founderAudio: null,
    readingParagraphs: [
      `On Day 15, you gave Vow a number.`,
      `The Readiness Ruler, you'll remember, is one of the most validated instruments in change psychology. It asks a single question: On a scale from 1 to 10, how ready do you feel to make a change? You answered that question twelve days ago, somewhere around the midpoint of this program. That number is in your record.`,
      `Today you give a second reading.`,
      `You don't get to see the first one until after you've answered. This is deliberate. The point of measuring twice is to see whether something has shifted, and if you anchor to your earlier number, you bias the second reading toward sameness.`,
      `So before you look at anything, sit with the question one more time, fresh.`,
      `If I had to make a change today — really make it, not say I'd make it — how ready would I actually be?`,
      `You've done a lot of looking since Day 15. You've returned to the cost calculator. You've named what you'd lose if you stopped. You've seen two futures, five years from today. You've heard your own voices on a split screen. You've named your fears on both sides. You've defined what readiness would look like for you. You've listened to what your body knows. You've separated should from want. You've written letters to two future selves.`,
      `Some of that work may have moved you. Some of it may not have. The Ruler doesn't care which way the answer goes. It just records the truth of where you are.`,
      `Move the slider to the number that feels true today. Then we'll show you the trajectory.`,
    ],
    promptType: 'text',
    promptQuestion: `How ready do you feel to make a change? Scale labels: 1 = Not ready at all 10 = Completely ready, today`,
    promptSubtext: `Look at the trajectory honestly. Whatever shape it has — climbing, flat, falling, oscillating — what does it tell you about where you are right now? And: which day in the last twelve, if any, was the day something shifted?`,
    postSaveMessage: `Saved. The trajectory is now part of your record.`,
    closingLine: `The number itself doesn't decide anything. The shape of the line tells`,
  },
  {
    day: 28,
    arrivalTitle: `What would have to change?`,
    arrivalSubtitle: `The specific obstacles, named.`,
    founderAudio: null,
    readingParagraphs: [
      `On Day 21, you defined what readiness would look like for you.`,
      `Today, we look at what stands between you and that definition.`,
      `There's a tendency, when people imagine becoming ready, to picture it as something that will happen to them. Time will pass. Things will align. The internal shift will arrive. Most users hold this passive frame for years. "One day I'll be ready." The using voice loves this frame because it requires no action.`,
      `The truth is more active. Readiness rarely arrives on its own. It arrives when specific obstacles are addressed. Not all of them. But enough that the path forward becomes possible.`,
      `Today's exercise asks you to name those obstacles. Specifically. Not as abstractions like "my willpower needs to improve." As specific, nameable things in your life that are currently making readiness harder than it needs to be.`,
      `Some examples of how other people have named theirs:`,
      `"I'd be more ready if I had a plan for what to do at 8pm. That's when I always reach for it. If I had something else to do at 8pm — a class, a walk with someone, anything — I'd be in a different position."`,
      `"I'd be more ready if I'd had the conversation with my wife. Right now we both pretend the using isn't a thing. If I named it to her, the using would lose some of its cover."`,
      `"I'd be more ready if I weren't going to a wedding in three weeks. The first weekend I quit can't be a wedding. I need a normal week first."`,
      `"I'd be more ready if my closest friend in the using group knew I was thinking about this. Right now we still meet every Friday and I haven't said anything. The silence is making the decision harder."`,
      `"I'd be more ready if I had an alternative way to handle anxiety. Right now this is my only tool. I'd need to have something else in place — therapy, exercise, something — before stopping wouldn't feel like losing the only thing that works."`,
      `These are not goals. They are not aspirational. They are honest namings of the specific conditions under which the user could actually move toward stopping. Each one points to something real that could be addressed in the days, weeks, or months ahead.`,
      `Notice what these examples have in common. They are specific. They are about real circumstances, not character traits. They are addressable — meaning, with thought and time, each one could be worked on. They are not excuses. They are diagnostic.`,
      `This distinction matters. Excuses are what the using voice generates to delay the decision. "I can't quit because of work stress." Diagnostic obstacles are what the honest voice names so that the work can begin. "I can't quit until I have a real way to handle the work stress that doesn't involve the substance — and that way doesn't exist yet, and it would take six weeks to put in place." The first is a closing of the door. The second is opening it, slowly, by naming what it's locked behind.`,
      `Today's reflection asks you to name your obstacles diagnostically. Not as reasons to keep using. As specific things that, if addressed, would move you closer to readiness.`,
      `The naming itself starts the work. Once an obstacle is on paper, it stops being a vague pressure and becomes a thing with edges — a thing that could be addressed.`,
      `Take a breath. Then write.`,
    ],
    promptType: 'text',
    promptQuestion: `What specifically would have to change?`,
    promptSubtext: `Not character traits. Not "more willpower." Not "the right time." Specific things. The 8pm habit. The conversation you haven't had. The wedding in three weeks. The alternative tool you don't yet have. The friend who doesn't know. Name three to five obstacles. The real ones. The ones that, if addressed, would actually move you closer to ready.`,
    postSaveMessage: `Saved. The obstacles now have edges.`,
    closingLine: `Once an obstacle is named, it stops being a wall and becomes a door —`,
  },
  {
    day: 29,
    arrivalTitle: `The 30-day retrospective`,
    arrivalSubtitle: `Reading what you wrote.`,
    founderAudio: null,
    readingParagraphs: [
      `Today is different from the others.`,
      `You've spent twenty-eight days writing things only you could see. Some of those things came easily. Some came after a long pause. Some, you don't remember writing.`,
      `Today, Vow shows them back to you — not all of them, but the ones that matter — in the order they emerged. Your first journal entry. The cost numbers. The two voices. The fears. The trajectories. The themes that surfaced across the program.`,
      `You will not be asked to do anything for most of this session. Just read. Slowly. Notice what hits differently now than it did when you wrote it. Notice what you'd forgotten. Notice what feels truer or less true now than it did then.`,
      `There is one short reflection at the end. It asks a single question.`,
      `This day exists because most people who do hard internal work never get to see the work as a whole. They do it, day by day, and the days blur. They forget what they wrote in week one. The transformation, if there was one, is invisible to them because they were inside it.`,
      `We're going to make it visible.`,
      `When you're ready, tap below. Vow will walk you through what you wrote.`,
      `[Button:] Begin retrospective`,
    ],
    promptType: 'text',
    promptQuestion: `Reading all of this back, what changed?`,
    promptSubtext: `Not "did anything change," because something did. Read what you wrote on Day 1 against what you've written across the program. Notice what shifted. Write what's different now. Even if "different" is just that you can name something today that you couldn't name twenty-nine days ago.`,
    postSaveMessage: `Saved. Tomorrow we close.`,
    closingLine: `This is what twenty-nine days of looking honestly produces. Tomorrow you`,
  },
  {
    day: 30,
    arrivalTitle: `The closing.`,
    arrivalSubtitle: `The closing.`,
    founderAudio: {
      script: `Hi. It's Ninad. One last time.

Thirty days ago you opened this app for reasons you may not have fully understood. You sat through Day 1. You answered the question — what brought you here. You wrote something that nobody but you would ever see.

Then you came back. The next day. And the next.

Through The Mirror — those first ten days where we just looked. The first time. What it gives you. What it costs you. The numbers, when you finally saw them. The stories you'd been telling yourself for years. What your body knew. The letter to who you were. The letter to the substance.

Through The Weighing — the second ten days where you held both sides. The cost continued. What you'd lose if you stopped. Two futures, five years from today, both vivid. The two voices in your head, externalized. The fears on both sides.

Through The Question — these last ten days. Defining what readiness would mean to you. Listening to your body. Separating should from want. Reading stories from people who had crossed the line you're standing at. Writing letters to two future selves. Watching your readiness move, or not move, on the chart. Naming the obstacles between where you are and where ready would be.

That's a lot of honest looking. Not a small thing.

In a moment, Vow is going to do three things.

First, it will unseal the letter you wrote on Day 8 — to who you were, before this took its place. You haven't seen that letter for twenty-two days. Reading it now will feel different than writing it did.

Second, it will show you three doors. They are real doors. Each one is an honest ending to what you've done.

One door is for the version of you who is ready to commit. To stop. To begin the next stage of the work — what we call Commit, the preparation phase. Vow will walk with you through the preparation work in that next stage if you choose this door.

Another door is for the version of you who is not ready yet but wants to keep reflecting. Vow will continue to be here for you, with weekly prompts and lighter cadence, until something shifts.

The third door is for the version of you who is done with Vow. For now, or forever. Vow respects that. The journal stays accessible to you. The letter you sealed yesterday will still arrive on the date you chose. You can come back anytime. You can also walk away.

All three doors are honest. None of them is failure.

The work was the looking. You did the looking. What comes next is yours.

One last thing before I go.

Most of what we did over these thirty days was hard. You may have written things in your journal that you're not sure you wanted to write. You may have surfaced costs that you'd rather have kept buried. You may have seen futures that scared you. You may have felt your body holding things you didn't know it was holding.

All of that is real. All of it stays.

Whatever door you walk through next, the work itself doesn't disappear. Once something has been seen, it can't be fully unseen. That's the durable thing about honest looking. It changes you a little, even if you do nothing else.

Thank you for spending these thirty days with Vow. Thank you for trusting an app you didn't know with words that mattered. I built this so people I love could have something I didn't have when I needed it. The fact that it found its way to you — and that you stayed in it for thirty days — means it's doing what I hoped.

Now go.

Whatever door you choose, walk through it as yourself. Not as the version of you the substance has been telling you to be.

Just yourself.

That's enough.`,
      audioSrc: `/audio/reflect/day_30_founder.mp3`,
    },
    readingParagraphs: [
      `Today closes Reflect.`,
      `Thirty days ago, you began with a single question. What brought you here. You answered it, even if imperfectly. From there, you looked at what the substance gave you and what it cost. You calculated the years and the money. You listened to the story you tell about yourself. You let your body speak. You wrote letters to who you were, to the substance, to two future selves.`,
      `You weighed. Both sides, honestly. Five years still using. Five years stopped. The fears on both sides. The voices. The body's verdict.`,
      `And then you sat with the question. What does ready mean. What would have to change. Where you actually stand.`,
      `Now — today — you have three doors. Listen to the audio. Then choose.`,
    ],
    promptType: 'text',
    promptQuestion: `Which door is yours?`,
    promptSubtext: `After thirty days of looking, weighing, and questioning, the Reflect program ends with a choice. Not a forced choice. An honest one.

Door 1: Ready. You have looked at it carefully. You're ready to begin Commit — the 30-day preparation phase.

Door 2: Not yet. You've looked. You've weighed. You're not ready to commit, but you're more honest with yourself than thirty days ago. You'll come back when you are.

Door 3: Not for me. After looking carefully, you don't believe you have the problem you came here for. That is also an honest answer.

Write which door is yours, and why. A few sentences is enough.`,
    postSaveMessage: `Saved.`,
    closingLine: `You looked. That matters more than what you decide next.`,
  },
];

// Helper: get a day's content by number (1-30)
export function getReflectDay(dayNumber) {
  return REFLECT_DAYS.find(d => d.day === dayNumber) || null;
}

export const REFLECT_TOTAL_DAYS = REFLECT_DAYS.length;