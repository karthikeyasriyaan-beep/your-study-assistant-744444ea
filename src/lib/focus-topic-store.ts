import * as React from "react";

export type FocusTopic = {
  chapterId: string;
  title: string;
  subject: string;
  classLevel: string;
  board: string;
  setAt: number;
};

const KEY = "trackora:focus-topic:v1";
let state: FocusTopic | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch {
    /* noop */
  }
}

function persist() {
  if (typeof window !== "undefined") {
    try {
      if (state) window.localStorage.setItem(KEY, JSON.stringify(state));
      else window.localStorage.removeItem(KEY);
    } catch {
      /* noop */
    }
  }
  listeners.forEach((l) => l());
}

export function setFocusTopic(t: Omit<FocusTopic, "setAt"> | null) {
  hydrate();
  state = t ? { ...t, setAt: Date.now() } : null;
  persist();
}

export function getFocusTopic(): FocusTopic | null {
  hydrate();
  return state;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useFocusTopic(): FocusTopic | null {
  return React.useSyncExternalStore(subscribe, getFocusTopic, () => null);
}
