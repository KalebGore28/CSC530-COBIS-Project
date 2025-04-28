import express from 'express';
import { AdvisorController } from '../controllers/advisor-controller';
// Assuming you have a middleware for checking if the user is authenticated
// and attaching user info (like mnumber) to the request.
// Replace 'checkAuthentication' with your actual authentication middleware.

/**
 * Advisor routes
 * @module routes/advisor
 * @requires express
 * @requires ../controllers/advisor-controller
 * @requires ../middleware/auth-middleware - Assuming you have auth middleware
 * @description This module defines the routes for advisor-related endpoints.
 * It includes a route for fetching students advised by the currently logged-in user.
 */
const router = express.Router();

// Get students advised by the logged-in user
router.get('/students',
	AdvisorController.checkAdvisorAccess,
	AdvisorController.getAdvisedStudents
);


export default router;
