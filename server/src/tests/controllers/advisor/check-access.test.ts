import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { AdvisorController } from '../../../controllers/advisor-controller';
import { InstructorService } from '../../../services/instructor-service';
import { AuthAndPermissionsRequest } from '../../../types/requests';

// Mock the InstructorService - Adjust the path as needed
vi.mock('../../../services/instructor-service', () => {
    const mockIsInstructorInDepartmentFn = vi.fn();
    return {
        InstructorService: {
            isInstructorInDepartment: mockIsInstructorInDepartmentFn,
        },
    };
});

// Mock Express objects
let mockReq: Partial<AuthAndPermissionsRequest>;
let mockRes: Partial<Response>;
let mockNext: NextFunction;

// Helper to create a base request object
const createMockReq = (params: any, authProps: Partial<AuthAndPermissionsRequest>): Partial<AuthAndPermissionsRequest> => ({
	params: params,
	roles: [], // Default empty roles
	...authProps, // Spread authenticated user properties
});


beforeEach(() => {
	// Reset mocks before each test
	vi.clearAllMocks();

	// Default request setup (can be overridden in tests)
	mockReq = createMockReq({ mnumber: 'M12345678' }, { mnumber: 'Mdifferent' });
	mockRes = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn(),
	};
	mockNext = vi.fn();
});

describe('AdvisorController.checkAdvisorAccess Middleware', () => {

	describe('Parameter Validation', () => {
		it('should return 400 if mnumber format is invalid', async () => {
			mockReq = createMockReq({ mnumber: 'invalid-mnumber' }, {});
			await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).not.toHaveBeenCalled();
			expect(InstructorService.isInstructorInDepartment).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
				error: 'Invalid M-number format.',
				details: expect.any(Object), // Zod error details
			}));
		});

		it('should return 400 if mnumber param is missing', async () => {
			mockReq = createMockReq({}, {}); // Missing mnumber in params
			await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).not.toHaveBeenCalled();
			expect(InstructorService.isInstructorInDepartment).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
				error: 'Invalid M-number format.',
			}));
		});
	});

	describe('Role-Based Access', () => {
		const targetMnumber = 'M11122233';

		it('should call next() for cobis_administrator', async () => {
			mockReq = createMockReq(
				{ mnumber: targetMnumber },
				{ roles: [{ role_name: 'cobis_administrator', role_id: 9 }] }
			);
			await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(InstructorService.isInstructorInDepartment).not.toHaveBeenCalled();
			expect(mockRes.status).not.toHaveBeenCalled();
		});

		// Test cases for self-access roles
		['faculty', 'advisor', 'program_coordinator', 'administrator'].forEach((role) => {
			it(`should call next() for ${role} accessing their own data`, async () => {
				mockReq = createMockReq(
					{ mnumber: targetMnumber },
					{ roles: [{ role_name: role, role_id: 1 }], mnumber: targetMnumber } // User mnumber matches target
				);
				await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);
				expect(mockNext).toHaveBeenCalledTimes(1);
				expect(InstructorService.isInstructorInDepartment).not.toHaveBeenCalled();
				expect(mockRes.status).not.toHaveBeenCalled();
			});

			it(`should return 403 for ${role} accessing different mnumber`, async () => {
				mockReq = createMockReq(
					{ mnumber: targetMnumber },
					{ roles: [{ role_name: role, role_id: 1 }], mnumber: 'Mdifferent' } // User mnumber differs
				);
				await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);
				expect(mockNext).not.toHaveBeenCalled();
				expect(InstructorService.isInstructorInDepartment).not.toHaveBeenCalled();
				expect(mockRes.status).toHaveBeenCalledWith(403);
				expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. Insufficient permissions to view this advisor data.' });
			});

			it(`should return 403 for ${role} if authReq.mnumber is missing`, async () => {
				mockReq = createMockReq(
					{ mnumber: targetMnumber },
					{ roles: [{ role_name: role, role_id: 1 }], mnumber: undefined } // Missing user mnumber
				);
				await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);
				expect(mockNext).not.toHaveBeenCalled();
				expect(InstructorService.isInstructorInDepartment).not.toHaveBeenCalled();
				expect(mockRes.status).toHaveBeenCalledWith(403);
				expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. Insufficient permissions to view this advisor data.' });
			});
		});

		// Test cases for department_chair
		describe('Department Chair Access', () => {
			const chairDept = 'Computer Science';

			it('should call next() if user is dept_chair and advisor is in their department', async () => {
				mockReq = createMockReq(
					{ mnumber: targetMnumber },
					{ roles: [{ role_name: 'department_chair', role_id: 5 }], department: chairDept }
				);
				(InstructorService.isInstructorInDepartment as Mock).mockResolvedValue(true); // Service confirms advisor is in dept

				await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);

				expect(InstructorService.isInstructorInDepartment).toHaveBeenCalledTimes(1);
				expect(InstructorService.isInstructorInDepartment).toHaveBeenCalledWith(targetMnumber, chairDept);
				expect(mockNext).toHaveBeenCalledTimes(1);
				expect(mockRes.status).not.toHaveBeenCalled();
			});

			it('should return 403 if user is dept_chair and advisor is NOT in their department', async () => {
				mockReq = createMockReq(
					{ mnumber: targetMnumber },
					{ roles: [{ role_name: 'department_chair', role_id: 5 }], department: chairDept }
				);
				(InstructorService.isInstructorInDepartment as Mock).mockResolvedValue(false); // Service confirms advisor is NOT in dept

				await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);

				expect(InstructorService.isInstructorInDepartment).toHaveBeenCalledTimes(1);
				expect(InstructorService.isInstructorInDepartment).toHaveBeenCalledWith(targetMnumber, chairDept);
				expect(mockNext).not.toHaveBeenCalled();
				expect(mockRes.status).toHaveBeenCalledWith(403);
				expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. Insufficient permissions to view this advisor data.' });
			});

			it('should return 403 if user is dept_chair but authReq.department is missing', async () => {
				mockReq = createMockReq(
					{ mnumber: targetMnumber },
					{ roles: [{ role_name: 'department_chair', role_id: 5 }], department: undefined } // Missing department
				);

				await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);

				expect(InstructorService.isInstructorInDepartment).not.toHaveBeenCalled(); // Service not called
				expect(mockNext).not.toHaveBeenCalled();
				expect(mockRes.status).toHaveBeenCalledWith(403);
				expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. Insufficient permissions to view this advisor data.' });
			});

			// Note: Testing service errors requires adding try/catch in the controller or using expect(...).rejects
			// For now, we assume standard Express error handling would take over if the service call failed.
		});

		it('should return 403 for users with other roles (e.g., student)', async () => {
			mockReq = createMockReq(
				{ mnumber: targetMnumber },
				{ roles: [{ role_name: 'student', role_id: 10 }], mnumber: 'Mstudent' }
			);
			await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
			expect(InstructorService.isInstructorInDepartment).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. Insufficient permissions to view this advisor data.' });
		});
	});
});