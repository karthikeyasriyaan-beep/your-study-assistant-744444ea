import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Check, X, Sparkles } from "lucide-react";
import { loadNotebook, type Notebook } from "@/lib/storage";
import { useFocusTopic } from "@/lib/focus-topic-store";
import {
  generateNumericQuiz,
  type Assessment,
  type NumericQuiz,
} from "@/lib/learning.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addXP } from "@/lib/profile-store";
import { toast } from "sonner";

export const Route = createFileRoute("/productivity/quiz")({
  component: QuizPage,
  ssr: false,
});

type Mode = "factual" | "numeric";

function QuizPage() {
  const [nb, setNb] = useState<Notebook | null>(null);
  const [mode, setMode] = useState<Mode>("factual");

  useEffect(() => {
    setNb(loadNotebook());
  }, []);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-muted p-1">
        <button
          onClick={() => setMode("factual")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm transition ${mode === "factual" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
        >
          Factual / Assertion-Reasoning (MCQ)
        </button>
        <button
          onClick={() => setMode("numeric")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm transition ${mode === "numeric" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
        >
          Advanced Numeric (integer)
        </button>
      </div>

      <div className="mb-3 rounded-md bg-primary/5 px-3 py-2 text-xs text-primary">
        Indian competitive marking scheme: <strong>+4</strong> correct,{" "}
        <strong>−1</strong> incorrect, <strong>0</strong> unattempted.
      </div>

      {mode === "factual" ? (
        !nb ? (
          <div className="rounded-xl border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Upload a notebook first to generate factual questions.
            </p>
            <Link
              to="/"
              className="mt-4 inline-block text-sm font-medium text-primary underline"
            >
              Go to Learn module
            </Link>
          </div>
        ) : (
          <FactualQuiz notebook={nb} />
        )
      ) : (
        <NumericQuizRunner notebook={nb} />
      )}
    </div>
  );
}

// ---------- Factual / Assertion-Reasoning ----------

function FactualQuiz({ notebook }: { notebook: Notebook }) {
  const quiz: Assessment["quiz"] | undefined = notebook.assessment?.quiz;
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz?.length) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Generate an assessment from the Learn module to unlock this quiz.
        </p>
      </div>
    );
  }

  const { score, correct, wrong, blank } = grade(quiz, answers);
  const accuracy =
    correct + wrong === 0 ? 0 : Math.round((correct / (correct + wrong)) * 100);

  return (
    <div className="space-y-4">
      {quiz.map((q, qi) => {
        const picked = answers[qi];
        return (
          <div key={qi} className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {q.type === "assertion-reasoning" ? "Assertion-Reasoning" : "MCQ"}
              </Badge>
              <span className="text-xs text-muted-foreground">Q{qi + 1}</span>
              {submitted && (
                <span className="ml-auto text-xs font-medium">
                  {picked == null
                    ? "0"
                    : picked === q.correctIndex
                      ? "+4"
                      : "−1"}
                </span>
              )}
            </div>
            <p className="mb-3 whitespace-pre-wrap text-sm font-medium">
              {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const isPicked = picked === oi;
                const isCorrect = submitted && oi === q.correctIndex;
                const isWrong = submitted && isPicked && !isCorrect;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                      isCorrect
                        ? "border-green-500 bg-green-500/10"
                        : isWrong
                          ? "border-destructive bg-destructive/10"
                          : isPicked
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {isCorrect && <Check className="h-4 w-4 text-green-600" />}
                    {isWrong && <X className="h-4 w-4 text-destructive" />}
                  </button>
                );
              })}
              {!submitted && (
                <button
                  type="button"
                  onClick={() => setAnswers((a) => ({ ...a, [qi]: null }))}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Skip this question
                </button>
              )}
            </div>
            {submitted && (
              <p className="mt-2 text-xs text-muted-foreground">
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <Button
          onClick={() => {
            const answered = Object.values(answers).filter(
              (v) => v != null,
            ).length;
            addXP(answered * 10, "quiz.answered", {
              source: "productivity-factual",
              answered,
            });
            setSubmitted(true);
          }}
        >
          Submit & score
        </Button>
      ) : (
        <ScoreCard
          score={score}
          maxScore={quiz.length * 4}
          correct={correct}
          wrong={wrong}
          blank={blank}
          accuracy={accuracy}
          onRetake={() => {
            setAnswers({});
            setSubmitted(false);
          }}
        />
      )}
    </div>
  );
}

function grade(
  quiz: Assessment["quiz"],
  answers: Record<number, number | null>,
) {
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let blank = 0;
  quiz.forEach((q, i) => {
    const a = answers[i];
    if (a == null || a === undefined) {
      blank++;
      return;
    }
    if (a === q.correctIndex) {
      score += 4;
      correct++;
    } else {
      score -= 1;
      wrong++;
    }
  });
  return { score, correct, wrong, blank };
}

// ---------- Numeric ----------

function NumericQuizRunner({ notebook }: { notebook: Notebook | null }) {
  const gen = useServerFn(generateNumericQuiz);
  const focus = useFocusTopic();
  const [quiz, setQuiz] = useState<NumericQuiz | null>(null);
  const [busy, setBusy] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const focusPayload = focus
    ? {
        subject: focus.subject,
        chapterTitle: focus.title,
        classLevel: focus.classLevel,
        stream: /(bio|zoolog|botan)/i.test(focus.subject) ? "BiPC" : "MPC",
        exam: /(bio|zoolog|botan)/i.test(focus.subject)
          ? "NEET"
          : "IIT-JEE Main",
      }
    : undefined;

  const generate = async () => {
    if (!focusPayload && !notebook?.summary) {
      toast.error(
        "Set an active focus topic (from Materials) or generate a notebook summary first.",
      );
      return;
    }
    setBusy(true);
    try {
      const q = await gen({
        data: {
          summary: notebook?.summary,
          text: notebook?.extractedText,
          focusTopic: focusPayload,
        },
      });
      setQuiz(q);
      setAnswers({});
      setSubmitted(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  if (!quiz) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary" />
        {focusPayload ? (
          <p className="mb-1 text-sm">
            Active focus:{" "}
            <strong>
              {focusPayload.subject} — {focusPayload.chapterTitle}
            </strong>{" "}
            <span className="text-muted-foreground">
              ({focusPayload.classLevel} · {focusPayload.exam})
            </span>
          </p>
        ) : (
          <p className="mb-1 text-sm text-muted-foreground">
            No active focus topic — will use your notebook summary if available.
          </p>
        )}
        <p className="mb-4 text-xs text-muted-foreground">
          5 integer-answer questions in JEE/NEET style.
        </p>
        <Button onClick={generate} disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            "Generate numeric quiz"
          )}
        </Button>
      </div>
    );
  }

  const { score, correct, wrong, blank } = gradeNumeric(quiz, answers);
  const accuracy =
    correct + wrong === 0 ? 0 : Math.round((correct / (correct + wrong)) * 100);

  return (
    <div className="space-y-4">
      {quiz.questions.map((q, qi) => {
        const raw = answers[qi]?.trim() ?? "";
        const userVal = raw === "" ? null : Number(raw);
        const isCorrect =
          submitted &&
          userVal !== null &&
          Math.trunc(userVal) === q.correctAnswer;
        const isWrong =
          submitted &&
          userVal !== null &&
          Math.trunc(userVal) !== q.correctAnswer;
        return (
          <div key={q.id} className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Numeric
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {q.subject}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {q.difficulty}
              </Badge>
              <span className="text-xs text-muted-foreground">Q{qi + 1}</span>
              {submitted && (
                <span className="ml-auto text-xs font-medium">
                  {userVal === null ? "0" : isCorrect ? "+4" : "−1"}
                </span>
              )}
            </div>
            <p className="mb-1 text-xs text-muted-foreground">{q.topic}</p>
            <p className="mb-3 whitespace-pre-wrap text-sm font-medium">
              {q.questionText}
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                placeholder="Non-negative integer"
                disabled={submitted}
                value={answers[qi] ?? ""}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [qi]: e.target.value }))
                }
                className={`max-w-[200px] ${isCorrect ? "border-green-500" : isWrong ? "border-destructive" : ""}`}
              />
              {submitted && (
                <span className="text-xs text-muted-foreground">
                  Correct: <strong>{q.correctAnswer}</strong>
                </span>
              )}
            </div>
            {submitted && (
              <p className="mt-2 text-xs text-muted-foreground">
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              const answered = Object.values(answers).filter(
                (v) => v?.trim() !== "" && v != null,
              ).length;
              addXP(answered * 10, "quiz.answered", {
                source: "productivity-numeric",
                answered,
              });
              setSubmitted(true);
            }}
          >
            Submit & score
          </Button>
          <Button variant="outline" onClick={generate} disabled={busy}>
            Regenerate
          </Button>
        </div>
      ) : (
        <ScoreCard
          score={score}
          maxScore={quiz.questions.length * 4}
          correct={correct}
          wrong={wrong}
          blank={blank}
          accuracy={accuracy}
          onRetake={() => {
            setAnswers({});
            setSubmitted(false);
          }}
        />
      )}
    </div>
  );
}

