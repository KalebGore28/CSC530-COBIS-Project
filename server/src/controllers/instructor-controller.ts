import { Request, Response, NextFunction } from 'express';
import { AuthAndPermissionsRequest } from '../types/requests';
import { InstructorService } from '../services/instructor-service';
import { InstructorAccessService } from '../services/instructor-access-service';

/**
 * Controller for instructor-related endpoints
 */
export class InstructorController {
	/**
	 * Middleware to check if user can access instructor data
	 * Exact recreation of checkStudentAccess.
	 */
	static async checkInstructorAccess(req: Request, res: Response, next: NextFunction) {
		const user = req as AuthAndPermissionsRequest;
		const instructorMnumber = req.params.mnumber;

		const accessService = new InstructorAccessService();

		try {
			const canAccess = await accessService.canAccessInstructor(user, instructorMnumber);

			if (!canAccess) {
				res.status(403).json({
					error: 'Access denied. Insufficient permissions to view this instructor data.'
				});
				return;
			}

			// Add the access service to the request for later use in controllers
			user.instructorAccessService = accessService;

			next();
		} catch (error) {
			console.error('Error checking instructor access:', error);
			res.status(500).json({ error: 'Internal server error during access check' });
		}
	}

	/**
	 * Get instructors - department chairs can only see instructors in their department
	 */
	static async getInstructors(req: Request, res: Response) {
		try {
			const authReq = req as AuthAndPermissionsRequest;

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
			const instructors = await InstructorService.getInstructors(departmentCode);

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

			const instructorInfo = await InstructorService.getBasicInfo(mnumber);

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

			if (!(await InstructorService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			const currentStatus = await InstructorService.getCurrentStatus(mnumber);

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

			if (!(await InstructorService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			const teachingSummary = await InstructorService.getTeachingSummary(mnumber);

			res.json({ mnumber, teachingSummary });
			return;
		} catch (error) {
			console.error('Error fetching teaching summary:', error);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get course details for an instructor in a specific term
	 * 
	 * @param req Request with params (mnumber) and required query (term, year)
	 * @param res Response object
	 */
	static async getCourseDetails(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;
			const { term, year } = req.query;

			// Validate required parameters
			if (!term || !year) {
				res.status(400).json({
					error: 'Missing required query parameters',
					requiredParams: ['term', 'year']
				});
				return;
			}

			// Validate and parse parameters
			const termCode = term as string;
			const yearValue = parseInt(year as string);

			if (isNaN(yearValue)) {
				res.status(400).json({
					error: 'Invalid year parameter. Year must be a valid number.'
				});
				return;
			}

			// Verify instructor exists
			if (!(await InstructorService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			// Get course details for the specified term and year
			const courseDetails = await InstructorService.getCourseDetails(
				mnumber,
				{ term: termCode, year: yearValue }
			);

			res.json({
				mnumber,
				termCode,
				year: yearValue,
				courseDetails
			});
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

			if (!(await InstructorService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			const termSummaries = await InstructorService.getTermSummaries(mnumber);

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
			const { subject, number, suffix = "", term, year, section } = req.query;

			// Validate required parameters
			if (!subject || !number || !term || !year || !section) {
				res.status(400).json({
					error: 'Missing required parameters. Please provide subject, number, term, year, and section.'
				});
				return;
			}

			// Parse and validate parameters
			const courseSubject = subject as string;
			const courseNumber = parseInt(number as string);
			const courseSuffix = (suffix as string) || ''; // Default to empty string if not provided
			const termCode = term as string;
			const yearNum = parseInt(year as string);
			const courseSection = section as string;

			if (isNaN(yearNum)) {
				res.status(400).json({ error: 'Invalid parameters. Year must be a number.' });
				return;
			}

			// Check if instructor exists
			if (!(await InstructorService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			// Get class roster
			const classRoster = await InstructorService.getClassRoster(
				mnumber,
				courseSubject,
				courseNumber,
				courseSuffix,
				courseSection,
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

	/**
	 * Get grade distribution trends for an instructor over a specified time period
	 */
	static async getGradeTrends(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;
			const { start_year, end_year } = req.query;

			// Validate required parameters (years are required)
			if (!start_year || !end_year) {
				res.status(400).json({
					error: 'Missing required query parameters',
					requiredParams: ['start_year', 'end_year']
				});
				return;
			}

			// Parse and validate parameters
			const startYear = parseInt(start_year as string);
			const endYear = parseInt(end_year as string);

			if (isNaN(startYear) || isNaN(endYear)) {
				res.status(400).json({
					error: 'Invalid year parameters. Years must be valid numbers.'
				});
				return;
			}

			// Verify instructor exists
			if (!(await InstructorService.instructorExists(mnumber))) {
				res.status(404).json({ error: 'Instructor not found' });
				return;
			}

			// Get grade trends for the specified time period
			const gradeTrends = await InstructorService.getGradeTrends(
				mnumber,
				{ term: "10", year: startYear }, // Default to Spring term
				{ term: "80", year: endYear }    // Default to Fall term
			);

			res.json({
				mnumber,
				start_year: startYear,
				end_year: endYear,
				gradeTrends
			});
			return;
		} catch (error) {
			console.error('Error fetching grade trends:', error);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}
}