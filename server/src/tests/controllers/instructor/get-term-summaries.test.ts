// instructor.controller.getTermSummaries.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { InstructorController } from '../../../controllers/instructor-controller';
import { InstructorService } from '../../../services/instructor-service';
import { AuthAndPermissionsRequest } from '../../../types/requests';

// --- Mocking ---

// Mock the InstructorService using the corrected path
vi.mock('../../../services/instructor-service', () => ({
	InstructorService: {
		// Mock methods used in getTermSummaries
		instructorExists: vi.fn(),
		getTermSummaries: vi.fn(),
		// Include others as needed
		getCourseDetails: vi.fn(),
		getTeachingSummary: vi.fn(),
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
	// Cast to AuthAndPermissionsRequest
	const req = { params } as Partial<AuthAndPermissionsRequest>;
	return req as AuthAndPermissionsRequest;
};

// --- Test Suite ---

describe('InstructorController', () => {
	describe('getTermSummaries', () => {
		let req: AuthAndPermissionsRequest;
		let res: Response;

		// Reset mocks before each test
		beforeEach(() => {
			res = mockResponse();
			vi.clearAllMocks();
		});

		const testMnumber = 'm12345';

		// --- Test Case: Instructor Not Found ---
		it('should return 404 if instructor does not exist', async () => {
			req = mockRequest({ mnumber: testMnumber });

			// Arrange: Mock instructorExists to return false
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(false);

			// Act
			await InstructorController.getTermSummaries(req, res);

			// Assert
			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'Instructor not found' });
			// Ensure getTermSummaries was NOT called
			expect(InstructorService.getTermSummaries).not.toHaveBeenCalled();
		});

		// --- Test Case: Success ---
		it('should return term summaries if instructor exists', async () => {
			req = mockRequest({ mnumber: testMnumber });
			const mockTermSummariesData = [
				{ term: 'Fall', year: 2024, coursesTaught: 2, uniqueCourses: 1, totalEnrollment: 55 },
				{ term: 'Spring', year: 2025, coursesTaught: 3, uniqueCourses: 2, totalEnrollment: 70 },
			];

			// Arrange: Mock service calls
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			// @ts-ignore // Entire term data is not needed for this test
			vi.mocked(InstructorService.getTermSummaries).mockResolvedValue(mockTermSummariesData);

			// Act
			await InstructorController.getTermSummaries(req, res);

			// Assert
			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(InstructorService.getTermSummaries).toHaveBeenCalledWith(testMnumber);
			// Status 200 is default
			expect(res.status).not.toHaveBeenCalled();
			// Check response structure
			expect(res.json).toHaveBeenCalledWith({
				mnumber: testMnumber,
				termSummaries: mockTermSummariesData // Key matches controller response
			});
		});

		// --- Test Cases: Server Errors ---
		it('should return 500 if instructorExists throws an error', async () => {
			req = mockRequest({ mnumber: testMnumber });
			const errorMessage = 'DB error checking existence';

			// Arrange
			vi.mocked(InstructorService.instructorExists).mockRejectedValue(new Error(errorMessage));

			// Act
			await InstructorController.getTermSummaries(req, res);

			// Assert
			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
			expect(InstructorService.getTermSummaries).not.toHaveBeenCalled();
		});

		it('should return 500 if getTermSummaries throws an error', async () => {
			req = mockRequest({ mnumber: testMnumber });
			const errorMessage = 'DB error fetching term summaries';

			// Arrange
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			vi.mocked(InstructorService.getTermSummaries).mockRejectedValue(new Error(errorMessage));

			// Act
			await InstructorController.getTermSummaries(req, res);

			// Assert
			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(InstructorService.getTermSummaries).toHaveBeenCalledWith(testMnumber);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});
	}); // End describe('getTermSummaries')
}); // End describe('InstructorController')