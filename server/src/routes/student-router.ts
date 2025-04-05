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

// Get students
router.get('/',
	// GetStudents uniquely handle filtering out data the user shouldn't see.
	StudentController.getStudents
)

// Basic student information
router.get('/:mnumber',
	StudentController.checkAccess,
	StudentController.getStudent
)

// Current enrollment status
router.get('/:mnumber/enrollment-status',
	// StudentController.checkAccess,
	// StudentController.getEnrollmentStatus
);

// Academic summary (GPA, credits earned, etc.)
router.get('/:mnumber/academic-summary',
	// StudentController.checkAccess,
	// StudentController.getAcademicSummary
);

// Advisor information
router.get('/:mnumber/advisors',
	// StudentController.checkAccess,
	// StudentController.getAdvisors
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


export default router;