// instructor.controller.getGradeTrends.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
// Assuming getGradeTrendsQuerySchema is exported from the controller file
import { InstructorController } from '../../../controllers/instructor-controller';
import { InstructorService } from '../../../services/instructor-service';
import { AuthAndPermissionsRequest } from '../../../types/requests';

// --- Mocking ---

// Mock the InstructorService using the corrected path
vi.mock('../../../services/instructor-service', () => ({
	InstructorService: {
		// Mock methods used in getGradeTrends
		instructorExists: vi.fn(),
		getGradeTrends: vi.fn(),
		// Include others as needed
		getClassRoster: vi.fn(),
		getTermSummaries: vi.fn(),
		getCourseDetails: vi.fn(),
		getTeachingSummary: vi.fn(),
		getCurrentStatus: vi.fn(),
		getBasicInfo: vi.fn(),
		isInstructorInDepartment: vi.fn(),
	}
}));

// --- Mock Helpers ---

const mockResponse = () => {
	const res = {} as Partial<Response>;
	res.status = vi.fn().mockReturnThis();
	res.json = vi.fn().mockReturnThis();
	return res as Response;
};

const mockRequest = (
	params: Record<string, string> = {},
	query: Record<string, any> = {} // Use 'any' for flexibility
): AuthAndPermissionsRequest => {
	const req = { params, query } as Partial<AuthAndPermissionsRequest>;
	return req as AuthAndPermissionsRequest;
};

// --- Test Suite ---

