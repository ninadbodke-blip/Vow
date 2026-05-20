// =====================================================================
// VOW STAGE CHECK — Stage Reveal Copy
// =====================================================================
// One block per Vow stage slug. Used by StageReveal screen.
//
// Status flag tells the UI whether to enter the stage's daily flow
// or show a placeholder.
//   - 'available' = content is drafted, user can enter
//   - 'coming_soon' = stage exists but content not yet drafted
// =====================================================================

export const STAGE_REVEALS = {
  notice: {
    code: 'PC',
    name: 'Notice',
    duration: '5 days',
    status: 'available',
    headline: `You're at Notice.`,
    subhead: 'The earliest part of the path.',
    body: `You're here because the Stage Check placed you in Notice. Most people in this stage don't think they have a problem. They've heard the warnings. They've seen the lists of symptoms. None of it has felt like it applies to them.

Notice isn't designed to convince you of anything. It's designed to surface things you already know about yourself, in a way that's harder to look past.

Five days. Mostly short. By the end, you'll have looked at four specific things about your situation that the using mind has been working to keep out of view.`,
  },
  reflect: {
    code: 'C',
    name: 'Reflect',
    duration: '21 days',
    status: 'available',
    headline: `You're at Reflect.`,
    subhead: 'Looking carefully, before deciding.',
    body: `Reflect is a 21-day journey for people who are honestly weighing whether to change. Not deciding yet. Just looking carefully. The work is structured looking across three weeks — your reasons for being here, your trigger patterns, the costs of your use, the using voice in your head, the fears on both sides. By Day 21, you'll have a much clearer picture of what you actually want.`,
  },
  commit: {
    code: 'P',
    name: 'Commit',
    duration: '10 days',
    status: 'available',
    headline: `You're at Commit.`,
    subhead: 'Gathering yourself.',
    body: `Commit is the 10-day preparation phase. You pick a specific stop date, map your environment, choose your anchor person, build your replacement engine, build your if-then library for the hard moments, set daily anchors, plan the conversations to have, and finally write and seal your formal vow.

By the end of Commit, you have everything you need to walk into the actually-stopping phase with structure rather than willpower.`,
  },
  endure: {
    code: 'A',
    name: 'Endure',
    duration: '21 days',
    status: 'available',
    headline: `You're at Endure.`,
    subhead: 'Walking through the hardest stretch.',
    body: `Endure is the 21-day program for the early sobriety stretch. The first 72 hours, the first week, the first month. The cravings, the flatness, the sleep disruption, the using voice. Endure works with what's surfacing rather than trying to suppress it — drawing on relapse prevention, nervous system regulation, recovery capital building, and contemplative traditions.`,
  },
  build: {
    code: 'M',
    name: 'Build',
    duration: '9 weekly entries',
    status: 'available',
    headline: `You're at Build.`,
    subhead: 'Living the vow.',
    body: `Build is for the long stretch after the early sobriety phase has settled. The substance is no longer the central preoccupation, but you stay vigilant. Build is about constructing the life on the other side — work, relationships, identity, time.

Nine weekly entries across about twelve weeks. Each one short. Each one asks you to mark where you are. The version of you that starts here is the version we'll keep listening to.`,
  },
  reclaim: {
    code: 'R',
    name: 'Reclaim',
    duration: '5 days',
    status: 'available',
    headline: `You're at Reclaim.`,
    subhead: 'Beginning again.',
    body: `Reclaim is for after a slip. Not for starting over — for continuing.

Five days of quiet acts. No required writing. Each day is short. The work is to interrupt the cascade that turns one slip into a longer one, to right-size what happened, to see what's still here, and to mend the line you've been walking.

On Day 5, you'll step back into the stage of the journey that fits where you actually are right now — not where you wish you were. The literature on recovery is clear that the stage you re-enter matters more than the speed.`,
  },
};