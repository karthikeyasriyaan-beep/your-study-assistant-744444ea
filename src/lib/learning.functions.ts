import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import {
  createLovableAiGatewayProvider,
  getLovableApiKey,
  GATEWAY_BASE_URL,
} from "./ai-gateway.server";

// ---------- Types (also exported for client) ----------

export const SummarySchema = z.object({
  topicTags: z.object({
    class: z.string(),
    subject: z.string(),
    chapter: z.string(),
    extraTags: z.array(z.string()),
  }),
  formulas: z.array(z.string()),
  concepts: z.object({
    coreDefinitions: z.array(z.string()),
    trickyExceptions: z.array(z.string()),
    commonExamMistakes: z.array(z.string()),
  }),
});
export type Summary = z.infer<typeof SummarySchema>;

export const FlashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
});

export const QuizQuestionSchema = z.object({
  type: z.enum(["mcq", "assertion-reasoning"]),
  question: z.string(),
  options: z.array(z.string()).min(4).max(4),
  correctIndex: z.number().min(0).max(3),
  explanation: z.string(),
});

export const AssessmentSchema = z.object({
  flashcards: z.array(FlashcardSchema),
  quiz: z.array(QuizQuestionSchema).length(5),
});
export type Assessment = z.infer<typeof AssessmentSchema>;

// ---------- 1. OCR via Gemini multimodal ----------

const OcrInput = z.object({
  files: z
    .array(
      z.object({
        name: z.string(),
        mimeType: z.string(),
        // data URL string: data:<mime>;base64,<...>
        dataUrl: z.string(),
      }),
    )
    .min(1)
    .max(5),
});

export const extractTextFromFiles = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => OcrInput.parse(input))
  .handler(async ({ data }) => {
    const key = getLovableApiKey();

    // Build multimodal user content blocks
    const blocks: Array<Record<string, unknown>> = [
      {
        type: "text",
        text: "You are an OCR engine. Extract ALL handwritten or printed text from these notebook pages EXACTLY as written. Preserve Hindi (Devanagari) characters, English, Hinglish slang, and mathematical notation (write equations in plain math like x^2 + 2x = 5, fractions as a/b, integrals as int_0^1 f(x) dx). Output ONLY the raw extracted text in reading order. Do not summarize. Do not translate.",
      },
    ];

    for (const f of data.files) {
      if (f.mimeType.startsWith("image/")) {
        blocks.push({
          type: "image_url",
          image_url: { url: f.dataUrl },
        });
      } else if (f.mimeType === "application/pdf") {
        // strip data URL prefix
        const base64 = f.dataUrl.split(",")[1] ?? "";
        blocks.push({
          type: "file",
          file: {
            filename: f.name,
            file_data: `data:application/pdf;base64,${base64}`,
          },
        });
      }
    }

    const res = await fetch(`${GATEWAY_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: blocks }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OCR failed: ${res.status} ${text}`);
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const extracted = json.choices?.[0]?.message?.content?.trim() ?? "";
    return { text: extracted };
  });

// ---------- 2. Summary generator ----------

const SummaryInput = z.object({ text: z.string().min(1) });

export const generateSummary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SummaryInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = createLovableAiGatewayProvider(getLovableApiKey());
    const { output: experimental_output } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      output: Output.object({ schema: SummarySchema }),
      prompt: `You are a study-material analyzer for Indian school/college students. The text below was OCR-extracted from a student's handwritten notebook and may contain Hindi/English/Hinglish and rough math notation.

Extract:
- topicTags: identify likely class (e.g. "Class 10", "Class 12", "B.Sc"), subject, chapter, plus extra useful tags.
- formulas: every mathematical equation/formula as a clean standard math string (e.g. "a^2 + b^2 = c^2", "F = m*a"). If none, return [].
- concepts.coreDefinitions: key definitions as crisp bullets.
- concepts.trickyExceptions: edge cases / "be careful" points.
- concepts.commonExamMistakes: mistakes students typically make on this topic.

Notebook text:
"""
${data.text}
"""`,
    });
    return experimental_output;
  });

// ---------- 3. Assessment generator ----------

const AssessmentInput = z.object({
  summary: SummarySchema,
  text: z.string().min(1),
});

