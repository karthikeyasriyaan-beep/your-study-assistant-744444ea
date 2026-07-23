import * as React from "react";
import type { UIMessage } from "ai";

export type TutorConversation = {
  id: string;
  title: string;
  subject?: string;
  createdAt: number;
  updatedAt: number;
  messages: UIMessage[];
};

const KEY = "trackora:tutor-convos:v1";
const ACTIVE_KEY = "trackora:tutor-convos:active";

let convos: TutorConversation[] = [];
let activeId: string | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) convos = JSON.parse(raw) as TutorConversation[];
    activeId = window.localStorage.getItem(ACTIVE_KEY);
  } catch {
    convos = [];
  }
}

function persist() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(convos));
      if (activeId) window.localStorage.setItem(ACTIVE_KEY, activeId);
      else window.localStorage.removeItem(ACTIVE_KEY);
    } catch {
      /* noop */
    }
  }
  listeners.forEach((l) => l());
}

export function getConversations(): TutorConversation[] {
  hydrate();
  return convos;
}

export function getActiveId(): string | null {
  hydrate();
  return activeId;
}

export function setActive(id: string | null) {
  hydrate();
  activeId = id;
  persist();
}

export function createConversation(subject?: string): TutorConversation {
  hydrate();
  const c: TutorConversation = {
    id: "c-" + crypto.randomUUID(),
    title: "New chat",
    subject,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
  convos = [c, ...convos];
  activeId = c.id;
  persist();
  return c;
}

export function updateConversation(
  id: string,
  patch: Partial<Omit<TutorConversation, "id">>,
) {
  hydrate();
  convos = convos.map((c) =>
    c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c,
  );
  persist();
}

export function deleteConversation(id: string) {
  hydrate();
  convos = convos.filter((c) => c.id !== id);
  if (activeId === id) activeId = convos[0]?.id ?? null;
  persist();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useConversations(): {
  conversations: TutorConversation[];
  activeId: string | null;
} {
  const conversations = React.useSyncExternalStore(
    subscribe,
    getConversations,
    () => [] as TutorConversation[],
  );
  const active = React.useSyncExternalStore(subscribe, getActiveId, () => null);
  return { conversations, activeId: active };
}

export function groupByDate(convos: TutorConversation[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOfWeek = startOfToday - 6 * 86400000;

  const groups: { label: string; items: TutorConversation[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "This week", items: [] },
    { label: "Earlier", items: [] },
  ];
  for (const c of convos) {
    if (c.updatedAt >= startOfToday) groups[0].items.push(c);
    else if (c.updatedAt >= startOfYesterday) groups[1].items.push(c);
    else if (c.updatedAt >= startOfWeek) groups[2].items.push(c);
    else groups[3].items.push(c);
  }
  return groups.filter((g) => g.items.length > 0);
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function subjectColor(subject?: string): string {
  if (!subject) return "hsl(220 10% 60%)";
  const s = subject.toLowerCase();
  if (s.includes("phys")) return "hsl(210 90% 60%)";
  if (s.includes("chem")) return "hsl(280 70% 65%)";
  if (s.includes("math")) return "hsl(160 70% 50%)";
  if (s.includes("bio") || s.includes("bot") || s.includes("zoo")) return "hsl(140 65% 55%)";
  if (s.includes("eng")) return "hsl(30 90% 60%)";
  if (s.includes("hist") || s.includes("soc")) return "hsl(0 70% 65%)";
  return "hsl(45 90% 60%)";
}