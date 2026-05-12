import type { Outcome, Player, Scene, SeasonStats } from "@/types/game";

export type SessionAccum = {
  atBats: number;
  hits: number;
  hr: number;
  rbi: number;
  runs: number;
  sb: number;
  strikeouts: number;
};

const emptySession: SessionAccum = {
  atBats: 0,
  hits: 0,
  hr: 0,
  rbi: 0,
  runs: 0,
  sb: 0,
  strikeouts: 0,
};

export function createEmptySession(): SessionAccum {
  return { ...emptySession };
}

const hitTypes = new Set<string>(["single", "double", "triple", "hr"]);

export function accumulateFromOutcome(
  acc: SessionAccum,
  sceneType: Scene["type"],
  outcome: Outcome,
): SessionAccum {
  const next = { ...acc };
  if (sceneType === "at_bat") {
    next.atBats += 1;
    if (hitTypes.has(outcome.outcomeType)) next.hits += 1;
    if (outcome.outcomeType === "hr") next.hr += 1;
    if (outcome.outcomeType === "strikeout") next.strikeouts += 1;
    if (outcome.outcomeType === "error") {
      next.hits += 1;
    }
    next.rbi += outcome.runsScored;
    next.runs += outcome.runsScored;
  }
  if (sceneType === "baserun" && outcome.outcomeType === "double") {
    next.sb += 1;
    next.runs += outcome.runsScored;
  }
  if (sceneType === "baserun" && outcome.outcomeType === "out") {
    next.runs += outcome.runsScored;
  }
  return next;
}

function addSeason(
  base: SeasonStats,
  add: SessionAccum & { gamesPlayed: number },
): SeasonStats {
  return {
    gamesPlayed: base.gamesPlayed + add.gamesPlayed,
    atBats: base.atBats + add.atBats,
    hits: base.hits + add.hits,
    hr: base.hr + add.hr,
    rbi: base.rbi + add.rbi,
    runs: base.runs + add.runs,
    sb: base.sb + add.sb,
    inningsPitched: base.inningsPitched,
    strikeouts: base.strikeouts + add.strikeouts,
    wins: base.wins,
    saves: base.saves,
    losses: base.losses,
    earnedRuns: base.earnedRuns,
  };
}

export function applySessionToPlayer(
  player: Player,
  session: SessionAccum,
): Player {
  const pack = { ...session, gamesPlayed: 1 };
  const season = addSeason(player.season, pack);
  const career = addSeason(player.career, pack);
  return { ...player, season, career };
}
