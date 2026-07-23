import { createFileRoute } from "@tanstack/react-router";
import { AITutor } from "@/components/learning/ai-tutor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Tutor — Trackora Smart Study Hub" },
      {
        name: "description",
        content:
          "Chat with the Trackora AI Tutor. Full explanations, formulas, step-by-step solutions, and in-app guidance grounded in your current focus topic.",
      },
      { property: "og:title", content: "AI Tutor — Trackora" },
      {
        property: "og:description",
        content:
          "Ask any doubt, get full explanations, or ask how to use anything in Trackora. Grounded in your active focus.",
      },
    ],
  }),
  component: AITutor,
  ssr: false,
});
