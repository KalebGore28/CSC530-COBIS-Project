import { FEMALE_FIRST_NAMES, LAST_NAMES, MALE_FIRST_NAMES } from "./names";
import { chance, pick, randomInt } from "./random";
import type { faculty } from "@/db/schema";

export type Faculty = typeof faculty.$inferInsert;

/**
 * How many instructors each department gets. The Business departments teach and advise the
 * students; the others only teach the general education courses those students take.
 */
export const BUSINESS_FACULTY_COUNTS: Record<string, number> = {
  ACC: 10,
  COM: 8,
  CSC: 16,
  ECO: 13,
  JMC: 11,
  MMB: 20,
};

export const GEN_ED_FACULTY_COUNTS: Record<string, number> = {
  ENPH: 4,
  MAT: 4,
  HIS: 3,
  PSY: 3,
  BIO: 3,
  GLIA: 3,
  CHE: 2,
  ART: 2,
  EGPY: 2,
};

/**
 * Makes every instructor, department by department in alphabetical order, with M-numbers counting
 * up. So the first one is in Accounting, and the local dev sign-in, which borrows the lowest
 * unclaimed M-number, becomes an Accounting faculty member with students and sections to look at.
 */
export function generateFaculty(departmentColleges: Map<string, string | null>) {
  const allCounts = { ...BUSINESS_FACULTY_COUNTS, ...GEN_ED_FACULTY_COUNTS };
  const departments = Object.keys(allCounts).sort();
  const rows: Array<Faculty> = [];
  let nextNumber = 10_000_000;

  for (const department of departments) {
    for (let i = 0; i < allCounts[department]; i++) {
      nextNumber += randomInt(3, 400);
      rows.push({
        mnumber: `M${nextNumber}`,
        first_name: chance(0.5) ? pick(FEMALE_FIRST_NAMES) : pick(MALE_FIRST_NAMES),
        last_name: pick(LAST_NAMES),
        department_id: department,
        college_id: departmentColleges.get(department) ?? null,
      });
    }
  }
  return rows;
}
