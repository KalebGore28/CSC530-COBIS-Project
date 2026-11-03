import { courses, programs } from "@/db/schema";
import { parseCourseCode } from "@/utils/code-parsers";
import { nullable, readSeedCSV } from "../read-seed-csv";
import type { getDb } from "@/db";

type Db = ReturnType<typeof getDb>;
export type Course = typeof courses.$inferInsert;
export type Program = typeof programs.$inferInsert;

/**
 * The course catalog, the same way the importer reads reg_cuba_catalog: each course belongs to
 * the department and college its prefix is mapped to in course_prefixes.csv.
 */
export async function readCourses(): Promise<Array<Course>> {
  const prefixRows = await readSeedCSV("course_prefixes.csv");
  const prefixes = new Map(
    prefixRows.map((row) => [
      row.PREFIX,
      { department_id: nullable(row.CRSEDEPT), college_id: nullable(row.CRSECOLL) },
    ]),
  );

  const rows = await readSeedCSV("reg_cuba_catalog_202510_20250117.csv");
  return rows.map((row) => {
    const { subject, number, suffix } = parseCourseCode(row.COURSE);
    return {
      id: row.COURSE,
      subject,
      number,
      suffix,
      title: row.CRSETITLE,
      hours: Number(row.CREDITHRS),
      department_id: prefixes.get(subject)?.department_id ?? null,
      college_id: prefixes.get(subject)?.college_id ?? null,
    };
  });
}

/** The programs from major_minor.csv, the same way the importer reads it */
export async function readPrograms(): Promise<Array<Program>> {
  const rows = await readSeedCSV("major_minor.csv");
  return rows.map((row) => ({
    id: row.CODE,
    description: row.DESCRIPTION,
    cip_code: nullable(row.CIP_CODE),
    is_major: row.IS_MAJOR === "1",
    is_minor: row.IS_MINOR === "1",
    has_concentration: row.HAS_CONCENTRATION === "1",
    is_discontinued: row.IS_DISCONTINUED === "1",
    is_aacsb: row.IS_AACSB === "1",
    department_id: nullable(row.DEPARTMENT),
    college_id: nullable(row.COLLEGE),
  }));
}

export async function insertCourses(db: Db, rows: Array<Course>) {
  await db.insert(courses).values(rows);
}

export async function insertPrograms(db: Db, rows: Array<Program>) {
  await db.insert(programs).values(rows);
}