describe('InstructorController', () => {
	describe('getGradeTrends', () => {
		let req: AuthAndPermissionsRequest;
		let res: Response;

		// Reset mocks before each test
		beforeEach(() => {
			res = mockResponse();
			vi.clearAllMocks();
		});

		const testMnumber = 'm12345';
		// Assuming schema parses years to numbers
		const validRequiredQuery = { start_year: '2020', end_year: '2024' };
		const parsedStartYear = 2020;
		const parsedEndYear = 2024;
		const defaultStartTerm = '10';
		const defaultEndTerm = '90';

		// --- Test Cases: Query Parameter Validation ---
		it('should return 400 if required query parameter "start_year" is missing', async () => {
			const { start_year, ...invalidQuery } = validRequiredQuery;
			req = mockRequest({ mnumber: testMnumber }, invalidQuery);

			await InstructorController.getGradeTrends(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
				error: 'Invalid query parameters.',
				details: expect.any(Object)
			}));
			expect(InstructorService.instructorExists).not.toHaveBeenCalled();
			expect(InstructorService.getGradeTrends).not.toHaveBeenCalled();
		});

		it('should return 400 if required query parameter "end_year" is missing', async () => {
			const { end_year, ...invalidQuery } = validRequiredQuery;
			req = mockRequest({ mnumber: testMnumber }, invalidQuery);
			await InstructorController.getGradeTrends(req, res);
			expect(res.status).toHaveBeenCalledWith(400); // etc.
			expect(InstructorService.instructorExists).not.toHaveBeenCalled();
		});

		it('should return 400 if "start_year" is invalid', async () => {
			req = mockRequest({ mnumber: testMnumber }, { ...validRequiredQuery, start_year: 'abc' });
			await InstructorController.getGradeTrends(req, res);
			expect(res.status).toHaveBeenCalledWith(400); // etc.
			expect(InstructorService.instructorExists).not.toHaveBeenCalled();
		});
		// Add more validation tests if schema has more rules (e.g., end_year >= start_year)

		// --- Test Case: Instructor Not Found ---
		it('should return 404 "Instructor not found" if instructor does not exist', async () => {
			req = mockRequest({ mnumber: testMnumber }, validRequiredQuery);
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(false);

			await InstructorController.getGradeTrends(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'Instructor not found' });
			expect(InstructorService.getGradeTrends).not.toHaveBeenCalled();
		});

		// --- Test Case: Success (Using Default Terms) ---
		it('should return grade trends using default terms when optional terms are omitted', async () => {
			req = mockRequest({ mnumber: testMnumber }, validRequiredQuery);
			const mockTrendData = [{ grade: 'A', percentage: 30 }, { grade: 'B', percentage: 40 }];

			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			//@ts-ignore
			vi.mocked(InstructorService.getGradeTrends).mockResolvedValue(mockTrendData);

			await InstructorController.getGradeTrends(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			// Check arguments passed to the service method, including default terms
			expect(InstructorService.getGradeTrends).toHaveBeenCalledWith(
				testMnumber,
				{ term: defaultStartTerm, year: parsedStartYear },
				{ term: defaultEndTerm, year: parsedEndYear }
			);
			expect(res.status).not.toHaveBeenCalled(); // Implies 200 OK
			expect(res.json).toHaveBeenCalledWith({
				mnumber: testMnumber,
				start_year: parsedStartYear,
				end_year: parsedEndYear,
				gradeTrends: mockTrendData
			});
		});

		// --- Test Case: Success (Providing Optional Terms) ---
		it('should return grade trends using provided terms when specified', async () => {
			const specificTermsQuery = { ...validRequiredQuery, start_term: '20', end_term: '80' };
			req = mockRequest({ mnumber: testMnumber }, specificTermsQuery);
			const mockTrendData = [{ grade: 'A', percentage: 35 }, { grade: 'C', percentage: 20 }];

			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			//@ts-ignore
			vi.mocked(InstructorService.getGradeTrends).mockResolvedValue(mockTrendData);

			await InstructorController.getGradeTrends(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			// Check arguments passed to the service method, using provided terms
			expect(InstructorService.getGradeTrends).toHaveBeenCalledWith(
				testMnumber,
				{ term: specificTermsQuery.start_term, year: parsedStartYear },
				{ term: specificTermsQuery.end_term, year: parsedEndYear }
			);
			expect(res.status).not.toHaveBeenCalled();
			expect(res.json).toHaveBeenCalledWith({
				mnumber: testMnumber,
				start_year: parsedStartYear,
				end_year: parsedEndYear,
				gradeTrends: mockTrendData
			});
		});

		// --- Test Case: Success (Empty Results) ---
		it('should return 200 OK with empty trends if service finds none', async () => {
			req = mockRequest({ mnumber: testMnumber }, validRequiredQuery);
			const emptyTrendData: unknown[] = []; // Empty array is a valid result

			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			//@ts-ignore
			vi.mocked(InstructorService.getGradeTrends).mockResolvedValue(emptyTrendData);

			await InstructorController.getGradeTrends(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(InstructorService.getGradeTrends).toHaveBeenCalledWith(
				testMnumber,
				{ term: defaultStartTerm, year: parsedStartYear },
				{ term: defaultEndTerm, year: parsedEndYear }
			);
			expect(res.status).not.toHaveBeenCalled(); // Still 200 OK
			expect(res.json).toHaveBeenCalledWith({
				mnumber: testMnumber,
				start_year: parsedStartYear,
				end_year: parsedEndYear,
				gradeTrends: emptyTrendData // Expecting empty array
			});
		});


		// --- Test Cases: Server Errors ---
		it('should return 500 if instructorExists throws an error', async () => {
			req = mockRequest({ mnumber: testMnumber }, validRequiredQuery);
			vi.mocked(InstructorService.instructorExists).mockRejectedValue(new Error('DB error'));

			await InstructorController.getGradeTrends(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
			expect(InstructorService.getGradeTrends).not.toHaveBeenCalled();
		});

		it('should return 500 if getGradeTrends throws an error', async () => {
			req = mockRequest({ mnumber: testMnumber }, validRequiredQuery);
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			vi.mocked(InstructorService.getGradeTrends).mockRejectedValue(new Error('DB error'));

			await InstructorController.getGradeTrends(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(InstructorService.getGradeTrends).toHaveBeenCalledWith(
				testMnumber,
				{ term: defaultStartTerm, year: parsedStartYear },
				{ term: defaultEndTerm, year: parsedEndYear }
			);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});

	}); // End describe('getGradeTrends')
}); // End describe('InstructorController')