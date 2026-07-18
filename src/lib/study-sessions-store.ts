import * as React from "react";

export interface TabSwitchDetail {
  timeOffsetSeconds: number;
  durationAwaySeconds: number;
}

export interface StudySession {
  id: string;
  timestamp: string;
  classLevel: string;
  subject: string;
  chapterTitle: string;
  totalDurationSeconds: number;
  actualFocusSeconds: number;
  tabSwitchesCount: number;
  tabSwitchDetails: TabSwitchDetail[];
  fullscreenExitsCount: number;
  wasFullscreenMaintained: boolean;
}

const KEY = "trackora:study-sessions:v1";
let state: StudySession[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function migrate(s: Partial<StudySession> & { id: string }): StudySession {
  return {
    id: s.id,
    timestamp: s.timestamp ?? new Date().toISOString(),
    classLevel: s.classLevel ?? "10",
    subject: s.subject ?? "Mathematics",
    chapterTitle: s.chapterTitle ?? "Untitled",
    totalDurationSeconds: s.totalDurationSeconds ?? 0,
    actualFocusSeconds: s.actualFocusSeconds ?? 0,
    tabSwitchesCount: s.tabSwitchesCount ?? 0,
    tabSwitchDetails: s.tabSwitchDetails ?? [],
    fullscreenExitsCount: s.fullscreenExitsCount ?? 0,
    wasFullscreenMaintained:
      s.wasFullscreenMaintained ?? (s.fullscreenExitsCount ?? 0) === 0,
  };
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Array<Partial<StudySession> & { id: string }>;
      state = parsed.map(migrate);
    } else {
      state = [];
    }
  } catch {
    state = [];
  }
}

function persistRaw() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

function persist() {
  persistRaw();
  listeners.forEach((l) => l());
}

export function getSessions(): StudySession[] {
  hydrate();
  return state;
}

export function addSession(s: StudySession) {
  hydrate();
  state = [...state, s];
  persist();
}

export function resetSessions(seedMock = false) {
  state = seedMock ? generateMockSessions() : [];
  persist();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStudySessions(): StudySession[] {
  return React.useSyncExternalStore(subscribe, getSessions, () => []);
}

// ---------- Mock generator: Class 10 — Math, Physical Science, Biological Science ----------
function daysAgoISO(d: number, hour = 16) {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function generateMockSessions(): StudySession[] {
  return [
    {
      id: uid(),
      timestamp: daysAgoISO(0, 9),
      classLevel: "10",
      subject: "Mathematics",
      chapterTitle: "Quadratic Equations",
      totalDurationSeconds: 10800,
      actualFocusSeconds: 10800,
      tabSwitchesCount: 0,
      tabSwitchDetails: [],
      fullscreenExitsCount: 0,
      wasFullscreenMaintained: true,
    },
    {
      id: uid(),
      timestamp: daysAgoISO(1, 17),
      classLevel: "10",
      subject: "Physical Science",
      chapterTitle: "Light – Reflection and Refraction",
      totalDurationSeconds: 5400,
      actualFocusSeconds: 4680,
      tabSwitchesCount: 4,
      tabSwitchDetails: [
        { timeOffsetSeconds: 600, durationAwaySeconds: 180 },
        { timeOffsetSeconds: 1800, durationAwaySeconds: 120 },
        { timeOffsetSeconds: 3200, durationAwaySeconds: 240 },
        { timeOffsetSeconds: 4600, durationAwaySeconds: 180 },
      ],
      fullscreenExitsCount: 2,
      wasFullscreenMaintained: false,
    },
    {
      id: uid(),
      timestamp: daysAgoISO(3, 19),
      classLevel: "10",
      subject: "Mathematics",
      chapterTitle: "Trigonometry",
      totalDurationSeconds: 7200,
      actualFocusSeconds: 6900,
      tabSwitchesCount: 2,
      tabSwitchDetails: [
        { timeOffsetSeconds: 2400, durationAwaySeconds: 150 },
        { timeOffsetSeconds: 5400, durationAwaySeconds: 150 },
      ],
      fullscreenExitsCount: 0,
      wasFullscreenMaintained: true,
    },
    {
      id: uid(),
      timestamp: daysAgoISO(5, 16),
      classLevel: "10",
      subject: "Biological Science",
      chapterTitle: "Life Processes",
      totalDurationSeconds: 3600,
      actualFocusSeconds: 2700,
      tabSwitchesCount: 6,
      tabSwitchDetails: [
        { timeOffsetSeconds: 300, durationAwaySeconds: 120 },
        { timeOffsetSeconds: 900, durationAwaySeconds: 180 },
        { timeOffsetSeconds: 1500, durationAwaySeconds: 150 },
        { timeOffsetSeconds: 2100, durationAwaySeconds: 150 },
        { timeOffsetSeconds: 2700, durationAwaySeconds: 120 },
        { timeOffsetSeconds: 3300, durationAwaySeconds: 180 },
      ],
      fullscreenExitsCount: 3,
      wasFullscreenMaintained: false,
    },
  ];
}
