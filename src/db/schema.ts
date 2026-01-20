import {
    boolean,
    check,
    datetime,
    int,
    mysqlTable,
    primaryKey,
    real,
    uniqueIndex,
    varchar,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

// --- BETTERAUTH TABLES ---

export const user = mysqlTable('user', {
    id: varchar('id', { length: 50 }).primaryKey(), // Needed for BetterAuth
    mnumber: varchar('mnumber', { length: 10 }).unique(), // Nullable initially, unique when set
    name: varchar('name', { length: 50 }).notNull(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    emailVerified: boolean('email_verified').notNull(),
    image: varchar('image', { length: 255 }).notNull().default(''), // Default to empty string if no image
    createdAt: datetime('created_at').notNull(),
    updatedAt: datetime('updated_at').notNull(),
    isEnabled: boolean('is_enabled').notNull().default(false), // For security reasons, we'll default to false
    lastLogin: datetime('last_login'), // Default to current time
})

export const session = mysqlTable('session', {
    id: varchar('id', { length: 50 }).primaryKey(),
    expiresAt: datetime('expires_at').notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    createdAt: datetime('created_at').notNull(),
    updatedAt: datetime('updated_at').notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 255 }),
    userId: varchar('user_id', { length: 50 })
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = mysqlTable('account', {
    id: varchar('id', { length: 50 }).primaryKey(),
    accountId: varchar('account_id', { length: 255 }).notNull(),
    providerId: varchar('provider_id', { length: 255 }).notNull(),
    userId: varchar('user_id', { length: 50 })
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: varchar('access_token', { length: 2048 }),
    refreshToken: varchar('refresh_token', { length: 2048 }),
    idToken: varchar('id_token', { length: 2048 }),
    accessTokenExpiresAt: datetime('access_token_expires_at'),
    refreshTokenExpiresAt: datetime('refresh_token_expires_at'),
    scope: varchar('scope', { length: 255 }),
    createdAt: datetime('created_at').notNull(),
    updatedAt: datetime('updated_at').notNull(),
})

export const verification = mysqlTable('verification', {
    id: varchar('id', { length: 50 }).primaryKey(),
    identifier: varchar('identifier', { length: 255 }).notNull(),
    value: varchar('value', { length: 2048 }).notNull(),
    expiresAt: datetime('expires_at').notNull(),
    createdAt: datetime('created_at').notNull(),
    updatedAt: datetime('updated_at').notNull(),
})

// --- END BETTERAUTH TABLES ---

export const academicStanding = mysqlTable('academic_standing', {
    code: varchar('code', { length: 10 }).primaryKey(),
    description: varchar('description', { length: 255 }).notNull(),
})

export const admitCodes = mysqlTable('admit_codes', {
    code: varchar('code', { length: 10 }).primaryKey(),
    description: varchar('description', { length: 255 }).notNull(),
})

export const colleges = mysqlTable('colleges', {
    code: varchar('code', { length: 10 }).primaryKey(),
    description: varchar('description', { length: 255 }).notNull(),
})

export const courses = mysqlTable(
    'courses',
    {
        code: varchar('code', { length: 100 }).primaryKey(), // e.g. "CSC100A"
        subject: varchar('subject', { length: 50 }).notNull(), // e.g. "ACC"
        number: int('number').notNull(),
        suffix: varchar('suffix', { length: 50 }).notNull().default(''), // e.g. "T" for "101T", default to empty string
        title: varchar('title', { length: 255 }).notNull(),
        hours: int('hours').notNull(),
        last_updated: datetime('last_updated')
            .notNull()
            .default(sql`NOW()`),
        department_code: varchar('department_code', { length: 10 }).references(
            () => departments.code,
            { onDelete: 'set null' },
        ),
        college_code: varchar('college_code', { length: 10 }).references(
            () => colleges.code,
            { onDelete: 'set null' },
        ),
    },
    (table) => [
        uniqueIndex('ux_courses_subject_number_suffix').on(
            table.subject,
            table.number,
            table.suffix,
        ),
    ],
)

/**
 * This table's job is to provide a course-to-department mapping.
 * Ex: 'CSC' in 'CSC101' is the prefix.
 * We create a relationship with the prefix to the assigned department
 * Anytime a new 'CSC' course is added, it will be assigned to the already established department.
 */
export const coursePrefixes = mysqlTable('course_prefixes', {
    code: varchar('code', { length: 10 }).primaryKey(),
    department_code: varchar('department_code', { length: 10 }).references(
        () => departments.code,
        { onDelete: 'set null' },
    ),
    college_code: varchar('college_code', { length: 10 }).references(
        () => colleges.code,
        { onDelete: 'set null' }
    )
})

export const departments = mysqlTable('departments', {
    code: varchar('code', { length: 10 }).primaryKey(),
    description: varchar('description', { length: 255 }).notNull(),
    college_code: varchar('college_code', { length: 10 }).references(
        () => colleges.code,
        { onDelete: 'set null' },
    ),
})

export const faculty = mysqlTable('faculty', {
    mnumber: varchar('mnumber', { length: 10 }).primaryKey(), // e.g
    first_name: varchar('first_name', { length: 50 }).notNull(),
    last_name: varchar('last_name', { length: 50 }).notNull(),
    college_code: varchar('college_code', { length: 10 }).references(
        () => colleges.code,
        { onDelete: 'set null' },
    ),
    department_code: varchar('department_code', { length: 10 }).references(
        () => departments.code,
        { onDelete: 'set null' },
    ),
})

export const instructionalMethods = mysqlTable('instructional_methods', {
    code: varchar('code', { length: 10 }).primaryKey(), // e.g. "LEC"
    description: varchar('description', { length: 255 }).notNull(),
})

export const partOfTerm = mysqlTable('part_of_term', {
    code: varchar('code', { length: 10 }).primaryKey(),
    description: varchar('description', { length: 255 }).notNull(),
})

export const programs = mysqlTable('programs', {
    code: varchar('code', { length: 10 }).primaryKey(),
    description: varchar('description', { length: 255 }).notNull(),
    cip_code: varchar('cip_code', { length: 255 }),
    is_major: boolean('is_major').notNull().default(false),
    is_minor: boolean('is_minor').notNull().default(false),
    has_concentration: boolean('has_concentration').notNull().default(false),
    is_discontinued: boolean('is_discontinued').notNull().default(false),
    is_aacsb: boolean('is_aacsb').notNull().default(false),
    department_code: varchar('department_code', { length: 10 }).references(
        () => departments.code,
        { onDelete: 'set null' },
    ),
    college_code: varchar('college_code', { length: 10 }).references(
        () => colleges.code,
        { onDelete: 'set null' },
    ),
    last_updated: datetime('last_updated')
        .notNull()
        .default(sql`NOW()`),
    coordinator: varchar('coordinator', { length: 10 }).references(
        () => faculty.mnumber,
        { onDelete: 'set null' },
    ),
})

export const registrationStatus = mysqlTable('registration_status', {
    code: varchar('code', { length: 10 }).primaryKey(),
    description: varchar('description', { length: 255 }).notNull(),
})

export const roles = mysqlTable('roles', {
    id: int('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
})

export const studentAcademicInfo = mysqlTable(
    'student_academic_info',
    {
        mnumber: varchar('mnumber', { length: 10 })
            .notNull()
            .references(() => students.mnumber, { onDelete: 'cascade' }),
        term_code: varchar('term_code', { length: 10 })
            .notNull()
            .references(() => terms.code, { onDelete: 'cascade' }),
        year: int('year').notNull(),
        admit_term_code: varchar('admit_term_code', { length: 10 }).references(
            () => terms.code,
            { onDelete: 'set null' },
        ),
        admit_year: int('admit_year'),
        admit_code: varchar('admit_code', { length: 10 }).references(
            () => admitCodes.code,
            { onDelete: 'set null' },
        ),
        academic_standing_code: varchar('academic_standing_code', {
            length: 10,
        }).references(() => academicStanding.code, { onDelete: 'set null' }),
        msu_attempted_hours: real('msu_attempted_hours'),
        msu_earned_hours: real('msu_earned_hours'),
        msu_quality_points: real('msu_quality_points'),
        msu_gpa: real('msu_gpa'),
        overall_attempted_hours: real('overall_attempted_hours'),
        overall_earned_hours: real('overall_earned_hours'),
        overall_quality_points: real('overall_quality_points'),
        overall_gpa: real('overall_gpa'),
    },
    (table) => [
        primaryKey({ columns: [table.mnumber, table.term_code, table.year] }),
    ],
)

export const studentAdvisors = mysqlTable(
    'student_advisors',
    {
        student_mnumber: varchar('student_mnumber', { length: 10 })
            .notNull()
            .references(() => students.mnumber, { onDelete: 'cascade' }),
        term_code: varchar('term_code', { length: 10 })
            .notNull()
            .references(() => terms.code, { onDelete: 'cascade' }),
        year: int('year').notNull(),
        advisor_mnumber: varchar('advisor_mnumber', { length: 10 })
            .notNull()
            .references(() => faculty.mnumber, { onDelete: 'cascade' }),
    },
    (table) => [
        primaryKey({
            columns: [
                table.student_mnumber,
                table.term_code,
                table.year,
                table.advisor_mnumber,
            ],
        }),
    ],
)

export const studentCourses = mysqlTable(
    'student_courses',
    {
        mnumber: varchar('mnumber', { length: 10 })
            .notNull()
            .references(() => students.mnumber, { onDelete: 'cascade' }),
        term_code: varchar('term_code', { length: 10 })
            .notNull()
            .references(() => terms.code, { onDelete: 'cascade' }),
        year: int('year').notNull(),
        part_of_term_code: varchar('part_of_term_code', {
            length: 10,
        }).references(() => partOfTerm.code, { onDelete: 'set null' }),
        course_id: varchar('course_id', { length: 100 })
            .notNull()
            .references(() => courses.code, { onDelete: 'cascade' }),
        course_section: varchar('course_section', { length: 50 }).notNull(),
        course_hours: int('course_hours').notNull(),
        course_level: varchar('course_level', { length: 50 }),
        registration_status_code: varchar('registration_status_code', {
            length: 10,
        }).references(() => registrationStatus.code, { onDelete: 'set null' }),
        instructional_method_code: varchar('instructional_method_code', {
            length: 10,
        }).references(() => instructionalMethods.code, {
            onDelete: 'set null',
        }),
        instructor_mnumber: varchar('instructor_mnumber', { length: 10 })
            .notNull()
            .references(() => faculty.mnumber, { onDelete: 'cascade' }),
        last_attendance: datetime('last_attendance'),
        midterm_grade: varchar('midterm_grade', { length: 50 }),
        final_grade: varchar('final_grade', { length: 50 }),
    },
    (table) => [
        primaryKey({
            columns: [
                table.mnumber,
                table.term_code,
                table.year,
                table.course_id,
                table.course_section,
            ],
        }),
    ],
)

export const studentPrograms = mysqlTable(
    'student_programs',
    {
        mnumber: varchar('mnumber', { length: 10 })
            .notNull()
            .references(() => students.mnumber, { onDelete: 'cascade' }),
        term_code: varchar('term_code', { length: 10 })
            .notNull()
            .references(() => terms.code, { onDelete: 'cascade' }),
        year: int('year').notNull(),
        type: varchar('type', { length: 50 }).notNull(),
        level: varchar('level', { length: 50 }).notNull(),
        program_code: varchar('program_code', { length: 10 })
            .notNull()
            .references(() => programs.code, { onDelete: 'cascade' }),
    },
    (table) => [
        primaryKey({
            columns: [table.mnumber, table.type, table.program_code],
        }),
        check('program_type', sql`${table.type} IN ('MAJOR', 'MINOR')`),
        check('program_level', sql`${table.level} IN ('UG', 'GR', 'PB')`),
    ],
)

export const students = mysqlTable('students', {
    mnumber: varchar('mnumber', { length: 10 }).primaryKey(),
    first_name: varchar('first_name', { length: 50 }).notNull(),
    middle_name: varchar('middle_name', { length: 50 }),
    last_name: varchar('last_name', { length: 50 }).notNull(),
    suffix: varchar('suffix', { length: 10 }),
    gender: varchar('gender', { length: 10 }),
    email: varchar('email', { length: 100 }),
})

export const terms = mysqlTable('terms', {
    code: varchar('code', { length: 10 }).primaryKey(),
    description: varchar('description', { length: 255 }).notNull(),
})

export const userRoles = mysqlTable(
    'user_roles',
    {
        user_id: varchar('user_id', { length: 50 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        role_id: int('role_id')
            .notNull()
            .references(() => roles.id, { onDelete: 'cascade' }),
    },
    (table) => [primaryKey({ columns: [table.user_id, table.role_id] })],
)
