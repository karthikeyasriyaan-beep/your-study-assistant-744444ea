import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, ChevronRight, ExternalLink, GraduationCap, Tag, Youtube } from "lucide-react";
import {
  BOOK_VAULT,
  SCERT_TELANGANA_PORTAL,
  type Board,
} from "@/lib/materials-data";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/materials/")({
  head: () => ({
    meta: [
      { title: "Materials Hub — Telangana Class 6 to 10 Textbooks" },
      {
        name: "description",
        content:
          "Telangana State Board Class 6, 7, 8, 9, and 10 textbooks — all subjects with checked SCERT textbook links.",
      },
      { property: "og:title", content: "Materials Hub — Telangana Classes 6–10" },
      {
        property: "og:description",
        content:
          "Telangana State Syllabus textbooks for Classes 6 to 10 with checked official SCERT PDF links.",
      },
    ],
  }),
  component: MaterialsIndex,
});

function MaterialsIndex() {
  const { t: tt } = useI18n();
  const [classId, setClassId] = useState(BOOK_VAULT[0].id);
  const [subjectId, setSubjectId] = useState(BOOK_VAULT[0].subjects[0].id);

  const cls = BOOK_VAULT.find((c) => c.id === classId) ?? BOOK_VAULT[0];
  const subject =
    cls.subjects.find((s) => s.id === subjectId) ?? cls.subjects[0];
  const board: Board = "Telangana State Board";
  const chapters = useMemo(() => subject.boards[board] ?? [], [subject, board]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{tt("materials.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {tt("materials.subtitle")}
        </p>

        <a
          href={SCERT_TELANGANA_PORTAL}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Official SCERT textbook source
          <ExternalLink className="h-3 w-3" />
        </a>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            to="/materials/inter-mpc"
            className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4 transition hover:border-primary hover:shadow-sm"
          >
            <div className="shrink-0 rounded-lg bg-primary/15 p-2 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold">
                  Intermediate MPC (JEE)
                </h3>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Maths IA/IB/IIA/IIB · Physics · Chemistry · EN & TE
              </p>
            </div>
          </Link>
          <Link
            to="/materials/inter-bipc"
            className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 transition hover:border-emerald-500 hover:shadow-sm"
          >
            <div className="shrink-0 rounded-lg bg-emerald-500/15 p-2 text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold">
                  Intermediate BiPC (NEET)
                </h3>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Botany · Zoology · Physics · Chemistry · EN & TE
              </p>
            </div>
          </Link>
          <Link
            to="/materials/ap"
            className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 transition hover:border-amber-500 hover:shadow-sm"
          >
            <div className="shrink-0 rounded-lg bg-amber-500/15 p-2 text-amber-600 dark:text-amber-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold">
                  AP State Syllabus (SCERT)
                </h3>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Class 6–10 · Maths · Sciences · Social · EN &amp; TE medium
              </p>
            </div>
          </Link>
          <Link
            to="/videos"
            className="flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-500/5 p-4 transition hover:border-rose-500 hover:shadow-sm"
          >
            <div className="shrink-0 rounded-lg bg-rose-500/15 p-2 text-rose-600 dark:text-rose-400">
              <Youtube className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold">
                  Video Lessons — Class 6–9
                </h3>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Vedantu &amp; Physics Wallah lectures, subject by subject
              </p>
            </div>
          </Link>
          <Link
            to="/materials/cbse"
            className="flex items-center gap-3 rounded-xl border border-sky-500/40 bg-sky-500/5 p-4 transition hover:border-sky-500 hover:shadow-sm sm:col-span-2"
          >
            <div className="shrink-0 rounded-lg bg-sky-500/15 p-2 text-sky-600 dark:text-sky-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold">
                  CBSE — NCERT Textbooks
                </h3>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Class 6–12 · Maths · Science · English · Social · PCB · official NCERT links
              </p>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[200px_220px_1fr]">
        <aside className="space-y-2">
          <div className="px-2 text-xs font-semibold uppercase text-muted-foreground">
            Class
          </div>
          {BOOK_VAULT.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setClassId(c.id);
                // Dynamically safely switch to the first available subject layout when changing classes
                setSubjectId(c.subjects[0]?.id ?? "");
              }}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm transition ${
                classId === c.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {c.name}
            </button>
          ))}
        </aside>

        <aside className="space-y-2">
          <div className="px-2 text-xs font-semibold uppercase text-muted-foreground">
            Subject
          </div>
          {cls.subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => setSubjectId(s.id)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm transition ${
                subjectId === s.id
                  ? "bg-secondary text-secondary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {s.name}
            </button>
          ))}
        </aside>

        <section className="space-y-4">
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
            Showing <strong>Telangana State Board</strong> · State syllabus
            textbook links
          </div>

          <div className="stagger-in space-y-3">
            {chapters.length === 0 ? (
              <div className="rounded-xl border bg-muted/40 p-6 text-sm text-muted-foreground">
                No textbooks mapped yet.
              </div>
            ) : (
              chapters.map((ch) => (
                <Link
                  key={ch.id}
                  to="/materials/$chapterId"
                  params={{ chapterId: ch.id }}
                  className="card-lift group flex items-start gap-3 rounded-xl border bg-card p-4 hover:border-primary/40"
                >
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">
                        {ch.title}
                      </h3>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5" />
                    </div>
                    {ch.note ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {ch.note}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className="gap-1 text-[10px]">
                        <Tag className="h-2.5 w-2.5" /> Telangana State Syllabus
                      </Badge>
                      {ch.competitiveTags.map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
