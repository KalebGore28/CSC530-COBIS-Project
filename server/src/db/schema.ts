// src/db/schema.ts

import * as academicStanding from './models/academic_standing';
import * as admitCodes from './models/admit_codes';
import * as advisors from './models/advisors';
import * as collegeCodes from './models/college_codes';
import * as colleges from './models/colleges';
import * as courses from './models/courses';
import * as departments from './models/departments';
import * as imports from './models/imports';
import * as instructionalMethods from './models/instructional_methods';
import * as instructorCourses from './models/instructor_courses';
import * as nations from './models/nations';
import * as overrides from './models/overrides';
import * as partOfTerm from './models/part_of_term';
import * as permissions from './models/permissions';
import * as previousColleges from './models/previous_colleges';
import * as programs from './models/programs';
import * as registrationStatus from './models/registration_status';
import * as rolePermissions from './models/role_permissions';
import * as roles from './models/roles';
import * as studentAcademicInfo from './models/student_academic_info';
import * as studentAddresses from './models/student_addresses';
import * as studentAdvisors from './models/student_advisors';
import * as studentCourses from './models/student_courses';
import * as studentPrograms from './models/student_programs';
import * as studentTypes from './models/student_types';
import * as students from './models/students';
import * as subjectPrefixes from './models/subject_prefixes';
import * as terms from './models/terms';
import * as test_scores from './models/test_scores';
import * as userPermissions from './models/user_permissions';
import * as userRoles from './models/user_roles';
import * as betterAuth from './models/betterAuth';

export * from './models/academic_standing';
export * from './models/admit_codes';
export * from './models/advisors';
export * from './models/college_codes';
export * from './models/colleges';
export * from './models/courses';
export * from './models/departments';
export * from './models/imports';
export * from './models/instructional_methods';
export * from './models/instructor_courses';
export * from './models/nations';
export * from './models/overrides';
export * from './models/part_of_term';
export * from './models/permissions';
export * from './models/previous_colleges';
export * from './models/programs';
export * from './models/registration_status';
export * from './models/role_permissions';
export * from './models/roles';
export * from './models/student_academic_info';
export * from './models/student_addresses';
export * from './models/student_advisors';
export * from './models/student_courses';
export * from './models/student_programs';
export * from './models/student_types';
export * from './models/students';
export * from './models/subject_prefixes';
export * from './models/terms';
export * from './models/test_scores';
export * from './models/user_permissions';
export * from './models/user_roles';
export * from './models/betterAuth';

export const schema = {
	academicStanding,
	admitCodes,
	advisors,
	collegeCodes,
	colleges,
	courses,
	departments,
	imports,
	instructionalMethods,
	instructorCourses,
	nations,
	overrides,
	partOfTerm,
	permissions,
	previousColleges,
	programs,
	registrationStatus,
	rolePermissions,
	roles,
	studentAcademicInfo,
	studentAddresses,
	studentAdvisors,
	studentCourses,
	studentPrograms,
	studentTypes,
	students,
	subjectPrefixes,
	terms,
	test_scores,
	userPermissions,
	userRoles,
	betterAuth,
};