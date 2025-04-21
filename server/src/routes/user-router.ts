import express from 'express';
import { UserController } from '../controllers/user-controller';
import { hasRole } from '../middleware/has-role';

/**
 * User routes
 * @module routes/user
 * @requires express
 * @requires ../controllers/user-controller
 * @description This module defines the routes for user operations.
 */
const router = express.Router();

// Get current user
router.get('/me', UserController.getUserInfo);

// Update user's M-number
router.post('/update-mnumber', UserController.updateMnumber);

// Enable/disable user routes
// @ts-ignore
router.use(hasRole('cobis_administrator')); // Only allow admin to access these routes
router.post('/enable/:userId', UserController.enableUser);
router.post('/disable/:userId', UserController.disableUser);

export default router; 