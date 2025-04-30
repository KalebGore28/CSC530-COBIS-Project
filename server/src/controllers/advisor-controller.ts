import { Request, Response, NextFunction } from 'express';
import { AuthAndPermissionsRequest } from '../types/requests';
import { AdvisorService } from '../services/advisor-service';
import { InstructorService } from '../services/instructor-service';
import { UtilityService } from '../services/utility-service';
import { z } from 'zod';
import 'zod-openapi/extend';

// --- Validation Schemas ---
export const instructorMnumberSchema = z.object({
	mnumber: z
		.string()
		.regex(/^[Mm]\d+$/i, { message: 'Invalid M-number format. Must start with "m" followed by digits.' })
		.openapi({ description: 'M-number of the instructor' }),
})

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
}).openapi({
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
		const validationResult = instructorMnumberSchema.safeParse(authReq.params);

		if (!validationResult.success) {
			res.status(400).json({
				error: 'Invalid M-number format.',
				details: validationResult.error.format(),
			});
			return;
		}

		const { mnumber } = validationResult.data;

		// Check user roles
		const isFaculty = authReq.roles.some((role: { role_name: string; role_id: number }) =>
			role.role_name === 'faculty');
		const isAdvisor = authReq.roles.some((role: { role_name: string; role_id: number }) =>
			role.role_name === 'advisor');
		const isProgramCoordinator = authReq.roles.some((role: { role_name: string; role_id: number }) =>
			role.role_name === 'program_coordinator');
		const isDeptChair = authReq.roles.some((role: { role_name: string; role_id: number }) =>
			role.role_name === 'department_chair');
		const isAdministrator = authReq.roles.some((role: { role_name: string; role_id: number }) =>
			role.role_name === 'administrator');
		const isCOBISAdmin = authReq.roles.some((role: { role_name: string; role_id: number }) =>
			role.role_name === 'cobis_administrator');

		// COBIS Administrators can access all advisors
		if (isCOBISAdmin) {
			next();
			return;
		}

		// For faculty, advisors, program coordinators, and administrators, limit access to their own data
		if (isFaculty || isAdvisor || isProgramCoordinator || isAdministrator && authReq.mnumber) {
			if (authReq.mnumber === mnumber) {
				next();
				return;
			}
		}

		// Department chairs can access advisors in their department
		if (isDeptChair && authReq.department) {
			const isAdvisorInDepartment = await InstructorService.isInstructorInDepartment(mnumber, authReq.department);
			if (isAdvisorInDepartment) {
				next();
				return;
			}
		}

		// For all other cases, deny access
		res.status(403).json({
			error: 'Access denied. Insufficient permissions to view this advisor data.',
		});
		return;
	}

	/**
	 * Get students advised by a specific advisor.
	 */
	static async getAdvisedStudents(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		// 1) checkAccess middleware has already validated the M-number format
		const { mnumber } = authReq.params;

		// 2) validate & parse query
		const parsed = getAdvisedStudentsQuerySchema.safeParse(authReq.query);
		if (!parsed.success) {
			// send back detailed Zod errors
			res.status(400).json({
				error: 'Invalid query parameters.',
				details: parsed.error.format(),
			});
			return;
		}

		try {
			// Get current term and year if not provided
			const { term: currentTerm, year: currentYear, termName } = await UtilityService.getCurrentTermAndYear();

			const { term = currentTerm, year = currentYear } = parsed.data;

			const advisedStudents = await AdvisorService.getAdvisedStudents({
				advisorMnumber: mnumber,
				term,
				year,
			});
			res.json({
				advisedStudents,
				term,
				year,
				termName,
			});
			return;
		} catch (error) {
			res.status(500).json({ error: 'Internal server error while fetching advised students.' });
			return;
		}
	}
}
