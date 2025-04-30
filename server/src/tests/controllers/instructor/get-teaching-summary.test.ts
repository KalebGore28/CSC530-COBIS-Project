// instructor.controller.getTeachingSummary.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express'; // NextFunction not needed
import { InstructorController } from '../../../controllers/instructor-controller';
import { InstructorService } from '../../../services/instructor-service';
import { AuthAndPermissionsRequest } from '../../../types/requests';

// --- Mocking ---

// Mock the InstructorService - need instructorExists and getTeachingSummary
vi.mock('../../../services/instructor-service', () => ({
    InstructorService: {
        // Mock methods used in getTeachingSummary
        instructorExists: vi.fn(),
        getTeachingSummary: vi.fn(),
        // Include others as undefined or empty mocks if needed by imports,
        // but they won't be actively used/asserted here.
        getCurrentStatus: vi.fn(),
        getBasicInfo: vi.fn(),
        isInstructorInDepartment: vi.fn(),
    }
}));

// --- Mock Helpers ---

// Helper to create a mock Response object
const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn().mockReturnThis();
  return res as Response;
};

// Helper to create a mock Request object
const mockRequest = (
    params: Record<string, string> = {}
): AuthAndPermissionsRequest => {
    // Cast to AuthAndPermissionsRequest because the controller method expects it
    const req = { params } as Partial<AuthAndPermissionsRequest>;
    return req as AuthAndPermissionsRequest;
};

// --- Test Suite ---

describe('InstructorController', () => {
    describe('getTeachingSummary', () => {
        let req: AuthAndPermissionsRequest;
        let res: Response;

        // Reset mocks before each test in this describe block
        beforeEach(() => {
            res = mockResponse();
            // Reset specific mocks used in this file
            vi.clearAllMocks(); // Clears call history and resets mock implementations
        });

        const testMnumber = 'm12345';

        it('should return 404 if instructor does not exist', async () => {
            req = mockRequest({ mnumber: testMnumber });

            // Arrange: Mock instructorExists to return false
            vi.mocked(InstructorService.instructorExists).mockResolvedValue(false);

            // Act
            await InstructorController.getTeachingSummary(req, res);

            // Assert
            expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Instructor not found' });
            // Ensure getTeachingSummary was NOT called if instructor doesn't exist
            expect(InstructorService.getTeachingSummary).not.toHaveBeenCalled();
        });

        it('should return teaching summary if instructor exists', async () => {
            req = mockRequest({ mnumber: testMnumber });
            const mockSummaryData = {
				totalCoursesTaught: 0,
				uniqueCoursesTaught: [],
				totalStudentsTaught: 0,
				totalCreditHoursDelivered: 0,
				averageClassSize: 0,
				mostTaughtCourses: []
            };

            // Arrange: Mock instructorExists and getTeachingSummary
            vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
            vi.mocked(InstructorService.getTeachingSummary).mockResolvedValue(mockSummaryData);

            // Act
            await InstructorController.getTeachingSummary(req, res);

            // Assert
            expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
            expect(InstructorService.getTeachingSummary).toHaveBeenCalledWith(testMnumber);
            // Status 200 is default
            expect(res.status).not.toHaveBeenCalled();
            // Check that res.json was called with the correct structure
            expect(res.json).toHaveBeenCalledWith({
                mnumber: testMnumber,
                teachingSummary: mockSummaryData, // Ensure this key matches the controller response
            });
        });

        it('should return 500 if instructorExists throws an error', async () => {
            req = mockRequest({ mnumber: testMnumber });
            const errorMessage = 'Database connection error';

            // Arrange: Mock instructorExists to throw an error
            vi.mocked(InstructorService.instructorExists).mockRejectedValue(new Error(errorMessage));

            // Act
            await InstructorController.getTeachingSummary(req, res);

            // Assert
            expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
            // Ensure getTeachingSummary was NOT called if the first service call failed
            expect(InstructorService.getTeachingSummary).not.toHaveBeenCalled();
        });

        it('should return 500 if getTeachingSummary throws an error', async () => {
            req = mockRequest({ mnumber: testMnumber });
            const errorMessage = 'Error fetching summary details';

            // Arrange: Mock instructorExists (success) and getTeachingSummary (failure)
            vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
            vi.mocked(InstructorService.getTeachingSummary).mockRejectedValue(new Error(errorMessage));

            // Act
            await InstructorController.getTeachingSummary(req, res);

            // Assert
            expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
            expect(InstructorService.getTeachingSummary).toHaveBeenCalledWith(testMnumber);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    }); // End describe('getTeachingSummary')
}); // End describe('InstructorController')