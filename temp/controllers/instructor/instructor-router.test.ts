// src/tests/routes/instructor-router.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { InstructorController } from '../../../controllers/instructor-controller';

// Mock the InstructorsService
vi.mock('../../../services/instructor-service', () => ({
	InstructorsService: {
		getInstructors: vi.fn()
	}
}));

// Import the mocked service
import { InstructorsService } from '../../../services/instructor-service';

describe('Instructor Router - GET /api/instructors', () => {
	let app: express.Application;

	// Setup the basic Express app with mocked middleware
	function setupApp(userRoles: Array<{ role_name: string, role_id: number }>, userDept?: string) {
		app = express();
		app.use(express.json());

		// Mock authentication and permissions middleware
		app.use((req, res, next) => {
			(req as any).roles = userRoles;
			(req as any).department = userDept || null;
			next();
		});

		// Directly use the controller methods instead of the router
		app.get('/api/instructors', InstructorController.getInstructors);
	}

	beforeEach(() => {
		// Reset all mocks
		vi.resetAllMocks();
	});

	it('should return all instructors for admin users', async () => {
		// Setup app with admin user
		setupApp([{ role_name: 'cobis_administrator', role_id: 1 }]);

		// Mock instructors data
		const mockInstructors = [
			{
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
			},
			{
				mnumber: 'M87654321',
				name: 'Jane Smith',
				firstName: 'Jane',
				lastName: 'Smith',
				department: 'Mathematics',
				departmentCode: 'MATH',
				college: 'College of Science',
				collegeCode: 'COS',
				email: 'jane.smith@example.com',
				image: null
			}
		];

		// Setup the mock to return our test data
		(InstructorsService.getInstructors as any).mockResolvedValue(mockInstructors);

		// Make the request
		const response = await request(app).get('/api/instructors');

		// Assertions
		expect(response.status).toBe(200);
		expect(response.body).toEqual(mockInstructors);
		expect(InstructorsService.getInstructors).toHaveBeenCalledWith(undefined);
	});

	it('should return only department instructors for department chairs', async () => {
		// Setup app with department chair user
		setupApp([{ role_name: 'department_chair', role_id: 2 }], 'CSCI');

		// Mock instructors data for CSCI department
		const mockDepartmentInstructors = [
			{
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
			}
		];

		// Setup the mock to return our test data
		(InstructorsService.getInstructors as any).mockResolvedValue(mockDepartmentInstructors);

		// Make the request
		const response = await request(app).get('/api/instructors');

		// Assertions
		expect(response.status).toBe(200);
		expect(response.body).toEqual(mockDepartmentInstructors);
		expect(InstructorsService.getInstructors).toHaveBeenCalledWith('CSCI');
	});

	it('should return 403 for users without proper permissions', async () => {
		// Setup app with regular faculty user
		setupApp([{ role_name: 'faculty', role_id: 3 }]);

		// Make the request
		const response = await request(app).get('/api/instructors');

		// Assertions
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty('error');
		expect(InstructorsService.getInstructors).not.toHaveBeenCalled();
	});

	it('should return 400 when department chair has no associated department', async () => {
		// Setup app with department chair user but NO department
		setupApp([{ role_name: 'department_chair', role_id: 2 }]);

		// Setup the mock
		(InstructorsService.getInstructors as any).mockResolvedValue([]);

		// Make the request
		const response = await request(app).get('/api/instructors');

		// Assertions
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('error');
		expect(response.body.error).toContain('Department chair has no associated department');
		expect(InstructorsService.getInstructors).not.toHaveBeenCalled();
	});
});