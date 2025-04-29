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
describe('getDepartments', () => {

	// Reset mocks before each test to ensure clean state
	beforeEach(() => {
		vi.clearAllMocks(); // Clears mock call history etc.
	});

	it('should return departments successfully', async () => {
		// Arrange: Define mock data and setup service mock
		const mockDepartments = [{ code: '1', description: 'Engineering' }, { code: '2', description: 'Arts' }];
		// Mock the static method directly on the mocked service
		vi.spyOn(LookupService, 'getDepartments').mockResolvedValue(mockDepartments);

		// Act: Call the controller method
		await LookupController.getDepartments(mockRequest, mockResponse);

		// Assert: Check if the service was called and response is correct
		expect(LookupService.getDepartments).toHaveBeenCalledTimes(1);
		expect(mockResponse.status).not.toHaveBeenCalled(); // Status 500 shouldn't be called
		expect(mockResponse.json).toHaveBeenCalledWith(mockDepartments);
	});

	it('should return 500 if service throws error', async () => {
		// Arrange: Setup service mock to throw an error
		const mockError = new Error('Database unavailable');
		vi.spyOn(LookupService, 'getDepartments').mockRejectedValue(mockError);

		// Act: Call the controller method
		await LookupController.getDepartments(mockRequest, mockResponse);

		// Assert: Check if the service was called and error response is correct
		expect(LookupService.getDepartments).toHaveBeenCalledTimes(1);
		expect(mockResponse.status).toHaveBeenCalledWith(500);
		expect(mockResponse.json).toHaveBeenCalledWith({ error: "Internal server error" });
	});
});