import { Request, Response, NextFunction } from 'express';
import { AuthAndPermissionsRequest } from '../types/requests';
import { EnrollmentService } from '../services/enrollment-service';

/**
 * Controller for enrollment-related endpoints
 */
export class EnrollmentController {
	// --- PROGRAM ENROLLMENT ---

	/**
	 * Middleware to check if user can access enrollment data
	 */
	static async checkEnrollmentAccess(req: Request, res: Response, next: NextFunction) {
		const authReq = req as AuthAndPermissionsRequest;

		try {
			// Check if user has necessary roles
			const isAdmin = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'cobis_administrator');
			const isDeptChair = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'department_chair');
			const isAdministrator = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'administrator');

			// Admins, department chairs, and administrators can access
			if (isAdmin || isDeptChair || isAdministrator) {
				next();
				return;
			}

			// If none of the conditions are met, deny access
			res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
			return;
		} catch (error) {
			console.error('Error in enrollment permission middleware:', error);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get program-level enrollment data
	 * Applies department filtering based on user role
	 */
	static async getProgramEnrollment(req: Request, res: Response) {
		try {
			const authReq = req as AuthAndPermissionsRequest;
			const term = req.query.term as string;
			const year = req.query.year ? parseInt(req.query.year as string) : undefined;
			const programType = req.query.programType as string;
			const level = req.query.level as string;

			// Get requested department (if any)
			let departmentCode = req.query.department as string;

			// Check if user has necessary roles
			const isAdmin = authReq.roles.some(role => role.role_name === 'cobis_administrator');
			const isDeptChair = authReq.roles.some(role => role.role_name === 'department_chair');
			const isAdministrator = authReq.roles.some(role => role.role_name === 'administrator');

			// For department chairs, restrict to their department
			if (isDeptChair && !isAdmin) {
				departmentCode = authReq.department || '';

				if (!departmentCode) {
					res.status(400).json({ error: 'Department chair has no associated department' });
					return;
				}
			}

			// For administrators who are not admins or chairs, also restrict to their department
			if (isAdministrator && !isAdmin && !isDeptChair) {
				departmentCode = authReq.department || '';

				if (!departmentCode) {
					res.status(400).json({ error: 'Administrator has no associated department' });
					return;
				}
			}

			// Admins without a specified department should get an error
			if (isAdmin && !departmentCode) {
				res.status(400).json({ error: 'Department parameter is required' });
				return;
			}

			// Get the data with appropriate filters
			const enrollmentData = await EnrollmentService.getProgramEnrollment({
				departmentCode,
				term,
				year,
				programType,
				level
			});

			res.json(enrollmentData);
		} catch (error) {
			console.error('Error fetching program enrollment data:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	}

	/**
	 * Get student-level details for a specific program
	 * Applies department and program filtering based on user role
	 */
	static async getProgramStudents(req: Request, res: Response) {
		try {
			const authReq = req as AuthAndPermissionsRequest;
			const { programCode } = req.params;
			const term = req.query.term as string;
			const year = req.query.year ? parseInt(req.query.year as string) : undefined;
			const level = req.query.level as string;
			const page = req.query.page ? parseInt(req.query.page as string) : 1;
			const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

			// Get requested department (if any)
			let departmentCode = req.query.department as string;

			// Check if user has necessary roles
			const isAdmin = authReq.roles.some(role => role.role_name === 'cobis_administrator');
			const isDeptChair = authReq.roles.some(role => role.role_name === 'department_chair');
			const isAdministrator = authReq.roles.some(role => role.role_name === 'administrator');

			// For department chairs, restrict to their department
			if (isDeptChair && !isAdmin) {
				departmentCode = authReq.department || '';

				if (!departmentCode) {
					res.status(400).json({ error: 'Department chair has no associated department' });
					return;
				}
			}

			// For administrators who are not admins or chairs, also restrict to their department
			if (isAdministrator && !isAdmin && !isDeptChair) {
				departmentCode = authReq.department || '';

				if (!departmentCode) {
					res.status(400).json({ error: 'Administrator has no associated department' });
					return;
				}
			}

			// Admins without a specified department should get an error
			if (isAdmin && !departmentCode) {
				res.status(400).json({ error: 'Department parameter is required' });
				return;
			}

			// Validate that the program belongs to the user's department
			if (!isAdmin) {
				const isProgramInDepartment = await EnrollmentService.isProgramInDepartment(programCode, departmentCode);

				if (!isProgramInDepartment) {
					res.status(403).json({ error: 'Access denied. Program does not belong to your department.' });
					return;
				}
			}

			// Get the student data with appropriate filters
			const studentData = await EnrollmentService.getProgramStudents({
				programCode,
				departmentCode,
				term,
				year,
				level,
				page,
				limit
			});

			res.json(studentData);
		} catch (error) {
			console.error('Error fetching program student data:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	}

	/**
	 * Get program enrollment trends over multiple terms/years
	 * Shows enrollment changes over time for better analysis
	 */
	static async getProgramEnrollmentTrends(req: Request, res: Response) {
		try {
			const authReq = req as AuthAndPermissionsRequest;
			const programCode = req.query.program as string;
			const yearsBack = req.query.yearsBack ? parseInt(req.query.yearsBack as string) : 5; // Default to 5 years
			const includeCurrentTerm = req.query.includeCurrentTerm === 'true';

			// Get requested department (if any)
			let departmentCode = req.query.department as string;

			// Check if user has necessary roles
			const isAdmin = authReq.roles.some(role => role.role_name === 'cobis_administrator');
			const isDeptChair = authReq.roles.some(role => role.role_name === 'department_chair');
			const isAdministrator = authReq.roles.some(role => role.role_name === 'administrator');

			// For department chairs, restrict to their department
			if (isDeptChair && !isAdmin) {
				departmentCode = authReq.department || '';

				if (!departmentCode) {
					res.status(400).json({ error: 'Department chair has no associated department' });
					return;
				}
			}

			// For administrators who are not admins or chairs, also restrict to their department
			if (isAdministrator && !isAdmin && !isDeptChair) {
				departmentCode = authReq.department || '';

				if (!departmentCode) {
					res.status(400).json({ error: 'Administrator has no associated department' });
					return;
				}
			}

			// Admins without a specified department should get an error
			if (isAdmin && !departmentCode) {
				res.status(400).json({ error: 'Department parameter is required' });
				return;
			}

			// If a specific program is requested, verify it belongs to the department
			if (programCode) {
				const isProgramInDepartment = await EnrollmentService.isProgramInDepartment(programCode, departmentCode);

				if (!isProgramInDepartment) {
					res.status(403).json({ error: 'Access denied. Program does not belong to your department.' });
					return;
				}
			}

			// Get the trend data
			const trendsData = await EnrollmentService.getProgramEnrollmentTrends({
				departmentCode,
				programCode,
				yearsBack,
				includeCurrentTerm
			});

			res.json(trendsData);
		} catch (error) {
			console.error('Error fetching program enrollment trends:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	}

	// --- COURSE ENROLLMENT ---

}