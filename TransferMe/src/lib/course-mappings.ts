// Course mapping data from articulation files
// Institution 12 = California State University, Monterey Bay (CSUMB)
// Institution 11 = California Polytechnic University, San Luis Obispo (Cal Poly SLO)
// Institution 133 = Monterey Peninsula College (MPC)

export type CourseMapping = {
  sendingPrefix: string;
  sendingNumber: string;
  sendingTitle: string;
  sendingUnits: number;
  receivingPrefix: string;
  receivingNumber: string;
  receivingTitle: string;
  receivingUnits: number;
  type: "AD" | "AM" | "AP"; // AllDepartments, AllMajors, AllPrefixes
};

// Institution information
export const INSTITUTION_INFO = {
  "California State University, Monterey Bay": {
    code: 12,
    abbreviation: "CSUMB",
  },
  "California Polytechnic University, San Luis Obispo": {
    code: 11,
    abbreviation: "CPSLO",
  },
  "Monterey Peninsula College": {
    code: 133,
    abbreviation: "MPC",
  },
};

// Course mappings organized by university
export type MappingsByUniversity = {
  [universityName: string]: CourseMapping[];
};

// CSUMB Course Mappings (California State University, Monterey Bay)
const MAPPINGS_CSUMB: CourseMapping[] = [
  // Agricultural Plant & Soil Science mappings
  {
    sendingPrefix: "AGPS",
    sendingNumber: "128",
    sendingTitle: "Intro to Soil Science",
    sendingUnits: 4,
    receivingPrefix: "HORT",
    receivingNumber: "53",
    receivingTitle: "Soil Science and Management",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "BIO",
    sendingNumber: "204",
    sendingTitle: "Introduction to Life Sciences",
    sendingUnits: 3,
    receivingPrefix: "BIOL",
    receivingNumber: "10",
    receivingTitle: "Principles of Biology",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "CST",
    sendingNumber: "231",
    sendingTitle: "Problem Solving and Programming",
    sendingUnits: 4,
    receivingPrefix: "CSCI",
    receivingNumber: "10A",
    receivingTitle: "Programming Methods I: JAVA",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "CST",
    sendingNumber: "231",
    sendingTitle: "Problem Solving and Programming",
    sendingUnits: 4,
    receivingPrefix: "CSCI",
    receivingNumber: "10C",
    receivingTitle: "Programming Methods 1.5 - C and C++",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "CST",
    sendingNumber: "231",
    sendingTitle: "Problem Solving and Programming",
    sendingUnits: 4,
    receivingPrefix: "CSCI",
    receivingNumber: "9",
    receivingTitle: "Programming Fundamentals: Python",
    receivingUnits: 3,
    type: "AD",
  },
  {
    sendingPrefix: "CST",
    sendingNumber: "238",
    sendingTitle: "Introduction to Data Structure",
    sendingUnits: 4,
    receivingPrefix: "CSCI",
    receivingNumber: "10B",
    receivingTitle: "Programming Methods II: JAVA",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "GS",
    sendingNumber: "215",
    sendingTitle: "Global History II: since 1500",
    sendingUnits: 3,
    receivingPrefix: "HIST",
    receivingNumber: "8",
    receivingTitle: "World History Since 1500",
    receivingUnits: 3,
    type: "AD",
  },
  {
    sendingPrefix: "MATH",
    sendingNumber: "130",
    sendingTitle: "Precalculus",
    sendingUnits: 5,
    receivingPrefix: "MATH",
    receivingNumber: "13",
    receivingTitle: "Pre-Calculus",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "SPAN",
    sendingNumber: "201",
    sendingTitle: "Intermediate Spanish I",
    sendingUnits: 3,
    receivingPrefix: "SPAN",
    receivingNumber: "3",
    receivingTitle: "Intermediate Spanish I",
    receivingUnits: 5,
    type: "AD",
  },
];

