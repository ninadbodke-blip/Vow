// =====================================================================
// VOW STAGE CHECK — Scoring & Override Rules
// =====================================================================
// Stage codes:
//   PC = Pre-Contemplation -> 'notice'
//   C  = Contemplation     -> 'reflect'
//   P  = Preparation       -> 'commit'
//   A  = Action            -> 'endure'
//   M  = Maintenance       -> 'build'
//   R  = Recycling         -> 'reclaim'
// =====================================================================

export const STAGE_CODE_TO_SLUG = {
  PC: 'notice',
  C: 'reflect',
  P: 'commit',
  A: 'endure',
  M: 'build',
  R: 'reclaim',
};

export const SLUG_TO_STAGE_CODE = {
  notice: 'PC',
  reflect: 'C',
  commit: 'P',
  endure: 'A',
  build: 'M',
  reclaim: 'R',
};

export const SCORING_MATRIX = {
  Q1:  { PC: +2, C: -1, P:  0, A:  0, M:  0, R:  0 },
  Q2:  { PC: -2, C: +2, P: +1, A:  0, M:  0, R:  0 },
  Q3:  { PC:  0, C: +1, P: +2, A:  0, M:  0, R:  0 },
  Q4:  { PC:  0, C:  0, P:  0, A: +2, M:  0, R: +1 },
  Q5:  { PC:  0, C:  0, P:  0, A:  0, M: +2, R:  0 },
  Q6:  { PC:  0, C:  0, P:  0, A:  0, M: -1, R: +3 },
  Q7:  { PC: -2, C: +2, P: +1, A:  0, M:  0, R: +1 },
  Q8:  { PC: +2, C: -1, P:  0, A:  0, M:  0, R:  0 },
  Q9:  { PC:  0, C: +2, P:  0, A:  0, M:  0, R: +1 },
  Q10: { PC: -1, C:  0, P: +2, A:  0, M:  0, R:  0 },
  Q11: { PC:  0, C:  0, P:  0, A: +2, M:  0, R: +1 },
  Q12: { PC:  0, C:  0, P:  0, A:  0, M: +2, R:  0 },
  Q13: { PC: -1, C: +1, P: +1, A: +1, M: +1, R:  0 },
  Q14: { PC:  0, C: +2, P: +1, A:  0, M:  0, R:  0 },
  Q15: { PC:  0, C:  0, P: +1, A: +2, M:  0, R: +1 },
};

const TIE_BREAK_ORDER = ['R', 'M', 'A', 'P', 'C', 'PC'];

export function scoreAssessment(responses) {
  const r = responses;
  let overrideTriggered = null;

  // Rule 1: Recent slip dominates -> Reclaim
  if (r.Q6 >= 4) {
    overrideTriggered = 'rule_1_recent_slip';
    return finalize(computeScores(responses), overrideTriggered, 'R');
  }

  // Rule 2: Currently abstaining + early -> Endure
  if (r.Q4 >= 4 && r.Q5 <= 2) {
    overrideTriggered = 'rule_2_early_action';
    return finalize(computeScores(responses), overrideTriggered, 'A');
  }

  // Rule 3: Long-term abstinence -> Build
  if (r.Q5 >= 4 && r.Q12 >= 4 && r.Q4 <= 3) {
    overrideTriggered = 'rule_3_long_maintenance';
    return finalize(computeScores(responses), overrideTriggered, 'M');
  }

  // No override fired — use weighted scoring
  const scores = computeScores(responses);
  const winner = pickHighestStage(scores);
  return finalize(scores, null, winner);
}

function computeScores(responses) {
  const scores = { PC: 0, C: 0, P: 0, A: 0, M: 0, R: 0 };
  for (const [qId, answer] of Object.entries(responses)) {
    const weights = SCORING_MATRIX[qId];
    if (!weights) continue;
    for (const stage of Object.keys(scores)) {
      scores[stage] += answer * weights[stage];
    }
  }
  return scores;
}

function pickHighestStage(scores) {
  let max = -Infinity;
  let winner = 'C'; // ultimate fallback
  for (const stage of TIE_BREAK_ORDER) {
    if (scores[stage] > max) {
      max = scores[stage];
      winner = stage;
    }
  }
  return winner;
}

function finalize(scores, overrideTriggered, stageCode) {
  return {
    scores,
    override_rule_triggered: overrideTriggered,
    assigned_stage_code: stageCode,
    assigned_stage_slug: STAGE_CODE_TO_SLUG[stageCode],
  };
}