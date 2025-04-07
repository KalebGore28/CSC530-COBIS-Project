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

// Academic summary (GPA, credits earned, etc.)
router.get('/:mnumber/academic-summary',
	// StudentController.checkAccess,
	// StudentController.getAcademicSummary
);

// Advisor information
router.get('/:mnumber/advisors',
	StudentController.checkAccess,
	StudentController.getStudentAdvisors
);

// Get student's GPA trend over terms
router.get('/:mnumber/gpa-trend',
	// StudentController.checkAccess,
	// StudentController.getGpaTrend
);

// Get academic performance metrics
router.get('/performance-metrics',
	// StudentController.checkAccess,
	// StudentController.getPerformanceMetrics
);

// Current enrollment status
router.get('/:mnumber/enrollment-status',
	StudentController.checkAccess,
	StudentController.getEnrollmentStatus
);

export default router;