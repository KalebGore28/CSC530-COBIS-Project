// src/tests/controllers/student/getEnrollmentStatus.test.ts
// @ts-nocheck
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { StudentController } from '../../../controllers/student-controller'; // Adjust path as needed
import { StudentService } from '../../../services/student-service'; // Adjust path as needed
// Import any specific types for enrollmentStatus if available
// import { EnrollmentInfo } from '../../../types/enrollment'; // Example type

// --- Mock StudentService ---
// Mock only the methods needed for getEnrollmentStatus
vi.mock('../../../services/student-service', () => ({
	StudentService: {
		getStudentEnrollmentStatus: vi.fn(), // Mock the relevant service method
	},
}));

// --- Test Suite for getEnrollmentStatus ---
describe('StudentController', () => {

	describe('getEnrollmentStatus Function', () => {
		// Mocks for this test suite
		let mockReq: Partial<Request>;
		let mockRes: Partial<Response>;

		beforeEach(() => {
			// Reset relevant mocks before each test
			(StudentService.getStudentEnrollmentStatus as Mock)?.mockReset();

			// Setup basic Express mocks
			mockReq = {
				params: {}, // To be populated in tests
			};
			mockRes = {
				status: vi.fn().mockReturnThis(),
				json: vi.fn(),
			};
		});

		// --- Test Cases ---

		it('should call StudentService.getStudentEnrollmentStatus and return enrollment data', async () => {
			const testMnumber = 'M10101';
			// Example structure for enrollment data returned by the service
			const mockEnrollmentStatus = {
				status: 'Enrolled',
				effectiveDate: '2025-01-10', // Using current year from context
				credits: 15,
				statusDescription: 'Actively enrolled for Spring 2025 term'
			};

			// Setup request params
			mockReq.params = { mnumber: testMnumber };

			// Configure the mock service method
			vi.mocked(StudentService.getStudentEnrollmentStatus).mockResolvedValue(mockEnrollmentStatus);

			// Call the controller method
			await StudentController.getEnrollmentStatus(mockReq as Request, mockRes as Response);

			// Assertions
			expect(StudentService.getStudentEnrollmentStatus).toHaveBeenCalledTimes(1);
			expect(StudentService.getStudentEnrollmentStatus).toHaveBeenCalledWith(testMnumber); // Verify service call argument
			expect(mockRes.json).toHaveBeenCalledTimes(1);
			expect(mockRes.json).toHaveBeenCalledWith(mockEnrollmentStatus); // Verify the response body is the direct result
			expect(mockRes.status).not.toHaveBeenCalled(); // Status not explicitly set on success
		});

		it('should return 500 with specific error message if StudentService.getStudentEnrollmentStatus throws an error', async () => {
			const testMnumber = 'M20202';
			const errorMessage = 'External system unavailable';
			const testError = new Error(errorMessage);
			// Specific error message defined in the controller's catch block
			const expectedErrorResponse = { error: "Failed to retrieve student enrollment status" };

			// Setup request params
			mockReq.params = { mnumber: testMnumber };

			// Configure the mock service method to throw an error
			vi.mocked(StudentService.getStudentEnrollmentStatus).mockRejectedValue(testError);

			// Call the controller method
			await StudentController.getEnrollmentStatus(mockReq as Request, mockRes as Response);

			// Assertions
			expect(StudentService.getStudentEnrollmentStatus).toHaveBeenCalledTimes(1);
			expect(StudentService.getStudentEnrollmentStatus).toHaveBeenCalledWith(testMnumber);
			expect(mockRes.status).toHaveBeenCalledTimes(1);
			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledTimes(1);
			// Verify the specific error message
			expect(mockRes.json).toHaveBeenCalledWith(expectedErrorResponse);
		});

	}); // End describe('getEnrollmentStatus Function')

}); // End describe('StudentController')