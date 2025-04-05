import express from 'express';
import { InstructorController } from '../controllers/instructor-controller';
import { checkInstructorAccess } from '../middleware/check-instructor-access';

/**
 * Instructor routes
 * @module routes/instructor-router
 * @requires express
 * @requires zod
 * @requires zod-openapi/extend
 * @requires ../controllers/instructor-controller
 * @requires ../middleware/check-instructor-access
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
	checkInstructorAccess,
	InstructorController.getBasicInfo
);

// Current teaching status
router.get('/:mnumber/current-status',
	checkInstructorAccess,
	InstructorController.getCurrentStatus
);

// Teaching summary
router.get('/:mnumber/teaching-summary',
	checkInstructorAccess,
	InstructorController.getTeachingSummary
);

// Course details
router.get('/:mnumber/courses',
	checkInstructorAccess,
	InstructorController.getCourseDetails
);

// Term summaries
router.get('/:mnumber/terms',
	checkInstructorAccess,
	InstructorController.getTermSummaries
);

// Class Roster
router.get('/:mnumber/class-roster',
	checkInstructorAccess,
	InstructorController.getClassRoster
);

export default router;