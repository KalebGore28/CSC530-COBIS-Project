// src/seed/seedDatabase.ts

import express from 'express';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Papa from "papaparse";
import { csvFileMappings } from '../../services/column-mapping-service';
import { createImportRouter } from '../../routes/import-router';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Seeds database with all of the csv files in the data/csvs directory.
 */
export const seedLookupTables = async () => {
	// Set up Express app for seeding
	const app = express()
		.use(express.json({ limit: "10mb" }))
		.use(express.urlencoded({ extended: true, limit: "10mb" }))
		.use('/api/import', createImportRouter(false)); // No auth for seeding

	// Define lookup tables that need explicit tableId
	const lookupTables = [
		{
			filePath: '../csvs/academic_standing.csv',
			tableId: 'academic-standing'
		},
		{
			filePath: '../csvs/admit_codes.csv',
			tableId: 'admit-codes'
		},
		{
			filePath: '../csvs/colleges.csv',
			tableId: 'colleges'
		},
		{
			filePath: '../csvs/departments.csv',
			tableId: 'departments'
		},
		{
			filePath: '../csvs/instructional_methods.csv',
			tableId: 'instructional-methods'
		},
		{
			filePath: '../csvs/nations.csv',
			tableId: 'nations'
		},
		{
			filePath: '../csvs/part_of_term.csv',
			tableId: 'part-of-term'
		},
		{
			filePath: '../csvs/major_minor.csv',
			tableId: 'programs'
		},
		{
			filePath: '../csvs/registration_status.csv',
			tableId: 'registration-status'
		},
		// {
		// 	filePath: '../csvs/terms.csv',
		// 	tableId: 'terms'
		// },
		// {
		// 	filePath: '../csvs/reg_cuba_catalog_202510_20250117.csv',
		// 	tableId: 'courses-catalog',
		// 	columnMapping: csvFileMappings.find(mapping => {
		// 		if (mapping.category === 'data') {
		// 			// then look through destinations to find the one with the correct tableId
		// 			const found = mapping.destinations.find(dest => dest.tableId === 'courses-catalog');
		// 			if (found) {
		// 				return true;
		// 			}
		// 		}
		// 	})
		// },
		// {
		// 	filePath: '../csvs/dept_course_prefix.csv',
		// 	tableId: 'course-prefixes',
		// }
	];

	const responses: any = [];

	console.log('Importing lookup tables...');
	for (const table of lookupTables) {
		console.log(`Importing ${path.basename(table.filePath)}...`);
		console.log(`Full path: ${path.resolve(__dirname, table.filePath)}`);

		Papa.parse(fs.readFileSync(path.resolve(__dirname, table.filePath), 'utf8'), {
			header: true,
			skipEmptyLines: true,
			transformHeader: (header) => {
				return header.toLowerCase();
			},
			complete: async (results) => {
				const response = await request(app)
					.post('/api/import/process')
					.send({
						tableId: table.tableId,
						csvData: results.data,
						columnMapping: table.columnMapping || undefined
					});
				responses.push({
					file: path.basename(table.filePath),
					status: response.status,
					success: response.body.success,
					error: response.status !== 200 ? response.body.error : undefined
				});
			},
			error: (error: any) => {
				console.error('Error parsing CSV:', error);
			}
		});
	}

	// Check if any imports failed
	await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for all requests to finish
	const failedImports = responses.filter((r: { status: number; }) => r.status !== 200);
	if (failedImports.length > 0) {
		console.error('Some imports failed:');
		failedImports.forEach((r: { file: any; status: any; success: any; error: any; }) => {
			console.error(`- ${r.file}: ${r.status} ${r.success ? 'Success' : 'Failed'}${r.error ? ` - Error: ${r.error}` : ''}`);
		});
		throw new Error('Database seeding failed for some lookup tables');
	}

	console.log('\nDatabase seeding completed successfully');
};

// Check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
	seedLookupTables()
		.then(() => {
			console.log('Seed completed, exiting.');
			process.exit(0);
		})
		.catch(err => {
			console.error('Seed failed:', err);
			process.exit(1);
		});
}