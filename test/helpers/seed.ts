import fs from 'node:fs'
import path from 'node:path'
import { resetDb, getDb, closeDb } from "./db";
import * as schema from '../../src/db/schema.ts'
import { seed } from "drizzle-seed";
import { parseCSV } from "@/utils/csv-importer";

async function importCSVData(filePath: string) {
    const basePath = 'src/db/seed/csvs'
    const fileContent = fs.readFileSync(path.join(basePath, filePath), 'utf8')
    const parsedData = await parseCSV(fileContent)
    return parsedData.data
}

// Static Lookup Tables
const terms = await importCSVData('terms.csv') as (typeof schema.terms.$inferSelect)[]
const admitCodes = await importCSVData('admit_codes.csv') as (typeof schema.admitCodes.$inferSelect)[]
const academicStandings = await importCSVData('academic_standing.csv') as (typeof schema.academicStanding.$inferSelect)[]
const colleges = await importCSVData('colleges.csv') as (typeof schema.colleges.$inferSelect)[]
const coursesData = await importCSVData('reg_cuba_catalog_202510_20250117.csv')
const courses = (coursesData as Record<string, string>[]).map(row => ({
    ...row,
    number: Number(row.number),
    hours: Number(row.hours),
    last_updated: new Date(row.last_updated)
})) as (typeof schema.courses.$inferSelect)[]
const departments = await importCSVData('departments.csv') as (typeof schema.departments.$inferSelect)[]
const instructionalMethods = await importCSVData('instructional_methods.csv') as (typeof schema.instructionalMethods.$inferSelect)[]
const registrationStatuses = await importCSVData('registration_status.csv') as (typeof schema.registrationStatus.$inferSelect)[]
const rolesData = await importCSVData('roles.csv')
const roles = (rolesData as Record<string, string>[]).map(row => ({
    ...row,
    id: Number(row.id)
})) as (typeof schema.roles.$inferSelect)[]
const partOfTerms = await importCSVData('part_of_term.csv') as (typeof schema.partOfTerm.$inferSelect)[]
const programsData = await importCSVData('major_minor.csv')
const programs = (programsData as Record<string, string>[]).map(row => ({
    ...row,
    last_updated: new Date(row.last_updated),
    is_major: row.is_major === 'true',
    is_minor: row.is_minor === 'true',
    has_concentration: row.has_concentration === 'true',
    is_discontinued: row.is_discontinued === 'true',
    is_aacsb: row.is_aacsb === 'true'
})) as (typeof schema.programs.$inferSelect)[]


// async function seedTestDatabase() {
//     const db = getDb()


//     await seed(db, seedableTables).refine((f) => ({
//         // Tables to skip during seeding

//     }))

// }

// seedTestDatabase()
//     .then(() => {
//         console.log("✅ Test database seeded successfully.")
//     })
//     .catch((error) => {
//         console.error("❌ Error seeding test database:", error)
//     })
//     .finally(async () => {
//         await closeDb()
//     })