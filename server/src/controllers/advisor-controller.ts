import { Request, Response, NextFunction } from 'express';
// Assuming you have a similar request type that includes the authenticated user's info
import { AuthAndPermissionsRequest } from '../types/requests'; // Adjust path as needed
import { AdvisorService } from '../services/advisor-service'; // Adjust path as needed

/**
 * Controller for advisor-related endpoints
 */
export class AdvisorController {

	/**
	 * Middleware to check if the user has advisor privileges or access to advisor data.
	 * This is a basic example; you might need more specific role checks.
	 */
	static async checkAdvisorAccess(req: Request, res: Response, next: NextFunction) {
		const authReq = req as AuthAndPermissionsRequest;

		try {
			// Example: Check if the user has an 'advisor' role or is an admin.
			// Adjust this logic based on your application's roles and permissions.
			const isAdvisor = authReq.roles?.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'advisor'); // Example role name
			const isAdmin = authReq.roles?.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'cobis_administrator'); // Example admin role

			// Allow access if the user is an advisor or an admin
			// You might refine this logic. For instance, maybe only advisors can see *their* students.
			if (isAdvisor || isAdmin) {
				// Ensure the user's mnumber is available on the request object
				// This should be populated by your authentication middleware
				if (!authReq.mnumber) {
					console.error('Advisor mnumber missing from authenticated request.');
					res.status(401).json({ error: 'User identifier not found.' });
					return;
				}
				next(); // User has access, proceed to the next handler
				return;
			}

			// If none of the conditions are met, deny access
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

		try {
			// Extract the advisor's mnumber from the authenticated request
			// We've already checked it exists in the middleware
			const advisorMnumber = authReq.mnumber; // Use non-null assertion because middleware checked

			// Optional: Get term/year from query parameters if needed for filtering
			const term = req.query.term as string | undefined;
			const year = req.query.year ? parseInt(req.query.year as string) : undefined;

			// Call the service to get the advised students
			if (!advisorMnumber) {
				console.error('Advisor mnumber is undefined.');
				res.status(400).json({ error: 'Invalid advisor identifier.' });
				return;
			}

			const advisedStudents = await AdvisorService.getAdvisedStudents({
				advisorMnumber,
				term,
				year,
			});

			res.json(advisedStudents);

		} catch (error) {
			console.error(`Error fetching advised students for advisor ${authReq.mnumber}:`, error);
			// Avoid sending detailed internal errors to the client
			res.status(500).json({ error: 'Internal server error while fetching advised students.' });
		}
	}

	// Add other advisor-related controller methods here if needed
}
