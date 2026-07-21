import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  BookOpen,
  Send,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { measureFps, usePerf } from "@/lib/perf";

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

type MiniMsg = { id: string; role: "user" | "assistant"; text: string };

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
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center px-6 py-8 sm:py-12">
      {/* Brand mark */}
      <div className="flex w-full max-w-md items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-inset ring-white/10">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="font-display text-lg leading-none">Trackora</div>
      </div>

      {/* Hero */}
      <div className="mt-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-ui text-[10px] uppercase tracking-[0.28em] text-muted-foreground backdrop-blur">
          Study OS · v4
        </div>
        <h1 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
          Learn calmly.
          <br />
          <span className="text-primary">Focus deeply.</span>
        </h1>
        <p className="mt-3 max-w-sm text-balance font-ui text-sm leading-relaxed text-muted-foreground">
          Your AI tutor, textbooks, flashcards, and focus timer — all in one
          quiet workspace.
        </p>

        <div className="mt-6 grid w-full grid-cols-3 gap-2">
          <Feature icon={Brain} label="AI Tutor" />
          <Feature icon={BookOpen} label="Materials" />
          <Feature icon={Zap} label="Focus" />
        </div>
      </div>

      {/* Try the AI — third section on the welcome page */}
      <div className="mt-8 w-full max-w-md">
        <div className="mb-2 flex items-center justify-center gap-2 font-ui text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Try our AI — ask a quick doubt
        </div>
        <div className="mb-3 text-center font-ui text-xs text-muted-foreground">
          It knows your active focus and recent sessions.
        </div>
        <MiniAskAI />
      </div>

      {/* CTA */}
      <div className="mt-8 flex w-full max-w-md flex-col items-center gap-3 pb-4">
        <button
          onClick={enter}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-ui text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 active:scale-[0.98]"
        >
          Get started
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
        <div className="text-center font-ui text-[11px] text-muted-foreground">
          AI can make mistakes — please double check important information.
        </div>
      </div>

      {askLite && <PerfDialog onChoose={choose} />}
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof Brain; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-4 backdrop-blur">
      <Icon className="h-4 w-4 text-primary" />
      <div className="font-ui text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "Explain Newton's second law simply",
  "What is photosynthesis?",
  "Derivative of sin(x)·cos(x)?",
];

function MiniAskAI() {
  const [messages, setMessages] = useState<MiniMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg: MiniMsg = {
      id: "u-" + crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };
    const assistantId = "a-" + crypto.randomUUID();
    const nextMessages = [...messages, userMsg];
    setMessages([
      ...nextMessages,
      { id: assistantId, role: "assistant", text: "" },
    ]);
    setInput("");
    setBusy(true);

    try {
      const payload = nextMessages.map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: "text", text: m.text }],
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payload,
          language: "english",
        }),
      });
      if (!res.ok || !res.body) throw new Error("network");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, text: acc } : m)),
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                text: "Sorry — couldn't reach the tutor. Please try again.",
              }
            : m,
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-3 backdrop-blur">
      <div
        ref={scrollRef}
        className="flex max-h-[280px] min-h-[120px] flex-col gap-2 overflow-y-auto rounded-xl bg-white/[0.02] p-3"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="font-ui text-xs">
                Ask anything — no signup needed
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-ui text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "self-end max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 font-ui text-sm text-primary-foreground"
                  : "self-start max-w-[92%] font-ui text-sm leading-relaxed text-foreground"
              }
            >
              {m.role === "assistant" && m.text === "" ? (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </span>
              ) : m.role === "assistant" ? (
                <div
                  className="prose prose-sm max-w-none [&_span]:!leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: m.text }}
                />
              ) : (
                m.text
              )}
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-2 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          placeholder="Ask a quick doubt…"
          className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 font-ui text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25 transition hover:brightness-110 disabled:opacity-50"
          aria-label="Send"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
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
