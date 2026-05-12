export type StatToast = { id: string; label: string; delta: number };

export function StatChangeToast({ toasts }: { toasts: StatToast[] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto rounded-lg border border-emerald-700 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg"
        >
          {t.delta >= 0 ? "+" : ""}
          {t.delta} {t.label}
        </div>
      ))}
    </div>
  );
}
