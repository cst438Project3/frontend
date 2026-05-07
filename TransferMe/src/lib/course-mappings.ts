// Course mapping data from 12_133 files
// Institution 12 = California State University, Monterey Bay
// Institution 133 = Monterey Peninsula College

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

// Sample mappings extracted from 12_133 files
// These are the key course articulations between Monterey Peninsula College -> Cal State Monterey Bay
export const COURSE_MAPPINGS: CourseMapping[] = [
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
  // Add more as needed from the files
];

// Institution IDs
export const INSTITUTION_CODES = {
  montereyPeninsulaCollege: 133,
  calStateMontereyBay: 12,
};

export function findMappingsForCourse(
  prefix: string,
  courseNumber: string
): CourseMapping[] {
  return COURSE_MAPPINGS.filter(
    (m) =>
      m.sendingPrefix === prefix.toUpperCase() &&
      m.sendingNumber === courseNumber
  );
}

export function getReceivingCourse(mapping: CourseMapping): string {
  return `${mapping.receivingPrefix} ${mapping.receivingNumber}`;
}

export function getSendingCourse(mapping: CourseMapping): string {
  return `${mapping.sendingPrefix} ${mapping.sendingNumber}`;
}
