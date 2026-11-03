import { and, eq, inArray, useLiveQuery } from "@tanstack/react-db";
import { ENROLLED_STATUSES } from "@/lib/enrolled-statuses";
import { GRADE_POINTS } from "@/types/grades";

import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { programsCollection } from "@/integrations/tanstack-db/programs";
import { registrationStatusCollection } from "@/integrations/tanstack-db/registration-status";
import { studentCoursesCollection } from "@/integrations/tanstack-db/student-courses";
import { studentProgramsCollection } from "@/integrations/tanstack-db/student-programs";
import { studentsCollection } from "@/integrations/tanstack-db/students";
import { termsCollection } from "@/integrations/tanstack-db/terms";

export type RosterTerm = { year: number; term_id: string; description: string };

export type TeachingSection = {
  course_id: string;
  section: string;
  title: string;
  // Only students still registered, not drops or withdrawals
  enrolled: number;
};

export type TeachingTerm = RosterTerm & { sections: Array<TeachingSection> };

export type RosterProgram = { program_id: string; description: string; type: string };

export type RosterStudent = {
  mnumber: string;
  first_name: string;
  last_name: string;
  suffix: string | null;
  email: string | null;
  hours: number;
  enrolled: boolean;
  status: string | null;
  midterm_grade: string | null;
  final_grade: string | null;
  // A hidden grade and one that hasn't been entered are both null, so this tells them apart
  grades_visible: boolean;
  last_attendance: Date | null;
  programs: Array<RosterProgram>;
};

export const LETTER_GRADES = ["A", "B", "C", "D", "E"] as const;
export type LetterGrade = (typeof LETTER_GRADES)[number];

export type GradeSummary = {
  // Average grade points over the letter grades that are in
  average: number | null;
  graded: number;
  counts: Record<LetterGrade, number>;
};

export type RosterSummary = {
  enrolled: number;
  dropped: number;
  credit_hours: number;
  midterm: GradeSummary;
  final: GradeSummary;
};

type Term = { year: number; term_id: string };

function isLaterTerm(a: Term, b: Term) {
  return a.year > b.year || (a.year === b.year && a.term_id > b.term_id);
}

function isLetterGrade(grade: string | null): grade is LetterGrade {
  return LETTER_GRADES.includes(grade as LetterGrade);
}

/**
 * Grades that aren't in yet, or that the viewer can't see, are left out rather than counted as an E.
 */
function summarizeGrades(students: Array<RosterStudent>, which: "midterm" | "final"): GradeSummary {
  const counts: Record<LetterGrade, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  let points = 0;
  let graded = 0;

  for (const student of students) {
    const grade = which === "midterm" ? student.midterm_grade : student.final_grade;
    if (!student.grades_visible || !isLetterGrade(grade)) continue;
    counts[grade] += 1;
    points += GRADE_POINTS[grade];
    graded += 1;
  }

  return { average: graded > 0 ? points / graded : null, graded, counts };
}

/**
 * Every term and section an instructor has taught, newest term first.
 */
export function useTeachingSections(instructorMnumber: string) {
  const { data: rows, isLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ studentCourses: studentCoursesCollection })
        .innerJoin({ courses: coursesCollection }, ({ studentCourses, courses }) =>
          eq(studentCourses.course_id, courses.id),
        )
        .leftJoin({ terms: termsCollection }, ({ studentCourses, terms }) =>
          eq(studentCourses.term_id, terms.id),
        )
        .where(({ studentCourses }) => eq(studentCourses.instructor_mnumber, instructorMnumber))
        .select(({ studentCourses, courses, terms }) => ({
          year: studentCourses.year,
          term_id: studentCourses.term_id,
          term_description: terms?.description,
          course_id: studentCourses.course_id,
          section: studentCourses.course_section,
          title: courses.title,
          status_id: studentCourses.registration_status_id,
        })),
  });

  // Rows are one per student, so they're grouped into terms and their sections here
  const termsByKey = new Map<string, TeachingTerm>();
  for (const row of rows) {
    const termKey = `${row.year}-${row.term_id}`;
    let term = termsByKey.get(termKey);
    if (!term) {
      term = {
        year: row.year,
        term_id: row.term_id,
        description: row.term_description ?? row.term_id,
        sections: [],
      };
      termsByKey.set(termKey, term);
    }

    let section = term.sections.find(
      (s) => s.course_id === row.course_id && s.section === row.section,
    );
    if (!section) {
      section = { course_id: row.course_id, section: row.section, title: row.title, enrolled: 0 };
      term.sections.push(section);
    }
    if (ENROLLED_STATUSES.includes(row.status_id ?? "")) section.enrolled += 1;
  }

  const terms = [...termsByKey.values()].sort((a, b) => (isLaterTerm(a, b) ? -1 : 1));
  for (const term of terms) {
    term.sections.sort(
      (a, b) => a.course_id.localeCompare(b.course_id) || a.section.localeCompare(b.section),
    );
  }

  return { terms, isLoading };
}

