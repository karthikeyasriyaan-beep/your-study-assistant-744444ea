import { useState } from "react";
import {
  ChevronDown,
  Sigma,
  Lightbulb,
  AlertTriangle,
  XCircle,
  ScanLine,
  Check,
  X as XIcon,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Workspace } from "@/lib/storage";

export function WorkspaceCard({ ws }: { ws: Workspace }) {
  const { summary, assessment } = ws;
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="gap-1" variant="default">
          <ScanLine className="h-3 w-3" /> Scanned
        </Badge>
        <Badge variant="secondary">{summary.topicTags.class}</Badge>
        <Badge variant="secondary">{summary.topicTags.subject}</Badge>
        <Badge variant="outline">{summary.topicTags.chapter}</Badge>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {ws.sourceName}
        </span>
      </div>

      <Expandable
        title={`Extracted Formulas (${summary.formulas.length})`}
        icon={<Sigma className="h-4 w-4" />}
      >
        {summary.formulas.length === 0 ? (
          <p className="text-xs text-muted-foreground">No formulas detected.</p>
        ) : (
          <ul className="space-y-1.5">
            {summary.formulas.map((f, i) => (
              <li
                key={i}
                className="rounded-md bg-muted/60 px-3 py-1.5 font-mono text-xs"
              >
                {f}
              </li>
            ))}
          </ul>
        )}
      </Expandable>

      <div className="grid gap-2 sm:grid-cols-3">
        <ConceptBlock
          icon={<Lightbulb className="h-3.5 w-3.5" />}
          title="Core concepts"
          items={summary.concepts.coreDefinitions}
          tone="primary"
        />
        <ConceptBlock
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          title="Edge cases"
          items={summary.concepts.trickyExceptions}
          tone="warn"
        />
        <ConceptBlock
          icon={<XCircle className="h-3.5 w-3.5" />}
          title="Test pitfalls"
          items={summary.concepts.commonExamMistakes}
          tone="danger"
        />
      </div>

      {assessment && (
        <Expandable
          title={`Study tokens · ${assessment.flashcards.length} flashcards + ${assessment.quiz.length}-Q quiz`}
          icon={<Layers className="h-4 w-4" />}
        >
          <FlashcardDeck cards={assessment.flashcards} />
          <Quiz quiz={assessment.quiz} />
        </Expandable>
      )}
    </div>
  );
}

function Expandable({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border bg-background/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-muted/50"
      >
        {icon}
        <span>{title}</span>
        <ChevronDown
          className={`ml-auto h-4 w-4 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="space-y-3 border-t p-3">{children}</div>}
    </div>
  );
}

function ConceptBlock({
  icon,
  title,
  items,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  tone: "primary" | "warn" | "danger";
}) {
  const cls = {
    primary: "border-primary/30 bg-primary/5",
    warn: "border-amber-500/30 bg-amber-500/5",
    danger: "border-destructive/30 bg-destructive/5",
  }[tone];
  return (
    <div className={`rounded-xl border p-3 ${cls}`}>
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
        {icon}
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">—</p>
      ) : (
        <ul className="space-y-1 text-[12px] leading-snug">
          {items.map((it, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current opacity-60" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FlashcardDeck({
  cards,
}: {
  cards: NonNullable<Workspace["assessment"]>["flashcards"];
}) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (!cards.length) return null;
  const c = cards[i];
  return (
    <section>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold">Flashcards</span>
        <span className="text-muted-foreground">
          {i + 1} / {cards.length}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-32 w-full items-center justify-center rounded-xl border bg-card p-4 text-center hover:shadow-sm"
      >
        <div>
          <Badge variant={flipped ? "secondary" : "default"} className="mb-2">
            {flipped ? "Answer" : "Question"}
          </Badge>
          <p className="text-sm font-medium">{flipped ? c.back : c.front}</p>
          <p className="mt-2 text-[10px] text-muted-foreground">tap to flip</p>
        </div>
      </button>
      <div className="mt-2 flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFlipped(false);
            setI((v) => (v - 1 + cards.length) % cards.length);
          }}
        >
          Prev
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFlipped(false);
            setI((v) => (v + 1) % cards.length);
          }}
        >
          Next
        </Button>
      </div>
    </section>
  );
}

function Quiz({
  quiz,
}: {
  quiz: NonNullable<Workspace["assessment"]>["quiz"];
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = quiz.reduce(
    (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
    0,
  );
  return (
    <section className="mt-4">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold">5-Q Quiz</span>
        {submitted && (
          <span className="font-medium">
            Score {score}/{quiz.length}
          </span>
        )}
      </div>
      <div className="space-y-3">
        {quiz.map((q, qi) => {
          const picked = answers[qi];
          return (
            <div key={qi} className="rounded-lg border bg-card p-3">
              <div className="mb-1.5 flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {q.type === "assertion-reasoning" ? "A-R" : "MCQ"}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  Q{qi + 1}
                </span>
              </div>
              <p className="mb-2 whitespace-pre-wrap text-xs font-medium">
                {q.question}
              </p>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => {
                  const isPicked = picked === oi;
                  const isCorrect = submitted && oi === q.correctIndex;
                  const isWrong = submitted && isPicked && !isCorrect;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={submitted}
                      onClick={() =>
                        setAnswers((a) => ({ ...a, [qi]: oi }))
                      }
                      className={`flex w-full items-start gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition ${
                        isCorrect
                          ? "border-green-500 bg-green-500/10"
                          : isWrong
                            ? "border-destructive bg-destructive/10"
                            : isPicked
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isCorrect && <Check className="h-3.5 w-3.5 text-green-600" />}
                      {isWrong && <XIcon className="h-3.5 w-3.5 text-destructive" />}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2">
        {!submitted ? (
          <Button
            size="sm"
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < quiz.length}
          >
            Submit
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
          >
            Retake
          </Button>
        )}
      </div>
    </section>
  );
}
