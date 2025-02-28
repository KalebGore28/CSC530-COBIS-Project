// Set NODE_ENV to 'test' for the dbConnection to use an in-memory database for tests.
process.env.NODE_ENV = 'test';

import express from 'express';
import request from 'supertest';
import { describe, beforeEach, test, expect } from 'vitest';
import { dbConnection } from '../../db/connection';
import { academicStanding } from '../../db/schema';
import { academicStandingRouter } from '../../routes/imports/academic_standing';
import exp from 'constants';

describe('Academic Standing Import Tests', () => {
	let app: express.Express;
	let orm: any;

	beforeEach(async () => {
		// Ensure a fresh in-memory DB is prepared.
		const db = await dbConnection;
		orm = db.orm;

		// Create a new Express app and mount the router.
		app = express();
		app.use(express.json());
		app.use('/api/import', academicStandingRouter);
	});

	test('should import academic standing data', async () => {
		// Define the data to import.
		const mappedData = [
			{ code: 'GPA', description: 'Good Standing' },
			{ code: 'PRO', description: 'Probation' },
			{ code: 'SUS', description: 'Suspension' },
			{ code: 'DIS', description: 'Dismissal' },
		];

		// Simulate a POST request to the import endpoint.
		const response = await request(app)
			.post('/api/import/academic_standing')
			.send({
				mappedData,
				fileName: 'test.csv',
				importedBy: 'tester',
			});

		// Verify the response.
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Academic standing imported successfully.');

		// Verify the data was imported.
		const rows = await orm.select().from(academicStanding).execute();
		expect(rows).toHaveLength(4);
	});
});