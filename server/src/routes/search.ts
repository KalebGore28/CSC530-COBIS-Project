import express, { Request, Response } from 'express';
import { sql } from "drizzle-orm";
import { getDbConnection } from "../db/connection"; // Adjust path to your DB setup
import { courses } from "../db/models/courses"; // Adjust path to your schema

const router = express.Router();

/**
 * GET /search/courses
 * Query Params:
 * - query: The course code to search for (e.g., "CSC200T", "CSC20")
 * Returns: A list of courses matching the search query with their descriptions
 */
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

export default router;