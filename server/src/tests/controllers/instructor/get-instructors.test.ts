// instructor.controller.getInstructors.test.ts
// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import { InstructorController } from '../../../controllers/instructor-controller';
import { InstructorService } from '../../../services/instructor-service';
import { AuthAndPermissionsRequest } from '../../../types/requests';

// --- Mocking ---

// Mock InstructorService
vi.mock('../../../services/instructor-service', () => ({
	InstructorService: {
		// Mock method used in getInstructors
		getInstructors: vi.fn(),
		// Include others as needed for potential shared dependencies or type checking
		instructorExists: vi.fn(),
		getGradeTrends: vi.fn(),
		getClassRoster: vi.fn(),
		getTermSummaries: vi.fn(),
		getCourseDetails: vi.fn(),
		getTeachingSummary: vi.fn(),
		getCurrentStatus: vi.fn(),
		getBasicInfo: vi.fn(),
		isInstructorInDepartment: vi.fn(),
	}
}));

// No UtilityService dependency here

// --- Mock Helpers ---

const mockResponse = () => {
	const res = {} as Partial<Response>;
	res.status = vi.fn().mockReturnThis();
	res.json = vi.fn().mockReturnThis();
	return res as Response;
};

// Using a more specific mock helper for this function's needs
const mockAuthRequest = (
	roles: { role_name: string; role_id: number }[] = [],
	department?: string
): AuthAndPermissionsRequest => {
	// Only need roles and department properties for this controller method
	const req = { roles, department } as Partial<AuthAndPermissionsRequest>;
	// No params or query needed here
	return req as AuthAndPermissionsRequest;
};


// --- Test Suite ---

describe('InstructorController', () => {
	describe('getInstructors', () => {
		let req: AuthAndPermissionsRequest;
		let res: Response;

		// Reset mocks before each test
		beforeEach(() => {
			res = mockResponse();
			vi.clearAllMocks();
		});

		const cobisAdminRole = [{ role_name: 'cobis_administrator', role_id: 1 }];
		const deptChairRole = [{ role_name: 'department_chair', role_id: 2 }];
		const facultyRole = [{ role_name: 'faculty', role_id: 3 }];
		const testDepartment = 'CSCI';
		const sampleInstructors = [
			{ mnumber: 'm1', name: 'Alice Admin' },
			{ mnumber: 'm2', name: 'Bob Chair' },
			{ mnumber: 'm3', name: 'Charlie Coder' }
		];
		const sampleDeptInstructors = [
			{ mnumber: 'm2', name: 'Bob Chair' },
			{ mnumber: 'm3', name: 'Charlie Coder' }
		];

		// --- Test Case: Permission Denied ---
		it('should return 403 if user is neither COBIS Admin nor Department Chair', async () => {
			req = mockAuthRequest(facultyRole); // User with insufficient role

			await InstructorController.getInstructors(req, res);

			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. Insufficient permissions.' });
			expect(InstructorService.getInstructors).not.toHaveBeenCalled();
		});

		it('should return 403 if user has no roles', async () => {
			req = mockAuthRequest([]); // No roles

			await InstructorController.getInstructors(req, res);

			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. Insufficient permissions.' });
			expect(InstructorService.getInstructors).not.toHaveBeenCalled();
		});

		// --- Test Case: Department Chair - Missing Department ---
		it('should return 400 if user is Department Chair but department is missing on request', async () => {
			// Has the role, but no department property attached
			req = mockAuthRequest(deptChairRole, undefined);

			await InstructorController.getInstructors(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: 'Department chair has no associated department' });
			expect(InstructorService.getInstructors).not.toHaveBeenCalled();
		});

		// --- Test Case: Department Chair - Success ---
		it('should call getInstructors with department code for Department Chair', async () => {
			req = mockAuthRequest(deptChairRole, testDepartment); // Has role and department
			// Mock service to return specific instructors for that department
			vi.mocked(InstructorService.getInstructors).mockResolvedValue(sampleDeptInstructors);

			await InstructorController.getInstructors(req, res);

			// Assert service was called with the specific department code
			expect(InstructorService.getInstructors).toHaveBeenCalledWith(testDepartment);
			expect(res.status).not.toHaveBeenCalled(); // Implies 200 OK
			expect(res.json).toHaveBeenCalledWith(sampleDeptInstructors);
		});

		// --- Test Case: COBIS Admin - Success ---
		it('should call getInstructors with undefined department for COBIS Admin', async () => {
			req = mockAuthRequest(cobisAdminRole); // Only admin role
			// Mock service to return all instructors
			vi.mocked(InstructorService.getInstructors).mockResolvedValue(sampleInstructors);

			await InstructorController.getInstructors(req, res);

			// Assert service was called with undefined (meaning get all)
			expect(InstructorService.getInstructors).toHaveBeenCalledWith(undefined);
			expect(res.status).not.toHaveBeenCalled(); // Implies 200 OK
			expect(res.json).toHaveBeenCalledWith(sampleInstructors);
		});

		// --- Test Case: COBIS Admin (with unused department property) - Success ---
		it('should call getInstructors with undefined department for COBIS Admin even if department is present', async () => {
			// If user is ONLY admin, the department property shouldn't be used
			req = mockAuthRequest(cobisAdminRole, testDepartment);
			vi.mocked(InstructorService.getInstructors).mockResolvedValue(sampleInstructors);

			await InstructorController.getInstructors(req, res);

			// Assert service was called with undefined because user is not dept chair
			expect(InstructorService.getInstructors).toHaveBeenCalledWith(undefined);
			expect(res.status).not.toHaveBeenCalled();
			expect(res.json).toHaveBeenCalledWith(sampleInstructors);
		});


		// --- Test Case: Server Error ---
		it('should return 500 if InstructorService.getInstructors throws an error (as Dept Chair)', async () => {
			req = mockAuthRequest(deptChairRole, testDepartment);
			const errorMessage = "Database connection failed";
			vi.mocked(InstructorService.getInstructors).mockRejectedValue(new Error(errorMessage));

			await InstructorController.getInstructors(req, res);

			expect(InstructorService.getInstructors).toHaveBeenCalledWith(testDepartment);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});

		it('should return 500 if InstructorService.getInstructors throws an error (as COBIS Admin)', async () => {
			req = mockAuthRequest(cobisAdminRole);
			const errorMessage = "Database connection failed";
			vi.mocked(InstructorService.getInstructors).mockRejectedValue(new Error(errorMessage));

			await InstructorController.getInstructors(req, res);

			expect(InstructorService.getInstructors).toHaveBeenCalledWith(undefined);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});

	}); // End describe('getInstructors')
}); // End describe('InstructorController')