import { Request, Response, NextFunction } from 'express';
import { AuthAndPermissionsRequest } from '../types/requests';
import { InstructorService } from '../services/instructor-service';
import { UtilityService } from '../services/utility-service';
import { z } from 'zod';
import 'zod-openapi/extend';

// --- Validation Schemas ---
export const instructorMnumberSchema = z.object({
	mnumber: z
		.string()
		.regex(/^[Mm]\d+$/i, { message: 'Invalid M-number format. Must start with "m" followed by digits.' })
		// .transform((mnumber) => mnumber.toUpperCase())
		.openapi({ description: 'M-number of the instructor' }),
})

export const getCourseDetailsQuerySchema = z.object({
	term: z
		.string()
		.openapi({ description: 'Academic term (e.g. Fall)' }),
	year: z
		.preprocess((val) => {
			// coerce "2025" → 2025
			if (typeof val === 'string' && val.trim() !== '') return parseInt(val, 10);
			if (typeof val === 'number') return val;
			return undefined;
		}
			, z
				.number()
				.int()
				.positive()
				.openapi({ description: 'Calendar year (e.g. 2025)' })
		),
})

export const getClassRosterQuerySchema = z.object({
	subject: z
		.string()
		.openapi({ description: 'Course subject code (e.g. CS)' }),
	number: z
		.preprocess((val) => {
			// coerce "101" → 101
			if (typeof val === 'string' && val.trim() !== '') return parseInt(val, 10);
			if (typeof val === 'number') return val;
			return undefined;
		}
			, z
				.number()
				.int()
				.positive()
				.openapi({ description: 'Course number (e.g. 101)' })
		),
	suffix: z
		.string()
		.optional()
		.openapi({ description: 'Course suffix (e.g. A)' }),
	term: z
		.string()
		.openapi({ description: 'Academic term (e.g. Fall)' }),
	year: z
		.preprocess((val) => {
			// coerce "2025" → 2025
			if (typeof val === 'string' && val.trim() !== '') return parseInt(val, 10);
			if (typeof val === 'number') return val;
			return undefined;
		}
			, z
				.number()
				.int()
				.positive()
				.openapi({ description: 'Calendar year (e.g. 2025)' })
		),
	section: z
		.string()
		.openapi({ description: 'Course section (e.g. 001)' }),
})

export const getGradeTrendsQuerySchema = z.object({
	start_year: z
		.preprocess((val) => {
			// coerce "2025" → 2025
			if (typeof val === 'string' && val.trim() !== '') return parseInt(val, 10);
			if (typeof val === 'number') return val;
			return undefined;
		}
			, z
				.number()
				.int()
				.positive()
				.openapi({ description: 'Start year for grade trends (e.g. 2025)' })
		),
	end_year: z
		.preprocess((val) => {
			// coerce "2025" → 2025
			if (typeof val === 'string' && val.trim() !== '') return parseInt(val, 10);
			if (typeof val === 'number') return val;
			return undefined;
		}
			, z
				.number()
				.int()
				.positive()
				.openapi({ description: 'End year for grade trends (e.g. 2025)' })
		),
	start_term: z
		.string()
		.optional()
		.openapi({ description: 'Academic term (e.g. Fall)' }),
	end_term: z
		.string()
		.optional()
		.openapi({ description: 'Academic term (e.g. Fall)' }),
})

/**
 * Controller for instructor-related endpoints
 */
