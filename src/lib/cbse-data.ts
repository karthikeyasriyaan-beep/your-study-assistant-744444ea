// CBSE / NCERT textbook vault — links resolve to the official NCERT site
// (ncert.nic.in), which hosts free chapter-wise PDFs for every book.

export const NCERT_PORTAL = "https://ncert.nic.in/textbook.php";

export interface CbseBook {
  id: string;
  title: string;
  /** NCERT book code, e.g. "jesc1" for Class 10 Science */
  code: string;
  /** number of chapters (used for the NCERT range param) */
  chapters: number;
  medium?: "English" | "Hindi";
}

export interface CbseSubject {
  id: string;
  name: string;
  books: CbseBook[];
}

export interface CbseClass {
  id: string;
  name: string;
  subjects: CbseSubject[];
}

export function ncertUrl(book: CbseBook) {
  return `${NCERT_PORTAL}?${book.code}=0-${book.chapters}`;
}

const b = (
  id: string,
  title: string,
  code: string,
  chapters: number,
): CbseBook => ({ id, title, code, chapters });

export const CBSE_VAULT: CbseClass[] = [
  {
    id: "cbse-6",
    name: "Class 6",
    subjects: [
      {
        id: "maths",
        name: "Mathematics",
        books: [b("c6-math", "Ganita Prakash (Maths)", "fegp1", 10)],
      },
      {
        id: "science",
        name: "Science",
        books: [b("c6-sci", "Curiosity (Science)", "fecu1", 12)],
      },
      {
        id: "english",
        name: "English",
        books: [b("c6-eng", "Poorvi (English)", "fepr1", 5)],
      },
      {
        id: "sst",
        name: "Social Science",
        books: [b("c6-sst", "Exploring Society: India and Beyond", "fees1", 14)],
      },
    ],
  },
  {
    id: "cbse-7",
    name: "Class 7",
    subjects: [
      {
        id: "maths",
        name: "Mathematics",
        books: [b("c7-math", "Ganita Prakash Part I (Maths)", "gegp1", 8)],
      },
      {
        id: "science",
        name: "Science",
        books: [b("c7-sci", "Curiosity (Science)", "gecu1", 12)],
      },
      {
        id: "english",
        name: "English",
        books: [b("c7-eng", "Poorvi (English)", "gepr1", 5)],
      },
      {
        id: "sst",
        name: "Social Science",
        books: [b("c7-sst", "Exploring Society: India and Beyond Part I", "gees1", 12)],
      },
    ],
  },
  {
    id: "cbse-8",
    name: "Class 8",
    subjects: [
      {
        id: "maths",
        name: "Mathematics",
        books: [b("c8-math", "Mathematics", "hemh1", 13)],
      },
      {
        id: "science",
        name: "Science",
        books: [b("c8-sci", "Science", "hesc1", 13)],
      },
      {
        id: "english",
        name: "English",
        books: [b("c8-eng", "Honeydew (English)", "hehd1", 8)],
      },
      {
        id: "sst",
        name: "Social Science",
        books: [
          b("c8-hist", "Our Pasts III (History)", "hess2", 8),
          b("c8-geo", "Resources and Development (Geography)", "hess4", 5),
          b("c8-civ", "Social and Political Life III", "hess3", 8),
        ],
      },
    ],
  },
  {
    id: "cbse-9",
    name: "Class 9",
    subjects: [
      {
        id: "maths",
        name: "Mathematics",
        books: [b("c9-math", "Mathematics", "iemh1", 8)],
      },
      {
        id: "science",
        name: "Science",
        books: [b("c9-sci", "Science", "iesc1", 13)],
      },
      {
        id: "english",
        name: "English",
        books: [
          b("c9-beehive", "Beehive (English)", "iebe1", 8),
          b("c9-moments", "Moments (Supplementary)", "iemo1", 9),
        ],
      },
      {
        id: "sst",
        name: "Social Science",
        books: [
          b("c9-hist", "India and the Contemporary World I", "iess3", 6),
          b("c9-geo", "Contemporary India I (Geography)", "iess1", 4),
          b("c9-eco", "Economics", "iess2", 5),
        ],
      },
    ],
  },
  {
    id: "cbse-10",
    name: "Class 10",
    subjects: [
      {
        id: "maths",
        name: "Mathematics",
        books: [b("c10-math", "Mathematics", "jemh1", 14)],
      },
      {
        id: "science",
        name: "Science",
        books: [b("c10-sci", "Science", "jesc1", 13)],
      },
      {
        id: "english",
        name: "English",
        books: [
          b("c10-first", "First Flight (English)", "jeff1", 9),
          b("c10-foot", "Footprints Without Feet", "jefp1", 9),
        ],
      },
      {
        id: "sst",
        name: "Social Science",
        books: [
          b("c10-hist", "India and the Contemporary World II", "jess3", 5),
          b("c10-geo", "Contemporary India II (Geography)", "jess1", 7),
          b("c10-pol", "Democratic Politics II", "jess4", 5),
          b("c10-eco", "Understanding Economic Development", "jess2", 5),
        ],
      },
    ],
  },
  {
    id: "cbse-11",
    name: "Class 11",
    subjects: [
      {
        id: "maths",
        name: "Mathematics",
        books: [b("c11-math", "Mathematics", "kemh1", 14)],
      },
      {
        id: "physics",
        name: "Physics",
        books: [
          b("c11-phy1", "Physics Part I", "keph1", 7),
          b("c11-phy2", "Physics Part II", "keph2", 7),
        ],
      },
      {
        id: "chemistry",
        name: "Chemistry",
        books: [
          b("c11-chem1", "Chemistry Part I", "kech1", 6),
          b("c11-chem2", "Chemistry Part II", "kech2", 3),
        ],
      },
      {
        id: "biology",
        name: "Biology",
        books: [b("c11-bio", "Biology", "kebo1", 19)],
      },
    ],
  },
  {
    id: "cbse-12",
    name: "Class 12",
    subjects: [
      {
        id: "maths",
        name: "Mathematics",
        books: [
          b("c12-math1", "Mathematics Part I", "lemh1", 6),
          b("c12-math2", "Mathematics Part II", "lemh2", 7),
        ],
      },
      {
        id: "physics",
        name: "Physics",
        books: [
          b("c12-phy1", "Physics Part I", "leph1", 8),
          b("c12-phy2", "Physics Part II", "leph2", 6),
        ],
      },
      {
        id: "chemistry",
        name: "Chemistry",
        books: [
          b("c12-chem1", "Chemistry Part I", "lech1", 5),
          b("c12-chem2", "Chemistry Part II", "lech2", 5),
        ],
      },
      {
        id: "biology",
        name: "Biology",
        books: [b("c12-bio", "Biology", "lebo1", 13)],
      },
    ],
  },
];