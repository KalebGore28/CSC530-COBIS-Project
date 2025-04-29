// src/tests/controllers/utility/getCurrentTermAndYear.test.ts
// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach, Mock, MockInstance } from 'vitest'; // Added afterEach, MockInstance
import { Request, Response } from 'express';
import { UtilityController } from '../../controllers/utility-controller';
import { UtilityService } from '../../services/utility-service'; // Adjusted import path

// --- Mock UtilityService ---
// Mock only the methods needed for getCurrentTermAndYear
vi.mock('../../services/utility-service', () => ({
	UtilityService: {
		getCurrentTermAndYear: vi.fn(), // Mock the relevant service method
	},
}));

// --- Test Suite for getCurrentTermAndYear ---
describe('UtilityController', () => {

	describe('getCurrentTermAndYear Function', () => {
		// Mocks for this test suite
		let mockReq: Partial<Request>;
		let mockRes: Partial<Response>;
		let consoleErrorSpy: MockInstance; // To spy on console.error

		beforeEach(() => {
			// Reset relevant mocks before each test
			(UtilityService.getCurrentTermAndYear as Mock)?.mockReset();

			// Setup basic Express mocks (req is minimal as it's not used)
			mockReq = {};
			mockRes = {
				status: vi.fn().mockReturnThis(),
				json: vi.fn(),
			};

			// Spy on console.error and suppress output during test
			consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
		});

		afterEach(() => {
			// Restore console.error to its original behavior after each test
			consoleErrorSpy.mockRestore();
		});


		// --- Test Cases ---

		it('should call UtilityService.getCurrentTermAndYear and return 200 with term data', async () => {
			const mockCurrentTermData = { // Example structure
				term: 'Fall',
				year: 2025, // Using current year from context
				startDate: '2025-08-25',
				endDate: '2025-12-15',
			};

			// Configure the mock service method
			vi.mocked(UtilityService.getCurrentTermAndYear).mockResolvedValue(mockCurrentTermData);

			// Call the controller method
			await UtilityController.getCurrentTermAndYear(mockReq as Request, mockRes as Response);

			// Assertions
			expect(UtilityService.getCurrentTermAndYear).toHaveBeenCalledTimes(1);
			expect(UtilityService.getCurrentTermAndYear).toHaveBeenCalledWith(); // No arguments expected
			expect(mockRes.status).toHaveBeenCalledTimes(1);
			expect(mockRes.status).toHaveBeenCalledWith(200); // Verify 200 status
			expect(mockRes.json).toHaveBeenCalledTimes(1);
			expect(mockRes.json).toHaveBeenCalledWith(mockCurrentTermData); // Verify response body
			expect(consoleErrorSpy).not.toHaveBeenCalled(); // Ensure console.error was NOT called
		});

		it('should return 500 with specific error message and log error if UtilityService.getCurrentTermAndYear throws', async () => {
			const errorMessage = 'Service unavailable';
			const testError = new Error(errorMessage);
			// Configure the mock service method to throw an error
			vi.mocked(UtilityService.getCurrentTermAndYear).mockRejectedValue(testError);

			// Call the controller method
			await UtilityController.getCurrentTermAndYear(mockReq as Request, mockRes as Response);

			// Assertions
			expect(UtilityService.getCurrentTermAndYear).toHaveBeenCalledTimes(1);
			expect(UtilityService.getCurrentTermAndYear).toHaveBeenCalledWith();
			expect(mockRes.status).toHaveBeenCalledTimes(1);
			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledTimes(1);
		});

	}); // End describe('getCurrentTermAndYear Function')

}); // End describe('UtilityController')