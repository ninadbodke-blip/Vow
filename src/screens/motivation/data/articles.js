/**
 * Motivation articles — longer-form essays.
 * Each article is rendered by MotivationArticle.jsx via slug lookup.
 * Paragraphs stored as an array so rendering is trivial.
 */

export const ARTICLES = [
  {
    id: 1,
    slug: 'the-room-you-were-trying-to-leave',
    title: 'The Room You Were Trying to Leave',
    subtitle: null,
    readMinutes: 3,
    paragraphs: [
      "You didn't fall in love with the substance. You fell in love with what it did to the room you were in.",
      "Think about the last time you used. Not the act — the moment before. What was the room like? Was someone there? Was it after a meeting that went sideways, a phone call from your mother, the hour after dinner where everything got too quiet?",
      "The substance promised a different room. Or rather, it promised you could stay in the same room and feel differently about it. The walls would soften. The clock would forgive you. The conversation in your head would stop running.",
      "It worked. That's why this is hard. It worked, reliably, dozens of times, hundreds of times. It worked when nothing else did. You'd have been a fool not to use it.",
      "But the room never actually changed. You changed your perception of it for an hour, and then the room came back — slightly worse than before, because now your nervous system was angry. So you needed another dose to soften the room again. And another. And eventually the room was just the place you went to use, and the using was the place you went to leave the room.",
      "If you stop, the room is still there. That's the part nobody tells you upfront. The first weeks of sobriety are mostly an audit of the rooms you were avoiding. Your relationships. Your apartment after work. The hour between dinner and bed. The dread on Sunday night. The way your father talks to your mother. All of it sitting there exactly as it was, but now you have to feel it.",
      "This is not a problem to solve. This is the work.",
      "The point isn't to make the rooms easier so you stop needing the substance. The point is to stop running from them. To sit in the Sunday night dread until you find out what it actually has to teach you. To go home after work and let the silence be silence instead of medicating it.",
      "Most of the rooms get smaller once you stop running. A few of them turn out to be rooms you need to leave for real — relationships to end, jobs to quit, neighborhoods to move out of. The substance was hiding both kinds. You can't tell which is which until you stop.",
      "Get used to the rooms. They're where the rest of your life is.",
    ],
  },
]

export function getArticleBySlug(slug) {
  return ARTICLES.find(a => a.slug === slug) || null
}

export function getArticleById(id) {
  return ARTICLES.find(a => a.id === id) || null
}