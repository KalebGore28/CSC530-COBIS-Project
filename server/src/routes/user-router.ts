import express from 'express';
import { UserController } from '../controllers/user-controller';

/**
 * User routes
 * @module routes/user
 * @requires express
 * @requires ../controllers/user-controller
 * @description This module defines the routes for user operations.
 */
const router = express.Router();

// Get current user
router.get('/me', UserController.getCurrentUser);

// Update user's M-number
router.post('/update-mnumber', UserController.updateMnumber);

export default router; 