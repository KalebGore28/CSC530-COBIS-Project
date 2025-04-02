import express from 'express';
import { z } from 'zod';
import 'zod-openapi/extend';
import { EnrollmentController } from '../controllers/enrollment-controller';

/**
 * Enrollment routes
 * @module routes/enrollment
 * @requires express
 * @requires zod
 * @requires zod-openapi/extend
 * @requires ../controllers/enrollment-controller
 * @description This module defines the routes for enrollment-related endpoints.
 * It includes routes for fetching program-level enrollment data.
 * The routes are protected by access control checks.
 * The OpenAPI specification for these routes is also defined in this module.
 */
const router = express.Router();

// Program-level enrollment data
router.get('/programs',
	EnrollmentController.checkEnrollmentAccess,
	EnrollmentController.getProgramEnrollment
);

// Student-level details for a specific program
router.get('/programs/:programCode/students',
	EnrollmentController.checkEnrollmentAccess,
	EnrollmentController.getProgramStudents
);

// Define OpenAPI schema for the program enrollment response
const ProgramEnrollmentSchema = z.object({
	department: z.object({
		code: z.string().openapi({ description: 'Department code' }),
		description: z.string().openapi({ description: 'Department name' })
	}).openapi({ description: 'Department information' }),
	term: z.object({
		code: z.string().openapi({ description: 'Term code' }),
		description: z.string().openapi({ description: 'Term description' })
	}).optional().openapi({ description: 'Term information (if specified)' }),
	year: z.number().optional().openapi({ description: 'Academic year' }),
	programType: z.string().optional().openapi({ description: 'Program type filter (MAJOR/MINOR)' }),
	level: z.string().optional().openapi({ description: 'Program level filter (UG/GR/PB)' }),
	programs: z.array(
		z.object({
			code: z.string().openapi({ description: 'Program code' }),
			description: z.string().openapi({ description: 'Program description' }),
			isMajor: z.boolean().openapi({ description: 'Is this a major program' }),
			isMinor: z.boolean().openapi({ description: 'Is this a minor program' }),
			hasConcentration: z.boolean().openapi({ description: 'Does this program have concentrations' }),
			enrollmentCount: z.number().openapi({ description: 'Total enrollment count' }),
			distinctStudentCount: z.number().openapi({ description: 'Distinct student count' }),
			percentageOfDepartment: z.number().openapi({ description: 'Percentage of department enrollment' })
		}).openapi({ description: 'Program enrollment data' })
	).openapi({ description: 'List of programs with enrollment data' }),
	totals: z.object({
		totalEnrollment: z.number().openapi({ description: 'Total enrollment count across all programs' }),
		distinctStudentCount: z.number().openapi({ description: 'Total distinct student count' }),
		majorCount: z.number().openapi({ description: 'Total major enrollments' }),
		minorCount: z.number().openapi({ description: 'Total minor enrollments' }),
		levelCounts: z.record(z.string(), z.number()).openapi({
			description: 'Enrollment counts by level (UG/GR/PB)'
		})
	}).openapi({ description: 'Aggregated enrollment totals' })
}).openapi({
	description: 'Program enrollment data response'
});

