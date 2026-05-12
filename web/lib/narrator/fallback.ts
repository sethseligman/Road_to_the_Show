import { validateNarration } from "@/lib/narrator/guardrails";
import type { NarratePhase, NarrateRequest } from "@/lib/narrator/types";
import {
  getM1TemplateById,
  outcomeNarrationFor,
} from "@/lib/engine/m1Templates";

export function padToSafe(text: string, phase: NarratePhase): string {
  let out = text.trim();
  for (let i = 0; i < 4; i++) {
    if (validateNarration(out, phase).ok) return out;
    out = `${out} The stadium hums, and you feel the next heartbeat of the game.`;
  }
  return out;
}

export function buildFallbackProse(req: NarrateRequest): string {
  if (req.phase === "setup") {
    const tpl = getM1TemplateById(req.templateId);
    const base =
      tpl?.setupNarration ??
      "The game tightens. You breathe in chalk and sunshine, ready for whatever happens next.";
    return padToSafe(base, "setup");
  }
  const tpl = getM1TemplateById(req.templateId);
  const line = tpl
    ? outcomeNarrationFor(tpl, req.result.outcome_type)
    : "The play snaps into place — baseball doing what baseball does.";
  return padToSafe(line, "outcome");
}
