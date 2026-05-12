"use client";

import type { Game, Scene } from "@/types/game";
import { ChoiceButtons } from "@/components/ChoiceButtons";

const stakeCardShadow: Record<Game["stakes"], string> = {
  regular: "0 -12px 40px rgba(0,0,0,0.35)",
  rivalry:
    "0 -12px 40px rgba(0,0,0,0.35), 0 0 36px color-mix(in srgb, var(--stakes-rivalry) 28%, transparent)",
  playoff:
    "0 -12px 40px rgba(0,0,0,0.35), 0 0 34px color-mix(in srgb, var(--stakes-playoff) 30%, transparent)",
  championship:
    "0 -12px 40px rgba(0,0,0,0.35), 0 0 40px color-mix(in srgb, var(--stakes-championship) 32%, transparent)",
};

export function SceneOverlay({
  scene,
  phase,
  setupLoading,
  outcomeLoading,
  choicesDisabled = false,
  nextDisabled,
  stakes = "regular",
  onChoose,
  onContinue,
}: {
  scene: Scene;
  phase: "setup" | "result";
  setupLoading: boolean;
  outcomeLoading: boolean;
  choicesDisabled?: boolean;
  nextDisabled?: boolean;
  stakes?: Game["stakes"];
  onChoose: (index: number) => void;
  onContinue: () => void;
}) {
  const cardShadow = stakeCardShadow[stakes] ?? stakeCardShadow.regular;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-4 sm:pb-4">
      <div
        className="pointer-events-auto w-full max-w-2xl rounded-t-2xl border border-white/22 bg-zinc-950/78 px-4 py-4 backdrop-blur-md sm:px-5 sm:py-5"
        style={{
          maxHeight: "min(46vh, 420px)",
          boxShadow: cardShadow,
        }}
      >
        <div className="max-h-[min(42vh,380px)] overflow-y-auto overscroll-contain">
          {phase === "setup" && setupLoading ? (
            <p className="text-base leading-relaxed text-zinc-200">
              The announcer is setting the scene…
            </p>
          ) : null}
          {phase === "setup" && !setupLoading ? (
            <p className="text-base leading-relaxed text-zinc-50 sm:text-lg">
              {scene.setupNarration}
            </p>
          ) : null}
          {phase === "result" && outcomeLoading ? (
            <p className="text-base leading-relaxed text-zinc-200">
              Describing the play…
            </p>
          ) : null}
          {phase === "result" && !outcomeLoading ? (
            <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-50 sm:text-lg">
              {scene.outcomeNarration}
            </p>
          ) : null}

          {phase === "setup" ? (
            <ChoiceButtons
              scene={scene}
              disabled={setupLoading || choicesDisabled}
              onChoose={onChoose}
            />
          ) : !outcomeLoading && !nextDisabled ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={onContinue}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-base font-bold text-emerald-950 shadow-lg hover:bg-emerald-400 sm:w-auto sm:px-6"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
