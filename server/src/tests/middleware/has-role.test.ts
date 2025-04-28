// hasRole.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { hasRole } from '../../middleware/has-role';
import { AuthAndPermissionsRequest } from '../../types/requests';

// Mock Express objects
let mockReq: Partial<AuthAndPermissionsRequest>;
let mockRes: Partial<Response>;
let mockNext: NextFunction;

// Reset mocks before each test
beforeEach(() => {
	mockReq = {
		// Default roles for most tests, override as needed
		roles: [{
			role_name: 'user',
			role_id: 1
		}, {
			role_name: 'viewer',
			role_id: 2
		}]
	};
	mockRes = {
		status: vi.fn().mockReturnThis(), // Chainable status
		json: vi.fn(),
	};
	mockNext = vi.fn(); // Spy for next() calls
});

describe('hasRole Middleware', () => {

	describe('Middleware Creation Validation', () => {
		it('should throw error if role_name is not a string or array', () => {
			expect(() => hasRole(123 as any)).toThrow('role_name must be a string or an array of strings');
			expect(() => hasRole({} as any)).toThrow('role_name must be a string or an array of strings');
		});

		it('should throw error if role_name array contains non-strings', () => {
			expect(() => hasRole(['admin', 123] as any)).toThrow('role_name array must contain only strings');
		});

		it('should NOT throw error for valid string or string array', () => {
			expect(() => hasRole('admin')).not.toThrow();
			expect(() => hasRole(['admin', 'editor'])).not.toThrow();
		});
	});

	describe('Single Role Check', () => {
		it('should call next() if user has the required role', () => {
			const middleware = hasRole('user');
			middleware(mockReq as Request, mockRes as Response, mockNext);
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockRes.status).not.toHaveBeenCalled();
			expect(mockRes.json).not.toHaveBeenCalled();
		});

		it('should return 403 if user does not have the required role', () => {
			const middleware = hasRole('admin');
			middleware(mockReq as Request, mockRes as Response, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ error: "Forbidden: User does not have the required role" });
		});
	});

	describe('Multiple Roles Check (Array)', () => {
		it('should call next() if user has at least one of the required roles', () => {
			const middleware = hasRole(['admin', 'viewer']); // User has 'viewer'
			middleware(mockReq as Request, mockRes as Response, mockNext);
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockRes.status).not.toHaveBeenCalled();
			expect(mockRes.json).not.toHaveBeenCalled();
		});

		it('should call next() if user has multiple matching roles from the array', () => {
			mockReq.roles = [{
				role_name: 'editor',
				role_id: 0
			}, {
				role_name: 'publisher',
				role_id: 0
			}];
			const middleware = hasRole(['admin', 'editor', 'publisher']);
			middleware(mockReq as Request, mockRes as Response, mockNext);
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockRes.status).not.toHaveBeenCalled();
			expect(mockRes.json).not.toHaveBeenCalled();
		});


		it('should return 403 if user has none of the required roles in the array', () => {
			const middleware = hasRole(['admin', 'editor']); // User has 'user', 'viewer'
			middleware(mockReq as Request, mockRes as Response, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ error: "Forbidden: User does not have the required role" });
		});
	});

	describe('Handling Missing or Invalid User Roles', () => {
		it('should return 403 if req.roles is undefined', () => {
			delete mockReq.roles; // Make roles undefined
			const middleware = hasRole('user');
			middleware(mockReq as Request, mockRes as Response, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ error: "Forbidden: User roles are not defined" });
		});

		it('should return 403 if req.roles is null', () => {
			mockReq.roles = null as any; // Set roles to null
			const middleware = hasRole('user');
			middleware(mockReq as Request, mockRes as Response, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ error: "Forbidden: User roles are not defined" });
		});

		it('should return 403 if req.roles is not an array', () => {
			mockReq.roles = { role_name: 'user' } as any; // Set roles to an object, not array
			const middleware = hasRole('user');
			middleware(mockReq as Request, mockRes as Response, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ error: "Forbidden: User roles are not defined" });
		});

		it('should return 403 if req.roles is an empty array and role is required', () => {
			mockReq.roles = []; // Empty roles array
			const middleware = hasRole('user');
			middleware(mockReq as Request, mockRes as Response, mockNext);
			expect(mockNext).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({ error: "Forbidden: User does not have the required role" });
		});
	});
});