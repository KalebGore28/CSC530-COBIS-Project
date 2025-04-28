// getAdvisedStudents.test.ts
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { AdvisorController } from '../../../controllers/advisor-controller';
import { AdvisorService } from '../../../services/advisor-service';
import { AuthAndPermissionsRequest } from '../../../types/requests';
import { ZodError } from 'zod'; // Import ZodError for checking error structure

// Mock the AdvisorService - Adjust the path as needed
vi.mock('../../../services/advisor-service', () => ({
	AdvisorService: {
		getAdvisedStudents: vi.fn(),
	},
}));

// Mock Express objects
let mockReq: Partial<AuthAndPermissionsRequest>;
let mockRes: Partial<Response>;

beforeEach(() => {
	// Reset mocks including the service mock before each test
	vi.clearAllMocks();

	mockReq = {
		mnumber: 'M12345678', // Default valid mnumber
		query: {}, // Default empty query
	};
	mockRes = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn(),
	};
});

describe('AdvisorController.getAdvisedStudents', () => {
	it('should return 400 if advisor mnumber is missing', async () => {
		delete mockReq.mnumber; // Make mnumber missing
		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(400);
		expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid advisor identifier.' });
	});

	it('should return 400 with Zod errors if query validation fails (invalid year)', async () => {
		mockReq.query = { year: 'not-a-number' }; // Invalid year format
		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(400);
		// Check that the response includes the Zod error structure
		expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
			error: 'Invalid query parameters.',
			details: expect.any(Object), // Zod's formatted errors are complex objects
		}));
		// Optionally, check for specific error details if needed
		const responseJson = (mockRes.json as Mock).mock.calls[0][0];
		expect(responseJson.details?.year?._errors).toEqual(expect.arrayContaining([expect.any(String)]));
	});

	it('should return 400 with Zod errors if query validation fails (non-positive year)', async () => {
		mockReq.query = { year: '0' }; // Invalid year (must be positive)
		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(400);
		expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
			error: 'Invalid query parameters.',
			details: expect.any(Object),
		}));
		const responseJson = (mockRes.json as Mock).mock.calls[0][0];
		expect(responseJson.details?.year?._errors).toEqual(expect.arrayContaining([expect.any(String)]));
	});

	it('should call service with parsed term and year if validation succeeds', async () => {
		const mockStudents = [{ id: 1, name: 'Student A' }];
		mockReq.query = { term: 'Fall', year: '2023' }; // Valid query params as strings
		(AdvisorService.getAdvisedStudents as Mock).mockResolvedValue(mockStudents);

		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledTimes(1);
		// Zod schema preprocesses year '2023' into number 2023
		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledWith({
			advisorMnumber: 'M12345678',
			term: 'Fall',
			year: 2023,
		});
		expect(mockRes.json).toHaveBeenCalledWith(mockStudents);
		expect(mockRes.status).not.toHaveBeenCalled();
	});

	it('should call service with parsed term and number if validation succeeds (year as number)', async () => {
		const mockStudents = [{ id: 1, name: 'Student A' }];
		// @ts-ignore // Mocking the year as a number directly since the api accepts it.
		mockReq.query = { term: 'Fall', year: 2023 }; // Valid query params as strings
		(AdvisorService.getAdvisedStudents as Mock).mockResolvedValue(mockStudents);

		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledTimes(1);
		// Zod schema preprocesses year '2023' into number 2023
		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledWith({
			advisorMnumber: 'M12345678',
			term: 'Fall',
			year: 2023,
		});
		expect(mockRes.json).toHaveBeenCalledWith(mockStudents);
		expect(mockRes.status).not.toHaveBeenCalled();
	});

	it('should call service with only term if year is not provided', async () => {
		const mockStudents = [{ id: 2, name: 'Student B' }];
		mockReq.query = { term: 'Spring' }; // Only term
		(AdvisorService.getAdvisedStudents as Mock).mockResolvedValue(mockStudents);

		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledTimes(1);
		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledWith({
			advisorMnumber: 'M12345678',
			term: 'Spring',
			year: undefined, // Year is optional
		});
		expect(mockRes.json).toHaveBeenCalledWith(mockStudents);
	});

	it('should call service with only year if term is not provided', async () => {
		const mockStudents = [{ id: 3, name: 'Student C' }];
		mockReq.query = { year: '2024' }; // Only year (as string)
		(AdvisorService.getAdvisedStudents as Mock).mockResolvedValue(mockStudents);

		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledTimes(1);
		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledWith({
			advisorMnumber: 'M12345678',
			term: undefined, // Term is optional
			year: 2024, // Preprocessed to number
		});
		expect(mockRes.json).toHaveBeenCalledWith(mockStudents);
	});

	it('should call service with no term/year if neither is provided', async () => {
		const mockStudents = [{ id: 4, name: 'Student D' }];
		mockReq.query = {}; // Empty query
		(AdvisorService.getAdvisedStudents as Mock).mockResolvedValue(mockStudents);

		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledTimes(1);
		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledWith({
			advisorMnumber: 'M12345678',
			term: undefined,
			year: undefined,
		});
		expect(mockRes.json).toHaveBeenCalledWith(mockStudents);
	});

	it('should return 500 if AdvisorService throws an error', async () => {
		const errorMessage = 'Database connection failed';
		mockReq.query = { year: '2023' }; // Valid query
		(AdvisorService.getAdvisedStudents as Mock).mockRejectedValue(new Error(errorMessage)); // Setup mock to throw error

		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledTimes(1);
		expect(mockRes.status).toHaveBeenCalledWith(500);
		expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error while fetching advised students.' });
	});
});