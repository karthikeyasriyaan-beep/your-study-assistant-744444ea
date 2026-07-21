import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send, Sparkles } from "lucide-react";
import { useFocusTopic } from "@/lib/focus-topic-store";
import { useStudySessions } from "@/lib/study-sessions-store";

type MiniMsg = { id: string; role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "Explain Newton's second law simply",
  "What is photosynthesis?",
  "Derivative of sin(x)·cos(x)?",
];

export function MiniAskAI() {
  const [messages, setMessages] = useState<MiniMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const focus = useFocusTopic();
  const sessions = useStudySessions();

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
    setMessages([...nextMessages, { id: assistantId, role: "assistant", text: "" }]);
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
          focus,
          recent: sessions.slice(0, 5),
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
            ? { ...m, text: "Sorry — couldn't reach the tutor. Please try again." }
            : m,
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className="mb-2 flex items-center justify-center gap-2 font-ui text-sm font-semibold text-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        Try our AI — ask a quick doubt
      </div>
      <div className="mb-3 text-center font-ui text-xs text-muted-foreground">
        It knows your active focus and recent sessions.
      </div>
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-3 backdrop-blur">
        <div
          ref={scrollRef}
          className="flex max-h-[280px] min-h-[120px] flex-col gap-2 overflow-y-auto rounded-xl bg-white/[0.02] p-3"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="font-ui text-xs">Ask anything — no signup needed</span>
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
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </section>
  );
}