import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  BookOpen,
  Timer,
  Mic,
  Camera,
  Check,
} from "lucide-react";
import { measureFps, usePerf } from "@/lib/perf";
import { MiniAskAI } from "@/components/mini-ask-ai";

const VISITED_KEY = "trackora:welcomed";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to Trackora — Your Study OS" },
      {
        name: "description",
        content:
          "Trackora unites AI tutoring, NCERT materials, flashcards, and focus timers into one calm, focused study space.",
      },
      { property: "og:title", content: "Trackora — Study OS" },
      {
        property: "og:description",
        content: "AI tutor, materials, practice, and focus — in one place.",
      },
    ],
  }),
  component: Welcome,
  ssr: false,
});

function Welcome() {
  const navigate = useNavigate();
  const { setMode } = usePerf();
  const [askLite, setAskLite] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      if (window.localStorage.getItem("trackora:perf-mode")) return;
    } catch {}
    const id = window.setTimeout(async () => {
      const fps = await measureFps(800);
      if (!cancelled && fps < 45) setAskLite(true);
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  const enter = () => {
    try {
      window.localStorage.setItem(VISITED_KEY, "1");
    } catch {}
    navigate({ to: "/dashboard" });
  };

  const choose = (m: "full" | "lite") => {
    setMode(m);
    setAskLite(false);
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-background text-foreground">
      {/* ambient background wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_70%)]"
      />

      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="font-display text-lg leading-none">Trackora</div>
        </div>
        <button
          onClick={enter}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 font-ui text-xs text-foreground/80 backdrop-blur transition hover:border-primary/40 hover:text-foreground"
        >
          Enter <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* HERO — bold two-tone headline, CTAs, preview */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-14 pt-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-12">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-ui text-[10px] uppercase tracking-[0.28em] text-muted-foreground backdrop-blur">
            Study OS · v4
          </div>
          <h1 className="mt-5 font-display text-[44px] leading-[1.02] tracking-tight sm:text-6xl lg:text-[72px]">
            Where did<br />
            <span className="text-foreground">your week</span>
            <br />
            <span className="text-muted-foreground/60">actually go?</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md font-ui text-[15px] leading-relaxed text-muted-foreground lg:mx-0">
            Trackora shows you — in seconds. Ask a doubt, open a chapter, or
            start a focus session. Your syllabus, tutor, and study time,
            finally in one place.
          </p>

          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <button
              onClick={enter}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-ui text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 active:scale-[0.98] sm:w-auto"
            >
              Start studying free
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={enter}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-6 py-3.5 font-ui text-sm font-medium text-foreground transition hover:bg-white/[0.06] sm:w-auto"
            >
              See how it works
            </button>
          </div>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-ui text-xs text-muted-foreground lg:justify-start">
            {["Free forever", "No signup needed", "Works offline"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <span className="grid h-4 w-4 place-items-center rounded-full border border-primary/40 text-primary">
                  <Check className="h-2.5 w-2.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Preview card */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[32px] bg-[radial-gradient(50%_50%_at_50%_50%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_75%)] blur-2xl"
          />
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-4 shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-1.5 px-1">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
              <span className="ml-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                trackora / today
              </span>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-background/60 p-5">
              <div className="font-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Focus time today
              </div>
              <div className="mt-1 font-display text-4xl tracking-tight">
                2h 14m
              </div>
              <div className="mt-1 font-ui text-xs text-muted-foreground">
                On track — 46m to your daily goal
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <MiniStat label="Physics" value="52m" tint="hsl(210 90% 60%)" />
                <MiniStat label="Maths" value="48m" tint="hsl(160 70% 50%)" />
                <MiniStat label="Chem" value="34m" tint="hsl(280 70% 65%)" />
              </div>

              <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between font-ui text-xs">
                  <span className="text-muted-foreground">Active focus</span>
                  <span className="text-foreground">Laws of Motion</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full w-[64%] rounded-full bg-primary" />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center font-ui text-[11px] text-muted-foreground">
            Your dashboard — focus, subjects and daily goal, in one view.
          </p>
        </div>
      </section>

      {/* THREE WAYS — echoes trackora's rhythm */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-14">
        <div className="text-center">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
            Ask it. Open it. Time it.
          </h2>
          <p className="mx-auto mt-3 max-w-lg font-ui text-sm text-muted-foreground">
            Three ways to study — all faster than opening another tab.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FeatureCard
            icon={Brain}
            title="Ask any doubt"
            body="A tutor that gives full explanations, examples, and formulas — grounded in your current focus."
            tag="AI Tutor"
          />
          <FeatureCard
            icon={BookOpen}
            title="Open your chapter"
            body="NCERT & Inter materials organised by class and subject. Jump straight to what you need."
            tag="Materials"
          />
          <FeatureCard
            icon={Timer}
            title="Start a session"
            body="Focus timer with subject, chapter and streaks. Every minute counts toward your goal."
            tag="Focus"
          />
        </div>
      </section>

      {/* TRY AI — third meaningful section, as per prior direction */}
      <section className="mx-auto w-full max-w-2xl px-6 pb-14">
        <div className="mb-2 flex items-center justify-center gap-2 font-ui text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Try our AI — ask a quick doubt
        </div>
        <div className="mb-4 text-center font-ui text-xs text-muted-foreground">
          It knows your active focus and recent sessions. No signup needed.
        </div>
        <MiniAskAI />
      </section>

      {/* HOW IT SYNCS */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-14">
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                Autocontext
              </div>
              <h3 className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">
                One focus. Everywhere in the app.
              </h3>
              <p className="mt-3 font-ui text-sm leading-relaxed text-muted-foreground">
                Set a chapter as your focus and the whole app follows —
                dashboard, timer, and the AI tutor all know what you're
                studying. Ask "explain this" and it just works.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <StepPill n="1" title="Pick a chapter" body="From Materials or the Timer" />
              <StepPill n="2" title="Start focusing" body="Timer logs your session" />
              <StepPill n="3" title="Ask the tutor" body='"Explain this" — it knows' />
              <StepPill n="4" title="See it on your dash" body="Streaks & subject totals" />
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-16 text-center">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
          Start knowing where your study time goes.
        </h2>
        <p className="mx-auto mt-3 max-w-lg font-ui text-sm text-muted-foreground">
          No signup needed to explore. Just open it and start learning.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={enter}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-ui text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 sm:w-auto"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
          <span className="font-ui text-[11px] text-muted-foreground">
            AI can make mistakes — please double check important information.
          </span>
        </div>
      </section>

      {askLite && <PerfDialog onChoose={choose} />}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: tint }}
        />
        <span className="font-ui text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-1 font-display text-lg leading-none">{value}</div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  tag,
}: {
  icon: typeof Brain;
  title: string;
  body: string;
  tag: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur transition hover:border-primary/30 hover:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          {tag}
        </span>
      </div>
      <div className="mt-4 font-display text-lg tracking-tight">{title}</div>
      <p className="mt-1.5 font-ui text-[13px] leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

function StepPill({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 font-mono text-xs text-primary ring-1 ring-inset ring-primary/25">
        {n}
      </div>
      <div>
        <div className="font-ui text-sm font-medium text-foreground">
          {title}
        </div>
        <div className="font-ui text-[11px] text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}

function PerfDialog({ onChoose }: { onChoose: (m: "full" | "lite") => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-card p-5 shadow-2xl">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg">Smoother experience?</h2>
        </div>
        <p className="mt-2 font-ui text-sm leading-relaxed text-muted-foreground">
          Your device seems to be working hard. Lite mode turns off gradients
          and background effects for a faster, calmer feel.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => onChoose("full")}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 font-ui text-sm font-medium text-foreground transition hover:bg-white/[0.06]"
          >
            Keep full
          </button>
          <button
            onClick={() => onChoose("lite")}
            className="rounded-xl bg-primary px-3 py-2.5 font-ui text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            Use Lite
          </button>
        </div>
        <div className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Change anytime in the sidebar
        </div>
      </div>
    </div>
  );
}
