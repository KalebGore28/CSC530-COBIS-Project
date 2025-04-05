import { Request, Response, NextFunction } from 'express';
import { ReportingService } from '../services/reporting-service';
import { AuthAndPermissionsRequest } from '../types/requests';

/**
 * Controller for handling reporting operations
 */
export class ReportingController {
	/**
	 * Middleware to check if user has required roles for reporting endpoints
	 */
	static async checkAccess(req: Request, res: Response, next: NextFunction) {
		const authReq = req as AuthAndPermissionsRequest;

		try {
			// Check if user has necessary roles
			const isAdmin = authReq.roles.some(role => role.role_name === 'cobis_administrator');
			const isDeptChair = authReq.roles.some(role => role.role_name === 'department_chair');
			const isProgramCoordinator = authReq.roles.some(role => role.role_name === 'program_coordinator');

			// Admins, department chairs, and program coordinators can access
			if (isAdmin || isDeptChair || isProgramCoordinator) {
				next();
				return;
			}

			// If none of the conditions are met, deny access
			res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
			return;
		} catch (error) {
			console.error('Error in reporting permission middleware:', error);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get the list of students in a program who haven't completed a specific course
	 */
	static async getStudentCourseRequirement(req: Request, res: Response) {
		// Extract query parameters
		const { programCode, courseSubject, courseNumber, courseSuffix } = req.query;

		// Validate required parameters
		if (!programCode || !courseSubject || !courseNumber) {
			res.status(400).json({
				error: "Missing required parameters: programCode, courseSubject, courseNumber"
			});
			return;
		}

		try {
			// Call service method to get data
			const result = await ReportingService.getStudentCourseRequirement(
				programCode as string,
				courseSubject as string,
				courseNumber as string,
				(courseSuffix as string) || ""
			);

			// Return successful response
			res.json(result);
		} catch (error) {
			console.error("Error fetching student course requirement:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
} 