/**
 * One section's students, with their programs and the class's grade summary.
 * Drops and withdrawals are included, marked by `enrolled`, so the page can choose to show them.
 */
export function useSectionRoster(
  instructorMnumber: string,
  term: Term,
  courseId: string,
  section: string,
) {
  const { data: registrations, isLoading: rosterLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ studentCourses: studentCoursesCollection })
        // Inner, so a row only shows once its student has loaded and never has a blank name
        .innerJoin({ students: studentsCollection }, ({ studentCourses, students }) =>
          eq(studentCourses.mnumber, students.mnumber),
        )
        .leftJoin({ statuses: registrationStatusCollection }, ({ studentCourses, statuses }) =>
          eq(studentCourses.registration_status_id, statuses.id),
        )
        .where(({ studentCourses }) =>
          and(
            eq(studentCourses.instructor_mnumber, instructorMnumber),
            eq(studentCourses.year, term.year),
            eq(studentCourses.term_id, term.term_id),
            eq(studentCourses.course_id, courseId),
            eq(studentCourses.course_section, section),
          ),
        )
        .select(({ studentCourses, students, statuses }) => ({
          mnumber: studentCourses.mnumber,
          first_name: students.first_name,
          last_name: students.last_name,
          suffix: students.suffix,
          email: students.email,
          hours: studentCourses.course_hours,
          status_id: studentCourses.registration_status_id,
          status: statuses?.description,
          midterm_grade: studentCourses.midterm_grade,
          final_grade: studentCourses.final_grade,
          grades_visible: studentCourses.grades_visible,
          last_attendance: studentCourses.last_attendance,
        })),
  });

  const mnumbers = registrations.map((registration) => registration.mnumber);

  const { data: programRows, isLoading: programsLoading } = useLiveQuery({
    query: (q) =>
      q
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
        })),
  });

  // The programs each student had when they took the class, or their newest if that term wasn't imported
  const newestAtOrBefore = new Map<string, Term>();
  const newestOverall = new Map<string, Term>();
  for (const row of programRows) {
    const overall = newestOverall.get(row.mnumber);
    if (!overall || isLaterTerm(row, overall)) newestOverall.set(row.mnumber, row);

    if (isLaterTerm(row, term)) continue;
    const atOrBefore = newestAtOrBefore.get(row.mnumber);
    if (!atOrBefore || isLaterTerm(row, atOrBefore)) newestAtOrBefore.set(row.mnumber, row);
  }
  const programTerm = (mnumber: string) =>
    newestAtOrBefore.get(mnumber) ?? newestOverall.get(mnumber);

  const students: Array<RosterStudent> = registrations
    .map((registration) => {
      const chosenTerm = programTerm(registration.mnumber);
      return {
        mnumber: registration.mnumber,
        first_name: registration.first_name,
        last_name: registration.last_name,
        suffix: registration.suffix,
        email: registration.email,
        hours: registration.hours,
        enrolled: ENROLLED_STATUSES.includes(registration.status_id ?? ""),
        status: registration.status ?? null,
        midterm_grade: registration.midterm_grade,
        final_grade: registration.final_grade,
        grades_visible: registration.grades_visible,
        last_attendance: registration.last_attendance,
        programs: programRows
          .filter(
            (row) =>
              row.mnumber === registration.mnumber &&
              row.year === chosenTerm?.year &&
              row.term_id === chosenTerm.term_id,
          )
          // Majors before minors
          .sort((a, b) => a.type.localeCompare(b.type))
          .map(({ program_id, description, type }) => ({ program_id, description, type })),
      };
    })
    .sort(
      (a, b) => a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name),
    );

  const enrolledStudents = students.filter((student) => student.enrolled);
  const summary: RosterSummary = {
    enrolled: enrolledStudents.length,
    dropped: students.length - enrolledStudents.length,
    credit_hours: enrolledStudents.reduce((total, student) => total + student.hours, 0),
    // Only enrolled students count toward the class's grades
    midterm: summarizeGrades(enrolledStudents, "midterm"),
    final: summarizeGrades(enrolledStudents, "final"),
  };

  return { students, summary, isLoading: rosterLoading || programsLoading };
}
