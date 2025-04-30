// src/db/schema.ts

import * as academicStanding from './models/academic-standing';
import * as admitCodes from './models/admit-codes';
import * as colleges from './models/colleges';
import * as courses from './models/courses';
import * as departments from './models/departments';
import * as imports from './models/imports';
import * as instructionalMethods from './models/instructional-methods';
import * as instructorCourses from './models/instructor-courses';
import * as faculty from './models/faculty';
import * as nations from './models/nations';
import * as overrides from './models/overrides';
import * as partOfTerm from './models/part-of-term';
import * as programs from './models/programs';
import * as registrationStatus from './models/registration-status';
import * as roles from './models/roles';
import * as studentAcademicInfo from './models/student-academic-info';
import * as studentAddresses from './models/student-addresses';
import * as studentAdvisors from './models/student-advisors';
import * as studentCourses from './models/student-courses';
import * as studentPrograms from './models/student-programs';
import * as students from './models/students';
import * as terms from './models/terms';
import * as testScores from './models/test_scores';
import * as userRoles from './models/user_roles';
import * as betterAuth from './models/betterAuth';

export * from './models/academic-standing';
export * from './models/admit-codes';
export * from './models/colleges';
export * from './models/courses';
export * from './models/departments';
export * from './models/imports';
export * from './models/instructional-methods';
export * from './models/instructor-courses';
export * from './models/faculty';
export * from './models/nations';
export * from './models/overrides';
export * from './models/part-of-term';
export * from './models/programs';
export * from './models/registration-status';
export * from './models/roles';
export * from './models/student-academic-info';
export * from './models/student-addresses';
export * from './models/student-advisors';
export * from './models/student-courses';
export * from './models/student-programs';
export * from './models/students';
export * from './models/terms';
export * from './models/test_scores';
export * from './models/user_roles';
export * from './models/betterAuth';

export const schema = {
	academicStanding,
	admitCodes,
	colleges,
	courses,
	departments,
	imports,
	instructionalMethods,
	instructorCourses,
	faculty,
	nations,
	overrides,
	partOfTerm,
	programs,
	registrationStatus,
	roles,
	studentAcademicInfo,
	studentAddresses,
	studentAdvisors,
	studentCourses,
	studentPrograms,
	students,
	terms,
	testScores,
	userRoles,
	betterAuth,
};