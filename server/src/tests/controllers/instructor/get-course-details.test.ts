// instructor.controller.getCourseDetails.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { InstructorController, getCourseDetailsQuerySchema } from '../../../controllers/instructor-controller'; // Import schema too
import { InstructorService } from '../../../services/instructor-service';
import { AuthAndPermissionsRequest } from '../../../types/requests';

// --- Mocking ---

// Mock the InstructorService using the corrected path
vi.mock('../../../services/instructor-service', () => ({
	InstructorService: {
		// Mock methods used in getCourseDetails
		instructorExists: vi.fn(),
		getCourseDetails: vi.fn(),
		// Include others as needed for potential shared dependencies or future tests
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

// Helper to create a mock Request object, now including query parameters
const mockRequest = (
	params: Record<string, string> = {},
	query: Record<string, any> = {} // Using 'any' for flexibility in testing invalid queries
): AuthAndPermissionsRequest => {
	const req = { params, query } as Partial<AuthAndPermissionsRequest>;
	return req as AuthAndPermissionsRequest;
};

// --- Test Suite ---

describe('InstructorController', () => {
	describe('getCourseDetails', () => {
		let req: AuthAndPermissionsRequest;
		let res: Response;

		// Reset mocks before each test
		beforeEach(() => {
			res = mockResponse();
			vi.clearAllMocks();
		});

		const testMnumber = 'm12345';
		const validQuery = { term: 'Fall', year: '2025' }; // Zod schema handles string year
		const validYearNumber = 2025; // Parsed year

		// --- Test Cases: Query Parameter Validation ---
		it('should return 400 if query parameter "term" is missing', async () => {
			req = mockRequest({ mnumber: testMnumber }, { year: '2025' }); // Missing term

			await InstructorController.getCourseDetails(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
				error: 'Invalid query parameters.',
				details: expect.any(Object) // Zod error format can be complex, check for existence
			}));
			// Ensure service calls are not made on validation failure
			expect(InstructorService.instructorExists).not.toHaveBeenCalled();
			expect(InstructorService.getCourseDetails).not.toHaveBeenCalled();
		});

		it('should return 400 if query parameter "year" is missing', async () => {
			req = mockRequest({ mnumber: testMnumber }, { term: 'Fall' }); // Missing year

			await InstructorController.getCourseDetails(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
				error: 'Invalid query parameters.',
				details: expect.any(Object)
			}));
			expect(InstructorService.instructorExists).not.toHaveBeenCalled();
			expect(InstructorService.getCourseDetails).not.toHaveBeenCalled();
		});

		it('should return 400 if query parameter "year" is not a valid number', async () => {
			req = mockRequest({ mnumber: testMnumber }, { term: 'Fall', year: 'abc' }); // Invalid year

			await InstructorController.getCourseDetails(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
				error: 'Invalid query parameters.',
				details: expect.any(Object)
			}));
			expect(InstructorService.instructorExists).not.toHaveBeenCalled();
			expect(InstructorService.getCourseDetails).not.toHaveBeenCalled();
		});

		it('should return 400 if query parameter "year" is negative', async () => {
			req = mockRequest({ mnumber: testMnumber }, { term: 'Fall', year: '-2025' }); // Invalid year

			await InstructorController.getCourseDetails(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
				error: 'Invalid query parameters.',
				details: expect.any(Object) // Check details for specific Zod error if needed
			}));
			expect(InstructorService.instructorExists).not.toHaveBeenCalled();
			expect(InstructorService.getCourseDetails).not.toHaveBeenCalled();
		});

		// --- Test Case: Instructor Not Found (after validation) ---
		it('should return 404 if instructor does not exist (after query validation)', async () => {
			req = mockRequest({ mnumber: testMnumber }, validQuery);

			// Arrange: Mock instructorExists to return false
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(false);

			// Act
			await InstructorController.getCourseDetails(req, res);

			// Assert
			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'Instructor not found' });
			// Ensure getCourseDetails was NOT called
			expect(InstructorService.getCourseDetails).not.toHaveBeenCalled();
		});

		// --- Test Case: Success ---
		it('should return course details if instructor exists and query is valid', async () => {
			req = mockRequest({ mnumber: testMnumber }, validQuery);
			const mockCourseData = [
				{
					termName: 'Fall',
					termCode: '80',
					year: 2025,
					courseId: 'CS101A',
					courseTitle: 'Intro to CS',
					courseSubject: 'CS',
					courseNumber: 101,
					courseSuffix: 'A',
					courseSection: '01',
					crn: '12345',
					creditHours: 3,
					studentCount: 30,
					totalCreditHours: 90,
				}
			];

			// Arrange: Mock service calls
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			vi.mocked(InstructorService.getCourseDetails).mockResolvedValue(mockCourseData);

			// Act
			await InstructorController.getCourseDetails(req, res);

			// Assert
			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			// Check that getCourseDetails is called with the PARSED year
			expect(InstructorService.getCourseDetails).toHaveBeenCalledWith(
				testMnumber,
				validQuery.term,
				validYearNumber // Use the number year from Zod parsing
			);
			// Status 200 is default
			expect(res.status).not.toHaveBeenCalled();
			// Check response structure
			expect(res.json).toHaveBeenCalledWith({
				mnumber: testMnumber,
				term: validQuery.term,
				year: validYearNumber, // Controller responds with the parsed year
				courseDetails: mockCourseData
			});
		});

		// --- Test Case: Success with numeric year input ---
		it('should handle numeric year input correctly', async () => {
			// Zod schema preprocesses numbers too
			const queryWithNumberYear = { term: 'Fall', year: 2025 };
			req = mockRequest({ mnumber: testMnumber }, queryWithNumberYear);
			const mockCourseData = [
				{
					termName: 'Fall',
					termCode: '80',
					year: 2025,
					courseId: 'CS101A',
					courseTitle: 'Intro to CS',
					courseSubject: 'CS',
					courseNumber: 101,
					courseSuffix: 'A',
					courseSection: '01',
					crn: '12345',
					creditHours: 3,
					studentCount: 30,
					totalCreditHours: 90,
				}
			];


			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			vi.mocked(InstructorService.getCourseDetails).mockResolvedValue(mockCourseData);

			await InstructorController.getCourseDetails(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(InstructorService.getCourseDetails).toHaveBeenCalledWith(
				testMnumber,
				queryWithNumberYear.term,
				queryWithNumberYear.year // Already a number
			);
			expect(res.status).not.toHaveBeenCalled();
			expect(res.json).toHaveBeenCalledWith({
				mnumber: testMnumber,
				term: queryWithNumberYear.term,
				year: queryWithNumberYear.year,
				courseDetails: mockCourseData
			});
		});

		// --- Test Cases: Server Errors ---
		it('should return 500 if instructorExists throws an error', async () => {
			req = mockRequest({ mnumber: testMnumber }, validQuery);
			const errorMessage = 'Database error on existence check';

			// Arrange
			vi.mocked(InstructorService.instructorExists).mockRejectedValue(new Error(errorMessage));

			// Act
			await InstructorController.getCourseDetails(req, res);

			// Assert
			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
			expect(InstructorService.getCourseDetails).not.toHaveBeenCalled();
		});

		it('should return 500 if getCourseDetails throws an error', async () => {
			req = mockRequest({ mnumber: testMnumber }, validQuery);
			const errorMessage = 'Database error on details fetch';

			// Arrange
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			vi.mocked(InstructorService.getCourseDetails).mockRejectedValue(new Error(errorMessage));

			// Act
			await InstructorController.getCourseDetails(req, res);

			// Assert
			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(InstructorService.getCourseDetails).toHaveBeenCalledWith(
				testMnumber,
				validQuery.term,
				validYearNumber
			);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});
	}); // End describe('getCourseDetails')
}); // End describe('InstructorController')