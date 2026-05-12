import type { Archetype, CareerStats, Player, SeasonStats } from "@/types/game";

const EMPTY_SEASON: SeasonStats = {
  gamesPlayed: 0,
  atBats: 0,
  hits: 0,
  hr: 0,
  rbi: 0,
  sb: 0,
  runs: 0,
  inningsPitched: 0,
  strikeouts: 0,
  wins: 0,
  saves: 0,
  losses: 0,
  earnedRuns: 0,
};

function cloneSeason(): SeasonStats {
  return { ...EMPTY_SEASON };
}

function startingStats(archetype: Archetype): Player["stats"] {
  const base = {
    contact: 52,
    power: 52,
    speed: 52,
    arm: 52,
    eye: 52,
    glove: 52,
    confidence: 58,
  };
  switch (archetype) {
    case "power":
      return { ...base, contact: 56, power: 74, eye: 50, confidence: 60 };
    case "contact":
      return { ...base, contact: 74, power: 48, eye: 60, confidence: 58 };
    case "speed":
      return { ...base, speed: 76, contact: 56, glove: 54, confidence: 60 };
    case "defense":
      return { ...base, glove: 76, arm: 68, speed: 56, confidence: 56 };
    case "ace":
      return { ...base, arm: 78, glove: 58, contact: 50, confidence: 60 };
    default: {
      const _e: never = archetype;
      return _e;
    }
  }
}

export type NewPlayerInput = Pick<
  Player,
  "name" | "jersey" | "position" | "archetype" | "favoriteTeam"
>;

/** Title-case each word so stored names read cleanly (e.g. "s" → "S"). */
export function normalizePlayerName(name: string): string {
  const t = name.trim();
  if (!t) return t;
  return t
    .split(/\s+/)
    .map((w) =>
      w.length === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join(" ");
}

export function normalizePlayerForStorage(player: Player): Player {
  return { ...player, name: normalizePlayerName(player.name) };
}

export function createPlayer(input: NewPlayerInput): Player {
  const season = cloneSeason();
  const career: CareerStats = cloneSeason();
  return {
    id: crypto.randomUUID(),
    name: normalizePlayerName(input.name),
    jersey: input.jersey,
    position: input.position,
    archetype: input.archetype,
    favoriteTeam: input.favoriteTeam,
    level: "little_league",
    stats: startingStats(input.archetype),
    season,
    career,
  };
}

export function clampStat(n: number): number {
  return Math.min(100, Math.max(1, Math.round(n)));
}

export function applyStatDeltas(
  stats: Player["stats"],
  deltas: Partial<Player["stats"]>,
): Player["stats"] {
  const next = { ...stats };
  (Object.keys(deltas) as (keyof Player["stats"])[]).forEach((k) => {
    const d = deltas[k];
    if (d == null) return;
    next[k] = clampStat(next[k] + d);
  });
  return next;
}
