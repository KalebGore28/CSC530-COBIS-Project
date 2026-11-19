import { Query, and, eq, inArray, sum } from "@tanstack/react-db";
import { ENROLLED_STATUSES } from "@/lib/enrolled-statuses";

import { academicStandingCollection } from "@/integrations/tanstack-db/academic-standing";
import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { programsCollection } from "@/integrations/tanstack-db/programs";
import { registrationStatusCollection } from "@/integrations/tanstack-db/registration-status";
import { studentAcademicInfoCollection } from "@/integrations/tanstack-db/student-academic-info";
import { studentAdvisorsCollection } from "@/integrations/tanstack-db/student-advisors";
import { studentCoursesCollection } from "@/integrations/tanstack-db/student-courses";
import { studentProgramsCollection } from "@/integrations/tanstack-db/student-programs";
import { studentsCollection } from "@/integrations/tanstack-db/students";
import { termsCollection } from "@/integrations/tanstack-db/terms";

type Term = { year: number; term_id: string };

/**
 * The students assigned to an advisor for a term, with their names and email.
 */
export function advisorStudentsQuery(advisorMnumber: string, term: Term) {
  return new Query()
    .from({ advisors: studentAdvisorsCollection })
    .innerJoin({ students: studentsCollection }, ({ advisors, students }) =>
      eq(advisors.mnumber, students.mnumber),
    )
    .where(({ advisors }) =>
      and(
        eq(advisors.advisor_mnumber, advisorMnumber),
        eq(advisors.year, term.year),
        eq(advisors.term_id, term.term_id),
      ),
    )
    .select(({ advisors, students }) => ({
      mnumber: advisors.mnumber,
      first_name: students.first_name,
      last_name: students.last_name,
      suffix: students.suffix,
      email: students.email,
    }));
}

/**
 * Every term of declared programs for these students, with each program's name.
 * Rows cover all terms, so callers pick the term they need.
 */
export function studentProgramsQuery(mnumbers: Array<string>) {
  return new Query()
    .from({ studentPrograms: studentProgramsCollection })
    .innerJoin({ programs: programsCollection }, ({ studentPrograms, programs }) =>
      eq(studentPrograms.program_id, programs.id),
    )
    .where(({ studentPrograms }) => inArray(studentPrograms.mnumber, mnumbers))
    .select(({ studentPrograms, programs }) => ({
      mnumber: studentPrograms.mnumber,
      year: studentPrograms.year,
      term_id: studentPrograms.term_id,
      program_id: studentPrograms.program_id,
      description: programs.description,
      type: studentPrograms.type,
      level: studentPrograms.level,
    }));
}

/**
 * Every term of academic info for these students, with the standing's name.
 */
export function academicInfoQuery(mnumbers: Array<string>) {
  return new Query()
    .from({ info: studentAcademicInfoCollection })
    .leftJoin({ standing: academicStandingCollection }, ({ info, standing }) =>
      eq(info.academic_standing_id, standing.id),
    )
    .where(({ info }) => inArray(info.mnumber, mnumbers))
    .select(({ info, standing }) => ({
      mnumber: info.mnumber,
      year: info.year,
      term_id: info.term_id,
      overall_gpa: info.overall_gpa,
      overall_earned_hours: info.overall_earned_hours,
      standing_id: info.academic_standing_id,
      standing: standing?.description,
    }));
}

/**
 * Each student's enrolled hours for a term, not counting drops or withdrawals.
 * A student with no enrolled courses has no row.
 */
export function enrolledHoursQuery(mnumbers: Array<string>, term: Term) {
  return new Query()
    .from({ courses: studentCoursesCollection })
    .where(({ courses }) =>
      and(
        inArray(courses.mnumber, mnumbers),
        eq(courses.year, term.year),
        eq(courses.term_id, term.term_id),
        inArray(courses.registration_status_id, ENROLLED_STATUSES),
      ),
    )
    .groupBy(({ courses }) => courses.mnumber)
    .select(({ courses }) => ({
      mnumber: courses.mnumber,
      hours: sum(courses.course_hours),
    }));
}

/**
 * One student's GPA and earned hours for every term, oldest first.
 */
export function gpaHistoryQuery(mnumber: string) {
  return new Query()
    .from({ info: studentAcademicInfoCollection })
    .leftJoin({ terms: termsCollection }, ({ info, terms }) => eq(info.term_id, terms.id))
    .where(({ info }) => eq(info.mnumber, mnumber))
    .orderBy(({ info }) => info.year, "asc")
    .orderBy(({ info }) => info.term_id, "asc")
    .select(({ info, terms }) => ({
      year: info.year,
      term_id: info.term_id,
      term_description: terms?.description,
      overall_gpa: info.overall_gpa,
      msu_gpa: info.msu_gpa,
      overall_earned_hours: info.overall_earned_hours,
    }));
}

/**
 * One student's courses for a term, drops and withdrawals included, with grades and status.
 */
export function termCoursesQuery(mnumber: string, term: Term) {
  return new Query()
    .from({ studentCourses: studentCoursesCollection })
    .innerJoin({ courses: coursesCollection }, ({ studentCourses, courses }) =>
      eq(studentCourses.course_id, courses.id),
    )
    .leftJoin({ statuses: registrationStatusCollection }, ({ studentCourses, statuses }) =>
      eq(studentCourses.registration_status_id, statuses.id),
    )
    .where(({ studentCourses }) =>
      and(
        eq(studentCourses.mnumber, mnumber),
        eq(studentCourses.year, term.year),
        eq(studentCourses.term_id, term.term_id),
      ),
    )
    .orderBy(({ studentCourses }) => studentCourses.course_id, "asc")
    .select(({ studentCourses, courses, statuses }) => ({
      course_id: studentCourses.course_id,
      section: studentCourses.course_section,
      title: courses.title,
      hours: studentCourses.course_hours,
      status_id: studentCourses.registration_status_id,
      status: statuses?.description,
      midterm_grade: studentCourses.midterm_grade,
      final_grade: studentCourses.final_grade,
      grades_visible: studentCourses.grades_visible,
    }));
}
