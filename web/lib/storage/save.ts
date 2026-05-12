import { normalizePlayerForStorage } from "@/lib/player/factory";
import type { Player } from "@/types/game";

const STORAGE_KEY = "rttb:player:v1";
export const PLAYER_CHANGED_EVENT = "rttb:player-changed";

let cachedRaw: string | null | undefined;
let cachedPlayer: Player | null | undefined;

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function loadPlayer(): Player | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = readRaw();
    if (!raw) {
      cachedRaw = null;
      cachedPlayer = null;
      return null;
    }
    if (raw === cachedRaw && cachedPlayer !== undefined) {
      return cachedPlayer;
    }
    cachedRaw = raw;
    cachedPlayer = normalizePlayerForStorage(JSON.parse(raw) as Player);
    return cachedPlayer;
  } catch {
    cachedRaw = undefined;
    cachedPlayer = undefined;
    return null;
  }
}

export function savePlayer(player: Player): void {
  if (typeof window === "undefined") return;
  const normalized = normalizePlayerForStorage(player);
  const raw = JSON.stringify(normalized);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedPlayer = normalized;
  window.dispatchEvent(new Event(PLAYER_CHANGED_EVENT));
}

export function clearPlayer(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  cachedRaw = null;
  cachedPlayer = null;
  window.dispatchEvent(new Event(PLAYER_CHANGED_EVENT));
}
