"use client";

import { useSyncExternalStore } from "react";
import { loadPlayer, PLAYER_CHANGED_EVENT } from "@/lib/storage/save";
import type { Player } from "@/types/game";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(PLAYER_CHANGED_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(PLAYER_CHANGED_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function getSnapshot(): Player | null {
  return loadPlayer();
}

function getServerSnapshot(): Player | null {
  return null;
}

/** Stable snapshot for home / read-only views (localStorage-backed). */
export function useSavedPlayer(): Player | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
