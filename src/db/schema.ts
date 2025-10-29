import { mysqlTable, varchar, boolean, datetime, int, real, primaryKey, foreignKey, check } from 'drizzle-orm/mysql-core';
import { sql } from "drizzle-orm";

export const academicStanding = mysqlTable("academic_standing", {
	code: varchar("code", { length: 10 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
});

export const admitCodes = mysqlTable("admit_codes", {
	code: varchar("code", { length: 10 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
});

// --- BETTERAUTH TABLES ---

export const user = mysqlTable("user", {
	id: varchar("id", { length: 50 }).primaryKey(), // Needed for BetterAuth
	mnumber: varchar("mnumber", { length: 10 }).unique(), // Nullable initially, unique when set
	name: varchar('name', { length: 50 }).notNull(),
	email: varchar('email', { length: 100 }).notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: varchar('image', { length: 255 }).notNull().default(''), // Default to empty string if no image
	createdAt: datetime('created_at').notNull(),
	updatedAt: datetime('updated_at').notNull(),
	isEnabled: boolean('is_enabled').notNull().default(false), // For security reasons, we'll default to false
	lastLogin: datetime('last_login'), // Default to current time
});

export const session = mysqlTable("session", {
	id: varchar("id", { length: 50 }).primaryKey(),
	expiresAt: datetime('expires_at').notNull(),
	token: varchar('token', { length: 255 }).notNull().unique(),
	createdAt: datetime('created_at').notNull(),
	updatedAt: datetime('updated_at').notNull(),
	ipAddress: varchar('ip_address', { length: 45 }),
	userAgent: varchar('user_agent', { length: 255 }),
	userId: varchar('user_id', { length: 50 }).notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = mysqlTable("account", {
	id: varchar("id", { length: 50 }).primaryKey(),
	accountId: varchar('account_id', { length: 255 }).notNull(),
	providerId: varchar('provider_id', { length: 255 }).notNull(),
	userId: varchar('user_id', { length: 50 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: varchar('access_token', { length: 2048 }),
	refreshToken: varchar('refresh_token', { length: 2048 }),
	idToken: varchar('id_token', { length: 2048 }),
	accessTokenExpiresAt: datetime('access_token_expires_at'),
	refreshTokenExpiresAt: datetime('refresh_token_expires_at'),
	scope: varchar('scope', { length: 255 }),
	createdAt: datetime('created_at').notNull(),
	updatedAt: datetime('updated_at').notNull()
});

export const verification = mysqlTable("verification", {
	id: varchar("id", { length: 50 }).primaryKey(),
	identifier: varchar('identifier', { length: 255 }).notNull(),
	value: varchar('value', { length: 2048 }).notNull(),
	expiresAt: datetime('expires_at').notNull(),
	createdAt: datetime('created_at').notNull(),
	updatedAt: datetime('updated_at').notNull()
});

// --- END BETTERAUTH TABLES ---

export const colleges = mysqlTable("colleges", {
	code: varchar("code", { length: 10 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
});

export const courses = mysqlTable("courses", {
	subject: varchar("subject", { length: 50 }).notNull(), // e.g. "ACC"
	number: int("number").notNull(),
	suffix: varchar("suffix", { length: 50 }).notNull().default(""), // e.g. "T" for "101T", default to empty string
	title: varchar("title", { length: 255 }).notNull(),
	hours: int("hours").notNull(),
	last_updated: datetime("last_updated").notNull().default(sql`NOW()`),
	department_code: varchar("department_code", { length: 10 }),
	college_code: varchar("college_code", { length: 10 }),
}, (table) => [
	primaryKey({ columns: [table.subject, table.number, table.suffix], name: "pk_courses" }),
	foreignKey({ columns: [table.department_code], foreignColumns: [departments.code], name: "fk_courses_department" }),
	foreignKey({ columns: [table.college_code], foreignColumns: [colleges.code], name: "fk_courses_college" }),
]);

export const departments = mysqlTable("departments", {
	code: varchar("code", { length: 10 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
	college_code: varchar("college_code", { length: 10 }),
}, (table) => [
	foreignKey({ columns: [table.college_code], foreignColumns: [colleges.code], name: "fk_departments_college" }),
]);

export const faculty = mysqlTable("faculty", {
	mnumber: varchar("mnumber", { length: 10 }).primaryKey(), // e.g
	first_name: varchar("first_name", { length: 50 }).notNull(),
	last_name: varchar("last_name", { length: 50 }).notNull(),
	college_code: varchar('college_code', { length: 10 }),
	department_code: varchar('department_code', { length: 10 }),
}, (table) => [
	foreignKey({ columns: [table.college_code], foreignColumns: [colleges.code], name: "fk_faculty_college" }),
	foreignKey({ columns: [table.department_code], foreignColumns: [departments.code], name: "fk_faculty_department" }),
]);

export const instructionalMethods = mysqlTable("instructional_methods", {
	code: varchar("code", { length: 10 }).primaryKey(), // e.g. "LEC"
	description: varchar("description", { length: 255 }).notNull(),
});

export const instructorCourses = mysqlTable("instructor_courses", {
	mnumber: varchar("mnumber", { length: 10 }).notNull().references(() => faculty.mnumber),
	term_code: varchar("term_code", { length: 10 }).notNull().references(() => terms.code),
	year: int("year").notNull(),
	course_subject: varchar("course_subject", { length: 50 }).notNull(),
	course_number: int("course_number").notNull(),
	course_suffix: varchar("course_suffix", { length: 50 }).notNull().default(""),
	course_section: varchar("course_section", { length: 50 }).notNull().default(""),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.term_code, table.year, table.course_subject, table.course_number, table.course_suffix, table.course_section], name: "pk_instructor_courses" }),
	foreignKey({ columns: [table.course_subject, table.course_number, table.course_suffix], foreignColumns: [courses.subject, courses.number, courses.suffix], name: "fk_instructor_courses_course" }),
]);

export const nations = mysqlTable("nations", {
	code: varchar("code", { length: 10 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
});

export const partOfTerm = mysqlTable("part_of_term", {
	code: varchar("code", { length: 10 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
});

export const programs = mysqlTable("programs", {
	code: varchar("code", { length: 10 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
	cip_code: varchar("cip_code", { length: 255 }),
	is_major: boolean("is_major").notNull().default(false),
	is_minor: boolean("is_minor").notNull().default(false),
	has_concentration: boolean("has_concentration").notNull().default(false),
	is_discontinued: boolean("is_discontinued").notNull().default(false),
	is_aacsb: boolean("is_aacsb").notNull().default(false),
	department_code: varchar("department_code", { length: 10 }),
	college_code: varchar("college_code", { length: 10 }),
	last_updated: datetime("last_updated").notNull().default(sql`NOW()`),
}, (table) => [
	foreignKey({ columns: [table.department_code], foreignColumns: [departments.code], name: "fk_programs_department" }),
	foreignKey({ columns: [table.college_code], foreignColumns: [colleges.code], name: "fk_programs_college" }),
]);

export const registrationStatus = mysqlTable("registration_status", {
	code: varchar("code", { length: 10 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
});

export const roles = mysqlTable("roles", {
	id: int("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull(),
});

export const studentAcademicInfo = mysqlTable("student_academic_info", {
	mnumber: varchar("mnumber", { length: 10 }).notNull().references(() => students.mnumber, { onDelete: "cascade" }),
	term_code: varchar("term_code", { length: 10 }).notNull(),
	year: int("year").notNull(),
	admit_term_code: varchar("admit_term_code", { length: 10 }),
	admit_year: int("admit_year"),
	admit_code: varchar("admit_code", { length: 10 }),
	academic_standing_code: varchar("academic_standing_code", { length: 10 }),
	msu_attempted_hours: real("msu_attempted_hours"),
	msu_earned_hours: real("msu_earned_hours"),
	msu_quality_points: real("msu_quality_points"),
	msu_gpa: real("msu_gpa"),
	overall_attempted_hours: real("overall_attempted_hours"),
	overall_earned_hours: real("overall_earned_hours"),
	overall_quality_points: real("overall_quality_points"),
	overall_gpa: real("overall_gpa"),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.term_code, table.year], name: "pk_student_academic_info" }),
	foreignKey({ columns: [table.mnumber], foreignColumns: [students.mnumber], name: "fk_student_academic_info_student" }),
	foreignKey({ columns: [table.term_code], foreignColumns: [terms.code], name: "fk_student_academic_info_term" }),
	foreignKey({ columns: [table.admit_term_code], foreignColumns: [terms.code], name: "fk_student_academic_info_admit_term" }),
	foreignKey({ columns: [table.admit_code], foreignColumns: [admitCodes.code], name: "fk_student_academic_info_admit_code" }),
	foreignKey({ columns: [table.academic_standing_code], foreignColumns: [academicStanding.code], name: "fk_student_academic_info_academic_standing" })
]);

export const studentAddresses = mysqlTable("student_addresses", {
	mnumber: varchar("mnumber", { length: 10 }).primaryKey().references(() => students.mnumber, { onDelete: "cascade" }),
	street1: varchar("street1", { length: 100 }),
	street2: varchar("street2", { length: 100 }),
	city: varchar("city", { length: 50 }),
	state: varchar("state", { length: 50 }),
	zip: varchar("zip", { length: 10 }),
	nation_code: varchar("nation_code", { length: 10 }),
	phone: varchar("phone", { length: 15 }),
}, (table) => [
	foreignKey({ columns: [table.nation_code], foreignColumns: [nations.code], name: "fk_student_addresses_nation" }),
]);

export const studentAdvisors = mysqlTable("student_advisors", {
	student_mnumber: varchar("student_mnumber", { length: 10 }).notNull().references(() => students.mnumber, { onDelete: "cascade" }),
	term_code: varchar("term_code", { length: 10 }).notNull(),
	year: int("year").notNull(),
	advisor_mnumber: varchar("advisor_mnumber", { length: 10 }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.student_mnumber, table.term_code, table.year, table.advisor_mnumber], name: "pk_student_advisors" }),
	foreignKey({ columns: [table.term_code], foreignColumns: [terms.code], name: "fk_student_advisors_term" }),
	foreignKey({ columns: [table.advisor_mnumber], foreignColumns: [faculty.mnumber], name: "fk_student_advisors_faculty" }),
	foreignKey({ columns: [table.student_mnumber], foreignColumns: [students.mnumber], name: "fk_student_advisors_student" }),

]);

export const studentCourses = mysqlTable("student_courses", {
	mnumber: varchar("mnumber", { length: 10 }).notNull().references(() => students.mnumber, { onDelete: "cascade" }),
	term_code: varchar("term_code", { length: 10 }).notNull(),
	year: int("year").notNull(),
	part_of_term_code: varchar("part_of_term_code", { length: 10 }),
	course_subject: varchar("course_subject", { length: 50 }).notNull(),
	course_number: int("course_number").notNull(),
	course_suffix: varchar("course_suffix", { length: 50 }).notNull().default(""),
	course_section: varchar("course_section", { length: 50 }).notNull(),
	course_hours: int("course_hours").notNull(),
	course_level: varchar("course_level", { length: 50 }),
	registration_status_code: varchar("registration_status_code", { length: 10 }),
	instructional_method_code: varchar("instructional_method_code", { length: 10 }),
	last_attendance: varchar("last_attendance", { length: 50 }),
	midterm_grade: varchar("midterm_grade", { length: 50 }),
	final_grade: varchar("final_grade", { length: 50 }),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.term_code, table.year, table.course_subject, table.course_number, table.course_suffix, table.course_section], name: "pk_student_courses" }),
	foreignKey({ columns: [table.term_code], foreignColumns: [terms.code], name: "fk_student_courses_term" }),
	foreignKey({ columns: [table.part_of_term_code], foreignColumns: [partOfTerm.code], name: "fk_student_courses_part_of_term" }),
	foreignKey({ columns: [table.registration_status_code], foreignColumns: [registrationStatus.code], name: "fk_student_courses_registration_status" }),
	foreignKey({ columns: [table.instructional_method_code], foreignColumns: [instructionalMethods.code], name: "fk_student_courses_instructional_method" }),
	foreignKey({ columns: [table.course_subject, table.course_number, table.course_suffix], foreignColumns: [courses.subject, courses.number, courses.suffix], name: "fk_student_courses_course" }),
]);

export const studentPrograms = mysqlTable("student_programs", {
	mnumber: varchar("mnumber", { length: 10 }).notNull().references(() => students.mnumber, { onDelete: "cascade" }),
	term_code: varchar("term_code", { length: 10 }).notNull(),
	year: int("year").notNull(),
	type: varchar("type", { length: 50 }).notNull(),
	level: varchar("level", { length: 50 }).notNull(),
	program_code: varchar("program_code", { length: 10 }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.mnumber, table.type, table.program_code], name: "pk_student_programs" }),
	foreignKey({ columns: [table.term_code], foreignColumns: [terms.code], name: "fk_student_programs_term" }),
	foreignKey({ columns: [table.program_code], foreignColumns: [programs.code], name: "fk_student_programs_program" }),
	check("program_type", sql`${table.type} IN ('MAJOR', 'MINOR')`),
	check("program_level", sql`${table.level} IN ('UG', 'GR', 'PB')`),
]);

export const students = mysqlTable("students", {
	mnumber: varchar("mnumber", { length: 10 }).primaryKey(),
	first_name: varchar("first_name", { length: 50 }).notNull(),
	middle_name: varchar("middle_name", { length: 50 }),
	last_name: varchar("last_name", { length: 50 }).notNull(),
	suffix: varchar("suffix", { length: 10 }),
	gender: varchar("gender", { length: 10 }),
	birthdate: varchar("birthdate", { length: 10 }),
	citizenship: varchar("citizenship", { length: 50 }),
	race: varchar("race", { length: 50 }),
	residency: varchar("residency", { length: 50 }),
	cell_phone: varchar("cell_phone", { length: 15 }),
	email: varchar("email", { length: 100 }),
});

export const terms = mysqlTable("terms", {
	code: varchar("code", { length: 10 }).primaryKey(),
	description: varchar("description", { length: 255 }).notNull(),
});

export const userRoles = mysqlTable("user_roles", {
	user_id: varchar("user_id", { length: 50 }).notNull().references(() => user.id, { onDelete: "cascade" }),
	role_id: int("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
}, (table) => [
	primaryKey({ columns: [table.user_id, table.role_id], name: "pk_user_roles" }),
]);