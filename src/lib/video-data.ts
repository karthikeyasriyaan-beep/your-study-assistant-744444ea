// Curated YouTube lecture library — Classes 6 to 9.
// Only two trusted teaching channels are used: Vedantu and Physics Wallah.
// Every card opens a channel-scoped YouTube search for that exact class +
// subject, so the links keep working even when a channel re-uploads or
// renames a playlist (hard-coded playlist IDs rot; searches don't).

export interface VideoChannel {
  id: "vedantu" | "physics-wallah";
  name: string;
  blurb: string;
  /** channel home page */
  channelUrl: string;
  /** words added to every search so results stay on this channel */
  scope: string;
}

export interface VideoClass {
  id: string;
  /** key used by the Focus Timer syllabus map */
  syllabusKey: string;
  name: string;
  subjects: string[];
}

export const VIDEO_CHANNELS: Record<VideoChannel["id"], VideoChannel> = {
  vedantu: {
    id: "vedantu",
    name: "Vedantu",
    blurb: "Concept-first lessons with worked board-style examples.",
    channelUrl: "https://www.youtube.com/@VedantuClass910",
    scope: "Vedantu",
  },
  "physics-wallah": {
    id: "physics-wallah",
    name: "Physics Wallah",
    blurb: "Full chapter lectures from the PW Foundation batches.",
    channelUrl: "https://www.youtube.com/@PhysicsWallahFoundation",
    scope: "Physics Wallah Foundation",
  },
};

export const VIDEO_CLASSES: VideoClass[] = [
  {
    id: "class-9",
    syllabusKey: "9",
    name: "Class 9",
    subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "Social Science", "English"],
  },
  {
    id: "class-8",
    syllabusKey: "8",
    name: "Class 8",
    subjects: ["Mathematics", "Science", "Social Science", "English"],
  },
  {
    id: "class-7",
    syllabusKey: "7",
    name: "Class 7",
    subjects: ["Mathematics", "Science", "Social Science", "English"],
  },
  {
    id: "class-6",
    syllabusKey: "6",
    name: "Class 6",
    subjects: ["Mathematics", "Science", "Social Science", "English"],
  },
];

export function videoSearchUrl(
  channel: VideoChannel,
  className: string,
  subject: string,
) {
  const q = `${channel.scope} ${className} ${subject} full chapter`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

export function channelPlaylistsUrl(channel: VideoChannel) {
  return `${channel.channelUrl}/playlists`;
}

export function totalVideoTracks() {
  return VIDEO_CLASSES.reduce((n, c) => n + c.subjects.length * 2, 0);
}
