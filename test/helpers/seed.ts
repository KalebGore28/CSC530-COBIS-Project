import fs from 'node:fs'
import path from 'node:path'
import { resetDb, getDb, closeDb } from "./db";
import * as schema from '../../src/db/schema.ts'
import { seed } from "drizzle-seed";
import { parseCSV } from "@/utils/csv-importer";

async function getCSVData(filePath: string) {
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
const terms = await getCSVData('terms.csv') as (typeof schema.terms.$inferSelect)[]
const admitCodes = await getCSVData('admit_codes.csv') as (typeof schema.admitCodes.$inferSelect)[]
const academicStandings = await getCSVData('academic_standing.csv') as (typeof schema.academicStanding.$inferSelect)[]
const colleges = await getCSVData('colleges.csv') as (typeof schema.colleges.$inferSelect)[]
const coursesData = await getCSVData('reg_cuba_catalog_202510_20250117.csv')
const courses = (coursesData as Record<string, string>[]).map(row => {
    const course = row.course || ''

    // Match: letters at start, then digits, then optional letters at end
    const match = course.match(/^([A-Z]+)(\d+)([A-Z]*)$/)

    const subject = match ? match[1] : ''
    const number = match ? Number(match[2]) : 0
    const suffix = match ? match[3] : ''

    return {
        code: row.course,
        subject,
        number,
        suffix,
        title: row.crsetitle,
        hours: Number(row.credithrs),
        last_updated: new Date(Date.now()),
    }
}) as (typeof schema.courses.$inferSelect)[]
const departments = await getCSVData('departments.csv') as (typeof schema.departments.$inferSelect)[]
const instructionalMethods = await getCSVData('instructional_methods.csv') as (typeof schema.instructionalMethods.$inferSelect)[]
const registrationStatuses = await getCSVData('registration_status.csv') as (typeof schema.registrationStatus.$inferSelect)[]
const rolesData = await getCSVData('roles.csv')
const roles = (rolesData as Record<string, string>[]).map(row => ({
    id: Number(row.id),
    name: row.role,
})) as (typeof schema.roles.$inferSelect)[]
const partOfTerms = await getCSVData('part_of_term.csv') as (typeof schema.partOfTerm.$inferSelect)[]
const programsData = await getCSVData('major_minor.csv')
const programs = (programsData as Record<string, string>[]).map(row => ({
    code: row.code,
    cip_code: row.cip_code,
    description: row.description,
    last_updated: new Date(Date.now()),
    department_code: row.department === 'NULL' ? null : row.department,
    college_code: row.college === 'NULL' ? null : row.college,
    is_major: row.is_major === 'true',
    is_minor: row.is_minor === 'true',
    has_concentration: row.has_concentration === 'true',
    is_discontinued: row.is_discontinued === 'true',
    is_aacsb: row.is_aacsb === 'true'
})) as (typeof schema.programs.$inferSelect)[]

async function seedStaticLookups(db: ReturnType<typeof getDb>) {
    await db.insert(schema.terms).values(terms)
    await db.insert(schema.admitCodes).values(admitCodes)
    await db.insert(schema.academicStanding).values(academicStandings)
    await db.insert(schema.colleges).values(colleges)
    await db.insert(schema.courses).values(courses)
    await db.insert(schema.departments).values(departments)
    await db.insert(schema.instructionalMethods).values(instructionalMethods)
    await db.insert(schema.registrationStatus).values(registrationStatuses)
    await db.insert(schema.roles).values(roles)
    await db.insert(schema.partOfTerm).values(partOfTerms)
    await db.insert(schema.programs).values(programs)
}


async function seedTestDatabase() {
    await resetDb()
    const db = getDb()

    await seedStaticLookups(db)


    await seed(db, {
        ...schema,
        // Tables to skip seeding
        // BetterAuth tables
        user: undefined,
        session: undefined,
        account: undefined,
        verification: undefined,
        // Static lookup tables
        academicStanding: undefined,
        admitCodes: undefined,
        colleges: undefined,
        courses: undefined,
        departments: undefined,
        faculty: undefined,
        instructionalMethods: undefined,
        partOfTerm: undefined,
        programs: undefined,
        registrationStatus: undefined,
        roles: undefined,
        terms: undefined,
        userRoles: undefined,
        // temp ignore
        studentAcademicInfo: undefined,
        studentAdvisors: undefined,
        studentCourses: undefined,
        // studentPrograms: undefined,

    }).refine((f) => ({
        students: {
            columns: {
                mnumber: f.phoneNumber({ template: 'M#########' }), // M number format
                gender: f.valuesFromArray({ values: ['M', 'F'] })
            },
            with: {
                studentPrograms: 2
            }
        },
        studentPrograms: {
            columns: {
                term_code: f.valuesFromArray({ values: terms.map(t => t.code) }),
                program_code: f.valuesFromArray({ values: programs.map(p => p.code) }),
                year: f.number({ minValue: 2020, maxValue: 2025 }),
                type: f.valuesFromArray({ values: ['MAJOR', 'MINOR'] }),
                level: f.valuesFromArray({ values: ['UG', 'GR', 'PB'] }),
            }
        }
    }))

}

seedTestDatabase()
    .then(() => {
        console.log("✅ Test database seeded successfully.")
    })
    .catch((error) => {
        console.error("❌ Error seeding test database:", error)
    })
    .finally(async () => {
        await closeDb()
    })