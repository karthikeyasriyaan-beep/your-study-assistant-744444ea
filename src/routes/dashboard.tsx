import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Target,
  Timer,
  MessageSquare,
  BarChart3,
  BookOpen,
  Sparkles,
  Trash2,
  Beaker,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Brain,
  Layers,
  Zap,
  Flame,
} from "lucide-react";
import { useFocusTopic, setFocusTopic } from "@/lib/focus-topic-store";
import {
  useStudySessions,
  addSession,
  resetSessions,
  type StudySession,
} from "@/lib/study-sessions-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Home — Stutora" },
      {
        name: "description",
        content:
          "Your daily study home — active focus topic, endurance timer, tutor and analytics in one glance.",
      },
      { property: "og:title", content: "Home — Stutora" },
      {
        property: "og:description",
        content:
          "Live study orchestration across textbook vault, chat AI, focus timer, and analytics.",
      },
    ],
  }),
});

function DashboardPage() {
  const focus = useFocusTopic();
  const sessions = useStudySessions();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-6 pt-3 sm:px-6 lg:px-8 lg:pt-6">
      <Greeting />
      <ActiveFocusCard focus={focus} />
      <QuickActionsGrid />
      <TelemetrySummary sessions={sessions} />
      <RecentSessions sessions={sessions} />
      <TestingTray />
    </div>
  );
}

function Greeting() {
  const { t } = useI18n();
  const hour = new Date().getHours();
  const greet =
    hour < 5 ? t("dash.greet.late") : hour < 12 ? t("dash.greet.morning") : hour < 17 ? t("dash.greet.afternoon") : t("dash.greet.evening");
  return (
    <div className="lg:hidden">
      <div className="font-ui text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
        {greet}
      </div>
      <h1 className="mt-0.5 font-display text-2xl leading-tight">
        {t("dash.tagline")}
      </h1>
    </div>
  );
}

