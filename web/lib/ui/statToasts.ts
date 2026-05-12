import type { StatToast } from "@/components/StatChangeToast";

function capitalize(s: string): string {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

export function statToastsFromDeltas(
  deltas: Partial<Record<string, number>>,
): StatToast[] {
  return Object.entries(deltas)
    .filter(([, v]) => v != null && v !== 0)
    .map(([k, v]) => ({
      id: `${k}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      label: capitalize(k),
      delta: v as number,
    }));
}
