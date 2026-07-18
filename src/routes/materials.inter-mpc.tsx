import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ExternalLink,
  Search,
  Target,
  CheckCircle2,
} from "lucide-react";
import {
  INTER_MPC_VAULT,
  MPC_MEDIUMS,
  MPC_SUBJECTS,
  MPC_YEARS,
  classLevelForYear,
  findBook,
  getChaptersByBookId,
  searchChapters,
  setActiveFocusTopic,
  type InterYear,
  type MPCSubject,
  type ResourceMedium,
} from "@/lib/inter-mpc-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/materials/inter-mpc")({
  head: () => ({
    meta: [
      { title: "Intermediate MPC — Junior & Senior Inter | Study Hub" },
      {
        name: "description",
        content:
          "Telangana Intermediate MPC textbook vault: Maths IA/IB/IIA/IIB, Physics, Chemistry — English & Telugu media, chapter-wise PDFs, and focus-topic anchor.",
      },
      { property: "og:title", content: "Intermediate MPC — Study Hub" },
      {
        property: "og:description",
        content:
          "TSBIE MPC syllabus with chapter-wise PDFs and a 3-hour exam endurance focus anchor.",
      },
    ],
  }),
  component: IntermediateMPC,
});

function IntermediateMPC() {
  const [year, setYear] = useState<InterYear>("1st Year");
  const [subject, setSubject] = useState<MPCSubject>("Mathematics A");
  const [medium, setMedium] = useState<ResourceMedium>("English");
  const [chapterIdx, setChapterIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [flashId, setFlashId] = useState<string | null>(null);

  // Auto-reset cascade: changing year or subject snaps chapter to Chapter 1.
  useEffect(() => {
    setChapterIdx(0);
  }, [year, subject]);

  const book = useMemo(
    () => findBook(year, subject, medium),
    [year, subject, medium],
  );
  const chapters = book ? getChaptersByBookId(book.id) : [];
  const safeIdx = Math.min(chapterIdx, Math.max(0, chapters.length - 1));
  const activeChapter = chapters[safeIdx];

  const hits = useMemo(() => searchChapters(query), [query]);

  const handleSetFocus = () => {
    if (!activeChapter) return;
    const t = setActiveFocusTopic(
      classLevelForYear(year),
      subject,
      activeChapter.title,
    );
    setFlashId(`${t.setAt}`);
    setTimeout(() => setFlashId(null), 2200);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Materials Hub</span>
          <span>/</span>
          <span className="text-foreground">Intermediate MPC</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Intermediate MPC — Junior & Senior Inter
        </h1>
        <p className="text-sm text-muted-foreground">
          TSBIE syllabus • Maths IA / IB / IIA / IIB • Physics • Chemistry •
          English & Telugu media
        </p>
      </header>

      {/* Cascading filters */}
      <section className="mb-6 grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-3">
        <FilterGroup label="Year">
          {MPC_YEARS.map((y) => (
            <Chip
              key={y}
              active={year === y}
              onClick={() => setYear(y)}
              label={y}
            />
          ))}
        </FilterGroup>
        <FilterGroup label="Subject">
          {MPC_SUBJECTS.map((s) => (
            <Chip
              key={s}
              active={subject === s}
              onClick={() => setSubject(s)}
              label={s}
            />
          ))}
        </FilterGroup>
        <FilterGroup label="Medium">
          {MPC_MEDIUMS.map((m) => (
            <Chip
              key={m}
              active={medium === m}
              onClick={() => setMedium(m)}
              label={m}
            />
          ))}
        </FilterGroup>
      </section>

      {/* Search */}
      <section className="mb-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapters across all MPC books…"
            className="pl-9"
          />
        </div>
        {query.trim() && (
          <div className="mt-2 max-h-64 overflow-auto rounded-md border bg-card text-sm">
            {hits.length === 0 ? (
              <div className="px-3 py-4 text-muted-foreground">
                No chapters match "{query}".
              </div>
            ) : (
              hits.slice(0, 40).map((h) => (
                <button
                  key={`${h.book.id}-${h.chapter.number}`}
                  onClick={() => {
                    setYear(h.book.year);
                    setSubject(h.book.subject);
                    setMedium(h.book.medium);
                    setTimeout(
                      () => setChapterIdx(h.chapter.number - 1),
                      0,
                    );
                    setQuery("");
                  }}
                  className="flex w-full items-center justify-between gap-3 border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/50"
                >
                  <span className="truncate">
                    <span className="font-medium">{h.chapter.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {h.book.subject} • {h.book.year} • {h.book.medium}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Ch {h.chapter.number}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </section>

      {/* Book + chapters */}
      {book ? (
        <section className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-2 flex flex-wrap gap-1 text-xs">
              <Badge variant="outline">{book.year}</Badge>
              <Badge variant="outline">{book.subject}</Badge>
              <Badge variant="outline">{book.medium}</Badge>
            </div>
            <h2 className="text-lg font-semibold">{book.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Telangana State Board (TSBIE) — chapter split PDFs mirrored to a
              fast CDN.
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <a
                href={book.cdnUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Open full textbook (CDN mirror){" "}
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={book.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Official source fallback <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Chapters</h3>
              <span className="text-xs text-muted-foreground">
                {chapters.length} total
              </span>
            </div>
            <ol className="space-y-1">
              {chapters.map((ch, i) => {
                const active = i === safeIdx;
                return (
                  <li key={ch.number}>
                    <button
                      onClick={() => setChapterIdx(i)}
                      className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                        active
                          ? "bg-primary/10 text-foreground ring-1 ring-primary/40"
                          : "hover:bg-muted/60"
                      }`}
                    >
                      <span className="truncate">
                        <span className="mr-2 inline-block w-6 text-xs text-muted-foreground">
                          {ch.number}.
                        </span>
                        {ch.title}
                      </span>
                      <a
                        href={ch.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-primary hover:underline"
                      >
                        PDF
                      </a>
                    </button>
                  </li>
                );
              })}
            </ol>

            {activeChapter && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-primary/30 bg-primary/5 p-3">
                <Target className="h-4 w-4 text-primary" />
                <div className="flex-1 text-xs">
                  <div className="font-medium text-foreground">
                    {activeChapter.title}
                  </div>
                  <div className="text-muted-foreground">
                    {classLevelForYear(year)} • {subject} • {medium}
                  </div>
                </div>
                <Button size="sm" onClick={handleSetFocus}>
                  Set as Active Focus Topic
                </Button>
                {flashId && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Bound to 3-hour
                    endurance timer
                  </span>
                )}
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No book found for this combination.
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}