export class InstructorController {
	/**
	 * Middleware to check if user can access instructor data
	 */
	static async checkInstructorAccess(req: Request, res: Response, next: NextFunction) {
		const authReq = req as AuthAndPermissionsRequest;
		const validationResult = instructorMnumberSchema.safeParse(authReq.params);
		if (!validationResult.success) {
			res.status(400).json({
				error: 'Invalid M-number format.',
				details: validationResult.error.format()
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
	 * Get instructors - department chairs can only see instructors in their department
	 */
	static async getInstructors(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		// Check permissions
		const isCOBISAdmin = authReq.roles.some(role => role.role_name === 'cobis_administrator');
		const isDeptChair = authReq.roles.some(role => role.role_name === 'department_chair');

		// Check if user is admin or department chair
		if (!isCOBISAdmin && !isDeptChair) {
			res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
			return;
		}

		let departmentCode: string | undefined;

		// If the user is a department chair, get their department code
		if (isDeptChair) {
			departmentCode = authReq.department || undefined;
			if (!departmentCode) {
				res.status(400).json({ error: 'Department chair has no associated department' });
				return;
			}
		}

		// If the user is COBIS admin, leave departmentCode undefined to get all instructors

		try {
			// Get instructors (filtered by department for chairs, all for admins)
			const instructors = await InstructorService.getInstructors(departmentCode);

			res.json(instructors);
			return;
			/* v8 ignore next 5 */
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get basic instructor information
	 */
	static async getBasicInfo(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		// checkAccess middleware has already validated the mnumber
		const { mnumber } = authReq.params;

		try {
			// Check if instructor exists
			if (!(await InstructorService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			const instructorInfo = await InstructorService.getBasicInfo(mnumber);

			res.json({ mnumber, instructorInfo });
			return;
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get current teaching status
	 */
	static async getCurrentStatus(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		// checkAccess middleware has already validated the mnumber
		const { mnumber } = authReq.params;

		try {
			// Check if instructor exists
			if (!(await InstructorService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			// Get current status
			const currentStatus = await InstructorService.getCurrentStatus(mnumber);

			res.json({ mnumber, currentStatus });
			return;
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get teaching summary
	 */
	static async getTeachingSummary(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		// checkAccess middleware has already validated the mnumber
		const { mnumber } = authReq.params;

		try {
			// Check if instructor exists
			if (!(await InstructorService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			// Get teaching summary
			const teachingSummary = await InstructorService.getTeachingSummary(mnumber);

			res.json({ mnumber, teachingSummary });
			return;
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get course details for an instructor in a specific term and year
	 */
	static async getCourseDetails(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		// checkAccess middleware has already validated the mnumber
		const { mnumber } = authReq.params;

		// validate & parse query
		const parsed = getCourseDetailsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			res.status(400).json({
				error: 'Invalid query parameters.',
				details: parsed.error.format(),
			});
			return;
		}

		const { term, year } = parsed.data;

		try {
			// Verify instructor exists
			if (!(await InstructorService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			// Get course details
			const courseDetails = await InstructorService.getCourseDetails(
				mnumber,
				term,
				year
			);

			res.json({
				mnumber,
				term,
				year,
				courseDetails
			});
			return;
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get term summaries
	 */
	static async getTermSummaries(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		// checkAccess middleware has already validated the mnumber
		const { mnumber } = authReq.params;

		try {
			// Check if instructor exists
			if (!(await InstructorService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			// Get term summaries
			const termSummaries = await InstructorService.getTermSummaries(mnumber);

			res.json({ mnumber, termSummaries });
			return;
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
			return
		}
	}

	/**
	 * Get class roster for a specific course
	 */
	static async getClassRoster(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		// checkAccess middleware has already validated the mnumber
		const { mnumber } = authReq.params;

		// validate & parse query
		const parsed = getClassRosterQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			res.status(400).json({
				error: 'Invalid query parameters.',
				details: parsed.error.format(),
			});
			return;
		}
		const { subject, number, suffix = '', term, year, section } = parsed.data;

		try {
			// Check if instructor exists
			if (!(await InstructorService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}


			// Get class roster
			const classRoster = await InstructorService.getClassRoster(
				mnumber,
				subject,
				number,
				suffix,
				section,
				term,
				year
			);

			if (!classRoster) {
				res.status(404).json({
					error: 'Class not found or not taught by this instructor'
				});
				return;
			}

			res.json({ mnumber, classRoster });
			return;
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get grade distribution trends for an instructor over a specified time period
	 */
	static async getGradeTrends(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		// checkAccess middleware has already validated the mnumber
		const { mnumber } = authReq.params;

		// validate & parse query
		const parsed = getGradeTrendsQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			res.status(400).json({
				error: 'Invalid query parameters.',
				details: parsed.error.format(),
			});
			return;
		}


		try {
			// Get current term
			const { term: currentTerm } = await UtilityService.getCurrentTermAndYear();

			const { start_year, end_year, start_term = '10', end_term = currentTerm } = parsed.data;

			
			// Check if instructor exists
			if (!(await InstructorService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			// Get grade trends for the specified time period
			const gradeTrends = await InstructorService.getGradeTrends(
				mnumber,
				{
					term: start_term,
					year: start_year
				},
				{
					term: end_term,
					year: end_year
				}
			);

			res.json({
				mnumber,
				start_year,
				end_year,
				gradeTrends
			});
			return;
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}
}