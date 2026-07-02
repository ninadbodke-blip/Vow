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
// The home's practice area, per mode:
//   daily    — that mode's OWN permanent Today card (unique each mode)
//   JOURNAL  — "In your words", its own long bar (shared)
//   tools[3] — the mode's three bespoke tools, under the Tools header
// ===================================================================
import CatchItInTheAct from './practices/CatchItInTheAct'
import BothTrueToday from './practices/BothTrueToday'
import TheWorryAnswered from './practices/TheWorryAnswered'
import TheHardHour from './practices/TheHardHour'
import TodaysDeposit from './practices/TodaysDeposit'
import TodaysShield from './practices/TodaysShield'
import InsteadI from './practices/InsteadI'
import RenewYourVow from './practices/RenewYourVow'
import SleepAndWeather from './practices/SleepAndWeather'
import YourAutopilot from './practices/YourAutopilot'
import GivesAndTakes from './practices/GivesAndTakes'
import WhereItHappens from './practices/WhereItHappens'
import TheScales from './practices/TheScales'
import WhatItCosts from './practices/WhatItCosts'
import TheExcuses from './practices/TheExcuses'
import VowAndDay from './practices/VowAndDay'
import TheRehearsal from './practices/TheRehearsal'
import HowReady from './practices/HowReady'
import PressurePoints from './practices/PressurePoints'
import TheBlindSpot from './practices/TheBlindSpot'
import WeeksProof from './practices/WeeksProof'
import WhatStillStands from './practices/WhatStillStands'
import KinderVoice from './practices/KinderVoice'
import WhatItWasReachingFor from './practices/WhatItWasReachingFor'
import JournalTile from '../freeHome/JournalTile'
import {
  WordsGlyph,
  CatchGlyph, GapGlyph, WorryGlyph, HardHourGlyph, DepositGlyph, ShieldGlyph,
  InsteadGlyph, RenewGlyph, VitalsGlyph,
  AutopilotGlyph, LedgerGlyph, PinGlyph,
  ScalesGlyph, CostGlyph, ExcuseGlyph,
  VowDayGlyph, PathGlyph, ReadyGlyph,
  GaugeGlyph, BlindspotGlyph, ProofGlyph,
  StandsGlyph, KinderGlyph, ReachGlyph,
} from './glyphs'

