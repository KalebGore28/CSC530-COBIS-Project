// src/tests/controllers/student/getStudentAcademicInfo.test.ts
// @ts-nocheck
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { StudentController } from '../../../controllers/student-controller'; // Adjust path as needed
import { StudentService } from '../../../services/student-service'; // Adjust path as needed
// Import any specific types needed for academicData if available
// import { AcademicInfo } from '../../../types/academic'; // Example type

// --- Mock StudentService ---
// Mock only the methods needed for getStudentAcademicInfo
vi.mock('../../../services/student-service', () => ({
	StudentService: {
		getStudentAcademicInfo: vi.fn(), // Mock the relevant service method
	},
}));

// --- Test Suite for getStudentAcademicInfo ---
describe('StudentController', () => {

	describe('getStudentAcademicInfo Function', () => {
		// Mocks for this test suite
		let mockReq: Partial<Request>;
		let mockRes: Partial<Response>;

		beforeEach(() => {
			// Reset relevant mocks before each test
			(StudentService.getStudentAcademicInfo as Mock)?.mockReset();

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

		it('should call StudentService.getStudentAcademicInfo and return formatted academic data', async () => {
			const testMnumber = 'M11223';
			// Example structure for academic data returned by the service
			const mockAcademicData = {
				gpa: 3.75,
				creditsEarned: 90,
				classification: 'Senior',
				academicStanding: 'Good Standing',
				// Add other relevant fields based on your actual data structure
			};
			// Expected structure of the final JSON response
			const expectedResponse = {
				mnumber: testMnumber,
				academicInfo: mockAcademicData,
			};

			// Setup request params
			mockReq.params = { mnumber: testMnumber };

			// Configure the mock service method
			vi.mocked(StudentService.getStudentAcademicInfo).mockResolvedValue(mockAcademicData);

			// Call the controller method
			await StudentController.getStudentAcademicInfo(mockReq as Request, mockRes as Response);

			// Assertions
			expect(StudentService.getStudentAcademicInfo).toHaveBeenCalledTimes(1);
			expect(StudentService.getStudentAcademicInfo).toHaveBeenCalledWith(testMnumber); // Verify service call argument
			expect(mockRes.json).toHaveBeenCalledTimes(1);
			expect(mockRes.json).toHaveBeenCalledWith(expectedResponse); // Verify the structure of the response
			expect(mockRes.status).not.toHaveBeenCalled(); // Status not explicitly set on success
		});

		it('should return 500 if StudentService.getStudentAcademicInfo throws an error', async () => {
			const testMnumber = 'M33445';
			const errorMessage = 'Data retrieval error';
			const testError = new Error(errorMessage);

			// Setup request params
			mockReq.params = { mnumber: testMnumber };

			// Configure the mock service method to throw an error
			vi.mocked(StudentService.getStudentAcademicInfo).mockRejectedValue(testError);

			// Call the controller method
			await StudentController.getStudentAcademicInfo(mockReq as Request, mockRes as Response);

			// Assertions
			expect(StudentService.getStudentAcademicInfo).toHaveBeenCalledTimes(1);
			expect(StudentService.getStudentAcademicInfo).toHaveBeenCalledWith(testMnumber);
			expect(mockRes.status).toHaveBeenCalledTimes(1);
			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledTimes(1);
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});

	}); // End describe('getStudentAcademicInfo Function')

}); // End describe('StudentController')