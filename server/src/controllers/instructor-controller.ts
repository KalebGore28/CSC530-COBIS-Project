import { Request, Response, NextFunction } from 'express';
import { AuthAndPermissionsRequest } from '../types/requests';
import { InstructorsService } from '../services/instructor-service';
import { InstructorAccessService } from '../services/instructor-access-service';

/**
 * Controller for instructor-related endpoints
 */
export class InstructorController {
	// See middleware/check-instructor-access.ts for the implementation

	/**
	 * Get instructors - department chairs can only see instructors in their department
	 */
	static async getInstructors(req: Request, res: Response) {
		try {
			const authReq = req as AuthAndPermissionsRequest;
			const accessService = new InstructorAccessService();

			// Check permissions
			const isAdmin = authReq.roles.some(role => role.role_name === 'cobis_administrator');
			const isDeptChair = authReq.roles.some(role => role.role_name === 'department_chair');

			// For department chairs, filter by their department
			// For admins, no filter (return all instructors)
			// For others, return forbidden
			let departmentCode: string | undefined;

			if (isDeptChair && !isAdmin) {
				// Department chairs can only see instructors in their department
				departmentCode = authReq.department || undefined;

				if (!departmentCode) {
					res.status(400).json({ error: 'Department chair has no associated department' });
					return;
				}
			} else if (!isAdmin) {
				// Regular users cannot access this endpoint
				res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
				return;
			}

			// Get instructors (filtered by department for chairs, all for admins)
			const instructors = await InstructorsService.getInstructors(departmentCode);

			res.json(instructors);
			return;
			/* v8 ignore next 5 */
		} catch (error) {
			console.error('Error fetching instructors:', error);
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

			res.json({ mnumber, instructorInfo });
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

			res.json({ mnumber, currentStatus });
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

			res.json({ mnumber, teachingSummary });
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

			res.json({ mnumber, courseDetails });
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

			res.json({ mnumber, termSummaries });
			return;
		} catch (error) {
			console.error('Error fetching term summaries:', error);
			res.status(500).json({ error: 'Internal server error' });
			return
		}
	}

	/**
	 * Get class roster for a specific course
	 */
	static async getClassRoster(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;
			const { subject, number, suffix, term, year } = req.query;

			// Validate required parameters
			if (!subject || !number || !term || !year) {
				res.status(400).json({
					error: 'Missing required parameters. Please provide subject, number, term, and year.'
				});
				return;
			}

			// Parse and validate parameters
			const courseSubject = subject as string;
			const courseNumber = number as string;
			const courseSuffix = (suffix as string) || ''; // Default to empty string if not provided
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
				courseSubject,
				courseNumber,
				courseSuffix,
				termCode,
				yearNum
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
			console.error('Error fetching class roster:', error);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}
}