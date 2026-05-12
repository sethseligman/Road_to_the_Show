"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  OutcomeAnimation,
  type OutcomePlayEvent,
} from "@/components/OutcomeAnimation";
import { PlayerCard } from "@/components/PlayerCard";
import { SceneOverlay } from "@/components/SceneOverlay";
import { StadiumBackdrop } from "@/components/StadiumBackdrop";
import { StadiumDiamond, type DiamondFx } from "@/components/StadiumDiamond";
import { StatChangePop } from "@/components/StatChangePop";
import type { StatToast } from "@/components/StatChangeToast";
import { createRng } from "@/lib/engine/rng";
import { generateScene } from "@/lib/engine/generateScene";
import { M1_SCENE_TEMPLATES } from "@/lib/engine/m1Templates";
import { rollOutcome } from "@/lib/engine/rollOutcome";
import {
  applyOutcomeToScore,
  tallyBoxAfterOutcome,
  type BoxTally,
  type RunningScore,
} from "@/lib/game/scoring";
import {
  nextOccupiedBasesAfterOutcome,
  type OccupiedBase,
} from "@/lib/game/diamondVisual";
import {
  accumulateFromOutcome,
  applySessionToPlayer,
  createEmptySession,
  type SessionAccum,
} from "@/lib/player/sessionStats";
import { applyStatDeltas } from "@/lib/player/factory";
import {
  buildOutcomeRequest,
  buildSetupRequest,
} from "@/lib/narrator/buildClientPayload";
import { narrate } from "@/lib/narrator/narrate";
import { loadPlayer, savePlayer } from "@/lib/storage/save";
import { statToastsFromDeltas } from "@/lib/ui/statToasts";
import { useDiamondRenderable } from "@/hooks/useDiamondState";
import type { Player, Scene } from "@/types/game";

const OPPONENT = "Valley Tigers";

function mergeScore(scene: Scene, score: RunningScore): Scene {
  return {
    ...scene,
    gameState: { ...scene.gameState, score: { ...score } },
  };
}

const emptyFx: DiamondFx = {
  stamp: null,
  ball: null,
  confetti: false,
  errorShake: false,
  crowdPulse: false,
};

