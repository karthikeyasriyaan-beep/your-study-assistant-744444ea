import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Brain,
  BookOpen,
  Layers,
  ListChecks,
  Timer,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";

const ONBOARD_KEY = "trackora:onboarded-v1";

type Step = {
  icon: typeof Brain;
  tag: string;
  title: string;
  body: string;
  accent: string;
};

const STEPS: Step[] = [
  {
    icon: Sparkles,
    tag: "Welcome",
    title: "Meet Stutora",
    body: "Your calm study OS — AI tutor, textbooks, flashcards, quizzes and a focus timer, all in one place.",
    accent: "from-primary/40 to-primary/10",
  },
  {
    icon: Brain,
    tag: "AI Tutor",
    title: "Ask, get full explanations",
    body: "A friendly AI tutor that gives complete answers with clear steps, formulas, and examples. Attach a notebook photo for instant help.",
    accent: "from-fuchsia-500/40 to-fuchsia-500/5",
  },
  {
    icon: BookOpen,
    tag: "Materials Hub",
    title: "Every SCERT textbook",
    body: "Class 6–10 Telangana State Syllabus in English & Telugu medium, plus Intermediate MPC/BiPC — one tap to the official PDF.",
    accent: "from-emerald-500/40 to-emerald-500/5",
  },
  {
    icon: Layers,
    tag: "Flashcards",
    title: "Spaced repetition, automatic",
    body: "Scanned pages and chats auto-generate flashcards. Review in short daily sessions — the app schedules the rest.",
    accent: "from-amber-500/40 to-amber-500/5",
  },
  {
    icon: ListChecks,
    tag: "Quizzes",
    title: "Numeric practice on demand",
    body: "Generate a 5-question numeric quiz from your focus topic anytime. Instant checking with explanations.",
    accent: "from-sky-500/40 to-sky-500/5",
  },
  {
    icon: Timer,
    tag: "Focus Timer",
    title: "Deep-work sessions",
    body: "Pomodoro-style timer with analytics. Track streaks, subjects and time — synced across every feature.",
    accent: "from-rose-500/40 to-rose-500/5",
  },
];

export function OnboardingTour() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const path = window.location.pathname;
      if (path === "/welcome") return;
      const done = window.localStorage.getItem(ONBOARD_KEY);
      if (!done) setOpen(true);
    } catch {}
  }, []);

  if (!open) return null;

  const finish = () => {
    try {
      window.localStorage.setItem(ONBOARD_KEY, "1");
    } catch {}
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      finish();
      navigate({ to: "/dashboard" });
    }
  };

  const current = STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding tour"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-trk-fade-in"
    >
      <div
        key={step}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.08] bg-card shadow-2xl animate-trk-scale-in"
      >
        {/* Ambient gradient */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${current.accent} opacity-70`}
          aria-hidden
        />
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/20 blur-3xl" aria-hidden />

        {/* Header: progress */}
        <div className="relative px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
              {current.tag}
            </div>
            <button
              onClick={finish}
              className="text-xs text-muted-foreground transition hover:text-foreground"
            >
              Skip tour
            </button>
          </div>
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="relative px-6 py-7">
          <div
            key={`icon-${step}`}
            className="mb-5 inline-grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25 animate-trk-scale-in animate-trk-glow"
          >
            <Icon className="h-6 w-6" />
          </div>
          <h2
            key={`title-${step}`}
            className="font-display text-2xl leading-tight tracking-tight animate-trk-fade-up"
          >
            {current.title}
          </h2>
          <p
            key={`body-${step}`}
            className="mt-2 font-ui text-sm leading-relaxed text-muted-foreground animate-trk-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            {current.body}
          </p>

          {/* Dots */}
          <div className="mt-6 flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-6 bg-primary"
                    : i < step
                      ? "w-1.5 bg-primary/60"
                      : "w-1.5 bg-white/15"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-between gap-3 border-t border-white/[0.06] bg-black/20 px-6 py-4 backdrop-blur">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="text-xs font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={next}
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-110 active:scale-[0.98]"
          >
            {step === STEPS.length - 1 ? (
              <>
                Start learning <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
