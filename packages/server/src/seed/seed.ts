import path from "path";
import { fileURLToPath } from 'url';
import { getDbConnection } from "../db/connection";
import { importCSVFile } from "../utils/csv-importer";
import { csvConfig } from "../services/column-mapping-service";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
	const db = (await getDbConnection()).orm;
	try {
		await importCSVFile(db, path.join(__dirname, 'csvs/terms.csv'), csvConfig);
		await importCSVFile(db, path.join(__dirname, 'csvs/admit_codes.csv'), csvConfig);
		await importCSVFile(db, path.join(__dirname, 'csvs/academic_standing.csv'), csvConfig);
		await importCSVFile(db, path.join(__dirname, 'csvs/colleges.csv'), csvConfig);
		await importCSVFile(db, path.join(__dirname, 'csvs/course_catalog.csv'), csvConfig);
		await importCSVFile(db, path.join(__dirname, 'csvs/departments.csv'), csvConfig);
		await importCSVFile(db, path.join(__dirname, 'csvs/instructional_methods.csv'), csvConfig);
		await importCSVFile(db, path.join(__dirname, 'csvs/nations.csv'), csvConfig);
		await importCSVFile(db, path.join(__dirname, 'csvs/registration_status.csv'), csvConfig);
		await importCSVFile(db, path.join(__dirname, 'csvs/roles.csv'), csvConfig);
		await importCSVFile(db, path.join(__dirname, 'csvs/part_of_term.csv'), csvConfig);
		await importCSVFile(db, path.join(__dirname, 'csvs/major_minor.csv'), csvConfig);
		await importCSVFile(db, path.join(__dirname, 'csvs/reg_cuba_demographic_202510_20250117.csv'), csvConfig);
		await importCSVFile(db, path.join(__dirname, 'csvs/reg_cuba_courses_during_term_202510_20250117.csv'), csvConfig);

		console.log('All imports complete');
	} catch (err) {
		console.error('Error importing CSVs:', err);
	}
}

main();