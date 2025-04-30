// File: src/controllers/search.controller.test.ts
// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { SearchController } from '../../controllers/search-controller';
import { SearchService } from '../../services/search-service'; // Adjust path as needed

// --- Mock SearchService ---
vi.mock('../services/search-service'); // Adjust path as needed

// --- Mock Request/Response ---
// Use 'any' for simplicity here, or create more specific types if preferred
let mockRequest: any;
let mockResponse: any;

beforeEach(() => {
	// Reset mocks and request/response objects before each test
	vi.clearAllMocks();

	// Reset mock Request for each test
	mockRequest = {
		query: {}, // Initialize query object
	} as Partial<Request>; // Use Partial<Request> for easier mocking

	// Reset mock Response for each test
	mockResponse = {
		json: vi.fn(),
		status: vi.fn(() => mockResponse), // Make status chainable
	} as unknown as Response;
});

// --- Test Suite ---
describe('SearchController', () => {

	// --- Test Validation Logic ---
    describe('Query Validation', () => {
        it('should return 400 if query parameter is missing', async () => {
            // Arrange: No req.query.query is set
            // *** Explicitly spy on the method we want to check ***
            const serviceSpy = vi.spyOn(SearchService, 'searchAcademicStandings');

            // Act: Call any search method (validation happens first)
            await SearchController.searchAcademicStandings(mockRequest as Request, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                error: "Invalid query parameter. It should be a string.",
                details: expect.any(Array), // Check that Zod errors array is present
            }));
            // Crucially, ensure the service method (spy) was *not* called
            expect(serviceSpy).not.toHaveBeenCalled(); // Assert on the spy
        });

        it('should return 400 if query parameter is not a string', async () => {
            // Arrange
            mockRequest.query = { query: 123 }; // Invalid type
            // *** Explicitly spy on the method we want to check ***
            const serviceSpy = vi.spyOn(SearchService, 'searchColleges');

            // Act
            await SearchController.searchColleges(mockRequest as Request, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                error: "Invalid query parameter. It should be a string.",
                details: expect.any(Array),
            }));
            // Crucially, ensure the service method (spy) was *not* called
            expect(serviceSpy).not.toHaveBeenCalled(); // Assert on the spy
        });
    });

	// --- Test Individual Search Methods ---
	// Array defining the methods to test and their corresponding service methods
	const searchMethodsToTest = [
		{ controllerMethod: SearchController.searchAcademicStandings, serviceMethodName: 'searchAcademicStandings' as keyof typeof SearchService },
		{ controllerMethod: SearchController.searchAdmitCodes, serviceMethodName: 'searchAdmitCodes' as keyof typeof SearchService },
		{ controllerMethod: SearchController.searchColleges, serviceMethodName: 'searchColleges' as keyof typeof SearchService },
		{ controllerMethod: SearchController.searchCollegeCodes, serviceMethodName: 'searchCollegeCodes' as keyof typeof SearchService },
		{ controllerMethod: SearchController.searchCourses, serviceMethodName: 'searchCourses' as keyof typeof SearchService },
		{ controllerMethod: SearchController.searchDepartments, serviceMethodName: 'searchDepartments' as keyof typeof SearchService },
		{ controllerMethod: SearchController.searchNations, serviceMethodName: 'searchNations' as keyof typeof SearchService },
		{ controllerMethod: SearchController.searchPartOfTerms, serviceMethodName: 'searchPartOfTerms' as keyof typeof SearchService },
		{ controllerMethod: SearchController.searchPrograms, serviceMethodName: 'searchPrograms' as keyof typeof SearchService },
		{ controllerMethod: SearchController.searchRegistrationStatuses, serviceMethodName: 'searchRegistrationStatuses' as keyof typeof SearchService },
		{ controllerMethod: SearchController.searchTerms, serviceMethodName: 'searchTerms' as keyof typeof SearchService },
		{ controllerMethod: SearchController.searchFaculty, serviceMethodName: 'searchFaculty' as keyof typeof SearchService },
		// Add other methods here if any
	];

	// Use describe.each to run the same tests for multiple methods
	describe.each(searchMethodsToTest)('$serviceMethodName', ({ controllerMethod, serviceMethodName }) => {

		it('should call service and return results on valid query', async () => {
			// Arrange
			const searchQuery = 'test query';
			const mockResults = [{ id: 1, name: 'Result 1' }, { id: 2, name: 'Result 2' }];
			mockRequest.query = { query: searchQuery };

			// Ensure the correct static method on the *mocked* SearchService is spied on and mocked
			const serviceSpy = vi.spyOn(SearchService, serviceMethodName).mockResolvedValue(mockResults);

			// Act
			await controllerMethod(mockRequest as Request, mockResponse);

			// Assert
			expect(serviceSpy).toHaveBeenCalledTimes(1);
			expect(serviceSpy).toHaveBeenCalledWith(searchQuery); // Check it's called with the validated query
			expect(mockResponse.status).not.toHaveBeenCalled(); // No 400 or 500 status
			expect(mockResponse.json).toHaveBeenCalledWith(mockResults);
		});

		it('should return 500 if service throws an error', async () => {
			// Arrange
			const searchQuery = 'another query';
			const mockError = new Error('Service failure');
			mockRequest.query = { query: searchQuery };

			// Mock the service method to reject
			const serviceSpy = vi.spyOn(SearchService, serviceMethodName).mockRejectedValue(mockError);

			// Act
			await controllerMethod(mockRequest as Request, mockResponse);

			// Assert
			expect(serviceSpy).toHaveBeenCalledTimes(1);
			expect(serviceSpy).toHaveBeenCalledWith(searchQuery);
			expect(mockResponse.status).toHaveBeenCalledWith(500);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: "Internal server error" });
		});
	});
});