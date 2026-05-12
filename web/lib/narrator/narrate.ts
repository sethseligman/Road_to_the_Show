import type {
  NarrateRequest,
  NarrateResponse,
} from "@/lib/narrator/types";
import { buildFallbackProse } from "@/lib/narrator/fallback";

export async function narrate(req: NarrateRequest): Promise<NarrateResponse> {
  try {
    const res = await fetch("/api/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      return { prose: buildFallbackProse(req), source: "fallback" };
    }
    return (await res.json()) as NarrateResponse;
  } catch {
    return { prose: buildFallbackProse(req), source: "fallback" };
  }
}
