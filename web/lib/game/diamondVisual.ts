import type { Outcome, Scene } from "@/types/game";

export type OccupiedBase = "1B" | "2B" | "3B";

const ORDER: OccupiedBase[] = ["3B", "2B", "1B"];

/** Remove up to `n` runners, scoring from furthest base first (visual simplification). */
export function consumeRunsFromBases(
  runners: OccupiedBase[],
  runs: number,
): OccupiedBase[] {
  let r = [...runners];
  let left = Math.max(0, runs);
  for (const b of ORDER) {
    while (left > 0 && r.includes(b)) {
      r = r.filter((x) => x !== b);
      left--;
    }
  }
  return r;
}

/** Advance every remaining runner one base toward home; runners leaving 3B score (drop). */
export function advanceAllOneBase(runners: OccupiedBase[]): OccupiedBase[] {
  const next = new Set<OccupiedBase>();
  for (const b of runners) {
    if (b === "1B") next.add("2B");
    else if (b === "2B") next.add("3B");
    // 3B scores — omitted
  }
  return Array.from(next);
}

function addBatterAt(runners: OccupiedBase[], base: OccupiedBase): OccupiedBase[] {
  const s = new Set(runners);
  if (!s.has(base)) {
    s.add(base);
    return Array.from(s);
  }
  // Force chain toward home (walk-style)
  let r = Array.from(s);
  if (base === "1B") {
    if (!r.includes("2B")) return [...r, "1B"];
    if (!r.includes("3B")) {
      r = r.filter((x) => x !== "2B");
      return [...r, "2B", "1B"];
    }
    r = consumeRunsFromBases(r, 1);
    return addBatterAt(r, base);
  }
  if (base === "2B") {
    if (!r.includes("3B")) return [...r, "2B"];
    r = consumeRunsFromBases(r, 1);
    return [...r, "2B"];
  }
  r = consumeRunsFromBases(r, 1);
  return [...r, "3B"];
}

export function nextOccupiedBasesAfterOutcome(
  sceneType: Scene["type"],
  runners: OccupiedBase[],
  outs: number,
  outcome: Outcome,
): { runners: OccupiedBase[]; outs: number } {
  let r = [...runners];
  let o = outs;

  if (sceneType === "dugout") {
    return { runners: r, outs: o };
  }

  if (sceneType === "baserun") {
    if (outcome.outcomeType === "double") {
      // steal success: 1B -> 2B
      r = r.filter((b) => b !== "1B");
      r = addBatterAt(r, "2B");
      return { runners: r, outs: o };
    }
    if (outcome.outcomeType === "out") {
      r = r.filter((b) => b !== "1B");
      o = Math.min(2, o + 1);
      return { runners: r, outs: o };
    }
    return { runners: r, outs: o };
  }

  if (sceneType === "defense") {
    if (outcome.outcomeType === "out") {
      return { runners: r, outs: Math.min(2, o + 1) };
    }
    if (outcome.outcomeType === "single" || outcome.outcomeType === "error") {
      r = consumeRunsFromBases(r, outcome.runsScored);
      r = addBatterAt(r, "1B");
      return { runners: r, outs: o };
    }
    return { runners: r, outs: o };
  }

  // at_bat
  const rs = outcome.runsScored;
  const t = outcome.outcomeType;

  if (t === "strikeout" || t === "out") {
    return { runners: r, outs: Math.min(2, o + 1) };
  }

  if (t === "walk") {
    r = consumeRunsFromBases(r, rs);
    r = addBatterAt(r, "1B");
    return { runners: r, outs: o };
  }

  if (t === "hr") {
    return { runners: [], outs: o };
  }

  const bases =
    t === "single" ? 1 : t === "double" ? 2 : t === "triple" ? 3 : 1;

  r = consumeRunsFromBases(r, rs);
  for (let i = 0; i < bases; i++) {
    r = advanceAllOneBase(r);
  }
  if (bases === 1) r = addBatterAt(r, "1B");
  else if (bases === 2) r = addBatterAt(r, "2B");
  else if (bases === 3) r = addBatterAt(r, "3B");

  return { runners: r, outs: o };
}
