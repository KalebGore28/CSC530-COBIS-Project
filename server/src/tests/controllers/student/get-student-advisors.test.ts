// src/tests/controllers/student/getStudentAdvisors.test.ts
// @ts-nocheck
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { StudentController } from '../../../controllers/student-controller'; // Adjust path as needed
import { StudentService } from '../../../services/student-service'; // Adjust path as needed
// Import any specific types needed for advisor data if available
// import { Advisor } from '../../../types/advisor'; // Example type

// --- Mock StudentService ---
// Mock only the methods needed for getStudentAdvisors
vi.mock('../../../services/student-service', () => ({
    StudentService: {
        getStudentAdvisors: vi.fn(), // Mock the relevant service method
    },
}));

// --- Test Suite for getStudentAdvisors ---
describe('StudentController', () => {

    describe('getStudentAdvisors Function', () => {
        // Mocks for this test suite
        let mockReq: Partial<Request>;
        let mockRes: Partial<Response>;

        beforeEach(() => {
            // Reset relevant mocks before each test
            (StudentService.getStudentAdvisors as Mock)?.mockReset();

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

        it('should call StudentService.getStudentAdvisors and return advisor data', async () => {
            const testMnumber = 'M99887';
            // Example structure for advisor data returned by the service
            const mockAdvisorData = [
                { advisorId: 'A123', firstName: 'Alice', lastName: 'Advisor', email: 'alice.advisor@example.com', advisorType: 'Primary' },
                { advisorId: 'A456', firstName: 'Bob', lastName: 'Professor', email: 'bob.professor@example.com', advisorType: 'Faculty' },
            ];

            // Setup request params
            mockReq.params = { mnumber: testMnumber };

            // Configure the mock service method
            vi.mocked(StudentService.getStudentAdvisors).mockResolvedValue(mockAdvisorData);

            // Call the controller method
            await StudentController.getStudentAdvisors(mockReq as Request, mockRes as Response);

            // Assertions
            expect(StudentService.getStudentAdvisors).toHaveBeenCalledTimes(1);
            expect(StudentService.getStudentAdvisors).toHaveBeenCalledWith(testMnumber); // Verify service call argument
            expect(mockRes.json).toHaveBeenCalledTimes(1);
            expect(mockRes.json).toHaveBeenCalledWith(mockAdvisorData); // Verify the response body is the direct result
            expect(mockRes.status).not.toHaveBeenCalled(); // Status not explicitly set on success
        });

        it('should return 500 with specific error message if StudentService.getStudentAdvisors throws an error', async () => {
            const testMnumber = 'M77665';
            const errorMessage = 'Network connection timeout';
            const testError = new Error(errorMessage);
            const expectedErrorResponse = { error: "Failed to retrieve student advisors" }; // Specific error message from controller

            // Setup request params
            mockReq.params = { mnumber: testMnumber };

            // Configure the mock service method to throw an error
            vi.mocked(StudentService.getStudentAdvisors).mockRejectedValue(testError);

            // Call the controller method
            await StudentController.getStudentAdvisors(mockReq as Request, mockRes as Response);

            // Assertions
            expect(StudentService.getStudentAdvisors).toHaveBeenCalledTimes(1);
            expect(StudentService.getStudentAdvisors).toHaveBeenCalledWith(testMnumber);
            expect(mockRes.status).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledTimes(1);
            // Verify the specific error message defined in the catch block
            expect(mockRes.json).toHaveBeenCalledWith(expectedErrorResponse);
        });

    }); // End describe('getStudentAdvisors Function')

}); // End describe('StudentController')