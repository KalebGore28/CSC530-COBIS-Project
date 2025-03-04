// Set NODE_ENV to 'test' for the dbConnection to use an in-memory database for tests.
process.env.NODE_ENV = 'test';

import express from 'express';
import request from 'supertest';
import { describe, beforeEach, test, expect } from 'vitest';
import { resetDbConnection, getDbConnection } from '../../db/connection';
import { programs, departments, colleges } from '../../db/schema';
import { programsRouter } from '../../routes/imports/programs';

// We need to import departments and colleges data to test programs import since
// programs have foreign key relationships with departments and colleges.
import { importCSV } from '../../utils/importCSV';

describe('Programs Import Tests', () => {
	let app: express.Express;
	let orm: any;

	beforeEach(async () => {
		// Reset the DB connection so that each test starts fresh.
		await resetDbConnection();
		const { orm: freshOrm } = await getDbConnection();
		orm = freshOrm;

		// Create a new Express app and mount the router.
		app = express();
		app.use(express.json());
		app.use('/api/import', programsRouter);

		// Import departments and colleges data.
		const collegesData = await importCSV('../../csvs/colleges.csv');
		await orm.insert(colleges).values(collegesData).execute();
		
		const departmentsData = await importCSV('../../csvs/departments.csv');

		// Set default values for nulls in the college column to 0
		departmentsData.forEach(department => {
			if (department.college === 'NULL') {
				department.college = '0';
			}
		});

		await orm.insert(departments).values(departmentsData).execute();

	});

	test('should import programs data', async () => {
		// Define the data to import.
		const mappedData = [
			{
				code: 'CS',
				description: 'Computer Science',
				cip_code: '11.0701',
				is_major: '1',
				is_minor: '0',
				has_concentration: '1',
				is_discontinued: '0',
				is_aacsb: '0',
				department: 'CSC',
				college: 'BP',
			},
			{
				code: 'ENG',
				description: 'English',
				cip_code: '23.0101',
				is_major: '1',
				is_minor: '0',
				has_concentration: '0',
				is_discontinued: '0',
				is_aacsb: '0',
				department: 'ESL',
				college: 'ED',
			},
			{ // Test with NULL values for cip_code, department, and college
				code: 'MATH',
				description: 'Mathematics',
				cip_code: null,
				is_major: '1',
				is_minor: '0',
				has_concentration: '1',
				is_discontinued: '0',
				is_aacsb: '0',
				department: null,
				college: null,
			},
		];

		// Simulate a POST request to the import endpoint.
		const response = await request(app)
			.post('/api/import/programs')
			.send({
				mappedData,
				fileName: 'test.csv',
				importedBy: 'tester',
			});

		// Verify the response.
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Programs imported successfully.');

		// Verify the data was imported.
		const rows = await orm.select().from(programs).execute();
		expect(rows).toHaveLength(3);
	});
});