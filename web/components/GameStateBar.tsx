"use client";

import { AnimatedInteger } from "@/components/AnimatedScore";

export function GameStateBar({
  headline,
  us,
  them,
  inning,
  outs,
  balls,
  strikes,
}: {
  headline: string;
  us: number;
  them: number;
  inning: string;
  outs: number;
  balls: number;
  strikes: number;
}) {
  return (
    <div className="pointer-events-none absolute left-2 top-2 z-10 max-w-[min(94%,380px)] rounded-xl border border-white/12 bg-zinc-950/50 px-2.5 py-2 text-[11px] text-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.06] backdrop-blur-md sm:left-3 sm:top-3 sm:px-3 sm:py-2.5 sm:text-xs">
      <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-200/95 sm:text-[11px]">
        {headline}
      </div>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono tabular-nums text-zinc-100">
        <span>
          <span className="font-sans text-[10px] font-medium text-zinc-400">
            Us
          </span>{" "}
          <AnimatedInteger value={us} className="text-emerald-300" />
        </span>
        <span>
          <span className="font-sans text-[10px] font-medium text-zinc-400">
            Them
          </span>{" "}
          <AnimatedInteger value={them} className="text-sky-300" />
        </span>
        <span className="text-zinc-200">
          {inning} · <AnimatedInteger value={outs} className="inline text-zinc-100" />{" "}
          out
        </span>
      </div>
      <div className="mt-1 font-mono tabular-nums text-zinc-400">
        <span className="font-sans text-[10px] font-medium text-zinc-500">
          Count
        </span>{" "}
        <AnimatedInteger value={balls} />-
        <AnimatedInteger value={strikes} />
      </div>
    </div>
  );
}
