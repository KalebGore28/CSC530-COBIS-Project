// src/tests/controllers/student/getStudent.test.ts
// @ts-nocheck

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express'; // Removed NextFunction as it's not used by getStudent
import { StudentController } from '../../../controllers/student-controller'; // Adjust path as needed
import { StudentService } from '../../../services/student-service'; // Adjust path as needed

// --- Mock StudentService ---
// CRITICAL: This mock setup needs to be present in each test file
// that tests functions interacting with StudentService.
vi.mock('../../../services/student-service', () => ({
	StudentService: {
		// Mock only the methods needed for the function(s) being tested in THIS file
		// For getStudent, we only need getStudentInfo
		getStudentInfo: vi.fn(),

		// You can include others if needed, but it's cleaner to only mock what's relevant here
		// isAdvisee: vi.fn(),
		// isStudentInDepartment: vi.fn(),
		// studentExists: vi.fn(),
	},
}));

// --- Test Suite for getStudent ---
describe('StudentController', () => { // You can keep this outer describe for consistency or remove it

	describe('getStudent Function', () => { // Describe the specific function
		// Mocks for this test suite
		let mockReq: Partial<Request>;
		let mockRes: Partial<Response>;

		beforeEach(() => {
			// Reset mocks relevant to getStudent before each test
			(StudentService.getStudentInfo as Mock)?.mockReset(); // Reset the specific mock used here

			// Setup basic Express mocks
			mockReq = {
				params: {}, // Will be populated in specific tests
			};
			mockRes = {
				status: vi.fn().mockReturnThis(),
				json: vi.fn(),
			};
		});

		// --- Test Cases ---

		it('should call StudentService.getStudentInfo with mnumber and return student data', async () => {
			const testMnumber = 'M12345';
			const mockStudentData = { // Example student data structure
				mnumber: testMnumber,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john.doe@example.com',
			};

			// Setup request params
			mockReq.params = { mnumber: testMnumber };

			// Configure the mock service method
			vi.mocked(StudentService.getStudentInfo).mockResolvedValue(mockStudentData);

			// Call the controller method
			await StudentController.getStudent(mockReq as Request, mockRes as Response);

			// Assertions
			expect(StudentService.getStudentInfo).toHaveBeenCalledTimes(1);
			expect(StudentService.getStudentInfo).toHaveBeenCalledWith(testMnumber); // Verify mnumber argument
			expect(mockRes.json).toHaveBeenCalledTimes(1);
			expect(mockRes.json).toHaveBeenCalledWith(mockStudentData); // Verify response body
			expect(mockRes.status).not.toHaveBeenCalled(); // Status should not be explicitly set on success
		});

		it('should return 500 if StudentService.getStudentInfo throws an error', async () => {
			const testMnumber = 'M67890';
			const errorMessage = 'Database query failed';
			const testError = new Error(errorMessage);

			// Setup request params
			mockReq.params = { mnumber: testMnumber };

			// Configure the mock service method to throw an error
			vi.mocked(StudentService.getStudentInfo).mockRejectedValue(testError);

			// Call the controller method
			await StudentController.getStudent(mockReq as Request, mockRes as Response);

			// Assertions
			expect(StudentService.getStudentInfo).toHaveBeenCalledTimes(1);
			expect(StudentService.getStudentInfo).toHaveBeenCalledWith(testMnumber);
			expect(mockRes.status).toHaveBeenCalledTimes(1);
			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledTimes(1);
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});

	}); // End describe('getStudent Function')

}); // End describe('StudentController')