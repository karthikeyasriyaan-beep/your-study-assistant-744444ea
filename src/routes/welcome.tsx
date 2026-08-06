import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
import { SYLLABUS_CHAPTERS, totalChapterCount } from "@/lib/ts-syllabus";
import { BOOK_VAULT } from "@/lib/materials-data";
import { CBSE_VAULT } from "@/lib/cbse-data";
import { INTER_MPC_VAULT } from "@/lib/inter-mpc-data";
import { INTER_BPC_VAULT } from "@/lib/inter-bipc-data";

/* ---------- real coverage numbers, derived from the app's own data ---------- */
const CHAPTER_COUNT = totalChapterCount();
const CLASS_COUNT = Object.keys(SYLLABUS_CHAPTERS).length;
const SUBJECT_COUNT = new Set(
  Object.values(SYLLABUS_CHAPTERS).flatMap((s) => Object.keys(s)),
).size;
const BOOK_COUNT =
  BOOK_VAULT.reduce(
    (n, c) =>
      n +
      c.subjects.reduce(
        (m, sub) => m + sub.boards["Telangana State Board"].length,
        0,
      ),
    0,
  ) +
  CBSE_VAULT.reduce(
    (n, c) => n + c.subjects.reduce((m, sub) => m + sub.books.length, 0),
    0,
  ) +
  INTER_MPC_VAULT.length +
  INTER_BPC_VAULT.length;

const VISITED_KEY = "stutora:welcomed";
const MINT = "#5FE3C4";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Stutora — Study like it finally makes sense" },
      {
        name: "description",
        content:
          "Your chapters, an AI tutor that explains them line by line, quick practice and a focus timer — one calm space built for Telangana board and NCERT students.",
      },
      { property: "og:title", content: "Stutora — Study like it finally makes sense" },
      {
        property: "og:description",
        content: "One quiet tab. Every doubt answered where you're reading.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Welcome,
  ssr: false,
});

/* ---------- scroll-reveal hook ---------- */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

