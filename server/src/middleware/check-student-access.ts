import { Request, Response, NextFunction } from 'express';
import { AccessService } from '../services/student-access-service';
import { AuthAndPermissionsRequest } from '../types/requests';

export const checkStudentAccess = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const user = req as AuthAndPermissionsRequest;
	const studentMnumber = req.params.mnumber;

	const accessService = new AccessService();

	try {
		const canAccess = await accessService.canAccessStudent(user, studentMnumber);

		if (!canAccess) {
			res.status(403).json({
				error: 'Access denied. Insufficient permissions to view this student data.'
			});
			return;
		}

		// Add the access service to the request for later use in controllers
		user.accessService = accessService;

		next();
	} catch (error) {
		console.error('Error checking student access:', error);
		res.status(500).json({ error: 'Internal server error during access check' });
	}
};