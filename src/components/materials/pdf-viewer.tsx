export function PdfViewer({ url, title }: { url: string; title: string }) {
  // Use Google Docs Viewer as a robust cross-browser fallback for PDF rendering.
  const viewer = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground">
        <span className="truncate">{title}</span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary hover:underline"
        >
          Open PDF ↗
        </a>
      </div>
      <iframe
        src={viewer}
        title={title}
        className="h-[70vh] w-full"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
