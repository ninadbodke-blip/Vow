/**
 * Motivation quotes — daily rotation based on day-of-year.
 * Same quote shown to all users on a given day.
 * 60 quotes total. Cycle restarts every QUOTES.length days (~8.5 weeks).
 * Categories: stoic / eastern / modern / original.
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
  {
    id: 35,
    text: "The Tuesday afternoon use is the one to study. Crisis uses make sense — boredom uses tell the truth.",
    attribution: null,
    category: "original",
  },
  {
    id: 36,
    text: "Cravings have an arrival time and a departure time. Most people negotiate during the wrong half.",
    attribution: null,
    category: "original",
  },
  {
    id: 37,
    text: "Sobriety isn't the absence of wanting. It's getting better at the seven minutes after the wanting peaks.",
    attribution: null,
    category: "original",
  },
  {
    id: 38,
    text: "Most relapses don't begin with a craving. They begin with three skipped nights of sleep and one phone call you didn't return.",
    attribution: null,
    category: "original",
  },
  {
    id: 39,
    text: "Boredom is not your enemy. Boredom is the room the substance was furnishing for you.",
    attribution: null,
    category: "original",
  },
  {
    id: 40,
    text: "From the unreal lead me to the real, from darkness lead me to light, from death lead me to immortality.",
    attribution: "Brihadaranyaka Upanishad",
    category: "eastern",
  },
  {
    id: 41,
    text: "All conditioned things are impermanent. Work out your own salvation with diligence.",
    attribution: "Gautama Buddha",
    category: "eastern",
  },
  {
    id: 42,
    text: "The cure for the pain is in the pain.",
    attribution: "Rumi",
    category: "eastern",
  },
  {
    id: 43,
    text: "The struggle itself toward the heights is enough to fill a man's heart. One must imagine Sisyphus happy.",
    attribution: "Albert Camus",
    category: "modern",
  },
  {
    id: 44,
    text: "When we are no longer able to change a situation, we are challenged to change ourselves.",
    attribution: "Viktor Frankl",
    category: "modern",
  },
  {
    id: 45,
    text: "You are not negotiating with the substance. You are negotiating with the version of yourself who learned to need it.",
    attribution: null,
    category: "original",
  },
  {
    id: 46,
    text: "The morning after is when the body tells the truth the night was hiding.",
    attribution: null,
    category: "original",
  },
  {
    id: 47,
    text: "What you call willpower is mostly the absence of unnecessary decisions.",
    attribution: null,
    category: "original",
  },
  {
    id: 48,
    text: "Quitting is one decision. Staying quit is a thousand.",
    attribution: null,
    category: "original",
  },
  {
    id: 49,
    text: "Most relapses happen in the half-hour between deciding you're fine and proving it.",
    attribution: null,
    category: "original",
  },
  {
    id: 50,
    text: "He who knows that enough is enough will always have enough.",
    attribution: "Lao Tzu, Tao Te Ching",
    category: "eastern",
  },
  {
    id: 51,
    text: "Be a lamp unto yourself.",
    attribution: "Gautama Buddha",
    category: "eastern",
  },
  {
    id: 52,
    text: "The breeze at dawn has secrets to tell you. Don't go back to sleep.",
    attribution: "Rumi",
    category: "eastern",
  },
  {
    id: 53,
    text: "Attention is the beginning of devotion.",
    attribution: "Mary Oliver",
    category: "modern",
  },
  {
    id: 54,
    text: "We tell ourselves stories in order to live.",
    attribution: "Joan Didion",
    category: "modern",
  },
  {
    id: 55,
    text: "You could leave life right now. Let that determine what you do and say and think.",
    attribution: "Marcus Aurelius",
    category: "stoic",
  },
  {
    id: 56,
    text: "If you want to improve, be content to be thought foolish and stupid.",
    attribution: "Epictetus",
    category: "stoic",
  },
  {
    id: 57,
    text: "While we are postponing, life speeds by.",
    attribution: "Seneca",
    category: "stoic",
  },
  {
    id: 58,
    text: "So you were born to feel 'nice'? Instead of doing things and experiencing them?",
    attribution: "Marcus Aurelius",
    category: "stoic",
  },
  {
    id: 59,
    text: "Men are disturbed not by things, but by the opinions they form of them.",
    attribution: "Epictetus",
    category: "stoic",
  },
  {
    id: 60,
    text: "Sometimes even to live is an act of courage.",
    attribution: "Seneca",
    category: "stoic",
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