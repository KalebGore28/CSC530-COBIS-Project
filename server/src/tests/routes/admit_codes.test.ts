// Set NODE_ENV to 'test' for the dbConnection to use an in-memory database for tests.
process.env.NODE_ENV = 'test';

import { describe, beforeEach, test, expect } from 'vitest';
import { dbConnection } from '../../db/connection';
import { importAdmitCodes } from '../../routes/imports/admit_codes';
import { admitCodes } from '../../db/schema';

describe('Admit Codes Import Tests', () => {
	let orm: any;

	beforeEach(async () => {
		// Create and prepare a new in-memory database for each test
		const db = await dbConnection;
		orm = db.orm;
	});

	test('should import admit codes data', async () => {
		// Define the data to import
		const mappedData = [
			{ code: 'F', description: 'Freshman' },
			{ code: 'S', description: 'Sophomore' },
			{ code: 'J', description: 'Junior' },
			{ code: 'SR', description: 'Senior' },
		];

		// Import the data
		const result = await importAdmitCodes(mappedData, 'admit_codes.csv', 'test');

		// Check the result
		expect(result).toEqual({
			totalRecords: 4,
			errorDetails: [],
		});

		// Check the data was imported
		const rows = await orm.select().from(admitCodes).execute();
		expect(rows).toHaveLength(4);
	});
});