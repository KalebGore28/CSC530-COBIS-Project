// src/tests/routes/instructor-terms.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { InstructorController } from '../../../controllers/instructor-controller';

// Mock the services
vi.mock('../../../services/instructor-service', () => ({
	InstructorsService: {
		getTermSummaries: vi.fn(),
		instructorExists: vi.fn()
	}
}));

// Import the mocked service
import { InstructorsService } from '../../../services/instructor-service';

describe('Instructor Router - GET /api/instructor/:mnumber/terms', () => {
	let app: express.Application;

	// Setup the basic Express app with mocked middleware
	function setupApp(userRoles: Array<{ role_name: string, role_id: number }>, userDept?: string, userMnumber?: string) {
		app = express();
		app.use(express.json());

		// Create a mock access service with canAccessInstructor method
		const mockAccessService = {
			canAccessInstructor: vi.fn()
		};

		// Mock authentication and permissions middleware
		app.use((req: Request, res: Response, next: NextFunction) => {
			(req as any).roles = userRoles;
			(req as any).department = userDept || null;
			(req as any).mnumber = userMnumber || null;
			(req as any).accessService = mockAccessService; // Attach mock service to req
			next();
		});

		// Setup the route with simulated check access middleware and controller
		app.get('/api/instructor/:mnumber/terms', async (req: Request, res: Response, next: NextFunction) => {
			try {
				// Simulate checkInstructorAccess middleware
				const canAccess = await (req as any).accessService.canAccessInstructor(req, req.params.mnumber);
				if (!canAccess) {
					res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
					return;
				}
				next();
			} catch (error) {
				res.status(500).json({ error: 'Internal server error during access check' });
			}
		}, InstructorController.getTermSummaries);

		return mockAccessService; // Return the mock service for test configuration
	}

	beforeEach(() => {
		// Reset all mocks
		vi.resetAllMocks();
	});

	it('should return term summaries when admin has access', async () => {
		// Setup app with admin user and get the mock service
		const mockAccessService = setupApp([{ role_name: 'cobis_administrator', role_id: 1 }]);

		// Mock term summaries data
		const mockTermSummaries = [
			{
				termCode: '80',
				termName: 'FALL',
				year: 2024,
				courseCount: 3,
				studentCount: 75,
				creditHoursDelivered: 225
			},
			{
				termCode: '10',
				termName: 'SPRING',
				year: 2024,
				courseCount: 2,
				studentCount: 60,
				creditHoursDelivered: 180
			},
			{
				termCode: '80',
				termName: 'FALL',
				year: 2023,
				courseCount: 3,
				studentCount: 90,
				creditHoursDelivered: 270
			}
		];

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.instructorExists as any).mockResolvedValue(true);
		(InstructorsService.getTermSummaries as any).mockResolvedValue(mockTermSummaries);

		// Make the request
		const response = await request(app).get('/api/instructor/M12345678/terms');

		// Assertions
		expect(response.status).toBe(200);
		expect(response.body).toEqual({ mnumber: 'M12345678', termSummaries: mockTermSummaries });
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.instructorExists).toHaveBeenCalledWith('M12345678');
		expect(InstructorsService.getTermSummaries).toHaveBeenCalledWith('M12345678');
	});

	it('should return term summaries when department chair has access', async () => {
		// Setup app with department chair user
		const mockAccessService = setupApp([{ role_name: 'department_chair', role_id: 2 }], 'CSCI');

		// Mock term summaries data
		const mockTermSummaries = [
			{
				termCode: '80',
				termName: 'FALL',
				year: 2024,
				courseCount: 3,
				studentCount: 75,
				creditHoursDelivered: 225
			}
		];

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.instructorExists as any).mockResolvedValue(true);
		(InstructorsService.getTermSummaries as any).mockResolvedValue(mockTermSummaries);

		// Make the request
		const response = await request(app).get('/api/instructor/M12345678/terms');

		// Assertions
		expect(response.status).toBe(200);
		expect(response.body).toEqual({ mnumber: 'M12345678', termSummaries: mockTermSummaries });
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.instructorExists).toHaveBeenCalledWith('M12345678');
		expect(InstructorsService.getTermSummaries).toHaveBeenCalledWith('M12345678');
	});

	it('should return term summaries when the instructor accesses their own data', async () => {
		// Setup app with the instructor accessing their own data
		const mockAccessService = setupApp([{ role_name: 'faculty', role_id: 3 }], undefined, 'M12345678');

		// Mock term summaries data
		const mockTermSummaries = [
			{
				termCode: '80',
				termName: 'FALL',
				year: 2024,
				courseCount: 3,
				studentCount: 75,
				creditHoursDelivered: 225
			}
		];

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.instructorExists as any).mockResolvedValue(true);
		(InstructorsService.getTermSummaries as any).mockResolvedValue(mockTermSummaries);

		// Make the request
		const response = await request(app).get('/api/instructor/M12345678/terms');

		// Assertions
		expect(response.status).toBe(200);
		expect(response.body).toEqual({ mnumber: 'M12345678', termSummaries: mockTermSummaries });
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.instructorExists).toHaveBeenCalledWith('M12345678');
		expect(InstructorsService.getTermSummaries).toHaveBeenCalledWith('M12345678');
	});

	it('should return 403 when user does not have access', async () => {
		// Setup app with regular faculty user trying to access another instructor's data
		const mockAccessService = setupApp([{ role_name: 'faculty', role_id: 3 }], undefined, 'M87654321');

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(false);

		// Make the request
		const response = await request(app).get('/api/instructor/M12345678/terms');

		// Assertions
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty('error');
		expect(response.body.error).toContain('Access denied');
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.instructorExists).not.toHaveBeenCalled();
		expect(InstructorsService.getTermSummaries).not.toHaveBeenCalled();
	});

	it('should return 404 when instructor does not exist', async () => {
		// Setup app with admin user
		const mockAccessService = setupApp([{ role_name: 'cobis_administrator', role_id: 1 }]);

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.instructorExists as any).mockResolvedValue(false);

		// Make the request
		const response = await request(app).get('/api/instructor/M99999999/terms');

		// Assertions
		expect(response.status).toBe(404);
		expect(response.body).toHaveProperty('error');
		expect(response.body.error).toContain('Instructor not found');
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.instructorExists).toHaveBeenCalledWith('M99999999');
		expect(InstructorsService.getTermSummaries).not.toHaveBeenCalled();
	});

	it('should return empty array when instructor has no term data', async () => {
		// Setup app with admin user
		const mockAccessService = setupApp([{ role_name: 'cobis_administrator', role_id: 1 }]);

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.instructorExists as any).mockResolvedValue(true);
		(InstructorsService.getTermSummaries as any).mockResolvedValue([]);

		// Make the request
		const response = await request(app).get('/api/instructor/M12345678/terms');

		// Assertions
		expect(response.status).toBe(200);
		expect(response.body).toEqual({ mnumber: 'M12345678', termSummaries: [] });
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.instructorExists).toHaveBeenCalledWith('M12345678');
		expect(InstructorsService.getTermSummaries).toHaveBeenCalledWith('M12345678');
	});

	it('should return 500 when service throws an error', async () => {
		// Setup app with admin user
		const mockAccessService = setupApp([{ role_name: 'cobis_administrator', role_id: 1 }]);

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.instructorExists as any).mockResolvedValue(true);
		(InstructorsService.getTermSummaries as any).mockRejectedValue(new Error('Database error'));

		// Make the request
		const response = await request(app).get('/api/instructor/M12345678/terms');

		// Assertions
		expect(response.status).toBe(500);
		expect(response.body).toHaveProperty('error');
		expect(response.body.error).toContain('Internal server error');
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.instructorExists).toHaveBeenCalledWith('M12345678');
		expect(InstructorsService.getTermSummaries).toHaveBeenCalledWith('M12345678');
	});
});