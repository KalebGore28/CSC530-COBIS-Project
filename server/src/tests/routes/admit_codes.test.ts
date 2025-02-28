// Set NODE_ENV to 'test' for the dbConnection to use an in-memory database for tests.
process.env.NODE_ENV = 'test';

import express from 'express';
import request from 'supertest';
import { describe, beforeEach, test, expect } from 'vitest';
import { dbConnection } from '../../db/connection';
import { admitCodes } from '../../db/schema';
import { admitCodesRouter } from '../../routes/imports/admit_codes';


describe('Admit Codes Import Tests', () => {
	let app: express.Express;
	let orm: any;

	beforeEach(async () => {
		// Ensure a fresh in-memory DB is prepared.
		const db = await dbConnection;
		orm = db.orm;

		// Create a new Express app and mount the router.
		app = express();
		app.use(express.json());
		app.use('/api/import', admitCodesRouter);
	});

	test('should import admit codes data', async () => {
		// Define the data to import
		const mappedData = [
			{ code: 'F', description: 'Freshman' },
			{ code: 'S', description: 'Sophomore' },
			{ code: 'J', description: 'Junior' },
			{ code: 'SR', description: 'Senior' },
		];

		// Simulate a POST request to the import endpoint.
		const response = await request(app)
			.post('/api/import/admit_codes')
			.send({
				mappedData,
				fileName: 'test.csv',
				importedBy: 'tester',
			});

		// Verify the response.
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Admit codes imported successfully.');

		// Verify the data was imported.
		const rows = await orm.select().from(admitCodes).execute();
		expect(rows).toHaveLength(4);
	});
});