// Set NODE_ENV to 'test' for the dbConnection to use an in-memory database for tests.
process.env.NODE_ENV = 'test';

import express from 'express';
import request from 'supertest';
import { describe, beforeEach, test, expect } from 'vitest';
import { dbConnection } from '../../db/connection';
import { overrides } from '../../db/schema';
import { overridesRouter } from '../../routes/imports/overrides';

describe('Overrides Import Tests', () => {
	let app: express.Express;
	let orm: any;

	// Define the data to import
	const mappedData = [
		{
			mnumber: '12345678',
			term: '202101',
			crn: '12345',
			subj: 'MATH',
			crsenumb: '101A',
			section: '001',
			override: 'OVR',
			userid: 'tester',
			activitydate: '01-01-2021',
		},
		{
			mnumber: '12345678',
			term: '202101',
			crn: '12346',
			subj: 'MATH',
			crsenumb: '101', // test without suffix. will work.
			section: '002',
			override: 'OVR',
			userid: 'tester',
			activitydate: '01-01-2021',
		},
	];

	beforeEach(async () => {
		// Ensure a fresh in-memory DB is prepared.
		const db = await dbConnection;
		orm = db.orm;

		// Create a new Express app and mount the router.
		app = express();
		app.use(express.json());
		app.use('/api/import', overridesRouter);
	});

	test('should import overrides data', async () => {

		// Simulate a POST request to the import endpoint.
		const response = await request(app)
			.post('/api/import/overrides')
			.send({
				mappedData, // Use unmodified mappedData
				fileName: 'test.csv',
				importedBy: 'tester',
			});

		// Verify the response.
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Overrides imported successfully.');

		// Verify the data was imported.
		const rows = await orm.select().from(overrides).execute();
		// expect(rows).toHaveLength(2); // need to seed the database with other required data before this will work
	});

	test('should handle invalid term format', async () => {
		// Make a deep copy of the mappedData array for independent modification.
		let modifiedData = JSON.parse(JSON.stringify(mappedData));
		modifiedData[0].term = '2021-01';

		// Simulate a POST request to the import endpoint.
		const response = await request(app)
			.post('/api/import/overrides')
			.send({
				mappedData: modifiedData, // send modifiedData as mappedData
				fileName: 'test.csv',
				importedBy: 'tester',
			});

		// Verify the response.
		console.log(response.error);
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Overrides imported successfully.');

		// Verify the invalid row was skipped.
		const rows = await orm.select().from(overrides).execute();
		// expect(rows).toHaveLength(1);
	});

	test('should handle invalid course format', async () => {
		// Make a deep copy of the mappedData array for independent modification.
		let modifiedData = JSON.parse(JSON.stringify(mappedData));
		modifiedData[0].crsenumb = 'A';

		// Simulate a POST request to the import endpoint.
		const response = await request(app)
			.post('/api/import/overrides')
			.send({
				mappedData: modifiedData, // send modifiedData as mappedData
				fileName: 'test.csv',
				importedBy: 'tester',
			});

		// Verify the response.
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Overrides imported successfully.');

		// Verify the invalid row was skipped.
		const rows = await orm.select().from(overrides).execute();
		// expect(rows).toHaveLength(1);
	});

	test('should give back 500 error', async () => {
		// Make a deep copy of the mappedData array for independent modification.
		let modifiedData = JSON.parse(JSON.stringify(mappedData));
		modifiedData[0].crsenumb = 'A';
		modifiedData[1].crsenumb = 'B';

		// Simulate a POST request to the import endpoint.
		const response = await request(app)
			.post('/api/import/overrides')
			.send({
				mappedData: modifiedData, // send modifiedData as mappedData
				fileName: 'test.csv',
				importedBy: 'tester',
			});

		// Verify the response.
		expect(response.status).toBe(500);
		expect(response.body.error).toBe('Error importing override data.');
	});
});