import { useMemo } from "react";
import type { Scene } from "@/types/game";
import type { OccupiedBase } from "@/lib/game/diamondVisual";

export type DiamondCount = { balls: number; strikes: number };

/** Everything the diamond + scoreboard need to render from engine + live field state. */
export type DiamondRenderable = {
  runners: OccupiedBase[];
  outs: number;
  balls: number;
  strikes: number;
  us: number;
  them: number;
  inning: string;
  headline: string;
};

export function useDiamondRenderable(
  scene: Scene | null,
  score: { us: number; them: number },
  liveRunners: OccupiedBase[],
  liveOuts: number,
  count: DiamondCount,
): DiamondRenderable | null {
  return useMemo(() => {
    if (!scene) return null;
    return {
      runners: liveRunners,
      outs: liveOuts,
      balls: count.balls,
      strikes: count.strikes,
      us: score.us,
      them: score.them,
      inning: scene.gameState.inning,
      headline: scene.gameState.headline,
    };
  }, [scene, score.us, score.them, liveRunners, liveOuts, count]);
}
