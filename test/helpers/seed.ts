import fs from 'node:fs'
import path from 'node:path'
import { seed } from 'drizzle-seed'
import * as schema from '../../src/db/schema.ts'
import { closeDb, getDb, resetDb } from './db'
import { parseCSV } from '@/utils/csv-importer'

async function getCSVData(
    filePath: string,
): Promise<Array<Record<string, string>>> {
    const basePath = 'src/db/seed/csvs'
    const fileContent = fs.readFileSync(path.join(basePath, filePath), 'utf8')
    const parsedData = await parseCSV(fileContent)

    // Lowercase all headers
    return parsedData.data.map((row: any) => {
        const lowercasedRow: any = {}
        for (const key in row) {
            lowercasedRow[key.toLowerCase()] = row[key]
        }
        return lowercasedRow
    })
}

// Static Lookup Tables
const terms = (await getCSVData('terms.csv')).map((row) => {
    return {
        id: row.code,
        description: row.description,
    }
}) as Array<typeof schema.terms.$inferSelect>

const admitCodes = (await getCSVData('admit_codes.csv')).map((row) => {
    return {
        id: row.code,
        description: row.description,
    }
}) as Array<typeof schema.admitCodes.$inferSelect>

const academicStandings = (await getCSVData('academic_standing.csv')).map(
    (row) => {
        return {
            id: row.code,
            description: row.description,
        }
    },
) as Array<typeof schema.academicStanding.$inferSelect>

const colleges = (await getCSVData('colleges.csv')).map((row) => {
    return {
        id: row.code,
        description: row.description,
    }
}) as Array<typeof schema.colleges.$inferSelect>

const coursePrefixData = await getCSVData('course_prefixes.csv')
const coursePrefixes = coursePrefixData.map((row) => {
    return {
        id: row.prefix,
        department_id: row.crsedept,
        college_id: row.crsecoll,
    }
}) as Array<typeof schema.courses.$inferSelect>

type CoursePrefixValue = {
    department_id: string | null
    college_id: string | null
}
const coursePrefixMap = new Map<string, CoursePrefixValue>()
for (const row of coursePrefixes) {
    coursePrefixMap.set(row.id, {
        department_id: row.department_id,
        college_id: row.college_id,
    })
}

const courses = (await getCSVData('reg_cuba_catalog_202510_20250117.csv')).map(
    (row) => {
        const course = row.course || ''

        // Match: letters at start, then digits, then optional letters at end
        const match = course.match(/^([A-Z]+)(\d+)([A-Z]*)$/)

        const subject = match ? match[1] : ''
        const number = match ? Number(match[2]) : 0
        const suffix = match ? match[3] : ''

        return {
            id: row.course,
            subject,
            number,
            suffix,
            title: row.crsetitle,
            hours: Number(row.credithrs),
            last_updated: new Date(Date.now()),
            department_id: coursePrefixMap.get(subject)?.department_id,
            college_id: coursePrefixMap.get(subject)?.college_id,
        }
    },
) as Array<typeof schema.courses.$inferSelect>

const departments = (await getCSVData('departments.csv')).map((row) => {
    return {
        id: row.code,
        description: row.description,
        college_id: row.college === 'NULL' ? null : row.college,
    }
}) as Array<typeof schema.departments.$inferSelect>
const instructionalMethods = (
    await getCSVData('instructional_methods.csv')
).map((row) => {
    return {
        id: row.code,
        description: row.description,
    }
}) as Array<typeof schema.instructionalMethods.$inferSelect>

const registrationStatuses = (await getCSVData('registration_status.csv')).map(
    (row) => {
        return {
            id: row.code,
            description: row.description,
        }
    },
) as Array<typeof schema.registrationStatus.$inferSelect>

const roles = (await getCSVData('roles.csv')).map((row) => ({
    id: Number(row.id),
    name: row.role,
})) as Array<typeof schema.roles.$inferSelect>

const partOfTerms = (await getCSVData('part_of_term.csv')).map((row) => {
    return {
        id: row.code,
        description: row.description,
    }
}) as Array<typeof schema.partOfTerm.$inferSelect>

