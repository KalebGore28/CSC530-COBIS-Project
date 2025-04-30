import express from 'express';
import { AdvisorController } from '../controllers/advisor-controller';


/**
 * Advisor routes
 * @module routes/advisor
 * @requires express
 * @requires ../controllers/advisor-controller
 * @description This module defines the routes for advisor-related endpoints.
 * It includes a route for fetching students advised by the currently logged-in user.
 */
const router = express.Router();

// Get students advised by a specific advisor
router.get('/:mnumber',
	AdvisorController.checkAdvisorAccess,
	AdvisorController.getAdvisedStudents
);


export default router;
