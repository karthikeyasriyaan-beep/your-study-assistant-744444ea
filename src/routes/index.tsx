import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChatInterface } from "@/components/learning/chat-interface";
import { loadNotebook, newNotebook, type Notebook } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Intelligent Learning — AI Notebook Tutor" },
      {
        name: "description",
        content:
          "Chat with an AI study tutor. Attach a notebook photo, get formulas, concepts, flashcards, quiz — and Socratic hints, never direct answers.",
      },
      { property: "og:title", content: "Intelligent Learning" },
      {
        property: "og:description",
        content:
          "Hinglish-friendly AI tutor. Hints only, never solutions. Scans auto-generate flashcards & quizzes.",
      },
    ],
  }),
  component: Index,
  ssr: false,
});

function Index() {
  const [nb, setNb] = useState<Notebook | null>(null);

  useEffect(() => {
    let existing = loadNotebook();
    if (!existing) {
      existing = newNotebook();
    }
    setNb(existing);
  }, []);

  if (!nb) {
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  }
  return <ChatInterface notebook={nb} />;
}
