// Set NODE_ENV to 'test' for the dbConnection to use an in-memory database for tests.
process.env.NODE_ENV = 'test';

import { describe, beforeEach, test, expect } from 'vitest';
import { dbConnection } from '../../db/connection';
import { importCollegeCodes } from '../../routes/imports/college_codes';
import { collegeCodes } from '../../db/schema';

describe('College Codes Import Tests', () => {
	let orm: any;

	beforeEach(async () => {
		// Create and prepare a new in-memory database for each test
		const db = await dbConnection;
		orm = db.orm;
	});

	test('should import college codes data', async () => {
		// Define the data to import
		const mappedData = [
			{ code: 'A', description: 'Associate Degree' },
			{ code: 'AA', description: 'Associate of Arts' },
			{ code: 'AS', description: 'Associate of Science' },
			{ code: 'B', description: 'Bachelor Degree' },
		];

		// Import the data
		const result = await importCollegeCodes(mappedData, 'college_codes.csv', 'test');

		// Check the result
		expect(result).toEqual({
			totalRecords: 4,
			errorDetails: [],
		});

		// Check the data was imported
		const rows = await orm.select().from(collegeCodes).execute();
		expect(rows).toHaveLength(4);
	});
});