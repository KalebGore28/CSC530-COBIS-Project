// instructor.controller.getGradeTrends.test.ts
// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
// Assuming getGradeTrendsQuerySchema is exported from the controller file
import { InstructorController } from '../../../controllers/instructor-controller';
import { InstructorService } from '../../../services/instructor-service';
import { AuthAndPermissionsRequest } from '../../../types/requests';
import { UtilityService } from '../../../services/utility-service';

// --- Mocking ---

// Mock InstructorService
vi.mock('../../../services/instructor-service', () => ({
	InstructorService: {
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

// Mock UtilityService
vi.mock('../../../services/utility-service', () => ({
	UtilityService: {
		getCurrentTermAndYear: vi.fn(), // Mock the new dependency
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
		const validRequiredQuery = { start_year: '2020', end_year: '2024' };
		const parsedStartYear = 2020;
		const parsedEndYear = 2024;
		const defaultStartTerm = '10';
		const mockCurrentTerm = '40'; // Example mocked current term code
		const mockCurrentYear = 2025; // Example mocked current year

		// --- Test Cases: Query Parameter Validation ---
		// These tests should FAIL BEFORE the UtilityService is called
		it('should return 400 if required query parameter "start_year" is missing', async () => {
			const { start_year, ...invalidQuery } = validRequiredQuery;
			req = mockRequest({ mnumber: testMnumber }, invalidQuery);

			await InstructorController.getGradeTrends(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
				error: 'Invalid query parameters.',
			}));
			// Ensure services are NOT called on validation failure
			expect(UtilityService.getCurrentTermAndYear).not.toHaveBeenCalled();
			expect(InstructorService.instructorExists).not.toHaveBeenCalled();
			expect(InstructorService.getGradeTrends).not.toHaveBeenCalled();
		});

		it('should return 400 if required query parameter "end_year" is missing', async () => {
			const { end_year, ...invalidQuery } = validRequiredQuery;
			req = mockRequest({ mnumber: testMnumber }, invalidQuery);
			await InstructorController.getGradeTrends(req, res);
			expect(res.status).toHaveBeenCalledWith(400); // etc.
			expect(UtilityService.getCurrentTermAndYear).not.toHaveBeenCalled();
			expect(InstructorService.instructorExists).not.toHaveBeenCalled();
		});

		// --- Test Case: UtilityService Error ---
		it('should return 500 if UtilityService.getCurrentTermAndYear throws an error', async () => {
			req = mockRequest({ mnumber: testMnumber }, validRequiredQuery);
			const errorMessage = 'Failed to get current term';
			// Arrange: Mock UtilityService to reject
			vi.mocked(UtilityService.getCurrentTermAndYear).mockRejectedValue(new Error(errorMessage));

			// Act
			await InstructorController.getGradeTrends(req, res);

			// Assert
			expect(UtilityService.getCurrentTermAndYear).toHaveBeenCalledTimes(1);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
			// Ensure subsequent services are not called
			expect(InstructorService.instructorExists).not.toHaveBeenCalled();
			expect(InstructorService.getGradeTrends).not.toHaveBeenCalled();
		});

		// --- Test Case: Instructor Not Found ---
		it('should return 404 "Instructor not found" if instructor does not exist', async () => {
			req = mockRequest({ mnumber: testMnumber }, validRequiredQuery);
			// Arrange: Mock UtilityService (success) and InstructorService (failure)
			vi.mocked(UtilityService.getCurrentTermAndYear).mockResolvedValue({ term: mockCurrentTerm, year: mockCurrentYear });
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(false);

			// Act
			await InstructorController.getGradeTrends(req, res);

			// Assert
			expect(UtilityService.getCurrentTermAndYear).toHaveBeenCalledTimes(1);
			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'Instructor not found' });
			expect(InstructorService.getGradeTrends).not.toHaveBeenCalled();
		});

		// --- Test Case: Success (Using Default Dynamic End Term) ---
		it('should return grade trends using fetched current term when end_term is omitted', async () => {
			req = mockRequest({ mnumber: testMnumber }, validRequiredQuery);
			const mockTrendData = [{ grade: 'A', percentage: 30 }];

			// Arrange: Mock services
			vi.mocked(UtilityService.getCurrentTermAndYear).mockResolvedValue({ term: mockCurrentTerm, year: mockCurrentYear });
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			vi.mocked(InstructorService.getGradeTrends).mockResolvedValue(mockTrendData);

			// Act
			await InstructorController.getGradeTrends(req, res);

			// Assert
			expect(UtilityService.getCurrentTermAndYear).toHaveBeenCalledTimes(1);
			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			// Check arguments, using the mocked current term for end_term
			expect(InstructorService.getGradeTrends).toHaveBeenCalledWith(
				testMnumber,
				{ term: defaultStartTerm, year: parsedStartYear },
				{ term: mockCurrentTerm, year: parsedEndYear } // Using mocked term here
			);
			expect(res.status).not.toHaveBeenCalled(); // 200 OK
			expect(res.json).toHaveBeenCalledWith({
				mnumber: testMnumber,
				start_year: parsedStartYear,
				end_year: parsedEndYear,
				gradeTrends: mockTrendData
			});
		});

		// --- Test Case: Success (Providing Optional End Term - Overrides Default) ---
		it('should return grade trends using provided end_term when specified', async () => {
			const providedEndTerm = '80';
			const specificTermsQuery = { ...validRequiredQuery, end_term: providedEndTerm };
			req = mockRequest({ mnumber: testMnumber }, specificTermsQuery);
			const mockTrendData = [{ grade: 'B', percentage: 50 }];

			// Arrange: Mock services (UtilityService will still be called but its term is overridden)
			vi.mocked(UtilityService.getCurrentTermAndYear).mockResolvedValue({ term: mockCurrentTerm, year: mockCurrentYear });
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			vi.mocked(InstructorService.getGradeTrends).mockResolvedValue(mockTrendData);

			// Act
			await InstructorController.getGradeTrends(req, res);

			// Assert
			expect(UtilityService.getCurrentTermAndYear).toHaveBeenCalledTimes(1);
			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			// Check arguments, ensuring provided end_term overrides the fetched default
			expect(InstructorService.getGradeTrends).toHaveBeenCalledWith(
				testMnumber,
				{ term: defaultStartTerm, year: parsedStartYear }, // Assuming start_term is default here
				{ term: providedEndTerm, year: parsedEndYear } // Using provided term
			);
			expect(res.status).not.toHaveBeenCalled(); // 200 OK
			expect(res.json).toHaveBeenCalledWith({
				mnumber: testMnumber,
				start_year: parsedStartYear,
				end_year: parsedEndYear,
				gradeTrends: mockTrendData
			});
		});

		// --- Test Case: Success (Providing Both Optional Terms) ---
		it('should return grade trends using provided start_term and end_term', async () => {
			const providedStartTerm = '20';
			const providedEndTerm = '80';
			const specificTermsQuery = { ...validRequiredQuery, start_term: providedStartTerm, end_term: providedEndTerm };
			req = mockRequest({ mnumber: testMnumber }, specificTermsQuery);
			const mockTrendData = [{ grade: 'C', percentage: 15 }];

			vi.mocked(UtilityService.getCurrentTermAndYear).mockResolvedValue({ term: mockCurrentTerm, year: mockCurrentYear });
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			vi.mocked(InstructorService.getGradeTrends).mockResolvedValue(mockTrendData);

			await InstructorController.getGradeTrends(req, res);

			expect(InstructorService.getGradeTrends).toHaveBeenCalledWith(
				testMnumber,
				{ term: providedStartTerm, year: parsedStartYear }, // Provided start
				{ term: providedEndTerm, year: parsedEndYear }   // Provided end
			);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ gradeTrends: mockTrendData }));
		});


		// --- Test Case: Success (Empty Results) ---
		it('should return 200 OK with empty trends if service finds none', async () => {
			req = mockRequest({ mnumber: testMnumber }, validRequiredQuery);
			const emptyTrendData: unknown[] = [];

			vi.mocked(UtilityService.getCurrentTermAndYear).mockResolvedValue({ term: mockCurrentTerm, year: mockCurrentYear });
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			vi.mocked(InstructorService.getGradeTrends).mockResolvedValue(emptyTrendData);

			await InstructorController.getGradeTrends(req, res);

			expect(InstructorService.getGradeTrends).toHaveBeenCalledWith(
				testMnumber,
				{ term: defaultStartTerm, year: parsedStartYear },
				{ term: mockCurrentTerm, year: parsedEndYear }
			);
			expect(res.status).not.toHaveBeenCalled(); // 200 OK
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ gradeTrends: emptyTrendData }));
		});


		// --- Test Cases: Instructor/Grade Service Errors ---
		it('should return 500 if instructorExists throws an error', async () => {
			req = mockRequest({ mnumber: testMnumber }, validRequiredQuery);
			// Arrange: Mock Utility (success), Instructor (failure)
			vi.mocked(UtilityService.getCurrentTermAndYear).mockResolvedValue({ term: mockCurrentTerm, year: mockCurrentYear });
			vi.mocked(InstructorService.instructorExists).mockRejectedValue(new Error('DB error'));

			// Act
			await InstructorController.getGradeTrends(req, res);

			// Assert
			expect(UtilityService.getCurrentTermAndYear).toHaveBeenCalledTimes(1);
			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
			expect(InstructorService.getGradeTrends).not.toHaveBeenCalled();
		});

		it('should return 500 if getGradeTrends throws an error', async () => {
			req = mockRequest({ mnumber: testMnumber }, validRequiredQuery);
			// Arrange: Mock Utility & InstructorExists (success), getGradeTrends (failure)
			vi.mocked(UtilityService.getCurrentTermAndYear).mockResolvedValue({ term: mockCurrentTerm, year: mockCurrentYear });
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			vi.mocked(InstructorService.getGradeTrends).mockRejectedValue(new Error('DB error'));

			// Act
			await InstructorController.getGradeTrends(req, res);

			// Assert
			expect(UtilityService.getCurrentTermAndYear).toHaveBeenCalledTimes(1);
			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(InstructorService.getGradeTrends).toHaveBeenCalledWith(
				testMnumber,
				{ term: defaultStartTerm, year: parsedStartYear },
				{ term: mockCurrentTerm, year: parsedEndYear }
			);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});

	}); // End describe('getGradeTrends')
}); // End describe('InstructorController')