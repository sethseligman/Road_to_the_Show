export type Position = "P" | "C" | "SS" | "OF";
export type Archetype = "power" | "contact" | "speed" | "defense" | "ace";
export type Level =
  | "little_league"
  | "travel"
  | "middle"
  | "high"
  | "college"
  | "pros";

export type SeasonStats = {
  gamesPlayed: number;
  atBats: number;
  hits: number;
  hr: number;
  rbi: number;
  sb: number;
  runs: number;
  inningsPitched: number;
  strikeouts: number;
  wins: number;
  saves: number;
  losses: number;
  earnedRuns: number;
};

export type CareerStats = SeasonStats;

export type Player = {
  id: string;
  name: string;
  jersey: number;
  position: Position;
  archetype: Archetype;
  favoriteTeam: string;
  level: Level;
  stats: {
    contact: number;
    power: number;
    speed: number;
    arm: number;
    eye: number;
    glove: number;
    confidence: number;
  };
  season: SeasonStats;
  career: CareerStats;
};

export type Game = {
  id: string;
  opponent: string;
  isRival: boolean;
  isPlayoff: boolean;
  stakes: "regular" | "rivalry" | "playoff" | "championship";
  scenes: Scene[];
  finalScore?: { us: number; them: number };
  played: boolean;
};

export type GameState = {
  /** Short headline for the scene card, e.g. "TOP 7TH — RIVALRY GAME" */
  headline: string;
  inning: string;
  outs: number;
  runners: ("1B" | "2B" | "3B")[];
  score: { us: number; them: number };
  stakes: Game["stakes"];
};

export type Scene = {
  id: string;
  type: "at_bat" | "defense" | "baserun" | "dugout";
  gameState: GameState;
  choices: Choice[];
  resolvedChoice?: number;
  outcome?: Outcome;
  setupNarration?: string;
  outcomeNarration?: string;
};

export type Choice = {
  label: string;
  weights: Partial<Record<keyof Player["stats"], number>>;
};

export type Outcome = {
  outcomeType:
    | "single"
    | "double"
    | "triple"
    | "hr"
    | "out"
    | "walk"
    | "strikeout"
    | "error";
  runsScored: number;
  statDeltas: Partial<Player["stats"]>;
};
