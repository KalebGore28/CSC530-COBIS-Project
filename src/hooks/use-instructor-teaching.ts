import { eq, useLiveQuery } from "@tanstack/react-db";
import { ENROLLED_STATUSES, W_STATUSES } from "@/lib/enrolled-statuses";
import { GRADE_POINTS } from "@/types/grades";
import { LETTER_GRADES } from "@/hooks/use-roster";
import type { LetterGrade } from "@/hooks/use-roster";

import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { studentCoursesCollection } from "@/integrations/tanstack-db/student-courses";
import { termsCollection } from "@/integrations/tanstack-db/terms";

type Term = { year: number; term_id: string };

export type TaughtTerm = Term & { description: string };

/**
 * Grades and outcomes for a group of registrations: a section, a term, a course, or all of them.
 * - counts: final letter grades, plus W for withdrawals that leave one
 * - gpa: the average grade points of the letter grades that are in
 * - dfw_rate: the share of students who finished with a D, an E or a W
 */
export type GradeBreakdown = {
  enrolled: number;
  withdrawn: number;
  graded: number;
  counts: Record<LetterGrade | "W", number>;
  gpa: number | null;
  dfw_rate: number | null;
};

export type TaughtSection = TaughtTerm & {
  course_id: string;
  section: string;
  title: string;
  credit_hours: number;
  grades: GradeBreakdown;
};

export type GradeGroup = { key: string; label: string; grades: GradeBreakdown };

type Registration = {
  mnumber: string;
  year: number;
  term_id: string;
  term_description: string | undefined;
  course_id: string;
  section: string;
  title: string;
  hours: number;
  status_id: string | null;
  final_grade: string | null;
  grades_visible: boolean;
};

function termKey(term: Term) {
  return `${term.year}-${term.term_id}`;
}

function isLaterTerm(a: Term, b: Term) {
  return a.year > b.year || (a.year === b.year && a.term_id > b.term_id);
}

function isEnrolled(registration: Registration) {
  return ENROLLED_STATUSES.includes(registration.status_id ?? "");
}

function isWithdrawnWithW(registration: Registration) {
  return W_STATUSES.includes(registration.status_id ?? "");
}

function breakdown(registrations: Array<Registration>): GradeBreakdown {
  const counts: Record<LetterGrade | "W", number> = { A: 0, B: 0, C: 0, D: 0, E: 0, W: 0 };
  let enrolled = 0;
  let graded = 0;
  let points = 0;

  for (const registration of registrations) {
    if (isWithdrawnWithW(registration)) {
      counts.W += 1;
      continue;
    }
    if (!isEnrolled(registration)) continue;
    enrolled += 1;

    // Grades the viewer can't see, or that aren't in yet, are left out rather than counted as an E
    const grade = registration.final_grade as LetterGrade | null;
    if (!registration.grades_visible || !grade || !LETTER_GRADES.includes(grade)) continue;
    counts[grade] += 1;
    points += GRADE_POINTS[grade];
    graded += 1;
  }

  // DFW is out of the students who finished with a grade or a W, so classes still in progress don't drag it down
  const finished = graded + counts.W;
  return {
    enrolled,
    withdrawn: counts.W,
    graded,
    counts,
    gpa: graded > 0 ? points / graded : null,
    dfw_rate: finished > 0 ? (counts.D + counts.E + counts.W) / finished : null,
  };
}

/**
 * Everything one instructor has taught, for a range of terms.
 * The range ends are term keys like "2025-80", straight from the URL. A missing or unknown end falls back
 * to the other end, or to the newest term, and a range picked backwards is read the right way around.
 * All of the instructor's registrations load once, so changing the range doesn't fetch again.
 */
