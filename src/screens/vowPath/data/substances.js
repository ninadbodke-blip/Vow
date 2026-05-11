// =====================================================================
// SUBSTANCE METADATA
// =====================================================================
// Used by SubstancePicker, StageCheck, and all Reflect content
// to display the substance correctly across the Vow Path.
// =====================================================================

// The 10 standard substances + custom
export const SUBSTANCES = [
  {
    id: 'alcohol',
    name: 'Alcohol',
    glyph: '\u{1F377}',           // wine glass
    label: 'drinking',             // for "my drinking"
    verb: 'drank',                 // for "since I last drank"
    actionVerb: 'drink',           // for "on a typical day you drink"
    unit: 'standard drinks',
    unitMax: 15,
    family: 'substance',
  },
  {
    id: 'cigarettes',
    name: 'Cigarettes / vape',
    glyph: '\u{1F6AC}',           // cigarette
    label: 'smoking',
    verb: 'smoked',
    actionVerb: 'smoke',
    unit: 'cigarettes',
    unitMax: 40,
    family: 'substance',
  },
  {
    id: 'chewing_tobacco',
    name: 'Chewing tobacco',
    glyph: '\u{1F343}',           // leaf
    label: 'tobacco use',
    verb: 'used tobacco',
    actionVerb: 'use',
    unit: 'uses',
    unitMax: 15,
    family: 'substance',
  },
  {
    id: 'cannabis',
    name: 'Cannabis',
    glyph: '\u{1F33F}',           // herb
    label: 'weed',
    verb: 'used',
    actionVerb: 'use',
    unit: 'sessions',
    unitMax: 10,
    family: 'substance',
  },
  {
    id: 'cocaine',
    name: 'Cocaine',
    glyph: '\u26A1',              // lightning
    label: 'cocaine use',
    verb: 'used',
    actionVerb: 'use',
    unit: 'grams',
    unitMax: 3,
    unitStep: 0.1,
    family: 'substance',
  },
  {
    id: 'mdma',
    name: 'MDMA / club drugs',
    glyph: '\u{1F52E}',           // crystal ball
    label: 'MDMA use',
    verb: 'used',
    actionVerb: 'use',
    unit: 'pills',
    unitMax: 5,
    family: 'substance',
  },
  {
    id: 'heroin_opioids',
    name: 'Heroin / opioids',
    glyph: '\u{1F489}',           // syringe
    label: 'opioid use',
    verb: 'used',
    actionVerb: 'use',
    unit: 'uses',
    unitMax: 10,
    family: 'substance',
  },
  {
    id: 'prescription_drugs',
    name: 'Prescription drugs',
    glyph: '\u{1F48A}',           // pill
    label: 'prescription drug use',
    verb: 'used',
    actionVerb: 'use',
    unit: 'doses above prescribed',
    unitMax: 10,
    family: 'substance',
  },
  {
    id: 'pornography',
    name: 'Pornography',
    glyph: '\u{1F4FA}',           // tv
    label: 'porn use',
    verb: 'looked at it',
    actionVerb: 'look at it',
    unit: 'sessions',
    unitMax: 10,
    family: 'behavior',
  },
  {
    id: 'gambling',
    name: 'Gambling',
    glyph: '\u{1F3B2}',           // game die
    label: 'gambling',
    verb: 'gambled',
    actionVerb: 'gamble',
    unit: 'hours',
    unitMax: 12,
    family: 'behavior',
  },
];

// Custom substance fallback — used when user picks "Something else"
export const CUSTOM_SUBSTANCE_DEFAULTS = {
  id: 'custom',
  glyph: '\u2728',                // sparkles
  verb: 'did it',
  actionVerb: 'do it',
  unit: 'times',
  unitMax: 15,
  family: 'substance',             // default per spec
};

// Helper: get substance metadata by id
export function getSubstance(id) {
  return SUBSTANCES.find(s => s.id === id) || null;
}

// Helper: build a substance object for a custom user entry
export function buildCustomSubstance(userText) {
  const cleanText = userText.trim().toLowerCase();
  return {
    ...CUSTOM_SUBSTANCE_DEFAULTS,
    name: userText.trim(),
    label: cleanText || 'this',
  };
}