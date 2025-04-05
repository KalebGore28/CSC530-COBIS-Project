import { Request, Response, NextFunction } from 'express';
import { AuthAndPermissionsRequest } from '../types/requests';
import { StudentService } from '../services/student-service';

/**
 * Controller for student-related endpoints
 */
export class StudentController {
	/**
	 * Middleware to check if user can access student data
	 */
	static async checkAccess(req: Request, res: Response, next: NextFunction) {
		const authReq = req as AuthAndPermissionsRequest;
		const { mnumber } = req.params;

		try {
			// Check if user has necessary roles
			const isAdmin = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'cobis_administrator');
			const isDeptChair = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'department_chair');
			const isFaculty = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'faculty');
			const isAdvisor = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'advisor');
			const isProgramCoordinator = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'program_coordinator');
			const isAdministrator = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'administrator');

			// COBIS Administrators can access all students
			if (isAdmin) {
				next();
				return;
			}

			// Users can access their own data
			if (authReq.mnumber === mnumber) {
				next();
				return;
			}

			if (mnumber) {
				// Check for advisee relationship first (applies to faculty, advisors, and dept chairs who advise)
				if ((isFaculty || isAdvisor || isDeptChair) && authReq.mnumber) {
					const isAdvisee = await StudentService.isAdvisee(mnumber, authReq.mnumber);
					if (isAdvisee) {
						next();
						return;
					}
				}

				// Department chairs can access students in their department
				if ((isDeptChair) && authReq.department) {
					const isStudentInDepartment = await StudentService.isStudentInDepartment(mnumber, authReq.department);
					if (isStudentInDepartment) {
						next();
						return;
					}
				}

				// For administrators who have a department association
				// Currently, this is not implemented in the system
				if (isAdministrator && authReq.department) {
					console.error('Administrator access check for student-controller.ts not implemented yet');
				}
			} else {
				// For list endpoints (no specific mnumber) - access control will be handled in the controller
				if (isDeptChair || isProgramCoordinator || isFaculty || isAdvisor || isAdministrator) {
					next();
					return;
				}
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
	 * Get basic information for a specific student
	 */
	static async getStudent(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;

			const studentInfo = await StudentService.getStudentInfo(mnumber);

			if (!studentInfo) {
				res.status(404).json({ error: 'Student not found' });
				return;
			}

			res.json(studentInfo);
		} catch (error) {
			console.error('Error fetching student data:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	}

	/**
	 * Get programs (majors and minors) for a specific student
	 */
	static async getStudentPrograms(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;

			const programData = await StudentService.getStudentPrograms(mnumber);

			if (!programData) {
				res.status(404).json({ error: 'Student not found' });
				return;
			}

			res.json({
				mnumber,
				programs: programData
			});
		} catch (error) {
			console.error('Error fetching student program data:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	}

	/**
	 * Get academic information for a specific student
	 */
	static async getStudentAcademicInfo(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;

			const academicData = await StudentService.getStudentAcademicInfo(mnumber);

			if (!academicData) {
				res.status(404).json({ error: 'Student not found' });
				return;
			}

			res.json({
				mnumber,
				academicInfo: academicData
			});
		} catch (error) {
			console.error('Error fetching student academic data:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	}

	/**
	 * Get student advisors
	 */
	static async getStudentAdvisors(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;
			const advisors = await StudentService.getStudentAdvisors(mnumber);

			if (!advisors) {
				res.status(404).json({ error: "Student not found" });
				return;
			}

			res.json(advisors);
			return;
		} catch (error) {
			console.error("Error getting student advisors:", error);
			res.status(500).json({ error: "Failed to retrieve student advisors" });
			return;
		}
	}

	/**
	 * Get student's current enrollment status
	 */
	static async getEnrollmentStatus(req: Request, res: Response) {
		try {
			const { mnumber } = req.params;
			const enrollmentStatus = await StudentService.getStudentEnrollmentStatus(mnumber);

			if (!enrollmentStatus) {
				res.status(404).json({ error: "Student not found" });
				return;
			}

			res.json(enrollmentStatus);
			return;
		} catch (error) {
			console.error("Error getting student enrollment status:", error);
			res.status(500).json({ error: "Failed to retrieve student enrollment status" });
			return;
		}
	}
}