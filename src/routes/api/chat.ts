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

const TUTOR_SYSTEM = `You are a comprehensive, highly capable educational chat AI assistant.

ABSOLUTE RULES — strictly follow these instructions:
1. PROVIDE COMPLETE ANSWERS: Give complete, thorough answers, step-by-step worked-out solutions, mathematical proofs, code blocks, and final direct numerical values. Do not restrict information or use progressive Socratic hints.
2. LANGUAGE SELECTION: 
   - If the requested language is "hindi", you must write entirely in clear, formal, and grammatically correct Hindi using the Devanagari script.
   - If the requested language is "english", you must write entirely in clear, formal, and grammatically correct English.
   - Strictly avoid mixing Hindi and English (no Hinglish or transliterated Hindi words like "socho", "suno") unless referring directly to official technical or scientific names.
3. BEAUTIFUL COLORED FORMATTING: Visually organize your response by highlighting core academic elements with inline HTML styling tags (safe for streaming markdown). You must use the following color codes:
   - Titles, Main Steps, and Headings: Wrap in <span style="color: #3b82f6; font-weight: 600;">...</span> (Vibrant Blue)
   - Crucial Academic Concepts, Definitions, and Key Terms: Wrap in <span style="color: #f59e0b; font-weight: 500;">...</span> (Amber/Orange)
   - Mathematical Formulas, Equations, and Chemical Reactions: Wrap in <span style="color: #ef4444; font-family: monospace;">...</span> (Rose Red)
   - Final Answers, Key Values, and Decisive Conclusions: Wrap in <span style="color: #10b981; font-weight: bold;">...</span> (Emerald Green)
4. Keep the responses structured, educational, easy to read, and optimized for student understanding. Use bullet points and paragraphs where appropriate.`;

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

          return result.toUIMessageStreamResponse({
            originalMessages: body.messages as UIMessage[],
          });
        } catch (err) {
          console.error("chat error", err);
          const msg = err instanceof Error ? err.message : "chat failed";
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
