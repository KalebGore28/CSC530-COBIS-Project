// Set NODE_ENV to 'test' for the dbConnection to use an in-memory database for tests.
process.env.NODE_ENV = 'test';

import express from 'express';
import request from 'supertest';
import { describe, beforeEach, test, expect } from 'vitest';
import { resetDbConnection, getDbConnection } from '../../db/connection';
import { colleges } from '../../db/schema';
import { collegesRouter } from '../../routes/imports/colleges';

describe('Colleges Import Tests', () => {
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
		app.use('/api/import', collegesRouter);
	});

	test('should import colleges data', async () => {
		// Define the data to import.
		const mappedData = [
			{ code: 'A', description: 'College of Agriculture' },
			{ code: 'B', description: 'College of Business' },
			{ code: 'C', description: 'College of Computing' },
			{ code: 'D', description: 'College of Design' },
		];

		// Simulate a POST request to the import endpoint.
		const response = await request(app)
			.post('/api/import/colleges')
			.send({
				mappedData,
				fileName: 'test.csv',
				importedBy: 'tester',
			});

		// Verify the response.
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Colleges imported successfully.');

		// Verify the data was imported.
		const rows = await orm.select().from(colleges).execute();
		expect(rows).toHaveLength(4);
	});
});