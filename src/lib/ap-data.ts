// Andhra Pradesh State Syllabus (SCERT AP) textbook vault — Classes 6 to 10.
// AP SCERT's own PDF host is frequently unreachable, so — exactly like the
// Telangana vault — every book resolves through Scribd, which mirrors the
// AP State Syllabus textbooks in both English and Telugu medium.

export const SCERT_AP_PORTAL = "https://scert.ap.gov.in/#/textbooks";

export interface ApBook {
  id: string;
  title: string;
  medium: "English Medium" | "Telugu Medium" | "Bilingual";
  tags: string[];
  url: string;
}

export interface ApSubject {
  id: string;
  name: string;
  books: ApBook[];
}

export interface ApClass {
  id: string;
  /** key used by the Focus Timer syllabus map */
  syllabusKey: string;
  name: string;
  subjects: ApSubject[];
}

const scribd = (terms: string) =>
  `https://www.scribd.com/search?query=${encodeURIComponent(
    `Andhra Pradesh SCERT ${terms}`.replace(/\s+/g, " ").trim(),
  )}`;

const book = (
  id: string,
  title: string,
  medium: ApBook["medium"],
  search: string,
  tags: string[],
): ApBook => ({ id, title, medium, tags, url: scribd(`${search} textbook`), });

function emTm(
  id: string,
  name: string,
  englishTitle: string,
  teluguTitle: string,
  search: string,
  tags: string[],
): ApSubject {
  return {
    id,
    name,
    books: [
      book(`${id}-em`, englishTitle, "English Medium", `${search} english medium`, tags),
      book(`${id}-tm`, teluguTitle, "Telugu Medium", `${search} telugu medium`, [
        ...tags,
        "Telugu Medium",
      ]),
    ],
  };
}

function languages(classNo: string, roman: string): ApSubject[] {
  return [
    {
      id: `ap-${classNo}-english`,
      name: "English",
      books: [
        book(
          `ap-${classNo}-english-b`,
          `English Reader — Class ${roman}`,
          "English Medium",
          `class ${classNo} english reader`,
          ["Language"],
        ),
      ],
    },
    {
      id: `ap-${classNo}-hindi`,
      name: "Hindi",
      books: [
        book(
          `ap-${classNo}-hindi-b`,
          `Hindi — Class ${roman}`,
          "Bilingual",
          `class ${classNo} hindi`,
          ["Language", "Second Language"],
        ),
      ],
    },
    {
      id: `ap-${classNo}-telugu`,
      name: "Telugu",
      books: [
        book(
          `ap-${classNo}-telugu-fl`,
          `తెలుగు (First Language) — Class ${roman}`,
          "Telugu Medium",
          `class ${classNo} telugu first language`,
          ["Language", "First Language"],
        ),
        book(
          `ap-${classNo}-telugu-sl`,
          `తెలుగు (Second Language) — Class ${roman}`,
          "Telugu Medium",
          `class ${classNo} telugu second language`,
          ["Language", "Second Language"],
        ),
      ],
    },
  ];
}

function seniorClass(no: string, roman: string, tags: string[] = []): ApClass {
  return {
    id: `ap-class-${no}`,
    syllabusKey: `AP Class ${no}`,
    name: `Class ${no}`,
    subjects: [
      emTm(
        `ap-${no}-maths`,
        "Mathematics",
        `Mathematics — Class ${roman}`,
        `గణితం — ${roman} తరగతి`,
        `class ${no} mathematics`,
        ["Core", ...tags],
      ),
      emTm(
        `ap-${no}-ps`,
        "Physical Science",
        `Physical Science — Class ${roman}`,
        `భౌతిక రసాయన శాస్త్రం — ${roman} తరగతి`,
        `class ${no} physical science`,
        ["Physics", "Chemistry", ...tags],
      ),
      emTm(
        `ap-${no}-bio`,
        "Biological Science",
        `Biological Science — Class ${roman}`,
        `జీవశాస్త్రం — ${roman} తరగతి`,
        `class ${no} biological science`,
        ["Biology", ...tags],
      ),
      emTm(
        `ap-${no}-social`,
        "Social Studies",
        `Social Studies — Class ${roman}`,
        `సాంఘిక శాస్త్రం — ${roman} తరగతి`,
        `class ${no} social studies`,
        ["History", "Geography", "Civics", ...tags],
      ),
      ...languages(no, roman),
    ],
  };
}

function juniorClass(no: string, roman: string): ApClass {
  return {
    id: `ap-class-${no}`,
    syllabusKey: `AP Class ${no}`,
    name: `Class ${no}`,
    subjects: [
      emTm(
        `ap-${no}-maths`,
        "Mathematics",
        `Mathematics — Class ${roman}`,
        `గణితం — ${roman} తరగతి`,
        `class ${no} mathematics`,
        ["Core"],
      ),
      emTm(
        `ap-${no}-science`,
        "General Science",
        `General Science — Class ${roman}`,
        `సాధారణ శాస్త్రం — ${roman} తరగతి`,
        `class ${no} general science`,
        ["Science"],
      ),
      emTm(
        `ap-${no}-social`,
        "Social Studies",
        `Social Studies — Class ${roman}`,
        `సాంఘిక శాస్త్రం — ${roman} తరగతి`,
        `class ${no} social studies`,
        ["History", "Geography", "Civics"],
      ),
      ...languages(no, roman),
    ],
  };
}

export const AP_BOOK_VAULT: ApClass[] = [
  seniorClass("10", "X", ["Board Exam Prep"]),
  seniorClass("9", "IX"),
  seniorClass("8", "VIII"),
  juniorClass("7", "VII"),
  juniorClass("6", "VI"),
];
