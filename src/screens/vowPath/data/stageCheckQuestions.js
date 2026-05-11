// =====================================================================
// VOW STAGE CHECK — 15 Questions (substance-aware)
// =====================================================================

// Each question may include {{label}} (substance label, e.g. "drinking")
// or {{verb}} (substance verb, e.g. "drank").
// =====================================================================

export const STAGE_CHECK_QUESTIONS = [
  {
    id: 'Q1',
    text: `When people in my life mention my {{label}}, I usually find myself defending it.`,
  },
  {
    id: 'Q2',
    text: `I've had moments recently where I wondered if my {{label}} is more than I want to admit.`,
  },
  {
    id: 'Q3',
    text: `I've quietly been preparing — telling myself I'll stop, even if I haven't picked a date yet.`,
  },
  {
    id: 'Q4',
    text: `It's been weeks since I last {{verb}}, and I'm still finding my footing.`,
  },
  {
    id: 'Q5',
    text: `I've made it through a long stretch clean, but I know I can't stop paying attention.`,
  },
  {
    id: 'Q6',
    text: `I tried to quit recently and slipped. I'm not where I wanted to be.`,
  },
  {
    id: 'Q7',
    text: `When I'm honest with myself, my {{label}} has affected my work, sleep, money, or relationships in ways I haven't fully looked at.`,
  },
  {
    id: 'Q8',
    text: `I get irritated when an app, a doctor, or a family member implies I have a problem.`,
  },
  {
    id: 'Q9',
    text: `I find myself making rules about my {{label}} — only on weekends, only at parties, only after work — and breaking them.`,
  },
  {
    id: 'Q10',
    text: `I have a clear date in my mind for when I'll stop, or I've already set one.`,
  },
  {
    id: 'Q11',
    text: `I'm currently going through the hardest part — cravings, mood swings, the boredom of empty time.`,
  },
  {
    id: 'Q12',
    text: `I think about my {{label}} less than I used to. It's not what occupies my days anymore.`,
  },
  {
    id: 'Q13',
    text: `I've told someone close to me — family, friend, or partner — that I'm working on this.`,
  },
  {
    id: 'Q14',
    text: `When I imagine my life one year from now still doing my {{label}} the same way I do today, I feel something shift in my chest.`,
  },
  {
    id: 'Q15',
    text: `I've already taken concrete steps in the last week — thrown things away, told someone, set a date, started replacing the habit.`,
  },
];

export const LIKERT_OPTIONS = [
  { value: 1, label: 'Not true at all' },
  { value: 2, label: 'A little true' },
  { value: 3, label: 'Somewhat true' },
  { value: 4, label: 'Mostly true' },
  { value: 5, label: 'Completely true' },
];

// Resolves a question's tokens with substance label and verb.
// Pass label (e.g. "drinking") and verb (e.g. "drank").
// Falls back to "this" / "did it" if substance metadata missing.
export function resolveQuestion(question, label, verb) {
  const safeLabel = label || 'this';
  const safeVerb = verb || 'did it';
  return question.text
    .replace(/\{\{label\}\}/g, safeLabel)
    .replace(/\{\{verb\}\}/g, safeVerb);
}