export function useInstructorTeaching(instructorMnumber: string, fromKey?: string, toKey?: string) {
  const { data: registrations, isLoading } = useLiveQuery({
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
          mnumber: studentCourses.mnumber,
          year: studentCourses.year,
          term_id: studentCourses.term_id,
          term_description: terms?.description,
          course_id: studentCourses.course_id,
          section: studentCourses.course_section,
          title: courses.title,
          hours: studentCourses.course_hours,
          status_id: studentCourses.registration_status_id,
          final_grade: studentCourses.final_grade,
          grades_visible: studentCourses.grades_visible,
        })),
  });

  // Every term taught, newest first, for the range pickers
  const termsByKey = new Map<string, TaughtTerm>();
  for (const registration of registrations) {
    termsByKey.set(termKey(registration), {
      year: registration.year,
      term_id: registration.term_id,
      description: registration.term_description ?? registration.term_id,
    });
  }
  const terms = [...termsByKey.values()].sort((a, b) => (isLaterTerm(a, b) ? -1 : 1));

  const from = terms.find((term) => termKey(term) === fromKey);
  const to = terms.find((term) => termKey(term) === toKey);
  let rangeEnd = to ?? from ?? terms[0];
  let rangeStart = from ?? rangeEnd;
  if (rangeStart && rangeEnd && isLaterTerm(rangeStart, rangeEnd)) {
    [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
  }
  const inRange = registrations.filter(
    (registration) =>
      !!rangeStart &&
      !!rangeEnd &&
      !isLaterTerm(rangeStart, registration) &&
      !isLaterTerm(registration, rangeEnd),
  );

  const sectionGroups = new Map<string, Array<Registration>>();
  for (const registration of inRange) {
    const key = `${termKey(registration)}-${registration.course_id}-${registration.section}`;
    sectionGroups.set(key, [...(sectionGroups.get(key) ?? []), registration]);
  }
  const sections: Array<TaughtSection> = [...sectionGroups.values()]
    .map((group) => {
      const first = group[0];
      return {
        year: first.year,
        term_id: first.term_id,
        description: first.term_description ?? first.term_id,
        course_id: first.course_id,
        section: first.section,
        title: first.title,
        credit_hours: group
          .filter(isEnrolled)
          .reduce((total, registration) => total + registration.hours, 0),
        grades: breakdown(group),
      };
    })
    .sort(
      (a, b) =>
        (isLaterTerm(a, b) ? -1 : isLaterTerm(b, a) ? 1 : 0) ||
        a.course_id.localeCompare(b.course_id) ||
        a.section.localeCompare(b.section),
    );

  const termGroups = new Map<string, Array<Registration>>();
  const courseGroups = new Map<string, Array<Registration>>();
  for (const registration of inRange) {
    const term = termKey(registration);
    termGroups.set(term, [...(termGroups.get(term) ?? []), registration]);
    courseGroups.set(registration.course_id, [
      ...(courseGroups.get(registration.course_id) ?? []),
      registration,
    ]);
  }

  const byTerm: Array<GradeGroup> = [...termGroups.entries()]
    .map(([key, group]) => ({
      key,
      label: `${group[0].term_description ?? group[0].term_id} ${group[0].year}`,
      grades: breakdown(group),
      term: group[0] as Term,
    }))
    // Oldest first, so the chart reads left to right
    .sort((a, b) => (isLaterTerm(a.term, b.term) ? 1 : -1))
    .map(({ key, label, grades }) => ({ key, label, grades }));

  const byCourse: Array<GradeGroup> = [...courseGroups.entries()]
    .map(([key, group]) => ({ key, label: `${key} · ${group[0].title}`, grades: breakdown(group) }))
    .sort((a, b) => a.key.localeCompare(b.key));

  const summary = {
    sections: sections.length,
    // Different students, so someone in two of the instructor's classes counts once
    students: new Set(inRange.filter(isEnrolled).map((registration) => registration.mnumber)).size,
    credit_hours: sections.reduce((total, section) => total + section.credit_hours, 0),
    grades: breakdown(inRange),
  };

  return {
    terms,
    range: rangeStart && rangeEnd ? { from: rangeStart, to: rangeEnd } : null,
    sections,
    byTerm,
    byCourse,
    summary,
    isLoading,
  };
}
