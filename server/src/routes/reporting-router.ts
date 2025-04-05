import express from 'express';
import { ReportingController } from '../controllers/reporting-controller';
import { ReportingAPISpecs } from '../specs/reporting-specs';

/**
 * Reporting routes
 * @module routes/reporting
 * @requires express
 * @requires ../controllers/reporting-controller
 * @description This module defines the routes for reporting operations.
 */
const router = express.Router();

// Student course requirement endpoint
router.get('/student-course-requirement',
	ReportingController.checkAccess,
	ReportingController.getStudentCourseRequirement
);

export const reportingSpecs = ReportingAPISpecs;

export default router;