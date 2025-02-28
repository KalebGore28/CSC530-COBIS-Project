// Set NODE_ENV to 'test' for the dbConnection to use an in-memory database for tests.
process.env.NODE_ENV = 'test';

import { describe, beforeEach, test, expect } from 'vitest';
import { dbConnection } from '../../db/connection';
import { importAcademicStanding } from '../../routes/imports/academic_standing';
import { academicStanding } from '../../db/schema';

describe('Academic Standing Import Tests', () => {
	let orm: any;

	beforeEach(async () => {
		// Create and prepare a new in-memory database for each test
		const db = await dbConnection;
		orm = db.orm;
	});

	test('should import academic standing data', async () => {
		// Define the data to import
		const mappedData = [
			{ code: 'GPA', description: 'Good Standing' },
			{ code: 'PRO', description: 'Probation' },
			{ code: 'SUS', description: 'Suspension' },
			{ code: 'DIS', description: 'Dismissal' },
		];

		// Import the data
		const result = await importAcademicStanding(mappedData, 'academic_standing.csv', 'test');

		// Check the result
		expect(result).toEqual({
			totalRecords: 4,
			errorDetails: [],
		});

		// Check the data was imported
		const rows = await orm.select().from(academicStanding).execute();
		expect(rows).toHaveLength(4);
	});
});