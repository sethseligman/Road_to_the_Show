import type { Outcome, Scene } from "@/types/game";

export type RunningScore = { us: number; them: number };

export type BoxTally = {
  hitsUs: number;
  hitsThem: number;
  errorsUs: number;
  errorsThem: number;
};

export function applyOutcomeToScore(
  sceneType: Scene["type"],
  outcome: Outcome,
  score: RunningScore,
): RunningScore {
  const r = outcome.runsScored;
  if (r <= 0) return score;
  if (sceneType === "defense") {
    return { us: score.us, them: score.them + r };
  }
  if (sceneType === "at_bat" || sceneType === "baserun") {
    return { us: score.us + r, them: score.them };
  }
  return score;
}

export function tallyBoxAfterOutcome(
  sceneType: Scene["type"],
  outcome: Outcome,
  tally: BoxTally,
): BoxTally {
  const next = { ...tally };
  const hitTypes = new Set(["single", "double", "triple", "hr"]);
  if (sceneType === "at_bat" && hitTypes.has(outcome.outcomeType)) {
    next.hitsUs += 1;
  }
  if (sceneType === "defense") {
    if (outcome.outcomeType === "single" || outcome.outcomeType === "error") {
      next.hitsThem += 1;
    }
    if (outcome.outcomeType === "error") {
      next.errorsUs += 1;
    }
  }
  return next;
}
