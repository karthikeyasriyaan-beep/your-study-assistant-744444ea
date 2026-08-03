import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { CBSE_VAULT, NCERT_PORTAL, ncertUrl } from "@/lib/cbse-data";
import { Badge } from "@/components/ui/badge";
import { CbseFeedbackDialog } from "@/components/materials/cbse-feedback-dialog";

export const Route = createFileRoute("/materials/cbse")({
  head: () => ({
    meta: [
      { title: "CBSE NCERT Textbooks — Class 6 to 12 | Study Hub" },
      {
        name: "description",
        content:
          "Free CBSE textbooks for Class 6 to 12 linked straight from the official NCERT site — Maths, Science, English, Social Science, Physics, Chemistry, Biology.",
      },
      { property: "og:title", content: "CBSE NCERT Textbooks — Class 6 to 12" },
      {
        property: "og:description",
        content:
          "Chapter-wise NCERT PDFs for every CBSE class and subject, opened directly from ncert.nic.in.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CbseMaterials,
});

function CbseMaterials() {
  const [classId, setClassId] = useState(CBSE_VAULT[0].id);
  const cls = CBSE_VAULT.find((c) => c.id === classId) ?? CBSE_VAULT[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CbseFeedbackDialog />

      <Link
        to="/materials"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All textbooks
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">CBSE — NCERT Textbooks</h1>
        <p className="text-sm text-muted-foreground">
          Class 6 to 12, linked directly from the official NCERT site.
        </p>
        <a
          href={NCERT_PORTAL}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Official NCERT textbook portal <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CBSE_VAULT.map((c) => (
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
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {s.name}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {s.books.map((bk) => (
                <a
                  key={bk.id}
                  href={ncertUrl(bk)}
                  target="_blank"
                  rel="noreferrer"
                  className="card-lift group flex items-start gap-3 rounded-xl border bg-card p-4 hover:border-primary/40"
                >
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">{bk.title}</h3>
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        NCERT · {cls.name}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {bk.chapters} chapters
                      </Badge>
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