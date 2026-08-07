import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, PlayCircle, Timer, Youtube } from "lucide-react";
import {
  VIDEO_CHANNELS,
  VIDEO_CLASSES,
  channelPlaylistsUrl,
  videoSearchUrl,
  type VideoChannel,
} from "@/lib/video-data";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Video Lessons — Vedantu & Physics Wallah, Class 6 to 9" },
      {
        name: "description",
        content:
          "Class 6 to 9 video lessons from Vedantu and Physics Wallah, sorted by subject — open a lecture and start a focus session on the same chapter.",
      },
      {
        property: "og:title",
        content: "Video Lessons — Vedantu & Physics Wallah, Class 6 to 9",
      },
      {
        property: "og:description",
        content:
          "Subject-wise Class 6–9 lectures from Vedantu and Physics Wallah, wired into the Stutora focus timer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VideosPage,
});

const CHANNELS: VideoChannel[] = [
  VIDEO_CHANNELS.vedantu,
  VIDEO_CHANNELS["physics-wallah"],
];

function VideosPage() {
  const [classId, setClassId] = useState(VIDEO_CLASSES[0].id);
  const cls = VIDEO_CLASSES.find((c) => c.id === classId) ?? VIDEO_CLASSES[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-primary">
          <Youtube className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Video lessons
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Watch a lesson, then actually study it
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Class 6 to 9 lectures from two teaching channels students already
          trust — <strong>Vedantu</strong> and <strong>Physics Wallah</strong>.
          Pick a subject, watch, then start a timed session on the same chapter.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {CHANNELS.map((ch) => (
          <a
            key={ch.id}
            href={channelPlaylistsUrl(ch)}
            target="_blank"
            rel="noreferrer"
            className="card-lift flex items-start gap-3 rounded-xl border bg-card p-4 transition hover:border-primary/40"
          >
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <PlayCircle className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-sm font-semibold">{ch.name}</h2>
                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{ch.blurb}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {VIDEO_CLASSES.map((c) => (
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
        {cls.subjects.map((subject) => (
          <section key={subject}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {subject}
              </h2>
              <Link
                to="/management/timer"
                search={{ class: cls.syllabusKey, subject, chapter: undefined }}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Timer className="h-3 w-3" /> Study this with a timer
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {CHANNELS.map((ch) => (
                <a
                  key={ch.id}
                  href={videoSearchUrl(ch, cls.name, subject)}
                  target="_blank"
                  rel="noreferrer"
                  className="card-lift group flex items-start gap-3 rounded-xl border bg-card p-4 transition hover:border-primary/40"
                >
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Youtube className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">
                        {ch.name} · {subject}
                      </h3>
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        {cls.name}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        Full chapter lectures
                      </Badge>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Videos open on YouTube in a new tab. Stutora doesn't host or track them.
      </p>
    </div>
  );
}
