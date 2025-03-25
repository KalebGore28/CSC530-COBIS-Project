import express, { Request, Response } from 'express';
import { sql } from "drizzle-orm";
import { getDbConnection } from "../db/connection";
import {
	academicStanding,
	colleges,
	courses,
	departments,
	programs,
} from '../db/schema';
import 'zod-openapi/extend';
import { z } from 'zod';

const router = express.Router();

router.get('/academic-standings', async (req: Request, res: Response) => {
	const dbConnectionInstance = await getDbConnection();
	const db = dbConnectionInstance.orm;

	// Extract query parameter
	const { query } = req.query;

	// Validate input
	if (!query || typeof query !== 'string') {
		res.status(400).json({ error: "Missing or invalid 'query' parameter." });
		return;
	}

	try {
		// Convert query to uppercase for case-insensitive search
		const searchQuery = query.toUpperCase();

		// Search academic standings where code starts with the query
		const results = await db
			.select({
				code: academicStanding.code,
				description: academicStanding.description,
			})
			.from(academicStanding)
			.where(
				sql`
					UPPER(${academicStanding.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${academicStanding.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10); // Limit to 10 results

		// Return results as JSON
		res.json(results);
		return;
	} catch (error) {
		console.error("Error fetching academic standings:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});

// Preparing OpenAPI spec
const academicStandingsQuery = z.string().openapi({ description: 'The search query', example: 'GS', ref: 'academic_standing_search_query' });
const academicStandingSearchSpec = {
	'/api/search/academic-standings': {
		get: {
			tags: ['Search'],
			operationId: 'search_academic_standings',
			description: 'Search for academic standings',
			requestParams: {
				query: z.object({
					query: academicStandingsQuery,
				}),
			},
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.array(z.object({
								code: z.string(),
								description: z.string(),
							})),
						},
					},
				},
			},
		},
	},
};

router.get('/colleges', async (req: Request, res: Response) => {
	const dbConnectionInstance = await getDbConnection();
	const db = dbConnectionInstance.orm;

	// Extract query parameter
	const { query } = req.query;

	// Validate input
	if (!query || typeof query !== 'string') {
		res.status(400).json({ error: "Missing or invalid 'query' parameter." });
		return;
	}

	try {
		// Convert query to uppercase for case-insensitive search
		const searchQuery = query.toUpperCase();

		// Search colleges where code starts with the query
		const results = await db
			.select({
				code: colleges.code,
				name: colleges.description,
			})
			.from(colleges)
			.where(
				sql`
					UPPER(${colleges.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${colleges.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10); // Limit to 10 results

		// Return results as JSON
		res.json(results);
		return;
	} catch (error) {
		console.error("Error fetching colleges:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});

// Preparing OpenAPI spec
const collegesQuery = z.string().openapi({ description: 'The search query', example: 'BP', ref: 'college_search_query' });
const collegeSearchSpec = {
	'/api/search/colleges': {
		get: {
			tags: ['Search'],
			operationId: 'search_colleges',
			description: 'Search for colleges',
			requestParams: {
				query: z.object({
					query: collegesQuery,
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
}

router.get('/courses', async (req: Request, res: Response) => {
	const dbConnectionInstance = await getDbConnection();
	const db = dbConnectionInstance.orm;

	// Extract query parameter
	const { query } = req.query;

	// Validate input
	if (!query || typeof query !== 'string') {
		res.status(400).json({ error: "Missing or invalid 'query' parameter." });
		return;
	}

	try {
		// Convert query to uppercase for case-insensitive search
		const searchQuery = query.toUpperCase();

		// Search courses where combined code starts with the query
		const results = await db
			.select({
				subject: courses.subject,
				number: courses.number,
				suffix: courses.suffix,
				title: courses.title
			})
			.from(courses)
			.where(
				sql`
					UPPER(${courses.subject} || CAST(${courses.number} AS TEXT) || ${courses.suffix}) LIKE ${searchQuery + '%'} OR
					UPPER(${courses.title}) LIKE ${'%' + searchQuery + '%'}
				`
			)
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
					query: coursesQuery,
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
	const { query } = req.query;

	// Validate input
	if (!query || typeof query !== 'string') {
		res.status(400).json({ error: "Missing or invalid 'query' parameter." });
		return;
	}

	try {
		// Convert query to uppercase for case-insensitive search
		const searchQuery = query.toUpperCase();

		// Search departments where code starts with the query
		const results = await db
			.select({
				code: departments.code,
				name: departments.description,
			})
			.from(departments)
			.where(
				sql`
					UPPER(${departments.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${departments.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
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
					query: departmentsQuery,
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

router.get('/programs', async (req: Request, res: Response) => {
	const dbConnectionInstance = await getDbConnection();
	const db = dbConnectionInstance.orm;

	// Extract query parameter
	const { query } = req.query;

	// Validate input
	if (!query || typeof query !== 'string') {
		res.status(400).json({ error: "Missing or invalid 'query' parameter." });
		return;
	}

	try {
		// Convert query to uppercase for case-insensitive search
		const searchQuery = query.toUpperCase();

		// Search programs where code starts with the query
		const results = await db
			.select({
				code: programs.code,
				description: programs.description,
			})
			.from(programs)
			.where(
				sql`
					UPPER(${programs.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${programs.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10); // Limit to 10 results

		// Return results as JSON
		res.json(results);
		return;
	} catch (error) {
		console.error("Error fetching programs:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});

// Preparing OpenAPI spec
const programsQuery = z.string().openapi({ description: 'The search query', example: 'C110', ref: 'program_search_query' });
const programSearchSpec = {
	'/api/search/programs': {
		get: {
			tags: ['Search'],
			operationId: 'search_programs',
			description: 'Search for programs',
			requestParams: {
				query: z.object({
					query: programsQuery,
				}),
			},
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.array(z.object({
								code: z.string(),
								description: z.string(),
							})),
						},
					},
				},
			},
		},
	},
}

export const searchSpecs = {
	...academicStandingSearchSpec,
	...collegeSearchSpec,
	...courseSearchSpec,
	...departmentSearchSpec,
	...programSearchSpec,
}

export default router;