// Lightweight spaced-repetition state. Stored in localStorage.

export type Rating = "hard" | "medium" | "easy";

export type CardSchedule = {
  /** Epoch ms when card becomes due again. 0 = due now (Hard within session). */
  dueAt: number;
  lastRating?: Rating;
  reviewCount: number;
};

const KEY = "srs:v1";
const DAY = 24 * 60 * 60 * 1000;

type Store = Record<string, CardSchedule>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}") as Store;
  } catch {
    return {};
  }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function loadSchedule(): Store {
  return read();
}

export function rateCard(cardId: string, rating: Rating): CardSchedule {
  const store = read();
  const prev = store[cardId];
  const now = Date.now();
  const next: CardSchedule = {
    reviewCount: (prev?.reviewCount ?? 0) + 1,
    lastRating: rating,
    dueAt:
      rating === "hard"
        ? 0 // immediate — re-queue in current session
        : rating === "medium"
          ? now + 3 * DAY
          : now + 7 * DAY,
  };
  store[cardId] = next;
  write(store);
  return next;
}

export function isDueNow(schedule: CardSchedule | undefined): boolean {
  if (!schedule) return true; // unseen — due
  return schedule.dueAt <= Date.now();
}

export function dueInLabel(schedule: CardSchedule | undefined): string {
  if (!schedule || schedule.dueAt === 0) return "due now";
  const diff = schedule.dueAt - Date.now();
  if (diff <= 0) return "due now";
  const days = Math.round(diff / DAY);
  return days <= 1 ? "due tomorrow" : `due in ${days}d`;
}
