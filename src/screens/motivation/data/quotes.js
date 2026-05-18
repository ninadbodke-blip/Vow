/**
 * Motivation quotes — daily rotation based on day-of-year.
 * Same quote shown to all users on a given day.
 * 34 quotes total. Cycle restarts every QUOTES.length days.
 * Order is curated for variety: stoic / eastern / modern / original rough rotation.
 */

export const QUOTES = [
  {
    id: 1,
    text: "What stands in the way becomes the way.",
    attribution: "Marcus Aurelius",
    category: "stoic",
  },
  {
    id: 2,
    text: "The wound is the place where the Light enters you.",
    attribution: "Rumi",
    category: "eastern",
  },
  {
    id: 3,
    text: "Between stimulus and response there is a space. In that space is our power to choose our response.",
    attribution: "Viktor Frankl",
    category: "modern",
  },
  {
    id: 4,
    text: "The version of you tomorrow morning is voting in tonight's election.",
    attribution: null,
    category: "original",
  },
  {
    id: 5,
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    attribution: "Marcus Aurelius",
    category: "stoic",
  },
  {
    id: 6,
    text: "When I let go of what I am, I become what I might be.",
    attribution: "Lao Tzu, Tao Te Ching",
    category: "eastern",
  },
  {
    id: 7,
    text: "In the depth of winter, I finally learned that within me there lay an invincible summer.",
    attribution: "Albert Camus",
    category: "modern",
  },
  {
    id: 8,
    text: "Discipline is what's left when motivation goes home.",
    attribution: null,
    category: "original",
  },
  {
    id: 9,
    text: "We suffer more in imagination than in reality.",
    attribution: "Seneca",
    category: "stoic",
  },
  {
    id: 10,
    text: "All that we are is the result of what we have thought.",
    attribution: "Dhammapada",
    category: "eastern",
  },
  {
    id: 11,
    text: "Desire is a contract you make with yourself to be unhappy until you get what you want.",
    attribution: "Naval Ravikant",
    category: "modern",
  },
  {
    id: 12,
    text: "Most days don't feel like progress. Most days are progress.",
    attribution: null,
    category: "original",
  },
  {
    id: 13,
    text: "No man is free who is not master of himself.",
    attribution: "Epictetus",
    category: "stoic",
  },
  {
    id: 14,
    text: "Knowing others is intelligence; knowing yourself is true wisdom. Mastering others is strength; mastering yourself is true power.",
    attribution: "Lao Tzu, Tao Te Ching",
    category: "eastern",
  },
  {
    id: 15,
    text: "Life can only be understood backwards, but it must be lived forwards.",
    attribution: "Søren Kierkegaard",
    category: "modern",
  },
  {
    id: 16,
    text: "You don't have to be strong every hour. You have to keep choosing again.",
    attribution: null,
    category: "original",
  },
  {
    id: 17,
    text: "First say to yourself what you would be; and then do what you have to do.",
    attribution: "Epictetus",
    category: "stoic",
  },
  {
    id: 18,
    text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.",
    attribution: "Rumi",
    category: "eastern",
  },
  {
    id: 19,
    text: "Until you make the unconscious conscious, it will direct your life and you will call it fate.",
    attribution: "Carl Jung",
    category: "modern",
  },
  {
    id: 20,
    text: "What you tolerate becomes what you are.",
    attribution: null,
    category: "original",
  },
  {
    id: 21,
    text: "Waste no more time arguing about what a good man should be. Be one.",
    attribution: "Marcus Aurelius",
    category: "stoic",
  },
  {
    id: 22,
    text: "Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.",
    attribution: "Zen proverb",
    category: "eastern",
  },
  {
    id: 23,
    text: "Not everything that is faced can be changed, but nothing can be changed until it is faced.",
    attribution: "James Baldwin",
    category: "modern",
  },
  {
    id: 24,
    text: "You can't think your way out of a habit. You walk your way out.",
    attribution: null,
    category: "original",
  },
  {
    id: 25,
    text: "Difficulties strengthen the mind, as labor does the body.",
    attribution: "Seneca",
    category: "stoic",
  },
  {
    id: 26,
    text: "You have the right to perform your duty, but never to the fruits of your action.",
    attribution: "Bhagavad Gita 2.47",
    category: "eastern",
  },
  {
    id: 27,
    text: "He who has a why to live can bear almost any how.",
    attribution: "Friedrich Nietzsche",
    category: "modern",
  },
  {
    id: 28,
    text: "Endurance isn't bearing the heavy thing. It's putting it down each evening and picking it up each morning.",
    attribution: null,
    category: "original",
  },
  {
    id: 29,
    text: "Don't explain your philosophy. Embody it.",
    attribution: "Epictetus",
    category: "stoic",
  },
  {
    id: 30,
    text: "Identity follows action, not the other way around. You become what you do daily.",
    attribution: null,
    category: "original",
  },
  {
    id: 31,
    text: "The chains of habit are too light to be felt until they are too heavy to be broken.",
    attribution: "Samuel Johnson",
    category: "modern",
  },
  {
    id: 32,
    text: "The body keeps score before the mind knows the game has started.",
    attribution: null,
    category: "original",
  },
  {
    id: 33,
    text: "Comfort is the slow drowning. Discomfort is the breath.",
    attribution: null,
    category: "original",
  },
  {
    id: 34,
    text: "The work that no one sees is the work that builds the life.",
    attribution: null,
    category: "original",
  },
]

/**
 * Returns the quote for today, deterministic based on day-of-year.
 * Same quote shown to all users on a given day.
 * Cycle restarts every QUOTES.length days.
 */
export function getTodayQuote() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const diff = now - startOfYear
  const dayOfYear = Math.floor(diff / 86400000)
  const idx = dayOfYear % QUOTES.length
  return QUOTES[idx]
}

export function getQuoteById(id) {
  return QUOTES.find(q => q.id === id) || null
}