export const generateAssessment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AssessmentInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = createLovableAiGatewayProvider(getLovableApiKey());
    const { output: experimental_output } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      output: Output.object({ schema: AssessmentSchema }),
      prompt: `Build a study assessment from this notebook material.

Topic: ${data.summary.topicTags.subject} — ${data.summary.topicTags.chapter} (${data.summary.topicTags.class})

Summary JSON:
${JSON.stringify(data.summary)}

Raw notebook text (for grounding):
"""
${data.text.slice(0, 4000)}
"""

Produce:
- flashcards: 6 to 10 front/back cards. Front = a short question or term. Back = concise answer.
- quiz: EXACTLY 5 questions, each with 4 options and a correctIndex (0-3) and a one-line explanation.
  - Mix question types: include at least 1 "assertion-reasoning" type. For assertion-reasoning, format the question with both an Assertion (A) and Reason (R) statement, and use the standard 4 options:
    0: Both A and R are true, R is the correct explanation of A
    1: Both A and R are true, R is NOT the correct explanation of A
    2: A is true, R is false
    3: A is false, R is true
  - The rest are standard MCQs ("mcq" type).

Make questions test conceptual understanding, not just recall.`,
    });
    return experimental_output;
  });

// ---------- 4. Numeric quiz generator (integer answers) ----------

export const NumericQuestionSchema = z.object({
  id: z.string(),
  questionText: z.string(),
  correctAnswer: z.number().int(),
  subject: z.string(),
  topic: z.string(),
  difficulty: z.string(),
  explanation: z.string(),
});

export const NumericQuizSchema = z.object({
  questions: z.array(NumericQuestionSchema),
});
export type NumericQuiz = z.infer<typeof NumericQuizSchema>;

const NumericInput = z.object({
  summary: SummarySchema.optional(),
  text: z.string().optional(),
  focusTopic: z
    .object({
      subject: z.string(),
      chapterTitle: z.string(),
      classLevel: z.string(),
      stream: z.string().optional(),
      exam: z.string().optional(),
    })
    .optional(),
});

