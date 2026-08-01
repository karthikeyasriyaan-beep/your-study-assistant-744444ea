import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, ExternalLink, Tag } from "lucide-react";
import { findChapter } from "@/lib/materials-data";
import { Badge } from "@/components/ui/badge";
import { logActivity } from "@/lib/profile-store";

export const Route = createFileRoute("/materials/$chapterId")({
  loader: ({ params }) => {
    const found = findChapter(params.chapterId);
    if (!found) throw notFound();
    return found;
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.chapter.title} — Materials Hub` },
            {
              name: "description",
              content: `${loaderData.classLevel.name} ${loaderData.subject.name} — Telangana State Syllabus textbook with a checked SCERT link.`,
            },
            {
              property: "og:title",
              content: `${loaderData.chapter.title} — ${loaderData.subject.name}`,
            },
            {
              property: "og:description",
              content: `${loaderData.classLevel.name} Telangana State Syllabus — ${loaderData.subject.name}. Checked textbook link for the prescribed lessons.`,
            },
          ],
        }
      : {},
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h2 className="text-xl font-semibold">Textbook not found</h2>
      <Link to="/materials" className="mt-4 inline-block text-primary underline">
        Back to Materials
      </Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h2 className="text-xl font-semibold">Couldn't load textbook</h2>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="mt-4 text-primary underline">
        Try again
      </button>
    </div>
  ),
  component: ChapterView,
});

function ChapterView() {
  const { chapter, classLevel, subject, board } = Route.useLoaderData();

  useEffect(() => {
    logActivity("materials.open-chapter", {
      chapterId: chapter.id,
      title: chapter.title,
    });
  }, [chapter.id, chapter.title]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        to="/materials"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All textbooks
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs">
        <span className="text-muted-foreground">
          Want to focus on this chapter? Open the timer with this chapter
          pre-selected — you can still change it there.
        </span>
        <Link
          to="/management/timer"
          search={{
            class: classLevel.name.replace(/[^0-9]/g, "") || undefined,
            subject: subject.name,
            chapter: chapter.title,
          }}
          className="ml-auto font-semibold text-primary underline-offset-2 hover:underline"
        >
          Focus on this chapter →
        </Link>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex flex-wrap gap-1 text-xs">
          <Badge variant="outline">{classLevel.name}</Badge>
          <Badge variant="outline">{subject.name}</Badge>
          <Badge variant="outline">{board}</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{chapter.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is a <strong>Telangana State Syllabus</strong> book from the
          checked SCERT textbook sources.
        </p>
        {chapter.note ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{chapter.note}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Tag className="h-3 w-3" />
          <span className="mr-1">Tags:</span>
          {chapter.competitiveTags.map((t: string) => (
            <Badge key={t} variant="secondary" className="text-[10px]">
              {t}
            </Badge>
          ))}
        </div>
        <a
          href={chapter.pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Open textbook link ({chapter.sourceLabel})
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
        Preview is disabled — use the link above to open the textbook in a new tab.
      </div>
    </div>
  );
}
