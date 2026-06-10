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
// Only modes with a non-empty `practices` list run on the new HomeShell;
// HomeRouter keeps the rest on their existing homes until migrated.
// ===================================================================
import TheHardHour from './practices/TheHardHour'
import InsteadI from './practices/InsteadI'
import JournalTile from '../freeHome/JournalTile'

export const MODES = {
  notice: {
    key: 'notice',
    label: 'A closer look',
    counter: 'tending',
    inTheMoment: false,
    practices: [],
  },
  reflect: {
    key: 'reflect',
    label: 'Weighing it up',
    counter: 'tending',
    inTheMoment: false,
    practices: [],
  },
  commit: {
    key: 'commit',
    label: 'Getting ready',
    counter: 'tending',
    inTheMoment: false,
    practices: [],
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
      },
      {
        id: 'instead',
        title: 'Instead, I…',
        line: 'What did you do with the time it used to take?',
        minutes: 2,
        Component: InsteadI,
      },
      {
        id: 'words',
        title: 'In your words',
        line: 'A few lines about today, gently prompted.',
        minutes: 3,
        Component: JournalTile,
      },
    ],
  },
  build: {
    key: 'build',
    label: 'Staying steady',
    counter: 'days',
    inTheMoment: true,
    practices: [],
  },
  reclaim: {
    key: 'reclaim',
    label: 'Getting back up',
    counter: 'standing',
    inTheMoment: true,
    practices: [],
  },
}

export const modeFor = (freeState) => MODES[freeState] || MODES.notice