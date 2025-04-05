import { z } from 'zod';
import 'zod-openapi/extend';

const MnumberRequestParamsSchema = z.object({
	mnumber: z.string().openapi({
		description: 'Unique instructor identifier',
		example: 'M123456'
	})
});

// Endpoint-specific schemas
const InstructorBasicInfoSchema = z.object({
	mnumber: z.string().openapi({
		description: 'Unique instructor identifier',
		example: 'M123456'
	}),
	name: z.string().openapi({
		description: 'Full name of the instructor',
		example: 'John Doe'
	}),
	firstName: z.string().openapi({
		description: 'Instructor first name',
		example: 'John'
	}),
	lastName: z.string().openapi({
		description: 'Instructor last name',
		example: 'Doe'
	}),
	department: z.string().openapi({
		description: 'Full name of the department',
		example: 'Computer Science'
	}),
	college: z.string().openapi({
		description: 'Full name of the college',
		example: 'College of Engineering'
	}),
	email: z.string().email().optional().openapi({
		description: 'Instructor email address',
		example: 'john.doe@university.edu'
	}),
	image: z.string().url().optional().openapi({
		description: 'URL to instructor profile image',
		example: 'https://university.edu/images/john-doe.jpg'
	}),
});

// Example current status schema (assuming it might be different)
const CurrentStatusSchema = z.object({
	mnumber: z.string().openapi({
		description: 'Unique instructor identifier',
		example: 'M123456'
	}),
	currentStatus: z.object({
		currentTermCode: z.string().openapi({
			description: 'Current term and year',
			example: 'FALL 2023'
		}),
		currentYear: z.number().openapi({
			description: 'Current year',
			example: 2023
		}),
	})
});

export const instructorApiSpec = {
	'/api/instructor/{mnumber}': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructorBasicInfo',
			summary: 'Get basic instructor information',
			description: 'Retrieve basic information for a specific instructor by their mnumber. Access restricted to authorized users only.',
			requestParams: {
				path: MnumberRequestParamsSchema
			},
			responses: {
				'200': {
					description: 'Successful response with instructor information',
					content: {
						'application/json': {
							schema: InstructorBasicInfoSchema
						}
					}
				},
				'403': {
					description: 'Forbidden - Insufficient permissions to view instructor data',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({
									description: 'Error message',
									example: 'Forbidden - Insufficient permissions to view instructor data'
								})
							})
						}
					}
				},
				'404': {
					description: 'Instructor not found',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({
									description: 'Error message',
									example: 'Instructor not found'
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
			},
			security: [{
				bearerAuth: []
			}]
		}
	},
	'/api/instructor/{mnumber}/current-status': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructorCurrentStatus',
			summary: 'Get current teaching status',
			description: 'Retrieve the current teaching status and course load for a specific instructor by their mnumber. Access restricted to authorized users only.',
			requestParams: {
				path: MnumberRequestParamsSchema
			},
			responses: {
				'200': {
					description: 'Successful response with current status information',
					content: {
						'application/json': {
							schema: CurrentStatusSchema
						}
					}
				},
				'403': {
					description: 'Access denied. Insufficient permissions to view this instructor data.',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({
									description: 'Error message',
									example: 'Access denied. Insufficient permissions to view this instructor data.'
								})
							})
						}
					}
				},
				'404': {
					description: 'Instructor not found',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string().openapi({
									description: 'Error message',
									example: 'Instructor not found'
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
			},
			security: [{
				bearerAuth: []
			}]
		}
	}
};