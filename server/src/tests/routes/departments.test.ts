// Set NODE_ENV to 'test' for the dbConnection to use an in-memory database for tests.
process.env.NODE_ENV = 'test';

import express from 'express';
import request from 'supertest';
import { describe, beforeEach, test, expect } from 'vitest';
import { resetDbConnection, getDbConnection } from '../../db/connection';
import { departments, colleges } from '../../db/schema';
import { departmentsRouter } from '../../routes/imports/departments';

// We need to import colleges data to test departments import since
// departments have a foreign key relationship with colleges.
import { importCSV } from '../../utils/importCSV';

describe('Departments Import Tests', () => {
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
		app.use('/api/import', departmentsRouter);

		// Import colleges data.
		const mappedData = await importCSV('../../csvs/colleges.csv');
		await orm.insert(colleges).values(mappedData).execute();
	});

	test('should import departments data', async () => {
		// Define the data to import.
		const mappedData = [
			{ code: 'A', description: 'Department of Agriculture', prefixes: 'AG', canvas_id: '123', college: '0' },
			{ code: 'B', description: 'Department of Business', prefixes: 'BUS', canvas_id: '456', college: '0' },
			{ code: 'C', description: 'Department of Computing', prefixes: null, canvas_id: null, college: null }, // Test null values
			{ code: 'D', description: 'Department of Design', prefixes: 'DES', canvas_id: '012', college: '0' },
		];

		// Simulate a POST request to the import endpoint.
		const response = await request(app)
			.post('/api/import/departments')
			.send({
				mappedData,
				fileName: 'test.csv',
				importedBy: 'tester',
			});

		// Verify the response.
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Departments imported successfully.');

		// Verify the data was imported.
		const rows = await orm.select().from(departments).execute();
		expect(rows).toHaveLength(4);
	});
});