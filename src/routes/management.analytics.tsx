import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  History,
  Maximize2,
  RotateCcw,
  Shield,
  ShieldAlert,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  resetSessions,
  useStudySessions,
  type StudySession,
} from "@/lib/study-sessions-store";

export const Route = createFileRoute("/management/analytics")({
  component: AnalyticsPage,
  ssr: false,
});

const GRADES = ["All", "6", "7", "8", "9", "10"] as const;
const FULL_SESSION_SECONDS = 10800;
const CHART_COLORS = [
  "hsl(var(--primary))",
  "#f97316",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

function AnalyticsPage() {
  const sessions = useStudySessions();
  const [grade, setGrade] = useState<string>("All");
  const [subject, setSubject] = useState<string>("All");
  const [timelineSessionId, setTimelineSessionId] = useState<string>("__latest");

  const gradeFiltered = useMemo(
    () => (grade === "All" ? sessions : sessions.filter((s) => s.classLevel === grade)),
    [sessions, grade],
  );

  const subjectsAvailable = useMemo(() => {
    const set = new Set(gradeFiltered.map((s) => s.subject));
    return ["All", ...Array.from(set).sort()];
  }, [gradeFiltered]);

  // Sync subject when grade changes
  const effectiveSubject = subjectsAvailable.includes(subject) ? subject : "All";
  if (effectiveSubject !== subject) {
    queueMicrotask(() => setSubject(effectiveSubject));
  }

  const filtered = useMemo(
    () =>
      effectiveSubject === "All"
        ? gradeFiltered
        : gradeFiltered.filter((s) => s.subject === effectiveSubject),
    [gradeFiltered, effectiveSubject],
  );

  if (sessions.length === 0) {
    return <EmptyState />;
  }

  const metrics = computeCumulativeMetrics(filtered);
  const trend = compute7DayTrend(filtered);
  const distribution = computeSubjectDistribution(filtered);
  const diagnostics = computeDiagnostics(filtered, distribution);

  const sortedByRecent = [...filtered].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  const timelineSession =
    timelineSessionId === "__latest"
      ? sortedByRecent[0]
      : sortedByRecent.find((s) => s.id === timelineSessionId) ?? sortedByRecent[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <BarChart3 className="h-5 w-5 text-primary" /> Study Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            Diagnostic telemetry across {filtered.length} session
            {filtered.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm("Reset all logged sessions? This cannot be undone.")) {
              resetSessions(false);
            }
          }}
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Reset data
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-xl border bg-card p-3">
        <FilterGroup
          label="Grade"
          value={grade}
          options={[...GRADES]}
          onChange={setGrade}
        />
        <FilterGroup
          label="Subject"
          value={effectiveSubject}
          options={subjectsAvailable}
          onChange={setSubject}
        />
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          icon={<Target className="h-4 w-4" />}
          label="Mean focus accuracy"
          value={`${metrics.meanFocusAccuracy.toFixed(1)}%`}
        />
        <MetricCard
          icon={<Clock className="h-4 w-4" />}
          label="Net study investment"
          value={`${metrics.netHours.toFixed(1)} h`}
        />
        <MetricCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completed 3-hr simulations"
          value={`${metrics.completedSimulations}`}
        />
        <MetricCard
          icon={<Activity className="h-4 w-4" />}
          label="Mean distraction window"
          value={
            metrics.meanDistractionWindow > 0
              ? `${metrics.meanDistractionWindow.toFixed(0)}s`
              : "—"
          }
        />
        <MetricCard
          icon={<Maximize2 className="h-4 w-4" />}
          label="Fullscreen integrity"
          value={`${metrics.fullscreenIntegrity.toFixed(0)}%`}
        />
      </div>

      {/* 7-day trend */}
      <Panel
        title="7-day study trend"
        icon={<TrendingUp className="h-4 w-4" />}
      >
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <AreaChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" fontSize={11} />
              <YAxis fontSize={11} unit="m" />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(v: number, name: string) => [`${v} min`, name]}
                labelFormatter={(l: string, p) => {
                  const item = p?.[0]?.payload as TrendRow | undefined;
                  return item?.chapters?.length
                    ? `${l} · ${item.chapters.join(", ")}`
                    : l;
                }}
              />
              <Area
                type="monotone"
                dataKey="totalMinutes"
                name="Total"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey="focusMinutes"
                name="Focus"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attention timeline */}
        <Panel
          title="Attention timeline"
          icon={<Activity className="h-4 w-4" />}
          action={
            sortedByRecent.length > 1 ? (
              <select
                value={timelineSessionId}
                onChange={(e) => setTimelineSessionId(e.target.value)}
                className="rounded-md border bg-background px-2 py-1 text-xs"
              >
                <option value="__latest">Latest session</option>
                {sortedByRecent.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.timestamp).toLocaleDateString()} ·{" "}
                    {s.chapterTitle}
                  </option>
                ))}
              </select>
            ) : null
          }
        >
          {timelineSession ? (
            <AttentionTimeline session={timelineSession} />
          ) : (
            <p className="text-sm text-muted-foreground">No session available.</p>
          )}
        </Panel>

        {/* Syllabus distribution */}
        <Panel
          title="Syllabus distribution"
          icon={<BookOpen className="h-4 w-4" />}
        >
          {distribution.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="h-48">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="minutes"
                      nameKey="subject"
                      innerRadius={40}
                      outerRadius={70}
                    >
                      {distribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [`${v} min`, "Time"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-1.5 text-sm">
                {distribution.map((d, i) => (
                  <li key={d.subject} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      {d.subject}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {d.percentage.toFixed(0)}% · {d.minutes}m
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
      </div>

      {/* Session history */}
      <Panel title="Session history" icon={<History className="h-4 w-4" />}>
        <SessionHistory sessions={sortedByRecent} />
      </Panel>

      {/* Diagnostics */}
      <Panel title="Diagnostic heuristics" icon={<Brain className="h-4 w-4" />}>
        {diagnostics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No diagnostic flags — keep going.
          </p>
        ) : (
          <ul className="space-y-2">
            {diagnostics.map((d, i) => (
              <li
                key={i}
                className={`flex gap-2 rounded-lg border p-3 text-sm ${toneClass(d.tone)}`}
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <div className="font-semibold">{d.title}</div>
                  <div className="text-xs opacity-90">{d.message}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

// ---------- Sub-components ----------

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              value === o
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function AttentionTimeline({ session }: { session: StudySession }) {
  const points = session.tabSwitchDetails.map((d) => ({
    leftPct: Math.min(100, (d.timeOffsetSeconds / session.totalDurationSeconds) * 100),
    widthPct: Math.min(
      100,
      (d.durationAwaySeconds / session.totalDurationSeconds) * 100,
    ),
    durationAwaySeconds: d.durationAwaySeconds,
  }));

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        <strong className="text-foreground">{session.chapterTitle}</strong> ·{" "}
        {session.subject} · {Math.round(session.totalDurationSeconds / 60)} min
      </div>
      <div className="relative h-10 w-full rounded-md bg-emerald-500/15">
        {points.map((p, i) => (
          <div
            key={i}
            className="absolute top-0 h-full bg-destructive/70"
            style={{
              left: `${p.leftPct}%`,
              width: `${Math.max(p.widthPct, 0.5)}%`,
            }}
            title={`Away ${p.durationAwaySeconds}s`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>0:00</span>
        <span>
          {session.tabSwitchesCount} switch
          {session.tabSwitchesCount === 1 ? "" : "es"}
        </span>
        <span>{formatHMS(session.totalDurationSeconds)}</span>
      </div>
    </div>
  );
}

function SessionHistory({ sessions }: { sessions: StudySession[] }) {
  const rows = sessions.slice(0, 8);
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No sessions logged yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="pb-2 pr-2 font-medium">When</th>
            <th className="pb-2 pr-2 font-medium">Subject / Chapter</th>
            <th className="pb-2 pr-2 text-right font-medium">Duration</th>
            <th className="pb-2 pr-2 text-right font-medium">Focus</th>
            <th className="pb-2 pr-2 text-right font-medium">Tab switches</th>
            <th className="pb-2 font-medium">Fullscreen</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const focusPct =
              s.totalDurationSeconds > 0
                ? (s.actualFocusSeconds / s.totalDurationSeconds) * 100
                : 0;
            const focusTone =
              focusPct >= 90
                ? "text-emerald-500"
                : focusPct >= 75
                  ? "text-amber-500"
                  : "text-destructive";
            return (
              <tr key={s.id} className="border-b last:border-0">
                <td className="py-2 pr-2 text-xs text-muted-foreground">
                  {new Date(s.timestamp).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="py-2 pr-2">
                  <div className="font-medium">{s.chapterTitle}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Class {s.classLevel} · {s.subject}
                  </div>
                </td>
                <td className="py-2 pr-2 text-right font-mono text-xs">
                  {formatHMS(s.totalDurationSeconds)}
                </td>
                <td className={`py-2 pr-2 text-right font-mono text-xs ${focusTone}`}>
                  {focusPct.toFixed(0)}%
                </td>
                <td className="py-2 pr-2 text-right font-mono text-xs">
                  {s.tabSwitchesCount}
                </td>
                <td className="py-2">
                  {s.wasFullscreenMaintained ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                      <Shield className="h-3 w-3" /> Maintained
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                      <ShieldAlert className="h-3 w-3" /> {s.fullscreenExitsCount} exit
                      {s.fullscreenExitsCount === 1 ? "" : "s"}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed bg-muted/30 p-10 text-center">
      <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 className="mt-3 text-lg font-semibold">No sessions logged yet</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Run a focus timer block to populate analytics, or seed with realistic
        Class 10 sample data.
      </p>
      <Button className="mt-4" onClick={() => resetSessions(true)}>
        Seed sample data
      </Button>
    </div>
  );
}

// ---------- Computations ----------

type TrendRow = {
  label: string;
  totalMinutes: number;
  focusMinutes: number;
  chapters: string[];
};

function computeCumulativeMetrics(rows: StudySession[]) {
  const totalDuration = rows.reduce((n, r) => n + r.totalDurationSeconds, 0);
  const totalFocus = rows.reduce((n, r) => n + r.actualFocusSeconds, 0);
  const totalSwitches = rows.reduce((n, r) => n + r.tabSwitchesCount, 0);
  const totalAway = rows.reduce(
    (n, r) => n + r.tabSwitchDetails.reduce((m, d) => m + d.durationAwaySeconds, 0),
    0,
  );
  const completedSimulations = rows.filter(
    (r) =>
      r.totalDurationSeconds === FULL_SESSION_SECONDS &&
      r.tabSwitchesCount === 0 &&
      r.fullscreenExitsCount === 0,
  ).length;
  const fullscreenMaintained = rows.filter((r) => r.wasFullscreenMaintained).length;

  return {
    meanFocusAccuracy: totalDuration > 0 ? (totalFocus / totalDuration) * 100 : 0,
    netHours: totalDuration / 3600,
    completedSimulations,
    meanDistractionWindow: totalSwitches > 0 ? totalAway / totalSwitches : 0,
    fullscreenIntegrity:
      rows.length > 0 ? (fullscreenMaintained / rows.length) * 100 : 0,
  };
}

function compute7DayTrend(rows: StudySession[]): TrendRow[] {
  const days: TrendRow[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayKey = d.toDateString();
    const matches = rows.filter(
      (r) => new Date(r.timestamp).toDateString() === dayKey,
    );
    days.push({
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      totalMinutes: Math.round(
        matches.reduce((n, r) => n + r.totalDurationSeconds, 0) / 60,
      ),
      focusMinutes: Math.round(
        matches.reduce((n, r) => n + r.actualFocusSeconds, 0) / 60,
      ),
      chapters: Array.from(new Set(matches.map((r) => r.chapterTitle))),
    });
  }
  return days;
}

type DistributionRow = { subject: string; minutes: number; percentage: number };

function computeSubjectDistribution(rows: StudySession[]): DistributionRow[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.subject, (map.get(r.subject) ?? 0) + r.totalDurationSeconds);
  }
  const totalSecs = Array.from(map.values()).reduce((n, v) => n + v, 0);
  return Array.from(map.entries())
    .map(([subject, secs]) => ({
      subject,
      minutes: Math.round(secs / 60),
      percentage: totalSecs > 0 ? (secs / totalSecs) * 100 : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);
}

type Diagnostic = {
  title: string;
  message: string;
  tone: "info" | "warn" | "danger";
};

function computeDiagnostics(
  rows: StudySession[],
  distribution: DistributionRow[],
): Diagnostic[] {
  const out: Diagnostic[] = [];
  if (rows.length === 0) return out;

  const totalDuration = rows.reduce((n, r) => n + r.totalDurationSeconds, 0);
  const totalFocus = rows.reduce((n, r) => n + r.actualFocusSeconds, 0);
  const meanFocusAccuracy = totalDuration > 0 ? (totalFocus / totalDuration) * 100 : 0;

  // Focus depth assessment (>90% Stable, <75% Fragmented)
  if (meanFocusAccuracy > 90) {
    out.push({
      title: "Focus depth: Stable",
      message: `Mean focus accuracy is ${meanFocusAccuracy.toFixed(
        1,
      )}% — exam-grade cognitive stamina.`,
      tone: "info",
    });
  } else if (meanFocusAccuracy < 75) {
    out.push({
      title: "Focus depth: Fragmented",
      message: `Mean focus accuracy is ${meanFocusAccuracy.toFixed(
        1,
      )}%. Attention is drifting — rebuild with shorter, distraction-free sprints.`,
      tone: "warn",
    });
  }

  // Distraction frequency warning (>3 switches in any session)
  const noisy = rows.filter((r) => r.tabSwitchesCount > 3);
  if (noisy.length > 0) {
    out.push({
      title: "Distraction frequency high",
      message: `${noisy.length} session${
        noisy.length === 1 ? "" : "s"
      } logged more than 3 tab switches. Close external browser tabs and background applications before your next block.`,
      tone: "danger",
    });
  }

  // Syllabus balance (>55% dominance)
  const dominant = distribution.find((d) => d.percentage > 55);
  if (dominant) {
    const others = distribution
      .filter((d) => d.subject !== dominant.subject)
      .map((d) => d.subject);
    out.push({
      title: "Syllabus imbalance",
      message: `${dominant.subject} commands ${dominant.percentage.toFixed(
        0,
      )}% of your logged time. Allocate upcoming focus sessions to ${
        others.length ? others.join(", ") : "underrepresented subjects"
      }.`,
      tone: "warn",
    });
  }

  // Fullscreen discipline (exits > 0)
  const interrupted = rows.filter((r) => r.fullscreenExitsCount > 0);
  if (interrupted.length > 0) {
    const totalExits = interrupted.reduce((n, r) => n + r.fullscreenExitsCount, 0);
    const hours =
      interrupted.reduce((n, r) => n + r.totalDurationSeconds, 0) / 3600;
    const ratePerHour = hours > 0 ? totalExits / hours : 0;
    out.push({
      title: "Interrupted Environment",
      message: `${interrupted.length} session${
        interrupted.length === 1 ? "" : "s"
      } exited fullscreen — ${totalExits} exit${
        totalExits === 1 ? "" : "s"
      } total (${ratePerHour.toFixed(
        2,
      )}/hr of study). Establish physical desk boundaries and silence device notifications.`,
      tone: "danger",
    });
  }

  return out;
}

function toneClass(t: Diagnostic["tone"]) {
  if (t === "danger") return "border-destructive/40 bg-destructive/10 text-destructive";
  if (t === "warn") return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400";
  return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
}

function formatHMS(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
