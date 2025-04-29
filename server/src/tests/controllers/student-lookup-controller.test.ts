// src/tests/controllers/student-lookup/lookupStudents.test.ts
// @ts-nocheck
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import {
	StudentLookupController,
} from '../../controllers/student-lookup-controller'; // Adjust path
import { StudentLookupService } from '../../services/student-lookup-service'; // Adjust path

// --- Mock StudentLookupService ---
// Mock all methods used by the controller function
vi.mock('../../services/student-lookup-service', () => ({
	StudentLookupService: {
		lookupStudents: vi.fn(),
		parseCourseId: vi.fn((id) => ({ original: id, parsed: `parsed_${id}` })), // Example mock implementation
		parseGradeFilter: vi.fn((grade) => ({ original: grade, parsed: `parsed_${grade}` })), // Example mock implementation
	},
}));

// --- Test Suite for lookupStudents ---
describe('StudentLookupController', () => {

	describe('lookupStudents Function', () => {
		// Mocks for this test suite
		let mockReq: Partial<Request>;
		let mockRes: Partial<Response>;

		beforeEach(() => {
			// Reset all relevant mocks before each test
			(StudentLookupService.lookupStudents as Mock)?.mockReset();
			(StudentLookupService.parseCourseId as Mock)?.mockReset();
			(StudentLookupService.parseGradeFilter as Mock)?.mockReset();

			// Setup basic Express mocks
			mockReq = {
				query: {}, // To be populated in tests
			};
			mockRes = {
				status: vi.fn().mockReturnThis(),
				json: vi.fn(),
			};

			// Reset mock implementations to default (optional, if needed)
			vi.mocked(StudentLookupService.parseCourseId).mockImplementation(
				(id) => ({ original: id, parsed: `parsed_${id}` })
			);
			vi.mocked(StudentLookupService.parseGradeFilter).mockImplementation(
				(grade) => ({ original: grade, parsed: `parsed_${grade}` })
			);
		});

		// --- Test Cases ---

		it('should return 400 with details if query parameter validation fails (invalid enum)', async () => {
			mockReq.query = { academicLevels: 'invalidLevel,Freshman' }; // 'invalidLevel' is not in the enum

			await StudentLookupController.lookupStudents(mockReq as Request, mockRes as Response);

			expect(mockRes.status).toHaveBeenCalledTimes(1);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledTimes(1);
			// Check the basic error structure and presence of details
			expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
				error: 'Invalid query parameters',
				details: expect.any(Array),
			}));
			// Ensure service methods were not called
			expect(StudentLookupService.lookupStudents).not.toHaveBeenCalled();
			expect(StudentLookupService.parseCourseId).not.toHaveBeenCalled();
			expect(StudentLookupService.parseGradeFilter).not.toHaveBeenCalled();
		});

		it('should return 400 with details if query parameter validation fails (GPA out of range)', async () => {
			mockReq.query = { gpaMin: '5.0' }; // Invalid GPA

			await StudentLookupController.lookupStudents(mockReq as Request, mockRes as Response);

			expect(mockRes.status).toHaveBeenCalledTimes(1);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
				error: 'Invalid query parameters',
				details: expect.any(Array),
			}));
			expect(StudentLookupService.lookupStudents).not.toHaveBeenCalled();
		});


		it('should call lookupStudents with undefined filters when query is empty', async () => {
			const mockStudentResults = [{ id: 'M1', name: 'Student One' }];
			mockReq.query = {}; // Empty query
			const expectedFilters = { // All should be undefined after Zod processing
				academicLevels: undefined,
				gpaMin: undefined,
				gpaMax: undefined,
				majors: undefined,
				minors: undefined,
				coursesTaken: undefined, // Parsing won't happen as input is undefined
				coursesNotTaken: undefined,
				gradeFilters: undefined,
			};

			vi.mocked(StudentLookupService.lookupStudents).mockResolvedValue(mockStudentResults);

			await StudentLookupController.lookupStudents(mockReq as Request, mockRes as Response);

			expect(StudentLookupService.parseCourseId).not.toHaveBeenCalled();
			expect(StudentLookupService.parseGradeFilter).not.toHaveBeenCalled();
			expect(StudentLookupService.lookupStudents).toHaveBeenCalledTimes(1);
			expect(StudentLookupService.lookupStudents).toHaveBeenCalledWith(expectedFilters);
			expect(mockRes.json).toHaveBeenCalledTimes(1);
			expect(mockRes.json).toHaveBeenCalledWith(mockStudentResults);
			expect(mockRes.status).not.toHaveBeenCalled();
		});

		it('should call parsers and lookupStudents with correct filters from valid query', async () => {
			const mockStudentResults = [{ id: 'M2', name: 'Student Two' }];
			mockReq.query = {
				academicLevels: 'Junior,Senior',
				gpaMin: '3.0',
				coursesTaken: 'CS101, MATH202', // Comma-separated string
				gradeFilters: 'A, B' // Comma-separated string
			};

			// Expected parsed values based on mock implementations
			const expectedParsedCourses = [
				{ original: 'CS101', parsed: 'parsed_CS101' },
				{ original: 'MATH202', parsed: 'parsed_MATH202' },
			];

			const expectedParsedGrades = [
				{ original: 'A', parsed: 'parsed_A' },
				{ original: 'B', parsed: 'parsed_B' },
			];

			const expectedFilters = {
				academicLevels: ['Junior', 'Senior'], // Zod handles splitting
				gpaMin: 3.0, // Zod handles parsing
				gpaMax: undefined,
				majors: undefined,
				minors: undefined,
				coursesTaken: expectedParsedCourses, // Parsed values
				coursesNotTaken: undefined,
				gradeFilters: expectedParsedGrades, // Parsed values
			};

			vi.mocked(StudentLookupService.lookupStudents).mockResolvedValue(mockStudentResults);

			await StudentLookupController.lookupStudents(mockReq as Request, mockRes as Response);

			// Check parser calls
			expect(StudentLookupService.parseCourseId).toHaveBeenCalledTimes(2);
			expect(StudentLookupService.parseCourseId).toHaveBeenCalledWith('CS101');
			expect(StudentLookupService.parseCourseId).toHaveBeenCalledWith('MATH202');
			expect(StudentLookupService.parseGradeFilter).toHaveBeenCalledTimes(2);
			expect(StudentLookupService.parseGradeFilter).toHaveBeenCalledWith('A');
			expect(StudentLookupService.parseGradeFilter).toHaveBeenCalledWith('B');

			// Check main service call
			expect(StudentLookupService.lookupStudents).toHaveBeenCalledTimes(1);
			expect(StudentLookupService.lookupStudents).toHaveBeenCalledWith(expectedFilters);

			// Check response
			expect(mockRes.json).toHaveBeenCalledTimes(1);
			expect(mockRes.json).toHaveBeenCalledWith(mockStudentResults);
			expect(mockRes.status).not.toHaveBeenCalled();
		});

		it('should return 500 if parseCourseId throws an error', async () => {
			const testError = new Error("Parsing failed");
			mockReq.query = { coursesTaken: 'CS101' }; // Valid query to trigger parsing

			// Make the parser throw an error
			vi.mocked(StudentLookupService.parseCourseId).mockImplementationOnce(() => {
				throw testError;
			});

			await StudentLookupController.lookupStudents(mockReq as Request, mockRes as Response);

			expect(StudentLookupService.parseCourseId).toHaveBeenCalledWith('CS101');
			expect(StudentLookupService.lookupStudents).not.toHaveBeenCalled(); // Should not be reached
			expect(mockRes.status).toHaveBeenCalledTimes(1);
			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});

		it('should return 500 if lookupStudents throws an error', async () => {
			const testError = new Error("Database lookup failed");
			mockReq.query = { gpaMin: '2.5' }; // Valid query
			const expectedFilters = expect.objectContaining({ gpaMin: 2.5 }); // Simplified check

			// Make the main lookup throw
			vi.mocked(StudentLookupService.lookupStudents).mockRejectedValue(testError);

			await StudentLookupController.lookupStudents(mockReq as Request, mockRes as Response);

			expect(StudentLookupService.lookupStudents).toHaveBeenCalledTimes(1);
			expect(StudentLookupService.lookupStudents).toHaveBeenCalledWith(expectedFilters); // Ensure it was called correctly before throwing
			expect(mockRes.status).toHaveBeenCalledTimes(1);
			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});

		// test coursesNotTaken
		it('should parse coursesNotTaken correctly', async () => {
			const mockStudentResults = [{ id: 'M3', name: 'Student Three' }];
			mockReq.query = {
				coursesNotTaken: 'CS101, MATH202',
			};

			const expectedParsedCoursesNotTaken = [
				{ original: 'CS101', parsed: 'parsed_CS101' },
				{ original: 'MATH202', parsed: 'parsed_MATH202' },
			];

			const expectedFilters = {
				coursesNotTaken: expectedParsedCoursesNotTaken,
			};

			vi.mocked(StudentLookupService.lookupStudents).mockResolvedValue(mockStudentResults);

			await StudentLookupController.lookupStudents(mockReq as Request, mockRes as Response);

			expect(StudentLookupService.parseCourseId).toHaveBeenCalledTimes(2);
			expect(StudentLookupService.parseCourseId).toHaveBeenCalledWith('CS101');
			expect(StudentLookupService.parseCourseId).toHaveBeenCalledWith('MATH202');

			expect(StudentLookupService.lookupStudents).toHaveBeenCalledTimes(1);
			expect(StudentLookupService.lookupStudents).toHaveBeenCalledWith(expectedFilters);

			expect(mockRes.json).toHaveBeenCalledTimes(1);
			expect(mockRes.json).toHaveBeenCalledWith(mockStudentResults);
		});

	}); // End describe('lookupStudents Function')

}); // End describe('StudentLookupController')