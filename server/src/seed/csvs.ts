// process.env.NODE_ENV = 'test';
import { getDbConnection } from '../db/connection';
import {
	academicStanding,
} from '../db/schema';


import { importCSV } from '../utils/importCSV';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Seeds database with all of the csv files in the data/csvs directory.
 */
(async () => {
	// Get production database connection
	const { db, orm } = await getDbConnection();

	// Import all csv files in the data/csvs directory
	const academicStandingCSV: { code: string; description: string }[] =
		await importCSV<{ code: string; description: string }>(path.resolve(__dirname, './data/csvs/academic_standing.csv'));


	// Insert academic standing
	await orm.insert(academicStanding).values(academicStandingCSV).execute();

	// Verify that the data was imported correctly
	const academicStandingRows = await orm.select().from(academicStanding).execute();
	console.log('academicStanding:', academicStandingRows);


})();