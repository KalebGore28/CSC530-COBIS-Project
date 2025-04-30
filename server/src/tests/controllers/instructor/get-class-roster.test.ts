// instructor.controller.getClassRoster.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { InstructorController } from '../../../controllers/instructor-controller';
import { InstructorService } from '../../../services/instructor-service';
import { AuthAndPermissionsRequest } from '../../../types/requests';

// --- Mocking ---

// Mock the InstructorService using the corrected path
vi.mock('../../../services/instructor-service', () => ({
	InstructorService: {
		// Mock methods used in getClassRoster
		instructorExists: vi.fn(),
		getClassRoster: vi.fn(),
		// Include others as needed
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
	describe('getClassRoster', () => {
		let req: AuthAndPermissionsRequest;
		let res: Response;

		// Reset mocks before each test
		beforeEach(() => {
			res = mockResponse();
			vi.clearAllMocks();
		});

		const testMnumber = 'm12345';
		const validQueryBase = {
			subject: 'CSCI',
			number: 212,
			term: '80',
			year: '2025',
			section: '1234'
		};
		const validQueryWithSuffix = { ...validQueryBase, suffix: 'L' };
		const parsedYear = 2025; // Assuming schema parses year to number

		// --- Test Cases: Query Parameter Validation ---
		it('should return 400 if required query parameter "subject" is missing', async () => {
			const { subject, ...invalidQuery } = validQueryBase;
			req = mockRequest({ mnumber: testMnumber }, invalidQuery);

			await InstructorController.getClassRoster(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
				error: 'Invalid query parameters.',
				details: expect.any(Object)
			}));
			expect(InstructorService.instructorExists).not.toHaveBeenCalled();
			expect(InstructorService.getClassRoster).not.toHaveBeenCalled();
		});

		// Add similar tests for missing 'number', 'term', 'year', 'section' ...
		it('should return 400 if required query parameter "year" is missing', async () => {
			const { year, ...invalidQuery } = validQueryBase;
			req = mockRequest({ mnumber: testMnumber }, invalidQuery);
			await InstructorController.getClassRoster(req, res);
			expect(res.status).toHaveBeenCalledWith(400); // etc.
			expect(InstructorService.instructorExists).not.toHaveBeenCalled();
		});

		it('should return 400 if "year" is invalid', async () => {
			req = mockRequest({ mnumber: testMnumber }, { ...validQueryBase, year: 'abc' });
			await InstructorController.getClassRoster(req, res);
			expect(res.status).toHaveBeenCalledWith(400); // etc.
			expect(InstructorService.instructorExists).not.toHaveBeenCalled();
		});

		it('should return 400 if "number" is invalid', async () => {
			req = mockRequest({ mnumber: testMnumber }, { ...validQueryBase, number: true });
			await InstructorController.getClassRoster(req, res);
			expect(res.status).toHaveBeenCalledWith(400); // etc.
			expect(InstructorService.instructorExists).not.toHaveBeenCalled();
		});


		// --- Test Case: Instructor Not Found ---
		it('should return 404 "Instructor not found" if instructor does not exist', async () => {
			req = mockRequest({ mnumber: testMnumber }, validQueryBase);
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(false);

			await InstructorController.getClassRoster(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'Instructor not found' });
			expect(InstructorService.getClassRoster).not.toHaveBeenCalled();
		});

		// --- Test Case: Class Not Found / Not Taught ---
		it('should return 404 "Class not found..." if service returns no roster', async () => {
			req = mockRequest({ mnumber: testMnumber }, validQueryBase);
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			// Mock service to return null/undefined indicating class not found/taught by instructor
			vi.mocked(InstructorService.getClassRoster).mockResolvedValue(null);

			await InstructorController.getClassRoster(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(InstructorService.getClassRoster).toHaveBeenCalledWith(
				testMnumber,
				validQueryBase.subject,
				validQueryBase.number,
				'', // Default suffix
				validQueryBase.section,
				validQueryBase.term,
				parsedYear
			);
			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Class not found or not taught by this instructor'
			});
		});

		// --- Test Case: Success (No Suffix) ---
		it('should return class roster if successful (no suffix provided)', async () => {
			req = mockRequest({ mnumber: testMnumber }, validQueryBase);
			const mockRosterData = [{ studentId: 's1', name: 'Alice' }, { studentId: 's2', name: 'Bob' }];

			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			// @ts-ignore
			vi.mocked(InstructorService.getClassRoster).mockResolvedValue(mockRosterData);

			await InstructorController.getClassRoster(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(InstructorService.getClassRoster).toHaveBeenCalledWith(
				testMnumber,
				validQueryBase.subject,
				validQueryBase.number,
				'', // Assert default empty string suffix is used
				validQueryBase.section,
				validQueryBase.term,
				parsedYear
			);
			expect(res.status).not.toHaveBeenCalled(); // Implies 200 OK
			expect(res.json).toHaveBeenCalledWith({
				mnumber: testMnumber,
				classRoster: mockRosterData
			});
		});

		it('should return class roster if successful with string number', async () => {
			req = mockRequest({ mnumber: testMnumber }, { ...validQueryBase, number: '212' });
			const mockRosterData = [{ studentId: 's1', name: 'Alice' }, { studentId: 's2', name: 'Bob' }];

			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			// @ts-ignore
			vi.mocked(InstructorService.getClassRoster).mockResolvedValue(mockRosterData);

			await InstructorController.getClassRoster(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(InstructorService.getClassRoster).toHaveBeenCalledWith(
				testMnumber,
				validQueryBase.subject,
				validQueryBase.number,
				'', // Assert default empty string suffix is used
				validQueryBase.section,
				validQueryBase.term,
				parsedYear
			);
			expect(res.status).not.toHaveBeenCalled(); // Implies 200 OK
			expect(res.json).toHaveBeenCalledWith({
				mnumber: testMnumber,
				classRoster: mockRosterData
			});
		});

		it('should return class roster if successful with number year', async () => {
			req = mockRequest({ mnumber: testMnumber }, { ...validQueryBase, year: 2025 });
			const mockRosterData = [{ studentId: 's1', name: 'Alice' }, { studentId: 's2', name: 'Bob' }];

			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			// @ts-ignore
			vi.mocked(InstructorService.getClassRoster).mockResolvedValue(mockRosterData);

			await InstructorController.getClassRoster(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(InstructorService.getClassRoster).toHaveBeenCalledWith(
				testMnumber,
				validQueryBase.subject,
				validQueryBase.number,
				'', // Assert default empty string suffix is used
				validQueryBase.section,
				validQueryBase.term,
				parsedYear
			);
			expect(res.status).not.toHaveBeenCalled(); // Implies 200 OK
			expect(res.json).toHaveBeenCalledWith({
				mnumber: testMnumber,
				classRoster: mockRosterData
			});
		});

		// --- Test Case: Success (With Suffix) ---
		it('should return class roster if successful (suffix provided)', async () => {
			req = mockRequest({ mnumber: testMnumber }, validQueryWithSuffix);
			const mockRosterData = [{ studentId: 's3', name: 'Charlie' }];

			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			// @ts-ignore
			vi.mocked(InstructorService.getClassRoster).mockResolvedValue(mockRosterData);

			await InstructorController.getClassRoster(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(InstructorService.getClassRoster).toHaveBeenCalledWith(
				testMnumber,
				validQueryWithSuffix.subject,
				validQueryWithSuffix.number,
				validQueryWithSuffix.suffix, // Assert provided suffix is used
				validQueryWithSuffix.section,
				validQueryWithSuffix.term,
				parsedYear
			);
			expect(res.status).not.toHaveBeenCalled(); // Implies 200 OK
			expect(res.json).toHaveBeenCalledWith({
				mnumber: testMnumber,
				classRoster: mockRosterData
			});
		});

		// --- Test Cases: Server Errors ---
		it('should return 500 if instructorExists throws an error', async () => {
			req = mockRequest({ mnumber: testMnumber }, validQueryBase);
			vi.mocked(InstructorService.instructorExists).mockRejectedValue(new Error('DB error'));

			await InstructorController.getClassRoster(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
			expect(InstructorService.getClassRoster).not.toHaveBeenCalled();
		});

		it('should return 500 if getClassRoster throws an error', async () => {
			req = mockRequest({ mnumber: testMnumber }, validQueryBase);
			vi.mocked(InstructorService.instructorExists).mockResolvedValue(true);
			vi.mocked(InstructorService.getClassRoster).mockRejectedValue(new Error('DB error'));

			await InstructorController.getClassRoster(req, res);

			expect(InstructorService.instructorExists).toHaveBeenCalledWith(testMnumber);
			expect(InstructorService.getClassRoster).toHaveBeenCalledWith(
				testMnumber,
				validQueryBase.subject,
				validQueryBase.number,
				'',
				validQueryBase.section,
				validQueryBase.term,
				parsedYear
			);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});

	}); // End describe('getClassRoster')
}); // End describe('InstructorController')