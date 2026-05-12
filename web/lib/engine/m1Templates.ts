import type { GameState, Scene } from "@/types/game";

export type M1SceneTemplate = {
  id: string;
  type: Scene["type"];
  buildHeadline: (gs: GameState) => string;
  baseScore: { us: number; them: number };
  inning: string;
  outs: number;
  runners: GameState["runners"];
  stakes: GameState["stakes"];
  setupNarration: string;
  /** Keys include Outcome.outcomeType strings plus `default`. */
  outcomeLines: Record<string, string> & { default: string };
};

const headlines: Record<GameState["stakes"], string> = {
  regular: "REGULAR SEASON",
  rivalry: "RIVALRY GAME",
  playoff: "PLAYOFFS",
  championship: "CHAMPIONSHIP",
};

function stakeLabel(stakes: GameState["stakes"]): string {
  return headlines[stakes];
}

export const M1_SCENE_TEMPLATES: M1SceneTemplate[] = [
  {
    id: "m1-s1",
    type: "at_bat",
    buildHeadline: (gs) => `${gs.inning} — ${stakeLabel(gs.stakes)}`,
    baseScore: { us: 0, them: 0 },
    inning: "TOP 2ND",
    outs: 1,
    runners: ["2B"],
    stakes: "regular",
    setupNarration:
      "The park is buzzing for the first big moment of the day. You dig in with a runner dancing off second and one away. The pitcher winds and fires — the crowd leans in.",
    outcomeLines: {
      hr: "CRACK! You turn on it and the ball sails over the center-field fence! The runner scores and the dugout goes wild.",
      triple:
        "You barrel it into the right-center gap! Wheels turning, you slide into third as the run scores standing up.",
      double:
        "Line drive to center — you cruise into second and the tying run crosses the plate!",
      single:
        "Sharp grounder through the right side! You beat the throw and drive in a run.",
      walk: "You spoil two close pitches, then take ball four. The runner advances and the inning stays alive.",
      error:
        "Chaos on the infield — a tough hop eats up the shortstop. Everyone’s safe and a run comes home.",
      strikeout:
        "The heater blows by you on 3-2. You slam your bat in the dirt, then jog back to the dugout.",
      out: "You lift one to shallow left — caught. The runner tags but stays put.",
      default: "The play ends and both teams reset for the next pitch.",
    },
  },
  {
    id: "m1-s2",
    type: "defense",
    buildHeadline: (gs) => `${gs.inning} — ${stakeLabel(gs.stakes)}`,
    baseScore: { us: 1, them: 1 },
    inning: "BOT 3RD",
    outs: 1,
    runners: ["3B"],
    stakes: "regular",
    setupNarration:
      "Runner on third, one out, and a chopper is ticketed your way. Your coach yells, 'Charge it!' You read the hop and set your feet — this is the play that saves the lead.",
    outcomeLines: {
      out: "You attack the ball, fire a strike home, and the tag is applied in time! Inning over, lead safe.",
      single:
        "The throw skips wide and the run scores. They tie it up as the crowd roars.",
      error:
        "The ball kicks off your glove and trickles away. A run scores and you hear the groan from your bench.",
      default: "The inning moves on — breathe, next pitch.",
    },
  },
  {
    id: "m1-s3",
    type: "at_bat",
    buildHeadline: (gs) => `${gs.inning} — ${stakeLabel(gs.stakes)}`,
    baseScore: { us: 2, them: 2 },
    inning: "TOP 5TH",
    outs: 2,
    runners: ["1B", "3B"],
    stakes: "rivalry",
    setupNarration:
      "Rivalry game, packed stands, and you’re up with two on and two out. The pitcher shakes off twice — you know something nasty is coming. You tighten your grip and pick your zone.",
    outcomeLines: {
      hr: "NO DOUBT! A moonshot to left clears the fence and three runs score. Your teammates mob you at the plate!",
      triple:
        "You split the outfielders! Two runs score as you slide into third, dirt on your jersey and fire in your eyes.",
      double:
        "You rope one into the corner! Two runs score and you stand on second pumping your fist.",
      single:
        "A seeing-eye single plates the go-ahead run! You fist-bump first-base coach and hear the crowd chant your name.",
      walk: "You lay off the junk and earn the walk — a run walks home and the bases stay loaded for the next hitter.",
      error:
        "A hot shot eats up the third baseman. Runs score and you reach safely in the chaos.",
      strikeout:
        "You chase the splitter in the dirt. Two outs become three and the rally fizzles.",
      out: "Soft liner — snagged by the second baseman. Side retired, momentum paused.",
      default: "The inning turns the page.",
    },
  },
  {
    id: "m1-s4",
    type: "baserun",
    buildHeadline: (gs) => `${gs.inning} — ${stakeLabel(gs.stakes)}`,
    baseScore: { us: 4, them: 3 },
    inning: "BOT 6TH",
    outs: 1,
    runners: ["1B"],
    stakes: "regular",
    setupNarration:
      "You’re on first after a walk, one out, and the pitcher is barely paying attention. Third-base coach flashes the steal sign — your legs are coiled, heart pounding.",
    outcomeLines: {
      double:
        "You explode on first movement and beat the throw with a perfect hook slide! Safe at second — the crowd loses it.",
      out: "Great jump, but the catcher pops and fires a laser. You’re out, but you made them work for it.",
      default: "You reset on the bases, eyes still hunting the next edge.",
    },
  },
  {
    id: "m1-s5",
    type: "dugout",
    buildHeadline: (gs) => `${gs.inning} — ${stakeLabel(gs.stakes)}`,
    baseScore: { us: 4, them: 4 },
    inning: "BOT 7TH",
    outs: 0,
    runners: [],
    stakes: "championship",
    setupNarration:
      "Between innings your coach kneels beside you. Championship energy hums through the dugout. They remind you who you are, why you picked your favorite team, and that the next at-bat is yours if you want it.",
    outcomeLines: {
      walk: "You nod, breathe deep, and feel your shoulders loosen. The dugout noise becomes fuel — you’re ready.",
      default: "You tap your cleats, adjust your wristbands, and step back into the light.",
    },
  },
];

export function getM1TemplateById(id: string): M1SceneTemplate | undefined {
  return M1_SCENE_TEMPLATES.find((t) => t.id === id);
}

export function outcomeNarrationFor(
  template: M1SceneTemplate,
  outcomeType: string,
): string {
  const line = template.outcomeLines[outcomeType];
  if (line) return line;
  return template.outcomeLines.default;
}
