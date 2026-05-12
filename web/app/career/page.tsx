import Link from "next/link";

export default function CareerPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Career hub</h1>
      <p className="mt-3 text-sm text-zinc-700">
        The full career hub (player card, season map, “Play next game”) ships in
        Milestone 3. For now, head home to keep playing your saved career.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
      >
        Back home
      </Link>
    </main>
  );
}
