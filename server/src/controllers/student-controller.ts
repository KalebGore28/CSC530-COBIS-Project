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
			const isAdvisor = authReq.roles.some((role: { role_name: string; role_id: number }) =>
				role.role_name === 'faculty');

			// Admins can access all students
			if (isAdmin) {
				next();
				return;
			}

			// Department chairs can access students in their department's programs
			if (isDeptChair && authReq.department) {
				if (mnumber) {
					const isStudentInDepartment = await StudentService.isStudentInDepartment(mnumber, authReq.department);
					if (isStudentInDepartment) {
						return next();
					}
				} else {
					// For listing all students, department filtering is applied in the getStudents method
					return next();
				}
			}

			// Advisors can access their advisees
			if (isAdvisor && authReq.mnumber) {
				if (mnumber) {
					const isAdvisee = await StudentService.isAdvisee(mnumber, authReq.mnumber);
					if (isAdvisee) {
						return next();
					}
				} else {
					// For listing all students, advisee filtering is applied in the getStudents method
					return next();
				}
			}

			// Users can access their own data
			if (authReq.mnumber === mnumber) {
				return next();
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
	 * Get a list of students based on user's permissions
	 */
	static async getStudents(req: Request, res: Response) {
		try {
			const authReq = req as AuthAndPermissionsRequest;
			const {
				department,
				program,
				term,
				year,
				search,
				page = '1',
				limit = '20'
			} = req.query;

			// Convert parameters to appropriate types
			const pageNum = parseInt(page as string) || 1;
			const limitNum = parseInt(limit as string) || 20;
			const yearNum = year ? parseInt(year as string) : undefined;

			// Determine filter criteria based on user's role
			const isCobisAdmin = authReq.roles.some(role => role.role_name === 'cobis_administrator');
			const isDeptChair = authReq.roles.some(role => role.role_name === 'department_chair');
			const isAdvisor = authReq.roles.some(role => role.role_name === 'advisor');
			const isFaculty = authReq.roles.some(role => role.role_name === 'faculty');
			const isAdministrator = authReq.roles.some(role => role.role_name === 'administrator');

			// Determine what filters to apply based on roles and parameters
			let filterDepartment = department as string;
			let advisorMnumber: string | undefined = undefined;
			let includeAdvisees = false;

			// COBIS Admins have full access with no filters (unless they specify filters)
			if (isCobisAdmin) {
				// No additional filters needed - use whatever was provided in the request
			}
			// Department chairs can see students in their department
			else if (isDeptChair) {
				// If no specific department is requested, use the chair's department
				if (!department) {
					filterDepartment = authReq.department || '';
				}

				// Additionally, if the chair is also an advisor, they should be able to see their advisees
				if (isFaculty || isAdvisor) {
					includeAdvisees = true;
					advisorMnumber = authReq.mnumber;
				}
			}
			// Faculty, advisors, or administrators can see their advisees
			else if (isFaculty || isAdvisor || isAdministrator) {
				advisorMnumber = authReq.mnumber || undefined;
			}

			// If the user is both a department chair and has advisees,
			// we need to make a special service call to handle the union of results
			if (includeAdvisees && filterDepartment) {
				// Get department students
				const deptStudents = await StudentService.getStudents({
					department: filterDepartment,
					program: program as string,
					term: term as string,
					year: yearNum,
					search: search as string,
					isCobisAdmin,
					page: pageNum,
					limit: limitNum
				});

				// Get advisee students
				const adviseeStudents = await StudentService.getStudents({
					advisorMnumber,
					program: program as string,
					term: term as string,
					year: yearNum,
					search: search as string,
					isCobisAdmin,
					page: pageNum,
					limit: limitNum
				});

				// Combine results (simple approach - can be improved with actual pagination)
				const combinedStudents = this.mergeStudentResults(deptStudents, adviseeStudents);

				res.json(combinedStudents);
				return;
			}

			// Get students with appropriate filters
			const students = await StudentService.getStudents({
				department: filterDepartment,
				program: program as string,
				term: term as string,
				year: yearNum,
				search: search as string,
				advisorMnumber,
				isCobisAdmin,
				page: pageNum,
				limit: limitNum
			});

			res.json(students);
		} catch (error) {
			console.error('Error fetching students:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	}

	/**
	 * Helper function to merge student results while removing duplicates
	 * Simplifies pagination by taking the first set's pagination info
	 */
	private static mergeStudentResults(results1: any, results2: any): any {
		// Create a map to efficiently remove duplicates
		const studentMap = new Map();

		// Add students from first result set
		results1.students.forEach((student: any) => {
			studentMap.set(student.mnumber, student);
		});

		// Add students from second result set (will overwrite duplicates)
		results2.students.forEach((student: any) => {
			if (!studentMap.has(student.mnumber)) {
				studentMap.set(student.mnumber, student);
			}
		});

		// Convert map back to array
		const mergedStudents = Array.from(studentMap.values());

		// Return merged result with pagination info from first result
		// (This is a simplified approach - ideally pagination would be recalculated)
		return {
			students: mergedStudents,
			pagination: {
				...results1.pagination,
				totalItems: mergedStudents.length,
				totalPages: Math.ceil(mergedStudents.length / results1.pagination.limit)
			}
		};
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
}