import { z } from 'zod';
import 'zod-openapi/extend';

// Query parameters for student course requirement
const StudentCourseRequirementQuerySchema = z.object({
	programCode: z.string().openapi({
		description: 'The program code',
		example: 'CSBS'
	}),
	courseSubject: z.string().openapi({
		description: 'The course subject',
		example: 'CSC'
	}),
	courseNumber: z.string().openapi({
		description: 'The course number',
		example: '330'
	}),
	courseSuffix: z.string().optional().openapi({
		description: 'The course suffix',
		example: 'H'
	})
});

// Response schema for student course requirement
const StudentCourseRequirementResponse = z.object({
	numberOfStudents: z.number().openapi({
		description: 'Number of students who still need to take the course',
		example: 25
	}),
	students: z.array(
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
			})
		})
	).openapi({
		description: 'List of students who need to complete the course'
	})
});

export const ReportingAPISpecs = {
	'/api/reporting/student-course-requirement': {
		get: {
			tags: ['Reporting'],
			operationId: 'getStudentCourseRequirement',
			summary: 'Get students who need to complete a course',
			description: 'Retrieve a list of students in a specific program who have not yet completed a required course. Access restricted to department chairs and program coordinators.',
			requestParams: {
				query: StudentCourseRequirementQuerySchema
			},
			responses: {
				'200': {
					description: 'Successful response with student course requirement data',
					content: {
						'application/json': {
							schema: StudentCourseRequirementResponse
						}
					}
				},
				'400': {
					description: 'Missing required parameters',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({
									description: 'Error message',
									example: 'Missing required parameters: programCode, courseSubject, courseNumber'
								})
							})
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

export const ReportingSpecs = {
	StudentCourseRequirementQuerySchema,
	StudentCourseRequirementResponse
}; 