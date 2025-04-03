import express from 'express';
import { z } from 'zod';
import 'zod-openapi/extend';
import { InstructorController } from '../controllers/instructor-controller';

/**
 * Instructor routes
 * @module routes/instructor-router
 * @requires express
 * @requires zod
 * @requires zod-openapi/extend
 * @requires ../controllers/instructor-controller
 * @description This module defines the routes for instructor-related endpoints.
 * It includes routes for fetching basic instructor information, current teaching status,
 * teaching summary, course details, and term summaries.
 * The routes are protected by access control checks.
 * The OpenAPI specification for these routes is also defined in this module.
 */
const router = express.Router();

// Get instructors
router.get('/', 
	InstructorController.checkAccess,
	InstructorController.getInstructors
);

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

// Credit hours data
router.get('/:mnumber/credit-hours',
	InstructorController.checkAccess,
	InstructorController.getCreditHoursData
);

// Class Roster
router.get('/:mnumber/class-roster',
	InstructorController.checkAccess,
	InstructorController.getClassRoster
)


// OpenAPI Specification
export const instructorRouterSpec = {
	'/api/instructor': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructors',
			description: 'Get instructors - department chairs can only see instructors in their department',
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.array(z.object({
								mnumber: z.string(),
								name: z.string(),
								firstName: z.string(),
								lastName: z.string(),
								department: z.string(),
								departmentCode: z.string(),
								college: z.string(),
								collegeCode: z.string(),
								email: z.string().optional(),
								image: z.string().optional()
							}))
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
		},
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
	'/api/instructor/{mnumber}/credit-hours': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructorCreditHours',
			description: 'Get credit hours data for an instructor with optional term/year filtering',
			parameters: [
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
					name: 'startYear',
					in: 'query',
					required: false,
					schema: z.number().optional(),
					description: 'Start year for multi-year analysis'
				},
				{
					name: 'endYear',
					in: 'query',
					required: false,
					schema: z.number().optional(),
					description: 'End year for multi-year analysis'
				}
			],
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								overallStats: z.object({
									totalCoursesTaught: z.number(),
									totalCreditHoursGenerated: z.number(),
									averageCreditHoursPerTerm: z.number(),
									maxCreditHoursInTerm: z.number()
								}),
								termSummaries: z.array(z.object({
									term: z.string(),
									termCode: z.string(),
									year: z.number(),
									courseCount: z.number(),
									totalStudents: z.number(),
									totalCreditHours: z.number()
								})),
								courseDetails: z.array(z.object({
									term: z.string(),
									termCode: z.string(),
									year: z.number(),
									crn: z.number(),
									courseId: z.string(),
									courseTitle: z.string(),
									creditHours: z.number(),
									studentCount: z.number(),
									totalCreditHours: z.number()
								})),
								topCreditGeneratingCourses: z.array(z.object({
									course: z.string(),
									creditHours: z.number()
								}))
							})
						}
					}
				},
				'400': {
					description: 'Bad Request - Invalid parameters',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
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
	'/api/instructor/{mnumber}/class-roster': {
		get: {
			tags: ['Instructor'],
			operationId: 'getClassRoster',
			description: 'Get class roster for a specific course taught by an instructor',
			parameters: [
				{
					name: 'subject',
					in: 'query',
					required: true,
					schema: z.string(),
					description: 'Course subject code (e.g., CSC, MTH)'
				},
				{
					name: 'number',
					in: 'query',
					required: true,
					schema: z.string(),
					description: 'Course number (e.g., 101, 330)'
				},
				{
					name: 'suffix',
					in: 'query',
					required: false,
					schema: z.string().optional(),
					description: 'Course suffix (optional)'
				},
				{
					name: 'term',
					in: 'query',
					required: true,
					schema: z.string(),
					description: 'Term code (e.g., 10 for Spring, 80 for Fall)'
				},
				{
					name: 'year',
					in: 'query',
					required: true,
					schema: z.number(),
					description: 'Academic year'
				}
			],
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								course: z.object({
									courseId: z.string(),
									courseSubject: z.string(),
									courseNumber: z.string(),
									courseSuffix: z.string(),
									courseTitle: z.string(),
									termCode: z.string(),
									termName: z.string(),
									year: z.number(),
									creditHours: z.number(),
									fullTerm: z.string()
								}),
								roster: z.array(z.object({
									mnumber: z.string(),
									name: z.string(),
									firstName: z.string(),
									middleName: z.string(),
									lastName: z.string(),
									suffix: z.string(),
									email: z.string().optional(),
									major: z.string(),
									department: z.string(),
									college: z.string(),
									creditHours: z.number(),
									finalGrade: z.string(),
									midtermGrade: z.string(),
									registrationStatus: z.string(),
									lastAttendance: z.string().optional(),
									overallGpa: z.number(),
									earnedHours: z.number()
								})),
								stats: z.object({
									totalStudents: z.number(),
									totalGraded: z.number(),
									overallGpa: z.number(),
									gradeDistribution: z.record(z.string(), z.number())
								})
							})
						}
					}
				},
				'400': {
					description: 'Bad Request - Missing or invalid parameters',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
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
					description: 'Not Found - Instructor or class not found',
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