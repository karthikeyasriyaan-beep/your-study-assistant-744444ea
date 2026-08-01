import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import {
  Plus,
  Send,
  Sparkles,
  BookOpen,
  Clock,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  HelpCircle,
  Menu,
  X as XIcon,
  ImagePlus,
  Loader2,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useFocusTopic } from "@/lib/focus-topic-store";
import { useStudySessions } from "@/lib/study-sessions-store";
import { useI18n } from "@/lib/i18n";
import {
  createConversation,
  deleteConversation,
  groupByDate,
  relativeTime,
  setActive,
  subjectColor,
  updateConversation,
  useConversations,
} from "@/lib/tutor-conversations";
import { extractTextFromFiles } from "@/lib/learning.functions";

type UILang = "english" | "telugu" | "hindi";

function messageText(m: UIMessage): string {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

export function AITutor() {
  const { conversations, activeId } = useConversations();
  const { language, setLanguage } = useI18n();
  const liveFocus = useFocusTopic();
  const liveSessions = useStudySessions();

  const [uiLang, setUiLang] = useState<UILang>(
    language === "hindi" ? "hindi" : "english",
  );
  useEffect(() => {
    if (uiLang !== "telugu") setLanguage(uiLang);
  }, [uiLang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeId) {
      if (conversations.length > 0) setActive(conversations[0].id);
      else createConversation(liveFocus?.subject);
    }
  }, [activeId, conversations.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted" | "streaming">("idle");
  const [attached, setAttached] = useState<{ name: string; dataUrl: string }[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const busy = status !== "idle";

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [active?.messages.length, streamingId, status]);

  const send = async (raw: string) => {
    if (!active) return;
    const text = raw.trim();
    if (!text) return;

    const userMsg: UIMessage = {
      id: "m-" + crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text }],
    };
    const assistantMsg: UIMessage = {
      id: "m-" + crypto.randomUUID(),
      role: "assistant",
      parts: [{ type: "text", text: "" }],
    };
    const nextMsgs = [...active.messages, userMsg, assistantMsg];
    const newTitle =
      active.messages.length === 0
        ? text.slice(0, 60)
        : active.title;
    updateConversation(active.id, {
      messages: nextMsgs,
      title: newTitle,
      subject: active.subject ?? liveFocus?.subject,
    });
    setStatus("submitted");
    setStreamingId(assistantMsg.id);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...active.messages, userMsg],
          language: uiLang,
          focus: liveFocus,
          recent: liveSessions.slice(0, 5),
        }),
      });
      if (!res.ok || !res.body) throw new Error("chat failed");
      setStatus("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        updateConversation(active.id, {
          messages: [
            ...active.messages,
            userMsg,
            { ...assistantMsg, parts: [{ type: "text", text: acc }] },
          ],
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Couldn't reach the AI tutor. Please try again.");
      updateConversation(active.id, {
        messages: [
          ...active.messages,
          userMsg,
          {
            ...assistantMsg,
            parts: [
              { type: "text", text: "Something went wrong. Please try again." },
            ],
          },
        ],
      });
    } finally {
      setStatus("idle");
      setStreamingId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const t = input.trim();
    setInput("");
    void send(t);
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setExtracting(true);
    try {
      const prepared = await Promise.all(
        files.slice(0, 3).map(async (f) => ({
          name: f.name,
          mimeType: f.type || "image/jpeg",
          dataUrl: await fileToDataUrl(f),
        })),
      );
      setAttached((p) => [...p, ...prepared.map((x) => ({ name: x.name, dataUrl: x.dataUrl }))]);
      const out = await extractTextFromFiles({ data: { files: prepared } });
      if (out.text?.trim()) {
        setInput((prev) =>
          prev
            ? `${prev}\n\n[Notebook]\n${out.text}`
            : `Here is my notebook page:\n${out.text}\n\nPlease explain and help.`,
        );
        toast.success("Notebook image read.");
      }
    } catch {
      toast.error("Couldn't read that image.");
    } finally {
      setExtracting(false);
    }
  };

  const newChat = () => {
    createConversation(liveFocus?.subject);
    setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const suggestions = useMemo(() => {
    if (liveFocus?.title) {
      return [
        `Explain ${liveFocus.title} simply`,
        `Key formulas in ${liveFocus.title}`,
        `Quiz me on ${liveFocus.title}`,
        `Common mistakes in ${liveFocus.title}`,
      ];
    }
    return [
      "Explain Newton's Second Law with an example",
      "Balance H2 + O2 → H2O",
      "What is photosynthesis?",
      "How do I set an active focus in the app?",
    ];
  }, [liveFocus?.title]);

  const quickChips = useMemo(
    () => [
      "Explain simply",
      "Give an example",
      "Quiz me",
      "Summarize",
      "Step by step",
      liveFocus?.title ? `More on ${liveFocus.title}` : "How do I use the timer?",
    ],
    [liveFocus?.title],
  );

  const groups = useMemo(() => groupByDate(conversations), [conversations]);

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%)",
        }}
      />

      {/* ---------------- Sidebar ---------------- */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNew={newChat}
        groups={groups}
        activeId={activeId}
        onSelect={(id) => {
          setActive(id);
          setSidebarOpen(false);
        }}
        onDelete={(id) => deleteConversation(id)}
        uiLang={uiLang}
        setUiLang={setUiLang}
      />

      {/* ---------------- Center column ---------------- */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2.5 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 lg:hidden"
              aria-label="Open chats"
            >
              <Menu className="h-4 w-4" />
            </button>
            <ContextStrip focus={liveFocus} recent={liveSessions[0]} />
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
            {active && active.messages.length === 0 ? (
              <EmptyState suggestions={suggestions} onPick={(s) => send(s)} />
            ) : (
              active?.messages.map((m, idx) => (
                <MessageRow
                  key={m.id}
                  msg={m}
                  streaming={streamingId === m.id && status === "streaming"}
                  onRegenerate={() => {
                    const prev = active.messages[idx - 1];
                    if (prev?.role === "user") {
                      updateConversation(active.id, {
                        messages: active.messages.slice(0, idx - 1),
                      });
                      setTimeout(() => send(messageText(prev)), 30);
                    }
                  }}
                  onFollowup={(text) => send(text)}
                />
              ))
            )}
            {status === "submitted" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Thinking…</span>
              </div>
            )}
          </div>
        </div>

        {/* Input dock */}
        <div className="sticky bottom-0 z-10 border-t border-white/[0.06] bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-3xl px-3 py-3 sm:px-6 sm:py-4">
            <div className="mb-2 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {quickChips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setInput((p) => (p ? `${p} ${c}` : c))}
                  className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-ui text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  {c}
                </button>
              ))}
            </div>

            {attached.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attached.map((img, i) => (
                  <div
                    key={i}
                    className="relative h-14 w-14 overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02]"
                  >
                    <img src={img.dataUrl} alt={img.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAttached((p) => p.filter((_, x) => x !== i))}
                      className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-black/70 text-white"
                      aria-label="Remove image"
                    >
                      <XIcon className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
                {extracting && (
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> reading…
                  </div>
                )}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-2 shadow-lg shadow-black/30 focus-within:border-primary/40 focus-within:shadow-primary/10"
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImage}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy || extracting}
                aria-label="Attach notebook image"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-40"
              >
                {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              </button>

              <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
                {liveFocus?.title && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-ui text-[10px] uppercase tracking-wider text-primary"
                      title={`${liveFocus.subject} · ${liveFocus.title}`}
                    >
                      <BookOpen className="h-3 w-3" />
                      <span className="truncate">{liveFocus.subject} · {liveFocus.title}</span>
                    </span>
                  </div>
                )}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as unknown as React.FormEvent);
                    }
                  }}
                  rows={1}
                  placeholder="Ask the AI Tutor…"
                  disabled={busy}
                  className="min-h-[36px] max-h-40 w-full resize-none bg-transparent px-1 py-1.5 font-ui text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 transition active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {status === "streaming" || status === "submitted" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Sidebar