// Cal Poly SLO Course Mappings (California Polytechnic University, San Luis Obispo)
const MAPPINGS_CPSLO: CourseMapping[] = [
  {
    sendingPrefix: "ARTS",
    sendingNumber: "10A",
    sendingTitle: "Drawing and Composition I",
    sendingUnits: 3,
    receivingPrefix: "ART",
    receivingNumber: "101",
    receivingTitle: "The Fundamentals of Drawing",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "BIOL",
    sendingNumber: "10",
    sendingTitle: "Principles of Biology",
    sendingUnits: 4,
    receivingPrefix: "BIO",
    receivingNumber: "111",
    receivingTitle: "General Biology",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "CHEM",
    sendingNumber: "1A",
    sendingTitle: "General Chemistry I",
    sendingUnits: 5,
    receivingPrefix: "CHEM",
    receivingNumber: "110",
    receivingTitle: "World of Chemistry",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "CHEM",
    sendingNumber: "1B",
    sendingTitle: "General Chemistry II",
    sendingUnits: 5,
    receivingPrefix: "CHEM",
    receivingNumber: "125",
    receivingTitle: "General Chemistry for Physical Science and Engineering II",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "CSCI",
    sendingNumber: "10C",
    sendingTitle: "Programming Methods 1.5 - C and C++",
    sendingUnits: 4,
    receivingPrefix: "CPE",
    receivingNumber: "101",
    receivingTitle: "Fundamentals of Computer Science",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "CSCI",
    sendingNumber: "10A",
    sendingTitle: "Programming Methods I: JAVA",
    sendingUnits: 4,
    receivingPrefix: "CPE",
    receivingNumber: "101",
    receivingTitle: "Fundamentals of Computer Science",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "CSCI",
    sendingNumber: "9",
    sendingTitle: "Programming Fundamentals: Python",
    sendingUnits: 3,
    receivingPrefix: "CPE",
    receivingNumber: "123",
    receivingTitle: "Introduction to Computing",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "CSCI",
    sendingNumber: "10B",
    sendingTitle: "Programming Methods II: JAVA",
    sendingUnits: 4,
    receivingPrefix: "CPE",
    receivingNumber: "202",
    receivingTitle: "Data Structures",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "ECON",
    sendingNumber: "1",
    sendingTitle: "The American Economic System",
    sendingUnits: 3,
    receivingPrefix: "ECON",
    receivingNumber: "201",
    receivingTitle: "Survey of Economics",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "ECON",
    sendingNumber: "4",
    sendingTitle: "Principles of Economics: Micro",
    sendingUnits: 3,
    receivingPrefix: "ECON",
    receivingNumber: "221",
    receivingTitle: "Microeconomics",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "ENGL",
    sendingNumber: "C1000",
    sendingTitle: "Academic Reading and Writing",
    sendingUnits: 3,
    receivingPrefix: "ENGL",
    receivingNumber: "134",
    receivingTitle: "Writing and Rhetoric",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "ENGL",
    sendingNumber: "1B",
    sendingTitle: "Introduction to Literature",
    sendingUnits: 3,
    receivingPrefix: "ENGL",
    receivingNumber: "202",
    receivingTitle: "Introduction to Literary Studies",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "SPAN",
    sendingNumber: "101",
    sendingTitle: "Elementary Spanish I",
    sendingUnits: 4,
    receivingPrefix: "SPAN",
    receivingNumber: "100",
    receivingTitle: "Fundamentals of Spanish",
    receivingUnits: 4,
    type: "AD",
  },
  {
    sendingPrefix: "SPAN",
    sendingNumber: "201",
    sendingTitle: "Intermediate Spanish I",
    sendingUnits: 4,
    receivingPrefix: "SPAN",
    receivingNumber: "227",
    receivingTitle: "Intermediate Spanish",
    receivingUnits: 4,
    type: "AD",
  },
];

// Master mappings organized by university name
export const COURSE_MAPPINGS_BY_UNIVERSITY: MappingsByUniversity = {
  "California State University, Monterey Bay": MAPPINGS_CSUMB,
  "California Polytechnic University, San Luis Obispo": MAPPINGS_CPSLO,
};

// Helper lookup for university names
export const ALL_UNIVERSITIES = Object.keys(COURSE_MAPPINGS_BY_UNIVERSITY);

const COURSE_ALIASES: Record<string, Array<{ prefix: string; number: string }>> = {
  "MATH 13": [{ prefix: "MATH", number: "130" }],
  "HIST 8": [{ prefix: "GS", number: "215" }],
  "CSIS 9": [{ prefix: "CST", number: "231" }],
  "ENGL 1A": [{ prefix: "HCOM", number: "120" }],
  "HIST T110": [{ prefix: "HIST", number: "12" }],
  "FINA T107": [{ prefix: "ETNC", number: "4" }],
};

const PREFIX_ALIASES: Record<string, string[]> = {
  CSIS: ["CSCI"],
};

