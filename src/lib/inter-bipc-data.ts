// Intermediate BiPC / NEET (Telangana State Board) — Textbook Data Vault
// Junior Inter (1st Year) & Senior Inter (2nd Year)

export type InterYear = "1st Year" | "2nd Year";
export type BPCSubject = "Botany" | "Zoology" | "Physics" | "Chemistry";
export type ResourceMedium = "English" | "Telugu";

export interface BPCChapter {
  number: number;
  title: string;
  pdfUrl: string;
}

export interface BPCBookNode {
  id: string;
  title: string;
  year: InterYear;
  subject: BPCSubject;
  medium: ResourceMedium;
  cdnUrl: string;
  officialUrl: string;
  chapters: BPCChapter[];
}

export const BPC_SUBJECTS: BPCSubject[] = [
  "Botany",
  "Zoology",
  "Physics",
  "Chemistry",
];

export const BPC_MEDIUMS: ResourceMedium[] = ["English", "Telugu"];
export const BPC_YEARS: InterYear[] = ["1st Year", "2nd Year"];

const TSBIE = "https://tsbie.cgg.gov.in";
const TELUGU_ACADEMY = "https://telugu-academy.blogspot.com";
const CAREERS360_1ST =
  "https://school.careers360.com/boards/tsbie/telangana-board-intermediate-1st-year-books-bsar";
const CAREERS360_2ND =
  "https://school.careers360.com/boards/tsbie/telangana-board-intermediate-2nd-year-books-bsar";

function slugFor(year: InterYear, subject: BPCSubject): string {
  const y = year === "1st Year" ? "1st" : "2nd";
  const sMap: Record<BPCSubject, string> = {
    Botany: "botany",
    Zoology: "zoology",
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
  subject: BPCSubject,
  medium: ResourceMedium,
  titles: string[],
  officialUrl: string,
): BPCBookNode {
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

// ---- Chapter titles (TSBIE BiPC / NEET-aligned) ----
const BOTANY_1 = [
  "The Living World",
  "Biological Classification",
  "Plant Kingdom",
  "Morphology of Flowering Plants",
  "Anatomy of Flowering Plants",
  "Cell: The Unit of Life",
  "Cell Cycle and Cell Division",
  "Biomolecules",
  "Transport in Plants",
  "Mineral Nutrition",
  "Photosynthesis in Higher Plants",
  "Respiration in Plants",
  "Plant Growth and Development",
];

const ZOOLOGY_1 = [
  "Diversity in the Living World",
  "Structural Organisation in Animals",
  "Animal Kingdom",
  "Locomotion and Reproduction in Protozoa",
  "Biology and Human Welfare",
  "Type Study of Periplaneta Americana",
  "Ecology and Environment",
  "Human Anatomy and Physiology - I (Digestion & Absorption)",
  "Human Anatomy and Physiology - II (Breathing & Exchange of Gases)",
  "Human Anatomy and Physiology - III (Body Fluids & Circulation)",
  "Human Anatomy and Physiology - IV (Excretory Products)",
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

const BOTANY_2 = [
  "Plant Physiology (Advanced)",
  "Reproduction in Plants",
  "Sexual Reproduction in Flowering Plants",
  "Genetics: Principles of Inheritance and Variation",
  "Molecular Basis of Inheritance",
  "Biotechnology: Principles and Processes",
  "Biotechnology and its Applications",
  "Strategies for Enhancement in Food Production",
  "Microbes in Human Welfare",
  "Organisms and Populations",
  "Ecosystems",
  "Biodiversity and Conservation",
  "Environmental Issues",
];

const ZOOLOGY_2 = [
  "Human Reproduction",
  "Reproductive Health",
  "Genetics",
  "Organic Evolution",
  "Human Health and Diseases",
  "Immune System",
  "Applied Biology",
  "Human Anatomy and Physiology - V (Neural Control & Coordination)",
  "Human Anatomy and Physiology - VI (Endocrine System)",
  "Human Anatomy and Physiology - VII (Locomotion & Movement)",
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

export const INTER_BPC_VAULT: BPCBookNode[] = [
  buildBook("1st Year", "Botany", "English", BOTANY_1, TSBIE),
  buildBook("1st Year", "Botany", "Telugu", BOTANY_1, TELUGU_ACADEMY),
  buildBook("1st Year", "Zoology", "English", ZOOLOGY_1, TSBIE),
  buildBook("1st Year", "Zoology", "Telugu", ZOOLOGY_1, TELUGU_ACADEMY),
  buildBook("1st Year", "Physics", "English", PHYSICS_1, TSBIE),
  buildBook("1st Year", "Physics", "Telugu", PHYSICS_1, TELUGU_ACADEMY),
  buildBook("1st Year", "Chemistry", "English", CHEM_1, TSBIE),
  buildBook("1st Year", "Chemistry", "Telugu", CHEM_1, TELUGU_ACADEMY),
  buildBook("2nd Year", "Botany", "English", BOTANY_2, TSBIE),
  buildBook("2nd Year", "Botany", "Telugu", BOTANY_2, TELUGU_ACADEMY),
  buildBook("2nd Year", "Zoology", "English", ZOOLOGY_2, TSBIE),
  buildBook("2nd Year", "Zoology", "Telugu", ZOOLOGY_2, TELUGU_ACADEMY),
  buildBook("2nd Year", "Physics", "English", PHYSICS_2, TSBIE),
  buildBook("2nd Year", "Physics", "Telugu", PHYSICS_2, TELUGU_ACADEMY),
  buildBook("2nd Year", "Chemistry", "English", CHEM_2, TSBIE),
  buildBook("2nd Year", "Chemistry", "Telugu", CHEM_2, TELUGU_ACADEMY),
];

export function findBPCBook(
  year: InterYear,
  subject: BPCSubject,
  medium: ResourceMedium,
): BPCBookNode | null {
  return (
    INTER_BPC_VAULT.find(
      (b) => b.year === year && b.subject === subject && b.medium === medium,
    ) ?? null
  );
}

export function getBPCChaptersByBookId(bookId: string): BPCChapter[] {
  return INTER_BPC_VAULT.find((b) => b.id === bookId)?.chapters ?? [];
}

export interface BPCChapterSearchHit {
  book: BPCBookNode;
  chapter: BPCChapter;
}

export function searchBPCChapters(query: string): BPCChapterSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: BPCChapterSearchHit[] = [];
  for (const book of INTER_BPC_VAULT) {
    for (const ch of book.chapters) {
      const hay =
        `${ch.title} ${book.subject} ${book.year} ${book.medium}`.toLowerCase();
      if (hay.includes(q)) hits.push({ book, chapter: ch });
    }
  }
  return hits;
}

export function classLevelForYear(year: InterYear): string {
  return year === "1st Year" ? "Inter 11" : "Inter 12";
}
