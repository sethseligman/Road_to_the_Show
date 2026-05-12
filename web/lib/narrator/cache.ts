import type { NarrateRequest } from "@/lib/narrator/types";

const TTL_SECONDS = 60 * 60 * 24 * 30;
const MAX_VARIATIONS = 5;
const KV_PREFIX = "narr:v1:";

type VariationBucket = { variations: string[] };

function cacheKeyFor(req: NarrateRequest): string {
  const outcome =
    req.phase === "outcome" ? req.result.outcome_type : "na";
  return `${req.phase}:${req.scene_type}:${outcome}:${req.stakes}`;
}

async function getKv(): Promise<
  typeof import("@vercel/kv").kv | null
> {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null;
  }
  try {
    const { kv } = await import("@vercel/kv");
    return kv;
  } catch {
    return null;
  }
}

export async function readCachedVariation(
  req: NarrateRequest,
): Promise<string | null> {
  const kv = await getKv();
  if (!kv) return null;
  const key = KV_PREFIX + cacheKeyFor(req);
  try {
    const raw = await kv.get<string | VariationBucket>(key);
    if (!raw) return null;
    const parsed =
      typeof raw === "string"
        ? (JSON.parse(raw) as VariationBucket)
        : (raw as VariationBucket);
    if (!parsed.variations?.length) return null;
    const pick =
      parsed.variations[Math.floor(Math.random() * parsed.variations.length)];
    return pick ?? null;
  } catch {
    return null;
  }
}

export async function appendCachedVariation(
  req: NarrateRequest,
  prose: string,
): Promise<void> {
  const kv = await getKv();
  if (!kv) return;
  const key = KV_PREFIX + cacheKeyFor(req);
  try {
    const raw = await kv.get<string | VariationBucket>(key);
    let bucket: VariationBucket = !raw
      ? { variations: [] }
      : typeof raw === "string"
        ? (JSON.parse(raw) as VariationBucket)
        : (raw as VariationBucket);
    if (!bucket.variations) bucket = { variations: [] };
    bucket.variations.push(prose);
    if (bucket.variations.length > MAX_VARIATIONS) {
      bucket.variations = bucket.variations.slice(-MAX_VARIATIONS);
    }
    await kv.set(key, JSON.stringify(bucket), { ex: TTL_SECONDS });
  } catch {
    /* ignore cache write failures */
  }
}
