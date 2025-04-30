// src/tests/controllers/student/getStudentCourses.test.ts
// @ts-nocheck
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { StudentController, getStudentCoursesQuerySchema } from '../../../controllers/student-controller'; // Adjust path as needed & import schema
import { StudentService } from '../../../services/student-service'; // Adjust path as needed
// Import any specific types for courseData if available
// import { Course } from '../../../types/course'; // Example type

// --- Mock StudentService ---
// Mock only the methods needed for getStudentCourses
vi.mock('../../../services/student-service', () => ({
    StudentService: {
        getStudentCourses: vi.fn(), // Mock the relevant service method
    },
}));

// --- Test Suite for getStudentCourses ---
describe('StudentController', () => {

    describe('getStudentCourses Function', () => {
        // Mocks for this test suite
        let mockReq: Partial<Request>;
        let mockRes: Partial<Response>;
        const testMnumber = 'M88776'; // Define a common mnumber for tests

        beforeEach(() => {
            // Reset relevant mocks before each test
            (StudentService.getStudentCourses as Mock)?.mockReset();

            // Setup basic Express mocks
            mockReq = {
                params: { mnumber: testMnumber }, // Set mnumber here
                query: {}, // Will be populated in specific tests
            };
            mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn(),
            };
        });

        // --- Test Cases ---

        it('should return 400 if query parameter validation fails (e.g., invalid year type)', async () => {
            // Setup invalid query params (year should be number after preprocess)
            mockReq.query = { year: 'not-a-year' };

            // Call the controller method
            await StudentController.getStudentCourses(mockReq as Request, mockRes as Response);

            // Assertions
            expect(mockRes.status).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledTimes(1);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid query parameters' });
            expect(StudentService.getStudentCourses).not.toHaveBeenCalled(); // Service should not be called
        });

        it('should call StudentService.getStudentCourses with mnumber and default options when no query params are provided', async () => {
            const mockCourseData = [{ courseId: 'CS101', grade: 'A' }]; // Example data
            const expectedOptions = { // Based on controller logic setting undefined
                term: undefined,
                year: undefined,
                onlyCompleted: undefined,
                onlyPassing: undefined,
            };
            mockReq.query = {}; // Explicitly empty query

            // Configure mock service
            vi.mocked(StudentService.getStudentCourses).mockResolvedValue(mockCourseData);

            // Call controller
            await StudentController.getStudentCourses(mockReq as Request, mockRes as Response);

            // Assertions
            expect(StudentService.getStudentCourses).toHaveBeenCalledTimes(1);
            expect(StudentService.getStudentCourses).toHaveBeenCalledWith(testMnumber, expectedOptions); // Verify service call args
            expect(mockRes.json).toHaveBeenCalledTimes(1);
            expect(mockRes.json).toHaveBeenCalledWith(mockCourseData);
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        it('should call StudentService.getStudentCourses with mnumber and partial options when only some query params are provided 1', async () => {
            const mockCourseData = [{ courseId: 'HIST101', grade: 'C' }];
            mockReq.query = {
                year: '2025' // Only year provided
            };
             const expectedOptions = {
                term: undefined,
                year: 2025,
                onlyCompleted: undefined,
                onlyPassing: undefined,
            };

            // Configure mock service
            vi.mocked(StudentService.getStudentCourses).mockResolvedValue(mockCourseData);

             // Call controller
            await StudentController.getStudentCourses(mockReq as Request, mockRes as Response);

             // Assertions
            expect(StudentService.getStudentCourses).toHaveBeenCalledTimes(1);
            expect(StudentService.getStudentCourses).toHaveBeenCalledWith(testMnumber, expectedOptions); // Verify partial options
            expect(mockRes.json).toHaveBeenCalledTimes(1);
            expect(mockRes.json).toHaveBeenCalledWith(mockCourseData);
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        it('should call StudentService.getStudentCourses with mnumber and partial options when only some query params are provided 2', async () => {
            const mockCourseData = [{ courseId: 'HIST101', grade: 'C' }];
            mockReq.query = {
                year: 2025 // Only year provided
            };
             const expectedOptions = {
                term: undefined,
                year: 2025,
                onlyCompleted: undefined,
                onlyPassing: undefined,
            };

            // Configure mock service
            vi.mocked(StudentService.getStudentCourses).mockResolvedValue(mockCourseData);

             // Call controller
            await StudentController.getStudentCourses(mockReq as Request, mockRes as Response);

             // Assertions
            expect(StudentService.getStudentCourses).toHaveBeenCalledTimes(1);
            expect(StudentService.getStudentCourses).toHaveBeenCalledWith(testMnumber, expectedOptions); // Verify partial options
            expect(mockRes.json).toHaveBeenCalledTimes(1);
            expect(mockRes.json).toHaveBeenCalledWith(mockCourseData);
            expect(mockRes.status).not.toHaveBeenCalled();
        });


        it('should return 500 with specific error message if StudentService.getStudentCourses throws an error', async () => {
            const errorMessage = 'Course data source unavailable';
            const testError = new Error(errorMessage);
            // Specific error message defined in the controller's catch block
            const expectedErrorResponse = { error: "Failed to retrieve student courses" };
            const expectedOptions = { // Options when query is empty
                term: undefined,
                year: undefined,
                onlyCompleted: undefined,
                onlyPassing: undefined,
            };

            mockReq.query = {}; // Use valid (empty) query params

            // Configure the mock service method to throw an error
            vi.mocked(StudentService.getStudentCourses).mockRejectedValue(testError);

            // Call the controller method
            await StudentController.getStudentCourses(mockReq as Request, mockRes as Response);

            // Assertions
            expect(StudentService.getStudentCourses).toHaveBeenCalledTimes(1);
            // Ensure service was still called with correct args before throwing
            expect(StudentService.getStudentCourses).toHaveBeenCalledWith(testMnumber, expectedOptions);
            expect(mockRes.status).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledTimes(1);
            // Verify the specific error message
            expect(mockRes.json).toHaveBeenCalledWith(expectedErrorResponse);
        });

    }); // End describe('getStudentCourses Function')

}); // End describe('StudentController')