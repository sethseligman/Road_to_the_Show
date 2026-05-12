"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSavedPlayer } from "@/hooks/useSavedPlayer";
import { CareerMap } from "@/components/CareerMap";
import { normalizePlayerName } from "@/lib/player/factory";
import { clearPlayer } from "@/lib/storage/save";

export default function HomePage() {
  const router = useRouter();
  const player = useSavedPlayer();

  const startNew = () => {
    clearPlayer();
    router.push("/create");
  };

  const playGame = () => {
    router.push(`/game/${crypto.randomUUID()}`);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Road to the Bigs</h1>
        <p className="mt-2 text-sm text-zinc-700">
          Little League career RPG — one game at a time.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {player ? (
          <>
            <button
              type="button"
              onClick={playGame}
              className="rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Continue career — play a game
            </button>
            <p className="text-center text-xs text-zinc-600">
              #{player.jersey} {normalizePlayerName(player.name)} ·{" "}
              {player.favoriteTeam}
            </p>
          </>
        ) : (
          <Link
            href="/create"
            className="rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Start new career
          </Link>
        )}
        {player ? (
          <button
            type="button"
            onClick={startNew}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50"
          >
            Start new career (clears save)
          </button>
        ) : null}
      </div>

      <CareerMap active="little_league" />

      <p className="text-xs text-zinc-500">
        Milestone 1: one full game, stat growth, and local save.{" "}
        <Link href="/career" className="underline">
          Career hub (preview)
        </Link>
      </p>
    </main>
  );
}
