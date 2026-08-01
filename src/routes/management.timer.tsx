import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
  Square,
  Lock,
  Maximize2,
  Minimize2,
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Shield,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  addSession,
  type StudySession,
  type TabSwitchDetail,
} from "@/lib/study-sessions-store";
import { addXP } from "@/lib/profile-store";
import { setFocusTopic } from "@/lib/focus-topic-store";

export const Route = createFileRoute("/management/timer")({
  validateSearch: (search: Record<string, unknown>) => ({
    class: typeof search['class'] === "string" ? (search['class'] as string) : undefined,
    subject: typeof search['subject'] === "string" ? (search['subject'] as string) : undefined,
    chapter: typeof search['chapter'] === "string" ? (search['chapter'] as string) : undefined,
  }),
  component: FocusTimer,
  ssr: false,
});

/** Web Audio chime — no network dep. */
const playBellChime = () => {
  try {
    const AC =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const now = ctx.currentTime;
    const note = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.4, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    };
    note(523.25, now, 1.5);
    note(659.25, now + 0.25, 1.5);
    note(783.99, now + 0.5, 2.0);
    note(1046.5, now + 0.85, 2.5);
  } catch (e) {
    console.warn("Audio blocked:", e);
  }
};

const SYLLABUS_CHAPTERS: Record<string, Record<string, string[]>> = {
  "10": {
    Mathematics: ["Real Numbers", "Polynomials", "Quadratic Equations", "Progressions", "Coordinate Geometry", "Trigonometry", "Probability"],
    "Physical Science": ["Reflection of Light", "Chemical Equations", "Acids, Bases and Salts", "Refraction at Curved Surfaces", "Human Eye", "Carbon and its Compounds"],
    "Biological Science": ["Nutrition", "Respiration", "Transportation", "Excretion", "Coordination"],
    "Social Studies": ["Ideas of Development", "Production and Employment", "India: Relief Features", "Climate of India", "Rivers and Water Resources"],
  },
  "9": {
    Mathematics: ["Real Numbers", "Polynomials", "Geometry", "Linear Equations", "Triangles", "Statistics"],
    "Physical Science": ["Matter Around Us", "Motion", "Laws of Motion", "Refraction at Plane Surfaces", "Gravitation", "Atoms and Molecules"],
    "Biological Science": ["Cell Structure", "Plant Tissues", "Animal Tissues", "Diversity in Living Organisms"],
    "Social Studies": ["Our Earth", "Hydrosphere", "Atmosphere", "Biosphere", "Agriculture"],
  },
  "8": {
    Mathematics: ["Rational Numbers", "Linear Equations", "Quadrilaterals", "Exponents", "Factorisation"],
    "Physical Science": ["Force", "Friction", "Metals and Non-Metals", "Coal and Petroleum", "Combustion"],
    "Biological Science": ["Cell Basics", "Microorganisms", "Reproduction in Animals", "Adolescence"],
    "Social Studies": ["Maps", "Energy from the Sun", "Seasons", "Forests"],
  },
  "7": {
    Mathematics: ["Integers", "Fractions", "Simple Equations", "Lines and Angles", "Triangles", "Data Handling"],
    "Physical Science": ["Food Components", "Acids and Bases", "Motion and Time", "Heat", "Weather"],
    "Biological Science": ["Nutrition in Plants", "Respiration", "Transportation", "Reproduction in Plants", "Forests"],
    "Social Studies": ["Maps", "Rain and Rivers", "Europe", "Africa", "Handicrafts"],
  },
  "6": {
    Mathematics: ["Knowing Our Numbers", "Whole Numbers", "Geometry", "Integers", "Fractions"],
    "Physical Science": ["Our Food", "Magnets", "Rain", "Materials", "Separation of Substances"],
    "Biological Science": ["Plants", "Animals", "Habitat", "Water", "Environment"],
    "Social Studies": ["Earth in Solar System", "Globe", "Maps", "Agriculture"],
  },
};

type PresetOption = {
  label: string;
  value: number;
  description: string;
  strict?: boolean;
};

