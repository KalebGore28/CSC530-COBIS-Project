// src/controllers/student-controller.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { StudentController } from '../../../controllers/student-controller'
import { AuthAndPermissionsRequest } from '../../../types/requests'
import { StudentService } from '../../../services/student-service'; // Adjust the path as needed

// --- Mock StudentService ---
// Mock the entire module. This needs to be done BEFORE importing the controller
// if the controller module uses the service at the top level (which it likely does).
vi.mock('../../../services/student-service', () => ({
	StudentService: {
		isAdvisee: vi.fn(),
		isStudentInDepartment: vi.fn(),
		studentExists: vi.fn(),
		// Add mocks for any other static methods used if necessary
	},
}));

// --- Test Suite ---
describe('StudentController', () => {

	describe('checkAccess Middleware', () => {
		// --- Mock Express Objects ---
		let mockReq: Partial<AuthAndPermissionsRequest>;
		let mockRes: Partial<Response>;
		let mockNext: NextFunction;

		// Reset mocks before each test
		beforeEach(() => {
			mockReq = {
				params: {},
				roles: [],
				mnumber: undefined, // User's M-number from auth
				department: undefined, // User's department from auth
				// Add other properties if your AuthAndPermissionsRequest needs them
			};
			mockRes = {
				status: vi.fn().mockReturnThis(), // Chainable status function
				json: vi.fn(),
				// Add other response methods if needed
			};
			mockNext = vi.fn(); // Mock the next function

			// Reset mocks on the service
			vi.mocked(StudentService.isAdvisee).mockClear();
			vi.mocked(StudentService.isStudentInDepartment).mockClear();
			vi.mocked(StudentService.studentExists).mockClear();
		});

		// --- Test Cases ---

		it('should return 400 if mnumber format is invalid', async () => {
			mockReq.params = { mnumber: 'invalid-mnumber' }; // Invalid format

			await StudentController.checkAccess(mockReq as Request, mockRes as Response, mockNext);

			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid M-number format' });
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should call next() if user is accessing their own data', async () => {
			const userMnumber = 'M12345';
			mockReq.params = { mnumber: userMnumber };
			mockReq.mnumber = userMnumber; // User's own mnumber
			mockReq.roles = [{ role_name: 'student', role_id: 1 }]; // Example role

			await StudentController.checkAccess(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockRes.status).not.toHaveBeenCalled();
			expect(mockRes.json).not.toHaveBeenCalled();
		});

		it('should call next() if user is a COBIS Administrator', async () => {
			mockReq.params = { mnumber: 'M67890' }; // Accessing another student
			mockReq.mnumber = 'M11111'; // Admin's mnumber
			mockReq.roles = [{ role_name: 'cobis_administrator', role_id: 99 }];

			await StudentController.checkAccess(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockRes.status).not.toHaveBeenCalled();
			expect(mockRes.json).not.toHaveBeenCalled();
		});

		it('should call next() if user is faculty/advisor/dept_chair and the student is their advisee', async () => {
			const targetMnumber = 'M67890';
			const advisorMnumber = 'M54321';
			mockReq.params = { mnumber: targetMnumber };
			mockReq.mnumber = advisorMnumber;
			mockReq.roles = [{ role_name: 'faculty', role_id: 2 }]; // Can be faculty, advisor, or dept_chair

			// Mock StudentService response
			vi.mocked(StudentService.isAdvisee).mockResolvedValue(true);

			await StudentController.checkAccess(mockReq as Request, mockRes as Response, mockNext);

			expect(StudentService.isAdvisee).toHaveBeenCalledWith(targetMnumber, advisorMnumber);
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockRes.status).not.toHaveBeenCalled();
			expect(mockRes.json).not.toHaveBeenCalled();
		});

		it('should call next() if user is dept_chair and the student is in their department', async () => {
			const targetMnumber = 'M67890';
			const chairMnumber = 'M55555';
			const chairDepartment = 'Computer Science';
			mockReq.params = { mnumber: targetMnumber };
			mockReq.mnumber = chairMnumber;
			mockReq.department = chairDepartment;
			mockReq.roles = [{ role_name: 'department_chair', role_id: 4 }];

			// Mock StudentService responses
			// Assume they are NOT an advisee (to ensure department check is reached)
			vi.mocked(StudentService.isAdvisee).mockResolvedValue(false);
			vi.mocked(StudentService.isStudentInDepartment).mockResolvedValue(true);

			await StudentController.checkAccess(mockReq as Request, mockRes as Response, mockNext);

			expect(StudentService.isAdvisee).toHaveBeenCalledWith(targetMnumber, chairMnumber);
			expect(StudentService.isStudentInDepartment).toHaveBeenCalledWith(targetMnumber, chairDepartment);
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockRes.status).not.toHaveBeenCalled();
			expect(mockRes.json).not.toHaveBeenCalled();
		});

		it('should return 404 if student does not exist (and user has passed other checks)', async () => {
			const targetMnumber = 'M99999'; // Non-existent student
			const requestingUserMnumber = 'M11223';
			mockReq.params = { mnumber: targetMnumber };
			mockReq.mnumber = requestingUserMnumber; // Different user
			mockReq.roles = [{ role_name: 'student', role_id: 1 }]; // Role without special permissions

			// Mock StudentService responses
			vi.mocked(StudentService.isAdvisee).mockResolvedValue(false); // Not advisee
			vi.mocked(StudentService.isStudentInDepartment).mockResolvedValue(false); // Not in dept (if applicable)
			vi.mocked(StudentService.studentExists).mockResolvedValue(false); // Student does not exist

			await StudentController.checkAccess(mockReq as Request, mockRes as Response, mockNext);

			// Important: Check that studentExists was actually called
			expect(StudentService.studentExists).toHaveBeenCalledWith(targetMnumber);
			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Student not found' });
			expect(mockNext).not.toHaveBeenCalled();
		});


		it('should return 403 if user does not have sufficient permissions', async () => {
			const targetMnumber = 'M67890';
			const requestingUserMnumber = 'M11223';
			mockReq.params = { mnumber: targetMnumber };
			mockReq.mnumber = requestingUserMnumber; // Different user
			mockReq.roles = [{ role_name: 'student', role_id: 1 }]; // Role without access privileges
			mockReq.department = 'Some Department'; // Assume department doesn't grant access

			// Mock StudentService responses
			vi.mocked(StudentService.isAdvisee).mockResolvedValue(false); // Not advisee
			// Mock isStudentInDepartment only if the user *could* be a chair
			// vi.mocked(StudentService.isStudentInDepartment).mockResolvedValue(false);
			vi.mocked(StudentService.studentExists).mockResolvedValue(true); // Student exists

			await StudentController.checkAccess(mockReq as Request, mockRes as Response, mockNext);

			// Ensure checks were made
			expect(StudentService.isAdvisee).not.toHaveBeenCalled(); // Should not be called for 'student' role
			expect(StudentService.isStudentInDepartment).not.toHaveBeenCalled(); // Should not be called for 'student' role
			expect(StudentService.studentExists).toHaveBeenCalledWith(targetMnumber); // Existence check is done before final 403

			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. Insufficient permissions.' });
			expect(mockNext).not.toHaveBeenCalled();
		});


		it('should return 500 if StudentService.isAdvisee throws an error', async () => {
			const targetMnumber = 'M67890';
			const advisorMnumber = 'M54321';
			mockReq.params = { mnumber: targetMnumber };
			mockReq.mnumber = advisorMnumber;
			mockReq.roles = [{ role_name: 'faculty', role_id: 2 }];

			// Mock StudentService to throw an error
			const testError = new Error('Database connection failed');
			vi.mocked(StudentService.isAdvisee).mockRejectedValue(testError);

			await StudentController.checkAccess(mockReq as Request, mockRes as Response, mockNext);

			expect(StudentService.isAdvisee).toHaveBeenCalledWith(targetMnumber, advisorMnumber);
			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	// --- Add describe blocks for other controller methods here ---
	// describe('getStudentById', () => { ... });
	// describe('getStudentCourses', () => { ... });

});