const MANUAL_TRANSFER_TARGETS: Record<
  string,
  { receivingPrefix: string; receivingNumber: string; receivingTitle: string; receivingUnits: number }
> = {
  "MATH 13": { receivingPrefix: "MATH", receivingNumber: "13", receivingTitle: "Pre-Calculus", receivingUnits: 4 },
  "HIST 8": { receivingPrefix: "HIST", receivingNumber: "8", receivingTitle: "World History Since 1500", receivingUnits: 3 },
  "ENGL 1A": { receivingPrefix: "ENGL", receivingNumber: "1A", receivingTitle: "College Composition", receivingUnits: 3 },
  "CSIS 9": { receivingPrefix: "CSCI", receivingNumber: "9", receivingTitle: "Programming Fundamentals: Python", receivingUnits: 3 },
  "HIST T110": { receivingPrefix: "HIST", receivingNumber: "12", receivingTitle: "Women in United States History", receivingUnits: 3 },
  "FINA T107": { receivingPrefix: "ETNC", receivingNumber: "4", receivingTitle: "Mexican-Amer Art in Amer Cultr", receivingUnits: 3 },
};

/**
 * Find course mappings for a specific sending course and receiving university
 * @param prefix Course prefix (e.g., "CST", "MATH")
 * @param courseNumber Course number (e.g., "231", "130")
 * @param university Receiving university name (defaults to CSUMB if not specified)
 * @returns Array of matching course mappings
 */
export function findMappingsForCourse(
  prefix: string,
  courseNumber: string,
  university: string = "California State University, Monterey Bay"
): CourseMapping[] {
  const mappings = COURSE_MAPPINGS_BY_UNIVERSITY[university] || [];
  const normalizedPrefix = prefix.toUpperCase().trim();
  const normalizedNumber = courseNumber.toUpperCase().replace(/\s+/g, "").trim();
  const aliasPrefixes = [normalizedPrefix, ...(PREFIX_ALIASES[normalizedPrefix] || [])];

  // 1. Direct match with prefix aliases
  const directMatches = mappings.filter(
    (m) =>
      aliasPrefixes.includes(m.sendingPrefix.toUpperCase()) &&
      m.sendingNumber.toUpperCase().replace(/\s+/g, "") === normalizedNumber
  );

  if (directMatches.length > 0) return directMatches;

  // 2. Alias lookup
  const aliasKey = `${normalizedPrefix} ${normalizedNumber}`;
  const aliases = COURSE_ALIASES[aliasKey] || [];

  const aliasMatches = aliases.flatMap((alias) =>
    mappings.filter(
      (m) =>
        m.sendingPrefix.toUpperCase() === alias.prefix.toUpperCase() &&
        m.sendingNumber.toUpperCase().replace(/\s+/g, "") ===
          alias.number.toUpperCase().replace(/\s+/g, "")
    )
  );

  if (aliasMatches.length > 0) return [...new Set(aliasMatches)];

  // 3. Reverse lookup (receiving course as fallback)
  const reverseMatches = mappings.filter(
    (m) =>
      aliasPrefixes.includes(m.receivingPrefix.toUpperCase()) &&
      m.receivingNumber.toUpperCase().replace(/\s+/g, "") === normalizedNumber
  );

  if (reverseMatches.length > 0) return reverseMatches;

  // 4. Manual fallback
  const manual = MANUAL_TRANSFER_TARGETS[`${normalizedPrefix} ${normalizedNumber}`];
  if (manual) {
    return [
      {
        sendingPrefix: normalizedPrefix,
        sendingNumber: normalizedNumber,
        sendingTitle: "Equivalent course",
        sendingUnits: manual.receivingUnits,
        receivingPrefix: manual.receivingPrefix,
        receivingNumber: manual.receivingNumber,
        receivingTitle: manual.receivingTitle,
        receivingUnits: manual.receivingUnits,
        type: "AD",
      },
    ];
  }

  return [];
}

export function getReceivingCourse(mapping: CourseMapping): string {
  return `${mapping.receivingPrefix} ${mapping.receivingNumber}`;
}

export function getSendingCourse(mapping: CourseMapping): string {
  return `${mapping.sendingPrefix} ${mapping.sendingNumber}`;
}

/**
 * Get all available course mappings for a specific university
 * @param university University name
 * @returns Array of course mappings for that university
 */
export function getMappingsForUniversity(university: string): CourseMapping[] {
  return COURSE_MAPPINGS_BY_UNIVERSITY[university] || [];
}
