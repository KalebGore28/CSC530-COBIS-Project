// checkAdvisorAccess.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { AdvisorController } from '../../../controllers/advisor-controller';
import { AuthAndPermissionsRequest } from '../../../types/requests';

// Mock Express objects
let mockReq: Partial<AuthAndPermissionsRequest>;
let mockRes: Partial<Response>;
let mockNext: NextFunction;

beforeEach(() => {
	// Reset mocks before each test
	mockReq = {
		// Basic structure, customize roles and mnumber per test
		roles: [],
		mnumber: 'M12345678'
	};
	mockRes = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn(),
	};
	mockNext = vi.fn();
});

describe('AdvisorController.checkAdvisorAccess Middleware', () => {
	it('should call next() if user has "advisor" role and mnumber', async () => {
		mockReq.roles = [{ role_name: 'advisor', role_id: 1 }];
		await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);
		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(mockRes.status).not.toHaveBeenCalled();
	});

	it('should call next() if user has "cobis_administrator" role and mnumber', async () => {
		mockReq.roles = [{ role_name: 'cobis_administrator', role_id: 2 }];
		await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);
		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(mockRes.status).not.toHaveBeenCalled();
	});

	it('should call next() if user has both roles and mnumber', async () => {
		mockReq.roles = [{ role_name: 'advisor', role_id: 1 }, { role_name: 'cobis_administrator', role_id: 2 }];
		await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);
		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(mockRes.status).not.toHaveBeenCalled();
	});

	it('should return 401 if user has "advisor" role but no mnumber', async () => {
		mockReq.roles = [{ role_name: 'advisor', role_id: 1 }];
		delete mockReq.mnumber; // Remove mnumber
		await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);
		expect(mockNext).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockRes.json).toHaveBeenCalledWith({ error: 'User identifier not found.' });
	});

	it('should return 401 if user has "cobis_administrator" role but no mnumber', async () => {
		mockReq.roles = [{ role_name: 'cobis_administrator', role_id: 2 }];
		delete mockReq.mnumber; // Remove mnumber
		await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);
		expect(mockNext).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockRes.json).toHaveBeenCalledWith({ error: 'User identifier not found.' });
	});

	it('should return 403 if user has insufficient roles', async () => {
		mockReq.roles = [{ role_name: 'student', role_id: 3 }]; // Different role
		await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);
		expect(mockNext).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(403);
		expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. Insufficient permissions.' });
	});

	it('should return 403 if user has no roles defined (undefined)', async () => {
		delete mockReq.roles; // Roles undefined
		await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);
		expect(mockNext).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(403);
		expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. Insufficient permissions.' });
	});

	it('should return 403 if user has no roles defined (null)', async () => {
		mockReq.roles = null as any; // Roles null
		await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);
		expect(mockNext).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(403);
		expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. Insufficient permissions.' });
	});

	it('should return 500 if an unexpected error occurs', async () => {
		// Simulate error by making roles access throw
		Object.defineProperty(mockReq, 'roles', {
			get: () => { throw new Error('Test error accessing roles'); }
		});
		await AdvisorController.checkAdvisorAccess(mockReq as Request, mockRes as Response, mockNext);
		expect(mockNext).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(500);
		expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error during permission check.' });
	});
});