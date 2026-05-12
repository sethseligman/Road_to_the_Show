import { teamAccentHex } from "@/lib/constants/mlbTeams";
import { normalizePlayerName } from "@/lib/player/factory";
import type { Archetype, Player } from "@/types/game";

const statOrder: (keyof Player["stats"])[] = [
  "contact",
  "power",
  "speed",
  "arm",
  "eye",
  "glove",
  "confidence",
];

const archetypeTitle: Record<Archetype, string> = {
  power: "Power",
  contact: "Contact",
  speed: "Speed",
  defense: "Defense",
  ace: "Ace",
};

const archetypeChipClass: Record<Archetype, string> = {
  power: "border-rose-500/40 bg-rose-500/20 text-rose-100",
  contact: "border-sky-500/40 bg-sky-500/20 text-sky-100",
  speed: "border-amber-500/40 bg-amber-500/20 text-amber-100",
  defense: "border-emerald-500/40 bg-emerald-500/20 text-emerald-100",
  ace: "border-violet-500/40 bg-violet-500/20 text-violet-100",
};

export function PlayerCard({
  player,
  compact,
  className,
  surface = "light",
}: {
  player: Player;
  compact?: boolean;
  className?: string;
  /** `dark` = game rail; explicit text colors so stats never inherit shell `text-zinc-50`. */
  surface?: "light" | "dark";
}) {
  const displayName = normalizePlayerName(player.name);
  const accent = teamAccentHex(player.favoriteTeam);
  const isDark = surface === "dark";

  const shell = isDark
    ? "border-[color:var(--rail-border)] bg-[color:var(--rail-bg)] text-[color:var(--rail-text)] shadow-[0_12px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.04]"
    : "border-zinc-300/80 bg-white/95 text-zinc-900 shadow-sm ring-0";

  return (
    <aside
      className={`relative overflow-hidden rounded-xl border backdrop-blur-md ${
        compact ? "p-2.5 text-xs" : "p-3 text-sm"
      } ${shell} ${className ?? ""}`}
    >
      <div
        className="absolute left-0 right-0 top-0 h-1 rounded-t-xl"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <div className={compact ? "mt-1.5" : "mt-1"}>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`font-semibold tracking-tight ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            #{player.jersey} {displayName}
          </div>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              archetypeChipClass[player.archetype]
            }`}
          >
            {archetypeTitle[player.archetype]}
          </span>
        </div>
        <div
          className={`mt-1 ${
            isDark ? "text-[color:var(--rail-text-muted)]" : "text-zinc-600"
          } ${compact ? "text-[10px] leading-tight" : "text-xs"}`}
        >
          {player.position} · {player.favoriteTeam}
        </div>
        <dl
          className={`mt-2 grid grid-cols-2 gap-x-2 gap-y-1 ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          {statOrder.map((k) => (
            <div key={k} className="flex justify-between gap-2">
              <dt
                className={`capitalize ${
                  isDark ? "text-[color:var(--rail-text-muted)]" : "text-zinc-600"
                }`}
              >
                {k}
              </dt>
              <dd
                className={`font-mono font-semibold tabular-nums ${
                  isDark ? "text-[color:var(--rail-text)]" : "text-zinc-900"
                }`}
              >
                {player.stats[k]}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}