export default function GameScreen() {
  const params = useParams<{ id: string }>();
  const gameId = params?.id ?? "game";
  const router = useRouter();

  const [player, setPlayer] = useState<Player | null>(() => loadPlayer());
  const [statBaseline] = useState<Player["stats"] | null>(() => {
    const p = loadPlayer();
    return p ? { ...p.stats } : null;
  });
  const [sceneIndex, setSceneIndex] = useState(0);
  const [phase, setPhase] = useState<"setup" | "result">("setup");
  const [scene, setScene] = useState<Scene | null>(null);
  const [runningScore, setRunningScore] = useState<RunningScore>({
    us: 0,
    them: 0,
  });
  const [boxTally, setBoxTally] = useState<BoxTally>({
    hitsUs: 0,
    hitsThem: 0,
    errorsUs: 0,
    errorsThem: 0,
  });
  const sessionRef = useRef<SessionAccum>(createEmptySession());
  const runningScoreRef = useRef(runningScore);
  const [statPops, setStatPops] = useState<StatToast[]>([]);
  const [mode, setMode] = useState<"playing" | "summary">("playing");
  const [setupLoading, setSetupLoading] = useState(false);
  const [outcomeLoading, setOutcomeLoading] = useState(false);

  const [liveRunners, setLiveRunners] = useState<OccupiedBase[]>([]);
  const [liveOuts, setLiveOuts] = useState(0);
  const [count, setCount] = useState({ balls: 0, strikes: 0 });
  const [diamondFx, setDiamondFx] = useState<DiamondFx>(emptyFx);
  const [animPlay, setAnimPlay] = useState<OutcomePlayEvent | null>(null);
  const [fieldBusy, setFieldBusy] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pendingDiamondRef = useRef<{
    runners: OccupiedBase[];
    outs: number;
  } | null>(null);

  useEffect(() => {
    if (!player) {
      router.replace("/");
    }
  }, [player, router]);

  useEffect(() => {
    runningScoreRef.current = runningScore;
  }, [runningScore]);

  useEffect(() => {
    if (!player) return;
    const template = M1_SCENE_TEMPLATES[sceneIndex];
    const gen = generateScene(template, player, gameId, sceneIndex);
    setScene(mergeScore(gen, runningScoreRef.current));
    setPhase("setup");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.id, gameId, sceneIndex]);

  useEffect(() => {
    if (!scene) return;
    const runners = [...scene.gameState.runners];
    const outs = scene.gameState.outs;
    const raf = window.requestAnimationFrame(() => {
      setLiveRunners(runners);
      setLiveOuts(outs);
      setCount({ balls: 0, strikes: 0 });
      setFieldBusy(false);
      setAnimPlay(null);
      setDiamondFx(emptyFx);
    });
    return () => window.cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync live field to scene identity only; narration updates must not reset the diamond mid-scene.
  }, [scene?.id]);

  useEffect(() => {
    if (!scene || !player) return;
    const s = scene;
    const p = player;
    const tpl = M1_SCENE_TEMPLATES[sceneIndex];
    let cancelled = false;
    void (async () => {
      setSetupLoading(true);
      const sceneForNarrator: Scene = {
        ...s,
        gameState: {
          ...s.gameState,
          score: { ...runningScoreRef.current },
        },
      };
      try {
        const res = await narrate(
          buildSetupRequest(sceneForNarrator, p, tpl.id),
        );
        if (cancelled) return;
        setScene((prev) => prev && { ...prev, setupNarration: res.prose });
      } finally {
        if (!cancelled) setSetupLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `scene`/`player` are snapshots when scene id changes; listing them would rerun on every narration update.
  }, [scene?.id, player?.id, gameId, sceneIndex]);

  const displayScene = useMemo(() => {
    if (!scene) return null;
    return mergeScore(scene, runningScore);
  }, [scene, runningScore]);

  const diamondRenderable = useDiamondRenderable(
    scene,
    runningScore,
    liveRunners,
    liveOuts,
    count,
  );

  const pushStatPops = useCallback((deltas: Partial<Record<string, number>>) => {
    const next = statToastsFromDeltas(deltas);
    if (next.length === 0) return;
    setStatPops(next);
    window.setTimeout(() => setStatPops([]), 2600);
  }, []);

  const handleAnimComplete = useCallback(() => {
    const pending = pendingDiamondRef.current;
    if (pending) {
      setLiveRunners(pending.runners);
      setLiveOuts(pending.outs);
    }
    pendingDiamondRef.current = null;
    setAnimPlay(null);
    setFieldBusy(false);
  }, []);

  const handleChoose = (choiceIndex: number) => {
    if (!player || !scene || fieldBusy) return;
    const template = M1_SCENE_TEMPLATES[sceneIndex];
    const choice = scene.choices[choiceIndex];
    if (!choice) return;

    const rng = createRng(`${gameId}:${scene.id}:pick:${choiceIndex}`);
    const outcome = rollOutcome(scene.type, player.stats, choice, rng);

    const nextDiamond = nextOccupiedBasesAfterOutcome(
      scene.type,
      liveRunners,
      liveOuts,
      outcome,
    );
    pendingDiamondRef.current = nextDiamond;
    setFieldBusy(true);
    setAnimPlay({
      id: Date.now(),
      outcome,
      sceneType: scene.type,
      stakes: scene.gameState.stakes,
    });

    const newRunning = applyOutcomeToScore(scene.type, outcome, runningScore);
    const newBox = tallyBoxAfterOutcome(scene.type, outcome, boxTally);
    sessionRef.current = accumulateFromOutcome(
      sessionRef.current,
      scene.type,
      outcome,
    );

    const statDeltas = outcome.statDeltas ?? {};
    const newStats = applyStatDeltas(player.stats, statDeltas);
    const updatedPlayer: Player = { ...player, stats: newStats };
    setPlayer(updatedPlayer);
    savePlayer(updatedPlayer);

    pushStatPops(statDeltas);
    setRunningScore(newRunning);
    setBoxTally(newBox);

    if (outcome.outcomeType === "strikeout") {
      setCount((c) => ({ ...c, strikes: Math.min(2, c.strikes + 1) }));
    }

    const chosenLabel = choice.label;
    setScene({
      ...scene,
      resolvedChoice: choiceIndex,
      outcome,
      outcomeNarration: "",
    });
    setPhase("result");
    setOutcomeLoading(true);

    void (async () => {
      try {
        const res = await narrate(
          buildOutcomeRequest(scene, template.id, chosenLabel, outcome),
        );
        const scoreLine = `\n\nScore: Us ${newRunning.us}, Them ${newRunning.them}.`;
        setScene((s) =>
          s
            ? {
                ...s,
                outcomeNarration: `${res.prose}${scoreLine}`,
              }
            : s,
        );
      } finally {
        setOutcomeLoading(false);
      }
    })();
  };

  const handleContinue = () => {
    if (fieldBusy) return;
    if (sceneIndex >= M1_SCENE_TEMPLATES.length - 1) {
      if (!player) return;
      const finished = applySessionToPlayer(player, sessionRef.current);
      savePlayer(finished);
      setPlayer(finished);
      setMode("summary");
      return;
    }
    setSceneIndex((i) => i + 1);
  };

  if (!player) {
    return (
      <StadiumBackdrop>
        <p className="text-sm text-zinc-700">Loading…</p>
      </StadiumBackdrop>
    );
  }

  if (mode === "summary") {
    const start = statBaseline ?? player.stats;
    const statKeys = Object.keys(player.stats) as (keyof Player["stats"])[];
    const statRows = statKeys
      .map((k) => {
        const delta = player.stats[k] - start[k];
        if (delta === 0) return null;
        return (
          <li key={k} className="flex justify-between gap-4">
            <span className="capitalize">{k}</span>
            <span className="font-mono">
              {start[k]} → {player.stats[k]} ({delta >= 0 ? "+" : ""}
              {delta})
            </span>
          </li>
        );
      })
      .filter(Boolean);

    return (
      <StadiumBackdrop>
        <div className="mx-auto max-w-xl space-y-4 rounded-lg border border-zinc-300 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-zinc-900">Post-game summary</h1>
          <p className="text-sm text-zinc-700">
            Us {runningScore.us} — {OPPONENT} {runningScore.them}
          </p>
          <div className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm">
            <div className="font-semibold text-zinc-900">Box score</div>
            <table className="mt-2 w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-zinc-500">
                  <th className="py-1">Team</th>
                  <th className="py-1">R</th>
                  <th className="py-1">H</th>
                  <th className="py-1">E</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm">
                <tr>
                  <td className="py-1">Us</td>
                  <td>{runningScore.us}</td>
                  <td>{boxTally.hitsUs}</td>
                  <td>{boxTally.errorsUs}</td>
                </tr>
                <tr>
                  <td className="py-1">{OPPONENT}</td>
                  <td>{runningScore.them}</td>
                  <td>{boxTally.hitsThem}</td>
                  <td>{boxTally.errorsThem}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <div className="font-semibold text-zinc-900">Stat changes</div>
            <ul className="mt-2 space-y-1 text-sm text-zinc-800">{statRows}</ul>
          </div>
          <p className="text-sm text-zinc-700">
            Next time: mid-season rival week and a full season — coming in
            Milestone 3.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Continue
          </Link>
        </div>
      </StadiumBackdrop>
    );
  }

  if (!displayScene || !diamondRenderable) {
    return (
      <StadiumBackdrop>
        <p className="text-sm text-zinc-700">Loading scene…</p>
      </StadiumBackdrop>
    );
  }

  return (
    <div className="flex min-h-dvh min-w-[375px] flex-col bg-[#1a2e24] text-zinc-50">
      <OutcomeAnimation
        play={animPlay}
        setFx={setDiamondFx}
        onComplete={handleAnimComplete}
      />
      <StatChangePop items={statPops} />

      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-zinc-950/70 px-3 py-2.5 backdrop-blur-md sm:px-4">
        <h1 className="truncate text-sm font-bold tracking-tight text-white sm:text-base">
          Road to the Bigs
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 lg:hidden"
          >
            Stats
          </button>
          <Link
            href="/"
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
          >
            Home
          </Link>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative flex min-h-[min(52vh,420px)] flex-1 flex-col lg:min-h-0">
          <StadiumDiamond renderable={diamondRenderable} fx={diamondFx} />
        </div>

        <aside className="hidden w-72 shrink-0 border-l border-white/10 bg-zinc-950/40 p-3 backdrop-blur-md lg:block">
          <PlayerCard player={player} compact surface="dark" />
        </aside>
      </div>

      {drawerOpen ? (
        <button
          type="button"
          aria-label="Close stats"
          className="fixed inset-0 z-[70] bg-black/50 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}
      {drawerOpen ? (
        <div className="fixed inset-y-0 right-0 z-[80] w-[min(92vw,300px)] border-l border-white/15 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-md lg:hidden">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-white">Your player</span>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-md bg-white/10 px-2 py-1 text-xs text-white"
            >
              Close
            </button>
          </div>
          <PlayerCard player={player} compact surface="dark" />
        </div>
      ) : null}

      <SceneOverlay
        scene={displayScene}
        phase={phase}
        stakes={displayScene.gameState.stakes}
        setupLoading={phase === "setup" ? setupLoading : false}
        outcomeLoading={phase === "result" ? outcomeLoading : false}
        choicesDisabled={fieldBusy}
        nextDisabled={fieldBusy || outcomeLoading}
        onChoose={handleChoose}
        onContinue={handleContinue}
      />
    </div>
  );
}
