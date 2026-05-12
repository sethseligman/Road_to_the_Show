import { MLB_PLAYER_DENY_SUBSTRINGS } from "@/lib/narrator/mlbPlayerDenylist";
import type { NarratePhase } from "@/lib/narrator/types";

const PROFANITY = [
  "damn",
  "hell",
  "crap",
  "shit",
  "fuck",
  "bitch",
  "bastard",
  "asshole",
  "dick",
  "piss",
];

const SAFETY_PATTERNS: RegExp[] = [
  /\bbloody?\b/i,
  /\bbleeding\b/i,
  /\binjur(y|ed|ies)\b/i,
  /\bconcussion\b/i,
  /\bbets?\b/i,
  /\bbetting\b/i,
  /\bwagers?\b/i,
  /\bwagering\b/i,
  /\bgambl(e|es|ing)\b/i,
  /\bcasino\b/i,
];

/** Looks like engine-style stat deltas the AI must not output. */
const STAT_DELTA_RE =
  /\b\+?\d{1,2}\s+(contact|power|speed|arm|eye|glove|confidence)\b/i;
const STAT_DELTA_RE_2 =
  /\b(contact|power|speed|arm|eye|glove|confidence)\s*\+?\d{1,2}\b/i;
const PLUS_STAT_RE = /\b\+\d{1,2}\b/;

export type GuardrailResult = { ok: true } | { ok: false; reason: string };

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sentenceCount(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  const chunks = t.split(/(?<=[.!?])\s+/).filter((c) => c.trim().length > 0);
  return chunks.length;
}

export function validateNarration(
  text: string,
  phase: NarratePhase,
): GuardrailResult {
  const t = text.trim();
  if (!t) {
    return { ok: false, reason: "empty_output" };
  }

  const lower = normalize(t);
  const wc = wordCount(t);
  const maxWords = phase === "setup" ? 60 : 40;
  if (wc > maxWords) {
    return { ok: false, reason: `word_count_${wc}` };
  }

  const sc = sentenceCount(t);
  if (sc < 2) {
    return { ok: false, reason: "single_sentence_or_too_few" };
  }

  for (const w of PROFANITY) {
    const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(lower)) {
      return { ok: false, reason: `profanity_${w}` };
    }
  }

  for (const re of SAFETY_PATTERNS) {
    if (re.test(t)) {
      return { ok: false, reason: `safety_${re.source}` };
    }
  }

  for (const name of MLB_PLAYER_DENY_SUBSTRINGS) {
    if (name.length >= 4 && lower.includes(name)) {
      return { ok: false, reason: `mlb_name_${name.slice(0, 24)}` };
    }
  }

  if (STAT_DELTA_RE.test(t) || STAT_DELTA_RE_2.test(t)) {
    return { ok: false, reason: "stat_delta_pattern" };
  }

  if (PLUS_STAT_RE.test(t) && /contact|power|speed|arm|eye|glove|confidence/i.test(t)) {
    return { ok: false, reason: "stat_like_plus" };
  }

  return { ok: true };
}
