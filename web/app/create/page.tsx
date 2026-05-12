"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MLB_TEAMS } from "@/lib/constants/mlbTeams";
import { createPlayer } from "@/lib/player/factory";
import { savePlayer } from "@/lib/storage/save";
import type { Archetype, Position } from "@/types/game";

const POSITIONS: { id: Position; title: string; blurb: string }[] = [
  { id: "P", title: "Pitcher", blurb: "Control the game from the mound." },
  { id: "C", title: "Catcher", blurb: "Call pitches and lead the field." },
  {
    id: "SS",
    title: "Shortstop",
    blurb: "Captain of the infield dirt.",
  },
  {
    id: "OF",
    title: "Outfielder",
    blurb: "Track flies and flash the leather.",
  },
];

const ARCHETYPES: { id: Archetype; title: string; blurb: string }[] = [
  { id: "power", title: "Power hitter", blurb: "Big swings, big noise." },
  { id: "contact", title: "Contact hitter", blurb: "Barrels and battles." },
  { id: "speed", title: "Speedster", blurb: "Wheels on the bases." },
  {
    id: "defense",
    title: "Defensive wizard",
    blurb: "Highlights waiting to happen.",
  },
  { id: "ace", title: "Ace pitcher", blurb: "Heat and command." },
];

type Step = 0 | 1 | 2 | 3;

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState("");
  const [jersey, setJersey] = useState(12);
  const [position, setPosition] = useState<Position>("SS");
  const [archetype, setArchetype] = useState<Archetype>("contact");
  const [favoriteTeam, setFavoriteTeam] = useState(MLB_TEAMS[0]!.name);
  const [error, setError] = useState<string | null>(null);

  const canAdvanceStep0 = name.trim().length > 0 && jersey >= 1 && jersey <= 99;

  const finish = () => {
    if (!canAdvanceStep0) {
      setError("Add your name and a jersey number (1–99).");
      return;
    }
    const player = createPlayer({
      name: name.trim(),
      jersey,
      position,
      archetype,
      favoriteTeam,
    });
    savePlayer(player);
    router.push(`/game/${crypto.randomUUID()}`);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-zinc-900">Create your player</h1>
        <Link href="/" className="text-sm text-zinc-700 underline">
          Home
        </Link>
      </div>
      <p className="text-sm text-zinc-600">
        Step {step + 1} of 4 — tap one card per screen.
      </p>

      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {step === 0 ? (
        <section className="space-y-4">
          <label className="block text-sm font-medium text-zinc-800">
            Player name
            <input
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-800">
            Jersey number (1–99)
            <input
              type="number"
              min={1}
              max={99}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              value={jersey}
              onChange={(e) => setJersey(Number(e.target.value))}
            />
          </label>
          <button
            type="button"
            disabled={!canAdvanceStep0}
            onClick={() => setStep(1)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900">Pick a position</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {POSITIONS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPosition(p.id)}
                className={`rounded-lg border px-4 py-3 text-left text-sm shadow-sm ${
                  position === p.id
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-zinc-300 bg-white hover:bg-zinc-50"
                }`}
              >
                <div className="font-semibold text-zinc-900">{p.title}</div>
                <div className="text-xs text-zinc-600">{p.blurb}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Next
            </button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900">Pick an archetype</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {ARCHETYPES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setArchetype(a.id)}
                className={`rounded-lg border px-4 py-3 text-left text-sm shadow-sm ${
                  archetype === a.id
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-zinc-300 bg-white hover:bg-zinc-50"
                }`}
              >
                <div className="font-semibold text-zinc-900">{a.title}</div>
                <div className="text-xs text-zinc-600">{a.blurb}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Next
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900">
            Favorite MLB team
          </h2>
          <div className="grid max-h-[420px] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
            {MLB_TEAMS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFavoriteTeam(t.name)}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm shadow-sm ${
                  favoriteTeam === t.name
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-zinc-300 bg-white hover:bg-zinc-50"
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-md text-xs font-bold text-white ${t.swatch}`}
                >
                  {t.id}
                </span>
                <span className="font-medium text-zinc-900">{t.name}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
            >
              Back
            </button>
            <button
              type="button"
              onClick={finish}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Start first game
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
