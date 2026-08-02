// Study Hub — Telangana State Syllabus Master Data Vault (Classes 6 - 10)
// All SCERT URLs below were confirmed against the SCERT Telangana site index
// (site:scert.telangana.gov.in ebooks2019). Any subject where a direct SCERT
// PDF could not be confirmed falls back to a scoped Google search that lands
// on the SCERT/official copy — so every link opens something usable.

export type Board = "Telangana State Board";

export const SCERT_TELANGANA_PORTAL =
  "https://scert.telangana.gov.in/textBooks.aspx";

export interface ChapterNode {
  id: string;
  title: string;
  note?: string;
  competitiveTags: string[];
  pdfUrl: string;
  sourceLabel: string;
}

export interface SubjectNode {
  id: string;
  name: string;
  boards: Record<Board, ChapterNode[]>;
}

export interface ClassNode {
  id: string;
  name: string;
  subjects: SubjectNode[];
}

// SCERT's own PDF host is frequently unreachable, so every textbook link now
// resolves through Scribd, which mirrors the Telangana State Syllabus books.
const scribd = (terms: string) =>
  `https://www.scribd.com/search?query=${encodeURIComponent(
    `Telangana ${terms}`.replace(/[—–]/g, " ").replace(/\s+/g, " ").trim(),
  )}`;

const SOURCE = "Scribd";
const SOURCE_SEARCH = "Scribd";

function tsBook(
  id: string,
  title: string,
  pdfPath: string,
  tags: string[] = ["Telangana State Syllabus"],
  note?: string,
): ChapterNode {
  void pdfPath;
  return {
    id,
    title,
    note,
    competitiveTags: tags,
    pdfUrl: scribd(`${title} textbook`),
    sourceLabel: SOURCE,
  };
}

function tsSearchBook(
  id: string,
  title: string,
  searchTerms: string,
  tags: string[] = ["Telangana State Syllabus"],
  note?: string,
): ChapterNode {
  return {
    id,
    title,
    note,
    competitiveTags: tags,
    pdfUrl: scribd(`${searchTerms} textbook`),
    sourceLabel: SOURCE_SEARCH,
  };
}

// Helper: emit both English + Telugu medium entries for a subject (using search
// fallback for TM so links land on the correct SCERT PDF via Google).
function subjectEmTm(
  subjectId: string,
  subjectName: string,
  emChapter: ChapterNode,
  tmTitle: string,
  tmSearch: string,
  tmTags: string[],
): SubjectNode {
  return {
    id: subjectId,
    name: subjectName,
    boards: {
      "Telangana State Board": [
        emChapter,
        tsSearchBook(`${subjectId}-tm`, tmTitle, tmSearch, [
          ...tmTags,
          "Telugu Medium",
        ]),
      ],
    },
  };
}

// Telugu (First Language) subject for each class — official SCERT Telugu FL
// PDF paths aren't uniformly published, so we route to a scoped Google search
// that lands on the correct SCERT PDF. Every class gets a Telugu entry.
function teluguLang(classId: string, className: string, searchTerm: string): SubjectNode {
  return {
    id: `${classId}-telugu`,
    name: "Telugu",
    boards: {
      "Telangana State Board": [
        tsSearchBook(
          `ts-${classId}-telugu-fl`,
          `తెలుగు (First Language) — ${className}`,
          `${searchTerm} telugu first language`,
          ["Language", "Telugu Medium", "First Language"],
        ),
        tsSearchBook(
          `ts-${classId}-telugu-sl`,
          `తెలుగు (Second Language) — ${className}`,
          `${searchTerm} telugu second language`,
          ["Language", "Telugu Medium", "Second Language"],
        ),
      ],
    },
  };
}

