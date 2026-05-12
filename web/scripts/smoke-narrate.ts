/**
 * Smoke test: 50 random narrator payloads → orchestrate → guardrails.
 * Run from `web/`: `npm run smoke-narrate`
 * Outputs `narrate-smoke-output.txt` (gitignored).
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { M1_SCENE_TEMPLATES } from "../lib/engine/m1Templates";
import { validateNarration } from "../lib/narrator/guardrails";
import { narrateOrchestrate } from "../lib/narrator/orchestrate";
import type {
  NarrateOutcomePayload,
  NarrateRequest,
  NarrateSetupPayload,
} from "../lib/narrator/types";

const OUTCOMES = [
  "single",
  "double",
  "triple",
  "hr",
  "out",
  "walk",
  "strikeout",
  "error",
] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomSetup(): NarrateSetupPayload {
  const tpl = pick(M1_SCENE_TEMPLATES);
  return {
    phase: "setup",
    scene_type: tpl.type,
    stakes: tpl.stakes,
    templateId: tpl.id,
    game_state: {
      inning: tpl.inning,
      outs: tpl.outs,
      runners: [...tpl.runners],
      score: { us: pick([0, 1, 2, 3, 4]), them: pick([0, 1, 2, 3, 4]) },
      stakes: tpl.stakes,
      headline: `${tpl.inning} — SMOKE`,
    },
    player: {
      name: pick(["Jordan", "Sam", "Riley", "Casey", "Alex"]),
      archetype: pick([
        "power_hitter",
        "contact_hitter",
        "speedster",
        "defensive_wizard",
        "ace_pitcher",
      ]),
      confidence: pick([55, 62, 70, 78, 84]),
      favoriteTeam: pick([
        "Seattle Mariners",
        "Los Angeles Dodgers",
        "Atlanta Braves",
      ]),
      position: pick(["P", "C", "SS", "OF"]),
      recentStreak: pick(["2-hit game", "first game jitters", "locked in"]),
    },
    pitcher: {
      name: `${pick(["Morgan", "Jamie"])} ${pick(["Lee", "Patel"])}`,
      throws: pick(["fastball-heavy", "breaking balls", "changes speeds"]),
    },
    choices: [
      "Swing for the fences",
      "Look for a pitch you can drive",
      "Take the first pitch",
      "Choke up and battle",
    ],
  };
}

function randomOutcome(): NarrateOutcomePayload {
  const tpl = pick(M1_SCENE_TEMPLATES);
  const ot = pick(OUTCOMES);
  const deltaOptions: Record<string, number>[] = [
    { contact: 1, confidence: 1 },
    { power: 2, confidence: -1 },
    { glove: 2, confidence: 2 },
    { speed: 2 },
    {},
  ];
  return {
    phase: "outcome",
    scene_type: tpl.type,
    stakes: tpl.stakes,
    templateId: tpl.id,
    scene_id: `${tpl.id}-smoke`,
    chosen_label: pick([
      "Swing for the fences",
      "Charge and make the throw home",
      "Take off on first move",
    ]),
    result: {
      outcome_type: ot,
      runs_scored: pick([0, 0, 1, 2, 3]),
      stat_deltas: pick(deltaOptions),
    },
  };
}

async function main() {
  const lines: string[] = [];
  for (let i = 0; i < 50; i++) {
    const req: NarrateRequest =
      Math.random() < 0.48 ? randomSetup() : randomOutcome();
    const out = await narrateOrchestrate(req);
    const check = validateNarration(out.prose, req.phase);
    if (!check.ok) {
      throw new Error(
        `Output ${i} failed guardrails (${check.reason}): ${out.prose.slice(0, 200)}`,
      );
    }
    lines.push(
      `--- #${i} phase=${req.phase} source=${out.source} ---\n${out.prose}\n`,
    );
  }
  const outPath = join(process.cwd(), "narrate-smoke-output.txt");
  writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
