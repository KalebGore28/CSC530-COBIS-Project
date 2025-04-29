import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { LookupController } from '../../../controllers/lookup-controller';
import { LookupService } from '../../../services/lookup-service';

// --- Mocking LookupService ---
// We tell Vitest to mock the entire module.
vi.mock('../../../services/lookup-service'); // Adjust path as needed

// --- Mocking Express Request/Response ---
// We create mock objects that simulate the behavior of Express req/res.
// We use `vi.fn()` to create spies for methods we want to check (like res.json, res.status).
const mockRequest = {} as Request; // We don't need specific request properties for these tests

const mockResponse = {
	json: vi.fn(), // Spy on the json method
	status: vi.fn(() => mockResponse), // Spy on status, make it chainable by returning itself
} as unknown as Response; // Use 'unknown' then 'Response' for type safety with mocks

// --- Test Suite ---
describe('getColleges', () => {

	// Reset mocks before each test to ensure clean state
	beforeEach(() => {
		vi.clearAllMocks(); // Clears mock call history etc.
	});
	it('should return colleges successfully', async () => {
		// Arrange
		const mockColleges = [{ code: 'C1', description: 'College of Science' }, { code: 'C2', description: 'College of Humanities' }];
		vi.spyOn(LookupService, 'getColleges').mockResolvedValue(mockColleges);

		// Act
		await LookupController.getColleges(mockRequest, mockResponse);

		// Assert
		expect(LookupService.getColleges).toHaveBeenCalledTimes(1);
		expect(mockResponse.status).not.toHaveBeenCalled();
		expect(mockResponse.json).toHaveBeenCalledWith(mockColleges);
	});

	it('should return 500 if service throws error', async () => {
		// Arrange
		const mockError = new Error('Something went wrong');
		vi.spyOn(LookupService, 'getColleges').mockRejectedValue(mockError);

		// Act
		await LookupController.getColleges(mockRequest, mockResponse);

		// Assert
		expect(LookupService.getColleges).toHaveBeenCalledTimes(1);
		expect(mockResponse.status).toHaveBeenCalledWith(500);
		expect(mockResponse.json).toHaveBeenCalledWith({ error: "Internal server error" });
	});
});