const PRESETS: PresetOption[] = [
  { label: "30 Min", value: 30, description: "Short focused learning block" },
  { label: "1 Hour", value: 60, description: "Standard school period" },
  { label: "2 Hours", value: 120, description: "Advanced test preparation" },
  { label: "3 Hours", value: 180, description: "TS Board Mock Exam Simulation", strict: true },
];

type AlertTone = "info" | "warning" | "success";
type DiagAlert = { id: string; message: string; type: AlertTone };

function FocusTimer() {
  const search = Route.useSearch();
  // Config
  const [selectedClass, setSelectedClass] = useState(search.class ?? "10");
  const [selectedSubject, setSelectedSubject] = useState(
    search.subject ?? "Physical Science",
  );
  const [selectedChapter, setSelectedChapter] = useState(search.chapter ?? "");
  const [selectedPreset, setSelectedPreset] = useState<PresetOption>(PRESETS[0]);

  const isStrictSimulation = !!selectedPreset.strict;

  const availableSubjects = useMemo(() => {
    const base = Object.keys(SYLLABUS_CHAPTERS[selectedClass] ?? {});
    // a subject arriving from the materials deep-link may not be in the map
    if (search.subject && !base.includes(search.subject)) {
      return [search.subject, ...base];
    }
    return base;
  }, [selectedClass, search.subject]);
  const availableChapters = useMemo(() => {
    const base = SYLLABUS_CHAPTERS[selectedClass]?.[selectedSubject] ?? [];
    if (
      search.chapter &&
      search.subject === selectedSubject &&
      !base.includes(search.chapter)
    ) {
      return [search.chapter, ...base];
    }
    return base;
  }, [selectedClass, selectedSubject, search.chapter, search.subject]);

  useEffect(() => {
    if (!availableSubjects.includes(selectedSubject)) {
      setSelectedSubject(availableSubjects[0] ?? "");
    }
  }, [availableSubjects, selectedSubject]);

  useEffect(() => {
    setSelectedChapter((prev: string) =>
      prev && availableChapters.includes(prev)
        ? prev
        : (availableChapters[0] ?? ""),
    );
  }, [availableChapters]);

  // Timer state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalSecondsSet, setTotalSecondsSet] = useState(selectedPreset.value * 60);
  const [timeLeft, setTimeLeft] = useState(selectedPreset.value * 60);

  useEffect(() => {
    if (!isActive) {
      setTotalSecondsSet(selectedPreset.value * 60);
      setTimeLeft(selectedPreset.value * 60);
    }
  }, [selectedPreset, isActive]);

  // Telemetry
  const [tabSwitchesCount, setTabSwitchesCount] = useState(0);
  const [tabSwitchDetails, setTabSwitchDetails] = useState<TabSwitchDetail[]>([]);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [wasFullscreenMaintained, setWasFullscreenMaintained] = useState(true);

  const [diagnosticAlerts, setDiagnosticAlerts] = useState<DiagAlert[]>([]);
  const [lastReport, setLastReport] = useState<StudySession | null>(null);

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const hiddenTimeRef = useRef<number | null>(null);

  const addAlert = (message: string, type: AlertTone = "info") => {
    const id = Math.random().toString(36).slice(2);
    setDiagnosticAlerts((p) => [{ id, message, type }, ...p].slice(0, 5));
    setTimeout(() => {
      setDiagnosticAlerts((p) => p.filter((a) => a.id !== id));
    }, 5000);
  };

  // Visibility tracking
  useEffect(() => {
    if (!isActive || isPaused) return;
    const onVis = () => {
      if (document.hidden) {
        hiddenTimeRef.current = Date.now();
        setTabSwitchesCount((p) => p + 1);
        addAlert("Tab hidden — attention break recorded.", "warning");
      } else if (hiddenTimeRef.current && sessionStartTimeRef.current) {
        const durationAway = Math.round((Date.now() - hiddenTimeRef.current) / 1000);
        const timeOffset = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
        setTabSwitchDetails((p) => [
          ...p,
          { timeOffsetSeconds: timeOffset, durationAwaySeconds: durationAway },
        ]);
        addAlert(`Returned after ${durationAway}s away.`, "info");
        hiddenTimeRef.current = null;
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [isActive, isPaused]);

  // Fullscreen tracking
  useEffect(() => {
    const onFs = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreenActive(active);
      if (isActive && isStrictSimulation && !active) {
        setFullscreenExits((p) => p + 1);
        setWasFullscreenMaintained(false);
        addAlert("Lock screen exited — strict simulation compromised.", "warning");
      }
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [isActive, isStrictSimulation]);

  // Ticker
  useEffect(() => {
    if (!isActive || isPaused) return;
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.setTimeout(() => completeSession(true), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isPaused]);

  // Beforeunload guard
  useEffect(() => {
    if (!isActive) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [isActive]);

  const triggerFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        addAlert("Browser blocked auto-fullscreen. Enable manually.", "warning");
      });
    }
  };

  const exitFullscreenSafely = () => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const startSession = () => {
    if (!selectedChapter) {
      addAlert("Select a chapter before starting.", "warning");
      return;
    }
    setLastReport(null);
    setTabSwitchesCount(0);
    setTabSwitchDetails([]);
    setFullscreenExits(0);
    setWasFullscreenMaintained(true);
    const total = selectedPreset.value * 60;
    setTotalSecondsSet(total);
    setTimeLeft(total);
    sessionStartTimeRef.current = Date.now();
    setIsActive(true);
    setIsPaused(false);
    setFocusTopic({
      chapterId: `timer:${selectedClass}:${selectedSubject}:${selectedChapter}`,
      title: selectedChapter,
      subject: selectedSubject,
      classLevel: selectedClass,
      board: "Telangana SCERT",
    });
    if (isStrictSimulation) triggerFullscreen();
    addAlert(`Session started: ${selectedChapter}`, "success");
  };

  const completeSession = (natural: boolean) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const start = sessionStartTimeRef.current ?? Date.now();
    const elapsed = Math.min(
      totalSecondsSet,
      Math.round((Date.now() - start) / 1000),
    );
    const distractionSeconds = tabSwitchDetails.reduce(
      (n, d) => n + d.durationAwaySeconds,
      0,
    );
    const focus = Math.max(0, elapsed - distractionSeconds);

    const session: StudySession = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2),
      timestamp: new Date(start).toISOString(),
      classLevel: selectedClass,
      subject: selectedSubject,
      chapterTitle: selectedChapter,
      totalDurationSeconds: natural ? totalSecondsSet : elapsed,
      actualFocusSeconds: focus,
      tabSwitchesCount,
      tabSwitchDetails,
      fullscreenExitsCount: fullscreenExits,
      wasFullscreenMaintained: wasFullscreenMaintained && fullscreenExits === 0,
    };

    addSession(session);
    setLastReport(session);
    setIsActive(false);
    setIsPaused(false);
    sessionStartTimeRef.current = null;
    exitFullscreenSafely();

    if (natural) {
      playBellChime();
      addXP(50, "timer.complete", {
        subject: selectedSubject,
        chapter: selectedChapter,
        distractions: tabSwitchesCount,
      });
      addAlert("Session complete — telemetry saved to Analytics.", "success");
    } else {
      addAlert("Session ended early. Partial telemetry saved.", "info");
    }
  };

  const stopEarly = () => {
    if (isStrictSimulation) {
      addAlert("Strict simulation cannot be stopped early.", "warning");
      return;
    }
    completeSession(false);
  };

  const togglePause = () => {
    if (isStrictSimulation) {
      addAlert("Pausing disabled in strict simulation.", "warning");
      return;
    }
    setIsPaused((p) => !p);
  };

  const progress =
    totalSecondsSet === 0 ? 0 : ((totalSecondsSet - timeLeft) / totalSecondsSet) * 100;

  return (
    <div className="space-y-6">
      {/* Diagnostic alerts */}
      {diagnosticAlerts.length > 0 && (
        <div className="space-y-2">
          {diagnosticAlerts.map((a) => (
            <div
              key={a.id}
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                a.type === "warning"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                  : a.type === "success"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                    : "border-border bg-muted/60"
              }`}
            >
              {a.type === "warning" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : a.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              {a.message}
            </div>
          ))}
        </div>
      )}

      {/* Config */}
      {!isActive && (
        <div className="rounded-2xl border bg-card p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="h-4 w-4 text-primary" /> Session configuration
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Class">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
              >
                {Object.keys(SYLLABUS_CHAPTERS).map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Subject">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
              >
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Chapter">
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
              >
                {availableChapters.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-5">
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              Duration preset
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {PRESETS.map((p) => {
                const active = selectedPreset.value === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => setSelectedPreset(p)}
                    className={`rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{p.label}</span>
                      {p.strict && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                          <Lock className="h-3 w-3" /> strict
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {p.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={startSession} className="mt-5 w-full sm:w-auto">
            <Play className="mr-2 h-4 w-4" /> Begin focus block
          </Button>
        </div>
      )}

      {/* Live timer */}
      {isActive && (
        <div className="rounded-2xl border bg-card p-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {selectedSubject} · {selectedChapter}
          </div>
          <div className="font-mono text-6xl font-bold tabular-nums">
            {hms(timeLeft)}
          </div>
          <div className="mx-auto mt-4 h-2 max-w-md overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {!isStrictSimulation && (
              <Button variant="outline" size="sm" onClick={togglePause}>
                {isPaused ? "Resume" : "Pause"}
              </Button>
            )}
            {!isStrictSimulation && (
              <Button variant="outline" size="sm" onClick={stopEarly}>
                <Square className="mr-1.5 h-3.5 w-3.5" /> End early
              </Button>
            )}
            {isStrictSimulation && !isFullscreenActive && (
              <Button variant="outline" size="sm" onClick={triggerFullscreen}>
                <Maximize2 className="mr-1.5 h-3.5 w-3.5" /> Re-enter lock screen
              </Button>
            )}
            {isStrictSimulation && isFullscreenActive && (
              <Button variant="ghost" size="sm" onClick={exitFullscreenSafely}>
                <Minimize2 className="mr-1.5 h-3.5 w-3.5" /> Exit fullscreen
              </Button>
            )}
          </div>

          {isStrictSimulation && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">
              <Shield className="h-3.5 w-3.5" />
              Board-exam simulation — pause and end disabled
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat icon={<Activity className="h-4 w-4" />} label="Tab switches" value={`${tabSwitchesCount}`} />
            <Stat
              icon={<EyeIconMini />}
              label="Distraction time"
              value={`${tabSwitchDetails.reduce((n, d) => n + d.durationAwaySeconds, 0)}s`}
            />
            <Stat
              icon={<Shield className="h-4 w-4" />}
              label="Fullscreen exits"
              value={`${fullscreenExits}`}
            />
          </div>
        </div>
      )}

      {/* Report */}
      {lastReport && !isActive && (
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> Session report saved
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {lastReport.subject} · {lastReport.chapterTitle}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <Stat
              icon={<Clock className="h-4 w-4" />}
              label="Focus retention"
              value={`${Math.round((lastReport.actualFocusSeconds / Math.max(1, lastReport.totalDurationSeconds)) * 100)}%`}
            />
            <Stat icon={<Activity className="h-4 w-4" />} label="Tab switches" value={`${lastReport.tabSwitchesCount}`} />
            <Stat icon={<Shield className="h-4 w-4" />} label="Fullscreen exits" value={`${lastReport.fullscreenExitsCount}`} />
            <Stat
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Discipline"
              value={lastReport.wasFullscreenMaintained ? "Maintained" : "Breached"}
            />
          </div>
          <Button variant="outline" className="mt-5" onClick={() => setLastReport(null)}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Start new session
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Data saved to <span className="font-mono">{LOCAL_STORAGE_KEY_LABEL}</span> — view trends in Analytics.
          </p>
        </div>
      )}
    </div>
  );
}

const LOCAL_STORAGE_KEY_LABEL = "trackora:study-sessions:v1";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function EyeIconMini() {
  return <Clock className="h-4 w-4" />;
}

function hms(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
function pad(n: number) {
  return n.toString().padStart(2, "0");
}
