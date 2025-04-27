// src/tests/routes/instructor-class-roster.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { InstructorController } from '../../../controllers/instructor-controller';

// Mock the services
vi.mock('../../../services/instructor-service', () => ({
	InstructorsService: {
		getClassRoster: vi.fn(),
		instructorExists: vi.fn()
	}
}));

// Import the mocked service
import { InstructorsService } from '../../../services/instructor-service';

describe('Instructor Router - GET /api/instructor/:mnumber/class-roster', () => {
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
		app.get('/api/instructor/:mnumber/class-roster', async (req: Request, res: Response, next: NextFunction) => {
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
		}, InstructorController.getClassRoster);

		return mockAccessService; // Return the mock service for test configuration
	}

	beforeEach(() => {
		// Reset all mocks
		vi.resetAllMocks();
	});

	it('should return class roster when admin has access', async () => {
		// Setup app with admin user and get the mock service
		const mockAccessService = setupApp([{ role_name: 'cobis_administrator', role_id: 1 }]);

		// Mock class roster data
		const mockClassRoster = {
			course: {
				courseId: 'CSC101',
				courseSubject: 'CSC',
				courseNumber: '101',
				courseSuffix: '',
				courseTitle: 'Introduction to Programming',
				termCode: '80',
				termName: 'FALL',
				year: 2024,
				creditHours: 3
			},
			roster: [
				{
					mnumber: 'M23456789',
					name: 'Jane Smith',
					firstName: 'Jane',
					middleName: null,
					lastName: 'Smith',
					suffix: null,
					email: 'jane.smith@example.com',
					major: 'Computer Science',
					finalGrade: 'A',
					midtermGrade: 'B+',
					registrationStatus: 'Registered',
					instructionalMethod: 'In Person',
					lastAttendance: null,
					overallGpa: 3.75,
					overallEarnedHours: 45
				},
				{
					mnumber: 'M34567890',
					name: 'Bob Johnson',
					firstName: 'Bob',
					middleName: null,
					lastName: 'Johnson',
					suffix: null,
					email: 'bob.johnson@example.com',
					major: 'Mathematics',
					finalGrade: 'B',
					midtermGrade: 'B',
					registrationStatus: 'Registered',
					instructionalMethod: 'In Person',
					lastAttendance: null,
					overallGpa: 3.2,
					overallEarnedHours: 60
				}
			],
			stats: {
				totalStudents: 2,
				totalGraded: 2,
				overallGpa: 3.5,
				gradeDistribution: {
					'A': 1,
					'B': 1
				}
			}
		};

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.instructorExists as any).mockResolvedValue(true); // Add this line
		(InstructorsService.getClassRoster as any).mockResolvedValue(mockClassRoster);

		// Make the request with query parameters
		const response = await request(app).get('/api/instructor/M12345678/class-roster')
			.query({
				subject: 'CSC',
				number: '101',
				suffix: '',
				term: '80',
				year: '2024'
			});

		// Assertions
		expect(response.status).toBe(200);
		expect(response.body).toEqual({ mnumber: 'M12345678', classRoster: mockClassRoster });
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.instructorExists).toHaveBeenCalledWith('M12345678');
		expect(InstructorsService.getClassRoster).toHaveBeenCalledWith('M12345678', 'CSC', '101', '', '80', 2024);
	});

	it('should return class roster when department chair has access', async () => {
		// Setup app with department chair user
		const mockAccessService = setupApp([{ role_name: 'department_chair', role_id: 2 }], 'CSCI');

		// Mock class roster data
		const mockClassRoster = {
			course: {
				courseId: 'CSC101',
				courseSubject: 'CSC',
				courseNumber: '101',
				courseSuffix: '',
				courseTitle: 'Introduction to Programming',
				termCode: '80',
				termName: 'FALL',
				year: 2024,
				creditHours: 3
			},
			roster: [
				{
					mnumber: 'M23456789',
					name: 'Jane Smith',
					firstName: 'Jane',
					middleName: null,
					lastName: 'Smith',
					suffix: null,
					email: 'jane.smith@example.com',
					major: 'Computer Science',
					finalGrade: 'A',
					midtermGrade: 'B+',
					registrationStatus: 'Registered',
					instructionalMethod: 'In Person',
					lastAttendance: null,
					overallGpa: 3.75,
					overallEarnedHours: 45
				}
			],
			stats: {
				totalStudents: 1,
				totalGraded: 1,
				overallGpa: 4.0,
				gradeDistribution: {
					'A': 1
				}
			}
		};

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.instructorExists as any).mockResolvedValue(true); // Add this line
		(InstructorsService.getClassRoster as any).mockResolvedValue(mockClassRoster);

		// Make the request with query parameters
		const response = await request(app).get('/api/instructor/M12345678/class-roster')
			.query({
				subject: 'CSC',
				number: '101',
				term: '80',
				year: '2024'
			});

		// Assertions
		expect(response.status).toBe(200);
		expect(response.body).toEqual({ mnumber: 'M12345678', classRoster: mockClassRoster });
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.instructorExists).toHaveBeenCalledWith('M12345678');
		expect(InstructorsService.getClassRoster).toHaveBeenCalledWith('M12345678', 'CSC', '101', '', '80', 2024);
	});

	it('should return class roster when the instructor accesses their own data', async () => {
		// Setup app with the instructor accessing their own data
		const mockAccessService = setupApp([{ role_name: 'faculty', role_id: 3 }], undefined, 'M12345678');

		// Mock class roster data
		const mockClassRoster = {
			course: {
				courseId: 'CSC101',
				courseSubject: 'CSC',
				courseNumber: '101',
				courseSuffix: '',
				courseTitle: 'Introduction to Programming',
				termCode: '80',
				termName: 'FALL',
				year: 2024,
				creditHours: 3
			},
			roster: [
				{
					mnumber: 'M23456789',
					name: 'Jane Smith',
					firstName: 'Jane',
					middleName: null,
					lastName: 'Smith',
					suffix: null,
					email: 'jane.smith@example.com',
					major: 'Computer Science',
					finalGrade: 'A',
					midtermGrade: 'B+',
					registrationStatus: 'Registered',
					instructionalMethod: 'In Person',
					lastAttendance: null,
					overallGpa: 3.75,
					overallEarnedHours: 45
				}
			],
			stats: {
				totalStudents: 1,
				totalGraded: 1,
				overallGpa: 4.0,
				gradeDistribution: {
					'A': 1
				}
			}
		};

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.instructorExists as any).mockResolvedValue(true); // Add this line
		(InstructorsService.getClassRoster as any).mockResolvedValue(mockClassRoster);

		// Make the request with query parameters
		const response = await request(app).get('/api/instructor/M12345678/class-roster')
			.query({
				subject: 'CSC',
				number: '101',
				term: '80',
				year: '2024'
			});

		// Assertions
		expect(response.status).toBe(200);
		expect(response.body).toEqual({ mnumber: 'M12345678', classRoster: mockClassRoster });
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.instructorExists).toHaveBeenCalledWith('M12345678');
		expect(InstructorsService.getClassRoster).toHaveBeenCalledWith('M12345678', 'CSC', '101', '', '80', 2024);
	});

	it('should return 403 when user does not have access', async () => {
		// Setup app with regular faculty user trying to access another instructor's data
		const mockAccessService = setupApp([{ role_name: 'faculty', role_id: 3 }], undefined, 'M87654321');

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(false);

		// Make the request with query parameters
		const response = await request(app).get('/api/instructor/M12345678/class-roster')
			.query({
				subject: 'CSC',
				number: '101',
				term: '80',
				year: '2024'
			});

		// Assertions
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty('error');
		expect(response.body.error).toContain('Access denied');
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.getClassRoster).not.toHaveBeenCalled();
	});

	it('should return 404 when instructor not found', async () => {
		// Setup app with admin user
		const mockAccessService = setupApp([{ role_name: 'cobis_administrator', role_id: 1 }]);

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.instructorExists as any).mockResolvedValue(false);

		// Make the request with query parameters
		const response = await request(app).get('/api/instructor/M99999999/class-roster')
			.query({
				subject: 'CSC',
				number: '101',
				term: '80',
				year: '2024'
			});

		// Assertions
		expect(response.status).toBe(404);
		expect(response.body).toHaveProperty('error');
		expect(response.body.error).toContain('Instructor not found');
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.instructorExists).toHaveBeenCalledWith('M99999999');
		expect(InstructorsService.getClassRoster).not.toHaveBeenCalled();
	});

	it('should return 404 when class roster is not found', async () => {
		// Setup app with admin user
		const mockAccessService = setupApp([{ role_name: 'cobis_administrator', role_id: 1 }]);

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.instructorExists as any).mockResolvedValue(true);
		(InstructorsService.getClassRoster as any).mockResolvedValue(null);

		// Make the request with query parameters
		const response = await request(app).get('/api/instructor/M12345678/class-roster')
			.query({
				subject: 'CSC',
				number: '999',
				term: '80',
				year: '2024'
			});

		// Assertions
		expect(response.status).toBe(404);
		expect(response.body).toHaveProperty('error');
		expect(response.body.error).toContain('Class not found');
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.instructorExists).toHaveBeenCalledWith('M12345678');
		expect(InstructorsService.getClassRoster).toHaveBeenCalledWith('M12345678', 'CSC', '999', '', '80', 2024);
	});

	it('should return 400 when required parameters are missing', async () => {
		// Setup app with admin user
		const mockAccessService = setupApp([{ role_name: 'cobis_administrator', role_id: 1 }]);

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		// The instructorExists method isn't actually called in this scenario

		// Make the request with missing parameters (no number)
		const response = await request(app).get('/api/instructor/M12345678/class-roster')
			.query({
				subject: 'CSC',
				// number is missing
				term: '80',
				year: '2024'
			});

		// Assertions
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('error');
		expect(response.body.error).toContain('Missing required parameters');
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		// Don't check for instructorExists call since it's not actually called
		expect(InstructorsService.getClassRoster).not.toHaveBeenCalled();
	});

	it('should return 400 when year parameter is invalid', async () => {
		// Setup app with admin user
		const mockAccessService = setupApp([{ role_name: 'cobis_administrator', role_id: 1 }]);

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		// The instructorExists method isn't actually called in this scenario

		// Make the request with invalid year parameter
		const response = await request(app).get('/api/instructor/M12345678/class-roster')
			.query({
				subject: 'CSC',
				number: '101',
				term: '80',
				year: 'invalid' // Not a number
			});

		// Assertions
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('error');
		expect(response.body.error).toContain('Year must be a number');
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		// Don't check for instructorExists call since it's not actually called
		expect(InstructorsService.getClassRoster).not.toHaveBeenCalled();
	});

	it('should return 500 when service throws an error', async () => {
		// Setup app with admin user
		const mockAccessService = setupApp([{ role_name: 'cobis_administrator', role_id: 1 }]);

		// Setup the mocks
		mockAccessService.canAccessInstructor.mockResolvedValue(true);
		(InstructorsService.instructorExists as any).mockResolvedValue(true);
		(InstructorsService.getClassRoster as any).mockRejectedValue(new Error('Database error'));

		// Make the request with query parameters
		const response = await request(app).get('/api/instructor/M12345678/class-roster')
			.query({
				subject: 'CSC',
				number: '101',
				term: '80',
				year: '2024'
			});

		// Assertions
		expect(response.status).toBe(500);
		expect(response.body).toHaveProperty('error');
		expect(response.body.error).toContain('Internal server error');
		expect(mockAccessService.canAccessInstructor).toHaveBeenCalled();
		expect(InstructorsService.instructorExists).toHaveBeenCalledWith('M12345678');
		expect(InstructorsService.getClassRoster).toHaveBeenCalledWith('M12345678', 'CSC', '101', '', '80', 2024);
	});
});