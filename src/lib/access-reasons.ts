import type { DataRelationship } from "@/types/access-checks";

/**
 * Why the viewer can see a student, worked out in the browser from data the page already has.
 * The server decides what's actually visible; this only explains it, using the same relationships
 * as the Permissions page. It's limited to relationships the viewer's roles grant for identity,
 * since that's what lets them see the student at all.
 */

// Most specific first, so a chip shows the reason that sets a student apart
export const ACCESS_REASON_ORDER: ReadonlyArray<DataRelationship> = [
  "advises_student",
  "coordinates_program",
  "teaches_course",
  "student_in_department",
  "course_in_department",
];

export const ACCESS_REASONS: Record<
  DataRelationship,
  // audience: who the relationship covers, for sentences like "Your roles show GPA only for …"
  { label: string; description: string; audience: string }
> = {
  advises_student: {
    label: "Advisee",
    description: "You're their advisor.",
    audience: "your advisees",
  },
  coordinates_program: {
    label: "Your program",
    description: "They're in a program you coordinate.",
    audience: "students in programs you coordinate",
  },
  teaches_course: {
    label: "Your class",
    description: "They're in a section you teach.",
    audience: "students in your classes",
  },
  student_in_department: {
    label: "Dept. student",
    description: "They're in one of your department's programs.",
    audience: "students in your department's programs",
  },
  course_in_department: {
    label: "Dept. course",
    description: "They took a course in your department.",
    audience: "students taking your department's courses",
  },
};

// "a", "a or b", "a, b, or c"
export function listAudiences(relationships: Iterable<DataRelationship>) {
  const audiences = ACCESS_REASON_ORDER.filter((r) => [...relationships].includes(r)).map(
    (r) => ACCESS_REASONS[r].audience,
  );
  if (audiences.length <= 2) return audiences.join(" or ");
  return `${audiences.slice(0, -1).join(", ")}, or ${audiences.at(-1)}`;
}

export type AccessViewer = {
  mnumber: string | null;
  departmentId: string | null;
  // The relationships the viewer's roles grant for identity
  relationships: ReadonlySet<DataRelationship>;
};

export type AccessLookups = {
  programs: ReadonlyMap<string, { department_id: string | null; coordinator: string | null }>;
  courseDepartments: ReadonlyMap<string, string | null>;
};

// What's known about one student, from whatever the page loaded
export type AccessFacts = {
  advisedByViewer: boolean;
  programIds: ReadonlyArray<string>;
  courses: ReadonlyArray<{ course_id: string; instructor_mnumber: string | null }>;
};

export function accessReasons(
  facts: AccessFacts,
  viewer: AccessViewer,
  lookups: AccessLookups,
): Array<DataRelationship> {
  const programs = facts.programIds.map((id) => lookups.programs.get(id));
  const holds: Record<DataRelationship, boolean> = {
    advises_student: facts.advisedByViewer,
    coordinates_program:
      !!viewer.mnumber && programs.some((program) => program?.coordinator === viewer.mnumber),
    teaches_course:
      !!viewer.mnumber &&
      facts.courses.some((course) => course.instructor_mnumber === viewer.mnumber),
    student_in_department:
      !!viewer.departmentId &&
      programs.some((program) => program?.department_id === viewer.departmentId),
    course_in_department:
      !!viewer.departmentId &&
      facts.courses.some(
        (course) => lookups.courseDepartments.get(course.course_id) === viewer.departmentId,
      ),
  };

  return ACCESS_REASON_ORDER.filter(
    (relationship) => viewer.relationships.has(relationship) && holds[relationship],
  );
}

/**
 * The reasons that set each row apart: a reason every row shares, like "Dept. course" on a roster
 * of a department course, explains nothing, so it's left off the chips.
 */
export function distinguishingReasons(
  rows: ReadonlyArray<ReadonlyArray<DataRelationship>>,
): (reasons: ReadonlyArray<DataRelationship>) => Array<DataRelationship> {
  const shared = new Set(rows[0] ?? []);
  for (const reasons of rows.slice(1)) {
    for (const reason of shared) if (!reasons.includes(reason)) shared.delete(reason);
  }
  return (reasons) => reasons.filter((reason) => !shared.has(reason));
}
