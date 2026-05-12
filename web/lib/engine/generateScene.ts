import type { Choice, GameState, Player, Scene } from "@/types/game";
import { createRng } from "@/lib/engine/rng";
import type { M1SceneTemplate } from "@/lib/engine/m1Templates";

function buildAtBatChoices(): Choice[] {
  return [
    {
      label: "Swing for the fences",
      weights: { power: 2, contact: 0.5, confidence: 0.5 },
    },
    {
      label: "Look for a pitch you can drive",
      weights: { contact: 2, eye: 1.2, power: 0.4 },
    },
    {
      label: "Take the first pitch",
      weights: { eye: 2, confidence: 0.3, contact: 0.4 },
    },
    {
      label: "Choke up and battle",
      weights: { contact: 1, eye: 1.5, confidence: 1 },
    },
  ];
}

function buildDefenseChoices(position: Player["position"]): Choice[] {
  const armGlove: Choice[] = [
    {
      label: "Charge and make the throw home",
      weights: { glove: 2, arm: 1.5, confidence: 0.5 },
    },
    {
      label: "Hang back and play the hop safe",
      weights: { glove: 1.2, eye: 0.5, confidence: 0.8 },
    },
    {
      label: "Sell out for the diving stop",
      weights: { glove: 1.8, speed: 1, confidence: 0.6 },
    },
  ];
  if (position === "P") {
    return [
      ...armGlove,
      {
        label: "Call for the cutoff and reset",
        weights: { arm: 1, confidence: 1.2, eye: 0.8 },
      },
    ];
  }
  return armGlove;
}

function buildBaserunChoices(): Choice[] {
  return [
    {
      label: "Take off on first move",
      weights: { speed: 2, confidence: 0.8, eye: 0.6 },
    },
    {
      label: "Delay steal — sell the pickoff first",
      weights: { eye: 2, speed: 1, confidence: 0.5 },
    },
    {
      label: "Stay put and trust the next hitter",
      weights: { eye: 1.2, confidence: 1.2, contact: 0.3 },
    },
  ];
}

function buildDugoutChoices(player: Player): Choice[] {
  const team = player.favoriteTeam;
  return [
    {
      label: "Lock in like it’s a big-league game",
      weights: { confidence: 2, eye: 0.5 },
    },
    {
      label: `Picture wearing ${team} colors someday`,
      weights: { confidence: 2.2, power: 0.2 },
    },
    {
      label: "Joke with a teammate to loosen up",
      weights: { confidence: 1.5, contact: 0.3 },
    },
  ];
}

function choicesForTemplate(template: M1SceneTemplate, player: Player): Choice[] {
  switch (template.type) {
    case "at_bat":
      return buildAtBatChoices();
    case "defense":
      return buildDefenseChoices(player.position);
    case "baserun":
      return buildBaserunChoices();
    case "dugout":
      return buildDugoutChoices(player);
  }
}

function shuffleInPlace<T>(items: T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = a[i];
    a[i] = a[j]!;
    a[j] = t!;
  }
  return a;
}

/**
 * Picks scene metadata from the template and builds the choice array with stat weights.
 * RNG is seeded so choice order stays deterministic for a given seed string.
 */
export function generateScene(
  template: M1SceneTemplate,
  player: Player,
  gameId: string,
  sceneIndex: number,
): Scene {
  const seed = `${gameId}:${template.id}:${sceneIndex}:${player.id}`;
  const rng = createRng(seed);

  const gameState: GameState = {
    headline: "",
    inning: template.inning,
    outs: template.outs,
    runners: [...template.runners],
    score: { ...template.baseScore },
    stakes: template.stakes,
  };
  gameState.headline = template.buildHeadline(gameState);

  return {
    id: template.id,
    type: template.type,
    gameState,
    choices: shuffleInPlace(choicesForTemplate(template, player), rng),
    setupNarration: template.setupNarration,
  };
}
