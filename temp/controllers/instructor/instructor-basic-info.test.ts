// src/tests/routes/instructor-basic-info.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { InstructorController } from '../../../controllers/instructor-controller';

// Mock the services
vi.mock('../../../services/instructor-service', () => ({
	InstructorsService: {
		getBasicInfo: vi.fn(),
		instructorExists: vi.fn()
	}
}));

// Import the mocked services
import { InstructorsService } from '../../../services/instructor-service';

describe('Instructor Router - GET /api/instructor/:mnumber', () => {
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
		app.use((req, res, next) => {
			(req as any).roles = userRoles;
			(req as any).department = userDept || null;
			(req as any).mnumber = userMnumber || null;
			(req as any).accessService = mockAccessService; // Attach mock service to req
			next();
		});

		// Setup the route with simulated check access middleware and controller
		app.get('/api/instructor/:mnumber', async (req: Request, res: Response, next: NextFunction) => {
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
		}, InstructorController.getBasicInfo);

		return mockAccessService; // Return the mock service for test configuration
	}

	beforeEach(() => {
		// Reset all mocks
		vi.resetAllMocks();
	});

	it('should return instructor details when admin has access', async () => {
		// Setup app with admin user and get the mock service
		const mockAccessService = setupApp([{ role_name: 'cobis_administrator', role_id: 1 }]);

		// Mock instructor data
		const mockInstructor = {
			mnumber: 'M12345678',
			name: 'John Doe',
			firstName: 'John',
			lastName: 'Doe',
			department: 'Computer Science',
			departmentCode: 'CSCI',
			college: 'College of Science',
			collegeCode: 'COS',
			email: 'john.doe@example.com',
			image: null
		};

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.getBasicInfo as any).mockResolvedValue(mockInstructor);

		// Make the request
		const response = await request(app).get('/api/instructor/M12345678');

		// Assertions
		expect(response.status).toBe(200);
		expect(response.body).toEqual({ mnumber: 'M12345678', instructorInfo: mockInstructor });
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.getBasicInfo).toHaveBeenCalledWith('M12345678');
	});

	it('should return instructor details when department chair has access', async () => {
		// Setup app with department chair user
		const mockAccessService = setupApp([{ role_name: 'department_chair', role_id: 2 }], 'CSCI');

		// Mock instructor data
		const mockInstructor = {
			mnumber: 'M12345678',
			name: 'John Doe',
			firstName: 'John',
			lastName: 'Doe',
			department: 'Computer Science',
			departmentCode: 'CSCI',
			college: 'College of Science',
			collegeCode: 'COS',
			email: 'john.doe@example.com',
			image: null
		};

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.getBasicInfo as any).mockResolvedValue(mockInstructor);

		// Make the request
		const response = await request(app).get('/api/instructor/M12345678');

		// Assertions
		expect(response.status).toBe(200);
		expect(response.body).toEqual({ mnumber: 'M12345678', instructorInfo: mockInstructor });
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.getBasicInfo).toHaveBeenCalledWith('M12345678');
	});

	it('should return 403 when user does not have access', async () => {
		// Setup app with regular faculty user
		const mockAccessService = setupApp([{ role_name: 'faculty', role_id: 3 }]);

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(false);

		// Make the request
		const response = await request(app).get('/api/instructor/M12345678');

		// Assertions
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty('error');
		expect(response.body.error).toContain('Access denied');
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.getBasicInfo).not.toHaveBeenCalled();
	});

	it('should return 404 when instructor does not exist', async () => {
		// Setup app with admin user
		const mockAccessService = setupApp([{ role_name: 'cobis_administrator', role_id: 1 }]);

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.getBasicInfo as any).mockResolvedValue(null);

		// Make the request
		const response = await request(app).get('/api/instructor/M99999999');

		// Assertions
		expect(response.status).toBe(404);
		expect(response.body).toHaveProperty('error');
		expect(response.body.error).toContain('Instructor not found');
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.getBasicInfo).toHaveBeenCalledWith('M99999999');
	});

	it('should return 500 when service throws an error', async () => {
		// Setup app with admin user
		const mockAccessService = setupApp([{ role_name: 'cobis_administrator', role_id: 1 }]);

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.getBasicInfo as any).mockRejectedValue(new Error('Database error'));

		// Make the request
		const response = await request(app).get('/api/instructor/M12345678');

		// Assertions
		expect(response.status).toBe(500);
		expect(response.body).toHaveProperty('error');
		expect(response.body.error).toContain('Internal server error');
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.getBasicInfo).toHaveBeenCalledWith('M12345678');
	});
});