import {
  academicStanding,
  admitCodes,
  colleges,
  coursePrefixes,
  departments,
  instructionalMethods,
  partOfTerm,
  registrationStatus,
  roles,
  terms,
} from "@/db/schema";
import { nullable, readSeedCSV } from "./read-seed-csv";
import type { getDb } from "@/db";

type Db = ReturnType<typeof getDb>;

// Each function adds the rows from its CSV with INSERT IGNORE, so rows already in the
// database (including ones edited since) are left alone and running it again is harmless.
// Each returns how many rows the CSV had.

/** The app's roles. Nothing else creates them, and permissions are tied to their ids. */
export async function seedRoles(db: Db) {
  const rows = await readSeedCSV("roles.csv");
  await db
    .insert(roles)
    .ignore()
    .values(rows.map((row) => ({ id: Number(row.ID), name: row.ROLE })));
  return rows.length;
}

/** Spring, Summer, Fall and Winter. Nothing else creates them. */
export async function seedTerms(db: Db) {
  const rows = await readSeedCSV("terms.csv");
  await db
    .insert(terms)
    .ignore()
    .values(rows.map((row) => ({ id: row.CODE, description: row.DESCRIPTION })));
  return rows.length;
}

// The importer fills in a code it hasn't seen as "unknown", so these give the codes their real names

export async function seedColleges(db: Db) {
  const rows = await readSeedCSV("colleges.csv");
  await db
    .insert(colleges)
    .ignore()
    .values(rows.map((row) => ({ id: row.CODE, description: row.DESCRIPTION })));
  return rows.length;
}

/** Needs the colleges first, since each department belongs to one. */
export async function seedDepartments(db: Db) {
  const rows = await readSeedCSV("departments.csv");
  await db
    .insert(departments)
    .ignore()
    .values(
      rows.map((row) => ({
        id: row.CODE,
        description: row.DESCRIPTION,
        college_id: nullable(row.COLLEGE),
      })),
    );
  return rows.length;
}

/**
 * Which department and college own each course prefix (CSC → CSC, BP). Needs the departments first.
 * Importing the catalog looks courses up here, so without it no course would belong to a department.
 */
export async function seedCoursePrefixes(db: Db) {
  const rows = await readSeedCSV("course_prefixes.csv");
  await db
    .insert(coursePrefixes)
    .ignore()
    .values(
      rows.map((row) => ({
        id: row.PREFIX,
        department_id: nullable(row.CRSEDEPT),
        college_id: nullable(row.CRSECOLL),
      })),
    );
  return rows.length;
}

export async function seedAcademicStanding(db: Db) {
  const rows = await readSeedCSV("academic_standing.csv");
  await db
    .insert(academicStanding)
    .ignore()
    .values(rows.map((row) => ({ id: row.CODE, description: row.DESCRIPTION })));
  return rows.length;
}

export async function seedAdmitCodes(db: Db) {
  const rows = await readSeedCSV("admit_codes.csv");
  await db
    .insert(admitCodes)
    .ignore()
    .values(rows.map((row) => ({ id: row.CODE, description: row.DESCRIPTION })));
  return rows.length;
}

export async function seedInstructionalMethods(db: Db) {
  const rows = await readSeedCSV("instructional_methods.csv");
  await db
    .insert(instructionalMethods)
    .ignore()
    .values(rows.map((row) => ({ id: row.CODE, description: row.DESCRIPTION })));
  return rows.length;
}

export async function seedPartOfTerm(db: Db) {
  const rows = await readSeedCSV("part_of_term.csv");
  await db
    .insert(partOfTerm)
    .ignore()
    .values(rows.map((row) => ({ id: row.CODE, description: row.DESCRIPTION })));
  return rows.length;
}

export async function seedRegistrationStatus(db: Db) {
  const rows = await readSeedCSV("registration_status.csv");
  await db
    .insert(registrationStatus)
    .ignore()
    .values(rows.map((row) => ({ id: row.CODE, description: row.DESCRIPTION })));
  return rows.length;
}
