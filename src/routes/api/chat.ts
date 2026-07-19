import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayProvider,
  getLovableApiKey,
} from "@/lib/ai-gateway.server";

type ChatRequestBody = {
  messages?: unknown;
  context?: string;
  language?: "english" | "hindi" | string; // Toggle parameters
};

const TUTOR_SYSTEM = `You are Trackora AI — a friendly, capable study companion inside the Trackora / Smart Study Hub app. You behave like Google Gemini: warm, clear, well-formatted, and genuinely helpful.

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

FORMATTING RULES:
- Use clean GitHub-flavored Markdown: short paragraphs, ## / ### headings when useful, bullet lists, numbered steps, **bold** for key terms, and fenced code blocks for code.
- Use LaTeX math with $...$ inline and $$...$$ for display equations.
- Do NOT wrap text in raw HTML <span style="..."> color tags. Do NOT emit inline CSS. Let the app's theme style the text.
- Keep answers well-structured and easy to skim. Start with a direct answer, then explain.

LANGUAGE:
- If the requested language is "hindi", reply entirely in clear Hindi (Devanagari). Otherwise reply in clear English. Do not mix languages except for standard technical terms.

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
          const targetLanguage = body.language === "hindi" ? "HINDI" : "ENGLISH";
          const languagePrompt = `\n\n--- SYSTEM DIRECTIVE: YOU MUST WRITE YOUR COMPREHENSIVE REPLIES IN ${targetLanguage} ONLY ---`;

          const contextBlock = body.context
            ? `\n\n--- STUDENT NOTEBOOK CONTEXT ---\n${body.context}\n--- END CONTEXT ---`
            : "\n\n(No notebook context uploaded — answer from verified global curriculum facts.)";

          const result = streamText({
            model,
            system: TUTOR_SYSTEM + languagePrompt + contextBlock,
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
