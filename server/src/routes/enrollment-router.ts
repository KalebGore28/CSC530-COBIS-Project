import express from 'express';
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
router.get('/programs/:programCode',
	EnrollmentController.checkEnrollmentAccess,
	EnrollmentController.getProgramStudents
);

// Program enrollment trends over time for a specific program
router.get('/programs/:programCode/trends',
	EnrollmentController.checkEnrollmentAccess,
	EnrollmentController.getProgramEnrollmentTrends
);

// Faculty-level enrollment data
router.get('/faculty',
	EnrollmentController.checkEnrollmentAccess,
	EnrollmentController.getFacultyEnrollment
);

// Individual faculty member enrollment data
router.get('/faculty/:mnumber',
	EnrollmentController.checkEnrollmentAccess,
	EnrollmentController.getFacultyMemberEnrollment
);

// Faculty member enrollment trends over time
router.get('/faculty/:mnumber/trends',
	EnrollmentController.checkEnrollmentAccess,
	EnrollmentController.getFacultyMemberEnrollmentTrends
);

export default router;