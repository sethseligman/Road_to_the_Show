import type { Level } from "@/types/game";

const levels: { id: Level; label: string }[] = [
  { id: "little_league", label: "Little League" },
  { id: "travel", label: "Travel Ball" },
  { id: "middle", label: "Middle School" },
  { id: "high", label: "High School" },
  { id: "college", label: "College" },
  { id: "pros", label: "Pros" },
];

export function CareerMap({ active }: { active: Level }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white/70 p-3 text-xs text-zinc-700">
      <div className="font-semibold text-zinc-900">Career map</div>
      <ol className="mt-2 flex flex-wrap gap-2">
        {levels.map((l) => {
          const isActive = l.id === active;
          const isPast =
            levels.findIndex((x) => x.id === l.id) <
            levels.findIndex((x) => x.id === active);
          return (
            <li
              key={l.id}
              className={`rounded-full px-2 py-1 ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : isPast
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {l.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
