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
  const q = `${channel.scope} ${className} ${subject} full chapter`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

export function channelPlaylistsUrl(channel: VideoChannel) {
  return `${channel.channelUrl}/playlists`;
}

export function totalVideoTracks() {
  return VIDEO_CLASSES.reduce((n, c) => n + c.subjects.length * 2, 0);
}
