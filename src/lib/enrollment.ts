import { queryOptions } from "@tanstack/react-query";
import type {
  EnrollmentTerm,
  getCourseEnrollments,
  getEnrollmentSummary,
  getInstructorEnrollments,
  getProgramEnrollments,
} from "@/utils/enrollment-counts";

export type { EnrollmentTerm };
export type EnrollmentSummary = Awaited<ReturnType<typeof getEnrollmentSummary>>;
export type CourseEnrollment = Awaited<ReturnType<typeof getCourseEnrollments>>[number];
export type InstructorEnrollment = Awaited<ReturnType<typeof getInstructorEnrollments>>[number];
export type ProgramEnrollment = Awaited<ReturnType<typeof getProgramEnrollments>>[number];

export type EnrollmentResponse = {
  terms: Array<EnrollmentTerm>;
  // Null when the department has no enrollments yet
  term: EnrollmentTerm | null;
  summary?: EnrollmentSummary;
  courses?: Array<CourseEnrollment>;
  instructors?: Array<InstructorEnrollment>;
  programs?: Array<ProgramEnrollment>;
};

/**
 * The department's enrollment for a term, or for the newest term when none is given.
 */
export function enrollmentQuery(term?: EnrollmentTerm) {
  return queryOptions({
    queryKey: ["enrollment", term?.year ?? "latest", term?.term_id ?? "latest"],
    queryFn: async () => {
      const params = term ? `?year=${term.year}&term_id=${term.term_id}` : "";
      const response = await fetch(`/api/enrollment${params}`);
      const body = (await response.json()) as EnrollmentResponse | { error: string };

      if ("error" in body) throw new Error(body.error);
      return body;
    },
    // Enrollment only changes when a file is imported, which is about weekly
    staleTime: 1000 * 60 * 5,
  });
}

// The same term a year earlier, which is what enrollment is compared against
export function previousYearTerm(term: EnrollmentTerm): EnrollmentTerm {
  return { year: term.year - 1, term_id: term.term_id };
}
