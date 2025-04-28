// // instructor.checkInstructorAccess.test.ts
// import { describe, it, expect, vi, beforeEach, Mocked, Mock } from 'vitest';
// import { Request, Response, NextFunction } from 'express';
// import { InstructorController } from '../../../controllers/instructor-controller';
// import { AuthAndPermissionsRequest } from '../../../types/requests';

// // Keep track of the mock constructor and instance methods
// const mockCanAccessInstructor = vi.fn();
// vi.mock('../../../services/instructor-access-service', () => { // Adjust path
// 	// Mock the class constructor
// 	return {
// 		checkInstructorAccess: vi.fn().mockImplementation(() => {
// 			// Return an object mocking the instance methods
// 			return {
// 				canAccessInstructor: mockCanAccessInstructor,
// 			};
// 		}),
// 	};
// });

// // Mock Express objects
// let mockReq: Partial<AuthAndPermissionsRequest>;
// let mockRes: Partial<Response>;
// let mockNext: NextFunction;
// const mockInstructorMnumber = 'M98765432';
// const mockUser = { mnumber: 'M12345678', roles: [{ role_name: 'test_role', role_id: 1 }] }; // Example user

// beforeEach(() => {
// 	// Reset mocks before each test
// 	vi.clearAllMocks(); // Clears constructor mock and method mocks

// 	mockReq = {
// 		...mockUser, // Spread default user properties
// 		params: { mnumber: mockInstructorMnumber },
// 		// instructorAccessService will be added by the middleware if successful
// 	};
// 	mockRes = {
// 		status: vi.fn().mockReturnThis(),
// 		json: vi.fn(),
// 	};
// 	mockNext = vi.fn();

// 	// Reset the specific mock function state if needed (vi.clearAllMocks usually handles this)
// 	// mockCanAccessInstructor.mockClear();
// });

// describe('InstructorController.checkInstructorAccess Middleware', () => {
// 	it('should call next() and attach service if access is granted', async () => {
// 		mockCanAccessInstructor.mockResolvedValue(true); // Simulate service granting access

// 		await InstructorController.checkInstructorAccess(mockReq as Request, mockRes as Response, mockNext);

// 		// Check service was called correctly
// 		expect(checkInstructorAccess).toHaveBeenCalledTimes(1); // Constructor called
// 		expect(mockCanAccessInstructor).toHaveBeenCalledTimes(1);
// 		expect(mockCanAccessInstructor).toHaveBeenCalledWith(mockReq, mockInstructorMnumber); // Ensure user object and mnumber passed

// 		// Check middleware outcome
// 		expect(mockNext).toHaveBeenCalledTimes(1);
// 		expect(mockRes.status).not.toHaveBeenCalled();
// 		expect(mockRes.json).not.toHaveBeenCalled();

// 		// Check service instance was attached to request
// 		expect(mockReq.instructorAccessService).toBeInstanceOf(InstructorAccessService);
// 	});

// 	it('should return 403 if access is denied', async () => {
// 		mockCanAccessInstructor.mockResolvedValue(false); // Simulate service denying access

// 		await InstructorController.checkInstructorAccess(mockReq as Request, mockRes as Response, mockNext);

// 		// Check service was called
// 		expect(InstructorAccessService).toHaveBeenCalledTimes(1);
// 		expect(mockCanAccessInstructor).toHaveBeenCalledTimes(1);
// 		expect(mockCanAccessInstructor).toHaveBeenCalledWith(mockReq, mockInstructorMnumber);

// 		// Check middleware outcome
// 		expect(mockNext).not.toHaveBeenCalled();
// 		expect(mockRes.status).toHaveBeenCalledWith(403);
// 		expect(mockRes.json).toHaveBeenCalledWith({
// 			error: 'Access denied. Insufficient permissions to view this instructor data.'
// 		});
// 		// Ensure service instance was NOT attached
// 		expect(mockReq.instructorAccessService).toBeUndefined();
// 	});

// 	it('should return 500 if InstructorAccessService throws an error', async () => {
// 		const errorMessage = 'Database error';
// 		mockCanAccessInstructor.mockRejectedValue(new Error(errorMessage)); // Simulate service error

// 		await InstructorController.checkInstructorAccess(mockReq as Request, mockRes as Response, mockNext);

// 		// Check service was called
// 		expect(InstructorAccessService).toHaveBeenCalledTimes(1);
// 		expect(mockCanAccessInstructor).toHaveBeenCalledTimes(1);
// 		expect(mockCanAccessInstructor).toHaveBeenCalledWith(mockReq, mockInstructorMnumber);

// 		// Check middleware outcome
// 		expect(mockNext).not.toHaveBeenCalled();
// 		expect(mockRes.status).toHaveBeenCalledWith(500);
// 		expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error during access check' });
// 		// Ensure service instance was NOT attached
// 		expect(mockReq.instructorAccessService).toBeUndefined();
// 	});

// 	it('should handle missing mnumber in params gracefully (passed as undefined to service)', async () => {
// 		// Although usually routing prevents this, test robustness
// 		mockReq.params = {}; // No mnumber in params
// 		mockCanAccessInstructor.mockResolvedValue(false); // Assume denial if mnumber missing, for testing response

// 		await InstructorController.checkInstructorAccess(mockReq as Request, mockRes as Response, mockNext);

// 		// Check service was called with undefined mnumber
// 		expect(mockCanAccessInstructor).toHaveBeenCalledTimes(1);
// 		expect(mockCanAccessInstructor).toHaveBeenCalledWith(mockReq, undefined); // instructorMnumber is undefined

// 		// Check middleware outcome (still expects 403 based on service response)
// 		expect(mockNext).not.toHaveBeenCalled();
// 		expect(mockRes.status).toHaveBeenCalledWith(403); // Or potentially 500 if service errors on undefined
// 	});
// });