// src/seed/seedDatabase.ts

import express from 'express';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import importRouter from '../routes/imports';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Seeds database with all of the csv files in the data/csvs directory.
 */
export const seedDatabase = async () => {
	// Set up Express app for testing
	const app = express()
		.use(express.json({ limit: "10mb" }))
		.use(express.urlencoded({ extended: true, limit: "10mb" }))
		.use('/api/import',importRouter);

	// Define lookup tables that need explicit tableId
	const lookupTables = [
		// {
		// 	filePath: './data/csvs/academic_standing.csv',
		// 	tableId: 'academic-standing'
		// },
		// {
		// 	filePath: './data/csvs/admit_codes.csv',
		// 	tableId: 'admit-codes'
		// },
		// {
		// 	filePath: './data/csvs/college_codes.csv',
		// 	tableId: 'college-codes'
		// },
		// {
		// 	filePath: './data/csvs/colleges.csv',
		// 	tableId: 'colleges'
		// },
		{
			filePath: './data/csvs/departments.csv',
			tableId: 'departments'
		},
		// {
		// 	filePath: './data/csvs/instructional_methods.csv',
		// 	tableId: 'instructional-methods'
		// },
		// {
		// 	filePath: './data/csvs/nations.csv',
		// 	tableId: 'nations'
		// },
		// {
		// 	filePath: './data/csvs/part_of_term.csv',
		// 	tableId: 'part-of-term'
		// },
		// {
		// 	filePath: './data/csvs/major_minor.csv',
		// 	tableId: 'programs'
		// },
		// {
		// 	filePath: './data/csvs/registration_status.csv',
		// 	tableId: 'registration-status'
		// },
		// {
		// 	filePath: './data/csvs/terms.csv',
		// 	tableId: 'terms'
		// }
	];

	// Define data tables (with specific filename patterns)
	const dataTables = [
		{
			filePath: './data/csvs/prototype/reg_cuba_catalog_202510_20250117.csv',
		},
		// {
		// 	filePath: './data/csvs/prototype/reg_cuba_demographic_202510_20250117.csv',
		// },
		// {
		// 	filePath: './data/csvs/prototype/reg_cuba_courses_during_term_202510_20250117.csv',
		// },
		// {
		// 	filePath: './data/csvs/prototype/reg_cuba_test_scores_202510_20250117.csv',
		// },
	];

	const responses = [];

	// Process lookup tables
	console.log('Importing lookup tables...');
	for (const table of lookupTables) {
		try {
			console.log(`Importing ${path.basename(table.filePath)}...`);

			//log full path of the file
			console.log(`Full path: ${path.resolve(__dirname, table.filePath)}`);

			const response = await request(app)
				.post('/api/import/process')
				.field('importedBy', 'seed script')
				.field('tableId', table.tableId)  // Required for lookup tables
				.attach('file', path.resolve(__dirname, table.filePath));

			responses.push({
				file: path.basename(table.filePath),
				status: response.status,
				success: response.body.success,
				error: response.status !== 200 ? response.body.error : undefined
			});

			if (response.status !== 200) {
				console.error(`Failed to import ${path.basename(table.filePath)}: ${response.body.error}`);
			} else {
				console.log(`Successfully imported ${path.basename(table.filePath)}`);
			}
		} catch (error: any) {
			console.error(`Error importing ${path.basename(table.filePath)}:`, error);
			responses.push({
				file: path.basename(table.filePath),
				status: 500,
				success: false,
				error: error.message
			});
		}
	}

	// Process data tables
	console.log('\nImporting data tables...');
	for (const table of dataTables) {
		try {
			console.log(`Importing ${path.basename(table.filePath)}...`);

			// Log full path of the file
			console.log(`Full path: ${path.resolve(__dirname, table.filePath)}`);

			// For data tables, we need to use the expected filename pattern
			const response = await request(app)
				.post('/api/import/process')
				.field('importedBy', 'seed script')
				.attach('file', fs.readFileSync(path.resolve(__dirname, table.filePath)), {
					filename: path.basename(table.filePath),
					contentType: 'text/csv'
				});

			responses.push({
				file: path.basename(table.filePath),
				status: response.status,
				success: response.body.success,
				error: response.status !== 200 ? response.body.error : undefined
			});

			console.log(`Response: ${response.status} - ${response.body.success}`);

			if (response.status !== 200) {
				console.error(`Failed to import ${path.basename(table.filePath)}: ${response.body.error}`);
			} else {
				console.log(`Successfully imported ${path.basename(table.filePath)}`);
			}
		} catch (error: any) {
			console.error(`Error importing ${path.basename(table.filePath)}:`, error);
			responses.push({
				file: path.basename(table.filePath),
				status: 500,
				success: false,
				error: error.message
			});
		}
	}

	// Check if any imports failed
	const failedImports = responses.filter(r => !r.success);

	if (failedImports.length > 0) {
		console.error('\nSome imports failed:');
		failedImports.forEach(failure => {
			console.error(`- ${failure.file}: ${failure.error}`);
		});
		throw new Error('Failed to seed database completely');
	}

	console.log('\nDatabase seeding completed successfully');
};

// Check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
	seedDatabase()
		.then(() => {
			console.log('Seed completed, exiting.');
			process.exit(0);
		})
		.catch(err => {
			console.error('Seed failed:', err);
			process.exit(1);
		});
}