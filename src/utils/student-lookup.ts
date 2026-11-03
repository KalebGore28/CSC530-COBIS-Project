import { and, asc, count, desc, eq, exists, gte, inArray, ne, notExists, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { getDb } from "@/db";
import type { DataAccess } from "@/utils/data-access";
import {
  programs,
  studentAcademicInfo,
  studentCourses,
  studentPrograms,
  students,
} from "@/db/schema";
import {
  STUDENT_ACADEMIC_INFO_ROW,
  STUDENT_COURSE_ROW,
  STUDENT_PROGRAM_ROW,
  STUDENT_ROW,
} from "@/utils/data-access";
import { ENROLLED_STATUSES } from "@/lib/enrolled-statuses";

type Db = ReturnType<typeof getDb>;

export const CLASS_LEVELS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"] as const;
export type ClassLevel = (typeof CLASS_LEVELS)[number];

// Best to worst. A minimum grade of B matches A and B.
export const LETTER_GRADES = ["A", "B", "C", "D", "E"] as const;
export type LetterGrade = (typeof LETTER_GRADES)[number];

export type StudentLookupFilters = {
  programIds: Array<string>;
  // Which kind of declaration counts, when programs are picked
  programType: "MAJOR" | "MINOR" | "ANY";
  courseIds: Array<string>;
  // Taken means enrolled in any of the courses at some point, not dropped or withdrawn
  courseTaken: boolean;
  minGrade?: LetterGrade;
  levels: Array<ClassLevel>;
  gpaMin?: number;
};

export type StudentLookupSort = "name" | "gpa";

/**
 * Each student's newest records, as CTEs the lookup queries share.
 * Only rows the viewer can see are ranked, so "newest" means the newest one they're allowed to see.
 */
function latestRecords(db: Db, access: DataAccess) {
  const latestInfo = db.$with("latest_info").as(
    db
      .select({
        mnumber: studentAcademicInfo.mnumber,
        overall_gpa: sql<number | null>`${studentAcademicInfo.overall_gpa}`.as("overall_gpa"),
        overall_earned_hours: sql<number | null>`${studentAcademicInfo.overall_earned_hours}`.as(
          "overall_earned_hours",
        ),
        rank: sql<number>`row_number() over (partition by ${studentAcademicInfo.mnumber} order by ${studentAcademicInfo.year} desc, ${studentAcademicInfo.term_id} desc)`.as(
          "info_rank",
        ),
      })
      .from(studentAcademicInfo)
      .where(access.canSee("academic_info", STUDENT_ACADEMIC_INFO_ROW)),
  );

  // Every program in the student's newest term, since a student can have several majors and minors at once
  const latestPrograms = db.$with("latest_programs").as(
    db
      .select({
        mnumber: studentPrograms.mnumber,
        program_id: studentPrograms.program_id,
        type: studentPrograms.type,
        level: sql<string>`${studentPrograms.level}`.as("program_level"),
        rank: sql<number>`dense_rank() over (partition by ${studentPrograms.mnumber} order by ${studentPrograms.year} desc, ${studentPrograms.term_id} desc)`.as(
          "program_rank",
        ),
      })
      .from(studentPrograms)
      .where(access.canSee("programs", STUDENT_PROGRAM_ROW)),
  );

  return { latestInfo, latestPrograms };
}

type LatestRecords = ReturnType<typeof latestRecords>;

/**
 * Freshman to Senior by earned hours, or Graduate when any current program is graduate level.
 * Null when the viewer can't see academic info, since a level is worked out from it.
 */
function classLevelExpression(
  db: Db,
  access: DataAccess,
  { latestInfo, latestPrograms }: LatestRecords,
) {
  if (!access.hasCategory("academic_info")) return sql<ClassLevel | null>`null`;

  const inGraduateProgram = exists(
    db
      .select({ found: sql`1` })
      .from(latestPrograms)
      .where(
        and(
          eq(latestPrograms.mnumber, students.mnumber),
          eq(latestPrograms.rank, 1),
          ne(latestPrograms.level, "UG"),
        ),
      ),
  );
  const hours = latestInfo.overall_earned_hours;

  return sql<ClassLevel | null>`case
    when ${inGraduateProgram} then 'Graduate'
    when ${hours} is null then null
    when ${hours} < 30 then 'Freshman'
    when ${hours} < 60 then 'Sophomore'
    when ${hours} < 90 then 'Junior'
    else 'Senior'
  end`;
}

function lookupWhere(
  db: Db,
  access: DataAccess,
  filters: StudentLookupFilters,
  records: LatestRecords,
  classLevel: SQL<ClassLevel | null>,
) {
  const { latestInfo, latestPrograms } = records;
  // Only students the viewer can see come back at all
  const conditions: Array<SQL | undefined> = [access.canSee("identity", STUDENT_ROW)];

  if (filters.programIds.length > 0) {
    conditions.push(
      exists(
        db
          .select({ found: sql`1` })
          .from(latestPrograms)
          .where(
            and(
              eq(latestPrograms.mnumber, students.mnumber),
              eq(latestPrograms.rank, 1),
              inArray(latestPrograms.program_id, filters.programIds),
              filters.programType === "ANY"
                ? undefined
                : eq(latestPrograms.type, filters.programType),
            ),
          ),
      ),
    );
  }

  if (filters.courseIds.length > 0) {
    const courseRows = db
      .select({ found: sql`1` })
      .from(studentCourses)
      .where(
        and(
          eq(studentCourses.mnumber, students.mnumber),
          inArray(studentCourses.course_id, filters.courseIds),
          inArray(studentCourses.registration_status_id, ENROLLED_STATUSES),
          access.canSee("courses", STUDENT_COURSE_ROW),
          // A grade only counts when the viewer can see it, or which students come back would reveal it
          filters.courseTaken && filters.minGrade
            ? and(
                inArray(
                  studentCourses.final_grade,
                  LETTER_GRADES.slice(0, LETTER_GRADES.indexOf(filters.minGrade) + 1),
                ),
                access.canSee("grades", STUDENT_COURSE_ROW),
              )
            : undefined,
        ),
      );

    conditions.push(filters.courseTaken ? exists(courseRows) : notExists(courseRows));
  }

  if (filters.gpaMin !== undefined) {
    conditions.push(gte(latestInfo.overall_gpa, filters.gpaMin));
  }

  if (filters.levels.length > 0) {
    conditions.push(inArray(classLevel, filters.levels));
  }

  return and(...conditions);
}

/**
 * One page of matching students, or every match when no page is given (for the CSV export).
 */
export async function findStudents(
  db: Db,
  access: DataAccess,
  filters: StudentLookupFilters,
  sort: StudentLookupSort,
  page?: { offset: number; limit: number },
) {
  const records = latestRecords(db, access);
  const classLevel = classLevelExpression(db, access, records);
  const { latestInfo } = records;

  const query = db
    .with(records.latestInfo, records.latestPrograms)
    .select({
      mnumber: students.mnumber,
      first_name: students.first_name,
      last_name: students.last_name,
      suffix: students.suffix,
      email: students.email,
      overall_gpa: latestInfo.overall_gpa,
      class_level: classLevel,
    })
    .from(students)
    .leftJoin(latestInfo, and(eq(latestInfo.mnumber, students.mnumber), eq(latestInfo.rank, 1)))
    .where(lookupWhere(db, access, filters, records, classLevel))
    .orderBy(
      // Students without a GPA go last either way
      ...(sort === "gpa"
        ? [sql`${latestInfo.overall_gpa} is null`, desc(latestInfo.overall_gpa)]
        : []),
      asc(students.last_name),
      asc(students.first_name),
      // Keeps pages from overlapping when names match
      asc(students.mnumber),
    );

  return page ? query.limit(page.limit).offset(page.offset) : query;
}

export async function countStudents(db: Db, access: DataAccess, filters: StudentLookupFilters) {
  const records = latestRecords(db, access);
  const classLevel = classLevelExpression(db, access, records);
  const { latestInfo } = records;

  const [result] = await db
    .with(records.latestInfo, records.latestPrograms)
    .select({ total: count() })
    .from(students)
    .leftJoin(latestInfo, and(eq(latestInfo.mnumber, students.mnumber), eq(latestInfo.rank, 1)))
    .where(lookupWhere(db, access, filters, records, classLevel));

  return result.total;
}

/**
 * The current programs for a page of students, majors first.
 */
export async function getCurrentPrograms(db: Db, access: DataAccess, mnumbers: Array<string>) {
  if (mnumbers.length === 0) return [];
  const { latestPrograms } = latestRecords(db, access);

  return db
    .with(latestPrograms)
    .select({
      mnumber: latestPrograms.mnumber,
      program_id: latestPrograms.program_id,
      description: programs.description,
      type: latestPrograms.type,
    })
    .from(latestPrograms)
    .innerJoin(programs, eq(latestPrograms.program_id, programs.id))
    .where(and(inArray(latestPrograms.mnumber, mnumbers), eq(latestPrograms.rank, 1)))
    .orderBy(asc(latestPrograms.type), asc(programs.description));
}
