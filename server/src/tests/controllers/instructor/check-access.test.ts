// instructor.controller.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { InstructorController } from '../../../controllers/instructor-controller';
import { InstructorService } from '../../../services/instructor-service';
import { AuthAndPermissionsRequest } from '../../../types/requests';

// --- Mocking ---

// Mock the InstructorService entirely or specific methods
vi.mock('../../../services/instructor-service', () => ({
	InstructorService: {
		// Mock the static method isInstructorInDepartment
		isInstructorInDepartment: vi.fn(),
	}
}));

// Helper to create a mock Response object
const mockResponse = () => {
	const res = {} as Partial<Response>; // Use Partial<Response> for easier mocking
	// Chainable status function
	res.status = vi.fn().mockReturnThis();
	// Mock json function
	res.json = vi.fn().mockReturnThis();
	return res as Response;
};

// Helper to create a mock Request object
const mockRequest = (
	params: Record<string, string> = {},
	roles: { role_name: string; role_id: number }[] = [],
	mnumber?: string,
	department?: string
): AuthAndPermissionsRequest => {
	const req = {
		params,
		roles,
		mnumber,
		department,
	} as Partial<AuthAndPermissionsRequest>; // Use Partial for easier mocking
	return req as AuthAndPermissionsRequest;
};

// Mock NextFunction
const mockNext: NextFunction = vi.fn();

// --- Test Suite ---

