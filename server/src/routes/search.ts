import express, { Request, Response } from 'express';
import { sql } from "drizzle-orm";
import { getDbConnection } from "../db/connection"; // Adjust path to your DB setup
import { departments } from '../db/schema';
import { courses } from "../db/models/courses"; // Adjust path to your schema
import 'zod-openapi/extend';
import { z } from 'zod';

const router = express.Router();

router.get('/courses', async (req: Request, res: Response) => {
	const dbConnectionInstance = await getDbConnection();
	const db = dbConnectionInstance.orm;

	// Extract query parameter
	const { coursesQuery } = req.query;

	// Validate input
	if (!coursesQuery || typeof coursesQuery !== 'string') {
		res.status(400).json({ error: "Missing or invalid 'query' parameter." });
		return;
	}

	try {
		// Convert query to uppercase for case-insensitive search
		const searchQuery = coursesQuery.toUpperCase();

		// Search courses where combined code starts with the query
		const results = await db
			.select({
				subject: courses.subject,
				number: courses.number,
				suffix: courses.suffix,
				title: courses.title
			})
			.from(courses)
			.where(sql`UPPER(${courses.subject} || CAST(${courses.number} AS TEXT) || ${courses.suffix}) LIKE ${searchQuery + '%'}`)
			.limit(10); // Limit to 10 results

		// Return results as JSON
		res.json(results);
		return;
	} catch (error) {
		console.error("Error searching for courses:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});

// Preparing OpenAPI spec
const coursesQuery = z.string().openapi({ description: 'The search query', example: 'CSC101', ref: 'course_search_query' });
const courseSearchSpec = {
	'/api/search/courses': {
		get: {
			tags: ['Search'],
			operationId: 'search_courses',
			description: 'Search for courses',
			requestParams: {
				query: z.object({
					coursesQuery,
				}),
			},
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.array(z.object({
								subject: z.string(),
								number: z.string(),
								suffix: z.string(),
								title: z.string(),
							})),
						},
					},
				},

			}
		},
	},
};

router.get('/departments', async (req: Request, res: Response) => {
	const dbConnectionInstance = await getDbConnection();
	const db = dbConnectionInstance.orm;

	// Extract query parameter
	const { departmentsQuery } = req.query;

	// Validate input
	if (!departmentsQuery || typeof departmentsQuery !== 'string') {
		res.status(400).json({ error: "Missing or invalid 'query' parameter." });
		return;
	}

	try {
		// Get all departments
		const results = await db
			.select({
				code: departments.code,
				name: departments.description,
			})
			.from(departments)
			.where(sql`UPPER(${departments.code}) LIKE ${departmentsQuery.toUpperCase() + '%'}`)
			.limit(10); // Limit to 10 results

		// Return results as JSON
		res.json(results);
		return;
	} catch (error) {
		console.error("Error fetching departments:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});

// Preparing OpenAPI spec
const departmentsQuery = z.string().openapi({ description: 'The search query', example: 'BP', ref: 'department_search_query' });
const departmentSearchSpec = {
	'/api/search/departments': {
		get: {
			tags: ['Search'],
			operationId: 'search_departments',
			description: 'Search for departments',
			requestParams: {
				query: z.object({
					departmentsQuery,
				}),
			},
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.array(z.object({
								code: z.string(),
								name: z.string(),
							})),
						},
					},
				},
			},
		},
	},
};

export const searchSpecs = {
	...courseSearchSpec,
	...departmentSearchSpec,
}

export default router;