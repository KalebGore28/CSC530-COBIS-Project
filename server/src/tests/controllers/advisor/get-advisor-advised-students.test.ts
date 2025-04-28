// advisor.getAdvisedStudents.test.ts
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { AdvisorController } from '../../../controllers/advisor-controller';
import { AdvisorService } from '../../../services/advisor-service';
import { AuthAndPermissionsRequest } from '../../../types/requests';

// Mock the AdvisorService - Adjust the path as needed
vi.mock('../../../services/advisor-service', () => {
	const mockFn = vi.fn();
	return {
		AdvisorService: {
			getAdvisedStudents: mockFn, // Mock the static method
		},
	};
});

// Mock Express objects
let mockReq: Partial<AuthAndPermissionsRequest>;
let mockRes: Partial<Response>;
const targetAdvisorMnumber = 'M87654321'; // The mnumber from req.params

beforeEach(() => {
	// Reset mocks including the service mock before each test
	vi.clearAllMocks();

	mockReq = {
		params: { mnumber: targetAdvisorMnumber }, // Set the target mnumber in params
		query: {}, // Default empty query
	};
	mockRes = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn(),
	};
});

describe('AdvisorController.getAdvisedStudents', () => {

	it('should return 400 with Zod errors if query validation fails (invalid year)', async () => {
		mockReq.query = { year: 'this-is-not-a-year' }; // Invalid year format
		// Cast req to Request as the controller expects it, even though we use Auth props internally sometimes
		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(400);
		expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
			error: 'Invalid query parameters.',
			details: expect.any(Object), // Zod's formatted errors
		}));
		// Optional: Check specific error details
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
	});

	it('should call service with mnumber from params and parsed term/year if validation succeeds', async () => {
		const mockStudents = [{ studentId: 10, name: 'Eve' }];
		mockReq.query = { term: 'Summer II', year: '2023' }; // Valid query params
		(AdvisorService.getAdvisedStudents as Mock).mockResolvedValue(mockStudents);

		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledTimes(1);
		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledWith({
			advisorMnumber: targetAdvisorMnumber, // Expecting mnumber from params
			term: 'Summer II',
			year: 2023, // Preprocessed by Zod
		});
		expect(mockRes.json).toHaveBeenCalledWith(mockStudents);
		expect(mockRes.status).not.toHaveBeenCalled();
	});

	it('should call service with mnumber from params and only term if year is not provided', async () => {
		const mockStudents = [{ studentId: 11, name: 'Frank' }];
		mockReq.query = { term: 'Winter' }; // Only term
		(AdvisorService.getAdvisedStudents as Mock).mockResolvedValue(mockStudents);

		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledTimes(1);
		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledWith({
			advisorMnumber: targetAdvisorMnumber,
			term: 'Winter',
			year: undefined, // Year is optional
		});
		expect(mockRes.json).toHaveBeenCalledWith(mockStudents);
	});

	it('should call service with mnumber from params and only year if term is not provided', async () => {
		const mockStudents = [{ studentId: 12, name: 'Grace' }];
		mockReq.query = { year: '2026' }; // Only year (as string)
		(AdvisorService.getAdvisedStudents as Mock).mockResolvedValue(mockStudents);

		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledTimes(1);
		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledWith({
			advisorMnumber: targetAdvisorMnumber,
			term: undefined, // Term is optional
			year: 2026, // Preprocessed to number
		});
		expect(mockRes.json).toHaveBeenCalledWith(mockStudents);
	});

	it('should call service with mnumber from params and no term/year if neither is provided', async () => {
		const mockStudents = [{ studentId: 13, name: 'Heidi' }];
		mockReq.query = {}; // Empty query
		(AdvisorService.getAdvisedStudents as Mock).mockResolvedValue(mockStudents);

		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledTimes(1);
		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledWith({
			advisorMnumber: targetAdvisorMnumber,
			term: undefined,
			year: undefined,
		});
		expect(mockRes.json).toHaveBeenCalledWith(mockStudents);
	});

	it('should return 500 if AdvisorService.getAdvisedStudents throws an error', async () => {
		const errorMessage = 'Data fetch failed';
		mockReq.query = { term: 'Maymester' }; // Valid query
		(AdvisorService.getAdvisedStudents as Mock).mockRejectedValue(new Error(errorMessage)); // Setup mock to throw error

		await AdvisorController.getAdvisedStudents(mockReq as Request, mockRes as Response);

		expect(AdvisorService.getAdvisedStudents).toHaveBeenCalledTimes(1);
		expect(mockRes.status).toHaveBeenCalledWith(500);
		expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error while fetching advised students.' });
	});
});