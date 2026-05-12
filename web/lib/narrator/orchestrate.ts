import { buildFallbackProse } from "@/lib/narrator/fallback";
import { appendCachedVariation, readCachedVariation } from "@/lib/narrator/cache";
import { completeProse } from "@/lib/narrator/anthropicAdapter";
import { validateNarration } from "@/lib/narrator/guardrails";
import {
  NARRATOR_FEW_SHOTS,
  NARRATOR_SYSTEM_PROMPT,
  buildUserPromptOutcome,
  buildUserPromptSetup,
} from "@/lib/narrator/prompts";
import type { NarrateRequest, NarrateResponse } from "@/lib/narrator/types";

async function callModel(user: string): Promise<string> {
  const system = `${NARRATOR_SYSTEM_PROMPT}\n\n${NARRATOR_FEW_SHOTS}`;
  return completeProse(system, user);
}

async function generateOnce(req: NarrateRequest): Promise<string> {
  const user =
    req.phase === "setup"
      ? buildUserPromptSetup(req)
      : buildUserPromptOutcome(req);
  let text = await callModel(user);
  let check = validateNarration(text, req.phase);
  if (!check.ok) {
    const hint = `Your last answer failed checks (${check.reason}). Rewrite completely. Follow sentence count and safety rules.`;
    text = await callModel(`${user}\n\n${hint}`);
    check = validateNarration(text, req.phase);
  }
  if (!check.ok) {
    throw new Error(check.reason);
  }
  return text;
}

export async function narrateOrchestrate(
  req: NarrateRequest,
): Promise<NarrateResponse> {
  const fallback = buildFallbackProse(req);

  if (!process.env.ANTHROPIC_API_KEY) {
    return { prose: fallback, source: "fallback" };
  }

  const cached = await readCachedVariation(req);
  if (cached) {
    const v = validateNarration(cached, req.phase);
    if (v.ok) {
      return { prose: cached, source: "cache" };
    }
  }

  try {
    const text = await generateOnce(req);
    await appendCachedVariation(req, text);
    return { prose: text, source: "ai" };
  } catch {
    return { prose: fallback, source: "fallback" };
  }
}
