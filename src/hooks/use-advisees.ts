import { useLiveQuery } from "@tanstack/react-db";

import {
  academicInfoQuery,
  advisorStudentsQuery,
  enrolledHoursQuery,
  studentProgramsQuery,
} from "@/queries/students";

type Term = { year: number; term_id: string };

export type ClassLevel = "Freshman" | "Sophomore" | "Junior" | "Senior" | "Graduate";

export type AdviseeProgram = {
  program_id: string;
  description: string;
  type: string;
};

export type Advisee = {
  mnumber: string;
  first_name: string;
  last_name: string;
  suffix: string | null;
  email: string | null;
  programs: Array<AdviseeProgram>;
  class_level: ClassLevel | null;
  overall_gpa: number | null;
  standing_id: string | null;
  standing: string | null;
  // Enrolled hours this term, not counting drops or withdrawals
  hours: number;
  low_gpa: boolean;
  needs_standing_review: boolean;
  not_registered: boolean;
};

// Below this, a student is usually put on probation
export const LOW_GPA = 2;

// Good standing and the Dean's List don't need an advisor's attention
const GOOD_STANDINGS = ["0", "GS", "DL"];

// Undergraduate class level by earned hours, the same thresholds as Student Lookup
function classLevel(earnedHours: number | null, isGraduate: boolean): ClassLevel | null {
  if (isGraduate) return "Graduate";
  if (earnedHours === null) return null;
  if (earnedHours < 30) return "Freshman";
  if (earnedHours < 60) return "Sophomore";
  if (earnedHours < 90) return "Junior";
  return "Senior";
}

function isLaterTerm(a: Term, b: Term) {
  return a.year > b.year || (a.year === b.year && a.term_id > b.term_id);
}

/**
 * The advisor's students for a term, with what an advisor checks first.
 *
 * Each piece is its own small query, matched up by M-Number afterwards. Rows always come from
 * student_advisors, so a student whose other data hasn't loaded yet still has a real M-Number.
 * Academic info and programs use each student's newest term, since a term's records aren't always imported together.
 */
export function useAdvisees(advisorMnumber: string, term: Term) {
  const { data: assignments, isLoading: assignmentsLoading } = useLiveQuery({
    query: advisorStudentsQuery(advisorMnumber, term),
  });

  const mnumbers = assignments.map((assignment) => assignment.mnumber);

  const { data: academicInfo, isLoading: academicInfoLoading } = useLiveQuery({
    query: academicInfoQuery(mnumbers),
  });

  const { data: programs, isLoading: programsLoading } = useLiveQuery({
    query: studentProgramsQuery(mnumbers),
  });

  const { data: enrolledHours, isLoading: hoursLoading } = useLiveQuery({
    query: enrolledHoursQuery(mnumbers, term),
  });

  // Each student's newest academic info row
  const latestInfo = new Map<string, (typeof academicInfo)[number]>();
  for (const info of academicInfo) {
    const current = latestInfo.get(info.mnumber);
    if (!current || isLaterTerm(info, current)) latestInfo.set(info.mnumber, info);
  }

  // Each student's newest term of declared programs, since older terms may list a program they've since changed
  const latestProgramTerm = new Map<string, Term>();
  for (const program of programs) {
    const current = latestProgramTerm.get(program.mnumber);
    if (!current || isLaterTerm(program, current)) latestProgramTerm.set(program.mnumber, program);
  }

  const hoursByStudent = new Map(enrolledHours.map((row) => [row.mnumber, row.hours]));

  const advisees: Array<Advisee> = assignments.map((assignment) => {
    const info = latestInfo.get(assignment.mnumber);
    const programTerm = latestProgramTerm.get(assignment.mnumber);
    const currentPrograms = programs.filter(
      (program) =>
        program.mnumber === assignment.mnumber &&
        program.year === programTerm?.year &&
        program.term_id === programTerm.term_id,
    );
    const isGraduate = currentPrograms.some((program) => program.level !== "UG");
    const hours = hoursByStudent.get(assignment.mnumber) ?? 0;
    const gpa = info?.overall_gpa ?? null;
    const standingId = info?.standing_id ?? null;

    return {
      ...assignment,
      programs: currentPrograms
        // Majors before minors
        .sort((a, b) => a.type.localeCompare(b.type))
        .map(({ program_id, description, type }) => ({ program_id, description, type })),
      class_level: classLevel(info?.overall_earned_hours ?? null, isGraduate),
      overall_gpa: gpa,
      standing_id: standingId,
      standing: info?.standing ?? null,
      hours,
      low_gpa: gpa !== null && gpa < LOW_GPA,
      needs_standing_review: standingId !== null && !GOOD_STANDINGS.includes(standingId),
      not_registered: hours === 0,
    };
  });

  return {
    advisees,
    isLoading: assignmentsLoading || academicInfoLoading || programsLoading || hoursLoading,
  };
}
