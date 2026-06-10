// ===================================================================
// FREE-TIER COLLECTIONS
// ===================================================================
// The six practice collections shown in the free menu. These are the
// SAME exercise sets that used to live in the six stage-shaped free
// homes — only renamed for the free experience so the Vow Path stage
// structure (Notice / Reflect / Commit / Endure / Build / Reclaim and
// the URICA model) is never exposed.
//
// IMPORTANT: `stage` is the underlying key still written to Supabase
// (free_stage_signals.stage, journal stage, etc.). It is NEVER shown in
// the UI. Renaming is cosmetic only — existing user data keeps loading.
//
// Presentation rule: these are shown UNORDERED, with no numbers, no
// locks, no sequence. To a free user they read as themed collections,
// not a journey.
// ===================================================================

export const COLLECTIONS = [
  {
    id: 'habit',
    stage: 'notice',
    label: 'Understand the habit',
    subtitle: 'See the patterns you run on autopilot',
    intro:
      'Before anything changes, it helps to simply see the habit clearly — when it tends to show up, what pulls you toward it, and what it actually gives back once the moment passes. Nothing in here asks you to stop or to decide anything. You are just looking, with a bit of curiosity instead of judgment. Most of us run the habit on autopilot, half-aware, so the first real skill is noticing it at all. Come back to these as often as you like; the picture gets clearer the more honestly you look.',
  },
  {
    id: 'cost',
    stage: 'reflect',
    label: 'See what it costs',
    subtitle: 'Look honestly at the price you pay',
    intro:
      'This is the honest accounting — what the habit takes from you over time, the stories your mind tells to keep it going, and the quiet pull that makes it hard to let go. None of this is about shame. It is about letting yourself see the real price clearly enough that the choice in front of you becomes your own.',
  },
  {
    id: 'quit',
    stage: 'commit',
    label: 'Get ready to quit',
    subtitle: 'Set a date and prepare your defenses',
    intro:
      'When you decide you are ready, this is where you lay the groundwork — choosing a date, clearing the easy access, and making a plan for the moments you already know will be hard. Preparing well is most of the work. The steadier the ground you lay now, the less you will have to rely on willpower later.',
  },
  {
    id: 'day',
    stage: 'endure',
    label: 'Get through the day',
    subtitle: 'Tools for the hard hours',
    intro:
      'These are for the day-to-day of staying with it — the small practices that help you ride out a hard hour, name what you are feeling, and find something to reach for instead. You only ever have to get through today. Come here whenever the day asks more of you than usual.',
  },
  {
    id: 'free',
    stage: 'build',
    label: 'Stay free',
    subtitle: 'Protect the life you\u2019re building',
    intro:
      'Staying free for the long run is less about resisting and more about building — a life with enough in it that the old habit loses its hold. These practices help you tend that life, notice early drift before it becomes a slip, and keep what you have worked for.',
  },
  {
    id: 'slip',
    stage: 'reclaim',
    label: 'After a slip',
    subtitle: 'Start again, without the shame',
    intro:
      'If you slipped, you are not back at zero, and you are not a failure. A slip is a moment, not a verdict. These practices help you look at what happened without cruelty, take what it has to teach, and find your footing again — gently. The fastest way back is kindness, not punishment.',
  },
]

const BY_ID = COLLECTIONS.reduce((m, c) => { m[c.id] = c; return m }, {})
const BY_STAGE = COLLECTIONS.reduce((m, c) => { m[c.stage] = c; return m }, {})

export function getCollection(id) {
  return BY_ID[id] || null
}

// Maps the user's stored free_state (a stage key) to the collection we
// quietly suggest. Falls back to the first collection.
export function collectionForStage(stage) {
  return (stage && BY_STAGE[stage]) || COLLECTIONS[0]
}