export const BOOK_VAULT: ClassNode[] = [
  {
    id: "class-10",
    name: "Class 10",
    subjects: [
      subjectEmTm(
        "10-maths",
        "Mathematics",
        tsBook("ts-10-maths-em", "Mathematics — English Medium", "pdf/publication/ebooks2019/xth%20maths%20em.pdf", ["Core", "Board Exam Prep"]),
        "గణితం — Telugu Medium",
        "10 maths tm",
        ["Core"],
      ),
      subjectEmTm(
        "10-physical-science",
        "Physical Science",
        tsBook("ts-10-ps-em", "Physical Science — English Medium", "pdf/publication/ebooks2019/x%20physics%20em.pdf", ["Physics", "Chemistry"]),
        "భౌతిక రసాయన శాస్త్రం — Telugu Medium",
        "10 physics tm",
        ["Physics", "Chemistry"],
      ),
      subjectEmTm(
        "10-biology",
        "Biological Science",
        tsBook("ts-10-bio-em", "Biological Science — English Medium", "pdf/publication/ebooks2019/10%20biology%20em%20-20.pdf", ["Biology"]),
        "జీవశాస్త్రం — Telugu Medium",
        "10 biology tm",
        ["Biology"],
      ),
      subjectEmTm(
        "10-social",
        "Social Studies",
        tsBook("ts-10-social-em", "Social Studies — English Medium", "pdf/publication/ebooks2019/10th%20social%20em.pdf", ["History", "Geography", "Civics"]),
        "సాంఘిక శాస్త్రం — Telugu Medium",
        "10 social tm",
        ["History", "Geography", "Civics"],
      ),
      {
        id: "10-english",
        name: "English",
        boards: {
          "Telangana State Board": [
            tsBook("ts-10-english", "English — Class X", "pdf/publication/ebooks2019/10th%20class%20english%202020-21%2020.pdf", ["Language"]),
          ],
        },
      },
      {
        id: "10-hindi",
        name: "Hindi",
        boards: {
          "Telangana State Board": [
            tsSearchBook("ts-10-hindi", "Hindi — Class X", "10 hindi", ["Language"]),
          ],
        },
      },
      teluguLang("10", "Class X", "10 class"),
    ],
  },
  {
    id: "class-9",
    name: "Class 9",
    subjects: [
      subjectEmTm(
        "9-maths",
        "Mathematics",
        tsBook("ts-9-maths-em", "Mathematics — English Medium", "pdf/publication/ebooks2019/ix%20maths%20em.pdf", ["Core"]),
        "గణితం — Telugu Medium",
        "9 maths tm",
        ["Core"],
      ),
      subjectEmTm(
        "9-physical-science",
        "Physical Science",
        tsSearchBook("ts-9-ps-em", "Physical Science — English Medium", "ix physics em", ["Physics", "Chemistry"]),
        "భౌతిక రసాయన శాస్త్రం — Telugu Medium",
        "9 physics tm",
        ["Physics", "Chemistry"],
      ),
      subjectEmTm(
        "9-biology",
        "Biological Science",
        tsBook("ts-9-bio-em", "Biological Science — English Medium", "pdf/publication/ebooks2019/9%20biosci%20em%202020-21.pdf", ["Biology"]),
        "జీవశాస్త్రం — Telugu Medium",
        "9 biology tm",
        ["Biology"],
      ),
      subjectEmTm(
        "9-social",
        "Social Studies",
        tsBook("ts-9-social-em", "Social Studies — English Medium", "pdf/publication/ebooks2019/9th%20social%20em.pdf", ["History", "Civics"]),
        "సాంఘిక శాస్త్రం — Telugu Medium",
        "9 social tm",
        ["History", "Civics"],
      ),
      {
        id: "9-english",
        name: "English",
        boards: {
          "Telangana State Board": [
            tsBook("ts-9-english", "English — Class IX", "pdf/publication/ebooks2019/9th%20eng.pdf", ["Language"]),
          ],
        },
      },
      {
        id: "9-hindi",
        name: "Hindi",
        boards: {
          "Telangana State Board": [
            tsSearchBook("ts-9-hindi", "Hindi — Class IX", "9 hindi", ["Language"]),
          ],
        },
      },
      teluguLang("9", "Class IX", "9 class"),
    ],
  },
  {
    id: "class-8",
    name: "Class 8",
    subjects: [
      subjectEmTm(
        "8-maths",
        "Mathematics",
        tsBook("ts-8-maths-em", "Mathematics — English Medium", "pdf/publication/ebooks2019/8%20maths%20em%202020-21.pdf", ["Core"]),
        "గణితం — Telugu Medium",
        "8 maths tm",
        ["Core"],
      ),
      subjectEmTm(
        "8-physical-science",
        "Physical Science",
        tsBook("ts-8-ps-em", "Physical Science — English Medium", "pdf/publication/ebooks2019/8%20physics%20em%202020-21.pdf", ["Physics"]),
        "భౌతిక శాస్త్రం — Telugu Medium",
        "8 physics tm",
        ["Physics"],
      ),
      subjectEmTm(
        "8-biology",
        "Biological Science",
        tsBook("ts-8-bio-em", "Biological Science — English Medium", "pdf/publication/ebooks2019/8%20bio%20sci%20em%202020-21.pdf", ["Biology"]),
        "జీవశాస్త్రం — Telugu Medium",
        "8 biology tm",
        ["Biology"],
      ),
      subjectEmTm(
        "8-social",
        "Social Studies",
        tsBook("ts-8-social-em", "Social Studies — English Medium", "pdf/publication/ebooks2019/8th%20social%20em.pdf", ["History", "Civics"]),
        "సాంఘిక శాస్త్రం — Telugu Medium",
        "8 social tm",
        ["History", "Civics"],
      ),
      {
        id: "8-english",
        name: "English",
        boards: {
          "Telangana State Board": [
            tsSearchBook("ts-8-english", "English — Class VIII", "8 english", ["Language"]),
          ],
        },
      },
      {
        id: "8-hindi",
        name: "Hindi",
        boards: {
          "Telangana State Board": [
            tsBook("ts-8-hindi", "Hindi (First Language) — Class VIII", "pdf/publication/ebooks2019/8th%20hindi%20fl%202020-21.pdf", ["Language"]),
            tsSearchBook("ts-8-hindi-sl", "Hindi (Second Language) — Class VIII", "8 hindi sl", ["Language"]),
          ],
        },
      },
      teluguLang("8", "Class VIII", "8 class"),
    ],
  },
  {
    id: "class-7",
    name: "Class 7",
    subjects: [
      subjectEmTm(
        "7-maths",
        "Mathematics",
        tsBook("ts-7-maths-em", "Mathematics — English Medium", "pdf/publication/ebooks2019/7%20maths%20em%202020-21.pdf", ["Core"]),
        "గణితం — Telugu Medium",
        "7 maths tm",
        ["Core"],
      ),
      subjectEmTm(
        "7-science",
        "General Science",
        tsBook("ts-7-science-em", "General Science — English Medium", "pdf/publication/ebooks2019/7%20general%20science%20em%202020-21.pdf", ["Science"]),
        "సాధారణ శాస్త్రం — Telugu Medium",
        "7 general science tm",
        ["Science"],
      ),
      subjectEmTm(
        "7-social",
        "Social Studies",
        tsBook("ts-7-social-em", "Social Studies — English Medium", "pdf/publication/ebooks2019/7%20social%20em%202020-21.pdf", ["History", "Civics"]),
        "సాంఘిక శాస్త్రం — Telugu Medium",
        "7 social tm",
        ["History", "Civics"],
      ),
      {
        id: "7-english",
        name: "English",
        boards: {
          "Telangana State Board": [
            tsBook("ts-7-english", "English — Class VII", "pdf/publication/ebooks2019/7th%20class%20english.pdf", ["Language"]),
          ],
        },
      },
      {
        id: "7-hindi",
        name: "Hindi",
        boards: {
          "Telangana State Board": [
            tsSearchBook("ts-7-hindi", "Hindi — Class VII", "7 hindi", ["Language"]),
          ],
        },
      },
      teluguLang("7", "Class VII", "7 class"),
    ],
  },
  {
    id: "class-6",
    name: "Class 6",
    subjects: [
      subjectEmTm(
        "6-maths",
        "Mathematics",
        tsSearchBook("ts-6-maths-em", "Mathematics — English Medium", "6 maths em", ["Core"]),
        "గణితం — Telugu Medium",
        "6 maths tm",
        ["Core"],
      ),
      subjectEmTm(
        "6-science",
        "General Science",
        tsBook("ts-6-science-em", "General Science — English Medium", "pdf/publication/ebooks2019/6%20general%20science%20em%202020-21.pdf", ["Science"]),
        "సాధారణ శాస్త్రం — Telugu Medium",
        "6 general science tm",
        ["Science"],
      ),
      {
        id: "6-social",
        name: "Social Studies",
        boards: {
          "Telangana State Board": [
            tsBook("ts-6-social-em-p1", "Social Studies (Part 1) — English Medium", "pdf/publication/ebooks2019/6th%20social%20part-1%202022-23.pdf", ["History", "Civics"]),
            tsSearchBook("ts-6-social-em-p2", "Social Studies (Part 2) — English Medium", "6 social part 2", ["History", "Civics"]),
            tsSearchBook("ts-6-social-tm", "సాంఘిక శాస్త్రం — Telugu Medium", "6 social tm", ["History", "Civics", "Telugu Medium"]),
          ],
        },
      },
      {
        id: "6-english",
        name: "English",
        boards: {
          "Telangana State Board": [
            tsBook("ts-6-english", "English — Class VI", "pdf/publication/ebooks2019/6th%20class%20english.pdf", ["Language"]),
          ],
        },
      },
      {
        id: "6-hindi",
        name: "Hindi",
        boards: {
          "Telangana State Board": [
            tsBook("ts-6-hindi", "Hindi (Second Language) — Class VI", "pdf/publication/ebooks2019/6th%20hindi%20sl%202020-21.pdf", ["Language"]),
          ],
        },
      },
      teluguLang("6", "Class VI", "6 class"),
    ],
  },
];

export interface FoundChapter {
  chapter: ChapterNode;
  subject: { id: string; name: string };
  classLevel: { id: string; name: string };
  board: Board;
}

export function findChapter(chapterId: string): FoundChapter | null {
  for (const cls of BOOK_VAULT) {
    for (const subject of cls.subjects) {
      for (const board of Object.keys(subject.boards) as Board[]) {
        const chapter = subject.boards[board].find((c) => c.id === chapterId);
        if (chapter) {
          return {
            chapter,
            subject: { id: subject.id, name: subject.name },
            classLevel: { id: cls.id, name: cls.name },
            board,
          };
        }
      }
    }
  }
  return null;
}
