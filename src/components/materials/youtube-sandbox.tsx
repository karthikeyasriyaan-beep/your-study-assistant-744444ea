import { Shield } from "lucide-react";

/**
 * Anti-Distraction Sandbox Wrapper for YouTube.
 *
 * Renders ONLY the player iframe with parameters that suppress related
 * videos (rel=0), branding (modestbranding=1), annotations (iv_load_policy=3),
 * fullscreen distraction (fs=0), keyboard shortcuts (disablekb=1) and
 * end-screen recommendations (endscreen overlays are gone in playlist mode).
 *
 * No comments, no creator sidebar, no recommendations, no shorts overlay —
 * just the video player container.
 */
export function YouTubeSandbox({
  playlistId,
  videoId,
}: {
  playlistId?: string;
  videoId?: string;
}) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    fs: "0",
    disablekb: "1",
    playsinline: "1",
    color: "white",
  });
  if (playlistId) {
    params.set("listType", "playlist");
    params.set("list", playlistId);
  }
  const base = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : `https://www.youtube-nocookie.com/embed/videoseries`;
  const src = `${base}?${params.toString()}`;

  if (!playlistId && !videoId) {
    return (
      <div className="rounded-xl border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        No curated playlist mapped to this chapter yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5 text-primary" />
        <span>
          Distraction-free mode: recommendations, comments, sidebars and Shorts
          are blocked.
        </span>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-xl border bg-black">
        <iframe
          title="Lesson player"
          src={src}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; encrypted-media; picture-in-picture"
          allowFullScreen={false}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
