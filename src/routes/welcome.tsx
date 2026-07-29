import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Zap,
  MessageCircleQuestion,
  BookOpen,
  Timer,
  ListChecks,
  Check,
  GraduationCap,
} from "lucide-react";
import { measureFps, usePerf } from "@/lib/perf";
import { MiniAskAI } from "@/components/mini-ask-ai";

const VISITED_KEY = "stutora:welcomed";
const MINT = "#5FE3C4";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Stutora — Study smarter, not scattered" },
      {
        name: "description",
        content:
          "Stutora brings your Telangana board and NCERT chapters, an AI tutor that explains in the margin, practice questions, and a focus timer into one calm space built for exam season.",
      },
      { property: "og:title", content: "Stutora — Study smarter, not scattered" },
      {
        property: "og:description",
        content: "One tab. Every doubt, answered — right where you're reading.",
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
      if (window.localStorage.getItem("stutora:perf-mode")) return;
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_70%)]"
      />

      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="font-display text-lg leading-none">Stutora</div>
        </div>
        <button
          onClick={enter}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 font-ui text-xs text-foreground/80 backdrop-blur transition hover:border-primary/40 hover:text-foreground"
        >
          Enter <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* HERO */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-14 pt-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-12">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-ui text-[10px] uppercase tracking-[0.28em] text-muted-foreground backdrop-blur">
            Built for Telangana board · Classes 6–Inter
          </div>
          <h1 className="mt-5 font-display text-[40px] leading-[1.05] tracking-tight sm:text-6xl lg:text-[66px]">
            Your textbook,
            <br />
            <span className="italic text-muted-foreground/70">with an AI</span>
            <br />
            in the margins.
          </h1>
          <p className="mx-auto mt-5 max-w-md font-ui text-[15px] leading-relaxed text-muted-foreground lg:mx-0">
            Stop switching between five tabs to understand one line. Stutora
            reads your chapter with you, explains the confusing part right
            there, and tracks the time you actually spend studying.
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
            {["Free forever", "No signup needed", "NCERT + state board"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <span className="grid h-4 w-4 place-items-center rounded-full border border-primary/40 text-primary">
                  <Check className="h-2.5 w-2.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* SIGNATURE: textbook page with AI margin note */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[32px] blur-2xl"
            style={{
              background: `radial-gradient(50% 50% at 50% 50%, color-mix(in oklab, ${MINT} 18%, transparent), transparent 75%)`,
            }}
          />
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Physics · Ch 4 · Laws of Motion
              </span>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-background/60 p-5 font-ui text-[13px] leading-[1.9] text-foreground/70">
              <p>
                Every object continues in its state of rest, or of uniform
                motion in a straight line, unless it is compelled to change
                that state by{" "}
                <span className="relative inline">
                  <span
                    className="relative z-10 text-foreground"
                    style={{ boxShadow: `inset 0 -2px 0 0 ${MINT}` }}
                  >
                    forces impressed
                  </span>
                </span>{" "}
                upon it. This principle is known as the law of inertia.
              </p>
            </div>

            {/* floating margin note */}
            <div
              className="relative mt-4 ml-6 max-w-[85%] rounded-2xl border p-3.5"
              style={{
                borderColor: "color-mix(in oklab, " + MINT + " 35%, transparent)",
                background: "color-mix(in oklab, " + MINT + " 8%, transparent)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" style={{ color: MINT }} />
                <span className="font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: MINT }}>
                  Stutora AI
                </span>
              </div>
              <p className="mt-1.5 font-ui text-[12.5px] leading-relaxed text-foreground/85">
                "Forces impressed" just means a push or pull from outside —
                like your hand stopping a rolling ball. No push, no change.
              </p>
            </div>
          </div>
          <p className="mt-3 text-center font-ui text-[11px] text-muted-foreground">
            Highlight anything. The AI explains it, right where you're reading.
          </p>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-14">
        <div className="text-center">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
            Everything exam season needs, one place.
          </h2>
          <p className="mx-auto mt-3 max-w-lg font-ui text-sm text-muted-foreground">
            No more one app for notes, one for doubts, one for timing yourself.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={MessageCircleQuestion}
            title="Ask any doubt"
            body="Full explanations and worked examples, grounded in the exact chapter you're on."
            tag="AI Tutor"
          />
          <FeatureCard
            icon={BookOpen}
            title="Your real syllabus"
            body="NCERT and Telangana state board chapters, organised by class — nothing extra to search for."
            tag="Materials"
          />
          <FeatureCard
            icon={ListChecks}
            title="Practice that adapts"
            body="Quiz yourself chapter by chapter and see exactly where marks are slipping."
            tag="Practice"
          />
          <FeatureCard
            icon={Timer}
            title="Time that counts"
            body="A focus timer that logs every session by subject, so revision isn't a guess."
            tag="Focus"
          />
        </div>
      </section>

      {/* TRY AI */}
      <section className="mx-auto w-full max-w-2xl px-6 pb-14">
        <div className="mb-2 flex items-center justify-center gap-2 font-ui text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Try it — ask a real doubt
        </div>
        <div className="mb-4 text-center font-ui text-xs text-muted-foreground">
          No signup needed. Ask anything from your syllabus.
        </div>
        <MiniAskAI />
      </section>

      {/* HOW IT WORKS — legitimate sequence, numbered */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-14">
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur">
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              How it works
            </div>
            <h3 className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">
              Four steps, every single session.
            </h3>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StepPill n="1" title="Pick a chapter" body="From your class and subject list" />
            <StepPill n="2" title="Read, or ask" body="Highlight anything confusing" />
            <StepPill n="3" title="Practice it" body="A few questions to check it stuck" />
            <StepPill n="4" title="See your time" body="Logged automatically, by subject" />
          </div>
        </div>
      </section>

      {/* COVERAGE STRIP */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-14">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="font-ui text-sm font-medium text-foreground">
                Classes 6 through Intermediate
              </div>
              <div className="font-ui text-xs text-muted-foreground">
                Telangana State Board · NCERT aligned
              </div>
            </div>
          </div>
          <button
            onClick={enter}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 font-ui text-xs font-medium text-foreground transition hover:bg-white/[0.06]"
          >
            See your class <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* WHY STUTORA */}
      <section className="mx-auto w-full max-w-4xl px-6 pb-16">
        <div className="text-center">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
            Studying shouldn't feel scattered.
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Without Stutora
            </div>
            <ul className="mt-3 space-y-2 font-ui text-sm text-muted-foreground">
              <li>A YouTube tab for every doubt</li>
              <li>PDFs scattered across downloads</li>
              <li>No idea how much you actually studied</li>
            </ul>
          </div>
          <div
            className="rounded-2xl border p-5"
            style={{
              borderColor: "color-mix(in oklab, " + MINT + " 30%, transparent)",
              background: "color-mix(in oklab, " + MINT + " 6%, transparent)",
            }}
          >
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: MINT }}>
              With Stutora
            </div>
            <ul className="mt-3 space-y-2 font-ui text-sm text-foreground/85">
              <li>Doubts explained in the margin, instantly</li>
              <li>Every chapter, already organised by class</li>
              <li>A clear log of every minute, by subject</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-16 text-center">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
          Open your first chapter.
        </h2>
        <p className="mx-auto mt-3 max-w-lg font-ui text-sm text-muted-foreground">
          No signup needed to explore. Just open it and start.
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

function FeatureCard({
  icon: Icon,
  title,
  body,
  tag,
}: {
  icon: typeof MessageCircleQuestion;
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