function Welcome() {
  const navigate = useNavigate();
  const { setMode } = usePerf();
  const [askLite, setAskLite] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

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

  // hero entrance stagger — page-load only, not scroll-triggered
  const heroStep = (i: number) => ({
    transitionDelay: loaded ? `${i * 90}ms` : "0ms",
  });
  const heroClass = (i: number) =>
    `transition-all duration-700 ease-out motion-reduce:transition-none ${
      loaded ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
    }`;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_70%)]"
      />

      {/* Top bar */}
      <header
        className={`mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-6 sm:py-5 ${heroClass(0)}`}
        style={heroStep(0)}
      >
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="font-display text-lg font-bold leading-none tracking-tight">
            Stutora
          </div>
        </div>
        <button
          onClick={enter}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 font-ui text-xs text-foreground/80 backdrop-blur transition hover:border-primary/40 hover:text-foreground"
        >
          Enter <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* HERO */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-14">
        <div className="text-center lg:text-left">
          <div className={`inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 font-ui text-[11px] font-medium tracking-tight text-muted-foreground backdrop-blur ${heroClass(1)}`} style={heroStep(1)}>
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Telangana board · NCERT · Classes 6 to Inter
          </div>

          <h1 className="mt-6 font-display text-[38px] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[56px] lg:text-[70px]">
            <span className={`block ${heroClass(2)}`} style={heroStep(2)}>
              Study like it
            </span>
            <span className={`block text-muted-foreground/60 ${heroClass(3)}`} style={heroStep(3)}>
              finally makes
            </span>
            <span className={`block ${heroClass(4)}`} style={heroStep(4)}>
              sense.
            </span>
          </h1>

          <p
            className={`mx-auto mt-6 max-w-md font-ui text-[16px] leading-[1.65] tracking-[-0.01em] text-muted-foreground lg:mx-0 ${heroClass(5)}`}
            style={heroStep(5)}
          >
            One quiet place for your chapters, your doubts and your hours.
            Stutora reads along with you, explains the line you're stuck on,
            and quietly keeps score of the time you actually put in.
          </p>

          <div
            className={`mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start ${heroClass(6)}`}
            style={heroStep(6)}
          >
            <button
              onClick={enter}
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-6 py-3.5 font-ui text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 active:scale-[0.98] sm:w-auto"
            >
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full"
              />
              <span className="relative">Start studying — it's free</span>
              <ArrowRight className="relative h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={enter}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-6 py-3.5 font-ui text-sm font-medium text-foreground transition hover:bg-white/[0.06] sm:w-auto"
            >
              See how it works
            </button>
          </div>

          <ul
            className={`mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-ui text-xs text-muted-foreground lg:justify-start ${heroClass(7)}`}
            style={heroStep(7)}
          >
            {["Free forever", "No signup", "Your data stays on your device"].map((t) => (
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
        <div
          className={`relative ${heroClass(3)}`}
          style={{ ...heroStep(3), transform: loaded ? "scale(1)" : "scale(0.96)" }}
        >
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[32px] blur-2xl"
            style={{
              background: `radial-gradient(50% 50% at 50% 50%, color-mix(in oklab, ${MINT} 18%, transparent), transparent 75%)`,
            }}
          />
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-2xl backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1">
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
                <span
                  className="relative z-10 text-foreground"
                  style={{ boxShadow: `inset 0 -2px 0 0 ${MINT}` }}
                >
                  forces impressed
                </span>{" "}
                upon it. This principle is known as the law of inertia.
              </p>
            </div>

            <div
              className={`relative mt-4 ml-6 max-w-[85%] rounded-2xl border p-3.5 transition-all duration-500 ${
                loaded ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
              style={{
                borderColor: `color-mix(in oklab, ${MINT} 35%, transparent)`,
                background: `color-mix(in oklab, ${MINT} 8%, transparent)`,
                transitionDelay: loaded ? "650ms" : "0ms",
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

      <SectionDivider />

      {/* WHAT'S INSIDE */}
      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Everything exam season needs, one place.
          </h2>
          <p className="mx-auto mt-3 max-w-lg font-ui text-sm text-muted-foreground">
            No more one app for notes, one for doubts, one for timing yourself.
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal delay={0}>
            <FeatureCard
              icon={MessageCircleQuestion}
              title="Ask any doubt"
              body="Full explanations and worked examples, grounded in the exact chapter you're on."
              tag="AI Tutor"
            />
          </Reveal>
          <Reveal delay={80}>
            <FeatureCard
              icon={BookOpen}
              title="Your real syllabus"
              body="NCERT and Telangana state board chapters, organised by class — nothing extra to search for."
              tag="Materials"
            />
          </Reveal>
          <Reveal delay={160}>
            <FeatureCard
              icon={ListChecks}
              title="Practice that adapts"
              body="Quiz yourself chapter by chapter and see exactly where marks are slipping."
              tag="Practice"
            />
          </Reveal>
          <Reveal delay={240}>
            <FeatureCard
              icon={Timer}
              title="Time that counts"
              body="A focus timer that logs every session by subject, so revision isn't a guess."
              tag="Focus"
            />
          </Reveal>
        </div>
      </section>

      <SectionDivider />

      {/* TRY AI */}
      <section className="mx-auto w-full max-w-2xl px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <Reveal>
          <div className="mb-2 flex items-center justify-center gap-2 font-ui text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Try it — ask a real doubt
          </div>
          <div className="mb-4 text-center font-ui text-xs text-muted-foreground">
            No signup needed. Ask anything from your syllabus.
          </div>
          <MiniAskAI />
        </Reveal>
      </section>

      <SectionDivider />

      {/* HOW IT WORKS */}
      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <Reveal>
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur">
            <div className="text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                How it works
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
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
        </Reveal>
      </section>

      <SectionDivider />

      {/* COVERAGE — real numbers from the syllabus data in the app */}
      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <Reveal className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
            What's already loaded
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Your syllabus is already inside.
          </h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { n: CLASS_COUNT, label: "Class levels", sub: "Class 6 → Inter 2nd year" },
            { n: SUBJECT_COUNT, label: "Subjects", sub: "Core school + MPC & BiPC" },
            { n: CHAPTER_COUNT, label: "Chapters", sub: "Selectable in the focus timer" },
            { n: BOOK_COUNT, label: "Textbooks", sub: "SCERT, NCERT and TSBIE links" },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <div className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 sm:p-5">
                <div className="font-display text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
                  {stat.n}
                </div>
                <div className="mt-1 font-ui text-[13px] font-semibold text-foreground/90">
                  {stat.label}
                </div>
                <div className="mt-1 font-ui text-[11px] leading-relaxed text-muted-foreground">
                  {stat.sub}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-ui text-sm font-semibold text-foreground">
                  Telangana State Board · NCERT · TSBIE Intermediate
                </div>
                <div className="font-ui text-xs text-muted-foreground">
                  Pick your class and every lesson is already listed.
                </div>
              </div>
            </div>
            <button
              onClick={enter}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 font-ui text-xs font-medium text-foreground transition hover:bg-white/[0.06] active:scale-[0.98] sm:w-auto"
            >
              See your class <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </Reveal>
      </section>

      <SectionDivider />

      {/* WHY STUTORA */}
      <section className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Studying shouldn't feel scattered.
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Reveal delay={0}>
            <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Without Stutora
              </div>
              <ul className="mt-3 space-y-2 font-ui text-sm text-muted-foreground">
                <li>A YouTube tab for every doubt</li>
                <li>PDFs scattered across downloads</li>
                <li>No idea how much you actually studied</li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div
              className="h-full rounded-2xl border p-5"
              style={{
                borderColor: `color-mix(in oklab, ${MINT} 30%, transparent)`,
                background: `color-mix(in oklab, ${MINT} 6%, transparent)`,
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
          </Reveal>
        </div>
      </section>

      <SectionDivider />

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <Reveal className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
            FAQ
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Questions students actually ask.
          </h2>
        </Reveal>
        <div className="mt-8 space-y-2.5">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <FaqItem q={f.q} a={f.a} />
            </Reveal>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* FINAL CTA */}
      <section className="mx-auto w-full max-w-3xl px-5 py-16 text-center sm:px-6 sm:py-24">
        <Reveal>
          <h2 className="font-display text-3xl tracking-tight sm:text-[42px]">
            Open one chapter tonight.
          </h2>
          <p className="mx-auto mt-3 max-w-lg font-ui text-[15px] leading-relaxed text-muted-foreground">
            No signup, no setup. Pick a subject and the next twenty minutes
            take care of themselves.
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
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto w-full max-w-6xl px-5 pb-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 sm:flex-row">
          <span className="font-ui text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Stutora · Built for students, not advertisers.
          </span>
          <Link
            to="/privacy"
            className="font-ui text-[11px] text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
          >
            Privacy & Data Trust
          </Link>
        </div>
      </footer>

      {askLite && <PerfDialog onChoose={choose} />}
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </div>
  );
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "How does Stutora actually help me study?",
    a: "You pick a chapter from your class syllabus, read it inside Stutora, and ask the AI tutor about anything confusing — it answers using the chapter you're on. A focus timer logs the time, and quick quizzes check whether it stuck. One place instead of five tabs.",
  },
  {
    q: "Why should I choose Stutora over YouTube or a normal AI chatbot?",
    a: "A chatbot doesn't know what you're studying. Stutora does — your active focus subject and chapter are sent with every question, so 'explain this' just works. It's also built around the Telangana board and NCERT syllabus, not generic content.",
  },
  {
    q: "Which classes and boards are covered?",
    a: "Classes 6 to 10 on the Telangana State Board (SCERT), plus Intermediate MPC and BiPC. Chapters are NCERT aligned, so most CBSE topics map across too.",
  },
  {
    q: "Do I need to pay or sign up?",
    a: "No. You can open a chapter, ask the tutor, run the focus timer and take quizzes without creating an account. Nothing is locked behind a paywall.",
  },
  {
    q: "Can it explain in Telugu or Hindi?",
    a: "Yes. The AI tutor has a language switcher for English, Telugu and Hindi, so you can get the same explanation in whichever one is clearer for you.",
  },
  {
    q: "How does the focus timer know what I'm studying?",
    a: "Open any chapter and tap 'Focus on this chapter' — the timer opens with that class, subject and chapter pre-selected. Starting the session sets it as your active focus, and the dashboard, tutor and quizzes all follow it.",
  },
  {
    q: "Is my study data saved?",
    a: "Your sessions, focus topic and chat history are stored on your own device, so your history stays with you and nothing personal leaves the app.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 backdrop-blur transition-colors hover:border-primary/30">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-ui text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-0">
        {q}
        <span
          aria-hidden
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/[0.1] text-muted-foreground transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
        >
          +
        </span>
      </summary>
      <p className="mt-3 font-ui text-[13.5px] leading-relaxed text-muted-foreground">
        {a}
      </p>
    </details>
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
    <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-white/[0.04] hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          {tag}
        </span>
      </div>
      <div className="mt-4 font-display text-lg font-bold tracking-tight">{title}</div>
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
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors duration-300 hover:bg-white/[0.04]">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary ring-1 ring-inset ring-primary/25">
        {n}
      </div>
      <div>
        <div className="font-ui text-sm font-semibold text-foreground">
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
          <h2 className="font-display text-lg font-bold">Smoother experience?</h2>
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