const programs = (await getCSVData('major_minor.csv')).map((row) => ({
    id: row.code,
    cip_code: row.cip_code,
    description: row.description,
    last_updated: new Date(Date.now()),
    department_id: row.department === 'NULL' ? null : row.department,
    college_id: row.college === 'NULL' ? null : row.college,
    is_major: row.is_major === 'true',
    is_minor: row.is_minor === 'true',
    has_concentration: row.has_concentration === 'true',
    is_discontinued: row.is_discontinued === 'true',
    is_aacsb: row.is_aacsb === 'true',
})) as Array<typeof schema.programs.$inferSelect>

async function seedStaticLookups(db: ReturnType<typeof getDb>) {
    await db.insert(schema.roles).values(roles)
    await db.insert(schema.terms).values(terms)
    await db.insert(schema.admitCodes).values(admitCodes)
    await db.insert(schema.academicStanding).values(academicStandings)
    await db.insert(schema.instructionalMethods).values(instructionalMethods)
    await db.insert(schema.registrationStatus).values(registrationStatuses)
    await db.insert(schema.partOfTerm).values(partOfTerms)
    await db.insert(schema.colleges).values(colleges)
    await db.insert(schema.departments).values(departments)
    await db.insert(schema.courses).values(courses)
    await db.insert(schema.coursePrefixes).values(coursePrefixes)
    await db.insert(schema.programs).values(programs)
}