function gradeNumeric(
  quiz: NumericQuiz,
  answers: Record<number, string>,
) {
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let blank = 0;
  quiz.questions.forEach((q, i) => {
    const raw = answers[i]?.trim() ?? "";
    if (raw === "") {
      blank++;
      return;
    }
    const val = Number(raw);
    if (!Number.isFinite(val)) {
      wrong++;
      score -= 1;
      return;
    }
    if (Math.trunc(val) === q.correctAnswer) {
      score += 4;
      correct++;
    } else {
      score -= 1;
      wrong++;
    }
  });
  return { score, correct, wrong, blank };
}

function ScoreCard({
  score,
  maxScore,
  correct,
  wrong,
  blank,
  accuracy,
  onRetake,
}: {
  score: number;
  maxScore: number;
  correct: number;
  wrong: number;
  blank: number;
  accuracy: number;
  onRetake: () => void;
}) {
  return (
    <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-sm text-muted-foreground">
          / {maxScore} marks
        </span>
        <span className="ml-auto text-sm font-medium">
          Accuracy: {accuracy}%
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-md bg-green-500/10 p-2">
          <div className="text-base font-bold text-green-700 dark:text-green-300">
            {correct}
          </div>
          <div className="text-muted-foreground">correct (+4)</div>
        </div>
        <div className="rounded-md bg-destructive/10 p-2">
          <div className="text-base font-bold text-destructive">{wrong}</div>
          <div className="text-muted-foreground">wrong (−1)</div>
        </div>
        <div className="rounded-md bg-muted p-2">
          <div className="text-base font-bold">{blank}</div>
          <div className="text-muted-foreground">skipped (0)</div>
        </div>
      </div>
      <Button variant="outline" className="mt-4" onClick={onRetake}>
        Retake
      </Button>
    </div>
  );
}
