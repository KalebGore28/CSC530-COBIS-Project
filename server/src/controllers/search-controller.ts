import { Request, Response } from 'express';
import { SearchService } from '../services/search-service';
import { z } from 'zod';
import 'zod-openapi/extend';

// --- Validation Schemas ---
const querySchema = z.object({
	query: z.string().openapi({
		description: 'The search query string',
		example: 'Computer Science',
	}),
});

/**
 * Controller for handling search operations
 */
export class SearchController {
	/**
	 * Validate the query parameter and ensure it's a string
	 */
	private static validateQuery(req: Request, res: Response): string | null {
		const validationResult = querySchema.safeParse(req.query);
		if (!validationResult.success) {
			res.status(400).json({
				error: "Invalid query parameter. It should be a string.",
				details: validationResult.error.errors,
			});
			return null;
		}

		return validationResult.data.query;
	}

	/**
	 * Search academic standings
	 */
	static async searchAcademicStandings(req: Request, res: Response) {
		const query = SearchController.validateQuery(req, res);
		if (!query) return;

		try {
			const results = await SearchService.searchAcademicStandings(query);
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	/**
	 * Search admit codes
	 */
	static async searchAdmitCodes(req: Request, res: Response) {
		const query = SearchController.validateQuery(req, res);
		if (!query) return;

		try {
			const results = await SearchService.searchAdmitCodes(query);
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	/**
	 * Search colleges
	 */
	static async searchColleges(req: Request, res: Response) {
		const query = SearchController.validateQuery(req, res);
		if (!query) return;

		try {
			const results = await SearchService.searchColleges(query);
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	/**
	 * Search college codes
	 */
	static async searchCollegeCodes(req: Request, res: Response) {
		const query = SearchController.validateQuery(req, res);
		if (!query) return;

		try {
			const results = await SearchService.searchCollegeCodes(query);
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	/**
	 * Search courses
	 */
	static async searchCourses(req: Request, res: Response) {
		const query = SearchController.validateQuery(req, res);
		if (!query) return;

		try {
			const results = await SearchService.searchCourses(query);
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	/**
	 * Search departments
	 */
	static async searchDepartments(req: Request, res: Response) {
		const query = SearchController.validateQuery(req, res);
		if (!query) return;

		try {
			const results = await SearchService.searchDepartments(query);
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	/**
	 * Search nations
	 */
	static async searchNations(req: Request, res: Response) {
		const query = SearchController.validateQuery(req, res);
		if (!query) return;

		try {
			const results = await SearchService.searchNations(query);
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	/**
	 * Search part of terms
	 */
	static async searchPartOfTerms(req: Request, res: Response) {
		const query = SearchController.validateQuery(req, res);
		if (!query) return;

		try {
			const results = await SearchService.searchPartOfTerms(query);
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	/**
	 * Search programs
	 */
	static async searchPrograms(req: Request, res: Response) {
		const query = SearchController.validateQuery(req, res);
		if (!query) return;

		try {
			const results = await SearchService.searchPrograms(query);
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	/**
	 * Search registration statuses
	 */
	static async searchRegistrationStatuses(req: Request, res: Response) {
		const query = SearchController.validateQuery(req, res);
		if (!query) return;

		try {
			const results = await SearchService.searchRegistrationStatuses(query);
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	/**
	 * Search terms
	 */
	static async searchTerms(req: Request, res: Response) {
		const query = SearchController.validateQuery(req, res);
		if (!query) return;

		try {
			const results = await SearchService.searchTerms(query);
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}

	/**
	 * Search faculty
	 */
	static async searchFaculty(req: Request, res: Response) {
		const query = SearchController.validateQuery(req, res);
		if (!query) return;

		try {
			const results = await SearchService.searchFaculty(query);
			res.json(results);
		} catch (error) {
			res.status(500).json({ error: "Internal server error" });
		}
	}
} 