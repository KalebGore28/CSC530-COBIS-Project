// Set NODE_ENV to 'test' for the dbConnection to use an in-memory database for tests.
process.env.NODE_ENV = 'test';

import { describe, beforeEach, test, expect } from 'vitest';
import { dbConnection } from '../../db/connection';
import { importColleges } from '../../routes/imports/colleges';
import { colleges } from '../../db/schema';

describe('Colleges Import Tests', () => {
	let orm: any;

	beforeEach(async () => {
		// Create and prepare a new in-memory database for each test
		const db = await dbConnection;
		orm = db.orm;
	});

	test('should import colleges data', async () => {
		// Define the data to import
		const mappedData = [
			{ code: 'ART', description: 'Arts' },
			{ code: 'SCI', description: 'Science' },
			{ code: 'ENG', description: 'Engineering' },
			{ code: 'BUS', description: 'Business' },
		];

		// Import the data
		const result = await importColleges(mappedData, 'colleges.csv', 'test');

		// Check the result
		expect(result).toEqual({
			totalRecords: 4,
			errorDetails: [],
		});

		// Check the data was imported
		const rows = await orm.select().from(colleges).execute();
		expect(rows).toHaveLength(4);
	});
});