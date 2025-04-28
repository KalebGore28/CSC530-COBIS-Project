import { Request, Response, NextFunction } from 'express';
import { AuthAndPermissionsRequest } from '../types/requests';
import { AdvisorService } from '../services/advisor-service';
import { z } from 'zod';
import 'zod-openapi/extend';

// --- Validation Schemas ---
export const getAdvisedStudentsQuerySchema = z.object({
	term: z
		.string()
		.optional()
		.openapi({ description: 'Academic term (e.g. Fall)' }),

	year: z
		.preprocess((val) => {
			// coerce "2025" → 2025
			if (typeof val === 'string' && val.trim() !== '') return parseInt(val, 10);
			if (typeof val === 'number') return val;
			return undefined;
		}, z
			.number()
			.int()
			.positive()
			.optional()
			.openapi({ description: 'Calendar year (e.g. 2025)' })
		),
})
	.openapi({
		description: 'Query parameters for fetching advised students',
		example: {
			term: 'Fall',
			year: 2025,
		}

	});


/**
 * Controller for advisor-related endpoints
 */
export class AdvisorController {

	/**
	 * Middleware to check if the user has advisor privileges or access to advisor data.
	 */
	static async checkAdvisorAccess(req: Request, res: Response, next: NextFunction) {
		const authReq = req as AuthAndPermissionsRequest;

		try {
			const isAdvisor = authReq.roles?.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'advisor');
			const isAdmin = authReq.roles?.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'cobis_administrator');

			if (isAdvisor || isAdmin) {
				if (!authReq.mnumber) {
					console.error('Advisor mnumber missing from authenticated request.');
					res.status(401).json({ error: 'User identifier not found.' });
					return;
				}
				next(); // User has access, proceed to the next handler
				return;
			}

			res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
			return;

		} catch (error) {
			console.error('Error in advisor permission middleware:', error);
			res.status(500).json({ error: 'Internal server error during permission check.' });
			return;
		}
	}

	/**
	 * Get students advised by the currently logged-in user.
	 */
	static async getAdvisedStudents(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		// 1) validate advisor identifier
		if (!authReq.mnumber) {
			console.error('Advisor mnumber is undefined.');
			return res.status(400).json({ error: 'Invalid advisor identifier.' });
		}

		// 2) validate & parse query
		const parsed = getAdvisedStudentsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			// send back detailed Zod errors
			return res.status(400).json({
				error: 'Invalid query parameters.',
				details: parsed.error.format(),
			});
		}
		const { term, year } = parsed.data;

		// 3) Fetch data
		try {
			const advisedStudents = await AdvisorService.getAdvisedStudents({
				advisorMnumber: authReq.mnumber!,
				term,
				year,
			});
			return res.json(advisedStudents);
		} catch (error) {
			console.error(`Error fetching advised students for advisor ${authReq.mnumber}:`, error);
			return res.status(500).json({ error: 'Internal server error while fetching advised students.' });
		}
	}
}
