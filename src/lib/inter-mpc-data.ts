// Intermediate MPC (Telangana State Board) — Textbook Data Vault
// Junior Inter (1st Year) & Senior Inter (2nd Year)

export type InterYear = "1st Year" | "2nd Year";
export type MPCSubject =
  | "Mathematics A"
  | "Mathematics B"
  | "Physics"
  | "Chemistry";
export type ResourceMedium = "English" | "Telugu";

export interface MPCChapter {
  number: number;
  title: string;
  pdfUrl: string;
}

export interface MPCBookNode {
  id: string;
  title: string;
  year: InterYear;
  subject: MPCSubject;
  medium: ResourceMedium;
  cdnUrl: string;
  officialUrl: string;
  chapters: MPCChapter[];
}

export const MPC_SUBJECTS: MPCSubject[] = [
  "Mathematics A",
  "Mathematics B",
  "Physics",
  "Chemistry",
];

export const MPC_MEDIUMS: ResourceMedium[] = ["English", "Telugu"];
export const MPC_YEARS: InterYear[] = ["1st Year", "2nd Year"];

const TSBIE = "https://tsbie.cgg.gov.in";
const TELUGU_ACADEMY = "https://telugu-academy.blogspot.com";

// Real book hubs (careers360 hosts free downloadable TSBIE inter textbooks).
const CAREERS360_1ST =
  "https://school.careers360.com/boards/tsbie/telangana-board-intermediate-1st-year-books-bsar";
const CAREERS360_2ND =
  "https://school.careers360.com/boards/tsbie/telangana-board-intermediate-2nd-year-books-bsar";

function slugFor(year: InterYear, subject: MPCSubject): string {
  const y = year === "1st Year" ? "1st" : "2nd";
  const sMap: Record<MPCSubject, string> = {
    "Mathematics A": year === "1st Year" ? "maths_1a" : "maths_2a",
    "Mathematics B": year === "1st Year" ? "maths_1b" : "maths_2b",
    Physics: "physics",
    Chemistry: "chem",
  };
  return `inter_${y}_${sMap[subject]}`;
}

function scribdSearch(...terms: string[]): string {
  const q = encodeURIComponent(
    `Telangana Intermediate ${terms.join(" ")} textbook`
      .replace(/[—–]/g, " ")
      .replace(/ +/g, " ")
      .trim(),
  );
  return `https://www.scribd.com/search?query=${q}`;
}

function buildBook(
  year: InterYear,
  subject: MPCSubject,
  medium: ResourceMedium,
  titles: string[],
  officialUrl: string,
): MPCBookNode {
  const slug = slugFor(year, subject);
  const med = medium === "English" ? "em" : "tm";
  const id = `${slug}_${med}`;
  const bookHub = year === "1st Year" ? CAREERS360_1ST : CAREERS360_2ND;
  return {
    id,
    title: `${subject} — ${year} (${medium})`,
    year,
    subject,
    medium,
    cdnUrl: bookHub,
    officialUrl,
    chapters: titles.map((t, i) => ({
      number: i + 1,
      title: t,
      pdfUrl: scribdSearch(year, subject, medium, t),
    })),
  };
}


// ---- Chapter title lists (Telangana State Board syllabus) ----
const MATHS_1A = [
  "Functions",
  "Mathematical Induction",
  "Matrices",
  "Addition of Vectors",
  "Product of Vectors",
  "Trigonometric Ratios up to Transformations",
  "Trigonometric Equations",
  "Inverse Trigonometric Functions",
  "Hyperbolic Functions",
  "Properties of Triangles",
];

const MATHS_1B = [
  "Locus",
  "Transformation of Axes",
  "Straight Lines",
  "Pair of Straight Lines",
  "Three Dimensional Coordinates",
  "Direction Cosines and Direction Ratios",
  "The Plane",
  "Limits and Continuity",
  "Differentiation",
  "Applications of Derivatives",
];

const PHYSICS_1 = [
  "Physical World",
  "Units and Measurements",
  "Motion in a Straight Line",
  "Motion in a Plane",
  "Laws of Motion",
  "Work, Energy and Power",
  "Systems of Particles and Rotational Motion",
  "Oscillations",
  "Gravitation",
  "Mechanical Properties of Solids",
  "Mechanical Properties of Fluids",
  "Thermal Properties of Matter",
  "Thermodynamics",
  "Kinetic Theory",
];

const CHEM_1 = [
  "Atomic Structure",
  "Classification of Elements & Periodicity",
  "Chemical Bonding and Molecular Structure",
  "States of Matter: Gases and Liquids",
  "Stoichiometry",
  "Thermodynamics",
  "Chemical Equilibrium and Acids-Bases",
  "Hydrogen and its Compounds",
  "s-Block Elements",
  "p-Block Elements (Group 13 & 14)",
  "Environmental Chemistry",
  "Organic Chemistry — Basic Principles",
];

const MATHS_2A = [
  "Complex Numbers",
  "De Moivre's Theorem",
  "Quadratic Expressions",
  "Theory of Equations",
  "Permutations and Combinations",
  "Binomial Theorem",
  "Partial Fractions",
  "Measures of Dispersion",
  "Probability",
  "Random Variables and Probability Distributions",
];

