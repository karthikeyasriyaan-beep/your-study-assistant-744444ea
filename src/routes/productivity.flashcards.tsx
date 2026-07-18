import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RotateCw, Sparkles } from "lucide-react";
import { loadNotebook } from "@/lib/storage";
import {
  dueInLabel,
  isDueNow,
  loadSchedule,
  rateCard,
  type CardSchedule,
  type Rating,
} from "@/lib/srs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/productivity/flashcards")({
  component: FlashcardsPage,
  ssr: false,
});

type ReviewCard = { id: string; front: string; back: string };

function FlashcardsPage() {
  const [cards, setCards] = useState<ReviewCard[] | null>(null);
  const [schedule, setSchedule] = useState<Record<string, CardSchedule>>({});

  useEffect(() => {
    const nb = loadNotebook();
    if (nb?.assessment?.flashcards?.length) {
      setCards(
        nb.assessment.flashcards.map((c, i) => ({
          id: `${nb.id}:${i}`,
          front: c.front,
          back: c.back,
        })),
      );
    } else {
      setCards([]);
    }
    setSchedule(loadSchedule());
  }, []);

  // Build review queue: anything due now, plus a transient "again" queue from Hard ratings
  const [againIds, setAgainIds] = useState<string[]>([]);
  const queue = useMemo(() => {
    if (!cards) return [];
    const due = cards.filter((c) => isDueNow(schedule[c.id]));
    // Re-queue "again" cards at the end of current session
    const againSet = new Set(againIds);
    const dueIds = new Set(due.map((d) => d.id));
    const extras = cards.filter((c) => againSet.has(c.id) && !dueIds.has(c.id));
    return [...due, ...extras];
  }, [cards, schedule, againIds]);

  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const current = queue[i];

  const rate = (r: Rating) => {
    if (!current) return;
    const next = rateCard(current.id, r);
    setSchedule((s) => ({ ...s, [current.id]: next }));
    if (r === "hard") {
      setAgainIds((a) => (a.includes(current.id) ? a : [...a, current.id]));
    } else {
      setAgainIds((a) => a.filter((id) => id !== current.id));
    }
    setFlipped(false);
    setI((v) => v + 1);
  };

  if (cards === null) return null;

  if (cards.length === 0) {
    return (
      <EmptyState message="Upload a notebook and generate an assessment first — your flashcards will land here for spaced repetition." />
    );
  }

  if (!current) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary" />
        <h2 className="text-lg font-semibold">All caught up</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Come back tomorrow. Cards you rated Medium return in 3 days, Easy in
          7 days.
        </p>
        <div className="mx-auto mt-6 max-w-md space-y-2 text-left">
          {cards.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-xs"
            >
              <span className="truncate">{c.front}</span>
              <Badge variant="outline">{dueInLabel(schedule[c.id])}</Badge>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setI(0);
            setAgainIds([]);
          }}
        >
          <RotateCw className="mr-2 h-3 w-3" /> Force re-review
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Card {i + 1} of {queue.length} in review queue
        </span>
        <span>{dueInLabel(schedule[current.id])}</span>
      </div>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex h-64 w-full items-center justify-center rounded-2xl border bg-card p-6 text-center shadow-sm transition hover:shadow-md"
      >
        <div>
          <Badge
            variant={flipped ? "secondary" : "default"}
            className="mb-3"
          >
            {flipped ? "Answer" : "Question"}
          </Badge>
          <p className="text-base font-medium">
            {flipped ? current.back : current.front}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">click to flip</p>
        </div>
      </button>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          disabled={!flipped}
          onClick={() => rate("hard")}
          className="border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          Hard · again now
        </Button>
        <Button
          variant="outline"
          disabled={!flipped}
          onClick={() => rate("medium")}
          className="border-amber-500/40 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
        >
          Medium · 3 days
        </Button>
        <Button
          variant="outline"
          disabled={!flipped}
          onClick={() => rate("easy")}
          className="border-green-600/40 text-green-700 hover:bg-green-600/10 dark:text-green-300"
        >
          Easy · 7 days
        </Button>
      </div>
      {!flipped && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Flip the card to reveal rating buttons.
        </p>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border bg-card p-10 text-center">
      <p className="mx-auto max-w-md text-sm text-muted-foreground">{message}</p>
      <Link
        to="/"
        className="mt-4 inline-block text-sm font-medium text-primary underline"
      >
        Go to Learn module
      </Link>
    </div>
  );
}
