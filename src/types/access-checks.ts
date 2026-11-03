/**
 * - Faculty: Access to students enrolled in their courses
 * - Advisor: Access to students they advise
 * - Program Coordinator: Access to students in their programs
 * - Admin Assistant: Access to students in their department.
 * - Department Chair: Access to students in their department's programs
 * - COBIS Administrator: Technically has access to all student data on backend database if they maintain it, but front-end will restrict access unless one of the other roles are present.
 */
export const ROLES = {
  FACULTY: "faculty", // This role is not required to be passed in user_roles, as it's determined by course assignments
  INSTRUCTOR: "instructor", // This role is not required to be passed in user_roles, as it's determined by course assignments
  ADVISOR: "advisor", // This role is not required to be passed in user_roles, as it's determined by advisor assignments
  PROGRAM_COORDINATOR: "program_coordinator",
  ADMIN_ASSISTANT: "admin_assistant",
  DEPARTMENT_CHAIR: "department_chair",
  COBIS_ADMINISTRATOR: "cobis_administrator",
} as const;

/**
 * How a user is connected to a student or course row. Each value is enforced by code,
 * so adding one requires a migration and a build. Which roles use it is stored in role_data_access.
 */
export const DATA_RELATIONSHIPS = [
  "teaches_course",
  "course_in_department",
  "advises_student",
  "coordinates_program",
  "student_in_department",
] as const;

/**
 * The groups of student data a role can be granted. Each value is enforced by code,
 * so adding one requires a migration and a build. Which roles use it is stored in role_data_access.
 */
export const DATA_CATEGORIES = [
  "identity", // students: name and email
  "demographics", // students: gender
  "programs", // student_programs
  "courses", // student_courses: course, section and status
  "grades", // student_courses: midterm and final grades
  "attendance", // student_courses: last attendance
  "academic_info", // student_academic_info: GPA, hours and standing
  "advisors", // student_advisors
] as const;

// The app features a role can be given. Which roles have them is stored in role_capabilities.
export const CAPABILITIES = [
  "roster.view",
  "advisees.view",
  "student.lookup",
  "instructors.view",
  "enrollment.view",
  "tools.manage",
] as const;

export type Capability = (typeof CAPABILITIES)[number];
export type DataRelationship = (typeof DATA_RELATIONSHIPS)[number];
export type DataCategory = (typeof DATA_CATEGORIES)[number];

// FERPA: an admin assistant's department access can never include these, whatever role_data_access says.
// Their own classes and advisees still work, since those come through the faculty and advisor roles.
const ADMIN_ASSISTANT_BLOCKED_CATEGORIES: ReadonlyArray<DataCategory> = [
  "grades",
  "academic_info",
  "attendance",
];

export function isCategoryLockedForRole(roleName: string, category: DataCategory) {
  return (
    roleName === ROLES.ADMIN_ASSISTANT && ADMIN_ASSISTANT_BLOCKED_CATEGORIES.includes(category)
  );
}

// Removing this would leave nobody able to open the permissions page to put it back.
export function isCapabilityLockedForRole(roleName: string, capability: Capability) {
  return roleName === ROLES.COBIS_ADMINISTRATOR && capability === "tools.manage";
}