const MATHS_2B = [
  "Circle",
  "System of Circles",
  "Parabola",
  "Ellipse",
  "Hyperbola",
  "Integration",
  "Definite Integrals",
  "Differential Equations",
];

const PHYSICS_2 = [
  "Waves",
  "Ray Optics and Optical Instruments",
  "Wave Optics",
  "Electric Charges and Fields",
  "Electrostatic Potential and Capacitance",
  "Current Electricity",
  "Moving Charges and Magnetism",
  "Magnetism and Matter",
  "Electromagnetic Induction",
  "Alternating Current",
  "Electromagnetic Waves",
  "Dual Nature of Radiation and Matter",
  "Atoms",
  "Nuclei",
  "Semiconductor Electronics",
  "Communication Systems",
];

const CHEM_2 = [
  "Solid State",
  "Solutions",
  "Electrochemistry and Chemical Kinetics",
  "Surface Chemistry",
  "General Principles of Metallurgy",
  "p-Block Elements (Group 15, 16, 17, 18)",
  "d and f Block Elements",
  "Coordination Compounds",
  "Polymers",
  "Biomolecules",
  "Chemistry in Everyday Life",
  "Haloalkanes and Haloarenes",
  "Organic Compounds Containing C, H and O",
  "Organic Compounds Containing Nitrogen",
];

export const INTER_MPC_VAULT: MPCBookNode[] = [
  // 1st Year
  buildBook("1st Year", "Mathematics A", "English", MATHS_1A, TSBIE),
  buildBook("1st Year", "Mathematics A", "Telugu", MATHS_1A, TELUGU_ACADEMY),
  buildBook("1st Year", "Mathematics B", "English", MATHS_1B, TSBIE),
  buildBook("1st Year", "Mathematics B", "Telugu", MATHS_1B, TELUGU_ACADEMY),
  buildBook("1st Year", "Physics", "English", PHYSICS_1, TSBIE),
  buildBook("1st Year", "Physics", "Telugu", PHYSICS_1, TELUGU_ACADEMY),
  buildBook("1st Year", "Chemistry", "English", CHEM_1, TSBIE),
  buildBook("1st Year", "Chemistry", "Telugu", CHEM_1, TELUGU_ACADEMY),
  // 2nd Year
  buildBook("2nd Year", "Mathematics A", "English", MATHS_2A, TSBIE),
  buildBook("2nd Year", "Mathematics A", "Telugu", MATHS_2A, TELUGU_ACADEMY),
  buildBook("2nd Year", "Mathematics B", "English", MATHS_2B, TSBIE),
  buildBook("2nd Year", "Mathematics B", "Telugu", MATHS_2B, TELUGU_ACADEMY),
  buildBook("2nd Year", "Physics", "English", PHYSICS_2, TSBIE),
  buildBook("2nd Year", "Physics", "Telugu", PHYSICS_2, TELUGU_ACADEMY),
  buildBook("2nd Year", "Chemistry", "English", CHEM_2, TSBIE),
  buildBook("2nd Year", "Chemistry", "Telugu", CHEM_2, TELUGU_ACADEMY),
];

// ---------- Lookup / Search Helpers ----------

export function findBook(
  year: InterYear,
  subject: MPCSubject,
  medium: ResourceMedium,
): MPCBookNode | null {
  return (
    INTER_MPC_VAULT.find(
      (b) => b.year === year && b.subject === subject && b.medium === medium,
    ) ?? null
  );
}

export function getChaptersByBookId(bookId: string): MPCChapter[] {
  return INTER_MPC_VAULT.find((b) => b.id === bookId)?.chapters ?? [];
}

export interface ChapterSearchHit {
  book: MPCBookNode;
  chapter: MPCChapter;
}

export function searchChapters(query: string): ChapterSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: ChapterSearchHit[] = [];
  for (const book of INTER_MPC_VAULT) {
    for (const ch of book.chapters) {
      const hay =
        `${ch.title} ${book.subject} ${book.year} ${book.medium}`.toLowerCase();
      if (hay.includes(q)) hits.push({ book, chapter: ch });
    }
  }
  return hits;
}

// ---------- Active Focus Topic Anchor ----------

export const ACTIVE_FOCUS_TOPIC_KEY = "trackora:active-focus-topic";

export interface ActiveFocusTopic {
  classLevel: string; // "Inter 11" | "Inter 12"
  subject: string;
  chapterTitle: string;
  setAt: number;
}

export function setActiveFocusTopic(
  classLevel: string,
  subject: string,
  chapterTitle: string,
): ActiveFocusTopic {
  const payload: ActiveFocusTopic = {
    classLevel,
    subject,
    chapterTitle,
    setAt: Date.now(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        ACTIVE_FOCUS_TOPIC_KEY,
        JSON.stringify(payload),
      );
      window.dispatchEvent(
        new CustomEvent("trackora:active-focus-topic", { detail: payload }),
      );
    } catch {
      /* noop */
    }
  }
  return payload;
}

export function classLevelForYear(year: InterYear): string {
  return year === "1st Year" ? "Inter 11" : "Inter 12";
}
