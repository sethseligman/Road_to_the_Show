import type { Scene } from "@/types/game";

export function ChoiceButtons({
  scene,
  disabled,
  onChoose,
}: {
  scene: Scene;
  disabled?: boolean;
  onChoose: (index: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      {scene.choices.map((c, i) => (
        <button
          key={c.label}
          type="button"
          disabled={disabled}
          onClick={() => onChoose(i)}
          className="rounded-lg border border-zinc-400 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
