import { Request, Response } from 'express';
import { ReportingService } from '../services/reporting-service';
import { hasRole } from '../middleware/has-role';

/**
 * Controller for handling reporting operations
 */
export class ReportingController {
	/**
	 * Middleware to check if user has required roles for reporting endpoints
	 */
	static checkAccess = [
		hasRole(['department_chair', 'program_coordinator'])
	];

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