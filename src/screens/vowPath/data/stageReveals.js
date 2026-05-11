// =====================================================================
// VOW STAGE CHECK — Stage Reveal Copy
// =====================================================================
// status: 'available' = content drafted, user can enter
//         'coming_soon' = stage exists but content not yet drafted
// =====================================================================

export const STAGE_REVEALS = {
  notice: {
    code: 'PC',
    name: 'Notice',
    duration: '14 days',
    status: 'coming_soon',
    headline: `You're at Notice.`,
    subhead: 'The earliest part of the path.',
    body: `Notice is for the part of the journey before commitment — when something is calling for your attention but you're not yet ready to act on it. The 14 days of Notice are about looking, not deciding. Pure curiosity.`,
    coming_soon_note: 'Notice is being written. Coming soon.',
  },
  reflect: {
    code: 'C',
    name: 'Reflect',
    duration: '30 days',
    status: 'available',
    headline: `You're at Reflect.`,
    subhead: 'Sitting with it.',
    body: `Reflect is a 30-day journey for people who are honestly weighing whether to change. Not deciding yet. Just looking carefully. The work is reading, journaling, and noticing patterns you may not have seen before. By Day 30, you'll have a much clearer picture of what you actually want.`,
  },
  commit: {
    code: 'P',
    name: 'Commit',
    duration: '30 days',
    status: 'coming_soon',
    headline: `You're at Commit.`,
    subhead: 'Gathering yourself.',
    body: 'Commit is the 30-day preparation phase. You map your triggers, build your kit of replacement activities, choose your anchor support, write your scripts for the people in your life, and finally write and seal your formal vow.',
    coming_soon_note: 'Commit is being written. Coming soon.',
  },
  endure: {
    code: 'A',
    name: 'Endure',
    duration: '30 days',
    status: 'coming_soon',
    headline: `You're at Endure.`,
    subhead: 'Walking through.',
    body: 'Endure is the 30-day program for the early sobriety stretch. The first 72 hours, the first week, the first month. The cravings, the boredom, the sleep disruption, the using voice. Endure is built for these days.',
    coming_soon_note: 'Endure is being written. Coming soon.',
  },
  build: {
    code: 'M',
    name: 'Build',
    duration: '30 days',
    status: 'coming_soon',
    headline: `You're at Build.`,
    subhead: 'Living the vow.',
    body: 'Build is for the long stretch after the early sobriety phase has settled. The substance is no longer the central preoccupation, but you stay vigilant. Build is about constructing the life on the other side — work, relationships, identity, time.',
    coming_soon_note: 'Build is being written. Coming soon.',
  },
  reclaim: {
    code: 'R',
    name: 'Reclaim',
    duration: '14 days',
    status: 'coming_soon',
    headline: `You're at Reclaim.`,
    subhead: 'Beginning again.',
    body: `Reclaim is for after a slip. Not for starting over — for continuing. The 14 days are about understanding what happened without spiraling, repairing the structure you had built, and stepping back into the work without shame.`,
    coming_soon_note: 'Reclaim is being written. Coming soon.',
  },
};