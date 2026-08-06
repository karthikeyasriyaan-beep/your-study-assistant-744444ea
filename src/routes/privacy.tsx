import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  Camera,
  Trash2,
  Server,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy & Data Trust — Stutora" },
      {
        name: "description",
        content:
          "What happens to the photos you upload to the Stutora AI tutor, what is stored on your device, and how to delete everything in one tap.",
      },
      { property: "og:title", content: "Privacy & Data Trust — Stutora" },
      {
        property: "og:description",
        content:
          "Photos are used once to answer your question and are never stored on our servers. Delete your data anytime.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
  ssr: false,
});

const CHAT_KEYS = ["trackora:tutor-convos:v1", "trackora:tutor-convos:active", "intelligent-learning:notebook:v2"];
const STUDY_KEYS = [
  "trackora:study-sessions:v1",
  "trackora:focus-topic:v1",
  "trackora:active-focus-topic",
  "trackora:profile:v1",
];

function clearKeys(keys: string[]) {
  try {
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* noop */
  }
}

function PrivacyPage() {
  const [confirming, setConfirming] = useState<string | null>(null);

  const run = (id: string, label: string, action: () => void) => {
    if (confirming !== id) {
      setConfirming(id);
      window.setTimeout(() => setConfirming((c) => (c === id ? null : c)), 4000);
      return;
    }
    action();
    setConfirming(null);
    toast.success(`${label} deleted`);
    window.setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 font-ui text-xs text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to the tutor
      </Link>

      <header className="mt-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-ui text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-primary" /> Privacy & Data Trust
        </div>
        <h1 className="mt-4 font-display text-[32px] leading-[1.08] tracking-tight sm:text-[44px]">
          Your notebook photos stay yours.
        </h1>
        <p className="mt-4 max-w-xl font-ui text-[15px] leading-relaxed text-muted-foreground">
          Stutora is built to be boring about your data: we keep as little of it
          as possible, we keep it on your device, and you can wipe it in one tap.
        </p>
      </header>

      <section className="mt-10 space-y-3">
        <Card
          icon={Camera}
          title="What happens when you upload a photo"
          points={[
            "The photo is sent once, over an encrypted connection, to the AI model that writes your answer.",
            "It is used only to read the question in the image. It is never used to train models, never shown to anyone, and never sold.",
            "We do not save the image file on our servers. Once the answer is streamed back, the copy in transit is gone.",
            "A copy of the photo stays in the chat on your own device, so you can scroll back to it. Deleting the chat deletes that copy.",
          ]}
        />
        <Card
          icon={Server}
          title="What we store"
          points={[
            "No account, no email, no phone number — Stutora works without signup.",
            "Your chats, focus sessions, saved plans and quiz results live in your browser's local storage, on this device only.",
            "Nothing syncs to a server, so clearing your browser data clears Stutora too.",
          ]}
        />
        <Card
          icon={Lock}
          title="What we never do"
          points={[
            "No ads and no ad trackers.",
            "No selling or sharing of your study data.",
            "No reading your chats for anything other than answering the question you asked.",
          ]}
        />
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-tight">Delete your data</h2>
        <p className="mt-2 font-ui text-sm text-muted-foreground">
          Tap once to confirm, tap again to delete. This cannot be undone.
        </p>
        <div className="mt-5 space-y-2.5">
          <DeleteRow
            title="Delete AI tutor chats & uploaded photos"
            body="Removes every conversation, along with the notebook photos attached to them."
            confirming={confirming === "chats"}
            onClick={() => run("chats", "Chats and photos", () => clearKeys(CHAT_KEYS))}
          />
          <DeleteRow
            title="Delete study history"
            body="Focus sessions, active focus topic, streak and XP."
            confirming={confirming === "study"}
            onClick={() => run("study", "Study history", () => clearKeys(STUDY_KEYS))}
          />
          <DeleteRow
            title="Delete everything"
            body="Wipes all Stutora data on this device and resets the app to a fresh start."
            danger
            confirming={confirming === "all"}
            onClick={() =>
              run("all", "All Stutora data", () => {
                try {
                  const keys = Object.keys(window.localStorage).filter(
                    (k) =>
                      k.startsWith("trackora:") ||
                      k.startsWith("stutora:") ||
                      k.startsWith("intelligent-learning:"),
                  );
                  keys.forEach((k) => window.localStorage.removeItem(k));
                } catch {
                  /* noop */
                }
              })
            }
          />
        </div>
        <p className="mt-5 font-ui text-xs leading-relaxed text-muted-foreground">
          You can also delete a single conversation from the AI Tutor sidebar —
          that removes its photos too. Questions about your data? Ask inside the
          app and we'll answer.
        </p>
      </section>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  points,
}: {
  icon: typeof Camera;
  title: string;
  points: string[];
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-display text-lg tracking-tight">{title}</h2>
      </div>
      <ul className="mt-3 space-y-2 font-ui text-sm leading-relaxed text-muted-foreground">
        {points.map((p) => (
          <li key={p} className="flex gap-2.5">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary/70" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeleteRow({
  title,
  body,
  onClick,
  confirming,
  danger = false,
}: {
  title: string;
  body: string;
  onClick: () => void;
  confirming: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
        danger
          ? "border-destructive/30 bg-destructive/[0.06]"
          : "border-white/[0.08] bg-white/[0.02]"
      }`}
    >
      <div className="min-w-0">
        <div className="font-ui text-sm font-semibold text-foreground">{title}</div>
        <div className="mt-0.5 font-ui text-xs text-muted-foreground">{body}</div>
      </div>
      <button
        onClick={onClick}
        className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2 font-ui text-xs font-semibold transition active:scale-[0.98] ${
          confirming
            ? "bg-destructive text-destructive-foreground"
            : "border border-white/[0.1] bg-white/[0.03] text-foreground hover:bg-white/[0.07]"
        }`}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {confirming ? "Tap again to confirm" : "Delete"}
      </button>
    </div>
  );
}