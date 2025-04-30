// instructor.controller.getBasicInfo.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express'; // Note: NextFunction not needed here
import { InstructorController } from '../../../controllers/instructor-controller';
import { InstructorService } from '../../../services/instructor-service';
import { AuthAndPermissionsRequest } from '../../../types/requests';

// --- Mocking ---

// Mock the InstructorService - need instructorExists and getBasicInfo
vi.mock('../../../services/instructor-service', () => ({
    InstructorService: {
        // Mock methods used in getBasicInfo
        instructorExists: vi.fn(),
        getBasicInfo: vi.fn(),
        // Include others as undefined or empty mocks if needed by imports,
        // but they won't be actively used/asserted here.
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

// Helper to create a mock Request object (simplified as roles/dept not directly used)
const mockRequest = (
    params: Record<string, string> = {}
): AuthAndPermissionsRequest => {
    // Cast to AuthAndPermissionsRequest because the controller method expects it,
    // even though it doesn't use all its properties directly in this method.
    const req = { params } as Partial<AuthAndPermissionsRequest>;
    return req as AuthAndPermissionsRequest;
};

// --- Test Suite ---

describe('InstructorController', () => {
    describe('getBasicInfo', () => {
        let req: AuthAndPermissionsRequest; // Or just Request if AuthAndPermissionsRequest isn't strictly needed
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

            vi.mocked(InstructorService.instructorExists).mockResolvedValue(false);

            await InstructorController.getBasicInfo(req, res);

            expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Instructor not found' });
            expect(InstructorService.getBasicInfo).not.toHaveBeenCalled();
        });

        it('should return instructor info if instructor exists', async () => {
            req = mockRequest({ mnumber: testMnumber });
            const mockInstructorData = {
                mnumber: testMnumber,
                name: 'Jane Doe', // Combine first and last name or provide a mock name
                firstName: 'Jane',
                lastName: 'Doe',
                department: 'Computer Science', // Provide mock data or null
                departmentCode: 'CSC', // Provide mock data or null
                college: 'College of Engineering', // Provide mock data or null
                collegeCode: 'COE', // Provide mock data or null
                email: 'jane.doe@example.com',
                image: null, // Provide mock data or null
            };

            vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
            vi.mocked(InstructorService.getBasicInfo).mockResolvedValue(mockInstructorData);

            await InstructorController.getBasicInfo(req, res);

            expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
            expect(InstructorService.getBasicInfo).toHaveBeenCalledWith(testMnumber);
            expect(res.status).not.toHaveBeenCalled(); // Implies 200 OK
            expect(res.json).toHaveBeenCalledWith({
                mnumber: testMnumber,
                instructorInfo: mockInstructorData,
            });
        });

        it('should return 500 if instructorExists throws an error', async () => {
            req = mockRequest({ mnumber: testMnumber });
            const errorMessage = 'Database connection error';

            vi.mocked(InstructorService.instructorExists).mockRejectedValue(new Error(errorMessage));

            await InstructorController.getBasicInfo(req, res);

            expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
            expect(InstructorService.getBasicInfo).not.toHaveBeenCalled();
        });

        it('should return 500 if getBasicInfo throws an error', async () => {
            req = mockRequest({ mnumber: testMnumber });
            const errorMessage = 'Error fetching details';

            vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
            vi.mocked(InstructorService.getBasicInfo).mockRejectedValue(new Error(errorMessage));

            await InstructorController.getBasicInfo(req, res);

            expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
            expect(InstructorService.getBasicInfo).toHaveBeenCalledWith(testMnumber);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    }); // End describe('getBasicInfo')
}); // End describe('InstructorController')