function ActiveFocusCard({ focus }: { focus: ReturnType<typeof useFocusTopic> }) {
  if (!focus) {
    return (
      <Link
        to="/materials"
        className="group relative block overflow-hidden rounded-3xl border border-white/[0.08] bg-primary/10 p-5 shadow-lg shadow-primary/10 transition active:scale-[0.99]"
      >
        <div className="relative flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-background/60 text-primary ring-1 ring-inset ring-white/10 backdrop-blur">
            <Target className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-ui text-[10px] uppercase tracking-[0.22em] text-primary">
              Start here
            </div>
            <div className="mt-0.5 font-display text-lg leading-tight">
              Pick a chapter to focus
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Tutor, timer & quiz sync to it
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-0.5" />
        </div>
      </Link>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-primary/10 p-5 shadow-lg shadow-primary/10">
      <div className="relative">
        <div className="flex items-center gap-2 font-ui text-[10px] uppercase tracking-[0.22em] text-primary">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Active focus
        </div>
        <div className="mt-2 font-display text-xl leading-tight">
          {focus.subject} · {focus.title}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="rounded-full border border-white/[0.08] bg-background/50 px-2 py-0.5 font-ui">
            Class {focus.classLevel}
          </span>
          <span className="rounded-full border border-white/[0.08] bg-background/50 px-2 py-0.5 font-ui">
            {focus.board}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/management/timer"
            search={{ class: undefined, subject: undefined, chapter: undefined }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-ui text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 transition active:scale-95"
          >
            <Timer className="h-3.5 w-3.5" /> Start timer
          </Link>
          <Link
            to="/productivity/quiz"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-background/60 px-4 py-2 font-ui text-xs font-semibold backdrop-blur transition active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" /> Quick quiz
          </Link>
        </div>
      </div>
    </div>
  );
}

type Cat = {
  to: string;
  label: string;
  icon: typeof Brain;
  color: string;
  ring: string;
};

const CATS: Cat[] = [
  { to: "/", label: "AI Tutor", icon: Brain, color: "bg-fuchsia-500/10", ring: "text-fuchsia-400" },
  { to: "/materials", label: "Books", icon: BookOpen, color: "bg-sky-500/10", ring: "text-sky-400" },
  { to: "/productivity/flashcards", label: "Flashcards", icon: Layers, color: "bg-amber-500/10", ring: "text-amber-400" },
  { to: "/productivity/quiz", label: "Quiz", icon: Sparkles, color: "bg-emerald-500/10", ring: "text-emerald-400" },
  { to: "/management/timer", label: "Timer", icon: Timer, color: "bg-rose-500/10", ring: "text-rose-400" },
  { to: "/management/planner", label: "Planner", icon: Zap, color: "bg-violet-500/10", ring: "text-violet-400" },
  { to: "/management/analytics", label: "Stats", icon: BarChart3, color: "bg-teal-500/10", ring: "text-teal-400" },
];

function CategoryRail() {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-0.5">
        <h2 className="font-display text-sm">Explore</h2>
        <span className="font-ui text-[10px] uppercase tracking-widest text-muted-foreground">
          Swipe →
        </span>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        {CATS.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.to + c.label}
              to={c.to}
              className={`group relative flex w-[92px] shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border border-white/[0.06] ${c.color} p-3 transition active:scale-95`}
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-background/60 ring-1 ring-inset ring-white/10 backdrop-blur">
                <Icon className={`h-5 w-5 ${c.ring}`} />
              </div>
              <div className="font-ui text-[11px] font-medium leading-none tracking-tight text-foreground">
                {c.label}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function QuickActionsGrid() {
  return (
    <section>
      <h2 className="mb-2 px-0.5 font-display text-sm">Jump back in</h2>
      <div className="grid grid-cols-2 gap-3">
        <BigTile
          to="/"
          icon={<MessageSquare className="h-5 w-5" />}
          title="Chat AI"
          desc="Hints on active topic"
          tint="bg-primary/10"
        />
        <BigTile
          to="/management/timer"
          icon={<Timer className="h-5 w-5" />}
          title="Deep focus"
          desc="3-hour exam mode"
          tint="bg-rose-500/10"
        />
        <BigTile
          to="/materials"
          icon={<BookOpen className="h-5 w-5" />}
          title="Vault"
          desc="Textbooks & videos"
          tint="bg-sky-500/10"
        />
        <BigTile
          to="/management/analytics"
          icon={<BarChart3 className="h-5 w-5" />}
          title="Insights"
          desc="Focus & discipline"
          tint="bg-emerald-500/10"
        />
      </div>
    </section>
  );
}

function BigTile({
  to,
  icon,
  title,
  desc,
  tint,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  tint: string;
}) {
  return (
    <Link
      to={to}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.06] ${tint} bg-card/40 p-4 backdrop-blur transition active:scale-[0.98]`}
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-background/60 text-primary ring-1 ring-inset ring-white/10">
        {icon}
      </div>
      <div className="mt-6">
        <div className="font-display text-base leading-tight">{title}</div>
        <div className="mt-0.5 font-ui text-[11px] text-muted-foreground">
          {desc}
        </div>
      </div>
    </Link>
  );
}

function TelemetrySummary({ sessions }: { sessions: StudySession[] }) {
  const last7 = sessions.filter((s) => {
    const t = new Date(s.timestamp).getTime();
    return Date.now() - t <= 7 * 24 * 60 * 60 * 1000;
  });
  const totalFocus = last7.reduce((a, s) => a + s.actualFocusSeconds, 0);
  const totalSwitches = last7.reduce((a, s) => a + s.tabSwitchesCount, 0);
  const cleanFullscreen = last7.filter((s) => s.wasFullscreenMaintained).length;

  const hours = Math.floor(totalFocus / 3600);
  const mins = Math.floor((totalFocus % 3600) / 60);

  return (
    <section>
      <h2 className="mb-2 px-0.5 font-display text-sm">This week</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Sessions" value={String(last7.length)} icon={<Flame className="h-3.5 w-3.5" />} />
        <StatCard label="Focused" value={`${hours}h ${mins}m`} icon={<Timer className="h-3.5 w-3.5" />} />
        <StatCard
          label="Tab switches"
          value={String(totalSwitches)}
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          tone={totalSwitches > 10 ? "warn" : "default"}
        />
        <StatCard
          label="Clean runs"
          value={`${cleanFullscreen}/${last7.length || 0}`}
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          tone="good"
        />
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "default" | "good" | "warn";
}) {
  const toneCls =
    tone === "good"
      ? "text-emerald-400"
      : tone === "warn"
        ? "text-amber-400"
        : "text-primary";
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-card/50 p-3 backdrop-blur">
      <div className={`flex items-center gap-1.5 font-ui text-[10px] uppercase tracking-widest ${toneCls}`}>
        {icon}
        {label}
      </div>
      <div className="mt-1.5 font-display text-xl leading-none tabular-nums">
        {value}
      </div>
    </div>
  );
}

function RecentSessions({ sessions }: { sessions: StudySession[] }) {
  const recent = [...sessions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  if (recent.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-0.5">
        <h2 className="font-display text-sm">Recent runs</h2>
        <Link
          to="/management/analytics"
          className="font-ui text-[11px] font-medium text-primary"
        >
          See all →
        </Link>
      </div>
      <div className="space-y-2">
        {recent.map((s) => {
          const focusPct = s.totalDurationSeconds
            ? Math.round((s.actualFocusSeconds / s.totalDurationSeconds) * 100)
            : 0;
          const mins = Math.round(s.totalDurationSeconds / 60);
          return (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-card/50 p-3 backdrop-blur"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-ui text-sm font-semibold">
                  {s.chapterTitle}
                </div>
                <div className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.subject} · {mins}m · {new Date(s.timestamp).toLocaleDateString()}
                </div>
              </div>
              <div
                className={`shrink-0 rounded-full px-2.5 py-1 font-ui text-[11px] font-semibold ${
                  focusPct >= 90
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-amber-500/15 text-amber-400"
                }`}
              >
                {focusPct}%
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TestingTray() {
  const [open, setOpen] = useState(false);
  const focus = useFocusTopic();

  const appendMockThreeHourRun = () => {
    const session: StudySession = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2),
      timestamp: new Date().toISOString(),
      classLevel: focus?.classLevel ?? "12",
      subject: focus?.subject ?? "Physics",
      chapterTitle: focus?.title ?? "Mock 3-Hour Simulation",
      totalDurationSeconds: 10800,
      actualFocusSeconds: 10620,
      tabSwitchesCount: 1,
      tabSwitchDetails: [{ timeOffsetSeconds: 5400, durationAwaySeconds: 180 }],
      fullscreenExitsCount: 0,
      wasFullscreenMaintained: true,
    };
    addSession(session);
    toast.success("Mock 3-hour session appended.");
  };

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-card/50 backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 font-ui text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        <Beaker className="h-3.5 w-3.5 text-primary" />
        Debug tray
        {open ? (
          <ChevronUp className="ml-auto h-4 w-4" />
        ) : (
          <ChevronDown className="ml-auto h-4 w-4" />
        )}
      </button>
      {open && (
        <div className="grid gap-2 border-t border-white/[0.06] p-3 sm:grid-cols-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFocusTopic(null);
              toast.success("Focus cleared.");
            }}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Clear focus
          </Button>
          <Button variant="outline" size="sm" onClick={appendMockThreeHourRun}>
            <Sparkles className="mr-2 h-3.5 w-3.5" /> Mock 3h run
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetSessions(true);
              toast.success("Sessions reseeded.");
            }}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Reseed demo
          </Button>
        </div>
      )}
    </section>
  );
}
