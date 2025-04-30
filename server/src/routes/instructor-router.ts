import express from 'express';
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
	InstructorController.getInstructors
);

// Basic instructor information
router.get('/:mnumber',
	InstructorController.checkInstructorAccess,
	InstructorController.getBasicInfo
);

// Current teaching status
router.get('/:mnumber/current-status',
	InstructorController.checkInstructorAccess,
	InstructorController.getCurrentStatus
);

// Teaching summary
router.get('/:mnumber/teaching-summary',
	InstructorController.checkInstructorAccess,
	InstructorController.getTeachingSummary
);

// Term summaries
router.get('/:mnumber/terms',
	InstructorController.checkInstructorAccess,
	InstructorController.getTermSummaries
);

// Course details
router.get('/:mnumber/courses',
	InstructorController.checkInstructorAccess,
	InstructorController.getCourseDetails
);

// Class Roster
router.get('/:mnumber/class-roster',
	InstructorController.checkInstructorAccess,
	InstructorController.getClassRoster
);

// Grade distribution trends
router.get('/:mnumber/trend/grades',
	InstructorController.checkInstructorAccess,
	InstructorController.getGradeTrends
);

export default router;