async function seedTestDatabase() {
    await resetDb()
    const db = getDb()

    await seedStaticLookups(db)

    await seed(
        db,
        {
            ...schema,
            // Tables to skip seeding
            // BetterAuth tables
            user: undefined,
            session: undefined,
            account: undefined,
            verification: undefined,
            userRoles: undefined,
            // Static lookup tables
            roles: undefined,
            terms: undefined,
            admitCodes: undefined,
            academicStanding: undefined,
            instructionalMethods: undefined,
            registrationStatus: undefined,
            partOfTerm: undefined,
            colleges: undefined,
            departments: undefined,
            courses: undefined,
            coursePrefixes: undefined,
            programs: undefined,
        },
        // This seed config ensures consistent data generation across runs
        // { seed: 12345 },
    ).refine((f) => ({
        faculty: {
            count: 10,
            columns: {
                mnumber: f.phoneNumber({ template: 'M10000000#' }), // faculty mnumber format
                department_id: f.valuesFromArray({
                    values: departments.map((d) => d.id),
                }),
                college_id: f.valuesFromArray({
                    values: colleges.map((c) => c.id),
                }),
            },
        },
        students: {
            count: 100,
            columns: {
                mnumber: f.phoneNumber({ template: 'M0000000##' }), // student mnumber format
                gender: f.valuesFromArray({ values: ['M', 'F'] }),
                suffix: f.weightedRandom([
                    {
                        weight: 0.9,
                        value: f.valuesFromArray({ values: [null] }),
                    },
                    {
                        weight: 0.1,
                        value: f.valuesFromArray({
                            values: ['Jr.', 'Sr.', 'III', 'IV'],
                        }),
                    },
                ]),
            },
            with: {
                studentAdvisors: 2,
                studentPrograms: 2,
                studentAcademicInfo: 2,
                studentCourses: 50,
            },
        },
        studentAdvisors: {
            columns: {
                mnumber: f.phoneNumber({ template: 'M0000000##' }),
                term_id: f.valuesFromArray({ values: terms.map((t) => t.id) }),
                year: f.valuesFromArray({ values: [2025] }),
            },
        },
        studentPrograms: {
            columns: {
                mnumber: f.phoneNumber({ template: 'M0000000##' }),
                term_id: f.valuesFromArray({
                    values: terms.map((t) => t.id),
                }),
                program_id: f.valuesFromArray({
                    values: programs.slice(0, 20).map((p) => p.id),
                }),
                year: f.valuesFromArray({
                    values: [2025],
                }),
                type: f.valuesFromArray({ values: ['MAJOR', 'MINOR'] }),
                level: f.valuesFromArray({ values: ['UG', 'GR', 'PB'] }),
            },
        },
        studentAcademicInfo: {
            columns: {
                mnumber: f.phoneNumber({ template: 'M0000000##' }),
                term_id: f.valuesFromArray({
                    values: terms.map((t) => t.id),
                }),
                year: f.valuesFromArray({
                    values: [2025],
                }),
                admit_term_id: f.valuesFromArray({
                    values: terms.map((t) => t.id),
                }),
                admit_year: f.number({ minValue: 2025, maxValue: 2025 }),
                admit_id: f.valuesFromArray({
                    values: admitCodes.map((a) => a.id),
                }),
                academic_standing_id: f.valuesFromArray({
                    values: academicStandings.map((a) => a.id),
                }),
                msu_attempted_hours: f.number({
                    minValue: 0,
                    maxValue: 4,
                    precision: 10,
                }),
                msu_earned_hours: f.number({
                    minValue: 0,
                    maxValue: 4,
                    precision: 10,
                }),
                msu_quality_points: f.number({
                    minValue: 0,
                    maxValue: 4,
                    precision: 10,
                }),
                msu_gpa: f.number({ minValue: 0, maxValue: 4, precision: 10 }),
                overall_attempted_hours: f.number({
                    minValue: 0,
                    maxValue: 4,
                    precision: 10,
                }),
                overall_earned_hours: f.number({
                    minValue: 0,
                    maxValue: 4,
                    precision: 10,
                }),
                overall_quality_points: f.number({
                    minValue: 0,
                    maxValue: 4,
                    precision: 10,
                }),
                overall_gpa: f.number({
                    minValue: 0,
                    maxValue: 4,
                    precision: 10,
                }),
            },
        },
        studentCourses: {
            columns: {
                mnumber: f.phoneNumber({ template: 'M0000000##' }),
                term_id: f.valuesFromArray({ values: terms.map((t) => t.id) }),
                year: f.valuesFromArray({
                    values: [2025],
                }),
                part_of_term_id: f.valuesFromArray({
                    values: partOfTerms.map((p) => p.id),
                }),
                course_id: f.valuesFromArray({
                    values: courses.slice(0, 40).map((c) => c.id),
                }),
                course_section: f.valuesFromArray({
                    values: ['001'],
                }),
                course_hours: f.number({
                    minValue: 3,
                    maxValue: 4,
                    precision: 10,
                }),
                course_level: f.valuesFromArray({ values: ['UG', 'GR', 'PB'] }),
                registration_status_id: f.valuesFromArray({
                    values: registrationStatuses.map((r) => r.id),
                }),
                instructional_method_id: f.valuesFromArray({
                    values: instructionalMethods.map((i) => i.id),
                }),
                midterm_grade: f.weightedRandom([
                    {
                        weight: 0.7,
                        value: f.valuesFromArray({ values: ['A'] }),
                    },
                    {
                        weight: 0.15,
                        value: f.valuesFromArray({ values: ['B'] }),
                    },
                    {
                        weight: 0.1,
                        value: f.valuesFromArray({ values: ['C'] }),
                    },
                    {
                        weight: 0.04,
                        value: f.valuesFromArray({ values: ['D'] }),
                    },
                    {
                        weight: 0.01,
                        value: f.valuesFromArray({ values: ['E'] }),
                    },
                ]),
                final_grade: f.weightedRandom([
                    {
                        weight: 0.7,
                        value: f.valuesFromArray({ values: ['A'] }),
                    },
                    {
                        weight: 0.15,
                        value: f.valuesFromArray({ values: ['B'] }),
                    },
                    {
                        weight: 0.1,
                        value: f.valuesFromArray({ values: ['C'] }),
                    },
                    {
                        weight: 0.04,
                        value: f.valuesFromArray({ values: ['D'] }),
                    },
                    {
                        weight: 0.01,
                        value: f.valuesFromArray({ values: ['E'] }),
                    },
                ]),
            },
        },
    }))
}

seedTestDatabase()
    .then(() => {
        console.log('✅ Test database seeded successfully.')
    })
    .catch((error) => {
        console.error('❌ Error seeding test database:', error)
    })
    .finally(async () => {
        await closeDb()
    })
