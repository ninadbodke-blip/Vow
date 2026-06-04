// =====================================================================
// VOW STAGE CHECK — Scoring & Override Rules
// =====================================================================
// Stage codes:
//   PC = Pre-Contemplation -> 'notice'
//   C  = Contemplation     -> 'reflect'
//   P  = Preparation       -> 'commit'
//   A  = Action            -> 'endure'
//   M  = Maintenance       -> 'build'
//   R  = Recycling         -> 'reclaim'  (NEVER assigned by the assessment)
//
// IMPORTANT: The Stage Check never allocates a user to Reclaim (R).
// Reclaim is a self-elected stage — a user opens it manually, by choice,
// if/when they slip, via the Vow Path. So R carries no scoring weight,
// is absent from the tie-break, and has no override. The "recent slip"
// signal (Q6) is instead routed into the active stages (Endure/Commit),
// which is where someone re-engaging after a slip actually belongs.
// =====================================================================

export const STAGE_CODE_TO_SLUG = {
  PC: 'notice',
  C: 'reflect',
  P: 'commit',
  A: 'endure',
  M: 'build',
  R: 'reclaim', // valid stage, but only reachable manually — never via scoring
};

export const SLUG_TO_STAGE_CODE = {
  notice: 'PC',
  reflect: 'C',
  commit: 'P',
  endure: 'A',
  build: 'M',
  reclaim: 'R',
};

// Weighted scoring. Reclaim (R) is intentionally excluded from every row.
export const SCORING_MATRIX = {
  Q1:  { PC: +2, C: -1, P:  0, A:  0, M:  0 },
  Q2:  { PC: -2, C: +2, P: +1, A:  0, M:  0 },
  Q3:  { PC:  0, C: +1, P: +2, A:  0, M:  0 },
  Q4:  { PC:  0, C:  0, P:  0, A: +2, M:  0 },
  Q5:  { PC:  0, C:  0, P:  0, A:  0, M: +2 },
  Q6:  { PC:  0, C:  0, P: +1, A: +2, M: -1 }, // slip -> active re-engagement, not Reclaim
  Q7:  { PC: -2, C: +2, P: +1, A:  0, M:  0 },
  Q8:  { PC: +2, C: -1, P:  0, A:  0, M:  0 },
  Q9:  { PC:  0, C: +2, P:  0, A:  0, M:  0 },
  Q10: { PC: -1, C:  0, P: +2, A:  0, M:  0 },
  Q11: { PC:  0, C:  0, P:  0, A: +2, M:  0 },
  Q12: { PC:  0, C:  0, P:  0, A:  0, M: +2 },
  Q13: { PC: -1, C: +1, P: +1, A: +1, M: +1 },
  Q14: { PC:  0, C: +2, P: +1, A:  0, M:  0 },
  Q15: { PC:  0, C:  0, P: +1, A: +2, M:  0 },
};

// Tie-break favors the more-advanced stage. R is absent by design.
const TIE_BREAK_ORDER = ['M', 'A', 'P', 'C', 'PC'];

export function scoreAssessment(responses) {
  // Reclaim is never an outcome here. Only two overrides remain, neither
  // of which routes to Reclaim; the old "recent slip -> Reclaim" rule is gone.

  // Rule 2: Currently abstaining + early -> Endure
  if (responses.Q4 >= 4 && responses.Q5 <= 2) {
    return finalize(computeScores(responses), 'rule_2_early_action', 'A');
  }

  // Rule 3: Long-term abstinence -> Build
  if (responses.Q5 >= 4 && responses.Q12 >= 4 && responses.Q4 <= 3) {
    return finalize(computeScores(responses), 'rule_3_long_maintenance', 'M');
  }

  // No override fired — use weighted scoring
  const scores = computeScores(responses);
  const winner = pickHighestStage(scores);
  return finalize(scores, null, winner);
}

function computeScores(responses) {
  const scores = { PC: 0, C: 0, P: 0, A: 0, M: 0 }; // R intentionally excluded
  for (const [qId, answer] of Object.entries(responses)) {
    const weights = SCORING_MATRIX[qId];
    if (!weights) continue;
    for (const stage of Object.keys(scores)) {
      scores[stage] += answer * (weights[stage] || 0);
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
