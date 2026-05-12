import type { Choice, Outcome, Player, Scene } from "@/types/game";

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function weightedStatBlend(
  stats: Player["stats"],
  weights: Choice["weights"],
): number {
  let num = 0;
  let den = 0;
  (Object.keys(weights) as (keyof Player["stats"])[]).forEach((k) => {
    const w = weights[k];
    if (w == null || w === 0) return;
    num += stats[k] * w;
    den += Math.abs(w);
  });
  if (den === 0) return 50;
  return num / den;
}

function rollAtBat(
  stats: Player["stats"],
  choice: Choice,
  rng: () => number,
): Outcome {
  const blend = weightedStatBlend(stats, choice.weights);
  const conf = stats.confidence;
  const pHit = clamp(0.12 + blend * 0.004 + (conf - 50) * 0.0015, 0.08, 0.52);
  const r = rng();

  if (r < pHit) {
    const r2 = rng();
    const pow = stats.power / 100;
    const con = stats.contact / 100;
    if (r2 < pow * 0.12) {
      return {
        outcomeType: "hr",
        runsScored: rng() < 0.55 ? 2 : 3,
        statDeltas: { power: 2, confidence: 2, contact: 1 },
      };
    }
    if (r2 < pow * 0.12 + con * 0.1) {
      return {
        outcomeType: "triple",
        runsScored: rng() < 0.4 ? 1 : 2,
        statDeltas: { speed: 2, contact: 1, confidence: 1 },
      };
    }
    if (r2 < pow * 0.12 + con * 0.1 + 0.18) {
      return {
        outcomeType: "double",
        runsScored: rng() < 0.65 ? 1 : 2,
        statDeltas: { contact: 2, power: 1, confidence: 1 },
      };
    }
    return {
      outcomeType: "single",
      runsScored: rng() < 0.45 ? 1 : 0,
      statDeltas: { contact: 1, eye: 1, confidence: 1 },
    };
  }

  if (r < pHit + 0.11) {
    return {
      outcomeType: "walk",
      runsScored: rng() < 0.25 ? 1 : 0,
      statDeltas: { eye: 2, confidence: 1 },
    };
  }

  if (r < pHit + 0.11 + 0.04) {
    return {
      outcomeType: "error",
      runsScored: rng() < 0.5 ? 1 : 2,
      statDeltas: { speed: 1, confidence: -1 },
    };
  }

  if (rng() < 0.48) {
    return {
      outcomeType: "strikeout",
      runsScored: 0,
      statDeltas: { confidence: -2, eye: 1 },
    };
  }
  return {
    outcomeType: "out",
    runsScored: 0,
    statDeltas: { contact: 1, confidence: -1 },
  };
}

function rollDefense(
  stats: Player["stats"],
  choice: Choice,
  rng: () => number,
): Outcome {
  const blend = weightedStatBlend(stats, choice.weights);
  const pSave = clamp(0.28 + blend * 0.004 + (stats.confidence - 50) * 0.001, 0.15, 0.62);
  if (rng() < pSave) {
    return {
      outcomeType: "out",
      runsScored: 0,
      statDeltas: { glove: 2, arm: 1, confidence: 2 },
    };
  }
  if (rng() < 0.35) {
    return {
      outcomeType: "error",
      runsScored: rng() < 0.5 ? 1 : 2,
      statDeltas: { glove: -1, confidence: -2, arm: 1 },
    };
  }
  return {
    outcomeType: "single",
    runsScored: 1,
    statDeltas: { glove: 1, confidence: -1 },
  };
}

function rollBaserun(
  stats: Player["stats"],
  choice: Choice,
  rng: () => number,
): Outcome {
  const blend = weightedStatBlend(stats, choice.weights);
  const pSafe = clamp(0.22 + blend * 0.005 + (stats.speed - 50) * 0.002, 0.12, 0.68);
  if (rng() < pSafe) {
    return {
      outcomeType: "double",
      runsScored: 0,
      statDeltas: { speed: 2, confidence: 2, eye: 1 },
    };
  }
  return {
    outcomeType: "out",
    runsScored: 0,
    statDeltas: { speed: 1, confidence: -2, eye: 1 },
  };
}

function rollDugout(
  stats: Player["stats"],
  choice: Choice,
  rng: () => number,
): Outcome {
  const blend = weightedStatBlend(stats, choice.weights);
  const lift = clamp(Math.round(2 + blend * 0.03 + rng() * 2), 2, 5);
  return {
    outcomeType: "walk",
    runsScored: 0,
    statDeltas: { confidence: lift },
  };
}

/**
 * Resolves a scene outcome from stats, choice weights, scene type, and RNG (inject for tests).
 */
export function rollOutcome(
  sceneType: Scene["type"],
  stats: Player["stats"],
  choice: Choice,
  rng: () => number,
): Outcome {
  switch (sceneType) {
    case "at_bat":
      return rollAtBat(stats, choice, rng);
    case "defense":
      return rollDefense(stats, choice, rng);
    case "baserun":
      return rollBaserun(stats, choice, rng);
    case "dugout":
      return rollDugout(stats, choice, rng);
  }
}
