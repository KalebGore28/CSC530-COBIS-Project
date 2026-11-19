import { queryOptions } from "@tanstack/react-query";
import type { DataCategory, DataRelationship } from "@/types/access-checks";
import type { ClassLevel, LetterGrade } from "@/utils/student-lookup";

export type { ClassLevel, LetterGrade };

/**
 * Which students Lookup is about, from the Permissions page: students currently in the viewer's
 * department's programs, in programs they coordinate, or both. Students the viewer only sees through
 * a course or as an advisee are left out, since their GPA and level are usually hidden.
 */
export function lookupScope(
  hasRelationship: (category: DataCategory, relationship: DataRelationship) => boolean,
) {
  return {
    department: hasRelationship("identity", "student_in_department"),
    coordinated: hasRelationship("identity", "coordinates_program"),
  };
}

// What the page keeps in the URL, and sends to /api/lookup-students
export type StudentLookupSearch = {
  program?: Array<string>;
  programType?: "major" | "minor";
  course?: Array<string>;
  // Only set when looking for students who haven't taken the courses
  notTaken?: boolean;
  minGrade?: LetterGrade;
  level?: Array<ClassLevel>;
  gpaMin?: number;
  sort?: "gpa";
  page?: number;
};

export type LookupStudent = {
  mnumber: string;
  first_name: string;
  last_name: string;
  suffix: string | null;
  email: string | null;
  // Null when the viewer can't see academic info
  overall_gpa: number | null;
  class_level: ClassLevel | null;
  programs: Array<{ program_id: string; description: string; type: string }>;
};

export type StudentLookupResponse = {
  students: Array<LookupStudent>;
  total: number;
  page: number;
  pageSize: number;
};

export function lookupParams(search: StudentLookupSearch) {
  const params = new URLSearchParams();
  for (const program of search.program ?? []) params.append("program", program);
  if (search.programType) params.set("programType", search.programType);
  for (const course of search.course ?? []) params.append("course", course);
  if (search.notTaken) params.set("courseTaken", "false");
  if (search.minGrade) params.set("minGrade", search.minGrade);
  for (const level of search.level ?? []) params.append("level", level);
  if (search.gpaMin !== undefined) params.set("gpaMin", String(search.gpaMin));
  if (search.sort) params.set("sort", search.sort);
  if (search.page) params.set("page", String(search.page));
  return params;
}

export function studentLookupQuery(search: StudentLookupSearch) {
  return queryOptions({
    queryKey: ["student-lookup", search],
    queryFn: async () => {
      const response = await fetch(`/api/lookup-students?${lookupParams(search).toString()}`);
      const body = (await response.json()) as StudentLookupResponse | { error: string };

      if ("error" in body) throw new Error(body.error);
      return body;
    },
  });
}
