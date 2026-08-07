import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayProvider,
  getLovableApiKey,
} from "@/lib/ai-gateway.server";

type ChatRequestBody = {
  messages?: unknown;
  context?: string;
  language?: "english" | "hindi" | "telugu" | string; // Toggle parameters
  focus?: {
    classLevel?: string;
    board?: string;
    subject?: string;
    title?: string;
  } | null;
  recent?: Array<{
    subject?: string;
    chapterTitle?: string;
    totalDurationSeconds?: number;
    actualFocusSeconds?: number;
    timestamp?: string;
  }>;
};

const TUTOR_SYSTEM = `You are Stutora AI — a friendly, capable study companion inside the Stutora / Smart Study Hub app. You behave like Google Gemini: warm, clear, well-formatted, and genuinely helpful.

You help the student with TWO things:
1. ACADEMIC HELP — explain concepts, solve doubts, work through problems step-by-step (math, physics, chemistry, biology, coding, etc.), give definitions, formulas, examples, and final answers. Never withhold the answer with Socratic-only hints; give the complete solution and then explain.
2. APP HELP — guide the user around the Smart Study Hub app itself when they ask "how do I…" or "where is…". The app has these areas the user can navigate to:
   • Home / Chat (this screen) — chat with you, attach a notebook photo for OCR, set language.
   • Dashboard — study overview and progress.
   • Materials — Inter MPC and Inter BiPC chapter materials, PDFs, YouTube references.
   • Productivity → Flashcards and Quiz — spaced-repetition flashcards and quizzes generated from notes.
   • Management → Planner, Timer, Analytics — study planner, focus timer, and analytics.
   • Welcome / onboarding tour.
   When the user asks how to do something in the app, give short numbered steps and mention the section name.

FORMATTING & VISUAL RULES:
- Use clean GitHub-flavored Markdown: short paragraphs, ## / ### headings when useful, bullet lists, numbered steps, **bold** for key terms, and fenced code blocks for code.
- Use LaTeX math with $...$ inline and $$...$$ for display equations.
- Keep answers well-structured and easy to skim. Start with a direct answer, then explain.

COLORED TEXT & HIGHLIGHTING DIRECTIVES:
When emphasizing crucial terms, formulas, key takeaways, or specific parts of a diagram/explanation, you CAN and SHOULD use color tags:
- Color tags: <color name="red">important text</color> or <color name="#3b82f6">blue text</color> (supported colors: red, green, blue, yellow, orange, purple, pink, cyan, or hex codes)
- Highlight tags: <highlight color="yellow">highlighted text</highlight>
- Inline HTML spans: <span style="color: #22c55e;">green text</span>
- LaTeX math color: $\\textcolor{red}{E = mc^2}$ or $\\textcolor{#ef4444}{\\text{Red Text}}$
- Underline the single most important term or phrase of a definition with <u>term</u> so the eye lands on it (use it sparingly — one or two per answer).
- Prefer this rhythm: plain readable prose, with the key term <u>underlined</u> and the one crucial takeaway wrapped in <highlight color="green">…</highlight>. Never colour whole paragraphs.

LANGUAGE:
- If the requested language is "hindi", reply entirely in clear Hindi (Devanagari).
- If the requested language is "telugu", reply entirely in clear Telugu.
- Otherwise reply in clear English. Do not mix languages except for standard technical terms.

Be concise when the question is small, thorough when the question is deep. Always be encouraging.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as ChatRequestBody;
          if (!Array.isArray(body.messages)) {
            return new Response("messages required", { status: 400 });
          }

          const gateway = createLovableAiGatewayProvider(getLovableApiKey());
          const model = gateway("google/gemini-2.5-flash");

          // Read the selected language from the client state (defaults to English)
          const langRaw = String(body.language ?? "english").toLowerCase();
          const targetLanguage =
            langRaw === "hindi"
              ? "HINDI (Devanagari script)"
              : langRaw === "telugu"
                ? "TELUGU (Telugu script)"
                : "ENGLISH";
          const languagePrompt = `\n\n--- SYSTEM DIRECTIVE: YOU MUST WRITE YOUR COMPREHENSIVE REPLIES IN ${targetLanguage} ONLY ---`;

          const contextBlock = body.context
            ? `\n\n--- STUDENT NOTEBOOK CONTEXT ---\n${body.context}\n--- END CONTEXT ---`
            : "\n\n(No notebook context uploaded — answer from verified global curriculum facts.)";

          // Autocontext: current focus + recent study activity
          const autoParts: string[] = [];
          if (body.focus && (body.focus.subject || body.focus.title)) {
            const f = body.focus;
            autoParts.push(
              `Active focus: Class ${f.classLevel ?? "?"} · ${f.board ?? ""} · ${f.subject ?? ""} — ${f.title ?? ""}`.trim(),
            );
          }
          if (Array.isArray(body.recent) && body.recent.length > 0) {
            const lines = body.recent.slice(0, 5).map((s) => {
              const mins = Math.round((s.totalDurationSeconds ?? 0) / 60);
              const focusPct = s.totalDurationSeconds
                ? Math.round(((s.actualFocusSeconds ?? 0) / s.totalDurationSeconds) * 100)
                : 0;
              const when = s.timestamp ? new Date(s.timestamp).toLocaleDateString() : "";
              return `• ${s.subject ?? "?"} — ${s.chapterTitle ?? "?"} (${mins}m, ${focusPct}% focus, ${when})`;
            });
            autoParts.push("Recent study sessions:\n" + lines.join("\n"));
          }
          const autoContext = autoParts.length
            ? `\n\n--- LIVE APP CONTEXT (autocontext) ---\n${autoParts.join("\n\n")}\nWhen the student says "this topic" or "explain this", assume they mean the active focus above. Reference their recent activity when relevant.\n--- END LIVE APP CONTEXT ---`
            : "";

          const result = streamText({
            model,
            system: TUTOR_SYSTEM + languagePrompt + autoContext + contextBlock,
            messages: await convertToModelMessages(body.messages as UIMessage[]),
          });

          return result.toTextStreamResponse();
        } catch (err) {
          console.error("chat error", err);
          const msg = err instanceof Error ? err.message : "chat failed";
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
