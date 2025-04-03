import express from 'express';
import { z } from 'zod';
import 'zod-openapi/extend';
import { StudentController } from '../controllers/student-controller';

/**
 * Student routes
 * @module routes/student-router
 * @requires express
 * @requires zod
 * @requires zod-openapi/extend
 * @requires ../controllers/student-controller
 * @description This module defines the routes for student-related operations.
 */
const router = express.Router();

// Get students
router.get('/',
	StudentController.checkAccess,
	StudentController.getStudents
)

// Basic student information
router.get('/:mnumber',
	StudentController.checkAccess,
	StudentController.getStudent
)

// Current enrollment status
router.get('/:mnumber/enrollment-status',
	// StudentController.checkAccess,
	// StudentController.getEnrollmentStatus
);

// Academic summary (GPA, credits earned, etc.)
router.get('/:mnumber/academic-summary',
	// StudentController.checkAccess,
	// StudentController.getAcademicSummary
);

// Advisor information
router.get('/:mnumber/advisors',
	// StudentController.checkAccess,
	// StudentController.getAdvisors
);

// Get student's GPA trend over terms
router.get('/:mnumber/gpa-trend',
	// StudentController.checkAccess,
	// StudentController.getGpaTrend
);

// Get academic performance metrics
router.get('/performance-metrics',
	// StudentController.checkAccess,
	// StudentController.getPerformanceMetrics
);

// Define OpenAPI schema for documentation
export const studentRouterSpec = {
	'/api/students': {
		get: {
			tags: ['Students'],
			operationId: 'getStudents',
			description: 'Get a list of students with pagination and filtering',
			parameters: [
				{
					name: 'department',
					in: 'query',
					required: false,
					schema: z.string().optional(),
					description: 'Filter by department code'
				},
				{
					name: 'program',
					in: 'query',
					required: false,
					schema: z.string().optional(),
					description: 'Filter by program code'
				},
				{
					name: 'term',
					in: 'query',
					required: false,
					schema: z.string().optional(),
					description: 'Filter by term code'
				},
				{
					name: 'year',
					in: 'query',
					required: false,
					schema: z.number().optional(),
					description: 'Filter by academic year'
				},
				{
					name: 'search',
					in: 'query',
					required: false,
					schema: z.string().optional(),
					description: 'Search by name, M-number, or email'
				},
				{
					name: 'page',
					in: 'query',
					required: false,
					schema: z.number().default(1),
					description: 'Page number for pagination'
				},
				{
					name: 'limit',
					in: 'query',
					required: false,
					schema: z.number().default(20),
					description: 'Number of items per page'
				}
			],
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								students: z.array(z.object({
									mnumber: z.string(),
									name: z.string(),
									firstName: z.string(),
									lastName: z.string(),
									email: z.string().optional(),
									overallGpa: z.number().nullable(),
									academicStanding: z.string().nullable(),
									academicStandingDescription: z.string().nullable(),
									earnedHours: z.number().nullable(),
									primaryProgram: z.object({
										code: z.string(),
										description: z.string(),
										department: z.string(),
										departmentCode: z.string(),
										type: z.string()
									}).nullable()
								})),
								pagination: z.object({
									page: z.number(),
									limit: z.number(),
									totalItems: z.number(),
									totalPages: z.number()
								})
							})
						}
					}
				},
				'403': {
					description: 'Forbidden - Insufficient permissions',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			}
		}
	},
	'/api/students/{mnumber}': {
		get: {
			tags: ['Students'],
			operationId: 'getStudentInfo',
			description: 'Get detailed information for a specific student',
			parameters: [
				{
					name: 'mnumber',
					in: 'path',
					required: true,
					schema: z.string(),
					description: 'Student M-number'
				}
			],
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								studentInfo: z.object({
									mnumber: z.string(),
									firstName: z.string(),
									middleName: z.string().nullable(),
									lastName: z.string(),
									suffix: z.string().nullable(),
									gender: z.string().nullable(),
									birthdate: z.string().nullable(),
									email: z.string().nullable(),
									cellPhone: z.string().nullable(),
									age: z.number().nullable(),
									race: z.string().nullable(),
									citizenship: z.string().nullable(),
									residency: z.string().nullable()
								}),
								academicInfo: z.object({
									msuGpa: z.number().nullable(),
									overallGpa: z.number().nullable(),
									msuAttemptedHours: z.number().nullable(),
									msuEarnedHours: z.number().nullable(),
									overallAttemptedHours: z.number().nullable(),
									overallEarnedHours: z.number().nullable(),
									academicStanding: z.string().nullable(),
									academicStandingDescription: z.string().nullable(),
									admitTerm: z.string().nullable(),
									admitTermDescription: z.string().nullable(),
									admitYear: z.number().nullable(),
									admitCode: z.string().nullable()
								}).nullable(),
								programs: z.object({
									majors: z.array(z.object({
										code: z.string(),
										description: z.string(),
										department: z.string(),
										college: z.string(),
										level: z.string(),
										term: z.string(),
										year: z.number()
									})),
									minors: z.array(z.object({
										code: z.string(),
										description: z.string(),
										department: z.string(),
										college: z.string(),
										level: z.string(),
										term: z.string(),
										year: z.number()
									}))
								}),
								advisors: z.array(z.object({
									mnumber: z.string(),
									term: z.string(),
									year: z.number()
								}))
							})
						}
					}
				},
				'403': {
					description: 'Forbidden - Insufficient permissions',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				},
				'404': {
					description: 'Not Found - Student not found',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			}
		}
	}
};

export default router;