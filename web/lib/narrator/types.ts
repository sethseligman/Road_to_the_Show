import type { GameState, Outcome, Scene } from "@/types/game";

export type NarratePhase = "setup" | "outcome";

/** Serializable game state for the narrator (engine-owned facts only). */
export type NarrateGameState = {
  inning: string;
  outs: number;
  runners: GameState["runners"];
  score: { us: number; them: number };
  stakes: GameState["stakes"];
  headline?: string;
};

export type NarratePlayerSlice = {
  name: string;
  archetype: string;
  confidence: number;
  favoriteTeam: string;
  position: string;
  recentStreak?: string;
};

export type NarratePitcher = {
  name: string;
  throws: string;
};

export type NarrateSetupPayload = {
  phase: "setup";
  scene_type: Scene["type"];
  stakes: GameState["stakes"];
  /** Used server-side to recover hardcoded fallback copy. */
  templateId: string;
  game_state: NarrateGameState;
  player: NarratePlayerSlice;
  pitcher?: NarratePitcher;
  choices: string[];
};

export type NarrateOutcomePayload = {
  phase: "outcome";
  scene_type: Scene["type"];
  stakes: GameState["stakes"];
  templateId: string;
  scene_id: string;
  chosen_label: string;
  result: {
    outcome_type: Outcome["outcomeType"];
    runs_scored: number;
    stat_deltas: Record<string, number>;
  };
};

export type NarrateRequest = NarrateSetupPayload | NarrateOutcomePayload;

export type NarrateResponse = {
  prose: string;
  source: "cache" | "ai" | "fallback";
};
