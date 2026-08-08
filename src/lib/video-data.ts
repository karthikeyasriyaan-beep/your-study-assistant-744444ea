// Curated YouTube lecture library — Classes 6 to 9.
// Only two trusted teaching channels are used: Vedantu and Physics Wallah.
// Cards open the channel's own page (youtube.com/@handle/search?query=...),
// so every link lands directly on that channel's videos instead of a
// generic site-wide search.

export interface VideoChannel {
  id: "vedantu" | "physics-wallah";
  name: string;
  blurb: string;
  /** channel home page */
  channelUrl: string;
  /** channel handle, e.g. @VedantuClass910 */
  handle: string;
}

export interface VideoSubject {
  /** shown on the card + used in the YouTube query */
  label: string;
  /** matching subject key in the Focus Timer syllabus map */
  syllabusSubject: string;
}

export interface VideoClass {
  id: string;
  /** key used by the Focus Timer syllabus map */
  syllabusKey: string;
  name: string;
  subjects: VideoSubject[];
}

export const VIDEO_CHANNELS: Record<VideoChannel["id"], VideoChannel> = {
  vedantu: {
    id: "vedantu",
    name: "Vedantu",
    blurb: "Concept-first lessons with worked board-style examples.",
    channelUrl: "https://www.youtube.com/@VedantuClass910",
    handle: "@VedantuClass910",
  },
  "physics-wallah": {
    id: "physics-wallah",
    name: "Physics Wallah",
    blurb: "Full chapter lectures from the PW Foundation batches.",
    channelUrl: "https://www.youtube.com/@PhysicsWallahFoundation",
    handle: "@PhysicsWallahFoundation",
  },
};

const SUBJECTS: VideoSubject[] = [
  { label: "Mathematics", syllabusSubject: "Mathematics" },
  { label: "Physics & Chemistry", syllabusSubject: "Physical Science" },
  { label: "Biology", syllabusSubject: "Biological Science" },
  { label: "Social Studies", syllabusSubject: "Social Studies" },
  { label: "English", syllabusSubject: "English" },
];

export const VIDEO_CLASSES: VideoClass[] = [
  { id: "class-9", syllabusKey: "9", name: "Class 9", subjects: SUBJECTS },
  { id: "class-8", syllabusKey: "8", name: "Class 8", subjects: SUBJECTS },
  { id: "class-7", syllabusKey: "7", name: "Class 7", subjects: SUBJECTS },
  { id: "class-6", syllabusKey: "6", name: "Class 6", subjects: SUBJECTS },
];

export function videoSearchUrl(
  channel: VideoChannel,
  className: string,
  subject: string,
) {
  const q = `${className} ${subject}`;
  // channel-scoped search: stays inside the channel's own page
  return `${channel.channelUrl}/search?query=${encodeURIComponent(q)}`;
}

export function channelPlaylistsUrl(channel: VideoChannel) {
  return `${channel.channelUrl}/playlists`;
}

export function channelVideosUrl(channel: VideoChannel) {
  return `${channel.channelUrl}/videos`;
}

export function totalVideoTracks() {
  return VIDEO_CLASSES.reduce((n, c) => n + c.subjects.length * 2, 0);
}
