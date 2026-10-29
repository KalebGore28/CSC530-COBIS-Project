/**
 * - Faculty: Access to students enrolled in their courses
 * - Advisor: Access to students they advise
 * - Program Coordinator: Access to students in their programs
 * - Admin Assistant: Access to students in their department.
 * - Department Chair: Access to students in their department's programs
 * - COBIS Administrator: Technically has access to all student data on backend database if they maintain it, but front-end will restrict access unless one of the other roles are present.
 */
export const ROLES = {
  INSTRUCTOR: "instructor", // This role is not required to be passed in user_roles, as it's determined by course assignments
  ADVISOR: "advisor", // This role is not required to be passed in user_roles, as it's determined by advisor assignments
  PROGRAM_COORDINATOR: "program_coordinator",
  ADMIN_ASSISTANT: "admin_assistant",
  DEPARTMENT_CHAIR: "department_chair",
  COBIS_ADMINISTRATOR: "cobis_administrator",
} as const;

export const ACCESS_LEVELS = {
  LIMITED: "limited", // Basic Student Info Only. No grades or GPAs
  COURSE_SCOPED: "course_scoped", // Access to specific student course grades, no GPA access
  FULL: "full", // Full Access to all student data
} as const;

export type TermEntry = {
  accessLevel: (typeof ACCESS_LEVELS)[keyof typeof ACCESS_LEVELS];
  role: (typeof ROLES)[keyof typeof ROLES];
  reason: string;
};

export type TermAccessKey = `${string}:${number}-${string}`; // "M12345:2024-10"

export type CacheEntry = {
  students: Set<string>; // Set of student MNumbers the faculty can at least see limited info for.
  terms: Map<TermAccessKey, TermEntry>;
  timestamp: number;
};

export type FacultyMNumber = string;
