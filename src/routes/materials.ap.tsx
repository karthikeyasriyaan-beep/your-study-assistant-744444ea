import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BookOpen, ExternalLink, Timer } from "lucide-react";
import { AP_BOOK_VAULT, SCERT_AP_PORTAL } from "@/lib/ap-data";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/materials/ap")({
  head: () => ({
    meta: [
      { title: "AP State Syllabus Textbooks — Class 6 to 10 | Stutora" },
      {
        name: "description",
        content:
          "Andhra Pradesh SCERT textbooks for Class 6 to 10 — Maths, Physical Science, Biology, Social, English, Hindi and Telugu, in English and Telugu medium.",
      },
      {
        property: "og:title",
        content: "AP State Syllabus Textbooks — Class 6 to 10",
      },
      {
        property: "og:description",
        content:
          "Every AP SCERT textbook for Classes 6 to 10, in both mediums, wired into the Stutora focus timer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApMaterials,
});

function ApMaterials() {
  const [classId, setClassId] = useState(AP_BOOK_VAULT[0].id);
  const cls = AP_BOOK_VAULT.find((c) => c.id === classId) ?? AP_BOOK_VAULT[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/materials"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All textbooks
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          AP State Syllabus — SCERT Textbooks
        </h1>
        <p className="text-sm text-muted-foreground">
          Class 6 to 10, English and Telugu medium.
        </p>
        <a
          href={SCERT_AP_PORTAL}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Official AP SCERT textbook portal <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {AP_BOOK_VAULT.map((c) => (
          <button
            key={c.id}
            onClick={() => setClassId(c.id)}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              classId === c.id
                ? "bg-primary text-primary-foreground"
                : "border hover:bg-muted"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {cls.subjects.map((s) => (
          <section key={s.id}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {s.name}
              </h2>
              <Link
                to="/management/timer"
                search={{
                  class: cls.syllabusKey,
                  subject: s.name,
                  chapter: undefined,
                }}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Timer className="h-3 w-3" /> Focus on this subject
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {s.books.map((bk) => (
                <a
                  key={bk.id}
                  href={bk.url}
                  target="_blank"
                  rel="noreferrer"
                  className="card-lift group flex items-start gap-3 rounded-xl border bg-card p-4 hover:border-primary/40"
                >
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">
                        {bk.title}
                      </h3>
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        AP SCERT · {cls.name}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {bk.medium}
                      </Badge>
                      {bk.tags.slice(0, 2).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