export const generateNumericQuiz = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => NumericInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = createLovableAiGatewayProvider(getLovableApiKey());

    const activeSubject =
      data.focusTopic?.subject ?? data.summary?.topicTags.subject ?? "General";
    const activeChapter =
      data.focusTopic?.chapterTitle ??
      data.summary?.topicTags.chapter ??
      "Selected Chapter";
    const classLevel =
      data.focusTopic?.classLevel ?? data.summary?.topicTags.class ?? "Class 12";
    const stream =
      data.focusTopic?.stream ??
      (/(bio|zoolog|botan)/i.test(activeSubject) ? "BiPC" : "MPC");
    const exam =
      data.focusTopic?.exam ?? (stream === "BiPC" ? "NEET" : "IIT-JEE Main");

    const notebookBlock = data.text
      ? `\nStudent notebook excerpt (for grounding, optional):\n"""\n${data.text.slice(0, 2500)}\n"""\n`
      : "";

    const buildPrompt = (attempt: number, previousProblem = "") => `You are an Expert ${exam} National Level Examiner and Content Creator.

Generate EXACTLY 5 high-yield, challenging, curriculum-accurate numeric/integer-answer questions.

Active Context:
- Stream: ${stream}
- Target Exam: ${exam} (Numerical Value / Integer section)
- Subject: ${activeSubject}
- Chapter: ${activeChapter}
- Class Level: ${classLevel}
${notebookBlock}
STRICT RULES:
1. INTEGER ONLY, NON-NEGATIVE: every "correctAnswer" MUST be a single non-negative integer (0, 4, 12, 120...). No decimals, no fractions, no negatives, no units embedded in the answer.
2. HIGH CALIBER: JEE/NEET-styled. Require real application of core concepts from the active chapter.
3. CLARITY: if rounding is required, say "Round to the nearest integer" in the questionText.
4. NO HALLUCINATED CONSTANTS: any physics/chemistry constant used (g = 10 m/s^2, h, c, R, N_A, etc.) MUST be explicitly stated inside the questionText.
5. Units belong inside questionText, never in correctAnswer.
6. Keep every questionText under 420 characters and every explanation under 260 characters.
7. Escape quotation marks inside strings. Never put raw line breaks inside a JSON string.

${attempt > 0 ? `The previous output was rejected because: ${previousProblem}. Generate a fresh corrected JSON object only.` : ""}

OUTPUT FORMAT — return ONLY valid raw JSON (no markdown fences, no prose, no comments) with this exact shape. Difficulty must be exactly "Easy", "Medium", or "Hard":
{
  "questions": [
    {
      "id": "q-1",
      "questionText": "A compact complete numeric question with all needed constants stated.",
      "correctAnswer": 12,
      "subject": "Physics",
      "topic": "specific sub-topic",
      "difficulty": "Medium",
      "explanation": "Short derivation ending in the integer answer."
    }
  ]
}`;

    const sanitizeJsonText = (value: string) =>
      value
        .replace(/^\uFEFF/, "")
        .replace(/```(?:json)?/gi, "")
        .replace(/```/g, "")
        .replace(/^\s*\/\/.*$/gm, "")
        .replace(/,\s*([}\]])/g, "$1")
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .trim();

    const extractJsonCandidate = (value: string) => {
      const text = sanitizeJsonText(value);
      const start = text.indexOf("{");
      if (start === -1) throw new Error("No JSON object found");

      let depth = 0;
      let inString = false;
      let escaped = false;

      for (let i = start; i < text.length; i += 1) {
        const ch = text[i];
        if (inString) {
          if (escaped) {
            escaped = false;
          } else if (ch === "\\") {
            escaped = true;
          } else if (ch === '"') {
            inString = false;
          }
          continue;
        }

        if (ch === '"') {
          inString = true;
        } else if (ch === "{") {
          depth += 1;
        } else if (ch === "}") {
          depth -= 1;
          if (depth === 0) return text.slice(start, i + 1);
        }
      }

      if (depth > 0) return `${text.slice(start)}${"}".repeat(depth)}`;
      const last = text.lastIndexOf("}");
      if (last > start) return text.slice(start, last + 1);
      throw new Error("Incomplete JSON object");
    };

    const normalizeQuestions = (rawQs: Array<Record<string, unknown>>) =>
      rawQs
        .map((q, i) => ({
        id: typeof q.id === "string" && q.id ? q.id : `q-${i + 1}`,
        questionText: String(q.questionText ?? "").replace(/\s+/g, " ").trim(),
        correctAnswer:
          typeof q.correctAnswer === "number"
            ? Math.round(q.correctAnswer)
            : parseInt(String(q.correctAnswer ?? ""), 10),
        subject: String(q.subject ?? activeSubject).trim() || activeSubject,
        topic: String(q.topic ?? activeChapter).trim() || activeChapter,
        difficulty: /^(easy|medium|hard)$/i.test(String(q.difficulty ?? ""))
          ? String(q.difficulty)
          : "Medium",
        explanation: String(q.explanation ?? "").replace(/\s+/g, " ").trim(),
      }))
        .filter(
          (q) =>
            q.questionText &&
            Number.isInteger(q.correctAnswer) &&
            q.correctAnswer >= 0,
        )
        .slice(0, 5);

    const salvageQuestions = (value: string) => {
      const text = sanitizeJsonText(value);
      const idMatches = [...text.matchAll(/"id"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g)];
      const blocks = idMatches.map((match, index) => {
        const start = match.index ?? 0;
        const end = idMatches[index + 1]?.index ?? text.length;
        return text.slice(start, end);
      });

      const readString = (block: string, field: string, nextField?: string) => {
        const endPattern = nextField
          ? `"\\s*,\\s*"${nextField}"`
          : `"\\s*(?:[,}]|$)`;
        const re = new RegExp(`"${field}"\\s*:\\s*"([\\s\\S]*?)${endPattern}`);
        const match = block.match(re);
        return match?.[1]
          ?.replace(/\\"/g, '"')
          .replace(/\\n/g, " ")
          .replace(/\\\\/g, "\\")
          .trim();
      };

      const rawQs = blocks.map((block, i) => ({
        id: readString(block, "id", "questionText") ?? `q-${i + 1}`,
        questionText: readString(block, "questionText", "correctAnswer") ?? "",
        correctAnswer: block.match(/"correctAnswer"\s*:\s*"?(-?\d+)/)?.[1] ?? "",
        subject: readString(block, "subject", "topic") ?? activeSubject,
        topic: readString(block, "topic", "difficulty") ?? activeChapter,
        difficulty: readString(block, "difficulty", "explanation") ?? "Medium",
        explanation: readString(block, "explanation") ?? "",
      }));

      return normalizeQuestions(rawQs);
    };

    const parseQuiz = (value: string) => {
      try {
        const parsed = JSON.parse(extractJsonCandidate(value));
        const validated = NumericQuizSchema.safeParse(parsed);
        const rawQs = validated.success
          ? validated.data.questions
          : ((parsed as { questions?: unknown[] })?.questions ?? []);
        return normalizeQuestions(rawQs as Array<Record<string, unknown>>);
      } catch {
        return salvageQuestions(value);
      }
    };

    let lastProblem = "invalid JSON";
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const { text: rawText } = await generateText({
        model: gateway("google/gemini-2.5-flash"),
        temperature: attempt === 0 ? 0.2 : 0.1,
        maxOutputTokens: 2400,
        prompt: buildPrompt(attempt, lastProblem),
      });

      const questions = parseQuiz(rawText);
      if (questions.length === 5) {
        return { questions };
      }
      lastProblem = `only ${questions.length} valid integer questions were found`;
    }

    throw new Error(
      "Quiz generation could not create valid integer questions. Please try again.",
    );
  });