// =============================================================
function Sidebar({
  open,
  onClose,
  onNew,
  groups,
  activeId,
  onSelect,
  onDelete,
  uiLang,
  setUiLang,
}: {
  open: boolean;
  onClose: () => void;
  onNew: () => void;
  groups: ReturnType<typeof groupByDate>;
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  uiLang: UILang;
  setUiLang: (l: UILang) => void;
}) {
  return (
    <>
      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close chats"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-white/[0.06] bg-sidebar/95 backdrop-blur-xl transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-[100dvh] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] p-3">
          <div className="flex items-center gap-2 font-ui text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" /> Chats
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-white/[0.06] hover:text-foreground lg:hidden"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={onNew}
            className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 font-ui text-sm font-medium text-foreground transition hover:border-primary/50 hover:bg-primary/10 hover:shadow-[0_0_20px_-4px_var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Plus className="h-4 w-4 text-primary" />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {groups.length === 0 && (
            <p className="px-3 py-6 text-center font-ui text-xs text-muted-foreground">
              Your chats will appear here.
            </p>
          )}
          {groups.map((g) => (
            <div key={g.label} className="mb-3">
              <div className="px-3 py-1.5 font-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {g.label}
              </div>
              <ul className="space-y-0.5">
                {g.items.map((c) => {
                  const active = c.id === activeId;
                  const first =
                    c.messages.find((m) => m.role === "user")?.parts
                      .map((p) => (p.type === "text" ? p.text : ""))
                      .join("") || c.title;
                  return (
                    <li key={c.id} className="group relative">
                      <div
                        className={`flex items-center gap-2 rounded-lg px-2 py-2 transition ${
                          active
                            ? "border-l-2 border-primary bg-primary/10"
                            : "border-l-2 border-transparent hover:border-primary/40 hover:bg-white/[0.04]"
                        }`}
                      >
                        <button
                          onClick={() => onSelect(c.id)}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: subjectColor(c.subject) }}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-ui text-sm text-foreground">
                              {first || "New chat"}
                            </span>
                            <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                              {relativeTime(c.updatedAt)}
                            </span>
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(c.id);
                          }}
                          aria-label="Delete chat"
                          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground opacity-0 transition hover:bg-white/[0.06] hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] p-3">
          <div className="mb-2 font-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Language
          </div>
          <div className="flex rounded-full border border-white/[0.08] bg-white/[0.02] p-1">
            {(["english", "telugu", "hindi"] as UILang[]).map((l) => (
              <button
                key={l}
                onClick={() => setUiLang(l)}
                className={`flex-1 rounded-full px-2 py-1.5 font-ui text-[11px] font-semibold capitalize transition ${
                  uiLang === l
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

// =============================================================
// Context strip
// =============================================================
function ContextStrip({
  focus,
  recent,
}: {
  focus: ReturnType<typeof useFocusTopic>;
  recent?: { subject: string; chapterTitle: string };
}) {
  if (!focus && !recent) {
    return (
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 font-ui text-[11px] text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="truncate">AI Tutor · pick a chapter in Focus to ground answers</span>
      </div>
    );
  }
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Context
      </span>
      {focus && (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-ui text-[11px] text-primary">
          <BookOpen className="h-3 w-3" />
          {focus.subject} · {focus.title}
        </span>
      )}
      {recent && (!focus || recent.chapterTitle !== focus.title) && (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 font-ui text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {recent.subject} · {recent.chapterTitle}
        </span>
      )}
    </div>
  );
}

// =============================================================
// Empty state
// =============================================================
function EmptyState({
  suggestions,
  onPick,
}: {
  suggestions: string[];
  onPick: (s: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center animate-trk-fade-in">
      <div className="relative mb-6">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 blur-3xl animate-trk-glow"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 45%, transparent), transparent 70%)",
          }}
        />
        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-lg shadow-primary/20">
          <Sparkles className="h-6 w-6" />
        </div>
      </div>
      <h1 className="font-display text-3xl sm:text-4xl leading-tight">AI Tutor</h1>
      <p className="mt-2 max-w-md font-ui text-sm text-muted-foreground">
        Hi, let's get started — ask any doubt, get full explanations, or ask how to use anything in the app.
      </p>
      <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((s, i) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 text-left font-ui text-sm text-foreground transition hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 animate-trk-fade-up"
            style={{ animationDelay: `${80 + i * 60}ms` }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================
// Message row (UPDATED for colored text & syntax support)
// =============================================================
function MessageRow({
  msg,
  streaming,
  onRegenerate,
  onFollowup,
}: {
  msg: UIMessage;
  streaming: boolean;
  onRegenerate: () => void;
  onFollowup: (text: string) => void;
}) {
  const text = messageText(msg);
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-trk-fade-up">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-tr-md bg-primary px-4 py-2.5 font-ui text-sm text-primary-foreground shadow-md shadow-primary/20">
          {text}
        </div>
      </div>
    );
  }

  // Pre-process standard color names to CSS variables or HEX codes
  const resolveColor = (name?: string) => {
    if (!name) return "inherit";
    const map: Record<string, string> = {
      red: "#ef4444",
      green: "#22c55e",
      blue: "#3b82f6",
      yellow: "#eab308",
      orange: "#f97316",
      purple: "#a855f7",
      pink: "#ec4899",
      cyan: "#06b6d4",
    };
    return map[name.toLowerCase()] || name;
  };

  return (
    <div className="group animate-trk-fade-up">
      <div className="max-w-none font-ui text-[15px] leading-relaxed text-foreground prose prose-invert prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold prose-h2:text-xl prose-h3:text-base prose-strong:text-foreground prose-a:text-primary prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={{
            /* eslint-disable @typescript-eslint/no-explicit-any */
            ...({} as any),
            // Handle standard raw inline CSS styles or colors
            span: ({ node, style, className, children, ...props }) => {
              return (
                <span style={style} className={className} {...props}>
                  {children}
                </span>
              );
            },
            // Custom <color name="red">Text</color> element handler
            color: ({ name, children }: any) => (
              <span style={{ color: resolveColor(name), fontWeight: 500 }}>
                {children}
              </span>
            ),
            // Custom <highlight color="yellow">Text</highlight> element handler
            highlight: ({ color, children }: any) => (
              <mark
                style={{
                  backgroundColor: resolveColor(color || "yellow") + "33",
                  color: resolveColor(color || "yellow"),
                  padding: "0.1em 0.3em",
                  borderRadius: "0.25rem",
                }}
              >
                {children}
              </mark>
            ),
            blockquote: ({ children }) => (
              <aside className="my-3 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3">
                <div className="mb-1 font-ui text-[10px] uppercase tracking-[0.22em] text-primary/80">
                  Key concept
                </div>
                <div className="text-sm text-foreground">{children}</div>
              </aside>
            ),
            ol: ({ children }) => (
              <ol className="relative my-3 space-y-3 border-l border-white/[0.1] pl-5 [counter-reset:step]">
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => (
              <li
                {...props}
                className="relative before:absolute before:-left-[27px] before:top-1 before:grid before:h-4 before:w-4 before:place-items-center before:rounded-full before:border before:border-primary/40 before:bg-background before:content-[''] marker:hidden"
              >
                {children}
              </li>
            ),
            code: ({ inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || "");
              if (!inline && match) {
                return (
                  <FormulaBlock>
                    <code className={`language-${match[1]}`} {...props}>
                      {children}
                    </code>
                  </FormulaBlock>
                );
              }
              return (
                <code
                  className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs text-primary"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <FormulaBlock>{children as React.ReactNode}</FormulaBlock>
            ),
          }}
        >
          {text || "…"}
        </ReactMarkdown>
        {streaming && (
          <span
            aria-hidden
            className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-primary align-middle"
          />
        )}
      </div>

      {!streaming && text && (
        <div className="mt-2 flex flex-wrap items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <CopyButton text={text} />
          <ActionIcon
            label="Explain further"
            onClick={() => onFollowup("Explain that in more detail with an example.")}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </ActionIcon>
          <ActionIcon label="Quiz me on this" onClick={() => onFollowup("Quiz me with 5 questions on this.")}>
            <Sparkles className="h-3.5 w-3.5" />
          </ActionIcon>
          <ActionIcon label="Regenerate" onClick={onRegenerate}>
            <RefreshCw className="h-3.5 w-3.5" />
          </ActionIcon>
          <span className="mx-1 h-4 w-px bg-white/[0.08]" />
          <ActionIcon label="Good response" onClick={() => toast.success("Thanks for the feedback")}>
            <ThumbsUp className="h-3.5 w-3.5" />
          </ActionIcon>
          <ActionIcon label="Bad response" onClick={() => toast("Noted — we'll improve.")}>
            <ThumbsDown className="h-3.5 w-3.5" />
          </ActionIcon>
        </div>
      )}
    </div>
  );
}

function ActionIcon({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      {children}
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <ActionIcon
      label={copied ? "Copied" : "Copy"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          toast.error("Couldn't copy");
        }
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
    </ActionIcon>
  );
}

function FormulaBlock({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div className="group/f relative my-3 overflow-hidden rounded-xl border border-white/[0.08] bg-black/40">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>Code / Formula</span>
        <button
          type="button"
          onClick={async () => {
            if (!ref.current) return;
            try {
              await navigator.clipboard.writeText(ref.current.innerText);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            } catch {
              toast.error("Couldn't copy block");
            }
          }}
          className="flex items-center gap-1 hover:text-foreground"
        >
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div ref={ref} className="overflow-x-auto px-5 py-3 font-mono text-sm text-foreground">
        {children}
      </div>
    </div>
  );
}
