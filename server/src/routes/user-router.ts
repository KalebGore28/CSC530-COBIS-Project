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


// Enable/disable user routes
// @ts-ignore
router.use(hasRole('cobis_administrator')); // Only allow admin to access these routes
router.get('/', UserController.getAllUsers);
router.post('/:userId/enable', UserController.enableUser);
router.post('/:userId/disable', UserController.disableUser);
router.put('/:userId/provision', UserController.provisionUser);

export default router; 