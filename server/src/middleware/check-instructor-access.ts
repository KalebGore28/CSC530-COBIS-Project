import { Request, Response, NextFunction } from 'express';
import { InstructorAccessService } from '../services/instructor-access-service';
import { AuthAndPermissionsRequest } from '../types/requests';

/**
 * Middleware to check if user can access instructor data
 * Similar to checkStudentAccess but specific to instructor permissions
 */
export const checkInstructorAccess = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
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
};