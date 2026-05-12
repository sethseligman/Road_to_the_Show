import type { NarrateGameState, NarratePitcher, NarratePlayerSlice } from "@/lib/narrator/types";
import type { Player, Scene } from "@/types/game";

function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function fakePitcher(sceneId: string): NarratePitcher {
  const first = [
    "Jordan",
    "Riley",
    "Casey",
    "Morgan",
    "Devin",
    "Alex",
    "Jamie",
    "Taylor",
  ];
  const last = [
    "Nguyen",
    "Patel",
    "Hernandez",
    "Okonkwo",
    "Silva",
    "Chen",
    "Brooks",
    "Reyes",
  ];
  const styles = [
    "fastball-heavy mix",
    "nasty breaking stuff",
    "changes speeds every pitch",
  ];
  const h = hashSeed(sceneId);
  return {
    name: `${first[h % first.length]} ${last[(h >> 3) % last.length]}`,
    throws: styles[(h >> 7) % styles.length],
  };
}

function archetypeLabel(a: Player["archetype"]): string {
  switch (a) {
    case "power":
      return "power_hitter";
    case "contact":
      return "contact_hitter";
    case "speed":
      return "speedster";
    case "defense":
      return "defensive_wizard";
    case "ace":
      return "ace_pitcher";
    default: {
      const _e: never = a;
      return _e;
    }
  }
}

function toGameState(scene: Scene): NarrateGameState {
  return {
    inning: scene.gameState.inning,
    outs: scene.gameState.outs,
    runners: scene.gameState.runners,
    score: scene.gameState.score,
    stakes: scene.gameState.stakes,
    headline: scene.gameState.headline,
  };
}

function toPlayerSlice(player: Player): NarratePlayerSlice {
  return {
    name: player.name.split(/\s+/)[0] ?? player.name,
    archetype: archetypeLabel(player.archetype),
    confidence: player.stats.confidence,
    favoriteTeam: player.favoriteTeam,
    position: player.position,
    recentStreak:
      player.season.gamesPlayed > 0
        ? `${player.season.hits}-for-${Math.max(1, player.season.atBats)} in your last few games`
        : "opening day energy",
  };
}

export function buildSetupRequest(
  scene: Scene,
  player: Player,
  templateId: string,
): import("@/lib/narrator/types").NarrateSetupPayload {
  const pitcher =
    scene.type === "at_bat" || scene.type === "defense"
      ? fakePitcher(scene.id)
      : undefined;
  return {
    phase: "setup",
    scene_type: scene.type,
    stakes: scene.gameState.stakes,
    templateId,
    game_state: toGameState(scene),
    player: toPlayerSlice(player),
    pitcher,
    choices: scene.choices.map((c) => c.label),
  };
}

export function buildOutcomeRequest(
  scene: Scene,
  templateId: string,
  chosenLabel: string,
  result: Scene["outcome"],
): import("@/lib/narrator/types").NarrateOutcomePayload {
  if (!result) {
    throw new Error("Outcome required for outcome narration");
  }
  const deltas: Record<string, number> = {};
  (Object.keys(result.statDeltas) as (keyof Player["stats"])[]).forEach((k) => {
    const v = result.statDeltas[k];
    if (v != null) deltas[k] = v;
  });
  return {
    phase: "outcome",
    scene_type: scene.type,
    stakes: scene.gameState.stakes,
    templateId,
    scene_id: scene.id,
    chosen_label: chosenLabel,
    result: {
      outcome_type: result.outcomeType,
      runs_scored: result.runsScored,
      stat_deltas: deltas,
    },
  };
}