describe('InstructorController', () => {
	let req: AuthAndPermissionsRequest;
	let res: Response;
	let next: NextFunction;

	// Reset mocks before each test
	beforeEach(() => {
		res = mockResponse();
		next = mockNext;
		// Reset mocks including call counts
		vi.clearAllMocks();
	});

	describe('checkInstructorAccess Middleware', () => {

		// --- Test Case: Invalid M-number ---
		it('should return 400 if mnumber in params is invalid', async () => {
			req = mockRequest({ mnumber: 'invalid-mnumber' }); // Invalid format
			await InstructorController.checkInstructorAccess(req, res, next);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
				error: 'Invalid M-number format.'
			}));
			expect(next).not.toHaveBeenCalled();
		});

		it('should return 400 if mnumber in params is missing', async () => {
			req = mockRequest({}); // Missing mnumber
			// Manually trigger zod parse error for missing field scenario
			// Note: Zod's safeParse will handle this, we just need to ensure the structure leads to failure
			await InstructorController.checkInstructorAccess(req, res, next);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
				error: 'Invalid M-number format.'
			}));
			expect(next).not.toHaveBeenCalled();
		});


		// --- Test Case: COBIS Administrator Access ---
		it('should call next() if user has cobis_administrator role', async () => {
			const roles = [{ role_name: 'cobis_administrator', role_id: 1 }];
			req = mockRequest({ mnumber: 'm12345' }, roles, 'm99999'); // Requesting m12345, user is m99999

			await InstructorController.checkInstructorAccess(req, res, next);

			expect(next).toHaveBeenCalledTimes(1);
			expect(res.status).not.toHaveBeenCalled();
			expect(res.json).not.toHaveBeenCalled();
		});

		// --- Test Cases: Self-Access (Faculty, Advisor, etc.) ---
		const selfAccessRoles = ['faculty', 'advisor', 'program_coordinator', 'administrator'];
		selfAccessRoles.forEach(roleName => {
			it(`should call next() if user has ${roleName} role and requests their own mnumber`, async () => {
				const userMnumber = 'm12345';
				const roles = [{ role_name: roleName, role_id: 2 }];
				req = mockRequest({ mnumber: userMnumber }, roles, userMnumber); // Requesting own mnumber

				await InstructorController.checkInstructorAccess(req, res, next);

				expect(next).toHaveBeenCalledTimes(1);
				expect(res.status).not.toHaveBeenCalled();
				expect(res.json).not.toHaveBeenCalled();
			});

			it(`should return 403 if user has ${roleName} role but requests a different mnumber`, async () => {
				const userMnumber = 'm12345';
				const requestedMnumber = 'm67890';
				const roles = [{ role_name: roleName, role_id: 2 }];
				req = mockRequest({ mnumber: requestedMnumber }, roles, userMnumber); // Requesting different mnumber

				await InstructorController.checkInstructorAccess(req, res, next);

				expect(res.status).toHaveBeenCalledWith(403);
				expect(res.json).toHaveBeenCalledWith({
					error: 'Access denied. Insufficient permissions to view this advisor data.',
				});
				expect(next).not.toHaveBeenCalled();
			});
		});

		// --- Test Case: Administrator without mnumber trying self-access (should fail) ---
		it('should return 403 if user has administrator role but authReq.mnumber is missing', async () => {
			const requestedMnumber = 'm12345';
			const roles = [{ role_name: 'administrator', role_id: 5 }];
			// Simulate user mnumber not being present on the request
			req = mockRequest({ mnumber: requestedMnumber }, roles, undefined);

			await InstructorController.checkInstructorAccess(req, res, next);

			// Since they don't have cobis_admin and can't match their own mnumber,
			// and aren't dept chair, it should fall through to forbidden.
			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Access denied. Insufficient permissions to view this advisor data.',
			});
			expect(next).not.toHaveBeenCalled();
		});


		// --- Test Cases: Department Chair Access ---
		it('should call next() if user is dept_chair and instructor is in their department', async () => {
			const requestedMnumber = 'm67890';
			const chairDepartment = 'Computer Science';
			const roles = [{ role_name: 'department_chair', role_id: 3 }];
			req = mockRequest({ mnumber: requestedMnumber }, roles, 'm11111', chairDepartment);

			// Mock the service call to return true
			vi.mocked(InstructorService.isInstructorInDepartment).mockResolvedValueOnce(true);

			await InstructorController.checkInstructorAccess(req, res, next);

			expect(InstructorService.isInstructorInDepartment).toHaveBeenCalledWith(requestedMnumber, chairDepartment);
			expect(next).toHaveBeenCalledTimes(1);
			expect(res.status).not.toHaveBeenCalled();
			expect(res.json).not.toHaveBeenCalled();
		});

		it('should return 403 if user is dept_chair and instructor is NOT in their department', async () => {
			const requestedMnumber = 'm67890';
			const chairDepartment = 'Computer Science';
			const roles = [{ role_name: 'department_chair', role_id: 3 }];
			req = mockRequest({ mnumber: requestedMnumber }, roles, 'm11111', chairDepartment);

			// Mock the service call to return false
			vi.mocked(InstructorService.isInstructorInDepartment).mockResolvedValueOnce(false);

			await InstructorController.checkInstructorAccess(req, res, next);

			expect(InstructorService.isInstructorInDepartment).toHaveBeenCalledWith(requestedMnumber, chairDepartment);
			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Access denied. Insufficient permissions to view this advisor data.',
			});
			expect(next).not.toHaveBeenCalled();
		});

		it('should return 403 if user is dept_chair but authReq.department is missing', async () => {
			const requestedMnumber = 'm67890';
			const roles = [{ role_name: 'department_chair', role_id: 3 }];
			// No department provided on the request object
			req = mockRequest({ mnumber: requestedMnumber }, roles, 'm11111', undefined);

			await InstructorController.checkInstructorAccess(req, res, next);

			// Service call should not be made if department is missing
			expect(InstructorService.isInstructorInDepartment).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Access denied. Insufficient permissions to view this advisor data.',
			});
			expect(next).not.toHaveBeenCalled();
		});

		// --- Test Case: Insufficient Permissions ---
		it('should return 403 if user has no relevant roles granting access', async () => {
			const requestedMnumber = 'm67890';
			// Example: a user with only a 'student' role (or no roles)
			const roles = [{ role_name: 'student', role_id: 10 }];
			req = mockRequest({ mnumber: requestedMnumber }, roles, 'm55555');

			await InstructorController.checkInstructorAccess(req, res, next);

			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Access denied. Insufficient permissions to view this advisor data.',
			});
			expect(next).not.toHaveBeenCalled();
			expect(InstructorService.isInstructorInDepartment).not.toHaveBeenCalled();
		});
	});
});