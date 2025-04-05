import express, { Request, Response } from 'express';
import { sql } from "drizzle-orm";
import { getDbConnection } from "../db/connection";
import {
	academicStanding,
	admitCodes,
	colleges,
	collegeCodes,
	courses,
	departments,
	nations,
	partOfTerm,
	programs,
	registrationStatus,
	terms,
} from '../db/schema';

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

router.get('/admit-codes', async (req: Request, res: Response) => {
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

		// Search admit codes where code starts with the query
		const results = await db
			.select({
				code: admitCodes.code,
				description: admitCodes.description,
			})
			.from(admitCodes)
			.where(
				sql`
					UPPER(${admitCodes.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${admitCodes.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10); // Limit to 10 results

		// Return results as JSON
		res.json(results);
		return;
	} catch (error) {
		console.error("Error fetching admit codes:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});

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

router.get('/college-codes', async (req: Request, res: Response) => {
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

		// Search college codes where code starts with the query
		const results = await db
			.select({
				code: collegeCodes.code,
				name: collegeCodes.description,
			})
			.from(collegeCodes)
			.where(
				sql`
					UPPER(${collegeCodes.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${collegeCodes.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10); // Limit to 10 results

		// Return results as JSON
		res.json(results);
		return;
	} catch (error) {
		console.error("Error fetching college codes:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
})

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

router.get('/nations', async (req: Request, res: Response) => {
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

		// Search nations where code starts with the query
		const results = await db
			.select({
				code: nations.code,
				name: nations.description,
			})
			.from(nations)
			.where(
				sql`
					UPPER(${nations.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${nations.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10); // Limit to 10 results

		// Return results as JSON
		res.json(results);
		return;
	} catch (error) {
		console.error("Error fetching nations:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});

router.get('/part-of-terms', async (req: Request, res: Response) => {
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

		// Search part of terms where code starts with the query
		const results = await db
			.select({
				code: partOfTerm.code,
				description: partOfTerm.description,
			})
			.from(partOfTerm)
			.where(
				sql`
					UPPER(${partOfTerm.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${partOfTerm.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10); // Limit to 10 results

		// Return results as JSON
		res.json(results);
		return;
	} catch (error) {
		console.error("Error fetching part of terms:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});

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
				cipCode: programs.cip_code,
				isMajor: programs.is_major,
				isMinor: programs.is_minor,
				hasConcentration: programs.has_concentration,
				isDiscontinued: programs.is_discontinued,
				isAacsb: programs.is_aacsb,
				department: programs.department,
				college: programs.college,

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

router.get('/registration-statuses', async (req: Request, res: Response) => {
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

		// Search registration statuses where code starts with the query
		const results = await db
			.select({
				code: registrationStatus.code,
				description: registrationStatus.description,
			})
			.from(registrationStatus)
			.where(
				sql`
					UPPER(${registrationStatus.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${registrationStatus.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10); // Limit to 10 results

		// Return results as JSON
		res.json(results);
		return;
	} catch (error) {
		console.error("Error fetching registration statuses:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});

router.get('/terms', async (req: Request, res: Response) => {
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

		// Search terms where code starts with the query
		const results = await db
			.select({
				code: terms.code,
				description: terms.description,
			})
			.from(terms)
			.where(
				sql`
					UPPER(${terms.code}) LIKE ${searchQuery + '%'} OR
					UPPER(${terms.description}) LIKE ${'%' + searchQuery + '%'}
				`
			)
			.limit(10); // Limit to 10 results

		// Return results as JSON
		res.json(results);
		return;
	} catch (error) {
		console.error("Error fetching terms:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});


export default router;