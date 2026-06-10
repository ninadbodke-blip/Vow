// ===================================================================
// MODE CONFIGS — the six free homes, de-staged.
// ===================================================================
// Internal keys (notice/reflect/commit/endure/build/reclaim) are data
// keys only and are never shown to the user. `label` is the only thing
// visible — the small eyebrow on the home.
//
// counter:  'days'     → day count under the tree (needs a tracker)
//           'tending'  → counts check-ins, not abstinence
//           'standing' → no number at all (getting back up)
//
// All six modes now run on the HomeShell. Each carries two bespoke
// practices plus the shared journal — no interaction is duplicated
// across modes.
// ===================================================================
import TheHardHour from './practices/TheHardHour'
import InsteadI from './practices/InsteadI'
import YourAutopilot from './practices/YourAutopilot'
import GivesAndTakes from './practices/GivesAndTakes'
import TheScales from './practices/TheScales'
import WhatItCosts from './practices/WhatItCosts'
import VowAndDay from './practices/VowAndDay'
import ClearThePath from './practices/ClearThePath'
import PressurePoints from './practices/PressurePoints'
import TheBlindSpot from './practices/TheBlindSpot'
import WhatStillStands from './practices/WhatStillStands'
import KinderVoice from './practices/KinderVoice'
import JournalTile from '../freeHome/JournalTile'
import {
  HardHourGlyph, InsteadGlyph, WordsGlyph,
  AutopilotGlyph, LedgerGlyph, ScalesGlyph, CostGlyph,
  VowDayGlyph, PathGlyph, GaugeGlyph, BlindspotGlyph,
  StandsGlyph, KinderGlyph,
} from './glyphs'

const words = {
  id: 'words',
  title: 'In your words',
  line: 'Whatever\u2019s on your mind, said your way. Only you read it.',
  minutes: 3,
  Component: JournalTile,
  Glyph: WordsGlyph,
}

export const MODES = {
  notice: {
    key: 'notice',
    label: 'A closer look',
    counter: 'tending',
    inTheMoment: false,
    practices: [
      {
        id: 'autopilot',
        title: 'Your autopilot',
        line: 'When it runs without you choosing — name the moments.',
        minutes: 2,
        Component: YourAutopilot,
        Glyph: AutopilotGlyph,
      },
      {
        id: 'ledger',
        title: 'What it gives, what it takes',
        line: 'Both columns, honestly. No verdict today.',
        minutes: 2,
        Component: GivesAndTakes,
        Glyph: LedgerGlyph,
      },
      words,
    ],
  },
  reflect: {
    key: 'reflect',
    label: 'Weighing it up',
    counter: 'tending',
    inTheMoment: false,
    practices: [
      {
        id: 'lean',
        title: 'The scales',
        line: 'Where are you leaning today — staying or changing?',
        minutes: 1,
        Component: TheScales,
        Glyph: ScalesGlyph,
      },
      {
        id: 'cost',
        title: 'What it costs',
        line: 'The money and the hours, added up for a year.',
        minutes: 2,
        Component: WhatItCosts,
        Glyph: CostGlyph,
      },
      words,
    ],
  },
  commit: {
    key: 'commit',
    label: 'Getting ready',
    counter: 'tending',
    inTheMoment: false,
    practices: [
      {
        id: 'vow_day',
        title: 'Your vow & your day',
        line: 'One honest line, and the day you begin.',
        minutes: 2,
        Component: VowAndDay,
        Glyph: VowDayGlyph,
      },
      {
        id: 'path',
        title: 'Clear the path',
        line: 'Small moves now that make day one easier.',
        minutes: 2,
        Component: ClearThePath,
        Glyph: PathGlyph,
      },
      words,
    ],
  },
  endure: {
    key: 'endure',
    label: 'Early days',
    counter: 'days',
    inTheMoment: true,
    practices: [
      {
        id: 'hard_hour',
        title: 'The hard hour',
        line: 'Name tonight\u2019s hardest hour — and guard it in advance.',
        minutes: 1,
        Component: TheHardHour,
        Glyph: HardHourGlyph,
      },
      {
        id: 'instead',
        title: 'Instead, I…',
        line: 'What did you do with the time it used to take?',
        minutes: 2,
        Component: InsteadI,
        Glyph: InsteadGlyph,
      },
      words,
    ],
  },
  build: {
    key: 'build',
    label: 'Staying steady',
    counter: 'days',
    inTheMoment: true,
    practices: [
      {
        id: 'pressure',
        title: 'Pressure points',
        line: 'Which parts of life are carrying the most this week?',
        minutes: 1,
        Component: PressurePoints,
        Glyph: GaugeGlyph,
      },
      {
        id: 'drift',
        title: 'The blind spot',
        line: 'Feeling safe and being safe aren\u2019t the same thing.',
        minutes: 1,
        Component: TheBlindSpot,
        Glyph: BlindspotGlyph,
      },
      words,
    ],
  },
  reclaim: {
    key: 'reclaim',
    label: 'Getting back up',
    counter: 'standing',
    inTheMoment: true,
    practices: [
      {
        id: 'stands',
        title: 'What still stands',
        line: 'The slip took a day. Tap what it didn\u2019t take.',
        minutes: 1,
        Component: WhatStillStands,
        Glyph: StandsGlyph,
      },
      {
        id: 'kinder',
        title: 'The kinder voice',
        line: 'What you\u2019d say to a friend — said to yourself.',
        minutes: 2,
        Component: KinderVoice,
        Glyph: KinderGlyph,
      },
      words,
    ],
  },
}

export const modeFor = (freeState) => MODES[freeState] || MODES.notice