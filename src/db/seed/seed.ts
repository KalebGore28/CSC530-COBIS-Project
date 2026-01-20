import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDb } from '..'
import { csvConfig } from '../mapping-config'
import { importCSVFile } from '@/utils/csv-importer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
    const db = getDb()
    try {
        await importCSVFile(
            db,
            path.join(__dirname, 'csvs/terms.csv'),
            csvConfig,
        )
        await importCSVFile(
            db,
            path.join(__dirname, 'csvs/admit_codes.csv'),
            csvConfig,
        )
        await importCSVFile(
            db,
            path.join(__dirname, 'csvs/academic_standing.csv'),
            csvConfig,
        )
        await importCSVFile(
            db,
            path.join(__dirname, 'csvs/course_prefixes.csv'),
            csvConfig,
        )
        await importCSVFile(
            db,
            path.join(__dirname, 'csvs/colleges.csv'),
            csvConfig,
        )
        await importCSVFile(
            db,
            path.join(__dirname, 'csvs/reg_cuba_catalog_202510_20250117.csv'),
            csvConfig,
        )
        await importCSVFile(
            db,
            path.join(__dirname, 'csvs/departments.csv'),
            csvConfig,
        )
        await importCSVFile(
            db,
            path.join(__dirname, 'csvs/instructional_methods.csv'),
            csvConfig,
        )
        await importCSVFile(
            db,
            path.join(__dirname, 'csvs/registration_status.csv'),
            csvConfig,
        )
        await importCSVFile(
            db,
            path.join(__dirname, 'csvs/roles.csv'),
            csvConfig,
        )
        await importCSVFile(
            db,
            path.join(__dirname, 'csvs/part_of_term.csv'),
            csvConfig,
        )
        await importCSVFile(
            db,
            path.join(__dirname, 'csvs/major_minor.csv'),
            csvConfig,
        )

        console.log('All imports complete')
    } catch (err) {
        console.error('Error importing CSVs:', err)
    }
}

main()
