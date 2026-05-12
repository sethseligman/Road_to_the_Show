import type { Scene } from "@/types/game";
import { ChoiceButtons } from "@/components/ChoiceButtons";

export function SceneCard({
  scene,
  phase,
  onChoose,
  onContinue,
  setupLoading,
  outcomeLoading,
}: {
  scene: Scene;
  phase: "setup" | "result";
  onChoose: (index: number) => void;
  onContinue: () => void;
  setupLoading?: boolean;
  outcomeLoading?: boolean;
}) {
  if (phase === "setup") {
    return (
      <section className="rounded-lg border border-zinc-300 bg-white p-4 shadow-sm">
        {setupLoading ? (
          <p className="text-base leading-relaxed text-zinc-600">
            The announcer is setting the scene…
          </p>
        ) : (
          <p className="text-base leading-relaxed text-zinc-900">
            {scene.setupNarration}
          </p>
        )}
        <ChoiceButtons
          scene={scene}
          disabled={setupLoading}
          onChoose={onChoose}
        />
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-zinc-300 bg-white p-4 shadow-sm">
      {outcomeLoading ? (
        <p className="text-base leading-relaxed text-zinc-600">
          Describing the play…
        </p>
      ) : (
        <p className="text-base leading-relaxed text-zinc-900">
          {scene.outcomeNarration}
        </p>
      )}
      {!outcomeLoading ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}
