import { Request, Response, NextFunction } from 'express';
import { AuthAndPermissionsRequest } from '../types/requests';
import { StudentService } from '../services/student-service';
import { z } from 'zod';
import 'zod-openapi/extend';

// --- Validation Schemas ---
export const studentIdSchema = z.object({
	mnumber: z
		.string()
		.regex(/^[Mm]\d+$/i, { message: 'Invalid M-number format. Must start with "m" followed by digits.' })
		.transform((mnumber) => mnumber.toUpperCase())
		.openapi({ description: 'Student M-number' }),
});

export const getStudentCoursesQuerySchema = z.object({
	term: z.string().optional(),
	year: z
		.preprocess((val) => {
			// coerce "2025" → 2025
			if (typeof val === 'string' && val.trim() !== '') return parseInt(val, 10);
			if (typeof val === 'number') return val;
			return undefined;
		}, z
			.number()
			.int()
			.positive()
			.optional()
			.openapi({ description: 'Calendar year (e.g. 2025)' })
		),

	onlyCompleted: z.boolean().optional(),
	onlyPassing: z.boolean().optional(),
})

/**
 * Controller for student-related endpoints
 */
export class StudentController {
	/**
	 * Middleware to check if user can access student data
	 */
	static async checkAccess(req: Request, res: Response, next: NextFunction) {
		const authReq = req as AuthAndPermissionsRequest;
		const validationResult = studentIdSchema.safeParse(authReq.params);
		if (!validationResult.success) {
			res.status(400).json({ error: 'Invalid M-number format' });
			return;
		}

		const { mnumber } = validationResult.data;

		try {
			// Check if user has necessary roles
			const isFaculty = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'faculty');
			const isAdvisor = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'advisor');
			const isProgramCoordinator = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'program_coordinator');
			const isDeptChair = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'department_chair');
			const isAdministrator = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'administrator');
			const isCOBISAdmin = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'cobis_administrator');

			// COBIS Administrators can access all students
			if (isCOBISAdmin) {
				next();
				return;
			}

			// Users can access their own data
			if (authReq.mnumber === mnumber) {
				next();
				return;
			}

			console.log('Department chair accessing student data');
			console.log('Department:', authReq.department, 'M-number:', mnumber);

			// Check for advisee relationship first (applies to faculty, advisors, and dept chairs who advise)
			if ((isFaculty || isAdvisor || isDeptChair || isProgramCoordinator || isAdministrator) && authReq.mnumber) {
				const isAdvisee = await StudentService.isAdvisee(mnumber, authReq.mnumber);
				console.log('Is advisee:', isAdvisee);
				if (isAdvisee) {
					next();
					return;
				}
			}

			// Department chairs can access students in their department
			if ((isDeptChair) && authReq.department) {
				const isStudentInDepartment = await StudentService.isStudentInDepartment(mnumber, authReq.department);
				console.log('Is student in department:', isStudentInDepartment);
				if (isStudentInDepartment) {
					next();
					return;
				}
			}

			// Check if student exists
			if (!(await StudentService.studentExists(mnumber))) {
				res.status(404).json({ error: 'Student not found' });
				return;
			}

			// If none of the conditions are met, deny access
			res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
			return;
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
	}

	/**
	 * Get basic information for a specific student
	 */
	static async getStudent(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		const { mnumber } = authReq.params;

		try {
			// Get student information
			const studentInfo = await StudentService.getStudentInfo(mnumber);

			res.json(studentInfo);
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
		}
	}

	/**
	 * Get programs (majors and minors) for a specific student
	 */
	static async getStudentPrograms(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		const { mnumber } = authReq.params;

		try {
			// Get student programs
			const programData = await StudentService.getStudentPrograms(mnumber);

			res.json({
				mnumber,
				programs: programData
			});
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
		}
	}

	/**
	 * Get academic information for a specific student
	 */
	static async getStudentAcademicInfo(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		const { mnumber } = authReq.params;

		try {
			// Get student academic information
			const academicData = await StudentService.getStudentAcademicInfo(mnumber);

			res.json({
				mnumber,
				academicInfo: academicData
			});
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
		}
	}

	/**
	 * Get student advisors
	 */
	static async getStudentAdvisors(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		const { mnumber } = authReq.params;

		try {
			// Get student advisors
			const advisors = await StudentService.getStudentAdvisors(mnumber);

			res.json(advisors);
			return;
		} catch (error) {
			res.status(500).json({ error: "Failed to retrieve student advisors" });
			return;
		}
	}

	/**
	 * Get student's current enrollment status
	 */
	static async getEnrollmentStatus(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		const { mnumber } = authReq.params;

		try {
			// Get student enrollment status
			const enrollmentStatus = await StudentService.getStudentEnrollmentStatus(mnumber);

			res.json(enrollmentStatus);
			return;
		} catch (error) {
			res.status(500).json({ error: "Failed to retrieve student enrollment status" });
			return;
		}
	}

	/**
	 * Get courses a student has taken
	 */
	static async getStudentCourses(req: Request, res: Response) {
		const authReq = req as AuthAndPermissionsRequest;

		const { mnumber } = authReq.params;

		// Validate query parameters
		const validationResult = getStudentCoursesQuerySchema.safeParse(req.query);
		if (!validationResult.success) {
			res.status(400).json({ error: 'Invalid query parameters' });
			return;
		}

		const { term, year, onlyCompleted, onlyPassing } = validationResult.data;

		const options = {
			term: term || undefined,
			year: year || undefined,
			onlyCompleted: onlyCompleted || undefined,
			onlyPassing: onlyPassing || undefined,
		};

		try {
			// Get student courses
			const coursesData = await StudentService.getStudentCourses(mnumber, options);

			res.json(coursesData);
			return;
		} catch (error) {
			res.status(500).json({ error: "Failed to retrieve student courses" });
			return;
		}
	}
}