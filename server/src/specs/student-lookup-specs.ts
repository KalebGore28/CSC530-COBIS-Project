import { z } from 'zod';
import 'zod-openapi/extend';

// Query parameters for student lookup
const StudentLookupQuerySchema = z.object({
	academicLevels: z.string().optional().openapi({
		description: 'Comma-separated list of academic levels',
		example: 'Freshman,Sophomore'
	}),
	gpaMin: z.string().optional().openapi({
		description: 'Minimum GPA',
		example: '3.0'
	}),
	gpaMax: z.string().optional().openapi({
		description: 'Maximum GPA',
		example: '4.0'
	}),
	majors: z.string().optional().openapi({
		description: 'Comma-separated list of major program codes',
		example: 'CSBS,MATH'
	}),
	minors: z.string().optional().openapi({
		description: 'Comma-separated list of minor program codes',
		example: 'CSMI,MATHMI'
	}),
	coursesTaken: z.string().optional().openapi({
		description: 'Comma-separated list of courses students must have taken',
		example: 'CSC530,MAT250'
	}),
	coursesNotTaken: z.string().optional().openapi({
		description: 'Comma-separated list of courses students must not have taken',
		example: 'CSC591,MAT562'
	}),
	gradeFilters: z.string().optional().openapi({
		description: 'Comma-separated list of course:grade pairs',
		example: 'CSC530:A,MAT250:B'
	})
});

// Response schema for student lookup
const StudentLookupResponse = z.array(
	z.object({
		mnumber: z.string().openapi({
			description: 'Student identifier',
			example: 'M123456'
		}),
		firstName: z.string().openapi({
			description: 'Student first name',
			example: 'John'
		}),
		lastName: z.string().openapi({
			description: 'Student last name',
			example: 'Smith'
		}),
		email: z.string().email().openapi({
			description: 'Student email',
			example: 'john.smith@example.edu'
		})
	})
).openapi({
	description: 'List of students matching the criteria'
});

export const StudentLookupAPISpecs = {
	'/api/student-lookup': {
		get: {
			tags: ['Student Lookup'],
			operationId: 'lookupStudents',
			summary: 'Lookup students based on criteria',
			description: 'Find students based on various academic criteria including academic level, GPA, majors, minors, and course history.',
			requestParams: {
				query: StudentLookupQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with matching students',
					content: {
						'application/json': {
							schema: StudentLookupResponse
						}
					}
				},
				'500': {
					description: 'Internal server error',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({
									description: 'Error message',
									example: 'Internal server error'
								})
							})
						}
					}
				}
			}
		}
	}
};

export const StudentLookupSpecs = {
	StudentLookupQuerySchema,
	StudentLookupResponse
}; 