// The journal — its own long bar beneath each mode's daily.
export const JOURNAL = {
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
    daily: {
      id: 'catch',
      title: 'Catch it in the act',
      line: 'Every time you feel like doing it, tap once. Each catch lights a firefly.',
      minutes: 1,
      Component: CatchItInTheAct,
      Glyph: CatchGlyph,
    },
    tools: [
      {
        id: 'autopilot',
        title: 'Without thinking',
        line: 'Log each time it ran on its own. The dial remembers, and the pattern shows.',
        minutes: 2,
        Component: YourAutopilot,
        Glyph: AutopilotGlyph,
      },
      {
        id: 'ledger',
        title: 'What it gives, what it takes',
        line: 'Each time: what it promised, what it left. The book keeps the score.',
        minutes: 2,
        Component: GivesAndTakes,
        Glyph: LedgerGlyph,
      },
      {
        id: 'context',
        title: 'Where it happens',
        line: 'Pin each moment on the map. The pattern has an address.',
        minutes: 1,
        Component: WhereItHappens,
        Glyph: PinGlyph,
      },
    ],
  },
  reflect: {
    key: 'reflect',
    label: 'Weighing it up',
    counter: 'tending',
    inTheMoment: false,
    daily: {
      id: 'gap',
      title: 'What matters vs what I did',
      line: 'One thing you care about, what you did today — and the gap, drawn.',
      minutes: 2,
      Component: BothTrueToday,
      Glyph: GapGlyph,
    },
    tools: [
      {
        id: 'lean',
        title: 'The scales',
        line: 'Which way do you lean today? The beam tips as you do.',
        minutes: 1,
        Component: TheScales,
        Glyph: ScalesGlyph,
      },
      {
        id: 'cost',
        title: 'What it costs',
        line: 'Two small numbers — and the meter runs from the day you measure.',
        minutes: 2,
        Component: WhatItCosts,
        Glyph: CostGlyph,
      },
      {
        id: 'excuses',
        title: 'The excuses',
        line: 'The lines it uses on you, tallied. Its favorites rise.',
        minutes: 2,
        Component: TheExcuses,
        Glyph: ExcuseGlyph,
      },
    ],
  },
  commit: {
    key: 'commit',
    label: 'Getting ready',
    counter: 'tending',
    inTheMoment: false,
    daily: {
      id: 'worry',
      title: 'The worry, answered',
      line: 'Today\u2019s likeliest threat, tethered to a plan while calm.',
      minutes: 2,
      Component: TheWorryAnswered,
      Glyph: WorryGlyph,
    },
    tools: [
      {
        id: 'vow_day',
        title: 'Your vow',
        line: 'One honest line, written to the 11 p.m. version of you.',
        minutes: 2,
        Component: VowAndDay,
        Glyph: VowDayGlyph,
      },
      {
        id: 'rehearsal',
        title: 'The rehearsal',
        line: 'One scene a day, answered before it arrives. Each one lays a stone.',
        minutes: 2,
        Component: TheRehearsal,
        Glyph: PathGlyph,
      },
      {
        id: 'ready',
        title: 'How ready, honestly',
        line: 'A number that moves — the vessel fills, the line remembers.',
        minutes: 1,
        Component: HowReady,
        Glyph: ReadyGlyph,
      },
    ],
  },
  endure: {
    key: 'endure',
    label: 'Early days',
    counter: 'days',
    inTheMoment: true,
    daily: {
      id: 'hard_hour',
      title: 'The hard hour',
      line: 'Name tonight\u2019s hardest hour — and guard it in advance.',
      minutes: 1,
      Component: TheHardHour,
      Glyph: HardHourGlyph,
    },
    tools: [
      {
        id: 'instead',
        title: 'Instead, I…',
        line: 'What did you do with the time it used to take?',
        minutes: 2,
        Component: InsteadI,
        Glyph: InsteadGlyph,
      },
      {
        id: 'renew',
        title: 'Renew your vow',
        line: 'Yesterday\u2019s reason, said again today.',
        minutes: 1,
        Component: RenewYourVow,
        Glyph: RenewGlyph,
      },
      {
        id: 'vitals',
        title: 'The basics',
        line: 'Sleep, food, movement — the three things that decide how hard tonight feels.',
        minutes: 1,
        Component: SleepAndWeather,
        Glyph: VitalsGlyph,
      },
    ],
  },
  build: {
    key: 'build',
    label: 'Staying steady',
    counter: 'days',
    inTheMoment: true,
    daily: {
      id: 'deposit',
      title: 'Where your hours go',
      line: 'Recovery hands back about 14 hours a week. Deploy every one.',
      minutes: 2,
      Component: TodaysDeposit,
      Glyph: DepositGlyph,
    },
    tools: [
      {
        id: 'pressure',
        title: 'The three pillars',
        line: 'Sleep, movement, silence \u2014 hold the structure under heavy weeks.',
        minutes: 2,
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
      {
        id: 'proof',
        title: 'The week\u2019s proof',
        line: 'One thing you did instead — entered into evidence.',
        minutes: 2,
        Component: WeeksProof,
        Glyph: ProofGlyph,
      },
    ],
  },
  reclaim: {
    key: 'reclaim',
    label: 'Getting back up',
    counter: 'standing',
    inTheMoment: true,
    daily: {
      id: 'shield',
      title: 'Today\u2019s shield',
      line: 'One small promise, for one short window.',
      minutes: 1,
      Component: TodaysShield,
      Glyph: ShieldGlyph,
    },
    tools: [
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
      {
        id: 'reach',
        title: 'What it was reaching for',
        line: 'The need under the slip, and one other way to meet it.',
        minutes: 2,
        Component: WhatItWasReachingFor,
        Glyph: ReachGlyph,
      },
    ],
  },
}

export const modeFor = (freeState) => MODES[freeState] || MODES.notice