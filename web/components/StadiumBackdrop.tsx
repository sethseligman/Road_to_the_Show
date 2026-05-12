import type { ReactNode } from "react";

export function StadiumBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 text-zinc-900">
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-6">{children}</div>
    </div>
  );
}
