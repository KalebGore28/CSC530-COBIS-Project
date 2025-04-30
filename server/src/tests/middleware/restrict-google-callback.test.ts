// restrictGoogleCallback.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { restrictGoogleCallback } from '../../middleware/restrict-google-callback';

// Mock Express objects
let mockReq: Partial<Request>;
let mockRes: Partial<Response>;
let mockNext: NextFunction;

// Reset mocks before each test
beforeEach(() => {
    mockReq = {
        query: {}, // Default query object
    };
    mockRes = {
        status: vi.fn().mockReturnThis(), // Chainable status
        json: vi.fn(),
    };
    mockNext = vi.fn(); // Spy for next() calls
});

describe('restrict-google-callback Middleware', () => {
    it('should call next() if hd query parameter matches an allowed domain', () => {
        mockReq.query = { hd: 'murraystate.edu' };
        restrictGoogleCallback(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 403 if hd query parameter is not in the allowed domains', () => {
        mockReq.query = { hd: 'gmail.com' };
        restrictGoogleCallback(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access restricted to specific domains' });
    });

    it('should return 403 if hd query parameter is missing', () => {
        mockReq.query = {}; // No hd parameter
        restrictGoogleCallback(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access restricted to specific domains' });
    });

    it('should return 403 if hd query parameter is present but undefined', () => {
        // Simulates cases like ?param=value&hd
        mockReq.query = { hd: undefined };
        restrictGoogleCallback(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access restricted to specific domains' });
    });

    it('should return 403 if hd query parameter is present but not a string (e.g., array)', () => {
        // Simulates cases like ?hd=domain1&hd=domain2
        mockReq.query = { hd: ['murraystate.edu', 'other.com'] as any };
        restrictGoogleCallback(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access restricted to specific domains' });
    });

     it('should return 403 if hd query parameter is an empty string', () => {
        mockReq.query = { hd: '' };
        restrictGoogleCallback(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access restricted to specific domains' });
    });
});