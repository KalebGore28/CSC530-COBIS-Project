import { Request, Response } from 'express';
import { SearchService } from '../services/search-service';

/**
 * Controller for handling search operations
 */
export class SearchController {
	/**
	 * Validate the query parameter and ensure it's a string
	 */
	private static validateQuery(req: Request, res: Response): string | null {
		const { query } = req.query;

		if (!query || typeof query !== 'string') {
			res.status(400).json({ error: "Missing or invalid 'query' parameter." });
			return null;
		}

		return query;
	}

	/**
	 * Generic error handler for search endpoints
	 */
	private static handleError(res: Response, entityType: string, error: any) {
		console.error(`Error fetching ${entityType}:`, error);
		res.status(500).json({ error: "Internal server error" });
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
			SearchController.handleError(res, 'academic standings', error);
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
			SearchController.handleError(res, 'admit codes', error);
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
			SearchController.handleError(res, 'colleges', error);
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
			SearchController.handleError(res, 'college codes', error);
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
			SearchController.handleError(res, 'courses', error);
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
			SearchController.handleError(res, 'departments', error);
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
			SearchController.handleError(res, 'nations', error);
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
			SearchController.handleError(res, 'part of terms', error);
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
			SearchController.handleError(res, 'programs', error);
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
			SearchController.handleError(res, 'registration statuses', error);
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
			SearchController.handleError(res, 'terms', error);
		}
	}
} 