import * as React from "react";

export type ActivityEvent = {
  ts: number;
  type: string;
  meta?: Record<string, unknown>;
};

export type Profile = {
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  xp: number;
  activity: ActivityEvent[];
};

const KEY = "trackora:profile:v1";
const DEFAULT: Profile = {
  streak: 0,
  lastActiveDate: null,
  xp: 0,
  activity: [],
};

let state: Profile = DEFAULT;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    /* noop */
  }
}

function persist() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }
  listeners.forEach((l) => l());
}

function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isConsecutive(prev: string, today: string): boolean {
  const p = new Date(prev + "T00:00:00").getTime();
  const t = new Date(today + "T00:00:00").getTime();
  return t - p === 86_400_000;
}

function bumpStreak() {
  const today = dayKey();
  if (state.lastActiveDate === today) return;
  let streak: number;
  if (state.lastActiveDate && isConsecutive(state.lastActiveDate, today))
    streak = state.streak + 1;
  else streak = 1;
  state = { ...state, streak, lastActiveDate: today };
}

export function logActivity(
  type: string,
  meta?: Record<string, unknown>,
): void {
  hydrate();
  bumpStreak();
  const evt: ActivityEvent = { ts: Date.now(), type, meta };
  state = { ...state, activity: [...state.activity, evt].slice(-300) };
  persist();
}

export function addXP(
  amount: number,
  type: string,
  meta?: Record<string, unknown>,
): void {
  hydrate();
  bumpStreak();
  const evt: ActivityEvent = {
    ts: Date.now(),
    type,
    meta: { ...meta, xp: amount },
  };
  state = {
    ...state,
    xp: state.xp + amount,
    activity: [...state.activity, evt].slice(-300),
  };
  persist();
}

export function getProfile(): Profile {
  hydrate();
  return state;
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useProfile(): Profile {
  return React.useSyncExternalStore(
    subscribe,
    getProfile,
    () => DEFAULT,
  );
}
