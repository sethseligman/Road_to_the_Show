import { NextResponse } from "next/server";
import { narrateOrchestrate } from "@/lib/narrator/orchestrate";
import type {
  NarrateOutcomePayload,
  NarrateRequest,
  NarrateSetupPayload,
} from "@/lib/narrator/types";

const SCENE_TYPES = new Set(["at_bat", "defense", "baserun", "dugout"]);
const STAKES = new Set(["regular", "rivalry", "playoff", "championship"]);
const OUTCOME_TYPES = new Set([
  "single",
  "double",
  "triple",
  "hr",
  "out",
  "walk",
  "strikeout",
  "error",
]);

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isNarrateRequest(body: unknown): body is NarrateRequest {
  if (!isRecord(body)) return false;
  const phase = body.phase;
  if (phase !== "setup" && phase !== "outcome") return false;
  if (!SCENE_TYPES.has(body.scene_type as string)) return false;
  if (!STAKES.has(body.stakes as string)) return false;
  if (typeof body.templateId !== "string") return false;

  if (phase === "setup") {
    const p = body as Partial<NarrateSetupPayload>;
    if (!isRecord(p.game_state)) return false;
    const gs = p.game_state as Record<string, unknown>;
    if (typeof gs.inning !== "string") return false;
    if (typeof gs.outs !== "number") return false;
    if (!Array.isArray(gs.runners)) return false;
    if (!isRecord(gs.score)) return false;
    if (typeof (gs.score as Record<string, unknown>).us !== "number") return false;
    if (typeof (gs.score as Record<string, unknown>).them !== "number") return false;
    if (!STAKES.has(gs.stakes as string)) return false;
    if (!isRecord(p.player)) return false;
    if (typeof (p.player as Record<string, unknown>).name !== "string") return false;
    if (!Array.isArray(p.choices) || !p.choices.every((c) => typeof c === "string"))
      return false;
    return true;
  }

  const o = body as Partial<NarrateOutcomePayload>;
  if (typeof o.scene_id !== "string") return false;
  if (typeof o.chosen_label !== "string") return false;
  if (!isRecord(o.result)) return false;
  if (!OUTCOME_TYPES.has(o.result.outcome_type as string)) return false;
  if (typeof o.result.runs_scored !== "number") return false;
  if (!isRecord(o.result.stat_deltas)) return false;
  for (const v of Object.values(o.result.stat_deltas)) {
    if (typeof v !== "number") return false;
  }
  return true;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isNarrateRequest(body)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const result = await narrateOrchestrate(body);
  return NextResponse.json(result);
}
