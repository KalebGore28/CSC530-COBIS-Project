import { Request, Response, NextFunction } from 'express';
import { AuthAndPermissionsRequest } from '../types/requests';
import { InstructorsService } from '../services/instructor-service';

/**
 * Controller for instructor-related endpoints
 */
export class InstructorController {
	/**
	 * Middleware to check if user can access instructor data
	 */
	static async checkAccess(req: Request, res: Response, next: NextFunction) {
		const authReq = req as AuthAndPermissionsRequest;
		const { mnumber } = req.params;

		try {
			// Check if user has necessary roles
			const isAdmin = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				['cobis_administrator'].includes(role.role_name)
			);

			const isDeptChair = authReq.roles.some((role: { role_name: string; role_id: number }) => role.role_name === 'department_chair');

			// Admins can access all instructors
			if (isAdmin) {
				next();
				return;
			}

			// Department chairs can access instructors in their department
			if (isDeptChair && authReq.department) {
				const instructorDept = await InstructorsService.getInstructorDepartment(mnumber);

				if (instructorDept && instructorDept === authReq.department) {
					return next();
				}
			}

			// Users can access their own data
			if (authReq.mnumber === mnumber) {
				return next();
			}

			// If none of the conditions are met, deny access
			res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
			return;
		} catch (error) {
			console.error('Error in permission middleware:', error);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get basic instructor information
	 */
	static async getBasicInfo(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;

			const instructorInfo = await InstructorsService.getBasicInfo(mnumber);

			if (!instructorInfo) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			res.json(instructorInfo);
			return;
		} catch (error) {
			console.error('Error fetching instructor data:', error);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get current teaching status
	 */
	static async getCurrentStatus(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;

			if (!(await InstructorsService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			const currentStatus = await InstructorsService.getCurrentStatus(mnumber);

			res.json(currentStatus);
			return;
		} catch (error) {
			console.error('Error fetching current status:', error);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get teaching summary
	 */
	static async getTeachingSummary(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;

			if (!(await InstructorsService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			const teachingSummary = await InstructorsService.getTeachingSummary(mnumber);

			res.json(teachingSummary);
			return;
		} catch (error) {
			console.error('Error fetching teaching summary:', error);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get course details
	 */
	static async getCourseDetails(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;

			if (!(await InstructorsService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			const courseDetails = await InstructorsService.getCourseDetails(mnumber);

			res.json(courseDetails);
			return;
		} catch (error) {
			console.error('Error fetching course details:', error);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get term summaries
	 */
	static async getTermSummaries(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;

			if (!(await InstructorsService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			const termSummaries = await InstructorsService.getTermSummaries(mnumber);

			res.json(termSummaries);
			return;
		} catch (error) {
			console.error('Error fetching term summaries:', error);
			res.status(500).json({ error: 'Internal server error' });
			return
		}
	}

	/**
	 * Get credit hours data for an instructor
	 */
	static async getCreditHoursData(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;
			const { term, year, startYear, endYear } = req.query;

			if (!(await InstructorsService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			// Parse query parameters
			const termCode = term as string | undefined;
			const yearNum = year ? parseInt(year as string) : undefined;
			const startYearNum = startYear ? parseInt(startYear as string) : undefined;
			const endYearNum = endYear ? parseInt(endYear as string) : undefined;

			// Validate year parameters if provided
			if (year && isNaN(yearNum as number)) {
				res.status(400).json({ error: 'Invalid year parameter' });
				return;
			}

			if ((startYear && isNaN(startYearNum as number)) || (endYear && isNaN(endYearNum as number))) {
				res.status(400).json({ error: 'Invalid year range parameters' });
				return;
			}

			// Get credit hours data
			const creditHoursData = await InstructorsService.getCreditHoursData(
				mnumber,
				termCode,
				yearNum,
				startYearNum,
				endYearNum
			);

			res.json(creditHoursData);
			return;
		} catch (error) {
			console.error('Error fetching credit hours data:', error);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get class roster for a specific course
	 */
	static async getClassRoster(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;
			const { crn, term, year } = req.query;

			// Validate required parameters
			if (!crn || !term || !year) {
				res.status(400).json({
					error: 'Missing required parameters. Please provide crn, term, and year.'
				});
				return;
			}

			// Parse and validate parameters
			const crnStr = crn as string;
			const termCode = term as string;
			const yearNum = parseInt(year as string);

			if (isNaN(yearNum)) {
				res.status(400).json({ error: 'Invalid parameters. Year must be a number.' });
				return;
			}

			// Check if instructor exists
			if (!(await InstructorsService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			// Get class roster
			const classRoster = await InstructorsService.getClassRoster(
				mnumber,
				crnStr,
				termCode,
				yearNum
			);

			if (!classRoster) {
				res.status(404).json({
					error: 'Class not found or not taught by this instructor'
				});
				return;
			}

			res.json(classRoster);
			return;
		} catch (error) {
			console.error('Error fetching class roster:', error);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

}