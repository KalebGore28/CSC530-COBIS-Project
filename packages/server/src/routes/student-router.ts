import express from 'express';
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

// Basic student information
router.get('/:mnumber',
	StudentController.checkAccess,
	StudentController.getStudent
)

// Get student programs (majors and minors)
router.get('/:mnumber/programs',
	StudentController.checkAccess,
	StudentController.getStudentPrograms
)

// Get student academic information
router.get('/:mnumber/academic-info',
	StudentController.checkAccess,
	StudentController.getStudentAcademicInfo
)

// Get student courses
router.get('/:mnumber/courses',
	StudentController.checkAccess,
	StudentController.getStudentCourses
)

// Advisor information
router.get('/:mnumber/advisors',
	StudentController.checkAccess,
	StudentController.getStudentAdvisors
);

// Current enrollment status
router.get('/:mnumber/enrollment-status',
	StudentController.checkAccess,
	StudentController.getEnrollmentStatus
);

export default router;