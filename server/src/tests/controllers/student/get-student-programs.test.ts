// src/tests/controllers/student/getStudentPrograms.test.ts
// @ts-nocheck

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { StudentController } from '../../../controllers/student-controller'; // Adjust path as needed
import { StudentService } from '../../../services/student-service'; // Adjust path as needed
// Import any specific types needed for programData if available
// import { Program } from '../../../types/program'; // Example type

// --- Mock StudentService ---
// Mock only the methods needed for getStudentPrograms
vi.mock('../../../services/student-service', () => ({
	StudentService: {
		getStudentPrograms: vi.fn(), // Mock the relevant service method
	},
}));

// --- Test Suite for getStudentPrograms ---
describe('StudentController', () => {

	describe('getStudentPrograms Function', () => {
		// Mocks for this test suite
		let mockReq: Partial<Request>;
		let mockRes: Partial<Response>;

		beforeEach(() => {
			// Reset relevant mocks before each test
			(StudentService.getStudentPrograms as Mock)?.mockReset();

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

		it('should call StudentService.getStudentPrograms and return formatted program data', async () => {
			const testMnumber = 'M54321';
			// Example structure for program data returned by the service
			const mockProgramData = [
				{ programId: 'CSCI-BS', programName: 'Computer Science', programType: 'Major', college: 'Science & Engineering' },
				{ programId: 'MATH-MIN', programName: 'Mathematics', programType: 'Minor', college: 'Arts & Sciences' },
			];
			// Expected structure of the final JSON response
			const expectedResponse = {
				mnumber: testMnumber,
				programs: mockProgramData,
			};

			// Setup request params
			mockReq.params = { mnumber: testMnumber };

			// Configure the mock service method
			vi.mocked(StudentService.getStudentPrograms).mockResolvedValue(mockProgramData);

			// Call the controller method
			await StudentController.getStudentPrograms(mockReq as Request, mockRes as Response);

			// Assertions
			expect(StudentService.getStudentPrograms).toHaveBeenCalledTimes(1);
			expect(StudentService.getStudentPrograms).toHaveBeenCalledWith(testMnumber); // Verify service call argument
			expect(mockRes.json).toHaveBeenCalledTimes(1);
			expect(mockRes.json).toHaveBeenCalledWith(expectedResponse); // Verify the structure of the response
			expect(mockRes.status).not.toHaveBeenCalled(); // Status not explicitly set on success
		});

		it('should return 500 if StudentService.getStudentPrograms throws an error', async () => {
			const testMnumber = 'M98765';
			const errorMessage = 'Service connection failed';
			const testError = new Error(errorMessage);

			// Setup request params
			mockReq.params = { mnumber: testMnumber };

			// Configure the mock service method to throw an error
			vi.mocked(StudentService.getStudentPrograms).mockRejectedValue(testError);

			// Call the controller method
			await StudentController.getStudentPrograms(mockReq as Request, mockRes as Response);

			// Assertions
			expect(StudentService.getStudentPrograms).toHaveBeenCalledTimes(1);
			expect(StudentService.getStudentPrograms).toHaveBeenCalledWith(testMnumber);
			expect(mockRes.status).toHaveBeenCalledTimes(1);
			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledTimes(1);
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});

	}); // End describe('getStudentPrograms Function')

}); // End describe('StudentController')