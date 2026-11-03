import { eq, inArray, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import type { AnyColumn, SQL, SQLWrapper } from "drizzle-orm";
import type { getDb } from "@/db";
import type { Capability, DataCategory, DataRelationship } from "@/types/access-checks";
import {
  courses,
  programs,
  roleCapabilities,
  roleDataAccess,
  roles,
  studentAcademicInfo,
  studentAdvisors,
  studentCourses,
  studentPrograms,
  students,
} from "@/db/schema";
import { CAPABILITIES, ROLES, isCategoryLockedForRole } from "@/types/access-checks";

type Db = ReturnType<typeof getDb>;

export type Viewer = {
  mnumber: string | null;
  departmentId: string | null;
};

/**
 * The columns that identify the row being checked.
 * - term: left out for tables with no term, which then match a relationship from any term.
 * - course: only on course rows, so course relationships can match that exact course.
 */
export type RowRef = {
  mnumber: AnyColumn;
  term?: { year: AnyColumn; term_id: AnyColumn };
  course?: { course_id: AnyColumn; instructor_mnumber: AnyColumn };
};

export const STUDENT_ROW: RowRef = { mnumber: students.mnumber };

export const STUDENT_PROGRAM_ROW: RowRef = {
  mnumber: studentPrograms.mnumber,
  term: { year: studentPrograms.year, term_id: studentPrograms.term_id },
};

export const STUDENT_ADVISOR_ROW: RowRef = {
  mnumber: studentAdvisors.mnumber,
  term: { year: studentAdvisors.year, term_id: studentAdvisors.term_id },
};

export const STUDENT_ACADEMIC_INFO_ROW: RowRef = {
  mnumber: studentAcademicInfo.mnumber,
  term: { year: studentAcademicInfo.year, term_id: studentAcademicInfo.term_id },
};

export const STUDENT_COURSE_ROW: RowRef = {
  mnumber: studentCourses.mnumber,
  term: { year: studentCourses.year, term_id: studentCourses.term_id },
  course: {
    course_id: studentCourses.course_id,
    instructor_mnumber: studentCourses.instructor_mnumber,
  },
};

// These are aliased because the row being checked can come from the same table.
// Without an alias, a condition like `student_programs.mnumber = student_programs.mnumber` is always true.
const accessCourses = alias(studentCourses, "access_student_courses");
const accessAdvisors = alias(studentAdvisors, "access_student_advisors");
const accessPrograms = alias(studentPrograms, "access_student_programs");

type StudentTermTable = { mnumber: AnyColumn; year: AnyColumn; term_id: AnyColumn };

/**
 * The columns a relationship's subquery returns: the student and term, or just the student when
 * the row being checked has no term.
 */
function studentTermColumns(table: StudentTermTable, row: RowRef): Record<string, AnyColumn> {
  return row.term
    ? { mnumber: table.mnumber, year: table.year, term_id: table.term_id }
    : { mnumber: table.mnumber };
}

/**
 * Whether the row's student and term are among the ones a subquery returns.
 * The subquery doesn't refer to the row, so MySQL runs it once and looks each row up in the
 * result. A correlated EXISTS would run again for every row checked, which got slow once
 * there were tens of thousands of rows.
 */
function isAmong(row: RowRef, subquery: SQLWrapper) {
  return row.term
    ? sql`(${row.mnumber}, ${row.term.year}, ${row.term.term_id}) in ${subquery}`
    : sql`${row.mnumber} in ${subquery}`;
}

const NO_ACCESS = sql`false`;

/**
 * Each relationship turns into the SQL condition for "is this viewer connected to this row?"
 * - Course relationships reach only the matching course rows. On other tables, they reach
 *   the terms where the student has a matching course.
 * - Student relationships reach all of the student's data for the terms where they exist.
 */
const RELATIONSHIPS: Record<DataRelationship, (db: Db, viewer: Viewer, row: RowRef) => SQL> = {
  teaches_course: (db, viewer, row) => {
    if (!viewer.mnumber) return NO_ACCESS;
    if (row.course) return eq(row.course.instructor_mnumber, viewer.mnumber);

    return isAmong(
      row,
      db
        .select(studentTermColumns(accessCourses, row))
        .from(accessCourses)
        .where(eq(accessCourses.instructor_mnumber, viewer.mnumber)),
    );
  },

  course_in_department: (db, viewer, row) => {
    if (!viewer.departmentId) return NO_ACCESS;
    if (row.course) {
      return inArray(
        row.course.course_id,
        db
          .select({ id: courses.id })
          .from(courses)
          .where(eq(courses.department_id, viewer.departmentId)),
      );
    }

    return isAmong(
      row,
      db
        .select(studentTermColumns(accessCourses, row))
        .from(accessCourses)
        .innerJoin(courses, eq(accessCourses.course_id, courses.id))
        .where(eq(courses.department_id, viewer.departmentId)),
    );
  },

  advises_student: (db, viewer, row) => {
    if (!viewer.mnumber) return NO_ACCESS;

    return isAmong(
      row,
      db
        .select(studentTermColumns(accessAdvisors, row))
        .from(accessAdvisors)
        .where(eq(accessAdvisors.advisor_mnumber, viewer.mnumber)),
    );
  },

  coordinates_program: (db, viewer, row) => {
    if (!viewer.mnumber) return NO_ACCESS;

    return isAmong(
      row,
      db
        .select(studentTermColumns(accessPrograms, row))
        .from(accessPrograms)
        .innerJoin(programs, eq(accessPrograms.program_id, programs.id))
        .where(eq(programs.coordinator, viewer.mnumber)),
    );
  },

  student_in_department: (db, viewer, row) => {
    if (!viewer.departmentId) return NO_ACCESS;

    return isAmong(
      row,
      db
        .select(studentTermColumns(accessPrograms, row))
        .from(accessPrograms)
        .innerJoin(programs, eq(accessPrograms.program_id, programs.id))
        .where(eq(programs.department_id, viewer.departmentId)),
    );
  },
};

export type DataGrants = Map<DataCategory, Set<DataRelationship>>;

export function createDataAccess(db: Db, viewer: Viewer, grants: DataGrants) {
  // Permissions only ever add, so a row is visible if any granted relationship matches it.
  function canSee(category: DataCategory, row: RowRef): SQL {
    const relationships = Array.from(grants.get(category) ?? []);
    if (relationships.length === 0) return NO_ACCESS;

    return (
      or(...relationships.map((relationship) => RELATIONSHIPS[relationship](db, viewer, row))) ??
      NO_ACCESS
    );
  }

  return {
    canSee,

    // Returns the column's value when the viewer can see the category, otherwise null.
    masked<TColumn extends AnyColumn>(category: DataCategory, row: RowRef, column: TColumn) {
      return sql<
        TColumn["_"]["data"] | null
      >`CASE WHEN ${canSee(category, row)} THEN ${column} END`.mapWith(column);
    },

    // Tells the frontend apart a hidden value from a value that's actually empty.
    isVisible(category: DataCategory, row: RowRef) {
      return sql<boolean>`${canSee(category, row)}`.mapWith(Boolean);
    },

    // Whether the viewer could ever see this category, for hiding whole columns and cards.
    hasCategory(category: DataCategory) {
      return (grants.get(category)?.size ?? 0) > 0;
    },
  };
}

export type DataAccess = ReturnType<typeof createDataAccess>;

/**
 * Faculty and advisor are determined by course and advisor assignments,
 * so they apply without needing to be in user_roles.
 */
export async function getEffectiveRoles(
  db: Db,
  userMnumber: string | null,
  assignedRoles: Set<string>,
) {
  const effectiveRoles = new Set(assignedRoles);
  if (!userMnumber) return effectiveRoles;

  const [teaching, advising] = await Promise.all([
    db
      .select({ found: sql`1` })
      .from(studentCourses)
      .where(eq(studentCourses.instructor_mnumber, userMnumber))
      .limit(1),
    db
      .select({ found: sql`1` })
      .from(studentAdvisors)
      .where(eq(studentAdvisors.advisor_mnumber, userMnumber))
      .limit(1),
  ]);

  if (teaching.length > 0) effectiveRoles.add(ROLES.FACULTY);
  if (advising.length > 0) effectiveRoles.add(ROLES.ADVISOR);

  return effectiveRoles;
}

export async function loadDataGrants(db: Db, effectiveRoles: Set<string>): Promise<DataGrants> {
  const grants: DataGrants = new Map();
  if (effectiveRoles.size === 0) return grants;

  const rows = await db
    .select({
      roleName: roles.name,
      relationship: roleDataAccess.relationship,
      category: roleDataAccess.category,
    })
    .from(roleDataAccess)
    .innerJoin(roles, eq(roleDataAccess.role_id, roles.id))
    .where(inArray(roles.name, Array.from(effectiveRoles)));

  for (const { roleName, relationship, category } of rows) {
    if (isCategoryLockedForRole(roleName, category)) continue;

    const relationships = grants.get(category) ?? new Set<DataRelationship>();
    relationships.add(relationship);
    grants.set(category, relationships);
  }

  return grants;
}

export async function loadCapabilities(db: Db, effectiveRoles: Set<string>) {
  if (effectiveRoles.size === 0) return new Set<Capability>();

  const rows = await db
    .select({ capability: roleCapabilities.capability })
    .from(roleCapabilities)
    .innerJoin(roles, eq(roleCapabilities.role_id, roles.id))
    .where(inArray(roles.name, Array.from(effectiveRoles)));

  // A capability the code doesn't know about can't guard anything, so it's left out.
  const knownCapabilities = new Set<string>(CAPABILITIES);
  return new Set(
    rows
      .map((row) => row.capability)
      .filter((capability): capability is Capability => knownCapabilities.has(capability)),
  );
}
