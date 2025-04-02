import express from 'express';
import { z } from 'zod';
import 'zod-openapi/extend';
import { InstructorController } from '../controllers/instructor-controller';

const router = express.Router();

// Basic instructor information
router.get('/:mnumber',
	InstructorController.checkAccess,
	InstructorController.getBasicInfo
);

// Current teaching status
router.get('/:mnumber/current-status',
	InstructorController.checkAccess,
	InstructorController.getCurrentStatus
);

// Teaching summary
router.get('/:mnumber/teaching-summary',
	InstructorController.checkAccess,
	InstructorController.getTeachingSummary
);

// Course details
router.get('/:mnumber/courses',
	InstructorController.checkAccess,
	InstructorController.getCourseDetails
);

// Term summaries
router.get('/:mnumber/terms',
	InstructorController.checkAccess,
	InstructorController.getTermSummaries
);

// OpenAPI Specification
export const instructorRouterSpec = {
	'/api/instructor/{mnumber}': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructorBasicInfo',
			description: 'Get basic instructor information',
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								mnumber: z.string(),
								name: z.string(),
								firstName: z.string(),
								lastName: z.string(),
								department: z.string(),
								college: z.string(),
								email: z.string().optional(),
								image: z.string().optional()
							})
						}
					}
				}
			}
		}
	},
	'/api/instructor/{mnumber}/current-status': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructorCurrentStatus',
			description: 'Get instructor current teaching status',
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								currentTerm: z.string(),
								currentTermCode: z.string(),
								currentYear: z.number(),
								isCurrentlyTeaching: z.boolean(),
								currentCourseCount: z.number()
							})
						}
					}
				}
			}
		}
	},
	'/api/instructor/{mnumber}/teaching-summary': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructorTeachingSummary',
			description: 'Get instructor teaching summary and metrics',
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								totalCoursesTaught: z.number(),
								uniqueCoursesTaught: z.number(),
								totalStudentsTaught: z.number(),
								totalCreditHoursDelivered: z.number(),
								averageClassSize: z.number(),
								mostTaughtCourses: z.array(z.object({
									courseId: z.string(),
									courseTitle: z.string().optional(),
									timesTaught: z.number()
								}))
							})
						}
					}
				}
			}
		}
	},
	'/api/instructor/{mnumber}/courses': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructorCourseDetails',
			description: 'Get detailed course history for an instructor',
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.array(z.object({
								term: z.string(),
								termCode: z.string(),
								year: z.number(),
								courseId: z.string(),
								courseTitle: z.string().optional(),
								courseSubject: z.string(),
								courseNumber: z.string(),
								courseSuffix: z.string().optional(),
								crn: z.number().optional(),
								creditHours: z.number().optional(),
								studentCount: z.number().optional(),
								totalCreditHours: z.number().optional()
							}))
						}
					}
				}
			}
		}
	},
	'/api/instructor/{mnumber}/terms': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructorTermSummaries',
			description: 'Get term-by-term teaching summaries for an instructor',
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.array(z.object({
								term: z.string(),
								termCode: z.string(),
								year: z.number(),
								courseCount: z.number(),
								studentCount: z.number(),
								creditHoursDelivered: z.number()
							}))
						}
					}
				}
			}
		}
	}
};

export default router;