// Define OpenAPI schema for the program students response
const ProgramStudentsSchema = z.object({
	program: z.object({
		code: z.string().openapi({ description: 'Program code' }),
		description: z.string().openapi({ description: 'Program description' }),
		isMajor: z.boolean().openapi({ description: 'Is this a major program' }),
		isMinor: z.boolean().openapi({ description: 'Is this a minor program' }),
		hasConcentration: z.boolean().openapi({ description: 'Does this program have concentrations' })
	}).openapi({ description: 'Program information' }),
	department: z.object({
		code: z.string().openapi({ description: 'Department code' }),
		description: z.string().openapi({ description: 'Department name' })
	}).openapi({ description: 'Department information' }),
	term: z.object({
		code: z.string().openapi({ description: 'Term code' }),
		description: z.string().openapi({ description: 'Term description' })
	}).optional().openapi({ description: 'Term information (if specified)' }),
	year: z.number().optional().openapi({ description: 'Academic year' }),
	level: z.string().optional().openapi({ description: 'Program level filter (UG/GR/PB)' }),
	pagination: z.object({
		page: z.number().openapi({ description: 'Current page number' }),
		limit: z.number().openapi({ description: 'Items per page' }),
		totalItems: z.number().openapi({ description: 'Total number of items' }),
		totalPages: z.number().openapi({ description: 'Total number of pages' })
	}).openapi({ description: 'Pagination information' }),
	students: z.array(
		z.object({
			mnumber: z.string().openapi({ description: 'Student M number' }),
			firstName: z.string().openapi({ description: 'Student first name' }),
			lastName: z.string().openapi({ description: 'Student last name' }),
			email: z.string().openapi({ description: 'Student email address' }),
			programType: z.string().openapi({ description: 'Program type (MAJOR/MINOR)' }),
			programLevel: z.string().openapi({ description: 'Program level (UG/GR/PB)' }),
			academicInfo: z.object({
				msu_gpa: z.number().nullable().openapi({ description: 'MSU GPA' }),
				overall_gpa: z.number().nullable().openapi({ description: 'Overall GPA' }),
				earned_hours: z.number().nullable().openapi({ description: 'Earned credit hours' }),
				academicStanding: z.string().nullable().openapi({ description: 'Academic standing' })
			}).openapi({ description: 'Academic information' })
		}).openapi({ description: 'Student information' })
	).openapi({ description: 'List of students enrolled in the program' })
}).openapi({
	description: 'Program students data response'
});

// Export the OpenAPI schema for documentation generation
export const enrollmentRouterSpec = {
	'/api/enrollment/programs': {
		get: {
			tags: ['Enrollment'],
			summary: 'Get program-level enrollment data',
			description: 'Returns enrollment data for programs in a department',
			parameters: [
				{
					name: 'department',
					in: 'query',
					description: 'Department code (required for administrators)',
					schema: { type: 'string' }
				},
				{
					name: 'term',
					in: 'query',
					description: 'Term code',
					schema: { type: 'string' }
				},
				{
					name: 'year',
					in: 'query',
					description: 'Academic year',
					schema: { type: 'integer' }
				},
				{
					name: 'programType',
					in: 'query',
					description: 'Program type (MAJOR or MINOR)',
					schema: { type: 'string', enum: ['MAJOR', 'MINOR'] }
				},
				{
					name: 'level',
					in: 'query',
					description: 'Program level (UG, GR, or PB)',
					schema: { type: 'string', enum: ['UG', 'GR', 'PB'] }
				}
			],
			responses: {
				200: {
					description: 'Program enrollment data',
					content: {
						'application/json': {
							schema: ProgramEnrollmentSchema
						}
					}
				},
				400: {
					description: 'Bad request',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				},
				403: {
					description: 'Forbidden',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				},
				500: {
					description: 'Internal server error',
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
	'/api/enrollment/programs/{programCode}/students': {
		get: {
			tags: ['Enrollment'],
			summary: 'Get student-level details for a specific program',
			description: 'Returns students enrolled in a specific program with pagination',
			parameters: [
				{
					name: 'programCode',
					in: 'path',
					required: true,
					description: 'Program code',
					schema: { type: 'string' }
				},
				{
					name: 'department',
					in: 'query',
					description: 'Department code (required for administrators)',
					schema: { type: 'string' }
				},
				{
					name: 'term',
					in: 'query',
					description: 'Term code',
					schema: { type: 'string' }
				},
				{
					name: 'year',
					in: 'query',
					description: 'Academic year',
					schema: { type: 'integer' }
				},
				{
					name: 'level',
					in: 'query',
					description: 'Program level (UG, GR, or PB)',
					schema: { type: 'string', enum: ['UG', 'GR', 'PB'] }
				},
				{
					name: 'page',
					in: 'query',
					description: 'Page number for pagination',
					schema: { type: 'integer', default: 1 }
				},
				{
					name: 'limit',
					in: 'query',
					description: 'Number of items per page',
					schema: { type: 'integer', default: 50 }
				}
			],
			responses: {
				200: {
					description: 'Program students data',
					content: {
						'application/json': {
							schema: ProgramStudentsSchema
						}
					}
				},
				400: {
					description: 'Bad request',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				},
				403: {
					description: 'Forbidden',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				},
				404: {
					description: 'Program not found',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				},
				500: {
					description: 'Internal server error',
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