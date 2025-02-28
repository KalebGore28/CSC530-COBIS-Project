// Set NODE_ENV to 'test' for the dbConnection to use an in-memory database for tests.
process.env.NODE_ENV = 'test';

import express from 'express';
import request from 'supertest';
import { describe, beforeEach, test, expect } from 'vitest';
import { resetDbConnection, getDbConnection } from '../../db/connection';
import { courses } from '../../db/schema';
import { coursesRouter } from '../../routes/imports/courses';

describe('Courses Import Tests', () => {
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
		app.use('/api/import', coursesRouter);
	});

	test('should import courses data', async () => {
		// Define the data to import.
		const mappedData = [
			{ course: 'ACC200T', crsetitle: 'Accounting', crhrs: '3', course_fee: '100', web_fee: '50' },
			{ course: 'BIO100', crsetitle: 'Biology', crhrs: '4', course_fee: '150', web_fee: '75' },
			{ course: 'CSC300', crsetitle: 'Computer Science', crhrs: '3', course_fee: '200', web_fee: '100' },
			{ course: 'MAT400', crsetitle: 'Mathematics', crhrs: '4', course_fee: '250', web_fee: '125' },
		];

		// Simulate a POST request to the import endpoint.
		const response = await request(app)
			.post('/api/import/courses')
			.send({
				mappedData,
				fileName: 'test.csv',
				importedBy: 'tester',
			});

		// Verify the response.
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Courses imported successfully.');

		// Verify the data was imported.
		const rows = await orm.select().from(courses).execute();
		expect(rows).toHaveLength(4);
	});

	test('should handle invalid course names or default values', async () => {
		// Define the data to import.
		const mappedData = [
			{ course: 'ACC', crsetitle: 'Accounting', crhrs: '3', course_fee: '100', web_fee: '50' },
			{ course: 'BIO100', crsetitle: 'Biology', crhrs: '4', course_fee: '150', web_fee: '75' },
			{ course: 'CSC300', crsetitle: 'Computer Science', crhrs: null, course_fee: null, web_fee: null },			
		];

		// Simulate a POST request to the import endpoint.
		const response = await request(app)
			.post('/api/import/courses')
			.send({
				mappedData,
				fileName: 'test.csv',
				importedBy: 'tester',
			});

		// Verify the response.
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Courses imported successfully.');

		// Verify the data was imported.
		const rows = await orm.select().from(courses).execute();
		expect(rows).toHaveLength(2);
	});
});